"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { addBook } from "@/app/(app)/actions";
import { useDialog } from "./useDialog";
import { LiveRegion, CheckIcon, PlusIcon, AlertIcon } from "./icons";
import { PaywallDialog, usePaywall } from "./billing/PaywallDialog";
import type { BookSearchResult, ShelfStatus } from "@/lib/types";

export function AddBookModal({
  defaultStatus = "want",
  onClose,
}: {
  defaultStatus?: ShelfStatus;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [adding, start] = useTransition();
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set());
  const debounce = useRef<ReturnType<typeof setTimeout>>();
  const paywall = usePaywall();

  const panelRef = useDialog(true, onClose);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setStale(Boolean(data.stale));
      } catch {
        setResults([]);
        setError("Couldn't reach the book search. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(debounce.current);
  }, [q]);

  function add(r: BookSearchResult) {
    setError(null);
    start(async () => {
      const res = await addBook({
        ol_key: r.ol_key,
        title: r.title,
        author: r.author ?? undefined,
        cover_url: r.cover_url ?? undefined,
        total_pages: r.pages ?? undefined,
        isbn: r.isbn ?? undefined,
        status: defaultStatus,
      });

      if (paywall.check(res)) return;

      if (!res.ok) {
        setError(res.error ?? "Couldn't add that book. Please try again.");
        return;
      }

      setAddedKeys((prev) => new Set(prev).add(r.ol_key));
      setAnnouncement(`${r.title} added to your shelf.`);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(50);
      }
    });
  }

  const showEmpty = !loading && q.trim().length >= 2 && results.length === 0;

  return (
    <>
      <LiveRegion message={announcement} />

      <div className="fixed inset-0 z-40 flex items-start justify-center p-4">
        <div
          className="absolute inset-0 bg-slate-900/60"
          onClick={onClose}
          aria-hidden="true"
        />

        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-book-title"
          tabIndex={-1}
          className="relative mt-12 max-h-[80vh] w-full max-w-lg animate-pop-in overflow-hidden rounded-3xl bg-surface p-6 shadow-2xl outline-none"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 id="add-book-title" className="text-xl font-bold text-fg">
              Add a book
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="tap -mr-2 flex items-center justify-center rounded-xl text-fg-subtle transition hover:bg-surface-2 hover:text-fg"
            >
              <span aria-hidden="true" className="text-xl leading-none">
                ✕
              </span>
            </button>
          </div>

          <label htmlFor="book-search" className="mt-4 block text-sm font-medium text-fg-muted">
            Search by title or author
          </label>
          <input
            id="book-search"
            autoFocus
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. The Hobbit"
            className="mt-1 w-full rounded-xl border-2 border-hairline bg-transparent px-3 py-2.5 text-fg outline-none transition focus:border-accent"
          />

          {stale && (
            <p className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-300">
              Showing saved results — the book service is slow right now.
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-3 flex items-start gap-2 text-sm font-medium text-rose-700 dark:text-rose-300"
            >
              <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
              {error}
            </p>
          )}

          {/* aria-busy tells a screen reader the list is updating, rather than
              leaving it to guess why the results just changed. */}
          <div
            className="mt-4 max-h-80 space-y-2 overflow-y-auto"
            aria-busy={loading}
          >
            {loading && (
              <p className="py-6 text-center text-sm text-fg-subtle">Searching…</p>
            )}

            {showEmpty && (
              <div className="py-6 text-center">
                <p className="text-sm font-medium text-fg-muted">
                  No books found for “{q.trim()}”.
                </p>
                <p className="mt-1 text-sm text-fg-subtle">
                  Try just the title, or check the spelling.
                </p>
              </div>
            )}

            {!loading && q.trim().length < 2 && (
              <p className="py-6 text-center text-sm text-fg-subtle">
                Type at least two letters to start searching.
              </p>
            )}

            {results.map((r) => {
              const isAdded = addedKeys.has(r.ol_key);
              return (
                <div
                  key={r.ol_key}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-2 transition ${
                    isAdded
                      ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500/50 dark:bg-emerald-500/10"
                      : "border-hairline"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.cover_url ?? "/cover-fallback.svg"}
                    alt=""
                    className="h-16 w-11 shrink-0 rounded bg-surface-2 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-fg">{r.title}</p>
                    <p className="truncate text-sm text-fg-subtle">
                      {r.author ?? "Unknown author"}
                    </p>
                    {r.pages && (
                      <p className="text-sm text-fg-subtle">{r.pages} pages</p>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={adding || isAdded}
                    onClick={() => add(r)}
                    // The visible label is "Add"; the accessible name names the
                    // book, so a screen-reader user isn't facing a list of
                    // identical "Add" buttons.
                    aria-label={isAdded ? `${r.title} added` : `Add ${r.title}`}
                    className={`tap shrink-0 rounded-xl px-3 text-sm font-semibold transition disabled:opacity-100 ${
                      isAdded
                        ? "bg-emerald-600 text-white"
                        : "bg-accent text-accent-fg hover:brightness-110 disabled:opacity-60"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {isAdded ? (
                        <>
                          <CheckIcon className="h-4 w-4" />
                          Added
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4" />
                          Add
                        </>
                      )}
                    </span>
                  </button>
                </div>
              );
            })}
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
