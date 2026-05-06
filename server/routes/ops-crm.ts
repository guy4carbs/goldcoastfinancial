import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS } from "../middleware/auth";
import { logFounderAction } from "../services/founderAudit";

const router = Router();
router.get("/dashboard", requireAuth, async (_req, res) => {
  try {
    const counts = await pool.query(`SELECT status, COUNT(*)::int as c FROM leads GROUP BY status`);
    const pipeline = await pool.query(`SELECT pipeline_stage, COUNT(*)::int as c, COALESCE(SUM(estimated_value::numeric),0)::numeric(12,2) as v FROM leads GROUP BY pipeline_stage`);
    res.json({ byStatus: counts.rows, byStage: pipeline.rows });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/pipeline", requireAuth, async (_req, res) => {
  try { res.json((await pool.query(`SELECT id, first_name, last_name, email, source, pipeline_stage, lead_score, score_tier, estimated_value, last_contacted_at, created_at FROM leads WHERE status NOT IN ('won','lost') ORDER BY lead_score DESC`)).rows); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/leads", requireAuth, async (req, res) => {
  try {
    const { status, search, page = "0" } = req.query;
    let sql = `SELECT * FROM leads WHERE 1=1`;
    const p: any[] = [];
    if (status) { p.push(status); sql += ` AND status = $${p.length}`; }
    if (search) { p.push(`%${search}%`); sql += ` AND (first_name ILIKE $${p.length} OR last_name ILIKE $${p.length} OR email ILIKE $${p.length})`; }
    sql += ` ORDER BY created_at DESC LIMIT 20 OFFSET $${p.length + 1}`;
    p.push(parseInt(page as string) * 20);
    res.json((await pool.query(sql, p)).rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.post("/leads", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, source, estimatedValue, notes } = req.body;
    const inserted = await pool.query(
      `INSERT INTO leads (id, first_name, last_name, email, phone, source, estimated_value, notes, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id`,
      [firstName, lastName, email, phone, source || "web_form", estimatedValue, notes],
    );
    const newId = inserted.rows[0]?.id;
    try {
      await logFounderAction({
        actorUserId: req.user!.id,
        action: "lead.created",
        entityType: "lead",
        entityId: newId,
        payload: { source: source || "web_form", firstName, lastName, email, estimatedValue: estimatedValue ?? null },
      });
    } catch (auditErr: any) {
      console.error("[ops-crm] /leads audit failed:", auditErr?.message);
    }
    res.json({ success: true, id: newId });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.put("/leads/:id/stage", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const before = await pool.query(`SELECT pipeline_stage FROM leads WHERE id = $1`, [req.params.id]);
    const fromStage = before.rows[0]?.pipeline_stage ?? null;
    await pool.query(`UPDATE leads SET pipeline_stage = $1, updated_at = NOW() WHERE id = $2`, [req.body.stage, req.params.id]);
    try {
      await logFounderAction({
        actorUserId: req.user!.id,
        action: "lead.stage_changed",
        entityType: "lead",
        entityId: req.params.id,
        payload: { from: fromStage, to: req.body.stage },
      });
    } catch (auditErr: any) {
      console.error("[ops-crm] /stage audit failed:", auditErr?.message);
    }
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
