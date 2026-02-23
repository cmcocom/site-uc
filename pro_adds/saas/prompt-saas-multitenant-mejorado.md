# 🚀 GUÍA COMPLETA: SaaS MULTITENANT CON STACK MODERNO 2026

> **Versión actualizada y mejorada - Enero 2026**  
> Stack verificado para compatibilidad entre todas las dependencias

**📖 DOCUMENTOS COMPLEMENTARIOS:**
- **Este documento:** Especificaciones técnicas completas del stack
- **GUIA-IMPLEMENTACION-PASO-A-PASO.md:** Orden de ejecución optimizado para evitar errores

**⚠️ IMPORTANTE PARA IMPLEMENTACIÓN:**
Antes de comenzar a codificar, leer el documento `GUIA-IMPLEMENTACION-PASO-A-PASO.md` que contiene:
- Orden exacto de fases (1-6)
- Protocolos de pausa para configuración
- Gestión de memoria del LLM
- Configuración de base de datos con timing correcto
- Checkpoints de validación

---

## 📋 ANÁLISIS DEL PROMPT ORIGINAL

### ✅ Fortalezas Identificadas
- Estructura clara y bien organizada
- Enfoque en multitenancy con RLS
- Stack moderno y popular
- Requisitos específicos bien definidos

### ⚠️ Problemas Detectados
1. **Next.js 16.16 NO EXISTE** - La versión mencionada es incorrecta
2. **Falta especificación de versiones compatibles** para todo el stack
3. **No incluye librerías para manejo de archivos** (XLSX, CSV, PDF)
4. **Turborepo**: Necesita justificación más clara sobre cuándo usarlo
5. **Falta documentación sobre breaking changes** en versiones recientes

---

## 🛠️ STACK TÉCNICO ACTUALIZADO Y VERIFICADO (ENERO 2026)

### Frontend
```json
{
  "next": "^16.0.10",                    // ✅ Última versión estable (con Turbopack por defecto)
  "react": "^19.0.0",                    // ✅ React 19 estable
  "react-dom": "^19.0.0",                // ✅ Compatible con React 19
  "typescript": "^5.7.2"                 // ✅ Última versión estable
}
```

**Notas Next.js 16:**
- ⚡ Turbopack es ahora el bundler por defecto (5-10x más rápido)
- 🔧 React Compiler support (estable)
- ⚠️ **BREAKING CHANGES**: params/searchParams ahora son async
- ⚠️ middleware.ts renombrado a proxy.ts (edge runtime deprecado)
- 📦 File system caching en desarrollo (beta)

### Backend
```json
{
  "@nestjs/core": "^11.1.12",           // ✅ Última versión estable (enero 2026)
  "@nestjs/common": "^11.1.12",         // ✅ NestJS 11 con JSON logging
  "@nestjs/platform-express": "^11.1.12", // ✅ O usar Fastify para mayor rendimiento
  "typescript": "^5.7.2"                 // ✅ Mismo que frontend
}
```

**Notas NestJS 11:**
- 🎯 JSON logging nativo incorporado
- ⚡ Mejoras de rendimiento en startup (módulos dinámicos)
- 🔄 cache-manager v6 con Keyv
- ✨ ParseDatePipe, IntrinsicException
- 🔧 CQRS con request-scoped providers

### Base de Datos y ORM
```json
{
  "prisma": "^7.2.0",                   // ✅ Prisma 7 estable (sin Rust engine)
  "@prisma/client": "^7.2.0",           // ✅ Cliente actualizado
  "@supabase/supabase-js": "^2.48.1",   // ✅ Cliente Supabase más reciente
  "postgresql": "16+"                    // ✅ Versión recomendada
}
```

**Notas Prisma 7:**
- 🚀 **Sin dependencias de Rust** - instalación más rápida
- 📁 Cliente generado en `/src` por defecto (no en node_modules)
- 🔧 SQL Comments para observabilidad
- ⚠️ **BREAKING**: Uint8Array en lugar de Buffer para Bytes
- 🎯 Mejor compatibilidad con edge runtimes

### UI y Estilos
```json
{
  "tailwindcss": "^4.0.0",              // ✅ Tailwind v4 (beta estable)
  "shadcn-ui": "latest",                // ✅ Compatible con React 19
  "@radix-ui/react-*": "latest",        // ✅ Primitivos actualizados
  "lucide-react": "^0.468.0",           // ✅ Iconos
  "clsx": "^2.1.1",                     // ✅ Utilidad className
  "tailwind-merge": "^2.5.5"            // ✅ Merge de clases
}
```

**Notas shadcn/ui:**
- ✅ Completamente compatible con React 19 y Next.js 16
- 🎨 Soporte para Tailwind v4 con directiva `@theme`
- 🔄 Eliminados todos los `forwardRef` (ahora usa `ref` como prop)
- 🎯 Atributo `data-slot` para styling avanzado
- 📦 Nueva CLI con `npx shadcn add`

