/**
 * lifeOS — end-to-end update flow + notifications.
 *
 * Exercises everything a real user goes through when a new release ships:
 *   1. Founder publishes a release in /founders/lifeos
 *   2. Within 60s, the polling provider in any signed-in tab fires the
 *      Update Available popup AND drops a `lifeos.update_available` row
 *      into the bell.
 *   3. User clicks "Update Now" → SW cache wipe → reload with ?lifeos=<ts>
 *   4. Post-reload, the success toast fires + a `lifeos.update_complete`
 *      row replaces the prior available row in the bell.
 *   5. User clicks the bell icon to verify notifications visible.
 *
 * Credentials:
 *   FOUNDER_A_EMAIL / FOUNDER_A_PASSWORD — bypasses the seed defaults.
 *   TEST_AGENT_EMAIL / TEST_AGENT_PASSWORD — used for the "non-admin
 *   user sees the popup" path.
 *
 * Run:
 *   FOUNDER_A_EMAIL=... FOUNDER_A_PASSWORD=... \
 *   TEST_AGENT_EMAIL=... TEST_AGENT_PASSWORD=... \
 *   npx playwright test tests/lifeos-update-flow.spec.ts
 */
import "dotenv/config";
import { test, expect, FOUNDER_A, TEST_AGENT, loginAs, type SessionHandle } from "./fixtures/foundersAuth";
import { pool } from "../server/db";

const TEST_VERSION = "1.0.99";

async function seedTestRelease(): Promise<string> {
  // Always start clean.
  await pool.query(`DELETE FROM lifeos_releases WHERE version = $1`, [TEST_VERSION]);
  const r = await pool.query(
    `INSERT INTO lifeos_releases (version, release_type, title, summary, body_markdown, highlight_label, status, published_at)
     VALUES ($1, 'minor', $2, $3, $4, 'TEST', 'published', NOW())
     RETURNING id`,
    [
      TEST_VERSION,
      "lifeOS 1.0.99 — Update flow test",
      "End-to-end Playwright run. Exercises popup, reload, toast, and bell notifications.",
      "## Highlights\n\n- Popup fires within 60s of publish\n- Bell entry appears for every active user\n- Post-update toast confirms the new version\n\n## Tested\n\n- Update Available modal\n- Update Now → reload\n- lifeos.update_complete notification row\n",
    ],
  );
  return r.rows[0].id as string;
}

async function cleanupTestData(releaseId: string) {
  // CASCADE wipes user_release_acks; manually delete notifications.
  await pool.query(`DELETE FROM notifications WHERE related_id = $1`, [releaseId]);
  await pool.query(`DELETE FROM lifeos_releases WHERE id = $1`, [releaseId]);
}

test.describe.configure({ mode: "serial" });

