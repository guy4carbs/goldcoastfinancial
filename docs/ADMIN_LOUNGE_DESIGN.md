# Admin Lounge Dashboard Design

## Overview

The Admin Lounge (`/admin/avatar-council`) is the control center for managing the AI Avatar Council system. It provides real-time visualization, administrative controls, and observability tools.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ADMIN LOUNGE DASHBOARD                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┐  ┌─────────────────────────────────────┐   │
│  │    HEADER BAR               │  │  CONNECTION STATUS                  │   │
│  │  - Title: Admin Lounge      │  │  - WebSocket indicator              │   │
│  │  - Active debates count     │  │  - Last sync timestamp              │   │
│  │  - System health indicator  │  │  - Active users count               │   │
│  └─────────────────────────────┘  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     A. NETWORK GRAPH PANEL                            │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                                 │  │  │
│  │  │              ┌─────┐         ┌─────┐                           │  │  │
│  │  │              │ IE  │─────────│ SC  │                           │  │  │
│  │  │              └─────┘         └─────┘                           │  │  │
│  │  │                 │               │                              │  │  │
│  │  │                 │    ┌─────┐    │                              │  │  │
│  │  │                 └────│ MC  │────┘                              │  │  │
│  │  │                      └─────┘                                   │  │  │
│  │  │                         │                                      │  │  │
│  │  │              ┌─────┐    │    ┌─────┐                           │  │  │
│  │  │              │ CS  │────┴────│ PS  │                           │  │  │
│  │  │              └─────┘         └─────┘                           │  │  │
│  │  │                                                                 │  │  │
│  │  │  Legend: IE=Insurance Expert, SC=Sales Closer, MC=Mindset Coach │  │  │
│  │  │          CS=Compliance Specialist, PS=Persuasion Strategist     │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │  [Zoom +] [Zoom -] [Reset] [Fullscreen]     Node Size: ○ Sessions    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
├────────────────────────────────────┬─────────────────────────────────────────┤
│                                    │                                         │
│  ┌────────────────────────────┐    │  ┌─────────────────────────────────┐   │
│  │  B. AVATAR CONTROLS        │    │  │  B. DEBATE CONTROLS             │   │
│  │  ┌──────────────────────┐  │    │  │  ┌───────────────────────────┐  │   │
│  │  │ Insurance Expert     │  │    │  │  │ Active Debates: 2         │  │   │
│  │  │ ○ Enabled  Priority:9│  │    │  │  ├───────────────────────────┤  │   │
│  │  │ [Disable] [Edit]     │  │    │  │  │ Debate #1: "Best Sales.." │  │   │
│  │  ├──────────────────────┤  │    │  │  │ SC vs PS - Turn 3/6       │  │   │
│  │  │ Sales Closer         │  │    │  │  │ [Pause] [Stop] [Inject]   │  │   │
│  │  │ ○ Enabled  Priority:8│  │    │  │  ├───────────────────────────┤  │   │
│  │  │ [Disable] [Edit]     │  │    │  │  │ Debate #2: "Compliance.." │  │   │
│  │  ├──────────────────────┤  │    │  │  │ IE vs CS - Turn 2/4       │  │   │
│  │  │ Mindset Coach        │  │    │  │  │ [Pause] [Stop] [Inject]   │  │   │
│  │  │ ○ Enabled  Priority:7│  │    │  │  └───────────────────────────┘  │   │
│  │  │ [Disable] [Edit]     │  │    │  │                                 │   │
│  │  └──────────────────────┘  │    │  │  Global Controls:               │   │
│  │                            │    │  │  [Pause All] [Stop All]         │   │
│  │  [+ Add Avatar]            │    │  │  [Clear Queue]                  │   │
│  └────────────────────────────┘    │  └─────────────────────────────────┘   │
│                                    │                                         │
├────────────────────────────────────┴─────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        C. OBSERVABILITY LOGS                          │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Filter: [All ▼] [Prompts ▼] [Routing ▼] [Errors ▼]  Search: [__]│  │  │
│  │  ├─────────────────────────────────────────────────────────────────┤  │  │
│  │  │ TIME       TYPE      DETAILS                           METRICS  │  │  │
│  │  ├─────────────────────────────────────────────────────────────────┤  │  │
│  │  │ 14:32:01   PROMPT    "How to handle price objection"            │  │  │
│  │  │            ROUTING   → Objection Handler (score: 0.92)   85ms   │  │  │
│  │  │            RESPONSE  Generated 342 tokens               1.2s    │  │  │
│  │  ├─────────────────────────────────────────────────────────────────┤  │  │
│  │  │ 14:31:45   DEBATE    Started: SC vs PS on "Cold calling"        │  │  │
│  │  │            TURN 1    Sales Closer: 256 tokens            0.9s   │  │  │
│  │  │            TURN 2    Persuasion Strategist: 289 tokens   1.1s   │  │  │
│  │  ├─────────────────────────────────────────────────────────────────┤  │  │
│  │  │ 14:31:12   ERROR     Rate limit exceeded for user_123           │  │  │
│  │  │                      Retry after: 60s                           │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │  Showing 50 of 1,234 entries    [< Prev] [Page 1] [Next >]           │  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## A. Network Graph Panel

