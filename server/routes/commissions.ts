/**
 * Commission Earnings API Routes
 * Provides agent's personal AP, override AP, YTD earnings, and monthly trends.
 * Reads from commission_records table (populated by commissionRecordService).
 * Falls back to policy-based calculations if no commission records exist yet.
 */
import { Router, Request, Response } from "express";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

// =============================================================================
// GET /my-earnings — Agent's commission earnings summary
// =============================================================================
router.get("/my-earnings", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Check if we have commission records
    const recordCheck = await pool.query(
      `SELECT COUNT(*)::int as count FROM commission_records WHERE agent_id = $1`,
      [userId]
    );
    const hasRecords = (recordCheck.rows[0]?.count || 0) > 0;

    let monthlyAp = 0;
    let overrideAp = 0;
    let ytdEarnings = 0;
    let policiesSold = 0;
    let overrideEarnings = 0;
    let monthlyApData: any[] | null = null;

    if (hasRecords) {
      // ═══ READ FROM COMMISSION RECORDS ═══

      // Personal AP this month
      const personalMonth = await pool.query(`
        SELECT COALESCE(SUM(premium_amount), 0)::float as ap
        FROM commission_records
        WHERE agent_id = $1
          AND commission_type = 'personal'
          AND period_month = $2
          AND period_year = $3
      `, [userId, currentMonth, currentYear]);
      monthlyAp = personalMonth.rows[0]?.ap || 0;

      // Override AP this month (policies where I received overrides)
      const overrideMonth = await pool.query(`
        SELECT COALESCE(SUM(premium_amount), 0)::float as ap
        FROM commission_records
        WHERE agent_id = $1
          AND commission_type = 'override'
          AND period_month = $2
          AND period_year = $3
      `, [userId, currentMonth, currentYear]);
      overrideAp = overrideMonth.rows[0]?.ap || 0;

      // YTD personal earnings
      const ytdPersonal = await pool.query(`
        SELECT COALESCE(SUM(commission_amount), 0)::float as earnings
        FROM commission_records
        WHERE agent_id = $1
          AND commission_type = 'personal'
          AND period_year = $2
      `, [userId, currentYear]);
      ytdEarnings = Math.round(ytdPersonal.rows[0]?.earnings || 0);

      // YTD override earnings
      const ytdOverride = await pool.query(`
        SELECT COALESCE(SUM(commission_amount), 0)::float as earnings
        FROM commission_records
        WHERE agent_id = $1
          AND commission_type = 'override'
          AND period_year = $2
      `, [userId, currentYear]);
      overrideEarnings = Math.round(ytdOverride.rows[0]?.earnings || 0);

      // Add override earnings to YTD total
      ytdEarnings += overrideEarnings;

      // Policies sold this year (count distinct policies where I'm the personal agent)
      const policyCount = await pool.query(`
        SELECT COUNT(DISTINCT policy_id)::int as count
        FROM commission_records
        WHERE agent_id = $1
          AND commission_type = 'personal'
          AND period_year = $2
      `, [userId, currentYear]);
      policiesSold = policyCount.rows[0]?.count || 0;

      // Monthly AP trend (last 6 months from commission records)
      const trend = await pool.query(`
        SELECT period_month as month_num,
               TO_CHAR(TO_DATE(period_month::text, 'MM'), 'Mon') as month,
               COALESCE(SUM(premium_amount), 0)::float as ap
        FROM commission_records
        WHERE agent_id = $1
          AND commission_type = 'personal'
          AND (period_year = $2 OR (period_year = $2 - 1 AND period_month > $3))
        GROUP BY period_year, period_month
        ORDER BY period_year, period_month
        LIMIT 6
      `, [userId, currentYear, currentMonth]);

      if (trend.rows.length > 0) {
        monthlyApData = trend.rows.map((r: any) => ({ month: r.month, ap: r.ap }));
      }

    } else {
      // ═══ FALLBACK: CALCULATE FROM POLICIES + DEALS TABLES ═══

      // Personal AP this month from policies
      const policyMonthly = await pool.query(`
        SELECT COALESCE(SUM(monthly_premium * 12), 0)::float as ap, COUNT(*)::int as cnt
        FROM policies WHERE agent_id = $1
          AND EXTRACT(MONTH FROM start_date) = $2 AND EXTRACT(YEAR FROM start_date) = $3
      `, [userId, currentMonth, currentYear]);

      // Personal AP this month from deals
      const dealMonthly = await pool.query(`
        SELECT COALESCE(SUM(annual_premium::numeric), 0)::float as ap, COUNT(*)::int as cnt
        FROM deals WHERE agent_user_id = $1 AND status != 'rejected'
          AND EXTRACT(MONTH FROM submitted_at) = $2 AND EXTRACT(YEAR FROM submitted_at) = $3
      `, [userId, currentMonth, currentYear]);

      monthlyAp = (policyMonthly.rows[0]?.ap || 0) + (dealMonthly.rows[0]?.ap || 0);

      // YTD AP from both sources
      const policyYtd = await pool.query(`
        SELECT COALESCE(SUM(monthly_premium * 12), 0)::float as ap, COUNT(*)::int as cnt
        FROM policies WHERE agent_id = $1 AND EXTRACT(YEAR FROM start_date) = $2
      `, [userId, currentYear]);

      const dealYtd = await pool.query(`
        SELECT COALESCE(SUM(annual_premium::numeric), 0)::float as ap, COUNT(*)::int as cnt
        FROM deals WHERE agent_user_id = $1 AND status != 'rejected' AND EXTRACT(YEAR FROM submitted_at) = $2
      `, [userId, currentYear]);

      const ytdAp = (policyYtd.rows[0]?.ap || 0) + (dealYtd.rows[0]?.ap || 0);
      policiesSold = (policyYtd.rows[0]?.cnt || 0) + (dealYtd.rows[0]?.cnt || 0);

      // Get contract level for earnings estimate
      const hierarchyResult = await pool.query(`
        SELECT contract_level FROM agent_hierarchy
        WHERE agent_user_id = $1 AND effective_to IS NULL LIMIT 1
      `, [userId]);
      const contractLevel = parseFloat(hierarchyResult.rows[0]?.contract_level || '80');
      ytdEarnings = Math.round(ytdAp * (contractLevel / 100));

      // Override AP from direct downlines (policies + deals)
      const overridePolicies = await pool.query(`
        SELECT COALESCE(SUM(p.monthly_premium * 12), 0)::float as ap
        FROM policies p
        JOIN agent_hierarchy h ON p.agent_id = h.agent_user_id AND h.effective_to IS NULL
        WHERE h.direct_upline_id = $1
          AND EXTRACT(MONTH FROM p.start_date) = $2 AND EXTRACT(YEAR FROM p.start_date) = $3
      `, [userId, currentMonth, currentYear]);

      const overrideDeals = await pool.query(`
        SELECT COALESCE(SUM(d.annual_premium::numeric), 0)::float as ap
        FROM deals d
        JOIN agent_hierarchy h ON d.agent_user_id = h.agent_user_id AND h.effective_to IS NULL
        WHERE h.direct_upline_id = $1 AND d.status != 'rejected'
          AND EXTRACT(MONTH FROM d.submitted_at) = $2 AND EXTRACT(YEAR FROM d.submitted_at) = $3
      `, [userId, currentMonth, currentYear]);

      overrideAp = (overridePolicies.rows[0]?.ap || 0) + (overrideDeals.rows[0]?.ap || 0);

      // Override earnings estimate (spread-based)
      const overrideEarningsPolicies = await pool.query(`
        SELECT COALESCE(SUM(
          (p.monthly_premium * 12) * GREATEST(($2 - COALESCE(h.contract_level, 65)), 0) / 100.0
        ), 0)::float as earnings
        FROM policies p
        JOIN agent_hierarchy h ON p.agent_id = h.agent_user_id AND h.effective_to IS NULL
        WHERE h.direct_upline_id = $1 AND EXTRACT(YEAR FROM p.start_date) = $3
      `, [userId, contractLevel, currentYear]);

      const overrideEarningsDeals = await pool.query(`
        SELECT COALESCE(SUM(
          (d.annual_premium::numeric) * GREATEST(($2 - COALESCE(h.contract_level, 65)), 0) / 100.0
        ), 0)::float as earnings
        FROM deals d
        JOIN agent_hierarchy h ON d.agent_user_id = h.agent_user_id AND h.effective_to IS NULL
        WHERE h.direct_upline_id = $1 AND d.status != 'rejected' AND EXTRACT(YEAR FROM d.submitted_at) = $3
      `, [userId, contractLevel, currentYear]);

      overrideEarnings = Math.round(
        (overrideEarningsPolicies.rows[0]?.earnings || 0) + (overrideEarningsDeals.rows[0]?.earnings || 0)
      );

      // Monthly AP trend from policies + deals combined
      const trendResult = await pool.query(`
        SELECT month, SUM(ap)::float as ap FROM (
          SELECT TO_CHAR(start_date, 'Mon') as month,
                 EXTRACT(YEAR FROM start_date) as yr, EXTRACT(MONTH FROM start_date) as mo,
                 COALESCE(SUM(monthly_premium * 12), 0) as ap
          FROM policies WHERE agent_id = $1 AND start_date >= NOW() - INTERVAL '6 months'
          GROUP BY yr, mo, month
          UNION ALL
          SELECT TO_CHAR(submitted_at, 'Mon') as month,
                 EXTRACT(YEAR FROM submitted_at) as yr, EXTRACT(MONTH FROM submitted_at) as mo,
                 COALESCE(SUM(annual_premium::numeric), 0) as ap
          FROM deals WHERE agent_user_id = $1 AND status != 'rejected' AND submitted_at >= NOW() - INTERVAL '6 months'
          GROUP BY yr, mo, month
        ) combined
        GROUP BY month, yr, mo
        ORDER BY yr, mo
      `, [userId]);
      if (trendResult.rows.length > 0) {
        monthlyApData = trendResult.rows.map((r: any) => ({ month: r.month, ap: r.ap }));
      }
    }

    res.json({
      monthlyAp,
      overrideAp,
      ytdEarnings,
      policiesSold,
      overrideEarnings,
      monthlyApData,
    });
  } catch (error: any) {
    console.error("[Commissions] Error fetching earnings:", error?.message);
    res.status(500).json({ error: "Failed to fetch commission data" });
  }
});

