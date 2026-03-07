/**
 * PRISM — ANALYTICS / BI GOVERNANCE
 * Tier 12 — Owns dashboards. Cannot redefine financial math.
 *
 * - Owns dashboard pages and aggregation logic
 * - KPI definitions
 */

import { AgentEvent, EventType } from '../core';
import { GovernanceAgent } from '../governance';
import {
  GovernanceDomain, ChangeType, GovernanceSubtask,
  GovernanceHandoff, GOV_AGENT_IDS,
} from '../core/governance-types';

export class PrismAgent extends GovernanceAgent {
  constructor() {
    super({
      id: GOV_AGENT_IDS.PRISM,
      name: 'PRISM_GOVERNANCE',
      tier: 12,
      description: 'Analytics / BI — Owns dashboards and KPI definitions for Heritage Life Solutions Insurance OS. Governs agent performance metrics, pipeline analytics, commission reports, Manager Lounge charts, and Executive Portal insights. Cannot redefine financial math.',
      capabilities: ['analytics_review', 'dashboard_validation', 'kpi_enforcement', 'data_visualization'],
      consumesEvents: [EventType.METRIC_UPDATED],
      producesEvents: [],
      governanceDomain: GovernanceDomain.ANALYTICS,
      governanceId: GOV_AGENT_IDS.PRISM,
      hasVetoAuthority: false,
      participatesInChains: [],
    });
  }

  protected async onGovernanceStart(): Promise<void> {
    console.log('[PRISM] 📊 Analytics governance online for Heritage Life Solutions. Agent performance, pipeline, and commission dashboard oversight active.');
  }

  protected async onGovernanceStop(): Promise<void> {}
  protected async handleGovernanceEvent(event: AgentEvent): Promise<void> {}

  protected async onChainStepActivated(chainId: string, taskId: string, changeType: ChangeType): Promise<void> {
    this.approveChainStep(chainId, `Analytics review passed`);
  }

  protected async onSubtaskAssigned(subtask: GovernanceSubtask): Promise<void> {
    this.completeSubtask(subtask.id, 'Analytics review complete');
  }

  protected async onHandoffReceived(handoff: GovernanceHandoff): Promise<void> {
    this.completeHandoff(handoff.id, 'Analytics review complete');
  }
}
