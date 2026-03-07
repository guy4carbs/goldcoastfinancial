/**
 * GOVERNANCE BASE AGENT
 * Extended BaseAgent for the 16-agent governance swarm.
 * Adds: handoff protocol, change chain participation, veto authority,
 * domain boundary enforcement, and governance-specific event handling.
 */

import { BaseAgent, AgentConfig, AgentEvent, EventType, eventBus } from '../core';
import { ChangeChainEngine, changeChainEngine } from '../core/change-chain-engine';
import { VetoEngine, vetoEngine } from '../core/veto-engine';
import {
  GovernanceDomain, GovernanceAgentId, GovernanceHandoff,
  GovernanceTask, GovernanceSubtask, ChangeType,
  DomainBoundary, DOMAIN_BOUNDARIES, VETO_AUTHORITIES,
} from '../core/governance-types';
import { randomUUID } from 'crypto';

// ─── Governance Agent Config ─────────────────────────────────────
export interface GovernanceAgentConfig extends AgentConfig {
  governanceDomain: GovernanceDomain;
  governanceId: GovernanceAgentId;
  hasVetoAuthority: boolean;
  participatesInChains: ChangeType[];
}

// ─── Governance Base Agent ───────────────────────────────────────
export abstract class GovernanceAgent extends BaseAgent {
  readonly governanceConfig: GovernanceAgentConfig;
  protected chainEngine: ChangeChainEngine;
  protected vetoEngine: VetoEngine;
  protected pendingHandoffs: Map<string, GovernanceHandoff> = new Map();
  protected assignedSubtasks: Map<string, GovernanceSubtask> = new Map();

  constructor(config: GovernanceAgentConfig) {
    super(config);
    this.governanceConfig = config;
    this.chainEngine = changeChainEngine;
    this.vetoEngine = vetoEngine;
  }

  // ─── Lifecycle ────────────────────────────────────────────
  protected async onStart(): Promise<void> {
    // Subscribe to governance events
    this.bus.on(EventType.GOVERNANCE_TASK_ASSIGNED, this.id, (event) => {
      if (event.payload?.assignedTo === this.governanceConfig.governanceId) {
        this.handleTaskAssignment(event);
      }
    });

    this.bus.on(EventType.GOVERNANCE_HANDOFF_REQUESTED, this.id, (event) => {
      if (event.payload?.to === this.governanceConfig.governanceId) {
        this.handleHandoffRequest(event);
      }
    });

    // Subscribe to chain step notifications
    this.bus.on(EventType.CHANGE_CHAIN_STARTED, this.id, (event) => {
      if (event.payload?.currentAgent === this.governanceConfig.governanceId) {
        this.handleChainStepActivation(event);
      }
    });

    this.bus.on(EventType.CHANGE_CHAIN_STEP_COMPLETED, this.id, (event) => {
      // Check if we're the next step
      const chain = this.chainEngine.getChain(event.payload?.chainId);
      if (chain && chain.status === 'active') {
        const nextAgent = chain.steps[chain.currentStepIndex];
        if (nextAgent === this.governanceConfig.governanceId) {
          this.handleChainStepActivation(event);
        }
      }
    });

    // Agent-specific initialization
    await this.onGovernanceStart();

    console.log(`[${this.config.name}] 🏛️ Governance agent online | Domain: ${this.governanceConfig.governanceDomain} | Veto: ${this.governanceConfig.hasVetoAuthority}`);
  }

  protected async onStop(): Promise<void> {
    await this.onGovernanceStop();
  }

  // ─── Event Router ─────────────────────────────────────────
  protected async handleEvent(event: AgentEvent): Promise<void> {
    await this.handleGovernanceEvent(event);
  }

