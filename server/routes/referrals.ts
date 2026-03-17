/**
 * Referrals API Routes
 * Handles the public referral landing page data + form submission + personal message
 *
 * GET    /api/referrals/message             — Authenticated — get user's saved referral message
 * PATCH  /api/referrals/message             — Authenticated — save/update referral personal message
 * GET    /api/referrals/referrer/:clientId   — Public — referrer info (sanitized, no PII)
 * POST   /api/referrals/submit              — Public — create lead + in-app notification
 *
 * Governance: Forge (backend) + Sentinel (security) + Helix (compliance)
 */

import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { referralFormLimiter } from "../middleware/rateLimiter";
import { requireAuth } from "../middleware/auth";

const router = Router();

// UUID v4 regex for input validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Helix: Compliance blocklist — insurance advertising regulation
const COMPLIANCE_BLOCKLIST = [
  /guaranteed\s+(return|rate|income)/i,
  /risk[\s-]*free/i,
  /no[\s-]*risk/i,
];

// ── Points Configuration ──
const POINTS = {
  REFERRAL_SUBMITTED: 100,
  CONSULTATION_COMPLETED: 250,
};

const MILESTONES = [
  { count: 3, bonus: 500 },
  { count: 5, bonus: 1000 },
  { count: 10, bonus: 2500 },
];

const TIERS = [
  { name: "Platinum", min: 5000 },
  { name: "Gold", min: 1500 },
  { name: "Silver", min: 500 },
  { name: "Bronze", min: 0 },
];

function getTier(points: number) {
  const tier = TIERS.find((t) => points >= t.min) || TIERS[TIERS.length - 1];
  const nextTier = TIERS[TIERS.indexOf(tier) - 1] || null;
  return {
    name: tier.name,
    nextTier: nextTier?.name || null,
    nextTierAt: nextTier?.min || null,
  };
}

async function checkAndAwardMilestones(userId: string, referralCount: number) {
  for (const milestone of MILESTONES) {
    if (referralCount === milestone.count) {
      const history = await storage.getReferralPointHistory(userId);
      const already = history.some(
        (p) => p.sourceType === "milestone" && p.reason.includes(`${milestone.count} referrals`)
      );
      if (!already) {
        await storage.createReferralPointEntry({
          userId,
          amount: milestone.bonus,
          reason: `Milestone: ${milestone.count} referrals!`,
          sourceType: "milestone",
          sourceId: null,
        } as any);
        console.log(`[Referrals] Milestone ${milestone.count} awarded to ${userId}: +${milestone.bonus} pts`);
      }
    }
  }
}

// ============================================
// GET /api/referrals/message
// Authenticated — returns user's own saved referral message
// ============================================

router.get("/message", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await storage.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ referralMessage: user.referralMessage || null });
  } catch (error: any) {
    console.error("[Referrals] Failed to fetch referral message:", error);
    res.status(500).json({ error: "Failed to load message" });
  }
});

// ============================================
// PATCH /api/referrals/message
// Authenticated — save/update referral personal message
// ============================================

router.patch("/message", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { referralMessage } = req.body as { referralMessage: string };

    // Sentinel: Input validation
    if (typeof referralMessage !== "string") {
      return res.status(400).json({ error: "Message must be a string" });
    }

    // Sentinel: Length enforcement (500 char max)
    const trimmed = referralMessage.trim();
    if (trimmed.length > 500) {
      return res.status(400).json({ error: "Message must be 500 characters or fewer" });
    }

    // Sentinel: Strip HTML/script tags (XSS prevention)
    const sanitized = trimmed.replace(/<[^>]*>/g, "");

    // Helix: Block compliance-risk keywords
    for (const pattern of COMPLIANCE_BLOCKLIST) {
      if (pattern.test(sanitized)) {
        return res.status(400).json({
          error: "Your message contains language that may not comply with insurance regulations. Please revise.",
        });
      }
    }

    // Save to user profile
    const updated = await storage.updateUser(userId, {
      referralMessage: sanitized || null,
    });

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      referralMessage: updated.referralMessage,
    });
  } catch (error: any) {
    console.error("[Referrals] Failed to update referral message:", error);
    res.status(500).json({ error: "Failed to save message" });
  }
});

// ============================================
// GET /api/referrals/leads
// Authenticated — returns referral leads assigned to this agent
// ============================================

router.get("/leads", requireAuth, async (req: Request, res: Response) => {
  try {
    const agentId = req.user!.id;

    // Get all leads with source = 'referral' assigned to this agent
    const agentLeads = await storage.getLeadsByAgentId(agentId);
    const referralLeads = agentLeads.filter((l: any) => l.source === "referral");

    // Enrich with referral details (referrer name, relationship)
    const enriched = await Promise.all(
      referralLeads.map(async (lead: any) => {
        let referrerName: string | null = null;
        let relationship: string | null = null;

        // sourceId stores the referrer's clientId
        if (lead.sourceId) {
          try {
            const referrer = await storage.getUserById(lead.sourceId);
            if (referrer) {
              referrerName = `${referrer.firstName} ${referrer.lastName}`;
            }
            // Look up referral record for relationship
            const referralRecords = await storage.getReferralsByReferrerId(lead.sourceId);
            const match = referralRecords.find((r: any) => r.referredLeadId === lead.id);
            if (match) {
              relationship = match.relationship || null;
            }
          } catch {}
        }

        return {
          id: lead.id,
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          status: lead.status,
          source: lead.source,
          coverageType: lead.coverageType,
          notes: lead.notes,
          createdAt: lead.createdAt,
          referrerName,
          relationship,
        };
      })
    );

    res.json({ leads: enriched });
  } catch (error: any) {
    console.error("[Referrals] Failed to fetch referral leads:", error);
    res.status(500).json({ error: "Failed to load referral leads" });
  }
});

