/**
 * Commission Target Management Routes
 *
 * Endpoints for managing agency-wide and per-agent commission targets.
 * Executives/Directors set agency-wide defaults. Managers can adjust
 * per-agent targets within exec-set ranges. Agents view only.
 *
 * Domain: Ledger (Financial Systems Architect) + Forge (Backend)
 * Permission: COMMISSION_TARGETS_MANAGE for writes, auth for reads
 */

import { Router, Request, Response } from "express";
import { pool } from "../db";
import { requireAuth, attachUser, requirePermission } from "../middleware/auth";
import { hasPermission, Permission, Roles } from "../types/permissions";

const router = Router();

// Apply auth middleware to all routes
router.use(attachUser);
router.use(requireAuth);

// =============================================================================
// GET /api/commission-targets — Agency-wide defaults
// =============================================================================

/**
 * Get all active agency-wide default commission targets.
 * Any authenticated agent/manager/admin can view defaults.
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM commission_targets
       WHERE scope = 'agency_default' AND effective_to IS NULL
       ORDER BY hierarchy_level`,
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching agency commission targets:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch commission targets",
    });
  }
});

// =============================================================================
// PUT /api/commission-targets/agency — Set/update agency defaults
// =============================================================================

/**
 * Set or update agency-wide default commission targets for a hierarchy level.
 * Requires COMMISSION_TARGETS_MANAGE permission (executives/directors).
 *
 * Closes the existing default for that hierarchy level (sets effective_to = NOW())
 * and inserts a new record with scope = 'agency_default'.
 */
router.put(
  "/agency",
  requirePermission(Permission.COMMISSION_TARGETS_MANAGE),
  async (req: Request, res: Response) => {
    try {
      const {
        hierarchyLevel,
        minContractLevel,
        maxContractLevel,
        defaultContractLevel,
        levelProgression,
      } = req.body;

      // --- Validation ---
      if (hierarchyLevel == null || typeof hierarchyLevel !== "number") {
        return res.status(400).json({
          error: "Bad Request",
          message: "hierarchyLevel is required and must be a number",
        });
      }

      if (
        minContractLevel == null ||
        maxContractLevel == null ||
        defaultContractLevel == null
      ) {
        return res.status(400).json({
          error: "Bad Request",
          message:
            "minContractLevel, maxContractLevel, and defaultContractLevel are required",
        });
      }

      if (minContractLevel > maxContractLevel) {
        return res.status(400).json({
          error: "Bad Request",
          message: "minContractLevel cannot exceed maxContractLevel",
        });
      }

      if (
        defaultContractLevel < minContractLevel ||
        defaultContractLevel > maxContractLevel
      ) {
        return res.status(400).json({
          error: "Bad Request",
          message:
            "defaultContractLevel must be between minContractLevel and maxContractLevel",
        });
      }

      // --- Close existing default for this hierarchy level ---
      await pool.query(
        `UPDATE commission_targets
         SET effective_to = NOW(), updated_by = $1, updated_at = NOW()
         WHERE scope = 'agency_default'
           AND hierarchy_level = $2
           AND effective_to IS NULL`,
        [req.user!.id, hierarchyLevel],
      );

      // --- Insert new default ---
      const insertResult = await pool.query(
        `INSERT INTO commission_targets (
           scope, hierarchy_level, min_contract_level, max_contract_level,
           default_contract_level, level_progression, created_by, updated_by,
           effective_from, effective_to
         ) VALUES (
           'agency_default', $1, $2, $3, $4, $5, $6, $6, NOW(), NULL
         ) RETURNING *`,
        [
          hierarchyLevel,
          minContractLevel,
          maxContractLevel,
          defaultContractLevel,
          JSON.stringify(levelProgression ?? []),
          req.user!.id,
        ],
      );

      res.json(insertResult.rows[0]);
    } catch (error) {
      console.error("Error setting agency commission target:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to set agency commission target",
      });
    }
  },
);

// =============================================================================
// GET /api/commission-targets/agent/:agentUserId — Effective target for agent
// =============================================================================

/**
 * Get the effective commission target for a specific agent.
 * First checks for an agent-specific override, then falls back to the
 * agency default for their hierarchy level.
 */
router.get("/agent/:agentUserId", async (req: Request, res: Response) => {
  try {
    const { agentUserId } = req.params;

    // First, get the agent's hierarchy level
    const hierarchyResult = await pool.query(
      `SELECT hierarchy_level FROM agent_hierarchy
       WHERE agent_user_id = $1 AND effective_to IS NULL`,
      [agentUserId],
    );

    if (hierarchyResult.rows.length === 0) {
      return res.status(404).json({
        error: "Not Found",
        message: "No active hierarchy record found for this agent",
      });
    }

    const agentHierarchyLevel = hierarchyResult.rows[0].hierarchy_level;

    // Check for agent-specific target first
    const agentSpecificResult = await pool.query(
      `SELECT * FROM commission_targets
       WHERE scope = 'agent_specific'
         AND agent_user_id = $1
         AND effective_to IS NULL
       LIMIT 1`,
      [agentUserId],
    );

    // Get agent's current contract level
    const contractResult = await pool.query(
      `SELECT contract_level FROM agent_hierarchy
       WHERE agent_user_id = $1 AND effective_to IS NULL`,
      [agentUserId],
    );
    const currentContractLevel = parseFloat(contractResult.rows[0]?.contract_level || '0');

    // Find the applicable target (agent-specific or agency default)
    let targetRow = agentSpecificResult.rows[0] || null;
    let source = "agent_specific";

    if (!targetRow) {
      const agencyDefaultResult = await pool.query(
        `SELECT * FROM commission_targets
         WHERE scope = 'agency_default'
           AND hierarchy_level = $1
           AND effective_to IS NULL
         LIMIT 1`,
        [agentHierarchyLevel],
      );
      targetRow = agencyDefaultResult.rows[0] || null;
      source = "agency_default";
    }

    if (targetRow) {
      // Compute currentLevel, nextLevel, nextThreshold from levelProgression
      const progression: Array<{ monthlyAp: number; contractLevel: number }> = targetRow.level_progression || targetRow.levelProgression || [];
      const sortedProgression = [...progression].sort((a, b) => a.contractLevel - b.contractLevel);

      // Find the next tier above the agent's current contract level
      const nextTier = sortedProgression.find(t => t.contractLevel > currentContractLevel);

      const maxLevel = parseFloat(targetRow.max_contract_level || targetRow.maxContractLevel || '0');
      return res.json({
        ...targetRow,
        source,
        // Fields the frontend expects — null means "use hardcoded tier fallback"
        currentLevel: currentContractLevel,
        nextLevel: nextTier?.contractLevel ?? (maxLevel > currentContractLevel ? maxLevel : null),
        nextThreshold: nextTier?.monthlyAp ?? null,
      });
    }

    // No target found — return current level, null for next (let frontend use hardcoded tiers)
    res.json({
      source: "none",
      currentLevel: currentContractLevel,
      nextLevel: null,
      nextThreshold: null,
    });
  } catch (error) {
    console.error("Error fetching agent commission target:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch agent commission target",
    });
  }
});

