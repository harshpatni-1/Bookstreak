"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { resetPassword, type AuthState } from "../actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Sending link…" : "Send reset link"}
    </button>
  );
}

export function ResetPasswordForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(resetPassword, undefined);

  return (
    <div className="mx-auto mt-20 w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900">
      <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
      <p className="mt-1 text-sm text-slate-500">
        Enter your email address and we'll send you a link to reset your password.
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

        {state?.error && (
          <p
            className={`rounded-lg px-3 py-2 text-sm ${
              state.error.startsWith("Check your email")
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
            }`}
          >
            {state.error}
          </p>
        )}

        <Submit />
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
