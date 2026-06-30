import { NextResponse, type NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { BookSearchResult } from "@/lib/types";

const OL_TIMEOUT_MS = 6000;

function coverUrl(coverId: number | undefined, isbn: string | undefined): string | null {
  if (coverId) return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
  if (isbn) return `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
  return null;
}

export async function GET(request: NextRequest) {
  // Require an authenticated session — this route also writes to the shared cache.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 120);
  if (q.length < 2) return NextResponse.json({ results: [] });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OL_TIMEOUT_MS);

  try {
    const url =
      "https://openlibrary.org/search.json?limit=12&fields=key,title,author_name,cover_i,first_publish_year,number_of_pages_median,isbn,subject&q=" +
      encodeURIComponent(q);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "BookStreak/1.0 (reading habit app)" },
    });

    if (!res.ok) throw new Error(`Open Library ${res.status}`);
    const data = await res.json();

    const results: BookSearchResult[] = (data.docs ?? []).map((doc: any) => {
      const isbn: string | undefined = Array.isArray(doc.isbn) ? doc.isbn[0] : undefined;
      return {
        ol_key: doc.key,
        title: doc.title ?? "Untitled",
        author: Array.isArray(doc.author_name) ? doc.author_name[0] : null,
        cover_url: coverUrl(doc.cover_i, isbn),
        pages: typeof doc.number_of_pages_median === "number" ? doc.number_of_pages_median : null,
        isbn: isbn ?? null,
        description: null,
        subjects: Array.isArray(doc.subject) ? doc.subject.slice(0, 6) : [],
      };
    });

    // Best-effort populate the shared cache; never block the response on it.
    if (results.length) {
      const service = createServiceClient();
      service
        .from("book_cache")
        .upsert(
          results.map((r) => ({
            ol_key: r.ol_key,
            title: r.title,
            author: r.author,
            cover_url: r.cover_url,
            pages: r.pages,
            isbn: r.isbn,
            subjects: r.subjects,
          })),
          { onConflict: "ol_key" }
        )
        .then(() => {});
    }

    return NextResponse.json({ results });
  } catch {
    // Fallback: serve stale cache rows so search still works during an OL outage.
    const service = createServiceClient();
    const { data: cached } = await service
      .from("book_cache")
      .select("ol_key,title,author,cover_url,pages,isbn,description,subjects")
      .ilike("title", `%${q}%`)
      .limit(12);
    return NextResponse.json({ results: cached ?? [], stale: true });
  } finally {
    clearTimeout(timeout);
  }
}
