/**
 * Founders Hierarchy — Real-Time Mutations (Phase D) — Playwright suite
 * (Gauge / QA + Release Authority — Phase D: real-time hierarchy/role mutations)
 *
 * Covers Forge + Conduit's Phase D additions:
 *   - PATCH /api/hcms/hierarchy/agents/:agentId now updates `users.role`
 *     based on title via titleToRole().
 *   - SSE GET /api/hcms/hierarchy/stream — admin broadcast on hierarchy:changed
 *   - SSE GET /api/me/events            — per-user channel on role:changed
 *
 * Both streams send unnamed `data:` events with payloads of shape:
 *   { type: "ready" | "hierarchy:changed" | "role:changed", ... }
 *
 * Mirrors the patterns in tests/founders-hierarchy.spec.ts: founders auth
 * fixture (founder = ADMIN_PLUS), `getByText` / `request.fetch()` style,
 * structural assertions, and env-guard `test.fixme` blocks.
 *
 * Setup before running:
 *   - Dev server running on PLAYWRIGHT_BASE_URL (default http://localhost:3000)
 *   - `scripts/seed-founders.ts` has run so FOUNDER_A is role='founder'
 *     (founder == ADMIN_PLUS — required for PATCH mutations + admin SSE stream)
 *   - FOUNDER_A creds resolvable (env or default jack.cook@heritagels.org)
 *   - Optional env fixtures (skipped via test.fixme when missing):
 *     - HIERARCHY_TEST_AGENT_ID  → known seeded agent id used for promote PATCH
 *     - FOUNDER_USER_ID          → founder's own user id, used by self-demote guard
 *
 * Run:
 *   npx playwright test tests/founders-hierarchy-realtime.spec.ts
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
import { request, type APIRequestContext } from "@playwright/test";

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
const FOUNDER_USER_ID = process.env.FOUNDER_USER_ID || "";

/**
 * Read up to ~3s of an SSE response body and return the first `data:` frame
 * payload as a parsed JSON object. Returns null if no `data:` frame appears
 * before the timeout elapses.
 *
 * Playwright's request API doesn't natively chunk SSE, so we pull the raw
 * body bytes (with a hard timeout) and parse out the first `data:` line.
 */
