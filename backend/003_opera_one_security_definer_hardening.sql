-- OPERA ONE — hardening de funções SECURITY DEFINER v1
-- Move helpers sensíveis para schema privado, fora da superfície da Data API.
-- Mantém current_company_id disponível para as políticas RLS.

create schema if not exists private;

create or replace function private.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select company_id
  from public.app_users
  where id = (select auth.uid());
$$;

create or replace function private.license_is_valid(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.licenses l
    where l.company_id = p_company_id
      and l.status in ('trial','active')
      and (l.expires_at is null or l.expires_at > now())
  );
$$;

revoke all on function public.current_company_id() from public;
revoke all on function public.current_company_id() from anon, authenticated;
revoke all on function public.license_is_valid(uuid) from public;
revoke all on function public.license_is_valid(uuid) from anon, authenticated;

grant usage on schema private to authenticated;
grant execute on function private.current_company_id() to authenticated;
revoke execute on function private.license_is_valid(uuid) from public, anon, authenticated;

-- Atualiza as políticas para usar o helper privado.
drop policy if exists companies_select_own on public.companies;
create policy companies_select_own on public.companies
for select to authenticated using (id = (select private.current_company_id()));

drop policy if exists app_users_select_own on public.app_users;
create policy app_users_select_own on public.app_users
for select to authenticated using (company_id = (select private.current_company_id()));

drop policy if exists clients_own_company on public.clients;
create policy clients_own_company on public.clients
for all to authenticated
using (company_id = (select private.current_company_id()))
with check (company_id = (select private.current_company_id()));

drop policy if exists vehicles_own_company on public.vehicles;
create policy vehicles_own_company on public.vehicles
for all to authenticated
using (company_id = (select private.current_company_id()))
with check (company_id = (select private.current_company_id()));

drop policy if exists services_own_company on public.services;
create policy services_own_company on public.services
for all to authenticated
using (company_id = (select private.current_company_id()))
with check (company_id = (select private.current_company_id()));

drop policy if exists closures_own_company on public.closures;
create policy closures_own_company on public.closures
for all to authenticated
using (company_id = (select private.current_company_id()))
with check (company_id = (select private.current_company_id()));

drop policy if exists closure_services_own_company on public.closure_services;
create policy closure_services_own_company on public.closure_services
for all to authenticated
using (
  exists (
    select 1
    from public.closures c
    where c.id = closure_id
      and c.company_id = (select private.current_company_id())
  )
)
with check (
  exists (
    select 1
    from public.closures c
    where c.id = closure_id
      and c.company_id = (select private.current_company_id())
  )
);

drop policy if exists licenses_own_company on public.licenses;
create policy licenses_own_company on public.licenses
for select to authenticated using (company_id = (select private.current_company_id()));

drop policy if exists subscriptions_own_company on public.subscriptions;
create policy subscriptions_own_company on public.subscriptions
for select to authenticated using (company_id = (select private.current_company_id()));

-- Os helpers antigos deixam de existir na superfície pública.
drop function if exists public.current_company_id();
drop function if exists public.license_is_valid(uuid);
