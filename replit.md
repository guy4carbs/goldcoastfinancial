# Gold Coast Financial - Life Insurance Agency Website

## Overview

This is a professional website for Gold Coast Financial, an independent life insurance agency based in Naperville, Illinois. The site provides information about life insurance products (Term, Whole Life, IUL, Final Expense), allows visitors to request quotes, contact the agency, and access educational resources. The application follows a modern full-stack architecture with a React frontend and Express backend, using PostgreSQL for data persistence.

## Recent Changes (January 2026)

### Executive Portal Expansion (Latest)

#### Strategic Partnership & Network System (New)
- **Partnerships Tab** (`/exec` → Partnerships): Complete partner relationship management with:
  - Overview tab with carrier/vendor/strategic partner health scores and renewal tracking
  - Carriers tab with full portfolio table (5 carriers: Mutual of Omaha, Transamerica, Foresters, Americo, Corebridge)
  - Health scores, tier levels (Platinum/Gold/Silver), ROI tracking, dependency scoring
  - Vendors tab with 5 vendors (LeadByte, RingCentral, Salesforce, Zapier, DocuSign)
  - Performance metrics: quality, volume, cost efficiency scores
  - Strategic partners tab with 3 partners and strategic value assessment
  - Renewals tab with countdown timers, action recommendations, and timeline visualization
  - Dependency analysis with risk concentration and mitigation strategies
  - Partner detail modal with contract periods, financial performance, and obligations

#### Comprehensive Business Intelligence Enhancements
- **Capital Allocation Controls**: 8 budget categories with detailed tracking:
  - Marketing & Lead Gen, Recruiting & Hiring, Technology & Tools, Training & Development
  - Bonuses & Incentives, Operations & Admin, Cash Reserves, Contingency Fund
  - Visual progress bars showing spent/committed/available breakdown
  - Allocation history with approver tracking and notes
  
- **Strategic Directives System**: 5 active strategic initiatives with:
  - Priority levels (critical/high/medium), status tracking (active/planning)
  - Progress percentage with visual indicators
  - KPI badges for each initiative
  - Owner assignment and target dates
  - Initiatives: FE Market Expansion, Override Reduction, IUL Launch, Cash Runway, Digital Transformation

- **Agent Workforce Breakdown**: Detailed agent analytics:
  - By Team table (4 teams): total, active, inactive, onboarding, top performers, at-risk, avg AP
  - 6-month hiring/churn trend chart with composite visualization
  - By Status breakdown with criteria definitions
  - By Tenure distribution (0-3mo, 3-6mo, 6-12mo, 1-2yr, 2+ yr) with avg AP

#### Existing Features
- **Dedicated Tasks Page** (`/exec/tasks`): Full task management with 12 detailed demo tasks featuring:
  - List and Kanban view modes with drag-and-drop capability
  - Filtering by status (pending, in_progress, review, blocked, completed), priority (urgent/high/medium/low), category, and assignee
  - 8 task statistic cards (total, my tasks, in progress, completed, overdue, due today, blocked, urgent)
  - Subtask expansion with progress tracking
  - Star/favorite functionality and time tracking (estimated vs actual hours)
  - Task categories: Finance, Leadership, Contracts, Marketing, HR, Compliance, Operations, Strategy
  
- **Dedicated Calendar Page** (`/exec/calendar`): Full scheduling system with 15 detailed demo events featuring:
  - Month, Week, and Agenda view modes
  - Event type filtering (meeting, call, presentation, training, event, deadline, review, demo)
  - Today's schedule panel and selected date events panel
  - High priority upcoming events widget
  - Event detail modal with attendees, location, time, and notes
  - Color-coded event types with priority indicators
  
- **Shared ExecCommandLayout Component**: Unified layout component for all executive portal pages ensuring consistent design with:
  - Same sidebar navigation with active state highlighting (now includes Partnerships tab)
  - Same header with title and refresh button
  - Same theme toggle and logout functionality in user section
  - Same dark/light mode support across all pages
  - Centralized auth check and theme persistence

### Comprehensive Agent Portal Expansion
- **Getting Started Hub**: Complete onboarding guide with step-by-step licensing instructions (standard + Virginia express method), contracting steps, Discord community link, and practice test resources (ExamFX, Kaplan, etc.)
- **Video Library**: Categorized training videos including live calling demonstrations, product training (Final Expense, Mortgage Protection, IUL, Term), and objection handling techniques with success rates
- **Carriers Section**: Full carrier comparison with product matrices, underwriting strength ratings, average approval times, and commission payout schedules
- **Resources Hub**: Lead buying guide (5 vendors), text/voicemail/email templates, social media prospecting playbook, and comprehensive referral system training
- **Guidelines & Expectations**: Leadership levels with override percentages (Agent → Executive), daily expectations (3 deals/day, dress code, phone time), and performance standards
- **Real-Time Chat System**: Full WebSocket-powered chat with main team channel, direct messaging, group chats, user search, and message history (database-backed)
- **Calendar Section**: Month view calendar with today's schedule widget and upcoming week overview

