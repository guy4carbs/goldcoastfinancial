import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS } from "../middleware/auth";

const router = Router();
import { runComplianceChecks } from "../services/complianceAutomationService";
router.get("/dashboard", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  try {
    const bySeverity = await pool.query(`SELECT severity, COUNT(*)::int as c FROM compliance_flags WHERE status = 'open' GROUP BY severity`);
    const total = await pool.query(`SELECT COUNT(*)::int as c FROM compliance_flags WHERE status = 'open'`);
    res.json({ totalOpen: total.rows[0]?.c || 0, bySeverity: bySeverity.rows.reduce((a: any, r: any) => ({...a, [r.severity]: r.c}), {}) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/flags", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { severity, status, flagType } = req.query;
    let sql = `SELECT cf.*, u.first_name, u.last_name FROM compliance_flags cf LEFT JOIN users u ON u.id = cf.agent_user_id WHERE 1=1`;
    const p: any[] = [];
    if (severity) { p.push(severity); sql += ` AND cf.severity = $${p.length}`; }
    if (status) { p.push(status); sql += ` AND cf.status = $${p.length}`; }
    if (flagType) { p.push(flagType); sql += ` AND cf.flag_type = $${p.length}`; }
    sql += ` ORDER BY cf.created_at DESC`;
    res.json((await pool.query(sql, p)).rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.put("/flags/:id", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { status, resolvedNotes } = req.body;
    await pool.query(`UPDATE compliance_flags SET status = $1, resolved_notes = $2, resolved_by = $3, resolved_at = CASE WHEN $1 = 'resolved' THEN NOW() ELSE NULL END, updated_at = NOW() WHERE id = $4`, [status, resolvedNotes, req.user!.id, req.params.id]);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.post("/run-check", requireAuth, requireRole(...ADMIN_PLUS), async (_req, res) => {
  try { const r = await runComplianceChecks(); res.json(r); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/audit-log", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { action, page = "0" } = req.query;
    let sql = `SELECT al.*, u.first_name, u.last_name FROM audit_logs al LEFT JOIN users u ON u.id = al.user_id WHERE 1=1`;
    const p: any[] = [];
    if (action) { p.push(action); sql += ` AND al.action = $${p.length}`; }
    sql += ` ORDER BY al.created_at DESC LIMIT 50 OFFSET $${p.length + 1}`;
    p.push(parseInt(page as string) * 50);
    res.json((await pool.query(sql, p)).rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
