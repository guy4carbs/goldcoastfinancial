/**
 * CONTENT_GENERATION_AGENT
 * Email templates, SMS scripts, call talk tracks, blog content,
 * social captions, A/B variants. Emits CONTENT_CREATED.
 */

import {
  BaseAgent, EventType, AgentEvent,
  memoryGraph, NodeType,
  knowledgeBase, analyticsLedger, MetricType,
  securityLayer, Permission,
} from '../core';

type ContentType = 'email' | 'sms' | 'social' | 'blog' | 'call_script' | 'talk_track';

interface GeneratedContent {
  id: string;
  contentType: ContentType;
  campaign: string;
  subject?: string;
  body: string;
  variants: ContentVariant[];
  targetAudience: string;
  productType?: string;
  createdAt: number;
  performanceScore?: number;
}

interface ContentVariant {
  variantId: string;
  label: string;
  body: string;
  subject?: string;
  sentCount: number;
  openRate?: number;
  clickRate?: number;
  conversionRate?: number;
}

// Templates organized by content type and purpose
const EMAIL_TEMPLATES: Record<string, { subject: string; body: string }[]> = {
  welcome: [
    {
      subject: 'Welcome to Heritage Capital — Your Coverage Journey Starts Here',
      body: `Hi {{firstName}},\n\nThank you for trusting Heritage Capital Financial Group with your insurance needs. I'm {{agentName}}, and I'll be your dedicated agent.\n\nHere's what happens next:\n1. Your application is being processed\n2. You'll receive policy documents within {{timeframe}}\n3. I'm available anytime at {{phone}} or {{email}}\n\nProtecting your family is the most important decision you can make. I'm honored to be part of that.\n\nWarm regards,\n{{agentName}}\nHeritage Capital Financial Group`,
    },
    {
      subject: '{{firstName}}, Your Family is Now Protected 🛡️',
      body: `Hi {{firstName}},\n\nGreat news — you've taken the most important step in protecting your family's future.\n\nI'm {{agentName}}, your personal insurance advisor. Here's my direct line: {{phone}}\n\nDon't hesitate to reach out with any questions. I'm here for you and your family, always.\n\nBest,\n{{agentName}}`,
    },
  ],
  follow_up: [
    {
      subject: 'Quick question about your coverage, {{firstName}}',
      body: `Hi {{firstName}},\n\nI wanted to follow up on our recent conversation about {{productType}} coverage. I know life gets busy, but this is too important to let slip.\n\nHere's what I've put together for you:\n- Coverage: {{coverageAmount}}\n- Monthly cost: {{premium}}\n- Protection that starts immediately\n\nCan we schedule a quick 10-minute call to finalize? What time works for you this week?\n\n{{agentName}}`,
    },
  ],
  renewal: [
    {
      subject: 'Your policy renewal is coming up, {{firstName}}',
      body: `Hi {{firstName}},\n\nYour {{productType}} policy with {{carrier}} is coming up for renewal on {{renewalDate}}.\n\nThis is a great time to:\n✅ Review your current coverage\n✅ Make sure your beneficiaries are up to date\n✅ Explore any additional protection you might need\n\nWould you like to schedule a quick review? I'm available at your convenience.\n\n{{agentName}}\nHeritage Capital Financial Group`,
    },
  ],
};

const SMS_TEMPLATES: Record<string, string[]> = {
  appointment_reminder: [
    'Hi {{firstName}}, just a reminder about our call tomorrow at {{time}}. Looking forward to helping protect your family! - {{agentName}}',
    '{{firstName}} — quick reminder: we\'re scheduled to chat tomorrow at {{time}}. Talk soon! - {{agentName}}, Heritage Capital',
  ],
  follow_up: [
    'Hi {{firstName}}, I have those quotes ready for you. When\'s a good time to go over them? - {{agentName}}',
    '{{firstName}}, just checking in. Ready to lock in that {{premium}}/mo rate? Call me anytime: {{phone}} - {{agentName}}',
  ],
  lapse_recovery: [
    '{{firstName}}, I noticed your policy payment didn\'t go through. Let\'s get this resolved quickly so your family stays protected. Call me: {{phone}} - {{agentName}}',
  ],
};

const SOCIAL_TEMPLATES: Record<string, string[]> = {
  educational: [
    '💡 Did you know? The average funeral costs $10,000-$15,000. Final expense insurance can protect your family from this burden. No medical exam required for many plans.',
    '📊 Life insurance fact: 40% of Americans have no life insurance. If you have a family, a mortgage, or debts — you need coverage. Period.',
    '🏠 New homeowner? Your mortgage company wants you protected, but YOU should want it even more. Mortgage protection insurance keeps your family in their home.',
  ],
  testimonial: [
    '⭐ "I never thought I\'d need life insurance at 35. Then I had kids. {{agentName}} made it so easy and affordable." - Satisfied Client',
    '❤️ "When we lost my husband, his life insurance saved us. Don\'t wait. Get covered today."',
  ],
  promotional: [
    '🛡️ Coverage starting at just $1/day. Protect what matters most. Free quote — link in bio.',
    '⏰ Your health today = your best rate ever. Lock in your premium before your next birthday. Free consultation available.',
  ],
};

export class ContentGenerationAgent extends BaseAgent {
  constructor() {
    super({
      id: 'content-generation',
      name: 'CONTENT_GENERATION_AGENT',
      tier: 8,
      description: 'Email templates, SMS scripts, social captions, blog content with A/B variants',
      capabilities: ['email_templates', 'sms_scripts', 'social_captions', 'blog_content', 'ab_variants', 'call_scripts'],
      consumesEvents: [EventType.LEAD_SCORED, EventType.CLIENT_RETAINED, EventType.POLICY_RECOMMENDED],
      producesEvents: [EventType.CONTENT_CREATED],
      complianceRequired: true,
    });
  }

