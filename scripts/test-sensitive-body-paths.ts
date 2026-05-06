/**
 * Regression test for the SENSITIVE_BODY_PATHS scrubber regex in
 * `server/index.ts`.
 *
 * Why this exists:
 *   The scrubber prevents Firebase signed URLs and raw S3 keys from leaking
 *   into stdout via the request logger. Sentinel vetoed an earlier release
 *   where these leaked. If anyone narrows the regex without keeping the
 *   existing endpoints covered, we silently regress.
 *
 * What this does:
 *   1. Declares the regex INLINE (the spec we want to lock in).
 *   2. Loads the LIVE regex from server/index.ts by reading the file as
 *      text and parsing the `SENSITIVE_BODY_PATHS = /…/` line. We avoid
 *      importing server/index.ts because it has heavy side effects
 *      (binds a port, opens DB pools, etc.).
 *   3. Asserts the inline regex equals the parsed regex (parser sanity).
 *   4. Runs MUST_MATCH and MUST_NOT_MATCH cases against both regexes.
 *   5. Exits 0 on success, 1 on any failure.
 *
 * Run with: npm run test:sensitive-paths
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// 1. Inline regex — this is the spec we want server/index.ts to match.
// ---------------------------------------------------------------------------
const INLINE_REGEX =
  /\/(documents\/[^/]+\/(url|stream)|document\/[^/]+|signed\/[^/]+)$/;

// ---------------------------------------------------------------------------
// 2. Parse the live regex from server/index.ts as plain text.
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SERVER_INDEX_PATH = resolve(__dirname, "..", "server", "index.ts");

function loadLiveRegex(): RegExp {
  const source = readFileSync(SERVER_INDEX_PATH, "utf8");
  // Match: const SENSITIVE_BODY_PATHS =\n  /…/;
  // The regex literal may wrap onto the next line, so allow whitespace.
  const match = source.match(
    /const\s+SENSITIVE_BODY_PATHS\s*=\s*(\/[^\n]+?\/)\s*;/,
  );
  if (!match) {
    throw new Error(
      `Could not locate \`SENSITIVE_BODY_PATHS = /…/;\` in ${SERVER_INDEX_PATH}. ` +
        `Did the declaration move or change shape? Update the parser in this script.`,
    );
  }
  const literal = match[1];
  // Strip leading `/` and trailing `/[flags]`. We expect no flags.
  const lastSlash = literal.lastIndexOf("/");
  const body = literal.slice(1, lastSlash);
  const flags = literal.slice(lastSlash + 1);
  return new RegExp(body, flags);
}

const LIVE_REGEX = loadLiveRegex();

// ---------------------------------------------------------------------------
// 3. Test cases.
// ---------------------------------------------------------------------------
const MUST_MATCH: string[] = [
  // BoB documents URL/stream — agent + founder
  "/api/book-of-business/documents/abc-123/url",
  "/api/book-of-business/documents/abc-123/stream",
  "/api/founders/book/documents/abc-123/url",
  "/api/founders/book/documents/abc-123/stream",
  // agent-portal /document/:type and /signed/:type URL-issuance + stream siblings
  "/api/agent-portal/document/eo_cert",
  "/api/agent-portal/signed/nda",
  "/api/agent-portal/documents/eo_cert/stream",
  "/api/agent-portal/signed/documents/nda/stream",
  // hcms-agents /:userId/document/:type URL-issuance + /documents/:type/stream
  "/api/hcms/agents/uuid-123/document/eo_cert",
  "/api/hcms/agents/uuid-123/documents/eo_cert/stream",
];

const MUST_NOT_MATCH: string[] = [
  // documents *list* endpoints — must fall through to normal logger
  "/api/founders/book/clients/abc/documents",
  "/api/book-of-business",
  "/api/auth/user",
  "/api/founders/dashboard",
  // close to a sensitive shape but not one — see test spec note
  "/api/founders/book/clients/abc/policies",
];

// ---------------------------------------------------------------------------
// 4. Runner.
// ---------------------------------------------------------------------------
type Result = { ok: boolean; label: string };
const results: Result[] = [];

function record(label: string, ok: boolean): void {
  results.push({ label, ok });
  const tag = ok ? "PASS" : "FAIL";
  // eslint-disable-next-line no-console
  console.log(`[${tag}] ${label}`);
}

// Parser sanity: inline regex source must equal live regex source.
record(
  `regex parity: inline source === live source (${INLINE_REGEX.source})`,
  INLINE_REGEX.source === LIVE_REGEX.source &&
    INLINE_REGEX.flags === LIVE_REGEX.flags,
);

for (const path of MUST_MATCH) {
  const inlineHit = INLINE_REGEX.test(path);
  const liveHit = LIVE_REGEX.test(path);
  record(`MUST_MATCH inline: ${path}`, inlineHit);
  record(`MUST_MATCH live:   ${path}`, liveHit);
}

for (const path of MUST_NOT_MATCH) {
  const inlineHit = INLINE_REGEX.test(path);
  const liveHit = LIVE_REGEX.test(path);
  record(`MUST_NOT_MATCH inline: ${path}`, !inlineHit);
  record(`MUST_NOT_MATCH live:   ${path}`, !liveHit);
}

// ---------------------------------------------------------------------------
// 5. Summary + exit code.
// ---------------------------------------------------------------------------
const failed = results.filter((r) => !r.ok);
const passed = results.length - failed.length;
// eslint-disable-next-line no-console
console.log("");
// eslint-disable-next-line no-console
console.log(`${passed}/${results.length} checks passed.`);

if (failed.length > 0) {
  // eslint-disable-next-line no-console
  console.error(`\n${failed.length} FAILED:`);
  for (const f of failed) {
    // eslint-disable-next-line no-console
    console.error(`  - ${f.label}`);
  }
  process.exit(1);
}

process.exit(0);
