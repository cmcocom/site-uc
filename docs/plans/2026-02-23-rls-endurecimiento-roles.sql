-- ENDURECIMIENTO RLS POR ROL (ENTREGABLE 2)
-- Fecha: 2026-02-23
-- Requiere: ejecutar antes `2026-02-23-ddl-inicial-supabase-mvp.sql`

begin;

-- =====================================================
-- 1) FUNCIONES DE AUTORIZACIÓN
-- =====================================================

create or replace function public.has_permission(p_organization_id uuid, p_permission_key text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.organization_members om
    join public.role_permissions rp on rp.role_id = om.role_id
    join public.permissions p on p.id = rp.permission_id
    where om.organization_id = p_organization_id
      and om.user_id = auth.uid()
      and om.status = 'active'
      and p.key = p_permission_key
  );
$$;

-- =====================================================
-- 2) ROLES Y PERMISOS (SEED MÍNIMO)
-- =====================================================

insert into public.roles (key, label, is_system)
values
  ('owner', 'Owner', true),
  ('admin', 'Administrador', true),
  ('ventas', 'Ventas', true),
  ('facturacion', 'Facturación', true),
  ('soporte', 'Soporte', true),
  ('consultor', 'Consultor', true),
  ('lectura', 'Solo Lectura', true)
on conflict (key) do update
set label = excluded.label,
    is_system = excluded.is_system,
    updated_at = now();

insert into public.permissions (key, label, module)
values
  ('clients.read', 'Leer clientes', 'comercial'),
  ('clients.write', 'Gestionar clientes', 'comercial'),

  ('fiscal.read', 'Leer fiscal/CFDI', 'cfdi'),
  ('fiscal.write', 'Gestionar fiscal/CFDI', 'cfdi'),
  ('cfdi.approve', 'Aprobar/cancelar CFDI', 'cfdi'),

  ('catalog.read', 'Leer catálogo', 'comercial'),
  ('catalog.write', 'Gestionar catálogo', 'comercial'),

  ('quotes.read', 'Leer cotizaciones', 'comercial'),
  ('quotes.write', 'Gestionar cotizaciones', 'comercial'),
  ('quotes.approve', 'Aprobar cotizaciones', 'comercial'),

  ('tickets.read', 'Leer tickets', 'itil'),
  ('tickets.write', 'Gestionar tickets', 'itil'),
  ('tickets.approve', 'Cerrar/aprobar tickets', 'itil'),

  ('assets.read', 'Leer activos', 'itil'),
  ('assets.write', 'Gestionar activos', 'itil'),

  ('assessments.read', 'Leer consultorías', 'consultoria'),
  ('assessments.write', 'Gestionar consultorías', 'consultoria'),

  ('licenses.read', 'Leer licencias', 'licencias'),
  ('licenses.write', 'Gestionar licencias', 'licencias'),

  ('templates.read', 'Leer plantillas', 'comunicacion'),
  ('templates.write', 'Gestionar plantillas', 'comunicacion'),

  ('notifications.read', 'Leer notificaciones', 'comunicacion'),
  ('notifications.write', 'Gestionar notificaciones', 'comunicacion'),

  ('audit.read', 'Leer auditoría', 'seguridad'),
  ('security.members.write', 'Gestionar miembros', 'seguridad')
on conflict (key) do update
set label = excluded.label,
    module = excluded.module,
    updated_at = now();

-- Limpieza de mappings previos de sistema para regenerar matriz
with system_roles as (
  select id from public.roles where is_system = true
)
delete from public.role_permissions rp
using system_roles sr
where rp.role_id = sr.id;

