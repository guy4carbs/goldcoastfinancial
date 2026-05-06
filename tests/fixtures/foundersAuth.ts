/**
 * Founders Lounge — Playwright auth fixtures.
 *
 * Provides three role-scoped fixtures:
 *   - founderA  → Jack Cook  (jack.cook@heritagels.org)
 *   - founderB  → Frank Carbonara (frank.carbonara@heritagels.org)
 *   - nonFounder → a sales_agent / manager / owner login (default sales_agent)
 *
 * Each fixture returns a fresh APIRequestContext with a server-issued session
 * cookie attached, plus a helper that opens a browser context with that
 * cookie pre-loaded so UI navigation is already authenticated.
 *
 * Credentials are pulled from env so CI / local can override:
 *   FOUNDER_A_EMAIL / FOUNDER_A_PASSWORD
 *   FOUNDER_B_EMAIL / FOUNDER_B_PASSWORD
 *   TEST_AGENT_EMAIL / TEST_AGENT_PASSWORD
 *   TEST_MANAGER_EMAIL / TEST_MANAGER_PASSWORD
 *   TEST_OWNER_EMAIL / TEST_OWNER_PASSWORD
 *
 * The seed script at scripts/seed-founders.ts already promotes the four
 * founder emails to role='founder'. This fixture assumes those rows exist
 * and have known passwords (set via the standard /api/auth/register flow
 * or a one-off DB UPDATE during environment provisioning).
 */
import { test as base, request, type APIRequestContext, type BrowserContext, type Page } from "@playwright/test";

export const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

export const FOUNDER_A = {
  email: process.env.FOUNDER_A_EMAIL || "jack.cook@heritagels.org",
  password: process.env.FOUNDER_A_PASSWORD || "FoundersTest!2026",
};

export const FOUNDER_B = {
  email: process.env.FOUNDER_B_EMAIL || "frank.carbonara@heritagels.org",
  password: process.env.FOUNDER_B_PASSWORD || "FoundersTest!2026",
};

export const TEST_AGENT = {
  email: process.env.TEST_AGENT_EMAIL || "agent.test@heritagels.org",
  password: process.env.TEST_AGENT_PASSWORD || "AgentTest!2026",
};

export const TEST_MANAGER = {
  email: process.env.TEST_MANAGER_EMAIL || "manager.test@heritagels.org",
  password: process.env.TEST_MANAGER_PASSWORD || "ManagerTest!2026",
};

export const TEST_OWNER = {
  email: process.env.TEST_OWNER_EMAIL || "owner.test@heritagels.org",
  password: process.env.TEST_OWNER_PASSWORD || "OwnerTest!2026",
};

export interface SessionHandle {
  api: APIRequestContext;
  cookieHeader: string;
  cookies: Array<{ name: string; value: string; domain: string; path: string }>;
  user: { id: string; email: string; role: string; firstName: string; lastName: string };
}

/**
 * Logs in via /api/auth/login and returns an APIRequestContext that carries
 * the resulting session cookie on every subsequent call.
 */
export async function loginAs(email: string, password: string): Promise<SessionHandle> {
  // Throwaway context just for the login round-trip so we can capture set-cookie.
  const bootstrap = await request.newContext({ baseURL: BASE_URL });
  const res = await bootstrap.post("/api/auth/login", {
    data: { email, password },
    headers: { "content-type": "application/json" },
  });
  if (!res.ok()) {
    throw new Error(`Login failed for ${email}: ${res.status()} ${await res.text()}`);
  }
  const body = await res.json();
  const user = body.user || body;

  const storage = await bootstrap.storageState();
  await bootstrap.dispose();

  const url = new URL(BASE_URL);
  const cookies = storage.cookies
    .filter((c) => c.domain === url.hostname || c.domain === `.${url.hostname}` || c.domain === "")
    .map((c) => ({ name: c.name, value: c.value, domain: c.domain || url.hostname, path: c.path || "/" }));
  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

  // Build a fully-cookied APIRequestContext for the rest of the spec.
  const api = await request.newContext({
    baseURL: BASE_URL,
    storageState: storage,
    extraHTTPHeaders: { "content-type": "application/json" },
  });

  return {
    api,
    cookieHeader,
    cookies,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
    },
  };
}

/**
 * Adds the captured session cookies to an existing browser context so the
 * next page.goto() lands as the logged-in user.
 */
export async function applySessionToContext(ctx: BrowserContext, session: SessionHandle): Promise<void> {
  await ctx.addCookies(
    session.cookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain.startsWith(".") ? c.domain : c.domain,
      path: c.path,
    }))
  );
}

/**
 * Convenience helper: login, attach to the page's context, navigate to `to`.
 */
export async function loginAndGoto(page: Page, email: string, password: string, to = "/"): Promise<SessionHandle> {
  const session = await loginAs(email, password);
  await applySessionToContext(page.context(), session);
  await page.goto(to, { waitUntil: "domcontentloaded" });
  return session;
}

type FoundersFixtures = {
  founderA: SessionHandle;
  founderB: SessionHandle;
};

/**
 * `test` extended with two founder logins. Use:
 *   import { test, expect } from "./fixtures/foundersAuth";
 *   test("...", async ({ founderA, founderB, page }) => { ... });
 */
export const test = base.extend<FoundersFixtures>({
  founderA: async ({}, use) => {
    const handle = await loginAs(FOUNDER_A.email, FOUNDER_A.password);
    await use(handle);
    await handle.api.dispose().catch(() => {});
  },
  founderB: async ({}, use) => {
    const handle = await loginAs(FOUNDER_B.email, FOUNDER_B.password);
    await use(handle);
    await handle.api.dispose().catch(() => {});
  },
});

export { expect } from "@playwright/test";
