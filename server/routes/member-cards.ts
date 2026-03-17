/**
 * Member Cards API Routes
 * Heritage Life Solutions Digital Insurance Cards
 */

import { Router } from "express";
import { fromZodError } from "zod-validation-error";
import PDFDocument from "pdfkit";
import { storage } from "../storage";
import { requireAuth } from "../routes";
import { requirePermission } from "../middleware/auth";
import { Permission } from "../types/permissions";
import {
  issueMemberCardSchema,
  updateMemberCardSchema,
  generateMemberCardNumber,
  formatCarrierName,
  formatPolicyType,
  type IssueMemberCardRequest,
} from "@shared/models/memberCards";

const router = Router();

// =============================================================================
// CREATE - Issue a new member card
// =============================================================================

router.post("/", requireAuth, async (req, res) => {
  try {
    const validatedData = issueMemberCardSchema.parse(req.body);
    const agentId = req.session.userId!;

    // Generate unique card number
    const memberCardNumber = generateMemberCardNumber();

    // Determine group number (from agent's group or default)
    const groupNumber = validatedData.groupNumber || "GRP-001";

    // Create member ID if not provided (new member)
    let memberId = validatedData.memberId;
    if (!memberId) {
      // For new members, we'll use a generated UUID
      // In production, this would create a user account
      memberId = `member-${Date.now()}`;
    }

    const cardData = {
      memberCardNumber,
      memberId,
      agentId,
      leadId: validatedData.leadId || null,
      memberFullName: validatedData.memberFullName,
      memberEmail: validatedData.memberEmail,
      memberPhone: validatedData.memberPhone || null,
      insuranceCarrier: validatedData.insuranceCarrier,
      insuranceCarrierOther: validatedData.insuranceCarrierOther || null,
      policyNumber: validatedData.policyNumber,
      policyType: validatedData.policyType,
      coverageAmount: validatedData.coverageAmount.toString(),
      monthlyPremium: validatedData.monthlyPremium.toString(),
      effectiveDate: validatedData.effectiveDate,
      termLength: validatedData.termLength || null,
      expirationDate: validatedData.expirationDate || null,
      coverageType: validatedData.coverageType,
      beneficiaryName: validatedData.beneficiaryName,
      beneficiaryRelationship: validatedData.beneficiaryRelationship || null,
      status: "active",
      groupNumber,
    };

    const card = await storage.createMemberCard(cardData);

    console.log(`[MemberCards] Card issued: ${memberCardNumber} by agent ${agentId}`);

    res.status(201).json(card);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: fromZodError(error).toString() });
    }
    console.error("[MemberCards] Error creating card:", error);
    res.status(500).json({ error: "Failed to issue member card" });
  }
});

// =============================================================================
// READ - Get cards (with filtering)
// =============================================================================

// Get all cards for the authenticated agent
router.get("/", requireAuth, async (req, res) => {
  try {
    const agentId = req.session.userId!;
    const { status, search } = req.query;

    const cards = await storage.getMemberCardsByAgent(agentId, {
      status: status as string,
      search: search as string,
    });

    res.json(cards);
  } catch (error) {
    console.error("[MemberCards] Error fetching cards:", error);
    res.status(500).json({ error: "Failed to fetch member cards" });
  }
});

// Get cards for a specific member (for member portal)
router.get("/member/:memberId", requireAuth, async (req, res) => {
  try {
    const { memberId } = req.params;

    // Verify the requester is the member or an agent
    const requesterId = req.session.userId!;
    // In production, add proper authorization check

    const cards = await storage.getMemberCardsByMember(memberId);
    res.json(cards);
  } catch (error) {
    console.error("[MemberCards] Error fetching member cards:", error);
    res.status(500).json({ error: "Failed to fetch member cards" });
  }
});

