/**
 * Agent Hierarchy API Routes
 * Endpoints for viewing upline/downline relationships
 */

import { Router, Request, Response } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, attachUser } from "../middleware/auth";
import { Roles, Permission, hasPermission } from "../types/permissions";
import { HIERARCHY_LEVELS, HIERARCHY_TITLES } from "@shared/models/enterprise";

const router = Router();

// Apply auth middleware to all routes
router.use(attachUser);
router.use(requireAuth);
router.use(requireRole(Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER, Roles.SALES_AGENT));

// =============================================================================
// TYPES
// =============================================================================

interface HierarchyMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  level: number;
  title: string;
  ytdCommission: number;
  policiesSold: number;
  teamSize: number;
  conversionRate: number;
  avatarUrl: string | null;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get performance stats for an agent
 * Returns zeros if tables don't exist or on error (graceful degradation)
 */
async function getAgentStats(agentUserId: string): Promise<{
  ytdCommission: number;
  policiesSold: number;
  teamSize: number;
  conversionRate: number;
}> {
  const defaultStats = {
    ytdCommission: 0,
    policiesSold: 0,
    teamSize: 0,
    conversionRate: 0,
  };

  try {
    // Single combined query for better performance
    const result = await pool.query(`
      SELECT
        (SELECT COALESCE(SUM(CAST(amount AS DECIMAL)), 0)
         FROM commissions
         WHERE agent_user_id = $1
           AND status = 'paid'
           AND EXTRACT(YEAR FROM earned_at) = EXTRACT(YEAR FROM CURRENT_DATE)) as ytd_commission,
        (SELECT COUNT(*)
         FROM policies p
         JOIN leads l ON p.lead_id = l.id
         WHERE l.assigned_agent_id = $1
           AND EXTRACT(YEAR FROM p.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)) as policies_sold,
        (SELECT COUNT(*)
         FROM agent_hierarchy
         WHERE direct_upline_id = $1
           AND effective_to IS NULL) as team_size,
        (SELECT COUNT(DISTINCT CASE WHEN l.status = 'won' THEN l.id END)
         FROM leads l
         WHERE l.assigned_agent_id = $1
           AND l.created_at >= NOW() - INTERVAL '90 days') as won_leads,
        (SELECT COUNT(DISTINCT l.id)
         FROM leads l
         WHERE l.assigned_agent_id = $1
           AND l.created_at >= NOW() - INTERVAL '90 days') as total_leads
    `, [agentUserId]);

    const row = result.rows[0];
    const won = parseInt(row?.won_leads || '0');
    const total = parseInt(row?.total_leads || '0');

    return {
      ytdCommission: parseFloat(row?.ytd_commission || '0'),
      policiesSold: parseInt(row?.policies_sold || '0'),
      teamSize: parseInt(row?.team_size || '0'),
      conversionRate: total > 0 ? Math.round((won / total) * 100) : 0,
    };
  } catch (error) {
    // Tables might not exist yet - return defaults
    console.warn("Could not fetch agent stats (tables may not exist):", error);
    return defaultStats;
  }
}

/**
 * Format user data into HierarchyMember
 */
async function formatHierarchyMember(user: any, hierarchyData: any): Promise<HierarchyMember> {
  const stats = await getAgentStats(user.id);
  const level = hierarchyData?.hierarchy_level ?? HIERARCHY_LEVELS.AGENT;

  return {
    id: user.id,
    name: `${user.first_name} ${user.last_name}`,
    email: user.email,
    phone: user.phone,
    role: user.role,
    level,
    title: hierarchyData?.hierarchy_title || HIERARCHY_TITLES[level] || 'Agent',
    ytdCommission: stats.ytdCommission,
    policiesSold: stats.policiesSold,
    teamSize: stats.teamSize,
    conversionRate: stats.conversionRate,
    avatarUrl: user.avatar_url,
  };
}

// =============================================================================
// ENDPOINTS
// =============================================================================

/**
 * GET /api/hierarchy/my-position
 * Get the current user's position in the hierarchy
 */
