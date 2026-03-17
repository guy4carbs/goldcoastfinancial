# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rules

ALWAYS before making any change: Search on the web for the newest documentation. And only implement if you are 100% sure it will work.

## Project

- **Name:** Gold Coast Financial (GCF) — Heritage Life Solutions
- **Production:** heritagels.org
- **Deployment:** Railway.app
- **Stack:** React 19 + Vite + Tailwind v4 + shadcn/ui | Express 4 + Drizzle ORM + PostgreSQL (Neon)

## Scripts

```bash
npm run dev          # Express dev server (port 4500) — serves API + Vite client
npm run dev:client   # Vite-only client dev server (port 5173)
npm run build        # Production build (esbuild server → dist/index.cjs + Vite client)
npm run start        # Production start (node dist/index.cjs)
npm run check        # TypeScript type checking (tsc --noEmit)
npm run db:push      # Drizzle schema push to database
```

No test framework is configured. There are no unit tests.

## Architecture

### Monorepo Layout

```
client/     → React 19 frontend (Vite, Tailwind v4, shadcn/ui)
server/     → Express 4 backend
shared/     → Drizzle ORM schema + Zod validators (shared between client and server)
```

**Path aliases:** `@/*` → `client/src/*`, `@shared/*` → `shared/*` (configured in tsconfig.json)

### Backend: Request Flow

1. `server/index.ts` — Entry point: Express app, HTTP server, middleware stack, WebSocket setup, agent system bootstrap
2. `server/routes.ts` — **Monolith route file** (~3,400 lines): session setup, `attachUser` middleware, core auth/portal/analytics routes, then mounts 25+ sub-routers
3. `server/routes/*.ts` — Modular routers (each exports default Express Router)

**Route registration pattern** (in `registerRoutes()` inside `server/routes.ts`):
- Core routes: defined inline (auth, quotes, contact, portal, training, analytics, search)
- Sub-routers: imported and mounted via `app.use("/api/path", router)` at ~line 2554+
- Agent system routes: `app.use('/api', createAgentRoutes(agentRegistry))` at end of file

**Key sub-routers:**
| Mount Path | Router File | Purpose |
|------------|------------|---------|
| `/api/crm` | `routes/crm.ts` | CRM pipeline, leads, deal stages |
| `/api/agent-clients` | `routes/agent-clients.ts` | Agent client management |
| `/api/client-portal` | `routes/client-portal.ts` | Client portal actions (claims, etc.) |
| `/api/client-chat` | `routes/client-chat.ts` | Agent-client messaging |
| `/api/hierarchy` | `routes/hierarchy.ts` | Commission hierarchy/overrides |
| `/api/automations` | `routes/automations.ts` | Automation engine rules |
| `/api/onboarding` | `routes/onboarding.ts` | Agent onboarding flow |

### Backend: Auth System

- **Session:** Express-session with `connect-pg-simple` PostgreSQL store, 7-day cookie
- **Middleware chain:** `attachUser` (populates `req.user` on all requests, non-blocking) → `requireAuth` (blocks if no session) → `requireRole(...)` / `requirePermission(...)` for RBAC
- **Type:** `AuthenticatedUser` interface on `req.user` (`server/middleware/auth.ts`)
- **Roles** (hierarchy order): `owner > system_admin > manager > sales_agent > marketing_staff > client > investor` (`server/types/permissions.ts`)
- **Granular permissions:** `Permission` enum with `leads:view:own`, `leads:view:all`, etc. — checked via `requirePermission()`
- **2FA:** TOTP via speakeasy with `require2FA()` middleware

### Backend: Data Access Layer

**`server/storage.ts`** defines `IStorage` interface (~400+ methods) implemented by `DatabaseStorage` class. Singleton exported as `storage`.

Pattern for all data access:
```typescript
import { storage } from "./storage";
const user = await storage.getUserById(id);
const policies = await storage.getPoliciesByUserId(userId);
```

Uses Drizzle ORM (`db` from `server/db.ts`) for typed queries and raw `pool.query()` for complex SQL. Both `db` and `pool` are exported from `server/db.ts`.

### Backend: Database Schema

- **Schema location:** `shared/schema.ts` re-exports all models from `shared/models/*.ts`
- **Pattern:** Each model file uses `pgTable()` + `createInsertSchema()` (drizzle-zod) + `$inferSelect` / `$inferInsert` type exports
- **Drizzle config:** `drizzle.config.ts` — output to `./migrations/`, schema from `./shared/schema.ts`
- **DB init:** `server/db.ts` also has `initializeDatabase()` which creates tables via raw SQL `CREATE TABLE IF NOT EXISTS` (runs at startup)

**Column naming convention:** Drizzle schema uses `snake_case` in DB (`first_name`, `created_at`) but Drizzle auto-maps to camelCase in TypeScript. When using raw `pool.query()`, results come back in snake_case and must be manually normalized for the frontend.

### Frontend: Routing & Data Fetching

