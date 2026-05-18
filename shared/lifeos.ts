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
export const LIFEOS_VERSION = "1.0.60";

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
export const LIFEOS_RELEASE_TITLE = "Telnyx never-hangs guarantee + lifeOS badge defensive render";
export const LIFEOS_RELEASE_SUMMARY =
  "Even after 1.0.59's 15s SDK timeout, users still saw code=UNKNOWN http=502 (Cloudflare's HTML page) — meaning Telnyx SDK retries pushed total wall-clock past the gateway window. Now bounded at 25s with a handler-level Promise.race: the /token endpoint ALWAYS returns structured JSON, even on infrastructure failure. lifeOS pill in the topbar also gets a defensive fallback so it can never render blank.";
export const LIFEOS_RELEASE_BODY_MARKDOWN = `## What's New

- **Telnyx /token never hangs past 25s.** 1.0.59 added \`timeout: 15_000\` on the SDK client, but the SDK still retried up to 2 times silently (= 45s worst-case wall-clock), which could exceed gateway timeouts and result in Cloudflare's HTML 502 page (client saw \`code=UNKNOWN\`). 1.0.60 sets \`maxRetries: 0\` on the SDK AND wraps the entire \`/token\` handler in a hard 25s wall-clock via \`setTimeout\` + a \`respond()\` helper that clears it. After 25s the handler returns its own 504 JSON (\`code: VOICE_HANDLER_TIMEOUT\`, \`retryable: true\`) — guaranteed structured response, never CF's opaque page. Entry/exit + elapsed-ms logging now lands in Railway logs for every request so we can see the actual stage timing.
- **Specific code for connection-level failures.** The catch block now distinguishes \`APIConnectionTimeoutError\` / \`APIConnectionError\` / generic network errors (ETIMEDOUT/ECONNRESET/EAI_AGAIN) and returns \`code: VOICE_UPSTREAM_UNAVAILABLE\` with \`retryable: true\` instead of the generic 500 fallback. So even SDK-level timeouts now show a meaningful code, not UNKNOWN.
- **lifeOS pill defensive render.** \`LifeOSVersionBadge\` now falls back to \`…\` if \`yourVersion\` is empty during initial hydration (was rendering a sparkle icon with invisible trailing-space text in a flex container that could clip). Added \`whitespace-nowrap\` + \`flex-shrink-0\` so the pill always preserves enough width to show the version label.`;

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
