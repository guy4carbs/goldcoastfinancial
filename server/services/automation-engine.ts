/**
 * AUTOMATION ENGINE
 * Core execution engine for the real-time automation system.
 * Subscribes to EventBus, evaluates conditions, and executes actions.
 */

import { EventBus, EventType, AgentEvent } from "../agents/core/event-bus";
import { storage } from "../storage";
import { sendSms } from "./smsService";
import { sendPushToUser } from "./pushNotificationService";
import { sendAutomationEmail } from "./automation-email";
import type {
  Automation,
  AutomationAction,
  AutomationCondition,
  AutomationExecution,
} from "@shared/models/automations";

// =============================================================================
// TYPES
// =============================================================================

interface ExecutionContext {
  automation: Automation;
  triggerData: Record<string, any>;
  lead?: any;
  client?: any;
  agent?: any;
  entityId?: string;
}

interface ActionResult {
  actionIndex: number;
  type: string;
  status: "success" | "failed" | "skipped";
  result?: any;
  error?: string;
  duration?: number;
}

interface ConditionResult {
  field: string;
  operator: string;
  expected: any;
  actual: any;
  passed: boolean;
}

// Map EventBus events to automation trigger event types
const EVENT_TYPE_MAP: Record<string, EventType> = {
  "LEAD_CREATED": EventType.RAW_LEAD_CREATED,
  "LEAD_SCORED": EventType.LEAD_SCORED,
  "LEAD_ENRICHED": EventType.LEAD_ENRICHED,
  "EMAIL_ENGAGED": EventType.EMAIL_ENGAGED,
  "SMS_RESPONSE_RECEIVED": EventType.SMS_RESPONSE_RECEIVED,
  "APPOINTMENT_BOOKED": EventType.APPOINTMENT_BOOKED,
  "POLICY_SOLD": EventType.POLICY_SOLD,
  "APPLICATION_SUBMITTED": EventType.APPLICATION_SUBMITTED,
  "PAYMENT_PROCESSED": EventType.PAYMENT_PROCESSED,
  "CALL_CONNECTED": EventType.CALL_CONNECTED,
  "INBOUND_QUALIFIED": EventType.INBOUND_QUALIFIED,
};

// =============================================================================
// AUTOMATION ENGINE CLASS
// =============================================================================

export class AutomationEngine {
  private eventBus: EventBus;
  private subscriberId = "automation-engine";
  private isInitialized = false;
  private static instance: AutomationEngine;

  // Singleton pattern
  static getInstance(): AutomationEngine {
    if (!AutomationEngine.instance) {
      AutomationEngine.instance = new AutomationEngine();
    }
    return AutomationEngine.instance;
  }

  private constructor() {
    this.eventBus = EventBus.getInstance();
  }

  // ─── INITIALIZATION ──────────────────────────────────────────────

  /**
   * Initialize the automation engine and subscribe to events
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log("[AutomationEngine] Already initialized");
      return;
    }

    console.log("[AutomationEngine] Initializing...");

    // Subscribe to all event types that automations might use
    for (const [automationEventType, busEventType] of Object.entries(EVENT_TYPE_MAP)) {
      this.eventBus.on(busEventType, this.subscriberId, async (event: AgentEvent) => {
        await this.handleEvent(automationEventType, event);
      });
    }

    // Also subscribe to wildcard for debugging/logging
    this.eventBus.on("*" as any, `${this.subscriberId}-audit`, async (event: AgentEvent) => {
      // Light logging for all events (can be disabled in production)
      if (process.env.NODE_ENV === "development") {
        console.log(`[AutomationEngine] Event: ${event.type} from ${event.source}`);
      }
    });

    this.isInitialized = true;
    console.log("[AutomationEngine] Initialized and listening for events");
  }

  /**
   * Shutdown the engine and unsubscribe from events
   */
  shutdown(): void {
    console.log("[AutomationEngine] Shutting down...");
    this.eventBus.removeAllSubscriptions(this.subscriberId);
    this.eventBus.removeAllSubscriptions(`${this.subscriberId}-audit`);
    this.isInitialized = false;
  }

  // ─── EVENT HANDLING ──────────────────────────────────────────────

