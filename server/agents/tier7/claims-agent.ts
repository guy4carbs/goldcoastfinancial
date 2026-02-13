/**
 * CLAIMS_AGENT
 * Claim intake, documentation requirements, carrier routing,
 * status tracking, timeline management. Emits CLAIM_STATUS_UPDATED.
 */

import {
  BaseAgent, EventType, AgentEvent,
  memoryGraph, NodeType, EdgeType, PolicyData,
  analyticsLedger, MetricType,
  securityLayer, Permission,
} from '../core';

type ClaimType = 'death' | 'accelerated_benefit' | 'terminal_illness' | 'disability' | 'accidental_death';
type ClaimStatus = 'intake' | 'pending_documents' | 'under_review' | 'carrier_submitted' | 'approved' | 'denied' | 'paid';

interface ClaimRecord {
  claimId: string;
  clientId: string;
  policyId: string;
  carrier: string;
  claimType: ClaimType;
  status: ClaimStatus;
  claimAmount: number;
  filedAt: number;
  lastUpdatedAt: number;
  requiredDocuments: DocumentRequirement[];
  submittedDocuments: string[];
  carrierClaimNumber?: string;
  estimatedResolutionDate: number;
  timeline: TimelineEntry[];
  assignedAdjuster?: string;
  notes: string[];
}

interface DocumentRequirement {
  name: string;
  description: string;
  required: boolean;
  submitted: boolean;
}

interface TimelineEntry {
  date: number;
  event: string;
  details?: string;
}

const REQUIRED_DOCUMENTS: Record<ClaimType, DocumentRequirement[]> = {
  death: [
    { name: 'Death Certificate', description: 'Certified copy of death certificate', required: true, submitted: false },
    { name: 'Claim Form', description: 'Completed carrier claim form', required: true, submitted: false },
    { name: 'Policy Document', description: 'Original policy or copy', required: true, submitted: false },
    { name: 'Claimant ID', description: 'Government-issued photo ID of claimant', required: true, submitted: false },
    { name: 'Beneficiary Proof', description: 'Proof of beneficiary relationship', required: false, submitted: false },
  ],
  accelerated_benefit: [
    { name: 'Medical Records', description: 'Recent medical records and diagnosis', required: true, submitted: false },
    { name: 'Physician Statement', description: 'Attending physician statement', required: true, submitted: false },
    { name: 'Claim Form', description: 'Accelerated benefit claim form', required: true, submitted: false },
  ],
  terminal_illness: [
    { name: 'Terminal Diagnosis', description: 'Certification of terminal illness (12 months or less)', required: true, submitted: false },
    { name: 'Medical Records', description: 'Complete medical records', required: true, submitted: false },
    { name: 'Claim Form', description: 'Terminal illness benefit claim form', required: true, submitted: false },
  ],
  disability: [
    { name: 'Disability Certification', description: 'Physician certification of disability', required: true, submitted: false },
    { name: 'Employer Statement', description: 'Employer statement of disability', required: true, submitted: false },
    { name: 'Claim Form', description: 'Disability claim form', required: true, submitted: false },
  ],
  accidental_death: [
    { name: 'Death Certificate', description: 'Certified death certificate showing accidental cause', required: true, submitted: false },
    { name: 'Police Report', description: 'Accident/police report', required: true, submitted: false },
    { name: 'Autopsy Report', description: 'Autopsy report if performed', required: false, submitted: false },
    { name: 'Claim Form', description: 'Accidental death claim form', required: true, submitted: false },
  ],
};

// Average carrier processing times in days
const CARRIER_PROCESSING_DAYS: Record<string, number> = {
  'mutual-of-omaha': 14, 'aig': 21, 'nationwide': 18,
  'transamerica': 16, 'default': 30,
};

