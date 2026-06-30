"use client";

import { useMemo, useState } from "react";
import {
  SHELF_ORDER,
  SHELF_LABELS,
  type Book,
  type ShelfStatus,
} from "@/lib/types";
import { updateStatus, deleteBook } from "@/app/(app)/actions";
import { LogReadingSheet } from "@/components/LogReadingSheet";
import { AddBookModal } from "@/components/AddBookModal";
import { burstConfetti } from "@/components/confetti";

export function ShelfBoard({ initialBooks }: { initialBooks: Book[] }) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [filter, setFilter] = useState("");
  const [logBook, setLogBook] = useState<Book | null>(null);
  const [showAdd, setShowAdd] = useState<ShelfStatus | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.author ?? "").toLowerCase().includes(q)
    );
  }, [books, filter]);

  const byStatus = (s: ShelfStatus) => filtered.filter((b) => b.status === s);

  // Optimistic status move (drag-drop or one-click). Reconciled by server revalidate.
  async function move(book: Book, status: ShelfStatus) {
    if (book.status === status) return;
    setBooks((prev) => prev.map((b) => (b.id === book.id ? { ...b, status } : b)));
    if (status === "finished") burstConfetti();
    const res = await updateStatus({ book_id: book.id, status });
    if (!res.ok) {
      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, status: book.status } : b))
      );
    }
  }

  async function remove(book: Book) {
    if (!confirm(`Remove "${book.title}" from your shelf?`)) return;
    const prev = books;
    setBooks((b) => b.filter((x) => x.id !== book.id));
    const res = await deleteBook({ book_id: book.id });
    if (!res.ok) setBooks(prev);
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Your shelf</h1>
        <button
          onClick={() => setShowAdd("want")}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          + Add book
        </button>
      </div>

      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter your shelf…"
        className="mb-6 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-slate-700"
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {SHELF_ORDER.map((status) => (
          <section
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              const b = books.find((x) => x.id === dragId);
              if (b) move(b, status);
              setDragId(null);
            }}
            className="rounded-2xl bg-slate-100/60 p-3 dark:bg-slate-900/60"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold">{SHELF_LABELS[status]}</h2>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800">
                {byStatus(status).length}
              </span>
            </div>

            <div className="space-y-3">
              {byStatus(status).map((book) => (
                <article
                  key={book.id}
                  draggable
                  onDragStart={() => setDragId(book.id)}
                  className="cursor-grab rounded-xl bg-white p-3 shadow-sm active:cursor-grabbing dark:bg-slate-800"
                >
                  <div className="flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={book.cover_url ?? "/cover-fallback.svg"}
                      alt=""
                      className="h-20 w-14 shrink-0 rounded bg-slate-100 object-cover dark:bg-slate-700"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{book.title}</p>
                      <p className="truncate text-xs text-slate-500">
                        {book.author ?? "Unknown"}
                      </p>
                      {book.total_pages ? (
                        <div className="mt-2">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <div
                              className="h-full rounded-full bg-brand-500 transition-all"
                              style={{ width: `${book.progress_pct}%` }}
                            />
                          </div>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {book.current_page}/{book.total_pages} · {Math.round(book.progress_pct)}%
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setLogBook(book)}
                      className="rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                    >
                      Log
                    </button>
                    <select
                      value={book.status}
                      onChange={(e) => move(book, e.target.value as ShelfStatus)}
                      className="rounded-md border border-slate-200 bg-transparent px-1.5 py-1 text-xs dark:border-slate-700"
                    >
                      {SHELF_ORDER.map((s) => (
                        <option key={s} value={s}>
                          {SHELF_LABELS[s]}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => remove(book)}
                      className="ml-auto rounded-md px-1.5 py-1 text-xs text-slate-400 hover:text-rose-600"
                    >
                      ✕
                    </button>
                  </div>
                </article>
              ))}

              {byStatus(status).length === 0 && (
                <button
                  onClick={() => setShowAdd(status)}
                  className="w-full rounded-xl border border-dashed border-slate-300 py-6 text-xs text-slate-400 hover:border-brand-400 hover:text-brand-500 dark:border-slate-700"
                >
                  + Add a book here
                </button>
              )}
            </div>
          </section>
        ))}
      </div>

      {logBook && <LogReadingSheet book={logBook} onClose={() => setLogBook(null)} />}
      {showAdd && (
        <AddBookModal defaultStatus={showAdd} onClose={() => setShowAdd(null)} />
      )}
    </div>
  );
}
