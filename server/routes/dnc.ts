/**
 * DNC (Do Not Call) API Routes
 * Manages the persistent DNC list for compliance and lead management
 */

import { Router, type Request, type Response } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { RoleGroups } from "../types/permissions";
import { storage } from "../storage";

const router = Router();

/** Normalize phone to E.164 for consistent lookups */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
  if (digits.length === 10) return '+1' + digits;
  return phone.startsWith('+') ? phone : '+' + digits;
}

// GET /api/dnc — Paginated DNC list
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;
    const search = req.query.search as string | undefined;

    const result = await storage.getDncList({ limit, offset, search });
    res.json(result);
  } catch (error: any) {
    console.error("[DNC] List error:", error.message);
    res.status(500).json({ error: "Failed to fetch DNC list" });
  }
});

// POST /api/dnc — Add phone to DNC
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { phoneNumber, reason, source } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: "phoneNumber is required" });
    }

    const normalized = normalizePhone(phoneNumber);
    const record = await storage.addToDnc({
      phoneNumber: normalized,
      reason: reason || null,
      addedByUserId: req.user!.id,
      source: source || "manual",
    });

    res.json(record);
  } catch (error: any) {
    console.error("[DNC] Add error:", error.message);
    res.status(500).json({ error: "Failed to add to DNC" });
  }
});

// DELETE /api/dnc/:phoneNumber — Remove from DNC (manager+ only)
router.delete("/:phoneNumber", requireAuth, requireRole(...RoleGroups.MANAGEMENT), async (req: Request, res: Response) => {
  try {
    const phoneNumber = decodeURIComponent(req.params.phoneNumber);
    const normalized = normalizePhone(phoneNumber);
    await storage.removeFromDnc(normalized, req.user!.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error("[DNC] Remove error:", error.message);
    res.status(500).json({ error: "Failed to remove from DNC" });
  }
});

// GET /api/dnc/check/:phoneNumber — Check if on DNC
router.get("/check/:phoneNumber", requireAuth, async (req: Request, res: Response) => {
  try {
    const phoneNumber = decodeURIComponent(req.params.phoneNumber);
    const normalized = normalizePhone(phoneNumber);
    const isDnc = await storage.isOnDnc(normalized);
    res.json({ isDnc });
  } catch (error: any) {
    console.error("[DNC] Check error:", error.message);
    res.status(500).json({ error: "Failed to check DNC status" });
  }
});

// POST /api/dnc/check-batch — Batch check DNC
router.post("/check-batch", requireAuth, async (req: Request, res: Response) => {
  try {
    const { phoneNumbers } = req.body;
    if (!Array.isArray(phoneNumbers)) {
      return res.status(400).json({ error: "phoneNumbers array is required" });
    }

    const normalized = phoneNumbers.map(normalizePhone);
    const dncSet = await storage.batchCheckDnc(normalized);
    res.json({ dncNumbers: Array.from(dncSet) });
  } catch (error: any) {
    console.error("[DNC] Batch check error:", error.message);
    res.status(500).json({ error: "Failed to batch check DNC" });
  }
});

export default router;
