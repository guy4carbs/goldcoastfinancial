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
    'Content-Transfer-Encoding: 7bit',
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
    `From: Gold Coast Financial Client Portal <client@goldcoastfnl.com>`,
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
  
  const formattedCoverageType = formatCoverageType(data.coverageType);
  const subject = `New Quote Request: ${formattedCoverageType} - ${data.firstName} ${data.lastName}`;
  const body = `
NEW QUOTE REQUEST
Heritage Life Solutions Website

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTACT INFORMATION
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone}

ADDRESS
${data.streetAddress}${data.addressLine2 ? `\n${data.addressLine2}` : ''}
${data.city}, ${data.state} ${data.zipCode}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COVERAGE REQUEST
Product Type: ${formattedCoverageType}
Coverage Amount: ${data.coverageAmount}

CLIENT PROFILE
Date of Birth: ${data.birthDate}
Height: ${data.height}
Weight: ${data.weight}

MEDICAL & PRESCRIPTION BACKGROUND
${data.medicalBackground}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Submitted via Heritage Life Solutions website
  `.trim();

  const message = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 7bit',
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
• We'll review your information and find the best options for your needs
• A licensed agent will contact you to discuss your coverage options
• You'll receive a personalized quote with no obligation

If you have any immediate questions, feel free to call us at (630) 778-0800 or reply to this email.

We look forward to helping you protect what matters most.

Best regards,
The Heritage Life Solutions Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Heritage Life Solutions
(630) 778-0800
contact@heritagels.org
www.heritagels.org
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();

  const message = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 7bit',
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
    'Content-Transfer-Encoding: 7bit',
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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Submitted via Heritage Life Solutions website
Please respond within 45 days as required by law.
  `.trim();

  const privacyMessage = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 7bit',
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
