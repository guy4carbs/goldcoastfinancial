import { Router, type Request } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS } from "../middleware/auth";
import { logFounderAction } from "../services/founderAudit";
import {
  emitHierarchyChanged,
  emitRoleChanged,
  onHierarchyChanged,
} from "../services/foundersEventBus";
import { titleToRole, ROLE_PRIVILEGE_RANK } from "../services/hierarchyRoleMap";
import { reinitializeLoungeAccess } from "../services/loungeAccessSync";
import { resolveAgentAgency } from "../services/agencyResolver";

const router = Router();
import { HIERARCHY_LEVELS, HIERARCHY_TITLES } from "../../shared/models/enterprise";

// ─── Tenancy scope helpers (mirror Dashboard + Revenue) ─────────────────────
//
// The hierarchy was previously system-wide for all MANAGER_PLUS roles. Wave H1
// (2026-05) closes the cross-tenant leak: founders see only agents inside
// their resolved agency. OWNER + SYSTEM_ADMIN keep system-wide oversight.

type ViewerScope =
  | { systemWide: true }
  | { agencyId: string }
  | { forbidden: true };

async function viewerAgencyScope(req: Request): Promise<ViewerScope> {
  const role = req.user?.role;
  if (role === "owner" || role === "system_admin") return { systemWide: true };
  const userId = req.user?.id;
  if (!userId) return { forbidden: true };
  const resolved = await resolveAgentAgency(userId);
  if (!resolved?.agencyId) return { forbidden: true };
  return { agencyId: resolved.agencyId };
}
function scopeId(scope: ViewerScope): string | null {
  if ("forbidden" in scope) return null;
  if ("systemWide" in scope) return null;
  return scope.agencyId;
}

// Returns the set of agent_user_ids within the viewer's agency, or null for
// system-wide (owner/system_admin). Used to filter /tree, /flat, /uplines.
async function scopedAgentIds(agencyId: string | null): Promise<string[] | null> {
  if (!agencyId) return null;
  const r = await pool.query(
    `SELECT DISTINCT u.id::text AS id
       FROM users u
       LEFT JOIN agent_hierarchy ah ON ah.agent_user_id = u.id
                                    AND (ah.effective_to IS NULL OR ah.effective_to > NOW())
      WHERE u.is_active = true
        AND (
          EXISTS (SELECT 1 FROM agency_teams at WHERE at.manager_user_id = u.id AND at.agency_id = $1::uuid)
          OR EXISTS (
            SELECT 1 FROM agency_teams at
             WHERE at.agency_id = $1::uuid
               AND at.manager_user_id::text = ANY(
                 ARRAY(SELECT jsonb_array_elements_text(COALESCE(ah.upline_chain, '[]'::jsonb)))
               )
          )
        )`,
    [agencyId],
  );
  return r.rows.map((row: any) => row.id);
}

// Allowed hierarchy titles for the PATCH endpoint (Phase C admin mutations).
// Source-of-truth title vocabulary lives in shared/models/enterprise.ts
// (HIERARCHY_LEVELS). Building the allow-list dynamically keeps this endpoint
// in sync if levels are ever added/renamed there.
const ALLOWED_HIERARCHY_TITLES = new Set<string>(Object.values(HIERARCHY_LEVELS));
// For business-entity agents, the hierarchy should display the company name
// (the agency / DBA brand) rather than the personal name of the principal.
// Individual agents fall through to first+last. Mirrored in /tree and /flat.
const HIERARCHY_NAME_SELECT = `
  ah.*,
  u.first_name, u.last_name,
  ap.dba_type, ap.company_name, ap.dba_name,
  CASE
    WHEN ap.dba_type = 'business_entity' AND COALESCE(ap.company_name, ap.dba_name, '') <> ''
      THEN COALESCE(ap.company_name, ap.dba_name)
    ELSE TRIM(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, ''))
  END AS display_name
`;

