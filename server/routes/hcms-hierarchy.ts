import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS } from "../middleware/auth";

const router = Router();
import { HIERARCHY_LEVELS, HIERARCHY_TITLES } from "../../shared/models/enterprise";
router.get("/tree", requireAuth, async (_req, res) => {
  try {
    const result = await pool.query(`SELECT ah.*, u.first_name, u.last_name FROM agent_hierarchy ah JOIN users u ON u.id = ah.agent_user_id WHERE ah.effective_to IS NULL OR ah.effective_to > NOW() ORDER BY ah.hierarchy_level ASC`);
    res.json(result.rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/flat", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { search, level } = req.query;
    let sql = `SELECT ah.*, u.first_name, u.last_name, u.email FROM agent_hierarchy ah JOIN users u ON u.id = ah.agent_user_id WHERE (ah.effective_to IS NULL OR ah.effective_to > NOW())`;
    const p: any[] = [];
    if (search) { p.push(`%${search}%`); sql += ` AND (u.first_name ILIKE $${p.length} OR u.last_name ILIKE $${p.length})`; }
    if (level) { p.push(parseInt(level as string)); sql += ` AND ah.hierarchy_level = $${p.length}`; }
    sql += ` ORDER BY ah.hierarchy_level ASC`;
    res.json((await pool.query(sql, p)).rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/levels", requireAuth, async (_req, res) => { res.json({ levels: HIERARCHY_LEVELS, titles: HIERARCHY_TITLES }); });
router.get("/stats", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  try {
    const result = await pool.query(`SELECT hierarchy_level, COUNT(*)::int as count, AVG(contract_level::numeric)::numeric(5,2) as avg_contract FROM agent_hierarchy WHERE effective_to IS NULL OR effective_to > NOW() GROUP BY hierarchy_level ORDER BY hierarchy_level`);
    res.json(result.rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
