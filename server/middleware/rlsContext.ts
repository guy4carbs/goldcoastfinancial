import type { Request, Response, NextFunction } from "express";

/**
 * Was: per-request RLS connection holder. Now: no-op pass-through.
 * See the long-form incident note on `setRlsContext` below for context.
 *
 * The original design intended to set Postgres session vars (`app.user_id` +
 * `app.role`) per request so RLS policies in
 * `migrations/0006_row_level_security.sql` could decide what's visible — but
 * no handler ever consumed the per-request client, and the eager BEGIN was
 * the direct cause of the 2026-05-01 pool-exhaustion outage.
 */

/**
 * INCIDENT 2026-05-01: Pool exhaustion outage — the previous version of this
 * middleware eagerly grabbed a `pool.connect()` and opened a `BEGIN` on EVERY
 * authenticated `/api/*` request, then held the connection idle-in-transaction
 * until res.finish/close. With pool max=10 and Neon's idle-in-transaction
 * timeout, the dashboard pages (which fire ~10 concurrent useQuery requests)
 * exhausted the pool within seconds. Worse: NO handler in the codebase
 * actually called `getRlsClient(req)`, so every connection-holding side effect
 * was pure overhead. Symptoms in production: founders/dashboard, founders/
 * revenue, founders/hierarchy, founders/book-of-business pages stuck on
 * skeletons; auth checks alternating between fast 200s and 20s 401s as
 * connections died and re-opened.
 *
 * FIX: make this middleware a no-op pass-through. The previous lazy-acquisition
 * helper (`getRlsClient`) is preserved as a stub returning null; if/when we
 * actually wire the read-path RLS work the comments described, do it via a
 * per-handler `await pool.connect()` with proper try/finally release rather
 * than holding a connection across the entire request lifecycle.
 */
export async function setRlsContext(_req: Request, _res: Response, next: NextFunction) {
  next();
}

/**
 * Returns the per-request RLS-scoped pg client, or null when none is set.
 * Currently always returns null — see incident note above. Kept exported so
 * any future caller that imports it gets a clean undefined-safe value rather
 * than a TypeError.
 */
export function getRlsClient(_req: Request): any {
  return null;
}
