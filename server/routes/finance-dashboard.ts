import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, ADMIN_PLUS } from "../middleware/auth";
import { getDateRange } from "../utils/dateRange";

const router = Router();

// GET /kpis?period= — Dashboard KPIs from deals + lead purchases + commission records
router.get("/kpis", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { start, end } = getDateRange((req.query.period as string) || "ytd");

    const [periodAP, ytdAP, activeAgents, pendingDeals, issuedAP, leadRevenue, commissionData] = await Promise.all([
      // AP submitted this period
      pool.query(
        `SELECT COALESCE(SUM(annual_premium::numeric), 0)::numeric(12,2) as total,
                COUNT(*)::int as deal_count
         FROM deals WHERE created_at >= $1 AND created_at <= $2`,
        [start, end]
      ),
      // YTD AP
      pool.query(
        `SELECT COALESCE(SUM(annual_premium::numeric), 0)::numeric(12,2) as total
         FROM deals WHERE created_at >= $1 AND created_at <= $2`,
        [new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0], new Date().toISOString().split("T")[0]]
      ),
      // Active agents
      pool.query(
        `SELECT COUNT(DISTINCT agent_user_id)::int as count
         FROM deals WHERE created_at >= $1 AND created_at <= $2`,
        [start, end]
      ),
      // Pending deals
      pool.query(
        `SELECT COUNT(*)::int as count,
                COALESCE(SUM(annual_premium::numeric), 0)::numeric(12,2) as total
         FROM deals WHERE status = 'submitted'`
      ),
      // Issued AP
      pool.query(
        `SELECT COALESCE(SUM(annual_premium::numeric), 0)::numeric(12,2) as total
         FROM deals WHERE status IN ('verified', 'issued')
         AND created_at >= $1 AND created_at <= $2`,
        [start, end]
      ),
      // Lead marketplace revenue (from Heritage lead_purchases)
      pool.query(
        `SELECT COALESCE(SUM(price_cents * quantity), 0)::int as total_cents,
                COUNT(*)::int as purchase_count
         FROM lead_purchases
         WHERE status IN ('completed', 'delivered', 'pending')
         AND created_at >= $1 AND created_at <= $2`,
        [start, end]
      ),
      // Commission records from Heritage
      pool.query(
        `SELECT COALESCE(SUM(commission_amount::numeric), 0)::numeric(12,2) as total,
                COALESCE(SUM(CASE WHEN commission_type = 'override' THEN commission_amount::numeric ELSE 0 END), 0)::numeric(12,2) as override_total
         FROM commission_records
         WHERE created_at >= $1 AND created_at <= $2`,
        [start, end]
      ),
    ]);

    const leadRevenueDollars = (Number(leadRevenue.rows[0]?.total_cents) || 0) / 100;

    res.json({
      apThisPeriod: Number(periodAP.rows[0]?.total) || 0,
      dealCount: periodAP.rows[0]?.deal_count || 0,
      apYTD: Number(ytdAP.rows[0]?.total) || 0,
      issuedAP: Number(issuedAP.rows[0]?.total) || 0,
      activeAgents: activeAgents.rows[0]?.count || 0,
      pendingDeals: pendingDeals.rows[0]?.count || 0,
      pendingAP: Number(pendingDeals.rows[0]?.total) || 0,
      leadRevenue: leadRevenueDollars,
      leadPurchases: leadRevenue.rows[0]?.purchase_count || 0,
      commissionTotal: Number(commissionData.rows[0]?.total) || 0,
      overrideTotal: Number(commissionData.rows[0]?.override_total) || 0,
    });
  } catch (e: any) { console.error("Finance dashboard error:", e.message); res.status(500).json({ error: e.message }); }
});

// GET /trends?period= — Monthly AP + lead revenue
router.get("/trends", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { start, end } = getDateRange((req.query.period as string) || "ytd");
    const result = await pool.query(
      `SELECT TO_CHAR(d.created_at, 'Mon ''') || TO_CHAR(d.created_at, 'YY') as label,
              COALESCE(SUM(d.annual_premium::numeric), 0)::numeric(12,2) as value
       FROM deals d
       WHERE d.created_at >= $1 AND d.created_at <= $2
       GROUP BY label, EXTRACT(YEAR FROM d.created_at), EXTRACT(MONTH FROM d.created_at)
       ORDER BY EXTRACT(YEAR FROM d.created_at), EXTRACT(MONTH FROM d.created_at)`,
      [start, end]
    );
    res.json(result.rows.map(r => ({ label: r.label, value: Number(r.value) })));
  } catch (e: any) { console.error("Finance dashboard error:", e.message); res.status(500).json({ error: e.message }); }
});

// GET /waterfall?period= — Revenue decomposition including lead revenue
router.get("/waterfall", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { start, end } = getDateRange((req.query.period as string) || "ytd");

    const [apResult, leadResult, commResult] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(annual_premium::numeric), 0)::numeric(12,2) as total
         FROM deals WHERE created_at >= $1 AND created_at <= $2`,
        [start, end]
      ),
      pool.query(
        `SELECT COALESCE(SUM(price_cents * quantity), 0)::int as total_cents
         FROM lead_purchases
         WHERE status IN ('completed', 'delivered', 'pending')
         AND created_at >= $1 AND created_at <= $2`,
        [start, end]
      ),
      pool.query(
        `SELECT COALESCE(SUM(CASE WHEN commission_type = 'override' THEN commission_amount::numeric ELSE 0 END), 0)::numeric(12,2) as override_total
         FROM commission_records WHERE created_at >= $1 AND created_at <= $2`,
        [start, end]
      ),
    ]);

    const grossAP = Number(apResult.rows[0]?.total) || 0;
    const leadRevenue = (Number(leadResult.rows[0]?.total_cents) || 0) / 100;
    const overrideIncome = Number(commResult.rows[0]?.override_total) || 0;
    const agentPortion = Number((grossAP * 0.80).toFixed(2));
    const agencyOverride = overrideIncome > 0 ? overrideIncome : Number((grossAP - agentPortion).toFixed(2));

    const waterfallData = [
      { label: "Gross AP Submitted", value: grossAP },
      { label: "Est. Agent Commission (~80%)", value: -agentPortion },
      { label: "Est. Agency Override", value: agencyOverride, isTotal: true },
    ];

    if (leadRevenue > 0) {
      waterfallData.push({ label: "Lead Marketplace Revenue", value: leadRevenue });
      waterfallData.push({ label: "Total Agency Income", value: agencyOverride + leadRevenue, isTotal: true });
    }

    res.json(waterfallData);
  } catch (e: any) { console.error("Finance dashboard error:", e.message); res.status(500).json({ error: e.message }); }
});

export default router;
