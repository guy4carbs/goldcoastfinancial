/**
 * DATA_ENRICHMENT_AGENT
 * Appends phone, email, income estimates, household data.
 * Flags low-quality leads.
 */

import { BaseAgent, EventType, AgentEvent, memoryGraph, LeadData } from '../core';

export class DataEnrichmentAgent extends BaseAgent {
  constructor() {
    super({
      id: 'data-enrichment',
      name: 'DATA_ENRICHMENT_AGENT',
      tier: 1,
      description: 'Enriches raw leads with additional data points',
      capabilities: ['phone_lookup', 'email_verification', 'income_estimation', 'household_data'],
      consumesEvents: [EventType.RAW_LEAD_CREATED],
      producesEvents: [EventType.LEAD_ENRICHED],
    });
  }

  protected async onStart(): Promise<void> {}
  protected async onStop(): Promise<void> {}

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.RAW_LEAD_CREATED) {
      await this.enrichLead(event.payload.leadId, event);
    }
  }

  private async enrichLead(leadId: string, sourceEvent: AgentEvent): Promise<void> {
    const node = this.memory.getNode<LeadData>(leadId);
    if (!node) return;

    const enrichments: Partial<LeadData> = {};
    const qualityFlags: string[] = [];

    // Email validation
    if (node.data.email) {
      const emailValid = this.validateEmail(node.data.email);
      if (!emailValid) qualityFlags.push('invalid_email');
    } else {
      qualityFlags.push('missing_email');
    }

    // Phone validation
    if (node.data.phone) {
      const phoneValid = this.validatePhone(node.data.phone);
      if (!phoneValid) qualityFlags.push('invalid_phone');
    } else {
      qualityFlags.push('missing_phone');
    }

    // Income estimation based on zip code
    if (node.data.zipCode) {
      enrichments.income = this.estimateIncome(node.data.zipCode);
    }

    // Age calculation
    if (node.data.dateOfBirth) {
      const age = this.calculateAge(node.data.dateOfBirth);
      enrichments.customFields = {
        ...node.data.customFields,
        estimatedAge: age,
        ageGroup: age < 30 ? 'young' : age < 50 ? 'middle' : age < 65 ? 'pre-senior' : 'senior',
      };
    }

    // Quality score
    const qualityScore = this.calculateQualityScore(node.data, qualityFlags);
    enrichments.tags = [...(node.data.tags || []), ...qualityFlags];

    if (qualityScore < 30) {
      enrichments.tags.push('low_quality');
    }

    // Update node
    this.memory.updateNode(leadId, enrichments, this.id);

    // Emit
    this.emit(EventType.LEAD_ENRICHED, {
      leadId,
      enrichments,
      qualityFlags,
      qualityScore,
    }, {
      correlationId: sourceEvent.correlationId || sourceEvent.id,
      causationId: sourceEvent.id,
    });

    console.log(`[DATA_ENRICHMENT] 📊 Enriched lead ${leadId} | Quality: ${qualityScore}/100 | Flags: ${qualityFlags.join(', ') || 'none'}`);
  }

  private validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private validatePhone(phone: string): boolean {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 11;
  }

  private estimateIncome(zipCode: string): number {
    // Simplified — in production, this would call a data API
    const zipNum = parseInt(zipCode.substring(0, 3));
    if (zipNum >= 100 && zipNum <= 199) return 75000;  // Northeast
    if (zipNum >= 200 && zipNum <= 299) return 65000;  // Mid-Atlantic
    if (zipNum >= 300 && zipNum <= 399) return 55000;  // Southeast
    if (zipNum >= 400 && zipNum <= 499) return 60000;  // Midwest
    if (zipNum >= 500 && zipNum <= 599) return 58000;  // Central
    if (zipNum >= 600 && zipNum <= 699) return 62000;  // Central
    if (zipNum >= 700 && zipNum <= 799) return 52000;  // South
    if (zipNum >= 800 && zipNum <= 899) return 65000;  // Mountain
    if (zipNum >= 900 && zipNum <= 999) return 72000;  // West Coast
    return 55000;
  }

  private calculateAge(dateOfBirth: string): number {
    const dob = new Date(dateOfBirth);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    if (now.getMonth() < dob.getMonth() ||
        (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  private calculateQualityScore(data: LeadData, flags: string[]): number {
    let score = 50; // Baseline
    if (data.email) score += 15;
    if (data.phone) score += 15;
    if (data.dateOfBirth) score += 5;
    if (data.state) score += 5;
    if (data.zipCode) score += 5;
    if (data.coverageType) score += 5;
    flags.forEach(() => (score -= 10));
    return Math.max(0, Math.min(100, score));
  }
}
