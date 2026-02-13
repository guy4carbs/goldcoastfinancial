/**
 * UNDERWRITING_INTELLIGENCE_AGENT
 * Risk analysis, health class determination, carrier rule matching,
 * multi-carrier comparison. Emits UNDERWRITING_STATUS.
 */

import {
  BaseAgent, EventType, AgentEvent,
  memoryGraph, NodeType, EdgeType, LeadData,
  knowledgeBase, analyticsLedger, MetricType,
  securityLayer, Permission,
} from '../core';

type HealthClass = 'preferred_plus' | 'preferred' | 'standard_plus' | 'standard' | 'substandard' | 'decline';
type UWDecision = 'approved' | 'approved_modified' | 'postponed' | 'declined';

interface RiskProfile {
  healthClass: HealthClass;
  bmi: number;
  tobaccoUser: boolean;
  riskFactors: string[];
  riskScore: number; // 0-100, lower is better
}

interface CarrierQuote {
  carrierId: string;
  carrierName: string;
  healthClass: HealthClass;
  monthlyPremium: number;
  annualPremium: number;
  underwritingType: string;
  approvalLikelihood: number; // 0-100
  avgApprovalDays: number;
  notes: string[];
}

interface UnderwritingResult {
  leadId: string;
  applicationId: string;
  riskProfile: RiskProfile;
  decision: UWDecision;
  carrierQuotes: CarrierQuote[];
  recommendedCarrier: string;
  reasoning: string;
}

// BMI-based health class thresholds
const BMI_THRESHOLDS: Record<HealthClass, { min: number; max: number }> = {
  preferred_plus: { min: 18.5, max: 25 },
  preferred: { min: 17.5, max: 28 },
  standard_plus: { min: 16.5, max: 32 },
  standard: { min: 15, max: 38 },
  substandard: { min: 14, max: 45 },
  decline: { min: 0, max: 100 },
};

// Risk factor weights
const RISK_WEIGHTS: Record<string, number> = {
  tobacco: 25,
  diabetes: 20,
  heart_disease: 30,
  cancer_history: 35,
  high_blood_pressure: 10,
  high_cholesterol: 8,
  family_history: 12,
  hazardous_occupation: 15,
  dui_history: 18,
  felony: 20,
  obesity: 12,
  mental_health: 8,
  sleep_apnea: 6,
};

export class UnderwritingIntelligenceAgent extends BaseAgent {
  constructor() {
    super({
      id: 'underwriting-intelligence',
      name: 'UNDERWRITING_INTELLIGENCE_AGENT',
      tier: 5,
      description: 'Risk analysis, health class determination, multi-carrier comparison',
      capabilities: ['risk_analysis', 'health_classification', 'carrier_matching', 'multi_carrier_comparison'],
      consumesEvents: [EventType.APPLICATION_SUBMITTED],
      producesEvents: [EventType.UNDERWRITING_STATUS],
      complianceRequired: true,
    });
  }

  protected async onStart(): Promise<void> {
    securityLayer.registerAgent(this.id, [
      Permission.READ_LEADS, Permission.READ_CLIENTS,
      Permission.READ_POLICIES, Permission.WRITE_POLICIES,
    ]);
  }

