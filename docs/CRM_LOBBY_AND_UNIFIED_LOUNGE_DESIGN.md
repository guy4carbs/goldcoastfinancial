# CRM Lobby & Unified Lounge Design System

## The Vision: CRM as a Luxury Hotel Lobby

The CRM is not a workspace - it's the **grand lobby** of your business. Like walking into The Ritz-Carlton:

- **Welcoming** - Everyone enters here first
- **Orientation** - See what's happening, find your way
- **General Information** - Nothing sensitive, everything appropriate
- **Doors to Private Spaces** - Navigate to your specific lounge

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                          CRM LOBBY                                      │
│                                                                         │
│   "Welcome. Here's what's happening. Where would you like to go?"       │
│                                                                         │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│   │             │  │             │  │             │  │             │   │
│   │   AGENT     │  │   FINANCE   │  │  MARKETING  │  │     AI      │   │
│   │   LOUNGE    │  │   LOUNGE    │  │   LOUNGE    │  │   LOUNGE    │   │
│   │             │  │             │  │             │  │             │   │
│   │  For Sales  │  │ For Finance │  │For Marketing│  │  For Admin  │   │
│   │    Team     │  │    Team     │  │    Team     │  │    Team     │   │
│   │             │  │             │  │             │  │             │   │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 1: CRM Lobby Design

### What the Lobby Shows (General, Non-Sensitive)

| Section | Content | Why It's Here |
|---------|---------|---------------|
| **Welcome Banner** | Greeting, today's date, quick stats | Orientation |
| **Activity Pulse** | Recent general activity across company | "What's happening" |
| **Pipeline Overview** | High-level funnel (not individual deals) | Business health |
| **Team Presence** | Who's online, what lounges are active | Social awareness |
| **Quick Navigation** | Prominent doors to all accessible lounges | Wayfinding |
| **Announcements** | Company news, updates, reminders | Communication |
| **Search** | Find contacts, deals, documents | Universal access |

### What the Lobby Does NOT Show

| Hidden | Reason | Where It Lives |
|--------|--------|----------------|
| Individual commission amounts | Sensitive | Finance Lounge |
| Specific deal values | Competitive | Agent Lounge |
| AI agent configurations | Technical | AI Lounge |
| Marketing campaign metrics | Specialized | Marketing Lounge |
| Individual performance rankings | Personal | Agent/Manager Lounge |
| Client SSN, financial details | Encrypted | Respective lounges |

### Lobby Page Structure

```
/crm                    → Lobby Landing (the main welcome page)
/crm/directory          → Contact Directory (basic info only)
/crm/activity           → Company Activity Feed
/crm/calendar           → Shared Calendar View
/crm/announcements      → Company Announcements
/crm/search             → Universal Search
```

### Lobby Landing Page Wireframe

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]  CRM Lobby                    [Search]  [Notifications] [U] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │   Good morning, Sarah.                          Feb 12, 2026  │  │
│  │   Here's what's happening at Heritage Insurance today.        │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────── YOUR LOUNGES ───────────┐  ┌─────── PULSE ────────┐  │
│  │                                    │  │                      │  │
│  │  ┌────────┐  ┌────────┐           │  │  ● 3 new leads       │  │
│  │  │ AGENT  │  │FINANCE │           │  │  ● 2 deals closed    │  │
│  │  │ ▶ Go   │  │ ▶ Go   │           │  │  ● 5 appointments    │  │
│  │  └────────┘  └────────┘           │  │  ● 12 emails sent    │  │
│  │                                    │  │                      │  │
│  │  ┌────────┐  ┌────────┐           │  │  Last hour ──────    │  │
│  │  │MANAGER │  │   AI   │           │  │                      │  │
│  │  │ ▶ Go   │  │ ▶ Go   │           │  └──────────────────────┘  │
│  │  └────────┘  └────────┘           │                            │
│  │                                    │  ┌─────── TEAM ─────────┐  │
│  └────────────────────────────────────┘  │                      │  │
│                                          │  ● 8 agents online   │  │
│  ┌─────────── PIPELINE HEALTH ────────┐  │  ● 3 in meetings     │  │
│  │                                    │  │  ● 2 on calls        │  │
│  │   New ████████░░░░░░░░░░  24       │  │                      │  │
│  │   Qualified ██████░░░░░░  18       │  │  Sarah M. (you)      │  │
│  │   Quoted █████░░░░░░░░░░  15       │  │  Mike T. - Agent     │  │
│  │   Closing ███░░░░░░░░░░░   9       │  │  Lisa K. - Manager   │  │
│  │   Won ██░░░░░░░░░░░░░░░░   6       │  │  ...                 │  │
│  │                                    │  │                      │  │
│  │   Company-wide • This month        │  └──────────────────────┘  │
│  └────────────────────────────────────┘                            │
│                                                                     │
│  ┌─────────────────── ANNOUNCEMENTS ────────────────────────────┐  │
│  │                                                               │  │
│  │  📢 New carrier added: Royal Neighbors     Posted 2 days ago │  │
│  │  📢 Q1 kickoff meeting Friday 9am          Posted 3 days ago │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Part 2: Unified Lounge Design System

