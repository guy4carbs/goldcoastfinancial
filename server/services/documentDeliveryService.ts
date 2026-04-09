/**
 * Document Delivery Service
 * Multi-channel orchestrator: Firebase Storage + Email (with PDF) + SMS + Notification + Chat
 *
 * Delivers generated PDF documents through all available channels.
 * Each channel is non-blocking -failure in one does not prevent others.
 *
 * Governance: Forge (backend) + Conduit (integrations) + Relay (delivery)
 */

import { storage } from "../storage";
import * as s3Service from "./s3Service";
import { sendEmailWithAttachments } from "../gmail";
import { sendSms, isSmsAvailable } from "./smsService";
import { notifyUser } from "../websocket/eventBridge";
import { eventBus, EventType } from "../agents/core/event-bus";
import { generateDocument, type GenerateDocumentOptions, type AgentInfo, type ClientInfo, type PolicyInfo, type ClaimInfo } from "./documentGeneratorService";
import { pool } from "../db";

// Re-export types for consumers
export type { AgentInfo, ClientInfo, PolicyInfo, ClaimInfo, GenerateDocumentOptions };

// =============================================================================
// TYPES
// =============================================================================

interface DeliveryOptions {
  pdfBuffer: Buffer;
  fileName: string;
  templateKey: string;
  client: { id: string; firstName: string; lastName: string; email: string; phone?: string };
  agent: { id: string; name: string; email: string };
  policyId?: string;
  queueId?: string;
  portalCategory: string;
  emailSubject: string;
  emailHtmlBody: string;
  emailPlainText: string;
  skipEmail?: boolean;
  skipSms?: boolean;
  skipChat?: boolean;
}

interface DeliveryResult {
  success: boolean;
  documentId?: string;
  channels: {
    portal: { sent: boolean; documentId?: string; error?: string };
    email: { sent: boolean; messageId?: string; error?: string };
    sms: { sent: boolean; error?: string };
    notification: { sent: boolean; error?: string };
  };
}

interface WelcomeKitOptions {
  clientUserId: string;
  policyId: string;
  agentUserId: string;
  wsServer?: any;
}

// =============================================================================
// HERITAGE EMAIL WRAPPER
// =============================================================================

