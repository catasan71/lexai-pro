-- LexAI Pro — Rate limiting / abuse protection
-- Rulează în Supabase SQL Editor după schema.sql și payments.sql.

create table if not exists rate_limits (
  id bigint generated always as identity primary key,
  bucket_key text not null,
  window_start timestamptz not null,
  count int not null default 1
);

create unique index if not exists rate_limits_bucket_window_idx
  on rate_limits (bucket_key, window_start);

alter table rate_limits enable row level security;
-- Niciun acces direct din client — doar service_role (din serverless functions) poate citi/scrie.

-- check_rate_limit: fereastră fixă (fixed window). Incrementează atomic contorul
-- pentru `p_bucket_key` în fereastra curentă de `p_window_seconds` și întoarce
-- TRUE dacă cererea e permisă (count <= p_max_requests), FALSE dacă a fost depășită limita.
create or replace function check_rate_limit(
  p_bucket_key text,
  p_max_requests int,
  p_window_seconds int
) returns boolean as $$
declare
  v_window_start timestamptz;
  v_count int;
begin
  v_window_start := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  insert into rate_limits (bucket_key, window_start, count)
  values (p_bucket_key, v_window_start, 1)
  on conflict (bucket_key, window_start)
  do update set count = rate_limits.count + 1
  returning count into v_count;

  return v_count <= p_max_requests;
end;
$$ language plpgsql security definer;

-- Curățare periodică (opțional, rulează manual sau via pg_cron):
-- delete from rate_limits where window_start < now() - interval '1 hour';
