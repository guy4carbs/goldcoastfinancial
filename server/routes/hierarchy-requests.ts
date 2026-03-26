/**
 * Hierarchy Approval Workflow Routes
 * Multi-step approval system: Agent submits → Manager reviews → Executive approves
 *
 * Endpoints:
 *   POST   /placement              — Agent submits upline placement request
 *   POST   /commission-change      — Agent submits commission increase request
 *   GET    /my-requests            — Agent views their own requests
 *   PUT    /:id/cancel             — Agent cancels a pending request
 *   GET    /pending-manager        — Manager views requests pending their review
 *   PUT    /:id/manager-review     — Manager approves/rejects a request
 *   GET    /pending-executive      — Executive views requests pending final approval
 *   PUT    /:id/executive-review   — Executive approves/rejects a request
 *   PUT    /:id/carrier-update     — Executive marks carrier as updated
 *   GET    /pending-approvals-count — Dashboard badge count
 */

import { Router, Request, Response } from "express";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";
import { hasPermission, Permission, Roles } from "../types/permissions";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get the recursive downline user IDs for a given manager/upline.
 * Returns an array of agent_user_id strings.
 */
async function getDownlineIds(uplineUserId: string): Promise<string[]> {
  const result = await pool.query(
    `
    WITH RECURSIVE downline AS (
      SELECT agent_user_id
      FROM agent_hierarchy
      WHERE direct_upline_id = $1 AND effective_to IS NULL
      UNION ALL
      SELECT ah.agent_user_id
      FROM agent_hierarchy ah
      JOIN downline d ON ah.direct_upline_id = d.agent_user_id
      WHERE ah.effective_to IS NULL
    )
    SELECT agent_user_id FROM downline
    `,
    [uplineUserId]
  );
  return result.rows.map((r: any) => r.agent_user_id);
}

/**
 * Create an in-app notification for a user.
 */
async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  actionUrl?: string
): Promise<void> {
  await pool.query(
    `INSERT INTO notifications (user_id, title, message, type, action_url)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, title, message, type, actionUrl || null]
  );
}

/**
 * Write an entry to the commission audit log.
 */
async function writeAuditLog(
  agentUserId: string,
  action: string,
  previousValue: any,
  newValue: any,
  requestId: string,
  performedBy: string
): Promise<void> {
  await pool.query(
    `INSERT INTO commission_audit_log
       (agent_user_id, action, previous_value, new_value, request_id, performed_by)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      agentUserId,
      action,
      previousValue ? JSON.stringify(previousValue) : null,
      newValue ? JSON.stringify(newValue) : null,
      requestId,
      performedBy,
    ]
  );
}

/**
 * Get the direct upline user ID for a given agent from agent_hierarchy.
 */
async function getDirectUplineId(agentUserId: string): Promise<string | null> {
  const result = await pool.query(
    `SELECT direct_upline_id FROM agent_hierarchy
     WHERE agent_user_id = $1 AND effective_to IS NULL`,
    [agentUserId]
  );
  return result.rows[0]?.direct_upline_id || null;
}

/**
 * Get all users with executive-level permission (owner, system_admin).
 * These are the roles that have HIERARCHY_REQUEST_APPROVE.
 */
async function getExecutiveUserIds(): Promise<string[]> {
  const result = await pool.query(
    `SELECT id FROM users
     WHERE role IN ($1, $2) AND is_active = true`,
    [Roles.OWNER, Roles.SYSTEM_ADMIN]
  );
  return result.rows.map((r: any) => r.id);
}

// =============================================================================
// AGENT ENDPOINTS
// =============================================================================

/**
 * POST /placement
 * Agent submits an upline placement request.
 */