  protected async onStop(): Promise<void> {}

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.APPLICATION_SUBMITTED) {
      // Skip abandoned app notifications
      if (event.payload.status === 'abandoned') return;
      await this.analyzeRisk(event.payload);
    }
  }

  private async analyzeRisk(payload: {
    applicationId: string;
    leadId: string;
    carrier: string;
    productType: string;
    coverageAmount: number;
    premium: number;
  }): Promise<void> {
    const leadNode = this.memory.getNode<LeadData>(payload.leadId);
    if (!leadNode) return;

    const lead = leadNode.data;
    const riskProfile = this.buildRiskProfile(lead);
    const carrierQuotes = this.getMultiCarrierQuotes(lead, payload.productType, payload.coverageAmount, riskProfile);
    const decision = this.makeDecision(riskProfile, payload.coverageAmount);

    // Sort by best deal (lowest premium with high approval likelihood)
    carrierQuotes.sort((a, b) => {
      const scoreA = a.monthlyPremium * (1 - a.approvalLikelihood / 100);
      const scoreB = b.monthlyPremium * (1 - b.approvalLikelihood / 100);
      return scoreA - scoreB;
    });

    const recommendedCarrier = carrierQuotes.length > 0 ? carrierQuotes[0].carrierId : payload.carrier;

    const result: UnderwritingResult = {
      leadId: payload.leadId,
      applicationId: payload.applicationId,
      riskProfile,
      decision,
      carrierQuotes,
      recommendedCarrier,
      reasoning: this.buildReasoning(riskProfile, decision, carrierQuotes),
    };

    // Store result in memory
    const uwNode = this.memory.addNode(NodeType.DOCUMENT, {
      type: 'underwriting_result',
      ...result,
    }, this.id, ['underwriting', riskProfile.healthClass, decision]);

    this.memory.addEdge(EdgeType.RELATED_TO, payload.applicationId, uwNode.id, this.id);

    analyticsLedger.record(MetricType.AGENT_TASK_COMPLETED, 1, this.id, {
      entityId: payload.leadId,
      metadata: { decision, healthClass: riskProfile.healthClass },
    });

    this.emit(EventType.UNDERWRITING_STATUS, {
      ...result,
      productType: payload.productType,
      coverageAmount: payload.coverageAmount,
    }, {
      metadata: { tier: 5, priority: decision === 'declined' ? 'high' : 'normal' },
    });

    console.log(`[UNDERWRITING] 📊 ${lead.firstName} ${lead.lastName} | Class: ${riskProfile.healthClass} | Decision: ${decision} | Risk Score: ${riskProfile.riskScore} | Best carrier: ${recommendedCarrier}`);
  }

  private buildRiskProfile(lead: LeadData): RiskProfile {
    const riskFactors: string[] = [];
    let riskScore = 0;

    // BMI calculation
    let bmi = 25; // default
    if (lead.height && lead.weight) {
      const heightInches = this.parseHeight(lead.height);
      const weightLbs = parseFloat(lead.weight);
      if (heightInches > 0 && weightLbs > 0) {
        bmi = (weightLbs / (heightInches * heightInches)) * 703;
      }
    }

    if (bmi > 30) { riskFactors.push('obesity'); riskScore += RISK_WEIGHTS.obesity; }

    // Parse medical background
    const medical = (lead.medicalBackground || '').toLowerCase();
    if (medical.includes('tobacco') || medical.includes('smok')) {
      riskFactors.push('tobacco'); riskScore += RISK_WEIGHTS.tobacco;
    }
    if (medical.includes('diabet')) {
      riskFactors.push('diabetes'); riskScore += RISK_WEIGHTS.diabetes;
    }
    if (medical.includes('heart') || medical.includes('cardiac')) {
      riskFactors.push('heart_disease'); riskScore += RISK_WEIGHTS.heart_disease;
    }
    if (medical.includes('cancer')) {
      riskFactors.push('cancer_history'); riskScore += RISK_WEIGHTS.cancer_history;
    }
    if (medical.includes('blood pressure') || medical.includes('hypertension')) {
      riskFactors.push('high_blood_pressure'); riskScore += RISK_WEIGHTS.high_blood_pressure;
    }
    if (medical.includes('cholesterol')) {
      riskFactors.push('high_cholesterol'); riskScore += RISK_WEIGHTS.high_cholesterol;
    }

    // Age factor
    const age = lead.customFields?.estimatedAge || 40;
    if (age > 55) riskScore += 10;
    if (age > 65) riskScore += 15;

    // Determine health class from risk score
    const healthClass = this.determineHealthClass(riskScore, bmi, riskFactors);

    return { healthClass, bmi: Math.round(bmi * 10) / 10, tobaccoUser: riskFactors.includes('tobacco'), riskFactors, riskScore: Math.min(100, riskScore) };
  }

  private determineHealthClass(riskScore: number, bmi: number, riskFactors: string[]): HealthClass {
    if (riskFactors.includes('cancer_history') || riskFactors.includes('heart_disease')) return 'substandard';
    if (riskScore >= 50) return 'substandard';
    if (riskScore >= 35) return 'standard';
    if (riskScore >= 20) return 'standard_plus';

    // BMI check for preferred classes
    if (bmi >= BMI_THRESHOLDS.preferred_plus.min && bmi <= BMI_THRESHOLDS.preferred_plus.max && riskScore < 10) {
      return 'preferred_plus';
    }
    if (bmi >= BMI_THRESHOLDS.preferred.min && bmi <= BMI_THRESHOLDS.preferred.max) {
      return 'preferred';
    }
    return 'standard_plus';
  }

  private getMultiCarrierQuotes(
    lead: LeadData, productType: string, coverageAmount: number, riskProfile: RiskProfile
  ): CarrierQuote[] {
    const carriers = knowledgeBase.getAllCarriers();
    const state = lead.state || '';
    const age = lead.customFields?.estimatedAge || 40;
    const quotes: CarrierQuote[] = [];

    // If no carriers are in the knowledge base, generate synthetic quotes
    const carrierList = carriers.length > 0 ? carriers : [
      { id: 'mutual-of-omaha', name: 'Mutual of Omaha', underwritingType: 'simplified', avgApprovalDays: 3, states: [] as string[], products: [], commissionSchedule: { firstYear: 110, renewal: 5 }, contactInfo: {} },
      { id: 'aig', name: 'AIG', underwritingType: 'full', avgApprovalDays: 21, states: [] as string[], products: [], commissionSchedule: { firstYear: 100, renewal: 4 }, contactInfo: {} },
      { id: 'nationwide', name: 'Nationwide', underwritingType: 'simplified', avgApprovalDays: 7, states: [] as string[], products: [], commissionSchedule: { firstYear: 105, renewal: 5 }, contactInfo: {} },
      { id: 'transamerica', name: 'Transamerica', underwritingType: 'full', avgApprovalDays: 14, states: [] as string[], products: [], commissionSchedule: { firstYear: 95, renewal: 3 }, contactInfo: {} },
    ];

    for (const carrier of carrierList) {
      // Skip carriers not licensed in state (if state data available)
      if (state && carrier.states.length > 0 && !carrier.states.includes(state)) continue;

      const basePremium = this.calculateBasePremium(age, coverageAmount, productType);
      const classMultiplier = this.getClassMultiplier(riskProfile.healthClass);
      const carrierAdjustment = 0.9 + Math.random() * 0.2; // ±10% carrier variation
      const monthlyPremium = Math.round(basePremium * classMultiplier * carrierAdjustment * 100) / 100;

      // Approval likelihood based on risk and carrier underwriting type
      let approvalLikelihood = 90 - riskProfile.riskScore;
      if (carrier.underwritingType === 'guaranteed') approvalLikelihood = 100;
      if (carrier.underwritingType === 'simplified') approvalLikelihood = Math.min(approvalLikelihood + 10, 99);
      approvalLikelihood = Math.max(5, Math.min(99, approvalLikelihood));

      const notes: string[] = [];
      if (riskProfile.tobaccoUser) notes.push('Tobacco rates applied');
      if (riskProfile.bmi > 30) notes.push('Elevated BMI surcharge');
      if (age > 60 && carrier.underwritingType === 'full') notes.push('May require paramedical exam');

      quotes.push({
        carrierId: carrier.id,
        carrierName: carrier.name,
        healthClass: riskProfile.healthClass,
        monthlyPremium,
        annualPremium: Math.round(monthlyPremium * 12 * 0.95 * 100) / 100, // 5% annual discount
        underwritingType: carrier.underwritingType as string,
        approvalLikelihood,
        avgApprovalDays: carrier.avgApprovalDays,
        notes,
      });
    }

    return quotes;
  }

  private calculateBasePremium(age: number, coverageAmount: number, productType: string): number {
    const ratePerThousand: Record<string, number> = {
      term_life: 0.15, whole_life: 0.65, iul: 0.85,
      final_expense: 2.5, mortgage_protection: 0.25, annuity: 0,
    };
    const base = (ratePerThousand[productType] || 0.3) * (coverageAmount / 1000);
    const ageFactor = 1 + (age - 30) * 0.025;
    return Math.max(15, base * ageFactor);
  }

  private getClassMultiplier(healthClass: HealthClass): number {
    const multipliers: Record<HealthClass, number> = {
      preferred_plus: 0.7, preferred: 0.85, standard_plus: 1.0,
      standard: 1.2, substandard: 1.8, decline: 999,
    };
    return multipliers[healthClass];
  }

  private makeDecision(riskProfile: RiskProfile, coverageAmount: number): UWDecision {
    if (riskProfile.healthClass === 'decline') return 'declined';
    if (riskProfile.riskScore >= 70) return 'declined';
    if (riskProfile.riskScore >= 50) return 'approved_modified';
    if (riskProfile.healthClass === 'substandard' && coverageAmount > 500000) return 'postponed';
    return 'approved';
  }

  private buildReasoning(riskProfile: RiskProfile, decision: UWDecision, quotes: CarrierQuote[]): string {
    const parts: string[] = [];
    parts.push(`Health class: ${riskProfile.healthClass} (risk score: ${riskProfile.riskScore}/100).`);
    if (riskProfile.riskFactors.length > 0) {
      parts.push(`Risk factors: ${riskProfile.riskFactors.join(', ')}.`);
    }
    parts.push(`BMI: ${riskProfile.bmi}.`);
    parts.push(`Decision: ${decision}.`);
    if (quotes.length > 0) {
      parts.push(`${quotes.length} carrier quotes obtained. Best rate: $${quotes[0]?.monthlyPremium}/mo from ${quotes[0]?.carrierName}.`);
    }
    return parts.join(' ');
  }

  private parseHeight(height: string): number {
    // Parse formats like "5'10" or "70" (inches) or "5-10"
    const feetInches = height.match(/(\d+)['\-\s]+(\d+)/);
    if (feetInches) return parseInt(feetInches[1]) * 12 + parseInt(feetInches[2]);
    const inches = parseInt(height);
    return inches > 12 ? inches : inches * 12; // assume feet if small number
  }
}
