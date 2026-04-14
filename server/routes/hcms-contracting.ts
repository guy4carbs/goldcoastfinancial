import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS } from "../middleware/auth";

const router = Router();
router.get("/pipeline", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  try {
    const result = await pool.query(`SELECT ap.id, ap.first_name, ap.last_name, ap.email, ap.approval_status, ap.created_at FROM agent_profiles ap ORDER BY ap.created_at DESC`);
    const grouped: Record<string, any[]> = { pending_review: [], in_review: [], approved: [], rejected: [] };
    for (const r of result.rows) { const s = r.approval_status || "pending_review"; if (grouped[s]) grouped[s].push(r); }
    res.json({ stages: Object.entries(grouped).map(([stage, agents]) => ({ stage, count: agents.length, agents })) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.put("/pipeline/:agentId/stage", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    await pool.query(`UPDATE agent_profiles SET approval_status = $1, updated_at = NOW() WHERE id = $2`, [req.body.newStage, req.params.agentId]);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/pipeline/:agentId/checklist", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM contracting_checklists WHERE agent_user_id = $1`, [req.params.agentId]);
    res.json(result.rows[0] || null);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
