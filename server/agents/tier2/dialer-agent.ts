/**
 * DIALER_AGENT
 * Auto-dials leads from scored queue, voicemail detection/drop,
 * hot call transfers, retry scheduling, DNC enforcement, timezone-aware windows.
 */

import { BaseAgent, EventType, AgentEvent, memoryGraph, LeadData, analyticsLedger, MetricType } from '../core';
import { dialOutbound, extractAreaCode, formatPhoneNumber } from '../../services/telnyxVoiceService';
import { storage } from '../../storage';

// ─── Types ───────────────────────────────────────────────────────
interface DialAttempt {
  leadId: string;
  phone: string;
  attemptedAt: number;
  outcome: 'connected' | 'voicemail' | 'no_answer' | 'busy' | 'dnc_blocked' | 'outside_window';
  durationSec: number;
  transferred: boolean;
  retryAt?: number;
}

interface DialQueueEntry {
  leadId: string;
  phone: string;
  score: number;
  timezone: string;
  attempts: number;
  nextDialAt: number;
}

const MAX_ATTEMPTS = 5;
const RETRY_DELAYS_MS = [5 * 60_000, 30 * 60_000, 2 * 3600_000, 8 * 3600_000, 24 * 3600_000];

const DIAL_WINDOWS: Record<string, { startHour: number; endHour: number }> = {
  'America/New_York': { startHour: 9, endHour: 20 },
  'America/Chicago': { startHour: 9, endHour: 20 },
  'America/Denver': { startHour: 9, endHour: 20 },
  'America/Los_Angeles': { startHour: 9, endHour: 20 },
  default: { startHour: 9, endHour: 20 },
};

export class DialerAgent extends BaseAgent {
  private dialQueue: Map<string, DialQueueEntry> = new Map();
  private callHistory: Map<string, DialAttempt[]> = new Map();
  private dncList: Set<string> = new Set();
  private activeCallCount = 0;
  private maxConcurrentCalls = 3;
  private dialTimer: NodeJS.Timeout | null = null;

  constructor() {
    super({
      id: 'dialer',
      name: 'DIALER_AGENT',
      tier: 2,
      description: 'Auto-dialer with voicemail detection, DNC, and timezone windows',
      capabilities: ['auto_dial', 'voicemail_drop', 'hot_transfer', 'dnc_enforcement', 'timezone_dialing'],
      consumesEvents: [EventType.LEAD_SCORED, EventType.SMS_RESPONSE_RECEIVED, EventType.CALL_CONNECTED, EventType.CALL_FAILED],
      producesEvents: [EventType.CALL_CONNECTED, EventType.CALL_FAILED],
    });
  }

  protected async onStart(): Promise<void> {
    // Load DNC list from database on startup
    try {
      const { numbers } = await storage.getDncList({ limit: 10000 });
      for (const entry of numbers) {
        this.dncList.add(this.normalizePhone(entry.phoneNumber));
      }
      console.log(`[DIALER] Loaded ${this.dncList.size} DNC numbers from database`);
    } catch (err) {
      console.warn('[DIALER] Failed to load DNC list from DB:', err);
    }
    this.dialTimer = setInterval(() => this.processDialQueue(), 5000);
  }

  protected async onStop(): Promise<void> {
    if (this.dialTimer) {
      clearInterval(this.dialTimer);
      this.dialTimer = null;
    }
  }

  protected async handleEvent(event: AgentEvent): Promise<void> {
    switch (event.type) {
      case EventType.LEAD_SCORED:
        await this.enqueueFromScore(event.payload);
        break;
      case EventType.SMS_RESPONSE_RECEIVED:
        if (event.payload.intent === 'call_request') {
          await this.prioritizeLead(event.payload.leadId);
        }
        break;
      case EventType.CALL_CONNECTED:
        await this.handleCallConnected(event.payload);
        break;
      case EventType.CALL_FAILED:
        await this.handleCallFailed(event.payload);
        break;
    }
  }

  // Handle webhook-driven call connected result
  private async handleCallConnected(payload: { leadId?: string; agentUserId?: string; phoneNumber?: string; amdResult?: string }): Promise<void> {
    const leadId = payload.leadId;
    if (!leadId) return;

    const entry = this.dialQueue.get(leadId);
    if (!entry) return;

    this.activeCallCount = Math.max(0, this.activeCallCount - 1);
    this.dialQueue.delete(leadId);

    this.recordAttempt(leadId, entry.phone, 'connected', 0, true);
    analyticsLedger.record(MetricType.OUTREACH_CALL_MADE, 1, this.id, {
      entityId: leadId,
      metadata: { outcome: 'connected', attempt: entry.attempts, amdResult: payload.amdResult },
    });

    console.log(`[DIALER] ✅ Human answered for lead ${leadId} — transferred to agent`);
  }

