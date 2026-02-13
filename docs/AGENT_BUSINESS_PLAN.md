# GCF Agent System: Business Integration Plan

## Executive Summary

You have 37 AI agents ready to automate your insurance business. This plan details exactly what each agent does, what it connects to, what you need to build, and how you maintain complete control.

**Goal:** No lead dies. No activity goes untracked. You see everything.

---

## The 37 Agents - What They Do For Your Business

### TIER 0: The Brain (1 Agent)

| Agent | What It Does | Your Control |
|-------|--------------|--------------|
| **Orchestrator** | Routes all work, prevents duplicate outreach, enforces rules | Set SLAs, priority rules, working hours |

**Business Impact:** Ensures no two agents contact the same lead simultaneously. Enforces your business rules across the entire system.

---

### TIER 1: Lead Capture (4 Agents)

| Agent | What It Does | Connects To | Your Control |
|-------|--------------|-------------|--------------|
| **Lead Discovery** | Finds new leads from sources | Facebook Ads, Google Ads, referral links | Toggle sources on/off, set budgets |
| **Lead Intake** | Receives leads from your forms | Quote forms, contact forms, landing pages | See every lead instantly |
| **Data Enrichment** | Adds missing info (income, household size) | Clearbit, FullContact, or similar API | Choose which data to enrich |
| **Lead Scoring** | Rates leads 0-100 based on likelihood to buy | Your historical data | Adjust scoring weights |

**What You See:**
- Dashboard showing every new lead with score
- Source attribution (which ad/form brought them)
- Enriched data (estimated income, household, etc.)

**What You Build:**
- Lead Inbox page showing scored leads
- Source performance report

---

### TIER 2: Outreach (5 Agents)

| Agent | What It Does | Connects To | Your Control |
|-------|--------------|-------------|--------------|
| **Outreach Orchestration** | Plans multi-touch sequences | All outreach agents | Set sequence templates, timing |
| **Email Outreach** | Sends personalized emails | Gmail (already connected) | Approve templates, see all sent |
| **SMS Messaging** | Sends text messages | Twilio (needs setup) | Approve templates, see all sent |
| **Dialer** | Makes/schedules calls | Phone system (needs setup) | Set calling hours, scripts |
| **Social DM** | Sends social media messages | Facebook, Instagram APIs | Approve templates |

**What You See:**
- Every outreach attempt with timestamp
- Response rates per channel
- Which sequences are working

**What You Build:**
- Outreach Activity Log
- Template Manager (approve/edit templates)
- Sequence Builder (drag-drop cadences)

**What You Connect:**
- Twilio for SMS ($0.0075/message)
- Phone system for calling (Dialpad, RingCentral, or similar)

---

### TIER 3: Speed to Lead (3 Agents)

| Agent | What It Does | Connects To | Your Control |
|-------|--------------|-------------|--------------|
| **Inbound Response** | Instantly responds to inquiries | Email, SMS, chat | Set response templates, hours |
| **Appointment Setter** | Books calls/meetings | Google Calendar (connected) | Set available slots, buffer time |
| **Conversation Memory** | Remembers all interactions | All channels | Search any conversation |

**What You See:**
- Response time metrics (how fast you respond)
- Appointment calendar with lead info
- Full conversation history per lead

**What You Build:**
- Speed-to-Lead Dashboard (response times)
- Unified Inbox (all channels in one place)
- Appointment Calendar with lead context

---

### TIER 4: Sales Assistance (3 Agents)

| Agent | What It Does | Connects To | Your Control |
|-------|--------------|-------------|--------------|
| **AI Sales Agent** | Handles initial qualification calls | Phone/chat | Set qualification questions |
| **Human Sales Assist** | Gives agents real-time coaching | Live calls | Define objection responses |
| **Call Coaching** | Analyzes calls, gives feedback | Call recordings | Review coaching suggestions |

**What You See:**
- Live call assistance panel
- Post-call analysis with scores
- Coaching recommendations

**What You Build:**
- Sales Assist Sidebar (shows during calls)
- Call Recording Review page
- Objection Handling Library

**What You Connect:**
- Call recording service (if not already have)
- Whisper API for real-time transcription (optional)

---

### TIER 5: Applications & Compliance (4 Agents)

