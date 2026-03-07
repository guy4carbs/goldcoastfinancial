/**
 * CORE EXPORTS
 * The foundational infrastructure layer of the GCF Agent System.
 */

export { EventBus, EventType, eventBus } from './event-bus';
export type { AgentEvent, Subscription } from './event-bus';

export { BaseAgent, AgentStatus } from './base-agent';
export type { AgentConfig, AgentMetrics } from './base-agent';

export { MemoryGraph, NodeType, EdgeType, memoryGraph } from './memory-graph';
export type { GraphNode, GraphEdge, LeadData, ClientData, PolicyData, ConversationData } from './memory-graph';

export { KnowledgeBase, knowledgeBase } from './knowledge-base';
export type { Carrier, ProductTemplate, ObjectionResponse, ComplianceRule, SalesScript, EmailTemplate } from './knowledge-base';

export { AnalyticsLedger, MetricType, analyticsLedger } from './analytics-ledger';
export type { LedgerEntry, TimeWindow } from './analytics-ledger';

export { SecurityLayer, Permission, securityLayer } from './security-layer';
export type { AuditEntry } from './security-layer';

export {
  GovernanceDomain, ChangeType, GovernanceTaskStatus,
  GOV_AGENT_IDS, CHANGE_CHAIN_DEFINITIONS, VETO_AUTHORITIES,
  DOMAIN_BOUNDARIES, RELEASE_CHECKLIST, NON_NEGOTIABLE_DOMAINS,
  SYSTEM_INTEGRITY_RULES,
} from './governance-types';
export type {
  GovernanceAgentId, GovernanceTask, GovernanceSubtask,
  GovernanceHandoff, ChangeChain, ChangeChainStepResult,
  VetoRecord, VetoAuthority, DomainBoundary, ReleaseChecklistItem,
} from './governance-types';

export { ChangeChainEngine, changeChainEngine } from './change-chain-engine';
export { VetoEngine, vetoEngine } from './veto-engine';
