-- ════════════════════════════════════════════════════════════════════
--  urmilaajay.com — Supabase schema
--  Run in: Supabase dashboard → SQL Editor → New query → Run
-- ════════════════════════════════════════════════════════════════════

-- ─── PHOTOS ──────────────────────────────────────────────────────────
-- Image bytes live in the private `photos` storage bucket.
-- This table holds only metadata; images are served via short-lived
-- signed URLs generated server-side.
create table if not exists photos (
  id            uuid primary key default gen_random_uuid(),
  storage_path  text not null unique,           -- path within the bucket
  caption       text not null default '',
  subject       text not null default 'urmila', -- urmila | ajay | both | family
  year          int,
  aspect_ratio  real not null default 1,
  blur_data_url text,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists photos_sort_idx on photos (sort_order, created_at);

alter table photos enable row level security;

-- Public may read metadata (image bytes stay protected by the private bucket)
drop policy if exists "Public read photos" on photos;
create policy "Public read photos" on photos for select using (true);
-- Writes happen only via the service role, which bypasses RLS — no anon
-- insert/update/delete policy is intentionally defined.


-- ─── COMMENTS ────────────────────────────────────────────────────────
create table if not exists comments (
  id          uuid primary key default gen_random_uuid(),
  photo_id    text not null,                    -- references photos.id (uuid as text)
  author_name text not null,
  body        text not null,
  created_at  timestamptz not null default now(),
  approved    boolean not null default false
);

create index if not exists comments_approved_idx on comments (approved, created_at);
create index if not exists comments_photo_approved_idx on comments (photo_id, approved);

alter table comments enable row level security;

drop policy if exists "Public read approved comments" on comments;
create policy "Public read approved comments"
  on comments for select using (approved = true);

drop policy if exists "Public insert comments" on comments;
create policy "Public insert comments"
  on comments for insert with check (true);


-- ─── PERSONAL LETTERS (private notes straight to admin) ─────────────
create table if not exists letters (
  id           uuid primary key default gen_random_uuid(),
  author_name  text not null,
  author_email text not null,
  body         text not null,
  created_at   timestamptz not null default now()
);

create index if not exists letters_created_idx on letters (created_at desc);

alter table letters enable row level security;

-- Anyone may insert (server enforces validation + rate-limit + honeypot).
-- Only the service role (admin API) may read.
drop policy if exists "Public insert letters" on letters;
create policy "Public insert letters" on letters for insert with check (true);


-- ─── STORAGE BUCKET ──────────────────────────────────────────────────
-- The private `photos` bucket is created automatically by the migration
-- script (scripts/migrate-to-supabase.ts) using the service-role key.
-- No public storage policy is added: images are reachable only through
-- server-generated signed URLs. The service role bypasses storage RLS.
