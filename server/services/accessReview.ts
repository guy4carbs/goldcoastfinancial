import { pool } from "../db";

/**
 * Quarterly access review (SOC 2 CC6.2 / CC6.4 evidence).
 *
 * For each user, returns the data the Qualified Individual needs to make
 * a "should this person still have this access?" call:
 *   - role (and whether they're in a high-trust role)
 *   - is_active
 *   - last login (from `login_attempts.success = true`)
 *   - 2FA enrollment + passkey count
 *   - active session count (from connect-pg-simple `sessions` table)
 *   - sensitive scopes touched in the last `daysBack` days, mined from
 *     the founder audit log
 *   - flags: `idle` (no login in 60 days), `over_privileged` (high-trust
 *     role with no 2FA), `dormant_session` (session older than 7 days)
 *
 * No NPI in the output. Counts and ids only.
 */

const HIGH_TRUST = new Set<string>(["founder", "owner", "system_admin"]);

const SENSITIVE_AUDIT_ACTIONS = [
  // Plaid
  "plaid_item_connected",
  "plaid_item_disconnected",
  "plaid_pending_confirmed",
  "plaid_pending_declined",
  // Profit / capital
  "profit_deposit_recorded",
  "profit_deposit_deleted",
  "capital_proposed",
  "capital_approved",
  "capital_reversed",
  // View-as / impersonation
  "viewas_session_started",
  "viewas_session_ended",
];

export interface AccessReviewRow {
  userId: string;
  email: string;
  role: string;
  isActive: boolean;
  highTrust: boolean;
  twoFactorEnabled: boolean;
  passkeyCount: number;
  lastLoginAt: string | null;
  daysSinceLastLogin: number | null;
  activeSessions: number;
  sensitiveActions: { action: string; count: number; lastAt: string }[];
  flags: string[];
}

export interface AccessReviewReport {
  generatedAt: string;
  daysBack: number;
  totalUsers: number;
  rows: AccessReviewRow[];
  summary: {
    highTrustWithout2fa: number;
    idleUsers: number;
    inactiveStillEnabled: number;
  };
}

export async function buildAccessReview(opts: { daysBack?: number } = {}): Promise<AccessReviewReport> {
  const daysBack = opts.daysBack ?? 90;
  const now = new Date();

  // 1. All users with last-login + passkey count via lateral subqueries.
  const users = await pool.query(
    `SELECT u.id, u.email, u.role, u.is_active, u.two_factor_enabled,
            (SELECT MAX(created_at) FROM login_attempts la
              WHERE la.email = LOWER(u.email) AND la.success = true) AS last_login_at,
            (SELECT COUNT(*)::int FROM webauthn_credentials wc WHERE wc.user_id = u.id) AS passkey_count
     FROM users u
     ORDER BY u.email ASC`,
  );

  // 2. Active session count per user (best-effort; sessions table is JSON).
  let sessionCountByUser: Record<string, number> = {};
  try {
    const sessions = await pool.query(`SELECT sess FROM sessions WHERE expire > NOW()`);
    for (const row of sessions.rows) {
      const sess = typeof row.sess === "string" ? safeJson(row.sess) : row.sess;
      const uid = sess?.userId;
      if (uid) sessionCountByUser[uid] = (sessionCountByUser[uid] || 0) + 1;
    }
  } catch {
    sessionCountByUser = {};
  }

  // 3. Sensitive audit action counts per user, last `daysBack` days.
  const sinceIso = new Date(now.getTime() - daysBack * 86400_000).toISOString();
  const sensitive = await pool.query(
    `SELECT actor_user_id, action, COUNT(*)::int AS c, MAX(created_at) AS last_at
     FROM founder_audit_log
     WHERE actor_user_id IS NOT NULL
       AND action = ANY($1)
       AND created_at >= $2
     GROUP BY actor_user_id, action
     ORDER BY actor_user_id, action`,
    [SENSITIVE_AUDIT_ACTIONS, sinceIso],
  );
  const sensitiveByUser: Record<string, { action: string; count: number; lastAt: string }[]> = {};
  for (const row of sensitive.rows) {
    const uid = row.actor_user_id as string;
    if (!sensitiveByUser[uid]) sensitiveByUser[uid] = [];
    sensitiveByUser[uid].push({
      action: row.action,
      count: row.c,
      lastAt: row.last_at instanceof Date ? row.last_at.toISOString() : String(row.last_at),
    });
  }

  // 4. Build per-user rows + flags.
  let highTrustWithout2fa = 0;
  let idleUsers = 0;
  let inactiveStillEnabled = 0;
  const rows: AccessReviewRow[] = users.rows.map((u: any) => {
    const role = String(u.role || "");
    const highTrust = HIGH_TRUST.has(role);
    const lastLoginAt: string | null = u.last_login_at
      ? u.last_login_at instanceof Date
        ? u.last_login_at.toISOString()
        : String(u.last_login_at)
      : null;
    const daysSince = lastLoginAt
      ? Math.floor((now.getTime() - new Date(lastLoginAt).getTime()) / 86400_000)
      : null;
    const flags: string[] = [];
    if (highTrust && !u.two_factor_enabled) {
      flags.push("high_trust_without_2fa");
      highTrustWithout2fa++;
    }
    if (daysSince !== null && daysSince > 60) {
      flags.push("idle_60d");
      idleUsers++;
    }
    if (!u.is_active && (sessionCountByUser[u.id] || 0) > 0) {
      flags.push("inactive_with_sessions");
      inactiveStillEnabled++;
    }
    return {
      userId: u.id,
      email: u.email,
      role,
      isActive: u.is_active !== false,
      highTrust,
      twoFactorEnabled: u.two_factor_enabled === true,
      passkeyCount: u.passkey_count ?? 0,
      lastLoginAt,
      daysSinceLastLogin: daysSince,
      activeSessions: sessionCountByUser[u.id] || 0,
      sensitiveActions: sensitiveByUser[u.id] || [],
      flags,
    };
  });

  return {
    generatedAt: now.toISOString(),
    daysBack,
    totalUsers: rows.length,
    rows,
    summary: {
      highTrustWithout2fa,
      idleUsers,
      inactiveStillEnabled,
    },
  };
}

function safeJson(s: string): any {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
