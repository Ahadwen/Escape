-- Escape analytics schema (v1)
-- Run in Supabase SQL editor or via CLI migrate.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.analytics_players (
  id uuid primary key,
  auth_user_id uuid references auth.users (id) on delete set null,
  platform text not null default 'web_github_pages',
  game_version text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.analytics_runs (
  id uuid primary key,
  player_id uuid not null references public.analytics_players (id) on delete cascade,
  hero text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  outcome text check (outcome in ('victory', 'death', 'abandon'))
);

create table if not exists public.analytics_level_segments (
  id uuid primary key,
  run_id uuid not null references public.analytics_runs (id) on delete cascade,
  player_id uuid not null references public.analytics_players (id) on delete cascade,
  run_level smallint not null,
  display_level smallint not null,
  path_id text,
  hero text not null,
  outcome text not null check (
    outcome in ('safehouse_level_up', 'death', 'victory', 'abandon')
  ),
  survival_sec double precision not null default 0,
  difficulty_clock_sec double precision not null default 0,
  sec_since_prev_safehouse double precision,
  sim_started_at double precision not null default 0,
  sim_ended_at double precision not null default 0,
  wave_end integer not null default 0,
  hunters_end integer not null default 0,
  build_start jsonb not null default '{}'::jsonb,
  build_end jsonb not null default '{}'::jsonb,
  damage_by_source jsonb not null default '{}'::jsonb,
  death_context jsonb,
  game_version text,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_player_achievements (
  player_id uuid not null references public.analytics_players (id) on delete cascade,
  achievement_key text not null,
  unlocked_at timestamptz not null default now(),
  primary key (player_id, achievement_key)
);

create index if not exists analytics_level_segments_player_idx
  on public.analytics_level_segments (player_id, created_at desc);

create index if not exists analytics_level_segments_level_path_idx
  on public.analytics_level_segments (display_level, path_id, outcome);

create index if not exists analytics_runs_player_idx
  on public.analytics_runs (player_id, started_at desc);

-- ---------------------------------------------------------------------------
-- Row level security — anon may insert only
-- ---------------------------------------------------------------------------

alter table public.analytics_players enable row level security;
alter table public.analytics_runs enable row level security;
alter table public.analytics_level_segments enable row level security;
alter table public.analytics_player_achievements enable row level security;

grant usage on schema public to anon, authenticated, service_role;

grant insert, update on table public.analytics_players to anon, authenticated;
grant insert, update on table public.analytics_runs to anon, authenticated;
grant insert on table public.analytics_level_segments to anon, authenticated;
grant insert on table public.analytics_player_achievements to anon, authenticated;

drop policy if exists analytics_players_insert_anon on public.analytics_players;
drop policy if exists analytics_players_update_anon on public.analytics_players;
create policy analytics_players_insert on public.analytics_players
  for insert
  with check (true);
create policy analytics_players_update on public.analytics_players
  for update
  using (true)
  with check (true);

drop policy if exists analytics_runs_insert_anon on public.analytics_runs;
drop policy if exists analytics_runs_update_anon on public.analytics_runs;
create policy analytics_runs_insert on public.analytics_runs
  for insert
  with check (true);
create policy analytics_runs_update on public.analytics_runs
  for update
  using (true)
  with check (true);

drop policy if exists analytics_level_segments_insert_anon on public.analytics_level_segments;
create policy analytics_level_segments_insert on public.analytics_level_segments
  for insert
  with check (true);

drop policy if exists analytics_player_achievements_insert_anon on public.analytics_player_achievements;
create policy analytics_player_achievements_insert on public.analytics_player_achievements
  for insert
  with check (true);

-- ---------------------------------------------------------------------------
-- Derived views (dashboards — use service role in Supabase SQL editor)
-- ---------------------------------------------------------------------------

create or replace view public.analytics_level_summary as
select
  display_level,
  path_id,
  outcome,
  count(*) as n,
  percentile_cont(0.5) within group (order by survival_sec) as median_survival_sec,
  avg(survival_sec) as avg_survival_sec
from public.analytics_level_segments
group by display_level, path_id, outcome;

create or replace view public.analytics_level_success_rate as
select
  display_level,
  path_id,
  count(*) filter (where outcome in ('safehouse_level_up', 'victory')) as successes,
  count(*) as attempts,
  round(
    100.0 * count(*) filter (where outcome in ('safehouse_level_up', 'victory')) / nullif(count(*), 0),
    2
  ) as success_rate_pct
from public.analytics_level_segments
group by display_level, path_id;

create or replace view public.analytics_player_reach_by_level as
with player_max as (
  select player_id, max(display_level) as max_display_level
  from public.analytics_level_segments
  group by player_id
),
totals as (
  select count(distinct id)::numeric as total_players from public.analytics_players
)
select
  lvl.display_level,
  count(distinct pm.player_id) as players_reached,
  t.total_players,
  round(100.0 * count(distinct pm.player_id) / nullif(t.total_players, 0), 2) as reach_pct
from generate_series(1, 5) as lvl(display_level)
cross join totals t
left join player_max pm on pm.max_display_level >= lvl.display_level
group by lvl.display_level, t.total_players
order by lvl.display_level;

create or replace view public.analytics_damage_by_source as
select
  path_id,
  source_key,
  sum(damage_total)::bigint as total_damage,
  count(*) as segment_hits
from (
  select
    ls.path_id,
    e.key as source_key,
    (e.value::text)::numeric as damage_total
  from public.analytics_level_segments ls,
    lateral jsonb_each(ls.damage_by_source) e
  where ls.damage_by_source <> '{}'::jsonb
) sub
group by path_id, source_key
order by path_id, total_damage desc;

create or replace view public.analytics_run_win_rate as
select
  count(*) filter (where outcome = 'victory') as victories,
  count(*) filter (where outcome is not null) as completed_runs,
  round(
    100.0 * count(*) filter (where outcome = 'victory') / nullif(count(*) filter (where outcome is not null), 0),
    2
  ) as win_rate_pct
from public.analytics_runs;
