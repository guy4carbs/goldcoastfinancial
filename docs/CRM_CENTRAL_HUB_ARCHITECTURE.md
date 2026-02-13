# CRM Central Hub Architecture

## Vision

The CRM is the **single source of truth** for all person/organization data in the system. Every other lounge reads from and writes to CRM. Nothing happens to a contact without CRM knowing about it.

```
                         ┌─────────────────────────────────┐
                         │         CRM CENTRAL HUB         │
                         │                                 │
                         │  ┌───────────────────────────┐  │
                         │  │     Unified Contact       │  │
                         │  │        Registry           │  │
                         │  └───────────────────────────┘  │
                         │                                 │
                         │  ┌───────────────────────────┐  │
                         │  │   Activity Timeline       │  │
                         │  │   (ALL lounge events)     │  │
                         │  └───────────────────────────┘  │
                         │                                 │
                         │  ┌───────────────────────────┐  │
                         │  │   Relationship Graph      │  │
                         │  │   (referrals, families)   │  │
                         │  └───────────────────────────┘  │
                         │                                 │
                         └──────────────┬──────────────────┘
                                        │
            ┌───────────────────────────┼───────────────────────────┐
            │                           │                           │
    ┌───────┴───────┐           ┌───────┴───────┐           ┌───────┴───────┐
    │ Agent Lounge  │           │Finance Lounge │           │Marketing      │
    │               │           │               │           │  Lounge       │
    │ - Reads leads │           │ - Reads       │           │               │
    │ - Writes      │           │   clients     │           │ - Reads       │
    │   activities  │           │ - Writes      │           │   segments    │
    │ - Updates     │           │   commission  │           │ - Writes      │
    │   pipeline    │           │   events      │           │   campaign    │
    │               │           │               │           │   events      │
    └───────────────┘           └───────────────┘           └───────────────┘
            │                           │                           │
            └───────────────────────────┴───────────────────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────────┐
                         │           EventBus              │
                         │   (propagates all changes)      │
                         └─────────────────────────────────┘
```

---

## Core Principles

### 1. Contact Primacy
Every person in the system has ONE record in CRM. Other lounges reference this ID.

### 2. Activity Write-Through
When ANY lounge does something involving a contact, it writes to CRM's activity timeline.

### 3. Event-Driven Sync
CRM emits events when data changes. Other lounges subscribe to stay in sync.

### 4. Read Anywhere, Write to CRM
Lounges can cache/project data locally but mutations go through CRM APIs.

### 5. Relationship Awareness
CRM tracks how contacts relate (spouse, referrer, employer, etc.)

---

## Data Model

### Unified Contact Entity

```sql
-- The ONE table for all people in the system
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),

  -- Lifecycle stage (lead → prospect → client → former_client)
  lifecycle_stage VARCHAR(50) NOT NULL DEFAULT 'lead',

  -- Sub-status within stage
  status VARCHAR(50) NOT NULL DEFAULT 'new',

  -- Pipeline position (for active opportunities)
  pipeline_stage VARCHAR(50),
  pipeline_entered_at TIMESTAMPTZ,

  -- Ownership
  owner_id UUID REFERENCES users(id),
  team_id UUID REFERENCES teams(id),

  -- Scoring
  lead_score INTEGER DEFAULT 0,
  score_tier VARCHAR(20) DEFAULT 'cold', -- cold, warm, hot, on_fire
  engagement_score INTEGER DEFAULT 0,

  -- Value
  estimated_value DECIMAL(12,2),
  lifetime_value DECIMAL(12,2) DEFAULT 0,

  -- Source tracking
  original_source VARCHAR(100),
  original_source_detail JSONB,
  latest_source VARCHAR(100),

  -- Communication preferences
  preferred_contact_method VARCHAR(50),
  do_not_call BOOLEAN DEFAULT FALSE,
  do_not_email BOOLEAN DEFAULT FALSE,

  -- Demographics
  date_of_birth DATE,
  gender VARCHAR(20),
  occupation VARCHAR(100),
  income_range VARCHAR(50),

  -- Address
  street_address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(50) DEFAULT 'US',

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ,
  last_contacted_at TIMESTAMPTZ,

  -- Conversion tracking
  converted_at TIMESTAMPTZ,
  conversion_source VARCHAR(100)
);

-- Index for common queries
CREATE INDEX idx_contacts_lifecycle ON contacts(lifecycle_stage);
CREATE INDEX idx_contacts_owner ON contacts(owner_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_score ON contacts(lead_score DESC);
CREATE INDEX idx_contacts_tags ON contacts USING GIN(tags);
```

