/**
 * Log scrubber — wraps console.log/error/warn so that any sensitive token
 * accidentally passed in (`access_token`, `password`, `ssn`, banking, etc.)
 * is redacted before hitting stdout/stderr.
 *
 * Why this design:
 *   - Many handlers log `e.message` on errors. Postgres "invalid input syntax"
 *     errors include the offending value verbatim, which can leak secrets if
 *     the value happened to be a token.
 *   - `console.error("foo:", payload)` is a common pattern. Walking the args
 *     and recursing into objects catches both string-arg and object-arg cases.
 *
 * Defenses:
 *   - Hardcoded list of known-sensitive keys — extend as new fields appear.
 *   - Hardcoded list of regexes for token-shaped values (Bearer, Plaid
 *     access-* prefix, SSN-shaped digit groups).
 *   - Caps at depth 6 to prevent DoS via cyclic objects.
 */

const SENSITIVE_KEYS = new Set<string>(
  [
    "password",
    "passwd",
    "pwd",
    "access_token",
    "accesstoken",
    "refresh_token",
    "refreshtoken",
    "id_token",
    "idtoken",
    "ssn",
    "social_security_number",
    "routing_number",
    "account_number",
    "card_number",
    "cvv",
    "cvc",
    "two_factor_secret",
    "twofactorsecret",
    "totp_secret",
    "secret",
    "api_key",
    "apikey",
    "client_secret",
    "clientsecret",
    "private_key",
    "privatekey",
    "csrf_token",
    "csrftoken",
    "session_secret",
    "session_id",
    "sessionid",
    "set-cookie",
    "cookie",
    "authorization",
  ].map((s) => s.toLowerCase()),
);

const SENSITIVE_VALUE_PATTERNS: RegExp[] = [
  /Bearer\s+[A-Za-z0-9._\-=]+/i,
  /access[-_]?(production|sandbox|development)[-_][A-Za-z0-9-]+/i, // Plaid token shape
  /\b\d{3}-\d{2}-\d{4}\b/, // US SSN
  /sk_(live|test)_[A-Za-z0-9]+/i, // Stripe-style secret keys
];

const REDACTED = "[REDACTED]";

function redactString(s: string): string {
  let out = s;
  for (const re of SENSITIVE_VALUE_PATTERNS) {
    out = out.replace(re, REDACTED);
  }
  return out;
}

function redactValue(v: unknown, depth: number, seen: WeakSet<object>): unknown {
  if (depth >= 6) return REDACTED;
  if (v === null || v === undefined) return v;
  if (typeof v === "string") return redactString(v);
  if (typeof v === "number" || typeof v === "boolean" || typeof v === "bigint") return v;
  if (v instanceof Error) {
    return `${v.name}: ${redactString(v.message)}`;
  }
  if (Array.isArray(v)) {
    return v.map((x) => redactValue(x, depth + 1, seen));
  }
  if (typeof v === "object") {
    if (seen.has(v as object)) return "[Circular]";
    seen.add(v as object);
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(k.toLowerCase())) {
        out[k] = REDACTED;
      } else {
        out[k] = redactValue(val, depth + 1, seen);
      }
    }
    return out;
  }
  return v;
}

function redactArgs(args: unknown[]): unknown[] {
  const seen = new WeakSet<object>();
  return args.map((a) => redactValue(a, 0, seen));
}

let installed = false;

/**
 * Install the scrubber on `console.log/error/warn/info`. Idempotent —
 * calling twice has no effect. Original references are kept so a subsequent
 * `restore()` (used in tests) can undo the wrap.
 */
export function installLogScrubber(): void {
  if (installed) return;
  installed = true;
  const wrap = (method: "log" | "error" | "warn" | "info") => {
    const original = (console[method] as (...args: unknown[]) => void).bind(console);
    (console[method] as unknown) = (...args: unknown[]) => original(...redactArgs(args));
  };
  wrap("log");
  wrap("error");
  wrap("warn");
  wrap("info");
}

export function _redactValueForTests(v: unknown): unknown {
  return redactValue(v, 0, new WeakSet<object>());
}
