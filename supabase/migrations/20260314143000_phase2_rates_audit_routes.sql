-- Phase 2 foundation: rate management, freight audit/payment, route/load planning

create table if not exists public.rates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  carrier_id uuid references public.carriers(id) on delete set null,
  mode text not null check (mode in ('ltl', 'ftl', 'parcel', 'rail', 'ocean', 'air')),
  origin_region text not null,
  destination_region text not null,
  min_weight numeric(10, 2) not null default 0,
  max_weight numeric(10, 2) not null,
  base_amount numeric(12, 2) not null,
  fuel_surcharge_pct numeric(5, 2) not null default 0,
  currency text not null default 'USD',
  effective_from date not null,
  effective_to date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (max_weight >= min_weight)
);

create table if not exists public.route_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  shipment_id uuid references public.shipments(id) on delete set null,
  origin text not null,
  destination text not null,
  mode text not null check (mode in ('ltl', 'ftl', 'parcel', 'rail', 'ocean', 'air')),
  distance_km numeric(10, 2),
  estimated_duration_hours numeric(10, 2),
  optimization_score numeric(5, 2),
  status text not null default 'draft' check (status in ('draft', 'optimized', 'approved', 'dispatched', 'archived')),
  planned_departure timestamptz,
  planned_arrival timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.route_stops (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  route_plan_id uuid not null references public.route_plans(id) on delete cascade,
  stop_sequence integer not null check (stop_sequence > 0),
  stop_type text not null check (stop_type in ('pickup', 'dropoff', 'waypoint')),
  location text not null,
  eta timestamptz,
  etd timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.load_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  route_plan_id uuid references public.route_plans(id) on delete set null,
  shipment_id uuid references public.shipments(id) on delete set null,
  load_reference text not null unique,
  capacity_weight numeric(10, 2) not null,
  utilized_weight numeric(10, 2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'optimized', 'finalized')),
  created_at timestamptz not null default now(),
  check (utilized_weight >= 0 and capacity_weight >= utilized_weight)
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  shipment_id uuid references public.shipments(id) on delete set null,
  carrier_id uuid references public.carriers(id) on delete set null,
  invoice_number text not null unique,
  billed_amount numeric(12, 2) not null,
  audited_amount numeric(12, 2),
  currency text not null default 'USD',
  status text not null default 'received' check (status in ('received', 'auditing', 'approved', 'rejected', 'paid')),
  due_date date,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.freight_audits (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  auditor_user_id uuid references public.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'in_review', 'approved', 'rejected')),
  discrepancy_amount numeric(12, 2) not null default 0,
  notes text,
  audited_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  paid_amount numeric(12, 2) not null,
  currency text not null default 'USD',
  payment_method text not null check (payment_method in ('ach', 'wire', 'card', 'other')),
  payment_reference text,
  paid_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_rates_org on public.rates(organization_id);
create index if not exists idx_rates_carrier on public.rates(carrier_id);
create index if not exists idx_route_plans_org on public.route_plans(organization_id);
create index if not exists idx_route_plans_shipment on public.route_plans(shipment_id);
create index if not exists idx_route_stops_route on public.route_stops(route_plan_id);
create index if not exists idx_load_plans_org on public.load_plans(organization_id);
create index if not exists idx_load_plans_route on public.load_plans(route_plan_id);
create index if not exists idx_invoices_org on public.invoices(organization_id);
create index if not exists idx_invoices_shipment on public.invoices(shipment_id);
create index if not exists idx_invoices_carrier on public.invoices(carrier_id);
create index if not exists idx_freight_audits_org on public.freight_audits(organization_id);
create index if not exists idx_freight_audits_invoice on public.freight_audits(invoice_id);
create index if not exists idx_payments_org on public.payments(organization_id);
create index if not exists idx_payments_invoice on public.payments(invoice_id);

alter table public.rates alter column organization_id set default public.current_user_org_id();
alter table public.route_plans alter column organization_id set default public.current_user_org_id();
alter table public.route_stops alter column organization_id set default public.current_user_org_id();
alter table public.load_plans alter column organization_id set default public.current_user_org_id();
alter table public.invoices alter column organization_id set default public.current_user_org_id();
alter table public.freight_audits alter column organization_id set default public.current_user_org_id();
alter table public.payments alter column organization_id set default public.current_user_org_id();

alter table public.rates enable row level security;
alter table public.route_plans enable row level security;
alter table public.route_stops enable row level security;
alter table public.load_plans enable row level security;
alter table public.invoices enable row level security;
alter table public.freight_audits enable row level security;
alter table public.payments enable row level security;

drop policy if exists "rates_select" on public.rates;
drop policy if exists "rates_insert" on public.rates;
drop policy if exists "rates_update" on public.rates;
drop policy if exists "rates_delete" on public.rates;

