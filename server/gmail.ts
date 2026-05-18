import { google } from 'googleapis';

// Format coverage type for proper display (e.g., "iul" -> "IUL")
function formatCoverageType(type: string): string {
  if (!type) return "Not Specified";

  const normalizedType = type.toLowerCase().trim();

  // Check for IUL first (most specific)
  if (normalizedType === "iul" || normalizedType.includes("indexed universal")) {
    return "IUL (Indexed Universal Life)";
  }

  // Term Life
  if (normalizedType === "term" || normalizedType.includes("term life") || normalizedType === "term_life") {
    return "Term Life Insurance";
  }

  // Whole Life
  if (normalizedType === "whole" || normalizedType.includes("whole life") || normalizedType === "whole_life") {
    return "Whole Life Insurance";
  }

  // Final Expense
  if (normalizedType === "final" || normalizedType.includes("final expense") || normalizedType === "final_expense") {
    return "Final Expense Insurance";
  }

  // Mortgage Protection
  if (normalizedType === "mortgage" || normalizedType.includes("mortgage protection") || normalizedType === "mortgage_protection") {
    return "Mortgage Protection Insurance";
  }

  // Unsure
  if (normalizedType === "unsure" || normalizedType.includes("not sure")) {
    return "Not Sure Yet - Needs Consultation";
  }

  // Return original with first letter capitalized if no match
  return type.charAt(0).toUpperCase() + type.slice(1);
}

// Create OAuth2 client using environment variables
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

// Set the refresh token from environment
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

async function getGmailClient() {
  // Check if credentials are configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
    console.log('Gmail integration: Missing Google OAuth credentials in environment');
    throw new Error('Gmail not configured - missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REFRESH_TOKEN');
  }

  return google.gmail({ version: 'v1', auth: oauth2Client });
}


function generateMessageId(domain: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `<${timestamp}.${random}@${domain}>`;
}

function formatRFC2822Date(): string {
  return new Date().toUTCString().replace('GMT', '+0000');
}

export async function sendContactNotification(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const gmail = await getGmailClient();
  
  const subject = `New Contact Form Submission from ${data.firstName} ${data.lastName}`;
  const body = `
New contact form submission from Heritage Life Solutions website:

Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}

Message:
${data.message}

---
This message was sent from the Heritage Life Solutions website contact form.
  `.trim();

  const message = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 8bit',
    `From: Heritage Life Solutions <contact@heritagels.org>`,
    `To: contact@heritagels.org`,
    `Reply-To: ${data.email}`,
    `Subject: ${subject}`,
    '',
    body
  ].join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage
    }
  });
}

// =============================================================================
// POST-CLOSE WELCOME EMAIL — branded HTML with Heritage design
// =============================================================================
export async function sendPostCloseWelcomeEmail(data: {
  clientFirstName: string;
  clientEmail: string;
  coverageType: string;
  agentName: string;
  agentEmail: string;
  agentPhone?: string;
  portalUrl: string;
  tempPassword?: string;
}) {
  const gmail = await getGmailClient();

  const primaryColor = '#7c3aed';
  const goldColor = '#D4AF37';
  const gradientFrom = '#7c3aed';
  const gradientTo = '#D4AF37';
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b';
  const agentInitials = data.agentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const subject = `Congratulations ${data.clientFirstName}! Welcome to Heritage Life Solutions`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%); padding: 32px 40px; text-align: center;">
              <img src="${logoUrl}" alt="Heritage Life Solutions" style="width: 80px; height: 80px; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);" />
              <h1 style="color: #ffffff; margin: 16px 0 8px 0; font-size: 24px; font-weight: 700;">Welcome to the Family!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px; font-weight: 500;">Your ${data.coverageType || 'life insurance'} coverage is all set</p>
            </td>
          </tr>

          <!-- Congratulations Banner -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f5f3ff; border-bottom: 1px solid #e9d5ff;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <span style="font-size: 32px;">🎉</span>
                    <p style="color: #5b21b6; font-size: 15px; margin: 8px 0 0 0; font-weight: 600;">Congratulations on securing your financial future!</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Welcome Message -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ff; border-left: 4px solid ${primaryColor}; border-radius: 0 12px 12px 0; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                      Hi <strong style="color: ${primaryColor};">${data.clientFirstName}</strong>,
                    </p>
                    <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 12px 0 0 0;">
                      We are honored that you chose Heritage Life Solutions for your ${data.coverageType || 'life insurance'} coverage. Your dedicated agent, <strong>${data.agentName}</strong>, will be with you every step of the way.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin: 30px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 16px 0;">Here's what happens next:</p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 10px 0; vertical-align: top; width: 40px;">
                          <table cellpadding="0" cellspacing="0"><tr><td style="width: 28px; height: 28px; background-color: ${primaryColor}; border-radius: 50%; text-align: center; vertical-align: middle;"><span style="color: #ffffff; font-size: 13px; font-weight: 700;">1</span></td></tr></table>
                        </td>
                        <td style="padding: 10px 0; color: #374151; font-size: 14px; line-height: 1.5;">
                          <strong>Set up your Client Portal</strong><br><span style="color: #6b7280;">View your policy, documents, and more</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; vertical-align: top; width: 40px;">
                          <table cellpadding="0" cellspacing="0"><tr><td style="width: 28px; height: 28px; background-color: ${primaryColor}; border-radius: 50%; text-align: center; vertical-align: middle;"><span style="color: #ffffff; font-size: 13px; font-weight: 700;">2</span></td></tr></table>
                        </td>
                        <td style="padding: 10px 0; color: #374151; font-size: 14px; line-height: 1.5;">
                          <strong>Policy review</strong><br><span style="color: #6b7280;">Your agent will ensure everything is perfect</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; vertical-align: top; width: 40px;">
                          <table cellpadding="0" cellspacing="0"><tr><td style="width: 28px; height: 28px; background-color: ${primaryColor}; border-radius: 50%; text-align: center; vertical-align: middle;"><span style="color: #ffffff; font-size: 13px; font-weight: 700;">3</span></td></tr></table>
                        </td>
                        <td style="padding: 10px 0; color: #374151; font-size: 14px; line-height: 1.5;">
                          <strong>Full client services</strong><br><span style="color: #6b7280;">Access our complete suite of tools and support</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${data.tempPassword ? `
              <!-- Login Credentials -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fefce8; border: 1px solid #fde68a; border-radius: 12px; margin: 30px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: #92400e; font-size: 14px; font-weight: 700; margin: 0 0 16px 0;">🔑 Your Login Credentials</p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 8px 12px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 8px;">
                          <p style="color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px 0;">Email</p>
                          <p style="color: #111827; font-size: 15px; font-weight: 600; margin: 0; font-family: monospace;">${data.clientEmail}</p>
                        </td>
                      </tr>
                      <tr><td style="height: 8px;"></td></tr>
                      <tr>
                        <td style="padding: 8px 12px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb;">
                          <p style="color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px 0;">Temporary Password</p>
                          <p style="color: #111827; font-size: 15px; font-weight: 600; margin: 0; font-family: monospace;">${data.tempPassword}</p>
                        </td>
                      </tr>
                    </table>
                    <p style="color: #92400e; font-size: 12px; margin: 12px 0 0 0;">
                      ⚠️ Please change your password after your first login for security.
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.portalUrl}/client/login" style="display: inline-block; background: linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%); color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-size: 17px; font-weight: 700; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
                      🔐 Log In to Your Client Portal
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 0;">
                Or copy this link: <a href="${data.portalUrl}/client/login" style="color: ${primaryColor};">${data.portalUrl}/client/login</a>
              </p>
            </td>
          </tr>

          <!-- Agent Signature -->
          <tr>
            <td style="padding: 0 40px 40px 40px; border-top: 1px solid #e5e7eb;">
              <table cellpadding="0" cellspacing="0" style="padding-top: 30px;">
                <tr>
                  <td style="padding-right: 16px; vertical-align: top;">
                    <table cellpadding="0" cellspacing="0"><tr>
                      <td style="width: 56px; height: 56px; background: linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%); border-radius: 14px; text-align: center; vertical-align: middle;">
                        <span style="color: #ffffff; font-size: 22px; font-weight: 700;">${agentInitials}</span>
                      </td>
                    </tr></table>
                  </td>
                  <td>
                    <p style="color: #111827; font-size: 17px; font-weight: 700; margin: 0 0 4px 0;">${data.agentName}</p>
                    <p style="color: ${primaryColor}; font-size: 13px; font-weight: 600; margin: 0 0 8px 0;">Licensed Insurance Agent</p>
                    <p style="color: #6b7280; font-size: 13px; margin: 0;">📧 <a href="mailto:${data.agentEmail}" style="color: #6b7280; text-decoration: none;">${data.agentEmail}</a></p>
                    ${data.agentPhone ? `<p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">📱 <a href="tel:${data.agentPhone.replace(/[^0-9+]/g, '')}" style="color: ${primaryColor}; text-decoration: none; font-weight: 600;">${data.agentPhone}</a></p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: ${primaryColor}; font-size: 16px; font-weight: 700; margin: 0 0 4px 0;">Heritage Life Solutions</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">Protecting families with personalized insurance solutions</p>
            </td>
          </tr>

          <!-- Legal Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #64748b; font-size: 11px; line-height: 1.6; margin: 0 0 12px 0; text-align: center;">
                &copy; 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states. IL License #22128144. Policies are issued by our carrier partners and product availability may vary by state.
              </p>
              <p style="color: #94a3b8; font-size: 10px; line-height: 1.5; margin: 0 0 10px 0; text-align: center;">
                At Heritage, we believe protecting your family shouldn't be complicated. Our streamlined process connects you with coverage options from top-rated carriers, often without the need for medical exams. Most applications take just minutes to complete, and approvals can happen within 24-48 hours.
              </p>
              <p style="color: #94a3b8; font-size: 10px; line-height: 1.5; margin: 0 0 10px 0; text-align: center;">
                Life insurance premiums are based on factors including age, health, and coverage amount. Locking in coverage sooner typically means lower rates. Once your policy is in place, your premium remains fixed for the duration of your term.
              </p>
              <p style="color: #94a3b8; font-size: 10px; line-height: 1.5; margin: 0; text-align: center;">
                Heritage Life Solutions partners with A-rated insurance carriers to provide comprehensive coverage options. All quotes are subject to underwriting approval by the issuing carrier.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const plainTextBody = `
HERITAGE LIFE SOLUTIONS
Welcome to the Family!

Hi ${data.clientFirstName},

Congratulations on securing your financial future with Heritage Life Solutions! We are honored that you chose us for your ${data.coverageType || 'life insurance'} coverage.

Your dedicated agent, ${data.agentName}, will be with you every step of the way.

Here's what happens next:
1. Set up your Client Portal to view your policy, documents, and more
2. Your agent will review your policy details to ensure everything is perfect
3. You'll have access to our full suite of client services

${data.tempPassword ? `YOUR LOGIN CREDENTIALS:
Email: ${data.clientEmail}
Temporary Password: ${data.tempPassword}
(Please change your password after first login)

` : ''}Log in to your Client Portal: ${data.portalUrl}/client/login

If you have any questions, reach out to ${data.agentName}${data.agentPhone ? ` at ${data.agentPhone}` : ''} or reply to this email.

Welcome to the Heritage family!

Best regards,
${data.agentName}
Licensed Insurance Agent
${data.agentEmail}
${data.agentPhone || ''}

--------------------------------------------
Heritage Life Solutions

(c) 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states. IL License #22128144.
  `.trim();

  const boundary = `boundary_${Date.now()}`;
  const message = [
    'MIME-Version: 1.0',
    `From: Heritage Life Solutions <${process.env.GMAIL_FROM_EMAIL || 'contact@heritagels.org'}>`,
    `To: ${data.clientEmail}`,
    `Reply-To: ${data.agentEmail}`,
    `Subject: ${subject}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    plainTextBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`
  ].join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage }
  });

  console.log(`[PostCloseEmail] Welcome email sent to ${data.clientEmail}`);
  return result;
}

