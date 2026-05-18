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
export const LIFEOS_VERSION = "1.0.59";

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
export const LIFEOS_RELEASE_TITLE = "Deep clean — Telnyx 502 root cause + latent runtime bugs swept";
export const LIFEOS_RELEASE_SUMMARY =
  "The Telnyx 502 was Cloudflare's own page (origin hung past CF's window); 15s SDK timeout makes failures land as structured JSON. Plus: missing role-channel maps for founder/director (real C-suite WS bug), top-level ErrorBoundary so a single crash can't white-screen the app, source maps in prod, Safari-private-mode-safe localStorage, deferred Stripe loader, schema dedup, and TS target bumped to ES2020.";
export const LIFEOS_RELEASE_BODY_MARKDOWN = `## What's New

- **Telnyx 502 root cause.** The \`code=UNKNOWN http=502\` users were seeing was Cloudflare's HTML 502 page — not our handler. Telnyx SDK's default timeout is 60s, ours had no override, and Cloudflare cut the request before our handler could respond. Set \`timeout: 15_000\` on the Telnyx client. Failures now land as structured JSON (\`code: VOICE_UPSTREAM_UNAVAILABLE\` etc.) inside CF's window, and the dialer shows the real reason instead of a generic error.
- **C-suite real-time comms restored.** \`GCFWebSocketServer\` had a \`Record<Role, Channel[]>\` typed map that only covered 7 of 10 roles. When a founder, director, or canonical-string agency_manager connected to \`/ws/gcf\`, channel-access lookup returned \`undefined\` — they silently received zero real-time data. Added all three missing entries plus an executive-defaults preset.
- **Top-level ErrorBoundary.** A single component crash no longer white-screens the entire app. \`<ErrorBoundary>\` wraps the whole provider tree and renders a clean Heritage-styled fallback ("Try again" / "Reload page") with the dev-mode stack visible in DevTools.
- **Source maps in prod.** Vite \`build.sourcemap: true\`. Console stack traces now resolve to the .tsx file:line instead of \`index-BloVtNjH.js:5447:21646\`.
- **Safari private mode safe.** New \`@/lib/safeStorage\` wrappers (\`safeGet\` / \`safeSet\` / \`safeRemove\` / \`safeKeys\`) replace direct \`localStorage.*\` calls in AgentLoungeLayout, LoungeLayout, and AdminSubmissions. Previously crashed on first render in Safari private + some in-app browsers.
- **Stripe deferred.** \`loadStripe()\` was firing at module-import time, kicking off Stripe's \`m.stripe.network/b\` RUM beacon on every page that touched the marketplace bundle (even when the user wasn't paying). Switched to a lazy \`getStripePromise()\` that only runs when the checkout dialog opens. Cuts the \`/b\` 400s from every page-load down to actual checkout sessions.
- **TS target → ES2020.** Wipes the half-dozen pre-existing Map/Set iteration errors at once. No runtime risk on Node 18+/Vite.
- **Pre-existing TS errors fixed.** \`routes.ts:1476\` (\`sendSecureFormLink\` signature now matches the call site, includes form-type + agent name in the SMS message). \`routes.ts:1845\` (duplicate \`smsSent\` key removed). \`shared/schema.ts\` duplicate \`importHistory\` export removed (CRM version kept; enterprise duplicate had no consumers).
- **/b 400 on the marketplace page itself remains** — it's Stripe's own beacon firing during checkout. Not our endpoint; not fixable from our side.`;

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
