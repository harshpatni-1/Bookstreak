import Link from "next/link";
import Image from "next/image";

export function MarketingFooter() {
  return (
    <footer
      className="border-t border-slate-200/80 bg-white/50 backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-950/80"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-5">
        <div className="md:col-span-2">
          <Link href="/" className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            <Image
              src="/icon.svg"
              alt="BookStreak Logo"
              width={24}
              height={24}
              className="h-6 w-6 rounded-md shrink-0"
            />
            <span>BookStreak</span>
          </Link>
          <p className="mt-3.5 max-w-sm text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            A privacy-first reading habit tracker. Log progress in one tap, build daily reading streaks, and finish more books without social noise or tracking.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            Honest reading streaks · No ads · No AI tracking
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Product
          </h3>
          <ul className="mt-3.5 space-y-2.5 text-sm font-medium text-slate-600 dark:text-slate-300">
            <li>
              <Link
                href="/features"
                className="transition hover:text-brand-600 dark:hover:text-brand-400"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href="/pricing"
                className="transition hover:text-brand-600 dark:hover:text-brand-400"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="transition hover:text-brand-600 dark:hover:text-brand-400"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="transition hover:text-brand-600 dark:hover:text-brand-400"
              >
                Contact & Support
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Account
          </h3>
          <ul className="mt-3.5 space-y-2.5 text-sm font-medium text-slate-600 dark:text-slate-300">
            <li>
              <Link
                href="/signup"
                className="transition hover:text-brand-600 dark:hover:text-brand-400"
              >
                Create account
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="transition hover:text-brand-600 dark:hover:text-brand-400"
              >
                Log in
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard"
                className="transition hover:text-brand-600 dark:hover:text-brand-400"
              >
                Dashboard
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Privacy & Trust
          </h3>
          <ul className="mt-3.5 space-y-2.5 text-sm font-medium text-slate-600 dark:text-slate-300">
            <li>
              <Link
                href="/privacy"
                className="transition hover:text-brand-600 dark:hover:text-brand-400"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="transition hover:text-brand-600 dark:hover:text-brand-400"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                href="/import"
                className="transition hover:text-brand-600 dark:hover:text-brand-400"
              >
                Goodreads Import
              </Link>
            </li>
            <li>
              <Link
                href="/settings"
                className="transition hover:text-brand-600 dark:hover:text-brand-400"
              >
                Data Ownership & Export
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200/60 py-6 text-center text-xs font-medium text-slate-500 dark:border-slate-800/60 dark:text-slate-400">
        © {new Date().getFullYear()} BookStreak. Read every day. All rights reserved.
      </div>
    </footer>
  );
}

