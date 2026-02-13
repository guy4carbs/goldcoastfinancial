/**
 * HUMAN_SALES_ASSIST_AGENT
 * Real-time AI co-pilot for human closers during live calls.
 * Compliance-safe phrasing, objection handling, upsell prompts,
 * live policy comparison, sentiment detection.
 */

import { BaseAgent, EventType, AgentEvent, memoryGraph, LeadData, knowledgeBase, analyticsLedger, MetricType } from '../core';

// ─── Types ───────────────────────────────────────────────────────
interface LiveCallSession {
  callId: string;
  leadId: string;
  agentId: string;
  startedAt: number;
  sentimentHistory: Array<{ score: number; at: number }>;
  suggestionsGiven: string[];
  objectionCount: number;
  upsellsOffered: string[];
  currentPhase: 'rapport' | 'discovery' | 'presentation' | 'objection' | 'closing' | 'post_close';
  complianceFlags: string[];
}

interface AssistSuggestion {
  type: 'objection_response' | 'compliance_warning' | 'upsell' | 'phrasing' | 'policy_comparison' | 'closing_technique';
  priority: 'low' | 'normal' | 'high' | 'critical';
  text: string;
  context?: string;
}

const COMPLIANCE_PHRASES: Array<{ pattern: RegExp; warning: string; safePhrasing: string }> = [
  { pattern: /guarantee/i, warning: 'Avoid guaranteeing returns or outcomes', safePhrasing: 'Based on historical performance, this policy has shown...' },
  { pattern: /always goes up/i, warning: 'Cannot promise investment performance', safePhrasing: 'While past performance has been positive, future results may vary...' },
  { pattern: /you('ll| will) never/i, warning: 'Avoid absolute negative guarantees', safePhrasing: 'This policy is designed to help protect against...' },
  { pattern: /no risk/i, warning: 'All insurance products carry some risk', safePhrasing: 'This product offers strong protections, though all policies have terms and conditions...' },
  { pattern: /best (deal|price|rate)/i, warning: 'Cannot guarantee best available rate', safePhrasing: 'This is a very competitive rate based on your profile...' },
  { pattern: /tax free/i, warning: 'Tax implications vary by situation', safePhrasing: 'This policy offers tax-advantaged benefits — consult your tax advisor for specifics...' },
];

const CLOSING_TECHNIQUES = [
  { name: 'Assumptive Close', prompt: 'So shall we get the paperwork started? I just need a few details to lock in this rate for you.' },
  { name: 'Summary Close', prompt: 'Let me recap what we have: [coverage], [premium], [benefits]. Does everything look good to move forward?' },
  { name: 'Urgency Close', prompt: 'These rates are locked for the next 48 hours based on your current health profile. Should we secure them now?' },
  { name: 'Ben Franklin Close', prompt: 'Let\'s list out the pros and cons together — I think you\'ll see the value clearly.' },
  { name: 'Puppy Dog Close', prompt: 'Why don\'t we get the application started? You have a 30-day free look period to review everything.' },
];

export class HumanSalesAssistAgent extends BaseAgent {
  private activeSessions: Map<string, LiveCallSession> = new Map();

  constructor() {
    super({
      id: 'human-sales-assist',
      name: 'HUMAN_SALES_ASSIST_AGENT',
      tier: 4,
      description: 'Real-time AI co-pilot for human closers',
      capabilities: ['objection_handling', 'compliance_phrasing', 'upsell_prompts', 'policy_comparison', 'sentiment_detection'],
      consumesEvents: [EventType.CALL_CONNECTED, EventType.APPOINTMENT_BOOKED],
      producesEvents: [EventType.SALE_ASSISTED],
      complianceRequired: true,
    });
  }

  protected async onStart(): Promise<void> {}
  protected async onStop(): Promise<void> {}

  protected async handleEvent(event: AgentEvent): Promise<void> {
    switch (event.type) {
      case EventType.CALL_CONNECTED:
        if (event.payload.transferred) {
          await this.startAssistSession(event.payload);
        }
        break;
      case EventType.APPOINTMENT_BOOKED:
        await this.prepareCallBrief(event.payload.leadId, event.payload.agentId);
        break;
    }
  }

  // ─── Start assist session for live call ────────────────────
  private async startAssistSession(payload: { leadId: string; phone: string; score: number }): Promise<void> {
    const callId = `call-${Date.now()}-${payload.leadId}`;
    const session: LiveCallSession = {
      callId,
      leadId: payload.leadId,
      agentId: 'live-agent', // would be assigned by routing
      startedAt: Date.now(),
      sentimentHistory: [],
      suggestionsGiven: [],
      objectionCount: 0,
      upsellsOffered: [],
      currentPhase: 'rapport',
      complianceFlags: [],
    };

    this.activeSessions.set(callId, session);

    const node = this.memory.getNode<LeadData>(payload.leadId);
    if (node) {
      const brief = this.buildCallBrief(node.data);
      console.log(`[SALES_ASSIST] 🎧 Live assist started for ${node.data.firstName} ${node.data.lastName} | Score: ${payload.score}`);
      console.log(`[SALES_ASSIST] 📋 Brief: ${brief.substring(0, 120)}...`);
    }
  }

  // ─── Process live transcript chunk ─────────────────────────
  async processTranscriptChunk(callId: string, speaker: 'agent' | 'prospect', text: string): Promise<AssistSuggestion[]> {
    const session = this.activeSessions.get(callId);
    if (!session) return [];

    const suggestions: AssistSuggestion[] = [];

    // Compliance monitoring on agent speech
    if (speaker === 'agent') {
      const complianceIssues = this.checkCompliancePhrasing(text);
      for (const issue of complianceIssues) {
        session.complianceFlags.push(issue.warning);
        suggestions.push({
          type: 'compliance_warning',
          priority: 'critical',
          text: `⚠️ ${issue.warning}`,
          context: `Try instead: "${issue.safePhrasing}"`,
        });
      }
    }

    // Sentiment analysis on prospect speech
    if (speaker === 'prospect') {
      const sentiment = this.analyzeSentiment(text);
      session.sentimentHistory.push({ score: sentiment, at: Date.now() });

      // Detect objection
      const objection = this.detectObjection(text);
      if (objection) {
        session.objectionCount++;
        const response = knowledgeBase.getBestObjectionResponse(objection);
        if (response) {
          suggestions.push({
            type: 'objection_response',
            priority: 'high',
            text: response.response,
            context: `Objection: "${objection}"`,
          });
        }
      }

      // Phase detection
      session.currentPhase = this.detectPhase(text, session);

      // Low sentiment intervention
      if (sentiment < -0.3) {
        suggestions.push({
          type: 'phrasing',
          priority: 'high',
          text: 'Prospect seems hesitant. Try empathizing: "I completely understand your concern. Let me address that..."',
        });
      }
    }

    // Phase-specific suggestions
    suggestions.push(...this.getPhaseSpecificSuggestions(session));

    session.suggestionsGiven.push(...suggestions.map((s) => s.text));
    return suggestions;
  }

  // ─── Upsell/cross-sell recommendations ─────────────────────
  async getUpsellRecommendations(callId: string): Promise<AssistSuggestion[]> {
    const session = this.activeSessions.get(callId);
    if (!session) return [];

    const node = this.memory.getNode<LeadData>(session.leadId);
    if (!node) return [];

    const data = node.data;
    const suggestions: AssistSuggestion[] = [];
    const age = data.customFields?.estimatedAge || 40;

    if (data.coverageType === 'term_life' && age >= 30) {
      suggestions.push({
        type: 'upsell',
        priority: 'normal',
        text: 'Consider mentioning a whole life conversion rider — locks in future insurability.',
        context: 'Term + conversion rider is a strong value-add for clients in their 30s-40s.',
      });
    }

    if (data.income && data.income > 75000 && !session.upsellsOffered.includes('disability')) {
      session.upsellsOffered.push('disability');
      suggestions.push({
        type: 'upsell',
        priority: 'normal',
        text: `With their income at $${data.income.toLocaleString()}, disability insurance would protect ~60% of earnings. Great add-on.`,
      });
    }

    if (age >= 50) {
      suggestions.push({
        type: 'upsell',
        priority: 'normal',
        text: 'Long-term care rider could resonate — protects retirement savings from care costs.',
      });
    }

    return suggestions;
  }

  // ─── Live policy comparison ────────────────────────────────
  async comparePolicies(callId: string, policyIds: string[]): Promise<AssistSuggestion[]> {
    const suggestions: AssistSuggestion[] = [];

    const policies = policyIds.map((id) => knowledgeBase.getProduct(id)).filter(Boolean);
    if (policies.length < 2) return suggestions;

    const comparison = policies.map((p) => `${p!.name}: ${p!.talkingPoints[0]}`).join(' vs. ');
    suggestions.push({
      type: 'policy_comparison',
      priority: 'normal',
      text: `Comparison: ${comparison}`,
      context: 'Focus on which policy best matches the client\'s stated needs and budget.',
    });

    return suggestions;
  }

  // ─── End session and emit results ──────────────────────────
  async endSession(callId: string, outcome: 'sold' | 'follow_up' | 'lost'): Promise<void> {
    const session = this.activeSessions.get(callId);
    if (!session) return;

    const durationSec = Math.round((Date.now() - session.startedAt) / 1000);
    const avgSentiment = session.sentimentHistory.length > 0
      ? session.sentimentHistory.reduce((sum, s) => sum + s.score, 0) / session.sentimentHistory.length
      : 0;

    this.emit(EventType.SALE_ASSISTED, {
      callId,
      leadId: session.leadId,
      agentId: session.agentId,
      outcome,
      durationSec,
      suggestionsGiven: session.suggestionsGiven.length,
      objectionCount: session.objectionCount,
      avgSentiment: Math.round(avgSentiment * 100) / 100,
      complianceFlags: session.complianceFlags,
      upsellsOffered: session.upsellsOffered,
    }, { metadata: { tier: 4, priority: outcome === 'sold' ? 'high' : 'normal' } });

    analyticsLedger.record(MetricType.FUNNEL_APPOINTMENT_SET, 1, this.id, {
      entityId: session.leadId,
      metadata: { outcome, durationSec, suggestions: session.suggestionsGiven.length },
    });

    this.activeSessions.delete(callId);
    console.log(`[SALES_ASSIST] 📊 Session ended: ${outcome} | ${durationSec}s | ${session.suggestionsGiven.length} suggestions | Sentiment: ${avgSentiment.toFixed(2)}`);
  }

  // ─── Private helpers ───────────────────────────────────────
  private buildCallBrief(data: LeadData): string {
    return `${data.firstName} ${data.lastName} | ${data.coverageType || 'General'} | Age: ${data.customFields?.estimatedAge || 'unknown'} | Income: ${data.income ? `$${data.income.toLocaleString()}` : 'unknown'} | Source: ${data.source || 'unknown'}`;
  }

  private async prepareCallBrief(leadId: string, agentId: string): Promise<void> {
    const node = this.memory.getNode<LeadData>(leadId);
    if (!node) return;
    const brief = this.buildCallBrief(node.data);
    console.log(`[SALES_ASSIST] 📋 Pre-call brief prepared for agent ${agentId}: ${brief}`);
  }

  private checkCompliancePhrasing(text: string): Array<{ warning: string; safePhrasing: string }> {
    const issues: Array<{ warning: string; safePhrasing: string }> = [];
    for (const rule of COMPLIANCE_PHRASES) {
      if (rule.pattern.test(text)) {
        issues.push({ warning: rule.warning, safePhrasing: rule.safePhrasing });
      }
    }
    return issues;
  }

  private analyzeSentiment(text: string): number {
    const lower = text.toLowerCase();
    let score = 0;
    const positive = ['great', 'perfect', 'love', 'yes', 'sounds good', 'interested', 'excellent', 'wonderful', 'absolutely'];
    const negative = ["can't afford", 'too expensive', 'not sure', "don't know", 'maybe later', 'worried', 'confused', "don't need", "don't want"];

    for (const w of positive) { if (lower.includes(w)) score += 0.2; }
    for (const w of negative) { if (lower.includes(w)) score -= 0.2; }

    return Math.max(-1, Math.min(1, score));
  }

  private detectObjection(text: string): string | null {
    const lower = text.toLowerCase();
    const objections: Array<{ pattern: string[]; label: string }> = [
      { pattern: ["can't afford", 'too expensive', 'too much', 'budget'], label: "I can't afford it" },
      { pattern: ['think about', 'think it over', 'sleep on'], label: 'I need to think about it' },
      { pattern: ['spouse', 'wife', 'husband', 'partner'], label: 'I need to talk to my spouse' },
      { pattern: ['already have', 'current policy', 'already covered'], label: 'I already have insurance' },
      { pattern: ['not right now', 'bad time', 'too busy'], label: 'Not the right time' },
    ];

    for (const obj of objections) {
      if (obj.pattern.some((p) => lower.includes(p))) return obj.label;
    }
    return null;
  }

  private detectPhase(text: string, session: LiveCallSession): LiveCallSession['currentPhase'] {
    const lower = text.toLowerCase();
    if (lower.includes('price') || lower.includes('premium') || lower.includes('cost')) return 'presentation';
    if (session.objectionCount > 0) return 'objection';
    if (['ready', 'sign up', "let's do it", 'move forward'].some((w) => lower.includes(w))) return 'closing';
    return session.currentPhase;
  }

  private getPhaseSpecificSuggestions(session: LiveCallSession): AssistSuggestion[] {
    if (session.currentPhase === 'closing' && !session.suggestionsGiven.some((s) => s.includes('close'))) {
      const technique = CLOSING_TECHNIQUES[Math.floor(Math.random() * CLOSING_TECHNIQUES.length)];
      return [{
        type: 'closing_technique',
        priority: 'high',
        text: `${technique.name}: "${technique.prompt}"`,
      }];
    }
    return [];
  }

  getActiveSessions(): number { return this.activeSessions.size; }
}
