// AgentOS Stage 1 - Compliance-Safe Message Templates

export interface MessageTemplate {
  id: string;
  name: string;
  category: 'outreach' | 'follow-up' | 'quote' | 'application' | 'policy' | 'general';
  channel: 'email' | 'text' | 'both';
  subject?: string; // For emails
  body: string;
  variables: string[];
  complianceNotes?: string;
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  // Outreach Templates
  {
    id: 'template-outreach-1',
    name: 'Initial Introduction',
    category: 'outreach',
    channel: 'email',
    subject: 'Your Life Insurance Quote Request',
    body: `Hi {firstName},

Thank you for reaching out about life insurance coverage. I'm {agentName} with Gold Coast Financial, and I'd love to help you find the right protection for your family.

I noticed you were interested in {productType} insurance. I have some great options that might be perfect for your situation.

Would you have a few minutes this week to chat? I promise to keep it brief and answer any questions you have.

Best regards,
{agentName}
Gold Coast Financial
{agentPhone}`,
    variables: ['firstName', 'agentName', 'productType', 'agentPhone'],
    complianceNotes: 'Do not make specific premium promises without underwriting.'
  },
  {
    id: 'template-outreach-2',
    name: 'Initial Text Outreach',
    category: 'outreach',
    channel: 'text',
    body: `Hi {firstName}, this is {agentName} from Gold Coast Financial. I received your request about life insurance. When would be a good time to chat? I can answer any questions you have. Reply STOP to opt out.`,
    variables: ['firstName', 'agentName'],
    complianceNotes: 'Always include opt-out language for text messages.'
  },

  // Follow-up Templates
  {
    id: 'template-followup-1',
    name: 'Callback Reminder',
    category: 'follow-up',
    channel: 'email',
    subject: 'Following Up on Our Conversation',
    body: `Hi {firstName},

I wanted to follow up on our conversation from {lastContactDate}. You mentioned you wanted some time to think about the {productType} coverage we discussed.

I'm here whenever you're ready to move forward or if you have any additional questions. Just reply to this email or give me a call.

Looking forward to hearing from you!

Best,
{agentName}
{agentPhone}`,
    variables: ['firstName', 'lastContactDate', 'productType', 'agentName', 'agentPhone']
  },
  {
    id: 'template-followup-2',
    name: 'Second Follow-up',
    category: 'follow-up',
    channel: 'email',
    subject: 'Checking In - Your Life Insurance Quote',
    body: `Hi {firstName},

I hope this message finds you well. I wanted to check in about the life insurance quote we discussed.

I know life gets busy, but I want to make sure you and your family have the protection you need. If your situation or needs have changed, I'm happy to review new options with you.

Is there a better time for me to reach you this week?

Best regards,
{agentName}
Gold Coast Financial`,
    variables: ['firstName', 'agentName']
  },
  {
    id: 'template-followup-3',
    name: 'Quick Text Check-In',
    category: 'follow-up',
    channel: 'text',
    body: `Hi {firstName}, just checking in from Gold Coast Financial. Still interested in the {productType} quote we discussed? Let me know if you have any questions! - {agentName}`,
    variables: ['firstName', 'productType', 'agentName']
  },

  // Quote Templates
  {
    id: 'template-quote-1',
    name: 'Quote Ready Notification',
    category: 'quote',
    channel: 'email',
    subject: 'Your Personalized Life Insurance Quote is Ready',
    body: `Hi {firstName},

Great news! I've prepared a personalized {productType} quote based on the information you provided.

Here are the highlights:
- Coverage Amount: {coverageAmount}
- Monthly Premium: {monthlyPremium}
- Carrier: {carrier}

This quote is valid for 30 days from today. I'd love to walk you through the details and answer any questions you might have.

Would you be available for a quick call this week?

Best regards,
{agentName}
Gold Coast Financial
{agentPhone}`,
    variables: ['firstName', 'productType', 'coverageAmount', 'monthlyPremium', 'carrier', 'agentName', 'agentPhone'],
    complianceNotes: 'Premiums are subject to underwriting approval. Always disclose this to clients.'
  },
  {
    id: 'template-quote-2',
    name: 'Quote Ready Text',
    category: 'quote',
    channel: 'text',
    body: `Hi {firstName}! Your {productType} quote is ready - {coverageAmount} coverage for {monthlyPremium}/mo. Want me to walk you through it? Call/text anytime! - {agentName}`,
    variables: ['firstName', 'productType', 'coverageAmount', 'monthlyPremium', 'agentName'],
    complianceNotes: 'Quote amounts are estimates pending underwriting.'
  },

