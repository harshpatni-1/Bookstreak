"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { Book } from "@/lib/types";

type SessionState = {
  active: boolean;
  book: Book | null;
  startTime: number | null; // The exact timestamp when the current run started
  elapsedSeconds: number;   // Accumulated time before the current run started
  isRunning: boolean;       // Is it actively ticking right now?
};

type TimerContextType = {
  sessionState: SessionState;
  currentElapsed: number; // The real-time accumulated seconds
  startSession: (book: Book) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  finishSession: () => void;
  cancelSession: () => void;
  isFinishing: boolean;
  setIsFinishing: (val: boolean) => void;
};

const defaultState: SessionState = {
  active: false,
  book: null,
  startTime: null,
  elapsedSeconds: 0,
  isRunning: false,
};

const TimerContext = createContext<TimerContextType | null>(null);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [sessionState, setSessionState] = useState<SessionState>(defaultState);
  const [currentElapsed, setCurrentElapsed] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  
  // Ref to track if we've loaded from localStorage so we don't overwrite it immediately
  const loadedRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bookstreak_timer");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSessionState(parsed);
      }
    } catch (e) {
      console.error("Failed to load timer state", e);
    }
    loadedRef.current = true;
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!loadedRef.current) return;
    try {
      localStorage.setItem("bookstreak_timer", JSON.stringify(sessionState));
    } catch (e) {
      console.error("Failed to save timer state", e);
    }
  }, [sessionState]);

  // Ticker loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (sessionState.active && sessionState.isRunning && sessionState.startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const runDuration = Math.floor((now - sessionState.startTime!) / 1000);
        setCurrentElapsed(sessionState.elapsedSeconds + runDuration);
      }, 1000);
    } else {
      setCurrentElapsed(sessionState.elapsedSeconds);
    }
    return () => clearInterval(interval);
  }, [sessionState]);

  // Also sync currentElapsed immediately when state updates
  useEffect(() => {
    if (sessionState.active && sessionState.isRunning && sessionState.startTime) {
      const now = Date.now();
      const runDuration = Math.floor((now - sessionState.startTime) / 1000);
      setCurrentElapsed(sessionState.elapsedSeconds + runDuration);
    } else {
      setCurrentElapsed(sessionState.elapsedSeconds);
    }
  }, [sessionState]);

  const startSession = useCallback((book: Book) => {
    setSessionState({
      active: true,
      book,
      startTime: Date.now(),
      elapsedSeconds: 0,
      isRunning: true,
    });
    setIsFinishing(false);
  }, []);

  const pauseSession = useCallback(() => {
    setSessionState((prev) => {
      if (!prev.isRunning || !prev.startTime) return prev;
      const now = Date.now();
      const runDuration = Math.floor((now - prev.startTime) / 1000);
      return {
        ...prev,
        startTime: null,
        elapsedSeconds: prev.elapsedSeconds + runDuration,
        isRunning: false,
      };
    });
  }, []);

  const resumeSession = useCallback(() => {
    setSessionState((prev) => {
      if (prev.isRunning) return prev;
      return {
        ...prev,
        startTime: Date.now(),
        isRunning: true,
      };
    });
  }, []);

  const cancelSession = useCallback(() => {
    if (confirm("Are you sure you want to discard this reading session?")) {
      setSessionState(defaultState);
      setIsFinishing(false);
    }
  }, []);

  const finishSession = useCallback(() => {
    // We pause it exactly now, so the UI stops ticking while they fill the form
    setSessionState((prev) => {
      if (!prev.isRunning || !prev.startTime) return prev;
      const now = Date.now();
      const runDuration = Math.floor((now - prev.startTime) / 1000);
      return {
        ...prev,
        startTime: null,
        elapsedSeconds: prev.elapsedSeconds + runDuration,
        isRunning: false,
      };
    });
    setIsFinishing(true);
  }, []);

  return (
    <TimerContext.Provider
      value={{
        sessionState,
        currentElapsed,
        startSession,
        pauseSession,
        resumeSession,
        finishSession,
        cancelSession,
        isFinishing,
        setIsFinishing: (val: boolean) => {
          setIsFinishing(val);
          if (!val && !sessionState.active) {
            setSessionState(defaultState);
          }
        },
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}
