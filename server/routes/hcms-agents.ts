import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS } from "../middleware/auth";

const router = Router();

router.get("/stats", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  try {
    const result = await pool.query(`SELECT approval_status, COUNT(*)::int as count FROM agent_profiles GROUP BY approval_status`);
    res.json(result.rows.reduce((acc: any, r: any) => ({ ...acc, [r.approval_status]: r.count }), {}));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get("/", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { search, status, page = "0", limit = "20" } = req.query;
    let sql = `SELECT ap.*, u.email, u.first_name as user_first, u.last_name as user_last FROM agent_profiles ap LEFT JOIN users u ON u.id = ap.user_id WHERE 1=1`;
    const params: any[] = [];
    if (status) { params.push(status); sql += ` AND ap.approval_status = $${params.length}`; }
    if (search) { params.push(`%${search}%`); sql += ` AND (ap.first_name ILIKE $${params.length} OR ap.last_name ILIKE $${params.length} OR ap.email ILIKE $${params.length})`; }
    sql += ` ORDER BY ap.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit as string), parseInt(page as string) * parseInt(limit as string));
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get("/:id", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const result = await pool.query(`SELECT ap.*, u.email FROM agent_profiles ap LEFT JOIN users u ON u.id = ap.user_id WHERE ap.id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Agent not found" });
    const agent = result.rows[0];
    if (agent.ssn_encrypted) agent.ssn_encrypted = "***-**-" + (agent.ssn_encrypted.slice(-4) || "****");
    res.json(agent);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.put("/:id/status", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { status, reason } = req.body;
    await pool.query(`UPDATE agent_profiles SET approval_status = $1, rejection_reason = $2, updated_at = NOW() WHERE id = $3`, [status, reason || null, req.params.id]);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
