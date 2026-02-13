/**
 * OUTREACH_ORCHESTRATION_AGENT
 * Coordinates all outbound across channels. Prevents overlap.
 * Stops outreach once appointment is booked.
 */

import { BaseAgent, EventType, AgentEvent, memoryGraph, LeadData, analyticsLedger, MetricType } from '../core';

interface OutreachPlan {
  leadId: string;
  channels: Array<{
    channel: 'phone' | 'email' | 'sms' | 'social';
    scheduledAt: number;
    status: 'scheduled' | 'sent' | 'responded' | 'cancelled';
    attempts: number;
    maxAttempts: number;
  }>;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: number;
}

export class OutreachOrchestrationAgent extends BaseAgent {
  private plans: Map<string, OutreachPlan> = new Map();

  constructor() {
    super({
      id: 'outreach-orchestration',
      name: 'OUTREACH_ORCHESTRATION_AGENT',
      tier: 2,
      description: 'Coordinates all outbound channels, prevents overlap',
      capabilities: ['channel_coordination', 'cadence_management', 'overlap_prevention'],
      consumesEvents: [
        EventType.LEAD_SCORED,
        EventType.CALL_CONNECTED,
        EventType.CALL_FAILED,
        EventType.EMAIL_ENGAGED,
        EventType.SMS_RESPONSE_RECEIVED,
        EventType.SOCIAL_REPLY_RECEIVED,
        EventType.APPOINTMENT_BOOKED,
      ],
      producesEvents: [EventType.OUTREACH_COMPLETED],
    });
  }

  protected async onStart(): Promise<void> {}
  protected async onStop(): Promise<void> {}

  protected async handleEvent(event: AgentEvent): Promise<void> {
    switch (event.type) {
      case EventType.LEAD_SCORED:
        await this.createOutreachPlan(event);
        break;
      case EventType.APPOINTMENT_BOOKED:
        this.cancelOutreach(event.payload.leadId, 'appointment_booked');
        break;
      case EventType.CALL_CONNECTED:
      case EventType.EMAIL_ENGAGED:
      case EventType.SMS_RESPONSE_RECEIVED:
      case EventType.SOCIAL_REPLY_RECEIVED:
        this.handleResponse(event);
        break;
      case EventType.CALL_FAILED:
        this.handleFailure(event);
        break;
    }
  }

  private async createOutreachPlan(event: AgentEvent): Promise<void> {
    const { leadId, heatScore, urgency, recommendedPath } = event.payload;

    // Don't create duplicate plans
    if (this.plans.has(leadId)) return;

    const node = this.memory.getNode<LeadData>(leadId);
    if (!node) return;

    const plan: OutreachPlan = {
      leadId,
      channels: [],
      status: 'active',
      createdAt: Date.now(),
    };

    const now = Date.now();

    // Build channel sequence based on score and recommended path
    switch (recommendedPath) {
      case 'immediate_call':
        plan.channels.push(
          { channel: 'phone', scheduledAt: now, status: 'scheduled', attempts: 0, maxAttempts: 3 },
          { channel: 'sms', scheduledAt: now + 300000, status: 'scheduled', attempts: 0, maxAttempts: 2 },
          { channel: 'email', scheduledAt: now + 600000, status: 'scheduled', attempts: 0, maxAttempts: 3 },
        );
        break;
      case 'priority_outreach':
        plan.channels.push(
          { channel: 'sms', scheduledAt: now, status: 'scheduled', attempts: 0, maxAttempts: 2 },
          { channel: 'phone', scheduledAt: now + 900000, status: 'scheduled', attempts: 0, maxAttempts: 3 },
          { channel: 'email', scheduledAt: now + 1800000, status: 'scheduled', attempts: 0, maxAttempts: 3 },
        );
        break;
      case 'email_sequence':
        plan.channels.push(
          { channel: 'email', scheduledAt: now, status: 'scheduled', attempts: 0, maxAttempts: 5 },
          { channel: 'sms', scheduledAt: now + 86400000, status: 'scheduled', attempts: 0, maxAttempts: 2 },
        );
        break;
      case 'nurture_drip':
        plan.channels.push(
          { channel: 'email', scheduledAt: now, status: 'scheduled', attempts: 0, maxAttempts: 7 },
        );
        break;
      default:
        plan.channels.push(
          { channel: 'email', scheduledAt: now + 3600000, status: 'scheduled', attempts: 0, maxAttempts: 3 },
        );
    }

    this.plans.set(leadId, plan);

    // Update lead stage
    this.memory.updateNode(leadId, { stage: 'contacted' as const }, this.id);

    // Record metric
    analyticsLedger.record(MetricType.FUNNEL_LEAD_CONTACTED, 1, this.id, { entityId: leadId });

    console.log(`[OUTREACH_ORCH] 📋 Plan created for ${node.data.firstName} ${node.data.lastName} | Path: ${recommendedPath} | Channels: ${plan.channels.map(c => c.channel).join(', ')}`);
  }

  private cancelOutreach(leadId: string, reason: string): void {
    const plan = this.plans.get(leadId);
    if (plan) {
      plan.status = 'cancelled';
      plan.channels.forEach((c) => {
        if (c.status === 'scheduled') c.status = 'cancelled';
      });
      console.log(`[OUTREACH_ORCH] 🛑 Outreach cancelled for ${leadId}: ${reason}`);
    }
  }

  private handleResponse(event: AgentEvent): void {
    const leadId = event.payload.leadId;
    const plan = this.plans.get(leadId);
    if (plan) {
      // Mark channel as responded
      const channel = plan.channels.find(
        (c) => c.channel === this.eventToChannel(event.type)
      );
      if (channel) channel.status = 'responded';

      // Check if outreach is complete
      const allDone = plan.channels.every(
        (c) => c.status !== 'scheduled'
      );
      if (allDone) {
        plan.status = 'completed';
        this.emit(EventType.OUTREACH_COMPLETED, { leadId, plan });
      }
    }
  }

  private handleFailure(event: AgentEvent): void {
    const leadId = event.payload.leadId;
    const plan = this.plans.get(leadId);
    if (plan) {
      const channel = plan.channels.find((c) => c.channel === 'phone');
      if (channel) {
        channel.attempts++;
        if (channel.attempts >= channel.maxAttempts) {
          channel.status = 'cancelled';
        }
      }
    }
  }

  private eventToChannel(type: EventType): string {
    switch (type) {
      case EventType.CALL_CONNECTED:
      case EventType.CALL_FAILED: return 'phone';
      case EventType.EMAIL_ENGAGED: return 'email';
      case EventType.SMS_RESPONSE_RECEIVED: return 'sms';
      case EventType.SOCIAL_REPLY_RECEIVED: return 'social';
      default: return 'unknown';
    }
  }

  // ─── Public API ────────────────────────────────────────────
  getActivePlans(): Array<OutreachPlan & { leadName?: string }> {
    return Array.from(this.plans.values())
      .filter((p) => p.status === 'active')
      .map((p) => {
        const node = this.memory.getNode<LeadData>(p.leadId);
        return {
          ...p,
          leadName: node ? `${node.data.firstName} ${node.data.lastName}` : undefined,
        };
      });
  }

  getPlanForLead(leadId: string): OutreachPlan | undefined {
    return this.plans.get(leadId);
  }
}