create policy "rates_select" on public.rates
  for select to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager', 'carrier', 'customer'])
  );

create policy "rates_insert" on public.rates
  for insert to authenticated
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );

create policy "rates_update" on public.rates
  for update to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  )
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );

create policy "rates_delete" on public.rates
  for delete to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );

drop policy if exists "route_plans_select" on public.route_plans;
drop policy if exists "route_plans_insert" on public.route_plans;
drop policy if exists "route_plans_update" on public.route_plans;
drop policy if exists "route_plans_delete" on public.route_plans;

create policy "route_plans_select" on public.route_plans
  for select to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager', 'carrier'])
  );

create policy "route_plans_insert" on public.route_plans
  for insert to authenticated
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager', 'carrier'])
  );

create policy "route_plans_update" on public.route_plans
  for update to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager', 'carrier'])
  )
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager', 'carrier'])
  );

create policy "route_plans_delete" on public.route_plans
  for delete to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );

drop policy if exists "route_stops_select" on public.route_stops;
drop policy if exists "route_stops_insert" on public.route_stops;
drop policy if exists "route_stops_update" on public.route_stops;
drop policy if exists "route_stops_delete" on public.route_stops;

create policy "route_stops_select" on public.route_stops
  for select to authenticated
  using (
    organization_id = public.current_user_org_id()
    and exists (
      select 1
      from public.route_plans rp
      where rp.id = route_stops.route_plan_id
        and rp.organization_id = route_stops.organization_id
    )
  );

create policy "route_stops_insert" on public.route_stops
  for insert to authenticated
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager', 'carrier'])
    and exists (
      select 1
      from public.route_plans rp
      where rp.id = route_stops.route_plan_id
        and rp.organization_id = route_stops.organization_id
    )
  );

create policy "route_stops_update" on public.route_stops
  for update to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager', 'carrier'])
  )
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager', 'carrier'])
    and exists (
      select 1
      from public.route_plans rp
      where rp.id = route_stops.route_plan_id
        and rp.organization_id = route_stops.organization_id
    )
  );

create policy "route_stops_delete" on public.route_stops
  for delete to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );

drop policy if exists "load_plans_select" on public.load_plans;
drop policy if exists "load_plans_insert" on public.load_plans;
drop policy if exists "load_plans_update" on public.load_plans;
drop policy if exists "load_plans_delete" on public.load_plans;

create policy "load_plans_select" on public.load_plans
  for select to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager', 'carrier'])
  );

create policy "load_plans_insert" on public.load_plans
  for insert to authenticated
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager', 'carrier'])
  );

create policy "load_plans_update" on public.load_plans
  for update to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager', 'carrier'])
  )
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager', 'carrier'])
  );

create policy "load_plans_delete" on public.load_plans
  for delete to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );

drop policy if exists "invoices_select" on public.invoices;
drop policy if exists "invoices_insert" on public.invoices;
drop policy if exists "invoices_update" on public.invoices;
drop policy if exists "invoices_delete" on public.invoices;

create policy "invoices_select" on public.invoices
  for select to authenticated
  using (
    organization_id = public.current_user_org_id()
    and (
      public.has_any_role(array['admin', 'manager', 'carrier'])
      or (
        public.has_any_role(array['customer'])
        and exists (
          select 1
          from public.shipments s
          join public.orders o on o.id = s.order_id
          where s.id = invoices.shipment_id
            and o.customer_id = auth.uid()
        )
      )
    )
  );

create policy "invoices_insert" on public.invoices
  for insert to authenticated
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager', 'carrier'])
  );

create policy "invoices_update" on public.invoices
  for update to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  )
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );

create policy "invoices_delete" on public.invoices
  for delete to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );

drop policy if exists "freight_audits_select" on public.freight_audits;
drop policy if exists "freight_audits_insert" on public.freight_audits;
drop policy if exists "freight_audits_update" on public.freight_audits;
drop policy if exists "freight_audits_delete" on public.freight_audits;

create policy "freight_audits_select" on public.freight_audits
  for select to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );

create policy "freight_audits_insert" on public.freight_audits
  for insert to authenticated
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );

create policy "freight_audits_update" on public.freight_audits
  for update to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  )
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );

create policy "freight_audits_delete" on public.freight_audits
  for delete to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin'])
  );

drop policy if exists "payments_select" on public.payments;
drop policy if exists "payments_insert" on public.payments;
drop policy if exists "payments_update" on public.payments;
drop policy if exists "payments_delete" on public.payments;

create policy "payments_select" on public.payments
  for select to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );

create policy "payments_insert" on public.payments
  for insert to authenticated
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );

create policy "payments_update" on public.payments
  for update to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  )
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );

create policy "payments_delete" on public.payments
  for delete to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin'])
  );
