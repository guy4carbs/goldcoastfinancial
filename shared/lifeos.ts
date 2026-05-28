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
export const LIFEOS_VERSION = "1.1.3";

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
export const LIFEOS_RELEASE_TITLE = "agency_manager role recognition — fixes 'role is client' lockout";
export const LIFEOS_RELEASE_SUMMARY =
  "Users with role 'agency_manager' (created via the recent /apply invite flow) were being silently downgraded to 'client' by the frontend RoleProtectedRoute guard because the client-side Role enum only knew about the legacy 'manager' string. They saw 'no access' on every protected page. RoleProtectedRoute now normalizes 'agency_manager' to the canonical AGENCY_MANAGER role so both legacy 'manager' and new 'agency_manager' DB values resolve to the same manager-tier access.";
export const LIFEOS_RELEASE_BODY_MARKDOWN = `## What's Fixed

- **agency_manager → client downgrade in RoleProtectedRoute.** The frontend's \`Roles.AGENCY_MANAGER\` constant was still the legacy string \`'manager'\` (4 active users), while the server now emits \`'agency_manager'\` for newly-invited managers (3 active users). \`isValidRole('agency_manager')\` returned false, so \`RoleProtectedRoute\` fell back to \`Roles.CLIENT\` and the AccessDenied UI displayed "role: client" on every protected page — even though the database row was correct. Added \`normalizeRole()\` in \`client/src/types/permissions.ts\` that maps the canonical server string \`'agency_manager'\` → \`Roles.AGENCY_MANAGER\` (= \`'manager'\`) so existing access checks against the legacy constant keep working unchanged, AND new 'agency_manager' users now resolve correctly. Both DB values now mean manager-tier access.`;

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
