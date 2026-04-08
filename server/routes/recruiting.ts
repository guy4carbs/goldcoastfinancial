/**
 * Recruiting API Routes
 * CRUD for recruit prospects + settings persistence.
 *
 * Domain: Forge (Backend Systems Engineer)
 * Auth: requireAuth applied per-route (global attachUser populates req.user)
 */

import { Router, type Request, type Response } from "express";
import { pool } from "../db";
import { requireAuth, type AuthenticatedUser } from "../middleware/auth";

const router = Router();

// ============================================
// GET /prospects — List all prospects for the current agent
// ============================================

router.get("/prospects", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user! as AuthenticatedUser;
    const result = await pool.query(
      "SELECT * FROM recruit_prospects WHERE recruiter_id = $1 ORDER BY created_at DESC",
      [user.id],
    );

    // Normalize snake_case -> camelCase for frontend
    const prospects = result.rows.map((r: any) => ({
      id: r.id,
      recruiterId: r.recruiter_id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      source: r.source,
      approach: r.approach,
      stage: r.stage,
      notes: r.notes,
      nextStepDate: r.next_step_date,
      inviteSentAt: r.invite_sent_at,
      addedDate: r.created_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    res.json({ prospects });
  } catch (error: any) {
    console.error("[Recruiting] Error listing prospects:", error);
    res.status(500).json({ error: "Failed to fetch prospects" });
  }
});

// ============================================
// POST /prospects — Add a new prospect
// ============================================

router.post("/prospects", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user! as AuthenticatedUser;
    const { name, email, phone, source, approach, notes, nextStepDate } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const result = await pool.query(
      `INSERT INTO recruit_prospects (recruiter_id, name, email, phone, source, approach, notes, next_step_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        user.id,
        name,
        email || null,
        phone || null,
        source || null,
        approach || null,
        notes || null,
        nextStepDate || null,
      ],
    );

    const r = result.rows[0];
    const prospect = {
      id: r.id,
      recruiterId: r.recruiter_id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      source: r.source,
      approach: r.approach,
      stage: r.stage,
      notes: r.notes,
      nextStepDate: r.next_step_date,
      inviteSentAt: r.invite_sent_at,
      addedDate: r.created_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };

    res.status(201).json({ prospect });
  } catch (error: any) {
    console.error("[Recruiting] Error adding prospect:", error);
    res.status(500).json({ error: "Failed to add prospect" });
  }
});

// ============================================
// PATCH /prospects/:id — Update prospect (stage change, notes, etc.)
// ============================================

router.patch("/prospects/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user! as AuthenticatedUser;
    const { id } = req.params;
    const { stage, notes, nextStepDate, inviteSentAt, name, email, phone, source, approach } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (stage !== undefined) { updates.push(`stage = $${idx++}`); values.push(stage); }
    if (notes !== undefined) { updates.push(`notes = $${idx++}`); values.push(notes); }
    if (nextStepDate !== undefined) { updates.push(`next_step_date = $${idx++}`); values.push(nextStepDate); }
    if (inviteSentAt !== undefined) { updates.push(`invite_sent_at = $${idx++}`); values.push(inviteSentAt); }
    if (name !== undefined) { updates.push(`name = $${idx++}`); values.push(name); }
    if (email !== undefined) { updates.push(`email = $${idx++}`); values.push(email); }
    if (phone !== undefined) { updates.push(`phone = $${idx++}`); values.push(phone); }
    if (source !== undefined) { updates.push(`source = $${idx++}`); values.push(source); }
    if (approach !== undefined) { updates.push(`approach = $${idx++}`); values.push(approach); }

    if (updates.length === 0) {
      return res.json({ success: true });
    }

    updates.push("updated_at = NOW()");

    const idIdx = idx++;
    const recruiterIdx = idx;
    values.push(id, user.id);

    const result = await pool.query(
      `UPDATE recruit_prospects SET ${updates.join(", ")} WHERE id = $${idIdx} AND recruiter_id = $${recruiterIdx} RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Prospect not found" });
    }

    const r = result.rows[0];
    const prospect = {
      id: r.id,
      recruiterId: r.recruiter_id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      source: r.source,
      approach: r.approach,
      stage: r.stage,
      notes: r.notes,
      nextStepDate: r.next_step_date,
      inviteSentAt: r.invite_sent_at,
      addedDate: r.created_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };

    res.json({ prospect });
  } catch (error: any) {
    console.error("[Recruiting] Error updating prospect:", error);
    res.status(500).json({ error: "Failed to update prospect" });
  }
});

// ============================================
// DELETE /prospects/:id — Remove prospect
// ============================================

router.delete("/prospects/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user! as AuthenticatedUser;
    await pool.query(
      "DELETE FROM recruit_prospects WHERE id = $1 AND recruiter_id = $2",
      [req.params.id, user.id],
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error("[Recruiting] Error deleting prospect:", error);
    res.status(500).json({ error: "Failed to delete prospect" });
  }
});

// ============================================
// GET /stats — Recruiting funnel stats
// ============================================

router.get("/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user! as AuthenticatedUser;

    const stageResult = await pool.query(
      "SELECT stage, COUNT(*) as count FROM recruit_prospects WHERE recruiter_id = $1 GROUP BY stage",
      [user.id],
    );

    const totalResult = await pool.query(
      "SELECT COUNT(*) as total FROM recruit_prospects WHERE recruiter_id = $1",
      [user.id],
    );

    res.json({
      total: parseInt(totalResult.rows[0]?.total || "0"),
      stages: stageResult.rows.reduce(
        (acc: Record<string, number>, r: any) => {
          acc[r.stage] = parseInt(r.count);
          return acc;
        },
        {},
      ),
    });
  } catch (error: any) {
    console.error("[Recruiting] Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
