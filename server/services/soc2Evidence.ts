import { pool } from "../db";
import crypto from "node:crypto";
import { isKmsEnabled } from "./encryptionService";
import { verifyAuditChain } from "./auditChainVerifier";

/**
 * SOC 2 evidence bundle — produces a JSON snapshot of the controls'
 * current state, suitable for an auditor (or Drata/Vanta) to consume.
 *
 * Design notes:
 *   - Read-only. Hits Postgres + a few in-process flags.
 *   - Every count / list is for the WHOLE database — not user-scoped.
 *   - No raw NPI is ever included. Counts, ids, and hashes only.
 *   - The bundle is deterministic for a given DB state, so re-running it
 *     produces the same output (modulo time fields). That makes it easy
 *     to diff snapshots over time.
 *
 * Tying to control-map.md:
 *   - users / 2FA → CC6.1
 *   - login_attempts → CC6.3
 *   - rls policies → CC6.2 / CC6.4
 *   - audit chain → CC6.8 / PI1.4
 *   - encryption settings → C1.2
 *   - webauthn credentials → CC6.1
 */

export interface EvidenceBundle {
  generatedAt: string;
  schemaDigest: string;
  authentication: {
    totalUsers: number;
    activeUsers: number;
    highTrustRoles: { role: string; count: number; with2fa: number; withPasskey: number }[];
    twoFactorEnabledTotal: number;
    webauthnCredentialsTotal: number;
    failedLoginsLast24h: number;
    accountLockoutsCurrent: number;
  };
  authorization: {
    rlsPolicies: { tablename: string; policyname: string }[];
    roles: string[];
  };
  encryption: {
    kmsConfigured: boolean;
    fieldEncryptionKeyConfigured: boolean;
    plaidItemsTotal: number;
    plaidItemsV2: number;
    plaidItemsV1: number;
  };
  audit: {
    chainOk: boolean;
    chainCount: number;
    chainHead: string | null;
    chainDivergence: { rowId: string; createdAt: string } | null;
    triggersPresent: { triggername: string }[];
  };
  recovery: {
    sessionStoreRows: number;
  };
}

