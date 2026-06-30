"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { updatePassword, type AuthState } from "../actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Updating…" : "Update password"}
    </button>
  );
}

export function UpdatePasswordForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(updatePassword, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mx-auto mt-20 w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900">
      <h1 className="text-2xl font-bold tracking-tight">Set new password</h1>
      <p className="mt-1 text-sm text-slate-500">
        Please enter your new password below.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium" htmlFor="password">
            New Password
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
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

        <Submit />
      </form>
    </div>
  );
}
