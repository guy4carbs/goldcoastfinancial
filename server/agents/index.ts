/**
 * GCF AGENT SYSTEM — MASTER BOOTSTRAP
 * Imports all tiers and exports bootstrapAgentSystem() that instantiates
 * and starts all 37 agents in tier order (0→10).
 */

import { BaseAgent, eventBus, EventType } from './core';

// Tier 0
import { OrchestratorAgent } from './tier0/orchestrator-agent';

// Tier 1
import { LeadDiscoveryAgent, DataEnrichmentAgent, LeadIntakeAgent, LeadScoringAgent } from './tier1';

// Tier 2
import { OutreachOrchestrationAgent, EmailOutreachAgent, SmsMessagingAgent, DialerAgent, SocialDmAgent } from './tier2';

// Tier 3
import { InboundResponseAgent, AppointmentAgent, ConversationMemoryAgent } from './tier3';

// Tier 4
import { AiSalesAgent, HumanSalesAssistAgent, CallCoachingAgent } from './tier4';

// Tier 5
import { ComplianceAgent, ApplicationCompletionAgent, UnderwritingIntelligenceAgent, PolicyRecommendationAgent } from './tier5';

// Tier 6
import { BillingAgent, CommissionAgent, RevenueForecastAgent } from './tier6';

// Tier 7
import { ClientPortalAgent, CustomerSupportAgent, ClaimsAgent, RetentionAgent } from './tier7';

// Tier 8
import { SocialPostingAgent, ContentGenerationAgent, ReputationAgent } from './tier8';

// Tier 9
import { RealTimeAnalyticsAgent, AgentPerformanceAgent, OptimizationAgent } from './tier9';

// Tier 10
import { SecurityAgent, ErrorRecoveryAgent, HumanEscalationAgent, TrainingAgent } from './tier10';

export interface AgentRegistry {
  agents: Map<string, BaseAgent>;
  getAgent(id: string): BaseAgent | undefined;
  getAllAgents(): BaseAgent[];
  getAgentsByTier(tier: number): BaseAgent[];
  stopAll(): Promise<void>;
}

export async function bootstrapAgentSystem(): Promise<AgentRegistry> {
  console.log('═══════════════════════════════════════════════');
  console.log('  GCF AGENT SYSTEM — BOOTSTRAPPING 37 AGENTS  ');
  console.log('═══════════════════════════════════════════════');

  const agents = new Map<string, BaseAgent>();

  // Instantiate all agents organized by tier
  const agentsByTier: BaseAgent[][] = [
    // Tier 0 — Orchestrator
    [new OrchestratorAgent()],
    // Tier 1 — Lead Acquisition
    [new LeadDiscoveryAgent(), new DataEnrichmentAgent(), new LeadIntakeAgent(), new LeadScoringAgent()],
    // Tier 2 — Outreach
    [new OutreachOrchestrationAgent(), new EmailOutreachAgent(), new SmsMessagingAgent(), new DialerAgent(), new SocialDmAgent()],
    // Tier 3 — Inbound & Speed
    [new InboundResponseAgent(), new AppointmentAgent(), new ConversationMemoryAgent()],
    // Tier 4 — Sales
    [new AiSalesAgent(), new HumanSalesAssistAgent(), new CallCoachingAgent()],
    // Tier 5 — Application & Compliance
    [new ComplianceAgent(), new ApplicationCompletionAgent(), new UnderwritingIntelligenceAgent(), new PolicyRecommendationAgent()],
    // Tier 6 — Financial Ops
    [new BillingAgent(), new CommissionAgent(), new RevenueForecastAgent()],
    // Tier 7 — Client Lifecycle
    [new ClientPortalAgent(), new CustomerSupportAgent(), new ClaimsAgent(), new RetentionAgent()],
    // Tier 8 — Marketing & Brand
    [new SocialPostingAgent(), new ContentGenerationAgent(), new ReputationAgent()],
    // Tier 9 — Analytics & Learning
    [new RealTimeAnalyticsAgent(), new AgentPerformanceAgent(), new OptimizationAgent()],
    // Tier 10 — Governance & Meta
    [new SecurityAgent(), new ErrorRecoveryAgent(), new HumanEscalationAgent(), new TrainingAgent()],
  ];

  // Start all agents in tier order
  for (let tier = 0; tier < agentsByTier.length; tier++) {
    console.log(`\n── Tier ${tier} ─────────────────────────────────`);
    for (const agent of agentsByTier[tier]) {
      try {
        await agent.start();
        agents.set(agent.id, agent);
      } catch (error) {
        console.error(`[BOOTSTRAP] ❌ Failed to start ${agent.config.name}:`, error);
      }
    }
  }

  const totalAgents = agents.size;
  console.log(`\n═══════════════════════════════════════════════`);
  console.log(`  ✅ ${totalAgents} AGENTS ONLINE`);
  console.log(`═══════════════════════════════════════════════\n`);

  const registry: AgentRegistry = {
    agents,
    getAgent: (id: string) => agents.get(id),
    getAllAgents: () => Array.from(agents.values()),
    getAgentsByTier: (tier: number) => Array.from(agents.values()).filter(a => a.config.tier === tier),
    stopAll: async () => {
      console.log('[BOOTSTRAP] 🛑 Stopping all agents...');
      // Stop in reverse tier order
      const sorted = Array.from(agents.values()).sort((a, b) => b.config.tier - a.config.tier);
      for (const agent of sorted) {
        try {
          await agent.stop();
        } catch (err) {
          console.error(`[BOOTSTRAP] Error stopping ${agent.config.name}:`, err);
        }
      }
      console.log('[BOOTSTRAP] All agents stopped.');
    },
  };

  return registry;
}

// Re-export everything
export * from './core';
export * from './tier1';
export * from './tier2';
export * from './tier3';
export * from './tier4';
export * from './tier5';
export * from './tier6';
export * from './tier7';
export * from './tier8';
export * from './tier9';
export * from './tier10';
