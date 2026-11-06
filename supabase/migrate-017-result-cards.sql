-- Run once in the Supabase SQL editor. Session result cards (Shwan, 6 Nov): when qualifying, a sprint or a race
-- has results, the 5-minute publish job makes a top-3 card and it waits in /admin/results; one tap posts it to
-- Facebook and Instagram. One row per session; the unique key stops two runs making the same card. Safe to run again.
create table if not exists result_cards (
  id bigserial primary key,
  season text not null,
  round int not null,
  session text not null,                        -- Qualifying | Sprint | Race
  status text not null default 'rendering',     -- rendering | pending | posted | skipped | failed
  data jsonb not null default '{}',
  feed_url text,
  story_url text,
  post_result text,
  created_at timestamptz not null default now(),
  posted_at timestamptz,
  unique (season, round, session)
);
alter table result_cards enable row level security;
select 'result_cards ready' as result;
