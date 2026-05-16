-- Fix empty analytics tables: grants + permissive RLS for API roles (publishable + legacy anon).
-- Run this in Supabase SQL Editor if inserts return 401 / RLS errors.

grant usage on schema public to anon, authenticated, service_role;

grant insert, update on table public.analytics_players to anon, authenticated;
grant insert, update on table public.analytics_runs to anon, authenticated;
grant insert on table public.analytics_level_segments to anon, authenticated;
grant insert on table public.analytics_player_achievements to anon, authenticated;

-- Players
drop policy if exists analytics_players_insert_anon on public.analytics_players;
drop policy if exists analytics_players_update_anon on public.analytics_players;
drop policy if exists analytics_players_insert on public.analytics_players;
drop policy if exists analytics_players_update on public.analytics_players;

create policy analytics_players_insert on public.analytics_players
  for insert
  with check (true);

create policy analytics_players_update on public.analytics_players
  for update
  using (true)
  with check (true);

-- Runs
drop policy if exists analytics_runs_insert_anon on public.analytics_runs;
drop policy if exists analytics_runs_update_anon on public.analytics_runs;
drop policy if exists analytics_runs_insert on public.analytics_runs;
drop policy if exists analytics_runs_update on public.analytics_runs;

create policy analytics_runs_insert on public.analytics_runs
  for insert
  with check (true);

create policy analytics_runs_update on public.analytics_runs
  for update
  using (true)
  with check (true);

-- Level segments
drop policy if exists analytics_level_segments_insert_anon on public.analytics_level_segments;
drop policy if exists analytics_level_segments_insert on public.analytics_level_segments;

create policy analytics_level_segments_insert on public.analytics_level_segments
  for insert
  with check (true);

-- Achievements (insert-only from client)
drop policy if exists analytics_player_achievements_insert_anon on public.analytics_player_achievements;
drop policy if exists analytics_player_achievements_insert on public.analytics_player_achievements;

create policy analytics_player_achievements_insert on public.analytics_player_achievements
  for insert
  with check (true);
