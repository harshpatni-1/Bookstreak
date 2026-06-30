export type ShelfStatus = "want" | "reading" | "finished" | "dropped";

export const SHELF_LABELS: Record<ShelfStatus, string> = {
  want: "Want to Read",
  reading: "Currently Reading",
  finished: "Finished",
  dropped: "Dropped",
};

export const SHELF_ORDER: ShelfStatus[] = ["want", "reading", "finished", "dropped"];

export type Book = {
  id: string;
  user_id: string;
  ol_key: string | null;
  title: string;
  author: string | null;
  cover_url: string | null;
  total_pages: number | null;
  isbn: string | null;
  tags: string[];
  status: ShelfStatus;
  current_page: number;
  progress_pct: number;
  sort_order: number;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReadingSession = {
  id: string;
  user_id: string;
  book_id: string;
  session_date: string;
  pages_read: number;
  end_page: number | null;
  minutes: number;
  note: string | null;
  created_at: string;
};

export type Streak = {
  user_id: string;
  current_len: number;
  longest_len: number;
  last_day: string | null;
  freezes_available: number;
  frozen_days: number;
  last_frozen: boolean;
};

export type Profile = {
  id: string;
  display_name: string | null;
  timezone: string;
  yearly_goal_books: number;
  weekly_goal_pages: number;
  onboarded: boolean;
  theme: "light" | "dark" | "system";
};

export type BookSearchResult = {
  ol_key: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  pages: number | null;
  isbn: string | null;
  description: string | null;
  subjects: string[];
};
