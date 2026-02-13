/**
 * REVENUE_FORECAST_AGENT
 * Pipeline projections, cashflow modeling, renewal predictions,
 * seasonal adjustments. Emits FORECAST_UPDATED.
 */

import {
  BaseAgent, EventType, AgentEvent,
  memoryGraph, NodeType,
  analyticsLedger, MetricType,
  securityLayer, Permission,
} from '../core';

interface ForecastPeriod {
  month: string; // YYYY-MM
  projectedCommissions: number;
  projectedRenewals: number;
  projectedOverrides: number;
  pipelineValue: number;
  confidence: number; // 0-100
  seasonalAdjustment: number;
}

interface CashflowForecast {
  generatedAt: number;
  periods: ForecastPeriod[];
  annualProjection: number;
  monthlyAverage: number;
  pipelineTotal: number;
  renewalBase: number;
  growthRate: number;
}

// Seasonal factors for life insurance sales (1.0 = average)
const SEASONAL_FACTORS: Record<number, number> = {
  1: 1.15, // January — New Year resolutions
  2: 1.05,
  3: 1.10, // Tax season awareness
  4: 1.08,
  5: 0.95,
  6: 0.90, // Summer slowdown
  7: 0.85,
  8: 0.88,
  9: 1.05, // Back to school / planning
  10: 1.10, // Open enrollment season
  11: 1.05,
  12: 0.85, // Holiday slowdown
};

export class RevenueForecastAgent extends BaseAgent {
  private forecastInterval: NodeJS.Timeout | null = null;

  constructor() {
    super({
      id: 'revenue-forecast',
      name: 'REVENUE_FORECAST_AGENT',
      tier: 6,
      description: 'Pipeline projections, cashflow modeling, renewal predictions',
      capabilities: ['pipeline_projection', 'cashflow_modeling', 'renewal_prediction', 'seasonal_adjustment'],
      consumesEvents: [EventType.COMMISSION_CALCULATED, EventType.POLICY_SOLD, EventType.FORECAST_UPDATED],
      producesEvents: [EventType.FORECAST_UPDATED],
    });
  }

  protected async onStart(): Promise<void> {
    securityLayer.registerAgent(this.id, [Permission.READ_POLICIES, Permission.READ_CLIENTS]);
    // Generate forecast every hour
    this.forecastInterval = setInterval(() => this.generateForecast(), 60 * 60 * 1000);
    // Initial forecast
    setTimeout(() => this.generateForecast(), 5000);
  }