router.get("/tree", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);
    const agentIds = await scopedAgentIds(agencyId);

    // Wave AB: dedupe duplicate active hierarchy rows per agent. If the same
    // agent has multiple agent_hierarchy rows with overlapping effective_from
    // windows, the tree renders one node per row — leading to duplicate
    // "Gold Coast Financial Partners LLC" nodes at the top. DISTINCT ON
    // (agent_user_id) ordered by latest effective_from picks the canonical
    // active row.
    const result = await pool.query(
      agentIds
        ? `SELECT * FROM (
             SELECT DISTINCT ON (ah.agent_user_id) ${HIERARCHY_NAME_SELECT}
               FROM agent_hierarchy ah
               JOIN users u ON u.id = ah.agent_user_id
               LEFT JOIN agent_profiles ap ON ap.user_id::text = ah.agent_user_id::text
              WHERE (ah.effective_to IS NULL OR ah.effective_to > NOW())
                AND ah.agent_user_id::text = ANY($1::text[])
              ORDER BY ah.agent_user_id, ah.effective_from DESC NULLS LAST
           ) dedup
           ORDER BY hierarchy_level ASC`
        : `SELECT * FROM (
             SELECT DISTINCT ON (ah.agent_user_id) ${HIERARCHY_NAME_SELECT}
               FROM agent_hierarchy ah
               JOIN users u ON u.id = ah.agent_user_id
               LEFT JOIN agent_profiles ap ON ap.user_id::text = ah.agent_user_id::text
              WHERE ah.effective_to IS NULL OR ah.effective_to > NOW()
              ORDER BY ah.agent_user_id, ah.effective_from DESC NULLS LAST
           ) dedup
           ORDER BY hierarchy_level ASC`,
      agentIds ? [agentIds] : [],
    );
    res.json(result.rows);
  } catch (e: any) {
    console.error("[hcms-hierarchy /tree] DB error:", e?.message, e?.stack);
    res.status(500).json({ error: "Hierarchy tree query failed" });
  }
});

router.get("/flat", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);
    const agentIds = await scopedAgentIds(agencyId);
    const { search, level } = req.query;

    let sql = `SELECT ${HIERARCHY_NAME_SELECT}, u.email
                 FROM agent_hierarchy ah
                 JOIN users u ON u.id = ah.agent_user_id
                 LEFT JOIN agent_profiles ap ON ap.user_id::text = ah.agent_user_id::text
                WHERE (ah.effective_to IS NULL OR ah.effective_to > NOW())`;
    const p: any[] = [];
    if (agentIds) { p.push(agentIds); sql += ` AND ah.agent_user_id::text = ANY($${p.length}::text[])`; }
    if (search) { p.push(`%${search}%`); sql += ` AND (u.first_name ILIKE $${p.length} OR u.last_name ILIKE $${p.length} OR ap.company_name ILIKE $${p.length} OR ap.dba_name ILIKE $${p.length})`; }
    if (level) { p.push(parseInt(level as string)); sql += ` AND ah.hierarchy_level = $${p.length}`; }
    sql += ` ORDER BY ah.hierarchy_level ASC`;
    res.json((await pool.query(sql, p)).rows);
  } catch (e: any) {
    console.error("[hcms-hierarchy /flat] DB error:", e?.message);
    res.status(500).json({ error: "Hierarchy flat query failed" });
  }
});

router.get("/levels", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  res.json({ levels: HIERARCHY_LEVELS, titles: HIERARCHY_TITLES });
});

