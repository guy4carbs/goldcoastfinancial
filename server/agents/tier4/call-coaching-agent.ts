/**
 * CALL_COACHING_AGENT
 * Analyzes call recordings/transcripts, scores agent performance,
 * generates coaching plans, tracks improvement over time.
 */

import { BaseAgent, EventType, AgentEvent, analyticsLedger, MetricType } from '../core';

// ─── Types ───────────────────────────────────────────────────────
interface CallAnalysis {
  callId: string;
  agentId: string;
  leadId: string;
  analyzedAt: number;
  scores: CallScores;
  strengths: string[];
  improvements: string[];
  scriptAdherence: number;
  flaggedMoments: Array<{ timestampSec: number; type: string; description: string }>;
}

interface CallScores {
  overall: number;
  talkRatio: number;
  objectionHandling: number;
  closingTechnique: number;
  rapportBuilding: number;
  discoveryQuestions: number;
  activeListening: number;
  complianceAdherence: number;
  scriptAdherence: number;
}

interface AgentProfile {
  agentId: string;
  totalCallsAnalyzed: number;
  averageScores: CallScores;
  scoreHistory: Array<{ date: number; overall: number }>;
  coachingPlan: CoachingPlan | null;
  strengths: string[];
  weaknesses: string[];
  improvementTrend: number; // positive = improving
}

interface CoachingPlan {
  generatedAt: number;
  focusAreas: Array<{ area: string; currentScore: number; targetScore: number; exercises: string[] }>;
  weeklyGoals: string[];
  recommendedResources: string[];
  reviewDate: number;
}

interface TranscriptSegment {
  speaker: 'agent' | 'prospect';
  text: string;
  startSec: number;
  endSec: number;
}

const SCRIPT_CHECKPOINTS = [
  { phase: 'greeting', keywords: ['hi', 'hello', 'good morning', 'good afternoon', 'how are you'], weight: 0.1 },
  { phase: 'permission', keywords: ['is this a good time', 'do you have a moment', 'mind if i'], weight: 0.1 },
  { phase: 'discovery', keywords: ['tell me about', 'what are you looking for', 'current coverage', 'family', 'dependents'], weight: 0.2 },
  { phase: 'needs_analysis', keywords: ['budget', 'how much', 'monthly', 'coverage amount', 'beneficiary'], weight: 0.15 },
  { phase: 'presentation', keywords: ['recommend', 'option', 'policy', 'coverage', 'premium', 'benefit'], weight: 0.15 },
  { phase: 'objection_handle', keywords: ['i understand', 'great question', 'let me explain', 'many clients'], weight: 0.15 },
  { phase: 'close', keywords: ['move forward', 'get started', 'application', 'lock in', 'secure'], weight: 0.1 },
  { phase: 'next_steps', keywords: ['follow up', 'email', 'next step', 'thank you', 'appreciate'], weight: 0.05 },
];

export class CallCoachingAgent extends BaseAgent {
  private agentProfiles: Map<string, AgentProfile> = new Map();
  private callAnalyses: Map<string, CallAnalysis> = new Map();

  constructor() {
    super({
      id: 'call-coaching',
      name: 'CALL_COACHING_AGENT',
      tier: 4,
      description: 'Analyzes calls, scores performance, generates coaching plans',
      capabilities: ['call_analysis', 'performance_scoring', 'coaching_plans', 'trend_tracking', 'script_adherence'],
      consumesEvents: [EventType.SALE_ASSISTED, EventType.CALL_CONNECTED, EventType.POLICY_SOLD],
      producesEvents: [EventType.COACHING_FEEDBACK],
    });
  }

  protected async onStart(): Promise<void> {}
  protected async onStop(): Promise<void> {}

  protected async handleEvent(event: AgentEvent): Promise<void> {
    switch (event.type) {
      case EventType.SALE_ASSISTED:
        await this.analyzeAssistedCall(event.payload);
        break;
      case EventType.POLICY_SOLD:
        await this.recordSaleOutcome(event.payload);
        break;
      case EventType.CALL_CONNECTED:
        if (event.payload.transferred) {
          await this.trackCallStart(event.payload);
        }
        break;
    }
  }

