-- Fix account password hashing on Supabase (pgcrypto in `extensions` schema).
-- Error without this: function gen_salt(unknown, integer) does not exist

create extension if not exists pgcrypto with schema extensions;

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
