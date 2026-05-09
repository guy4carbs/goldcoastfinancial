/**
 * lifeOS — release notes + per-user update tracking.
 *
 * Mounted at /api/lifeos. Surfaces:
 *   GET  /version                       — deployed bundle version
 *   GET  /releases/latest               — most recent published release
 *   GET  /releases                      — paginated archive
 *   GET  /releases/:version             — full body for one version
 *   GET  /me/status                     — what the current user should see
 *   POST /me/ack                        — record popup/update/notes ack
 *
 *   (admin: founder + system_admin)
 *   POST   /releases                    — create draft
 *   PATCH  /releases/:id                — edit draft
 *   POST   /releases/:id/publish        — flip status -> published
 *   POST   /releases/:id/archive        — soft-unpublish
 *   DELETE /releases/:id                — hard-delete drafts only
 *
 * Both Gold Coast and Heritage hit the same DB tables — releases are
 * lifeOS-wide, not per-app.
 */
import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { Roles } from "../types/permissions";
import { logFounderAction } from "../services/founderAudit";
import {
  LIFEOS_VERSION,
  LIFEOS_RELEASE_TYPES,
  LIFEOS_ACK_STATES,
  compareLifeOSVersions,
  type LifeOSReleaseType,
  type LifeOSAckState,
} from "../../shared/lifeos";

const router = Router();

const ADMIN_ROLES = [Roles.FOUNDER, Roles.SYSTEM_ADMIN];

// Semver validation — server-side guard against malformed inputs.
const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)$/;

// ─────────────────────────────────────────────────────────────────────────
// PUBLIC (any authenticated user)
// ─────────────────────────────────────────────────────────────────────────

router.get("/version", requireAuth, (_req, res) => {
  res.json({ deployed_version: LIFEOS_VERSION });
});

