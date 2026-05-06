import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, FOUNDERS_ONLY } from "../middleware/auth";
import { DEMO_FALLBACK_ENABLED, demoDashboardActivity } from "../services/foundersDemoData";

const router = Router();

/**
 * GET /api/founders/dashboard
 * Aggregator for the Founders Lounge home. Parallel Promise.all over every
 * cockpit-relevant table — deals, commissions, hierarchy, users, activity,
 * board decisions, M&A pipeline, and founder audit log.
 * Shaped for FoundersDashboard.tsx.
 */
router.get("/dashboard", requireAuth, requireRole(...FOUNDERS_ONLY), async (_req, res) => {
  try {
    const now = new Date();
    const ytdStart = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
    const mtdStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const today = now.toISOString().split("T")[0];

    const [
      dealsMtd,
      dealsYtd,
      dealsPending,
      dealsIssued,
      commissionTotals,
      hierarchyCount,
      roleDistribution,
      recentActivity,
      boardPending,
      boardEmergency,
      maStageCounts,
      maHighPriority,
      founderAudit,
    ] = await Promise.all([
      // MTD AP
      pool.query(
        `SELECT COALESCE(SUM(annual_premium::numeric), 0)::numeric(14,2) as total,
                COUNT(*)::int as count
         FROM deals WHERE created_at >= $1 AND created_at <= $2`,
        [mtdStart, today]
      ),
      // YTD AP
      pool.query(
        `SELECT COALESCE(SUM(annual_premium::numeric), 0)::numeric(14,2) as total,
                COUNT(*)::int as count
         FROM deals WHERE created_at >= $1 AND created_at <= $2`,
        [ytdStart, today]
      ),
      // Pending deals
      pool.query(
        `SELECT COUNT(*)::int as count,
                COALESCE(SUM(annual_premium::numeric), 0)::numeric(14,2) as total
         FROM deals WHERE status = 'submitted'`
      ),
      // Issued AP (YTD)
      pool.query(
        `SELECT COALESCE(SUM(annual_premium::numeric), 0)::numeric(14,2) as total,
                COUNT(*)::int as count
         FROM deals
         WHERE status IN ('verified', 'issued')
           AND created_at >= $1 AND created_at <= $2`,
        [ytdStart, today]
      ),
      // Commission payouts YTD
      pool.query(
        `SELECT COALESCE(SUM(commission_amount::numeric), 0)::numeric(14,2) as total,
                COALESCE(SUM(CASE WHEN commission_type = 'override' THEN commission_amount::numeric ELSE 0 END), 0)::numeric(14,2) as override_total,
                COUNT(*)::int as count
         FROM commission_records
         WHERE created_at >= $1 AND created_at <= $2`,
        [ytdStart, today]
      ),
      // Active team count (distinct agents in active hierarchy)
      pool.query(
        `SELECT COUNT(DISTINCT agent_user_id)::int as count
         FROM agent_hierarchy
         WHERE effective_to IS NULL OR effective_to > NOW()`
      ),
      // Role distribution
      pool.query(
        `SELECT role, COUNT(*)::int as count
         FROM users
         WHERE is_active = true
         GROUP BY role
         ORDER BY count DESC`
      ),
      // Top 20 lead_activities events (cross-brand signal)
      pool.query(
        `SELECT id, lead_id, type AS activity_type, description, created_at, performed_by AS user_id
         FROM lead_activities
         ORDER BY created_at DESC
         LIMIT 20`
      ),
      // Board decisions — proposed/pending
      pool.query(
        `SELECT COUNT(*)::int as count
         FROM board_decisions WHERE status = 'proposed'`
      ),
      // Emergency-flagged decisions still active
      pool.query(
        `SELECT COUNT(*)::int as count
         FROM board_decisions
         WHERE emergency = true
           AND status NOT IN ('reversed', 'rejected')`
      ),
      // M&A pipeline counts by stage
      pool.query(
        `SELECT stage, COUNT(*)::int as count,
                COALESCE(SUM(deal_value_cents), 0)::bigint as value_cents
         FROM ma_pipeline_items
         GROUP BY stage`
      ),
      // High-priority M&A items (health score >= 70 and not closed)
      pool.query(
        `SELECT id, target_name, kind, stage, health_score, next_action, next_action_date, deal_value_cents
         FROM ma_pipeline_items
         WHERE health_score >= 70
           AND stage NOT IN ('closed_won', 'closed_lost', 'on_ice')
         ORDER BY health_score DESC, updated_at DESC
         LIMIT 10`
      ),
      // Founder audit log — last 20 founder-authored events
      pool.query(
        `SELECT id, actor_user_id, action, entity_type, entity_id, brand, payload, viewing_as, created_at
         FROM founder_audit_log
         ORDER BY created_at DESC
         LIMIT 20`
      ),
    ]);

    const roleDist: Record<string, number> = {};
    for (const r of roleDistribution.rows) roleDist[r.role] = Number(r.count) || 0;

    const maByStage: Record<string, { count: number; valueCents: number }> = {};
    for (const r of maStageCounts.rows) {
      maByStage[r.stage] = {
        count: Number(r.count) || 0,
        valueCents: Number(r.value_cents) || 0,
      };
    }

    res.json({
      deals: {
        mtd: {
          total: Number(dealsMtd.rows[0]?.total) || 0,
          count: dealsMtd.rows[0]?.count || 0,
        },
        ytd: {
          total: Number(dealsYtd.rows[0]?.total) || 0,
          count: dealsYtd.rows[0]?.count || 0,
        },
        pending: {
          count: dealsPending.rows[0]?.count || 0,
          total: Number(dealsPending.rows[0]?.total) || 0,
        },
        issued: {
          count: dealsIssued.rows[0]?.count || 0,
          total: Number(dealsIssued.rows[0]?.total) || 0,
        },
      },
      commissions: {
        ytdTotal: Number(commissionTotals.rows[0]?.total) || 0,
        ytdOverrideTotal: Number(commissionTotals.rows[0]?.override_total) || 0,
        count: commissionTotals.rows[0]?.count || 0,
      },
      team: {
        activeCount: hierarchyCount.rows[0]?.count || 0,
        roleDistribution: roleDist,
      },
      activity: {
        recent: (DEMO_FALLBACK_ENABLED && recentActivity.rows.length === 0)
          ? demoDashboardActivity()
          : recentActivity.rows,
      },
      board: {
        pendingCount: boardPending.rows[0]?.count || 0,
        emergencyCount: boardEmergency.rows[0]?.count || 0,
      },
      partnerships: {
        byStage: maByStage,
        highPriority: maHighPriority.rows.map((r: any) => ({
          id: r.id,
          targetName: r.target_name,
          kind: r.kind,
          stage: r.stage,
          healthScore: r.health_score,
          nextAction: r.next_action,
          nextActionDate: r.next_action_date,
          dealValueCents: r.deal_value_cents ? Number(r.deal_value_cents) : null,
        })),
      },
      founderAudit: founderAudit.rows,
      generatedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error("Founders dashboard error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/founders/health
 * Lightweight liveness check used by the Founders shell to verify the
 * session is still founder-gated.
 */
router.get("/health", requireAuth, requireRole(...FOUNDERS_ONLY), (req, res) => {
  res.json({ ok: true, as: req.user?.email });
});

export default router;
