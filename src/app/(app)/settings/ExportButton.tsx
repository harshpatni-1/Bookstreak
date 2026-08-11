"use client";

import { useState } from "react";
import { exportReadingData } from "./actions";
import { DownloadIcon, AlertIcon, LiveRegion } from "@/components/icons";

/**
 * Downloads the reader's history as a CSV file.
 *
 * The server action returns the CSV as a string and the browser turns it into a
 * download, so nothing is written to disk server-side and no temporary URL has
 * to be cleaned up. Same Blob idiom as ShareStreakCard.
 */
export function ExportButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  async function run() {
    setPending(true);
    setError(null);
    try {
      const res = await exportReadingData();
      if (!res.ok) {
        setError(res.error);
        return;
      }

      if (res.rows === 0) {
        setError(
          "There's nothing to export yet — log some reading first, then come back."
        );
        return;
      }

      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setAnnouncement(
        `Downloaded ${res.rows} reading ${res.rows === 1 ? "entry" : "entries"} as a spreadsheet file.`
      );
    } catch {
      setError("Couldn't build the file. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <LiveRegion message={announcement} />
      <button
        type="button"
        onClick={run}
        disabled={pending}
        aria-busy={pending}
        className="tap inline-flex items-center justify-center gap-2 rounded-xl border-2 border-hairline px-5 text-sm font-semibold text-fg-muted transition hover:bg-surface-2 disabled:opacity-60"
      >
        <DownloadIcon className="h-5 w-5" />
        {pending ? "Preparing…" : "Download my reading history"}
      </button>

      {error && (
        <p
          role="alert"
          className="mt-2 flex items-start gap-2 text-sm font-medium text-rose-700 dark:text-rose-300"
        >
          <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
