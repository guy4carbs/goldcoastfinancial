import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, ADMIN_PLUS } from "../middleware/auth";
import { getDateRange } from "../utils/dateRange";

const router = Router();

// GET /?period=&type= — Unified transaction stream: deals + lead purchases
router.get("/", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { start, end } = getDateRange((req.query.period as string) || "ytd");
    const typeFilter = req.query.type as string | undefined;

    // Build deal query
    let dealWhere = `WHERE d.created_at >= $1 AND d.created_at <= $2`;
    const params: string[] = [start, end];

    if (typeFilter && typeFilter !== "" && typeFilter !== "all") {
      if (typeFilter === "lead_purchase") {
        // Only show lead purchases — skip deals query
      } else if (typeFilter === "verified") {
        dealWhere += ` AND d.status IN ('verified', 'issued')`;
      } else if (typeFilter !== "lead_purchase") {
        params.push(typeFilter);
        dealWhere += ` AND d.status = $${params.length}`;
      }
    }

    const transactions: any[] = [];

    // Get deals (unless filtering only lead purchases)
    if (!typeFilter || typeFilter === "" || typeFilter === "all" || typeFilter !== "lead_purchase") {
      const dealResult = await pool.query(
        `SELECT d.id, d.created_at as date, d.status as type,
                CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''), ' — ', COALESCE(d.carrier, ''), ' (', COALESCE(d.product_type, ''), ')') as description,
                COALESCE(d.annual_premium::numeric(12,2), 0) as amount,
                COALESCE(d.id::text, 'N/A') as reference
         FROM deals d
         LEFT JOIN users u ON u.id = d.agent_user_id
         ${dealWhere}
         ORDER BY d.created_at DESC LIMIT 80`,
        params
      );
      dealResult.rows.forEach(r => transactions.push({
        id: r.id, date: r.date, type: r.type || "submitted",
        desc: r.description, amount: Number(r.amount) || 0, reference: r.reference,
      }));
    }

    // Get lead purchases (unless filtering a specific deal status)
    if (!typeFilter || typeFilter === "" || typeFilter === "all" || typeFilter === "lead_purchase") {
      const leadResult = await pool.query(
        `SELECT lp.id, lp.created_at as date, 'lead_purchase' as type,
                CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''), ' — ', lp.lead_type) as description,
                (lp.price_cents * lp.quantity)::numeric / 100 as amount,
                COALESCE(lp.stripe_payment_intent_id, lp.id::text) as reference
         FROM lead_purchases lp
         LEFT JOIN users u ON u.id = lp.agent_user_id
         WHERE lp.created_at >= $1 AND lp.created_at <= $2
         ORDER BY lp.created_at DESC LIMIT 20`,
        [start, end]
      );
      leadResult.rows.forEach(r => transactions.push({
        id: r.id, date: r.date, type: "lead_purchase",
        desc: r.description, amount: Number(r.amount) || 0, reference: r.reference,
      }));
    }

    // Sort combined by date descending
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json(transactions.slice(0, 100));
  } catch (e: any) {
    console.error("Finance transactions list error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// GET /summary?period= — Totals including lead purchases
router.get("/summary", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { start, end } = getDateRange((req.query.period as string) || "ytd");

    const [dealResult, leadResult] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(annual_premium::numeric), 0)::numeric(12,2) as total,
                COUNT(*)::int as count,
                COUNT(CASE WHEN status = 'submitted' THEN 1 END)::int as pending,
                COUNT(CASE WHEN status IN ('verified','issued') THEN 1 END)::int as confirmed,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END)::int as rejected
         FROM deals WHERE created_at >= $1 AND created_at <= $2`,
        [start, end]
      ),
      pool.query(
        `SELECT COALESCE(SUM(price_cents * quantity), 0)::int as total_cents,
                COUNT(*)::int as count
         FROM lead_purchases
         WHERE status IN ('completed', 'delivered', 'pending')
         AND created_at >= $1 AND created_at <= $2`,
        [start, end]
      ),
    ]);

    const dealAP = Number(dealResult.rows[0]?.total) || 0;
    const leadRevenue = (Number(leadResult.rows[0]?.total_cents) || 0) / 100;

    res.json({
      incoming: dealAP,
      leadRevenue,
      net: dealAP + leadRevenue,
      dealCount: dealResult.rows[0]?.count || 0,
      leadPurchases: leadResult.rows[0]?.count || 0,
      pending: dealResult.rows[0]?.pending || 0,
      confirmed: dealResult.rows[0]?.confirmed || 0,
      rejected: dealResult.rows[0]?.rejected || 0,
    });
  } catch (e: any) {
    console.error("Finance transactions summary error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
