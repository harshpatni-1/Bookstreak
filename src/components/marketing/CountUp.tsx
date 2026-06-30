"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animated counter that counts up from 0 to `end` when scrolled into view.
 * Duration is in ms. Respects prefers-reduced-motion (shows final value instantly).
 */
export function CountUp({
  end,
  duration = 1200,
  prefix = "",
  suffix = "",
  separator = ",",
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
}) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If reduced motion, just show the final value
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(end);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, started]);

  useEffect(() => {
    if (!started) return;

    const start = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out curve for a satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, end, duration]);

  function format(n: number): string {
    if (!separator) return String(n);
    return n.toLocaleString();
  }

  return (
    <span ref={ref} aria-label={`${prefix}${format(end)}${suffix}`}>
      {prefix}
      {format(value)}
      {suffix}
    </span>
  );
}