// =============================================================================
// FOLLOW-UP EMAIL — branded HTML for 30/60/90 day check-ins
// =============================================================================
export async function sendFollowUpEmail(data: {
  clientFirstName: string;
  clientEmail: string;
  coverageType: string;
  agentName: string;
  agentEmail: string;
  agentPhone?: string;
  portalUrl: string;
  subject: string;
  headline: string;
  subheadline: string;
  message: string;
  emoji?: string;
}) {
  const gmail = await getGmailClient();

  const primaryColor = '#7c3aed';
  const gradientFrom = '#7c3aed';
  const gradientTo = '#D4AF37';
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b';
  const agentInitials = data.agentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const emoji = data.emoji || '📋';

  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <!-- Header -->
        <tr><td style="background: linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%); padding: 32px 40px; text-align: center;">
          <img src="${logoUrl}" alt="Heritage Life Solutions" style="width: 80px; height: 80px; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);" />
          <h1 style="color: #ffffff; margin: 16px 0 8px 0; font-size: 24px; font-weight: 700;">${data.headline}</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px; font-weight: 500;">${data.subheadline}</p>
        </td></tr>

        <!-- Emoji Banner -->
        <tr><td style="padding: 24px 40px; background-color: #f5f3ff; border-bottom: 1px solid #e9d5ff; text-align: center;">
          <span style="font-size: 32px;">${emoji}</span>
          <p style="color: #5b21b6; font-size: 15px; margin: 8px 0 0 0; font-weight: 600;">Time to check in, ${data.clientFirstName}!</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding: 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ff; border-left: 4px solid ${primaryColor}; border-radius: 0 12px 12px 0; margin-bottom: 30px;">
            <tr><td style="padding: 20px 24px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">Hi <strong style="color: ${primaryColor};">${data.clientFirstName}</strong>,</p>
              <p style="color: #6b7280; font-size: 15px; line-height: 1.8; margin: 12px 0 0 0; white-space: pre-line;">${data.message}</p>
            </td></tr>
          </table>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
            <tr><td align="center">
              <a href="${data.portalUrl}/client/login" style="display: inline-block; background: linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%); color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-size: 17px; font-weight: 700; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
                🔐 View Your Client Portal
              </a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Agent Signature -->
        <tr><td style="padding: 0 40px 40px 40px; border-top: 1px solid #e5e7eb;">
          <table cellpadding="0" cellspacing="0" style="padding-top: 30px;">
            <tr>
              <td style="padding-right: 16px; vertical-align: top;">
                <table cellpadding="0" cellspacing="0"><tr>
                  <td style="width: 56px; height: 56px; background: linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%); border-radius: 14px; text-align: center; vertical-align: middle;">
                    <span style="color: #ffffff; font-size: 22px; font-weight: 700;">${agentInitials}</span>
                  </td>
                </tr></table>
              </td>
              <td>
                <p style="color: #111827; font-size: 17px; font-weight: 700; margin: 0 0 4px 0;">${data.agentName}</p>
                <p style="color: ${primaryColor}; font-size: 13px; font-weight: 600; margin: 0 0 8px 0;">Licensed Insurance Agent</p>
                <p style="color: #6b7280; font-size: 13px; margin: 0;">📧 <a href="mailto:${data.agentEmail}" style="color: #6b7280; text-decoration: none;">${data.agentEmail}</a></p>
                ${data.agentPhone ? `<p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">📱 <a href="tel:${data.agentPhone.replace(/[^0-9+]/g, '')}" style="color: ${primaryColor}; text-decoration: none; font-weight: 600;">${data.agentPhone}</a></p>` : ''}
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: ${primaryColor}; font-size: 16px; font-weight: 700; margin: 0 0 4px 0;">Heritage Life Solutions</p>
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">Protecting families with personalized insurance solutions</p>
        </td></tr>

        <!-- Legal -->
        <tr><td style="background-color: #f1f5f9; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
          <p style="color: #64748b; font-size: 11px; line-height: 1.6; margin: 0 0 12px 0; text-align: center;">
            &copy; 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states. IL License #22128144. Policies are issued by our carrier partners and product availability may vary by state.
          </p>
          <p style="color: #94a3b8; font-size: 10px; line-height: 1.5; margin: 0 0 10px 0; text-align: center;">
            At Heritage, we believe protecting your family shouldn't be complicated. Our streamlined process connects you with coverage options from top-rated carriers, often without the need for medical exams. Most applications take just minutes to complete, and approvals can happen within 24-48 hours.
          </p>
          <p style="color: #94a3b8; font-size: 10px; line-height: 1.5; margin: 0 0 10px 0; text-align: center;">
            Life insurance premiums are based on factors including age, health, and coverage amount. Locking in coverage sooner typically means lower rates. Once your policy is in place, your premium remains fixed for the duration of your term.
          </p>
          <p style="color: #94a3b8; font-size: 10px; line-height: 1.5; margin: 0; text-align: center;">
            Heritage Life Solutions partners with A-rated insurance carriers to provide comprehensive coverage options. All quotes are subject to underwriting approval by the issuing carrier.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

  const plainTextBody = `${data.headline}\n\nHi ${data.clientFirstName},\n\n${data.message}\n\nLog in to your Client Portal: ${data.portalUrl}/client/login\n\nBest regards,\n${data.agentName}\nHeritage Life Solutions`;

  const boundary = `boundary_${Date.now()}`;
  const message = [
    'MIME-Version: 1.0',
    `From: Heritage Life Solutions <${process.env.GMAIL_FROM_EMAIL || 'contact@heritagels.org'}>`,
    `To: ${data.clientEmail}`,
    `Reply-To: ${data.agentEmail}`,
    `Subject: ${data.subject}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '', `--${boundary}`, 'Content-Type: text/plain; charset="UTF-8"', 'Content-Transfer-Encoding: 8bit', '', plainTextBody,
    '', `--${boundary}`, 'Content-Type: text/html; charset="UTF-8"', 'Content-Transfer-Encoding: 8bit', '', htmlBody,
    '', `--${boundary}--`
  ].join('\n');

  const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encodedMessage } });
  console.log(`[FollowUpEmail] ${data.headline} sent to ${data.clientEmail}`);
}

export async function sendPortalMessage(data: {
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  message: string;
  priority?: 'normal' | 'high';
}) {
  const gmail = await getGmailClient();
  
  const priorityPrefix = data.priority === 'high' ? '[URGENT] ' : '';
  const fullSubject = `${priorityPrefix}Portal Message: ${data.subject}`;
  const body = `
New secure message from Gold Coast Financial Partners Client Portal:

FROM: ${data.senderName} (${data.senderEmail})
TO: ${data.recipientName}
SUBJECT: ${data.subject}
PRIORITY: ${data.priority === 'high' ? 'High' : 'Normal'}

MESSAGE:
${data.message}

---
To reply, respond directly to this email or log into the advisor portal.
This message was sent securely through the Gold Coast Financial Partners Client Portal.
  `.trim();

  const emailMessage = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 8bit',
    `From: Gold Coast Financial Partners Client Portal <client@goldcoastfnl.com>`,
    `To: ${data.recipientEmail}`,
    `Reply-To: ${data.senderEmail}`,
    `Subject: ${fullSubject}`,
    '',
    body
  ].join('\n');

  const encodedMessage = Buffer.from(emailMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage
    }
  });
}

export async function sendAgentLeadNotification(data: {
  agentName: string;
  agentEmail: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  productInterest: string;
  zipCode: string;
  message?: string;
}) {
  const gmail = await getGmailClient();

  const formattedProduct = formatCoverageType(data.productInterest);
  const subject = `New Lead from Your Heritage Website -${data.leadName}`;
  const body = `
Hi ${data.agentName.split(' ')[0]},

You have a new lead from your Heritage Life Solutions website!

----------------------------------------

LEAD DETAILS
Name: ${data.leadName}
Email: ${data.leadEmail}
Phone: ${data.leadPhone}
Interest: ${formattedProduct}
Zip Code: ${data.zipCode}
${data.message ? `\nMessage:\n${data.message}` : ''}

----------------------------------------

NEXT STEPS
-Reach out within 24 hours for best conversion
-This lead was sourced from YOUR personal Heritage website
-Log into your Agent Lounge to manage all leads

https://heritagels.org/agents/inbox

----------------------------------------
Heritage Life Solutions
  `.trim();

  const message = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 8bit',
    `From: Heritage Life Solutions <contact@heritagels.org>`,
    `To: ${data.agentEmail}`,
    `Reply-To: ${data.leadEmail}`,
    `Subject: ${subject}`,
    '',
    body
  ].join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage
    }
  });
}

export async function sendQuoteNotification(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  coverageType: string;
  coverageAmount: string;
  height: string;
  weight: string;
  birthDate: string;
  medicalBackground: string;
}) {
  const gmail = await getGmailClient();
  
  const formattedCoverageType = formatCoverageType(data.coverageType);
  const subject = `New Quote Request: ${formattedCoverageType} - ${data.firstName} ${data.lastName}`;
  const body = `
NEW QUOTE REQUEST
Heritage Life Solutions Website

----------------------------------------

CONTACT INFORMATION
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone}

ADDRESS
${data.streetAddress}${data.addressLine2 ? `\n${data.addressLine2}` : ''}
${data.city}, ${data.state} ${data.zipCode}

----------------------------------------

COVERAGE REQUEST
Product Type: ${formattedCoverageType}
Coverage Amount: ${data.coverageAmount}

CLIENT PROFILE
Date of Birth: ${data.birthDate}
Height: ${data.height}
Weight: ${data.weight}

MEDICAL & PRESCRIPTION BACKGROUND
${data.medicalBackground}

----------------------------------------
Submitted via Heritage Life Solutions website
  `.trim();

  const message = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 8bit',
    `From: Heritage Life Solutions <contact@heritagels.org>`,
    `To: contact@heritagels.org`,
    `Reply-To: ${data.email}`,
    `Subject: ${subject}`,
    '',
    body
  ].join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage
    }
  });
}

export async function sendQuoteConfirmationToApplicant(data: {
  firstName: string;
  lastName: string;
  email: string;
  coverageType: string;
  coverageAmount: string;
}) {
  const gmail = await getGmailClient();

  const formattedCoverageType = formatCoverageType(data.coverageType);
  const subject = `We've Received Your Quote Request - Heritage Life Solutions`;
  const body = `
Hi ${data.firstName},

Thank you for requesting a quote from Heritage Life Solutions!

We've received your request for ${formattedCoverageType} coverage (${data.coverageAmount}) and one of our licensed insurance professionals will review your information and reach out to you within 1 business day.

WHAT HAPPENS NEXT:
-We'll review your information and find the best options for your needs
-A licensed agent will contact you to discuss your coverage options
-You'll receive a personalized quote with no obligation

If you have any immediate questions, feel free to call us at (630) 778-0800 or reply to this email.

We look forward to helping you protect what matters most.

Best regards,
The Heritage Life Solutions Team

----------------------------------------
Heritage Life Solutions
(630) 778-0800
contact@heritagels.org
www.heritagels.org
----------------------------------------
  `.trim();

  const message = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 8bit',
    `From: Heritage Life Solutions <contact@heritagels.org>`,
    `To: ${data.email}`,
    `Subject: ${subject}`,
    '',
    body
  ].join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage
    }
  });
}

export async function sendMeetingNotification(data: {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  meetingType: string;
  topic: string;
  message?: string;
}) {
  const gmail = await getGmailClient();
  
  const meetingTypeLabels: Record<string, string> = {
    'video': 'Video Call (Google Meet or Zoom)',
    'phone': 'Phone Call',
    'inperson': 'In-Person at Naperville Office'
  };
  
  const topicLabels: Record<string, string> = {
    'new-policy': 'Start a new policy',
    'review-coverage': 'Review my current coverage',
    'policy-changes': 'Make changes to my policy',
    'claims': 'Claims or beneficiary updates',
    'billing': 'Billing or payment questions',
    'term-life': 'Term life insurance',
    'whole-life': 'Whole life insurance',
    'iul': 'Indexed Universal Life (IUL)',
    'final-expense': 'Final expense insurance',
    'business-insurance': 'Business insurance needs',
    'partnership': 'Partnership or business opportunity',
    'other': 'Other'
  };
  
  const subject = `New Meeting Request from ${data.name} - ${new Date(data.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${data.time}`;
  const body = `
New meeting request from Gold Coast Financial Partners website:

MEETING DETAILS:
Date: ${new Date(data.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
Time: ${data.time}
Type: ${meetingTypeLabels[data.meetingType] || data.meetingType}
Topic: ${topicLabels[data.topic] || data.topic}

CONTACT INFORMATION:
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}

${data.message ? `ADDITIONAL NOTES:\n${data.message}` : ''}

---
This meeting request was submitted from the Gold Coast Financial Partners website.
  `.trim();

  const emailMessage = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 8bit',
    `To: meetings@goldcoastfnl.com`,
    `Reply-To: ${data.email}`,
    `Subject: ${subject}`,
    '',
    body
  ].join('\n');

  const encodedMessage = Buffer.from(emailMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage
    }
  });
}

export async function sendJobApplicationNotification(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  linkedIn?: string;
  experience: string;
  whyJoinUs: string;
  hasLicense?: string;
  resumeFileName?: string;
}) {
  const gmail = await getGmailClient();
  
  const subject = `New Job Application: ${data.position} - ${data.firstName} ${data.lastName}`;
  const body = `
New job application submitted on Heritage Life Solutions website:

APPLICANT INFORMATION:
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone}
Position: ${data.position}
LinkedIn: ${data.linkedIn || 'Not provided'}
Illinois License: ${data.hasLicense === 'yes' ? 'Yes' : 'No'}
Resume: ${data.resumeFileName || 'Not uploaded'}

EXPERIENCE:
${data.experience}

WHY HERITAGE LIFE SOLUTIONS:
${data.whyJoinUs}

---
This application was submitted from the Heritage Life Solutions careers page.
  `.trim();

  const emailMessage = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 8bit',
    `From: Heritage Life Solutions Careers <careers@heritagels.org>`,
    `To: careers@heritagels.org`,
    `Reply-To: ${data.email}`,
    `Subject: ${subject}`,
    '',
    body
  ].join('\n');

  const encodedMessage = Buffer.from(emailMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage
    }
  });
}

export async function sendPrivacyRequestNotification(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  requestType: string;
  message: string;
}) {
  const gmail = await getGmailClient();

  const requestTypeLabels: Record<string, string> = {
    'do-not-sell': 'Do Not Sell',
    'delete': 'Data Deletion',
    'access': 'Data Access',
    'correct': 'Data Correction'
  };

  const subject = `Privacy Request: ${requestTypeLabels[data.requestType] || data.requestType} - ${data.firstName} ${data.lastName}`;
  const body = `
PRIVACY REQUEST
Heritage Life Solutions

----------------------------------------

${data.message}

----------------------------------------
Submitted via Heritage Life Solutions website
Please respond within 45 days as required by law.
  `.trim();

  const privacyMessage = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 8bit',
    `From: Heritage Life Solutions Privacy <privacy@heritagels.org>`,
    `To: privacy@heritagels.org`,
    `Reply-To: ${data.email}`,
    `Subject: ${subject}`,
    '',
    body
  ].join('\n');

  const encodedPrivacyMessage = Buffer.from(privacyMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedPrivacyMessage
    }
  });
}

// Carrier branding data for emails (subset of full branding)
const CARRIER_EMAIL_BRANDING: Record<string, {
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  gradientFrom: string;
  gradientTo: string;
  tagline: string;
  logoUrl?: string;
}> = {
  "americo": {
    name: "Americo Financial Life and Annuity Insurance Company",
    shortName: "Americo",
    primaryColor: "#1E3A5F",
    secondaryColor: "#C4A052",
    gradientFrom: "#1E3A5F",
    gradientTo: "#2D5A87",
    tagline: "Life Insurance That Fits Your Life",
    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277183671-cropped-Americologo_red_289-2.png?alt=media&token=29048512-a27a-454c-959e-096a921d68ba"
  },
  "athene": {
    name: "Athene Annuity and Life Company",
    shortName: "Athene",
    primaryColor: "#00205B",
    secondaryColor: "#00A3E0",
    gradientFrom: "#00205B",
    gradientTo: "#003380",
    tagline: "Retirement Innovators",
    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277359214-logo.png?alt=media&token=6770c112-2236-4b92-b80e-2811635f6643"
  },
  "baltimore-life": {
    name: "Baltimore Life Insurance Company",
    shortName: "Baltimore Life",
    primaryColor: "#3471B6",
    secondaryColor: "#2860A0",
    gradientFrom: "#3471B6",
    gradientTo: "#4080C4",
    tagline: "Protecting Families Since 1882",
    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277409363-logo%402x.png?alt=media&token=cdd3c6d0-e497-4a4c-a357-6e3b548dd95c"
  },
  "corebridge": {
    name: "Corebridge Financial",
    shortName: "Corebridge",
    primaryColor: "#4808C1",
    secondaryColor: "#5A1AD3",
    gradientFrom: "#4808C1",
    gradientTo: "#5A1AD3",
    tagline: "Helping People Act on Their Ambitions",
    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277446062-Corebridge_financial_logo.svg.png?alt=media&token=cd088f44-4437-432e-88a3-b3a54ee520e2"
  },
  "mutual-of-omaha": {
    name: "Mutual of Omaha Insurance Company",
    shortName: "Mutual of Omaha",
    primaryColor: "#003057",
    secondaryColor: "#FFB81C",
    gradientFrom: "#003057",
    gradientTo: "#004477",
    tagline: "The Company You Keep",
    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277474666-Mutual-of-Omaha-logo.png?alt=media&token=0382cf9c-c262-4931-8155-688210c1c173"
  },
  "ethos": {
    name: "Ethos Life Insurance",
    shortName: "Ethos",
    primaryColor: "#23514A",
    secondaryColor: "#1A3F3A",
    gradientFrom: "#23514A",
    gradientTo: "#2D635A",
    tagline: "Life Insurance for the Modern Family",
    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277532663-6341f9fa-fd59-42aa-b238-d23e46658048.png?alt=media&token=ea3d4914-d65e-4817-9a81-1ea709064e52"
  },
  "royal-neighbors": {
    name: "Royal Neighbors of America",
    shortName: "Royal Neighbors",
    primaryColor: "#6B2D7B",
    secondaryColor: "#E91E8C",
    gradientFrom: "#6B2D7B",
    gradientTo: "#8B3D9B",
    tagline: "More Than Insurance. A Sisterhood.",
    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277589538-330-3309455_royal-neighbors-of-america-life-insurance-royal-neighbors.png?alt=media&token=d700619b-ad2d-4071-bd2b-a57eb5a12b56"
  },
  "transamerica": {
    name: "Transamerica Life Insurance Company",
    shortName: "Transamerica",
    primaryColor: "#C41230",
    secondaryColor: "#002B5C",
    gradientFrom: "#C41230",
    gradientTo: "#E01540",
    tagline: "Tomorrow Makers",
    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769278248208-transamerica-logo.png?alt=media&token=9d6fb91f-9c8e-432b-96e4-c4ed8971cc6d"
  },
  "american-home-life": {
    name: "American Home Life Insurance Company",
    shortName: "American Home Life",
    primaryColor: "#1B4F72",
    secondaryColor: "#D4AC0D",
    gradientFrom: "#1B4F72",
    gradientTo: "#2471A3",
    tagline: "Protecting What Matters Most",
    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277674404-Carrier-Logo-Web-270x200-American-Home-Life-1080x608.webp?alt=media&token=0546ea66-443d-44bc-b2f1-d561bd1f713b"
  },
  "polish-falcons": {
    name: "Polish Falcons of America",
    shortName: "Polish Falcons",
    primaryColor: "#DC143C",
    secondaryColor: "#FFFFFF",
    gradientFrom: "#DC143C",
    gradientTo: "#E83C5C",
    tagline: "Strength Through Unity",
    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277746680-Polish_Falcons_of_America_Logo.png?alt=media&token=c50ffd89-0c8c-4e05-81ed-23289b74f238"
  },
  "ladder": {
    name: "Ladder Life Insurance",
    shortName: "Ladder",
    primaryColor: "#1A1A2E",
    secondaryColor: "#16C79A",
    gradientFrom: "#1A1A2E",
    gradientTo: "#2D2D44",
    tagline: "Flexible Life Insurance for Today",
    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277843227-Ladder-Logo-Full-Black.png?alt=media&token=b8543d44-66ce-4afe-96da-809fd4817733"
  },
  "lincoln-financial": {
    name: "Lincoln Financial Group",
    shortName: "Lincoln Financial",
    primaryColor: "#6B1C23",
    secondaryColor: "#8B2D35",
    gradientFrom: "#6B1C23",
    gradientTo: "#8B2D35",
    tagline: "Chief Life Officer",
    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277880206-Lincoln-Financial-Logo-old.png?alt=media&token=b8028b6a-d38c-42e7-bb83-9a3d5750524b"
  }
};

