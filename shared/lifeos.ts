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
export const LIFEOS_VERSION = "1.1.2";

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
export const LIFEOS_RELEASE_TITLE = "2FA verify race fix — no more 'no access' after login";
export const LIFEOS_RELEASE_SUMMARY =
  "Fixes a session-write race that caused some users (especially agency_manager + manager + sales_agent) to land in a 'no access to lounges, CRM, anything' state immediately after entering their 2FA code. All six 2FA verify endpoints (TOTP, recovery, email enroll, email login, passkey enroll, passkey login) now explicitly save the session to PostgreSQL before responding, so the SPA's next request can never load a stale session row.";
export const LIFEOS_RELEASE_BODY_MARKDOWN = `## What's Fixed

- **2FA verify session-write race.** Every 2FA verify path used to set \`session.twoFactorVerified = true\` and immediately respond, relying on express-session's implicit save-on-finish. With the PostgreSQL session store, that save can race against the SPA's immediate \`window.location.assign(...)\` — the next request loads a session row that doesn't yet have the verified flag, every API call 403s with \`REQUIRES_2FA\`, and the user sees an empty dashboard interpreted as "no access". All six verify endpoints (\`/api/auth/2fa/verify\`, \`/api/auth/2fa/email/enroll/verify\`, \`/api/auth/2fa/email/verify\`, \`/api/auth/webauthn/register/begin\` self-heal, \`/api/auth/webauthn/register/finish\`, \`/api/auth/webauthn/auth/finish\`) now explicitly call \`req.session.save()\` and only respond inside its callback. On failure they return \`{ error, code: SESSION_SAVE_FAILED }\` so the SPA can surface a real error instead of a silent broken state.`;

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
