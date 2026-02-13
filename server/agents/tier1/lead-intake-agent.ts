/**
 * LEAD_INTAKE_AGENT
 * Deduplicates, normalizes formats, tags source & cost.
 */

import { BaseAgent, EventType, AgentEvent, memoryGraph, LeadData } from '../core';

export class LeadIntakeAgent extends BaseAgent {
  constructor() {
    super({
      id: 'lead-intake',
      name: 'LEAD_INTAKE_AGENT',
      tier: 1,
      description: 'Deduplicates, normalizes, and prepares leads for scoring',
      capabilities: ['deduplication', 'normalization', 'source_tagging'],
      consumesEvents: [EventType.LEAD_ENRICHED],
      producesEvents: [EventType.LEAD_READY_FOR_SCORING],
    });
  }

  protected async onStart(): Promise<void> {}
  protected async onStop(): Promise<void> {}

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.LEAD_ENRICHED) {
      await this.processLead(event.payload.leadId, event);
    }
  }

  private async processLead(leadId: string, sourceEvent: AgentEvent): Promise<void> {
    const node = this.memory.getNode<LeadData>(leadId);
    if (!node) return;

    // Normalize data
    const normalized: Partial<LeadData> = {};

    if (node.data.firstName) {
      normalized.firstName = this.titleCase(node.data.firstName.trim());
    }
    if (node.data.lastName) {
      normalized.lastName = this.titleCase(node.data.lastName.trim());
    }
    if (node.data.email) {
      normalized.email = node.data.email.toLowerCase().trim();
    }
    if (node.data.phone) {
      normalized.phone = this.normalizePhone(node.data.phone);
    }
    if (node.data.state) {
      normalized.state = node.data.state.toUpperCase().trim();
    }

    // Update stage
    normalized.stage = 'enriched';

    this.memory.updateNode(leadId, normalized, this.id);

    // Emit ready for scoring
    this.emit(EventType.LEAD_READY_FOR_SCORING, {
      leadId,
      normalized: true,
      qualityScore: sourceEvent.payload.qualityScore,
    }, {
      correlationId: sourceEvent.correlationId || sourceEvent.id,
      causationId: sourceEvent.id,
    });

    console.log(`[LEAD_INTAKE] ✅ Lead ${leadId} normalized and ready for scoring`);
  }

  private titleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    );
  }

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits[0] === '1') return `+${digits}`;
    return `+${digits}`;
  }
}
