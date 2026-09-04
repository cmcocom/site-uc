# Installation Commands for Agent Skills

## Prerequisites

- Node.js 18+
- Terminal (PowerShell en Windows)

## Installation Methods

### Método 1: npx add-skill (recomendado)

```bash
npx add-skill <owner/repo> --skill <skill-name>
```

### Método 2: npx playbooks

```bash
npx playbooks add skill <owner/repo> --skill <skill-name>
```

### Método 3: npx skills

```bash
npx skills add <owner/repo>
```

---

## Skills por Categoría

### Frameworks

| Skill        | Comando de Instalación                                                     |
| ------------ | -------------------------------------------------------------------------- |
| astro        | `npx add-skill astro-build/astro-agent --skill astro`                      |
| nextjs       | `npx add-skill anthropics/skills --skill next-best-practices`              |
| react        | `npx add-skill anthropics/skills --skill vercel-react-best-practices`      |
| react-native | `npx add-skill.expo/expo-agent-skills --skill react-native-architecture`   |
| vite         | `npx add-skill vitejs/vite-agent --skill vite`                             |
| nestjs       | `npx add-skill nestjs/nest-agent --skill nestjs-best-practices`            |
| hono         | `npx add-skill honojs/hono-agent --skill hono`                             |
| shadcn-ui    | `npx add-skill shadcn-ui/agent-skills --skill shadcn-ui`                   |
| tailwind     | `npx add-skill tailwindlabs/tailwind-agent --skill tailwind-design-system` |
| prisma       | `npx add-skill prisma/prisma-agent --skill prisma-expert`                  |
| react-email  | `npx add-skill resend/react-email-agent --skill react-email`               |

### Cloud & DB

| Skill      | Comando de Instalación                                                         |
| ---------- | ------------------------------------------------------------------------------ |
| cloudflare | `npx add-skill cloudflare/agent-skills --skill cloudflare`                     |
| postgresql | `npx add-skill postgresql/postgres-agent --skill postgresql-table-design`      |
| supabase   | `npx add-skill supabase/agent-skills --skill supabase-postgres-best-practices` |
| wrangler   | `npx add-skill cloudflare/wrangler-agent --skill wrangler`                     |

### Seguridad & APIs

| Skill                | Comando de Instalación                                                |
| -------------------- | --------------------------------------------------------------------- |
| api-security         | `npx add-skill anthropics/skills --skill api-security-best-practices` |
| api-design           | `npx add-skill anthropics/skills --skill api-design-principles`       |
| secrets-management   | `npx add-skill anthropics/skills --skill secrets-management`          |
| email-best-practices | `npx add-skill anthropics/skills --skill email-best-practices`        |

### UI/UX

| Skill            | Comando de Instalación                                     |
| ---------------- | ---------------------------------------------------------- |
| interface-design | `npx add-skill anthropics/skills --skill interface-design` |
| frontend-design  | `npx add-skill anthropics/skills --skill frontend-design`  |

### Calidad & Procesos

| Skill             | Comando de Instalación                                             |
| ----------------- | ------------------------------------------------------------------ |
| docker            | `npx add-skill docker/agent-skills --skill docker-expert`          |
| eslint-prettier   | `npx add-skill anthropics/skills --skill eslint-prettier-config`   |
| barcode-generator | `npx add-skill vercel-labs/agent-skills --skill barcode-generator` |
| qr-code-generator | `npx add-skill vercel-labs/agent-skills --skill qr-code-generator` |
| pdf               | `npx add-skill vercel-labs/agent-skills --skill pdf`               |
| xlsx              | `npx add-skill vercel-labs/agent-skills --skill xlsx`              |

### Desarrollo

| Skill                          | Comando de Instalación                                                   |
| ------------------------------ | ------------------------------------------------------------------------ |
| brainstorming                  | `npx add-skill anthropics/skills --skill brainstorming`                  |
| writing-plans                  | `npx add-skill anthropics/skills --skill writing-plans`                  |
| executing-plans                | `npx add-skill anthropics/skills --skill executing-plans`                |
| test-driven-development        | `npx add-skill anthropics/skills --skill test-driven-development`        |
| systematic-debugging           | `npx add-skill anthropics/skills --skill systematic-debugging`           |
| requesting-code-review         | `npx add-skill anthropics/skills --skill requesting-code-review`         |
| receiving-code-review          | `npx add-skill anthropics/skills --skill receiving-code-review`          |
| verification-before-completion | `npx add-skill anthropics/skills --skill verification-before-completion` |
| finishing-a-development-branch | `npx add-skill anthropics/skills --skill finishing-a-development-branch` |
| subagent-driven-development    | `npx add-skill anthropics/skills --skill subagent-driven-development`    |
| dispatching-parallel-agents    | `npx add-skill anthropics/skills --skill dispatching-parallel-agents`    |
| writing-skills                 | `npx add-skill anthropics/skills --skill writing-skills`                 |
| using-git-worktrees            | `npx add-skill anthropics/skills --skill using-git-worktrees`            |
| continuous-learning            | `npx add-skill anthropics/skills --skill continuous-learning`            |

### Especializadas

| Skill                | Comando de Instalación                                                |
| -------------------- | --------------------------------------------------------------------- |
| agent-memory-systems | `npx add-skill anthropics/skills --skill agent-memory-systems`        |
| prompt-engineering   | `npx add-skill anthropics/skills --skill prompt-engineering-patterns` |
| error-handling       | `npx add-skill anthropics/skills --skill error-handling-patterns`     |
| react-doctor         | `npx add-skill react-doctor/react-doctor --skill react-doctor`        |

---

## Notas Importantes

### Skills ya incluidos en OpenCode

Las siguientes skills ya están disponibles en opencode y **NO requieren instalación**:

- todas las de desarrollo (brainstorming, writing-plans, etc.)
- frontend-design
- interface-design
- postgresql-table-design
- supabase-postgres-best-practices

### Instalar globalmente

```bash
npx add-skill <owner/repo> --skill <skill-name> --global
```

### Listar skills disponibles en un repo

```bash
npx add-skill <owner/repo> --list
```

### Para VSCode con GitHub Copilot

```bash
# VSCode Agent Skills se instalan desde la extensión de Copilot
# Consultar: https://code.visualstudio.com/docs/copilot/agents/overview
```

---

## Ejemplo de uso completo

```powershell
# Instalar skill de frontend-design globalmente
npx add-skill anthropics/skills --skill frontend-design --global

# Instalar skill de astro para este proyecto
npx add-skill astro-build/astro-agent --skill astro

# Listar skills disponibles en un repo
npx add-skill vercel-labs/agent-skills --list
```

---

## Recursos

- Web: https://skills.sh
- CLI: https://github.com/vercel-labs/skills
- add-skill: https://add-skill.org/
- playbooks: https://playbooks.com
