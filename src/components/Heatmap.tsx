"use client";

import { useState, useTransition } from "react";
import { getDaySessions, deleteSession } from "@/app/(app)/actions";

// Contribution-style heatmap of reading days over the last ~17 weeks.
function levelColor(count: number): string {
  if (count <= 0) return "bg-slate-200 dark:bg-slate-800";
  if (count === 1) return "bg-brand-200 dark:bg-brand-900";
  if (count === 2) return "bg-brand-400 dark:bg-brand-700";
  return "bg-brand-600 dark:bg-brand-500";
}

export function Heatmap({ counts }: { counts: Record<string, number> }) {
  const days = 17 * 7;
  const cells: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    cells.push({ date: key, count: counts[key] ?? 0 });
  }

  // group into columns of 7 (weeks)
  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[] | null>(null);
  const [pending, start] = useTransition();

  function handleDayClick(date: string, count: number) {
    if (count === 0) return;
    setSelectedDate(date);
    setSessions(null);
    start(async () => {
      const res = await getDaySessions(date);
      if (res.data) setSessions(res.data);
    });
  }

  function handleDeleteSession(sessionId: string) {
    if (!confirm("Are you sure you want to delete this session? It may affect your streak.")) return;
    setSessions((prev) => (prev ? prev.filter((s) => s.id !== sessionId) : null));
    start(async () => {
      await deleteSession({ session_id: sessionId });
    });
  }

  return (
    <>
      <div className="flex gap-1 overflow-x-auto pb-1" role="grid" aria-label="Reading heatmap">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1" role="row">
            {week.map((c) => {
              const label = `${c.date}: ${c.count} session${c.count === 1 ? "" : "s"}`;
              return (
                <button
                  key={c.date}
                  title={label}
                  aria-label={label}
                  disabled={c.count === 0}
                  onClick={() => handleDayClick(c.date, c.count)}
                  className={`h-3 w-3 rounded-sm transition ${levelColor(c.count)} ${
                    c.count > 0 ? "cursor-pointer hover:ring-2 hover:ring-brand-400 hover:ring-offset-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:ring-brand-500 dark:hover:ring-offset-slate-900" : "cursor-default opacity-80"
                  }`}
                  role="gridcell"
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Day Sessions Modal */}
      {selectedDate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedDate(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Reading sessions on ${selectedDate}`}
        >
          <div
            className="w-full max-w-sm animate-pop-in rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {new Date(selectedDate).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {pending && !sessions && (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              </div>
            )}

            {sessions && sessions.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">No sessions found.</p>
            )}

            {sessions && sessions.length > 0 && (
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div key={s.id} className="group relative flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 pr-10 dark:border-slate-800 dark:bg-slate-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.books?.cover_url ?? "/cover-fallback.svg"}
                      alt=""
                      className="h-12 w-8 shrink-0 rounded bg-slate-200 object-cover dark:bg-slate-800"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{s.books?.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {s.pages_read > 0 && `${s.pages_read} page${s.pages_read !== 1 ? 's' : ''}`}
                        {s.pages_read > 0 && s.minutes > 0 && " • "}
                        {s.minutes > 0 && `${s.minutes} min${s.minutes !== 1 ? 's' : ''}`}
                        {s.pages_read === 0 && s.minutes === 0 && "Logged progress"}
                      </p>
                      {s.note && (
                        <p className="mt-2 rounded bg-white p-2 text-xs italic text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                          "{s.note}"
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteSession(s.id)}
                      className="absolute right-2 top-2 rounded p-1.5 text-slate-400 opacity-100 transition hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 sm:opacity-0 sm:group-hover:opacity-100"
                      title="Delete session"
                      aria-label="Delete session"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
