/**
 * Force-seed all four lifeOS notification types for a specific user so the
 * bell drop-down has content to display while QA'ing.
 *
 * Usage:
 *   npx tsx scripts/seed-lifeos-notifications-for-user.ts <email>
 *   npx tsx scripts/seed-lifeos-notifications-for-user.ts <email> --delete
 */
import "dotenv/config";
import { pool } from "../server/db";

const TEST_VERSION = "1.0.99";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/seed-lifeos-notifications-for-user.ts <email> [--delete]");
    process.exit(1);
  }
  const del = process.argv.includes("--delete");

  const u = await pool.query<{ id: string }>(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [email]);
  if (!u.rowCount) {
    console.error(`No user with email ${email}`);
    process.exit(1);
  }
  const userId = u.rows[0].id;

  const r = await pool.query<{ id: string; version: string; title: string; summary: string }>(
    `SELECT id, version, title, summary FROM lifeos_releases WHERE version = $1`,
    [TEST_VERSION],
  );
  if (!r.rowCount) {
    console.error(`No release with version ${TEST_VERSION} — run scripts/seed-lifeos-test.ts first.`);
    process.exit(1);
  }
  const release = r.rows[0];

  if (del) {
    const x = await pool.query(`DELETE FROM notifications WHERE user_id = $1 AND related_id = $2`, [userId, release.id]);
    console.log(`Deleted ${x.rowCount} notifications for ${email} / release ${TEST_VERSION}`);
    await pool.end();
    return;
  }

  await pool.query(`DELETE FROM notifications WHERE user_id = $1 AND related_id = $2`, [userId, release.id]);

  const rows: Array<{ type: string; title: string; message: string }> = [
    {
      type: "lifeos.update_available",
      title: `lifeOS ${release.version} is ready`,
      message: release.summary,
    },
    {
      type: "lifeos.notes_published",
      title: `What's new in lifeOS ${release.version}`,
      message: release.summary,
    },
    {
      type: "lifeos.update_complete",
      title: `Updated to lifeOS ${release.version}`,
      message: `You're on the latest. ${release.summary}`,
    },
    {
      type: "lifeos.update_reminder",
      title: `Reminder: lifeOS ${release.version} is still pending`,
      message: `Install on your next break — ${release.summary}`,
    },
  ];

  for (const row of rows) {
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, is_read, action_url, related_table, related_id)
       VALUES ($1, $2, $3, $4, false, $5, 'lifeos_releases', $6)`,
      [userId, row.title, row.message, row.type, "/lifeos/whats-new", release.id],
    );
  }

  console.log(`Seeded ${rows.length} notifications for ${email} (user_id ${userId})`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
