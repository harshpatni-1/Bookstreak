"use client";

import { useState, useId } from "react";

type FaqItem = {
  q: string;
  a: string;
};

/**
 * Animated FAQ accordion with smooth expand/collapse. Fully keyboard
 * accessible with proper ARIA attributes. Used on both the landing page
 * (inline) and the dedicated /faq page.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const baseId = useId();

  return (
    <div className="space-y-3" role="list">
      {items.map((item, i) => {
        const isOpen = openIdx === i;
        const headerId = `${baseId}-h-${i}`;
        const panelId = `${baseId}-p-${i}`;

        return (
          <div
            key={item.q}
            className="rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
            role="listitem"
          >
            <button
              id={headerId}
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenIdx(isOpen ? null : i);
                }
              }}
              className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-slate-900 transition dark:text-white"
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              <span>{item.q}</span>
              <span
                className={`ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm transition-transform duration-200 ${
                  isOpen
                    ? "rotate-45 bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              className="overflow-hidden transition-all duration-200"
              style={{
                maxHeight: isOpen ? "500px" : "0",
                opacity: isOpen ? 1 : 0,
              }}
            >
              <p className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-300">
                {item.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
