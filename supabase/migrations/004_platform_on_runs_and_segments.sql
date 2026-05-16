-- Platform per run/segment (localhost vs github pages, etc.)

alter table public.analytics_runs
  add column if not exists platform text;

alter table public.analytics_level_segments
  add column if not exists platform text;

create index if not exists analytics_level_segments_platform_idx
  on public.analytics_level_segments (platform, created_at desc);

create index if not exists analytics_runs_platform_idx
  on public.analytics_runs (platform, started_at desc);
