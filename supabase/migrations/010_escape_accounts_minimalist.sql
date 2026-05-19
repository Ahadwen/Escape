-- Minimalist: reach a Level 1 safehouse after 7:00 on that level (danger clock).
-- Also applies 006 prerequisites if you skipped that migration (auth_user_id on the view).

alter table public.escape_accounts
  add column if not exists auth_user_id uuid references auth.users (id) on delete cascade;

create unique index if not exists escape_accounts_auth_user_id_idx
  on public.escape_accounts (auth_user_id)
  where auth_user_id is not null;

alter table public.escape_accounts
  alter column password_hash drop not null;

alter table public.escape_accounts
  add column if not exists ach_minimalist boolean not null default false;

-- CREATE OR REPLACE cannot insert/reorder columns; drop and recreate.
drop view if exists public.escape_accounts_public;

create view public.escape_accounts_public as
select
  id,
  username,
  email,
  max_display_level,
  run_count,
  analytics_player_id,
  auth_user_id,
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

grant select on table public.escape_accounts_public to anon, authenticated;

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
