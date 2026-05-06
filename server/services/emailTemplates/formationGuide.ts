/**
 * formationGuide email template — sends the per-state LLC formation guide
 * to one or many recipients via Gmail API.
 *
 * Brand-matched to `sendApplicationInvite` and `sendAgentMessageNotification`
 * in server/gmail.ts: gold accent (#C4975A), maroon header (#4A1420), cream
 * body (#F5EEE6). Renders an HTML payload with a plain-text alternative.
 *
 * The state-specific data (filing fee, SOS URL, ETA, notes) and the universal
 * 8-step checklist are passed in by the caller — no hardcoded state data lives
 * here so the template stays pure.
 */
import { google } from "googleapis";

// Re-derive the same OAuth client used in server/gmail.ts. Sharing the module
// directly would require restructuring; this self-contained client keeps the
// template independently testable.
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/api/auth/google/callback",
);
if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
}

async function getGmailClient() {
  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error(
      "Gmail not configured: GOOGLE_REFRESH_TOKEN is not set. Run the auth script first.",
    );
  }
  const { credentials } = await oauth2Client.refreshAccessToken();
  oauth2Client.setCredentials(credentials);
  return google.gmail({ version: "v1", auth: oauth2Client });
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface FormationGuideStateData {
  state: string;       // 2-letter code, e.g. "CA"
  stateName: string;   // full name, e.g. "California"
  filingFee: number | null;
  feeNote?: string | null;
  sosUrl: string;
  eta: string;
  notes?: string | null;
}

export interface FormationChecklistItem {
  number: number;
  title: string;
  description: string;
  externalUrl?: string | null;
}

export interface SendFormationGuideEmailInput {
  toEmail: string;
  toName?: string | null;
  introNote?: string | null;       // optional founder-curated intro paragraph
  guide: FormationGuideStateData;
  checklist: FormationChecklistItem[];
  portalUrl?: string;              // base URL for "view in portal" CTA
  senderName?: string | null;      // founder's display name, for the closing
}

