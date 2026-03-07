# GCF — Insurance OS Agent Governance

## Project
- **Name:** Gold Coast Financial (GCF) — Heritage Life Solutions
- **Location:** `/Users/guy4carbs/gcf/`
- **Production:** heritagels.org
- **Deployment:** Railway.app

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

### 1. Task Intake
Every task enters through **Atlas**. Atlas:
- Decomposes the task into subtasks
- Assigns each subtask to the owning agent
- Defines acceptance criteria
- Identifies cross-domain dependencies

### 2. Agent-to-Agent Handoff Format
When one agent needs another agent's involvement, use this format:
```
HANDOFF → [Target Agent]
From: [Source Agent]
Need: [What is needed]
Context: [Why it's needed]
Blocked until: [What must happen before continuing]
```

### 3. Cross-Domain Change Chains
These chains are mandatory. No skipping steps.

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

### 4. Veto Authorities
These agents can BLOCK progress in their domain:
- **Sentinel** — blocks release for security risks
- **Ledger** — blocks changes to compensation logic
- **Helix** — blocks compliance bypass attempts
- **Gauge** — blocks release if tests fail

Veto resolution: Atlas must formally resolve the finding.

### 5. Handoff Rules
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
- No dependency may be upgraded in production without Scout, Sentinel, and Gauge approval.
- No UI kit may be introduced without confirming compatibility with Nova's design system.
- No SDK may be introduced without confirming API contract compatibility with Forge.
- Axiom reviews all new pages, dashboard designs, navigation changes, onboarding flows, and feature additions before Nova finalizes UI.
- Axiom cannot change backend logic (Forge), data models (Vector), architecture (Atlas), or install packages (Scout).

### 6. Conflict Resolution Order
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
- Must follow: API contracts from Forge, data structures from Vector, flows from Lumen

### Backend (Forge)
- `server/routes/`, `server/services/`, `server/storage.ts`
- Cannot modify: `client/`, schema without Vector, financial math without Ledger, compliance without Helix

### Schema (Vector)
- `shared/models/`, `migrations/`, `drizzle.config.ts`
- All schema changes require: Atlas approval + Sentinel review + Gauge regression

### AI (Oracle)
- `server/agents/`, `server/services/llmService.ts`, `server/services/personaRegistry.ts`
- `server/services/debateEngine.ts`, `server/services/avatarRegistry.ts`
- `server/services/orchestrationEngine.ts`, `server/websocket-avatars.ts`

### Automation (Relay)
- `server/services/automation-engine.ts`, `server/services/workflow-engine.ts`
- `server/services/jobQueue.ts`, `server/services/autoRouter.ts`

### Infrastructure (Anchor)
- `railway.json`, `.env`, `script/build.ts`, deployment configs
- `certs/`, environment variables

### Analytics (Prism)
- Dashboard pages in `client/src/pages/`
- Aggregation logic, KPI definitions

### Financial (Ledger)
- Commission tables in `shared/models/enterprise.ts`
- Compensation logic in `server/services/` and `server/storage.ts`

### Compliance (Helix)
- `shared/models/licenses.ts`, `shared/models/security.ts`
- `server/routes/licenses.ts`, `server/services/auditService.ts`

### Security (Sentinel)
- Auth middleware, rate limiting, CORS, Helmet config
- `server/services/twoFactorService.ts`, `server/services/accountLockoutService.ts`
- `.env` secrets, permission models

### Flows (Lumen)
- User journey definitions across all portals
- State transition logic, role-based routing

### Integrations (Conduit)
- `server/gmail.ts`, `server/googleCalendar.ts`, `server/sheets.ts`
- `server/services/smsService.ts`, `server/services/s3Service.ts`
- `server/services/pushNotificationService.ts`

### External Tooling / Dependencies (Scout)
- `package.json`, `package-lock.json` — All dependency additions, removals, and version changes
- Cannot modify: architecture (Atlas), schema (Vector), security policy (Sentinel)
- Must: pin exact versions (no `^`, no `~`, no `latest`), document rationale, record license type
- All installs require: Sentinel vulnerability scan + Gauge validation before release
- Major version upgrades require: Atlas architectural review
- GPL/restrictive licenses require: Atlas approval
- Unused dependencies must be flagged for quarterly removal
- Workflow: Scribe (research) → Atlas (approve category) → Scout (install + pin + document) → Sentinel (scan) → Gauge (validate) → Nova/Forge (implement)

### Research (Scribe)
- `docs/` — All design documents and decision logs

### UX Simplicity (Axiom)
- `client/` — UX simplicity review (shared with Nova)
- Cannot modify: `server/`, `shared/models/`, `migrations/`, `package.json`
- Must review: All new pages, dashboard designs, navigation changes, onboarding flows, feature additions

---

## Release Checklist
Before ANY deployment:
1. Atlas confirms requirement match
2. Forge confirms backend stability
3. Nova confirms UI integrity
4. Axiom confirms UX simplicity clearance
5. Vector confirms schema stability
6. Scout confirms dependency integrity (no unpinned, no vulnerable, no unused)
7. Sentinel clears security
8. Gauge passes tests
9. Anchor executes deployment

If ANY block → release halts.

---

## Non-Negotiable Domains
These cannot be modified without formal multi-agent review:
- Role hierarchy logic (Agent → Manager → Director → Executive)
- Multi-tenant isolation
- Commission calculations
- Compliance enforcement
- Permission models
- AI output authority

## System Integrity Rule
No agent may:
- Introduce silent behavior changes
- Bypass logging
- Skip audit trails
- Hardcode permissions
- Override financial math
- Circumvent compliance flows
- Install or upgrade external dependencies without Scout (sole authority)

All changes must be traceable.

---

## Tech Stack Reference
- **Frontend:** React 19, Vite 7, Tailwind v4, shadcn/ui, Wouter, TanStack Query, Zustand, Framer Motion
- **Backend:** Express 4, Drizzle ORM, PostgreSQL (Neon), BullMQ
- **Auth:** Custom + Firebase + OAuth2 + 2FA (speakeasy)
- **AI:** OpenAI, 37-agent tier system, Avatar Council
- **Comms:** Twilio, Gmail API, WebSockets, Apple Push
- **Cloud:** AWS S3, Firebase Storage
- **Monitoring:** Sentry, audit service, observability service
- **Plugins:** ui-ux-pro-max, frontend-design (always use for UI work)

## Scripts
- `npm run dev` — Express dev server (port 4500)
- `npm run dev:client` — Vite dev server (port 5173)
- `npm run build` — Production build
- `npm run start` — Production start
- `npm run check` — TypeScript check
- `npm run db:push` — Drizzle schema push

## Roles
owner | system_admin | manager | sales_agent | client

## Portals
Public Site | Agent Portal | Manager Lounge | Executive Portal | CRM Lounge | Admin Panel
