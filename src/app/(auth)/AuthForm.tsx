"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { signIn, signUp, type AuthState } from "./actions";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Please wait…" : label}
    </button>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction] = useActionState<AuthState, FormData>(action, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mx-auto mt-20 w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900">
      <h1 className="text-2xl font-bold tracking-tight">
        {mode === "login" ? "Welcome back" : "Start your streak"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {mode === "login"
          ? "Sign in to keep your reading streak alive."
          : "Create an account — it takes 20 seconds."}
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-slate-700"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            {mode === "login" && (
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-brand-600 hover:underline"
                tabIndex={-1}
              >
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative mt-1">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={8}
              className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 pr-10 outline-none focus:border-brand-500 dark:border-slate-700"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {state?.error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
            {state.error}
          </p>
        )}

        <Submit label={mode === "login" ? "Sign in" : "Create account"} />
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/signup" className="font-medium text-brand-600 hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand-600 hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
