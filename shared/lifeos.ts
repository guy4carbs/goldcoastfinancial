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
export const LIFEOS_VERSION = "1.2.0";

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
export const LIFEOS_RELEASE_TYPE: "major" | "minor" | "patch" = "minor";
export const LIFEOS_RELEASE_TITLE = "Email Platform";
export const LIFEOS_RELEASE_SUMMARY =
  "Gold Coast now runs on its own email infrastructure: a dedicated delivery provider with real delivery/open/click tracking, a working unsubscribe system, notification preferences that save, and automated email sequences for client follow-ups — matching Heritage 1.2.0.";
export const LIFEOS_RELEASE_BODY_MARKDOWN = `## What's New

- **Modern email delivery.** Company email (quotes, portal messages, approvals, onboarding, password resets, 2FA) now rides a dedicated email platform built for deliverability. Every email is tracked: delivered, opened, clicked, bounced.
- **Working unsubscribe.** Marketing-type emails carry one-click unsubscribe (the kind Gmail and Yahoo require). Opt-outs are suppressed platform-wide — and transactional email like password resets always still delivers.
- **Notification preferences that save.** The portal preferences drawer now persists your choices and they take effect immediately.
- **Email sequences.** Founders get a sequences manager (Organization → Email Sequences): build multi-step drip sequences with a template library, enroll leads, and watch per-enrollment delivery, opens, and clicks.

## Under the Hood

- New \`server/services/email/\` transport (Resend + Gmail fallback, suppression gate, send logging) — all existing email functions migrated with zero signature changes; from-addresses stay on goldcoastfnl.com.
- Resend delivery webhooks populate the shared \`emails_sent\` tracking columns; bounces and complaints auto-suppress.
- HMAC-signed unsubscribe tokens (RFC 8058 one-click), shared \`email_suppressions\` store, CRLF header-injection hardening, OTP/reset emails redacted from logs.
- Sequence sending is processed by the Heritage worker on the shared database; Gold Coast provides the management UI and read/write surface.`;


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
