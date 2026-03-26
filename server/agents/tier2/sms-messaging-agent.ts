/**
 * SMS_MESSAGING_AGENT
 * Two-way SMS with intent detection and follow-up logic.
 */

import { BaseAgent, EventType, AgentEvent, memoryGraph, LeadData, analyticsLedger, MetricType } from '../core';
import { sendSms, isSmsAvailable } from '../../services/smsService';

export class SmsMessagingAgent extends BaseAgent {
  private conversations: Map<string, Array<{ direction: 'out' | 'in'; text: string; at: number }>> = new Map();

  constructor() {
    super({
      id: 'sms-messaging',
      name: 'SMS_MESSAGING_AGENT',
      tier: 2,
      description: 'Two-way SMS with intent detection',
      capabilities: ['sms_send', 'sms_receive', 'intent_detection', 'auto_reply'],
      consumesEvents: [EventType.LEAD_SCORED],
      producesEvents: [EventType.SMS_RESPONSE_RECEIVED],
    });
  }

  protected async onStart(): Promise<void> {}
  protected async onStop(): Promise<void> {}

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.LEAD_SCORED) {
      const { leadId, recommendedPath } = event.payload;
      if (['immediate_call', 'priority_outreach'].includes(recommendedPath)) {
        await this.sendInitialSms(leadId);
      }
    }
  }

  async sendInitialSms(leadId: string): Promise<void> {
    const node = this.memory.getNode<LeadData>(leadId);
    if (!node || !node.data.phone) return;

    const message = `Hi ${node.data.firstName}! This is your insurance advisor. I have your personalized ${node.data.coverageType || 'coverage'} quote ready. When's a good time for a quick 5-min call? Reply CALL for immediate callback or TIME to schedule.`;

    await this.sendSms(leadId, node.data.phone, message);
  }

  async sendSms(leadId: string, phone: string, message: string): Promise<void> {
    if (isSmsAvailable()) {
      try {
        await sendSms(phone, message);
        console.log(`[SMS] Sent to ${phone}: ${message.substring(0, 60)}...`);
      } catch (error: any) {
        console.error(`[SMS] Failed to send to ${phone}:`, error?.message || error);
      }
    } else {
      console.warn(`[SMS] Telnyx not configured, skipping send to ${phone}`);
    }

    if (!this.conversations.has(leadId)) {
      this.conversations.set(leadId, []);
    }
    this.conversations.get(leadId)!.push({ direction: 'out', text: message, at: Date.now() });

    analyticsLedger.record(MetricType.OUTREACH_SMS_SENT, 1, this.id, { entityId: leadId });
  }

  // ─── Inbound SMS handler ──────────────────────────────────
  async handleInboundSms(phone: string, message: string): Promise<string | null> {
    const node = this.memory.findByPhone(phone);
    if (!node) return null;

    const leadId = node.id;
    if (!this.conversations.has(leadId)) {
      this.conversations.set(leadId, []);
    }
    this.conversations.get(leadId)!.push({ direction: 'in', text: message, at: Date.now() });

    analyticsLedger.record(MetricType.OUTREACH_SMS_REPLIED, 1, this.id, { entityId: leadId });

    // Intent detection
    const intent = this.detectIntent(message);

    this.emit(EventType.SMS_RESPONSE_RECEIVED, {
      leadId,
      phone,
      message,
      intent,
    });

    // Auto-reply based on intent
    switch (intent) {
      case 'call_request':
        return `Great! I'll call you within the next 5 minutes. Talk soon! 📞`;
      case 'schedule':
        return `Perfect! What day and time works best for you this week?`;
      case 'interested':
        return `Awesome! Let me get your personalized quote finalized. Can I call you in the next 10 minutes?`;
      case 'not_interested':
        return `No problem at all, ${(node.data as LeadData).firstName}. If you ever need coverage in the future, don't hesitate to reach out. Take care! 🙏`;
      case 'stop':
        return null; // Comply with opt-out, no reply
      case 'question':
        return `Great question! Let me look into that and get back to you shortly.`;
      default:
        return `Thanks for your reply! Would you prefer a quick call or more info via text?`;
    }
  }

  private detectIntent(message: string): string {
    const lower = message.toLowerCase().trim();

    if (['stop', 'unsubscribe', 'opt out', 'remove'].some((w) => lower.includes(w))) return 'stop';
    if (['call', 'call me', 'ring', 'phone'].some((w) => lower.includes(w))) return 'call_request';
    if (['schedule', 'time', 'when', 'tomorrow', 'today', 'this week'].some((w) => lower.includes(w))) return 'schedule';
    if (['yes', 'yeah', 'interested', 'sure', 'ok', 'lets do it', "let's go"].some((w) => lower.includes(w))) return 'interested';
    if (['no', 'not interested', 'pass', 'no thanks'].some((w) => lower.includes(w))) return 'not_interested';
    if (['?', 'how', 'what', 'why', 'much', 'cost', 'price'].some((w) => lower.includes(w))) return 'question';

    return 'unknown';
  }
}
