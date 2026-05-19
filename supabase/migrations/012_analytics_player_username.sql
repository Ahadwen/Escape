-- Join escape_accounts.username onto analytics rows (via analytics_player_id / auth_user_id).

-- Link logged-in account ↔ browser analytics player id (idempotent).
create or replace function public.escape_link_analytics_player(
  p_account_id uuid,
  p_analytics_player_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_account_id is null or p_analytics_player_id is null then
    return;
  end if;

  update public.escape_accounts
  set
    analytics_player_id = p_analytics_player_id,
    updated_at = now()
  where id = p_account_id
    and (
      analytics_player_id is null
      or analytics_player_id = p_analytics_player_id
    );
end;
$$;

grant execute on function public.escape_link_analytics_player(uuid, uuid) to anon, authenticated;

drop function if exists public.escape_record_run_started(uuid);

create or replace function public.escape_record_run_started(
  p_account_id uuid,
  p_analytics_player_id uuid default null
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

  if p_analytics_player_id is not null then
    perform public.escape_link_analytics_player(p_account_id, p_analytics_player_id);
  end if;

  update public.escape_accounts
  set
    run_count = run_count + 1,
    updated_at = now()
  where id = p_account_id;
end;
$$;

grant execute on function public.escape_record_run_started(uuid, uuid) to anon, authenticated;

-- Username lookup for a analytics_players.id (account link or shared auth_user_id).
create or replace view public.analytics_player_identity as
select
  ap.id as player_id,
  ap.platform,
  ap.game_version,
  ap.first_seen_at,
  ap.last_seen_at,
  ap.auth_user_id,
  ea.id as account_id,
  ea.username
from public.analytics_players ap
left join lateral (
  select a.id, a.username
  from public.escape_accounts a
  where a.analytics_player_id = ap.id
     or (
       a.auth_user_id is not null
       and ap.auth_user_id is not null
       and a.auth_user_id = ap.auth_user_id
     )
  order by
    case when a.analytics_player_id = ap.id then 0 else 1 end,
    a.updated_at desc nulls last
  limit 1
) ea on true;

create or replace view public.analytics_runs_labeled as
select
  r.*,
  i.username,
  i.account_id
from public.analytics_runs r
left join public.analytics_player_identity i on i.player_id = r.player_id;

create or replace view public.analytics_level_segments_labeled as
select
  s.*,
  i.username,
  i.account_id
from public.analytics_level_segments s
left join public.analytics_player_identity i on i.player_id = s.player_id;

create or replace view public.analytics_player_achievements_labeled as
select
  a.*,
  i.username,
  i.account_id
from public.analytics_player_achievements a
left join public.analytics_player_identity i on i.player_id = a.player_id;

-- Per-player summary for dashboards (player_id + username).
create or replace view public.analytics_player_summary as
select
  i.player_id,
  i.username,
  i.account_id,
  i.platform,
  i.first_seen_at,
  i.last_seen_at,
  count(distinct r.id) as run_count,
  max(s.display_level) as max_display_level,
  count(distinct s.id) as segment_count
from public.analytics_player_identity i
left join public.analytics_runs r on r.player_id = i.player_id
left join public.analytics_level_segments s on s.player_id = i.player_id
group by
  i.player_id,
  i.username,
  i.account_id,
  i.platform,
  i.first_seen_at,
  i.last_seen_at;

grant select on table public.analytics_player_identity to service_role, authenticated;
grant select on table public.analytics_runs_labeled to service_role, authenticated;
grant select on table public.analytics_level_segments_labeled to service_role, authenticated;
grant select on table public.analytics_player_achievements_labeled to service_role, authenticated;
grant select on table public.analytics_player_summary to service_role, authenticated;
