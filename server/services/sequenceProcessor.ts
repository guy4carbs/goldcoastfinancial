/**
 * SEQUENCE PROCESSOR
 * Core logic for the drip/email-sequence engine (Phase 3).
 *
 * Responsibilities:
 *   - claimDueEnrollments():    atomically lease a batch of due enrollments
 *   - processEnrollmentStep():  send the current step's template, then advance
 *   - enrollLeadInSequence():   shared enroll helper (route + automation action)
 *   - unenrollLead():           complete a lead's active enrollments
 *   - computeNextSendAt():      delayDays/delayHours -> Date
 *
 * Data access lives here (own raw pool.query + Drizzle) rather than bloating
 * storage.ts. Snake_case column names are used for raw SQL; Drizzle models are
 * used for typed reads/inserts.
 *
 * Email transport is the shared `server/services/email` module (parallel
 * workstream). sendEmail() logs successful sends to emails_sent itself when
 * `meta` is provided, so we only insert our own emails_sent rows for SKIPPED
 * steps (audit trail of why a step did not send).
 */

import { eq, and } from "drizzle-orm";
import { db, pool } from "../db";
import {
  emailSequences,
  emailSequenceEnrollments,
  emailTemplates,
  emailsSent,
  deadLetterQueue,
  agentErrors,
} from "@shared/models/enterprise";
import { leads } from "@shared/models/crm";
import { evaluateCondition } from "./automation-engine";
// Shared transport module (parallel workstream — resolves once both land).
import { sendEmail, isSuppressed, resolveTemplate } from "./email";

// Basic email validation — matches server/routes/admin-email-test.ts.
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const DRIP_CATEGORY = "drip_sequence" as const;
const LEASE_RECOVERY_MINUTES = 30; // on final failure, retry after this long

type SequenceStep = {
  templateId: string;
  delayDays: number;
  delayHours: number;
  condition?: string;
};

