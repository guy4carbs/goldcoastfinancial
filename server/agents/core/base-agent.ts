/**
 * BASE AGENT
 * Every agent in the system extends this class.
 * Enforces: event-driven communication, heartbeats,
 * performance tracking, compliance checkpoints, and memory access.
 */

import { randomUUID } from 'crypto';
import { EventBus, EventType, AgentEvent, eventBus } from './event-bus';
import { MemoryGraph, memoryGraph } from './memory-graph';

// ─── Agent Status ────────────────────────────────────────────────
export enum AgentStatus {
  INITIALIZING = 'INITIALIZING',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR',
  STOPPED = 'STOPPED',
  COMPLIANCE_HOLD = 'COMPLIANCE_HOLD',
}

// ─── Agent Config ────────────────────────────────────────────────
export interface AgentConfig {
  id: string;
  name: string;
  tier: number;
  description: string;
  capabilities: string[];
  consumesEvents: EventType[];
  producesEvents: EventType[];
  heartbeatIntervalMs?: number;
  complianceRequired?: boolean;
  maxConcurrency?: number;
}

// ─── Performance Metrics ─────────────────────────────────────────
export interface AgentMetrics {
  eventsProcessed: number;
  eventsEmitted: number;
  errorsCount: number;
  avgProcessingTimeMs: number;
  lastActiveAt: number;
  uptimeMs: number;
  taskQueue: number;
  successRate: number;
}

// ─── Base Agent ──────────────────────────────────────────────────
export abstract class BaseAgent {
  readonly id: string;
  readonly config: AgentConfig;
  protected bus: EventBus;
  protected memory: MemoryGraph;
  protected status: AgentStatus = AgentStatus.INITIALIZING;
  protected startedAt: number = 0;