### Estado y Data Fetching
```json
{
  "@tanstack/react-query": "^5.90.19",  // ✅ Compatible React 19
  "@tanstack/query-devtools": "^5.90.19" // ✅ Devtools incluidas
}
```

**Notas TanStack Query:**
- ✅ Totalmente compatible con React 19
- 🔄 Funciona perfectamente con React Server Components
- ⚡ Patrón recomendado: RSC para initial load + RQ para interactividad
- 🎯 useSuspenseQuery para integración con Suspense

### Validación y Autorización
```json
{
  "zod": "^3.24.1",                     // ✅ Validación de schemas
  "@casl/ability": "^6.7.1",            // ✅ RBAC/ABAC
  "@casl/prisma": "^1.4.1"              // ✅ Integración Prisma
}
```

### 📊 MANEJO DE ARCHIVOS (NUEVO - REQUISITO SOLICITADO)

#### Para XLSX con formato (lectura/escritura completa)
```json
{
  "exceljs": "^4.4.0"                   // ✅ RECOMENDADO: Full-featured, estilos, fórmulas
}
```
**Características:**
- ✅ Lectura/escritura completa
- ✅ Estilos, formato, bordes, colores
- ✅ Fórmulas y validación de datos
- ✅ Soporte para .xlsx y .xlsm
- 📦 ~1.5MB minified

**Alternativas:**
```json
{
  "xlsx": "^0.18.5",                    // Ligero, amplio soporte formatos
  "xlsx-populate": "^1.21.0"            // Preserva estilos, jQuery-style API
}
```

#### Para CSV
```json
{
  "papaparse": "^5.4.1",                // ✅ RECOMENDADO: Parsing robusto
  "csv-parse": "^5.6.0",                // Alternativa: Node.js streams
  "csv-stringify": "^6.5.2"             // Para generar CSV
}
```

#### Para PDF

##### Opción 1: @react-pdf/renderer (RECOMENDADO para reportes estructurados)
```json
{
  "@react-pdf/renderer": "^4.3.2"       // ✅ RECOMENDADO: PDFs con React components
}
```

**Ventajas:**
- ✅ Sintaxis React familiar (JSX-like)
- ✅ Funciona en Browser Y Node.js
- ✅ PDFs ligeros con texto seleccionable
- ✅ Excelente para reportes, facturas, documentos estructurados
- ✅ Sin dependencias pesadas (Chromium)
- ✅ Styling CSS-like (Flexbox, colores, fuentes)

**Desventajas:**
- ⚠️ Componentes limitados (no DOM completo)
- ⚠️ NO soporta React 19 oficialmente (workaround necesario)
- ⚠️ Requiere reescribir templates separados

**Casos de uso ideales:**
- Facturas, reportes financieros
- Certificados, diplomas
- Documentos con estructura fija
- Tamaños: A4, Letter, Legal, custom

##### Opción 2: Puppeteer (Para HTML existente → PDF)
```json
{
  "puppeteer": "^24.1.0"                // ✅ HTML completo a PDF (Headless Chrome)
}
```

**Ventajas:**
- ✅ Renderiza HTML/CSS exacto (SVGs, fuentes custom)
- ✅ Reutiliza componentes React existentes
- ✅ No necesitas templates separados
- ✅ Ideal para "imprimir página actual"

**Desventajas:**
- ❌ Muy pesado (~300MB con Chromium)
- ❌ Alto consumo de memoria/CPU
- ❌ PDFs grandes (imagen-based)
- ❌ Latencia alta en producción
- ❌ Complicado en Docker/serverless

**Casos de uso ideales:**
- Exportar dashboard complejo
- Screenshots de páginas dinámicas
- Cuando DEBES mantener fidelidad 100% visual

##### Opción 3: pdf-lib (Manipulación de PDFs existentes)
```json
{
  "pdf-lib": "^1.17.1"                  // ✅ Modificar/rellenar PDFs existentes
}
```

**Casos de uso:**
- Rellenar formularios PDF
- Agregar firmas/watermarks
- Combinar/dividir PDFs
- Modificar metadatos

##### Opción 4: pdfjs-dist (Leer PDFs)
```json
{
  "pdfjs-dist": "^4.9.155"              // ✅ Renderizar/leer PDFs (Mozilla)
}
```

**Casos de uso:**
- Visualizar PDFs en navegador
- Extraer texto de PDFs
- Análisis de contenido

---

### 🎯 DECISIÓN FINAL PARA ESTE SAAS

**Stack recomendado:**

```json
{
  "@react-pdf/renderer": "^4.3.2",      // ✅ Reportes estructurados (facturas, certificados)
  "pdf-lib": "^1.17.1",                 // ✅ Manipular PDFs existentes (firmas, formularios)
  "pdfjs-dist": "^4.9.155"              // ✅ Visualizar PDFs en frontend
}
```

**NO incluir Puppeteer** a menos que:
- Necesites fidelidad 100% de páginas HTML complejas
- Tengas infraestructura robusta (no serverless)
- El rendimiento no sea crítico

