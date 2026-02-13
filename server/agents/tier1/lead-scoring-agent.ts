/**
 * LEAD_SCORING_AGENT
 * Predictive intent modeling. Assigns heat score, urgency, recommended path.
 */

import { BaseAgent, EventType, AgentEvent, memoryGraph, LeadData, knowledgeBase } from '../core';

interface ScoringWeights {
  hasEmail: number;
  hasPhone: number;
  hasDOB: number;
  hasAddress: number;
  coverageSpecified: number;
  incomeAboveMedian: number;
  ageInRange: number;
  recentInquiry: number;
  multipleProducts: number;
  highValueProduct: number;
}

export class LeadScoringAgent extends BaseAgent {
  private weights: ScoringWeights = {
    hasEmail: 10,
    hasPhone: 15,
    hasDOB: 5,
    hasAddress: 5,
    coverageSpecified: 15,
    incomeAboveMedian: 10,
    ageInRange: 10,
    recentInquiry: 15,
    multipleProducts: 5,
    highValueProduct: 10,
  };

  constructor() {
    super({
      id: 'lead-scoring',
      name: 'LEAD_SCORING_AGENT',
      tier: 1,
      description: 'Predictive lead scoring with intent modeling',
      capabilities: ['scoring', 'intent_prediction', 'path_recommendation'],
      consumesEvents: [EventType.LEAD_READY_FOR_SCORING, EventType.OPTIMIZATION_APPLIED],
      producesEvents: [EventType.LEAD_SCORED],
    });
  }

  protected async onStart(): Promise<void> {}
  protected async onStop(): Promise<void> {}

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.LEAD_READY_FOR_SCORING) {
      await this.scoreLead(event.payload.leadId, event);
    }
    if (event.type === EventType.OPTIMIZATION_APPLIED) {
      // Update weights from optimization agent
      if (event.payload.target === 'lead-scoring' && event.payload.weights) {
        Object.assign(this.weights, event.payload.weights);
        console.log('[LEAD_SCORING] 🔧 Weights updated by optimization agent');
      }
    }
  }

  private async scoreLead(leadId: string, sourceEvent: AgentEvent): Promise<void> {
    const node = this.memory.getNode<LeadData>(leadId);
    if (!node) return;

    const data = node.data;
    let score = 0;

    // Contact info completeness
    if (data.email) score += this.weights.hasEmail;
    if (data.phone) score += this.weights.hasPhone;
    if (data.dateOfBirth) score += this.weights.hasDOB;
    if (data.state && data.zipCode) score += this.weights.hasAddress;

    // Intent signals
    if (data.coverageType) score += this.weights.coverageSpecified;
    if (data.income && data.income > 55000) score += this.weights.incomeAboveMedian;

    // Age scoring — optimal range for insurance
    const age = data.customFields?.estimatedAge;
    if (age && age >= 25 && age <= 65) score += this.weights.ageInRange;

    // Product value scoring
    const highValueProducts = ['iul', 'whole_life', 'annuity'];
    if (data.coverageType && highValueProducts.includes(data.coverageType)) {
      score += this.weights.highValueProduct;
    }

    // Recency bonus
    const hoursSinceCreation = (Date.now() - node.createdAt) / 3600000;
    if (hoursSinceCreation < 1) score += this.weights.recentInquiry;
    else if (hoursSinceCreation < 24) score += Math.round(this.weights.recentInquiry * 0.5);

    // Normalize to 0-100
    score = Math.min(100, Math.max(0, score));

    // Determine urgency
    const urgency: LeadData['urgency'] =
      score >= 80 ? 'critical' :
      score >= 60 ? 'high' :
      score >= 40 ? 'medium' : 'low';

    // Recommend path
    const recommendedPath = this.recommendPath(data, score, urgency);

    // Update lead
    this.memory.updateNode(leadId, {
      heatScore: score,
      urgency,
      stage: 'scored' as const,
      customFields: {
        ...data.customFields,
        recommendedPath,
        scoredAt: Date.now(),
      },
    }, this.id);

    // Emit
    this.emit(EventType.LEAD_SCORED, {
      leadId,
      heatScore: score,
      urgency,
      recommendedPath,
      firstName: data.firstName,
      lastName: data.lastName,
      coverageType: data.coverageType,
    }, {
      metadata: {
        tier: 1,
        priority: urgency === 'critical' ? 'critical' : urgency === 'high' ? 'high' : 'normal',
      },
      correlationId: sourceEvent.correlationId || sourceEvent.id,
      causationId: sourceEvent.id,
    });

    const emoji = score >= 80 ? '🔥' : score >= 60 ? '🟠' : score >= 40 ? '🟡' : '🔵';
    console.log(`[LEAD_SCORING] ${emoji} Lead ${data.firstName} ${data.lastName}: ${score}/100 | ${urgency} | Path: ${recommendedPath}`);
  }

  private recommendPath(data: LeadData, score: number, urgency: string): string {
    if (score >= 80) return 'immediate_call';
    if (score >= 60) return 'priority_outreach';
    if (score >= 40) return 'email_sequence';
    if (data.email) return 'nurture_drip';
    return 'low_priority_queue';
  }
}
