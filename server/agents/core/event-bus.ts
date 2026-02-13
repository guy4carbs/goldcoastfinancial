/**
 * ENTERPRISE EVENT BUS
 * Central nervous system of the entire agent ecosystem.
 * All agents communicate exclusively through this bus.
 * No silent decisions. No hidden state.
 */

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';

// ─── Event Types ────────────────────────────────────────────────
export enum EventType {
  // Tier 1 - Lead Acquisition
  RAW_LEAD_CREATED = 'RAW_LEAD_CREATED',
  LEAD_ENRICHED = 'LEAD_ENRICHED',
  LEAD_READY_FOR_SCORING = 'LEAD_READY_FOR_SCORING',
  LEAD_SCORED = 'LEAD_SCORED',

  // Tier 2 - Outreach & Contact
  CALL_CONNECTED = 'CALL_CONNECTED',
  CALL_FAILED = 'CALL_FAILED',
  EMAIL_ENGAGED = 'EMAIL_ENGAGED',
  SMS_RESPONSE_RECEIVED = 'SMS_RESPONSE_RECEIVED',
  SOCIAL_REPLY_RECEIVED = 'SOCIAL_REPLY_RECEIVED',
  OUTREACH_COMPLETED = 'OUTREACH_COMPLETED',

  // Tier 3 - Inbound & Speed
  INBOUND_QUALIFIED = 'INBOUND_QUALIFIED',
  APPOINTMENT_BOOKED = 'APPOINTMENT_BOOKED',

  // Tier 4 - Sales & Closing
  POLICY_SOLD = 'POLICY_SOLD',
  SALE_ASSISTED = 'SALE_ASSISTED',
  COACHING_FEEDBACK = 'COACHING_FEEDBACK',

  // Tier 5 - Application & Policy
  APPLICATION_SUBMITTED = 'APPLICATION_SUBMITTED',
  UNDERWRITING_STATUS = 'UNDERWRITING_STATUS',
  POLICY_RECOMMENDED = 'POLICY_RECOMMENDED',
  COMPLIANCE_APPROVED = 'COMPLIANCE_APPROVED',
  COMPLIANCE_BLOCKED = 'COMPLIANCE_BLOCKED',

  // Tier 6 - Financial Ops
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  COMMISSION_CALCULATED = 'COMMISSION_CALCULATED',
  FORECAST_UPDATED = 'FORECAST_UPDATED',

  // Tier 7 - Client Lifecycle
  SUPPORT_RESOLVED = 'SUPPORT_RESOLVED',
  CLAIM_STATUS_UPDATED = 'CLAIM_STATUS_UPDATED',
  CLIENT_RETAINED = 'CLIENT_RETAINED',

  // Tier 8 - Marketing & Brand
  CONTENT_POSTED = 'CONTENT_POSTED',
  CONTENT_CREATED = 'CONTENT_CREATED',
  REPUTATION_EVENT = 'REPUTATION_EVENT',

  // Tier 9 - Analytics & Learning
  METRIC_UPDATED = 'METRIC_UPDATED',
  AGENT_SCORE_UPDATED = 'AGENT_SCORE_UPDATED',
  OPTIMIZATION_APPLIED = 'OPTIMIZATION_APPLIED',

  // Tier 10 - Governance & Meta
  SECURITY_EVENT = 'SECURITY_EVENT',
  SYSTEM_RECOVERED = 'SYSTEM_RECOVERED',
  HUMAN_REQUIRED = 'HUMAN_REQUIRED',
  AGENT_UPDATED = 'AGENT_UPDATED',

  // System Events
  AGENT_STARTED = 'AGENT_STARTED',
  AGENT_STOPPED = 'AGENT_STOPPED',
  AGENT_ERROR = 'AGENT_ERROR',
  AGENT_HEARTBEAT = 'AGENT_HEARTBEAT',
  ORCHESTRATOR_DIRECTIVE = 'ORCHESTRATOR_DIRECTIVE',
  COMPLIANCE_VETO = 'COMPLIANCE_VETO',
}

// ─── Event Envelope ─────────────────────────────────────────────
export interface AgentEvent<T = any> {
  id: string;
  type: EventType;
  source: string;        // Agent ID that emitted
  timestamp: number;
  correlationId?: string; // For tracking event chains
  causationId?: string;   // The event that caused this one
  payload: T;
  metadata: {
    tier: number;
    priority: 'low' | 'normal' | 'high' | 'critical';
    ttl?: number;         // Time-to-live in ms
    retryCount?: number;
    complianceRequired?: boolean;
  };
}

// ─── Event Bus Options ──────────────────────────────────────────
interface EventBusOptions {
  maxListeners?: number;
  enableAuditLog?: boolean;
  enableDeadLetterQueue?: boolean;
}

// ─── Subscription Handle ────────────────────────────────────────
export interface Subscription {
  unsubscribe: () => void;
  eventType: EventType;
  subscriberId: string;
}

// ─── Dead Letter Entry ──────────────────────────────────────────
interface DeadLetterEntry {
  event: AgentEvent;
  error: Error;
  failedAt: number;
  subscriberId: string;
}

// ─── The Event Bus ──────────────────────────────────────────────
export class EventBus {
  private emitter: EventEmitter;
  private auditLog: AgentEvent[] = [];
  private deadLetterQueue: DeadLetterEntry[] = [];
  private subscriptions: Map<string, Subscription[]> = new Map();
  private eventCounts: Map<EventType, number> = new Map();
  private options: EventBusOptions;

  // Singleton
  private static instance: EventBus;