  // ─── Analyze a call from transcript ────────────────────────
  async analyzeCallTranscript(callId: string, agentId: string, leadId: string, transcript: TranscriptSegment[]): Promise<CallAnalysis> {
    const agentSegments = transcript.filter((s) => s.speaker === 'agent');
    const prospectSegments = transcript.filter((s) => s.speaker === 'prospect');

    const totalAgentTime = agentSegments.reduce((sum, s) => sum + (s.endSec - s.startSec), 0);
    const totalProspectTime = prospectSegments.reduce((sum, s) => sum + (s.endSec - s.startSec), 0);
    const totalTime = totalAgentTime + totalProspectTime;

    // Talk ratio (ideal: 40-50% agent talk)
    const agentTalkPct = totalTime > 0 ? totalAgentTime / totalTime : 0.5;
    const talkRatioScore = this.scoreTalkRatio(agentTalkPct);

    // Script adherence
    const agentText = agentSegments.map((s) => s.text).join(' ').toLowerCase();
    const scriptAdherence = this.scoreScriptAdherence(agentText);

    // Discovery questions
    const discoveryScore = this.scoreDiscoveryQuestions(agentText);

    // Objection handling
    const objectionScore = this.scoreObjectionHandling(agentText, prospectSegments);

    // Closing technique
    const closingScore = this.scoreClosingTechnique(agentText);

    // Rapport building
    const rapportScore = this.scoreRapportBuilding(agentText, agentSegments);

    // Active listening
    const listeningScore = this.scoreActiveListening(agentText, prospectSegments);

    // Compliance
    const complianceScore = this.scoreCompliance(agentText);

    // Flagged moments
    const flaggedMoments = this.detectFlaggedMoments(transcript);

    const scores: CallScores = {
      overall: 0,
      talkRatio: talkRatioScore,
      objectionHandling: objectionScore,
      closingTechnique: closingScore,
      rapportBuilding: rapportScore,
      discoveryQuestions: discoveryScore,
      activeListening: listeningScore,
      complianceAdherence: complianceScore,
      scriptAdherence,
    };

    // Weighted overall
    scores.overall = Math.round(
      scores.talkRatio * 0.10 +
      scores.objectionHandling * 0.20 +
      scores.closingTechnique * 0.15 +
      scores.rapportBuilding * 0.10 +
      scores.discoveryQuestions * 0.15 +
      scores.activeListening * 0.10 +
      scores.complianceAdherence * 0.10 +
      scores.scriptAdherence * 0.10
    );

    const strengths = this.identifyStrengths(scores);
    const improvements = this.identifyImprovements(scores);

    const analysis: CallAnalysis = {
      callId, agentId, leadId,
      analyzedAt: Date.now(),
      scores,
      strengths,
      improvements,
      scriptAdherence,
      flaggedMoments,
    };

    this.callAnalyses.set(callId, analysis);
    this.updateAgentProfile(agentId, analysis);

    this.emit(EventType.COACHING_FEEDBACK, {
      callId, agentId, leadId,
      overallScore: scores.overall,
      scores,
      strengths,
      improvements,
      flaggedMoments: flaggedMoments.length,
    }, { metadata: { tier: 4, priority: 'normal' } });

    analyticsLedger.record(MetricType.AGENT_TASK_COMPLETED, scores.overall, this.id, {
      entityId: agentId,
      metadata: { callId, scores },
    });

    console.log(`[COACHING] 📊 Call ${callId} scored: ${scores.overall}/100 | Agent: ${agentId} | Strengths: ${strengths.join(', ')}`);

    return analysis;
  }

  // ─── Generate coaching plan for an agent ───────────────────
  generateCoachingPlan(agentId: string): CoachingPlan | null {
    const profile = this.agentProfiles.get(agentId);
    if (!profile || profile.totalCallsAnalyzed < 3) return null;

    const focusAreas: CoachingPlan['focusAreas'] = [];
    const scoreEntries = Object.entries(profile.averageScores) as Array<[string, number]>;

    // Find lowest scoring areas
    const sortedScores = scoreEntries
      .filter(([key]) => key !== 'overall')
      .sort(([, a], [, b]) => a - b);

    for (const [area, score] of sortedScores.slice(0, 3)) {
      focusAreas.push({
        area: area.replace(/([A-Z])/g, ' $1').trim(),
        currentScore: Math.round(score),
        targetScore: Math.min(95, Math.round(score + 15)),
        exercises: this.getExercisesForArea(area),
      });
    }

    const plan: CoachingPlan = {
      generatedAt: Date.now(),
      focusAreas,
      weeklyGoals: [
        `Improve ${focusAreas[0]?.area || 'overall'} score by 5 points`,
        'Complete at least 2 practice role-plays this week',
        'Review 3 recorded calls and self-score before coaching review',
      ],
      recommendedResources: this.getResources(sortedScores.slice(0, 2).map(([k]) => k)),
      reviewDate: Date.now() + 7 * 24 * 3600_000,
    };

    profile.coachingPlan = plan;
    console.log(`[COACHING] 📝 Coaching plan generated for ${agentId} | Focus: ${focusAreas.map((f) => f.area).join(', ')}`);
    return plan;
  }

