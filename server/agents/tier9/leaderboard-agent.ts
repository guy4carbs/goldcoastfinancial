/**
 * LEADERBOARD_AGENT
 * Computes hourly sales leaderboard from deals table.
 * Ranks top 20 agents by AP (Annual Premium), broadcasts via WebSocket.
 * Triggers on POLICY_SOLD events and hourly interval.
 */

import {
  BaseAgent, EventType, AgentEvent,
  analyticsLedger, MetricType,
} from '../core';

interface LeaderboardEntry {
  rank: number;
  agentUserId: string;
  firstName: string;
  lastName: string;
  totalAP: number;
  dealCount: number;
}

interface LeaderboardSnapshot {
  generatedAt: number;
  period: string;
  teamTotalAP: number;
  teamDealCount: number;
  entries: LeaderboardEntry[];
}

export class LeaderboardAgent extends BaseAgent {
  private computeInterval: NodeJS.Timeout | null = null;
  private lastComputeTime: number = 0;
  private readonly DEBOUNCE_MS = 5 * 60 * 1000; // 5 min debounce for event-triggered recompute

  constructor() {
    super({
      id: 'leaderboard',
      name: 'LEADERBOARD_AGENT',
      tier: 9,
      description: 'Computes hourly sales leaderboard, ranks agents by AP, broadcasts results',
      capabilities: ['leaderboard_computation', 'ranking', 'broadcast'],
      consumesEvents: [EventType.POLICY_SOLD],
      producesEvents: [EventType.METRIC_UPDATED],
    });
  }

  protected async onStart(): Promise<void> {
    // Compute every hour
    this.computeInterval = setInterval(() => this.computeLeaderboard(), 60 * 60 * 1000);

    // Initial compute on startup (with delay to let DB settle)
    setTimeout(() => this.computeLeaderboard(), 10000);

    console.log(`[LEADERBOARD]`,'Leaderboard agent started — computing hourly');
  }

  protected async onStop(): Promise<void> {
    if (this.computeInterval) {
      clearInterval(this.computeInterval);
      this.computeInterval = null;
    }
  }

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.POLICY_SOLD) {
      // Debounce: only recompute if last compute was > 5 min ago
      const now = Date.now();
      if (now - this.lastComputeTime > this.DEBOUNCE_MS) {
        console.log(`[LEADERBOARD]`,'Policy sold event — recomputing leaderboard');
        await this.computeLeaderboard();
      }
    }
  }

  private async computeLeaderboard(): Promise<void> {
    try {
      const { pool } = await import('../../db');

      // Month-to-date period
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Top 20 by AP
      const result = await pool.query(`
        SELECT d.agent_user_id,
               u.first_name, u.last_name,
               SUM(d.annual_premium::numeric) as total_ap,
               COUNT(*)::int as deal_count
        FROM deals d
        JOIN users u ON d.agent_user_id = u.id
        WHERE d.status != 'rejected'
          AND d.submitted_at >= $1
        GROUP BY d.agent_user_id, u.first_name, u.last_name
        ORDER BY total_ap DESC
        LIMIT 20
      `, [monthStart]);

      // Team totals
      const statsResult = await pool.query(`
        SELECT COALESCE(SUM(annual_premium::numeric), 0) as total_ap,
               COUNT(*)::int as total_deals
        FROM deals
        WHERE status != 'rejected' AND submitted_at >= $1
      `, [monthStart]);

      const entries: LeaderboardEntry[] = result.rows.map((r: any, idx: number) => ({
        rank: idx + 1,
        agentUserId: r.agent_user_id,
        firstName: r.first_name || '',
        lastName: r.last_name || '',
        totalAP: parseFloat(r.total_ap) || 0,
        dealCount: r.deal_count || 0,
      }));

      const snapshot: LeaderboardSnapshot = {
        generatedAt: Date.now(),
        period: 'month',
        teamTotalAP: parseFloat(statsResult.rows[0]?.total_ap) || 0,
        teamDealCount: statsResult.rows[0]?.total_deals || 0,
        entries,
      };

      this.lastComputeTime = Date.now();

      // Broadcast via WebSocket
      try {
        // Import the wsServer from the global app context
        const wsModule = await import('../../websocket/GCFWebSocketServer');
        // The wsServer instance is set on the Express app, but we can broadcast through the event bridge
        // For now, emit a METRIC_UPDATED event that the eventBridge can pick up
      } catch {
        // WebSocket broadcast is best-effort
      }

      // Emit METRIC_UPDATED event for other agents to consume
      this.emit(EventType.METRIC_UPDATED, {
        metricType: 'leaderboard',
        snapshot,
      });

      // Track in analytics ledger
      try {
        analyticsLedger.record(MetricType.REVENUE_PREMIUM, snapshot.teamTotalAP, 'leaderboard-agent');
      } catch { /* analytics recording is non-critical */ }

      console.log(`[LEADERBOARD]`,`Leaderboard computed: ${entries.length} agents, team total: $${snapshot.teamTotalAP.toLocaleString()} AP`);
    } catch (error: any) {
      console.log(`[LEADERBOARD]`,`Leaderboard computation failed: ${error.message}`);
    }
  }
}
