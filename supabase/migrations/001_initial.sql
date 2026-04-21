-- The Markers — initial database schema
-- Run this in Supabase SQL editor to set up the database.

-- Categories
create table if not exists categories (
  id serial primary key,
  title text not null,
  slug text not null unique,
  description text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Articles
create table if not exists articles (
  id serial primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image text,
  category_id integer references categories(id) on delete set null,
  author_name text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  is_featured boolean not null default false,
  is_premium boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_status_idx on articles(status);
create index if not exists articles_slug_idx on articles(slug);
create index if not exists articles_published_at_idx on articles(published_at desc);

-- Admin users (editors and admins)
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  password_hash text not null,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

-- Newsletter subscribers
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  first_name text,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

-- Seed default categories
insert into categories (title, slug) values
  ('Business', 'business'),
  ('Careers', 'careers'),
  ('Culture', 'culture'),
  ('Entrepreneurship', 'entrepreneurship'),
  ('Finance', 'finance'),
  ('Lifestyle', 'lifestyle'),
  ('Technology', 'technology'),
  ('People', 'people')
on conflict (slug) do nothing;

-- Row Level Security (recommended for Supabase)
-- Allow public read of published articles and categories.
-- Admin operations go through server-side routes using the anon key + RLS.

alter table categories enable row level security;
alter table articles enable row level security;
alter table newsletter_subscribers enable row level security;
alter table admin_users enable row level security;

-- Public can read categories
create policy "categories_public_read" on categories for select using (true);

-- Public can read published articles
create policy "articles_public_read" on articles for select using (status = 'published');

-- All mutations to articles/categories go through server-side API routes
-- which use the service role key (bypasses RLS). Anon key gets read-only.

-- Newsletter: anyone can insert (subscribe)
create policy "newsletter_insert" on newsletter_subscribers for insert with check (true);

-- Admin users: no client access (server-side only via service role)
