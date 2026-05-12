/**
 * One-shot screenshot capture for /lifeos/whats-new — the public archive.
 *
 * Auth-free path so it always runs even if the founder account has 2FA on.
 */
import { test } from "@playwright/test";

test("public archive: institutional modal screenshot", async ({ page }) => {
  await page.goto("/lifeos/whats-new", { waitUntil: "domcontentloaded" });
  // Wait for the first release card and screenshot the list view first.
  const firstCard = page.locator('button:has-text("lifeOS")').first();
  await firstCard.waitFor({ timeout: 15_000 });
  await page.screenshot({ path: "test-results/lifeos-archive-list.png", fullPage: false });
  await firstCard.click();
  await page.waitForSelector('[role="dialog"][aria-labelledby="public-whats-new-title"]', {
    timeout: 5_000,
  });
  // Settle for any animation.
  await page.waitForTimeout(300);
  await page.screenshot({ path: "test-results/lifeos-archive-modal.png", fullPage: false });
});
