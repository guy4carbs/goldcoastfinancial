import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS } from "../middleware/auth";

const router = Router();
import { calculateWaterfallOverrides } from "../services/commissionWaterfallService";
router.get("/targets", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { scope, hierarchyLevel } = req.query;
    let sql = `SELECT * FROM commission_targets WHERE (effective_to IS NULL OR effective_to > NOW())`;
    const p: any[] = [];
    if (scope) { p.push(scope); sql += ` AND scope = $${p.length}`; }
    if (hierarchyLevel) { p.push(parseInt(hierarchyLevel as string)); sql += ` AND hierarchy_level = $${p.length}`; }
    sql += ` ORDER BY hierarchy_level ASC`;
    res.json((await pool.query(sql, p)).rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/simulate", requireAuth, async (req, res) => {
  try {
    const { premium, agentId } = req.query;
    if (!premium || !agentId) return res.status(400).json({ error: "premium and agentId required" });
    const result = await calculateWaterfallOverrides(agentId as string, parseFloat(premium as string));
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/schedule/current", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  try { res.json((await pool.query(`SELECT * FROM commission_targets WHERE effective_to IS NULL OR effective_to > NOW() ORDER BY hierarchy_level ASC`)).rows); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