// ============================================
// GET /api/referrals/mine
// Authenticated — returns client's own referrals
// ============================================

router.get("/mine", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    console.log("[Referrals] GET /mine for user:", userId);
    const referralList = await storage.getReferralsByReferrerId(userId);
    console.log("[Referrals] Found", referralList.length, "referrals for user:", userId);
    res.json({
      referrals: referralList.map((r: any) => ({
        id: r.id,
        referredName: r.referredName,
        status: r.status,
        relationship: r.relationship,
        createdAt: r.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("[Referrals] Failed to fetch user referrals:", error);
    res.status(500).json({ error: "Failed to load referrals" });
  }
});

// ============================================
// GET /api/referrals/points
// Authenticated — returns points balance, tier, history, stats
// ============================================

router.get("/points", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    console.log("[Referrals] GET /points for user:", userId);
    const [balance, history, referralList] = await Promise.all([
      storage.getReferralPointBalance(userId),
      storage.getReferralPointHistory(userId),
      storage.getReferralsByReferrerId(userId),
    ]);

    const tier = getTier(balance);
    const converted = referralList.filter((r: any) => r.status === "converted").length;

    res.json({
      balance,
      tier: tier.name,
      tierProgress: { current: balance, nextTier: tier.nextTier, nextTierAt: tier.nextTierAt },
      history: history.map((h: any) => ({
        id: h.id,
        amount: h.amount,
        reason: h.reason,
        sourceType: h.sourceType,
        createdAt: h.createdAt,
      })),
      stats: {
        totalReferrals: referralList.length,
        convertedReferrals: converted,
        lifetimePoints: balance,
      },
    });
  } catch (error: any) {
    console.error("[Referrals] Failed to fetch points:", error);
    res.status(500).json({ error: "Failed to load points" });
  }
});

// ============================================
// POST /api/referrals/points/award
// Authenticated (agent/admin) — award consultation bonus
// ============================================

router.post("/points/award", requireAuth, async (req: Request, res: Response) => {
  try {
    const agentRole = req.user!.role;
    if (!["owner", "system_admin", "manager", "sales_agent"].includes(agentRole)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { referralId, type } = req.body as { referralId: string; type: string };
    if (!referralId || type !== "consultation_completed") {
      return res.status(400).json({ error: "Invalid award request" });
    }

    const referral = await storage.getReferralById(referralId);
    if (!referral) {
      return res.status(404).json({ error: "Referral not found" });
    }

    // Prevent duplicate consultation bonus
    const history = await storage.getReferralPointHistory(referral.referrerUserId);
    const alreadyAwarded = history.some(
      (p) => p.sourceType === "consultation_completed" && p.sourceId === referralId
    );
    if (alreadyAwarded) {
      return res.status(409).json({ error: "Consultation bonus already awarded for this referral" });
    }

    await storage.createReferralPointEntry({
      userId: referral.referrerUserId,
      amount: POINTS.CONSULTATION_COMPLETED,
      reason: `Consultation completed — ${referral.referredName}`,
      sourceType: "consultation_completed",
      sourceId: referralId,
    } as any);

    // Update referral status
    await storage.updateReferral(referralId, { status: "contacted" } as any);

    console.log(`[Referrals] Consultation bonus awarded: ${referral.referrerUserId} +${POINTS.CONSULTATION_COMPLETED} pts`);
    res.json({ success: true, pointsAwarded: POINTS.CONSULTATION_COMPLETED });
  } catch (error: any) {
    console.error("[Referrals] Failed to award points:", error);
    res.status(500).json({ error: "Failed to award points" });
  }
});

// ============================================
// GET /api/referrals/referrer/:clientId
// Public — returns sanitized referrer + agent info
// ============================================

router.get("/referrer/:clientId", async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    // Validate UUID format
    if (!UUID_REGEX.test(clientId)) {
      return res.status(400).json({ error: "Invalid referral link" });
    }

    const referrer = await storage.getUserById(clientId);
    if (!referrer || referrer.role !== "client") {
      return res.status(404).json({ error: "Referral link not found" });
    }

    // Resolve the referrer's agent via their conversation
    let agentName = "a Heritage advisor";
    let agentAvatarUrl: string | null = null;
    try {
      const conversations = await storage.getClientConversationsByClientId(clientId);
      if (conversations.length > 0) {
        const agent = await storage.getUserById(conversations[0].agentId);
        if (agent) {
          agentName = `${agent.firstName} ${agent.lastName}`;
          agentAvatarUrl = agent.avatarUrl || null;
        }
      }
    } catch (err) {
      console.error("[Referrals] Failed to resolve agent:", err);
    }

    // Return only public-safe info — no email, phone, or IDs
    res.json({
      referrerFirstName: referrer.firstName,
      agentName,
      agentAvatarUrl,
      referralMessage: referrer.referralMessage || null,
    });
  } catch (error: any) {
    console.error("[Referrals] Failed to fetch referrer info:", error);
    res.status(500).json({ error: "Failed to load referral page" });
  }
});

