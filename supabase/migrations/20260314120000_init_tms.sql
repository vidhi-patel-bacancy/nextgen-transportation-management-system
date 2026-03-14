create extension if not exists "pgcrypto";

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null check (role in ('admin', 'manager', 'carrier', 'customer')),
  organization_id uuid references public.organizations(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.users(id) on delete cascade,
  origin text not null,
  destination text not null,
  product text not null,
  weight numeric(10, 2) not null check (weight > 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  delivery_date timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.carriers (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_email text not null,
  phone text not null,
  transport_type text not null
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  carrier_id uuid not null references public.carriers(id) on delete restrict,
  tracking_number text not null unique,
  status text not null default 'created' check (status in ('created', 'assigned', 'in_transit', 'delivered', 'exception')),
  estimated_delivery timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  status text not null check (status in ('pickup', 'in_transit', 'delay', 'delivered')),
  location text not null,
  "timestamp" timestamptz not null default now(),
  notes text
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  document_type text not null check (document_type in ('bill_of_lading', 'invoice', 'proof_of_delivery')),
  file_url text not null,
  uploaded_at timestamptz not null default now()
);

create index if not exists idx_users_org on public.users(organization_id);
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_shipments_order on public.shipments(order_id);
create index if not exists idx_shipments_carrier on public.shipments(carrier_id);
create index if not exists idx_tracking_shipment on public.tracking_events(shipment_id);
create index if not exists idx_documents_shipment on public.documents(shipment_id);

alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.orders enable row level security;
alter table public.carriers enable row level security;
alter table public.shipments enable row level security;
alter table public.tracking_events enable row level security;
alter table public.documents enable row level security;

drop policy if exists "authenticated_select_organizations" on public.organizations;
create policy "authenticated_select_organizations" on public.organizations
  for select to authenticated using (true);

drop policy if exists "authenticated_upsert_organizations" on public.organizations;
create policy "authenticated_upsert_organizations" on public.organizations
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated_select_users" on public.users;
create policy "authenticated_select_users" on public.users
  for select to authenticated using (true);

drop policy if exists "authenticated_upsert_users" on public.users;
create policy "authenticated_upsert_users" on public.users
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated_manage_orders" on public.orders;
create policy "authenticated_manage_orders" on public.orders
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated_manage_carriers" on public.carriers;
create policy "authenticated_manage_carriers" on public.carriers
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated_manage_shipments" on public.shipments;
create policy "authenticated_manage_shipments" on public.shipments
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated_manage_tracking_events" on public.tracking_events;
create policy "authenticated_manage_tracking_events" on public.tracking_events
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated_manage_documents" on public.documents;
create policy "authenticated_manage_documents" on public.documents
  for all to authenticated using (true) with check (true);
