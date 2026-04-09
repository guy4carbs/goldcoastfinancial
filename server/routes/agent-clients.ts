/**
 * Agent-Side Client Management API Routes
 * Handles agent management of client portal data: policies, documents, billing, claims
 *
 * Authorization: Agents can only manage clients assigned to them.
 * Managers/Owners/SystemAdmins bypass the assignment check.
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { pool } from "../db";
import { requireAuth, type AuthenticatedUser } from "../middleware/auth";
import { Roles } from "../types/permissions";
import multer from "multer";
import * as s3Service from "../services/s3Service";
import { recordCommissions } from "../services/commissionRecordService";

const router = Router();

// File upload configuration (memory storage for S3 upload)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// ============================================
// AUTHORIZATION HELPER
// ============================================

/**
 * Middleware that verifies the authenticated user is assigned to the client,
 * or has an elevated role (owner, system_admin, manager) that bypasses the check.
 */
async function requireClientAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user! as AuthenticatedUser;
    const clientId = req.params.clientId;

    if (!clientId) {
      return res.status(400).json({ error: "Client ID is required" });
    }

    // Elevated roles bypass assignment check
    const bypassRoles = [Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER];
    if (bypassRoles.includes(user.role as any)) {
      return next();
    }

    // For agents: verify assignment
    const isAssigned = await storage.isAgentAssignedToClient(user.id, clientId);
    if (!isAssigned) {
      return res.status(403).json({ error: "You are not assigned to this client" });
    }

    next();
  } catch (error: any) {
    console.error("[AgentClients] Assignment check failed:", error);
    res.status(500).json({ error: "Failed to verify client assignment" });
  }
}

// ============================================
// GET /api/agent-clients — List all clients assigned to this agent
// ============================================

router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user! as AuthenticatedUser;

    let clients;
    const bypassRoles = [Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER];

    if (bypassRoles.includes(user.role as any)) {
      // Managers/Owners see clients assigned to them, or all if none assigned
      const assigned = await storage.getClientsByAgentId(user.id);
      if (assigned.length > 0) {
        clients = assigned;
      } else {
        clients = [];
      }
    } else {
      // Agents see only their assigned clients
      clients = await storage.getClientsByAgentId(user.id);
    }

    // Enrich with policy count and normalize field names
    const enriched = await Promise.all(
      clients.map(async (client: any) => {
        const policies = await storage.getPoliciesByUserId(client.id);
        // Normalize snake_case (raw SQL) to camelCase for consistent frontend consumption
        return {
          id: client.id,
          email: client.email,
          firstName: client.firstName || client.first_name,
          lastName: client.lastName || client.last_name,
          phone: client.phone,
          role: client.role,
          isActive: client.isActive ?? client.is_active,
          avatarUrl: client.avatarUrl || client.avatar_url,
          timezone: client.timezone,
          createdAt: client.createdAt || client.created_at,
          updatedAt: client.updatedAt || client.updated_at,
          lastLoginAt: client.lastLoginAt || client.last_login_at,
          assignedAgentId: client.assignedAgentId || client.assigned_agent_id,
          onboardingStatus: client.onboardingStatus || client.onboarding_status || 'pending',
          convertedFromLeadId: client.convertedFromLeadId || client.converted_from_lead_id,
          policyCount: policies.length,
          activePolicies: policies.filter((p: any) => p.status === "active").length,
        };
      })
    );

    res.json(enriched);
  } catch (error: any) {
    console.error("[AgentClients] Failed to fetch clients:", error);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

// ============================================
// PATCH /api/agent-clients/:clientId — Update client profile info
// ============================================

router.patch("/:clientId", requireAuth, requireClientAssignment, async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { firstName, lastName, email, phone } = req.body;

    const updateData: Record<string, any> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const updated = await storage.updateUser(clientId, updateData);
    if (!updated) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json({
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      phone: updated.phone,
    });
  } catch (error: any) {
    console.error("[AgentClients] Error updating client:", error?.message);
    res.status(500).json({ error: "Failed to update client" });
  }
});

// ============================================
// POST /api/agent-clients/:clientId/resend-welcome — Resend welcome/login email
// ============================================