router.get("/releases/latest", requireAuth, async (_req, res) => {
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

router.get("/releases", requireAuth, async (req, res) => {
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

router.get("/releases/:version", requireAuth, async (req, res) => {
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
  // Latest release the user has not yet `notes_viewed`. If client_version
  // < deployed_version the popup fires; if equal but there's an unviewed
  // release for this version, the WhatsNew modal fires.
  try {
    const userId = req.user!.id;
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
      [req.user!.id, release_id, state],
    );
    res.json({ success: true });
  } catch (e: any) {
    console.error("[lifeOS] ack error:", e?.message);
    res.status(500).json({ error: "Failed to record acknowledgement" });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// ADMIN (founder + system_admin only)
// ─────────────────────────────────────────────────────────────────────────

router.get("/admin/releases", requireAuth, requireRole(...ADMIN_ROLES), async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, version, release_type, title, summary, highlight_label,
              status, published_at, published_by, created_at, updated_at
         FROM lifeos_releases
        ORDER BY created_at DESC`,
    );
    res.json({ releases: r.rows });
  } catch (e: any) {
    console.error("[lifeOS] admin list error:", e?.message);
    res.status(500).json({ error: "Failed to load releases" });
  }
});

router.post("/releases", requireAuth, requireRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const { version, release_type, title, summary, body_markdown, highlight_label } = req.body ?? {};
    if (!SEMVER_RE.test(String(version || ""))) {
      return res.status(400).json({ error: "version must match X.Y.Z" });
    }
    if (!LIFEOS_RELEASE_TYPES.includes(release_type as LifeOSReleaseType)) {
      return res.status(400).json({ error: "release_type must be major | minor | patch" });
    }
    if (!title || !summary || !body_markdown) {
      return res.status(400).json({ error: "title, summary, body_markdown required" });
    }
    const r = await pool.query(
      `INSERT INTO lifeos_releases (version, release_type, title, summary, body_markdown, highlight_label, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft')
       RETURNING id, version, status, created_at`,
      [version, release_type, title, summary, body_markdown, highlight_label || null],
    );
    const row = r.rows[0];
    await logFounderAction({
      actorUserId: req.user!.id,
      action: "lifeos.release_created",
      entityType: "lifeos_release",
      entityId: row.id,
      payload: { version, release_type },
    });
    res.json(row);
  } catch (e: any) {
    if (String(e?.message || "").toLowerCase().includes("duplicate")) {
      return res.status(409).json({ error: "A release with this version already exists" });
    }
    console.error("[lifeOS] create error:", e?.message);
    res.status(500).json({ error: "Failed to create release" });
  }
});

router.patch("/releases/:id", requireAuth, requireRole(...ADMIN_ROLES), async (req, res) => {
  const id = String(req.params.id || "");
  const { title, summary, body_markdown, highlight_label, release_type } = req.body ?? {};
  try {
    // Drafts only — published rows are immutable per the SOC 2 audit contract.
    const cur = await pool.query(`SELECT status FROM lifeos_releases WHERE id = $1`, [id]);
    if (cur.rowCount === 0) return res.status(404).json({ error: "Release not found" });
    if (cur.rows[0].status !== "draft") {
      return res.status(403).json({ error: "Only draft releases are editable" });
    }
    const sets: string[] = [];
    const vals: any[] = [id];
    if (title !== undefined)        { vals.push(title);        sets.push(`title = $${vals.length}`); }
    if (summary !== undefined)      { vals.push(summary);      sets.push(`summary = $${vals.length}`); }
    if (body_markdown !== undefined){ vals.push(body_markdown); sets.push(`body_markdown = $${vals.length}`); }
    if (highlight_label !== undefined) { vals.push(highlight_label || null); sets.push(`highlight_label = $${vals.length}`); }
    if (release_type !== undefined && LIFEOS_RELEASE_TYPES.includes(release_type as LifeOSReleaseType)) {
      vals.push(release_type); sets.push(`release_type = $${vals.length}`);
    }
    if (sets.length === 0) return res.json({ success: true, noop: true });
    sets.push(`updated_at = NOW()`);
    await pool.query(`UPDATE lifeos_releases SET ${sets.join(", ")} WHERE id = $1`, vals);
    await logFounderAction({
      actorUserId: req.user!.id,
      action: "lifeos.release_edited",
      entityType: "lifeos_release",
      entityId: id,
      payload: { fields: sets.length },
    });
    res.json({ success: true });
  } catch (e: any) {
    console.error("[lifeOS] patch error:", e?.message);
    res.status(500).json({ error: "Failed to update release" });
  }
});

router.post("/releases/:id/publish", requireAuth, requireRole(...ADMIN_ROLES), async (req, res) => {
  const id = String(req.params.id || "");
  try {
    const cur = await pool.query(`SELECT status, version FROM lifeos_releases WHERE id = $1`, [id]);
    if (cur.rowCount === 0) return res.status(404).json({ error: "Release not found" });
    if (cur.rows[0].status === "published") return res.json({ success: true, noop: true });
    await pool.query(
      `UPDATE lifeos_releases
          SET status = 'published',
              published_at = NOW(),
              published_by = $2,
              updated_at = NOW()
        WHERE id = $1`,
      [id, req.user!.id],
    );
    await logFounderAction({
      actorUserId: req.user!.id,
      action: "lifeos.release_published",
      entityType: "lifeos_release",
      entityId: id,
      payload: { version: cur.rows[0].version },
    });
    res.json({ success: true });
  } catch (e: any) {
    console.error("[lifeOS] publish error:", e?.message);
    res.status(500).json({ error: "Failed to publish release" });
  }
});

router.post("/releases/:id/archive", requireAuth, requireRole(...ADMIN_ROLES), async (req, res) => {
  const id = String(req.params.id || "");
  try {
    const r = await pool.query(
      `UPDATE lifeos_releases SET status = 'archived', updated_at = NOW()
        WHERE id = $1 RETURNING version`,
      [id],
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "Release not found" });
    await logFounderAction({
      actorUserId: req.user!.id,
      action: "lifeos.release_archived",
      entityType: "lifeos_release",
      entityId: id,
      payload: { version: r.rows[0].version },
    });
    res.json({ success: true });
  } catch (e: any) {
    console.error("[lifeOS] archive error:", e?.message);
    res.status(500).json({ error: "Failed to archive release" });
  }
});

router.delete("/releases/:id", requireAuth, requireRole(...ADMIN_ROLES), async (req, res) => {
  const id = String(req.params.id || "");
  try {
    const cur = await pool.query(`SELECT status, version FROM lifeos_releases WHERE id = $1`, [id]);
    if (cur.rowCount === 0) return res.status(404).json({ error: "Release not found" });
    if (cur.rows[0].status !== "draft") {
      return res.status(403).json({ error: "Only draft releases are deletable. Archive published releases instead." });
    }
    await pool.query(`DELETE FROM lifeos_releases WHERE id = $1`, [id]);
    await logFounderAction({
      actorUserId: req.user!.id,
      action: "lifeos.release_deleted",
      entityType: "lifeos_release",
      entityId: id,
      payload: { version: cur.rows[0].version },
    });
    res.json({ success: true });
  } catch (e: any) {
    console.error("[lifeOS] delete error:", e?.message);
    res.status(500).json({ error: "Failed to delete release" });
  }
});

export default router;
