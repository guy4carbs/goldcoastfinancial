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
 * Email transport is the shared `server/services/email` module. sendEmail()
 * logs successful sends to emails_sent itself when `meta` is provided, so we
 * only insert our own emails_sent rows for SKIPPED steps (audit trail of why a
 * step did not send).
 *
 * GOLD COAST ADAPTATION: Gold Coast does NOT run the drip worker (Heritage's
 * worker processes sequences). The queue-coupled final-failure handler
 * (handleStepFailure → deadLetterQueue / agentErrors) and the BullMQ-driven
 * worker are NOT ported. The route-facing helpers (enrollLeadInSequence,
 * computeNextSendAt) and the processing helpers remain available. The step
 * condition evaluator is inlined here (the automation-engine it shared on
 * Heritage is not part of the Gold Coast app).
 */

import { eq, and } from "drizzle-orm";
import { db, pool } from "../db";
import {
  emailSequences,
  emailSequenceEnrollments,
  emailTemplates,
  emailsSent,
} from "@shared/models/emailPlatform";
import { leads } from "@shared/models/crm";
// Shared transport module.
import { sendEmail, isSuppressed, resolveTemplate } from "./email";

// Basic email validation.
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const DRIP_CATEGORY = "drip_sequence" as const;

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
// CONDITION EVALUATION (inlined — Heritage shared this with automation-engine,
// which is not part of the Gold Coast app).
// =============================================================================

function parseDuration(value: any): number {
  // Returns milliseconds. Accepts a number of days or a "<n>d"/"<n>h" string.
  if (typeof value === "number") return value * 24 * 60 * 60 * 1000;
  const str = String(value ?? "").trim();
  const m = str.match(/^(\d+)\s*([dh]?)$/i);
  if (!m) return 0;
  const n = Number(m[1]);
  const unit = (m[2] || "d").toLowerCase();
  return unit === "h" ? n * 60 * 60 * 1000 : n * 24 * 60 * 60 * 1000;
}

function evaluateCondition(operator: string, actual: any, expected: any): boolean {
  switch (operator) {
    case "eq":
      return actual === expected;
    case "neq":
      return actual !== expected;
    case "gt":
      return actual > expected;
    case "gte":
      return actual >= expected;
    case "lt":
      return actual < expected;
    case "lte":
      return actual <= expected;
    case "contains":
      return typeof actual === "string" && actual.includes(expected);
    case "not_contains":
      return typeof actual === "string" && !actual.includes(expected);
    case "in":
      return Array.isArray(expected) && expected.includes(actual);
    case "not_in":
      return Array.isArray(expected) && !expected.includes(actual);
    case "is_empty":
      return actual === null || actual === undefined || actual === "" || (Array.isArray(actual) && actual.length === 0);
    case "is_not_empty":
      return actual !== null && actual !== undefined && actual !== "" && !(Array.isArray(actual) && actual.length === 0);
    case "is_today": {
      if (!actual) return false;
      const today = new Date();
      const date = new Date(actual);
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth()
      );
    }
    case "older_than": {
      if (!actual) return false;
      const daysAgo = parseDuration(expected);
      const cutoff = new Date(Date.now() - daysAgo);
      return new Date(actual) < cutoff;
    }
    case "days_until": {
      if (!actual) return false;
      const targetDate = new Date(actual);
      const now = new Date();
      const diffDays = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays === expected;
    }
    case "past_due":
      if (!actual) return false;
      return new Date(actual) < new Date();
    default:
      console.warn(`[SequenceProcessor] Unknown operator: ${operator}`);
      return false;
  }
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
 * then advance (or complete). Throws on transport failure so a worker retries.
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
