/**
 * REAL_TIME_ANALYTICS_AGENT
 * Live dashboards, funnel tracking, KPI computation, trend detection,
 * anomaly alerts. Emits METRIC_UPDATED.
 */

import {
  BaseAgent, EventType, AgentEvent,
  memoryGraph, NodeType,
  analyticsLedger, MetricType,
  securityLayer, Permission,
} from '../core';

interface KPI {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'flat';
  changePercent: number;
  period: string;
  threshold?: { warning: number; critical: number };
}

interface AnomalyAlert {
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  severity: 'warning' | 'critical';
  detectedAt: number;
}

const KPI_THRESHOLDS: Record<string, { warning: number; critical: number; direction: 'above' | 'below' }> = {
  contactRate: { warning: 20, critical: 10, direction: 'below' },
  closeRate: { warning: 5, critical: 2, direction: 'below' },
  avgPremium: { warning: 50, critical: 30, direction: 'below' },
  responseTime: { warning: 300, critical: 600, direction: 'above' }, // seconds
  errorRate: { warning: 5, critical: 15, direction: 'above' },
};

export class RealTimeAnalyticsAgent extends BaseAgent {
  private kpiInterval: NodeJS.Timeout | null = null;
  private historicalKPIs: Map<string, number[]> = new Map();

  constructor() {
    super({
      id: 'real-time-analytics',
      name: 'REAL_TIME_ANALYTICS_AGENT',
      tier: 9,
      description: 'Live KPI computation, funnel tracking, trend detection, anomaly alerts',
      capabilities: ['live_dashboards', 'funnel_tracking', 'kpi_computation', 'trend_detection', 'anomaly_alerts'],
      consumesEvents: [
        EventType.LEAD_SCORED, EventType.POLICY_SOLD, EventType.PAYMENT_PROCESSED,
        EventType.COMMISSION_CALCULATED, EventType.APPOINTMENT_BOOKED,
      ],
      producesEvents: [EventType.METRIC_UPDATED],
    });
  }

  protected async onStart(): Promise<void> {
    securityLayer.registerAgent(this.id, [Permission.READ_LEADS, Permission.READ_CLIENTS, Permission.READ_POLICIES]);
    // Compute KPIs every 5 minutes
    this.kpiInterval = setInterval(() => this.computeAndEmitKPIs(), 5 * 60 * 1000);
    setTimeout(() => this.computeAndEmitKPIs(), 3000);
  }

  protected async onStop(): Promise<void> {
    if (this.kpiInterval) { clearInterval(this.kpiInterval); this.kpiInterval = null; }
  }

  protected async handleEvent(event: AgentEvent): Promise<void> {
    // Real-time metric updates on significant events
    if (event.type === EventType.POLICY_SOLD) {
      this.emit(EventType.METRIC_UPDATED, {
        metric: 'policy_sold',
        value: 1,
        premium: event.payload.premium,
        carrier: event.payload.carrier,
        timestamp: Date.now(),
      });
    } else if (event.type === EventType.LEAD_SCORED) {
      this.emit(EventType.METRIC_UPDATED, {
        metric: 'lead_scored',
        value: 1,
        heatScore: event.payload.heatScore,
        timestamp: Date.now(),
      });
    }
  }

