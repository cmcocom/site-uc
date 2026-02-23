# Documento Maestro de Inicio
## MVP Multiusuario: Cotizaciones + CFDI + ITIL + Consultoría TI + Licencias + Plantillas

Fecha: 2026-02-23
Estado: Aprobado para arranque técnico
Ámbito: Diseño implementable (sin código de producción todavía)

---

## 1) Resumen Ejecutivo

Se implementará un **backoffice en Next.js** (subdominio `app.unidadc.com`) conectado a **Supabase** como núcleo transaccional único para:

1. Cotizaciones (CRM comercial básico)
2. CFDI (preferencias fiscales y ciclo PUE/PPD)
3. ITIL (tickets, inventario/activos, procesos de soporte)
4. Consultoría TI (diagnóstico, encuestas, criticidad de sistemas)
5. Licencias Microsoft (catálogo + recomendador + propuestas)
6. Plantillas de comunicación (email/telegram)

El sitio Astro actual (`unidadc.com`) permanece público y sólo redirige al login del subdominio.

Objetivo clave: **evitar duplicidad de datos**, con un **modelo canónico** multi-tenant y CRUD por roles desde el inicio.

---

## 2) Decisiones de Arquitectura (cerradas)

- Front público: Astro (repositorio actual).
- Backoffice: Next.js App Router (repo nuevo recomendado: `unidadc-app`).
- Base de datos/auth: Supabase (1 proyecto inicial).
- Comunicación:
  - Auth emails: Supabase Auth + SMTP Resend.
  - Emails transaccionales negocio: Resend API desde Next.
  - Mensajería operativa: Telegram Bot API desde Next.
- UX base: soporte de tema claro/oscuro en el backoffice (`unidadc-app`) con preferencia persistida por usuario y fallback a preferencia del sistema.
- Despliegue gratis:
  - 2 repos GitHub (Astro y Next) y 2 proyectos Vercel separados.
  - 1 subdominio para app (`app.unidadc.com`).

---

## 3) Principios de Diseño de Datos (anti-duplicidad)

1. **Cliente único** para todos los módulos.
2. **Catálogo único** para productos/servicios/licencias/plantillas operativas.
3. **Activo (CI) único** para ITIL/inventario/consultoría.
4. No guardar textos repetidos si existe referencia por ID.
5. Snapshot sólo cuando sea necesario legal/operativo (ej. datos fiscales al emitir CFDI, líneas de cotización históricas).
6. Todo recurso de negocio contiene `organization_id`.

---

## 4) Modelo Canónico Inicial (MVP)

## 4.1 Núcleo Organizacional y Seguridad

- `organizations`
- `users_profile` (1:1 con `auth.users`)
- `organization_members` (rol por organización)
- `roles` (catálogo)
- `role_permissions` (RBAC granular)
- `audit_events`

Restricción: `UNIQUE (organization_id, user_id)` en membresías.

## 4.2 CRM/Comercial

- `clients` (empresa/persona)
- `client_contacts` (múltiples contactos)
- `client_fiscal_profiles` (1:N histórico opcional, 1 activo)
- `catalog_items` (tipo: producto|servicio|licencia|plantilla)
- `quotes`
- `quote_items`
- `quote_status_history`

Restricciones:
- `UNIQUE (organization_id, rfc)` en perfil fiscal activo del cliente.
- `UNIQUE (organization_id, quote_number)`.

## 4.3 CFDI

- `cfdi_preferences` (por cliente/contacto)
- `invoices` (si se administra emisión/seguimiento)
- `invoice_items`
- `payment_complements`
- `sat_catalog_cache` (catálogos SAT versionados)

Regla: cotización puede generar factura, pero factura conserva snapshot fiscal.

## 4.4 ITIL + Inventario

- `tickets` (incidentes/solicitudes)
- `ticket_comments`
- `ticket_sla`
- `ticket_status_history`
- `assets` (CMDB simplificada MVP)
- `asset_relationships` (fase 2)
- `changes` (fase 2)
- `knowledge_articles` (fase 2)

Regla: ticket y activo siempre apuntan a `clients`.

## 4.5 Consultoría TI

- `assessments` (encabezado evaluación)
- `assessment_sections`
- `assessment_answers`
- `assessment_systems` (inventario levantado en consultoría)
- `assessment_criticality_scores`

Regla de no duplicidad:
- Si un sistema evaluado ya existe como activo: referenciar `asset_id`.
- Si aún no existe: crear en `assessment_systems` y permitir promoción a `assets`.