// Send secure data collection form link to client
export async function sendSecureFormEmail(data: {
  clientName: string;
  clientEmail: string;
  formType: 'ssn' | 'banking' | 'drivers_license' | 'full_application';
  secureLink: string;
  expiresAt: Date;
  carrier?: string;
  carrierId?: string;
  customMessage?: string;
  agent: {
    name: string;
    email: string;
    phone: string;
  };
}) {
  const gmail = await getGmailClient();

  const formTypeLabels: Record<string, string> = {
    ssn: 'Social Security Number',
    banking: 'Banking Information',
    drivers_license: "Driver's License / State ID",
    full_application: 'Full Application'
  };

  const formTypeLabel = formTypeLabels[data.formType] || data.formType;
  const clientFirstName = data.clientName.split(' ')[0];
  const agentFirstName = data.agent.name.split(' ')[0];

  // Get carrier branding or use defaults
  const carrierBranding = data.carrierId ? CARRIER_EMAIL_BRANDING[data.carrierId] : null;
  const primaryColor = carrierBranding?.primaryColor || '#1e40af';
  const gradientFrom = carrierBranding?.gradientFrom || '#1e40af';
  const gradientTo = carrierBranding?.gradientTo || '#3b82f6';
  const carrierName = carrierBranding?.shortName || data.carrier || 'Insurance Provider';
  const carrierTagline = carrierBranding?.tagline || 'Secure Document Request';
  const carrierLogoUrl = carrierBranding?.logoUrl || '';

  // Build logo HTML - show image if URL exists, otherwise show carrier name
  const logoHtml = carrierLogoUrl
    ? `<table cellpadding="0" cellspacing="0" style="margin-bottom: 12px;"><tr><td align="center" style="background-color: #ffffff; border-radius: 12px; padding: 14px 22px;"><img src="${carrierLogoUrl}" alt="${carrierName}" width="180" style="display: block; max-height: 60px; width: auto;" /></td></tr></table>`
    : `<h1 style="color: #ffffff; margin: 0 0 12px 0; font-size: 26px; font-weight: 700;">${carrierName}</h1>`;

  // Subject with carrier branding
  const subject = `${carrierName} - Secure ${formTypeLabel} Request from ${agentFirstName}`;

  // Form-specific default messages
  const getDefaultMessage = () => {
    switch (data.formType) {
      case 'ssn':
        return `To finalize and submit your application with ${carrierName}, we'll need your Social Security number for identity verification and underwriting purposes.\n\nFor security, please provide this through our secure submission link below (or feel free to call me directly if you prefer).\n\nLet me know once it's sent so I can confirm receipt and move your application forward immediately.`;
      case 'banking':
        return `To complete your policy setup with ${carrierName}, we'll need your banking information for the initial premium draft and ongoing billing authorization.\n\nYou can submit this securely using the link below, or we can complete it together over the phone -whichever you prefer.\n\nOnce received, I'll confirm and finalize your submission right away.`;
      case 'drivers_license':
        return `To verify your identity for your ${carrierName} application, we'll need your driver's license or state-issued ID information.\n\nPlease submit this through the secure link below -your data is encrypted and protected.\n\nOnce received, I'll confirm and continue processing your application.`;
      case 'full_application':
        return `To move forward with your policy submission to ${carrierName}, I'll need your completed application on file.\n\nPlease send it over at your earliest convenience so we can keep everything on track for underwriting.\n\nIf you have any questions while completing it, let me know -happy to help.`;
      default:
        return `I need your ${formTypeLabel.toLowerCase()} to process your application with ${carrierName}.`;
    }
  };
  const bodyMessage = data.customMessage || getDefaultMessage();

  // HTML Email with carrier branding - nice design without spam triggers
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden;">
          <!-- Carrier Header -->
          <tr>
            <td style="background-color: ${gradientFrom}; padding: 28px 40px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    ${logoHtml}
                    <p style="color: #ffffff; margin: 0; font-size: 14px; font-weight: 500;">${carrierTagline}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Form Type Banner -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-bottom: 1px solid #e5e7eb;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right: 16px; vertical-align: middle;">
                    <span style="font-size: 32px;">${data.formType === 'ssn' ? '🔐' : data.formType === 'banking' ? '🏦' : data.formType === 'drivers_license' ? '🪪' : '📋'}</span>
                  </td>
                  <td style="vertical-align: middle;">
                    <p style="color: ${primaryColor}; font-size: 18px; font-weight: 700; margin: 0;">${formTypeLabel} Request</p>
                    <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">Secure form requested by ${data.agent.name}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Welcome Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-left: 4px solid ${primaryColor}; border-radius: 0 12px 12px 0; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                      Hi <strong style="color: ${primaryColor};">${clientFirstName}</strong>,
                    </p>
                    <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 12px 0 0 0;">
                      ${bodyMessage.replace(/\n\n/g, '</p><p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 12px 0 0 0;">')}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0; text-align: center;">
                Click the secure button below to submit your information:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.secureLink}" style="display: inline-block; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-size: 17px; font-weight: 700;">
                      🔒 Submit ${formTypeLabel} Securely
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Trust Indicators -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 0 12px; text-align: center;">
                          <span style="font-size: 24px;">🔐</span>
                          <p style="color: #6b7280; font-size: 11px; margin: 6px 0 0 0; font-weight: 600;">256-bit SSL</p>
                        </td>
                        <td style="padding: 0 12px; text-align: center;">
                          <span style="font-size: 24px;">🏛️</span>
                          <p style="color: #6b7280; font-size: 11px; margin: 6px 0 0 0; font-weight: 600;">Bank-Level</p>
                        </td>
                        <td style="padding: 0 12px; text-align: center;">
                          <span style="font-size: 24px;">⏱️</span>
                          <p style="color: #6b7280; font-size: 11px; margin: 6px 0 0 0; font-weight: 600;">24hr Expiry</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; margin: 25px 0;">
                <tr>
                  <td style="padding: 18px 24px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: top; padding-right: 14px;">
                          <span style="font-size: 20px;">⚠️</span>
                        </td>
                        <td>
                          <p style="color: #92400e; font-size: 14px; line-height: 1.5; margin: 0; font-weight: 500;">
                            This secure link expires in 24 hours for your protection.
                          </p>
                          <p style="color: #a16207; font-size: 12px; line-height: 1.5; margin: 6px 0 0 0;">
                            Your data is protected with bank-level encryption and will be securely transmitted to your agent.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Agent Signature -->
          <tr>
            <td style="padding: 0 40px 40px 40px; border-top: 1px solid #e5e7eb;">
              <table cellpadding="0" cellspacing="0" style="padding-top: 30px;">
                <tr>
                  <td style="padding-right: 16px; vertical-align: top;">
                    <!-- Agent Avatar -->
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 56px; height: 56px; background-color: ${gradientFrom}; border-radius: 14px; text-align: center; vertical-align: middle;">
                          <span style="color: #ffffff; font-size: 22px; font-weight: 700;">${data.agent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td>
                    <p style="color: #111827; font-size: 17px; font-weight: 700; margin: 0 0 4px 0;">${data.agent.name}</p>
                    <p style="color: ${primaryColor}; font-size: 13px; font-weight: 600; margin: 0 0 8px 0;">Licensed Insurance Agent</p>
                    <p style="color: #6b7280; font-size: 13px; margin: 0;">📧 <a href="mailto:${data.agent.email}" style="color: #6b7280; text-decoration: none;">${data.agent.email}</a></p>
                    <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">📱 <a href="tel:${data.agent.phone.replace(/[^0-9+]/g, '')}" style="color: ${primaryColor}; text-decoration: none; font-weight: 600;">${data.agent.phone}</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    ${carrierLogoUrl ? `<img src="${carrierLogoUrl}" alt="${carrierName}" width="120" style="display: block; margin: 0 auto 12px auto; max-height: 40px; width: auto;" />` : `<p style="color: ${primaryColor}; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">${carrierName}</p>`}
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                      via Heritage Life Solutions
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Legal Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="color: #64748b; font-size: 11px; line-height: 1.6; margin: 0 0 12px 0; text-align: center;">
                      &copy; 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states. IL License #22128144. Policies are issued by our carrier partners and product availability may vary by state.
                    </p>
                    <p style="color: #94a3b8; font-size: 10px; line-height: 1.5; margin: 0 0 10px 0; text-align: center;">
                      At Heritage, we believe protecting your family shouldn't be complicated. Our streamlined process connects you with coverage options from top-rated carriers, often without the need for medical exams. Most applications take just minutes to complete, and approvals can happen within 24-48 hours.
                    </p>
                    <p style="color: #94a3b8; font-size: 10px; line-height: 1.5; margin: 0 0 10px 0; text-align: center;">
                      Life insurance premiums are based on factors including age, health, and coverage amount. Locking in coverage sooner typically means lower rates. Once your policy is in place, your premium remains fixed for the duration of your term.
                    </p>
                    <p style="color: #94a3b8; font-size: 10px; line-height: 1.5; margin: 0; text-align: center;">
                      Heritage Life Solutions partners with A-rated insurance carriers to provide comprehensive coverage options. All quotes are subject to underwriting approval by the issuing carrier.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Plain text fallback
  const plainTextBody = `
${carrierName}
${carrierTagline}

Hi ${clientFirstName},

${bodyMessage}

--------------------------------------------
SUBMIT YOUR ${formTypeLabel.toUpperCase()}:
${data.secureLink}
--------------------------------------------

Security Notice:
- This link expires in 24 hours
- Your data is protected with bank-level encryption
- Information is securely transmitted to your agent

Best regards,

${data.agent.name}
Licensed Insurance Agent
${data.agent.email}
${data.agent.phone}

--------------------------------------------
${carrierName} via Heritage Life Solutions

(c) 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states. IL License #22128144. Policies are issued by our carrier partners and product availability may vary by state.

At Heritage, we believe protecting your family shouldn't be complicated. Our streamlined process connects you with coverage options from top-rated carriers, often without the need for medical exams. Most applications take just minutes to complete, and approvals can happen within 24-48 hours.

Life insurance premiums are based on factors including age, health, and coverage amount. Locking in coverage sooner typically means lower rates. Once your policy is in place, your premium remains fixed for the duration of your term.

Heritage Life Solutions partners with A-rated insurance carriers to provide comprehensive coverage options. All quotes are subject to underwriting approval by the issuing carrier.
  `.trim();

  // Create multipart email with HTML and plain text
  const boundary = `boundary_${Date.now()}`;
  const message = [
    'MIME-Version: 1.0',
    `From: ${data.agent.name} <${process.env.GMAIL_FROM_EMAIL || 'contact@heritagels.org'}>`,
    `To: ${data.clientEmail}`,
    `Reply-To: ${data.agent.email}`,
    `Subject: ${subject}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    plainTextBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`
  ].join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage
    }
  });

  console.log(`[SecureForm] Email sent to ${data.clientEmail} for ${formTypeLabel} (${carrierName})`);
  return result;
}

// Send booking link email to customer
export async function sendBookingLinkEmail(data: {
  customerName: string;
  customerEmail: string;
  bookingLink: string;
  meetingDuration: string;
  meetingType: 'call' | 'video' | 'meeting';
  customMessage?: string;
  agent: {
    name: string;
    email: string;
    phone: string;
  };
}) {
  const gmail = await getGmailClient();

  const customerFirstName = data.customerName.split(' ')[0];
  const agentFirstName = data.agent.name.split(' ')[0];
  const agentInitials = data.agent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // Meeting type labels
  const meetingTypeLabels: Record<string, string> = {
    call: 'Phone Call',
    video: 'Video Call',
    meeting: 'In-Person Meeting'
  };
  const meetingTypeLabel = meetingTypeLabels[data.meetingType] || 'Appointment';

  // Duration labels
  const durationLabels: Record<string, string> = {
    '15': '15-minute',
    '30': '30-minute',
    '45': '45-minute',
    '60': '1-hour'
  };
  const durationLabel = durationLabels[data.meetingDuration] || `${data.meetingDuration}-minute`;

  // Heritage brand colors - Purple and Gold
  const primaryColor = '#7c3aed'; // violet-600
  const goldColor = '#D4AF37'; // heritage gold
  const gradientFrom = '#7c3aed'; // violet
  const gradientTo = '#D4AF37'; // gold
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b';

  const subject = `Book Your ${durationLabel} ${meetingTypeLabel} with ${agentFirstName}`;

  const defaultMessage = `I'd love to schedule a time to connect with you! Use the secure link below to pick a time that works best for your schedule. Looking forward to speaking with you soon.`;
  const bodyMessage = data.customMessage || defaultMessage;

  // HTML Email
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%); padding: 32px 40px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="${logoUrl}" alt="Heritage Life Solutions" style="width: 80px; height: 80px; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);" />
                    <h1 style="color: #ffffff; margin: 16px 0 8px 0; font-size: 24px; font-weight: 700;">Schedule Your Appointment</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px; font-weight: 500;">${durationLabel} ${meetingTypeLabel} with ${data.agent.name}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Meeting Info Banner -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f5f3ff; border-bottom: 1px solid #e9d5ff;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <table cellpadding="0" cellspacing="0" style="display: inline-block;">
                      <tr>
                        <td style="padding: 0 20px; text-align: center; border-right: 1px solid #e9d5ff;">
                          <span style="font-size: 24px;">${data.meetingType === 'video' ? '📹' : data.meetingType === 'call' ? '📞' : '🤝'}</span>
                          <p style="color: #5b21b6; font-size: 13px; margin: 8px 0 0 0; font-weight: 600;">${meetingTypeLabel}</p>
                        </td>
                        <td style="padding: 0 20px; text-align: center;">
                          <span style="font-size: 24px;">⏱️</span>
                          <p style="color: #5b21b6; font-size: 13px; margin: 8px 0 0 0; font-weight: 600;">${durationLabel}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Welcome Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ff; border-left: 4px solid ${primaryColor}; border-radius: 0 12px 12px 0; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                      Hi <strong style="color: ${primaryColor};">${customerFirstName}</strong>,
                    </p>
                    <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 12px 0 0 0;">
                      ${bodyMessage}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0; text-align: center;">
                Click the button below to choose a time that works for you:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.bookingLink}" style="display: inline-block; background: linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%); color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-size: 17px; font-weight: 700; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
                      📅 Book Your Appointment
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What to Expect -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin: 30px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 16px 0;">What to expect:</p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top; width: 24px;">
                          <span style="color: ${primaryColor}; font-weight: bold;">1.</span>
                        </td>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          Choose a date and time that works for your schedule
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top; width: 24px;">
                          <span style="color: ${primaryColor}; font-weight: bold;">2.</span>
                        </td>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          Enter your contact information
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top; width: 24px;">
                          <span style="color: ${primaryColor}; font-weight: bold;">3.</span>
                        </td>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          Receive a confirmation email with ${data.meetingType === 'video' ? 'video call link' : data.meetingType === 'call' ? 'call details' : 'meeting location'}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Agent Signature -->
          <tr>
            <td style="padding: 0 40px 40px 40px; border-top: 1px solid #e5e7eb;">
              <table cellpadding="0" cellspacing="0" style="padding-top: 30px;">
                <tr>
                  <td style="padding-right: 16px; vertical-align: top;">
                    <!-- Agent Avatar -->
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 56px; height: 56px; background: linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%); border-radius: 14px; text-align: center; vertical-align: middle;">
                          <span style="color: #ffffff; font-size: 22px; font-weight: 700;">${agentInitials}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td>
                    <p style="color: #111827; font-size: 17px; font-weight: 700; margin: 0 0 4px 0;">${data.agent.name}</p>
                    <p style="color: ${primaryColor}; font-size: 13px; font-weight: 600; margin: 0 0 8px 0;">Licensed Insurance Agent</p>
                    <p style="color: #6b7280; font-size: 13px; margin: 0;">📧 <a href="mailto:${data.agent.email}" style="color: #6b7280; text-decoration: none;">${data.agent.email}</a></p>
                    <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">📱 <a href="tel:${data.agent.phone.replace(/[^0-9+]/g, '')}" style="color: ${primaryColor}; text-decoration: none; font-weight: 600;">${data.agent.phone}</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="color: ${primaryColor}; font-size: 16px; font-weight: 700; margin: 0 0 4px 0;">Heritage Life Solutions</p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                      Protecting families with personalized insurance solutions
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Legal Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #64748b; font-size: 11px; line-height: 1.7; margin: 0; text-align: center;">
                &copy; 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states. IL License #22128144. Policies are issued by our carrier partners and product availability may vary by state.
              </p>
              <p style="color: #64748b; font-size: 11px; line-height: 1.7; margin: 16px 0 0 0; text-align: center;">
                At Heritage, we believe protecting your family shouldn't be complicated. Our streamlined process connects you with coverage options from top-rated carriers, often without the need for medical exams. Most applications take just minutes to complete, and approvals can happen within 24-48 hours.
              </p>
              <p style="color: #64748b; font-size: 11px; line-height: 1.7; margin: 16px 0 0 0; text-align: center;">
                Life insurance premiums are based on factors including age, health, and coverage amount. Locking in coverage sooner typically means lower rates. Once your policy is in place, your premium remains fixed for the duration of your term.
              </p>
              <p style="color: #64748b; font-size: 11px; line-height: 1.7; margin: 16px 0 0 0; text-align: center;">
                Heritage Life Solutions partners with A-rated insurance carriers to provide comprehensive coverage options. All quotes are subject to underwriting approval by the issuing carrier.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Plain text fallback
  const plainTextBody = `
HERITAGE LIFE SOLUTIONS
Schedule Your Appointment

Hi ${customerFirstName},

${bodyMessage}

--------------------------------------------
BOOK YOUR ${durationLabel.toUpperCase()} ${meetingTypeLabel.toUpperCase()}:
${data.bookingLink}
--------------------------------------------

What to expect:
1. Choose a date and time that works for your schedule
2. Enter your contact information
3. Receive a confirmation email with ${data.meetingType === 'video' ? 'video call link' : data.meetingType === 'call' ? 'call details' : 'meeting location'}

Best regards,

${data.agent.name}
Licensed Insurance Agent
${data.agent.email}
${data.agent.phone}

--------------------------------------------
Heritage Life Solutions
Protecting families with personalized insurance solutions

(c) 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states.
  `.trim();

  // Create multipart email with HTML and plain text
  const boundary = `boundary_${Date.now()}`;
  const message = [
    'MIME-Version: 1.0',
    `From: ${data.agent.name} <${process.env.GMAIL_FROM_EMAIL || 'contact@heritagels.org'}>`,
    `To: ${data.customerEmail}`,
    `Reply-To: ${data.agent.email}`,
    `Subject: ${subject}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    plainTextBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`
  ].join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage
    }
  });

  console.log(`[BookingLink] Email sent to ${data.customerEmail} for ${durationLabel} ${meetingTypeLabel}`);
  return result;
}

