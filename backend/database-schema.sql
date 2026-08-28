-- Assistente Operacional
-- Base de dados preparada para multiempresa, licenças e assinaturas.
-- Aplicar em PostgreSQL/Supabase.

create extension if not exists pgcrypto;

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  document text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists app_users (
  id uuid primary key,
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'client' check (role in ('owner','admin','client')),
  created_at timestamptz not null default now()
);

create table if not exists licenses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references companies(id) on delete cascade,
  status text not null default 'trial' check (status in ('trial','active','expired','blocked','canceled')),
  plan text not null default 'trial',
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  manual_override boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
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

create index if not exists idx_app_users_company on app_users(company_id);
create index if not exists idx_subscriptions_company on subscriptions(company_id);
create index if not exists idx_licenses_status on licenses(status);

-- A licença só deve ser considerada válida no servidor.
-- Nunca confiar em status enviado pelo navegador.
create or replace function license_is_valid(p_company_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from licenses l
    where l.company_id = p_company_id
      and l.status in ('trial','active')
      and (l.expires_at is null or l.expires_at > now())
  );
$$;

-- Webhook de pagamento deverá atualizar subscriptions e, após confirmação,
-- atualizar licenses para active com o período retornado pelo provedor.
