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
export const LIFEOS_VERSION = "1.1.0";

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
export const LIFEOS_RELEASE_TYPE: "major" | "minor" | "patch" = "minor";
export const LIFEOS_RELEASE_TITLE = "20-carrier rollout: branded emails, logos, and image CDN";
export const LIFEOS_RELEASE_SUMMARY =
  "11 new carrier partners, branded transactional emails for all 20 carriers (quote, secure forms, product guides), Firebase image CDN admin panel, refreshed homepage carousel, and producer-portal access from the Agent Lounge.";
export const LIFEOS_RELEASE_BODY_MARKDOWN = `## What's New

- **11 new carrier partners** added: Aetna, American-Amicable, Banner Life, Chubb, Foresters, Globe Life, Guarantee Trust, Fidelity Life (InstaBrain), Lafayette Life, Trinity Life, and United Home Life. Total partners: 20.
- **Real Firebase-hosted carrier logos** now render in the homepage carousel (no more text placeholders) and on each \`/carriers/<slug>\` page.
- **Branded transactional emails for all 20 carriers** — quote, secure form (data encryption), and product guide emails now use carrier-specific colors, gradients, and logos. Product guide emails added carrier branding for the first time.
- **Real customer reviews** sourced from Trustpilot, BBB, and named industry review sites for all 11 new carriers. All quotes anonymized per NAIC guidance.
- **Image CDN Manager** wired to Firebase Storage via a new admin backend route — the broken client-side SDK approach is replaced with a proven server-side upload path.
- **Agent Lounge Carriers tab** expanded to 20 carriers with researched producer-portal URLs (Aetna Producer World, LG America Partner, Combined Insurance Agent Portal for Chubb, etc.) and rating tooltips showing AM Best qualifiers.
- **New admin email test endpoint** (\`POST /api/admin/email/test\`) lets owners trigger any branded template to any address for visual QA — used to send 48 test emails this release for verification.
- **5 carrier color palettes corrected** to match each carrier's actual brand: Chubb dark navy, Foresters purple, Globe Life blue, Trinity Life green, United Home Life maroon.`;

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
