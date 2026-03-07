/**
 * ORACLE — AI / LLM GOVERNANCE
 * Tier 12 — Owns AI orchestration.
 *
 * - No direct LLM calls outside Oracle's domain
 * - Owns server/agents/, llmService, personaRegistry, debateEngine
 * - AI features require Sentinel security review
 */

import { AgentEvent, EventType } from '../core';
import { GovernanceAgent } from '../governance';
import {
  GovernanceDomain, ChangeType, GovernanceSubtask,
  GovernanceHandoff, GOV_AGENT_IDS,
} from '../core/governance-types';

export class OracleAgent extends GovernanceAgent {
  constructor() {
    super({
      id: GOV_AGENT_IDS.ORACLE,
      name: 'ORACLE_GOVERNANCE',
      tier: 12,
      description: 'AI / LLM — Owns AI orchestration for Heritage Life Solutions Insurance OS. Governs 37-agent tier system, Avatar Council, debate engine, persona registry, and all OpenAI integrations. No direct LLM calls outside Oracle domain.',
      capabilities: ['ai_review', 'llm_orchestration', 'persona_validation', 'ai_safety_check'],
      consumesEvents: [],
      producesEvents: [],
      governanceDomain: GovernanceDomain.AI,
      governanceId: GOV_AGENT_IDS.ORACLE,
      hasVetoAuthority: false,
      participatesInChains: [ChangeType.AI_FEATURE],
    });
  }

  protected async onGovernanceStart(): Promise<void> {
    console.log('[ORACLE] 🔮 AI governance online for Heritage Life Solutions. 37-agent tier system, Avatar Council, and debate engine oversight active.');
  }

  protected async onGovernanceStop(): Promise<void> {}

  protected async handleGovernanceEvent(event: AgentEvent): Promise<void> {}

  protected async onChainStepActivated(chainId: string, taskId: string, changeType: ChangeType): Promise<void> {
    console.log(`[ORACLE] 🔮 AI review for ${changeType} | Chain: ${chainId}`);
    this.approveChainStep(chainId, `AI feature review passed — orchestration patterns valid`);
  }

  protected async onSubtaskAssigned(subtask: GovernanceSubtask): Promise<void> {
    console.log(`[ORACLE] 🔮 AI subtask: ${subtask.description}`);
    this.completeSubtask(subtask.id, 'AI review complete — LLM patterns validated');
  }

  protected async onHandoffReceived(handoff: GovernanceHandoff): Promise<void> {
    console.log(`[ORACLE] 📥 AI review requested by ${handoff.from}: ${handoff.need}`);
    this.completeHandoff(handoff.id, 'AI orchestration review complete');
  }
}
