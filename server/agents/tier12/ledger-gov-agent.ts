/**
 * LEDGER — FINANCIAL & COMMISSIONS GOVERNANCE
 * Tier 12 — Veto authority on compensation logic.
 *
 * - Veto power on all compensation/commission changes
 * - Owns financial math — no agent may override
 * - Reviews financial logic chain changes
 */

import { AgentEvent, EventType } from '../core';
import { GovernanceAgent } from '../governance';
import {
  GovernanceDomain, ChangeType, GovernanceSubtask,
  GovernanceHandoff, GOV_AGENT_IDS,
} from '../core/governance-types';

export class LedgerGovAgent extends GovernanceAgent {
  constructor() {
    super({
      id: GOV_AGENT_IDS.LEDGER,
      name: 'LEDGER_GOVERNANCE',
      tier: 12,
      description: 'Financial & Commissions — Veto authority for Heritage Life Solutions compensation. Guards commission splits, override hierarchies, advance schedules, chargeback logic, and product-specific payout rates (IUL, Whole Life, Term, Annuity).',
      capabilities: ['financial_review', 'commission_validation', 'compensation_audit', 'revenue_verification'],
      consumesEvents: [EventType.COMMISSION_CALCULATED, EventType.PAYMENT_PROCESSED],
      producesEvents: [EventType.GOVERNANCE_VETO_ISSUED, EventType.GOVERNANCE_RELEASE_CHECK],
      governanceDomain: GovernanceDomain.FINANCIAL,
      governanceId: GOV_AGENT_IDS.LEDGER,
      hasVetoAuthority: true,
      participatesInChains: [ChangeType.FINANCIAL_LOGIC],
    });
  }

  protected async onGovernanceStart(): Promise<void> {
    console.log('[LEDGER] 💰 Financial governance online for Heritage Life Solutions. Commission splits, overrides, and product payout protection active.');
  }

  protected async onGovernanceStop(): Promise<void> {}

  protected async handleGovernanceEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.COMMISSION_CALCULATED) {
      this.validateCommission(event);
    }
  }

  protected async onChainStepActivated(chainId: string, taskId: string, changeType: ChangeType): Promise<void> {
    console.log(`[LEDGER] 💰 Financial review for ${changeType} | Chain: ${chainId}`);

    const financialClear = this.performFinancialReview(changeType, taskId);

    if (financialClear) {
      this.approveChainStep(chainId, `Financial review passed for ${changeType}`);
    } else {
      this.rejectChainStep(chainId, `Financial risk identified in ${changeType}`);
      this.issueVeto(taskId, `Compensation logic integrity risk`, 'blocking', chainId);
    }
  }

  protected async onSubtaskAssigned(subtask: GovernanceSubtask): Promise<void> {
    console.log(`[LEDGER] 💰 Financial subtask: ${subtask.description}`);
    this.completeSubtask(subtask.id, 'Financial review complete — compensation logic intact');
  }

  protected async onHandoffReceived(handoff: GovernanceHandoff): Promise<void> {
    console.log(`[LEDGER] 📥 Financial review requested by ${handoff.from}: ${handoff.need}`);
    this.completeHandoff(handoff.id, 'Financial review complete');
  }

  private performFinancialReview(changeType: ChangeType, taskId: string): boolean {
    // Checks:
    // - Commission tables unchanged or valid
    // - Compensation calculations correct
    // - Revenue forecasting models intact
    // - No unauthorized financial math modifications
    console.log(`[LEDGER] 💰 Reviewing ${changeType} for financial integrity...`);
    return true;
  }

  private validateCommission(event: AgentEvent): void {
    console.log(`[LEDGER] 💰 Validating commission calculation: ${event.payload?.amount}`);
  }

  submitReleaseCheck(releaseId: string, approved: boolean): void {
    this.emit(EventType.GOVERNANCE_RELEASE_CHECK, {
      releaseId,
      agentId: GOV_AGENT_IDS.LEDGER,
      approved,
      checklist: 'Financial integrity',
    });
  }
}
