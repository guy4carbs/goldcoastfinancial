/**
 * HUMAN_ESCALATION_AGENT
 * Escalation rules, priority scoring, routing to appropriate humans,
 * context packaging. Emits HUMAN_REQUIRED.
 */

import {
  BaseAgent, EventType, AgentEvent,
  memoryGraph, NodeType, EdgeType,
  analyticsLedger, MetricType,
  securityLayer, Permission,
} from '../core';

type EscalationPriority = 'low' | 'medium' | 'high' | 'critical' | 'emergency';
type EscalationStatus = 'pending' | 'acknowledged' | 'in_progress' | 'resolved' | 'expired';

interface EscalationTicket {
  id: string;
  type: string;
  priority: EscalationPriority;
  priorityScore: number; // 0-100
  assignedTo: string;
  source: string;
  clientId?: string;
  reason: string;
  context: Record<string, any>;
  status: EscalationStatus;
  createdAt: number;
  acknowledgedAt?: number;
  resolvedAt?: number;
  slaDeadline: number;
  notificationsSent: number;
}

interface HumanContact {
  id: string;
  name: string;
  role: string;
  channels: { email?: string; phone?: string; sms?: string };
  handles: string[]; // What types they handle
  available: boolean;
  maxLoad: number;
  currentLoad: number;
}

const ESCALATION_SLA_HOURS: Record<EscalationPriority, number> = {
  emergency: 0.25, // 15 minutes
  critical: 1,
  high: 4,
  medium: 24,
  low: 72,
};

// Priority scoring weights
const PRIORITY_WEIGHTS: Record<string, number> = {
  death_claim: 100,
  system_down: 95,
  agent_failure: 85,
  negative_review: 70,
  compliance_violation: 80,
  angry_customer: 75,
  sla_breach: 65,
  lapsed_policy: 60,
  payment_failure: 50,
  general_inquiry: 20,
};

