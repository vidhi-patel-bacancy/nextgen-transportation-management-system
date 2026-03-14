-- Phase 1: tenant hardening + RBAC policies

create or replace function public.current_user_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.users
  where id = auth.uid()
  limit 1;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text
  from public.users
  where id = auth.uid()
  limit 1;
$$;

create or replace function public.has_any_role(roles text[])
returns boolean
language sql
stable
as $$
  select coalesce(public.current_user_role() = any (roles), false);
$$;

grant execute on function public.current_user_org_id() to authenticated;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.has_any_role(text[]) to authenticated;

do $$
declare
  default_org_id uuid;
begin
  if not exists (select 1 from public.organizations) then
    insert into public.organizations (name) values ('Default Organization');
  end if;

  select id into default_org_id
  from public.organizations
  order by created_at asc
  limit 1;

  update public.users
  set organization_id = default_org_id
  where organization_id is null;
end $$;

alter table public.orders add column if not exists organization_id uuid;
alter table public.carriers add column if not exists organization_id uuid;
alter table public.shipments add column if not exists organization_id uuid;
alter table public.tracking_events add column if not exists organization_id uuid;
alter table public.documents add column if not exists organization_id uuid;

update public.orders o
set organization_id = u.organization_id
from public.users u
where o.customer_id = u.id
  and o.organization_id is null;

update public.orders
set organization_id = (select id from public.organizations order by created_at asc limit 1)
where organization_id is null;

update public.carriers
set organization_id = (select id from public.organizations order by created_at asc limit 1)
where organization_id is null;

update public.shipments s
set organization_id = o.organization_id
from public.orders o
where s.order_id = o.id
  and s.organization_id is null;

update public.shipments
set organization_id = (select id from public.organizations order by created_at asc limit 1)
where organization_id is null;

update public.tracking_events te
set organization_id = s.organization_id
from public.shipments s
where te.shipment_id = s.id
  and te.organization_id is null;

update public.tracking_events
set organization_id = (select id from public.organizations order by created_at asc limit 1)
where organization_id is null;

update public.documents d
set organization_id = s.organization_id
from public.shipments s
where d.shipment_id = s.id
  and d.organization_id is null;

update public.documents
set organization_id = (select id from public.organizations order by created_at asc limit 1)
where organization_id is null;

alter table public.users alter column organization_id set not null;
alter table public.orders alter column organization_id set not null;
alter table public.carriers alter column organization_id set not null;
alter table public.shipments alter column organization_id set not null;
alter table public.tracking_events alter column organization_id set not null;
alter table public.documents alter column organization_id set not null;

alter table public.orders alter column organization_id set default public.current_user_org_id();
alter table public.carriers alter column organization_id set default public.current_user_org_id();
alter table public.shipments alter column organization_id set default public.current_user_org_id();
alter table public.tracking_events alter column organization_id set default public.current_user_org_id();
alter table public.documents alter column organization_id set default public.current_user_org_id();

alter table public.users drop constraint if exists users_organization_id_fkey;
alter table public.users
  add constraint users_organization_id_fkey
  foreign key (organization_id) references public.organizations(id) on delete restrict;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'orders_organization_id_fkey') then
    alter table public.orders
      add constraint orders_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'carriers_organization_id_fkey') then
    alter table public.carriers
      add constraint carriers_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'shipments_organization_id_fkey') then
    alter table public.shipments
      add constraint shipments_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'tracking_events_organization_id_fkey') then
    alter table public.tracking_events
      add constraint tracking_events_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'documents_organization_id_fkey') then
    alter table public.documents
      add constraint documents_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete restrict;
  end if;
end $$;

create index if not exists idx_orders_org on public.orders(organization_id);
create index if not exists idx_carriers_org on public.carriers(organization_id);
create index if not exists idx_shipments_org on public.shipments(organization_id);
create index if not exists idx_tracking_org on public.tracking_events(organization_id);
create index if not exists idx_documents_org on public.documents(organization_id);

alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.orders enable row level security;
alter table public.carriers enable row level security;
alter table public.shipments enable row level security;
alter table public.tracking_events enable row level security;
alter table public.documents enable row level security;

drop policy if exists "authenticated_select_organizations" on public.organizations;
drop policy if exists "authenticated_upsert_organizations" on public.organizations;
drop policy if exists "authenticated_select_users" on public.users;
drop policy if exists "authenticated_upsert_users" on public.users;
drop policy if exists "authenticated_manage_orders" on public.orders;
drop policy if exists "authenticated_manage_carriers" on public.carriers;
drop policy if exists "authenticated_manage_shipments" on public.shipments;
drop policy if exists "authenticated_manage_tracking_events" on public.tracking_events;
drop policy if exists "authenticated_manage_documents" on public.documents;

drop policy if exists "org_select" on public.organizations;
drop policy if exists "org_insert" on public.organizations;
drop policy if exists "org_update" on public.organizations;
drop policy if exists "org_delete" on public.organizations;

create policy "org_select" on public.organizations
  for select to authenticated
  using (id = public.current_user_org_id());

create policy "org_insert" on public.organizations
  for insert to authenticated
  with check (true);

create policy "org_update" on public.organizations
  for update to authenticated
  using (
    id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  )
  with check (
    id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );

create policy "org_delete" on public.organizations
  for delete to authenticated
  using (
    id = public.current_user_org_id()
    and public.has_any_role(array['admin'])
  );

drop policy if exists "users_select_self" on public.users;
drop policy if exists "users_insert_self" on public.users;
drop policy if exists "users_update_self" on public.users;

create policy "users_select_self" on public.users
  for select to authenticated
  using (id = auth.uid());