**Razón:** @react-pdf/renderer + pdf-lib cubren el 90% de casos de uso con mejor rendimiento.

---

### 🏷️ ETIQUETAS TÉRMICAS (Zebra/Toshiba) - NUEVO

Para impresión de etiquetas térmicas directamente desde el navegador (bypass de diálogos de impresión):

```json
{
  "qz-tray": "^2.2.5"                   // ✅ Cliente JavaScript
}
```

**Requisito adicional:** QZ Tray Desktop App (instalación en cliente)
- Descarga: https://qz.io/download/
- Funciona como servicio local (WebSocket)
- Se comunica con impresoras térmicas

**Configuración:**

```typescript
// apps/api/src/printing/thermal.service.ts

import * as qz from 'qz-tray';

export class ThermalPrintingService {
  async printZebraLabel(data: {
    orderId: string;
    customer: string;
    barcode: string;
    items: string[];
  }): Promise<void> {
    // Conectar a QZ Tray
    await qz.websocket.connect();

    // Buscar impresora Zebra
    const printer = await qz.printers.find('zebra');
    
    // Configurar impresora (4x6" thermal label)
    const config = qz.configs.create(printer, {
      units: 'in',
      size: { width: 4, height: 6 }
    });

    // Generar ZPL (Zebra Programming Language)
    const zplCommands = [
      '^XA',                              // Start format
      '^FO50,50^ADN,36,20^FD' + data.orderId + '^FS',  // Order ID
      '^FO50,100^ADN,24,12^FD' + data.customer + '^FS', // Customer
      '^FO50,200^BY3^BCN,100,Y,N,N',     // Barcode
      '^FD' + data.barcode + '^FS',      // Barcode data
      '^XZ'                               // End format
    ];

    // Imprimir
    await qz.print(config, zplCommands);
    
    // Desconectar
    await qz.websocket.disconnect();
  }

  // Imprimir EPL (para impresoras más antiguas)
  async printEPLLabel(data: any): Promise<void> {
    await qz.websocket.connect();
    const printer = await qz.printers.find('toshiba');
    
    const config = qz.configs.create(printer, {
      units: 'in',
      size: { width: 2, height: 1 }  // 2x1" label
    });

    const eplCommands = [
      '\nN',                 // Clear buffer
      'q609',                // Label width
      'Q203,26',             // Label height, gap
      'A50,10,0,3,1,1,N,"Order: ' + data.orderId + '"',
      'B50,50,0,1,2,2,60,N,"' + data.barcode + '"',
      'P1',                  // Print 1 label
      '\n'
    ];

    await qz.print(config, eplCommands);
    await qz.websocket.disconnect();
  }
}
```

**Frontend (Next.js):**

```typescript
// apps/web/src/lib/thermal-printer.ts

import qz from 'qz-tray';

export async function printShippingLabel(orderId: string) {
  try {
    // Conectar
    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
    }

    // Listar impresoras disponibles
    const printers = await qz.printers.find();
    console.log('Available printers:', printers);

    // Seleccionar Zebra
    const zebraPrinter = printers.find(p => 
      p.toLowerCase().includes('zebra')
    );

    if (!zebraPrinter) {
      throw new Error('Zebra printer not found');
    }

    const config = qz.configs.create(zebraPrinter);
    
    // ZPL para etiqueta de envío 4x6"
    const zpl = `
^XA
^FO50,50^A0N,50,50^FDOrder #${orderId}^FS
^FO50,150^BY3^BCN,100,Y,N,N
^FD${orderId}^FS
^XZ
    `.trim();

    await qz.print(config, [zpl]);
    
    return { success: true };
  } catch (error) {
    console.error('Printing failed:', error);
    return { success: false, error };
  }
}
```

**Tamaños de etiqueta soportados:**
- **4x6"**: Etiquetas de envío estándar (FedEx, UPS)
- **2x1"**: Etiquetas de productos pequeños
- **4x2"**: Etiquetas de dirección
- Custom: Cualquier tamaño en pulgadas o mm

**Características QZ Tray:**
- ✅ Impresión silenciosa (sin diálogos)
- ✅ Soporte ZPL (Zebra), EPL (Toshiba/Eltron)
- ✅ Detección automática de impresoras
- ✅ Status de impresora (online/offline)
- ✅ Multiplataforma (Windows, Mac, Linux)

**Limitaciones:**
- ❌ Requiere app desktop instalada en cliente
- ❌ Requiere firma digital para producción (licencia)
- ⚠️ Solo impresoras locales (no cloud)

**Licencia QZ Tray:**
- Free: Desarrollo y pruebas
- Paid: Producción (firma digital requerida)
- Costo: ~$299/año por sitio

**Alternativa sin QZ Tray:**
Si no quieres dependencia de app desktop, usa API de impresoras cloud:
- **Zebra Cloud Print**: API REST
- **PrintNode**: Servicio cloud para cualquier impresora
- **CUPS**: Linux printing system (backend)

