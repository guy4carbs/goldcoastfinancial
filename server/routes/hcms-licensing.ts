import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS } from "../middleware/auth";

const router = Router();
router.get("/", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { stateCode, status, agentId, expiringSoon } = req.query;
    let sql = `SELECT al.*, u.first_name, u.last_name FROM agent_licenses al JOIN users u ON u.id = al.user_id WHERE 1=1`;
    const p: any[] = [];
    if (stateCode) { p.push(stateCode); sql += ` AND al.state_code = $${p.length}`; }
    if (status) { p.push(status); sql += ` AND al.status = $${p.length}`; }
    if (agentId) { p.push(agentId); sql += ` AND al.user_id = $${p.length}`; }
    if (expiringSoon === "true") sql += ` AND al.expiration_date BETWEEN NOW() AND NOW() + INTERVAL '90 days'`;
    sql += ` ORDER BY al.expiration_date ASC`;
    res.json((await pool.query(sql, p)).rows);
  } catch (e: any) { console.error("[HCMS]", e.message); res.status(500).json({ error: "Something went wrong" }); }
});
router.get("/stats", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  try {
    const r = await pool.query(`SELECT status, COUNT(*)::int as count FROM agent_licenses GROUP BY status`);
    const exp = await pool.query(`SELECT COUNT(*)::int as c FROM agent_licenses WHERE expiration_date BETWEEN NOW() AND NOW() + INTERVAL '30 days' AND status = 'active'`);
    res.json({ byStatus: r.rows.reduce((a: any, r: any) => ({...a, [r.status]: r.count}), {}), expiring30d: exp.rows[0]?.c || 0 });
  } catch (e: any) { console.error("[HCMS]", e.message); res.status(500).json({ error: "Something went wrong" }); }
});
router.post("/", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { agentUserId, stateCode, licenseNumber, licenseType, effectiveDate, expirationDate } = req.body;
    await pool.query(`INSERT INTO agent_licenses (id, user_id, state_code, license_number, license_type, effective_date, expiration_date, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())`, [agentUserId, stateCode, licenseNumber, licenseType || "life_health", effectiveDate, expirationDate]);
    res.json({ success: true });
  } catch (e: any) { console.error("[HCMS]", e.message); res.status(500).json({ error: "Something went wrong" }); }
});

export default router;
