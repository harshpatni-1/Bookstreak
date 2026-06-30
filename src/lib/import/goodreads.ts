import type { ShelfStatus } from "@/lib/types";

// A single book ready to be imported. Mirrors the columns `importBooks` inserts.
export type ParsedImportBook = {
  title: string;
  author: string | null;
  isbn: string | null;
  total_pages: number | null;
  status: ShelfStatus;
};

export type ParseResult = {
  books: ParsedImportBook[];
  totalRows: number; // data rows seen (excluding header)
  skipped: number; // rows we couldn't use (no title)
  source: "goodreads" | "generic";
};

/**
 * Parse one CSV record-aware string into rows of cells.
 * Handles quoted fields, embedded commas/newlines, and "" escaped quotes —
 * which is exactly the format Goodreads (and Excel) export.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  // Strip a UTF-8 BOM if present so the first header doesn't get mangled.
  const s = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];

    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          cell += '"';
          i++; // skip the escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        cell += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      // Handle \r\n as a single break; ignore a lone \r followed by \n.
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      // Skip fully-empty trailing rows.
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      cell += c;
    }
  }
  // Flush the final cell/row if the file didn't end on a newline.
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    if (row.length > 1 || row[0] !== "") rows.push(row);
  }
  return rows;
}

// Goodreads wraps ISBNs as ="0743273567" to stop Excel mangling them.
function cleanIsbn(raw: string | undefined): string | null {
  if (!raw) return null;
  const v = raw.replace(/^="?|"?$/g, "").trim();
  return v.length ? v.slice(0, 20) : null;
}

function toStatus(exclusiveShelf: string | undefined): ShelfStatus {
  switch ((exclusiveShelf ?? "").trim().toLowerCase()) {
    case "read":
      return "finished";
    case "currently-reading":
      return "reading";
    case "to-read":
      return "want";
    default:
      return "want";
  }
}

function toPages(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = parseInt(raw.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 100000) : null;
}

/**
 * Turn raw CSV text into importable books. Understands the Goodreads export
 * format natively, and falls back to a generic Title/Author/ISBN/Pages mapping
 * for any other spreadsheet a reader might hand us.
 */
export function parseImportCsv(text: string): ParseResult {
  const rows = parseCsv(text);
  if (rows.length < 2) {
    return { books: [], totalRows: 0, skipped: 0, source: "generic" };
  }

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);

  const titleI = idx("title");
  const authorI = idx("author");
  const isbnI = idx("isbn13") !== -1 ? idx("isbn13") : idx("isbn");
  const pagesI = idx("number of pages") !== -1 ? idx("number of pages") : idx("pages");
  const shelfI = idx("exclusive shelf");

  const source: ParseResult["source"] = shelfI !== -1 ? "goodreads" : "generic";

  const books: ParsedImportBook[] = [];
  let skipped = 0;
  const dataRows = rows.slice(1);

  for (const r of dataRows) {
    const title = (titleI !== -1 ? r[titleI] : r[0] ?? "").trim();
    if (!title) {
      skipped++;
      continue;
    }
    const author = (authorI !== -1 ? r[authorI] : r[1] ?? "")?.trim() || null;
    books.push({
      title: title.slice(0, 300),
      author: author ? author.slice(0, 300) : null,
      isbn: cleanIsbn(isbnI !== -1 ? r[isbnI] : undefined),
      total_pages: toPages(pagesI !== -1 ? r[pagesI] : undefined),
      status: toStatus(shelfI !== -1 ? r[shelfI] : undefined),
    });
  }

  return { books, totalRows: dataRows.length, skipped, source };
}