// ============================================
// POST /api/referrals/submit
// Public + rate limited — create lead + referral + notify agent
// ============================================

router.post("/submit", referralFormLimiter, async (req: Request, res: Response) => {
  try {
    const { clientId, firstName, lastName, email, phone, coverageType, relationship, message } = req.body as {
      clientId: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      coverageType?: string;
      relationship?: string;
      message?: string;
    };

    // ── Validation ──
    if (!clientId || !UUID_REGEX.test(clientId)) {
      return res.status(400).json({ error: "Invalid referral link" });
    }
    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({ error: "First and last name are required" });
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: "A valid email address is required" });
    }
    const phoneDigits = (phone || "").replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      return res.status(400).json({ error: "A valid 10-digit phone number is required" });
    }

    // ── Look up referrer ──
    const referrer = await storage.getUserById(clientId);
    if (!referrer || referrer.role !== "client") {
      return res.status(404).json({ error: "Referral link not found" });
    }

    // ── Resolve agent ──
    let agentId: string | null = null;
    let agentName = "Heritage Advisor";

    try {
      const conversations = await storage.getClientConversationsByClientId(clientId);
      if (conversations.length > 0) {
        const agent = await storage.getUserById(conversations[0].agentId);
        if (agent) {
          agentId = agent.id;
          agentName = `${agent.firstName} ${agent.lastName}`;
        }
      }
    } catch (err) {
      console.error("[Referrals] Failed to resolve agent:", err);
    }

    // ── Create Lead ──
    const referrerName = `${referrer.firstName} ${referrer.lastName}`;
    const lead = await storage.createLead({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      source: "referral",
      sourceId: clientId,
      status: "new",
      priority: "high",
      coverageType: coverageType || null,
      assignedTo: agentId,
      notes: message ? `Referral message: ${message.trim()}` : null,
    } as any);

    console.log(`[Referrals] Lead created: ${lead.id} from referral by ${referrerName}`);

    // ── Create Referral Record ──
    let referralRecord: any = null;
    try {
      referralRecord = await storage.createReferral({
        referrerUserId: clientId,
        referredLeadId: lead.id,
        referredName: `${firstName.trim()} ${lastName.trim()}`,
        referredEmail: email.trim(),
        referredPhone: phone.trim(),
        relationship: relationship || null,
        status: "pending",
      } as any);
    } catch (refErr) {
      console.error("[Referrals] Failed to create referral record:", refErr);
    }

    // ── Award Referral Points (Helix: tied to referral action, not policy outcome) ──
    try {
      await storage.createReferralPointEntry({
        userId: clientId,
        amount: POINTS.REFERRAL_SUBMITTED,
        reason: `Referral submitted — ${firstName.trim()} ${lastName.trim()}`,
        sourceType: "referral_submitted",
        sourceId: referralRecord?.id || lead.id,
      } as any);
      console.log(`[Referrals] Points awarded to ${clientId}: +${POINTS.REFERRAL_SUBMITTED}`);

      // Check milestones
      const allReferrals = await storage.getReferralsByReferrerId(clientId);
      await checkAndAwardMilestones(clientId, allReferrals.length);
    } catch (ptsErr) {
      console.error("[Referrals] Failed to award points:", ptsErr);
    }

    // ── Create Lead Activity ──
    try {
      await storage.createLeadActivity({
        leadId: lead.id,
        type: "referral_submitted",
        description: `Referred by ${referrerName} (${referrer.email}). Relationship: ${relationship || "not specified"}.`,
      } as any);
    } catch (actErr) {
      console.error("[Referrals] Failed to create lead activity:", actErr);
    }

    // ── In-App Notification → Agent's Lead Inbox ──
    if (agentId) {
      const subjectLine = `New Referral from ${referrerName} — ${firstName.trim()} ${lastName.trim()}`;
      try {
        await storage.createNotification({
          userId: agentId,
          title: subjectLine,
          message: `${referrerName} referred ${firstName.trim()} ${lastName.trim()} (${email.trim()}, ${phone.trim()}). Check your lead inbox for details.`,
          type: "referral_received",
          isRead: false,
          actionUrl: "/agents/inbox",
        });
        console.log(`[Referrals] Notification sent to agent ${agentId}`);
      } catch (notifErr) {
        console.error("[Referrals] Notification delivery failed:", notifErr);
      }
    }

    res.status(201).json({
      success: true,
      message: "Referral submitted successfully",
      agentName,
    });
  } catch (error: any) {
    console.error("[Referrals] Submission failed:", error);
    res.status(500).json({ error: "Failed to submit referral" });
  }
});

export default router;
