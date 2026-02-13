/**
 * POLICY_RECOMMENDATION_AGENT
 * Coverage optimization, gap analysis, bundling opportunities,
 * premium comparison. Emits POLICY_RECOMMENDED.
 */

import {
  BaseAgent, EventType, AgentEvent,
  memoryGraph, NodeType, EdgeType, LeadData, PolicyData,
  knowledgeBase, analyticsLedger, MetricType,
  securityLayer, Permission,
} from '../core';

interface CoverageGap {
  type: string;
  description: string;
  recommendedCoverage: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface BundleOpportunity {
  products: string[];
  savingsPercent: number;
  description: string;
}

interface Recommendation {
  leadId: string;
  primaryProduct: string;
  primaryCoverage: number;
  primaryPremium: number;
  gaps: CoverageGap[];
  bundles: BundleOpportunity[];
  totalRecommendedCoverage: number;
  totalEstimatedPremium: number;
  reasoning: string;
}

export class PolicyRecommendationAgent extends BaseAgent {
  constructor() {
    super({
      id: 'policy-recommendation',
      name: 'POLICY_RECOMMENDATION_AGENT',
      tier: 5,
      description: 'Coverage optimization, gap analysis, bundling, premium comparison',
      capabilities: ['gap_analysis', 'coverage_optimization', 'bundling', 'premium_comparison'],
      consumesEvents: [EventType.LEAD_SCORED, EventType.UNDERWRITING_STATUS, EventType.INBOUND_QUALIFIED],
      producesEvents: [EventType.POLICY_RECOMMENDED],
    });
  }

  protected async onStart(): Promise<void> {
    securityLayer.registerAgent(this.id, [
      Permission.READ_LEADS, Permission.READ_CLIENTS, Permission.READ_POLICIES,
    ]);
  }

