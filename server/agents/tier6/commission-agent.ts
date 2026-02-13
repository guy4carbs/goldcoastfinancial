/**
 * COMMISSION_AGENT
 * Multi-level hierarchy tracking, advance vs as-earned, overrides,
 * chargebacks, commission splits. Emits COMMISSION_CALCULATED.
 */

import {
  BaseAgent, EventType, AgentEvent,
  memoryGraph, NodeType, EdgeType,
  knowledgeBase, analyticsLedger, MetricType,
  securityLayer, Permission,
} from '../core';

interface CommissionRecord {
  policyId: string;
  clientId: string;
  carrier: string;
  productType: string;
  annualPremium: number;
  commissionType: 'advance' | 'as_earned';
  firstYearRate: number;
  renewalRate: number;
  firstYearAmount: number;
  renewalAmount: number;
  overrides: OverrideEntry[];
  splits: SplitEntry[];
  chargebackReserve: number;
  status: 'pending' | 'paid' | 'chargedback';
  paidAt?: number;
}

interface OverrideEntry {
  level: string; // e.g. 'agency_owner', 'regional_manager'
  agentName: string;
  rate: number;
  amount: number;
}

interface SplitEntry {
  agentId: string;
  agentName: string;
  splitPercent: number;
  amount: number;
}

// Commission schedules by product type
const DEFAULT_COMMISSION_RATES: Record<string, { firstYear: number; renewal: number }> = {
  term_life: { firstYear: 0.80, renewal: 0.04 },
  whole_life: { firstYear: 1.00, renewal: 0.05 },
  iul: { firstYear: 1.10, renewal: 0.05 },
  final_expense: { firstYear: 1.10, renewal: 0.05 },
  mortgage_protection: { firstYear: 0.90, renewal: 0.04 },
  annuity: { firstYear: 0.06, renewal: 0.02 },
};

const OVERRIDE_HIERARCHY = [
  { level: 'direct_upline', rate: 0.10 },
  { level: 'agency_manager', rate: 0.05 },
  { level: 'regional_director', rate: 0.03 },
  { level: 'agency_owner', rate: 0.02 },
];

const CHARGEBACK_RESERVE_PERCENT = 0.25;
const ADVANCE_MONTHS = 9;

export class CommissionAgent extends BaseAgent {
  constructor() {
    super({
      id: 'commission',
      name: 'COMMISSION_AGENT',
      tier: 6,
      description: 'Multi-level commission tracking, advances, overrides, chargebacks',
      capabilities: ['commission_calculation', 'hierarchy_tracking', 'advance_processing', 'chargeback_management'],
      consumesEvents: [EventType.POLICY_SOLD, EventType.PAYMENT_PROCESSED],
      producesEvents: [EventType.COMMISSION_CALCULATED],
    });
  }

  protected async onStart(): Promise<void> {
    securityLayer.registerAgent(this.id, [
      Permission.READ_POLICIES, Permission.MODIFY_COMMISSIONS,
    ]);
  }

