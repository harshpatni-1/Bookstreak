import Link from "next/link";
import type { Metadata } from "next";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";

export const metadata: Metadata = {
  title: "FAQ — BookStreak",
  description: "Answers to common questions about BookStreak.",
};

const FAQS = [
  {
    q: "How much does BookStreak cost?",
    a: "Just $2/month, or $17 one-time for lifetime access. Every feature is included in both plans — no tiers, no feature gates.",
  },
  {
    q: "What's included in the lifetime deal?",
    a: "Everything. Same features as the monthly plan, but you pay once and have access forever. It pays for itself in 9 months compared to monthly.",
  },
  {
    q: "Can I cancel my subscription?",
    a: "Yes, anytime — no contracts. You keep access until the end of your billing period. Lifetime users never need to cancel because there's nothing recurring.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your reading history stays yours. You can export your data anytime before or after canceling.",
  },
  {
    q: "How does the streak work?",
    a: "Any day you log reading extends your streak. There's a one-day grace period (called a freeze) so a single missed day won't reset you. Streaks are computed server-side from your reading sessions, dated by your local calendar day — they're honest by design.",
  },
  {
    q: "Do you track me or sell my data?",
    a: "No. There are no ad networks and no third-party trackers, and nothing about your library is used to train AI. Your data sits behind row-level security and is visible only to you.",
  },
  {
    q: "Where do the books come from?",
    a: "Book search and metadata come from the Open Library API. We cache results so adding books stays fast, with a fallback to cached data if the API is temporarily down.",
  },
  {
    q: "What do I actually log?",
    a: "Open the log sheet and tap a quick-add button (+10, +25, +50 pages) or enter exact pages, minutes, your current page, and an optional note. Your book's progress and streak update automatically.",
  },
  {
    q: "Can I use it on my phone?",
    a: "Absolutely — it's mobile-first and installable as a PWA, so you can add it to your home screen and open it like a native app.",
  },
  {
    q: "Can I import from Goodreads?",
    a: "Yes. Export your Goodreads library as a CSV and import it into BookStreak. Your whole shelf carries over.",
  },
  {
    q: "Does it read books to me or contain the book text?",
    a: "No. BookStreak is a habit tracker, not an e-reader. You read your books wherever you like; BookStreak keeps the streak.",
  },
  {
    q: "How do I get started?",
    a: "Sign up, finish the 20-second onboarding, add a book, and log your first page. You're on day one.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Frequently asked questions
        </h1>
        <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">
          Everything you might want to know before you start.
        </p>
      </div>

      <div className="mt-14">
        <FaqAccordion items={FAQS} />
      </div>

      <div className="mt-16 rounded-3xl bg-slate-100 p-8 text-center dark:bg-slate-900">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Still curious? Just try it.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-600 dark:text-slate-300">
          Start with the $2/month plan, or grab lifetime access for $17.
        </p>
        <Link
          href="/signup"
          className="mt-6 inline-block rounded-xl bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
          aria-label="Sign up for BookStreak"
        >
          Start your streak
        </Link>
      </div>
    </div>
  );
}
