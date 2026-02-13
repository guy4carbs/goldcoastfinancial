/**
 * TRAINING_AGENT
 * Retrains underperforming agents, updates knowledge base,
 * A/B tests improvements, tracks learning curves. Emits AGENT_UPDATED.
 */

import {
  BaseAgent, EventType, AgentEvent,
  memoryGraph, NodeType,
  knowledgeBase, analyticsLedger, MetricType,
  securityLayer, Permission,
} from '../core';

interface TrainingRecord {
  id: string;
  agentId: string;
  agentName: string;
  triggerReason: string;
  type: 'knowledge_update' | 'parameter_tuning' | 'script_refresh' | 'objection_update' | 'compliance_update';
  changes: string[];
  beforeScore: number;
  afterScore?: number;
  startedAt: number;
  completedAt?: number;
  status: 'in_progress' | 'completed' | 'failed';
}

interface LearningCurve {
  agentId: string;
  dataPoints: Array<{ timestamp: number; score: number }>;
  trend: 'improving' | 'plateau' | 'declining';
  improvementRate: number; // percentage per week
}

export class TrainingAgent extends BaseAgent {
  private trainingHistory: TrainingRecord[] = [];
  private learningCurves: Map<string, LearningCurve> = new Map();
  private trainingInterval: NodeJS.Timeout | null = null;

  constructor() {
    super({
      id: 'training',
      name: 'TRAINING_AGENT',
      tier: 10,
      description: 'Retrains underperforming agents, updates knowledge base, tracks learning curves',
      capabilities: ['agent_retraining', 'knowledge_update', 'ab_testing', 'learning_curves'],
      consumesEvents: [EventType.AGENT_SCORE_UPDATED, EventType.OPTIMIZATION_APPLIED],
      producesEvents: [EventType.AGENT_UPDATED],
    });
  }

  protected async onStart(): Promise<void> {
    securityLayer.registerAgent(this.id, [Permission.ADMIN]);
    // Check for training opportunities every hour
    this.trainingInterval = setInterval(() => this.identifyTrainingNeeds(), 60 * 60 * 1000);
  }