create policy "users_insert_self" on public.users
  for insert to authenticated
  with check (
    id = auth.uid()
    and organization_id is not null
    and role in ('admin', 'manager', 'carrier', 'customer')
  );

create policy "users_update_self" on public.users
  for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and organization_id = public.current_user_org_id()
    and role = public.current_user_role()
  );

drop policy if exists "orders_select" on public.orders;
drop policy if exists "orders_insert" on public.orders;
drop policy if exists "orders_update" on public.orders;
drop policy if exists "orders_delete" on public.orders;

create policy "orders_select" on public.orders
  for select to authenticated
  using (
    organization_id = public.current_user_org_id()
    and (
      public.has_any_role(array['admin', 'manager', 'carrier'])
      or (public.has_any_role(array['customer']) and customer_id = auth.uid())
    )
  );

create policy "orders_insert" on public.orders
  for insert to authenticated
  with check (
    organization_id = public.current_user_org_id()
    and (
      public.has_any_role(array['admin', 'manager'])
      or (public.has_any_role(array['customer']) and customer_id = auth.uid())
    )
  );

create policy "orders_update" on public.orders
  for update to authenticated
  using (
    organization_id = public.current_user_org_id()
    and (
      public.has_any_role(array['admin', 'manager'])
      or (public.has_any_role(array['customer']) and customer_id = auth.uid())
    )
  )
  with check (
    organization_id = public.current_user_org_id()
    and (
      public.has_any_role(array['admin', 'manager'])
      or (public.has_any_role(array['customer']) and customer_id = auth.uid())
    )
  );

create policy "orders_delete" on public.orders
  for delete to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );

drop policy if exists "carriers_select" on public.carriers;
drop policy if exists "carriers_insert" on public.carriers;
drop policy if exists "carriers_update" on public.carriers;
drop policy if exists "carriers_delete" on public.carriers;

create policy "carriers_select" on public.carriers
  for select to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager', 'carrier'])
  );

create policy "carriers_insert" on public.carriers
  for insert to authenticated
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );

create policy "carriers_update" on public.carriers
  for update to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  )
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );

create policy "carriers_delete" on public.carriers
  for delete to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );

drop policy if exists "shipments_select" on public.shipments;
drop policy if exists "shipments_insert" on public.shipments;
drop policy if exists "shipments_update" on public.shipments;
drop policy if exists "shipments_delete" on public.shipments;

create policy "shipments_select" on public.shipments
  for select to authenticated
  using (
    organization_id = public.current_user_org_id()
    and (
      public.has_any_role(array['admin', 'manager', 'carrier'])
      or (
        public.has_any_role(array['customer'])
        and exists (
          select 1
          from public.orders o
          where o.id = shipments.order_id
            and o.customer_id = auth.uid()
        )
      )
    )
  );

create policy "shipments_insert" on public.shipments
  for insert to authenticated
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
    and exists (
      select 1 from public.orders o
      where o.id = shipments.order_id
        and o.organization_id = shipments.organization_id
    )
    and exists (
      select 1 from public.carriers c
      where c.id = shipments.carrier_id
        and c.organization_id = shipments.organization_id
    )
  );

create policy "shipments_update" on public.shipments
  for update to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager', 'carrier'])
  )
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager', 'carrier'])
    and exists (
      select 1 from public.orders o
      where o.id = shipments.order_id
        and o.organization_id = shipments.organization_id
    )
    and exists (
      select 1 from public.carriers c
      where c.id = shipments.carrier_id
        and c.organization_id = shipments.organization_id
    )
  );

create policy "shipments_delete" on public.shipments
  for delete to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );

drop policy if exists "tracking_select" on public.tracking_events;
drop policy if exists "tracking_insert" on public.tracking_events;
drop policy if exists "tracking_update" on public.tracking_events;
drop policy if exists "tracking_delete" on public.tracking_events;

create policy "tracking_select" on public.tracking_events
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
          where s.id = tracking_events.shipment_id
            and o.customer_id = auth.uid()
        )
      )
    )
  );

create policy "tracking_insert" on public.tracking_events
  for insert to authenticated
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager', 'carrier'])
    and exists (
      select 1 from public.shipments s
      where s.id = tracking_events.shipment_id
        and s.organization_id = tracking_events.organization_id
    )
  );

create policy "tracking_update" on public.tracking_events
  for update to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  )
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
    and exists (
      select 1 from public.shipments s
      where s.id = tracking_events.shipment_id
        and s.organization_id = tracking_events.organization_id
    )
  );

create policy "tracking_delete" on public.tracking_events
  for delete to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );

drop policy if exists "documents_select" on public.documents;
drop policy if exists "documents_insert" on public.documents;
drop policy if exists "documents_update" on public.documents;
drop policy if exists "documents_delete" on public.documents;

create policy "documents_select" on public.documents
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
          where s.id = documents.shipment_id
            and o.customer_id = auth.uid()
        )
      )
    )
  );

create policy "documents_insert" on public.documents
  for insert to authenticated
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager', 'carrier'])
    and exists (
      select 1 from public.shipments s
      where s.id = documents.shipment_id
        and s.organization_id = documents.organization_id
    )
  );

create policy "documents_update" on public.documents
  for update to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  )
  with check (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
    and exists (
      select 1 from public.shipments s
      where s.id = documents.shipment_id
        and s.organization_id = documents.organization_id
    )
  );

create policy "documents_delete" on public.documents
  for delete to authenticated
  using (
    organization_id = public.current_user_org_id()
    and public.has_any_role(array['admin', 'manager'])
  );
