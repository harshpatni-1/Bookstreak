"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { importBooks, type ImportResult } from "@/app/(app)/actions";
import { parseImportCsv, type ParseResult } from "@/lib/import/goodreads";
import { LiveRegion, AlertIcon } from "@/components/icons";
import { PaywallDialog, usePaywall } from "@/components/billing/PaywallDialog";

type Step = "upload" | "preview" | "done";

export function ImportClient() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [pending, start] = useTransition();
  const paywall = usePaywall();

  function handleFile(file: File) {
    setError(null);

    // Case-insensitive: files arrive as .CSV from some Windows exports.
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError(
        "That file type won't work. Choose the .csv file you downloaded from Goodreads."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("That file is too big. Please choose one under 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const res = parseImportCsv(text);

        if (res.books.length === 0) {
          setError(
            "No books found in this file. It needs a header row with a \"Title\" column."
          );
          return;
        }

        setParsed(res);
        setStep("preview");
      } catch {
        setError("Couldn't read that file. Please check it's a CSV and try again.");
      }
    };
    reader.onerror = () => setError("Couldn't read that file. Please try again.");
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function doImport() {
    if (!parsed) return;
    setError(null);

    start(async () => {
      const res = await importBooks({ books: parsed.books });

      if (paywall.check(res)) return;

      if (!res.ok) {
        setError(res.error ?? "Something went wrong. Please try again.");
        return;
      }
      setResult(res);
      setAnnouncement(
        `Import finished. ${res.imported ?? 0} ${
          (res.imported ?? 0) === 1 ? "book" : "books"
        } added to your shelf.`
      );
      setStep("done");
      router.refresh();
    });
  }

  // Shared error presentation — an icon plus colour, never colour alone.
  const errorBox = error && (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-xl border-2 border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-200"
    >
      <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
      {error}
    </p>
  );

  const paywallDialog = (
    <PaywallDialog
      open={paywall.isBlocked}
      onClose={paywall.dismiss}
      message={paywall.paywallMessage ?? undefined}
    />
  );

  // ─── Upload Step ───
  if (step === "upload") {
    return (
      <div className="space-y-4">
        <LiveRegion message={announcement} />

        <div
          className="tap flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-hairline bg-surface px-6 py-12 text-center transition hover:border-accent hover:bg-accent/5"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label="Choose a CSV file, or drop one here"
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileRef.current?.click();
            }
          }}
        >
          <div className="text-4xl" aria-hidden="true">📁</div>
          <p className="mt-3 font-semibold text-fg">
            Choose your CSV file
          </p>
          <p className="mt-1 text-sm text-fg-subtle">
            or drag and drop it here
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={handleInputChange}
            aria-label="Upload CSV file"
          />
        </div>

        <div className="rounded-2xl border-2 border-hairline bg-surface-2 p-4">
          <h3 className="font-semibold text-fg">
            How to get your file from Goodreads
          </h3>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-fg-muted">
            <li>
              Go to{" "}
              <span className="font-semibold text-fg">
                My Books → Import and Export
              </span>
            </li>
            <li>Click &quot;Export Library&quot;</li>
            <li>Wait for the email, then download the file</li>
            <li>Come back here and choose that file</li>
          </ol>
          <p className="mt-3 text-sm text-fg-subtle">
            Any spreadsheet saved as CSV works, as long as it has a
            &quot;Title&quot; column — it doesn&apos;t have to come from Goodreads.
          </p>
        </div>

        {errorBox}
        {paywallDialog}
      </div>
    );
  }

  // ─── Preview Step ───
  if (step === "preview" && parsed) {
    const statusCounts = { want: 0, reading: 0, finished: 0, dropped: 0 };
    for (const b of parsed.books) statusCounts[b.status]++;

    return (
      <div className="space-y-4">
        <LiveRegion message={announcement} />

        <div className="rounded-3xl border-2 border-hairline bg-surface p-5">
          <h2 className="text-lg font-bold text-fg">
            Ready to add {parsed.books.length} book{parsed.books.length !== 1 ? "s" : ""}
          </h2>
          {parsed.source === "goodreads" && (
            <p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
              ✓ This looks like a Goodreads export
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["want", "reading", "finished", "dropped"] as const).map((s) => (
              <div
                key={s}
                className="rounded-2xl border-2 border-hairline bg-surface-2 p-3 text-center"
              >
                <div className="text-2xl font-bold text-fg">{statusCounts[s]}</div>
                <div className="text-sm capitalize text-fg-muted">
                  {s === "want" ? "Want to read" : s}
                </div>
              </div>
            ))}
          </div>

          {parsed.skipped > 0 && (
            <p className="mt-3 text-sm text-fg-subtle">
              {parsed.skipped} row{parsed.skipped !== 1 ? "s" : ""} skipped — no title found.
            </p>
          )}

          {/* Preview list */}
          <div className="mt-4 max-h-60 overflow-y-auto rounded-2xl border-2 border-hairline">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Preview of the books about to be added
              </caption>
              <thead className="sticky top-0 bg-surface-2">
                <tr>
                  <th scope="col" className="px-3 py-2 font-semibold text-fg-muted">Title</th>
                  <th scope="col" className="px-3 py-2 font-semibold text-fg-muted">Author</th>
                  <th scope="col" className="px-3 py-2 font-semibold text-fg-muted">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {parsed.books.slice(0, 50).map((b, i) => (
                  <tr key={i}>
                    <td className="max-w-[200px] truncate px-3 py-2 text-fg">
                      {b.title}
                    </td>
                    <td className="max-w-[150px] truncate px-3 py-2 text-fg-muted">
                      {b.author ?? "—"}
                    </td>
                    <td className="px-3 py-2 capitalize text-fg-muted">{b.status}</td>
                  </tr>
                ))}
                {parsed.books.length > 50 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-center text-fg-subtle">
                      …and {parsed.books.length - 50} more
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {errorBox}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setParsed(null);
              setStep("upload");
              setError(null);
            }}
            className="tap flex-1 rounded-xl border-2 border-hairline text-sm font-semibold text-fg-muted transition hover:bg-surface-2"
          >
            Back
          </button>
          <button
            type="button"
            onClick={doImport}
            disabled={pending}
            aria-busy={pending}
            className="tap flex-1 rounded-xl bg-accent text-sm font-semibold text-accent-fg transition hover:brightness-110 disabled:opacity-60"
          >
            {pending
              ? "Adding…"
              : `Add ${parsed.books.length} book${parsed.books.length !== 1 ? "s" : ""}`}
          </button>
        </div>

        {paywallDialog}
      </div>
    );
  }

  // ─── Done Step ───
  return (
    <div className="rounded-3xl border-2 border-hairline bg-surface p-8 text-center">
      <LiveRegion message={announcement} />
      <div className="text-5xl" aria-hidden="true">🎉</div>
      <h2 className="mt-4 text-xl font-bold text-fg">All done</h2>
      <p className="mt-2 text-fg-muted">
        {result?.imported ?? 0} book{(result?.imported ?? 0) !== 1 ? "s" : ""} added to your shelf.
        {(result?.skipped ?? 0) > 0 && (
          <> {result!.skipped} were already there, so we skipped them.</>
        )}
      </p>
      <a
        href="/shelf"
        className="tap mt-6 inline-flex items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-accent-fg transition hover:brightness-110"
      >
        View your shelf
      </a>
    </div>
  );
}
