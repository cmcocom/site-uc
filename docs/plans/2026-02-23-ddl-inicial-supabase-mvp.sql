-- DDL INICIAL SUPABASE MVP
-- Fecha: 2026-02-23
-- Alcance: Núcleo organizacional + seguridad + comercial + CFDI + ITIL base + consultoría + licencias + plantillas + notificaciones
-- Compatibilidad: Supabase Postgres
--
-- RECOMENDACIÓN DE EJECUCIÓN:
-- 1) Ejecutar completo en ambiente DEV
-- 2) Verificar tablas, índices y políticas RLS
-- 3) Cargar seed de roles/permisos/catálogos en script separado

begin;

create extension if not exists pgcrypto;

-- =====================================================
-- 0) HELPERS
-- =====================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

-- current_org_ids / has_org_role se crean después de crear tablas base

-- =====================================================
-- 1) SEGURIDAD Y NÚCLEO ORGANIZACIONAL
-- =====================================================

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  status text not null default 'active' check (status in ('active','suspended','closed')),
  timezone text not null default 'America/Mexico_City',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_slug_uk unique (slug)
);

create table if not exists public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  phone text,
  avatar_url text,
  status text not null default 'active' check (status in ('active','invited','blocked')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  label text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roles_key_uk unique (key)
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  label text not null,
  module text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint permissions_key_uk unique (key)
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint role_permissions_role_permission_uk unique (role_id, permission_id)
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  status text not null default 'active' check (status in ('active','invited','inactive')),
  invited_by uuid references auth.users(id),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_members_org_user_uk unique (organization_id, user_id)
);

create index if not exists idx_org_members_org on public.organization_members(organization_id);
create index if not exists idx_org_members_user on public.organization_members(user_id);
create index if not exists idx_org_members_role on public.organization_members(role_id);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  module text not null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_audit_org_created on public.audit_events(organization_id, created_at desc);
create index if not exists idx_audit_resource on public.audit_events(resource_type, resource_id);

-- =====================================================
-- 2) COMERCIAL + CLIENTES + CATALOGO + COTIZACIONES
-- =====================================================

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_type text not null default 'company' check (client_type in ('company','person')),
  legal_name text not null,
  trade_name text,
  email text,
  phone text,
  website text,
  status text not null default 'active' check (status in ('active','inactive')),
  tags jsonb not null default '[]'::jsonb,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clients_org_legal_name_uk unique (organization_id, legal_name)
);

create index if not exists idx_clients_org on public.clients(organization_id);
create index if not exists idx_clients_status on public.clients(organization_id, status);

create table if not exists public.client_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  role_title text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_client_contacts_org on public.client_contacts(organization_id);
create index if not exists idx_client_contacts_client on public.client_contacts(client_id);

create table if not exists public.client_fiscal_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  rfc text not null,
  regimen_fiscal_code text,
  uso_cfdi_default text,
  postal_code text,
  billing_email text,
  is_active boolean not null default true,
  valid_from date,
  valid_to date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_fiscal_profiles_org_client_rfc_uk unique (organization_id, client_id, rfc)
);

create unique index if not exists idx_client_fiscal_active_one
on public.client_fiscal_profiles (organization_id, client_id)
where is_active = true;

create index if not exists idx_client_fiscal_org on public.client_fiscal_profiles(organization_id);
create index if not exists idx_client_fiscal_client on public.client_fiscal_profiles(client_id);

create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  item_type text not null check (item_type in ('product','service','license','template')),
  code text,
  name text not null,
  description text,
  unit text,
  base_currency text not null default 'MXN' check (base_currency in ('MXN','USD')),
  base_price numeric(14,2) not null default 0,
  tax_rate numeric(5,2) not null default 16,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint catalog_items_org_code_uk unique (organization_id, code)
);

create index if not exists idx_catalog_org_type on public.catalog_items(organization_id, item_type);
create index if not exists idx_catalog_org_active on public.catalog_items(organization_id, is_active);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  quote_number text not null,
  client_id uuid not null references public.clients(id),
  contact_id uuid references public.client_contacts(id),
  status text not null default 'draft' check (status in ('draft','sent','approved','rejected','expired','cancelled')),
  issued_at date not null default current_date,
  expires_at date,
  currency text not null default 'MXN' check (currency in ('MXN','USD')),
  exchange_rate numeric(12,6) not null default 1,
  subtotal numeric(14,2) not null default 0,
  discount_total numeric(14,2) not null default 0,
  tax_total numeric(14,2) not null default 0,
  grand_total numeric(14,2) not null default 0,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotes_org_quote_number_uk unique (organization_id, quote_number)
);

