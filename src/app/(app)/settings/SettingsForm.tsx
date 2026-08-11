"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckIcon, AlertIcon } from "@/components/icons";
import { updateProfile, type SettingsState } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="tap rounded-xl bg-accent px-5 font-semibold text-accent-fg transition hover:brightness-110 disabled:opacity-60"
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
        <label className="block font-medium text-fg-muted" htmlFor="display_name">
          Display name
        </label>
        <input
          id="display_name"
          name="display_name"
          defaultValue={displayName}
          required
          maxLength={80}
          autoComplete="nickname"
          // Points the browser and screen reader at the message below when the
          // save fails, instead of leaving it as unlinked text.
          aria-describedby={state?.error ? "display_name-error" : undefined}
          aria-invalid={state?.error ? true : undefined}
          className="mt-1 w-full rounded-xl border-2 border-hairline bg-transparent px-3 py-2.5 text-fg outline-none transition focus:border-accent"
        />
      </div>

      {state?.error && (
        <p
          id="display_name-error"
          role="alert"
          className="flex items-start gap-2 rounded-xl border-2 border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-200"
        >
          <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
          {state.error}
        </p>
      )}

      {state?.ok && (
        // role="status" so the confirmation is announced, not just coloured.
        <p
          role="status"
          className="flex items-start gap-2 rounded-xl border-2 border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-200"
        >
          <CheckIcon className="mt-0.5 h-5 w-5 shrink-0" />
          Saved.
        </p>
      )}

      <Submit />
    </form>
  );
}