  static getInstance(options?: EventBusOptions): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus(options);
    }
    return EventBus.instance;
  }

  static resetInstance(): void {
    if (EventBus.instance) {
      EventBus.instance.destroy();
      EventBus.instance = undefined as any;
    }
  }

  private constructor(options: EventBusOptions = {}) {
    this.options = {
      maxListeners: 100,
      enableAuditLog: true,
      enableDeadLetterQueue: true,
      ...options,
    };
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(this.options.maxListeners!);
  }

  // ─── Publish ────────────────────────────────────────────────
  emit<T = any>(event: AgentEvent<T>): void {
    // Stamp event
    if (!event.id) event.id = randomUUID();
    if (!event.timestamp) event.timestamp = Date.now();

    // Audit log
    if (this.options.enableAuditLog) {
      this.auditLog.push(event);
      // Keep last 10k events in memory
      if (this.auditLog.length > 10000) {
        this.auditLog = this.auditLog.slice(-5000);
      }
    }

    // Count
    this.eventCounts.set(
      event.type,
      (this.eventCounts.get(event.type) || 0) + 1
    );

    // Compliance veto check — if compliance blocked, don't propagate
    if (event.type === EventType.COMPLIANCE_VETO) {
      console.warn(`[EVENT-BUS] ⛔ COMPLIANCE VETO from ${event.source}:`, event.payload);
    }

    // Emit to all subscribers
    this.emitter.emit(event.type, event);
    // Also emit a wildcard for the orchestrator
    this.emitter.emit('*', event);
  }

  // ─── Subscribe ──────────────────────────────────────────────
  on<T = any>(
    eventType: EventType | '*',
    subscriberId: string,
    handler: (event: AgentEvent<T>) => void | Promise<void>
  ): Subscription {
    const wrappedHandler = async (event: AgentEvent<T>) => {
      try {
        await handler(event);
      } catch (error) {
        console.error(
          `[EVENT-BUS] Error in subscriber ${subscriberId} for ${eventType}:`,
          error
        );
        if (this.options.enableDeadLetterQueue) {
          this.deadLetterQueue.push({
            event: event as AgentEvent,
            error: error as Error,
            failedAt: Date.now(),
            subscriberId,
          });
        }
      }
    };

    this.emitter.on(eventType as string, wrappedHandler);

    const subscription: Subscription = {
      eventType: eventType as EventType,
      subscriberId,
      unsubscribe: () => {
        this.emitter.off(eventType as string, wrappedHandler);
        const subs = this.subscriptions.get(subscriberId);
        if (subs) {
          const idx = subs.indexOf(subscription);
          if (idx >= 0) subs.splice(idx, 1);
        }
      },
    };

    if (!this.subscriptions.has(subscriberId)) {
      this.subscriptions.set(subscriberId, []);
    }
    this.subscriptions.get(subscriberId)!.push(subscription);

    return subscription;
  }

  // ─── One-time subscription ─────────────────────────────────
  once<T = any>(
    eventType: EventType,
    subscriberId: string,
    handler: (event: AgentEvent<T>) => void | Promise<void>
  ): void {
    const sub = this.on(eventType, subscriberId, (event) => {
      sub.unsubscribe();
      return handler(event);
    });
  }

  // ─── Wait for event (Promise-based) ────────────────────────
  waitFor<T = any>(
    eventType: EventType,
    timeoutMs: number = 30000
  ): Promise<AgentEvent<T>> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout waiting for ${eventType} after ${timeoutMs}ms`));
      }, timeoutMs);

      this.once(eventType, `waitFor-${randomUUID()}`, (event) => {
        clearTimeout(timer);
        resolve(event as AgentEvent<T>);
      });
    });
  }

  // ─── Create Event Helper ───────────────────────────────────
  static createEvent<T = any>(
    type: EventType,
    source: string,
    payload: T,
    options: Partial<AgentEvent<T>> = {}
  ): AgentEvent<T> {
    return {
      id: randomUUID(),
      type,
      source,
      timestamp: Date.now(),
      payload,
      metadata: {
        tier: 0,
        priority: 'normal',
        ...options.metadata,
      },
      ...options,
    };
  }

  // ─── Diagnostics ───────────────────────────────────────────
  getAuditLog(limit: number = 100): AgentEvent[] {
    return this.auditLog.slice(-limit);
  }

  getDeadLetterQueue(): DeadLetterEntry[] {
    return [...this.deadLetterQueue];
  }

  getEventCounts(): Record<string, number> {
    return Object.fromEntries(this.eventCounts);
  }

  getSubscriberCount(): number {
    return this.subscriptions.size;
  }

  getSubscriptions(): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    this.subscriptions.forEach((subs, id) => {
      result[id] = subs.map((s) => s.eventType);
    });
    return result;
  }

  getStats(): {
    totalEvents: number;
    eventCounts: Record<string, number>;
    subscribers: number;
    deadLetters: number;
    auditLogSize: number;
  } {
    let totalEvents = 0;
    this.eventCounts.forEach((c) => (totalEvents += c));
    return {
      totalEvents,
      eventCounts: this.getEventCounts(),
      subscribers: this.getSubscriberCount(),
      deadLetters: this.deadLetterQueue.length,
      auditLogSize: this.auditLog.length,
    };
  }

  // ─── Cleanup ───────────────────────────────────────────────
  removeAllSubscriptions(subscriberId: string): void {
    const subs = this.subscriptions.get(subscriberId);
    if (subs) {
      subs.forEach((s) => s.unsubscribe());
      this.subscriptions.delete(subscriberId);
    }
  }

  destroy(): void {
    this.emitter.removeAllListeners();
    this.subscriptions.clear();
    this.auditLog = [];
    this.deadLetterQueue = [];
    this.eventCounts.clear();
  }
}

// ─── Export Singleton ────────────────────────────────────────────
export const eventBus = EventBus.getInstance();
