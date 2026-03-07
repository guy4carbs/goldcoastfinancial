/**
 * CHANGE CHAIN ENGINE
 * Enforces mandatory change chains from CLAUDE.md.
 * Every change type has a defined sequence of agents that must approve in order.
 * No step can be skipped. A rejection at any step halts the chain.
 */

import { randomUUID } from 'crypto';
import { EventBus, EventType, eventBus } from './event-bus';
import {
  ChangeType, ChangeChain, ChangeChainStepResult,
  GovernanceAgentId, CHANGE_CHAIN_DEFINITIONS,
} from './governance-types';

export class ChangeChainEngine {
  private chains: Map<string, ChangeChain> = new Map();
  private bus: EventBus;

  private static instance: ChangeChainEngine;

  static getInstance(): ChangeChainEngine {
    if (!ChangeChainEngine.instance) {
      ChangeChainEngine.instance = new ChangeChainEngine();
    }
    return ChangeChainEngine.instance;
  }

  private constructor() {
    this.bus = eventBus;
  }

  // ─── Start a new chain ─────────────────────────────────────
  startChain(changeType: ChangeType, taskId: string): ChangeChain {
    const steps = CHANGE_CHAIN_DEFINITIONS[changeType];
    if (!steps || steps.length === 0) {
      throw new Error(`No change chain defined for type: ${changeType}`);
    }

    const chain: ChangeChain = {
      id: `CHAIN-${Date.now()}-${randomUUID().slice(0, 4)}`,
      changeType,
      taskId,
      steps: [...steps],
      currentStepIndex: 0,
      status: 'active',
      stepResults: [],
      startedAt: Date.now(),
    };

    this.chains.set(chain.id, chain);

    this.bus.emit(EventBus.createEvent(
      EventType.CHANGE_CHAIN_STARTED,
      'change-chain-engine',
      {
        chainId: chain.id,
        changeType,
        taskId,
        steps: chain.steps,
        currentAgent: chain.steps[0],
      },
      { metadata: { tier: 11, priority: 'high' } }
    ));

    console.log(`[CHANGE-CHAIN] ⛓️ Started chain ${chain.id} | Type: ${changeType} | Steps: ${chain.steps.join(' → ')}`);

    return chain;
  }

  // ─── Approve the current step ──────────────────────────────
  approveStep(chainId: string, agentId: GovernanceAgentId, reason: string): ChangeChain {
    const chain = this.chains.get(chainId);
    if (!chain) throw new Error(`Chain not found: ${chainId}`);
    if (chain.status !== 'active') throw new Error(`Chain ${chainId} is not active (status: ${chain.status})`);

    const expectedAgent = chain.steps[chain.currentStepIndex];
    if (agentId !== expectedAgent) {
      throw new Error(`Agent ${agentId} cannot approve step — expected ${expectedAgent}`);
    }

    const result: ChangeChainStepResult = {
      agentId,
      approved: true,
      reason,
      timestamp: Date.now(),
    };
    chain.stepResults.push(result);

    this.bus.emit(EventBus.createEvent(
      EventType.CHANGE_CHAIN_STEP_COMPLETED,
      agentId,
      {
        chainId: chain.id,
        taskId: chain.taskId,
        step: chain.currentStepIndex,
        agentId,
        approved: true,
        reason,
      },
      { metadata: { tier: 11, priority: 'high' } }
    ));

    chain.currentStepIndex++;

    // Check if chain is complete
    if (chain.currentStepIndex >= chain.steps.length) {
      chain.status = 'completed';
      chain.completedAt = Date.now();

      this.bus.emit(EventBus.createEvent(
        EventType.CHANGE_CHAIN_COMPLETED,
        'change-chain-engine',
        {
          chainId: chain.id,
          taskId: chain.taskId,
          changeType: chain.changeType,
          stepResults: chain.stepResults,
        },
        { metadata: { tier: 11, priority: 'high' } }
      ));

      console.log(`[CHANGE-CHAIN] ✅ Chain ${chain.id} completed | All ${chain.steps.length} steps approved`);
    } else {
      const nextAgent = chain.steps[chain.currentStepIndex];
      console.log(`[CHANGE-CHAIN] ✅ Step ${chain.currentStepIndex} approved by ${agentId} | Next: ${nextAgent}`);
    }

    return chain;
  }

  // ─── Reject the current step ───────────────────────────────
  rejectStep(chainId: string, agentId: GovernanceAgentId, reason: string): ChangeChain {
    const chain = this.chains.get(chainId);
    if (!chain) throw new Error(`Chain not found: ${chainId}`);
    if (chain.status !== 'active') throw new Error(`Chain ${chainId} is not active`);

    const expectedAgent = chain.steps[chain.currentStepIndex];
    if (agentId !== expectedAgent) {
      throw new Error(`Agent ${agentId} cannot reject step — expected ${expectedAgent}`);
    }

    const result: ChangeChainStepResult = {
      agentId,
      approved: false,
      reason,
      timestamp: Date.now(),
    };
    chain.stepResults.push(result);
    chain.status = 'vetoed';
    chain.completedAt = Date.now();

    this.bus.emit(EventBus.createEvent(
      EventType.CHANGE_CHAIN_STEP_REJECTED,
      agentId,
      {
        chainId: chain.id,
        taskId: chain.taskId,
        step: chain.currentStepIndex,
        agentId,
        reason,
      },
      { metadata: { tier: 11, priority: 'critical' } }
    ));

    this.bus.emit(EventBus.createEvent(
      EventType.CHANGE_CHAIN_FAILED,
      'change-chain-engine',
      {
        chainId: chain.id,
        taskId: chain.taskId,
        changeType: chain.changeType,
        failedAt: agentId,
        reason,
        stepResults: chain.stepResults,
      },
      { metadata: { tier: 11, priority: 'critical' } }
    ));

    console.log(`[CHANGE-CHAIN] ❌ Chain ${chain.id} REJECTED by ${agentId}: ${reason}`);

    return chain;
  }

  // ─── Get current step agent ────────────────────────────────
  getCurrentStepAgent(chainId: string): GovernanceAgentId | null {
    const chain = this.chains.get(chainId);
    if (!chain || chain.status !== 'active') return null;
    return chain.steps[chain.currentStepIndex] || null;
  }

  // ─── Query ─────────────────────────────────────────────────
  getChain(chainId: string): ChangeChain | undefined {
    return this.chains.get(chainId);
  }

  getChainsByTask(taskId: string): ChangeChain[] {
    return Array.from(this.chains.values()).filter(c => c.taskId === taskId);
  }

  getActiveChains(): ChangeChain[] {
    return Array.from(this.chains.values()).filter(c => c.status === 'active');
  }

  getStats(): { total: number; active: number; completed: number; vetoed: number; failed: number } {
    const all = Array.from(this.chains.values());
    return {
      total: all.length,
      active: all.filter(c => c.status === 'active').length,
      completed: all.filter(c => c.status === 'completed').length,
      vetoed: all.filter(c => c.status === 'vetoed').length,
      failed: all.filter(c => c.status === 'failed').length,
    };
  }
}

export const changeChainEngine = ChangeChainEngine.getInstance();
