-- Google OAuth via Supabase Auth → link or create escape_accounts row.

alter table public.escape_accounts
  add column if not exists auth_user_id uuid unique references auth.users (id) on delete cascade;

alter table public.escape_accounts
  alter column password_hash drop not null;

create or replace view public.escape_accounts_public as
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

create or replace function public.escape_sync_oauth_account(
  p_auth_user_id uuid,
  p_email text,
  p_display_name text
)
returns public.escape_accounts_public
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := trim(lower(coalesce(p_email, '')));
  v_username text;
  v_id uuid;
  v_suffix integer := 0;
  v_try text;
  v_out public.escape_accounts_public;
begin
  if p_auth_user_id is null then
    raise exception 'missing auth user';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid email from provider';
  end if;

  select id into v_id
  from public.escape_accounts
  where auth_user_id = p_auth_user_id;

  if v_id is not null then
    update public.escape_accounts
    set last_login_at = now(), updated_at = now()
    where id = v_id;
    select a into v_out from public.escape_accounts_public a where a.id = v_id;
    return v_out;
  end if;

  select id into v_id
  from public.escape_accounts
  where lower(email) = v_email;

  if v_id is not null then
    update public.escape_accounts
    set
      auth_user_id = p_auth_user_id,
      last_login_at = now(),
      updated_at = now()
    where id = v_id;
    select a into v_out from public.escape_accounts_public a where a.id = v_id;
    return v_out;
  end if;

  v_username := trim(regexp_replace(coalesce(nullif(trim(p_display_name), ''), split_part(v_email, '@', 1)), '[^a-zA-Z0-9_]+', '_', 'g'));
  if length(v_username) < 2 then
    v_username := 'player';
  end if;
  if length(v_username) > 28 then
    v_username := left(v_username, 28);
  end if;
  v_try := v_username;

  while exists (select 1 from public.escape_accounts where lower(username) = lower(v_try)) loop
    v_suffix := v_suffix + 1;
    v_try := left(v_username, 28) || v_suffix::text;
  end loop;

  insert into public.escape_accounts (username, email, password_hash, auth_user_id)
  values (v_try, v_email, null, p_auth_user_id)
  returning id into v_id;

  select a into v_out from public.escape_accounts_public a where a.id = v_id;
  return v_out;
end;
$$;

grant execute on function public.escape_sync_oauth_account(uuid, text, text) to anon, authenticated;
