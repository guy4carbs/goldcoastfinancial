/**
 * REPUTATION_AGENT
 * Review solicitation, sentiment monitoring, response generation,
 * rating tracking. Emits REPUTATION_EVENT.
 */

import {
  BaseAgent, EventType, AgentEvent,
  memoryGraph, NodeType,
  analyticsLedger, MetricType,
  securityLayer, Permission,
} from '../core';

interface ReviewRecord {
  id: string;
  platform: string;
  rating: number; // 1-5
  reviewText: string;
  reviewerName?: string;
  clientId?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  responseGenerated: boolean;
  suggestedResponse?: string;
  createdAt: number;
  respondedAt?: number;
}

interface ReputationMetrics {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  sentimentBreakdown: Record<string, number>;
  platformBreakdown: Record<string, { count: number; avgRating: number }>;
  recentTrend: 'improving' | 'stable' | 'declining';
  responseRate: number;
  avgResponseTimeHours: number;
}

const REVIEW_SOLICITATION_DELAY_DAYS = 14;
const MIN_SOLICITATION_INTERVAL_DAYS = 90;

const RESPONSE_TEMPLATES = {
  positive: [
    `Thank you so much for your kind words, {{name}}! It's truly an honor to help protect families like yours. Your trust means the world to us. 🙏`,
    `Wow, {{name}} — thank you! Reviews like this are why we do what we do. We're always here for you and your family.`,
  ],
  neutral: [
    `Thank you for your feedback, {{name}}. We appreciate you taking the time to share your experience. If there's anything we can do to improve, please don't hesitate to reach out.`,
  ],
  negative: [
    `{{name}}, I'm sorry to hear about your experience. This isn't the standard we hold ourselves to. I'd like to personally address your concerns — please contact me directly at (555) 123-4567 so we can make this right.`,
    `Thank you for sharing this, {{name}}. We take all feedback seriously. I'd like the opportunity to resolve this personally. Please reach out to me at gaetano@gcfinsurance.com.`,
  ],
};

export class ReputationAgent extends BaseAgent {
  private monitorInterval: NodeJS.Timeout | null = null;

  constructor() {
    super({
      id: 'reputation',
      name: 'REPUTATION_AGENT',
      tier: 8,
      description: 'Review solicitation, sentiment monitoring, response generation, rating tracking',
      capabilities: ['review_solicitation', 'sentiment_monitoring', 'response_generation', 'rating_tracking'],
      consumesEvents: [EventType.POLICY_SOLD, EventType.SUPPORT_RESOLVED],
      producesEvents: [EventType.REPUTATION_EVENT],
    });
  }

  protected async onStart(): Promise<void> {
    securityLayer.registerAgent(this.id, [Permission.READ_CLIENTS, Permission.SEND_EMAIL]);
    this.monitorInterval = setInterval(() => this.checkForSolicitations(), 24 * 60 * 60 * 1000);
  }