// ─── RECRUITING INVITE EMAIL ────────────────────────────────────────────────────

export async function sendRecruitInviteEmail(data: {
  prospectName: string;
  prospectEmail: string;
  recruitLink: string;
  customMessage?: string;
  approach: 'warm_lead' | 'cold_outreach' | 'referral';
  agent: {
    name: string;
    email: string;
    phone: string;
  };
}) {
  const gmail = await getGmailClient();

  const prospectFirstName = data.prospectName.split(' ')[0];
  const agentFirstName = data.agent.name.split(' ')[0];
  const agentInitials = data.agent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // Heritage brand colors
  const primaryColor = '#7c3aed';
  const goldColor = '#D4AF37';
  const gradientFrom = '#7c3aed';
  const gradientTo = '#D4AF37';
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b';

  // Subject line based on approach
  const subjectLines: Record<string, string> = {
    warm_lead: `${agentFirstName} invited you to explore a career opportunity`,
    cold_outreach: `Discover a rewarding career in insurance - Heritage Life Solutions`,
    referral: `You've been recommended for an opportunity at Heritage Life Solutions`,
  };
  const subject = subjectLines[data.approach] || subjectLines.cold_outreach;

  const defaultMessage = `I think you'd be a great fit for our growing team at Heritage Life Solutions. We offer industry-leading training, competitive commissions, and the flexibility to build your career on your own terms. I'd love for you to take a look at what we offer.`;
  const bodyMessage = data.customMessage || defaultMessage;

  // HTML Email
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%); padding: 32px 40px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="${logoUrl}" alt="Heritage Life Solutions" style="width: 80px; height: 80px; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);" />
                    <h1 style="color: #ffffff; margin: 16px 0 8px 0; font-size: 24px; font-weight: 700;">Join Our Growing Team</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px; font-weight: 500;">A career opportunity from ${data.agent.name}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Benefits Banner -->
          <tr>
            <td style="padding: 20px 24px; background-color: #f5f3ff; border-bottom: 1px solid #e9d5ff;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="text-align: center; padding: 6px 0; width: 25%;">
                    <span style="font-size: 20px; display: block;">&#x1F4B0;</span>
                    <p style="color: #5b21b6; font-size: 11px; margin: 6px 0 0 0; font-weight: 600; line-height: 1.3;">Unlimited<br>Earning</p>
                  </td>
                  <td style="text-align: center; padding: 6px 0; width: 25%; border-left: 1px solid #e9d5ff;">
                    <span style="font-size: 20px; display: block;">&#x1F4DA;</span>
                    <p style="color: #5b21b6; font-size: 11px; margin: 6px 0 0 0; font-weight: 600; line-height: 1.3;">Full Training<br>&amp; Licensing</p>
                  </td>
                  <td style="text-align: center; padding: 6px 0; width: 25%; border-left: 1px solid #e9d5ff;">
                    <span style="font-size: 20px; display: block;">&#x1F3E0;</span>
                    <p style="color: #5b21b6; font-size: 11px; margin: 6px 0 0 0; font-weight: 600; line-height: 1.3;">100% Remote<br>Flexibility</p>
                  </td>
                  <td style="text-align: center; padding: 6px 0; width: 25%; border-left: 1px solid #e9d5ff;">
                    <span style="font-size: 20px; display: block;">&#x2705;</span>
                    <p style="color: #5b21b6; font-size: 11px; margin: 6px 0 0 0; font-weight: 600; line-height: 1.3;">Vested<br>Day One</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Welcome Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ff; border-left: 4px solid ${primaryColor}; border-radius: 0 12px 12px 0; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                      Hi <strong style="color: ${primaryColor};">${prospectFirstName}</strong>,
                    </p>
                    <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 12px 0 0 0;">
                      ${bodyMessage}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Stats Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fefce8; border: 1px solid #fde68a; border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="text-align: center; width: 33%;">
                          <p style="color: ${goldColor}; font-size: 22px; font-weight: 800; margin: 0;">$127K</p>
                          <p style="color: #92400e; font-size: 11px; margin: 4px 0 0 0; font-weight: 600;">Avg First-Year</p>
                        </td>
                        <td style="text-align: center; width: 33%; border-left: 1px solid #fde68a; border-right: 1px solid #fde68a;">
                          <p style="color: ${goldColor}; font-size: 22px; font-weight: 800; margin: 0;">500+</p>
                          <p style="color: #92400e; font-size: 11px; margin: 4px 0 0 0; font-weight: 600;">Active Agents</p>
                        </td>
                        <td style="text-align: center; width: 33%;">
                          <p style="color: ${goldColor}; font-size: 22px; font-weight: 800; margin: 0;">40+</p>
                          <p style="color: #92400e; font-size: 11px; margin: 4px 0 0 0; font-weight: 600;">A-Rated Carriers</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0; text-align: center;">
                Click below to learn more and start your application:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.recruitLink}" style="display: inline-block; background: linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%); color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-size: 17px; font-weight: 700; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
                      &#x1F680; View Opportunity &amp; Apply
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What to Expect -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin: 30px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 16px 0;">What to expect:</p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top; width: 24px;">
                          <span style="color: ${primaryColor}; font-weight: bold;">1.</span>
                        </td>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          Learn more about the Heritage opportunity
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top; width: 24px;">
                          <span style="color: ${primaryColor}; font-weight: bold;">2.</span>
                        </td>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          Submit your application &mdash; takes just 2 minutes
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top; width: 24px;">
                          <span style="color: ${primaryColor}; font-weight: bold;">3.</span>
                        </td>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          Complete training &amp; get licensed (12-week program)
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top; width: 24px;">
                          <span style="color: ${primaryColor}; font-weight: bold;">4.</span>
                        </td>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          Start earning with 40+ A-rated carriers
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Agent Signature -->
          <tr>
            <td style="padding: 0 40px 40px 40px; border-top: 1px solid #e5e7eb;">
              <table cellpadding="0" cellspacing="0" style="padding-top: 30px;">
                <tr>
                  <td style="padding-right: 16px; vertical-align: top;">
                    <!-- Agent Avatar -->
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 56px; height: 56px; background: linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%); border-radius: 14px; text-align: center; vertical-align: middle;">
                          <span style="color: #ffffff; font-size: 22px; font-weight: 700;">${agentInitials}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td>
                    <p style="color: #111827; font-size: 17px; font-weight: 700; margin: 0 0 4px 0;">${data.agent.name}</p>
                    <p style="color: ${primaryColor}; font-size: 13px; font-weight: 600; margin: 0 0 8px 0;">Heritage Recruiter</p>
                    <p style="color: #6b7280; font-size: 13px; margin: 0;">&#x1F4E7; <a href="mailto:${data.agent.email}" style="color: #6b7280; text-decoration: none;">${data.agent.email}</a></p>
                    ${data.agent.phone ? `<p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">&#x1F4F1; <a href="tel:${data.agent.phone.replace(/[^0-9+]/g, '')}" style="color: ${primaryColor}; text-decoration: none; font-weight: 600;">${data.agent.phone}</a></p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="color: ${primaryColor}; font-size: 16px; font-weight: 700; margin: 0 0 4px 0;">Heritage Life Solutions</p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                      Protecting families with personalized insurance solutions
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Legal Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #64748b; font-size: 11px; line-height: 1.7; margin: 0; text-align: center;">
                &copy; 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states.
              </p>
              <p style="color: #64748b; font-size: 11px; line-height: 1.7; margin: 12px 0 0 0; text-align: center;">
                Commission rates referenced are based on product type and production level. Income examples represent averages and are not guarantees of earnings. Individual results may vary based on effort, experience, and market conditions.
              </p>
              <p style="color: #64748b; font-size: 11px; line-height: 1.7; margin: 12px 0 0 0; text-align: center;">
                Heritage Life Solutions is an equal opportunity organization. All applicants are welcome regardless of background, experience level, or prior industry knowledge.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Plain text fallback
  const plainTextBody = `
HERITAGE LIFE SOLUTIONS
Join Our Growing Team

Hi ${prospectFirstName},

${bodyMessage}

--------------------------------------------
VIEW THE OPPORTUNITY & APPLY:
${data.recruitLink}
--------------------------------------------

Why Heritage?
- Unlimited Earning Potential ($127K avg first year)
- Full Training & Licensing (12-week program)
- 100% Remote Flexibility
- Vested from Day One

Key Stats:
- $127K Average First-Year Income
- 500+ Active Agents
- 40+ A-Rated Carriers

What to expect:
1. Learn more about the Heritage opportunity
2. Submit your application - takes just 2 minutes
3. Complete training & get licensed (12-week program)
4. Start earning with 40+ A-rated carriers

Best regards,

${data.agent.name}
Heritage Recruiter
${data.agent.email}
${data.agent.phone ? data.agent.phone : ''}

--------------------------------------------
Heritage Life Solutions
Protecting families with personalized insurance solutions

(c) 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. Commission rates are based on product type and production level. Income examples are not guarantees. Individual results may vary.
  `.trim();

  // Create multipart email with HTML and plain text
  const boundary = `boundary_${Date.now()}`;
  const message = [
    'MIME-Version: 1.0',
    `From: ${data.agent.name} <${process.env.GMAIL_FROM_EMAIL || 'contact@heritagels.org'}>`,
    `To: ${data.prospectEmail}`,
    `Reply-To: ${data.agent.email}`,
    `Subject: ${subject}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    plainTextBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`
  ].join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage
    }
  });

  console.log(`[RecruitInvite] Email sent to ${data.prospectEmail} (${data.approach})`);
  return result;
}

// ─── POLICY QUOTE EMAIL ─────────────────────────────────────────────────────────

export async function sendPolicyQuoteEmail(data: {
  clientName: string;
  clientEmail: string;
  quoteType: string;
  quoteTypeName: string;
  coverageAmount: string;
  premium: string;
  premiumFrequency: string;
  termLength?: string;
  healthClass?: string;
  benefits: string;
  additionalNotes?: string;
  carrierId: string;
  carrierName: string;
  quoteRef: string;
  quoteId: string;
  agent: {
    name: string;
    email: string;
    phone: string;
    npn?: string;
  };
}) {
  const gmail = await getGmailClient();

  const clientFirstName = data.clientName.split(' ')[0];
  const agentFirstName = data.agent.name.split(' ')[0];
  const agentInitials = data.agent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // Get carrier branding
  const carrier = CARRIER_EMAIL_BRANDING[data.carrierId] || {
    name: data.carrierName,
    shortName: data.carrierName,
    primaryColor: '#1E40AF',
    secondaryColor: '#3B82F6',
    gradientFrom: '#1E40AF',
    gradientTo: '#3B82F6',
    tagline: 'Life Insurance Solutions',
  };

  const logoUrl = carrier.logoUrl;
  const heritageLogoUrl = 'https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b';

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const agentSlug = data.agent.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://heritagels.org' : `http://localhost:${process.env.PORT || 5000}`;
  const quoteViewLink = `${baseUrl}/quotes/view/${data.quoteId}`;

  const subject = `Your ${data.quoteTypeName} Quote from ${carrier.shortName} - Prepared by ${agentFirstName}`;

  // Build logo HTML - matching sendSecureFormEmail pattern exactly
  const logoHtml = logoUrl
    ? `<table cellpadding="0" cellspacing="0" style="margin-bottom: 12px;"><tr><td align="center" style="background-color: #ffffff; border-radius: 12px; padding: 14px 22px;"><img src="${logoUrl}" alt="${carrier.shortName}" width="180" style="display: block; max-height: 60px; width: auto;" /></td></tr></table>`
    : `<h1 style="color: #ffffff; margin: 0 0 12px 0; font-size: 26px; font-weight: 700;">${carrier.shortName}</h1>`;

  const quoteLabels: Record<string, { icon: string; label: string }> = {
    term_life: { icon: '&#x1F6E1;', label: 'Term Life Insurance' },
    whole_life: { icon: '&#x1F512;', label: 'Whole Life Insurance' },
    iul: { icon: '&#x1F4C8;', label: 'Indexed Universal Life' },
    final_expense: { icon: '&#x2764;', label: 'Final Expense Insurance' },
    annuity: { icon: '&#x1F4B0;', label: 'Annuity' },
  };
  const typeInfo = quoteLabels[data.quoteType] || { icon: '&#x1F4C4;', label: data.quoteTypeName };

  // Brief summary email -full details on the web page
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden;">

          <!-- Carrier Header -solid background with white logo container -->
          <tr>
            <td style="background-color: ${carrier.gradientFrom}; padding: 28px 40px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    ${logoHtml}
                    <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 13px; font-weight: 500;">in partnership with Heritage Life Solutions</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title Bar -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8fafc; border-bottom: 2px solid ${carrier.primaryColor};">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="color: ${carrier.primaryColor}; font-size: 20px; font-weight: 700; margin: 0;">Your Personal Insurance Quote</p>
                    <p style="color: #6b7280; font-size: 12px; margin: 4px 0 0 0;">Ref: ${data.quoteRef} &bull; ${today}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Brief Greeting -->
          <tr>
            <td style="padding: 30px 40px 20px 40px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                Hi <strong style="color: ${carrier.primaryColor};">${clientFirstName}</strong>,
              </p>
              <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 12px 0 0 0;">
                ${data.agent.name} has prepared a personalized ${typeInfo.label.toLowerCase()} quote for you from ${carrier.shortName}. Here's a quick summary:
              </p>
            </td>
          </tr>

          <!-- Mini Product Summary -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">Product</p>
                          <p style="color: #374151; font-size: 15px; font-weight: 600; margin: 4px 0 0 0;">${typeInfo.label}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 8px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 50%;">
                                <p style="color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">Coverage</p>
                                <p style="color: ${carrier.primaryColor}; font-size: 22px; font-weight: 800; margin: 4px 0 0 0;">${data.coverageAmount}</p>
                              </td>
                              <td style="width: 50%; border-left: 1px solid #e5e7eb; padding-left: 20px;">
                                <p style="color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">${data.premiumFrequency === 'annual' ? 'Annual' : 'Monthly'} Premium</p>
                                <p style="color: ${carrier.primaryColor}; font-size: 22px; font-weight: 800; margin: 4px 0 0 0;">${data.premium}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${quoteViewLink}" style="display: inline-block; background-color: ${carrier.primaryColor}; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);">
                      &#x1F4C4; View Your Complete Quote
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">Includes full benefits, carrier details, and next steps</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Agent Block -->
          <tr>
            <td style="padding: 0 40px 24px 40px; border-top: 1px solid #e5e7eb;">
              <table cellpadding="0" cellspacing="0" width="100%" style="padding-top: 20px;">
                <tr>
                  <td style="padding-right: 14px; vertical-align: top;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 48px; height: 48px; background-color: ${carrier.primaryColor}; border-radius: 12px; text-align: center; vertical-align: middle;">
                          <span style="color: #ffffff; font-size: 18px; font-weight: 700;">${agentInitials}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="vertical-align: top;">
                    <p style="color: #111827; font-size: 15px; font-weight: 700; margin: 0;">${data.agent.name}</p>
                    <p style="color: ${carrier.primaryColor}; font-size: 12px; font-weight: 600; margin: 2px 0 0 0;">Licensed Insurance Agent &bull; Heritage Life Solutions</p>
                    ${data.agent.npn ? `<p style="color: #9ca3af; font-size: 11px; margin: 2px 0 0 0;">NPN: ${data.agent.npn}</p>` : ''}
                    <p style="color: #6b7280; font-size: 12px; margin: 4px 0 0 0;">
                      <a href="mailto:${data.agent.email}" style="color: #6b7280; text-decoration: none;">${data.agent.email}</a>
                      ${data.agent.phone ? ` &bull; <a href="tel:${data.agent.phone.replace(/[^0-9+]/g, '')}" style="color: ${carrier.primaryColor}; text-decoration: none; font-weight: 600;">${data.agent.phone}</a>` : ''}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Co-branded Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right: 12px;">
                          <img src="${heritageLogoUrl}" alt="Heritage Life Solutions" style="width: 32px; height: 32px; border-radius: 8px;" />
                        </td>
                        ${logoUrl ? `<td style="padding-left: 12px; border-left: 1px solid #e5e7eb;"><img src="${logoUrl}" alt="${carrier.shortName}" style="max-width: 72px; max-height: 32px;" /></td>` : ''}
                      </tr>
                    </table>
                    <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 0 0;">Heritage Life Solutions &mdash; Authorized ${carrier.shortName} Distribution Partner</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Legal -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 16px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #94a3b8; font-size: 10px; line-height: 1.6; margin: 0; text-align: center;">
                &copy; 2026 Gold Coast Financial Partners. This quote is for informational purposes only and does not constitute a binding contract. Final rates and coverage are subject to underwriting approval by ${carrier.name}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const plainTextBody = `
${carrier.name.toUpperCase()}
in partnership with Heritage Life Solutions

YOUR PERSONAL INSURANCE QUOTE
Ref: ${data.quoteRef} | ${today}

Hi ${clientFirstName},

${data.agent.name} has prepared a personalized ${typeInfo.label.toLowerCase()} quote for you from ${carrier.shortName}.

QUICK SUMMARY
--------------
Product: ${typeInfo.label}
Coverage: ${data.coverageAmount}
${data.premiumFrequency === 'annual' ? 'Annual' : 'Monthly'} Premium: ${data.premium}

View your complete quote with full benefits, carrier details, and next steps:
${quoteViewLink}

YOUR AGENT
-----------
${data.agent.name}
Licensed Insurance Agent - Heritage Life Solutions
${data.agent.email}
${data.agent.phone || ''}

Heritage Life Solutions - Authorized ${carrier.shortName} Distribution Partner
(c) 2026 Gold Coast Financial Partners. This quote is for informational purposes only and does not constitute a binding contract. Final rates and coverage are subject to underwriting approval by ${carrier.name}.
  `.trim();

  const boundary = `boundary_${Date.now()}`;
  const message = [
    'MIME-Version: 1.0',
    `From: ${data.agent.name} <${process.env.GMAIL_FROM_EMAIL || 'contact@heritagels.org'}>`,
    `To: ${data.clientEmail}`,
    `Reply-To: ${data.agent.email}`,
    `Subject: ${subject}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    plainTextBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`
  ].join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage }
  });

  console.log(`[PolicyQuote] Email sent to ${data.clientEmail} (${data.quoteType} via ${carrier.shortName})`);
  return result;
}

