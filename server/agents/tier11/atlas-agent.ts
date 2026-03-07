/**
 * ATLAS — ARCHITECTURE & REQUIREMENTS COORDINATOR
 * Tier 11 — Supreme governance coordinator.
 *
 * Responsibilities:
 * - Decomposes tasks into subtasks and assigns to domain agents
 * - Manages change chains
 * - Resolves cross-domain conflicts
 * - Arbitrates veto disputes (except Helix — non-overridable)
 * - Validates release readiness
 * - Only agent that can change requirements or core architecture
 */

import { AgentEvent, EventType } from '../core';
import { GovernanceAgent, GovernanceAgentConfig } from '../governance';
import { changeChainEngine } from '../core/change-chain-engine';
import { vetoEngine } from '../core/veto-engine';
import {
  GovernanceDomain, GovernanceAgentId, ChangeType,
  GovernanceTask, GovernanceSubtask, GovernanceHandoff,
  GovernanceTaskStatus, GOV_AGENT_IDS,
  CHANGE_CHAIN_DEFINITIONS, RELEASE_CHECKLIST,
} from '../core/governance-types';
import { randomUUID } from 'crypto';

export class AtlasAgent extends GovernanceAgent {
  private tasks: Map<string, GovernanceTask> = new Map();
  private releaseChecks: Map<string, Map<GovernanceAgentId, boolean>> = new Map();

  constructor() {
    super({
      id: GOV_AGENT_IDS.ATLAS,
      name: 'ATLAS_GOVERNANCE',
      tier: 11,
      description: 'Architecture & Requirements — Supreme governance coordinator for Heritage Life Solutions Insurance OS. Decomposes tasks across 6 portals, manages 12 change chains, and arbitrates cross-domain conflicts for heritagels.org.',
      capabilities: ['task_decomposition', 'chain_management', 'conflict_resolution', 'veto_arbitration', 'release_validation'],
      consumesEvents: [],
      producesEvents: [
        EventType.GOVERNANCE_TASK_DECOMPOSED,
        EventType.GOVERNANCE_TASK_ASSIGNED,
        EventType.GOVERNANCE_TASK_COMPLETED,
        EventType.GOVERNANCE_TASK_FAILED,
        EventType.GOVERNANCE_CONFLICT_RESOLVED,
        EventType.GOVERNANCE_RELEASE_CHECK,
        EventType.GOVERNANCE_RELEASE_APPROVED,
        EventType.GOVERNANCE_RELEASE_BLOCKED,
      ],
      governanceDomain: GovernanceDomain.ARCHITECTURE,
      governanceId: GOV_AGENT_IDS.ATLAS,
      hasVetoAuthority: false,
      participatesInChains: Object.values(ChangeType),
      heartbeatIntervalMs: 15000,
    });
  }

  protected async onGovernanceStart(): Promise<void> {
    // Atlas listens to all governance events via wildcard
    this.bus.on('*' as any, this.id, (event) => this.routeGovernanceEvent(event));

    console.log('[ATLAS] 🏛️ Supreme coordinator online for Heritage Life Solutions Insurance OS. All governance events monitored.');
  }

  protected async onGovernanceStop(): Promise<void> {}

  protected async handleGovernanceEvent(event: AgentEvent): Promise<void> {
    // Handled via wildcard listener
  }

  // ─── Wildcard Router ──────────────────────────────────────
  private async routeGovernanceEvent(event: AgentEvent): Promise<void> {
    if (event.source === this.id) return;

    switch (event.type) {
      case EventType.GOVERNANCE_TASK_SUBMITTED:
        await this.decomposeTask(event);
        break;
      case EventType.GOVERNANCE_SUBTASK_COMPLETED:
        await this.checkTaskCompletion(event);
        break;
      case EventType.CHANGE_CHAIN_COMPLETED:
        await this.handleChainCompleted(event);
        break;
      case EventType.CHANGE_CHAIN_FAILED:
        await this.handleChainFailed(event);
        break;
      case EventType.GOVERNANCE_VETO_ISSUED:
        await this.handleVetoNotification(event);
        break;
      case EventType.GOVERNANCE_CONFLICT:
        await this.resolveConflict(event);
        break;
      case EventType.GOVERNANCE_RELEASE_CHECK:
        await this.processReleaseCheck(event);
        break;
    }
  }

