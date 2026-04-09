/**
 * Document Templates API Routes
 * Provides endpoints for browsing templates, generating documents,
 * managing the approval queue, and previewing PDFs.
 *
 * GET    /api/document-templates                          -List active templates
 * GET    /api/document-templates/queue                    -Agent's queue (last 50)
 * GET    /api/document-templates/queue/:clientId          -Client document history
 * POST   /api/document-templates/generate                 -Generate a document
 * POST   /api/document-templates/queue/:queueId/approve   -Approve pending document
 * POST   /api/document-templates/queue/:queueId/cancel    -Cancel pending document
 * GET    /api/document-templates/preview/:templateKey/:clientId -Preview PDF
 * POST   /api/document-templates/generate-welcome-kit     -Generate full welcome kit
 *
 * Governance: Forge (backend) + Conduit (integrations) + Relay (delivery)
 */

import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";
import {
  generateDocument,
  type GenerateDocumentOptions,
  type AgentInfo,
  type ClientInfo,
  type PolicyInfo,
  type ClaimInfo,
} from "../services/documentGeneratorService";
import {
  deliverDocument,
  generateAndDeliverWelcomeKit,
} from "../services/documentDeliveryService";

const router = Router();

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Build GenerateDocumentOptions from database objects.
 * Fetches agent NPN from agent_profiles and maps DB records to service interfaces.
 */
async function buildDocumentOptions(
  templateKey: string,
  client: any,
  agentUser: any,
  policy: any | null,
  claim: any | null,
  personalNote?: string
): Promise<GenerateDocumentOptions> {
  // Fetch agent NPN
  let agentNpn = "";
  try {
    const { rows } = await pool.query(
      "SELECT npn FROM agent_profiles WHERE user_id = $1",
      [agentUser.id]
    );
    agentNpn = rows[0]?.npn || "";
  } catch {
    // NPN not required -continue without it
  }

  const clientInfo: ClientInfo = {
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phone: client.phone || undefined,
  };

  const agentInfo: AgentInfo = {
    name: `${agentUser.firstName} ${agentUser.lastName}`,
    email: agentUser.email,
    phone: agentUser.phone || "",
    npn: agentNpn,
  };

  const options: GenerateDocumentOptions = {
    templateKey,
    client: clientInfo,
    agent: agentInfo,
    personalNote,
  };

  if (policy) {
    options.policy = {
      policyNumber: policy.policyNumber,
      type: policy.type,
      carrier: policy.carrier || "Heritage Life Solutions",
      carrierId: policy.carrierId || policy.carrier?.toLowerCase().replace(/\s+/g, "_"),
      coverageAmount: Number(policy.coverageAmount) || 0,
      monthlyPremium: policy.monthlyPremium,
      startDate: policy.startDate ? new Date(policy.startDate).toISOString() : new Date().toISOString(),
      nextPaymentDate: policy.nextPaymentDate ? new Date(policy.nextPaymentDate).toISOString() : undefined,
      status: policy.status || "active",
      beneficiaries: Array.isArray(policy.beneficiaries) ? policy.beneficiaries : [],
      beneficiaryName: policy.beneficiaryName || undefined,
      beneficiaryRelationship: policy.beneficiaryRelationship || undefined,
      cashValue: policy.cashValue ? Number(policy.cashValue) : undefined,
    };
  }

  if (claim) {
    options.claim = {
      claimNumber: claim.claimNumber,
      filedDate: claim.filedDate ? new Date(claim.filedDate).toISOString() : new Date().toISOString(),
      type: claim.type || "life",
      status: claim.status || "pending",
      amount: claim.amount ? Number(claim.amount) : undefined,
      denialReason: claim.denialReason || undefined,
    };
  }

  return options;
}

/**
 * Return email subject, HTML body, and plain text for a given template.
 * Keeps email content simple: 1-2 sentences + portal link.
 */