// Get my cards (for member portal - uses session user)
router.get("/my-cards", requireAuth, async (req, res) => {
  try {
    const memberId = req.session.userId!;
    const cards = await storage.getMemberCardsByMember(memberId);
    res.json(cards);
  } catch (error) {
    console.error("[MemberCards] Error fetching my cards:", error);
    res.status(500).json({ error: "Failed to fetch your cards" });
  }
});

// =============================================================================
// STATS - Get card statistics for agent dashboard
// =============================================================================

router.get("/stats/summary", requireAuth, async (req, res) => {
  try {
    const agentId = req.session.userId!;
    const stats = await storage.getMemberCardStats(agentId);
    res.json(stats);
  } catch (error) {
    console.error("[MemberCards] Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch card statistics" });
  }
});

// Get card by card number (for verification)
router.get("/verify/:cardNumber", async (req, res) => {
  try {
    const card = await storage.getMemberCardByNumber(req.params.cardNumber);

    if (!card) {
      return res.status(404).json({ error: "Card not found", valid: false });
    }

    // Return limited info for verification
    res.json({
      valid: card.status === "active",
      status: card.status,
      memberName: card.memberFullName,
      policyType: card.policyType,
      carrier: card.insuranceCarrier,
      effectiveDate: card.effectiveDate,
      expirationDate: card.expirationDate,
    });
  } catch (error) {
    console.error("[MemberCards] Error verifying card:", error);
    res.status(500).json({ error: "Failed to verify card" });
  }
});

// Get single card by ID (must be AFTER all specific /path routes)
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const card = await storage.getMemberCardById(req.params.id);

    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    res.json(card);
  } catch (error) {
    console.error("[MemberCards] Error fetching card:", error);
    res.status(500).json({ error: "Failed to fetch member card" });
  }
});

// =============================================================================
// UPDATE - Modify card details
// =============================================================================

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const validatedData = updateMemberCardSchema.parse(req.body);
    const agentId = req.session.userId!;

    // Verify the agent owns this card
    const existingCard = await storage.getMemberCardById(req.params.id);
    if (!existingCard) {
      return res.status(404).json({ error: "Card not found" });
    }

    if (existingCard.agentId !== agentId) {
      return res.status(403).json({ error: "Not authorized to modify this card" });
    }

    const updated = await storage.updateMemberCard(req.params.id, {
      ...validatedData,
      updatedAt: new Date(),
    });

    if (!updated) {
      return res.status(404).json({ error: "Card not found" });
    }

    console.log(`[MemberCards] Card updated: ${req.params.id} by agent ${agentId}`);

    res.json(updated);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: fromZodError(error).toString() });
    }
    console.error("[MemberCards] Error updating card:", error);
    res.status(500).json({ error: "Failed to update member card" });
  }
});

// =============================================================================
// REVOKE - Deactivate a card
// =============================================================================

router.post("/:id/revoke", requireAuth, async (req, res) => {
  try {
    const agentId = req.session.userId!;
    const { reason } = req.body;

    // Verify the agent owns this card
    const existingCard = await storage.getMemberCardById(req.params.id);
    if (!existingCard) {
      return res.status(404).json({ error: "Card not found" });
    }

    if (existingCard.agentId !== agentId) {
      return res.status(403).json({ error: "Not authorized to revoke this card" });
    }

    const revoked = await storage.revokeMemberCard(req.params.id);

    if (!revoked) {
      return res.status(404).json({ error: "Card not found" });
    }

    console.log(`[MemberCards] Card revoked: ${req.params.id} by agent ${agentId}, reason: ${reason}`);

    res.json({ success: true, message: "Card revoked successfully" });
  } catch (error) {
    console.error("[MemberCards] Error revoking card:", error);
    res.status(500).json({ error: "Failed to revoke card" });
  }
});

// =============================================================================
// DELETE - Remove card (admin only)
// =============================================================================

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const success = await storage.deleteMemberCard(req.params.id);

    if (!success) {
      return res.status(404).json({ error: "Card not found" });
    }

    console.log(`[MemberCards] Card deleted: ${req.params.id}`);

    res.json({ success: true });
  } catch (error) {
    console.error("[MemberCards] Error deleting card:", error);
    res.status(500).json({ error: "Failed to delete card" });
  }
});

