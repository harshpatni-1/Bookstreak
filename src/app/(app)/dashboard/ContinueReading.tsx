"use client";

import Link from "next/link";
import { useState } from "react";
import type { Book } from "@/lib/types";
import { LogReadingSheet } from "@/components/LogReadingSheet";
import { useTimer } from "@/components/TimerContext";

export function ContinueReading({ books }: { books: Book[] }) {
  const [logBook, setLogBook] = useState<Book | null>(null);
  const { startSession, sessionState } = useTimer();

  if (books.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
        <p className="text-sm text-slate-500">Nothing in progress yet.</p>
        <Link
          href="/shelf"
          className="mt-3 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Add your first book
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold">Continue reading</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {books.map((book) => (
          <div
            key={book.id}
            className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={book.cover_url ?? "/cover-fallback.svg"}
              alt=""
              className="h-20 w-14 shrink-0 rounded bg-slate-100 object-cover dark:bg-slate-800"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{book.title}</p>
              <p className="truncate text-xs text-slate-500">{book.author ?? "Unknown"}</p>
              {book.total_pages ? (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${book.progress_pct}%` }}
                  />
                </div>
              ) : null}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => startSession(book)}
                  disabled={sessionState.active && sessionState.book?.id === book.id}
                  className="rounded-lg bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-200 dark:bg-brand-500/20 dark:text-brand-300 dark:hover:bg-brand-500/30 disabled:opacity-50"
                  title="Start a live reading timer"
                >
                  ▶️ Start timer
                </button>
                <button
                  onClick={() => setLogBook(book)}
                  className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
                >
                  Log reading
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {logBook && <LogReadingSheet book={logBook} onClose={() => setLogBook(null)} />}
    </div>
  );
}