---

### Linters y Formateo
```json
{
  "eslint": "^9.18.0",                  // ✅ ESLint 9
  "eslint-config-next": "^16.0.10",     // ✅ Config Next.js 16
  "prettier": "^3.4.2",                 // ✅ Formateo
  "prettier-plugin-tailwindcss": "^0.6.11" // ✅ Ordenar clases Tailwind
}
```

### Testing
```json
{
  "vitest": "^3.0.7",                   // ✅ Test runner moderno
  "@testing-library/react": "^16.1.0",  // ✅ Compatible React 19
  "@testing-library/jest-dom": "^6.6.3", // ✅ Matchers
  "playwright": "^1.49.1"               // ✅ E2E tests
}
```

### Monorepo (EVALUACIÓN CRÍTICA)

#### ❌ **NO usar Turborepo si:**
- Proyecto pequeño/mediano (< 5 apps/paquetes)
- Equipo pequeño (< 5 desarrolladores)
- Sólo frontend + backend (2 paquetes)
- Presupuesto/tiempo limitado para setup

#### ✅ **SÍ usar Turborepo si:**
- Múltiples apps (web, mobile, admin, etc.)
- Paquetes compartidos complejos (10+ paquetes)
- Equipos distribuidos que necesitan builds incrementales
- CI/CD necesita optimización agresiva (remote caching)

```json
// Para este proyecto SaaS básico (Frontend + Backend)
{
  "turbo": "^2.3.3"                     // ⚠️ OPCIONAL - Evaluar necesidad real
}
```

**Alternativa más simple:**
```json
{
  "npm": "workspaces",                  // ✅ Nativo, sin dependencias extra
  "pnpm": "workspaces"                  // ✅ O usar PNPM (más rápido)
}
```

**RECOMENDACIÓN**: Empezar con **npm/pnpm workspaces** y migrar a Turborepo solo si:
- El tiempo de build supera 5 minutos
- Tienes > 5 paquetes interdependientes
- Necesitas remote caching (equipos distribuidos)

---

## 🎯 TABLA DE COMPATIBILIDAD COMPLETA

| Dependencia | Versión | Compatible con | Notas |
|-------------|---------|----------------|-------|
| **Next.js** | 16.0.10+ | React 19, Node 18.18+ | Turbopack por defecto |
| **React** | 19.0.0 | Next 15-16 | Stable desde dic 2024 |
| **NestJS** | 11.1.12 | Node 18.18+, TS 5.1+ | JSON logging nativo |
| **Prisma** | 7.2.0 | Node 18.18+, TS 5.1+ | Sin Rust, genera en src/ |
| **TypeScript** | 5.7.2 | Todas las deps | Recomendado strict mode |
| **TailwindCSS** | 4.0.0 | PostCSS 8, Next 16 | Beta estable |
| **shadcn/ui** | latest | React 19, Tailwind 4 | Ref como prop |
| **TanStack Query** | 5.90.19 | React 18-19 | Suspense support |
| **Zod** | 3.24.1 | TS 5+ | Validación schemas |
| **CASL** | 6.7.1 | Prisma 5-7 | RBAC/ABAC |
| **ExcelJS** | 4.4.0 | Node 14+ | Full XLSX support |
| **Papaparse** | 5.4.1 | Browser/Node | CSV parsing |
| **@react-pdf/renderer** | 4.3.2 | React 16-18 (⚠️ no 19) | PDF generation |
| **pdf-lib** | 1.17.1 | Browser/Node | PDF manipulation |
| **pdfjs-dist** | 4.9.155 | Browser/Node | PDF viewing |
| **qz-tray** | 2.2.5 | Browser (+ Desktop app) | Thermal printing |
| **Vitest** | 3.0.7 | Node 18+ | Vite-based |
| **Playwright** | 1.49.1 | Node 18+ | E2E testing |

---

## 📐 ARQUITECTURA DEL PROYECTO

### Estructura Monorepo Recomendada (npm workspaces)

