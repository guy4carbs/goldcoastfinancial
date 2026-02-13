/**
 * APPLICATION_COMPLETION_AGENT
 * Auto-fill insurance applications, resume abandoned apps, form validation,
 * carrier-specific formatting. Emits APPLICATION_SUBMITTED.
 */

import {
  BaseAgent, EventType, AgentEvent,
  memoryGraph, NodeType, EdgeType, LeadData, PolicyData,
  knowledgeBase, analyticsLedger, MetricType,
  securityLayer, Permission,
} from '../core';

interface ApplicationData {
  leadId: string;
  carrier: string;
  productType: string;
  status: 'draft' | 'in_progress' | 'validated' | 'submitted' | 'abandoned';
  fields: Record<string, any>;
  validationErrors: string[];
  startedAt: number;
  lastUpdatedAt: number;
  submittedAt?: number;
  completionPercentage: number;
  abandonedRemindersSent: number;
}

// Carrier-specific field requirements
const CARRIER_FIELD_REQUIREMENTS: Record<string, string[]> = {
  default: [
    'firstName', 'lastName', 'dateOfBirth', 'gender', 'state',
    'streetAddress', 'city', 'zipCode', 'phone', 'email',
    'coverageAmount', 'productType', 'beneficiaryName', 'beneficiaryRelation',
  ],
  'mutual-of-omaha': [
    'firstName', 'lastName', 'dateOfBirth', 'gender', 'state',
    'streetAddress', 'city', 'zipCode', 'phone', 'email',
    'coverageAmount', 'productType', 'beneficiaryName', 'beneficiaryRelation',
    'ssn', 'height', 'weight', 'tobaccoUse', 'healthQuestions',
  ],
  'aig': [
    'firstName', 'lastName', 'dateOfBirth', 'gender', 'state',
    'streetAddress', 'city', 'zipCode', 'phone', 'email',
    'coverageAmount', 'productType', 'beneficiaryName', 'beneficiaryRelation',
    'ssn', 'height', 'weight', 'tobaccoUse', 'occupation', 'income',
    'drivingRecord', 'healthQuestions', 'existingCoverage',
  ],
  'nationwide': [
    'firstName', 'lastName', 'dateOfBirth', 'gender', 'state',
    'streetAddress', 'city', 'zipCode', 'phone', 'email',
    'coverageAmount', 'productType', 'beneficiaryName', 'beneficiaryRelation',
    'ssn', 'height', 'weight', 'tobaccoUse', 'bankAccountInfo',
  ],
};

const ABANDONED_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_ABANDON_REMINDERS = 3;