router.post("/:clientId/resend-welcome", requireAuth, requireClientAssignment, async (req: Request, res: Response) => {
  try {
    const sessionAgent = req.user! as AuthenticatedUser;
    const { clientId } = req.params;

    const client = await storage.getUserById(clientId);
    if (!client) return res.status(404).json({ error: "Client not found" });

    if (client.email?.includes('@placeholder.')) {
      return res.status(400).json({ error: "Client has no real email address. Update their email first." });
    }

    // Fetch full agent record for phone number
    const agentFull = await storage.getUserById(sessionAgent.id);

    // Generate new temp password
    const bcrypt = await import("bcryptjs");
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let tempPassword = 'HLS-';
    for (let i = 0; i < 6; i++) tempPassword += chars[Math.floor(Math.random() * chars.length)];

    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    await storage.updateUser(clientId, { password: hashedPassword });

    // Send branded welcome email
    const { sendPostCloseWelcomeEmail } = await import("../gmail");
    await sendPostCloseWelcomeEmail({
      clientFirstName: client.firstName || 'Valued Client',
      clientEmail: client.email,
      coverageType: 'life insurance',
      agentName: `${sessionAgent.firstName || ''} ${sessionAgent.lastName || ''}`.trim() || 'Your Agent',
      agentEmail: sessionAgent.email || '',
      agentPhone: agentFull?.phone || undefined,
      portalUrl: process.env.APP_URL || 'https://heritagels.org',
      tempPassword,
    });

    // Create notification for audit trail
    await storage.createNotification({
      userId: clientId,
      title: 'Login Email Resent',
      message: 'A new login email with temporary credentials has been sent to your email.',
      type: 'alert',
      isRead: false,
      actionUrl: '/client/login',
    });

    res.json({ success: true, message: 'Welcome email resent with new login credentials' });
  } catch (error: any) {
    console.error("[AgentClients] Error resending welcome:", error?.message);
    res.status(500).json({ error: "Failed to resend welcome email" });
  }
});

// ============================================
// GET /api/agent-clients/:clientId — Full client detail
// ============================================

router.get("/:clientId", requireAuth, requireClientAssignment, async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    const client = await storage.getUserById(clientId);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Fetch all client data in parallel (billing uses raw SQL to include extended columns)
    const [policies, documents, billingResult, claims] = await Promise.all([
      storage.getPoliciesByUserId(clientId),
      storage.getDocumentsByUserId(clientId),
      pool.query(`
        SELECT id, user_id, policy_id, amount::float, status, payment_date, payment_method,
               bank_name, routing_number, account_number, billing_type, description, due_date, created_at
        FROM billing_history WHERE user_id = $1 ORDER BY created_at DESC
      `, [clientId]),
      storage.getClaimsByClientId(clientId),
    ]);
    // Decrypt routing/account numbers for display
    let billing = billingResult.rows;
    try {
      const { decryptField, isEncrypted } = await import('../services/encryptionService');
      billing = billing.map((b: any) => ({
        ...b,
        routing_number: b.routing_number && isEncrypted(b.routing_number) ? decryptField(b.routing_number) : b.routing_number,
        account_number: b.account_number && isEncrypted(b.account_number) ? decryptField(b.account_number) : b.account_number,
      }));
    } catch {}

    const { password, twoFactorSecret, ...safeClient } = client;

    res.json({
      client: safeClient,
      policies,
      documents,
      billing,
      claims,
    });
  } catch (error: any) {
    console.error("[AgentClients] Failed to fetch client detail:", error);
    res.status(500).json({ error: "Failed to fetch client detail" });
  }
});

// ============================================
// POST /api/agent-clients/:clientId/policies — Create a policy for a client
// ============================================

