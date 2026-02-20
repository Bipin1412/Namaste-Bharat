-- Marketplace schema for Namaste Bharat (Supabase Postgres)

create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  tagline text,
  description text,
  locality text not null,
  city text not null,
  address_line_1 text,
  address_line_2 text,
  pincode text,
  owner_name text,
  established_year int,
  email text,
  website text,
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  is_open_now boolean not null default false,
  verified boolean not null default false,
  listing_status text not null default 'pending' check (listing_status in ('pending', 'active', 'rejected')),
  activated_at timestamptz,
  rejected_reason text,
  phone text not null,
  whatsapp_number text not null,
  service_areas text[] not null default '{}',
  languages text[] not null default '{}',
  keywords text[] not null default '{}',
  highlights text[] not null default '{}',
  services jsonb not null default '[]'::jsonb,
  business_hours jsonb not null default '[]'::jsonb,
  media jsonb not null default '{}'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  policies jsonb not null default '{}'::jsonb,
  social_links jsonb not null default '{}'::jsonb,
  verification jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.businesses
  add column if not exists listing_status text not null default 'pending';
alter table public.businesses
  add column if not exists activated_at timestamptz;
alter table public.businesses
  add column if not exists rejected_reason text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'businesses_listing_status_check'
  ) then
    alter table public.businesses
      add constraint businesses_listing_status_check
      check (listing_status in ('pending', 'active', 'rejected'));
  end if;
end $$;

update public.businesses
set listing_status = case when verified then 'active' else 'pending' end
where listing_status is null or listing_status not in ('pending', 'active', 'rejected');

create table if not exists public.reels (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  vendor_name text not null,
  handle text not null,
  description text not null,
  city text not null,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null,
  badge text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text not null,
  message text not null,
  source text not null check (source in ('search', 'reel', 'profile')),
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  reviewer_name text not null default 'Anonymous',
  rating numeric(2,1) not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists idx_businesses_city on public.businesses(city);
create index if not exists idx_businesses_category on public.businesses(category);
create index if not exists idx_businesses_rating on public.businesses(rating desc);
create index if not exists idx_businesses_review_count on public.businesses(review_count desc);
create index if not exists idx_leads_business_id on public.leads(business_id);
create index if not exists idx_reviews_business_id on public.reviews(business_id);
create index if not exists idx_reels_business_id on public.reels(business_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_businesses_updated_at on public.businesses;
create trigger trg_businesses_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

drop trigger if exists trg_offers_updated_at on public.offers;
create trigger trg_offers_updated_at
before update on public.offers
for each row execute function public.set_updated_at();

alter table public.businesses enable row level security;
alter table public.reels enable row level security;
alter table public.offers enable row level security;
alter table public.leads enable row level security;
alter table public.reviews enable row level security;

-- Public read access for discovery surfaces.
drop policy if exists "businesses_public_read" on public.businesses;
create policy "businesses_public_read" on public.businesses for select using (true);

drop policy if exists "reels_public_read" on public.reels;
create policy "reels_public_read" on public.reels for select using (true);

drop policy if exists "offers_public_read" on public.offers;
create policy "offers_public_read" on public.offers for select using (true);

drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews for select using (true);

-- Leads and writes are expected via service-role backend.