export class HumanEscalationAgent extends BaseAgent {
  private escalationQueue: Map<string, EscalationTicket> = new Map();
  private humanContacts: HumanContact[] = [];
  private slaCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    super({
      id: 'human-escalation',
      name: 'HUMAN_ESCALATION_AGENT',
      tier: 10,
      description: 'Escalation rules, priority scoring, human routing, context packaging',
      capabilities: ['escalation_rules', 'priority_scoring', 'human_routing', 'context_packaging'],
      consumesEvents: [EventType.HUMAN_REQUIRED, EventType.SECURITY_EVENT, EventType.COMPLIANCE_BLOCKED],
      producesEvents: [EventType.HUMAN_REQUIRED],
    });
  }

  protected async onStart(): Promise<void> {
    securityLayer.registerAgent(this.id, [Permission.ADMIN, Permission.SEND_EMAIL, Permission.SEND_SMS]);

    // Default human contacts
    this.humanContacts = [
      {
        id: 'gaetano', name: 'Gaetano', role: 'agency_owner',
        channels: { email: 'gaetano@gcfinsurance.com', phone: '5551234567' },
        handles: ['death_claim', 'system_down', 'compliance_violation', 'angry_customer', 'agent_failure'],
        available: true, maxLoad: 20, currentLoad: 0,
      },
      {
        id: 'support-lead', name: 'Support Lead', role: 'support_manager',
        channels: { email: 'support@gcfinsurance.com' },
        handles: ['sla_breach', 'general_inquiry', 'negative_review', 'payment_failure'],
        available: true, maxLoad: 30, currentLoad: 0,
      },
    ];

    this.slaCheckInterval = setInterval(() => this.checkSLAs(), 5 * 60 * 1000);
  }

  protected async onStop(): Promise<void> {
    if (this.slaCheckInterval) { clearInterval(this.slaCheckInterval); this.slaCheckInterval = null; }
  }

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.HUMAN_REQUIRED) {
      await this.processEscalation(event.payload, event.source);
    } else if (event.type === EventType.SECURITY_EVENT) {
      if (event.payload.severity === 'critical') {
        await this.processEscalation({
          type: 'security_incident',
          reason: event.payload.description,
          priority: 'critical',
          context: event.payload,
        }, event.source);
      }
    } else if (event.type === EventType.COMPLIANCE_BLOCKED) {
      await this.processEscalation({
        type: 'compliance_violation',
        reason: event.payload.reason,
        priority: 'high',
        context: event.payload,
        clientId: event.payload.clientId,
      }, event.source);
    }
  }

  private async processEscalation(payload: any, source: string): Promise<void> {
    const type = payload.type || 'general_inquiry';
    const priorityScore = PRIORITY_WEIGHTS[type] || 30;

    const priority: EscalationPriority =
      priorityScore >= 90 ? 'emergency' :
      priorityScore >= 70 ? 'critical' :
      priorityScore >= 50 ? 'high' :
      priorityScore >= 30 ? 'medium' : 'low';

    // Find best human to route to
    const assignee = this.routeToHuman(type, priority);

    // Package context
    const context = await this.packageContext(payload);

    const ticket: EscalationTicket = {
      id: `ESC-${Date.now()}`,
      type,
      priority,
      priorityScore,
      assignedTo: assignee.name,
      source,
      clientId: payload.clientId,
      reason: payload.reason || `${type} escalation`,
      context,
      status: 'pending',
      createdAt: Date.now(),
      slaDeadline: Date.now() + ESCALATION_SLA_HOURS[priority] * 3600000,
      notificationsSent: 0,
    };

    this.escalationQueue.set(ticket.id, ticket);
    assignee.currentLoad++;

    // Store in memory graph
    const node = this.memory.addNode(NodeType.TASK, {
      ...ticket, type: 'escalation',
    }, this.id, ['escalation', type, priority]);

    if (payload.clientId) {
      this.memory.addEdge(EdgeType.RELATED_TO, payload.clientId, node.id, this.id);
    }

    analyticsLedger.record(MetricType.AGENT_TASK_COMPLETED, 1, this.id, {
      metadata: { escalationType: type, priority, assignedTo: assignee.name },
    });

    // Log notification (in production: send actual email/SMS/push)
    console.log(`[ESCALATION] 🔔 ${priority.toUpperCase()} → ${assignee.name} | ${type}: ${ticket.reason}`);
    console.log(`[ESCALATION]    SLA: ${ESCALATION_SLA_HOURS[priority]}h | Context keys: ${Object.keys(context).join(', ')}`);

    ticket.notificationsSent++;
  }

  private routeToHuman(type: string, priority: EscalationPriority): HumanContact {
    // Find available human who handles this type
    const candidates = this.humanContacts.filter(h =>
      h.available && h.currentLoad < h.maxLoad && h.handles.includes(type)
    );

    if (candidates.length > 0) {
      // Route to least loaded
      candidates.sort((a, b) => a.currentLoad - b.currentLoad);
      return candidates[0];
    }

    // Emergency/critical always goes to agency owner
    if (priority === 'emergency' || priority === 'critical') {
      return this.humanContacts[0]; // Gaetano
    }

    // Default to first available
    return this.humanContacts.find(h => h.available) || this.humanContacts[0];
  }

  private async packageContext(payload: any): Promise<Record<string, any>> {
    const context: Record<string, any> = { ...payload };

    // Enrich with client data if available
    if (payload.clientId) {
      const clientNode = this.memory.getNode(payload.clientId);
      if (clientNode) {
        context.clientInfo = {
          name: `${clientNode.data.firstName} ${clientNode.data.lastName}`,
          email: clientNode.data.email,
          phone: clientNode.data.phone,
          stage: clientNode.data.stage,
        };

        // Get related policies
        const policies = this.memory.getRelated(payload.clientId, EdgeType.HAS_POLICY);
        if (policies.length > 0) {
          context.policies = policies.map(p => ({
            type: p.data.type, carrier: p.data.carrier,
            coverage: p.data.coverageAmount, status: p.data.status,
          }));
        }
      }
    }

    // Add system context
    context.systemTime = new Date().toISOString();
    context.escalationSource = payload.source || 'unknown';

    return context;
  }

  private async checkSLAs(): Promise<void> {
    const now = Date.now();
    for (const [id, ticket] of Array.from(this.escalationQueue.entries())) {
      if (ticket.status === 'pending' && now > ticket.slaDeadline) {
        // SLA breached — re-escalate
        if (ticket.notificationsSent < 3) {
          ticket.notificationsSent++;
          console.warn(`[ESCALATION] 🚨 SLA BREACH: ${ticket.id} | ${ticket.type} | Assigned: ${ticket.assignedTo} | Overdue by ${Math.round((now - ticket.slaDeadline) / 60000)}min`);

          // Escalate to agency owner if not already
          if (ticket.assignedTo !== 'Gaetano') {
            ticket.assignedTo = 'Gaetano';
            console.warn(`[ESCALATION] ⬆️ Re-escalated to Gaetano`);
          }
        }
      }
    }
  }

  resolveEscalation(ticketId: string, resolution?: string): void {
    const ticket = this.escalationQueue.get(ticketId);
    if (!ticket) return;

    ticket.status = 'resolved';
    ticket.resolvedAt = Date.now();

    const assignee = this.humanContacts.find(h => h.name === ticket.assignedTo);
    if (assignee) assignee.currentLoad = Math.max(0, assignee.currentLoad - 1);

    console.log(`[ESCALATION] ✅ Resolved: ${ticketId} | ${ticket.type}`);
  }

  getPendingEscalations(): EscalationTicket[] {
    return Array.from(this.escalationQueue.values()).filter(t => t.status === 'pending');
  }
}
