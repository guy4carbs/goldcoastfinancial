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
| `/api/deals` | `routes/deals.ts` | Deal submission, leaderboard, stats |
| `/api/commissions` | `routes/commissions.ts` | Earnings, pipeline-stats, lead-source-roi, statements |
| `/api/commission-targets` | `routes/commission-targets.ts` | Per-agent commission tier targets |
| `/api/hierarchy-requests` | `routes/hierarchy-requests.ts` | Commission increase requests |
| `/api/email` | `routes/email.ts` | Per-agent email (IMAP/SMTP + Gmail OAuth) |
| `/api/calendar` | `routes/calendar.ts` | Per-agent calendar (Google OAuth + CalDAV) |
| `/api/calls` | `routes/calls.ts` | Telnyx voice, call history, recordings |
| `/api/member-cards` | `routes/member-cards.ts` | Digital member card CRUD |
| `/api/business-card` | `routes/business-card.ts` | Agent business card management |
| `/api/lead-distribution` | `routes/lead-distribution.ts` | Lead assignment & distribution |
| `/api/licenses` | `routes/licenses.ts` | Agent licensing by state |
| `/api/policies` | `routes/policies.ts` | Policy management |
| `/api/referrals` | `routes/referrals.ts` | Referral tracking |
| `/api/training-sessions` | `routes/training-sessions.ts` | Training management |
| `/api/sms` | `routes/sms.ts` | Telnyx SMS delivery |

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
- `/ws/avatar-council` — Avatar Council (AI debate system)

### AI Agent System

- **37 business agents** organized in tiers 0-10 (`server/agents/`)
- **32 governance agents** (tier 11-12) — the swarm defined below
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
- Gmail API (`server/gmail.ts`) — transactional email (company account)
- Google Calendar (`server/googleCalendar.ts`) — company calendar sync
- Google Sheets (`server/sheets.ts`) — lead export
- Telnyx SMS (`server/services/smsService.ts`) + Voice (`server/services/telnyxVoiceService.ts`)
- AWS S3 (`server/services/s3Service.ts`) — document storage
- Apple Push Notifications (`@parse/node-apn`)
- Sentry (`server/services/errorTracking.ts`) — error tracking

### Per-Agent Email Integration (`routes/email.ts`)

Agents connect their personal email (Gmail, Outlook, iCloud, Yahoo) via IMAP/SMTP with app passwords. No OAuth verification needed for production.
- **DB table:** `agent_email_connections` — stores provider, IMAP/SMTP credentials per agent
- **Connect flow:** Agent enters email + app password → server tests IMAP connection → saves credentials
- **Inbox reading:** `imapflow` library connects to agent's mailbox on each request
- **Sending:** `nodemailer` sends through agent's SMTP server
- **Auto-calendar-sync:** Connecting Gmail email auto-connects Google Calendar (same credentials)
- **Provider presets:** Gmail (`imap.gmail.com`), Outlook (`outlook.office365.com`), iCloud (`imap.mail.me.com`), Yahoo (`imap.mail.yahoo.com`)

### Per-Agent Calendar Integration (`routes/calendar.ts`)

Agents connect their personal calendar. Google uses OAuth (calendar scopes are NOT restricted — no CASA audit). iCloud/Outlook use CalDAV with app passwords.
- **DB table:** `agent_calendar_connections` — stores provider, CalDAV URL, credentials, or OAuth tokens
- **Google Calendar:** OAuth flow at `/api/calendar/connect/google` → callback stores tokens → `google.calendar.events.list()` with per-agent tokens
- **iCloud/Outlook:** CalDAV via `tsdav` library with app passwords
- **Events merge:** DB appointments + connected calendar events, deduped by googleEventId
- **Appointments table:** `appointments` — full schema with scheduling, status, Google Calendar sync

---

## Default Workflow

ALWAYS use the 32-agent governed swarm for ALL work on this project. No task should be executed without routing through the appropriate agent(s). When in doubt, start with Atlas.

### Parallel Execution Model

Agents are **truly parallel** — Atlas decomposes tasks and launches independent agents concurrently using the Agent tool. This is not sequential role-playing.

**How parallel execution works:**
1. Atlas decomposes task into subtasks with clear boundaries
2. Independent subtasks launch as **concurrent Agent tool calls** in a single message (e.g., Nova + Forge + Vector all run simultaneously)
3. Dependent subtasks wait for their blockers to complete before launching
4. Cross-domain handoffs use the HANDOFF format to pass context between agents
5. Gauge runs as the final gate after all parallel work converges

**Parallelism rules — 30-agent combinations:**

