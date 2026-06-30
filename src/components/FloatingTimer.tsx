"use client";

import { useTimer } from "./TimerContext";
import { LogReadingSheet } from "./LogReadingSheet";
import { useEffect, useState } from "react";

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function FloatingTimer() {
  const {
    sessionState,
    currentElapsed,
    pauseSession,
    resumeSession,
    cancelSession,
    finishSession,
    isFinishing,
    setIsFinishing,
  } = useTimer();

  // Handle SSR hydration mismatch by only rendering after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (!sessionState.active || !sessionState.book) return null;

  const minutes = Math.floor(currentElapsed / 60);

  return (
    <>
      <div className="fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6 animate-pop-in">
        <div className="flex items-center gap-4 rounded-full bg-slate-900/95 p-2 pr-4 shadow-xl backdrop-blur-md dark:bg-white/95 dark:text-slate-900 text-white border border-slate-700/50 dark:border-slate-200/50">
          
          <div className="flex shrink-0 items-center gap-3 pl-2">
            <div className={`h-2 w-2 rounded-full ${sessionState.isRunning ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <div className="flex flex-col">
              <span className="max-w-[120px] sm:max-w-[180px] truncate text-xs font-medium opacity-70">
                {sessionState.book.title}
              </span>
              <span className="font-mono text-sm font-bold tracking-wider">
                {formatTime(currentElapsed)}
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-700/50 dark:bg-slate-300/50 mx-1" />

          <div className="flex shrink-0 items-center gap-1.5">
            {sessionState.isRunning ? (
              <button
                onClick={pauseSession}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 dark:bg-slate-100 dark:hover:bg-slate-200 transition text-white dark:text-slate-900"
                title="Pause"
                aria-label="Pause session"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              </button>
            ) : (
              <button
                onClick={resumeSession}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 dark:bg-slate-100 dark:hover:bg-slate-200 transition text-white dark:text-slate-900"
                title="Resume"
                aria-label="Resume session"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            )}

            <button
              onClick={finishSession}
              className="flex h-10 px-4 items-center justify-center rounded-full bg-brand-600 hover:bg-brand-700 transition text-sm font-bold text-white shadow-sm"
            >
              Finish
            </button>

            <button
              onClick={cancelSession}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition ml-1"
              title="Cancel session"
              aria-label="Cancel session"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isFinishing && (
        <LogReadingSheet
          book={sessionState.book}
          initialMinutes={minutes}
          onClose={() => setIsFinishing(false)}
          onSuccess={() => {
            setIsFinishing(false);
            cancelSession(); // This resets the state, effectively clearing the timer
          }}
        />
      )}
    </>
  );
}