### Purpose
Real-time visualization of avatar interactions and communication patterns.

### Graph Elements

#### Nodes (Avatars)
```typescript
interface GraphNode {
  id: string;              // Avatar ID
  slug: string;            // Avatar slug for styling
  name: string;            // Display name
  isActive: boolean;       // Currently enabled
  isResponding: boolean;   // Currently generating response
  sessionCount: number;    // Active sessions involving this avatar
  messageCount: number;    // Messages in last hour
  avgLatency: number;      // Average response time (ms)
}
```

**Node Visual Properties:**
- **Size**: Proportional to session count or message volume
- **Color**: Unique per avatar (matches avatar color scheme)
- **Border**: Pulsing animation when actively responding
- **Opacity**: Dimmed if disabled
- **Badge**: Error indicator if avatar has recent failures

#### Edges (Communication Paths)
```typescript
interface GraphEdge {
  source: string;          // Source avatar ID
  target: string;          // Target avatar ID
  type: "debate" | "reference" | "handoff";
  weight: number;          // Connection strength (message count)
  isActive: boolean;       // Currently active debate
  debateId?: string;       // Associated debate ID
}
```

**Edge Visual Properties:**
- **Width**: Proportional to weight (more interaction = thicker)
- **Color**:
  - Debate: Primary color with animation
  - Reference: Muted gray
  - Handoff: Dotted line
- **Animation**: Flowing particles during active communication
- **Direction**: Arrows showing message flow direction

### Graph Interactions

| Interaction | Action |
|-------------|--------|
| Click Node | Select avatar, show details panel |
| Double-click Node | Open avatar edit modal |
| Hover Node | Show tooltip with stats |
| Click Edge | Show debate details |
| Drag Node | Reposition (physics simulation) |
| Scroll | Zoom in/out |
| Drag Background | Pan view |

### Graph Controls
```
┌─────────────────────────────────────────────────────────┐
│ [🔍+] [🔍-] [↻ Reset] [⛶ Fullscreen]                    │
│                                                         │
│ Layout: [Force ▼]  │  Show: [☑ Active only]            │
│                    │        [☑ Edge labels]             │
│ Node Size: ○ Sessions  ○ Messages  ○ Latency           │
│ Time Range: [Last Hour ▼]                               │
└─────────────────────────────────────────────────────────┘
```

### Live Updates
- **WebSocket Events:**
  - `graph:node:update` - Avatar state change
  - `graph:edge:create` - New debate started
  - `graph:edge:update` - Debate progress
  - `graph:edge:remove` - Debate ended
  - `graph:pulse` - Message sent (triggers animation)

---

## B. Admin Controls

### B.1 Avatar Management Panel