// =============================================================================
// GET /performance — Detailed performance data (pending/paid/product breakdown)
// =============================================================================
router.get("/performance", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const period = (req.query.period as string) || "year";
    const now = new Date();
    let periodStart: Date;
    switch (period) {
      case "week":
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case "month":
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter": {
        const qMonth = Math.floor(now.getMonth() / 3) * 3;
        periodStart = new Date(now.getFullYear(), qMonth, 1);
        break;
      }
      default: // year
        periodStart = new Date(now.getFullYear(), 0, 1);
    }
    const periodStartISO = periodStart.toISOString();
    const currentYear = now.getFullYear();

    // Pending commissions (deals submitted but not verified)
    const pendingResult = await pool.query(`
      SELECT COALESCE(SUM(annual_premium::numeric), 0)::float as total, COUNT(*)::int as count
      FROM deals WHERE agent_user_id = $1 AND status = 'submitted'
        AND submitted_at >= $2
    `, [userId, periodStartISO]);

    // Paid/verified commissions (verified deals + active policies)
    const paidDeals = await pool.query(`
      SELECT COALESCE(SUM(annual_premium::numeric), 0)::float as total, COUNT(*)::int as count
      FROM deals WHERE agent_user_id = $1 AND status = 'verified'
        AND submitted_at >= $2
    `, [userId, periodStartISO]);

    const paidPolicies = await pool.query(`
      SELECT COALESCE(SUM(monthly_premium * 12), 0)::float as total, COUNT(*)::int as count
      FROM policies WHERE agent_id = $1 AND status = 'active'
        AND start_date >= $2
    `, [userId, periodStartISO]);

    const pendingTotal = pendingResult.rows[0]?.total || 0;
    const pendingCount = pendingResult.rows[0]?.count || 0;
    const paidTotal = (paidDeals.rows[0]?.total || 0) + (paidPolicies.rows[0]?.total || 0);
    const paidCount = (paidDeals.rows[0]?.count || 0) + (paidPolicies.rows[0]?.count || 0);

    // Get agent contract level for commission calculation
    const hierarchyResult = await pool.query(`
      SELECT contract_level FROM agent_hierarchy
      WHERE agent_user_id = $1 AND effective_to IS NULL LIMIT 1
    `, [userId]);
    const contractLevel = parseFloat(hierarchyResult.rows[0]?.contract_level || '80') / 100;

    // Total AP for period
    const ytdAp = await pool.query(`
      SELECT COALESCE(SUM(ap), 0)::float as total FROM (
        SELECT SUM(annual_premium::numeric) as ap FROM deals
          WHERE agent_user_id = $1 AND status != 'rejected' AND submitted_at >= $2
        UNION ALL
        SELECT SUM(monthly_premium * 12) as ap FROM policies
          WHERE agent_id = $1 AND start_date >= $2
      ) combined
    `, [userId, periodStartISO]);
    const ytdTotal = ytdAp.rows[0]?.total || 0;

    // Product breakdown from deals + policies (by product type, not carrier)
    // Only includes entries with a valid product type — excludes null/Other
    const productBreakdown = await pool.query(`
      SELECT type as product,
             COALESCE(SUM(ap), 0)::float as amount,
             COUNT(*)::int as policies
      FROM (
        SELECT p.type, (p.monthly_premium * 12)::numeric as ap
        FROM policies p WHERE p.agent_id = $1 AND p.start_date >= $2
          AND p.type IS NOT NULL AND p.type != '' AND p.type != 'Pending'
        UNION ALL
        SELECT d.product_type as type, d.annual_premium::numeric as ap
        FROM deals d WHERE d.agent_user_id = $1 AND d.status != 'rejected' AND d.submitted_at >= $2
          AND d.product_type IS NOT NULL AND d.product_type != ''
      ) combined
      GROUP BY type
      ORDER BY amount DESC
    `, [userId, periodStartISO]);

    const totalProductAp = productBreakdown.rows.reduce((s: number, r: any) => s + r.amount, 0);
    const PRODUCT_COLORS = ['bg-purple-500', 'bg-green-500', 'bg-blue-500', 'bg-orange-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
    const products = productBreakdown.rows.map((r: any, i: number) => ({
      product: r.product,
      amount: Math.round(r.amount),
      percent: totalProductAp > 0 ? Math.round((r.amount / totalProductAp) * 100) : 0,
      color: PRODUCT_COLORS[i % PRODUCT_COLORS.length],
      policies: r.policies,
      avgPremium: r.policies > 0 ? Math.round(r.amount / r.policies) : 0,
      avgCommission: r.policies > 0 ? Math.round((r.amount * contractLevel) / r.policies) : 0,
    }));

    // Recent commissions (last 20 from deals + policies)
    const recentResult = await pool.query(`
      SELECT * FROM (
        SELECT d.id, d.client_name, d.carrier as product, d.annual_premium::float as amount,
               d.status, d.submitted_at as date, 'deal' as source
        FROM deals d WHERE d.agent_user_id = $1 AND d.submitted_at >= $2
        UNION ALL
        SELECT p.id, u.first_name || ' ' || u.last_name as client_name, p.type as product,
               (p.monthly_premium * 12)::float as amount, p.status, p.start_date as date, 'policy' as source
        FROM policies p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.agent_id = $1 AND p.start_date >= $2
      ) combined
      ORDER BY date DESC
      LIMIT 20
    `, [userId, periodStartISO]);

    const recentCommissions = recentResult.rows.map((r: any) => ({
      id: r.id,
      clientName: r.client_name || 'Client',
      product: r.product || 'Policy',
      amount: Math.round(r.amount || 0),
      premiumAmount: r.amount || 0,
      status: r.status === 'verified' || r.status === 'active' ? 'paid' : r.status === 'rejected' ? 'clawback' : 'pending',
      date: r.date,
      source: r.source,
    }));

    // Monthly earnings trend (commissions, not AP)
    const trendInterval = period === 'week' ? '2 months' : period === 'month' ? '6 months' : period === 'quarter' ? '6 months' : '12 months';
    const monthlyTrend = await pool.query(`
      SELECT month, ROUND(SUM(ap))::float as amount FROM (
        SELECT TO_CHAR(submitted_at, 'Mon') as month,
               EXTRACT(YEAR FROM submitted_at) as yr, EXTRACT(MONTH FROM submitted_at) as mo,
               SUM(annual_premium::numeric) as ap
        FROM deals WHERE agent_user_id = $1 AND status != 'rejected' AND submitted_at >= NOW() - INTERVAL '${trendInterval}'
        GROUP BY yr, mo, month
        UNION ALL
        SELECT TO_CHAR(start_date, 'Mon') as month,
               EXTRACT(YEAR FROM start_date) as yr, EXTRACT(MONTH FROM start_date) as mo,
               SUM(monthly_premium * 12) as ap
        FROM policies WHERE agent_id = $1 AND start_date >= NOW() - INTERVAL '${trendInterval}'
        GROUP BY yr, mo, month
      ) combined
      GROUP BY month, yr, mo
      ORDER BY yr, mo
    `, [userId]);

    res.json({
      pending: { count: pendingCount, total: Math.round(pendingTotal) },
      paid: { count: paidCount, total: Math.round(paidTotal) },
      clawback: { count: 0, total: 0 },
      netTotal: Math.round(pendingTotal + paidTotal),
      ytd: Math.round(ytdTotal),
      productBreakdown: products.length > 0 ? products : null,
      recentCommissions: recentCommissions.length > 0 ? recentCommissions : null,
      monthlyTrend: monthlyTrend.rows.length > 0
        ? monthlyTrend.rows.map((r: any) => ({ month: r.month, amount: r.amount || 0 }))
        : null,
    });
  } catch (error: any) {
    console.error("[Commissions] Performance error:", error?.message);
    res.status(500).json({ error: "Failed to fetch performance data" });
  }
});

