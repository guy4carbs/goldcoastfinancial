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
export const LIFEOS_VERSION = "1.0.47";

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
export const LIFEOS_RELEASE_TITLE = "Heritage 2FA enrollment + verification actually fire on login (Wave 1)";
export const LIFEOS_RELEASE_SUMMARY =
  "High-trust users signing into Heritage now get routed to the TOTP enrollment page on first login, and to the verify page on subsequent logins — instead of landing on a broken lounge where every API call 403s. First of four waves cleaning up the agent lounge.";
export const LIFEOS_RELEASE_BODY_MARKDOWN = `## What's New

- **2FA enrollment endpoints exempted from the 2FA gate.** Heritage's \`/api/ai/2fa/setup\`, \`/verify\`, \`/status\`, and DELETE \`/api/ai/2fa\` were stuck in a circular dependency — the very endpoints a fresh user needed to enroll were gated by the 2FA gate they were trying to clear. All four are now in \`TWO_FA_EXEMPT_PATHS\`. Same circular fix we shipped on Gold Coast in 1.0.40.
- **New \`Force2FAGate\` wrapper.** A top-level component now redirects authenticated high-trust users to \`/ai/2fa-setup\` (if not enrolled) or \`/ai/2fa-verify\` (if not yet session-verified). Before this, users would land on a lounge with every API call returning 403 and no clue why or where to go. The gate mirrors the server-side \`HIGH_TRUST_2FA_ROLES\` policy exactly.

## Wave 1 of 4

Console errors on the agent lounge had four root causes: 2FA gate (this wave), CSP, WebSocket, and a missing \`/metrics\` endpoint. Each ships in its own version + verification cycle.`;

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