router.get("/uplines", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);
    const agentIds = await scopedAgentIds(agencyId);

    // Wave AC patch: include 'founder' in the eligible role list. Without it,
    // a fresh founder (guy4carbs) doesn't show up as a selectable upline even
    // though they're the canonical top of the hierarchy. Bypass clause also
    // extended to founder so they appear even before agent_hierarchy is seeded.
    const result = await pool.query(
      agentIds
        ? `SELECT u.id, u.first_name, u.last_name, u.email, u.role,
                  COALESCE(ah.contract_level, CASE WHEN u.role IN ('founder', 'owner') THEN 120 ELSE 80 END) as contract_level,
                  ah.hierarchy_level, ah.hierarchy_title
             FROM users u
             LEFT JOIN agent_hierarchy ah ON u.id = ah.agent_user_id AND (ah.effective_to IS NULL OR ah.effective_to > NOW())
            WHERE u.role IN ('founder', 'owner', 'system_admin', 'director', 'agency_manager', 'manager', 'sales_agent')
              AND u.is_active = true
              AND (ah.id IS NOT NULL OR u.role IN ('founder', 'owner'))
              AND u.id::text = ANY($1::text[])
            ORDER BY contract_level DESC, u.last_name ASC`
        : `SELECT u.id, u.first_name, u.last_name, u.email, u.role,
                  COALESCE(ah.contract_level, CASE WHEN u.role IN ('founder', 'owner') THEN 120 ELSE 80 END) as contract_level,
                  ah.hierarchy_level, ah.hierarchy_title
             FROM users u
             LEFT JOIN agent_hierarchy ah ON u.id = ah.agent_user_id AND (ah.effective_to IS NULL OR ah.effective_to > NOW())
            WHERE u.role IN ('founder', 'owner', 'system_admin', 'director', 'agency_manager', 'manager', 'sales_agent')
              AND u.is_active = true
              AND (ah.id IS NOT NULL OR u.role IN ('founder', 'owner'))
            ORDER BY contract_level DESC, u.last_name ASC`,
      agentIds ? [agentIds] : [],
    );
    res.json(result.rows.map((r: any) => {
      // Display founder + owner as the Gold Coast brand entity rather than
      // their personal name (Gaetano gets shown as "Gold Coast Financial
      // Partners LLC" in upline pickers, matching the hierarchy graph).
      const isBrandTier = r.role === "owner" || r.role === "founder";
      const firstName = isBrandTier ? "Gold Coast Financial Partners LLC" : r.first_name;
      const lastName = isBrandTier ? "" : r.last_name;
      return {
        id: r.id,
        firstName,
        lastName,
        displayName: isBrandTier ? firstName : `${firstName} ${lastName}`.trim(),
        email: r.email,
        role: r.role,
        contractLevel: parseFloat(r.contract_level),
        hierarchyLevel: r.hierarchy_level,
        title: r.hierarchy_title,
      };
    }));
  } catch (e: any) {
    console.error("[hcms-hierarchy /uplines] DB error:", e?.message);
    res.status(500).json({ error: "Uplines query failed" });
  }
});

// GET /aip-rollup — per-agent YTD AP including the entire downline subtree.
// Mirror dashboard convention: status NOT IN ('rejected','reversed','cancelled'),
// honor system, agency-scoped.
router.get("/aip-rollup", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);
    const agentIds = await scopedAgentIds(agencyId);

    // Personal AP for every agent in the scope (or system-wide).
    const personalRes = await pool.query(
      agentIds
        ? `SELECT agent_user_id::text AS id,
                  COALESCE(SUM(annual_premium::numeric), 0)::numeric(14,2) AS ap
             FROM deals
            WHERE status NOT IN ('rejected', 'reversed', 'cancelled')
              AND created_at >= date_trunc('year', CURRENT_DATE)
              AND agent_user_id::text = ANY($1::text[])
            GROUP BY agent_user_id`
        : `SELECT agent_user_id::text AS id,
                  COALESCE(SUM(annual_premium::numeric), 0)::numeric(14,2) AS ap
             FROM deals
            WHERE status NOT IN ('rejected', 'reversed', 'cancelled')
              AND created_at >= date_trunc('year', CURRENT_DATE)
            GROUP BY agent_user_id`,
      agentIds ? [agentIds] : [],
    );
    const personal = new Map<string, number>();
    for (const r of personalRes.rows) personal.set(String(r.id), parseFloat(r.ap || "0"));

    // For rollup: read agent_hierarchy upline_chain so we can attribute each
    // agent's personal AP to all of their uplines (cumulative team AP).
    const hierRes = await pool.query(
      agentIds
        ? `SELECT agent_user_id::text AS id, upline_chain
             FROM agent_hierarchy
            WHERE (effective_to IS NULL OR effective_to > NOW())
              AND agent_user_id::text = ANY($1::text[])`
        : `SELECT agent_user_id::text AS id, upline_chain
             FROM agent_hierarchy
            WHERE (effective_to IS NULL OR effective_to > NOW())`,
      agentIds ? [agentIds] : [],
    );

    // rollup[X] = X's own personal + sum of every downline whose chain
    // contains X. Walk: for each agent, attribute their personal AP to
    // themselves AND every upline_chain entry.
    const rollup = new Map<string, number>();
    for (const row of hierRes.rows) {
      const id = String(row.id);
      const personalAP = personal.get(id) || 0;
      // Self
      rollup.set(id, (rollup.get(id) || 0) + personalAP);
      // Every upline in the chain
      const chain: string[] = Array.isArray(row.upline_chain)
        ? row.upline_chain.map((v: any) => String(v))
        : [];
      for (const uplineId of chain) {
        rollup.set(uplineId, (rollup.get(uplineId) || 0) + personalAP);
      }
    }

    res.json(
      Array.from(rollup.entries()).map(([agentUserId, totalAip]) => ({
        agentUserId,
        totalAip: Math.round(totalAip),
        personalAip: Math.round(personal.get(agentUserId) || 0),
      })),
    );
  } catch (e: any) {
    console.error("[hcms-hierarchy /aip-rollup] DB error:", e?.message);
    res.status(500).json({ error: "AIP rollup query failed" });
  }
});
router.get("/stats", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  try {
    const result = await pool.query(`SELECT hierarchy_level, COUNT(*)::int as count, AVG(contract_level::numeric)::numeric(5,2) as avg_contract FROM agent_hierarchy WHERE effective_to IS NULL OR effective_to > NOW() GROUP BY hierarchy_level ORDER BY hierarchy_level`);
    res.json(result.rows);
  } catch (e: any) { res.status(500).json({ error: "Something went wrong" }); }
});

