/**
 * DIALER_AGENT
 * Auto-dials leads from scored queue, voicemail detection/drop,
 * hot call transfers, retry scheduling, DNC enforcement, timezone-aware windows.
 */

import { BaseAgent, EventType, AgentEvent, memoryGraph, LeadData, analyticsLedger, MetricType } from '../core';

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
      consumesEvents: [EventType.LEAD_SCORED, EventType.SMS_RESPONSE_RECEIVED],
      producesEvents: [EventType.CALL_CONNECTED, EventType.CALL_FAILED],
    });
  }

  protected async onStart(): Promise<void> {
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

  // ─── Core dial logic ──────────────────────────────────────
  private async dial(entry: DialQueueEntry): Promise<void> {
    this.activeCallCount++;
    entry.attempts++;

    const node = this.memory.getNode<LeadData>(entry.leadId);
    const leadName = node ? `${node.data.firstName} ${node.data.lastName}` : entry.leadId;

    console.log(`[DIALER] 📞 Dialing ${leadName} at ${entry.phone} (attempt ${entry.attempts}/${MAX_ATTEMPTS})...`);

    // Simulate call outcome (production: SIP/Twilio integration)
    const outcome = this.simulateCallOutcome();
    const durationSec = outcome === 'connected' ? Math.floor(Math.random() * 300) + 30 : 0;

    this.activeCallCount--;

    const attempt = this.recordAttempt(entry.leadId, entry.phone, outcome, durationSec, false);

    analyticsLedger.record(MetricType.OUTREACH_CALL_MADE, 1, this.id, {
      entityId: entry.leadId,
      metadata: { outcome, attempt: entry.attempts },
    });

    switch (outcome) {
      case 'connected': {
        this.dialQueue.delete(entry.leadId);
        const shouldTransfer = entry.score >= 80;
        attempt.transferred = shouldTransfer;

        this.emit(EventType.CALL_CONNECTED, {
          leadId: entry.leadId,
          phone: entry.phone,
          durationSec,
          attempt: entry.attempts,
          transferred: shouldTransfer,
          score: entry.score,
        }, { metadata: { tier: 2, priority: 'high' } });

        console.log(`[DIALER] ✅ Connected with ${leadName} | ${durationSec}s${shouldTransfer ? ' | 🔥 HOT TRANSFER' : ''}`);
        break;
      }

      case 'voicemail': {
        await this.dropVoicemail(entry.leadId, entry.phone);
        this.scheduleRetry(entry);
        break;
      }

      case 'no_answer':
      case 'busy': {
        this.scheduleRetry(entry);
        if (entry.attempts >= MAX_ATTEMPTS) {
          this.dialQueue.delete(entry.leadId);
          this.emit(EventType.CALL_FAILED, {
            leadId: entry.leadId,
            phone: entry.phone,
            totalAttempts: entry.attempts,
            lastOutcome: outcome,
            reason: 'max_attempts_reached',
          });
          console.log(`[DIALER] ❌ Exhausted attempts for ${leadName}`);
        }
        break;
      }
    }
  }

  // ─── Voicemail drop ────────────────────────────────────────
  private async dropVoicemail(leadId: string, phone: string): Promise<void> {
    const node = this.memory.getNode<LeadData>(leadId);
    const firstName = node?.data.firstName || 'there';

    const vmMessages = [
      `Hi ${firstName}, this is your insurance advisor following up on the coverage quote you requested. I have some great options for you — call me back at your convenience or reply to my text.`,
      `Hey ${firstName}, just a quick follow-up on your insurance inquiry. I've got your personalized rates ready. Give me a call back when you get a chance!`,
    ];
    const selected = vmMessages[Math.floor(Math.random() * vmMessages.length)];

    console.log(`[DIALER] 📭 Voicemail dropped for ${firstName} at ${phone}: "${selected.substring(0, 50)}..."`);
    analyticsLedger.record(MetricType.OUTREACH_CALL_MADE, 1, this.id, {
      entityId: leadId,
      metadata: { type: 'voicemail_drop' },
    });
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
  addToDnc(phone: string): void {
    const normalized = this.normalizePhone(phone);
    this.dncList.add(normalized);
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

  private simulateCallOutcome(): 'connected' | 'voicemail' | 'no_answer' | 'busy' {
    const r = Math.random();
    if (r < 0.25) return 'connected';
    if (r < 0.50) return 'voicemail';
    if (r < 0.80) return 'no_answer';
    return 'busy';
  }

  getQueueSize(): number { return this.dialQueue.size; }
  getCallHistory(leadId: string): DialAttempt[] { return this.callHistory.get(leadId) || []; }
}
