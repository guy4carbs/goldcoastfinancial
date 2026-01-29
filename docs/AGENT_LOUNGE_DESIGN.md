# Heritage Agent Lounge - Complete Design Specification

## Executive Summary

The Heritage Agent Lounge is a comprehensive dashboard for insurance agents that combines CRM functionality, gamification, training, performance tracking, and communication tools into a single, modern interface. This design takes inspiration from best-in-class dashboards (Linear, Notion, Salesforce, HubSpot, Duolingo) while being tailored specifically for insurance sales professionals.

---

## 1. DESIGN PHILOSOPHY

### Core Principles
1. **Action-Oriented**: Every element should drive agents toward revenue-generating activities
2. **Data-Driven**: Real-time metrics that inform decisions and motivate performance
3. **Gamified but Professional**: Engagement mechanics that feel rewarding, not childish
4. **Minimal Friction**: One-click access to common actions (log call, add lead, create quote)
5. **Mobile-First**: Full functionality on mobile devices for agents in the field

### Visual Language
- **Color Palette**: Heritage brand colors (primary #292966, accent #7C7CFF) with semantic colors for status
- **Typography**: Clean, readable fonts (Inter for UI, Playfair Display for headings)
- **Spacing**: Generous whitespace, 8px grid system
- **Cards**: Subtle shadows, rounded corners (12-16px), clear hierarchy
- **Animations**: Purposeful micro-interactions (Framer Motion), not gratuitous

---

## 2. NAVIGATION STRUCTURE

### Primary Navigation (Left Sidebar - Collapsible)
```
┌─────────────────────────────────┐
│  [Heritage Logo]                │
│                                 │
│  ── MAIN ──────────────────     │
│  🏠 Dashboard                   │
│  👥 Leads (CRM)                 │
│  📊 Pipeline                    │
│  💰 Earnings                    │
│                                 │
│  ── TOOLS ─────────────────     │
│  📝 Quotes                      │
│  📋 Scripts                     │
│  📚 Resources                   │
│                                 │
│  ── GROWTH ────────────────     │
│  🎓 Training                    │
│  🏆 Leaderboard                 │
│  ⭐ Achievements                │
│                                 │
│  ── TEAM ──────────────────     │
│  💬 Chat                        │
│  📢 Announcements               │
│                                 │
│  ─────────────────────────      │
│  ⚙️ Settings                    │
│  ❓ Help & Support              │
└─────────────────────────────────┘
```

### Top Bar (Persistent)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [☰]  Heritage Agent Lounge          [🔍 Search... ⌘K]     [🔔 4] [👤 Alex ▼]│
└──────────────────────────────────────────────────────────────────────────────┘
```

Components:
- **Hamburger**: Collapse/expand sidebar (mobile: slide-out drawer)
- **Search (Command Palette)**: Global search + quick actions (Cmd+K)
- **Notifications**: Badge count, dropdown with categories
- **User Menu**: Profile, settings, theme toggle, logout

---

## 3. DASHBOARD (HOME) - Main Hub

### Layout (Desktop - 3 Column Grid)
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                        │
│  ┌─ WELCOME BANNER ─────────────────────────────────────────────────────────────────┐  │
│  │  Good morning, Alex! 🔥 5-day streak                                [Quick Actions]│  │
│  │  You're #3 on the leaderboard this week. Keep pushing!              [+ Log Call ]  │  │
│  │                                                                     [+ Add Lead ]  │  │
│  │  ████████████░░░░ 47/100 calls today                                [+ New Quote]  │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                        │
│  ┌─ LEFT COLUMN (40%) ───────────────────┐  ┌─ RIGHT COLUMN (60%) ──────────────────┐  │
│  │                                       │  │                                       │  │
│  │  ┌─ TODAY'S FOCUS ──────────────────┐ │  │  ┌─ PERFORMANCE OVERVIEW ───────────┐ │  │
│  │  │                                  │ │  │  │                                  │ │  │
│  │  │  Daily Challenges                │ │  │  │  [Calls] [Closes] [Conv%] [AP]   │ │  │
│  │  │  ┌────────────────────────────┐  │ │  │  │                                  │ │  │
│  │  │  │ 📞 Call Crusher  7/10      │  │ │  │  │  ┌─ Weekly Activity Chart ─────┐ │ │  │
│  │  │  │ ████████░░░ +50 XP         │  │ │  │  │  │         📊                  │ │ │  │
│  │  │  └────────────────────────────┘  │ │  │  │  │  M  T  W  T  F  S  S        │ │ │  │
│  │  │  ┌────────────────────────────┐  │ │  │  │  └────────────────────────────┘ │ │  │
│  │  │  │ 👥 Lead Machine  1/2       │  │ │  │  │                                  │ │  │
│  │  │  │ █████░░░░░░ +30 XP         │  │ │  │  │  Rank #3 of 12  ↑2 from last wk │ │  │
│  │  │  └────────────────────────────┘  │ │  │  └──────────────────────────────────┘ │  │
│  │  └──────────────────────────────────┘ │  │                                       │  │
│  │                                       │  │  ┌─ PIPELINE SNAPSHOT ──────────────┐ │  │
│  │  ┌─ PRIORITY TASKS ─────────────────┐ │  │  │                                  │ │  │
│  │  │                                  │ │  │  │  New    Contact  Qualified  Prop │ │  │
│  │  │  ☐ Follow up with Sarah W.       │ │  │  │   3       2         4        2   │ │  │
│  │  │    📅 Today · 🔴 High            │ │  │  │                                  │ │  │
│  │  │                                  │ │  │  │  Hot Leads:                      │ │  │
│  │  │  ☐ Complete Term Life Module 4   │ │  │  │  • Sarah Williams - Proposal     │ │  │
│  │  │    📅 Tomorrow · 🟡 Medium       │ │  │  │    $500K Whole Life              │ │  │
│  │  │                                  │ │  │  │  • Michael Chen - Qualified      │ │  │
│  │  │  ☑ Update CRM notes              │ │  │  │    $250K Term 20                 │ │  │
│  │  │    ✓ Completed                   │ │  │  └──────────────────────────────────┘ │  │
│  │  │                                  │ │  │                                       │  │
│  │  │  [+ Add Task]       [View All →] │ │  │  ┌─ RECENT ACTIVITY ────────────────┐ │  │
│  │  └──────────────────────────────────┘ │  │  │                                  │ │  │
│  │                                       │  │  │  🏆 Sarah M. closed $750K WL     │ │  │
│  │  ┌─ UPCOMING ───────────────────────┐ │  │  │  ⭐ Marcus unlocked Call Champ   │ │  │
│  │  │                                  │ │  │  │  🔥 Emily hit 10-day streak      │ │  │
│  │  │  📅 Jan 22 · IUL Training        │ │  │  │  👥 You moved Sarah to Proposal  │ │  │
│  │  │     2:00 PM CST                  │ │  │  │                                  │ │  │
│  │  │                                  │ │  │  │  [View All Activity →]           │ │  │
│  │  │  📅 Jan 25 · Monthly Sales Mtg   │ │  │  └──────────────────────────────────┘ │  │
│  │  │     10:00 AM CST                 │ │  │                                       │  │
│  │  └──────────────────────────────────┘ │  └───────────────────────────────────────┘  │
│  │                                       │                                              │
│  │  ┌─ EARNINGS SUMMARY ───────────────┐ │                                              │
│  │  │                                  │ │                                              │
│  │  │  💰 $2,700 pending               │ │                                              │
│  │  │  ✅ $850 paid this month         │ │                                              │
│  │  │                                  │ │                                              │
│  │  │  [View Statements →]             │ │                                              │
│  │  └──────────────────────────────────┘ │                                              │
│  └───────────────────────────────────────┘                                              │
│                                                                                        │
│  ┌─ ANNOUNCEMENTS BANNER ───────────────────────────────────────────────────────────┐  │
│  │  📢 New IUL Product Launch - Training webinar Jan 22            [Learn More →]   │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Dashboard Components Detail

#### A. Welcome Banner
- **Personalized greeting** based on time of day
- **Streak indicator** with flame animation
- **Progress bar** for daily call goal
- **Motivational message** based on leaderboard position
- **Quick action buttons** (always visible):
  - Log Call (opens modal)
  - Add Lead (opens modal)
  - New Quote (opens quote builder)

#### B. Today's Focus Section
- **Daily Challenges** (3 max, gamified goals)
  - Visual progress bars
  - XP rewards displayed
  - Completion animations
- **Priority Tasks** (5 max, sorted by due date + priority)
  - Checkbox completion
  - Category icons
  - Quick add inline

#### C. Performance Overview
- **Key Metrics Cards** (4 across):
  - Calls Today: 47/100 (with mini progress ring)
  - Closes This Week: 2 (with trend arrow)
  - Conversion Rate: 12% (with sparkline)
  - Weekly AP: $12,600 (with comparison to last week)
- **Weekly Activity Chart** (mini bar chart)
- **Leaderboard Position** with trend

#### D. Pipeline Snapshot
- **Kanban preview** showing count per stage
- **Hot Leads list** (top 3 by urgency/value)
- Click to expand to full CRM view

#### E. Recent Activity Feed
- **Team activity stream** (real-time via WebSocket)
- Activity types: deals, achievements, streaks, training
- Subtle animations for new items

#### F. Earnings Summary
- Pending commissions
- Paid this month
- Link to full earnings page

---

## 4. LEADS / CRM PAGE

### Layout Options
Toggle between: **Kanban View** | **Table View** | **Map View**

### Kanban View (Default)
```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  Leads                                    [+ Add Lead]  [🔍 Filter]  [⬇ Sort]       │
│                                                                                     │
│  ┌─ NEW (3) ────┐  ┌─ CONTACTED (2) ┐  ┌─ QUALIFIED (4) ┐  ┌─ PROPOSAL (2) ┐       │
│  │              │  │                │  │                 │  │               │       │
│  │ ┌──────────┐ │  │ ┌────────────┐ │  │ ┌─────────────┐ │  │ ┌───────────┐ │       │
│  │ │James R.  │ │  │ │Emily T.   │ │  │ │Michael C.  │ │  │ │Sarah W.  │ │       │
│  │ │IN · Web  │ │  │ │IL · FB Ad │ │  │ │IL · Website│ │  │ │IL · Ref  │ │       │
│  │ │Term Life │ │  │ │Term Life  │ │  │ │Term 20     │ │  │ │Whole Life│ │       │
│  │ │          │ │  │ │           │ │  │ │$250K       │ │  │ │$500K     │ │       │
│  │ │ 📞 ✉️ 📅  │ │  │ │ 📞 ✉️ 📅   │ │  │ │ 📞 ✉️ 📅    │ │  │ │ 📞 ✉️ 📅   │ │       │
│  │ └──────────┘ │  │ └────────────┘ │  │ └─────────────┘ │  │ └───────────┘ │       │
│  │              │  │                │  │                 │  │               │       │
│  │ ┌──────────┐ │  │ ┌────────────┐ │  │ ┌─────────────┐ │  │ ┌───────────┐ │       │
│  │ │...       │ │  │ │...        │ │  │ │David P.    │ │  │ │...       │ │       │
│  │ └──────────┘ │  │ └────────────┘ │  │ │IL · Referral│ │  │ └───────────┘ │       │
│  │              │  │                │  │ │IUL         │ │  │               │       │
│  │              │  │                │  │ └─────────────┘ │  │               │       │
│  │              │  │                │  │                 │  │               │       │
│  │  [+ Add]     │  │                │  │                 │  │               │       │
│  └──────────────┘  └────────────────┘  └─────────────────┘  └───────────────┘       │
│                                                                                     │
│  ┌─ CLOSED (Won) ───┐  ┌─ LOST ──────────┐                                          │
│  │  Lisa M. ✓       │  │  (collapsed)    │                                          │
│  └──────────────────┘  └─────────────────┘                                          │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Lead Card Features
- **Drag & drop** between stages
- **Quick actions** on hover (call, email, schedule)
- **Status indicators** (hot lead, overdue follow-up)
- **Click to expand** → Lead Detail Drawer

### Lead Detail Drawer (Slide-in from right)
```
┌─────────────────────────────────────────┐
│  [←]  Michael Chen                   [⋮]│
│                                         │
│  ┌─ CONTACT INFO ─────────────────────┐ │
│  │  📞 (630) 555-1234    [Call]       │ │
│  │  ✉️ mchen@email.com   [Email]      │ │
│  │  📍 Illinois                        │ │
│  │  🏷️ Source: Website                │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  ┌─ OPPORTUNITY ──────────────────────┐ │
│  │  Product: Term Life - 20 Year      │ │
│  │  Coverage: $250,000                │ │
│  │  Est. Premium: $45/mo              │ │
│  │  Status: Qualified                 │ │
│  │  [Create Quote →]                  │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  ┌─ ACTIVITY TIMELINE ────────────────┐ │
│  │                                    │ │
│  │  ● Dec 28 · Call · Interested      │ │
│  │    "Has 2 kids, wants 20-yr term"  │ │
│  │                                    │ │
│  │  ● Dec 20 · Lead Created           │ │
│  │    Via Website Form                │ │
│  │                                    │ │
│  │  [+ Log Activity]                  │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  ┌─ TASKS ────────────────────────────┐ │
│  │  ☐ Follow up call (Today)          │ │
│  │  ☐ Send comparison quote           │ │
│  │  [+ Add Task]                      │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  ┌─ NOTES ────────────────────────────┐ │
│  │  Interested in 20-year term.       │ │
│  │  Has 2 kids (ages 5 and 8).        │ │
│  │  Wife is stay-at-home mom.         │ │
│  │  Mortgage balance ~$320K           │ │
│  │  [Edit Notes]                      │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 5. PIPELINE PAGE (Visual Sales Funnel)

### Funnel Visualization
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Pipeline Overview                           This Week ▼   [Export]             │
│                                                                                 │
│  ┌─ FUNNEL CHART ─────────────────────────────────────────────────────────────┐ │
│  │                                                                            │ │
│  │       ████████████████████████████████████████████████  New (15)          │ │
│  │       ████████████████████████████████████  Contacted (12)                │ │
│  │       ████████████████████████  Qualified (8)                             │ │
│  │       ██████████████  Proposal (5)                                        │ │
│  │       ████████  Closed (3)                                                │ │
│  │                                                                            │ │
│  │  Conversion: 20% overall   |   Avg. Deal Size: $1,850   |   Cycle: 12 days │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─ STAGE BREAKDOWN ──────────────────────────────────────────────────────────┐ │
│  │                                                                            │ │
│  │  Stage         Count    Value         Avg Age    Conv Rate    Action       │ │
│  │  ───────────────────────────────────────────────────────────────────────   │ │
│  │  New             15     $22,500        2 days      80%       [View]        │ │
│  │  Contacted       12     $18,000        5 days      67%       [View]        │ │
│  │  Qualified        8     $14,400       10 days      63%       [View]        │ │
│  │  Proposal         5     $12,500       15 days      60%       [View]        │ │
│  │  Closed           3      $5,550       18 days       -        [View]        │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─ AT-RISK DEALS (Stale > 7 days) ───────────────────────────────────────────┐ │
│  │                                                                            │ │
│  │  ⚠️ Emily Thompson · Contacted · 14 days stale · $2,400         [Contact]  │ │
│  │  ⚠️ David Park · Qualified · 10 days stale · $3,600             [Contact]  │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. EARNINGS PAGE

### Layout
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Earnings                                    [Download Statement ▼]             │
│                                                                                 │
│  ┌─ SUMMARY CARDS ────────────────────────────────────────────────────────────┐ │
│  │                                                                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │ │
│  │  │  💰 $2,700   │  │  ✅ $850     │  │  📈 $3,550   │  │  📊 $42,600  │   │ │
│  │  │  Pending     │  │  Paid MTD    │  │  Total MTD   │  │  YTD         │   │ │
│  │  │  +$650 ↑     │  │  3 policies  │  │  vs $2,800   │  │  +18% YoY    │   │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─ EARNINGS CHART (6 Month Trend) ───────────────────────────────────────────┐ │
│  │                                                                            │ │
│  │        📊 [Line chart showing monthly earnings trend]                      │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─ RECENT COMMISSIONS ───────────────────────────────────────────────────────┐ │
│  │                                                                            │ │
│  │  Policy #        Client          Product       Amount     Status    Date   │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │  POL-2025-1567   David Brown     Term 30       $650      🟡 Pending  Jan 1 │ │
│  │  POL-2025-1456   Jennifer Lee    Whole Life    $1,200    🟡 Pending  Dec 28│ │
│  │  POL-2025-1234   Robert Smith    Term 20       $850      ✅ Paid     Dec 15│ │
│  │                                                                            │ │
│  │  [View All Transactions →]                                                 │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─ BY PRODUCT BREAKDOWN ─────────────────────────────────────────────────────┐ │
│  │                                                                            │ │
│  │  Term Life      ████████████████████████  $18,200 (43%)                   │ │
│  │  Whole Life     ████████████████  $12,400 (29%)                           │ │
│  │  IUL            █████████  $7,600 (18%)                                   │ │
│  │  Final Expense  ████  $4,400 (10%)                                        │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. TRAINING PAGE

### Layout
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Training Center                    Progress: 4/10 courses     [Certificates]   │
│                                                                                 │
│  ┌─ CONTINUE LEARNING ────────────────────────────────────────────────────────┐ │
│  │                                                                            │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  📘 Term Life Basics                                                │  │ │
│  │  │  Module 4: Underwriting Basics                                      │  │ │
│  │  │  ████████████████████░░░░░  75% Complete                            │  │ │
│  │  │                                            [Continue →]             │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─ REQUIRED COURSES ─────────────────────────────────────────────────────────┐ │
│  │                                                                            │ │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐               │ │
│  │  │ 📘 Term Life   │  │ 📙 Sales Fund. │  │ 📕 Compliance  │               │ │
│  │  │ Basics         │  │                │  │ & Ethics       │               │ │
│  │  │                │  │                │  │                │               │ │
│  │  │ ████░░  75%    │  │ ░░░░░░  0%     │  │ ░░░░░░  0%     │               │ │
│  │  │ 3/4 modules    │  │ 0/3 modules    │  │ 0/3 modules    │               │ │
│  │  │                │  │                │  │                │               │ │
│  │  │ [Continue]     │  │ [Start]        │  │ [Start]        │               │ │
│  │  └────────────────┘  └────────────────┘  └────────────────┘               │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─ CATEGORY TABS ────────────────────────────────────────────────────────────┐ │
│  │  [All]  [Product]  [Sales]  [Compliance]  [Tools]                         │ │
│  │                                                                            │ │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐               │ │
│  │  │ IUL Advanced   │  │ Final Expense  │  │ Mort. Protect. │               │ │
│  │  │ Strategies     │  │ Mastery        │  │ Training       │               │ │
│  │  │ 100 min · 3 mod│  │ 90 min · 4 mod │  │ 75 min · 3 mod │               │ │
│  │  │ +150 XP        │  │ +120 XP        │  │ +100 XP        │               │ │
│  │  │ [Start]        │  │ [Start]        │  │ [Start]        │               │ │
│  │  └────────────────┘  └────────────────┘  └────────────────┘               │ │
│  │                                                                            │ │
│  │  ┌─ OBJECTION HANDLING SERIES ─────────────────────────────────────────┐  │ │
│  │  │                                                                     │  │ │
│  │  │  "I need to think"  "Can't afford it"  "Talk to spouse"  "Have it" │  │ │
│  │  │  [Watch]            [Watch]            [Watch]           [Watch]   │  │ │
│  │  │                                                                     │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Training Module Viewer (Full-screen Modal)
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  [← Back]   Term Life Basics > Module 4: Underwriting Basics            [✕]    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │                         [VIDEO PLAYER]                                  │   │
│  │                                                                         │   │
│  │                         ▶️ 12:45 / 30:00                                │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─ MODULE PROGRESS ──────────────────────────────────────────────────────────┐ │
│  │                                                                            │ │
│  │  ✅ What is Term Life?       ✅ Policy Riders       ✅ Pricing & Quotes    │ │
│  │  ⏱️ Underwriting Basics (current)                                          │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─ NOTES ────────────────────────────────────────────────────────────────────┐ │
│  │  Take notes while watching...                                              │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│                                                    [Mark Complete & Continue →] │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. LEADERBOARD PAGE

### Layout
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Leaderboard                        [Daily] [Weekly] [Monthly] [Yearly]        │
│                                                                                 │
│  ┌─ TOP 3 PODIUM ─────────────────────────────────────────────────────────────┐ │
│  │                                                                            │ │
│  │              🥇                                                            │ │
│  │           ┌──────┐                                                        │ │
│  │     🥈    │Sarah │    🥉                                                  │ │
│  │   ┌────┐  │ M.   │  ┌────┐                                                │ │
│  │   │Marc│  │$28.5K│  │Alex│                                                │ │
│  │   │ C. │  │      │  │ J. │                                                │ │
│  │   │$22K│  └──────┘  │$12K│                                                │ │
│  │   └────┘            └────┘                                                │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─ FULL RANKINGS ────────────────────────────────────────────────────────────┐ │
│  │                                                                            │ │
│  │  #   Agent           Level   Streak   AP          Deals   Trend           │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │  1   Sarah Mitchell   7      15 🔥    $28,500      8       ━              │ │
│  │  2   Marcus Chen      6      12 🔥    $22,400      6       ↑              │ │
│  │  3   Alex Johnson     4       5 🔥    $12,600      2       ↑   ← You      │ │
│  │  4   Emily Davis      4       3       $ 8,400      2       ↓              │ │
│  │  5   Jordan Taylor    3       7 🔥    $ 6,300      1       ━              │ │
│  │  ...                                                                       │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─ YOUR STATS ───────────────────────────────────────────────────────────────┐ │
│  │                                                                            │ │
│  │  Rank #3 of 12  │  Level 4 (2,450 XP)  │  5-Day Streak  │  +2 ranks ↑     │ │
│  │                                                                            │ │
│  │  Next Level: 550 XP to go  ████████████████████░░░░░░░░                   │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. ACHIEVEMENTS PAGE

### Layout
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Achievements                              Unlocked: 3/8     Total XP: +350     │
│                                                                                 │
│  ┌─ UNLOCKED ─────────────────────────────────────────────────────────────────┐ │
│  │                                                                            │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │ │
│  │  │   🎓             │  │   🤝             │  │   🔥             │         │ │
│  │  │   First Steps    │  │   Closer         │  │   Streak Starter │         │ │
│  │  │                  │  │                  │  │                  │         │ │
│  │  │   Complete your  │  │   Close your     │  │   3-day activity │         │ │
│  │  │   first training │  │   first deal     │  │   streak         │         │ │
│  │  │                  │  │                  │  │                  │         │ │
│  │  │   ✅ +50 XP      │  │   ✅ +200 XP     │  │   ✅ +100 XP     │         │ │
│  │  │   Jun 20, 2024   │  │   Jul 15, 2024   │  │   Jun 25, 2024   │         │ │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘         │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─ IN PROGRESS ──────────────────────────────────────────────────────────────┐ │
│  │                                                                            │ │
│  │  ┌──────────────────┐  ┌──────────────────┐                               │ │
│  │  │   🔥 (greyed)    │  │   📞 (greyed)    │                               │ │
│  │  │   Week Warrior   │  │   Call Champion  │                               │ │
│  │  │                  │  │                  │                               │ │
│  │  │   7-day streak   │  │   100 calls/week │                               │ │
│  │  │   5/7 days ████░ │  │   47/100 ████░░░ │                               │ │
│  │  │                  │  │                  │                               │ │
│  │  │   🔒 +250 XP     │  │   🔒 +300 XP     │                               │ │
│  │  └──────────────────┘  └──────────────────┘                               │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─ LOCKED ───────────────────────────────────────────────────────────────────┐ │
│  │                                                                            │ │
│  │  🏆 Top Producer (10 deals/mo)   🧠 Knowledge Master   👑 Consistency King │ │
│  │  +500 XP                         +400 XP               +1000 XP            │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. SCRIPTS & RESOURCES PAGE

### Layout (Tabbed Interface)
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Resources                                                                      │
│                                                                                 │
│  [Scripts]  [SOPs]  [Product Guides]  [Marketing]  [Carrier Portals]           │
│                                                                                 │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│  ┌─ SCRIPTS TAB ──────────────────────────────────────────────────────────────┐ │
│  │                                                                            │ │
│  │  Filter: [All Products ▼]  [All Channels ▼]    🔍 Search scripts...       │ │
│  │                                                                            │ │
│  │  ┌─ BY PRODUCT ────────────────────────────────────────────────────────┐  │ │
│  │  │                                                                      │  │ │
│  │  │  ┌──────────────────────────────────────────────────────────────┐   │  │ │
│  │  │  │  📝 Term Life Insurance Script                               │   │  │ │
│  │  │  │  Complete phone script for term life sales                   │   │  │ │
│  │  │  │  📞 Phone · All States                         [View Script] │   │  │ │
│  │  │  └──────────────────────────────────────────────────────────────┘   │  │ │
│  │  │                                                                      │  │ │
│  │  │  ┌──────────────────────────────────────────────────────────────┐   │  │ │
│  │  │  │  📝 Mortgage Protection Script                               │   │  │ │
│  │  │  │  For new homeowners and refinances                           │   │  │ │
│  │  │  │  📞 Phone · All States                         [View Script] │   │  │ │
│  │  │  └──────────────────────────────────────────────────────────────┘   │  │ │
│  │  │                                                                      │  │ │
│  │  │  ... (Whole Life, Final Expense, IUL)                               │  │ │
│  │  │                                                                      │  │ │
│  │  └──────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                            │ │
│  │  ┌─ BY LEAD TYPE ──────────────────────────────────────────────────────┐  │ │
│  │  │                                                                      │  │ │
│  │  │  Cold Leads · Warm Leads · In-House Leads                           │  │ │
│  │  │                                                                      │  │ │
│  │  └──────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Script Viewer (Modal)
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Term Life Insurance Script                              [Copy] [Print] [✕]    │
│                                                                                 │
│  ┌─ SCRIPT CONTENT ───────────────────────────────────────────────────────────┐ │
│  │                                                                            │ │
│  │  OPENING:                                                                  │ │
│  │  ────────                                                                  │ │
│  │  "Hi [Name], this is [Your Name] with Heritage Life Solutions.             │ │
│  │  I'm calling about the life insurance information you requested.           │ │
│  │  Is now a good time to chat for a few minutes?"                            │ │
│  │                                                                            │ │
│  │  [If yes, continue. If no, schedule callback.]                             │ │
│  │                                                                            │ │
│  │  BUILD RAPPORT:                                                            │ │
│  │  ────────────                                                              │ │
│  │  "Great! Before we dive in, I'd love to learn a little about you           │ │
│  │  and your family so I can make sure I'm recommending the right coverage."  │ │
│  │                                                                            │ │
│  │  DISCOVERY QUESTIONS:                                                      │ │
│  │  ───────────────────                                                       │ │
│  │  1. "What prompted you to look into life insurance right now?"             │ │
│  │  2. "Tell me about your family - spouse, children?"                        │ │
│  │  3. "Do you own your home? What's the mortgage balance?"                   │ │
│  │  ...                                                                       │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─ QUICK REFERENCE ──────────────────────────────────────────────────────────┐ │
│  │                                                                            │ │
│  │  Common Objections:                                                        │ │
│  │  • "I need to think" → [Link to objection training]                        │ │
│  │  • "Too expensive" → [Link to objection training]                          │ │
│  │  • "Talk to spouse" → [Link to objection training]                         │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. CHAT / TEAM COMMUNICATION

### Layout
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Team Chat                                                      [+ New Chat]   │
│                                                                                 │
│  ┌─ CONVERSATIONS ────┐  ┌─ CHAT AREA ────────────────────────────────────────┐ │
│  │                    │  │                                                    │ │
│  │  🔍 Search...      │  │  General Team Chat                    👥 12 online │ │
│  │                    │  │  ────────────────────────────────────────────────  │ │
│  │  ┌──────────────┐  │  │                                                    │ │
│  │  │ # general    │  │  │  Jack Cook · 10:30 AM                              │ │
│  │  │ 12 online    │  │  │  Great job everyone on hitting our Q4 goals!      │ │
│  │  └──────────────┘  │  │  Let's keep the momentum going into Q1! 🎉        │ │
│  │                    │  │                                                    │ │
│  │  ┌──────────────┐  │  │  Sarah Mitchell · 10:45 AM                         │ │
│  │  │ # sales-tips │  │  │  Just closed a $750K whole life! 🏆               │ │
│  │  │ 8 online     │  │  │  Client was initially hesitant but the           │ │
│  │  └──────────────┘  │  │  comparison approach really worked.               │ │
│  │                    │  │                                                    │ │
│  │  ┌──────────────┐  │  │    👏 5   🎉 3   💪 2                             │ │
│  │  │ # training   │  │  │                                                    │ │
│  │  │ 5 online     │  │  │  Marcus Chen · 11:00 AM                            │ │
│  │  └──────────────┘  │  │  @Sarah congrats! What was the objection?          │ │
│  │                    │  │                                                    │ │
│  │  ── Direct ──      │  │  Sarah Mitchell · 11:02 AM                         │ │
│  │                    │  │  "I need to think about it" - used the takeaway    │ │
│  │  ┌──────────────┐  │  │  close from the training. Works every time! 😊    │ │
│  │  │ Jack Cook    │  │  │                                                    │ │
│  │  │ Online       │  │  │                                                    │ │
│  │  └──────────────┘  │  │  ────────────────────────────────────────────────  │ │
│  │                    │  │                                                    │ │
│  │  ┌──────────────┐  │  │  ┌─────────────────────────────────────────────┐  │ │
│  │  │ Marcus Chen  │  │  │  │ Type a message...                     [📎] [😊]│  │ │
│  │  │ Away         │  │  │  └─────────────────────────────────────────────┘  │ │
│  │  └──────────────┘  │  │                                                    │ │
│  │                    │  │                                                    │ │
│  └────────────────────┘  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 12. COMMAND PALETTE (Cmd+K)

### Functionality
```
┌─────────────────────────────────────────────────────────────────┐
│  🔍 Search or type a command...                                │
│                                                                 │
│  ── Quick Actions ──────────────────────────────────────────   │
│  📞  Log a call                                     ⌘+L        │
│  👤  Add new lead                                   ⌘+N        │
│  📝  Create quote                                   ⌘+Q        │
│  ✓   Add task                                       ⌘+T        │
│                                                                 │
│  ── Navigation ─────────────────────────────────────────────   │
│  🏠  Go to Dashboard                                ⌘+1        │
│  👥  Go to Leads                                    ⌘+2        │
│  📊  Go to Pipeline                                 ⌘+3        │
│  🎓  Go to Training                                 ⌘+4        │
│                                                                 │
│  ── Search ─────────────────────────────────────────────────   │
│  🔍  Search leads...                                           │
│  🔍  Search scripts...                                         │
│  🔍  Search training...                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 13. NOTIFICATION SYSTEM

### Notification Types
1. **Achievement** - Badge unlocked, XP gained
2. **Earnings** - Commission paid, pending update
3. **Lead** - New lead assigned, lead activity
4. **Task** - Reminder, overdue
5. **Training** - Course due, new content
6. **Team** - Announcements, messages
7. **System** - Updates, maintenance

### Notification Dropdown
```
┌─────────────────────────────────────────┐
│  Notifications                [Mark All]│
│                                         │
│  ── Today ─────────────────────────     │
│  🏆 Achievement Unlocked!               │
│     You earned "Streak Starter" badge   │
│     2 hours ago                         │
│                                         │
│  💰 Commission Paid                     │
│     $850 deposited for POL-2025-1234    │
│     4 hours ago                         │
│                                         │
│  📞 Follow-up Reminder                  │
│     Call Michael Chen - interested      │
│     5 hours ago                         │
│                                         │
│  ── Yesterday ─────────────────────     │
│  🎓 Training Reminder                   │
│     Complete Term Life Basics by Jan 5  │
│     1 day ago                           │
│                                         │
│  [View All Notifications →]             │
└─────────────────────────────────────────┘
```

---

## 14. MODALS & DRAWERS

### Log Call Modal
```
┌─────────────────────────────────────────────────────────────┐
│  Log Call                                              [✕]  │
│                                                             │
│  Lead (optional)                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🔍 Search leads...                           [▼]   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Duration                                                   │
│  ┌───────┐  ┌───────┐                                      │
│  │  5    │  │ min   │                                      │
│  └───────┘  └───────┘                                      │
│                                                             │
│  Outcome                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Interested] [Callback] [No Answer] [Not Int.]     │   │
│  │  [Voicemail] [Appointment Set]                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Notes                                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Schedule Follow-up?                                        │
│  ☐ Yes, remind me on [date picker]                         │
│                                                             │
│                              [Cancel]  [Log Call +10 XP]   │
└─────────────────────────────────────────────────────────────┘
```

### Add Lead Modal
```
┌─────────────────────────────────────────────────────────────┐
│  Add New Lead                                          [✕]  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ First Name *    │  │ Last Name *     │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ Phone *         │  │ Email           │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ State *      [▼]│  │ Source       [▼]│                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌───────────────────────────────────────┐                 │
│  │ Product Interest                   [▼]│                 │
│  │ (Term, Whole, IUL, Final Expense)     │                 │
│  └───────────────────────────────────────┘                 │
│                                                             │
│  Notes (optional)                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                            [Cancel]  [Add Lead +15 XP]     │
└─────────────────────────────────────────────────────────────┘
```

---

## 15. GAMIFICATION DETAILS

### XP System
| Action | XP Reward |
|--------|-----------|
| Log a call | 5-20 XP (based on duration) |
| Add a lead | 15 XP |
| Create a quote | 25 XP |
| Move lead to next stage | 20 XP |
| Close a deal | 100-500 XP (based on AP) |
| Complete training module | 25-50 XP |
| Complete daily challenge | 30-100 XP |
| Maintain streak (daily) | 25 XP |
| Unlock achievement | Varies (50-1000 XP) |

### Level Progression
| Level | XP Required | Title |
|-------|-------------|-------|
| 1 | 0 | Rookie |
| 2 | 500 | Apprentice |
| 3 | 1,500 | Associate |
| 4 | 3,000 | Professional |
| 5 | 5,000 | Senior |
| 6 | 8,000 | Expert |
| 7 | 12,000 | Master |
| 8 | 18,000 | Elite |
| 9 | 25,000 | Legend |
| 10 | 35,000 | Hall of Fame |

### Streak System
- Streak maintained by: Logging at least 1 call OR completing 1 task per day
- Streak bonuses:
  - 3-day streak: +10% XP bonus
  - 7-day streak: +25% XP bonus
  - 14-day streak: +50% XP bonus
  - 30-day streak: +100% XP bonus

### Daily Challenges (3 per day, rotating)
- **Call Crusher**: Make X outbound calls
- **Lead Machine**: Add X new leads
- **Quote Master**: Create X quotes
- **Closer**: Move X leads to next stage
- **Learner**: Complete X training modules
- **Streak Keeper**: Maintain your streak
- **Early Bird**: Log activity before 9 AM
- **Power Hour**: Log 10+ calls in one hour

### Achievements (Badges)
**Sales Achievements**
- First Sale (1 deal) - 200 XP
- Deal Maker (10 deals) - 500 XP
- Top Producer (50 deals) - 1000 XP
- Million Dollar Club ($1M AP) - 2000 XP

**Activity Achievements**
- Call Champion (100 calls/week) - 300 XP
- Dialing Machine (1000 total calls) - 500 XP
- Pipeline Builder (50 leads added) - 400 XP

**Streak Achievements**
- Streak Starter (3 days) - 100 XP
- Week Warrior (7 days) - 250 XP
- Fortnight Fighter (14 days) - 400 XP
- Consistency King (30 days) - 1000 XP

**Training Achievements**
- First Steps (1 module) - 50 XP
- Knowledge Seeker (5 courses) - 300 XP
- Knowledge Master (all courses) - 500 XP

---

## 16. MOBILE RESPONSIVENESS

### Breakpoints
- **Mobile**: < 640px (single column, bottom nav)
- **Tablet**: 640px - 1024px (2 column, collapsible sidebar)
- **Desktop**: > 1024px (full layout)

### Mobile Navigation
```
┌─────────────────────────────────────┐
│  Heritage                      [≡]  │
├─────────────────────────────────────┤
│                                     │
│           [Content Area]            │
│                                     │
├─────────────────────────────────────┤
│  [🏠]   [👥]   [➕]   [🎓]   [👤]  │
│  Home   Leads  Action Train  Profile│
└─────────────────────────────────────┘
```

### Mobile-Specific Features
- Swipe gestures for lead cards (stage change)
- Pull-to-refresh on lists
- Floating action button (+) for quick actions
- Collapsible sections
- Bottom sheet modals instead of centered modals

---

## 17. ANIMATIONS & MICRO-INTERACTIONS

### Key Animations (Framer Motion)
1. **Page Transitions**: Fade + slight slide (300ms)
2. **Card Hover**: Scale 1.02, shadow lift
3. **Button Press**: Scale 0.98
4. **Toast Notifications**: Slide in from top-right
5. **XP Gain Toast**: Pop + count-up animation
6. **Level Up**: Full-screen celebration overlay
7. **Achievement Unlock**: Badge shine + confetti
8. **Leaderboard Movement**: Slide + highlight
9. **Progress Bars**: Smooth fill animation
10. **Skeleton Loaders**: Pulse animation while loading

### Sound Effects (Optional, toggleable)
- XP gain: Soft "ding"
- Achievement unlock: Triumphant chime
- Level up: Fanfare
- New message: Subtle notification

---

## 18. DATA PERSISTENCE & STATE

### Client State (Zustand)
- Current user session
- UI preferences (theme, sidebar state)
- Form drafts
- Optimistic updates

### Server State (React Query)
- Leads/CRM data
- Performance metrics
- Training progress
- Earnings data
- Leaderboard
- Chat messages

### Real-time (WebSocket)
- Activity feed
- Chat messages
- Leaderboard updates
- Notification pushes

---

## 19. IMPLEMENTATION PHASES

### Phase 1: Core Dashboard
- [ ] Navigation structure (sidebar + topbar)
- [ ] Dashboard home page with widgets
- [ ] Quick actions (log call, add lead)
- [ ] Command palette (Cmd+K)
- [ ] Notification system

### Phase 2: CRM & Pipeline
- [ ] Lead management (Kanban + Table views)
- [ ] Lead detail drawer
- [ ] Pipeline visualization
- [ ] Activity logging

### Phase 3: Gamification
- [ ] XP system
- [ ] Level progression
- [ ] Daily challenges
- [ ] Achievements
- [ ] Leaderboard

### Phase 4: Training & Resources
- [ ] Training course viewer
- [ ] Script library
- [ ] SOP viewer
- [ ] Resource search

### Phase 5: Communication
- [ ] Team chat (WebSocket)
- [ ] Announcements
- [ ] Direct messaging

### Phase 6: Earnings & Analytics
- [ ] Earnings dashboard
- [ ] Commission tracking
- [ ] Performance analytics
- [ ] Export/reporting

### Phase 7: Polish
- [ ] Mobile optimization
- [ ] Animations & micro-interactions
- [ ] Performance optimization
- [ ] Accessibility audit

---

## 20. TECHNICAL STACK

### Frontend
- **Framework**: React 19 + TypeScript
- **Routing**: Wouter
- **State**: Zustand (client) + React Query (server)
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle
- **Auth**: Firebase Auth + Sessions
- **Real-time**: WebSockets (ws)

### Infrastructure
- **Hosting**: Railway
- **Domain**: heritagels.org (Cloudflare DNS)
- **Storage**: Firebase Storage (images)

---

## APPENDIX: DESIGN TOKENS

### Colors
```css
/* Heritage Brand */
--heritage-primary: #292966;
--heritage-accent: #7C7CFF;
--heritage-light: #B8B8FF;

/* Semantic */
--success: #22C55E;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;

/* Neutrals */
--background: #FFFAF3;
--surface: #FFFFFF;
--surface-alt: #F5F0E8;
--text-primary: #1A1A1A;
--text-secondary: #6B7280;
--border: #E5E7EB;
```

### Typography Scale
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Spacing
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### Border Radius
```css
--radius-sm: 0.25rem;  /* 4px */
--radius-md: 0.5rem;   /* 8px */
--radius-lg: 0.75rem;  /* 12px */
--radius-xl: 1rem;     /* 16px */
--radius-2xl: 1.5rem;  /* 24px */
--radius-full: 9999px;
```

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
```

---

*This design document serves as the comprehensive specification for the Heritage Agent Lounge. Implementation should follow the phases outlined above, with regular design reviews to ensure consistency with this specification.*
