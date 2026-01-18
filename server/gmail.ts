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
