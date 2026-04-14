import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS } from "../middleware/auth";

const router = Router();
router.get("/directory", requireAuth, async (req, res) => {
  try {
    const { search } = req.query;
    let sql = `SELECT * FROM carrier_directory WHERE is_active = true`;
    const p: any[] = [];
    if (search) { p.push(`%${search}%`); sql += ` AND (name ILIKE $1 OR short_name ILIKE $1 OR code ILIKE $1)`; }
    sql += ` ORDER BY name ASC`;
    res.json((await pool.query(sql, p)).rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/appointments", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { agentId, status } = req.query;
    let sql = `SELECT ca.*, cd.name as carrier_name, u.first_name, u.last_name FROM carrier_appointments ca LEFT JOIN carrier_directory cd ON cd.id = ca.carrier_id LEFT JOIN users u ON u.id = ca.agent_user_id WHERE 1=1`;
    const p: any[] = [];
    if (agentId) { p.push(agentId); sql += ` AND ca.agent_user_id = $${p.length}`; }
    if (status) { p.push(status); sql += ` AND ca.status = $${p.length}`; }
    res.json((await pool.query(sql, p)).rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/stats", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  try {
    const carriers = await pool.query(`SELECT COUNT(*)::int as c FROM carrier_directory WHERE is_active = true`);
    const appts = await pool.query(`SELECT status, COUNT(*)::int as c FROM carrier_appointments GROUP BY status`);
    res.json({ totalCarriers: carriers.rows[0]?.c || 0, byStatus: appts.rows.reduce((a: any, r: any) => ({...a, [r.status]: r.c}), {}) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