create index if not exists idx_quotes_org on public.quotes(organization_id);
create index if not exists idx_quotes_client on public.quotes(client_id);
create index if not exists idx_quotes_status on public.quotes(organization_id, status);
create index if not exists idx_quotes_issued_at on public.quotes(organization_id, issued_at desc);

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  quote_id uuid not null references public.quotes(id) on delete cascade,
  line_number int not null,
  catalog_item_id uuid references public.catalog_items(id),
  item_code text,
  description text not null,
  unit text,
  quantity numeric(14,3) not null default 1,
  unit_price numeric(14,2) not null default 0,
  margin_percent numeric(6,2) not null default 0,
  discount_percent numeric(6,2) not null default 0,
  tax_rate numeric(5,2) not null default 16,
  line_subtotal numeric(14,2) not null default 0,
  line_total numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quote_items_quote_line_uk unique (quote_id, line_number)
);

create index if not exists idx_quote_items_org on public.quote_items(organization_id);
create index if not exists idx_quote_items_quote on public.quote_items(quote_id);

create table if not exists public.quote_status_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  quote_id uuid not null references public.quotes(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references auth.users(id),
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_quote_history_org_quote on public.quote_status_history(organization_id, quote_id, created_at desc);

-- =====================================================
-- 3) CFDI
-- =====================================================

create table if not exists public.cfdi_preferences (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  default_payment_method text check (default_payment_method in ('PUE','PPD')),
  default_payment_form text,
  default_uso_cfdi text,
  default_currency text check (default_currency in ('MXN','USD')),
  default_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cfdi_preferences_org_client_uk unique (organization_id, client_id)
);

create index if not exists idx_cfdi_pref_org on public.cfdi_preferences(organization_id);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id),
  quote_id uuid references public.quotes(id),
  invoice_number text not null,
  status text not null default 'draft' check (status in ('draft','issued','paid','partial_paid','cancelled')),
  cfdi_type text not null default 'I',
  payment_method text check (payment_method in ('PUE','PPD')),
  payment_form text,
  currency text not null default 'MXN' check (currency in ('MXN','USD')),
  exchange_rate numeric(12,6) not null default 1,
  subtotal numeric(14,2) not null default 0,
  tax_total numeric(14,2) not null default 0,
  grand_total numeric(14,2) not null default 0,
  sat_uuid text,
  fiscal_snapshot jsonb not null default '{}'::jsonb,
  issued_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_org_invoice_number_uk unique (organization_id, invoice_number)
);

create index if not exists idx_invoices_org on public.invoices(organization_id);
create index if not exists idx_invoices_client on public.invoices(client_id);
create index if not exists idx_invoices_status on public.invoices(organization_id, status);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  line_number int not null,
  catalog_item_id uuid references public.catalog_items(id),
  description text not null,
  quantity numeric(14,3) not null default 1,
  unit_price numeric(14,2) not null default 0,
  tax_rate numeric(5,2) not null default 16,
  line_subtotal numeric(14,2) not null default 0,
  line_total numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoice_items_invoice_line_uk unique (invoice_id, line_number)
);

create index if not exists idx_invoice_items_org on public.invoice_items(organization_id);
create index if not exists idx_invoice_items_invoice on public.invoice_items(invoice_id);

create table if not exists public.payment_complements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  folio text not null,
  paid_at timestamptz not null,
  payment_form text,
  amount numeric(14,2) not null default 0,
  previous_balance numeric(14,2) not null default 0,
  remaining_balance numeric(14,2) not null default 0,
  currency text not null default 'MXN' check (currency in ('MXN','USD')),
  exchange_rate numeric(12,6) not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_complements_org_folio_uk unique (organization_id, folio)
);

create index if not exists idx_paycomp_org on public.payment_complements(organization_id);
create index if not exists idx_paycomp_invoice on public.payment_complements(invoice_id);