  protected async onStop(): Promise<void> {
    if (this.monitorInterval) { clearInterval(this.monitorInterval); this.monitorInterval = null; }
  }

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.POLICY_SOLD) {
      // Schedule review solicitation
      this.scheduleReviewRequest(event.payload.leadId, 'policy_sale');
    } else if (event.type === EventType.SUPPORT_RESOLVED) {
      if (event.payload.resolution !== 'faq_auto_response') {
        this.scheduleReviewRequest(event.payload.clientId, 'support_resolved');
      }
    }
  }

  private scheduleReviewRequest(clientId: string, trigger: string): void {
    const requestDate = Date.now() + REVIEW_SOLICITATION_DELAY_DAYS * 24 * 60 * 60 * 1000;

    this.memory.addNode(NodeType.TASK, {
      type: 'review_solicitation',
      clientId,
      trigger,
      scheduledFor: requestDate,
      status: 'scheduled',
    }, this.id, ['review_request']);

    console.log(`[REPUTATION] 📅 Review request scheduled for client ${clientId} in ${REVIEW_SOLICITATION_DELAY_DAYS} days`);
  }

  async processReview(params: {
    platform: string; rating: number; reviewText: string;
    reviewerName?: string; clientId?: string;
  }): Promise<ReviewRecord> {
    const sentiment = params.rating >= 4 ? 'positive' : params.rating >= 3 ? 'neutral' : 'negative';

    const templates = RESPONSE_TEMPLATES[sentiment];
    const template = templates[Math.floor(Math.random() * templates.length)];
    const suggestedResponse = template.replace(/\{\{name\}\}/g, params.reviewerName || 'valued client');

    const review: ReviewRecord = {
      id: `REV-${Date.now()}`,
      platform: params.platform,
      rating: params.rating,
      reviewText: params.reviewText,
      reviewerName: params.reviewerName,
      clientId: params.clientId,
      sentiment,
      responseGenerated: true,
      suggestedResponse,
      createdAt: Date.now(),
    };

    this.memory.addNode(NodeType.DOCUMENT, {
      type: 'review', ...review,
    }, this.id, ['review', params.platform, sentiment]);

    this.emit(EventType.REPUTATION_EVENT, {
      reviewId: review.id,
      platform: params.platform,
      rating: params.rating,
      sentiment,
      requiresResponse: sentiment === 'negative',
      suggestedResponse,
    }, {
      metadata: { tier: 8, priority: sentiment === 'negative' ? 'high' : 'low' },
    });

    if (sentiment === 'negative') {
      this.emit(EventType.HUMAN_REQUIRED, {
        type: 'negative_review',
        reviewId: review.id,
        platform: params.platform,
        rating: params.rating,
        reviewText: params.reviewText,
        reason: `Negative ${params.rating}-star review on ${params.platform} requires attention`,
        suggestedResponse,
        priority: 'high',
      });
    }

    console.log(`[REPUTATION] ⭐ ${params.rating}/5 on ${params.platform} | ${sentiment} | Response generated`);
    return review;
  }

  getReputationMetrics(): ReputationMetrics {
    const reviews = this.memory.getNodesByType(NodeType.DOCUMENT)
      .filter(n => n.data.type === 'review');

    const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const sentimentBreak: Record<string, number> = { positive: 0, neutral: 0, negative: 0 };
    const platforms: Record<string, { total: number; sum: number }> = {};
    let totalRating = 0;
    let responded = 0;
    let totalResponseTime = 0;

    for (const r of reviews) {
      const data = r.data as ReviewRecord;
      ratingDist[data.rating] = (ratingDist[data.rating] || 0) + 1;
      sentimentBreak[data.sentiment]++;
      totalRating += data.rating;

      if (!platforms[data.platform]) platforms[data.platform] = { total: 0, sum: 0 };
      platforms[data.platform].total++;
      platforms[data.platform].sum += data.rating;

      if (data.respondedAt) {
        responded++;
        totalResponseTime += data.respondedAt - data.createdAt;
      }
    }

    const total = reviews.length;
    const avg = total > 0 ? totalRating / total : 0;

    // Trend: compare last 30 days vs prior 30 days
    const now = Date.now();
    const recent = reviews.filter(r => now - r.createdAt < 30 * 24 * 60 * 60 * 1000);
    const prior = reviews.filter(r => {
      const age = now - r.createdAt;
      return age >= 30 * 24 * 60 * 60 * 1000 && age < 60 * 24 * 60 * 60 * 1000;
    });

    const recentAvg = recent.length > 0 ? recent.reduce((s, r) => s + r.data.rating, 0) / recent.length : avg;
    const priorAvg = prior.length > 0 ? prior.reduce((s, r) => s + r.data.rating, 0) / prior.length : avg;
    const trend = recentAvg > priorAvg + 0.2 ? 'improving' : recentAvg < priorAvg - 0.2 ? 'declining' : 'stable';

    return {
      averageRating: Math.round(avg * 100) / 100,
      totalReviews: total,
      ratingDistribution: ratingDist,
      sentimentBreakdown: sentimentBreak,
      platformBreakdown: Object.fromEntries(
        Object.entries(platforms).map(([k, v]) => [k, { count: v.total, avgRating: Math.round(v.sum / v.total * 100) / 100 }])
      ),
      recentTrend: trend,
      responseRate: total > 0 ? Math.round(responded / total * 100) : 0,
      avgResponseTimeHours: responded > 0 ? Math.round(totalResponseTime / responded / 3600000 * 10) / 10 : 0,
    };
  }

  private async checkForSolicitations(): Promise<void> {
    const tasks = this.memory.getNodesByType(NodeType.TASK)
      .filter(n => n.data.type === 'review_solicitation' && n.data.status === 'scheduled' && n.data.scheduledFor <= Date.now());

    for (const task of tasks) {
      this.memory.updateNode(task.id, { status: 'sent' }, this.id);
      this.emit(EventType.REPUTATION_EVENT, {
        type: 'solicitation_sent',
        clientId: task.data.clientId,
        trigger: task.data.trigger,
      });
      console.log(`[REPUTATION] 📧 Review solicitation sent to client ${task.data.clientId}`);
    }
  }
}
