# GCF Agent System Integration Guide

## Overview

This guide details how to integrate the 37-agent system into the Gold Coast Financial platform. The agents use an event-driven architecture where all communication happens through a central EventBus.

---

## Current State

### What Exists

**37 Agents across 11 Tiers:**
| Tier | Purpose | Agents |
|------|---------|--------|
| 0 | Orchestration | OrchestratorAgent |
| 1 | Lead Acquisition | LeadDiscovery, DataEnrichment, LeadIntake, LeadScoring |
| 2 | Outreach | OutreachOrchestration, EmailOutreach, SmsMessaging, Dialer, SocialDm |
| 3 | Inbound & Speed | InboundResponse, Appointment, ConversationMemory |
| 4 | Sales | AiSales, HumanSalesAssist, CallCoaching |
| 5 | Application & Compliance | Compliance, ApplicationCompletion, UnderwritingIntelligence, PolicyRecommendation |
| 6 | Financial Ops | Billing, Commission, RevenueForecast |
| 7 | Client Lifecycle | ClientPortal, CustomerSupport, Claims, Retention |
| 8 | Marketing & Brand | SocialPosting, ContentGeneration, Reputation |
| 9 | Analytics & Learning | RealTimeAnalytics, AgentPerformance, Optimization |
| 10 | Governance & Meta | Security, ErrorRecovery, HumanEscalation, Training |

**Core Infrastructure:**
- `EventBus` - Central nervous system (all agents communicate here)
- `MemoryGraph` - Shared memory/knowledge graph
- `KnowledgeBase` - Carriers, products, scripts, templates
- `AnalyticsLedger` - Metrics, revenue tracking, funnel analysis
- `SecurityLayer` - Permissions, audit log, kill switch

**Existing Integrations:**
- PostgreSQL database (quote_requests, contact_messages, etc.)
- Gmail (send emails, notifications)
- Google Calendar (events, appointments)
- Google Sheets (lead tracking)

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     INBOUND TRIGGERS                            │
│  Quote Form → Contact Form → Secure Form → Gmail Inbox          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EVENT BUS                                  │
│  RAW_LEAD_CREATED → LEAD_ENRICHED → LEAD_SCORED → ...          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     ┌──────────┐    ┌──────────┐    ┌──────────┐
     │  Tier 1  │    │  Tier 2  │    │  Tier 3  │
     │  Intake  │───▶│ Outreach │───▶│  Sales   │
     └──────────┘    └──────────┘    └──────────┘
           │               │               │
           └───────────────┴───────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OUTBOUND ACTIONS                             │
│  Send Email → Send SMS → Book Appointment → Update CRM          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Bootstrap & Basic Wiring

### Step 1.1: Create Database Bridge

Create a bridge that syncs between PostgreSQL and the agent MemoryGraph.

**File: `server/agents/integrations/database-bridge.ts`**