router.post("/:clientId/policies", requireAuth, requireClientAssignment, async (req: Request, res: Response) => {
  try {
    const agent = req.user! as AuthenticatedUser;
    const { clientId } = req.params;

    const {
      type,
      policyNumber,
      carrier,
      status,
      coverageAmount,
      monthlyPremium,
      startDate,
      nextPaymentDate,
      beneficiaryName,
      beneficiaryRelationship,
    } = req.body;

    // Validate required fields
    if (!type || !coverageAmount || !monthlyPremium || !startDate) {
      return res.status(400).json({
        error: "Missing required fields: type, coverageAmount, monthlyPremium, startDate",
      });
    }

    // Auto-generate policy number if not provided
    const generatedPolicyNumber = policyNumber || `HLS-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

    const policy = await storage.createPolicy({
      userId: clientId,
      policyNumber: generatedPolicyNumber,
      type,
      carrier: carrier || null,
      status: status || "pending_setup",
      coverageAmount: Number(coverageAmount),
      monthlyPremium: String(monthlyPremium),
      startDate: new Date(startDate),
      nextPaymentDate: nextPaymentDate ? new Date(nextPaymentDate) : null,
      beneficiaryName: beneficiaryName || null,
      beneficiaryRelationship: beneficiaryRelationship || null,
      agentId: agent.id,
      leadId: null,
    });

    // Send notification to client
    try {
      await storage.createNotification({
        userId: clientId,
        title: "New Policy Added",
        message: `A new ${type} policy (${generatedPolicyNumber}) has been added to your account.`,
        type: "policy_update",
        isRead: false,
        actionUrl: "/client/policies",
      });
    } catch (notifErr) {
      console.error("[AgentClients] Notification delivery failed:", notifErr);
    }

    console.log(`[AgentClients] Policy created: ${generatedPolicyNumber} for client ${clientId} by agent ${agent.id}`);

    // Calculate and record waterfall commissions
    const annualPremium = Number(monthlyPremium) * 12;
    if (annualPremium > 0) {
      recordCommissions(policy.id, agent.id, annualPremium).catch((err) =>
        console.error("[AgentClients] Commission recording failed:", err)
      );
    }

    res.status(201).json(policy);
  } catch (error: any) {
    console.error("[AgentClients] Failed to create policy:", error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "A policy with this number already exists" });
    }
    res.status(500).json({ error: "Failed to create policy" });
  }
});

// ============================================
// PUT /api/agent-clients/:clientId/policies/:policyId — Update a client's policy
// ============================================

router.put("/:clientId/policies/:policyId", requireAuth, requireClientAssignment, async (req: Request, res: Response) => {
  try {
    const { clientId, policyId } = req.params;

    // Verify policy belongs to client
    const existingPolicy = await storage.getPolicyById(policyId);
    if (!existingPolicy) {
      return res.status(404).json({ error: "Policy not found" });
    }
    if (existingPolicy.userId !== clientId) {
      return res.status(403).json({ error: "Policy does not belong to this client" });
    }

    const updateData: Record<string, any> = {};
    const allowedFields = [
      "type", "carrier", "status", "coverageAmount", "monthlyPremium",
      "startDate", "nextPaymentDate", "beneficiaryName", "beneficiaryRelationship",
      "policyNumber", "beneficiaries",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === "startDate" || field === "nextPaymentDate") {
          updateData[field] = req.body[field] ? new Date(req.body[field]) : null;
        } else if (field === "coverageAmount") {
          updateData[field] = Number(req.body[field]);
        } else if (field === "monthlyPremium") {
          updateData[field] = String(req.body[field]);
        } else if (field === "beneficiaries") {
          updateData[field] = Array.isArray(req.body[field]) ? req.body[field] : [];
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const updated = await storage.updatePolicy(policyId, updateData);

    // If status changed to "active", notify client
    if (req.body.status === "active" && existingPolicy.status !== "active") {
      try {
        await storage.createNotification({
          userId: clientId,
          title: "Policy Activated",
          message: `Your ${existingPolicy.type} policy (${existingPolicy.policyNumber}) is now active.`,
          type: "policy_update",
          isRead: false,
          actionUrl: "/client/policies",
        });
      } catch (notifErr) {
        console.error("[AgentClients] Notification delivery failed:", notifErr);
      }
    }

    console.log(`[AgentClients] Policy updated: ${policyId} for client ${clientId}`);

    // Recalculate commissions if premium changed
    if (updateData.monthlyPremium && updated) {
      const agentId = (updated as any).agentId || (existingPolicy as any).agent_id;
      const annualPremium = Number(updateData.monthlyPremium) * 12;
      if (agentId && annualPremium > 0) {
        recordCommissions(policyId, agentId, annualPremium).catch((err) =>
          console.error("[AgentClients] Commission recalculation failed:", err)
        );
      }
    }

    res.json(updated);
  } catch (error: any) {
    console.error("[AgentClients] Failed to update policy:", error);
    res.status(500).json({ error: "Failed to update policy" });
  }
});

// ============================================
// POST /api/agent-clients/:clientId/documents — Upload a document for a client
// ============================================

router.post(
  "/:clientId/documents",
  requireAuth,
  requireClientAssignment,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const agent = req.user! as AuthenticatedUser;
      const { clientId } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { name, category, policyId } = req.body;

      if (!name || !category) {
        return res.status(400).json({ error: "Missing required fields: name, category" });
      }

      // Validate file type
      const validation = s3Service.validateFile(file.originalname, file.mimetype, file.size);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      // Upload to S3
      const uploadResult = await s3Service.uploadFile(
        clientId,
        file.originalname,
        file.buffer,
        {
          contentType: file.mimetype,
          metadata: {
            uploadedBy: agent.id,
            category,
            clientId,
          },
        },
        "client-documents"
      );

      if (!uploadResult.success) {
        return res.status(500).json({ error: uploadResult.error || "Failed to upload file to storage" });
      }

      // Create document record in DB
      const document = await storage.createDocument({
        userId: clientId,
        policyId: policyId || null,
        name,
        type: file.mimetype,
        category,
        fileSize: String(file.size),
        s3Key: uploadResult.key || null,
        uploadedBy: agent.id,
      });

      // Send notification to client
      try {
        await storage.createNotification({
          userId: clientId,
          title: "New Document Available",
          message: `A new document "${name}" has been added to your account.`,
          type: "document_upload",
          isRead: false,
          actionUrl: "/client/documents",
        });
      } catch (notifErr) {
        console.error("[AgentClients] Notification delivery failed:", notifErr);
      }

      console.log(`[AgentClients] Document uploaded: ${document.id} for client ${clientId} by agent ${agent.id}`);
      res.status(201).json({ ...document, url: uploadResult.url || document.s3Key });
    } catch (error: any) {
      console.error("[AgentClients] Failed to upload document:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  }
);

// ============================================
// GET /api/agent-clients/:clientId/documents — List documents for a client
// ============================================

router.get("/:clientId/documents", requireAuth, requireClientAssignment, async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const docs = await storage.getDocumentsByUserId(clientId);
    res.json(docs || []);
  } catch (error: any) {
    console.error("[AgentClients] Error fetching documents:", error?.message);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// ============================================
// GET /api/agent-clients/:clientId/documents/:docId/download — Get signed S3 download URL
// ============================================

router.get("/:clientId/documents/:docId/download", requireAuth, requireClientAssignment, async (req: Request, res: Response) => {
  try {
    const { clientId, docId } = req.params;

    // Fetch document and verify it belongs to client
    const documents = await storage.getDocumentsByUserId(clientId);
    const document = documents.find((d: any) => d.id === docId);

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    if (!document.s3Key) {
      return res.status(404).json({ error: "Document has no associated file in storage" });
    }

    const signedUrl = await s3Service.getSignedDownloadUrl(document.s3Key);
    if (!signedUrl.success) {
      return res.status(500).json({ error: signedUrl.error || "Failed to generate download URL" });
    }

    // Redirect to the actual file URL
    res.redirect(signedUrl.url!);
  } catch (error: any) {
    console.error("[AgentClients] Failed to get download URL:", error);
    res.status(500).json({ error: "Failed to get download URL" });
  }
});

// ============================================
// POST /api/agent-clients/:clientId/billing — Create a billing record
// ============================================

router.post("/:clientId/billing", requireAuth, requireClientAssignment, async (req: Request, res: Response) => {
  try {
    const agent = req.user! as AuthenticatedUser;
    const { clientId } = req.params;

    const {
      policyId, amount, status, paymentDate, paymentMethod, transactionId,
      bankName, routingNumber, accountNumber, billingType, description, dueDate
    } = req.body;

    if (!amount || !status || !paymentDate) {
      return res.status(400).json({
        error: "Missing required fields: amount, status, paymentDate",
      });
    }

    // Encrypt sensitive bank fields before storage
    const { encryptField } = await import('../services/encryptionService');
    const encryptedRouting = routingNumber ? encryptField(routingNumber) : null;
    const encryptedAccount = accountNumber ? encryptField(accountNumber) : null;

    // Use raw pool.query to include new columns not yet in Drizzle schema
    const result = await pool.query(`
      INSERT INTO billing_history (user_id, policy_id, amount, status, payment_date, payment_method, transaction_id,
        bank_name, routing_number, account_number, billing_type, description, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      clientId,
      policyId || null,
      amount,
      status || 'pending',
      paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod || null,
      transactionId || null,
      bankName || null,
      encryptedRouting,
      encryptedAccount,
      billingType || null,
      description || null,
      dueDate ? new Date(dueDate) : null,
    ]);

    const billing = result.rows[0];

    // Mask sensitive fields for response
    if (billing.routing_number) {
      billing.routing_masked = '****' + (routingNumber || '').slice(-4);
    }
    if (billing.account_number) {
      billing.account_masked = '****' + (accountNumber || '').slice(-4);
    }

    // Send notification to client
    try {
      await storage.createNotification({
        userId: clientId,
        title: "Billing Record Added",
        message: `A payment of $${Number(amount).toFixed(2)} has been recorded (${status}).`,
        type: "billing_update",
        isRead: false,
        actionUrl: "/client/billing",
      });
    } catch (notifErr) {
      console.error("[AgentClients] Notification delivery failed:", notifErr);
    }

    console.log(`[AgentClients] Billing record created: ${billing.id} for client ${clientId} by agent ${agent.id}`);
    res.status(201).json(billing);
  } catch (error: any) {
    console.error("[AgentClients] Failed to create billing record:", error);
    res.status(500).json({ error: "Failed to create billing record" });
  }
});

