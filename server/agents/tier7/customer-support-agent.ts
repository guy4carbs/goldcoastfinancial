/**
 * CUSTOMER_SUPPORT_AGENT
 * Ticket routing, FAQ matching, sentiment analysis, SLA tracking,
 * escalation rules. Emits SUPPORT_RESOLVED.
 */

import {
  BaseAgent, EventType, AgentEvent,
  memoryGraph, NodeType, EdgeType,
  analyticsLedger, MetricType,
  securityLayer, Permission,
} from '../core';

type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'escalated' | 'resolved' | 'closed';
type Sentiment = 'positive' | 'neutral' | 'negative' | 'angry';

interface SupportTicket {
  ticketId: string;
  clientId: string;
  channel: string;
  category: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  sentiment: Sentiment;
  assignedTo?: string;
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
  slaDeadline: number;
  escalationLevel: number;
  resolution?: string;
}

const SLA_HOURS: Record<TicketPriority, number> = {
  urgent: 1, high: 4, medium: 24, low: 72,
};

const FAQ_DATABASE: Array<{ keywords: string[]; answer: string; category: string }> = [
  { keywords: ['payment', 'pay', 'bill', 'due'], answer: 'Payments can be made online through your client portal, by phone, or by mail. If you need to update your payment method, contact us or use the self-service portal.', category: 'billing' },
  { keywords: ['cancel', 'cancellation'], answer: 'To cancel your policy, please contact your agent directly. Be aware that cancellation may result in loss of coverage and potential surrender charges.', category: 'policy' },
  { keywords: ['beneficiary', 'change beneficiary'], answer: 'You can request a beneficiary change through the client portal or by contacting your agent. The change requires carrier approval and typically takes 5-7 business days.', category: 'policy' },
  { keywords: ['claim', 'file claim', 'death claim'], answer: 'To file a claim, contact us immediately. You will need the policy number, death certificate (for death claims), and claimant identification. We will guide you through every step.', category: 'claims' },
  { keywords: ['premium', 'rate', 'cost', 'price'], answer: 'Your premium is based on your age, health class, coverage amount, and policy type. For a detailed breakdown, check your policy documents in the client portal.', category: 'billing' },
  { keywords: ['coverage', 'how much', 'amount'], answer: 'Your coverage details are available in the client portal. For questions about coverage adequacy, schedule a review with your agent.', category: 'policy' },
  { keywords: ['lapse', 'reinstate', 'expired'], answer: 'If your policy has lapsed, reinstatement may be possible within the grace period. Contact us immediately — the sooner you act, the easier reinstatement is.', category: 'policy' },
];

const NEGATIVE_WORDS = ['angry', 'frustrated', 'terrible', 'worst', 'unacceptable', 'scam', 'lawsuit', 'complaint', 'horrible', 'awful', 'furious', 'disgusted'];
const POSITIVE_WORDS = ['thank', 'great', 'excellent', 'wonderful', 'helpful', 'appreciate', 'happy', 'satisfied', 'amazing'];