### Activity Timeline (The Audit Trail)

```sql
-- Every interaction, from ANY lounge, is recorded here
CREATE TABLE contact_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

  -- What happened
  activity_type VARCHAR(100) NOT NULL,
  activity_subtype VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Where it came from
  source_lounge VARCHAR(50) NOT NULL, -- 'agent', 'ai', 'marketing', 'finance', etc.
  source_module VARCHAR(100),         -- 'dialer', 'email_campaign', 'commission_calc'
  source_agent_id VARCHAR(100),       -- AI agent ID if applicable

  -- Who did it
  performed_by UUID REFERENCES users(id),
  performed_by_name VARCHAR(255),

  -- Rich data
  metadata JSONB DEFAULT '{}',

  -- For aggregation
  is_engagement BOOLEAN DEFAULT FALSE, -- Did contact respond/engage?
  sentiment VARCHAR(20),               -- positive, neutral, negative

  -- Timestamps
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- For timeline display
  is_milestone BOOLEAN DEFAULT FALSE,  -- Show prominently in timeline
  visibility VARCHAR(20) DEFAULT 'internal' -- internal, client_visible
);

CREATE INDEX idx_activities_contact ON contact_activities(contact_id);
CREATE INDEX idx_activities_type ON contact_activities(activity_type);
CREATE INDEX idx_activities_source ON contact_activities(source_lounge);
CREATE INDEX idx_activities_time ON contact_activities(occurred_at DESC);
```

### Relationship Graph

```sql
-- How contacts relate to each other
CREATE TABLE contact_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  related_contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

  relationship_type VARCHAR(50) NOT NULL,
  -- Types: spouse, child, parent, sibling, employer, employee,
  --        referrer, referred_by, business_partner, colleague

  is_primary BOOLEAN DEFAULT FALSE, -- Primary relationship

  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(contact_id, related_contact_id, relationship_type)
);

-- Organizations (for B2B)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  size VARCHAR(50),
  website VARCHAR(255),
  address JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact-to-organization
CREATE TABLE contact_organizations (
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(100),
  is_primary BOOLEAN DEFAULT FALSE,
  started_at DATE,
  ended_at DATE,
  PRIMARY KEY (contact_id, organization_id)
);
```

### Lounge-Specific Extensions

Each lounge can have its own extension table that links to the central contact:

```sql
-- Agent Lounge extension (sales-specific data)
CREATE TABLE contact_sales_data (
  contact_id UUID PRIMARY KEY REFERENCES contacts(id) ON DELETE CASCADE,

  -- Insurance-specific
  coverage_type VARCHAR(100),
  coverage_amount DECIMAL(12,2),
  current_carrier VARCHAR(100),
  policy_expiration DATE,

  -- Sales process
  needs_analysis JSONB,
  objections TEXT[],
  competitor_quotes JSONB,

  -- Assignment
  assigned_agent_id UUID REFERENCES users(id),
  territory VARCHAR(100),

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Finance Lounge extension
CREATE TABLE contact_financial_data (
  contact_id UUID PRIMARY KEY REFERENCES contacts(id) ON DELETE CASCADE,

  -- Revenue
  total_premium_paid DECIMAL(12,2) DEFAULT 0,
  total_commissions_generated DECIMAL(12,2) DEFAULT 0,

  -- Payment
  payment_method VARCHAR(50),
  billing_frequency VARCHAR(20),
  last_payment_date DATE,
  next_payment_due DATE,

  -- Risk
  payment_risk_score INTEGER,
  churn_risk_score INTEGER,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketing Lounge extension
CREATE TABLE contact_marketing_data (
  contact_id UUID PRIMARY KEY REFERENCES contacts(id) ON DELETE CASCADE,

  -- Email engagement
  email_opens INTEGER DEFAULT 0,
  email_clicks INTEGER DEFAULT 0,
  last_email_opened_at TIMESTAMPTZ,

  -- Campaign history
  campaigns_sent INTEGER DEFAULT 0,
  campaigns_engaged INTEGER DEFAULT 0,

  -- Segmentation
  marketing_segments TEXT[],
  persona VARCHAR(100),

  -- Preferences
  content_interests TEXT[],
  email_frequency_preference VARCHAR(50),

  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Service Layer Architecture

### CRMCore Service

```typescript
// server/services/crm-core/index.ts

