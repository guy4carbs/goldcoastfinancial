import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, ADMIN_PLUS } from "../middleware/auth";
import { getDateRange } from "../utils/dateRange";

const router = Router();

router.get("/kpis", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query.period as string);
    const total = await pool.query(
      `SELECT COUNT(*)::int as c FROM statement_line_items sli
       JOIN carrier_statements cs ON cs.id = sli.statement_id
       WHERE cs.received_date >= $1 AND cs.received_date <= $2`,
      [start, end]
    );
    const matched = await pool.query(
      `SELECT COUNT(*)::int as c FROM statement_line_items sli
       JOIN carrier_statements cs ON cs.id = sli.statement_id
       WHERE sli.status = 'matched' AND cs.received_date >= $1 AND cs.received_date <= $2`,
      [start, end]
    );
    const discrepancies = await pool.query(
      `SELECT COUNT(*)::int as c FROM statement_line_items sli
       JOIN carrier_statements cs ON cs.id = sli.statement_id
       WHERE sli.status = 'discrepancy' AND cs.received_date >= $1 AND cs.received_date <= $2`,
      [start, end]
    );
    const unresolved = await pool.query(
      `SELECT COUNT(*)::int as c FROM statement_line_items sli
       JOIN carrier_statements cs ON cs.id = sli.statement_id
       WHERE sli.status = 'unmatched' AND sli.created_at < NOW() - INTERVAL '7 days'
         AND cs.received_date >= $1 AND cs.received_date <= $2`,
      [start, end]
    );
    const totalCount = total.rows[0]?.c || 0;
    const matchedCount = matched.rows[0]?.c || 0;
    res.json({
      matchRate: totalCount > 0 ? Number(((matchedCount / totalCount) * 100).toFixed(1)) : 0,
      autoMatched: matchedCount,
      manualReview: discrepancies.rows[0]?.c || 0,
      unresolved: unresolved.rows[0]?.c || 0,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get("/matched", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query.period as string);
    const result = await pool.query(
      `SELECT sli.id, sli.policy_number, sli.insured_name,
              sli.reported_amount::numeric(10,2) as reported_amount,
              sli.expected_amount::numeric(10,2) as expected_amount,
              sli.matched_commission_id, sli.match_confidence,
              cs.carrier_id, cd.name as carrier_name
       FROM statement_line_items sli
       JOIN carrier_statements cs ON cs.id = sli.statement_id
       LEFT JOIN carrier_directory cd ON cd.id = cs.carrier_id
       WHERE sli.status = 'matched' AND cs.received_date >= $1 AND cs.received_date <= $2
       ORDER BY sli.created_at DESC`,
      [start, end]
    );
    res.json(result.rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get("/discrepancies", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query.period as string);
    const result = await pool.query(
      `SELECT sli.id, sli.policy_number, sli.insured_name,
              sli.reported_amount::numeric(10,2) as reported_amount,
              sli.expected_amount::numeric(10,2) as expected_amount,
              sli.variance::numeric(10,2) as variance,
              sli.matched_commission_id, sli.match_confidence,
              cs.carrier_id, cd.name as carrier_name,
              sli.created_at
       FROM statement_line_items sli
       JOIN carrier_statements cs ON cs.id = sli.statement_id
       LEFT JOIN carrier_directory cd ON cd.id = cs.carrier_id
       WHERE sli.status = 'discrepancy' AND cs.received_date >= $1 AND cs.received_date <= $2
       ORDER BY ABS(sli.variance::numeric) DESC`,
      [start, end]
    );
    res.json(result.rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get("/unresolved", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query.period as string);
    const result = await pool.query(
      `SELECT sli.id, sli.policy_number, sli.insured_name,
              sli.reported_amount::numeric(10,2) as reported_amount,
              sli.expected_amount::numeric(10,2) as expected_amount,
              sli.variance::numeric(10,2) as variance,
              cs.carrier_id, cd.name as carrier_name,
              sli.created_at,
              EXTRACT(DAY FROM NOW() - sli.created_at)::int as days_aging
       FROM statement_line_items sli
       JOIN carrier_statements cs ON cs.id = sli.statement_id
       LEFT JOIN carrier_directory cd ON cd.id = cs.carrier_id
       WHERE sli.status = 'unmatched' AND cs.received_date >= $1 AND cs.received_date <= $2
       ORDER BY sli.created_at ASC`,
      [start, end]
    );
    res.json(result.rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.put("/discrepancies/:id", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;
    const result = await pool.query(
      `UPDATE statement_line_items
       SET status = 'resolved', resolution_notes = $2, resolved_by = $3, resolved_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, resolutionNotes || null, req.user?.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Line item not found" });
    }
    res.json(result.rows[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get("/summary", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query.period as string);
    const result = await pool.query(
      `SELECT
         COALESCE(SUM(sli.expected_amount::numeric), 0)::numeric(12,2) as total_expected,
         COALESCE(SUM(sli.reported_amount::numeric), 0)::numeric(12,2) as total_reported,
         COALESCE(SUM(sli.variance::numeric), 0)::numeric(12,2) as total_variance,
         COUNT(*)::int as total_items,
         COUNT(*) FILTER (WHERE sli.status = 'matched')::int as matched_items
       FROM statement_line_items sli
       JOIN carrier_statements cs ON cs.id = sli.statement_id
       WHERE cs.received_date >= $1 AND cs.received_date <= $2`,
      [start, end]
    );
    const row = result.rows[0];
    const totalItems = row?.total_items || 0;
    const matchedItems = row?.matched_items || 0;
    res.json({
      totalExpected: row?.total_expected || 0,
      totalReported: row?.total_reported || 0,
      totalVariance: row?.total_variance || 0,
      matchRate: totalItems > 0 ? Number(((matchedItems / totalItems) * 100).toFixed(1)) : 0,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get("/by-carrier", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query.period as string);
    const result = await pool.query(
      `SELECT cs.carrier_id, cd.name as carrier_name,
              COUNT(*)::int as total_items,
              COALESCE(SUM(ABS(sli.variance::numeric)), 0)::numeric(12,2) as total_abs_variance,
              COUNT(*) FILTER (WHERE sli.status = 'discrepancy')::int as discrepancy_count,
              COUNT(*) FILTER (WHERE sli.status = 'unmatched')::int as unmatched_count
       FROM statement_line_items sli
       JOIN carrier_statements cs ON cs.id = sli.statement_id
       LEFT JOIN carrier_directory cd ON cd.id = cs.carrier_id
       WHERE sli.status IN ('discrepancy', 'unmatched')
         AND cs.received_date >= $1 AND cs.received_date <= $2
       GROUP BY cs.carrier_id, cd.name
       ORDER BY total_abs_variance DESC`,
      [start, end]
    );
    res.json(result.rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
