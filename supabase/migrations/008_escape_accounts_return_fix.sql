-- Fix RPC return: composite type needs SELECT row (a), not SELECT a.* (multi-column subquery).

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
