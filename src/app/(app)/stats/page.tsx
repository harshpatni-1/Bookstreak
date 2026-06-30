import { createClient } from "@/lib/supabase/server";
import { StatCard, type Trend } from "@/components/StatCard";
import type { Book, ReadingSession } from "@/lib/types";

export const dynamic = "force-dynamic";

function topGenres(books: Book[]): { name: string; count: number }[] {
  const tally: Record<string, number> = {};
  for (const b of books) for (const t of b.tags ?? []) tally[t] = (tally[t] ?? 0) + 1;
  return Object.entries(tally)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function todayInTz(tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function daysAgoStr(base: string, n: number): string {
  const d = new Date(`${base}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: books }, { data: sessions }, { data: profile }] = await Promise.all([
    supabase.from("books").select("*").eq("user_id", user!.id),
    supabase.from("reading_sessions").select("*").eq("user_id", user!.id),
    supabase.from("profiles").select("timezone").eq("id", user!.id).single(),
  ]);

  const allBooks = (books ?? []) as Book[];
  const allSessions = (sessions ?? []) as ReadingSession[];

  const finished = allBooks.filter((b) => b.status === "finished").length;
  const totalPages = allSessions.reduce((n, s) => n + s.pages_read, 0);
  const totalMinutes = allSessions.reduce((n, s) => n + s.minutes, 0);
  const readingDays = new Set(allSessions.map((s) => s.session_date)).size;
  const velocity = readingDays > 0 ? Math.round(totalPages / readingDays) : 0;

  // Week-over-week pages: this week (last 7 days) vs the 7 days before that.
  const today = todayInTz(profile?.timezone ?? "UTC");
  const weekStart = daysAgoStr(today, 6); // inclusive 7-day window
  const prevStart = daysAgoStr(today, 13);
  const prevEnd = daysAgoStr(today, 7);
  let thisWeek = 0;
  let lastWeek = 0;
  for (const s of allSessions) {
    if (s.session_date >= weekStart && s.session_date <= today) thisWeek += s.pages_read;
    else if (s.session_date >= prevStart && s.session_date <= prevEnd) lastWeek += s.pages_read;
  }
  const weekTrend: Trend = {
    pct: lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : null,
    label: "vs last week",
  };

  const genres = topGenres(allBooks);
  const maxGenre = genres[0]?.count ?? 1;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Your stats</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard icon="✅" label="Books finished" value={finished} />
        <StatCard
          icon="📄"
          label="Pages read"
          value={totalPages.toLocaleString()}
          sublabel={`${thisWeek.toLocaleString()} this week`}
          trend={weekTrend}
        />
        <StatCard icon="📆" label="Reading days" value={readingDays} />
        <StatCard icon="⚡" label="Pages / reading day" value={velocity} />
        <StatCard icon="⏱️" label="Hours read" value={Math.round(totalMinutes / 60)} />
        <StatCard icon="📝" label="Sessions logged" value={allSessions.length} />
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold">Genres</h2>
        {genres.length === 0 ? (
          <p className="text-sm text-slate-400">
            Add tags to your books to see a genre breakdown.
          </p>
        ) : (
          <div className="space-y-2">
            {genres.map((g) => (
              <div key={g.name} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-xs text-slate-500">{g.name}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${(g.count / maxGenre) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs text-slate-400">{g.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