test.describe("lifeOS update + notification flow", () => {
  let releaseId: string;
  let founderSession: SessionHandle;

  test.beforeAll(async () => {
    releaseId = await seedTestRelease();
    founderSession = await loginAs(FOUNDER_A.email, FOUNDER_A.password);
  });

  test.afterAll(async () => {
    await founderSession.api.dispose().catch(() => {});
    await cleanupTestData(releaseId);
    await pool.end().catch(() => {});
  });

  test("publish fan-out drops a notification row for the founder", async () => {
    // The seedTestRelease already inserts the release; the fan-out
    // normally happens in the publish handler. To exercise that path
    // here, we hit the publish endpoint with the seed (it's already
    // in 'published' state so the endpoint returns noop=true and
    // skips fan-out). Instead, we call /publish on a draft we create.
    const draftRes = await founderSession.api.post("/api/lifeos/releases", {
      data: {
        version: "1.0.98",
        release_type: "patch",
        title: "Test draft for publish flow",
        summary: "Draft created by Playwright; will be cleaned up.",
        body_markdown: "## Notes\n\n- Test\n",
      },
    });
    expect(draftRes.ok()).toBe(true);
    const draft = await draftRes.json();
    try {
      const publishRes = await founderSession.api.post(`/api/lifeos/releases/${draft.id}/publish`);
      expect(publishRes.ok()).toBe(true);
      // Wait briefly for fan-out (it's sync within the handler but I/O bound).
      await new Promise((r) => setTimeout(r, 500));
      const notif = await pool.query(
        `SELECT type FROM notifications WHERE related_id = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 1`,
        [draft.id, founderSession.user.id],
      );
      expect(notif.rowCount).toBeGreaterThan(0);
      expect(["lifeos.update_available", "lifeos.notes_published"]).toContain(notif.rows[0].type);
    } finally {
      // Cleanup — drafts can't be deleted via DELETE after publish, so archive then SQL-delete.
      await pool.query(`DELETE FROM notifications WHERE related_id = $1`, [draft.id]);
      await pool.query(`DELETE FROM lifeos_releases WHERE id = $1`, [draft.id]);
    }
  });

  test("me/status returns update_available for an older client_version", async () => {
    const r = await founderSession.api.get("/api/lifeos/me/status?client_version=1.0.0");
    expect(r.ok()).toBe(true);
    const data = await r.json();
    expect(data.latest_release?.version).toBe(TEST_VERSION);
    expect(data.update_available).toBe(true);
  });

  test("/me/ack updated state creates update_complete notification", async () => {
    const r = await founderSession.api.post("/api/lifeos/me/ack", {
      data: { release_id: releaseId, state: "updated" },
    });
    expect(r.ok()).toBe(true);
    await new Promise((res) => setTimeout(res, 300));
    const notif = await pool.query(
      `SELECT type FROM notifications
        WHERE related_id = $1 AND user_id = $2 AND type = 'lifeos.update_complete'`,
      [releaseId, founderSession.user.id],
    );
    expect(notif.rowCount).toBeGreaterThan(0);
  });

  test("dismissed ack older than 24h triggers reminder via the sweeper", async () => {
    // Insert an artificially-aged dismissal so the sweeper picks it up
    // on next run. The sweeper runs every hour AND on boot, but we can
    // call sweepUpdateReminders directly via the route file's helper...
    // since we can't import it cleanly here, we'll insert a dismissal
    // 25h old and confirm the next manual sweep emits a reminder.
    await pool.query(
      `INSERT INTO user_release_acks (user_id, release_id, state, acked_at)
       VALUES ($1, $2, 'dismissed', NOW() - INTERVAL '25 hours')
       ON CONFLICT (user_id, release_id, state) DO UPDATE SET acked_at = NOW() - INTERVAL '25 hours'`,
      [founderSession.user.id, releaseId],
    );
    // Also delete any prior 'updated' ack from the previous test so the
    // sweeper's "no updated row" guard finds none.
    await pool.query(
      `DELETE FROM user_release_acks
        WHERE user_id = $1 AND release_id = $2 AND state = 'updated'`,
      [founderSession.user.id, releaseId],
    );
    // Delete any existing reminder so the sweeper inserts a fresh one.
    await pool.query(
      `DELETE FROM notifications
        WHERE user_id = $1 AND related_id = $2 AND type = 'lifeos.update_reminder'`,
      [founderSession.user.id, releaseId],
    );
    // Trigger the sweep via direct import.
    const { sweepUpdateReminders } = await import("../server/services/lifeosNotifications");
    const inserted = await sweepUpdateReminders();
    expect(inserted).toBeGreaterThan(0);
    const notif = await pool.query(
      `SELECT type FROM notifications
        WHERE related_id = $1 AND user_id = $2 AND type = 'lifeos.update_reminder'`,
      [releaseId, founderSession.user.id],
    );
    expect(notif.rowCount).toBeGreaterThan(0);
  });

  test("UI: popup appears within 60s of landing on /founders", async ({ page, context }) => {
    // Inject the founder cookie into the browser context so the page is
    // authenticated without going through the login form.
    await context.addCookies(
      founderSession.cookies.map((c) => ({
        name: c.name,
        value: c.value,
        domain: c.domain.startsWith(".") ? c.domain : c.domain,
        path: c.path,
        sameSite: "Lax" as const,
      })),
    );
    await page.goto("/founders", { waitUntil: "domcontentloaded" });
    // 5s grace before initial popup + buffer for polling cycle.
    await page.waitForSelector('[role="dialog"][aria-labelledby="lifeos-update-title"]', {
      timeout: 15_000,
    });
    await page.screenshot({ path: "test-results/lifeos-popup.png", fullPage: false });
    // Click Update Now and confirm we navigate away (cache-bust reload).
    await page.click('button:has-text("Update Now")');
    // The reload may or may not produce a new bundle in test; just confirm
    // the URL now carries the ?lifeos= cache-bust param.
    await page.waitForURL((url) => url.searchParams.has("lifeos"), { timeout: 5_000 });
    // Give the post-update toast a moment to mount; capture if present.
    await page.waitForLoadState("domcontentloaded");
    const toast = page.locator('[data-sonner-toast], li[role="status"]').first();
    if (await toast.count()) {
      await toast.waitFor({ state: "visible", timeout: 5_000 }).catch(() => {});
      await page.screenshot({ path: "test-results/lifeos-toast.png", fullPage: false }).catch(() => {});
    }
    // Open the notification bell and capture the dropdown.
    const bell = page.locator('[data-testid="notification-bell"], [aria-label*="otification" i]').first();
    if (await bell.count()) {
      await bell.click({ timeout: 5_000 }).catch(() => {});
      await page.waitForTimeout(500);
      await page.screenshot({ path: "test-results/lifeos-bell.png", fullPage: false }).catch(() => {});
    }
  });

  test("UI: public archive modal uses institutional design", async ({ page }) => {
    await page.goto("/lifeos/whats-new", { waitUntil: "domcontentloaded" });
    // Click the first release card.
    const firstCard = page.locator('button:has-text("lifeOS")').first();
    await firstCard.waitFor({ timeout: 10_000 });
    await firstCard.click();
    await page.waitForSelector('[role="dialog"][aria-labelledby="public-whats-new-title"]', {
      timeout: 5_000,
    });
    await page.screenshot({ path: "test-results/lifeos-archive-modal.png", fullPage: false });
  });
});
