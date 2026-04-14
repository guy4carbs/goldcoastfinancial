import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS } from "../middleware/auth";

const router = Router();
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users } from "../../shared/models/auth";
import { agentProfiles } from "../../shared/models/agentProfiles";
import { contractingChecklists } from "../../shared/models/contracting";

// Public — no auth required
router.post("/submit", async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, agreedToTerms, agreedToPrivacy, ...profileData } = req.body;
    if (!email || !password || !firstName || !lastName) return res.status(400).json({ error: "Validation error: Required at \"email\"; Required at \"password\"; Required at \"firstName\"; Required at \"lastName\"; Required at \"phone\"; Required at \"agreedToTerms\"; Required at \"agreedToPrivacy\"" });
    const hash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({ email, password: hash, firstName, lastName, phone: phone || null, role: "sales_agent" }).returning();
    const [profile] = await db.insert(agentProfiles).values({ userId: user.id, firstName, lastName, email, phone, approvalStatus: "pending_review", agreedToTerms: agreedToTerms || false, agreedToPrivacy: agreedToPrivacy || false, ...profileData }).returning();
    await db.insert(contractingChecklists).values({ agentUserId: user.id });
    res.json({ success: true, profileId: profile.id, userId: user.id });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