-- Helper para asignar permisos a roles
with rp(role_key, perm_key) as (
  values
    -- owner/admin: todo
    ('owner','clients.read'),('owner','clients.write'),
    ('owner','fiscal.read'),('owner','fiscal.write'),('owner','cfdi.approve'),
    ('owner','catalog.read'),('owner','catalog.write'),
    ('owner','quotes.read'),('owner','quotes.write'),('owner','quotes.approve'),
    ('owner','tickets.read'),('owner','tickets.write'),('owner','tickets.approve'),
    ('owner','assets.read'),('owner','assets.write'),
    ('owner','assessments.read'),('owner','assessments.write'),
    ('owner','licenses.read'),('owner','licenses.write'),
    ('owner','templates.read'),('owner','templates.write'),
    ('owner','notifications.read'),('owner','notifications.write'),
    ('owner','audit.read'),('owner','security.members.write'),

    ('admin','clients.read'),('admin','clients.write'),
    ('admin','fiscal.read'),('admin','fiscal.write'),('admin','cfdi.approve'),
    ('admin','catalog.read'),('admin','catalog.write'),
    ('admin','quotes.read'),('admin','quotes.write'),('admin','quotes.approve'),
    ('admin','tickets.read'),('admin','tickets.write'),('admin','tickets.approve'),
    ('admin','assets.read'),('admin','assets.write'),
    ('admin','assessments.read'),('admin','assessments.write'),
    ('admin','licenses.read'),('admin','licenses.write'),
    ('admin','templates.read'),('admin','templates.write'),
    ('admin','notifications.read'),('admin','notifications.write'),
    ('admin','audit.read'),('admin','security.members.write'),

    -- ventas
    ('ventas','clients.read'),('ventas','clients.write'),
    ('ventas','fiscal.read'),
    ('ventas','catalog.read'),
    ('ventas','quotes.read'),('ventas','quotes.write'),('ventas','quotes.approve'),
    ('ventas','tickets.read'),('ventas','tickets.write'),
    ('ventas','assets.read'),
    ('ventas','assessments.read'),
    ('ventas','licenses.read'),('ventas','licenses.write'),
    ('ventas','templates.read'),('ventas','templates.write'),
    ('ventas','notifications.read'),('ventas','notifications.write'),

    -- facturacion
    ('facturacion','clients.read'),
    ('facturacion','fiscal.read'),('facturacion','fiscal.write'),('facturacion','cfdi.approve'),
    ('facturacion','catalog.read'),
    ('facturacion','quotes.read'),
    ('facturacion','tickets.read'),
    ('facturacion','assets.read'),
    ('facturacion','assessments.read'),
    ('facturacion','licenses.read'),
    ('facturacion','templates.read'),('facturacion','templates.write'),
    ('facturacion','notifications.read'),

    -- soporte
    ('soporte','clients.read'),
    ('soporte','fiscal.read'),
    ('soporte','catalog.read'),
    ('soporte','quotes.read'),
    ('soporte','tickets.read'),('soporte','tickets.write'),('soporte','tickets.approve'),
    ('soporte','assets.read'),('soporte','assets.write'),
    ('soporte','assessments.read'),
    ('soporte','licenses.read'),
    ('soporte','templates.read'),('soporte','templates.write'),
    ('soporte','notifications.read'),

    -- consultor
    ('consultor','clients.read'),
    ('consultor','fiscal.read'),
    ('consultor','catalog.read'),
    ('consultor','quotes.read'),
    ('consultor','tickets.read'),('consultor','tickets.write'),
    ('consultor','assets.read'),('consultor','assets.write'),
    ('consultor','assessments.read'),('consultor','assessments.write'),
    ('consultor','licenses.read'),('consultor','licenses.write'),
    ('consultor','templates.read'),('consultor','templates.write'),
    ('consultor','notifications.read'),

    -- lectura
    ('lectura','clients.read'),
    ('lectura','fiscal.read'),
    ('lectura','catalog.read'),
    ('lectura','quotes.read'),
    ('lectura','tickets.read'),
    ('lectura','assets.read'),
    ('lectura','assessments.read'),
    ('lectura','licenses.read'),
    ('lectura','templates.read'),
    ('lectura','notifications.read')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from rp
join public.roles r on r.key = rp.role_key
join public.permissions p on p.key = rp.perm_key
on conflict (role_id, permission_id) do nothing;

-- =====================================================
-- 3) ENDURECIMIENTO DE POLÍTICAS (DROP BASE + CREATE POR PERMISO)
-- =====================================================

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
    execute format('drop policy if exists %I_insert_org on public.%I', tbl, tbl);
    execute format('drop policy if exists %I_update_org on public.%I', tbl, tbl);
    execute format('drop policy if exists %I_delete_org on public.%I', tbl, tbl);
  end loop;