- **Router:** Wouter (lightweight, not React Router). Routes defined in `client/src/App.tsx` with `<Switch>` / `<Route>`
- **Data fetching:** TanStack Query v5 via `client/src/lib/queryClient.ts`
  - **Default queryFn** uses `queryKey` as the URL: `useQuery({ queryKey: ['/api/some-path'] })` automatically fetches that URL
  - `staleTime: Infinity`, `retry: false`, no auto-refetch — data is cached until manual invalidation
  - **`apiRequest(method, url, data?)`** — helper for mutations (POST/PUT/DELETE) with `credentials: "include"`
  - **401 handling:** configurable via `getQueryFn({ on401: "throw" | "returnNull" })`

### Frontend: Design System

**`client/src/lib/heritageDesignSystem.ts`** — All design tokens:
- `GRID` — 8-point modular grid spacing (xs=8 through section=96)
- `TYPE` — Typography scale (micro=11 to display=40)
- `RADIUS` — Corner radius (input=12, button=16, card=24, hero=32, pill=999)
- `SHADOW` — Elevation-based shadows
- `MOTION` — Spring physics animation config, `fadeInUp`, `staggerContainer`, `scaleIn` variants
- `COLORS` — Heritage palette tokens

Components use shadcn/ui (Radix primitives) + Tailwind v4 + Framer Motion.

### Frontend: Portal Layouts

Each portal has a layout wrapper component with sidebar navigation:
- `AgentLoungeLayout` — Agent portal (command center, clients, outreach, growth)
- `ClientLoungeLayout` — Client portal (dashboard, policies, documents, billing)
- `HeritageLayout` / `LoungeLayout` — CRM and manager portals

### WebSocket Channels

4 separate WebSocket servers on the same HTTP server:
- `/ws/chat` — Team chat (agent-to-agent)
- `/ws/client-chat` — Agent-client messaging
- `/ws/gcf` — Real-time events with RBAC channels
- `/ws/avatars` — Avatar Council (AI debate system)

### AI Agent System

- **37 business agents** organized in tiers 0-10 (`server/agents/`)
- **17 governance agents** (tier 11-12) — the swarm defined below
- Bootstrap via `bootstrapAgentSystem()` in `server/agents/index.ts`
- Inter-agent communication via EventBus
- Routes exposed via `createAgentRoutes(agentRegistry)`

### Key Pipelines

**Lead-to-Client Conversion** (`server/services/leadConversionService.ts`):
When a lead reaches "placed" stage in CRM pipeline → `convertLeadToClient()` auto-creates: client user account (random password + hashed invite token) → policy stub → chat conversation → welcome notifications → welcome email. Idempotency guard via `lead.convertedUserId`.

**S3 Document Upload** (`server/services/s3Service.ts`):
multer memoryStorage → `s3Service.validateFile()` → `s3Service.uploadFile()` → `storage.createDocument()` with `s3Key`. Downloads via `s3Service.getSignedDownloadUrl()`.

### External Integrations

All managed via `server/services/` and integration bridges:
- Gmail API (`server/gmail.ts`) — transactional email
- Google Calendar (`server/googleCalendar.ts`) — appointment sync
- Google Sheets (`server/sheets.ts`) — lead export
- Twilio/SMS (`server/services/smsService.ts`)
- AWS S3 (`server/services/s3Service.ts`) — document storage
- Apple Push Notifications (`@parse/node-apn`)
- Sentry (`server/services/errorTracking.ts`) — error tracking

---

## Default Workflow

ALWAYS use the 17-agent governed swarm for ALL work on this project. No task should be executed without routing through the appropriate agent(s). When in doubt, start with Atlas.

## Agent Swarm

| Agent | Domain | Authority |
|-------|--------|-----------|
| Atlas | Architecture / Requirements | Only one who changes requirements. Resolves conflicts. |
| Nova | Frontend / UI | Owns all UI. Uses ui-ux-pro-max + frontend-design plugins. |
| Forge | Backend / APIs | Owns business logic. Enforces role hierarchy. |
| Vector | Database / Schema | Owns all schema. No table/column without Vector. |
| Oracle | AI / LLM | Owns AI orchestration. No direct LLM calls outside Oracle. |
| Relay | Automation / Workflows | Owns triggers, queues, jobs. Cannot invent business rules. |
| Anchor | DevOps / Infrastructure | Owns deployment. Gated by Gauge + Sentinel. |
| Prism | Analytics / BI | Owns dashboards. Cannot redefine financial math. |
| Ledger | Financial / Commissions | Veto power on compensation logic. |
| Helix | Compliance / Regulatory | Cannot be overridden by managers/directors. |
| Sentinel | Security / Risk | Veto power on releases. |
| Gauge | QA / Release | Defines "done." Cannot be overridden without Atlas. |
| Lumen | Product Flows / UX Logic | Owns user journeys. No flow changes without Lumen. |
| Conduit | Integrations / APIs | No external integrations without Conduit spec. |
| Scout | External Tooling / Dependencies | Only agent allowed to install packages, SDKs, UI kits, or MCPs. Gated by Sentinel + Gauge. |
| Scribe | Research / Documentation | Required for major decisions. Cannot make final calls. |
| Axiom | UX Simplicity / Product Experience | Reviews all new pages, dashboards, nav changes, onboarding, and features for simplicity. No veto. |

