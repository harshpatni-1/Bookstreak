-- BookStreak — initial schema
-- Privacy-first reading habit tracker.
-- All user data is protected by Row Level Security; a user can only ever see their own rows.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles : one row per auth user, created automatically on signup
-- ---------------------------------------------------------------------------
create table public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  display_name      text,
  -- IANA timezone (e.g. "America/New_York"). Streaks are computed in this zone
  -- so a "day" matches the reader's local midnight, not UTC.
  timezone          text not null default 'UTC',
  yearly_goal_books integer not null default 12 check (yearly_goal_books >= 0),
  weekly_goal_pages integer not null default 0  check (weekly_goal_pages >= 0),
  onboarded         boolean not null default false,
  theme             text not null default 'system' check (theme in ('light','dark','system')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- book_cache : shared, public metadata fetched from Open Library.
-- Not user-owned. Readable by everyone; written only via the service role
-- (server-side API route) to avoid hammering Open Library and to survive
-- their rate limits with a stale fallback.
-- ---------------------------------------------------------------------------
create table public.book_cache (
  ol_key       text primary key,          -- Open Library work/edition key
  title        text not null,
  author       text,
  cover_url    text,
  pages        integer check (pages is null or pages > 0),
  isbn         text,
  description  text,
  subjects     text[] not null default '{}',
  fetched_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- books : a reader's personal shelf entry. May or may not be backed by cache.
-- ---------------------------------------------------------------------------
create type public.shelf_status as enum ('want','reading','finished','dropped');

create table public.books (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  ol_key         text references public.book_cache(ol_key) on delete set null,
  title          text not null,
  author         text,
  cover_url      text,
  total_pages    integer check (total_pages is null or total_pages > 0),
  isbn           text,
  tags           text[] not null default '{}',
  status         public.shelf_status not null default 'want',
  -- denormalised progress, maintained by trigger from reading_sessions
  current_page   integer not null default 0 check (current_page >= 0),
  progress_pct   numeric(5,2) not null default 0 check (progress_pct between 0 and 100),
  sort_order     integer not null default 0,
  started_at     timestamptz,
  finished_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index books_user_status_idx on public.books (user_id, status, sort_order);
create index books_user_updated_idx on public.books (user_id, updated_at desc);

-- ---------------------------------------------------------------------------
-- reading_sessions : the atomic unit of progress. One row per logged reading.
-- session_date is a DATE in the user's local timezone (computed client/server
-- side at insert time) so streak math lines up with the reader's calendar.
-- ---------------------------------------------------------------------------
create table public.reading_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  book_id       uuid not null references public.books(id) on delete cascade,
  session_date  date not null,
  pages_read    integer not null default 0 check (pages_read >= 0),
  end_page      integer check (end_page is null or end_page >= 0),
  minutes       integer not null default 0 check (minutes >= 0),
  note          text,
  created_at    timestamptz not null default now()
);

create index sessions_user_date_idx on public.reading_sessions (user_id, session_date);
-- dedicated index for streak scans which only need date ordering per user
create index sessions_date_idx on public.reading_sessions (session_date);
create index sessions_book_idx on public.reading_sessions (book_id, created_at desc);

-- ---------------------------------------------------------------------------
-- notes : quotes & reflections per book
-- ---------------------------------------------------------------------------
create table public.notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  book_id     uuid not null references public.books(id) on delete cascade,
  kind        text not null default 'note' check (kind in ('note','quote')),
  page        integer check (page is null or page >= 0),
  body        text not null,
  created_at  timestamptz not null default now()
);

create index notes_book_idx on public.notes (book_id, created_at desc);

-- ---------------------------------------------------------------------------
-- streaks : one cached row per user (current + longest)
-- ---------------------------------------------------------------------------
create table public.streaks (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  current_len   integer not null default 0,
  longest_len   integer not null default 0,
  last_day      date,
  updated_at    timestamptz not null default now()
);

-- ===========================================================================
-- Automation: triggers & functions
-- ===========================================================================

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger books_touch before update on public.books
  for each row execute function public.touch_updated_at();

