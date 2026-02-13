/**
 * SOCIAL_DM_AGENT
 * Instagram/Facebook/LinkedIn DM outreach, personalized templates,
 * reply detection, intent classification, rate limit management.
 */

import { BaseAgent, EventType, AgentEvent, memoryGraph, LeadData, analyticsLedger, MetricType } from '../core';

// ─── Types ───────────────────────────────────────────────────────
type Platform = 'instagram' | 'facebook' | 'linkedin';

interface DmThread {
  leadId: string;
  platform: Platform;
  handle: string;
  messages: Array<{ direction: 'out' | 'in'; text: string; at: number }>;
  status: 'active' | 'replied' | 'qualified' | 'unresponsive' | 'opted_out';
  lastSentAt: number;
  followUpCount: number;
}

interface PlatformLimits {
  dailySent: number;
  dailyMax: number;
  hourlySent: number;
  hourlyMax: number;
  lastResetDay: number;
  lastResetHour: number;
  cooldownUntil: number;
}

const DEFAULT_LIMITS: Record<Platform, { dailyMax: number; hourlyMax: number }> = {
  instagram: { dailyMax: 50, hourlyMax: 10 },
  facebook: { dailyMax: 40, hourlyMax: 8 },
  linkedin: { dailyMax: 25, hourlyMax: 5 },
};

const FOLLOW_UP_DELAY_MS = 24 * 3600_000;
const MAX_FOLLOW_UPS = 3;

export class SocialDmAgent extends BaseAgent {
  private threads: Map<string, DmThread> = new Map();
  private rateLimits: Map<Platform, PlatformLimits> = new Map();
  private followUpTimer: NodeJS.Timeout | null = null;

  constructor() {
    super({
      id: 'social-dm',
      name: 'SOCIAL_DM_AGENT',
      tier: 2,
      description: 'Multi-platform DM outreach with intent classification',
      capabilities: ['dm_outreach', 'reply_detection', 'intent_classification', 'rate_limit_mgmt', 'lead_qualification'],
      consumesEvents: [EventType.LEAD_SCORED, EventType.LEAD_ENRICHED],
      producesEvents: [EventType.SOCIAL_REPLY_RECEIVED],
    });

    for (const platform of ['instagram', 'facebook', 'linkedin'] as Platform[]) {
      const limits = DEFAULT_LIMITS[platform];
      this.rateLimits.set(platform, {
        dailySent: 0, dailyMax: limits.dailyMax,
        hourlySent: 0, hourlyMax: limits.hourlyMax,
        lastResetDay: new Date().getDate(),
        lastResetHour: new Date().getHours(),
        cooldownUntil: 0,
      });
    }
  }

  protected async onStart(): Promise<void> {
    this.followUpTimer = setInterval(() => this.processFollowUps(), 60_000);
  }

  protected async onStop(): Promise<void> {
    if (this.followUpTimer) {
      clearInterval(this.followUpTimer);
      this.followUpTimer = null;
    }
  }

  protected async handleEvent(event: AgentEvent): Promise<void> {
    switch (event.type) {
      case EventType.LEAD_SCORED: {
        const { leadId, score, recommendedPath } = event.payload;
        if (score >= 30 && recommendedPath !== 'immediate_call') {
          await this.initiateDmOutreach(leadId);
        }
        break;
      }
      case EventType.LEAD_ENRICHED: {
        const { leadId, socialProfiles } = event.payload;
        if (socialProfiles) {
          await this.updateLeadSocials(leadId, socialProfiles);
        }
        break;
      }
    }
  }

  // ─── Initiate DM outreach ─────────────────────────────────
  private async initiateDmOutreach(leadId: string): Promise<void> {
    const node = this.memory.getNode<LeadData>(leadId);
    if (!node) return;

    const data = node.data;
    const socials = data.customFields?.socialProfiles as Record<string, string> | undefined;
    if (!socials) return;

    // Pick best platform (prefer LinkedIn for high-value, Instagram for younger demos)
    const platform = this.selectPlatform(socials, data);
    if (!platform) return;

    const handle = socials[platform];
    const threadKey = `${leadId}:${platform}`;

    if (this.threads.has(threadKey)) return; // already in progress

    if (!this.checkRateLimit(platform)) {
      console.log(`[SOCIAL_DM] ⏳ Rate limited on ${platform}, deferring ${leadId}`);
      return;
    }

    const message = this.generatePersonalizedMessage(data, platform, 'initial');

    this.threads.set(threadKey, {
      leadId, platform, handle,
      messages: [{ direction: 'out', text: message, at: Date.now() }],
      status: 'active',
      lastSentAt: Date.now(),
      followUpCount: 0,
    });

    this.consumeRateLimit(platform);
    await this.sendDm(platform, handle, message);

    analyticsLedger.record(MetricType.OUTREACH_SMS_SENT, 1, this.id, {
      entityId: leadId,
      metadata: { platform, type: 'dm_initial' },
    });

    console.log(`[SOCIAL_DM] 📨 ${platform} DM → @${handle}: "${message.substring(0, 50)}..."`);
  }