  // Handle webhook-driven call failed result
  private async handleCallFailed(payload: { leadId?: string; reason?: string }): Promise<void> {
    const leadId = payload.leadId;
    if (!leadId) return;

    const entry = this.dialQueue.get(leadId);
    if (!entry) return;

    this.activeCallCount = Math.max(0, this.activeCallCount - 1);

    const outcome = payload.reason === 'machine' ? 'voicemail' : 'no_answer';
    this.recordAttempt(leadId, entry.phone, outcome, 0, false);
    analyticsLedger.record(MetricType.OUTREACH_CALL_MADE, 1, this.id, {
      entityId: leadId,
      metadata: { outcome, attempt: entry.attempts },
    });

    this.scheduleRetry(entry);

    if (entry.attempts >= MAX_ATTEMPTS) {
      this.dialQueue.delete(leadId);
      this.emit(EventType.CALL_FAILED, {
        leadId,
        phone: entry.phone,
        totalAttempts: entry.attempts,
        lastOutcome: outcome,
        reason: 'max_attempts_reached',
      });
      console.log(`[DIALER] ❌ Exhausted attempts for lead ${leadId}`);
    }
  }

  // ─── Enqueue scored lead ───────────────────────────────────
  private async enqueueFromScore(payload: { leadId: string; score: number; recommendedPath: string }): Promise<void> {
    if (!['immediate_call', 'priority_outreach'].includes(payload.recommendedPath)) return;

    const node = this.memory.getNode<LeadData>(payload.leadId);
    if (!node || !node.data.phone) return;

    const phone = this.normalizePhone(node.data.phone);
    if (this.dncList.has(phone)) {
      console.log(`[DIALER] 🚫 DNC blocked: ${phone}`);
      return;
    }

    this.dialQueue.set(payload.leadId, {
      leadId: payload.leadId,
      phone,
      score: payload.score,
      timezone: node.data.customFields?.timezone || 'America/Chicago',
      attempts: 0,
      nextDialAt: Date.now(),
    });

    console.log(`[DIALER] 📋 Queued ${node.data.firstName} ${node.data.lastName} | Score: ${payload.score} | Phone: ${phone}`);
  }

  // ─── Bump lead to front of queue ───────────────────────────
  private async prioritizeLead(leadId: string): Promise<void> {
    const entry = this.dialQueue.get(leadId);
    if (entry) {
      entry.nextDialAt = Date.now();
      entry.score = 100; // max priority
      console.log(`[DIALER] ⚡ Prioritized ${leadId} — callback requested`);
    }
  }

  // ─── Process queue on interval ─────────────────────────────
  private async processDialQueue(): Promise<void> {
    if (this.activeCallCount >= this.maxConcurrentCalls) return;

    const now = Date.now();
    const ready = Array.from(this.dialQueue.values())
      .filter((e) => e.nextDialAt <= now && e.attempts < MAX_ATTEMPTS)
      .sort((a, b) => b.score - a.score);

    for (const entry of ready) {
      if (this.activeCallCount >= this.maxConcurrentCalls) break;

      if (!this.isWithinDialWindow(entry.timezone)) {
        this.recordAttempt(entry.leadId, entry.phone, 'outside_window', 0, false);
        entry.nextDialAt = this.getNextWindowOpenMs(entry.timezone);
        continue;
      }

      await this.dial(entry);
    }
  }