```typescript
import { storage } from '../../storage';
import { eventBus, EventType, memoryGraph, NodeType, EdgeType } from '../core';

export class DatabaseBridge {
  private pollInterval: NodeJS.Timeout | null = null;
  private lastQuoteId = 0;
  private lastContactId = 0;

  async start() {
    console.log('[DB-BRIDGE] Starting database bridge...');

    // Initial sync
    await this.syncExistingData();

    // Poll for new entries (until we have webhooks)
    this.pollInterval = setInterval(() => this.pollForNewEntries(), 5000);

    // Listen for agent events that need DB persistence
    this.listenForPersistenceEvents();

    console.log('[DB-BRIDGE] ✅ Database bridge active');
  }

  async stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private async syncExistingData() {
    // Sync recent quote requests as leads
    const quotes = await storage.getQuoteRequests();
    for (const quote of quotes.slice(-50)) { // Last 50
      this.emitLeadFromQuote(quote);
    }
    if (quotes.length > 0) {
      this.lastQuoteId = Math.max(...quotes.map(q => q.id));
    }

    // Sync recent contact messages
    const contacts = await storage.getContactMessages();
    for (const contact of contacts.slice(-50)) {
      this.emitLeadFromContact(contact);
    }
    if (contacts.length > 0) {
      this.lastContactId = Math.max(...contacts.map(c => c.id));
    }
  }

  private async pollForNewEntries() {
    // Check for new quotes
    const quotes = await storage.getQuoteRequests();
    const newQuotes = quotes.filter(q => q.id > this.lastQuoteId);

    for (const quote of newQuotes) {
      console.log(`[DB-BRIDGE] New quote detected: ${quote.firstName} ${quote.lastName}`);
      this.emitLeadFromQuote(quote);
      this.lastQuoteId = Math.max(this.lastQuoteId, quote.id);
    }

    // Check for new contacts
    const contacts = await storage.getContactMessages();
    const newContacts = contacts.filter(c => c.id > this.lastContactId);

    for (const contact of newContacts) {
      console.log(`[DB-BRIDGE] New contact detected: ${contact.firstName} ${contact.lastName}`);
      this.emitLeadFromContact(contact);
      this.lastContactId = Math.max(this.lastContactId, contact.id);
    }
  }

  private emitLeadFromQuote(quote: any) {
    const leadData = {
      source: 'quote_form',
      sourceId: `quote-${quote.id}`,
      firstName: quote.firstName,
      lastName: quote.lastName,
      email: quote.email,
      phone: quote.phone,
      address: {
        street: quote.streetAddress,
        city: quote.city,
        state: quote.state,
        zip: quote.zipCode,
      },
      coverage: {
        type: quote.coverageType,
        amount: quote.coverageAmount,
      },
      health: {
        height: quote.height,
        weight: quote.weight,
        birthDate: quote.birthDate,
        medicalBackground: quote.medicalBackground,
      },
      createdAt: quote.createdAt,
    };

    eventBus.emit({
      id: '',
      type: EventType.RAW_LEAD_CREATED,
      source: 'database-bridge',
      timestamp: Date.now(),
      payload: leadData,
      metadata: { tier: 0, priority: 'normal' },
    });
  }

  private emitLeadFromContact(contact: any) {
    const leadData = {
      source: 'contact_form',
      sourceId: `contact-${contact.id}`,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      message: contact.message,
      createdAt: contact.createdAt,
    };

    eventBus.emit({
      id: '',
      type: EventType.RAW_LEAD_CREATED,
      source: 'database-bridge',
      timestamp: Date.now(),
      payload: leadData,
      metadata: { tier: 0, priority: 'high' }, // Contacts are higher intent
    });
  }

  private listenForPersistenceEvents() {
    // When a policy is sold, we might want to store it
    eventBus.on(EventType.POLICY_SOLD, 'database-bridge', async (event) => {
      console.log('[DB-BRIDGE] Policy sold event - would persist to DB:', event.payload);
      // TODO: Persist to policies table
    });

    // When an appointment is booked
    eventBus.on(EventType.APPOINTMENT_BOOKED, 'database-bridge', async (event) => {
      console.log('[DB-BRIDGE] Appointment booked - would persist to DB:', event.payload);
      // TODO: Persist to appointments table
    });
  }
}

export const databaseBridge = new DatabaseBridge();
```

### Step 1.2: Create Gmail Integration Bridge

**File: `server/agents/integrations/gmail-bridge.ts`**

```typescript
import { sendPortalMessage } from '../../gmail';
import { eventBus, EventType } from '../core';

export class GmailBridge {
  async start() {
    console.log('[GMAIL-BRIDGE] Starting Gmail bridge...');

    // Listen for email events from agents
    eventBus.on(EventType.EMAIL_ENGAGED, 'gmail-bridge', async (event) => {
      const { to, subject, body, templateId, leadId } = event.payload;

      try {
        await sendPortalMessage({
          to,
          subject,
          body,
          type: 'lead_outreach',
        });
        console.log(`[GMAIL-BRIDGE] ✅ Email sent to ${to}`);
      } catch (error) {
        console.error(`[GMAIL-BRIDGE] ❌ Failed to send email:`, error);
      }
    });

    console.log('[GMAIL-BRIDGE] ✅ Gmail bridge active');
  }

  async stop() {
    // Cleanup if needed
  }
}

export const gmailBridge = new GmailBridge();
```

### Step 1.3: Create Calendar Integration Bridge

**File: `server/agents/integrations/calendar-bridge.ts`**

```typescript
import { getCalendarEvents, getTodaysEvents } from '../../googleCalendar';
import { eventBus, EventType } from '../core';

export class CalendarBridge {
  private pollInterval: NodeJS.Timeout | null = null;

  async start() {
    console.log('[CALENDAR-BRIDGE] Starting Calendar bridge...');

    // Listen for appointment booking requests
    eventBus.on(EventType.APPOINTMENT_BOOKED, 'calendar-bridge', async (event) => {
      const { leadId, leadName, dateTime, agentId, notes } = event.payload;

      console.log(`[CALENDAR-BRIDGE] Would create calendar event for ${leadName} at ${dateTime}`);
      // TODO: Implement Google Calendar event creation
    });

    // Poll for upcoming appointments and emit reminders
    this.pollInterval = setInterval(() => this.checkUpcoming(), 60000);

    console.log('[CALENDAR-BRIDGE] ✅ Calendar bridge active');
  }

  async stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  private async checkUpcoming() {
    try {
      const events = await getTodaysEvents();
      // Emit reminder events for upcoming appointments
      // This would trigger agents to prepare for calls
    } catch (error) {
      // Calendar not connected - that's OK
    }
  }
}

export const calendarBridge = new CalendarBridge();
```

