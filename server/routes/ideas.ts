/**
 * Ideas & Feedback API Routes
 * Handles idea submissions, upvoting, and retrieval
 *
 * GET    /api/ideas              — List all ideas (with upvote status for current user)
 * POST   /api/ideas              — Submit a new idea
 * POST   /api/ideas/:id/upvote   — Toggle upvote on an idea
 * DELETE /api/ideas/:id          — Delete own idea
 *
 * Governance: Forge (backend)
 */

import { Router, type Request, type Response } from "express";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET / — List all ideas with upvote status for current user
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { category, status, sort } = req.query;

    let query = `
      SELECT i.*,
             (SELECT COUNT(*) FROM idea_upvotes WHERE idea_id = i.id) as upvote_count,
             EXISTS(SELECT 1 FROM idea_upvotes WHERE idea_id = i.id AND user_id = $1) as user_upvoted
      FROM agent_ideas i
      WHERE 1=1
    `;
    const params: any[] = [user.id];
    let idx = 2;

    if (category && category !== 'all') {
      query += ` AND i.category = $${idx++}`;
      params.push(category);
    }
    if (status && status !== 'all') {
      query += ` AND i.status = $${idx++}`;
      params.push(status);
    }

    if (sort === 'upvotes') {
      query += ' ORDER BY upvote_count DESC, i.created_at DESC';
    } else {
      query += ' ORDER BY i.created_at DESC';
    }

    const result = await pool.query(query, params);

    // Compute stats
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM agent_ideas');
    const statusCounts = await pool.query("SELECT status, COUNT(*) as count FROM agent_ideas GROUP BY status");

    const stats = {
      total: parseInt(totalResult.rows[0]?.total || '0'),
      byStatus: statusCounts.rows.reduce((acc: any, r: any) => {
        acc[r.status] = parseInt(r.count);
        return acc;
      }, {}),
    };

    res.json({ ideas: result.rows, stats });
  } catch (error) {
    console.error("Error fetching ideas:", error);
    res.status(500).json({ error: "Failed to fetch ideas" });
  }
});

// POST / — Submit a new idea
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { title, description, category, priority } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Agent';

    const result = await pool.query(`
      INSERT INTO agent_ideas (title, description, category, priority, submitted_by, submitted_by_name)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title.trim(), description.trim(), category || 'feature_request', priority || 'medium', user.id, userName]);

    res.status(201).json({ idea: result.rows[0] });
  } catch (error) {
    console.error("Error submitting idea:", error);
    res.status(500).json({ error: "Failed to submit idea" });
  }
});

// POST /:id/upvote — Toggle upvote
router.post("/:id/upvote", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const existing = await pool.query(
      'SELECT id FROM idea_upvotes WHERE idea_id = $1 AND user_id = $2',
      [id, user.id]
    );

    if (existing.rows[0]) {
      await pool.query('DELETE FROM idea_upvotes WHERE idea_id = $1 AND user_id = $2', [id, user.id]);
      res.json({ upvoted: false });
    } else {
      await pool.query(
        'INSERT INTO idea_upvotes (idea_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [id, user.id]
      );
      res.json({ upvoted: true });
    }
  } catch (error) {
    console.error("Error toggling upvote:", error);
    res.status(500).json({ error: "Failed to toggle upvote" });
  }
});

// DELETE /:id — Delete own idea
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    await pool.query(
      'DELETE FROM agent_ideas WHERE id = $1 AND submitted_by = $2',
      [req.params.id, user.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting idea:", error);
    res.status(500).json({ error: "Failed to delete idea" });
  }
});

export default router;
