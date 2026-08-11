"use client";

import { useState } from "react";
import type { PlanId } from "@/lib/billing/plans";
import { AlertIcon } from "@/components/icons";

/**
 * Starts Stripe Checkout for a plan.
 *
 * The button only ever sends a plan id — never a price or an amount — so the
 * charge is decided entirely server-side from the environment's Price IDs.
 */
export function UpgradeButton({
  plan,
  children,
  className = "",
  variant = "primary",
}: {
  plan: PlanId;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout.");
        setPending(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Network error — check your connection and try again.");
      setPending(false);
    }
  }

  const base =
    "tap inline-flex w-full items-center justify-center rounded-xl px-6 py-3 text-base font-semibold transition disabled:opacity-60";
  const styles =
    variant === "primary"
      ? "bg-accent text-accent-fg hover:brightness-110"
      : "border-2 border-accent text-accent hover:bg-accent/10";

  return (
    <div>
      <button
        type="button"
        onClick={go}
        disabled={pending}
        aria-busy={pending}
        className={`${base} ${styles} ${className}`}
      >
        {pending ? "Opening secure checkout…" : children}
      </button>
      {error && (
        <p
          role="alert"
          className="mt-2 flex items-start gap-1.5 text-sm font-medium text-rose-600 dark:text-rose-400"
        >
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Opens the Stripe Billing Portal for managing or cancelling a subscription. */
export function ManageBillingButton({ className = "" }: { className?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not open the billing portal.");
        setPending(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Network error — check your connection and try again.");
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={go}
        disabled={pending}
        aria-busy={pending}
        className={`tap inline-flex items-center justify-center rounded-xl border-2 border-hairline px-5 py-2.5 text-sm font-semibold text-fg-muted transition hover:bg-surface-2 disabled:opacity-60 ${className}`}
      >
        {pending ? "Opening…" : "Manage billing"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}