  // ─── Handle inbound reply ─────────────────────────────────
  async handleInboundReply(platform: Platform, handle: string, message: string): Promise<string | null> {
    const thread = this.findThreadByHandle(platform, handle);
    if (!thread) return null;

    thread.messages.push({ direction: 'in', text: message, at: Date.now() });
    thread.status = 'replied';

    const intent = this.classifyIntent(message);
    const qualification = this.qualifyFromDm(thread, intent);

    this.emit(EventType.SOCIAL_REPLY_RECEIVED, {
      leadId: thread.leadId,
      platform,
      handle,
      message,
      intent,
      qualification,
    });

    analyticsLedger.record(MetricType.OUTREACH_SMS_REPLIED, 1, this.id, {
      entityId: thread.leadId,
      metadata: { platform, intent },
    });

    // Generate contextual reply
    const reply = this.generateReply(thread, intent);
    if (reply) {
      thread.messages.push({ direction: 'out', text: reply, at: Date.now() });
      thread.lastSentAt = Date.now();
      if (this.checkRateLimit(platform)) {
        this.consumeRateLimit(platform);
        await this.sendDm(platform, handle, reply);
      }
    }

    if (qualification === 'qualified') {
      thread.status = 'qualified';
      console.log(`[SOCIAL_DM] 🎯 Lead ${thread.leadId} QUALIFIED via ${platform} DM`);
    }

    return reply;
  }

  // ─── Follow-up processing ─────────────────────────────────
  private async processFollowUps(): Promise<void> {
    const now = Date.now();

    for (const [key, thread] of Array.from(this.threads.entries())) {
      if (thread.status !== 'active') continue;
      if (thread.followUpCount >= MAX_FOLLOW_UPS) {
        thread.status = 'unresponsive';
        continue;
      }
      if (now - thread.lastSentAt < FOLLOW_UP_DELAY_MS) continue;
      if (!this.checkRateLimit(thread.platform)) continue;

      const node = this.memory.getNode<LeadData>(thread.leadId);
      if (!node) continue;

      const message = this.generatePersonalizedMessage(node.data, thread.platform, 'followup');
      thread.messages.push({ direction: 'out', text: message, at: now });
      thread.lastSentAt = now;
      thread.followUpCount++;

      this.consumeRateLimit(thread.platform);
      await this.sendDm(thread.platform, thread.handle, message);

      console.log(`[SOCIAL_DM] 🔄 Follow-up #${thread.followUpCount} → @${thread.handle} on ${thread.platform}`);
    }
  }

  // ─── Message generation ────────────────────────────────────
  private generatePersonalizedMessage(data: LeadData, platform: Platform, stage: 'initial' | 'followup'): string {
    const firstName = data.firstName || 'there';
    const coverage = data.coverageType?.replace(/_/g, ' ') || 'insurance';

    if (stage === 'initial') {
      const templates: Record<Platform, string[]> = {
        instagram: [
          `Hey ${firstName}! 👋 I noticed you were looking into ${coverage} options. I specialize in finding the best rates — mind if I share what I found for your profile?`,
          `Hi ${firstName}! I help people save on ${coverage}. I put together some options that might work for you — want me to send them over? 💰`,
        ],
        facebook: [
          `Hi ${firstName}, hope you're doing well! I saw you were interested in ${coverage}. I've been helping folks in your area find great rates — would you like me to share some options?`,
          `Hey ${firstName}! Quick question — are you still looking for ${coverage}? I have a few competitive quotes I think you'd like.`,
        ],
        linkedin: [
          `Hi ${firstName}, I came across your profile and wanted to reach out. I specialize in ${coverage} solutions and thought I might be able to help you find the right fit. Would you be open to a brief conversation?`,
          `Hello ${firstName}, I help professionals secure the right ${coverage} at competitive rates. I'd love to share some options tailored to your situation — would that be of interest?`,
        ],
      };
      const pool = templates[platform];
      return pool[Math.floor(Math.random() * pool.length)];
    }

    const followUps = [
      `Hey ${firstName}, just following up on my last message. I have some great ${coverage} rates I'd love to share. No pressure — just let me know if you're interested! 😊`,
      `Hi ${firstName}! Wanted to circle back — I've got those ${coverage} quotes ready for you whenever you have a moment to chat.`,
      `${firstName}, last follow-up from me! If you'd like to see your personalized ${coverage} options, just reply and I'll send them right over.`,
    ];
    return followUps[Math.min(this.threads.get(`${data.customFields?.leadId || ''}:${platform}`)?.followUpCount || 0, followUps.length - 1)];
  }

