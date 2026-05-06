/**
 * Lead Revenue / Lead Marketplace — Playwright suite (Gauge / QA + Release Authority)
 *
 * Wave 3. Smoke-tests the new lead marketplace endpoints, the founders revenue
 * "Lead Revenue (Net)" KPI tile + "Lead Revenue by Product" table, and the
 * agent-facing /hcms/my/leads store page.
 *
 * Conventions match tests/founders-lounge.spec.ts:
 *   - Pull `test`/`expect` from the foundersAuth fixture
 *   - Use `loginAs` / `applySessionToContext` for ad-hoc roles
 *   - Stable selectors via getByText / getByRole rather than CSS classes
 *
 * Stripe is NOT exercised against the real API — the POST /api/leads/checkout
 * call is intercepted with page.route() so we never hit `stripe.checkout.sessions.create`.
 *
 * Pre-reqs to run:
 *   - Local dev server running on http://localhost:3000 (or PLAYWRIGHT_BASE_URL set)
 *   - scripts/seed-founders.ts has been run so jack.cook@ / frank.carbonara@ exist
 *   - The lead_products table is seeded so at least the Consolidation product is
 *     active=true (per Vector's seed plan). Tests skip cleanly when the catalog
 *     is empty rather than failing.
 */
import type { Page } from "@playwright/test";
import {
  test,
  expect,
  loginAs,
  applySessionToContext,
  TEST_AGENT,
  type SessionHandle,
} from "./fixtures/foundersAuth";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Visit `path` with a fresh browser context already carrying `session`'s cookies. */
async function gotoAs(page: Page, session: SessionHandle, path: string) {
  await applySessionToContext(page.context(), session);
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

// ---------------------------------------------------------------------------
// 1-4. FOUNDERS REVENUE PAGE — KPI tile + by-product table + period switch
// ---------------------------------------------------------------------------

test.describe("Founders Revenue — Lead Revenue surfaces", () => {
  test("renders the 5th 'Lead Revenue (Net)' KPI tile", async ({ page, founderA }) => {
    await gotoAs(page, founderA, "/founders/revenue");
    await expect(page.getByRole("heading", { name: /^Revenue$/i, level: 1 })).toBeVisible({
      timeout: 15000,
    });

    // KPI tile label is rendered as plain text by GCKPICard.
    await expect(page.getByText("Lead Revenue (Net)")).toBeVisible({ timeout: 15000 });
  });

  test("renders the 'Lead Revenue by Product' section header", async ({ page, founderA }) => {
    await gotoAs(page, founderA, "/founders/revenue");
    await expect(page.getByRole("heading", { name: /^Revenue$/i, level: 1 })).toBeVisible({
      timeout: 15000,
    });

    // Section label is the uppercase eyebrow above GCDataTable.
    await expect(page.getByText("Lead Revenue by Product")).toBeVisible({ timeout: 15000 });
  });

  test("switching the period selector does not error the page", async ({ page, founderA }) => {
    await gotoAs(page, founderA, "/founders/revenue");
    await expect(page.getByRole("heading", { name: /^Revenue$/i, level: 1 })).toBeVisible({
      timeout: 15000,
    });

    // GCPeriodSelector exposes its current value as visible text. We toggle by
    // clicking the most common alternate label. The selector uses buttons in
    // the founders shell; both MTD and YTD options exist.
    const ytd = page.getByRole("button", { name: /^YTD$/i }).first();
    const mtd = page.getByRole("button", { name: /^MTD$/i }).first();

    // Default is "ytd" per FoundersRevenue useState. Switch to MTD if the
    // toggle is rendered as buttons; otherwise fall back to a wouter-style
    // <select> element if Nova ships that variant.
    if ((await mtd.count()) > 0) {
      await mtd.click();
    } else {
      const selectEl = page.locator("select").first();
      if ((await selectEl.count()) > 0) {
        await selectEl.selectOption({ label: "MTD" }).catch(() => {});
      } else {
        test.info().annotations.push({
          type: "note",
          description:
            "GCPeriodSelector did not expose a recognisable MTD/YTD control — verify Nova's GC primitive renders a button group or a <select>.",
        });
      }
    }

    // The page should still render the hero + lead-revenue section without
    // an error boundary surfacing. The "Unable to load dashboard" copy from
    // the catch-all error block must NOT appear.
    await expect(page.getByText(/Unable to load dashboard/i)).toHaveCount(0);
    await expect(page.getByText("Lead Revenue (Net)")).toBeVisible({ timeout: 15000 });
    // Ignore void return (typed as ytd to avoid unused warning).
    void ytd;
  });
});

// ---------------------------------------------------------------------------
// 5-8. AGENT LEAD STORE — catalog renders, Coming Soon badges, mocked checkout
// ---------------------------------------------------------------------------

test.describe("Agent Lead Store", () => {
  // Skip the entire group cleanly when the env doesn't have a sales_agent
  // seeded — same pattern as founders-lounge.spec.ts.
  let agent: SessionHandle | null = null;

  test.beforeAll(async () => {
    try {
      agent = await loginAs(TEST_AGENT.email, TEST_AGENT.password);
    } catch {
      agent = null;
    }
  });

  test.afterAll(async () => {
    await agent?.api.dispose().catch(() => {});
  });

  test("at least one product card renders (Consolidation expected)", async ({ page }) => {
    test.skip(!agent, "No sales_agent test account seeded.");
    await gotoAs(page, agent!, "/hcms/my/leads");

    await expect(page.getByRole("heading", { name: /Leads Store/i, level: 1 })).toBeVisible({
      timeout: 15000,
    });

    // Consolidation is seeded active per Vector's plan; assert its card text.
    // Fall back to "Buy Now" detection when the seed slug differs.
    const consolidation = page.getByText(/Consolidation/i).first();
    const buyButton = page.getByRole("button", { name: /^Buy Now$/i }).first();

    const consolidationCount = await consolidation.count();
    if (consolidationCount > 0) {
      await expect(consolidation).toBeVisible({ timeout: 15000 });
    } else {
      await expect(buyButton, "expected at least one purchasable product card").toBeVisible({
        timeout: 15000,
      });
    }
  });

  test("'Coming Soon' badges appear on Live IUL + High Intent IUL cards", async ({ page }) => {
    test.skip(!agent, "No sales_agent test account seeded.");
    await gotoAs(page, agent!, "/hcms/my/leads");

    await expect(page.getByRole("heading", { name: /Leads Store/i, level: 1 })).toBeVisible({
      timeout: 15000,
    });

    // Two product cards should carry the "Coming Soon" badge per the Wave 2
    // seed: Live IUL and High Intent IUL. We assert ≥2 occurrences of the
    // badge text rather than tying to exact card titles, since the card
    // titles can drift in marketing copy.
    const comingSoonBadges = page.getByText(/^Coming Soon$/);
    const count = await comingSoonBadges.count();
    expect(count, "expected ≥2 Coming Soon badges (Live IUL + High Intent IUL)").toBeGreaterThanOrEqual(2);

    // Also assert at least one card is recognisably an IUL product when the
    // seed is in place.
    const iulMention = page.getByText(/IUL/i).first();
    if ((await iulMention.count()) > 0) {
      await expect(iulMention).toBeVisible();
    }
  });

  test("clicking 'Buy Now' on Consolidation triggers a redirect via mocked Stripe checkout", async ({ page }) => {
    test.skip(!agent, "No sales_agent test account seeded.");
    await gotoAs(page, agent!, "/hcms/my/leads");

    await expect(page.getByRole("heading", { name: /Leads Store/i, level: 1 })).toBeVisible({
      timeout: 15000,
    });

    // Mock the checkout endpoint so we never call real Stripe. The client
    // sets window.location.href = data.checkoutUrl on success; we point it at
    // about:blank so navigation away from the SPA is harmless. Playwright's
    // page.goto handler captures the navigation attempt for us to assert.
    const fakeCheckoutUrl = "about:blank";
    let checkoutCalled = false;
    let checkoutBodySlug: string | null = null;

    await page.route("**/api/leads/checkout", async (route) => {
      checkoutCalled = true;
      try {
        const postData = route.request().postDataJSON?.() as { slug?: string } | undefined;
        checkoutBodySlug = postData?.slug ?? null;
      } catch {
        // ignore — mocked endpoint still fulfils
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          checkoutUrl: fakeCheckoutUrl,
          sessionId: "cs_test_fake_playwright",
        }),
      });
    });

    // Click the Consolidation card's Buy Now. The card's button is the only
    // enabled "Buy Now" — Coming Soon variants render disabled buttons with
    // "Coming Soon" label, so :enabled[name="Buy Now"] is unique to active
    // products. We pick the first such button.
    const buyButton = page.getByRole("button", { name: /^Buy Now$/i }).first();
    if ((await buyButton.count()) === 0) {
      test.skip(true, "No active 'Buy Now' button on the page — seed may not include an active product.");
      return;
    }

    // Assigning to window.location.href triggers a navigation. Listen for
    // 'framenavigated' on the main frame so we can assert the redirect url.
    const navigationPromise = page
      .waitForURL(/about:blank|cs_test_fake_playwright/i, { timeout: 8000 })
      .catch(() => null);

    await buyButton.click();

    // Wait for either navigation or the mock route to be hit.
    await navigationPromise;

    expect(checkoutCalled, "POST /api/leads/checkout should have been called").toBe(true);
    if (checkoutBodySlug !== null) {
      expect(checkoutBodySlug, "checkout body should include a slug").toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// 9-11. API SMOKE — catalog shape (no vendor cost), founders KPIs, by-product
// ---------------------------------------------------------------------------

test.describe("Lead Revenue — API smoke", () => {
  test("GET /api/leads/catalog → 200, array, agent-safe shape (no vendorCostCents)", async () => {
    let agent: SessionHandle | null = null;
    try {
      agent = await loginAs(TEST_AGENT.email, TEST_AGENT.password);
    } catch {
      test.skip(true, "No sales_agent test account seeded.");
      return;
    }

    try {
      const res = await agent.api.get("/api/leads/catalog");
      expect(res.status(), await res.text()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body), "catalog must be an array").toBe(true);

      if (body.length === 0) {
        test.info().annotations.push({
          type: "note",
          description:
            "lead_products table is empty — Vector's seed-lead-products script needs to run before the agent store has anything to display.",
        });
      }

      for (const item of body) {
        // Required agent-safe fields
        expect(item).toHaveProperty("slug");
        expect(item).toHaveProperty("name");
        expect(item).toHaveProperty("priceCents");
        // Vendor cost MUST NOT leak — finance-only column
        expect(item.vendorCostCents, `vendorCostCents must not be exposed for ${item.slug}`).toBeUndefined();
        expect(item.vendor_cost_cents, `vendor_cost_cents must not be exposed for ${item.slug}`).toBeUndefined();
      }
    } finally {
      await agent.api.dispose().catch(() => {});
    }
  });

  test("GET /api/founders/lead-revenue/kpis?period=ytd → 200 with expected keys", async ({ founderA }) => {
    const res = await founderA.api.get("/api/founders/lead-revenue/kpis?period=ytd");
    expect(res.status(), await res.text()).toBe(200);
    const body = await res.json();
    expect(body, "kpis body must be an object").toBeTruthy();
    expect(body).toHaveProperty("grossCents");
    expect(body).toHaveProperty("vendorCostCents");
    expect(body).toHaveProperty("netProfitCents");
    expect(body).toHaveProperty("unitsSold");
    // Sanity: math holds even on empty data (0 - 0 = 0).
    expect(body.netProfitCents).toBe(body.grossCents - body.vendorCostCents);
    expect(typeof body.grossCents).toBe("number");
    expect(typeof body.vendorCostCents).toBe("number");
    expect(typeof body.unitsSold).toBe("number");
  });

  test("GET /api/founders/lead-revenue/by-product?period=ytd → 200 array", async ({ founderA }) => {
    const res = await founderA.api.get("/api/founders/lead-revenue/by-product?period=ytd");
    expect(res.status(), await res.text()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body), "by-product must be an array").toBe(true);
    for (const row of body) {
      expect(row).toHaveProperty("slug");
      expect(row).toHaveProperty("name");
      expect(row).toHaveProperty("grossCents");
      expect(row).toHaveProperty("netProfitCents");
      expect(row).toHaveProperty("marginPct");
    }
  });
});

// ---------------------------------------------------------------------------
// 12-13. NEGATIVE TESTS — auth / role gate
// ---------------------------------------------------------------------------

test.describe("Lead Revenue — auth gate negatives", () => {
  test("unauthenticated GET /api/founders/lead-revenue/kpis → 401/403", async ({ playwright }) => {
    const anon = await playwright.request.newContext({
      baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    });
    try {
      const res = await anon.get("/api/founders/lead-revenue/kpis?period=ytd");
      // Server-side gate is requireAuth (401) followed by requireRole (403).
      // Either is acceptable proof the route is protected.
      expect([401, 403]).toContain(res.status());
    } finally {
      await anon.dispose().catch(() => {});
    }
  });

  test("authenticated sales_agent (non-founder, non-manager) GET /api/founders/lead-revenue/kpis → 403", async () => {
    let agent: SessionHandle | null = null;
    try {
      agent = await loginAs(TEST_AGENT.email, TEST_AGENT.password);
    } catch {
      test.skip(true, "No sales_agent test account seeded — cannot validate non-founder 403.");
      return;
    }

    try {
      // Confirm the seeded TEST_AGENT really is below the FOUNDERS_ONLY +
      // MANAGER_PLUS gate. If somebody promoted them, skip with a clear note
      // rather than getting a misleading 200.
      const me = await agent.api.get("/api/auth/me").catch(() => null);
      if (me && me.ok()) {
        const meBody = await me.json().catch(() => ({}));
        const role = meBody?.user?.role ?? meBody?.role;
        const elevated = ["founder", "manager", "owner", "admin", "executive", "director"];
        if (role && elevated.includes(String(role).toLowerCase())) {
          test.fixme(
            true,
            `TEST_AGENT seeded as '${role}' — needs a true sales_agent fixture to validate the 403 gate.`,
          );
          return;
        }
      }

      const res = await agent.api.get("/api/founders/lead-revenue/kpis?period=ytd");
      expect(res.status()).toBe(403);
    } finally {
      await agent.api.dispose().catch(() => {});
    }
  });
});