  async computeAndEmitKPIs(): Promise<void> {
    const funnel = analyticsLedger.getFunnelMetrics('30d');
    const revenue = analyticsLedger.getRevenueSummary('30d');
    const funnelPrior = analyticsLedger.getFunnelMetrics('90d');

    const kpis: KPI[] = [];

    // Funnel KPIs
    kpis.push(this.buildKPI('Leads Created', funnel.leadsCreated, 'count', funnelPrior.leadsCreated / 3, '30d'));
    kpis.push(this.buildKPI('Contact Rate', funnel.contactRate, '%', funnelPrior.contactRate, '30d', KPI_THRESHOLDS.contactRate));
    kpis.push(this.buildKPI('Qualification Rate', funnel.qualificationRate, '%', funnelPrior.qualificationRate, '30d'));
    kpis.push(this.buildKPI('Appointment Rate', funnel.appointmentRate, '%', funnelPrior.appointmentRate, '30d'));
    kpis.push(this.buildKPI('Show Rate', funnel.showRate, '%', funnelPrior.showRate, '30d'));
    kpis.push(this.buildKPI('Close Rate', funnel.closeRate, '%', funnelPrior.closeRate, '30d', KPI_THRESHOLDS.closeRate));
    kpis.push(this.buildKPI('Overall Conversion', funnel.overallConversion, '%', funnelPrior.overallConversion, '30d'));

    // Revenue KPIs
    kpis.push(this.buildKPI('Total Commission', revenue.totalCommission, 'USD', 0, '30d'));
    kpis.push(this.buildKPI('Total Premium', revenue.totalPremium, 'USD', 0, '30d'));
    kpis.push(this.buildKPI('Total Revenue', revenue.totalRevenue, 'USD', 0, '30d'));

    // Pipeline KPIs
    const leads = this.memory.getNodesByType(NodeType.LEAD);
    const activeLeads = leads.filter(l => !['sold', 'lost'].includes(l.data.stage));
    kpis.push(this.buildKPI('Active Pipeline', activeLeads.length, 'leads', 0, 'current'));

    const hotLeads = leads.filter(l => l.data.heatScore >= 70 && l.data.stage !== 'sold');
    kpis.push(this.buildKPI('Hot Leads', hotLeads.length, 'leads', 0, 'current'));

    // Check for anomalies
    const anomalies = this.detectAnomalies(kpis);

    // Store historical for trend tracking
    for (const kpi of kpis) {
      if (!this.historicalKPIs.has(kpi.name)) this.historicalKPIs.set(kpi.name, []);
      const history = this.historicalKPIs.get(kpi.name)!;
      history.push(kpi.value);
      if (history.length > 288) history.shift(); // Keep 24h at 5-min intervals
    }

    this.emit(EventType.METRIC_UPDATED, {
      type: 'kpi_update',
      kpis,
      anomalies,
      funnel,
      revenue,
      timestamp: Date.now(),
    });

    if (anomalies.length > 0) {
      for (const a of anomalies) {
        console.warn(`[ANALYTICS] 🚨 Anomaly: ${a.metric} = ${a.actualValue} (expected ~${a.expectedValue}) | ${a.severity}`);
      }
    }
  }

  private buildKPI(name: string, value: number, unit: string, priorValue: number, period: string, threshold?: { warning: number; critical: number }): KPI {
    const changePercent = priorValue > 0 ? ((value - priorValue) / priorValue) * 100 : 0;
    const trend: KPI['trend'] = changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'flat';

    return {
      name,
      value: Math.round(value * 100) / 100,
      unit,
      trend,
      changePercent: Math.round(changePercent * 10) / 10,
      period,
      threshold,
    };
  }

  private detectAnomalies(kpis: KPI[]): AnomalyAlert[] {
    const anomalies: AnomalyAlert[] = [];

    for (const kpi of kpis) {
      const history = this.historicalKPIs.get(kpi.name);
      if (!history || history.length < 12) continue; // Need enough data

      const mean = history.reduce((a, b) => a + b, 0) / history.length;
      const stdDev = Math.sqrt(history.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / history.length);

      if (stdDev === 0) continue;
      const zScore = Math.abs((kpi.value - mean) / stdDev);

      if (zScore > 3) {
        anomalies.push({
          metric: kpi.name,
          expectedValue: Math.round(mean * 100) / 100,
          actualValue: kpi.value,
          deviation: Math.round(zScore * 100) / 100,
          severity: zScore > 4 ? 'critical' : 'warning',
          detectedAt: Date.now(),
        });
      }
    }

    return anomalies;
  }

  getDashboardData(): {
    kpis: KPI[];
    funnel: ReturnType<typeof analyticsLedger.getFunnelMetrics>;
    revenue: ReturnType<typeof analyticsLedger.getRevenueSummary>;
    memoryStats: ReturnType<typeof memoryGraph.getStats>;
  } {
    return {
      kpis: [], // Populated by last computeAndEmitKPIs call
      funnel: analyticsLedger.getFunnelMetrics('30d'),
      revenue: analyticsLedger.getRevenueSummary('30d'),
      memoryStats: this.memory.getStats(),
    };
  }
}