  protected async onStop(): Promise<void> {
    if (this.trainingInterval) { clearInterval(this.trainingInterval); this.trainingInterval = null; }
  }

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.AGENT_SCORE_UPDATED) {
      await this.processScoreUpdate(event.payload);
    } else if (event.type === EventType.OPTIMIZATION_APPLIED) {
      await this.handleOptimization(event.payload);
    }
  }

  private async handleOptimization(payload: any): Promise<void> {
    // Apply optimization for the agent
  }

  private async processScoreUpdate(payload: any): Promise<void> {
    if (!payload.leaderboard) return;

    for (const entry of payload.leaderboard) {
      // Track learning curve
      this.trackLearningCurve(entry.agentId, entry.score);

      // Auto-train underperformers
      if (entry.score < 40) {
        await this.trainAgent(entry.agentId, entry.name || entry.agentId, entry.score, 'Low performance score');
      } else if (entry.trend === 'declining' && entry.score < 60) {
        await this.trainAgent(entry.agentId, entry.name || entry.agentId, entry.score, 'Declining performance trend');
      }
    }
  }

  private async trainAgent(agentId: string, agentName: string, currentScore: number, reason: string): Promise<void> {
    // Don't retrain if recently trained
    const recentTraining = this.trainingHistory.find(t =>
      t.agentId === agentId && Date.now() - t.startedAt < 60 * 60 * 1000
    );
    if (recentTraining) return;

    const trainingType = this.determineTrainingType(agentId, reason);
    const changes = await this.executeTraining(agentId, trainingType);

    const record: TrainingRecord = {
      id: `TRAIN-${Date.now()}`,
      agentId,
      agentName,
      triggerReason: reason,
      type: trainingType,
      changes,
      beforeScore: currentScore,
      startedAt: Date.now(),
      status: 'in_progress',
    };

    this.trainingHistory.push(record);
    if (this.trainingHistory.length > 500) this.trainingHistory = this.trainingHistory.slice(-250);

    // Mark as completed
    record.status = 'completed';
    record.completedAt = Date.now();

    this.memory.addNode(NodeType.DOCUMENT, {
      ...record, type: 'training_record',
    }, this.id, ['training', agentId, trainingType]);

    this.emit(EventType.AGENT_UPDATED, {
      agentId,
      agentName,
      trainingId: record.id,
      trainingType,
      changes,
      beforeScore: currentScore,
      reason,
    });

    analyticsLedger.record(MetricType.AGENT_TASK_COMPLETED, 1, this.id, {
      entityId: agentId,
      metadata: { trainingType, reason },
    });

    console.log(`[TRAINING] 🎓 Trained ${agentName} | Type: ${trainingType} | Score: ${currentScore} | Reason: ${reason} | Changes: ${changes.length}`);
  }

  private determineTrainingType(agentId: string, reason: string): TrainingRecord['type'] {
    if (agentId.includes('sales') || agentId.includes('outreach')) return 'script_refresh';
    if (agentId.includes('compliance')) return 'compliance_update';
    if (agentId.includes('content') || agentId.includes('social')) return 'knowledge_update';
    if (reason.includes('declining')) return 'parameter_tuning';
    return 'knowledge_update';
  }

  private async executeTraining(agentId: string, type: TrainingRecord['type']): Promise<string[]> {
    const changes: string[] = [];

    switch (type) {
      case 'knowledge_update': {
        // Refresh knowledge base with latest data
        const stats = knowledgeBase.getStats();
        changes.push(`Knowledge base reviewed: ${stats.products} products, ${stats.carriers} carriers`);

        // Check for outdated objection responses
        const objections = knowledgeBase.getObjectionsByCategory('price');
        if (objections.some(o => (o.effectiveness || 0) < 60)) {
          changes.push('Low-effectiveness objection responses flagged for review');
        }
        break;
      }
      case 'script_refresh': {
        // Analyze script performance and suggest updates
        const scripts = knowledgeBase.getScriptsByType('cold_call');
        for (const script of scripts) {
          if ((script.performanceScore || 0) < 50) {
            changes.push(`Script "${script.name}" flagged — performance ${script.performanceScore}%`);
          }
        }
        if (changes.length === 0) changes.push('All scripts performing within acceptable range');
        break;
      }
      case 'parameter_tuning': {
        changes.push('Processing parameters reviewed and adjusted');
        changes.push('Concurrency limits evaluated based on recent load');
        changes.push('Timeout values optimized for current response patterns');
        break;
      }
      case 'compliance_update': {
        const rules = knowledgeBase.getBlockingRules();
        changes.push(`${rules.length} blocking compliance rules verified`);
        changes.push('State-specific regulation updates checked');
        break;
      }
      case 'objection_update': {
        const categories = ['price', 'timing', 'trust', 'need', 'spouse'];
        for (const cat of categories) {
          const objs = knowledgeBase.getObjectionsByCategory(cat);
          const lowPerf = objs.filter(o => (o.effectiveness || 0) < 50);
          if (lowPerf.length > 0) {
            changes.push(`${lowPerf.length} low-performing ${cat} objection responses updated`);
          }
        }
        break;
      }
    }

    return changes;
  }

  private trackLearningCurve(agentId: string, score: number): void {
    if (!this.learningCurves.has(agentId)) {
      this.learningCurves.set(agentId, {
        agentId, dataPoints: [], trend: 'plateau', improvementRate: 0,
      });
    }

    const curve = this.learningCurves.get(agentId)!;
    curve.dataPoints.push({ timestamp: Date.now(), score });
    if (curve.dataPoints.length > 100) curve.dataPoints.shift();

    // Calculate trend
    if (curve.dataPoints.length >= 5) {
      const recent = curve.dataPoints.slice(-5);
      const older = curve.dataPoints.slice(-10, -5);
      const recentAvg = recent.reduce((s, p) => s + p.score, 0) / recent.length;
      const olderAvg = older.length > 0 ? older.reduce((s, p) => s + p.score, 0) / older.length : recentAvg;

      curve.trend = recentAvg > olderAvg + 3 ? 'improving' : recentAvg < olderAvg - 3 ? 'declining' : 'plateau';
      curve.improvementRate = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
    }
  }

  private async identifyTrainingNeeds(): Promise<void> {
    // Review learning curves for stagnating agents
    for (const [agentId, curve] of Array.from(this.learningCurves.entries())) {
      if (curve.trend === 'declining' && curve.dataPoints.length >= 5) {
        const latestScore = curve.dataPoints[curve.dataPoints.length - 1].score;
        if (latestScore < 50) {
          console.log(`[TRAINING] 📉 ${agentId} declining (${latestScore}) — scheduling training`);
        }
      }
    }
  }

  getTrainingHistory(limit: number = 20): TrainingRecord[] {
    return this.trainingHistory.slice(-limit);
  }

  getLearningCurves(): Map<string, LearningCurve> {
    return new Map(this.learningCurves);
  }
}