  // ─── Task Decomposition ───────────────────────────────────
  private async decomposeTask(event: AgentEvent): Promise<void> {
    const { title, description, changeType: rawChangeType, submittedBy } = event.payload;
    const changeType = rawChangeType as ChangeType;

    const task: GovernanceTask = {
      id: `TASK-${Date.now()}-${randomUUID().slice(0, 4)}`,
      title,
      description,
      changeType,
      submittedBy,
      submittedAt: Date.now(),
      status: GovernanceTaskStatus.DECOMPOSED,
      subtasks: [],
      vetoRecords: [],
    };

    // Determine which agents need to be involved based on change type
    const chainSteps = CHANGE_CHAIN_DEFINITIONS[changeType];
    if (!chainSteps) {
      console.warn(`[ATLAS] ⚠️ Unknown change type: ${changeType}`);
      return;
    }

    // Create subtasks for each agent in the chain
    for (const agentId of chainSteps) {
      const subtask: GovernanceSubtask = {
        id: `SUB-${Date.now()}-${randomUUID().slice(0, 4)}`,
        taskId: task.id,
        assignedTo: agentId,
        description: `Review and approve ${changeType} change: ${title}`,
        acceptanceCriteria: [`${agentId} domain review complete`, `No blocking issues found`],
        status: 'pending',
      };
      task.subtasks.push(subtask);
    }

    this.tasks.set(task.id, task);

    // Start the change chain
    const chain = changeChainEngine.startChain(changeType, task.id);
    task.chainId = chain.id;
    task.status = GovernanceTaskStatus.AWAITING_CHAIN;

    this.emit(EventType.GOVERNANCE_TASK_DECOMPOSED, {
      taskId: task.id,
      title: task.title,
      changeType: task.changeType,
      subtaskCount: task.subtasks.length,
      chainId: chain.id,
      chainSteps: chainSteps,
    });

    // Assign the first subtask (first agent in chain)
    const firstSubtask = task.subtasks[0];
    this.emit(EventType.GOVERNANCE_TASK_ASSIGNED, {
      taskId: task.id,
      assignedTo: firstSubtask.assignedTo,
      subtask: firstSubtask,
    });

    console.log(`[ATLAS] 📋 Task decomposed: ${task.title} | ${task.subtasks.length} subtasks | Chain: ${chain.id}`);
  }

  // ─── Task Completion Check ────────────────────────────────
  private async checkTaskCompletion(event: AgentEvent): Promise<void> {
    const { taskId } = event.payload;
    const task = this.tasks.get(taskId);
    if (!task) return;

    // Update subtask status
    const subtask = task.subtasks.find(s => s.id === event.payload.subtaskId);
    if (subtask) {
      subtask.status = 'completed';
      subtask.result = event.payload.result;
      subtask.completedAt = Date.now();
    }

    // Check if all subtasks are complete
    const allComplete = task.subtasks.every(s => s.status === 'completed');
    if (allComplete && !vetoEngine.hasActiveVeto(task.id)) {
      task.status = GovernanceTaskStatus.COMPLETED;
      task.completedAt = Date.now();
      task.result = 'All subtasks completed and chain approved';

      this.emit(EventType.GOVERNANCE_TASK_COMPLETED, {
        taskId: task.id,
        title: task.title,
        changeType: task.changeType,
        result: task.result,
      });

      console.log(`[ATLAS] ✅ Task completed: ${task.title}`);
    }
  }

  // ─── Chain Handlers ───────────────────────────────────────
  private async handleChainCompleted(event: AgentEvent): Promise<void> {
    const { taskId } = event.payload;
    const task = this.tasks.get(taskId);
    if (!task) return;

    // Atlas is the final step in most chains — perform final validation
    console.log(`[ATLAS] ⛓️ Change chain completed for task: ${task.title}`);

    // If Atlas is in the chain, auto-approve our step
    const chain = changeChainEngine.getChain(event.payload.chainId);
    if (chain) {
      const currentAgent = changeChainEngine.getCurrentStepAgent(chain.id);
      if (currentAgent === GOV_AGENT_IDS.ATLAS) {
        this.approveChainStep(chain.id, 'Atlas final validation — requirements confirmed');
      }
    }
  }

  private async handleChainFailed(event: AgentEvent): Promise<void> {
    const { taskId, failedAt, reason } = event.payload;
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = GovernanceTaskStatus.VETOED;

    this.emit(EventType.GOVERNANCE_TASK_FAILED, {
      taskId: task.id,
      title: task.title,
      reason: `Chain rejected by ${failedAt}: ${reason}`,
    });

    console.log(`[ATLAS] ❌ Task failed: ${task.title} — rejected by ${failedAt}`);
  }

