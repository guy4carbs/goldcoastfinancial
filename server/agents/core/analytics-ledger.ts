/**
 * ANALYTICS LEDGER
 * Revenue, conversion, agent performance tracking.
 * Every financial and performance metric flows through here.
 */

import { randomUUID } from 'crypto';

// ─── Metric Types ────────────────────────────────────────────────
export enum MetricType {
  // Revenue
  REVENUE_PREMIUM = 'REVENUE_PREMIUM',
  REVENUE_COMMISSION = 'REVENUE_COMMISSION',
  REVENUE_OVERRIDE = 'REVENUE_OVERRIDE',
  REVENUE_BONUS = 'REVENUE_BONUS',

  // Conversion Funnel
  FUNNEL_LEAD_CREATED = 'FUNNEL_LEAD_CREATED',
  FUNNEL_LEAD_CONTACTED = 'FUNNEL_LEAD_CONTACTED',
  FUNNEL_LEAD_QUALIFIED = 'FUNNEL_LEAD_QUALIFIED',
  FUNNEL_APPOINTMENT_SET = 'FUNNEL_APPOINTMENT_SET',
  FUNNEL_APPOINTMENT_KEPT = 'FUNNEL_APPOINTMENT_KEPT',
  FUNNEL_APPLICATION_STARTED = 'FUNNEL_APPLICATION_STARTED',
  FUNNEL_APPLICATION_SUBMITTED = 'FUNNEL_APPLICATION_SUBMITTED',
  FUNNEL_POLICY_ISSUED = 'FUNNEL_POLICY_ISSUED',
  FUNNEL_POLICY_PLACED = 'FUNNEL_POLICY_PLACED',

  // Outreach
  OUTREACH_CALL_MADE = 'OUTREACH_CALL_MADE',
  OUTREACH_CALL_CONNECTED = 'OUTREACH_CALL_CONNECTED',
  OUTREACH_EMAIL_SENT = 'OUTREACH_EMAIL_SENT',
  OUTREACH_EMAIL_OPENED = 'OUTREACH_EMAIL_OPENED',
  OUTREACH_EMAIL_CLICKED = 'OUTREACH_EMAIL_CLICKED',
  OUTREACH_SMS_SENT = 'OUTREACH_SMS_SENT',
  OUTREACH_SMS_REPLIED = 'OUTREACH_SMS_REPLIED',

  // Agent Performance
  AGENT_TASK_COMPLETED = 'AGENT_TASK_COMPLETED',
  AGENT_TASK_FAILED = 'AGENT_TASK_FAILED',
  AGENT_RESPONSE_TIME = 'AGENT_RESPONSE_TIME',

  // Client
  CLIENT_RETAINED = 'CLIENT_RETAINED',
  CLIENT_CHURNED = 'CLIENT_CHURNED',
  CLIENT_LTV_UPDATED = 'CLIENT_LTV_UPDATED',
}

// ─── Ledger Entry ────────────────────────────────────────────────
export interface LedgerEntry {
  id: string;
  metric: MetricType;
  value: number;
  unit: string;
  source: string;       // Agent ID
  entityId?: string;    // Lead/Client/Policy ID
  tags: string[];
  timestamp: number;
  metadata?: Record<string, any>;
}

// ─── Time Window ─────────────────────────────────────────────────
export type TimeWindow = '1h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'all';

function windowToMs(window: TimeWindow): number {
  switch (window) {
    case '1h': return 3600000;
    case '24h': return 86400000;
    case '7d': return 604800000;
    case '30d': return 2592000000;
    case '90d': return 7776000000;
    case '1y': return 31536000000;
    case 'all': return Infinity;
  }
}

// ─── Analytics Ledger ────────────────────────────────────────────
export class AnalyticsLedger {
  private entries: LedgerEntry[] = [];
  private static instance: AnalyticsLedger;

  static getInstance(): AnalyticsLedger {
    if (!AnalyticsLedger.instance) {
      AnalyticsLedger.instance = new AnalyticsLedger();
    }
    return AnalyticsLedger.instance;
  }

  // ─── Record ────────────────────────────────────────────────
  record(
    metric: MetricType,
    value: number,
    source: string,
    options: Partial<LedgerEntry> = {}
  ): LedgerEntry {
    const entry: LedgerEntry = {
      id: randomUUID(),
      metric,
      value,
      unit: options.unit || 'count',
      source,
      entityId: options.entityId,
      tags: options.tags || [],
      timestamp: Date.now(),
      metadata: options.metadata,
    };

    this.entries.push(entry);

    // Keep last 100k entries in memory
    if (this.entries.length > 100000) {
      this.entries = this.entries.slice(-50000);
    }

    return entry;
  }

  // ─── Query ─────────────────────────────────────────────────
  query(options: {
    metric?: MetricType;
    metrics?: MetricType[];
    source?: string;
    entityId?: string;
    tags?: string[];
    window?: TimeWindow;
    limit?: number;
  }): LedgerEntry[] {
    const cutoff = options.window ? Date.now() - windowToMs(options.window) : 0;
    let results = this.entries.filter((e) => e.timestamp >= cutoff);

    if (options.metric) {
      results = results.filter((e) => e.metric === options.metric);
    }
    if (options.metrics) {
      results = results.filter((e) => options.metrics!.includes(e.metric));
    }
    if (options.source) {
      results = results.filter((e) => e.source === options.source);
    }
    if (options.entityId) {
      results = results.filter((e) => e.entityId === options.entityId);
    }
    if (options.tags?.length) {
      results = results.filter((e) => options.tags!.some((t) => e.tags.includes(t)));
    }
    if (options.limit) {
      results = results.slice(-options.limit);
    }

    return results;
  }