// Raw enrollment row (snake_case) returned by the claim query.
interface RawEnrollment {
  id: string;
  sequence_id: string;
  lead_id: string;
  current_step: number | null;
  status: string;
  next_send_at: Date | null;
  enrolled_at: Date;
  completed_at: Date | null;
  unsubscribed_at: Date | null;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Compute the next send timestamp from a step's delay fields.
 * Zero delays => now.
 */
export function computeNextSendAt(step: Pick<SequenceStep, "delayDays" | "delayHours">): Date {
  const days = Number(step?.delayDays) || 0;
  const hours = Number(step?.delayHours) || 0;
  const ms = days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000;
  return new Date(Date.now() + ms);
}

function getSteps(sequence: { steps: unknown }): SequenceStep[] {
  const steps = sequence?.steps;
  return Array.isArray(steps) ? (steps as SequenceStep[]) : [];
}

// =============================================================================
// CLAIM DUE ENROLLMENTS (atomic lease via SKIP LOCKED)
// =============================================================================

/**
 * Atomically claim a batch of due enrollments.
 *
 * The single UPDATE...FROM(SELECT...FOR UPDATE SKIP LOCKED) statement both
 * selects the due rows and pushes their next_send_at forward by `leaseMinutes`
 * — a crash-recovery lease. If the worker dies mid-step the row re-surfaces
 * after the lease expires; on success processEnrollmentStep overwrites
 * next_send_at with the real next step time (or completes the enrollment).
 *
 * Returns the claimed rows (snake_case).
 */
export async function claimDueEnrollments(
  batchLimit = 100,
  leaseMinutes = 10,
): Promise<RawEnrollment[]> {
  const result = await pool.query<RawEnrollment>(
    `UPDATE email_sequence_enrollments
        SET next_send_at = NOW() + ($2 || ' minutes')::interval
      WHERE id IN (
        SELECT id FROM email_sequence_enrollments
         WHERE status = 'active'
           AND next_send_at IS NOT NULL
           AND next_send_at <= NOW()
         ORDER BY next_send_at
         LIMIT $1
         FOR UPDATE SKIP LOCKED
      )
      RETURNING *`,
    [batchLimit, String(leaseMinutes)],
  );
  return result.rows;
}

// =============================================================================
// PROCESS A SINGLE ENROLLMENT STEP
// =============================================================================

/**
 * Process the current step of an enrollment: guard, resolve template, send,
 * then advance (or complete). Throws on transport failure so BullMQ retries.
 */
export async function processEnrollmentStep(
  enrollmentId: string,
): Promise<{ status: string; reason?: string; step?: number; messageId?: string | null }> {
  // ── Load enrollment ──────────────────────────────────────────────────────
  const [enrollment] = await db
    .select()
    .from(emailSequenceEnrollments)
    .where(eq(emailSequenceEnrollments.id, enrollmentId))
    .limit(1);

  if (!enrollment) {
    return { status: "skipped", reason: "enrollment_not_found" };
  }
  if (enrollment.status !== "active") {
    return { status: "skipped", reason: `enrollment_${enrollment.status}` };
  }

  // ── Load sequence ────────────────────────────────────────────────────────
  const [sequence] = await db
    .select()
    .from(emailSequences)
    .where(eq(emailSequences.id, enrollment.sequenceId))
    .limit(1);

  if (!sequence) {
    await completeEnrollment(enrollmentId);
    return { status: "completed", reason: "sequence_not_found" };
  }
  if (sequence.isActive === false) {
    await completeEnrollment(enrollmentId);
    return { status: "completed", reason: "sequence_inactive" };
  }

  const steps = getSteps(sequence);
  const currentStep = enrollment.currentStep ?? 0;

  // No more steps -> complete.
  if (currentStep >= steps.length) {
    await completeEnrollment(enrollmentId);
    return { status: "completed", reason: "no_more_steps" };
  }

  const step = steps[currentStep];

  // ── Load lead ────────────────────────────────────────────────────────────
  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.id, enrollment.leadId))
    .limit(1);

  if (!lead) {
    await completeEnrollment(enrollmentId);
    return { status: "completed", reason: "lead_not_found" };
  }

  const toEmail = (lead.email || "").trim();
  if (!toEmail || !EMAIL_REGEX.test(toEmail)) {
    // Invalid email is terminal for this enrollment.
    await recordSkip(enrollment, step, toEmail || "(none)", "invalid_email");
    await completeEnrollment(enrollmentId);
    return { status: "completed", reason: "invalid_email" };
  }

  // ── Step condition (optional) ────────────────────────────────────────────
  // Conditions are simple "field operator value" strings evaluated against the
  // lead context. Format: "<field> <operator> <value>" (value optional). If a
  // condition is present and fails, advance WITHOUT sending.
  if (step.condition && step.condition.trim()) {
    const passed = evaluateStepCondition(step.condition, { lead });
    if (!passed) {
      await advanceStep(enrollment, steps, currentStep);
      return { status: "advanced", reason: "condition_failed", step: currentStep };
    }
  }

  // ── Suppression check (record skip + advance) ────────────────────────────
  if (await isSuppressed(toEmail, DRIP_CATEGORY)) {
    await recordSkip(enrollment, step, toEmail, "suppressed");
    await advanceStep(enrollment, steps, currentStep);
    return { status: "skipped", reason: "suppressed", step: currentStep };
  }

  // ── Idempotency: don't double-send the same step ─────────────────────────
  const alreadySent = await db
    .select({ id: emailsSent.id })
    .from(emailsSent)
    .where(
      and(
        eq(emailsSent.enrollmentId, enrollmentId),
        eq(emailsSent.templateId, step.templateId),
        eq(emailsSent.status, "sent"),
      ),
    )
    .limit(1);

  if (alreadySent.length > 0) {
    await advanceStep(enrollment, steps, currentStep);
    return { status: "advanced", reason: "already_sent", step: currentStep };
  }

  // ── Resolve template ─────────────────────────────────────────────────────
  const [template] = await db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.id, step.templateId))
    .limit(1);

  if (!template) {
    // Missing template is a config error for this step — skip + advance so the
    // enrollment isn't stuck forever.
    await recordSkip(enrollment, step, toEmail, "template_not_found");
    await advanceStep(enrollment, steps, currentStep);
    return { status: "skipped", reason: "template_not_found", step: currentStep };
  }

  const ctx = { lead, sequence };
  const subject = resolveTemplate(template.subject || "", ctx);
  const html = resolveTemplate(template.bodyHtml || "", ctx);
  const text = template.bodyText ? resolveTemplate(template.bodyText, ctx) : undefined;

  // ── Send ─────────────────────────────────────────────────────────────────
  // sendEmail logs the emails_sent row itself when meta is provided, so we do
  // NOT insert our own row on success (avoids the double-log the transport
  // would otherwise duplicate).
  const sendResult = await sendEmail({
    to: toEmail,
    subject,
    html,
    text,
    category: DRIP_CATEGORY,
    idempotencyKey: `${enrollmentId}:${currentStep}`,
    meta: {
      leadId: enrollment.leadId,
      templateId: step.templateId,
      sequenceId: enrollment.sequenceId,
      enrollmentId,
    },
  });

  // On success -> advance / complete.
  await advanceStep(enrollment, steps, currentStep);

  return {
    status: "sent",
    step: currentStep,
    messageId: sendResult?.id ?? sendResult?.data?.id ?? null,
  };
}