```
┌──────────────────────────────────────────────────────┐
│  AVATAR MANAGEMENT                          [+ Add]  │
├──────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐  │
│  │ 🔵 Insurance Expert                            │  │
│  │ Domains: insurance, underwriting, compliance   │  │
│  │ Style: analytical  │  Priority: 9/10           │  │
│  │ Sessions: 12  │  Messages: 156  │  Avg: 1.2s   │  │
│  │ ─────────────────────────────────────────────  │  │
│  │ [Toggle ●] [✏️ Edit] [📊 Stats] [🗑️ Delete]     │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ 🟠 Sales Closer                                │  │
│  │ Domains: sales, closing, negotiation           │  │
│  │ Style: aggressive  │  Priority: 8/10           │  │
│  │ Sessions: 8  │  Messages: 89  │  Avg: 0.9s     │  │
│  │ ─────────────────────────────────────────────  │  │
│  │ [Toggle ●] [✏️ Edit] [📊 Stats] [🗑️ Delete]     │  │
│  └────────────────────────────────────────────────┘  │
│  ... more avatars ...                                │
└──────────────────────────────────────────────────────┘
```

#### Avatar Edit Modal
```typescript
interface AvatarEditForm {
  name: string;
  slug: string;
  domainExpertise: string[];      // Tag input
  speakingStyle: string;          // Textarea
  debateStyle: "analytical" | "aggressive" | "empathetic";
  responsePriority: number;       // 1-10 slider
  systemPrompt: string;           // Large textarea with syntax highlighting
  isActive: boolean;

  // Advanced settings
  maxTokens: number;
  temperature: number;
  topP: number;

  // Bias/Constraints
  biasInstructions?: string;      // Additional system-level guidance
  constraints?: string[];         // Hard constraints (never mention X)
}
```

### B.2 Debate Controls Panel

```
┌──────────────────────────────────────────────────────┐
│  ACTIVE DEBATES (2)                    [Pause All]   │
├──────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐  │
│  │ 🟢 ACTIVE  ID: dbt_abc123                      │  │
│  │ "Best approach for final expense sales"        │  │
│  │ ─────────────────────────────────────────────  │  │
│  │ 🟠 Sales Closer  VS  🔴 Persuasion Strategist  │  │
│  │ Turn: 3 of 6  │  Started: 2 min ago            │  │
│  │ ━━━━━━━━━━━━━━━━━━━░░░░░░░░░░  50%             │  │
│  │ ─────────────────────────────────────────────  │  │
│  │ Controls:                                      │  │
│  │ [⏸️ Pause] [⏹️ Stop] [💉 Inject] [⏭️ Skip Turn]  │  │
│  │ [🔇 Mute SC] [🔇 Mute PS] [➕ Add Avatar]       │  │
│  │ ─────────────────────────────────────────────  │  │
│  │ Force Next: [Sales Closer ▼] [Force Turn →]   │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ ⏸️ PAUSED  ID: dbt_def456                      │  │
│  │ "Compliance vs speed in underwriting"          │  │
│  │ ... (similar controls) ...                     │  │
│  └────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────┤
│  GLOBAL CONTROLS                                     │
│  [🛑 Stop All Debates] [🧹 Clear Pending Queue]      │
│  [📊 Export Debate Logs]                             │
└──────────────────────────────────────────────────────┘
```

#### Inject Message Modal
```
┌──────────────────────────────────────────────────────┐
│  💉 INJECT MESSAGE                           [X]     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Inject As:                                          │
│  ○ System (invisible guidance)                       │
│  ○ Moderator (visible as neutral party)              │
│  ○ As Avatar: [Sales Closer ▼]                       │
│                                                      │
│  Message:                                            │
│  ┌────────────────────────────────────────────────┐  │
│  │ Please focus your next response on the         │  │
│  │ compliance implications of this approach.      │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  Visibility:                                         │
│  [☑] Show in user-facing transcript                  │
│  [☐] Hidden (system-level only)                      │
│                                                      │
│  [Cancel]                          [💉 Inject Now]   │
└──────────────────────────────────────────────────────┘
```

### B.3 Routing Configuration

