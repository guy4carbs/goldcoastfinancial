/**
 * Executive Dashboard API Routes
 * Aggregates org-wide data for executive/owner view
 */

import { Router, Request, Response } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, attachUser } from "../middleware/auth";
import { Roles, RoleGroups } from "../types/permissions";

const router = Router();

// Executive-only access
router.use(attachUser);
router.use(requireAuth);
router.use(requireRole(...RoleGroups.ADMINS));

// =============================================================================
// GET /api/executive/dashboard — Org-wide executive metrics
// =============================================================================
router.get("/dashboard", async (req: Request, res: Response) => {
  try {
    // Run all queries in parallel
    const [
      orgMetricsResult,
      teamsResult,
      topPerformersResult,
      revenueByProductResult,
      recentActivityResult,
      agentStatusesResult,
      complianceResult,
      velocityResult,
      quarterlyGoalsResult,
    ] = await Promise.all([
      // 1. Org-wide metrics
      pool.query(`
        SELECT
          COALESCE(SUM(won_amount), 0)::int AS total_revenue,
          COALESCE(SUM(CASE WHEN status NOT IN ('won', 'lost') THEN COALESCE(estimated_value, 0) ELSE 0 END), 0)::int AS pipeline_value,
          COUNT(*) FILTER (WHERE status = 'won')::int AS won_count,
          COUNT(*)::int AS total_count,
          COALESCE(AVG(won_amount) FILTER (WHERE status = 'won'), 0)::int AS avg_deal_size,
          COUNT(*) FILTER (WHERE status = 'won' AND won_date >= NOW() - INTERVAL '30 days')::int AS won_this_month,
          COALESCE(SUM(won_amount) FILTER (WHERE won_date >= NOW() - INTERVAL '30 days'), 0)::int AS revenue_this_month,
          COALESCE(SUM(won_amount) FILTER (WHERE won_date >= NOW() - INTERVAL '60 days' AND won_date < NOW() - INTERVAL '30 days'), 0)::int AS revenue_last_month,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '90 days')::int AS leads_90d,
          COUNT(*) FILTER (WHERE status = 'won' AND created_at >= NOW() - INTERVAL '90 days')::int AS won_90d
        FROM leads
      `),

      // 2. Team performance (group by distributed manager or assigned agent's hierarchy)
      pool.query(`
        WITH agent_stats AS (
          SELECT
            COALESCE(l.distributed_to, l.assigned_to) AS agent_id,
            COUNT(*)::int AS lead_count,
            COUNT(*) FILTER (WHERE l.status = 'won')::int AS won_count,
            COALESCE(SUM(l.won_amount) FILTER (WHERE l.status = 'won'), 0)::int AS revenue,
            COALESCE(SUM(CASE WHEN l.status NOT IN ('won', 'lost') THEN COALESCE(l.estimated_value, 0) ELSE 0 END), 0)::int AS pipeline
          FROM leads l
          WHERE l.created_at >= NOW() - INTERVAL '90 days'
          GROUP BY COALESCE(l.distributed_to, l.assigned_to)
        ),
        team_data AS (
          SELECT
            h.direct_upline_id AS manager_id,
            m.first_name || ' ' || m.last_name AS manager_name,
            COUNT(DISTINCT h.agent_user_id)::int AS agent_count,
            COALESCE(SUM(s.revenue), 0)::int AS revenue,
            COALESCE(SUM(s.pipeline), 0)::int AS pipeline,
            CASE WHEN SUM(s.lead_count) > 0
              THEN ROUND(SUM(s.won_count)::numeric / SUM(s.lead_count) * 100, 1)
              ELSE 0 END AS conversion
          FROM agent_hierarchy h
          JOIN users m ON h.direct_upline_id = m.id
          LEFT JOIN agent_stats s ON h.agent_user_id::text = s.agent_id
          WHERE h.effective_to IS NULL
            AND h.direct_upline_id IS NOT NULL
          GROUP BY h.direct_upline_id, m.first_name, m.last_name
        )
        SELECT * FROM team_data
        ORDER BY revenue DESC
        LIMIT 10
      `),

      // 3. Top performers (agents by won revenue in last 90 days)
      pool.query(`
        SELECT
          u.id,
          u.first_name || ' ' || u.last_name AS name,
          u.role,
          COALESCE(h.hierarchy_title, 'Agent') AS title,
          COUNT(*) FILTER (WHERE l.status = 'won')::int AS deals,
          COALESCE(SUM(l.won_amount) FILTER (WHERE l.status = 'won'), 0)::int AS revenue,
          CASE
            WHEN COALESCE(SUM(l.won_amount) FILTER (WHERE l.status = 'won' AND l.won_date >= NOW() - INTERVAL '30 days'), 0)
              >= COALESCE(SUM(l.won_amount) FILTER (WHERE l.status = 'won' AND l.won_date >= NOW() - INTERVAL '60 days' AND l.won_date < NOW() - INTERVAL '30 days'), 0)
            THEN 'up' ELSE 'down'
          END AS trend
        FROM users u
        LEFT JOIN leads l ON l.assigned_to = u.id::text AND l.created_at >= NOW() - INTERVAL '90 days'
        LEFT JOIN agent_hierarchy h ON h.agent_user_id = u.id AND h.effective_to IS NULL
        WHERE u.role IN ('sales_agent', 'agency_manager')
        GROUP BY u.id, u.first_name, u.last_name, u.role, h.hierarchy_title
        HAVING COUNT(*) FILTER (WHERE l.status = 'won') > 0
        ORDER BY revenue DESC
        LIMIT 5
      `),

      // 4. Revenue by product (coverage type)
      pool.query(`
        SELECT
          COALESCE(coverage_type, 'Other') AS product,
          COALESCE(SUM(won_amount), 0)::int AS revenue
        FROM leads
        WHERE status = 'won' AND won_amount > 0
        GROUP BY coverage_type
        ORDER BY revenue DESC
        LIMIT 6
      `),

      // 5. Recent activity (last 10 lead status changes)
      pool.query(`
        SELECT
          la.id::text,
          la.activity_type AS type,
          la.description AS message,
          la.created_at AS time,
          COALESCE(u.first_name || ' ' || u.last_name, 'System') AS actor
        FROM lead_activities la
        LEFT JOIN users u ON la.performed_by = u.id::text
        ORDER BY la.created_at DESC
        LIMIT 10
      `),

      // 6. Agent statuses (active users with roles)
      pool.query(`
        SELECT
          u.id,
          u.first_name || ' ' || u.last_name AS name,
          u.role,
          CASE
            WHEN u.last_login_at >= NOW() - INTERVAL '1 hour' THEN 'active'
            WHEN u.last_login_at >= NOW() - INTERVAL '24 hours' THEN 'idle'
            ELSE 'offline'
          END AS status
        FROM users u
        WHERE u.role IN ('sales_agent', 'agency_manager', 'owner', 'system_admin')
        ORDER BY u.last_login_at DESC NULLS LAST
      `),

      // 7. Compliance (license expiry counts by team)
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE expiry_date > NOW())::int AS valid_licenses,
          COUNT(*) FILTER (WHERE expiry_date <= NOW() + INTERVAL '30 days' AND expiry_date > NOW())::int AS expiring_soon,
          COUNT(*) FILTER (WHERE expiry_date <= NOW())::int AS expired,
          COUNT(*)::int AS total_licenses
        FROM agent_licenses
      `),

      // 8. Sales velocity
      pool.query(`
        SELECT
          COALESCE(AVG(EXTRACT(DAY FROM (won_date - created_at))) FILTER (WHERE status = 'won' AND won_date IS NOT NULL), 0)::int AS avg_days_to_close,
          CASE WHEN COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '90 days') > 0
            THEN ROUND(COUNT(*) FILTER (WHERE status = 'won' AND created_at >= NOW() - INTERVAL '90 days')::numeric
              / COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '90 days') * 100, 1)
            ELSE 0 END AS win_rate,
          COALESCE(AVG(won_amount) FILTER (WHERE status = 'won'), 0)::int AS avg_deal_size,
          CASE WHEN EXTRACT(DAY FROM (NOW() - MIN(created_at) FILTER (WHERE status = 'won'))) > 0
            THEN ROUND(COUNT(*) FILTER (WHERE status = 'won')::numeric
              / GREATEST(EXTRACT(DAY FROM (NOW() - MIN(created_at) FILTER (WHERE status = 'won'))), 1), 1)
            ELSE 0 END AS deals_per_day
        FROM leads
      `),

      // 9. Quarterly goals (agent counts, policy counts)
      pool.query(`
        SELECT
          (SELECT COUNT(*)::int FROM users WHERE role IN ('sales_agent', 'agency_manager')) AS active_agents,
          (SELECT COUNT(*)::int FROM users WHERE role IN ('sales_agent', 'agency_manager') AND created_at >= date_trunc('month', NOW())) AS new_agents_this_month,
          (SELECT COUNT(*)::int FROM policies) AS total_policies,
          (SELECT COUNT(*)::int FROM policies WHERE created_at >= date_trunc('quarter', NOW())) AS policies_this_quarter
      `),
    ]);

    // Parse org metrics
    const om = orgMetricsResult.rows[0] || {};
    const goals = quarterlyGoalsResult.rows[0] || {};
    const velocity = velocityResult.rows[0] || {};
    const compliance = complianceResult.rows[0] || {};

    const revenueGrowth = om.revenue_last_month > 0
      ? Math.round(((om.revenue_this_month - om.revenue_last_month) / om.revenue_last_month) * 100)
      : 0;

    const conversionRate = om.leads_90d > 0
      ? Math.round((om.won_90d / om.leads_90d) * 1000) / 10
      : 0;

    // Build revenue by product with percentages and colors
    const productColors = ['#ea580c', '#b91c1c', '#f59e0b', '#f97316', '#dc2626', '#92400e'];
    const totalProductRevenue = revenueByProductResult.rows.reduce((s: number, r: any) => s + Number(r.revenue), 0);
    const revenueByProduct = revenueByProductResult.rows.map((r: any, i: number) => ({
      product: r.product,
      revenue: Number(r.revenue),
      percentage: totalProductRevenue > 0 ? Math.round((Number(r.revenue) / totalProductRevenue) * 100) : 0,
      color: productColors[i] || productColors[0],
    }));

    // Map teams with team names
    const teamNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel', 'India', 'Juliet'];
    const teams = teamsResult.rows.map((r: any, i: number) => ({
      id: r.manager_id,
      name: `Team ${teamNames[i] || i + 1}`,
      manager: r.manager_name,
      agents: Number(r.agent_count),
      revenue: Number(r.revenue),
      pipeline: Number(r.pipeline),
      conversion: Number(r.conversion),
      status: Number(r.conversion) >= 20 ? 'on-track' : Number(r.conversion) >= 15 ? 'at-risk' : 'behind',
    }));

    // Map activity types
    const activityTypeMap: Record<string, string> = {
      status_change: 'deal',
      note: 'milestone',
      call: 'deal',
      email: 'deal',
      assignment: 'hire',
      created: 'deal',
    };
    const recentActivity = recentActivityResult.rows.map((r: any) => ({
      id: r.id,
      type: activityTypeMap[r.type] || 'deal',
      message: r.message || `Activity by ${r.actor}`,
      time: formatTimeAgo(new Date(r.time)),
      team: r.actor,
    }));

    // Agent statuses for activity pulse
    const agentStatuses = agentStatusesResult.rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      status: r.status,
    }));

    const activeCount = agentStatuses.filter((a: any) => a.status === 'active').length;

    // Quarterly progress
    const quarterlyTarget = 2200000; // TODO: make configurable
    const quarterlyActual = Number(om.total_revenue) || 0;
    const quarterlyProgress = quarterlyTarget > 0 ? Math.round((quarterlyActual / quarterlyTarget) * 100) : 0;

    // Retention rate (policies without chargebacks)
    const retentionRate = 96; // placeholder until chargeback tracking is populated

    res.json({
      orgMetrics: {
        totalRevenue: Number(om.total_revenue) || 0,
        revenueGrowth,
        pipelineValue: Number(om.pipeline_value) || 0,
        pipelineGrowth: 0, // requires historical data
        activeAgents: Number(goals.active_agents) || 0,
        newAgentsThisMonth: Number(goals.new_agents_this_month) || 0,
        conversionRate,
        conversionTarget: 25,
        retentionRate,
        retentionTarget: 97,
        avgDealSize: Number(om.avg_deal_size) || 0,
        quarterlyTarget,
        quarterlyActual,
        quarterlyProgress,
      },
      teams,
      topPerformers: topPerformersResult.rows.map((r: any, i: number) => ({
        id: r.id,
        name: r.name,
        role: r.title || r.role,
        team: teams[i % teams.length]?.name || 'Unassigned',
        revenue: Number(r.revenue),
        deals: Number(r.deals),
        trend: r.trend,
      })),
      revenueByProduct,
      salesVelocity: {
        avgDaysToClose: Number(velocity.avg_days_to_close) || 0,
        winRate: Number(velocity.win_rate) || 0,
        avgDealSize: Number(velocity.avg_deal_size) || 0,
        dealsPerDay: Number(velocity.deals_per_day) || 0,
      },
      recentActivity,
      compliance: {
        validLicenses: Number(compliance.valid_licenses) || 0,
        expiringSoon: Number(compliance.expiring_soon) || 0,
        expired: Number(compliance.expired) || 0,
        totalLicenses: Number(compliance.total_licenses) || 0,
      },
      agentStatuses,
      quarterlyGoals: [
        {
          label: 'Revenue',
          current: quarterlyActual,
          target: quarterlyTarget,
          progress: quarterlyProgress,
        },
        {
          label: 'New Policies',
          current: Number(goals.policies_this_quarter) || 0,
          target: 150,
          progress: Math.min(Math.round(((Number(goals.policies_this_quarter) || 0) / 150) * 100), 100),
        },
        {
          label: 'Agent Hiring',
          current: Number(goals.new_agents_this_month) || 0,
          target: 12,
          progress: Math.min(Math.round(((Number(goals.new_agents_this_month) || 0) / 12) * 100), 100),
        },
        {
          label: 'Retention Rate',
          current: retentionRate,
          target: 97,
          progress: Math.min(Math.round((retentionRate / 97) * 100), 100),
        },
      ],
    });
  } catch (error) {
    console.error("Executive dashboard error:", error);
    res.status(500).json({ error: "Failed to load executive dashboard" });
  }
});

// =============================================================================
// GET /api/executive/commissions — Commission summary
// =============================================================================
router.get("/commissions", async (req: Request, res: Response) => {
  try {
    const [summaryResult, byAgentResult, recentResult] = await Promise.all([
      pool.query(`
        SELECT
          COALESCE(SUM(CAST(amount AS DECIMAL)) FILTER (WHERE status = 'paid'), 0)::numeric AS total_paid,
          COALESCE(SUM(CAST(amount AS DECIMAL)) FILTER (WHERE status = 'pending'), 0)::numeric AS total_pending,
          COALESCE(SUM(CAST(amount AS DECIMAL)) FILTER (WHERE commission_type = 'override'), 0)::numeric AS total_overrides,
          COALESCE(SUM(CAST(amount AS DECIMAL)) FILTER (WHERE chargeback_at IS NOT NULL), 0)::numeric AS total_chargebacks,
          COUNT(*) FILTER (WHERE status = 'paid')::int AS paid_count,
          COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_count,
          COUNT(*)::int AS total_count
        FROM commissions
      `),
      pool.query(`
        SELECT
          u.id,
          u.first_name || ' ' || u.last_name AS name,
          COALESCE(SUM(CAST(c.amount AS DECIMAL)), 0)::numeric AS total_earned,
          COUNT(*)::int AS deal_count,
          COALESCE(SUM(CAST(c.amount AS DECIMAL)) FILTER (WHERE c.commission_type = 'override'), 0)::numeric AS override_earned
        FROM commissions c
        JOIN users u ON c.agent_user_id = u.id
        GROUP BY u.id, u.first_name, u.last_name
        ORDER BY total_earned DESC
        LIMIT 20
      `),
      pool.query(`
        SELECT
          c.id,
          u.first_name || ' ' || u.last_name AS agent_name,
          c.commission_type,
          CAST(c.amount AS DECIMAL)::numeric AS amount,
          c.status,
          c.earned_at,
          c.paid_at
        FROM commissions c
        JOIN users u ON c.agent_user_id = u.id
        ORDER BY c.created_at DESC
        LIMIT 20
      `),
    ]);

    const summary = summaryResult.rows[0] || {};

    res.json({
      summary: {
        totalPaid: Number(summary.total_paid) || 0,
        totalPending: Number(summary.total_pending) || 0,
        totalOverrides: Number(summary.total_overrides) || 0,
        totalChargebacks: Number(summary.total_chargebacks) || 0,
        paidCount: Number(summary.paid_count) || 0,
        pendingCount: Number(summary.pending_count) || 0,
        totalCount: Number(summary.total_count) || 0,
      },
      byAgent: byAgentResult.rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        totalEarned: Number(r.total_earned),
        dealCount: Number(r.deal_count),
        overrideEarned: Number(r.override_earned),
      })),
      recent: recentResult.rows.map((r: any) => ({
        id: r.id,
        agentName: r.agent_name,
        type: r.commission_type,
        amount: Number(r.amount),
        status: r.status,
        earnedAt: r.earned_at,
        paidAt: r.paid_at,
      })),
    });
  } catch (error) {
    console.error("Executive commissions error:", error);
    res.status(500).json({ error: "Failed to load commission data" });
  }
});

// =============================================================================
// GET /api/executive/kpis — Key Performance Indicators
// =============================================================================
router.get("/kpis", async (req: Request, res: Response) => {
  try {
    const [leadsResult, callsResult, licensesResult] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)::int AS total_leads,
          COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW()))::int AS leads_this_month,
          COUNT(*) FILTER (WHERE status = 'won')::int AS won_leads,
          COUNT(*) FILTER (WHERE status = 'won' AND won_date >= date_trunc('month', NOW()))::int AS won_this_month,
          COALESCE(SUM(won_amount) FILTER (WHERE status = 'won'), 0)::int AS total_revenue,
          COALESCE(SUM(won_amount) FILTER (WHERE status = 'won' AND won_date >= date_trunc('month', NOW())), 0)::int AS revenue_this_month,
          COALESCE(SUM(CASE WHEN status NOT IN ('won', 'lost') THEN COALESCE(estimated_value, 0) ELSE 0 END), 0)::int AS pipeline_value,
          COALESCE(AVG(lead_score) FILTER (WHERE status NOT IN ('won', 'lost')), 0)::int AS avg_lead_score
        FROM leads
      `),
      pool.query(`
        SELECT
          COUNT(*)::int AS total_calls,
          COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW()))::int AS calls_this_month,
          COALESCE(AVG(duration), 0)::int AS avg_duration
        FROM call_recordings
      `),
      pool.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE expiry_date > NOW())::int AS valid,
          COUNT(*) FILTER (WHERE expiry_date <= NOW() + INTERVAL '30 days' AND expiry_date > NOW())::int AS expiring,
          COUNT(*) FILTER (WHERE expiry_date <= NOW())::int AS expired
        FROM agent_licenses
      `),
    ]);

    const leads = leadsResult.rows[0] || {};
    const calls = callsResult.rows[0] || {};
    const licenses = licensesResult.rows[0] || {};

    res.json({
      leads: {
        total: Number(leads.total_leads) || 0,
        thisMonth: Number(leads.leads_this_month) || 0,
        won: Number(leads.won_leads) || 0,
        wonThisMonth: Number(leads.won_this_month) || 0,
        totalRevenue: Number(leads.total_revenue) || 0,
        revenueThisMonth: Number(leads.revenue_this_month) || 0,
        pipelineValue: Number(leads.pipeline_value) || 0,
        avgLeadScore: Number(leads.avg_lead_score) || 0,
      },
      calls: {
        total: Number(calls.total_calls) || 0,
        thisMonth: Number(calls.calls_this_month) || 0,
        avgDuration: Number(calls.avg_duration) || 0,
      },
      licenses: {
        total: Number(licenses.total) || 0,
        valid: Number(licenses.valid) || 0,
        expiring: Number(licenses.expiring) || 0,
        expired: Number(licenses.expired) || 0,
      },
    });
  } catch (error) {
    console.error("Executive KPIs error:", error);
    res.status(500).json({ error: "Failed to load KPI data" });
  }
});

// =============================================================================
// HELPERS
// =============================================================================
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default router;