  // ─── Core dial logic (Telnyx Call Control + Premium AMD) ───
  private async dial(entry: DialQueueEntry): Promise<void> {
    this.activeCallCount++;
    entry.attempts++;

    const node = this.memory.getNode<LeadData>(entry.leadId);
    const leadName = node ? `${node.data.firstName} ${node.data.lastName}` : entry.leadId;

    console.log(`[DIALER] 📞 Dialing ${leadName} at ${entry.phone} (attempt ${entry.attempts}/${MAX_ATTEMPTS})...`);

    const connectionId = process.env.TELNYX_CONNECTION_ID;
    const appUrl = process.env.APP_URL || '';
    const webhookUrl = `${appUrl}/api/calls/webhook`;

    if (!connectionId) {
      console.error('[DIALER] TELNYX_CONNECTION_ID not configured — cannot dial');
      this.activeCallCount--;
      return;
    }

    // Local presence: match caller ID to prospect's area code
    const prospectAreaCode = extractAreaCode(entry.phone);
    let callerId = process.env.TELNYX_DEFAULT_CALLER_ID || '';
    try {
      const localNumber = await storage.getNumberByAreaCode(prospectAreaCode);
      if (localNumber) {
        callerId = localNumber.phoneNumber;
        console.log(`[DIALER] 📍 Local presence: using ${callerId} for area code ${prospectAreaCode}`);
      }
    } catch (err: any) {
      console.warn('[DIALER] Local presence lookup failed:', err.message);
    }

    try {
      // Fire the call via Telnyx Call Control API with Premium AMD
      // Webhook handler in calls.ts processes AMD results and emits CALL_CONNECTED/CALL_FAILED
      const { callControlId } = await dialOutbound({
        to: entry.phone,
        from: callerId,
        connectionId,
        webhookUrl,
        amd: true,
        clientState: {
          source: 'power_dialer',
          agentUserId: node?.data.assignedAgent || '',
          leadId: entry.leadId,
          leadFirstName: node?.data.firstName || '',
        },
      });

      console.log(`[DIALER] 📞 Call initiated: ${callControlId} → ${entry.phone}`);

      analyticsLedger.record(MetricType.OUTREACH_CALL_MADE, 1, this.id, {
        entityId: entry.leadId,
        metadata: { callControlId, attempt: entry.attempts },
      });

      // Note: activeCallCount is decremented when CALL_CONNECTED or CALL_FAILED event arrives
      // from the webhook handler. The AMD + voicemail drop is fully handled by webhooks.
    } catch (dialError: any) {
      console.error(`[DIALER] ❌ Dial failed for ${leadName}:`, dialError.message);
      this.activeCallCount--;
      this.recordAttempt(entry.leadId, entry.phone, 'no_answer', 0, false);
      this.scheduleRetry(entry);

      if (entry.attempts >= MAX_ATTEMPTS) {
        this.dialQueue.delete(entry.leadId);
        this.emit(EventType.CALL_FAILED, {
          leadId: entry.leadId,
          phone: entry.phone,
          totalAttempts: entry.attempts,
          lastOutcome: 'no_answer',
          reason: 'dial_api_error',
        });
      }
    }
  }

  // ─── Retry scheduling ─────────────────────────────────────
  private scheduleRetry(entry: DialQueueEntry): void {
    const delayIdx = Math.min(entry.attempts - 1, RETRY_DELAYS_MS.length - 1);
    entry.nextDialAt = Date.now() + RETRY_DELAYS_MS[delayIdx];
    console.log(`[DIALER] 🔄 Retry scheduled for ${entry.leadId} at ${new Date(entry.nextDialAt).toLocaleTimeString()}`);
  }

  // ─── Timezone window checks ────────────────────────────────
  private isWithinDialWindow(timezone: string): boolean {
    const window = DIAL_WINDOWS[timezone] || DIAL_WINDOWS.default;
    try {
      const hour = parseInt(new Date().toLocaleString('en-US', { timeZone: timezone, hour: 'numeric', hour12: false }));
      return hour >= window.startHour && hour < window.endHour;
    } catch {
      const hour = new Date().getHours();
      return hour >= window.startHour && hour < window.endHour;
    }
  }

  private getNextWindowOpenMs(timezone: string): number {
    const window = DIAL_WINDOWS[timezone] || DIAL_WINDOWS.default;
    const now = new Date();
    const next = new Date(now);
    next.setHours(window.startHour, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next.getTime();
  }

  // ─── DNC management ────────────────────────────────────────
  async addToDnc(phone: string, userId?: string): Promise<void> {
    const normalized = this.normalizePhone(phone);
    this.dncList.add(normalized);
    // Persist to database
    try {
      await storage.addToDnc({
        phoneNumber: normalized,
        reason: 'agent_flagged',
        addedByUserId: userId || '',
        source: 'dialer_agent',
      });
    } catch (err) {
      console.warn('[DIALER] Failed to persist DNC to DB:', err);
    }
    // Remove from queue if present
    for (const [leadId, entry] of Array.from(this.dialQueue.entries())) {
      if (entry.phone === normalized) {
        this.dialQueue.delete(leadId);
        console.log(`[DIALER] 🚫 DNC added & removed from queue: ${normalized}`);
      }
    }
  }

  // ─── Helpers ───────────────────────────────────────────────
  private normalizePhone(phone: string): string {
    return phone.replace(/[^0-9+]/g, '');
  }

  private recordAttempt(leadId: string, phone: string, outcome: DialAttempt['outcome'], durationSec: number, transferred: boolean): DialAttempt {
    const attempt: DialAttempt = { leadId, phone, attemptedAt: Date.now(), outcome, durationSec, transferred };
    if (!this.callHistory.has(leadId)) this.callHistory.set(leadId, []);
    this.callHistory.get(leadId)!.push(attempt);
    return attempt;
  }

  getQueueSize(): number { return this.dialQueue.size; }
  getCallHistory(leadId: string): DialAttempt[] { return this.callHistory.get(leadId) || []; }
}
