/**
 * EventBus → WebSocket Bridge
 * Routes agent events to appropriate WebSocket channels
 */

import { EventType, type AgentEvent, eventBus } from '../agents/core/event-bus';
import { GCFWebSocketServer, Channels, type Channel } from './GCFWebSocketServer';

// =============================================================================
// BRIDGE RULES
// =============================================================================

interface BridgeRule {
  eventType: EventType;
  channels: Channel[];
  transform?: (event: AgentEvent) => any;
}

/**
 * Maps EventBus event types to WebSocket channels
 */
const BRIDGE_RULES: BridgeRule[] = [
  // ─── Agent System Events ───
  {
    eventType: EventType.AGENT_STARTED,
    channels: [Channels.AGENTS, Channels.SYSTEM],
  },
  {
    eventType: EventType.AGENT_STOPPED,
    channels: [Channels.AGENTS, Channels.SYSTEM],
  },
  {
    eventType: EventType.AGENT_ERROR,
    channels: [Channels.AGENTS, Channels.ERRORS, Channels.ALERTS],
  },
  {
    eventType: EventType.AGENT_HEARTBEAT,
    channels: [Channels.AGENTS],
    transform: (event) => ({
      agentId: event.source,
      status: 'active',
      timestamp: event.timestamp,
    }),
  },
  {
    eventType: EventType.AGENT_UPDATED,
    channels: [Channels.AGENTS],
  },

  // ─── Lead Pipeline Events ───
  {
    eventType: EventType.RAW_LEAD_CREATED,
    channels: [Channels.LEADS, Channels.PIPELINE, Channels.MY_LEADS],
    transform: (event) => ({
      type: 'lead_created',
      lead: event.payload,
      timestamp: event.timestamp,
    }),
  },
  {
    eventType: EventType.LEAD_ENRICHED,
    channels: [Channels.LEADS, Channels.PIPELINE],
    transform: (event) => ({
      type: 'lead_enriched',
      leadId: event.payload.leadId,
      enrichedData: event.payload.data,
    }),
  },
  {
    eventType: EventType.LEAD_SCORED,
    channels: [Channels.LEADS, Channels.PIPELINE, Channels.MY_LEADS],
    transform: (event) => ({
      type: 'lead_scored',
      leadId: event.payload.leadId,
      score: event.payload.score,
      tier: event.payload.tier,
    }),
  },

  // ─── Outreach Events ───
  {
    eventType: EventType.CALL_CONNECTED,
    channels: [Channels.LEADS, Channels.MY_LEADS, Channels.COACHING],
  },
  {
    eventType: EventType.CALL_FAILED,
    channels: [Channels.LEADS, Channels.MY_LEADS],
  },
  {
    eventType: EventType.EMAIL_ENGAGED,
    channels: [Channels.LEADS, Channels.CAMPAIGNS],
  },
  {
    eventType: EventType.SMS_RESPONSE_RECEIVED,
    channels: [Channels.LEADS, Channels.MY_LEADS],
  },
  {
    eventType: EventType.SOCIAL_REPLY_RECEIVED,
    channels: [Channels.SOCIAL, Channels.LEADS],
  },

  // ─── Appointment Events ───
  {
    eventType: EventType.APPOINTMENT_BOOKED,
    channels: [Channels.MY_APPOINTMENTS, Channels.PIPELINE, Channels.LEADS],
    transform: (event) => ({
      type: 'appointment_booked',
      appointment: event.payload,
      timestamp: event.timestamp,
    }),
  },

  // ─── Sales Events ───
  {
    eventType: EventType.POLICY_SOLD,
    channels: [Channels.PIPELINE, Channels.REVENUE, Channels.KPIS, Channels.TEAM, Channels.ALERTS],
    transform: (event) => ({
      type: 'sale',
      policy: event.payload,
      timestamp: event.timestamp,
    }),
  },
  {
    eventType: EventType.COACHING_FEEDBACK,
    channels: [Channels.COACHING],
  },

  // ─── Application & Underwriting ───
  {
    eventType: EventType.APPLICATION_SUBMITTED,
    channels: [Channels.PIPELINE, Channels.MY_LEADS],
  },
  {
    eventType: EventType.UNDERWRITING_STATUS,
    channels: [Channels.PIPELINE, Channels.MY_LEADS, Channels.MY_POLICIES],
  },
  {
    eventType: EventType.COMPLIANCE_APPROVED,
    channels: [Channels.COMPLIANCE, Channels.PIPELINE],
  },
  {
    eventType: EventType.COMPLIANCE_BLOCKED,
    channels: [Channels.COMPLIANCE, Channels.ALERTS, Channels.ESCALATIONS],
  },

  // ─── Financial Events ───
  {
    eventType: EventType.PAYMENT_PROCESSED,
    channels: [Channels.REVENUE, Channels.MY_POLICIES],
  },
  {
    eventType: EventType.COMMISSION_CALCULATED,
    channels: [Channels.REVENUE, Channels.KPIS, Channels.TEAM],
    transform: (event) => ({
      type: 'commission',
      agentId: event.payload.agentId,
      amount: event.payload.amount,
      policyId: event.payload.policyId,
    }),
  },
  {
    eventType: EventType.FORECAST_UPDATED,
    channels: [Channels.REVENUE, Channels.KPIS],
  },

  // ─── Hierarchy & Commission Approval Workflow ───
  {
    eventType: EventType.HIERARCHY_REQUEST_CREATED,
    channels: [Channels.TEAM, Channels.NOTIFICATIONS],
    transform: (event) => ({
      type: 'hierarchy_request',
      action: 'created',
      requestId: event.payload.requestId,
      requestType: event.payload.requestType,
      requesterName: event.payload.requesterName,
    }),
  },
  {
    eventType: EventType.HIERARCHY_REQUEST_MANAGER_REVIEWED,
    channels: [Channels.TEAM, Channels.NOTIFICATIONS, Channels.ALERTS],
    transform: (event) => ({
      type: 'hierarchy_request',
      action: 'manager_reviewed',
      requestId: event.payload.requestId,
      status: event.payload.status,
    }),
  },
  {
    eventType: EventType.HIERARCHY_REQUEST_EXECUTIVE_REVIEWED,
    channels: [Channels.TEAM, Channels.NOTIFICATIONS, Channels.KPIS],
    transform: (event) => ({
      type: 'hierarchy_request',
      action: 'executive_reviewed',
      requestId: event.payload.requestId,
      status: event.payload.status,
    }),
  },
  {
    eventType: EventType.HIERARCHY_REQUEST_COMPLETED,
    channels: [Channels.TEAM, Channels.KPIS, Channels.REVENUE],
  },
  {
    eventType: EventType.COMMISSION_LEVEL_CHANGED,
    channels: [Channels.REVENUE, Channels.KPIS, Channels.TEAM],
    transform: (event) => ({
      type: 'commission_level_changed',
      agentId: event.payload.agentId,
      previousLevel: event.payload.previousLevel,
      newLevel: event.payload.newLevel,
    }),
  },

  // ─── Client Lifecycle ───
  {
    eventType: EventType.SUPPORT_RESOLVED,
    channels: [Channels.MY_TICKETS],
  },
  {
    eventType: EventType.CLAIM_STATUS_UPDATED,
    channels: [Channels.MY_CLAIMS, Channels.MY_POLICIES],
  },
  {
    eventType: EventType.CLIENT_RETAINED,
    channels: [Channels.KPIS],
  },

  // ─── Marketing & Content ───
  {
    eventType: EventType.CONTENT_POSTED,
    channels: [Channels.SOCIAL, Channels.CONTENT],
  },
  {
    eventType: EventType.CONTENT_CREATED,
    channels: [Channels.CONTENT],
  },
  {
    eventType: EventType.REPUTATION_EVENT,
    channels: [Channels.REPUTATION, Channels.ALERTS],
  },

  // ─── Analytics Events ───
  {
    eventType: EventType.METRIC_UPDATED,
    channels: [Channels.KPIS],
  },
  {
    eventType: EventType.AGENT_SCORE_UPDATED,
    channels: [Channels.TEAM, Channels.COACHING],
  },
  {
    eventType: EventType.OPTIMIZATION_APPLIED,
    channels: [Channels.SYSTEM, Channels.AGENTS],
  },

  // ─── Governance Events ───
  {
    eventType: EventType.SECURITY_EVENT,
    channels: [Channels.ALERTS, Channels.SYSTEM],
  },
  {
    eventType: EventType.SYSTEM_RECOVERED,
    channels: [Channels.SYSTEM, Channels.ALERTS],
  },
  {
    eventType: EventType.HUMAN_REQUIRED,
    channels: [Channels.ESCALATIONS, Channels.ALERTS, Channels.NOTIFICATIONS],
    transform: (event) => ({
      type: 'escalation',
      reason: event.payload.reason,
      source: event.source,
      leadId: event.payload.leadId,
      priority: event.metadata.priority,
      timestamp: event.timestamp,
    }),
  },

  // ─── Orchestrator ───
  {
    eventType: EventType.ORCHESTRATOR_DIRECTIVE,
    channels: [Channels.AGENTS, Channels.SYSTEM],
  },
  {
    eventType: EventType.COMPLIANCE_VETO,
    channels: [Channels.COMPLIANCE, Channels.ALERTS],
  },
];

