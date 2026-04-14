import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS } from "../middleware/auth";

const router = Router();
router.get("/", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { status, requestType } = req.query;
    let sql = `SELECT hr.*, u.first_name as agent_first, u.last_name as agent_last FROM hierarchy_requests hr JOIN users u ON u.id = hr.agent_user_id WHERE 1=1`;
    const p: any[] = [];
    if (status) { p.push(status); sql += ` AND hr.status = $${p.length}`; }
    if (requestType) { p.push(requestType); sql += ` AND hr.request_type = $${p.length}`; }
    sql += ` ORDER BY hr.created_at DESC`;
    res.json((await pool.query(sql, p)).rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.post("/", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { agentUserId, requestType, currentValue, requestedValue, justification } = req.body;
    await pool.query(`INSERT INTO hierarchy_requests (id, agent_user_id, request_type, current_value, requested_value, justification, requested_by, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())`, [agentUserId, requestType, currentValue, requestedValue, justification, req.user!.id]);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.put("/:id/review", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { decision, notes } = req.body;
    const newStatus = decision === "approved" ? "pending_executive" : "rejected";
    await pool.query(`UPDATE hierarchy_requests SET status = $1, reviewed_by = $2, review_notes = $3, reviewed_at = NOW(), updated_at = NOW() WHERE id = $4`, [newStatus, req.user!.id, notes, req.params.id]);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