function wrapInHeritageEmail(bodyContent: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td style="background:linear-gradient(135deg,#3b1f7e 0%,#7c3aed 100%);padding:32px 40px;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">Heritage Life Solutions</h1>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:12px;">Protecting What Matters Most</p>
    <div style="margin-top:12px;height:2px;background:#D4AF37;width:60px;"></div>
  </td></tr>
  <tr><td style="padding:32px 40px;color:#374151;font-size:15px;line-height:1.7;">
    ${bodyContent}
  </td></tr>
  <tr><td style="padding:24px 40px;border-top:1px solid #e5e7eb;background:#fafafa;">
    <p style="margin:0;color:#9ca3af;font-size:11px;text-align:center;">
      Heritage Life Solutions is a DBA of Gold Coast Financial Partners, LLC. IL License #22128144.<br/>
      &copy; ${new Date().getFullYear()} Gold Coast Financial Partners. All rights reserved.
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// =============================================================================
// SINGLE DOCUMENT DELIVERY
// =============================================================================

export async function deliverDocument(options: DeliveryOptions): Promise<DeliveryResult> {
  const result: DeliveryResult = {
    success: false,
    channels: {
      portal: { sent: false },
      email: { sent: false },
      sms: { sent: false },
      notification: { sent: false },
    },
  };

  // Channel 1: Upload to Firebase + create DB record (portal)
  try {
    const uploadResult = await s3Service.uploadFile(
      options.client.id,
      options.fileName,
      options.pdfBuffer,
      { contentType: "application/pdf", metadata: { templateKey: options.templateKey, agentId: options.agent.id } },
      "generated-documents"
    );

    if (uploadResult.success && uploadResult.key) {
      const document = await storage.createDocument({
        userId: options.client.id,
        policyId: options.policyId || undefined,
        name: options.fileName.replace(".pdf", ""),
        type: "application/pdf",
        category: options.portalCategory,
        fileSize: `${(options.pdfBuffer.length / 1024).toFixed(0)} KB`,
        s3Key: uploadResult.key,
        uploadedBy: options.agent.id,
      });
      result.channels.portal = { sent: true, documentId: document.id };
      result.documentId = document.id;
    }
  } catch (err: any) {
    console.error("[DocDelivery] Portal upload failed:", err.message);
    result.channels.portal = { sent: false, error: err.message };
  }

  // Channel 2: Email with PDF attachment
  if (!options.skipEmail) {
    try {
      const emailResult = await sendEmailWithAttachments({
        to: options.client.email,
        replyTo: options.agent.email,
        subject: options.emailSubject,
        htmlBody: wrapInHeritageEmail(options.emailHtmlBody),
        plainTextBody: options.emailPlainText,
        attachments: [{
          filename: options.fileName,
          content: options.pdfBuffer,
          contentType: "application/pdf",
        }],
      });
      result.channels.email = { sent: true, messageId: emailResult?.data?.id };
    } catch (err: any) {
      console.error("[DocDelivery] Email failed:", err.message);
      result.channels.email = { sent: false, error: err.message };
    }
  }

  // Channel 3: SMS notification with portal link
  if (!options.skipSms && options.client.phone && isSmsAvailable()) {
    try {
      await sendSms(options.client.phone,
        `Heritage Life Solutions: A new document is available in your Client Portal -"${options.fileName.replace('.pdf', '')}". View it here: https://heritagels.org/client/documents`
      );
      result.channels.sms = { sent: true };
    } catch (err: any) {
      console.error("[DocDelivery] SMS failed:", err.message);
      result.channels.sms = { sent: false, error: err.message };
    }
  }

  // Channel 4: In-app notification + WebSocket push
  try {
    await storage.createNotification({
      userId: options.client.id,
      title: "New Document Available",
      message: `Your ${options.fileName.replace('.pdf', '')} is ready to view.`,
      type: "document_generated",
      isRead: false,
      actionUrl: "/client/documents",
    });
    result.channels.notification = { sent: true };
  } catch (err: any) {
    console.error("[DocDelivery] Notification failed:", err.message);
    result.channels.notification = { sent: false, error: err.message };
  }

  // Update queue record if provided
  if (options.queueId) {
    try {
      await pool.query(
        `UPDATE document_queue SET status = 'sent', delivery_results = $1, document_id = $2, sent_at = NOW(), updated_at = NOW() WHERE id = $3`,
        [JSON.stringify(result.channels), result.documentId || null, options.queueId]
      );
    } catch (err) {
      console.error("[DocDelivery] Queue update failed:", err);
    }
  }

  // Emit event
  try {
    eventBus.emit({
      type: EventType.DOCUMENT_DELIVERED,
      source: "document-delivery",
      payload: {
        templateKey: options.templateKey,
        clientId: options.client.id,
        agentId: options.agent.id,
        documentId: result.documentId,
        channels: result.channels,
      },
      metadata: { tier: 7, priority: "normal" },
    } as any);
  } catch {}

  result.success = result.channels.portal.sent || result.channels.email.sent;
  return result;
}

// =============================================================================
// WELCOME KIT -1 email with 5 PDFs, 1 SMS, 5 portal records
// =============================================================================

export async function generateAndDeliverWelcomeKit(options: WelcomeKitOptions): Promise<void> {
  const { clientUserId, policyId, agentUserId } = options;

  // Fetch all required data
  const client = await storage.getUserById(clientUserId);
  const agentUser = await storage.getUserById(agentUserId);
  if (!client || !agentUser) {
    console.error("[WelcomeKit] Client or agent not found");
    return;
  }

  const policies = await storage.getPoliciesByUserId(clientUserId);
  const policy = policies.find((p: any) => p.id === policyId) || policies[0];
  if (!policy) {
    console.error("[WelcomeKit] No policy found for client");
    return;
  }

  // Build agent NPN from agent_profiles if available
  let agentNpn = "";
  try {
    const { rows } = await pool.query("SELECT npn FROM agent_profiles WHERE user_id = $1", [agentUserId]);
    agentNpn = rows[0]?.npn || "";
  } catch {}

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

  const policyInfo: PolicyInfo = {
    policyNumber: policy.policyNumber,
    type: policy.type,
    carrier: policy.carrier || "Heritage Life Solutions",
    carrierId: (policy as any).carrierId || policy.carrier?.toLowerCase().replace(/\s+/g, "_"),
    coverageAmount: Number(policy.coverageAmount) || 0,
    monthlyPremium: policy.monthlyPremium,
    startDate: policy.startDate ? new Date(policy.startDate).toISOString() : new Date().toISOString(),
    nextPaymentDate: policy.nextPaymentDate ? new Date(policy.nextPaymentDate).toISOString() : undefined,
    status: policy.status || "active",
    beneficiaries: Array.isArray(policy.beneficiaries) ? policy.beneficiaries : [],
    beneficiaryName: policy.beneficiaryName || undefined,
    beneficiaryRelationship: policy.beneficiaryRelationship || undefined,
  };

  // Generate all 5 PDFs sequentially (avoid memory pressure)
  const templateKeys = [
    "welcome_letter",
    "policy_summary",
    "claims_guide",
    "beneficiary_designation_confirmation",
    "portal_access_instructions",
  ];

  const pdfs: Array<{ key: string; buffer: Buffer; fileName: string }> = [];

  for (const key of templateKeys) {
    try {
      const buffer = await generateDocument({
        templateKey: key,
        client: clientInfo,
        agent: agentInfo,
        policy: policyInfo,
      });

      const cleanName = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      const fileName = `${cleanName} - ${client.firstName} ${client.lastName}.pdf`;
      pdfs.push({ key, buffer, fileName });
    } catch (err) {
      console.error(`[WelcomeKit] Failed to generate ${key}:`, err);
    }
  }

  if (pdfs.length === 0) {
    console.error("[WelcomeKit] No PDFs generated");
    return;
  }

  // Category mapping for portal
  const categoryMap: Record<string, string> = {
    welcome_letter: "correspondence",
    policy_summary: "policy",
    claims_guide: "claims",
    beneficiary_designation_confirmation: "beneficiary",
    portal_access_instructions: "correspondence",
  };

  // Channel 1: Upload all 5 PDFs to Firebase + create 5 DB records
  for (const pdf of pdfs) {
    try {
      const uploadResult = await s3Service.uploadFile(
        clientUserId,
        pdf.fileName,
        pdf.buffer,
        { contentType: "application/pdf", metadata: { templateKey: pdf.key, agentId: agentUserId } },
        "generated-documents"
      );

      if (uploadResult.success && uploadResult.key) {
        await storage.createDocument({
          userId: clientUserId,
          policyId: policyId || undefined,
          name: pdf.fileName.replace(".pdf", ""),
          type: "application/pdf",
          category: categoryMap[pdf.key] || "correspondence",
          fileSize: `${(pdf.buffer.length / 1024).toFixed(0)} KB`,
          s3Key: uploadResult.key,
          uploadedBy: agentUserId,
        });
      }
    } catch (err) {
      console.error(`[WelcomeKit] Portal upload failed for ${pdf.key}:`, err);
    }
  }

  // Channel 2: ONE email with all 5 PDFs attached
  try {
    const emailBody = `
      <h2 style="color:#1f2937;margin:0 0 8px;">Welcome, ${client.firstName}!</h2>
      <p>Congratulations on securing your life insurance coverage with Heritage Life Solutions. Your dedicated agent, <strong>${agentInfo.name}</strong>, has prepared your Welcome Kit.</p>
      <p>Attached you'll find:</p>
      <ul style="color:#374151;line-height:2;">
        <li><strong>Welcome Letter</strong> -An introduction to Heritage and your agent</li>
        <li><strong>Policy Summary</strong> -Your coverage details at a glance</li>
        <li><strong>Claims Guide</strong> -How to file a claim when you need to</li>
        <li><strong>Beneficiary Confirmation</strong> -Your current beneficiaries on record</li>
        <li><strong>Portal Access Instructions</strong> -How to access your Client Portal</li>
      </ul>
      <p>You can also access all of these documents anytime in your <a href="https://heritagels.org/client/documents" style="color:#7c3aed;font-weight:bold;">Client Portal</a>.</p>
      <p style="margin-top:24px;">Welcome to the Heritage family.</p>
      <p style="margin-top:16px;color:#6b7280;font-size:13px;">
        ${agentInfo.name}<br/>
        Licensed Insurance Agent${agentNpn ? ` | NPN: ${agentNpn}` : ""}<br/>
        ${agentInfo.phone ? `${agentInfo.phone} | ` : ""}${agentInfo.email}
      </p>
    `;

    const plainText = `Welcome, ${client.firstName}!\n\nCongratulations on your coverage with Heritage Life Solutions. Your agent ${agentInfo.name} has prepared your Welcome Kit with 5 documents attached.\n\nView all documents: https://heritagels.org/client/documents\n\n${agentInfo.name}\n${agentInfo.email}`;

    await sendEmailWithAttachments({
      to: client.email,
      replyTo: agentUser.email,
      subject: `Your Heritage Life Solutions Welcome Kit -${client.firstName}`,
      htmlBody: wrapInHeritageEmail(emailBody),
      plainTextBody: plainText,
      attachments: pdfs.map(pdf => ({
        filename: pdf.fileName,
        content: pdf.buffer,
        contentType: "application/pdf",
      })),
    });
    console.log(`[WelcomeKit] Email with ${pdfs.length} PDFs sent to ${client.email}`);
  } catch (err) {
    console.error("[WelcomeKit] Email delivery failed:", err);
  }

  // Channel 3: ONE SMS notification
  if (client.phone && isSmsAvailable()) {
    try {
      await sendSms(client.phone,
        `Heritage Life Solutions: Your Welcome Kit is ready! ${pdfs.length} documents are available in your Client Portal. View them here: https://heritagels.org/client/documents`
      );
    } catch (err) {
      console.error("[WelcomeKit] SMS failed:", err);
    }
  }

  // Channel 4: ONE in-app notification
  try {
    await storage.createNotification({
      userId: clientUserId,
      title: "Your Welcome Kit is Ready",
      message: `${pdfs.length} documents have been added to your account, including your Policy Summary and Claims Guide.`,
      type: "document_generated",
      isRead: false,
      actionUrl: "/client/documents",
    });
  } catch (err) {
    console.error("[WelcomeKit] Notification failed:", err);
  }

  console.log(`[WelcomeKit] Complete -${pdfs.length} docs delivered to ${client.firstName} ${client.lastName}`);
}
