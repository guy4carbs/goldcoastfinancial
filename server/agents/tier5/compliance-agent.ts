/**
 * COMPLIANCE_AGENT — ABSOLUTE AUTHORITY
 * State law enforcement. Script validation. Can VETO any action.
 * If Compliance says no, it's no. Period.
 */

import { BaseAgent, EventType, AgentEvent, knowledgeBase, securityLayer, Permission } from '../core';

export class ComplianceAgent extends BaseAgent {
  constructor() {
    super({
      id: 'compliance',
      name: 'COMPLIANCE_AGENT',
      tier: 5,
      description: 'Absolute authority on regulatory compliance. Can veto any action.',
      capabilities: ['state_law_enforcement', 'script_validation', 'veto_authority', 'audit'],
      consumesEvents: [
        EventType.POLICY_SOLD,
        EventType.APPLICATION_SUBMITTED,
        EventType.CONTENT_CREATED,
        EventType.CONTENT_POSTED,
        EventType.EMAIL_ENGAGED,
      ],
      producesEvents: [EventType.COMPLIANCE_APPROVED, EventType.COMPLIANCE_BLOCKED],
    });
  }

  protected async onStart(): Promise<void> {
    // Also listen to wildcard for compliance-required events
    this.bus.on('*' as any, this.id + '-monitor', (event) => {
      if (event.metadata?.complianceRequired && event.source !== this.id) {
        this.reviewEvent(event);
      }
    });
  }

  protected async onStop(): Promise<void> {}

  protected async handleEvent(event: AgentEvent): Promise<void> {
    await this.reviewEvent(event);
  }

  private async reviewEvent(event: AgentEvent): Promise<void> {
    const violations = this.getComplianceViolations(event);

    if (violations.length > 0) {
      const blocking = violations.filter((v) => v.severity === 'blocking');

      if (blocking.length > 0) {
        // VETO
        this.emit(EventType.COMPLIANCE_BLOCKED, {
          originalEvent: event.type,
          source: event.source,
          targetAgentId: event.source,
          violations: blocking.map((v) => ({
            rule: v.rule,
            action: v.action,
            reference: v.reference,
          })),
          reason: blocking.map((v) => v.rule).join('; '),
        }, {
          metadata: { tier: 5, priority: 'critical' },
        });

        console.warn(`[COMPLIANCE] ⛔ BLOCKED ${event.type} from ${event.source}: ${blocking[0].rule}`);
        return;
      }

      // Warnings — log but don't block
      violations.forEach((v) => {
        console.warn(`[COMPLIANCE] ⚠️ ${v.severity.toUpperCase()}: ${v.rule}`);
      });
    }

    // Approved
    this.emit(EventType.COMPLIANCE_APPROVED, {
      originalEvent: event.type,
      source: event.source,
      warnings: violations.filter((v) => v.severity !== 'blocking').length,
    });
  }

  private getComplianceViolations(event: AgentEvent): Array<{
    rule: string;
    severity: string;
    action: string;
    reference?: string;
  }> {
    const violations: Array<{
      rule: string;
      severity: string;
      action: string;
      reference?: string;
    }> = [];

    const state = event.payload?.state;

    // Get applicable rules
    const rules = state
      ? knowledgeBase.getRulesForState(state)
      : knowledgeBase.getBlockingRules();

    // Check each rule
    for (const rule of rules) {
      // Policy sale compliance
      if (event.type === EventType.POLICY_SOLD) {
        if (rule.category === 'suitability' && event.payload?.policyType === 'annuity') {
          if (!event.payload?.suitabilityCompleted) {
            violations.push(rule);
          }
        }
        if (rule.category === 'replacement' && event.payload?.hasExistingCoverage) {
          if (!event.payload?.replacementFormCompleted) {
            violations.push(rule);
          }
        }
      }

      // Outreach compliance
      if (event.type === EventType.EMAIL_ENGAGED || event.type === EventType.SMS_RESPONSE_RECEIVED) {
        if (rule.category === 'privacy' && rule.id === 'do-not-call') {
          // Check DNC status
          if (event.payload?.dncStatus === 'listed') {
            violations.push(rule);
          }
        }
      }

      // Content compliance
      if (event.type === EventType.CONTENT_CREATED || event.type === EventType.CONTENT_POSTED) {
        if (rule.category === 'advertising') {
          // Flag for review
          violations.push({
            ...rule,
            severity: 'warning', // Downgrade to warning for content
          });
        }
      }
    }

    // Senior protection check
    if (event.payload?.age && event.payload.age >= 65) {
      const seniorRule = rules.find((r) => r.id === 'senior-protection');
      if (seniorRule) {
        violations.push(seniorRule);
      }
    }

    return violations;
  }

  // ─── Public API ────────────────────────────────────────────
  validateScript(script: string, state?: string): {
    approved: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check for prohibited language
    const prohibited = [
      { pattern: /guarantee.*returns?/i, issue: 'Cannot guarantee returns' },
      { pattern: /no.*risk/i, issue: 'Cannot claim no risk' },
      { pattern: /free.*money/i, issue: 'Cannot promise free money' },
      { pattern: /must.*buy/i, issue: 'Cannot use pressure tactics' },
      { pattern: /limited.*time.*only/i, issue: 'Artificial urgency may violate regulations' },
      { pattern: /bank.*require/i, issue: 'Cannot imply bank requirement for mortgage protection' },
    ];

    prohibited.forEach(({ pattern, issue }) => {
      if (pattern.test(script)) {
        issues.push(issue);
      }
    });

    return {
      approved: issues.length === 0,
      issues,
    };
  }
}
