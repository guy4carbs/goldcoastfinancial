/**
 * OPTIMIZATION_AGENT
 * A/B testing framework, funnel tuning, script evolution,
 * parameter optimization. Emits OPTIMIZATION_APPLIED.
 */

import {
  BaseAgent, EventType, AgentEvent,
  memoryGraph, NodeType,
  analyticsLedger, MetricType,
  securityLayer, Permission,
} from '../core';

interface ABTest {
  id: string;
  name: string;
  type: 'email_subject' | 'call_script' | 'sms_template' | 'outreach_timing' | 'funnel_step';
  variants: TestVariant[];
  status: 'running' | 'completed' | 'stopped';
  startedAt: number;
  endedAt?: number;
  winnerId?: string;
  minSampleSize: number;
  confidenceLevel: number; // 0-1
}

interface TestVariant {
  id: string;
  label: string;
  config: Record<string, any>;
  sampleSize: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
}

interface OptimizationResult {
  testId: string;
  winner: string;
  improvement: number; // percentage
  confidence: number;
  appliedAt: number;
  description: string;
}

const DEFAULT_MIN_SAMPLE = 100;
const DEFAULT_CONFIDENCE = 0.95;

export class OptimizationAgent extends BaseAgent {
  private activeTests: Map<string, ABTest> = new Map();
  private evaluationInterval: NodeJS.Timeout | null = null;

  constructor() {
    super({
      id: 'optimization',
      name: 'OPTIMIZATION_AGENT',
      tier: 9,
      description: 'A/B testing framework, funnel tuning, script evolution, parameter optimization',
      capabilities: ['ab_testing', 'funnel_tuning', 'script_evolution', 'parameter_optimization'],
      consumesEvents: [EventType.CONTENT_CREATED, EventType.AGENT_SCORE_UPDATED, EventType.METRIC_UPDATED],
      producesEvents: [EventType.OPTIMIZATION_APPLIED],
    });
  }

  protected async onStart(): Promise<void> {
    securityLayer.registerAgent(this.id, [Permission.READ_LEADS, Permission.READ_CLIENTS]);
    // Evaluate tests every 30 minutes
    this.evaluationInterval = setInterval(() => this.evaluateTests(), 30 * 60 * 1000);
  }