end;
$$;

-- -------- CLIENTES --------
create policy clients_select_perm on public.clients
for select to authenticated
using (public.has_permission(organization_id, 'clients.read'));

create policy clients_insert_perm on public.clients
for insert to authenticated
with check (public.has_permission(organization_id, 'clients.write'));

create policy clients_update_perm on public.clients
for update to authenticated
using (public.has_permission(organization_id, 'clients.write'))
with check (public.has_permission(organization_id, 'clients.write'));

create policy clients_delete_perm on public.clients
for delete to authenticated
using (public.has_permission(organization_id, 'clients.write'));

create policy client_contacts_select_perm on public.client_contacts
for select to authenticated
using (public.has_permission(organization_id, 'clients.read'));

create policy client_contacts_write_perm on public.client_contacts
for all to authenticated
using (public.has_permission(organization_id, 'clients.write'))
with check (public.has_permission(organization_id, 'clients.write'));

-- -------- FISCAL / CFDI --------
create policy client_fiscal_select_perm on public.client_fiscal_profiles
for select to authenticated
using (public.has_permission(organization_id, 'fiscal.read'));

create policy client_fiscal_write_perm on public.client_fiscal_profiles
for all to authenticated
using (public.has_permission(organization_id, 'fiscal.write'))
with check (public.has_permission(organization_id, 'fiscal.write'));

create policy cfdi_preferences_select_perm on public.cfdi_preferences
for select to authenticated
using (public.has_permission(organization_id, 'fiscal.read'));

create policy cfdi_preferences_write_perm on public.cfdi_preferences
for all to authenticated
using (public.has_permission(organization_id, 'fiscal.write'))
with check (public.has_permission(organization_id, 'fiscal.write'));

create policy invoices_select_perm on public.invoices
for select to authenticated
using (public.has_permission(organization_id, 'fiscal.read'));

create policy invoices_write_perm on public.invoices
for insert to authenticated
with check (public.has_permission(organization_id, 'fiscal.write'));

create policy invoices_update_perm on public.invoices
for update to authenticated
using (public.has_permission(organization_id, 'fiscal.write'))
with check (public.has_permission(organization_id, 'fiscal.write'));

create policy invoices_delete_perm on public.invoices
for delete to authenticated
using (public.has_permission(organization_id, 'cfdi.approve'));

create policy invoice_items_select_perm on public.invoice_items
for select to authenticated
using (public.has_permission(organization_id, 'fiscal.read'));

create policy invoice_items_write_perm on public.invoice_items
for all to authenticated
using (public.has_permission(organization_id, 'fiscal.write'))
with check (public.has_permission(organization_id, 'fiscal.write'));

create policy payment_complements_select_perm on public.payment_complements
for select to authenticated
using (public.has_permission(organization_id, 'fiscal.read'));

create policy payment_complements_write_perm on public.payment_complements
for all to authenticated
using (public.has_permission(organization_id, 'fiscal.write'))
with check (public.has_permission(organization_id, 'fiscal.write'));

-- -------- CATÁLOGO --------
create policy catalog_items_select_perm on public.catalog_items
for select to authenticated
using (public.has_permission(organization_id, 'catalog.read'));

create policy catalog_items_write_perm on public.catalog_items
for all to authenticated
using (public.has_permission(organization_id, 'catalog.write'))
with check (public.has_permission(organization_id, 'catalog.write'));

