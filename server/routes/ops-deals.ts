import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS } from "../middleware/auth";

const router = Router();
router.get("/", requireAuth, async (req, res) => {
  try {
    const { status, carrier } = req.query;
    let sql = `SELECT d.*, u.first_name, u.last_name FROM deals d JOIN users u ON u.id = d.agent_user_id WHERE 1=1`;
    const p: any[] = [];
    if (status) { p.push(status); sql += ` AND d.status = $${p.length}`; }
    if (carrier) { p.push(carrier); sql += ` AND d.carrier = $${p.length}`; }
    sql += ` ORDER BY d.created_at DESC`;
    res.json((await pool.query(sql, p)).rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/stats", requireAuth, async (_req, res) => {
  try {
    const total = await pool.query(`SELECT COUNT(*)::int as c, COALESCE(SUM(annual_premium::numeric),0)::numeric(12,2) as ap FROM deals`);
    res.json(total.rows[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.post("/", requireAuth, async (req, res) => {
  try {
    const { clientName, carrier, productType, stateCode, monthlyPremium } = req.body;
    const annual = (parseFloat(monthlyPremium) * 12).toFixed(2);
    await pool.query(`INSERT INTO deals (id, agent_user_id, client_name, carrier, product_type, state_code, monthly_premium, annual_premium, submitted_at, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`, [req.user!.id, clientName, carrier, productType, stateCode, monthlyPremium, annual]);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/leaderboard", requireAuth, async (_req, res) => {
  try { res.json((await pool.query(`SELECT d.agent_user_id, u.first_name, u.last_name, COALESCE(SUM(d.annual_premium::numeric),0)::numeric(12,2) as total_ap, COUNT(*)::int as deals FROM deals d JOIN users u ON u.id = d.agent_user_id GROUP BY d.agent_user_id, u.first_name, u.last_name ORDER BY total_ap DESC LIMIT 20`)).rows); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
