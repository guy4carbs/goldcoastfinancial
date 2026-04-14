import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS } from "../middleware/auth";

const router = Router();
router.get("/overview", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  try {
    const agents = await pool.query(`SELECT COUNT(*)::int as c FROM users WHERE role = 'sales_agent' AND is_active = true`);
    const aip = await pool.query(`SELECT COALESCE(SUM(annual_premium::numeric),0)::numeric(12,2) as total FROM production_records WHERE status IN ('issued','paid')`);
    const leads = await pool.query(`SELECT COUNT(*)::int as c FROM leads`);
    const flags = await pool.query(`SELECT COUNT(*)::int as c FROM compliance_flags WHERE status = 'open'`);
    res.json({ agents: agents.rows[0]?.c || 0, totalAip: aip.rows[0]?.total || 0, leads: leads.rows[0]?.c || 0, openFlags: flags.rows[0]?.c || 0 });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/performance", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  try { res.json((await pool.query(`SELECT u.id, u.first_name, u.last_name, COALESCE((SELECT COUNT(*) FROM deals d WHERE d.agent_user_id = u.id),0)::int as deals, COALESCE((SELECT SUM(annual_premium::numeric) FROM deals d WHERE d.agent_user_id = u.id),0)::numeric(12,2) as ap FROM users u WHERE u.role = 'sales_agent' AND u.is_active = true ORDER BY ap DESC LIMIT 20`)).rows); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