| Agent | What It Does | Connects To | Your Control |
|-------|--------------|-------------|--------------|
| **Compliance Agent** | Blocks non-compliant messages | All outbound comms | Set compliance rules |
| **Application Completion** | Helps clients finish apps | Secure Forms (built) | Track completion rates |
| **Underwriting Intel** | Predicts approval likelihood | Carrier data | See predictions before submit |
| **Policy Recommendation** | Suggests best products | Product database | Set recommendation rules |

**What You See:**
- Compliance audit log (what was blocked and why)
- Application pipeline (started → submitted → approved)
- Product match scores per lead

**What You Build:**
- Compliance Dashboard
- Application Tracker
- Product Recommendation Engine UI

---

### TIER 6: Money (3 Agents)

| Agent | What It Does | Connects To | Your Control |
|-------|--------------|-------------|--------------|
| **Billing Agent** | Tracks premium payments | Carrier portals | See payment status |
| **Commission Agent** | Calculates your commissions | Commission schedules | Track earnings |
| **Revenue Forecast** | Predicts future revenue | Historical data | See projections |

**What You See:**
- Expected commission per policy
- Revenue forecast chart
- Payment status per client

**What You Build:**
- Commission Tracker
- Revenue Dashboard
- Payment Status page

---

### TIER 7: Client Lifecycle (4 Agents)

| Agent | What It Does | Connects To | Your Control |
|-------|--------------|-------------|--------------|
| **Client Portal Agent** | Powers client self-service | Client Portal (built) | Customize portal features |
| **Customer Support** | Handles support requests | Email, chat | Set auto-responses |
| **Claims Agent** | Tracks claim status | Carrier portals | See all claims |
| **Retention Agent** | Prevents cancellations | Client data | Set retention triggers |

**What You See:**
- Client satisfaction scores
- Support ticket queue
- At-risk client alerts

**What You Build:**
- Support Ticket System
- Claims Tracker
- Retention Dashboard (churn risk)

---

### TIER 8: Marketing (3 Agents)

| Agent | What It Does | Connects To | Your Control |
|-------|--------------|-------------|--------------|
| **Content Generation** | Creates marketing content | OpenAI | Approve before publish |
| **Social Posting** | Posts to social media | Facebook, Instagram, LinkedIn | Set schedule, approve posts |
| **Reputation Agent** | Monitors reviews | Google, Yelp, Facebook | Alert on new reviews |

**What You See:**
- Content calendar
- Social performance metrics
- Review alerts

**What You Build:**
- Content Approval Queue
- Social Media Dashboard
- Review Management page

**What You Connect:**
- Social media APIs (Facebook, Instagram, LinkedIn)
- Review platforms (Google Business, Yelp)

---

### TIER 9: Analytics & Optimization (3 Agents)

| Agent | What It Does | Connects To | Your Control |
|-------|--------------|-------------|--------------|
| **Real-Time Analytics** | Tracks everything live | All agents | See live dashboard |
| **Agent Performance** | Scores your human agents | Activity data | Set performance goals |
| **Optimization Agent** | A/B tests and improves | All systems | Approve experiments |

**What You See:**
- Live activity feed
- Agent leaderboard
- A/B test results

**What You Build:**
- Real-Time Dashboard
- Agent Performance page
- Experiment Manager

---

### TIER 10: Governance (4 Agents)

| Agent | What It Does | Connects To | Your Control |
|-------|--------------|-------------|--------------|
| **Security Agent** | Prevents unauthorized actions | All systems | Set permissions |
| **Error Recovery** | Fixes problems automatically | All agents | See error log |
| **Human Escalation** | Routes issues to humans | Notification system | Set escalation rules |
| **Training Agent** | Improves agent performance | Historical data | Review improvements |

**What You See:**
- Security audit log
- Error/recovery log
- Escalation queue

**What You Build:**
- Security Dashboard
- Error Log viewer
- Escalation Queue page

---

## What Needs To Be Built (Priority Order)

### Phase 1: Control Center (Week 1)
**Location:** `/admin/agent-ops`

| Component | Purpose |
|-----------|---------|
| Agent Status Grid | See all 37 agents, start/stop any |
| Event Feed | Real-time log of everything happening |
| Kill Switch | Emergency stop all agents |
| Metrics Overview | Key numbers at a glance |

