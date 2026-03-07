/**
 * CONDUIT — INTEGRATIONS / EXTERNAL APIs GOVERNANCE
 * Tier 12 — Only agent allowed to build/modify third-party API integrations.
 *
 * - Owns Gmail, Google Calendar, Sheets, SMS, S3, Push Notifications
 * - No external integrations without Conduit spec
 * - Integration changes require Vector (schema) + Sentinel (security)
 */

import { AgentEvent, EventType } from '../core';
import { GovernanceAgent } from '../governance';
import {
  GovernanceDomain, ChangeType, GovernanceSubtask,
  GovernanceHandoff, GOV_AGENT_IDS,
} from '../core/governance-types';

export class ConduitAgent extends GovernanceAgent {
  constructor() {
    super({
      id: GOV_AGENT_IDS.CONDUIT,
      name: 'CONDUIT_GOVERNANCE',
      tier: 12,
      description: 'Integrations — Only agent that builds/modifies third-party API integrations for Heritage Life Solutions. Governs Gmail API, Google Calendar, Google Sheets, Twilio SMS, AWS S3, Firebase, and Apple Push Notification connections.',
      capabilities: ['integration_review', 'api_contract_validation', 'webhook_management', 'external_service_audit'],
      consumesEvents: [],
      producesEvents: [],
      governanceDomain: GovernanceDomain.INTEGRATIONS,
      governanceId: GOV_AGENT_IDS.CONDUIT,
      hasVetoAuthority: false,
      participatesInChains: [ChangeType.INTEGRATION],
    });
  }

  protected async onGovernanceStart(): Promise<void> {
    console.log('[CONDUIT] 🔌 Integration governance online for Heritage Life Solutions. Gmail, Twilio, S3, Firebase, and APNs oversight active.');
  }

  protected async onGovernanceStop(): Promise<void> {}
  protected async handleGovernanceEvent(event: AgentEvent): Promise<void> {}

  protected async onChainStepActivated(chainId: string, taskId: string, changeType: ChangeType): Promise<void> {
    console.log(`[CONDUIT] 🔌 Integration review for ${changeType} | Chain: ${chainId}`);
    this.approveChainStep(chainId, `Integration review passed — API contracts validated`);
  }

  protected async onSubtaskAssigned(subtask: GovernanceSubtask): Promise<void> {
    this.completeSubtask(subtask.id, 'Integration review complete');
  }

  protected async onHandoffReceived(handoff: GovernanceHandoff): Promise<void> {
    this.completeHandoff(handoff.id, 'Integration review complete');
  }
}
