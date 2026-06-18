-- ============================================================================
--  LexAI Pro — Schema plăți (Revolut Merchant API)
--  Rulează în Supabase Dashboard → SQL Editor (după schema.sql).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PLANS — catalogul de abonamente disponibile
-- ----------------------------------------------------------------------------
create table if not exists public.plans (
  id            text primary key,        -- 'trial' | 'starter' | 'pro'
  name          text not null,
  price_ron     integer not null,        -- preț lunar în RON (0 = gratuit)
  credits_monthly integer not null,      -- credite acordate la fiecare reînnoire
  features      jsonb not null default '[]'
);

-- Inserăm planurile (idempotent cu ON CONFLICT)
insert into public.plans (id, name, price_ron, credits_monthly, features) values
  ('trial',   'Trial Gratuit',  0,   10,  '["10 credite gratuite","Toate funcțiile de bază","Fără card necesar"]'),
  ('starter', 'Starter',        49,  60,  '["60 credite / lună","Generator contracte (40 tipuri)","Generator email-uri","5 analize / lună","Export PDF & DOCX","Suport email 48h"]'),
  ('pro',     'Pro Business',   149, 200, '["200 credite / lună","Contracte nelimitate","Email-uri nelimitate","Analize nelimitate","Clauze AI premium","Suport prioritar 4h","API acces (soon)"]')
on conflict (id) do update set
  price_ron = excluded.price_ron,
  credits_monthly = excluded.credits_monthly,
  features = excluded.features;

-- ----------------------------------------------------------------------------
-- 2. SUBSCRIPTIONS — abonamentul activ al fiecărui utilizator
-- ----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users (id) on delete cascade,
  plan_id               text not null references public.plans (id),
  status                text not null default 'active',  -- active | cancelled | past_due
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  revolut_order_id      text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create unique index if not exists subscriptions_user_active_idx
  on public.subscriptions (user_id) where status = 'active';

create index if not exists subscriptions_user_idx on public.subscriptions (user_id);

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 3. TRANSACTIONS — toate plățile (abonamente + top-up-uri)
-- ----------------------------------------------------------------------------
create table if not exists public.transactions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users (id) on delete cascade,
  type                text not null,          -- 'subscription' | 'topup'
  amount_ron          integer not null,        -- în RON (nu bani)
  credits             integer not null,
  status              text not null default 'pending', -- pending | completed | failed | refunded
  revolut_order_id    text unique,
  revolut_payment_id  text,
  description         text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists transactions_user_idx on public.transactions (user_id, created_at desc);
create index if not exists transactions_revolut_idx on public.transactions (revolut_order_id) where revolut_order_id is not null;

alter table public.transactions enable row level security;

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 4. COMPLETE_PAYMENT — funcție atomică apelată de webhook după plată reușită
--    Creditează contul, inserează tranzacție, activează/reînnoiește abonamentul.
-- ----------------------------------------------------------------------------
create or replace function public.complete_payment(
  p_revolut_order_id  text,
  p_revolut_payment_id text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_tx transactions%rowtype;
begin
  -- Găsim tranzacția pending
  select * into v_tx from transactions
    where revolut_order_id = p_revolut_order_id and status = 'pending'
    for update;

  if not found then
    raise exception 'TRANSACTION_NOT_FOUND or already processed';
  end if;

  -- Creditează userul
  update profiles
    set credits = credits + v_tx.credits, updated_at = now()
    where id = v_tx.user_id;

  -- Marchează tranzacția ca finalizată
  update transactions
    set status = 'completed', revolut_payment_id = p_revolut_payment_id, updated_at = now()
    where id = v_tx.id;

  -- Dacă e abonament, activează/reînnoiește
  if v_tx.type = 'subscription' then
    insert into subscriptions (user_id, plan_id, status, current_period_start, current_period_end, revolut_order_id)
    values (
      v_tx.user_id,
      case
        when v_tx.credits = 60  then 'starter'
        when v_tx.credits = 200 then 'pro'
        else 'starter'
      end,
      'active',
      now(),
      now() + interval '1 month',
      p_revolut_order_id
    )
    on conflict (user_id) do update set
      plan_id = excluded.plan_id,
      status = 'active',
      current_period_start = excluded.current_period_start,
      current_period_end = excluded.current_period_end,
      revolut_order_id = excluded.revolut_order_id,
      updated_at = now();

    -- Actualizează planul în profil
    update profiles
      set plan = case when v_tx.credits = 200 then 'pro' else 'starter' end, updated_at = now()
      where id = v_tx.user_id;
  end if;
end;
$$;