// =============================================================================
// GET /pipeline-stats — Real pipeline stage counts, conversion rates, avg age
// =============================================================================
router.get("/pipeline-stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const period = (req.query.period as string) || "month";
    const now = new Date();
    let periodStart: Date;
    switch (period) {
      case "week":
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case "month":
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter": {
        const qMonth = Math.floor(now.getMonth() / 3) * 3;
        periodStart = new Date(now.getFullYear(), qMonth, 1);
        break;
      }
      default:
        periodStart = new Date(now.getFullYear(), 0, 1);
    }
    const periodStartISO = periodStart.toISOString();

    // Count leads by pipeline_stage with avg age in days
    const stageResult = await pool.query(`
      SELECT pipeline_stage,
             COUNT(*)::int as count,
             COALESCE(AVG(EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400), 0)::int as avg_age
      FROM leads
      WHERE (assigned_to = $1 OR distributed_to = $1)
        AND created_at >= $2
        AND pipeline_stage IS NOT NULL
      GROUP BY pipeline_stage
      ORDER BY CASE pipeline_stage
        WHEN 'new' THEN 1 WHEN 'contacted' THEN 2 WHEN 'qualified' THEN 3
        WHEN 'appointment_set' THEN 4 WHEN 'quoted' THEN 5 WHEN 'application' THEN 6
        WHEN 'underwriting' THEN 7 WHEN 'issued' THEN 8 WHEN 'placed' THEN 9
        WHEN 'lost' THEN 10 ELSE 11
      END
    `, [userId, periodStartISO]);

    // Conversion rates: for each stage, what % moved to a later stage
    const conversionResult = await pool.query(`
      SELECT pipeline_stage,
             COUNT(*)::int as total,
             COUNT(*) FILTER (WHERE status = 'won' OR pipeline_stage IN ('placed', 'issued'))::int as advanced
      FROM leads
      WHERE (assigned_to = $1 OR distributed_to = $1)
        AND created_at >= $2
        AND pipeline_stage IS NOT NULL
      GROUP BY pipeline_stage
    `, [userId, periodStartISO]);

    const conversionMap: Record<string, number> = {};
    for (const row of conversionResult.rows) {
      conversionMap[row.pipeline_stage] = row.total > 0
        ? Math.round((row.advanced / row.total) * 100)
        : 0;
    }

    // Avg deal value from deals table
    const avgDealResult = await pool.query(`
      SELECT COALESCE(AVG(annual_premium::numeric), 0)::float as avg_deal_value
      FROM deals
      WHERE agent_user_id = $1 AND status != 'rejected' AND submitted_at >= $2
    `, [userId, periodStartISO]);
    const avgDealValue = Math.round(avgDealResult.rows[0]?.avg_deal_value || 0);

    const stages = stageResult.rows.map((r: any) => ({
      stage: r.pipeline_stage,
      count: r.count,
      avgAge: r.avg_age,
      conversionRate: conversionMap[r.pipeline_stage] ?? 0,
    }));

    const totalPipelineValue = stages
      .filter((s: any) => !['placed', 'lost'].includes(s.stage))
      .reduce((sum: number, s: any) => sum + s.count * avgDealValue, 0);

    res.json({ stages, avgDealValue, totalPipelineValue });
  } catch (error: any) {
    console.error("[Commissions] Pipeline stats error:", error?.message);
    res.status(500).json({ error: "Failed to fetch pipeline stats" });
  }
});