## 4.6 Licencias + Plantillas

- `license_rules` (motor de recomendación parametrizable)
- `license_recommendations` (resultado por cliente/oportunidad)
- `message_templates` (email/telegram/whatsapp-text)
- `template_versions`

Regla:
- Lo que hoy está hardcodeado en `licenseEstimator.ts` pasa a tablas para CRUD por rol.
- Plantillas reutilizan datos de cliente/cotización/ticket por variables.

## 4.7 Notificaciones

- `notification_events` (evento de negocio)
- `notification_deliveries` (intentos y estados)
- `notification_subscriptions` (preferencias por usuario/cliente)

Canales: `email_resend`, `telegram_bot`.

---

## 5) Mapeo de páginas actuales al modelo futuro

## 5.1 Cotizador
- De generador local a CRUD completo en `quotes`/`quote_items`.
- PDF permanece, pero con persistencia y versionado de estado.

## 5.2 Plantillas
- De preview local a `message_templates` + render de variables.
- Envío real por Resend/Telegram con trazabilidad en BD.

## 5.3 Licencias
- De recomendación embebida a catálogo y reglas administrables.
- Resultado almacenable por cliente para seguimiento comercial.

## 5.4 Consultoría TI
- Encuesta e inventario pasan a `assessments` y `assessment_systems`.
- Criticidad reutilizable en ITIL (prioridad y riesgo).

## 5.5 Matriz de migración (reutilizar vs refactorizar vs reemplazar)

### Licencias

- Reutilizar:
  - Reglas y conocimiento de negocio del recomendador actual.
  - Catálogo base de productos/licencias y textos de recomendación.
- Refactorizar:
  - Lógica hardcodeada de `licenseEstimator` a reglas persistidas en `license_rules`.
  - Estructura de datos para soportar versionado y vigencia de reglas.
- Reemplazar:
  - Cálculo en cliente sin persistencia por flujo Next con CRUD + auditoría.
  - Configuración estática por administración por rol (`admin/ventas`).

### Plantillas

- Reutilizar:
  - Estructura de contenido, intención de mensajes y variables de negocio actuales.
  - Branding (logos, firma, bloques de contacto).
- Refactorizar:
  - Modelo de datos a `message_templates` + `template_versions`.
  - Render de variables por contexto (`cliente`, `cotización`, `ticket`, `factura`).
- Reemplazar:
  - Preview local sin envío real por pipeline de notificación (`notification_events` y `notification_deliveries`).
  - Botón local de envío por handlers con Resend/Telegram + trazabilidad.

### Consultoría TI

- Reutilizar:
  - Banco de preguntas por categoría y el método de evaluación de criticidad.
  - Flujo funcional de captura (cliente, respuestas, sistemas, ponderaciones).
- Refactorizar:
  - Preguntas/opciones a estructuras persistentes (`assessment_sections` y configuración administrable).
  - Vinculación de sistemas evaluados con activos ITIL (`assets`) para continuidad operativa.
- Reemplazar:
  - Estado local en frontend por persistencia transaccional multiusuario.
  - Exportación ad-hoc por reportes/versiones asociadas a evaluaciones.

### Criterio transversal de migración

- Reutilizar conocimiento funcional y de dominio.
- Refactorizar lógica cuando hoy esté acoplada al cliente o hardcodeada.
- Reemplazar solo componentes que bloqueen multiusuario, RLS, auditoría o integración entre módulos.
- No duplicar entidades núcleo (`clients`, `catalog_items`, `assets`, `users_profile`).

---

## 6) Modelo de Roles y CRUD mínimo

Roles iniciales por organización:
- `owner`
- `admin`
- `ventas`
- `facturacion`
- `soporte`
- `consultor`
- `lectura`

Matriz base:
- Ventas: CRUD clientes, cotizaciones, recomendaciones de licencia, plantillas comerciales.
- Facturación: lectura comercial + CRUD CFDI/facturas/complementos.
- Soporte: CRUD tickets/activos, lectura cliente y contratos/licencias.
- Consultor: CRUD assessments, lectura de tickets/activos y cotizaciones.
- Lectura: sólo consulta.
- Admin/Owner: todo + administración de usuarios/roles.

---

## 7) Seguridad (Supabase + API)

