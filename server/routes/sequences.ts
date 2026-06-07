/**
 * Email Sequences API Routes  (mounted at /api/sequences)
 *
 * Drip/email-sequence management: sequence CRUD, enrollment, pause/resume/
 * unenroll, and per-enrollment history.
 *
 * Auth: requireAuth + requireRole(management tier). Sequences are an
 * org-level resource (not per-agent like automations), so they are gated to
 * managers and above rather than scoped by ownership.
 */

import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { and, eq, desc, sql, inArray } from "drizzle-orm";
import { db } from "../db";
import { requireAuth, requireRole, type AuthenticatedUser } from "../middleware/auth";
import { Roles } from "../types/permissions";
import {
  emailSequences,
  emailSequenceEnrollments,
  emailTemplates,
  emailsSent,
} from "@shared/models/emailPlatform";
import { leads } from "@shared/models/crm";
import { enrollLeadInSequence, computeNextSendAt } from "../services/sequenceProcessor";

const router = Router();

// =============================================================================
// AUTH GATE — management tier
// =============================================================================

const manageGate = [
  requireAuth,
  requireRole(
    Roles.FOUNDER,
    Roles.OWNER,
    Roles.SYSTEM_ADMIN,
    Roles.DIRECTOR,
    Roles.AGENCY_MANAGER,
    Roles.MANAGER,
  ),
];

// =============================================================================
// VALIDATION
// =============================================================================

const stepSchema = z.object({
  templateId: z.string().uuid(),
  delayDays: z.number().int().min(0),
  delayHours: z.number().int().min(0),
  condition: z.string().optional(),
});

const createSequenceSchema = z.object({
  name: z.string().min(1, "name is required"),
  description: z.string().optional(),
  triggerEvent: z.string().optional(),
  steps: z.array(stepSchema).min(1, "at least one step is required"),
  isActive: z.boolean().optional(),
});

const updateSequenceSchema = createSequenceSchema.partial();

/**
 * Verify every step's templateId exists in email_templates (and is active).
 * Returns the list of missing/invalid ids (empty = all valid).
 */
async function findInvalidTemplateIds(steps: Array<{ templateId: string }>): Promise<string[]> {
  const ids = Array.from(new Set(steps.map((s) => s.templateId)));
  if (ids.length === 0) return [];
  const rows = await db
    .select({ id: emailTemplates.id })
    .from(emailTemplates)
    .where(inArray(emailTemplates.id, ids));
  const found = new Set(rows.map((r) => r.id));
  return ids.filter((id) => !found.has(id));
}

function zodErr(res: Response, error: z.ZodError) {
  return res.status(400).json({ error: fromZodError(error).toString() });
}

// =============================================================================
// SEQUENCE CRUD
// =============================================================================

/**
 * GET /api/sequences — list sequences with active-enrollment counts.
 */
router.get("/", ...manageGate, async (_req: Request, res: Response) => {
  try {
    const sequences = await db.select().from(emailSequences).orderBy(desc(emailSequences.createdAt));

    // Active enrollment counts per sequence.
    const counts = await db
      .select({
        sequenceId: emailSequenceEnrollments.sequenceId,
        active: sql<number>`count(*) filter (where ${emailSequenceEnrollments.status} = 'active')`,
        total: sql<number>`count(*)`,
      })
      .from(emailSequenceEnrollments)
      .groupBy(emailSequenceEnrollments.sequenceId);

    const countMap = new Map(counts.map((c) => [c.sequenceId, c]));

    const result = sequences.map((seq) => {
      const c = countMap.get(seq.id);
      return {
        ...seq,
        activeEnrollments: Number(c?.active ?? 0),
        totalEnrollments: Number(c?.total ?? 0),
      };
    });

    res.json(result);
  } catch (error: any) {
    console.error("[Sequences] Error listing sequences:", error?.message || error);
    res.status(500).json({ error: "Failed to list sequences" });
  }
});

/**
 * POST /api/sequences — create a sequence.
 */
router.post("/", ...manageGate, async (req: Request, res: Response) => {
  try {
    const parsed = createSequenceSchema.safeParse(req.body);
    if (!parsed.success) return zodErr(res, parsed.error);

    const invalid = await findInvalidTemplateIds(parsed.data.steps);
    if (invalid.length > 0) {
      return res.status(400).json({ error: `Unknown templateId(s): ${invalid.join(", ")}` });
    }

    const user = req.user as AuthenticatedUser;
    const [created] = await db
      .insert(emailSequences)
      .values({
        name: parsed.data.name,
        description: parsed.data.description,
        triggerEvent: parsed.data.triggerEvent,
        steps: parsed.data.steps,
        isActive: parsed.data.isActive ?? true,
        createdBy: user?.id,
      })
      .returning();

    res.status(201).json(created);
  } catch (error: any) {
    console.error("[Sequences] Error creating sequence:", error?.message || error);
    res.status(500).json({ error: "Failed to create sequence" });
  }
});

