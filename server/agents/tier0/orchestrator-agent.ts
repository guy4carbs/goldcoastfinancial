/**
 * ORCHESTRATOR AGENT — THE BRAIN
 * Supreme coordinator of the entire system.
 * Receives ALL events. Decides who acts. Prevents duplication.
 * Enforces priorities, SLAs, and human escalation.
 *
 * NEVER executes domain tasks directly.
 */

import { BaseAgent, AgentConfig, AgentEvent, EventType, AgentStatus, eventBus, EventBus } from '../core';

interface AgentRegistration {
  id: string;
  name: string;
  tier: number;
  status: AgentStatus;
  lastHeartbeat: number;
  metrics: any;
  instance?: BaseAgent;
}

interface PendingTask {
  id: string;
  eventType: EventType;
  assignedTo: string;
  createdAt: number;
  slaMs: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'escalated';
}

export class OrchestratorAgent extends BaseAgent {
  private agents: Map<string, AgentRegistration> = new Map();
  private pendingTasks: Map<string, PendingTask> = new Map();
  private processedEvents: Set<string> = new Set(); // Deduplication
  private slaCheckInterval: NodeJS.Timeout | null = null;

  // SLA definitions (ms)
  private slaDefaults: Record<string, number> = {
    [EventType.RAW_LEAD_CREATED]: 60000,       // 1 min to start enrichment
    [EventType.LEAD_SCORED]: 30000,             // 30s to route to outreach
    [EventType.INBOUND_QUALIFIED]: 30000,       // 30s speed-to-lead
    [EventType.APPOINTMENT_BOOKED]: 300000,     // 5 min to confirm
    [EventType.APPLICATION_SUBMITTED]: 600000,  // 10 min to process
    [EventType.COMPLIANCE_BLOCKED]: 0,          // Immediate halt
  };

  constructor() {
    super({
      id: 'orchestrator',
      name: 'ORCHESTRATOR_AGENT',
      tier: 0,
      description: 'Supreme coordinator — routes events, enforces SLAs, prevents duplication',
      capabilities: ['routing', 'sla_enforcement', 'conflict_resolution', 'escalation'],
      consumesEvents: [], // We use wildcard listener instead
      producesEvents: [EventType.ORCHESTRATOR_DIRECTIVE, EventType.HUMAN_REQUIRED],
      heartbeatIntervalMs: 10000,
    });
  }

  protected async onStart(): Promise<void> {
    // Listen to ALL events via wildcard
    this.bus.on('*' as any, this.id, (event) => this.routeEvent(event));

    // SLA enforcement loop
    this.slaCheckInterval = setInterval(() => this.enforceSLAs(), 15000);

    console.log('[ORCHESTRATOR] 🧠 Brain is online. All events are being monitored.');
  }

  protected async onStop(): Promise<void> {
    if (this.slaCheckInterval) {
      clearInterval(this.slaCheckInterval);
    }
  }

  // Not used — we use wildcard listener
  protected async handleEvent(event: AgentEvent): Promise<void> {}

  // ─── Event Router ──────────────────────────────────────────
  private async routeEvent(event: AgentEvent): Promise<void> {
    // Skip our own events and heartbeats to avoid loops
    if (event.source === this.id) return;
    if (event.type === EventType.AGENT_HEARTBEAT) {
      this.updateAgentStatus(event);
      return;
    }

    // Deduplication
    if (this.processedEvents.has(event.id)) return;
    this.processedEvents.add(event.id);

    // Keep dedup set manageable
    if (this.processedEvents.size > 10000) {
      const arr = Array.from(this.processedEvents);
      this.processedEvents = new Set(arr.slice(-5000));
    }

    // Agent registration events
    if (event.type === EventType.AGENT_STARTED) {
      this.registerAgent(event);
      return;
    }
    if (event.type === EventType.AGENT_STOPPED) {
      this.deregisterAgent(event.payload?.agentId);
      return;
    }
    if (event.type === EventType.AGENT_ERROR) {
      this.handleAgentError(event);
      return;
    }

    // Compliance veto — immediate action
    if (event.type === EventType.COMPLIANCE_BLOCKED || event.type === EventType.COMPLIANCE_VETO) {
      this.handleComplianceBlock(event);
      return;
    }

    // Track as pending task with SLA
    if (this.slaDefaults[event.type]) {
      this.trackTask(event);
    }

    // Log significant events
    const significantEvents = [
      EventType.RAW_LEAD_CREATED,
      EventType.LEAD_SCORED,
      EventType.APPOINTMENT_BOOKED,
      EventType.POLICY_SOLD,
      EventType.APPLICATION_SUBMITTED,
      EventType.PAYMENT_PROCESSED,
    ];
    if (significantEvents.includes(event.type)) {
      console.log(`[ORCHESTRATOR] 📡 ${event.type} from ${event.source} | Priority: ${event.metadata?.priority || 'normal'}`);
    }
  }

  // ─── Agent Registration ────────────────────────────────────
  private registerAgent(event: AgentEvent): void {
    const { agentId, name, tier, capabilities } = event.payload;
    this.agents.set(agentId, {
      id: agentId,
      name,
      tier,
      status: AgentStatus.RUNNING,
      lastHeartbeat: Date.now(),
      metrics: {},
    });
    console.log(`[ORCHESTRATOR] ✅ Registered: ${name} (Tier ${tier})`);
  }