```
┌──────────────────────────────────────────────────────┐
│  ROUTING CONFIGURATION                               │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Auto-Routing Mode:                                  │
│  ○ Automatic (AI selects best avatar)                │
│  ○ Manual Only (user must select)                    │
│  ○ Suggest (show recommendation, user confirms)      │
│                                                      │
│  Debate Trigger Threshold:                           │
│  When 2+ avatars score within [15]% of each other    │
│  [☑] Auto-suggest debate mode                        │
│                                                      │
│  Priority Overrides:                                 │
│  ┌────────────────────────────────────────────────┐  │
│  │ Domain        │ Force Avatar       │ Active    │  │
│  ├───────────────┼────────────────────┼───────────┤  │
│  │ compliance    │ Compliance Spec.   │ [●]       │  │
│  │ objections    │ Objection Handler  │ [●]       │  │
│  │ (add more...) │                    │           │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  Bias Instructions (applies to all avatars):         │
│  ┌────────────────────────────────────────────────┐  │
│  │ Always emphasize ethical sales practices.      │  │
│  │ Never recommend high-pressure tactics.         │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  [Save Configuration]                                │
└──────────────────────────────────────────────────────┘
```

---

## C. Observability Logs

### Log Entry Types

```typescript
type LogEntryType =
  | "prompt"           // User submitted a question
  | "routing"          // Avatar selection decision
  | "response_start"   // Avatar began generating
  | "response_end"     // Avatar finished
  | "debate_start"     // Debate initiated
  | "debate_turn"      // Individual debate turn
  | "debate_end"       // Debate completed/interrupted
  | "admin_action"     // Admin performed action
  | "error"            // Error occurred
  | "rate_limit"       // Rate limit hit
  | "websocket";       // Connection event

interface LogEntry {
  id: string;
  timestamp: string;
  type: LogEntryType;

  // Context
  userId?: string;
  sessionId?: string;
  debateId?: string;
  avatarId?: string;

  // Content
  summary: string;           // One-line description
  details: Record<string, any>;  // Full structured data

  // Metrics
  latencyMs?: number;
  tokensIn?: number;
  tokensOut?: number;

  // Classification
  severity: "info" | "warning" | "error";
  tags: string[];
}
```

### Log Panel UI

```
┌────────────────────────────────────────────────────────────────────────────┐
│  OBSERVABILITY LOGS                                          [⟳ Auto-refresh]│
├────────────────────────────────────────────────────────────────────────────┤
│  Filters:                                                                   │
│  Type: [All ▼]  Severity: [All ▼]  Avatar: [All ▼]  Time: [Last Hour ▼]   │
│  Search: [________________________] [🔍]                                    │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ 14:32:01.234  INFO  PROMPT                                          │  │
│  │ ───────────────────────────────────────────────────────────────────  │  │
│  │ User: user_abc123  │  Session: sess_xyz789                          │  │
│  │ Prompt: "How do I handle the 'I need to think about it' objection?" │  │
│  │ ▼ Expand details                                                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ 14:32:01.319  INFO  ROUTING                              85ms       │  │
│  │ ───────────────────────────────────────────────────────────────────  │  │
│  │ Selected: Objection Handler (score: 0.92)                           │  │
│  │ Runners-up: Sales Closer (0.78), Insurance Expert (0.45)            │  │
│  │                                                                     │  │
│  │ ▼ Scoring Breakdown:                                                │  │
│  │   Domain Match:     +0.40 (objections → objection-handler)          │  │
│  │   Question Type:    +0.30 (rebuttal)                                │  │
│  │   Priority Bonus:   +0.15 (priority: 8)                             │  │
│  │   Admin Adjustment: +0.07 (objection domain override)               │  │
│  │   Total:            0.92                                            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ 14:32:02.456  INFO  RESPONSE_END                         1,137ms    │  │
│  │ ───────────────────────────────────────────────────────────────────  │  │
│  │ Avatar: Objection Handler                                           │  │
│  │ Tokens: 45 in → 342 out  │  Model: gpt-4-turbo                      │  │
│  │ ▼ View response content                                             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ 14:31:45.000  INFO  DEBATE_START                                    │  │
│  │ ───────────────────────────────────────────────────────────────────  │  │
│  │ Debate ID: dbt_abc123                                               │  │
│  │ Topic: "Best approach for cold calling in final expense"            │  │
│  │ Participants: Sales Closer vs Persuasion Strategist                 │  │
│  │ Max Turns: 6  │  Strategy: PING_PONG                                │  │
│  │ Triggered by: Auto (score difference < 15%)                         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ 14:31:12.789  ERROR  RATE_LIMIT                                     │  │
│  │ ───────────────────────────────────────────────────────────────────  │  │
│  │ User: user_def456  │  Error: Too many requests                      │  │
│  │ Limit: 20 req/min  │  Current: 23  │  Retry after: 60s              │  │
│  │ ▼ Stack trace                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│  Showing 1-50 of 1,234  │  [◀ Prev] Page 1 of 25 [Next ▶]  │  [Export CSV]│
└────────────────────────────────────────────────────────────────────────────┘
```