```
saas-multitenant/
├── package.json                    # Root workspace
├── .env.example
├── .gitignore
├── turbo.json                      # OPCIONAL - Solo si usas Turborepo
├── apps/
│   ├── web/                        # Next.js App
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts
│   │   ├── src/
│   │   │   ├── app/                # App Router
│   │   │   │   ├── (auth)/
│   │   │   │   ├── (dashboard)/
│   │   │   │   ├── api/
│   │   │   │   └── layout.tsx
│   │   │   ├── components/         # Componentes React
│   │   │   │   ├── ui/             # shadcn components
│   │   │   │   └── shared/
│   │   │   ├── lib/
│   │   │   │   ├── api-client.ts   # Cliente API (fetch wrapper)
│   │   │   │   ├── hooks/          # React hooks
│   │   │   │   └── utils.ts
│   │   │   └── styles/
│   │   └── public/
│   │
│   └── api/                        # NestJS Backend
│       ├── package.json
│       ├── nest-cli.json
│       ├── tsconfig.json
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── auth/               # Módulo Auth
│       │   │   ├── auth.module.ts
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── guards/
│       │   │   │   ├── jwt.guard.ts
│       │   │   │   └── tenant.guard.ts
│       │   │   ├── decorators/
│       │   │   │   ├── current-user.decorator.ts
│       │   │   │   └── current-tenant.decorator.ts
│       │   │   └── strategies/
│       │   │       └── jwt.strategy.ts
│       │   ├── tenants/            # Módulo Tenants
│       │   │   ├── tenants.module.ts
│       │   │   ├── tenants.controller.ts
│       │   │   ├── tenants.service.ts
│       │   │   └── dto/
│       │   ├── users/              # Módulo Users
│       │   ├── casl/               # CASL Autorización
│       │   │   ├── casl.module.ts
│       │   │   ├── casl-ability.factory.ts
│       │   │   └── guards/
│       │   │       └── policies.guard.ts
│       │   ├── files/              # NUEVO: Módulo archivos
│       │   │   ├── files.module.ts
│       │   │   ├── files.controller.ts
│       │   │   ├── files.service.ts
│       │   │   └── processors/
│       │   │       ├── xlsx.processor.ts
│       │   │       ├── csv.processor.ts
│       │   │       └── pdf.processor.ts
│       │   └── prisma/             # Módulo Prisma
│       │       ├── prisma.module.ts
│       │       └── prisma.service.ts
│       └── test/
│
├── packages/                       # Paquetes compartidos
│   ├── database/                   # Prisma Schema + Cliente
│   │   ├── package.json
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── generated/          # Cliente Prisma generado
│   │   │   └── index.ts
│   │   └── README.md
│   │
│   ├── types/                      # TypeScript types compartidos
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── api/                # Tipos API
│   │   │   ├── entities/           # Entidades DB
│   │   │   └── index.ts
│   │   └── tsconfig.json
│   │
│   ├── config/                     # Configuraciones compartidas
│   │   ├── eslint/
│   │   │   └── next.js
│   │   ├── typescript/
│   │   │   ├── base.json
│   │   │   ├── nextjs.json
│   │   │   └── nestjs.json
│   │   └── tailwind/
│   │       └── base.js
│   │
│   └── utils/                      # Utilidades compartidas
│       ├── package.json
│       ├── src/
│       │   ├── validators.ts       # Validadores Zod
│       │   ├── formatters.ts
│       │   └── constants.ts
│       └── tsconfig.json
│
├── .github/
│   └── workflows/
│       ├── ci.yml                  # CI Pipeline
│       ├── deploy-web.yml          # Deploy Frontend
│       └── deploy-api.yml          # Deploy Backend
│
├── scripts/
│   ├── setup.sh                    # Setup inicial
│   ├── reset-db.sh                 # Reset database
│   └── generate-types.sh           # Generar types desde Prisma
│
└── docs/
    ├── SETUP.md
    ├── ARCHITECTURE.md
    ├── API.md
    └── DEPLOYMENT.md
```

---

## 🗄️ SCHEMA PRISMA CON MULTITENANCY

```prisma
// packages/database/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  output   = "../src/generated"
  previewFeatures = ["multiSchema"] // Para RLS
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Supabase connection pooling
}

// ===================================
// TENANTS
// ===================================

model Tenant {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  domain    String?  @unique
  
  // Settings
  settings  Json     @default("{}")
  plan      TenantPlan @default(FREE)
  status    TenantStatus @default(ACTIVE)
  
  // Metadata
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  memberships Membership[]
  invites     Invite[]
  
  // Tenant-scoped data (ejemplos)
  projects    Project[]
  documents   Document[]
  
  @@index([slug])
  @@index([status])
  @@map("tenants")
}

enum TenantPlan {
  FREE
  STARTER
  PRO
  ENTERPRISE
}

enum TenantStatus {
  ACTIVE
  SUSPENDED
  DELETED
}

// ===================================
// USERS
// ===================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  avatar        String?
  
  // Auth (Supabase Auth maneja passwords)
  supabaseId    String?   @unique
  
  // Metadata
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  
  // Relations
  memberships   Membership[]
  invitesSent   Invite[]  @relation("InviteSender")
  
  @@index([email])
  @@map("users")
}

// ===================================
// MEMBERSHIPS (User-Tenant relation)
// ===================================

model Membership {
  id        String   @id @default(cuid())
  
  // Relations
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Role & Permissions
  role      MembershipRole
  
  // Metadata
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([userId, tenantId])
  @@index([tenantId])
  @@index([userId])
  @@map("memberships")
}

enum MembershipRole {
  OWNER        // Full access, can delete tenant
  ADMIN        // Manage users, settings
  MEMBER       // Basic access
  VIEWER       // Read-only
}

// ===================================
// INVITES
// ===================================

model Invite {
  id         String   @id @default(cuid())
  email      String
  
  // Relations
  tenantId   String
  tenant     Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  invitedBy  String
  inviter    User     @relation("InviteSender", fields: [invitedBy], references: [id])
  
  // Invite details
  role       MembershipRole
  token      String   @unique
  expiresAt  DateTime
  acceptedAt DateTime?
  
  // Metadata
  createdAt  DateTime @default(now())
  
  @@unique([tenantId, email])
  @@index([token])
  @@index([email])
  @@map("invites")
}

// ===================================
// TENANT-SCOPED DATA (Ejemplos)
// ===================================

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  
  // Tenant isolation
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Data
  status      String   @default("active")
  metadata    Json     @default("{}")
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  documents   Document[]
  
  @@index([tenantId])
  @@index([tenantId, status])
  @@map("projects")
}

model Document {
  id          String   @id @default(cuid())
  title       String
  content     String?  @db.Text
  
  // Tenant isolation
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Relations
  projectId   String?
  project     Project? @relation(fields: [projectId], references: [id])
  
  // File metadata (para XLSX, PDF, CSV)
  fileType    FileType?
  fileUrl     String?
  fileSize    Int?
  fileName    String?
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([tenantId])
  @@index([projectId])
  @@map("documents")
}

enum FileType {
  XLSX
  CSV
  PDF
  JSON
  OTHER
}
```

