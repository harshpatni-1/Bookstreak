"use client";

import Link from "next/link";
import { useState } from "react";
import { LockIcon, CheckIcon, DownloadIcon } from "@/components/icons";
import { PLANS, PLAN_FEATURES } from "@/lib/billing/plans";
import { useDialog } from "@/components/useDialog";
import { UpgradeButton } from "./UpgradeButton";

/**
 * Shown when a write is refused because the trial has ended.
 *
 * The tone is deliberate: a reader who just tried to log a book has done
 * nothing wrong, and their data is not being held hostage. The dialog leads
 * with reassurance, then offers the upgrade — it never implies the history is
 * gone or at risk.
 *
 * Accessibility: a real modal — focus moves in on open, is trapped while open,
 * Escape closes, the page behind is inert to screen readers, and focus returns
 * to whatever opened it.
 */
export function PaywallDialog({
  open,
  onClose,
  message,
}: {
  open: boolean;
  onClose: () => void;
  message?: string;
}) {
  const panelRef = useDialog(open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
        aria-describedby="paywall-desc"
        tabIndex={-1}
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-surface p-6 shadow-2xl outline-none sm:rounded-3xl"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <LockIcon className="h-7 w-7" />
        </div>

        <h2
          id="paywall-title"
          className="text-center text-2xl font-bold tracking-tight text-fg"
        >
          Your free trial has ended
        </h2>
        <p id="paywall-desc" className="mt-3 text-center text-fg-muted">
          {message ??
            "Upgrade to keep logging your reading and building your streak."}
        </p>

        {/* Reassurance first — the reader's own data is never leverage. */}
        <div className="mt-5 rounded-2xl border-2 border-hairline bg-surface-2 p-4">
          <p className="flex items-start gap-2 text-sm font-medium text-fg-muted">
            <DownloadIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              <strong className="text-fg">Your history is safe.</strong> Every
              book, session, and streak you&apos;ve recorded stays readable, and
              you can export all of it for free at any time — subscription or not.
            </span>
          </p>
        </div>

        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {PLAN_FEATURES.slice(0, 6).map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-fg-muted">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-3">
          <UpgradeButton plan="lifetime">
            Get lifetime access — {PLANS.lifetime.price} once
          </UpgradeButton>
          <UpgradeButton plan="monthly" variant="secondary">
            Subscribe — {PLANS.monthly.price}/month
          </UpgradeButton>
        </div>

        <div className="mt-5 flex flex-col items-center gap-3 text-sm">
          <Link
            href="/settings#export"
            className="font-semibold text-accent underline decoration-2 underline-offset-2"
          >
            Export my data instead
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="tap font-medium text-fg-subtle hover:text-fg-muted"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

/** Small helper so any action caller can wire the dialog in three lines. */
export function usePaywall() {
  const [blocked, setBlocked] = useState<string | null>(null);
  return {
    paywallMessage: blocked,
    isBlocked: blocked !== null,
    /** Pass an action result; returns true if it was blocked by the paywall. */
    check(res: { ok: boolean; error?: string; paywalled?: boolean }) {
      if (!res.ok && res.paywalled) {
        setBlocked(res.error ?? null);
        return true;
      }
      return false;
    },
    dismiss: () => setBlocked(null),
  };
}
