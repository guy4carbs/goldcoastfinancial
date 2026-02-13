/**
 * ERROR_RECOVERY_AGENT
 * Failure detection, retry orchestration, circuit breakers,
 * system health monitoring, alert routing. Emits SYSTEM_RECOVERED.
 */

import {
  BaseAgent, EventType, AgentEvent, AgentStatus,
  analyticsLedger, MetricType,
  securityLayer, Permission,
} from '../core';

type CircuitState = 'closed' | 'open' | 'half_open';

interface CircuitBreaker {
  agentId: string;
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureAt: number;
  openedAt: number;
  halfOpenAt: number;
  threshold: number;
  resetTimeoutMs: number;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical' | 'down';
  healthyAgents: number;
  errorAgents: number;
  totalAgents: number;
  circuitBreakers: { open: number; halfOpen: number; closed: number };
  recentRecoveries: number;
  lastCheckAt: number;
}

const CIRCUIT_THRESHOLD = 5; // failures before opening
const CIRCUIT_RESET_MS = 60 * 1000; // 1 minute before half-open
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAYS = [5000, 15000, 45000]; // exponential-ish backoff

export class ErrorRecoveryAgent extends BaseAgent {
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private agentStates: Map<string, AgentStatus> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private recoveryCount = 0;

  constructor() {
    super({
      id: 'error-recovery',
      name: 'ERROR_RECOVERY_AGENT',
      tier: 10,
      description: 'Failure detection, retry orchestration, circuit breakers, system health',
      capabilities: ['failure_detection', 'retry_orchestration', 'circuit_breakers', 'health_monitoring', 'alert_routing'],
      consumesEvents: [EventType.AGENT_ERROR, EventType.AGENT_HEARTBEAT, EventType.AGENT_STARTED, EventType.AGENT_STOPPED],
      producesEvents: [EventType.SYSTEM_RECOVERED],
    });
  }

  protected async onStart(): Promise<void> {
    securityLayer.registerAgent(this.id, [Permission.ADMIN]);
    this.healthCheckInterval = setInterval(() => this.checkSystemHealth(), 60 * 1000);
  }

  protected async onStop(): Promise<void> {
    if (this.healthCheckInterval) { clearInterval(this.healthCheckInterval); this.healthCheckInterval = null; }
  }

  protected async handleEvent(event: AgentEvent): Promise<void> {
    switch (event.type) {
      case EventType.AGENT_ERROR:
        await this.handleAgentError(event.payload);
        break;
      case EventType.AGENT_HEARTBEAT:
        this.agentStates.set(event.payload.agentId, event.payload.status);
        // If agent recovered from error, update circuit breaker
        if (event.payload.status === AgentStatus.RUNNING) {
          this.recordSuccess(event.payload.agentId);
        }
        break;
      case EventType.AGENT_STARTED:
        this.agentStates.set(event.payload.agentId, AgentStatus.RUNNING);
        break;
      case EventType.AGENT_STOPPED:
        this.agentStates.set(event.payload.agentId, AgentStatus.STOPPED);
        break;
    }
  }

  private async handleAgentError(payload: { agentId: string; error: string; eventType?: string }): Promise<void> {
    const { agentId, error } = payload;
    const breaker = this.getOrCreateBreaker(agentId);

    breaker.failureCount++;
    breaker.lastFailureAt = Date.now();

    // Check circuit breaker state
    if (breaker.state === 'closed' && breaker.failureCount >= breaker.threshold) {
      breaker.state = 'open';
      breaker.openedAt = Date.now();
      console.warn(`[RECOVERY] 🔴 Circuit OPEN for ${agentId} — ${breaker.failureCount} failures`);

      // Schedule half-open transition
      setTimeout(() => {
        if (breaker.state === 'open') {
          breaker.state = 'half_open';
          breaker.halfOpenAt = Date.now();
          console.log(`[RECOVERY] 🟡 Circuit HALF-OPEN for ${agentId} — allowing test traffic`);
        }
      }, breaker.resetTimeoutMs);

      // Attempt recovery
      await this.attemptRecovery(agentId, error);
    } else if (breaker.state === 'half_open') {
      // Failed again during half-open — reopen
      breaker.state = 'open';
      breaker.openedAt = Date.now();
      console.warn(`[RECOVERY] 🔴 Circuit re-opened for ${agentId}`);
    }
  }

  private recordSuccess(agentId: string): void {
    const breaker = this.circuitBreakers.get(agentId);
    if (!breaker) return;

    if (breaker.state === 'half_open') {
      breaker.state = 'closed';
      breaker.failureCount = 0;
      breaker.successCount++;
      this.recoveryCount++;

      this.emit(EventType.SYSTEM_RECOVERED, {
        agentId,
        recoveryType: 'circuit_breaker_reset',
        previousState: 'half_open',
        totalRecoveries: this.recoveryCount,
      });

      console.log(`[RECOVERY] 🟢 Circuit CLOSED for ${agentId} — agent recovered`);
    }
  }

