/**
 * LEAD_DISCOVERY_AGENT
 * Continuously discovers new leads via web, lists, referrals, social signals.
 */

import { BaseAgent, EventType, AgentEvent, NodeType, memoryGraph } from '../core';

export class LeadDiscoveryAgent extends BaseAgent {
  constructor() {
    super({
      id: 'lead-discovery',
      name: 'LEAD_DISCOVERY_AGENT',
      tier: 1,
      description: 'Discovers new leads from multiple sources',
      capabilities: ['web_scraping', 'list_import', 'referral_tracking', 'social_monitoring'],
      consumesEvents: [EventType.OPTIMIZATION_APPLIED, EventType.AGENT_UPDATED],
      producesEvents: [EventType.RAW_LEAD_CREATED],
    });
  }

  protected async onStart(): Promise<void> {}
  protected async onStop(): Promise<void> {}

  protected async handleEvent(event: AgentEvent): Promise<void> {
    // React to optimization suggestions
  }

  // ─── Public API: Ingest Leads ──────────────────────────────
  async ingestLead(data: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    source: string;
    sourceCost?: number;
    coverageType?: string;
    coverageAmount?: string;
    state?: string;
    zipCode?: string;
    dateOfBirth?: string;
    medicalBackground?: string;
    customFields?: Record<string, any>;
  }): Promise<string> {
    // Check for duplicates in memory graph
    if (data.email) {
      const existing = this.memory.findByEmail(data.email);
      if (existing) {
        console.log(`[LEAD_DISCOVERY] Duplicate lead by email: ${data.email}`);
        return existing.id;
      }
    }
    if (data.phone) {
      const existing = this.memory.findByPhone(data.phone);
      if (existing) {
        console.log(`[LEAD_DISCOVERY] Duplicate lead by phone: ${data.phone}`);
        return existing.id;
      }
    }

    // Create lead node
    const node = this.memory.addNode(
      NodeType.LEAD,
      {
        ...data,
        stage: 'raw',
        heatScore: 0,
        urgency: 'low',
        tags: [data.source],
        createdVia: 'lead_discovery_agent',
      },
      this.id,
      [data.source, data.coverageType || 'unknown']
    );

    // Emit event
    this.emit(EventType.RAW_LEAD_CREATED, {
      leadId: node.id,
      source: data.source,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      coverageType: data.coverageType,
      state: data.state,
    }, {
      metadata: {
        tier: 1,
        priority: 'normal',
      },
    });

    console.log(`[LEAD_DISCOVERY] 🆕 New lead: ${data.firstName} ${data.lastName} from ${data.source}`);
    return node.id;
  }

  // ─── Bulk Import ───────────────────────────────────────────
  async bulkImport(leads: Array<Parameters<LeadDiscoveryAgent['ingestLead']>[0]>): Promise<{
    imported: number;
    duplicates: number;
    errors: number;
  }> {
    let imported = 0, duplicates = 0, errors = 0;

    for (const lead of leads) {
      try {
        const existingByEmail = lead.email ? this.memory.findByEmail(lead.email) : null;
        const existingByPhone = lead.phone ? this.memory.findByPhone(lead.phone) : null;

        if (existingByEmail || existingByPhone) {
          duplicates++;
          continue;
        }

        await this.ingestLead(lead);
        imported++;
      } catch (e) {
        errors++;
      }
    }

    console.log(`[LEAD_DISCOVERY] 📦 Bulk import: ${imported} imported, ${duplicates} dupes, ${errors} errors`);
    return { imported, duplicates, errors };
  }
}
