/**
 * Lounge Access Control API Routes
 * Manage member approvals, promotions, and access
 */

import { Router, Request, Response } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, attachUser } from "../middleware/auth";
import { Roles } from "../types/permissions";
import { storage } from "../storage";
import { HIERARCHY_LEVELS, HIERARCHY_TITLES } from "@shared/models/enterprise";
import crypto from "crypto";
import {
  sendApprovalEmail,
  sendRejectionEmail,
  sendPromotionEmail,
  sendOnboardingEmail,
  sendAccessChangeEmail,
} from "../gmail";
import { notifyUser } from "../websocket/eventBridge";

// ─── Lounge display names & paths (DB key → friendly name / frontend path) ───
const LOUNGE_DISPLAY_NAMES: Record<string, string> = {
  agent_portal: 'Agent Portal',
  manager_lounge: 'Manager Lounge',
  executive_lounge: 'Executive Lounge',
  crm_lounge: 'CRM Lounge',
  ai_lounge: 'AI Lounge',
  marketing_lounge: 'Marketing Lounge',
  admin_panel: 'Admin Panel',
  client_lounge: 'Client Lounge',
  onboarding_lounge: 'Onboarding',
  finance_lounge: 'Finance Lounge',
  support_lounge: 'Support Lounge',
  investor_lounge: 'Investor Lounge',
};

const LOUNGE_PATHS: Record<string, string> = {
  agent_portal: '/agents/dashboard',
  manager_lounge: '/manager/dashboard',
  executive_lounge: '/executive/dashboard',
  crm_lounge: '/crm',
  ai_lounge: '/ai/dashboard',
  marketing_lounge: '/marketing/dashboard',
  admin_panel: '/admin',
  client_lounge: '/client/dashboard',
  onboarding_lounge: '/onboarding',
  finance_lounge: '/finance/dashboard',
  support_lounge: '/support/dashboard',
  investor_lounge: '/investor/dashboard',
};

const router = Router();

// Apply auth — only owner + system_admin
router.use(attachUser);
router.use(requireAuth);
router.use(requireRole(Roles.OWNER, Roles.SYSTEM_ADMIN));

