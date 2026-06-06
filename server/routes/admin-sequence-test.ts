/**
 * Admin Sequence Test Routes  (mounted at /api/admin/sequences)
 *
 * QA tooling for the drip/email-sequence engine. Mirrors admin-email-test.ts's
 * admin-only gating (FOUNDER, OWNER, SYSTEM_ADMIN).
 *
 * Endpoints:
 *   POST /seed-templates  — idempotent upsert of the 5 hardcoded automation
 *                           templates into email_templates (by name).
 *   POST /test-enroll     — enroll a lead with nextSendAt = NOW (fire immediately).
 *   POST /run-now         — claim due enrollments + process each synchronously
 *                           (bypasses the 60s dispatcher tick / queue).
 */

import { Router, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { requireAuth, requireRole, type AuthenticatedUser } from "../middleware/auth";
import { Roles } from "../types/permissions";
import { emailTemplates, emailSequenceEnrollments } from "@shared/models/enterprise";
import {
  claimDueEnrollments,
  processEnrollmentStep,
  enrollLeadInSequence,
} from "../services/sequenceProcessor";

const router = Router();

// =============================================================================
// AUTH GATE — admin only (matches admin-email-test.ts)
// =============================================================================

const adminGate = [
  requireAuth,
  requireRole(Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN),
];

// =============================================================================
// SEED TEMPLATES
// =============================================================================

/**
 * The 5 hardcoded automation templates from server/services/automation-email.ts.
 * Bodies there are plain text; we wrap them into minimal HTML for the
 * email_templates.body_html (NOT NULL) column and keep the raw text in
 * body_text. Category 'drip_sequence' so suppression treats them as marketing.
 */
const SEED_TEMPLATES: Array<{ name: string; subject: string; text: string }> = [
  {
    name: "follow-up",
    subject: "Following Up - {{agent.name}} from Heritage Life Solutions",
    text: `Hi {{lead.firstName}},

I wanted to follow up on our previous conversation about your insurance needs.

Is there anything I can help clarify or any questions you might have? I'm here to help you find the right coverage for your family.

Feel free to reply to this email or give me a call at {{agent.phone}}.

Best regards,
{{agent.name}}
Heritage Life Solutions`,
  },
  {
    name: "birthday-greeting",
    subject: "Happy Birthday, {{client.firstName}}!",
    text: `Dear {{client.firstName}},

On behalf of everyone at Heritage Life Solutions, we want to wish you a very Happy Birthday!

We're grateful to have you as a valued client and hope your special day is filled with joy and celebration.

Warmest wishes,
{{agent.name}}
Heritage Life Solutions`,
  },
  {
    name: "renewal-reminder",
    subject: "Policy Renewal Reminder - Action Needed",
    text: `Dear {{client.firstName}},

This is a friendly reminder that your policy is coming up for renewal in 30 days.

To ensure continuous coverage for you and your family, please review your policy details and let us know if you'd like to make any changes.

We're here to help with any questions you might have about your renewal options.

Best regards,
{{agent.name}}
Heritage Life Solutions`,
  },
  {
    name: "quote-follow-up",
    subject: "Your Insurance Quote - Let's Connect",
    text: `Hi {{lead.firstName}},

I hope this email finds you well! I wanted to follow up on the insurance quote we discussed.

I understand choosing the right coverage is an important decision. If you have any questions or would like to explore other options, I'm here to help.

Would you have a few minutes this week for a quick call? I'd be happy to walk through the details with you.

Best regards,
{{agent.name}}
Heritage Life Solutions`,
  },
  {
    name: "welcome-new-client",
    subject: "Welcome to Heritage Life Solutions!",
    text: `Dear {{client.firstName}},

Welcome to the Heritage Life Solutions family!

We're thrilled to have you as our client and want to thank you for trusting us with your insurance needs.

Your agent, {{agent.name}}, will be your dedicated point of contact. Please don't hesitate to reach out with any questions.

Best regards,
The Heritage Life Solutions Team`,
  },
];

function textToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#222;">${escaped
    .split("\n")
    .map((line) => (line.trim() === "" ? "<br/>" : `<p style="margin:0 0 12px;">${line}</p>`))
    .join("")}</div>`;
}

/**
 * POST /seed-templates — idempotent upsert by name.
 */
router.post("/seed-templates", ...adminGate, async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser | undefined;
    const results: Array<{ name: string; id: string; action: "created" | "updated" }> = [];

    for (const tpl of SEED_TEMPLATES) {
      const html = textToHtml(tpl.text);
      const [existing] = await db
        .select({ id: emailTemplates.id })
        .from(emailTemplates)
        .where(eq(emailTemplates.name, tpl.name))
        .limit(1);

      if (existing) {
        await db
          .update(emailTemplates)
          .set({
            subject: tpl.subject,
            bodyHtml: html,
            bodyText: tpl.text,
            category: "drip_sequence",
            isActive: true,
            updatedAt: new Date(),
          })
          .where(eq(emailTemplates.id, existing.id));
        results.push({ name: tpl.name, id: existing.id, action: "updated" });
      } else {
        const [created] = await db
          .insert(emailTemplates)
          .values({
            name: tpl.name,
            subject: tpl.subject,
            bodyHtml: html,
            bodyText: tpl.text,
            category: "drip_sequence",
            isActive: true,
            createdBy: user?.id,
          })
          .returning({ id: emailTemplates.id });
        results.push({ name: tpl.name, id: created.id, action: "created" });
      }
    }

    res.json({ success: true, count: results.length, templates: results });
  } catch (error: any) {
    console.error("[AdminSequenceTest] seed-templates failed:", error?.message || error);
    res.status(500).json({ error: error?.message || "Failed to seed templates" });
  }
});

// =============================================================================
// TEST ENROLL
// =============================================================================

/**
 * POST /test-enroll  { sequenceId, leadId } — enroll then force nextSendAt=NOW.
 */
router.post("/test-enroll", ...adminGate, async (req: Request, res: Response) => {
  try {
    const { sequenceId, leadId } = req.body ?? {};
    if (typeof sequenceId !== "string" || typeof leadId !== "string") {
      return res.status(400).json({ error: "sequenceId and leadId are required" });
    }

    const enrollment = await enrollLeadInSequence(sequenceId, leadId);

    // Force it due immediately for QA.
    const [updated] = await db
      .update(emailSequenceEnrollments)
      .set({ nextSendAt: new Date() })
      .where(eq(emailSequenceEnrollments.id, enrollment.id))
      .returning();

    res.status(201).json(updated ?? enrollment);
  } catch (error: any) {
    const msg = error?.message || "Failed to test-enroll";
    const isBadReq = /not found|not active|no valid email/i.test(msg);
    res.status(isBadReq ? 400 : 500).json({ error: msg });
  }
});

// =============================================================================
// RUN NOW (synchronous, bypasses the queue)
// =============================================================================

/**
 * POST /run-now — claim due enrollments and process each step synchronously.
 * Returns per-enrollment results. Useful in environments without Redis.
 */
router.post("/run-now", ...adminGate, async (req: Request, res: Response) => {
  try {
    const batchLimit = Number(req.body?.batchLimit) || 100;
    const claimed = await claimDueEnrollments(batchLimit, 10);

    const results: Array<{ enrollmentId: string; status: string; reason?: string; error?: string }> = [];
    for (const enrollment of claimed) {
      try {
        const outcome = await processEnrollmentStep(enrollment.id);
        results.push({ enrollmentId: enrollment.id, status: outcome.status, reason: outcome.reason });
      } catch (err: any) {
        results.push({ enrollmentId: enrollment.id, status: "error", error: err?.message || String(err) });
      }
    }

    res.json({ success: true, claimed: claimed.length, results });
  } catch (error: any) {
    console.error("[AdminSequenceTest] run-now failed:", error?.message || error);
    res.status(500).json({ error: error?.message || "Failed to run sequences" });
  }
});

export default router;