  // Performance tracking
  private metrics: AgentMetrics = {
    eventsProcessed: 0,
    eventsEmitted: 0,
    errorsCount: 0,
    avgProcessingTimeMs: 0,
    lastActiveAt: 0,
    uptimeMs: 0,
    taskQueue: 0,
    successRate: 100,
  };
  private processingTimes: number[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private taskQueue: Array<{ event: AgentEvent; resolve: Function; reject: Function }> = [];
  private processing = false;
  private concurrency = 0;

  constructor(config: AgentConfig) {
    this.id = config.id;
    this.config = {
      heartbeatIntervalMs: 30000,
      complianceRequired: false,
      maxConcurrency: 5,
      ...config,
    };
    this.bus = eventBus;
    this.memory = memoryGraph;
  }

  // ─── Lifecycle ──────────────────────────────────────────────
  async start(): Promise<void> {
    console.log(`[${this.config.name}] 🚀 Starting...`);
    this.startedAt = Date.now();
    this.status = AgentStatus.RUNNING;

    // Subscribe to consumed events
    for (const eventType of this.config.consumesEvents) {
      this.bus.on(eventType, this.id, (event) => this.enqueueEvent(event));
    }

    // Listen for compliance vetoes
    this.bus.on(EventType.COMPLIANCE_VETO, this.id, (event) => {
      if (event.payload?.targetAgentId === this.id) {
        this.status = AgentStatus.COMPLIANCE_HOLD;
        console.warn(`[${this.config.name}] ⛔ COMPLIANCE HOLD — ${event.payload.reason}`);
      }
    });

    // Listen for orchestrator directives
    this.bus.on(EventType.ORCHESTRATOR_DIRECTIVE, this.id, (event) => {
      if (event.payload?.targetAgentId === this.id) {
        this.handleDirective(event.payload);
      }
    });

    // Start heartbeat
    this.heartbeatInterval = setInterval(() => {
      this.emitHeartbeat();
    }, this.config.heartbeatIntervalMs!);

    // Agent-specific initialization
    await this.onStart();

    // Announce
    this.emit(EventType.AGENT_STARTED, {
      agentId: this.id,
      name: this.config.name,
      tier: this.config.tier,
      capabilities: this.config.capabilities,
    });

    console.log(`[${this.config.name}] ✅ Running | Tier ${this.config.tier} | Consuming: ${this.config.consumesEvents.join(', ') || 'none'}`);
  }

  async stop(): Promise<void> {
    console.log(`[${this.config.name}] 🛑 Stopping...`);
    this.status = AgentStatus.STOPPED;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.bus.removeAllSubscriptions(this.id);

    await this.onStop();

    this.emit(EventType.AGENT_STOPPED, {
      agentId: this.id,
      name: this.config.name,
      uptimeMs: Date.now() - this.startedAt,
      metrics: this.getMetrics(),
    });
  }

  // ─── Event Processing Queue ────────────────────────────────
  private async enqueueEvent(event: AgentEvent): Promise<void> {
    if (this.status === AgentStatus.COMPLIANCE_HOLD) {
      console.warn(`[${this.config.name}] Dropping event ${event.type} — COMPLIANCE HOLD`);
      return;
    }

    if (this.status !== AgentStatus.RUNNING) return;

    this.metrics.taskQueue++;

    // Process concurrently up to maxConcurrency
    if (this.concurrency < this.config.maxConcurrency!) {
      this.processEvent(event);
    } else {
      // Queue it
      this.taskQueue.push({
        event,
        resolve: () => {},
        reject: () => {},
      });
    }
  }

  private async processEvent(event: AgentEvent): Promise<void> {
    this.concurrency++;
    const start = Date.now();

    try {
      // Compliance gate
      if (this.config.complianceRequired && event.metadata?.complianceRequired !== false) {
        const approved = await this.checkCompliance(event);
        if (!approved) {
          console.warn(`[${this.config.name}] Event ${event.type} blocked by compliance`);
          return;
        }
      }

      await this.handleEvent(event);

      this.metrics.eventsProcessed++;
      this.metrics.lastActiveAt = Date.now();

      const elapsed = Date.now() - start;
      this.processingTimes.push(elapsed);
      if (this.processingTimes.length > 100) this.processingTimes.shift();
      this.metrics.avgProcessingTimeMs =
        this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length;

    } catch (error) {
      this.metrics.errorsCount++;
      console.error(`[${this.config.name}] Error processing ${event.type}:`, error);

      this.emit(EventType.AGENT_ERROR, {
        agentId: this.id,
        eventType: event.type,
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
    } finally {
      this.concurrency--;
      this.metrics.taskQueue = Math.max(0, this.metrics.taskQueue - 1);

      // Process next in queue
      if (this.taskQueue.length > 0) {
        const next = this.taskQueue.shift()!;
        this.processEvent(next.event);
      }
    }

    // Update success rate
    const total = this.metrics.eventsProcessed + this.metrics.errorsCount;
    this.metrics.successRate = total > 0
      ? (this.metrics.eventsProcessed / total) * 100
      : 100;
  }

  // ─── Emit Event ────────────────────────────────────────────
  protected emit<T = any>(
    type: EventType,
    payload: T,
    options: Partial<AgentEvent<T>> = {}
  ): void {
    const event = EventBus.createEvent(type, this.id, payload, {
      metadata: {
        tier: this.config.tier,
        priority: 'normal',
        ...options.metadata,
      },
      ...options,
    });

    this.bus.emit(event);
    this.metrics.eventsEmitted++;
  }

  // ─── Compliance Check ──────────────────────────────────────
  protected async checkCompliance(event: AgentEvent): Promise<boolean> {
    // Emit a compliance check request and wait for response
    // For now, auto-approve. Compliance agent will override when active.
    return true;
  }

  // ─── Heartbeat ─────────────────────────────────────────────
  private emitHeartbeat(): void {
    this.emit(EventType.AGENT_HEARTBEAT, {
      agentId: this.id,
      name: this.config.name,
      status: this.status,
      metrics: this.getMetrics(),
      uptime: Date.now() - this.startedAt,
    }, {
      metadata: {
        tier: this.config.tier,
        priority: 'low',
      },
    });
  }

  // ─── Handle Orchestrator Directives ────────────────────────
  protected handleDirective(directive: any): void {
    switch (directive.action) {
      case 'pause':
        this.status = AgentStatus.PAUSED;
        break;
      case 'resume':
        this.status = AgentStatus.RUNNING;
        break;
      case 'restart':
        this.stop().then(() => this.start());
        break;
      case 'updateConfig':
        Object.assign(this.config, directive.config);
        break;
    }
  }

  // ─── Metrics ───────────────────────────────────────────────
  getMetrics(): AgentMetrics {
    return {
      ...this.metrics,
      uptimeMs: Date.now() - this.startedAt,
    };
  }

  getStatus(): AgentStatus {
    return this.status;
  }

  getInfo(): {
    id: string;
    name: string;
    tier: number;
    status: AgentStatus;
    metrics: AgentMetrics;
    config: AgentConfig;
  } {
    return {
      id: this.id,
      name: this.config.name,
      tier: this.config.tier,
      status: this.status,
      metrics: this.getMetrics(),
      config: this.config,
    };
  }

  // ─── Abstract Methods (each agent implements) ──────────────
  protected abstract onStart(): Promise<void>;
  protected abstract onStop(): Promise<void>;
  protected abstract handleEvent(event: AgentEvent): Promise<void>;
}
