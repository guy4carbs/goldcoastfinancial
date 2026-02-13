/**
 * SOCIAL_POSTING_AGENT
 * Content scheduling, multi-platform posting, optimal timing,
 * hashtag strategy, performance tracking. Emits CONTENT_POSTED.
 */

import {
  BaseAgent, EventType, AgentEvent,
  memoryGraph, NodeType,
  analyticsLedger, MetricType,
  securityLayer, Permission,
} from '../core';

interface ScheduledPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledFor: number;
  status: 'scheduled' | 'posted' | 'failed';
  hashtags: string[];
  mediaUrl?: string;
  campaign?: string;
  performance?: PostPerformance;
}

interface PostPerformance {
  impressions: number;
  engagement: number;
  clicks: number;
  shares: number;
  engagementRate: number;
}

// Optimal posting times by platform (hour of day, EST)
const OPTIMAL_TIMES: Record<string, number[]> = {
  facebook: [9, 11, 13, 15],
  instagram: [8, 11, 14, 17],
  linkedin: [7, 10, 12],
  twitter: [8, 12, 17, 20],
  tiktok: [10, 14, 19],
};

// Day of week multiplier (0=Sunday)
const DAY_MULTIPLIERS = [0.7, 1.0, 1.1, 1.2, 1.0, 0.9, 0.6];

const HASHTAG_STRATEGY: Record<string, string[]> = {
  life_insurance: ['#lifeinsurance', '#protectyourfamily', '#financialplanning', '#insuranceagent'],
  final_expense: ['#finalexpense', '#seniorlife', '#burialinsurance', '#peacofmind'],
  mortgage: ['#mortgageprotection', '#homeowner', '#protectyourhome', '#mortgage'],
  general: ['#insurance', '#financialfreedom', '#familyfirst', '#heritagecapital'],
  educational: ['#financialliteracy', '#moneytips', '#wealthbuilding', '#retirement'],
};

export class SocialPostingAgent extends BaseAgent {
  private schedulerInterval: NodeJS.Timeout | null = null;

  constructor() {
    super({
      id: 'social-posting',
      name: 'SOCIAL_POSTING_AGENT',
      tier: 8,
      description: 'Multi-platform social media posting, scheduling, and performance tracking',
      capabilities: ['content_scheduling', 'multi_platform', 'optimal_timing', 'hashtag_strategy', 'performance_tracking'],
      consumesEvents: [EventType.CONTENT_CREATED, EventType.COMPLIANCE_APPROVED],
      producesEvents: [EventType.CONTENT_POSTED],
      complianceRequired: true,
    });
  }

  protected async onStart(): Promise<void> {
    securityLayer.registerAgent(this.id, [Permission.READ_CLIENTS]);
    // Check for posts to publish every minute
    this.schedulerInterval = setInterval(() => this.publishScheduledPosts(), 60 * 1000);
  }

  protected async onStop(): Promise<void> {
    if (this.schedulerInterval) { clearInterval(this.schedulerInterval); this.schedulerInterval = null; }
  }

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.CONTENT_CREATED && event.payload.contentType === 'social') {
      await this.schedulePost(event.payload);
    }
  }

  async schedulePost(params: {
    content: string; platforms?: string[]; scheduledFor?: number;
    campaign?: string; category?: string; mediaUrl?: string;
  }): Promise<ScheduledPost> {
    const platforms = params.platforms || ['facebook', 'instagram', 'linkedin'];
    const category = params.campaign || 'general';
    const hashtags = this.generateHashtags(category, params.content);

    // Find optimal posting time if not specified
    const scheduledFor = params.scheduledFor || this.findOptimalTime(platforms[0]);

    const post: ScheduledPost = {
      id: `POST-${Date.now()}`,
      content: this.formatContent(params.content, hashtags),
      platforms,
      scheduledFor,
      status: 'scheduled',
      hashtags,
      mediaUrl: params.mediaUrl,
      campaign: params.campaign,
    };

    this.memory.addNode(NodeType.DOCUMENT, {
      type: 'social_post', ...post,
    }, this.id, ['social', ...platforms, category]);

    const scheduledDate = new Date(scheduledFor);
    console.log(`[SOCIAL] 📅 Post scheduled for ${scheduledDate.toLocaleString()} on ${platforms.join(', ')} | ${hashtags.length} hashtags`);

    return post;
  }

  private async publishScheduledPosts(): Promise<void> {
    const posts = this.memory.getNodesByType(NodeType.DOCUMENT)
      .filter(n => n.data.type === 'social_post' && n.data.status === 'scheduled' && n.data.scheduledFor <= Date.now());

    for (const postNode of posts) {
      const post = postNode.data as ScheduledPost;

      // Simulate publishing to each platform
      for (const platform of post.platforms) {
        // In production: call platform APIs (Facebook Graph, Instagram, LinkedIn, etc.)
        console.log(`[SOCIAL] 📤 Publishing to ${platform}: "${post.content.substring(0, 50)}..."`);
      }

      // Update status
      this.memory.updateNode(postNode.id, {
        status: 'posted',
        performance: { impressions: 0, engagement: 0, clicks: 0, shares: 0, engagementRate: 0 },
      }, this.id);

      this.emit(EventType.CONTENT_POSTED, {
        postId: post.id,
        platforms: post.platforms,
        content: post.content.substring(0, 100),
        hashtags: post.hashtags,
        campaign: post.campaign,
        postedAt: Date.now(),
      });

      analyticsLedger.record(MetricType.AGENT_TASK_COMPLETED, 1, this.id, {
        metadata: { platforms: post.platforms, campaign: post.campaign },
      });
    }
  }

  private generateHashtags(category: string, content: string): string[] {
    const base = HASHTAG_STRATEGY[category] || HASHTAG_STRATEGY.general;
    const educational = HASHTAG_STRATEGY.educational;

    // Add category-specific hashtags + 2 general ones
    const tags = [...base.slice(0, 3)];
    if (content.toLowerCase().includes('tip') || content.toLowerCase().includes('learn')) {
      tags.push(educational[0]);
    }
    tags.push('#GCFInsurance');

    // Platform limits: Instagram allows 30, Twitter/LinkedIn prefer 3-5
    return Array.from(new Set(tags)).slice(0, 8);
  }

  private formatContent(content: string, hashtags: string[]): string {
    return `${content}\n\n${hashtags.join(' ')}`;
  }

  private findOptimalTime(platform: string): number {
    const times = OPTIMAL_TIMES[platform] || OPTIMAL_TIMES.facebook;
    const now = new Date();
    const today = now.getDay();
    const dayMultiplier = DAY_MULTIPLIERS[today];

    // Pick the next optimal time slot
    const currentHour = now.getHours();
    let targetHour = times.find(h => h > currentHour);

    if (!targetHour) {
      // Schedule for tomorrow's first optimal time
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(times[0], 0, 0, 0);
      return tomorrow.getTime();
    }

    const target = new Date(now);
    target.setHours(targetHour, Math.floor(Math.random() * 15), 0, 0); // Random offset within 15 min
    return target.getTime();
  }
}
