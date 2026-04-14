import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS } from "../middleware/auth";

const router = Router();
router.get("/dashboard", requireAuth, requireRole(...ADMIN_PLUS), async (_req, res) => {
  try {
    const agents = await pool.query(`SELECT COUNT(*)::int as c FROM users WHERE role = 'sales_agent'`);
    const aip = await pool.query(`SELECT COALESCE(SUM(annual_premium::numeric),0)::numeric(12,2) as total FROM production_records WHERE status IN ('issued','paid')`);
    const carriers = await pool.query(`SELECT COUNT(*)::int as c FROM carrier_directory WHERE is_active = true`);
    res.json({ agents: agents.rows[0]?.c || 0, totalAip: aip.rows[0]?.total || 0, carriers: carriers.rows[0]?.c || 0 });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/growth", requireAuth, requireRole(...ADMIN_PLUS), async (_req, res) => {
  try { res.json((await pool.query(`SELECT DATE_TRUNC('month', created_at)::date as month, COUNT(*)::int as new_agents FROM users WHERE role = 'sales_agent' AND created_at > NOW() - INTERVAL '12 months' GROUP BY 1 ORDER BY 1`)).rows); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/carrier-diversification", requireAuth, requireRole(...ADMIN_PLUS), async (_req, res) => {
  try { res.json((await pool.query(`SELECT carrier_code as name, COALESCE(SUM(annual_premium::numeric),0)::numeric(12,2) as value FROM production_records WHERE status IN ('issued','paid') GROUP BY carrier_code ORDER BY value DESC`)).rows); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/export", requireAuth, requireRole(...ADMIN_PLUS), async (_req, res) => {
  try {
    const agents = await pool.query(`SELECT COUNT(*)::int as c FROM users WHERE role = 'sales_agent'`);
    const aip = await pool.query(`SELECT COALESCE(SUM(annual_premium::numeric),0)::numeric(12,2) as total FROM production_records WHERE status IN ('issued','paid')`);
    res.json({ agents: agents.rows[0]?.c, aip: aip.rows[0]?.total, exportedAt: new Date().toISOString() });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
