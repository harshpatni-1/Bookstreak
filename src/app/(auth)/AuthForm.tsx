"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { signIn, signUp, signInWithGoogle, type AuthState } from "./actions";

function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="tap w-full rounded-xl bg-accent py-3 font-semibold text-accent-fg transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Please wait…" : label}
    </button>
  );
}

export function AuthForm({
  mode,
  initialError,
}: {
  mode: "login" | "signup";
  initialError?: string;
}) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction] = useActionState<AuthState, FormData>(action, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const activeError = googleError || state?.error || (state === undefined ? initialError : undefined);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setGoogleError(null);
      const res = await signInWithGoogle("/dashboard");
      if (res && res.error) {
        setGoogleError(res.error);
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setGoogleError(err?.message || "Could not connect to Google sign in.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-12 w-full max-w-md rounded-3xl border-2 border-hairline bg-surface p-8 shadow-sm">
      <div className="text-center">
        <span className="text-4xl" aria-hidden="true">📖</span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-fg">
          {mode === "login" ? "Welcome back" : "Start your reading streak"}
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          {mode === "login"
            ? "Sign in to keep your streak alive."
            : "Create an account in 20 seconds. 14 days free."}
        </p>
      </div>

      {/* Google OAuth Button */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="tap flex w-full items-center justify-center gap-3 rounded-xl border-2 border-hairline bg-surface-2 py-3 text-sm font-semibold text-fg transition hover:bg-surface-3 disabled:opacity-60"
        >
          <GoogleIcon className="h-5 w-5 shrink-0" />
          <span>{googleLoading ? "Connecting to Google…" : "Continue with Google"}</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="w-full border-t border-hairline" />
        <span className="absolute bg-surface px-3 text-xs uppercase tracking-wider text-fg-subtle">
          or with email
        </span>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-fg" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            className="mt-1.5 w-full rounded-xl border-2 border-hairline bg-surface px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-fg" htmlFor="password">
              Password
            </label>
            {mode === "login" && (
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-accent hover:underline"
                tabIndex={-1}
              >
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative mt-1.5">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
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

        {activeError && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-200">
            {activeError}
          </div>
        )}

        {state?.message && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200">
            {state.message}
          </div>
        )}

        <Submit label={mode === "login" ? "Sign in with email" : "Create account"} />
      </form>

      <p className="mt-6 text-center text-sm text-fg-muted">
        {mode === "login" ? (
          <>
            New to BookStreak?{" "}
            <Link href="/signup" className="font-semibold text-accent hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-accent hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