  // ─── Aggregations ──────────────────────────────────────────
  sum(metric: MetricType, window: TimeWindow = 'all'): number {
    return this.query({ metric, window }).reduce((acc, e) => acc + e.value, 0);
  }

  count(metric: MetricType, window: TimeWindow = 'all'): number {
    return this.query({ metric, window }).length;
  }

  average(metric: MetricType, window: TimeWindow = 'all'): number {
    const entries = this.query({ metric, window });
    if (entries.length === 0) return 0;
    return entries.reduce((acc, e) => acc + e.value, 0) / entries.length;
  }

  // ─── Conversion Funnel ─────────────────────────────────────
  getFunnelMetrics(window: TimeWindow = '30d'): {
    leadsCreated: number;
    leadsContacted: number;
    leadsQualified: number;
    appointmentsSet: number;
    appointmentsKept: number;
    applicationsStarted: number;
    applicationsSubmitted: number;
    policiesIssued: number;
    policiesPlaced: number;
    contactRate: number;
    qualificationRate: number;
    appointmentRate: number;
    showRate: number;
    closeRate: number;
    overallConversion: number;
  } {
    const leads = this.count(MetricType.FUNNEL_LEAD_CREATED, window);
    const contacted = this.count(MetricType.FUNNEL_LEAD_CONTACTED, window);
    const qualified = this.count(MetricType.FUNNEL_LEAD_QUALIFIED, window);
    const apptSet = this.count(MetricType.FUNNEL_APPOINTMENT_SET, window);
    const apptKept = this.count(MetricType.FUNNEL_APPOINTMENT_KEPT, window);
    const appStarted = this.count(MetricType.FUNNEL_APPLICATION_STARTED, window);
    const appSubmitted = this.count(MetricType.FUNNEL_APPLICATION_SUBMITTED, window);
    const issued = this.count(MetricType.FUNNEL_POLICY_ISSUED, window);
    const placed = this.count(MetricType.FUNNEL_POLICY_PLACED, window);

    const pct = (n: number, d: number) => (d > 0 ? (n / d) * 100 : 0);

    return {
      leadsCreated: leads,
      leadsContacted: contacted,
      leadsQualified: qualified,
      appointmentsSet: apptSet,
      appointmentsKept: apptKept,
      applicationsStarted: appStarted,
      applicationsSubmitted: appSubmitted,
      policiesIssued: issued,
      policiesPlaced: placed,
      contactRate: pct(contacted, leads),
      qualificationRate: pct(qualified, contacted),
      appointmentRate: pct(apptSet, qualified),
      showRate: pct(apptKept, apptSet),
      closeRate: pct(placed, apptKept),
      overallConversion: pct(placed, leads),
    };
  }

  // ─── Revenue Summary ──────────────────────────────────────
  getRevenueSummary(window: TimeWindow = '30d'): {
    totalPremium: number;
    totalCommission: number;
    totalOverrides: number;
    totalBonuses: number;
    totalRevenue: number;
  } {
    const premium = this.sum(MetricType.REVENUE_PREMIUM, window);
    const commission = this.sum(MetricType.REVENUE_COMMISSION, window);
    const overrides = this.sum(MetricType.REVENUE_OVERRIDE, window);
    const bonuses = this.sum(MetricType.REVENUE_BONUS, window);

    return {
      totalPremium: premium,
      totalCommission: commission,
      totalOverrides: overrides,
      totalBonuses: bonuses,
      totalRevenue: commission + overrides + bonuses,
    };
  }

  // ─── Agent Scoreboard ─────────────────────────────────────
  getAgentScoreboard(window: TimeWindow = '30d'): Array<{
    agentId: string;
    tasksCompleted: number;
    tasksFailed: number;
    successRate: number;
    avgResponseTime: number;
  }> {
    const entries = this.query({ window });
    const agents = new Map<string, { completed: number; failed: number; responseTimes: number[] }>();

    entries.forEach((e) => {
      if (!agents.has(e.source)) {
        agents.set(e.source, { completed: 0, failed: 0, responseTimes: [] });
      }
      const agent = agents.get(e.source)!;
      if (e.metric === MetricType.AGENT_TASK_COMPLETED) agent.completed += e.value;
      if (e.metric === MetricType.AGENT_TASK_FAILED) agent.failed += e.value;
      if (e.metric === MetricType.AGENT_RESPONSE_TIME) agent.responseTimes.push(e.value);
    });

    return Array.from(agents.entries()).map(([agentId, data]) => ({
      agentId,
      tasksCompleted: data.completed,
      tasksFailed: data.failed,
      successRate: data.completed + data.failed > 0
        ? (data.completed / (data.completed + data.failed)) * 100
        : 100,
      avgResponseTime: data.responseTimes.length > 0
        ? data.responseTimes.reduce((a, b) => a + b, 0) / data.responseTimes.length
        : 0,
    }));
  }

  // ─── Stats ─────────────────────────────────────────────────
  getStats(): { totalEntries: number; oldestEntry: number; newestEntry: number } {
    return {
      totalEntries: this.entries.length,
      oldestEntry: this.entries.length > 0 ? this.entries[0].timestamp : 0,
      newestEntry: this.entries.length > 0 ? this.entries[this.entries.length - 1].timestamp : 0,
    };
  }

  clear(): void {
    this.entries = [];
  }
}

export const analyticsLedger = AnalyticsLedger.getInstance();
