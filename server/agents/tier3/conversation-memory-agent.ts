/**
 * CONVERSATION_MEMORY_AGENT
 * Cross-channel memory. Injects context into every agent. Prevents repeated questions.
 */

import { BaseAgent, EventType, AgentEvent, memoryGraph, NodeType, EdgeType, ConversationData } from '../core';

export class ConversationMemoryAgent extends BaseAgent {
  constructor() {
    super({
      id: 'conversation-memory',
      name: 'CONVERSATION_MEMORY_AGENT',
      tier: 3,
      description: 'Maintains cross-channel conversation memory',
      capabilities: ['conversation_tracking', 'context_injection', 'dedup_questions'],
      consumesEvents: [
        EventType.CALL_CONNECTED,
        EventType.EMAIL_ENGAGED,
        EventType.SMS_RESPONSE_RECEIVED,
        EventType.SOCIAL_REPLY_RECEIVED,
        EventType.INBOUND_QUALIFIED,
      ],
      producesEvents: [],
    });
  }

  protected async onStart(): Promise<void> {}
  protected async onStop(): Promise<void> {}

  protected async handleEvent(event: AgentEvent): Promise<void> {
    const leadId = event.payload?.leadId;
    if (!leadId) return;

    const channel = this.eventToChannel(event.type);
    const direction = event.type === EventType.INBOUND_QUALIFIED ? 'inbound' : 'outbound';

    await this.recordConversation(leadId, {
      channel,
      direction,
      summary: this.summarizeEvent(event),
      agentId: event.source,
      sentiment: event.payload.sentiment,
    }, event);
  }

  async recordConversation(
    leadId: string,
    data: ConversationData,
    sourceEvent?: AgentEvent
  ): Promise<string> {
    const node = this.memory.addNode(
      NodeType.CONVERSATION,
      {
        ...data,
        timestamp: Date.now(),
      },
      this.id,
      [data.channel, data.direction]
    );

    this.memory.addEdge(EdgeType.HAS_CONVERSATION, leadId, node.id, this.id);

    return node.id;
  }

  getConversationHistory(leadId: string): Array<ConversationData & { timestamp: number }> {
    const edges = this.memory.getEdgesFrom(leadId)
      .filter((e) => e.type === EdgeType.HAS_CONVERSATION);

    return edges
      .map((e) => this.memory.getNode<ConversationData & { timestamp: number }>(e.targetId))
      .filter(Boolean)
      .map((n) => n!.data)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  getContextForAgent(leadId: string): {
    totalInteractions: number;
    channels: string[];
    lastContact: number | null;
    questionsAsked: string[];
    sentiment: string;
    summary: string;
  } {
    const history = this.getConversationHistory(leadId);

    return {
      totalInteractions: history.length,
      channels: Array.from(new Set(history.map((h) => h.channel))),
      lastContact: history.length > 0 ? history[history.length - 1].timestamp : null,
      questionsAsked: history
        .filter((h) => h.summary?.includes('?'))
        .map((h) => h.summary!)
        .slice(-5),
      sentiment: this.aggregateSentiment(history),
      summary: history.length > 0
        ? `${history.length} interactions across ${new Set(history.map((h) => h.channel)).size} channels`
        : 'No prior interactions',
    };
  }

  private eventToChannel(type: EventType): ConversationData['channel'] {
    switch (type) {
      case EventType.CALL_CONNECTED: return 'phone';
      case EventType.EMAIL_ENGAGED: return 'email';
      case EventType.SMS_RESPONSE_RECEIVED: return 'sms';
      case EventType.SOCIAL_REPLY_RECEIVED: return 'social';
      case EventType.INBOUND_QUALIFIED: return 'web';
      default: return 'chat';
    }
  }

  private summarizeEvent(event: AgentEvent): string {
    switch (event.type) {
      case EventType.CALL_CONNECTED: return `Call connected (${event.payload.duration || 'unknown'}s)`;
      case EventType.EMAIL_ENGAGED: return `Email ${event.payload.action || 'interaction'}`;
      case EventType.SMS_RESPONSE_RECEIVED: return `SMS: "${event.payload.message?.substring(0, 100) || ''}"`;
      case EventType.INBOUND_QUALIFIED: return `Inbound qualified (score: ${event.payload.qualification?.score || 'N/A'})`;
      default: return `${event.type} interaction`;
    }
  }

  private aggregateSentiment(history: Array<ConversationData & { timestamp: number }>): string {
    const sentiments = history.map((h) => h.sentiment).filter(Boolean);
    if (sentiments.length === 0) return 'unknown';
    const positive = sentiments.filter((s) => s === 'positive').length;
    const negative = sentiments.filter((s) => s === 'negative').length;
    if (positive > negative) return 'positive';
    if (negative > positive) return 'negative';
    return 'neutral';
  }
}
