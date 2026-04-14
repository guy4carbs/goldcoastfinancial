import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS } from "../middleware/auth";

const router = Router();
import bcrypt from "bcryptjs";
router.get("/users", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { search, role } = req.query;
    let sql = `SELECT id, email, first_name, last_name, role, is_active, last_login_at, created_at FROM users WHERE 1=1`;
    const p: any[] = [];
    if (search) { p.push(`%${search}%`); sql += ` AND (first_name ILIKE $${p.length} OR last_name ILIKE $${p.length} OR email ILIKE $${p.length})`; }
    if (role) { p.push(role); sql += ` AND role = $${p.length}`; }
    sql += ` ORDER BY created_at DESC`;
    res.json((await pool.query(sql, p)).rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.post("/users", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { email, firstName, lastName, role, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await pool.query(`INSERT INTO users (id, email, password, first_name, last_name, role, password_reset_required, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true, NOW())`, [email, hash, firstName, lastName, role || "sales_agent"]);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.put("/users/:id", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { firstName, lastName, email, role, isActive } = req.body;
    const sets: string[] = []; const p: any[] = [];
    if (firstName) { p.push(firstName); sets.push(`first_name = $${p.length}`); }
    if (lastName) { p.push(lastName); sets.push(`last_name = $${p.length}`); }
    if (email) { p.push(email); sets.push(`email = $${p.length}`); }
    if (role) { p.push(role); sets.push(`role = $${p.length}`); }
    if (isActive !== undefined) { p.push(isActive); sets.push(`is_active = $${p.length}`); }
    if (sets.length === 0) return res.status(400).json({ error: "No fields to update" });
    p.push(req.params.id);
    await pool.query(`UPDATE users SET ${sets.join(", ")}, updated_at = NOW() WHERE id = $${p.length}`, p);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/integrations", requireAuth, requireRole(...ADMIN_PLUS), async (_req, res) => {
  res.json([
    { name: "Carrier APIs", status: process.env.CARRIER_API_KEY ? "configured" : "disconnected" },
    { name: "Email Service", status: process.env.GMAIL_FROM_EMAIL ? "connected" : "disconnected" },
    { name: "Document Storage", status: "connected" },
    { name: "Telnyx", status: process.env.TELNYX_API_KEY ? "configured" : "disconnected" },
  ]);
});
router.get("/system", requireAuth, requireRole(...ADMIN_PLUS), async (_req, res) => {
  try {
    const users = await pool.query(`SELECT COUNT(*)::int as c FROM users`);
    const agents = await pool.query(`SELECT COUNT(*)::int as c FROM users WHERE role = 'sales_agent'`);
    res.json({ dbStatus: "connected", users: users.rows[0]?.c || 0, agents: agents.rows[0]?.c || 0, uptime: process.uptime() });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
