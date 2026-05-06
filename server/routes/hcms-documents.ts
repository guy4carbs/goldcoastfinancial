import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS } from "../middleware/auth";

const router = Router();
router.get("/", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { agentId, category } = req.query;
    let sql = `SELECT d.*, u.first_name, u.last_name FROM documents d LEFT JOIN users u ON u.id = d.user_id WHERE 1=1`;
    const p: any[] = [];
    if (agentId) { p.push(agentId); sql += ` AND d.user_id = $${p.length}`; }
    if (category) { p.push(category); sql += ` AND d.category = $${p.length}`; }
    sql += ` ORDER BY d.created_at DESC`;
    res.json((await pool.query(sql, p)).rows);
  } catch (e: any) { console.error("[HCMS]", e.message); res.status(500).json({ error: "Something went wrong" }); }
});
router.post("/upload", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { agentUserId, name, category, expirationDate, notes } = req.body;
    await pool.query(`INSERT INTO documents (id, user_id, name, category, notes, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())`, [agentUserId, name, category, notes]);
    res.json({ success: true });
  } catch (e: any) { console.error("[HCMS]", e.message); res.status(500).json({ error: "Something went wrong" }); }
});
router.get("/stats", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  try {
    const total = await pool.query(`SELECT COUNT(*)::int as c FROM documents`);
    res.json({ total: total.rows[0]?.c || 0 });
  } catch (e: any) { console.error("[HCMS]", e.message); res.status(500).json({ error: "Something went wrong" }); }
});

export default router;