### Step 1.4: Create Integrations Index

**File: `server/agents/integrations/index.ts`**

```typescript
export { DatabaseBridge, databaseBridge } from './database-bridge';
export { GmailBridge, gmailBridge } from './gmail-bridge';
export { CalendarBridge, calendarBridge } from './calendar-bridge';

export async function startAllBridges() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('  STARTING INTEGRATION BRIDGES');
  console.log('═══════════════════════════════════════════════\n');

  await databaseBridge.start();
  await gmailBridge.start();
  await calendarBridge.start();

  console.log('\n═══════════════════════════════════════════════');
  console.log('  ✅ ALL BRIDGES ACTIVE');
  console.log('═══════════════════════════════════════════════\n');
}

export async function stopAllBridges() {
  await databaseBridge.stop();
  await gmailBridge.stop();
  await calendarBridge.stop();
}
```

### Step 1.5: Update Server Entry Point

**Modify: `server/index.ts`**

Add these imports and initialization:

```typescript
import { bootstrapAgentSystem } from './agents';
import { createAgentRoutes } from './agents/api-routes';
import { startAllBridges, stopAllBridges } from './agents/integrations';

// After app setup, before listen:
let agentRegistry: any = null;

async function initializeAgentSystem() {
  try {
    // 1. Bootstrap all 37 agents
    agentRegistry = await bootstrapAgentSystem();

    // 2. Mount agent API routes
    app.use('/api', createAgentRoutes(agentRegistry));

    // 3. Start integration bridges
    await startAllBridges();

    console.log('[SERVER] Agent system fully initialized');
  } catch (error) {
    console.error('[SERVER] Failed to initialize agent system:', error);
  }
}

// Call during server startup
initializeAgentSystem();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[SERVER] Shutting down...');
  if (agentRegistry) {
    await agentRegistry.stopAll();
  }
  await stopAllBridges();
  process.exit(0);
});
```

---

## Phase 2: Event Flow Testing

### Test the Full Pipeline

Once integrated, submit a quote request and watch the logs:

```
[DB-BRIDGE] New quote detected: John Smith
[LEAD-INTAKE] 📥 New lead: John Smith (quote_form)
[DATA-ENRICHMENT] 🔍 Enriching lead: John Smith
[LEAD-SCORING] 📊 Scoring lead: John Smith → Score: 78/100
[OUTREACH-ORCH] 📋 Creating outreach plan for John Smith
[EMAIL-OUTREACH] 📧 Queuing email for John Smith
[GMAIL-BRIDGE] ✅ Email sent to john@example.com
```

### API Endpoints Available

After integration, these endpoints are available:

| Endpoint | Description |
|----------|-------------|
| `GET /api/agents` | List all 37 agents with status |
| `GET /api/agents/stats` | System-wide statistics |
| `GET /api/agents/tiers` | Agents grouped by tier |
| `GET /api/agents/events` | Recent event log |
| `GET /api/agents/:id` | Single agent details |
| `POST /api/agents/:id/pause` | Pause an agent |
| `POST /api/agents/:id/resume` | Resume an agent |
| `POST /api/agents/kill-switch` | Emergency stop all |

---

## Phase 3: Real Service Connections

### 3.1 SMS Integration (Twilio)

**File: `server/agents/integrations/sms-bridge.ts`**

```typescript
import twilio from 'twilio';
import { eventBus, EventType } from '../core';

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const FROM_NUMBER = process.env.TWILIO_PHONE;

export class SmsBridge {
  async start() {
    eventBus.on(EventType.SMS_RESPONSE_RECEIVED, 'sms-bridge', async (event) => {
      // This is outbound SMS from agents
      const { to, message, leadId } = event.payload;

      if (!FROM_NUMBER) {
        console.log(`[SMS-BRIDGE] Would send SMS to ${to}: ${message}`);
        return;
      }

      try {
        await client.messages.create({
          body: message,
          from: FROM_NUMBER,
          to,
        });
        console.log(`[SMS-BRIDGE] ✅ SMS sent to ${to}`);
      } catch (error) {
        console.error(`[SMS-BRIDGE] ❌ Failed:`, error);
      }
    });
  }
}
```