-- =====================================================
-- 4) ITIL BASE + ACTIVOS
-- =====================================================

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id),
  asset_code text not null,
  asset_type text not null check (asset_type in ('hardware','software','network','server','database','application','service','other')),
  name text not null,
  status text not null default 'active' check (status in ('active','maintenance','retired','stock')),
  serial_number text,
  manufacturer text,
  model text,
  location text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assets_org_asset_code_uk unique (organization_id, asset_code)
);

create index if not exists idx_assets_org on public.assets(organization_id);
create index if not exists idx_assets_client on public.assets(client_id);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  ticket_number text not null,
  ticket_type text not null default 'incident' check (ticket_type in ('incident','service_request','problem','change')),
  client_id uuid references public.clients(id),
  requester_contact_id uuid references public.client_contacts(id),
  assigned_user_id uuid references auth.users(id),
  asset_id uuid references public.assets(id),
  title text not null,
  description text,
  category text,
  priority text not null default 'medium' check (priority in ('low','medium','high','critical')),
  status text not null default 'new' check (status in ('new','assigned','in_progress','pending','resolved','closed','cancelled')),
  due_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tickets_org_ticket_number_uk unique (organization_id, ticket_number)
);

create index if not exists idx_tickets_org on public.tickets(organization_id);
create index if not exists idx_tickets_client on public.tickets(client_id);
create index if not exists idx_tickets_status on public.tickets(organization_id, status);
create index if not exists idx_tickets_priority on public.tickets(organization_id, priority);

create table if not exists public.ticket_comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  author_user_id uuid references auth.users(id),
  comment_type text not null default 'internal' check (comment_type in ('internal','public','resolution')),
  body text not null,
  time_spent_minutes int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ticket_comments_org on public.ticket_comments(organization_id);
create index if not exists idx_ticket_comments_ticket on public.ticket_comments(ticket_id);

create table if not exists public.ticket_sla (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  response_target_minutes int,
  resolution_target_minutes int,
  response_breached boolean not null default false,
  resolution_breached boolean not null default false,
  first_response_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ticket_sla_org_ticket_uk unique (organization_id, ticket_id)
);

create index if not exists idx_ticket_sla_org on public.ticket_sla(organization_id);

-- =====================================================
-- 5) CONSULTORÍA TI
-- =====================================================

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id),
  title text not null,
  status text not null default 'draft' check (status in ('draft','in_progress','completed','archived')),
  surveyed_by text,
  surveyed_at date,
  summary text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_assessments_org on public.assessments(organization_id);
create index if not exists idx_assessments_client on public.assessments(client_id);

create table if not exists public.assessment_sections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  section_key text not null,
  title text not null,
  position int not null default 0,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assessment_sections_assessment_key_uk unique (assessment_id, section_key)
);

create index if not exists idx_assessment_sections_org on public.assessment_sections(organization_id);

create table if not exists public.assessment_answers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  section_id uuid references public.assessment_sections(id) on delete set null,
  question_key text not null,
  answer_value jsonb not null,
  answered_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assessment_answers_unique_question unique (assessment_id, question_key)
);

create index if not exists idx_assessment_answers_org on public.assessment_answers(organization_id);
create index if not exists idx_assessment_answers_assessment on public.assessment_answers(assessment_id);

create table if not exists public.assessment_systems (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  asset_id uuid references public.assets(id),
  name text not null,
  process_name text,
  location text,
  system_type text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_assessment_systems_org on public.assessment_systems(organization_id);
create index if not exists idx_assessment_systems_assessment on public.assessment_systems(assessment_id);

create table if not exists public.assessment_criticality_scores (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assessment_system_id uuid not null references public.assessment_systems(id) on delete cascade,
  operational_score int not null check (operational_score between 1 and 5),
  financial_score int not null check (financial_score between 1 and 5),
  reputational_score int not null check (reputational_score between 1 and 5),
  continuity_score int not null check (continuity_score between 1 and 5),
  weighted_score numeric(8,4),
  rto text,
  rpo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assessment_criticality_system_uk unique (assessment_system_id)
);

create index if not exists idx_assessment_criticality_org on public.assessment_criticality_scores(organization_id);

-- =====================================================
-- 6) LICENCIAS + PLANTILLAS + NOTIFICACIONES
-- =====================================================

create table if not exists public.license_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  priority int not null default 100,
  conditions jsonb not null,
  recommendation jsonb not null,
  valid_from date,
  valid_to date,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_license_rules_org_active on public.license_rules(organization_id, is_active);