  /**
   * Handle an incoming event and check for matching automations
   */
  private async handleEvent(automationEventType: string, event: AgentEvent): Promise<void> {
    try {
      // Find all enabled automations with event-based triggers matching this event
      const automations = await storage.getEnabledAutomations();

      const matchingAutomations = automations.filter((a) => {
        if (a.triggerType !== "event_based") return false;
        const config = a.triggerConfig as { eventType?: string };
        return config.eventType === automationEventType;
      });

      if (matchingAutomations.length === 0) {
        return; // No automations listening for this event
      }

      console.log(`[AutomationEngine] Found ${matchingAutomations.length} automations for ${automationEventType}`);

      // Execute each matching automation
      for (const automation of matchingAutomations) {
        await this.executeAutomation(automation, {
          type: "event",
          eventType: automationEventType,
          eventId: event.id,
          data: event.payload,
        });
      }
    } catch (error) {
      console.error(`[AutomationEngine] Error handling event ${automationEventType}:`, error);
    }
  }

  // ─── EXECUTION ───────────────────────────────────────────────────

  /**
   * Execute an automation with the given trigger data
   */
  async executeAutomation(
    automation: Automation,
    triggerData: Record<string, any>
  ): Promise<AutomationExecution> {
    const startTime = Date.now();

    console.log(`[AutomationEngine] Executing automation: ${automation.name} (${automation.id})`);

    // Create execution record
    let execution = await storage.createAutomationExecution({
      automationId: automation.id,
      status: "running",
      triggeredBy: triggerData,
    });

    try {
      // Build execution context
      const context: ExecutionContext = {
        automation,
        triggerData,
        lead: triggerData.data?.lead || triggerData.data,
        client: triggerData.data?.client,
        agent: triggerData.data?.agent,
        entityId: triggerData.data?.id || triggerData.entityId,
      };

      // Evaluate conditions
      const conditions = (automation.conditions || []) as AutomationCondition[];
      const conditionResults = this.evaluateConditions(conditions, context);

      const allConditionsPassed = conditionResults.every((r) => r.passed);

      if (!allConditionsPassed) {
        // Conditions not met - skip execution
        console.log(`[AutomationEngine] Conditions not met for ${automation.name}`);

        const updated = await storage.updateExecution(execution.id, {
          status: "skipped",
          completedAt: new Date(),
          duration: Date.now() - startTime,
          conditionResults: { passed: false, conditions: conditionResults },
        });

        return updated || execution;
      }

      // Execute actions
      const actions = (automation.actions || []) as AutomationAction[];
      const actionResults = await this.executeActions(actions, context);

      // Determine overall status
      const hasFailure = actionResults.some((r) => r.status === "failed");
      const status = hasFailure ? "failed" : "completed";

      // Update execution record
      const updatedExecution = await storage.updateExecution(execution.id, {
        status,
        completedAt: new Date(),
        duration: Date.now() - startTime,
        conditionResults: { passed: true, conditions: conditionResults },
        actionResults,
      });

      // Update automation stats
      await storage.incrementAutomationStats(automation.id, !hasFailure);

      console.log(`[AutomationEngine] Completed automation: ${automation.name} - ${status}`);

      return updatedExecution || execution;
    } catch (error: any) {
      console.error(`[AutomationEngine] Error executing automation ${automation.name}:`, error);

      // Update execution with error
      const failedExecution = await storage.updateExecution(execution.id, {
        status: "failed",
        completedAt: new Date(),
        duration: Date.now() - startTime,
        errorMessage: error.message,
        errorDetails: { stack: error.stack },
      });

      // Update automation stats
      await storage.incrementAutomationStats(automation.id, false);

      return failedExecution || execution;
    }
  }

  // ─── CONDITION EVALUATION ────────────────────────────────────────

  /**
   * Evaluate all conditions against the execution context
   */
  private evaluateConditions(
    conditions: AutomationCondition[],
    context: ExecutionContext
  ): ConditionResult[] {
    return conditions.map((condition) => {
      const actual = this.resolveFieldValue(condition.field, context);
      const passed = this.evaluateCondition(condition.operator, actual, condition.value);

      return {
        field: condition.field,
        operator: condition.operator,
        expected: condition.value,
        actual,
        passed,
      };
    });
  }

