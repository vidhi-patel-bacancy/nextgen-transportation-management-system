alter table public.users
  add column if not exists email_verified_at timestamptz,
  add column if not exists signup_otp_hash text,
  add column if not exists signup_otp_expires_at timestamptz,
  add column if not exists signup_otp_sent_at timestamptz,
  add column if not exists password_reset_token_hash text,
  add column if not exists password_reset_expires_at timestamptz,
  add column if not exists password_reset_sent_at timestamptz;

-- Keep existing accounts usable after rollout.
update public.users
set email_verified_at = now()
where email_verified_at is null;

create index if not exists idx_users_email_verified_at on public.users(email_verified_at);
create index if not exists idx_users_password_reset_expires_at on public.users(password_reset_expires_at);