  // Application Templates
  {
    id: 'template-app-1',
    name: 'Application Submitted',
    category: 'application',
    channel: 'email',
    subject: 'Your Life Insurance Application Has Been Submitted',
    body: `Hi {firstName},

I'm pleased to confirm that your {productType} life insurance application has been submitted to {carrier}.

What happens next:
1. The underwriting team will review your application (typically 5-10 business days)
2. They may reach out for additional information if needed
3. I'll contact you immediately once we have a decision

In the meantime, if you have any questions or need to provide additional documentation, please don't hesitate to reach out.

Thank you for trusting Gold Coast Financial with your family's protection!

Best regards,
{agentName}
{agentPhone}`,
    variables: ['firstName', 'productType', 'carrier', 'agentName', 'agentPhone']
  },
  {
    id: 'template-app-2',
    name: 'Underwriting Update',
    category: 'application',
    channel: 'email',
    subject: 'Update on Your Life Insurance Application',
    body: `Hi {firstName},

I wanted to give you an update on your {productType} application with {carrier}.

Your application is currently in underwriting review. This process typically takes 5-10 business days, and we're making good progress.

If the underwriting team needs any additional information, I'll reach out right away to keep things moving.

I'll be in touch as soon as I have more news. Feel free to contact me anytime if you have questions.

Best,
{agentName}
{agentPhone}`,
    variables: ['firstName', 'productType', 'carrier', 'agentName', 'agentPhone']
  },

  // Policy Templates
  {
    id: 'template-policy-1',
    name: 'Policy Approved',
    category: 'policy',
    channel: 'email',
    subject: 'Congratulations! Your Life Insurance Policy is Approved',
    body: `Hi {firstName},

Wonderful news! Your {productType} life insurance policy with {carrier} has been approved!

Policy Details:
- Coverage Amount: {coverageAmount}
- Monthly Premium: {monthlyPremium}
- Policy Number: {policyNumber}

Your first premium payment will be processed on the date you specified during the application.

I'd like to schedule a brief call to deliver your policy documents and make sure you understand all the benefits of your new coverage. When would be a good time?

Congratulations on taking this important step to protect your family!

Best regards,
{agentName}
Gold Coast Financial
{agentPhone}`,
    variables: ['firstName', 'productType', 'carrier', 'coverageAmount', 'monthlyPremium', 'policyNumber', 'agentName', 'agentPhone']
  },
  {
    id: 'template-policy-2',
    name: 'Policy Issued Congratulations',
    category: 'policy',
    channel: 'email',
    subject: 'Your Life Insurance Policy is Now Active',
    body: `Hi {firstName},

Your {productType} life insurance policy is now officially in force! You and your family are now protected.

Key Information:
- Policy Number: {policyNumber}
- Coverage: {coverageAmount}
- Carrier: {carrier}
- Effective Date: Today

Important reminders:
- Keep your policy documents in a safe place
- Make sure your beneficiaries know about this policy
- Review your coverage annually as your needs change

If you know anyone else who could benefit from life insurance, I'd be grateful for a referral. Thank you for trusting me with your family's protection!

Best regards,
{agentName}
{agentPhone}`,
    variables: ['firstName', 'productType', 'policyNumber', 'coverageAmount', 'carrier', 'agentName', 'agentPhone']
  },
  {
    id: 'template-policy-3',
    name: 'Policy Approved Text',
    category: 'policy',
    channel: 'text',
    body: `Great news {firstName}! Your {productType} policy with {carrier} is approved! {coverageAmount} coverage is now in place. I'll call to deliver your documents. - {agentName}`,
    variables: ['firstName', 'productType', 'carrier', 'coverageAmount', 'agentName']
  },

