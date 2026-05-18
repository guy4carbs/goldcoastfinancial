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
export const LIFEOS_VERSION = "1.0.60";

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
export const LIFEOS_RELEASE_TITLE = "Lockstep with Heritage — both apps on 1.0.60";
export const LIFEOS_RELEASE_SUMMARY =
  "No Gold Coast changes. Heritage tightened the Telnyx token endpoint with maxRetries: 0 + a 25s handler-level wall-clock so users always see a structured JSON error, never Cloudflare's HTML 502. Plus a defensive fallback on the lifeOS topbar pill so it never renders blank.";
export const LIFEOS_RELEASE_BODY_MARKDOWN = `## What's New

- **No functional Gold Coast changes.** Heritage shipped a deep-clean pass after the four-wave debug sweep, weeding out latent issues that hadn't yet surfaced visibly. Headlines: Telnyx 502 root cause was Cloudflare's HTML 502 (origin hung past CF's window because the Telnyx SDK had no client-side timeout — now \`timeout: 15_000\`); founder/director/agency_manager were missing from \`GCFWebSocketServer\`'s role-channel maps so C-suite silently received zero real-time data (added all three); top-level \`<ErrorBoundary>\` so a single component crash can't white-screen the app; Vite \`build.sourcemap: true\` so console stack traces resolve to .tsx file:line; new \`safeStorage\` helper deployed to AgentLoungeLayout / LoungeLayout / AdminSubmissions so Safari private mode no longer crashes the page; lazy \`getStripePromise()\` so Stripe's RUM beacon only fires when the checkout dialog opens (not on every marketplace page load); TS target bumped to ES2020 (wipes ~6 Map/Set iteration errors); and three pre-existing TS errors fixed (routes.ts duplicate-key + arg count, schema.ts duplicate \`importHistory\` export). Gold Coast tracks the version number for parity.`;


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
