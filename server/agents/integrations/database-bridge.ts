/**
 * DATABASE BRIDGE
 * Syncs PostgreSQL data with the Agent EventBus.
 * Polls for new entries and emits RAW_LEAD_CREATED events.
 */

import { eventBus, EventType, memoryGraph, NodeType } from '../core';

// Dynamic import to avoid circular dependency
let storage: any = null;

async function getStorage() {
  if (!storage) {
    const module = await import('../../storage');
    storage = module.storage;
  }
  return storage;
}

export class DatabaseBridge {
  private pollInterval: NodeJS.Timeout | null = null;
  private lastQuoteId = 0;
  private lastContactId = 0;
  private isRunning = false;

  async start() {
    if (this.isRunning) return;

    console.log('[DB-BRIDGE] Starting database bridge...');
    this.isRunning = true;

    try {
      // Initial sync of recent data
      await this.syncExistingData();

      // Poll for new entries every 5 seconds
      this.pollInterval = setInterval(() => this.pollForNewEntries(), 5000);

      // Listen for agent events that need DB persistence
      this.listenForPersistenceEvents();

      console.log('[DB-BRIDGE] ✅ Database bridge active');
    } catch (error) {
      console.error('[DB-BRIDGE] ❌ Failed to start:', error);
      this.isRunning = false;
    }
  }

  async stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isRunning = false;
    console.log('[DB-BRIDGE] Stopped');
  }

  private async syncExistingData() {
    const db = await getStorage();

    try {
      // Sync recent quote requests as leads
      const quotes = await db.getQuoteRequests();
      const recentQuotes = quotes.slice(-20); // Last 20

      for (const quote of recentQuotes) {
        this.createLeadNode(quote, 'quote_form');
      }

      if (quotes.length > 0) {
        this.lastQuoteId = Math.max(...quotes.map((q: any) => q.id));
      }
      console.log(`[DB-BRIDGE] Synced ${recentQuotes.length} quote requests`);

      // Sync recent contact messages
      const contacts = await db.getContactMessages();
      const recentContacts = contacts.slice(-20);

      for (const contact of recentContacts) {
        this.createLeadNode(contact, 'contact_form');
      }

      if (contacts.length > 0) {
        this.lastContactId = Math.max(...contacts.map((c: any) => c.id));
      }
      console.log(`[DB-BRIDGE] Synced ${recentContacts.length} contact messages`);
    } catch (error) {
      console.error('[DB-BRIDGE] Error syncing existing data:', error);
    }
  }

  private async pollForNewEntries() {
    if (!this.isRunning) return;

    const db = await getStorage();

    try {
      // Check for new quotes
      const quotes = await db.getQuoteRequests();
      const newQuotes = quotes.filter((q: any) => q.id > this.lastQuoteId);

      for (const quote of newQuotes) {
        console.log(`[DB-BRIDGE] 🆕 New quote detected: ${quote.firstName} ${quote.lastName}`);
        this.emitLeadFromQuote(quote);
        this.lastQuoteId = Math.max(this.lastQuoteId, quote.id);
      }

      // Check for new contacts
      const contacts = await db.getContactMessages();
      const newContacts = contacts.filter((c: any) => c.id > this.lastContactId);

      for (const contact of newContacts) {
        console.log(`[DB-BRIDGE] 🆕 New contact detected: ${contact.firstName} ${contact.lastName}`);
        this.emitLeadFromContact(contact);
        this.lastContactId = Math.max(this.lastContactId, contact.id);
      }
    } catch (error) {
      // Silently handle polling errors
    }
  }

  private createLeadNode(data: any, source: string) {
    const leadId = `${source}-${data.id}`;

    // Check if already exists in memory graph
    const existing = memoryGraph.getNode(leadId);
    if (existing) return;

    memoryGraph.addNode(NodeType.LEAD, {
      id: leadId,
      source,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      createdAt: data.createdAt,
      status: 'new',
    }, 'database-bridge', [source, 'synced']);
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
        line2: quote.addressLine2,
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
    // When a policy is sold, log it
    eventBus.on(EventType.POLICY_SOLD, 'database-bridge', async (event) => {
      console.log('[DB-BRIDGE] 💰 Policy sold:', event.payload);
      // TODO: Persist to policies table when schema is ready
    });

    // When an appointment is booked
    eventBus.on(EventType.APPOINTMENT_BOOKED, 'database-bridge', async (event) => {
      console.log('[DB-BRIDGE] 📅 Appointment booked:', event.payload);
      // TODO: Persist to appointments table when schema is ready
    });

    // When compliance blocks something
    eventBus.on(EventType.COMPLIANCE_BLOCKED, 'database-bridge', async (event) => {
      console.log('[DB-BRIDGE] ⛔ Compliance blocked:', event.payload);
      // Log for audit purposes
    });
  }

  getStats() {
    return {
      isRunning: this.isRunning,
      lastQuoteId: this.lastQuoteId,
      lastContactId: this.lastContactId,
    };
  }
}

export const databaseBridge = new DatabaseBridge();
