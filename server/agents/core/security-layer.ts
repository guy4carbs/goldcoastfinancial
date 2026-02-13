/**
 * SECURITY LAYER
 * Permissions, audit logs, kill switches.
 * Every action is logged. Every agent has permissions.
 */

import { randomUUID } from 'crypto';

// ─── Permission Levels ───────────────────────────────────────────
export enum Permission {
  READ_LEADS = 'READ_LEADS',
  WRITE_LEADS = 'WRITE_LEADS',
  READ_CLIENTS = 'READ_CLIENTS',
  WRITE_CLIENTS = 'WRITE_CLIENTS',
  READ_POLICIES = 'READ_POLICIES',
  WRITE_POLICIES = 'WRITE_POLICIES',
  SEND_EMAIL = 'SEND_EMAIL',
  SEND_SMS = 'SEND_SMS',
  MAKE_CALLS = 'MAKE_CALLS',
  PROCESS_PAYMENTS = 'PROCESS_PAYMENTS',
  MODIFY_COMMISSIONS = 'MODIFY_COMMISSIONS',
  ACCESS_COMPLIANCE = 'ACCESS_COMPLIANCE',
  ADMIN = 'ADMIN',
  OVERRIDE_COMPLIANCE = 'OVERRIDE_COMPLIANCE', // Only human escalation
  KILL_SWITCH = 'KILL_SWITCH',
}

// ─── Audit Entry ─────────────────────────────────────────────────
export interface AuditEntry {
  id: string;
  agentId: string;
  action: string;
  resource: string;
  entityId?: string;
  result: 'allowed' | 'denied' | 'error';
  reason?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

// ─── Agent Permissions ───────────────────────────────────────────
interface AgentPermissions {
  agentId: string;
  permissions: Set<Permission>;
  rateLimit: {
    maxActionsPerMinute: number;
    maxActionsPerHour: number;
  };
  killed: boolean;
}

// ─── Security Layer ──────────────────────────────────────────────
export class SecurityLayer {
  private permissions: Map<string, AgentPermissions> = new Map();
  private auditLog: AuditEntry[] = [];
  private actionCounts: Map<string, { minute: number[]; hour: number[] }> = new Map();
  private globalKillSwitch = false;

  private static instance: SecurityLayer;

  static getInstance(): SecurityLayer {
    if (!SecurityLayer.instance) {
      SecurityLayer.instance = new SecurityLayer();
    }
    return SecurityLayer.instance;
  }

  // ─── Register Agent ────────────────────────────────────────
  registerAgent(
    agentId: string,
    permissions: Permission[],
    rateLimit?: { maxActionsPerMinute?: number; maxActionsPerHour?: number }
  ): void {
    this.permissions.set(agentId, {
      agentId,
      permissions: new Set(permissions),
      rateLimit: {
        maxActionsPerMinute: rateLimit?.maxActionsPerMinute || 60,
        maxActionsPerHour: rateLimit?.maxActionsPerHour || 1000,
      },
      killed: false,
    });
  }

  // ─── Check Permission ──────────────────────────────────────
  checkPermission(agentId: string, permission: Permission): boolean {
    if (this.globalKillSwitch) return false;

    const agent = this.permissions.get(agentId);
    if (!agent) return false;
    if (agent.killed) return false;
    if (agent.permissions.has(Permission.ADMIN)) return true;

    return agent.permissions.has(permission);
  }

  // ─── Authorize Action ──────────────────────────────────────
  authorize(
    agentId: string,
    action: string,
    permission: Permission,
    resource: string,
    entityId?: string
  ): boolean {
    const allowed = this.checkPermission(agentId, permission);
    const rateLimited = this.isRateLimited(agentId);

    const result = allowed && !rateLimited ? 'allowed' : 'denied';
    const reason = !allowed ? 'insufficient_permissions'
      : rateLimited ? 'rate_limited'
      : undefined;

    this.audit(agentId, action, resource, result, reason, entityId);
    this.trackAction(agentId);

    return result === 'allowed';
  }

