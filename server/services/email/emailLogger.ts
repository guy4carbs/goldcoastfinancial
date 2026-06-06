import { sql } from "drizzle-orm";
import { db } from "../../db";
import { emailsSent } from "@shared/models/enterprise";

// =============================================================================
// Email logger — best-effort writes to emails_sent + webhook status updates.
// =============================================================================
//
// Every logging path is non-throwing: email is best-effort and logging must
// never break a send or a webhook. All meta FK columns (leadId, fromAgentId,
// templateId, sequenceId, enrollmentId) are nullable in the schema, so we only
// set the ones we're given. toEmail/subject/status are the NOT NULL columns.

const MAX_BODY_BYTES = 50 * 1024; // ~50KB cap on stored html

function truncateBody(html?: string | null): string | null {
  if (!html) return null;
  if (Buffer.byteLength(html, "utf8") <= MAX_BODY_BYTES) return html;
  // Truncate by characters as a safe approximation, then hard-cap bytes.
  let out = html.slice(0, MAX_BODY_BYTES);
  while (Buffer.byteLength(out, "utf8") > MAX_BODY_BYTES) {
    out = out.slice(0, -1024);
  }
  return out + "\n<!-- [truncated] -->";
}

export interface LogEmailRecord {
  toEmail: string;
  subject: string;
  bodyHtml?: string | null;
  messageId?: string | null;
  status?: "sent" | "failed" | "skipped" | string;
  bounceReason?: string | null;
  leadId?: string | null;
  fromAgentId?: string | null;
  templateId?: string | null;
  sequenceId?: string | null;
  enrollmentId?: string | null;
}

/**
 * Insert an emails_sent row. Best-effort: swallows and warns on any error.
 */
export async function logEmailSent(record: LogEmailRecord): Promise<void> {
  try {
    await db.insert(emailsSent).values({
      toEmail: record.toEmail,
      subject: record.subject?.slice(0, 500) ?? "",
      bodyHtml: truncateBody(record.bodyHtml),
      messageId: record.messageId ?? null,
      status: record.status ?? "sent",
      bounceReason: record.bounceReason ?? null,
      leadId: record.leadId ?? null,
      fromAgentId: record.fromAgentId ?? null,
      templateId: record.templateId ?? null,
      sequenceId: record.sequenceId ?? null,
      enrollmentId: record.enrollmentId ?? null,
    });
  } catch (err: any) {
    console.warn("[emailLogger] logEmailSent failed (non-fatal):", err?.message);
  }
}

export interface EmailStatusPatch {
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  bounceReason?: string;
  status?: "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed" | string;
  incrementOpenCount?: boolean;
  incrementClickCount?: boolean;
}

/**
 * Idempotent status update keyed on the provider message id (emails_sent.message_id).
 *
 * - timestamp columns (delivered/opened/clicked/bounced) are only set when they
 *   are currently NULL — so replays of the same webhook don't shift the time.
 * - open/click counts increment each time when requested.
 * - bounceReason / status are set whenever provided.
 *
 * Best-effort: swallows and warns on error (webhook still returns 200).
 */
export async function updateEmailStatusByMessageId(
  messageId: string,
  patch: EmailStatusPatch,
): Promise<void> {
  if (!messageId) return;

  try {
    const sets: ReturnType<typeof sql>[] = [];

    if (patch.deliveredAt) {
      sets.push(sql`delivered_at = COALESCE(delivered_at, ${patch.deliveredAt})`);
    }
    if (patch.openedAt) {
      sets.push(sql`opened_at = COALESCE(opened_at, ${patch.openedAt})`);
    }
    if (patch.clickedAt) {
      sets.push(sql`clicked_at = COALESCE(clicked_at, ${patch.clickedAt})`);
    }
    if (patch.bouncedAt) {
      sets.push(sql`bounced_at = COALESCE(bounced_at, ${patch.bouncedAt})`);
    }
    if (patch.bounceReason !== undefined) {
      sets.push(sql`bounce_reason = ${patch.bounceReason}`);
    }
    if (patch.status !== undefined) {
      sets.push(sql`status = ${patch.status}`);
    }
    if (patch.incrementOpenCount) {
      sets.push(sql`open_count = COALESCE(open_count, 0) + 1`);
    }
    if (patch.incrementClickCount) {
      sets.push(sql`click_count = COALESCE(click_count, 0) + 1`);
    }

    if (sets.length === 0) return;

    await db.execute(sql`
      UPDATE ${emailsSent}
      SET ${sql.join(sets, sql`, `)}
      WHERE ${emailsSent.messageId} = ${messageId}
    `);
  } catch (err: any) {
    console.warn("[emailLogger] updateEmailStatusByMessageId failed (non-fatal):", err?.message);
  }
}