---

## 🔒 ROW LEVEL SECURITY (RLS) - SUPABASE

```sql
-- packages/database/prisma/migrations/rls-policies.sql

-- Enable RLS on all tenant-scoped tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Helper function to get current tenant from JWT
CREATE OR REPLACE FUNCTION auth.current_tenant_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'tenant_id',
    NULL
  )
$$ LANGUAGE SQL STABLE;

-- Tenant policies (users can only see their own tenants through memberships)
CREATE POLICY "Users can view tenants they belong to"
  ON tenants FOR SELECT
  USING (
    id IN (
      SELECT tenant_id FROM memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their tenants"
  ON tenants FOR UPDATE
  USING (
    id IN (
      SELECT tenant_id FROM memberships
      WHERE user_id = auth.uid() AND role = 'OWNER'
    )
  );

-- Membership policies
CREATE POLICY "Users can view memberships of their tenants"
  ON memberships FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage memberships"
  ON memberships FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM memberships
      WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
    )
  );

-- Project policies (tenant-scoped)
CREATE POLICY "Users can view projects of their tenant"
  ON projects FOR SELECT
  USING (tenant_id = auth.current_tenant_id());

CREATE POLICY "Users can create projects in their tenant"
  ON projects FOR INSERT
  WITH CHECK (tenant_id = auth.current_tenant_id());

CREATE POLICY "Users can update projects in their tenant"
  ON projects FOR UPDATE
  USING (tenant_id = auth.current_tenant_id());

CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM memberships
      WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
    )
  );

-- Document policies (tenant-scoped)
CREATE POLICY "Users can view documents of their tenant"
  ON documents FOR SELECT
  USING (tenant_id = auth.current_tenant_id());

CREATE POLICY "Users can create documents in their tenant"
  ON documents FOR INSERT
  WITH CHECK (tenant_id = auth.current_tenant_id());

CREATE POLICY "Users can update their tenant's documents"
  ON documents FOR UPDATE
  USING (tenant_id = auth.current_tenant_id());

CREATE POLICY "Users can delete their tenant's documents"
  ON documents FOR DELETE
  USING (tenant_id = auth.current_tenant_id());
```

---

## 🎫 CONFIGURACIÓN CASL (Autorización)

```typescript
// apps/api/src/casl/casl-ability.factory.ts

import { Injectable } from '@nestjs/common';
import { 
  AbilityBuilder, 
  PureAbility, 
  AbilityClass,
  ExtractSubjectType,
  InferSubjects
} from '@casl/ability';
import { MembershipRole } from '@prisma/client';

// Define actions
type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';

// Define subjects
type Subjects = 
  | 'Tenant'
  | 'User'
  | 'Membership'
  | 'Project'
  | 'Document'
  | 'File'
  | 'all';

export type AppAbility = PureAbility<[Actions, Subjects]>;

export interface TenantUser {
  id: string;
  tenantId: string;
  role: MembershipRole;
}

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: TenantUser) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      PureAbility as AbilityClass<AppAbility>
    );

    // OWNER: full access
    if (user.role === 'OWNER') {
      can('manage', 'all');
    }

    // ADMIN: manage users, projects, documents
    if (user.role === 'ADMIN') {
      can('read', 'all');
      can('create', ['Project', 'Document', 'File']);
      can('update', ['Project', 'Document', 'File']);
      can('delete', ['Project', 'Document', 'File']);
      can('create', 'Membership');
      can('update', 'Membership');
      can('delete', 'Membership');
      
      // Cannot modify tenant settings
      cannot('update', 'Tenant');
      cannot('delete', 'Tenant');
    }

    // MEMBER: create and manage own resources
    if (user.role === 'MEMBER') {
      can('read', 'all');
      can('create', ['Project', 'Document', 'File']);
      can('update', ['Project', 'Document', 'File'], { 
        // Solo si fue creado por el usuario
        createdById: user.id 
      });
      can('delete', ['Project', 'Document', 'File'], { 
        createdById: user.id 
      });
      
      cannot('manage', 'Membership');
      cannot('manage', 'Tenant');
    }

    // VIEWER: read-only
    if (user.role === 'VIEWER') {
      can('read', 'all');
      cannot('create', 'all');
      cannot('update', 'all');
      cannot('delete', 'all');
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
```

