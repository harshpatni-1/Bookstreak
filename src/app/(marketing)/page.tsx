import Link from "next/link";
import { AnimatedSection } from "@/components/marketing/AnimatedSection";
import { CountUp } from "@/components/marketing/CountUp";
import { InteractiveHeatmap } from "@/components/marketing/InteractiveHeatmap";
import { PricingCards } from "@/components/marketing/PricingCards";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";

const LANDING_FAQS = [
  {
    q: "How much does BookStreak cost?",
    a: "Just $2/month, or $17 one-time for lifetime access. No hidden fees, no feature limits. Every plan includes everything.",
  },
  {
    q: "How does the streak work?",
    a: "Any day you log reading extends your streak. There's a one-day grace period (a freeze) so a single missed day won't reset you. Streaks are computed automatically from your reading log — honest by design.",
  },
  {
    q: "Do you track me or sell my data?",
    a: "No. There are no ad networks, no third-party trackers, and nothing about your library is used to train AI. Your data is protected by row-level security — only you can see it.",
  },
  {
    q: "Can I use it on my phone?",
    a: "Yes — it's designed phone-first and installable to your home screen like a real app. Works great on desktop too.",
  },
  {
    q: "Can I import from Goodreads?",
    a: "Yes. Export your Goodreads library as a CSV and import it into BookStreak. Your whole reading history, carried over.",
  },
  {
    q: "What if I cancel?",
    a: "You can export your reading data anytime. If you cancel a monthly subscription, you keep access until the end of your billing period. Lifetime users have access forever.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden" aria-labelledby="hero-heading">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,theme(colors.brand.100)_0%,transparent_70%)] dark:bg-[radial-gradient(60%_50%_at_50%_0%,theme(colors.brand.900/.4)_0%,transparent_70%)]" />
        {/* Floating gradient orbs for depth */}
        <div className="pointer-events-none absolute -left-32 top-20 h-64 w-64 rounded-full bg-brand-200/30 blur-3xl dark:bg-brand-800/20" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 top-40 h-48 w-48 rounded-full bg-brand-300/20 blur-3xl dark:bg-brand-700/15" aria-hidden="true" />

        <div className="mx-auto max-w-4xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-200">
            🔒 Privacy-first · No AI · No tracking
          </span>
          <h1
            id="hero-heading"
            className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-6xl"
          >
            Read every day.
            <br />
            <span className="text-brand-600 dark:text-brand-400">
              Finish more books.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            BookStreak turns reading into a habit you actually keep. Log your
            progress in one tap, watch your streak grow, and let the books pile
            up — finished, not abandoned.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="btn-glow w-full rounded-xl bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/30 active:scale-[0.98] sm:w-auto"
              aria-label="Sign up and start your reading streak"
            >
              Start your streak — $2/mo
            </Link>
            <Link
              href="#how"
              className="w-full rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-100 hover:shadow-sm active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
              aria-label="Scroll down to see how BookStreak works"
            >
              See how it works
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            20 seconds to set up. Or grab{" "}
            <Link href="/pricing" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
              lifetime access for $17
            </Link>
            .
          </p>

          {/* Stats with animated counters + glassmorphism */}
          <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-slate-200/60 p-5 shadow-xl shadow-slate-900/5 glass-card dark:border-slate-700/40">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50/80 p-4 dark:bg-slate-950/60">
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white" aria-label="47 day streak">
                  <CountUp end={47} />
                </div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  day streak 🔥
                </div>
              </div>
              <div className="rounded-xl bg-slate-50/80 p-4 dark:bg-slate-950/60">
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white" aria-label="12 books finished">
                  <CountUp end={12} duration={900} />
                </div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  books finished
                </div>
              </div>
              <div className="rounded-xl bg-slate-50/80 p-4 dark:bg-slate-950/60">
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white" aria-label="3,408 pages this year">
                  <CountUp end={3408} />
                </div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  pages this year
                </div>
              </div>
            </div>
            <div className="mt-5 rounded-xl bg-slate-50/80 p-4 dark:bg-slate-950/60">
              <p className="mb-2 text-left text-xs font-medium text-slate-400">
                Your reading this year
              </p>
              <InteractiveHeatmap />
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <AnimatedSection>
        <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6" aria-labelledby="problem-heading">
          <h2 id="problem-heading" className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            You start books. You just don&apos;t finish them.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            The to-read pile grows. Bookmarks gather dust at page 40. Reading
            apps bury the one thing that matters — actually opening the book today —
            under social feeds, ads, and AI gimmicks you never asked for.
          </p>
          <p className="mt-6 text-lg font-semibold text-brand-600 dark:text-brand-400">
            BookStreak does one thing: it gets you reading every single day.
          </p>
        </section>
      </AnimatedSection>

      {/* How it works */}
      <section id="how" className="border-y border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900" aria-labelledby="how-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 id="how-heading" className="text-center text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Three steps. That&apos;s the whole app.
          </h2>
          <AnimatedSection stagger>
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              <Step
                n="1"
                emoji="📚"
                title="Add your books"
                body="Search millions of titles and drop them on your shelf — Want, Reading, Finished, or Dropped. Or import from Goodreads."
              />
              <Step
                n="2"
                emoji="✍️"
                title="Log in one tap"
                body="Read a few pages? Open the log sheet, tap a quick-add button, and you're done. Confetti included. Your progress updates automatically."
              />
              <Step
                n="3"
                emoji="🔥"
                title="Keep the streak"
                body="Every day you read extends your streak — with a freeze day for real life. Miss nothing, finish everything."
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6" aria-labelledby="features-heading">
        <h2 id="features-heading" className="text-center text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          Everything you need. Nothing you don&apos;t.
        </h2>
        <AnimatedSection stagger>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Feature emoji="🔥" title="Honest streaks" body="Streaks computed server-side from your reading log. The number is always real — with a built-in freeze so one busy night doesn't reset you." />
            <Feature emoji="🎯" title="Goals that track themselves" body="Set a yearly reading goal and watch progress fill as you finish books. No spreadsheets, no manual counting." />
            <Feature emoji="🗂️" title="A real bookshelf" body="Four statuses, drag-and-drop, one-click moves, and instant filtering. Your library, organized the way you think." />
            <Feature emoji="📈" title="Stats worth checking" body="Books finished, pages read, reading velocity, hours, and a genre breakdown — all on one page, always up to date." />
            <Feature emoji="🟩" title="Contribution heatmap" body="A 17-week grid of your reading days, just like GitHub. Watch the squares light up — it's weirdly motivating." />
            <Feature emoji="🌙" title="Dark mode & mobile-first" body="Designed for the phone in your hand at midnight. Installable as a PWA on your home screen. Fast everywhere." />
          </div>
        </AnimatedSection>
      </section>

      {/* Privacy band */}
      <AnimatedSection>
        <section className="border-y border-slate-200 bg-brand-50 py-16 dark:border-slate-800 dark:bg-brand-900/20" aria-labelledby="privacy-heading">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 id="privacy-heading" className="text-3xl font-bold text-slate-900 dark:text-white">
              🔒 Your reading is yours.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              No ad networks. No third-party trackers. No AI training on your
              library. Your data lives behind row-level security, visible only to
              you. The basics, done exceptionally well.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* Pricing — embedded on landing page */}
      <AnimatedSection>
        <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6" aria-labelledby="pricing-heading" id="pricing">
          <h2 id="pricing-heading" className="text-center text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Simple, honest pricing
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-center text-lg text-slate-600 dark:text-slate-300">
            Reading is the cheapest hobby there is. Your tracker should be too.
          </p>
          <div className="mt-12">
            <PricingCards compact />
          </div>
        </section>
      </AnimatedSection>

      {/* FAQ — inline on landing page */}
      <AnimatedSection>
        <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900" aria-labelledby="faq-heading">
          <div className="mx-auto max-w-2xl px-4 sm:px-6">
            <h2 id="faq-heading" className="text-center text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Common questions
            </h2>
            <div className="mt-10">
              <FaqAccordion items={LANDING_FAQS} />
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Final CTA */}
      <section className="px-4 pb-24 sm:px-6" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 px-6 py-16 text-center shadow-xl shadow-brand-900/20">
          <h2 id="cta-heading" className="text-3xl font-bold text-white sm:text-4xl">
            Your next streak starts today.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-50">
            Add one book, log one page, and you&apos;re on day one. The rest takes
            care of itself.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="w-full rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-brand-700 shadow-lg transition hover:bg-brand-50 hover:shadow-xl active:scale-[0.98] sm:w-auto"
              aria-label="Sign up and start reading"
            >
              Start reading — $2/mo
            </Link>
            <Link
              href="/pricing"
              className="w-full rounded-xl border-2 border-white/30 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] sm:w-auto"
              aria-label="View all pricing options"
            >
              Or $17 for life →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Step({
  n,
  emoji,
  title,
  body,
}: {
  n: string;
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <div className="reveal relative rounded-2xl border border-slate-200 bg-slate-50 p-7 transition hover:shadow-md hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-950">
      <span
        className="absolute -top-4 left-7 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white shadow-md"
        aria-hidden="true"
      >
        {n}
      </span>
      <div className="text-3xl" aria-hidden="true">{emoji}</div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{body}</p>
    </div>
  );
}

function Feature({
  emoji,
  title,
  body,
}: {
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <div className="reveal rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700">
      <div className="text-2xl" aria-hidden="true">{emoji}</div>
      <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{body}</p>
    </div>
  );
}