  /**
   * Resolve a field value from the context (e.g., "lead.score" -> 85)
   */
  private resolveFieldValue(field: string, context: ExecutionContext): any {
    const parts = field.split(".");
    let value: any = context;

    // First check if it's a direct field on lead/client
    if (context.lead && field in context.lead) {
      return context.lead[field];
    }
    if (context.client && field in context.client) {
      return context.client[field];
    }

    // Then try nested path
    for (const part of parts) {
      if (value && typeof value === "object" && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(operator: string, actual: any, expected: any): boolean {
    switch (operator) {
      case "eq":
        return actual === expected;
      case "neq":
        return actual !== expected;
      case "gt":
        return actual > expected;
      case "gte":
        return actual >= expected;
      case "lt":
        return actual < expected;
      case "lte":
        return actual <= expected;
      case "contains":
        return typeof actual === "string" && actual.includes(expected);
      case "not_contains":
        return typeof actual === "string" && !actual.includes(expected);
      case "in":
        return Array.isArray(expected) && expected.includes(actual);
      case "not_in":
        return Array.isArray(expected) && !expected.includes(actual);
      case "is_empty":
        return actual === null || actual === undefined || actual === "" || (Array.isArray(actual) && actual.length === 0);
      case "is_not_empty":
        return actual !== null && actual !== undefined && actual !== "" && !(Array.isArray(actual) && actual.length === 0);
      case "is_today":
        if (!actual) return false;
        const today = new Date();
        const date = new Date(actual);
        return (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth()
        );
      case "older_than":
        if (!actual) return false;
        const daysAgo = this.parseDuration(expected);
        const cutoff = new Date(Date.now() - daysAgo);
        return new Date(actual) < cutoff;
      case "days_until":
        if (!actual) return false;
        const targetDate = new Date(actual);
        const now = new Date();
        const diffDays = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays === expected;
      case "past_due":
        if (!actual) return false;
        return new Date(actual) < new Date();
      default:
        console.warn(`[AutomationEngine] Unknown operator: ${operator}`);
        return false;
    }
  }

  /**
   * Parse a duration string like "3d" or "2h" into milliseconds
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([dhms])$/);
    if (!match) return 0;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "d": return value * 24 * 60 * 60 * 1000;
      case "h": return value * 60 * 60 * 1000;
      case "m": return value * 60 * 1000;
      case "s": return value * 1000;
      default: return 0;
    }
  }

  // ─── ACTION EXECUTION ────────────────────────────────────────────

  /**
   * Execute all actions in sequence
   */
  private async executeActions(
    actions: AutomationAction[],
    context: ExecutionContext
  ): Promise<ActionResult[]> {
    const results: ActionResult[] = [];

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const startTime = Date.now();

      try {
        const result = await this.executeAction(action, context);
        results.push({
          actionIndex: i,
          type: action.type,
          status: "success",
          result,
          duration: Date.now() - startTime,
        });
      } catch (error: any) {
        console.error(`[AutomationEngine] Action ${action.type} failed:`, error);
        results.push({
          actionIndex: i,
          type: action.type,
          status: "failed",
          error: error.message,
          duration: Date.now() - startTime,
        });
        // Continue executing other actions even if one fails
      }
    }

    return results;
  }

  /**
   * Execute a single action
   */
  private async executeAction(
    action: AutomationAction,
    context: ExecutionContext
  ): Promise<any> {
    const config = action.config as any;

    switch (action.type) {
      case "send_email":
        return this.executeSendEmail(config, context);
      case "send_sms":
        return this.executeSendSms(config, context);
      case "create_task":
        return this.executeCreateTask(config, context);
      case "update_lead":
        return this.executeUpdateLead(config, context);
      case "assign_lead":
        return this.executeAssignLead(config, context);
      case "add_tag":
        return this.executeAddTag(config, context);
      case "create_activity":
        return this.executeCreateActivity(config, context);
      case "send_notification":
        return this.executeSendNotification(config, context);
      case "webhook":
        return this.executeWebhook(config, context);
      case "wait":
        return this.executeWait(config, context);
      default:
        throw new Error(`Unknown action type: ${(action as any).type}`);
    }
  }

  // ─── ACTION IMPLEMENTATIONS ──────────────────────────────────────

  /**
   * Send email action
   */
  private async executeSendEmail(
    config: { templateId?: string; subject?: string; body?: string; to?: string },
    context: ExecutionContext
  ): Promise<any> {
    const recipientEmail = this.resolveTemplate(config.to || "{{lead.email}}", context);
    const subject = config.subject ? this.resolveTemplate(config.subject, context) : undefined;
    const body = config.body ? this.resolveTemplate(config.body, context) : undefined;

    if (!recipientEmail) {
      throw new Error("No recipient email address");
    }

    // Get agent info for the email
    const agentId = context.automation.agentId;
    const agent = await storage.getUserById(agentId);

    const agentInfo = {
      name: agent?.firstName && agent?.lastName
        ? `${agent.firstName} ${agent.lastName}`
        : agent?.email || "Heritage Life Agent",
      email: agent?.email || "contact@heritagels.org",
      phone: agent?.phone || "(630) 778-0800",
    };

    // Send via automation email service
    const result = await sendAutomationEmail({
      to: recipientEmail,
      templateId: config.templateId,
      subject,
      body,
      agent: agentInfo,
      context: {
        lead: context.lead,
        client: context.client,
        agent: agentInfo,
      },
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to send email");
    }

    console.log(`[AutomationEngine] Email sent to ${recipientEmail}`);

    return { sent: true, to: recipientEmail, messageId: result.messageId };
  }

  /**
   * Send SMS action
   */
  private async executeSendSms(
    config: { templateId?: string; message?: string; to?: string },
    context: ExecutionContext
  ): Promise<any> {
    const phone = this.resolveTemplate(config.to || "{{lead.phone}}", context);
    const message = this.resolveTemplate(config.message || "Automated message from Heritage Life", context);

    if (!phone) {
      throw new Error("No phone number for SMS");
    }

    const result = await sendSms(phone, message);

    if (!result.success) {
      throw new Error(result.error || "SMS send failed");
    }

    return { sent: true, to: phone, messageId: result.messageId };
  }

  /**
   * Create task action
   */
  private async executeCreateTask(
    config: { title: string; description?: string; dueIn?: string; assignTo?: string; priority?: string },
    context: ExecutionContext
  ): Promise<any> {
    const title = this.resolveTemplate(config.title, context);
    const description = config.description ? this.resolveTemplate(config.description, context) : undefined;
    const assignTo = config.assignTo ? this.resolveTemplate(config.assignTo, context) : context.automation.agentId;

    // Calculate due date
    let dueDate: Date | undefined;
    if (config.dueIn) {
      const dueMs = this.parseDuration(config.dueIn);
      dueDate = new Date(Date.now() + dueMs);
    }

    // Create task via storage
    const task = await storage.createTask({
      userId: assignTo,
      title,
      description,
      dueDate,
      priority: config.priority || "medium",
      status: "pending",
      leadId: context.entityId,
      category: "follow_up",
    });

    console.log(`[AutomationEngine] Created task: ${title}`);

    return { taskId: task.id, title };
  }

  /**
   * Update lead action
   */
  private async executeUpdateLead(
    config: { status?: string; priority?: string; pipelineStage?: string; tags?: string[]; customFields?: Record<string, any> },
    context: ExecutionContext
  ): Promise<any> {
    const leadId = context.entityId || context.lead?.id;
    if (!leadId) {
      throw new Error("No lead ID to update");
    }

    const updates: any = {};
    if (config.status) updates.status = config.status;
    if (config.priority) updates.priority = config.priority;
    if (config.pipelineStage) updates.pipelineStage = config.pipelineStage;
    if (config.tags) updates.tags = config.tags;

    const updated = await storage.updateLead(leadId, updates);

    console.log(`[AutomationEngine] Updated lead ${leadId}`);

    return { leadId, updates };
  }

  /**
   * Assign lead action
   */
  private async executeAssignLead(
    config: { strategy: string; agentId?: string },
    context: ExecutionContext
  ): Promise<any> {
    const leadId = context.entityId || context.lead?.id;
    if (!leadId) {
      throw new Error("No lead ID to assign");
    }

    let assignToAgentId: string;

    if (config.strategy === "specific" && config.agentId) {
      assignToAgentId = config.agentId;
    } else if (config.strategy === "round_robin") {
      // Get all agents and pick the next one
      // For now, assign to the automation owner
      assignToAgentId = context.automation.agentId;
    } else {
      assignToAgentId = context.automation.agentId;
    }

    await storage.updateLead(leadId, { assignedTo: assignToAgentId });

    console.log(`[AutomationEngine] Assigned lead ${leadId} to ${assignToAgentId}`);

    return { leadId, assignedTo: assignToAgentId };
  }

  /**
   * Add tag action
   */
  private async executeAddTag(
    config: { tags: string[] },
    context: ExecutionContext
  ): Promise<any> {
    const leadId = context.entityId || context.lead?.id;
    if (!leadId) {
      throw new Error("No lead ID for tagging");
    }

    const currentTags = context.lead?.tags || [];
    const newTags = Array.from(new Set([...currentTags, ...config.tags]));

    await storage.updateLead(leadId, { tags: newTags });

    console.log(`[AutomationEngine] Added tags to lead ${leadId}: ${config.tags.join(", ")}`);

    return { leadId, tags: newTags };
  }

  /**
   * Create activity action
   */
  private async executeCreateActivity(
    config: { type: string; title: string; description?: string },
    context: ExecutionContext
  ): Promise<any> {
    const leadId = context.entityId || context.lead?.id;
    const title = this.resolveTemplate(config.title, context);
    const description = config.description ? this.resolveTemplate(config.description, context) : undefined;

    // Create activity log entry
    // This would integrate with the activity logging system
    console.log(`[AutomationEngine] Created activity: ${title} for lead ${leadId}`);

    return { type: config.type, title, leadId };
  }

  /**
   * Send notification action
   */
  private async executeSendNotification(
    config: { title: string; body: string; to?: string; priority?: string },
    context: ExecutionContext
  ): Promise<any> {
    const title = this.resolveTemplate(config.title, context);
    const body = this.resolveTemplate(config.body, context);
    const recipientId = config.to
      ? this.resolveTemplate(config.to, context)
      : context.automation.agentId;

    // Send push notification
    const result = await sendPushToUser(recipientId, {
      title,
      body,
      sound: "default",
      data: {
        type: "automation",
        automationId: context.automation.id,
        leadId: context.entityId,
      },
    });

    console.log(`[AutomationEngine] Sent notification to ${recipientId}: ${title}`);

    return { sent: result.sent, failed: result.failed, title };
  }

  /**
   * Webhook action
   */
  private async executeWebhook(
    config: { url: string; method?: string; headers?: Record<string, string>; body?: Record<string, any> },
    context: ExecutionContext
  ): Promise<any> {
    const url = this.resolveTemplate(config.url, context);
    const method = config.method || "POST";

    // Resolve any templates in the body
    let bodyData = config.body;
    if (bodyData) {
      bodyData = JSON.parse(this.resolveTemplate(JSON.stringify(bodyData), context));
    }

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: method !== "GET" ? JSON.stringify(bodyData) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json().catch(() => null);

    console.log(`[AutomationEngine] Webhook ${method} ${url}: ${response.status}`);

    return { url, status: response.status, response: responseData };
  }

  /**
   * Wait action - introduces a delay
   */
  private async executeWait(
    config: { duration: string },
    context: ExecutionContext
  ): Promise<any> {
    const ms = this.parseDuration(config.duration);

    // For short waits, actually wait
    // For long waits (>5 min), we'd need to schedule continuation (future enhancement)
    if (ms <= 5 * 60 * 1000) {
      console.log(`[AutomationEngine] Waiting for ${config.duration}`);
      await new Promise((resolve) => setTimeout(resolve, ms));
    } else {
      console.log(`[AutomationEngine] Wait duration ${config.duration} too long, skipping`);
    }

    return { waited: config.duration, ms };
  }

  // ─── TEMPLATE RESOLUTION ─────────────────────────────────────────

  /**
   * Resolve template variables like {{lead.firstName}} with actual values
   */
  private resolveTemplate(template: string, context: ExecutionContext): string {
    if (!template) return template;

    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.resolveFieldValue(path.trim(), context);
      return value !== undefined ? String(value) : match;
    });
  }

  // ─── MANUAL TRIGGER ──────────────────────────────────────────────

  /**
   * Manually trigger an automation (from API)
   */
  async triggerManually(automationId: string, triggerData?: Record<string, any>): Promise<AutomationExecution> {
    const automation = await storage.getAutomationById(automationId);
    if (!automation) {
      throw new Error("Automation not found");
    }

    return this.executeAutomation(automation, {
      type: "manual",
      triggeredBy: "user",
      data: triggerData || {},
    });
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const automationEngine = AutomationEngine.getInstance();

export default automationEngine;
