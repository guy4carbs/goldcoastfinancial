import { test, expect } from "@playwright/test";

// Points at the full-stack dev server (`npm run dev`) on :3000.
// Falls back to :5001 if only the client-only vite server (`npm run dev:client`) is up.
const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("HCMS walkthrough — driver.js", () => {
  test("app loads with driver.js + tour.css imports, no console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => pageErrors.push(String(err)));

    await page.goto(`${BASE}/hcms/my/dashboard`, { waitUntil: "domcontentloaded" });
    // AuthGate should redirect unauthenticated users to /login
    await page.waitForURL(/\/login/, { timeout: 10000 });

    // Filter out unrelated noise (asset 404s on dev, Vite HMR hints)
    const fatal = [...consoleErrors, ...pageErrors].filter((e) =>
      !/Failed to load resource|favicon|DevTools|\[vite\]/i.test(e),
    );
    expect(fatal, `Fatal console/page errors:\n${fatal.join("\n")}`).toHaveLength(0);

    // driver.js stylesheet should be injected (driver.css registers the rule for .driver-overlay)
    const hasDriverStyles = await page.evaluate(() =>
      Array.from(document.styleSheets).some((s) => {
        try {
          return Array.from(s.cssRules || []).some((r) =>
            (r as CSSRule).cssText.includes(".driver-overlay") ||
            (r as CSSRule).cssText.includes("driver-popover")
          );
        } catch {
          return false;
        }
      }),
    );
    expect(hasDriverStyles, "driver.js CSS should be loaded").toBe(true);

    // Our theme overrides must be loaded (tour.css adds .driver-popover.gc-tour-popover rules)
    const hasGcTourTheme = await page.evaluate(() =>
      Array.from(document.styleSheets).some((s) => {
        try {
          return Array.from(s.cssRules || []).some((r) =>
            (r as CSSRule).cssText.includes("gc-tour-popover"),
          );
        } catch {
          return false;
        }
      }),
    );
    expect(hasGcTourTheme, "tour.css (gc-tour-popover rules) should be loaded").toBe(true);
  });

  test("driver.js renders a themed popover end-to-end", async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });

    // Inject driver.js directly (via ESM import) and drive a 1-step tour targeting <body>.
    // This proves: library loads, CSS applies, animation runs, no runtime errors.
    const result = await page.evaluate(async () => {
      try {
        const mod = await import("/node_modules/driver.js/src/index.ts").catch(
          () => import("/@fs/" + "/Users/guy4carbs/gcf/node_modules/driver.js/dist/driver.js.mjs"),
        );
        const driverFn = (mod as any).driver;
        const d = driverFn({
          animate: true,
          popoverClass: "gc-tour-popover",
          showButtons: ["next", "close"],
          steps: [
            {
              element: "body",
              popover: {
                title: "Smoke test",
                description: "If you can read this, driver.js + tour theme are loaded.",
              },
            },
          ],
        });
        d.drive();
        return { ok: true };
      } catch (err: any) {
        return { ok: false, err: String(err?.message || err) };
      }
    });

    expect(result.ok, `driver.js invocation failed: ${(result as any).err}`).toBe(true);

    // Wait for the popover to actually render in the DOM
    const popover = page.locator(".driver-popover.gc-tour-popover");
    await expect(popover).toBeVisible({ timeout: 5000 });
    await expect(popover.locator(".driver-popover-title")).toHaveText("Smoke test");
    await expect(popover.locator(".driver-popover-description")).toContainText("driver.js + tour theme");

    // Theme assertion: next button should use --gc-btn-primary-bg (defaults to gold).
    // We can't rely on a specific hex across themes, but we can assert it's NOT driver's default
    // transparent/white, by reading the computed background.
    const bg = await popover.locator(".driver-popover-next-btn").first().evaluate((el) => {
      return getComputedStyle(el).backgroundColor;
    });
    expect(bg, "next button must have a non-transparent themed background").not.toBe("rgba(0, 0, 0, 0)");
    expect(bg).not.toBe("transparent");

    // Snapshot for visual review
    await page.screenshot({ path: "test-results/hcms-tour-popover.png", fullPage: false });
  });
});