function getEmailContent(
  templateKey: string,
  clientName: string,
  agentName: string,
  extra?: { policyNumber?: string; claimNumber?: string; year?: string; date?: string }
): { subject: string; htmlBody: string; plainText: string } {
  const firstName = clientName.split(" ")[0];
  const portalLink = `<a href="https://heritagels.org/client/documents" style="color:#7c3aed;font-weight:bold;">Client Portal</a>`;

  const templates: Record<string, { subject: string; htmlBody: string; plainText: string }> = {
    welcome_letter: {
      subject: `Your Heritage Welcome Letter -${firstName}`,
      htmlBody: `<p>Dear ${firstName},</p><p>Welcome to Heritage Life Solutions! Your personalized welcome letter is attached. You can view all your documents anytime in your ${portalLink}.</p><p>Warm regards,<br/>${agentName}</p>`,
      plainText: `Dear ${firstName},\n\nWelcome to Heritage Life Solutions! Your personalized welcome letter is attached. View all documents at https://heritagels.org/client/documents\n\nWarm regards,\n${agentName}`,
    },
    policy_summary: {
      subject: `Your Policy Summary -${extra?.policyNumber || "Heritage Life Solutions"}`,
      htmlBody: `<p>Dear ${firstName},</p><p>Your policy summary is attached for your records. It includes your coverage details, premium information, and beneficiary designations. View all documents in your ${portalLink}.</p><p>Best regards,<br/>${agentName}</p>`,
      plainText: `Dear ${firstName},\n\nYour policy summary is attached for your records. View all documents at https://heritagels.org/client/documents\n\nBest regards,\n${agentName}`,
    },
    claims_guide: {
      subject: "Your Claims Filing Guide -Heritage Life Solutions",
      htmlBody: `<p>Dear ${firstName},</p><p>Your claims filing guide is attached. It outlines the step-by-step process should you ever need to file a claim. View all documents in your ${portalLink}.</p><p>Best regards,<br/>${agentName}</p>`,
      plainText: `Dear ${firstName},\n\nYour claims filing guide is attached. View all documents at https://heritagels.org/client/documents\n\nBest regards,\n${agentName}`,
    },
    beneficiary_designation_confirmation: {
      subject: `Beneficiary Confirmation -${extra?.policyNumber || "Heritage Life Solutions"}`,
      htmlBody: `<p>Dear ${firstName},</p><p>Your beneficiary designation confirmation is attached. Please review the beneficiaries listed and contact us if any changes are needed. View all documents in your ${portalLink}.</p><p>Best regards,<br/>${agentName}</p>`,
      plainText: `Dear ${firstName},\n\nYour beneficiary designation confirmation is attached. View all documents at https://heritagels.org/client/documents\n\nBest regards,\n${agentName}`,
    },
    portal_access_instructions: {
      subject: "Your Client Portal Access -Heritage Life Solutions",
      htmlBody: `<p>Dear ${firstName},</p><p>Your client portal access instructions are attached. You can manage your policies, documents, and more from your ${portalLink}.</p><p>Best regards,<br/>${agentName}</p>`,
      plainText: `Dear ${firstName},\n\nYour client portal access instructions are attached. Access your portal at https://heritagels.org/client/documents\n\nBest regards,\n${agentName}`,
    },
    annual_policy_statement: {
      subject: `Your Annual Policy Statement -${extra?.year || new Date().getFullYear()}`,
      htmlBody: `<p>Dear ${firstName},</p><p>Your annual policy statement is attached. It includes your current coverage, premiums paid, and beneficiary information. View all documents in your ${portalLink}.</p><p>Best regards,<br/>${agentName}</p>`,
      plainText: `Dear ${firstName},\n\nYour annual policy statement is attached. View all documents at https://heritagels.org/client/documents\n\nBest regards,\n${agentName}`,
    },
    premium_payment_reminder: {
      subject: `Premium Payment Reminder -Due ${extra?.date || "soon"}`,
      htmlBody: `<p>Dear ${firstName},</p><p>This is a friendly reminder that your premium payment is coming due. Your payment details are in the attached document. Manage your billing in your ${portalLink}.</p><p>Best regards,<br/>${agentName}</p>`,
      plainText: `Dear ${firstName},\n\nYour premium payment is coming due. Details are in the attached document. Manage billing at https://heritagels.org/client/documents\n\nBest regards,\n${agentName}`,
    },
    policy_anniversary_letter: {
      subject: "Happy Policy Anniversary -Heritage Life Solutions",
      htmlBody: `<p>Dear ${firstName},</p><p>Happy policy anniversary! A personalized letter from your agent is attached. View all documents in your ${portalLink}.</p><p>Warm regards,<br/>${agentName}</p>`,
      plainText: `Dear ${firstName},\n\nHappy policy anniversary! A personalized letter from your agent is attached. View all documents at https://heritagels.org/client/documents\n\nWarm regards,\n${agentName}`,
    },
    annual_review_invitation: {
      subject: "Annual Coverage Review -Heritage Life Solutions",
      htmlBody: `<p>Dear ${firstName},</p><p>It's time for your annual coverage review. Your invitation with scheduling details is attached. View all documents in your ${portalLink}.</p><p>Best regards,<br/>${agentName}</p>`,
      plainText: `Dear ${firstName},\n\nIt's time for your annual coverage review. Your invitation is attached. View all documents at https://heritagels.org/client/documents\n\nBest regards,\n${agentName}`,
    },
    claims_packet: {
      subject: `Your Claims Filing Packet -Claim #${extra?.claimNumber || "N/A"}`,
      htmlBody: `<p>Dear ${firstName},</p><p>Your claims filing packet is attached with everything you need to complete your claim. View all documents in your ${portalLink}.</p><p>Best regards,<br/>${agentName}</p>`,
      plainText: `Dear ${firstName},\n\nYour claims filing packet is attached. View all documents at https://heritagels.org/client/documents\n\nBest regards,\n${agentName}`,
    },
    claim_acknowledgment: {
      subject: `Claim Received -#${extra?.claimNumber || "N/A"}`,
      htmlBody: `<p>Dear ${firstName},</p><p>We have received your claim. An acknowledgment letter with your claim number and next steps is attached. Track your claim in your ${portalLink}.</p><p>Best regards,<br/>${agentName}</p>`,
      plainText: `Dear ${firstName},\n\nWe have received your claim. Your acknowledgment letter is attached. Track your claim at https://heritagels.org/client/documents\n\nBest regards,\n${agentName}`,
    },
    claim_status_update: {
      subject: `Claim Status Update -#${extra?.claimNumber || "N/A"}`,
      htmlBody: `<p>Dear ${firstName},</p><p>There is an update on your claim. The status update document is attached with full details. Track your claim in your ${portalLink}.</p><p>Best regards,<br/>${agentName}</p>`,
      plainText: `Dear ${firstName},\n\nThere is an update on your claim. Details are attached. Track your claim at https://heritagels.org/client/documents\n\nBest regards,\n${agentName}`,
    },
    claim_approval_letter: {
      subject: `Claim Approved -#${extra?.claimNumber || "N/A"}`,
      htmlBody: `<p>Dear ${firstName},</p><p>Great news -your claim has been approved. The approval letter with payout details is attached. View all documents in your ${portalLink}.</p><p>Best regards,<br/>${agentName}</p>`,
      plainText: `Dear ${firstName},\n\nYour claim has been approved. The approval letter is attached. View all documents at https://heritagels.org/client/documents\n\nBest regards,\n${agentName}`,
    },
    claim_denial_letter: {
      subject: `Claim Decision -#${extra?.claimNumber || "N/A"}`,
      htmlBody: `<p>Dear ${firstName},</p><p>A decision has been made regarding your claim. The detailed letter including next steps and appeal information is attached. View all documents in your ${portalLink}.</p><p>Best regards,<br/>${agentName}</p>`,
      plainText: `Dear ${firstName},\n\nA decision has been made regarding your claim. Details and appeal information are attached. View all documents at https://heritagels.org/client/documents\n\nBest regards,\n${agentName}`,
    },
    beneficiary_change_confirmation: {
      subject: `Beneficiary Change Confirmed -${extra?.policyNumber || "Heritage Life Solutions"}`,
      htmlBody: `<p>Dear ${firstName},</p><p>Your beneficiary change has been processed. The confirmation document is attached with your updated beneficiary information. View all documents in your ${portalLink}.</p><p>Best regards,<br/>${agentName}</p>`,
      plainText: `Dear ${firstName},\n\nYour beneficiary change has been processed. Confirmation is attached. View all documents at https://heritagels.org/client/documents\n\nBest regards,\n${agentName}`,
    },
    contact_update_confirmation: {
      subject: "Contact Information Updated -Heritage Life Solutions",
      htmlBody: `<p>Dear ${firstName},</p><p>Your contact information has been updated. A confirmation document is attached for your records. View all documents in your ${portalLink}.</p><p>Best regards,<br/>${agentName}</p>`,
      plainText: `Dear ${firstName},\n\nYour contact information has been updated. Confirmation is attached. View all documents at https://heritagels.org/client/documents\n\nBest regards,\n${agentName}`,
    },
    payment_method_update_confirmation: {
      subject: "Payment Method Updated -Heritage Life Solutions",
      htmlBody: `<p>Dear ${firstName},</p><p>Your payment method has been updated. A confirmation document is attached for your records. View all documents in your ${portalLink}.</p><p>Best regards,<br/>${agentName}</p>`,
      plainText: `Dear ${firstName},\n\nYour payment method has been updated. Confirmation is attached. View all documents at https://heritagels.org/client/documents\n\nBest regards,\n${agentName}`,
    },
  };

  return templates[templateKey] || {
    subject: `Document from Heritage Life Solutions -${firstName}`,
    htmlBody: `<p>Dear ${firstName},</p><p>A new document is attached for your records. View all documents in your ${portalLink}.</p><p>Best regards,<br/>${agentName}</p>`,
    plainText: `Dear ${firstName},\n\nA new document is attached. View all documents at https://heritagels.org/client/documents\n\nBest regards,\n${agentName}`,
  };
}

