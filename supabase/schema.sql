-- ============================================================================
--  LexAI Pro — schema bază de date (Supabase / Postgres)
--  Rulează în Supabase Dashboard → SQL Editor.
--  Acoperă: profiluri utilizatori, sold de credite, documente (istoric),
--  jurnal de consum. Toate tabelele au Row-Level Security: fiecare user vede
--  doar propriile date.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROFILES — extinde auth.users cu date de business (firmă, plan, credite)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text,
  full_name    text,
  company_name text,
  company_cui  text,
  plan         text not null default 'trial',         -- trial | starter | pro
  credits      integer not null default 10,           -- sold curent de credite
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- La crearea unui user nou în auth, creăm automat profilul + credite de start.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. DOCUMENTS — istoricul a tot ce generează/analizează userul
-- ----------------------------------------------------------------------------
create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  kind        text not null,            -- contract | email | analysis
  title       text not null,
  content     jsonb not null,           -- payload-ul rezultatului (text sau JSON)
  created_at  timestamptz not null default now()
);

create index if not exists documents_user_created_idx
  on public.documents (user_id, created_at desc);

alter table public.documents enable row level security;

drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own" on public.documents
  for select using (auth.uid() = user_id);

drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own" on public.documents
  for insert with check (auth.uid() = user_id);

drop policy if exists "documents_delete_own" on public.documents;
create policy "documents_delete_own" on public.documents
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 3. USAGE_LOG — fiecare acțiune AI și creditele consumate (audit + analytics)
-- ----------------------------------------------------------------------------
create table if not exists public.usage_log (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  action       text not null,           -- email | clauses | contract | analysis
  credits_used integer not null,
  model        text,
  created_at   timestamptz not null default now()
);

create index if not exists usage_log_user_created_idx
  on public.usage_log (user_id, created_at desc);

alter table public.usage_log enable row level security;

drop policy if exists "usage_select_own" on public.usage_log;
create policy "usage_select_own" on public.usage_log
  for select using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 4. CONSUM CREDITE — funcție atomică (verifică sold, scade, jurnalizează)
--    Apelată din backend (service role) la fiecare acțiune AI. Vezi Faza 3.
-- ----------------------------------------------------------------------------
create or replace function public.consume_credits(
  p_user_id uuid,
  p_action  text,
  p_cost     integer,
  p_model    text default null
)
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  remaining integer;
begin
  update public.profiles
    set credits = credits - p_cost, updated_at = now()
    where id = p_user_id and credits >= p_cost
    returning credits into remaining;

  if remaining is null then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  insert into public.usage_log (user_id, action, credits_used, model)
  values (p_user_id, p_action, p_cost, p_model);

  return remaining;
end;
$$;