-- -------- COTIZACIONES --------
create policy quotes_select_perm on public.quotes
for select to authenticated
using (public.has_permission(organization_id, 'quotes.read'));

create policy quotes_insert_perm on public.quotes
for insert to authenticated
with check (public.has_permission(organization_id, 'quotes.write'));

create policy quotes_update_perm on public.quotes
for update to authenticated
using (public.has_permission(organization_id, 'quotes.write'))
with check (public.has_permission(organization_id, 'quotes.write'));

create policy quotes_delete_perm on public.quotes
for delete to authenticated
using (public.has_permission(organization_id, 'quotes.write'));

create policy quote_items_select_perm on public.quote_items
for select to authenticated
using (public.has_permission(organization_id, 'quotes.read'));

create policy quote_items_write_perm on public.quote_items
for all to authenticated
using (public.has_permission(organization_id, 'quotes.write'))
with check (public.has_permission(organization_id, 'quotes.write'));

create policy quote_history_select_perm on public.quote_status_history
for select to authenticated
using (public.has_permission(organization_id, 'quotes.read'));

create policy quote_history_insert_perm on public.quote_status_history
for insert to authenticated
with check (public.has_permission(organization_id, 'quotes.approve'));

-- -------- ITIL / TICKETS --------
create policy assets_select_perm on public.assets
for select to authenticated
using (public.has_permission(organization_id, 'assets.read'));

create policy assets_write_perm on public.assets
for all to authenticated
using (public.has_permission(organization_id, 'assets.write'))
with check (public.has_permission(organization_id, 'assets.write'));

create policy tickets_select_perm on public.tickets
for select to authenticated
using (public.has_permission(organization_id, 'tickets.read'));

create policy tickets_insert_perm on public.tickets
for insert to authenticated
with check (public.has_permission(organization_id, 'tickets.write'));

create policy tickets_update_perm on public.tickets
for update to authenticated
using (public.has_permission(organization_id, 'tickets.write'))
with check (public.has_permission(organization_id, 'tickets.write'));

create policy tickets_delete_perm on public.tickets
for delete to authenticated
using (public.has_permission(organization_id, 'tickets.approve'));

create policy ticket_comments_select_perm on public.ticket_comments
for select to authenticated
using (public.has_permission(organization_id, 'tickets.read'));

create policy ticket_comments_write_perm on public.ticket_comments
for all to authenticated
using (public.has_permission(organization_id, 'tickets.write'))
with check (public.has_permission(organization_id, 'tickets.write'));

create policy ticket_sla_select_perm on public.ticket_sla
for select to authenticated
using (public.has_permission(organization_id, 'tickets.read'));

create policy ticket_sla_write_perm on public.ticket_sla
for all to authenticated
using (public.has_permission(organization_id, 'tickets.write'))
with check (public.has_permission(organization_id, 'tickets.write'));

-- -------- CONSULTORÍA --------
create policy assessments_select_perm on public.assessments
for select to authenticated
using (public.has_permission(organization_id, 'assessments.read'));

create policy assessments_write_perm on public.assessments
for all to authenticated
using (public.has_permission(organization_id, 'assessments.write'))
with check (public.has_permission(organization_id, 'assessments.write'));

create policy assessment_sections_select_perm on public.assessment_sections
for select to authenticated
using (public.has_permission(organization_id, 'assessments.read'));

create policy assessment_sections_write_perm on public.assessment_sections
for all to authenticated
using (public.has_permission(organization_id, 'assessments.write'))
with check (public.has_permission(organization_id, 'assessments.write'));

create policy assessment_answers_select_perm on public.assessment_answers
for select to authenticated
using (public.has_permission(organization_id, 'assessments.read'));

create policy assessment_answers_write_perm on public.assessment_answers
for all to authenticated
using (public.has_permission(organization_id, 'assessments.write'))
with check (public.has_permission(organization_id, 'assessments.write'));

