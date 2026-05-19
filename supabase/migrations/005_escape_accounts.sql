-- Escape player accounts (credentials + persistent progress / achievements).
-- Passwords are stored as bcrypt hashes only (pgcrypto); never expose password_hash to clients.
--
-- Legal path × display-level clears (must match pathRuntime + achievementKeysFromSegment):
--   L1  → base (no path)
--   L2–L3 → bone | fire | swamp
--   L4–L5 → depths | halls
-- Plus set 13/13 per suit and reaching the win screen (victory).

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Accounts
-- ---------------------------------------------------------------------------

create table if not exists public.escape_accounts (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  email text not null,
  password_hash text not null,
  max_display_level smallint not null default 1 check (max_display_level between 1 and 5),
  run_count integer not null default 0 check (run_count >= 0),
  analytics_player_id uuid references public.analytics_players (id) on delete set null,

  -- Level / path clears (safehouse level-up or victory on that segment)
  ach_clear_base_l1 boolean not null default false,
  ach_clear_bone_l2 boolean not null default false,
  ach_clear_fire_l2 boolean not null default false,
  ach_clear_swamp_l2 boolean not null default false,
  ach_clear_bone_l3 boolean not null default false,
  ach_clear_fire_l3 boolean not null default false,
  ach_clear_swamp_l3 boolean not null default false,
  ach_clear_depths_l4 boolean not null default false,
  ach_clear_halls_l4 boolean not null default false,
  ach_clear_depths_l5 boolean not null default false,
  ach_clear_halls_l5 boolean not null default false,

  -- Full rank deck of one suit (13/13)
  ach_set13_hearts boolean not null default false,
  ach_set13_diamonds boolean not null default false,
  ach_set13_clubs boolean not null default false,
  ach_set13_spades boolean not null default false,

  -- Reached the win / victory screen
  ach_victory boolean not null default false,

  -- L1 safehouse after 7:00 on the level (danger clock)
  ach_minimalist boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create unique index if not exists escape_accounts_username_lower_idx
  on public.escape_accounts (lower(username));

create unique index if not exists escape_accounts_email_lower_idx
  on public.escape_accounts (lower(email));

create index if not exists escape_accounts_analytics_player_idx
  on public.escape_accounts (analytics_player_id);

-- Safe read surface (no password_hash).
create or replace view public.escape_accounts_public as
select
  id,
  username,
  email,
  max_display_level,
  run_count,
  analytics_player_id,
  ach_clear_base_l1,
  ach_clear_bone_l2,
  ach_clear_fire_l2,
  ach_clear_swamp_l2,
  ach_clear_bone_l3,
  ach_clear_fire_l3,
  ach_clear_swamp_l3,
  ach_clear_depths_l4,
  ach_clear_halls_l4,
  ach_clear_depths_l5,
  ach_clear_halls_l5,
  ach_set13_hearts,
  ach_set13_diamonds,
  ach_set13_clubs,
  ach_set13_spades,
  ach_victory,
  ach_minimalist,
  created_at,
  updated_at,
  last_login_at
from public.escape_accounts;

-- ---------------------------------------------------------------------------
-- RPC helpers (SECURITY DEFINER — clients never read password_hash)
-- ---------------------------------------------------------------------------

create or replace function public.escape_apply_achievement_keys(
  p_account_id uuid,
  p_keys text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_account_id is null then
    return;
  end if;

  update public.escape_accounts
  set
    ach_clear_base_l1 = ach_clear_base_l1
      or coalesce(p_keys, '{}') @> array['clear:base:L1']::text[],
    ach_clear_bone_l2 = ach_clear_bone_l2
      or coalesce(p_keys, '{}') @> array['clear:bone:L2']::text[],
    ach_clear_fire_l2 = ach_clear_fire_l2
      or coalesce(p_keys, '{}') @> array['clear:fire:L2']::text[],
    ach_clear_swamp_l2 = ach_clear_swamp_l2
      or coalesce(p_keys, '{}') @> array['clear:swamp:L2']::text[],
    ach_clear_bone_l3 = ach_clear_bone_l3
      or coalesce(p_keys, '{}') @> array['clear:bone:L3']::text[],
    ach_clear_fire_l3 = ach_clear_fire_l3
      or coalesce(p_keys, '{}') @> array['clear:fire:L3']::text[],
    ach_clear_swamp_l3 = ach_clear_swamp_l3
      or coalesce(p_keys, '{}') @> array['clear:swamp:L3']::text[],
    ach_clear_depths_l4 = ach_clear_depths_l4
      or coalesce(p_keys, '{}') @> array['clear:depths:L4']::text[],
    ach_clear_halls_l4 = ach_clear_halls_l4
      or coalesce(p_keys, '{}') @> array['clear:halls:L4']::text[],
    ach_clear_depths_l5 = ach_clear_depths_l5
      or coalesce(p_keys, '{}') @> array['clear:depths:L5']::text[],
    ach_clear_halls_l5 = ach_clear_halls_l5
      or coalesce(p_keys, '{}') @> array['clear:halls:L5']::text[],
    ach_set13_hearts = ach_set13_hearts
      or coalesce(p_keys, '{}') @> array['set13:hearts']::text[],
    ach_set13_diamonds = ach_set13_diamonds
      or coalesce(p_keys, '{}') @> array['set13:diamonds']::text[],
    ach_set13_clubs = ach_set13_clubs
      or coalesce(p_keys, '{}') @> array['set13:clubs']::text[],
    ach_set13_spades = ach_set13_spades
      or coalesce(p_keys, '{}') @> array['set13:spades']::text[],
    ach_victory = ach_victory
      or coalesce(p_keys, '{}') @> array['victory']::text[],
    ach_minimalist = ach_minimalist
      or coalesce(p_keys, '{}') @> array['minimalist']::text[],
    updated_at = now()
  where id = p_account_id;
end;
$$;

create or replace function public.escape_record_segment_progress(
  p_account_id uuid,
  p_display_level smallint,
  p_keys text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_account_id is null then
    return;
  end if;

  update public.escape_accounts
  set
    max_display_level = greatest(
      max_display_level,
      greatest(1, least(5, coalesce(p_display_level, 1)))
    ),
    updated_at = now()
  where id = p_account_id;

  perform public.escape_apply_achievement_keys(p_account_id, p_keys);
end;
$$;

create or replace function public.escape_record_run_started(p_account_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_account_id is null then
    return;
  end if;

  update public.escape_accounts
  set
    run_count = run_count + 1,
    updated_at = now()
  where id = p_account_id;
end;
$$;

create or replace function public.escape_register_account(
  p_username text,
  p_email text,
  p_password text
)
returns public.escape_accounts_public
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_username text := trim(coalesce(p_username, ''));
  v_email text := trim(lower(coalesce(p_email, '')));
  v_id uuid;
  v_salt text;
  v_out public.escape_accounts_public;
begin
  if length(v_username) < 2 or length(v_username) > 32 then
    raise exception 'username must be 2–32 characters';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid email';
  end if;
  if coalesce(length(p_password), 0) < 8 then
    raise exception 'password must be at least 8 characters';
  end if;

  v_salt := extensions.gen_salt('bf'::text);

  insert into public.escape_accounts (username, email, password_hash)
  values (v_username, v_email, extensions.crypt(p_password, v_salt))
  returning id into v_id;

  select a into v_out
  from public.escape_accounts_public a
  where a.id = v_id;

  return v_out;
exception
  when unique_violation then
    raise exception 'username or email already in use';
end;
$$;

create or replace function public.escape_login_account(
  p_email text,
  p_password text
)
returns public.escape_accounts_public
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_email text := trim(lower(coalesce(p_email, '')));
  v_row public.escape_accounts%rowtype;
  v_out public.escape_accounts_public;
begin
  select *
  into v_row
  from public.escape_accounts
  where lower(email) = v_email;

  if not found then
    raise exception 'invalid email or password';
  end if;

  if v_row.password_hash is distinct from extensions.crypt(p_password, v_row.password_hash) then
    raise exception 'invalid email or password';
  end if;

  update public.escape_accounts
  set last_login_at = now(), updated_at = now()
  where id = v_row.id;

  select a into v_out
  from public.escape_accounts_public a
  where a.id = v_row.id;

  return v_out;
end;
$$;

create or replace function public.escape_get_account(p_account_id uuid)
returns public.escape_accounts_public
language sql
security definer
stable
set search_path = public
as $$
  select a
  from public.escape_accounts_public a
  where a.id = p_account_id;
$$;

-- ---------------------------------------------------------------------------
-- RLS — direct table access locked down; use RPCs / public view
-- ---------------------------------------------------------------------------

alter table public.escape_accounts enable row level security;

revoke all on table public.escape_accounts from anon, authenticated;
grant select on table public.escape_accounts_public to anon, authenticated;

grant execute on function public.escape_register_account(text, text, text) to anon, authenticated;
grant execute on function public.escape_login_account(text, text) to anon, authenticated;
grant execute on function public.escape_get_account(uuid) to anon, authenticated;
grant execute on function public.escape_apply_achievement_keys(uuid, text[]) to anon, authenticated;
grant execute on function public.escape_record_segment_progress(uuid, smallint, text[]) to anon, authenticated;
grant execute on function public.escape_record_run_started(uuid) to anon, authenticated;