/**
 * PATCH /api/hcms/hierarchy/agents/:agentId
 *
 * Phase C admin mutation: change direct upline, hierarchy title, and/or
 * contract level for an agent. Uses the forward-only pattern — soft-end the
 * current active row by setting effective_to=NOW() and insert a fresh row
 * with the merged values. Historical commission math is preserved because
 * `calculateWaterfallOverrides` filters by `effective_to IS NULL OR
 * effective_to > NOW()`.
 *
 * Body (at least one field required):
 *   { directUplineId?: string|null, hierarchyTitle?: string, contractLevel?: number }
 *
 * Response: { ok: true, newHierarchyId: string, effectiveFrom: string }
 */
router.patch("/agents/:agentId", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  const { agentId } = req.params;
  const { directUplineId, hierarchyTitle, contractLevel } = (req.body ?? {}) as {
    directUplineId?: string | null;
    hierarchyTitle?: string;
    contractLevel?: number;
  };

  // ---- 1. Validate body ---------------------------------------------------
  const hasDirectUpline = Object.prototype.hasOwnProperty.call(req.body ?? {}, "directUplineId");
  const hasTitle = hierarchyTitle !== undefined;
  const hasContract = contractLevel !== undefined;

  if (!hasDirectUpline && !hasTitle && !hasContract) {
    return res.status(400).json({ error: "At least one field (directUplineId, hierarchyTitle, contractLevel) must be provided" });
  }
  if (hasContract) {
    if (typeof contractLevel !== "number" || !Number.isFinite(contractLevel) || contractLevel < 60 || contractLevel > 125) {
      return res.status(400).json({ error: "contractLevel must be a number between 60 and 125" });
    }
  }
  if (hasTitle) {
    if (typeof hierarchyTitle !== "string" || !ALLOWED_HIERARCHY_TITLES.has(hierarchyTitle)) {
      return res.status(400).json({
        error: "hierarchyTitle must be one of: " + Array.from(ALLOWED_HIERARCHY_TITLES).join(", "),
      });
    }
  }
  if (hasDirectUpline && directUplineId !== null && typeof directUplineId !== "string") {
    return res.status(400).json({ error: "directUplineId must be a string UUID or null" });
  }
  // Self-upline is a trivial cycle.
  if (hasDirectUpline && directUplineId === agentId) {
    return res.status(400).json({ error: "Would create a cycle" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ---- 2. Load current active row --------------------------------------
    const currentRes = await client.query(
      `SELECT * FROM agent_hierarchy
         WHERE agent_user_id = $1 AND (effective_to IS NULL OR effective_to > NOW())
         ORDER BY effective_from DESC
         LIMIT 1`,
      [agentId],
    );
    if (currentRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "No active hierarchy row for this agent" });
    }
    const oldRow = currentRes.rows[0];

    // ---- 3. Merge changes (overlay body onto current) --------------------
    const newDirectUplineId = hasDirectUpline ? directUplineId ?? null : oldRow.direct_upline_id;
    const newTitle = hasTitle ? hierarchyTitle : oldRow.hierarchy_title;
    const newContractLevel = hasContract ? contractLevel : Number(oldRow.contract_level);

    // ---- 3b. Phase D: derive users.role from the new title ---------------
    // Promotions/demotions of hierarchy_title must actually change the
    // privilege gate, otherwise "promoting" someone to Director just renames
    // their badge without unlocking any feature. titleToRole() is the single
    // source of truth — see server/services/hierarchyRoleMap.ts.
    const newRole = titleToRole(newTitle);

    // Self-demotion guard — block lowering your own privileges (would lock
    // you out). Compare numeric privilege rank rather than title strings.
    // Fail-closed if the session lacks a role string (Sentinel C1) — refuse the
    // mutation rather than letting an unknown rank silently bypass the guard.
    if (agentId === req.user!.id) {
      const sessionRole = req.user!.role;
      if (!sessionRole || !(sessionRole in ROLE_PRIVILEGE_RANK)) {
        await client.query("ROLLBACK");
        return res.status(500).json({ error: "Cannot resolve session role for self-demotion guard. Sign out and sign back in." });
      }
      const myRank = ROLE_PRIVILEGE_RANK[sessionRole as keyof typeof ROLE_PRIVILEGE_RANK];
      const newRank = ROLE_PRIVILEGE_RANK[newRole] ?? 0;
      if (newRank < myRank) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Would lower your own privileges. Have another admin make this change." });
      }
    }

    // Read the agent's current role so we can audit the before/after.
    const userRowRes = await client.query(`SELECT role FROM users WHERE id = $1`, [agentId]);
    const oldRole: string | null = userRowRes.rows[0]?.role ?? null;

    // ---- 4. Cycle detection (only when upline changes) -------------------
    // Walk the descendant set of `agentId` (using current active rows). If
    // newDirectUplineId is in that set, we'd create a cycle. Pseudocode:
    //   descendants = BFS over agent_hierarchy where direct_upline_id matches
    //                 frontier; stop when newDirectUplineId is hit or frontier
    //                 empties. SELECT agent_user_id FROM agent_hierarchy
    //                 WHERE direct_upline_id = ANY($1)
    //                   AND (effective_to IS NULL OR effective_to > NOW()).
    if (hasDirectUpline && newDirectUplineId !== null && newDirectUplineId !== oldRow.direct_upline_id) {
      const descendants = new Set<string>([agentId]);
      let frontier: string[] = [agentId];
      const MAX_DEPTH = 50; // hierarchy is shallow in practice; guard against runaway loops
      for (let depth = 0; depth < MAX_DEPTH && frontier.length > 0; depth++) {
        const childRes = await client.query(
          `SELECT agent_user_id FROM agent_hierarchy
             WHERE direct_upline_id = ANY($1::uuid[])
               AND (effective_to IS NULL OR effective_to > NOW())`,
          [frontier],
        );
        const next: string[] = [];
        for (const r of childRes.rows) {
          const childId: string = r.agent_user_id;
          if (childId === newDirectUplineId) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: "Would create a cycle" });
          }
          if (!descendants.has(childId)) {
            descendants.add(childId);
            next.push(childId);
          }
        }
        frontier = next;
      }
    }

    // ---- 4b. Contract-level spread guard (Ledger C2 + 5%-min-spread rule) -
    // Override math requires every level have at LEAST a 5% spread above its
    // direct downline. Without that, the waterfall flattens or inverts and the
    // upline earns nothing on the deal. Enforce on BOTH sides:
    //   (1) agent's contract must be <= upline.contract - 5
    //   (2) every direct downline's contract must be <= agent.contract - 5
    const MIN_SPREAD = 5;
    if (hasDirectUpline || hasContract) {
      const effectiveUplineId = newDirectUplineId;
      if (effectiveUplineId !== null) {
        const upRes = await client.query(
          `SELECT contract_level FROM agent_hierarchy
             WHERE agent_user_id = $1 AND (effective_to IS NULL OR effective_to > NOW())
             ORDER BY effective_from DESC
             LIMIT 1`,
          [effectiveUplineId],
        );
        if (upRes.rowCount && upRes.rowCount > 0) {
          const uplineContract = Number(upRes.rows[0].contract_level);
          if (Number.isFinite(uplineContract) && newContractLevel > uplineContract - MIN_SPREAD) {
            await client.query("ROLLBACK");
            return res.status(400).json({
              error: `Spread too small: agent contract ${newContractLevel}% must be at most ${uplineContract - MIN_SPREAD}% (upline is ${uplineContract}%, minimum ${MIN_SPREAD}% spread required)`,
            });
          }
        }
      }
      // Direct downlines must each be at least 5% below the agent's new contract.
      const downRes = await client.query(
        `SELECT MAX(contract_level::numeric)::numeric AS max_down
           FROM agent_hierarchy
           WHERE direct_upline_id = $1
             AND (effective_to IS NULL OR effective_to > NOW())`,
        [agentId],
      );
      const maxDown = Number(downRes.rows[0]?.max_down);
      if (Number.isFinite(maxDown) && maxDown > newContractLevel - MIN_SPREAD) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: `Spread too small: a direct downline has contract ${maxDown}% but must be at most ${newContractLevel - MIN_SPREAD}% (minimum ${MIN_SPREAD}% spread below ${newContractLevel}%)`,
        });
      }
    }

    // ---- 5. & 6. Recompute hierarchyLevel and uplineChain ---------------
    let newHierarchyLevel = 0;
    let newUplineChain: string[] = [];
    if (newDirectUplineId) {
      // Walk up from newDirectUplineId until we hit a root (null upline). Each
      // step is a SELECT against the current active row of that ancestor.
      const chain: string[] = [];
      let cursor: string | null = newDirectUplineId;
      const MAX_DEPTH = 50;
      const seen = new Set<string>();
      for (let depth = 0; depth < MAX_DEPTH && cursor; depth++) {
        if (seen.has(cursor)) break; // pre-existing cycle in data; stop walking
        seen.add(cursor);
        chain.unshift(cursor);
        const ancRes = await client.query(
          `SELECT direct_upline_id FROM agent_hierarchy
             WHERE agent_user_id = $1 AND (effective_to IS NULL OR effective_to > NOW())
             ORDER BY effective_from DESC
             LIMIT 1`,
          [cursor],
        );
        if (ancRes.rowCount === 0) break;
        cursor = ancRes.rows[0].direct_upline_id;
      }
      newUplineChain = chain;
      newHierarchyLevel = chain.length; // direct upline at level 0 -> this agent at level 1, etc.
    }

    // ---- 6b. Update users.role + propagate lounge access when it changes -
    // Goes through the shared `reinitializeLoungeAccess` service so the same
    // audit row (access_change_log) + lounge-grant refresh that heritage-app
    // performs on every role mutation also fires from the goldcoast side.
    // Without this, heritage-app's `user_lounge_access` table stays stale
    // after a goldcoast hierarchy promotion. The service is idempotent — a
    // no-op when oldRole === newRole, so the legacy IS DISTINCT FROM guard
    // is enforced inside the service.
    if (oldRole !== newRole) {
      await reinitializeLoungeAccess({
        userId: agentId,
        newRole,
        performedByUserId: req.user!.id,
        reason: hasTitle
          ? `hierarchy_title → ${newTitle} (role derived via titleToRole)`
          : "hierarchy mutation",
        client, // join the existing transaction
      });
    }

    // ---- 7. Soft-end the old row -----------------------------------------
    await client.query(`UPDATE agent_hierarchy SET effective_to = NOW(), updated_at = NOW() WHERE id = $1`, [oldRow.id]);

    // ---- 8. Insert the new row -------------------------------------------
    const insertRes = await client.query(
      `INSERT INTO agent_hierarchy
         (agent_user_id, direct_upline_id, hierarchy_level, hierarchy_title,
          upline_chain, contract_level, override_eligible, override_percentage,
          effective_from, effective_to, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, NOW(), NULL, NOW(), NOW())
       RETURNING id, effective_from`,
      [
        agentId,
        newDirectUplineId,
        newHierarchyLevel,
        newTitle,
        JSON.stringify(newUplineChain),
        newContractLevel,
        oldRow.override_eligible,
        oldRow.override_percentage,
      ],
    );
    const newRow = insertRes.rows[0];

    // ---- 9. Audit log (inside transaction) -------------------------------
    const bodyDiff: Record<string, { from: any; to: any }> = {};
    if (hasDirectUpline) bodyDiff.directUplineId = { from: oldRow.direct_upline_id, to: newDirectUplineId };
    if (hasTitle) bodyDiff.hierarchyTitle = { from: oldRow.hierarchy_title, to: newTitle };
    if (hasContract) bodyDiff.contractLevel = { from: Number(oldRow.contract_level), to: newContractLevel };

    await logFounderAction({
      // requireAuth middleware guarantees req.user is set; using ! prevents a
      // future regression that would log an anonymous role mutation (Sentinel C2).
      actorUserId: req.user!.id,
      action: "hierarchy.update",
      entityType: "agent_hierarchy",
      entityId: agentId,
      payload: {
        before: oldRow,
        after: {
          id: newRow.id,
          agent_user_id: agentId,
          direct_upline_id: newDirectUplineId,
          hierarchy_level: newHierarchyLevel,
          hierarchy_title: newTitle,
          upline_chain: newUplineChain,
          contract_level: newContractLevel,
          effective_from: newRow.effective_from,
        },
        changes: bodyDiff,
        roleBefore: oldRole,
        roleAfter: newRole,
      },
      client,
    });

    // ---- 10. Commit ------------------------------------------------------
    await client.query("COMMIT");

    // Phase D Wave 1 (Conduit) — events fire AFTER COMMIT, never inside the
    // transaction, so a rolled-back mutation never broadcasts a phantom update.
    // `oldRole` and `newRole` are Forge's role-mapping locals (titleToRole +
    // users.role read above). The hierarchy event goes to every admin SSE
    // subscriber; the per-user role event is filtered server-side by userId in
    // `onRoleChanged` so it only reaches the affected agent's stream.
    try {
      emitHierarchyChanged({
        type: "hierarchy:changed",
        agentId,
        newTitle,
        newRole,
        ts: new Date().toISOString(),
      });
      if (oldRole !== null && oldRole !== newRole) {
        emitRoleChanged({
          type: "role:changed",
          userId: agentId,
          oldRole,
          newRole,
          ts: new Date().toISOString(),
        });
      }
    } catch (emitErr: any) {
      // Event-bus failures must never poison the HTTP response.
      console.error("[hcms-hierarchy PATCH] post-commit emit error:", emitErr?.message ?? emitErr);
    }

    return res.json({
      ok: true,
      newHierarchyId: newRow.id,
      effectiveFrom: newRow.effective_from,
    });
  } catch (e: any) {
    try { await client.query("ROLLBACK"); } catch { /* ignore rollback failure */ }
    console.error("[hcms-hierarchy PATCH] error:", e?.message ?? e);
    return res.status(500).json({ error: "Something went wrong" });
  } finally {
    client.release();
  }
});

