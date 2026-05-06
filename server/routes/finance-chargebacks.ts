import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, ADMIN_PLUS } from "../middleware/auth";
import { getDateRange } from "../utils/dateRange";

const router = Router();

// GET /kpis — Chargeback KPIs
router.get("/kpis", requireAuth, requireRole(...ADMIN_PLUS), async (_req, res) => {
  try {
    const total = await pool.query(
      `SELECT COUNT(*)::int as count,
              COALESCE(SUM(chargeback_amount::numeric), 0)::numeric(12,2) as total
       FROM chargebacks`
    );

    const byStatus = await pool.query(
      `SELECT status,
              COUNT(*)::int as count,
              COALESCE(SUM(chargeback_amount::numeric), 0)::numeric(12,2) as total
       FROM chargebacks
       GROUP BY status`
    );

    const recovered = await pool.query(
      `SELECT COALESCE(SUM(recovery_amount::numeric), 0)::numeric(12,2) as total
       FROM chargebacks WHERE recovery_amount > 0`
    );

    res.json({
      totalCount: total.rows[0]?.count || 0,
      totalAmount: Number(total.rows[0]?.total) || 0,
      recovered: Number(recovered.rows[0]?.total) || 0,
      byStatus: byStatus.rows.map(r => ({
        status: r.status,
        count: r.count,
        total: Number(r.total),
      })),
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /list?period= — Chargebacks list with agent name
router.get("/list", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { start, end } = getDateRange((req.query.period as string) || "ytd");

    const result = await pool.query(
      `SELECT cb.*,
              CONCAT(u.first_name, ' ', u.last_name) as agent_name
       FROM chargebacks cb
       LEFT JOIN users u ON u.id = cb.agent_user_id
       WHERE cb.created_at >= $1 AND cb.created_at <= $2
       ORDER BY cb.created_at DESC`,
      [start, end]
    );
    res.json(result.rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /by-carrier — Chargebacks grouped by carrier
router.get("/by-carrier", requireAuth, requireRole(...ADMIN_PLUS), async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT carrier_code,
              COUNT(*)::int as count,
              COALESCE(SUM(chargeback_amount::numeric), 0)::numeric(12,2) as total
       FROM chargebacks
       GROUP BY carrier_code
       ORDER BY total DESC`
    );
    res.json(result.rows.map(r => ({
      carrierCode: r.carrier_code,
      count: r.count,
      total: Number(r.total),
    })));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /lifecycle/:id — Event timeline for a chargeback
router.get("/lifecycle/:id", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM chargeback_events
       WHERE chargeback_id = $1
       ORDER BY created_at`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// PUT /:id/status — Update chargeback status + log event
router.put("/:id/status", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { status, description } = req.body;
    if (!status) {
      return res.status(400).json({ error: "status is required" });
    }

    const updated = await pool.query(
      `UPDATE chargebacks SET status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );

    if (updated.rowCount === 0) {
      return res.status(404).json({ error: "Chargeback not found" });
    }

    await pool.query(
      `INSERT INTO chargeback_events (chargeback_id, event_type, description, performed_by)
       VALUES ($1, $2, $3, $4)`,
      [req.params.id, status, description || `Status changed to ${status}`, req.user?.id]
    );

    res.json(updated.rows[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
