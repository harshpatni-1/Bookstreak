"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Modal dialog behaviour, in one place.
 *
 * A `role="dialog" aria-modal="true"` element makes a promise to assistive
 * technology that the rest of the page is unreachable. Honouring it takes four
 * things, and all four are easy to forget individually:
 *
 *   1. Focus moves INTO the dialog on open, so the heading is announced.
 *   2. Tab is trapped, so focus can't wander behind the overlay.
 *   3. Escape closes it (WCAG 2.1.2, No Keyboard Trap).
 *   4. Focus RETURNS to whatever opened it, so a keyboard user isn't dumped at
 *      the top of the document.
 *
 * This started as the implementation inside PaywallDialog. It lives here so
 * LogReadingSheet and AddBookModal get the same behaviour instead of a third
 * hand-rolled copy that drifts.
 *
 * Usage:
 *   const panelRef = useDialog(open, onClose);
 *   <div ref={panelRef} role="dialog" aria-modal="true" tabIndex={-1} …>
 */
export function useDialog(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      // Wrap at both ends so Tab and Shift+Tab cycle within the dialog.
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;

    opener.current = document.activeElement as HTMLElement | null;
    document.addEventListener("keydown", handleKey);

    // Lock background scroll — on iOS a modal over a scrolling page is
    // genuinely disorienting.
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    // Focus the panel itself rather than the first control, so the accessible
    // name is read before the reader is dropped onto an input.
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = overflow;
      opener.current?.focus();
    };
  }, [open, handleKey]);

  return panelRef;
}