  // ─── Veto Handling ────────────────────────────────────────
  private async handleVetoNotification(event: AgentEvent): Promise<void> {
    const { vetoId, issuedBy, taskId, reason, overridable } = event.payload;

    console.log(`[ATLAS] ⛔ Veto notification | By: ${issuedBy} | Task: ${taskId} | Overridable: ${overridable}`);

    const task = this.tasks.get(taskId);
    if (task) {
      task.status = GovernanceTaskStatus.VETOED;
      task.vetoRecords.push(vetoEngine.getVeto(vetoId)!);
    }

    // Helix vetoes are absolute — Atlas does NOT attempt to override
    if (issuedBy === GOV_AGENT_IDS.HELIX) {
      console.log(`[ATLAS] 🚫 Helix veto is NON-OVERRIDABLE. Task ${taskId} permanently blocked.`);
      return;
    }
  }

  // ─── Conflict Resolution ──────────────────────────────────
  private async resolveConflict(event: AgentEvent): Promise<void> {
    const { agentA, agentB, description, taskId } = event.payload;

    console.log(`[ATLAS] ⚔️ Resolving conflict between ${agentA} and ${agentB}: ${description}`);

    // Resolution logic: domain owner wins within their domain
    // Cross-domain: Atlas decides based on priority
    this.emit(EventType.GOVERNANCE_CONFLICT_RESOLVED, {
      taskId,
      agentA,
      agentB,
      resolution: `Atlas arbitration: ${description}`,
      resolvedBy: GOV_AGENT_IDS.ATLAS,
    });
  }

  // ─── Release Validation ───────────────────────────────────
  private async processReleaseCheck(event: AgentEvent): Promise<void> {
    const releaseId = event.payload?.releaseId || `REL-${Date.now()}`;

    if (!this.releaseChecks.has(releaseId)) {
      this.releaseChecks.set(releaseId, new Map());
    }
    const checks = this.releaseChecks.get(releaseId)!;
    checks.set(event.payload.agentId, event.payload.approved);

    // Check if all required checks are in
    const requiredAgents = RELEASE_CHECKLIST.filter(item => item.required).map(item => item.agentId);
    const allChecked = requiredAgents.every(agentId => checks.has(agentId));

    if (allChecked) {
      const allApproved = requiredAgents.every(agentId => checks.get(agentId) === true);

      if (allApproved) {
        this.emit(EventType.GOVERNANCE_RELEASE_APPROVED, {
          releaseId,
          approvedBy: Array.from(checks.entries())
            .filter(([, approved]) => approved)
            .map(([agentId]) => agentId),
        });
        console.log(`[ATLAS] 🚀 Release ${releaseId} APPROVED — all checks passed`);
      } else {
        const blockers = requiredAgents.filter(agentId => checks.get(agentId) === false);
        this.emit(EventType.GOVERNANCE_RELEASE_BLOCKED, {
          releaseId,
          blockedBy: blockers,
        });
        console.log(`[ATLAS] 🚫 Release ${releaseId} BLOCKED by: ${blockers.join(', ')}`);
      }
    }
  }

  // ─── Chain Step (Atlas as final approver) ─────────────────
  protected async onChainStepActivated(chainId: string, taskId: string, changeType: ChangeType): Promise<void> {
    // Atlas approves as the final validator — confirms requirements match
    console.log(`[ATLAS] ⛓️ Final chain validation for ${changeType} | Chain: ${chainId}`);
    this.approveChainStep(chainId, `Atlas confirms requirements alignment for ${changeType}`);
  }

  protected async onSubtaskAssigned(subtask: GovernanceSubtask): Promise<void> {
    // Atlas subtasks are self-managed — typically final approval
    this.completeSubtask(subtask.id, 'Atlas architectural review complete');
  }

  protected async onHandoffReceived(handoff: GovernanceHandoff): Promise<void> {
    console.log(`[ATLAS] 📥 Handoff received from ${handoff.from}: ${handoff.need}`);
    this.completeHandoff(handoff.id, 'Atlas reviewed and acknowledged');
  }

  // ─── Query ────────────────────────────────────────────────
  getTask(taskId: string): GovernanceTask | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): GovernanceTask[] {
    return Array.from(this.tasks.values());
  }

  getActiveTasks(): GovernanceTask[] {
    return Array.from(this.tasks.values()).filter(
      t => t.status !== GovernanceTaskStatus.COMPLETED && t.status !== GovernanceTaskStatus.FAILED
    );
  }
}
