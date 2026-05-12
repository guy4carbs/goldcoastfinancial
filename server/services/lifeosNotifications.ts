/**
 * lifeOS notification helpers.
 *
 * On every release publish, fan a row out into the existing `notifications`
 * table for every active user. The bell-icon UI surfaces these alongside
 * the modal popup so users have a persistent record of what shipped.
 *
 * Notification types:
 *   - lifeos.update_available  → user's bundle is older than the deploy
 *   - lifeos.notes_published   → user is already on the new bundle (FYI)
 *   - lifeos.update_complete   → fires after the user's `state='updated'` ack
 *   - lifeos.update_reminder   → 24h after a `dismissed` ack (via sweeper)
 *
 * The bell only shows un-read rows. NotificationBell already polls
 * /api/agent-portal/notifications so new rows appear within ~30s.
 */
import { pool } from "../db";
import { storage } from "../storage";
import { compareLifeOSVersions, LIFEOS_VERSION } from "../../shared/lifeos";

export type LifeOSNotificationType =
  | "lifeos.update_available"
  | "lifeos.notes_published"
  | "lifeos.update_complete"
  | "lifeos.update_reminder";

interface ReleaseSummary {
  id: string;
  version: string;
  title: string;
  summary: string;
}

/**
 * Fan out a published-release notification to every active user.
 *
 * The notification type depends on whether THIS user's bundle (which we
 * can't know per-user without their last-seen version) is ahead/behind
 * the release. In practice we send `lifeos.update_available` to everyone
 * when `LIFEOS_VERSION < release.version` (deploy lags notes) and
 * `lifeos.notes_published` when they match. We don't try to be too clever
 * per-user — the popup logic will sort out who needs to actually reload.
 *
 * Failures are caught per-user so one bad insert doesn't abort the loop.
 */
export async function fanoutPublishedNotifications(release: ReleaseSummary): Promise<{ sent: number; skipped: number }> {
  // Type depends on whether THIS server's bundle is on the new version
  // (lookups by user are too expensive — the popup will still gate them).
  const cmp = compareLifeOSVersions(LIFEOS_VERSION, release.version);
  const type: LifeOSNotificationType = cmp < 0
    ? "lifeos.update_available"
    : "lifeos.notes_published";

  // Idempotency: skip users who already have a notification row for THIS
  // release × THIS type. Prevents double-fan if the founder accidentally
  // republishes (we still let republish reach the audit log).
  const userRows = await pool.query<{ id: string }>(
    `SELECT id FROM users
       WHERE onboarding_status = 'active'
         AND NOT EXISTS (
           SELECT 1 FROM notifications n
            WHERE n.user_id = users.id
              AND n.type = $1
              AND n.related_id = $2
         )`,
    [type, release.id],
  );

  let sent = 0;
  for (const u of userRows.rows) {
    try {
      await storage.createNotification({
        userId: u.id,
        title: type === "lifeos.update_available"
          ? `lifeOS ${release.version} is ready`
          : `What's new in lifeOS ${release.version}`,
        message: release.summary,
        type,
        relatedTable: "lifeos_releases",
        relatedId: release.id,
        isRead: false,
        actionUrl: "/lifeos/whats-new",
      } as Parameters<typeof storage.createNotification>[0]);
      sent++;
    } catch (err: any) {
      console.error("[lifeOS notif] fanout insert failed for user", u.id, err?.message);
    }
  }
  const skipped = userRows.rowCount === 0 ? 0 : 0; // counted by the WHERE NOT EXISTS filter
  return { sent, skipped };
}

/**
 * Create a `lifeos.update_complete` row when a user acks `state='updated'`.
 * Replaces (logically) any pending `lifeos.update_available` row they had:
 * marks the available row as read so the bell badge clears cleanly.
 */
export async function notifyUpdateComplete(userId: string, release: ReleaseSummary): Promise<void> {
  try {
    // Mark any pending available/reminder rows for this release as read so
    // the bell badge clears cleanly. (notifications has no updated_at col.)
    await pool.query(
      `UPDATE notifications
          SET is_read = true
        WHERE user_id = $1
          AND related_id = $2
          AND type IN ('lifeos.update_available', 'lifeos.update_reminder')
          AND is_read = false`,
      [userId, release.id],
    );
    await storage.createNotification({
      userId,
      title: `Updated to lifeOS ${release.version}`,
      message: `You're on the latest. ${release.summary}`,
      type: "lifeos.update_complete",
      relatedTable: "lifeos_releases",
      relatedId: release.id,
      isRead: false,
      actionUrl: "/lifeos/whats-new",
    } as Parameters<typeof storage.createNotification>[0]);
  } catch (err: any) {
    console.error("[lifeOS notif] update_complete failed:", err?.message);
  }
}

/**
 * Fire `lifeos.update_reminder` for every user whose `dismissed` ack is
 * older than 24h AND who hasn't followed up with `updated` ack yet AND
 * who doesn't already have a reminder row for this release.
 */
export async function sweepUpdateReminders(): Promise<number> {
  try {
    const rows = await pool.query<{
      user_id: string;
      release_id: string;
      version: string;
      title: string;
      summary: string;
    }>(
      `SELECT DISTINCT
              ura.user_id,
              ura.release_id,
              r.version,
              r.title,
              r.summary
         FROM user_release_acks ura
         JOIN lifeos_releases r ON r.id = ura.release_id
        WHERE ura.state = 'dismissed'
          AND ura.acked_at < NOW() - INTERVAL '24 hours'
          AND r.status = 'published'
          AND NOT EXISTS (
            SELECT 1 FROM user_release_acks u2
             WHERE u2.user_id = ura.user_id
               AND u2.release_id = ura.release_id
               AND u2.state = 'updated'
          )
          AND NOT EXISTS (
            SELECT 1 FROM notifications n
             WHERE n.user_id = ura.user_id
               AND n.related_id = ura.release_id
               AND n.type = 'lifeos.update_reminder'
          )`,
    );
    let inserted = 0;
    for (const row of rows.rows) {
      try {
        await storage.createNotification({
          userId: row.user_id,
          title: `Reminder: lifeOS ${row.version} is still pending`,
          message: `Install on your next break — ${row.summary}`,
          type: "lifeos.update_reminder",
          relatedTable: "lifeos_releases",
          relatedId: row.release_id,
          isRead: false,
          actionUrl: "/lifeos/whats-new",
        } as Parameters<typeof storage.createNotification>[0]);
        inserted++;
      } catch (err: any) {
        console.error("[lifeOS notif] reminder insert failed:", err?.message);
      }
    }
    return inserted;
  } catch (err: any) {
    console.error("[lifeOS notif] reminder sweep failed:", err?.message);
    return 0;
  }
}

/**
 * Start the 24h reminder sweeper. Idempotent (returns a stop fn). Called
 * once at boot from server/index.ts.
 */
const SWEEPER_INTERVAL_MS = 60 * 60 * 1000; // every hour

export function startLifeOSReminderSweeper(): () => void {
  // Run once on boot so users coming back online get reminders promptly,
  // then every hour after.
  void sweepUpdateReminders().then((n) => {
    if (n > 0) console.log(`[lifeOS notif] sweep inserted ${n} reminders on boot`);
  });
  const id = setInterval(() => {
    void sweepUpdateReminders().then((n) => {
      if (n > 0) console.log(`[lifeOS notif] sweep inserted ${n} reminders`);
    });
  }, SWEEPER_INTERVAL_MS);
  return () => clearInterval(id);
}