- RLS en todas las tablas de negocio por `organization_id`.
- Permisos por rol usando claims/membresía en `organization_members`.
- Validación de input (Zod) en Route Handlers/Server Actions.
- Auditoría obligatoria para cambios de estado críticos (cotización, factura, ticket).
- Secretos sólo en servidor (Resend, Telegram, service role).
- Rate limiting por usuario/IP para endpoints sensibles (auth, creación de tickets, envíos de notificación).
- Mensajes de error sanitizados (sin filtrar detalles internos de BD/infra).

### 7.1 Estándares SQL/PostgreSQL obligatorios (aplicación de `postgresql-table-design`)

- Convención `snake_case` para tablas/columnas/índices.
- PK por defecto `uuid` en entidades de negocio multi-tenant y FK siempre indexadas.
- Montos monetarios con `numeric(p,s)`, fechas/hora con `timestamptz`.
- `NOT NULL` en campos obligatorios de dominio y `CHECK` para invariantes clave.
- JSON sólo para atributos variables (`jsonb` + índice GIN cuando aplique).
- Evitar duplicidad lógica con constraints únicas compuestas por `organization_id`.
- RLS activado por tabla antes de exponer cualquier endpoint de escritura.

### 7.2 Estándares Next/App Router obligatorios (aplicación de `nextjs-app-router-patterns`)

- Server Components por defecto; Client Components sólo para interactividad real.
- Mutaciones de negocio vía Server Actions o Route Handlers, nunca directo desde cliente a secretos.
- Cada dominio crítico tendrá `loading.tsx`, `error.tsx` y `not-found.tsx`.
- Revalidación explícita (`revalidatePath`/`revalidateTag`) tras mutaciones.
- Segmentación por route groups para módulos (`(comercial)`, `(cfdi)`, `(itil)`, `(consultoria)`).

---

## 8) Estrategia GitHub + Vercel + costos (Free)

## 8.1 Repos
- Repo 1: `site-uc-astro` (actual)
- Repo 2: `unidadc-app` (nuevo Next)

## 8.2 Vercel
- Proyecto 1: Astro (`unidadc.com`)
- Proyecto 2: Next (`app.unidadc.com`)

Beneficio: despliegues aislados y control de límites gratis por proyecto.

## 8.3 Supabase
- 1 proyecto inicial compartido, con esquema modular y RLS robusto.
- Evaluar split por entorno cuando crezca carga (dev/prod separados mínimo).

---

## 9) Plan de implementación (orden estricto)

## Fase 0 — Fundación (1 semana)
- [ ] Crear repo `unidadc-app` y proyecto Vercel.
- [ ] Configurar dominio/subdominio y variables de entorno.
- [ ] Configurar Supabase Auth + SMTP Resend.
- [ ] Instalar SDK de Supabase en Next (`@supabase/supabase-js`) como dependencia base.
- [ ] Definir esquema SQL inicial (núcleo + comercial + seguridad).
- [ ] Activar RLS + políticas base por organización.
- [ ] Definir estrategia de secretos por entorno (dev/staging/prod) y rotación mínima trimestral.

## Fase 1 — Núcleo de acceso (1 semana)
- [ ] Login/logout/session/guards de rutas.
- [ ] Gestión de organización, usuarios, membresías y roles.
- [ ] Seed de permisos CRUD por módulo.
- [ ] CI base en GitHub Actions: lint + typecheck + build + checks de migraciones.
- [ ] Toggle de tema claro/oscuro con persistencia de preferencia y aplicación global en layout.

## Fase 2 — Comercial + CFDI (2 semanas)
- [ ] CRUD clientes/contactos/perfil fiscal.
- [ ] CRUD catálogo unificado.
- [ ] CRUD cotizaciones + partidas + estados + PDF.
- [ ] Flujo CFDI (PUE/PPD/forma pago/complementos).

## Fase 3 — ITIL + Inventario (2 semanas)
- [ ] CRUD tickets + comentarios + SLA básico.
- [ ] CRUD activos (CMDB MVP) relacionados a cliente.
- [ ] Integración operativa con cliente/catálogo/licencias.

## Fase 4 — Consultoría + Plantillas + Licencias (2 semanas)
- [ ] CRUD assessments y evaluaciones de criticidad.
- [ ] Motor de recomendaciones de licencia desde tablas.
- [ ] Plantillas versionadas y envío por Resend/Telegram.

## Fase 5 — Endurecimiento (1 semana)
- [ ] Auditoría completa + reportes.
- [ ] Observabilidad y alertas de fallos de notificación.
- [ ] Hardening de permisos y pruebas E2E.
- [ ] Runbook de debugging sistemático para incidencias críticas (sin fixes sin RCA).