// ─── APPROVAL EMAIL ────────────────────────────────────────────────────────────

export async function sendApprovalEmail(data: {
  agentName: string;
  agentEmail: string;
  loginUrl: string;
  approvedBy: string;
}): Promise<any> {
  const gmail = await getGmailClient();
  const firstName = data.agentName.split(' ')[0];

  // Heritage Executive/orange brand colors
  const primaryColor = '#ea580c';
  const secondaryColor = '#b91c1c';
  const accentColor = '#fbbf24';
  const gradient = 'linear-gradient(135deg, #ea580c 0%, #b91c1c 50%, #fbbf24 100%)';
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b';

  const subject = "Welcome to Heritage Life Solutions - You're Approved!";

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header with Gradient -->
          <tr>
            <td style="background: ${gradient}; padding: 32px 40px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="${logoUrl}" alt="Heritage Life Solutions" style="width: 80px; height: 80px; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);" />
                    <h1 style="color: #ffffff; margin: 16px 0 8px 0; font-size: 28px; font-weight: 700;">Welcome Aboard!</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 15px; font-weight: 500;">Your application has been approved</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Greeting -->
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Dear <strong style="color: ${primaryColor};">${firstName}</strong>,
              </p>
              <p style="color: #6b7280; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                Congratulations! We are thrilled to inform you that your application to join Heritage Life Solutions has been <strong style="color: ${primaryColor};">approved</strong>. You are now part of a growing team of professionals dedicated to protecting families with personalized insurance solutions.
              </p>

              <!-- What's Next Section -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff7ed; border-left: 4px solid ${primaryColor}; border-radius: 0 12px 12px 0; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: #374151; font-size: 16px; font-weight: 700; margin: 0 0 16px 0;">What's Next:</p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top; width: 28px;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: ${primaryColor}; color: #ffffff; border-radius: 50%; text-align: center; line-height: 24px; font-size: 13px; font-weight: 700;">1</span>
                        </td>
                        <td style="padding: 8px 0 8px 8px; color: #374151; font-size: 14px; line-height: 1.5;">
                          <strong>Sign in to your Agent Portal</strong> &mdash; access your personalized dashboard and tools
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top; width: 28px;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: ${primaryColor}; color: #ffffff; border-radius: 50%; text-align: center; line-height: 24px; font-size: 13px; font-weight: 700;">2</span>
                        </td>
                        <td style="padding: 8px 0 8px 8px; color: #374151; font-size: 14px; line-height: 1.5;">
                          <strong>Complete your onboarding checklist</strong> &mdash; verify your details and set up your profile
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top; width: 28px;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: ${secondaryColor}; color: #ffffff; border-radius: 50%; text-align: center; line-height: 24px; font-size: 13px; font-weight: 700;">3</span>
                        </td>
                        <td style="padding: 8px 0 8px 8px; color: #374151; font-size: 14px; line-height: 1.5;">
                          <strong>Begin product training</strong> &mdash; learn about our carrier lineup and product offerings
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top; width: 28px;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: ${secondaryColor}; color: #ffffff; border-radius: 50%; text-align: center; line-height: 24px; font-size: 13px; font-weight: 700;">4</span>
                        </td>
                        <td style="padding: 8px 0 8px 8px; color: #374151; font-size: 14px; line-height: 1.5;">
                          <strong>Start building your book of business</strong> &mdash; your journey to success begins now
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.loginUrl}" style="display: inline-block; background: ${gradient}; color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-size: 17px; font-weight: 700; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.4);">
                      Sign In &amp; Start Your Journey
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Approved By -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px;">
                <tr>
                  <td style="padding: 16px 20px; text-align: center;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">Approved by</p>
                    <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 4px 0 0 0;">${data.approvedBy}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="color: ${primaryColor}; font-size: 16px; font-weight: 700; margin: 0 0 4px 0;">Heritage Life Solutions</p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">Protecting families with personalized insurance solutions</p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
                      <a href="mailto:contact@heritagels.org" style="color: ${primaryColor}; text-decoration: none;">contact@heritagels.org</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Legal Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #64748b; font-size: 11px; line-height: 1.7; margin: 0; text-align: center;">
                &copy; 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const textBody = `
HERITAGE LIFE SOLUTIONS
Welcome Aboard!

Dear ${firstName},

Congratulations! Your application to join Heritage Life Solutions has been approved. You are now part of a growing team of professionals dedicated to protecting families with personalized insurance solutions.

What's Next:
1. Sign in to your Agent Portal - access your personalized dashboard and tools
2. Complete your onboarding checklist - verify your details and set up your profile
3. Begin product training - learn about our carrier lineup and product offerings
4. Start building your book of business - your journey to success begins now

SIGN IN & START YOUR JOURNEY:
${data.loginUrl}

Approved by: ${data.approvedBy}

--------------------------------------------
Heritage Life Solutions
Protecting families with personalized insurance solutions
contact@heritagels.org

(c) 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners.
  `.trim();

  const boundary = `boundary_${Date.now()}`;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || 'noreply@heritagels.org';
  const messageParts = [
    'MIME-Version: 1.0',
    `From: Heritage Life Solutions <${fromEmail}>`,
    `To: ${data.agentEmail}`,
    `Subject: ${subject}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    textBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`,
  ].join('\n');

  const encodedMessage = Buffer.from(messageParts)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });

  console.log(`[Approval] Email sent to ${data.agentEmail}`);
  return result;
}

// ─── REJECTION EMAIL ───────────────────────────────────────────────────────────

export async function sendRejectionEmail(data: {
  applicantName: string;
  applicantEmail: string;
  reason: string;
  contactEmail: string;
}): Promise<any> {
  const gmail = await getGmailClient();
  const firstName = data.applicantName.split(' ')[0];

  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b';

  const subject = 'Update on Your Heritage Life Solutions Application';

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Muted Gray Header -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 32px 40px; text-align: center; border-bottom: 1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="${logoUrl}" alt="Heritage Life Solutions" style="width: 72px; height: 72px; border-radius: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
                    <h1 style="color: #475569; margin: 12px 0 4px 0; font-size: 22px; font-weight: 700;">Application Update</h1>
                    <p style="color: #94a3b8; margin: 0; font-size: 14px; font-weight: 500;">Heritage Life Solutions</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Dear <strong>${firstName}</strong>,
              </p>
              <p style="color: #6b7280; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
                Thank you for your interest in joining Heritage Life Solutions. We appreciate the time you took to submit your application and learn more about our organization.
              </p>
              <p style="color: #6b7280; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                After careful review, unfortunately we are unable to move forward with your application at this time.
              </p>

              <!-- Reason Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-left: 4px solid #94a3b8; border-radius: 0 12px 12px 0; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #64748b; font-size: 13px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">Reason</p>
                    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0;">
                      ${data.reason}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
                This decision does not have to be permanent. We encourage you to reapply in the future if your circumstances change. We would be happy to reconsider your application.
              </p>

              <p style="color: #6b7280; font-size: 15px; line-height: 1.7; margin: 0 0 8px 0;">
                If you have any questions, please don't hesitate to reach out:
              </p>
              <p style="margin: 0 0 0 0;">
                <a href="mailto:${data.contactEmail}" style="color: #475569; font-size: 15px; font-weight: 600; text-decoration: none;">${data.contactEmail}</a>
              </p>

              <p style="color: #6b7280; font-size: 15px; line-height: 1.7; margin: 24px 0 0 0;">
                We wish you the very best in your future endeavors.
              </p>
              <p style="color: #6b7280; font-size: 15px; line-height: 1.7; margin: 8px 0 0 0;">
                Sincerely,<br>
                <strong style="color: #374151;">The Heritage Life Solutions Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="color: #94a3b8; font-size: 16px; font-weight: 700; margin: 0 0 4px 0;">Heritage Life Solutions</p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">Protecting families with personalized insurance solutions</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Legal Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #64748b; font-size: 11px; line-height: 1.7; margin: 0; text-align: center;">
                &copy; 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const textBody = `
HERITAGE LIFE SOLUTIONS
Application Update

Dear ${firstName},

Thank you for your interest in joining Heritage Life Solutions. We appreciate the time you took to submit your application and learn more about our organization.

After careful review, unfortunately we are unable to move forward with your application at this time.

Reason: ${data.reason}

This decision does not have to be permanent. We encourage you to reapply in the future if your circumstances change. We would be happy to reconsider your application.

If you have any questions, please reach out to: ${data.contactEmail}

We wish you the very best in your future endeavors.

Sincerely,
The Heritage Life Solutions Team

--------------------------------------------
Heritage Life Solutions
Protecting families with personalized insurance solutions

(c) 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners.
  `.trim();

  const boundary = `boundary_${Date.now()}`;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || 'noreply@heritagels.org';
  const messageParts = [
    'MIME-Version: 1.0',
    `From: Heritage Life Solutions <${fromEmail}>`,
    `To: ${data.applicantEmail}`,
    `Subject: ${subject}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    textBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`,
  ].join('\n');

  const encodedMessage = Buffer.from(messageParts)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });

  console.log(`[Rejection] Email sent to ${data.applicantEmail}`);
  return result;
}

// ─── PROMOTION EMAIL ───────────────────────────────────────────────────────────

export async function sendPromotionEmail(data: {
  agentName: string;
  agentEmail: string;
  previousTitle: string;
  newTitle: string;
  newRole: string;
  newLoungeAccess: string[];
  loginUrl: string;
}): Promise<any> {
  const gmail = await getGmailClient();
  const firstName = data.agentName.split(' ')[0];

  // Heritage brand colors — violet/purple primary, amber/gold accent
  const primaryColor = '#7c3aed';
  const primaryDark = '#6d28d9';
  const accentColor = '#f59e0b';
  const gradient = 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #f59e0b 100%)';
  const accentGradient = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b';

  const subject = `Congratulations on Your Promotion to ${data.newTitle}!`;

  // Role-specific messaging
  const roleContent: Record<string, { headline: string; body: string; whatsChanged: string }> = {
    manager: {
      headline: `You're Now a Manager`,
      body: `Your hard work and leadership have earned you a well-deserved promotion from <strong style="color: #374151;">${data.previousTitle}</strong> to <strong style="color: ${primaryColor};">${data.newTitle}</strong>. This is a significant milestone in your career at Heritage, and we're excited to see you take on this new challenge.`,
      whatsChanged: `As a Manager, you now lead your own team of agents. You'll have access to team performance dashboards, coaching tools, and the Manager Lounge — your hub for tracking production, onboarding new agents, and driving results. Your agents are counting on you, and we know you'll deliver.`,
    },
    system_admin: {
      headline: `You've Been Elevated to Director`,
      body: `Your consistent results and leadership as a Manager have set you apart. We're proud to promote you from <strong style="color: #374151;">${data.previousTitle}</strong> to <strong style="color: ${primaryColor};">${data.newTitle}</strong> — a role reserved for Heritage's top performers.`,
      whatsChanged: `As a Director, you now oversee multiple teams and play a key role in shaping agency strategy. You'll have expanded reporting, the ability to manage managers, and access to advanced analytics to drive growth across your region.`,
    },
    owner: {
      headline: `Welcome to the Executive Team`,
      body: `This is the pinnacle — you've been promoted from <strong style="color: #374151;">${data.previousTitle}</strong> to <strong style="color: ${primaryColor};">${data.newTitle}</strong>. Your vision, dedication, and track record of building successful teams have earned you a seat at the executive table.`,
      whatsChanged: `As an Executive, you have full access to every area of the Heritage platform — agency-wide KPIs, financial oversight, AI tools, strategic planning, and the Executive Lounge. You're now part of the team that sets the direction for Heritage Life Solutions.`,
    },
  };

  const content = roleContent[data.newRole] || {
    headline: `Congratulations on Your Promotion`,
    body: `We're pleased to announce your promotion from <strong style="color: #374151;">${data.previousTitle}</strong> to <strong style="color: ${primaryColor};">${data.newTitle}</strong>. Your dedication and results have made this possible.`,
    whatsChanged: `Your new role comes with expanded access and responsibilities within the Heritage platform. Log in to explore everything that's now available to you.`,
  };

  // Build lounge access list HTML
  const loungeAccessHtml = data.newLoungeAccess.map(item =>
    `<tr>
      <td style="padding: 6px 0; vertical-align: top; width: 24px;">
        <span style="color: ${primaryColor}; font-size: 14px;">&#x2713;</span>
      </td>
      <td style="padding: 6px 0 6px 8px; color: #374151; font-size: 14px; line-height: 1.5;">
        ${item}
      </td>
    </tr>`
  ).join('\n');

  // Build lounge access list plain text
  const loungeAccessText = data.newLoungeAccess.map(item => `  * ${item}`).join('\n');

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header with Gradient -->
          <tr>
            <td style="background: ${gradient}; padding: 32px 40px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="${logoUrl}" alt="Heritage Life Solutions" style="width: 80px; height: 80px; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);" />
                    <h1 style="color: #ffffff; margin: 16px 0 8px 0; font-size: 26px; font-weight: 700;">${content.headline}</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 15px; font-weight: 500;">${data.previousTitle} &rarr; ${data.newTitle}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                ${firstName},
              </p>
              <p style="color: #6b7280; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                ${content.body}
              </p>

              <!-- What's Changed Section -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ff; border-left: 4px solid ${primaryColor}; border-radius: 0 12px 12px 0; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: #374151; font-size: 15px; font-weight: 700; margin: 0 0 12px 0;">What This Means for You</p>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.7; margin: 0;">
                      ${content.whatsChanged}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- New Access Section -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: #374151; font-size: 15px; font-weight: 700; margin: 0 0 16px 0;">Your Platform Access</p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      ${loungeAccessHtml}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.loginUrl}" style="display: inline-block; background: ${gradient}; color: #ffffff; text-decoration: none; padding: 16px 44px; border-radius: 12px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);">
                      Log In to Your Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="color: ${primaryColor}; font-size: 16px; font-weight: 700; margin: 0 0 4px 0;">Heritage Life Solutions</p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">Protecting families with personalized insurance solutions</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Legal Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #64748b; font-size: 11px; line-height: 1.7; margin: 0; text-align: center;">
                &copy; 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states. IL License #22128144. Policies are issued by our carrier partners and product availability may vary by state.
              </p>
              <p style="color: #64748b; font-size: 11px; line-height: 1.7; margin: 12px 0 0 0; text-align: center;">
                Commission rates referenced are based on product type and production level. Income examples represent averages and are not guarantees of earnings. Individual results may vary based on effort, experience, and market conditions.
              </p>
              <p style="color: #64748b; font-size: 11px; line-height: 1.7; margin: 12px 0 0 0; text-align: center;">
                Heritage Life Solutions is an equal opportunity organization. All applicants are welcome regardless of background, experience level, or prior industry knowledge.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const contentPlain = roleContent[data.newRole] || { whatsChanged: 'Your new role comes with expanded access and responsibilities within the Heritage platform.' };

  const textBody = `
HERITAGE LIFE SOLUTIONS

${content.headline}

${firstName},

${content.body.replace(/<[^>]+>/g, '')}

WHAT THIS MEANS FOR YOU:
${content.whatsChanged}

YOUR PLATFORM ACCESS:
${loungeAccessText}

LOG IN TO YOUR DASHBOARD:
${data.loginUrl}

--------------------------------------------
Heritage Life Solutions
Protecting families with personalized insurance solutions

(c) 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states. IL License #22128144. Policies are issued by our carrier partners and product availability may vary by state.

Commission rates referenced are based on product type and production level. Income examples represent averages and are not guarantees of earnings. Individual results may vary based on effort, experience, and market conditions.

Heritage Life Solutions is an equal opportunity organization. All applicants are welcome regardless of background, experience level, or prior industry knowledge.
  `.trim();

  const boundary = `boundary_${Date.now()}`;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || 'noreply@heritagels.org';
  const messageParts = [
    'MIME-Version: 1.0',
    `From: Heritage Life Solutions <${fromEmail}>`,
    `To: ${data.agentEmail}`,
    `Subject: ${subject}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    textBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`,
  ].join('\n');

  const encodedMessage = Buffer.from(messageParts)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });

  console.log(`[Promotion] Email sent to ${data.agentEmail} -promoted to ${data.newTitle}`);
  return result;
}