export class ApplicationCompletionAgent extends BaseAgent {
  private abandonCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    super({
      id: 'application-completion',
      name: 'APPLICATION_COMPLETION_AGENT',
      tier: 5,
      description: 'Auto-fill applications, resume abandoned apps, carrier-specific formatting',
      capabilities: ['auto_fill', 'form_validation', 'carrier_formatting', 'abandon_recovery'],
      consumesEvents: [EventType.POLICY_SOLD, EventType.COMPLIANCE_APPROVED],
      producesEvents: [EventType.APPLICATION_SUBMITTED],
      complianceRequired: true,
    });
  }

  protected async onStart(): Promise<void> {
    securityLayer.registerAgent(this.id, [
      Permission.READ_LEADS, Permission.READ_CLIENTS,
      Permission.WRITE_POLICIES, Permission.READ_POLICIES,
    ]);

    // Check for abandoned applications every 30 minutes
    this.abandonCheckInterval = setInterval(() => this.checkAbandonedApplications(), 30 * 60 * 1000);
  }

  protected async onStop(): Promise<void> {
    if (this.abandonCheckInterval) {
      clearInterval(this.abandonCheckInterval);
      this.abandonCheckInterval = null;
    }
  }

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.POLICY_SOLD) {
      await this.startApplication(event);
    } else if (event.type === EventType.COMPLIANCE_APPROVED) {
      if (event.payload.originalEvent === EventType.APPLICATION_SUBMITTED) {
        console.log(`[APPLICATION_COMPLETION] ✅ Application compliance approved for ${event.payload.source}`);
      }
    }
  }

  private async startApplication(event: AgentEvent): Promise<void> {
    const { leadId, policyType, carrier, coverageAmount, premium } = event.payload;
    const leadNode = this.memory.getNode<LeadData>(leadId);
    if (!leadNode) return;

    const lead = leadNode.data;

    // Auto-fill from lead data
    const fields: Record<string, any> = {
      firstName: lead.firstName,
      lastName: lead.lastName,
      dateOfBirth: lead.dateOfBirth || '',
      email: lead.email || '',
      phone: lead.phone || '',
      streetAddress: lead.streetAddress || '',
      city: lead.city || '',
      state: lead.state || '',
      zipCode: lead.zipCode || '',
      height: lead.height || '',
      weight: lead.weight || '',
      coverageAmount: coverageAmount,
      productType: policyType,
      premium: premium,
      income: lead.income || '',
    };

    // Get carrier-specific required fields
    const carrierKey = carrier?.toLowerCase().replace(/\s+/g, '-') || 'default';
    const requiredFields = CARRIER_FIELD_REQUIREMENTS[carrierKey] || CARRIER_FIELD_REQUIREMENTS.default;

    // Calculate completion percentage
    const filledCount = requiredFields.filter(f => fields[f] && fields[f] !== '').length;
    const completionPercentage = Math.round((filledCount / requiredFields.length) * 100);

    // Validate
    const validationErrors = this.validateApplication(fields, requiredFields, lead.state);

    const appData: ApplicationData = {
      leadId,
      carrier: carrier || 'pending',
      productType: policyType,
      status: validationErrors.length === 0 ? 'validated' : 'in_progress',
      fields,
      validationErrors,
      startedAt: Date.now(),
      lastUpdatedAt: Date.now(),
      completionPercentage,
      abandonedRemindersSent: 0,
    };

    // Store in memory graph
    const appNode = this.memory.addNode(NodeType.APPLICATION, appData, this.id, [
      'application', carrier || 'unknown-carrier', policyType,
    ]);
    this.memory.addEdge(EdgeType.HAS_APPLICATION, leadId, appNode.id, this.id);

    analyticsLedger.record(MetricType.FUNNEL_APPLICATION_STARTED, 1, this.id, { entityId: leadId });

    if (validationErrors.length === 0) {
      await this.submitApplication(appNode.id, appData);
    } else {
      console.log(`[APPLICATION_COMPLETION] 📝 Application started for ${lead.firstName} ${lead.lastName} | ${completionPercentage}% complete | ${validationErrors.length} fields needed`);
    }
  }

  private validateApplication(fields: Record<string, any>, requiredFields: string[], state?: string): string[] {
    const errors: string[] = [];

    for (const field of requiredFields) {
      if (!fields[field] || fields[field] === '') {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Format validations
    if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      errors.push('Invalid email format');
    }
    if (fields.phone && !/^\+?\d{10,}$/.test(fields.phone.replace(/\D/g, ''))) {
      errors.push('Invalid phone format');
    }
    if (fields.zipCode && !/^\d{5}(-\d{4})?$/.test(fields.zipCode)) {
      errors.push('Invalid ZIP code format');
    }
    if (fields.dateOfBirth) {
      const dob = new Date(fields.dateOfBirth);
      const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (age < 18) errors.push('Applicant must be at least 18 years old');
      if (age > 100) errors.push('Invalid date of birth');
    }
    if (fields.coverageAmount && fields.coverageAmount <= 0) {
      errors.push('Coverage amount must be positive');
    }

    // State-specific validations
    if (state) {
      const rules = knowledgeBase.getRulesForState(state);
      const replacementRule = rules.find(r => r.category === 'replacement');
      if (replacementRule && fields.existingCoverage && !fields.replacementFormCompleted) {
        errors.push('Replacement disclosure form required for existing coverage');
      }
    }

    return errors;
  }

  private async submitApplication(appNodeId: string, appData: ApplicationData): Promise<void> {
    // Carrier-specific formatting
    const formattedData = this.formatForCarrier(appData.fields, appData.carrier);

    this.memory.updateNode(appNodeId, {
      ...appData,
      status: 'submitted' as const,
      submittedAt: Date.now(),
      fields: formattedData,
    }, this.id);

    analyticsLedger.record(MetricType.FUNNEL_APPLICATION_SUBMITTED, 1, this.id, {
      entityId: appData.leadId,
      metadata: { carrier: appData.carrier, productType: appData.productType },
    });

    this.emit(EventType.APPLICATION_SUBMITTED, {
      applicationId: appNodeId,
      leadId: appData.leadId,
      carrier: appData.carrier,
      productType: appData.productType,
      coverageAmount: appData.fields.coverageAmount,
      premium: appData.fields.premium,
    }, {
      metadata: { tier: 5, priority: 'high' },
    });

    const leadNode = this.memory.getNode<LeadData>(appData.leadId);
    console.log(`[APPLICATION_COMPLETION] 🎉 Application SUBMITTED for ${leadNode?.data.firstName} ${leadNode?.data.lastName} | ${appData.carrier} | ${appData.productType}`);
  }

  private formatForCarrier(fields: Record<string, any>, carrier: string): Record<string, any> {
    const formatted = { ...fields };

    // Normalize phone to carrier format
    if (formatted.phone) {
      const digits = formatted.phone.replace(/\D/g, '');
      formatted.phone = `(${digits.slice(-10, -7)}) ${digits.slice(-7, -4)}-${digits.slice(-4)}`;
    }

    // Normalize state to 2-letter code
    if (formatted.state && formatted.state.length > 2) {
      const stateMap: Record<string, string> = {
        'texas': 'TX', 'california': 'CA', 'florida': 'FL', 'new york': 'NY',
        'illinois': 'IL', 'ohio': 'OH', 'georgia': 'GA', 'pennsylvania': 'PA',
      };
      formatted.state = stateMap[formatted.state.toLowerCase()] || formatted.state;
    }

    // Date formatting per carrier
    if (formatted.dateOfBirth) {
      const d = new Date(formatted.dateOfBirth);
      if (carrier === 'aig') {
        formatted.dateOfBirth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      } else {
        formatted.dateOfBirth = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
      }
    }

    // Currency formatting
    if (formatted.coverageAmount) {
      formatted.coverageAmountFormatted = new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD', minimumFractionDigits: 0,
      }).format(formatted.coverageAmount);
    }

    return formatted;
  }

  private async checkAbandonedApplications(): Promise<void> {
    const apps = this.memory.getNodesByType<ApplicationData>(NodeType.APPLICATION);
    const now = Date.now();

    for (const app of apps) {
      if (
        (app.data.status === 'draft' || app.data.status === 'in_progress') &&
        now - app.data.lastUpdatedAt > ABANDONED_THRESHOLD_MS &&
        app.data.abandonedRemindersSent < MAX_ABANDON_REMINDERS
      ) {
        this.memory.updateNode(app.id, {
          status: 'abandoned' as const,
          abandonedRemindersSent: app.data.abandonedRemindersSent + 1,
        }, this.id);

        // Trigger re-engagement via event bus
        this.emit(EventType.APPLICATION_SUBMITTED, {
          applicationId: app.id,
          leadId: app.data.leadId,
          status: 'abandoned',
          completionPercentage: app.data.completionPercentage,
          missingFields: app.data.validationErrors,
          reminderNumber: app.data.abandonedRemindersSent + 1,
        }, {
          metadata: { tier: 5, priority: 'normal' },
        });

        console.log(`[APPLICATION_COMPLETION] ⚠️ Abandoned app detected for lead ${app.data.leadId} | ${app.data.completionPercentage}% complete | Reminder #${app.data.abandonedRemindersSent + 1}`);
      }
    }
  }
}
