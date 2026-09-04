# AGENTS.md - Configuración Universal de Agentes

## Propósito

Este archivo contiene instrucciones para que cualquier agente de IA (opencode, VS Code Copilot, Claude, etc.) entienda cómo trabajar con este proyecto de forma autónoma.

---

## Instrucciones de Contexto

### Skills Instaladas

El agente tiene acceso a las siguientes skills. **Debe cargar automáticamente las que sean pertinentes según el prompt del usuario, sin que este lo indique explícitamente.**

**Frameworks:**

- astro, next-best-practices, vercel-react-best-practices, react-native-architecture, vite, nestjs-best-practices, hono, shadcn-ui, tailwind-design-system, prisma-expert, react-email

**Cloud & DB:**

- cloudflare, postgresql-table-design, supabase-postgres-best-practices, wrangler

**Seguridad & APIs:**

- api-security-best-practices, api-design-principles, secrets-management, email-best-practices

**UI/UX:**

- interface-design, frontend-design

**Calidad & Procesos:**

- docker-expert, eslint-prettier-config, barcode-generator, qr-code-generator, pdf, xlsx

**Desarrollo:**

- brainstorming, writing-plans, executing-plans, test-driven-development, systematic-debugging, receiving-code-review, requesting-code-review, verification-before-completion, finishing-a-development-branch, subagent-driven-development, dispatching-parallel-agents, writing-skills, using-git-worktrees, continuous-learning

**Especializadas:**

- agent-memory-systems, prompt-engineering-patterns, error-handling-patterns, react-doctor, brainstorming

---

## Reglas de Selección de Skills

### Antes de ejecutar cualquier prompt, el agente debe

1. **Analizar el requerimiento** - Entender qué necesita el usuario, sin importar si usa lenguaje técnico o coloquial.

2. **Cargar las skills pertinentes** - Seleccionar automáticamente de la lista arriba según este mapeo:

| Si el usuario dice...                                                       | Cargar skill(s)                                            |
| --------------------------------------------------------------------------- | ---------------------------------------------------------- |
| "armar", "crear", "hacer", "implementar" + feature nueva                    | brainstorming + framework relevant                         |
| "diseñar", "planear", "cómo hago para..."                                   | brainstorming + frontend-design o postgresql-table-design  |
| "tengo specs", "tengo requisitos", "tengo un plan"                          | writing-plans o executing-plans                            |
| "hay un error", "no funciona", "bug", "rompió"                              | systematic-debugging                                       |
| "revisar código", "revisar mi trabajo"                                      | requesting-code-review + react-doctor (si es React)        |
| "crear UI", "página", "componente", "diseño"                                | frontend-design + framework relevante                      |
| "base de datos", "tablas", "schema", "modelo"                               | postgresql-table-design + supabase-postgres-best-practices |
| "API", "endpoint", "ruta"                                                   | api-design-principles + api-security-best-practices        |
| "Docker", "contenedor", "deploy"                                            | docker-expert                                              |
| "Autenticar", "login", "auth"                                               | nextjs-supabase-auth (si es Next.js) o secrets-management  |
| "tareas programadas", "cron", "background"                                  | continuous-learning                                        |
| Lenguaje coloquial ("arme algo para mostrar...", "quiero hacer que когда... | Entender la intención y cargar skills relevantes           |

3. **Cargar skills automáticamente** - Este AGENTS.md se ejecuta sin que el usuario lo indique manualmente.

4. **Si hay ambigüedad, preguntar** - Si el requerimiento no está claro o hay varias opciones, preguntar al usuario antes de proceder.

---

## Formato de Prompt

El usuario puede escribir en:

- ✅ Lenguaje técnico: "crear endpoint REST para usuarios"
- ✅ Lenguaje coloquial: "necesito algo para registrar usuarios"
- ✅ Mezcla: "hace falta un login simple"

El agente debe interpretar ambos casos por igual.

---

## Notas Adicionales

- Este archivo se lee automáticamente al iniciar sesión con opencode
- El agente debe recordar el contexto de la conversación
- Si el proyecto tiene configuración especial (entorno, variables, herramientas), agregarla abajo

---

## Configuración del Proyecto

_(Pendiente de completar)_**

### Stack actual

- [ ] Por definir

### Requerimientos pendientes:**

- [ ] Por definir
