import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getEntitlement } from "@/lib/billing/entitlement";
import { PLANS, PLAN_FEATURES, TRIAL_DAYS } from "@/lib/billing/plans";
import { UpgradeButton } from "@/components/billing/UpgradeButton";
import { CheckIcon, DownloadIcon, LockIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Upgrade — BookStreak",
  description:
    "Keep your reading streak going. $2/month, or $17 once for lifetime access.",
};

export const dynamic = "force-dynamic";

export default async function UpgradePage() {
  const ent = await getEntitlement();

  // Already paid up — nothing to sell here.
  if (ent.state === "active" || ent.state === "lifetime") {
    redirect("/settings/billing");
  }

  const expired = ent.state === "expired";
  const daysLeft = ent.trialDaysLeft ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <div className="text-center">
        {expired ? (
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-rose-300 bg-rose-50 px-4 py-1.5 text-sm font-semibold text-rose-800 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-200">
            <LockIcon className="h-4 w-4" />
            Trial ended
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border-2 border-hairline bg-surface-2 px-4 py-1.5 text-sm font-semibold text-fg-muted">
            {daysLeft} {daysLeft === 1 ? "day" : "days"} left in your trial
          </span>
        )}

        <h1 className="mt-5 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
          Keep your streak going
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-fg-muted">
          One price, every feature. No tiers, no add-ons, and nothing held back
          for a higher plan.
        </p>
      </div>

      {/* Reassurance sits ABOVE the prices. A reader deciding whether to pay
          should know their data isn't leverage before they see a number. */}
      <div className="mt-8 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-500/40 dark:bg-emerald-500/10">
        <p className="flex items-start gap-3 text-sm text-emerald-900 dark:text-emerald-100">
          <DownloadIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <span>
            <strong>Your data is yours, whatever you choose.</strong> Reading
            history stays readable and exportable for free — forever. Paying
            unlocks logging new sessions, not access to what you&apos;ve already
            written.
          </span>
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {/* Lifetime */}
        <section
          aria-labelledby="plan-lifetime"
          className="relative flex flex-col rounded-3xl border-2 border-accent bg-surface p-6 shadow-lg"
        >
          <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-fg">
            {PLANS.lifetime.badge}
          </span>
          <h2 id="plan-lifetime" className="text-lg font-bold text-fg">
            {PLANS.lifetime.name}
          </h2>
          <p className="mt-3 flex items-baseline gap-1.5">
            <span className="text-5xl font-extrabold tracking-tight text-fg">
              {PLANS.lifetime.price}
            </span>
            <span className="text-fg-subtle">{PLANS.lifetime.cadence}</span>
          </p>
          <p className="mt-2 text-sm text-fg-muted">{PLANS.lifetime.tagline}</p>
          <p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Cheaper than 9 months of the subscription.
          </p>
          <div className="mt-6">
            <UpgradeButton plan="lifetime">Get lifetime access</UpgradeButton>
          </div>
        </section>

        {/* Monthly */}
        <section
          aria-labelledby="plan-monthly"
          className="flex flex-col rounded-3xl border-2 border-hairline bg-surface p-6"
        >
          <h2 id="plan-monthly" className="text-lg font-bold text-fg">
            {PLANS.monthly.name}
          </h2>
          <p className="mt-3 flex items-baseline gap-1.5">
            <span className="text-5xl font-extrabold tracking-tight text-fg">
              {PLANS.monthly.price}
            </span>
            <span className="text-fg-subtle">{PLANS.monthly.cadence}</span>
          </p>
          <p className="mt-2 text-sm text-fg-muted">{PLANS.monthly.tagline}</p>
          <p className="mt-1 text-sm text-fg-subtle">
            Cancel in two clicks from Settings.
          </p>
          <div className="mt-6">
            <UpgradeButton plan="monthly" variant="secondary">
              Subscribe monthly
            </UpgradeButton>
          </div>
        </section>
      </div>

      <section aria-labelledby="included" className="mt-10">
        <h2 id="included" className="text-center text-lg font-bold text-fg">
          Included in both plans
        </h2>
        <ul className="mx-auto mt-5 grid max-w-2xl gap-3 sm:grid-cols-2">
          {PLAN_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-fg-muted">
              <CheckIcon className="mt-1 h-5 w-5 shrink-0 text-accent" />
              {f}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 space-y-4 text-center text-sm text-fg-subtle">
        <p>
          Payments are handled by Stripe. BookStreak never sees or stores your
          card details.
        </p>
        <p>
          Every reader gets {TRIAL_DAYS} days free, with no card required up
          front.
        </p>
        <p>
          <Link
            href="/faq"
            className="font-semibold text-accent underline decoration-2 underline-offset-2"
          >
            Questions? Read the FAQ
          </Link>
        </p>
      </div>
    </div>
  );
}