  private async attemptRecovery(agentId: string, error: string): Promise<void> {
    // Emit directive to restart the agent
    for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
      const delay = RETRY_DELAYS[attempt] || 60000;

      console.log(`[RECOVERY] 🔄 Recovery attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS} for ${agentId} in ${delay / 1000}s`);

      await new Promise(resolve => setTimeout(resolve, delay));

      // Check if agent already recovered
      const currentState = this.agentStates.get(agentId);
      if (currentState === AgentStatus.RUNNING) {
        this.recoveryCount++;
        this.emit(EventType.SYSTEM_RECOVERED, {
          agentId,
          recoveryType: 'auto_recovery',
          attempt: attempt + 1,
          error,
          totalRecoveries: this.recoveryCount,
        });
        console.log(`[RECOVERY] ✅ ${agentId} recovered on attempt ${attempt + 1}`);
        return;
      }

      // Send restart directive
      this.emit(EventType.ORCHESTRATOR_DIRECTIVE, {
        targetAgentId: agentId,
        action: 'restart',
        reason: `Auto-recovery attempt ${attempt + 1} after error: ${error}`,
      });
    }

    // All retries exhausted — escalate to human
    this.emit(EventType.HUMAN_REQUIRED, {
      type: 'agent_failure',
      agentId,
      error,
      reason: `Agent ${agentId} failed to recover after ${MAX_RETRY_ATTEMPTS} attempts`,
      priority: 'critical',
    }, { metadata: { tier: 10, priority: 'critical' } });

    console.error(`[RECOVERY] ❌ ${agentId} failed to recover — escalating to human`);
  }

  private getOrCreateBreaker(agentId: string): CircuitBreaker {
    if (!this.circuitBreakers.has(agentId)) {
      this.circuitBreakers.set(agentId, {
        agentId,
        state: 'closed',
        failureCount: 0,
        successCount: 0,
        lastFailureAt: 0,
        openedAt: 0,
        halfOpenAt: 0,
        threshold: CIRCUIT_THRESHOLD,
        resetTimeoutMs: CIRCUIT_RESET_MS,
      });
    }
    return this.circuitBreakers.get(agentId)!;
  }

  private async checkSystemHealth(): Promise<void> {
    let healthy = 0, errored = 0, total = 0;
    for (const [, status] of Array.from(this.agentStates.entries())) {
      total++;
      if (status === AgentStatus.RUNNING) healthy++;
      else if (status === AgentStatus.ERROR) errored++;
    }

    let openBreakers = 0, halfOpenBreakers = 0, closedBreakers = 0;
    for (const [, b] of Array.from(this.circuitBreakers.entries())) {
      if (b.state === 'open') openBreakers++;
      else if (b.state === 'half_open') halfOpenBreakers++;
      else closedBreakers++;
    }

    const healthPercent = total > 0 ? healthy / total : 1;
    const status: SystemHealth['status'] =
      healthPercent >= 0.9 ? 'healthy' :
      healthPercent >= 0.7 ? 'degraded' :
      healthPercent >= 0.3 ? 'critical' : 'down';

    if (status === 'critical' || status === 'down') {
      this.emit(EventType.HUMAN_REQUIRED, {
        type: 'system_health',
        status,
        healthyAgents: healthy,
        errorAgents: errored,
        totalAgents: total,
        reason: `System health ${status}: ${healthy}/${total} agents operational`,
        priority: 'critical',
      }, { metadata: { tier: 10, priority: 'critical' } });
    }
  }

  getSystemHealth(): SystemHealth {
    let healthy = 0, errored = 0, total = 0;
    for (const [, status] of Array.from(this.agentStates.entries())) {
      total++; if (status === AgentStatus.RUNNING) healthy++; else if (status === AgentStatus.ERROR) errored++;
    }
    let open = 0, halfOpen = 0, closed = 0;
    for (const [, b] of Array.from(this.circuitBreakers.entries())) {
      if (b.state === 'open') open++; else if (b.state === 'half_open') halfOpen++; else closed++;
    }
    const pct = total > 0 ? healthy / total : 1;
    return {
      status: pct >= 0.9 ? 'healthy' : pct >= 0.7 ? 'degraded' : pct >= 0.3 ? 'critical' : 'down',
      healthyAgents: healthy, errorAgents: errored, totalAgents: total,
      circuitBreakers: { open, halfOpen, closed },
      recentRecoveries: this.recoveryCount,
      lastCheckAt: Date.now(),
    };
  }
}
