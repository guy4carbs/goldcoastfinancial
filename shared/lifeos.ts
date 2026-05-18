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
export const LIFEOS_VERSION = "1.0.58";

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
export const LIFEOS_RELEASE_TITLE = "Wave 4 — Telnyx token diagnostics + WS heartbeats (idle disconnects fixed)";
export const LIFEOS_RELEASE_SUMMARY =
  "Two prod failures cleaned up: /api/calls/token now returns structured error codes so the dialer UI can show specific messaging (and prod logs reveal which Telnyx step failed); /ws/chat and /ws/avatar-council have server-side ping/pong heartbeats so Cloudflare's ~100s idle timeout stops killing connections.";
export const LIFEOS_RELEASE_BODY_MARKDOWN = `## What's New

- **Telnyx /token diagnostics.** \`/api/calls/token\` previously caught every failure as a generic 500 "Failed to generate token". It now reports back \`{ error, code, retryable }\` with a specific code per failure mode: \`VOICE_NOT_CONFIGURED\` (env vars missing — also logs which env var), \`VOICE_UPSTREAM_AUTH\` (Telnyx rejected our API key), \`VOICE_CREDENTIAL_STALE\` (stored credentialId no longer exists on Telnyx — endpoint auto-clears the row so the next call re-provisions), \`VOICE_UPSTREAM_UNAVAILABLE\` (Telnyx 5xx), \`VOICE_TOKEN_FAILED\` (unknown). Server logs also report which pipeline stage failed (\`env-check\`, \`db-credential-lookup\`, \`telnyx-create-credential\`, \`telnyx-create-token\`).
- **Dialer UI shows the actual reason.** The \`useTelnyxDevice\` hook now parses the structured shape and surfaces specific messages ("Voice service isn't configured", "Voice provider rejected our credentials", "Voice credential expired — refreshing", "Voice provider is temporarily unavailable") so users see what to do instead of a generic console error.
- **/ws/chat heartbeat.** Cloudflare (which proxies heritagels.org) terminates idle WebSockets after ~100s of no traffic. Without server-side pings, chat tabs that sat idle showed up as "network connection was lost" the next time the page tried to send. Server now pings every 30s and terminates any socket that doesn't pong inside the window (same canonical pattern from the \`ws\` library docs that \`GCFWebSocketServer\` already used).
- **/ws/avatar-council heartbeat.** Same fix — was also missing a heartbeat.
- **Storage soft-delete for stale Telnyx credentials.** Added \`storage.deleteAgentTelephonyCredential()\` (marks the row \`isActive=false\`) so the auto-recovery path on \`VOICE_CREDENTIAL_STALE\` works without leaving zombie rows.
- **The /b 400 in the console is Stripe's own analytics beacon** (\`m.stripe.network/b/...\`) — not a Heritage endpoint, not in our codebase. Stripe's beacon is independent of the payment flow; harmless. Left alone.
- **The original /metrics 404 has stopped firing** — no longer in the user's console output. No fix needed.`;

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