### Log Detail Expansion

When "▼ Expand details" is clicked:

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 14:32:01.319  INFO  ROUTING                              85ms           │
│ ───────────────────────────────────────────────────────────────────────  │
│ Selected: Objection Handler (score: 0.92)                               │
│                                                                         │
│ ▲ Collapse                                                              │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ {                                                                   │ │
│ │   "intent": {                                                       │ │
│ │     "domain": "objections",                                         │ │
│ │     "questionType": "rebuttal",                                     │ │
│ │     "confidence": 0.94,                                             │ │
│ │     "keywords": ["think about it", "objection", "handle"]           │ │
│ │   },                                                                │ │
│ │   "scores": [                                                       │ │
│ │     { "avatarId": "...", "slug": "objection-handler", "score": 0.92,│ │
│ │       "breakdown": { "domain": 0.40, "questionType": 0.30, ... } }, │ │
│ │     { "avatarId": "...", "slug": "sales-closer", "score": 0.78 },   │ │
│ │     { "avatarId": "...", "slug": "insurance-expert", "score": 0.45 }│ │
│ │   ],                                                                │ │
│ │   "debateTrigger": { "triggered": false, "reason": "clear winner" } │ │
│ │ }                                                                   │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ [📋 Copy JSON]  [🔗 Share Link]                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

```
AdminAvatarCouncil (Page)
├── AdminHeader
│   ├── SystemHealthBadge
│   ├── ActiveDebatesCounter
│   └── ConnectionStatus
│
├── NetworkGraphPanel
│   ├── D3NetworkGraph
│   │   ├── GraphNode (per avatar)
│   │   ├── GraphEdge (per connection)
│   │   └── GraphTooltip
│   └── GraphControls
│       ├── ZoomControls
│       ├── LayoutSelector
│       └── FilterOptions
│
├── ControlPanels (Split View)
│   ├── AvatarManagementPanel
│   │   ├── AvatarControlCard (per avatar)
│   │   │   ├── AvatarToggle
│   │   │   ├── QuickStats
│   │   │   └── ActionButtons
│   │   └── AddAvatarButton
│   │
│   └── DebateControlPanel
│       ├── ActiveDebateCard (per debate)
│       │   ├── DebateProgress
│       │   ├── ParticipantIndicators
│       │   └── DebateActions
│       └── GlobalControls
│
├── RoutingConfigPanel
│   ├── ModeSelector
│   ├── ThresholdSlider
│   ├── PriorityOverrideTable
│   └── BiasInstructionEditor
│
├── ObservabilityPanel
│   ├── LogFilters
│   ├── LogList
│   │   └── LogEntry (per log)
│   │       ├── LogSummary
│   │       └── LogDetails (expandable)
│   └── LogPagination
│
└── Modals
    ├── AvatarEditModal
    ├── InjectMessageModal
    └── DebateDetailsModal
```

---

## Data Flow

### WebSocket Events (Admin)