// ─── ACCESS CHANGE EMAIL ───────────────────────────────────────────────────────

export async function sendAccessChangeEmail(data: {
  memberName: string;
  memberEmail: string;
  changeDescription: string;
  reason?: string;
  loginUrl: string;
}): Promise<any> {
  const gmail = await getGmailClient();
  const firstName = data.memberName.split(' ')[0];

  // Heritage violet-to-amber brand colors
  const primaryColor = '#7c3aed';
  const gradient = 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #f59e0b 100%)';
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b';

  const subject = 'Your Access Has Been Updated - Heritage Life Solutions';

  const reasonHtml = data.reason
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-left: 4px solid #94a3b8; border-radius: 0 12px 12px 0; margin-bottom: 24px;">
        <tr>
          <td style="padding: 16px 20px;">
            <p style="color: #64748b; font-size: 13px; font-weight: 600; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.05em;">Reason</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0;">${data.reason}</p>
          </td>
        </tr>
      </table>`
    : '';

  const reasonText = data.reason ? `\nReason: ${data.reason}\n` : '';

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Small Gradient Header -->
          <tr>
            <td style="background: ${gradient}; padding: 20px 40px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="${logoUrl}" alt="Heritage Life Solutions" style="width: 56px; height: 56px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Hi <strong style="color: ${primaryColor};">${firstName}</strong>,
              </p>
              <p style="color: #6b7280; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                This is to let you know that your account access at Heritage Life Solutions has been updated.
              </p>

              <!-- Change Description Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ff; border-left: 4px solid ${primaryColor}; border-radius: 0 12px 12px 0; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #64748b; font-size: 13px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">Change Summary</p>
                    <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0;">
                      ${data.changeDescription}
                    </p>
                  </td>
                </tr>
              </table>

              ${reasonHtml}

              <p style="color: #6b7280; font-size: 15px; line-height: 1.7; margin: 0 0 30px 0;">
                Sign in to your account to view your updated access and permissions.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.loginUrl}" style="display: inline-block; background: ${gradient}; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
                      Sign In
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="color: ${primaryColor}; font-size: 16px; font-weight: 700; margin: 0 0 4px 0;">Heritage Life Solutions</p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">Protecting families with personalized insurance solutions</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Legal Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #64748b; font-size: 11px; line-height: 1.7; margin: 0; text-align: center;">
                &copy; 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const textBody = `
HERITAGE LIFE SOLUTIONS
Access Update

Hi ${firstName},

This is to let you know that your account access at Heritage Life Solutions has been updated.

Change Summary: ${data.changeDescription}
${reasonText}
Sign in to your account to view your updated access and permissions:
${data.loginUrl}

--------------------------------------------
Heritage Life Solutions
Protecting families with personalized insurance solutions

(c) 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners.
  `.trim();

  const boundary = `boundary_${Date.now()}`;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || 'noreply@heritagels.org';
  const messageParts = [
    'MIME-Version: 1.0',
    `From: Heritage Life Solutions <${fromEmail}>`,
    `To: ${data.memberEmail}`,
    `Subject: ${subject}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    textBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`,
  ].join('\n');

  const encodedMessage = Buffer.from(messageParts)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });

  console.log(`[AccessChange] Email sent to ${data.memberEmail}`);
  return result;
}

export async function sendWebsiteLinkEmail(data: {
  recipientName: string;
  recipientEmail: string;
  websiteUrl: string;
  personalMessage?: string;
  agent: {
    name: string;
    email: string;
    phone: string;
  };
}) {
  const gmail = await getGmailClient();

  const recipientFirst = data.recipientName.split(' ')[0];
  const agentFirst = data.agent.name.split(' ')[0];
  const agentInitials = data.agent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const primaryColor = '#7c3aed';
  const gradientTo = '#D4AF37';
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b';

  const subject = `${agentFirst} shared a link with you`;

  const defaultMessage = `I wanted to share my personal website with you. I put it together so you can browse your options and learn about the coverage plans I work with -all at your own pace, with no pressure or commitment needed. Take a look when you get a chance, and feel free to reach out if you have any questions.`;
  const bodyMessage = data.personalMessage || defaultMessage;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${primaryColor} 0%, ${gradientTo} 100%); padding: 32px 40px; text-align: center;">
              <img src="${logoUrl}" alt="Heritage Life Solutions" style="width: 64px; height: 64px; border-radius: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 40px;">
              <p style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">Hi ${recipientFirst},</p>
              <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">${bodyMessage}</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #f3f4f6; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">On my website, you can:</p>
                    <p style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0;">
                      1. Browse plans from top-rated carriers<br/>
                      2. Compare coverage options for your family<br/>
                      3. Learn about the process &mdash; no pressure at all<br/>
                      4. Reach out to me directly with any questions
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${data.websiteUrl}" style="display: inline-block; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 12px; font-size: 15px; font-weight: 600;">
                      Visit My Website
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                Looking forward to connecting,<br/>
                ${agentFirst}
              </p>
            </td>
          </tr>

          <!-- Agent Signature -->
          <tr>
            <td style="padding: 0 40px 32px; border-top: 1px solid #e5e7eb;">
              <table cellpadding="0" cellspacing="0" width="100%" style="padding-top: 28px;">
                <tr>
                  <td style="padding-right: 20px; vertical-align: top; width: 72px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 64px; height: 64px; background-color: ${primaryColor}; border-radius: 16px; text-align: center; vertical-align: middle;">
                          <span style="color: #ffffff; font-size: 24px; font-weight: 700;">${agentInitials}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="vertical-align: top;">
                    <p style="color: #111827; font-size: 20px; font-weight: 700; margin: 0 0 4px 0;">${data.agent.name}</p>
                    <p style="color: ${primaryColor}; font-size: 15px; font-weight: 700; margin: 0 0 4px 0;">Licensed Insurance Agent</p>
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 12px 0;">Heritage Life Solutions</p>
                    <p style="color: #4b5563; font-size: 14px; margin: 0 0 6px 0;">&#x1F4E7; <a href="mailto:${data.agent.email}" style="color: #4b5563; text-decoration: none;">${data.agent.email}</a></p>
                    ${data.agent.phone ? `<p style="color: #4b5563; font-size: 14px; margin: 0;">&#x1F4F1; <a href="tel:${data.agent.phone.replace(/[^0-9+]/g, '')}" style="color: ${primaryColor}; text-decoration: none; font-weight: 600;">${data.agent.phone}</a></p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Heritage Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <img src="${logoUrl}" alt="Heritage Life Solutions" style="width: 32px; height: 32px; border-radius: 8px;" />
              <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">Heritage Life Solutions</p>
            </td>
          </tr>

          <!-- Legal Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="color: #64748b; font-size: 11px; line-height: 1.6; margin: 0 0 12px 0; text-align: center;">
                      This email was sent by ${data.agent.name} via Heritage Life Solutions.<br/>
                      &copy; 2024-2026 Gold Coast Financial Partners. All rights reserved.
                    </p>
                    <p style="color: #94a3b8; font-size: 10px; line-height: 1.5; margin: 0 0 10px 0; text-align: center;">
                      Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states.
                    </p>
                    <p style="color: #94a3b8; font-size: 10px; line-height: 1.5; margin: 0 0 10px 0; text-align: center;">
                      All products are issued by the respective carrier. Heritage Life Solutions does not guarantee any specific policy outcomes. Quotes are for informational purposes only and do not constitute a binding contract or guarantee of coverage. Final rates, terms, and coverage are subject to underwriting approval. Premiums may vary based on age, health status, and other factors determined during the underwriting process.
                    </p>
                    <p style="color: #94a3b8; font-size: 10px; line-height: 1.5; margin: 0 0 10px 0; text-align: center;">
                      Please review all policy documents carefully before making a decision.
                    </p>
                    <p style="color: #b0b8c4; font-size: 10px; line-height: 1.5; margin: 0; text-align: center;">
                      Heritage Life Solutions &middot; 1007 N. Orange St., Suite 1432 &middot; Wilmington, DE 19801<br/>
                      Don't want to receive these emails? <a href="mailto:${process.env.GMAIL_FROM_EMAIL || 'contact@heritagels.org'}?subject=Unsubscribe" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const plainTextBody = `
Hi ${recipientFirst},

${bodyMessage}

Visit my website: ${data.websiteUrl}

On my website, you can:
1. Browse plans from top-rated carriers
2. Compare coverage options for your family
3. Learn about the process - no pressure at all
4. Reach out to me directly with any questions

Looking forward to connecting,
${agentFirst}

---

${data.agent.name}
Licensed Insurance Agent
Heritage Life Solutions
${data.agent.email}
${data.agent.phone || ''}

---
This email was sent by ${data.agent.name} via Heritage Life Solutions.
(c) 2024-2026 Gold Coast Financial Partners. All rights reserved.

Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states. All products are issued by the respective carrier. Heritage Life Solutions does not guarantee any specific policy outcomes. Quotes are for informational purposes only and do not constitute a binding contract or guarantee of coverage. Final rates, terms, and coverage are subject to underwriting approval. Premiums may vary based on age, health status, and other factors determined during the underwriting process. Please review all policy documents carefully before making a decision.

To stop receiving emails, reply with "Unsubscribe" in the subject line.
Heritage Life Solutions | 1007 N. Orange St., Suite 1432 | Wilmington, DE 19801
`.trim();

  const boundary = `boundary_${Date.now()}`;
  const messageId = `<website-${Date.now()}-${Math.random().toString(36).slice(2)}@heritagels.org>`;
  const rawMessage = [
    'MIME-Version: 1.0',
    `Message-ID: ${messageId}`,
    `From: ${data.agent.name} via Heritage Life Solutions <${process.env.GMAIL_FROM_EMAIL || 'contact@heritagels.org'}>`,
    `To: ${data.recipientName} <${data.recipientEmail}>`,
    `Reply-To: ${data.agent.name} <${data.agent.email}>`,
    `Subject: ${subject}`,
    'X-Mailer: Heritage Life Solutions',
    `List-Unsubscribe: <mailto:${process.env.GMAIL_FROM_EMAIL || 'contact@heritagels.org'}?subject=Unsubscribe>`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    plainTextBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`,
  ].join('\n');

  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });

  console.log(`[WebsiteLink] Email sent to ${data.recipientEmail} from agent ${data.agent.name}`);
  return result;
}

// ─── PRODUCT GUIDE EMAIL ──────────────────────────────────────────────────────

export async function sendProductGuideEmail(data: {
  recipientName: string;
  recipientEmail: string;
  guideUrl: string;
  guideTitle: string;
  guideDescription: string;
  personalMessage?: string;
  agent: {
    name: string;
    email: string;
    phone: string;
    npn?: string;
  };
}) {
  const gmail = await getGmailClient();

  const recipientFirst = data.recipientName.split(' ')[0];
  const agentFirst = data.agent.name.split(' ')[0];
  const agentInitials = data.agent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const primaryColor = '#7c3aed';
  const gradientTo = '#D4AF37';
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b';

  const subject = `${agentFirst} prepared a ${data.guideTitle} guide for you`;

  const defaultMessage = `I put together a comprehensive guide on ${data.guideTitle} that I think would be really helpful for you. It covers key benefits, common questions, and the top carriers we work with — all in one easy-to-read page. Take a look when you get a chance, and feel free to reach out if you have any questions.`;
  const bodyMessage = data.personalMessage || defaultMessage;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${primaryColor} 0%, ${gradientTo} 100%); padding: 32px 40px; text-align: center;">
              <img src="${logoUrl}" alt="Heritage Life Solutions" style="width: 64px; height: 64px; border-radius: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
            </td>
          </tr>

          <!-- Product Title Banner -->
          <tr>
            <td style="padding: 24px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; border-left: 4px solid ${primaryColor};">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="color: #1f2937; font-size: 18px; font-weight: 700; margin: 0 0 4px 0;">${data.guideTitle}</p>
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">${data.guideDescription}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 24px 40px 32px;">
              <p style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">Hi ${recipientFirst},</p>
              <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">${bodyMessage}</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #f3f4f6; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">In this guide, you&rsquo;ll learn about:</p>
                    <p style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0;">
                      &#x2705; Key benefits and what makes this coverage valuable<br/>
                      &#x2705; Who this product is designed for<br/>
                      &#x2705; Answers to the most common questions<br/>
                      &#x2705; Top-rated carriers we recommend
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${data.guideUrl}" style="display: inline-block; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 12px; font-size: 15px; font-weight: 600;">
                      &#x1F4D6; Read the Full Guide
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                Looking forward to connecting,<br/>
                ${agentFirst}
              </p>
            </td>
          </tr>

          <!-- Agent Signature -->
          <tr>
            <td style="padding: 0 40px 40px 40px; border-top: 1px solid #e5e7eb;">
              <table cellpadding="0" cellspacing="0" style="padding-top: 30px;">
                <tr>
                  <td style="padding-right: 16px; vertical-align: top;">
                    <!-- Agent Avatar -->
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 56px; height: 56px; background: linear-gradient(135deg, ${primaryColor} 0%, #D4AF37 100%); border-radius: 14px; text-align: center; vertical-align: middle;">
                          <span style="color: #ffffff; font-size: 22px; font-weight: 700;">${agentInitials}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td>
                    <p style="color: #111827; font-size: 17px; font-weight: 700; margin: 0 0 4px 0;">${data.agent.name}</p>
                    <p style="color: ${primaryColor}; font-size: 13px; font-weight: 600; margin: 0 0 8px 0;">Licensed Insurance Agent${data.agent.npn ? ` &middot; NPN: ${data.agent.npn}` : ''}</p>
                    <p style="color: #6b7280; font-size: 13px; margin: 0;">&#x1F4E7; <a href="mailto:${data.agent.email}" style="color: #6b7280; text-decoration: none;">${data.agent.email}</a></p>
                    ${data.agent.phone ? `<p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">&#x1F4F1; <a href="tel:${data.agent.phone.replace(/[^0-9+]/g, '')}" style="color: ${primaryColor}; text-decoration: none; font-weight: 600;">${data.agent.phone}</a></p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="color: ${primaryColor}; font-size: 16px; font-weight: 700; margin: 0 0 4px 0;">Heritage Life Solutions</p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                      Protecting families with personalized insurance solutions
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Legal Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #64748b; font-size: 11px; line-height: 1.7; margin: 0; text-align: center;">
                &copy; 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states. IL License #22128144. Policies are issued by our carrier partners and product availability may vary by state.
              </p>
              <p style="color: #94a3b8; font-size: 10px; line-height: 1.5; margin: 12px 0 0 0; text-align: center;">
                All products are issued by the respective carrier. Heritage Life Solutions does not guarantee any specific policy outcomes. This guide is for informational purposes only and does not constitute a binding contract or guarantee of coverage. Final rates, terms, and coverage are subject to underwriting approval. Please review all policy documents carefully before making a decision.
              </p>
              <p style="color: #b0b8c4; font-size: 10px; line-height: 1.5; margin: 12px 0 0 0; text-align: center;">
                Heritage Life Solutions &middot; 1007 N. Orange St., Suite 1432 &middot; Wilmington, DE 19801<br/>
                Don't want to receive these emails? <a href="mailto:${process.env.GMAIL_FROM_EMAIL || 'contact@heritagels.org'}?subject=Unsubscribe" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const plainTextBody = `
Hi ${recipientFirst},

${bodyMessage}

Read the full guide: ${data.guideUrl}

In this guide, you'll learn about:
- Key benefits and what makes this coverage valuable
- Who this product is designed for
- Answers to the most common questions
- Top-rated carriers we recommend

Looking forward to connecting,
${agentFirst}

---

${data.agent.name}
Licensed Insurance Agent
Heritage Life Solutions${data.agent.npn ? ` | NPN: ${data.agent.npn}` : ''}
${data.agent.email}
${data.agent.phone || ''}

---
This email was sent by ${data.agent.name} via Heritage Life Solutions.
(c) 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states. IL License #22128144. Policies are issued by our carrier partners and product availability may vary by state.

This guide is for informational purposes only and does not constitute a binding contract or guarantee of coverage. Final rates, terms, and coverage are subject to underwriting approval. Please review all policy documents carefully before making a decision.

To stop receiving emails, reply with "Unsubscribe" in the subject line.
Heritage Life Solutions | 1007 N. Orange St., Suite 1432 | Wilmington, DE 19801
`.trim();

  const boundary = `boundary_${Date.now()}`;
  const messageId = `<guide-${Date.now()}-${Math.random().toString(36).slice(2)}@heritagels.org>`;
  const rawMessage = [
    'MIME-Version: 1.0',
    `Message-ID: ${messageId}`,
    `From: ${data.agent.name} via Heritage Life Solutions <${process.env.GMAIL_FROM_EMAIL || 'contact@heritagels.org'}>`,
    `To: ${data.recipientName} <${data.recipientEmail}>`,
    `Reply-To: ${data.agent.name} <${data.agent.email}>`,
    `Subject: ${subject}`,
    'X-Mailer: Heritage Life Solutions',
    `List-Unsubscribe: <mailto:${process.env.GMAIL_FROM_EMAIL || 'contact@heritagels.org'}?subject=Unsubscribe>`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    plainTextBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`,
  ].join('\n');

  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });

  console.log(`[ProductGuide] Email sent to ${data.recipientEmail} — guide: ${data.guideTitle} — from agent ${data.agent.name}`);
  return result;
}

