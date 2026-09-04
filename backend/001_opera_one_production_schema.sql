-- OPERA ONE — schema de produção v1
-- Esta migration complementa backend/database-schema.sql.
-- Executar no SQL Editor do projeto Supabase OPERA ONE.
-- Não contém segredos e não altera o localStorage do aplicativo atual.

create extension if not exists pgcrypto;

-- Perfis de usuário ligados ao Auth do Supabase.
-- A empresa é a unidade de isolamento de dados (multi-tenant).
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  document text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'client' check (role in ('owner','admin','client')),
  created_at timestamptz not null default now()
);

create index if not exists idx_app_users_company on public.app_users(company_id);

-- Cadastros operacionais.
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  document text,
  phone text,
  email text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  plate text,
  type text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_clients_company on public.clients(company_id);
create index if not exists idx_vehicles_company on public.vehicles(company_id);

-- Fretes/serviços. Os custos permanecem determinísticos no sistema.
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  vehicle_id uuid references public.vehicles(id) on delete restrict,
  service_date date not null,
  origin text,
  destination text,
  freight_value numeric(14,2) not null check (freight_value >= 0),
  diesel numeric(14,2) not null default 0 check (diesel >= 0),
  maintenance numeric(14,2) not null default 0 check (maintenance >= 0),
  toll numeric(14,2) not null default 0 check (toll >= 0),
  outsourcing numeric(14,2) not null default 0 check (outsourcing >= 0),
  food numeric(14,2) not null default 0 check (food >= 0),
  hotel numeric(14,2) not null default 0 check (hotel >= 0),
  driver_daily numeric(14,2) not null default 0 check (driver_daily >= 0),
  overtime numeric(14,2) not null default 0 check (overtime >= 0),
  other_costs numeric(14,2) not null default 0 check (other_costs >= 0),
  km numeric(14,2) not null default 0 check (km >= 0),
  status text not null default 'Pendente' check (status in ('Pendente','Recebido')),
  received_value numeric(14,2) not null default 0 check (received_value >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_services_company_date on public.services(company_id, service_date desc);
create index if not exists idx_services_client on public.services(client_id);

-- Fechamentos e vínculo imutável com os serviços utilizados.
create table if not exists public.closures (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  number text not null,
  client_id uuid not null references public.clients(id) on delete restrict,
  period_start date not null,
  period_end date not null,
  created_at timestamptz not null default now(),
  status text not null default 'Salvo',
  total numeric(14,2) not null default 0 check (total >= 0),
  signature text not null,
  unique(company_id, number),
  unique(company_id, signature)
);

create table if not exists public.closure_services (
  closure_id uuid not null references public.closures(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  primary key (closure_id, service_id),
  unique(service_id)
);

create index if not exists idx_closures_company on public.closures(company_id, created_at desc);

-- Licença e assinatura comercial.
create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references public.companies(id) on delete cascade,
  status text not null default 'trial' check (status in ('trial','active','expired','blocked','canceled')),
  plan text not null default 'trial',
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  manual_override boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  provider text not null,
  provider_customer_id text,
  provider_subscription_id text unique,
  plan text not null,
  status text not null default 'pending',
  current_period_start timestamptz,
  current_period_end timestamptz,
  last_payment_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_company on public.subscriptions(company_id);
create index if not exists idx_licenses_status on public.licenses(status);

-- Helper seguro: empresa do usuário autenticado.
create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.app_users where id = auth.uid();
$$;

revoke all on function public.current_company_id() from public;
grant execute on function public.current_company_id() to authenticated;

-- Licença válida somente no servidor.
create or replace function public.license_is_valid(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.licenses l
    where l.company_id = p_company_id
      and l.status in ('trial','active')
      and (l.expires_at is null or l.expires_at > now())
  );
$$;

revoke all on function public.license_is_valid(uuid) from public;
grant execute on function public.license_is_valid(uuid) to authenticated;

-- RLS: cada cliente só acessa a própria empresa.
alter table public.companies enable row level security;
alter table public.app_users enable row level security;
alter table public.clients enable row level security;
alter table public.vehicles enable row level security;
alter table public.services enable row level security;
alter table public.closures enable row level security;
alter table public.closure_services enable row level security;
alter table public.licenses enable row level security;
alter table public.subscriptions enable row level security;

-- Remover políticas desta migration, se ela for reaplicada.
drop policy if exists companies_select_own on public.companies;
drop policy if exists app_users_select_own on public.app_users;
drop policy if exists clients_own_company on public.clients;
drop policy if exists vehicles_own_company on public.vehicles;
drop policy if exists services_own_company on public.services;
drop policy if exists closures_own_company on public.closures;
drop policy if exists closure_services_own_company on public.closure_services;
drop policy if exists licenses_own_company on public.licenses;
drop policy if exists subscriptions_own_company on public.subscriptions;

create policy companies_select_own on public.companies
for select to authenticated using (id = public.current_company_id());

create policy app_users_select_own on public.app_users
for select to authenticated using (company_id = public.current_company_id());

create policy clients_own_company on public.clients
for all to authenticated using (company_id = public.current_company_id()) with check (company_id = public.current_company_id());

create policy vehicles_own_company on public.vehicles
for all to authenticated using (company_id = public.current_company_id()) with check (company_id = public.current_company_id());

create policy services_own_company on public.services
for all to authenticated using (company_id = public.current_company_id()) with check (company_id = public.current_company_id());

create policy closures_own_company on public.closures
for all to authenticated using (company_id = public.current_company_id()) with check (company_id = public.current_company_id());

create policy closure_services_own_company on public.closure_services
for all to authenticated
using (exists (select 1 from public.closures c where c.id = closure_id and c.company_id = public.current_company_id()))
with check (exists (select 1 from public.closures c where c.id = closure_id and c.company_id = public.current_company_id()));

create policy licenses_own_company on public.licenses
for select to authenticated using (company_id = public.current_company_id());

create policy subscriptions_own_company on public.subscriptions
for select to authenticated using (company_id = public.current_company_id());

-- Evita que usuários autenticados alterem a própria empresa/licença/assinatura diretamente.
revoke insert, update, delete on public.companies from authenticated;
revoke insert, update, delete on public.licenses from authenticated;
revoke insert, update, delete on public.subscriptions from authenticated;

-- Não liberar acesso anônimo às tabelas comerciais.
revoke all on public.companies from anon;
revoke all on public.app_users from anon;
revoke all on public.clients from anon;
revoke all on public.vehicles from anon;
revoke all on public.services from anon;
revoke all on public.closures from anon;
revoke all on public.closure_services from anon;
revoke all on public.licenses from anon;
revoke all on public.subscriptions from anon;
