/**
 * GOVERNANCE TYPES
 * All shared types, enums, constants, and definitions for the
 * 16-agent governance swarm (Tier 11–12).
 *
 * Source of truth: CLAUDE.md agent swarm specification.
 */

// ─── Governance Domains ──────────────────────────────────────────
export enum GovernanceDomain {
  ARCHITECTURE = 'ARCHITECTURE',
  FRONTEND = 'FRONTEND',
  BACKEND = 'BACKEND',
  DATABASE = 'DATABASE',
  AI = 'AI',
  AUTOMATION = 'AUTOMATION',
  DEVOPS = 'DEVOPS',
  ANALYTICS = 'ANALYTICS',
  FINANCIAL = 'FINANCIAL',
  COMPLIANCE = 'COMPLIANCE',
  SECURITY = 'SECURITY',
  QA = 'QA',
  FLOWS = 'FLOWS',
  INTEGRATIONS = 'INTEGRATIONS',
  DEPENDENCIES = 'DEPENDENCIES',
  RESEARCH = 'RESEARCH',
  UX_SIMPLICITY = 'UX_SIMPLICITY',
}

// ─── Change Types ────────────────────────────────────────────────
export enum ChangeType {
  SCHEMA = 'SCHEMA',
  FINANCIAL_LOGIC = 'FINANCIAL_LOGIC',
  COMPLIANCE = 'COMPLIANCE',
  AI_FEATURE = 'AI_FEATURE',
  PERMISSIONS = 'PERMISSIONS',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  USER_FLOW = 'USER_FLOW',
  INTEGRATION = 'INTEGRATION',
  UI_CHANGE = 'UI_CHANGE',
  BACKEND_CHANGE = 'BACKEND_CHANGE',
  NEW_DEPENDENCY = 'NEW_DEPENDENCY',
  DEPENDENCY_UPGRADE = 'DEPENDENCY_UPGRADE',
}

// ─── Governance Agent IDs (gov- prefix avoids collision) ─────────
export const GOV_AGENT_IDS = {
  ATLAS: 'gov-atlas',
  NOVA: 'gov-nova',
  FORGE: 'gov-forge',
  VECTOR: 'gov-vector',
  ORACLE: 'gov-oracle',
  RELAY: 'gov-relay',
  ANCHOR: 'gov-anchor',
  PRISM: 'gov-prism',
  LEDGER: 'gov-ledger',
  HELIX: 'gov-helix',
  SENTINEL: 'gov-sentinel',
  GAUGE: 'gov-gauge',
  LUMEN: 'gov-lumen',
  CONDUIT: 'gov-conduit',
  SCOUT: 'gov-scout',
  SCRIBE: 'gov-scribe',
  AXIOM: 'gov-axiom',
} as const;

export type GovernanceAgentId = typeof GOV_AGENT_IDS[keyof typeof GOV_AGENT_IDS];

