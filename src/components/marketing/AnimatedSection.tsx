"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Wraps children in a container that fades/slides in when scrolled into view.
 * Uses Intersection Observer — zero dependencies. Respects prefers-reduced-motion
 * via the .reveal CSS class (animation is disabled when reduced motion is on).
 */
export function AnimatedSection({
  children,
  className = "",
  stagger = false,
}: {
  children: ReactNode;
  className?: string;
  /** If true, direct children each animate in with a staggered delay */
  stagger?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip animation entirely if user prefers reduced motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      el.classList.add("visible");
      el.querySelectorAll(".reveal").forEach((c) => c.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          // Also reveal staggered children
          el.querySelectorAll(".reveal").forEach((c) =>
            c.classList.add("visible")
          );
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${stagger ? "reveal-stagger" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
