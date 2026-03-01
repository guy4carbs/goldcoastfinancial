/**
 * Automation Email Service
 * Handles sending automated emails triggered by the automation engine
 */

import { google } from 'googleapis';

// OAuth2 client for Gmail
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

async function getGmailClient() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error('Gmail not configured - missing Google OAuth credentials');
  }
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

// =============================================================================
// EMAIL TEMPLATES
// =============================================================================

interface EmailTemplate {
  subject: string;
  body: string;
}

const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  "follow-up": {
    subject: "Following Up - {{agent.name}} from Heritage Life Solutions",
    body: `Hi {{lead.firstName}},

I wanted to follow up on our previous conversation about your insurance needs.

Is there anything I can help clarify or any questions you might have? I'm here to help you find the right coverage for your family.

Feel free to reply to this email or give me a call at {{agent.phone}}.

Best regards,
{{agent.name}}
Heritage Life Solutions`,
  },
  "birthday-greeting": {
    subject: "Happy Birthday, {{client.firstName}}!",
    body: `Dear {{client.firstName}},

On behalf of everyone at Heritage Life Solutions, we want to wish you a very Happy Birthday!

We're grateful to have you as a valued client and hope your special day is filled with joy and celebration.

Warmest wishes,
{{agent.name}}
Heritage Life Solutions`,
  },
  "renewal-reminder": {
    subject: "Policy Renewal Reminder - Action Needed",
    body: `Dear {{client.firstName}},

This is a friendly reminder that your policy is coming up for renewal in 30 days.

To ensure continuous coverage for you and your family, please review your policy details and let us know if you'd like to make any changes.

We're here to help with any questions you might have about your renewal options.

Best regards,
{{agent.name}}
Heritage Life Solutions`,
  },
  "quote-follow-up": {
    subject: "Your Insurance Quote - Let's Connect",
    body: `Hi {{lead.firstName}},

I hope this email finds you well! I wanted to follow up on the insurance quote we discussed.

I understand choosing the right coverage is an important decision. If you have any questions or would like to explore other options, I'm here to help.

Would you have a few minutes this week for a quick call? I'd be happy to walk through the details with you.

Best regards,
{{agent.name}}
Heritage Life Solutions`,
  },
  "welcome-new-client": {
    subject: "Welcome to Heritage Life Solutions!",
    body: `Dear {{client.firstName}},

Welcome to the Heritage Life Solutions family!

We're thrilled to have you as our client and want to thank you for trusting us with your insurance needs.

Your agent, {{agent.name}}, will be your dedicated point of contact. Please don't hesitate to reach out with any questions.

Best regards,
The Heritage Life Solutions Team`,
  },
};

// =============================================================================
// EMAIL SENDING
// =============================================================================

interface SendAutomationEmailParams {
  to: string;
  templateId?: string;
  subject?: string;
  body?: string;
  agent: {
    name: string;
    email: string;
    phone: string;
  };
  context?: Record<string, any>;
}

/**
 * Resolve template variables in a string
 */
function resolveTemplate(template: string, context: Record<string, any>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const parts = path.trim().split('.');
    let value: any = context;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return match; // Keep original if not found
      }
    }

    return value !== undefined ? String(value) : match;
  });
}

/**
 * Send an automated email
 */
export async function sendAutomationEmail(params: SendAutomationEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const gmail = await getGmailClient();

    // Get template if specified
    let subject = params.subject || '';
    let body = params.body || '';

    if (params.templateId && EMAIL_TEMPLATES[params.templateId]) {
      const template = EMAIL_TEMPLATES[params.templateId];
      subject = params.subject || template.subject;
      body = params.body || template.body;
    }

    // Build context for template resolution
    const context = {
      ...params.context,
      agent: params.agent,
    };

    // Resolve templates
    subject = resolveTemplate(subject, context);
    body = resolveTemplate(body, context);

    if (!params.to || !subject || !body) {
      throw new Error('Missing required email fields (to, subject, or body)');
    }

    // Create email message
    const message = [
      'Content-Type: text/plain; charset="UTF-8"',
      'MIME-Version: 1.0',
      'Content-Transfer-Encoding: 7bit',
      `From: ${params.agent.name} <${process.env.GMAIL_FROM_EMAIL || 'contact@heritagels.org'}>`,
      `To: ${params.to}`,
      `Reply-To: ${params.agent.email}`,
      `Subject: ${subject}`,
      '',
      body
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

    console.log(`[AutomationEmail] Sent to ${params.to}: ${subject}`);

    return {
      success: true,
      messageId: result.data.id || undefined,
    };
  } catch (error: any) {
    console.error('[AutomationEmail] Failed to send email:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  );
}

/**
 * Get available email templates
 */
export function getEmailTemplates(): Array<{ id: string; subject: string }> {
  return Object.entries(EMAIL_TEMPLATES).map(([id, template]) => ({
    id,
    subject: template.subject,
  }));
}

export default {
  sendAutomationEmail,
  isEmailConfigured,
  getEmailTemplates,
};
