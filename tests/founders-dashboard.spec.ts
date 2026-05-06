/**
 * Founders Executive Briefing Dashboard — Playwright suite
 * (Gauge / QA + Release Authority — Wave 3)
 *
 * Covers the new FoundersDashboard ("Ownership Briefing") at `/founders`
 * and the 5 endpoints Forge shipped in Wave 1:
 *   GET /api/founders/dashboard/kpis            ?period=
 *   GET /api/founders/dashboard/at-a-glance     ?period=
 *   GET /api/founders/dashboard/attention
 *   GET /api/founders/dashboard/quarterly-goals
 *   GET /api/founders/dashboard/recent-activity ?limit=
 *
 * Mirrors the patterns in tests/founders-lounge.spec.ts: founders auth
 * fixture, single-worker, `getByText` / `getByRole` selectors, structural
 * assertions only (no fixed-value checks — demo fallbacks make them brittle).
 *
 * Setup before running:
 *   - Dev server running on PLAYWRIGHT_BASE_URL (default http://localhost:3000)
 *   - `scripts/seed-founders.ts` has run so FOUNDER_A is role='founder'
 *   - FOUNDER_A creds resolvable (env or default jack.cook@heritagels.org)
 *
 * Run:
 *   npx playwright test tests/founders-dashboard.spec.ts
 */
