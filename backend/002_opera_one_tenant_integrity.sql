-- OPERA ONE — integridade multi-tenant v1
-- Complementa 001_opera_one_production_schema.sql.
-- Garante no banco que relações entre empresa, clientes, veículos,
-- serviços e fechamentos não possam cruzar tenants.

create or replace function public.validate_service_tenant_integrity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.clients c
    where c.id = new.client_id
      and c.company_id = new.company_id
  ) then
    raise exception 'client_id não pertence à mesma empresa do serviço';
  end if;

  if new.vehicle_id is not null and not exists (
    select 1 from public.vehicles v
    where v.id = new.vehicle_id
      and v.company_id = new.company_id
  ) then
    raise exception 'vehicle_id não pertence à mesma empresa do serviço';
  end if;

  return new;
end;
$$;

create or replace function public.validate_closure_tenant_integrity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.clients c
    where c.id = new.client_id
      and c.company_id = new.company_id
  ) then
    raise exception 'client_id não pertence à mesma empresa do fechamento';
  end if;

  return new;
end;
$$;

create or replace function public.validate_closure_service_tenant_integrity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.closures c
    join public.services s on s.id = new.service_id
    where c.id = new.closure_id
      and c.company_id = s.company_id
  ) then
    raise exception 'closure_id e service_id devem pertencer à mesma empresa';
  end if;

  return new;
end;
$$;

revoke all on function public.validate_service_tenant_integrity() from public;
revoke all on function public.validate_closure_tenant_integrity() from public;
revoke all on function public.validate_closure_service_tenant_integrity() from public;

drop trigger if exists trg_services_tenant_integrity on public.services;
create trigger trg_services_tenant_integrity
before insert or update on public.services
for each row execute function public.validate_service_tenant_integrity();

drop trigger if exists trg_closures_tenant_integrity on public.closures;
create trigger trg_closures_tenant_integrity
before insert or update on public.closures
for each row execute function public.validate_closure_tenant_integrity();

drop trigger if exists trg_closure_services_tenant_integrity on public.closure_services;
create trigger trg_closure_services_tenant_integrity
before insert or update on public.closure_services
for each row execute function public.validate_closure_service_tenant_integrity();

create index if not exists idx_closures_client on public.closures(client_id);
create index if not exists idx_closure_services_service on public.closure_services(service_id);