// ============================================
// PATCH /api/agent-clients/:clientId/billing/:billingId — Update a billing record
// ============================================

router.patch("/:clientId/billing/:billingId", requireAuth, requireClientAssignment, async (req: Request, res: Response) => {
  try {
    const { billingId } = req.params;
    const { amount, status, billingType, description, dueDate, bankName, routingNumber, accountNumber, paymentMethod } = req.body;

    const sets: string[] = ['updated_at = NOW()'];
    const vals: any[] = [];
    let idx = 1;

    if (amount !== undefined) { sets.push(`amount = $${idx++}`); vals.push(amount); }
    if (status !== undefined) { sets.push(`status = $${idx++}`); vals.push(status); }
    if (billingType !== undefined) { sets.push(`billing_type = $${idx++}`); vals.push(billingType); }
    if (description !== undefined) { sets.push(`description = $${idx++}`); vals.push(description); }
    if (dueDate !== undefined) { sets.push(`due_date = $${idx++}`); vals.push(dueDate ? new Date(dueDate) : null); }
    if (bankName !== undefined) { sets.push(`bank_name = $${idx++}`); vals.push(bankName); }
    if (paymentMethod !== undefined) { sets.push(`payment_method = $${idx++}`); vals.push(paymentMethod); }

    // Encrypt sensitive fields if provided
    if (routingNumber !== undefined) {
      const { encryptField } = await import('../services/encryptionService');
      sets.push(`routing_number = $${idx++}`); vals.push(routingNumber ? encryptField(routingNumber) : null);
    }
    if (accountNumber !== undefined) {
      const { encryptField } = await import('../services/encryptionService');
      sets.push(`account_number = $${idx++}`); vals.push(accountNumber ? encryptField(accountNumber) : null);
    }

    if (sets.length <= 1) return res.status(400).json({ error: "No fields to update" });

    vals.push(billingId);
    const result = await pool.query(
      `UPDATE billing_history SET ${sets.join(', ')} WHERE id = $${idx}::uuid RETURNING *`,
      vals
    );

    res.json(result.rows[0] || {});
  } catch (error: any) {
    console.error("[AgentClients] Error updating billing:", error?.message);
    res.status(500).json({ error: "Failed to update billing record" });
  }
});

// ============================================
// DELETE /api/agent-clients/:clientId/billing/:billingId — Delete a billing record
// ============================================

router.delete("/:clientId/billing/:billingId", requireAuth, requireClientAssignment, async (req: Request, res: Response) => {
  try {
    const { billingId } = req.params;
    await pool.query('DELETE FROM billing_history WHERE id = $1::uuid', [billingId]);
    res.json({ success: true });
  } catch (error: any) {
    console.error("[AgentClients] Error deleting billing:", error?.message);
    res.status(500).json({ error: "Failed to delete billing record" });
  }
});

// ============================================
// GET /api/agent-clients/:clientId/claims — View client's claims
// ============================================

router.get("/:clientId/claims", requireAuth, requireClientAssignment, async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    const claims = await storage.getClaimsByClientId(clientId);

    res.json(claims);
  } catch (error: any) {
    console.error("[AgentClients] Failed to fetch client claims:", error);
    res.status(500).json({ error: "Failed to fetch client claims" });
  }
});

export default router;
