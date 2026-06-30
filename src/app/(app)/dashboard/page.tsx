import { createClient } from "@/lib/supabase/server";
import { isoDaysAgo } from "@/lib/date";
import { streakMessage } from "@/lib/streakMessage";
import { Heatmap } from "@/components/Heatmap";
import { ContinueReading } from "./ContinueReading";
import { QuickLogToday } from "./QuickLogToday";
import { StatCard } from "@/components/StatCard";
import { ShareStreakCard } from "@/components/ShareStreakCard";
import type { Book } from "@/lib/types";

// Today's calendar date in an IANA timezone, as YYYY-MM-DD (matches session_date).
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

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: profile, error: errProfile },
    { data: streak, error: errStreak },
    { data: reading, error: errReading },
    { data: sessions, error: errSessions },
    { count: finishedCount, error: errFinished },
    { data: yearSessions, error: errYear },
  ] = await Promise.all([
      supabase.from("profiles").select("display_name, yearly_goal_books, timezone").eq("id", user!.id).single(),
      supabase
        .from("streaks")
        .select("*")
        .eq("user_id", user!.id)
        .single(),
      supabase
        .from("books")
        .select("*")
        .eq("user_id", user!.id)
        .eq("status", "reading")
        .order("updated_at", { ascending: false })
        .limit(6),
      supabase
        .from("reading_sessions")
        .select("session_date")
        .eq("user_id", user!.id)
        .gte("session_date", isoDaysAgo(17 * 7)),
      supabase
        .from("books")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("status", "finished")
        .gte("finished_at", `${new Date().getFullYear()}-01-01`),
      supabase
        .from("reading_sessions")
        .select("pages_read")
        .eq("user_id", user!.id)
        .gte("session_date", `${new Date().getFullYear()}-01-01`),
    ]);

  if (errStreak) console.error("Streak fetch error:", errStreak);
  if (errFinished) console.error("Finished count error:", errFinished);

  const current = streak?.current_len ?? 0;
  const longest = streak?.longest_len ?? 0;
  const freezes = streak?.freezes_available ?? 0;
  const lastFrozen = streak?.last_frozen ?? false;
  const goal = profile?.yearly_goal_books ?? 12;
  const finished = finishedCount ?? 0;
  const goalPct = goal > 0 ? Math.min(100, Math.round((finished / goal) * 100)) : 0;

  const counts: Record<string, number> = {};
  for (const s of sessions ?? []) counts[s.session_date] = (counts[s.session_date] ?? 0) + 1;

  const pagesThisYear = (yearSessions ?? []).reduce(
    (n: number, s: { pages_read: number }) => n + (s.pages_read ?? 0),
    0,
  );
  const readingBooks = (reading ?? []) as Book[];
  const todayStr = todayInTz(profile?.timezone ?? "UTC");
  const readToday = (counts[todayStr] ?? 0) > 0;
  const lastBook = readingBooks[0] ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Hi {profile?.display_name ?? "Reader"} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {streakMessage(current, longest, { lastFrozen, freezes })}
        </p>
      </div>

      <QuickLogToday lastBook={lastBook} readToday={readToday} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white">
          <p className="text-sm opacity-90">Current streak</p>
          <p className="mt-1 text-4xl font-bold">
            {current}
            <span className="ml-1 text-lg font-normal">days 🔥</span>
          </p>
          <p className="mt-1 text-xs opacity-80">Longest: {longest} days</p>
          <p
            className="mt-2 text-xs opacity-90"
            title="Earn 1 freeze every 7 days you read (max 3). A freeze auto-covers a missed day so your streak survives."
          >
            {"❄️".repeat(freezes)}
            {freezes === 0 ? "No freezes — don't miss a day" : ` ${freezes} freeze${freezes === 1 ? "" : "s"} banked`}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800/80 dark:border dark:border-slate-700/50">
          <p className="text-sm text-slate-500 dark:text-slate-400">{new Date().getFullYear()} goal</p>
          <p className="mt-1 text-3xl font-bold">
            {finished}
            <span className="text-lg font-normal text-slate-400">/{goal}</span>
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${goalPct}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-300">{goalPct}% of your books</p>
        </div>

        <StatCard
          icon="📖"
          label="Reading now"
          value={readingBooks.length}
          sublabel="books in progress"
        />
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800/80 dark:border dark:border-slate-700/50">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Last 17 weeks</h2>
          <ShareStreakCard
            displayName={profile?.display_name ?? "Reader"}
            current={current}
            longest={longest}
            finished={finished}
            pages={pagesThisYear}
            counts={counts}
            year={new Date().getFullYear()}
          />
        </div>
        <Heatmap counts={counts} />
      </div>

      <ContinueReading books={readingBooks} />
    </div>
  );
}