### Agent Portal UI/UX Enhancements
- **Command Palette (⌘K)**: Global search and navigation with keyboard shortcuts for quick access to all 15 portal sections
- **XP & Gamification System**: Real-time XP toast notifications, level-up celebration modal with confetti animations, daily challenges widget
- **Notification System**: Dropdown notifications in header with read/unread states, categorized by type (success, warning, info)
- **Lead Management**: Lead detail drawer with activity timeline, add lead modal, clickable lead cards with status indicators, drag-and-drop CRM kanban board
- **Task Management**: Add task modal with priority levels, task completion with XP rewards, streak tracking, task filtering pills (All/High Priority/Due Today/Completed)
- **Training Module Viewer**: Interactive course player with video/quiz support, progress tracking, completion certificates
- **Leaderboard Modal**: Full rankings view accessible from dashboard and command palette
- **Activity Feed**: Real-time team activity stream showing closes, training completions, and achievements
- **Time-based Greetings**: Dynamic greeting based on time of day with task summary
- **Announcement Priority Badges**: Visual indicators for recognition vs warning vs info announcements
- **Dashboard Calendar Widget**: Upcoming events view showing meetings, calls, and training sessions
- **Performance Analytics Date Range Picker**: Filter analytics by 7d/30d/90d/YTD
- **Enhanced SOPs Section**: Search functionality with copy-to-clipboard buttons and empty state
- **Enhanced Scripts Section**: Search functionality, objection handling cards with copy buttons, empty state

### Premium Features Added
- **Careers Page**: Full recruitment page with hero section, "Why Join Us" benefits (6 cards), leadership team profiles, open positions (3 accordions), application process timeline, employee testimonials, and multi-field application form. Applications sent to applications@goldcoastfnl.com
- **Coverage Calculator Wizard**: 5-step interactive calculator (Income → Debts → Family → Profile → Results) with personalized coverage recommendations and estimated monthly premiums
- **Carrier Partners Section**: Displays 8 top-rated insurance carriers (A++ and A+ AM Best ratings) - Northwestern Mutual, New York Life, MassMutual, Guardian, Pacific Life, Mutual of Omaha, Prudential, John Hancock
- **Appointment Scheduler**: Full scheduling system with meeting type selection (video/phone/in-person), date/time picker, and confirmation flow
- **Downloadable Guides**: 4 PDF resources with lead capture forms - Life Insurance 101, Coverage Calculator Worksheet, Term vs Permanent Comparison, New Parent Checklist
- **Before/After Scenarios**: 3 real-life examples showing how life insurance protects families (Young Family, Business Owner, Empty Nesters)

### SEO Improvements
- Comprehensive meta tags (title, description, keywords, canonical URL)
- Structured data (JSON-LD) for LocalBusiness and InsuranceAgency schemas
- OpenGraph and Twitter Card meta tags for social sharing
- Robot directives for search engine indexing

### Performance Optimizations
- Lazy loading for all images using `loading="lazy"` attribute
- Framer Motion animations with `viewport={{ once: true }}` for efficiency

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **Styling**: Tailwind CSS v4 with custom theme (dark red, gold, black color scheme)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Typography**: Playfair Display (serif headings) and Montserrat (sans-serif body)
- **State Management**: TanStack React Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **Animations**: Framer Motion for page transitions and effects
- **Build Tool**: Vite

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful JSON APIs under `/api/*` prefix
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod with drizzle-zod integration
- **Session Storage**: connect-pg-simple for PostgreSQL-backed sessions

### Data Storage
- **Database**: PostgreSQL (required via DATABASE_URL environment variable)
- **Schema Location**: `shared/schema.ts` - defines users, quote_requests, and contact_messages tables
- **Migrations**: Drizzle Kit with `db:push` command for schema synchronization

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/  # UI components (layout, shadcn/ui)
│   │   ├── pages/       # Route pages (Home, About, Products, etc.)
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and query client
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database access layer
│   └── db.ts         # Database connection
├── shared/           # Shared code between client/server
│   └── schema.ts     # Drizzle schema and Zod validators
└── migrations/       # Database migrations (generated by Drizzle Kit)
```

### Key Design Patterns
- **Shared Schema**: Database types and validation schemas shared between frontend and backend via `@shared/*` path alias
- **Storage Interface**: `IStorage` interface abstracts database operations, enabling potential future storage backends
- **API Error Handling**: Zod validation errors converted to user-friendly messages via zod-validation-error
- **Development Mode**: Vite dev server with HMR proxied through Express in development
- **Production Build**: Client built to `dist/public`, server bundled to `dist/index.cjs`

## External Dependencies

### Database
- **PostgreSQL**: Required. Connection via `DATABASE_URL` environment variable. Used for storing user accounts, quote requests, and contact messages.

### Third-Party UI Libraries
- **Radix UI**: Accessible primitives for dialogs, dropdowns, forms, navigation
- **Embla Carousel**: Carousel/slider functionality
- **cmdk**: Command palette component
- **Vaul**: Drawer component

### Development Tools
- **Replit Plugins**: vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner (dev mode only)
- **PostCSS/Autoprefixer**: CSS processing for browser compatibility

### Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Runtime schema validation
- **@hookform/resolvers**: Connects Zod to React Hook Form