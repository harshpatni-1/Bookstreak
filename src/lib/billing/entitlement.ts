import "server-only";
import { createClient } from "@/lib/supabase/server";
import { TRIAL_DAYS } from "./plans";

export type BillingPlan = "trial" | "monthly" | "lifetime";
export type BillingStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export type Entitlement = {
  /** May this reader log new sessions and add books? Mirrors SQL has_pro(). */
  isPro: boolean;
  plan: BillingPlan;
  status: BillingStatus;
  /** Whole days left in the trial; null once the reader is not trialing. */
  trialDaysLeft: number | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasStripeCustomer: boolean;
  /** One label the UI can switch on without re-deriving the rules. */
  state:
    | "trialing" // inside the free window
    | "trial_ending" // trialing, 3 days or fewer left
    | "active" // paying subscriber in good standing
    | "lifetime" // paid once, done
    | "past_due" // payment failed, inside grace
    | "expired"; // no entitlement — writes are blocked
};

const DAY_MS = 86_400_000;

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / DAY_MS));
}

/**
 * Reads the caller's billing row and derives their entitlement.
 *
 * This is for RENDERING ONLY. It is deliberately not the enforcement point —
 * the database enforces entitlement via RLS (see 0003_billing.sql), so a
 * tampered client cannot write by lying to this function. Server Actions call
 * `assertCanWrite` for a friendly error; RLS is the actual wall behind it.
 */
export async function getEntitlement(): Promise<Entitlement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fallback: Entitlement = {
    isPro: false,
    plan: "trial",
    status: "expired",
    trialDaysLeft: null,
    trialEndsAt: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    hasStripeCustomer: false,
    state: "expired",
  };
  if (!user) return fallback;

  const { data } = await supabase
    .from("subscriptions")
    .select(
      "plan, status, trial_ends_at, current_period_end, cancel_at_period_end, stripe_customer_id"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  // No row means the signup trigger never ran (e.g. a user created before this
  // migration and missed by the backfill). Treat as expired rather than as
  // unlimited — failing closed is the safe direction for a paywall.
  if (!data) return fallback;

  const plan = data.plan as BillingPlan;
  const status = data.status as BillingStatus;
  const trialEndsAt: string | null = data.trial_ends_at;
  const currentPeriodEnd: string | null = data.current_period_end;
  const now = Date.now();

  const trialLive =
    status === "trialing" && !!trialEndsAt && new Date(trialEndsAt).getTime() > now;
  const lifetimeLive = plan === "lifetime" && status === "active";
  const subLive =
    status === "active" &&
    (!currentPeriodEnd || new Date(currentPeriodEnd).getTime() > now);
  const graceLive =
    status === "past_due" &&
    !!currentPeriodEnd &&
    new Date(currentPeriodEnd).getTime() > now - 3 * DAY_MS;

  const isPro = trialLive || lifetimeLive || subLive || graceLive;
  const trialDaysLeft = trialLive ? daysUntil(trialEndsAt) : null;

  let state: Entitlement["state"] = "expired";
  if (lifetimeLive) state = "lifetime";
  else if (subLive) state = "active";
  else if (graceLive) state = "past_due";
  else if (trialLive) state = (trialDaysLeft ?? 0) <= 3 ? "trial_ending" : "trialing";

  return {
    isPro,
    plan,
    status,
    trialDaysLeft,
    trialEndsAt,
    currentPeriodEnd,
    cancelAtPeriodEnd: !!data.cancel_at_period_end,
    hasStripeCustomer: !!data.stripe_customer_id,
    state,
  };
}

/** Thrown-free guard for Server Actions. Returns an error string, or null if allowed. */
export async function assertCanWrite(): Promise<string | null> {
  const ent = await getEntitlement();
  if (ent.isPro) return null;
  // Plain language, no jargon, and it says what is still possible rather than
  // only what is blocked. TRIAL_DAYS is referenced so the number can't drift
  // from the one advertised on the pricing page.
  return `Your ${TRIAL_DAYS}-day free trial has ended. Choose a plan to keep tracking your reading — everything you've already logged stays yours to read and download.`;
}