-- create profile + empty streak row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
    values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  insert into public.streaks (user_id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Recompute a book's current_page / progress_pct / status timestamps from its sessions.
create or replace function public.recalc_book_progress(p_book_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_total int;
  v_max_end int;
  v_sum_pages int;
  v_current int;
begin
  select total_pages into v_total from public.books where id = p_book_id;

  select max(end_page), coalesce(sum(pages_read),0)
    into v_max_end, v_sum_pages
    from public.reading_sessions where book_id = p_book_id;

  -- prefer explicit end_page markers; otherwise accumulate pages_read
  v_current := greatest(coalesce(v_max_end,0), coalesce(v_sum_pages,0));

  update public.books
    set current_page = v_current,
        progress_pct = case
          when v_total is null or v_total = 0 then 0
          else least(100, round(v_current::numeric * 100 / v_total, 2))
        end,
        started_at = coalesce(started_at, now())
    where id = p_book_id;
end $$;

-- Recompute the user's streak.
-- session_date is stored as the reader's LOCAL calendar date (see table comment),
-- so consecutive distinct session_date values one day apart form a streak.
-- Grace period: a single missed day does NOT break the streak — readers get one
-- "free" gap between reading days so an off day doesn't kill motivation. Two or
-- more consecutive missed days resets the current streak.
create or replace function public.recalc_streak(p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_tz text;
  v_today date;
  d date;
  prev date;
  v_cur int := 0;
  v_best int := 0;
  v_last date;
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
    elsif d - prev <= 2 then   -- 1 day apart = perfect, 2 = within grace window
      v_cur := v_cur + 1;
    else
      v_cur := 1;
    end if;
    v_best := greatest(v_best, v_cur);
    prev := d;
    v_last := d;
  end loop;

  -- if the most recent reading day is too far in the past, current streak lapses
  if v_last is null or (v_today - v_last) > 2 then
    v_cur := 0;
  end if;

  update public.streaks
     set current_len = v_cur,
         longest_len = greatest(longest_len, v_best),
         last_day    = v_last,
         updated_at  = now()
   where user_id = p_user_id;
end $$;

-- Fire both recalcs whenever sessions change.
create or replace function public.on_session_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_user uuid;
  v_book uuid;
begin
  v_user := coalesce(new.user_id, old.user_id);
  v_book := coalesce(new.book_id, old.book_id);
  perform public.recalc_book_progress(v_book);
  perform public.recalc_streak(v_user);
  return coalesce(new, old);
end $$;

create trigger sessions_after_change
  after insert or update or delete on public.reading_sessions
  for each row execute function public.on_session_change();

-- When a book is marked finished, stamp finished_at.
create or replace function public.on_book_status()
returns trigger language plpgsql as $$
begin
  if new.status = 'finished' and (old.status is distinct from 'finished') then
    new.finished_at := now();
  elsif new.status <> 'finished' then
    new.finished_at := null;
  end if;
  return new;
end $$;

create trigger books_status_stamp before update on public.books
  for each row execute function public.on_book_status();

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.profiles         enable row level security;
alter table public.books            enable row level security;
alter table public.reading_sessions enable row level security;
alter table public.notes            enable row level security;
alter table public.streaks          enable row level security;
alter table public.book_cache       enable row level security;

-- profiles: owner-only
create policy "profiles self read"  on public.profiles for select using (auth.uid() = id);
create policy "profiles self write" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- books: owner-only full CRUD
create policy "books owner all" on public.books
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- reading_sessions: owner-only
create policy "sessions owner all" on public.reading_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- notes: owner-only
create policy "notes owner all" on public.notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- streaks: owner read only (writes happen via security-definer functions)
create policy "streaks owner read" on public.streaks for select using (auth.uid() = user_id);

-- book_cache: world-readable metadata, writes restricted to service role
create policy "book_cache public read" on public.book_cache for select using (true);
create policy "book_cache service write" on public.book_cache
  for all to service_role using (true) with check (true);