export async function buildEvidenceBundle(): Promise<EvidenceBundle> {
  const now = new Date().toISOString();

  // Schema digest — sorted column list across the whole public schema, hashed.
  // Lets the auditor detect schema drift between snapshots.
  const schema = await pool.query(
    `SELECT table_name, column_name, data_type, is_nullable
     FROM information_schema.columns
     WHERE table_schema = 'public'
     ORDER BY table_name, ordinal_position`,
  );
  const schemaDigest = crypto
    .createHash("sha256")
    .update(schema.rows.map((r: any) => `${r.table_name}.${r.column_name}:${r.data_type}:${r.is_nullable}`).join("\n"))
    .digest("hex");

  // ── Authentication
  const userTotals = await pool.query(
    `SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE is_active = true)::int AS active FROM users`,
  );
  const totalUsers = userTotals.rows[0]?.total ?? 0;
  const activeUsers = userTotals.rows[0]?.active ?? 0;

  const twoFactorTotal = await pool.query(
    `SELECT COUNT(*)::int AS c FROM users WHERE two_factor_enabled = true`,
  );
  const twoFactorEnabledTotal = twoFactorTotal.rows[0]?.c ?? 0;

  const webauthnTotal = await pool.query(`SELECT COUNT(*)::int AS c FROM webauthn_credentials`);
  const webauthnCredentialsTotal = webauthnTotal.rows[0]?.c ?? 0;

  const HIGH_TRUST = ["founder", "owner", "system_admin"];
  const highTrustBreakdown = await pool.query(
    `SELECT u.role,
            COUNT(*)::int AS count,
            COUNT(*) FILTER (WHERE u.two_factor_enabled = true)::int AS with2fa,
            COUNT(DISTINCT wc.user_id)::int AS withPasskey
     FROM users u
     LEFT JOIN webauthn_credentials wc ON wc.user_id = u.id
     WHERE u.role = ANY($1)
     GROUP BY u.role
     ORDER BY u.role`,
    [HIGH_TRUST],
  );

  const failedLogins24h = await pool.query(
    `SELECT COUNT(*)::int AS c FROM login_attempts
     WHERE success = false AND created_at > NOW() - INTERVAL '24 hours'`,
  );
  const lockouts = await pool.query(
    `SELECT COUNT(*)::int AS c FROM (
        SELECT email FROM login_attempts
        WHERE success = false AND created_at > NOW() - INTERVAL '30 minutes'
        GROUP BY email HAVING COUNT(*) >= 10
     ) sub`,
  );

  // ── Authorization
  const policies = await pool.query(
    `SELECT tablename, policyname FROM pg_policies
     WHERE schemaname = 'public'
     ORDER BY tablename, policyname`,
  );
  const rolesQ = await pool.query(`SELECT DISTINCT role FROM users WHERE role IS NOT NULL ORDER BY role`);
  const roles = rolesQ.rows.map((r: any) => r.role);

  // ── Encryption
  const plaidStats = await pool.query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE access_token_encrypted LIKE 'v2:%')::int AS v2,
       COUNT(*) FILTER (WHERE access_token_encrypted NOT LIKE 'v2:%')::int AS v1
     FROM plaid_items WHERE deleted_at IS NULL`,
  );

  // ── Audit
  let chainResult;
  try {
    chainResult = await verifyAuditChain();
  } catch (e: any) {
    chainResult = { ok: false as const, count: 0, divergence: { rowId: "verifier_threw", expected: "", actual: String(e?.message), createdAt: now } };
  }
  const triggers = await pool.query(
    `SELECT tgname AS triggername FROM pg_trigger
     WHERE tgrelid = 'founder_audit_log'::regclass AND NOT tgisinternal
     ORDER BY tgname`,
  );

  // ── Recovery — sessions table is a quick proxy for "live users"
  let sessionStoreRows = 0;
  try {
    const s = await pool.query(`SELECT COUNT(*)::int AS c FROM sessions`);
    sessionStoreRows = s.rows[0]?.c ?? 0;
  } catch {
    sessionStoreRows = 0;
  }

  return {
    generatedAt: now,
    schemaDigest,
    authentication: {
      totalUsers,
      activeUsers,
      highTrustRoles: highTrustBreakdown.rows.map((r: any) => ({
        role: r.role,
        count: r.count,
        with2fa: r.with2fa,
        withPasskey: r.withpasskey ?? r.withPasskey ?? 0,
      })),
      twoFactorEnabledTotal,
      webauthnCredentialsTotal,
      failedLoginsLast24h: failedLogins24h.rows[0]?.c ?? 0,
      accountLockoutsCurrent: lockouts.rows[0]?.c ?? 0,
    },
    authorization: {
      rlsPolicies: policies.rows.map((r: any) => ({ tablename: r.tablename, policyname: r.policyname })),
      roles,
    },
    encryption: {
      kmsConfigured: isKmsEnabled(),
      fieldEncryptionKeyConfigured: Boolean(process.env.FIELD_ENCRYPTION_KEY),
      plaidItemsTotal: plaidStats.rows[0]?.total ?? 0,
      plaidItemsV2: plaidStats.rows[0]?.v2 ?? 0,
      plaidItemsV1: plaidStats.rows[0]?.v1 ?? 0,
    },
    audit: {
      chainOk: chainResult.ok,
      chainCount: chainResult.count,
      chainHead: chainResult.latestHash || null,
      chainDivergence: chainResult.ok
        ? null
        : chainResult.divergence
          ? { rowId: chainResult.divergence.rowId, createdAt: chainResult.divergence.createdAt }
          : null,
      triggersPresent: triggers.rows.map((r: any) => ({ triggername: r.triggername })),
    },
    recovery: {
      sessionStoreRows,
    },
  };
}
