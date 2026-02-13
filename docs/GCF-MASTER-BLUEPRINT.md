# GCF MASTER BLUEPRINT
## Gold Coast Financial / Heritage Life Solutions — Enterprise Platform Architecture

**Version**: 1.0.0 | **Date**: February 10, 2026 | **Author**: JARVIS for Gaetano Carbonara
**Classification**: Internal — Confidential Engineering Document

---

```
╔══════════════════════════════════════════════════════════════════════════╗
║                    GCF AUTONOMOUS INSURANCE OS                         ║
║         8 Lounges · 37 AI Agents · 82+ Pages · 1 EventBus             ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐                 ║
║   │🧠 AI    │  │👥 Agent │  │📊 Mgr   │  │🏢 Exec  │                 ║
║   │ Lounge  │  │ Lounge  │  │ Lounge  │  │ Lounge  │                 ║
║   └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘                 ║
║        │            │            │            │                        ║
║   ┌────┴────────────┴────────────┴────────────┴────┐                  ║
║   │          ████ EVENT BUS ████                    │                  ║
║   │    Central Nervous System · 37 AI Agents        │                  ║
║   │    MemoryGraph · KnowledgeBase · SecurityLayer  │                  ║
║   └────┬────────────┬────────────┬────────────┬────┘                  ║
║        │            │            │            │                        ║
║   ┌────┴────┐  ┌────┴────┐  ┌────┴────┐  ┌────┴────┐                 ║
║   │💼 CRM  │  │📣 Mktg  │  │👤Client │  │⚙️ Admin │                 ║
║   │ Lounge  │  │ Lounge  │  │ Portal  │  │ Lounge  │                 ║
║   └─────────┘  └─────────┘  └─────────┘  └─────────┘                 ║
║                                                                        ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

# TABLE OF CONTENTS

1. [Vision & Architecture Overview](#1-vision--architecture-overview)
2. [The 8 Lounges — Deep Specifications](#2-the-8-lounges--deep-specifications)
3. [Database Expansion](#3-database-expansion)
4. [New API Endpoints](#4-new-api-endpoints)
5. [Role-Based Access Control (RBAC)](#5-role-based-access-control-rbac)
6. [Real-Time Infrastructure](#6-real-time-infrastructure)
7. [Shared Components to Build](#7-shared-components-to-build)
8. [The 37-Agent Wiring Plan](#8-the-37-agent-wiring-plan)
9. [External Integrations Roadmap](#9-external-integrations-roadmap)
10. [Phased Build Roadmap](#10-phased-build-roadmap)
11. [The Complete Loop — Detailed Flow](#11-the-complete-loop--detailed-flow)
12. [Future Expansion Possibilities](#12-future-expansion-possibilities)
13. [Metrics & KPIs](#13-metrics--kpis)

---

# 1. VISION & ARCHITECTURE OVERVIEW

## 1.1 The Concept

GCF is not a CRM with a website bolted on. It is an **autonomous enterprise operating system** for life insurance distribution. Every human interaction — from a stranger landing on the website to a client referring their neighbor 10 years later — is captured, analyzed, routed, and optimized by a network of 37 specialized AI agents communicating over a single EventBus.

The platform is organized into **8 Lounges** — role-specific workspaces that present the same underlying data through different lenses:

| Lounge | Audience | Core Purpose |
|--------|----------|-------------|
| 🧠 AI Agent Lounge | Owner/Admin | Monitor, configure, and debug all 37 AI agents |
| 👥 Agent Lounge | Sales Agents | Sell policies — leads, calls, scripts, training |
| 📊 Manager Lounge | Agency Managers | Oversee team performance, pipelines, coaching |
| 🏢 Executive Lounge | Owner/Investors | Revenue, forecasts, strategic decisions |
| 💼 CRM Lounge | Sales + Managers | Deep lead/client management, pipeline ops |
| 📣 Marketing Lounge | Marketing Staff | Content, campaigns, social, reputation |
| 👤 Client Portal | Policyholders | View policies, documents, billing, support |
| ⚙️ Admin Lounge | System Admins | Site settings, user management, system health |

## 1.2 The EventBus — Central Nervous System

```
                        ┌─────────────────────┐
                        │    OrchestratorAgent │  ← Tier 0: Sees EVERYTHING
                        │   (wildcard listener)│
                        └──────────┬──────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │         EVENT BUS            │
                    │                              │
                    │  ┌─────────────────────────┐ │
                    │  │ Subscriptions Registry   │ │
                    │  │ Audit Log (every event)  │ │
                    │  │ Dead Letter Queue        │ │
                    │  │ Deduplication Cache       │ │
                    │  │ SLA Enforcement Timer     │ │
                    │  └─────────────────────────┘ │
                    │                              │
                    │  emit(event) → fan-out to    │
                    │  all subscribed agents       │
                    └──────────────┬──────────────┘
                                   │
        ┌──────────┬──────────┬────┴────┬──────────┬──────────┐
        │ Tier 1-4 │ Tier 5   │ Tier 6  │ Tier 7-8 │ Tier 9-10│
        │ Acquire  │ Comply   │ Money   │ Serve    │ Optimize │
        │ & Sell   │ & Write  │ & Track │ & Retain │ & Secure │
        └──────────┴──────────┴─────────┴──────────┴──────────┘
```

Every meaningful action in the system produces an event. Events are typed (36+ types), timestamped, and include a payload with context. Agents subscribe to the events they care about, process them, and emit new events. The Orchestrator watches everything, enforces SLAs (e.g., "a LEAD_SCORED event must follow RAW_LEAD_CREATED within 30 seconds"), and routes stragglers.

**Key properties:**
- **Singleton pattern**: One EventBus instance across the entire server process
- **Audit log**: Every event stored with timestamp, source agent, payload hash
- **Dead letter queue**: Events that no agent handled within SLA window
- **Deduplication**: Events with matching payload hashes within 5s are dropped
- **Global kill switch**: SecurityLayer can freeze the entire bus

## 1.3 The Closed-Loop Lifecycle

```
    ┌──────────────────────────────────────────────────────────────┐
    │                                                              │
    ▼                                                              │
┌────────┐    ┌──────────┐    ┌─────────┐    ┌─────────┐    ┌─────┴───┐
│ LEAD   │───▶│ NURTURE  │───▶│  SELL   │───▶│ CLIENT  │───▶│ REFERRAL│
│Discovery│   │& Outreach│    │& Close  │    │ Service │    │& Retain │
└────────┘    └──────────┘    └─────────┘    └─────────┘    └─────────┘
  Tier 1        Tier 2-3       Tier 4-5       Tier 6-7        Tier 7-8
  
  Agents:       Agents:        Agents:        Agents:         Agents:
  LeadDiscovery OutreachOrch   AiSales        Billing         Retention
  DataEnrich    EmailOutreach  HumanAssist    Commission      ClientPortal
  LeadIntake    SmsMessaging   CallCoaching   CustomerSupport Reputation
  LeadScoring   Dialer         Compliance     Claims          ContentGen
                SocialDm       AppCompletion  PolicyRecommend SocialPosting
                Inbound        Underwriting
                Appointment
                ConvoMemory
```

The loop is **self-reinforcing**: happy clients generate referrals (RetentionAgent tracks NPS, triggers referral campaigns), which become new leads (LeadIntakeAgent normalizes them), which flow through the same pipeline. Marketing content (ContentGenerationAgent + SocialPostingAgent) drives organic traffic to the public site, generating quote requests that become RAW_LEAD_CREATED events.

## 1.4 Why This Architecture is Future-Proof

1. **Agent-based**: New capabilities = new agent. No refactoring. Just subscribe to events and emit new ones.
2. **Lounge-based UI**: New roles = new lounge. Same API, different view.
3. **EventBus decoupling**: Agents don't know about each other. They know about events. Swap, upgrade, or replace any agent without breaking others.
4. **Database-as-truth, Agents-as-intelligence**: The PostgreSQL schema is the source of truth. Agents read/write through the DatabaseBridge. If all agents crash, the data survives. If the DB is restored, agents resume.
5. **Beyond insurance**: The architecture (lead → nurture → sell → serve → retain) applies to any service business. Swap KnowledgeBase content and you have a real estate platform, a financial advisory platform, or a SaaS sales platform.

---

# 2. THE 8 LOUNGES — DEEP SPECIFICATIONS

## 2.1 🧠 AI AGENT LOUNGE

**Purpose**: The nerve center. Only accessible to Owner and SystemAdmin roles (with 2FA). Monitor all 37 agents in real-time, view event flows, debug issues, configure agent parameters, and observe the MemoryGraph.

**Route prefix**: `/ai/*`
**Required role**: `owner` or `system_admin`
**Auth**: Session + 2FA TOTP verification

---

### Page: AI Dashboard
- **Route**: `/ai/dashboard`
- **Purpose**: Real-time overview of all 37 agents — status, event throughput, error rates, and system health at a glance.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Top bar**: System health indicator (green/yellow/red), EventBus throughput counter (events/sec), global kill switch toggle
  - **Left column (40%)**: Agent grid — 37 cards in a 4-column grid, each showing agent name, status (active/idle/error), events processed (last hour), last event timestamp. Color-coded by tier.
  - **Right column (60%)**: Live event stream — scrolling feed of events with type, source agent, target agent(s), timestamp, payload preview. Filterable by event type and agent.
  - **Bottom strip**: MemoryGraph summary — node counts by type (leads, clients, policies, etc.), edge count, graph size in memory
- **Components needed**:
  - **Existing**: None directly reusable
  - **New**: `AgentStatusCard`, `LiveEventStream`, `SystemHealthBar`, `MemoryGraphSummary`, `GlobalKillSwitch`, `EventThroughputGauge`
- **API endpoints**:
  - `GET /api/ai/agents` → `{ agents: [{ id, name, tier, status, eventsProcessed, lastEventAt, errorCount }] }`
  - `GET /api/ai/events/stream` → SSE stream of real-time events
  - `GET /api/ai/system/health` → `{ eventBus: { throughput, queueDepth, deadLetterCount }, memoryGraph: { nodeCount, edgeCount, sizeBytes }, uptime }`
  - `POST /api/ai/system/kill-switch` → `{ enabled: boolean }` — toggles global kill switch
- **Database tables**: `eventBusAuditLog` (new), `agentStatus` (new)
- **AI agents**: OrchestratorAgent (provides routing data), all 37 agents report status
- **Real-time**: WebSocket channel `ai:events` (live event stream), `ai:agents:status` (agent status changes)
- **User interactions**: Filter event stream by type/agent, click agent card to drill into detail, toggle kill switch (with confirmation modal), pause/resume event stream display
- **Mobile**: Not prioritized — this is a desktop monitoring dashboard. Tablet-friendly at minimum.

---

### Page: Agent Detail
- **Route**: `/ai/agents/:agentId`
- **Purpose**: Deep-dive into a single agent — its configuration, event subscriptions, processing history, error log, and performance metrics.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Header**: Agent name, tier badge, status indicator, uptime counter
  - **Tab 1 — Overview**: Event subscriptions (which events it listens to), events it emits, current processing queue depth, avg processing time
  - **Tab 2 — Event Log**: Paginated table of all events this agent processed, with timestamp, event type, processing duration, result (success/error/skipped)
  - **Tab 3 — Configuration**: JSON editor for agent parameters (e.g., SLA thresholds, retry counts, prompt templates for LLM-powered agents)
  - **Tab 4 — Errors**: Error log with stack traces, grouped by error type, with retry/dismiss actions
  - **Tab 5 — Connections**: Visual graph showing this agent's relationships (what feeds it, what it feeds) using a simple directed graph
- **Components needed**:
  - **Existing**: None
  - **New**: `AgentDetailHeader`, `EventLogTable`, `AgentConfigEditor` (JSON editor with validation), `AgentErrorLog`, `AgentConnectionGraph`
- **API endpoints**:
  - `GET /api/ai/agents/:id` → full agent detail object
  - `GET /api/ai/agents/:id/events?page=1&limit=50` → paginated event history
  - `PUT /api/ai/agents/:id/config` → update agent configuration
  - `GET /api/ai/agents/:id/errors?page=1&limit=50` → paginated error log
  - `POST /api/ai/agents/:id/restart` → restart agent
  - `POST /api/ai/agents/:id/pause` → pause agent (stops processing new events)
- **Database tables**: `eventBusAuditLog`, `agentConfigurations` (new), `agentErrors` (new)
- **AI agents**: The specific agent being viewed
- **Real-time**: `ai:agent:{agentId}:events` — live events for this agent
- **User interactions**: Edit config and save, restart/pause agent, dismiss errors, filter event log
- **Mobile**: Not prioritized

---

### Page: EventBus Monitor
- **Route**: `/ai/eventbus`
- **Purpose**: Visualize event flow across all agents — a live directed graph showing events traveling between agents, with throughput heat mapping.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Main canvas (80%)**: Animated directed graph. Nodes = agents (positioned by tier, left-to-right). Edges = event flows, animated with particles showing direction. Edge thickness = throughput. Node color = status.
  - **Right sidebar (20%)**: Event type filter checkboxes, time range selector, throughput stats table
  - **Bottom drawer**: Dead letter queue — events that weren't handled, with retry/dismiss actions
- **Components needed**:
  - **New**: `EventFlowGraph` (D3.js or react-flow), `DeadLetterQueue`, `EventTypeFilter`, `ThroughputHeatmap`
- **API endpoints**:
  - `GET /api/ai/eventbus/topology` → `{ nodes: [agents], edges: [{ from, to, eventType, count }] }`
  - `GET /api/ai/eventbus/dead-letter?page=1&limit=50` → dead letter queue
  - `POST /api/ai/eventbus/dead-letter/:id/retry` → retry a dead letter event
  - `POST /api/ai/eventbus/dead-letter/:id/dismiss` → dismiss
- **Database tables**: `eventBusAuditLog`, `deadLetterQueue` (new)
- **AI agents**: OrchestratorAgent
- **Real-time**: `ai:eventbus:flow` — aggregated flow data (1s intervals)
- **User interactions**: Click node to go to agent detail, click edge to see events of that type, retry/dismiss dead letters, zoom/pan graph, filter by event type
- **Mobile**: Desktop only

---

### Page: MemoryGraph Explorer
- **Route**: `/ai/memory-graph`
- **Purpose**: Browse and query the in-memory MemoryGraph — the relationship web connecting leads, clients, policies, conversations, and all other entities.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Search bar**: Query by node type, ID, or keyword
  - **Main canvas**: Interactive graph visualization. Click a node to expand its edges. Color-coded by NodeType.
  - **Right panel**: Selected node details — all properties, connected edges, timestamps
  - **Bottom**: Query console — enter MemoryGraph queries (e.g., "all leads connected to policy P-1234")
- **Components needed**:
  - **New**: `MemoryGraphCanvas` (force-directed graph, D3 or react-force-graph), `NodeDetailPanel`, `GraphQueryConsole`
- **API endpoints**:
  - `GET /api/ai/memory-graph/search?type=LEAD&q=smith` → matching nodes
  - `GET /api/ai/memory-graph/node/:id` → node + edges
  - `GET /api/ai/memory-graph/stats` → `{ nodesByType: {}, edgesByType: {}, totalNodes, totalEdges }`
  - `POST /api/ai/memory-graph/query` → `{ query: string }` → results
- **Database tables**: In-memory (MemoryGraph), no persistent DB table — but backed by reconstructing from DB on restart
- **AI agents**: ConversationMemoryAgent maintains this graph
- **Real-time**: `ai:memory:updates` — node/edge additions in real-time
- **User interactions**: Search nodes, click to expand, run queries, export subgraphs as JSON
- **Mobile**: Desktop only

---

### Page: Knowledge Base Manager
- **Route**: `/ai/knowledge-base`
- **Purpose**: View and edit the KnowledgeBase that agents reference — carrier info, product details, objection responses, compliance rules.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Left sidebar**: Category tree — Carriers, Products, Objections, Compliance Rules, Scripts
  - **Main content**: Editor for selected item. Rich text for objection responses, structured forms for carrier/product data, code editor for compliance rules.
  - **Top toolbar**: Search, add new item, import/export
- **Components needed**:
  - **Existing**: Rich text editor from blog content editor
  - **New**: `KnowledgeCategoryTree`, `KnowledgeItemEditor`, `ComplianceRuleEditor`
- **API endpoints**:
  - `GET /api/ai/knowledge-base/categories` → category tree
  - `GET /api/ai/knowledge-base/items?category=carriers` → items in category
  - `PUT /api/ai/knowledge-base/items/:id` → update item
  - `POST /api/ai/knowledge-base/items` → create item
  - `DELETE /api/ai/knowledge-base/items/:id` → delete
- **Database tables**: `avatarKnowledgeBases`, `knowledgeDocuments`, `knowledgeChunks` (existing)
- **AI agents**: All agents reference KnowledgeBase; ComplianceAgent for rules
- **Real-time**: Not needed — static reference data
- **User interactions**: CRUD on knowledge items, search, import CSV of carrier products, export as JSON
- **Mobile**: Not prioritized

---

### Page: Analytics Ledger
- **Route**: `/ai/analytics`
- **Purpose**: View the AnalyticsLedger — raw metrics tracked by agents: revenue, funnel conversion, outreach effectiveness, agent performance scores.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Tab 1 — Revenue**: Revenue chart (daily/weekly/monthly), premium sold, commissions earned, forecast vs actual
  - **Tab 2 — Funnel**: Conversion rates at each stage (lead → contact → quote → appointment → application → policy), with trends
  - **Tab 3 — Outreach**: Emails sent/opened/replied, SMS sent/replied, calls made/connected, social DMs sent/replied
  - **Tab 4 — Agent Performance**: Per-agent scores (AI agents), processing times, error rates
- **Components needed**:
  - **New**: `RevenueChart`, `FunnelVisualization`, `OutreachMetricsGrid`, `AgentPerformanceTable`
  - **Library**: recharts or chart.js for visualizations
- **API endpoints**:
  - `GET /api/ai/analytics/revenue?period=30d` → revenue data
  - `GET /api/ai/analytics/funnel?period=30d` → funnel metrics
  - `GET /api/ai/analytics/outreach?period=30d` → outreach metrics
  - `GET /api/ai/analytics/agent-performance` → agent scores
- **Database tables**: `analyticsSnapshots` (new — periodic snapshots of AnalyticsLedger)
- **AI agents**: RealTimeAnalyticsAgent, AgentPerformanceAgent, RevenueForecastAgent
- **Real-time**: `ai:analytics:update` — metric updates
- **User interactions**: Change time period, drill down on any metric, export CSV
- **Mobile**: Not prioritized

---

### Page: Security Console
- **Route**: `/ai/security`
- **Purpose**: View SecurityLayer logs — permission checks, rate limiting events, audit trail, blocked actions, kill switch history.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Main**: Scrolling audit log table with filters (by agent, by action type, by result: allowed/blocked)
  - **Sidebar**: Rate limiting status per agent, permission matrix view
  - **Top cards**: Total events today, blocked events, rate-limited events, security incidents
- **Components needed**:
  - **New**: `SecurityAuditLog`, `RateLimitStatus`, `PermissionMatrixView`, `SecurityStatCards`
- **API endpoints**:
  - `GET /api/ai/security/audit-log?page=1&limit=100` → paginated audit entries
  - `GET /api/ai/security/rate-limits` → current rate limit status per agent
  - `GET /api/ai/security/permissions` → permission matrix
  - `GET /api/ai/security/stats` → summary stats
- **Database tables**: `securityAuditLog` (new)
- **AI agents**: SecurityAgent
- **Real-time**: `ai:security:events` — live security events
- **User interactions**: Filter audit log, adjust rate limits, view/edit permissions
- **Mobile**: Not prioritized

---

### Page: Avatar Council Control
- **Route**: `/ai/avatar-council`
- **Purpose**: Configure the 9 AI avatars, their system prompts, knowledge bases, and debate parameters. Monitor active debate sessions.
- **Status**: 🔄 Enhance (basic version exists in admin)
- **UI Layout**:
  - **Avatar grid**: 9 avatar cards with name, role, status, session count
  - **Selected avatar panel**: System prompt editor, knowledge base links, personality parameters
  - **Active debates**: Live debate sessions with real-time message feed
- **Components needed**:
  - **Existing**: `DebateChamber`, `DecisionChamber`, `AvatarNetworkGraph`
  - **New**: `AvatarConfigEditor`, `AvatarPromptEditor`
- **API endpoints**:
  - Existing avatar endpoints + `PUT /api/ai/avatars/:id/config` for prompt/parameter editing
- **Database tables**: `aiAvatars`, `avatarSessions`, `avatarMessages`, `debateSessions` (all existing)
- **AI agents**: All avatar-related agents
- **Real-time**: `ai:avatar:debate` — live debate messages
- **User interactions**: Edit avatar prompts, start test debates, view debate history, adjust parameters
- **Mobile**: Not prioritized

**AI Lounge total pages: 8**

---

## 2.2 👥 AGENT LOUNGE

**Purpose**: The sales agent's daily workspace. Everything an agent needs to work leads, make calls, close deals, get trained, and get paid.

**Route prefix**: `/agents/*`
**Required role**: `sales_agent` or higher
**Auth**: Session-based

---

### Page: Agent Dashboard
- **Route**: `/agents/dashboard`
- **Purpose**: The agent's home screen. Today's priorities — hot leads, upcoming appointments, performance snapshot, notifications, and quick actions.
- **Status**: ✅ Built → 🔄 Enhance
- **UI Layout**:
  - **Top row**: Welcome message with agent name, today's date, daily performance summary (calls made, appointments set, policies sold)
  - **Left column (60%)**: Priority leads panel (top 5 leads sorted by score), today's appointments timeline, recent activity feed
  - **Right column (40%)**: Performance snapshot (weekly/monthly charts — premium sold, close rate, leaderboard rank), notification list, quick actions (log call, create lead, request quote)
  - **Bottom**: AI coaching tip of the day (from CallCoachingAgent)
- **Components needed**:
  - **Existing**: AgentLoungeLayout (wrapper), notification components
  - **New**: `DailyPriorityLeads`, `AppointmentTimeline`, `PerformanceSnapshot`, `QuickActionBar`, `CoachingTipCard`
- **API endpoints**:
  - `GET /api/agents/dashboard` → aggregated dashboard data (leads, appointments, stats, tip)
  - `GET /api/agents/notifications` → `{ notifications: [...] }`
  - `POST /api/agents/activity` → log a quick activity
- **Database tables**: `leads`, `leadActivities`, `policies`, `notifications` (existing)
- **AI agents**: LeadScoringAgent (priority leads), AppointmentAgent (today's schedule), CallCoachingAgent (daily tip), AgentPerformanceAgent (stats)
- **Real-time**: `agent:{agentId}:notifications`, `agent:{agentId}:lead-updates`
- **User interactions**: Click lead to open detail, click appointment to view, dismiss notifications, execute quick actions
- **Mobile**: Must be fully responsive — this is the primary mobile screen for agents in the field

---

### Page: Lead Inbox
- **Route**: `/agents/leads`
- **Purpose**: All leads assigned to this agent. Filterable list with sort by score, status, and follow-up date. Quick actions for calling, emailing, updating status.
- **Status**: ✅ Built → 🔄 Enhance
- **UI Layout**:
  - **Top**: Filter bar (status dropdown, source dropdown, search by name/email/phone, sort by score/date/follow-up)
  - **Main**: Lead table/card list (togglable view). Each row: name, phone, email, source, status badge, score badge, coverage type, next follow-up, assigned date. Row actions: call, email, update status, view detail.
  - **Right drawer** (opens on click): Lead detail panel — full info, activity timeline, notes, quick status update
- **Components needed**:
  - **Existing**: Lead list components, filter bar
  - **New**: `LeadScoreBadge`, `LeadQuickActions`, `LeadDetailDrawer` (enhance existing)
- **API endpoints**:
  - `GET /api/agents/leads?status=new&sort=score&page=1` → paginated leads
  - `PUT /api/agents/leads/:id/status` → update status
  - `POST /api/agents/leads/:id/activity` → log activity
  - `GET /api/agents/leads/:id` → full lead detail with activities
- **Database tables**: `leads`, `leadActivities` (existing)
- **AI agents**: LeadScoringAgent (scores), LeadIntakeAgent (normalization), DataEnrichmentAgent (enriched data)
- **Real-time**: `agent:{agentId}:new-lead` — new lead assigned
- **User interactions**: Filter, sort, search, click to expand, update status (dropdown), log call/email/note, bulk actions (assign, update status)
- **Mobile**: Card view default on mobile, swipe actions for status update

---

### Page: Lead Detail
- **Route**: `/agents/leads/:leadId`
- **Purpose**: Full 360° view of a single lead — all information, communication history, AI recommendations, and next-best-action suggestions.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Header**: Lead name, status badge, score, coverage type, estimated value, assigned agent
  - **Left column (65%)**:
    - Contact info card (phone, email, address, source)
    - Activity timeline (all activities: calls, emails, status changes, notes — chronological)
    - Notes section (add/edit notes)
  - **Right column (35%)**:
    - AI Recommendations card (next best action from AiSalesAgent, objection prep from KnowledgeBase)
    - Enrichment data card (from DataEnrichmentAgent — social profiles, employment, household info)
    - Related entities (appointments, quotes, applications)
  - **Bottom**: Action bar — Call, Email, Text, Schedule Appointment, Create Quote, Update Status, Transfer Lead
- **Components needed**:
  - **New**: `LeadDetailPage`, `ActivityTimeline`, `AiRecommendationCard`, `EnrichmentDataCard`, `LeadActionBar`
- **API endpoints**:
  - `GET /api/agents/leads/:id/full` → lead + activities + enrichment + recommendations
  - `POST /api/agents/leads/:id/call` → initiate call (DialerAgent)
  - `POST /api/agents/leads/:id/email` → send email (EmailOutreachAgent)
  - `POST /api/agents/leads/:id/sms` → send SMS (SmsMessagingAgent)
  - `POST /api/agents/leads/:id/appointment` → schedule appointment
  - `POST /api/agents/leads/:id/quote` → generate quote
- **Database tables**: `leads`, `leadActivities`, `quoteRequests` (existing); `leadEnrichmentData` (new)
- **AI agents**: AiSalesAgent (recommendations), DataEnrichmentAgent (enrichment), PolicyRecommendationAgent (product suggestions), ComplianceAgent (compliance checks)
- **Real-time**: `lead:{leadId}:updates` — real-time activity updates
- **User interactions**: All actions in action bar, add notes, click to call (click-to-dial), view AI suggestions, edit lead info
- **Mobile**: Stacked layout, action bar becomes floating action button with menu

---

### Page: Calendar
- **Route**: `/agents/calendar`
- **Purpose**: Agent's appointment calendar. Shows all scheduled appointments, follow-ups, and sync with Google Calendar.
- **Status**: ✅ Built → 🔄 Enhance
- **UI Layout**:
  - **Main**: Calendar view (day/week/month toggle). Events color-coded: appointments (blue), follow-ups (yellow), personal (gray)
  - **Right sidebar**: Upcoming appointments list (next 5), quick-add appointment form
  - **Event detail modal**: On click — lead info, meeting type, location/link, notes, confirm/cancel/reschedule actions
- **Components needed**:
  - **Existing**: Calendar component
  - **New**: `CalendarEventModal`, `QuickAddAppointment`
- **API endpoints**:
  - `GET /api/agents/calendar?start=2026-02-01&end=2026-02-28` → events
  - `POST /api/agents/calendar/events` → create event
  - `PUT /api/agents/calendar/events/:id` → update
  - `DELETE /api/agents/calendar/events/:id` → delete
  - `POST /api/agents/calendar/sync` → force sync with Google Calendar
- **Database tables**: `appointments` (new), plus Google Calendar integration
- **AI agents**: AppointmentAgent (scheduling logic, conflict detection, reminders)
- **Real-time**: `agent:{agentId}:appointment-update`
- **User interactions**: Create/edit/delete appointments, drag to reschedule, sync with Google Calendar, view lead context for each appointment
- **Mobile**: Day view default, swipe between days

---

### Page: Performance
- **Route**: `/agents/performance`
- **Purpose**: Personal performance dashboard — close rate, premium sold, commission earned, call metrics, improvement trends, and rank vs team.
- **Status**: ✅ Built → 🔄 Enhance
- **UI Layout**:
  - **Top cards**: Total premium sold (month), close rate (%), rank on leaderboard, commission earned
  - **Charts row**: Premium trend (line chart, last 6 months), conversion funnel (bar chart), activity breakdown (calls/emails/appointments — pie chart)
  - **Table**: Detailed activity log — each closed deal, pending deal, lost deal with amounts and dates
  - **Bottom**: Goal tracker — monthly targets vs actual, visual progress bars
- **Components needed**:
  - **Existing**: Performance charts
  - **New**: `GoalTracker`, `DealTable`, `RankBadge`
- **API endpoints**:
  - `GET /api/agents/performance?period=month` → all performance data
  - `GET /api/agents/performance/goals` → goals and progress
  - `PUT /api/agents/performance/goals` → update goals
- **Database tables**: `leads` (won status), `policies`, `commissions` (new), `agentGoals` (new)
- **AI agents**: AgentPerformanceAgent, RevenueForecastAgent
- **Real-time**: `agent:{agentId}:performance-update`
- **User interactions**: Change time period, set goals, drill into deals, export report
- **Mobile**: Scrollable card layout

---

### Page: Chat
- **Route**: `/agents/chat`
- **Purpose**: Internal team messaging — direct messages and group channels for sales team communication.
- **Status**: ✅ Built
- **UI Layout**: Standard chat interface — sidebar with conversations, main chat area, message input
- **Components needed**: `ChatInterface`, `ChatRoom`, `ChatSidebar` (all existing)
- **API endpoints**: Existing chat endpoints
- **Database tables**: `chatConversations`, `chatParticipants`, `chatMessages` (existing)
- **AI agents**: ConversationMemoryAgent (stores conversation context)
- **Real-time**: `chat:{conversationId}:message`
- **User interactions**: Send messages, create conversations, search messages
- **Mobile**: Full mobile chat experience

---

### Page: Quote Builder
- **Route**: `/agents/quotes`
- **Purpose**: Create and manage insurance quotes. Select product type, enter client details, get premium estimates, generate PDF quote letters.
- **Status**: ✅ Built → 🔄 Enhance
- **UI Layout**:
  - **Left**: Quote form — client name, DOB, health class, coverage type, coverage amount, term, riders
  - **Right**: Real-time premium calculator display — shows monthly/annual premium, carrier options ranked by price
  - **Bottom**: Quote history table — past quotes with status (sent/accepted/expired)
- **Components needed**:
  - **Existing**: Quote form components
  - **New**: `PremiumCalculator`, `CarrierRanking`, `QuotePdfGenerator`, `QuoteHistoryTable`
- **API endpoints**:
  - `POST /api/agents/quotes/calculate` → `{ premium, carriers: [...] }`
  - `POST /api/agents/quotes/generate` → create quote record + PDF
  - `GET /api/agents/quotes?page=1` → quote history
  - `POST /api/agents/quotes/:id/send` → email quote to client
- **Database tables**: `quoteRequests` (existing), `quotes` (new — generated quotes with premium, carrier, PDF link)
- **AI agents**: PolicyRecommendationAgent (product matching), AiSalesAgent (upsell suggestions), ComplianceAgent (compliance check on quote)
- **Real-time**: Not needed
- **User interactions**: Fill form, calculate premium, select carrier, generate quote, email to client, view history
- **Mobile**: Simplified form, essential fields only

---

### Page: Scripts & Objections
- **Route**: `/agents/scripts`
- **Purpose**: Sales scripts library and objection handling playbook. AI-powered suggestions based on lead context.
- **Status**: ✅ Built → 🔄 Enhance
- **UI Layout**:
  - **Left sidebar**: Script categories — Cold Call, Warm Lead, Referral, Follow-Up, Closing, Objections
  - **Main**: Selected script with highlighted key phrases, branching logic (if prospect says X, respond with Y)
  - **Bottom**: Objection search — type objection keyword, get KnowledgeBase-powered responses
- **Components needed**:
  - **Existing**: Script viewer
  - **New**: `ScriptBranchingView`, `ObjectionSearchEngine`, `ContextualScriptSuggester`
- **API endpoints**:
  - `GET /api/agents/scripts?category=cold-call` → scripts
  - `GET /api/agents/scripts/objections?q=too expensive` → objection responses
  - `POST /api/agents/scripts/ai-suggest` → `{ leadId, context }` → AI-generated script suggestions
- **Database tables**: `scripts` (new), `objectionResponses` (new, or via KnowledgeBase)
- **AI agents**: AiSalesAgent (suggestions), KnowledgeBase (objection responses)
- **Real-time**: Not needed
- **User interactions**: Browse scripts, search objections, get AI suggestions for a specific lead, bookmark favorites
- **Mobile**: Scrollable script view, quick objection search

---

### Page: Leaderboard
- **Route**: `/agents/leaderboard`
- **Purpose**: Competitive leaderboard — rank all agents by premium sold, close rate, and activity metrics. Gamification driver.
- **Status**: ✅ Built
- **UI Layout**:
  - **Top 3 podium**: Animated podium for top 3 agents with photos, names, metrics
  - **Full ranking table**: All agents ranked, with columns: rank, name, premium sold, policies closed, close rate, activity score
  - **Filters**: Time period (week/month/quarter/year), metric to rank by
- **Components needed**: Existing leaderboard components
- **API endpoints**: `GET /api/agents/leaderboard?period=month&metric=premium`
- **Database tables**: `leads`, `policies`, aggregated from `agentPerformanceSnapshots` (new)
- **AI agents**: AgentPerformanceAgent
- **Real-time**: `leaderboard:update`
- **User interactions**: Change time period, change ranking metric, click agent to view profile
- **Mobile**: Simplified table, top 3 prominent

---

### Page: Achievements
- **Route**: `/agents/achievements`
- **Purpose**: Gamification hub — badges, XP level, streaks, unlocked achievements. Drives engagement and healthy competition.
- **Status**: ✅ Built
- **UI Layout**:
  - **Top**: Agent level bar (XP progress), current streak display
  - **Grid**: Achievement badges (earned = color, unearned = grayscale) with names and descriptions
  - **Activity**: Recent XP transactions (what earned XP and when)
- **Components needed**: Existing achievement components
- **API endpoints**: `GET /api/agents/achievements` → badges, XP, streaks
- **Database tables**: `agentXpTransactions`, `agentCertificates` (existing)
- **AI agents**: TrainingAgent, AgentPerformanceAgent
- **Real-time**: `agent:{agentId}:achievement-unlocked`
- **User interactions**: View badges, share to team chat, view XP history
- **Mobile**: Grid layout with badge icons

---

### Page: Email Center
- **Route**: `/agents/email`
- **Purpose**: View and manage outbound emails — templates, sent emails, open/click tracking, automated sequences.
- **Status**: ✅ Built → 🔄 Enhance
- **UI Layout**:
  - **Tab 1 — Inbox/Sent**: Email list with status indicators (sent, opened, clicked, replied)
  - **Tab 2 — Templates**: Email template library with preview and edit
  - **Tab 3 — Sequences**: Automated email sequences (drip campaigns) with enrollment status
- **Components needed**:
  - **Existing**: Email components
  - **New**: `EmailTrackingIndicator`, `SequenceBuilder`, `SequenceEnrollmentManager`
- **API endpoints**:
  - `GET /api/agents/emails?tab=sent&page=1` → sent emails with tracking
  - `GET /api/agents/emails/templates` → templates
  - `GET /api/agents/emails/sequences` → sequences with enrollment counts
  - `POST /api/agents/emails/send` → send email (through EmailOutreachAgent)
  - `POST /api/agents/emails/sequences/:id/enroll` → enroll lead in sequence
- **Database tables**: `emailsSent` (new), `emailTemplates` (new), `emailSequences` (new), `emailSequenceEnrollments` (new)
- **AI agents**: EmailOutreachAgent (sending), ContentGenerationAgent (template suggestions), OutreachOrchestrationAgent (sequence management)
- **Real-time**: `agent:{agentId}:email-tracking` — open/click events
- **User interactions**: Send emails, create/edit templates, create sequences, enroll leads, view tracking
- **Mobile**: Basic email list view

---

### Page: Automations
- **Route**: `/agents/automations`
- **Purpose**: View and configure personal automation rules — e.g., auto-follow-up if no response in 3 days, auto-assign hot leads, notification triggers.
- **Status**: ✅ Built → 🔄 Enhance
- **UI Layout**:
  - **List view**: Active automations with toggle on/off, trigger description, action description, last fired timestamp
  - **Builder modal**: If/then rule builder — trigger (event type) → condition (field matches) → action (send email, update status, create task, notify)
- **Components needed**:
  - **Existing**: Automation list
  - **New**: `AutomationRuleBuilder`, `TriggerSelector`, `ConditionBuilder`, `ActionSelector`
- **API endpoints**:
  - `GET /api/agents/automations` → list
  - `POST /api/agents/automations` → create rule
  - `PUT /api/agents/automations/:id` → update
  - `PUT /api/agents/automations/:id/toggle` → enable/disable
- **Database tables**: `automationRules` (new)
- **AI agents**: OrchestratorAgent (executes automation rules), OptimizationAgent (suggests automations)
- **Real-time**: Not needed
- **User interactions**: Create/edit/toggle automations, view execution history
- **Mobile**: List view with toggles

---

### Page: Avatar Council
- **Route**: `/agents/avatar-council`
- **Purpose**: Access the 9 AI avatars for sales coaching, objection practice, compliance guidance, and strategic advice.
- **Status**: ✅ Built
- **UI Layout**: Avatar grid → select avatar → chat interface. Debate mode for multi-avatar discussion.
- **Components needed**: `DebateChamber`, `DecisionChamber`, `AvatarNetworkGraph`, `ChatInterface` (existing)
- **API endpoints**: Existing avatar endpoints
- **Database tables**: `aiAvatars`, `avatarSessions`, `avatarMessages`, `debateSessions` (existing)
- **AI agents**: Avatar system
- **Real-time**: `avatar:session:{sessionId}:message`
- **User interactions**: Chat with avatars, start debates, get coaching
- **Mobile**: Chat interface works on mobile

---

### Page: Study Center
- **Route**: `/agents/study-center` (+ sub-pages: `/modules`, `/assessments`, `/simulations`, `/certificates`)
- **Purpose**: Training platform — study modules, assessments, sales simulations, and certification tracking.
- **Status**: ✅ Built
- **Components needed**: Existing study center components
- **Database tables**: `agentTrainingProgress`, `agentAssessmentResults`, `agentSimulationResults`, `agentCertificates` (existing)
- **AI agents**: TrainingAgent
- **Mobile**: Fully responsive for studying on the go

---

### Page: Pipeline (Kanban)
- **Route**: `/agents/pipeline`
- **Purpose**: Visual Kanban board of the agent's lead pipeline — drag-and-drop leads across stages (New → Contacted → Quoted → Follow-Up → Won/Lost).
- **Status**: 🔨 Build (PipelineKanban component exists but not as standalone page)
- **UI Layout**:
  - **Columns**: New | Contacted | Quoted | Follow-Up | Won | Lost
  - **Cards**: Lead name, coverage type, estimated value, score badge, days in stage
  - **Quick actions**: On card — call, email, move, open detail
- **Components needed**:
  - **Existing**: `PipelineKanban`
  - **New**: `PipelineCard` (enhanced), `PipelineFilters`
- **API endpoints**:
  - `GET /api/agents/pipeline` → leads grouped by status
  - `PUT /api/agents/pipeline/move` → `{ leadId, newStatus }` — update lead status
- **Database tables**: `leads`, `leadActivities`
- **AI agents**: LeadScoringAgent (score on cards), AiSalesAgent (recommended actions)
- **Real-time**: `agent:{agentId}:pipeline-update`
- **User interactions**: Drag-and-drop between columns, click card for detail, filter by source/coverage type, sort within column
- **Mobile**: Horizontal scrollable columns

---

### Page: War Room
- **Route**: `/agents/war-room`
- **Purpose**: Intensive focus mode for closing hot leads — AI-powered real-time assistance during active calls/presentations.
- **Status**: 🔨 Build (WarRoom component exists)
- **UI Layout**:
  - **Left (50%)**: Active lead context — full info, history, AI strategy recommendations
  - **Right (50%)**: Live assistance panel — objection handler (type objection, get instant response), premium calculator, competitor comparison
  - **Bottom**: Quick notes, outcome logging
- **Components needed**:
  - **Existing**: `WarRoom`
  - **New**: `LiveObjectionHandler`, `CompetitorComparison`, `CallOutcomeLogger`
- **API endpoints**:
  - `POST /api/agents/war-room/objection` → `{ objection }` → `{ response, alternatives }`
  - `POST /api/agents/war-room/outcome` → log call outcome
- **Database tables**: `leads`, `leadActivities`
- **AI agents**: AiSalesAgent (strategy), HumanSalesAssistAgent (real-time tips), CallCoachingAgent (post-call review)
- **Real-time**: `warroom:{sessionId}:assist` — real-time AI suggestions
- **User interactions**: Enter objections for instant responses, log outcomes, take notes, close deal
- **Mobile**: Simplified — objection handler and notes only

---

### Additional existing pages: Onboarding, Getting Started, Guidelines, Settings, Resources, Help, Data Encryption — all ✅ Built, enhancement optional.

**Agent Lounge total pages: 20+**

---

## 2.3 📊 MANAGER LOUNGE

**Purpose**: For agency managers to oversee their team's performance, coach agents, manage pipeline health, and make data-driven decisions about resource allocation.

**Route prefix**: `/manager/*`
**Required role**: `agency_manager` or higher

---

### Page: Manager Dashboard
- **Route**: `/manager/dashboard`
- **Purpose**: High-level team overview — total pipeline value, team close rate, top/bottom performers, alerts needing attention.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Top cards**: Total pipeline value, team close rate (this month), policies sold (this month), revenue (this month), number of active leads
  - **Left (60%)**: Team activity feed (recent closes, new leads, escalations), pipeline health chart (leads by stage, aging alerts)
  - **Right (40%)**: Agent ranking mini-leaderboard (top 5), alerts panel (stale leads, missed follow-ups, escalations), quick team stats
- **Components needed**:
  - **New**: `ManagerDashboardLayout`, `TeamActivityFeed`, `PipelineHealthChart`, `AlertsPanel`, `TeamMiniLeaderboard`
- **API endpoints**:
  - `GET /api/manager/dashboard` → aggregated team dashboard data
  - `GET /api/manager/alerts` → actionable alerts
- **Database tables**: `leads`, `policies`, `leadActivities`, `users` (agents), `agentPerformanceSnapshots`
- **AI agents**: AgentPerformanceAgent, RealTimeAnalyticsAgent, OptimizationAgent (suggestions)
- **Real-time**: `manager:dashboard:update`, `manager:alerts:new`
- **User interactions**: Click alert to act on it, click agent to view their detail, drill into pipeline chart
- **Mobile**: Card stack layout

---

### Page: Team Management
- **Route**: `/manager/team`
- **Purpose**: View all agents, their current workload, availability, and performance. Assign/reassign leads, set targets, manage schedules.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Agent table**: Name, status (online/offline/busy), active leads count, close rate (30d), premium sold (30d), upcoming appointments, action buttons
  - **Agent detail drawer**: Full profile, performance history, coaching notes, assigned leads, goal progress
  - **Bulk actions bar**: Reassign leads, set group targets, send team announcement
- **Components needed**:
  - **New**: `TeamTable`, `AgentDetailDrawer`, `BulkActionBar`, `WorkloadBalancer`
- **API endpoints**:
  - `GET /api/manager/team` → all agents with workload data
  - `GET /api/manager/team/:agentId` → agent detail
  - `POST /api/manager/team/reassign` → `{ leadIds: [], targetAgentId }` — bulk reassign
  - `PUT /api/manager/team/:agentId/targets` → set targets
- **Database tables**: `users`, `leads`, `policies`, `agentGoals`, `coachingNotes` (new)
- **AI agents**: AgentPerformanceAgent, OptimizationAgent (suggests lead redistribution)
- **Real-time**: `manager:team:status-change`
- **User interactions**: View agents, reassign leads (drag or bulk), set targets, add coaching notes, view availability
- **Mobile**: Card view per agent

---

### Page: Pipeline Overview
- **Route**: `/manager/pipeline`
- **Purpose**: Team-wide pipeline view — all leads across all agents, filterable by agent, status, source, value. Identify bottlenecks and stale opportunities.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Top**: Filter bar — by agent, status, source, date range, value range
  - **Main (Kanban view)**: Same columns as agent pipeline but showing ALL team leads. Cards show agent name in addition to lead info.
  - **Toggle**: Kanban ↔ Table view
  - **Bottom**: Pipeline analytics — value by stage (bar chart), average time in each stage, conversion rates between stages
- **Components needed**:
  - **Existing**: `PipelineKanban` (enhanced for multi-agent view)
  - **New**: `PipelineAnalytics`, `AgentFilter`, `PipelineTableView`
- **API endpoints**:
  - `GET /api/manager/pipeline?agent=all&status=all` → all team leads
  - `GET /api/manager/pipeline/analytics` → stage analytics
- **Database tables**: `leads`, `leadActivities`
- **AI agents**: LeadScoringAgent, OptimizationAgent
- **Real-time**: `manager:pipeline:update`
- **User interactions**: Filter/sort, toggle view, click lead for detail, reassign lead to different agent
- **Mobile**: Table view default

---

### Page: Coaching Center
- **Route**: `/manager/coaching`
- **Purpose**: Review agent call recordings, AI-generated coaching insights, and provide feedback. Track improvement over time.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Left sidebar**: Agent list with coaching status indicators (needs review, reviewed, on track)
  - **Main panel**: Selected agent's coaching view —
    - Recent call summaries (AI-generated) with sentiment scores
    - Strengths/weaknesses analysis (from CallCoachingAgent)
    - Coaching note history
    - Improvement trend chart
  - **Bottom**: Add coaching note form, schedule 1-on-1
- **Components needed**:
  - **New**: `CoachingAgentSidebar`, `CallSummaryCard`, `StrengthsWeaknessesChart`, `CoachingNoteForm`, `ImprovementTrend`
- **API endpoints**:
  - `GET /api/manager/coaching/:agentId` → coaching data
  - `POST /api/manager/coaching/:agentId/notes` → add coaching note
  - `GET /api/manager/coaching/:agentId/calls` → call summaries
- **Database tables**: `coachingNotes`, `callRecordings` (new), `callAnalysis` (new)
- **AI agents**: CallCoachingAgent (analysis), ConversationMemoryAgent (call context)
- **Real-time**: Not needed
- **User interactions**: Select agent, review calls, add notes, schedule coaching session
- **Mobile**: Read-only coaching summaries

---

### Page: Reports
- **Route**: `/manager/reports`
- **Purpose**: Generate and view team reports — weekly summaries, monthly performance, pipeline health, conversion analysis.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Report selector**: Dropdown — Weekly Summary, Monthly Performance, Pipeline Health, Source Analysis, Agent Comparison
  - **Parameters**: Date range, agents to include, metrics to show
  - **Report display**: Charts + tables based on selected report type
  - **Actions**: Export as PDF, export as CSV, email report, schedule recurring
- **Components needed**:
  - **New**: `ReportSelector`, `ReportRenderer`, `ReportExporter`, `ScheduledReportManager`
- **API endpoints**:
  - `GET /api/manager/reports/:type?start=X&end=Y&agents=all` → report data
  - `POST /api/manager/reports/schedule` → schedule recurring report
  - `POST /api/manager/reports/export` → generate PDF/CSV
- **Database tables**: Reads from `leads`, `policies`, `leadActivities`, `agentPerformanceSnapshots`; `scheduledReports` (new)
- **AI agents**: RealTimeAnalyticsAgent, RevenueForecastAgent
- **Real-time**: Not needed
- **User interactions**: Select report type, set parameters, generate, export, schedule
- **Mobile**: View reports (simplified charts)

---

### Page: Escalations
- **Route**: `/manager/escalations`
- **Purpose**: View and manage all human escalation requests from AI agents — situations where an AI agent determined a human needs to intervene.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Priority queue**: Escalation cards sorted by urgency — each showing: source agent, reason, related lead/client, recommended action, timestamp
  - **Detail modal**: Full context — event chain that led to escalation, AI recommendations, action buttons (resolve, reassign, dismiss)
- **Components needed**:
  - **New**: `EscalationQueue`, `EscalationDetailModal`, `EscalationActions`
- **API endpoints**:
  - `GET /api/manager/escalations?status=open` → open escalations
  - `PUT /api/manager/escalations/:id/resolve` → resolve with notes
  - `PUT /api/manager/escalations/:id/reassign` → reassign to agent
- **Database tables**: `escalations` (new)
- **AI agents**: HumanEscalationAgent (creates them), OrchestratorAgent (routes them)
- **Real-time**: `manager:escalation:new`
- **User interactions**: View, resolve, reassign, add notes, filter by urgency
- **Mobile**: Priority list with swipe actions

**Manager Lounge total pages: 6**

---

## 2.4 🏢 EXECUTIVE LOUNGE

**Purpose**: C-suite view. Revenue, growth, strategic metrics, forecasts, and investor-ready dashboards. No operational detail — just the numbers that matter.

**Route prefix**: `/executive/*`
**Required role**: `owner` or `investor`

---

### Page: Executive Dashboard
- **Route**: `/executive/dashboard`
- **Purpose**: The big picture — total revenue, growth rate, key ratios, and health indicators for the entire business.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Top cards (hero)**: Annual Premium Sold (YTD), Monthly Recurring Revenue, Total Active Policies, Client Retention Rate, Growth Rate (MoM)
  - **Charts row**: Revenue trend (12-month line chart), Policy volume (bar chart), Lead-to-sale conversion trend
  - **Bottom**: Key business health indicators — average policy size, cost per acquisition, lifetime customer value, agent productivity index
- **Components needed**:
  - **New**: `ExecutiveDashboardLayout`, `HeroMetricCard`, `RevenueTrendChart`, `BusinessHealthIndicators`
- **API endpoints**:
  - `GET /api/executive/dashboard` → all executive metrics
- **Database tables**: Aggregated from `policies`, `leads`, `commissions`, `billingHistory`; `executiveSnapshots` (new — daily snapshots)
- **AI agents**: RevenueForecastAgent, RealTimeAnalyticsAgent
- **Real-time**: `executive:metrics:update` (hourly refresh)
- **User interactions**: Change time period, drill into any metric, export executive summary
- **Mobile**: Scrollable metric cards

---

### Page: Revenue & Forecasting
- **Route**: `/executive/revenue`
- **Purpose**: Deep revenue analysis and AI-powered forecasting. Compare forecast vs actual, model scenarios, track commission structures.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Chart (main)**: Revenue actual vs forecast (dual-line chart) with confidence interval bands
  - **Breakdown table**: Revenue by product type, by agent, by source
  - **Scenario modeler**: Sliders — "If we add X agents" / "If close rate improves by Y%" → projected revenue impact
  - **Commission summary**: Total commissions paid, average per agent, commission-to-revenue ratio
- **Components needed**:
  - **New**: `ForecastChart`, `RevenueBreakdownTable`, `ScenarioModeler`, `CommissionSummary`
- **API endpoints**:
  - `GET /api/executive/revenue?period=12m` → revenue data + forecast
  - `POST /api/executive/revenue/scenario` → `{ assumptions }` → projected outcome
  - `GET /api/executive/revenue/breakdown?by=product` → breakdown
- **Database tables**: `policies`, `commissions`, `revenueForecasts` (new)
- **AI agents**: RevenueForecastAgent (forecasting, scenarios)
- **Real-time**: Not needed
- **User interactions**: Adjust forecast assumptions, model scenarios, export forecast report
- **Mobile**: Charts only, no scenario modeler

---

### Page: Growth Analytics
- **Route**: `/executive/growth`
- **Purpose**: Analyze growth vectors — lead sources, marketing ROI, agent productivity, market penetration.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Source analysis**: Lead volume and conversion by source (chart + table)
  - **Marketing ROI**: Spend vs revenue generated per channel
  - **Agent productivity**: Revenue per agent trending over time
  - **Market map**: Geographic heatmap of client distribution (if address data available)
- **Components needed**:
  - **New**: `SourceAnalysisChart`, `MarketingROITable`, `AgentProductivityTrend`, `GeoHeatmap`
- **API endpoints**:
  - `GET /api/executive/growth/sources` → source analysis
  - `GET /api/executive/growth/marketing-roi` → ROI data
  - `GET /api/executive/growth/agent-productivity` → productivity data
- **Database tables**: `leads`, `policies`, `marketingSpend` (new)
- **AI agents**: RealTimeAnalyticsAgent, OptimizationAgent
- **Real-time**: Not needed
- **User interactions**: Filter by date range, drill into sources, export
- **Mobile**: Simplified charts

---

### Page: Investor View
- **Route**: `/executive/investor`
- **Purpose**: Read-only investor dashboard. Clean, professional view of business performance. No operational data — just growth, revenue, and projections.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Branded header**: Company logo, report period
  - **Key metrics grid**: Revenue, policies, growth rate, retention, LTV, CAC
  - **Growth chart**: MRR/ARR trend
  - **Projection**: Next 12-month forecast
  - **Comparison**: Current period vs previous period
- **Components needed**:
  - **New**: `InvestorDashboardLayout`, `InvestorMetricGrid`, `ProjectionChart`, `PeriodComparison`
- **API endpoints**:
  - `GET /api/executive/investor-view` → curated investor metrics
- **Database tables**: Same as executive dashboard, curated subset
- **AI agents**: RevenueForecastAgent
- **Real-time**: Not needed (static report)
- **User interactions**: Change period, export as PDF, share link (with token-based access)
- **Mobile**: PDF-friendly layout

**Executive Lounge total pages: 4**

---

## 2.5 💼 CRM LOUNGE

**Purpose**: Deep CRM functionality — advanced lead management, pipeline operations, client database, and relationship tracking beyond what the Agent Lounge provides.

**Route prefix**: `/crm/*`
**Required role**: `sales_agent` or higher

---

### Page: CRM Dashboard
- **Route**: `/crm/dashboard`
- **Purpose**: CRM-specific metrics — total contacts, pipeline value, conversion funnel, source effectiveness, stale lead alerts.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Top cards**: Total leads, total clients, pipeline value, conversion rate, stale leads count
  - **Funnel visualization**: Visual funnel — New → Contacted → Quoted → Follow-Up → Won, with counts and conversion % at each step
  - **Source effectiveness table**: Lead source → volume → conversion rate → avg value
  - **Stale leads alert list**: Leads with no activity in 7+ days
- **Components needed**:
  - **New**: `CrmDashboardLayout`, `FunnelVisualization`, `SourceEffectivenessTable`, `StaleLeadAlerts`
- **API endpoints**:
  - `GET /api/crm/dashboard` → CRM metrics
  - `GET /api/crm/stale-leads?days=7` → stale leads
- **Database tables**: `leads`, `leadActivities`, `policies`
- **AI agents**: LeadScoringAgent, RealTimeAnalyticsAgent
- **Real-time**: `crm:dashboard:update`
- **User interactions**: Click stale lead to take action, drill into funnel stages, filter by date
- **Mobile**: Card layout

---

### Page: Contact Database
- **Route**: `/crm/contacts`
- **Purpose**: Unified contact database — all leads AND clients in one searchable, filterable, sortable table. The single source of truth for every human the business has interacted with.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Top**: Search bar (name, email, phone, any field), filter row (type: lead/client/both, status, source, assigned agent, date range)
  - **Main table**: Name, type (lead/client), email, phone, status, assigned to, last activity, value, actions
  - **Detail drawer**: Full contact info, activity history, policies (if client), related contacts (family/referrals)
  - **Bulk actions**: Export, bulk email, bulk status update, merge duplicates
- **Components needed**:
  - **New**: `ContactTable`, `ContactDetailDrawer`, `ContactSearch`, `DuplicateMerger`, `BulkActionToolbar`
- **API endpoints**:
  - `GET /api/crm/contacts?search=X&type=all&page=1&limit=50` → contacts
  - `GET /api/crm/contacts/:id` → full contact detail
  - `POST /api/crm/contacts/merge` → `{ primaryId, duplicateIds }` — merge contacts
  - `POST /api/crm/contacts/export` → CSV export
- **Database tables**: `leads`, `policies` (for client data), `contactRelationships` (new — family/referral links)
- **AI agents**: DataEnrichmentAgent (enrichment on demand), LeadScoringAgent
- **Real-time**: Not needed for table view
- **User interactions**: Search, filter, sort, click to expand, merge duplicates, export, bulk actions
- **Mobile**: Simplified table with essential columns

---

### Page: Advanced Pipeline
- **Route**: `/crm/pipeline`
- **Purpose**: Advanced pipeline management with weighted values, probability scoring, expected close dates, and pipeline forecasting.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Kanban view** (default): Enhanced cards with probability %, expected close date, weighted value
  - **Table view**: Sortable by any field
  - **Timeline view**: Gantt-style timeline showing expected close dates
  - **Pipeline summary**: Total pipeline value, weighted value, expected closes this week/month
- **Components needed**:
  - **Existing**: `PipelineKanban`
  - **New**: `PipelineTimeline`, `WeightedValueCalculator`, `PipelineSummaryBar`
- **API endpoints**:
  - `GET /api/crm/pipeline?view=kanban` → pipeline data with weighted values
  - `PUT /api/crm/pipeline/:leadId/probability` → update close probability
  - `GET /api/crm/pipeline/forecast` → pipeline forecast
- **Database tables**: `leads` (add `closeProbability`, `expectedCloseDate` columns)
- **AI agents**: LeadScoringAgent (probability), RevenueForecastAgent (pipeline forecast)
- **Real-time**: `crm:pipeline:update`
- **User interactions**: Drag-drop, edit probability/close date inline, toggle views, export forecast
- **Mobile**: Table view

---

### Page: Import/Export Center
- **Route**: `/crm/import-export`
- **Purpose**: Bulk import leads from CSV/Excel, export contacts and reports, manage data quality.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Import tab**: File upload zone, column mapping interface (map CSV columns to DB fields), duplicate detection preview, import button
  - **Export tab**: Select what to export (leads, clients, activities), filters, format (CSV/Excel), export button
  - **Import history**: Past imports with row counts, errors, undo option
- **Components needed**:
  - **New**: `FileUploadZone`, `ColumnMapper`, `DuplicatePreview`, `ImportHistory`, `ExportBuilder`
- **API endpoints**:
  - `POST /api/crm/import/upload` → upload file, return column preview
  - `POST /api/crm/import/execute` → `{ mapping, options }` → execute import
  - `GET /api/crm/import/history` → past imports
  - `POST /api/crm/export` → `{ type, filters, format }` → download file
- **Database tables**: `leads`, `importHistory` (new)
- **AI agents**: LeadIntakeAgent (normalizes imported leads), DataEnrichmentAgent (enriches after import)
- **Real-time**: `crm:import:progress` — live import progress
- **User interactions**: Upload file, map columns, preview, confirm import, download exports
- **Mobile**: Not prioritized

---

### Page: Client Management
- **Route**: `/crm/clients`
- **Purpose**: Manage existing policyholders — policy overview, renewal tracking, upsell opportunities, satisfaction monitoring.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Client table**: Name, policies count, total coverage, monthly premium, renewal date, NPS score, last contact
  - **Client detail**: All policies, billing history, communication log, documents, family members, upsell opportunities (AI-suggested)
  - **Renewal alerts**: Upcoming renewals in next 30/60/90 days
- **Components needed**:
  - **New**: `ClientTable`, `ClientDetailView`, `RenewalAlertsList`, `UpsellOpportunities`, `ClientNpsScore`
- **API endpoints**:
  - `GET /api/crm/clients?page=1` → clients
  - `GET /api/crm/clients/:id` → full client detail
  - `GET /api/crm/clients/renewals?days=30` → upcoming renewals
- **Database tables**: `users` (client role), `policies`, `billingHistory`, `documents`, `clientNps` (new)
- **AI agents**: RetentionAgent (retention risk), PolicyRecommendationAgent (upsell), CustomerSupportAgent
- **Real-time**: `crm:client:update`
- **User interactions**: View clients, open detail, track renewals, act on upsell opportunities, add notes
- **Mobile**: Client list with quick call action

**CRM Lounge total pages: 5**

---

## 2.6 📣 MARKETING LOUNGE

**Purpose**: Content creation, social media management, campaign tracking, reputation monitoring, and lead generation analytics.

**Route prefix**: `/marketing/*`
**Required role**: `marketing_staff` or higher

---

### Page: Marketing Dashboard
- **Route**: `/marketing/dashboard`
- **Purpose**: Marketing performance overview — content published, social engagement, lead generation from marketing, campaign ROI.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Top cards**: Leads from marketing (this month), website traffic (if tracked), social followers total, content published (this month), email subscribers
  - **Charts**: Lead source attribution (pie chart), content performance (bar chart — top 10 posts by views/engagement), email campaign metrics
  - **Calendar**: Content calendar — upcoming scheduled posts and campaigns
- **Components needed**:
  - **New**: `MarketingDashboardLayout`, `LeadAttributionChart`, `ContentPerformanceChart`, `ContentCalendar`
- **API endpoints**:
  - `GET /api/marketing/dashboard` → marketing metrics
  - `GET /api/marketing/content-calendar?month=2026-02` → scheduled content
- **Database tables**: `blogPosts`, `newsletterSubscribers`, `leads` (source filtering), `socialPosts` (new), `campaigns` (new)
- **AI agents**: ContentGenerationAgent, SocialPostingAgent, ReputationAgent, RealTimeAnalyticsAgent
- **Real-time**: `marketing:metrics:update`
- **User interactions**: View metrics, click into content calendar, drill into lead sources
- **Mobile**: Card layout

---

### Page: Content Studio
- **Route**: `/marketing/content`
- **Purpose**: Create and manage all content — blog posts, social media posts, email newsletters, and landing pages. AI-assisted writing.
- **Status**: 🔄 Enhance (blog editor exists in admin)
- **UI Layout**:
  - **Content list**: All content items (blog, social, email, page) with status (draft/published/scheduled), date, engagement metrics
  - **Editor**: Rich text editor with AI assistance — "Generate intro", "Suggest headline", "Write social version"
  - **SEO panel** (for blogs): Title, meta description, keywords, readability score, preview
  - **Social composer**: Write post, select platforms (FB, IG, LinkedIn, Google Business), schedule, preview for each platform
- **Components needed**:
  - **Existing**: Blog editor from admin
  - **New**: `ContentList`, `AiWritingAssistant`, `SocialComposer`, `PlatformPreview`, `ContentScheduler`
- **API endpoints**:
  - `GET /api/marketing/content?type=all&status=all` → content list
  - `POST /api/marketing/content` → create content
  - `PUT /api/marketing/content/:id` → update
  - `POST /api/marketing/content/:id/publish` → publish immediately
  - `POST /api/marketing/content/:id/schedule` → schedule for future
  - `POST /api/marketing/content/ai-generate` → `{ type, topic, tone, length }` → AI-generated content
- **Database tables**: `blogPosts`, `pages`, `contentRevisions` (existing), `socialPosts` (new), `contentSchedule` (new)
- **AI agents**: ContentGenerationAgent (writes content), SocialPostingAgent (posts to platforms)
- **Real-time**: Not needed
- **User interactions**: Create/edit/publish/schedule content, use AI to generate/improve, preview on platforms
- **Mobile**: Basic content list, no editing

---

### Page: Social Media Manager
- **Route**: `/marketing/social`
- **Purpose**: Manage social media presence — view all platforms, schedule posts, monitor engagement, respond to comments/messages.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Platform tabs**: Facebook, Instagram, LinkedIn, Google Business
  - **Feed view**: Recent posts with engagement metrics (likes, comments, shares)
  - **Compose**: Quick post composer (reuse social composer)
  - **Inbox**: Social messages/comments that need responses
  - **Analytics**: Engagement trends, best posting times, audience growth
- **Components needed**:
  - **New**: `SocialFeedView`, `SocialInbox`, `SocialAnalytics`, `PlatformTabs`
- **API endpoints**:
  - `GET /api/marketing/social/:platform/feed` → recent posts
  - `GET /api/marketing/social/inbox` → messages needing response
  - `POST /api/marketing/social/:platform/post` → post to platform
  - `GET /api/marketing/social/analytics` → engagement analytics
- **Database tables**: `socialPosts`, `socialMessages` (new), `socialAnalytics` (new)
- **AI agents**: SocialPostingAgent (posting), SocialDmAgent (DM responses), ReputationAgent (sentiment monitoring)
- **Real-time**: `marketing:social:new-message`
- **User interactions**: Post content, respond to messages, view analytics, schedule posts
- **Mobile**: Inbox and quick compose

---

### Page: Reputation Monitor
- **Route**: `/marketing/reputation`
- **Purpose**: Monitor online reviews and reputation — Google Reviews, Yelp, BBB. Track sentiment trends, respond to reviews, request reviews from happy clients.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Reputation score card**: Average rating, total reviews, sentiment trend
  - **Review feed**: All reviews from all platforms, sorted by date, with sentiment badges (positive/neutral/negative)
  - **Response panel**: For each review — AI-suggested response, edit, submit
  - **Review request**: Send review request to recent clients (email/SMS)
- **Components needed**:
  - **New**: `ReputationScoreCard`, `ReviewFeed`, `ReviewResponsePanel`, `ReviewRequestForm`
- **API endpoints**:
  - `GET /api/marketing/reputation/reviews` → all reviews
  - `POST /api/marketing/reputation/reviews/:id/respond` → post response
  - `POST /api/marketing/reputation/request-review` → send review request
  - `GET /api/marketing/reputation/score` → reputation score + trend
- **Database tables**: `reviews` (new), `reviewResponses` (new)
- **AI agents**: ReputationAgent (monitoring, sentiment, response suggestions)
- **Real-time**: `marketing:reputation:new-review`
- **User interactions**: View reviews, respond (with AI assistance), request reviews, track score
- **Mobile**: Review list with quick response

---

### Page: Campaign Manager
- **Route**: `/marketing/campaigns`
- **Purpose**: Create and manage marketing campaigns — email campaigns, social campaigns, landing page campaigns. Track ROI.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Campaign list**: Name, type, status, start/end date, budget, leads generated, ROI
  - **Campaign builder**: Multi-step — define campaign (name, type, dates, budget) → create content → set audience → launch
  - **Campaign detail**: Performance metrics, A/B test results, leads attributed
- **Components needed**:
  - **New**: `CampaignList`, `CampaignBuilder`, `CampaignDetail`, `CampaignROIChart`, `AudienceSelector`
- **API endpoints**:
  - `GET /api/marketing/campaigns` → campaigns
  - `POST /api/marketing/campaigns` → create
  - `GET /api/marketing/campaigns/:id` → detail with metrics
  - `PUT /api/marketing/campaigns/:id/launch` → launch
- **Database tables**: `campaigns`, `campaignContent` (new), `campaignMetrics` (new)
- **AI agents**: ContentGenerationAgent (campaign content), OutreachOrchestrationAgent (campaign execution), RealTimeAnalyticsAgent (tracking)
- **Real-time**: `marketing:campaign:metric-update`
- **User interactions**: Create/edit/launch campaigns, view performance, A/B test content
- **Mobile**: Campaign list only

---

### Page: Email Campaigns
- **Route**: `/marketing/email-campaigns`
- **Purpose**: Newsletter and email marketing management — subscriber management, campaign creation, send tracking, compliance (CAN-SPAM).
- **Status**: 🔄 Enhance (newsletter management exists in admin)
- **UI Layout**:
  - **Subscriber management**: List with subscribe/unsubscribe status, segments, growth chart
  - **Campaign composer**: Subject, content (rich text + AI assist), segment targeting, schedule
  - **Campaign analytics**: Opens, clicks, unsubscribes, conversions per campaign
- **Components needed**:
  - **Existing**: Newsletter admin page
  - **New**: `EmailCampaignComposer`, `SubscriberSegmentManager`, `EmailCampaignAnalytics`
- **API endpoints**:
  - `GET /api/marketing/email-campaigns` → campaigns
  - `POST /api/marketing/email-campaigns` → create
  - `POST /api/marketing/email-campaigns/:id/send` → send
  - `GET /api/marketing/email-campaigns/:id/analytics` → tracking data
  - `GET /api/marketing/subscribers?segment=X` → subscribers
- **Database tables**: `newsletterSubscribers` (existing), `emailCampaigns` (new), `emailCampaignSends` (new)
- **AI agents**: EmailOutreachAgent, ContentGenerationAgent
- **Real-time**: `marketing:email:tracking-update`
- **User interactions**: Manage subscribers, compose campaigns, send, view analytics
- **Mobile**: View analytics only

**Marketing Lounge total pages: 6**

---

## 2.7 👤 CLIENT PORTAL

**Purpose**: Self-service portal for policyholders. View policies, make payments, download documents, submit claims, contact support, and manage their account.

**Route prefix**: `/portal/*`
**Required role**: `client`

---

### Page: Client Dashboard
- **Route**: `/portal/dashboard`
- **Purpose**: Client's home — summary of all policies, upcoming payments, recent documents, and support messages.
- **Status**: ✅ Built → 🔄 Enhance
- **UI Layout**:
  - **Welcome section**: Client name, total coverage amount, number of active policies
  - **Policy cards**: Each policy as a card — type, coverage amount, monthly premium, status, next payment date
  - **Recent activity**: Last 5 notifications/documents/messages
  - **Quick actions**: Make payment, download document, contact support, file claim
- **Components needed**:
  - **Existing**: Portal layout components
  - **New**: `PolicySummaryCard`, `ClientQuickActions`
- **API endpoints**: Existing portal endpoints
- **Database tables**: `policies`, `documents`, `notifications`, `billingHistory` (existing)
- **AI agents**: ClientPortalAgent
- **Real-time**: `portal:{userId}:notifications`
- **User interactions**: Click policy for detail, make payment, view documents, contact support
- **Mobile**: Fully responsive — primary mobile use case

---

### Page: My Policies
- **Route**: `/portal/policies`
- **Purpose**: Detailed view of all policies with full information — coverage details, beneficiaries, payment history, documents.
- **Status**: ✅ Built → 🔄 Enhance
- **UI Layout**:
  - **Policy list**: Cards or accordion — each policy expandable with full details
  - **Expanded view**: Coverage breakdown, beneficiary info, premium schedule, policy documents, status timeline
- **Components needed**: Existing + enhanced `PolicyDetailView`
- **API endpoints**: `GET /api/portal/policies` → all user's policies with details
- **Database tables**: `policies`, `documents` (existing)
- **AI agents**: ClientPortalAgent
- **Real-time**: `portal:{userId}:policy-update`
- **User interactions**: View policies, download documents, update beneficiary (submit change request)
- **Mobile**: Accordion layout

---

### Page: Billing & Payments
- **Route**: `/portal/billing`
- **Purpose**: View billing history, make payments, update payment method, set up auto-pay.
- **Status**: ✅ Built → 🔄 Enhance
- **UI Layout**:
  - **Upcoming payments**: Next payment amount, date, policy — with "Pay Now" button
  - **Payment history table**: Date, amount, policy, method, status (paid/pending/failed)
  - **Payment method management**: Add/remove/update credit card or bank account (Stripe)
  - **Auto-pay toggle**: Enable/disable automatic payments
- **Components needed**:
  - **Existing**: Billing history view
  - **New**: `PaymentMethodManager` (Stripe Elements), `AutoPayToggle`, `PayNowButton`
- **API endpoints**:
  - `GET /api/portal/billing` → billing history
  - `POST /api/portal/billing/pay` → make payment (Stripe)
  - `PUT /api/portal/billing/payment-method` → update payment method
  - `PUT /api/portal/billing/auto-pay` → toggle auto-pay
- **Database tables**: `billingHistory` (existing), `paymentMethods` (new — Stripe customer/source IDs)
- **AI agents**: BillingAgent (payment processing), ClientPortalAgent
- **Real-time**: `portal:{userId}:payment-processed`
- **User interactions**: Pay now, view history, manage payment methods, toggle auto-pay
- **Mobile**: Pay button prominent, history as list

---

### Page: Documents
- **Route**: `/portal/documents`
- **Purpose**: View and download all policy documents — applications, policy contracts, riders, correspondence, tax forms.
- **Status**: ✅ Built
- **UI Layout**:
  - **Document list**: Filterable by policy, type, date. Each item: name, type, policy, date, download button.
  - **Document viewer**: In-browser PDF viewer for quick review
- **Components needed**: Existing document components
- **API endpoints**: `GET /api/portal/documents` → documents list (existing)
- **Database tables**: `documents` (existing)
- **AI agents**: ClientPortalAgent
- **Real-time**: `portal:{userId}:new-document`
- **User interactions**: Browse, filter, preview, download
- **Mobile**: Download-focused view

---

### Page: Claims
- **Route**: `/portal/claims`
- **Purpose**: View existing claims, file new claims, track claim status.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Claims list**: Existing claims with status (submitted/in-review/approved/paid/denied), amounts, dates
  - **File claim form**: Policy selector, claim type, description, supporting document upload, submit
  - **Claim detail**: Full timeline of claim processing — submitted → acknowledged → reviewed → decision
- **Components needed**:
  - **New**: `ClaimsList`, `FileClaimForm`, `ClaimDetailTimeline`, `DocumentUpload`
- **API endpoints**:
  - `GET /api/portal/claims` → user's claims
  - `POST /api/portal/claims` → file new claim
  - `GET /api/portal/claims/:id` → claim detail with timeline
  - `POST /api/portal/claims/:id/documents` → upload supporting documents
- **Database tables**: `claims` (new)
- **AI agents**: ClaimsAgent (processing), CustomerSupportAgent (communication)
- **Real-time**: `portal:{userId}:claim-update`
- **User interactions**: View claims, file new claim, upload documents, track status
- **Mobile**: File claim with photo upload from phone

---

### Page: Support
- **Route**: `/portal/support`
- **Purpose**: Contact support — live chat, submit tickets, view FAQ, and call request.
- **Status**: ✅ Built → 🔄 Enhance
- **UI Layout**:
  - **Live chat**: Chat interface with AI-powered initial response, escalation to human
  - **Ticket list**: Past support tickets with status
  - **FAQ section**: Searchable FAQ (from existing FAQs)
  - **Call request**: Request a callback — select preferred time
- **Components needed**:
  - **Existing**: `ChatInterface`, FAQ components
  - **New**: `SupportTicketList`, `CallbackRequestForm`
- **API endpoints**:
  - `GET /api/portal/support/tickets` → tickets
  - `POST /api/portal/support/tickets` → create ticket
  - `POST /api/portal/support/callback` → request callback
  - Existing chat and FAQ endpoints
- **Database tables**: `messages`, `chatConversations` (existing), `supportTickets` (new)
- **AI agents**: CustomerSupportAgent (initial response), HumanEscalationAgent (escalation), InboundResponseAgent
- **Real-time**: `portal:{userId}:support-message`
- **User interactions**: Chat, file ticket, search FAQ, request callback
- **Mobile**: Chat-first experience

---

### Page: Account Settings
- **Route**: `/portal/settings`
- **Purpose**: Manage account — update contact info, change password, notification preferences, communication preferences.
- **Status**: ✅ Built → 🔄 Enhance
- **UI Layout**:
  - **Profile section**: Name, email, phone, address — editable
  - **Password section**: Change password
  - **Notification preferences**: Toggle email/SMS notifications for payments, documents, claims, marketing
  - **Communication preferences**: Preferred contact method, best times to reach
- **Components needed**: Existing settings components + `NotificationPreferences`, `CommunicationPreferences`
- **API endpoints**: Existing user update endpoints + new preference endpoints
- **Database tables**: `users` (existing), `userPreferences` (new)
- **AI agents**: ClientPortalAgent
- **Real-time**: Not needed
- **User interactions**: Edit profile, change password, toggle notifications
- **Mobile**: Standard form layout

---

### Page: Referral Center
- **Route**: `/portal/referrals`
- **Purpose**: Refer friends and family. Track referral status, earn rewards.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Referral form**: Friend's name, email, phone, coverage interest
  - **Referral tracker**: Past referrals with status (sent/contacted/quoted/closed), reward status
  - **Rewards summary**: Total rewards earned, pending rewards
  - **Share tools**: Copy referral link, share via email/SMS/social
- **Components needed**:
  - **New**: `ReferralForm`, `ReferralTracker`, `RewardsSummary`, `ShareTools`
- **API endpoints**:
  - `POST /api/portal/referrals` → submit referral
  - `GET /api/portal/referrals` → referral history
  - `GET /api/portal/referrals/rewards` → rewards summary
- **Database tables**: `referrals` (new), `referralRewards` (new)
- **AI agents**: RetentionAgent (referral campaigns), LeadIntakeAgent (referral becomes lead)
- **Real-time**: `portal:{userId}:referral-update`
- **User interactions**: Submit referral, share link, track status, view rewards
- **Mobile**: Quick referral form, share via native share sheet

**Client Portal total pages: 8**

---

## 2.8 ⚙️ ADMIN LOUNGE

**Purpose**: System administration — site settings, user management, system health, content management, and operational controls.

**Route prefix**: `/admin/*`
**Required role**: `system_admin` or `owner`

---

### Page: Admin Dashboard
- **Route**: `/admin/dashboard`
- **Purpose**: System overview — server health, user stats, recent submissions, error alerts.
- **Status**: ✅ Built → 🔄 Enhance
- **UI Layout**:
  - **Top cards**: Total users, active sessions, quote requests (today), error count (24h)
  - **Recent submissions**: Latest quote requests, contact messages, job applications
  - **System health**: Server uptime, DB connection pool, memory usage, API response times
  - **Quick links**: Manage content, view errors, user management
- **Components needed**: Existing admin dashboard + `SystemHealthMonitor`
- **API endpoints**: Existing + `GET /api/admin/system/health`
- **Database tables**: All tables (read), `systemLogs` (new)
- **AI agents**: ErrorRecoveryAgent, SecurityAgent
- **Real-time**: `admin:system:health`
- **User interactions**: View stats, click to drill into any section
- **Mobile**: Card layout

---

### Page: User Management
- **Route**: `/admin/users`
- **Purpose**: Manage all user accounts — create, edit, deactivate, assign roles, reset passwords.
- **Status**: 🔨 Build
- **UI Layout**:
  - **User table**: Name, email, role, status (active/inactive), created date, last login, actions
  - **User detail/edit modal**: All fields, role assignment, deactivate/reactivate, reset password, 2FA status
  - **Create user form**: Invite new user with role assignment
  - **Bulk actions**: Deactivate, change role, export
- **Components needed**:
  - **New**: `UserTable`, `UserEditModal`, `CreateUserForm`, `RoleSelector`
- **API endpoints**:
  - `GET /api/admin/users?page=1&role=all` → users
  - `POST /api/admin/users` → create user
  - `PUT /api/admin/users/:id` → update user
  - `PUT /api/admin/users/:id/role` → change role
  - `POST /api/admin/users/:id/reset-password` → reset password
  - `PUT /api/admin/users/:id/deactivate` → deactivate
- **Database tables**: `users`, `sessions` (existing)
- **AI agents**: SecurityAgent (audit)
- **Real-time**: Not needed
- **User interactions**: CRUD on users, assign roles, reset passwords, deactivate
- **Mobile**: User list with basic actions

---

### Page: Submissions
- **Route**: `/admin/submissions`
- **Purpose**: View all inbound submissions — quote requests, contact messages, job applications, guide requests.
- **Status**: ✅ Built
- **Components needed**: Existing
- **Database tables**: `quoteRequests`, `contactMessages`, `jobApplications`, `guideRequests` (existing)
- **Mobile**: List view

---

### Page: Content Management
- **Route**: `/admin/content` (+ `/admin/content/blog`, `/admin/content/faqs`, `/admin/content/pages`)
- **Purpose**: Create and manage blog posts, FAQs, and static pages.
- **Status**: ✅ Built
- **Components needed**: Existing
- **Database tables**: `blogPosts`, `faqs`, `pages`, `contentRevisions` (existing)
- **Mobile**: Not prioritized

---

### Page: Media Library
- **Route**: `/admin/images` + `/admin/videos`
- **Purpose**: Manage uploaded images and videos.
- **Status**: ✅ Built
- **Mobile**: Not prioritized

---

### Page: Site Settings
- **Route**: `/admin/settings`
- **Purpose**: Configure site-wide settings — company info, branding, SEO defaults, feature toggles.
- **Status**: ✅ Built
- **Database tables**: `siteSettings` (existing)
- **Mobile**: Not prioritized

---

### Page: Testimonials
- **Route**: `/admin/testimonials`
- **Purpose**: Manage client testimonials displayed on the public site.
- **Status**: ✅ Built
- **Database tables**: `testimonials` (existing)

---

### Page: Newsletter Management
- **Route**: `/admin/newsletter`
- **Purpose**: Manage newsletter subscribers.
- **Status**: ✅ Built
- **Database tables**: `newsletterSubscribers` (existing)

---

### Page: System Logs
- **Route**: `/admin/logs`
- **Purpose**: View system logs, error logs, API request logs, and agent activity logs. Searchable and filterable.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Log viewer**: Scrollable log entries with severity (info/warn/error), timestamp, source, message
  - **Filters**: Severity, source, date range, search text
  - **Error detail**: Click error to see full stack trace and context
- **Components needed**:
  - **New**: `LogViewer`, `LogFilters`, `ErrorDetailModal`
- **API endpoints**:
  - `GET /api/admin/logs?severity=error&source=api&page=1` → logs
- **Database tables**: `systemLogs` (new)
- **AI agents**: ErrorRecoveryAgent (error context)
- **Real-time**: `admin:logs:new` (live tail)
- **User interactions**: Search, filter, view detail, export logs
- **Mobile**: Not prioritized

---

### Page: Integration Status
- **Route**: `/admin/integrations`
- **Purpose**: View status of all external integrations — Gmail, Google Calendar, Google Sheets, and future integrations (Twilio, Stripe, etc.). Test connections, view error rates, manage credentials.
- **Status**: 🔨 Build
- **UI Layout**:
  - **Integration cards**: Each integration — name, status (connected/error/disconnected), last sync, error rate
  - **Detail view**: Connection test button, recent sync log, credential management, webhook URL display
- **Components needed**:
  - **New**: `IntegrationCard`, `IntegrationDetailView`, `ConnectionTester`
- **API endpoints**:
  - `GET /api/admin/integrations` → all integrations with status
  - `POST /api/admin/integrations/:name/test` → test connection
  - `PUT /api/admin/integrations/:name/credentials` → update credentials
- **Database tables**: `integrationConfigs` (new)
- **AI agents**: ErrorRecoveryAgent
- **Real-time**: `admin:integration:status-change`
- **User interactions**: View status, test connections, update credentials, enable/disable integrations
- **Mobile**: Status view only

---

### Existing admin pages: Analytics, Products, Avatar Council, Agent Ops — all ✅ Built.

**Admin Lounge total pages: 12+**

---

## PAGE COUNT SUMMARY

| Lounge | Pages | Built | Build | Enhance |
|--------|-------|-------|-------|---------|
| 🧠 AI Agent Lounge | 8 | 0 | 7 | 1 |
| 👥 Agent Lounge | 20 | 10 | 4 | 6 |
| 📊 Manager Lounge | 6 | 0 | 6 | 0 |
| 🏢 Executive Lounge | 4 | 0 | 4 | 0 |
| 💼 CRM Lounge | 5 | 0 | 5 | 0 |
| 📣 Marketing Lounge | 6 | 0 | 5 | 1 |
| 👤 Client Portal | 8 | 4 | 2 | 2 |
| ⚙️ Admin Lounge | 12 | 8 | 2 | 2 |
| **Total** | **69** | **22** | **35** | **12** |

*Note: With sub-pages (study center sub-pages, content sub-pages, product sub-pages on public site), total reaches 82+.*

---

# 3. DATABASE EXPANSION

## 3.1 Existing Tables (No Changes Needed)

These tables are already built and functional:
- `users`, `sessions` — Auth
- `policies`, `documents`, `messages`, `notifications`, `billingHistory` — Portal
- `leads`, `leadActivities`, `siteSettings`, `testimonials`, `newsletterSubscribers` — CRM
- `blogPosts`, `faqs`, `pages`, `contentRevisions` — Content
- `agentTrainingProgress`, `agentAssessmentResults`, `agentSimulationResults`, `agentCertificates`, `agentXpTransactions` — Training
- `chatConversations`, `chatParticipants`, `chatMessages` — Chat
- `aiAvatars`, `avatarSessions`, `avatarMessages`, `debateSessions`, `avatarLogs`, `avatarKnowledgeBases`, `knowledgeDocuments`, `knowledgeChunks` — Avatar Council
- `quoteRequests`, `contactMessages`, `jobApplications`, `guideRequests` — Other

## 3.2 Migrations to Existing Tables

### `users` — Add role and 2FA fields
```sql
ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'sales_agent';
-- Possible values: 'owner', 'system_admin', 'agency_manager', 'sales_agent', 'marketing_staff', 'client', 'investor'
ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
ALTER TABLE users ADD COLUMN timezone VARCHAR(100) DEFAULT 'America/Chicago';
```

### `leads` — Add pipeline fields
```sql
ALTER TABLE leads ADD COLUMN close_probability INTEGER DEFAULT 0; -- 0-100
ALTER TABLE leads ADD COLUMN expected_close_date DATE;
ALTER TABLE leads ADD COLUMN lead_score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN enrichment_data JSONB;
ALTER TABLE leads ADD COLUMN tags TEXT[]; -- flexible tagging
```

## 3.3 New Tables

### Agent Performance & Goals
```sql
CREATE TABLE agent_performance_snapshots (
  id SERIAL PRIMARY KEY,
  agent_user_id INTEGER NOT NULL REFERENCES users(id),
  period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  leads_assigned INTEGER DEFAULT 0,
  leads_contacted INTEGER DEFAULT 0,
  appointments_set INTEGER DEFAULT 0,
  policies_sold INTEGER DEFAULT 0,
  premium_sold DECIMAL(12,2) DEFAULT 0,
  commission_earned DECIMAL(12,2) DEFAULT 0,
  calls_made INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  close_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(agent_user_id, period_type, period_start)
);
CREATE INDEX idx_perf_agent_period ON agent_performance_snapshots(agent_user_id, period_type, period_start);

CREATE TABLE agent_goals (
  id SERIAL PRIMARY KEY,
  agent_user_id INTEGER NOT NULL REFERENCES users(id),
  metric VARCHAR(50) NOT NULL, -- 'premium_sold', 'policies_sold', 'calls_made', etc.
  target_value DECIMAL(12,2) NOT NULL,
  period_type VARCHAR(20) NOT NULL, -- 'weekly', 'monthly', 'quarterly'
  period_start DATE NOT NULL,
  current_value DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Appointments
```sql
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  agent_user_id INTEGER NOT NULL REFERENCES users(id),
  lead_id INTEGER REFERENCES leads(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location VARCHAR(500), -- physical address or video link
  type VARCHAR(50) NOT NULL, -- 'phone', 'video', 'in_person'
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'
  google_calendar_event_id VARCHAR(255),
  reminder_sent BOOLEAN DEFAULT false,
  notes TEXT,
  outcome TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_appt_agent ON appointments(agent_user_id, start_time);
CREATE INDEX idx_appt_lead ON appointments(lead_id);
```

### Quotes
```sql
CREATE TABLE quotes (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  agent_user_id INTEGER NOT NULL REFERENCES users(id),
  coverage_type VARCHAR(100) NOT NULL,
  coverage_amount DECIMAL(12,2) NOT NULL,
  term_years INTEGER,
  health_class VARCHAR(50),
  monthly_premium DECIMAL(10,2) NOT NULL,
  annual_premium DECIMAL(10,2) NOT NULL,
  carrier_name VARCHAR(255) NOT NULL,
  carrier_product VARCHAR(255),
  riders JSONB, -- array of rider objects
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'viewed', 'accepted', 'expired'
  pdf_url VARCHAR(500),
  sent_at TIMESTAMP,
  viewed_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_quotes_lead ON quotes(lead_id);
CREATE INDEX idx_quotes_agent ON quotes(agent_user_id);
```

### Commissions
```sql
CREATE TABLE commissions (
  id SERIAL PRIMARY KEY,
  agent_user_id INTEGER NOT NULL REFERENCES users(id),
  policy_id INTEGER REFERENCES policies(id),
  type VARCHAR(50) NOT NULL, -- 'first_year', 'renewal', 'bonus', 'override'
  amount DECIMAL(10,2) NOT NULL,
  rate DECIMAL(5,4), -- commission rate (e.g., 0.80 = 80%)
  premium_basis DECIMAL(10,2), -- premium amount commission was calculated on
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'paid'
  paid_at TIMESTAMP,
  pay_period VARCHAR(20), -- '2026-02' for monthly pay periods
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_comm_agent ON commissions(agent_user_id, status);
CREATE INDEX idx_comm_policy ON commissions(policy_id);
```

### Email System
```sql
CREATE TABLE email_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL, -- HTML with {{variable}} placeholders
  category VARCHAR(100), -- 'outreach', 'follow_up', 'nurture', 'onboarding', 'marketing'
  created_by INTEGER REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE email_sequences (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_event VARCHAR(100), -- event type that starts the sequence
  steps JSONB NOT NULL, -- array of { delay_days, template_id, subject_override }
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE email_sequence_enrollments (
  id SERIAL PRIMARY KEY,
  sequence_id INTEGER NOT NULL REFERENCES email_sequences(id),
  lead_id INTEGER NOT NULL REFERENCES leads(id),
  current_step INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'paused', 'unsubscribed'
  next_send_at TIMESTAMP,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
CREATE INDEX idx_enrollment_next ON email_sequence_enrollments(next_send_at) WHERE status = 'active';

CREATE TABLE emails_sent (
  id SERIAL PRIMARY KEY,
  to_email VARCHAR(255) NOT NULL,
  to_name VARCHAR(255),
  from_agent_id INTEGER REFERENCES users(id),
  lead_id INTEGER REFERENCES leads(id),
  template_id INTEGER REFERENCES email_templates(id),
  sequence_enrollment_id INTEGER REFERENCES email_sequence_enrollments(id),
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  external_id VARCHAR(255), -- SendGrid message ID
  sent_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_emails_lead ON emails_sent(lead_id);
CREATE INDEX idx_emails_agent ON emails_sent(from_agent_id);
```

### Automation Rules
```sql
CREATE TABLE automation_rules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_user_id INTEGER NOT NULL REFERENCES users(id),
  trigger_event VARCHAR(100) NOT NULL, -- EventType that triggers the rule
  conditions JSONB NOT NULL, -- array of { field, operator, value }
  actions JSONB NOT NULL, -- array of { type, params }
  is_active BOOLEAN DEFAULT true,
  last_fired_at TIMESTAMP,
  fire_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Claims
```sql
CREATE TABLE claims (
  id SERIAL PRIMARY KEY,
  policy_id INTEGER NOT NULL REFERENCES policies(id),
  claimant_user_id INTEGER NOT NULL REFERENCES users(id),
  claim_type VARCHAR(100) NOT NULL, -- 'death_benefit', 'accelerated_benefit', 'waiver_of_premium'
  description TEXT NOT NULL,
  amount_requested DECIMAL(12,2),
  amount_approved DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'submitted', -- 'submitted', 'acknowledged', 'in_review', 'approved', 'paid', 'denied'
  denial_reason TEXT,
  documents JSONB, -- array of { name, url, uploaded_at }
  submitted_at TIMESTAMP DEFAULT NOW(),
  acknowledged_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  decided_at TIMESTAMP,
  paid_at TIMESTAMP,
  assigned_to INTEGER REFERENCES users(id),
  notes TEXT
);
CREATE INDEX idx_claims_policy ON claims(policy_id);
CREATE INDEX idx_claims_user ON claims(claimant_user_id);
```

### Support Tickets
```sql
CREATE TABLE support_tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  subject VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100), -- 'billing', 'policy', 'claims', 'technical', 'other'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'waiting_on_client', 'resolved', 'closed'
  assigned_to INTEGER REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE support_ticket_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES support_tickets(id),
  sender_id INTEGER NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- internal notes not visible to client
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Referrals
```sql
CREATE TABLE referrals (
  id SERIAL PRIMARY KEY,
  referrer_user_id INTEGER NOT NULL REFERENCES users(id),
  referee_name VARCHAR(255) NOT NULL,
  referee_email VARCHAR(255),
  referee_phone VARCHAR(50),
  coverage_interest VARCHAR(255),
  status VARCHAR(50) DEFAULT 'submitted', -- 'submitted', 'contacted', 'quoted', 'closed_won', 'closed_lost'
  lead_id INTEGER REFERENCES leads(id), -- linked lead once created
  reward_amount DECIMAL(10,2),
  reward_status VARCHAR(50), -- 'pending', 'earned', 'paid'
  reward_paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_referrals_user ON referrals(referrer_user_id);
```

### Social Media
```sql
CREATE TABLE social_posts (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(50) NOT NULL, -- 'facebook', 'instagram', 'linkedin', 'google_business'
  content TEXT NOT NULL,
  media_urls JSONB, -- array of media URLs
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'published', 'failed'
  scheduled_for TIMESTAMP,
  published_at TIMESTAMP,
  external_post_id VARCHAR(255),
  engagement JSONB, -- { likes, comments, shares, clicks }
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE social_messages (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(50) NOT NULL,
  external_id VARCHAR(255) NOT NULL,
  direction VARCHAR(10) NOT NULL, -- 'inbound', 'outbound'
  sender_name VARCHAR(255),
  sender_id VARCHAR(255),
  message TEXT NOT NULL,
  responded BOOLEAN DEFAULT false,
  response TEXT,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Reviews & Reputation
```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(50) NOT NULL, -- 'google', 'yelp', 'bbb', 'facebook'
  external_id VARCHAR(255),
  reviewer_name VARCHAR(255),
  rating INTEGER NOT NULL, -- 1-5
  content TEXT,
  sentiment VARCHAR(20), -- 'positive', 'neutral', 'negative' (AI-classified)
  response TEXT,
  response_posted BOOLEAN DEFAULT false,
  response_posted_at TIMESTAMP,
  review_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Campaigns
```sql
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'email', 'social', 'multi_channel'
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
  budget DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  target_audience JSONB, -- segmentation criteria
  leads_generated INTEGER DEFAULT 0,
  revenue_attributed DECIMAL(12,2) DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Marketing Spend
```sql
CREATE TABLE marketing_spend (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id),
  channel VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Escalations
```sql
CREATE TABLE escalations (
  id SERIAL PRIMARY KEY,
  source_agent VARCHAR(100) NOT NULL, -- AI agent name that created escalation
  urgency VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  reason TEXT NOT NULL,
  context JSONB NOT NULL, -- event chain, related entities
  recommended_action TEXT,
  related_lead_id INTEGER REFERENCES leads(id),
  related_policy_id INTEGER REFERENCES policies(id),
  assigned_to INTEGER REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'dismissed'
  resolution_notes TEXT,
  resolved_by INTEGER REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_esc_status ON escalations(status, urgency);
```

### Coaching Notes
```sql
CREATE TABLE coaching_notes (
  id SERIAL PRIMARY KEY,
  manager_user_id INTEGER NOT NULL REFERENCES users(id),
  agent_user_id INTEGER NOT NULL REFERENCES users(id),
  note TEXT NOT NULL,
  category VARCHAR(100), -- 'strength', 'improvement', 'goal', 'general'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Call Recordings & Analysis
```sql
CREATE TABLE call_recordings (
  id SERIAL PRIMARY KEY,
  agent_user_id INTEGER NOT NULL REFERENCES users(id),
  lead_id INTEGER REFERENCES leads(id),
  duration_seconds INTEGER,
  recording_url VARCHAR(500),
  twilio_call_sid VARCHAR(255),
  direction VARCHAR(10), -- 'inbound', 'outbound'
  outcome VARCHAR(50), -- 'answered', 'voicemail', 'no_answer', 'busy'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE call_analysis (
  id SERIAL PRIMARY KEY,
  call_recording_id INTEGER NOT NULL REFERENCES call_recordings(id),
  transcript TEXT,
  summary TEXT,
  sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
  key_moments JSONB, -- array of { timestamp, type, description }
  objections_detected JSONB, -- array of objection strings
  coaching_suggestions JSONB, -- array of suggestion strings
  ai_score INTEGER, -- 1-100 overall call quality
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Revenue Forecasts
```sql
CREATE TABLE revenue_forecasts (
  id SERIAL PRIMARY KEY,
  forecast_date DATE NOT NULL,
  period_type VARCHAR(20) NOT NULL, -- 'monthly', 'quarterly', 'annual'
  period_label VARCHAR(20) NOT NULL, -- '2026-03', '2026-Q2', '2026'
  predicted_revenue DECIMAL(12,2) NOT NULL,
  confidence_low DECIMAL(12,2),
  confidence_high DECIMAL(12,2),
  assumptions JSONB,
  actual_revenue DECIMAL(12,2), -- filled in when period completes
  created_at TIMESTAMP DEFAULT NOW()
);
```

### AI Agent System Tables
```sql
CREATE TABLE event_bus_audit_log (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  source_agent VARCHAR(100),
  payload JSONB,
  payload_hash VARCHAR(64),
  processed_by JSONB, -- array of agent names that processed this event
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_ebal_type ON event_bus_audit_log(event_type, created_at);
CREATE INDEX idx_ebal_source ON event_bus_audit_log(source_agent, created_at);

CREATE TABLE agent_configurations (
  id SERIAL PRIMARY KEY,
  agent_name VARCHAR(100) NOT NULL UNIQUE,
  config JSONB NOT NULL, -- agent-specific configuration
  updated_by INTEGER REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE agent_errors (
  id SERIAL PRIMARY KEY,
  agent_name VARCHAR(100) NOT NULL,
  error_type VARCHAR(255),
  message TEXT NOT NULL,
  stack_trace TEXT,
  event_context JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_agent_errors ON agent_errors(agent_name, resolved, created_at);

CREATE TABLE dead_letter_queue (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  reason VARCHAR(255), -- 'no_handler', 'sla_exceeded', 'processing_error'
  retries INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'retried', 'dismissed'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE security_audit_log (
  id BIGSERIAL PRIMARY KEY,
  agent_name VARCHAR(100),
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  resource VARCHAR(255),
  result VARCHAR(20) NOT NULL, -- 'allowed', 'blocked', 'rate_limited'
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_sal_action ON security_audit_log(action, created_at);

CREATE TABLE analytics_snapshots (
  id SERIAL PRIMARY KEY,
  snapshot_type VARCHAR(50) NOT NULL, -- 'revenue', 'funnel', 'outreach', 'agent_performance'
  data JSONB NOT NULL,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### System & Config Tables
```sql
CREATE TABLE system_logs (
  id BIGSERIAL PRIMARY KEY,
  level VARCHAR(10) NOT NULL, -- 'info', 'warn', 'error', 'debug'
  source VARCHAR(100) NOT NULL, -- 'api', 'agent:LeadScoringAgent', 'bridge:gmail', etc.
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_logs_level ON system_logs(level, created_at);

CREATE TABLE integration_configs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE, -- 'gmail', 'google_calendar', 'twilio', 'stripe', etc.
  config JSONB NOT NULL, -- encrypted credentials and settings
  status VARCHAR(50) DEFAULT 'disconnected', -- 'connected', 'error', 'disconnected'
  last_sync_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scheduled_reports (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  report_type VARCHAR(100) NOT NULL,
  parameters JSONB NOT NULL,
  schedule VARCHAR(100) NOT NULL, -- cron expression or 'weekly', 'monthly'
  recipients JSONB NOT NULL, -- array of email addresses
  last_sent_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
  notification_email BOOLEAN DEFAULT true,
  notification_sms BOOLEAN DEFAULT true,
  notification_payments BOOLEAN DEFAULT true,
  notification_documents BOOLEAN DEFAULT true,
  notification_claims BOOLEAN DEFAULT true,
  notification_marketing BOOLEAN DEFAULT false,
  preferred_contact_method VARCHAR(50) DEFAULT 'email',
  preferred_contact_times JSONB, -- { morning: true, afternoon: true, evening: false }
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payment_methods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  stripe_customer_id VARCHAR(255) NOT NULL,
  stripe_payment_method_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'card', 'bank_account'
  last_four VARCHAR(4),
  brand VARCHAR(50), -- 'visa', 'mastercard', etc.
  is_default BOOLEAN DEFAULT false,
  auto_pay_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contact_relationships (
  id SERIAL PRIMARY KEY,
  contact_a_type VARCHAR(20) NOT NULL, -- 'lead', 'client'
  contact_a_id INTEGER NOT NULL,
  contact_b_type VARCHAR(20) NOT NULL,
  contact_b_id INTEGER NOT NULL,
  relationship_type VARCHAR(50) NOT NULL, -- 'spouse', 'parent', 'child', 'referral', 'sibling'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE import_history (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  row_count INTEGER NOT NULL,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  errors JSONB, -- array of { row, field, message }
  imported_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE executive_snapshots (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_revenue_ytd DECIMAL(12,2),
  monthly_recurring_revenue DECIMAL(12,2),
  active_policies INTEGER,
  retention_rate DECIMAL(5,2),
  growth_rate_mom DECIMAL(5,2),
  avg_policy_size DECIMAL(10,2),
  cost_per_acquisition DECIMAL(10,2),
  lifetime_customer_value DECIMAL(10,2),
  agent_productivity_index DECIMAL(5,2),
  data JSONB, -- additional metrics
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scripts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'cold_call', 'warm_lead', 'referral', 'follow_up', 'closing', 'objection'
  content TEXT NOT NULL, -- Markdown or structured JSON
  branching_logic JSONB, -- if/then tree
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 3.4 Relationships Diagram (Text-Based)

```
users (1) ──── (*) leads              (assignedTo)
users (1) ──── (*) policies           (userId - client)
users (1) ──── (*) appointments       (agent_user_id)
users (1) ──── (*) quotes             (agent_user_id)
users (1) ──── (*) commissions        (agent_user_id)
users (1) ──── (*) agent_goals        (agent_user_id)
users (1) ──── (*) agent_perf_snaps   (agent_user_id)
users (1) ──── (*) referrals          (referrer_user_id)
users (1) ──── (*) support_tickets    (user_id)
users (1) ──── (*) claims             (claimant_user_id)
users (1) ──── (*) payment_methods    (user_id)
users (1) ──── (1) user_preferences   (user_id)

leads (1) ──── (*) lead_activities    (leadId)
leads (1) ──── (*) quotes             (lead_id)
leads (1) ──── (*) appointments       (lead_id)
leads (1) ──── (*) emails_sent        (lead_id)
leads (1) ──── (*) email_seq_enrolls  (lead_id)
leads (1) ──── (*) referrals          (lead_id - converted referral)
leads (1) ──── (*) call_recordings    (lead_id)
leads (1) ──── (*) escalations        (related_lead_id)

policies (1) ── (*) commissions       (policy_id)
policies (1) ── (*) claims            (policy_id)
policies (1) ── (*) documents         (policy reference)
policies (1) ── (*) billing_history   (policy reference)

email_templates (1) ── (*) emails_sent       (template_id)
email_sequences (1) ── (*) email_seq_enrolls (sequence_id)
call_recordings (1) ── (1) call_analysis     (call_recording_id)
support_tickets (1) ── (*) ticket_messages   (ticket_id)
campaigns (1) ──── (*) marketing_spend       (campaign_id)
```

---

# 4. NEW API ENDPOINTS

## 4.1 AI Agent Lounge APIs

| Method | Route | Auth | Request | Response | Agent(s) |
|--------|-------|------|---------|----------|----------|
| GET | `/api/ai/agents` | owner/admin | — | `{ agents: AgentStatus[] }` | All |
| GET | `/api/ai/agents/:id` | owner/admin | — | `AgentDetail` | Specific |
| GET | `/api/ai/agents/:id/events` | owner/admin | `?page&limit` | `{ events: EventLog[], total }` | Specific |
| PUT | `/api/ai/agents/:id/config` | owner | `{ config: {} }` | `{ success }` | Specific |
| POST | `/api/ai/agents/:id/restart` | owner | — | `{ success }` | Specific |
| POST | `/api/ai/agents/:id/pause` | owner | — | `{ success }` | Specific |
| POST | `/api/ai/agents/:id/resume` | owner | — | `{ success }` | Specific |
| GET | `/api/ai/event-bus/stats` | owner/admin | — | `{ totalEvents, eventsPerMinute, queueDepth }` | OrchestratorAgent |
| GET | `/api/ai/event-bus/stream` | owner/admin | SSE | `EventStream` | OrchestratorAgent |
| POST | `/api/ai/agents/:id/test` | owner | `{ testEvent: {} }` | `{ result, timing }` | Specific |
| GET | `/api/ai/health` | owner/admin | — | `{ agents: HealthCheck[] }` | All |
| GET | `/api/ai/logs` | owner/admin | `?agent&level&from&to&page&limit` | `{ logs: LogEntry[], total }` | All |
| POST | `/api/ai/2fa/setup` | owner | — | `{ qrCode, secret }` | SecurityAgent |
| POST | `/api/ai/2fa/verify` | owner | `{ token: string }` | `{ verified: boolean }` | SecurityAgent |
| DELETE | `/api/ai/2fa` | owner | `{ token: string }` | `{ success }` | SecurityAgent |

## 4.2 Agent Lounge APIs (Sales Agent)

| Method | Route | Auth | Request | Response | Agent(s) |
|--------|-------|------|---------|----------|----------|
| GET | `/api/agent/dashboard` | agent+ | — | `{ stats, todayTasks, recentLeads }` | RealTimeAnalyticsAgent |
| GET | `/api/agent/leads` | agent+ | `?status&score&page&limit&sort` | `{ leads: Lead[], total }` | LeadScoringAgent |
| GET | `/api/agent/leads/:id` | agent+ | — | `LeadDetail` | DataEnrichmentAgent |
| PUT | `/api/agent/leads/:id` | agent+ | `{ status?, notes?, assignedTo? }` | `{ lead: Lead }` | LeadIntakeAgent |
| POST | `/api/agent/leads/:id/call` | agent+ | `{ phone: string }` | `{ callSid, status }` | DialerAgent |
| POST | `/api/agent/leads/:id/sms` | agent+ | `{ message: string }` | `{ messageSid }` | SmsMessagingAgent |
| POST | `/api/agent/leads/:id/email` | agent+ | `{ subject, body, templateId? }` | `{ emailId }` | EmailOutreachAgent |
| GET | `/api/agent/leads/:id/timeline` | agent+ | — | `{ events: TimelineEvent[] }` | ConversationMemoryAgent |
| GET | `/api/agent/leads/:id/ai-brief` | agent+ | — | `{ summary, suggestedActions, talkingPoints }` | AiSalesAgent |
| POST | `/api/agent/leads/:id/quote` | agent+ | `{ lineOfBusiness, coverageDetails }` | `{ quoteId, premium, carrier }` | PolicyRecommendationAgent |
| GET | `/api/agent/appointments` | agent+ | `?date&status` | `{ appointments: Appointment[] }` | AppointmentAgent |
| POST | `/api/agent/appointments` | agent+ | `{ leadId, datetime, type, notes }` | `{ appointment }` | AppointmentAgent |
| PUT | `/api/agent/appointments/:id` | agent+ | `{ datetime?, status?, notes? }` | `{ appointment }` | AppointmentAgent |
| DELETE | `/api/agent/appointments/:id` | agent+ | — | `{ success }` | AppointmentAgent |
| GET | `/api/agent/pipeline` | agent+ | `?stage` | `{ pipeline: PipelineStage[] }` | LeadScoringAgent |
| PUT | `/api/agent/pipeline/:leadId/stage` | agent+ | `{ stage: string }` | `{ lead }` | LeadScoringAgent |
| GET | `/api/agent/sequences` | agent+ | — | `{ sequences: Sequence[] }` | OutreachOrchestrationAgent |
| POST | `/api/agent/sequences/:id/enroll` | agent+ | `{ leadId }` | `{ enrollment }` | OutreachOrchestrationAgent |
| DELETE | `/api/agent/sequences/:id/enroll/:leadId` | agent+ | — | `{ success }` | OutreachOrchestrationAgent |
| GET | `/api/agent/calls/active` | agent+ | — | `{ calls: ActiveCall[] }` | DialerAgent |
| GET | `/api/agent/calls/:id/coaching` | agent+ | — | `{ suggestions: CoachingSuggestion[] }` | CallCoachingAgent |
| POST | `/api/agent/calls/:id/disposition` | agent+ | `{ outcome, notes, nextAction }` | `{ success }` | DialerAgent |
| GET | `/api/agent/commissions` | agent+ | `?period` | `{ commissions: Commission[], total }` | CommissionAgent |
| GET | `/api/agent/performance` | agent+ | `?period` | `{ metrics: PerformanceMetrics }` | AgentPerformanceAgent |
| GET | `/api/agent/scripts/:type` | agent+ | `?leadData` | `{ script: string, objections: Objection[] }` | AiSalesAgent |
| POST | `/api/agent/escalate` | agent+ | `{ leadId, reason, priority }` | `{ escalationId }` | HumanEscalationAgent |

## 4.3 Manager Lounge APIs

| Method | Route | Auth | Request | Response | Agent(s) |
|--------|-------|------|---------|----------|----------|
| GET | `/api/manager/dashboard` | manager+ | — | `{ teamStats, pipelineOverview, alerts }` | RealTimeAnalyticsAgent, AgentPerformanceAgent |
| GET | `/api/manager/team` | manager+ | — | `{ agents: AgentProfile[] }` | AgentPerformanceAgent |
| GET | `/api/manager/team/:agentId/stats` | manager+ | `?period` | `{ performance: AgentStats }` | AgentPerformanceAgent |
| GET | `/api/manager/team/:agentId/calls` | manager+ | `?from&to&page&limit` | `{ calls: CallRecord[] }` | CallCoachingAgent |
| GET | `/api/manager/team/:agentId/calls/:callId/analysis` | manager+ | — | `{ transcript, sentiment, coaching }` | CallCoachingAgent |
| GET | `/api/manager/pipeline` | manager+ | `?agent&stage` | `{ pipeline: PipelineView }` | LeadScoringAgent |
| GET | `/api/manager/leads/distribution` | manager+ | — | `{ distribution: LeadDistribution[] }` | OrchestratorAgent |
| POST | `/api/manager/leads/reassign` | manager+ | `{ leadIds: string[], toAgentId }` | `{ success, count }` | OrchestratorAgent |
| GET | `/api/manager/sequences` | manager+ | — | `{ sequences: SequencePerformance[] }` | OutreachOrchestrationAgent |
| PUT | `/api/manager/sequences/:id` | manager+ | `{ name?, steps?, active? }` | `{ sequence }` | OutreachOrchestrationAgent |
| POST | `/api/manager/sequences` | manager+ | `{ name, steps, triggers }` | `{ sequence }` | OutreachOrchestrationAgent |
| GET | `/api/manager/compliance` | manager+ | — | `{ issues: ComplianceIssue[], score }` | ComplianceAgent |
| GET | `/api/manager/escalations` | manager+ | `?status&priority` | `{ escalations: Escalation[] }` | HumanEscalationAgent |
| PUT | `/api/manager/escalations/:id` | manager+ | `{ status, resolution?, assignTo? }` | `{ escalation }` | HumanEscalationAgent |
| GET | `/api/manager/coaching/queue` | manager+ | — | `{ calls: CoachableCall[] }` | CallCoachingAgent |
| POST | `/api/manager/coaching/:callId/feedback` | manager+ | `{ feedback, rating, actionItems }` | `{ success }` | CallCoachingAgent |
| GET | `/api/manager/reports/daily` | manager+ | `?date` | `{ report: DailyReport }` | RealTimeAnalyticsAgent |
| GET | `/api/manager/reports/weekly` | manager+ | `?week` | `{ report: WeeklyReport }` | RealTimeAnalyticsAgent |
| POST | `/api/manager/goals` | manager+ | `{ agentId, metric, target, period }` | `{ goal }` | AgentPerformanceAgent |
| GET | `/api/manager/leaderboard` | manager+ | `?period&metric` | `{ rankings: Ranking[] }` | AgentPerformanceAgent |

## 4.4 Executive Lounge APIs

| Method | Route | Auth | Request | Response | Agent(s) |
|--------|-------|------|---------|----------|----------|
| GET | `/api/executive/dashboard` | exec+ | — | `{ revenue, growth, forecasts, topMetrics }` | RevenueForecastAgent, RealTimeAnalyticsAgent |
| GET | `/api/executive/revenue` | exec+ | `?period&granularity` | `{ revenue: RevenueData[] }` | RevenueForecastAgent |
| GET | `/api/executive/revenue/forecast` | exec+ | `?months` | `{ forecast: ForecastPoint[] }` | RevenueForecastAgent |
| GET | `/api/executive/revenue/breakdown` | exec+ | `?by=carrier|product|agent` | `{ breakdown: BreakdownItem[] }` | RevenueForecastAgent |
| GET | `/api/executive/kpis` | exec+ | `?period` | `{ kpis: KPI[] }` | RealTimeAnalyticsAgent |
| GET | `/api/executive/conversion-funnel` | exec+ | `?period` | `{ funnel: FunnelStage[] }` | RealTimeAnalyticsAgent |
| GET | `/api/executive/agents/ranking` | exec+ | `?metric&period&limit` | `{ rankings: AgentRanking[] }` | AgentPerformanceAgent |
| GET | `/api/executive/retention` | exec+ | `?cohort` | `{ retention: RetentionData }` | RetentionAgent |
| GET | `/api/executive/compliance/summary` | exec+ | — | `{ score, issues, trend }` | ComplianceAgent |
| GET | `/api/executive/marketing/roi` | exec+ | `?period` | `{ roi: MarketingROI }` | RealTimeAnalyticsAgent |
| GET | `/api/executive/reports/custom` | exec+ | `{ metrics[], period, groupBy }` | `{ report: CustomReport }` | RealTimeAnalyticsAgent |
| POST | `/api/executive/reports/export` | exec+ | `{ reportId, format: 'pdf'|'csv' }` | `{ downloadUrl }` | RealTimeAnalyticsAgent |
| GET | `/api/executive/investor/summary` | investor+ | — | `{ summary: InvestorSummary }` | RevenueForecastAgent |

## 4.5 CRM Lounge APIs

| Method | Route | Auth | Request | Response | Agent(s) |
|--------|-------|------|---------|----------|----------|
| GET | `/api/crm/leads` | agent+ | `?status&source&score&assignedTo&page&limit&sort&search` | `{ leads: Lead[], total, facets }` | LeadScoringAgent |
| POST | `/api/crm/leads` | agent+ | `{ firstName, lastName, email, phone, source, lineOfBusiness }` | `{ lead: Lead }` | LeadIntakeAgent |
| GET | `/api/crm/leads/:id` | agent+ | — | `{ lead: LeadFull }` | DataEnrichmentAgent, ConversationMemoryAgent |
| PUT | `/api/crm/leads/:id` | agent+ | `Partial<Lead>` | `{ lead: Lead }` | LeadIntakeAgent |
| DELETE | `/api/crm/leads/:id` | manager+ | — | `{ success }` | ComplianceAgent |
| GET | `/api/crm/leads/:id/enrichment` | agent+ | — | `{ enrichment: EnrichmentData }` | DataEnrichmentAgent |
| POST | `/api/crm/leads/:id/enrich` | agent+ | — | `{ enrichment: EnrichmentData }` | DataEnrichmentAgent |
| GET | `/api/crm/leads/:id/activity` | agent+ | `?type&page&limit` | `{ activities: Activity[], total }` | ConversationMemoryAgent |
| POST | `/api/crm/leads/:id/notes` | agent+ | `{ content, type? }` | `{ note: Note }` | ConversationMemoryAgent |
| GET | `/api/crm/leads/:id/documents` | agent+ | — | `{ documents: Document[] }` | ApplicationCompletionAgent |
| POST | `/api/crm/leads/:id/documents` | agent+ | `multipart/form-data` | `{ document: Document }` | ApplicationCompletionAgent |
| GET | `/api/crm/leads/:id/policies` | agent+ | — | `{ policies: Policy[] }` | — |
| GET | `/api/crm/leads/:id/communications` | agent+ | `?channel` | `{ messages: Message[] }` | ConversationMemoryAgent |
| GET | `/api/crm/pipeline` | agent+ | `?assignedTo` | `{ stages: PipelineStage[] }` | LeadScoringAgent |
| PUT | `/api/crm/pipeline/move` | agent+ | `{ leadId, fromStage, toStage }` | `{ success }` | LeadScoringAgent |
| GET | `/api/crm/tags` | agent+ | — | `{ tags: Tag[] }` | — |
| POST | `/api/crm/leads/:id/tags` | agent+ | `{ tagIds: string[] }` | `{ success }` | — |
| GET | `/api/crm/segments` | manager+ | — | `{ segments: Segment[] }` | LeadScoringAgent |
| POST | `/api/crm/segments` | manager+ | `{ name, rules: FilterRule[] }` | `{ segment }` | LeadScoringAgent |
| GET | `/api/crm/import/template` | manager+ | `?type` | CSV file download | — |
| POST | `/api/crm/import` | manager+ | `multipart/form-data` | `{ importId, count, errors }` | LeadIntakeAgent |
| POST | `/api/crm/export` | manager+ | `{ filters, format }` | `{ downloadUrl }` | ComplianceAgent |

## 4.6 Marketing Lounge APIs

| Method | Route | Auth | Request | Response | Agent(s) |
|--------|-------|------|---------|----------|----------|
| GET | `/api/marketing/dashboard` | marketing+ | — | `{ campaignStats, contentQueue, socialMetrics }` | RealTimeAnalyticsAgent |
| GET | `/api/marketing/campaigns` | marketing+ | `?status&type&page&limit` | `{ campaigns: Campaign[], total }` | — |
| POST | `/api/marketing/campaigns` | marketing+ | `{ name, type, budget, startDate, endDate, channels }` | `{ campaign }` | — |
| PUT | `/api/marketing/campaigns/:id` | marketing+ | `Partial<Campaign>` | `{ campaign }` | — |
| GET | `/api/marketing/campaigns/:id/analytics` | marketing+ | `?period` | `{ analytics: CampaignAnalytics }` | RealTimeAnalyticsAgent |
| GET | `/api/marketing/content` | marketing+ | `?status&type&page&limit` | `{ content: Content[], total }` | ContentGenerationAgent |
| POST | `/api/marketing/content/generate` | marketing+ | `{ type, topic, tone, platform, keywords }` | `{ content: GeneratedContent }` | ContentGenerationAgent |
| PUT | `/api/marketing/content/:id` | marketing+ | `{ body?, status?, scheduledAt? }` | `{ content }` | ContentGenerationAgent |
| POST | `/api/marketing/content/:id/approve` | manager+ | — | `{ content }` | ComplianceAgent |
| POST | `/api/marketing/social/post` | marketing+ | `{ platforms[], content, media?, scheduledAt? }` | `{ posts: SocialPost[] }` | SocialPostingAgent |
| GET | `/api/marketing/social/posts` | marketing+ | `?platform&status&page&limit` | `{ posts: SocialPost[], total }` | SocialPostingAgent |
| GET | `/api/marketing/social/analytics` | marketing+ | `?platform&period` | `{ analytics: SocialAnalytics }` | SocialPostingAgent |
| GET | `/api/marketing/social/calendar` | marketing+ | `?month` | `{ calendar: CalendarEntry[] }` | SocialPostingAgent |
| GET | `/api/marketing/reputation` | marketing+ | — | `{ score, reviews: Review[], trend }` | ReputationAgent |
| POST | `/api/marketing/reputation/respond` | marketing+ | `{ reviewId, response }` | `{ success }` | ReputationAgent |
| POST | `/api/marketing/reputation/request` | marketing+ | `{ clientIds: string[], template? }` | `{ sent: number }` | ReputationAgent |
| GET | `/api/marketing/email-templates` | marketing+ | — | `{ templates: EmailTemplate[] }` | ContentGenerationAgent |
| POST | `/api/marketing/email-templates` | marketing+ | `{ name, subject, body, variables }` | `{ template }` | ContentGenerationAgent |
| PUT | `/api/marketing/email-templates/:id` | marketing+ | `Partial<EmailTemplate>` | `{ template }` | ContentGenerationAgent |
| GET | `/api/marketing/landing-pages` | marketing+ | — | `{ pages: LandingPage[] }` | — |
| GET | `/api/marketing/spend` | manager+ | `?period&campaign` | `{ spend: SpendData[] }` | RealTimeAnalyticsAgent |
| GET | `/api/marketing/attribution` | marketing+ | `?period` | `{ attribution: AttributionData[] }` | RealTimeAnalyticsAgent |

## 4.7 Client Portal APIs

| Method | Route | Auth | Request | Response | Agent(s) |
|--------|-------|------|---------|----------|----------|
| GET | `/api/portal/dashboard` | client | — | `{ policies, upcomingPayments, recentActivity }` | ClientPortalAgent |
| GET | `/api/portal/policies` | client | — | `{ policies: ClientPolicy[] }` | ClientPortalAgent |
| GET | `/api/portal/policies/:id` | client | — | `{ policy: PolicyDetail }` | ClientPortalAgent |
| GET | `/api/portal/policies/:id/documents` | client | — | `{ documents: Document[] }` | ClientPortalAgent |
| GET | `/api/portal/policies/:id/id-card` | client | — | PDF download | ClientPortalAgent |
| GET | `/api/portal/billing` | client | — | `{ history: BillingRecord[], upcoming: Payment[] }` | BillingAgent |
| POST | `/api/portal/billing/pay` | client | `{ policyId, amount, paymentMethodId }` | `{ paymentId, status }` | BillingAgent |
| GET | `/api/portal/billing/methods` | client | — | `{ methods: PaymentMethod[] }` | BillingAgent |
| POST | `/api/portal/billing/methods` | client | `{ type, token }` | `{ method: PaymentMethod }` | BillingAgent |
| DELETE | `/api/portal/billing/methods/:id` | client | — | `{ success }` | BillingAgent |
| POST | `/api/portal/claims` | client | `{ policyId, type, description, date, documents? }` | `{ claim: Claim }` | ClaimsAgent |
| GET | `/api/portal/claims` | client | — | `{ claims: Claim[] }` | ClaimsAgent |
| GET | `/api/portal/claims/:id` | client | — | `{ claim: ClaimDetail }` | ClaimsAgent |
| POST | `/api/portal/claims/:id/documents` | client | `multipart/form-data` | `{ document }` | ClaimsAgent |
| POST | `/api/portal/support/tickets` | client | `{ subject, message, category }` | `{ ticket: Ticket }` | CustomerSupportAgent |
| GET | `/api/portal/support/tickets` | client | — | `{ tickets: Ticket[] }` | CustomerSupportAgent |
| GET | `/api/portal/support/tickets/:id` | client | — | `{ ticket: TicketDetail, messages: TicketMessage[] }` | CustomerSupportAgent |
| POST | `/api/portal/support/tickets/:id/message` | client | `{ message }` | `{ message: TicketMessage }` | CustomerSupportAgent |
| POST | `/api/portal/support/chat` | client | `{ message }` | `{ response, suggestedActions }` | CustomerSupportAgent |
| GET | `/api/portal/profile` | client | — | `{ profile: ClientProfile }` | ClientPortalAgent |
| PUT | `/api/portal/profile` | client | `Partial<ClientProfile>` | `{ profile }` | ClientPortalAgent |
| POST | `/api/portal/referral` | client | `{ name, email, phone, lineOfBusiness? }` | `{ referralId }` | RetentionAgent |
| GET | `/api/portal/referrals` | client | — | `{ referrals: Referral[] }` | RetentionAgent |
| POST | `/api/portal/quote` | public | `{ firstName, lastName, email, phone, lineOfBusiness, details }` | `{ quoteId, estimatedCallback }` | LeadIntakeAgent |

## 4.8 Admin Lounge APIs

| Method | Route | Auth | Request | Response | Agent(s) |
|--------|-------|------|---------|----------|----------|
| GET | `/api/admin/users` | admin+ | `?role&status&page&limit&search` | `{ users: User[], total }` | SecurityAgent |
| POST | `/api/admin/users` | admin+ | `{ email, name, role, password }` | `{ user: User }` | SecurityAgent |
| PUT | `/api/admin/users/:id` | admin+ | `Partial<User>` | `{ user }` | SecurityAgent |
| DELETE | `/api/admin/users/:id` | owner | — | `{ success }` | SecurityAgent |
| PUT | `/api/admin/users/:id/role` | owner | `{ role: Role }` | `{ user }` | SecurityAgent |
| POST | `/api/admin/users/:id/reset-password` | admin+ | — | `{ tempPassword }` | SecurityAgent |
| GET | `/api/admin/roles` | admin+ | — | `{ roles: RoleDefinition[] }` | SecurityAgent |
| GET | `/api/admin/audit-log` | admin+ | `?userId&action&from&to&page&limit` | `{ logs: AuditEntry[], total }` | SecurityAgent |
| GET | `/api/admin/settings` | admin+ | — | `{ settings: SystemSettings }` | — |
| PUT | `/api/admin/settings` | owner | `Partial<SystemSettings>` | `{ settings }` | — |
| GET | `/api/admin/integrations` | admin+ | — | `{ integrations: Integration[] }` | — |
| PUT | `/api/admin/integrations/:id` | owner | `{ enabled, config }` | `{ integration }` | — |
| POST | `/api/admin/integrations/:id/test` | admin+ | — | `{ success, latency }` | — |
| GET | `/api/admin/system/health` | admin+ | — | `{ db, redis, websocket, agents, uptime }` | SecurityAgent |
| GET | `/api/admin/system/metrics` | admin+ | — | `{ cpu, memory, requests, errors }` | RealTimeAnalyticsAgent |
| POST | `/api/admin/backup` | owner | — | `{ backupId, size, url }` | — |
| GET | `/api/admin/backups` | owner | — | `{ backups: Backup[] }` | — |
| POST | `/api/admin/backups/:id/restore` | owner | `{ confirm: true }` | `{ jobId }` | — |
| GET | `/api/admin/email-templates` | admin+ | — | `{ templates: SystemTemplate[] }` | — |
| PUT | `/api/admin/email-templates/:id` | admin+ | `{ subject?, body? }` | `{ template }` | — |
| GET | `/api/admin/carriers` | admin+ | — | `{ carriers: Carrier[] }` | — |
| POST | `/api/admin/carriers` | admin+ | `{ name, apiEndpoint, credentials, products }` | `{ carrier }` | — |
| PUT | `/api/admin/carriers/:id` | admin+ | `Partial<Carrier>` | `{ carrier }` | — |
| GET | `/api/admin/commission-rules` | admin+ | — | `{ rules: CommissionRule[] }` | CommissionAgent |
| POST | `/api/admin/commission-rules` | admin+ | `{ carrierId, product, rate, tiers }` | `{ rule }` | CommissionAgent |
| PUT | `/api/admin/commission-rules/:id` | admin+ | `Partial<CommissionRule>` | `{ rule }` | CommissionAgent |
| POST | `/api/admin/db/migrate` | owner | `{ confirm: true }` | `{ applied: string[] }` | — |
| GET | `/api/admin/db/migrations` | owner | — | `{ migrations: Migration[] }` | — |

---


# 5. ROLE-BASED ACCESS CONTROL (RBAC)

## 5.1 Role Definitions

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ROLE HIERARCHY                               │
│                                                                     │
│   Owner ──────────────────────────────────────────── God Mode       │
│     │                                                               │
│   SystemAdmin ────────────────────────────── Everything except      │
│     │                                        billing/delete users   │
│     ├── AgencyManager ────────────────────── Team + pipeline +      │
│     │     │                                  sequences + reports    │
│     │     ├── SalesAgent ─────────────────── Own leads + calls +    │
│     │     │                                  pipeline + commissions │
│     │     └── MarketingStaff ─────────────── Content + social +     │
│     │                                        campaigns + reputation│
│     └── Investor ─────────────────────────── Read-only executive    │
│                                              dashboard              │
│   Client ─────────────────────────────────── Portal only            │
└─────────────────────────────────────────────────────────────────────┘
```

| Role | Description | Default Redirect |
|------|-------------|-----------------|
| `Owner` | Agency owner. Full access to everything including AI Lounge, billing, user deletion. | `/ai` |
| `SystemAdmin` | Technical admin. Full access except user deletion and billing config. | `/admin` |
| `AgencyManager` | Sales manager. Team oversight, pipeline management, sequence editing, reports. | `/manager` |
| `SalesAgent` | Insurance agent. Own leads, calls, appointments, pipeline, commissions. | `/agent` |
| `MarketingStaff` | Marketing team member. Content, social, campaigns, reputation management. | `/marketing` |
| `Client` | Policyholder. Portal access only — policies, billing, claims, support. | `/portal` |
| `Investor` | Read-only executive dashboards. Revenue, KPIs, forecasts. | `/executive` |

## 5.2 Permission Matrix

```
PERMISSION LEVELS:
  FULL = Create, Read, Update, Delete
  WRITE = Create, Read, Update
  READ = Read only
  NONE = No access (redirect to default lounge)
```

| Lounge | Owner | SystemAdmin | AgencyManager | SalesAgent | MarketingStaff | Client | Investor |
|--------|-------|-------------|---------------|------------|----------------|--------|----------|
| **AI Agent** (Nerve Center) | FULL | FULL | NONE | NONE | NONE | NONE | NONE |
| **Agent** (Sales) | FULL | READ | READ | FULL | NONE | NONE | NONE |
| **Manager** | FULL | FULL | FULL | NONE | NONE | NONE | NONE |
| **Executive** | FULL | READ | READ | NONE | NONE | NONE | READ |
| **CRM** | FULL | FULL | FULL | WRITE | NONE | NONE | NONE |
| **Marketing** | FULL | FULL | FULL | NONE | FULL | NONE | NONE |
| **Client Portal** | FULL | FULL | READ | READ | NONE | FULL | NONE |
| **Admin** | FULL | FULL | NONE | NONE | NONE | NONE | NONE |

### Granular Permissions (Within Lounges)

```typescript
// server/src/types/permissions.ts

export enum Permission {
  // AI Lounge
  AI_VIEW_AGENTS       = 'ai:agents:view',
  AI_CONFIGURE_AGENTS  = 'ai:agents:configure',
  AI_RESTART_AGENTS    = 'ai:agents:restart',
  AI_VIEW_EVENTS       = 'ai:events:view',
  AI_VIEW_LOGS         = 'ai:logs:view',
  AI_MANAGE_2FA        = 'ai:2fa:manage',

  // Agent Lounge
  AGENT_VIEW_OWN_LEADS    = 'agent:leads:view_own',
  AGENT_VIEW_ALL_LEADS    = 'agent:leads:view_all',
  AGENT_EDIT_LEADS        = 'agent:leads:edit',
  AGENT_MAKE_CALLS        = 'agent:calls:make',
  AGENT_SEND_MESSAGES     = 'agent:messages:send',
  AGENT_VIEW_COMMISSIONS  = 'agent:commissions:view',
  AGENT_CREATE_QUOTES     = 'agent:quotes:create',

  // Manager Lounge
  MANAGER_VIEW_TEAM       = 'manager:team:view',
  MANAGER_REASSIGN_LEADS  = 'manager:leads:reassign',
  MANAGER_EDIT_SEQUENCES  = 'manager:sequences:edit',
  MANAGER_VIEW_COMPLIANCE = 'manager:compliance:view',
  MANAGER_HANDLE_ESCALATIONS = 'manager:escalations:handle',
  MANAGER_VIEW_COACHING   = 'manager:coaching:view',
  MANAGER_SET_GOALS       = 'manager:goals:set',

  // Executive Lounge
  EXEC_VIEW_REVENUE    = 'exec:revenue:view',
  EXEC_VIEW_FORECASTS  = 'exec:forecasts:view',
  EXEC_VIEW_KPIS       = 'exec:kpis:view',
  EXEC_EXPORT_REPORTS  = 'exec:reports:export',

  // CRM
  CRM_VIEW_LEADS       = 'crm:leads:view',
  CRM_CREATE_LEADS     = 'crm:leads:create',
  CRM_EDIT_LEADS       = 'crm:leads:edit',
  CRM_DELETE_LEADS     = 'crm:leads:delete',
  CRM_IMPORT           = 'crm:import:execute',
  CRM_EXPORT           = 'crm:export:execute',
  CRM_MANAGE_SEGMENTS  = 'crm:segments:manage',

  // Marketing
  MARKETING_VIEW_CAMPAIGNS    = 'marketing:campaigns:view',
  MARKETING_MANAGE_CAMPAIGNS  = 'marketing:campaigns:manage',
  MARKETING_CREATE_CONTENT    = 'marketing:content:create',
  MARKETING_APPROVE_CONTENT   = 'marketing:content:approve',
  MARKETING_POST_SOCIAL       = 'marketing:social:post',
  MARKETING_MANAGE_REPUTATION = 'marketing:reputation:manage',
  MARKETING_VIEW_SPEND        = 'marketing:spend:view',

  // Client Portal
  PORTAL_VIEW_POLICIES   = 'portal:policies:view',
  PORTAL_MANAGE_BILLING  = 'portal:billing:manage',
  PORTAL_FILE_CLAIMS     = 'portal:claims:file',
  PORTAL_SUBMIT_TICKETS  = 'portal:support:submit',
  PORTAL_MAKE_REFERRALS  = 'portal:referrals:make',

  // Admin
  ADMIN_MANAGE_USERS         = 'admin:users:manage',
  ADMIN_DELETE_USERS         = 'admin:users:delete',
  ADMIN_VIEW_AUDIT_LOG       = 'admin:audit:view',
  ADMIN_MANAGE_SETTINGS      = 'admin:settings:manage',
  ADMIN_MANAGE_INTEGRATIONS  = 'admin:integrations:manage',
  ADMIN_MANAGE_CARRIERS      = 'admin:carriers:manage',
  ADMIN_MANAGE_COMMISSIONS   = 'admin:commissions:manage',
  ADMIN_RUN_MIGRATIONS       = 'admin:db:migrate',
  ADMIN_MANAGE_BACKUPS       = 'admin:backups:manage',
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Owner: Object.values(Permission), // All permissions
  SystemAdmin: Object.values(Permission).filter(p =>
    p !== Permission.ADMIN_DELETE_USERS &&
    p !== Permission.ADMIN_RUN_MIGRATIONS
  ),
  AgencyManager: [
    Permission.AGENT_VIEW_ALL_LEADS, Permission.AGENT_EDIT_LEADS,
    Permission.MANAGER_VIEW_TEAM, Permission.MANAGER_REASSIGN_LEADS,
    Permission.MANAGER_EDIT_SEQUENCES, Permission.MANAGER_VIEW_COMPLIANCE,
    Permission.MANAGER_HANDLE_ESCALATIONS, Permission.MANAGER_VIEW_COACHING,
    Permission.MANAGER_SET_GOALS,
    Permission.CRM_VIEW_LEADS, Permission.CRM_CREATE_LEADS,
    Permission.CRM_EDIT_LEADS, Permission.CRM_DELETE_LEADS,
    Permission.CRM_IMPORT, Permission.CRM_EXPORT, Permission.CRM_MANAGE_SEGMENTS,
    Permission.MARKETING_VIEW_CAMPAIGNS, Permission.MARKETING_MANAGE_CAMPAIGNS,
    Permission.MARKETING_APPROVE_CONTENT, Permission.MARKETING_VIEW_SPEND,
    Permission.EXEC_VIEW_REVENUE, Permission.EXEC_VIEW_KPIS,
  ],
  SalesAgent: [
    Permission.AGENT_VIEW_OWN_LEADS, Permission.AGENT_EDIT_LEADS,
    Permission.AGENT_MAKE_CALLS, Permission.AGENT_SEND_MESSAGES,
    Permission.AGENT_VIEW_COMMISSIONS, Permission.AGENT_CREATE_QUOTES,
    Permission.CRM_VIEW_LEADS, Permission.CRM_CREATE_LEADS, Permission.CRM_EDIT_LEADS,
  ],
  MarketingStaff: [
    Permission.MARKETING_VIEW_CAMPAIGNS, Permission.MARKETING_MANAGE_CAMPAIGNS,
    Permission.MARKETING_CREATE_CONTENT, Permission.MARKETING_POST_SOCIAL,
    Permission.MARKETING_MANAGE_REPUTATION, Permission.MARKETING_VIEW_SPEND,
  ],
  Client: [
    Permission.PORTAL_VIEW_POLICIES, Permission.PORTAL_MANAGE_BILLING,
    Permission.PORTAL_FILE_CLAIMS, Permission.PORTAL_SUBMIT_TICKETS,
    Permission.PORTAL_MAKE_REFERRALS,
  ],
  Investor: [
    Permission.EXEC_VIEW_REVENUE, Permission.EXEC_VIEW_FORECASTS,
    Permission.EXEC_VIEW_KPIS,
  ],
};
```

## 5.3 RoleProtectedRoute Component

```typescript
// client/src/components/auth/RoleProtectedRoute.tsx

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  requiredPermissions?: Permission[];
  require2FA?: boolean;         // If true, must have verified 2FA this session
  fallbackPath?: string;        // Override default redirect
  showAccessDenied?: boolean;   // Show 403 page vs silent redirect
}

// Behavior:
// 1. Check if user is authenticated (JWT valid). If not → /login
// 2. Check if user.role is in allowedRoles. If not → fallback or default lounge
// 3. If requiredPermissions specified, check ROLE_PERMISSIONS map
// 4. If require2FA and user hasn't verified 2FA this session → /ai/2fa-verify
// 5. If showAccessDenied=true and unauthorized → render <AccessDenied /> component
// 6. If all checks pass → render children

// Usage:
<Route path="/ai/*" element={
  <RoleProtectedRoute
    allowedRoles={['Owner', 'SystemAdmin']}
    require2FA={true}
    showAccessDenied={true}
  >
    <AILounge />
  </RoleProtectedRoute>
} />
```

## 5.4 Auth Middleware (Server)

```typescript
// server/src/middleware/auth.ts

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient role' });
    }
    next();
  };
}

export function requirePermission(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const userPerms = ROLE_PERMISSIONS[req.user.role];
    const hasAll = permissions.every(p => userPerms.includes(p));
    if (!hasAll) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

export function require2FA(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (!req.user.twoFactorVerified) {
    return res.status(403).json({ error: '2FA verification required', code: '2FA_REQUIRED' });
  }
  next();
}

// Route usage:
router.get('/api/ai/agents',
  requireAuth,
  requireRole('Owner', 'SystemAdmin'),
  require2FA,
  aiController.getAgents
);
```

## 5.5 Two-Factor Authentication (2FA) for AI Lounge

The AI Agent Lounge (Nerve Center) controls all 37 agents. It requires TOTP-based 2FA.

```typescript
// server/src/services/twoFactorService.ts
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export class TwoFactorService {
  async setup(userId: string): Promise<{ qrCode: string; secret: string }> {
    const secret = speakeasy.generateSecret({
      name: `GCF Agency (${userId})`,
      issuer: 'GetClientsFast',
    });

    // Store encrypted secret in DB
    await db('users')
      .where({ id: userId })
      .update({ two_factor_secret: encrypt(secret.base32) });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
    return { qrCode, secret: secret.base32 };
  }

  async verify(userId: string, token: string): Promise<boolean> {
    const user = await db('users').where({ id: userId }).first();
    if (!user?.two_factor_secret) return false;

    const secret = decrypt(user.two_factor_secret);
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1, // Allow 30s drift
    });
  }

  async disable(userId: string, token: string): Promise<boolean> {
    const verified = await this.verify(userId, token);
    if (!verified) return false;

    await db('users')
      .where({ id: userId })
      .update({ two_factor_secret: null, two_factor_enabled: false });
    return true;
  }
}
```

**2FA Flow:**
```
┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────┐
│  Login    │────▶│ JWT      │────▶│ Navigate to  │────▶│ 2FA      │
│  (email/  │     │ issued   │     │ /ai (Nerve   │     │ Verify   │
│  password)│     │ (no 2FA  │     │ Center)      │     │ Page     │
└──────────┘     │  flag)   │     └──────────────┘     └────┬─────┘
                  └──────────┘                               │
                                                             ▼
                                                    ┌──────────────┐
                                                    │ Enter TOTP   │
                                                    │ from Auth App│
                                                    └──────┬───────┘
                                                           │
                                                           ▼
                                                    ┌──────────────┐
                                                    │ POST /api/   │
                                                    │ ai/2fa/verify│
                                                    └──────┬───────┘
                                                           │
                                                           ▼
                                                    ┌──────────────┐
                                                    │ New JWT with │
                                                    │ 2fa: true    │
                                                    │ → AI Lounge  │
                                                    └──────────────┘
```

## 5.6 Database Migration — RBAC

```sql
-- migrations/005_add_rbac.sql

-- Add role column to users table
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'SalesAgent'
  CHECK (role IN ('Owner', 'SystemAdmin', 'AgencyManager', 'SalesAgent',
                  'MarketingStaff', 'Client', 'Investor'));

-- Add 2FA columns
ALTER TABLE users ADD COLUMN two_factor_secret TEXT;
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- Add last_2fa_verified_at for session tracking
ALTER TABLE users ADD COLUMN last_2fa_verified_at TIMESTAMP;

-- Create permissions override table (for custom per-user permissions)
CREATE TABLE IF NOT EXISTS user_permission_overrides (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT TRUE,
  granted_by TEXT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, permission)
);

-- Audit log for role changes
CREATE TABLE IF NOT EXISTS role_change_log (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id),
  old_role VARCHAR(20),
  new_role VARCHAR(20) NOT NULL,
  changed_by TEXT NOT NULL REFERENCES users(id),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for permission lookups
CREATE INDEX idx_user_permission_overrides_user ON user_permission_overrides(user_id);
CREATE INDEX idx_role_change_log_user ON role_change_log(user_id);
CREATE INDEX idx_users_role ON users(role);
```

---

# 6. REAL-TIME INFRASTRUCTURE

## 6.1 WebSocket Server Setup

```typescript
// server/src/websocket/WebSocketServer.ts
import { WebSocketServer as WSServer, WebSocket } from 'ws';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { EventBus, EventType } from '../services/EventBus';

interface AuthenticatedSocket extends WebSocket {
  userId: string;
  role: Role;
  subscribedChannels: Set<string>;
  isAlive: boolean;
}

export class GCFWebSocketServer {
  private wss: WSServer;
  private clients: Map<string, Set<AuthenticatedSocket>> = new Map(); // channel → clients
  private userSockets: Map<string, AuthenticatedSocket> = new Map();  // userId → socket
  private heartbeatInterval: NodeJS.Timer;

  constructor(server: HTTPServer) {
    this.wss = new WSServer({
      server,
      path: '/ws',
      verifyClient: this.authenticate.bind(this),
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.setupHeartbeat();
    this.bridgeEventBus();

    console.log('[WS] WebSocket server initialized on /ws');
  }

  private authenticate(
    info: { origin: string; secure: boolean; req: any },
    callback: (result: boolean, code?: number, message?: string) => void
  ) {
    try {
      const url = new URL(info.req.url, 'http://localhost');
      const token = url.searchParams.get('token');
      if (!token) {
        callback(false, 401, 'No token');
        return;
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      info.req.user = decoded;
      callback(true);
    } catch {
      callback(false, 401, 'Invalid token');
    }
  }

  private handleConnection(socket: AuthenticatedSocket, req: any) {
    const user = req.user as JWTPayload;
    socket.userId = user.id;
    socket.role = user.role;
    socket.subscribedChannels = new Set();
    socket.isAlive = true;

    this.userSockets.set(user.id, socket);

    // Auto-subscribe based on role
    const channels = this.getDefaultChannels(user.role);
    channels.forEach(ch => this.subscribe(socket, ch));

    socket.on('message', (data) => this.handleMessage(socket, data.toString()));
    socket.on('pong', () => { socket.isAlive = true; });
    socket.on('close', () => this.handleDisconnect(socket));

    socket.send(JSON.stringify({
      type: 'connected',
      channels: Array.from(socket.subscribedChannels),
      timestamp: Date.now(),
    }));
  }

  private handleMessage(socket: AuthenticatedSocket, raw: string) {
    try {
      const msg = JSON.parse(raw);
      switch (msg.type) {
        case 'subscribe':
          if (this.canAccessChannel(socket.role, msg.channel)) {
            this.subscribe(socket, msg.channel);
          }
          break;
        case 'unsubscribe':
          this.unsubscribe(socket, msg.channel);
          break;
        case 'ping':
          socket.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
      }
    } catch { /* ignore malformed */ }
  }

  private subscribe(socket: AuthenticatedSocket, channel: string) {
    socket.subscribedChannels.add(channel);
    if (!this.clients.has(channel)) this.clients.set(channel, new Set());
    this.clients.get(channel)!.add(socket);
  }

  private unsubscribe(socket: AuthenticatedSocket, channel: string) {
    socket.subscribedChannels.delete(channel);
    this.clients.get(channel)?.delete(socket);
  }

  private handleDisconnect(socket: AuthenticatedSocket) {
    this.userSockets.delete(socket.userId);
    socket.subscribedChannels.forEach(ch => {
      this.clients.get(ch)?.delete(socket);
    });
  }

  public broadcast(channel: string, data: any) {
    const subscribers = this.clients.get(channel);
    if (!subscribers) return;
    const payload = JSON.stringify({ channel, data, timestamp: Date.now() });
    subscribers.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  public sendToUser(userId: string, data: any) {
    const socket = this.userSockets.get(userId);
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    }
  }

  private setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        const socket = ws as AuthenticatedSocket;
        if (!socket.isAlive) { socket.terminate(); return; }
        socket.isAlive = false;
        socket.ping();
      });
    }, 30_000);
  }

  private getDefaultChannels(role: Role): string[] {
    const map: Record<Role, string[]> = {
      Owner:          ['agents', 'leads', 'pipeline', 'revenue', 'alerts', 'system'],
      SystemAdmin:    ['agents', 'system', 'alerts', 'errors'],
      AgencyManager:  ['leads', 'pipeline', 'team', 'escalations', 'compliance'],
      SalesAgent:     ['my-leads', 'my-appointments', 'coaching', 'notifications'],
      MarketingStaff: ['content', 'social', 'campaigns', 'reputation'],
      Client:         ['my-policies', 'my-claims', 'my-tickets'],
      Investor:       ['revenue', 'kpis'],
    };
    return map[role] || [];
  }

  private canAccessChannel(role: Role, channel: string): boolean {
    const allowed = this.getDefaultChannels(role);
    // Owner can access anything
    if (role === 'Owner') return true;
    return allowed.includes(channel);
  }
}
```

## 6.2 Event Channels Per Lounge

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     WEBSOCKET CHANNEL MAP                               │
├──────────────────┬──────────────────────────────────────────────────────┤
│ Channel          │ Subscribers / Purpose                                │
├──────────────────┼──────────────────────────────────────────────────────┤
│ agents           │ AI Lounge — agent status changes, health, events     │
│ system           │ AI/Admin — system health, errors, uptime             │
│ alerts           │ AI/Manager/Admin — critical alerts, thresholds       │
│ errors           │ AI/Admin — error recovery events                     │
│ leads            │ Agent/Manager/CRM — new leads, score changes, moves  │
│ my-leads         │ Agent — filtered to assigned leads only (per-user)   │
│ pipeline         │ Agent/Manager/CRM — stage transitions                │
│ my-appointments  │ Agent — upcoming appointment reminders               │
│ coaching         │ Agent — real-time call coaching suggestions           │
│ team             │ Manager — agent status, performance updates          │
│ escalations      │ Manager — new escalations, status changes            │
│ compliance       │ Manager — compliance alerts and issues               │
│ revenue          │ Executive/Investor — revenue updates, forecasts      │
│ kpis             │ Executive/Investor — KPI threshold alerts            │
│ content          │ Marketing — content generation complete, approvals   │
│ social           │ Marketing — post published, engagement updates       │
│ campaigns        │ Marketing — campaign performance, budget alerts      │
│ reputation       │ Marketing — new reviews, score changes               │
│ my-policies      │ Client Portal — policy updates, renewal reminders    │
│ my-claims        │ Client Portal — claim status changes                 │
│ my-tickets       │ Client Portal — ticket responses                     │
│ notifications    │ All internal roles — general notifications           │
└──────────────────┴──────────────────────────────────────────────────────┘
```

## 6.3 EventBus → WebSocket Bridge Map

This maps internal `EventType` enum values (from EventBus) to WebSocket channels:

```typescript
// server/src/websocket/eventBridge.ts

interface BridgeRule {
  eventTypes: EventType[];
  channels: string[];
  transform?: (event: any) => any;  // Optional payload transform
  filter?: (event: any) => boolean; // Optional filter
}

const BRIDGE_MAP: BridgeRule[] = [
  // Agent Status → AI Lounge
  {
    eventTypes: [
      EventType.AGENT_STARTED, EventType.AGENT_STOPPED,
      EventType.AGENT_ERROR, EventType.AGENT_HEALTH_CHECK,
    ],
    channels: ['agents'],
  },

  // Lead Events → Multiple Channels
  {
    eventTypes: [EventType.LEAD_CREATED],
    channels: ['leads', 'pipeline', 'notifications'],
    transform: (e) => ({ type: 'new-lead', lead: e.payload.lead }),
  },
  {
    eventTypes: [EventType.LEAD_SCORED],
    channels: ['leads', 'my-leads'],
    transform: (e) => ({ type: 'lead-scored', leadId: e.payload.leadId, score: e.payload.score }),
  },
  {
    eventTypes: [EventType.LEAD_ENRICHED],
    channels: ['leads', 'my-leads'],
  },
  {
    eventTypes: [EventType.LEAD_STAGE_CHANGED],
    channels: ['leads', 'pipeline', 'my-leads'],
  },
  {
    eventTypes: [EventType.LEAD_ASSIGNED],
    channels: ['leads', 'my-leads', 'team'],
  },

  // Communication Events
  {
    eventTypes: [EventType.EMAIL_SENT, EventType.EMAIL_OPENED, EventType.EMAIL_CLICKED],
    channels: ['my-leads', 'leads'],
  },
  {
    eventTypes: [EventType.SMS_SENT, EventType.SMS_RECEIVED],
    channels: ['my-leads', 'leads'],
  },
  {
    eventTypes: [EventType.CALL_STARTED, EventType.CALL_ENDED],
    channels: ['my-leads', 'team'],
  },
  {
    eventTypes: [EventType.CALL_COACHING_SUGGESTION],
    channels: ['coaching'],
  },

  // Appointment Events
  {
    eventTypes: [EventType.APPOINTMENT_SCHEDULED, EventType.APPOINTMENT_REMINDER],
    channels: ['my-appointments', 'leads'],
  },
  {
    eventTypes: [EventType.APPOINTMENT_COMPLETED, EventType.APPOINTMENT_NO_SHOW],
    channels: ['my-appointments', 'team'],
  },

  // Sales Events
  {
    eventTypes: [EventType.QUOTE_GENERATED, EventType.APPLICATION_STARTED],
    channels: ['my-leads', 'pipeline'],
  },
  {
    eventTypes: [EventType.POLICY_BOUND, EventType.POLICY_ISSUED],
    channels: ['leads', 'pipeline', 'revenue', 'my-policies', 'notifications'],
  },

  // Revenue & Commission Events
  {
    eventTypes: [EventType.COMMISSION_CALCULATED, EventType.COMMISSION_PAID],
    channels: ['revenue', 'notifications'],
  },
  {
    eventTypes: [EventType.REVENUE_UPDATED, EventType.FORECAST_UPDATED],
    channels: ['revenue', 'kpis'],
  },
  {
    eventTypes: [EventType.PAYMENT_RECEIVED, EventType.PAYMENT_FAILED],
    channels: ['my-policies', 'revenue', 'alerts'],
  },

  // Marketing Events
  {
    eventTypes: [EventType.CONTENT_GENERATED, EventType.CONTENT_APPROVED],
    channels: ['content'],
  },
  {
    eventTypes: [EventType.SOCIAL_POST_PUBLISHED, EventType.SOCIAL_ENGAGEMENT],
    channels: ['social'],
  },
  {
    eventTypes: [EventType.CAMPAIGN_STARTED, EventType.CAMPAIGN_BUDGET_ALERT],
    channels: ['campaigns'],
  },
  {
    eventTypes: [EventType.REVIEW_RECEIVED, EventType.REPUTATION_SCORE_CHANGED],
    channels: ['reputation'],
  },

  // Client Portal Events
  {
    eventTypes: [EventType.CLAIM_FILED, EventType.CLAIM_STATUS_CHANGED],
    channels: ['my-claims', 'leads'],
  },
  {
    eventTypes: [EventType.TICKET_CREATED, EventType.TICKET_RESPONSE],
    channels: ['my-tickets'],
  },
  {
    eventTypes: [EventType.POLICY_RENEWAL_REMINDER],
    channels: ['my-policies', 'leads'],
  },

  // Escalation Events
  {
    eventTypes: [EventType.ESCALATION_CREATED, EventType.ESCALATION_RESOLVED],
    channels: ['escalations', 'alerts'],
  },

  // Compliance Events
  {
    eventTypes: [EventType.COMPLIANCE_VIOLATION, EventType.COMPLIANCE_WARNING],
    channels: ['compliance', 'alerts'],
  },

  // System Events
  {
    eventTypes: [EventType.SYSTEM_ERROR, EventType.SYSTEM_RECOVERY],
    channels: ['system', 'errors', 'alerts'],
  },
];

// Bridge implementation
export function bridgeEventBus(eventBus: EventBus, wsServer: GCFWebSocketServer) {
  BRIDGE_MAP.forEach(rule => {
    rule.eventTypes.forEach(eventType => {
      eventBus.on(eventType, (event) => {
        if (rule.filter && !rule.filter(event)) return;
        const payload = rule.transform ? rule.transform(event) : event;
        rule.channels.forEach(channel => {
          wsServer.broadcast(channel, { eventType, ...payload });
        });
      });
    });
  });
}
```

## 6.4 WebSocketProvider React Component

```typescript
// client/src/providers/WebSocketProvider.tsx
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';

interface WebSocketContextValue {
  connected: boolean;
  subscribe: (channel: string, handler: (data: any) => void) => () => void;
  unsubscribe: (channel: string) => void;
  lastMessage: any | null;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: React.ReactNode;
  url?: string; // defaults to ws(s)://host/ws
}

export function WebSocketProvider({ children, url }: WebSocketProviderProps) {
  const { token } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timer>();
  const [connected, setConnected] = useState(false);
  const [connectionState, setConnectionState] =
    useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [lastMessage, setLastMessage] = useState<any>(null);

  const MAX_RECONNECT_ATTEMPTS = 10;
  const BASE_DELAY = 1000;   // 1 second
  const MAX_DELAY  = 30_000; // 30 seconds

  const getReconnectDelay = useCallback(() => {
    const attempt = reconnectAttemptRef.current;
    const delay = Math.min(BASE_DELAY * Math.pow(2, attempt), MAX_DELAY);
    const jitter = delay * 0.1 * Math.random();
    return delay + jitter;
  }, []);

  const connect = useCallback(() => {
    if (!token) return;

    const wsUrl = url ||
      `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`;

    setConnectionState('connecting');
    const ws = new WebSocket(`${wsUrl}?token=${token}`);

    ws.onopen = () => {
      setConnected(true);
      setConnectionState('connected');
      reconnectAttemptRef.current = 0;
      console.log('[WS] Connected');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setLastMessage(msg);
        if (msg.channel && handlersRef.current.has(msg.channel)) {
          handlersRef.current.get(msg.channel)!.forEach(handler => handler(msg.data));
        }
      } catch { /* ignore */ }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;

      if (reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
        setConnectionState('reconnecting');
        const delay = getReconnectDelay();
        reconnectAttemptRef.current += 1;
        console.log(`[WS] Reconnecting in ${Math.round(delay)}ms (attempt ${reconnectAttemptRef.current})`);
        reconnectTimerRef.current = setTimeout(connect, delay);
      } else {
        setConnectionState('disconnected');
        console.log('[WS] Max reconnect attempts reached');
      }
    };

    ws.onerror = () => { ws.close(); };

    wsRef.current = ws;
  }, [token, url, getReconnectDelay]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const subscribe = useCallback((channel: string, handler: (data: any) => void) => {
    if (!handlersRef.current.has(channel)) {
      handlersRef.current.set(channel, new Set());
      // Tell server to subscribe
      wsRef.current?.send(JSON.stringify({ type: 'subscribe', channel }));
    }
    handlersRef.current.get(channel)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = handlersRef.current.get(channel);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          handlersRef.current.delete(channel);
          wsRef.current?.send(JSON.stringify({ type: 'unsubscribe', channel }));
        }
      }
    };
  }, []);

  const unsubscribe = useCallback((channel: string) => {
    handlersRef.current.delete(channel);
    wsRef.current?.send(JSON.stringify({ type: 'unsubscribe', channel }));
  }, []);

  return (
    <WebSocketContext.Provider value={{ connected, subscribe, unsubscribe, lastMessage, connectionState }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used within WebSocketProvider');
  return ctx;
}

// Convenience hook for channel subscription
export function useChannel(channel: string, handler: (data: any) => void) {
  const { subscribe } = useWebSocket();
  useEffect(() => {
    const unsub = subscribe(channel, handler);
    return unsub;
  }, [channel, handler, subscribe]);
}
```

## 6.5 Server Integration

```typescript
// server/src/index.ts (additions)
import { createServer } from 'http';
import { GCFWebSocketServer } from './websocket/WebSocketServer';
import { bridgeEventBus } from './websocket/eventBridge';

const app = express();
const server = createServer(app);

// ... existing Express setup ...

// Initialize WebSocket
const wsServer = new GCFWebSocketServer(server);
bridgeEventBus(eventBus, wsServer);

// Make wsServer available to route handlers for direct pushes
app.set('wsServer', wsServer);

// Use server.listen instead of app.listen
server.listen(PORT, () => {
  console.log(`GCF server running on port ${PORT} (HTTP + WebSocket)`);
});
```

---


# 7. SHARED COMPONENTS TO BUILD

## 7.1 LoungeLayout

```typescript
// client/src/components/layout/LoungeLayout.tsx

interface LoungeLayoutProps {
  loungeName: string;                    // e.g., "Agent", "Manager", "AI Agent"
  loungeColor: string;                   // Tailwind color class, e.g., "blue", "purple"
  sidebarItems: SidebarItem[];           // Navigation items for this lounge
  headerActions?: React.ReactNode;       // Right side of header (notifications, profile)
  showSearch?: boolean;                  // Show UniversalSearch in header (default true)
  showLoungeSwitcher?: boolean;          // Show LoungeSwitcher (default true)
  showNotifications?: boolean;           // Show notification bell (default true)
  showAgentActivity?: boolean;           // Show AI agent activity indicator (default false)
  breadcrumbs?: Breadcrumb[];            // Optional breadcrumb trail
  children: React.ReactNode;
}

interface SidebarItem {
  label: string;
  icon: React.ComponentType;
  path: string;
  badge?: number;                        // Notification count badge
  children?: SidebarItem[];              // Nested items
  requiredPermission?: Permission;       // Hide if user lacks permission
}
```

**State Management:** Uses React Context for sidebar collapse state (persisted in localStorage). Responsive: sidebar collapses to icons on `md` breakpoint.

**Behavior:**
- Sidebar width: `w-64` expanded, `w-16` collapsed
- Active route highlighted with `bg-{color}-50 text-{color}-700 border-r-2 border-{color}-700`
- Header: fixed top, `h-16`, contains lounge name, search, notifications, profile dropdown, lounge switcher
- Content area: scrollable, `p-6` padding
- Footer: optional, shows WebSocket connection status indicator

**Used By:** ALL 8 lounges. Each passes its own sidebarItems and color.

**Tailwind:**
```
bg-white dark:bg-gray-900
sidebar: bg-gray-50 dark:bg-gray-800 border-r border-gray-200
header: bg-white dark:bg-gray-900 border-b border-gray-200 shadow-sm
```

## 7.2 UnifiedNotificationSystem

```typescript
// client/src/components/notifications/UnifiedNotificationSystem.tsx

interface UnifiedNotificationSystemProps {
  maxVisible?: number;          // Toast stack limit (default 5)
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  autoHideMs?: number;          // Auto-dismiss timeout (default 5000, 0 = manual)
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'agent-activity';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;          // Click to navigate
  actionLabel?: string;        // CTA button text
  agentName?: string;          // For agent-activity type
  persistent?: boolean;        // Don't auto-dismiss
  sound?: boolean;             // Play notification sound
}
```

**State Management:** Global notification store via Zustand:
```typescript
interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  add: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clear: () => void;
}
```

**Behavior:**
- Listens to WebSocket `notifications` channel automatically
- Toast popups for new notifications with stacking animation
- Bell icon in header shows `unreadCount` badge (red circle)
- Click bell → dropdown panel with notification list, grouped by date
- Click notification → navigate to `actionUrl` if present
- Browser Notification API for background tab alerts (with user permission)
- Sound via HTML5 Audio for urgent notifications

**Used By:** All internal lounges (AI, Agent, Manager, Executive, CRM, Marketing, Admin). Client Portal has a simplified version.

**Tailwind:**
```
Toast: bg-white rounded-lg shadow-lg border-l-4 p-4 max-w-sm animate-slide-in
  info: border-blue-500       success: border-green-500
  warning: border-yellow-500  error: border-red-500
  agent-activity: border-purple-500
Badge: absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5
```

## 7.3 RoleProtectedRoute

(See Section 5.3 above for full specification.)

**Used By:** App.tsx router — wraps every lounge route.

## 7.4 WebSocketProvider

(See Section 6.4 above for full specification.)

**Used By:** Wraps entire app at root level (`App.tsx`).

## 7.5 AgentActivityIndicator

```typescript
// client/src/components/agents/AgentActivityIndicator.tsx

interface AgentActivityIndicatorProps {
  mode: 'compact' | 'detailed' | 'full';
  // compact: single dot with tooltip (header bar)
  // detailed: small card with agent name + action (sidebar)
  // full: expanded list with all active agents (AI Lounge)
  maxAgents?: number;           // Max to show in detailed/full mode
  filter?: string[];            // Only show these agent IDs
}

interface AgentActivity {
  agentId: string;
  agentName: string;
  status: 'idle' | 'processing' | 'waiting' | 'error';
  currentAction?: string;       // e.g., "Scoring lead #4521"
  lastActiveAt: number;
  eventsProcessed: number;      // This session
}
```

**State Management:** Subscribes to `agents` WebSocket channel. Maintains local state of last-known agent activities.

**Behavior:**
- `compact`: Pulsing green dot (all healthy), yellow (some errors), red (critical). Tooltip shows summary on hover.
- `detailed`: Shows top 3 actively processing agents with current action text. Animated border when processing.
- `full`: Full agent roster with status, current action, events processed, uptime. Sortable/filterable.

**Used By:**
- `compact`: Agent Lounge header, Manager Lounge header
- `detailed`: AI Lounge sidebar
- `full`: AI Lounge Nerve Center main view

**Tailwind:**
```
compact: w-3 h-3 rounded-full animate-pulse
  healthy: bg-green-500  warning: bg-yellow-500  error: bg-red-500
detailed: bg-gray-50 rounded-lg p-3 border border-gray-200
  processing-border: ring-2 ring-purple-400 ring-opacity-50 animate-pulse
full: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
```

## 7.6 UniversalSearch

```typescript
// client/src/components/search/UniversalSearch.tsx

interface UniversalSearchProps {
  placeholder?: string;
  loungeScope?: string;         // Limit search to current lounge context
  showShortcut?: boolean;       // Show "⌘K" hint (default true)
}

interface SearchResult {
  type: 'lead' | 'policy' | 'agent' | 'ticket' | 'content' | 'appointment' | 'document';
  id: string;
  title: string;
  subtitle: string;
  url: string;
  icon: React.ComponentType;
  relevance: number;
}
```

**State Management:** Local state for query and results. Debounced API call (300ms). Recent searches stored in localStorage.

**Behavior:**
- `⌘K` / `Ctrl+K` keyboard shortcut opens modal search overlay
- Debounced search hits `GET /api/search?q=&scope=&limit=10`
- Results grouped by type with icons
- Arrow keys to navigate, Enter to select
- ESC to close
- Shows recent searches when empty
- Role-aware: only returns results the user has permission to view

**Used By:** All internal lounges (in LoungeLayout header).

**Tailwind:**
```
Overlay: fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-[20vh]
Modal: bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4
Input: w-full px-4 py-3 text-lg border-b border-gray-200 focus:outline-none
Results: max-h-96 overflow-y-auto divide-y divide-gray-100
```

## 7.7 LoungeSwitcher

```typescript
// client/src/components/navigation/LoungeSwitcher.tsx

interface LoungeSwitcherProps {
  currentLounge: string;
  variant?: 'dropdown' | 'grid';  // dropdown in header, grid in sidebar
}

interface LoungeOption {
  id: string;
  name: string;
  icon: React.ComponentType;
  color: string;
  path: string;
  requiredRoles: Role[];
  description: string;
}

const LOUNGES: LoungeOption[] = [
  { id: 'ai',         name: 'AI Agent',    icon: BrainIcon,    color: 'purple', path: '/ai',         requiredRoles: ['Owner', 'SystemAdmin'], description: 'Nerve Center — Monitor & control all 37 AI agents' },
  { id: 'agent',      name: 'Agent',       icon: PhoneIcon,    color: 'blue',   path: '/agent',      requiredRoles: ['Owner', 'SystemAdmin', 'AgencyManager', 'SalesAgent'], description: 'Sales workspace — Leads, calls, pipeline, quotes' },
  { id: 'manager',    name: 'Manager',     icon: UsersIcon,    color: 'green',  path: '/manager',    requiredRoles: ['Owner', 'SystemAdmin', 'AgencyManager'], description: 'Team management — Performance, coaching, sequences' },
  { id: 'executive',  name: 'Executive',   icon: TrendUpIcon,  color: 'gold',   path: '/executive',  requiredRoles: ['Owner', 'SystemAdmin', 'AgencyManager', 'Investor'], description: 'Business intelligence — Revenue, KPIs, forecasts' },
  { id: 'crm',        name: 'CRM',         icon: DatabaseIcon, color: 'indigo', path: '/crm',        requiredRoles: ['Owner', 'SystemAdmin', 'AgencyManager', 'SalesAgent'], description: 'Customer records — Full lead & policy management' },
  { id: 'marketing',  name: 'Marketing',   icon: MegaphoneIcon,color: 'pink',   path: '/marketing',  requiredRoles: ['Owner', 'SystemAdmin', 'AgencyManager', 'MarketingStaff'], description: 'Content studio — Social, campaigns, reputation' },
  { id: 'portal',     name: 'Client Portal',icon: ShieldIcon,  color: 'teal',   path: '/portal',     requiredRoles: ['Client'], description: 'Self-service — Policies, billing, claims, support' },
  { id: 'admin',      name: 'Admin',       icon: SettingsIcon, color: 'gray',   path: '/admin',      requiredRoles: ['Owner', 'SystemAdmin'], description: 'System administration — Users, settings, integrations' },
];
```

**Behavior:**
- Only shows lounges the current user's role can access
- Current lounge highlighted
- `dropdown`: Click opens floating menu positioned below trigger
- `grid`: 2-column grid in sidebar with lounge cards
- Hover shows description tooltip

**Used By:** All internal lounges (in LoungeLayout header).

**Tailwind:**
```
Dropdown: absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border z-50
Grid item: p-3 rounded-lg hover:bg-{color}-50 cursor-pointer transition-colors
Active: bg-{color}-100 border border-{color}-300
Icon: w-8 h-8 text-{color}-600
```

---


# 8. THE 37-AGENT WIRING PLAN

> For each agent: current state, wiring work, external services, lounge pages, DB tables, events, and build phase.

---

## TIER 0: ORCHESTRATION

### 8.1 OrchestratorAgent

| Field | Detail |
|-------|--------|
| **Current State** | Core routing logic implemented. Listens to EventBus, dispatches to child agents based on EventType. Has basic priority queue and retry logic. |
| **What Needs Wiring** | (1) Persistent event queue in DB (currently in-memory). (2) Dead letter queue for failed events. (3) Agent health monitoring loop. (4) Dynamic routing rules from admin config. (5) Circuit breaker per agent. |
| **External Services** | None — internal only. |
| **Lounge Pages** | AI Lounge: Nerve Center (main view), Event Stream, Agent Health Dashboard. |
| **DB Tables Read** | `agent_configs`, `event_log` |
| **DB Tables Write** | `event_log`, `agent_health`, `dead_letter_queue` |
| **Events Consumed** | ALL EventTypes (acts as central router) |
| **Events Produced** | `AGENT_STARTED`, `AGENT_STOPPED`, `AGENT_ERROR`, `AGENT_HEALTH_CHECK`, `SYSTEM_ERROR`, `SYSTEM_RECOVERY` |
| **Build Phase** | **Phase 1** |

---

## TIER 1: LEAD ACQUISITION

### 8.2 LeadDiscoveryAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded with empty handlers. Has interface defined but no actual discovery logic. |
| **What Needs Wiring** | (1) Facebook Lead Ads webhook handler to capture form submissions. (2) Google Ads click-to-call / form extension ingestion. (3) Website quote form → lead creation pipeline. (4) Referral tracking from Client Portal. (5) CSV import processor for purchased lead lists. (6) Deduplication logic (email + phone matching). |
| **External Services** | Facebook/Instagram API, Google Ads API, website webhook endpoints |
| **Lounge Pages** | CRM: Lead Sources dashboard, Import page. Manager: Lead Distribution view. Marketing: Campaign Attribution. |
| **DB Tables Read** | `leads` (dedup check), `campaigns`, `lead_sources` |
| **DB Tables Write** | `leads`, `lead_sources`, `lead_source_tracking` |
| **Events Consumed** | `WEBHOOK_RECEIVED`, `FORM_SUBMITTED`, `REFERRAL_CREATED`, `IMPORT_STARTED` |
| **Events Produced** | `LEAD_CREATED`, `LEAD_DUPLICATE_FOUND`, `IMPORT_COMPLETED` |
| **Build Phase** | **Phase 1** |

### 8.3 DataEnrichmentAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. Handler for `LEAD_CREATED` exists but does nothing. |
| **What Needs Wiring** | (1) Clearbit/ZoomInfo API integration for company/person data. (2) Social media profile lookup (LinkedIn, Facebook). (3) Property/vehicle data for insurance context. (4) Credit score range estimation. (5) Enrichment caching (don't re-enrich within 30 days). (6) Fallback chain: Clearbit → ZoomInfo → manual flag. |
| **External Services** | Clearbit API, ZoomInfo API, public data APIs |
| **Lounge Pages** | CRM: Lead Detail (enrichment panel). Agent: Lead Brief. |
| **DB Tables Read** | `leads`, `enrichment_cache` |
| **DB Tables Write** | `leads` (update enriched fields), `enrichment_cache`, `enrichment_log` |
| **Events Consumed** | `LEAD_CREATED`, `ENRICHMENT_REQUESTED` |
| **Events Produced** | `LEAD_ENRICHED`, `ENRICHMENT_FAILED` |
| **Build Phase** | **Phase 2** |

### 8.4 LeadIntakeAgent

| Field | Detail |
|-------|--------|
| **Current State** | Partially implemented. Can create a lead record from form data. Missing validation, normalization, and assignment logic. |
| **What Needs Wiring** | (1) Phone number normalization (E.164 via libphonenumber). (2) Email validation (MX record check). (3) Address standardization. (4) Auto-assignment via round-robin or territory rules. (5) Source attribution tracking. (6) Immediate acknowledgment email/SMS trigger. (7) Compliance opt-in recording (TCPA). |
| **External Services** | None directly (triggers other agents). |
| **Lounge Pages** | CRM: New Lead form, Import results. Agent: incoming lead notification. |
| **DB Tables Read** | `users` (for assignment), `assignment_rules`, `territories` |
| **DB Tables Write** | `leads`, `lead_activity`, `consent_records` |
| **Events Consumed** | `FORM_SUBMITTED`, `LEAD_CREATED`, `IMPORT_ROW_PROCESSED` |
| **Events Produced** | `LEAD_CREATED`, `LEAD_ASSIGNED`, `LEAD_VALIDATION_FAILED`, `ACKNOWLEDGMENT_TRIGGERED` |
| **Build Phase** | **Phase 1** |

### 8.5 LeadScoringAgent

| Field | Detail |
|-------|--------|
| **Current State** | Basic scoring logic exists with hardcoded rules. Returns a 0-100 score based on a few fields. |
| **What Needs Wiring** | (1) Configurable scoring model (points per field via admin). (2) Behavioral scoring (email opens, website visits, response time). (3) Decay function (score decreases over time without engagement). (4) ML-ready: store feature vectors for future model training. (5) Auto re-score on enrichment data arrival. (6) Score threshold triggers (hot lead alerts). |
| **External Services** | None (internal computation). |
| **Lounge Pages** | CRM: Pipeline (score column), Lead Detail (score breakdown). Agent: Lead list (sorted by score). Manager: Lead Distribution (by score tiers). |
| **DB Tables Read** | `leads`, `lead_activity`, `scoring_rules`, `enrichment_cache` |
| **DB Tables Write** | `leads` (score field), `score_history`, `score_features` |
| **Events Consumed** | `LEAD_CREATED`, `LEAD_ENRICHED`, `EMAIL_OPENED`, `EMAIL_CLICKED`, `CALL_ENDED`, `APPOINTMENT_COMPLETED`, `WEBSITE_VISIT` |
| **Events Produced** | `LEAD_SCORED`, `HOT_LEAD_ALERT`, `LEAD_SCORE_DECAYED` |
| **Build Phase** | **Phase 1** |

---

## TIER 2: OUTREACH

### 8.6 OutreachOrchestrationAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. Sequence data model exists but no execution engine. |
| **What Needs Wiring** | (1) Sequence execution engine — step scheduling, delay handling, condition branching. (2) Multi-channel step types: email, SMS, call task, social DM, wait. (3) Exit conditions: reply received, appointment booked, unsubscribed, converted. (4) A/B testing support for email variants. (5) Enrollment/unenrollment API. (6) Sequence analytics (per-step conversion rates). (7) Business hours awareness for send timing. |
| **External Services** | None directly (delegates to channel agents). |
| **Lounge Pages** | Agent: Sequence enrollment on lead detail. Manager: Sequence builder, Sequence performance. |
| **DB Tables Read** | `email_sequences`, `email_seq_steps`, `email_seq_enrolls`, `leads`, `business_hours` |
| **DB Tables Write** | `email_seq_enrolls`, `email_seq_step_results`, `sequence_analytics` |
| **Events Consumed** | `LEAD_CREATED`, `LEAD_SCORED`, `SEQUENCE_ENROLL_REQUESTED`, `EMAIL_REPLIED`, `APPOINTMENT_SCHEDULED`, `LEAD_CONVERTED`, `UNSUBSCRIBE_REQUESTED` |
| **Events Produced** | `SEQUENCE_STEP_TRIGGERED`, `SEQUENCE_COMPLETED`, `SEQUENCE_EXITED`, `AB_TEST_RESULT` |
| **Build Phase** | **Phase 2** |

### 8.7 EmailOutreachAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. SendGrid package installed but not configured. Template rendering stubbed. |
| **What Needs Wiring** | (1) SendGrid API integration with API key. (2) Template engine with variable substitution (Handlebars). (3) Open/click tracking pixel and link wrapping. (4) Bounce/complaint webhook handler. (5) Unsubscribe link injection (CAN-SPAM). (6) Rate limiting (SendGrid tier limits). (7) Email warmup schedule for new domains. (8) Reply detection via SendGrid Inbound Parse or IMAP. |
| **External Services** | SendGrid (or Gmail API for personal sends) |
| **Lounge Pages** | Agent: Send Email modal, Email thread view. Manager: Email analytics. Marketing: Email templates. CRM: Lead communication history. |
| **DB Tables Read** | `leads`, `email_templates`, `emails_sent`, `unsubscribes` |
| **DB Tables Write** | `emails_sent`, `email_events` (opens, clicks, bounces), `unsubscribes` |
| **Events Consumed** | `SEQUENCE_STEP_TRIGGERED` (type=email), `EMAIL_SEND_REQUESTED`, `SENDGRID_WEBHOOK` |
| **Events Produced** | `EMAIL_SENT`, `EMAIL_OPENED`, `EMAIL_CLICKED`, `EMAIL_BOUNCED`, `EMAIL_REPLIED`, `EMAIL_UNSUBSCRIBED` |
| **Build Phase** | **Phase 2** |

### 8.8 SmsMessagingAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. Twilio SDK imported but no connection. |
| **What Needs Wiring** | (1) Twilio Messaging API integration. (2) Two-way SMS with webhook for inbound. (3) Template messages with variable substitution. (4) Opt-out handling ("STOP" keyword → auto-unsubscribe). (5) A2P 10DLC registration compliance. (6) Rate limiting per phone number. (7) MMS support for sending images/documents. (8) Conversation threading. |
| **External Services** | Twilio Messaging API |
| **Lounge Pages** | Agent: SMS thread view, Quick SMS modal. CRM: Lead communication tab. |
| **DB Tables Read** | `leads`, `sms_templates`, `sms_messages`, `sms_opt_outs` |
| **DB Tables Write** | `sms_messages`, `sms_opt_outs` |
| **Events Consumed** | `SEQUENCE_STEP_TRIGGERED` (type=sms), `SMS_SEND_REQUESTED`, `TWILIO_SMS_WEBHOOK` |
| **Events Produced** | `SMS_SENT`, `SMS_RECEIVED`, `SMS_DELIVERY_FAILED`, `SMS_OPT_OUT` |
| **Build Phase** | **Phase 2** |

### 8.9 DialerAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. Twilio Voice SDK referenced but not integrated. |
| **What Needs Wiring** | (1) Twilio Voice API — outbound call initiation. (2) Click-to-call from browser (Twilio Client JS SDK). (3) Call recording with consent announcement. (4) Voicemail detection and pre-recorded drop. (5) Call disposition form post-call. (6) Power dialer mode (auto-dial next lead on hangup). (7) Call transfer to manager. (8) Real-time call duration tracking. (9) DNC list checking before dial. |
| **External Services** | Twilio Voice API, Twilio Client JS SDK |
| **Lounge Pages** | Agent: Dialer panel, Active call bar, Call history. Manager: Call monitoring, Coaching queue. |
| **DB Tables Read** | `leads`, `call_recordings`, `dnc_list`, `call_scripts` |
| **DB Tables Write** | `call_recordings`, `call_dispositions`, `call_analysis` |
| **Events Consumed** | `SEQUENCE_STEP_TRIGGERED` (type=call), `CALL_REQUESTED`, `TWILIO_VOICE_WEBHOOK` |
| **Events Produced** | `CALL_STARTED`, `CALL_ENDED`, `CALL_RECORDING_READY`, `VOICEMAIL_DROPPED`, `CALL_TRANSFERRED` |
| **Build Phase** | **Phase 2** |

### 8.10 SocialDmAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. No API connections. |
| **What Needs Wiring** | (1) Facebook Messenger API for page-to-user messaging. (2) Instagram Direct API. (3) LinkedIn InMail API (limited by LinkedIn's restrictions). (4) Template messages per platform. (5) Read receipt tracking. (6) Platform-specific rate limits and rules. (7) Conversation view aggregation. |
| **External Services** | Facebook Graph API, Instagram API, LinkedIn API |
| **Lounge Pages** | Agent: Social DM tab on lead detail. Marketing: Social engagement view. |
| **DB Tables Read** | `leads`, `social_profiles`, `dm_templates` |
| **DB Tables Write** | `social_messages`, `social_profiles` |
| **Events Consumed** | `SEQUENCE_STEP_TRIGGERED` (type=social_dm), `SOCIAL_DM_REQUESTED`, `FACEBOOK_WEBHOOK`, `INSTAGRAM_WEBHOOK` |
| **Events Produced** | `SOCIAL_DM_SENT`, `SOCIAL_DM_RECEIVED`, `SOCIAL_DM_READ` |
| **Build Phase** | **Phase 4** |

---

## TIER 3: ENGAGEMENT

### 8.11 InboundResponseAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. No implementation. |
| **What Needs Wiring** | (1) Email inbound webhook handler (SendGrid Inbound Parse). (2) SMS inbound handler (Twilio webhook). (3) Chat widget message handler. (4) Intent classification using LLM (question, complaint, quote request, appointment request, etc.). (5) Auto-response generation for simple queries. (6) Routing to human agent for complex inquiries. (7) 60-second response SLA tracking. (8) After-hours auto-responder. |
| **External Services** | OpenAI/Anthropic (intent classification + response generation), SendGrid, Twilio |
| **Lounge Pages** | Agent: Inbox/conversation view. Manager: Response time dashboard. |
| **DB Tables Read** | `leads`, `lead_activity`, `auto_response_templates`, `business_hours` |
| **DB Tables Write** | `lead_activity`, `inbound_messages`, `response_sla_log` |
| **Events Consumed** | `EMAIL_REPLIED`, `SMS_RECEIVED`, `SOCIAL_DM_RECEIVED`, `CHAT_MESSAGE_RECEIVED`, `FORM_SUBMITTED` |
| **Events Produced** | `INBOUND_CLASSIFIED`, `AUTO_RESPONSE_SENT`, `HUMAN_RESPONSE_NEEDED`, `SLA_BREACH` |
| **Build Phase** | **Phase 3** |

### 8.12 AppointmentAgent

| Field | Detail |
|-------|--------|
| **Current State** | Basic CRUD for appointments exists. No calendar integration or automated scheduling. |
| **What Needs Wiring** | (1) Google Calendar API sync (read/write agent calendars). (2) Available time slot calculation. (3) Self-scheduling link generation for leads. (4) Automated reminders: 24h, 1h, 15min before (email + SMS). (5) No-show detection and follow-up trigger. (6) Reschedule/cancel flow. (7) Video meeting link generation (Zoom/Google Meet). (8) Buffer time between appointments. |
| **External Services** | Google Calendar API, Zoom API (optional) |
| **Lounge Pages** | Agent: Calendar view, Appointment list. CRM: Lead detail appointments tab. Client Portal: Book appointment page. |
| **DB Tables Read** | `appointments`, `users` (agent calendars), `leads`, `business_hours` |
| **DB Tables Write** | `appointments`, `appointment_reminders`, `lead_activity` |
| **Events Consumed** | `APPOINTMENT_REQUESTED`, `INBOUND_CLASSIFIED` (type=appointment_request), `APPOINTMENT_REMINDER_DUE` |
| **Events Produced** | `APPOINTMENT_SCHEDULED`, `APPOINTMENT_REMINDER`, `APPOINTMENT_COMPLETED`, `APPOINTMENT_NO_SHOW`, `APPOINTMENT_CANCELLED`, `APPOINTMENT_RESCHEDULED` |
| **Build Phase** | **Phase 2** |

### 8.13 ConversationMemoryAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. No memory storage or retrieval logic. |
| **What Needs Wiring** | (1) Aggregate all lead touchpoints into unified timeline. (2) LLM-generated conversation summaries. (3) Key fact extraction (family size, budget, coverage needs, objections). (4) Context assembly for other agents (provide relevant history for AI responses). (5) Sentiment tracking over time. (6) Search across conversation history. (7) Memory pruning for old/irrelevant data. |
| **External Services** | OpenAI/Anthropic (summarization, extraction) |
| **Lounge Pages** | Agent: Lead timeline. CRM: Lead activity tab. Manager: Conversation review. |
| **DB Tables Read** | `lead_activity`, `emails_sent`, `sms_messages`, `call_recordings`, `call_analysis`, `social_messages`, `notes` |
| **DB Tables Write** | `conversation_summaries`, `lead_key_facts`, `sentiment_history` |
| **Events Consumed** | `EMAIL_SENT`, `EMAIL_RECEIVED`, `SMS_SENT`, `SMS_RECEIVED`, `CALL_ENDED`, `SOCIAL_DM_SENT`, `SOCIAL_DM_RECEIVED`, `NOTE_ADDED` |
| **Events Produced** | `CONVERSATION_SUMMARIZED`, `KEY_FACT_EXTRACTED`, `SENTIMENT_CHANGED` |
| **Build Phase** | **Phase 3** |

---

## TIER 4: SALES INTELLIGENCE

### 8.14 AiSalesAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. Has placeholder for LLM integration. |
| **What Needs Wiring** | (1) LLM-powered sales script generation based on lead profile + product. (2) Objection handling responses. (3) Real-time call assistance (listen to transcript → suggest responses). (4) Quote comparison talking points. (5) Closing technique recommendations based on lead behavior. (6) Post-call summary and next-action suggestion. (7) Product knowledge base integration. |
| **External Services** | OpenAI GPT-4 / Anthropic Claude |
| **Lounge Pages** | Agent: AI Brief panel, Call coaching overlay, Script generator. |
| **DB Tables Read** | `leads`, `conversation_summaries`, `lead_key_facts`, `products`, `call_recordings`, `policies` |
| **DB Tables Write** | `ai_suggestions`, `script_usage_log` |
| **Events Consumed** | `CALL_STARTED`, `CALL_TRANSCRIPT_CHUNK`, `AI_BRIEF_REQUESTED`, `OBJECTION_DETECTED` |
| **Events Produced** | `AI_SUGGESTION_GENERATED`, `SCRIPT_GENERATED`, `OBJECTION_RESPONSE_READY`, `CALL_COACHING_SUGGESTION` |
| **Build Phase** | **Phase 3** |

### 8.15 HumanSalesAssistAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. No implementation. |
| **What Needs Wiring** | (1) Pre-call preparation brief assembly (lead history, enrichment, score, suggested approach). (2) Real-time dashboard for active call with lead context. (3) Quick-action buttons during call (send follow-up email, schedule callback, create quote). (4) Post-call workflow (disposition → next action → calendar update). (5) Warm transfer context package. |
| **External Services** | None (internal coordination). |
| **Lounge Pages** | Agent: Active call panel, Pre-call brief, Post-call workflow. |
| **DB Tables Read** | `leads`, `conversation_summaries`, `lead_key_facts`, `appointments`, `policies`, `enrichment_cache` |
| **DB Tables Write** | `lead_activity`, `call_dispositions` |
| **Events Consumed** | `CALL_STARTED`, `CALL_ENDED`, `AI_SUGGESTION_GENERATED` |
| **Events Produced** | `PRECALL_BRIEF_READY`, `POSTCALL_WORKFLOW_STARTED`, `WARM_TRANSFER_INITIATED` |
| **Build Phase** | **Phase 3** |

### 8.16 CallCoachingAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. No transcription or analysis. |
| **What Needs Wiring** | (1) Real-time transcription via Twilio Media Streams → OpenAI Whisper. (2) Sentiment analysis on transcript chunks. (3) Talk-time ratio calculation (agent vs prospect). (4) Keyword/phrase detection (competitor mentions, objections, buying signals). (5) Post-call scorecard generation. (6) Manager coaching queue with flagged calls. (7) Historical call analytics (avg sentiment, common objections). |
| **External Services** | OpenAI Whisper (transcription), OpenAI GPT-4 (analysis), Twilio Media Streams |
| **Lounge Pages** | Agent: Coaching suggestions (real-time during call). Manager: Coaching queue, Call scorecard review, Team call analytics. |
| **DB Tables Read** | `call_recordings`, `call_analysis`, `coaching_criteria` |
| **DB Tables Write** | `call_analysis`, `call_transcripts`, `coaching_scores`, `coaching_feedback` |
| **Events Consumed** | `CALL_STARTED`, `CALL_TRANSCRIPT_CHUNK`, `CALL_ENDED`, `CALL_RECORDING_READY` |
| **Events Produced** | `CALL_COACHING_SUGGESTION`, `CALL_SCORECARD_READY`, `COACHING_FLAG_RAISED`, `CALL_TRANSCRIPT_COMPLETE` |
| **Build Phase** | **Phase 3** |

---

## TIER 5: UNDERWRITING & COMPLIANCE

### 8.17 ComplianceAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. No rules engine. |
| **What Needs Wiring** | (1) TCPA consent verification before outbound calls/texts. (2) CAN-SPAM compliance checks on emails. (3) Do-Not-Call list checking. (4) State-specific insurance regulation rules. (5) Recording consent announcement verification. (6) Data retention policy enforcement. (7) HIPAA-adjacent rules for health insurance data. (8) Audit trail for all compliance-relevant actions. (9) Compliance score calculation. |
| **External Services** | DNC registry API, state regulation databases |
| **Lounge Pages** | Manager: Compliance dashboard. Admin: Compliance rules config. AI Lounge: Compliance agent status. |
| **DB Tables Read** | `leads`, `consent_records`, `dnc_list`, `call_recordings`, `emails_sent`, `sms_messages`, `compliance_rules` |
| **DB Tables Write** | `compliance_violations`, `compliance_checks`, `audit_log` |
| **Events Consumed** | `CALL_REQUESTED`, `SMS_SEND_REQUESTED`, `EMAIL_SEND_REQUESTED`, `LEAD_CREATED`, `POLICY_BOUND` |
| **Events Produced** | `COMPLIANCE_VIOLATION`, `COMPLIANCE_WARNING`, `COMPLIANCE_CLEARED`, `OUTREACH_BLOCKED` |
| **Build Phase** | **Phase 3** |

### 8.18 ApplicationCompletionAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. No form logic. |
| **What Needs Wiring** | (1) Dynamic insurance application form builder per carrier/product. (2) Auto-fill from lead data and enrichment. (3) Validation rules per carrier requirements. (4) Document upload handling (ID, proof of address, vehicle registration). (5) E-signature integration (DocuSign or native). (6) Application status tracking (draft → submitted → under review → approved/declined). (7) Missing information detection and request. |
| **External Services** | DocuSign API (e-signature), carrier application APIs |
| **Lounge Pages** | Agent: Application wizard. CRM: Lead documents tab. Client Portal: Application status. |
| **DB Tables Read** | `leads`, `enrichment_cache`, `applications`, `documents`, `carrier_requirements` |
| **DB Tables Write** | `applications`, `documents`, `application_status_log` |
| **Events Consumed** | `APPLICATION_STARTED`, `DOCUMENT_UPLOADED`, `ESIGNATURE_COMPLETED` |
| **Events Produced** | `APPLICATION_STARTED`, `APPLICATION_SUBMITTED`, `APPLICATION_COMPLETE`, `DOCUMENT_MISSING`, `APPLICATION_APPROVED`, `APPLICATION_DECLINED` |
| **Build Phase** | **Phase 4** |

### 8.19 UnderwritingIntelligenceAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. No carrier API connections. |
| **What Needs Wiring** | (1) Pre-qualification rules engine (age, state, driving record, health conditions). (2) Carrier appetite matching (which carriers will likely accept this risk). (3) Rate comparison across carriers. (4) Predictive approval probability. (5) Underwriting question anticipation. (6) Risk factor highlighting for agent awareness. |
| **External Services** | Carrier APIs (quoting/rating), third-party data (MVR, CLUE reports) |
| **Lounge Pages** | Agent: Quote comparison, Risk assessment. Manager: Underwriting analytics. |
| **DB Tables Read** | `leads`, `applications`, `carriers`, `carrier_products`, `underwriting_rules` |
| **DB Tables Write** | `quotes`, `underwriting_assessments`, `carrier_responses` |
| **Events Consumed** | `QUOTE_REQUESTED`, `APPLICATION_SUBMITTED`, `ENRICHMENT_COMPLETE` |
| **Events Produced** | `QUOTE_GENERATED`, `UNDERWRITING_ASSESSMENT_READY`, `CARRIER_MATCH_FOUND`, `RISK_FLAG_RAISED` |
| **Build Phase** | **Phase 5** |

### 8.20 PolicyRecommendationAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. No recommendation logic. |
| **What Needs Wiring** | (1) Coverage gap analysis based on lead profile. (2) Product recommendation engine (line of business, coverage level, riders). (3) Premium optimization (carrier comparison for best rate). (4) Cross-sell/upsell detection (auto → home bundle, life add-on). (5) Renewal recommendation adjustments. (6) Competitive comparison talking points. |
| **External Services** | Carrier APIs for real-time quoting |
| **Lounge Pages** | Agent: Recommendation panel on lead detail, Quote builder. |
| **DB Tables Read** | `leads`, `enrichment_cache`, `policies`, `products`, `carriers`, `carrier_products` |
| **DB Tables Write** | `recommendations`, `recommendation_log` |
| **Events Consumed** | `LEAD_ENRICHED`, `QUOTE_REQUESTED`, `POLICY_RENEWAL_UPCOMING`, `CROSS_SELL_OPPORTUNITY` |
| **Events Produced** | `RECOMMENDATION_READY`, `CROSS_SELL_IDENTIFIED`, `COVERAGE_GAP_FOUND` |
| **Build Phase** | **Phase 5** |

---

## TIER 6: REVENUE

### 8.21 BillingAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. Stripe SDK installed but not configured. |
| **What Needs Wiring** | (1) Stripe integration for premium collection (if agency-billed). (2) Payment method management (card, ACH). (3) Recurring billing schedule management. (4) Failed payment retry logic with notifications. (5) Payment reminder automation (7 days, 3 days, 1 day before due). (6) Grace period tracking. (7) Payment receipt generation. (8) Refund processing. |
| **External Services** | Stripe API |
| **Lounge Pages** | Client Portal: Billing page, Payment methods. Admin: Billing settings. Agent: Policy billing status. |
| **DB Tables Read** | `policies`, `billing_history`, `payment_methods`, `billing_schedules` |
| **DB Tables Write** | `billing_history`, `payment_methods`, `payment_reminders` |
| **Events Consumed** | `POLICY_ISSUED`, `PAYMENT_DUE`, `STRIPE_WEBHOOK`, `PAYMENT_METHOD_UPDATED` |
| **Events Produced** | `PAYMENT_RECEIVED`, `PAYMENT_FAILED`, `PAYMENT_REMINDER_SENT`, `PAYMENT_OVERDUE`, `REFUND_PROCESSED` |
| **Build Phase** | **Phase 4** |

### 8.22 CommissionAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. Commission rules table exists but no calculation engine. |
| **What Needs Wiring** | (1) Commission calculation engine based on carrier/product/tier rules. (2) Split commission handling (multiple agents). (3) Override/bonus calculation for managers. (4) Commission statement generation (monthly). (5) Advance vs. as-earned tracking. (6) Clawback logic for cancelled policies. (7) Commission forecasting based on pipeline. |
| **External Services** | None (internal calculation). |
| **Lounge Pages** | Agent: Commission dashboard. Manager: Team commissions. Executive: Commission expense. Admin: Commission rules config. |
| **DB Tables Read** | `policies`, `commission_rules`, `commissions`, `users` |
| **DB Tables Write** | `commissions`, `commission_statements`, `commission_adjustments` |
| **Events Consumed** | `POLICY_ISSUED`, `POLICY_RENEWED`, `POLICY_CANCELLED`, `PAYMENT_RECEIVED` |
| **Events Produced** | `COMMISSION_CALCULATED`, `COMMISSION_PAID`, `COMMISSION_CLAWBACK`, `COMMISSION_STATEMENT_READY` |
| **Build Phase** | **Phase 4** |

### 8.23 RevenueForecastAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. No forecasting logic. |
| **What Needs Wiring** | (1) Historical revenue aggregation by period/carrier/product/agent. (2) Pipeline-weighted forecast (lead score × expected premium × conversion probability). (3) Trend analysis with seasonal adjustments. (4) Revenue goal tracking vs. actuals. (5) What-if scenario modeling. (6) Renewal revenue prediction. (7) Monthly/quarterly/annual projections. |
| **External Services** | None (internal computation, potentially ML model later). |
| **Lounge Pages** | Executive: Revenue dashboard, Forecast charts, Breakdown views. Manager: Revenue by team. |
| **DB Tables Read** | `policies`, `commissions`, `leads`, `revenue_history`, `revenue_goals` |
| **DB Tables Write** | `revenue_forecasts`, `revenue_snapshots` |
| **Events Consumed** | `POLICY_ISSUED`, `POLICY_RENEWED`, `POLICY_CANCELLED`, `COMMISSION_CALCULATED`, `LEAD_STAGE_CHANGED` |
| **Events Produced** | `FORECAST_UPDATED`, `REVENUE_GOAL_MET`, `REVENUE_GOAL_AT_RISK`, `REVENUE_UPDATED` |
| **Build Phase** | **Phase 3** |

---

## TIER 7: CLIENT SERVICE

### 8.24 ClientPortalAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. Portal pages exist but show static/mock data. |
| **What Needs Wiring** | (1) Client authentication (separate from agent auth, or role-based). (2) Policy data retrieval from DB (or carrier API). (3) Digital ID card generation (PDF). (4) Policy document storage and retrieval. (5) Self-service account management. (6) Onboarding welcome flow for new clients. (7) Renewal self-service options. |
| **External Services** | Carrier APIs (policy data sync), PDF generation library |
| **Lounge Pages** | Client Portal: Dashboard, Policies list, Policy detail, Documents. |
| **DB Tables Read** | `policies`, `documents`, `clients`, `billing_history` |
| **DB Tables Write** | `client_preferences`, `portal_activity_log` |
| **Events Consumed** | `POLICY_ISSUED`, `POLICY_RENEWED`, `CLIENT_REGISTERED`, `DOCUMENT_UPLOADED` |
| **Events Produced** | `CLIENT_LOGGED_IN`, `CLIENT_VIEWED_POLICY`, `CLIENT_DOWNLOADED_DOCUMENT`, `CLIENT_ONBOARDING_COMPLETE` |
| **Build Phase** | **Phase 4** |

### 8.25 CustomerSupportAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. Ticket model exists, no automation. |
| **What Needs Wiring** | (1) AI chatbot for initial triage (FAQ answering via LLM). (2) Ticket auto-categorization. (3) Priority assignment based on client value and issue type. (4) Auto-routing to appropriate department/agent. (5) SLA tracking per ticket priority. (6) Canned response suggestions for agents. (7) Satisfaction survey after resolution. (8) Knowledge base article suggestion. |
| **External Services** | OpenAI/Anthropic (chatbot, categorization) |
| **Lounge Pages** | Client Portal: Support chat, Ticket list, Ticket detail. Agent: Support ticket queue. Manager: Support metrics. |
| **DB Tables Read** | `support_tickets`, `ticket_messages`, `knowledge_base`, `clients`, `policies` |
| **DB Tables Write** | `support_tickets`, `ticket_messages`, `satisfaction_surveys`, `support_metrics` |
| **Events Consumed** | `TICKET_CREATED`, `TICKET_MESSAGE_ADDED`, `CHAT_MESSAGE_RECEIVED` |
| **Events Produced** | `TICKET_CREATED`, `TICKET_RESPONSE`, `TICKET_RESOLVED`, `TICKET_ESCALATED`, `CSAT_RECEIVED` |
| **Build Phase** | **Phase 4** |

### 8.26 ClaimsAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. Claims table exists, no processing logic. |
| **What Needs Wiring** | (1) Claims intake form with dynamic fields per insurance type. (2) Document collection checklist (photos, police report, medical records). (3) Claims status tracking pipeline (filed → reviewing → adjusting → settled/denied). (4) Carrier claims API integration for status sync. (5) Automated status update notifications to client. (6) Claims analytics (frequency, avg settlement time, denial rate). |
| **External Services** | Carrier claims APIs |
| **Lounge Pages** | Client Portal: File claim, Claims list, Claim detail. Agent: Client claims view. Manager: Claims analytics. |
| **DB Tables Read** | `claims`, `policies`, `documents`, `clients` |
| **DB Tables Write** | `claims`, `claim_documents`, `claim_status_log`, `claim_notes` |
| **Events Consumed** | `CLAIM_FILED`, `CARRIER_CLAIM_UPDATE`, `DOCUMENT_UPLOADED` |
| **Events Produced** | `CLAIM_FILED`, `CLAIM_STATUS_CHANGED`, `CLAIM_SETTLED`, `CLAIM_DENIED`, `CLAIM_DOCUMENT_NEEDED` |
| **Build Phase** | **Phase 4** |

### 8.27 RetentionAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. No retention logic. |
| **What Needs Wiring** | (1) Policy renewal tracking (90/60/30 day reminders). (2) Churn risk scoring based on engagement, payment history, claims. (3) Re-quoting at renewal for better rates. (4) Win-back campaigns for lapsed policies. (5) Loyalty program tracking. (6) Referral program management. (7) Anniversary/birthday outreach. (8) Cross-sell timing optimization. |
| **External Services** | None (internal + triggers outreach agents). |
| **Lounge Pages** | Agent: Renewal queue. Manager: Retention dashboard. Executive: Retention KPIs. Client Portal: Referral page. |
| **DB Tables Read** | `policies`, `leads`, `billing_history`, `claims`, `lead_activity`, `referrals` |
| **DB Tables Write** | `retention_scores`, `renewal_reminders`, `referrals`, `loyalty_points` |
| **Events Consumed** | `POLICY_RENEWAL_UPCOMING`, `PAYMENT_FAILED`, `CLAIM_DENIED`, `POLICY_CANCELLED`, `REFERRAL_CREATED` |
| **Events Produced** | `POLICY_RENEWAL_REMINDER`, `CHURN_RISK_HIGH`, `WIN_BACK_TRIGGERED`, `REFERRAL_CREATED`, `CROSS_SELL_OPPORTUNITY` |
| **Build Phase** | **Phase 4** |

---

## TIER 8: MARKETING

### 8.28 SocialPostingAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. No API connections. |
| **What Needs Wiring** | (1) Facebook Page API posting (text, image, video, link). (2) Instagram API posting (feed, stories, reels). (3) LinkedIn company page posting. (4) Google Business Profile posting. (5) Content calendar with scheduling. (6) Post performance tracking (reach, engagement, clicks). (7) Hashtag management. (8) Best-time-to-post analysis. |
| **External Services** | Facebook Graph API, Instagram Graph API, LinkedIn API, Google Business Profile API |
| **Lounge Pages** | Marketing: Social calendar, Post composer, Analytics. |
| **DB Tables Read** | `social_posts`, `social_accounts`, `content_calendar` |
| **DB Tables Write** | `social_posts`, `social_analytics`, `content_calendar` |
| **Events Consumed** | `CONTENT_APPROVED`, `SOCIAL_POST_SCHEDULED`, `SOCIAL_POST_DUE` |
| **Events Produced** | `SOCIAL_POST_PUBLISHED`, `SOCIAL_ENGAGEMENT`, `SOCIAL_POST_FAILED` |
| **Build Phase** | **Phase 4** |

### 8.29 ContentGenerationAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. No LLM integration for content. |
| **What Needs Wiring** | (1) LLM-powered content generation (blog posts, social captions, email campaigns). (2) Brand voice training (tone, vocabulary, style guide adherence). (3) SEO optimization (keyword density, meta descriptions). (4) Image suggestion/generation (DALL-E or Midjourney API). (5) Content repurposing (blog → social posts → email). (6) Compliance review flag (insurance content regulations). (7) Content performance tracking to inform future generation. |
| **External Services** | OpenAI GPT-4 (text), DALL-E (images) |
| **Lounge Pages** | Marketing: Content studio, Template editor, Content library. |
| **DB Tables Read** | `content_library`, `brand_guidelines`, `content_performance`, `email_templates` |
| **DB Tables Write** | `content_library`, `generated_content_log` |
| **Events Consumed** | `CONTENT_REQUESTED`, `CONTENT_REPURPOSE_REQUESTED` |
| **Events Produced** | `CONTENT_GENERATED`, `CONTENT_APPROVED`, `CONTENT_REJECTED` |
| **Build Phase** | **Phase 4** |

### 8.30 ReputationAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. No review platform connections. |
| **What Needs Wiring** | (1) Google Business Profile review monitoring. (2) Facebook page review monitoring. (3) Yelp review monitoring (scraping, no official API). (4) Review response drafting via LLM. (5) Review request automation (post-policy-issuance, post-claim-settlement). (6) Reputation score calculation (weighted average across platforms). (7) Negative review alerts. (8) Review widget for website embedding. |
| **External Services** | Google Business Profile API, Facebook API, OpenAI (response drafting) |
| **Lounge Pages** | Marketing: Reputation dashboard, Review feed, Response queue. |
| **DB Tables Read** | `reviews`, `review_responses`, `clients`, `policies` |
| **DB Tables Write** | `reviews`, `review_responses`, `review_requests`, `reputation_scores` |
| **Events Consumed** | `REVIEW_RECEIVED`, `POLICY_ISSUED`, `CLAIM_SETTLED`, `REVIEW_RESPONSE_DRAFTED` |
| **Events Produced** | `REVIEW_RECEIVED`, `REPUTATION_SCORE_CHANGED`, `NEGATIVE_REVIEW_ALERT`, `REVIEW_REQUEST_SENT` |
| **Build Phase** | **Phase 4** |

---

## TIER 9: ANALYTICS

### 8.31 RealTimeAnalyticsAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. Dashboard pages show mock charts. |
| **What Needs Wiring** | (1) Real-time event counting and aggregation (events per minute, per type). (2) Dashboard metric computation (conversion rates, response times, pipeline velocity). (3) Time-series data storage for trend charts. (4) Anomaly detection (unusual spikes/drops in key metrics). (5) Custom report builder. (6) Data export (CSV, PDF). (7) Metric caching with TTL for performance. |
| **External Services** | None (internal computation). |
| **Lounge Pages** | ALL lounges use analytics data. Primary: Executive dashboard, Manager dashboard, Agent dashboard. |
| **DB Tables Read** | ALL tables (aggregation queries across the entire database) |
| **DB Tables Write** | `analytics_snapshots`, `metric_cache`, `anomaly_log` |
| **Events Consumed** | ALL EventTypes (listens to everything for counting/aggregation) |
| **Events Produced** | `ANALYTICS_UPDATED`, `ANOMALY_DETECTED`, `THRESHOLD_BREACHED` |
| **Build Phase** | **Phase 1** (basic), **Phase 3** (full) |

### 8.32 AgentPerformanceAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. No performance calculation. |
| **What Needs Wiring** | (1) Per-agent metric tracking: calls made, emails sent, appointments set, quotes generated, policies sold, premium volume. (2) Response time tracking (speed to lead). (3) Conversion rate calculation per funnel stage. (4) Leaderboard ranking with configurable metrics. (5) Goal progress tracking (vs. manager-set targets). (6) Performance trending (improving/declining). (7) Gamification hooks (badges, streaks). |
| **External Services** | None (internal computation). |
| **Lounge Pages** | Agent: My Performance. Manager: Team Performance, Leaderboard. Executive: Agent Rankings. |
| **DB Tables Read** | `leads`, `call_recordings`, `emails_sent`, `appointments`, `policies`, `commissions`, `goals` |
| **DB Tables Write** | `performance_metrics`, `leaderboard_snapshots`, `badges`, `streaks` |
| **Events Consumed** | `CALL_ENDED`, `EMAIL_SENT`, `APPOINTMENT_SCHEDULED`, `QUOTE_GENERATED`, `POLICY_ISSUED`, `LEAD_ASSIGNED` |
| **Events Produced** | `PERFORMANCE_UPDATED`, `GOAL_ACHIEVED`, `STREAK_MILESTONE`, `RANKING_CHANGED` |
| **Build Phase** | **Phase 3** |

### 8.33 OptimizationAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. No optimization logic. |
| **What Needs Wiring** | (1) A/B test framework (email subjects, call scripts, landing pages). (2) Statistical significance calculation. (3) Automatic winner selection and rollout. (4) Sequence optimization (best performing step order). (5) Send-time optimization (per lead timezone and engagement history). (6) Lead assignment optimization (match agent strengths to lead types). (7) Budget allocation recommendations. |
| **External Services** | None (internal computation). |
| **Lounge Pages** | Manager: A/B test dashboard, Optimization recommendations. Marketing: Campaign optimization. AI Lounge: Optimization agent config. |
| **DB Tables Read** | `ab_tests`, `ab_test_variants`, `ab_test_results`, `sequence_analytics`, `email_events`, `leads` |
| **DB Tables Write** | `ab_tests`, `ab_test_variants`, `ab_test_results`, `optimization_recommendations` |
| **Events Consumed** | `AB_TEST_RESULT`, `EMAIL_OPENED`, `EMAIL_CLICKED`, `APPOINTMENT_SCHEDULED`, `POLICY_ISSUED` |
| **Events Produced** | `AB_TEST_WINNER_FOUND`, `OPTIMIZATION_RECOMMENDATION`, `SEND_TIME_OPTIMIZED` |
| **Build Phase** | **Phase 5** |

---

## TIER 10: INFRASTRUCTURE

### 8.34 SecurityAgent

| Field | Detail |
|-------|--------|
| **Current State** | Basic JWT auth implemented. No advanced security monitoring. |
| **What Needs Wiring** | (1) Rate limiting per IP and per user. (2) Brute force login detection and lockout. (3) Session management (concurrent session limits). (4) API key management for integrations. (5) Audit logging for all sensitive operations. (6) IP allowlist/blocklist. (7) CSRF protection. (8) Input sanitization layer. (9) Suspicious activity detection (unusual login location, rapid data access). |
| **External Services** | None (internal security). |
| **Lounge Pages** | Admin: Security settings, Audit log, Active sessions. AI Lounge: Security agent status. |
| **DB Tables Read** | `users`, `sessions`, `audit_log`, `api_keys`, `ip_rules` |
| **DB Tables Write** | `audit_log`, `security_events`, `login_attempts`, `sessions` |
| **Events Consumed** | `USER_LOGIN`, `USER_LOGOUT`, `API_REQUEST`, `PERMISSION_DENIED`, `RATE_LIMIT_HIT` |
| **Events Produced** | `SECURITY_ALERT`, `ACCOUNT_LOCKED`, `SUSPICIOUS_ACTIVITY`, `RATE_LIMIT_HIT` |
| **Build Phase** | **Phase 1** |

### 8.35 ErrorRecoveryAgent

| Field | Detail |
|-------|--------|
| **Current State** | Basic try/catch in agent handlers. No systematic recovery. |
| **What Needs Wiring** | (1) Global error handler with categorization (transient, permanent, unknown). (2) Automatic retry with exponential backoff for transient errors. (3) Circuit breaker pattern for external service calls. (4) Graceful degradation (disable non-critical features on failure). (5) Error notification to admin. (6) Dead letter queue processing. (7) Health check ping loop for all agents. (8) Auto-restart for crashed agents. |
| **External Services** | None (internal infrastructure). |
| **Lounge Pages** | AI Lounge: Error log, Dead letter queue, Circuit breaker status. Admin: System health. |
| **DB Tables Read** | `error_log`, `dead_letter_queue`, `circuit_breaker_state` |
| **DB Tables Write** | `error_log`, `dead_letter_queue`, `circuit_breaker_state`, `recovery_log` |
| **Events Consumed** | `SYSTEM_ERROR`, `AGENT_ERROR`, `EXTERNAL_SERVICE_FAILURE`, `HEALTH_CHECK_FAILED` |
| **Events Produced** | `SYSTEM_ERROR`, `SYSTEM_RECOVERY`, `CIRCUIT_BREAKER_OPENED`, `CIRCUIT_BREAKER_CLOSED`, `DEAD_LETTER_PROCESSED` |
| **Build Phase** | **Phase 1** |

### 8.36 HumanEscalationAgent

| Field | Detail |
|-------|--------|
| **Current State** | Scaffolded. Escalation table exists, no routing logic. |
| **What Needs Wiring** | (1) Escalation triggers (AI confidence below threshold, client anger detection, compliance issue, VIP lead). (2) Priority routing (P1 → immediate SMS to manager, P2 → notification, P3 → queue). (3) Escalation acknowledgment tracking. (4) SLA monitoring for escalation response time. (5) Escalation resolution workflow. (6) Escalation analytics (frequency, resolution time, root causes). |
| **External Services** | Twilio (for urgent SMS to managers), SendGrid (email notifications) |
| **Lounge Pages** | Manager: Escalation queue, Escalation detail. Agent: Escalation button on lead detail. AI Lounge: Escalation agent config. |
| **DB Tables Read** | `escalations`, `leads`, `users`, `escalation_rules` |
| **DB Tables Write** | `escalations`, `escalation_activity`, `escalation_sla_log` |
| **Events Consumed** | `ESCALATION_REQUESTED`, `AI_CONFIDENCE_LOW`, `SENTIMENT_NEGATIVE`, `COMPLIANCE_VIOLATION`, `SLA_BREACH` |
| **Events Produced** | `ESCALATION_CREATED`, `ESCALATION_ACKNOWLEDGED`, `ESCALATION_RESOLVED`, `ESCALATION_SLA_BREACH` |
| **Build Phase** | **Phase 3** |

### 8.37 TrainingAgent

| Field | Detail |
|-------|--------|
| **Current State** | Not implemented. No training infrastructure. |
| **What Needs Wiring** | (1) Training data collection from successful interactions (closed deals, high CSAT). (2) Prompt improvement loop (analyze AI suggestion acceptance rate → refine prompts). (3) Agent onboarding training module (interactive tutorials). (4) Knowledge base management (product info, carrier guides, objection scripts). (5) Quiz/assessment system for sales agents. (6) Best practice extraction from top performers. (7) Model fine-tuning data pipeline (future). |
| **External Services** | OpenAI (for fine-tuning data prep, future) |
| **Lounge Pages** | AI Lounge: Training data, Prompt performance. Manager: Training modules, Agent certifications. Admin: Knowledge base editor. |
| **DB Tables Read** | `ai_suggestions`, `script_usage_log`, `call_analysis`, `coaching_scores`, `knowledge_base` |
| **DB Tables Write** | `training_data`, `prompt_versions`, `training_modules`, `assessments`, `certifications` |
| **Events Consumed** | `AI_SUGGESTION_GENERATED`, `AI_SUGGESTION_ACCEPTED`, `AI_SUGGESTION_REJECTED`, `COACHING_FLAG_RAISED`, `POLICY_ISSUED` |
| **Events Produced** | `TRAINING_DATA_COLLECTED`, `PROMPT_UPDATED`, `ASSESSMENT_COMPLETED`, `CERTIFICATION_EARNED` |
| **Build Phase** | **Phase 5** |

---


# 9. EXTERNAL INTEGRATIONS ROADMAP

## 9.1 Twilio

| Aspect | Detail |
|--------|--------|
| **What It Does** | Voice calls (outbound/inbound), SMS/MMS messaging, phone number provisioning, call recording, media streams for real-time transcription |
| **Agents Using It** | DialerAgent, SmsMessagingAgent, InboundResponseAgent, CallCoachingAgent (media streams), HumanEscalationAgent (urgent SMS) |
| **Setup Steps** | 1. Create Twilio account → get Account SID + Auth Token. 2. Purchase phone number(s) with voice + SMS capability. 3. Configure Voice webhook URL: `POST /api/webhooks/twilio/voice`. 4. Configure SMS webhook URL: `POST /api/webhooks/twilio/sms`. 5. Configure status callback URLs for call/message status. 6. Set up Twilio Client JS SDK for browser-based calling. 7. Register A2P 10DLC brand + campaign for SMS compliance. 8. Configure recording storage (Twilio-hosted or S3). |
| **Webhook Handlers** | `POST /api/webhooks/twilio/voice` — Inbound call routing (TwiML response). `POST /api/webhooks/twilio/voice/status` — Call status updates (ringing, answered, completed). `POST /api/webhooks/twilio/sms` — Inbound SMS messages. `POST /api/webhooks/twilio/sms/status` — SMS delivery status. `POST /api/webhooks/twilio/recording` — Recording ready notification. `POST /api/webhooks/twilio/media-stream` — Real-time audio stream (WebSocket). |
| **Env Vars** | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `TWILIO_TWIML_APP_SID`, `TWILIO_API_KEY`, `TWILIO_API_SECRET` |
| **Estimated Cost** | Phone number: $1.15/mo. Outbound calls: $0.014/min. Inbound calls: $0.0085/min. SMS outbound: $0.0079/msg. SMS inbound: $0.0075/msg. Recording storage: $0.0025/min. A2P registration: $4/mo brand + $15 campaign. **Estimated monthly (100 agents, moderate usage): $500-2,000.** |
| **Compliance** | TCPA consent required before outbound calls/texts. A2P 10DLC mandatory for application-to-person messaging. Call recording consent announcement required (varies by state — one-party vs two-party). DNC list checking before dialing. STIR/SHAKEN compliance for caller ID. |

## 9.2 OpenAI / Anthropic

| Aspect | Detail |
|--------|--------|
| **What It Does** | LLM for content generation, sales scripts, call coaching, intent classification, chatbot, conversation summarization, sentiment analysis, review response drafting |
| **Agents Using It** | AiSalesAgent, CallCoachingAgent, InboundResponseAgent, ConversationMemoryAgent, ContentGenerationAgent, CustomerSupportAgent, ReputationAgent, TrainingAgent |
| **Setup Steps** | 1. Create OpenAI account → generate API key. 2. (Optional) Create Anthropic account for Claude as backup/alternative. 3. Set up API key rotation schedule. 4. Configure model selection per use case (GPT-4 for complex, GPT-3.5-turbo for simple). 5. Implement token usage tracking and budget alerts. 6. Set up prompt versioning system. 7. Configure Whisper API for transcription. |
| **Webhook Handlers** | None (polling/request-response model). For streaming responses, use SSE endpoints. |
| **Env Vars** | `OPENAI_API_KEY`, `OPENAI_ORG_ID`, `OPENAI_MODEL_DEFAULT` (e.g., `gpt-4-turbo`), `OPENAI_MODEL_FAST` (e.g., `gpt-3.5-turbo`), `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL_DEFAULT` (e.g., `claude-3-sonnet`), `AI_PROVIDER` (openai|anthropic), `AI_MAX_TOKENS_PER_REQUEST`, `AI_MONTHLY_BUDGET_CENTS` |
| **Estimated Cost** | GPT-4-turbo: $10/1M input tokens, $30/1M output tokens. GPT-3.5-turbo: $0.50/1M input, $1.50/1M output. Whisper: $0.006/min. DALL-E 3: $0.04-0.08/image. Claude 3 Sonnet: $3/1M input, $15/1M output. **Estimated monthly: $200-1,500 depending on call volume and content generation.** |
| **Compliance** | Do NOT send PII in prompts unless using data processing agreement. Implement PII scrubbing before LLM calls. Log all LLM interactions for audit. Review OpenAI's data usage policy (API data not used for training by default). HIPAA: Do NOT send health data unless using compliant endpoint. |

## 9.3 Stripe

| Aspect | Detail |
|--------|--------|
| **What It Does** | Payment processing for agency-billed premiums, subscription management, payment method storage, invoicing, refunds |
| **Agents Using It** | BillingAgent |
| **Setup Steps** | 1. Create Stripe account → get publishable + secret keys. 2. Configure webhook endpoint: `POST /api/webhooks/stripe`. 3. Set up Stripe Elements or Payment Intents for client-side payment forms. 4. Configure products and prices for premium plans. 5. Set up customer records linked to client accounts. 6. Enable automatic retry for failed payments. 7. Configure Stripe Radar for fraud detection. |
| **Webhook Handlers** | `POST /api/webhooks/stripe` — Handles: `payment_intent.succeeded`, `payment_intent.payment_failed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`, `charge.dispute.created` |
| **Env Vars** | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_DEFAULT` |
| **Estimated Cost** | 2.9% + $0.30 per transaction. ACH: 0.8% capped at $5. Disputes: $15/dispute. Stripe Radar: $0.05/screened transaction. **Cost scales with premium volume — typically 2.9% of collected premiums.** |
| **Compliance** | PCI DSS compliance (handled by Stripe.js — never touch raw card numbers). Strong Customer Authentication (SCA) for EU clients if applicable. Store only Stripe customer IDs and payment method tokens — never card numbers. |

## 9.4 SendGrid

| Aspect | Detail |
|--------|--------|
| **What It Does** | Transactional and marketing email delivery, email templates, open/click tracking, bounce/spam handling, inbound email parsing |
| **Agents Using It** | EmailOutreachAgent, InboundResponseAgent, ContentGenerationAgent, RetentionAgent |
| **Setup Steps** | 1. Create SendGrid account → generate API key. 2. Configure domain authentication (SPF, DKIM, DMARC). 3. Set up Inbound Parse webhook: `POST /api/webhooks/sendgrid/inbound`. 4. Configure Event Webhook: `POST /api/webhooks/sendgrid/events`. 5. Set up IP warmup schedule for new sending IPs. 6. Create suppression groups for unsubscribe management. 7. Configure dedicated IP (recommended for >50k emails/month). |
| **Webhook Handlers** | `POST /api/webhooks/sendgrid/events` — Handles: `delivered`, `open`, `click`, `bounce`, `spam_report`, `unsubscribe`, `dropped`. `POST /api/webhooks/sendgrid/inbound` — Handles parsed inbound emails (from, to, subject, body, attachments). |
| **Env Vars** | `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME`, `SENDGRID_WEBHOOK_VERIFICATION_KEY`, `SENDGRID_INBOUND_DOMAIN` |
| **Estimated Cost** | Free tier: 100 emails/day. Essentials: $19.95/mo (50k emails). Pro: $89.95/mo (100k emails + dedicated IP). **Estimated monthly: $20-90 for typical agency volume.** |
| **Compliance** | CAN-SPAM: Include physical address, unsubscribe link in every email. GDPR: Consent tracking for EU recipients. Domain authentication (SPF/DKIM) to avoid spam filters. Suppression list management (honor unsubscribes immediately). |

## 9.5 Facebook / Instagram API

| Aspect | Detail |
|--------|--------|
| **What It Does** | Social media posting, lead ad form capture, page review monitoring, Instagram feed/stories posting, Messenger chatbot, engagement tracking |
| **Agents Using It** | SocialPostingAgent, SocialDmAgent, LeadDiscoveryAgent, ReputationAgent |
| **Setup Steps** | 1. Create Facebook Developer App. 2. Configure Facebook Login → get Page access tokens. 3. Subscribe to Lead Ads webhooks. 4. Configure Instagram Graph API access. 5. Set up Messenger Platform webhook. 6. Request `pages_manage_posts`, `pages_read_engagement`, `leads_retrieval`, `instagram_basic`, `instagram_content_publish` permissions. 7. Submit for App Review (required for production). |
| **Webhook Handlers** | `POST /api/webhooks/facebook` — Handles: `leadgen` (Lead Ads), `feed` (page post comments), `messages` (Messenger), `ratings` (page reviews). `GET /api/webhooks/facebook` — Webhook verification challenge. |
| **Env Vars** | `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `FACEBOOK_PAGE_ID`, `FACEBOOK_PAGE_ACCESS_TOKEN`, `FACEBOOK_VERIFY_TOKEN`, `INSTAGRAM_BUSINESS_ACCOUNT_ID` |
| **Estimated Cost** | API access: Free. Lead Ads: Paid via Facebook Ads Manager (CPC/CPM). Messenger API: Free. **Cost is ad spend, not API — typically $500-5,000/mo for lead generation.** |
| **Compliance** | Meta Platform Terms: Cannot store data >24 months without re-consent. Must delete user data on request. Lead Ad data must be used per consent. Rate limits: 200 calls/hour per user token. |

## 9.6 LinkedIn API

| Aspect | Detail |
|--------|--------|
| **What It Does** | Company page posting, professional profile data enrichment, InMail automation (limited) |
| **Agents Using It** | SocialPostingAgent, SocialDmAgent, DataEnrichmentAgent |
| **Setup Steps** | 1. Create LinkedIn Developer App. 2. Request Marketing Developer Platform (MDP) access. 3. Configure OAuth 2.0 flow for company page admin. 4. Set up posting permissions (`w_organization_social`). 5. Note: InMail API very restricted — may need Sales Navigator API. |
| **Webhook Handlers** | None (polling model for analytics). |
| **Env Vars** | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_ORGANIZATION_ID` |
| **Estimated Cost** | API access: Free. Sales Navigator (for InMail): $99.99/mo/seat. **Estimated: $0-100/mo.** |
| **Compliance** | LinkedIn API Terms: No scraping, no automated InMail without Sales Navigator. Rate limits: 100 requests/day for most endpoints. Data retention rules per LinkedIn's API agreement. |

## 9.7 Google Business Profile API

| Aspect | Detail |
|--------|--------|
| **What It Does** | Manage business listing, post updates, monitor/respond to reviews, track local search performance |
| **Agents Using It** | ReputationAgent, SocialPostingAgent |
| **Setup Steps** | 1. Create Google Cloud project. 2. Enable Google Business Profile API. 3. Set up OAuth 2.0 for account access. 4. Verify business ownership. 5. Configure service account for automated access. |
| **Webhook Handlers** | None (polling model — check reviews every 15 minutes). |
| **Env Vars** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_BUSINESS_ACCOUNT_ID`, `GOOGLE_BUSINESS_LOCATION_ID` |
| **Estimated Cost** | Free. |
| **Compliance** | Google API Terms of Service. Review response guidelines (no incentivized reviews). Rate limits per Google's quota system. |

## 9.8 Carrier APIs

| Aspect | Detail |
|--------|--------|
| **What It Does** | Real-time quoting/rating, application submission, policy issuance, claims status, commission tracking, policy data sync |
| **Agents Using It** | UnderwritingIntelligenceAgent, PolicyRecommendationAgent, ApplicationCompletionAgent, ClaimsAgent, ClientPortalAgent, CommissionAgent |
| **Setup Steps** | Varies by carrier. General pattern: 1. Apply for API access through carrier portal or wholesale partner. 2. Obtain API credentials (often separate test + production). 3. Implement carrier-specific request/response formats (ACORD XML or proprietary JSON). 4. Configure product mapping (carrier codes → internal product IDs). 5. Set up commission schedule import. 6. Test with sandbox environment. |
| **Webhook Handlers** | `POST /api/webhooks/carrier/:carrierId` — Generic handler routed by carrier ID. Handles: policy status changes, claim updates, commission statements, rate changes. |
| **Env Vars** | Per carrier: `CARRIER_{NAME}_API_URL`, `CARRIER_{NAME}_API_KEY`, `CARRIER_{NAME}_AGENT_CODE`, `CARRIER_{NAME}_SANDBOX` (true/false) |
| **Estimated Cost** | Most carrier APIs: Free (they want you selling their products). Some aggregator platforms (e.g., Vertafore, Applied Epic): $100-500/mo. |
| **Compliance** | State insurance regulations for quoting/binding. E&O (Errors & Omissions) insurance required. Agent licensing verification. State-specific disclosure requirements. NAIC data standards. |

## 9.9 Clearbit / ZoomInfo

| Aspect | Detail |
|--------|--------|
| **What It Does** | Contact and company data enrichment — job title, company, revenue, social profiles, tech stack, location, demographics |
| **Agents Using It** | DataEnrichmentAgent |
| **Setup Steps** | 1. Sign up for Clearbit or ZoomInfo API plan. 2. Get API key. 3. Implement enrichment request on lead creation. 4. Set up caching to avoid duplicate lookups. 5. Configure fallback (Clearbit → ZoomInfo → skip). |
| **Webhook Handlers** | Clearbit: `POST /api/webhooks/clearbit` — Async enrichment complete notification. ZoomInfo: None (synchronous API). |
| **Env Vars** | `CLEARBIT_API_KEY`, `ZOOMINFO_API_KEY`, `ZOOMINFO_USERNAME`, `ENRICHMENT_PROVIDER` (clearbit|zoominfo|both) |
| **Estimated Cost** | Clearbit: $99-999/mo depending on volume (250-10,000 enrichments/mo). ZoomInfo: $10,000-25,000/year (enterprise pricing). **Recommended: Start with Clearbit at $99/mo.** |
| **Compliance** | GDPR: Clearbit/ZoomInfo handle data sourcing compliance, but you must still honor opt-outs. CCPA: Must disclose data enrichment in privacy policy. Data retention: Don't cache enrichment data beyond 90 days without re-verification. |

---


# 10. PHASED BUILD ROADMAP

> **Timeline:** 12 weeks from kickoff to full-platform launch.
> **Methodology:** Each phase builds on the previous. Nothing ships until the "Definition of Done" criteria are met. Every phase ends with a working demo Gaetano can click through.

---

## Phase 1 — Foundation (Weeks 1–3)

### Theme: "Make It Real"
Get data flowing, roles enforced, layouts rendered, and the AI event bus humming. By the end of Phase 1, Gaetano can log in, see leads in a pipeline, watch AI agents process events in real time, and know the system is alive.

### Pages & Routes Built

| Lounge | Route | Page | Description |
|--------|-------|------|-------------|
| **AI Lounge** | `/ai/nerve-center` | AI Nerve Center | Real-time dashboard showing all 37 agents: status (active/idle/error), events processed, last heartbeat, memory usage. Central command for the AI army. |
| **AI Lounge** | `/ai/events` | AI Event Stream | Live-scrolling event feed. Every EventType flowing through the system displayed with timestamp, source agent, target agent, payload preview. Filterable by agent, event type, severity. |
| **CRM Lounge** | `/crm/pipeline` | Pipeline Board | Kanban board with columns: New → Contacted → Qualified → Appointment Set → Quoted → Application → Underwriting → Won → Lost. Drag-and-drop cards. Each card shows lead name, score, source, last activity, assigned agent. |
| **CRM Lounge** | `/crm/leads/:id` | Lead Profile | Full lead detail page: contact info, enrichment data, score breakdown, activity timeline, communication history, assigned AI agents, notes, tags, policy history. |
| **CRM Lounge** | `/crm/inbound` | Inbound Queue | Real-time queue of incoming leads from all sources (quote forms, referrals, web scraping, purchased lists). Shows time-since-arrival, source, auto-score, and one-click actions (claim, assign, dismiss). |
| **All Lounges** | `/[lounge]/*` | Layout Shells | All 8 lounge layout components built with sidebar navigation, header with lounge name/icon, breadcrumbs, and placeholder content. Navigation between lounges works. |

### API Routes Created

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/agents` | List all 37 agents with current status |
| `GET` | `/api/agents/:id/events` | Get event history for specific agent |
| `GET` | `/api/events` | Paginated event stream (SSE endpoint for real-time) |
| `POST` | `/api/events` | Manually emit an event (admin/testing) |
| `GET` | `/api/leads` | List leads with filtering, sorting, pagination |
| `GET` | `/api/leads/:id` | Full lead detail with enrichment + activity |
| `POST` | `/api/leads` | Create lead manually |
| `PATCH` | `/api/leads/:id` | Update lead fields |
| `GET` | `/api/leads/:id/activities` | Lead activity timeline |
| `GET` | `/api/pipeline` | Pipeline stage counts and totals |
| `PATCH` | `/api/pipeline/:leadId/stage` | Move lead between pipeline stages |
| `GET` | `/api/inbound` | Inbound lead queue |
| `POST` | `/api/inbound/:id/claim` | Claim a lead from inbound queue |
| `GET` | `/api/users/me` | Current user profile + role |
| `POST` | `/api/auth/login` | Authentication endpoint |
| `POST` | `/api/auth/refresh` | Token refresh |
| `WS` | `/ws` | WebSocket connection for real-time events |

### Database Tables & Migrations

```sql
-- Migration: 001_foundation_tables.sql

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id),
    agent_user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    appointment_type VARCHAR(50) NOT NULL, -- 'phone', 'video', 'in_person'
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status VARCHAR(30) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'
    google_calendar_event_id VARCHAR(255),
    reminder_sent_at TIMESTAMPTZ,
    notes TEXT,
    outcome TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE outreach_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id),
    agent_name VARCHAR(100) NOT NULL, -- AI agent or human user
    channel VARCHAR(30) NOT NULL, -- 'email', 'sms', 'phone', 'social_dm'
    direction VARCHAR(10) NOT NULL, -- 'outbound', 'inbound'
    subject VARCHAR(500),
    body TEXT,
    status VARCHAR(30) DEFAULT 'sent', -- 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'failed'
    external_id VARCHAR(255), -- Twilio SID, Gmail message ID, etc.
    metadata JSONB DEFAULT '{}',
    compliance_checked BOOLEAN DEFAULT FALSE,
    compliance_result JSONB,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agent_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    source_agent VARCHAR(100) NOT NULL,
    target_agent VARCHAR(100),
    payload JSONB NOT NULL DEFAULT '{}',
    correlation_id UUID, -- tracks related events across agents
    parent_event_id UUID REFERENCES agent_events(id),
    status VARCHAR(30) DEFAULT 'emitted', -- 'emitted', 'processing', 'completed', 'failed', 'dead_letter'
    error_message TEXT,
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE TABLE automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_event VARCHAR(100) NOT NULL, -- EventType that fires this rule
    conditions JSONB DEFAULT '{}', -- conditions that must be true
    actions JSONB NOT NULL, -- array of actions to take
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_appointments_lead_id ON appointments(lead_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_outreach_log_lead_id ON outreach_log(lead_id);
CREATE INDEX idx_outreach_log_channel ON outreach_log(channel);
CREATE INDEX idx_outreach_log_sent_at ON outreach_log(sent_at);
CREATE INDEX idx_agent_events_event_type ON agent_events(event_type);
CREATE INDEX idx_agent_events_source_agent ON agent_events(source_agent);
CREATE INDEX idx_agent_events_correlation_id ON agent_events(correlation_id);
CREATE INDEX idx_agent_events_created_at ON agent_events(created_at);
CREATE INDEX idx_automation_rules_trigger ON automation_rules(trigger_event) WHERE is_active = TRUE;

-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'agent'
    CHECK (role IN ('owner', 'admin', 'manager', 'agent', 'client', 'viewer'));
```

### Agent Wiring Work

| Agent | Work Required | Details |
|-------|--------------|---------|
| **DatabaseBridge** | Fix bidirectional sync | Currently MemoryGraph → PostgreSQL is one-way. Implement PostgreSQL change listeners (LISTEN/NOTIFY) so DB writes from the API propagate back to MemoryGraph. Add conflict resolution: last-write-wins with timestamp comparison. Add retry queue for failed syncs. |
| **ErrorRecoveryAgent** | Auto-restart crashed agents | Monitor agent heartbeats (every 30s). If an agent misses 3 consecutive heartbeats, attempt restart. Escalation ladder: restart → restart with fresh state → disable + alert Gaetano. Log all recovery attempts to agent_events. |
| **SecurityAgent** | Rate limiting | Implement per-IP and per-user rate limits. API: 100 req/min per user, 20 req/min unauthenticated. WebSocket: 50 messages/min. Login: 5 attempts/15 min then lockout. Track in Redis (or in-memory Map with TTL for MVP). |
| **OrchestratorAgent** | Event routing foundation | Ensure all EventTypes are properly routed between agents. Build the correlation_id chain so every event in a flow can be traced back to the originating trigger. |

### External Integrations

| Integration | Setup Work |
|-------------|-----------|
| **PostgreSQL** | Production database connection pooling (pg-pool, max 20 connections). Run all migrations. Seed with sample data (50 test leads, 5 users with different roles). |
| **WebSocket Server** | Socket.io server on `/ws`. Rooms per lounge, per user. Authentication via JWT on connection. Event broadcasting from agent_events table. |
| **Redis** (optional MVP) | Session storage, rate limiting counters, real-time pub/sub for multi-instance support. Can defer to in-memory for single-instance MVP. |

### Definition of "Done" — Phase 1

- [ ] Gaetano can log in and is recognized as `role: 'owner'`
- [ ] All 8 lounge shells render with working navigation
- [ ] CRM Pipeline Board shows leads in correct stages, drag-and-drop works
- [ ] Lead Profile page displays all lead data with activity timeline
- [ ] Inbound Queue shows new leads arriving in real time (via WebSocket)
- [ ] AI Nerve Center shows all 37 agents with live status
- [ ] AI Event Stream displays events flowing in real time
- [ ] DatabaseBridge syncs bidirectionally without data loss
- [ ] ErrorRecoveryAgent automatically restarts a crashed test agent
- [ ] SecurityAgent blocks requests exceeding rate limits
- [ ] RBAC prevents `agent` role from accessing `/executive/*` routes
- [ ] All new tables created and seeded with test data
- [ ] WebSocket connections authenticated and room-based

### What Becomes Functional

**Gaetano can now:**
- See his entire pipeline at a glance
- Click into any lead and see their full history
- Watch AI agents process events in real time
- Know immediately when a new lead arrives
- Trust that the system won't lose data between MemoryGraph and PostgreSQL
- Know that crashed agents auto-recover

---

## Phase 2 — Communication (Weeks 3–5)

### Theme: "Make It Talk"
The system can now send emails, SMS messages, and make phone calls. Appointments sync to Google Calendar. Every outbound communication is compliance-checked before sending. Gaetano gets notified when a human is needed.

### Pages & Routes Built

| Lounge | Route | Page | Description |
|--------|-------|------|-------------|
| **CRM Lounge** | `/crm/outreach` | Outreach Center | Unified view of all outbound communications across channels (email, SMS, phone). Filter by lead, agent, channel, status. Shows delivery rates, open rates, reply rates. One-click to compose new outreach. |
| **CRM Lounge** | `/crm/appointments` | Appointment Scheduler | Calendar view (day/week/month) showing all appointments. Click to create, reschedule, cancel. Color-coded by type (phone/video/in-person) and status. Syncs with Google Calendar bidirectionally. |
| **Agent Lounge** | `/agents/call-assist` | Call Assist | Real-time call assistance screen. When Gaetano is on a call, shows: lead profile summary, talking points, objection handlers, product recommendations, premium estimates, competitor comparisons. Listens to call (with consent) and updates suggestions dynamically. |
| **Agent Lounge** | `/agents/copilot` | Agent Copilot | AI assistant chat interface for agents. Ask questions about leads, get email drafts, request call scripts, check compliance rules, look up carrier products. Powered by AiSalesAgent + knowledge base. |
| **AI Lounge** | `/ai/comms` | Communications Log | Complete log of every AI-generated communication. Shows original draft, compliance modifications, final sent version, delivery status, recipient response. Searchable and filterable. |
| **AI Lounge** | `/ai/compliance` | Compliance Command | Dashboard showing compliance status across all communications. DNC list matches, TCPA compliance checks, opt-out tracking, consent records, flagged messages, audit trail. Red/yellow/green status indicators. |

### API Routes Created

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/outreach/email` | Send email via EmailOutreachAgent |
| `POST` | `/api/outreach/sms` | Send SMS via SmsMessagingAgent |
| `POST` | `/api/outreach/call` | Initiate call via DialerAgent |
| `GET` | `/api/outreach/log` | Outreach history with filtering |
| `GET` | `/api/outreach/log/:leadId` | Outreach history for specific lead |
| `POST` | `/api/appointments` | Create appointment |
| `PATCH` | `/api/appointments/:id` | Update/reschedule appointment |
| `DELETE` | `/api/appointments/:id` | Cancel appointment |
| `GET` | `/api/appointments` | List appointments with date range filter |
| `POST` | `/api/appointments/:id/remind` | Send reminder for appointment |
| `GET` | `/api/compliance/status` | Overall compliance dashboard data |
| `GET` | `/api/compliance/dnc-check/:phone` | Check phone against DNC list |
| `POST` | `/api/compliance/opt-out` | Record opt-out request |
| `GET` | `/api/compliance/audit` | Compliance audit trail |
| `POST` | `/api/copilot/chat` | Agent Copilot conversation endpoint |
| `GET` | `/api/comms/log` | AI communications log |
| `POST` | `/api/escalation/acknowledge` | Acknowledge human escalation |
| `GET` | `/api/escalation/pending` | Pending human escalation items |
| `POST` | `/api/webhooks/twilio/sms` | Twilio SMS webhook (inbound + status) |
| `POST` | `/api/webhooks/twilio/voice` | Twilio voice webhook (call events) |
| `POST` | `/api/webhooks/gmail` | Gmail push notification webhook |

### Database Tables & Migrations

```sql
-- Migration: 002_communication_tables.sql

CREATE TABLE emails_sent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outreach_log_id UUID REFERENCES outreach_log(id),
    lead_id UUID NOT NULL REFERENCES leads(id),
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body_html TEXT,
    body_text TEXT,
    template_id VARCHAR(100),
    template_variables JSONB DEFAULT '{}',
    gmail_message_id VARCHAR(255),
    gmail_thread_id VARCHAR(255),
    status VARCHAR(30) DEFAULT 'queued', -- 'queued', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'failed'
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    first_opened_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    bounced_at TIMESTAMPTZ,
    bounce_reason TEXT,
    compliance_check_id UUID,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE call_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outreach_log_id UUID REFERENCES outreach_log(id),
    lead_id UUID NOT NULL REFERENCES leads(id),
    twilio_call_sid VARCHAR(255) NOT NULL,
    direction VARCHAR(10) NOT NULL, -- 'inbound', 'outbound'
    from_number VARCHAR(20) NOT NULL,
    to_number VARCHAR(20) NOT NULL,
    status VARCHAR(30) DEFAULT 'initiated', -- 'initiated', 'ringing', 'in_progress', 'completed', 'failed', 'busy', 'no_answer'
    duration_seconds INTEGER,
    recording_url TEXT,
    recording_duration_seconds INTEGER,
    transcription TEXT,
    transcription_confidence DECIMAL(3,2),
    sentiment VARCHAR(20), -- 'positive', 'neutral', 'negative'
    key_topics JSONB DEFAULT '[]',
    coaching_notes JSONB DEFAULT '{}',
    call_score INTEGER, -- 0-100 AI-assessed call quality
    consent_recorded BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance tracking tables
CREATE TABLE dnc_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    source VARCHAR(50) NOT NULL, -- 'federal', 'state', 'internal', 'opt_out'
    added_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    reason TEXT
);

CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id),
    consent_type VARCHAR(50) NOT NULL, -- 'sms', 'email', 'call', 'data_processing'
    granted BOOLEAN NOT NULL,
    method VARCHAR(50) NOT NULL, -- 'web_form', 'verbal', 'written', 'implied'
    ip_address INET,
    user_agent TEXT,
    evidence TEXT, -- URL, recording reference, document reference
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_emails_sent_lead_id ON emails_sent(lead_id);
CREATE INDEX idx_emails_sent_status ON emails_sent(status);
CREATE INDEX idx_emails_sent_gmail_thread ON emails_sent(gmail_thread_id);
CREATE INDEX idx_call_recordings_lead_id ON call_recordings(lead_id);
CREATE INDEX idx_call_recordings_twilio_sid ON call_recordings(twilio_call_sid);
CREATE INDEX idx_call_recordings_status ON call_recordings(status);
CREATE INDEX idx_dnc_list_phone ON dnc_list(phone_number);
CREATE INDEX idx_consent_records_lead_id ON consent_records(lead_id);
```

### Agent Wiring Work

| Agent | Work Required | Details |
|-------|--------------|---------|
| **EmailOutreachAgent** | Wire to Gmail API | OAuth2 flow for Gmail. Send emails via Gmail API (not SMTP — better deliverability, thread tracking). Track opens via pixel, clicks via redirect links. Handle bounces via webhook. Template engine with variable substitution (lead name, agent name, product, etc.). |
| **SmsMessagingAgent** | Wire to Twilio SMS | Twilio account setup. Send SMS via Twilio API. Handle inbound SMS via webhook. Opt-out detection ("STOP" keyword). Character limit management (160 chars or multipart). MMS support for sending documents/images. |
| **DialerAgent** | Wire to Twilio Voice | Click-to-call from CRM. Call recording with consent prompt. Real-time call events via WebSocket. Voicemail detection and drop. Call disposition tracking (answered, voicemail, busy, no answer). |
| **AppointmentAgent** | Wire to Google Calendar | OAuth2 flow for Google Calendar. Create/update/delete events. Bi-directional sync (external changes reflected in GCF). Automated reminders: 24h email + 1h SMS. Availability checking before booking. |
| **HumanEscalationAgent** | Notification system | Multi-channel notifications to Gaetano: push notification (web), SMS alert, email digest. Priority levels: urgent (immediate SMS), high (push notification), normal (email digest). Escalation queue with acknowledge/snooze/delegate actions. |
| **ComplianceAgent** | DNC/TCPA enforcement | Check every outbound communication against DNC list before sending. TCPA time-of-day restrictions (no calls before 8am or after 9pm recipient local time). Consent verification before SMS. Audit logging of every compliance check. Auto-block non-compliant messages with reason. |

### External Integrations

| Integration | Setup Work |
|-------------|-----------|
| **Twilio** | Account creation, phone number provisioning (local number with SMS + Voice). Webhook configuration for inbound SMS/calls and status callbacks. TwiML app for call handling. |
| **Gmail API** | Google Cloud project, OAuth2 credentials, consent screen. Gmail API enable. Push notifications via Cloud Pub/Sub for inbound email detection. |
| **Google Calendar API** | Same Google Cloud project. Calendar API enable. Service account or OAuth2 for calendar read/write. Webhook for external change notifications. |

### Definition of "Done" — Phase 2

- [ ] EmailOutreachAgent sends a real email via Gmail that arrives in inbox (not spam)
- [ ] SmsMessagingAgent sends a real SMS via Twilio that arrives on Gaetano's phone
- [ ] DialerAgent initiates a real phone call via Twilio
- [ ] AppointmentAgent creates a Google Calendar event visible on Gaetano's calendar
- [ ] Inbound SMS triggers webhook → appears in CRM lead activity within 5 seconds
- [ ] ComplianceAgent blocks an SMS to a DNC-listed number with audit log entry
- [ ] HumanEscalationAgent sends push notification to Gaetano within 10 seconds of trigger
- [ ] Outreach Center shows all communications across channels for a lead
- [ ] Appointment Scheduler calendar view syncs with Google Calendar
- [ ] Agent Copilot answers questions about leads using real CRM data
- [ ] All outbound communications logged in outreach_log + channel-specific tables
- [ ] TCPA time restrictions enforced (test with after-hours send attempt)

### What Becomes Functional

**Gaetano can now:**
- Send personalized emails and SMS to leads from the CRM
- Make phone calls with one click and have them recorded/transcribed
- Schedule appointments that appear on his Google Calendar
- See every communication with a lead in one unified timeline
- Trust that no message goes out without compliance checking
- Get notified immediately when AI flags something for human attention
- Ask the Agent Copilot questions like "What's the best approach for this lead?"

---

## Phase 3 — Intelligence (Weeks 5–7)

### Theme: "Make It Think"
The system gets its brain. LLM integration powers conversational AI, content generation, call coaching, and revenue forecasting. Managers and executives get dashboards showing performance, pipeline health, and financial projections.

### Pages & Routes Built

| Lounge | Route | Page | Description |
|--------|-------|------|-------------|
| **Manager Lounge** | `/manager/team` | Team Dashboard | Overview of all agents (human): performance metrics, active leads, conversion rates, activity levels. Leaderboard with gamification elements (XP, streaks, badges). Click into any agent for drill-down. |
| **Manager Lounge** | `/manager/coaching` | Coaching Dashboard | AI-analyzed call recordings with scores, flagged moments (objection handling, closing attempts, compliance issues). Side-by-side comparison of top performers vs. struggling agents. Coaching action items auto-generated. |
| **Manager Lounge** | `/manager/pipeline` | Pipeline Health | Pipeline analytics: conversion rates between stages, average time in stage, bottleneck identification, deal velocity trends, win/loss analysis. Stale lead alerts. Forecasted close dates. |
| **Executive Lounge** | `/executive/revenue` | Revenue Command | Total premium volume, commission earned (first-year + renewal), revenue by product line, revenue by source, month-over-month trends. Cash flow projection. Commission statement generator. |
| **Executive Lounge** | `/executive/forecast` | Revenue Forecast | AI-powered revenue forecasting. Pipeline value × probability by stage. Historical trend analysis. Seasonal adjustments. Best/worst/likely scenarios. Adjustable assumptions. |
| **Executive Lounge** | `/executive/brief` | Executive Brief | Auto-generated daily/weekly executive summary. Key metrics, notable wins, risks, action items, AI recommendations. Generated by LLM from aggregated data. Printable/exportable. |

### API Routes Created

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/ai/chat` | Conversational AI endpoint (AiSalesAgent) |
| `POST` | `/api/ai/generate/email` | Generate email draft via LLM |
| `POST` | `/api/ai/generate/sms` | Generate SMS draft via LLM |
| `POST` | `/api/ai/generate/script` | Generate call script via LLM |
| `POST` | `/api/ai/generate/content` | Generate marketing content via LLM |
| `POST` | `/api/ai/analyze/call` | Analyze call recording/transcript |
| `POST` | `/api/ai/analyze/lead` | AI analysis of lead (strategy recommendations) |
| `GET` | `/api/manager/team` | Team performance metrics |
| `GET` | `/api/manager/team/:userId` | Individual agent performance |
| `GET` | `/api/manager/coaching` | Coaching insights and flagged calls |
| `GET` | `/api/manager/coaching/:callId` | Detailed call analysis |
| `GET` | `/api/manager/pipeline/health` | Pipeline health analytics |
| `GET` | `/api/executive/revenue` | Revenue dashboard data |
| `GET` | `/api/executive/forecast` | Revenue forecast with scenarios |
| `POST` | `/api/executive/forecast/adjust` | Adjust forecast assumptions |
| `GET` | `/api/executive/brief` | Generate executive brief |
| `GET` | `/api/executive/brief/history` | Past executive briefs |

### Database Tables & Migrations

```sql
-- Migration: 003_intelligence_tables.sql

CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id),
    user_id UUID REFERENCES users(id),
    agent_name VARCHAR(100) NOT NULL, -- which AI agent powered this
    channel VARCHAR(30) NOT NULL, -- 'copilot', 'email', 'sms', 'chat', 'voice'
    messages JSONB NOT NULL DEFAULT '[]', -- array of {role, content, timestamp}
    token_count INTEGER DEFAULT 0,
    model_used VARCHAR(50),
    cost_cents INTEGER DEFAULT 0,
    sentiment VARCHAR(20),
    outcome VARCHAR(50), -- 'resolved', 'escalated', 'ongoing', 'abandoned'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE call_coaching_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_recording_id UUID NOT NULL REFERENCES call_recordings(id),
    user_id UUID NOT NULL REFERENCES users(id), -- the agent being coached
    overall_score INTEGER NOT NULL, -- 0-100
    category_scores JSONB NOT NULL, -- {opening: 85, discovery: 70, objection_handling: 60, closing: 75, compliance: 90}
    strengths JSONB DEFAULT '[]',
    improvements JSONB DEFAULT '[]',
    flagged_moments JSONB DEFAULT '[]', -- {timestamp_seconds, category, description, suggestion}
    coaching_actions JSONB DEFAULT '[]', -- recommended next steps
    ai_summary TEXT,
    reviewed_by UUID REFERENCES users(id), -- manager who reviewed
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE revenue_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
    total_premium DECIMAL(12,2) DEFAULT 0,
    first_year_commission DECIMAL(10,2) DEFAULT 0,
    renewal_commission DECIMAL(10,2) DEFAULT 0,
    override_commission DECIMAL(10,2) DEFAULT 0,
    bonus_income DECIMAL(10,2) DEFAULT 0,
    chargebacks DECIMAL(10,2) DEFAULT 0,
    net_revenue DECIMAL(12,2) DEFAULT 0,
    policies_sold INTEGER DEFAULT 0,
    policies_lapsed INTEGER DEFAULT 0,
    avg_premium DECIMAL(10,2) DEFAULT 0,
    breakdown_by_product JSONB DEFAULT '{}',
    breakdown_by_source JSONB DEFAULT '{}',
    breakdown_by_carrier JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE executive_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_date DATE NOT NULL,
    brief_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
    content_markdown TEXT NOT NULL,
    key_metrics JSONB NOT NULL,
    highlights JSONB DEFAULT '[]',
    risks JSONB DEFAULT '[]',
    action_items JSONB DEFAULT '[]',
    ai_recommendations JSONB DEFAULT '[]',
    generated_by VARCHAR(100) DEFAULT 'RevenueForecastAgent',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_conversations_lead_id ON ai_conversations(lead_id);
CREATE INDEX idx_ai_conversations_agent ON ai_conversations(agent_name);
CREATE INDEX idx_call_coaching_user ON call_coaching_results(user_id);
CREATE INDEX idx_call_coaching_score ON call_coaching_results(overall_score);
CREATE INDEX idx_revenue_snapshots_date ON revenue_snapshots(snapshot_date);
CREATE INDEX idx_revenue_snapshots_period ON revenue_snapshots(period_type);
CREATE INDEX idx_executive_briefs_date ON executive_briefs(brief_date);
```

### Agent Wiring Work

| Agent | Work Required | Details |
|-------|--------------|---------|
| **AiSalesAgent** | LLM conversational AI | OpenAI GPT-4o / Anthropic Claude integration. System prompt with insurance knowledge base, product catalog, objection library. Context injection: lead profile, communication history, policy preferences. Streaming responses via SSE. Temperature 0.7 for creative responses, 0.3 for factual. |
| **InboundResponseAgent** | Speed-to-lead automation | On LEAD_SCORED event, generate personalized first-touch email + SMS within 60 seconds. LLM generates content based on: lead source, quoted products, location, enrichment data. A/B test subject lines. Track which templates convert best. |
| **CallCoachingAgent** | Transcription analysis | Receive call transcriptions from DialerAgent. Run through LLM with coaching prompt: identify strengths, weaknesses, missed opportunities, compliance issues. Score each call 0-100 across categories. Generate actionable coaching items. Aggregate into per-agent coaching profiles. |
| **CustomerSupportAgent** | Support ticket handling | Receive inbound emails/SMS from clients. Classify intent (billing question, claim inquiry, policy change, general). Auto-respond to common questions using knowledge base. Escalate complex issues to human. Track resolution time. |
| **ContentGenerationAgent** | Marketing content creation | Generate blog posts, social media posts, email newsletters. Input: topic/keyword + tone + length. LLM generates draft. Human review queue before publishing. SEO optimization suggestions. Content calendar integration. |
| **RevenueForecastAgent** | Financial projections | Aggregate pipeline data + historical conversion rates. Calculate expected revenue by period. Monte Carlo simulation for probability ranges. Factor in seasonality, retention rates, chargeback history. Generate daily revenue snapshot. Power the Executive Brief. |

### External Integrations

| Integration | Setup Work |
|-------------|-----------|
| **OpenAI API** | API key configuration. Model selection (GPT-4o for complex tasks, GPT-4o-mini for simple). Token usage tracking and budget alerts. Fallback to Anthropic on rate limit or outage. |
| **Anthropic API** | API key configuration. Claude Sonnet for primary, Haiku for lightweight. Used as fallback for OpenAI and for specific tasks where Claude excels (long-form content, analysis). |
| **LLM Wrapper Layer** | Unified interface: `llm.generate({ model, system, messages, temperature, maxTokens })`. Provider abstraction. Automatic retry with exponential backoff. Token counting and cost tracking. Response caching for identical prompts. |

### Definition of "Done" — Phase 3

- [ ] AiSalesAgent generates contextually relevant responses about insurance products
- [ ] InboundResponseAgent generates and sends personalized first-touch within 60 seconds of lead creation
- [ ] CallCoachingAgent scores a real call recording with actionable feedback
- [ ] ContentGenerationAgent produces a publishable blog post draft from a topic prompt
- [ ] RevenueForecastAgent generates accurate forecast from pipeline data
- [ ] Manager Team Dashboard shows real performance metrics for all agents
- [ ] Coaching Dashboard displays AI-analyzed call scores with flagged moments
- [ ] Pipeline Health shows conversion rates and bottleneck analysis
- [ ] Revenue Command displays financial data with month-over-month trends
- [ ] Forecast page shows best/worst/likely scenarios
- [ ] Executive Brief auto-generates a coherent daily summary
- [ ] LLM costs tracked and within budget ($200/month target)
- [ ] Fallback from OpenAI → Anthropic works when primary is unavailable

### What Becomes Functional

**Gaetano can now:**
- Have AI generate personalized emails and call scripts for any lead
- See AI-scored call recordings with specific coaching advice
- View team performance with gamification leaderboard
- Check pipeline health with bottleneck identification
- See revenue dashboards with real financial data
- Read AI-generated executive briefs every morning
- Trust AI forecasts for business planning decisions

---

## Phase 4 — Marketing & Client (Weeks 7–9)

### Theme: "Make It Grow"
The system becomes a full marketing engine and client portal. Social media management, reputation monitoring, content publishing. Clients get their own portal to manage policies, payments, and claims. The platform now covers the complete customer lifecycle.

### Pages & Routes Built

| Lounge | Route | Page | Description |
|--------|-------|------|-------------|
| **Marketing Lounge** | `/marketing/content` | Content Studio | Content creation workspace. AI-generated drafts, editing tools, image suggestions, SEO scoring. Content calendar with scheduled posts. Draft → Review → Approved → Published workflow. |
| **Marketing Lounge** | `/marketing/social` | Social Command | Unified social media dashboard. Schedule posts across platforms (Facebook, Instagram, LinkedIn, Twitter/X). Engagement metrics per post. Audience growth tracking. Social inbox for DMs and comments. |
| **Marketing Lounge** | `/marketing/reputation` | Reputation Center | Review monitoring across Google, Yelp, Facebook. Aggregate star rating. AI-suggested responses to reviews. Review request campaigns (ask happy clients for reviews). Sentiment trend analysis. |
| **Client Portal** | `/portal/policies` | My Policies | Client-facing page showing all active policies. Coverage details, premium amounts, payment schedules, renewal dates. Download policy documents. Request changes. |
| **Client Portal** | `/portal/payments` | Payments | Payment history, upcoming payments, payment methods on file. Self-service: update payment method, make one-time payment, set up auto-pay. Powered by Stripe. |
| **Client Portal** | `/portal/claims` | Claims | File a new claim. Track existing claim status. Upload supporting documents. View claim history. AI-guided claim filing with smart form that asks relevant questions based on policy type. |
| **Client Portal** | `/portal/messages` | Messages | Secure messaging between client and agency. Threaded conversations. File attachments. AI-powered auto-responses for common questions. Escalation to human agent when needed. |
| **Client Portal** | `/portal/referrals` | Referrals | Submit a referral. Track referral status (submitted → contacted → quoted → sold). Referral rewards program. Share referral link. |

### API Routes Created

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/content/create` | Create content piece (AI-generated or manual) |
| `GET` | `/api/content` | List content with status filtering |
| `PATCH` | `/api/content/:id` | Edit content / change status |
| `POST` | `/api/content/:id/publish` | Publish content to selected platforms |
| `POST` | `/api/social/post` | Schedule or publish social post |
| `GET` | `/api/social/posts` | List scheduled/published posts |
| `GET` | `/api/social/analytics` | Social media analytics |
| `GET` | `/api/social/inbox` | Social DMs and comments |
| `POST` | `/api/social/inbox/:id/reply` | Reply to social message |
| `GET` | `/api/reputation/reviews` | Aggregate reviews across platforms |
| `POST` | `/api/reputation/reviews/:id/respond` | Respond to a review |
| `POST` | `/api/reputation/request` | Send review request to client |
| `GET` | `/api/portal/policies` | Client's policies (authenticated portal) |
| `GET` | `/api/portal/policies/:id` | Policy detail |
| `GET` | `/api/portal/payments` | Payment history |
| `POST` | `/api/portal/payments/method` | Update payment method (Stripe) |
| `POST` | `/api/portal/payments/one-time` | Make one-time payment |
| `POST` | `/api/portal/claims` | File new claim |
| `GET` | `/api/portal/claims` | List client's claims |
| `PATCH` | `/api/portal/claims/:id` | Update claim (add documents, notes) |
| `GET` | `/api/portal/messages` | Client message threads |
| `POST` | `/api/portal/messages` | Send message to agency |
| `POST` | `/api/portal/referrals` | Submit referral |
| `GET` | `/api/portal/referrals` | Track referral status |
| `POST` | `/api/webhooks/stripe` | Stripe payment webhooks |
| `POST` | `/api/webhooks/social/:platform` | Social platform webhooks |

### Database Tables & Migrations

```sql
-- Migration: 004_marketing_client_tables.sql

CREATE TABLE content_pieces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'blog_post', 'social_post', 'email_newsletter', 'video_script'
    body TEXT,
    body_html TEXT,
    seo_score INTEGER,
    seo_keywords JSONB DEFAULT '[]',
    target_platforms JSONB DEFAULT '[]', -- ['facebook', 'instagram', 'linkedin', 'blog']
    status VARCHAR(30) DEFAULT 'draft', -- 'draft', 'review', 'approved', 'published', 'archived'
    scheduled_publish_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    published_urls JSONB DEFAULT '{}', -- {facebook: 'url', blog: 'url'}
    engagement_metrics JSONB DEFAULT '{}',
    created_by VARCHAR(100), -- AI agent or user
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_piece_id UUID REFERENCES content_pieces(id),
    platform VARCHAR(30) NOT NULL, -- 'facebook', 'instagram', 'linkedin', 'twitter'
    platform_post_id VARCHAR(255),
    post_text TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]',
    hashtags JSONB DEFAULT '[]',
    status VARCHAR(30) DEFAULT 'draft', -- 'draft', 'scheduled', 'published', 'failed'
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(30) NOT NULL, -- 'google', 'yelp', 'facebook'
    platform_review_id VARCHAR(255),
    reviewer_name VARCHAR(255),
    rating INTEGER NOT NULL, -- 1-5
    review_text TEXT,
    response_text TEXT,
    response_sent_at TIMESTAMPTZ,
    responded_by VARCHAR(100), -- AI agent or user
    sentiment VARCHAR(20), -- 'positive', 'neutral', 'negative'
    lead_id UUID REFERENCES leads(id), -- if reviewer is a known client
    flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,
    discovered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE client_portal_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    lead_id UUID NOT NULL REFERENCES leads(id),
    portal_status VARCHAR(30) DEFAULT 'active', -- 'active', 'suspended', 'closed'
    last_login_at TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    stripe_customer_id VARCHAR(255),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_portal_id UUID NOT NULL REFERENCES client_portal_accounts(id),
    policy_id UUID NOT NULL, -- references policies table
    claim_type VARCHAR(50) NOT NULL, -- 'auto_accident', 'property_damage', 'health', 'life', etc.
    description TEXT NOT NULL,
    incident_date DATE,
    status VARCHAR(30) DEFAULT 'submitted', -- 'submitted', 'under_review', 'approved', 'denied', 'paid', 'closed'
    documents JSONB DEFAULT '[]', -- [{filename, url, uploaded_at}]
    carrier_claim_number VARCHAR(100),
    estimated_amount DECIMAL(10,2),
    approved_amount DECIMAL(10,2),
    paid_amount DECIMAL(10,2),
    notes JSONB DEFAULT '[]',
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_client_id UUID NOT NULL REFERENCES client_portal_accounts(id),
    referred_name VARCHAR(255) NOT NULL,
    referred_email VARCHAR(255),
    referred_phone VARCHAR(20),
    referred_notes TEXT,
    lead_id UUID REFERENCES leads(id), -- created when referral enters pipeline
    status VARCHAR(30) DEFAULT 'submitted', -- 'submitted', 'contacted', 'quoted', 'sold', 'lost'
    reward_type VARCHAR(50), -- 'gift_card', 'premium_discount', 'cash'
    reward_amount DECIMAL(8,2),
    reward_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_content_pieces_status ON content_pieces(status);
CREATE INDEX idx_content_pieces_type ON content_pieces(content_type);
CREATE INDEX idx_social_posts_platform ON social_posts(platform);
CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE INDEX idx_reviews_platform ON reviews(platform);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_client_portal_user ON client_portal_accounts(user_id);
CREATE INDEX idx_client_portal_lead ON client_portal_accounts(lead_id);
CREATE INDEX idx_claims_client ON claims(client_portal_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_client_id);
CREATE INDEX idx_referrals_status ON referrals(status);
```

### Agent Wiring Work

| Agent | Work Required | Details |
|-------|--------------|---------|
| **SocialPostingAgent** | Social media publishing | Facebook Graph API, Instagram Graph API, LinkedIn API, Twitter/X API v2. Schedule posts with media attachments. Track engagement metrics via polling or webhooks. Content calendar integration. Platform-specific formatting (character limits, image sizes, hashtag strategies). |
| **SocialDmAgent** | Social inbox management | Monitor DMs and comments across platforms. Auto-classify intent (lead inquiry, support question, spam). Route lead inquiries to LeadIntakeAgent. Auto-respond to common questions. Flag negative comments for immediate attention. |
| **ReputationAgent** | Review monitoring | Poll Google Business Profile API, Yelp Fusion API, Facebook Graph API for new reviews. Sentiment analysis on each review. Auto-generate response drafts via LLM (personalized, professional, addressing specific feedback). Alert on negative reviews (<3 stars) immediately. Track aggregate scores and trends. |
| **ClientPortalAgent** | Portal account management | On POLICY_SOLD event: create user account with role='client', generate secure password, create client_portal_account record, link Stripe customer. Send welcome email with login credentials. Manage portal sessions and permissions. |
| **ClaimsAgent** | Claims processing | Guide clients through claim filing (AI-powered smart form). Validate required fields based on claim type. Forward to carrier when complete. Monitor carrier responses. Update client on status changes. Track claim lifecycle. |
| **RetentionAgent** | Churn prevention | Monitor policy renewal dates (60/30/7 day alerts). Detect lapse risk signals: missed payments, support complaints, competitor quotes. Trigger retention sequences: check-in calls, review appointments, loyalty rewards. Track retention rate by cohort. |
| **BillingAgent** | Payment processing | Stripe integration: create customers, save payment methods, process one-time and recurring payments. Handle failed payments (dunning sequence: retry → email → SMS → call). Commission tracking from carrier payments. Reconcile premiums received vs. expected. |

### External Integrations

| Integration | Setup Work |
|-------------|-----------|
| **Stripe** | Account setup, API keys. Products for each insurance type. Customer creation on policy sale. Payment intents for one-time, subscriptions for recurring premiums. Webhook handling for payment success/failure. Connect for commission payouts (future). |
| **Facebook/Instagram Graph API** | Meta Business account, App creation. Page publishing permissions. Instagram Business account linking. Webhook subscriptions for comments, DMs, reviews. |
| **LinkedIn API** | LinkedIn Developer App. Organization page access. UGC Post API for publishing. Limited analytics access. |
| **Twitter/X API v2** | Developer account (Basic tier minimum). Tweet create/read. Limited to 1,500 tweets/month on Basic. Webhook for mentions. |
| **Google Business Profile API** | Google Cloud project. Business Profile API enable. Review read/respond access. |

### Definition of "Done" — Phase 4

- [ ] Content Studio generates, edits, and publishes a blog post
- [ ] Social Command publishes a post to at least 2 platforms simultaneously
- [ ] Reputation Center shows real reviews from Google with AI-suggested responses
- [ ] Client Portal: client can log in, view policies, see payment history
- [ ] Client Portal: client can file a claim with document upload
- [ ] Client Portal: client can submit a referral and track its status
- [ ] BillingAgent processes a real Stripe payment
- [ ] RetentionAgent triggers a retention sequence for a policy approaching renewal
- [ ] ClientPortalAgent auto-creates portal account on POLICY_SOLD event
- [ ] Social DMs from leads are auto-routed to CRM as new leads
- [ ] Review response posted to Google Business Profile

### What Becomes Functional

**Gaetano can now:**
- Manage all social media from one dashboard
- Generate and publish marketing content with AI assistance
- Monitor and respond to reviews across all platforms
- Offer clients a self-service portal for policies, payments, claims
- Accept referrals through the portal and track them through the pipeline
- Process payments via Stripe
- Automatically prevent policy lapses with retention sequences
- See the complete customer lifecycle: lead → client → advocate

---

## Phase 5 — Optimization (Weeks 9–12)

### Theme: "Make It Perfect"
The system optimizes itself. Automation builder lets Gaetano create custom workflows without code. Memory Graph becomes explorable. A/B testing identifies what works best. Campaign builder orchestrates multi-channel marketing. Carrier integrations enable real-time quoting.

### Pages & Routes Built

| Lounge | Route | Page | Description |
|--------|-------|------|-------------|
| **AI Lounge** | `/ai/automations` | Automation Builder | Visual workflow builder. Drag-and-drop trigger → condition → action chains. Templates for common automations (new lead response, appointment reminder, renewal alert). Test mode to simulate without sending. Execution history and success rates. |
| **AI Lounge** | `/ai/memory` | Memory Graph Explorer | Visual graph of the MemoryGraph. Nodes = entities (leads, agents, products, carriers). Edges = relationships. Click to explore connections. Search and filter. See how AI agents have built their understanding of the business. |
| **AI Lounge** | `/ai/knowledge-base` | Knowledge Base Editor | CRUD interface for the AI knowledge base. Product information, carrier details, objection responses, compliance rules, scripts. Versioned. Tag-based organization. Used by all AI agents for context. |
| **Marketing Lounge** | `/marketing/campaigns` | Campaign Builder | Multi-channel campaign orchestration. Define audience segment → create content for each channel → schedule → launch → track. A/B testing built in (subject lines, send times, content variants). ROI tracking per campaign. |
| **Executive Lounge** | `/executive/growth` | Growth Dashboard | Customer acquisition funnel visualization. Traffic → Leads → Qualified → Customers. Growth rate trends. Cohort analysis. Channel attribution (which sources produce best customers). Customer lifetime value by segment. |
| **Executive Lounge** | `/executive/carriers` | Carrier Scorecard | Performance metrics per carrier: approval rates, underwriting speed, commission rates, claim satisfaction, competitiveness by product. Side-by-side comparison. Helps decide which carriers to push. |
| **CRM Lounge** | `/crm/lists` | Smart Lists | Dynamic lead lists based on criteria (tag, score, stage, activity, location, product interest). Save and reuse. Use as audience for campaigns or bulk actions. Auto-updating as leads match/unmatch criteria. |

### API Routes Created

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/automations` | List automation rules |
| `POST` | `/api/automations` | Create automation rule |
| `PATCH` | `/api/automations/:id` | Update automation rule |
| `DELETE` | `/api/automations/:id` | Delete automation rule |
| `POST` | `/api/automations/:id/test` | Test automation in simulation mode |
| `GET` | `/api/automations/:id/history` | Execution history for automation |
| `GET` | `/api/memory/graph` | Memory Graph data (nodes + edges) |
| `GET` | `/api/memory/graph/search` | Search Memory Graph |
| `GET` | `/api/memory/graph/node/:id` | Node detail with connections |
| `GET` | `/api/knowledge-base` | List knowledge base articles |
| `POST` | `/api/knowledge-base` | Create KB article |
| `PATCH` | `/api/knowledge-base/:id` | Update KB article |
| `DELETE` | `/api/knowledge-base/:id` | Delete KB article |
| `GET` | `/api/knowledge-base/search` | Search KB (vector similarity) |
| `POST` | `/api/campaigns` | Create campaign |
| `GET` | `/api/campaigns` | List campaigns |
| `PATCH` | `/api/campaigns/:id` | Update campaign |
| `POST` | `/api/campaigns/:id/launch` | Launch campaign |
| `GET` | `/api/campaigns/:id/results` | Campaign results and analytics |
| `POST` | `/api/ab-test` | Create A/B test |
| `GET` | `/api/ab-test/:id/results` | A/B test results with statistical significance |
| `GET` | `/api/growth/funnel` | Growth funnel analytics |
| `GET` | `/api/growth/cohorts` | Cohort analysis data |
| `GET` | `/api/growth/attribution` | Channel attribution data |
| `GET` | `/api/carriers/scorecard` | Carrier performance scorecard |
| `GET` | `/api/carriers/:id/products` | Carrier product catalog |
| `POST` | `/api/carriers/:id/quote` | Request quote from carrier API |
| `GET` | `/api/lists` | Saved smart lists |
| `POST` | `/api/lists` | Create smart list |
| `GET` | `/api/lists/:id/leads` | Leads matching smart list criteria |

### Database Tables & Migrations

```sql
-- Migration: 005_optimization_tables.sql

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL, -- 'email_drip', 'multi_channel', 'social', 'referral', 'retention'
    audience_criteria JSONB NOT NULL, -- smart list criteria
    audience_count INTEGER DEFAULT 0,
    channels JSONB DEFAULT '[]', -- ['email', 'sms', 'social']
    content_variants JSONB DEFAULT '{}', -- A/B test variants
    schedule JSONB NOT NULL, -- campaign timeline and cadence
    status VARCHAR(30) DEFAULT 'draft', -- 'draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'
    budget_cents INTEGER,
    spent_cents INTEGER DEFAULT 0,
    metrics JSONB DEFAULT '{}', -- aggregated performance
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id),
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(50) NOT NULL, -- 'subject_line', 'send_time', 'content', 'cta'
    variants JSONB NOT NULL, -- [{name: 'A', content: '...'}, {name: 'B', content: '...'}]
    traffic_split JSONB DEFAULT '{"A": 50, "B": 50}',
    winning_metric VARCHAR(50) NOT NULL, -- 'open_rate', 'click_rate', 'conversion_rate', 'reply_rate'
    results JSONB DEFAULT '{}', -- per-variant metrics
    winner VARCHAR(50),
    statistical_significance DECIMAL(5,4),
    sample_size_required INTEGER,
    sample_size_actual INTEGER DEFAULT 0,
    status VARCHAR(30) DEFAULT 'running', -- 'running', 'concluded', 'insufficient_data'
    started_at TIMESTAMPTZ,
    concluded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE knowledge_base_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'product', 'carrier', 'objection', 'compliance', 'script', 'process'
    content TEXT NOT NULL,
    content_embedding VECTOR(1536), -- OpenAI embedding for semantic search
    tags JSONB DEFAULT '[]',
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    used_by_agents JSONB DEFAULT '[]', -- which agents reference this
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE smart_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    criteria JSONB NOT NULL, -- {filters: [{field, operator, value}], logic: 'AND'|'OR'}
    match_count INTEGER DEFAULT 0,
    last_calculated_at TIMESTAMPTZ,
    is_dynamic BOOLEAN DEFAULT TRUE, -- auto-updates vs. static snapshot
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE carrier_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrier_name VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_type VARCHAR(50) NOT NULL, -- 'term_life', 'whole_life', 'auto', 'home', 'health', 'medicare'
    description TEXT,
    commission_rate DECIMAL(5,4), -- as decimal (0.55 = 55%)
    commission_type VARCHAR(30), -- 'first_year', 'renewal', 'level'
    renewal_rate DECIMAL(5,4),
    underwriting_speed_days INTEGER,
    approval_rate DECIMAL(5,4),
    min_premium DECIMAL(10,2),
    max_premium DECIMAL(10,2),
    age_range INT4RANGE,
    features JSONB DEFAULT '{}',
    competitiveness_score INTEGER, -- 0-100 AI-assessed
    api_endpoint VARCHAR(500), -- carrier quote API if available
    api_credentials_encrypted TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_type ON campaigns(campaign_type);
CREATE INDEX idx_ab_tests_campaign ON ab_tests(campaign_id);
CREATE INDEX idx_ab_tests_status ON ab_tests(status);
CREATE INDEX idx_kb_articles_category ON knowledge_base_articles(category);
CREATE INDEX idx_kb_articles_active ON knowledge_base_articles(id) WHERE is_active = TRUE;
CREATE INDEX idx_smart_lists_creator ON smart_lists(created_by);
CREATE INDEX idx_carrier_products_type ON carrier_products(product_type);
CREATE INDEX idx_carrier_products_carrier ON carrier_products(carrier_name);
CREATE INDEX idx_carrier_products_active ON carrier_products(id) WHERE is_active = TRUE;

-- Enable pgvector extension for knowledge base embeddings
CREATE EXTENSION IF NOT EXISTS vector;
```

### Agent Wiring Work

| Agent | Work Required | Details |
|-------|--------------|---------|
| **OptimizationAgent** | Self-improvement engine | Analyze all system metrics continuously. Identify optimization opportunities: email send time optimization, lead scoring model recalibration, pipeline stage duration anomalies. Recommend automation rules based on patterns. Track improvement over time. |
| **TrainingAgent** | Knowledge base management | Curate and maintain the knowledge base. Auto-extract insights from successful calls (what worked). Update objection handlers based on real outcomes. Track which KB articles are most/least useful. Suggest gaps in knowledge base coverage. |
| **LeadDiscoveryAgent** | Web scraping for leads | Scrape public sources: business registrations, social media (LinkedIn company pages), review sites, event attendees. Identify potential insurance buyers. Enrich with basic data. Feed into pipeline as "discovered" leads. Respect robots.txt and rate limits. |
| **DataEnrichmentAgent** | Clearbit integration | On LEAD_ENRICHED or manual trigger: call Clearbit Enrichment API with email/domain. Populate: company info, role/title, social profiles, estimated revenue, tech stack. Cache results (90-day TTL). Fallback to manual enrichment queue if API fails. Budget: track API calls against monthly allocation. |
| **OutreachOrchestrationAgent** | Sequence engine | Build and execute multi-step outreach sequences. Define templates: steps with delays, channel selection, content templates, exit conditions. Sequence states: active, paused (on reply), completed, failed. Handle branching logic (if opened → path A, if not → path B). Coordinate with all communication agents. Power the 14-day nurture flow. |

### External Integrations

| Integration | Setup Work |
|-------------|-----------|
| **Clearbit** | API key, enrichment endpoint configuration. Rate limit handling (250/mo on starter). Webhook for async enrichment results. Response mapping to lead fields. |
| **pgvector** | PostgreSQL extension for vector similarity search. Used by knowledge base for semantic search. Embedding generation via OpenAI `text-embedding-3-small`. |
| **Carrier APIs** (varies) | Per-carrier integration. Start with 2-3 carriers that offer APIs. Quote request → response mapping. Real-time or async quoting. Credential management. Error handling for carrier downtime. |
| **Web Scraping Infrastructure** | Puppeteer/Playwright for dynamic pages. Proxy rotation for rate limit avoidance. Structured data extraction. Legal compliance review. |

### Definition of "Done" — Phase 5

- [ ] Automation Builder: create a "new lead → auto-respond" automation visually, test it, activate it, see it fire
- [ ] Memory Graph Explorer: visualize 100+ nodes with relationships, click-to-explore navigation
- [ ] Knowledge Base: create article, search returns relevant results via semantic similarity
- [ ] Campaign Builder: create multi-channel campaign, launch to smart list segment, track results
- [ ] A/B test: run subject line test, system declares winner with statistical significance
- [ ] Growth Dashboard: shows accurate funnel with conversion rates at each stage
- [ ] Carrier Scorecard: shows real performance metrics for at least 3 carriers
- [ ] Smart Lists: create dynamic list, verify it auto-updates when leads match/unmatch
- [ ] LeadDiscoveryAgent: discovers at least 10 real prospects from web sources
- [ ] DataEnrichmentAgent: enriches a lead via Clearbit with company and social data
- [ ] OutreachOrchestrationAgent: runs complete 14-day nurture sequence with branching
- [ ] OptimizationAgent: generates at least 3 actionable optimization recommendations

### What Becomes Functional

**Gaetano can now:**
- Build custom automations without writing code
- Explore how AI agents understand his business via the Memory Graph
- Maintain the AI's knowledge base with up-to-date product and carrier info
- Run sophisticated multi-channel marketing campaigns with A/B testing
- See growth metrics with channel attribution (know what's working)
- Compare carriers side-by-side to make strategic decisions
- Create smart lead lists for targeted outreach
- Have AI automatically discover and enrich new prospects
- Trust that the system is continuously optimizing itself

**THE PLATFORM IS NOW COMPLETE.** Every lounge is functional. Every agent is wired. Every integration is live. The system operates as an autonomous insurance agency command center.

---

# 11. THE COMPLETE LOOP — DETAILED FLOW

> These narratives trace exact event chains through the system. Every EventType, every database write, every agent handoff is documented. This is how GCF actually works under the hood.

---

## Flow 1: Quote Form → 60-Second Response

**Trigger:** A visitor fills out the quote form on the GCF website.

### Second 0 — Form Submission

The visitor clicks "Get My Free Quote" on the website. The browser sends:

```
POST /api/quotes
Content-Type: application/json

{
    "first_name": "Maria",
    "last_name": "Rodriguez",
    "email": "maria.rodriguez@email.com",
    "phone": "+15551234567",
    "zip_code": "75201",
    "insurance_type": "term_life",
    "coverage_amount": 500000,
    "source": "website_quote_form",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "life_insurance_dallas"
}
```

### Second 1 — Database Insert

The API handler validates the payload and inserts into two tables:

```sql
-- Insert quote request
INSERT INTO quote_requests (id, first_name, last_name, email, phone, zip_code, 
    insurance_type, coverage_amount, source, utm_data, status, created_at)
VALUES ('qr_abc123', 'Maria', 'Rodriguez', 'maria.rodriguez@email.com', 
    '+15551234567', '75201', 'term_life', 500000, 'website_quote_form',
    '{"utm_source": "google", "utm_medium": "cpc", "utm_campaign": "life_insurance_dallas"}',
    'new', NOW());

-- Insert raw lead
INSERT INTO leads (id, first_name, last_name, email, phone, zip_code, 
    source, status, pipeline_stage, raw_data, created_at)
VALUES ('lead_xyz789', 'Maria', 'Rodriguez', 'maria.rodriguez@email.com',
    '+15551234567', '75201', 'website_quote_form', 'new', 'new',
    '{"insurance_type": "term_life", "coverage_amount": 500000}', NOW());
```

**DB writes:** `quote_requests` (1 row), `leads` (1 row)

### Second 2 — DatabaseBridge Detection

DatabaseBridge detects the new `leads` row via PostgreSQL LISTEN/NOTIFY:

```sql
-- PostgreSQL trigger fires:
NOTIFY lead_changes, '{"operation": "INSERT", "lead_id": "lead_xyz789"}';
```

DatabaseBridge receives the notification, reads the full lead record, syncs it to MemoryGraph, and emits:

```typescript
EventBus.emit({
    type: 'RAW_LEAD_CREATED',
    source: 'DatabaseBridge',
    payload: {
        leadId: 'lead_xyz789',
        firstName: 'Maria',
        lastName: 'Rodriguez',
        email: 'maria.rodriguez@email.com',
        phone: '+15551234567',
        zipCode: '75201',
        source: 'website_quote_form',
        rawData: { insurance_type: 'term_life', coverage_amount: 500000 }
    },
    correlationId: 'corr_001',
    timestamp: '2026-02-10T14:00:02.000Z'
});
```

**DB writes:** `agent_events` (1 row — RAW_LEAD_CREATED logged)

### Second 3–5 — LeadIntakeAgent Normalizes

LeadIntakeAgent picks up `RAW_LEAD_CREATED`. Normalizes the data:
- Formats phone: `+15551234567` → verified format
- Validates email: MX record check on `email.com` → valid
- Standardizes name: proper case confirmed
- Maps insurance type to product codes: `term_life` → `PRODUCT_TERM_LIFE`
- Geocodes zip: `75201` → Dallas, TX, CST timezone
- Checks for duplicates: no existing lead with same email or phone

```sql
-- Update lead with normalized data
UPDATE leads SET 
    phone_verified = TRUE,
    email_verified = TRUE,
    city = 'Dallas',
    state = 'TX',
    timezone = 'America/Chicago',
    product_interest = '["PRODUCT_TERM_LIFE"]',
    status = 'normalized',
    updated_at = NOW()
WHERE id = 'lead_xyz789';

-- Log activity
INSERT INTO lead_activities (id, lead_id, activity_type, description, agent_name, created_at)
VALUES (gen_random_uuid(), 'lead_xyz789', 'normalized', 
    'Lead data normalized: phone verified, email verified, geocoded to Dallas TX',
    'LeadIntakeAgent', NOW());
```

Emits:

```typescript
EventBus.emit({
    type: 'LEAD_ENRICHED',
    source: 'LeadIntakeAgent',
    payload: {
        leadId: 'lead_xyz789',
        normalizedData: { city: 'Dallas', state: 'TX', timezone: 'America/Chicago', phoneVerified: true, emailVerified: true },
        productInterest: ['PRODUCT_TERM_LIFE']
    },
    correlationId: 'corr_001',
    parentEventId: 'evt_raw_lead_created',
    timestamp: '2026-02-10T14:00:05.000Z'
});
```

**DB writes:** `leads` (1 update), `lead_activities` (1 row), `agent_events` (1 row)

### Second 5–10 — DataEnrichmentAgent Enriches

DataEnrichmentAgent picks up `LEAD_ENRICHED`. Calls Clearbit Enrichment API:

```
GET https://person.clearbit.com/v2/people/find?email=maria.rodriguez@email.com
```

Response enriches the lead with:
- Company: "Rodriguez Insurance Consulting" (she's already in the industry — flag this!)
- Role: "Independent Agent"
- LinkedIn: `linkedin.com/in/mariarodriguez`
- Estimated household income: $85,000–$120,000
- Age range: 30–35

```sql
-- Update lead with enrichment data
UPDATE leads SET
    company = 'Rodriguez Insurance Consulting',
    job_title = 'Independent Agent',
    linkedin_url = 'https://linkedin.com/in/mariarodriguez',
    enrichment_data = '{
        "clearbit": {
            "household_income_range": "$85,000-$120,000",
            "age_range": "30-35",
            "industry": "insurance",
            "company_size": "1-10"
        }
    }',
    enriched_at = NOW(),
    updated_at = NOW()
WHERE id = 'lead_xyz789';

INSERT INTO lead_activities (id, lead_id, activity_type, description, agent_name, metadata, created_at)
VALUES (gen_random_uuid(), 'lead_xyz789', 'enriched',
    'Clearbit enrichment complete: Maria is an independent insurance agent at Rodriguez Insurance Consulting',
    'DataEnrichmentAgent', 
    '{"source": "clearbit", "fields_enriched": ["company", "job_title", "linkedin_url", "household_income", "age_range"]}',
    NOW());
```

Emits:

```typescript
EventBus.emit({
    type: 'LEAD_READY_FOR_SCORING',
    source: 'DataEnrichmentAgent',
    payload: {
        leadId: 'lead_xyz789',
        enrichmentComplete: true,
        enrichmentSource: 'clearbit',
        flagged: true,
        flagReason: 'Lead appears to be an insurance industry professional'
    },
    correlationId: 'corr_001',
    timestamp: '2026-02-10T14:00:10.000Z'
});
```

**DB writes:** `leads` (1 update), `lead_activities` (1 row), `agent_events` (1 row)

### Second 10–15 — LeadScoringAgent Scores

LeadScoringAgent picks up `LEAD_READY_FOR_SCORING`. Runs the scoring algorithm:

| Factor | Weight | Value | Points |
|--------|--------|-------|--------|
| Source: Google PPC | 20% | High-intent | 18/20 |
| Product: Term Life $500K | 15% | High-value product | 14/15 |
| Phone provided | 10% | Yes | 10/10 |
| Email verified | 5% | Yes | 5/5 |
| Location: Dallas TX | 10% | Service area | 10/10 |
| Enrichment: Industry professional | 15% | Insurance agent (potential B2B) | 12/15 |
| Enrichment: Income range | 10% | $85K-$120K | 8/10 |
| Enrichment: Age range | 10% | 30-35 (prime life insurance age) | 9/10 |
| Form completeness | 5% | All fields filled | 5/5 |
| **Total** | **100%** | | **91/100** |

```sql
-- Update lead with score
UPDATE leads SET
    lead_score = 91,
    score_breakdown = '{
        "source_score": 18, "product_score": 14, "phone_score": 10,
        "email_score": 5, "location_score": 10, "enrichment_industry": 12,
        "enrichment_income": 8, "enrichment_age": 9, "completeness": 5
    }',
    score_tier = 'hot',
    pipeline_stage = 'new',
    updated_at = NOW()
WHERE id = 'lead_xyz789';

INSERT INTO lead_activities (id, lead_id, activity_type, description, agent_name, metadata, created_at)
VALUES (gen_random_uuid(), 'lead_xyz789', 'scored',
    'Lead scored 91/100 (HOT). High-intent Google PPC lead, insurance professional, prime age for term life.',
    'LeadScoringAgent',
    '{"score": 91, "tier": "hot", "top_factors": ["google_ppc_source", "high_value_product", "industry_professional"]}',
    NOW());
```

Emits:

```typescript
EventBus.emit({
    type: 'LEAD_SCORED',
    source: 'LeadScoringAgent',
    payload: {
        leadId: 'lead_xyz789',
        score: 91,
        tier: 'hot',
        recommendation: 'immediate_human_contact',
        productMatch: ['PRODUCT_TERM_LIFE_500K'],
        estimatedPremium: { monthly: 45, annual: 490 }
    },
    correlationId: 'corr_001',
    timestamp: '2026-02-10T14:00:15.000Z'
});
```

**DB writes:** `leads` (1 update), `lead_activities` (1 row), `agent_events` (1 row)

### Second 15–30 — InboundResponseAgent Generates Personalized Outreach

InboundResponseAgent picks up `LEAD_SCORED`. Because score > 80, this is a priority lead. The agent calls the LLM to generate personalized outreach:

**LLM Prompt (Email):**
```
You are writing a first-touch email from Gaetano Carbone, owner of GCF Insurance, 
to a new lead. Be warm, professional, and reference their specific situation.

Lead Profile:
- Name: Maria Rodriguez
- Product Interest: Term Life Insurance, $500K coverage
- Location: Dallas, TX
- Background: Independent insurance agent at Rodriguez Insurance Consulting
- Source: Searched for life insurance on Google

Write a subject line and email body. Keep it under 150 words. 
Include a clear CTA to schedule a call.
```

**LLM generates:**
- Subject: "Maria — let's find the right $500K term life plan for you"
- Body: Personalized email referencing her being in the industry, offering professional courtesy, suggesting a quick call.

**LLM Prompt (SMS):**
```
Write a friendly, professional SMS (under 160 characters) from Gaetano at GCF Insurance 
to Maria Rodriguez who just requested a term life quote. Include a call-to-action.
```

**LLM generates:**
- SMS: "Hi Maria! Gaetano from GCF Insurance here. Got your term life quote request — I'd love to find you the best rate. Free for a quick call today? 📞"

```sql
-- Log AI conversation
INSERT INTO ai_conversations (id, lead_id, agent_name, channel, messages, token_count, model_used, cost_cents, created_at)
VALUES (gen_random_uuid(), 'lead_xyz789', 'InboundResponseAgent', 'email',
    '[{"role": "system", "content": "..."}, {"role": "assistant", "content": "..."}]',
    450, 'gpt-4o', 2, NOW());

INSERT INTO ai_conversations (id, lead_id, agent_name, channel, messages, token_count, model_used, cost_cents, created_at)
VALUES (gen_random_uuid(), 'lead_xyz789', 'InboundResponseAgent', 'sms',
    '[{"role": "system", "content": "..."}, {"role": "assistant", "content": "..."}]',
    180, 'gpt-4o-mini', 0, NOW());
```

Emits two events:

```typescript
EventBus.emit({
    type: 'OUTREACH_EMAIL_READY',
    source: 'InboundResponseAgent',
    payload: {
        leadId: 'lead_xyz789',
        to: 'maria.rodriguez@email.com',
        subject: "Maria — let's find the right $500K term life plan for you",
        bodyHtml: '<p>Hi Maria,...</p>',
        bodyText: 'Hi Maria,...',
        priority: 'high'
    },
    correlationId: 'corr_001',
    timestamp: '2026-02-10T14:00:28.000Z'
});

EventBus.emit({
    type: 'OUTREACH_SMS_READY',
    source: 'InboundResponseAgent',
    payload: {
        leadId: 'lead_xyz789',
        to: '+15551234567',
        body: "Hi Maria! Gaetano from GCF Insurance here...",
        priority: 'high'
    },
    correlationId: 'corr_001',
    timestamp: '2026-02-10T14:00:28.500Z'
});
```

**DB writes:** `ai_conversations` (2 rows), `agent_events` (2 rows)

### Second 28–35 — ComplianceAgent Validates

ComplianceAgent intercepts both `OUTREACH_EMAIL_READY` and `OUTREACH_SMS_READY` before they send:

**Email Check:**
- ✅ CAN-SPAM: Includes unsubscribe link, physical address, sender identified
- ✅ Content: No prohibited language, no misleading claims
- ✅ Consent: Website form = implied consent for follow-up

**SMS Check:**
- ✅ DNC List: `+15551234567` not on federal or internal DNC list
- ✅ TCPA: Current time in recipient's timezone (CST) = 2:00 PM — within allowed hours (8 AM–9 PM)
- ✅ Consent: Quote form submission = express consent for SMS
- ✅ Opt-out: Message includes implicit opt-out capability (first message includes opt-out in sequence)

```sql
-- Log compliance checks
INSERT INTO consent_records (id, lead_id, consent_type, granted, method, evidence, created_at)
VALUES 
    (gen_random_uuid(), 'lead_xyz789', 'email', TRUE, 'web_form', 'quote_request_qr_abc123', NOW()),
    (gen_random_uuid(), 'lead_xyz789', 'sms', TRUE, 'web_form', 'quote_request_qr_abc123', NOW());

-- Update outreach events with compliance clearance
INSERT INTO agent_events (id, event_type, source_agent, payload, correlation_id, status, created_at)
VALUES 
    (gen_random_uuid(), 'COMPLIANCE_CLEARED', 'ComplianceAgent', 
     '{"leadId": "lead_xyz789", "channel": "email", "checks_passed": ["can_spam", "content", "consent"]}',
     'corr_001', 'completed', NOW()),
    (gen_random_uuid(), 'COMPLIANCE_CLEARED', 'ComplianceAgent',
     '{"leadId": "lead_xyz789", "channel": "sms", "checks_passed": ["dnc", "tcpa_time", "consent", "opt_out"]}',
     'corr_001', 'completed', NOW());
```

ComplianceAgent emits clearance:

```typescript
EventBus.emit({
    type: 'OUTREACH_APPROVED',
    source: 'ComplianceAgent',
    payload: { leadId: 'lead_xyz789', channels: ['email', 'sms'], allChecksPassed: true },
    correlationId: 'corr_001',
    timestamp: '2026-02-10T14:00:33.000Z'
});
```

**DB writes:** `consent_records` (2 rows), `agent_events` (3 rows)

### Second 35–45 — EmailOutreachAgent Sends Email

EmailOutreachAgent picks up `OUTREACH_APPROVED` and the earlier `OUTREACH_EMAIL_READY`:

```typescript
// Gmail API call
const gmail = google.gmail({ version: 'v1', auth: oauthClient });
const response = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
        raw: base64EncodedEmail // includes tracking pixel, click tracking
    }
});
```

```sql
-- Log email
INSERT INTO emails_sent (id, lead_id, from_address, to_address, subject, body_html, body_text,
    gmail_message_id, gmail_thread_id, status, compliance_check_id, sent_at, created_at)
VALUES (gen_random_uuid(), 'lead_xyz789', 'gaetano@gcfinsurance.com', 'maria.rodriguez@email.com',
    'Maria — let''s find the right $500K term life plan for you',
    '<p>Hi Maria,...</p>', 'Hi Maria,...',
    'msg_gmail_abc', 'thread_gmail_abc', 'sent', 'compliance_check_id', NOW(), NOW());

INSERT INTO outreach_log (id, lead_id, agent_name, channel, direction, subject, body, status, 
    external_id, compliance_checked, sent_at, created_at)
VALUES (gen_random_uuid(), 'lead_xyz789', 'EmailOutreachAgent', 'email', 'outbound',
    'Maria — let''s find the right $500K term life plan for you', 'Hi Maria,...',
    'sent', 'msg_gmail_abc', TRUE, NOW(), NOW());

INSERT INTO lead_activities (id, lead_id, activity_type, description, agent_name, created_at)
VALUES (gen_random_uuid(), 'lead_xyz789', 'email_sent',
    'First-touch email sent: "Maria — let''s find the right $500K term life plan for you"',
    'EmailOutreachAgent', NOW());
```

**DB writes:** `emails_sent` (1 row), `outreach_log` (1 row), `lead_activities` (1 row), `agent_events` (1 row)

### Second 40–50 — SmsMessagingAgent Sends SMS

SmsMessagingAgent picks up `OUTREACH_APPROVED` and the earlier `OUTREACH_SMS_READY`:

```typescript
// Twilio API call
const message = await twilioClient.messages.create({
    body: "Hi Maria! Gaetano from GCF Insurance here...",
    from: '+12145551234', // GCF Twilio number
    to: '+15551234567',
    statusCallback: 'https://api.gcfinsurance.com/api/webhooks/twilio/sms'
});
```

```sql
INSERT INTO outreach_log (id, lead_id, agent_name, channel, direction, body, status,
    external_id, compliance_checked, sent_at, created_at)
VALUES (gen_random_uuid(), 'lead_xyz789', 'SmsMessagingAgent', 'sms', 'outbound',
    'Hi Maria! Gaetano from GCF Insurance here...', 'sent',
    'SM_twilio_xyz', TRUE, NOW(), NOW());

INSERT INTO lead_activities (id, lead_id, activity_type, description, agent_name, created_at)
VALUES (gen_random_uuid(), 'lead_xyz789', 'sms_sent',
    'First-touch SMS sent via Twilio', 'SmsMessagingAgent', NOW());
```

**DB writes:** `outreach_log` (1 row), `lead_activities` (1 row), `agent_events` (1 row)

### Second 45–55 — HumanEscalationAgent Alerts Gaetano

Because the lead score is 91 (> 80 threshold), HumanEscalationAgent fires:

```typescript
EventBus.emit({
    type: 'HUMAN_REQUIRED',
    source: 'HumanEscalationAgent',
    payload: {
        leadId: 'lead_xyz789',
        priority: 'urgent',
        reason: 'Hot lead (91/100) — insurance professional requesting $500K term life. AI outreach sent. Personal follow-up recommended within 1 hour.',
        suggestedAction: 'call',
        leadSummary: {
            name: 'Maria Rodriguez',
            phone: '+15551234567',
            product: 'Term Life $500K',
            score: 91,
            note: 'She is an independent insurance agent — potential B2B relationship'
        }
    },
    correlationId: 'corr_001',
    timestamp: '2026-02-10T14:00:50.000Z'
});
```

Gaetano receives:
1. **Push notification** (browser): "🔥 HOT LEAD: Maria Rodriguez (91/100) — Term Life $500K — Insurance professional in Dallas"
2. **SMS alert** to Gaetano's personal phone: "Hot lead alert! Maria Rodriguez, term life $500K, score 91. She's an insurance agent — possible B2B. AI already sent email+SMS. Call her: (555) 123-4567"

```sql
INSERT INTO agent_events (id, event_type, source_agent, payload, correlation_id, status, created_at)
VALUES (gen_random_uuid(), 'HUMAN_REQUIRED', 'HumanEscalationAgent',
    '{"leadId": "lead_xyz789", "priority": "urgent", "notifications_sent": ["push", "sms"]}',
    'corr_001', 'completed', NOW());
```

**DB writes:** `agent_events` (1 row)

### Second 55–60 — Pipeline Update

The lead's pipeline stage updates and the WebSocket broadcasts to all connected CRM users:

```sql
UPDATE leads SET
    pipeline_stage = 'contacted',
    last_contacted_at = NOW(),
    contact_count = 1,
    updated_at = NOW()
WHERE id = 'lead_xyz789';
```

WebSocket broadcasts:
```typescript
io.to('crm').emit('lead:updated', {
    leadId: 'lead_xyz789',
    changes: { pipeline_stage: 'contacted', last_contacted_at: new Date() }
});

io.to('crm').emit('pipeline:moved', {
    leadId: 'lead_xyz789',
    from: 'new',
    to: 'contacted'
});

io.to('ai').emit('event:new', {
    type: 'LEAD_CONTACTED',
    source: 'System',
    leadId: 'lead_xyz789'
});
```

### Summary — 60 Seconds Total

| Elapsed | Agent | Action | DB Writes |
|---------|-------|--------|-----------|
| 0s | Website | Form submitted | — |
| 1s | API | DB insert | `quote_requests`, `leads` |
| 2s | DatabaseBridge | Detect + emit RAW_LEAD_CREATED | `agent_events` |
| 3-5s | LeadIntakeAgent | Normalize + validate | `leads`, `lead_activities`, `agent_events` |
| 5-10s | DataEnrichmentAgent | Clearbit enrichment | `leads`, `lead_activities`, `agent_events` |
| 10-15s | LeadScoringAgent | Score (91/100 HOT) | `leads`, `lead_activities`, `agent_events` |
| 15-30s | InboundResponseAgent | Generate email + SMS via LLM | `ai_conversations` ×2, `agent_events` ×2 |
| 28-35s | ComplianceAgent | Validate all comms | `consent_records` ×2, `agent_events` ×3 |
| 35-45s | EmailOutreachAgent | Send email via Gmail | `emails_sent`, `outreach_log`, `lead_activities`, `agent_events` |
| 40-50s | SmsMessagingAgent | Send SMS via Twilio | `outreach_log`, `lead_activities`, `agent_events` |
| 45-55s | HumanEscalationAgent | Alert Gaetano (push + SMS) | `agent_events` |
| 55-60s | System | Pipeline stage → contacted | `leads` |

**Total DB writes in 60 seconds:** ~25 rows across 8 tables
**Total events emitted:** 11
**Total agents involved:** 8
**LLM calls:** 2 (email draft + SMS draft)
**External API calls:** 4 (Clearbit, Gmail, Twilio, push notification)

---

## Flow 2: 14-Day Nurture Sequence

**Trigger:** A lead is scored but not hot enough for immediate human contact (score 40-79), OR a hot lead doesn't respond to initial outreach within 24 hours.

### Sequence Setup

OutreachOrchestrationAgent creates a sequence record:

```sql
INSERT INTO outreach_sequences (id, lead_id, sequence_template, status, current_step, 
    steps, started_at, created_at)
VALUES (gen_random_uuid(), 'lead_xyz789', 'nurture_14_day', 'active', 0,
    '[
        {"day": 0, "channel": "email", "template": "value_intro", "status": "pending"},
        {"day": 0, "channel": "sms", "template": "friendly_intro", "status": "pending"},
        {"day": 1, "channel": "phone", "template": "first_call_attempt", "status": "pending"},
        {"day": 3, "channel": "email", "template": "follow_up_value", "status": "pending"},
        {"day": 7, "channel": "email", "template": "educational_content", "status": "pending"},
        {"day": 10, "channel": "sms", "template": "check_in", "status": "pending"},
        {"day": 14, "channel": "email", "template": "final_outreach", "status": "pending"}
    ]',
    NOW(), NOW());
```

### Day 0 — Email + SMS (Automatic)

**Hour 0:** InboundResponseAgent has already sent the first-touch email and SMS (Flow 1). OutreachOrchestrationAgent marks steps 0 and 1 as complete.

```sql
UPDATE outreach_sequences SET
    current_step = 2,
    steps = jsonb_set(steps, '{0,status}', '"completed"'),
    updated_at = NOW()
WHERE lead_id = 'lead_xyz789' AND status = 'active';
```

OutreachOrchestrationAgent emits:
```typescript
{ type: 'SEQUENCE_STEP_COMPLETED', payload: { leadId: 'lead_xyz789', step: 0, channel: 'email' } }
{ type: 'SEQUENCE_STEP_COMPLETED', payload: { leadId: 'lead_xyz789', step: 1, channel: 'sms' } }
```

### Day 1 — Call Attempt via DialerAgent

**Trigger:** OutreachOrchestrationAgent's scheduler fires at 10:00 AM in the lead's timezone (CST).

1. OutreachOrchestrationAgent emits `OUTREACH_CALL_REQUESTED`
2. DialerAgent checks TCPA compliance (within calling hours? ✅)
3. DialerAgent initiates call via Twilio
4. **Outcome A — No Answer:** Log as "no_answer", voicemail not left (per sequence config). Schedule next step.
5. **Outcome B — Answered:** Connect to Gaetano's line. Pause sequence. Route to live conversation.
6. **Outcome C — Voicemail:** Drop pre-recorded voicemail. Log and continue sequence.

```sql
INSERT INTO call_recordings (id, lead_id, twilio_call_sid, direction, from_number, to_number,
    status, duration_seconds, created_at)
VALUES (gen_random_uuid(), 'lead_xyz789', 'CA_twilio_123', 'outbound', 
    '+12145551234', '+15551234567', 'no_answer', 0, NOW());

INSERT INTO outreach_log (id, lead_id, agent_name, channel, direction, status, external_id, created_at)
VALUES (gen_random_uuid(), 'lead_xyz789', 'DialerAgent', 'phone', 'outbound', 'no_answer', 'CA_twilio_123', NOW());
```

### Day 3 — Follow-Up Email

OutreachOrchestrationAgent triggers EmailOutreachAgent with template `follow_up_value`:

LLM generates an email that:
- References the original quote request (term life, $500K)
- Provides a genuinely useful insight ("Did you know that term life rates for your age bracket have dropped 12% this year?")
- Includes a soft CTA ("Reply to this email and I'll send you a personalized comparison")
- Does NOT feel like a generic drip email

```sql
INSERT INTO emails_sent (id, lead_id, from_address, to_address, subject, body_html, 
    template_id, status, sent_at, created_at)
VALUES (gen_random_uuid(), 'lead_xyz789', 'gaetano@gcfinsurance.com', 
    'maria.rodriguez@email.com',
    'Term life rates just dropped — here''s what that means for you',
    '<p>Hi Maria,...</p>', 'follow_up_value', 'sent', NOW(), NOW());
```

### Day 7 — Educational Content Email

ContentGenerationAgent creates a personalized content piece. Because Maria is an insurance professional, the content is tailored:

- Subject: "The independent agent's guide to personal term life coverage"
- Content: Article about why insurance agents often neglect their own coverage, common mistakes, how to evaluate policies objectively
- CTA: "Want me to run the numbers for your specific situation?"

### Day 10 — SMS Check-In

SmsMessagingAgent sends a casual, short message:

```
"Hi Maria, just checking in! Still interested in exploring term life options? 
Happy to answer any questions — even quick ones over text. — Gaetano"
```

### Day 14 — Final Outreach

Last email in the sequence. Warm, no-pressure:

- Acknowledges she might be busy or found coverage elsewhere
- Leaves the door open ("Whenever you're ready, I'm here")
- Includes direct calendar link to book an appointment
- Mentions she can reply anytime in the future

```sql
UPDATE outreach_sequences SET
    status = 'completed',
    current_step = 7,
    completed_at = NOW(),
    updated_at = NOW()
WHERE lead_id = 'lead_xyz789';
```

### On Reply at Any Point — Sequence Pause

If Maria replies to any email or SMS during the sequence:

1. **Gmail webhook** or **Twilio webhook** fires
2. The respective agent (EmailOutreachAgent or SmsMessagingAgent) detects inbound message
3. Emits `INBOUND_REPLY_RECEIVED`
4. OutreachOrchestrationAgent receives event → **immediately pauses sequence**

```sql
UPDATE outreach_sequences SET
    status = 'paused',
    pause_reason = 'inbound_reply',
    paused_at = NOW()
WHERE lead_id = 'lead_xyz789' AND status = 'active';
```

5. **If reply is a question:** AiSalesAgent generates a response draft → queued for human review
6. **If reply is "interested":** HumanEscalationAgent alerts Gaetano → priority callback
7. **If reply is "not interested" / "STOP":** Sequence marked as completed, lead moved to "lost" or opt-out recorded

---

## Flow 3: Appointment → Sale → Policy

**Trigger:** Gaetano (or AppointmentAgent) books an appointment with a qualified lead.

### Step 1 — Appointment Booked

```typescript
EventBus.emit({
    type: 'APPOINTMENT_BOOKED',
    source: 'AppointmentAgent',
    payload: {
        appointmentId: 'apt_123',
        leadId: 'lead_xyz789',
        scheduledAt: '2026-02-14T14:00:00-06:00',
        type: 'phone',
        duration: 30
    }
});
```

AppointmentAgent → Google Calendar API:

```sql
INSERT INTO appointments (id, lead_id, title, appointment_type, scheduled_at, 
    duration_minutes, status, google_calendar_event_id, created_at)
VALUES ('apt_123', 'lead_xyz789', 'Term Life Consultation — Maria Rodriguez',
    'phone', '2026-02-14 14:00:00-06', 30, 'scheduled', 'gcal_evt_abc', NOW());

UPDATE leads SET pipeline_stage = 'appointment_set', updated_at = NOW() 
WHERE id = 'lead_xyz789';
```

### Step 2 — Confirmation Email + SMS

Immediately after booking:
- **Email:** Calendar invite attached, what to expect, documents to have ready
- **SMS:** "Your call with Gaetano is confirmed for Feb 14 at 2:00 PM CT! 📅"

### Step 3 — 1-Hour Reminder

Scheduled event fires 1 hour before appointment:
- **SMS:** "Reminder: Your call with Gaetano is in 1 hour (2:00 PM). Looking forward to it!"
- **Push notification** to Gaetano: "Call with Maria Rodriguez in 1 hour. Prep ready in Call Assist."

### Step 4 — AiSalesAgent Preps Strategy

30 minutes before the call, AiSalesAgent generates a strategy brief:

```json
{
    "leadSummary": "Maria Rodriguez, 30-35, independent insurance agent in Dallas. Looking for $500K term life.",
    "recommendedProducts": [
        {"carrier": "Banner Life", "product": "OPTerm 20", "monthlyPremium": "$42", "reason": "Best rate for her profile"},
        {"carrier": "Protective", "product": "Classic Choice 20", "monthlyPremium": "$45", "reason": "Strong conversion features"}
    ],
    "likelyObjections": [
        {"objection": "I can get this through my own agency", "response": "Absolutely — but as an independent agent yourself, you know the value of having a dedicated advisor. I handle the legwork so you can focus on your clients."},
        {"objection": "I want to compare more carriers", "response": "Great instinct. I work with 30+ carriers — let me run a full comparison for you right now."}
    ],
    "talkingPoints": [
        "She's in the industry — speak peer-to-peer, not salesperson-to-prospect",
        "Her income range suggests $500K is appropriate but could consider $750K",
        "As a business owner, ask about business continuation / key person coverage"
    ],
    "crossSellOpportunities": ["E&O insurance for her agency", "Business owner's policy", "Disability insurance"]
}
```

This brief appears on the **Call Assist** page (`/agents/call-assist`).

### Step 5 — The Call (HumanSalesAssistAgent Real-Time)

During the call, HumanSalesAssistAgent provides real-time assistance on the Call Assist screen:
- Live transcription (with consent)
- When Maria mentions an objection → relevant response suggestion appears
- When discussing coverage amount → real-time premium calculations update
- When she mentions her business → cross-sell suggestions appear
- Compliance alerts if Gaetano approaches a regulated statement

### Step 6 — POLICY_SOLD

Gaetano closes the sale! He marks it in the CRM:

```typescript
EventBus.emit({
    type: 'POLICY_SOLD',
    source: 'HumanSalesAssistAgent',
    payload: {
        leadId: 'lead_xyz789',
        carrier: 'Banner Life',
        product: 'OPTerm 20',
        coverageAmount: 500000,
        premiumMonthly: 42,
        premiumAnnual: 490,
        policyType: 'term_life',
        termYears: 20
    }
});
```

```sql
UPDATE leads SET 
    pipeline_stage = 'won',
    status = 'customer',
    won_at = NOW(),
    updated_at = NOW()
WHERE id = 'lead_xyz789';

INSERT INTO policies (id, lead_id, carrier, product_name, policy_type, coverage_amount,
    premium_monthly, premium_annual, term_years, status, created_at)
VALUES (gen_random_uuid(), 'lead_xyz789', 'Banner Life', 'OPTerm 20', 'term_life',
    500000, 42.00, 490.00, 20, 'application_pending', NOW());
```

### Step 7 — ApplicationCompletionAgent Starts E-App

ApplicationCompletionAgent guides the electronic application process:
- Pre-fills known information from lead profile
- Generates required forms checklist
- Tracks completion status of each section
- Sends application to carrier via API or email

```typescript
EventBus.emit({
    type: 'APPLICATION_SUBMITTED',
    source: 'ApplicationCompletionAgent',
    payload: { leadId: 'lead_xyz789', policyId: 'pol_123', carrier: 'Banner Life' }
});
```

### Step 8 — ComplianceAgent Validates

ComplianceAgent reviews the application:
- Suitability analysis confirmed
- Replacement disclosure (if applicable) completed
- State-specific requirements met for Texas
- All signatures and disclosures collected

### Step 9 — UnderwritingIntelligenceAgent Monitors

UnderwritingIntelligenceAgent polls carrier status or receives carrier webhook:

```typescript
// Day 3: Medical records requested
EventBus.emit({ type: 'UNDERWRITING_STATUS', payload: { status: 'medical_records_requested' } });
// Day 10: Records received, in review
EventBus.emit({ type: 'UNDERWRITING_STATUS', payload: { status: 'in_review' } });
// Day 18: Approved — standard rates
EventBus.emit({ type: 'UNDERWRITING_STATUS', payload: { status: 'approved', rateClass: 'standard' } });
```

Each status change → update lead, notify Gaetano, notify client.

### Step 10 — Policy Issued + Commission

```typescript
EventBus.emit({
    type: 'POLICY_ISSUED',
    source: 'UnderwritingIntelligenceAgent',
    payload: { policyId: 'pol_123', policyNumber: 'BL-2026-123456', effectiveDate: '2026-03-01' }
});
```

CommissionAgent calculates:

```sql
INSERT INTO commissions (id, policy_id, lead_id, carrier, commission_type, 
    premium_annual, commission_rate, commission_amount, status, created_at)
VALUES (gen_random_uuid(), 'pol_123', 'lead_xyz789', 'Banner Life', 'first_year',
    490.00, 0.90, 441.00, 'pending', NOW()); -- 90% first-year commission on $490 annual premium

INSERT INTO revenue_snapshots -- updated in daily aggregation
```

```typescript
EventBus.emit({
    type: 'COMMISSION_CALCULATED',
    payload: { amount: 441.00, type: 'first_year', carrier: 'Banner Life' }
});
```

Lead status finalized: **WON** ✅

---

## Flow 4: Client Onboarding → Retention

**Trigger:** `POLICY_SOLD` event from Flow 3.

### Step 1 — Portal Account Creation (ClientPortalAgent)

On `POLICY_SOLD`:

```sql
-- Create user account for client
INSERT INTO users (id, email, first_name, last_name, role, created_at)
VALUES (gen_random_uuid(), 'maria.rodriguez@email.com', 'Maria', 'Rodriguez', 'client', NOW());

-- Create portal account
INSERT INTO client_portal_accounts (id, user_id, lead_id, portal_status, stripe_customer_id, created_at)
VALUES (gen_random_uuid(), 'user_maria', 'lead_xyz789', 'active', 'cus_stripe_maria', NOW());
```

- Stripe customer created for payment management
- Secure password generated and sent via encrypted email
- Portal URL included: `https://portal.gcfinsurance.com`

### Step 2 — Welcome Email

Rich welcome email with:
- Login credentials
- What they can do in the portal (view policy, make payments, file claims, refer friends)
- Gaetano's direct contact information
- "What to expect next" timeline

### Step 3 — 30-Day Check-In (RetentionAgent)

RetentionAgent schedules an automated check-in 30 days after policy effective date:

```typescript
EventBus.emit({
    type: 'RETENTION_CHECK_IN',
    payload: { leadId: 'lead_xyz789', checkInType: '30_day', scheduledFor: '2026-04-01' }
});
```

Email: "Hi Maria, it's been a month since your term life policy went active. Just checking in — any questions about your coverage? Also, have you logged into your client portal yet?"

### Step 4 — Annual Review Reminder

11 months after policy effective date, RetentionAgent triggers annual review sequence:
- Email: "Your annual insurance review is coming up. Let's make sure your coverage still fits your life."
- CTA: Book a review appointment
- AppointmentAgent creates availability slots

### Step 5 — Missed Payment Detection (BillingAgent)

BillingAgent monitors Stripe webhooks for failed payments:

```typescript
// Stripe webhook: payment_intent.payment_failed
EventBus.emit({
    type: 'PAYMENT_FAILED',
    source: 'BillingAgent',
    payload: { clientId: 'client_maria', policyId: 'pol_123', failureReason: 'insufficient_funds' }
});
```

### Step 6 — Lapse Prevention (RetentionAgent)

RetentionAgent triggers the lapse prevention sequence:

| Day | Action |
|-----|--------|
| 0 | Email: "Your payment didn't go through — update your payment method to keep your coverage active" |
| 1 | SMS: "Important: Your life insurance payment failed. Update your payment at [portal link] or call us." |
| 3 | Phone call attempt by DialerAgent |
| 5 | Email: "Your policy is at risk of lapsing. We don't want you to lose your coverage." |
| 7 | HumanEscalationAgent → Gaetano calls personally |

If payment resolved at any point → sequence stops, confirmation sent.

### Step 7 — Customer Support (CustomerSupportAgent)

Maria sends a message through the portal: "Can I increase my coverage to $750K?"

CustomerSupportAgent:
1. Classifies intent: `policy_change_request`
2. Checks if this can be handled automatically → No (requires new underwriting)
3. Generates response: "Great question, Maria! Increasing your coverage would require a new application, but I can make the process really smooth. Would you like me to have Gaetano reach out to discuss your options?"
4. Routes to human for follow-up

### Step 8 — Claims Processing (ClaimsAgent)

If a claim is filed:
1. ClaimsAgent presents guided form based on policy type
2. Collects required documentation
3. Validates completeness
4. Forwards to carrier
5. Monitors carrier response
6. Updates client on status at each stage

---

## Flow 5: Client Referral → New Lead

**Trigger:** A happy client submits a referral through `/portal/referrals`.

### Step 1 — Referral Submitted

Maria logs into her client portal and submits a referral:

```
POST /api/portal/referrals
{
    "referred_name": "James Chen",
    "referred_email": "james.chen@email.com",
    "referred_phone": "+15559876543",
    "notes": "My colleague, also an independent agent. Needs term life and E&O."
}
```

```sql
INSERT INTO referrals (id, referrer_client_id, referred_name, referred_email, referred_phone,
    referred_notes, status, created_at)
VALUES (gen_random_uuid(), 'client_maria', 'James Chen', 'james.chen@email.com',
    '+15559876543', 'My colleague, also an independent agent. Needs term life and E&O.',
    'submitted', NOW());
```

### Step 2 — LeadDiscoveryAgent Creates Lead

LeadDiscoveryAgent receives the referral and creates a lead with enriched source data:

```sql
INSERT INTO leads (id, first_name, last_name, email, phone, source, referral_id,
    referrer_name, status, pipeline_stage, notes, created_at)
VALUES (gen_random_uuid(), 'James', 'Chen', 'james.chen@email.com', '+15559876543',
    'referral', 'ref_123', 'Maria Rodriguez', 'new', 'new',
    'Referred by Maria Rodriguez (existing client). Independent agent needing term life and E&O.',
    NOW());
```

Emits:
```typescript
EventBus.emit({
    type: 'RAW_LEAD_CREATED',
    source: 'LeadDiscoveryAgent',
    payload: {
        leadId: 'lead_james',
        source: 'referral',
        referralId: 'ref_123',
        referrerName: 'Maria Rodriguez',
        referrerLeadId: 'lead_xyz789'
    }
});
```

### Step 3 — Full Tier 1 Pipeline

The referral lead enters the exact same pipeline as Flow 1:
- LeadIntakeAgent normalizes
- DataEnrichmentAgent enriches
- LeadScoringAgent scores (referrals get a +15 point bonus — referral leads convert at 3-5x the rate of cold leads)
- InboundResponseAgent generates personalized outreach mentioning the referral: "Hi James, Maria Rodriguez suggested I reach out..."
- ComplianceAgent validates
- Communications sent

### Step 4 — Referrer Notification

When the referral lead's status changes, Maria gets notified:

```sql
UPDATE referrals SET status = 'contacted', updated_at = NOW() WHERE id = 'ref_123';
```

Email to Maria: "Great news! We've reached out to James Chen. Thanks for the referral! 🎉"

When the referral converts to a sale:
```sql
UPDATE referrals SET 
    status = 'sold', 
    reward_type = 'gift_card',
    reward_amount = 50.00,
    updated_at = NOW() 
WHERE id = 'ref_123';
```

Email to Maria: "James just signed up! As a thank-you, a $50 gift card is on its way to you. Know anyone else who might benefit? 😊"

---

## Flow 6: Marketing → Traffic → Leads

**Trigger:** Scheduled content generation and social media posting.

### Step 1 — Content Creation (ContentGenerationAgent)

ContentGenerationAgent, based on the content calendar and trending topics:

```typescript
EventBus.emit({
    type: 'CONTENT_GENERATED',
    source: 'ContentGenerationAgent',
    payload: {
        contentId: 'content_456',
        type: 'blog_post',
        title: '5 Things Every Dallas Small Business Owner Needs to Know About Life Insurance',
        seoKeywords: ['dallas life insurance', 'small business life insurance', 'term life texas'],
        readingTime: '4 min'
    }
});
```

```sql
INSERT INTO content_pieces (id, title, content_type, body, body_html, seo_score, 
    seo_keywords, status, created_by, created_at)
VALUES ('content_456', '5 Things Every Dallas Small Business Owner...', 'blog_post',
    '...', '...', 82, '["dallas life insurance", "small business life insurance"]',
    'review', 'ContentGenerationAgent', NOW());
```

Content enters review queue → Gaetano approves → status changes to `approved`.

### Step 2 — Social Distribution (SocialPostingAgent)

SocialPostingAgent creates platform-specific versions:

- **Facebook:** Full intro paragraph + link + image
- **LinkedIn:** Professional tone, industry statistics, link
- **Instagram:** Eye-catching graphic with caption + hashtags
- **Twitter/X:** Punchy hook + link

```sql
INSERT INTO social_posts (id, content_piece_id, platform, post_text, status, scheduled_at)
VALUES 
    (gen_random_uuid(), 'content_456', 'facebook', 'Did you know that 60% of small business owners...', 'scheduled', '2026-02-11 09:00:00-06'),
    (gen_random_uuid(), 'content_456', 'linkedin', 'As a small business owner in Dallas...', 'scheduled', '2026-02-11 10:00:00-06'),
    (gen_random_uuid(), 'content_456', 'twitter', '60% of small business owners are underinsured...', 'scheduled', '2026-02-11 11:00:00-06');
```

### Step 3 — Organic Traffic → Quote Form

A Dallas business owner finds the blog post via Google search → reads the article → clicks the CTA → lands on the quote form → **Flow 1 begins.**

The lead's `utm_source` = "blog", `utm_campaign` = "5_things_dallas_business" — tracked for content ROI.

### Step 4 — Reputation Management (ReputationAgent)

Running in parallel, ReputationAgent monitors reviews:

1. **New 5-star Google review detected:**
   - Auto-generate thankful response via LLM
   - Post response to Google Business Profile
   - Flag positive review for social proof content

2. **New 2-star review detected:**
   - 🚨 Immediate alert to Gaetano
   - AI generates empathetic response draft
   - Gaetano reviews and sends (never auto-respond to negative reviews)
   - Track resolution

3. **Review request campaigns:**
   - 7 days after policy issuance, send review request to happy clients
   - "Maria, how was your experience with GCF Insurance? We'd love your feedback on Google!"
   - Track which clients leave reviews

**The marketing flywheel:** Content → Traffic → Leads → Clients → Reviews → SEO boost → More Traffic → More Leads

---

# 12. FUTURE EXPANSION POSSIBILITIES

> These are not part of the 12-week build. They represent the long-term vision for GCF as a platform — opportunities that become possible once the foundation is solid.

---

## 12.1 Multi-Agency White-Label

### Concept
Transform GCF from a single-agency tool into a platform that any insurance agency can use. Each agency gets their own branded instance with isolated data, custom branding, and independent agent teams.

### Technical Approach
- **Tenant isolation:** Add `tenant_id` column to every table. Row-level security (RLS) in PostgreSQL ensures agencies can never see each other's data. Alternatively, schema-per-tenant for stricter isolation.
- **Custom branding:** Tenant configuration table stores logo, colors, domain, email templates. CSS variables driven by tenant config. White-label login page per tenant.
- **Shared infrastructure:** All tenants share the same 37-agent army, but agents operate within tenant context. Shared carrier integrations reduce per-tenant setup cost.
- **Tenant onboarding:** Self-service signup → configure branding → invite agents → import leads → go live. Target: 30 minutes from signup to functional.

### Revenue Model
- **SaaS subscription:** $299/month base (up to 5 agents) + $49/month per additional agent seat
- **Usage tiers:** Starter (500 leads/mo), Growth (2,500 leads/mo), Enterprise (unlimited)
- **Premium add-ons:** Advanced AI features ($99/mo), carrier API integrations ($49/mo each), custom training ($199/mo)
- **Estimated revenue at 100 agencies:** $30,000–$50,000/month recurring

### Effort Estimate
8–12 weeks of development after core platform is stable. Major work: multi-tenancy layer, billing integration, onboarding flow, admin dashboard for tenant management.

### Dependencies
- Core platform (Phases 1-5) must be complete and stable
- Stripe Connect for per-tenant billing
- Legal: Terms of service, data processing agreements, privacy policy per tenant

---

## 12.2 React Native Mobile App

### Concept
Native mobile app for iOS and Android giving agents full CRM access, push notifications, and offline lead capture from anywhere.

### Technical Approach
- **React Native** with Expo for cross-platform development. Same API backend — mobile is just another client.
- **Push notifications** via Firebase Cloud Messaging (FCM) for Android, APNs for iOS. Real-time alerts for hot leads, escalations, appointment reminders.
- **Offline lead capture:** SQLite local database. Enter lead info at networking events without connectivity. Sync to server when back online.
- **Barcode scanner:** Camera integration to scan business cards. OCR extracts name, email, phone, company. Auto-creates lead.
- **Key screens:** Pipeline board (swipeable cards), lead detail, quick-action buttons (call, email, SMS), appointment calendar, notification center.

### Revenue Model
- Included in SaaS subscription (drives adoption and stickiness)
- Premium mobile features as upsell: barcode scanner ($9.99/mo), offline mode ($14.99/mo)
- Or: mobile app as higher-tier feature included in Growth/Enterprise plans

### Effort Estimate
10–14 weeks. React Native shares ~70% of business logic with web app. Major work: native navigation, push notification infrastructure, offline sync, camera/OCR integration.

### Dependencies
- Stable REST API (Phase 1-2 must be complete)
- Apple Developer Account ($99/year) and Google Play Developer Account ($25 one-time)
- Firebase project for push notifications

---

## 12.3 AI Voice Agent

### Concept
An AI agent that can make and receive phone calls autonomously. Handles initial lead qualification calls, appointment confirmations, and basic customer service inquiries — all via natural voice conversation.

### Technical Approach
- **Twilio + OpenAI Realtime API:** Twilio handles telephony (inbound/outbound calls). Audio streams to OpenAI Realtime API for real-time speech-to-speech AI conversation.
- **AiSalesAgent powers the brain:** Same knowledge base, same conversation skills, but via voice instead of text. System prompt includes phone-specific instructions (pace, tone, when to pause).
- **Transcription → ConversationMemoryAgent:** Every call is transcribed in real time. ConversationMemoryAgent stores the conversation in MemoryGraph and logs to `call_recordings` with full transcript.
- **Handoff to human:** If the AI detects a high-value opportunity or the caller requests a human, warm transfer to Gaetano with context displayed on Call Assist screen.
- **Consent:** Opening statement includes recording disclosure: "This call may be recorded for quality purposes. Is that okay?"

### Revenue Model
- Premium feature: $199/month for AI voice capabilities
- Per-minute pricing for high-volume agencies: $0.15/minute (covers Twilio + OpenAI costs with margin)
- ROI pitch: Replaces $3,000/month receptionist or lead qualification service

### Effort Estimate
6–8 weeks. Twilio integration already exists from Phase 2. Major work: OpenAI Realtime API integration, voice-specific prompt engineering, handoff logic, consent flow.

### Dependencies
- Phase 2 (Twilio integration) complete
- OpenAI Realtime API access
- State-by-state compliance review for AI-initiated calls
- Consent management system (built in Phase 2)

---

## 12.4 Carrier Marketplace

### Concept
A digital marketplace where insurance carriers list their products and agents can compare, quote, and apply in real time. Transforms GCF from an agency tool into a carrier-agent marketplace.

### Technical Approach
- **Carrier portal:** Carriers upload product information, rate tables, underwriting guidelines, and commission schedules. API integration for real-time quoting where available.
- **Comparison engine:** Agents input client details → system queries all eligible carriers → side-by-side comparison of premiums, features, underwriting requirements, commission rates.
- **Real-time underwriting decisioning:** For carriers with API integrations, get instant preliminary underwriting decisions. "Yes/No/Maybe" with conditions.
- **Application routing:** Select a product → auto-populate e-application → submit to carrier → track status.

### Revenue Model
- Carrier listing fees: $500/month per carrier for marketplace presence
- Per-quote fees: $1-2 per quote request routed to carrier
- Application referral fees: $25-50 per completed application
- Premium feature for agents: $49/month for marketplace access with advanced comparison tools
- At scale (50 carriers, 500 agents): $50,000+/month

### Effort Estimate
16–20 weeks. Complex: carrier onboarding, rate engine, comparison logic, per-carrier API integrations (each carrier is unique).

### Dependencies
- Core CRM and quoting pipeline (Phases 1-3)
- Carrier partnerships and data agreements
- Actuarial review of rate comparison accuracy
- State department of insurance compliance for each state

---

## 12.5 Agent Recruiting Platform

### Concept
A job board and onboarding pipeline for recruiting new insurance agents. TrainingAgent powers the assessment process, evaluating candidates on insurance knowledge, sales aptitude, and cultural fit.

### Technical Approach
- **Job board:** Public-facing career page with agency listings. Search by location, line of business, experience level, commission structure.
- **Application pipeline:** Apply → Assessment → Interview → Offer → Onboarding. Kanban board (like the CRM pipeline) for tracking candidates.
- **AI assessment:** TrainingAgent administers a multi-part assessment: insurance knowledge quiz, sales scenario role-play (text-based), personality/work-style questionnaire. AI scores and ranks candidates.
- **Onboarding pipeline:** Once hired: licensing verification, appointment paperwork, training modules (Study Center), mentor assignment, first-90-days checklist.

### Revenue Model
- Agency posting fees: $199/month per active job listing
- Candidate assessment fees: $29 per AI-powered assessment
- Recruiter tier: $499/month for bulk postings, candidate database access, advanced analytics
- At scale: $20,000-$40,000/month

### Effort Estimate
10–12 weeks. Job board is straightforward. AI assessment is the complex part — requires careful prompt engineering and validation against real-world performance.

### Dependencies
- TrainingAgent and Study Center (Phase 5 knowledge base)
- Legal: employment law compliance, EEOC considerations for AI-assisted hiring
- Partnership with insurance licensing verification services

---

## 12.6 Training-as-a-Service

### Concept
Package the Study Center and Avatar Council as a standalone SaaS product for other insurance agencies and training organizations. Agents study for licensing exams, practice sales scenarios, and get coached by AI avatars — all without needing the full GCF platform.

### Technical Approach
- **Standalone deployment:** Extract Study Center and Avatar Council into an independent application. Separate database, separate authentication, separate billing.
- **Content library:** Pre-built courses for all major insurance lines (Life, Health, P&C, Medicare). State-specific licensing exam prep. Continuing education (CE) credit tracking.
- **Avatar Council as a service:** Agencies configure their own avatar council members with custom personalities, knowledge bases, and coaching styles. "Upload your top producer's call recordings and we'll create an AI avatar that coaches like they do."
- **Progress tracking:** Individual agent progress, team analytics, completion certificates, CE credit documentation.

### Revenue Model
- Per-agent subscription: $29/month per agent
- Agency bulk pricing: $19/month per agent (50+ agents)
- Custom avatar creation: $999 one-time setup per avatar
- CE credit partnership: Revenue share with CE providers
- At scale (1,000 agents): $19,000–$29,000/month

### Effort Estimate
8–10 weeks to extract and standalone-ify. Content creation is ongoing. Avatar customization tooling: 4 weeks additional.

### Dependencies
- Study Center and Avatar Council fully built (Phase 3-5)
- CE credit partnerships with approved education providers
- Content licensing agreements for exam prep materials

---

## 12.7 Insurance Comparison Engine

### Concept
A consumer-facing tool where potential insurance buyers compare quotes across multiple carriers. Think "Kayak for insurance." Generates leads at massive scale by capturing visitor information in exchange for quotes.

### Technical Approach
- **Public website:** Clean, consumer-friendly interface. "Compare life insurance quotes in 60 seconds." Multi-step form: basic info → coverage needs → health questions → instant comparison.
- **Quote engine:** Integrate with carrier APIs and rate tables. Display premiums from 10+ carriers side-by-side. Filter by price, carrier rating, features.
- **Lead capture:** Viewing quotes requires email. Downloading detailed comparison requires phone. Progressive profiling captures more data with each interaction.
- **Agent routing:** Leads are routed to GCF agents (or partner agencies in white-label model). Lead quality score based on form completeness and engagement depth.
- **SEO powerhouse:** Content pages for every insurance type × every state × every carrier. Massive long-tail keyword coverage.

### Revenue Model
- Lead generation for GCF: Direct value (each comparison visitor is a potential client)
- Lead selling to partner agencies: $15-50 per qualified lead (depending on insurance type and exclusivity)
- Carrier advertising: Featured placement in comparison results ($2,000-5,000/month per carrier)
- Affiliate commissions: Revenue share on policies purchased through comparison links
- At scale (50,000 monthly visitors): $100,000+/month

### Effort Estimate
12–16 weeks. Major work: consumer UX design, carrier rate integrations, SEO content at scale, lead routing and distribution system.

### Dependencies
- Carrier API integrations (from Phase 5 / Carrier Marketplace)
- Significant content investment (1,000+ SEO-optimized pages)
- Legal: state-by-state compliance for displaying insurance rates
- Marketing budget for initial traffic acquisition

---

## 12.8
## 12.8 Franchise Model

### Concept
Package the entire GCF platform — all 8 lounges, 37 agents, training system, Avatar Council — as a turnkey franchise for independent insurance agencies. Franchisees get the tech stack, the brand, and the agent-recruitment pipeline. You get royalties on every policy sold through the network.

### Technical Approach
- Built on top of the Multi-Agency White-Label system (12.1)
- Each franchise gets their own tenant with pre-configured agents, carriers, and training
- Centralized KnowledgeBase updates pushed to all franchisees
- Shared carrier relationships (volume discounts on commissions)
- Franchise dashboard for you: see all franchisees' revenue, agent count, pipeline health
- Standardized onboarding: new franchisee → automated setup → 37 agents configured → training assigned → go live in 48 hours

### Revenue Model
- Franchise fee: $25,000-50,000 upfront
- Monthly platform fee: $2,000-5,000/mo per franchise
- Override commission: 2-5% of all franchise policy revenue
- Training seat fees: $50/agent/month
- At 50 franchises: $1.2M-3M ARR from platform fees alone + override commissions

### Effort Estimate
20-24 weeks (after white-label is built). Major work: franchise agreement legal, automated provisioning, franchise operations dashboard, support infrastructure.

### Dependencies
- Multi-Agency White-Label (12.1) must be complete
- Legal: franchise disclosure document (FDD), state franchise registrations
- Operations: franchise support team, onboarding process
- Marketing: franchise recruitment campaign

---

# 13. METRICS & KPIs

## 13.1 Per-Phase KPIs

### Phase 1 — Foundation (Weeks 1-3)
| KPI | Target | How to Measure |
|-----|--------|----------------|
| Agent data persistence | 100% of MemoryGraph synced to PostgreSQL | Compare node counts: MemoryGraph vs DB |
| All 8 lounge shells accessible | 8/8 routes load with layout | Manual navigation test |
| WebSocket connectivity | < 500ms connection time | Client-side timing |
| Event Stream live | Events appear in < 1 second | Emit test event, measure UI latency |
| CRM Pipeline functional | Leads display, drag-to-move works | Create test lead, move through stages |
| Zero data loss on restart | Restart server, verify all leads persist | Before/after count comparison |

### Phase 2 — Communication (Weeks 3-5)
| KPI | Target | How to Measure |
|-----|--------|----------------|
| Speed-to-lead (email) | < 60 seconds from form submit to email sent | Timestamp comparison: quote_request.created_at vs outreach_log.sent_at |
| Speed-to-lead (SMS) | < 90 seconds from form submit to SMS sent | Same as above for SMS channel |
| Email deliverability | > 95% delivered | SendGrid/Gmail delivery reports |
| SMS deliverability | > 98% delivered | Twilio delivery callbacks |
| Appointment booking | Calendar event created + confirmation sent | Verify Google Calendar + outreach_log |
| Human escalation latency | < 30 seconds from HUMAN_REQUIRED to notification | Event timestamp vs notification timestamp |
| Compliance gate | 100% of outbound comms pass compliance check | ComplianceAgent audit log |

### Phase 3 — Intelligence (Weeks 5-7)
| KPI | Target | How to Measure |
|-----|--------|----------------|
| LLM response quality | > 4.0/5.0 human rating on sample responses | Manual review of 50 AI-generated messages |
| AI sales prep accuracy | Product recommendations match lead profile > 80% | Compare AiSalesAgent output vs manual review |
| Call coaching insights | Actionable feedback generated for > 90% of recorded calls | CallCoachingAgent output vs call count |
| Executive brief accuracy | Revenue numbers match DB within 1% | Cross-reference brief vs SQL query |
| Revenue forecast accuracy | Within 15% of actual (improves over time) | Compare forecast vs actual monthly |
| Content generation speed | Draft blog post in < 2 minutes | Time from request to draft delivered |

### Phase 4 — Marketing & Client (Weeks 7-9)
| KPI | Target | How to Measure |
|-----|--------|----------------|
| Social post scheduling | Posts publish within 5 min of scheduled time | Compare scheduled_at vs actual post timestamp |
| Review response time | < 4 hours for new Google/Yelp reviews | ReputationAgent response timestamp |
| Client portal adoption | > 50% of new clients create portal account within 7 days | Portal registration rate |
| Self-service rate | > 30% of common inquiries handled without human | CustomerSupportAgent resolution vs escalation |
| Claims filing completion | > 80% of started claims submitted successfully | ClaimWizard funnel completion rate |
| Referral submissions | > 5% of clients submit at least one referral | Referral count / active client count |

### Phase 5 — Optimization (Weeks 9-12)
| KPI | Target | How to Measure |
|-----|--------|----------------|
| A/B test velocity | 3+ active tests running at any time | Test count in automation_rules table |
| Optimization lift | > 10% improvement in key metrics from optimization | Before/after comparison on optimized flows |
| Knowledge base freshness | < 7 days since last TrainingAgent update | Last update timestamp |
| Carrier quote speed | < 5 seconds for multi-carrier quote comparison | API response time measurement |
| Automation coverage | > 80% of lead lifecycle touchpoints automated | Manual audit of sequence enrollment rate |
| System error rate | < 0.1% of events land in dead letter queue | Dead letter count / total events |

---

## 13.2 Lounge Dashboard KPIs

### 🧠 AI Agent Lounge
| Metric | Definition | Good | Warning | Critical |
|--------|-----------|------|---------|----------|
| System Uptime | % of time all agents are RUNNING | > 99.5% | 98-99.5% | < 98% |
| Events/Second | Throughput of EventBus | 10-100 | 1-10 | < 1 |
| Error Rate | % of events that error | < 1% | 1-5% | > 5% |
| Dead Letters | Events in dead letter queue | 0 | 1-10 | > 10 |
| Avg Processing Time | Mean time per event across all agents | < 100ms | 100-500ms | > 500ms |
| Heartbeat Misses | Agents that missed last heartbeat | 0 | 1-2 | > 2 |
| Memory Usage | Server RAM consumption | < 70% | 70-85% | > 85% |

### 👥 Agent Lounge
| Metric | Definition | Daily Target |
|--------|-----------|-------------|
| Calls Made | Outbound calls attempted | 50+ per agent |
| Calls Connected | Calls that reached a person | 15+ per agent |
| Emails Sent | Outreach emails delivered | 30+ per agent |
| Appointments Set | New appointments booked | 3+ per agent |
| Policies Sold | Closed deals | 1+ per agent |
| XP Earned | Gamification points | Tracked per agent |
| Training Completed | Modules finished this week | 1+ per agent |
| Lead Response Time | Time from lead assignment to first contact | < 5 minutes |

### 📊 Manager Lounge
| Metric | Definition | Target |
|--------|-----------|--------|
| Team Close Rate | Policies sold / qualified leads | > 15% |
| Pipeline Velocity | Avg days from new lead to won/lost | < 21 days |
| Coaching Sessions | 1:1 coaching interactions this week | 2+ per agent |
| Avg Response Time | Team mean lead response time | < 3 minutes |
| Activity Compliance | % of agents hitting daily minimums | > 80% |
| Stuck Leads | Leads with no activity in 7+ days | < 10% of pipeline |
| No-Show Rate | Appointments where client didn't show | < 20% |

### 🏢 Executive Lounge
| Metric | Definition | Tracking |
|--------|-----------|----------|
| Monthly Revenue | Total commission earned this month | Rolling 30-day |
| Annual Projected Revenue | Forecast based on current pipeline + renewals | RevenueForecastAgent |
| Customer Acquisition Cost (CAC) | Total marketing spend / new clients | Monthly |
| Customer Lifetime Value (LTV) | Avg total commission per client over relationship | 10-year projection |
| LTV:CAC Ratio | LTV divided by CAC | Target: > 5:1 |
| Retention Rate | % of policies still active at 13 months | Monthly cohort |
| Agent Headcount | Active licensed agents | Current |
| Revenue Per Agent | Monthly revenue / active agents | Monthly |

### 💼 CRM Lounge
| Metric | Definition | Target |
|--------|-----------|--------|
| Pipeline by Stage | Count of leads in each stage | Visual kanban |
| Conversion Rate (stage-to-stage) | % moving to next stage | Varies by stage |
| Speed-to-Lead | Time from form submit to first contact | < 60 seconds |
| Follow-Up Compliance | % of leads with scheduled follow-up honored | > 95% |
| Lead Source ROI | Won revenue by lead source | Monthly report |
| Overdue Follow-Ups | Leads past their next_follow_up date | < 5% |

### 📣 Marketing Lounge
| Metric | Definition | Target |
|--------|-----------|--------|
| Content Published | Blog posts, social posts this month | 12+ blog, 30+ social |
| Organic Traffic | Monthly unique visitors from search | Growing 10%+ MoM |
| Social Engagement | Likes, comments, shares across platforms | Growing 15%+ MoM |
| Average Review Score | Google/Yelp average rating | > 4.7 stars |
| Campaign ROI | Revenue attributed to campaign / campaign spend | > 3:1 |
| Email Open Rate | % of marketing emails opened | > 25% |
| Email Click Rate | % of opened emails with link clicks | > 5% |

### 👤 Client Portal
| Metric | Definition | Target |
|--------|-----------|--------|
| Portal Adoption | % of clients with active portal account | > 60% |
| Self-Service Rate | % of inquiries resolved without human | > 40% |
| Support Satisfaction | CSAT score on resolved tickets | > 4.5/5 |
| Claims Processing Time | Avg days from filed to resolved | < 14 days |
| Referrals Submitted | Referral forms submitted per month | Growing |
| Document Upload Rate | % of clients with all docs uploaded | > 80% |

---

## 13.3 AI Agent Self-Scoring Methodology

The `AgentPerformanceAgent` (Tier 9) calculates a **Performance Score (0-100)** for each of the 37 agents using this formula:

```
Score = (Throughput × 0.25) + (Success × 0.30) + (Speed × 0.20) + (Impact × 0.25)

Where:
  Throughput = (events_processed / expected_events) × 100, capped at 100
  Success    = success_rate (already tracked in BaseAgent metrics)
  Speed      = max(0, 100 - ((avg_processing_ms - target_ms) / target_ms × 100))
  Impact     = agent-specific business impact metric (see below)
```

### Impact Metrics by Tier
| Tier | Agents | Impact Metric |
|------|--------|--------------|
| 0 | Orchestrator | % of events routed within SLA |
| 1 | Lead Acquisition | Lead quality score (avg score of leads produced) |
| 2 | Outreach | Contact rate (% of outreach that gets response) |
| 3 | Inbound & Speed | Speed-to-lead time (lower = better) |
| 4 | Sales | Close rate on leads they touch |
| 5 | Application | Application approval rate |
| 6 | Financial | Forecast accuracy (predicted vs actual) |
| 7 | Client Lifecycle | Client retention rate, CSAT score |
| 8 | Marketing | Content engagement rate, lead attribution |
| 9 | Analytics | Optimization lift (% improvement from changes) |
| 10 | Governance | System uptime, errors prevented, security incidents blocked |

Scores are calculated daily and stored in `agent_performance_scores` table. Trends displayed in AI Lounge and Manager Lounge.

---

## 13.4 Revenue Tracking Methodology

### Revenue Categories
| Category | Definition | Tracking Point |
|----------|-----------|----------------|
| **Premium Volume** | Total monthly premiums on all active policies | BillingAgent monitors |
| **First-Year Commission** | Commission earned on new policies (typically 80-110% of annual premium) | CommissionAgent calculates on POLICY_SOLD |
| **Renewal Commission** | Annual renewal commissions (typically 2-5% of premium) | CommissionAgent tracks annually |
| **Override Commission** | Management override on downline agent production | CommissionAgent on team hierarchy |
| **Bonuses** | Carrier production bonuses, trip qualifications | Manually entered or carrier API |
| **Chargebacks** | Commission clawed back on lapsed policies | BillingAgent detects lapse → CommissionAgent deducts |
| **Net Revenue** | Total commission - chargebacks - expenses | Calculated in AnalyticsLedger |

### Revenue Pipeline Calculation
```
Projected Revenue = Σ (lead_estimated_value × stage_probability × commission_rate)

Stage Probabilities:
  new         → 5%
  contacted   → 15%
  quoted      → 30%
  follow_up   → 50%
  won         → 100%
  lost        → 0%
```

### Industry Benchmarks vs GCF Targets
| Metric | Industry Average | GCF Phase 2 Target | GCF Phase 5 Target |
|--------|-----------------|--------------------|--------------------|
| Speed-to-Lead | 47 hours | < 60 seconds | < 30 seconds |
| Lead Contact Rate | 30% | 60% | 85% |
| Lead → Appointment | 8% | 15% | 25% |
| Appointment → Sale | 20% | 25% | 40% |
| Overall Lead → Sale | 2-3% | 5% | 12% |
| Client Retention (13-mo) | 85% | 90% | 95% |
| Agent Retention (annual) | 50% | 70% | 85% |
| Revenue Per Agent (monthly) | $3,000 | $5,000 | $10,000 |
| Customer Acquisition Cost | $200-500 | $150 | $75 |

---

# CLOSING

This document represents the complete engineering blueprint for the GCF Autonomous Insurance Enterprise OS. 8 lounges, 37 AI agents, 82+ pages, one EventBus, one closed loop.

Every lead that touches this system enters a machine that nurtures, qualifies, sells, services, retains, and generates referrals — autonomously. Every human in the system — sales agents, managers, executives, clients — interacts through a purpose-built lounge that shows them exactly what they need, powered by agents they never see.

The infrastructure is designed to scale from one agency to a franchise network. The AI agents get smarter over time through the OptimizationAgent and TrainingAgent feedback loops. The revenue tracking is granular enough to make every decision data-driven.

This is not a CRM. This is not a website with a dashboard. This is an autonomous enterprise operating system that happens to sell life insurance — for now. The architecture is industry-agnostic. The agent framework is extensible. The lounge model works for any business with multiple stakeholder roles.

Build it. Ship it. Scale it. This is the blueprint.

— JARVIS, for Gaetano Carbonara | February 10, 2026
