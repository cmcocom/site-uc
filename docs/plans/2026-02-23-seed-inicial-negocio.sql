-- SEED INICIAL DE NEGOCIO (MVP)
-- Fecha: 2026-02-23
-- Requiere:
--   1) 2026-02-23-ddl-inicial-supabase-mvp.sql
--   2) 2026-02-23-rls-endurecimiento-roles.sql
--
-- Objetivo:
-- - Cargar catálogos base en todas las organizaciones existentes.
-- - Crear plantillas iniciales de notificación (email/telegram).
-- - Publicar primera versión de cada plantilla.

begin;

-- =====================================================
-- 1) CATALOGO BASE (ITEMS COMUNES)
-- =====================================================

insert into public.catalog_items (
  organization_id,
  item_type,
  code,
  name,
  description,
  unit,
  base_currency,
  base_price,
  tax_rate,
  is_active,
  metadata
)
select
  o.id,
  'service',
  'SRV-CONS-TI-BASE',
  'Consultoría TI - Diagnóstico Base',
  'Levantamiento inicial de situación tecnológica, riesgos y plan de acción.',
  'SERVICIO',
  'MXN',
  3500,
  16,
  true,
  jsonb_build_object('module', 'consultoria', 'tier', 'base')
from public.organizations o
on conflict (organization_id, code) do update
set
  name = excluded.name,
  description = excluded.description,
  unit = excluded.unit,
  base_currency = excluded.base_currency,
  base_price = excluded.base_price,
  tax_rate = excluded.tax_rate,
  is_active = excluded.is_active,
  metadata = excluded.metadata,
  updated_at = now();

insert into public.catalog_items (
  organization_id,
  item_type,
  code,
  name,
  description,
  unit,
  base_currency,
  base_price,
  tax_rate,
  is_active,
  metadata
)
select
  o.id,
  'service',
  'SRV-SOPORTE-MENSUAL',
  'Soporte TI Mensual',
  'Servicio de soporte correctivo y preventivo mensual para clientes empresariales.',
  'SERVICIO',
  'MXN',
  2800,
  16,
  true,
  jsonb_build_object('module', 'itil', 'tier', 'monthly')
from public.organizations o
on conflict (organization_id, code) do update
set
  name = excluded.name,
  description = excluded.description,
  unit = excluded.unit,
  base_currency = excluded.base_currency,
  base_price = excluded.base_price,
  tax_rate = excluded.tax_rate,
  is_active = excluded.is_active,
  metadata = excluded.metadata,
  updated_at = now();

insert into public.catalog_items (
  organization_id,
  item_type,
  code,
  name,
  description,
  unit,
  base_currency,
  base_price,
  tax_rate,
  is_active,
  metadata
)
select
  o.id,
  'license',
  'LIC-M365-BIZ-STD',
  'Microsoft 365 Business Standard',
  'Licencia Microsoft 365 para productividad empresarial.',
  'LICENCIA',
  'MXN',
  3200,
  16,
  true,
  jsonb_build_object('module', 'licencias', 'vendor', 'microsoft')
from public.organizations o
on conflict (organization_id, code) do update
set
  name = excluded.name,
  description = excluded.description,
  unit = excluded.unit,
  base_currency = excluded.base_currency,
  base_price = excluded.base_price,
  tax_rate = excluded.tax_rate,
  is_active = excluded.is_active,
  metadata = excluded.metadata,
  updated_at = now();

-- =====================================================
-- 2) PLANTILLAS BASE (message_templates)
-- =====================================================

insert into public.message_templates (
  organization_id,
  key,
  channel,
  name,
  description,
  is_active
)
select o.id, 'quote_sent_client_v1', 'email_resend', 'Cotización enviada al cliente',
       'Notifica al cliente cuando se envía una cotización.', true
from public.organizations o
on conflict (organization_id, key, channel) do update
set
  name = excluded.name,
  description = excluded.description,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.message_templates (
  organization_id,
  key,
  channel,
  name,
  description,
  is_active
)
select o.id, 'ticket_created_internal_v1', 'telegram_bot', 'Ticket creado (interno)',
       'Alerta interna para mesa de soporte al crear ticket.', true
from public.organizations o
on conflict (organization_id, key, channel) do update
set
  name = excluded.name,
  description = excluded.description,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.message_templates (
  organization_id,
  key,
  channel,
  name,
  description,
  is_active
)
select o.id, 'invoice_issued_client_v1', 'email_resend', 'CFDI emitido al cliente',
       'Notifica emisión de factura/CFDI al contacto fiscal.', true
from public.organizations o
on conflict (organization_id, key, channel) do update
set
  name = excluded.name,
  description = excluded.description,
  is_active = excluded.is_active,
  updated_at = now();

-- =====================================================
-- 3) VERSIONES BASE (template_versions)
-- =====================================================

with target_templates as (
  select id, organization_id, key, channel
  from public.message_templates
  where key in ('quote_sent_client_v1','ticket_created_internal_v1','invoice_issued_client_v1')
)
insert into public.template_versions (
  organization_id,
  template_id,
  version_number,
  subject,
  body,
  variables,
  is_published
)
select
  tt.organization_id,
  tt.id,
  1,
  case
    when tt.key = 'quote_sent_client_v1' then 'Cotización {{quote_number}} - {{organization_name}}'
    when tt.key = 'invoice_issued_client_v1' then 'CFDI {{invoice_number}} emitido - {{organization_name}}'
    else null
  end as subject,
  case
    when tt.key = 'quote_sent_client_v1' then
      'Hola {{client_name}},\n\nCompartimos tu cotización {{quote_number}} por un total de {{quote_total}}.\n\nGracias,\n{{organization_name}}'
    when tt.key = 'ticket_created_internal_v1' then
      '🛠️ Nuevo ticket {{ticket_number}}\nPrioridad: {{ticket_priority}}\nCliente: {{client_name}}\nEstado: {{ticket_status}}'
    when tt.key = 'invoice_issued_client_v1' then
      'Hola {{client_name}},\n\nTu CFDI {{invoice_number}} ha sido emitido. UUID SAT: {{sat_uuid}}.\n\nSaludos,\n{{organization_name}}'
  end as body,
  case
    when tt.key = 'quote_sent_client_v1' then
      '["organization_name","client_name","quote_number","quote_total"]'::jsonb
    when tt.key = 'ticket_created_internal_v1' then
      '["ticket_number","ticket_priority","ticket_status","client_name"]'::jsonb
    when tt.key = 'invoice_issued_client_v1' then
      '["organization_name","client_name","invoice_number","sat_uuid"]'::jsonb
  end as variables,
  true as is_published
from target_templates tt
on conflict (template_id, version_number) do update
set
  subject = excluded.subject,
  body = excluded.body,
  variables = excluded.variables,
  is_published = excluded.is_published,
  updated_at = now();

-- =====================================================
-- 4) SUSCRIPCIÓN INTERNA BÁSICA (opcional)
-- =====================================================
-- Nota: requiere usuarios reales en organization_members.
-- Se crea suscripción genérica por usuario para ticket.created vía telegram.

insert into public.notification_subscriptions (
  organization_id,
  user_id,
  channel,
  destination,
  event_type,
  is_enabled,
  quiet_hours
)
select
  om.organization_id,
  om.user_id,
  'telegram_bot',
  '8507198385',
  'ticket.created',
  true,
  null
from public.organization_members om
where om.status = 'active'
on conflict do nothing;

commit;

-- FIN SEED INICIAL
