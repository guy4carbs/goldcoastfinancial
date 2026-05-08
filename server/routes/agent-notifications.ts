import { Router } from "express";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";
import { storage } from "../storage";

const router = Router();
router.use(requireAuth);

/**
 * Virtual warnings computed at fetch time — NOT persisted.
 * These are derived from the agent's current data (E&O expiration, license
 * expirations) so they stay live with the underlying records. They merge in
 * alongside the persistent notifications from the `notifications` table.
 */
async function computeExpirationWarnings(userId: string) {
  const warnings: Array<{
    id: string;
    userId: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    actionUrl: string | null;
    createdAt: Date;
    virtual: true;
  }> = [];

  try {
    const r = await pool.query(
      `SELECT ap.eo_expiration_date, ap.eo_provider
       FROM agent_profiles ap
       WHERE ap.user_id = $1`,
      [userId]
    );
    const eoExp: Date | null = r.rows[0]?.eo_expiration_date ? new Date(r.rows[0].eo_expiration_date) : null;
    if (eoExp && !isNaN(eoExp.getTime())) {
      const days = Math.floor((eoExp.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (days <= 0) {
        warnings.push({
          id: "virt-eo-expired",
          userId,
          title: "E&O policy has expired",
          message: `Your Errors & Omissions policy expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago. Upload a renewed certificate to keep writing business.`,
          type: "expiration",
          isRead: false,
          actionUrl: "/agents/data-encryption",
          createdAt: eoExp,
          virtual: true,
        });
      } else if (days <= 60) {
        warnings.push({
          id: `virt-eo-${days}d`,
          userId,
          title: "E&O policy expiring soon",
          message: `Your E&O coverage expires in ${days} day${days === 1 ? "" : "s"}. Upload your renewed certificate before it lapses.`,
          type: "expiration",
          isRead: false,
          actionUrl: "/agents/data-encryption",
          createdAt: new Date(),
          virtual: true,
        });
      }
    }
  } catch (err) {
    // Soft-fail — don't block notifications if agent_profiles lookup errors
    console.warn("[agent-notifications] E&O expiration check failed:", err);
  }

  try {
    const r = await pool.query(
      `SELECT state_code, expiration_date
       FROM agent_licenses
       WHERE user_id = $1 AND expiration_date IS NOT NULL
       ORDER BY expiration_date ASC`,
      [userId]
    );
    for (const row of r.rows) {
      const exp = new Date(row.expiration_date);
      if (isNaN(exp.getTime())) continue;
      const days = Math.floor((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (days <= 0) {
        warnings.push({
          id: `virt-lic-exp-${row.state_code}`,
          userId,
          title: `${row.state_code} license expired`,
          message: `Your ${row.state_code} license expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago. Contact your administrator for renewal support.`,
          type: "expiration",
          isRead: false,
          actionUrl: "/agents/getting-started",
          createdAt: exp,
          virtual: true,
        });
      } else if (days <= 60) {
        warnings.push({
          id: `virt-lic-${row.state_code}-${days}d`,
          userId,
          title: `${row.state_code} license expiring soon`,
          message: `Your ${row.state_code} license expires in ${days} day${days === 1 ? "" : "s"}. Reach out to your admin so we can start the renewal.`,
          type: "expiration",
          isRead: false,
          actionUrl: "/agents/getting-started",
          createdAt: new Date(),
          virtual: true,
        });
      }
    }
  } catch (err) {
    console.warn("[agent-notifications] License expiration check failed:", err);
  }

  return warnings;
}

/**
 * Seed a welcome notification the first time the agent hits the endpoint,
 * so the bell isn't blank for brand-new accounts.
 */
async function seedIfEmpty(userId: string) {
  try {
    const existing = await storage.getNotificationsByUserId(userId);
    if (existing.length > 0) return;
    await storage.createNotification({
      userId,
      title: "Welcome to Heritage Life Solutions",
      message: "Your application has been approved. You can now log in to access your portal. Take the walkthrough any time from the bottom-right.",
      type: "welcome",
      actionUrl: "/agents/dashboard",
    });
  } catch (err) {
    console.warn("[agent-notifications] Seed failed:", err);
  }
}

// GET /api/agent-portal/notifications
router.get("/", async (req, res) => {
  try {
    const userId = req.user!.id;
    await seedIfEmpty(userId);
    const [persisted, virtual] = await Promise.all([
      storage.getNotificationsByUserId(userId),
      computeExpirationWarnings(userId),
    ]);
    // Virtual notifications first (most urgent / time-sensitive), then persisted desc
    const merged = [...virtual, ...persisted];
    res.json(merged);
  } catch (err) {
    console.error("[agent-notifications] list failed:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// GET /api/agent-portal/notifications/unread-count
router.get("/unread-count", async (req, res) => {
  try {
    const userId = req.user!.id;
    const [persistedCount, virtual] = await Promise.all([
      storage.getUnreadNotificationCount(userId),
      computeExpirationWarnings(userId),
    ]);
    const virtualUnread = virtual.filter((v) => !v.isRead).length;
    res.json({ count: persistedCount + virtualUnread });
  } catch (err) {
    console.error("[agent-notifications] unread-count failed:", err);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
});

// PATCH /api/agent-portal/notifications/:id/read
router.patch("/:id/read", async (req, res) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id || "");
    // Virtual notifications can't be marked read server-side — they're re-derived
    // on next fetch. The client-side bell drops them from its unread count locally.
    if (id.startsWith("virt-")) return res.json({ ok: true, virtual: true });

    // Verify ownership before mutating — prevents a caller with a UUID from
    // flipping read-state on another user's notification.
    const owned = await pool.query(
      "SELECT 1 FROM notifications WHERE id::text = $1 AND user_id::text = $2",
      [id, userId]
    );
    if (owned.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    await storage.markNotificationAsRead(id);
    res.json({ ok: true });
  } catch (err) {
    console.error("[agent-notifications] mark read failed:", err);
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

// PATCH /api/agent-portal/notifications/read-all
router.patch("/read-all", async (req, res) => {
  try {
    await storage.markAllNotificationsAsRead(req.user!.id);
    res.json({ ok: true });
  } catch (err) {
    console.error("[agent-notifications] mark-all-read failed:", err);
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

export default router;
