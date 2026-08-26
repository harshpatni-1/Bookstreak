"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/update-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setMessage("Check your email for a password reset link.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-12 w-full max-w-md rounded-3xl border-2 border-hairline bg-surface p-8 shadow-sm">
      <div className="text-center">
        <span className="text-4xl" aria-hidden="true">
          🔑
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-fg">Reset password</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-fg" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            required
            className="mt-1.5 w-full rounded-xl border-2 border-hairline bg-surface px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-200">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="tap w-full rounded-xl bg-accent py-3 font-semibold text-accent-fg transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Sending link…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-fg-muted">
        Remembered your password?{" "}
        <Link href="/login" className="font-semibold text-accent hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

