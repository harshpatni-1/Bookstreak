import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { stripe, siteUrl } from "@/lib/billing/stripe";
import { PLANS, stripePriceId, type PlanId } from "@/lib/billing/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Creates a Stripe Checkout Session for the signed-in reader.
 *
 * The plan is chosen server-side from a fixed catalogue and the price comes from
 * the environment — the client only sends an opaque plan id, so it can never
 * name its own price or amount.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let planId: PlanId;
  try {
    const body = (await req.json()) as { plan?: string };
    if (body.plan !== "monthly" && body.plan !== "lifetime") {
      return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
    }
    planId = body.plan;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const plan = PLANS[planId];

  try {
    const admin = createServiceClient();
    const { data: sub } = await admin
      .from("subscriptions")
      .select("stripe_customer_id, plan, status")
      .eq("user_id", user.id)
      .maybeSingle();

    // Lifetime is a terminal state — don't let someone buy it twice.
    if (sub?.plan === "lifetime" && sub.status === "active") {
      return NextResponse.json(
        { error: "You already have lifetime access." },
        { status: 409 }
      );
    }

    // Reuse the customer so a reader's payments stay on one Stripe record.
    let customerId = sub?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await stripe().customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      await admin
        .from("subscriptions")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);
    }

    const session = await stripe().checkout.sessions.create({
      mode: plan.mode,
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: stripePriceId(planId), quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${siteUrl()}/settings/billing?checkout=success`,
      cancel_url: `${siteUrl()}/upgrade?checkout=cancelled`,
      metadata: { user_id: user.id, plan: planId },
      ...(plan.mode === "subscription"
        ? { subscription_data: { metadata: { user_id: user.id, plan: planId } } }
        : { payment_intent_data: { metadata: { user_id: user.id, plan: planId } } }),
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 502 }
      );
    }
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[billing] checkout failed:", e);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