router.post("/placement", async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.id;

    if (!hasPermission(userRole, Permission.HIERARCHY_REQUEST_CREATE)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { requestedUplineId, notes } = req.body;

    if (!requestedUplineId) {
      return res.status(400).json({ error: "requestedUplineId is required" });
    }

    // Validate requested upline exists
    const uplineCheck = await pool.query(
      `SELECT id FROM users WHERE id = $1`,
      [requestedUplineId]
    );
    if (uplineCheck.rows.length === 0) {
      return res.status(400).json({ error: "Requested upline user not found" });
    }

    // Cannot request yourself as upline
    if (requestedUplineId === userId) {
      return res.status(400).json({ error: "Cannot request yourself as upline" });
    }

    // Insert the request
    const result = await pool.query(
      `INSERT INTO hierarchy_requests
         (request_type, requester_id, requested_upline_id, proof_description, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      ["placement", userId, requestedUplineId, notes || null, "pending_manager"]
    );

    const request = result.rows[0];

    // Notify the requested upline (or their manager) about the placement request
    const uplineManagerId = await getDirectUplineId(requestedUplineId);
    const notifyUserId = uplineManagerId || requestedUplineId;

    await createNotification(
      notifyUserId,
      "New Placement Request",
      `An agent has submitted a placement request to join your downline. Please review.`,
      "hierarchy_request",
      "/hierarchy/requests"
    );

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    console.error("Error creating placement request:", error);
    res.status(500).json({ error: "Failed to create placement request" });
  }
});

/**
 * POST /commission-change
 * Agent submits a commission level increase request.
 */
router.post("/commission-change", async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.id;

    if (!hasPermission(userRole, Permission.HIERARCHY_REQUEST_CREATE)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { requestedContractLevel, monthlyApAmount, proofDocumentUrl, proofDescription } =
      req.body;

    if (requestedContractLevel == null || !proofDescription) {
      return res.status(400).json({
        error: "requestedContractLevel and proofDescription are required",
      });
    }

    if (monthlyApAmount == null || monthlyApAmount <= 0) {
      return res.status(400).json({ error: "monthlyApAmount must be a positive number" });
    }

    // Get agent's current contract level
    const hierarchyResult = await pool.query(
      `SELECT contract_level FROM agent_hierarchy
       WHERE agent_user_id = $1 AND effective_to IS NULL`,
      [userId]
    );

    const currentContractLevel = hierarchyResult.rows[0]?.contract_level ?? null;

    if (
      currentContractLevel !== null &&
      parseFloat(requestedContractLevel) <= parseFloat(currentContractLevel)
    ) {
      return res.status(400).json({
        error: "Requested contract level must be higher than current level",
      });
    }

    // Rate limit: no pending commission_change request in last 30 days
    const recentCheck = await pool.query(
      `SELECT id FROM hierarchy_requests
       WHERE requester_id = $1
         AND request_type = 'commission_change'
         AND status NOT IN ('cancelled', 'rejected')
         AND created_at > NOW() - INTERVAL '30 days'
       LIMIT 1`,
      [userId]
    );

    if (recentCheck.rows.length > 0) {
      return res.status(429).json({
        error: "You already have a commission change request within the last 30 days",
      });
    }

    // Insert the request
    const result = await pool.query(
      `INSERT INTO hierarchy_requests
         (request_type, requester_id, current_contract_level, requested_contract_level,
          monthly_ap_amount, proof_document_url, proof_description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        "commission_change",
        userId,
        currentContractLevel,
        requestedContractLevel,
        monthlyApAmount,
        proofDocumentUrl || null,
        proofDescription,
        "pending_manager",
      ]
    );

    const request = result.rows[0];

    // Notify agent's direct upline
    const directUplineId = await getDirectUplineId(userId);
    if (directUplineId) {
      await createNotification(
        directUplineId,
        "Commission Change Request",
        `An agent in your downline has submitted a commission level change request for review.`,
        "hierarchy_request",
        "/hierarchy/requests"
      );
    }

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    console.error("Error creating commission change request:", error);
    res.status(500).json({ error: "Failed to create commission change request" });
  }
});

/**
 * GET /my-requests
 * Agent views their own submitted requests.
 */
