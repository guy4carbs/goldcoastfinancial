/**
 * Commission Record Service
 * Calculates waterfall overrides and persists commission records to the database.
 * Called when a policy is created, a deal is submitted, or premium is updated.
 *
 * Domain: Ledger (Financial Systems Architect)
 */

import { pool } from "../db";
import { calculateWaterfallOverrides, WaterfallResult } from "./commissionWaterfallService";

interface RecordOptions {
  policyId?: string;
  dealId?: string;
  agentId: string;
  annualPremium: number;
}

/**
 * Calculate and persist commission records for a policy or deal.
 * Deletes any existing records for this policy/deal first (idempotent).
 */
export async function recordCommissions(
  policyOrDealId: string,
  agentId: string,
  annualPremium: number,
  source: "policy" | "deal" = "policy",
): Promise<WaterfallResult | null> {
  if (!policyOrDealId || !agentId || annualPremium <= 0) {
    console.log("[CommissionRecord] Skipped — missing data or zero premium");
    return null;
  }

  // P0 (audit 2026-05-12): SOX 404 / SOC 2 — every commission row mutation
  // must be auditable. Previously DELETE ran outside a transaction with no
  // audit log entry; a rogue actor could silently erase commission rows
  // pre-recalculation. Now we:
  //   1. wrap the entire recalc (DELETE+INSERT) in a single transaction
  //   2. snapshot the rows being deleted into audit_logs (status=success)
  //   3. roll back on any failure so commission table never sees partial state
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await calculateWaterfallOverrides(agentId, annualPremium);

    const now = new Date();
    const periodMonth = now.getMonth() + 1;
    const periodYear = now.getFullYear();

    const isPolicySource = source === "policy";
    const idColumn = isPolicySource ? "policy_id" : "deal_id";

    // Snapshot the rows about to be deleted so the audit log can replay them.
    const priorRows = await client.query(
      `SELECT * FROM commission_records WHERE ${idColumn} = $1`,
      [policyOrDealId],
    );

    if (priorRows.rowCount && priorRows.rowCount > 0) {
      await client.query(
        `INSERT INTO audit_logs (user_id, action, resource, resource_id, status, metadata)
         VALUES ($1, 'commission_delete', 'commission_records', $2, 'success', $3::jsonb)`,
        [
          agentId,
          policyOrDealId,
          JSON.stringify({
            source,
            deleted_count: priorRows.rowCount,
            reason: "idempotent_recalc",
            prior_rows: priorRows.rows,
          }),
        ],
      );
    }

    // Delete existing records for this policy/deal (idempotent recalculation)
    await client.query(`DELETE FROM commission_records WHERE ${idColumn} = $1`, [policyOrDealId]);

    // Insert selling agent's personal commission
    if (result.sellingAgentCommission > 0) {
      await client.query(
        `INSERT INTO commission_records
          (policy_id, deal_id, agent_id, upline_agent_id, commission_type, premium_amount, contract_level, override_spread, commission_amount, period_month, period_year)
         VALUES ($1, $2, $3, NULL, 'personal', $4, $5, 0, $6, $7, $8)`,
        [
          isPolicySource ? policyOrDealId : null,
          isPolicySource ? null : policyOrDealId,
          agentId,
          annualPremium,
          result.sellingAgentPercentage,
          result.sellingAgentCommission,
          periodMonth,
          periodYear,
        ],
      );
    }

    // Insert override commissions for each upline
    for (const override of result.overrides) {
      if (override.overrideAmount > 0) {
        await client.query(
          `INSERT INTO commission_records
            (policy_id, deal_id, agent_id, upline_agent_id, commission_type, premium_amount, contract_level, override_spread, commission_amount, period_month, period_year)
           VALUES ($1, $2, $3, $4, 'override', $5, $6, $7, $8, $9, $10)`,
          [
            isPolicySource ? policyOrDealId : null,
            isPolicySource ? null : policyOrDealId,
            override.agentUserId,
            agentId,
            annualPremium,
            override.contractLevel,
            override.spreadPercentage,
            override.overrideAmount,
            periodMonth,
            periodYear,
          ],
        );
      }
    }

    await client.query("COMMIT");

    console.log(
      `[CommissionRecord] ${source} ${policyOrDealId}: agent ${result.sellingAgentPercentage}% = $${result.sellingAgentCommission.toFixed(2)}, ` +
      `${result.overrides.length} overrides = $${result.totalOverrides.toFixed(2)}, ` +
      `total payout = $${result.totalPayout.toFixed(2)}`
    );

    return result;
  } catch (error: any) {
    try { await client.query("ROLLBACK"); } catch { /* noop */ }
    console.error("[CommissionRecord] Error:", error?.message);
    return null;
  } finally {
    client.release();
  }
}
