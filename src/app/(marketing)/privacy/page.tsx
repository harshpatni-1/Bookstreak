import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — BookStreak",
  description: "Our privacy-first commitment: no ad networks, no third-party tracking, no AI data scraping.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <header className="border-b border-slate-200 pb-8 text-center dark:border-slate-800">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
          🔒 Privacy-First Guarantee
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Last updated: August 11, 2026 · Plain English, zero lawyer jargon.
        </p>
      </header>

      <div className="prose prose-slate mt-12 space-y-10 dark:prose-invert">
        <section className="rounded-2xl border border-brand-200/60 bg-brand-50/50 p-6 dark:border-brand-900/40 dark:bg-brand-950/20">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            The Short Version
          </h2>
          <p className="mt-2 text-base text-slate-700 dark:text-slate-200">
            BookStreak is a private reading habit tracker. We do not show ads, we do not sell your personal data to data brokers, we do not train AI models on your reading lists, and we enforce database Row Level Security so only you can access your books and logs.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            1. Information We Collect & Why
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            We only collect the absolute minimum information required to run the service:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-slate-600 dark:text-slate-300">
            <li>
              <strong className="text-slate-900 dark:text-white">Account Information:</strong> Your email address and encrypted password hash (managed via Supabase Auth) to allow you to log in securely.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-white">Reading Data:</strong> The books on your shelf, reading logs (pages, minutes, timestamps), and streak preferences so your reading progress synced across your devices.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-white">Payment Information:</strong> Processed securely via Stripe. We never see or store your full credit card numbers or banking credentials.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            2. What We Never Do With Your Data
          </h2>
          <ul className="list-disc space-y-2 pl-6 text-slate-600 dark:text-slate-300">
            <li>
              <strong className="text-slate-900 dark:text-white">No Selling or Renting:</strong> We will never sell, rent, or trade your email address or library data to marketers or data brokers.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-white">No Ad Tracking Pixels:</strong> We do not load Facebook Pixels, Google Ads trackers, or retargeting scripts.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-white">No AI Model Training:</strong> Your reading logs, notes, and titles are never fed into Large Language Models (LLMs) or public AI datasets.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            3. Data Security & Storage
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Your data is stored in PostgreSQL hosted on Supabase infrastructure protected by strict PostgreSQL Row Level Security (RLS) policies. RLS ensures at the database level that your user ID can only query and mutate your own reading records.
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            All data transmitted between your browser and our servers is encrypted in transit using industry-standard TLS 1.3 encryption.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            4. Data Ownership & Export Right
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            You own your reading history. You can export your full library, reading logs, and streak history at any time as a CSV file directly from your{" "}
            <Link href="/settings" className="font-semibold text-brand-600 underline hover:text-brand-700 dark:text-brand-400">
              Account Settings
            </Link>.
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            If you choose to delete your account, all your books, reading sessions, and profile records are permanently removed from our active database.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            5. Cookies & Local Storage
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            We use strictly necessary authentication cookies to keep you signed in, and browser <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm dark:bg-slate-800">localStorage</code> to remember your display preferences (dark mode, text sizing, high-contrast mode) before page paint.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            6. Contact Us
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            If you have any questions about this Privacy Policy or your data, please reach out to us at{" "}
            <a href="mailto:support@bookstreak.com" className="font-semibold text-brand-600 underline hover:text-brand-700 dark:text-brand-400">
              support@bookstreak.com
            </a>.
          </p>
        </section>
      </div>

      <footer className="mt-16 rounded-3xl bg-slate-100 p-8 text-center dark:bg-slate-900">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Ready to build your reading streak?
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Join thousands of readers keeping honest daily streaks.
        </p>
        <Link
          href="/signup"
          className="mt-5 inline-block rounded-xl bg-brand-600 px-7 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-brand-700"
        >
          Start your streak — $2/mo
        </Link>
      </footer>
    </article>
  );
}