/**
 * GET /api/sequences/options — lightweight {id, name} list of active sequences.
 *
 * Gated by requireAuth ONLY (any authenticated user can populate a picker),
 * unlike the management-gated CRUD routes.
 *
 * ORDERING CONSTRAINT: this MUST be registered before `GET /:id`. Express
 * matches routes in declaration order, so if `/:id` came first it would
 * capture the literal path "options" as :id and this handler would never run.
 */
router.get("/options", requireAuth, async (_req: Request, res: Response) => {
  try {
    const rows = await db
      .select({ id: emailSequences.id, name: emailSequences.name })
      .from(emailSequences)
      .where(eq(emailSequences.isActive, true))
      .orderBy(emailSequences.name);
    res.json(rows);
  } catch (error: any) {
    console.error("[Sequences] Error listing sequence options:", error?.message || error);
    res.status(500).json({ error: "Failed to list sequence options" });
  }
});

/**
 * GET /api/sequences/:id
 */
router.get("/:id", ...manageGate, async (req: Request, res: Response) => {
  try {
    const [seq] = await db
      .select()
      .from(emailSequences)
      .where(eq(emailSequences.id, req.params.id))
      .limit(1);
    if (!seq) return res.status(404).json({ error: "Sequence not found" });
    res.json(seq);
  } catch (error: any) {
    console.error("[Sequences] Error fetching sequence:", error?.message || error);
    res.status(500).json({ error: "Failed to fetch sequence" });
  }
});

/**
 * PATCH /api/sequences/:id
 */