// =============================================================================
// PDF - Download member card as PDF
// =============================================================================

router.get("/:id/pdf", requireAuth, async (req, res) => {
  try {
    const card = await storage.getMemberCardById(req.params.id);
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    const COLORS = {
      purple: "#4B2D73",
      gold: "#C8B482",
      text: "#1a1a2e",
      textLight: "#6b7280",
      success: "#22c55e",
      amber: "#f59e0b",
      red: "#ef4444",
    };

    const statusColors: Record<string, string> = {
      active: COLORS.success,
      pending: COLORS.amber,
      revoked: COLORS.red,
      expired: COLORS.textLight,
    };

    const carrierLabel = card.insuranceCarrierOther || formatCarrierName(card.insuranceCarrier as any);
    const policyLabel = formatPolicyType(card.policyType as any);
    const coverageFormatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(parseFloat(card.coverageAmount || "0"));
    const premiumFormatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(parseFloat(card.monthlyPremium || "0"));
    const effectiveFormatted = card.effectiveDate ? new Date(card.effectiveDate).toLocaleDateString("en-US", { dateStyle: "long" }) : "N/A";
    const expirationFormatted = card.expirationDate ? new Date(card.expirationDate).toLocaleDateString("en-US", { dateStyle: "long" }) : "N/A";

    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: `Member Card - ${card.memberFullName}`,
        Author: "Heritage Life Solutions",
        Subject: "Digital Insurance Member Card",
      },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Heritage-Card-${card.memberCardNumber}.pdf"`);
    doc.pipe(res);

    // Header bar
    doc.rect(0, 0, 612, 100).fill(COLORS.purple);
    doc.fontSize(28).font("Helvetica-Bold").fillColor("#FFFFFF").text("HERITAGE", 50, 30);
    doc.fontSize(12).font("Helvetica").fillColor(COLORS.gold).text("LIFE SOLUTIONS", 50, 60);
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#FFFFFF").text("DIGITAL INSURANCE CARD", 350, 40, { align: "right" });
    doc.fontSize(9).font("Helvetica").fillColor(COLORS.gold).text(`Card #: ${card.memberCardNumber}`, 350, 55, { align: "right" });
    doc.fontSize(8).fillColor("#FFFFFF").text(`Generated: ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}`, 350, 70, { align: "right" });

    let yPos = 120;

    // Status badge
    const badgeColor = statusColors[card.status] || COLORS.textLight;
    doc.roundedRect(50, yPos, 100, 24, 12).fill(badgeColor);
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#FFFFFF").text(card.status.toUpperCase(), 50, yPos + 6, { width: 100, align: "center" });
    yPos += 50;

    // Member Information
    doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.purple).text("MEMBER INFORMATION", 50, yPos);
    doc.moveTo(50, yPos + 20).lineTo(300, yPos + 20).stroke(COLORS.gold);
    yPos += 30;

    const memberRows: [string, string][] = [
      ["Full Name", card.memberFullName],
      ["Email", card.memberEmail],
    ];
    if (card.memberPhone) memberRows.push(["Phone", card.memberPhone]);
    memberRows.push(["Member ID", card.memberId]);

    memberRows.forEach(([label, value]) => {
      doc.fontSize(9).font("Helvetica").fillColor(COLORS.textLight).text(label, 50, yPos);
      doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.text).text(value, 170, yPos);
      yPos += 18;
    });
    yPos += 15;

    // Policy Details
    doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.purple).text("POLICY DETAILS", 50, yPos);
    doc.moveTo(50, yPos + 20).lineTo(300, yPos + 20).stroke(COLORS.gold);
    yPos += 30;

    const policyRows: [string, string, boolean?][] = [
      ["Policy Number", card.policyNumber],
      ["Insurance Carrier", carrierLabel],
      ["Policy Type", policyLabel],
      ["Coverage Amount", coverageFormatted, true],
      ["Monthly Premium", `${premiumFormatted}/mo`],
      ["Effective Date", effectiveFormatted],
    ];
    if (card.expirationDate) policyRows.push(["Expiration Date", expirationFormatted]);
    if (card.termLength) policyRows.push(["Term Length", card.termLength]);
    policyRows.push(["Coverage Type", (card.coverageType || "individual").charAt(0).toUpperCase() + (card.coverageType || "individual").slice(1)]);

    policyRows.forEach(([label, value, isHighlight]) => {
      doc.fontSize(9).font("Helvetica").fillColor(COLORS.textLight).text(label, 50, yPos);
      doc.fontSize(isHighlight ? 12 : 10).font("Helvetica-Bold").fillColor(isHighlight ? COLORS.purple : COLORS.text).text(value, 170, yPos);
      yPos += 18;
    });
    yPos += 15;

    // Beneficiary Information
    doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.purple).text("BENEFICIARY INFORMATION", 50, yPos);
    doc.moveTo(50, yPos + 20).lineTo(300, yPos + 20).stroke(COLORS.gold);
    yPos += 30;

    doc.fontSize(9).font("Helvetica").fillColor(COLORS.textLight).text("Beneficiary Name", 50, yPos);
    doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.text).text(card.beneficiaryName, 170, yPos);
    yPos += 18;
    if (card.beneficiaryRelationship) {
      doc.fontSize(9).font("Helvetica").fillColor(COLORS.textLight).text("Relationship", 50, yPos);
      doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.text).text(card.beneficiaryRelationship.charAt(0).toUpperCase() + card.beneficiaryRelationship.slice(1), 170, yPos);
      yPos += 18;
    }

    // Right-side carrier box
    doc.roundedRect(340, 115, 220, 80, 8).fill("#fafafa");
    doc.fontSize(11).font("Helvetica-Bold").fillColor(COLORS.purple).text("UNDERWRITTEN BY", 350, 125);
    doc.moveTo(350, 142).lineTo(550, 142).stroke(COLORS.gold);
    doc.fontSize(16).font("Helvetica-Bold").fillColor(COLORS.text).text(carrierLabel, 350, 160, { width: 200, align: "center" });

    // Right-side card number box
    doc.roundedRect(340, 210, 220, 60, 8).fill(COLORS.purple);
    doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.gold).text("CARD NUMBER", 350, 222);
    doc.fontSize(14).font("Helvetica-Bold").fillColor("#FFFFFF").text(card.memberCardNumber, 350, 240);

    // Right-side contact box
    doc.roundedRect(340, 285, 220, 80, 8).fill("#f5f5f5");
    doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.purple).text("CUSTOMER SERVICE", 350, 297);
    doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.text).text("1-800-HERITAGE", 350, 315);
    doc.fontSize(9).font("Helvetica").fillColor(COLORS.textLight).text("support@heritagels.org", 350, 333);
    doc.text("heritagels.org", 350, 347);

    // Footer
    const footerY = 620;
    doc.moveTo(50, footerY).lineTo(562, footerY).stroke("#e5e5e5");
    doc.fontSize(7).font("Helvetica").fillColor(COLORS.textLight)
      .text("© 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states. Policies are issued by our carrier partners and product availability may vary by state.", 50, footerY + 15, { width: 512, align: "justify" })
      .text("This digital insurance card is for identification purposes only and does not constitute a policy contract. For complete policy terms, conditions, and coverage details, please refer to your policy documents or contact your agent.", 50, footerY + 50, { width: 512, align: "justify" });

    doc.fontSize(8).font("Helvetica-Bold").fillColor(COLORS.purple)
      .text(`Generated on ${new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}`, 50, footerY + 90, { width: 512, align: "center" });

    doc.end();
  } catch (error) {
    console.error("[MemberCards] Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// =============================================================================
// SEND - Email card details to member
// =============================================================================

router.post("/:id/send", requireAuth, async (req, res) => {
  try {
    const card = await storage.getMemberCardById(req.params.id);
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    const carrierLabel = card.insuranceCarrierOther || formatCarrierName(card.insuranceCarrier as any);
    const policyLabel = formatPolicyType(card.policyType as any);
    const coverageFormatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(parseFloat(card.coverageAmount || "0"));
    const premiumFormatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(parseFloat(card.monthlyPremium || "0"));
    const effectiveFormatted = card.effectiveDate ? new Date(card.effectiveDate).toLocaleDateString("en-US", { dateStyle: "long" }) : "N/A";

    // Try Gmail API first, fall back to mailto if not configured
    try {
      const { google } = await import("googleapis");

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
      );
      oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      });

      const gmail = google.gmail({ version: "v1", auth: oauth2Client });

      const subject = `Your Heritage Life Solutions Insurance Card - ${card.memberCardNumber}`;
      const body = `Dear ${card.memberFullName},

Your Heritage Life Solutions digital insurance card has been issued. Below are your card details:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  CARD NUMBER:  ${card.memberCardNumber}
  STATUS:       ${card.status.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

POLICY DETAILS
  Carrier:        ${carrierLabel}
  Policy Number:  ${card.policyNumber}
  Policy Type:    ${policyLabel}
  Coverage:       ${coverageFormatted}
  Premium:        ${premiumFormatted}/month
  Effective:      ${effectiveFormatted}

BENEFICIARY
  Name:           ${card.beneficiaryName}${card.beneficiaryRelationship ? `\n  Relationship:   ${card.beneficiaryRelationship}` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please keep this information for your records. If you have any questions about your coverage, please don't hesitate to reach out to your Heritage Life Solutions agent.

Customer Service: 1-800-HERITAGE
Email: support@heritagels.org
Website: heritagels.org

Warm regards,
Heritage Life Solutions
A DBA of Gold Coast Financial Partners

---
This email was sent from Heritage Life Solutions. If you believe you received this in error, please contact support@heritagels.org.`;

      const message = [
        'Content-Type: text/plain; charset="UTF-8"',
        "MIME-Version: 1.0",
        "Content-Transfer-Encoding: 7bit",
        `From: Heritage Life Solutions <contact@heritagels.org>`,
        `To: ${card.memberEmail}`,
        `Reply-To: support@heritagels.org`,
        `Subject: ${subject}`,
        "",
        body,
      ].join("\n");

      const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw: encodedMessage },
      });

      console.log(`[MemberCards] Card emailed to ${card.memberEmail} for card ${card.memberCardNumber}`);
      res.json({ success: true, method: "email", message: `Card details sent to ${card.memberEmail}` });
    } catch (emailErr: any) {
      // Gmail not configured — return a mailto fallback
      console.log("[MemberCards] Gmail not available, returning mailto fallback:", emailErr.message);
      const subject = encodeURIComponent(`Your Heritage Life Solutions Insurance Card - ${card.memberCardNumber}`);
      const body = encodeURIComponent(`Dear ${card.memberFullName},\n\nYour Heritage Life Solutions digital insurance card has been issued.\n\nCard Number: ${card.memberCardNumber}\nCarrier: ${carrierLabel}\nPolicy: ${card.policyNumber}\nCoverage: ${coverageFormatted}\nPremium: ${premiumFormatted}/month\n\nHeritage Life Solutions`);
      res.json({
        success: true,
        method: "mailto",
        mailto: `mailto:${card.memberEmail}?subject=${subject}&body=${body}`,
        message: `Gmail not configured. Opening email client instead.`,
      });
    }
  } catch (error) {
    console.error("[MemberCards] Error sending card:", error);
    res.status(500).json({ error: "Failed to send card to member" });
  }
});

export default router;
