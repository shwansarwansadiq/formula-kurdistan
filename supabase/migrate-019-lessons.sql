-- Run once in the Supabase SQL editor. Learning from Shwan's edits (23 Nov): every saved change to a story is kept,
-- turned into short lessons by Claude, and a lesson reaches the writer only after Shwan approves it in /admin/lessons.
create table if not exists story_edits (
  id bigserial primary key,
  story_id bigint references stories(id) on delete set null,
  field text not null,
  before text not null,
  after text not null,
  created_at timestamptz not null default now(),
  learned_at timestamptz
);
create index if not exists story_edits_unlearned on story_edits (created_at) where learned_at is null;
alter table story_edits enable row level security;

create table if not exists writer_lessons (
  id bigserial primary key,
  kind text not null check (kind in ('rule', 'term')),
  rule text not null,
  english text,
  sorani text,
  example text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
alter table writer_lessons enable row level security;
select 'lessons ready' as result;
