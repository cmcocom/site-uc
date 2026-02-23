# 🎯 GUÍA DE IMPLEMENTACIÓN PASO A PASO
## SaaS Multitenant - Orden de Ejecución Optimizado

> **IMPORTANTE PARA EL LLM:**  
> Esta guía define el orden EXACTO de implementación para evitar:
> - ❌ Saturación de memoria del contexto
> - ❌ Errores de dependencias circulares  
> - ❌ Problemas de configuración de base de datos
> - ❌ Bloqueos por falta de variables de entorno

---

## 📋 INSTRUCCIONES PARA EL ASISTENTE LLM

### Reglas de Oro para la Implementación

1. **NUNCA saltar fases** - Cada fase depende de la anterior
2. **VALIDAR antes de continuar** - Ejecutar tests/compilación después de cada paso
3. **DOCUMENTAR decisiones** - Explicar por qué se elige X sobre Y
4. **PAUSAR para configuración** - Esperar confirmación del usuario cuando se requieran:
   - Variables de entorno
   - Credenciales de servicios externos
   - Aprobación de cambios estructurales

### Cómo Procesar Este Documento

```
Para cada FASE:
  1. Leer TODA la fase completa antes de escribir código
  2. Verificar prerequisitos
  3. Implementar paso a paso
  4. PAUSAR si se requiere input del usuario
  5. Validar que funcione antes de continuar
  6. Solo entonces, pasar a la siguiente fase
```

### Gestión de Contexto (Memory Management)

- **Por cada fase:** Crear máximo 3-5 archivos por iteración
- **Archivos grandes (>200 líneas):** Crear en secciones, no de una vez
- **Evitar re-generar:** Si un archivo ya existe y funciona, referenciar, no reescribir
- **Checkpoints:** Después de cada fase, resumir lo completado

---

## 🗄️ DECISIÓN: BASE DE DATOS

### ¿Crear DB en Supabase AHORA o DESPUÉS?

**RESPUESTA: CREAR EN FASE 2 (Setup Inicial)**

**Razón:**
- El schema Prisma necesita DATABASE_URL válida desde el inicio
- `prisma generate` falla sin conexión DB
- RLS policies deben aplicarse después de primera migración

### Flujo de Base de Datos

```
FASE 2.1: Crear proyecto Supabase
  ↓
FASE 2.2: Obtener credenciales
  ↓
FASE 2.3: Configurar .env (PAUSAR - esperar usuario)
  ↓
FASE 2.4: Crear schema Prisma
  ↓
FASE 2.5: Primera migración (crea tablas)
  ↓
FASE 2.6: Aplicar RLS policies (SQL manual)
  ↓
FASE 2.7: Seed inicial
```

---

## 📊 FASES DE IMPLEMENTACIÓN

### FASE 0: Pre-requisitos (5 min)

**Objetivo:** Verificar entorno antes de empezar