  protected async onStop(): Promise<void> {}

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.LEAD_SCORED || event.type === EventType.INBOUND_QUALIFIED) {
      await this.analyzeAndRecommend(event.payload.leadId, event);
    } else if (event.type === EventType.UNDERWRITING_STATUS) {
      // Re-recommend if underwriting modified the original plan
      if (event.payload.decision === 'approved_modified' || event.payload.decision === 'declined') {
        await this.analyzeAndRecommend(event.payload.leadId, event);
      }
    }
  }

  private async analyzeAndRecommend(leadId: string, sourceEvent: AgentEvent): Promise<void> {
    const leadNode = this.memory.getNode<LeadData>(leadId);
    if (!leadNode) return;

    const lead = leadNode.data;
    const age = lead.customFields?.estimatedAge || 40;
    const income = lead.income || 50000;

    // Get existing policies
    const existingPolicies = this.memory.getRelated(leadId, EdgeType.HAS_POLICY)
      .filter(n => n.type === NodeType.POLICY)
      .map(n => n.data as PolicyData);

    // Calculate ideal coverage
    const idealCoverage = this.calculateIdealCoverage(lead, age, income);

    // Identify gaps
    const gaps = this.identifyGaps(lead, existingPolicies, idealCoverage, age, income);

    // Find bundling opportunities
    const bundles = this.findBundleOpportunities(gaps, lead);

    // Build primary recommendation
    const primaryProduct = this.selectPrimaryProduct(lead, age, income);
    const primaryCoverage = idealCoverage.primary;
    const primaryPremium = this.estimatePremium(primaryProduct, primaryCoverage, age);

    const totalCoverage = gaps.reduce((sum, g) => sum + g.recommendedCoverage, primaryCoverage);
    const totalPremium = primaryPremium + gaps.reduce((sum, g) =>
      sum + this.estimatePremium(g.type, g.recommendedCoverage, age) * 0.3, 0
    );

    const recommendation: Recommendation = {
      leadId,
      primaryProduct,
      primaryCoverage,
      primaryPremium,
      gaps,
      bundles,
      totalRecommendedCoverage: totalCoverage,
      totalEstimatedPremium: Math.round(totalPremium * 100) / 100,
      reasoning: this.buildReasoning(lead, primaryProduct, gaps, age, income),
    };

    // Store recommendation
    const recNode = this.memory.addNode(NodeType.DOCUMENT, {
      type: 'recommendation',
      ...recommendation,
    }, this.id, ['recommendation', primaryProduct]);
    this.memory.addEdge(EdgeType.RELATED_TO, leadId, recNode.id, this.id);

    analyticsLedger.record(MetricType.AGENT_TASK_COMPLETED, 1, this.id, {
      entityId: leadId,
      metadata: { primaryProduct, gapCount: gaps.length },
    });

    this.emit(EventType.POLICY_RECOMMENDED, recommendation, {
      correlationId: sourceEvent.correlationId || sourceEvent.id,
      causationId: sourceEvent.id,
      metadata: { tier: 5, priority: 'normal' },
    });

    console.log(`[POLICY_REC] 💡 ${lead.firstName} ${lead.lastName} | Primary: ${primaryProduct} $${primaryCoverage} @ $${primaryPremium}/mo | ${gaps.length} gaps | ${bundles.length} bundles`);
  }

  private calculateIdealCoverage(lead: LeadData, age: number, income: number): { primary: number; total: number } {
    // Income replacement: 10-12x annual income for term
    const incomeMultiplier = age < 40 ? 12 : age < 50 ? 10 : 8;
    const primaryNeed = income * incomeMultiplier;

    // Debt coverage
    const mortgageEstimate = lead.customFields?.mortgageBalance || (income > 60000 ? 250000 : 150000);
    const otherDebt = lead.customFields?.totalDebt || 20000;

    // Final expenses
    const finalExpenses = 15000;

    // Education fund (if applicable)
    const dependents = lead.householdSize ? Math.max(0, lead.householdSize - 2) : 0;
    const educationFund = dependents * 50000;

    return {
      primary: Math.round(primaryNeed / 10000) * 10000,
      total: Math.round((primaryNeed + mortgageEstimate + otherDebt + finalExpenses + educationFund) / 10000) * 10000,
    };
  }

  private identifyGaps(
    lead: LeadData, existing: PolicyData[], ideal: { primary: number; total: number },
    age: number, income: number
  ): CoverageGap[] {
    const gaps: CoverageGap[] = [];
    const existingTotal = existing.reduce((sum, p) => sum + p.coverageAmount, 0);
    const existingTypes = new Set(existing.map(p => p.type));

    // Income replacement gap
    if (existingTotal < ideal.primary * 0.8) {
      gaps.push({
        type: 'term_life',
        description: `Income replacement gap: current coverage $${existingTotal.toLocaleString()} vs recommended $${ideal.primary.toLocaleString()}`,
        recommendedCoverage: ideal.primary - existingTotal,
        priority: 'critical',
      });
    }

    // Final expense gap for seniors
    if (age >= 45 && !existingTypes.has('final_expense')) {
      gaps.push({
        type: 'final_expense',
        description: 'No final expense coverage — funeral/burial costs average $10,000-$15,000',
        recommendedCoverage: 15000,
        priority: age >= 60 ? 'critical' : 'high',
      });
    }

    // Mortgage protection
    if (lead.customFields?.homeowner && !existingTypes.has('mortgage_protection')) {
      gaps.push({
        type: 'mortgage_protection',
        description: 'Homeowner without mortgage protection coverage',
        recommendedCoverage: lead.customFields?.mortgageBalance || 200000,
        priority: 'high',
      });
    }

    // Retirement savings gap for high earners
    if (income > 80000 && age >= 30 && age <= 55 && !existingTypes.has('iul')) {
      gaps.push({
        type: 'iul',
        description: 'High earner without tax-advantaged retirement vehicle (IUL)',
        recommendedCoverage: 250000,
        priority: 'medium',
      });
    }

    // Annuity gap for pre-retirees
    if (age >= 50 && income > 60000 && !existingTypes.has('annuity')) {
      gaps.push({
        type: 'annuity',
        description: 'Pre-retiree without guaranteed income stream',
        recommendedCoverage: income * 5,
        priority: age >= 55 ? 'high' : 'medium',
      });
    }

    return gaps;
  }

  private findBundleOpportunities(gaps: CoverageGap[], lead: LeadData): BundleOpportunity[] {
    const bundles: BundleOpportunity[] = [];
    const gapTypes = gaps.map(g => g.type);

    if (gapTypes.includes('term_life') && gapTypes.includes('mortgage_protection')) {
      bundles.push({
        products: ['term_life', 'mortgage_protection'],
        savingsPercent: 15,
        description: 'Bundle term life + mortgage protection for 15% premium savings',
      });
    }

    if (gapTypes.includes('whole_life') && gapTypes.includes('final_expense')) {
      bundles.push({
        products: ['whole_life', 'final_expense'],
        savingsPercent: 10,
        description: 'Combine whole life with final expense rider for 10% savings',
      });
    }

    if (gapTypes.includes('iul') && gapTypes.includes('term_life')) {
      bundles.push({
        products: ['iul', 'term_life'],
        savingsPercent: 8,
        description: 'Pair IUL for wealth building with term for maximum protection',
      });
    }

    return bundles;
  }

  private selectPrimaryProduct(lead: LeadData, age: number, income: number): string {
    if (lead.coverageType) return lead.coverageType;
    if (age >= 65) return 'final_expense';
    if (age >= 55 && income > 80000) return 'annuity';
    if (income > 100000 && age < 50) return 'iul';
    if (age < 55) return 'term_life';
    return 'whole_life';
  }

  private estimatePremium(productType: string, coverage: number, age: number): number {
    const rates: Record<string, number> = {
      term_life: 0.12, whole_life: 0.55, iul: 0.75,
      final_expense: 2.0, mortgage_protection: 0.20, annuity: 0.05,
    };
    const rate = rates[productType] || 0.3;
    const ageFactor = 1 + (age - 30) * 0.02;
    return Math.round(rate * (coverage / 1000) * ageFactor * 100) / 100;
  }

  private buildReasoning(lead: LeadData, product: string, gaps: CoverageGap[], age: number, income: number): string {
    const parts = [`Based on age ${age}, income $${income.toLocaleString()}`];
    if (lead.householdSize) parts.push(`household of ${lead.householdSize}`);
    parts.push(`— recommend ${product} as primary product.`);
    if (gaps.length > 0) {
      const critical = gaps.filter(g => g.priority === 'critical').length;
      parts.push(`${gaps.length} coverage gaps identified (${critical} critical).`);
    }
    return parts.join(' ');
  }
}