router.get("/my-requests", async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.id;

    if (!hasPermission(userRole, Permission.HIERARCHY_REQUEST_CREATE)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const result = await pool.query(
      `SELECT
         hr.*,
         mr.first_name AS manager_reviewer_first_name,
         mr.last_name  AS manager_reviewer_last_name,
         er.first_name AS executive_reviewer_first_name,
         er.last_name  AS executive_reviewer_last_name,
         ru.first_name AS requested_upline_first_name,
         ru.last_name  AS requested_upline_last_name
       FROM hierarchy_requests hr
       LEFT JOIN users mr ON hr.manager_reviewer_id = mr.id
       LEFT JOIN users er ON hr.executive_reviewer_id = er.id
       LEFT JOIN users ru ON hr.requested_upline_id = ru.id
       WHERE hr.requester_id = $1
       ORDER BY hr.created_at DESC`,
      [userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching my requests:", error);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

/**
 * PUT /:id/cancel
 * Agent cancels their own pending request (only if still pending_manager).
 */
router.put("/:id/cancel", async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.id;
    const requestId = req.params.id;

    if (!hasPermission(userRole, Permission.HIERARCHY_REQUEST_CREATE)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Validate request belongs to agent and is still in pending_manager status
    const check = await pool.query(
      `SELECT id, status, requester_id FROM hierarchy_requests WHERE id = $1`,
      [requestId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    const request = check.rows[0];

    if (request.requester_id !== userId) {
      return res.status(403).json({ error: "You can only cancel your own requests" });
    }

    if (request.status !== "pending_manager") {
      return res.status(400).json({
        error: "Only requests in pending_manager status can be cancelled",
      });
    }

    const result = await pool.query(
      `UPDATE hierarchy_requests
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [requestId]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error cancelling request:", error);
    res.status(500).json({ error: "Failed to cancel request" });
  }
});

// =============================================================================
// MANAGER ENDPOINTS
// =============================================================================

/**
 * GET /pending-manager
 * Get all requests pending manager review, scoped to manager's downline.
 */
router.get("/pending-manager", async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.id;

    if (!hasPermission(userRole, Permission.HIERARCHY_REQUEST_REVIEW)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const result = await pool.query(
      `WITH RECURSIVE downline AS (
         SELECT agent_user_id
         FROM agent_hierarchy
         WHERE direct_upline_id = $1 AND effective_to IS NULL
         UNION ALL
         SELECT ah.agent_user_id
         FROM agent_hierarchy ah
         JOIN downline d ON ah.direct_upline_id = d.agent_user_id
         WHERE ah.effective_to IS NULL
       )
       SELECT
         hr.*,
         u.first_name AS requester_first_name,
         u.last_name  AS requester_last_name,
         u.email      AS requester_email,
         ru.first_name AS requested_upline_first_name,
         ru.last_name  AS requested_upline_last_name
       FROM hierarchy_requests hr
       JOIN downline d ON hr.requester_id = d.agent_user_id
       JOIN users u ON hr.requester_id = u.id
       LEFT JOIN users ru ON hr.requested_upline_id = ru.id
       WHERE hr.status = 'pending_manager'
       ORDER BY hr.created_at ASC`,
      [userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching pending manager requests:", error);
    res.status(500).json({ error: "Failed to fetch pending requests" });
  }
});

/**
 * PUT /:id/manager-review
 * Manager approves or rejects a request.
 */
router.put("/:id/manager-review", async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.id;
    const requestId = req.params.id;

    if (!hasPermission(userRole, Permission.HIERARCHY_REQUEST_REVIEW)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { status, notes, recommendedLevel } = req.body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "status must be 'approved' or 'rejected'" });
    }

    if (!notes || typeof notes !== "string" || notes.trim().length === 0) {
      return res.status(400).json({ error: "notes are required" });
    }

    // Fetch the request
    const requestCheck = await pool.query(
      `SELECT * FROM hierarchy_requests WHERE id = $1`,
      [requestId]
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    const request = requestCheck.rows[0];

    if (request.status !== "pending_manager") {
      return res.status(400).json({ error: "Request is not pending manager review" });
    }

    // No self-approval
    if (request.requester_id === userId) {
      return res.status(403).json({ error: "You cannot review your own request" });
    }

    // Validate requester is in manager's downline
    const downlineIds = await getDownlineIds(userId);
    if (!downlineIds.includes(request.requester_id)) {
      return res.status(403).json({ error: "Requester is not in your downline" });
    }

    if (status === "approved") {
      // Approve: move to pending_executive
      const result = await pool.query(
        `UPDATE hierarchy_requests
         SET manager_reviewer_id = $1,
             manager_status = 'approved',
             manager_notes = $2,
             manager_recommended_level = $3,
             manager_reviewed_at = NOW(),
             status = 'pending_executive',
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [userId, notes, recommendedLevel || null, requestId]
      );

      // Notify all executives
      const executiveIds = await getExecutiveUserIds();
      for (const execId of executiveIds) {
        await createNotification(
          execId,
          "Request Pending Executive Review",
          `A hierarchy request has been approved by a manager and is awaiting your final review.`,
          "hierarchy_request",
          "/hierarchy/requests"
        );
      }

      // Write audit log
      await writeAuditLog(
        request.requester_id,
        "manager_approved_request",
        { status: "pending_manager" },
        { status: "pending_executive", manager_notes: notes, recommended_level: recommendedLevel },
        requestId,
        userId
      );

      res.json({ success: true, data: result.rows[0] });
    } else {
      // Reject
      const result = await pool.query(
        `UPDATE hierarchy_requests
         SET manager_reviewer_id = $1,
             manager_status = 'rejected',
             manager_notes = $2,
             manager_reviewed_at = NOW(),
             status = 'rejected',
             updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [userId, notes, requestId]
      );

      // Notify requester of rejection
      await createNotification(
        request.requester_id,
        "Request Rejected",
        `Your hierarchy request has been rejected by your manager. Reason: ${notes}`,
        "hierarchy_request",
        "/hierarchy/requests"
      );

      // Write audit log
      await writeAuditLog(
        request.requester_id,
        "manager_rejected_request",
        { status: "pending_manager" },
        { status: "rejected", manager_notes: notes },
        requestId,
        userId
      );

      res.json({ success: true, data: result.rows[0] });
    }
  } catch (error) {
    console.error("Error processing manager review:", error);
    res.status(500).json({ error: "Failed to process manager review" });
  }
});

// =============================================================================
// EXECUTIVE ENDPOINTS
// =============================================================================

/**
 * GET /pending-executive
 * Get all requests pending executive approval.
 */
router.get("/pending-executive", async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;

    if (!hasPermission(userRole, Permission.HIERARCHY_REQUEST_APPROVE)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const result = await pool.query(
      `SELECT
         hr.*,
         u.first_name  AS requester_first_name,
         u.last_name   AS requester_last_name,
         u.email       AS requester_email,
         mr.first_name AS manager_reviewer_first_name,
         mr.last_name  AS manager_reviewer_last_name,
         ru.first_name AS requested_upline_first_name,
         ru.last_name  AS requested_upline_last_name
       FROM hierarchy_requests hr
       JOIN users u  ON hr.requester_id = u.id
       LEFT JOIN users mr ON hr.manager_reviewer_id = mr.id
       LEFT JOIN users ru ON hr.requested_upline_id = ru.id
       WHERE hr.status = 'pending_executive'
       ORDER BY hr.created_at ASC`
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching pending executive requests:", error);
    res.status(500).json({ error: "Failed to fetch pending requests" });
  }
});

/**
 * PUT /:id/executive-review
 * Executive approves or rejects a request, applying hierarchy changes on approval.
 */
router.put("/:id/executive-review", async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.id;
    const requestId = req.params.id;

    if (!hasPermission(userRole, Permission.HIERARCHY_REQUEST_APPROVE)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { status, notes, finalContractLevel, finalUplineId } = req.body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "status must be 'approved' or 'rejected'" });
    }

    if (!notes || typeof notes !== "string" || notes.trim().length === 0) {
      return res.status(400).json({ error: "notes are required" });
    }

    // Fetch the request
    const requestCheck = await pool.query(
      `SELECT * FROM hierarchy_requests WHERE id = $1`,
      [requestId]
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    const request = requestCheck.rows[0];

    if (request.status !== "pending_executive") {
      return res.status(400).json({ error: "Request is not pending executive review" });
    }

    if (status === "rejected") {
      // Reject the request
      const result = await pool.query(
        `UPDATE hierarchy_requests
         SET executive_reviewer_id = $1,
             executive_status = 'rejected',
             executive_notes = $2,
             executive_reviewed_at = NOW(),
             status = 'rejected',
             updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [userId, notes, requestId]
      );

      // Notify agent and manager
      await createNotification(
        request.requester_id,
        "Request Rejected by Executive",
        `Your hierarchy request has been rejected. Reason: ${notes}`,
        "hierarchy_request",
        "/hierarchy/requests"
      );

      if (request.manager_reviewer_id) {
        await createNotification(
          request.manager_reviewer_id,
          "Request Rejected by Executive",
          `A hierarchy request you approved has been rejected by an executive. Reason: ${notes}`,
          "hierarchy_request",
          "/hierarchy/requests"
        );
      }

      // Write audit log
      await writeAuditLog(
        request.requester_id,
        "executive_rejected_request",
        { status: "pending_executive" },
        { status: "rejected", executive_notes: notes },
        requestId,
        userId
      );

      return res.json({ success: true, data: result.rows[0] });
    }

    // ---- APPROVED ----
    const agentUserId = request.requester_id;

    // Get the agent's current hierarchy record
    const currentHierarchy = await pool.query(
      `SELECT * FROM agent_hierarchy WHERE agent_user_id = $1 AND effective_to IS NULL`,
      [agentUserId]
    );

    const currentRecord = currentHierarchy.rows[0] || null;

    if (request.request_type === "placement") {
      // Determine final upline: executive override or the originally requested upline
      const effectiveUplineId = finalUplineId || request.requested_upline_id;

      // Build the upline chain from the target upline
      let uplineChain: string[] = [];
      if (effectiveUplineId) {
        const uplineResult = await pool.query(
          `SELECT upline_chain FROM agent_hierarchy
           WHERE agent_user_id = $1 AND effective_to IS NULL`,
          [effectiveUplineId]
        );
        const parentChain = uplineResult.rows[0]?.upline_chain || [];
        uplineChain = [effectiveUplineId, ...parentChain];
      }

      // Determine contract level: executive override, manager recommendation, or existing
      const effectiveContractLevel =
        finalContractLevel ??
        request.manager_recommended_level ??
        currentRecord?.contract_level ??
        null;

      // Close the old hierarchy record if one exists
      if (currentRecord) {
        await pool.query(
          `UPDATE agent_hierarchy
           SET effective_to = NOW(), updated_at = NOW()
           WHERE agent_user_id = $1 AND effective_to IS NULL`,
          [agentUserId]
        );
      }

      // Insert new hierarchy record with the approved upline
      await pool.query(
        `INSERT INTO agent_hierarchy
           (agent_user_id, direct_upline_id, upline_chain, contract_level,
            hierarchy_level, hierarchy_title, override_eligible, override_percentage)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          agentUserId,
          effectiveUplineId,
          JSON.stringify(uplineChain),
          effectiveContractLevel,
          currentRecord?.hierarchy_level ?? 1,
          currentRecord?.hierarchy_title ?? "Agent",
          currentRecord?.override_eligible ?? false,
          currentRecord?.override_percentage ?? null,
        ]
      );

      // Update the request record
      const result = await pool.query(
        `UPDATE hierarchy_requests
         SET executive_reviewer_id = $1,
             executive_status = 'approved',
             executive_notes = $2,
             executive_final_level = $3,
             executive_final_upline_id = $4,
             executive_reviewed_at = NOW(),
             status = 'approved',
             updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [userId, notes, effectiveContractLevel, effectiveUplineId, requestId]
      );

      // Write audit log
      await writeAuditLog(
        agentUserId,
        "executive_approved_placement",
        {
          direct_upline_id: currentRecord?.direct_upline_id || null,
          contract_level: currentRecord?.contract_level || null,
        },
        {
          direct_upline_id: effectiveUplineId,
          contract_level: effectiveContractLevel,
          upline_chain: uplineChain,
        },
        requestId,
        userId
      );

      // Notify agent and manager
      await createNotification(
        agentUserId,
        "Placement Request Approved",
        `Your placement request has been approved by an executive. Your hierarchy has been updated.`,
        "hierarchy_request",
        "/hierarchy"
      );

      if (request.manager_reviewer_id) {
        await createNotification(
          request.manager_reviewer_id,
          "Placement Request Approved",
          `A placement request you reviewed has been approved by an executive.`,
          "hierarchy_request",
          "/hierarchy/requests"
        );
      }

      return res.json({ success: true, data: result.rows[0] });
    }

    if (request.request_type === "commission_change") {
      // Determine final contract level: executive override, manager recommendation, or requested
      const effectiveContractLevel =
        finalContractLevel ??
        request.manager_recommended_level ??
        request.requested_contract_level;

      // Close old hierarchy record
      if (currentRecord) {
        await pool.query(
          `UPDATE agent_hierarchy
           SET effective_to = NOW(), updated_at = NOW()
           WHERE agent_user_id = $1 AND effective_to IS NULL`,
          [agentUserId]
        );
      }

      // Insert new hierarchy record with updated contract level
      await pool.query(
        `INSERT INTO agent_hierarchy
           (agent_user_id, direct_upline_id, upline_chain, contract_level,
            hierarchy_level, hierarchy_title, override_eligible, override_percentage)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          agentUserId,
          currentRecord?.direct_upline_id ?? null,
          currentRecord?.upline_chain ? JSON.stringify(currentRecord.upline_chain) : "[]",
          effectiveContractLevel,
          currentRecord?.hierarchy_level ?? 1,
          currentRecord?.hierarchy_title ?? "Agent",
          currentRecord?.override_eligible ?? false,
          currentRecord?.override_percentage ?? null,
        ]
      );

      // Update the request record
      const result = await pool.query(
        `UPDATE hierarchy_requests
         SET executive_reviewer_id = $1,
             executive_status = 'approved',
             executive_notes = $2,
             executive_final_level = $3,
             executive_reviewed_at = NOW(),
             status = 'approved',
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [userId, notes, effectiveContractLevel, requestId]
      );

      // Write audit log
      await writeAuditLog(
        agentUserId,
        "executive_approved_commission_change",
        {
          contract_level: currentRecord?.contract_level || request.current_contract_level,
        },
        {
          contract_level: effectiveContractLevel,
          monthly_ap_amount: request.monthly_ap_amount,
        },
        requestId,
        userId
      );

      // Notify agent and manager
      await createNotification(
        agentUserId,
        "Commission Change Approved",
        `Your commission level change request has been approved. Your new contract level is ${effectiveContractLevel}%.`,
        "hierarchy_request",
        "/hierarchy"
      );

      if (request.manager_reviewer_id) {
        await createNotification(
          request.manager_reviewer_id,
          "Commission Change Approved",
          `A commission change request you reviewed has been approved by an executive.`,
          "hierarchy_request",
          "/hierarchy/requests"
        );
      }

      return res.json({ success: true, data: result.rows[0] });
    }

    // Unknown request type — should not happen
    return res.status(400).json({ error: "Unknown request type" });
  } catch (error) {
    console.error("Error processing executive review:", error);
    res.status(500).json({ error: "Failed to process executive review" });
  }
});

/**
 * PUT /:id/carrier-update
 * Executive marks a request's carrier as updated.
 */
router.put("/:id/carrier-update", async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const requestId = req.params.id;

    if (!hasPermission(userRole, Permission.HIERARCHY_REQUEST_APPROVE)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { notes } = req.body;

    // Validate the request exists and is approved
    const check = await pool.query(
      `SELECT id, status FROM hierarchy_requests WHERE id = $1`,
      [requestId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (check.rows[0].status !== "approved") {
      return res.status(400).json({ error: "Only approved requests can have carrier updates" });
    }

    const result = await pool.query(
      `UPDATE hierarchy_requests
       SET carrier_updated = true,
           carrier_update_notes = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [notes || null, requestId]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error updating carrier status:", error);
    res.status(500).json({ error: "Failed to update carrier status" });
  }
});

// =============================================================================
// SHARED / DASHBOARD ENDPOINTS
// =============================================================================

/**
 * GET /pending-approvals-count
 * Returns a count of pending requests for the current user's role (dashboard badge).
 */
router.get("/pending-approvals-count", async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.id;

    // Executive: count pending_executive
    if (hasPermission(userRole, Permission.HIERARCHY_REQUEST_APPROVE)) {
      const result = await pool.query(
        `SELECT COUNT(*)::int AS count FROM hierarchy_requests WHERE status = 'pending_executive'`
      );
      return res.json({ success: true, count: result.rows[0].count });
    }

    // Manager: count pending_manager scoped to downline
    if (hasPermission(userRole, Permission.HIERARCHY_REQUEST_REVIEW)) {
      const result = await pool.query(
        `WITH RECURSIVE downline AS (
           SELECT agent_user_id
           FROM agent_hierarchy
           WHERE direct_upline_id = $1 AND effective_to IS NULL
           UNION ALL
           SELECT ah.agent_user_id
           FROM agent_hierarchy ah
           JOIN downline d ON ah.direct_upline_id = d.agent_user_id
           WHERE ah.effective_to IS NULL
         )
         SELECT COUNT(*)::int AS count
         FROM hierarchy_requests hr
         JOIN downline d ON hr.requester_id = d.agent_user_id
         WHERE hr.status = 'pending_manager'`,
        [userId]
      );
      return res.json({ success: true, count: result.rows[0].count });
    }

    // Agents and others: no pending review count needed
    return res.json({ success: true, count: 0 });
  } catch (error) {
    console.error("Error fetching pending approvals count:", error);
    res.status(500).json({ error: "Failed to fetch pending approvals count" });
  }
});

export default router;