// ─── ONBOARDING EMAIL ─────────────────────────────────────────────────────────

export async function sendOnboardingEmail(data: {
  agentName: string;
  agentEmail: string;
  onboardingUrl: string;
  onboardingType: 'licensed' | 'new_agent';
  approvedBy: string;
}): Promise<any> {
  const gmail = await getGmailClient();
  const firstName = data.agentName.split(' ')[0];

  const primaryColor = '#7c3aed';
  const secondaryColor = '#9333ea';
  const accentColor = '#f59e0b';
  const gradient = 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #f59e0b 100%)';
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b';

  const isLicensed = data.onboardingType === 'licensed';

  const checklist = isLicensed
    ? [
        'Social Security Number & emergency contact info',
        'Direct deposit details (bank name, routing & account numbers)',
        'E&O insurance certificate',
        'AML training certificate',
        'Driver\'s license (front photo)',
        'Sign 3 documents: NDA, Debt Roll-up, Compliance Sheet',
      ]
    : [
        'Educational background & work experience',
        'Study preferences & target exam date',
        'Choose your mentor from our team',
        'Set up your training schedule',
        'Driver\'s license (front photo)',
        'Sign 3 documents: NDA, Debt Roll-up, Compliance Sheet',
      ];

  const subject = isLicensed
    ? "Welcome to Heritage Life Solutions - Complete Your Agent Onboarding"
    : "Welcome to Heritage Life Solutions - Start Your Pre-Licensing Journey";

  const checklistHtml = checklist.map((item, i) => `
    <tr>
      <td style="padding: 8px 0; vertical-align: top; width: 28px;">
        <span style="display: inline-block; width: 24px; height: 24px; background-color: ${i < 3 ? primaryColor : accentColor}; color: #ffffff; border-radius: 50%; text-align: center; line-height: 24px; font-size: 13px; font-weight: 700;">${i + 1}</span>
      </td>
      <td style="padding: 8px 0 8px 8px; color: #374151; font-size: 14px; line-height: 1.5;">
        ${item}
      </td>
    </tr>
  `).join('');

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: ${gradient}; padding: 32px 40px; text-align: center;">
              <img src="${logoUrl}" alt="Heritage Life Solutions" style="width: 80px; height: 80px; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);" />
              <h1 style="color: #ffffff; margin: 16px 0 8px 0; font-size: 28px; font-weight: 700;">You're Approved!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 15px; font-weight: 500;">Complete your onboarding to get started</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Dear <strong style="color: ${primaryColor};">${firstName}</strong>,
              </p>
              <p style="color: #6b7280; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                ${isLicensed
                  ? `Congratulations! Your application to join Heritage Life Solutions has been <strong style="color: ${primaryColor};">approved</strong>. As a licensed agent, we just need a few details to get you contracted and ready to sell. Complete your onboarding profile below to set up your direct deposit, verify your credentials, and sign your contracting documents.`
                  : `Congratulations! Your application to join Heritage Life Solutions has been <strong style="color: ${primaryColor};">approved</strong>. We're excited to help you launch your career in life insurance. Complete your onboarding profile below to set up your pre-licensing education, choose a mentor, and get your training schedule started.`
                }
              </p>

              <!-- What You'll Need -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ff; border-left: 4px solid ${primaryColor}; border-radius: 0 12px 12px 0; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: #374151; font-size: 16px; font-weight: 700; margin: 0 0 16px 0;">${isLicensed ? 'What You\'ll Need:' : 'What to Prepare:'}</p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      ${checklistHtml}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.onboardingUrl}" style="display: inline-block; background: ${gradient}; color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-size: 17px; font-weight: 700; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
                      ${isLicensed ? 'Complete Your Onboarding' : 'Start Your Journey'} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry Note -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td align="center">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">This link expires in 7 days. If it expires, contact your administrator for a new link.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Approved By -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px;">
                <tr>
                  <td style="padding: 16px 20px; text-align: center;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">Approved by</p>
                    <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 4px 0 0 0;">${data.approvedBy}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <img src="${logoUrl}" alt="Heritage Life Solutions" style="width: 32px; height: 32px; border-radius: 8px;" />
              <p style="color: ${primaryColor}; font-size: 16px; font-weight: 700; margin: 10px 0 4px 0;">Heritage Life Solutions</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">Protecting families with personalized insurance solutions</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
                <a href="mailto:contact@heritagels.org" style="color: ${primaryColor}; text-decoration: none;">contact@heritagels.org</a>
              </p>
            </td>
          </tr>

          <!-- Legal Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="color: #64748b; font-size: 11px; line-height: 1.6; margin: 0 0 10px 0; text-align: center;">
                      &copy; 2024-2026 Gold Coast Financial Partners. All rights reserved.
                    </p>
                    <p style="color: #94a3b8; font-size: 10px; line-height: 1.5; margin: 0 0 10px 0; text-align: center;">
                      Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states. IL License #22128144.
                    </p>
                    <p style="color: #94a3b8; font-size: 10px; line-height: 1.5; margin: 0 0 10px 0; text-align: center;">
                      All products are issued by the respective carrier. Heritage Life Solutions does not guarantee any specific policy outcomes. This email is confidential and intended only for the named recipient.
                    </p>
                    <p style="color: #94a3b8; font-size: 10px; line-height: 1.5; margin: 0; text-align: center;">
                      Please review all documents carefully before signing.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const textBody = `
HERITAGE LIFE SOLUTIONS
You're Approved!

Dear ${firstName},

${isLicensed
  ? 'Congratulations! Your application to join Heritage Life Solutions has been approved. As a licensed agent, we just need a few details to get you contracted and ready to sell. Complete your onboarding profile to set up your direct deposit, verify your credentials, and sign your contracting documents.'
  : 'Congratulations! Your application to join Heritage Life Solutions has been approved. We\'re excited to help you launch your career in life insurance. Complete your onboarding profile to set up your pre-licensing education, choose a mentor, and get your training schedule started.'}

What You'll Need:
${checklist.map((item, i) => `${i + 1}. ${item}`).join('\n')}

${isLicensed ? 'COMPLETE YOUR ONBOARDING' : 'START YOUR JOURNEY'}:
${data.onboardingUrl}

This link expires in 7 days.

Approved by: ${data.approvedBy}

--------------------------------------------
Heritage Life Solutions
Protecting families with personalized insurance solutions
contact@heritagels.org

(c) 2024-2026 Gold Coast Financial Partners. All rights reserved.
Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states. IL License #22128144.
All products are issued by the respective carrier. Heritage Life Solutions does not guarantee any specific policy outcomes.
  `.trim();

  const boundary = `boundary_${Date.now()}`;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || 'noreply@heritagels.org';
  const messageParts = [
    'MIME-Version: 1.0',
    `From: Heritage Life Solutions <${fromEmail}>`,
    `To: ${data.agentEmail}`,
    `Subject: ${subject}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    textBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`,
  ].join('\n');

  const encodedMessage = Buffer.from(messageParts)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });

  console.log(`[Onboarding] Email sent to ${data.agentEmail} (${data.onboardingType})`);
  return result;
}

// ─── ONBOARDING COMPLETION EMAIL ──────────────────────────────────────────────

