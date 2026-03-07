create extension if not exists "pgcrypto";

create table if not exists public.daily_inquiry_posts (
  id uuid primary key default gen_random_uuid(),
  inquiry_date date not null,
  description text not null check (char_length(trim(description)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_daily_inquiry_posts_inquiry_date
  on public.daily_inquiry_posts (inquiry_date desc);

create index if not exists idx_daily_inquiry_posts_created_at
  on public.daily_inquiry_posts (created_at desc);
