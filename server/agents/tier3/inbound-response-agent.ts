/**
 * INBOUND_RESPONSE_AGENT
 * Speed-to-lead: responds < 30 seconds. Answers FAQs. Collects missing info.
 */

import { BaseAgent, EventType, AgentEvent, memoryGraph, LeadData, NodeType, knowledgeBase, analyticsLedger, MetricType } from '../core';

export class InboundResponseAgent extends BaseAgent {
  constructor() {
    super({
      id: 'inbound-response',
      name: 'INBOUND_RESPONSE_AGENT',
      tier: 3,
      description: 'Sub-30-second inbound response, FAQ handling, info collection',
      capabilities: ['instant_response', 'faq_answering', 'info_collection', 'qualification'],
      consumesEvents: [EventType.RAW_LEAD_CREATED],
      producesEvents: [EventType.INBOUND_QUALIFIED],
    });
  }

  protected async onStart(): Promise<void> {}
  protected async onStop(): Promise<void> {}

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.RAW_LEAD_CREATED) {
      // Only handle web-originated leads (inbound)
      const { source } = event.payload;
      if (['web_form', 'chat', 'landing_page', 'website'].includes(source)) {
        await this.handleInbound(event);
      }
    }
  }

  private async handleInbound(event: AgentEvent): Promise<void> {
    const startTime = Date.now();
    const { leadId } = event.payload;
    const node = this.memory.getNode<LeadData>(leadId);
    if (!node) return;

    // Determine what info is missing
    const missing = this.identifyMissingInfo(node.data);

    // Generate qualification response
    const qualification = this.qualifyLead(node.data);

    // Record response time
    const responseTime = Date.now() - startTime;
    analyticsLedger.record(MetricType.AGENT_RESPONSE_TIME, responseTime, this.id, {
      entityId: leadId,
      unit: 'ms',
    });

    // Emit qualified event
    this.emit(EventType.INBOUND_QUALIFIED, {
      leadId,
      missingFields: missing,
      qualification,
      responseTimeMs: responseTime,
      firstName: node.data.firstName,
      lastName: node.data.lastName,
    }, {
      metadata: { tier: 3, priority: 'high' },
      correlationId: event.correlationId || event.id,
      causationId: event.id,
    });

    analyticsLedger.record(MetricType.FUNNEL_LEAD_QUALIFIED, 1, this.id, { entityId: leadId });

    console.log(`[INBOUND_RESPONSE] ⚡ Responded to ${node.data.firstName} in ${responseTime}ms | Missing: ${missing.join(', ') || 'none'}`);
  }

  private identifyMissingInfo(data: LeadData): string[] {
    const missing: string[] = [];
    if (!data.phone) missing.push('phone');
    if (!data.email) missing.push('email');
    if (!data.dateOfBirth) missing.push('dateOfBirth');
    if (!data.state) missing.push('state');
    if (!data.zipCode) missing.push('zipCode');
    if (!data.coverageType) missing.push('coverageType');
    if (!data.coverageAmount) missing.push('coverageAmount');
    if (!data.height) missing.push('height');
    if (!data.weight) missing.push('weight');
    return missing;
  }

  private qualifyLead(data: LeadData): {
    qualified: boolean;
    score: number;
    reason: string;
  } {
    let score = 0;
    if (data.email && data.phone) score += 40;
    else if (data.email || data.phone) score += 20;
    if (data.coverageType) score += 20;
    if (data.dateOfBirth) score += 10;
    if (data.state) score += 10;
    if (data.medicalBackground) score += 10;
    if (data.coverageAmount) score += 10;

    return {
      qualified: score >= 50,
      score,
      reason: score >= 50 ? 'Sufficient info for outreach' : 'Needs more information',
    };
  }
}