---

## 10) Criterios de aceptación del MVP

1. Multiusuario y roles activos en producción.
2. Un cliente único compartido entre cotizaciones, CFDI, tickets y consultoría.
3. CRUD funcional para los 3 módulos comprometidos (Cotizaciones, CFDI, ITIL).
4. Consultoría TI almacenable y reutilizable.
5. Licencias/plantillas administrables (no hardcode fijo).
6. Notificaciones operativas por Resend y Telegram con trazabilidad.
7. Cero duplicidad estructural injustificada en tablas principales.
8. Backoffice usable en tema claro y oscuro con contraste legible y persistencia de preferencia.

---

## 11) Riesgos y mitigación

- Riesgo: sobrealcance en MVP.
  - Mitigación: separar MVP estricto y fase 2 por flags.
- Riesgo: reglas RLS complejas.
  - Mitigación: pruebas de autorización por rol desde inicio.
- Riesgo: mezcla de lógica de negocio en frontend.
  - Mitigación: centralizar mutaciones en server actions/route handlers.

---

## 12) Skills aplicadas y activas para ejecución

## 12.1 Skills aplicadas para este diseño
- `brainstorming`
- `nextjs-best-practices`
- `api-security-best-practices`
- `supabase-postgres-best-practices`
- `email-best-practices`
- `shadcn-ui`

## 12.2 Skills recomendadas (ya instaladas) y cómo se usarán
- `postgresql-table-design`: guía obligatoria para DDL inicial, constraints e índices.
- `prisma-expert`: uso condicional si se adopta Prisma (si no, SQL nativo en Supabase).
- `github-actions-templates`: base de workflows CI para repo Next y Astro por separado.
- `secrets-management`: política de secretos y rotación en GitHub/Vercel/Supabase.
- `systematic-debugging`: protocolo obligatorio para bugs, fallos de tests e incidentes.
- `nextjs-app-router-patterns`: estructura App Router y límites Server/Client en módulos.

## 12.3 Skills sugeridas adicionales (opcionales)
- `react-email`: para construir y versionar plantillas HTML transaccionales con Resend.
- `better-auth-best-practices`: sólo si en algún momento se requiere capa auth adicional a Supabase.

---

## 13) Próximo paso operativo inmediato

Con este documento aprobado, el siguiente entregable debe ser:
1) **DDL inicial** (tablas + constraints + índices + RLS base),
2) **matriz exacta de permisos CRUD por rol**,
3) **matriz de eventos de notificación (Resend/Telegram)**,
en ese orden.

Entregable 1 completado en:
- `docs/plans/2026-02-23-ddl-inicial-supabase-mvp.sql`

Entregable 2 completado en:
- `docs/plans/2026-02-23-matriz-crud-roles-mvp.md`
- `docs/plans/2026-02-23-rls-endurecimiento-roles.sql`

Entregable 3 completado en:
- `docs/plans/2026-02-23-matriz-eventos-notificaciones-mvp.md`

Seed inicial de negocio completado en:
- `docs/plans/2026-02-23-seed-inicial-negocio.sql`

Bootstrap operativo del primer tenant/usuario en:
- `docs/plans/2026-02-23-bootstrap-primer-tenant.sql`
  - Incluye validación explícita de prerequisitos (`auth.users` y rol) para evitar ejecuciones silenciosas sin membresía.

Orden de ejecución SQL recomendado (Supabase SQL Editor):
1. `2026-02-23-ddl-inicial-supabase-mvp.sql`
2. `2026-02-23-rls-endurecimiento-roles.sql`
3. `2026-02-23-seed-inicial-negocio.sql`
4. `2026-02-23-bootstrap-primer-tenant.sql`

## 13.1 Criterios de calidad para aprobar cada entregable

- DDL: sin tablas duplicadas semánticamente, con FK indexadas y políticas RLS verificables.
- Permisos: cada endpoint/mutación mapeado a permiso explícito por rol.
- Notificaciones: idempotencia + reintentos + trazabilidad por evento/canal/destinatario.
- CI: pipeline verde (lint/typecheck/build) antes de avanzar de fase.

## 13.2 Estado actual de avance técnico

