/**
 * AGENT_PERFORMANCE_AGENT
 * Scores ALL other agents, identifies inefficiencies, recommends
 * retraining, leaderboard. Emits AGENT_SCORE_UPDATED.
 */

import {
  BaseAgent, EventType, AgentEvent, AgentStatus,
  memoryGraph, analyticsLedger, MetricType,
  securityLayer, Permission,
} from '../core';

interface AgentScore {
  agentId: string;
  agentName: string;
  tier: number;
  overallScore: number; // 0-100
  dimensions: {
    throughput: number;
    accuracy: number;
    latency: number;
    reliability: number;
    impact: number;
  };
  rank: number;
  trend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
  lastScoredAt: number;
}

interface Leaderboard {
  generatedAt: number;
  agents: AgentScore[];
  topPerformer: string;
  needsAttention: string[];
  systemHealthScore: number;
}

// Weights for scoring dimensions
const DIMENSION_WEIGHTS = {
  throughput: 0.20,
  accuracy: 0.30,
  latency: 0.15,
  reliability: 0.25,
  impact: 0.10,
};

export class AgentPerformanceAgent extends BaseAgent {
  private scoringInterval: NodeJS.Timeout | null = null;
  private agentRegistry: Map<string, { name: string; tier: number; status: AgentStatus }> = new Map();
  private previousScores: Map<string, number> = new Map();

  constructor() {
    super({
      id: 'agent-performance',
      name: 'AGENT_PERFORMANCE_AGENT',
      tier: 9,
      description: 'Scores all agents, identifies inefficiencies, maintains leaderboard',
      capabilities: ['agent_scoring', 'inefficiency_detection', 'retraining_recommendations', 'leaderboard'],
      consumesEvents: [EventType.AGENT_HEARTBEAT, EventType.AGENT_ERROR, EventType.AGENT_STARTED, EventType.AGENT_STOPPED],
      producesEvents: [EventType.AGENT_SCORE_UPDATED],
    });
  }

  protected async onStart(): Promise<void> {
    securityLayer.registerAgent(this.id, [Permission.ADMIN]);
    // Score all agents every 15 minutes
    this.scoringInterval = setInterval(() => this.scoreAllAgents(), 15 * 60 * 1000);
  }

