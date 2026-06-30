# 📖 BookStreak

A privacy-first reading-habit tracker. Build daily streaks, log progress in one tap, and finish more books. No AI, no tracking — just the basics done exceptionally well.

**Stack:** Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS · Supabase (Postgres + Auth + RLS).

> **💸 100% free & open source.** BookStreak is completely free for everyone — no paywalls, no limits. Premium features (cloud sync across devices, custom themes, advanced analytics) are coming soon, but the core app will always remain free and open source.

## Why I built this

Most modern reading trackers are bloated, social-first, or sell your reading habits to advertisers. I wanted something **private, fast, and simple**—a tool that does nothing but help you build a consistent reading habit. 

BookStreak is designed to beat a manual Google Sheet by removing daily logging friction (one-tap log) and calculating accurate streaks with built-in grace periods (freezes) directly in the database.

## Features

- Email/password auth with protected routes and a 20-second onboarding flow.
- Bookshelf with 4 statuses (Want / Reading / Finished / Dropped), drag-and-drop, one-click status change, and inline filter.
- Book search & add via the Open Library API, with a shared `book_cache` table and a stale-cache fallback during outages.
- Frictionless **Log Reading** sheet: pages, minutes, current page, note — with confetti on save.
- Automatic streaks (with a one-day grace period), reading progress %, and goal tracking — all computed by Postgres triggers.
- Dashboard with streak card, yearly goal progress, a 17-week contribution heatmap, and "continue reading".
- Stats page: books finished, pages, velocity, hours, and a genre breakdown.
- Dark mode, mobile-first responsive UI, PWA manifest.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Supabase project** at https://supabase.com, then copy your keys:
   ```bash
   cp .env.local.example .env.local
   # fill NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
   ```

3. **Apply the database schema.** Open the Supabase SQL editor and run the contents of
   `supabase/migrations/0001_init.sql` (or `supabase db push` with the CLI). This creates all
   tables, RLS policies, indexes, and the streak/progress automation triggers.

4. **Auth settings.** In Supabase → Authentication → URL Configuration, add
   `http://localhost:3000/auth/callback` as a redirect URL. For local testing you can disable
   email confirmation under Authentication → Providers → Email.

5. **Run it**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 — you'll be routed to login → onboarding → dashboard.

## How automation works

- `reading_sessions` is the source of truth. Every insert/update/delete fires a trigger that
  recomputes the book's `current_page` / `progress_pct` and the user's streak.
- `session_date` is stored as the reader's **local** calendar date (set client-side from the
  browser timezone) so "a day" matches their wall clock.
- The streak function allows a single missed day (grace period) before resetting, to avoid
  punishing readers for one off day.

## Security

- Row Level Security on every user-owned table — a user can only read/write their own rows.
- `book_cache` is world-readable but only writable by the service role (server-side API route).
- All Server Actions validate input with Zod and scope every query by `auth.uid()`.
- The service-role key is server-only and never imported into client code.

## Verification & Testing

Since the core streak logic and stats calculations are handled natively in the database, you can verify your installation by:
1. Log a reading session for today on a book.
2. Verify the `streaks` and `books` tables in your Supabase dashboard update automatically.
3. Check the contribution heatmap on your dashboard reflects the new entry immediately.

## Roadmap

- [ ] **One-tap logging shortcuts**: Quick amounts (`+10`, `+25` pages) from the dashboard.
- [ ] **Data Import**: Goodreads and CSV import to lower switching costs.
- [ ] **Notes & Highlights**: A dedicated UI to view and search annotations (the database schema is already in place).
- [ ] **Shareable Cards**: Export your reading achievements and annual stats heatmaps as images.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Maintainer

- **Harsh Patni** (Sole Developer & Maintainer)

Contributions, feature requests, and bug reports are welcome! Feel free to open an issue or submit a pull request.

