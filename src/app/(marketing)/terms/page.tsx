import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — BookStreak",
  description: "Simple, transparent terms of service for BookStreak users.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <header className="border-b border-slate-200 pb-8 text-center dark:border-slate-800">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-900/40 dark:bg-brand-950/40 dark:text-brand-300">
          📜 Honest & Simple Terms
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Last updated: August 11, 2026 · Fair, clear terms built for readers.
        </p>
      </header>

      <div className="prose prose-slate mt-12 space-y-10 dark:prose-invert">
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Summary
          </h2>
          <p className="mt-2 text-base text-slate-700 dark:text-slate-200">
            By creating an account or using BookStreak, you agree to these Terms of Service. BookStreak provides tools to log your reading habits and build streaks. We charge simple, fair pricing ($2/month or $17 lifetime) with no hidden fees or dark patterns.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            1. Account Responsibilities
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            You must provide a valid email address to create an account. You are responsible for maintaining the security of your account login credentials. BookStreak is not liable for unauthorized access resulting from compromised passwords.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            2. Subscriptions, Payments & Lifetime Deals
          </h2>
          <ul className="list-disc space-y-2 pl-6 text-slate-600 dark:text-slate-300">
            <li>
              <strong className="text-slate-900 dark:text-white">Monthly Plan ($2/month):</strong> Billed monthly via Stripe. You can cancel anytime from your settings; access continues through your current paid billing period.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-white">Lifetime Access ($17 one-time):</strong> Grants full access to BookStreak for the lifetime of the service with no recurring subscription fees.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-white">30-Day Guarantee / Refunds:</strong> If you are dissatisfied with BookStreak for any reason within your first 30 days, contact support for a full refund.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            3. Fair Usage & Acceptable Behavior
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            You agree not to attempt to breach our security controls, reverse-engineer the API, overload the system with automated bot traffic, or use BookStreak for illegal purposes. We reserve the right to terminate accounts that violate these security rules.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            4. Service Availability & Intellectual Property
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            We aim for 99.9% uptime. While we perform regular backups, we encourage exporting your reading data periodically. The BookStreak code, design, logos, and brand assets are owned by BookStreak. Your reading logs and book notes remain 100% yours.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            5. Changes to Terms
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            We may update these terms occasionally to reflect product changes or legal requirements. Material changes will be communicated via email or an in-app notice.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            6. Contact Support
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            For billing inquiries, questions, or refund requests, write to us directly at{" "}
            <a href="mailto:support@bookstreak.com" className="font-semibold text-brand-600 underline hover:text-brand-700 dark:text-brand-400">
              support@bookstreak.com
            </a>.
          </p>
        </section>
      </div>

      <footer className="mt-16 border-t border-slate-200 pt-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Read our <Link href="/privacy" className="font-semibold text-brand-600 underline dark:text-brand-400">Privacy Policy</Link> · Return to <Link href="/" className="font-semibold text-brand-600 underline dark:text-brand-400">BookStreak Home</Link>
      </footer>
    </article>
  );
}
