"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { importBooks, type ImportResult } from "@/app/(app)/actions";
import { parseImportCsv, type ParseResult } from "@/lib/import/goodreads";

type Step = "upload" | "preview" | "done";

export function ImportClient() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [pending, start] = useTransition();

  function handleFile(file: File) {
    setError(null);

    if (!file.name.endsWith(".csv")) {
      setError("Please upload a .csv file (you can export one from Goodreads).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Please keep it under 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const res = parseImportCsv(text);

        if (res.books.length === 0) {
          setError(
            "No books found in this file. Make sure it has a header row with a \"Title\" column."
          );
          return;
        }

        setParsed(res);
        setStep("preview");
      } catch {
        setError("Couldn't read this file. Is it a valid CSV?");
      }
    };
    reader.onerror = () => setError("Couldn't read this file. Try again.");
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
      if (!res.ok) {
        setError(res.error ?? "Something went wrong.");
        return;
      }
      setResult(res);
      setStep("done");
      router.refresh();
    });
  }

  // ─── Upload Step ───
  if (step === "upload") {
    return (
      <div className="space-y-4">
        <div
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-12 text-center transition hover:border-brand-400 hover:bg-brand-50/30 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-600"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label="Drop a CSV file here or click to browse"
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileRef.current?.click();
            }
          }}
        >
          <div className="text-4xl" aria-hidden="true">📁</div>
          <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
            Drop your CSV file here
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            or click to browse
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleInputChange}
            aria-label="Upload CSV file"
          />
        </div>

        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            How to export from Goodreads
          </h3>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-xs text-slate-500 dark:text-slate-400">
            <li>
              Go to{" "}
              <span className="font-medium text-slate-700 dark:text-slate-200">
                My Books → Import and Export
              </span>
            </li>
            <li>Click &quot;Export Library&quot;</li>
            <li>Download the CSV and drop it here</li>
          </ol>
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
            Works with any CSV that has a &quot;Title&quot; column — not just Goodreads.
          </p>
        </div>

        {error && (
          <p className="text-sm text-rose-600 dark:text-rose-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  // ─── Preview Step ───
  if (step === "preview" && parsed) {
    const statusCounts = { want: 0, reading: 0, finished: 0, dropped: 0 };
    for (const b of parsed.books) statusCounts[b.status]++;

    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
          <h2 className="text-lg font-bold">
            Ready to import {parsed.books.length} book{parsed.books.length !== 1 ? "s" : ""}
          </h2>
          {parsed.source === "goodreads" && (
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
              ✓ Detected Goodreads format
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["want", "reading", "finished", "dropped"] as const).map((s) => (
              <div key={s} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-950">
                <div className="text-xl font-bold">{statusCounts[s]}</div>
                <div className="text-xs text-slate-500 capitalize">{s === "want" ? "Want to Read" : s}</div>
              </div>
            ))}
          </div>

          {parsed.skipped > 0 && (
            <p className="mt-3 text-xs text-slate-400">
              {parsed.skipped} row{parsed.skipped !== 1 ? "s" : ""} skipped (no title found)
            </p>
          )}

          {/* Preview list */}
          <div className="mt-4 max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-3 py-2 font-medium text-slate-500">Title</th>
                  <th className="px-3 py-2 font-medium text-slate-500">Author</th>
                  <th className="px-3 py-2 font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {parsed.books.slice(0, 50).map((b, i) => (
                  <tr key={i}>
                    <td className="max-w-[200px] truncate px-3 py-2 text-slate-700 dark:text-slate-200">
                      {b.title}
                    </td>
                    <td className="max-w-[150px] truncate px-3 py-2 text-slate-500">
                      {b.author ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-500 capitalize">{b.status}</td>
                  </tr>
                ))}
                {parsed.books.length > 50 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-center text-slate-400">
                      …and {parsed.books.length - 50} more
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {error && (
          <p className="text-sm text-rose-600 dark:text-rose-400" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setParsed(null);
              setStep("upload");
              setError(null);
            }}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Back
          </button>
          <button
            type="button"
            onClick={doImport}
            disabled={pending}
            className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {pending
              ? "Importing…"
              : `Import ${parsed.books.length} book${parsed.books.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    );
  }

  // ─── Done Step ───
  return (
    <div className="rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-slate-900">
      <div className="text-5xl" aria-hidden="true">🎉</div>
      <h2 className="mt-4 text-xl font-bold">Import complete!</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {result?.imported ?? 0} book{(result?.imported ?? 0) !== 1 ? "s" : ""} added to your shelf.
        {(result?.skipped ?? 0) > 0 && (
          <> {result!.skipped} already on your shelf (skipped).</>
        )}
      </p>
      <a
        href="/shelf"
        className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        View your shelf →
      </a>
    </div>
  );
}