import {
  test,
  expect,
  loginAs,
  applySessionToContext,
  BASE_URL,
  FOUNDER_A,
  type SessionHandle,
} from "./fixtures/foundersAuth";
import { request } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function gotoFounders(
  page: Parameters<typeof applySessionToContext>[0] extends infer _ ? any : never,
  session: SessionHandle,
  path = "/founders",
) {
  await applySessionToContext(page.context(), session);
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

// ---------------------------------------------------------------------------
// 1. UI — header + subtitle
// ---------------------------------------------------------------------------

test("Founders Dashboard — page header 'Dashboard' / 'Ownership Briefing' renders", async ({
  page,
  founderA,
}) => {
  await gotoFounders(page, founderA, "/founders");
  await expect(page.getByRole("heading", { name: /^Dashboard$/i, level: 1 })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByText(/Ownership Briefing/i)).toBeVisible();
  expect(new URL(page.url()).pathname).toBe("/founders");
});

// ---------------------------------------------------------------------------
// 2. UI — all 5 KPI tile labels render
// ---------------------------------------------------------------------------

test("Founders Dashboard — all 5 KPI tile labels render", async ({ page, founderA }) => {
  await gotoFounders(page, founderA, "/founders");
  await expect(page.getByRole("heading", { name: /^Dashboard$/i, level: 1 })).toBeVisible({
    timeout: 15000,
  });
  for (const label of [
    "Revenue",
    "Active Agents",
    "Cash Position",
    "Founder Profit",
    "Lead Profit",
  ]) {
    await expect(
      page.getByText(new RegExp(`^${label}$`, "i")).first(),
      `KPI tile '${label}' should be visible`,
    ).toBeVisible({ timeout: 15000 });
  }
});

// ---------------------------------------------------------------------------
// 3. UI — section headers render
// ---------------------------------------------------------------------------

test("Founders Dashboard — section headers render", async ({ page, founderA }) => {
  await gotoFounders(page, founderA, "/founders");
  await expect(page.getByRole("heading", { name: /^Dashboard$/i, level: 1 })).toBeVisible({
    timeout: 15000,
  });
  for (const header of [
    "This Period at a Glance",
    "Needs Your Attention",
    "Quarterly Goals",
    "Compliance Posture",
    "Recent Activity",
  ]) {
    await expect(
      page.getByText(new RegExp(header, "i")).first(),
      `Section header '${header}' should be visible`,
    ).toBeVisible({ timeout: 15000 });
  }
});

// ---------------------------------------------------------------------------
// 4. UI — clicking the Revenue KPI tile deep-links to /founders/revenue
// ---------------------------------------------------------------------------

test("Founders Dashboard — Revenue KPI tile navigates to /founders/revenue", async ({
  page,
  founderA,
}) => {
  await gotoFounders(page, founderA, "/founders");
  await expect(page.getByRole("heading", { name: /^Dashboard$/i, level: 1 })).toBeVisible({
    timeout: 15000,
  });

  // KPI cards are wrapped in <Link href="/founders/revenue">; click the
  // anchor (more stable than the text token, which also appears in the
  // top-right "Open Revenue" button).
  await page.locator('a[href="/founders/revenue"]').first().click();
  await page.waitForURL(/\/founders\/revenue/, { timeout: 10000 });
  expect(new URL(page.url()).pathname).toBe("/founders/revenue");
});

// ---------------------------------------------------------------------------
// 5. UI — switching the period selector does not error
// ---------------------------------------------------------------------------

test("Founders Dashboard — switching period selector does not raise a JS error", async ({
  page,
  founderA,
}) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (err) => pageErrors.push(err));

  await gotoFounders(page, founderA, "/founders");
  await expect(page.getByRole("heading", { name: /^Dashboard$/i, level: 1 })).toBeVisible({
    timeout: 15000,
  });

  // Default options come from FINANCE_PERIODS; default value is "ytd"
  // ("Year to Date"). The trigger button shows the currently selected label.
  const trigger = page.getByRole("button", { name: /Year to Date/i }).first();
  await expect(trigger).toBeVisible({ timeout: 10000 });
  await trigger.click();

  // Pick an alternative period — "This Month" is always present in
  // FINANCE_PERIODS. Click the dropdown option that exactly matches.
  const altOption = page.getByRole("button", { name: /^This Month$/i }).first();
  await expect(altOption).toBeVisible({ timeout: 5000 });
  await altOption.click();

  // The trigger should now reflect the new selection.
  await expect(page.getByRole("button", { name: /This Month/i }).first()).toBeVisible({
    timeout: 10000,
  });

  // Page should still show the dashboard header (no crash / blank page).
  await expect(page.getByRole("heading", { name: /^Dashboard$/i, level: 1 })).toBeVisible();
  await expect(page.getByText(/Ownership Briefing/i)).toBeVisible();

  // No uncaught JS error fired on the page during the period switch.
  expect(pageErrors, `pageerror events: ${pageErrors.map((e) => e.message).join(" | ")}`).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// 6. API — /kpis returns all 5 expected number keys
// ---------------------------------------------------------------------------

test("API — GET /api/founders/dashboard/kpis returns 200 with all 5 numeric KPIs", async ({
  founderA,
}) => {
  const res = await founderA.api.get("/api/founders/dashboard/kpis?period=ytd");
  expect(res.status(), await res.text()).toBe(200);
  const body = await res.json();

  for (const key of ["revenue", "activeAgents", "cashPosition", "founderProfit", "leadProfit"]) {
    expect(body, `kpis payload should have key '${key}'`).toHaveProperty(key);
    expect(typeof body[key], `kpis.${key} should be a number`).toBe("number");
    expect(Number.isFinite(body[key]), `kpis.${key} should be a finite number`).toBe(true);
  }
  expect(typeof body.periodLabel).toBe("string");
});

// ---------------------------------------------------------------------------
// 7. API — /at-a-glance returns sparkline array
// ---------------------------------------------------------------------------

test("API — GET /api/founders/dashboard/at-a-glance returns 200 with sparkline array", async ({
  founderA,
}) => {
  const res = await founderA.api.get("/api/founders/dashboard/at-a-glance?period=ytd");
  expect(res.status(), await res.text()).toBe(200);
  const body = await res.json();
  expect(Array.isArray(body.sparkline), "at-a-glance.sparkline should be an array").toBe(true);
  // Other tile values should at least be present — type-check loosely.
  for (const key of ["newDeals", "overrideIncome", "leadProfit", "newAgents"]) {
    expect(body, `at-a-glance payload should have key '${key}'`).toHaveProperty(key);
  }
});

// ---------------------------------------------------------------------------
// 8. API — /attention returns array (possibly empty)
// ---------------------------------------------------------------------------

test("API — GET /api/founders/dashboard/attention returns 200 with array", async ({
  founderA,
}) => {
  const res = await founderA.api.get("/api/founders/dashboard/attention");
  expect(res.status(), await res.text()).toBe(200);
  const body = await res.json();
  expect(Array.isArray(body), "attention payload should be an array").toBe(true);
  // If items exist, each must look like an AttentionItem.
  for (const item of body) {
    expect(item).toHaveProperty("id");
    expect(item).toHaveProperty("title");
    expect(item).toHaveProperty("href");
    expect(item).toHaveProperty("urgency");
  }
});

// ---------------------------------------------------------------------------
// 9. API — /quarterly-goals returns 3 items, pct in [0,100]
// ---------------------------------------------------------------------------

test("API — GET /api/founders/dashboard/quarterly-goals returns 3 items with pct in [0,100]", async ({
  founderA,
}) => {
  const res = await founderA.api.get("/api/founders/dashboard/quarterly-goals");
  expect(res.status(), await res.text()).toBe(200);
  const body = await res.json();
  expect(Array.isArray(body), "quarterly-goals payload should be an array").toBe(true);
  expect(body.length, "should return exactly 3 quarterly goals").toBe(3);
  for (const goal of body) {
    expect(goal).toHaveProperty("label");
    expect(goal).toHaveProperty("current");
    expect(goal).toHaveProperty("target");
    expect(goal).toHaveProperty("pct");
    expect(typeof goal.pct, `goal '${goal.label}'.pct should be a number`).toBe("number");
    expect(goal.pct, `goal '${goal.label}'.pct should be >= 0`).toBeGreaterThanOrEqual(0);
    expect(goal.pct, `goal '${goal.label}'.pct should be <= 100`).toBeLessThanOrEqual(100);
  }
});

// ---------------------------------------------------------------------------
// 10. API — /recent-activity respects ?limit=
// ---------------------------------------------------------------------------

test("API — GET /api/founders/dashboard/recent-activity?limit=5 returns array of length <= 5", async ({
  founderA,
}) => {
  const res = await founderA.api.get("/api/founders/dashboard/recent-activity?limit=5");
  expect(res.status(), await res.text()).toBe(200);
  const body = await res.json();
  expect(Array.isArray(body), "recent-activity payload should be an array").toBe(true);
  expect(body.length, "recent-activity length should not exceed limit=5").toBeLessThanOrEqual(5);
  for (const row of body) {
    expect(row).toHaveProperty("id");
    expect(row).toHaveProperty("ts");
    expect(row).toHaveProperty("kind");
    expect(row).toHaveProperty("title");
  }
});

// ---------------------------------------------------------------------------
// 11. NEGATIVE — unauthenticated /kpis must be 401/403
// ---------------------------------------------------------------------------

test("API — unauthenticated GET /api/founders/dashboard/kpis returns 401 or 403", async () => {
  // Brand-new context with no cookies — guarantees no founder session.
  const anon = await request.newContext({ baseURL: BASE_URL });
  try {
    const res = await anon.get("/api/founders/dashboard/kpis");
    expect([401, 403]).toContain(res.status());
  } finally {
    await anon.dispose().catch(() => {});
  }
});

// ---------------------------------------------------------------------------
// Soft-skip — opt-in env flag for environments without founder seed
// ---------------------------------------------------------------------------
//
// If this environment hasn't seeded the founders auth fixture (no FOUNDER_A
// account exists / login fails), every test above will otherwise fail at
// the `founderA` fixture setup with a thrown Error from loginAs().
// Setting SKIP_FOUNDERS_DASHBOARD=1 marks the whole describe as
// `test.fixme` so CI surfaces it as expected-not-running rather than red.
//
test.describe("Founders Dashboard env guard", () => {
  test.fixme(
    process.env.SKIP_FOUNDERS_DASHBOARD === "1",
    "Founders auth fixture not available in this env — SKIP_FOUNDERS_DASHBOARD=1 set.",
  );

  test("env probe — FOUNDER_A login succeeds", async () => {
    const handle = await loginAs(FOUNDER_A.email, FOUNDER_A.password);
    expect(handle.user.role.toLowerCase()).toBe("founder");
    await handle.api.dispose().catch(() => {});
  });
});
