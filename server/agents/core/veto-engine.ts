/**
 * VETO ENGINE
 * Enforces veto authorities defined in CLAUDE.md.
 * Four agents can block: Sentinel, Ledger, Helix, Gauge.
 * Helix vetoes are NON-OVERRIDABLE — even Atlas cannot override.
 */

import { randomUUID } from 'crypto';
import { EventBus, EventType, eventBus } from './event-bus';
import {
  GovernanceAgentId, VetoRecord, VETO_AUTHORITIES, GOV_AGENT_IDS,
} from './governance-types';

export class VetoEngine {
  private vetoes: Map<string, VetoRecord> = new Map();
  private bus: EventBus;

  private static instance: VetoEngine;

  static getInstance(): VetoEngine {
    if (!VetoEngine.instance) {
      VetoEngine.instance = new VetoEngine();
    }
    return VetoEngine.instance;
  }

  private constructor() {
    this.bus = eventBus;
  }

  // ─── Check if an agent has veto authority ──────────────────
  canVeto(agentId: GovernanceAgentId): boolean {
    return VETO_AUTHORITIES.some(va => va.agentId === agentId);
  }

  // ─── Issue a veto ──────────────────────────────────────────
  issueVeto(
    issuedBy: GovernanceAgentId,
    taskId: string,
    reason: string,
    severity: 'warning' | 'critical' | 'blocking',
    chainId?: string,
  ): VetoRecord {
    if (!this.canVeto(issuedBy)) {
      throw new Error(`Agent ${issuedBy} does not have veto authority`);
    }

    const authority = VETO_AUTHORITIES.find(va => va.agentId === issuedBy)!;

    const veto: VetoRecord = {
      id: `VETO-${Date.now()}-${randomUUID().slice(0, 4)}`,
      issuedBy,
      taskId,
      chainId,
      reason,
      severity,
      overridable: authority.overridableBy.length > 0,
      issuedAt: Date.now(),
    };

    this.vetoes.set(veto.id, veto);

    this.bus.emit(EventBus.createEvent(
      EventType.GOVERNANCE_VETO_ISSUED,
      issuedBy,
      {
        vetoId: veto.id,
        issuedBy,
        taskId,
        chainId,
        reason,
        severity,
        overridable: veto.overridable,
        domain: authority.domain,
      },
      { metadata: { tier: 11, priority: 'critical' } }
    ));

    const overrideMsg = veto.overridable ? '(overridable by Atlas)' : '⚠️ NON-OVERRIDABLE';
    console.log(`[VETO-ENGINE] ⛔ VETO by ${issuedBy} | Task: ${taskId} | ${severity} | ${overrideMsg}`);
    console.log(`[VETO-ENGINE]    Reason: ${reason}`);

    return veto;
  }

  // ─── Attempt to resolve/override a veto ────────────────────
  resolveVeto(
    vetoId: string,
    resolvedBy: GovernanceAgentId,
    resolution: string,
  ): VetoRecord {
    const veto = this.vetoes.get(vetoId);
    if (!veto) throw new Error(`Veto not found: ${vetoId}`);
    if (veto.resolvedAt) throw new Error(`Veto ${vetoId} is already resolved`);

    // Check if this veto can be overridden
    if (!veto.overridable) {
      this.bus.emit(EventBus.createEvent(
        EventType.GOVERNANCE_VETO_OVERRIDE_ATTEMPTED,
        resolvedBy,
        {
          vetoId,
          attemptedBy: resolvedBy,
          issuedBy: veto.issuedBy,
          result: 'DENIED — Non-overridable veto',
        },
        { metadata: { tier: 11, priority: 'critical' } }
      ));

      console.log(`[VETO-ENGINE] 🚫 Override DENIED — ${veto.issuedBy} veto is non-overridable (attempted by ${resolvedBy})`);
      throw new Error(`Veto by ${veto.issuedBy} cannot be overridden — compliance authority is absolute`);
    }

    // Check if the resolver has authority to override
    const authority = VETO_AUTHORITIES.find(va => va.agentId === veto.issuedBy)!;
    if (!authority.overridableBy.includes(resolvedBy)) {
      this.bus.emit(EventBus.createEvent(
        EventType.GOVERNANCE_VETO_OVERRIDE_ATTEMPTED,
        resolvedBy,
        {
          vetoId,
          attemptedBy: resolvedBy,
          issuedBy: veto.issuedBy,
          result: `DENIED — ${resolvedBy} does not have override authority`,
        },
        { metadata: { tier: 11, priority: 'critical' } }
      ));

      throw new Error(`Agent ${resolvedBy} does not have authority to override ${veto.issuedBy} veto`);
    }

    // Resolve
    veto.overriddenBy = resolvedBy;
    veto.resolvedAt = Date.now();
    veto.resolution = resolution;

    this.bus.emit(EventBus.createEvent(
      EventType.GOVERNANCE_VETO_RESOLVED,
      resolvedBy,
      {
        vetoId,
        resolvedBy,
        issuedBy: veto.issuedBy,
        taskId: veto.taskId,
        resolution,
      },
      { metadata: { tier: 11, priority: 'high' } }
    ));

    console.log(`[VETO-ENGINE] ✅ Veto ${vetoId} resolved by ${resolvedBy}: ${resolution}`);

    return veto;
  }

  // ─── Query ─────────────────────────────────────────────────
  getVeto(vetoId: string): VetoRecord | undefined {
    return this.vetoes.get(vetoId);
  }

  getActiveVetoes(): VetoRecord[] {
    return Array.from(this.vetoes.values()).filter(v => !v.resolvedAt);
  }

  getVetoesByTask(taskId: string): VetoRecord[] {
    return Array.from(this.vetoes.values()).filter(v => v.taskId === taskId);
  }

  hasActiveVeto(taskId: string): boolean {
    return this.getVetoesByTask(taskId).some(v => !v.resolvedAt);
  }

  getStats(): { total: number; active: number; resolved: number; nonOverridable: number } {
    const all = Array.from(this.vetoes.values());
    return {
      total: all.length,
      active: all.filter(v => !v.resolvedAt).length,
      resolved: all.filter(v => v.resolvedAt).length,
      nonOverridable: all.filter(v => !v.overridable).length,
    };
  }
}

export const vetoEngine = VetoEngine.getInstance();