### Problem: Current Inconsistencies

| Issue | Current State |
|-------|---------------|
| **Agent Lounge** | Custom layout, doesn't use shared LoungeLayout |
| **Colors** | Each lounge defines colors differently |
| **Animations** | Agent has gamification, others don't |
| **Navigation** | Agent has mobile nav, others don't |
| **Components** | Some lounges share, Agent is isolated |
| **Missing Lounges** | Finance, Support, Admin, Investor not built |

### Solution: Unified Design Language

All lounges will share:
1. **Same base layout** (enhanced LoungeLayout)
2. **Same animation library** (consistent Framer Motion patterns)
3. **Same component library** (lounge-specific cards, stats, etc.)
4. **Same responsive behavior** (mobile nav for all)
5. **Color theming** (each lounge has a color, applied consistently)

---

### Master Color Palette

```typescript
// Unified lounge colors
export const LOUNGE_THEMES = {
  lobby: {
    id: 'lobby',
    name: 'CRM Lobby',
    primary: '#1E1B4B',      // Deep indigo (welcoming, neutral)
    accent: '#6366F1',       // Indigo
    light: '#E0E7FF',
    gradient: 'from-indigo-900 to-slate-900',
  },
  agent: {
    id: 'agent',
    name: 'Agent Lounge',
    primary: '#292966',      // Heritage navy
    accent: '#7C7CFF',       // Heritage purple
    light: '#B8B8FF',
    gradient: 'from-violet-600 to-indigo-600',
  },
  finance: {
    id: 'finance',
    name: 'Finance Lounge',
    primary: '#064E3B',      // Deep emerald
    accent: '#10B981',       // Emerald
    light: '#D1FAE5',
    gradient: 'from-emerald-600 to-teal-600',
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing Lounge',
    primary: '#9F1239',      // Deep rose
    accent: '#F43F5E',       // Rose
    light: '#FFE4E6',
    gradient: 'from-rose-600 to-pink-600',
  },
  ai: {
    id: 'ai',
    name: 'AI Lounge',
    primary: '#164E63',      // Deep cyan
    accent: '#06B6D4',       // Cyan
    light: '#CFFAFE',
    gradient: 'from-cyan-600 to-blue-600',
  },
  manager: {
    id: 'manager',
    name: 'Manager Lounge',
    primary: '#1E3A5F',      // Deep blue
    accent: '#3B82F6',       // Blue
    light: '#DBEAFE',
    gradient: 'from-blue-600 to-indigo-600',
  },
  executive: {
    id: 'executive',
    name: 'Executive Lounge',
    primary: '#78350F',      // Deep amber
    accent: '#F59E0B',       // Amber
    light: '#FEF3C7',
    gradient: 'from-amber-500 to-orange-500',
  },
  support: {
    id: 'support',
    name: 'Support Lounge',
    primary: '#7C2D12',      // Deep orange
    accent: '#EA580C',       // Orange
    light: '#FFEDD5',
    gradient: 'from-orange-500 to-red-500',
  },
  admin: {
    id: 'admin',
    name: 'Admin Lounge',
    primary: '#1E293B',      // Deep slate
    accent: '#64748B',       // Slate
    light: '#F1F5F9',
    gradient: 'from-slate-700 to-gray-800',
  },
  investor: {
    id: 'investor',
    name: 'Investor Lounge',
    primary: '#312E81',      // Deep violet
    accent: '#8B5CF6',       // Violet
    light: '#EDE9FE',
    gradient: 'from-violet-600 to-purple-600',
  },
} as const;
```

---

