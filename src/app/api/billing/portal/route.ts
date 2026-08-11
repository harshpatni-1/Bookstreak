import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { stripe, siteUrl } from "@/lib/billing/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sends the reader to Stripe's hosted Billing Portal, where they can update a
 * card, download invoices, or cancel. Cancelling is deliberately one click away
 * and never routed through a retention gauntlet.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    const admin = createServiceClient();
    const { data: sub } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!sub?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account yet — nothing to manage." },
        { status: 404 }
      );
    }

    const portal = await stripe().billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${siteUrl()}/settings/billing`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (e) {
    console.error("[billing] portal failed:", e);
    return NextResponse.json(
      { error: "Could not open the billing portal. Please try again." },
      { status: 500 }
    );
  }
}