  // General Templates
  {
    id: 'template-general-1',
    name: 'Annual Policy Review Invitation',
    category: 'general',
    channel: 'email',
    subject: 'Time for Your Annual Life Insurance Review',
    body: `Hi {firstName},

It's been about a year since we put your life insurance coverage in place, and I wanted to check in.

A lot can change in a year - new job, growing family, home purchase, or simply new goals. It's a great time to review your coverage and make sure it still meets your needs.

I'd love to schedule a quick 15-minute review call. There's no obligation, just a chance to make sure your family is properly protected.

Would any time this week work for you?

Best regards,
{agentName}
Gold Coast Financial
{agentPhone}`,
    variables: ['firstName', 'agentName', 'agentPhone']
  },
  {
    id: 'template-general-2',
    name: 'Birthday Greeting',
    category: 'general',
    channel: 'email',
    subject: 'Happy Birthday from Gold Coast Financial!',
    body: `Hi {firstName},

Happy Birthday! I hope your special day is filled with joy and celebration.

As you start a new year, it might be a good time to review your life insurance coverage. Birthdays often come with life changes that could affect your protection needs.

If you'd like to chat about your coverage or just catch up, I'm always here.

Wishing you a wonderful birthday!

Best,
{agentName}`,
    variables: ['firstName', 'agentName']
  },
  {
    id: 'template-general-3',
    name: 'Referral Request',
    category: 'general',
    channel: 'email',
    subject: 'Know Someone Who Needs Life Insurance?',
    body: `Hi {firstName},

I hope your {productType} policy is serving you well!

I wanted to reach out because I'm looking to help more families like yours get the protection they need. If you know anyone - friends, family, coworkers - who might benefit from life insurance, I'd really appreciate a referral.

There's no pressure, of course. But if someone comes to mind, just have them give me a call or reply to this email with their information.

Thank you for being a valued client!

Best regards,
{agentName}
{agentPhone}`,
    variables: ['firstName', 'productType', 'agentName', 'agentPhone']
  }
];

export const TEMPLATE_CATEGORIES = [
  { id: 'outreach', label: 'Initial Outreach', icon: 'mail' },
  { id: 'follow-up', label: 'Follow-Up', icon: 'clock' },
  { id: 'quote', label: 'Quote Notifications', icon: 'file-text' },
  { id: 'application', label: 'Application Updates', icon: 'send' },
  { id: 'policy', label: 'Policy Communications', icon: 'award' },
  { id: 'general', label: 'General', icon: 'message-square' },
] as const;

export function substituteVariables(
  template: string,
  values: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

export function getUnsubstitutedVariables(
  template: string,
  values: Record<string, string>
): string[] {
  const variablePattern = /\{(\w+)\}/g;
  const matches = Array.from(template.matchAll(variablePattern));
  const unsubstituted: string[] = [];

  for (const match of matches) {
    if (!values[match[1]] || values[match[1]].includes('{')) {
      if (!unsubstituted.includes(match[1])) {
        unsubstituted.push(match[1]);
      }
    }
  }

  return unsubstituted;
}

// Helper function to get a template by ID
export function getTemplate(templateId: string): (MessageTemplate & { channels: string[] }) | null {
  const template = MESSAGE_TEMPLATES.find(t => t.id === templateId);
  if (!template) return null;

  // Convert single channel to array for easier handling
  const channels = template.channel === 'both'
    ? ['email', 'text']
    : [template.channel];

  return { ...template, channels };
}

// Helper function to fill a template with values
export function fillTemplate(
  templateId: string,
  values: Record<string, string>
): string {
  const template = MESSAGE_TEMPLATES.find(t => t.id === templateId);
  if (!template) return '';

  return substituteVariables(template.body, values);
}