  private generateReply(thread: DmThread, intent: string): string | null {
    switch (intent) {
      case 'interested':
        return `That's great to hear! 🎉 The quickest way to get you your personalized rates is a 5-minute call. Would you prefer I call you, or should we schedule a time that works?`;
      case 'question':
        return `Great question! I'd love to walk you through the details. Can we hop on a quick call so I can give you the full picture?`;
      case 'schedule':
        return `Perfect! What day and time work best for you? I'm pretty flexible this week.`;
      case 'not_interested':
        return `Totally understand! If anything changes in the future, don't hesitate to reach out. Wishing you all the best! 🙏`;
      case 'opted_out':
        thread.status = 'opted_out';
        return null;
      default:
        return `Thanks for getting back to me! Would you prefer to chat here or hop on a quick call?`;
    }
  }

  // ─── Intent classification ─────────────────────────────────
  private classifyIntent(message: string): string {
    const lower = message.toLowerCase().trim();

    if (['stop', 'not interested', 'spam', 'unsubscribe', 'leave me alone', 'block'].some((w) => lower.includes(w))) return 'opted_out';
    if (['no thanks', 'no thank', "don't need", 'pass', 'not looking'].some((w) => lower.includes(w))) return 'not_interested';
    if (['yes', 'interested', 'tell me more', 'sure', 'sounds good', "let's do it", 'send them'].some((w) => lower.includes(w))) return 'interested';
    if (['when', 'schedule', 'time', 'available', 'tomorrow', 'this week'].some((w) => lower.includes(w))) return 'schedule';
    if (['?', 'how much', 'what kind', 'cost', 'price', 'coverage', 'which'].some((w) => lower.includes(w))) return 'question';

    return 'unknown';
  }

  // ─── Lead qualification from DM conversation ──────────────
  private qualifyFromDm(thread: DmThread, latestIntent: string): 'qualified' | 'nurturing' | 'disqualified' {
    if (['opted_out', 'not_interested'].includes(latestIntent)) return 'disqualified';
    if (['interested', 'schedule'].includes(latestIntent)) return 'qualified';
    const positiveReplies = thread.messages.filter((m) => m.direction === 'in').length;
    if (positiveReplies >= 2) return 'qualified';
    return 'nurturing';
  }

  // ─── Rate limit management ─────────────────────────────────
  private checkRateLimit(platform: Platform): boolean {
    const limits = this.rateLimits.get(platform)!;
    const now = new Date();

    if (now.getDate() !== limits.lastResetDay) {
      limits.dailySent = 0;
      limits.lastResetDay = now.getDate();
    }
    if (now.getHours() !== limits.lastResetHour) {
      limits.hourlySent = 0;
      limits.lastResetHour = now.getHours();
    }
    if (Date.now() < limits.cooldownUntil) return false;

    return limits.dailySent < limits.dailyMax && limits.hourlySent < limits.hourlyMax;
  }

  private consumeRateLimit(platform: Platform): void {
    const limits = this.rateLimits.get(platform)!;
    limits.dailySent++;
    limits.hourlySent++;

    // If approaching limits, add cooldown buffer
    if (limits.hourlySent >= limits.hourlyMax - 1) {
      limits.cooldownUntil = Date.now() + 10 * 60_000; // 10 min cooldown
    }
  }

  // ─── Platform selection ────────────────────────────────────
  private selectPlatform(socials: Record<string, string>, data: LeadData): Platform | null {
    const age = data.customFields?.estimatedAge || 40;
    const priority: Platform[] = age < 35
      ? ['instagram', 'facebook', 'linkedin']
      : ['linkedin', 'facebook', 'instagram'];

    for (const p of priority) {
      if (socials[p] && this.checkRateLimit(p)) return p;
    }
    return null;
  }

  // ─── Helpers ───────────────────────────────────────────────
  private findThreadByHandle(platform: Platform, handle: string): DmThread | undefined {
    for (const thread of Array.from(this.threads.values())) {
      if (thread.platform === platform && thread.handle === handle) return thread;
    }
    return undefined;
  }

  private async sendDm(platform: Platform, handle: string, message: string): Promise<void> {
    // Production: platform API integration (Meta Graph API, LinkedIn API, etc.)
    console.log(`[SOCIAL_DM] 📤 [${platform}] → @${handle}: ${message.substring(0, 60)}...`);
  }

  private async updateLeadSocials(leadId: string, socialProfiles: Record<string, string>): Promise<void> {
    this.memory.updateNode(leadId, { customFields: { socialProfiles } }, this.id);
  }

  getActiveThreads(): number { return this.threads.size; }
  getRateLimits(): Record<Platform, PlatformLimits> { return Object.fromEntries(this.rateLimits) as Record<Platform, PlatformLimits>; }
}
