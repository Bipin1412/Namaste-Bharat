create extension if not exists pgcrypto;

create table if not exists public.daily_inquiries (
  id uuid primary key default gen_random_uuid(),
  city_name text not null,
  inquiry_date date not null,
  short_description text not null,
  phone_number text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_daily_inquiries_created_at
  on public.daily_inquiries (created_at desc);

create index if not exists idx_daily_inquiries_city_name
  on public.daily_inquiries (city_name);
