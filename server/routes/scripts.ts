/**
 * Scripts API Routes
 * Handles sales scripts CRUD, favorites, and usage tracking
 *
 * GET    /api/scripts            — List all active scripts (with favorite status for current agent)
 * POST   /api/scripts/:id/favorite    — Toggle favorite for current agent
 * POST   /api/scripts/:id/track-usage — Increment usage count
 *
 * Governance: Forge (backend)
 */

import { Router, type Request, type Response } from "express";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET / — List all active scripts (with favorite status for current agent)
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const result = await pool.query(
      `SELECT s.*,
              sf.id IS NOT NULL as is_favorite
       FROM scripts s
       LEFT JOIN script_favorites sf ON sf.script_id = s.id AND sf.agent_user_id = $1
       WHERE s.is_active = true
       ORDER BY s.name ASC`,
      [user.id]
    );
    res.json({ scripts: result.rows });
  } catch (error) {
    console.error("Error fetching scripts:", error);
    res.status(500).json({ error: "Failed to fetch scripts" });
  }
});

// POST /:id/favorite — Toggle favorite
router.post("/:id/favorite", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    // Check if already favorited
    const existing = await pool.query(
      "SELECT id FROM script_favorites WHERE agent_user_id = $1 AND script_id = $2",
      [user.id, id]
    );

    if (existing.rows[0]) {
      await pool.query(
        "DELETE FROM script_favorites WHERE agent_user_id = $1 AND script_id = $2",
        [user.id, id]
      );
      res.json({ favorited: false });
    } else {
      await pool.query(
        "INSERT INTO script_favorites (agent_user_id, script_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [user.id, id]
      );
      res.json({ favorited: true });
    }
  } catch (error) {
    console.error("Error toggling script favorite:", error);
    res.status(500).json({ error: "Failed to toggle favorite" });
  }
});

// POST /:id/track-usage — Increment usage count
router.post("/:id/track-usage", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE scripts SET usage_count = usage_count + 1, updated_at = NOW() WHERE id = $1",
      [id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error tracking script usage:", error);
    res.status(500).json({ error: "Failed to track usage" });
  }
});

export default router;
