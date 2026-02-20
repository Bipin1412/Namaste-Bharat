-- Custom OTP storage table for backend-managed phone login
create table if not exists public.phone_otps (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  otp_hash text not null,
  attempts int not null default 0,
  max_attempts int not null default 5,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_phone_otps_phone_created on public.phone_otps (phone, created_at desc);
create index if not exists idx_phone_otps_expires_at on public.phone_otps (expires_at);

alter table public.phone_otps enable row level security;

-- Backend uses service role. No public access policies required.
