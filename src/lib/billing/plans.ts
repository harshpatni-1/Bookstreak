/**
 * Plan catalogue — shared by the marketing pages, the upgrade screen, and the
 * checkout route. Prices live here so the number on the pricing page and the
 * number Stripe charges can never drift apart in the copy.
 *
 * The actual amounts charged come from the Stripe Price IDs below; these
 * display values must be kept in step with them in the Stripe dashboard.
 */

export const TRIAL_DAYS = 14;

export type PlanId = "monthly" | "lifetime";

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  cadence: string;
  /** Stripe Checkout mode this plan needs. */
  mode: "subscription" | "payment";
  tagline: string;
  badge?: string;
};

export const PLANS: Record<PlanId, Plan> = {
  monthly: {
    id: "monthly",
    name: "Monthly",
    price: "$2",
    cadence: "per month",
    mode: "subscription",
    tagline: "Cancel anytime, in two clicks.",
  },
  lifetime: {
    id: "lifetime",
    name: "Lifetime",
    price: "$17",
    cadence: "one time",
    mode: "payment",
    tagline: "Pay once. Yours forever.",
    badge: "Best value",
  },
};

/** Everything both plans include — there is no feature-gated tier. */
export const PLAN_FEATURES = [
  "Unlimited books on your shelf",
  "Automatic streaks and freeze days",
  "One-tap reading log",
  "Full stats and reading heatmap",
  "Goodreads and CSV import",
  "Shareable streak cards",
  "Dark mode, large text, and high contrast",
  "Export your data anytime — free, forever",
];

/** Maps a plan to its Stripe Price ID from the environment. */
export function stripePriceId(plan: PlanId): string {
  const id =
    plan === "monthly"
      ? process.env.STRIPE_PRICE_MONTHLY
      : process.env.STRIPE_PRICE_LIFETIME;
  if (!id) {
    throw new Error(
      `Missing Stripe price ID for the "${plan}" plan. Set ${
        plan === "monthly" ? "STRIPE_PRICE_MONTHLY" : "STRIPE_PRICE_LIFETIME"
      } in your environment.`
    );
  }
  return id;
}