### Unified Animation System

```typescript
// Shared animations for ALL lounges
export const LOUNGE_ANIMATIONS = {
  // Page transitions
  pageEnter: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Card hover
  cardHover: {
    rest: { scale: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    hover: { scale: 1.02, boxShadow: '0 10px 40px rgba(0,0,0,0.15)' },
    tap: { scale: 0.98 },
  },

  // Sidebar item
  sidebarItem: {
    rest: { x: 0 },
    hover: { x: 4 },
    tap: { scale: 0.98 },
  },

  // Stat counter (number animation)
  statCounter: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    transition: { type: 'spring', stiffness: 200, damping: 15 },
  },

  // Stagger children
  staggerContainer: {
    animate: { transition: { staggerChildren: 0.05 } },
  },
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },

  // Pulse (for live indicators)
  pulse: {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },

  // Slide in panel
  slidePanel: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: { type: 'spring', damping: 25, stiffness: 200 },
  },
};
```

---

### Unified Component Library

Every lounge uses these same components (themed by lounge color):

```typescript
// Shared lounge components

// 1. LoungeStatCard - Consistent stat display
<LoungeStatCard
  title="Total Leads"
  value={247}
  change="+12%"
  changeType="positive"
  icon={Users}
  loungeTheme={LOUNGE_THEMES.agent}
/>

// 2. LoungeActivityFeed - Activity stream
<LoungeActivityFeed
  activities={activities}
  maxItems={10}
  showSource={true}
  loungeTheme={LOUNGE_THEMES.agent}
/>

// 3. LoungeNavigationCard - Door to another lounge
<LoungeNavigationCard
  lounge={LOUNGE_THEMES.finance}
  description="View commissions and revenue"
  stats={{ pending: 3 }}
/>

// 4. LoungeHeader - Page header with breadcrumbs
<LoungeHeader
  title="Dashboard"
  subtitle="Welcome back, Sarah"
  actions={<Button>New Lead</Button>}
  loungeTheme={LOUNGE_THEMES.agent}
/>

// 5. LoungeEmptyState - Consistent empty states
<LoungeEmptyState
  icon={Inbox}
  title="No leads yet"
  description="Leads will appear here when created"
  action={<Button>Import Leads</Button>}
  loungeTheme={LOUNGE_THEMES.agent}
/>

// 6. LoungeLoadingSkeleton - Loading states
<LoungeLoadingSkeleton type="stats" count={4} />
<LoungeLoadingSkeleton type="table" rows={5} />
<LoungeLoadingSkeleton type="cards" count={6} />
```

---

### Unified Layout Structure

```typescript
// Enhanced LoungeLayout (replaces current)

interface UnifiedLoungeLayoutProps {
  // Identity
  loungeId: LoungeId;

  // Navigation
  sidebarSections: SidebarSection[];

  // Optional features
  showSearch?: boolean;
  showNotifications?: boolean;
  showTeamPresence?: boolean;
  showMobileNav?: boolean;        // NEW: All lounges get mobile nav

  // Gamification (optional)
  gamification?: {
    level: number;
    xp: number;
    streak: number;
  };

  // Custom slots
  sidebarFooter?: ReactNode;
  headerActions?: ReactNode;

  children: ReactNode;
}
```

---

## Part 3: What Must Change

### REMOVE (Current CRM Pages → Relocate or Delete)

| Current Page | Action | Destination |
|--------------|--------|-------------|
| `/crm/dashboard` | **REPLACE** | New Lobby Landing |
| `/crm/pipeline` | **MOVE** | Agent Lounge (`/agents/pipeline`) |
| `/crm/contacts` | **SIMPLIFY** | Lobby Directory (basic view) |
| `/crm/clients` | **MOVE** | Agent Lounge (`/agents/clients`) |
| `/crm/segments` | **MOVE** | Marketing Lounge (`/marketing/segments`) |
| `/crm/import` | **KEEP** | Lobby utility |
| `/crm/export` | **KEEP** | Lobby utility |
| `/crm/history` | **SIMPLIFY** | Lobby Activity Feed (general only) |
| `/crm/settings` | **MOVE** | Admin Lounge |

### ADD (New Lobby Features)

