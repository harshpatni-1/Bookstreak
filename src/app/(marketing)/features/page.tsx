import Link from "next/link";
import type { Metadata } from "next";
import { AnimatedSection } from "@/components/marketing/AnimatedSection";

export const metadata: Metadata = {
  title: "Features — BookStreak",
  description:
    "Streaks, goals, a real bookshelf, stats, a heatmap, and dark mode — everything you need to read every day.",
};

const GROUPS = [
  {
    title: "Build the habit",
    items: [
      ["🔥", "Automatic streaks", "Streaks are computed server-side from your reading log — you never tap a 'mark today' button. A one-day grace period means a single busy night won't wipe weeks of momentum."],
      ["📅", "Local-day accuracy", "Each session is dated by your own wall clock, so 'a day' means your day — no surprise resets from timezone math."],
      ["🎯", "Yearly goals", "Set a books-per-year target and watch the bar fill as you finish. Progress updates the moment you log."],
    ],
  },
  {
    title: "Organize your reading",
    items: [
      ["🗂️", "Four-status shelf", "Want, Reading, Finished, Dropped — with drag-and-drop, one-click status changes, and instant filtering."],
      ["🔎", "Search & add", "Pull any title from the Open Library API. A shared cache keeps it fast, with a stale-cache fallback if the API has a bad day."],
      ["✍️", "One-tap logging", "Pages, minutes, current page, and an optional note in a frictionless sheet — with confetti when you save."],
    ],
  },
  {
    title: "See your progress",
    items: [
      ["📈", "Stats page", "Books finished, pages read, reading velocity, hours, and a genre breakdown — all in one glance."],
      ["🟩", "17-week heatmap", "A contribution-style grid of your reading days. Lighting up squares is the whole point."],
      ["🏠", "Dashboard", "Your streak card, goal progress, heatmap, and a 'continue reading' shortcut to whatever you had open."],
    ],
  },
  {
    title: "Built right",
    items: [
      ["🔒", "Privacy-first", "No ad networks, no third-party trackers, no AI on your data. Row-level security means only you see your library."],
      ["🌙", "Dark mode", "A polished dark theme that remembers your choice and applies before first paint — no flash."],
      ["📱", "Mobile-first PWA", "Designed for your phone first and installable to your home screen. Fast everywhere."],
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Everything in BookStreak
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          Each feature exists to do one thing: get you reading today, and again
          tomorrow. No feed, no noise, no upsell.
        </p>
      </div>

      <div className="mt-16 space-y-16">
        {GROUPS.map((g) => (
          <AnimatedSection key={g.title} stagger>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {g.title}
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map(([emoji, title, body]) => (
                  <div
                    key={title}
                    className="reveal rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
                  >
                    <div className="text-2xl" aria-hidden="true">{emoji}</div>
                    <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <div className="mt-20 text-center">
        <p className="mb-4 text-lg text-slate-600 dark:text-slate-300">
          All of this for <span className="font-bold text-slate-900 dark:text-white">$2/month</span> or{" "}
          <span className="font-bold text-slate-900 dark:text-white">$17 once</span> for lifetime access.
        </p>
        <Link
          href="/signup"
          className="inline-block rounded-xl bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 active:scale-[0.98]"
          aria-label="Sign up for BookStreak"
        >
          Start your streak
        </Link>
      </div>
    </div>
  );
}