  protected async onStart(): Promise<void> {
    securityLayer.registerAgent(this.id, [Permission.READ_LEADS, Permission.READ_CLIENTS]);
  }

  protected async onStop(): Promise<void> {}

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.LEAD_SCORED) {
      await this.generateLeadContent(event.payload);
    } else if (event.type === EventType.CLIENT_RETAINED) {
      if (event.payload.action === 'lapse_recovery_initiated') {
        await this.generateLapseRecoveryContent(event.payload);
      }
    }
  }

  private async generateLeadContent(payload: any): Promise<void> {
    const { leadId } = payload;
    const leadNode = this.memory.getNode(leadId);
    if (!leadNode) return;

    // Generate follow-up email
    await this.generateContent({
      contentType: 'email',
      campaign: 'follow_up',
      targetAudience: 'scored_lead',
      productType: leadNode.data.coverageType,
      variables: {
        firstName: leadNode.data.firstName,
        productType: leadNode.data.coverageType || 'life insurance',
      },
    });

    // Generate SMS
    await this.generateContent({
      contentType: 'sms',
      campaign: 'follow_up',
      targetAudience: 'scored_lead',
      variables: { firstName: leadNode.data.firstName },
    });
  }

  private async generateLapseRecoveryContent(payload: any): Promise<void> {
    await this.generateContent({
      contentType: 'sms',
      campaign: 'lapse_recovery',
      targetAudience: 'lapsed_client',
      variables: { clientId: payload.clientId },
    });

    await this.generateContent({
      contentType: 'email',
      campaign: 'renewal',
      targetAudience: 'lapsed_client',
      variables: { clientId: payload.clientId },
    });
  }

  async generateContent(params: {
    contentType: ContentType;
    campaign: string;
    targetAudience: string;
    productType?: string;
    variables?: Record<string, string>;
  }): Promise<GeneratedContent> {
    let body = '';
    let subject: string | undefined;
    const variants: ContentVariant[] = [];

    switch (params.contentType) {
      case 'email': {
        const templates = EMAIL_TEMPLATES[params.campaign] || EMAIL_TEMPLATES.follow_up;
        templates.forEach((tmpl, i) => {
          const variantBody = this.interpolate(tmpl.body, params.variables || {});
          const variantSubject = this.interpolate(tmpl.subject, params.variables || {});
          variants.push({
            variantId: `V${i + 1}`,
            label: `Variant ${String.fromCharCode(65 + i)}`,
            body: variantBody,
            subject: variantSubject,
            sentCount: 0,
          });
        });
        body = variants[0]?.body || '';
        subject = variants[0]?.subject;
        break;
      }
      case 'sms': {
        const templates = SMS_TEMPLATES[params.campaign] || SMS_TEMPLATES.follow_up;
        templates.forEach((tmpl, i) => {
          variants.push({
            variantId: `V${i + 1}`,
            label: `Variant ${String.fromCharCode(65 + i)}`,
            body: this.interpolate(tmpl, params.variables || {}),
            sentCount: 0,
          });
        });
        body = variants[0]?.body || '';
        break;
      }
      case 'social': {
        const templates = SOCIAL_TEMPLATES[params.campaign] || SOCIAL_TEMPLATES.educational;
        templates.forEach((tmpl, i) => {
          variants.push({
            variantId: `V${i + 1}`,
            label: `Variant ${String.fromCharCode(65 + i)}`,
            body: this.interpolate(tmpl, params.variables || {}),
            sentCount: 0,
          });
        });
        body = variants[0]?.body || '';
        break;
      }
      case 'call_script': {
        const scripts = knowledgeBase.getScriptsByType(params.campaign === 'cold_call' ? 'cold_call' : 'follow_up');
        if (scripts.length > 0) {
          body = this.interpolate(scripts[0].script, params.variables || {});
          variants.push({ variantId: 'V1', label: 'Primary', body, sentCount: 0 });
        }
        break;
      }
      default:
        body = `Generated ${params.contentType} content for ${params.campaign}`;
    }

    const content: GeneratedContent = {
      id: `CONTENT-${Date.now()}`,
      contentType: params.contentType,
      campaign: params.campaign,
      subject,
      body,
      variants,
      targetAudience: params.targetAudience,
      productType: params.productType,
      createdAt: Date.now(),
    };

    this.memory.addNode(NodeType.DOCUMENT, {
      type: 'generated_content', ...content,
    }, this.id, ['content', params.contentType, params.campaign]);

    analyticsLedger.record(MetricType.AGENT_TASK_COMPLETED, 1, this.id, {
      metadata: { contentType: params.contentType, campaign: params.campaign, variants: variants.length },
    });

    this.emit(EventType.CONTENT_CREATED, {
      contentId: content.id,
      contentType: params.contentType,
      campaign: params.campaign,
      targetAudience: params.targetAudience,
      variantCount: variants.length,
    });

    console.log(`[CONTENT] ✍️ Generated ${params.contentType} for ${params.campaign} | ${variants.length} variants | Audience: ${params.targetAudience}`);

    return content;
  }

  private interpolate(template: string, vars: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || `{{${key}}}`);
    }
    // Fill in defaults for common vars
    result = result.replace(/\{\{agentName\}\}/g, 'Gaetano');
    result = result.replace(/\{\{phone\}\}/g, '(555) 123-4567');
    result = result.replace(/\{\{email\}\}/g, 'gaetano@gcfinsurance.com');
    return result;
  }
}
