import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS } from "../middleware/auth";

const router = Router();
router.get("/summary", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  try {
    const personal = await pool.query(`SELECT COALESCE(SUM(amount::numeric),0)::numeric(12,2) as total FROM commissions WHERE commission_type = 'personal' AND status != 'clawed_back'`);
    const overrides = await pool.query(`SELECT COALESCE(SUM(amount::numeric),0)::numeric(12,2) as total FROM commissions WHERE commission_type = 'override' AND status != 'clawed_back'`);
    const chargebacks = await pool.query(`SELECT COALESCE(SUM(ABS(amount::numeric)),0)::numeric(12,2) as total FROM commissions WHERE status = 'clawed_back'`);
    res.json({ personal: personal.rows[0]?.total, overrides: overrides.rows[0]?.total, chargebacks: chargebacks.rows[0]?.total });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/by-agent", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  try { res.json((await pool.query(`SELECT c.agent_user_id, u.first_name, u.last_name, COALESCE(SUM(CASE WHEN c.commission_type='personal' THEN c.amount::numeric ELSE 0 END),0)::numeric(12,2) as personal_ap, COALESCE(SUM(CASE WHEN c.commission_type='override' THEN c.amount::numeric ELSE 0 END),0)::numeric(12,2) as override_ap, COALESCE(SUM(c.amount::numeric),0)::numeric(12,2) as total FROM commissions c JOIN users u ON u.id = c.agent_user_id WHERE c.status != 'clawed_back' GROUP BY c.agent_user_id, u.first_name, u.last_name ORDER BY total DESC`)).rows); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});
import { calculateWaterfallOverrides } from "../services/commissionWaterfallService";
router.get("/agent/:agentId/waterfall", requireAuth, async (req, res) => {
  try {
    const result = await calculateWaterfallOverrides(req.params.agentId, 10000);
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