create policy assessment_systems_select_perm on public.assessment_systems
for select to authenticated
using (public.has_permission(organization_id, 'assessments.read'));

create policy assessment_systems_write_perm on public.assessment_systems
for all to authenticated
using (public.has_permission(organization_id, 'assessments.write'))
with check (public.has_permission(organization_id, 'assessments.write'));

create policy assessment_criticality_select_perm on public.assessment_criticality_scores
for select to authenticated
using (public.has_permission(organization_id, 'assessments.read'));

create policy assessment_criticality_write_perm on public.assessment_criticality_scores
for all to authenticated
using (public.has_permission(organization_id, 'assessments.write'))
with check (public.has_permission(organization_id, 'assessments.write'));

-- -------- LICENCIAS --------
create policy license_rules_select_perm on public.license_rules
for select to authenticated
using (public.has_permission(organization_id, 'licenses.read'));

create policy license_rules_write_perm on public.license_rules
for all to authenticated
using (public.has_permission(organization_id, 'licenses.write'))
with check (public.has_permission(organization_id, 'licenses.write'));

create policy license_reco_select_perm on public.license_recommendations
for select to authenticated
using (public.has_permission(organization_id, 'licenses.read'));

create policy license_reco_write_perm on public.license_recommendations
for all to authenticated
using (public.has_permission(organization_id, 'licenses.write'))
with check (public.has_permission(organization_id, 'licenses.write'));

-- -------- PLANTILLAS --------
create policy message_templates_select_perm on public.message_templates
for select to authenticated
using (public.has_permission(organization_id, 'templates.read'));

create policy message_templates_write_perm on public.message_templates
for all to authenticated
using (public.has_permission(organization_id, 'templates.write'))
with check (public.has_permission(organization_id, 'templates.write'));

create policy template_versions_select_perm on public.template_versions
for select to authenticated
using (public.has_permission(organization_id, 'templates.read'));

create policy template_versions_write_perm on public.template_versions
for all to authenticated
using (public.has_permission(organization_id, 'templates.write'))
with check (public.has_permission(organization_id, 'templates.write'));

-- -------- NOTIFICACIONES --------
create policy notification_events_select_perm on public.notification_events
for select to authenticated
using (public.has_permission(organization_id, 'notifications.read'));

create policy notification_events_write_perm on public.notification_events
for all to authenticated
using (public.has_permission(organization_id, 'notifications.write'))
with check (public.has_permission(organization_id, 'notifications.write'));

create policy notification_deliveries_select_perm on public.notification_deliveries
for select to authenticated
using (public.has_permission(organization_id, 'notifications.read'));

create policy notification_deliveries_write_perm on public.notification_deliveries
for all to authenticated
using (public.has_permission(organization_id, 'notifications.write'))
with check (public.has_permission(organization_id, 'notifications.write'));

create policy notification_subscriptions_select_perm on public.notification_subscriptions
for select to authenticated
using (public.has_permission(organization_id, 'notifications.read'));

create policy notification_subscriptions_write_perm on public.notification_subscriptions
for all to authenticated
using (public.has_permission(organization_id, 'notifications.write'))
with check (public.has_permission(organization_id, 'notifications.write'));

-- -------- AUDIT --------

drop policy if exists audit_events_select on public.audit_events;
create policy audit_events_select
on public.audit_events
for select to authenticated
using (public.has_permission(organization_id, 'audit.read'));

-- Inserción de auditoría para miembros activos de la organización
-- (mantener política previa de inserción)

drop policy if exists audit_events_insert on public.audit_events;
create policy audit_events_insert
on public.audit_events
for insert to authenticated
with check (organization_id in (select public.current_org_ids()));

commit;

-- FIN: endurecimiento RLS por rol
-- Recomendación: validar con usuarios de prueba por cada rol antes de producción.
