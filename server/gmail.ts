import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  // Always fetch fresh credentials to ensure we use the currently connected account
  connectionSettings = null;
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  
  if (!hostname) {
    console.log('Gmail integration: REPLIT_CONNECTORS_HOSTNAME not available');
    throw new Error('Gmail connector not available in this environment');
  }
  
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    console.log('Gmail integration: Neither REPL_IDENTITY nor WEB_REPL_RENEWAL available');
    console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('REPL')).join(', '));
    throw new Error('Gmail connector token not found - ensure connector is linked to deployment');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Gmail not connected');
  }
  return accessToken;
}

async function getUncachableGmailClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

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
  const gmail = await getUncachableGmailClient();
  
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
    `To: contact@goldcoastfnl.com`,
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
  const gmail = await getUncachableGmailClient();
  
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
  const gmail = await getUncachableGmailClient();
  
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
    `To: contact@goldcoastfnl.com`,
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
  const gmail = await getUncachableGmailClient();
  
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
  const gmail = await getUncachableGmailClient();
  
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
    `To: applications@goldcoastfnl.com`,
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