**Checklist:**
- [ ] Node.js 18.18+ instalado
- [ ] npm/pnpm/yarn instalado
- [ ] Git configurado
- [ ] Editor (VS Code recomendado)
- [ ] Cuenta Supabase creada (https://supabase.com)

**Comandos de verificación:**
```bash
node --version  # >= 18.18
npm --version   # >= 9.0
git --version   # cualquier versión
```

**Acción del LLM:**
- Proveer estos comandos
- Explicar por qué cada herramienta es necesaria
- NO continuar si faltan prerequisitos

---

### FASE 1: Estructura Monorepo (15-20 min)

**Objetivo:** Crear estructura de carpetas y configurar workspaces

**Pasos:**

#### 1.1 Crear estructura base
```bash
mkdir saas-multitenant
cd saas-multitenant
npm init -y
```

#### 1.2 Configurar workspaces en package.json root
```json
{
  "name": "saas-multitenant",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspaces",
    "build": "npm run build --workspaces",
    "lint": "npm run lint --workspaces"
  }
}
```

#### 1.3 Crear carpetas
```bash
mkdir -p apps/web apps/api
mkdir -p packages/database packages/types packages/config packages/utils
mkdir -p .github/workflows scripts docs
```

#### 1.4 Inicializar Git
```bash
git init
echo "node_modules/
.env
.env.local
dist/
build/
.next/
.turbo/" > .gitignore
```

**Validación:**
```bash
tree -L 2 -I node_modules
# Debe mostrar estructura correcta
```

**🚨 PAUSAR AQUÍ** - Usuario debe confirmar estructura antes de continuar

---

### FASE 2: Base de Datos y Prisma (30-40 min)

**Objetivo:** Configurar Supabase, crear schema, aplicar migraciones

#### 2.1 Crear proyecto Supabase

**Instrucciones manuales para el usuario:**
```
1. Ir a https://supabase.com/dashboard
2. Click "New Project"
3. Nombre: saas-multitenant-dev
4. Database Password: [guardar en lugar seguro]
5. Region: [más cercana]
6. Click "Create new project"
7. Esperar ~2 minutos (provisioning)
```

**🚨 PAUSAR AQUÍ** - Esperar que usuario complete setup

#### 2.2 Obtener credenciales

**Usuario debe copiar:**
```
Settings > Database > Connection string > URI
  → Para DATABASE_URL

Settings > Database > Connection pooling > Connection string
  → Para DIRECT_URL

Settings > API > Project URL
  → Para SUPABASE_URL

Settings > API > anon public
  → Para NEXT_PUBLIC_SUPABASE_ANON_KEY

Settings > API > service_role (secret!)
  → Para SUPABASE_SERVICE_ROLE_KEY
```

#### 2.3 Configurar variables de entorno

**LLM debe crear archivos template:**

**apps/api/.env.example**
```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres"

# JWT
JWT_SECRET="CHANGE-ME-IN-PRODUCTION"
JWT_EXPIRES_IN="7d"

# Supabase
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_SERVICE_KEY="YOUR-SERVICE-ROLE-KEY"

# App
PORT=3001
NODE_ENV=development
```

**apps/web/.env.local.example**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR-ANON-KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR-SERVICE-ROLE-KEY"

# API
NEXT_PUBLIC_API_URL="http://localhost:3001"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**🚨 PAUSAR AQUÍ** - Usuario debe:
1. Copiar .env.example a .env (backend)
2. Copiar .env.local.example a .env.local (frontend)
3. Rellenar con credenciales reales de Supabase
4. CONFIRMAR que .env está en .gitignore

#### 2.4 Setup Prisma

**Instalar dependencias:**
```bash
cd packages/database
npm init -y
npm install @prisma/client prisma
npx prisma init
```

**Crear schema completo** (del documento principal)

**packages/database/prisma/schema.prisma**
```prisma
// [COPIAR SCHEMA COMPLETO DEL DOCUMENTO PRINCIPAL]
```

**Configurar prisma/.env** (temporal para CLI)
```env
DATABASE_URL="postgresql://..."  # Copiar de apps/api/.env
```

#### 2.5 Primera migración

```bash
cd packages/database

# Crear migración inicial
npx prisma migrate dev --name init

# Verificar en Supabase Dashboard > Table Editor
# Deberías ver: tenants, users, memberships, invites, projects, documents
```

**🚨 SI FALLA:**
- Verificar DATABASE_URL
- Verificar contraseña (URL encode caracteres especiales)
- Verificar que Supabase esté online

#### 2.6 Generar cliente Prisma

```bash
npx prisma generate
# Esto crea packages/database/src/generated/
```

**Crear export principal:**

**packages/database/src/index.ts**
```typescript
export * from './generated';
export { PrismaClient } from './generated';
```

**packages/database/package.json**
```json
{
  "name": "@saas/database",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "generate": "prisma generate",
    "migrate": "prisma migrate dev",
    "studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^7.2.0"
  },
  "devDependencies": {
    "prisma": "^7.2.0"
  }
}
```

#### 2.7 Aplicar Row Level Security (RLS)

**Crear archivo SQL:**

**packages/database/prisma/rls-policies.sql**
```sql
-- [COPIAR POLÍTICAS RLS DEL DOCUMENTO PRINCIPAL]
```

**Ejecutar en Supabase:**
```
1. Supabase Dashboard > SQL Editor
2. Click "New Query"
3. Copiar/pegar contenido de rls-policies.sql
4. Click "Run"
5. Verificar que no haya errores
```

**🚨 PAUSAR AQUÍ** - Usuario debe ejecutar SQL manualmente

#### 2.8 Seed inicial (opcional)

**packages/database/prisma/seed.ts**
```typescript
import { PrismaClient, MembershipRole, TenantPlan } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Crear tenant de prueba
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Company',
      slug: 'demo-company',
      plan: TenantPlan.PRO,
    },
  });

  // Crear usuario owner
  const user = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      name: 'Admin User',
    },
  });

  // Crear membership
  await prisma.membership.create({
    data: {
      userId: user.id,
      tenantId: tenant.id,
      role: MembershipRole.OWNER,
    },
  });

  console.log('✅ Seed completed');
  console.log('Demo login: admin@demo.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Configurar script:**

**packages/database/package.json** (agregar)
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "devDependencies": {
    "tsx": "^4.7.0"
  }
}
```

**Ejecutar seed:**
```bash
npm install tsx
npx prisma db seed
```

**Validación FASE 2:**
```bash
# Debe funcionar sin errores
npx prisma studio
# Abrir http://localhost:5555
# Verificar que haya datos en las tablas
```

---

### FASE 3: Backend NestJS (60-90 min)

**Objetivo:** API funcional con Auth, Guards, CASL

**⚠️ IMPORTANTE:** Esta fase es larga - dividir en sub-fases

#### 3.1 Inicializar NestJS

```bash
cd apps/api
npm install @nestjs/cli -g
nest new . --skip-git --package-manager npm
```

**Instalar dependencias core:**
```bash
npm install @nestjs/common @nestjs/core @nestjs/platform-express
npm install @nestjs/config @nestjs/jwt @nestjs/passport
npm install passport passport-jwt
npm install @prisma/client
npm install class-validator class-transformer
npm install bcrypt
npm install zod

npm install -D @types/passport-jwt @types/bcrypt
```

**Validación:**
```bash
npm run start:dev
# Debe compilar sin errores
# http://localhost:3000 debe responder
```

#### 3.2 Módulo Prisma

**src/prisma/prisma.module.ts**
```typescript
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**src/prisma/prisma.service.ts**
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@saas/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

**Importar en app.module.ts:**
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
  ],
})
export class AppModule {}
```

**🔍 Validación:**
```bash
npm run start:dev
# No debe haber errores de importación
```

#### 3.3 Auth Module (dividir en partes pequeñas)

**PARTE A: DTOs y Types**

**src/auth/dto/signup.dto.ts**
```typescript
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  tenantName?: string;
}
```

**src/auth/dto/signin.dto.ts**
```typescript
import { IsEmail, IsString } from 'class-validator';

export class SignInDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

**🚨 PAUSAR** - Compilar y verificar

**PARTE B: JWT Strategy y Guards**

[Continúa con implementación modular...]

---

**[RESTO DE FASES 4-6 SIGUEN EL MISMO PATRÓN MODULAR]**

---

## 🎓 SKILLS RECOMENDADAS PARA EL LLM

### Skills que deberías instalar:

1. **docx** - Para generar documentación automática
2. **pdf** - Para crear reportes de progreso
3. **pptx** - Para presentaciones del proyecto
4. **frontend-design** - Crucial para Next.js + shadcn/ui
5. **product-self-knowledge** - Referencia de capacidades de Claude

### Cómo usar los skills durante implementación:

```
Antes de crear componentes UI → Leer /mnt/skills/public/frontend-design/SKILL.md
Antes de generar PDFs → Leer /mnt/skills/public/pdf/SKILL.md
Antes de crear docs → Leer /mnt/skills/public/docx/SKILL.md
```

---

## 🔄 PROTOCOLO DE CHECKPOINT

Después de cada FASE, el LLM debe:

1. **Resumir lo completado:**
   ```
   ✅ FASE X Completada:
   - Archivos creados: [lista]
   - Configuraciones aplicadas: [lista]
   - Tests pasados: [sí/no]
   ```

2. **Validar estado:**
   ```bash
   npm run build  # Todo compila
   npm run lint   # Sin errores críticos
   git status     # Cambios rastreados
   ```

3. **Preguntar antes de continuar:**
   ```
   ¿Todo funciona correctamente?
   ¿Algún error o warning inesperado?
   ¿Listo para FASE siguiente?
   ```

4. **Documentar problemas:**
   Si algo falla, crear `docs/TROUBLESHOOTING.md` con soluciones

---

## 📝 LOGS Y DEBUGGING

### Qué documentar en cada paso:

```markdown
## FASE X - [Nombre]
**Fecha:** 2026-01-XX
**Duración:** XX minutos

### Archivos creados:
- `path/to/file.ts`
- `path/to/another.ts`

### Comandos ejecutados:
```bash
npm install package
npx command
```

### Problemas encontrados:
1. Error: "Cannot find module"
   - Solución: Agregar a package.json

### Estado final:
- [ ] Compilación exitosa
- [ ] Tests pasando
- [ ] Variables .env configuradas
```

---

## 🚀 ORDEN DE PRIORIDAD

Si el usuario tiene tiempo limitado, implementar en este orden:

1. **CRÍTICO (Mínimo viable):**
   - FASE 1-3: Estructura + DB + Backend básico
   - FASE 4: Frontend mínimo (login + dashboard)

2. **IMPORTANTE (Funcional completo):**
   - FASE 5: Integración completa
   - CASL autorización
   - Manejo de archivos básico

3. **NICE TO HAVE (Producción):**
   - FASE 6: CI/CD
   - Tests E2E
   - Optimizaciones

---

## ⚠️ ERRORES COMUNES A EVITAR

### 1. Generar demasiado código de una vez
❌ **Mal:** Crear todo el módulo Auth (10 archivos) en una respuesta
✅ **Bien:** Crear 2-3 archivos, validar, luego continuar

### 2. No verificar dependencias
❌ **Mal:** Asumir que package X está instalado
✅ **Bien:** Verificar package.json antes de importar

### 3. Ignorar errores de TypeScript
❌ **Mal:** Continuar aunque haya errores de tipos
✅ **Bien:** Resolver todos los errores antes de siguiente paso

### 4. No sincronizar .env
❌ **Mal:** Variables hardcodeadas en código
✅ **Bien:** Siempre usar process.env con validación

### 5. Saltar configuración de RLS
❌ **Mal:** Confiar solo en lógica de aplicación
✅ **Bien:** Implementar RLS en DB + guards en API

---

## 📞 PROTOCOLO DE COMUNICACIÓN CON USUARIO

### Cuándo PAUSAR y pedir input:

1. **Antes de cambios destructivos:**
   - Eliminar archivos/carpetas
   - Cambiar estructura de DB
   - Modificar .env variables

2. **Cuando se necesita información externa:**
   - Credenciales de servicios
   - Configuración de dominios
   - Decisiones de arquitectura

3. **Si algo no está claro:**
   - Requisitos ambiguos
   - Múltiples opciones válidas
   - Trade-offs importantes

### Formato de mensaje de pausa:

```
🚨 PAUSA REQUERIDA

**Acción necesaria:** [descripción]

**¿Qué debe hacer?**
1. [paso 1]
2. [paso 2]

**Una vez completado, confirme con:** "Listo, continuar"

**Tiempo estimado:** ~X minutos
```

---

## 🎯 META-ESTRATEGIA PARA EL LLM

```python
class ImplementacionStrategy:
    def __init__(self):
        self.fase_actual = 0
        self.archivos_creados = []
        self.validaciones_pasadas = []
    
    def siguiente_paso(self):
        # 1. Verificar que fase anterior esté completa
        if not self.validar_fase_actual():
            return "PAUSAR: Fase anterior tiene errores"
        
        # 2. Leer skill relevante si aplica
        skill = self.identificar_skill_necesaria()
        if skill:
            self.leer_skill(skill)
        
        # 3. Crear archivos en lotes pequeños
        archivos = self.archivos_siguientes(max=3)
        
        # 4. Generar código
        for archivo in archivos:
            self.crear_archivo(archivo)
        
        # 5. Validar
        if not self.compilar_y_validar():
            return "ERROR: Revisar código generado"
        
        # 6. Documentar
        self.actualizar_log()
        
        # 7. Checkpoint
        return "CHECKPOINT: ¿Continuar a siguiente paso?"
```

---

**FIN DE LA GUÍA - ¡ÉXITO EN TU IMPLEMENTACIÓN! 🚀**
