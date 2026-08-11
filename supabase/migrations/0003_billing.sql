-- BookStreak — billing, trials, and server-enforced entitlement
-- ---------------------------------------------------------------------------
-- Model: every reader gets a 14-day full-feature trial on signup. After that,
-- an active subscription (monthly) or a lifetime purchase is required to LOG
-- NEW READING. Reading history is never held hostage — SELECT and DELETE stay
-- open forever, so an expired reader can always view, export, and delete their
-- own data. Only the INSERT/UPDATE path is gated.
--
-- Entitlement is enforced in the DATABASE, not just the UI. Even a caller
-- holding a valid anon key and a real session cannot insert a session without
-- a live entitlement, because the RLS policy calls has_pro().
-- ---------------------------------------------------------------------------

create type public.billing_plan   as enum ('trial','monthly','lifetime');
create type public.billing_status as enum ('trialing','active','past_due','canceled','expired');

create table public.subscriptions (
  user_id                uuid primary key references auth.users(id) on delete cascade,
  plan                   public.billing_plan   not null default 'trial',
  status                 public.billing_status not null default 'trialing',

  trial_ends_at          timestamptz,
  -- paid access is valid until this instant; null for lifetime (never expires)
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,

  stripe_customer_id     text unique,
  stripe_subscription_id text unique,

  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index subscriptions_customer_idx on public.subscriptions (stripe_customer_id);

create trigger subscriptions_touch before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Webhook idempotency. Stripe retries deliveries and can send events out of
-- order; recording processed event ids makes replays harmless.
-- ---------------------------------------------------------------------------
create table public.billing_events (
  id           text primary key,          -- Stripe event id (evt_...)
  type         text not null,
  processed_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- has_pro : the single source of truth for "may this reader log new sessions?"
--
-- security definer so it can read subscriptions from inside an RLS policy
-- evaluated as the calling user. stable so Postgres can cache it per statement.
-- ---------------------------------------------------------------------------
create or replace function public.has_pro(p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions s
     where s.user_id = p_user_id
       and (
         -- lifetime: paid once, never expires
         (s.plan = 'lifetime' and s.status = 'active')
         -- trial: still inside the window
         or (s.status = 'trialing' and s.trial_ends_at > now())
         -- active subscription (current_period_end null == no known expiry yet)
         or (s.status = 'active'
             and (s.current_period_end is null or s.current_period_end > now()))
         -- payment failed: 3-day grace so a declined card doesn't break a streak
         or (s.status = 'past_due'
             and s.current_period_end is not null
             and s.current_period_end > now() - interval '3 days')
       )
  );
$$;

revoke all on function public.has_pro(uuid) from public;
grant execute on function public.has_pro(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Give every new reader a 14-day trial. Extends the existing signup trigger.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
    values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  insert into public.streaks (user_id) values (new.id);
  insert into public.subscriptions (user_id, plan, status, trial_ends_at)
    values (new.id, 'trial', 'trialing', now() + interval '14 days');
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- RLS. Replace the blanket "owner all" on reading_sessions with split policies:
-- reads and deletes always allowed; new writes require entitlement.
-- ---------------------------------------------------------------------------
alter table public.subscriptions  enable row level security;
alter table public.billing_events enable row level security;

-- a reader may see their own billing state; only the service role writes it
-- (via the signature-verified Stripe webhook). No client-side write path.
create policy "subscriptions self read" on public.subscriptions
  for select using (auth.uid() = user_id);
create policy "subscriptions service write" on public.subscriptions
  for all to service_role using (true) with check (true);

-- billing_events is service-role only; no policy for authenticated users.
create policy "billing_events service" on public.billing_events
  for all to service_role using (true) with check (true);

drop policy if exists "sessions owner all" on public.reading_sessions;

-- Always readable and deletable by the owner, entitlement or not.
create policy "sessions owner read" on public.reading_sessions
  for select using (auth.uid() = user_id);

create policy "sessions owner delete" on public.reading_sessions
  for delete using (auth.uid() = user_id);

-- Gated: logging new reading requires a live trial or subscription.
create policy "sessions owner insert with entitlement" on public.reading_sessions
  for insert with check (auth.uid() = user_id and public.has_pro(auth.uid()));

create policy "sessions owner update with entitlement" on public.reading_sessions
  for update using (auth.uid() = user_id and public.has_pro(auth.uid()))
      with check (auth.uid() = user_id and public.has_pro(auth.uid()));

-- Adding books is also a write; gate it the same way but keep reads/deletes open
-- so an expired reader can still curate and export their shelf.
drop policy if exists "books owner all" on public.books;

create policy "books owner read" on public.books
  for select using (auth.uid() = user_id);

create policy "books owner delete" on public.books
  for delete using (auth.uid() = user_id);

create policy "books owner insert with entitlement" on public.books
  for insert with check (auth.uid() = user_id and public.has_pro(auth.uid()));

-- Status changes / reordering stay open: they are curation, not new data, and
-- blocking them would trap a reader with a shelf they cannot tidy.
create policy "books owner update" on public.books
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Backfill. Existing readers get a fresh 14-day trial from migration time so
-- nobody is locked out the moment this ships.
-- ---------------------------------------------------------------------------
insert into public.subscriptions (user_id, plan, status, trial_ends_at)
select p.id, 'trial', 'trialing', now() + interval '14 days'
  from public.profiles p
 where not exists (select 1 from public.subscriptions s where s.user_id = p.id);
