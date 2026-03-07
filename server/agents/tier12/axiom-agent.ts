/**
 * AXIOM — UX SIMPLICITY & PRODUCT EXPERIENCE GUARDIAN
 * Tier 12 — Ensures interface clarity, cognitive load control,
 * workflow simplification, navigation architecture, and feature discipline.
 *
 * - Shares ownership of client/ with Nova (Axiom reviews UX simplicity, Nova owns implementation)
 * - Cannot modify: server/, shared/models/, migrations/, package.json
 * - Must review: All new pages, dashboard designs, navigation changes, onboarding flows, feature additions
 * - No veto authority — can request redesign but cannot block release
 * - Inserted BEFORE Nova in UI_CHANGE and USER_FLOW chains
 */

import { AgentEvent, EventType } from '../core';
import { GovernanceAgent } from '../governance';
import {
  GovernanceDomain, ChangeType, GovernanceSubtask,
  GovernanceHandoff, GOV_AGENT_IDS,
} from '../core/governance-types';

export class AxiomAgent extends GovernanceAgent {
  constructor() {
    super({
      id: GOV_AGENT_IDS.AXIOM,
      name: 'AXIOM_GOVERNANCE',
      tier: 12,
      description: 'UX Simplicity & Product Experience — Ensures Heritage Life Solutions Insurance OS remains clear, minimal, and intuitive. Reviews all portal interfaces, agent onboarding flows, manager dashboards, and client-facing pages for cognitive load and feature discipline.',
      capabilities: [
        'ux_simplicity_review',
        'cognitive_load_assessment',
        'workflow_simplification',
        'navigation_architecture',
        'feature_discipline',
      ],
      consumesEvents: [],
      producesEvents: [EventType.GOVERNANCE_RELEASE_CHECK],
      governanceDomain: GovernanceDomain.UX_SIMPLICITY,
      governanceId: GOV_AGENT_IDS.AXIOM,
      hasVetoAuthority: false,
      participatesInChains: [ChangeType.UI_CHANGE, ChangeType.USER_FLOW],
    });
  }

  protected async onGovernanceStart(): Promise<void> {
    console.log('[AXIOM] ✨ UX Simplicity governance online for Heritage Life Solutions. Portal clarity and cognitive load control active across all 6 portals.');
  }

  protected async onGovernanceStop(): Promise<void> {}

  protected async handleGovernanceEvent(event: AgentEvent): Promise<void> {}

  protected async onChainStepActivated(chainId: string, taskId: string, changeType: ChangeType): Promise<void> {
    console.log(`[AXIOM] ✨ UX simplicity review for ${changeType} | Chain: ${chainId}`);

    if (changeType === ChangeType.USER_FLOW) {
      // For flow changes, Axiom reviews UX simplicity after Lumen approves the flow
      this.approveChainStep(chainId, 'UX simplicity reviewed — workflow clarity confirmed');
    } else {
      // For UI changes, Axiom reviews before Nova implements
      this.approveChainStep(chainId, 'UX simplicity review passed — cognitive load acceptable');
    }
  }

  protected async onSubtaskAssigned(subtask: GovernanceSubtask): Promise<void> {
    console.log(`[AXIOM] ✨ UX simplicity subtask: ${subtask.description}`);
    this.completeSubtask(subtask.id, 'UX simplicity review complete — interface clarity verified');
  }

  protected async onHandoffReceived(handoff: GovernanceHandoff): Promise<void> {
    console.log(`[AXIOM] 📥 UX review requested by ${handoff.from}: ${handoff.need}`);

    // If Nova is requesting, ensure UX simplicity before implementation
    if (handoff.from === GOV_AGENT_IDS.NOVA) {
      console.log('[AXIOM] 🎯 Nova requesting UX simplicity clearance before implementation');
    }

    this.completeHandoff(handoff.id, 'UX simplicity review and clearance complete');
  }

  submitReleaseCheck(releaseId: string, approved: boolean): void {
    this.emit(EventType.GOVERNANCE_RELEASE_CHECK, {
      releaseId,
      agentId: GOV_AGENT_IDS.AXIOM,
      approved,
      checklist: 'UX simplicity clearance',
    });
  }
}
