import { pool } from "../db";

/**
 * The pre-seeded root agency (Gold Coast Financial Partners LLC). Inserted by
 * migration 0011_agency_management.sql backfill. Acts as the universal fallback
 * when an agent's hierarchy doesn't resolve to any explicit agency_teams row.
 */
export const ROOT_AGENCY_ID = "00000000-0000-4000-8000-000000000001";

export interface ResolvedAgency {
  agencyId: string;
  agencyName: string;
}

/**
 * Maps an agent → their agency by walking the upline chain.
 *
 * Algorithm:
 *  1. Read the agent's `agent_hierarchy.upline_chain` (JSONB array of ancestor
 *     user_ids ordered nearest-upline → furthest).
 *  2. Build a candidate list of [agentUserId, ...uplineChain].
 *  3. Run a single SQL hit against `agency_teams` joined to `agencies`,
 *     fetching every (manager_user_id, agency_id, name) row that matches any
 *     candidate.
 *  4. Return the FIRST candidate (in walk order) that has an agency_teams row.
 *  5. If no candidate matches, fall back to the pre-seeded root agency.
 *
 * Returns null only when the root agency itself can't be loaded (DB error or
 * the migration hasn't been applied yet).
 */
export async function resolveAgentAgency(
  agentUserId: string,
): Promise<ResolvedAgency | null> {
  try {
    // Step 1: read the agent's active hierarchy row + upline chain.
    const hierRes = await pool.query(
      `SELECT upline_chain
         FROM agent_hierarchy
        WHERE agent_user_id::text = $1
          AND (effective_to IS NULL OR effective_to > NOW())
        ORDER BY effective_from DESC
        LIMIT 1`,
      [agentUserId],
    );

    let uplineChain: string[] = [];
    if (hierRes.rows.length > 0) {
      const raw = hierRes.rows[0].upline_chain;
      if (Array.isArray(raw)) {
        uplineChain = raw.map((v) => String(v));
      } else if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) uplineChain = parsed.map((v) => String(v));
        } catch {
          /* ignore malformed JSON */
        }
      }
    }

    // Walk order: self first, then nearest-upline → furthest.
    const candidates = [agentUserId, ...uplineChain];

    // Step 2: single DB hit — fetch every agency_teams row that matches any
    // candidate. JOIN agencies for the name.
    const teamRes = await pool.query(
      `SELECT at.manager_user_id::text AS manager_id,
              at.agency_id::text AS agency_id,
              a.name AS agency_name,
              a.status AS agency_status
         FROM agency_teams at
         JOIN agencies a ON a.id = at.agency_id
        WHERE at.manager_user_id::text = ANY($1::text[])`,
      [candidates],
    );

    // Step 3: index by manager_id so we can pick the first walk-order match.
    const byManager: Record<string, { agencyId: string; agencyName: string; status: string }> = {};
    for (const r of teamRes.rows) {
      byManager[r.manager_id] = {
        agencyId: r.agency_id,
        agencyName: r.agency_name,
        status: r.agency_status,
      };
    }

    for (const c of candidates) {
      const hit = byManager[c];
      // Skip suspended/terminated agencies — treat as "no match" so the agent
      // falls back to root rather than being trapped under a dead agency.
      if (hit && hit.status === "active") {
        return { agencyId: hit.agencyId, agencyName: hit.agencyName };
      }
    }

    // Step 4: fall back to the pre-seeded root agency.
    const rootRes = await pool.query(
      `SELECT id::text AS id, name FROM agencies WHERE id = $1::uuid LIMIT 1`,
      [ROOT_AGENCY_ID],
    );
    if (rootRes.rows.length === 0) return null;
    return {
      agencyId: rootRes.rows[0].id,
      agencyName: rootRes.rows[0].name,
    };
  } catch (e: any) {
    console.error("[agencyResolver] resolveAgentAgency error:", e?.message);
    return null;
  }
}
