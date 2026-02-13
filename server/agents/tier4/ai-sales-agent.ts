/**
 * AI_SALES_AGENT
 * Fully autonomous closing for low/mid ticket. Objection handling. Policy explanation.
 */

import { BaseAgent, EventType, AgentEvent, memoryGraph, LeadData, knowledgeBase, analyticsLedger, MetricType } from '../core';

export class AiSalesAgent extends BaseAgent {
  constructor() {
    super({
      id: 'ai-sales',
      name: 'AI_SALES_AGENT',
      tier: 4,
      description: 'Autonomous sales closing with objection handling',
      capabilities: ['closing', 'objection_handling', 'policy_explanation', 'needs_analysis'],
      consumesEvents: [EventType.APPOINTMENT_BOOKED, EventType.INBOUND_QUALIFIED, EventType.COACHING_FEEDBACK],
      producesEvents: [EventType.POLICY_SOLD],
      complianceRequired: true,
    });
  }

  protected async onStart(): Promise<void> {}
  protected async onStop(): Promise<void> {}

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.APPOINTMENT_BOOKED) {
      await this.prepareSalesStrategy(event.payload.leadId);
    }
  }

  async prepareSalesStrategy(leadId: string): Promise<{
    recommendedProducts: string[];
    talkingPoints: string[];
    objectionPrep: Array<{ objection: string; response: string }>;
    estimatedPremium: { low: number; mid: number; high: number };
  } | null> {
    const node = this.memory.getNode<LeadData>(leadId);
    if (!node) return null;

    const data = node.data;

    // Get recommended products
    const products = this.recommendProducts(data);

    // Get talking points
    const talkingPoints: string[] = [];
    products.forEach((productId) => {
      const product = knowledgeBase.getProduct(productId);
      if (product) {
        talkingPoints.push(...product.talkingPoints.slice(0, 2));
      }
    });

    // Prepare objection responses
    const commonObjections = [
      knowledgeBase.getBestObjectionResponse("I can't afford it"),
      knowledgeBase.getBestObjectionResponse("I need to think about it"),
      knowledgeBase.getBestObjectionResponse("I need to talk to my spouse"),
    ].filter(Boolean);

    // Estimate premium ranges
    const premium = this.estimatePremium(data);

    const strategy = {
      recommendedProducts: products,
      talkingPoints,
      objectionPrep: commonObjections.map((o) => ({
        objection: o!.objection,
        response: o!.response,
      })),
      estimatedPremium: premium,
    };

    console.log(`[AI_SALES] 🎯 Strategy prepared for ${data.firstName} ${data.lastName} | Products: ${products.join(', ')} | Premium range: $${premium.low}-$${premium.high}/mo`);

    return strategy;
  }

  async recordSale(
    leadId: string,
    policyType: string,
    premium: number,
    coverageAmount: number,
    carrier: string
  ): Promise<void> {
    this.memory.updateNode(leadId, { stage: 'sold' as const }, this.id);

    analyticsLedger.record(MetricType.FUNNEL_POLICY_PLACED, 1, this.id, { entityId: leadId });
    analyticsLedger.record(MetricType.REVENUE_PREMIUM, premium * 12, this.id, {
      entityId: leadId,
      unit: 'usd',
      metadata: { policyType, carrier, coverageAmount },
    });

    this.emit(EventType.POLICY_SOLD, {
      leadId,
      policyType,
      premium,
      coverageAmount,
      carrier,
      annualPremium: premium * 12,
    }, {
      metadata: { tier: 4, priority: 'high' },
    });

    const node = this.memory.getNode<LeadData>(leadId);
    console.log(`[AI_SALES] 🎉 POLICY SOLD! ${node?.data.firstName} ${node?.data.lastName} | ${policyType} | $${coverageAmount} | $${premium}/mo`);
  }

  private recommendProducts(data: LeadData): string[] {
    const products: string[] = [];
    const age = data.customFields?.estimatedAge || 40;

    if (data.coverageType) {
      products.push(data.coverageType);
    }

    // Smart recommendations based on profile
    if (age >= 50 && !products.includes('final_expense')) {
      products.push('final-expense');
    }
    if (age >= 25 && age <= 55 && data.income && data.income > 50000) {
      if (!products.includes('term-life')) products.push('term-life');
      if (data.income > 80000 && !products.includes('iul')) products.push('iul');
    }
    if (age >= 45) {
      if (!products.includes('annuity')) products.push('annuity');
    }

    return products.slice(0, 3);
  }

  private estimatePremium(data: LeadData): { low: number; mid: number; high: number } {
    const age = data.customFields?.estimatedAge || 40;
    const basePremium = 25 + (age - 25) * 2;

    switch (data.coverageType) {
      case 'final_expense':
        return { low: 20, mid: 45, high: 85 };
      case 'term_life':
        return { low: basePremium, mid: basePremium * 2, high: basePremium * 4 };
      case 'whole_life':
        return { low: basePremium * 3, mid: basePremium * 5, high: basePremium * 8 };
      case 'iul':
        return { low: 200, mid: 500, high: 1500 };
      case 'mortgage_protection':
        return { low: basePremium * 1.5, mid: basePremium * 3, high: basePremium * 5 };
      case 'annuity':
        return { low: 300, mid: 750, high: 2000 };
      default:
        return { low: basePremium, mid: basePremium * 2.5, high: basePremium * 5 };
    }
  }
}
