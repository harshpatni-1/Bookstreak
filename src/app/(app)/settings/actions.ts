"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validation/schemas";

export type SettingsState = { error?: string; ok?: boolean } | undefined;

export async function updateProfile(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const parsed = profileSchema.safeParse({
    display_name: formData.get("display_name"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // upsert so the row is created if the signup trigger never ran
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...parsed.data }, { onConflict: "id" });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * CSV escaping per RFC 4180: wrap every field in quotes and double any quote
 * inside it. Without this, a note containing a comma silently splits into two
 * columns and the reader's export is quietly corrupted.
 */
function csvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  return `"${String(value).replace(/"/g, '""')}"`;
}

export type ExportResult =
  | { ok: true; csv: string; filename: string; rows: number }
  | { ok: false; error: string };

/**
 * Exports the reader's full reading history as CSV.
 *
 * Deliberately NOT entitlement-gated. 0003_billing.sql leaves SELECT open
 * forever precisely so that an expired reader can still retrieve their own
 * data — the upgrade page promises exactly this, and gating it here would make
 * that promise false. CSV rather than JSON because it opens in Excel and Google
 * Sheets without any technical knowledge.
 */
export async function exportReadingData(): Promise<ExportResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again to export." };

  const { data, error } = await supabase
    .from("reading_sessions")
    .select("session_date, pages_read, minutes, end_page, note, books(title, author)")
    .eq("user_id", user.id)
    .order("session_date", { ascending: true });

  if (error) return { ok: false, error: error.message };

  type Row = {
    session_date: string;
    pages_read: number | null;
    minutes: number | null;
    end_page: number | null;
    note: string | null;
    // A joined row arrives as an object, but the generated types can widen it
    // to an array; handle both so a shape change can't crash the export.
    books: { title: string; author: string | null } | { title: string; author: string | null }[] | null;
  };

  const header = [
    "Date",
    "Book",
    "Author",
    "Pages read",
    "Minutes",
    "Ended on page",
    "Note",
  ]
    .map(csvField)
    .join(",");

  const lines = ((data ?? []) as Row[]).map((r) => {
    const book = Array.isArray(r.books) ? r.books[0] : r.books;
    return [
      csvField(r.session_date),
      csvField(book?.title ?? ""),
      csvField(book?.author ?? ""),
      csvField(r.pages_read ?? 0),
      csvField(r.minutes ?? 0),
      csvField(r.end_page ?? ""),
      csvField(r.note ?? ""),
    ].join(",");
  });

  // Leading BOM so Excel opens UTF-8 accented author names correctly rather
  // than as mojibake.
  const csv = `﻿${[header, ...lines].join("\r\n")}`;
  const today = new Date().toISOString().slice(0, 10);

  return {
    ok: true,
    csv,
    filename: `bookstreak-reading-history-${today}.csv`,
    rows: lines.length,
  };
}
