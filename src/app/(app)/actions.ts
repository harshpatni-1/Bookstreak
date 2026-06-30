"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  addBookSchema,
  updateStatusSchema,
  reorderSchema,
  logSessionSchema,
  deleteBookSchema,
  importBooksSchema,
  deleteSessionSchema,
} from "@/lib/validation/schemas";

export type ActionResult = { ok: boolean; error?: string };
export type ImportResult = ActionResult & { imported?: number; skipped?: number };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

export async function addBook(input: unknown): Promise<ActionResult> {
  const parsed = addBookSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  try {
    const { supabase, user } = await requireUser();
    const d = parsed.data;
    const { error } = await supabase.from("books").insert({
      user_id: user.id,
      ol_key: d.ol_key || null,
      title: d.title,
      author: d.author || null,
      total_pages: d.total_pages ?? null,
      isbn: d.isbn || null,
      status: d.status,
      finished_at: d.status === "finished" ? new Date().toISOString() : null,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/shelf");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateStatus(input: unknown): Promise<ActionResult> {
  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  try {
    const { supabase, user } = await requireUser();
    const { error } = await supabase
      .from("books")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.book_id)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/shelf");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function reorderBook(input: unknown): Promise<ActionResult> {
  const parsed = reorderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  try {
    const { supabase, user } = await requireUser();
    const { error } = await supabase
      .from("books")
      .update({ sort_order: parsed.data.sort_order, status: parsed.data.status })
      .eq("id", parsed.data.book_id)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/shelf");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteBook(input: unknown): Promise<ActionResult> {
  const parsed = deleteBookSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  try {
    const { supabase, user } = await requireUser();
    const { error } = await supabase
      .from("books")
      .delete()
      .eq("id", parsed.data.book_id)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/shelf");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function importBooks(input: unknown): Promise<ImportResult> {
  const parsed = importBooksSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  try {
    const { supabase, user } = await requireUser();

    // Skip books already on the shelf (same title, case-insensitive) so a
    // re-import never creates duplicates — the number on screen stays honest.
    const { data: existing } = await supabase
      .from("books")
      .select("title")
      .eq("user_id", user.id);
    const seen = new Set(
      (existing ?? []).map((b) => b.title.trim().toLowerCase())
    );

    const rows = [];
    for (const b of parsed.data.books) {
      const key = b.title.trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({
        user_id: user.id,
        title: b.title,
        isbn: b.isbn ?? null,
        total_pages: b.total_pages ?? null,
        status: b.status,
        finished_at: b.status === "finished" ? new Date().toISOString() : null,
      });
    }

    const skipped = parsed.data.books.length - rows.length;
    if (rows.length === 0) {
      return { ok: true, imported: 0, skipped };
    }

    const { error } = await supabase.from("books").insert(rows);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/shelf");
    revalidatePath("/dashboard");
    revalidatePath("/stats");
    return { ok: true, imported: rows.length, skipped };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function logSession(input: unknown): Promise<ActionResult> {
  const parsed = logSessionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  try {
    const { supabase, user } = await requireUser();
    const d = parsed.data;

    // Ownership check + move book into "reading" if it was only wishlisted.
    const { data: book } = await supabase
      .from("books")
      .select("id, status")
      .eq("id", d.book_id)
      .eq("user_id", user.id)
      .single();
    if (!book) return { ok: false, error: "Book not found" };

    const { error } = await supabase.from("reading_sessions").insert({
      user_id: user.id,
      book_id: d.book_id,
      session_date: d.session_date,
      pages_read: d.pages_read,
      end_page: d.end_page ?? null,
      minutes: d.minutes,
      note: d.note || null,
    });
    if (error) return { ok: false, error: error.message };

    if (book.status === "want") {
      await supabase
        .from("books")
        .update({ status: "reading" })
        .eq("id", d.book_id)
        .eq("user_id", user.id);
    }

    revalidatePath("/shelf");
    revalidatePath("/dashboard");
    revalidatePath("/stats");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function getDaySessions(date: string) {
  try {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from("reading_sessions")
      .select("*, books(title, author, cover_url)")
      .eq("user_id", user.id)
      .eq("session_date", date)
      .order("created_at", { ascending: true });
    
    if (error) return { error: error.message, data: null };
    return { data, error: null };
  } catch (e) {
    return { error: (e as Error).message, data: null };
  }
}

export async function deleteSession(input: unknown): Promise<ActionResult> {
  const parsed = deleteSessionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  try {
    const { supabase, user } = await requireUser();
    const { error } = await supabase
      .from("reading_sessions")
      .delete()
      .eq("id", parsed.data.session_id)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/shelf");
    revalidatePath("/dashboard");
    revalidatePath("/stats");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
