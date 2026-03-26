/**
 * Commission Waterfall / Spread Override Calculation Engine
 *
 * Implements the waterfall override structure where each level in the
 * hierarchy earns ONLY the spread between their contract level and the
 * level directly below them. Overrides do NOT skip levels.
 *
 * Example: Owner (120%) -> A (90%) -> B (80%) on $10K premium:
 *   B earns: 80% x $10K = $8,000  (direct commission)
 *   A earns: (90% - 80%) x $10K = $1,000  (override — spread to next level down)
 *   Owner earns: (120% - 90%) x $10K = $3,000  (override — spread to next level down)
 *   Owner does NOT earn 40% (120-80) — only 30% (120-90)
 *
 * Domain: Ledger (Financial Systems Architect)
 * Non-negotiable: Commission math cannot be modified without Ledger + Sentinel + Gauge review.
 */

import { pool } from "../db";

// =============================================================================
// TYPES
// =============================================================================

export interface WaterfallOverride {
  agentUserId: string;
  agentName: string;
  hierarchyLevel: number;
  contractLevel: number;
  spreadPercentage: number;
  overrideAmount: number;
  overrideLevel: number; // 1 = direct upline, 2 = second level, etc.
}

export interface WaterfallResult {
  sellingAgentUserId: string;
  sellingAgentName: string;
  sellingAgentCommission: number;
  sellingAgentPercentage: number;
  overrides: WaterfallOverride[];
  totalOverrides: number;
  totalPayout: number;
  premiumAmount: number;
}

// =============================================================================
// MAIN CALCULATION
// =============================================================================

/**
 * Calculate waterfall/spread overrides for a policy sale.
 *
 * Walks the upline chain from the selling agent upward, computing the
 * spread-based override at each level. Each upline earns only the
 * difference between their own contract level and the contract level of
 * the person directly below them in the chain.
 *
 * @param sellingAgentUserId - The user ID of the agent who sold the policy
 * @param premiumAmount - The premium amount the override percentages apply to
 * @returns Complete waterfall breakdown including agent commission and all overrides
 */
export async function calculateWaterfallOverrides(
  sellingAgentUserId: string,
  premiumAmount: number,
): Promise<WaterfallResult> {
  // -------------------------------------------------------------------------
  // 1. Get selling agent's active hierarchy record
  // -------------------------------------------------------------------------
  const agentResult = await pool.query(
    `SELECT ah.*, u.first_name, u.last_name
     FROM agent_hierarchy ah
     JOIN users u ON ah.agent_user_id = u.id
     WHERE ah.agent_user_id = $1 AND ah.effective_to IS NULL`,
    [sellingAgentUserId],
  );

  // Edge case: no hierarchy record — return zeroed result
  if (agentResult.rows.length === 0) {
    return {
      sellingAgentUserId,
      sellingAgentName: "Unknown",
      sellingAgentCommission: 0,
      sellingAgentPercentage: 0,
      overrides: [],
      totalOverrides: 0,
      totalPayout: 0,
      premiumAmount,
    };
  }

  const agentRow = agentResult.rows[0];
  const agentContractLevel: number = agentRow.contract_level ?? 0;
  const agentName = `${agentRow.first_name} ${agentRow.last_name}`;
  const sellingAgentCommission = (agentContractLevel / 100) * premiumAmount;

  // -------------------------------------------------------------------------
  // 2. Parse upline chain (JSONB array of user IDs, direct upline first)
  // -------------------------------------------------------------------------
  const uplineChain: string[] = agentRow.upline_chain ?? [];

  if (uplineChain.length === 0) {
    return {
      sellingAgentUserId,
      sellingAgentName: agentName,
      sellingAgentCommission,
      sellingAgentPercentage: agentContractLevel,
      overrides: [],
      totalOverrides: 0,
      totalPayout: sellingAgentCommission,
      premiumAmount,
    };
  }

  // -------------------------------------------------------------------------
  // 3. Walk the upline chain and compute spread overrides
  // -------------------------------------------------------------------------
  const overrides: WaterfallOverride[] = [];
  let previousContractLevel = agentContractLevel; // starts at selling agent's level
  let overrideLevelCounter = 0;

  for (const uplineUserId of uplineChain) {
    overrideLevelCounter++;

    // Get this upline's active hierarchy record
    const uplineResult = await pool.query(
      `SELECT ah.*, u.first_name, u.last_name
       FROM agent_hierarchy ah
       JOIN users u ON ah.agent_user_id = u.id
       WHERE ah.agent_user_id = $1 AND ah.effective_to IS NULL`,
      [uplineUserId],
    );

    // Edge case: upline has no hierarchy record — skip, earn $0
    if (uplineResult.rows.length === 0) {
      continue;
    }

    const uplineRow = uplineResult.rows[0];
    const uplineContractLevel: number | null = uplineRow.contract_level;

    // Edge case: upline has NULL contract level — skip, earn $0
    if (uplineContractLevel == null) {
      continue;
    }

    // Spread = this upline's level minus the level of the person directly below
    const spreadPercentage = uplineContractLevel - previousContractLevel;

    // Edge case: negative or zero spread — $0 override (never negative)
    const effectiveSpread = spreadPercentage > 0 ? spreadPercentage : 0;
    const overrideAmount = (effectiveSpread / 100) * premiumAmount;

    overrides.push({
      agentUserId: uplineUserId,
      agentName: `${uplineRow.first_name} ${uplineRow.last_name}`,
      hierarchyLevel: uplineRow.hierarchy_level ?? 0,
      contractLevel: uplineContractLevel,
      spreadPercentage: effectiveSpread,
      overrideAmount,
      overrideLevel: overrideLevelCounter,
    });

    // CRITICAL: update previousContractLevel to THIS upline's level
    // so the next upline's spread is calculated against this one, not the selling agent.
    // This is the waterfall rule — each level only earns the spread to the next level down.
    previousContractLevel = uplineContractLevel;
  }

  // -------------------------------------------------------------------------
  // 4. Compute totals and return
  // -------------------------------------------------------------------------
  const totalOverrides = overrides.reduce(
    (sum, o) => sum + o.overrideAmount,
    0,
  );

  return {
    sellingAgentUserId,
    sellingAgentName: agentName,
    sellingAgentCommission,
    sellingAgentPercentage: agentContractLevel,
    overrides,
    totalOverrides,
    totalPayout: sellingAgentCommission + totalOverrides,
    premiumAmount,
  };
}