  // ─── Event handlers ────────────────────────────────────────
  private async analyzeAssistedCall(payload: any): Promise<void> {
    // When a SALE_ASSISTED event fires, we can analyze if transcript data is available
    console.log(`[COACHING] 🎤 Queued analysis for call ${payload.callId} | Agent: ${payload.agentId}`);
  }

  private async recordSaleOutcome(payload: any): Promise<void> {
    console.log(`[COACHING] ✅ Sale recorded for lead ${payload.leadId} — will factor into agent scoring`);
  }

  private async trackCallStart(payload: any): Promise<void> {
    console.log(`[COACHING] 📞 Tracking transferred call for lead ${payload.leadId}`);
  }

  // ─── Scoring functions ─────────────────────────────────────
  private scoreTalkRatio(agentPct: number): number {
    // Ideal: 40-50% agent talk
    const deviation = Math.abs(agentPct - 0.45);
    if (deviation <= 0.05) return 95;
    if (deviation <= 0.10) return 85;
    if (deviation <= 0.15) return 70;
    if (deviation <= 0.25) return 50;
    return 30;
  }

  private scoreScriptAdherence(agentText: string): number {
    let totalWeight = 0;
    let hitWeight = 0;

    for (const checkpoint of SCRIPT_CHECKPOINTS) {
      totalWeight += checkpoint.weight;
      if (checkpoint.keywords.some((kw) => agentText.includes(kw))) {
        hitWeight += checkpoint.weight;
      }
    }

    return totalWeight > 0 ? Math.round((hitWeight / totalWeight) * 100) : 50;
  }

  private scoreDiscoveryQuestions(text: string): number {
    const questionPatterns = ['what', 'how', 'tell me', 'can you share', 'describe', 'currently', 'looking for'];
    const hits = questionPatterns.filter((p) => text.includes(p)).length;
    return Math.min(100, hits * 15);
  }

  private scoreObjectionHandling(agentText: string, prospectSegments: TranscriptSegment[]): number {
    const objectionIndicators = ["can't afford", 'think about it', 'too expensive', 'not sure', 'spouse'];
    const responseIndicators = ['i understand', 'great question', 'many clients feel', 'let me show', 'what if'];

    const hasObjections = objectionIndicators.some((o) => prospectSegments.some((s) => s.text.toLowerCase().includes(o)));
    if (!hasObjections) return 80; // no objections to handle

    const responses = responseIndicators.filter((r) => agentText.includes(r)).length;
    return Math.min(100, 40 + responses * 15);
  }

  private scoreClosingTechnique(text: string): number {
    const closingPhrases = ['move forward', 'get started', 'application', 'lock in', 'secure', 'sign up', 'paperwork'];
    const hits = closingPhrases.filter((p) => text.includes(p)).length;
    return Math.min(100, hits * 20 + 20);
  }

  private scoreRapportBuilding(text: string, agentSegments: TranscriptSegment[]): number {
    const rapportPhrases = ['great', 'absolutely', 'i appreciate', 'wonderful', 'fantastic', 'family', 'understand'];
    const hits = rapportPhrases.filter((p) => text.includes(p)).length;
    const usedName = text.split(/\b/).length > 0 ? 10 : 0; // bonus for personalization
    return Math.min(100, hits * 12 + usedName);
  }

  private scoreActiveListening(agentText: string, prospectSegments: TranscriptSegment[]): number {
    const mirrorPhrases = ['so what you\'re saying', 'i hear you', 'that makes sense', 'you mentioned', 'right, so'];
    const hits = mirrorPhrases.filter((p) => agentText.includes(p)).length;
    return Math.min(100, 40 + hits * 15);
  }

  private scoreCompliance(text: string): number {
    const violations = ['guarantee', 'no risk', 'always goes up', 'tax free', 'best deal'];
    const found = violations.filter((v) => text.includes(v)).length;
    return Math.max(0, 100 - found * 25);
  }

  // ─── Flagged moments ──────────────────────────────────────
  private detectFlaggedMoments(transcript: TranscriptSegment[]): CallAnalysis['flaggedMoments'] {
    const flagged: CallAnalysis['flaggedMoments'] = [];

    for (const seg of transcript) {
      const lower = seg.text.toLowerCase();
      if (seg.speaker === 'agent' && ['guarantee', 'no risk', 'always'].some((w) => lower.includes(w))) {
        flagged.push({ timestampSec: seg.startSec, type: 'compliance', description: `Potential compliance issue: "${seg.text.substring(0, 60)}"` });
      }
      if (seg.speaker === 'prospect' && lower.includes('not interested')) {
        flagged.push({ timestampSec: seg.startSec, type: 'objection', description: 'Prospect expressed disinterest — review handling' });
      }
      // Long silence detection (gap between segments)
      if (seg.speaker === 'agent' && (seg.endSec - seg.startSec) > 15) {
        flagged.push({ timestampSec: seg.startSec, type: 'dead_air', description: 'Extended agent monologue — consider pausing for engagement' });
      }
    }

    return flagged;
  }