import { EventBus } from '../core/event-bus';
import { pool } from '../../db';

/**
 * CRMCore - The central authority for all contact data
 * ALL lounges must use this service to interact with contact data
 */
export class CRMCore {
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  // ===========================================================================
  // CONTACT OPERATIONS
  // ===========================================================================

  /**
   * Get a contact by ID (the canonical source)
   */
  async getContact(id: string): Promise<Contact | null> {
    const result = await pool.query(
      `SELECT * FROM contacts WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? this.mapContact(result.rows[0]) : null;
  }

  /**
   * Get contact with all extensions (full profile)
   */
  async getContactProfile(id: string): Promise<ContactProfile | null> {
    const [contact, sales, financial, marketing, relationships, recentActivity] =
      await Promise.all([
        this.getContact(id),
        this.getSalesData(id),
        this.getFinancialData(id),
        this.getMarketingData(id),
        this.getRelationships(id),
        this.getRecentActivities(id, 20),
      ]);

    if (!contact) return null;

    return {
      ...contact,
      sales,
      financial,
      marketing,
      relationships,
      recentActivity,
    };
  }

  /**
   * Create a new contact
   */
  async createContact(data: CreateContactInput, source: ActivitySource): Promise<Contact> {
    const result = await pool.query(`
      INSERT INTO contacts (
        first_name, last_name, email, phone,
        lifecycle_stage, status, original_source,
        owner_id, tags, custom_fields
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      data.firstName, data.lastName, data.email, data.phone,
      data.lifecycleStage || 'lead',
      data.status || 'new',
      source.lounge,
      data.ownerId,
      data.tags || [],
      data.customFields || {},
    ]);

    const contact = this.mapContact(result.rows[0]);

    // Record creation activity
    await this.recordActivity({
      contactId: contact.id,
      type: 'CONTACT_CREATED',
      title: 'Contact created',
      source,
      metadata: { initialData: data },
      isMilestone: true,
    });

    // Emit event for other systems
    this.eventBus.emit('CRM_CONTACT_CREATED', {
      contact,
      source,
      timestamp: new Date(),
    });

    return contact;
  }