// Build lookup map for performance
const RULE_MAP = new Map<EventType, BridgeRule[]>();
for (const rule of BRIDGE_RULES) {
  const existing = RULE_MAP.get(rule.eventType) || [];
  existing.push(rule);
  RULE_MAP.set(rule.eventType, existing);
}

// =============================================================================
// BRIDGE FUNCTION
// =============================================================================

/**
 * Connect the EventBus to the WebSocket server
 */
export function bridgeEventBus(wsServer: GCFWebSocketServer): () => void {
  const subscriptions: Array<{ unsubscribe: () => void }> = [];

  console.log('[EventBridge] Connecting EventBus to WebSocket channels...');

  // Subscribe to all bridged event types
  const eventTypes = Array.from(RULE_MAP.keys());
  for (const eventType of eventTypes) {
    const handler = (event: AgentEvent) => {
      const rules = RULE_MAP.get(eventType);
      if (!rules) return;

      for (const rule of rules) {
        // Transform event if needed
        const data = rule.transform ? rule.transform(event) : {
          eventType: event.type,
          source: event.source,
          payload: event.payload,
          timestamp: event.timestamp,
          metadata: event.metadata,
        };

        // Broadcast to each channel
        for (const channel of rule.channels) {
          try {
            wsServer.broadcast(channel, data);
          } catch (error) {
            console.error(`[EventBridge] Failed to broadcast to ${channel}:`, error);
          }
        }
      }
    };

    // Use eventBus.on() which returns a Subscription with unsubscribe()
    const subscription = eventBus.on(eventType, 'event-bridge', handler);
    subscriptions.push(subscription);
  }

  console.log(`[EventBridge] Bridged ${RULE_MAP.size} event types to WebSocket channels`);

  // Return cleanup function
  return () => {
    subscriptions.forEach((sub) => sub.unsubscribe());
    console.log('[EventBridge] Disconnected from EventBus');
  };
}

