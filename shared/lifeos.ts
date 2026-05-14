/**
 * lifeOS — single source of truth for the deployed bundle's version.
 *
 * Bumped on every release alongside the matching `lifeos_releases` row. The
 * server reads this constant to tell the client what version is running; the
 * client compares against its own baked-in copy (via the `__LIFEOS_VERSION__`
 * Vite-injected global). Mismatch → "Update Available" popup fires.
 *
 * Versioning rules (semver, mirrors Apple's policy):
 *   - MAJOR (X.0.0) — annual flagship; breaking redesign or new lounge
 *   - MINOR (0.X.0) — new feature shipped during the year
 *   - PATCH (0.0.X) — bug fixes / quality improvements / hotfixes
 *
 * Both Gold Coast and Heritage import from `@shared/lifeos` so they always
 * report the same version. Bumping requires editing this file in BOTH the
 * gcf root (Gold Coast) and the heritage-app branch's shared/ (Heritage)
 * to stay in lockstep.
 */
export const LIFEOS_VERSION = "1.0.24";

/**
 * Release notes that ship with this version. The server's
 * `ensureLifeOSReleaseSeed()` boot hook publishes a `lifeos_releases` row
 * using these constants when none already exists for this version, so the
 * Update Available + What's New popups always have customer-readable content
 * to display. Founders can still author richer notes later in the admin UI;
 * the seed leaves manually-authored rows untouched.
 *
 * Bumping LIFEOS_VERSION on a deploy:
 *   1. Set LIFEOS_VERSION to the new version
 *   2. Set LIFEOS_RELEASE_TYPE to "major" | "minor" | "patch"
 *   3. Set LIFEOS_RELEASE_TITLE — short customer-readable headline
 *   4. Set LIFEOS_RELEASE_SUMMARY — one-line subhead
 *   5. Set LIFEOS_RELEASE_BODY_MARKDOWN — bullets describing the changes
 */
export const LIFEOS_RELEASE_TYPE: "major" | "minor" | "patch" = "patch";
export const LIFEOS_RELEASE_TITLE = "Cleanup pass";
export const LIFEOS_RELEASE_SUMMARY =
  "E&O uploads now actually save, pending-registrations hide invited-but-not-submitted users, What's New popups respect dismiss across reloads, app launcher tightens to 3x3, and signed documents always show a legible signature.";
export const LIFEOS_RELEASE_BODY_MARKDOWN = `## What's New

- **E&O certificate uploads actually save.** The Application's E&O step was only updating local state — files never reached the server. Now it POSTs straight to /api/apply/upload like every other document step, so every new applicant's certificate persists into HCMS.
- **Signed documents always have a signature.** Older signed PDFs that showed an empty yellow box now render a script-styled typed-name signature as a fallback. New applicants signing on the canvas still get their actual hand-drawn signature embedded.
- **What's New popup respects dismiss.** Closing the popup now persists across page reloads — it won't re-appear for the same release just because you hit refresh before the next status poll.
- **Cleaner app launcher.** The Gold Coast Apps menu is now a clean 3×3 — HCMS, Founders, and Heritage are open, with Ops Hub, Finance, Investors, Marketing, Training, and AI Council showing "Coming soon" so the roadmap is obvious at a glance. CRM was retired (the Heritage CRM is the canonical surface).
- **Pending Registrations stops including unsubmitted invites.** When you invite an agent, they no longer clutter the Pending Registrations tab until they actually complete and submit their application. Organic applicants from the public site still appear the moment they sign up.`;


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
