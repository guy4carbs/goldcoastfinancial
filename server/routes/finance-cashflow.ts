import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, ADMIN_PLUS } from "../middleware/auth";
import { getDateRange } from "../utils/dateRange";

const router = Router();

// GET /kpis?period= — Cash flow KPIs
router.get("/kpis", requireAuth, requireRole(...ADMIN_PLUS), async (_req, res) => {
  try {
    const cashPosition = await pool.query(
      `SELECT COALESCE(SUM(amount::numeric), 0)::numeric(12,2) as total
       FROM commissions WHERE status = 'paid'`
    );

    const receivables = await pool.query(
      `SELECT COALESCE(SUM(amount::numeric), 0)::numeric(12,2) as total
       FROM commissions WHERE status IN ('pending','earned')`
    );

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

    const expectedThisMonth = await pool.query(
      `SELECT COALESCE(SUM(amount::numeric), 0)::numeric(12,2) as total
       FROM commissions WHERE status = 'pending'
       AND created_at >= $1 AND created_at <= $2`,
      [monthStart, monthEnd]
    );

    const avgDaysToPay = await pool.query(
      `SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (paid_at - created_at)) / 86400), 0)::numeric(6,1) as avg_days
       FROM commissions WHERE paid_at IS NOT NULL`
    );

    res.json({
      cashPosition: Number(cashPosition.rows[0]?.total) || 0,
      receivables: Number(receivables.rows[0]?.total) || 0,
      expectedThisMonth: Number(expectedThisMonth.rows[0]?.total) || 0,
      avgDaysToPay: Number(avgDaysToPay.rows[0]?.avg_days) || 0,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /receivables-aging?period= — Aging buckets by carrier
router.get("/receivables-aging", requireAuth, requireRole(...ADMIN_PLUS), async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT COALESCE(pr.carrier_code, 'Unknown') as carrier,
              SUM(CASE WHEN c.created_at > NOW() - INTERVAL '30 days' THEN c.amount::numeric ELSE 0 END)::numeric(12,2) as current_amount,
              SUM(CASE WHEN c.created_at BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days' THEN c.amount::numeric ELSE 0 END)::numeric(12,2) as days30,
              SUM(CASE WHEN c.created_at BETWEEN NOW() - INTERVAL '90 days' AND NOW() - INTERVAL '60 days' THEN c.amount::numeric ELSE 0 END)::numeric(12,2) as days60,
              SUM(CASE WHEN c.created_at < NOW() - INTERVAL '90 days' THEN c.amount::numeric ELSE 0 END)::numeric(12,2) as days90,
              SUM(c.amount::numeric)::numeric(12,2) as total
       FROM commissions c
       LEFT JOIN production_records pr ON pr.id::text = c.policy_id::text
       WHERE c.status IN ('pending','earned')
       GROUP BY COALESCE(pr.carrier_code, 'Unknown')
       ORDER BY total DESC`
    );
    res.json(result.rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /trend?period= — Monthly actual vs pending trend
router.get("/trend", requireAuth, requireRole(...ADMIN_PLUS), async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT TO_CHAR(created_at, 'Mon') as label,
              SUM(CASE WHEN status = 'paid' THEN amount::numeric ELSE 0 END)::numeric(12,2) as value,
              SUM(CASE WHEN status IN ('pending','earned') THEN amount::numeric ELSE 0 END)::numeric(12,2) as value2
       FROM commissions
       WHERE created_at > NOW() - INTERVAL '12 months'
       GROUP BY 1, EXTRACT(MONTH FROM created_at), EXTRACT(YEAR FROM created_at)
       ORDER BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)`
    );
    res.json(result.rows.map(r => ({
      label: r.label,
      value: Number(r.value),
      value2: Number(r.value2),
    })));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /upcoming — Carriers with pending commissions
router.get("/upcoming", requireAuth, requireRole(...ADMIN_PLUS), async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT COALESCE(pr.carrier_code, 'Unknown') as carrier,
              SUM(c.amount::numeric)::numeric(12,2) as amount,
              COUNT(*)::int as pending_count
       FROM commissions c
       LEFT JOIN production_records pr ON pr.id::text = c.policy_id::text
       WHERE c.status = 'pending'
       GROUP BY COALESCE(pr.carrier_code, 'Unknown')
       ORDER BY amount DESC
       LIMIT 5`
    );
    res.json(result.rows.map(r => ({
      carrier: r.carrier,
      amount: Number(r.amount),
      pendingCount: r.pending_count,
    })));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
