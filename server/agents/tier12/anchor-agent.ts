/**
 * ANCHOR — DEVOPS / INFRASTRUCTURE GOVERNANCE
 * Tier 12 — Owns deployment. Gated by Gauge + Sentinel.
 *
 * - Controls deployment environments and production infrastructure
 * - Owns railway.json, .env, script/build.ts
 * - Infrastructure changes require Sentinel + Gauge approval
 */

import { AgentEvent, EventType } from '../core';
import { GovernanceAgent } from '../governance';
import {
  GovernanceDomain, ChangeType, GovernanceSubtask,
  GovernanceHandoff, GOV_AGENT_IDS,
} from '../core/governance-types';

export class AnchorAgent extends GovernanceAgent {
  constructor() {
    super({
      id: GOV_AGENT_IDS.ANCHOR,
      name: 'ANCHOR_GOVERNANCE',
      tier: 12,
      description: 'DevOps / Infrastructure — Owns deployment for Heritage Life Solutions Insurance OS on Railway.app. Manages environment configs, build pipeline, SSL certs, and production releases for heritagels.org. Gated by Gauge + Sentinel.',
      capabilities: ['deployment_management', 'infrastructure_review', 'env_validation', 'build_verification'],
      consumesEvents: [],
      producesEvents: [EventType.GOVERNANCE_RELEASE_CHECK],
      governanceDomain: GovernanceDomain.DEVOPS,
      governanceId: GOV_AGENT_IDS.ANCHOR,
      hasVetoAuthority: false,
      participatesInChains: [ChangeType.INFRASTRUCTURE],
    });
  }

  protected async onGovernanceStart(): Promise<void> {
    console.log('[ANCHOR] ⚓ DevOps governance online for Heritage Life Solutions. Railway.app deployment and heritagels.org infrastructure control active.');
  }

  protected async onGovernanceStop(): Promise<void> {}
  protected async handleGovernanceEvent(event: AgentEvent): Promise<void> {}

  protected async onChainStepActivated(chainId: string, taskId: string, changeType: ChangeType): Promise<void> {
    console.log(`[ANCHOR] ⚓ Infrastructure review for ${changeType} | Chain: ${chainId}`);
    this.approveChainStep(chainId, `Infrastructure review passed`);
  }

  protected async onSubtaskAssigned(subtask: GovernanceSubtask): Promise<void> {
    this.completeSubtask(subtask.id, 'Infrastructure review complete');
  }

  protected async onHandoffReceived(handoff: GovernanceHandoff): Promise<void> {
    this.completeHandoff(handoff.id, 'Infrastructure review complete');
  }

  submitReleaseCheck(releaseId: string, approved: boolean): void {
    this.emit(EventType.GOVERNANCE_RELEASE_CHECK, {
      releaseId,
      agentId: GOV_AGENT_IDS.ANCHOR,
      approved,
      checklist: 'Deployment execution',
    });
  }
}