router.patch("/:id", ...manageGate, async (req: Request, res: Response) => {
  try {
    const parsed = updateSequenceSchema.safeParse(req.body);
    if (!parsed.success) return zodErr(res, parsed.error);

    if (parsed.data.steps) {
      const invalid = await findInvalidTemplateIds(parsed.data.steps);
      if (invalid.length > 0) {
        return res.status(400).json({ error: `Unknown templateId(s): ${invalid.join(", ")}` });
      }
    }

    const [updated] = await db
      .update(emailSequences)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(emailSequences.id, req.params.id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Sequence not found" });
    res.json(updated);
  } catch (error: any) {
    console.error("[Sequences] Error updating sequence:", error?.message || error);
    res.status(500).json({ error: "Failed to update sequence" });
  }
});

/**
 * DELETE /api/sequences/:id — soft delete (isActive = false).
 */
router.delete("/:id", ...manageGate, async (req: Request, res: Response) => {
  try {
    const [updated] = await db
      .update(emailSequences)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(emailSequences.id, req.params.id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Sequence not found" });
    res.json({ success: true, id: updated.id, isActive: updated.isActive });
  } catch (error: any) {
    console.error("[Sequences] Error deleting sequence:", error?.message || error);
    res.status(500).json({ error: "Failed to delete sequence" });
  }
});

// =============================================================================
// ENROLLMENT
// =============================================================================

/**
 * POST /api/sequences/:id/enroll  { leadId }
 */
router.post("/:id/enroll", ...manageGate, async (req: Request, res: Response) => {
  try {
    const leadId = req.body?.leadId;
    if (typeof leadId !== "string" || !leadId) {
      return res.status(400).json({ error: "leadId is required" });
    }

    const enrollment = await enrollLeadInSequence(req.params.id, leadId);
    res.status(201).json(enrollment);
  } catch (error: any) {
    const msg = error?.message || "Failed to enroll lead";
    // Validation-style failures from the helper -> 400.
    const isBadReq = /not found|not active|no valid email/i.test(msg);
    res.status(isBadReq ? 400 : 500).json({ error: msg });
  }
});

/**
 * GET /api/sequences/:id/enrollments — list enrollments for a sequence.
 */
router.get("/:id/enrollments", ...manageGate, async (req: Request, res: Response) => {
  try {
    // Left-join leads so the UI can show who is enrolled, not just a leadId.
    const rows = await db
      .select({
        id: emailSequenceEnrollments.id,
        sequenceId: emailSequenceEnrollments.sequenceId,
        leadId: emailSequenceEnrollments.leadId,
        currentStep: emailSequenceEnrollments.currentStep,
        status: emailSequenceEnrollments.status,
        nextSendAt: emailSequenceEnrollments.nextSendAt,
        enrolledAt: emailSequenceEnrollments.enrolledAt,
        completedAt: emailSequenceEnrollments.completedAt,
        unsubscribedAt: emailSequenceEnrollments.unsubscribedAt,
        leadFirstName: leads.firstName,
        leadLastName: leads.lastName,
        leadEmail: leads.email,
      })
      .from(emailSequenceEnrollments)
      .leftJoin(leads, eq(leads.id, emailSequenceEnrollments.leadId))
      .where(eq(emailSequenceEnrollments.sequenceId, req.params.id))
      .orderBy(desc(emailSequenceEnrollments.enrolledAt));
    res.json(rows);
  } catch (error: any) {
    console.error("[Sequences] Error listing enrollments:", error?.message || error);
    res.status(500).json({ error: "Failed to list enrollments" });
  }
});

// =============================================================================
// ENROLLMENT LIFECYCLE
// =============================================================================

/**
 * POST /api/sequences/enrollments/:enrollmentId/pause
 */
router.post("/enrollments/:enrollmentId/pause", ...manageGate, async (req: Request, res: Response) => {
  try {
    const [updated] = await db
      .update(emailSequenceEnrollments)
      .set({ status: "paused" })
      .where(
        and(
          eq(emailSequenceEnrollments.id, req.params.enrollmentId),
          eq(emailSequenceEnrollments.status, "active"),
        ),
      )
      .returning();
    if (!updated) return res.status(404).json({ error: "Active enrollment not found" });
    res.json(updated);
  } catch (error: any) {
    console.error("[Sequences] Error pausing enrollment:", error?.message || error);
    res.status(500).json({ error: "Failed to pause enrollment" });
  }
});

/**
 * POST /api/sequences/enrollments/:enrollmentId/resume
 * Recomputes nextSendAt = NOW + current step's delays.
 */
router.post("/enrollments/:enrollmentId/resume", ...manageGate, async (req: Request, res: Response) => {
  try {
    const [enrollment] = await db
      .select()
      .from(emailSequenceEnrollments)
      .where(eq(emailSequenceEnrollments.id, req.params.enrollmentId))
      .limit(1);

    if (!enrollment) return res.status(404).json({ error: "Enrollment not found" });
    if (enrollment.status !== "paused") {
      return res.status(400).json({ error: `Cannot resume a ${enrollment.status} enrollment` });
    }

    const [sequence] = await db
      .select()
      .from(emailSequences)
      .where(eq(emailSequences.id, enrollment.sequenceId))
      .limit(1);

    const steps = Array.isArray(sequence?.steps) ? (sequence!.steps as Array<{ delayDays: number; delayHours: number }>) : [];
    const currentStep = enrollment.currentStep ?? 0;
    const nextSendAt =
      currentStep < steps.length ? computeNextSendAt(steps[currentStep]) : new Date();

    const [updated] = await db
      .update(emailSequenceEnrollments)
      .set({ status: "active", nextSendAt })
      .where(eq(emailSequenceEnrollments.id, req.params.enrollmentId))
      .returning();

    res.json(updated);
  } catch (error: any) {
    console.error("[Sequences] Error resuming enrollment:", error?.message || error);
    res.status(500).json({ error: "Failed to resume enrollment" });
  }
});

/**
 * POST /api/sequences/enrollments/:enrollmentId/unenroll
 * Completes the enrollment (status='completed').
 */
router.post("/enrollments/:enrollmentId/unenroll", ...manageGate, async (req: Request, res: Response) => {
  try {
    const [updated] = await db
      .update(emailSequenceEnrollments)
      .set({ status: "completed", completedAt: new Date(), nextSendAt: null })
      .where(eq(emailSequenceEnrollments.id, req.params.enrollmentId))
      .returning();
    if (!updated) return res.status(404).json({ error: "Enrollment not found" });
    res.json(updated);
  } catch (error: any) {
    console.error("[Sequences] Error unenrolling:", error?.message || error);
    res.status(500).json({ error: "Failed to unenroll" });
  }
});

/**
 * GET /api/sequences/enrollments/:enrollmentId/history
 * Email send history for an enrollment (joins emails_sent on enrollmentId).
 */
router.get("/enrollments/:enrollmentId/history", ...manageGate, async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(emailsSent)
      .where(eq(emailsSent.enrollmentId, req.params.enrollmentId))
      .orderBy(desc(emailsSent.sentAt));
    res.json(rows);
  } catch (error: any) {
    console.error("[Sequences] Error fetching enrollment history:", error?.message || error);
    res.status(500).json({ error: "Failed to fetch enrollment history" });
  }
});

export default router;