/**
 * Map template_key to a portal document category for the delivery service.
 */
function getPortalCategory(templateKey: string): string {
  const map: Record<string, string> = {
    welcome_letter: "correspondence",
    policy_summary: "policy",
    claims_guide: "claims",
    beneficiary_designation_confirmation: "beneficiary",
    portal_access_instructions: "correspondence",
    annual_policy_statement: "statements",
    premium_payment_reminder: "billing",
    policy_anniversary_letter: "correspondence",
    annual_review_invitation: "correspondence",
    claims_packet: "claims",
    claim_acknowledgment: "claims",
    claim_status_update: "claims",
    claim_approval_letter: "claims",
    claim_denial_letter: "claims",
    beneficiary_change_confirmation: "beneficiary",
    contact_update_confirmation: "correspondence",
    payment_method_update_confirmation: "billing",
  };
  return map[templateKey] || "correspondence";
}

// =============================================================================
// 1. GET / -List all active templates
// =============================================================================

router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    let query = "SELECT * FROM document_templates WHERE is_active = true";
    const params: string[] = [];

    if (category && typeof category === "string") {
      query += " AND category = $1";
      params.push(category);
    }

    query += " ORDER BY lifecycle_phase, category, name";

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error: any) {
    console.error("[DocTemplates] Failed to list templates:", error);
    res.status(500).json({ error: "Failed to load templates" });
  }
});