  protected async onStop(): Promise<void> {}

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.POLICY_SOLD) {
      await this.calculateCommission(event.payload);
    } else if (event.type === EventType.PAYMENT_PROCESSED) {
      if (event.payload.status === 'lapsed' || event.payload.status === 'grace_period_expired') {
        await this.processChargeback(event.payload);
      }
    }
  }

  private async calculateCommission(payload: any): Promise<void> {
    const { leadId, policyType, premium, coverageAmount, carrier } = payload;

    if (!securityLayer.authorize(this.id, 'calculate_commission', Permission.MODIFY_COMMISSIONS, 'commission', leadId)) {
      return;
    }

    const annualPremium = (premium || 0) * 12;

    // Get carrier-specific rates or defaults
    const carrierData = knowledgeBase.getCarrier(carrier);
    const rates = carrierData?.commissionSchedule
      ? { firstYear: carrierData.commissionSchedule.firstYear / 100, renewal: carrierData.commissionSchedule.renewal / 100 }
      : DEFAULT_COMMISSION_RATES[policyType] || { firstYear: 0.80, renewal: 0.04 };

    const firstYearAmount = annualPremium * rates.firstYear;
    const renewalAmount = annualPremium * rates.renewal;

    // Calculate overrides for upline hierarchy
    const overrides: OverrideEntry[] = OVERRIDE_HIERARCHY.map(level => ({
      level: level.level,
      agentName: `${level.level}_placeholder`, // In production, resolve from agent hierarchy
      rate: level.rate,
      amount: Math.round(firstYearAmount * level.rate * 100) / 100,
    }));

    // Commission splits (default: 100% to selling agent)
    const splits: SplitEntry[] = [{
      agentId: 'selling-agent',
      agentName: 'Primary Agent',
      splitPercent: 100,
      amount: firstYearAmount,
    }];

    // Advance vs as-earned determination
    const commissionType: 'advance' | 'as_earned' = annualPremium > 500 ? 'advance' : 'as_earned';
    const chargebackReserve = commissionType === 'advance'
      ? Math.round(firstYearAmount * CHARGEBACK_RESERVE_PERCENT * 100) / 100
      : 0;

    const advanceAmount = commissionType === 'advance'
      ? Math.round(firstYearAmount * (ADVANCE_MONTHS / 12) * 100) / 100
      : 0;

    const record: CommissionRecord = {
      policyId: leadId,
      clientId: leadId,
      carrier: carrier || 'unknown',
      productType: policyType,
      annualPremium,
      commissionType,
      firstYearRate: rates.firstYear,
      renewalRate: rates.renewal,
      firstYearAmount: Math.round(firstYearAmount * 100) / 100,
      renewalAmount: Math.round(renewalAmount * 100) / 100,
      overrides,
      splits,
      chargebackReserve,
      status: 'pending',
    };

    const node = this.memory.addNode(NodeType.DOCUMENT, {
      type: 'commission_record', ...record,
    }, this.id, ['commission', policyType, commissionType]);
    this.memory.addEdge(EdgeType.RELATED_TO, leadId, node.id, this.id);

    // Record in analytics
    analyticsLedger.record(MetricType.REVENUE_COMMISSION, record.firstYearAmount, this.id, {
      entityId: leadId, unit: 'usd',
      metadata: { carrier, policyType, commissionType, advanceAmount },
    });

    const totalOverrides = overrides.reduce((s, o) => s + o.amount, 0);
    analyticsLedger.record(MetricType.REVENUE_OVERRIDE, totalOverrides, this.id, {
      entityId: leadId, unit: 'usd',
    });

    this.emit(EventType.COMMISSION_CALCULATED, {
      commissionId: node.id,
      clientId: leadId,
      carrier,
      productType: policyType,
      annualPremium,
      firstYearCommission: record.firstYearAmount,
      renewalCommission: record.renewalAmount,
      advanceAmount,
      chargebackReserve,
      overridesTotal: totalOverrides,
      commissionType,
    });

    console.log(`[COMMISSION] 💰 ${policyType} | FY: $${record.firstYearAmount} (${(rates.firstYear * 100).toFixed(0)}%) | Renewal: $${record.renewalAmount}/yr | ${commissionType} | Reserve: $${chargebackReserve}`);
  }

  private async processChargeback(payload: any): Promise<void> {
    const { clientId, policyId } = payload;
    const commissions = this.memory.getNodesByType(NodeType.DOCUMENT)
      .filter(n => n.data.type === 'commission_record' && n.data.clientId === clientId);

    for (const node of commissions) {
      if (node.data.status === 'paid' || node.data.status === 'pending') {
        this.memory.updateNode(node.id, { status: 'chargedback' as const }, this.id);

        const chargebackAmount = node.data.chargebackReserve || node.data.firstYearAmount;
        analyticsLedger.record(MetricType.REVENUE_COMMISSION, -chargebackAmount, this.id, {
          entityId: clientId, unit: 'usd',
          metadata: { type: 'chargeback' },
        });

        this.emit(EventType.COMMISSION_CALCULATED, {
          commissionId: node.id, clientId, status: 'chargedback',
          chargebackAmount,
        }, { metadata: { tier: 6, priority: 'high' } });

        console.warn(`[COMMISSION] 🔙 CHARGEBACK: $${chargebackAmount} for client ${clientId}`);
      }
    }
  }
}
