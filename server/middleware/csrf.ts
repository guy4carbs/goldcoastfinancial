import { doubleCsrf } from "csrf-csrf";
import type { Request, Response, NextFunction } from "express";

/**
 * CSRF protection — double-submit cookie pattern via csrf-csrf.
 *
 * Why this design:
 *   - Cookie-based session auth means a malicious site can trigger a
 *     state-changing API call from a victim's browser. Without a CSRF token
 *     check, the session cookie is sent automatically.
 *   - Double-submit: the server sets a non-HttpOnly cookie with a hashed
 *     token; the client mirrors the token in a header. Server compares them.
 *   - The token is **bound to the session id**, so a stolen token from one
 *     browser tab can't be used from another browser/session.
 *
 * Exemptions:
 *   - Webhook endpoints (Plaid, future Stripe/DocuSign) — they're verified by
 *     vendor signature, not by user session.
 *   - Read-only verbs (GET/HEAD/OPTIONS) — no state change.
 *   - Anonymous auth endpoints (login, register, password-reset) — no session
 *     yet to bind a token to. They get protection from rate limits + their own
 *     content checks.
 */

const CSRF_COOKIE_NAME = "gc.csrf";
const CSRF_HEADER_NAME = "x-csrf-token";

const {
  doubleCsrfProtection,
  generateCsrfToken,
} = doubleCsrf({
  // 32-byte secret used to sign the cookie. Falls back to SESSION_SECRET to
  // keep dev simple; production should set CSRF_SECRET explicitly.
  getSecret: () => process.env.CSRF_SECRET || process.env.SESSION_SECRET || "gc-dev-csrf-secret",
  // Session-stable id — for cookie sessions we tie it to the session id so
  // tokens issued under one session can't replay under another.
  getSessionIdentifier: (req: Request) => {
    const sid = (req as any).sessionID as string | undefined;
    return sid || "anonymous";
  },
  cookieName: CSRF_COOKIE_NAME,
  cookieOptions: {
    httpOnly: false, // intentionally readable so the SPA can echo it in a header
    sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
  // Verbs that SKIP the CSRF check.
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getCsrfTokenFromRequest: (req: Request) =>
    (req.headers[CSRF_HEADER_NAME] as string | undefined) ||
    (req.headers[CSRF_HEADER_NAME.toUpperCase()] as string | undefined) ||
    null,
});

/**
 * Path-level exemptions — webhooks bypass the CSRF check because they have
 * vendor signature auth (Plaid JWT, etc.).
 */
const EXEMPT_PATH_PREFIXES = [
  "/api/founders/plaid/webhook",
  "/api/webhooks/stripe",   // signature-verified by Stripe-Signature header
  "/api/auth/login",        // pre-session, no token to issue yet
  "/api/auth/register",
  "/api/auth/password-reset",
  "/api/health",
];

function isExempt(fullPath: string): boolean {
  // Strip query string, then test against exempt prefixes.
  const path = fullPath.split("?")[0];
  return EXEMPT_PATH_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Use originalUrl so this works regardless of where the middleware is mounted
  // (e.g. app.use("/api", csrfProtection) strips "/api" from req.path).
  if (isExempt(req.originalUrl || req.url)) return next();
  return doubleCsrfProtection(req, res, next);
}

/**
 * Endpoint that returns a fresh CSRF token. The SPA calls this once on boot
 * and then echoes the token in a header on every state-changing request.
 */
export function csrfTokenHandler(req: Request, res: Response) {
  const token = generateCsrfToken(req as any, res as any);
  res.json({ csrfToken: token, headerName: CSRF_HEADER_NAME });
}

export const CSRF_HEADER = CSRF_HEADER_NAME;
