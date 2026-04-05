# Heritage Life Solutions

**Enterprise Insurance Management Platform**

A full-stack insurance agency platform powering agent recruitment, lead management, policy placement, commission tracking, and client servicing for Heritage Life Solutions.

**Production:** [heritagels.org](https://heritagels.org)
**Parent Company:** Gold Coast Financial Partners LLC

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS v4, shadcn/ui (Radix), Wouter, TanStack Query v5, Zustand, Framer Motion |
| **Backend** | Node.js, Express 4, TypeScript (ESM), Drizzle ORM |
| **Database** | PostgreSQL (Neon serverless) |
| **Auth** | Custom + Firebase Auth + OAuth2 (Google/Apple) + TOTP 2FA |
| **AI** | OpenAI, 37-agent tier system, Avatar Council debate engine |
| **Real-time** | WebSocket (4 servers: team chat, client chat, events, AI council) |
| **Communications** | Telnyx (SMS/voice), Gmail API, Apple Push Notifications |
| **Storage** | AWS S3 (documents), Firebase Storage (CDN) |
| **Deployment** | Railway.app (NIXPACKS) |
| **Monitoring** | Sentry |

---

## Architecture

```
client/         React 19 frontend (266 pages, 339 components, 100+ routes)
server/         Express backend (41 route modules, 24 services, 37 AI agents)
shared/         Drizzle schemas + Zod validators (20 models)
migrations/     Drizzle Kit database migrations
docs/           Design documents and architecture blueprints
```

### Request Flow

```
Client → Express (Helmet, CORS, Rate Limiting)
       → attachUser middleware (session)
       → requireAuth / requireRole / requirePermission
       → Route handler
       → Storage layer (Drizzle ORM → Neon PostgreSQL)
```

### WebSocket Channels

| Path | Purpose |
|------|---------|
| `/ws/chat` | Agent-to-agent team messaging |
| `/ws/client-chat` | Agent-to-client messaging |
| `/ws/gcf` | Real-time events with RBAC channels |
| `/ws/avatar-council` | AI Avatar Council debate system |

---

## Portals

| Portal | Users | Key Features |
|--------|-------|-------------|
| **Public Site** | Everyone | Product pages, quote calculator, blog, careers, contact |
| **Agent Portal** | Licensed agents | Dashboard, leads, chat, training, scripts, calendar, onboarding |
| **Manager Lounge** | Managers | Team management, pipeline, performance, coaching, approvals |
| **Executive Portal** | Directors/Executives | BI dashboard, capital allocation, partnerships |
| **CRM Lounge** | Agents/Managers | Lead management, pipeline Kanban, contact database |
| **Client Portal** | Policy holders | Dashboard, policies, documents, billing, claims |
| **Admin Panel** | System admins | Content, products, analytics, settings |
| **AI Lounge** | Internal | Avatar Council, debate engine, agent orchestration |

---

## Insurance Products

- Term Life Insurance
- Whole Life Insurance
- Indexed Universal Life (IUL)
- Fixed & Indexed Annuities
- Final Expense Insurance
- Mortgage Protection Insurance

---

## Roles & Permissions

| Role | Access Level |
|------|-------------|
| `owner` | Full system access |
| `system_admin` | Admin panel + all portals |
| `manager` | Manager lounge + agent oversight |
| `sales_agent` | Agent portal + CRM |
| `marketing_staff` | Marketing tools |
| `client` | Client portal only |
| `investor` | Executive dashboards |

RBAC enforced via `requireRole()` and `requirePermission()` middleware with granular permissions (`leads:view:own`, `leads:view:all`, etc.).

---

## AI Agent System

**37 business agents** organized in tiers 0-10, plus a **31-agent governance swarm** for development:

- Agents bootstrap via `bootstrapAgentSystem()` in `server/agents/index.ts`
- Inter-agent communication via EventBus
- Avatar Council with multi-persona debate engine
- Routes exposed via `createAgentRoutes(agentRegistry)`

---

## Key Integrations

| Service | Purpose |
|---------|---------|
| **Telnyx** | SMS delivery, voice calls (WebRTC), call recordings |
| **Gmail API** | Transactional email (company) + per-agent personal email (IMAP/SMTP) |
| **Google Calendar** | Per-agent calendar sync (OAuth + CalDAV) |
| **Google Sheets** | Lead export |
| **AWS S3** | Document storage with signed URLs |
| **Firebase** | Auth (admin), Storage (CDN) |
| **OpenAI** | LLM service for 37-agent system |
| **Sentry** | Error tracking and monitoring |
| **Apple Push** | iOS push notifications |

---

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL (or Neon account)
- Environment variables (see `.env.example`)

### Installation

```bash
git clone git@github.com:guy4carbs/goldcoastfinancial.git
cd goldcoastfinancial
git checkout heritage-app
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `SESSION_SECRET` — Secure session secret
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth2
- `VITE_FIREBASE_*` — Firebase configuration
- See `.env.example` for full list

### Development

```bash
npm run dev          # Express + Vite (port 4500)
npm run dev:client   # Vite only (port 5173)
npm run check        # TypeScript type checking
npm run db:push      # Push schema to database
```

### Production Build

```bash
npm run build        # esbuild server → dist/index.cjs + Vite client → dist/public/
npm run start        # Start production server
```

---

## Deployment

Deployed on **Railway.app** with NIXPACKS builder:

- **Health check:** `/api/health`
- **Restart policy:** ON_FAILURE (max 10)
- **Build:** `npm run build`
- **Start:** `npm run start`

---

## Project Structure

```
client/
├── src/
│   ├── pages/          266 page components
│   ├── components/     339 React components (UI, Agent, Admin, CRM, Layout)
│   ├── hooks/          Custom React hooks
│   ├── lib/            Utilities, design system, query client
│   └── App.tsx         Root routing (1,173 lines)

server/
├── routes.ts           Monolith route registration (3,567 lines)
├── routes/             41 modular sub-routers
├── services/           24 service modules
├── agents/             37 AI agents (tiers 0-10)
├── middleware/         Auth, RBAC, rate limiting
├── storage.ts          Data access layer (3,115 lines)
├── db.ts               Drizzle ORM + pool
├── websocket/          4 WebSocket servers
└── gmail.ts            Gmail API integration

shared/
├── schema.ts           Schema re-exports
└── models/             20 Drizzle model files (40+ tables)
```

---

## Design System

**Typography:** Playfair Display (headings), Montserrat (body)
**Colors:** Dark red, gold, black with dark/light mode
**Grid:** 8-point modular system
**Radius:** Consistent corner radius scale (input=12, button=16, card=24, hero=32)
**Motion:** Spring physics via Framer Motion

Defined in `client/src/lib/heritageDesignSystem.ts`.

---

## Commission System

Heritage Life uses a **waterfall/spread override structure**:

- Each level earns the spread between their contract level and the level directly below
- Overrides do not skip levels
- Example: Owner (120%) → Manager (90%) → Agent (80%) on $10K premium:
  - Agent earns 80% ($8K)
  - Manager earns 10% override ($1K)
  - Owner earns 30% override ($3K)

---

## License

MIT

---

**Gold Coast Financial Partners LLC**
