-- 3-way freight audit enhancements: rate + amount + execution evidence

alter table public.freight_audits
  add column if not exists expected_amount numeric(12, 2),
  add column if not exists tolerance_amount numeric(12, 2),
  add column if not exists match_confidence numeric(5, 2) not null default 0,
  add column if not exists matched_rate_id uuid references public.rates(id) on delete set null,
  add column if not exists rule_breakdown jsonb not null default '[]'::jsonb;

alter table public.freight_audits
  drop constraint if exists freight_audits_match_confidence_check;

alter table public.freight_audits
  add constraint freight_audits_match_confidence_check
  check (match_confidence >= 0 and match_confidence <= 100);

create index if not exists idx_freight_audits_matched_rate on public.freight_audits(matched_rate_id);
create index if not exists idx_freight_audits_confidence on public.freight_audits(match_confidence);
