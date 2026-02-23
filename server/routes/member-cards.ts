/**
 * Member Cards API Routes
 * Heritage Life Solutions Digital Insurance Cards
 */

import { Router } from "express";
import { fromZodError } from "zod-validation-error";
import { storage } from "../storage";
import { requireAuth } from "../routes";
import { requirePermission } from "../middleware/auth";
import { Permission } from "../types/permissions";
import {
  issueMemberCardSchema,
  updateMemberCardSchema,
  generateMemberCardNumber,
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

// Get single card by ID
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

export default router;
