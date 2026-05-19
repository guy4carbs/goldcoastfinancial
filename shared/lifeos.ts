/**
 * lifeOS — single source of truth for the deployed bundle's version.
 *
 * Bumped on every release alongside the matching `lifeos_releases` row in
 * the shared Neon DB. The server reads this constant to tell the client
 * what version is running; the client compares against its own baked-in
 * copy (via the `__LIFEOS_VERSION__` Vite-injected global). Mismatch →
 * "Update Available" popup fires.
 *
 * Versioning rules (semver, mirrors Apple's policy):
 *   - MAJOR (X.0.0) — annual flagship; breaking redesign or new lounge
 *   - MINOR (0.X.0) — new feature shipped during the year
 *   - PATCH (0.0.X) — bug fixes / quality improvements / hotfixes
 *
 * Both Gold Coast and Heritage import from `@shared/lifeos` so they always
 * report the same version. Bumping requires editing this file in BOTH the
 * gcf root (Gold Coast) and the heritage-app branch (Heritage) to stay
 * in lockstep.
 */
export const LIFEOS_VERSION = "1.0.62";

/**
 * Release notes that ship with this version. The server's
 * `ensureLifeOSReleaseSeed()` boot hook publishes a `lifeos_releases` row
 * using these constants when none already exists for this version, so the
 * Update Available + What's New popups always have customer-readable content
 * to display. Founders can still author richer notes from the Gold Coast
 * admin UI; the seed leaves manually-authored rows untouched.
 *
 * Bumping LIFEOS_VERSION on a deploy:
 *   1. Set LIFEOS_VERSION to the new version
 *   2. Set LIFEOS_RELEASE_TYPE to "major" | "minor" | "patch"
 *   3. Set LIFEOS_RELEASE_TITLE — short customer-readable headline
 *   4. Set LIFEOS_RELEASE_SUMMARY — one-line subhead
 *   5. Set LIFEOS_RELEASE_BODY_MARKDOWN — bullets describing the changes
 */
export const LIFEOS_RELEASE_TYPE: "major" | "minor" | "patch" = "patch";
export const LIFEOS_RELEASE_TITLE = "Telnyx — merge DB pools + route-level timeout (middleware hangs no longer 502)";
export const LIFEOS_RELEASE_SUMMARY =
  "1.0.60's handler-level wall-clock only fired AFTER requireAuth + attachUser ran. If middleware itself hung (waiting for a DB connection from an exhausted second pool), the handler never started, the wall-clock never fired, and Cloudflare returned its own HTML 502. Fixed by merging the dual pg.Pool instances into one shared pool and adding a route-level withTimeout middleware that fires BEFORE auth runs — always returns our JSON. Plus a /api/calls/_ping diagnostic so we can isolate origin issues from handler issues.";
export const LIFEOS_RELEASE_BODY_MARKDOWN = `## What's New

- **Dual DB pool merged.** \`server/routes.ts\` was constructing its own \`new Pool({...})\` for the express-session store while \`server/db.ts\` already exported a separate pool for Drizzle/ORM. Two pools sharing one Neon DB → either could exhaust under load, causing session lookup or \`attachUser\` to hang indefinitely. They now share a single 20-connection pool with a 5s connection-acquisition timeout (fail fast vs. hang).
- **Route-level \`withTimeout\` middleware on /token.** 1.0.60's wall-clock was a \`setTimeout\` *inside* the handler — it only fired after the middleware chain (\`requireAuth\` → \`attachUser\`) finished. If those hung on a DB call, the handler never started and Cloudflare returned a 502 (no JSON body → client saw \`code=UNKNOWN\`). The new middleware fires before \`requireAuth\`, with a 28s ceiling, and returns our own JSON (\`code: VOICE_GATEWAY_TIMEOUT\`, \`retryable: true\`). Middleware hangs are now caught.
- **\`/api/calls/_ping\` diagnostic.** Trivial endpoint, no auth, no DB, no Telnyx. Returns \`{ ok: true, ts: ... }\`. If \`/_ping\` returns 200 cleanly but \`/token\` 502s, the issue is downstream (DB/Telnyx); if \`/_ping\` itself 502s, the issue is Railway/Cloudflare/process-level.`;

/**
 * Runtime version reader — prefers the Vite-injected build-time constant
 * (`__LIFEOS_VERSION__`), falls back to the source export. Both ought to
 * match; the global lets us detect stale-bundle mismatches without a roundtrip.
 */
export function getRuntimeLifeOSVersion(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const injected = (globalThis as any).__LIFEOS_VERSION__;
  return typeof injected === "string" && injected.length > 0
    ? injected
    : LIFEOS_VERSION;
}

/**
 * Strict semver compare. Returns negative if a < b, positive if a > b, 0 equal.
 */
export function compareLifeOSVersions(a: string, b: string): number {
  const pa = a.split(".").map((n) => parseInt(n, 10));
  const pb = b.split(".").map((n) => parseInt(n, 10));
  for (let i = 0; i < 3; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da - db;
  }
  return 0;
}

/**
 * `true` if `client` is older than `server` (i.e. the user's bundle is stale).
 */
export function isLifeOSUpdateAvailable(client: string, server: string): boolean {
  return compareLifeOSVersions(client, server) < 0;
}

export const LIFEOS_RELEASE_TYPES = ["major", "minor", "patch"] as const;
export type LifeOSReleaseType = (typeof LIFEOS_RELEASE_TYPES)[number];

export const LIFEOS_RELEASE_STATUSES = ["draft", "published", "archived"] as const;
export type LifeOSReleaseStatus = (typeof LIFEOS_RELEASE_STATUSES)[number];

export const LIFEOS_ACK_STATES = [
  "update_available_seen",
  "updated",
  "notes_viewed",
  "dismissed",
] as const;
export type LifeOSAckState = (typeof LIFEOS_ACK_STATES)[number];
