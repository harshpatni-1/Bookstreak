-- BookStreak — honest streaks + freeze system
-- ---------------------------------------------------------------------------
-- Replaces the old "silent grace" rule (which let alternate-day reading inflate
-- streaks indefinitely) with an HONEST model:
--
--   * current_len = the number of days you ACTUALLY read, on consecutive
--     calendar days. A missed day breaks the chain...
--   * ...UNLESS you have a freeze. A freeze is spent automatically to bridge a
--     missed day. Missed (frozen) days do NOT count toward the streak number —
--     the number always equals days you genuinely read.
--   * You EARN 1 freeze for every 7 consecutive read-days, capped at 3.
--     New readers start with 2.
--
-- The engine is a pure replay of session history (like the original), so it is
-- deterministic and self-healing on edits/deletes/back-dated logs.
-- ---------------------------------------------------------------------------

alter table public.streaks
  add column if not exists freezes_available integer not null default 2 check (freezes_available >= 0),
  add column if not exists frozen_days       integer not null default 0 check (frozen_days >= 0),
  add column if not exists last_frozen        boolean not null default false;

-- Tunables (kept as SQL constants inside the function for simplicity).
--   FREEZE_EARN_EVERY = 7   read-days per earned freeze
--   FREEZE_CAP        = 3   max freezes a reader can bank
--   FREEZE_START      = 2   starting balance (default above)

create or replace function public.recalc_streak(p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  c_earn_every constant int := 7;
  c_cap        constant int := 3;
  c_start      constant int := 2;

  v_tz       text;
  v_today    date;
  d          date;
  prev       date;
  v_missed   int;
  v_cur      int := 0;     -- read-days in the current chain
  v_best     int := 0;
  v_last     date;
  v_freezes  int := c_start;
  v_progress int := 0;     -- read-days since last earned freeze
  v_frozen   int := 0;     -- missed days bridged by freezes in the current chain
  v_last_frozen boolean := false;
begin
  select coalesce(timezone,'UTC') into v_tz from public.profiles where id = p_user_id;
  if v_tz is null then v_tz := 'UTC'; end if;
  v_today := (now() at time zone v_tz)::date;

  prev := null;
  for d in
    select distinct session_date
      from public.reading_sessions
     where user_id = p_user_id
     order by session_date
  loop
    if prev is null then
      v_cur := 1;
      v_frozen := 0;
    else
      v_missed := (d - prev) - 1;          -- calendar days skipped between reads
      if v_missed = 0 then
        v_cur := v_cur + 1;                -- perfect consecutive day
      elsif v_missed <= v_freezes then
        v_freezes := v_freezes - v_missed; -- spend freezes to bridge the gap
        v_frozen  := v_frozen + v_missed;
        v_cur     := v_cur + 1;            -- the read day counts; frozen days don't
      else
        -- not enough freezes: chain breaks and restarts at this read day
        v_cur := 1;
        v_frozen := 0;
        v_freezes := c_start;              -- reset to starting balance on a true break
        v_progress := 0;
      end if;
    end if;

    -- earn freezes for sustained reading
    v_progress := v_progress + 1;
    if v_progress >= c_earn_every and v_freezes < c_cap then
      v_freezes  := v_freezes + 1;
      v_progress := 0;
    end if;

    v_best := greatest(v_best, v_cur);
    prev := d;
    v_last := d;
  end loop;

  -- Bring the chain forward to "today": account for days missed since the last
  -- read day. Reading today or yesterday keeps the streak alive with no cost.
  v_last_frozen := false;
  if v_last is null then
    v_cur := 0;
  else
    v_missed := (v_today - v_last) - 1;    -- fully-elapsed missed days (excludes today)
    if v_missed <= 0 then
      null;                                -- read today or yesterday: streak stands
    elsif v_missed <= v_freezes then
      v_freezes := v_freezes - v_missed;   -- auto-freeze the gap to keep it alive
      v_frozen  := v_frozen + v_missed;
      v_last_frozen := true;
    else
      v_cur := 0;                          -- lapsed beyond what freezes can cover
      v_frozen := 0;
    end if;
  end if;

  update public.streaks
     set current_len       = v_cur,
         longest_len       = greatest(longest_len, v_best),
         last_day          = v_last,
         freezes_available = v_freezes,
         frozen_days       = v_frozen,
         last_frozen       = v_last_frozen,
         updated_at        = now()
   where user_id = p_user_id;
end $$;

-- Backfill existing users with the new honest numbers.
do $$
declare r record;
begin
  for r in select user_id from public.streaks loop
    perform public.recalc_streak(r.user_id);
  end loop;
end $$;