export function renderFormationGuideHtml(input: SendFormationGuideEmailInput): string {
  const { guide, checklist, introNote, senderName, portalUrl } = input;
  const feeText =
    guide.filingFee !== null
      ? `$${guide.filingFee}`
      : guide.feeNote
        ? escapeHtml(guide.feeNote)
        : "Varies";
  const portalCta = portalUrl
    ? `${portalUrl.replace(/\/$/, "")}/founders/agency-management?tab=formation-guide&state=${guide.state}`
    : null;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F5EEE6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5EEE6;padding:40px 20px;">
<tr><td align="center">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#4A1420 0%,#6B2030 100%);padding:36px 40px 28px;border-radius:12px 12px 0 0;text-align:center;">
<table role="presentation" align="center"><tr><td style="width:60px;height:60px;text-align:center;vertical-align:middle;background:linear-gradient(135deg,#C4975A,#D4A55A);border-radius:50%;">
<span style="font-size:24px;font-weight:bold;color:#4A1420;font-family:Georgia,serif;">GC</span>
</td></tr></table>
<h1 style="margin:16px 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:400;color:#F0E8DE;letter-spacing:0.5px;">LLC Formation Guide</h1>
<p style="margin:0 0 6px;font-size:18px;color:#F0E8DE;font-family:Georgia,'Times New Roman',serif;">${escapeHtml(guide.stateName)} (${escapeHtml(guide.state)})</p>
<p style="margin:0;font-size:12px;color:#C4975A;letter-spacing:1px;">GOLD COAST FINANCIAL PARTNERS, LLC</p>
</td></tr>

<!-- Gold accent bar -->
<tr><td style="height:3px;background:linear-gradient(90deg,#C4975A,#D4A55A,#C4975A);"></td></tr>

<!-- Body -->
<tr><td style="background-color:#FFFFFF;padding:36px 40px 28px;">

${
  input.toName
    ? `<p style="margin:0 0 18px;font-size:16px;color:#2D1810;line-height:1.6;">Hi ${escapeHtml(input.toName)},</p>`
    : ""
}

${
  introNote && introNote.trim()
    ? `<p style="margin:0 0 22px;font-size:15px;color:#2D1810;line-height:1.65;">${escapeHtml(introNote.trim()).replace(/\n/g, "<br>")}</p>`
    : `<p style="margin:0 0 22px;font-size:15px;color:#2D1810;line-height:1.65;">Below is the state-specific guidance for forming an LLC in ${escapeHtml(guide.stateName)}, plus the universal 8-step checklist Gold Coast Financial uses for every new agent entity.</p>`
}

<!-- State-specific stat row -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
<tr>
<td width="33%" style="padding:14px;background:#F5EEE6;border:1px solid #EDE4D8;border-radius:8px;text-align:center;">
<p style="margin:0 0 4px;font-size:10px;color:#8A7060;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Filing Fee</p>
<p style="margin:0;font-size:18px;color:#2D1810;font-family:Georgia,serif;">${feeText}</p>
</td>
<td width="6">&nbsp;</td>
<td width="33%" style="padding:14px;background:#F5EEE6;border:1px solid #EDE4D8;border-radius:8px;text-align:center;">
<p style="margin:0 0 4px;font-size:10px;color:#8A7060;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Estimated Time</p>
<p style="margin:0;font-size:14px;color:#2D1810;font-family:Georgia,serif;line-height:1.3;">${escapeHtml(guide.eta)}</p>
</td>
<td width="6">&nbsp;</td>
<td width="33%" style="padding:14px;background:#F5EEE6;border:1px solid #EDE4D8;border-radius:8px;text-align:center;">
<p style="margin:0 0 4px;font-size:10px;color:#8A7060;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">EIN</p>
<p style="margin:0;font-size:14px;color:#C4975A;font-family:Georgia,serif;">Free · ~10 min</p>
</td>
</tr>
</table>

<!-- SOS portal CTA -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px;">
<tr><td align="center">
<a href="${escapeHtml(guide.sosUrl)}" target="_blank" style="display:inline-block;padding:13px 36px;background:linear-gradient(135deg,#C4975A,#D4A55A);color:#4A1420;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;letter-spacing:0.5px;">Open ${escapeHtml(guide.state)} Secretary of State portal</a>
</td></tr>
</table>

${
  guide.notes
    ? `<div style="background:#FBF4EA;border-left:3px solid #C4975A;border-radius:6px;padding:14px 16px;margin:0 0 24px;">
<p style="margin:0;font-size:13px;color:#6B5548;line-height:1.5;"><strong style="color:#2D1810;">Heads up:</strong> ${escapeHtml(guide.notes)}</p>
</div>`
    : ""
}

<!-- Divider -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">
<tr><td style="height:1px;background-color:#EDE4D8;"></td></tr>
</table>

<p style="margin:0 0 14px;font-size:13px;color:#8A7060;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Universal LLC Checklist</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px;">
${checklist
  .map(
    (step) => `<tr><td style="padding:8px 0;vertical-align:top;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td valign="top" style="padding-right:12px;">
<div style="width:26px;height:26px;background:#4A1420;color:#C4975A;border-radius:50%;text-align:center;line-height:26px;font-size:12px;font-weight:bold;font-family:Georgia,serif;">${step.number}</div>
</td>
<td valign="top">
<p style="margin:0 0 3px;font-size:14px;font-weight:600;color:#2D1810;line-height:1.4;">${escapeHtml(step.title)}</p>
<p style="margin:0;font-size:13px;color:#6B5548;line-height:1.5;">${escapeHtml(step.description)}</p>
${
  step.externalUrl
    ? `<p style="margin:4px 0 0;"><a href="${escapeHtml(step.externalUrl)}" style="color:#C4975A;font-size:12px;text-decoration:none;font-weight:600;">Open in new tab &rarr;</a></p>`
    : ""
}
</td>
</tr></table>
</td></tr>`,
  )
  .join("")}
</table>

${
  portalCta
    ? `<!-- Portal CTA -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr><td align="center">
<a href="${escapeHtml(portalCta)}" target="_blank" style="display:inline-block;padding:11px 28px;background:#FFFFFF;color:#4A1420;font-size:14px;font-weight:600;text-decoration:none;border:1.5px solid #C4975A;border-radius:8px;">View this guide in your Agent HCMS</a>
</td></tr></table>`
    : ""
}

<!-- Disclosure -->
<div style="background:#F5EEE6;border-radius:8px;padding:16px 18px;margin:0 0 6px;">
<p style="margin:0;font-size:12px;color:#6B5548;line-height:1.55;">
<strong style="color:#2D1810;">General guidance only.</strong> Filing fees, processing times, and state-specific requirements change frequently.
Verify everything against the official Secretary of State portal linked above and consult your attorney or CPA before relying on any of the information in this guide for tax, legal, or compliance purposes.
</p>
<p style="margin:8px 0 0;font-size:11px;color:#8A7060;line-height:1.5;">Filing fees and processing times verified as of 2026-05-03. Always confirm via the official Secretary of State portal linked above.</p>
</div>

${
  senderName
    ? `<p style="margin:24px 0 0;font-size:14px;color:#6B5548;line-height:1.6;">— ${escapeHtml(senderName)}<br><span style="color:#8A7060;font-size:12px;">Gold Coast Financial Partners, LLC</span></p>`
    : ""
}

</td></tr>

<!-- Footer -->
<tr><td style="background:#4A1420;padding:24px 40px 18px;border-radius:0 0 12px 12px;text-align:center;">
<p style="margin:0 0 4px;font-size:13px;color:#C4975A;font-weight:600;letter-spacing:0.5px;">Gold Coast Financial Partners, LLC</p>
<p style="margin:0 0 14px;font-size:12px;color:#A89080;">Naperville, Illinois &middot; (630) 778-0888</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px;">
<tr><td style="height:1px;background-color:rgba(196,151,90,0.2);"></td></tr>
</table>
<p style="margin:0 0 6px;font-size:10px;color:#8A7060;line-height:1.5;">Sent as a supplemental reference. If you have questions, contact your founder.</p>
<p style="margin:0;font-size:10px;color:#6B5548;line-height:1.5;">&copy; ${new Date().getFullYear()} Gold Coast Financial Partners, LLC. All rights reserved.<br>
<a href="https://goldcoastfinancial.co/terms" style="color:#C4975A;text-decoration:none;">Terms</a> &nbsp;|&nbsp; <a href="https://goldcoastfinancial.co/privacy" style="color:#C4975A;text-decoration:none;">Privacy</a></p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

export function renderFormationGuidePlainText(input: SendFormationGuideEmailInput): string {
  const { guide, checklist, introNote, senderName, portalUrl } = input;
  const feeText =
    guide.filingFee !== null
      ? `$${guide.filingFee}`
      : guide.feeNote || "Varies";
  const portalCta = portalUrl
    ? `${portalUrl.replace(/\/$/, "")}/founders/agency-management?tab=formation-guide&state=${guide.state}`
    : null;

  const lines: string[] = [];
  lines.push(`LLC FORMATION GUIDE — ${guide.stateName} (${guide.state})`);
  lines.push("Gold Coast Financial Partners, LLC");
  lines.push("");
  if (input.toName) lines.push(`Hi ${input.toName},`);
  lines.push("");
  lines.push(
    introNote?.trim() ||
      `Below is the state-specific guidance for forming an LLC in ${guide.stateName}, plus the universal 8-step checklist Gold Coast Financial uses for every new agent entity.`,
  );
  lines.push("");
  lines.push("STATE-SPECIFIC DETAILS");
  lines.push(`- Filing Fee: ${feeText}`);
  lines.push(`- Estimated Time: ${guide.eta}`);
  lines.push(`- EIN: Free, ~10 minutes via irs.gov`);
  lines.push(`- Secretary of State portal: ${guide.sosUrl}`);
  if (guide.notes) {
    lines.push("");
    lines.push(`Heads up: ${guide.notes}`);
  }
  lines.push("");
  lines.push("UNIVERSAL LLC CHECKLIST");
  for (const step of checklist) {
    lines.push(`${step.number}. ${step.title}`);
    lines.push(`   ${step.description}`);
    if (step.externalUrl) lines.push(`   Link: ${step.externalUrl}`);
  }
  lines.push("");
  if (portalCta) {
    lines.push(`View this guide in your Agent HCMS: ${portalCta}`);
    lines.push("");
  }
  lines.push(
    "GENERAL GUIDANCE ONLY. Filing fees, processing times, and state-specific requirements change frequently. Verify everything against the official Secretary of State portal and consult your attorney or CPA before relying on this information.",
  );
  lines.push(
    "Filing fees and processing times verified as of 2026-05-03. Always confirm via the official Secretary of State portal linked above.",
  );
  lines.push("");
  if (senderName) {
    lines.push(`— ${senderName}`);
    lines.push("Gold Coast Financial Partners, LLC");
  }
  lines.push("");
  lines.push("---");
  lines.push("Gold Coast Financial Partners, LLC | Naperville, IL | (630) 778-0888");
  lines.push(`(c) ${new Date().getFullYear()} Gold Coast Financial Partners, LLC. All rights reserved.`);
  return lines.join("\n");
}

/**
 * Send the formation-guide email via Gmail. Returns void on success;
 * THROWS on failure so the caller can record per-recipient errors.
 *
 * Builds a multipart/alternative MIME message with both text/plain and
 * text/html parts so clients without HTML rendering still get readable
 * content.
 */
export async function sendFormationGuideEmail(
  input: SendFormationGuideEmailInput,
): Promise<void> {
  // Defense-in-depth header-injection guards. The Zod EMAIL_RE in the route
  // already blocks \r\n in toEmail, but assert here too in case the regex is
  // ever weakened. Subject is derived from input.guide.* and goes into a MIME
  // header, so it gets the same treatment.
  if (/[\r\n]/.test(input.toEmail)) {
    throw new Error(
      "Invalid recipient email: header injection attempt detected",
    );
  }
  const gmail = await getGmailClient();
  const subject = `LLC Formation Guide — ${input.guide.stateName} (${input.guide.state})`;
  if (/[\r\n]/.test(subject)) {
    throw new Error(
      "Invalid subject: header injection attempt detected",
    );
  }
  const html = renderFormationGuideHtml(input);
  const text = renderFormationGuidePlainText(input);

  const boundary = `--gc-formation-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || "contact@goldcoastfnl.com";

  const mime = [
    `From: Gold Coast Financial Partners <${fromEmail}>`,
    `To: ${input.toEmail}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    text,
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(html).toString("base64"),
    "",
    `--${boundary}--`,
    "",
  ].join("\r\n");

  const encoded = Buffer.from(mime)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encoded },
  });
}
