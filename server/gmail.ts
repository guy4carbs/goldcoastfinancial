import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/auth/google/callback'
);

// Set credentials if refresh token is available
if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
}

async function getGmailClient() {
  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error('Gmail not configured: GOOGLE_REFRESH_TOKEN is not set. Run the auth script first.');
  }

  // Refresh access token if needed
  const { credentials } = await oauth2Client.refreshAccessToken();
  oauth2Client.setCredentials(credentials);

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

export function getAuthUrl() {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/spreadsheets',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force to get refresh token
  });
}

export async function getTokensFromCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
}

export async function sendContactNotification(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const gmail = await getGmailClient();
  const toEmail = process.env.GMAIL_FROM_EMAIL || 'contact@goldcoastfnl.com';

  const subject = `New Contact Form Submission from ${data.firstName} ${data.lastName}`;
  const body = `
New contact form submission from Gold Coast Financial website:

Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}

Message:
${data.message}

---
This message was sent from the Gold Coast Financial website contact form.
  `.trim();

  const message = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 7bit',
    `To: ${toEmail}`,
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
New secure message from Gold Coast Financial Client Portal:

FROM: ${data.senderName} (${data.senderEmail})
TO: ${data.recipientName}
SUBJECT: ${data.subject}
PRIORITY: ${data.priority === 'high' ? 'High' : 'Normal'}

MESSAGE:
${data.message}

---
To reply, respond directly to this email or log into the advisor portal.
This message was sent securely through the Gold Coast Financial Client Portal.
  `.trim();

  const emailMessage = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 7bit',
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
  const toEmail = process.env.GMAIL_FROM_EMAIL || 'contact@goldcoastfnl.com';

  const subject = `New Quote Request from ${data.firstName} ${data.lastName} - ${data.coverageType}`;
  const body = `
New quote request from Gold Coast Financial website:

CONTACT INFORMATION:
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone}

ADDRESS:
${data.streetAddress}${data.addressLine2 ? `\n${data.addressLine2}` : ''}
${data.city}, ${data.state} ${data.zipCode}

INSURANCE DETAILS:
Type: ${data.coverageType}
Coverage Amount: ${data.coverageAmount}

HEALTH INFORMATION:
Height: ${data.height}
Weight: ${data.weight}
Date of Birth: ${data.birthDate}

MEDICAL & PRESCRIPTION BACKGROUND:
${data.medicalBackground}

---
This quote request was submitted from the Gold Coast Financial website.
  `.trim();

  const message = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 7bit',
    `To: ${toEmail}`,
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
  const toEmail = process.env.GMAIL_FROM_EMAIL || 'meetings@goldcoastfnl.com';

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
New meeting request from Gold Coast Financial website:

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
This meeting request was submitted from the Gold Coast Financial website.
  `.trim();

  const emailMessage = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 7bit',
    `To: ${toEmail}`,
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
  const toEmail = process.env.GMAIL_FROM_EMAIL || 'applications@goldcoastfnl.com';

  const subject = `New Job Application: ${data.position} - ${data.firstName} ${data.lastName}`;
  const body = `
New job application submitted on Gold Coast Financial website:

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

WHY GOLD COAST FINANCIAL:
${data.whyJoinUs}

---
This application was submitted from the Gold Coast Financial careers page.
  `.trim();

  const emailMessage = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 7bit',
    `To: ${toEmail}`,
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