export class CustomerSupportAgent extends BaseAgent {
  private slaCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    super({
      id: 'customer-support',
      name: 'CUSTOMER_SUPPORT_AGENT',
      tier: 7,
      description: 'Ticket routing, FAQ matching, sentiment analysis, SLA tracking',
      capabilities: ['ticket_routing', 'faq_matching', 'sentiment_analysis', 'sla_tracking', 'escalation'],
      consumesEvents: [EventType.INBOUND_QUALIFIED, EventType.SMS_RESPONSE_RECEIVED],
      producesEvents: [EventType.SUPPORT_RESOLVED],
    });
  }

  protected async onStart(): Promise<void> {
    securityLayer.registerAgent(this.id, [Permission.READ_CLIENTS, Permission.READ_POLICIES]);
    this.slaCheckInterval = setInterval(() => this.checkSLABreaches(), 5 * 60 * 1000);
  }

  protected async onStop(): Promise<void> {
    if (this.slaCheckInterval) { clearInterval(this.slaCheckInterval); this.slaCheckInterval = null; }
  }

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.INBOUND_QUALIFIED && event.payload.type === 'support') {
      await this.createTicket(event.payload);
    }
  }

  async createTicket(data: {
    clientId: string; channel?: string; subject?: string; description?: string;
  }): Promise<SupportTicket> {
    const description = data.description || '';
    const sentiment = this.analyzeSentiment(description);
    const category = this.categorizeTicket(description);
    const priority = this.determinePriority(sentiment, category);

    // Try FAQ match first
    const faqMatch = this.matchFAQ(description);

    const ticket: SupportTicket = {
      ticketId: `TKT-${Date.now()}`,
      clientId: data.clientId,
      channel: data.channel || 'web',
      category,
      subject: data.subject || `Support request: ${category}`,
      description,
      priority,
      status: faqMatch ? 'resolved' : 'open',
      sentiment,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      slaDeadline: Date.now() + SLA_HOURS[priority] * 60 * 60 * 1000,
      escalationLevel: 0,
      resolution: faqMatch || undefined,
    };

    const node = this.memory.addNode(NodeType.TASK, ticket, this.id, ['support', category, priority]);
    if (data.clientId) {
      this.memory.addEdge(EdgeType.RELATED_TO, data.clientId, node.id, this.id);
    }

    if (faqMatch) {
      analyticsLedger.record(MetricType.AGENT_TASK_COMPLETED, 1, this.id, { metadata: { autoResolved: true } });
      this.emit(EventType.SUPPORT_RESOLVED, {
        ticketId: ticket.ticketId, clientId: data.clientId, category,
        resolution: 'faq_auto_response', responseTime: 0,
      });
      console.log(`[SUPPORT] ✅ Auto-resolved via FAQ: ${category} | ${ticket.ticketId}`);
    } else {
      // Route to appropriate handler
      if (sentiment === 'angry' || priority === 'urgent') {
        ticket.escalationLevel = 1;
        ticket.status = 'escalated';
        this.emit(EventType.HUMAN_REQUIRED, {
          ticketId: ticket.ticketId, clientId: data.clientId,
          reason: sentiment === 'angry' ? 'Angry customer detected' : 'Urgent priority ticket',
          priority: 'high', context: { category, sentiment, description },
        }, { metadata: { tier: 7, priority: 'high' } });
      }
      console.log(`[SUPPORT] 🎫 Ticket created: ${ticket.ticketId} | ${category} | ${priority} | Sentiment: ${sentiment}`);
    }

    return ticket;
  }

  private analyzeSentiment(text: string): Sentiment {
    const lower = text.toLowerCase();
    const negCount = NEGATIVE_WORDS.filter(w => lower.includes(w)).length;
    const posCount = POSITIVE_WORDS.filter(w => lower.includes(w)).length;

    if (negCount >= 3) return 'angry';
    if (negCount > posCount) return 'negative';
    if (posCount > negCount) return 'positive';
    return 'neutral';
  }

  private categorizeTicket(text: string): string {
    const lower = text.toLowerCase();
    if (/claim|death|accident/.test(lower)) return 'claims';
    if (/bill|pay|premium|charge/.test(lower)) return 'billing';
    if (/cancel|lapse|reinstate/.test(lower)) return 'policy_service';
    if (/beneficiary|change|update/.test(lower)) return 'policy_change';
    if (/quote|coverage|new policy/.test(lower)) return 'sales';
    return 'general';
  }

  private determinePriority(sentiment: Sentiment, category: string): TicketPriority {
    if (sentiment === 'angry') return 'urgent';
    if (category === 'claims') return 'high';
    if (category === 'billing' && sentiment === 'negative') return 'high';
    if (category === 'policy_service') return 'medium';
    return 'medium';
  }

  private matchFAQ(text: string): string | null {
    const lower = text.toLowerCase();
    for (const faq of FAQ_DATABASE) {
      const matchCount = faq.keywords.filter(k => lower.includes(k)).length;
      if (matchCount >= 2 || (matchCount >= 1 && lower.length < 50)) {
        return faq.answer;
      }
    }
    return null;
  }

  private async checkSLABreaches(): Promise<void> {
    const tickets = this.memory.getNodesByType<SupportTicket>(NodeType.TASK)
      .filter(n => n.tags.includes('support') && (n.data.status === 'open' || n.data.status === 'in_progress'));

    const now = Date.now();
    for (const t of tickets) {
      if (now > t.data.slaDeadline && t.data.escalationLevel < 3) {
        this.memory.updateNode(t.id, {
          escalationLevel: t.data.escalationLevel + 1,
          status: 'escalated' as const,
        }, this.id);

        this.emit(EventType.HUMAN_REQUIRED, {
          ticketId: t.data.ticketId, clientId: t.data.clientId,
          reason: `SLA breach — ${t.data.priority} ticket overdue by ${Math.round((now - t.data.slaDeadline) / 3600000)}h`,
          priority: 'critical',
        }, { metadata: { tier: 7, priority: 'critical' } });

        console.warn(`[SUPPORT] 🚨 SLA BREACH: ${t.data.ticketId} | Priority: ${t.data.priority} | Escalation level: ${t.data.escalationLevel + 1}`);
      }
    }
  }
}