/**
 * Evaluate a step condition string of the form "<field> <operator> <value>".
 * Reuses the shared evaluateCondition operator semantics. Field is resolved as
 * a dotted path against { lead }. Unparseable conditions pass (fail-open) so a
 * malformed condition never silently halts a sequence.
 */
function evaluateStepCondition(condition: string, ctx: { lead: any }): boolean {
  const parts = condition.trim().split(/\s+/);
  if (parts.length < 2) return true; // can't parse -> don't block

  const [field, operator, ...rest] = parts;
  const rawValue = rest.join(" ");

  // Resolve dotted field path against context (default scope: lead.<field>).
  const resolved = resolveFieldPath(field, ctx);

  // Coerce expected value: number if numeric, boolean if true/false, else string.
  let expected: any = rawValue;
  if (rawValue === "") expected = undefined;
  else if (/^-?\d+(\.\d+)?$/.test(rawValue)) expected = Number(rawValue);
  else if (rawValue === "true") expected = true;
  else if (rawValue === "false") expected = false;

  return evaluateCondition(operator, resolved, expected);
}

function resolveFieldPath(field: string, ctx: Record<string, any>): any {
  const parts = field.split(".");
  // Default unqualified field to the lead scope.
  let value: any = parts[0] in ctx ? ctx : ctx.lead;
  for (const part of parts) {
    if (value && typeof value === "object" && part in value) {
      value = value[part];
    } else {
      return undefined;
    }
  }
  return value;
}

// =============================================================================
// STEP ADVANCEMENT / COMPLETION
// =============================================================================

/**
 * Advance to the next step: compute nextSendAt from the next step's delays, or
 * complete the enrollment if this was the last step.
 */
async function advanceStep(
  enrollment: typeof emailSequenceEnrollments.$inferSelect,
  steps: SequenceStep[],
  currentStep: number,
): Promise<void> {
  const nextStep = currentStep + 1;

  if (nextStep >= steps.length) {
    await completeEnrollment(enrollment.id);
    return;
  }

  const nextSendAt = computeNextSendAt(steps[nextStep]);

  await db
    .update(emailSequenceEnrollments)
    .set({ currentStep: nextStep, nextSendAt })
    .where(eq(emailSequenceEnrollments.id, enrollment.id));
}

async function completeEnrollment(enrollmentId: string): Promise<void> {
  await db
    .update(emailSequenceEnrollments)
    .set({ status: "completed", completedAt: new Date(), nextSendAt: null })
    .where(eq(emailSequenceEnrollments.id, enrollmentId));
}

/**
 * Record a SKIPPED step in emails_sent for the audit trail. The status column
 * is plain text (not a DB enum); 'skipped' is safe and the skip reason is
 * stored in bounce_reason.
 */
async function recordSkip(
  enrollment: typeof emailSequenceEnrollments.$inferSelect,
  step: SequenceStep,
  toEmail: string,
  reason: string,
): Promise<void> {
  try {
    await db.insert(emailsSent).values({
      leadId: enrollment.leadId,
      templateId: step.templateId,
      sequenceId: enrollment.sequenceId,
      enrollmentId: enrollment.id,
      toEmail,
      subject: `[skipped: ${reason}]`,
      status: "skipped",
      bounceReason: reason,
    });
  } catch (err: any) {
    console.error(`[SequenceProcessor] Failed to record skip (${reason}):`, err?.message || err);
  }
}