router.get("/my-position", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Get user and hierarchy data
    const result = await pool.query(`
      SELECT u.*, h.hierarchy_level, h.hierarchy_title, h.direct_upline_id, h.upline_chain, h.override_eligible, h.override_percentage
      FROM users u
      LEFT JOIN agent_hierarchy h ON u.id = h.agent_user_id AND h.effective_to IS NULL
      WHERE u.id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    const member = await formatHierarchyMember(user, user);

    res.json({
      success: true,
      data: {
        ...member,
        directUplineId: user.direct_upline_id,
        uplineChain: user.upline_chain || [],
        overrideEligible: user.override_eligible || false,
        overridePercentage: user.override_percentage,
      },
    });
  } catch (error) {
    console.error("Error fetching hierarchy position:", error);
    res.status(500).json({ error: "Failed to fetch hierarchy position" });
  }
});

/**
 * GET /api/hierarchy/upline
 * Get the current user's complete upline chain
 */
router.get("/upline", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Get the user's upline chain
    const hierarchyResult = await pool.query(`
      SELECT upline_chain
      FROM agent_hierarchy
      WHERE agent_user_id = $1 AND effective_to IS NULL
    `, [userId]);

    const uplineChain: string[] = hierarchyResult.rows[0]?.upline_chain || [];

    if (uplineChain.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Fetch all upline members
    const uplineResult = await pool.query(`
      SELECT u.*, h.hierarchy_level, h.hierarchy_title
      FROM users u
      LEFT JOIN agent_hierarchy h ON u.id = h.agent_user_id AND h.effective_to IS NULL
      WHERE u.id = ANY($1)
    `, [uplineChain]);

    // Format and order by upline chain
    const uplineMembers: HierarchyMember[] = [];
    for (const uplineId of uplineChain) {
      const user = uplineResult.rows.find((r: any) => r.id === uplineId);
      if (user) {
        uplineMembers.push(await formatHierarchyMember(user, user));
      }
    }

    res.json({ success: true, data: uplineMembers });
  } catch (error) {
    console.error("Error fetching upline:", error);
    res.status(500).json({ error: "Failed to fetch upline" });
  }
});

/**
 * GET /api/hierarchy/downline
 * Get the current user's direct reports (downline)
 */
router.get("/downline", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Check if user can view their team
    const canViewTeam = hasPermission(userRole, Permission.HIERARCHY_VIEW_TEAM) ||
                        hasPermission(userRole, Permission.HIERARCHY_VIEW_ALL);

    // Get direct reports
    const downlineResult = await pool.query(`
      SELECT u.*, h.hierarchy_level, h.hierarchy_title
      FROM users u
      JOIN agent_hierarchy h ON u.id = h.agent_user_id
      WHERE h.direct_upline_id = $1 AND h.effective_to IS NULL
      ORDER BY h.hierarchy_level ASC, u.first_name ASC
    `, [userId]);

    const downlineMembers: HierarchyMember[] = [];
    for (const user of downlineResult.rows) {
      downlineMembers.push(await formatHierarchyMember(user, user));
    }

    res.json({ success: true, data: downlineMembers });
  } catch (error) {
    console.error("Error fetching downline:", error);
    res.status(500).json({ error: "Failed to fetch downline" });
  }
});

/**
 * Check if agent_hierarchy table exists
 */
async function hierarchyTableExists(): Promise<boolean> {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'agent_hierarchy'
      )
    `);
    return result.rows[0]?.exists === true;
  } catch {
    return false;
  }
}

/**
 * GET /api/hierarchy/full
 * Get the full hierarchy view for the current user
 * Returns: { agent, upline, downline }
 */
router.get("/full", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Check if hierarchy table exists
    const tableExists = await hierarchyTableExists();

    // Get current user's position
    let userResult;
    if (tableExists) {
      userResult = await pool.query(`
        SELECT u.*, h.hierarchy_level, h.hierarchy_title, h.direct_upline_id, h.upline_chain
        FROM users u
        LEFT JOIN agent_hierarchy h ON u.id = h.agent_user_id AND h.effective_to IS NULL
        WHERE u.id = $1
      `, [userId]);
    } else {
      // Fallback if table doesn't exist
      userResult = await pool.query(`
        SELECT u.*, NULL as hierarchy_level, NULL as hierarchy_title, NULL as direct_upline_id, NULL as upline_chain
        FROM users u
        WHERE u.id = $1
      `, [userId]);
    }

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.rows[0];
    const agent = await formatHierarchyMember(user, user);
    const uplineChain: string[] = user.upline_chain || [];

    // Fetch upline members (only if we have upline data and table exists)
    const uplineMembers: HierarchyMember[] = [];
    if (tableExists && uplineChain.length > 0) {
      const uplineResult = await pool.query(`
        SELECT u.*, h.hierarchy_level, h.hierarchy_title
        FROM users u
        LEFT JOIN agent_hierarchy h ON u.id = h.agent_user_id AND h.effective_to IS NULL
        WHERE u.id = ANY($1)
      `, [uplineChain]);

      for (const uplineId of uplineChain) {
        const uplineUser = uplineResult.rows.find((r: any) => r.id === uplineId);
        if (uplineUser) {
          uplineMembers.push(await formatHierarchyMember(uplineUser, uplineUser));
        }
      }
    }

    // Fetch downline members (only if table exists)
    const downlineMembers: HierarchyMember[] = [];
    if (tableExists) {
      const downlineResult = await pool.query(`
        SELECT u.*, h.hierarchy_level, h.hierarchy_title
        FROM users u
        JOIN agent_hierarchy h ON u.id = h.agent_user_id
        WHERE h.direct_upline_id = $1 AND h.effective_to IS NULL
        ORDER BY h.hierarchy_level ASC, u.first_name ASC
      `, [userId]);

      for (const downlineUser of downlineResult.rows) {
        downlineMembers.push(await formatHierarchyMember(downlineUser, downlineUser));
      }
    }

    res.json({
      success: true,
      data: {
        agent,
        upline: uplineMembers,
        downline: downlineMembers,
      },
    });
  } catch (error) {
    console.error("Error fetching full hierarchy:", error);
    res.status(500).json({ error: "Failed to fetch hierarchy" });
  }
});