```typescript
// Server → Admin Client
interface AdminWebSocketEvents {
  // Graph updates
  "admin:graph:update": GraphUpdatePayload;
  "admin:graph:pulse": { nodeId: string; type: "message" | "error" };

  // Debate updates
  "admin:debate:started": DebateInfo;
  "admin:debate:turn": { debateId: string; turn: number; avatarId: string };
  "admin:debate:ended": { debateId: string; status: string };

  // Log streaming
  "admin:log:entry": LogEntry;

  // Stats updates
  "admin:stats:update": SystemStats;
}

// Admin Client → Server
interface AdminClientEvents {
  // Avatar management
  "admin:avatar:toggle": { avatarId: string; enabled: boolean };
  "admin:avatar:update": AvatarEditForm;

  // Debate control
  "admin:debate:pause": { debateId: string };
  "admin:debate:resume": { debateId: string };
  "admin:debate:stop": { debateId: string };
  "admin:debate:inject": { debateId: string; message: string; asAvatar?: string };
  "admin:debate:force-turn": { debateId: string; avatarId: string };

  // Global
  "admin:pause-all": {};
  "admin:stop-all": {};
}
```

### REST Endpoints (Admin)

```
GET    /api/admin/avatar-council/stats       - System statistics
GET    /api/admin/avatar-council/graph       - Current graph state
GET    /api/admin/avatar-council/logs        - Paginated logs
POST   /api/admin/avatar-council/logs/export - Export logs as CSV

GET    /api/admin/avatars                    - List all avatars
POST   /api/admin/avatars                    - Create avatar
PATCH  /api/admin/avatars/:id                - Update avatar
DELETE /api/admin/avatars/:id                - Delete avatar

GET    /api/admin/debates                    - List active debates
POST   /api/admin/debates/:id/pause          - Pause debate
POST   /api/admin/debates/:id/resume         - Resume debate
POST   /api/admin/debates/:id/stop           - Stop debate
POST   /api/admin/debates/:id/inject         - Inject message

GET    /api/admin/routing/config             - Get routing config
PUT    /api/admin/routing/config             - Update routing config
```

---

## Metrics Dashboard (Summary View)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SYSTEM METRICS                                          Last 24 Hours  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   1,234     │  │     89      │  │    1.2s     │  │     3       │    │
│  │  Messages   │  │   Debates   │  │  Avg Latency│  │   Errors    │    │
│  │   +12%      │  │    +5%      │  │    -8%      │  │    -50%     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                         │
│  Token Usage by Avatar:                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Insurance Expert    ████████████████████░░░░░  45,230 (32%)     │   │
│  │ Sales Closer        ██████████████░░░░░░░░░░░  28,450 (20%)     │   │
│  │ Objection Handler   ████████████░░░░░░░░░░░░░  24,120 (17%)     │   │
│  │ Mindset Coach       █████████░░░░░░░░░░░░░░░░  18,900 (13%)     │   │
│  │ Others              ███████░░░░░░░░░░░░░░░░░░  25,300 (18%)     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Response Time Distribution:                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │     ▁▂▅███▆▄▂▁                                                  │   │
│  │   0.5s   1s   1.5s   2s   2.5s   3s                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Responsive Behavior

### Desktop (≥1280px)
- Full 3-column layout: Graph | Controls | Logs
- All panels visible simultaneously

### Tablet (768px - 1279px)
- 2-column: Graph (full width top) | Controls + Logs (tabbed bottom)
- Collapsible panels

### Mobile (< 768px)
- Single column with tab navigation
- Tabs: Graph | Avatars | Debates | Logs
- Simplified graph (list view option)

---

## Accessibility

- **ARIA roles**: `role="log"` for log panel, `role="status"` for live updates
- **Live regions**: `aria-live="polite"` for new log entries
- **Keyboard navigation**: Tab through all controls, Enter to expand
- **Focus management**: Return focus after modal close
- **Color contrast**: All text meets WCAG AA
- **Screen reader**: Descriptive labels for graph elements

---

## Security Considerations

- **Authentication**: Admin routes require admin role
- **Authorization**: Avatar edits logged with admin ID
- **Rate limiting**: Admin actions rate-limited to prevent abuse
- **Audit trail**: All admin actions logged immutably
- **Input sanitization**: System prompts sanitized before storage
