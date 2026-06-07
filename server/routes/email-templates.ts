/**
 * Email Templates API Routes  (mounted at /api/email-templates)
 *
 * CRUD for reusable email templates referenced by drip sequences and
 * one-off agent sends. Soft-delete only (isActive = false) so historical
 * sequence steps / emails_sent rows keep a resolvable templateId.
 *
 * Auth: requireAuth + requireRole(management tier) — mirrors sequences.ts.
 * Templates are an org-level resource (not per-agent), so they are gated to
 * managers and above rather than scoped by ownership.
 */

import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { and, eq, desc } from "drizzle-orm";
import { db } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { Roles } from "../types/permissions";
import { emailTemplates } from "@shared/schema";

const router = Router();

// =============================================================================
// AUTH GATE — management tier (identical to sequences.ts)
// =============================================================================

const manageGate = [
  requireAuth,
  requireRole(
    Roles.FOUNDER,
    Roles.OWNER,
    Roles.SYSTEM_ADMIN,
    Roles.DIRECTOR,
    Roles.AGENCY_MANAGER,
    Roles.MANAGER_CANONICAL,
  ),
];

// =============================================================================
// VALIDATION
// =============================================================================

const createTemplateSchema = z.object({
  name: z.string().min(1, "name is required"),
  subject: z.string().min(1, "subject is required"),
  bodyHtml: z.string().min(1, "bodyHtml is required"),
  bodyText: z.string().optional(),
  category: z.string().optional(),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

const updateTemplateSchema = createTemplateSchema.partial();

function zodErr(res: Response, error: z.ZodError) {
  return res.status(400).json({ error: fromZodError(error).toString() });
}

// =============================================================================
// TEMPLATE CRUD
// =============================================================================

/**
 * GET /api/email-templates — list templates, newest first.
 * Optional filters: ?category=<string>&active=true|false
 */
router.get("/", ...manageGate, async (req: Request, res: Response) => {
  try {
    const conditions = [];

    const category = req.query.category;
    if (typeof category === "string" && category.length > 0) {
      conditions.push(eq(emailTemplates.category, category));
    }

    const active = req.query.active;
    if (active === "true") conditions.push(eq(emailTemplates.isActive, true));
    else if (active === "false") conditions.push(eq(emailTemplates.isActive, false));

    const rows = await db
      .select()
      .from(emailTemplates)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(emailTemplates.createdAt));

    res.json(rows);
  } catch (error: any) {
    console.error("[EmailTemplates] Error listing templates:", error?.message || error);
    res.status(500).json({ error: "Failed to list templates" });
  }
});

/**
 * POST /api/email-templates — create a template.
 */
router.post("/", ...manageGate, async (req: Request, res: Response) => {
  try {
    const parsed = createTemplateSchema.safeParse(req.body);
    if (!parsed.success) return zodErr(res, parsed.error);

    const [created] = await db
      .insert(emailTemplates)
      .values({
        name: parsed.data.name,
        subject: parsed.data.subject,
        bodyHtml: parsed.data.bodyHtml,
        bodyText: parsed.data.bodyText,
        category: parsed.data.category,
        variables: parsed.data.variables ?? [],
        isActive: parsed.data.isActive ?? true,
      })
      .returning();

    res.status(201).json(created);
  } catch (error: any) {
    console.error("[EmailTemplates] Error creating template:", error?.message || error);
    res.status(500).json({ error: "Failed to create template" });
  }
});

/**
 * GET /api/email-templates/:id
 */
router.get("/:id", ...manageGate, async (req: Request, res: Response) => {
  try {
    const [template] = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.id, req.params.id))
      .limit(1);
    if (!template) return res.status(404).json({ error: "Template not found" });
    res.json(template);
  } catch (error: any) {
    console.error("[EmailTemplates] Error fetching template:", error?.message || error);
    res.status(500).json({ error: "Failed to fetch template" });
  }
});

/**
 * PATCH /api/email-templates/:id
 */
router.patch("/:id", ...manageGate, async (req: Request, res: Response) => {
  try {
    const parsed = updateTemplateSchema.safeParse(req.body);
    if (!parsed.success) return zodErr(res, parsed.error);

    const [updated] = await db
      .update(emailTemplates)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(emailTemplates.id, req.params.id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Template not found" });
    res.json(updated);
  } catch (error: any) {
    console.error("[EmailTemplates] Error updating template:", error?.message || error);
    res.status(500).json({ error: "Failed to update template" });
  }
});

/**
 * DELETE /api/email-templates/:id — soft delete (isActive = false).
 */
router.delete("/:id", ...manageGate, async (req: Request, res: Response) => {
  try {
    const [updated] = await db
      .update(emailTemplates)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(emailTemplates.id, req.params.id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Template not found" });
    res.json({ success: true, id: updated.id, isActive: updated.isActive });
  } catch (error: any) {
    console.error("[EmailTemplates] Error deleting template:", error?.message || error);
    res.status(500).json({ error: "Failed to delete template" });
  }
});

export default router;
