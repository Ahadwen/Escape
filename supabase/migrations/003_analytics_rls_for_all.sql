-- Run this if you still see "violates row-level security policy" on analytics_* tables.
-- Uses permissive FOR ALL policies (insert + update; upsert no longer needs SELECT).

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update on table public.analytics_players to anon, authenticated;
grant select, insert, update on table public.analytics_runs to anon, authenticated;
grant select, insert on table public.analytics_level_segments to anon, authenticated;
grant select, insert on table public.analytics_player_achievements to anon, authenticated;

-- Drop every known policy name variant
do $$
declare
  r record;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename like 'analytics_%'
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

create policy analytics_players_api on public.analytics_players
  as permissive for all using (true) with check (true);

create policy analytics_runs_api on public.analytics_runs
  as permissive for all using (true) with check (true);

create policy analytics_level_segments_api on public.analytics_level_segments
  as permissive for all using (true) with check (true);

create policy analytics_player_achievements_api on public.analytics_player_achievements
  as permissive for all using (true) with check (true);
