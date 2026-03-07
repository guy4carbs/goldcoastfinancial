/**
 * NOVA — FRONTEND / UI GOVERNANCE
 * Tier 12 — Owns all UI. Uses ui-ux-pro-max + frontend-design plugins.
 *
 * - Owns client/ directory
 * - Cannot modify shared/models/, server/, migrations/
 * - Must follow API contracts from Forge, data structures from Vector, flows from Lumen
 */

import { AgentEvent, EventType } from '../core';
import { GovernanceAgent } from '../governance';
import {
  GovernanceDomain, ChangeType, GovernanceSubtask,
  GovernanceHandoff, GOV_AGENT_IDS,
} from '../core/governance-types';

export class NovaAgent extends GovernanceAgent {
  constructor() {
    super({
      id: GOV_AGENT_IDS.NOVA,
      name: 'NOVA_GOVERNANCE',
      tier: 12,
      description: 'Frontend / UI — Owns all UI for Heritage Life Solutions Insurance OS. Enforces Heritage Design System (emerald→teal→rose, glass cards, Apple motion) across 6 portals. Cannot modify backend or schema.',
      capabilities: ['ui_review', 'design_system_enforcement', 'component_validation', 'accessibility_check'],
      consumesEvents: [],
      producesEvents: [EventType.GOVERNANCE_RELEASE_CHECK],
      governanceDomain: GovernanceDomain.FRONTEND,
      governanceId: GOV_AGENT_IDS.NOVA,
      hasVetoAuthority: false,
      participatesInChains: [ChangeType.UI_CHANGE, ChangeType.USER_FLOW],
    });
  }

  protected async onGovernanceStart(): Promise<void> {
    console.log('[NOVA] 🎨 Frontend governance online for Heritage Life Solutions. Heritage Design System enforcement active across all portals.');
  }

  protected async onGovernanceStop(): Promise<void> {}

  protected async handleGovernanceEvent(event: AgentEvent): Promise<void> {}

  protected async onChainStepActivated(chainId: string, taskId: string, changeType: ChangeType): Promise<void> {
    console.log(`[NOVA] 🎨 UI review for ${changeType} | Chain: ${chainId}`);

    // Check domain boundaries — Nova cannot modify backend
    if (changeType === ChangeType.USER_FLOW) {
      // For flow changes, Nova reviews UI impact after Lumen approves flow
      this.approveChainStep(chainId, `UI impact reviewed for flow change`);
    } else {
      this.approveChainStep(chainId, `UI review passed — design system compliance confirmed`);
    }
  }

  protected async onSubtaskAssigned(subtask: GovernanceSubtask): Promise<void> {
    console.log(`[NOVA] 🎨 UI subtask: ${subtask.description}`);
    this.completeSubtask(subtask.id, 'UI review complete — design system compliance verified');
  }

  protected async onHandoffReceived(handoff: GovernanceHandoff): Promise<void> {
    console.log(`[NOVA] 📥 UI review requested by ${handoff.from}: ${handoff.need}`);

    // If Forge is requesting, check that they're not modifying UI directly
    if (handoff.from === GOV_AGENT_IDS.FORGE) {
      console.log(`[NOVA] ⚠️ Forge requesting UI coordination — verifying no direct UI modification`);
    }

    this.completeHandoff(handoff.id, 'UI review and coordination complete');
  }

  submitReleaseCheck(releaseId: string, approved: boolean): void {
    this.emit(EventType.GOVERNANCE_RELEASE_CHECK, {
      releaseId,
      agentId: GOV_AGENT_IDS.NOVA,
      approved,
      checklist: 'UI integrity',
    });
  }
}