/**
 * GET /api/hcms/hierarchy/stream — SSE channel for live hierarchy mutations.
 *
 * Phase D Wave 1 (Conduit). Mirrors the SSE pattern in
 * `server/routes/founders-leads.ts:664-715` exactly: text/event-stream headers,
 * 25s keepalive comments, and a triple-cleanup (`req.on("close")` /
 * `req.on("aborted")` / `res.on("close")`) to clear the keepalive interval and
 * unsubscribe from the bus.
 *
 * Gate: ADMIN_PLUS only (founder / owner / system_admin). Directors get
 * MANAGER_PLUS access on other endpoints, but the live stream is restricted
 * here so we don't leak role-change information to non-admin viewers.
 */
router.get("/stream", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  let closed = false;
  const write = (data: any) => {
    if (closed) return;
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch {
      closed = true;
    }
  };

  write({ type: "ready", at: new Date().toISOString() });

  const unsubscribe = onHierarchyChanged((ev) => write(ev));

  const keepalive = setInterval(() => {
    if (closed) return;
    try {
      res.write(": keepalive\n\n");
    } catch {
      closed = true;
    }
  }, 25000);

  const cleanup = () => {
    if (closed) return;
    closed = true;
    clearInterval(keepalive);
    try {
      unsubscribe();
    } catch {
      /* noop */
    }
    try {
      res.end();
    } catch {
      /* noop */
    }
  };

  req.on("close", cleanup);
  req.on("aborted", cleanup);
  res.on("close", cleanup);
});

export default router;