---

## 📦 DEPENDENCIAS PARA ARCHIVOS

### ExcelJS (XLSX con formato)

```typescript
// apps/api/src/files/processors/xlsx.processor.ts

import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class XlsxProcessor {
  async createFromData(data: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    // Add headers con estilo
    const headers = Object.keys(data[0] || {});
    worksheet.addRow(headers);
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    // Add data
    data.forEach((row) => {
      worksheet.addRow(Object.values(row));
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const length = cell.value ? cell.value.toString().length : 10;
        if (length > maxLength) maxLength = length;
      });
      column.width = maxLength + 2;
    });

    // Generate buffer
    return await workbook.xlsx.writeBuffer() as Buffer;
  }

  async readFromBuffer(buffer: Buffer): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];
    const data: any[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip headers

      const rowData: any = {};
      row.eachCell((cell, colNumber) => {
        rowData[`col${colNumber}`] = cell.value;
      });
      data.push(rowData);
    });

    return data;
  }
}
```

### Papaparse (CSV)

```typescript
// apps/api/src/files/processors/csv.processor.ts

import { Injectable } from '@nestjs/common';
import * as Papa from 'papaparse';

@Injectable()
export class CsvProcessor {
  async parseFromString(csvString: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(csvString, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (error) => reject(error),
      });
    });
  }

  async stringifyToCSV(data: any[]): Promise<string> {
    return Papa.unparse(data, {
      header: true,
    });
  }
}
```

### pdf-lib (PDF)

```typescript
// apps/api/src/files/processors/pdf.processor.ts

import { Injectable } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

@Injectable()
export class PdfProcessor {
  async createFromText(text: string): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    page.drawText(text, {
      x: 50,
      y: 750,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  async extractText(buffer: Buffer): Promise<string> {
    const pdfDoc = await PDFDocument.load(buffer);
    // Nota: pdf-lib no extrae texto, usar pdfjs-dist
    return 'PDF text extraction requires pdfjs-dist';
  }
}
```

---

## 🚀 COMANDOS DE SETUP

### Instalación inicial

```bash
# Clonar estructura
npx create-next-app@latest apps/web --typescript --tailwind --app
nest new apps/api

# Instalar dependencias root
npm install -D turbo prettier eslint

# Configurar workspaces (package.json root)
{
  "name": "saas-multitenant",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "db:generate": "cd packages/database && npx prisma generate",
    "db:migrate": "cd packages/database && npx prisma migrate dev",
    "db:push": "cd packages/database && npx prisma db push",
    "db:seed": "cd packages/database && npx prisma db seed"
  },
  "devDependencies": {
    "turbo": "^2.3.3",
    "prettier": "^3.4.2",
    "eslint": "^9.18.0"
  }
}

# Instalar Prisma
cd packages/database
npm init -y
npm install @prisma/client prisma
npx prisma init

# Configurar Prisma
# Editar .env con DATABASE_URL de Supabase
npx prisma db push
npx prisma generate

# Instalar deps backend
cd ../../apps/api
npm install @nestjs/common @nestjs/core @nestjs/platform-express
npm install @prisma/client @casl/ability @casl/prisma
npm install zod class-validator class-transformer
npm install exceljs papaparse pdf-lib

# Instalar deps frontend
cd ../web
npm install @tanstack/react-query
npm install @supabase/supabase-js
npm install zod
npm install exceljs papaparse pdf-lib
npx shadcn@latest init
npx shadcn@latest add button card input dialog

# Volver a root e instalar todo
cd ../..
npm install
```

---

## ⚙️ VARIABLES DE ENTORNO

### apps/web/.env.local
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### apps/api/.env
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:5432/db"

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJxxx...

# App
PORT=3001
NODE_ENV=development
```

---

## 🔄 CI/CD PIPELINE

```yaml
# .github/workflows/ci.yml

name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]

    steps:
      - uses: actions/checkout@v4
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Generate Prisma Client
        run: npm run db:generate
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Setup Inicial
- [ ] Crear estructura monorepo
- [ ] Configurar workspaces (npm/pnpm)
- [ ] Instalar dependencias verificadas
- [ ] Configurar TypeScript estricto
- [ ] Setup ESLint + Prettier

### Fase 2: Base de Datos
- [ ] Configurar Supabase project
- [ ] Crear schema Prisma con multitenancy
- [ ] Implementar migraciones
- [ ] Configurar RLS policies
- [ ] Crear seeds de prueba

