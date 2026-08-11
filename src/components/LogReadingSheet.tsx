"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logSession } from "@/app/(app)/actions";
import { localToday, localYesterday } from "@/lib/date";
import { burstConfetti } from "./confetti";
import { useDialog } from "./useDialog";
import { LiveRegion, AlertIcon } from "./icons";
import { PaywallDialog, usePaywall } from "./billing/PaywallDialog";
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
  const [announcement, setAnnouncement] = useState("");
  const [pending, start] = useTransition();
  const paywall = usePaywall();

  const panelRef = useDialog(true, onClose);

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

      // A blocked write isn't an error the reader caused — show the way to fix
      // it rather than a red sentence.
      if (paywall.check(res)) return;

      if (!res.ok) {
        setError(res.error ?? "Something went wrong. Please try again.");
        return;
      }

      // Confetti is visual only. Announce the same news for screen readers.
      setAnnouncement(
        `Saved. ${pagesNum} ${pagesNum === 1 ? "page" : "pages"} logged for ${book.title}.`
      );
      burstConfetti();
      router.refresh();
      if (onSuccess) onSuccess();
      onClose();
    });
  }

  const dateBtn = (selected: boolean) =>
    `tap rounded-xl px-3 py-1.5 text-sm font-medium transition ${
      selected
        ? "bg-accent text-accent-fg"
        : "border-2 border-hairline text-fg-muted hover:bg-surface-2"
    }`;

  const field =
    "mt-1 w-full rounded-xl border-2 border-hairline bg-transparent px-3 py-2.5 text-fg outline-none transition focus:border-accent";

  return (
    <>
      <LiveRegion message={announcement} />

      <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
        <div
          className="absolute inset-0 bg-slate-900/60"
          onClick={onClose}
          aria-hidden="true"
        />

        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="log-title"
          tabIndex={-1}
          className="relative max-h-[92vh] w-full max-w-md animate-pop-in overflow-y-auto rounded-t-3xl bg-surface p-6 shadow-2xl outline-none sm:rounded-3xl"
        >
          <h2 id="log-title" className="text-xl font-bold text-fg">
            Log reading
          </h2>
          <p className="mt-0.5 truncate text-sm text-fg-subtle">{book.title}</p>

          {/* One-tap quick add — the fast path most people use. */}
          <p className="mt-5 text-sm font-semibold text-fg-muted">
            How many pages did you read?
          </p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {QUICK_PAGES.map((n) => (
              <button
                key={n}
                type="button"
                disabled={pending}
                onClick={() => submit(n)}
                aria-label={`Log ${n} pages and save`}
                className="tap rounded-xl border-2 border-accent/30 bg-accent/10 py-3 text-lg font-bold text-accent transition active:scale-95 hover:bg-accent/20 disabled:opacity-60"
              >
                +{n}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-fg-subtle">
            Tap a number to save straight away.
          </p>

          <details className="mt-5 text-sm">
            <summary className="tap inline-flex cursor-pointer select-none items-center font-medium text-fg-muted hover:text-fg">
              Add more detail (exact page, minutes, note, date)
            </summary>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium text-fg-muted">
                Pages read
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  className={field}
                />
              </label>
              <label className="block text-sm font-medium text-fg-muted">
                Minutes
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className={field}
                />
              </label>
            </div>

            <label className="mt-3 block text-sm font-medium text-fg-muted">
              Page you stopped on (optional)
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={endPage}
                onChange={(e) => setEndPage(e.target.value)}
                placeholder={book.total_pages ? `of ${book.total_pages}` : undefined}
                className={field}
              />
            </label>

            <label className="mt-3 block text-sm font-medium text-fg-muted">
              Note or quote (optional)
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                maxLength={2000}
                className={`${field} resize-none`}
              />
            </label>

            {/* Backdating — log a day you forgot, in one tap. */}
            <fieldset className="mt-4">
              <legend className="text-sm font-medium text-fg-muted">
                When did you read?
              </legend>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDate(today)}
                  aria-pressed={date === today}
                  className={dateBtn(date === today)}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDate(yesterday)}
                  aria-pressed={date === yesterday}
                  className={dateBtn(date === yesterday)}
                >
                  Yesterday
                </button>
                <label className="sr-only" htmlFor="log-date">
                  Or pick another date
                </label>
                <input
                  id="log-date"
                  type="date"
                  value={date}
                  max={today}
                  onChange={(e) => setDate(e.target.value)}
                  className="tap rounded-xl border-2 border-hairline bg-transparent px-3 text-sm text-fg outline-none transition focus:border-accent"
                />
              </div>
            </fieldset>
          </details>

          {error && (
            <p
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl border-2 border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-200"
            >
              <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
              {error}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="tap flex-1 rounded-xl border-2 border-hairline text-sm font-semibold text-fg-muted transition hover:bg-surface-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => submit()}
              disabled={pending}
              aria-busy={pending}
              className="tap flex-1 rounded-xl bg-accent text-sm font-semibold text-accent-fg transition hover:brightness-110 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <PaywallDialog
        open={paywall.isBlocked}
        onClose={paywall.dismiss}
        message={paywall.paywallMessage ?? undefined}
      />
    </>
  );
}