  protected async onStop(): Promise<void> {
    if (this.forecastInterval) { clearInterval(this.forecastInterval); this.forecastInterval = null; }
  }

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.COMMISSION_CALCULATED || event.type === EventType.POLICY_SOLD) {
      // Regenerate forecast when new revenue data comes in
      await this.generateForecast();
    }
  }

  private async generateForecast(): Promise<void> {
    const now = new Date();
    const periods: ForecastPeriod[] = [];

    // Historical data from analytics
    const recentCommissions = analyticsLedger.sum(MetricType.REVENUE_COMMISSION, '30d');
    const recentOverrides = analyticsLedger.sum(MetricType.REVENUE_OVERRIDE, '30d');
    const policiesSold30d = analyticsLedger.count(MetricType.FUNNEL_POLICY_PLACED, '30d');
    const policiesSold90d = analyticsLedger.count(MetricType.FUNNEL_POLICY_PLACED, '90d');

    // Growth rate (30d vs 90d average)
    const monthlyAvg90d = policiesSold90d / 3;
    const growthRate = monthlyAvg90d > 0 ? (policiesSold30d - monthlyAvg90d) / monthlyAvg90d : 0;

    // Pipeline analysis — count leads at each stage
    const leads = this.memory.getNodesByType(NodeType.LEAD);
    const pipelineByStage: Record<string, { count: number; conversionRate: number; avgPremium: number }> = {
      scored: { count: 0, conversionRate: 0.15, avgPremium: 150 },
      contacted: { count: 0, conversionRate: 0.20, avgPremium: 160 },
      qualified: { count: 0, conversionRate: 0.35, avgPremium: 175 },
      appointment: { count: 0, conversionRate: 0.55, avgPremium: 200 },
    };

    for (const lead of leads) {
      const stage = lead.data.stage;
      if (pipelineByStage[stage]) {
        pipelineByStage[stage].count++;
      }
    }

    const pipelineValue = Object.values(pipelineByStage).reduce(
      (sum, s) => sum + s.count * s.conversionRate * s.avgPremium * 12 * 0.9, 0
    );

    // Renewal base from existing policies
    const policies = this.memory.getNodesByType(NodeType.POLICY);
    const renewalBase = policies.reduce((sum, p) => {
      if (p.data.status === 'active') {
        const premium = p.data.premium || 0;
        const renewalRate = 0.05;
        return sum + premium * 12 * renewalRate;
      }
      return sum;
    }, 0);

    // Project 12 months
    for (let i = 0; i < 12; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const month = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`;
      const seasonalFactor = SEASONAL_FACTORS[futureDate.getMonth() + 1] || 1.0;
      const growthFactor = Math.pow(1 + growthRate, i / 12);

      const baseCommission = recentCommissions * growthFactor * seasonalFactor;
      const baseOverrides = recentOverrides * growthFactor * seasonalFactor;
      const monthlyRenewals = renewalBase / 12;

      // Pipeline contribution (weighted by expected close timing)
      const pipelineContrib = i < 3 ? pipelineValue * (0.4 - i * 0.1) / 12 : 0;

      // Confidence decreases further out
      const confidence = Math.max(20, 95 - i * 7);

      periods.push({
        month,
        projectedCommissions: Math.round(baseCommission * 100) / 100,
        projectedRenewals: Math.round(monthlyRenewals * 100) / 100,
        projectedOverrides: Math.round(baseOverrides * 100) / 100,
        pipelineValue: Math.round(pipelineContrib * 100) / 100,
        confidence,
        seasonalAdjustment: seasonalFactor,
      });
    }

    const annualProjection = periods.reduce(
      (sum, p) => sum + p.projectedCommissions + p.projectedRenewals + p.projectedOverrides + p.pipelineValue, 0
    );

    const forecast: CashflowForecast = {
      generatedAt: Date.now(),
      periods,
      annualProjection: Math.round(annualProjection * 100) / 100,
      monthlyAverage: Math.round(annualProjection / 12 * 100) / 100,
      pipelineTotal: Math.round(pipelineValue * 100) / 100,
      renewalBase: Math.round(renewalBase * 100) / 100,
      growthRate: Math.round(growthRate * 10000) / 100,
    };

    // Store forecast
    const existingForecasts = this.memory.getNodesByType(NodeType.DOCUMENT)
      .filter(n => n.data.type === 'revenue_forecast');
    // Keep only latest
    for (const old of existingForecasts) {
      this.memory.deleteNode(old.id);
    }
    this.memory.addNode(NodeType.DOCUMENT, { type: 'revenue_forecast', ...forecast }, this.id, ['forecast', 'revenue']);

    this.emit(EventType.FORECAST_UPDATED, {
      annualProjection: forecast.annualProjection,
      monthlyAverage: forecast.monthlyAverage,
      pipelineTotal: forecast.pipelineTotal,
      renewalBase: forecast.renewalBase,
      growthRate: forecast.growthRate,
      nextMonth: periods[0],
      periodCount: periods.length,
    });

    console.log(`[FORECAST] 📈 Annual: $${forecast.annualProjection.toLocaleString()} | Monthly avg: $${forecast.monthlyAverage.toLocaleString()} | Pipeline: $${forecast.pipelineTotal.toLocaleString()} | Growth: ${forecast.growthRate}%`);
  }
}
