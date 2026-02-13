/**
 * SECURITY_AGENT
 * Permission enforcement, audit logging, anomaly detection,
 * kill switch management, access control. Emits SECURITY_EVENT.
 */

import {
  BaseAgent, EventType, AgentEvent,
  securityLayer, Permission,
  analyticsLedger, MetricType,
} from '../core';

interface SecurityIncident {
  id: string;
  type: 'unauthorized_access' | 'rate_limit' | 'anomalous_behavior' | 'kill_switch' | 'policy_violation';
  agentId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: number;
  resolved: boolean;
  resolution?: string;
}

interface AccessPattern {
  agentId: string;
  actionsPerMinute: number[];
  errorRate: number;
  deniedActions: number;
  lastAnalyzed: number;
}

const ANOMALY_THRESHOLDS = {
  maxErrorRatePercent: 20,
  maxDeniedActionsPerHour: 50,
  maxEventsPerMinute: 100,
  suspiciousPatternWindow: 5 * 60 * 1000, // 5 minutes
};

export class SecurityAgent extends BaseAgent {
  private accessPatterns: Map<string, AccessPattern> = new Map();
  private incidents: SecurityIncident[] = [];
  private monitorInterval: NodeJS.Timeout | null = null;

  constructor() {
    super({
      id: 'security',
      name: 'SECURITY_AGENT',
      tier: 10,
      description: 'Permission enforcement, audit logging, anomaly detection, kill switch',
      capabilities: ['permission_enforcement', 'audit_logging', 'anomaly_detection', 'kill_switch', 'access_control'],
      consumesEvents: [EventType.AGENT_ERROR, EventType.AGENT_HEARTBEAT, EventType.COMPLIANCE_BLOCKED],
      producesEvents: [EventType.SECURITY_EVENT],
    });
  }

  protected async onStart(): Promise<void> {
    securityLayer.registerAgent(this.id, [Permission.ADMIN, Permission.KILL_SWITCH]);
    // Monitor for anomalies every 2 minutes
    this.monitorInterval = setInterval(() => this.runSecurityScan(), 2 * 60 * 1000);
  }

  protected async onStop(): Promise<void> {
    if (this.monitorInterval) { clearInterval(this.monitorInterval); this.monitorInterval = null; }
  }

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.AGENT_ERROR) {
      this.trackAgentError(event.payload.agentId, event.payload.error);
    } else if (event.type === EventType.AGENT_HEARTBEAT) {
      this.updateAccessPattern(event.payload.agentId, event.payload.metrics);
    } else if (event.type === EventType.COMPLIANCE_BLOCKED) {
      this.recordIncident({
        type: 'policy_violation',
        agentId: event.payload.source || event.payload.targetAgentId,
        severity: 'high',
        description: `Compliance violation: ${event.payload.reason}`,
      });
    }
  }

  private trackAgentError(agentId: string, error: string): void {
    const pattern = this.getOrCreatePattern(agentId);
    pattern.errorRate++;

    if (pattern.errorRate > 10) {
      this.recordIncident({
        type: 'anomalous_behavior',
        agentId,
        severity: 'high',
        description: `Agent ${agentId} has ${pattern.errorRate} errors — possible malfunction`,
      });
    }
  }

  private updateAccessPattern(agentId: string, metrics: any): void {
    const pattern = this.getOrCreatePattern(agentId);
    pattern.actionsPerMinute.push(metrics?.eventsProcessed || 0);
    if (pattern.actionsPerMinute.length > 60) pattern.actionsPerMinute.shift();
    pattern.lastAnalyzed = Date.now();
  }

  private getOrCreatePattern(agentId: string): AccessPattern {
    if (!this.accessPatterns.has(agentId)) {
      this.accessPatterns.set(agentId, {
        agentId, actionsPerMinute: [], errorRate: 0, deniedActions: 0, lastAnalyzed: Date.now(),
      });
    }
    return this.accessPatterns.get(agentId)!;
  }

  private recordIncident(params: Omit<SecurityIncident, 'id' | 'detectedAt' | 'resolved'>): void {
    const incident: SecurityIncident = {
      id: `SEC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...params,
      detectedAt: Date.now(),
      resolved: false,
    };

    this.incidents.push(incident);
    if (this.incidents.length > 1000) this.incidents = this.incidents.slice(-500);

    this.emit(EventType.SECURITY_EVENT, {
      incidentId: incident.id,
      type: incident.type,
      agentId: incident.agentId,
      severity: incident.severity,
      description: incident.description,
    }, {
      metadata: { tier: 10, priority: incident.severity === 'critical' ? 'critical' : 'high' },
    });

    if (incident.severity === 'critical') {
      console.error(`[SECURITY] 🚨 CRITICAL: ${incident.description}`);
    } else {
      console.warn(`[SECURITY] ⚠️ ${incident.severity.toUpperCase()}: ${incident.description}`);
    }
  }

  private async runSecurityScan(): Promise<void> {
    const auditLog = securityLayer.getAuditLog({ limit: 100 });
    const recentDenied = auditLog.filter(e => e.result === 'denied' && Date.now() - e.timestamp < 3600000);

    // Check for excessive denied actions per agent
    const deniedByAgent = new Map<string, number>();
    for (const entry of recentDenied) {
      deniedByAgent.set(entry.agentId, (deniedByAgent.get(entry.agentId) || 0) + 1);
    }

    for (const [agentId, count] of Array.from(deniedByAgent.entries())) {
      if (count > ANOMALY_THRESHOLDS.maxDeniedActionsPerHour) {
        this.recordIncident({
          type: 'unauthorized_access',
          agentId,
          severity: 'critical',
          description: `Agent ${agentId} had ${count} denied actions in the last hour — possible unauthorized access attempt`,
        });

        // Auto-kill the agent
        securityLayer.killAgent(agentId);
        console.error(`[SECURITY] ☠️ Auto-killed agent ${agentId} due to excessive denied actions`);
      }
    }

    // Check global security stats
    const stats = securityLayer.getStats();
    if (stats.killedAgents > 3) {
      this.recordIncident({
        type: 'anomalous_behavior',
        agentId: 'system',
        severity: 'critical',
        description: `${stats.killedAgents} agents killed — system may be under attack`,
      });
    }
  }

  activateKillSwitch(): void {
    if (!securityLayer.checkPermission(this.id, Permission.KILL_SWITCH)) {
      console.error('[SECURITY] Kill switch activation denied — insufficient permissions');
      return;
    }

    securityLayer.activateGlobalKillSwitch();
    this.recordIncident({
      type: 'kill_switch',
      agentId: 'system',
      severity: 'critical',
      description: 'GLOBAL KILL SWITCH ACTIVATED — all agents halted',
    });
  }

  deactivateKillSwitch(): void {
    securityLayer.deactivateGlobalKillSwitch();
    this.emit(EventType.SECURITY_EVENT, {
      type: 'kill_switch_deactivated',
      description: 'Global kill switch deactivated — agents resuming',
    });
  }

  getIncidents(limit: number = 50): SecurityIncident[] {
    return this.incidents.slice(-limit);
  }

  getSecurityStatus(): {
    globalKillActive: boolean;
    activeIncidents: number;
    totalIncidents: number;
    killedAgents: number;
    stats: ReturnType<typeof securityLayer.getStats>;
  } {
    return {
      globalKillActive: securityLayer.isGlobalKillActive(),
      activeIncidents: this.incidents.filter(i => !i.resolved).length,
      totalIncidents: this.incidents.length,
      killedAgents: securityLayer.getStats().killedAgents,
      stats: securityLayer.getStats(),
    };
  }
}
