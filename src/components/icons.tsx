"use client";

import { useEffect, useState } from "react";

/**
 * Central icon set.
 *
 * Real SVG paths rather than emoji. Emoji were the previous approach and they
 * fail three ways: a screen reader announces "house building" for Home, the
 * glyphs render differently per platform, and they don't inherit currentColor so
 * they ignore high-contrast mode. Every icon here is aria-hidden and always
 * paired with a visible or screen-reader-only text label.
 */

type IconProps = { className?: string };

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function svg(children: React.ReactNode) {
  return function Icon({ className = "h-6 w-6" }: IconProps) {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...S}>
        {children}
      </svg>
    );
  };
}

export const HomeIcon = svg(
  <>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
    <path d="M9.5 21v-6h5v6" />
  </>
);

export const ShelfIcon = svg(
  <>
    <path d="M4 4h6v16H4z" />
    <path d="M10 4h6v16h-6z" />
    <path d="M17 5.2l3.3.9-4 14.6-3.2-.9" />
  </>
);

export const StatsIcon = svg(
  <>
    <path d="M4 20V10" />
    <path d="M10 20V4" />
    <path d="M16 20v-7" />
    <path d="M22 20H2" />
  </>
);

export const SettingsIcon = svg(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 14.1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 7a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 3.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </>
);

export const FlameIcon = svg(
  <path d="M12 22c4 0 6.5-2.7 6.5-6.2 0-4.4-4-6-4.6-10.8-2 1-3.2 2.9-3.2 4.9 0 1.1-.9 2-2 2s-1.9-.8-2-1.8C5.9 11.6 5.5 13.4 5.5 15c0 3.9 2.7 7 6.5 7Z" />
);

export const SnowflakeIcon = svg(
  <>
    <path d="M12 2v20" />
    <path d="m4.5 6.5 15 11" />
    <path d="m19.5 6.5-15 11" />
    <path d="M12 6.5 9.5 4M12 6.5 14.5 4M12 17.5 9.5 20M12 17.5l2.5 2.5" />
  </>
);

export const TargetIcon = svg(
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.4" />
  </>
);

export const BookIcon = svg(
  <>
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22z" />
    <path d="M4 17.5h16" />
  </>
);

export const PlusIcon = svg(
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>
);

export const CheckIcon = svg(<path d="m5 13 4 4L19 7" />);

export const SunIcon = svg(
  <>
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </>
);

export const MoonIcon = svg(
  <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
);

export const TextSizeIcon = svg(
  <>
    <path d="M3 7V5h9v2M7.5 5v14" />
    <path d="M13 12v-1.5h7V12M16.5 10.5V19" />
  </>
);

export const ContrastIcon = svg(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v18a9 9 0 0 0 0-18Z" fill="currentColor" />
  </>
);

export const LockIcon = svg(
  <>
    <rect x="4.5" y="10.5" width="15" height="10.5" rx="2" />
    <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
  </>
);

export const SparkIcon = svg(
  <>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    <path d="M18.5 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
  </>
);

export const DownloadIcon = svg(
  <>
    <path d="M12 3v12" />
    <path d="m7.5 11 4.5 4.5L16.5 11" />
    <path d="M4 20h16" />
  </>
);

export const AlertIcon = svg(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v6M12 16.5h.01" />
  </>
);

/**
 * Live region for one-off announcements (save confirmations, blocked writes).
 * Sighted readers get the toast; screen-reader users get the same words.
 */
export function useAnnouncer() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(t);
  }, [message]);
  return { message, announce: setMessage };
}

export function LiveRegion({ message }: { message: string }) {
  return (
    <p role="status" aria-live="polite" className="sr-only">
      {message}
    </p>
  );
}
