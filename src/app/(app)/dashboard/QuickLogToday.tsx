"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logSession } from "@/app/(app)/actions";
import { localToday } from "@/lib/date";
import { burstConfetti } from "@/components/confetti";
import { LogReadingSheet } from "@/components/LogReadingSheet";
import { useTimer } from "@/components/TimerContext";
import type { Book } from "@/lib/types";

const QUICK_PAGES = [10, 25, 50];

/**
 * The fastest path to keep a streak alive: one tap on the dashboard logs
 * today's reading against the book you most recently read. Beats a spreadsheet
 * by removing every step between "I read" and "it's recorded".
 */
export function QuickLogToday({ lastBook, readToday }: { lastBook: Book | null; readToday: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [sheet, setSheet] = useState(false);
  const [justLogged, setJustLogged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { startSession, sessionState } = useTimer();

  if (!lastBook) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-sm text-slate-500 dark:text-slate-400">Add a book to start your streak.</p>
        <Link
          href="/shelf"
          className="mt-3 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Add a book
        </Link>
      </div>
    );
  }

  function quickLog(pages: number) {
    setError(null);
    start(async () => {
      const res = await logSession({
        book_id: lastBook!.id,
        pages_read: pages,
        minutes: 0,
        session_date: localToday(),
      });
      if (!res.ok) {
        setError(res.error ?? "Couldn't save — try again");
        return;
      }
      burstConfetti();
      setJustLogged(true);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800/80 dark:border dark:border-slate-700/50">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            {readToday || justLogged ? "✅ You read today" : "Read today?"}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {readToday || justLogged ? "Streak safe. Log more anytime." : `Pick up: ${lastBook.title}`}
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={lastBook.cover_url ?? "/cover-fallback.svg"}
          alt=""
          aria-hidden="true"
          className="h-14 w-10 shrink-0 rounded bg-slate-100 object-cover dark:bg-slate-800"
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {QUICK_PAGES.map((n) => (
          <button
            key={n}
            type="button"
            disabled={pending}
            onClick={() => quickLog(n)}
            className="rounded-xl border border-brand-200 bg-brand-50 py-3 text-base font-bold text-brand-700 transition hover:bg-brand-100 disabled:opacity-60 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-200"
          >
            +{n} pages
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => startSession(lastBook)}
          disabled={sessionState.active && sessionState.book?.id === lastBook.id}
          className="rounded-lg bg-brand-100 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-200 dark:bg-brand-500/20 dark:text-brand-300 dark:hover:bg-brand-500/30 disabled:opacity-50"
        >
          ▶️ Start timer
        </button>
        <button
          type="button"
          onClick={() => setSheet(true)}
          className="rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          More options →
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}

      {sheet && <LogReadingSheet book={lastBook} onClose={() => setSheet(false)} />}
    </div>
  );
}
