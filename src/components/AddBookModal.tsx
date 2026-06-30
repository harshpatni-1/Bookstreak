"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { addBook } from "@/app/(app)/actions";
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
  const [adding, start] = useTransition();
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set());
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setStale(Boolean(data.stale));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(debounce.current);
  }, [q]);

  function add(r: BookSearchResult) {
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
      if (res.ok) {
        setAddedKeys((prev) => new Set(prev).add(r.ol_key));
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(50); // Haptic feedback
        }
      }
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="mt-12 w-full max-w-lg animate-pop-in rounded-2xl bg-white p-6 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Add a book</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title or author…"
          className="mt-4 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-slate-700"
        />

        {stale && (
          <p className="mt-2 text-xs text-amber-600">
            Showing cached results — Open Library is slow right now.
          </p>
        )}

        <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
          {loading && <p className="py-6 text-center text-sm text-slate-400">Searching…</p>}
          {!loading && q.trim().length >= 2 && results.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-400">No results.</p>
          )}
          {results.map((r) => {
            const isAdded = addedKeys.has(r.ol_key);
            return (
              <div
                key={r.ol_key}
                className={`flex items-center gap-3 rounded-lg border p-2 transition ${
                  isAdded ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/10" : "border-slate-100 dark:border-slate-800"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.cover_url ?? "/cover-fallback.svg"}
                  alt=""
                  className="h-16 w-11 shrink-0 rounded bg-slate-100 object-cover dark:bg-slate-800"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  <p className="truncate text-xs text-slate-500">{r.author ?? "Unknown author"}</p>
                  {r.pages && <p className="text-xs text-slate-400">{r.pages} pages</p>}
                </div>
                <button
                  disabled={adding || isAdded}
                  onClick={() => add(r)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-60 ${
                    isAdded ? "bg-emerald-500" : "bg-brand-600 hover:bg-brand-700"
                  }`}
                >
                  {isAdded ? "Added ✓" : "Add"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