// =============================================================================
// GET /lead-source-roi — Lead source breakdown with conversion + revenue
// =============================================================================
router.get("/lead-source-roi", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const period = (req.query.period as string) || "month";
    const now = new Date();
    let periodStart: Date;
    switch (period) {
      case "week":
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case "month":
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter": {
        const qMonth = Math.floor(now.getMonth() / 3) * 3;
        periodStart = new Date(now.getFullYear(), qMonth, 1);
        break;
      }
      default:
        periodStart = new Date(now.getFullYear(), 0, 1);
    }
    const periodStartISO = periodStart.toISOString();

    const SOURCE_COLORS: Record<string, string> = {
      'referral': 'bg-violet-500',
      'quote_form': 'bg-blue-500',
      'contact_form': 'bg-cyan-500',
      'phone': 'bg-green-500',
      'website': 'bg-amber-500',
      'social_media': 'bg-rose-500',
      'other': 'bg-gray-500',
    };

    const result = await pool.query(`
      SELECT source,
             COUNT(*)::int as leads,
             COUNT(*) FILTER (WHERE status = 'won')::int as conversions,
             COALESCE(SUM(won_amount) FILTER (WHERE status = 'won'), 0)::float as revenue
      FROM leads
      WHERE (assigned_to = $1 OR distributed_to = $1)
        AND created_at >= $2
      GROUP BY source
      ORDER BY conversions DESC, leads DESC
    `, [userId, periodStartISO]);

    const sources = result.rows.map((r: any) => ({
      source: r.source || 'Unknown',
      leads: r.leads,
      conversions: r.conversions,
      conversionRate: r.leads > 0 ? Math.round((r.conversions / r.leads) * 1000) / 10 : 0,
      revenue: Math.round(r.revenue),
      avgDealSize: r.conversions > 0 ? Math.round(r.revenue / r.conversions) : 0,
      color: SOURCE_COLORS[r.source] || 'bg-gray-500',
    }));

    res.json({ sources });
  } catch (error: any) {
    console.error("[Commissions] Lead source ROI error:", error?.message);
    res.status(500).json({ error: "Failed to fetch lead source ROI" });
  }
});