  protected async onStop(): Promise<void> {
    if (this.evaluationInterval) { clearInterval(this.evaluationInterval); this.evaluationInterval = null; }
  }

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.METRIC_UPDATED && event.payload.type === 'kpi_update') {
      // Check if any funnel metrics suggest optimization opportunities
      await this.identifyOptimizationOpportunities(event.payload);
    }
  }

  async createTest(params: {
    name: string;
    type: ABTest['type'];
    variants: Array<{ label: string; config: Record<string, any> }>;
    minSampleSize?: number;
  }): Promise<ABTest> {
    const test: ABTest = {
      id: `TEST-${Date.now()}`,
      name: params.name,
      type: params.type,
      variants: params.variants.map((v, i) => ({
        id: `V${i + 1}`,
        label: v.label,
        config: v.config,
        sampleSize: 0,
        conversions: 0,
        conversionRate: 0,
        revenue: 0,
      })),
      status: 'running',
      startedAt: Date.now(),
      minSampleSize: params.minSampleSize || DEFAULT_MIN_SAMPLE,
      confidenceLevel: DEFAULT_CONFIDENCE,
    };

    this.activeTests.set(test.id, test);
    this.memory.addNode(NodeType.DOCUMENT, { ...test, type: 'ab_test' }, this.id, ['ab_test', params.type]);

    console.log(`[OPTIMIZATION] 🧪 A/B Test started: "${params.name}" | ${params.variants.length} variants | Min sample: ${test.minSampleSize}`);
    return test;
  }

  recordTestEvent(testId: string, variantId: string, converted: boolean, revenue: number = 0): void {
    const test = this.activeTests.get(testId);
    if (!test || test.status !== 'running') return;

    const variant = test.variants.find(v => v.id === variantId);
    if (!variant) return;

    variant.sampleSize++;
    if (converted) {
      variant.conversions++;
      variant.revenue += revenue;
    }
    variant.conversionRate = variant.sampleSize > 0 ? variant.conversions / variant.sampleSize : 0;
  }

  private async evaluateTests(): Promise<void> {
    for (const [testId, test] of Array.from(this.activeTests.entries())) {
      if (test.status !== 'running') continue;

      // Check if we have enough data
      const totalSamples = test.variants.reduce((s, v) => s + v.sampleSize, 0);
      if (totalSamples < test.minSampleSize * test.variants.length) continue;

      // Statistical significance check (simplified z-test)
      const result = this.evaluateStatisticalSignificance(test);
      if (!result) continue;

      // We have a winner
      test.status = 'completed';
      test.endedAt = Date.now();
      test.winnerId = result.winnerId;

      const winner = test.variants.find(v => v.id === result.winnerId)!;
      const loser = test.variants.find(v => v.id !== result.winnerId)!;
      const improvement = loser.conversionRate > 0
        ? ((winner.conversionRate - loser.conversionRate) / loser.conversionRate) * 100
        : 100;

      const optResult: OptimizationResult = {
        testId,
        winner: winner.label,
        improvement: Math.round(improvement * 10) / 10,
        confidence: result.confidence,
        appliedAt: Date.now(),
        description: `${test.name}: "${winner.label}" won with ${(winner.conversionRate * 100).toFixed(1)}% conversion (${improvement.toFixed(1)}% improvement)`,
      };

      this.emit(EventType.OPTIMIZATION_APPLIED, {
        testId, testName: test.name, testType: test.type,
        winner: winner.label, winnerConfig: winner.config,
        improvement: optResult.improvement,
        confidence: result.confidence,
        totalSamples,
      });

      analyticsLedger.record(MetricType.AGENT_TASK_COMPLETED, 1, this.id, {
        metadata: { testId, winner: winner.label, improvement },
      });

      console.log(`[OPTIMIZATION] 🏆 Test complete: "${test.name}" | Winner: ${winner.label} | +${improvement.toFixed(1)}% | Confidence: ${(result.confidence * 100).toFixed(0)}%`);
    }
  }

  private evaluateStatisticalSignificance(test: ABTest): { winnerId: string; confidence: number } | null {
    if (test.variants.length < 2) return null;

    const [a, b] = test.variants;
    if (a.sampleSize < 30 || b.sampleSize < 30) return null;

    const pA = a.conversionRate;
    const pB = b.conversionRate;
    const nA = a.sampleSize;
    const nB = b.sampleSize;

    // Pooled proportion
    const pPool = (a.conversions + b.conversions) / (nA + nB);
    const se = Math.sqrt(pPool * (1 - pPool) * (1 / nA + 1 / nB));

    if (se === 0) return null;

    const zScore = Math.abs(pA - pB) / se;

    // Z-score to confidence (approximation)
    let confidence = 0;
    if (zScore >= 2.576) confidence = 0.99;
    else if (zScore >= 1.960) confidence = 0.95;
    else if (zScore >= 1.645) confidence = 0.90;
    else return null; // Not significant enough

    const winnerId = pA >= pB ? a.id : b.id;
    return { winnerId, confidence };
  }

  private async identifyOptimizationOpportunities(kpiData: any): Promise<void> {
    if (!kpiData.funnel) return;

    const { funnel } = kpiData;

    // Identify weak funnel steps
    if (funnel.contactRate < 30 && funnel.leadsCreated > 10) {
      console.log(`[OPTIMIZATION] 💡 Opportunity: Contact rate at ${funnel.contactRate.toFixed(1)}% — test new outreach scripts`);
    }
    if (funnel.showRate < 60 && funnel.appointmentsSet > 5) {
      console.log(`[OPTIMIZATION] 💡 Opportunity: Show rate at ${funnel.showRate.toFixed(1)}% — test reminder sequences`);
    }
    if (funnel.closeRate < 20 && funnel.appointmentsKept > 5) {
      console.log(`[OPTIMIZATION] 💡 Opportunity: Close rate at ${funnel.closeRate.toFixed(1)}% — test sales scripts`);
    }
  }

  getActiveTests(): ABTest[] {
    return Array.from(this.activeTests.values()).filter(t => t.status === 'running');
  }

  getCompletedTests(): ABTest[] {
    return Array.from(this.activeTests.values()).filter(t => t.status === 'completed');
  }
}