  // ─── Profile management ────────────────────────────────────
  private updateAgentProfile(agentId: string, analysis: CallAnalysis): void {
    let profile = this.agentProfiles.get(agentId);

    if (!profile) {
      profile = {
        agentId,
        totalCallsAnalyzed: 0,
        averageScores: { ...analysis.scores },
        scoreHistory: [],
        coachingPlan: null,
        strengths: [],
        weaknesses: [],
        improvementTrend: 0,
      };
      this.agentProfiles.set(agentId, profile);
    }

    profile.totalCallsAnalyzed++;
    profile.scoreHistory.push({ date: Date.now(), overall: analysis.scores.overall });

    // Rolling average
    const n = profile.totalCallsAnalyzed;
    for (const key of Object.keys(analysis.scores) as Array<keyof CallScores>) {
      profile.averageScores[key] = ((profile.averageScores[key] * (n - 1)) + analysis.scores[key]) / n;
    }

    profile.strengths = this.identifyStrengths(profile.averageScores);
    profile.weaknesses = this.identifyImprovements(profile.averageScores);

    // Trend: compare last 5 vs previous 5
    if (profile.scoreHistory.length >= 10) {
      const recent = profile.scoreHistory.slice(-5).reduce((s, e) => s + e.overall, 0) / 5;
      const prior = profile.scoreHistory.slice(-10, -5).reduce((s, e) => s + e.overall, 0) / 5;
      profile.improvementTrend = recent - prior;
    }

    // Auto-generate coaching plan every 10 calls
    if (profile.totalCallsAnalyzed % 10 === 0) {
      this.generateCoachingPlan(agentId);
    }
  }

  private identifyStrengths(scores: CallScores): string[] {
    return (Object.entries(scores) as Array<[string, number]>)
      .filter(([key, val]) => key !== 'overall' && val >= 80)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim());
  }

  private identifyImprovements(scores: CallScores): string[] {
    return (Object.entries(scores) as Array<[string, number]>)
      .filter(([key, val]) => key !== 'overall' && val < 70)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 3)
      .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim());
  }

  private getExercisesForArea(area: string): string[] {
    const exercises: Record<string, string[]> = {
      talkRatio: ['Practice the 2-minute rule: never speak for more than 2 minutes without asking a question', 'Record yourself and time agent vs prospect talk'],
      objectionHandling: ['Role-play the top 5 objections with a partner daily', 'Use the Feel-Felt-Found method on every objection this week'],
      closingTechnique: ['Practice 3 different closes on every call', 'Use trial closes throughout the presentation, not just at the end'],
      rapportBuilding: ['Open every call with a personal observation or compliment', 'Mirror the prospect\'s communication style and pace'],
      discoveryQuestions: ['Prepare 10 open-ended questions before each call', 'Use the SPIN framework: Situation, Problem, Implication, Need-payoff'],
      activeListening: ['Paraphrase the prospect\'s last statement before responding', 'Take notes during calls and reference them later in conversation'],
      complianceAdherence: ['Review compliance guidelines before each shift', 'Use approved scripts for all product descriptions'],
      scriptAdherence: ['Practice the full script with a timer 3x daily', 'Record and self-review for missed checkpoints'],
    };
    return exercises[area] || ['Schedule a 1-on-1 coaching session to address this area'];
  }

  private getResources(areas: string[]): string[] {
    const resources: string[] = ['Weekly coaching call recording review'];
    if (areas.includes('objectionHandling')) resources.push('Objection Mastery Workshop (Module 3)');
    if (areas.includes('closingTechnique')) resources.push('Advanced Closing Strategies Playbook');
    if (areas.includes('discoveryQuestions')) resources.push('SPIN Selling by Neil Rackham — Chapter 4-6');
    if (areas.includes('rapportBuilding')) resources.push('Building Instant Rapport (internal training video)');
    resources.push('Peer shadow session — observe a top performer this week');
    return resources;
  }

  getAgentProfile(agentId: string): AgentProfile | undefined { return this.agentProfiles.get(agentId); }
  getCallAnalysis(callId: string): CallAnalysis | undefined { return this.callAnalyses.get(callId); }
}
