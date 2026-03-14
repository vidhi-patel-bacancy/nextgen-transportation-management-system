create table if not exists public.password_reset_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  token_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_password_reset_requests_email on public.password_reset_requests(email);
create index if not exists idx_password_reset_requests_token_hash on public.password_reset_requests(token_hash);
create index if not exists idx_password_reset_requests_expires_at on public.password_reset_requests(expires_at);