export class ClaimsAgent extends BaseAgent {
  private statusCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    super({
      id: 'claims',
      name: 'CLAIMS_AGENT',
      tier: 7,
      description: 'Claim intake, documentation, carrier routing, status tracking',
      capabilities: ['claim_intake', 'document_tracking', 'carrier_routing', 'status_tracking', 'timeline_management'],
      consumesEvents: [EventType.POLICY_SOLD, EventType.PAYMENT_PROCESSED],
      producesEvents: [EventType.CLAIM_STATUS_UPDATED],
    });
  }

  protected async onStart(): Promise<void> {
    securityLayer.registerAgent(this.id, [
      Permission.READ_CLIENTS, Permission.READ_POLICIES, Permission.WRITE_CLIENTS,
    ]);
    this.statusCheckInterval = setInterval(() => this.checkPendingClaims(), 60 * 60 * 1000);
  }

  protected async onStop(): Promise<void> {
    if (this.statusCheckInterval) { clearInterval(this.statusCheckInterval); this.statusCheckInterval = null; }
  }

  protected async handleEvent(event: AgentEvent): Promise<void> {
    // Claims agent primarily responds to direct API calls, but listens for
    // payment lapses that might affect claim eligibility
    if (event.type === EventType.PAYMENT_PROCESSED && event.payload.status === 'lapsed') {
      await this.flagPolicyLapse(event.payload.clientId, event.payload.policyId);
    }
  }

  async fileClaim(params: {
    clientId: string; policyId: string; claimType: ClaimType; description?: string;
  }): Promise<ClaimRecord> {
    const policyNode = this.memory.getNode<PolicyData>(params.policyId);
    const carrier = policyNode?.data.carrier || 'default';
    const coverageAmount = policyNode?.data.coverageAmount || 0;

    const processingDays = CARRIER_PROCESSING_DAYS[carrier.toLowerCase().replace(/\s+/g, '-')] || CARRIER_PROCESSING_DAYS.default;

    const claim: ClaimRecord = {
      claimId: `CLM-${Date.now()}`,
      clientId: params.clientId,
      policyId: params.policyId,
      carrier,
      claimType: params.claimType,
      status: 'intake',
      claimAmount: coverageAmount,
      filedAt: Date.now(),
      lastUpdatedAt: Date.now(),
      requiredDocuments: REQUIRED_DOCUMENTS[params.claimType].map(d => ({ ...d })),
      submittedDocuments: [],
      estimatedResolutionDate: Date.now() + processingDays * 24 * 60 * 60 * 1000,
      timeline: [{ date: Date.now(), event: 'Claim filed', details: params.description }],
      notes: [],
    };

    const claimNode = this.memory.addNode(NodeType.CLAIM, claim, this.id, [
      'claim', params.claimType, carrier,
    ]);
    this.memory.addEdge(EdgeType.HAS_CLAIM, params.clientId, claimNode.id, this.id);

    // Move to pending_documents
    claim.status = 'pending_documents';
    claim.timeline.push({ date: Date.now(), event: 'Awaiting required documents' });
    this.memory.updateNode(claimNode.id, claim, this.id);

    this.emit(EventType.CLAIM_STATUS_UPDATED, {
      claimId: claim.claimId, nodeId: claimNode.id,
      clientId: params.clientId, policyId: params.policyId,
      claimType: params.claimType, status: claim.status,
      requiredDocuments: claim.requiredDocuments.filter(d => d.required && !d.submitted).map(d => d.name),
      estimatedResolutionDate: claim.estimatedResolutionDate,
    });

    console.log(`[CLAIMS] 📋 Claim filed: ${claim.claimId} | ${params.claimType} | $${coverageAmount.toLocaleString()} | ${carrier} | Est. ${processingDays} days`);

    // Auto-escalate for death claims
    if (params.claimType === 'death') {
      this.emit(EventType.HUMAN_REQUIRED, {
        claimId: claim.claimId, clientId: params.clientId,
        reason: 'Death claim requires immediate personal attention',
        priority: 'critical',
        context: { claimType: 'death', carrier, coverageAmount },
      }, { metadata: { tier: 7, priority: 'critical' } });
    }

    return claim;
  }

  async submitDocument(claimNodeId: string, documentName: string): Promise<void> {
    const node = this.memory.getNode<ClaimRecord>(claimNodeId);
    if (!node) return;

    const claim = node.data;
    const doc = claim.requiredDocuments.find(d => d.name === documentName);
    if (doc) doc.submitted = true;
    claim.submittedDocuments.push(documentName);
    claim.timeline.push({ date: Date.now(), event: `Document submitted: ${documentName}` });

    // Check if all required docs are in
    const allRequired = claim.requiredDocuments.filter(d => d.required);
    const allSubmitted = allRequired.every(d => d.submitted);

    if (allSubmitted) {
      claim.status = 'under_review';
      claim.timeline.push({ date: Date.now(), event: 'All required documents received — under review' });
    }

    claim.lastUpdatedAt = Date.now();
    this.memory.updateNode(claimNodeId, claim, this.id);

    this.emit(EventType.CLAIM_STATUS_UPDATED, {
      claimId: claim.claimId, nodeId: claimNodeId,
      clientId: claim.clientId, status: claim.status,
      documentSubmitted: documentName,
      allDocumentsReceived: allSubmitted,
    });
  }

  private async flagPolicyLapse(clientId: string, policyId: string): Promise<void> {
    const claims = this.memory.getNodesByType<ClaimRecord>(NodeType.CLAIM)
      .filter(n => n.data.clientId === clientId && n.data.status !== 'paid' && n.data.status !== 'denied');

    for (const claim of claims) {
      claim.data.notes.push(`WARNING: Policy ${policyId} has lapsed. Claim eligibility may be affected.`);
      claim.data.timeline.push({ date: Date.now(), event: 'Policy lapse detected — eligibility review needed' });
      this.memory.updateNode(claim.id, claim.data, this.id);

      this.emit(EventType.CLAIM_STATUS_UPDATED, {
        claimId: claim.data.claimId, nodeId: claim.id,
        clientId, status: claim.data.status, warning: 'policy_lapsed',
      }, { metadata: { tier: 7, priority: 'high' } });
    }
  }

  private async checkPendingClaims(): Promise<void> {
    const claims = this.memory.getNodesByType<ClaimRecord>(NodeType.CLAIM)
      .filter(n => n.data.status === 'under_review' || n.data.status === 'carrier_submitted');

    const now = Date.now();
    for (const claim of claims) {
      const daysPending = (now - claim.data.filedAt) / (24 * 60 * 60 * 1000);
      if (daysPending > 45) {
        this.emit(EventType.HUMAN_REQUIRED, {
          claimId: claim.data.claimId, clientId: claim.data.clientId,
          reason: `Claim pending ${Math.round(daysPending)} days — follow up with carrier`,
          priority: 'high',
        });
      }
    }
  }
}
