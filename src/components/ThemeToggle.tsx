"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon, TextSizeIcon, ContrastIcon } from "./icons";

/**
 * Display preferences: theme, text size, and contrast.
 *
 * Stored in localStorage and mirrored onto <html> so the pre-paint script in
 * layout.tsx can restore them with no flash. Deliberately kept out of the
 * database: a reader who needs larger text needs it on the login screen too,
 * before there is a session to read a preference from.
 *
 * Each group is a native radiogroup — arrow keys work, labels are real labels,
 * and the state is announced without any ARIA plumbing of our own.
 */

type Theme = "light" | "dark";
type TextSize = "normal" | "large" | "xl";

const TEXT_SIZES: { value: TextSize; label: string; sample: string }[] = [
  { value: "normal", label: "Default", sample: "A" },
  { value: "large", label: "Large", sample: "A" },
  { value: "xl", label: "Largest", sample: "A" },
];

function read<T extends string>(key: string, fallback: T): T {
  try {
    return (localStorage.getItem(key) as T) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode — preference just won't persist */
  }
}

export function DisplayPrefs({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [size, setSize] = useState<TextSize>("normal");
  const [highContrast, setHighContrast] = useState(false);
  const [ready, setReady] = useState(false);

  // Read the values the pre-paint script already applied, so the controls show
  // the real state rather than defaults on first render.
  useEffect(() => {
    const el = document.documentElement;
    setTheme(el.classList.contains("dark") ? "dark" : "light");
    setSize((el.getAttribute("data-text") as TextSize) ?? "normal");
    setHighContrast(el.getAttribute("data-contrast") === "high");
    setReady(true);
  }, []);

  function applyTheme(next: Theme) {
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    write("bs-theme", next);
  }

  function applySize(next: TextSize) {
    setSize(next);
    const el = document.documentElement;
    if (next === "normal") el.removeAttribute("data-text");
    else el.setAttribute("data-text", next);
    write("bs-text", next);
  }

  function applyContrast(next: boolean) {
    setHighContrast(next);
    const el = document.documentElement;
    if (next) el.setAttribute("data-contrast", "high");
    else el.removeAttribute("data-contrast");
    write("bs-contrast", next ? "high" : "normal");
  }

  // Render nothing interactive until we've synced, to avoid showing a control
  // in the wrong position for a moment.
  if (!ready) return <div className={className} aria-hidden="true" />;

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Theme */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-fg-muted">
          Appearance
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: "light" as const, label: "Light", Icon: SunIcon },
              { value: "dark" as const, label: "Dark", Icon: MoonIcon },
            ]
          ).map(({ value, label, Icon }) => (
            <label
              key={value}
              className={`tap flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-medium transition ${
                theme === value
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-hairline text-fg-muted hover:bg-surface-2"
              }`}
            >
              <input
                type="radio"
                name="bs-theme"
                value={value}
                checked={theme === value}
                onChange={() => applyTheme(value)}
                className="sr-only"
              />
              <Icon className="h-5 w-5" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Text size */}
      <fieldset>
        <legend className="mb-2 flex items-center gap-2 text-sm font-semibold text-fg-muted">
          <TextSizeIcon className="h-5 w-5" />
          Text size
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {TEXT_SIZES.map(({ value, label, sample }, i) => (
            <label
              key={value}
              className={`tap flex cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-2 py-2 transition ${
                size === value
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-hairline text-fg-muted hover:bg-surface-2"
              }`}
            >
              <input
                type="radio"
                name="bs-text"
                value={value}
                checked={size === value}
                onChange={() => applySize(value)}
                className="sr-only"
              />
              {/* The sample glyph grows to preview the effect of each option. */}
              <span
                aria-hidden="true"
                className="font-bold leading-none"
                style={{ fontSize: `${0.95 + i * 0.35}rem` }}
              >
                {sample}
              </span>
              <span className="text-xs font-medium">{label}</span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-fg-subtle">
          Scales the whole app — buttons and spacing grow with the text.
        </p>
      </fieldset>

      {/* Contrast */}
      <div>
        <label className="tap flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 border-hairline px-3 py-2 transition hover:bg-surface-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-fg-muted">
            <ContrastIcon className="h-5 w-5" />
            High contrast
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={highContrast}
            onChange={(e) => applyContrast(e.target.checked)}
            className="h-6 w-6 shrink-0 cursor-pointer accent-accent"
          />
        </label>
        <p className="mt-2 text-xs text-fg-subtle">
          Stronger borders and text, no blur effects.
        </p>
      </div>
    </div>
  );
}

/**
 * Compact light/dark switch for the mobile header, where the full panel doesn't
 * fit. The complete set of controls lives in Settings.
 */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    write("bs-theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      // The label states the ACTION, not the current state — "Dark mode" alone
      // leaves a screen-reader user guessing whether it's a status or a button.
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={
        compact
          ? "tap flex items-center justify-center rounded-xl text-fg-muted transition hover:bg-surface-2"
          : "tap flex w-full items-center justify-center gap-2 rounded-xl border-2 border-hairline text-sm font-medium text-fg-muted transition hover:bg-surface-2"
      }
    >
      {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
      {!compact && <span>{dark ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
}
