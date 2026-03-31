/**
 * Business Card API Routes
 * Digital business card for agents — view, edit, and share
 */
import { Router, Request, Response } from "express";
import multer from "multer";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";
import * as s3Service from "../services/s3Service";

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPG, PNG, GIF, WebP) are allowed"));
    }
  },
});

const router = Router();

// =============================================================================
// GET /my-card — Get current agent's business card data
// =============================================================================
router.get("/my-card", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const result = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.avatar_url, u.role,
             ap.title, ap.company_name, ap.website_url,
             ap.license_number, ap.npn, ap.licensed_states,
             ap.linkedin_url, ap.instagram_url, ap.facebook_url, ap.twitter_url
      FROM users u
      LEFT JOIN agent_profiles ap ON ap.user_id = u.id::text
      WHERE u.id = $1::uuid
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const r = result.rows[0];
    res.json({
      success: true,
      data: {
        id: r.id,
        firstName: r.first_name || '',
        lastName: r.last_name || '',
        email: r.email || '',
        phone: r.phone || '',
        avatarUrl: r.avatar_url || '',
        role: r.role || '',
        title: r.title || 'Licensed Insurance Agent',
        companyName: r.company_name || 'Heritage Life Solutions',
        websiteUrl: r.website_url || 'https://heritagels.org',
        licenseNumber: r.license_number || '',
        npn: r.npn || '',
        licensedStates: r.licensed_states || [],
        linkedinUrl: r.linkedin_url || '',
        instagramUrl: r.instagram_url || '',
        facebookUrl: r.facebook_url || '',
        twitterUrl: r.twitter_url || '',
      },
    });
  } catch (error: any) {
    console.error("[BusinessCard] Error fetching card:", error?.message);
    res.status(500).json({ success: false, message: "Failed to fetch business card" });
  }
});

// =============================================================================
// PATCH /my-card — Update business card fields
// =============================================================================
router.patch("/my-card", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const { title, companyName, websiteUrl, linkedinUrl, instagramUrl, facebookUrl, twitterUrl, phone, email, avatarUrl, licenseNumber, npn, licensedStates } = req.body;

    // Update users table fields (phone, email, avatarUrl)
    const userClauses: string[] = [];
    const userParams: any[] = [];
    let uIdx = 1;

    if (phone !== undefined) { userClauses.push(`phone = $${uIdx}`); userParams.push(phone); uIdx++; }
    if (email !== undefined) { userClauses.push(`email = $${uIdx}`); userParams.push(email); uIdx++; }
    if (avatarUrl !== undefined) { userClauses.push(`avatar_url = $${uIdx}`); userParams.push(avatarUrl); uIdx++; }

    if (userClauses.length > 0) {
      userParams.push(userId);
      await pool.query(
        `UPDATE users SET ${userClauses.join(', ')} WHERE id = $${uIdx}::uuid`,
        userParams
      );
    }

    // Ensure agent_profiles row exists (upsert)
    await pool.query(
      `INSERT INTO agent_profiles (user_id) VALUES ($1::text) ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );

    // Update agent_profiles table fields
    const setClauses: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (title !== undefined) { setClauses.push(`title = $${idx}`); params.push(title); idx++; }
    if (companyName !== undefined) { setClauses.push(`company_name = $${idx}`); params.push(companyName); idx++; }
    if (websiteUrl !== undefined) { setClauses.push(`website_url = $${idx}`); params.push(websiteUrl); idx++; }
    if (linkedinUrl !== undefined) { setClauses.push(`linkedin_url = $${idx}`); params.push(linkedinUrl); idx++; }
    if (instagramUrl !== undefined) { setClauses.push(`instagram_url = $${idx}`); params.push(instagramUrl); idx++; }
    if (facebookUrl !== undefined) { setClauses.push(`facebook_url = $${idx}`); params.push(facebookUrl); idx++; }
    if (twitterUrl !== undefined) { setClauses.push(`twitter_url = $${idx}`); params.push(twitterUrl); idx++; }
    if (licenseNumber !== undefined) { setClauses.push(`license_number = $${idx}`); params.push(licenseNumber); idx++; }
    if (npn !== undefined) { setClauses.push(`npn = $${idx}`); params.push(npn); idx++; }
    if (licensedStates !== undefined) { setClauses.push(`licensed_states = $${idx}`); params.push(licensedStates); idx++; }

    if (setClauses.length > 0) {
      params.push(userId);
      await pool.query(
        `UPDATE agent_profiles SET ${setClauses.join(', ')} WHERE user_id = $${idx}::text`,
        params
      );
    }

    res.json({ success: true, message: "Business card updated" });
  } catch (error: any) {
    console.error("[BusinessCard] Error updating card:", error?.message);
    res.status(500).json({ success: false, message: "Failed to update business card" });
  }
});

// =============================================================================
// POST /my-card/avatar — Upload avatar photo
// =============================================================================
router.post("/my-card/avatar", requireAuth, avatarUpload.single("file"), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const validation = s3Service.validateFile(file.originalname, file.mimetype, file.size);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    const uploadResult = await s3Service.uploadFile(
      userId,
      file.originalname,
      file.buffer,
      { contentType: file.mimetype, metadata: { purpose: "avatar" } },
      "avatars"
    );

    if (!uploadResult.success) {
      return res.status(500).json({ success: false, message: uploadResult.error || "Upload failed" });
    }

    // Update avatar_url in users table
    await pool.query(
      `UPDATE users SET avatar_url = $1 WHERE id = $2::uuid`,
      [uploadResult.url || uploadResult.key, userId]
    );

    res.json({ success: true, avatarUrl: uploadResult.url || uploadResult.key });
  } catch (error: any) {
    console.error("[BusinessCard] Avatar upload error:", error?.message);
    res.status(500).json({ success: false, message: "Failed to upload avatar" });
  }
});

// =============================================================================
// PUBLIC: GET /public/:userId — View an agent's business card (no auth)
// =============================================================================
export const publicBusinessCardRouter = Router();

publicBusinessCardRouter.get("/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.avatar_url, u.role,
             ap.title, ap.company_name, ap.website_url,
             ap.license_number, ap.npn, ap.licensed_states,
             ap.linkedin_url, ap.instagram_url, ap.facebook_url, ap.twitter_url
      FROM users u
      LEFT JOIN agent_profiles ap ON ap.user_id = u.id::text
      WHERE u.id = $1::uuid AND u.role IN ('sales_agent', 'manager', 'owner', 'system_admin')
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    const r = result.rows[0];
    res.json({
      success: true,
      data: {
        id: r.id,
        firstName: r.first_name || '',
        lastName: r.last_name || '',
        email: r.email || '',
        phone: r.phone || '',
        avatarUrl: r.avatar_url || '',
        title: r.title || 'Licensed Insurance Agent',
        companyName: r.company_name || 'Heritage Life Solutions',
        websiteUrl: r.website_url || 'https://heritagels.org',
        licenseNumber: r.license_number || '',
        npn: r.npn || '',
        licensedStates: r.licensed_states || [],
        linkedinUrl: r.linkedin_url || '',
        instagramUrl: r.instagram_url || '',
        facebookUrl: r.facebook_url || '',
        twitterUrl: r.twitter_url || '',
      },
    });
  } catch (error: any) {
    console.error("[BusinessCard] Error fetching public card:", error?.message);
    res.status(500).json({ success: false, message: "Failed to fetch business card" });
  }
});

export default router;