| New Feature | Description |
|-------------|-------------|
| **Lobby Landing** | Welcome page with lounge navigation |
| **Activity Pulse** | Real-time company-wide activity feed |
| **Team Presence** | Who's online, what lounges active |
| **Announcements** | Company news board |
| **Contact Directory** | Basic contact lookup (no sensitive data) |
| **Shared Calendar** | Company-wide calendar view |
| **Universal Search** | Search across all data user can access |

### CHANGE (Existing Lounges)

| Lounge | Changes Required |
|--------|------------------|
| **Agent Lounge** | Migrate to unified LoungeLayout, keep gamification as optional feature |
| **Marketing** | Build out pages, use unified components |
| **Manager** | Build out pages, use unified components |
| **Executive** | Build out pages, use unified components |
| **AI** | Already good, apply unified theme |
| **Finance** | Build from scratch using unified system |
| **Support** | Build from scratch using unified system |
| **Admin** | Build from scratch using unified system |
| **Investor** | Build from scratch using unified system |

---

## Part 4: File Structure Changes

### Current Structure
```
client/src/pages/
├── crm/
│   ├── CRMLoungeLayout.tsx      ← DELETE (use unified)
│   ├── CRMDashboard.tsx         ← REPLACE with Lobby Landing
│   ├── PipelineBoard.tsx        ← MOVE to /agents
│   ├── ContactDatabase.tsx      ← SIMPLIFY for Lobby
│   ├── ClientManagement.tsx     ← MOVE to /agents
│   ├── SegmentsTags.tsx         ← MOVE to /marketing
│   ├── ImportExport.tsx         ← KEEP
│   └── ActivityHistory.tsx      ← SIMPLIFY for Lobby
```

### New Structure
```
client/src/
├── components/
│   └── lounge/                   ← NEW: Unified lounge components
│       ├── UnifiedLoungeLayout.tsx
│       ├── LoungeStatCard.tsx
│       ├── LoungeActivityFeed.tsx
│       ├── LoungeNavigationCard.tsx
│       ├── LoungeHeader.tsx
│       ├── LoungeEmptyState.tsx
│       ├── LoungeLoadingSkeleton.tsx
│       ├── LoungeMobileNav.tsx
│       └── LoungeThemeProvider.tsx
│
├── lib/
│   ├── loungeThemes.ts           ← NEW: Unified color themes
│   ├── loungeAnimations.ts       ← NEW: Unified animations
│   └── designTokens.ts           ← KEEP (already good)
│
├── pages/
│   ├── lobby/                    ← NEW: CRM Lobby pages
│   │   ├── LobbyLanding.tsx      ← Welcome + navigation
│   │   ├── LobbyDirectory.tsx    ← Basic contact lookup
│   │   ├── LobbyActivity.tsx     ← Company activity feed
│   │   ├── LobbyCalendar.tsx     ← Shared calendar
│   │   ├── LobbyAnnouncements.tsx
│   │   ├── LobbyImport.tsx       ← Moved from CRM
│   │   ├── LobbyExport.tsx       ← Moved from CRM
│   │   └── index.ts
│   │
│   ├── agents/                   ← ENHANCED
│   │   ├── ...existing...
│   │   ├── AgentPipeline.tsx     ← MOVED from CRM
│   │   └── AgentClients.tsx      ← MOVED from CRM
│   │
│   ├── marketing/                ← ENHANCED
│   │   ├── ...existing...
│   │   └── MarketingSegments.tsx ← MOVED from CRM
│   │
│   ├── finance/                  ← NEW: Build from scratch
│   ├── support/                  ← NEW: Build from scratch
│   ├── admin/                    ← NEW: Build from scratch
│   └── investor/                 ← NEW: Build from scratch
```

---

## Part 5: Route Changes

### Before
```
/crm/dashboard      → CRM Dashboard
/crm/pipeline       → Pipeline Board
/crm/contacts       → Contact Database
/crm/clients        → Client Management
/crm/segments       → Segments & Tags
/crm/import         → Import
/crm/export         → Export
/crm/history        → Activity History
```

### After
```
/lobby              → Lobby Landing (welcome + navigation)
/lobby/directory    → Contact Directory (basic lookup)
/lobby/activity     → Company Activity Feed
/lobby/calendar     → Shared Calendar
/lobby/announcements → Company Announcements
/lobby/import       → Import Tool
/lobby/export       → Export Tool

/agents/pipeline    → Pipeline Board (moved)
/agents/clients     → Client Management (moved)

/marketing/segments → Segments & Tags (moved)
```

