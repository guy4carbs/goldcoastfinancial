/**
 * Founders Hierarchy Page — Playwright suite
 * (Gauge / QA + Release Authority — Phase B (viz upgrades) + Phase C (admin mutations))
 *
 * Covers the Hierarchy page at `/founders/hierarchy` (also mounted at
 * `/hcms/hierarchy` — same component) and the admin mutation endpoint
 * Forge shipped in Phase C:
 *   PATCH /api/hcms/hierarchy/agents/:agentId   { contractLevel | hierarchyTitle }
 *
 * Mirrors the patterns in tests/founders-dashboard.spec.ts: founders auth
 * fixture (founder logs in as ADMIN_PLUS so admin mutations are available),
 * `getByText` / `getByRole` selectors, structural assertions only (no
 * fixed-value checks — demo fallbacks make them brittle), and an env-guard
 * `test.fixme` block for environments without the founders seed.
 *
 * Setup before running:
 *   - Dev server running on PLAYWRIGHT_BASE_URL (default http://localhost:3000)
 *   - `scripts/seed-founders.ts` has run so FOUNDER_A is role='founder'
 *     (founder == ADMIN_PLUS — required for PATCH mutations)
 *   - FOUNDER_A creds resolvable (env or default jack.cook@heritagels.org)
 *   - Optional: HIERARCHY_TEST_AGENT_ID env var pointing to a known seeded
 *     agent id; without it the PATCH-success test is `test.fixme`'d.
 *
 * Run:
 *   npx playwright test tests/founders-hierarchy.spec.ts
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
  path = "/founders/hierarchy",
) {
  await applySessionToContext(page.context(), session);
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

const TEST_AGENT_ID = process.env.HIERARCHY_TEST_AGENT_ID || "";

// ---------------------------------------------------------------------------
// 1. UI — page header + subtitle render
// ---------------------------------------------------------------------------

test("Founders Hierarchy — page header 'Hierarchy' + subtitle render", async ({
  page,
  founderA,
}) => {
  await gotoFounders(page, founderA, "/founders/hierarchy");
  await expect(page.getByRole("heading", { name: /^Hierarchy$/i, level: 1 })).toBeVisible({
    timeout: 15000,
  });
  // Subtitle copy is product-owned — assert SOME subtitle is present below the header.
  // We look for any descriptive text near the page title that is not the title itself.
  const subtitle = page
    .locator("h1")
    .filter({ hasText: /^Hierarchy$/i })
    .first()
    .locator("xpath=following-sibling::*[1]");
  await expect(subtitle).toBeVisible({ timeout: 10000 });
  expect(new URL(page.url()).pathname).toBe("/founders/hierarchy");
});

// ---------------------------------------------------------------------------
// 2. UI — KPI strip renders all 4 tiles
// ---------------------------------------------------------------------------

test("Founders Hierarchy — KPI strip renders all 4 tile labels", async ({ page, founderA }) => {
  await gotoFounders(page, founderA, "/founders/hierarchy");
  await expect(page.getByRole("heading", { name: /^Hierarchy$/i, level: 1 })).toBeVisible({
    timeout: 15000,
  });
  for (const label of [
    "Total in Hierarchy",
    "Avg Contract Level",
    "Hierarchy Depth",
    "Direct Downlines",
  ]) {
    await expect(
      page.getByText(new RegExp(`^${label}$`, "i")).first(),
      `KPI tile '${label}' should be visible`,
    ).toBeVisible({ timeout: 15000 });
  }
});

// ---------------------------------------------------------------------------
// 3. UI — tree/table view toggle buttons render
// ---------------------------------------------------------------------------

test("Founders Hierarchy — tree/table view toggle buttons render", async ({ page, founderA }) => {
  await gotoFounders(page, founderA, "/founders/hierarchy");
  await expect(page.getByRole("heading", { name: /^Hierarchy$/i, level: 1 })).toBeVisible({
    timeout: 15000,
  });
  await expect(
    page.getByRole("button", { name: /^Tree$/i }).first(),
    "Tree view toggle should be visible",
  ).toBeVisible({ timeout: 10000 });
  await expect(
    page.getByRole("button", { name: /^Table$/i }).first(),
    "Table view toggle should be visible",
  ).toBeVisible({ timeout: 10000 });
});

// ---------------------------------------------------------------------------
// 4. UI — switching to table view shows a row OR an empty-state message
// ---------------------------------------------------------------------------

test("Founders Hierarchy — table view shows a row or an empty-state message", async ({
  page,
  founderA,
}) => {
  await gotoFounders(page, founderA, "/founders/hierarchy");
  await expect(page.getByRole("heading", { name: /^Hierarchy$/i, level: 1 })).toBeVisible({
    timeout: 15000,
  });

  const tableToggle = page.getByRole("button", { name: /^Table$/i }).first();
  await expect(tableToggle).toBeVisible({ timeout: 10000 });
  await tableToggle.click();

  // Either at least one tbody row is visible, OR an empty state message is shown.
  const tableRow = page.locator("table tbody tr").first();
  const emptyState = page.getByText(/no agents|no results|empty|nothing to show/i).first();

  // Wait briefly for either path to settle.
  await expect(async () => {
    const rowVisible = await tableRow.isVisible().catch(() => false);
    const emptyVisible = await emptyState.isVisible().catch(() => false);
    expect(rowVisible || emptyVisible, "expected at least one table row OR an empty-state message").toBe(true);
  }).toPass({ timeout: 10000 });
});

// ---------------------------------------------------------------------------
// 5. PHASE B — switching cohort period selector raises no JS error
// ---------------------------------------------------------------------------

test("Founders Hierarchy — switching cohort period selector does not raise a JS error", async ({
  page,
  founderA,
}) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (err) => pageErrors.push(err));

  await gotoFounders(page, founderA, "/founders/hierarchy");
  await expect(page.getByRole("heading", { name: /^Hierarchy$/i, level: 1 })).toBeVisible({
    timeout: 15000,
  });

  // Cohort period selector — default label likely "Year to Date" (FINANCE_PERIODS).
  // Fall back to any button that names a period if YTD isn't present.
  const trigger = page
    .getByRole("button", { name: /Year to Date|This Month|Last 30 Days|Cohort|Period/i })
    .first();
  if (await trigger.isVisible().catch(() => false)) {
    await trigger.click();
    const altOption = page
      .getByRole("button", { name: /^This Month$|^Last 30 Days$|^Year to Date$/i })
      .first();
    if (await altOption.isVisible().catch(() => false)) {
      await altOption.click();
    }
  }

  // Page should still show the hierarchy header (no crash / blank page).
  await expect(page.getByRole("heading", { name: /^Hierarchy$/i, level: 1 })).toBeVisible();

  // No uncaught JS error fired during the period switch.
  expect(pageErrors, `pageerror events: ${pageErrors.map((e) => e.message).join(" | ")}`).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// 6. PHASE B — search input shows dropdown (or no error if no matches)
// ---------------------------------------------------------------------------

test("Founders Hierarchy — typing in search input shows dropdown or stays clean", async ({
  page,
  founderA,
}) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (err) => pageErrors.push(err));

  await gotoFounders(page, founderA, "/founders/hierarchy");
  await expect(page.getByRole("heading", { name: /^Hierarchy$/i, level: 1 })).toBeVisible({
    timeout: 15000,
  });

  // Search input — try common placeholders / aria-labels.
  const searchInput = page
    .getByPlaceholder(/search|find an agent|find agent/i)
    .first()
    .or(page.getByRole("searchbox").first())
    .or(page.getByRole("textbox", { name: /search/i }).first());

  await expect(searchInput).toBeVisible({ timeout: 10000 });
  await searchInput.fill("a");

  // Either a dropdown appears OR nothing matches — both are acceptable.
  // The hard assertion is: no JS error.
  expect(pageErrors, `pageerror events: ${pageErrors.map((e) => e.message).join(" | ")}`).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// 7. PHASE B — Export PNG button click raises no JS error
// ---------------------------------------------------------------------------

test("Founders Hierarchy — clicking 'Export PNG' raises no JS error", async ({
  page,
  founderA,
}) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (err) => pageErrors.push(err));

  await gotoFounders(page, founderA, "/founders/hierarchy");
  await expect(page.getByRole("heading", { name: /^Hierarchy$/i, level: 1 })).toBeVisible({
    timeout: 15000,
  });

  const pngBtn = page.getByRole("button", { name: /Export PNG/i }).first();
  await expect(pngBtn).toBeVisible({ timeout: 10000 });
  await pngBtn.click();

  // Give the export logic a moment to run.
  await page.waitForTimeout(500);

  // Page header still visible (no crash).
  await expect(page.getByRole("heading", { name: /^Hierarchy$/i, level: 1 })).toBeVisible();

  expect(pageErrors, `pageerror events: ${pageErrors.map((e) => e.message).join(" | ")}`).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// 8. PHASE B — Export CSV button triggers a download
// ---------------------------------------------------------------------------

test("Founders Hierarchy — clicking 'Export CSV' triggers a download", async ({
  page,
  founderA,
}) => {
  await gotoFounders(page, founderA, "/founders/hierarchy");
  await expect(page.getByRole("heading", { name: /^Hierarchy$/i, level: 1 })).toBeVisible({
    timeout: 15000,
  });

  const csvBtn = page.getByRole("button", { name: /Export CSV/i }).first();
  await expect(csvBtn).toBeVisible({ timeout: 10000 });

  const downloadPromise = page.waitForEvent("download", { timeout: 5000 });
  await csvBtn.click();
  const download = await downloadPromise;

  // Structural shape only — confirm the download object exists and has a suggested filename.
  expect(typeof download.suggestedFilename()).toBe("string");
  expect(download.suggestedFilename().length).toBeGreaterThan(0);
});

// ---------------------------------------------------------------------------
// 9. PHASE C — PATCH /api/hcms/hierarchy/agents/:agentId { contractLevel: 95 }
//    Skipped via test.fixme if HIERARCHY_TEST_AGENT_ID env var not set.
// ---------------------------------------------------------------------------

test("API — PATCH /api/hcms/hierarchy/agents/:id { contractLevel: 95 } returns 200 + ok payload", async ({
  founderA,
}) => {
  test.fixme(
    !TEST_AGENT_ID,
    "HIERARCHY_TEST_AGENT_ID env var not set — no known seeded test agent id available.",
  );

  const res = await founderA.api.patch(`/api/hcms/hierarchy/agents/${TEST_AGENT_ID}`, {
    data: { contractLevel: 95 },
    headers: { "content-type": "application/json" },
  });
  expect(res.status(), await res.text()).toBe(200);
  const body = await res.json();
  expect(body).toHaveProperty("ok", true);
  expect(body).toHaveProperty("newHierarchyId");
  expect(body).toHaveProperty("effectiveFrom");
});

// ---------------------------------------------------------------------------
// 10. PHASE C — invalid contractLevel: 200 returns 400
// ---------------------------------------------------------------------------

test("API — PATCH /api/hcms/hierarchy/agents/:id { contractLevel: 200 } returns 400", async ({
  founderA,
}) => {
  // Use a probe id; even if it doesn't exist, server-side validation should
  // reject the invalid contractLevel BEFORE any agent lookup.
  const probeId = TEST_AGENT_ID || "00000000-0000-0000-0000-000000000000";
  const res = await founderA.api.patch(`/api/hcms/hierarchy/agents/${probeId}`, {
    data: { contractLevel: 200 },
    headers: { "content-type": "application/json" },
  });
  expect(res.status(), await res.text()).toBe(400);
});

// ---------------------------------------------------------------------------
// 11. PHASE C — invalid hierarchyTitle: "Bogus" returns 400
// ---------------------------------------------------------------------------

test("API — PATCH /api/hcms/hierarchy/agents/:id { hierarchyTitle: 'Bogus' } returns 400", async ({
  founderA,
}) => {
  const probeId = TEST_AGENT_ID || "00000000-0000-0000-0000-000000000000";
  const res = await founderA.api.patch(`/api/hcms/hierarchy/agents/${probeId}`, {
    data: { hierarchyTitle: "Bogus" },
    headers: { "content-type": "application/json" },
  });
  expect(res.status(), await res.text()).toBe(400);
});

// ---------------------------------------------------------------------------
// 12. NEGATIVE — unauthenticated PATCH returns 401 or 403
// ---------------------------------------------------------------------------

test("API — unauthenticated PATCH /api/hcms/hierarchy/agents/:id returns 401 or 403", async () => {
  // Brand-new context with no cookies — guarantees no founder session.
  const anon = await request.newContext({ baseURL: BASE_URL });
  try {
    const res = await anon.patch("/api/hcms/hierarchy/agents/some-id", {
      data: { contractLevel: 95 },
      headers: { "content-type": "application/json" },
    });
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
// Setting SKIP_FOUNDERS_HIERARCHY=1 marks the whole describe as
// `test.fixme` so CI surfaces it as expected-not-running rather than red.
//
test.describe("Founders Hierarchy env guard", () => {
  test.fixme(
    process.env.SKIP_FOUNDERS_HIERARCHY === "1",
    "Founders auth fixture not available in this env — SKIP_FOUNDERS_HIERARCHY=1 set.",
  );

  test("env probe — FOUNDER_A login succeeds + role is founder (ADMIN_PLUS)", async () => {
    const handle = await loginAs(FOUNDER_A.email, FOUNDER_A.password);
    expect(handle.user.role.toLowerCase()).toBe("founder");
    await handle.api.dispose().catch(() => {});
  });
});
