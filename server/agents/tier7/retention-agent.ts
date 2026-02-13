/**
 * RETENTION_AGENT
 * Renewal reminders, churn prediction, re-engagement campaigns,
 * lapse recovery, upsell triggers. Emits CLIENT_RETAINED.
 */

import {
  BaseAgent, EventType, AgentEvent,
  memoryGraph, NodeType, EdgeType, ClientData, PolicyData,
  analyticsLedger, MetricType,
  securityLayer, Permission,
} from '../core';

interface RetentionScore {
  clientId: string;
  score: number; // 0-100, higher = more likely to retain
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  recommendedActions: string[];
  lastCalculatedAt: number;
}

interface RenewalReminder {
  clientId: string;
  policyId: string;
  renewalDate: number;
  remindersSent: number;
  maxReminders: number;
  nextReminderAt: number;
}

const CHURN_RISK_WEIGHTS: Record<string, number> = {
  missed_payment: -20,
  lapsed_policy: -35,
  support_complaint: -15,
  negative_sentiment: -10,
  no_contact_60d: -12,
  no_contact_90d: -20,
  low_engagement: -8,
  multiple_policies: 15,
  high_ltv: 10,
  long_tenure: 12,
  referral_given: 8,
  recent_positive_interaction: 10,
};

export class RetentionAgent extends BaseAgent {
  private retentionCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    super({
      id: 'retention',
      name: 'RETENTION_AGENT',
      tier: 7,
      description: 'Churn prediction, renewal reminders, re-engagement, lapse recovery',
      capabilities: ['churn_prediction', 'renewal_reminders', 're_engagement', 'lapse_recovery', 'upsell_triggers'],
      consumesEvents: [
        EventType.PAYMENT_PROCESSED, EventType.SUPPORT_RESOLVED,
        EventType.POLICY_SOLD, EventType.CLAIM_STATUS_UPDATED,
      ],
      producesEvents: [EventType.CLIENT_RETAINED],
    });
  }

  protected async onStart(): Promise<void> {
    securityLayer.registerAgent(this.id, [
      Permission.READ_CLIENTS, Permission.READ_POLICIES, Permission.SEND_EMAIL, Permission.SEND_SMS,
    ]);
    // Run retention analysis every 6 hours
    this.retentionCheckInterval = setInterval(() => this.runRetentionAnalysis(), 6 * 60 * 60 * 1000);
  }

  protected async onStop(): Promise<void> {
    if (this.retentionCheckInterval) { clearInterval(this.retentionCheckInterval); this.retentionCheckInterval = null; }
  }

  protected async handleEvent(event: AgentEvent): Promise<void> {
    switch (event.type) {
      case EventType.PAYMENT_PROCESSED:
        if (event.payload.status === 'lapsed' || event.payload.status === 'grace_period_expired') {
          await this.handleLapse(event.payload.clientId, event.payload.policyId);
        }
        break;
      case EventType.SUPPORT_RESOLVED:
        // After support resolution, recalculate retention score
        await this.calculateRetentionScore(event.payload.clientId);
        break;
      case EventType.POLICY_SOLD:
        // New policy = upsell opportunity check for related products
        await this.checkUpsellOpportunity(event.payload.leadId);
        break;
    }
  }

  private async calculateRetentionScore(clientId: string): Promise<RetentionScore> {
    const clientNode = this.memory.getNode<ClientData>(clientId);
    let score = 70; // Base score
    const factors: string[] = [];
    const actions: string[] = [];

    if (clientNode) {
      const client = clientNode.data;

      // Tenure bonus
      const tenureMonths = (Date.now() - clientNode.createdAt) / (30 * 24 * 60 * 60 * 1000);
      if (tenureMonths > 24) { score += CHURN_RISK_WEIGHTS.long_tenure; factors.push('Long-term client'); }

      // Multi-policy bonus
      const policies = this.memory.getRelated(clientId, EdgeType.HAS_POLICY);
      if (policies.length > 1) { score += CHURN_RISK_WEIGHTS.multiple_policies; factors.push(`${policies.length} policies`); }

      // LTV
      if (client.lifetimeValue > 5000) { score += CHURN_RISK_WEIGHTS.high_ltv; factors.push('High LTV'); }

      // Contact recency
      const lastContact = client.lastInteractionAt || clientNode.updatedAt;
      const daysSinceContact = (Date.now() - lastContact) / (24 * 60 * 60 * 1000);
      if (daysSinceContact > 90) {
        score += CHURN_RISK_WEIGHTS.no_contact_90d;
        factors.push('No contact in 90+ days');
        actions.push('Schedule courtesy check-in call');
      } else if (daysSinceContact > 60) {
        score += CHURN_RISK_WEIGHTS.no_contact_60d;
        factors.push('No contact in 60+ days');
        actions.push('Send engagement email');
      }

      // Payment history
      const payments = this.memory.getRelated(clientId, EdgeType.HAS_PAYMENT);
      const failedPayments = payments.filter(p => p.data.status === 'failed' || p.data.status === 'lapsed');
      if (failedPayments.length > 0) {
        score += CHURN_RISK_WEIGHTS.missed_payment * failedPayments.length;
        factors.push(`${failedPayments.length} missed payment(s)`);
        actions.push('Contact about payment method update');
      }

      // Support tickets
      const tickets = this.memory.getRelated(clientId, EdgeType.RELATED_TO)
        .filter(n => n.tags.includes('support'));
      const complaints = tickets.filter(t => t.data.sentiment === 'negative' || t.data.sentiment === 'angry');
      if (complaints.length > 0) {
        score += CHURN_RISK_WEIGHTS.support_complaint * complaints.length;
        factors.push(`${complaints.length} support complaint(s)`);
        actions.push('Manager follow-up call recommended');
      }
    }

    score = Math.max(0, Math.min(100, score));
    const riskLevel: RetentionScore['riskLevel'] =
      score >= 70 ? 'low' : score >= 50 ? 'medium' : score >= 30 ? 'high' : 'critical';

    // Low score actions
    if (riskLevel === 'critical') {
      actions.push('Immediate personal outreach from agency owner');
      actions.push('Offer policy review and potential discount');
    } else if (riskLevel === 'high') {
      actions.push('Schedule annual policy review');
      actions.push('Send personalized re-engagement campaign');
    }

    const retentionScore: RetentionScore = {
      clientId, score, riskLevel, factors, recommendedActions: actions,
      lastCalculatedAt: Date.now(),
    };

    // Store
    this.memory.addNode(NodeType.DOCUMENT, {
      type: 'retention_score', ...retentionScore,
    }, this.id, ['retention', riskLevel]);

    if (riskLevel === 'critical' || riskLevel === 'high') {
      this.emit(EventType.CLIENT_RETAINED, {
        clientId, retentionScore: score, riskLevel,
        action: 're_engagement_triggered', factors, recommendedActions: actions,
      }, { metadata: { tier: 7, priority: riskLevel === 'critical' ? 'critical' : 'high' } });
    }

    analyticsLedger.record(
      score >= 50 ? MetricType.CLIENT_RETAINED : MetricType.CLIENT_CHURNED,
      1, this.id, { entityId: clientId, metadata: { score, riskLevel } }
    );

    return retentionScore;
  }

  private async handleLapse(clientId: string, policyId: string): Promise<void> {
    console.log(`[RETENTION] 🚨 Lapse detected for client ${clientId} policy ${policyId}`);

    const score = await this.calculateRetentionScore(clientId);

    // Trigger lapse recovery campaign
    this.emit(EventType.CLIENT_RETAINED, {
      clientId, policyId,
      action: 'lapse_recovery_initiated',
      retentionScore: score.score,
      riskLevel: score.riskLevel,
      campaign: 'lapse_recovery',
    }, { metadata: { tier: 7, priority: 'critical' } });
  }

  private async checkUpsellOpportunity(clientId: string): Promise<void> {
    const policies = this.memory.getRelated(clientId, EdgeType.HAS_POLICY)
      .filter(n => n.type === NodeType.POLICY);
    const existingTypes = new Set(policies.map(p => (p.data as PolicyData).type));

    const opportunities: string[] = [];
    if (!existingTypes.has('final_expense')) opportunities.push('final_expense');
    if (!existingTypes.has('iul') && existingTypes.has('term_life')) opportunities.push('iul');
    if (!existingTypes.has('annuity') && policies.length >= 2) opportunities.push('annuity');

    if (opportunities.length > 0) {
      this.emit(EventType.CLIENT_RETAINED, {
        clientId, action: 'upsell_opportunity',
        opportunities, existingPolicies: policies.length,
      });
      console.log(`[RETENTION] 💡 Upsell opportunities for ${clientId}: ${opportunities.join(', ')}`);
    }
  }

  private async runRetentionAnalysis(): Promise<void> {
    const clients = this.memory.getNodesByType<ClientData>(NodeType.CLIENT);
    let atRisk = 0;

    for (const client of clients) {
      const score = await this.calculateRetentionScore(client.id);
      if (score.riskLevel === 'high' || score.riskLevel === 'critical') atRisk++;
    }

    if (clients.length > 0) {
      console.log(`[RETENTION] 📊 Analysis complete: ${clients.length} clients | ${atRisk} at risk (${Math.round(atRisk / clients.length * 100)}%)`);
    }
  }
}
