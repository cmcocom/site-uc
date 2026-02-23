# Matriz CRUD por Rol (MVP)

Fecha: 2026-02-23
Ámbito: Entregable 2 (control de acceso por módulo)

## Roles

- `owner`
- `admin`
- `ventas`
- `facturacion`
- `soporte`
- `consultor`
- `lectura`

## Convenciones

- `C`: Create
- `R`: Read
- `U`: Update
- `D`: Delete
- `A`: Approve/acciones críticas de estado
- `-`: Sin acceso

---

## 1) Núcleo y Seguridad

| Recurso | owner | admin | ventas | facturacion | soporte | consultor | lectura |
|---|---|---|---|---|---|---|---|
| `organizations` | R,U | R,U | R | R | R | R | R |
| `users_profile` (todos) | C,R,U,D | C,R,U,D | R | R | R | R | R |
| `organization_members` | C,R,U,D | C,R,U,D | R | R | R | R | R |
| `roles` | C,R,U,D | R | R | R | R | R | R |
| `permissions` | C,R,U,D | R | R | R | R | R | R |
| `role_permissions` | C,R,U,D | R | R | R | R | R | R |
| `audit_events` | R | R | - | - | - | - | - |

Notas:
- `admin` puede administrar usuarios/membresías pero no editar catálogos globales de permisos/roles de sistema.
- `lectura` no accede a configuración organizacional sensible, sólo datos operativos de negocio.

---

## 2) Comercial (Clientes, Catálogo, Cotizaciones)

| Recurso | owner | admin | ventas | facturacion | soporte | consultor | lectura |
|---|---|---|---|---|---|---|---|
| `clients` | C,R,U,D | C,R,U,D | C,R,U,D | R,U | R | R | R |
| `client_contacts` | C,R,U,D | C,R,U,D | C,R,U,D | R,U | R | R | R |
| `client_fiscal_profiles` | C,R,U,D | C,R,U,D | C,R,U | C,R,U,D | R | R | R |
| `catalog_items` | C,R,U,D | C,R,U,D | R | R | R | R | R |
| `quotes` | C,R,U,D,A | C,R,U,D,A | C,R,U,D,A | R | R | R | R |
| `quote_items` | C,R,U,D | C,R,U,D | C,R,U,D | R | R | R | R |
| `quote_status_history` | C,R | C,R | C,R | R | R | R | R |

Notas:
- `ventas` puede aprobar/rechazar cotización (`A`) según política comercial.
- `facturacion` puede actualizar datos fiscales del cliente para emisión correcta.

---

## 3) CFDI

| Recurso | owner | admin | ventas | facturacion | soporte | consultor | lectura |
|---|---|---|---|---|---|---|---|
| `cfdi_preferences` | C,R,U,D | C,R,U,D | R,U | C,R,U,D | R | R | R |
| `invoices` | C,R,U,D,A | C,R,U,D,A | R | C,R,U,D,A | R | R | R |
| `invoice_items` | C,R,U,D | C,R,U,D | R | C,R,U,D | R | R | R |
| `payment_complements` | C,R,U,D | C,R,U,D | R | C,R,U,D | R | R | R |

Notas:
- Sólo `facturacion`, `admin`, `owner` ejecutan acciones críticas de emisión/cancelación (`A`).

---

## 4) ITIL + Activos

| Recurso | owner | admin | ventas | facturacion | soporte | consultor | lectura |
|---|---|---|---|---|---|---|---|
| `assets` | C,R,U,D | C,R,U,D | R | R | C,R,U,D | R,U | R |
| `tickets` | C,R,U,D,A | C,R,U,D,A | C,R | R | C,R,U,D,A | C,R,U | R |
| `ticket_comments` | C,R,U,D | C,R,U,D | C,R | R | C,R,U,D | C,R,U | R |
| `ticket_sla` | C,R,U,D | C,R,U,D | R | R | C,R,U,D | R,U | R |

Notas:
- `ventas` puede crear ticket y consultar avance para atención a clientes.
- `consultor` participa en tickets relacionados a hallazgos de evaluación.

---

## 5) Consultoría TI

| Recurso | owner | admin | ventas | facturacion | soporte | consultor | lectura |
|---|---|---|---|---|---|---|---|
| `assessments` | C,R,U,D | C,R,U,D | R | R | R | C,R,U,D | R |
| `assessment_sections` | C,R,U,D | C,R,U,D | R | R | R | C,R,U,D | R |
| `assessment_answers` | C,R,U,D | C,R,U,D | R | R | R | C,R,U,D | R |
| `assessment_systems` | C,R,U,D | C,R,U,D | R | R | R,U | C,R,U,D | R |
| `assessment_criticality_scores` | C,R,U,D | C,R,U,D | R | R | R,U | C,R,U,D | R |

---

## 6) Licencias, Plantillas y Notificaciones

| Recurso | owner | admin | ventas | facturacion | soporte | consultor | lectura |
|---|---|---|---|---|---|---|---|
| `license_rules` | C,R,U,D | C,R,U,D | R | R | R | R | R |
| `license_recommendations` | C,R,U,D | C,R,U,D | C,R,U,D | R | R | C,R,U | R |
| `message_templates` | C,R,U,D | C,R,U,D | C,R,U | C,R,U | C,R,U | C,R,U | R |
| `template_versions` | C,R,U,D | C,R,U,D | C,R,U | C,R,U | C,R,U | C,R,U | R |
| `notification_events` | C,R,U,D | C,R,U,D | C,R | C,R | C,R | C,R | R |
| `notification_deliveries` | C,R,U,D | C,R,U,D | R | R | R | R | R |
| `notification_subscriptions` | C,R,U,D | C,R,U,D | C,R,U | C,R,U | C,R,U | C,R,U | R |

---

## 7) Reglas transversales obligatorias

1. Todo acceso requiere membresía activa en `organization_members`.
2. Ningún rol accede a datos de otra organización.
3. `lectura` nunca ejecuta `C/U/D`.
4. Acciones críticas (`A`) se auditan en `audit_events`.
5. Cambios de estado en `quotes`, `invoices`, `tickets` generan historial.

---

## 8) Traducción a permisos (`permissions.key`) sugeridos

- `clients.read`
- `clients.write`
- `fiscal.read`
- `fiscal.write`
- `cfdi.approve`
- `catalog.read`
- `catalog.write`
- `quotes.read`
- `quotes.write`
- `quotes.approve`
- `tickets.read`
- `tickets.write`
- `tickets.approve`
- `assets.read`
- `assets.write`
- `assessments.read`
- `assessments.write`
- `licenses.read`
- `licenses.write`
- `templates.read`
- `templates.write`
- `notifications.read`
- `notifications.write`
- `audit.read`
- `security.members.write`

Esta lista es la base para el script SQL de endurecimiento RLS por rol.
