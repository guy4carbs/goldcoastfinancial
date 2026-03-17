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
} from "../gmail";

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

    let whereClause = "WHERE u.role NOT IN ('client')";
    const params: any[] = [];
    let paramIdx = 1;

    if (role && role !== 'all') {
      whereClause += ` AND u.role = $${paramIdx++}`;
      params.push(role);
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

    const result = await pool.query(`
      SELECT
        u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.is_active,
        u.avatar_url, u.last_login_at, u.created_at,
        ap.approval_status, ap.is_licensed, ap.years_experience,
        ah.hierarchy_level, ah.hierarchy_title, ah.direct_upline_id
      FROM users u
      LEFT JOIN agent_profiles ap ON ap.user_id = u.id::text
      LEFT JOIN agent_hierarchy ah ON ah.agent_user_id = u.id
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
    const { userId, newRole, newHierarchyLevel, reason } = req.body;
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
    const previousLevel = await pool.query(
      `SELECT hierarchy_level, hierarchy_title FROM agent_hierarchy WHERE agent_user_id = $1`,
      [userId]
    );

    // 1. Update user role
    await storage.updateUser(userId, { role: newRole });

    // 2. Update hierarchy if level provided
    if (newHierarchyLevel !== undefined) {
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
    await storage.createAccessChangeLog({
      targetUserId: userId,
      performedBy,
      actionType: "promoted",
      previousValue: {
        role: previousRole,
        hierarchyLevel: previousLevel.rows[0]?.hierarchy_level,
        hierarchyTitle: previousLevel.rows[0]?.hierarchy_title,
      },
      newValue: {
        role: newRole,
        hierarchyLevel: newHierarchyLevel,
        hierarchyTitle: HIERARCHY_TITLES[newHierarchyLevel] || newRole,
      },
      reason: reason || `Promoted from ${previousRole} to ${newRole}`,
      emailSent: true,
    });

    // 4. Send promotion email
    const prevTitle = previousLevel.rows[0]?.hierarchy_title || previousRole;
    const newTitle = HIERARCHY_TITLES[newHierarchyLevel] || newRole;

    // Determine which lounges the new role gets access to
    const roleLoungeMap: Record<string, string[]> = {
      owner: ['Executive Lounge', 'Manager Lounge', 'Agent Portal', 'CRM', 'AI Lounge', 'Admin Panel'],
      system_admin: ['Executive Lounge', 'Manager Lounge', 'Agent Portal', 'CRM', 'AI Lounge', 'Admin Panel'],
      manager: ['Manager Lounge', 'Agent Portal', 'CRM'],
      sales_agent: ['Agent Portal', 'CRM'],
      marketing_staff: ['Marketing', 'CRM'],
      investor: ['Executive Lounge'],
    };

    try {
      await sendPromotionEmail({
        agentName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Team Member',
        agentEmail: user.email,
        previousTitle: prevTitle,
        newTitle,
        newRole,
        newLoungeAccess: roleLoungeMap[newRole] || [],
        loginUrl: `${process.env.APP_URL || 'https://heritagels.org'}/agents/login`,
      });
    } catch (emailErr) {
      console.error("Failed to send promotion email:", emailErr);
    }

    res.json({ success: true, previousRole, newRole, newTitle });
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
    const { userId, loungeKey, granted } = req.body;
    const performedBy = (req as any).user?.id;

    if (!userId || !loungeKey || typeof granted !== 'boolean') {
      return res.status(400).json({ error: "userId, loungeKey, and granted are required" });
    }

    await storage.setUserLoungeAccess(userId, loungeKey, granted, performedBy);

    // Log the change
    await storage.createAccessChangeLog({
      targetUserId: userId,
      performedBy,
      actionType: "lounge_access_changed",
      previousValue: { loungeKey, granted: !granted },
      newValue: { loungeKey, granted },
      reason: `${granted ? 'Granted' : 'Revoked'} access to ${loungeKey}`,
      emailSent: false,
    });

    res.json({ success: true, loungeKey, granted });
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

    // Mask sensitive fields before returning
    const { maskField } = await import("../services/encryptionService");
    const masked = {
      ...profile,
      ssn_encrypted: profile.ssn_encrypted ? maskField(profile.ssn_encrypted, 4) : null,
      emergency_contact_ssn_encrypted: profile.emergency_contact_ssn_encrypted ? maskField(profile.emergency_contact_ssn_encrypted, 4) : null,
      routing_number_encrypted: profile.routing_number_encrypted ? maskField(profile.routing_number_encrypted, 4) : null,
      account_number_encrypted: profile.account_number_encrypted ? maskField(profile.account_number_encrypted, 4) : null,
    };

    res.json({ profile: masked });
  } catch (error: any) {
    console.error("Error fetching onboarding data:", error);
    res.status(500).json({ error: "Failed to fetch onboarding data" });
  }
});

export default router;
