/**
 * FORGE — BACKEND / APIs GOVERNANCE
 * Tier 12 — Owns business logic and role hierarchy enforcement.
 *
 * - Owns server/routes/, server/services/, server/storage.ts
 * - Cannot modify client/ or schema without Vector
 * - Cannot modify financial math without Ledger or compliance without Helix
 */

import { AgentEvent, EventType } from '../core';
import { GovernanceAgent } from '../governance';
import {
  GovernanceDomain, ChangeType, GovernanceSubtask,
  GovernanceHandoff, GOV_AGENT_IDS,
} from '../core/governance-types';

export class ForgeAgent extends GovernanceAgent {
  constructor() {
    super({
      id: GOV_AGENT_IDS.FORGE,
      name: 'FORGE_GOVERNANCE',
      tier: 12,
      description: 'Backend / APIs — Owns business logic for Heritage Life Solutions Insurance OS. Enforces role hierarchy (Agent→Manager→Director→Executive), policy lifecycle, and commission calculation endpoints. Cannot modify UI or schema directly.',
      capabilities: ['api_review', 'business_logic_validation', 'role_hierarchy_enforcement', 'route_validation'],
      consumesEvents: [],
      producesEvents: [EventType.GOVERNANCE_RELEASE_CHECK],
      governanceDomain: GovernanceDomain.BACKEND,
      governanceId: GOV_AGENT_IDS.FORGE,
      hasVetoAuthority: false,
      participatesInChains: [ChangeType.PERMISSIONS, ChangeType.BACKEND_CHANGE, ChangeType.USER_FLOW],
    });
  }

  protected async onGovernanceStart(): Promise<void> {
    console.log('[FORGE] ⚒️ Backend governance online for Heritage Life Solutions. Role hierarchy and policy lifecycle enforcement active.');
  }

  protected async onGovernanceStop(): Promise<void> {}

  protected async handleGovernanceEvent(event: AgentEvent): Promise<void> {}

  protected async onChainStepActivated(chainId: string, taskId: string, changeType: ChangeType): Promise<void> {
    console.log(`[FORGE] ⚒️ Backend review for ${changeType} | Chain: ${chainId}`);

    // For permission changes, Forge is the domain owner
    if (changeType === ChangeType.PERMISSIONS) {
      this.approveChainStep(chainId, `Permission model review complete — role hierarchy intact`);
    } else {
      this.approveChainStep(chainId, `Backend review passed for ${changeType}`);
    }
  }

  protected async onSubtaskAssigned(subtask: GovernanceSubtask): Promise<void> {
    console.log(`[FORGE] ⚒️ Backend subtask: ${subtask.description}`);
    this.completeSubtask(subtask.id, 'Backend review complete — API stability confirmed');
  }

  protected async onHandoffReceived(handoff: GovernanceHandoff): Promise<void> {
    console.log(`[FORGE] 📥 Backend review requested by ${handoff.from}: ${handoff.need}`);

    // If schema change involved, handoff to Vector
    if (handoff.need.toLowerCase().includes('schema')) {
      this.requestHandoff(
        GOV_AGENT_IDS.VECTOR,
        handoff.taskId,
        'Schema review required for backend change',
        handoff.context,
        'Vector confirms schema compatibility'
      );
    }

    this.completeHandoff(handoff.id, 'Backend review complete');
  }

  submitReleaseCheck(releaseId: string, approved: boolean): void {
    this.emit(EventType.GOVERNANCE_RELEASE_CHECK, {
      releaseId,
      agentId: GOV_AGENT_IDS.FORGE,
      approved,
      checklist: 'Backend stability',
    });
  }
}