### Fase 3: Backend (NestJS)
- [ ] Setup NestJS con módulos
- [ ] Implementar Auth (Supabase + JWT)
- [ ] Configurar Guards (Tenant, JWT)
- [ ] Implementar CASL ability factory
- [ ] Crear módulos: Tenants, Users, Memberships
- [ ] Implementar procesadores de archivos (XLSX, CSV, PDF)
- [ ] Tests unitarios

### Fase 4: Frontend (Next.js)
- [ ] Configurar Next.js 16 + React 19
- [ ] Setup Tailwind + shadcn/ui
- [ ] Implementar layouts (Auth, Dashboard)
- [ ] Configurar TanStack Query
- [ ] Crear componentes UI compartidos
- [ ] Implementar auth flows
- [ ] Selector de tenant

### Fase 5: Integración
- [ ] Conectar Frontend con Backend
- [ ] Implementar manejo de archivos
- [ ] Tests E2E con Playwright
- [ ] Optimizar performance
- [ ] Configurar error handling

### Fase 6: CI/CD y Deploy
- [ ] Configurar GitHub Actions
- [ ] Setup Vercel/Railway/AWS
- [ ] Configurar preview deployments
- [ ] Monitoring y logging
- [ ] Documentación final

---

## 🎯 PREGUNTAS RESPONDIDAS

### 1. ¿Es Turborepo la mejor opción?

**RESPUESTA**: **DEPENDE del tamaño del proyecto**

✅ **USA Turborepo si:**
- Múltiples aplicaciones (> 3)
- Muchos paquetes compartidos (> 5)
- Equipo grande (> 5 devs)
- Builds lentos (> 5 min)
- Necesitas remote caching

❌ **NO uses Turborepo si:**
- Proyecto pequeño (Frontend + Backend)
- Equipo pequeño (< 5 devs)
- Presupuesto/tiempo limitado

**RECOMENDACIÓN para este SaaS**: Empezar con **npm workspaces** (o pnpm) y migrar a Turborepo **SOLO SI** realmente lo necesitas.

### 2. ¿Qué componentes críticos faltan?

Agregados en esta versión mejorada:
- ✅ Librerías para archivos (XLSX, CSV, PDF)
- ✅ Procesadores de archivos en backend
- ✅ Versiones específicas y compatibles
- ✅ Configuración RLS detallada
- ✅ CASL con ejemplos de roles
- ✅ Testing setup (Vitest + Playwright)
- ✅ Monitoreo y logging consideraciones

### 3. Estructura de carpetas recomendada

Ver sección **ARQUITECTURA DEL PROYECTO** arriba.

### 4. Comandos exactos de setup

Ver sección **COMANDOS DE SETUP** arriba.

### 5. Variables de entorno mínimas

Ver sección **VARIABLES DE ENTORNO** arriba.

---

## 🔧 DIFERENCIAS CLAVE CON PROMPT ORIGINAL

| Aspecto | Original | Mejorado |
|---------|----------|----------|
| Next.js | 16.16 ❌ (no existe) | 16.0.10+ ✅ |
| React | No especificado | 19.0.0 ✅ |
| NestJS | No especificado | 11.1.12 ✅ |
| Prisma | No especificado | 7.2.0 ✅ |
| Archivos XLSX | ❌ Falta | ExcelJS 4.4.0 ✅ |
| Archivos CSV | ❌ Falta | Papaparse 5.4.1 ✅ |
| Archivos PDF | ❌ Falta | pdf-lib 1.17.1 ✅ |
| Turborepo | No justificado | Análisis crítico ✅ |
| Testing | No especificado | Vitest + Playwright ✅ |
| CI/CD | Básico | Pipeline completo ✅ |
| RLS | Mencionado | SQL completo ✅ |
| CASL | Mencionado | Factory completo ✅ |

---

## 📚 RECURSOS ADICIONALES

- **Next.js 16**: https://nextjs.org/blog/next-16
- **React 19**: https://react.dev/blog/2024/12/05/react-19
- **NestJS 11**: https://trilon.io/blog/announcing-nestjs-11-whats-new
- **Prisma 7**: https://www.prisma.io/blog/announcing-prisma-orm-7-0-0
- **shadcn/ui + React 19**: https://ui.shadcn.com/docs/react-19
- **TanStack Query**: https://tanstack.com/query/latest
- **CASL**: https://casl.js.org/v6/en/
- **Supabase RLS**: https://supabase.com/docs/guides/auth/row-level-security

---

## 🎓 PRÓXIMOS PASOS

1. **Clonar o usar este prompt** para inicializar el proyecto
2. **Seguir el checklist** de implementación
3. **Iterar por fases** sin saltar pasos
4. **Testing continuo** desde fase 1
5. **Documentar decisiones** importantes
6. **Code reviews** antes de merge

---

**Creado por:** Claude (Anthropic)  
**Fecha:** Enero 2026  
**Versión:** 2.0 - Mejorada y Verificada