// =============================================================================
// GET /statements — Quarterly commission statements
// =============================================================================
router.get("/statements", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const limit = Math.min(parseInt(req.query.limit as string) || 4, 12);

    // Try commission_records first
    const recordCheck = await pool.query(
      `SELECT COUNT(*)::int as count FROM commission_records WHERE agent_id = $1`,
      [userId]
    );
    const hasRecords = (recordCheck.rows[0]?.count || 0) > 0;

    let statements: any[] = [];

    if (hasRecords) {
      const result = await pool.query(`
        SELECT period_year,
               CEIL(period_month / 3.0)::int as quarter,
               SUM(commission_amount)::float as total_amount,
               COUNT(DISTINCT COALESCE(policy_id, deal_id, id))::int as policy_count,
               MIN(created_at) as period_start
        FROM commission_records
        WHERE agent_id = $1
        GROUP BY period_year, CEIL(period_month / 3.0)
        ORDER BY period_year DESC, quarter DESC
        LIMIT $2
      `, [userId, limit]);

      statements = result.rows.map((r: any) => {
        const issueDate = new Date(r.period_year, r.quarter * 3, 10);
        return {
          period: `Q${r.quarter} ${r.period_year}`,
          date: issueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          amount: Math.round(r.total_amount),
          policyCount: r.policy_count,
        };
      });
    } else {
      // Fallback: compute from deals + policies grouped by quarter
      // Uses row-level UNION ALL with positional GROUP BY to avoid alias issues
      const result = await pool.query(`
        SELECT
          EXTRACT(YEAR FROM combined.dt)::int as yr,
          CEIL(EXTRACT(MONTH FROM combined.dt) / 3.0)::int as quarter,
          COALESCE(SUM(combined.ap), 0)::float as total_amount,
          COUNT(*)::int as policy_count
        FROM (
          SELECT submitted_at as dt, annual_premium::numeric as ap
          FROM deals
          WHERE agent_user_id = $1 AND status != 'rejected'
          UNION ALL
          SELECT start_date as dt, (monthly_premium * 12)::numeric as ap
          FROM policies
          WHERE agent_id = $1
        ) combined
        GROUP BY 1, 2
        ORDER BY 1 DESC, 2 DESC
        LIMIT $2
      `, [userId, limit]);

      // Get contract level for commission estimate
      const hierarchyResult = await pool.query(`
        SELECT contract_level FROM agent_hierarchy
        WHERE agent_user_id = $1 AND effective_to IS NULL LIMIT 1
      `, [userId]);
      const contractLevel = parseFloat(hierarchyResult.rows[0]?.contract_level || '80') / 100;

      statements = result.rows.map((r: any) => {
        const issueDate = new Date(r.yr, r.quarter * 3, 10);
        return {
          period: `Q${r.quarter} ${r.yr}`,
          date: issueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          amount: Math.round(r.total_amount * contractLevel),
          policyCount: r.policy_count,
        };
      });
    }

    res.json({ statements });
  } catch (error: any) {
    console.error("[Commissions] Statements error:", error?.message);
    res.status(500).json({ error: "Failed to fetch commission statements" });
  }
});

export default router;
