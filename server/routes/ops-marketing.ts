import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS } from "../middleware/auth";

const router = Router();
router.get("/dashboard", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  try {
    const leads = await pool.query(`SELECT COUNT(*)::int as c FROM leads WHERE created_at > DATE_TRUNC('month', NOW())`);
    const sources = await pool.query(`SELECT source, COUNT(*)::int as c FROM leads GROUP BY source ORDER BY c DESC`);
    res.json({ leadsThisMonth: leads.rows[0]?.c || 0, sources: sources.rows });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/lead-sources", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  try { res.json((await pool.query(`SELECT source, COUNT(*)::int as leads, COUNT(CASE WHEN status = 'won' THEN 1 END)::int as conversions, COALESCE(SUM(CASE WHEN status = 'won' THEN won_amount::numeric ELSE 0 END),0)::numeric(12,2) as revenue FROM leads GROUP BY source ORDER BY revenue DESC`)).rows); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/funnel", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  try { res.json((await pool.query(`SELECT pipeline_stage as stage, COUNT(*)::int as count FROM leads GROUP BY pipeline_stage`)).rows); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/recruitment", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  try { res.json((await pool.query(`SELECT approval_status, COUNT(*)::int as count FROM agent_profiles GROUP BY approval_status`)).rows); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
