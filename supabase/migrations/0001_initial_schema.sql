create extension if not exists pgcrypto;

create type public.withdrawal_status as enum ('PENDING','PROCESSING','APPROVED','PAID','REJECTED','CANCELLED');
create type public.reward_kind as enum ('SIGNUP_BONUS','REFERRAL_BONUS','ADMIN_ADJUSTMENT','REVERSAL');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  referral_code text not null unique default upper(substr(encode(gen_random_bytes(6),'hex'),1,10)),
  phone text,
  suspended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.wallets (user_id uuid primary key references public.profiles(id) on delete cascade, balance bigint not null default 0 check (balance >= 0), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.referrals (id uuid primary key default gen_random_uuid(), sponsor_id uuid not null references public.profiles(id), referred_id uuid not null unique references public.profiles(id), referral_code text not null, qualified_at timestamptz, created_at timestamptz not null default now(), check (sponsor_id <> referred_id));
create table public.referral_events (id uuid primary key default gen_random_uuid(), referral_code text not null, visitor_id uuid, ip_hash text, user_agent_hash text, event_type text not null check (event_type in ('VISIT','SIGNUP','QUALIFIED')), created_at timestamptz not null default now());
create table public.qualified_visits (id uuid primary key default gen_random_uuid(), referral_id uuid not null references public.referrals(id) on delete cascade, visitor_key text not null, qualified_at timestamptz not null default now(), unique (referral_id, visitor_key));
create table public.reward_transactions (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id), amount bigint not null, kind public.reward_kind not null, referral_id uuid references public.referrals(id), idempotency_key text not null unique, note text, created_at timestamptz not null default now());
create table public.payment_methods (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, provider text not null check (provider in ('MOBILE_MONEY','AIRTEL_MONEY','MTN','ORANGE_MONEY','PAYPAL','PAYONEER','USDT')), account_reference text not null, is_verified boolean not null default false, created_at timestamptz not null default now());
create table public.withdrawals (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id), payment_method_id uuid not null references public.payment_methods(id), amount bigint not null check (amount >= 15000), status public.withdrawal_status not null default 'PENDING', provider_reference text, reviewed_by uuid references public.profiles(id), rejection_reason text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.fraud_events (id uuid primary key default gen_random_uuid(), user_id uuid references public.profiles(id), event_type text not null, severity smallint not null default 1 check (severity between 1 and 5), metadata jsonb not null default '{}', resolved_at timestamptz, created_at timestamptz not null default now());
create table public.campaigns (id uuid primary key default gen_random_uuid(), name text not null, description text, active boolean not null default false, starts_at timestamptz, ends_at timestamptz, created_at timestamptz not null default now());
create table public.notifications (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, title text not null, body text not null, read_at timestamptz, created_at timestamptz not null default now());
create table public.admin_users (user_id uuid primary key references public.profiles(id) on delete cascade, created_at timestamptz not null default now());
create table public.settings (key text primary key, value jsonb not null, updated_by uuid references public.profiles(id), updated_at timestamptz not null default now());
create table public.audit_logs (id uuid primary key default gen_random_uuid(), actor_id uuid references public.profiles(id), action text not null, entity_type text not null, entity_id uuid, metadata jsonb not null default '{}', created_at timestamptz not null default now());

create index referrals_sponsor_idx on public.referrals(sponsor_id);
create index rewards_user_created_idx on public.reward_transactions(user_id, created_at desc);
create index withdrawals_user_status_idx on public.withdrawals(user_id, status);
create index fraud_user_created_idx on public.fraud_events(user_id, created_at desc);
create index notifications_user_read_idx on public.notifications(user_id, read_at);

alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_events enable row level security;
alter table public.qualified_visits enable row level security;
alter table public.reward_transactions enable row level security;
alter table public.payment_methods enable row level security;
alter table public.withdrawals enable row level security;
alter table public.fraud_events enable row level security;
alter table public.campaigns enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_users enable row level security;
alter table public.settings enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles own read" on public.profiles for select using (auth.uid() = id);
create policy "profiles own update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "wallet own read" on public.wallets for select using (auth.uid() = user_id);
create policy "rewards own read" on public.reward_transactions for select using (auth.uid() = user_id);
create policy "referrals participant read" on public.referrals for select using (auth.uid() = sponsor_id or auth.uid() = referred_id);
create policy "methods own all" on public.payment_methods for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "withdrawals own read" on public.withdrawals for select using (auth.uid() = user_id);
create policy "withdrawals own insert" on public.withdrawals for insert with check (auth.uid() = user_id);
create policy "notifications own read" on public.notifications for select using (auth.uid() = user_id);
create policy "campaigns public read" on public.campaigns for select using (active = true);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles(id) values (new.id); insert into public.wallets(user_id) values (new.id); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