// =============================================================================
// MANUAL NOTIFICATION HELPERS
// =============================================================================

/**
 * Send notification to specific user
 */
export function notifyUser(
  wsServer: GCFWebSocketServer,
  userId: string,
  notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
  }
) {
  wsServer.sendToUser(userId, {
    ...notification,
    timestamp: Date.now(),
  }, Channels.NOTIFICATIONS);
}

/**
 * Send alert to admins
 */
export function alertAdmins(
  wsServer: GCFWebSocketServer,
  alert: {
    severity: 'info' | 'warning' | 'error' | 'critical';
    title: string;
    message: string;
    source?: string;
    data?: any;
  }
) {
  wsServer.broadcast(Channels.ALERTS, {
    ...alert,
    timestamp: Date.now(),
  });
}

/**
 * Broadcast pipeline update
 */
export function broadcastPipelineUpdate(
  wsServer: GCFWebSocketServer,
  update: {
    type: 'stage_change' | 'new_lead' | 'lead_lost' | 'lead_won';
    leadId: string;
    stage?: string;
    data?: any;
  }
) {
  wsServer.broadcast(Channels.PIPELINE, {
    ...update,
    timestamp: Date.now(),
  });
}

export default {
  bridgeEventBus,
  notifyUser,
  alertAdmins,
  broadcastPipelineUpdate,
};