  /**
   * Update a contact
   */
  async updateContact(
    id: string,
    data: UpdateContactInput,
    source: ActivitySource
  ): Promise<Contact> {
    const before = await this.getContact(id);
    if (!before) throw new Error('Contact not found');

    // Build dynamic update
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updates.push(`${this.toSnakeCase(key)} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(`
      UPDATE contacts SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    const contact = this.mapContact(result.rows[0]);

    // Record what changed
    const changes = this.diffContacts(before, contact);
    if (Object.keys(changes).length > 0) {
      await this.recordActivity({
        contactId: id,
        type: 'CONTACT_UPDATED',
        title: 'Contact updated',
        source,
        metadata: { changes, before, after: contact },
      });

      this.eventBus.emit('CRM_CONTACT_UPDATED', {
        contact,
        changes,
        source,
        timestamp: new Date(),
      });
    }

    return contact;
  }

  /**
   * Transition lifecycle stage (lead → prospect → client)
   */
  async transitionLifecycle(
    id: string,
    newStage: LifecycleStage,
    source: ActivitySource,
    reason?: string
  ): Promise<Contact> {
    const contact = await this.getContact(id);
    if (!contact) throw new Error('Contact not found');

    const oldStage = contact.lifecycleStage;

    const result = await pool.query(`
      UPDATE contacts SET
        lifecycle_stage = $1,
        converted_at = CASE WHEN $1 = 'client' THEN NOW() ELSE converted_at END,
        conversion_source = CASE WHEN $1 = 'client' THEN $2 ELSE conversion_source END,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [newStage, source.lounge, id]);

    const updated = this.mapContact(result.rows[0]);

    await this.recordActivity({
      contactId: id,
      type: 'LIFECYCLE_CHANGED',
      title: `Lifecycle: ${oldStage} → ${newStage}`,
      description: reason,
      source,
      metadata: { oldStage, newStage, reason },
      isMilestone: true,
    });

    this.eventBus.emit('CRM_LIFECYCLE_CHANGED', {
      contact: updated,
      oldStage,
      newStage,
      source,
      timestamp: new Date(),
    });

    return updated;
  }

  // ===========================================================================
  // ACTIVITY TIMELINE
  // ===========================================================================

  /**
   * Record an activity (called by ALL lounges)
   */
  async recordActivity(input: RecordActivityInput): Promise<Activity> {
    const result = await pool.query(`
      INSERT INTO contact_activities (
        contact_id, activity_type, activity_subtype,
        title, description, source_lounge, source_module,
        source_agent_id, performed_by, performed_by_name,
        metadata, is_engagement, sentiment, is_milestone, visibility
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      input.contactId,
      input.type,
      input.subtype,
      input.title,
      input.description,
      input.source.lounge,
      input.source.module,
      input.source.agentId,
      input.source.userId,
      input.source.userName,
      input.metadata || {},
      input.isEngagement || false,
      input.sentiment,
      input.isMilestone || false,
      input.visibility || 'internal',
    ]);

    // Update last_activity_at on contact
    await pool.query(`
      UPDATE contacts SET last_activity_at = NOW() WHERE id = $1
    `, [input.contactId]);

    const activity = this.mapActivity(result.rows[0]);

    this.eventBus.emit('CRM_ACTIVITY_RECORDED', {
      activity,
      timestamp: new Date(),
    });

    return activity;
  }

  /**
   * Get activity timeline for a contact
   */
  async getActivities(
    contactId: string,
    options: GetActivitiesOptions = {}
  ): Promise<{ activities: Activity[]; total: number }> {
    const {
      types,
      sources,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
      milestonesOnly = false,
    } = options;

    let query = `
      SELECT * FROM contact_activities
      WHERE contact_id = $1
    `;
    const params: any[] = [contactId];
    let paramIndex = 2;

    if (types?.length) {
      query += ` AND activity_type = ANY($${paramIndex})`;
      params.push(types);
      paramIndex++;
    }

    if (sources?.length) {
      query += ` AND source_lounge = ANY($${paramIndex})`;
      params.push(sources);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND occurred_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND occurred_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (milestonesOnly) {
      query += ` AND is_milestone = true`;
    }

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM (${query}) as subq`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    query += ` ORDER BY occurred_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return {
      activities: result.rows.map(this.mapActivity),
      total,
    };
  }

  // ===========================================================================
  // RELATIONSHIPS
  // ===========================================================================

  /**
   * Link two contacts
   */
  async createRelationship(
    contactId: string,
    relatedContactId: string,
    type: RelationshipType,
    source: ActivitySource
  ): Promise<void> {
    await pool.query(`
      INSERT INTO contact_relationships (contact_id, related_contact_id, relationship_type)
      VALUES ($1, $2, $3)
      ON CONFLICT (contact_id, related_contact_id, relationship_type) DO NOTHING
    `, [contactId, relatedContactId, type]);

    // Create reverse relationship
    const reverseType = this.getReverseRelationshipType(type);
    if (reverseType) {
      await pool.query(`
        INSERT INTO contact_relationships (contact_id, related_contact_id, relationship_type)
        VALUES ($1, $2, $3)
        ON CONFLICT (contact_id, related_contact_id, relationship_type) DO NOTHING
      `, [relatedContactId, contactId, reverseType]);
    }

    await this.recordActivity({
      contactId,
      type: 'RELATIONSHIP_CREATED',
      title: `Linked to ${type}`,
      source,
      metadata: { relatedContactId, relationshipType: type },
    });

    this.eventBus.emit('CRM_RELATIONSHIP_CREATED', {
      contactId,
      relatedContactId,
      type,
      source,
      timestamp: new Date(),
    });
  }

  // ===========================================================================
  // SEARCH & QUERY
  // ===========================================================================

  /**
   * Universal contact search
   */
  async searchContacts(query: ContactSearchQuery): Promise<SearchResult> {
    // Implementation with full-text search, filters, sorting
    // This is the ONE place all lounges search for contacts
  }

  /**
   * Get contacts by segment
   */
  async getSegment(segmentId: string): Promise<Contact[]> {
    // Dynamic segment evaluation
  }
}

// Singleton instance
export const crmCore = new CRMCore(eventBus);
```

### Activity Source Type

```typescript
// server/services/crm-core/types.ts

/**
 * Every activity must declare where it came from
 */
export interface ActivitySource {
  lounge: LoungeId;        // 'agent' | 'ai' | 'finance' | 'marketing' | etc.
  module?: string;         // 'dialer' | 'email_campaign' | 'quote_engine'
  agentId?: string;        // AI agent ID if from AI system
  userId?: string;         // Human user ID
  userName?: string;       // For display
}

export type LoungeId =
  | 'agent'
  | 'ai'
  | 'crm'
  | 'finance'
  | 'marketing'
  | 'support'
  | 'admin'
  | 'portal';

/**
 * Standard activity types (extensible)
 */
export const ActivityTypes = {
  // Contact lifecycle
  CONTACT_CREATED: 'contact_created',
  CONTACT_UPDATED: 'contact_updated',
  LIFECYCLE_CHANGED: 'lifecycle_changed',

  // Communication
  CALL_MADE: 'call_made',
  CALL_RECEIVED: 'call_received',
  EMAIL_SENT: 'email_sent',
  EMAIL_OPENED: 'email_opened',
  EMAIL_CLICKED: 'email_clicked',
  SMS_SENT: 'sms_sent',
  SMS_RECEIVED: 'sms_received',

  // Sales process
  QUOTE_CREATED: 'quote_created',
  QUOTE_SENT: 'quote_sent',
  QUOTE_VIEWED: 'quote_viewed',
  APPLICATION_STARTED: 'application_started',
  APPLICATION_SUBMITTED: 'application_submitted',
  POLICY_ISSUED: 'policy_issued',
  DEAL_WON: 'deal_won',
  DEAL_LOST: 'deal_lost',

  // Appointments
  APPOINTMENT_SCHEDULED: 'appointment_scheduled',
  APPOINTMENT_COMPLETED: 'appointment_completed',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  APPOINTMENT_RESCHEDULED: 'appointment_rescheduled',

  // Financial
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_FAILED: 'payment_failed',
  COMMISSION_CALCULATED: 'commission_calculated',

  // Marketing
  CAMPAIGN_ENROLLED: 'campaign_enrolled',
  CAMPAIGN_COMPLETED: 'campaign_completed',
  FORM_SUBMITTED: 'form_submitted',

  // Support
  TICKET_CREATED: 'ticket_created',
  TICKET_RESOLVED: 'ticket_resolved',

  // AI
  AI_INTERACTION: 'ai_interaction',
  AI_RECOMMENDATION: 'ai_recommendation',

  // Notes
  NOTE_ADDED: 'note_added',
  TASK_CREATED: 'task_created',
  TASK_COMPLETED: 'task_completed',
} as const;
```

---

## Lounge Integration Patterns

### How Agent Lounge Uses CRM

```typescript
// server/routes/agents/leads.ts

import { crmCore } from '../../services/crm-core';
import { ActivitySource } from '../../services/crm-core/types';

router.post('/leads/:id/call', async (req, res) => {
  const { id } = req.params;
  const { outcome, duration, notes } = req.body;

  const source: ActivitySource = {
    lounge: 'agent',
    module: 'dialer',
    userId: req.user.id,
    userName: req.user.name,
  };

  // Record the call in CRM (the hub)
  await crmCore.recordActivity({
    contactId: id,
    type: 'CALL_MADE',
    subtype: outcome, // 'connected', 'voicemail', 'no_answer'
    title: `Call: ${outcome}`,
    description: notes,
    source,
    metadata: {
      duration,
      outcome,
      callerId: req.user.phone,
    },
    isEngagement: outcome === 'connected',
  });

  // If connected, update last contacted
  if (outcome === 'connected') {
    await crmCore.updateContact(id, {
      lastContactedAt: new Date(),
    }, source);
  }

  res.json({ success: true });
});

router.post('/leads/:id/quote', async (req, res) => {
  const { id } = req.params;
  const quoteData = req.body;

  const source: ActivitySource = {
    lounge: 'agent',
    module: 'quote_engine',
    userId: req.user.id,
    userName: req.user.name,
  };

  // Create quote in local storage
  const quote = await createQuote(id, quoteData);

  // Record in CRM timeline
  await crmCore.recordActivity({
    contactId: id,
    type: 'QUOTE_CREATED',
    title: `Quote created: $${quoteData.premium}/mo`,
    source,
    metadata: {
      quoteId: quote.id,
      coverageType: quoteData.coverageType,
      premium: quoteData.premium,
      carrier: quoteData.carrier,
    },
    isMilestone: true,
  });

  // Move to quoted stage
  await crmCore.updateContact(id, {
    pipelineStage: 'quoted',
    estimatedValue: quoteData.annualPremium,
  }, source);

  res.json({ quote });
});
```

### How AI Agents Use CRM

```typescript
// server/agents/implementations/dialer-agent.ts

import { crmCore } from '../../services/crm-core';

class DialerAgent extends BaseAgent {
  async processLead(lead: Lead) {
    const source: ActivitySource = {
      lounge: 'ai',
      module: 'dialer_agent',
      agentId: this.agentId,
    };

    // Make call via Twilio
    const callResult = await this.makeCall(lead.phone);

    // Record in CRM (every AI action is tracked)
    await crmCore.recordActivity({
      contactId: lead.id,
      type: 'CALL_MADE',
      subtype: callResult.outcome,
      title: `AI Call: ${callResult.outcome}`,
      source,
      metadata: {
        callSid: callResult.sid,
        duration: callResult.duration,
        recording: callResult.recordingUrl,
        transcript: callResult.transcript,
        aiConfidence: callResult.confidence,
      },
      isEngagement: callResult.outcome === 'connected',
    });

    // Update contact
    await crmCore.updateContact(lead.id, {
      lastContactedAt: new Date(),
    }, source);
  }
}
```

### How Finance Lounge Uses CRM

```typescript
// server/routes/finance/commissions.ts

import { crmCore } from '../../services/crm-core';

router.post('/policies/:id/commission', async (req, res) => {
  const { policyId } = req.params;
  const { amount, type } = req.body;

  // Get the contact associated with this policy
  const policy = await getPolicy(policyId);

  const source: ActivitySource = {
    lounge: 'finance',
    module: 'commission_calculator',
    userId: req.user?.id,
  };

  // Calculate and record commission
  const commission = await calculateCommission(policy, amount, type);

  // Record in CRM timeline
  await crmCore.recordActivity({
    contactId: policy.contactId,
    type: 'COMMISSION_CALCULATED',
    title: `Commission: $${commission.amount}`,
    source,
    metadata: {
      policyId,
      commissionAmount: commission.amount,
      commissionType: type,
      agentId: policy.agentId,
    },
  });

  // Update lifetime value
  await pool.query(`
    UPDATE contact_financial_data
    SET total_commissions_generated = total_commissions_generated + $1
    WHERE contact_id = $2
  `, [commission.amount, policy.contactId]);

  res.json({ commission });
});
```

### How Marketing Lounge Uses CRM

```typescript
// server/routes/marketing/campaigns.ts

import { crmCore } from '../../services/crm-core';

router.post('/campaigns/:id/send', async (req, res) => {
  const { campaignId } = req.params;

  const campaign = await getCampaign(campaignId);

  // Get contacts from CRM segment
  const contacts = await crmCore.getSegment(campaign.segmentId);

  const source: ActivitySource = {
    lounge: 'marketing',
    module: 'email_campaign',
    userId: req.user.id,
  };

  // Send to each contact and record
  for (const contact of contacts) {
    await sendEmail(contact, campaign);

    // Record in CRM
    await crmCore.recordActivity({
      contactId: contact.id,
      type: 'EMAIL_SENT',
      subtype: 'campaign',
      title: `Campaign: ${campaign.name}`,
      source,
      metadata: {
        campaignId,
        subject: campaign.subject,
        templateId: campaign.templateId,
      },
    });
  }

  res.json({ sent: contacts.length });
});

// Webhook for email opens
router.post('/webhooks/email-opened', async (req, res) => {
  const { contactId, campaignId } = req.body;

  await crmCore.recordActivity({
    contactId,
    type: 'EMAIL_OPENED',
    title: 'Email opened',
    source: {
      lounge: 'marketing',
      module: 'email_tracking',
    },
    metadata: { campaignId },
    isEngagement: true,
  });

  // Update engagement score
  await crmCore.updateContact(contactId, {
    engagementScore: sql`engagement_score + 5`,
  }, { lounge: 'marketing' });

  res.json({ ok: true });
});
```

---

## Event Flow Architecture

### CRM Events (Emitted by Hub)

```typescript
// Events that CRM emits for other systems to react to

interface CRMEvents {
  // Contact events
  CRM_CONTACT_CREATED: { contact: Contact; source: ActivitySource };
  CRM_CONTACT_UPDATED: { contact: Contact; changes: Partial<Contact>; source: ActivitySource };
  CRM_CONTACT_DELETED: { contactId: string; source: ActivitySource };

  // Lifecycle events
  CRM_LIFECYCLE_CHANGED: { contact: Contact; oldStage: string; newStage: string; source: ActivitySource };
  CRM_LEAD_CONVERTED: { contact: Contact; source: ActivitySource };

  // Activity events
  CRM_ACTIVITY_RECORDED: { activity: Activity };

  // Relationship events
  CRM_RELATIONSHIP_CREATED: { contactId: string; relatedContactId: string; type: string };

  // Score events
  CRM_SCORE_UPDATED: { contactId: string; oldScore: number; newScore: number; tier: string };
}
```

### Lounge Event Subscriptions

```typescript
// server/services/crm-core/event-handlers.ts

import { eventBus } from '../core/event-bus';
import { crmCore } from './index';

/**
 * CRM subscribes to events from ALL lounges
 * This is how the hub stays in sync
 */
export function setupCRMEventHandlers() {
  // === AGENT LOUNGE EVENTS ===

  eventBus.on('APPOINTMENT_BOOKED', async (data) => {
    await crmCore.recordActivity({
      contactId: data.leadId,
      type: 'APPOINTMENT_SCHEDULED',
      title: `Appointment: ${data.appointmentType}`,
      source: { lounge: 'agent', module: 'appointment_scheduler' },
      metadata: data,
      isMilestone: true,
    });
  });

  eventBus.on('POLICY_SOLD', async (data) => {
    // Transition to client
    await crmCore.transitionLifecycle(
      data.contactId,
      'client',
      { lounge: 'agent', module: 'sales' },
      `Policy sold: ${data.policyNumber}`
    );

    // Record milestone
    await crmCore.recordActivity({
      contactId: data.contactId,
      type: 'DEAL_WON',
      title: `Policy sold: $${data.premium}/mo`,
      source: { lounge: 'agent', module: 'sales' },
      metadata: data,
      isMilestone: true,
    });
  });

  // === AI LOUNGE EVENTS ===

  eventBus.on('AI_CALL_COMPLETED', async (data) => {
    await crmCore.recordActivity({
      contactId: data.leadId,
      type: 'CALL_MADE',
      subtype: data.outcome,
      title: `AI Call: ${data.outcome}`,
      source: { lounge: 'ai', agentId: data.agentId },
      metadata: data,
      isEngagement: data.outcome === 'connected',
    });
  });

  eventBus.on('LEAD_SCORED', async (data) => {
    await crmCore.updateContact(data.leadId, {
      leadScore: data.score,
      scoreTier: data.tier,
    }, { lounge: 'ai', agentId: 'lead_scoring_agent' });
  });

  // === MARKETING LOUNGE EVENTS ===

  eventBus.on('FORM_SUBMITTED', async (data) => {
    // Create or update contact
    let contact = await crmCore.searchContacts({ email: data.email });

    if (!contact) {
      contact = await crmCore.createContact({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      }, { lounge: 'marketing', module: 'web_forms' });
    }

    await crmCore.recordActivity({
      contactId: contact.id,
      type: 'FORM_SUBMITTED',
      title: `Form: ${data.formName}`,
      source: { lounge: 'marketing', module: 'web_forms' },
      metadata: data,
      isEngagement: true,
    });
  });

  // === FINANCE LOUNGE EVENTS ===

  eventBus.on('PAYMENT_RECEIVED', async (data) => {
    await crmCore.recordActivity({
      contactId: data.contactId,
      type: 'PAYMENT_RECEIVED',
      title: `Payment: $${data.amount}`,
      source: { lounge: 'finance', module: 'billing' },
      metadata: data,
    });
  });

  // === SUPPORT LOUNGE EVENTS ===

  eventBus.on('TICKET_CREATED', async (data) => {
    await crmCore.recordActivity({
      contactId: data.contactId,
      type: 'TICKET_CREATED',
      title: `Support ticket: ${data.subject}`,
      source: { lounge: 'support', module: 'helpdesk' },
      metadata: data,
    });
  });
}
```

---

## API Design

### CRM Core APIs (Used by All Lounges)

```typescript
// server/routes/crm-core.ts

/**
 * These APIs are the ONLY way to interact with contact data
 * All lounges use these - they don't query contacts table directly
 */

// === CONTACT CRUD ===
GET    /api/crm/contacts                    // Search/list contacts
GET    /api/crm/contacts/:id                // Get single contact
GET    /api/crm/contacts/:id/profile        // Get full profile with extensions
POST   /api/crm/contacts                    // Create contact
PATCH  /api/crm/contacts/:id                // Update contact
DELETE /api/crm/contacts/:id                // Soft delete

// === ACTIVITY TIMELINE ===
GET    /api/crm/contacts/:id/activities     // Get timeline
POST   /api/crm/contacts/:id/activities     // Record activity
GET    /api/crm/activities                  // Global activity feed

// === RELATIONSHIPS ===
GET    /api/crm/contacts/:id/relationships  // Get relationships
POST   /api/crm/contacts/:id/relationships  // Create relationship
DELETE /api/crm/contacts/:id/relationships/:relId

// === SEGMENTS ===
GET    /api/crm/segments                    // List segments
GET    /api/crm/segments/:id/contacts       // Get contacts in segment
POST   /api/crm/segments                    // Create segment

// === SEARCH ===
POST   /api/crm/search                      // Advanced search

// === BULK OPERATIONS ===
POST   /api/crm/contacts/bulk/update        // Bulk update
POST   /api/crm/contacts/bulk/tag           // Bulk tag
POST   /api/crm/contacts/bulk/assign        // Bulk assign
```

### Example: Search Contacts (Used by All Lounges)

```typescript
// POST /api/crm/search
{
  "query": "john",                    // Full-text search
  "filters": {
    "lifecycleStage": ["lead", "prospect"],
    "scoreTier": ["hot", "on_fire"],
    "tags": ["insurance", "referral"],
    "ownerId": "user-123",
    "createdAfter": "2024-01-01",
    "hasActivity": {
      "type": "email_opened",
      "since": "2024-01-15"
    }
  },
  "sort": {
    "field": "leadScore",
    "order": "desc"
  },
  "pagination": {
    "page": 1,
    "limit": 25
  },
  "include": ["activities", "relationships"]
}
```

---

## Migration Path

### Phase 1: Create CRM Core (Week 1)

1. Create `contact_activities` table
2. Implement `CRMCore` service with basic CRUD
3. Add `recordActivity()` method
4. Setup event handlers for existing EventBus events

### Phase 2: Migrate Agent Lounge (Week 2)

1. Update Agent routes to use `crmCore.recordActivity()`
2. Replace direct DB queries with CRM Core APIs
3. Add `source` metadata to all activities

### Phase 3: Migrate AI Agents (Week 2-3)

1. Update all 37 agents to emit activities to CRM
2. Add `ActivitySource` to agent base class
3. Ensure all lead interactions flow through CRM

### Phase 4: Migrate Other Lounges (Week 3-4)

1. Finance Lounge → record payment/commission events
2. Marketing Lounge → record campaign events
3. Support Lounge → record ticket events

### Phase 5: Build Unified Timeline UI (Week 4)

1. Contact profile with full activity timeline
2. Filter by source lounge
3. Milestone markers
4. Relationship visualization

---

## Benefits of This Architecture

| Benefit | Description |
|---------|-------------|
| **Single Source of Truth** | One contact record, no duplicates |
| **Complete History** | Every interaction from every lounge in one timeline |
| **Audit Trail** | Know exactly who/what touched a contact and when |
| **Cross-Lounge Insights** | See how marketing + sales + AI work together |
| **Better Scoring** | Score based on ALL interactions, not just sales |
| **Easier Debugging** | Trace any issue through unified timeline |
| **Compliance** | Full activity log for regulatory requirements |

---

## Summary

The CRM Central Hub architecture transforms CRM from "just another lounge" into the **nervous system** of the entire platform. Every contact interaction, from every lounge, flows through CRM and is recorded in a unified timeline.

**Key Changes:**
1. `CRMCore` service becomes THE way to interact with contacts
2. All lounges write activities via `recordActivity()`
3. EventBus integration ensures real-time sync
4. Activity timeline shows complete contact history
5. Relationships track how contacts connect

This is how enterprise CRMs like Salesforce and HubSpot work - they're the hub that all other tools plug into.