- `unidadc-app` inicializado con Next.js App Router.
- Dependencia `@supabase/supabase-js` instalada y lista para configurar cliente browser/server.
- Repositorio remoto Next conectado: `https://github.com/cmcocom/gh-unidadc-app.git`.
- Variables de Supabase configuradas en entorno local (`.env.local`) para desarrollo.
- Build inicial de Next validada exitosamente.
- Primer commit y push del repositorio Next completados en rama `main`.
- SQL ejecutados exitosamente en Supabase DEV:
  - `2026-02-23-ddl-inicial-supabase-mvp.sql`
  - `2026-02-23-rls-endurecimiento-roles.sql`
  - `2026-02-23-seed-inicial-negocio.sql`
- `shadcn/ui` instalado y operativo en `unidadc-app` (config + componente `button`).

## 13.3 Datos requeridos y dónde pegarlos

### Variables locales (archivo)

Pegar en:
- `unidadc-app/.env.local`

Claves requeridas:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Referencia de plantilla:
- `unidadc-app/.env.example`

### Variables en Vercel (Dashboard)

Pegar en:
- Project `gh-unidadc-app` → Settings → Environment Variables

Claves requeridas (Production/Preview/Development según aplique):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Fuente de datos en Supabase

Obtener desde:
- Project Settings → API
  - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

## 13.4 Auditoría comparativa de avance (Next vs Astro)

Fecha auditoría: 2026-02-23  
Objetivo: validar cobertura real del `unidadc-app` contra este documento maestro y detectar pendientes de migración desde `site-uc-astro`.

### Estado general

- **Avance sólido en Fundación + Núcleo de acceso + Comercial base**.
- **Persistencia del cotizador clásico ya migrada a Next/Supabase**.
- **MVP maestro aún incompleto** en módulos: CFDI operativo, ITIL, Consultoría TI, Licencias administrables, Plantillas/Notificaciones con trazabilidad.

### Cobertura confirmada (implementado en `unidadc-app`)

1. **Acceso y seguridad base**
  - Login/logout/recovery/set-password.
  - Guard de rutas por middleware.
  - Gestión de miembros/roles (admin).
  - Verificación de permisos por `has_permission`.

2. **Comercial (parcial-alto)**
  - Clientes + contactos + perfil fiscal (CRUD).
  - Catálogo unificado (CRUD con permisos).
  - Cotizaciones (CRUD encabezado + partidas + cambio de estado + historial + impresión).
  - Cotizador clásico migrado con persistencia real (`quotes` / `quote_items`).

3. **Infraestructura de datos**
  - DDL MVP amplio (núcleo, comercial, CFDI, ITIL, consultoría, licencias, plantillas, notificaciones).
  - RLS y políticas por rol/permiso disponibles en scripts SQL.

### Pendientes críticos (no implementados o incompletos)

1. **CFDI operativo (Fase 2)**
  - Existen tablas y SQL, pero no módulo funcional completo en rutas/páginas/API del backoffice principal.

2. **ITIL + Inventario (Fase 3)**
  - Sin pantallas/handlers para tickets, comentarios, SLA y activos en `unidadc-app`.

3. **Consultoría TI (Fase 4)**
  - El flujo completo sigue en Astro como frontend local (no transaccional multiusuario).

4. **Licencias (Fase 4)**
  - La lógica del recomendador sigue hardcodeada en Astro (`licenseEstimator`), no migrada a `license_rules` + CRUD por rol.

5. **Plantillas + Notificaciones (Fase 4)**
  - Plantillas siguen en Astro con flujo local/mock.
  - No está implementado el pipeline completo `notification_events`/`notification_deliveries` + canales Resend/Telegram con idempotencia y reintentos.

6. **Estándares App Router por dominio (según sección 7.2)**
  - Faltan paquetes de `loading.tsx`, `error.tsx`, `not-found.tsx` por módulos críticos.
  - Falta segmentación modular por route groups (`(comercial)`, `(cfdi)`, `(itil)`, `(consultoria)`).

### Migración desde Astro: estado

- **Cotizador**: migrado y persistido en Next ✅
- **Licencias**: pendiente de migración funcional a modelo administrable ❌
- **Plantillas**: pendiente de migración a plantilla versionada + envío real ❌
- **Consultoría TI**: pendiente de migración a `assessments*` + criticidad persistida ❌

### Observaciones de calidad detectadas

- Typecheck en verde.
- Lint con pendientes no críticos de negocio, pero conviene corregir antes de escalar módulos.

### Decisión recomendada de control

- Mantener esta auditoría dentro del maestro y actualizarla al cierre de cada fase con formato fijo:
  - fecha,
  - alcance auditado,
  - cobertura lograda,
  - gaps críticos,
  - siguiente bloque de implementación.

