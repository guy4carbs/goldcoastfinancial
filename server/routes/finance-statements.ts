import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, ADMIN_PLUS } from "../middleware/auth";
import { getDateRange } from "../utils/dateRange";

const router = Router();

router.get("/kpis", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query.period as string);
    const statements = await pool.query(
      `SELECT COUNT(*)::int as total_statements, COALESCE(SUM(reported_amount::numeric), 0)::numeric(12,2) as total_reported
       FROM carrier_statements WHERE received_date >= $1 AND received_date <= $2`,
      [start, end]
    );
    const pending = await pool.query(
      `SELECT COUNT(*)::int as c FROM carrier_statements WHERE status = 'pending' AND received_date >= $1 AND received_date <= $2`,
      [start, end]
    );
    const variances = await pool.query(
      `SELECT COUNT(*)::int as c FROM statement_line_items sli
       JOIN carrier_statements cs ON cs.id = sli.statement_id
       WHERE sli.variance != 0 AND cs.received_date >= $1 AND cs.received_date <= $2`,
      [start, end]
    );
    res.json({
      totalStatements: statements.rows[0]?.total_statements || 0,
      totalReported: statements.rows[0]?.total_reported || 0,
      pendingStatements: pending.rows[0]?.c || 0,
      varianceLineItems: variances.rows[0]?.c || 0,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get("/list", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query.period as string);
    const result = await pool.query(
      `SELECT cs.id, cs.carrier_id, cd.name as carrier_name, cs.period_month, cs.period_year,
              cs.received_date, cs.reported_amount::numeric(12,2) as reported_amount,
              cs.line_item_count, cs.status, cs.file_name,
              COALESCE((
                SELECT SUM(c.amount::numeric)::numeric(12,2)
                FROM commissions c
                JOIN production_records pr ON pr.id::text = c.policy_id::text
                WHERE pr.carrier_code = cd.code
                  AND EXTRACT(MONTH FROM c.created_at) = cs.period_month
                  AND EXTRACT(YEAR FROM c.created_at) = cs.period_year
                  AND c.status != 'clawed_back'
              ), 0) as expected_amount
       FROM carrier_statements cs
       LEFT JOIN carrier_directory cd ON cd.id = cs.carrier_id
       WHERE cs.received_date >= $1 AND cs.received_date <= $2
       ORDER BY cs.received_date DESC`,
      [start, end]
    );
    res.json(result.rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get("/coverage", requireAuth, requireRole(...ADMIN_PLUS), async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT months.m as month, months.y as year,
              COALESCE(stmt_counts.with_statements, 0)::int as carriers_with_statements,
              COALESCE(active.total, 0)::int as total_active_carriers
       FROM (
         SELECT EXTRACT(MONTH FROM d)::int as m, EXTRACT(YEAR FROM d)::int as y
         FROM generate_series(
           date_trunc('month', NOW() - INTERVAL '2 months'),
           date_trunc('month', NOW()),
           '1 month'
         ) d
       ) months
       LEFT JOIN (
         SELECT period_month, period_year, COUNT(DISTINCT carrier_id)::int as with_statements
         FROM carrier_statements
         GROUP BY period_month, period_year
       ) stmt_counts ON stmt_counts.period_month = months.m AND stmt_counts.period_year = months.y
       CROSS JOIN (
         SELECT COUNT(*)::int as total FROM carrier_directory WHERE is_active = true
       ) active
       ORDER BY months.y, months.m`
    );
    res.json(result.rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post("/import", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { carrierId, periodMonth, periodYear, reportedAmount, lineItems } = req.body;
    if (!carrierId || !periodMonth || !periodYear || reportedAmount == null) {
      return res.status(400).json({ error: "Missing required fields: carrierId, periodMonth, periodYear, reportedAmount" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const stmtResult = await client.query(
        `INSERT INTO carrier_statements (carrier_id, period_month, period_year, received_date, reported_amount, line_item_count, status, imported_by)
         VALUES ($1, $2, $3, NOW(), $4, $5, 'pending', $6)
         RETURNING id`,
        [carrierId, periodMonth, periodYear, reportedAmount, (lineItems || []).length, req.user?.id]
      );
      const statementId = stmtResult.rows[0].id;

      let matchedCount = 0;
      for (const item of lineItems || []) {
        // Auto-match by policy_number against production_records
        const matchResult = await client.query(
          `SELECT c.id, c.amount FROM commissions c
           JOIN production_records pr ON pr.id::text = c.policy_id::text
           WHERE pr.policy_number = $1 AND c.status != 'clawed_back'
           LIMIT 1`,
          [item.policyNumber]
        );

        const matched = matchResult.rows[0];
        const expectedAmount = matched ? Number(matched.amount) : null;
        const variance = expectedAmount != null ? Number(item.amount) - expectedAmount : null;
        const status = matched
          ? (variance === 0 ? "matched" : "discrepancy")
          : "unmatched";

        if (matched) matchedCount++;

        await client.query(
          `INSERT INTO statement_line_items (statement_id, policy_number, insured_name, reported_amount, expected_amount, variance, matched_commission_id, match_confidence, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            statementId,
            item.policyNumber,
            item.insuredName || null,
            item.amount,
            expectedAmount,
            variance,
            matched?.id || null,
            matched ? 1.0 : 0,
            status,
          ]
        );
      }

      await client.query("COMMIT");
      res.json({
        statementId,
        lineItemsImported: (lineItems || []).length,
        autoMatched: matchedCount,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
