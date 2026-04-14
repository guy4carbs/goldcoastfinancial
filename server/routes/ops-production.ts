import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS } from "../middleware/auth";

const router = Router();
router.get("/dashboard", requireAuth, async (_req, res) => {
  try {
    const aip = await pool.query(`SELECT COALESCE(SUM(annual_premium::numeric), 0)::numeric(12,2) as total FROM production_records WHERE status IN ('issued','paid')`);
    const policies = await pool.query(`SELECT COUNT(*)::int as c FROM production_records WHERE status IN ('issued','paid')`);
    res.json({ totalAip: aip.rows[0]?.total || 0, policyCount: policies.rows[0]?.c || 0 });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/by-carrier", requireAuth, async (_req, res) => {
  try { res.json((await pool.query(`SELECT carrier_code as name, COALESCE(SUM(annual_premium::numeric), 0)::numeric(12,2) as value FROM production_records WHERE status IN ('issued','paid') GROUP BY carrier_code ORDER BY value DESC LIMIT 10`)).rows); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/by-agent", requireAuth, async (_req, res) => {
  try { res.json((await pool.query(`SELECT pr.agent_user_id, u.first_name, u.last_name, COALESCE(SUM(pr.annual_premium::numeric), 0)::numeric(12,2) as total_aip, COUNT(*)::int as policies FROM production_records pr JOIN users u ON u.id = pr.agent_user_id WHERE pr.status IN ('issued','paid') GROUP BY pr.agent_user_id, u.first_name, u.last_name ORDER BY total_aip DESC LIMIT 20`)).rows); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