export async function sendPartnershipQuizNotification(data: {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  companyType: string;
  annualRevenue?: string;
  employeeCount?: string;
  partnershipInterest: string;
  timeline?: string;
  additionalInfo?: string;
  score: number;
  qualification: string;
}) {
  const gmail = await getGmailClient();
  const toEmail = 'partnership@goldcoastfnl.com';

  const qualificationLabels: Record<string, string> = {
    'highly_qualified': 'HIGHLY QUALIFIED - Priority Review',
    'qualified': 'QUALIFIED - Standard Review',
    'potential': 'POTENTIAL - Exploratory'
  };

  const companyTypeLabels: Record<string, string> = {
    'insurance_agency': 'Insurance Agency/Brokerage',
    'financial_services': 'Financial Services Firm',
    'technology': 'InsurTech / FinTech',
    'other': 'Other'
  };

  const interestLabels: Record<string, string> = {
    'acquisition': 'Full Acquisition',
    'strategic_partnership': 'Strategic Partnership',
    'investment': 'Capital Investment',
    'exploring': 'Just Exploring'
  };

  const timelineLabels: Record<string, string> = {
    'immediate': 'Immediate (0-3 months)',
    '3_6_months': 'Near-term (3-6 months)',
    '6_12_months': 'Medium-term (6-12 months)',
    '12_plus_months': 'Long-term (12+ months)'
  };

  const revenueLabels: Record<string, string> = {
    'under_1m': 'Under $1M',
    '1m_5m': '$1M - $5M',
    '5m_10m': '$5M - $10M',
    '10m_plus': '$10M+'
  };

  const subject = `[${qualificationLabels[data.qualification] || data.qualification}] Partnership Inquiry - ${data.companyName} (Score: ${data.score}/100)`;
  const body = `
New Partnership Assessment Submission

QUALIFICATION STATUS
Score: ${data.score}/100
Status: ${qualificationLabels[data.qualification] || data.qualification}

CONTACT INFORMATION
Company: ${data.companyName}
Contact: ${data.contactName}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}

COMPANY PROFILE
Type: ${companyTypeLabels[data.companyType] || data.companyType}
Annual Revenue: ${revenueLabels[data.annualRevenue || ''] || data.annualRevenue || 'Not provided'}
Employees: ${data.employeeCount || 'Not provided'}

PARTNERSHIP GOALS
Interest: ${interestLabels[data.partnershipInterest] || data.partnershipInterest}
Timeline: ${timelineLabels[data.timeline || ''] || data.timeline || 'Not provided'}

ADDITIONAL INFORMATION
${data.additionalInfo || 'None provided'}

---
This partnership assessment was submitted from the Gold Coast Financial website.
Respond within ${data.qualification === 'highly_qualified' ? '24-48 hours' : '3-5 business days'}.
  `.trim();

  const emailMessage = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 7bit',
    `To: ${toEmail}`,
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

export async function sendNewsletterNotification(data: {
  email: string;
  name?: string;
  subscriptionType: string;
}) {
  const gmail = await getGmailClient();
  const toEmail = 'insights@goldcoastfnl.com';

  const subject = `New Newsletter Subscription - ${data.subscriptionType === 'institutional' ? 'Institutional' : 'General'}`;
  const body = `
New newsletter subscription from Gold Coast Financial website:

SUBSCRIBER INFORMATION
Email: ${data.email}
Name: ${data.name || 'Not provided'}
Type: ${data.subscriptionType === 'institutional' ? 'Institutional / The Gold Coast Perspective' : 'General Newsletter'}
Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}

---
This subscription was submitted from the Gold Coast Financial website.
  `.trim();

  const emailMessage = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 7bit',
    `To: ${toEmail}`,
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

export async function sendNewsletterWelcome(data: {
  email: string;
  name?: string;
  subscriptionType: string;
}) {
  const gmail = await getGmailClient();

  const subscriberName = data.name ? data.name.split(' ')[0] : '';
  const greeting = subscriberName ? `Dear ${subscriberName}` : 'Thank you';

  const subject = 'Welcome to The Gold Coast Perspective';
  const body = `
${greeting},

Thank you for subscribing to The Gold Coast Perspective, our quarterly newsletter from Gold Coast Financial.

WHAT TO EXPECT

You'll receive thoughtful insights on:

- Financial services industry trends and analysis
- Market dynamics and strategic perspectives
- Portfolio company updates and developments
- Thought leadership from our executive team

We publish quarterly, focusing on quality over quantity. Each edition is crafted to provide genuine value to institutional partners, investors, and industry professionals.

STAY CONNECTED

Visit our website: goldcoastfnl.com/goldcoastfinancial2
Read our latest insights: goldcoastfnl.com/goldcoastfinancial2/blog
Contact us: goldcoastfnl.com/goldcoastfinancial2/contact

If you have questions or would like to discuss partnership opportunities, please don't hesitate to reach out to our team.

We look forward to sharing our perspectives with you.

Warm regards,

The Gold Coast Financial Team
Gold Coast Financial
Naperville, Illinois

---
You're receiving this email because you subscribed to The Gold Coast Perspective newsletter.
To unsubscribe, visit goldcoastfnl.com/goldcoastfinancial2 or reply to this email.
  `.trim();

  const emailMessage = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 7bit',
    `To: ${data.email}`,
    `From: Gold Coast Financial <${process.env.GMAIL_FROM_EMAIL || 'insights@goldcoastfnl.com'}>`,
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

export async function sendApplicationInvite(data: {
  firstName: string;
  lastName: string;
  email: string;
  applicationUrl: string;
}) {
  const gmail = await getGmailClient();

  const subject = "You're Invited to Join Gold Coast Financial Partners";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F5EEE6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5EEE6;padding:40px 20px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#4A1420 0%,#6B2030 100%);padding:40px 40px 30px;border-radius:12px 12px 0 0;text-align:center;">
<div style="width:60px;height:60px;margin:0 auto 16px;background:linear-gradient(135deg,#C4975A,#D4A55A);border-radius:50%;display:flex;align-items:center;justify-content:center;">
<table role="presentation"><tr><td style="width:60px;height:60px;text-align:center;vertical-align:middle;background:linear-gradient(135deg,#C4975A,#D4A55A);border-radius:50%;">
<span style="font-size:24px;font-weight:bold;color:#4A1420;font-family:Georgia,serif;">GC</span>
</td></tr></table>
</div>
<h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:#F0E8DE;letter-spacing:0.5px;">Welcome to the Team</h1>
<p style="margin:0;font-size:14px;color:#C4975A;letter-spacing:1px;">GOLD COAST FINANCIAL PARTNERS, LLC</p>
</td></tr>

<!-- Gold accent bar -->
<tr><td style="height:3px;background:linear-gradient(90deg,#C4975A,#D4A55A,#C4975A);"></td></tr>

<!-- Body -->
<tr><td style="background-color:#FFFFFF;padding:40px;">

<p style="margin:0 0 20px;font-size:16px;color:#2D1810;line-height:1.6;">Hi ${data.firstName},</p>

<p style="margin:0 0 24px;font-size:16px;color:#2D1810;line-height:1.6;">You have been invited to join <strong>Gold Coast Financial Partners, LLC</strong> as a contracted insurance agent. We are excited to have you on board.</p>

<p style="margin:0 0 8px;font-size:13px;color:#8A7060;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Your Application Link</p>
<p style="margin:0 0 24px;font-size:14px;color:#6B5548;line-height:1.5;">Click the button below to start your application. It takes approximately 10-20 minutes to complete.</p>

<!-- CTA Button -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
<tr><td align="center">
<a href="${data.applicationUrl}" target="_blank" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#C4975A,#D4A55A);color:#4A1420;font-size:16px;font-weight:700;text-decoration:none;border-radius:8px;letter-spacing:0.5px;">Begin Application</a>
</td></tr>
<tr><td align="center" style="padding-top:12px;">
<p style="margin:0;font-size:11px;color:#8A7060;line-height:1.4;">Or copy this link into your browser:<br><a href="${data.applicationUrl}" style="color:#C4975A;text-decoration:none;word-break:break-all;font-size:11px;">${data.applicationUrl}</a></p>
</td></tr>
</table>

<!-- Divider -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr><td style="height:1px;background-color:#EDE4D8;"></td></tr>
</table>

<p style="margin:0 0 16px;font-size:13px;color:#8A7060;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">What You'll Need</p>

<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;">
${['Social Security Number', 'Bank account information (routing & account number)', 'Errors & Omissions (E&O) insurance policy details', 'Government-issued photo ID', 'AML (Anti-Money Laundering) certificate', 'Direct Deposit form'].map(item => `
<tr><td style="padding:6px 0;font-size:14px;color:#2D1810;line-height:1.5;">
<span style="color:#C4975A;font-weight:bold;margin-right:8px;">&#9670;</span> ${item}
</td></tr>`).join('')}
</table>

<p style="margin:0 0 16px;font-size:13px;color:#8A7060;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">What to Expect</p>

<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;">
${[
  'Account setup - create your login credentials',
  'Personal & professional information',
  'Background disclosure questions',
  'Banking & E&O insurance details',
  'Document signing - NDA, Debt Rollup, and Compliance agreements',
  'Document uploads'
].map((item, i) => `
<tr><td style="padding:5px 0;font-size:14px;color:#2D1810;line-height:1.5;">
<span style="display:inline-block;width:22px;height:22px;background:#4A1420;color:#C4975A;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:bold;margin-right:10px;">${i + 1}</span> ${item}
</td></tr>`).join('')}
</table>

<!-- Divider -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr><td style="height:1px;background-color:#EDE4D8;"></td></tr>
</table>

<div style="background:#F5EEE6;border-radius:8px;padding:20px;margin:0 0 24px;border-left:3px solid #C4975A;">
<p style="margin:0;font-size:14px;color:#6B5548;line-height:1.5;"><strong style="color:#2D1810;">Your link is valid for 30 days.</strong> You can save your progress and return at any time using the same link.</p>
</div>

<p style="margin:0;font-size:14px;color:#6B5548;line-height:1.6;">If you have any questions, please contact us at <a href="mailto:contact@goldcoastfnl.com" style="color:#C4975A;text-decoration:none;font-weight:600;">contact@goldcoastfnl.com</a> or call <strong style="color:#2D1810;">(630) 778-0888</strong>.</p>

</td></tr>

<!-- Footer -->
<tr><td style="background:#4A1420;padding:28px 40px 20px;border-radius:0 0 12px 12px;text-align:center;">
<p style="margin:0 0 4px;font-size:13px;color:#C4975A;font-weight:600;letter-spacing:0.5px;">Gold Coast Financial Partners, LLC</p>
<p style="margin:0 0 16px;font-size:12px;color:#A89080;">Naperville, Illinois</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
<tr><td style="height:1px;background-color:rgba(196,151,90,0.2);"></td></tr>
</table>
<p style="margin:0 0 8px;font-size:11px;color:#8A7060;line-height:1.5;">This invitation was sent by an administrator at Gold Coast Financial Partners, LLC. If you did not expect this email, please disregard it.</p>
<p style="margin:0 0 8px;font-size:10px;color:#6B5548;line-height:1.5;">Gold Coast Financial Partners, LLC is a licensed insurance agency. All agents are independent contractors and not employees of Gold Coast Financial Partners, LLC. Insurance products are offered through licensed carriers.</p>
<p style="margin:0;font-size:10px;color:#6B5548;line-height:1.5;">&copy; ${new Date().getFullYear()} Gold Coast Financial Partners, LLC. All rights reserved.<br>
<a href="https://goldcoastfinancial.co/terms" style="color:#C4975A;text-decoration:none;">Terms of Service</a> &nbsp;|&nbsp; <a href="https://goldcoastfinancial.co/privacy" style="color:#C4975A;text-decoration:none;">Privacy Policy</a></p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  const message = [
    'Content-Type: text/html; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: base64',
    `To: ${data.email}`,
    `From: Gold Coast Financial Partners <${process.env.GMAIL_FROM_EMAIL || 'contact@goldcoastfnl.com'}>`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    '',
    Buffer.from(html).toString('base64')
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

/**
 * Notify an agent by email that an admin sent them a message in the Agent HCMS.
 * Teaser-only (subject + CTA) — the full message stays in the in-app bell.
 * Brand-matched to sendApplicationInvite.
 */
export async function sendAgentMessageNotification(data: {
  firstName: string;
  email: string;
  title: string;
  actionUrl?: string | null;
  portalUrl: string;
}) {
  const gmail = await getGmailClient();

  const subject = `New message from Gold Coast Financial Partners — ${data.title}`;
  const targetPath = data.actionUrl && data.actionUrl.trim()
    ? data.actionUrl.trim()
    : "/hcms/my/dashboard";
  const ctaUrl = `${data.portalUrl.replace(/\/$/, "")}${targetPath.startsWith("/") ? targetPath : `/${targetPath}`}`;

  const esc = (s: string) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F5EEE6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5EEE6;padding:40px 20px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#4A1420 0%,#6B2030 100%);padding:40px 40px 30px;border-radius:12px 12px 0 0;text-align:center;">
<table role="presentation" align="center"><tr><td style="width:60px;height:60px;text-align:center;vertical-align:middle;background:linear-gradient(135deg,#C4975A,#D4A55A);border-radius:50%;">
<span style="font-size:24px;font-weight:bold;color:#4A1420;font-family:Georgia,serif;">GC</span>
</td></tr></table>
<h1 style="margin:16px 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:#F0E8DE;letter-spacing:0.5px;">You have a new message</h1>
<p style="margin:0;font-size:14px;color:#C4975A;letter-spacing:1px;">GOLD COAST FINANCIAL PARTNERS, LLC</p>
</td></tr>

<!-- Gold accent bar -->
<tr><td style="height:3px;background:linear-gradient(90deg,#C4975A,#D4A55A,#C4975A);"></td></tr>

<!-- Body -->
<tr><td style="background-color:#FFFFFF;padding:40px;">

<p style="margin:0 0 20px;font-size:16px;color:#2D1810;line-height:1.6;">Hi ${esc(data.firstName || "there")},</p>

<p style="margin:0 0 24px;font-size:16px;color:#2D1810;line-height:1.6;">
An administrator at <strong>Gold Coast Financial Partners, LLC</strong> sent you a message in your Agent HCMS.
</p>

<!-- Message teaser card -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
<tr><td style="background:#F5EEE6;border-left:3px solid #C4975A;border-radius:8px;padding:18px 20px;">
<p style="margin:0 0 6px;font-size:11px;color:#8A7060;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Subject</p>
<p style="margin:0;font-size:16px;color:#2D1810;line-height:1.4;font-weight:600;">${esc(data.title)}</p>
</td></tr>
</table>

<p style="margin:0 0 24px;font-size:14px;color:#6B5548;line-height:1.5;">
Log in to the Agent HCMS to read the full message and take any requested action.
</p>

<!-- CTA Button -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
<tr><td align="center">
<a href="${ctaUrl}" target="_blank" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#C4975A,#D4A55A);color:#4A1420;font-size:16px;font-weight:700;text-decoration:none;border-radius:8px;letter-spacing:0.5px;">Open in Agent HCMS</a>
</td></tr>
<tr><td align="center" style="padding-top:12px;">
<p style="margin:0;font-size:11px;color:#8A7060;line-height:1.4;">Or copy this link into your browser:<br><a href="${ctaUrl}" style="color:#C4975A;text-decoration:none;word-break:break-all;font-size:11px;">${ctaUrl}</a></p>
</td></tr>
</table>

<!-- Divider -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr><td style="height:1px;background-color:#EDE4D8;"></td></tr>
</table>

<p style="margin:0;font-size:14px;color:#6B5548;line-height:1.6;">Questions? Reach us at <a href="mailto:contact@goldcoastfnl.com" style="color:#C4975A;text-decoration:none;font-weight:600;">contact@goldcoastfnl.com</a> or <strong style="color:#2D1810;">(630) 778-0888</strong>.</p>

</td></tr>

<!-- Footer -->
<tr><td style="background:#4A1420;padding:28px 40px 20px;border-radius:0 0 12px 12px;text-align:center;">
<p style="margin:0 0 4px;font-size:13px;color:#C4975A;font-weight:600;letter-spacing:0.5px;">Gold Coast Financial Partners, LLC</p>
<p style="margin:0 0 16px;font-size:12px;color:#A89080;">Naperville, Illinois</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
<tr><td style="height:1px;background-color:rgba(196,151,90,0.2);"></td></tr>
</table>
<p style="margin:0 0 8px;font-size:11px;color:#8A7060;line-height:1.5;">This notification was sent because an administrator messaged you in the Agent HCMS.</p>
<p style="margin:0 0 8px;font-size:10px;color:#6B5548;line-height:1.5;">Gold Coast Financial Partners, LLC is a licensed insurance agency. Agents are independent contractors. Insurance products are offered through licensed carriers.</p>
<p style="margin:0;font-size:10px;color:#6B5548;line-height:1.5;">&copy; ${new Date().getFullYear()} Gold Coast Financial Partners, LLC. All rights reserved.<br>
<a href="https://goldcoastfinancial.co/terms" style="color:#C4975A;text-decoration:none;">Terms of Service</a> &nbsp;|&nbsp; <a href="https://goldcoastfinancial.co/privacy" style="color:#C4975A;text-decoration:none;">Privacy Policy</a></p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  const rawMime = [
    'Content-Type: text/html; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: base64',
    `To: ${data.email}`,
    `From: Gold Coast Financial Partners <${process.env.GMAIL_FROM_EMAIL || 'contact@goldcoastfnl.com'}>`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    '',
    Buffer.from(html).toString('base64'),
  ].join('\n');

  const encoded = Buffer.from(rawMime)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encoded } });
}

// =============================================================================
// REGISTRATION + ROLE LIFECYCLE EMAILS (Wave AA)
// =============================================================================
// Brand-matched to sendApplicationInvite. Fired by founders-members.ts /approve
// + /reject and by loungeAccessSync.ts on role change. Best-effort — caller
// catches and logs failures without rolling back the underlying mutation.

const BRAND_HEADER = `
<tr><td style="background:linear-gradient(135deg,#4A1420 0%,#6B2030 100%);padding:40px 40px 30px;border-radius:12px 12px 0 0;text-align:center;">
<div style="width:60px;height:60px;margin:0 auto 16px;background:linear-gradient(135deg,#C4975A,#D4A55A);border-radius:50%;display:flex;align-items:center;justify-content:center;">
<table role="presentation"><tr><td style="width:60px;height:60px;text-align:center;vertical-align:middle;background:linear-gradient(135deg,#C4975A,#D4A55A);border-radius:50%;">
<span style="font-size:24px;font-weight:bold;color:#4A1420;font-family:Georgia,serif;">GC</span>
</td></tr></table>
</div>
__HEADLINE__
<p style="margin:0;font-size:14px;color:#C4975A;letter-spacing:1px;">GOLD COAST FINANCIAL PARTNERS, LLC</p>
</td></tr>
<tr><td style="height:3px;background:linear-gradient(90deg,#C4975A,#D4A55A,#C4975A);"></td></tr>`;

const BRAND_FOOTER = `
<tr><td style="background:#4A1420;padding:28px 40px 20px;border-radius:0 0 12px 12px;text-align:center;">
<p style="margin:0 0 4px;font-size:13px;color:#C4975A;font-weight:600;letter-spacing:0.5px;">Gold Coast Financial Partners, LLC</p>
<p style="margin:0 0 16px;font-size:12px;color:#A89080;">Naperville, Illinois</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
<tr><td style="height:1px;background-color:rgba(196,151,90,0.2);"></td></tr>
</table>
<p style="margin:0 0 8px;font-size:10px;color:#6B5548;line-height:1.5;">Gold Coast Financial Partners, LLC is a licensed insurance agency. All agents are independent contractors and not employees of Gold Coast Financial Partners, LLC. Insurance products are offered through licensed carriers.</p>
<p style="margin:0;font-size:10px;color:#6B5548;line-height:1.5;">&copy; __YEAR__ Gold Coast Financial Partners, LLC. All rights reserved.<br>
<a href="https://goldcoastfinancial.co/terms" style="color:#C4975A;text-decoration:none;">Terms of Service</a> &nbsp;|&nbsp; <a href="https://goldcoastfinancial.co/privacy" style="color:#C4975A;text-decoration:none;">Privacy Policy</a></p>
</td></tr>`;

const BRAND_PAGE_OPEN = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F5EEE6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5EEE6;padding:40px 20px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">`;

const BRAND_PAGE_CLOSE = `</table>
</td></tr>
</table>
</body>
</html>`;

function brandedHtml(headline: string, bodyInner: string): string {
  const header = BRAND_HEADER.replace(
    "__HEADLINE__",
    `<h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:#F0E8DE;letter-spacing:0.5px;">${headline}</h1>`,
  );
  const footer = BRAND_FOOTER.replace("__YEAR__", String(new Date().getFullYear()));
  return `${BRAND_PAGE_OPEN}
${header}
<tr><td style="background-color:#FFFFFF;padding:40px;">
${bodyInner}
</td></tr>
${footer}
${BRAND_PAGE_CLOSE}`;
}

function assertNoHeaderInjection(value: string, label: string) {
  if (/[\r\n]/.test(value)) {
    throw new Error(`Invalid ${label}: header injection attempt detected`);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendBrandedHtml(toEmail: string, subject: string, html: string): Promise<void> {
  assertNoHeaderInjection(toEmail, "recipient email");
  assertNoHeaderInjection(subject, "subject");
  const gmail = await getGmailClient();
  const message = [
    'Content-Type: text/html; charset="UTF-8"',
    "MIME-Version: 1.0",
    "Content-Transfer-Encoding: base64",
    `To: ${toEmail}`,
    `From: Gold Coast Financial Partners <${process.env.GMAIL_FROM_EMAIL || "contact@goldcoastfnl.com"}>`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "",
    Buffer.from(html).toString("base64"),
  ].join("\n");
  const encoded = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  await gmail.users.messages.send({ userId: "me", requestBody: { raw: encoded } });
}

const ROLE_LABELS_EMAIL: Record<string, string> = {
  founder: "Founder",
  owner: "Owner",
  system_admin: "System Admin",
  director: "Director",
  agency_manager: "Agency Manager",
  manager: "Manager",
  sales_agent: "Sales Agent",
  marketing_staff: "Marketing Staff",
  client: "Client",
  investor: "Investor",
};

/**
 * Approval email — sent when a founder approves a pending registration.
 * Branded as Gold Coast Financial Partners and links to the goldcoast portal.
 */
export async function sendRegistrationApprovalEmail(data: {
  firstName: string;
  lastName: string;
  email: string;
  loginUrl?: string;
}): Promise<void> {
  const loginUrl =
    data.loginUrl ||
    process.env.GC_LOGIN_URL ||
    "https://goldcoastfinancial.co/login";
  const firstName = escapeHtml(data.firstName || "");
  const html = brandedHtml(
    "Welcome to the Team",
    `<p style="margin:0 0 20px;font-size:16px;color:#2D1810;line-height:1.6;">Hi ${firstName},</p>
<p style="margin:0 0 24px;font-size:16px;color:#2D1810;line-height:1.6;">Your application has been <strong>approved</strong>. Welcome to <strong>Gold Coast Financial Partners, LLC</strong>.</p>
<p style="margin:0 0 24px;font-size:14px;color:#6B5548;line-height:1.5;">You can now log in to your agent portal to access your CRM, training resources, and onboarding checklist.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
<tr><td align="center">
<a href="${loginUrl}" target="_blank" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#C4975A,#D4A55A);color:#4A1420;font-size:16px;font-weight:700;text-decoration:none;border-radius:8px;letter-spacing:0.5px;">Log in to your portal</a>
</td></tr>
<tr><td align="center" style="padding-top:12px;">
<p style="margin:0;font-size:11px;color:#8A7060;line-height:1.4;">Or copy this link into your browser:<br><a href="${loginUrl}" style="color:#C4975A;text-decoration:none;word-break:break-all;font-size:11px;">${loginUrl}</a></p>
</td></tr>
</table>
<p style="margin:0;font-size:14px;color:#6B5548;line-height:1.6;">Questions? Reach us at <a href="mailto:contact@goldcoastfnl.com" style="color:#C4975A;text-decoration:none;font-weight:600;">contact@goldcoastfnl.com</a> or call <strong style="color:#2D1810;">(630) 778-0888</strong>.</p>`,
  );
  await sendBrandedHtml(
    data.email,
    "Welcome to Gold Coast Financial Partners — your application is approved",
    html,
  );
}

/**
 * Rejection email — sent when a founder rejects a pending registration.
 * Includes the founder's reason (HTML-escaped to prevent injection).
 */
export async function sendRegistrationRejectionEmail(data: {
  firstName: string;
  lastName: string;
  email: string;
  reason?: string | null;
}): Promise<void> {
  const firstName = escapeHtml(data.firstName || "");
  const reasonBlock = data.reason
    ? `<div style="background:#F5EEE6;border-radius:8px;padding:20px;margin:0 0 24px;border-left:3px solid #C4975A;">
<p style="margin:0 0 6px;font-size:13px;color:#8A7060;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Reason</p>
<p style="margin:0;font-size:14px;color:#2D1810;line-height:1.5;">${escapeHtml(data.reason)}</p>
</div>`
    : "";
  const html = brandedHtml(
    "Application Update",
    `<p style="margin:0 0 20px;font-size:16px;color:#2D1810;line-height:1.6;">Hi ${firstName},</p>
<p style="margin:0 0 24px;font-size:16px;color:#2D1810;line-height:1.6;">Thank you for applying to <strong>Gold Coast Financial Partners</strong>. After reviewing your application, we've decided not to move forward at this time.</p>
${reasonBlock}
<p style="margin:0 0 24px;font-size:14px;color:#6B5548;line-height:1.6;">We appreciate the time and effort you put into your application. If your circumstances change in the future, you're welcome to reapply.</p>
<p style="margin:0;font-size:14px;color:#6B5548;line-height:1.6;">Questions? Reach us at <a href="mailto:contact@goldcoastfnl.com" style="color:#C4975A;text-decoration:none;font-weight:600;">contact@goldcoastfnl.com</a>.</p>`,
  );
  await sendBrandedHtml(data.email, "Update on your Gold Coast Financial Partners application", html);
}

/**
 * Role-change email — sent when a founder updates a member's role via the
 * Founders Lounge Access page.
 */
export async function sendRoleChangeEmail(data: {
  firstName: string;
  lastName: string;
  email: string;
  oldRole: string;
  newRole: string;
  reason?: string | null;
}): Promise<void> {
  const loginUrl = process.env.GC_LOGIN_URL || "https://goldcoastfinancial.co/login";
  const firstName = escapeHtml(data.firstName || "");
  const oldLabel = escapeHtml(ROLE_LABELS_EMAIL[data.oldRole] || data.oldRole);
  const newLabel = escapeHtml(ROLE_LABELS_EMAIL[data.newRole] || data.newRole);
  const reasonBlock = data.reason
    ? `<div style="background:#F5EEE6;border-radius:8px;padding:20px;margin:0 0 24px;border-left:3px solid #C4975A;">
<p style="margin:0 0 6px;font-size:13px;color:#8A7060;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Reason</p>
<p style="margin:0;font-size:14px;color:#2D1810;line-height:1.5;">${escapeHtml(data.reason)}</p>
</div>`
    : "";
  const html = brandedHtml(
    "Role Updated",
    `<p style="margin:0 0 20px;font-size:16px;color:#2D1810;line-height:1.6;">Hi ${firstName},</p>
<p style="margin:0 0 24px;font-size:16px;color:#2D1810;line-height:1.6;">Your role at <strong>Gold Coast Financial Partners</strong> has been updated.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;">
<tr><td style="padding:12px 0;font-size:14px;color:#8A7060;width:40%;">Previous role</td><td style="padding:12px 0;font-size:14px;color:#2D1810;font-weight:500;">${oldLabel}</td></tr>
<tr><td style="padding:12px 0;font-size:14px;color:#8A7060;border-top:1px solid #EDE4D8;">New role</td><td style="padding:12px 0;font-size:16px;color:#4A1420;font-weight:700;border-top:1px solid #EDE4D8;">${newLabel}</td></tr>
</table>
${reasonBlock}
<p style="margin:0 0 24px;font-size:14px;color:#6B5548;line-height:1.5;">Your access has been refreshed to match the new role. Log in to your portal to see your updated dashboard.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
<tr><td align="center">
<a href="${loginUrl}" target="_blank" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#C4975A,#D4A55A);color:#4A1420;font-size:16px;font-weight:700;text-decoration:none;border-radius:8px;letter-spacing:0.5px;">Open your portal</a>
</td></tr>
</table>
<p style="margin:0;font-size:14px;color:#6B5548;line-height:1.6;">Questions? Reach us at <a href="mailto:contact@goldcoastfnl.com" style="color:#C4975A;text-decoration:none;font-weight:600;">contact@goldcoastfnl.com</a>.</p>`,
  );
  await sendBrandedHtml(data.email, "Your Gold Coast Financial Partners role has been updated", html);
}

/**
 * Verification code email — Wave AH4. Sent when user requests an email OTP
 * fallback (Touch ID failed/unavailable). Big readable 6-digit code in the
 * Gold Coast brand frame, "expires in N minutes" copy, security warning.
 */
export async function sendVerificationCodeEmail(data: {
  firstName: string;
  email: string;
  code: string;
  ttlMinutes: number;
}): Promise<void> {
  const firstName = escapeHtml(data.firstName || "");
  const code = escapeHtml(data.code);
  const ttl = Math.max(1, Math.floor(data.ttlMinutes || 5));
  const html = brandedHtml(
    "Verification Code",
    `<p style="margin:0 0 20px;font-size:16px;color:#2D1810;line-height:1.6;">Hi ${firstName || "there"},</p>
<p style="margin:0 0 24px;font-size:16px;color:#2D1810;line-height:1.6;">Use the code below to finish signing in to <strong>Gold Coast Financial Partners</strong>.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr><td align="center" style="padding:24px;background:#F5EEE6;border-radius:12px;border:1px solid #EDE4D8;">
<div style="font-family:'SF Mono','Menlo','Consolas',monospace;font-size:40px;font-weight:700;letter-spacing:12px;color:#4A1420;line-height:1;">
${code}
</div>
<p style="margin:12px 0 0;font-size:11px;color:#8A7060;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">expires in ${ttl} ${ttl === 1 ? "minute" : "minutes"}</p>
</td></tr>
</table>
<div style="background:#FFF8F0;border-left:3px solid #C4975A;border-radius:6px;padding:14px 18px;margin:0 0 20px;">
<p style="margin:0;font-size:13px;color:#6B5548;line-height:1.5;"><strong style="color:#2D1810;">Security note:</strong> Gold Coast Financial Partners staff will never call, text, or email asking for this code. If you didn't try to sign in, ignore this email and consider rotating your password.</p>
</div>
<p style="margin:0;font-size:14px;color:#6B5548;line-height:1.6;">Questions? Reach us at <a href="mailto:contact@goldcoastfnl.com" style="color:#C4975A;text-decoration:none;font-weight:600;">contact@goldcoastfnl.com</a> or call <strong style="color:#2D1810;">(630) 778-0888</strong>.</p>`,
  );
  await sendBrandedHtml(data.email, `${data.code} is your Gold Coast Financial sign-in code`, html);
}

/**
 * Password reset email — fires when a user requests a reset at /forgot-password.
 * Token is raw (not the DB hash) and goes in the URL; backend validates by
 * hashing and looking up. TTL is 1 hour. Same brand frame as the verification
 * code email so the auth surface feels consistent.
 */
export async function sendPasswordResetEmail(data: {
  firstName?: string;
  email: string;
  resetUrl: string;
  ttlMinutes: number;
}): Promise<void> {
  const firstName = escapeHtml(data.firstName || "");
  const url = escapeHtml(data.resetUrl);
  const ttl = Math.max(1, Math.floor(data.ttlMinutes || 60));
  const html = brandedHtml(
    "Reset Your Password",
    `<p style="margin:0 0 20px;font-size:16px;color:#2D1810;line-height:1.6;">Hi ${firstName || "there"},</p>
<p style="margin:0 0 24px;font-size:16px;color:#2D1810;line-height:1.6;">We received a request to reset the password for your <strong>Gold Coast Financial Partners</strong> account. Tap the button below to choose a new one.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr><td align="center" style="padding:8px 0;">
<a href="${url}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#C4975A,#D4A55A);color:#2D1810;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;letter-spacing:0.4px;">Reset password</a>
</td></tr>
</table>
<p style="margin:0 0 16px;font-size:13px;color:#6B5548;line-height:1.6;">This link expires in <strong style="color:#2D1810;">${ttl} ${ttl === 1 ? "minute" : "minutes"}</strong>. If the button doesn't work, copy and paste this URL into your browser:</p>
<p style="margin:0 0 24px;font-size:12px;color:#8A7060;line-height:1.5;word-break:break-all;background:#F5EEE6;padding:12px;border-radius:6px;">${url}</p>
<div style="background:#FFF8F0;border-left:3px solid #C4975A;border-radius:6px;padding:14px 18px;margin:0 0 20px;">
<p style="margin:0;font-size:13px;color:#6B5548;line-height:1.5;"><strong style="color:#2D1810;">Didn't request this?</strong> You can safely ignore this email — your password won't change unless you click the link and choose a new one. If you're seeing reset emails you didn't request repeatedly, please contact us.</p>
</div>
<p style="margin:0;font-size:14px;color:#6B5548;line-height:1.6;">Questions? Reach us at <a href="mailto:contact@goldcoastfnl.com" style="color:#C4975A;text-decoration:none;font-weight:600;">contact@goldcoastfnl.com</a> or call <strong style="color:#2D1810;">(630) 778-0888</strong>.</p>`,
  );
  await sendBrandedHtml(data.email, "Reset your Gold Coast Financial password", html);
}
