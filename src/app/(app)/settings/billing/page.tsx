import type { Metadata } from "next";
import Link from "next/link";
import { getEntitlement } from "@/lib/billing/entitlement";
import { PLANS, PLAN_FEATURES, TRIAL_DAYS } from "@/lib/billing/plans";
import {
  UpgradeButton,
  ManageBillingButton,
} from "@/components/billing/UpgradeButton";
import { CheckIcon, AlertIcon, LockIcon, DownloadIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Plan and payment — BookStreak" };

export const dynamic = "force-dynamic";

/** Formats a timestamp as a plain date — "12 March 2026", not an ISO string. */
function niceDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const [ent, params] = await Promise.all([getEntitlement(), searchParams]);

  const justPaid = params.checkout === "success";
  const renews = niceDate(ent.currentPeriodEnd);
  const trialEnds = niceDate(ent.trialEndsAt);
  const daysLeft = ent.trialDaysLeft ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-fg">
          Plan and payment
        </h1>
        <p className="mt-1 text-fg-muted">
          What you&apos;re on now, and how to change it.
        </p>
      </div>

      {/* Post-checkout confirmation. role="status" so it is announced; the
          webhook may still be in flight, so the wording doesn't over-promise. */}
      {justPaid && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-100"
        >
          <CheckIcon className="mt-0.5 h-6 w-6 shrink-0" />
          <div>
            <p className="font-semibold">Thank you — your payment went through.</p>
            <p className="mt-0.5 text-sm">
              Your access is being switched on now. If this page still shows the
              old plan in a minute, refresh it.
            </p>
          </div>
        </div>
      )}

      {/* ─── Current plan ─── */}
      <section
        aria-labelledby="current-plan"
        className="rounded-3xl border-2 border-hairline bg-surface p-5"
      >
        <h2 id="current-plan" className="text-lg font-bold text-fg">
          Your plan
        </h2>

        {/* Lifetime */}
        {ent.state === "lifetime" && (
          <>
            <p className="mt-2 text-2xl font-bold text-fg">Lifetime access</p>
            <p className="mt-1 text-fg-muted">
              Paid once. There is nothing to renew and nothing to cancel — thank
              you for supporting BookStreak.
            </p>
          </>
        )}

        {/* Active monthly */}
        {ent.state === "active" && (
          <>
            <p className="mt-2 text-2xl font-bold text-fg">
              Monthly — {PLANS.monthly.price} per month
            </p>
            {ent.cancelAtPeriodEnd ? (
              <p className="mt-1 text-fg-muted">
                Your plan is set to end
                {renews ? ` on ${renews}` : " at the end of this billing period"}.
                You&apos;ll keep full access until then, and you can restart any
                time.
              </p>
            ) : (
              <p className="mt-1 text-fg-muted">
                {renews
                  ? `Renews automatically on ${renews}.`
                  : "Renews automatically each month."}
              </p>
            )}
          </>
        )}

        {/* Trial, comfortable or ending */}
        {(ent.state === "trialing" || ent.state === "trial_ending") && (
          <>
            <p className="mt-2 text-2xl font-bold text-fg">
              Free trial — {daysLeft} {daysLeft === 1 ? "day" : "days"} left
            </p>
            <p className="mt-1 text-fg-muted">
              Everything is unlocked{trialEnds ? ` until ${trialEnds}` : ""}. You
              haven&apos;t been charged and no card is on file.
            </p>
          </>
        )}

        {/* Payment failed, inside grace */}
        {ent.state === "past_due" && (
          <>
            <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-fg">
              <AlertIcon className="h-6 w-6 shrink-0 text-rose-600 dark:text-rose-400" />
              Payment didn&apos;t go through
            </p>
            <p className="mt-1 text-fg-muted">
              This is usually an expired card. You have a short grace period, so
              updating your card now means nothing is interrupted.
            </p>
          </>
        )}

        {/* Expired */}
        {ent.state === "expired" && (
          <>
            <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-fg">
              <LockIcon className="h-6 w-6 shrink-0" />
              Your free trial has ended
            </p>
            <p className="mt-1 text-fg-muted">
              You can still read, browse, and download everything you&apos;ve
              logged. Choose a plan below to start logging new reading again.
            </p>
          </>
        )}

        {/* Actions. Anyone with a payment record can reach the portal; the rest
            get the plan choices. */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {ent.hasStripeCustomer && <ManageBillingButton />}
          <Link
            href="/settings"
            className="tap inline-flex items-center justify-center rounded-xl px-4 text-sm font-semibold text-fg-muted underline decoration-2 underline-offset-4 transition hover:text-fg"
          >
            Back to settings
          </Link>
        </div>

        {ent.hasStripeCustomer && (
          <p className="mt-3 text-sm text-fg-subtle">
            Update your card, download receipts, or cancel — cancelling takes two
            clicks and we never make you talk to anyone.
          </p>
        )}
      </section>

      {/* ─── Plan choices, only where they're useful ─── */}
      {ent.state !== "lifetime" && ent.state !== "active" && (
        <section
          aria-labelledby="choose-plan"
          className="rounded-3xl border-2 border-hairline bg-surface p-5"
        >
          <h2 id="choose-plan" className="text-lg font-bold text-fg">
            Choose a plan
          </h2>
          <p className="mt-1 text-sm text-fg-muted">
            One price, every feature. No tiers and nothing held back for a higher
            plan.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-accent p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-bold text-fg">{PLANS.lifetime.name}</h3>
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-accent-fg">
                  {PLANS.lifetime.badge}
                </span>
              </div>
              <p className="mt-2 flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold tracking-tight text-fg">
                  {PLANS.lifetime.price}
                </span>
                <span className="text-fg-subtle">{PLANS.lifetime.cadence}</span>
              </p>
              <p className="mt-1 text-sm text-fg-muted">
                {PLANS.lifetime.tagline}
              </p>
              <div className="mt-4">
                <UpgradeButton plan="lifetime">Get lifetime access</UpgradeButton>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-hairline p-4">
              <h3 className="font-bold text-fg">{PLANS.monthly.name}</h3>
              <p className="mt-2 flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold tracking-tight text-fg">
                  {PLANS.monthly.price}
                </span>
                <span className="text-fg-subtle">{PLANS.monthly.cadence}</span>
              </p>
              <p className="mt-1 text-sm text-fg-muted">
                {PLANS.monthly.tagline}
              </p>
              <div className="mt-4">
                <UpgradeButton plan="monthly" variant="secondary">
                  Subscribe monthly
                </UpgradeButton>
              </div>
            </div>
          </div>

          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {PLAN_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-fg-muted">
                <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                {f}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-sm text-fg-subtle">
            Every reader gets {TRIAL_DAYS} days free with no card up front.
          </p>
        </section>
      )}

      {/* ─── The promise that makes the paywall fair ─── */}
      <section
        aria-labelledby="your-data"
        className="rounded-3xl border-2 border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-500/40 dark:bg-emerald-500/10"
      >
        <h2
          id="your-data"
          className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-100"
        >
          <DownloadIcon className="h-5 w-5 shrink-0" />
          Your data is yours, whatever you choose
        </h2>
        <p className="mt-2 text-sm text-emerald-900 dark:text-emerald-100">
          Whether you pay or not, everything you&apos;ve logged stays readable and
          downloadable — for free, forever. Paying unlocks logging new reading, not
          access to what you&apos;ve already written.
        </p>
        <Link
          href="/settings#export"
          className="tap mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 underline decoration-2 underline-offset-4 dark:text-emerald-100"
        >
          Download my reading history
        </Link>
      </section>
    </div>
  );
}
