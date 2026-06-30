"use client";

import { useState } from "react";

/**
 * Interactive heatmap demo for the marketing page. Shows mock reading data
 * and reveals the date + session count on hover/focus. Clicking shows fake sessions.
 */
export function InteractiveHeatmap() {
  const [active, setActive] = useState<{
    idx: number;
    day: string;
    count: number;
  } | null>(null);

  const [selected, setSelected] = useState<{
    day: string;
    count: number;
    sessions: { title: string; pages: number }[];
  } | null>(null);

  // Build 17 weeks × 7 days of mock data. Deterministic so SSR matches client.
  const weeks = 17;
  const today = new Date();
  const cells: { date: Date; count: number; key: string }[] = [];

  for (let w = weeks - 1; w >= 0; w--) {
    for (let d = 0; d < 7; d++) {
      const daysBack = w * 7 + (6 - d);
      const dt = new Date(today);
      dt.setDate(dt.getDate() - daysBack);
      // Pseudo-random count (0–4) based on day index, seeded deterministically
      const idx = (weeks - 1 - w) * 7 + d;
      const seed = (idx * 37 + 13) % 100;
      const count = seed < 30 ? 0 : seed < 50 ? 1 : seed < 75 ? 2 : seed < 90 ? 3 : 4;
      cells.push({
        date: dt,
        count,
        key: dt.toISOString().slice(0, 10),
      });
    }
  }

  const shades = [
    "bg-slate-200 dark:bg-slate-800",
    "bg-brand-200 dark:bg-brand-900",
    "bg-brand-300 dark:bg-brand-700",
    "bg-brand-400 dark:bg-brand-600",
    "bg-brand-600 dark:bg-brand-400",
  ];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function formatDate(d: Date): string {
    return `${months[d.getMonth()]} ${d.getDate()}`;
  }

  function getFakeSessions(count: number, day: string) {
    if (count === 0) return [];
    
    const books = ["The Fable 5", "Sun Tzu - The Art of War", "Dune", "Atomic Habits", "Project Hail Mary", "1984", "The Hobbit"];
    let hash = 0;
    for (let i = 0; i < day.length; i++) hash += day.charCodeAt(i);
    
    const sessions = [];
    for (let i = 0; i < count; i++) {
       const bookIdx = (hash + i) % books.length;
       const pages = ((hash + i) % 5 + 1) * 5;
       sessions.push({ title: books[bookIdx], pages });
    }
    return sessions;
  }

  function handleCellClick(cell: typeof cells[0]) {
    if (cell.count === 0) {
      setSelected(null);
      return;
    }
    const day = formatDate(cell.date);
    setSelected({
      day,
      count: cell.count,
      sessions: getFakeSessions(cell.count, day),
    });
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start" role="region" aria-label="Reading activity heatmap demo">
      <div className="relative flex-1">
        {/* Tooltip */}
        {active && (
          <div
            className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white shadow-lg dark:bg-white dark:text-slate-900"
            aria-live="polite"
          >
            {active.day} · {active.count === 0 ? "No reading" : `${active.count} session${active.count > 1 ? "s" : ""}`}
          </div>
        )}

        <div
          className="grid gap-[3px]"
          style={{
            gridTemplateColumns: `repeat(${weeks}, 1fr)`,
            gridTemplateRows: "repeat(7, 1fr)",
            gridAutoFlow: "column",
          }}
        >
          {cells.map((cell, i) => {
            const formattedDay = formatDate(cell.date);
            const isSelected = selected?.day === formattedDay;
            
            return (
              <button
                key={cell.key}
                type="button"
                onClick={() => handleCellClick(cell)}
                className={`aspect-square w-full rounded-[3px] transition-all hover:scale-125 hover:z-10 focus:scale-125 focus:z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${shades[cell.count]} ${isSelected ? 'ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-slate-950 scale-110 z-10' : ''} ${cell.count > 0 ? 'cursor-pointer' : 'cursor-default'}`}
                onMouseEnter={() =>
                  setActive({
                    idx: i,
                    day: formattedDay,
                    count: cell.count,
                  })
                }
                onFocus={() =>
                  setActive({
                    idx: i,
                    day: formattedDay,
                    count: cell.count,
                  })
                }
                onMouseLeave={() => setActive(null)}
                onBlur={() => setActive(null)}
                aria-label={`${formattedDay}: ${cell.count} reading session${cell.count !== 1 ? "s" : ""}`}
                tabIndex={0}
              />
            );
          })}
        </div>
      </div>

      {/* Side panel for clicked day details */}
      {selected ? (
        <div className="w-full shrink-0 animate-pop-in rounded-xl border-2 border-brand-500/30 bg-slate-100/50 p-4 text-left text-sm text-slate-700 shadow-lg backdrop-blur-sm dark:border-brand-500/30 dark:bg-slate-900/80 dark:text-slate-300 sm:w-64">
          <h4 className="font-semibold text-brand-600 dark:text-brand-400">Books read on {selected.day}</h4>
          <div className="mt-3 space-y-2">
            {selected.sessions.map((s, i) => (
              <div key={i} className="flex items-center justify-between gap-2 border-b border-slate-200/50 pb-2 last:border-0 last:pb-0 dark:border-slate-800/50">
                <span className="truncate font-medium">
                  {i + 1}. {s.title}
                </span>
                <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-800/50 px-2 py-0.5 rounded-full">
                  {s.pages} pgs
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="hidden w-64 shrink-0 rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-400 dark:border-slate-800 dark:text-slate-500 sm:flex sm:items-center sm:justify-center">
          Click any colored square to view session details
        </div>
      )}
    </div>
  );
}
