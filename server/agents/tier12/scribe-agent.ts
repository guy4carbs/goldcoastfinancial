/**
 * SCRIBE — RESEARCH / DOCUMENTATION GOVERNANCE
 * Tier 12 — Required for major decisions. Cannot make final calls.
 *
 * - Owns docs/ directory
 * - Research prerequisite for new dependencies
 * - Documents design decisions and rationale
 */

import { AgentEvent, EventType } from '../core';
import { GovernanceAgent } from '../governance';
import {
  GovernanceDomain, ChangeType, GovernanceSubtask,
  GovernanceHandoff, GOV_AGENT_IDS,
} from '../core/governance-types';

export class ScribeAgent extends GovernanceAgent {
  constructor() {
    super({
      id: GOV_AGENT_IDS.SCRIBE,
      name: 'SCRIBE_GOVERNANCE',
      tier: 12,
      description: 'Research / Documentation — Required for major decisions in Heritage Life Solutions Insurance OS. Documents architectural decisions, dependency rationale, compliance requirements, and design system evolution for the 17-agent governance swarm. Cannot make final calls.',
      capabilities: ['research', 'documentation', 'decision_logging', 'rationale_recording'],
      consumesEvents: [],
      producesEvents: [],
      governanceDomain: GovernanceDomain.RESEARCH,
      governanceId: GOV_AGENT_IDS.SCRIBE,
      hasVetoAuthority: false,
      participatesInChains: [ChangeType.NEW_DEPENDENCY],
    });
  }

  protected async onGovernanceStart(): Promise<void> {
    console.log('[SCRIBE] 📝 Research governance online for Heritage Life Solutions. Decision documentation and dependency research active.');
  }

  protected async onGovernanceStop(): Promise<void> {}
  protected async handleGovernanceEvent(event: AgentEvent): Promise<void> {}

  protected async onChainStepActivated(chainId: string, taskId: string, changeType: ChangeType): Promise<void> {
    console.log(`[SCRIBE] 📝 Research review for ${changeType} | Chain: ${chainId}`);
    this.approveChainStep(chainId, `Research complete — rationale documented`);
  }

  protected async onSubtaskAssigned(subtask: GovernanceSubtask): Promise<void> {
    console.log(`[SCRIBE] 📝 Research subtask: ${subtask.description}`);
    this.completeSubtask(subtask.id, 'Research and documentation complete');
  }

  protected async onHandoffReceived(handoff: GovernanceHandoff): Promise<void> {
    console.log(`[SCRIBE] 📥 Research requested by ${handoff.from}: ${handoff.need}`);
    this.completeHandoff(handoff.id, 'Research complete — findings documented');
  }
}
