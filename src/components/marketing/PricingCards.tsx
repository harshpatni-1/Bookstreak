import Link from "next/link";

const FEATURES = [
  "Unlimited books on your shelf",
  "Automatic streaks + freeze days",
  "Yearly reading goals",
  "One-tap reading log",
  "Full stats & 17-week heatmap",
  "Shareable streak card",
  "Dark mode & installable PWA",
  "Goodreads / CSV import",
  "Privacy-first — no ads, no tracking",
];

/**
 * Two-tier pricing cards: Monthly ($2/mo) and Lifetime ($17 once).
 * Lifetime is visually highlighted as best value. Used on both the
 * landing page and the dedicated /pricing page.
 */
export function PricingCards({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`mx-auto grid gap-6 ${
        compact ? "max-w-2xl sm:grid-cols-2" : "max-w-3xl sm:grid-cols-2"
      }`}
    >
      {/* Monthly */}
      <div className="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Monthly
        </p>
        <div className="mt-4 flex items-end gap-1">
          <span className="text-5xl font-extrabold text-slate-900 dark:text-white">
            $2
          </span>
          <span className="mb-1 text-slate-500 dark:text-slate-400">
            / month
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Cancel anytime. No commitments.
        </p>

        <ul
          className="mt-6 flex-1 space-y-2.5"
          aria-label="Features included in the monthly plan"
        >
          {FEATURES.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200"
            >
              <span
                className="mt-0.5 text-brand-600 dark:text-brand-400"
                aria-hidden="true"
              >
                ✓
              </span>
              {f}
            </li>
          ))}
        </ul>

        <Link
          href="/signup"
          className="mt-7 block rounded-xl border-2 border-brand-600 bg-transparent px-7 py-3 text-center text-base font-semibold text-brand-600 transition hover:bg-brand-50 dark:border-brand-400 dark:text-brand-400 dark:hover:bg-brand-900/20"
          aria-label="Start your streak with the monthly plan at $2 per month"
        >
          Start your streak
        </Link>
      </div>

      {/* Lifetime — highlighted */}
      <div className="pricing-highlight relative flex flex-col rounded-2xl bg-white p-7 shadow-xl dark:bg-slate-900">
        {/* Best value badge */}
        <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-brand-600/30">
          ⭐ Best value
        </span>

        <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
          Lifetime
        </p>
        <div className="mt-4 flex items-end gap-1">
          <span className="text-5xl font-extrabold text-slate-900 dark:text-white">
            $17
          </span>
          <span className="mb-1 text-slate-500 dark:text-slate-400">
            / once
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          One payment. Yours forever. Save 70%+
        </p>

        <ul
          className="mt-6 flex-1 space-y-2.5"
          aria-label="Features included in the lifetime plan"
        >
          {FEATURES.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200"
            >
              <span
                className="mt-0.5 text-brand-600 dark:text-brand-400"
                aria-hidden="true"
              >
                ✓
              </span>
              {f}
            </li>
          ))}
        </ul>

        <Link
          href="/signup"
          className="mt-7 block rounded-xl bg-brand-600 px-7 py-3 text-center text-base font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
          aria-label="Get lifetime access for a one-time payment of $17"
        >
          Get lifetime access
        </Link>
      </div>
    </div>
  );
}
