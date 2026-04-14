import { pool } from "../db";
import { calculateWaterfallOverrides } from "./commissionWaterfallService";

export async function recordCommissions(dealId: string, agentUserId: string, annualPremium: number, source: string = "deal") {
  const result = await calculateWaterfallOverrides(agentUserId, annualPremium);

  // Delete any existing records for this deal (idempotent)
  await pool.query("DELETE FROM commissions WHERE deal_id = $1", [dealId]);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  for (const level of result.levels) {
    await pool.query(
      `INSERT INTO commissions (id, agent_user_id, deal_id, commission_type, amount, percentage, premium_amount, policy_year, status, upline_agent_id, override_level, period_year, period_month, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 1, 'pending', $7, $8, $9, $10, NOW())`,
      [
        level.agentUserId, dealId,
        level.isPersonal ? "personal" : "override",
        level.overrideEarning, level.isPersonal ? level.contractLevel : level.spread,
        annualPremium, level.isPersonal ? null : level.agentUserId,
        level.hierarchyLevel, year, month,
      ]
    );
  }

  return result;
}
