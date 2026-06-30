"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { completeOnboarding, type OnboardState } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Setting up…" : "Start reading →"}
    </button>
  );
}

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const [state, formAction] = useActionState<OnboardState, FormData>(
    completeOnboarding,
    undefined
  );
  const [tz, setTz] = useState("UTC");

  useEffect(() => {
    try {
      setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    } catch {
      setTz("UTC");
    }
  }, []);

  return (
    <div className="mx-auto mt-16 w-full max-w-md rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900">
      <h1 className="text-2xl font-bold tracking-tight">Let&apos;s set you up</h1>
      <p className="mt-1 text-sm text-slate-500">Two quick things and you&apos;re reading.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="timezone" value={tz} />
        <div>
          <label className="text-sm font-medium" htmlFor="display_name">
            What should we call you?
          </label>
          <input
            id="display_name"
            name="display_name"
            defaultValue={defaultName}
            required
            maxLength={80}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-slate-700"
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="yearly_goal_books">
            Books you&apos;d like to finish this year
          </label>
          <input
            id="yearly_goal_books"
            name="yearly_goal_books"
            type="number"
            min={0}
            max={1000}
            defaultValue={12}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-slate-700"
          />
          <p className="mt-1 text-xs text-slate-400">A book a month is a great start. You can change this anytime.</p>
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