### Redirect Map
```typescript
const REDIRECTS = {
  '/crm': '/lobby',
  '/crm/dashboard': '/lobby',
  '/crm/pipeline': '/agents/pipeline',
  '/crm/contacts': '/lobby/directory',
  '/crm/clients': '/agents/clients',
  '/crm/segments': '/marketing/segments',
  '/crm/import': '/lobby/import',
  '/crm/export': '/lobby/export',
  '/crm/history': '/lobby/activity',
};
```

---

## Part 6: Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create unified lounge theme system (`loungeThemes.ts`)
- [ ] Create unified animation system (`loungeAnimations.ts`)
- [ ] Create `UnifiedLoungeLayout.tsx` component
- [ ] Create shared lounge components (StatCard, ActivityFeed, etc.)

### Phase 2: Lobby Build (Week 1-2)
- [ ] Create `/lobby` route structure
- [ ] Build `LobbyLanding.tsx` (welcome + navigation)
- [ ] Build `LobbyDirectory.tsx` (simplified contact list)
- [ ] Build `LobbyActivity.tsx` (company-wide feed)
- [ ] Move Import/Export to Lobby

### Phase 3: Agent Lounge Migration (Week 2)
- [ ] Migrate Agent Lounge to use UnifiedLoungeLayout
- [ ] Keep gamification as optional prop
- [ ] Move Pipeline Board to Agent Lounge
- [ ] Move Client Management to Agent Lounge

### Phase 4: Other Lounge Migrations (Week 2-3)
- [ ] Marketing Lounge → unified layout + move Segments
- [ ] Manager Lounge → unified layout
- [ ] Executive Lounge → unified layout
- [ ] AI Lounge → unified layout (minimal changes)

### Phase 5: New Lounges (Week 3-4)
- [ ] Finance Lounge (commissions, revenue, forecasts)
- [ ] Support Lounge (tickets, client service)
- [ ] Admin Lounge (settings, users, system)
- [ ] Investor Lounge (KPIs, reports)

### Phase 6: Polish (Week 4)
- [ ] Consistent loading states
- [ ] Error boundaries
- [ ] Mobile responsive testing
- [ ] Animation refinement
- [ ] Accessibility audit

---

## Part 7: Visual Design Consistency Checklist

### Every Lounge Must Have:

**Header**
- [ ] Lounge name with icon
- [ ] Breadcrumb navigation
- [ ] Search button (⌘K)
- [ ] Notifications
- [ ] User avatar + role
- [ ] Lounge switcher

**Sidebar**
- [ ] Lounge logo/icon
- [ ] Collapsible (⌘B)
- [ ] Section groupings
- [ ] Active state with lounge color
- [ ] Badge support for counts
- [ ] Footer with quick actions

**Content Area**
- [ ] Page header with title + actions
- [ ] Stat cards row (if dashboard)
- [ ] Consistent card styles
- [ ] Empty states
- [ ] Loading skeletons

**Mobile**
- [ ] Bottom navigation bar
- [ ] Slide-out sidebar
- [ ] Touch-friendly tap targets
- [ ] Responsive tables/grids

**Animations**
- [ ] Page enter/exit
- [ ] Card hover states
- [ ] Sidebar item hover
- [ ] Stat counter animations
- [ ] Stagger children on load

---

## Summary

### The Lobby Concept

CRM becomes the **Lobby** - a welcoming, general-purpose space that:
1. Greets users
2. Shows company-wide activity
3. Provides navigation to specialized lounges
4. Offers basic tools (search, directory, calendar)
5. Contains NO sensitive or role-specific data

### Unified Lounge System

Every lounge (Agent, Finance, Marketing, etc.) uses:
1. **Same base layout** (UnifiedLoungeLayout)
2. **Same component library** (themed by lounge color)
3. **Same animation patterns** (consistent feel)
4. **Same responsive behavior** (mobile-first)
5. **Same navigation patterns** (sidebar + mobile nav)

### Key Changes

1. **Rename** `/crm` → `/lobby`
2. **Move** pipeline/client pages to Agent Lounge
3. **Move** segments to Marketing Lounge
4. **Migrate** Agent Lounge to unified system
5. **Build** missing lounges (Finance, Support, Admin, Investor)
6. **Unify** all themes, animations, components

This creates a coherent experience where users land in the Lobby, understand what's happening, and navigate to their specialized workspace.