// =============================================================================
// PUT /api/commission-targets/agent/:agentUserId — Set per-agent target
// =============================================================================

/**
 * Set a per-agent commission target override. Requires HIERARCHY_REQUEST_REVIEW
 * permission (managers). Validates that the values fall within the agency-wide
 * min/max range for the agent's hierarchy level.
 */
router.put(
  "/agent/:agentUserId",
  requirePermission(Permission.HIERARCHY_REQUEST_REVIEW),
  async (req: Request, res: Response) => {
    try {
      const { agentUserId } = req.params;
      const {
        minContractLevel,
        maxContractLevel,
        defaultContractLevel,
        levelProgression,
      } = req.body;

      // --- Validation: required fields ---
      if (
        minContractLevel == null ||
        maxContractLevel == null ||
        defaultContractLevel == null
      ) {
        return res.status(400).json({
          error: "Bad Request",
          message:
            "minContractLevel, maxContractLevel, and defaultContractLevel are required",
        });
      }

      if (minContractLevel > maxContractLevel) {
        return res.status(400).json({
          error: "Bad Request",
          message: "minContractLevel cannot exceed maxContractLevel",
        });
      }

      if (
        defaultContractLevel < minContractLevel ||
        defaultContractLevel > maxContractLevel
      ) {
        return res.status(400).json({
          error: "Bad Request",
          message:
            "defaultContractLevel must be between minContractLevel and maxContractLevel",
        });
      }

      // --- Get agent's hierarchy level ---
      const hierarchyResult = await pool.query(
        `SELECT hierarchy_level FROM agent_hierarchy
         WHERE agent_user_id = $1 AND effective_to IS NULL`,
        [agentUserId],
      );

      if (hierarchyResult.rows.length === 0) {
        return res.status(404).json({
          error: "Not Found",
          message: "No active hierarchy record found for this agent",
        });
      }

      const agentHierarchyLevel = hierarchyResult.rows[0].hierarchy_level;

      // --- Validate against agency-wide range ---
      const agencyDefaultResult = await pool.query(
        `SELECT min_contract_level, max_contract_level FROM commission_targets
         WHERE scope = 'agency_default'
           AND hierarchy_level = $1
           AND effective_to IS NULL
         LIMIT 1`,
        [agentHierarchyLevel],
      );

      if (agencyDefaultResult.rows.length > 0) {
        const agencyMin = agencyDefaultResult.rows[0].min_contract_level;
        const agencyMax = agencyDefaultResult.rows[0].max_contract_level;

        if (minContractLevel < agencyMin || maxContractLevel > agencyMax) {
          return res.status(400).json({
            error: "Bad Request",
            message: `Agent target values must be within agency range: ${agencyMin}–${agencyMax}`,
            agencyMin,
            agencyMax,
          });
        }

        if (
          defaultContractLevel < agencyMin ||
          defaultContractLevel > agencyMax
        ) {
          return res.status(400).json({
            error: "Bad Request",
            message: `Default contract level must be within agency range: ${agencyMin}–${agencyMax}`,
            agencyMin,
            agencyMax,
          });
        }
      }

      // --- Close existing agent-specific target ---
      await pool.query(
        `UPDATE commission_targets
         SET effective_to = NOW(), updated_by = $1, updated_at = NOW()
         WHERE scope = 'agent_specific'
           AND agent_user_id = $2
           AND effective_to IS NULL`,
        [req.user!.id, agentUserId],
      );

      // --- Insert new agent-specific target ---
      const insertResult = await pool.query(
        `INSERT INTO commission_targets (
           scope, agent_user_id, hierarchy_level, min_contract_level,
           max_contract_level, default_contract_level, level_progression,
           created_by, updated_by, effective_from, effective_to
         ) VALUES (
           'agent_specific', $1, $2, $3, $4, $5, $6, $7, $7, NOW(), NULL
         ) RETURNING *`,
        [
          agentUserId,
          agentHierarchyLevel,
          minContractLevel,
          maxContractLevel,
          defaultContractLevel,
          JSON.stringify(levelProgression ?? []),
          req.user!.id,
        ],
      );

      res.json(insertResult.rows[0]);
    } catch (error) {
      console.error("Error setting agent commission target:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to set agent commission target",
      });
    }
  },
);

export default router;