Can run in parallel (no shared state):
- Nova (UI) + Forge (backend) + Vector (schema) — independent parts of same feature
- Nova (web) + Harbor (mobile) — different platforms, same design system
- Beacon (marketing copy) + Nova (UI implementation) — copy + build simultaneously
- Beacon (strategy) + Radar (research) — marketing + data gathering
- Beacon (copy) + Reel (video) + Sketch (diagrams) — content creation pipeline
- Compass (PRD) + Radar (market research) — product planning + data
- Compass (roadmap) + Beacon (go-to-market) — product + marketing alignment
- Signal (performance test) + Gauge (functional test) — different test types
- Shield (privacy review) + Sentinel (security review) — privacy + security simultaneously
- Scribe (documentation) + Quill (editorial content) — different content types
- Pulse (support analysis) + Compass (product decisions) — support data + product planning
- Lens (browser testing) + Harbor (mobile testing) — web + mobile QA
- Vault (legal drafting) + Helix (regulatory research) — contracts + compliance
- Mint (cost analysis) + Prism (business analytics) — financial + business metrics
- Relay (automation) + Forge (business logic) — workflows + APIs
- Sketch (architecture diagrams) + Scribe (architecture docs) — visual + written docs
- Oracle (AI features) + Nova (AI UI) — backend AI + frontend AI interface
- Bastion (infra security) + Sentinel (app security) — perimeter + code simultaneously
- Bastion (WAF config) + Anchor (infrastructure) — security + infra changes
- Ignite (transition plan) + Forge (backend implementation) — planning + building
- Ignite (audit) + Conduit (integration spec) — mock audit + contract definition
- Ignite (audit) + Nova (frontend mock removal) — parallel audit + cleanup

Must run sequentially (dependency chains):
- Vector (schema) → Forge (API using schema) → Nova (UI calling API)
- Compass (PRD) → Atlas (decompose) → agents execute
- Any agent → Sentinel/Shield (security/privacy) → Gauge (QA) — gates are sequential
- Beacon (strategy) → Quill (create content) → Helix (compliance review) → publish
- Vault (draft contract) → Helix (regulatory review) → Atlas (approve)
- Harbor (build mobile) → Sentinel (security review) → Gauge (test) → App Store
- Signal (detect regression) → owning agent (fix) → Signal (verify) → Gauge (approve)

**Agent invocation:** Each agent is spawned via the Agent tool with its full agent definition loaded as context. The agent file at `~/.claude/agents/<name>.md` IS the agent — it contains the mission, authority, constraints, and domain knowledge needed to act autonomously.

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
| Lens | Browser Automation / Web Intelligence | Owns all browser-based automation, smoke testing, screenshots, and web scraping. Does not modify code. |
| Reel | Video / Motion Content | Owns all Remotion video compositions, motion graphics, and animated content. Uses remotion-best-practices skill. |
| Radar | Real-Time Intelligence / Research | Owns all web search, content extraction, and research via free tools (WebSearch, WebFetch, public APIs). Provides data, not decisions. |
| Sketch | Visual Diagrams / Architecture Viz | Owns all Excalidraw diagrams, C4 architecture visuals, flowcharts, ERDs, and concept maps. Renders and validates every diagram. |
| Beacon | Marketing / Growth / CRO | Owns all marketing strategy, copywriting, SEO, CRO, paid ads, email marketing, and growth engineering. Insurance content requires Helix review. |
| Signal | Performance / SRE | Owns web vitals, query optimization, uptime SLOs, incident response, load testing. Can escalate to block release via Gauge. |
| Compass | Product Management / Roadmap | Owns roadmap, feature prioritization, PRDs, customer feedback synthesis. Atlas can override for technical reasons. |
| Shield | Data Privacy / Governance | Owns GDPR/CCPA, data retention, consent, breach response. Can escalate to block via Sentinel. |
| Pulse | Customer Support / Success | Owns support workflows, knowledge base, SLA tracking, NPS/CSAT. Routes issues to domain agents. |
| Harbor | Mobile / Cross-Platform | Owns React Native/Expo, iOS (Swift/Xcode), Android (Kotlin). No PWA — native only. |
| Quill | Content / Editorial | Owns editorial calendar, blog, help center, content pipeline. Insurance content requires Helix review. |
| Vault | Legal / Contracts | Owns ToS, agent agreements, vendor contracts, NDAs. All agreements require Helix + Atlas approval. |
| Mint | Financial Operations / Budget | Owns cloud spend, budget forecasting, SaaS metrics, unit economics. Ledger owns commissions — Mint owns P&L. |
| Bastion | Infrastructure Defense / Perimeter | Owns DDoS, WAF, bot detection, network hardening, supply chain monitoring, incident response. Veto power on security-compromised deployments. |
| Ignite | Production Transition / Live Wiring | Owns mock-to-production transitions, API wiring, webhook setup, env var validation, go-live checklists. Nothing ships half-wired. |

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
| Browser Automation / Testing | Gauge (criteria) → Lens (execute + screenshot) → Gauge (verify) |
| Video Content | Atlas (brief) → Reel → Helix (compliance) → Axiom (simplicity) → Gauge (quality) |
| Research / Data Retrieval | Any agent (request) → Radar (search + cite) → (if financial: Ledger) → (if compliance: Helix) |
| Deep Research | Atlas (approve) → Radar (execute) → Scribe (document) → requesting agent |
| Diagram / Visualization | Any agent (request) → Sketch (create + render + validate) → requesting agent |
| Architecture Documentation | Atlas (define) → Sketch (visualize C4) → Scribe (document) → Gauge (review) |
| Marketing Content | Beacon (strategy + copy) → Helix (compliance) → Nova (implement UI) → Gauge (verify) |
| SEO Changes | Beacon (audit + plan) → Atlas (approve architecture) → Nova (frontend) + Forge (backend) → Gauge |
| Growth Experiments | Beacon (design) → Gauge (statistical rigor) → Nova + Forge (implement) → Prism (measure) |
| Performance Regression | Signal (detect) → Forge/Nova/Anchor (fix) → Signal (verify) → Gauge |
| New Feature Roadmap | Compass (prioritize + PRD) → Atlas (decompose) → swarm executes |
| User Data Feature | Shield (privacy review) → Sentinel (security) → Helix (regulatory) → Atlas |
| Support Escalation | Pulse → Forge (bugs) / Nova (UI) / Helix (compliance) / Ledger (financial) |
| Mobile Feature | Harbor → Nova (design system) → Sentinel (mobile security) → Gauge → App Store |
| Content Publication | Beacon (strategy) → Quill (create) → Helix (compliance) → publish |
| Contract / Legal Change | Vault (draft) → Helix (regulatory) → Atlas (approve) |
| Budget / Spend Change | Mint (monitor) → Atlas (decide) → Anchor (infra action) |
| Active Attack / DDoS | Bastion (detect + respond) → Anchor (infra) + Sentinel (app security) + Shield (data exposure) → Atlas (comms) |
| WAF / Rate Limit Change | Bastion (configure) → Sentinel (review) → Gauge (verify no false positives) |
| Supply Chain CVE | Bastion (detect) → Scout (patch) → Sentinel (verify) → Gauge (test) |
| Pentest Findings | Bastion (scope) → Sentinel (remediate) → Gauge (verify) → Bastion (close) |
| Infrastructure Hardening | Bastion (spec) → Anchor (implement) → Sentinel (verify) → Gauge (test) |
| Mock→Production Transition | Ignite (audit + plan) → Forge (backend) + Nova (frontend) → Sentinel (security) → Gauge (test) → Signal (perf) |
| New Webhook Wiring | Ignite (spec) → Conduit (contract) → Forge (implement) → Bastion (WAF) → Gauge (test) |
| Data Migration | Ignite (plan) → Vector (schema) → Forge (migration) → Shield (PII review) → Gauge (verify) |

