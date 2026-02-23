# Matriz de Eventos de Notificación (MVP)

Fecha: 2026-02-23
Ámbito: Entregable 3 (Resend + Telegram)

## 1) Canales

- `email_resend`: notificaciones al cliente y equipo
- `telegram_bot`: alertas operativas internas (equipos soporte/facturación/ventas)

## 2) Reglas generales

1. Todo envío se registra en `notification_events`.
2. Cada intento se registra en `notification_deliveries`.
3. Idempotencia por `organization_id + idempotency_key`.
4. Reintentos con backoff exponencial para fallos transitorios.
5. Webhooks de proveedor actualizan estado final (email delivered/bounced/complained).

## 3) Matriz principal (evento → destinatario → canal)

| Evento | Disparador | Destinatario | Canal primario | Canal secundario | Plantilla sugerida |
|---|---|---|---|---|---|
| `quote.created` | Cotización creada | Equipo ventas interno | `telegram_bot` | `email_resend` | `quote_created_internal_v1` |
| `quote.sent_to_client` | Cotización enviada | Contacto cliente | `email_resend` | - | `quote_sent_client_v1` |
| `quote.approved` | Cotización aprobada | Facturación + ventas | `telegram_bot` | `email_resend` | `quote_approved_internal_v1` |
| `quote.rejected` | Cotización rechazada | Ejecutivo ventas | `telegram_bot` | `email_resend` | `quote_rejected_internal_v1` |
| `invoice.issued` | CFDI emitido | Contacto fiscal cliente | `email_resend` | - | `invoice_issued_client_v1` |
| `invoice.cancelled` | CFDI cancelado | Facturación + cliente fiscal | `email_resend` | `telegram_bot` (interno) | `invoice_cancelled_v1` |
| `payment_complement.created` | Complemento registrado | Contacto fiscal cliente | `email_resend` | - | `payment_complement_client_v1` |
| `ticket.created` | Ticket nuevo | Mesa de soporte | `telegram_bot` | `email_resend` | `ticket_created_internal_v1` |
| `ticket.assigned` | Ticket asignado | Técnico asignado | `telegram_bot` | `email_resend` | `ticket_assigned_internal_v1` |
| `ticket.sla_warning` | SLA por vencer | Soporte + admin | `telegram_bot` | `email_resend` | `ticket_sla_warning_v1` |
| `ticket.resolved` | Ticket resuelto | Solicitante cliente | `email_resend` | - | `ticket_resolved_client_v1` |
| `assessment.completed` | Consultoría completada | Consultor + ventas | `telegram_bot` | `email_resend` | `assessment_completed_internal_v1` |
| `license.recommendation.generated` | Recomendación lista | Ventas | `telegram_bot` | - | `license_recommendation_internal_v1` |
| `auth.user_invited` | Usuario invitado | Usuario interno invitado | `email_resend` | - | `auth_invite_user_v1` |

## 4) Prioridad y severidad

| Severidad | Ejemplos | SLA interno de entrega |
|---|---|---|
| `critical` | `ticket.sla_warning`, fallo de emisión CFDI | < 1 min |
| `high` | `quote.approved`, `ticket.created` | < 3 min |
| `normal` | `quote.sent_to_client`, `invoice.issued` | < 10 min |
| `low` | resúmenes operativos | < 60 min |

## 5) Política de reintentos

- `email_resend`:
  - Máx 5 intentos
  - Backoff: 1m, 3m, 10m, 30m, 2h
- `telegram_bot`:
  - Máx 6 intentos
  - Backoff: 30s, 1m, 3m, 10m, 30m, 1h
- Si supera intentos: marcar `failed` y crear `audit_events` con acción `notification_failed`.

## 6) Variables mínimas por plantilla

- Variables transversales:
  - `organization_name`
  - `event_timestamp`
  - `actor_name`
  - `app_url`
- Variables comerciales:
  - `quote_number`, `quote_total`, `client_name`
- Variables CFDI:
  - `invoice_number`, `sat_uuid`, `payment_method`, `payment_form`
- Variables ITIL:
  - `ticket_number`, `ticket_priority`, `ticket_status`, `ticket_url`

## 7) Eventos que NO deben notificar al cliente

- `quote.created` (interno)
- `ticket.sla_warning` (interno)
- `license.recommendation.generated` (interno)

## 8) Integración técnica sugerida

1. Mutación de negocio (Server Action / Route Handler)
2. Inserta `notification_events` (`pending`)
3. Worker toma evento y crea `notification_deliveries`
4. Envía vía proveedor (Resend o Telegram)
5. Actualiza estado + persistencia de respuesta proveedor
6. Si falla, aplica reintento; si agota, alerta interna

## 9) Orden de implementación

1. Plantillas base en `message_templates` y `template_versions`.
2. Worker de despacho (`pending` → `sent/failed`).
3. Webhooks de Resend para estados finales.
4. Dashboard mínimo de entregas y fallos.
