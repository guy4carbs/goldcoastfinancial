import { pool } from "../db";

export interface WaterfallLevel {
  agentUserId: string; name: string; hierarchyLevel: number; hierarchyTitle: string;
  contractLevel: number; spread: number; overrideEarning: number; isPersonal: boolean;
}

export interface WaterfallResult { levels: WaterfallLevel[]; totalPayout: number; premiumAmount: number; }

/**
 * Waterfall/Spread Override Calculation
 * Each level earns ONLY the spread between their contract level and the level directly below.
 * Overrides do NOT skip levels.
 * Example: Owner(120%) → Director(100%) → Manager(90%) → Agent(80%) on $10K:
 *   Agent earns 80% ($8K), Manager earns 10% spread ($1K), Director earns 10% ($1K), Owner earns 20% ($2K)
 */
export async function calculateWaterfallOverrides(agentUserId: string, premiumAmount: number): Promise<WaterfallResult> {
  const levels: WaterfallLevel[] = [];

  // Get the agent's hierarchy position
  const agentResult = await pool.query(
    `SELECT ah.*, u.first_name, u.last_name FROM agent_hierarchy ah
     JOIN users u ON u.id = ah.agent_user_id
     WHERE ah.agent_user_id = $1 AND (ah.effective_to IS NULL OR ah.effective_to > NOW())
     LIMIT 1`,
    [agentUserId]
  );

  if (agentResult.rows.length === 0) {
    return { levels: [], totalPayout: 0, premiumAmount };
  }

  const agent = agentResult.rows[0];
  const agentContractLevel = parseFloat(agent.contract_level || "80");

  // Personal commission for the selling agent
  const personalEarning = (agentContractLevel / 100) * premiumAmount;
  levels.push({
    agentUserId: agent.agent_user_id,
    name: `${agent.first_name} ${agent.last_name}`,
    hierarchyLevel: agent.hierarchy_level,
    hierarchyTitle: agent.hierarchy_title || "Agent",
    contractLevel: agentContractLevel,
    spread: 0,
    overrideEarning: personalEarning,
    isPersonal: true,
  });

  // Walk upline chain for override spreads
  let currentAgentId = agent.direct_upline_id;
  let belowContractLevel = agentContractLevel;

  while (currentAgentId) {
    const uplineResult = await pool.query(
      `SELECT ah.*, u.first_name, u.last_name FROM agent_hierarchy ah
       JOIN users u ON u.id = ah.agent_user_id
       WHERE ah.agent_user_id = $1 AND (ah.effective_to IS NULL OR ah.effective_to > NOW())
       LIMIT 1`,
      [currentAgentId]
    );

    if (uplineResult.rows.length === 0) break;

    const upline = uplineResult.rows[0];
    const uplineContractLevel = parseFloat(upline.contract_level || "80");
    const spread = Math.max(0, uplineContractLevel - belowContractLevel);
    const overrideEarning = (spread / 100) * premiumAmount;

    levels.push({
      agentUserId: upline.agent_user_id,
      name: `${upline.first_name} ${upline.last_name}`,
      hierarchyLevel: upline.hierarchy_level,
      hierarchyTitle: upline.hierarchy_title || "Unknown",
      contractLevel: uplineContractLevel,
      spread,
      overrideEarning,
      isPersonal: false,
    });

    belowContractLevel = uplineContractLevel;
    currentAgentId = upline.direct_upline_id;
  }

  const totalPayout = levels.reduce((sum, l) => sum + l.overrideEarning, 0);
  return { levels, totalPayout, premiumAmount };
}
