/**
 * lifeOS — read-only release endpoints for Heritage.
 *
 * Authoring (POST/PATCH/DELETE) lives only in the Gold Coast deploy. The
 * shared Neon DB means Heritage users see the same releases that founders
 * publish from goldcoastfinancial.co/founders/lifeos.
 *
 * Mounted at /api/lifeos. Surfaces:
 *   GET  /version                       — deployed bundle version
 *   GET  /releases/latest               — most recent published release
 *   GET  /releases                      — paginated archive
 *   GET  /releases/:version             — full body for one version
 *   GET  /me/status                     — what the current user should see
 *   POST /me/ack                        — record popup/update/notes ack
 */
import { Router } from "express";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";
import {
  LIFEOS_VERSION,
  LIFEOS_ACK_STATES,
  compareLifeOSVersions,
  type LifeOSAckState,
} from "../../shared/lifeos";

const router = Router();
const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)$/;

router.get("/version", (_req, res) => {
  res.json({ deployed_version: LIFEOS_VERSION });
});

router.get("/releases/latest", async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, version, release_type, title, summary, body_markdown,
              highlight_label, published_at, published_by
         FROM lifeos_releases
        WHERE status = 'published'
        ORDER BY published_at DESC NULLS LAST
        LIMIT 1`,
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "No published releases" });
    res.json(r.rows[0]);
  } catch (e: any) {
    console.error("[lifeOS] latest error:", e?.message);
    res.status(500).json({ error: "Failed to load latest release" });
  }
});

router.get("/releases", async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? "20"), 10) || 20, 100);
    const offset = Math.max(parseInt(String(req.query.offset ?? "0"), 10) || 0, 0);
    const r = await pool.query(
      `SELECT id, version, release_type, title, summary, highlight_label,
              published_at, published_by
         FROM lifeos_releases
        WHERE status = 'published'
        ORDER BY published_at DESC NULLS LAST
        LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    res.json({ releases: r.rows, limit, offset });
  } catch (e: any) {
    console.error("[lifeOS] list error:", e?.message);
    res.status(500).json({ error: "Failed to load releases" });
  }
});

router.get("/releases/:version", async (req, res) => {
  const v = String(req.params.version || "");
  if (!SEMVER_RE.test(v)) return res.status(400).json({ error: "Invalid version" });
  try {
    const r = await pool.query(
      `SELECT id, version, release_type, title, summary, body_markdown,
              highlight_label, status, published_at, published_by
         FROM lifeos_releases
        WHERE version = $1 AND status = 'published'`,
      [v],
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "Release not found" });
    res.json(r.rows[0]);
  } catch (e: any) {
    console.error("[lifeOS] release-by-version error:", e?.message);
    res.status(500).json({ error: "Failed to load release" });
  }
});

router.get("/me/status", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user!.id;
    const clientVersion = String(req.query.client_version ?? "");
    const r = await pool.query(
      `SELECT lr.id, lr.version, lr.release_type, lr.title, lr.summary,
              lr.highlight_label, lr.published_at,
              EXISTS (
                SELECT 1 FROM user_release_acks ura
                 WHERE ura.user_id = $1 AND ura.release_id = lr.id
                   AND ura.state = 'notes_viewed'
              ) AS notes_viewed,
              EXISTS (
                SELECT 1 FROM user_release_acks ura
                 WHERE ura.user_id = $1 AND ura.release_id = lr.id
                   AND ura.state = 'dismissed'
                   AND ura.acked_at > NOW() - INTERVAL '24 hours'
              ) AS dismissed_recently
         FROM lifeos_releases lr
        WHERE lr.status = 'published'
        ORDER BY lr.published_at DESC NULLS LAST
        LIMIT 1`,
      [userId],
    );
    const latest = r.rows[0] || null;
    const validClientVersion = SEMVER_RE.test(clientVersion) ? clientVersion : null;
    const updateAvailable = validClientVersion
      ? compareLifeOSVersions(validClientVersion, LIFEOS_VERSION) < 0
      : false;
    res.json({
      deployed_version: LIFEOS_VERSION,
      your_version: validClientVersion,
      update_available: updateAvailable,
      latest_release: latest
        ? {
            id: latest.id,
            version: latest.version,
            release_type: latest.release_type,
            title: latest.title,
            summary: latest.summary,
            highlight_label: latest.highlight_label,
            published_at: latest.published_at,
            notes_viewed: !!latest.notes_viewed,
            dismissed_recently: !!latest.dismissed_recently,
          }
        : null,
    });
  } catch (e: any) {
    console.error("[lifeOS] me/status error:", e?.message);
    res.status(500).json({ error: "Failed to load status" });
  }
});

router.post("/me/ack", requireAuth, async (req, res) => {
  try {
    const { release_id, state } = req.body ?? {};
    if (!release_id || typeof release_id !== "string") {
      return res.status(400).json({ error: "release_id required" });
    }
    if (!LIFEOS_ACK_STATES.includes(state as LifeOSAckState)) {
      return res.status(400).json({ error: "Invalid ack state" });
    }
    await pool.query(
      `INSERT INTO user_release_acks (user_id, release_id, state, acked_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, release_id, state) DO UPDATE SET acked_at = NOW()`,
      [(req as any).user!.id, release_id, state],
    );
    res.json({ success: true });
  } catch (e: any) {
    console.error("[lifeOS] ack error:", e?.message);
    res.status(500).json({ error: "Failed to record acknowledgement" });
  }
});

export default router;
