/**
 * EMAIL_OUTREACH_AGENT
 * Personalized email sequences with behavioral triggers.
 */

import { BaseAgent, EventType, AgentEvent, memoryGraph, LeadData, knowledgeBase, analyticsLedger, MetricType } from '../core';

interface EmailSequence {
  leadId: string;
  templateIds: string[];
  currentStep: number;
  status: 'active' | 'paused' | 'completed' | 'responded';
  sentEmails: Array<{
    templateId: string;
    sentAt: number;
    opened: boolean;
    clicked: boolean;
    openedAt?: number;
    clickedAt?: number;
  }>;
}

export class EmailOutreachAgent extends BaseAgent {
  private sequences: Map<string, EmailSequence> = new Map();

  constructor() {
    super({
      id: 'email-outreach',
      name: 'EMAIL_OUTREACH_AGENT',
      tier: 2,
      description: 'Personalized email sequences with behavioral triggers',
      capabilities: ['email_personalization', 'sequence_management', 'open_tracking', 'click_tracking'],
      consumesEvents: [EventType.LEAD_SCORED, EventType.CONTENT_CREATED],
      producesEvents: [EventType.EMAIL_ENGAGED],
    });
  }

  protected async onStart(): Promise<void> {}
  protected async onStop(): Promise<void> {}

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.LEAD_SCORED) {
      const { leadId, recommendedPath } = event.payload;
      if (['email_sequence', 'nurture_drip', 'priority_outreach'].includes(recommendedPath)) {
        await this.startSequence(leadId);
      }
    }
  }

  async startSequence(leadId: string): Promise<void> {
    const node = this.memory.getNode<LeadData>(leadId);
    if (!node || !node.data.email) return;

    const templates = knowledgeBase.getEmailTemplatesByType('drip');
    const templateIds = templates.map((t) => t.id);

    if (templateIds.length === 0) {
      // Use default sequence
      templateIds.push('welcome', 'follow_up_1', 'follow_up_2');
    }

    this.sequences.set(leadId, {
      leadId,
      templateIds,
      currentStep: 0,
      status: 'active',
      sentEmails: [],
    });

    await this.sendNextEmail(leadId);
  }

  private async sendNextEmail(leadId: string): Promise<void> {
    const sequence = this.sequences.get(leadId);
    if (!sequence || sequence.status !== 'active') return;
    if (sequence.currentStep >= sequence.templateIds.length) {
      sequence.status = 'completed';
      return;
    }

    const node = this.memory.getNode<LeadData>(leadId);
    if (!node) return;

    const templateId = sequence.templateIds[sequence.currentStep];

    // Personalize email
    const email = this.personalizeEmail(templateId, node.data);

    // In production: send via email service (SendGrid, SES, etc.)
    console.log(`[EMAIL_OUTREACH] 📧 Sending email to ${node.data.email}: "${email.subject}"`);

    sequence.sentEmails.push({
      templateId,
      sentAt: Date.now(),
      opened: false,
      clicked: false,
    });
    sequence.currentStep++;

    analyticsLedger.record(MetricType.OUTREACH_EMAIL_SENT, 1, this.id, { entityId: leadId });
  }

  private personalizeEmail(templateId: string, lead: LeadData): { subject: string; body: string } {
    const template = knowledgeBase.getEmailTemplate(templateId);

    if (template) {
      return {
        subject: this.interpolate(template.subject, lead),
        body: this.interpolate(template.body, lead),
      };
    }

    // Fallback templates
    const defaults: Record<string, { subject: string; body: string }> = {
      welcome: {
        subject: `${lead.firstName}, your coverage options are ready`,
        body: `Hi ${lead.firstName},\n\nThank you for your interest in protecting your family's future. I've put together some personalized coverage options based on your needs.\n\nWould you like to schedule a quick 15-minute call to review them?\n\nBest regards`,
      },
      follow_up_1: {
        subject: `${lead.firstName}, quick question about your coverage`,
        body: `Hi ${lead.firstName},\n\nI wanted to follow up on the coverage information I sent. Many families in ${lead.state || 'your area'} are finding that the right coverage is more affordable than they expected.\n\nDo you have 5 minutes this week to chat?`,
      },
      follow_up_2: {
        subject: `Last chance: Your personalized quote expires soon`,
        body: `Hi ${lead.firstName},\n\nI don't want you to miss out on the rates I quoted for you. Health-based pricing means today's rate is the best you'll get.\n\nLet me know if you have any questions — I'm here to help, not pressure.`,
      },
    };

    return defaults[templateId] || defaults.welcome;
  }

  private interpolate(text: string, lead: LeadData): string {
    return text
      .replace(/\{\{firstName\}\}/g, lead.firstName || '')
      .replace(/\{\{lastName\}\}/g, lead.lastName || '')
      .replace(/\{\{state\}\}/g, lead.state || '')
      .replace(/\{\{coverageType\}\}/g, lead.coverageType || 'life insurance')
      .replace(/\{\{coverageAmount\}\}/g, lead.coverageAmount || '');
  }

  // ─── Tracking callbacks ────────────────────────────────────
  recordOpen(leadId: string): void {
    const sequence = this.sequences.get(leadId);
    if (!sequence) return;
    const lastEmail = sequence.sentEmails[sequence.sentEmails.length - 1];
    if (lastEmail) {
      lastEmail.opened = true;
      lastEmail.openedAt = Date.now();
      analyticsLedger.record(MetricType.OUTREACH_EMAIL_OPENED, 1, this.id, { entityId: leadId });
    }
  }

  recordClick(leadId: string): void {
    const sequence = this.sequences.get(leadId);
    if (!sequence) return;
    const lastEmail = sequence.sentEmails[sequence.sentEmails.length - 1];
    if (lastEmail) {
      lastEmail.clicked = true;
      lastEmail.clickedAt = Date.now();
      analyticsLedger.record(MetricType.OUTREACH_EMAIL_CLICKED, 1, this.id, { entityId: leadId });

      this.emit(EventType.EMAIL_ENGAGED, {
        leadId,
        action: 'clicked',
        templateId: lastEmail.templateId,
      });
    }
  }

  getSequenceStatus(leadId: string): EmailSequence | undefined {
    return this.sequences.get(leadId);
  }
}