// ─── Task Status ─────────────────────────────────────────────────
export enum GovernanceTaskStatus {
  SUBMITTED = 'SUBMITTED',
  DECOMPOSED = 'DECOMPOSED',
  IN_PROGRESS = 'IN_PROGRESS',
  AWAITING_CHAIN = 'AWAITING_CHAIN',
  VETOED = 'VETOED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

// ─── Governance Task ─────────────────────────────────────────────
export interface GovernanceTask {
  id: string;
  title: string;
  description: string;
  changeType: ChangeType;
  submittedBy: string;
  submittedAt: number;
  status: GovernanceTaskStatus;
  subtasks: GovernanceSubtask[];
  chainId?: string;
  vetoRecords: VetoRecord[];
  completedAt?: number;
  result?: string;
}

// ─── Subtask ─────────────────────────────────────────────────────
export interface GovernanceSubtask {
  id: string;
  taskId: string;
  assignedTo: GovernanceAgentId;
  description: string;
  acceptanceCriteria: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'vetoed';
  result?: string;
  completedAt?: number;
}

// ─── Handoff ─────────────────────────────────────────────────────
export interface GovernanceHandoff {
  id: string;
  from: GovernanceAgentId;
  to: GovernanceAgentId;
  taskId: string;
  need: string;
  context: string;
  blockedUntil: string;
  status: 'pending' | 'accepted' | 'completed' | 'rejected';
  createdAt: number;
  resolvedAt?: number;
}

// ─── Change Chain ────────────────────────────────────────────────
export interface ChangeChain {
  id: string;
  changeType: ChangeType;
  taskId: string;
  steps: GovernanceAgentId[];
  currentStepIndex: number;
  status: 'active' | 'completed' | 'vetoed' | 'failed';
  stepResults: ChangeChainStepResult[];
  startedAt: number;
  completedAt?: number;
}

export interface ChangeChainStepResult {
  agentId: GovernanceAgentId;
  approved: boolean;
  reason: string;
  timestamp: number;
}

// ─── Veto Record ─────────────────────────────────────────────────
export interface VetoRecord {
  id: string;
  issuedBy: GovernanceAgentId;
  taskId: string;
  chainId?: string;
  reason: string;
  severity: 'warning' | 'critical' | 'blocking';
  overridable: boolean;
  overriddenBy?: GovernanceAgentId;
  issuedAt: number;
  resolvedAt?: number;
  resolution?: string;
}

// ─── Change Chain Definitions (from CLAUDE.md) ───────────────────
export const CHANGE_CHAIN_DEFINITIONS: Record<ChangeType, GovernanceAgentId[]> = {
  [ChangeType.SCHEMA]: [
    GOV_AGENT_IDS.VECTOR,
    GOV_AGENT_IDS.SENTINEL,
    GOV_AGENT_IDS.GAUGE,
    GOV_AGENT_IDS.ATLAS,
  ],
  [ChangeType.FINANCIAL_LOGIC]: [
    GOV_AGENT_IDS.LEDGER,
    GOV_AGENT_IDS.VECTOR,
    GOV_AGENT_IDS.SENTINEL,
    GOV_AGENT_IDS.GAUGE,
    GOV_AGENT_IDS.ATLAS,
  ],
  [ChangeType.COMPLIANCE]: [
    GOV_AGENT_IDS.HELIX,
    GOV_AGENT_IDS.SENTINEL,
    GOV_AGENT_IDS.ATLAS,
  ],
  [ChangeType.AI_FEATURE]: [
    GOV_AGENT_IDS.ORACLE,
    GOV_AGENT_IDS.SENTINEL,
    GOV_AGENT_IDS.ATLAS,
  ],
  [ChangeType.PERMISSIONS]: [
    GOV_AGENT_IDS.FORGE,
    GOV_AGENT_IDS.SENTINEL,
    GOV_AGENT_IDS.ATLAS,
  ],
  [ChangeType.INFRASTRUCTURE]: [
    GOV_AGENT_IDS.ANCHOR,
    GOV_AGENT_IDS.SENTINEL,
    GOV_AGENT_IDS.GAUGE,
    GOV_AGENT_IDS.ATLAS,
  ],
  [ChangeType.USER_FLOW]: [
    GOV_AGENT_IDS.LUMEN,
    GOV_AGENT_IDS.AXIOM,
    GOV_AGENT_IDS.NOVA,
    GOV_AGENT_IDS.FORGE,
    GOV_AGENT_IDS.GAUGE,
  ],
  [ChangeType.INTEGRATION]: [
    GOV_AGENT_IDS.CONDUIT,
    GOV_AGENT_IDS.VECTOR,
    GOV_AGENT_IDS.SENTINEL,
    GOV_AGENT_IDS.GAUGE,
  ],
  [ChangeType.UI_CHANGE]: [
    GOV_AGENT_IDS.AXIOM,
    GOV_AGENT_IDS.NOVA,
    GOV_AGENT_IDS.GAUGE,
  ],
  [ChangeType.BACKEND_CHANGE]: [
    GOV_AGENT_IDS.FORGE,
    GOV_AGENT_IDS.GAUGE,
  ],
  [ChangeType.NEW_DEPENDENCY]: [
    GOV_AGENT_IDS.SCRIBE,
    GOV_AGENT_IDS.ATLAS,
    GOV_AGENT_IDS.SCOUT,
    GOV_AGENT_IDS.SENTINEL,
    GOV_AGENT_IDS.GAUGE,
  ],
  [ChangeType.DEPENDENCY_UPGRADE]: [
    GOV_AGENT_IDS.SCOUT,
    GOV_AGENT_IDS.SENTINEL,
    GOV_AGENT_IDS.GAUGE,
  ],
};

// ─── Veto Authorities ────────────────────────────────────────────
export interface VetoAuthority {
  agentId: GovernanceAgentId;
  domain: string;
  description: string;
  overridableBy: GovernanceAgentId[];
}

export const VETO_AUTHORITIES: VetoAuthority[] = [
  {
    agentId: GOV_AGENT_IDS.SENTINEL,
    domain: 'security',
    description: 'Blocks release for security risks',
    overridableBy: [GOV_AGENT_IDS.ATLAS],
  },
  {
    agentId: GOV_AGENT_IDS.LEDGER,
    domain: 'financial',
    description: 'Blocks changes to compensation logic',
    overridableBy: [GOV_AGENT_IDS.ATLAS],
  },
  {
    agentId: GOV_AGENT_IDS.HELIX,
    domain: 'compliance',
    description: 'Blocks compliance bypass attempts — CANNOT be overridden',
    overridableBy: [], // Non-overridable, even by Atlas
  },
  {
    agentId: GOV_AGENT_IDS.GAUGE,
    domain: 'quality',
    description: 'Blocks release if tests fail',
    overridableBy: [GOV_AGENT_IDS.ATLAS],
  },
];

// ─── Domain Boundaries ──────────────────────────────────────────
export interface DomainBoundary {
  agentId: GovernanceAgentId;
  domain: GovernanceDomain;
  ownsPaths: string[];
  cannotModify: string[];
  mustFollow: string[];
}

export const DOMAIN_BOUNDARIES: DomainBoundary[] = [
  {
    agentId: GOV_AGENT_IDS.NOVA,
    domain: GovernanceDomain.FRONTEND,
    ownsPaths: ['client/'],
    cannotModify: ['shared/models/', 'server/', 'migrations/'],
    mustFollow: ['API contracts from Forge', 'data structures from Vector', 'flows from Lumen'],
  },
  {
    agentId: GOV_AGENT_IDS.FORGE,
    domain: GovernanceDomain.BACKEND,
    ownsPaths: ['server/routes/', 'server/services/', 'server/storage.ts'],
    cannotModify: ['client/'],
    mustFollow: ['schema changes require Vector', 'financial math requires Ledger', 'compliance requires Helix'],
  },
  {
    agentId: GOV_AGENT_IDS.VECTOR,
    domain: GovernanceDomain.DATABASE,
    ownsPaths: ['shared/models/', 'migrations/', 'drizzle.config.ts'],
    cannotModify: ['client/', 'server/routes/'],
    mustFollow: ['Atlas approval', 'Sentinel review', 'Gauge regression'],
  },
  {
    agentId: GOV_AGENT_IDS.ORACLE,
    domain: GovernanceDomain.AI,
    ownsPaths: ['server/agents/', 'server/services/llmService.ts', 'server/services/personaRegistry.ts', 'server/services/debateEngine.ts', 'server/services/avatarRegistry.ts', 'server/services/orchestrationEngine.ts', 'server/websocket-avatars.ts'],
    cannotModify: ['client/', 'shared/models/'],
    mustFollow: ['Sentinel security review'],
  },
  {
    agentId: GOV_AGENT_IDS.RELAY,
    domain: GovernanceDomain.AUTOMATION,
    ownsPaths: ['server/services/automation-engine.ts', 'server/services/workflow-engine.ts', 'server/services/jobQueue.ts', 'server/services/autoRouter.ts'],
    cannotModify: ['client/', 'shared/models/'],
    mustFollow: ['Cannot invent business rules'],
  },
  {
    agentId: GOV_AGENT_IDS.ANCHOR,
    domain: GovernanceDomain.DEVOPS,
    ownsPaths: ['railway.json', '.env', 'script/build.ts'],
    cannotModify: ['client/', 'server/routes/'],
    mustFollow: ['Gated by Gauge + Sentinel'],
  },
  {
    agentId: GOV_AGENT_IDS.PRISM,
    domain: GovernanceDomain.ANALYTICS,
    ownsPaths: ['client/src/pages/'],
    cannotModify: ['server/services/', 'shared/models/'],
    mustFollow: ['Cannot redefine financial math'],
  },
  {
    agentId: GOV_AGENT_IDS.LEDGER,
    domain: GovernanceDomain.FINANCIAL,
    ownsPaths: ['shared/models/enterprise.ts', 'server/services/'],
    cannotModify: ['client/'],
    mustFollow: ['Veto power on compensation logic'],
  },
  {
    agentId: GOV_AGENT_IDS.HELIX,
    domain: GovernanceDomain.COMPLIANCE,
    ownsPaths: ['shared/models/licenses.ts', 'shared/models/security.ts', 'server/routes/licenses.ts', 'server/services/auditService.ts'],
    cannotModify: ['client/'],
    mustFollow: ['Cannot be overridden by managers/directors'],
  },
  {
    agentId: GOV_AGENT_IDS.SENTINEL,
    domain: GovernanceDomain.SECURITY,
    ownsPaths: ['server/services/twoFactorService.ts', 'server/services/accountLockoutService.ts'],
    cannotModify: ['client/'],
    mustFollow: ['Veto power on releases'],
  },
  {
    agentId: GOV_AGENT_IDS.GAUGE,
    domain: GovernanceDomain.QA,
    ownsPaths: [],
    cannotModify: [],
    mustFollow: ['Defines done', 'Cannot be overridden without Atlas'],
  },
  {
    agentId: GOV_AGENT_IDS.LUMEN,
    domain: GovernanceDomain.FLOWS,
    ownsPaths: [],
    cannotModify: ['server/', 'shared/models/'],
    mustFollow: ['No flow changes without Lumen'],
  },
  {
    agentId: GOV_AGENT_IDS.CONDUIT,
    domain: GovernanceDomain.INTEGRATIONS,
    ownsPaths: ['server/gmail.ts', 'server/googleCalendar.ts', 'server/sheets.ts', 'server/services/smsService.ts', 'server/services/s3Service.ts', 'server/services/pushNotificationService.ts'],
    cannotModify: ['client/', 'shared/models/'],
    mustFollow: ['No external integrations without Conduit spec'],
  },
  {
    agentId: GOV_AGENT_IDS.SCOUT,
    domain: GovernanceDomain.DEPENDENCIES,
    ownsPaths: ['package.json', 'package-lock.json'],
    cannotModify: ['server/', 'client/', 'shared/models/'],
    mustFollow: ['Pin exact versions', 'Sentinel vuln scan', 'Gauge validation'],
  },
  {
    agentId: GOV_AGENT_IDS.SCRIBE,
    domain: GovernanceDomain.RESEARCH,
    ownsPaths: ['docs/'],
    cannotModify: ['server/', 'client/', 'shared/models/'],
    mustFollow: ['Required for major decisions', 'Cannot make final calls'],
  },
  {
    agentId: GOV_AGENT_IDS.AXIOM,
    domain: GovernanceDomain.UX_SIMPLICITY,
    ownsPaths: ['client/'],
    cannotModify: ['server/', 'shared/models/', 'migrations/', 'package.json'],
    mustFollow: ['Cannot change backend logic (Forge)', 'Cannot change data models (Vector)', 'Cannot change architecture (Atlas)', 'Cannot install packages (Scout)'],
  },
];

// ─── Release Checklist ──────────────────────────────────────────
export interface ReleaseChecklistItem {
  step: number;
  agentId: GovernanceAgentId;
  description: string;
  required: boolean;
}

export const RELEASE_CHECKLIST: ReleaseChecklistItem[] = [
  { step: 1, agentId: GOV_AGENT_IDS.ATLAS, description: 'Confirms requirement match', required: true },
  { step: 2, agentId: GOV_AGENT_IDS.FORGE, description: 'Confirms backend stability', required: true },
  { step: 3, agentId: GOV_AGENT_IDS.NOVA, description: 'Confirms UI integrity', required: true },
  { step: 4, agentId: GOV_AGENT_IDS.AXIOM, description: 'Confirms UX simplicity clearance', required: true },
  { step: 5, agentId: GOV_AGENT_IDS.VECTOR, description: 'Confirms schema stability', required: true },
  { step: 6, agentId: GOV_AGENT_IDS.SCOUT, description: 'Confirms dependency integrity', required: true },
  { step: 7, agentId: GOV_AGENT_IDS.SENTINEL, description: 'Clears security', required: true },
  { step: 8, agentId: GOV_AGENT_IDS.GAUGE, description: 'Passes tests', required: true },
  { step: 9, agentId: GOV_AGENT_IDS.ANCHOR, description: 'Executes deployment', required: true },
];

// ─── Non-Negotiable Domains ─────────────────────────────────────
export const NON_NEGOTIABLE_DOMAINS = [
  'Role hierarchy logic (Agent → Manager → Director → Executive)',
  'Multi-tenant isolation',
  'Commission calculations',
  'Compliance enforcement',
  'Permission models',
  'AI output authority',
] as const;

// ─── System Integrity Rules ─────────────────────────────────────
export const SYSTEM_INTEGRITY_RULES = [
  'No agent may introduce silent behavior changes',
  'No agent may bypass logging',
  'No agent may skip audit trails',
  'No agent may hardcode permissions',
  'No agent may override financial math',
  'No agent may circumvent compliance flows',
  'No agent may install or upgrade dependencies without Scout',
  'All changes must be traceable',
] as const;
