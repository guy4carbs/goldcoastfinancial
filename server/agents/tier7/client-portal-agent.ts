/**
 * CLIENT_PORTAL_AGENT
 * Client dashboard data, document access, policy summary generation,
 * self-service actions.
 */

import {
  BaseAgent, EventType, AgentEvent,
  memoryGraph, NodeType, EdgeType, ClientData, PolicyData,
  securityLayer, Permission,
} from '../core';

interface PortalSession {
  clientId: string;
  action: string;
  timestamp: number;
  result: any;
}

interface PolicySummary {
  policyId: string;
  type: string;
  carrier: string;
  coverageAmount: number;
  premium: number;
  premiumFrequency: string;
  status: string;
  effectiveDate?: string;
}

interface ClientDashboard {
  clientId: string;
  name: string;
  email?: string;
  totalCoverage: number;
  monthlyPremium: number;
  policies: PolicySummary[];
  recentDocuments: Array<{ id: string; name: string; date: number }>;
  pendingActions: string[];
  nextPaymentDate?: number;
  agentContact: { name: string; phone: string; email: string };
}

export class ClientPortalAgent extends BaseAgent {
  constructor() {
    super({
      id: 'client-portal',
      name: 'CLIENT_PORTAL_AGENT',
      tier: 7,
      description: 'Client dashboard data, document access, policy summaries, self-service',
      capabilities: ['dashboard_data', 'document_access', 'policy_summary', 'self_service'],
      consumesEvents: [EventType.POLICY_SOLD, EventType.PAYMENT_PROCESSED, EventType.CLAIM_STATUS_UPDATED],
      producesEvents: [],
    });
  }

  protected async onStart(): Promise<void> {
    securityLayer.registerAgent(this.id, [
      Permission.READ_CLIENTS, Permission.READ_POLICIES,
    ]);
  }

  protected async onStop(): Promise<void> {}

  protected async handleEvent(event: AgentEvent): Promise<void> {
    // Update cached dashboard data when relevant events occur
    if (event.type === EventType.POLICY_SOLD) {
      await this.refreshDashboard(event.payload.leadId);
    } else if (event.type === EventType.PAYMENT_PROCESSED) {
      await this.refreshDashboard(event.payload.clientId);
    } else if (event.type === EventType.CLAIM_STATUS_UPDATED) {
      await this.refreshDashboard(event.payload.clientId);
    }
  }

  async getClientDashboard(clientId: string): Promise<ClientDashboard | null> {
    const clientNode = this.memory.getNode<ClientData>(clientId);
    if (!clientNode) return null;

    const client = clientNode.data;
    const policyNodes = this.memory.getRelated(clientId, EdgeType.HAS_POLICY)
      .filter(n => n.type === NodeType.POLICY);

    const policies: PolicySummary[] = policyNodes.map(n => {
      const p = n.data as PolicyData;
      return {
        policyId: n.id,
        type: p.type,
        carrier: p.carrier,
        coverageAmount: p.coverageAmount,
        premium: p.premium,
        premiumFrequency: p.premiumFrequency,
        status: p.status,
        effectiveDate: p.effectiveDate,
      };
    });

    const totalCoverage = policies.reduce((s, p) => s + p.coverageAmount, 0);
    const monthlyPremium = policies.reduce((s, p) => {
      if (p.premiumFrequency === 'monthly') return s + p.premium;
      if (p.premiumFrequency === 'quarterly') return s + p.premium / 3;
      if (p.premiumFrequency === 'annually') return s + p.premium / 12;
      return s + p.premium;
    }, 0);

    // Get recent documents
    const documents = this.memory.getRelated(clientId, EdgeType.RELATED_TO)
      .filter(n => n.type === NodeType.DOCUMENT)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10)
      .map(n => ({ id: n.id, name: n.data.type || 'Document', date: n.createdAt }));

    // Determine pending actions
    const pendingActions: string[] = [];
    const payments = this.memory.getRelated(clientId, EdgeType.HAS_PAYMENT)
      .filter(n => n.data.status === 'retrying' || n.data.status === 'failed');
    if (payments.length > 0) pendingActions.push('Update payment method');

    const apps = this.memory.getRelated(clientId, EdgeType.HAS_APPLICATION)
      .filter(n => n.data.status === 'in_progress' || n.data.status === 'abandoned');
    if (apps.length > 0) pendingActions.push('Complete pending application');

    const claims = this.memory.getRelated(clientId, EdgeType.HAS_CLAIM)
      .filter(n => n.data.status === 'pending_documents');
    if (claims.length > 0) pendingActions.push('Submit claim documentation');

    return {
      clientId,
      name: `${client.firstName} ${client.lastName}`,
      email: client.email,
      totalCoverage,
      monthlyPremium: Math.round(monthlyPremium * 100) / 100,
      policies,
      recentDocuments: documents,
      pendingActions,
      agentContact: {
        name: 'Gaetano Heritage',
        phone: '(555) 123-4567',
        email: 'gaetano@gcfinsurance.com',
      },
    };
  }

  private async refreshDashboard(clientId: string): Promise<void> {
    const dashboard = await this.getClientDashboard(clientId);
    if (dashboard) {
      console.log(`[CLIENT_PORTAL] 📊 Dashboard refreshed for ${dashboard.name} | ${dashboard.policies.length} policies | $${dashboard.totalCoverage.toLocaleString()} coverage`);
    }
  }

  async handleSelfServiceAction(clientId: string, action: string, data?: any): Promise<{ success: boolean; message: string }> {
    const session: PortalSession = { clientId, action, timestamp: Date.now(), result: null };

    switch (action) {
      case 'update_contact': {
        const updated = this.memory.updateNode(clientId, data, this.id);
        session.result = updated ? 'success' : 'not_found';
        return { success: !!updated, message: updated ? 'Contact info updated' : 'Client not found' };
      }
      case 'request_id_cards': {
        this.memory.addNode(NodeType.TASK, {
          type: 'id_card_request', clientId, status: 'pending', requestedAt: Date.now(),
        }, this.id, ['task', 'id_card']);
        return { success: true, message: 'ID cards requested. You will receive them within 2-3 business days.' };
      }
      case 'change_beneficiary': {
        this.memory.addNode(NodeType.TASK, {
          type: 'beneficiary_change', clientId, newBeneficiary: data, status: 'pending_review',
        }, this.id, ['task', 'beneficiary']);
        return { success: true, message: 'Beneficiary change request submitted for review.' };
      }
      case 'download_policy': {
        return { success: true, message: 'Policy document download link generated.' };
      }
      default:
        return { success: false, message: `Unknown action: ${action}` };
    }
  }
}