export async function sendOnboardingCompletionEmail(data: {
  agentName: string;
  agentEmail: string;
  onboardingType: 'licensed' | 'new_agent';
  loungeUrl: string;
}): Promise<any> {
  const gmail = await getGmailClient();
  const firstName = data.agentName.split(' ')[0];

  const primaryColor = '#7c3aed';
  const secondaryColor = '#9333ea';
  const accentColor = '#f59e0b';
  const gradient = 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #f59e0b 100%)';
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b';

  const isLicensed = data.onboardingType === 'licensed';

  const subject = isLicensed
    ? "You're All Set - Welcome to the Heritage Life Solutions Team!"
    : "You're All Set - Your Pre-Licensing Journey Begins Now!";

  const nextSteps = isLicensed
    ? [
        { icon: '🎯', title: 'Access Your Lounge', desc: 'Your personalized command center is ready - manage leads, track commissions, and access training resources.' },
        { icon: '🚀', title: 'Explore Your Tools', desc: 'Check out your CRM, client outreach features, and growth dashboard to hit the ground running.' },
        { icon: '📞', title: 'Connect With Your Team', desc: 'Reach out to your upline manager or use the team chat to get started on your first cases.' },
      ]
    : [
        { icon: '📚', title: 'Start Your Training', desc: 'Your pre-licensing study materials and schedule are ready in your lounge.' },
        { icon: '👤', title: 'Meet Your Mentor', desc: 'Your assigned mentor will be reaching out to help guide you through the licensing process.' },
        { icon: '🎯', title: 'Set Your Goals', desc: 'Track your progress toward your exam date and stay on top of your study schedule.' },
      ];

  const stepsHtml = nextSteps.map((step, i) => `
    <tr>
      <td style="padding: 16px 20px; ${i < nextSteps.length - 1 ? 'border-bottom: 1px solid #f3f4f6;' : ''}">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="width: 48px; vertical-align: top;">
              <div style="width: 40px; height: 40px; background: ${i === 0 ? gradient : `${i === 1 ? secondaryColor : accentColor}`}; border-radius: 12px; text-align: center; line-height: 40px; font-size: 20px;">
                ${step.icon}
              </div>
            </td>
            <td style="padding-left: 12px; vertical-align: top;">
              <p style="color: #1f2937; font-size: 15px; font-weight: 700; margin: 0 0 4px 0;">${step.title}</p>
              <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">${step.desc}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: ${gradient}; padding: 32px 40px; text-align: center;">
              <img src="${logoUrl}" alt="Heritage Life Solutions" style="width: 80px; height: 80px; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);" />
              <h1 style="color: #ffffff; margin: 16px 0 8px 0; font-size: 28px; font-weight: 700;">Onboarding Complete!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 15px; font-weight: 500;">Your account is fully set up and ready to go</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Dear <strong style="color: ${primaryColor};">${firstName}</strong>,
              </p>
              <p style="color: #6b7280; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                ${isLicensed
                  ? `Congratulations on completing your onboarding with Heritage Life Solutions! All of your documents have been signed, your credentials verified, and your direct deposit is set up. You now have <strong style="color: ${primaryColor};">full access</strong> to your Agent Lounge.`
                  : `Congratulations on completing your onboarding with Heritage Life Solutions! Your profile is set up, your documents are signed, and your mentor has been assigned. You now have <strong style="color: ${primaryColor};">full access</strong> to your Agent Lounge to begin your pre-licensing journey.`
                }
              </p>

              <!-- Success Badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 2px solid #22c55e; border-radius: 16px;">
                      <tr>
                        <td style="padding: 16px 32px; text-align: center;">
                          <p style="color: #16a34a; font-size: 24px; margin: 0 0 4px 0;">&#10003;</p>
                          <p style="color: #15803d; font-size: 14px; font-weight: 700; margin: 0;">All Documents Signed &amp; Verified</p>
                          <p style="color: #22c55e; font-size: 12px; margin: 4px 0 0 0;">NDA &bull; Debt Roll-Up &bull; Compliance Agreement</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ff; border-left: 4px solid ${primaryColor}; border-radius: 0 12px 12px 0; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px 24px 8px 24px;">
                    <p style="color: #374151; font-size: 16px; font-weight: 700; margin: 0 0 8px 0;">What's Next:</p>
                  </td>
                </tr>
                ${stepsHtml}
              </table>

              <!-- Login Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">Your Login Credentials</p>
                    <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0;">
                      Log in using <strong style="color: ${primaryColor};">${data.agentEmail}</strong> and the password you created when you registered.
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
                      Can't remember? Click <a href="${data.loungeUrl}" style="color: #9ca3af; text-decoration: underline;">Log In</a> and tap "Forgot Password" to reset it.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.loungeUrl}" style="display: inline-block; background: ${gradient}; color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-size: 17px; font-weight: 700; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
                      Log In to Your Lounge &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Support Note -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td align="center">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">Questions? Reach out to your manager or email us at <a href="mailto:contact@heritagels.org" style="color: ${primaryColor}; text-decoration: none;">contact@heritagels.org</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <img src="${logoUrl}" alt="Heritage Life Solutions" style="width: 32px; height: 32px; border-radius: 8px;" />
              <p style="color: ${primaryColor}; font-size: 16px; font-weight: 700; margin: 10px 0 4px 0;">Heritage Life Solutions</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">Protecting families with personalized insurance solutions</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
                <a href="mailto:contact@heritagels.org" style="color: ${primaryColor}; text-decoration: none;">contact@heritagels.org</a>
              </p>
            </td>
          </tr>

          <!-- Legal Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="color: #64748b; font-size: 11px; line-height: 1.6; margin: 0 0 10px 0; text-align: center;">
                      &copy; 2024-2026 Gold Coast Financial Partners. All rights reserved.
                    </p>
                    <p style="color: #94a3b8; font-size: 10px; line-height: 1.5; margin: 0 0 10px 0; text-align: center;">
                      Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states. IL License #22128144.
                    </p>
                    <p style="color: #94a3b8; font-size: 10px; line-height: 1.5; margin: 0 0 10px 0; text-align: center;">
                      All products are issued by the respective carrier. Heritage Life Solutions does not guarantee any specific policy outcomes. This email is confidential and intended only for the named recipient.
                    </p>
                    <p style="color: #94a3b8; font-size: 10px; line-height: 1.5; margin: 0; text-align: center;">
                      Your signed documents are securely stored with AES-256 encryption and SHA-256 integrity verification.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const textBody = `
HERITAGE LIFE SOLUTIONS
Onboarding Complete!

Dear ${firstName},

${isLicensed
  ? 'Congratulations on completing your onboarding with Heritage Life Solutions! All of your documents have been signed, your credentials verified, and your direct deposit is set up. You now have full access to your Agent Lounge.'
  : 'Congratulations on completing your onboarding with Heritage Life Solutions! Your profile is set up, your documents are signed, and your mentor has been assigned. You now have full access to your Agent Lounge to begin your pre-licensing journey.'}

All Documents Signed & Verified: NDA, Debt Roll-Up, Compliance Agreement

What's Next:
${nextSteps.map((s, i) => `${i + 1}. ${s.title} - ${s.desc}`).join('\n')}

YOUR LOGIN: ${data.agentEmail} (use the password you created during registration)
Can't remember? Go to ${data.loungeUrl} and tap "Forgot Password" to reset it.

LOG IN TO YOUR LOUNGE:
${data.loungeUrl}

Questions? Reach out to your manager or email us at contact@heritagels.org

--------------------------------------------
Heritage Life Solutions
Protecting families with personalized insurance solutions
contact@heritagels.org

(c) 2024-2026 Gold Coast Financial Partners. All rights reserved.
Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states. IL License #22128144.
All products are issued by the respective carrier. Heritage Life Solutions does not guarantee any specific policy outcomes.
Your signed documents are securely stored with AES-256 encryption and SHA-256 integrity verification.
  `.trim();

  const boundary = `boundary_${Date.now()}`;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || 'noreply@heritagels.org';
  const messageParts = [
    'MIME-Version: 1.0',
    `From: Heritage Life Solutions <${fromEmail}>`,
    `To: ${data.agentEmail}`,
    `Subject: ${subject}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    textBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`,
  ].join('\n');

  const encodedMessage = Buffer.from(messageParts)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });

  console.log(`[Onboarding] Completion email sent to ${data.agentEmail} (${data.onboardingType})`);
  return result;
}

// ─── PASSWORD RESET EMAIL ─────────────────────────────────────────────────────

export async function sendPasswordResetEmail(data: {
  recipientEmail: string;
  resetLink: string;
}): Promise<any> {
  const gmail = await getGmailClient();

  const primaryColor = '#7c3aed';
  const gradient = 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #f59e0b 100%)';
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b';

  const subject = 'Reset Your Password - Heritage Life Solutions';

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: ${gradient}; padding: 32px 40px; text-align: center;">
              <img src="${logoUrl}" alt="Heritage Life Solutions" style="width: 64px; height: 64px; border-radius: 14px; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);" />
              <h1 style="color: #ffffff; margin: 12px 0 4px 0; font-size: 24px; font-weight: 700;">Password Reset</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">Heritage Life Solutions</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
                We received a request to reset the password for your Heritage Life Solutions account. Click the button below to set a new password.
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.resetLink}" style="display: inline-block; background: ${gradient}; color: #ffffff; text-decoration: none; padding: 16px 44px; border-radius: 12px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="color: #92400e; font-size: 13px; margin: 0; font-weight: 600;">This link expires in 1 hour.</p>
                    <p style="color: #a16207; font-size: 12px; margin: 4px 0 0 0;">If it expires, you can request a new one from the login page.</p>
                  </td>
                </tr>
              </table>

              <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0;">
                If you didn't request this, you can safely ignore this email. Your password will not be changed.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <img src="${logoUrl}" alt="Heritage Life Solutions" style="width: 32px; height: 32px; border-radius: 8px;" />
              <p style="color: ${primaryColor}; font-size: 16px; font-weight: 700; margin: 10px 0 4px 0;">Heritage Life Solutions</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                <a href="mailto:contact@heritagels.org" style="color: ${primaryColor}; text-decoration: none;">contact@heritagels.org</a>
              </p>
            </td>
          </tr>

          <!-- Legal Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #94a3b8; font-size: 10px; line-height: 1.5; margin: 0; text-align: center;">
                &copy; 2024-2026 Gold Coast Financial Partners. All rights reserved. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. IL License #22128144.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const textBody = `
HERITAGE LIFE SOLUTIONS
Password Reset

We received a request to reset the password for your Heritage Life Solutions account.

RESET YOUR PASSWORD:
${data.resetLink}

This link expires in 1 hour. If it expires, you can request a new one from the login page.

If you didn't request this, you can safely ignore this email. Your password will not be changed.

--------------------------------------------
Heritage Life Solutions
contact@heritagels.org
(c) 2024-2026 Gold Coast Financial Partners. All rights reserved. IL License #22128144.
  `.trim();

  const boundary = `boundary_${Date.now()}`;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || 'noreply@heritagels.org';
  const messageParts = [
    'MIME-Version: 1.0',
    `From: Heritage Life Solutions <${fromEmail}>`,
    `To: ${data.recipientEmail}`,
    `Subject: ${subject}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    textBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`,
  ].join('\n');

  const encodedMessage = Buffer.from(messageParts)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });

  console.log(`[PasswordReset] Reset email sent to ${data.recipientEmail}`);
  return result;
}

/**
 * Send a branded policy reminder email to a client.
 */
export async function sendPolicyReminderEmail(data: {
  clientFirstName: string;
  clientEmail: string;
  policyType?: string;
  agentName: string;
  agentEmail: string;
  agentPhone?: string;
  message?: string;
}) {
  const gmail = await getGmailClient();

  const primaryColor = '#7c3aed';
  const goldColor = '#D4AF37';
  const gradientFrom = '#7c3aed';
  const gradientTo = '#D4AF37';
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b';
  const agentInitials = data.agentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const portalUrl = process.env.APP_URL || 'https://heritagels.org';
  const policyLabel = data.policyType || 'life insurance';

  const subject = `Friendly Reminder - Your Heritage Life Solutions Policy`;

  const customMessage = data.message || `We want to make sure you're getting the most out of your ${policyLabel} coverage and that everything is up to date. If you have any questions about your policy, need to update your beneficiaries, or would like to review your coverage, please don't hesitate to reach out.`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%); padding: 32px 40px; text-align: center;">
              <img src="${logoUrl}" alt="Heritage Life Solutions" style="width: 80px; height: 80px; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);" />
              <h1 style="color: #ffffff; margin: 16px 0 8px 0; font-size: 24px; font-weight: 700;">Policy Reminder</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px; font-weight: 500;">A friendly check-in from your Heritage team</p>
            </td>
          </tr>

          <!-- Greeting Banner -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f5f3ff; border-bottom: 1px solid #e9d5ff;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <span style="font-size: 32px;">&#128075;</span>
                    <p style="color: #5b21b6; font-size: 15px; margin: 8px 0 0 0; font-weight: 600;">Just checking in to make sure everything is going great!</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Message Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ff; border-left: 4px solid ${primaryColor}; border-radius: 0 12px 12px 0; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                      Hi <strong style="color: ${primaryColor};">${data.clientFirstName}</strong>,
                    </p>
                    <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 12px 0 0 0;">
                      ${customMessage}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Reminders Section -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin: 30px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 16px 0;">A few things to keep in mind:</p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 10px 0; vertical-align: top; width: 40px;">
                          <table cellpadding="0" cellspacing="0"><tr><td style="width: 28px; height: 28px; background-color: ${primaryColor}; border-radius: 50%; text-align: center; vertical-align: middle;"><span style="color: #ffffff; font-size: 13px; font-weight: 700;">1</span></td></tr></table>
                        </td>
                        <td style="padding: 10px 0; color: #374151; font-size: 14px; line-height: 1.5;">
                          <strong>Premium Payments</strong><br><span style="color: #6b7280;">Keep your payments up to date to maintain active coverage</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; vertical-align: top; width: 40px;">
                          <table cellpadding="0" cellspacing="0"><tr><td style="width: 28px; height: 28px; background-color: ${primaryColor}; border-radius: 50%; text-align: center; vertical-align: middle;"><span style="color: #ffffff; font-size: 13px; font-weight: 700;">2</span></td></tr></table>
                        </td>
                        <td style="padding: 10px 0; color: #374151; font-size: 14px; line-height: 1.5;">
                          <strong>Beneficiary Updates</strong><br><span style="color: #6b7280;">Life changes? Make sure your beneficiaries reflect your current wishes</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; vertical-align: top; width: 40px;">
                          <table cellpadding="0" cellspacing="0"><tr><td style="width: 28px; height: 28px; background-color: ${primaryColor}; border-radius: 50%; text-align: center; vertical-align: middle;"><span style="color: #ffffff; font-size: 13px; font-weight: 700;">3</span></td></tr></table>
                        </td>
                        <td style="padding: 10px 0; color: #374151; font-size: 14px; line-height: 1.5;">
                          <strong>Coverage Review</strong><br><span style="color: #6b7280;">As your life evolves, your coverage needs may too</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}/client" style="display: inline-block; background: linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%); color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-size: 17px; font-weight: 700; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
                      &#128274; View Your Client Portal
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 0;">
                Or copy this link: <a href="${portalUrl}/client" style="color: ${primaryColor};">${portalUrl}/client</a>
              </p>
            </td>
          </tr>

          <!-- Agent Signature -->
          <tr>
            <td style="padding: 0 40px 40px 40px; border-top: 1px solid #e5e7eb;">
              <table cellpadding="0" cellspacing="0" style="padding-top: 30px;">
                <tr>
                  <td style="padding-right: 16px; vertical-align: top;">
                    <table cellpadding="0" cellspacing="0"><tr>
                      <td style="width: 56px; height: 56px; background: linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%); border-radius: 14px; text-align: center; vertical-align: middle;">
                        <span style="color: #ffffff; font-size: 22px; font-weight: 700;">${agentInitials}</span>
                      </td>
                    </tr></table>
                  </td>
                  <td>
                    <p style="color: #111827; font-size: 17px; font-weight: 700; margin: 0 0 4px 0;">${data.agentName}</p>
                    <p style="color: ${primaryColor}; font-size: 13px; font-weight: 600; margin: 0 0 8px 0;">Licensed Insurance Agent</p>
                    <p style="color: #6b7280; font-size: 13px; margin: 0;">&#128231; <a href="mailto:${data.agentEmail}" style="color: #6b7280; text-decoration: none;">${data.agentEmail}</a></p>
                    ${data.agentPhone ? `<p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">&#128241; <a href="tel:${data.agentPhone.replace(/[^0-9+]/g, '')}" style="color: ${primaryColor}; text-decoration: none; font-weight: 600;">${data.agentPhone}</a></p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: ${primaryColor}; font-size: 16px; font-weight: 700; margin: 0 0 4px 0;">Heritage Life Solutions</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">Protecting families with personalized insurance solutions</p>
            </td>
          </tr>

          <!-- Legal Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #64748b; font-size: 11px; line-height: 1.6; margin: 0 0 12px 0; text-align: center;">
                &copy; 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states. IL License #22128144. Policies are issued by our carrier partners and product availability may vary by state.
              </p>
              <p style="color: #94a3b8; font-size: 10px; line-height: 1.5; margin: 0 0 10px 0; text-align: center;">
                This is a courtesy reminder from your insurance agent. If you believe you received this email in error, please contact us directly.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const plainTextBody = `HERITAGE LIFE SOLUTIONS
Policy Reminder

Hi ${data.clientFirstName},

${customMessage}

A few things to keep in mind:

1. Premium Payments - Keep your payments up to date to maintain active coverage.
2. Beneficiary Updates - Life changes? Make sure your beneficiaries reflect your current wishes.
3. Coverage Review - As your life evolves, your coverage needs may too.

View Your Client Portal: ${portalUrl}/client

Best regards,
${data.agentName}
Licensed Insurance Agent
Heritage Life Solutions
${data.agentEmail}${data.agentPhone ? '\n' + data.agentPhone : ''}

---
(c) 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners.
IL License #22128144. Policies are issued by our carrier partners.
  `.trim();

  const boundary = `boundary_${Date.now()}`;
  const message = [
    'MIME-Version: 1.0',
    `From: Heritage Life Solutions <${process.env.GMAIL_FROM_EMAIL || 'contact@heritagels.org'}>`,
    `To: ${data.clientEmail}`,
    `Reply-To: ${data.agentEmail}`,
    `Subject: ${subject}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    plainTextBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`
  ].join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });

  console.log(`[Reminder] Policy reminder sent to ${data.clientEmail}`);
  return result;
}

// =============================================================================
// EMAIL WITH PDF ATTACHMENTS — multipart/mixed with PDF file(s)
// =============================================================================

/**
 * Send a Heritage-branded email with one or more PDF attachments.
 * Used by the document delivery service for welcome kits, statements, etc.
 */
export async function sendEmailWithAttachments(data: {
  to: string;
  replyTo?: string;
  subject: string;
  htmlBody: string;
  plainTextBody: string;
  attachments: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}): Promise<any> {
  const gmail = await getGmailClient();
  if (!gmail) {
    console.warn("[Gmail] Not configured - skipping attachment email");
    return null;
  }

  const from = process.env.GMAIL_FROM_EMAIL || "contact@heritagels.org";
  const outerBoundary = `outer_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const innerBoundary = `inner_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  // Build multipart/mixed message
  const parts: string[] = [
    "MIME-Version: 1.0",
    `From: Heritage Life Solutions <${from}>`,
    `To: ${data.to}`,
    ...(data.replyTo ? [`Reply-To: ${data.replyTo}`] : []),
    `Subject: ${data.subject}`,
    `Content-Type: multipart/mixed; boundary="${outerBoundary}"`,
    "",
    `--${outerBoundary}`,
    `Content-Type: multipart/alternative; boundary="${innerBoundary}"`,
    "",
    // Plain text part
    `--${innerBoundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    data.plainTextBody,
    "",
    // HTML part
    `--${innerBoundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    data.htmlBody,
    "",
    `--${innerBoundary}--`,
  ];

  // Add each PDF attachment
  for (const attachment of data.attachments) {
    parts.push(
      "",
      `--${outerBoundary}`,
      `Content-Type: ${attachment.contentType}; name="${attachment.filename}"`,
      "Content-Transfer-Encoding: base64",
      `Content-Disposition: attachment; filename="${attachment.filename}"`,
      "",
      attachment.content.toString("base64"),
    );
  }

  parts.push("", `--${outerBoundary}--`);

  const rawMessage = parts.join("\n");
  const encodedMessage = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const result = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodedMessage },
  });

  console.log(`[Gmail] Email with ${data.attachments.length} attachment(s) sent to ${data.to}`);
  return result;
}

// =============================================================================
// 2FA VERIFICATION CODE EMAIL — Heritage Life Solutions branded
// =============================================================================
//
// Sends a 6-digit code for email-as-second-factor enrollment + verification.
// Heritage palette: deep violet + amber to match the rest of the app
// (LobbyLanding, LifeOSVersionBadge, the 2FA screens). Colors are sourced
// from `client/src/lib/heritageDesignSystem.ts` so a recipient sees the
// same visual identity in the email as on the Heritage surface.
function escapeHtmlBasic(input: string): string {
  return String(input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendVerificationCodeEmail(data: {
  firstName: string;
  email: string;
  code: string;
  ttlMinutes: number;
}): Promise<void> {
  const firstName = escapeHtmlBasic(data.firstName || "");
  const code = escapeHtmlBasic(data.code);
  const ttl = Math.max(1, Math.floor(data.ttlMinutes || 5));

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8" /><title>Heritage Life Solutions verification code</title></head>
<body style="margin:0;padding:0;background:#1A0B2E;font-family:'Inter','-apple-system','BlinkMacSystemFont','Segoe UI',sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1A0B2E;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#2D1B4E;border-radius:16px;overflow:hidden;border:1px solid rgba(245,158,11,0.20);">

<tr><td style="padding:32px 32px 16px;text-align:center;background:linear-gradient(135deg,#7c3aed 0%,#9333ea 50%,#3D2B5E 100%);border-bottom:1px solid rgba(245,158,11,0.20);">
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">
<tr><td style="background:linear-gradient(135deg,#7c3aed,#f59e0b);border-radius:8px;padding:10px;line-height:0;">
<span style="display:inline-block;width:24px;height:24px;color:#ffffff;font-weight:700;font-size:20px;line-height:24px;font-family:'Playfair Display',Georgia,serif;">H</span>
</td><td style="padding-left:14px;font-family:'Playfair Display',Georgia,serif;font-size:20px;font-weight:600;color:#F5F3FF;letter-spacing:0.06em;">
HERITAGE LIFE SOLUTIONS
</td></tr></table>
<div style="width:64px;height:2px;margin:8px auto 20px;background:linear-gradient(90deg,#7c3aed,#f59e0b);"></div>
<h1 style="margin:0 0 8px;font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:600;color:#F5F3FF;line-height:1.15;">Verify your identity</h1>
<p style="margin:0;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-size:15px;color:rgba(245,243,255,0.75);line-height:1.55;">Confirm this code to finish signing in.</p>
</td></tr>

<tr><td style="padding:28px 32px;">
<p style="margin:0 0 18px;font-size:15px;color:#F5F3FF;line-height:1.6;">Hi ${firstName || "there"},</p>
<p style="margin:0 0 24px;font-size:15px;color:rgba(245,243,255,0.85);line-height:1.6;">Use the code below to finish signing in to <strong style="color:#F5F3FF;">Heritage Life Solutions</strong>.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr><td align="center" style="padding:24px;background:#3D2B5E;border-radius:12px;border:1px solid rgba(245,158,11,0.28);">
<div style="font-family:'SF Mono','Menlo','Consolas',monospace;font-size:40px;font-weight:700;letter-spacing:12px;color:#fbbf24;line-height:1;">${code}</div>
<p style="margin:12px 0 0;font-size:11px;color:rgba(245,243,255,0.55);letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">expires in ${ttl} ${ttl === 1 ? "minute" : "minutes"}</p>
</td></tr></table>
<div style="background:#3D2B5E;border-left:3px solid #f59e0b;border-radius:6px;padding:14px 18px;margin:0 0 22px;">
<p style="margin:0;font-size:13px;color:rgba(245,243,255,0.75);line-height:1.55;"><strong style="color:#F5F3FF;">Security note:</strong> Heritage Life Solutions staff will never call, text, or email asking for this code. If you didn't try to sign in, ignore this email and consider rotating your password.</p>
</div>
<p style="margin:0;font-size:14px;color:rgba(245,243,255,0.65);line-height:1.6;">Questions? Reach us at <a href="mailto:contact@heritagels.org" style="color:#fbbf24;text-decoration:none;font-weight:600;">contact@heritagels.org</a>.</p>
</td></tr>

<tr><td style="padding:18px 32px;background:#1A0B2E;border-top:1px solid rgba(245,158,11,0.15);text-align:center;">
<p style="margin:0;font-size:11px;color:rgba(245,243,255,0.45);letter-spacing:0.05em;">Required by the Heritage Information Security Program · GLBA 16 CFR § 314.4</p>
</td></tr>

</table>
</td></tr></table>
</body></html>`;

  const plainText = `Hi ${data.firstName || "there"},\n\nYour Heritage Life Solutions verification code is:\n\n  ${data.code}\n\nThis code expires in ${ttl} ${ttl === 1 ? "minute" : "minutes"}.\n\nSecurity note: Heritage Life Solutions staff will never ask you for this code. If you didn't request it, ignore this email.\n\nQuestions? contact@heritagels.org`;

  const subject = `${data.code} is your Heritage Life Solutions sign-in code`;
  const boundary = `heritage_otp_${Date.now().toString(36)}`;

  const message = [
    `From: Heritage Life Solutions <contact@heritagels.org>`,
    `To: ${data.email}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    plainText,
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
    "",
    `--${boundary}--`,
  ].join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const gmail = await getGmailClient();
  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodedMessage },
  });
  console.log(`[Gmail] 2FA verification code sent to ${data.email}`);
}
