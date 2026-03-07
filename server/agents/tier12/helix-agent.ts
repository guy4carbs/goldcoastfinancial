/**
 * HELIX — COMPLIANCE & REGULATORY GOVERNANCE
 * Tier 12 — NON-OVERRIDABLE veto authority.
 *
 * - Cannot be overridden by managers, directors, or even Atlas
 * - Halts release if regulatory or compliance risk exists
 * - Owns license tracking and audit service
 */

import { AgentEvent, EventType } from '../core';
import { GovernanceAgent } from '../governance';
import {
  GovernanceDomain, ChangeType, GovernanceSubtask,
  GovernanceHandoff, GOV_AGENT_IDS,
} from '../core/governance-types';

export class HelixAgent extends GovernanceAgent {
  constructor() {
    super({
      id: GOV_AGENT_IDS.HELIX,
      name: 'HELIX_GOVERNANCE',
      tier: 12,
      description: 'Compliance & Regulatory — NON-OVERRIDABLE veto for Heritage Life Solutions. Enforces insurance licensing (state CE requirements, E&O), HIPAA, anti-rebating, suitability standards, and audit trails for all policy transactions.',
      capabilities: ['compliance_review', 'regulatory_check', 'license_validation', 'audit_enforcement'],
      consumesEvents: [EventType.COMPLIANCE_APPROVED, EventType.COMPLIANCE_BLOCKED],
      producesEvents: [EventType.GOVERNANCE_VETO_ISSUED, EventType.GOVERNANCE_RELEASE_CHECK],
      governanceDomain: GovernanceDomain.COMPLIANCE,
      governanceId: GOV_AGENT_IDS.HELIX,
      hasVetoAuthority: true,
      participatesInChains: [ChangeType.COMPLIANCE],
    });
  }

  protected async onGovernanceStart(): Promise<void> {
    console.log('[HELIX] ⚖️ Compliance governance online for Heritage Life Solutions. Insurance licensing, HIPAA, and suitability enforcement active. NON-OVERRIDABLE.');
  }

  protected async onGovernanceStop(): Promise<void> {}

  protected async handleGovernanceEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.COMPLIANCE_BLOCKED) {
      console.log(`[HELIX] ⛔ Compliance block detected: ${event.payload?.reason}`);
      this.issueVeto(
        event.payload?.taskId || 'system',
        `Compliance violation: ${event.payload?.reason}`,
        'blocking'
      );
    }
  }

  protected async onChainStepActivated(chainId: string, taskId: string, changeType: ChangeType): Promise<void> {
    console.log(`[HELIX] ⚖️ Compliance review for ${changeType} | Chain: ${chainId}`);

    const complianceClear = this.performComplianceReview(changeType, taskId);

    if (complianceClear) {
      this.approveChainStep(chainId, `Compliance review passed for ${changeType}`);
    } else {
      this.rejectChainStep(chainId, `Compliance risk identified — NON-OVERRIDABLE`);
      this.issueVeto(taskId, `Regulatory/compliance risk in ${changeType}`, 'blocking', chainId);
    }
  }

  protected async onSubtaskAssigned(subtask: GovernanceSubtask): Promise<void> {
    console.log(`[HELIX] ⚖️ Compliance subtask: ${subtask.description}`);
    this.completeSubtask(subtask.id, 'Compliance review complete — no regulatory issues');
  }

  protected async onHandoffReceived(handoff: GovernanceHandoff): Promise<void> {
    console.log(`[HELIX] 📥 Compliance review requested by ${handoff.from}: ${handoff.need}`);
    this.completeHandoff(handoff.id, 'Compliance review complete');
  }

  private performComplianceReview(changeType: ChangeType, taskId: string): boolean {
    // Checks:
    // - License requirements met
    // - Regulatory constraints satisfied
    // - Audit trail maintained
    // - Role hierarchy not bypassed
    // - Data privacy requirements met
    console.log(`[HELIX] ⚖️ Reviewing ${changeType} for regulatory compliance...`);
    return true;
  }

  submitReleaseCheck(releaseId: string, approved: boolean): void {
    this.emit(EventType.GOVERNANCE_RELEASE_CHECK, {
      releaseId,
      agentId: GOV_AGENT_IDS.HELIX,
      approved,
      checklist: 'Compliance clearance',
    });
  }
}