/**
 * GET /api/hierarchy/team-tree
 * Get the full team tree for managers (recursive downline)
 * Only available to managers and above
 */
router.get("/team-tree", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Check permissions
    if (!hasPermission(userRole, Permission.HIERARCHY_VIEW_TEAM) &&
        !hasPermission(userRole, Permission.HIERARCHY_VIEW_ALL)) {
      return res.status(403).json({ error: "Not authorized to view team tree" });
    }

    // Recursive CTE to get all downline
    const result = await pool.query(`
      WITH RECURSIVE team_tree AS (
        -- Base case: direct reports
        SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.role, u.avatar_url,
               h.hierarchy_level, h.hierarchy_title, h.direct_upline_id,
               1 as depth
        FROM users u
        JOIN agent_hierarchy h ON u.id = h.agent_user_id
        WHERE h.direct_upline_id = $1 AND h.effective_to IS NULL

        UNION ALL

        -- Recursive case: reports of reports
        SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.role, u.avatar_url,
               h.hierarchy_level, h.hierarchy_title, h.direct_upline_id,
               tt.depth + 1
        FROM users u
        JOIN agent_hierarchy h ON u.id = h.agent_user_id
        JOIN team_tree tt ON h.direct_upline_id = tt.id
        WHERE h.effective_to IS NULL AND tt.depth < 10
      )
      SELECT * FROM team_tree ORDER BY depth, hierarchy_level, first_name
    `, [userId]);

    const teamMembers: (HierarchyMember & { depth: number; directUplineId: string })[] = [];
    for (const member of result.rows) {
      const formatted = await formatHierarchyMember(member, member);
      teamMembers.push({
        ...formatted,
        depth: member.depth,
        directUplineId: member.direct_upline_id,
      });
    }

    res.json({ success: true, data: teamMembers });
  } catch (error) {
    console.error("Error fetching team tree:", error);
    res.status(500).json({ error: "Failed to fetch team tree" });
  }
});

/**
 * POST /api/hierarchy/setup
 * Set up or update an agent's hierarchy position
 * Only available to managers and above
 */
router.post("/setup", async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;

    if (!hasPermission(userRole, Permission.HIERARCHY_MANAGE)) {
      return res.status(403).json({ error: "Not authorized to manage hierarchy" });
    }

    const { agentUserId, directUplineId, hierarchyLevel, hierarchyTitle, overrideEligible, overridePercentage } = req.body;

    if (!agentUserId) {
      return res.status(400).json({ error: "agentUserId is required" });
    }

    // Build the upline chain
    let uplineChain: string[] = [];
    if (directUplineId) {
      const uplineResult = await pool.query(`
        SELECT upline_chain FROM agent_hierarchy
        WHERE agent_user_id = $1 AND effective_to IS NULL
      `, [directUplineId]);

      const parentChain = uplineResult.rows[0]?.upline_chain || [];
      uplineChain = [directUplineId, ...parentChain];
    }

    // Close any existing hierarchy record
    await pool.query(`
      UPDATE agent_hierarchy
      SET effective_to = NOW(), updated_at = NOW()
      WHERE agent_user_id = $1 AND effective_to IS NULL
    `, [agentUserId]);

    // Insert new hierarchy record
    const result = await pool.query(`
      INSERT INTO agent_hierarchy (
        agent_user_id, direct_upline_id, hierarchy_level, hierarchy_title,
        upline_chain, override_eligible, override_percentage
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      agentUserId,
      directUplineId,
      hierarchyLevel ?? HIERARCHY_LEVELS.AGENT,
      hierarchyTitle || HIERARCHY_TITLES[hierarchyLevel ?? HIERARCHY_LEVELS.AGENT],
      JSON.stringify(uplineChain),
      overrideEligible ?? false,
      overridePercentage,
    ]);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error setting up hierarchy:", error);
    res.status(500).json({ error: "Failed to set up hierarchy" });
  }
});

export default router;
