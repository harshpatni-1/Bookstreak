"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfile, type SettingsState } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export function SettingsForm({ displayName }: { displayName: string }) {
  const [state, formAction] = useActionState<SettingsState, FormData>(
    updateProfile,
    undefined
  );

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      <div>
        <label className="text-sm font-medium" htmlFor="display_name">
          Display name
        </label>
        <input
          id="display_name"
          name="display_name"
          defaultValue={displayName}
          required
          maxLength={80}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-slate-700"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
          Saved.
        </p>
      )}

      <Submit />
    </form>
  );
}