// =============================================================================
// FINAL-FAILURE HANDLER (called by the worker on last-attempt failure)
// =============================================================================

/**
 * Record a permanently-failed send to deadLetterQueue + agentErrors and reset
 * next_send_at to NOW()+30min so the enrollment self-recovers on a later tick.
 */
export async function handleStepFailure(
  enrollmentId: string,
  error: Error,
): Promise<void> {
  try {
    await db.insert(deadLetterQueue).values({
      eventId: `sequence:send:${enrollmentId}`,
      eventType: "sequence:send",
      sourceAgent: "sequence-processor",
      payload: { enrollmentId },
      errorMessage: error?.message || String(error),
      status: "pending",
    });
  } catch (err: any) {
    console.error("[SequenceProcessor] Failed to write deadLetterQueue:", err?.message || err);
  }

  try {
    await db.insert(agentErrors).values({
      agentName: "sequence-processor",
      errorType: "sequence_send_failed",
      errorMessage: error?.message || String(error),
      stackTrace: error?.stack,
      eventId: `sequence:send:${enrollmentId}`,
    });
  } catch (err: any) {
    console.error("[SequenceProcessor] Failed to write agentErrors:", err?.message || err);
  }

  // Self-recovery: push next attempt out so the dispatcher re-claims it later.
  try {
    await db
      .update(emailSequenceEnrollments)
      .set({ nextSendAt: new Date(Date.now() + LEASE_RECOVERY_MINUTES * 60 * 1000) })
      .where(eq(emailSequenceEnrollments.id, enrollmentId));
  } catch (err: any) {
    console.error("[SequenceProcessor] Failed to reset next_send_at:", err?.message || err);
  }
}

// =============================================================================
// ENROLL / UNENROLL
// =============================================================================

/**
 * Enroll a lead into a sequence (shared by route + automation action).
 * - validates sequence exists + isActive
 * - validates lead exists + has a valid email
 * - enforces one active enrollment per (sequenceId, leadId)
 * Returns the new enrollment, or the existing active one if already enrolled.
 */
export async function enrollLeadInSequence(
  sequenceId: string,
  leadId: string,
): Promise<typeof emailSequenceEnrollments.$inferSelect> {
  const [sequence] = await db
    .select()
    .from(emailSequences)
    .where(eq(emailSequences.id, sequenceId))
    .limit(1);

  if (!sequence) {
    throw new Error(`Sequence ${sequenceId} not found`);
  }
  if (sequence.isActive === false) {
    throw new Error(`Sequence ${sequenceId} is not active`);
  }

  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);

  if (!lead) {
    throw new Error(`Lead ${leadId} not found`);
  }
  const email = (lead.email || "").trim();
  if (!email || !EMAIL_REGEX.test(email)) {
    throw new Error(`Lead ${leadId} has no valid email`);
  }

  // One active enrollment per (sequenceId, leadId).
  const existing = await db
    .select()
    .from(emailSequenceEnrollments)
    .where(
      and(
        eq(emailSequenceEnrollments.sequenceId, sequenceId),
        eq(emailSequenceEnrollments.leadId, leadId),
        eq(emailSequenceEnrollments.status, "active"),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const steps = getSteps(sequence);
  const nextSendAt = steps.length > 0 ? computeNextSendAt(steps[0]) : null;

  const [created] = await db
    .insert(emailSequenceEnrollments)
    .values({
      sequenceId,
      leadId,
      currentStep: 0,
      status: "active",
      nextSendAt,
    })
    .returning();

  return created;
}

/**
 * Complete all active enrollments for a lead (exit rule: won/lost, etc.).
 * Returns the number of enrollments completed.
 */
export async function unenrollLead(leadId: string, reason?: string): Promise<number> {
  const updated = await db
    .update(emailSequenceEnrollments)
    .set({ status: "completed", completedAt: new Date(), nextSendAt: null })
    .where(
      and(
        eq(emailSequenceEnrollments.leadId, leadId),
        eq(emailSequenceEnrollments.status, "active"),
      ),
    )
    .returning({ id: emailSequenceEnrollments.id });

  if (updated.length > 0) {
    console.log(
      `[SequenceProcessor] Unenrolled lead ${leadId} from ${updated.length} sequence(s)${reason ? ` (${reason})` : ""}`,
    );
  }
  return updated.length;
}
