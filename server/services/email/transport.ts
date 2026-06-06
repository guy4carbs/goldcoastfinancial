import { z } from "zod";
import { Resend } from "resend";
import type { EmailCategory } from "@shared/models/email";
import { isMarketingCategory } from "@shared/models/email";
import { isSuppressed } from "./suppression";
import { buildListUnsubscribeHeaders } from "./unsubscribeToken";
import { logEmailSent } from "./emailLogger";
import { sendStructured as gmailSendStructured } from "./gmailRawTransport";

// =============================================================================
// CANONICAL EMAIL TRANSPORT CONTRACT
// =============================================================================
//
// All system-email workstreams (gmail.ts refactor, automation-email, drip
// engine) code against these exact shapes. Do not deviate.

export interface EmailSendInput {
  to: string;
  from?: string; // default: GMAIL_FROM_EMAIL || 'contact@heritagels.org'
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{ filename: string; content: Buffer; contentType?: string }>;
  headers?: Record<string, string>;
  category: EmailCategory;
  idempotencyKey?: string;
  meta?: {
    leadId?: string;
    fromAgentId?: string;
    templateId?: string;
    sequenceId?: string;
    enrollmentId?: string;
  };
}

export interface EmailSendResult {
  id: string | null;
  provider: "resend" | "gmail";
  // compat shim — existing callers read result.data.id
  data: { id: string | null };
}

const DEFAULT_FROM = process.env.GMAIL_FROM_EMAIL || "contact@heritagels.org";

// Categories whose email bodies carry secrets (OTP codes, reset links,
// tokenized secure-form links). Their bodyHtml is never persisted to
// emails_sent — the auth_email_otp table already stores only hashed codes,
// and logging the rendered email would defeat that.
const SENSITIVE_LOG_CATEGORIES: ReadonlySet<EmailCategory> = new Set([
  "two_factor",
  "password_reset",
  "secure_form",
] as EmailCategory[]);

// Validate at the boundary. The to-address is lowercased+trimmed only for the
// validity check; the original trimmed value is what we send to.
// CR/LF in address fields is an email header-injection attempt — reject hard.
const NO_CRLF = /^[^\r\n]*$/;
const inputSchema = z.object({
  to: z.string().min(3).max(320).regex(NO_CRLF, "newlines not allowed"),
  replyTo: z.string().max(320).regex(NO_CRLF, "newlines not allowed").optional(),
  subject: z.string().min(1).max(998),
  html: z.string().min(1),
});

// ── Lazy Resend singleton ────────────────────────────────────────────────────
let resendClient: Resend | null = null;
function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

function selectProvider(): "resend" | "gmail" {
  const p = (process.env.EMAIL_PROVIDER || "gmail").toLowerCase();
  return p === "resend" ? "resend" : "gmail";
}

function buildLogMeta(input: EmailSendInput) {
  return {
    toEmail: input.to,
    subject: input.subject,
    bodyHtml: SENSITIVE_LOG_CATEGORIES.has(input.category)
      ? `[redacted:${input.category}]`
      : input.html,
    leadId: input.meta?.leadId ?? null,
    fromAgentId: input.meta?.fromAgentId ?? null,
    templateId: input.meta?.templateId ?? null,
    sequenceId: input.meta?.sequenceId ?? null,
    enrollmentId: input.meta?.enrollmentId ?? null,
  };
}

/**
 * Send a system email. Best-effort: callers treat email as fire-and-forget and
 * this function never throws — failures resolve to { id: null }.
 *
 * Pipeline: validate → suppression gate → unsubscribe headers (marketing only)
 *           → provider send (with optional Gmail fallback) → log.
 */
