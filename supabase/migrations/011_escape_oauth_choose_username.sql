-- Google OAuth: new users pick a username instead of auto-generated name.

drop function if exists public.escape_sync_oauth_account(uuid, text, text);

create or replace function public.escape_sync_oauth_account(
  p_auth_user_id uuid,
  p_email text,
  p_display_name text,
  p_username text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := trim(lower(coalesce(p_email, '')));
  v_username text := trim(coalesce(p_username, ''));
  v_id uuid;
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
    return (select to_jsonb(a) from public.escape_accounts_public a where a.id = v_id);
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
    return (select to_jsonb(a) from public.escape_accounts_public a where a.id = v_id);
  end if;

  -- New OAuth user: require explicit username from client.
  if v_username = '' then
    return jsonb_build_object(
      'needs_username', true,
      'email', v_email
    );
  end if;

  if length(v_username) < 2 or length(v_username) > 32 then
    raise exception 'username must be 2–32 characters';
  end if;

  insert into public.escape_accounts (username, email, password_hash, auth_user_id)
  values (v_username, v_email, null, p_auth_user_id)
  returning id into v_id;

  return (select to_jsonb(a) from public.escape_accounts_public a where a.id = v_id);
exception
  when unique_violation then
    raise exception 'username or email already in use';
end;
$$;

grant execute on function public.escape_sync_oauth_account(uuid, text, text, text) to anon, authenticated;
