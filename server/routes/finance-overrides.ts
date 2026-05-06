import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, ADMIN_PLUS } from "../middleware/auth";
import { getDateRange } from "../utils/dateRange";
import { calculateWaterfallOverrides } from "../services/commissionWaterfallService";

const router = Router();

// GET /kpis?period= — Override KPIs from deals + hierarchy
router.get("/kpis", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { start, end } = getDateRange((req.query.period as string) || "ytd");

    const [apResult, chains, spreadResult, commissionResult] = await Promise.all([
      // Total AP for override estimation
      pool.query(
        `SELECT COALESCE(SUM(annual_premium::numeric), 0)::numeric(12,2) as total
         FROM deals WHERE created_at >= $1 AND created_at <= $2`,
        [start, end]
      ),
      // Active override chains
      pool.query(
        `SELECT COUNT(DISTINCT ah.agent_user_id)::int as count
         FROM agent_hierarchy ah
         WHERE ah.override_eligible = true
         AND (ah.effective_to IS NULL OR ah.effective_to > NOW())`
      ),
      // Average spread between upline and downline
      pool.query(
        `SELECT COALESCE(AVG(
           CASE WHEN upline.contract_level IS NOT NULL
                THEN upline.contract_level::numeric - ah.contract_level::numeric
                ELSE 0 END
         ), 0)::numeric(5,1) as avg_spread
         FROM agent_hierarchy ah
         LEFT JOIN agent_hierarchy upline
           ON upline.agent_user_id = ah.direct_upline_id
           AND (upline.effective_to IS NULL OR upline.effective_to > NOW())
         WHERE ah.effective_to IS NULL OR ah.effective_to > NOW()`
      ),
      // Actual override commissions from Heritage commission_records
      pool.query(
        `SELECT COALESCE(SUM(CASE WHEN commission_type = 'override' THEN commission_amount::numeric ELSE 0 END), 0)::numeric(12,2) as override_total
         FROM commission_records
         WHERE created_at >= $1 AND created_at <= $2`,
        [start, end]
      ),
    ]);

    const totalAP = Number(apResult.rows[0]?.total) || 0;
    const realOverride = Number(commissionResult.rows[0]?.override_total) || 0;

    res.json({
      overrideIncome: realOverride > 0 ? realOverride : Math.round(totalAP * 0.20),
      isEstimated: realOverride === 0,
      avgSpread: Number(spreadResult.rows[0]?.avg_spread) || 0,
      uniqueUplineChains: chains.rows[0]?.count || 0,
      pendingOverrides: 0,
    });
  } catch (e: any) {
    console.error("Finance overrides KPIs error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// GET /hierarchy-flow — Uses the actual waterfall service for accurate calculation
router.get("/hierarchy-flow", requireAuth, requireRole(...ADMIN_PLUS), async (_req, res) => {
  try {
    // Find the lowest-level agent to demonstrate the full chain
    const lowestAgent = await pool.query(
      `SELECT ah.agent_user_id
       FROM agent_hierarchy ah
       WHERE (ah.effective_to IS NULL OR ah.effective_to > NOW())
       ORDER BY ah.hierarchy_level DESC
       LIMIT 1`
    );

    if (lowestAgent.rows.length === 0) {
      return res.json({
        levels: [],
        totalPayout: 0,
        premiumAmount: 10000,
        isExample: true,
      });
    }

    // Use the actual waterfall service for accurate spread calculation
    const result = await calculateWaterfallOverrides(lowestAgent.rows[0].agent_user_id, 10000);

    res.json({
      levels: result.levels,
      totalPayout: result.totalPayout,
      premiumAmount: result.premiumAmount,
      isExample: false,
    });
  } catch (e: any) {
    console.error("Finance overrides hierarchy-flow error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// GET /history?period= — Deals with actual override data from commission_records
router.get("/history", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { start, end } = getDateRange((req.query.period as string) || "ytd");

    // Try Heritage commission_records first (actual override data)
    const commissionHistory = await pool.query(
      `SELECT cr.id, cr.created_at as "createdAt",
              CONCAT(u.first_name, ' ', u.last_name) as "agentName",
              cr.premium_amount::numeric(12,2) as amount,
              cr.override_spread::numeric(5,2) as spread,
              cr.commission_amount::numeric(12,2) as "overrideAmount",
              cr.commission_type as "overrideLevel",
              CONCAT(up.first_name, ' ', up.last_name) as "uplineName",
              'paid' as status
       FROM commission_records cr
       JOIN users u ON u.id = cr.agent_id
       LEFT JOIN users up ON up.id = cr.upline_agent_id
       WHERE cr.commission_type = 'override'
       AND cr.created_at >= $1 AND cr.created_at <= $2
       ORDER BY cr.created_at DESC
       LIMIT 50`,
      [start, end]
    );

    // If we have actual commission records, use those
    if (commissionHistory.rows.length > 0) {
      return res.json(commissionHistory.rows.map((r: any) => ({
        id: r.id,
        createdAt: r.createdAt,
        agentName: r.agentName,
        amount: Number(r.amount) || 0,
        spread: Number(r.spread) || 0,
        overrideLevel: r.overrideLevel || "override",
        uplineName: r.uplineName,
        status: r.status,
      })));
    }

    // Fallback: show deals with projected override from hierarchy
    const dealHistory = await pool.query(
      `SELECT d.id, d.created_at as "createdAt",
              CONCAT(u.first_name, ' ', u.last_name) as "agentName",
              d.annual_premium::numeric(12,2) as amount,
              d.carrier, d.status,
              ah.contract_level::numeric as agent_rate,
              ah.hierarchy_title as "overrideLevel",
              CONCAT(up.first_name, ' ', up.last_name) as "uplineName",
              upline_ah.contract_level::numeric as upline_rate
       FROM deals d
       JOIN users u ON u.id = d.agent_user_id
       LEFT JOIN agent_hierarchy ah ON ah.agent_user_id = d.agent_user_id
         AND (ah.effective_to IS NULL OR ah.effective_to > NOW())
       LEFT JOIN users up ON up.id = ah.direct_upline_id
       LEFT JOIN agent_hierarchy upline_ah ON upline_ah.agent_user_id = ah.direct_upline_id
         AND (upline_ah.effective_to IS NULL OR upline_ah.effective_to > NOW())
       WHERE d.created_at >= $1 AND d.created_at <= $2
       ORDER BY d.created_at DESC
       LIMIT 50`,
      [start, end]
    );

    res.json(dealHistory.rows.map((r: any) => {
      const agentRate = Number(r.agent_rate) || 80;
      const uplineRate = Number(r.upline_rate) || 0;
      const spread = uplineRate > 0 ? uplineRate - agentRate : 0;
      return {
        id: r.id,
        createdAt: r.createdAt,
        agentName: r.agentName,
        amount: Number(r.amount) || 0,
        spread,
        overrideLevel: r.overrideLevel || "Agent",
        uplineName: r.uplineName,
        status: r.status || "submitted",
      };
    }));
  } catch (e: any) {
    console.error("Finance overrides history error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