export async function sendEmail(input: EmailSendInput): Promise<EmailSendResult> {
  const provider = selectProvider();

  // 1. Validate at the boundary. Subject newlines are stripped (defensive);
  //    CR/LF in to/replyTo is rejected as a header-injection attempt.
  const trimmedTo = (input.to ?? "").trim();
  const safeSubject = (input.subject ?? "").replace(/[\r\n]+/g, " ").trim();
  const parsed = inputSchema.safeParse({
    to: trimmedTo,
    replyTo: input.replyTo?.trim(),
    subject: safeSubject,
    html: input.html,
  });
  if (!parsed.success) {
    console.warn("[email/transport] invalid email input:", parsed.error.issues?.[0]?.message);
    await logEmailSent({ ...buildLogMeta(input), toEmail: trimmedTo.replace(/[\r\n]+/g, " ") || "(invalid)", status: "failed", bounceReason: "invalid_input" });
    return { id: null, provider, data: { id: null } };
  }

  const normalizedInput: EmailSendInput = {
    ...input,
    to: trimmedTo,
    replyTo: input.replyTo?.trim(),
    subject: safeSubject,
  };

  // 2. Suppression gate.
  let suppressed = false;
  try {
    suppressed = await isSuppressed(trimmedTo, input.category);
  } catch (err: any) {
    console.warn("[email/transport] suppression check failed, proceeding:", err?.message);
  }
  if (suppressed) {
    await logEmailSent({ ...buildLogMeta(normalizedInput), status: "failed", bounceReason: "suppressed" });
    return { id: null, provider, data: { id: null } };
  }

  // 3. Marketing categories: merge List-Unsubscribe headers unless the caller
  //    already provided them. Transactional categories never get them.
  let headers = normalizedInput.headers;
  if (isMarketingCategory(input.category)) {
    const hasUnsub = headers && Object.keys(headers).some((h) => h.toLowerCase() === "list-unsubscribe");
    if (!hasUnsub) {
      headers = { ...buildListUnsubscribeHeaders(trimmedTo, input.category), ...(headers || {}) };
    }
  }

  const sendInput: EmailSendInput = { ...normalizedInput, headers };

  // 4. Provider send.
  let result: EmailSendResult;
  if (provider === "resend") {
    result = await sendViaResend(sendInput);
  } else {
    result = await sendViaGmail(sendInput);
  }

  return result;
}

// ── Resend path ──────────────────────────────────────────────────────────────
async function sendViaResend(input: EmailSendInput): Promise<EmailSendResult> {
  const from = (input.from || DEFAULT_FROM).trim();

  const payload: any = {
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
  };
  if (input.text) payload.text = input.text;
  if (input.replyTo) payload.replyTo = input.replyTo;
  if (input.headers) payload.headers = input.headers;
  if (input.attachments && input.attachments.length > 0) {
    payload.attachments = input.attachments.map((a) => ({
      filename: a.filename,
      content: a.content,
      ...(a.contentType ? { contentType: a.contentType } : {}),
    }));
  }

  const requestOptions = input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined;

  try {
    const { data, error } = await getResend().emails.send(payload, requestOptions);
    if (error) {
      throw new Error(`${error.name}: ${error.message}`);
    }
    const id = data?.id ?? null;
    await logEmailSent({ ...buildLogMeta(input), messageId: id, status: "sent" });
    return { id, provider: "resend", data: { id } };
  } catch (err: any) {
    console.warn("[email/transport] Resend send failed:", err?.message);

    // Optional one-shot fallback to Gmail.
    if (process.env.EMAIL_FALLBACK_GMAIL === "true") {
      console.warn("[email/transport] falling back to Gmail transport for", input.to);
      try {
        const { id } = await gmailSendStructured(input);
        await logEmailSent({ ...buildLogMeta(input), messageId: id, status: "sent" });
        return { id, provider: "gmail", data: { id } };
      } catch (gErr: any) {
        console.warn("[email/transport] Gmail fallback also failed:", gErr?.message);
      }
    }

    await logEmailSent({ ...buildLogMeta(input), status: "failed", bounceReason: "send_error" });
    return { id: null, provider: "resend", data: { id: null } };
  }
}

// ── Gmail path ───────────────────────────────────────────────────────────────
async function sendViaGmail(input: EmailSendInput): Promise<EmailSendResult> {
  try {
    const { id } = await gmailSendStructured(input);
    await logEmailSent({ ...buildLogMeta(input), messageId: id, status: "sent" });
    return { id, provider: "gmail", data: { id } };
  } catch (err: any) {
    console.warn("[email/transport] Gmail send failed:", err?.message);
    await logEmailSent({ ...buildLogMeta(input), status: "failed", bounceReason: "send_error" });
    return { id: null, provider: "gmail", data: { id: null } };
  }
}