  protected async onStop(): Promise<void> {
    if (this.scoringInterval) { clearInterval(this.scoringInterval); this.scoringInterval = null; }
  }

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.AGENT_STARTED) {
      this.agentRegistry.set(event.payload.agentId, {
        name: event.payload.name,
        tier: event.payload.tier,
        status: AgentStatus.RUNNING,
      });
    } else if (event.type === EventType.AGENT_STOPPED) {
      const agent = this.agentRegistry.get(event.payload.agentId);
      if (agent) agent.status = AgentStatus.STOPPED;
    } else if (event.type === EventType.AGENT_HEARTBEAT) {
      const existing = this.agentRegistry.get(event.payload.agentId);
      this.agentRegistry.set(event.payload.agentId, {
        name: event.payload.name,
        tier: existing?.tier ?? event.payload.metrics?.tier ?? 0,
        status: event.payload.status,
      });
    } else if (event.type === EventType.AGENT_ERROR) {
      // Track error for scoring
      analyticsLedger.record(MetricType.AGENT_TASK_FAILED, 1, event.payload.agentId, {
        metadata: { error: event.payload.error },
      });
    }
  }

  async scoreAllAgents(): Promise<Leaderboard> {
    const scores: AgentScore[] = [];
    const scoreboard = analyticsLedger.getAgentScoreboard('24h');
    const scoreMap = new Map(scoreboard.map(s => [s.agentId, s]));

    for (const [agentId, info] of Array.from(this.agentRegistry.entries())) {
      if (agentId === this.id) continue; // Don't score ourselves

      const ledgerData = scoreMap.get(agentId);
      const score = this.scoreAgent(agentId, info, ledgerData);
      scores.push(score);
    }

    // Rank by overall score
    scores.sort((a, b) => b.overallScore - a.overallScore);
    scores.forEach((s, i) => s.rank = i + 1);

    const needsAttention = scores.filter(s => s.overallScore < 50).map(s => s.agentId);
    const systemHealth = scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length)
      : 100;

    const leaderboard: Leaderboard = {
      generatedAt: Date.now(),
      agents: scores,
      topPerformer: scores[0]?.agentId || 'none',
      needsAttention,
      systemHealthScore: systemHealth,
    };

    // Store and emit
    for (const score of scores) {
      this.previousScores.set(score.agentId, score.overallScore);
    }

    this.emit(EventType.AGENT_SCORE_UPDATED, {
      leaderboard: scores.map(s => ({
        agentId: s.agentId, name: s.agentName, score: s.overallScore, rank: s.rank, trend: s.trend,
      })),
      systemHealth,
      topPerformer: leaderboard.topPerformer,
      needsAttention,
      agentCount: scores.length,
    });

    if (needsAttention.length > 0) {
      console.warn(`[AGENT_PERF] ⚠️ Agents needing attention: ${needsAttention.join(', ')}`);
    }
    console.log(`[AGENT_PERF] 📊 Scored ${scores.length} agents | System health: ${systemHealth}% | Top: ${scores[0]?.agentName || 'N/A'}`);

    return leaderboard;
  }

  private scoreAgent(
    agentId: string,
    info: { name: string; tier: number; status: AgentStatus },
    ledgerData?: { tasksCompleted: number; tasksFailed: number; successRate: number; avgResponseTime: number }
  ): AgentScore {
    const recommendations: string[] = [];

    // Throughput: tasks processed relative to expectations
    const tasksCompleted = ledgerData?.tasksCompleted || 0;
    const throughputScore = Math.min(100, tasksCompleted * 10); // Scale: 10 tasks = 100

    // Accuracy: success rate
    const accuracyScore = ledgerData?.successRate ?? 100;
    if (accuracyScore < 80) recommendations.push('Error rate too high — investigate failure patterns');

    // Latency: avg response time
    const avgResponseMs = ledgerData?.avgResponseTime || 0;
    const latencyScore = avgResponseMs === 0 ? 100 : Math.max(0, 100 - avgResponseMs / 10);
    if (avgResponseMs > 5000) recommendations.push('Response time exceeds 5s — optimize processing');

    // Reliability: uptime and error-free operation
    const reliabilityScore = info.status === AgentStatus.RUNNING ? 90 :
      info.status === AgentStatus.ERROR ? 20 :
      info.status === AgentStatus.PAUSED ? 50 : 70;
    if (info.status === AgentStatus.ERROR) recommendations.push('Agent in ERROR state — restart needed');

    // Impact: based on tier (higher tiers are foundational)
    const impactScore = info.tier <= 3 ? 90 : info.tier <= 6 ? 75 : info.tier <= 8 ? 60 : 50;

    const overallScore = Math.round(
      throughputScore * DIMENSION_WEIGHTS.throughput +
      accuracyScore * DIMENSION_WEIGHTS.accuracy +
      latencyScore * DIMENSION_WEIGHTS.latency +
      reliabilityScore * DIMENSION_WEIGHTS.reliability +
      impactScore * DIMENSION_WEIGHTS.impact
    );

    // Trend
    const prev = this.previousScores.get(agentId);
    const trend: AgentScore['trend'] = prev === undefined ? 'stable' :
      overallScore > prev + 5 ? 'improving' :
      overallScore < prev - 5 ? 'declining' : 'stable';

    if (trend === 'declining') recommendations.push('Performance declining — review recent changes');
    if (overallScore < 30) recommendations.push('Critical: agent significantly underperforming — consider retraining');

    return {
      agentId, agentName: info.name, tier: info.tier,
      overallScore,
      dimensions: { throughput: throughputScore, accuracy: accuracyScore, latency: latencyScore, reliability: reliabilityScore, impact: impactScore },
      rank: 0, trend, recommendations,
      lastScoredAt: Date.now(),
    };
  }
}