### 3.2 Webhook for Inbound Messages

**Add to routes.ts:**

```typescript
// Twilio webhook for inbound SMS
app.post('/api/webhooks/twilio/sms', (req, res) => {
  const { From, Body } = req.body;

  eventBus.emit({
    id: '',
    type: EventType.SMS_RESPONSE_RECEIVED,
    source: 'twilio-webhook',
    timestamp: Date.now(),
    payload: {
      from: From,
      message: Body,
      direction: 'inbound',
    },
    metadata: { tier: 0, priority: 'high' },
  });

  res.status(200).send('OK');
});
```

---

## Phase 4: Agent Dashboard

### 4.1 Create Dashboard Page

**File: `client/src/pages/admin/AgentOps.tsx`**

```tsx
// Real-time dashboard showing:
// - All 37 agents with status (Running/Paused/Error)
// - Event flow visualization
// - Metrics per tier
// - Kill switch button
// - Recent events log
```

### 4.2 WebSocket for Real-Time Updates

Add WebSocket support to stream events to the dashboard:

```typescript
// In websocket.ts
eventBus.on('*', 'websocket-bridge', (event) => {
  // Broadcast to all connected admin clients
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'AGENT_EVENT',
        data: event,
      }));
    }
  });
});
```

---

## Event Types Reference

### Lead Pipeline Events
| Event | Trigger | Consumers |
|-------|---------|-----------|
| `RAW_LEAD_CREATED` | New quote/contact form | LeadIntake, LeadDiscovery |
| `LEAD_ENRICHED` | Data enrichment complete | LeadScoring |
| `LEAD_SCORED` | Scoring complete | OutreachOrchestration, all Tier 2 |
| `OUTREACH_COMPLETED` | All touches done | Tier 3 agents |

### Sales Events
| Event | Trigger | Consumers |
|-------|---------|-----------|
| `CALL_CONNECTED` | Dialer connects | HumanSalesAssist, CallCoaching |
| `APPOINTMENT_BOOKED` | Calendar set | Tier 4, CalendarBridge |
| `POLICY_SOLD` | Deal closed | Tier 5, Tier 6, Analytics |

### System Events
| Event | Trigger | Consumers |
|-------|---------|-----------|
| `AGENT_HEARTBEAT` | Every 30s per agent | Orchestrator, Dashboard |
| `AGENT_ERROR` | Agent exception | ErrorRecovery, HumanEscalation |
| `COMPLIANCE_VETO` | Compliance blocks action | Target agent pauses |

---

## Configuration

### Environment Variables

```bash
# Agent System
AGENT_SYSTEM_ENABLED=true
AGENT_LOG_LEVEL=info

# Twilio (optional)
TWILIO_SID=your_sid
TWILIO_TOKEN=your_token
TWILIO_PHONE=+1234567890

# OpenAI (for AI agents)
OPENAI_API_KEY=your_key
```

---

## Monitoring & Debugging

### Log Levels

Each agent logs with a prefix:
```
[AGENT-NAME] 🚀 Starting...
[AGENT-NAME] ✅ Running
[AGENT-NAME] 📥 Processing event...
[AGENT-NAME] ❌ Error: ...
```

### Health Check

```bash
curl http://localhost:4500/api/agents/stats
```

Returns:
```json
{
  "agents": { "total": 37, "byStatus": { "RUNNING": 37 } },
  "events": { "totalEvents": 1234, "eventCounts": {...} },
  "security": { "killSwitchActive": false },
  "revenue": { "total": 125000, "policies": 45 }
}
```

---

## Rollout Strategy

1. **Day 1**: Deploy with `AGENT_SYSTEM_ENABLED=false` (code only)
2. **Day 2**: Enable in staging, test with dummy leads
3. **Day 3**: Enable Tier 1-3 only in production (intake + outreach)
4. **Week 2**: Enable Tier 4-6 (sales + financial)
5. **Week 3**: Enable Tier 7-10 (lifecycle + analytics)

---

## Kill Switch

In case of emergency:

```bash
curl -X POST http://localhost:4500/api/agents/kill-switch
```

This immediately:
- Halts all 37 agents
- Stops all outbound communications
- Logs the activation
- Can be deactivated via `/kill-switch/deactivate`

---

## Next Steps

1. [ ] Create integration bridges (Phase 1)
2. [ ] Wire up server/index.ts
3. [ ] Test with a real quote submission
4. [ ] Build AgentOps dashboard
5. [ ] Add Twilio for SMS
6. [ ] Add OpenAI for AI agents (sales scripts, objection handling)