// =============================================================================
// 2. GET /queue -Agent's pending/recent queue (last 50)
// =============================================================================

router.get("/queue", requireAuth, async (req: Request, res: Response) => {
  try {
    const agentId = req.user!.id;

    const { rows } = await pool.query(
      `SELECT dq.*, dt.name AS template_name, u.first_name AS client_first_name, u.last_name AS client_last_name
       FROM document_queue dq
       LEFT JOIN document_templates dt ON dq.template_key = dt.template_key
       LEFT JOIN users u ON dq.client_user_id = u.id
       WHERE dq.agent_user_id = $1
       ORDER BY dq.created_at DESC
       LIMIT 50`,
      [agentId]
    );

    res.json(rows);
  } catch (error: any) {
    console.error("[DocTemplates] Failed to load queue:", error);
    res.status(500).json({ error: "Failed to load document queue" });
  }
});

// =============================================================================
// 3. GET /queue/:clientId -Document history for a specific client
// =============================================================================

router.get("/queue/:clientId", requireAuth, async (req: Request, res: Response) => {
  try {
    const agentId = req.user!.id;
    const { clientId } = req.params;

    const { rows } = await pool.query(
      `SELECT dq.*, dt.name AS template_name, u.first_name AS client_first_name, u.last_name AS client_last_name
       FROM document_queue dq
       LEFT JOIN document_templates dt ON dq.template_key = dt.template_key
       LEFT JOIN users u ON dq.client_user_id = u.id
       WHERE dq.agent_user_id = $1 AND dq.client_user_id = $2
       ORDER BY dq.created_at DESC
       LIMIT 30`,
      [agentId, clientId]
    );

    res.json(rows);
  } catch (error: any) {
    console.error("[DocTemplates] Failed to load client queue:", error);
    res.status(500).json({ error: "Failed to load client document history" });
  }
});

