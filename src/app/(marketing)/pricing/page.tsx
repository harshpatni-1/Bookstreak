import type { Metadata } from "next";
import { PricingCards } from "@/components/marketing/PricingCards";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — BookStreak",
  description:
    "BookStreak: $2/month or $17 one-time for lifetime access. Every feature included.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Simple pricing
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300">
          Reading is the cheapest hobby there is. Your tracker should be too.
        </p>
      </div>

      <div className="mt-14">
        <PricingCards />
      </div>

      <div className="mx-auto mt-14 max-w-xl space-y-6 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            🤔 Not sure yet?
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Start with the monthly plan — it&apos;s just $2. Use it for a month. If
            you love it (you will), upgrade to lifetime anytime and we&apos;ll
            credit your first month.
          </p>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          BookStreak is open about what it is: a small, focused tool that does
          one thing well. If that ever changes, you&apos;ll always be able to
          export and keep your own reading history.
        </p>

        <div className="pt-4">
          <Link
            href="/faq"
            className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
            aria-label="Read frequently asked questions"
          >
            Have questions? Check the FAQ →
          </Link>
        </div>
      </div>
    </div>
  );
}