  // ─── Rate Limiting ─────────────────────────────────────────
  private isRateLimited(agentId: string): boolean {
    const agent = this.permissions.get(agentId);
    if (!agent) return true;

    const counts = this.actionCounts.get(agentId);
    if (!counts) return false;

    const now = Date.now();
    const minuteCount = counts.minute.filter((t) => now - t < 60000).length;
    const hourCount = counts.hour.filter((t) => now - t < 3600000).length;

    return minuteCount >= agent.rateLimit.maxActionsPerMinute ||
           hourCount >= agent.rateLimit.maxActionsPerHour;
  }

  private trackAction(agentId: string): void {
    if (!this.actionCounts.has(agentId)) {
      this.actionCounts.set(agentId, { minute: [], hour: [] });
    }
    const counts = this.actionCounts.get(agentId)!;
    const now = Date.now();
    counts.minute.push(now);
    counts.hour.push(now);

    // Cleanup old entries
    counts.minute = counts.minute.filter((t) => now - t < 60000);
    counts.hour = counts.hour.filter((t) => now - t < 3600000);
  }

  // ─── Audit ─────────────────────────────────────────────────
  private audit(
    agentId: string,
    action: string,
    resource: string,
    result: 'allowed' | 'denied' | 'error',
    reason?: string,
    entityId?: string,
    metadata?: Record<string, any>
  ): void {
    this.auditLog.push({
      id: randomUUID(),
      agentId,
      action,
      resource,
      entityId,
      result,
      reason,
      timestamp: Date.now(),
      metadata,
    });

    if (this.auditLog.length > 50000) {
      this.auditLog = this.auditLog.slice(-25000);
    }
  }

  // ─── Kill Switches ─────────────────────────────────────────
  killAgent(agentId: string): void {
    const agent = this.permissions.get(agentId);
    if (agent) {
      agent.killed = true;
      console.warn(`[SECURITY] ☠️ Agent ${agentId} KILLED`);
    }
  }

  reviveAgent(agentId: string): void {
    const agent = this.permissions.get(agentId);
    if (agent) {
      agent.killed = false;
      console.log(`[SECURITY] ✅ Agent ${agentId} revived`);
    }
  }

  activateGlobalKillSwitch(): void {
    this.globalKillSwitch = true;
    console.warn('[SECURITY] ☠️☠️☠️ GLOBAL KILL SWITCH ACTIVATED');
  }

  deactivateGlobalKillSwitch(): void {
    this.globalKillSwitch = false;
    console.log('[SECURITY] ✅ Global kill switch deactivated');
  }

  // ─── Query ─────────────────────────────────────────────────
  getAuditLog(options?: {
    agentId?: string;
    result?: string;
    limit?: number;
  }): AuditEntry[] {
    let entries = [...this.auditLog];
    if (options?.agentId) entries = entries.filter((e) => e.agentId === options.agentId);
    if (options?.result) entries = entries.filter((e) => e.result === options.result);
    if (options?.limit) entries = entries.slice(-options.limit);
    return entries;
  }

  getAgentPermissions(agentId: string): Permission[] {
    const agent = this.permissions.get(agentId);
    return agent ? Array.from(agent.permissions) : [];
  }

  isGlobalKillActive(): boolean {
    return this.globalKillSwitch;
  }

  getStats(): {
    registeredAgents: number;
    killedAgents: number;
    auditEntries: number;
    deniedActions: number;
    globalKillActive: boolean;
  } {
    let killed = 0;
    this.permissions.forEach((p) => { if (p.killed) killed++; });
    const denied = this.auditLog.filter((e) => e.result === 'denied').length;

    return {
      registeredAgents: this.permissions.size,
      killedAgents: killed,
      auditEntries: this.auditLog.length,
      deniedActions: denied,
      globalKillActive: this.globalKillSwitch,
    };
  }
}

export const securityLayer = SecurityLayer.getInstance();
