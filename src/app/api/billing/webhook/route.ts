import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/billing/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook — the ONLY thing in the system that grants paid entitlement.
 *
 * Three properties matter here:
 *  1. Authenticity: every payload is signature-verified against the endpoint
 *     secret before a single field is read.
 *  2. Idempotency: Stripe retries and can deliver out of order, so processed
 *     event ids are recorded and replays are dropped.
 *  3. Least privilege: writes go through the service-role client because the
 *     subscriptions table has no client-writable RLS policy at all.
 */

const RELEVANT = new Set<string>([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
  "invoice.paid",
]);

/**
 * `current_period_end` sits on the Subscription in older API versions and on the
 * subscription *item* from 2025-03-31 onward. Read whichever is present so this
 * keeps working across an API version bump.
 */
function periodEnd(sub: Stripe.Subscription): string | null {
  const top = (sub as unknown as { current_period_end?: number }).current_period_end;
  const item = sub.items?.data?.[0] as unknown as
    | { current_period_end?: number }
    | undefined;
  const ts = top ?? item?.current_period_end;
  return typeof ts === "number" ? new Date(ts * 1000).toISOString() : null;
}

function mapStatus(s: Stripe.Subscription.Status) {
  switch (s) {
    case "active":
    case "trialing":
      return "active" as const;
    case "past_due":
    case "unpaid":
      return "past_due" as const;
    case "canceled":
    case "incomplete_expired":
    case "paused":
      return "canceled" as const;
    default:
      return "expired" as const;
  }
}

type Admin = ReturnType<typeof createServiceClient>;

/** Resolves our user id from event metadata, falling back to the customer id. */
async function resolveUserId(
  admin: Admin,
  metaUserId: string | null | undefined,
  customerId: string | null | undefined
): Promise<string | null> {
  if (metaUserId) return metaUserId;
  if (!customerId) return null;
  const { data } = await admin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.user_id ?? null;
}

function customerIdOf(v: string | { id: string } | null | undefined): string | null {
  if (!v) return null;
  return typeof v === "string" ? v : v.id;
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[billing] STRIPE_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  // Raw body is required for signature verification — do not parse as JSON first.
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(raw, signature, secret);
  } catch (e) {
    console.error("[billing] signature verification failed:", (e as Error).message);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (!RELEVANT.has(event.type)) {
    return NextResponse.json({ received: true, skipped: event.type });
  }

  const admin = createServiceClient();

  // Idempotency: claim the event id first. A duplicate delivery collides on the
  // primary key and exits without touching entitlement.
  const { error: claimError } = await admin
    .from("billing_events")
    .insert({ id: event.id, type: event.type });
  if (claimError) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = await resolveUserId(
          admin,
          s.metadata?.user_id ?? s.client_reference_id,
          customerIdOf(s.customer)
        );
        if (!userId) break;

        const customerId = customerIdOf(s.customer);

        if (s.mode === "payment") {
          // Lifetime: a single payment with no expiry. Only grant it once the
          // payment actually cleared.
          if (s.payment_status !== "paid") break;
          await admin
            .from("subscriptions")
            .update({
              plan: "lifetime",
              status: "active",
              current_period_end: null,
              cancel_at_period_end: false,
              stripe_customer_id: customerId,
            })
            .eq("user_id", userId);
        } else {
          // Subscription: record the ids now; the subscription.* events carry
          // the authoritative status and period end.
          await admin
            .from("subscriptions")
            .update({
              plan: "monthly",
              stripe_customer_id: customerId,
              stripe_subscription_id:
                typeof s.subscription === "string"
                  ? s.subscription
                  : s.subscription?.id ?? null,
            })
            .eq("user_id", userId);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(
          admin,
          sub.metadata?.user_id,
          customerIdOf(sub.customer)
        );
        if (!userId) break;

        // Never let a subscription event downgrade someone who bought lifetime.
        const { data: existing } = await admin
          .from("subscriptions")
          .select("plan")
          .eq("user_id", userId)
          .maybeSingle();
        if (existing?.plan === "lifetime") break;

        const status =
          event.type === "customer.subscription.deleted"
            ? ("canceled" as const)
            : mapStatus(sub.status);

        await admin
          .from("subscriptions")
          .update({
            plan: "monthly",
            status,
            current_period_end: periodEnd(sub),
            cancel_at_period_end: sub.cancel_at_period_end ?? false,
            stripe_subscription_id: sub.id,
            stripe_customer_id: customerIdOf(sub.customer),
          })
          .eq("user_id", userId);
        break;
      }

      case "invoice.paid":
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const userId = await resolveUserId(
          admin,
          inv.metadata?.user_id,
          customerIdOf(inv.customer)
        );
        if (!userId) break;

        const { data: existing } = await admin
          .from("subscriptions")
          .select("plan")
          .eq("user_id", userId)
          .maybeSingle();
        if (existing?.plan === "lifetime") break;

        await admin
          .from("subscriptions")
          .update({
            status: event.type === "invoice.paid" ? "active" : "past_due",
          })
          .eq("user_id", userId);
        break;
      }
    }
  } catch (e) {
    console.error(`[billing] handler failed for ${event.type}:`, e);
    // Release the idempotency claim so Stripe's retry can have another go.
    await admin.from("billing_events").delete().eq("id", event.id);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
