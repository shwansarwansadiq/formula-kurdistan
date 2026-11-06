-- Run once in the Supabase SQL editor. Driver photo library (Shwan, 6 Nov): one racing-suit photo per driver per
-- season, chosen by Shwan (for example from a team's press site, under its terms), used first on result cards.
create table if not exists driver_photos (
  season text not null,
  driver_id text not null,
  url text not null,
  credit text not null,
  updated_at timestamptz not null default now(),
  primary key (season, driver_id)
);
alter table driver_photos enable row level security;
select 'driver_photos ready' as result;