// ═══════════════════════════════════════════════════════════════════════════════
// GET /pending-registrations — List pending agent applications
// ═══════════════════════════════════════════════════════════════════════════════
router.get("/pending-registrations", async (req: Request, res: Response) => {
  try {
    // Use raw SQL to join agentProfiles with users for full details
    const result = await pool.query(`
      SELECT
        ap.id as profile_id,
        ap.user_id,
        ap.is_licensed,
        ap.license_number,
        ap.licensed_states,
        ap.years_experience,
        ap.previous_agency,
        ap.npn,
        ap.why_join_heritage,
        ap.referral_source,
        ap.referring_agent_name,
        ap.approval_status,
        ap.created_at as applied_at,
        ap.street_address,
        ap.city,
        ap.state,
        ap.zip_code,
        ap.date_of_birth,
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.created_at as registered_at
      FROM agent_profiles ap
      JOIN users u ON u.id = ap.user_id::uuid
      WHERE ap.approval_status = 'pending_review'
      ORDER BY ap.created_at DESC
    `);

    res.json({ registrations: result.rows, total: result.rows.length });
  } catch (error: any) {
    console.error("Error fetching pending registrations:", error);
    res.status(500).json({ error: "Failed to fetch pending registrations" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /registration/:profileId — Single registration detail
// ═══════════════════════════════════════════════════════════════════════════════
router.get("/registration/:profileId", async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const result = await pool.query(`
      SELECT
        ap.*,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.created_at as registered_at
      FROM agent_profiles ap
      JOIN users u ON u.id = ap.user_id::uuid
      WHERE ap.id = $1
    `, [profileId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Registration not found" });
    }

    res.json({ registration: result.rows[0] });
  } catch (error: any) {
    console.error("Error fetching registration:", error);
    res.status(500).json({ error: "Failed to fetch registration" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /approve-registration — Approve an agent application
// ═══════════════════════════════════════════════════════════════════════════════
router.post("/approve-registration", async (req: Request, res: Response) => {
  try {
    const { profileId, assignTeam, directUplineId } = req.body;
    const performedBy = (req as any).user?.id;

    if (!profileId) {
      return res.status(400).json({ error: "profileId is required" });
    }

    // 1. Update agent profile approval status
    const profile = await storage.updateAgentProfileApproval(profileId, "approved", performedBy);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // 2. Activate the user account + set onboarding status
    const userId = profile.userId;
    await storage.updateUser(userId, { isActive: true, onboardingStatus: 'in_progress' });

    // 2b. Auto-create hierarchy record if upline is specified
    const uplineId = directUplineId || profile.preferredUplineId;
    if (uplineId) {
      try {
        const uplineResult = await pool.query(`
          SELECT upline_chain FROM agent_hierarchy
          WHERE agent_user_id = $1 AND effective_to IS NULL
        `, [uplineId]);
        const parentChain: string[] = uplineResult.rows[0]?.upline_chain || [];
        const fullChain = [uplineId, ...parentChain];

        const level = profile.isLicensed === 'yes'
          ? HIERARCHY_LEVELS.AGENT
          : HIERARCHY_LEVELS.NEW_AGENT;

        await pool.query(`
          INSERT INTO agent_hierarchy (
            id, agent_user_id, direct_upline_id, hierarchy_level,
            hierarchy_title, upline_chain, override_eligible
          ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, false)
        `, [userId, uplineId, level, HIERARCHY_TITLES[level], JSON.stringify(fullChain)]);

        console.log(`[Approval] Created hierarchy record for ${userId} under upline ${uplineId}`);
      } catch (hierarchyErr) {
        console.error("[Approval] Hierarchy record creation failed:", hierarchyErr);
      }
    }

    // 3. Get user details for email
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 4. Generate onboarding token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const onboardingType = profile.isLicensed === 'yes' ? 'licensed' : 'new_agent';

    await storage.setOnboardingToken(profileId, tokenHash, tokenExpiry);
    await storage.updateAgentOnboarding(profileId, {
      onboarding_type: onboardingType,
      onboarding_step: 0,
    });

    // 5. Initialize default lounge access
    try {
      await storage.initializeDefaultLoungeAccess(userId, user.role);
    } catch (loungeErr) {
      console.error("Failed to initialize lounge access:", loungeErr);
    }

    // 6. Log the action
    await storage.createAccessChangeLog({
      targetUserId: userId,
      performedBy,
      actionType: "registration_approved",
      previousValue: { role: user.role, isActive: false, approvalStatus: "pending_review" },
      newValue: { role: user.role, isActive: true, approvalStatus: "approved", onboardingType },
      reason: `Approved by ${performedBy}`,
      emailSent: true,
    });

    // 7. Send onboarding email with secure link
    const appUrl = process.env.APP_URL || (process.env.NODE_ENV === 'production' ? 'https://heritagels.org' : 'http://localhost:4500');
    const onboardingUrl = `${appUrl}/onboarding-intake?token=${rawToken}`;
    try {
      await sendOnboardingEmail({
        agentName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Agent',
        agentEmail: user.email,
        onboardingUrl,
        onboardingType: onboardingType as 'licensed' | 'new_agent',
        approvedBy: (req as any).user?.firstName || 'Heritage Life Solutions',
      });
    } catch (emailErr) {
      console.error("Failed to send onboarding email:", emailErr);
    }

    res.json({ success: true, message: "Agent approved — onboarding email sent", userId, profile });
  } catch (error: any) {
    console.error("Error approving registration:", error);
    res.status(500).json({ error: "Failed to approve registration" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /reject-registration — Reject an agent application
// ═══════════════════════════════════════════════════════════════════════════════
router.post("/reject-registration", async (req: Request, res: Response) => {
  try {
    const { profileId, reason } = req.body;
    const performedBy = (req as any).user?.id;

    if (!profileId || !reason) {
      return res.status(400).json({ error: "profileId and reason are required" });
    }

    // 1. Update agent profile
    const profile = await storage.updateAgentProfileApproval(profileId, "rejected", performedBy, reason);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // 2. Get user details
    const user = await storage.getUserById(profile.userId);

    // 3. Log the action
    await storage.createAccessChangeLog({
      targetUserId: profile.userId,
      performedBy,
      actionType: "registration_rejected",
      previousValue: { approvalStatus: "pending_review" },
      newValue: { approvalStatus: "rejected" },
      reason,
      emailSent: true,
    });

    // 4. Send rejection email
    if (user) {
      try {
        await sendRejectionEmail({
          applicantName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Applicant',
          applicantEmail: user.email,
          reason,
          contactEmail: 'careers@heritagels.org',
        });
      } catch (emailErr) {
        console.error("Failed to send rejection email:", emailErr);
      }
    }

    res.json({ success: true, message: "Registration rejected" });
  } catch (error: any) {
    console.error("Error rejecting registration:", error);
    res.status(500).json({ error: "Failed to reject registration" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /members — List all internal members
// ═══════════════════════════════════════════════════════════════════════════════
router.get("/members", async (req: Request, res: Response) => {
  try {
    const { role, status, search, page = '1', limit = '50' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Show all roles when a specific role is requested; otherwise exclude clients by default
    let whereClause = (role && role !== 'all') ? `WHERE u.role = $1` : "WHERE 1=1";
    const params: any[] = [];
    let paramIdx = 1;

    if (role && role !== 'all') {
      params.push(role);
      paramIdx++;
    } else {
      // Default: exclude clients from "All" to keep the directory focused on internal team
      whereClause += ` AND u.role NOT IN ('client')`;
    }
    if (status === 'active') {
      whereClause += ` AND u.is_active = true`;
    } else if (status === 'inactive') {
      whereClause += ` AND u.is_active = false`;
    }
    if (search) {
      whereClause += ` AND (u.first_name ILIKE $${paramIdx} OR u.last_name ILIKE $${paramIdx} OR u.email ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    const countResult = await pool.query(
      `SELECT count(*)::int as total FROM users u ${whereClause}`,
      params
    );

    // agent_hierarchy may not exist yet — check and join conditionally
    let hierarchyJoin = '';
    let hierarchySelect = 'NULL as hierarchy_level, NULL as hierarchy_title, NULL as direct_upline_id';
    try {
      const tableCheck = await pool.query(
        `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agent_hierarchy' LIMIT 1`
      );
      if (tableCheck.rows.length > 0) {
        hierarchyJoin = 'LEFT JOIN agent_hierarchy ah ON ah.agent_user_id = u.id';
        hierarchySelect = 'ah.hierarchy_level, ah.hierarchy_title, ah.direct_upline_id';
      }
    } catch { /* table doesn't exist */ }

    const result = await pool.query(`
      SELECT
        u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.is_active,
        u.avatar_url, u.last_login_at, u.created_at,
        ap.approval_status, ap.is_licensed, ap.years_experience,
        ${hierarchySelect}
      FROM users u
      LEFT JOIN agent_profiles ap ON ap.user_id = u.id::text
      ${hierarchyJoin}
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `, [...params, parseInt(limit as string), offset]);

    res.json({
      members: result.rows,
      total: countResult.rows[0]?.total || 0,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });
  } catch (error: any) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /promote — Change a member's role (promotion/demotion)
// ═══════════════════════════════════════════════════════════════════════════════
router.post("/promote", async (req: Request, res: Response) => {
  try {
    const { userId, newRole, newHierarchyLevel, reason, silent } = req.body;
    const performedBy = (req as any).user?.id;

    if (!userId || !newRole) {
      return res.status(400).json({ error: "userId and newRole are required" });
    }

    // Validate role
    const validRoles = ['owner', 'system_admin', 'manager', 'sales_agent', 'marketing_staff', 'investor'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Cannot promote to owner
    if (newRole === 'owner') {
      return res.status(403).json({ error: "Cannot promote to owner role" });
    }

    // Get current user data
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const previousRole = user.role;

    // Promotion ladder: Agent(3) → Manager(2) → Director/system_admin(1) → Executive/owner(0)
    // Roles outside the main ladder (marketing_staff, investor, client) are lateral moves
    const ROLE_RANK: Record<string, number> = {
      owner: 0, system_admin: 1, manager: 2, sales_agent: 3,
    };
    const prevRank = ROLE_RANK[previousRole];
    const newRank = ROLE_RANK[newRole];
    const bothOnLadder = prevRank !== undefined && newRank !== undefined;
    const isPromotion = bothOnLadder && newRank < prevRank;
    const isDemotion = bothOnLadder && newRank > prevRank;

    // Check if agent_hierarchy table exists before querying
    let previousLevel: { rows: any[] } = { rows: [] };
    let hierarchyTableExists = false;
    try {
      const tableCheck = await pool.query(
        `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agent_hierarchy' LIMIT 1`
      );
      hierarchyTableExists = tableCheck.rows.length > 0;
      if (hierarchyTableExists) {
        previousLevel = await pool.query(
          `SELECT hierarchy_level, hierarchy_title FROM agent_hierarchy WHERE agent_user_id = $1`,
          [userId]
        );
      }
    } catch { /* table doesn't exist */ }

    // 1. Update user role
    await storage.updateUser(userId, { role: newRole });

    // 1b. Re-initialize lounge access for new role (revokes old, grants new)
    try {
      await storage.reinitializeLoungeAccess(userId, newRole, performedBy);
    } catch (loungeErr) {
      console.error("Failed to reinitialize lounge access:", loungeErr);
    }

    // 2. Update hierarchy if level provided and table exists
    if (newHierarchyLevel !== undefined && hierarchyTableExists) {
      const title = HIERARCHY_TITLES[newHierarchyLevel] || newRole;
      const existing = previousLevel.rows[0];
      if (existing) {
        await pool.query(
          `UPDATE agent_hierarchy SET hierarchy_level = $1, hierarchy_title = $2, updated_at = NOW() WHERE agent_user_id = $3`,
          [newHierarchyLevel, title, userId]
        );
      } else {
        await pool.query(
          `INSERT INTO agent_hierarchy (id, agent_user_id, hierarchy_level, hierarchy_title, effective_from)
           VALUES (gen_random_uuid(), $1, $2, $3, NOW())`,
          [userId, newHierarchyLevel, title]
        );
      }
    }

    // 3. Log the change
    const newTitle = HIERARCHY_TITLES[newHierarchyLevel] || newRole;
    await storage.createAccessChangeLog({
      targetUserId: userId,
      performedBy,
      actionType: isPromotion ? "promoted" : isDemotion ? "demoted" : "role_changed",
      previousValue: {
        role: previousRole,
        hierarchyLevel: previousLevel.rows[0]?.hierarchy_level,
        hierarchyTitle: previousLevel.rows[0]?.hierarchy_title,
      },
      newValue: {
        role: newRole,
        hierarchyLevel: newHierarchyLevel,
        hierarchyTitle: newTitle,
      },
      reason: reason || `${isPromotion ? 'Promoted' : isDemotion ? 'Demoted' : 'Role changed'} from ${previousRole} to ${newRole}`,
      emailSent: isPromotion && !silent,
    });

    // 4. Only send promotion email for actual promotions (going up in rank) and not silent
    if (isPromotion && !silent) {
      // Map role keys to friendly title names for the email
      const ROLE_TITLES: Record<string, string> = {
        sales_agent: 'Agent', manager: 'Manager', system_admin: 'Director', owner: 'Executive',
      };
      const prevTitle = ROLE_TITLES[previousRole] || previousLevel.rows[0]?.hierarchy_title || previousRole;
      const emailNewTitle = ROLE_TITLES[newRole] || newTitle;

      // Lounge access per promotion tier:
      // Agent → Manager: + Manager Lounge
      // Manager → Director: + Director-tier analytics (no Executive, AI, or Admin)
      // Director → Executive: full access
      const roleLoungeMap: Record<string, string[]> = {
        manager: ['Agent Portal', 'CRM Lounge', 'Manager Lounge', 'Onboarding'],
        system_admin: ['Agent Portal', 'CRM Lounge', 'Manager Lounge', 'Director Dashboard', 'Onboarding'],
        owner: ['Executive Lounge', 'Manager Lounge', 'Agent Portal', 'CRM Lounge', 'AI Lounge', 'Admin Panel', 'Marketing', 'Onboarding'],
      };

      try {
        await sendPromotionEmail({
          agentName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Team Member',
          agentEmail: user.email,
          previousTitle: prevTitle,
          newTitle: emailNewTitle,
          newRole,
          newLoungeAccess: roleLoungeMap[newRole] || [],
          loginUrl: `${process.env.APP_URL || 'https://heritagels.org'}/agents/login`,
        });
      } catch (emailErr) {
        console.error("Failed to send promotion email:", emailErr);
      }
    }

    res.json({ success: true, previousRole, newRole, newTitle, isPromotion, silent: !!silent });
  } catch (error: any) {
    console.error("Error promoting member:", error);
    res.status(500).json({ error: "Failed to promote member" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /deactivate — Deactivate a member's account
// ═══════════════════════════════════════════════════════════════════════════════
router.post("/deactivate", async (req: Request, res: Response) => {
  try {
    const { userId, reason } = req.body;
    const performedBy = (req as any).user?.id;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Cannot deactivate yourself
    if (userId === performedBy) {
      return res.status(403).json({ error: "Cannot deactivate your own account" });
    }

    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await storage.updateUser(userId, { isActive: false });

    await storage.createAccessChangeLog({
      targetUserId: userId,
      performedBy,
      actionType: "account_deactivated",
      previousValue: { isActive: true },
      newValue: { isActive: false },
      reason: reason || "Account deactivated by admin",
      emailSent: false,
    });

    res.json({ success: true, message: "Account deactivated" });
  } catch (error: any) {
    console.error("Error deactivating member:", error);
    res.status(500).json({ error: "Failed to deactivate member" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /access-history — Audit trail of all access changes
// ═══════════════════════════════════════════════════════════════════════════════
router.get("/access-history", async (req: Request, res: Response) => {
  try {
    const { userId, actionType, page = '1', limit = '50' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIdx = 1;

    if (userId) {
      whereClause += ` AND acl.target_user_id = $${paramIdx++}`;
      params.push(userId);
    }
    if (actionType && actionType !== 'all') {
      whereClause += ` AND acl.action_type = $${paramIdx++}`;
      params.push(actionType);
    }

    const countResult = await pool.query(
      `SELECT count(*)::int as total FROM access_change_log acl ${whereClause}`,
      params
    );

    const result = await pool.query(`
      SELECT
        acl.*,
        tu.first_name as target_first_name,
        tu.last_name as target_last_name,
        tu.email as target_email,
        pu.first_name as performer_first_name,
        pu.last_name as performer_last_name
      FROM access_change_log acl
      LEFT JOIN users tu ON tu.id = acl.target_user_id
      LEFT JOIN users pu ON pu.id = acl.performed_by
      ${whereClause}
      ORDER BY acl.created_at DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `, [...params, parseInt(limit as string), offset]);

    res.json({
      history: result.rows,
      total: countResult.rows[0]?.total || 0,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });
  } catch (error: any) {
    console.error("Error fetching access history:", error);
    res.status(500).json({ error: "Failed to fetch access history" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /lounge-access/:userId — Get a user's lounge access
// ═══════════════════════════════════════════════════════════════════════════════
router.get("/lounge-access/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const access = await storage.getUserLoungeAccess(userId);
    res.json({ access });
  } catch (error: any) {
    console.error("Error fetching lounge access:", error);
    res.status(500).json({ error: "Failed to fetch lounge access" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /lounge-access/toggle — Toggle lounge access for a user
// ═══════════════════════════════════════════════════════════════════════════════
router.post("/lounge-access/toggle", async (req: Request, res: Response) => {
  try {
    const { userId, loungeKey, granted, silent, notificationType } = req.body;
    const performedBy = (req as any).user?.id;

    if (!userId || !loungeKey || typeof granted !== 'boolean') {
      return res.status(400).json({ error: "userId, loungeKey, and granted are required" });
    }

    await storage.setUserLoungeAccess(userId, loungeKey, granted, performedBy);

    // Fetch user details for notifications
    const targetUser = await storage.getUserById(userId);
    const loungeName = LOUNGE_DISPLAY_NAMES[loungeKey] || loungeKey;
    const changeDesc = granted
      ? `You have been granted access to the ${loungeName}.`
      : `Your access to the ${loungeName} has been revoked.`;

    const isPromotionNotify = notificationType === 'promotion' && granted;
    const isSilent = silent === true;
    console.log(`[LoungeToggle] userId=${userId} key=${loungeKey} granted=${granted} silent=${JSON.stringify(silent)} isSilent=${isSilent} notificationType=${notificationType} isPromo=${isPromotionNotify}`);

    // Log the change (audit trail always recorded)
    await storage.createAccessChangeLog({
      targetUserId: userId,
      performedBy,
      actionType: isPromotionNotify ? "lounge_promoted" : "lounge_access_changed",
      previousValue: { loungeKey, granted: !granted },
      newValue: { loungeKey, granted, silent: isSilent, notificationType: notificationType || 'access' },
      reason: `${granted ? 'Granted' : 'Revoked'} access to ${loungeKey}${isSilent ? ' (silent)' : ''}${isPromotionNotify ? ' (promotion)' : ''}`,
      emailSent: !!targetUser && !isSilent,
    });

    // Only send notifications if not silent
    if (targetUser && !isSilent) {
      // Choose email type based on notificationType
      if (isPromotionNotify) {
        // Send the Heritage promotion email — same format as the promote endpoint
        const ROLE_TITLES: Record<string, string> = {
          sales_agent: 'Agent', manager: 'Manager', system_admin: 'Director', owner: 'Executive',
        };
        const roleLoungeMap: Record<string, string[]> = {
          manager: ['Agent Portal', 'CRM Lounge', 'Manager Lounge', 'Onboarding'],
          system_admin: ['Agent Portal', 'CRM Lounge', 'Manager Lounge', 'Director Dashboard', 'Onboarding'],
          owner: ['Executive Lounge', 'Manager Lounge', 'Agent Portal', 'CRM Lounge', 'AI Lounge', 'Admin Panel', 'Marketing', 'Onboarding'],
        };
        // Derive the "promoted-to" role from the lounge being granted
        const loungeToRole: Record<string, string> = {
          manager_lounge: 'manager',
          executive_lounge: 'owner',
          ai_lounge: 'system_admin',
          admin_panel: 'system_admin',
          marketing_lounge: 'manager',
        };
        const memberName = `${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim() || 'Team Member';
        const currentRole = targetUser.role || 'sales_agent';
        const promotedToRole = loungeToRole[loungeKey] || currentRole;
        const prevTitle = ROLE_TITLES[currentRole] || currentRole;
        const newTitle = ROLE_TITLES[promotedToRole] || promotedToRole;
        try {
          await sendPromotionEmail({
            agentName: memberName,
            agentEmail: targetUser.email,
            previousTitle: prevTitle,
            newTitle,
            newRole: promotedToRole,
            newLoungeAccess: roleLoungeMap[promotedToRole] || [loungeName],
            loginUrl: `${process.env.APP_URL || 'https://heritagels.org'}/agents/login`,
          });
        } catch (emailErr) {
          console.error("Failed to send promotion email for lounge access:", emailErr);
        }
      } else {
        // Send standard access change email
        try {
          await sendAccessChangeEmail({
            memberName: `${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim() || 'Team Member',
            memberEmail: targetUser.email,
            changeDescription: changeDesc,
            reason: `${granted ? 'Granted' : 'Revoked'} by admin`,
            loginUrl: `${process.env.APP_URL || 'https://heritagels.org'}/agents/login`,
          });
        } catch (emailErr) {
          console.error("Failed to send access change email:", emailErr);
        }
      }

      // Create in-app notification
      try {
        await storage.createNotification({
          userId,
          type: isPromotionNotify ? 'promotion' : 'access_change',
          title: isPromotionNotify
            ? `Welcome to the ${loungeName}!`
            : (granted ? 'New Lounge Access' : 'Access Updated'),
          message: isPromotionNotify
            ? `Congratulations! You've been granted access to the ${loungeName}. Log in to explore your new area.`
            : changeDesc,
          actionUrl: granted ? (LOUNGE_PATHS[loungeKey] || '/agents/dashboard') : '/agents/dashboard',
        });
      } catch (notifErr) {
        console.error("Failed to create notification:", notifErr);
      }

      // WebSocket real-time notification
      try {
        const wsServer = req.app.get('wsServer');
        if (wsServer) {
          notifyUser(wsServer, userId, {
            type: 'lounge_access_changed',
            title: isPromotionNotify
              ? `Welcome to the ${loungeName}!`
              : (granted ? 'New Lounge Access' : 'Access Updated'),
            message: isPromotionNotify
              ? `Congratulations! You've been granted access to the ${loungeName}.`
              : changeDesc,
            data: { loungeKey, granted, notificationType: notificationType || 'access' },
          });
        }
      } catch { /* ws not available */ }
    }

    res.json({ success: true, loungeKey, granted, silent: isSilent, notificationType: notificationType || 'access' });
  } catch (error: any) {
    console.error("Error toggling lounge access:", error);
    res.status(500).json({ error: "Failed to toggle lounge access" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /lounge-members/:loungeKey — Get all members with access to a lounge
// ═══════════════════════════════════════════════════════════════════════════════
router.get("/lounge-members/:loungeKey", async (req: Request, res: Response) => {
  try {
    const { loungeKey } = req.params;
    const members = await storage.getLoungeMembers(loungeKey);
    res.json({ members, total: members.length });
  } catch (error: any) {
    console.error("Error fetching lounge members:", error);
    res.status(500).json({ error: "Failed to fetch lounge members" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /member/:userId/onboarding — Full onboarding data for executive drawer
// ═══════════════════════════════════════════════════════════════════════════════
router.get("/member/:userId/onboarding", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const profile = await storage.getFullAgentProfile(userId);

    if (!profile) {
      return res.json({ profile: null });
    }

    // Mask sensitive fields and normalize names for frontend
    const { maskField } = await import("../services/encryptionService");
    const masked = {
      ...profile,
      // Map encrypted fields to _masked names the frontend expects
      ssn_masked: profile.ssn_encrypted ? maskField(profile.ssn_encrypted, 4) : null,
      routing_number_masked: profile.routing_number_encrypted ? maskField(profile.routing_number_encrypted, 4) : null,
      account_number_masked: profile.account_number_encrypted ? maskField(profile.account_number_encrypted, 4) : null,
      // Clean up raw encrypted fields from response
      ssn_encrypted: undefined,
      emergency_contact_ssn_encrypted: undefined,
      routing_number_encrypted: undefined,
      account_number_encrypted: undefined,
    };

    res.json({ profile: masked });
  } catch (error: any) {
    console.error("Error fetching onboarding data:", error);
    res.status(500).json({ error: "Failed to fetch onboarding data" });
  }
});

export default router;
