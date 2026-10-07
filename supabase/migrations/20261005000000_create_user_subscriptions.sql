-- ═══════════════════════════════════════════════════════════════════════
--  USER_SUBSCRIPTIONS — server-side premium truth for StartIELTS
--
--  The active subscription is stored HERE; the signed session cookie only
--  CARRIES a snapshot of this row. Clients can never grant themselves
--  premium: /api/subscription/activate computes expiry server-side and
--  writes this table, and middleware.ts trusts only the signed snapshot.
--
--  Free tests (lib/test-access.ts FREE_TEST_SLUGS) require NO row here —
--  they are open to every authenticated user by design.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.user_subscriptions (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  plan_id          text not null default 'free' check (plan_id in ('free','daily','start','basic','pro')),
  status           text not null default 'free' check (status in ('free','pending_payment','active','expired','cancelled')),
  started_at       timestamptz not null default now(),
  expires_at       timestamptz,
  source           text not null default 'payment' check (source in ('payment','admin','env_grant','demo')),
  payment_order_id text references public.payment_orders(id) on delete set null,
  updated_at       timestamptz not null default now()
);

comment on table public.user_subscriptions is 'Server-side subscription truth. One row per user (PK user_id).';

-- Keep updated_at fresh.
create or replace function public.touch_user_subscription_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_subscriptions_touch on public.user_subscriptions;
create trigger trg_user_subscriptions_touch
  before update on public.user_subscriptions
  for each row execute function public.touch_user_subscription_updated_at();

-- ─── Row Level Security ──────────────────────────────────────────────
alter table public.user_subscriptions enable row level security;

-- Users may READ only their own row (status display).
drop policy if exists "user_subscriptions_select_own" on public.user_subscriptions;
create policy "user_subscriptions_select_own"
  on public.user_subscriptions for select
  using (auth.uid() = user_id);

-- NO insert/update/delete policies for users: writes happen ONLY through
-- the server (service-role key in /api/subscription/activate or the admin
-- panel). This is what makes the access control server-authoritative.

-- Fast lookup by user for API routes.
create index if not exists idx_user_subscriptions_user on public.user_subscriptions(user_id);
create index if not exists idx_user_subscriptions_expires on public.user_subscriptions(expires_at);
