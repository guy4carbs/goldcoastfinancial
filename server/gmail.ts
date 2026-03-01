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
        return `To complete your policy setup with ${carrierName}, we'll need your banking information for the initial premium draft and ongoing billing authorization.\n\nYou can submit this securely using the link below, or we can complete it together over the phone — whichever you prefer.\n\nOnce received, I'll confirm and finalize your submission right away.`;
      case 'drivers_license':
        return `To verify your identity for your ${carrierName} application, we'll need your driver's license or state-issued ID information.\n\nPlease submit this through the secure link below — your data is encrypted and protected.\n\nOnce received, I'll confirm and continue processing your application.`;
      case 'full_application':
        return `To move forward with your policy submission to ${carrierName}, I'll need your completed application on file.\n\nPlease send it over at your earliest convenience so we can keep everything on track for underwriting.\n\nIf you have any questions while completing it, let me know — happy to help.`;
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
                      &copy; 2026 Gold Coast Financial Group. Heritage Life Solutions is a DBA of Gold Coast Financial Group. We operate as an independent insurance agency, licensed in all 50 states. IL License #1001234567. Policies are issued by our carrier partners and product availability may vary by state.
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

(c) 2026 Gold Coast Financial Group. Heritage Life Solutions is a DBA of Gold Coast Financial Group. We operate as an independent insurance agency, licensed in all 50 states. IL License #1001234567. Policies are issued by our carrier partners and product availability may vary by state.

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
    'Content-Transfer-Encoding: 7bit',
    '',
    plainTextBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
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
                &copy; 2026 Gold Coast Financial Group. Heritage Life Solutions is a DBA of Gold Coast Financial Group. We operate as an independent insurance agency, licensed in all 50 states. IL License #1001234567. Policies are issued by our carrier partners and product availability may vary by state.
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

(c) 2026 Gold Coast Financial Group. Heritage Life Solutions is a DBA of Gold Coast Financial Group. We operate as an independent insurance agency, licensed in all 50 states.
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
    'Content-Transfer-Encoding: 7bit',
    '',
    plainTextBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
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