// =============================================================================
// 4. POST /generate -Agent triggers document generation
// =============================================================================

router.post("/generate", requireAuth, async (req: Request, res: Response) => {
  try {
    const agentId = req.user!.id;
    const { templateKey, clientUserId, policyId, claimId, personalNote } = req.body as {
      templateKey: string;
      clientUserId: string;
      policyId?: string;
      claimId?: string;
      personalNote?: string;
    };

    // Validate required fields
    if (!templateKey || !clientUserId) {
      return res.status(400).json({ error: "templateKey and clientUserId are required" });
    }

    // 1. Fetch template
    const { rows: templateRows } = await pool.query(
      "SELECT * FROM document_templates WHERE template_key = $1",
      [templateKey]
    );
    const template = templateRows[0];

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    if (!template.is_active) {
      return res.status(400).json({ error: "Template is not active" });
    }

    // 2. Fetch client, agent, policy, claim
    const client = await storage.getUserById(clientUserId);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const agentUser = await storage.getUserById(agentId);
    if (!agentUser) {
      return res.status(404).json({ error: "Agent user not found" });
    }

    let policy: any = null;
    if (policyId) {
      policy = await storage.getPolicyById(policyId);
    } else {
      // Auto-resolve client's first active policy if none specified
      const policies = await storage.getPoliciesByUserId(clientUserId);
      policy = policies.find((p: any) => p.status === 'active') || policies[0] || null;
    }

    let claim: any = null;
    if (claimId) {
      claim = await storage.getClaimById(claimId);
    } else if (template.category === 'claims') {
      // Auto-resolve client's most recent claim
      try {
        const claims = await storage.getClaimsByClientId(clientUserId);
        claim = claims[0] || null;
      } catch {}
    }

    // 3. Create queue record
    const { rows: queueRows } = await pool.query(
      `INSERT INTO document_queue (template_key, client_user_id, agent_user_id, policy_id, claim_id, personal_note, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [templateKey, clientUserId, agentId, policyId || null, claimId || null, personalNote || null, "generating"]
    );
    const queueEntry = queueRows[0];

    // 4. If requires approval, set to pending_review and return
    if (template.requires_approval) {
      await pool.query(
        "UPDATE document_queue SET status = $1, updated_at = NOW() WHERE id = $2",
        ["pending_review", queueEntry.id]
      );

      return res.json({
        success: true,
        queueId: queueEntry.id,
        status: "pending_review",
      });
    }

    // 5. Generate PDF
    const docOptions = await buildDocumentOptions(templateKey, client, agentUser, policy, claim, personalNote);
    let pdfBuffer: Buffer;

    try {
      pdfBuffer = await generateDocument(docOptions);
    } catch (genErr: any) {
      await pool.query(
        "UPDATE document_queue SET status = $1, error_message = $2, updated_at = NOW() WHERE id = $3",
        ["failed", genErr.message, queueEntry.id]
      );
      console.error("[DocTemplates] PDF generation failed:", genErr);
      return res.status(500).json({ error: "Document generation failed" });
    }

    // 6. Deliver through all channels
    const agentName = `${agentUser.firstName} ${agentUser.lastName}`;
    const clientName = `${client.firstName} ${client.lastName}`;
    const cleanTemplateName = templateKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const fileName = `${cleanTemplateName} - ${clientName}.pdf`;

    const emailContent = getEmailContent(templateKey, clientName, agentName, {
      policyNumber: policy?.policyNumber,
      claimNumber: claim?.claimNumber,
      year: String(new Date().getFullYear()),
      date: policy?.nextPaymentDate ? new Date(policy.nextPaymentDate).toLocaleDateString("en-US") : undefined,
    });

    try {
      const deliveryResult = await deliverDocument({
        pdfBuffer,
        fileName,
        templateKey,
        client: {
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone || undefined,
        },
        agent: { id: agentId, name: agentName, email: agentUser.email },
        policyId: policyId || undefined,
        queueId: queueEntry.id,
        portalCategory: getPortalCategory(templateKey),
        emailSubject: emailContent.subject,
        emailHtmlBody: emailContent.htmlBody,
        emailPlainText: emailContent.plainText,
      });

      res.json({
        success: true,
        queueId: queueEntry.id,
        status: "sent",
        documentId: deliveryResult.documentId,
      });
    } catch (deliverErr: any) {
      await pool.query(
        "UPDATE document_queue SET status = $1, error_message = $2, updated_at = NOW() WHERE id = $3",
        ["failed", deliverErr.message, queueEntry.id]
      );
      console.error("[DocTemplates] Delivery failed:", deliverErr);
      return res.status(500).json({ error: "Document delivery failed" });
    }
  } catch (error: any) {
    console.error("[DocTemplates] Generate failed:", error);
    res.status(500).json({ error: "Failed to generate document" });
  }
});

// =============================================================================
// 5. POST /queue/:queueId/approve -Approve a pending hybrid document
// =============================================================================

router.post("/queue/:queueId/approve", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { queueId } = req.params;
    const { personalNote } = req.body as { personalNote?: string };

    // 1. Fetch queue entry
    const { rows: queueRows } = await pool.query(
      "SELECT * FROM document_queue WHERE id = $1",
      [queueId]
    );
    const queueEntry = queueRows[0];

    if (!queueEntry) {
      return res.status(404).json({ error: "Queue entry not found" });
    }
    if (queueEntry.status !== "pending_review") {
      return res.status(400).json({ error: `Cannot approve document with status "${queueEntry.status}"` });
    }

    // 2. Verify ownership or elevated role
    const isOwnerOrManager = ["owner", "system_admin", "manager"].includes(userRole);
    if (queueEntry.agent_user_id !== userId && !isOwnerOrManager) {
      return res.status(403).json({ error: "Not authorized to approve this document" });
    }

    // 3. Update personal note if provided
    if (personalNote !== undefined) {
      await pool.query(
        "UPDATE document_queue SET personal_note = $1, updated_at = NOW() WHERE id = $2",
        [personalNote, queueId]
      );
    }

    // 4. Fetch required data for generation
    const client = await storage.getUserById(queueEntry.client_user_id);
    const agentUser = await storage.getUserById(queueEntry.agent_user_id);
    if (!client || !agentUser) {
      return res.status(404).json({ error: "Client or agent not found" });
    }

    let policy: any = null;
    if (queueEntry.policy_id) {
      policy = await storage.getPolicyById(queueEntry.policy_id);
    }

    let claim: any = null;
    if (queueEntry.claim_id) {
      claim = await storage.getClaimById(queueEntry.claim_id);
    }

    const effectiveNote = personalNote !== undefined ? personalNote : queueEntry.personal_note;

    // 5. Generate PDF
    const docOptions = await buildDocumentOptions(
      queueEntry.template_key,
      client,
      agentUser,
      policy,
      claim,
      effectiveNote
    );

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateDocument(docOptions);
    } catch (genErr: any) {
      await pool.query(
        "UPDATE document_queue SET status = $1, error_message = $2, updated_at = NOW() WHERE id = $3",
        ["failed", genErr.message, queueId]
      );
      console.error("[DocTemplates] Approval generation failed:", genErr);
      return res.status(500).json({ error: "Document generation failed" });
    }

    // 6. Deliver through all channels
    const agentName = `${agentUser.firstName} ${agentUser.lastName}`;
    const clientName = `${client.firstName} ${client.lastName}`;
    const cleanTemplateName = queueEntry.template_key.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
    const fileName = `${cleanTemplateName} - ${clientName}.pdf`;

    const emailContent = getEmailContent(queueEntry.template_key, clientName, agentName, {
      policyNumber: policy?.policyNumber,
      claimNumber: claim?.claimNumber,
      year: String(new Date().getFullYear()),
      date: policy?.nextPaymentDate ? new Date(policy.nextPaymentDate).toLocaleDateString("en-US") : undefined,
    });

    const deliveryResult = await deliverDocument({
      pdfBuffer,
      fileName,
      templateKey: queueEntry.template_key,
      client: {
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone || undefined,
      },
      agent: { id: agentUser.id, name: agentName, email: agentUser.email },
      policyId: queueEntry.policy_id || undefined,
      queueId,
      portalCategory: getPortalCategory(queueEntry.template_key),
      emailSubject: emailContent.subject,
      emailHtmlBody: emailContent.htmlBody,
      emailPlainText: emailContent.plainText,
    });

    // 7. Update queue record
    await pool.query(
      `UPDATE document_queue SET status = 'sent', approved_at = NOW(), approved_by = $1, sent_at = NOW(),
       delivery_results = $2, document_id = $3, updated_at = NOW()
       WHERE id = $4`,
      [userId, JSON.stringify(deliveryResult), deliveryResult.documentId || null, queueId]
    );

    res.json({
      success: true,
      queueId,
      status: "sent",
      documentId: deliveryResult.documentId,
      delivery: deliveryResult,
    });
  } catch (error: any) {
    console.error("[DocTemplates] Approve failed:", error);
    res.status(500).json({ error: "Failed to approve document" });
  }
});

// =============================================================================
// 6. POST /queue/:queueId/cancel -Cancel a pending document
// =============================================================================

router.post("/queue/:queueId/cancel", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { queueId } = req.params;

    // Fetch queue entry
    const { rows: queueRows } = await pool.query(
      "SELECT * FROM document_queue WHERE id = $1",
      [queueId]
    );
    const queueEntry = queueRows[0];

    if (!queueEntry) {
      return res.status(404).json({ error: "Queue entry not found" });
    }

    // Only pending_review or generating can be cancelled
    if (!["pending_review", "generating"].includes(queueEntry.status)) {
      return res.status(400).json({ error: `Cannot cancel document with status "${queueEntry.status}"` });
    }

    // Verify ownership or elevated role
    const isOwnerOrManager = ["owner", "system_admin", "manager"].includes(userRole);
    if (queueEntry.agent_user_id !== userId && !isOwnerOrManager) {
      return res.status(403).json({ error: "Not authorized to cancel this document" });
    }

    await pool.query(
      "UPDATE document_queue SET status = $1, updated_at = NOW() WHERE id = $2",
      ["cancelled", queueId]
    );

    res.json({ success: true });
  } catch (error: any) {
    console.error("[DocTemplates] Cancel failed:", error);
    res.status(500).json({ error: "Failed to cancel document" });
  }
});

// =============================================================================
// 7. GET /preview/:templateKey/:clientId -Preview PDF without sending
// =============================================================================

router.get("/preview/:templateKey/:clientId", requireAuth, async (req: Request, res: Response) => {
  try {
    const agentId = req.user!.id;
    const { templateKey, clientId } = req.params;
    const { policyId, personalNote } = req.query as { policyId?: string; personalNote?: string };

    // Fetch client and agent
    const client = await storage.getUserById(clientId);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const agentUser = await storage.getUserById(agentId);
    if (!agentUser) {
      return res.status(404).json({ error: "Agent not found" });
    }

    // Fetch policy (provided or auto-resolve)
    let policy: any = null;
    if (policyId) {
      policy = await storage.getPolicyById(policyId);
    } else {
      const policies = await storage.getPoliciesByUserId(clientId);
      policy = policies.find((p: any) => p.status === 'active') || policies[0] || null;
    }

    // Auto-resolve claim for claims templates (graceful - don't fail if no claims)
    let claim: any = null;
    if (templateKey.includes('claim')) {
      try {
        const claims = await storage.getClaimsByClientId(clientId);
        claim = claims[0] || null;
      } catch {}
    }

    // Build options and generate PDF (include personalNote from query)
    const docOptions = await buildDocumentOptions(templateKey, client, agentUser, policy, claim, personalNote ? decodeURIComponent(personalNote) : undefined);
    const pdfBuffer = await generateDocument(docOptions);

    // Return raw PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="preview-${templateKey}.pdf"`);
    res.setHeader("Cache-Control", "no-cache, no-store");
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error("[DocTemplates] Preview failed:", error);
    res.status(500).json({ error: "Failed to generate preview" });
  }
});

