"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertIcon, SparkIcon, LockIcon } from "@/components/icons";
import type { Entitlement } from "@/lib/billing/entitlement";

/**
 * Trial / billing status banner.
 *
 * Tone escalates with urgency, and only the urgent states are sticky:
 *
 *   comfortable trial  → quiet, dismissible for the rest of the day
 *   3 days or fewer    → amber, dismissible for the day
 *   payment failed     → red, not dismissible (action required)
 *   expired            → red, not dismissible (writes are blocked)
 *   paying / lifetime  → nothing at all
 *
 * Dismissal is per-day rather than permanent, so a reader who ignores it on day
 * 4 still sees it on day 13 — without being nagged on every navigation.
 */

type Tone = "quiet" | "warn" | "urgent";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function TrialBanner({ entitlement }: { entitlement: Entitlement }) {
  const { state, trialDaysLeft } = entitlement;
  const [dismissed, setDismissed] = useState(true); // assume hidden until checked

  const dismissible = state === "trialing" || state === "trial_ending";

  useEffect(() => {
    if (!dismissible) {
      setDismissed(false);
      return;
    }
    try {
      setDismissed(localStorage.getItem("bs-banner-dismissed") === todayKey());
    } catch {
      setDismissed(false);
    }
  }, [dismissible]);

  if (state === "active" || state === "lifetime") return null;
  if (dismissible && dismissed) return null;

  let tone: Tone = "quiet";
  let Icon = SparkIcon;
  let headline = "";
  let detail = "";
  let cta = "See plans";

  switch (state) {
    case "trialing": {
      const d = trialDaysLeft ?? 0;
      tone = "quiet";
      headline = `${d} ${d === 1 ? "day" : "days"} left in your free trial`;
      detail = "Everything is unlocked. No card needed until you decide.";
      break;
    }
    case "trial_ending": {
      const d = trialDaysLeft ?? 0;
      tone = "warn";
      Icon = AlertIcon;
      headline =
        d === 0
          ? "Your trial ends today"
          : `Your trial ends in ${d} ${d === 1 ? "day" : "days"}`;
      detail = "Keep your streak going from $2/month, or $17 once for lifetime.";
      cta = "Keep my streak";
      break;
    }
    case "past_due":
      tone = "urgent";
      Icon = AlertIcon;
      headline = "Your last payment didn't go through";
      detail =
        "You have a 3-day grace period. Update your card to avoid losing access.";
      cta = "Update payment";
      break;
    case "expired":
      tone = "urgent";
      Icon = LockIcon;
      headline = "Your trial has ended";
      detail =
        "Your reading history is safe — you can still browse and export it. Upgrade to log new reading.";
      cta = "Upgrade";
      break;
  }

  const tones: Record<Tone, string> = {
    quiet: "border-hairline bg-surface-2 text-fg-muted",
    warn: "border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-500/50 dark:bg-amber-500/10 dark:text-amber-100",
    urgent:
      "border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-100",
  };

  const href = state === "past_due" ? "/settings/billing" : "/upgrade";

  return (
    <div
      // "region" + a label so a screen-reader user can find or skip it by name.
      role="region"
      aria-label="Subscription status"
      className={`mb-6 flex flex-col gap-3 rounded-2xl border-2 p-4 sm:flex-row sm:items-center sm:gap-4 ${tones[tone]}`}
    >
      <Icon className="h-6 w-6 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{headline}</p>
        <p className="mt-0.5 text-sm opacity-90">{detail}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href={href}
          className="tap inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition hover:brightness-110"
        >
          {cta}
        </Link>
        {dismissible && (
          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              try {
                localStorage.setItem("bs-banner-dismissed", todayKey());
              } catch {
                /* ignore */
              }
            }}
            className="tap inline-flex items-center justify-center rounded-xl px-3 text-sm font-medium underline decoration-2 underline-offset-2 opacity-80 hover:opacity-100"
          >
            Not now
          </button>
        )}
      </div>
    </div>
  );
}