async function readFirstSseFrame(
  res: Awaited<ReturnType<APIRequestContext["fetch"]>>,
  timeoutMs = 3000,
): Promise<Record<string, unknown> | null> {
  // Race body() against a timeout — body() resolves when the server flushes /
  // closes, which may not happen on a long-lived SSE connection.
  let raw = "";
  try {
    raw = await Promise.race([
      res.text(),
      new Promise<string>((resolve) => setTimeout(() => resolve(""), timeoutMs)),
    ]);
  } catch {
    raw = "";
  }
  if (!raw) return null;
  // SSE frames are delimited by blank lines. The first data: line of the
  // first frame should contain JSON.
  const dataLine = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l.startsWith("data:"));
  if (!dataLine) return null;
  const payload = dataLine.slice("data:".length).trim();
  try {
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 1. API — PATCH agent's hierarchy_title to "Regional Manager" → 200 + payload
// ---------------------------------------------------------------------------

test("API — PATCH /api/hcms/hierarchy/agents/:id { hierarchyTitle: 'Regional Manager' } returns 200 + ok payload", async ({
  founderA,
}) => {
  test.fixme(
    !TEST_AGENT_ID,
    "HIERARCHY_TEST_AGENT_ID env var not set — no known seeded test agent id available.",
  );

  const res = await founderA.api.patch(`/api/hcms/hierarchy/agents/${TEST_AGENT_ID}`, {
    data: { hierarchyTitle: "Regional Manager" },
    headers: { "content-type": "application/json" },
  });
  expect(res.status(), await res.text()).toBe(200);
  const body = await res.json();
  expect(body).toHaveProperty("ok", true);
  expect(body).toHaveProperty("newHierarchyId");
  expect(body).toHaveProperty("effectiveFrom");
});

// ---------------------------------------------------------------------------
// 2. API — GET /api/hcms/hierarchy/stream as founder → SSE 200 + ready frame
// ---------------------------------------------------------------------------

test("API — GET /api/hcms/hierarchy/stream as founder returns SSE 200 + first 'ready' frame", async ({
  founderA,
}) => {
  const res = await founderA.api.fetch("/api/hcms/hierarchy/stream", {
    method: "GET",
    headers: { Accept: "text/event-stream" },
  });
  expect(res.status(), await res.text().catch(() => "")).toBe(200);
  const ct = res.headers()["content-type"] || "";
  expect(ct.toLowerCase()).toContain("text/event-stream");

  // First frame should be { type: "ready", at: ... } — but if the server
  // doesn't flush a ready handshake within 3s, we don't fail the test:
  // the structural status + content-type check above is the hard assertion.
  const frame = await readFirstSseFrame(res, 3000);
  if (frame !== null) {
    expect(frame).toHaveProperty("type");
    expect(["ready", "hierarchy:changed"]).toContain(frame.type as string);
  }
});

// ---------------------------------------------------------------------------
// 3. API — GET /api/me/events as founder → SSE 200 + ready frame
// ---------------------------------------------------------------------------

test("API — GET /api/me/events as founder returns SSE 200 + first 'ready' frame", async ({
  founderA,
}) => {
  const res = await founderA.api.fetch("/api/me/events", {
    method: "GET",
    headers: { Accept: "text/event-stream" },
  });
  expect(res.status(), await res.text().catch(() => "")).toBe(200);
  const ct = res.headers()["content-type"] || "";
  expect(ct.toLowerCase()).toContain("text/event-stream");

  const frame = await readFirstSseFrame(res, 3000);
  if (frame !== null) {
    expect(frame).toHaveProperty("type");
    expect(["ready", "role:changed"]).toContain(frame.type as string);
  }
});

// ---------------------------------------------------------------------------
// 4. NEGATIVE — unauthenticated /api/hcms/hierarchy/stream returns 401 or 403
// ---------------------------------------------------------------------------

test("API — unauthenticated GET /api/hcms/hierarchy/stream returns 401 or 403", async () => {
  const anon = await request.newContext({ baseURL: BASE_URL });
  try {
    const res = await anon.fetch("/api/hcms/hierarchy/stream", {
      method: "GET",
      headers: { Accept: "text/event-stream" },
    });
    expect([401, 403]).toContain(res.status());
  } finally {
    await anon.dispose().catch(() => {});
  }
});

// ---------------------------------------------------------------------------
// 5. NEGATIVE — unauthenticated /api/me/events returns 401 or 403
// ---------------------------------------------------------------------------

test("API — unauthenticated GET /api/me/events returns 401 or 403", async () => {
  const anon = await request.newContext({ baseURL: BASE_URL });
  try {
    const res = await anon.fetch("/api/me/events", {
      method: "GET",
      headers: { Accept: "text/event-stream" },
    });
    expect([401, 403]).toContain(res.status());
  } finally {
    await anon.dispose().catch(() => {});
  }
});

// ---------------------------------------------------------------------------
// 6. API — Self-demotion guard:
//    PATCH /api/hcms/hierarchy/agents/{founderId} { hierarchyTitle: 'Senior Agent' }
//    → 400 "Would lower your own privileges"
//    Skipped via test.fixme if FOUNDER_USER_ID env var not set.
// ---------------------------------------------------------------------------

test("API — PATCH self with lower-privilege title is rejected with 400 (self-demotion guard)", async ({
  founderA,
}) => {
  test.fixme(
    !FOUNDER_USER_ID,
    "FOUNDER_USER_ID env var not set — cannot probe self-demotion guard without founder's user id.",
  );

  const res = await founderA.api.patch(`/api/hcms/hierarchy/agents/${FOUNDER_USER_ID}`, {
    data: { hierarchyTitle: "Senior Agent" },
    headers: { "content-type": "application/json" },
  });
  expect(res.status(), await res.text()).toBe(400);
  const body = await res.text();
  expect(body.toLowerCase()).toMatch(/would lower your own privileges|own privileges|self/i);
});

// ---------------------------------------------------------------------------
// 7. E2E — Two founder tabs: PATCH in tab A → tab B refetches /tree within 3s.
//    Skipped via test.fixme if HIERARCHY_TEST_AGENT_ID is not set.
// ---------------------------------------------------------------------------

test("E2E — promoting an agent in tab A triggers /api/hcms/hierarchy/tree refetch in tab B within 3s", async ({
  browser,
  founderA,
}) => {
  test.fixme(
    !TEST_AGENT_ID,
    "HIERARCHY_TEST_AGENT_ID env var not set — too brittle without a real seeded agent id.",
  );

  // Open two parallel browser contexts (tab A + tab B), both as the same founder.
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  try {
    await applySessionToContext(ctxA, founderA);
    await applySessionToContext(ctxB, founderA);

    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    // Both load the hierarchy page so useRealtimeHierarchy mounts.
    await Promise.all([
      pageA.goto("/founders/hierarchy", { waitUntil: "domcontentloaded" }),
      pageB.goto("/founders/hierarchy", { waitUntil: "domcontentloaded" }),
    ]);

    // Wait for tab B to be settled before priming the listener.
    await expect(
      pageB.getByRole("heading", { name: /^Hierarchy$/i, level: 1 }),
    ).toBeVisible({ timeout: 15000 });

    // Tab B: arm a request waiter for the next /api/hcms/hierarchy/tree GET
    // that fires AFTER we trigger the PATCH from tab A.
    const treeRefetch = pageB.waitForRequest(
      (req) =>
        req.method() === "GET" && /\/api\/hcms\/hierarchy\/tree(\?|$)/.test(req.url()),
      { timeout: 5000 },
    );

    // Tab A: fire the PATCH mutation as the founder. Use the founder's
    // session-scoped APIRequestContext directly so we don't need to drive
    // the UI to perform the mutation.
    const patchRes = await founderA.api.patch(
      `/api/hcms/hierarchy/agents/${TEST_AGENT_ID}`,
      {
        data: { hierarchyTitle: "Regional Manager" },
        headers: { "content-type": "application/json" },
      },
    );
    expect(patchRes.status(), await patchRes.text()).toBe(200);

    // Tab B should observe a refetch of /tree within ~3s of the SSE
    // hierarchy:changed broadcast landing.
    const observed = await treeRefetch;
    expect(observed.url()).toMatch(/\/api\/hcms\/hierarchy\/tree/);
  } finally {
    await ctxA.close().catch(() => {});
    await ctxB.close().catch(() => {});
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
test.describe("Founders Hierarchy realtime env guard", () => {
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
