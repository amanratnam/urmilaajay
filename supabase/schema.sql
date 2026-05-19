-- Comments table for urmilaajay.com
-- Run this in: Supabase dashboard → SQL Editor → New query

create table if not exists comments (
  id          uuid primary key default gen_random_uuid(),
  photo_id    text not null,
  author_name text not null,
  body        text not null,
  created_at  timestamptz not null default now(),
  approved    boolean not null default false
);

-- Index for fetching pending comments quickly
create index if not exists comments_approved_idx on comments (approved, created_at);

-- Index for fetching approved comments per photo
create index if not exists comments_photo_approved_idx on comments (photo_id, approved);

-- Row Level Security: public can only read approved comments
alter table comments enable row level security;

create policy "Public read approved comments"
  on comments for select
  using (approved = true);

create policy "Public insert comments"
  on comments for insert
  with check (true);

-- Service role bypasses RLS automatically (used by admin API routes)