create table if not exists public.license_recommendations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id),
  quote_id uuid references public.quotes(id),
  input_payload jsonb not null,
  output_payload jsonb not null,
  generated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_license_reco_org on public.license_recommendations(organization_id, created_at desc);

create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  key text not null,
  channel text not null check (channel in ('email_resend','telegram_bot')),
  name text not null,
  description text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint message_templates_org_key_channel_uk unique (organization_id, key, channel)
);

create index if not exists idx_message_templates_org on public.message_templates(organization_id);

create table if not exists public.template_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  template_id uuid not null references public.message_templates(id) on delete cascade,
  version_number int not null,
  subject text,
  body text not null,
  variables jsonb not null default '[]'::jsonb,
  is_published boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint template_versions_template_version_uk unique (template_id, version_number)
);

create index if not exists idx_template_versions_org on public.template_versions(organization_id);

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  event_type text not null,
  resource_type text not null,
  resource_id uuid,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','processing','completed','failed','cancelled')),
  idempotency_key text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_events_org_idempotency_uk unique (organization_id, idempotency_key)
);

create index if not exists idx_notification_events_org_status on public.notification_events(organization_id, status, created_at);

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  event_id uuid not null references public.notification_events(id) on delete cascade,
  channel text not null check (channel in ('email_resend','telegram_bot')),
  recipient text not null,
  template_version_id uuid references public.template_versions(id),
  status text not null default 'queued' check (status in ('queued','sent','delivered','failed','bounced','complained')),
  provider_message_id text,
  error_message text,
  attempts int not null default 0,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_notification_deliveries_org on public.notification_deliveries(organization_id, created_at desc);
create index if not exists idx_notification_deliveries_event on public.notification_deliveries(event_id);

create table if not exists public.notification_subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id),
  client_contact_id uuid references public.client_contacts(id),
  channel text not null check (channel in ('email_resend','telegram_bot')),
  destination text not null,
  event_type text,
  is_enabled boolean not null default true,
  quiet_hours jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_notification_subscriptions_org on public.notification_subscriptions(organization_id);

-- =====================================================
-- 6.1) FUNCIONES QUE DEPENDEN DE TABLAS BASE
-- =====================================================

create or replace function public.current_org_ids()
returns setof uuid
language sql
stable
as $$
  select om.organization_id
  from public.organization_members om
  where om.user_id = auth.uid()
    and om.status = 'active';
$$;

create or replace function public.has_org_role(p_organization_id uuid, p_roles text[])
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.organization_members om
    join public.roles r on r.id = om.role_id
    where om.organization_id = p_organization_id
      and om.user_id = auth.uid()
      and om.status = 'active'
      and r.key = any(p_roles)
  );
$$;

-- =====================================================
-- 7) TRIGGERS updated_at
-- =====================================================

do $$
declare
  t record;
begin
  for t in
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename in (
        'organizations','users_profile','roles','permissions','role_permissions','organization_members','audit_events',
        'clients','client_contacts','client_fiscal_profiles','catalog_items','quotes','quote_items','quote_status_history',
        'cfdi_preferences','invoices','invoice_items','payment_complements',
        'assets','tickets','ticket_comments','ticket_sla',
        'assessments','assessment_sections','assessment_answers','assessment_systems','assessment_criticality_scores',
        'license_rules','license_recommendations','message_templates','template_versions',
        'notification_events','notification_deliveries','notification_subscriptions'
      )
  loop
    execute format('drop trigger if exists trg_%I_set_updated_at on public.%I', t.tablename, t.tablename);
    execute format('create trigger trg_%I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t.tablename, t.tablename);
  end loop;
end;
$$;

-- =====================================================
-- 8) RLS BASE
-- =====================================================

alter table public.organizations enable row level security;
alter table public.users_profile enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.organization_members enable row level security;
alter table public.audit_events enable row level security;

alter table public.clients enable row level security;
alter table public.client_contacts enable row level security;
alter table public.client_fiscal_profiles enable row level security;
alter table public.catalog_items enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.quote_status_history enable row level security;

alter table public.cfdi_preferences enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payment_complements enable row level security;

alter table public.assets enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_comments enable row level security;
alter table public.ticket_sla enable row level security;

