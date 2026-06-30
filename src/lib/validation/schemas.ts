import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const onboardingSchema = z.object({
  display_name: z.string().trim().min(1).max(80),
  timezone: z.string().min(1).max(64),
  yearly_goal_books: z.coerce.number().int().min(0).max(1000),
});

export const profileSchema = z.object({
  display_name: z.string().trim().min(1, "Name can't be empty").max(80),
});

export const addBookSchema = z.object({
  ol_key: z.string().max(200).optional(),
  title: z.string().trim().min(1, "Title is required").max(300),
  author: z.string().trim().max(300).optional(),
  cover_url: z.string().url().max(500).optional().or(z.literal("")),
  total_pages: z.coerce.number().int().positive().max(100000).optional(),
  isbn: z.string().trim().max(20).optional(),
  status: z.enum(["want", "reading", "finished", "dropped"]).default("want"),
});

export const updateStatusSchema = z.object({
  book_id: z.string().uuid(),
  status: z.enum(["want", "reading", "finished", "dropped"]),
});

export const reorderSchema = z.object({
  book_id: z.string().uuid(),
  sort_order: z.coerce.number().int().min(0),
  status: z.enum(["want", "reading", "finished", "dropped"]),
});

export const logSessionSchema = z
  .object({
    book_id: z.string().uuid(),
    pages_read: z.coerce.number().int().min(0).max(100000).default(0),
    end_page: z.coerce.number().int().min(0).max(100000).optional(),
    minutes: z.coerce.number().int().min(0).max(10000).default(0),
    note: z.string().trim().max(2000).optional(),
    // local calendar date in the reader's timezone, YYYY-MM-DD
    session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .refine((v) => v.pages_read > 0 || (v.end_page ?? 0) > 0 || v.minutes > 0, {
    message: "Log at least some pages or time",
  });

export const deleteBookSchema = z.object({ book_id: z.string().uuid() });

export const deleteSessionSchema = z.object({ session_id: z.string().uuid() });

export const importBookSchema = z.object({
  title: z.string().trim().min(1).max(300),
  author: z.string().trim().max(300).nullable().optional(),
  isbn: z.string().trim().max(20).nullable().optional(),
  total_pages: z.coerce.number().int().positive().max(100000).nullable().optional(),
  status: z.enum(["want", "reading", "finished", "dropped"]).default("want"),
});

export const importBooksSchema = z.object({
  // Cap a single import so one paste can't blow up a request.
  books: z.array(importBookSchema).min(1, "No books to import").max(2000),
});
