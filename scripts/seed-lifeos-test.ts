/**
 * Seed a test lifeOS release for visual / functional verification.
 *
 * Inserts version 1.0.99 (well above the deployed 1.0.0 so the Update
 * Available popup fires for every signed-in user within 60s). Idempotent:
 * re-running deletes any pre-existing 1.0.99 release first so the test
 * stays clean. Pass --delete to remove the test release without seeding.
 *
 * Run:
 *   npx tsx scripts/seed-lifeos-test.ts            # seed
 *   npx tsx scripts/seed-lifeos-test.ts --delete   # cleanup
 */
import "dotenv/config";
import { pool } from "../server/db";

const TEST_VERSION = "1.0.99";

const BODY_MARKDOWN = `## Notifications

- Bell-icon entries now fire on every published release, so nobody misses a release that happened while they were offline.
- Successful updates trigger a clean toast confirming the new version.
- A softer reminder lands in the bell 24 hours after dismissing an update.

## Founders Console

- The Type dropdown in the release editor now matches every other Founders Lounge form — themed instead of OS-default.
- Live-on-prod vs latest-published-note is now distinct in the admin ribbon; an amber warning fires if you try to publish notes for a version that isn't deployed yet.

## Security & Reliability

- Backend validates every UUID + caps body sizes before any database write.
- Service Worker cache names are versioned per release; old caches are reaped on activate.
- A kill-switch service worker file is available for disaster recovery.
- Multi-tab coordination via BroadcastChannel — Update Now in one tab reloads siblings.
`;

async function main() {
  const wantDelete = process.argv.includes("--delete");

  // Always clean any existing test row first so re-runs reseed cleanly.
  const cleanup = await pool.query(
    `DELETE FROM lifeos_releases WHERE version = $1 RETURNING id`,
    [TEST_VERSION],
  );
  if (cleanup.rowCount && cleanup.rowCount > 0) {
    console.log(`Removed ${cleanup.rowCount} existing 1.0.99 release row(s).`);
    // CASCADE will already nuke user_release_acks for these.
  }

  if (wantDelete) {
    console.log("Cleanup-only mode — exiting.");
    await pool.end();
    return;
  }

  const result = await pool.query(
    `INSERT INTO lifeos_releases (version, release_type, title, summary, body_markdown, highlight_label, status, published_at)
     VALUES ($1, 'minor', $2, $3, $4, 'TEST', 'published', NOW())
     RETURNING id, version, title`,
    [
      TEST_VERSION,
      "lifeOS 1.0.99 — Notifications + UX polish",
      "Bell entries, success toast, themed dropdown, and a 24h reminder for dismissed updates.",
      BODY_MARKDOWN,
    ],
  );

  console.log("Seeded test release:");
  console.log(`  id:      ${result.rows[0].id}`);
  console.log(`  version: ${result.rows[0].version}`);
  console.log(`  title:   ${result.rows[0].title}`);
  console.log("");
  console.log("Next: log into the Founders Lounge — within 60s the Update Available popup fires.");
  console.log("Cleanup later: npx tsx scripts/seed-lifeos-test.ts --delete");

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