### Phase 2: Lead Command Center (Week 2)
**Location:** `/agents/inbox` (enhance existing)

| Component | Purpose |
|-----------|---------|
| Scored Lead List | All leads with scores, sources |
| Lead Detail Drawer | Full history, enriched data |
| Quick Actions | Call, email, text, book appointment |
| Pipeline View | Kanban board of lead stages |

### Phase 3: Communication Hub (Week 3)
**Location:** `/agents/communications`

| Component | Purpose |
|-----------|---------|
| Unified Inbox | Email, SMS, social in one place |
| Template Manager | Create/edit/approve templates |
| Sequence Builder | Build outreach cadences |
| Activity Log | Every touch with every lead |

### Phase 4: Sales Cockpit (Week 4)
**Location:** `/agents/sales`

| Component | Purpose |
|-----------|---------|
| Live Call Panel | Real-time coaching during calls |
| Call Review | Post-call analysis |
| Script Library | Approved talk tracks |
| Objection Responses | Quick reference during calls |

### Phase 5: Money Dashboard (Week 5)
**Location:** `/agents/revenue`

| Component | Purpose |
|-----------|---------|
| Commission Tracker | Expected and received |
| Revenue Forecast | Projections based on pipeline |
| Policy Status | All policies with payment status |

---

## External Connections Needed

### Must Have (Core Functionality)

| Service | Purpose | Cost | Priority |
|---------|---------|------|----------|
| **Twilio** | SMS messaging | ~$0.0075/msg | HIGH |
| **OpenAI** | AI responses, content | ~$20-100/mo | HIGH |

### Nice to Have (Enhanced Features)

| Service | Purpose | Cost | Priority |
|---------|---------|------|----------|
| **Clearbit/FullContact** | Data enrichment | $99-299/mo | MEDIUM |
| **Dialpad/RingCentral** | Phone system | $15-25/user/mo | MEDIUM |
| **Facebook API** | Social DMs, posting | Free | MEDIUM |
| **Zapier** | Connect other tools | $20-50/mo | LOW |

---

## Your Control Points

### What You Approve Before It Happens
- [ ] Email templates
- [ ] SMS templates
- [ ] Social media posts
- [ ] Outreach sequences
- [ ] A/B experiments

### What You Can Stop Instantly
- [ ] Any individual agent
- [ ] All outreach (kill switch)
- [ ] Specific lead communications
- [ ] Entire tiers

### What You See In Real-Time
- [ ] Every event as it happens
- [ ] All agent decisions
- [ ] Every customer touchpoint
- [ ] Error/issue alerts

### What You Review Daily
- [ ] New leads with scores
- [ ] Outreach performance
- [ ] Appointments booked
- [ ] Revenue metrics

---

## Implementation Timeline

### Week 1: Foundation
- [x] ~~37 agents running~~
- [x] ~~Database bridge syncing leads~~
- [x] ~~Gmail bridge ready~~
- [ ] Build Agent Ops dashboard
- [ ] Add real-time WebSocket feed

### Week 2: Lead Management
- [ ] Enhance Lead Inbox with scores
- [ ] Add lead detail drawer
- [ ] Pipeline kanban view
- [ ] Quick action buttons

### Week 3: Communications
- [ ] Unified inbox UI
- [ ] Template manager
- [ ] Connect Twilio for SMS
- [ ] Sequence builder

### Week 4: Sales Tools
- [ ] Call coaching sidebar
- [ ] Script library
- [ ] Objection handling

### Week 5: Revenue Tracking
- [ ] Commission calculator
- [ ] Revenue forecast
- [ ] Policy tracker

---

## Success Metrics

After full implementation, you should see:

| Metric | Current | Target |
|--------|---------|--------|
| Lead response time | ? | < 5 minutes |
| Lead contact rate | ? | > 80% |
| Appointment show rate | ? | > 70% |
| Application completion | ? | > 90% |
| Time saved per agent | ? | 10+ hrs/week |

---

## Questions For You

Before we proceed, I need your input on:

1. **SMS Provider:** Twilio is standard. Any preference?
2. **Phone System:** What do you currently use for calls?
3. **Social Media:** Which platforms do you want to automate?
4. **Priority:** Which phase matters most to you?
5. **Budget:** Monthly budget for external services?

---

## Next Step

Tell me which phase to build first, and I'll start immediately.
