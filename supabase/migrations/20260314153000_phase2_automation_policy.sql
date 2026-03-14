-- Allow carrier-created invoices to persist automated audit records

drop policy if exists "freight_audits_insert" on public.freight_audits;

create policy "freight_audits_insert" on public.freight_audits
  for insert to authenticated
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager', 'carrier'])
  );