  // ─── Handoff Protocol ─────────────────────────────────────
  protected requestHandoff(
    to: GovernanceAgentId,
    taskId: string,
    need: string,
    context: string,
    blockedUntil: string,
  ): GovernanceHandoff {
    const handoff: GovernanceHandoff = {
      id: `HO-${Date.now()}-${randomUUID().slice(0, 4)}`,
      from: this.governanceConfig.governanceId,
      to,
      taskId,
      need,
      context,
      blockedUntil,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.pendingHandoffs.set(handoff.id, handoff);

    this.emit(EventType.GOVERNANCE_HANDOFF_REQUESTED, {
      handoffId: handoff.id,
      from: handoff.from,
      to: handoff.to,
      taskId,
      need,
      context,
      blockedUntil,
    });

    console.log(`[${this.config.name}] 📤 HANDOFF → ${to} | Need: ${need}`);

    return handoff;
  }

  protected completeHandoff(handoffId: string, result: string): void {
    const handoff = this.pendingHandoffs.get(handoffId);
    if (!handoff) return;

    handoff.status = 'completed';
    handoff.resolvedAt = Date.now();

    this.emit(EventType.GOVERNANCE_HANDOFF_COMPLETED, {
      handoffId,
      from: handoff.from,
      to: handoff.to,
      taskId: handoff.taskId,
      result,
    });

    console.log(`[${this.config.name}] ✅ Handoff ${handoffId} completed`);
  }

  // ─── Chain Participation ──────────────────────────────────
  protected approveChainStep(chainId: string, reason: string): void {
    this.chainEngine.approveStep(chainId, this.governanceConfig.governanceId, reason);
  }

  protected rejectChainStep(chainId: string, reason: string): void {
    this.chainEngine.rejectStep(chainId, this.governanceConfig.governanceId, reason);
  }

  // ─── Veto Authority ───────────────────────────────────────
  protected issueVeto(
    taskId: string,
    reason: string,
    severity: 'warning' | 'critical' | 'blocking',
    chainId?: string,
  ): void {
    if (!this.governanceConfig.hasVetoAuthority) {
      console.warn(`[${this.config.name}] ⚠️ Attempted veto but has no veto authority`);
      return;
    }
    this.vetoEngine.issueVeto(this.governanceConfig.governanceId, taskId, reason, severity, chainId);
  }

  // ─── Domain Boundary Check ────────────────────────────────
  protected checkDomainBoundary(path: string): { allowed: boolean; reason?: string } {
    const boundary = DOMAIN_BOUNDARIES.find(
      db => db.agentId === this.governanceConfig.governanceId
    );
    if (!boundary) return { allowed: true };

    // Check if path is in cannotModify list
    for (const restricted of boundary.cannotModify) {
      if (path.startsWith(restricted)) {
        return {
          allowed: false,
          reason: `Domain boundary violation: ${this.governanceConfig.governanceId} cannot modify ${restricted}`,
        };
      }
    }

    return { allowed: true };
  }

  protected reportDomainViolation(path: string, attemptedBy: string): void {
    this.emit(EventType.GOVERNANCE_DOMAIN_VIOLATION, {
      agentId: this.governanceConfig.governanceId,
      path,
      attemptedBy,
      domain: this.governanceConfig.governanceDomain,
    });

    console.warn(`[${this.config.name}] 🚫 DOMAIN VIOLATION: ${attemptedBy} attempted to modify ${path}`);
  }

  // ─── Subtask Management ───────────────────────────────────
  protected completeSubtask(subtaskId: string, result: string): void {
    const subtask = this.assignedSubtasks.get(subtaskId);
    if (!subtask) return;

    subtask.status = 'completed';
    subtask.result = result;
    subtask.completedAt = Date.now();

    this.emit(EventType.GOVERNANCE_SUBTASK_COMPLETED, {
      subtaskId,
      taskId: subtask.taskId,
      agentId: this.governanceConfig.governanceId,
      result,
    });
  }

  // ─── Internal Handlers ────────────────────────────────────
  private async handleTaskAssignment(event: AgentEvent): Promise<void> {
    const subtask: GovernanceSubtask = event.payload?.subtask;
    if (!subtask) return;

    this.assignedSubtasks.set(subtask.id, subtask);
    subtask.status = 'in_progress';

    this.emit(EventType.GOVERNANCE_SUBTASK_STARTED, {
      subtaskId: subtask.id,
      taskId: subtask.taskId,
      agentId: this.governanceConfig.governanceId,
    });

    console.log(`[${this.config.name}] 📋 Assigned subtask: ${subtask.description}`);

    await this.onSubtaskAssigned(subtask);
  }

  private async handleHandoffRequest(event: AgentEvent): Promise<void> {
    const { handoffId, from, need, context, taskId } = event.payload;

    const handoff: GovernanceHandoff = {
      id: handoffId,
      from,
      to: this.governanceConfig.governanceId,
      taskId,
      need,
      context,
      blockedUntil: event.payload.blockedUntil,
      status: 'accepted',
      createdAt: Date.now(),
    };

    this.pendingHandoffs.set(handoffId, handoff);

    this.emit(EventType.GOVERNANCE_HANDOFF_ACCEPTED, {
      handoffId,
      from,
      to: this.governanceConfig.governanceId,
      taskId,
    });

    console.log(`[${this.config.name}] 📥 HANDOFF from ${from} | Need: ${need}`);

    await this.onHandoffReceived(handoff);
  }

  private async handleChainStepActivation(event: AgentEvent): Promise<void> {
    const chainId = event.payload?.chainId;
    const chain = this.chainEngine.getChain(chainId);
    if (!chain) return;

    console.log(`[${this.config.name}] ⛓️ Chain step activated | Chain: ${chainId} | Step: ${chain.currentStepIndex}`);

    await this.onChainStepActivated(chain.id, chain.taskId, chain.changeType);
  }

  // ─── Info ─────────────────────────────────────────────────
  getGovernanceInfo(): {
    governanceId: GovernanceAgentId;
    domain: GovernanceDomain;
    hasVetoAuthority: boolean;
    activeHandoffs: number;
    activeSubtasks: number;
    participatesInChains: ChangeType[];
  } {
    return {
      governanceId: this.governanceConfig.governanceId,
      domain: this.governanceConfig.governanceDomain,
      hasVetoAuthority: this.governanceConfig.hasVetoAuthority,
      activeHandoffs: Array.from(this.pendingHandoffs.values()).filter(h => h.status === 'pending' || h.status === 'accepted').length,
      activeSubtasks: Array.from(this.assignedSubtasks.values()).filter(s => s.status === 'in_progress').length,
      participatesInChains: this.governanceConfig.participatesInChains,
    };
  }

  // ─── Abstract Methods ─────────────────────────────────────
  protected abstract onGovernanceStart(): Promise<void>;
  protected abstract onGovernanceStop(): Promise<void>;
  protected abstract handleGovernanceEvent(event: AgentEvent): Promise<void>;
  protected abstract onSubtaskAssigned(subtask: GovernanceSubtask): Promise<void>;
  protected abstract onHandoffReceived(handoff: GovernanceHandoff): Promise<void>;
  protected abstract onChainStepActivated(chainId: string, taskId: string, changeType: ChangeType): Promise<void>;
}