  private deregisterAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = AgentStatus.STOPPED;
      console.log(`[ORCHESTRATOR] ⏹️ Deregistered: ${agent.name}`);
    }
  }

  // ─── Heartbeat Processing ─────────────────────────────────
  private updateAgentStatus(event: AgentEvent): void {
    const { agentId, status, metrics } = event.payload;
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      agent.lastHeartbeat = Date.now();
      agent.metrics = metrics;
    }
  }

  // ─── Error Handling ────────────────────────────────────────
  private handleAgentError(event: AgentEvent): void {
    const { agentId, error } = event.payload;
    console.error(`[ORCHESTRATOR] ❌ Agent error: ${agentId} — ${error}`);

    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = AgentStatus.ERROR;

      // Check if agent should be restarted
      const errorCount = agent.metrics?.errorsCount || 0;
      if (errorCount > 10) {
        console.warn(`[ORCHESTRATOR] ⚠️ Agent ${agentId} has ${errorCount} errors — flagging for review`);
        this.emit(EventType.HUMAN_REQUIRED, {
          reason: 'agent_excessive_errors',
          agentId,
          errorCount,
          lastError: error,
          priority: 'high',
        });
      }
    }
  }

  // ─── Compliance Block ──────────────────────────────────────
  private handleComplianceBlock(event: AgentEvent): void {
    console.warn(`[ORCHESTRATOR] ⛔ COMPLIANCE BLOCK:`, event.payload);
    // Compliance has absolute authority — emit directive to halt
    if (event.payload?.targetAgentId) {
      this.emit(EventType.ORCHESTRATOR_DIRECTIVE, {
        targetAgentId: event.payload.targetAgentId,
        action: 'pause',
        reason: 'compliance_block',
        details: event.payload,
      });
    }
  }

  // ─── Task Tracking & SLA ───────────────────────────────────
  private trackTask(event: AgentEvent): void {
    this.pendingTasks.set(event.id, {
      id: event.id,
      eventType: event.type,
      assignedTo: event.source,
      createdAt: Date.now(),
      slaMs: this.slaDefaults[event.type] || 300000,
      status: 'pending',
    });
  }

  private enforceSLAs(): void {
    const now = Date.now();
    this.pendingTasks.forEach((task, id) => {
      if (task.status !== 'pending' && task.status !== 'in_progress') return;

      const elapsed = now - task.createdAt;
      if (elapsed > task.slaMs) {
        task.status = 'escalated';
        console.warn(`[ORCHESTRATOR] ⏰ SLA BREACH: ${task.eventType} (${Math.round(elapsed / 1000)}s > ${Math.round(task.slaMs / 1000)}s)`);

        this.emit(EventType.HUMAN_REQUIRED, {
          reason: 'sla_breach',
          eventType: task.eventType,
          elapsed,
          sla: task.slaMs,
          priority: 'high',
        });
      }
    });

    // Cleanup old tasks
    if (this.pendingTasks.size > 5000) {
      const entries = Array.from(this.pendingTasks.entries());
      entries
        .filter(([, t]) => t.status === 'completed' || t.status === 'escalated')
        .slice(0, 2500)
        .forEach(([id]) => this.pendingTasks.delete(id));
    }
  }

  // ─── Send Directive ────────────────────────────────────────
  sendDirective(targetAgentId: string, action: string, config?: any): void {
    this.emit(EventType.ORCHESTRATOR_DIRECTIVE, {
      targetAgentId,
      action,
      config,
    });
  }

  // ─── System Dashboard ──────────────────────────────────────
  getSystemStatus(): {
    agents: Array<{
      id: string;
      name: string;
      tier: number;
      status: AgentStatus;
      lastHeartbeat: number;
      healthy: boolean;
    }>;
    pendingTasks: number;
    breachedSLAs: number;
    totalAgents: number;
    healthyAgents: number;
  } {
    const now = Date.now();
    const agentList = Array.from(this.agents.values()).map((a) => ({
      id: a.id,
      name: a.name,
      tier: a.tier,
      status: a.status,
      lastHeartbeat: a.lastHeartbeat,
      healthy: a.status === AgentStatus.RUNNING && (now - a.lastHeartbeat) < 60000,
    }));

    const pending = Array.from(this.pendingTasks.values()).filter(
      (t) => t.status === 'pending' || t.status === 'in_progress'
    ).length;

    const breached = Array.from(this.pendingTasks.values()).filter(
      (t) => t.status === 'escalated'
    ).length;

    return {
      agents: agentList,
      pendingTasks: pending,
      breachedSLAs: breached,
      totalAgents: agentList.length,
      healthyAgents: agentList.filter((a) => a.healthy).length,
    };
  }

  // ─── Register Agent Instance ───────────────────────────────
  registerAgentInstance(agent: BaseAgent): void {
    const info = agent.getInfo();
    this.agents.set(info.id, {
      id: info.id,
      name: info.name,
      tier: info.tier,
      status: info.status,
      lastHeartbeat: Date.now(),
      metrics: info.metrics,
      instance: agent,
    });
  }
}
