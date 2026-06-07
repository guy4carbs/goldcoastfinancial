import { google } from "googleapis";
import type { EmailSendInput } from "./transport";

// =============================================================================
// Gmail raw transport — legacy company-Gmail sender (fallback path).
// =============================================================================
//
// Ported from server/gmail.ts: builds an OAuth2 client from the same GOOGLE_*
// env vars and sends a base64url RFC 2822 MIME message via
// gmail.users.messages.send. One OAuth client, lazily built and reused.
//
// MIME shape:
//  - no attachments  → multipart/alternative (text + html)
//  - with attachments → multipart/mixed { multipart/alternative, ...files }
// Custom headers (List-Unsubscribe, etc.) are preserved verbatim.

const DEFAULT_FROM = process.env.GMAIL_FROM_EMAIL || "contact@goldcoastfnl.com";

let oauthClient: ReturnType<typeof buildOAuthClient> | null = null;

function buildOAuthClient() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground",
  );
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return client;
}

function getGmailClient() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error(
      "Gmail not configured — missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REFRESH_TOKEN",
    );
  }
  if (!oauthClient) oauthClient = buildOAuthClient();
  return google.gmail({ version: "v1", auth: oauthClient });
}

function encodeRaw(raw: string): string {
  return Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function formatFrom(from: string): string {
  // Preserve an already-friendly "Name <addr>" form; otherwise brand it.
  return from.includes("<") ? from : `Gold Coast Financial Partners <${from}>`;
}

// Defense-in-depth against email header injection: header values must never
// contain CR/LF (the transport boundary also rejects them, but this builder
// guards against any future direct callers).
function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, " ");
}

function headerLines(input: EmailSendInput, from: string): string[] {
  const lines: string[] = [
    "MIME-Version: 1.0",
    `From: ${sanitizeHeaderValue(formatFrom(from))}`,
    `To: ${sanitizeHeaderValue(input.to)}`,
  ];
  if (input.replyTo) lines.push(`Reply-To: ${sanitizeHeaderValue(input.replyTo)}`);
  lines.push(`Subject: ${sanitizeHeaderValue(input.subject)}`);
  // Preserve custom headers (List-Unsubscribe etc.), names and values sanitized.
  if (input.headers) {
    for (const [k, v] of Object.entries(input.headers)) {
      if (v != null) lines.push(`${sanitizeHeaderValue(k)}: ${sanitizeHeaderValue(v)}`);
    }
  }
  return lines;
}

function buildMime(input: EmailSendInput, from: string): string {
  const text = input.text ?? "";
  const html = input.html;
  const hasAttachments = !!input.attachments && input.attachments.length > 0;

  if (!hasAttachments) {
    const boundary = `alt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const parts = [
      ...headerLines(input, from),
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: 8bit",
      "",
      text,
      "",
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      "Content-Transfer-Encoding: 8bit",
      "",
      html,
      "",
      `--${boundary}--`,
    ];
    return parts.join("\n");
  }

  const outer = `mixed_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const inner = `alt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const parts: string[] = [
    ...headerLines(input, from),
    `Content-Type: multipart/mixed; boundary="${outer}"`,
    "",
    `--${outer}`,
    `Content-Type: multipart/alternative; boundary="${inner}"`,
    "",
    `--${inner}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
    "",
    `--${inner}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
    "",
    `--${inner}--`,
  ];

  for (const att of input.attachments!) {
    const ct = sanitizeHeaderValue(att.contentType || "application/octet-stream");
    // Filenames additionally strip double-quotes to prevent parameter escape.
    const filename = sanitizeHeaderValue(att.filename).replace(/"/g, "");
    parts.push(
      "",
      `--${outer}`,
      `Content-Type: ${ct}; name="${filename}"`,
      "Content-Transfer-Encoding: base64",
      `Content-Disposition: attachment; filename="${filename}"`,
      "",
      att.content.toString("base64"),
    );
  }

  parts.push("", `--${outer}--`);
  return parts.join("\n");
}

/**
 * Send a structured email through the company Gmail account.
 * Returns the Gmail message id (or null if the provider returned none).
 */
export async function sendStructured(input: EmailSendInput): Promise<{ id: string | null }> {
  const gmail = getGmailClient();
  const from = (input.from || DEFAULT_FROM).trim();
  const raw = buildMime(input, from);
  const encoded = encodeRaw(raw);

  const result = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encoded },
  });

  return { id: result.data?.id ?? null };
}