---

## Communication Protocol

### Task Intake
Every task enters through **Atlas**. Atlas decomposes into subtasks, assigns to owning agents, defines acceptance criteria, identifies cross-domain dependencies.

### Agent-to-Agent Handoff Format
```
HANDOFF → [Target Agent]
From: [Source Agent]
Need: [What is needed]
Context: [Why it's needed]
Blocked until: [What must happen before continuing]
```

### Cross-Domain Change Chains

| Change Type | Chain |
|-------------|-------|
| Schema | Vector → Sentinel → Gauge → Atlas |
| Financial Logic | Ledger → Vector → Sentinel → Gauge → Atlas |
| Compliance | Helix → Sentinel → Atlas |
| AI Features | Oracle → Sentinel → Atlas |
| Permissions | Forge → Sentinel → Atlas |
| Infrastructure | Anchor → Sentinel → Gauge → Atlas |
| User Flows | Lumen → Axiom → Nova (UI) + Forge (backend) → Gauge |
| Integrations | Conduit → Vector (schema) + Sentinel (security) → Gauge |
| UI Changes | Axiom → Nova → (if flow change: Lumen review) → Gauge |
| Backend Changes | Forge → (if schema: Vector) → (if financial: Ledger) → Gauge |
| New Dependency | Scribe (research) → Atlas (approval) → Scout (install + pin) → Sentinel (vuln scan) → Gauge (validation) |
| Dependency Upgrade | Scout → Sentinel → Gauge → (if major version: Atlas) |

### Veto Authorities
- **Sentinel** — blocks release for security risks
- **Ledger** — blocks changes to compensation logic
- **Helix** — blocks compliance bypass attempts
- **Gauge** — blocks release if tests fail

Veto resolution: Atlas must formally resolve the finding.

### Handoff Rules
- Atlas is the only agent allowed to change requirements or core architecture.
- Scout is the only agent allowed to introduce or install new external packages, SDKs, UI kits, or MCPs.
- Nova never changes the database schema.
- Forge never rewrites the UI without Nova coordination.
- Vector is the only agent allowed to modify database schema or data models.
- Sentinel can block a release if there is a high-risk finding.
- Gauge defines what "done" means in tests and can prevent production release.
- Helix can halt release if regulatory or compliance risk exists.
- Anchor controls deployment environments and production infrastructure changes.
- Conduit is the only agent allowed to build or modify third-party API integrations.
- Axiom reviews all new pages, dashboard designs, navigation changes, onboarding flows, and feature additions before Nova finalizes UI.
- Axiom cannot change backend logic (Forge), data models (Vector), architecture (Atlas), or install packages (Scout).

### Conflict Resolution Order
1. Domain owners attempt resolution
2. If cross-domain → Atlas arbitrates
3. If security risk → Sentinel veto
4. If financial risk → Ledger veto
5. If compliance risk → Helix veto

---

## Domain Boundaries

### Frontend (Nova)
- `client/` — All React components, pages, hooks, styles
- Cannot modify: `shared/models/`, `server/`, `migrations/`

### Backend (Forge)
- `server/routes/`, `server/services/`, `server/storage.ts`
- Cannot modify: `client/`, schema without Vector, financial math without Ledger

### Schema (Vector)
- `shared/models/`, `migrations/`, `drizzle.config.ts`

### AI (Oracle)
- `server/agents/`, `server/services/llmService.ts`, `server/services/debateEngine.ts`, `server/services/avatarRegistry.ts`, `server/services/orchestrationEngine.ts`

### Automation (Relay)
- `server/services/automation-engine.ts`, `server/services/workflow-engine.ts`

### Infrastructure (Anchor)
- `railway.json`, `.env`, `script/build.ts`

### Financial (Ledger)
- Commission tables in `shared/models/enterprise.ts`
- Compensation logic in `server/services/` and `server/storage.ts`

### Compliance (Helix)
- `shared/models/licenses.ts`, `shared/models/security.ts`, `server/routes/licenses.ts`, `server/services/auditService.ts`

### Security (Sentinel)
- Auth middleware, rate limiting, CORS, Helmet config
- `server/services/twoFactorService.ts`, `server/services/accountLockoutService.ts`

### Integrations (Conduit)
- `server/gmail.ts`, `server/googleCalendar.ts`, `server/sheets.ts`, `server/services/smsService.ts`, `server/services/s3Service.ts`

### Dependencies (Scout)
- Must pin exact versions (no `^`, no `~`, no `latest`). All installs require Sentinel vuln scan + Gauge validation.

---

## Non-Negotiable Domains
These cannot be modified without formal multi-agent review:
- Role hierarchy logic (Agent → Manager → Director → Executive)
- Multi-tenant isolation
- Commission calculations (waterfall/spread override structure)
- Compliance enforcement
- Permission models
- AI output authority

## System Integrity Rule
No agent may: introduce silent behavior changes, bypass logging, skip audit trails, hardcode permissions, override financial math, circumvent compliance flows, or install dependencies without Scout.
