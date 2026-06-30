import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer
      className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
      role="contentinfo"
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 text-lg font-bold">
            <span aria-hidden="true">📖</span> BookStreak
          </div>
          <p className="mt-3 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            A privacy-first reading-habit tracker. Build daily streaks, log
            progress in one tap, and finish more books. No AI, no tracking.
          </p>
          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
            Honest reading streaks. The number is always real.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Product
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li>
              <Link
                href="/features"
                className="transition hover:text-brand-600 dark:hover:text-brand-300"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href="/pricing"
                className="transition hover:text-brand-600 dark:hover:text-brand-300"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="transition hover:text-brand-600 dark:hover:text-brand-300"
              >
                FAQ
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Get started
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li>
              <Link
                href="/signup"
                className="transition hover:text-brand-600 dark:hover:text-brand-300"
              >
                Create account
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="transition hover:text-brand-600 dark:hover:text-brand-300"
              >
                Log in
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
        © {new Date().getFullYear()} BookStreak. Read every day. Built with ❤️
      </div>
    </footer>
  );
}
