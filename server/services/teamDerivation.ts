import { pool } from "../db";

export interface TeamRow {
  id: string;
  name: string;
  manager: { id: string; firstName: string; lastName: string; email: string };
  hierarchyTitle: string | null;
  contractLevel: number;
  agentCount: number;
}

export interface TeamAgentRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contractLevel: number;
  hierarchyLevel: number;
  hierarchyTitle: string | null;
  isActive: boolean;
}

/**
 * Returns managers at hierarchy_level IN (3, 4) plus the count of agents whose
 * upline_chain contains the manager id. Returns [] when agent_hierarchy is empty
 * or the table doesn't exist.
 */
export async function listTeams(): Promise<TeamRow[]> {
  try {
    const result = await pool.query(
      `WITH managers AS (
         SELECT ah.agent_user_id AS manager_id,
                u.first_name, u.last_name, u.email,
                ah.hierarchy_title,
                ah.contract_level
         FROM agent_hierarchy ah
         JOIN users u ON u.id = ah.agent_user_id
         WHERE ah.hierarchy_level IN (3, 4)
           AND (ah.effective_to IS NULL OR ah.effective_to > NOW())
       ),
       agents_per_manager AS (
         SELECT m.manager_id,
                COUNT(DISTINCT ah.agent_user_id)::int AS agent_count
         FROM managers m
         LEFT JOIN agent_hierarchy ah
           ON ah.upline_chain @> to_jsonb(ARRAY[m.manager_id::text])
         GROUP BY m.manager_id
       )
       SELECT m.manager_id, m.first_name, m.last_name, m.email,
              m.hierarchy_title, m.contract_level,
              COALESCE(apm.agent_count, 0) AS agent_count
       FROM managers m
       LEFT JOIN agents_per_manager apm USING (manager_id)
       ORDER BY m.last_name ASC NULLS LAST`,
    );

    return result.rows.map((r: any) => ({
      id: r.manager_id,
      name: `Team ${r.last_name || "Unknown"}`,
      manager: {
        id: r.manager_id,
        firstName: r.first_name || "",
        lastName: r.last_name || "",
        email: r.email || "",
      },
      hierarchyTitle: r.hierarchy_title || null,
      contractLevel: Number(r.contract_level) || 0,
      agentCount: Number(r.agent_count) || 0,
    }));
  } catch (e: any) {
    console.error("[teamDerivation] listTeams error:", e?.message);
    return [];
  }
}

/**
 * Returns all users whose agent_hierarchy.upline_chain contains the given
 * manager user id. Returns [] on error.
 */
export async function listTeamAgents(managerUserId: string): Promise<TeamAgentRow[]> {
  try {
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.is_active,
              ah.contract_level, ah.hierarchy_level, ah.hierarchy_title
       FROM agent_hierarchy ah
       JOIN users u ON u.id = ah.agent_user_id
       WHERE ah.upline_chain @> to_jsonb(ARRAY[$1::text])
         AND (ah.effective_to IS NULL OR ah.effective_to > NOW())
       ORDER BY ah.hierarchy_level ASC, u.last_name ASC NULLS LAST`,
      [managerUserId],
    );

    return result.rows.map((r: any) => ({
      id: r.id,
      firstName: r.first_name || "",
      lastName: r.last_name || "",
      email: r.email || "",
      contractLevel: Number(r.contract_level) || 0,
      hierarchyLevel: Number(r.hierarchy_level) || 0,
      hierarchyTitle: r.hierarchy_title || null,
      isActive: r.is_active !== false,
    }));
  } catch (e: any) {
    console.error("[teamDerivation] listTeamAgents error:", e?.message);
    return [];
  }
}

/**
 * Returns all manager IDs (as strings) that are reachable parents in the agent
 * hierarchy — used to verify an agent assignment is in some manager's downline.
 */
export async function getAllManagerIds(): Promise<string[]> {
  try {
    const result = await pool.query(
      `SELECT DISTINCT agent_user_id::text AS id
       FROM agent_hierarchy
       WHERE hierarchy_level IN (3, 4)
         AND (effective_to IS NULL OR effective_to > NOW())`,
    );
    return result.rows.map((r: any) => r.id);
  } catch {
    return [];
  }
}
