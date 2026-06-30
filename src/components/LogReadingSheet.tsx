"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logSession } from "@/app/(app)/actions";
import { localToday, localYesterday } from "@/lib/date";
import { burstConfetti } from "./confetti";
import type { Book } from "@/lib/types";

const QUICK_PAGES = [5, 10, 25, 50];

export function LogReadingSheet({
  book,
  onClose,
  initialMinutes = 0,
  onSuccess,
}: {
  book: Book;
  onClose: () => void;
  initialMinutes?: number;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [pages, setPages] = useState("");
  const [endPage, setEndPage] = useState("");
  const [minutes, setMinutes] = useState(initialMinutes > 0 ? String(initialMinutes) : "");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(localToday());
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const today = localToday();
  const yesterday = localYesterday();

  function submit(overridePages?: number) {
    setError(null);
    const pagesNum = overridePages ?? (pages === "" ? 0 : Number(pages));
    start(async () => {
      const res = await logSession({
        book_id: book.id,
        pages_read: pagesNum,
        end_page: endPage === "" ? undefined : Number(endPage),
        minutes: minutes === "" ? 0 : Number(minutes),
        note: note.trim() || undefined,
        session_date: date,
      });
      if (!res.ok) {
        setError(res.error ?? "Something went wrong");
        return;
      }
      burstConfetti();
      router.refresh();
      if (onSuccess) onSuccess();
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Log reading for ${book.title}`}
    >
      <div
        className="w-full max-w-md animate-pop-in rounded-t-2xl bg-white p-6 dark:bg-slate-900 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold">Log reading</h2>
        <p className="mt-0.5 truncate text-sm text-slate-500">{book.title}</p>

        {/* One-tap quick add — the fast path */}
        <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">
          Quick add pages
        </p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {QUICK_PAGES.map((n) => (
            <button
              key={n}
              type="button"
              disabled={pending}
              onClick={() => submit(n)}
              className="rounded-xl border border-brand-200 bg-brand-50 py-3 text-base font-bold text-brand-700 transition hover:bg-brand-100 disabled:opacity-60 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-200"
            >
              +{n}
            </button>
          ))}
        </div>

        <details className="mt-4 text-sm">
          <summary className="cursor-pointer select-none text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            More options (exact page, minutes, note, date)
          </summary>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="text-sm">
              Pages read
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-slate-700"
              />
            </label>
            <label className="text-sm">
              Minutes
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-slate-700"
              />
            </label>
          </div>

          <label className="mt-3 block text-sm">
            Current page (optional)
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={endPage}
              onChange={(e) => setEndPage(e.target.value)}
              placeholder={book.total_pages ? `of ${book.total_pages}` : undefined}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-slate-700"
            />
          </label>

          <label className="mt-3 block text-sm">
            Note / quote (optional)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={2000}
              className="mt-1 w-full resize-none rounded-lg border border-slate-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-slate-700"
            />
          </label>

          {/* Backdating — log a day you forgot, in one tap */}
          <p className="mt-3 text-sm">When did you read?</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setDate(today)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                date === today
                  ? "bg-brand-600 text-white"
                  : "border border-slate-300 dark:border-slate-700"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDate(yesterday)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                date === yesterday
                  ? "bg-brand-600 text-white"
                  : "border border-slate-300 dark:border-slate-700"
              }`}
            >
              Yesterday
            </button>
            <input
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-slate-300 bg-transparent px-2 py-1.5 text-xs dark:border-slate-700"
            />
          </div>
        </details>

        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium dark:border-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={() => submit()}
            disabled={pending}
            className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save & keep streak 🔥"}
          </button>
        </div>
      </div>
    </div>
  );
}
