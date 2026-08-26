"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update password.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-12 w-full max-w-md rounded-3xl border-2 border-hairline bg-surface p-8 shadow-sm">
      <div className="text-center">
        <span className="text-4xl" aria-hidden="true">
          🔒
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-fg">Set new password</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Please enter your new password below (minimum 8 characters).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-fg" htmlFor="password">
            New Password
          </label>
          <div className="relative mt-1.5">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full rounded-xl border-2 border-hairline bg-surface px-3.5 py-2.5 pr-12 text-sm text-fg outline-none transition focus:border-accent"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="tap absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-fg-subtle hover:text-fg"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="tap w-full rounded-xl bg-accent py-3 font-semibold text-accent-fg transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Updating password…" : "Update password"}
        </button>
      </form>
    </div>
  );
}