### Veto Authorities
- **Sentinel** — blocks release for application security risks
- **Bastion** — blocks release for infrastructure security risks; emergency authority during active attacks
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
- Lens is the only agent allowed to drive browser automation. Lens does not modify code — it observes, tests, and reports.
- Reel is the only agent allowed to create Remotion video compositions. Marketing videos require Helix compliance review.
- Radar is the only agent allowed to perform external web search and data retrieval for research. Radar provides data with citations — Ledger interprets financial data, Helix interprets compliance data. Browser scraping goes through Lens.
- Sketch is the only agent allowed to create diagrams (Excalidraw, C4, Mermaid). Every diagram must be rendered to PNG and visually validated before delivery.
- Beacon is the only agent allowed to define marketing strategy, write marketing copy, and design growth experiments. Insurance marketing content requires Helix compliance review. Financial claims require Ledger verification.
- Signal is the only agent allowed to define SLOs and performance thresholds. Can escalate performance regressions to block release via Gauge.
- Compass is the only agent allowed to prioritize features and own the product roadmap. Atlas can override for technical architecture reasons.
- Shield is the only agent allowed to make data privacy determinations (GDPR/CCPA). Can escalate to block via Sentinel for privacy violations.
- Pulse is the only agent allowed to manage support operations and customer satisfaction metrics. Routes domain issues to owning agents.
- Harbor is the only agent allowed to write mobile code (React Native, iOS/Xcode, Android). No PWA — native apps only.
- Quill is the only agent allowed to manage the editorial calendar and content pipeline. Insurance content requires Helix compliance review.
- Vault is the only agent allowed to draft legal documents and contracts. All agreements require Helix regulatory review + Atlas business approval.
- Mint is the only agent allowed to track business finances and budget. Ledger owns commissions — Mint owns business P&L and infrastructure costs.
- Bastion is the only agent allowed to configure infrastructure-level security (DDoS, WAF, rate limits, network hardening). Has veto power on security-compromised deployments and emergency authority during active attacks. Sentinel owns app security — Bastion owns perimeter security.
- Ignite is the only agent allowed to manage mock-to-production transitions. No feature ships with demo data, stub APIs, or missing env vars. All payment transitions require Ledger review. All PII transitions require Shield review.

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