// =============================================================================
// 8. POST /generate-welcome-kit -Generate and deliver all 5 onboarding docs
// =============================================================================

router.post("/generate-welcome-kit", requireAuth, async (req: Request, res: Response) => {
  try {
    const agentId = req.user!.id;
    const { clientUserId, policyId } = req.body as {
      clientUserId: string;
      policyId: string;
    };

    if (!clientUserId) {
      return res.status(400).json({ error: "clientUserId is required" });
    }

    // Auto-resolve policyId if not provided
    let resolvedPolicyId = policyId;
    if (!resolvedPolicyId) {
      const policies = await storage.getPoliciesByUserId(clientUserId);
      const activePolicy = policies.find((p: any) => p.status === 'active') || policies[0];
      resolvedPolicyId = activePolicy?.id;
    }

    // Verify client exists
    const client = await storage.getUserById(clientUserId);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    await generateAndDeliverWelcomeKit({
      clientUserId,
      policyId: resolvedPolicyId || "",
      agentUserId: agentId,
    });

    res.json({
      success: true,
      message: "Welcome kit delivered",
    });
  } catch (error: any) {
    console.error("[DocTemplates] Welcome kit failed:", error);
    res.status(500).json({ error: "Failed to generate welcome kit" });
  }
});

// =============================================================================
// POST /send-legal-samples -Send NDA, Debt Rollup, Compliance PDFs via email
// =============================================================================