alter table public.assessments enable row level security;
alter table public.assessment_sections enable row level security;
alter table public.assessment_answers enable row level security;
alter table public.assessment_systems enable row level security;
alter table public.assessment_criticality_scores enable row level security;

alter table public.license_rules enable row level security;
alter table public.license_recommendations enable row level security;
alter table public.message_templates enable row level security;
alter table public.template_versions enable row level security;
alter table public.notification_events enable row level security;
alter table public.notification_deliveries enable row level security;
alter table public.notification_subscriptions enable row level security;

-- USERS PROFILE: cada usuario ve/edita su perfil

drop policy if exists users_profile_self_select on public.users_profile;
create policy users_profile_self_select
on public.users_profile
for select
to authenticated
using (id = auth.uid());

drop policy if exists users_profile_self_update on public.users_profile;
create policy users_profile_self_update
on public.users_profile
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- MEMBERSHIPS: cada usuario ve sus membresías

drop policy if exists org_members_self_select on public.organization_members;
create policy org_members_self_select
on public.organization_members
for select
to authenticated
using (user_id = auth.uid());

-- ORGANIZATIONS: visible para miembros activos

drop policy if exists organizations_member_select on public.organizations;
create policy organizations_member_select
on public.organizations
for select
to authenticated
using (id in (select public.current_org_ids()));

-- ROLES/PERMISSIONS/ROLE_PERMISSIONS: sólo lectura para autenticados

drop policy if exists roles_read_auth on public.roles;
create policy roles_read_auth
on public.roles
for select
to authenticated
using (true);

drop policy if exists permissions_read_auth on public.permissions;
create policy permissions_read_auth
on public.permissions
for select
to authenticated
using (true);

drop policy if exists role_permissions_read_auth on public.role_permissions;
create policy role_permissions_read_auth
on public.role_permissions
for select
to authenticated
using (true);

-- AUDIT: lectura admin/owner de su organización; inserción para miembros activos

drop policy if exists audit_events_select on public.audit_events;
create policy audit_events_select
on public.audit_events
for select
to authenticated
using (
  organization_id in (select public.current_org_ids())
  and public.has_org_role(organization_id, array['owner','admin'])
);

drop policy if exists audit_events_insert on public.audit_events;
create policy audit_events_insert
on public.audit_events
for insert
to authenticated
with check (organization_id in (select public.current_org_ids()));

-- Plantilla de políticas por organization_id para tablas de negocio
-- SELECT/INSERT/UPDATE/DELETE para miembros activos (ajuste fino por rol en entregable 2)

do $$
declare
  tbl text;
  tables text[] := array[
    'clients','client_contacts','client_fiscal_profiles','catalog_items','quotes','quote_items','quote_status_history',
    'cfdi_preferences','invoices','invoice_items','payment_complements',
    'assets','tickets','ticket_comments','ticket_sla',
    'assessments','assessment_sections','assessment_answers','assessment_systems','assessment_criticality_scores',
    'license_rules','license_recommendations','message_templates','template_versions',
    'notification_events','notification_deliveries','notification_subscriptions'
  ];
begin
  foreach tbl in array tables
  loop
    execute format('drop policy if exists %I_select_org on public.%I', tbl, tbl);
    execute format('create policy %I_select_org on public.%I for select to authenticated using (organization_id in (select public.current_org_ids()))', tbl, tbl);

    execute format('drop policy if exists %I_insert_org on public.%I', tbl, tbl);
    execute format('create policy %I_insert_org on public.%I for insert to authenticated with check (organization_id in (select public.current_org_ids()))', tbl, tbl);

    execute format('drop policy if exists %I_update_org on public.%I', tbl, tbl);
    execute format('create policy %I_update_org on public.%I for update to authenticated using (organization_id in (select public.current_org_ids())) with check (organization_id in (select public.current_org_ids()))', tbl, tbl);

    execute format('drop policy if exists %I_delete_org on public.%I', tbl, tbl);
    execute format('create policy %I_delete_org on public.%I for delete to authenticated using (organization_id in (select public.current_org_ids()))', tbl, tbl);
  end loop;
end;
$$;

commit;

-- FIN DEL DDL INICIAL
-- SIGUIENTE ENTREGABLE: matriz exacta de permisos CRUD por rol y endurecimiento de políticas por módulo.