router.post("/send-legal-samples", requireAuth, async (req: Request, res: Response) => {
  try {
    const { sendEmailWithAttachments } = await import("../gmail");
    const fs = await import("fs");
    const path = await import("path");

    const targetEmail = req.body?.email || "guy4carbs@gmail.com";
    const previewDir = path.join(process.cwd(), "tmp-preview");

    const files = [
      { name: "nda_signed_preview.pdf", label: "NDA" },
      { name: "debt_rollup_signed_preview.pdf", label: "Debt Rollup" },
      { name: "compliance_signed_preview.pdf", label: "Compliance" },
    ];

    const pdfs: Array<{ filename: string; content: Buffer; contentType: string }> = [];
    for (const f of files) {
      const filePath = path.join(previewDir, f.name);
      if (fs.existsSync(filePath)) {
        pdfs.push({ filename: f.name, content: fs.readFileSync(filePath), contentType: "application/pdf" });
      }
    }

    if (pdfs.length === 0) {
      return res.status(404).json({ error: "Preview PDFs not found in tmp-preview/" });
    }

    await sendEmailWithAttachments({
      to: targetEmail,
      subject: "Heritage Legal Documents - NDA, Debt Rollup, Compliance (Signed Previews)",
      htmlBody: `<div style="font-family:Georgia,serif;padding:24px;"><h2 style="color:#3b1f7e;">Heritage Legal Document Previews</h2><p>Attached are the 3 signed preview PDFs from the onboarding flow:</p><ul><li><strong>NDA</strong> - Non-Disclosure, Non-Solicitation Agreement</li><li><strong>Debt Rollup</strong> - Protection and Authorization</li><li><strong>Compliance</strong> - Ethical Conduct Agreement</li></ul><p style="color:#6b7280;font-size:13px;">These are the exact PDFs from the tmp-preview directory with full Heritage branding.</p></div>`,
      plainTextBody: "Heritage Legal Document Previews - NDA, Debt Rollup, Compliance signed preview PDFs attached.",
      attachments: pdfs,
    });

    res.json({ success: true, message: `Sent ${pdfs.length} PDFs to ${targetEmail}` });
  } catch (error: any) {
    console.error("[DocTemplates] Legal samples failed:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
