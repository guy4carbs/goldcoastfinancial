/**
 * WORKFLOW ENGINE
 * Execution engine for visual workflow automations.
 * Traverses node graphs with branching logic based on conditions.
 * Built on top of the AutomationEngine's action execution capabilities.
 */

import { EventBus, EventType, AgentEvent } from "../agents/core/event-bus";
import { storage } from "../storage";
import { sendSms } from "./smsService";
import { sendPushToUser } from "./pushNotificationService";
import { sendAutomationEmail } from "./automation-email";

// =============================================================================
// TYPES
// =============================================================================

interface WorkflowNode {
  id: string;
  type: "trigger" | "action" | "condition" | "wait" | "end";
  position: { x: number; y: number };
  data: {
    label: string;
    config: Record<string, unknown>;
    yesConnected?: boolean;
    noConnected?: boolean;
  };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

interface WorkflowAutomation {
  id: string;
  name: string;
  agentId: string;
  enabled: boolean;
  workflow: WorkflowDefinition;
}

// Type guard to cast database result to typed WorkflowAutomation
function toWorkflowAutomation(dbResult: {
  id: string;
  name: string;
  agentId: string;
  enabled: boolean;
  workflow: unknown;
}): WorkflowAutomation {
  return {
    ...dbResult,
    workflow: dbResult.workflow as WorkflowDefinition,
  };
}

interface ExecutionContext {
  workflowId: string;
  executionId: string;
  triggerData: Record<string, unknown>;
  variables: Record<string, unknown>;
  visitedNodes: Set<string>;
  results: NodeExecutionResult[];
  lead?: Record<string, unknown>;
  client?: Record<string, unknown>;
  agent?: Record<string, unknown>;
}

interface NodeExecutionResult {
  nodeId: string;
  nodeType: string;
  nodeLabel: string;
  status: "success" | "failed" | "skipped";
  output?: unknown;
  error?: string;
  duration: number;
}

interface WorkflowExecutionResult {
  success: boolean;
  executionId: string;
  results: NodeExecutionResult[];
  error?: string;
  duration?: number;
}

// Map EventBus events to workflow trigger event types
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
  "CALL_FAILED": EventType.CALL_FAILED,
  "INBOUND_QUALIFIED": EventType.INBOUND_QUALIFIED,
};

// =============================================================================
// WORKFLOW ENGINE CLASS
// =============================================================================

export class WorkflowEngine {
  private eventBus: EventBus;
  private subscriberId = "workflow-engine";
  private isInitialized = false;
  private static instance: WorkflowEngine;

  // Singleton pattern
  static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  private constructor() {
    this.eventBus = EventBus.getInstance();
  }

  // ─── INITIALIZATION ──────────────────────────────────────────────

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log("[WorkflowEngine] Already initialized");
      return;
    }

    console.log("[WorkflowEngine] Initializing...");

    // Subscribe to all event types that workflows might use
    for (const [workflowEventType, busEventType] of Object.entries(EVENT_TYPE_MAP)) {
      this.eventBus.on(busEventType, this.subscriberId, async (event: AgentEvent) => {
        await this.handleEvent(workflowEventType, event);
      });
    }

    this.isInitialized = true;
    console.log("[WorkflowEngine] Initialized and listening for events");
  }

  shutdown(): void {
    console.log("[WorkflowEngine] Shutting down...");
    this.eventBus.removeAllSubscriptions(this.subscriberId);
    this.isInitialized = false;
  }

  // ─── EVENT HANDLING ──────────────────────────────────────────────

  private async handleEvent(eventType: string, event: AgentEvent): Promise<void> {
    try {
      // Find all enabled workflow automations with matching trigger
      const dbWorkflows = await storage.getEnabledWorkflowAutomations();

      for (const dbWorkflow of dbWorkflows) {
        const workflow = toWorkflowAutomation(dbWorkflow);
        const triggerNode = workflow.workflow.nodes.find(
          (n: WorkflowNode) => n.type === "trigger"
        );
        if (!triggerNode) continue;

        const config = triggerNode.data.config as {
          triggerType?: string;
          eventType?: string;
        };

        // Check if this workflow should trigger
        if (config.triggerType === "event_based" && config.eventType === eventType) {
          console.log(`[WorkflowEngine] Triggering workflow: ${workflow.name}`);
          await this.executeWorkflow(workflow, {
            type: "event",
            eventType,
            eventId: event.id,
            data: event.payload,
          });
        }
      }
    } catch (error) {
      console.error(`[WorkflowEngine] Error handling event ${eventType}:`, error);
    }
  }

  // ─── EXECUTION ───────────────────────────────────────────────────

  async executeWorkflow(
    workflow: WorkflowAutomation,
    triggerData: Record<string, unknown>,
    options: { dryRun?: boolean } = {}
  ): Promise<WorkflowExecutionResult> {
    const executionId = crypto.randomUUID();
    const startTime = Date.now();

    console.log(`[WorkflowEngine] Executing workflow: ${workflow.name} (${workflow.id})`);

    // Create execution record (unless dry run)
    let execution: { id: string } | null = null;
    if (!options.dryRun) {
      execution = await storage.createWorkflowExecution({
        workflowAutomationId: workflow.id,
        status: "running",
        triggeredBy: triggerData,
        startedAt: new Date(),
      });
    }

    const triggerPayload = (triggerData.data as Record<string, unknown>) || {};
    const context: ExecutionContext = {
      workflowId: workflow.id,
      executionId: execution?.id || executionId,
      triggerData,
      variables: {
        ...triggerData,
        lead: triggerPayload.lead || triggerPayload,
        client: triggerPayload.client,
        agent: triggerPayload.agent,
      },
      visitedNodes: new Set(),
      results: [],
      lead: (triggerPayload.lead || triggerPayload) as Record<string, unknown>,
      client: triggerPayload.client as Record<string, unknown> | undefined,
      agent: triggerPayload.agent as Record<string, unknown> | undefined,
    };

    try {
      // Find trigger node and start traversal
      const triggerNode = workflow.workflow.nodes.find(
        (n: WorkflowNode) => n.type === "trigger"
      );
      if (!triggerNode) {
        throw new Error("No trigger node found in workflow");
      }

      await this.executeNode(triggerNode, workflow.workflow, context, options, workflow.agentId);

      // Update execution as completed
      if (execution && !options.dryRun) {
        await storage.updateWorkflowExecution(execution.id, {
          status: "completed",
          nodeResults: context.results,
          completedAt: new Date(),
          duration: Date.now() - startTime,
        });

        // Update workflow stats
        await storage.incrementWorkflowStats(workflow.id, true);
      }

      console.log(`[WorkflowEngine] Completed workflow: ${workflow.name}`);

      return {
        success: true,
        executionId: context.executionId,
        results: context.results,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      console.error(`[WorkflowEngine] Error executing workflow ${workflow.name}:`, error);

      if (execution && !options.dryRun) {
        await storage.updateWorkflowExecution(execution.id, {
          status: "failed",
          nodeResults: context.results,
          errorMessage: error.message,
          completedAt: new Date(),
          duration: Date.now() - startTime,
        });

        await storage.incrementWorkflowStats(workflow.id, false);
      }

      return {
        success: false,
        executionId: context.executionId,
        error: error.message,
        results: context.results,
        duration: Date.now() - startTime,
      };
    }
  }

  // ─── NODE EXECUTION ──────────────────────────────────────────────

  private async executeNode(
    node: WorkflowNode,
    workflow: WorkflowDefinition,
    context: ExecutionContext,
    options: { dryRun?: boolean },
    agentId: string
  ): Promise<void> {
    // Prevent infinite loops
    if (context.visitedNodes.has(node.id)) {
      throw new Error(`Cycle detected at node ${node.id}`);
    }
    context.visitedNodes.add(node.id);

    const startTime = Date.now();
    let result: NodeExecutionResult = {
      nodeId: node.id,
      nodeType: node.type,
      nodeLabel: node.data.label,
      status: "success",
      duration: 0,
    };

    try {
      switch (node.type) {
        case "trigger":
          result.output = { triggered: true, triggerData: context.triggerData };
          break;

        case "action":
          result = await this.executeActionNode(node, context, options, agentId);
          break;

        case "condition":
          const conditionResult = this.evaluateCondition(node, context);
          result.output = { condition: node.data.config, result: conditionResult };

          // Handle branching - execute appropriate path
          const branchHandle = conditionResult ? "yes" : "no";
          const branchEdge = workflow.edges.find(
            (e) => e.source === node.id && e.sourceHandle === branchHandle
          );

          if (branchEdge) {
            const nextNode = workflow.nodes.find((n) => n.id === branchEdge.target);
            if (nextNode) {
              result.duration = Date.now() - startTime;
              context.results.push(result);
              await this.executeNode(nextNode, workflow, context, options, agentId);
            }
          }
          return; // Condition handles its own branching

        case "wait":
          if (!options.dryRun) {
            await this.executeWait(node);
          }
          result.output = { waited: node.data.config.duration };
          break;

        case "end":
          result.output = { status: node.data.config.status, completed: true };
          result.duration = Date.now() - startTime;
          context.results.push(result);
          return; // End node terminates this path
      }

      result.duration = Date.now() - startTime;
      context.results.push(result);

      // Follow outgoing edges (for non-condition, non-end nodes)
      const outgoingEdges = workflow.edges.filter((e) => e.source === node.id);
      for (const edge of outgoingEdges) {
        const nextNode = workflow.nodes.find((n) => n.id === edge.target);
        if (nextNode) {
          await this.executeNode(nextNode, workflow, context, options, agentId);
        }
      }
    } catch (error: any) {
      result.status = "failed";
      result.error = error.message;
      result.duration = Date.now() - startTime;
      context.results.push(result);
      throw error;
    }
  }

  // ─── ACTION EXECUTION ────────────────────────────────────────────

  private async executeActionNode(
    node: WorkflowNode,
    context: ExecutionContext,
    options: { dryRun?: boolean },
    agentId: string
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const config = node.data.config as Record<string, unknown>;
    const actionType = config.actionType as string;

    if (options.dryRun) {
      return {
        nodeId: node.id,
        nodeType: "action",
        nodeLabel: node.data.label,
        status: "success",
        output: { simulated: true, actionType },
        duration: 0,
      };
    }

    try {
      let result: unknown;

      switch (actionType) {
        case "send_email":
          result = await this.executeSendEmail(config, context, agentId);
          break;
        case "send_sms":
          result = await this.executeSendSms(config, context);
          break;
        case "send_notification":
          result = await this.executeSendNotification(config, context, agentId);
          break;
        case "create_task":
          result = await this.executeCreateTask(config, context, agentId);
          break;
        case "update_lead":
          result = await this.executeUpdateLead(config, context);
          break;
        case "add_tag":
          result = await this.executeAddTag(config, context);
          break;
        case "webhook":
          result = await this.executeWebhook(config, context);
          break;
        default:
          throw new Error(`Unknown action type: ${actionType}`);
      }

      return {
        nodeId: node.id,
        nodeType: "action",
        nodeLabel: node.data.label,
        status: "success",
        output: result,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        nodeId: node.id,
        nodeType: "action",
        nodeLabel: node.data.label,
        status: "failed",
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  // ─── CONDITION EVALUATION ────────────────────────────────────────

  private evaluateCondition(node: WorkflowNode, context: ExecutionContext): boolean {
    const config = node.data.config as {
      field: string;
      operator: string;
      value: unknown;
    };

    const actualValue = this.resolveFieldValue(config.field, context);
    return this.evaluateOperator(actualValue, config.operator, config.value);
  }

  private evaluateOperator(actual: unknown, operator: string, expected: unknown): boolean {
    switch (operator) {
      case "eq":
        return actual === expected;
      case "neq":
        return actual !== expected;
      case "gt":
        return (actual as number) > (expected as number);
      case "gte":
        return (actual as number) >= (expected as number);
      case "lt":
        return (actual as number) < (expected as number);
      case "lte":
        return (actual as number) <= (expected as number);
      case "contains":
        return typeof actual === "string" && actual.includes(expected as string);
      case "not_contains":
        return typeof actual === "string" && !actual.includes(expected as string);
      case "is_empty":
        return actual === null || actual === undefined || actual === "" ||
          (Array.isArray(actual) && actual.length === 0);
      case "is_not_empty":
        return actual !== null && actual !== undefined && actual !== "" &&
          !(Array.isArray(actual) && actual.length === 0);
      default:
        console.warn(`[WorkflowEngine] Unknown operator: ${operator}`);
        return false;
    }
  }

  // ─── WAIT EXECUTION ──────────────────────────────────────────────

  private async executeWait(node: WorkflowNode): Promise<void> {
    const duration = this.parseDuration(node.data.config.duration as string);
    // For short waits, actually wait. For long waits, max 5 min in-process
    const maxWait = 5 * 60 * 1000;
    const waitTime = Math.min(duration, maxWait);

    console.log(`[WorkflowEngine] Waiting for ${node.data.config.duration}`);
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  // ─── ACTION IMPLEMENTATIONS ──────────────────────────────────────

  private async executeSendEmail(
    config: Record<string, unknown>,
    context: ExecutionContext,
    agentId: string
  ): Promise<unknown> {
    const to = this.resolveTemplate(config.to as string || "{{lead.email}}", context);
    const subject = this.resolveTemplate(config.subject as string || "", context);
    const body = this.resolveTemplate(config.body as string || "", context);

    if (!to) throw new Error("No recipient email address");

    const agent = await storage.getUserById(agentId);
    const agentInfo = {
      name: agent?.firstName && agent?.lastName
        ? `${agent.firstName} ${agent.lastName}`
        : "Heritage Life Agent",
      email: agent?.email || "contact@heritagels.org",
      phone: agent?.phone || "(630) 778-0800",
    };

    const result = await sendAutomationEmail({
      to,
      subject,
      body,
      agent: agentInfo,
      context: { lead: context.lead, client: context.client, agent: agentInfo },
    });

    if (!result.success) throw new Error(result.error || "Failed to send email");

    return { sent: true, to, messageId: result.messageId };
  }

  private async executeSendSms(
    config: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<unknown> {
    const to = this.resolveTemplate(config.to as string || "{{lead.phone}}", context);
    const message = this.resolveTemplate(config.message as string || "", context);

    if (!to) throw new Error("No phone number for SMS");

    const result = await sendSms(to, message);

    if (!result.success) throw new Error(result.error || "SMS send failed");

    return { sent: true, to, messageId: result.messageId };
  }

  private async executeSendNotification(
    config: Record<string, unknown>,
    context: ExecutionContext,
    agentId: string
  ): Promise<unknown> {
    const title = this.resolveTemplate(config.title as string || "", context);
    const body = this.resolveTemplate(config.body as string || "", context);

    const result = await sendPushToUser(agentId, {
      title,
      body,
      sound: "default",
      data: { type: "workflow", workflowId: context.workflowId },
    });

    return { sent: result.sent, failed: result.failed, title };
  }

  private async executeCreateTask(
    config: Record<string, unknown>,
    context: ExecutionContext,
    agentId: string
  ): Promise<unknown> {
    const title = this.resolveTemplate(config.title as string || "", context);
    const dueIn = config.dueIn as string || "1d";
    const priority = config.priority as string || "medium";

    const dueMs = this.parseDuration(dueIn);
    const dueDate = new Date(Date.now() + dueMs);

    const task = await storage.createTask({
      userId: agentId,
      title,
      dueDate,
      priority,
      status: "pending",
      leadId: (context.lead as Record<string, unknown>)?.id as string,
      category: "follow_up",
    });

    return { taskId: task.id, title };
  }

  private async executeUpdateLead(
    config: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<unknown> {
    const leadId = (context.lead as Record<string, unknown>)?.id as string;
    if (!leadId) throw new Error("No lead ID to update");

    const updates: Record<string, unknown> = {};
    if (config.status) updates.status = config.status;
    if (config.priority) updates.priority = config.priority;
    if (config.pipelineStage) updates.pipelineStage = config.pipelineStage;

    await storage.updateLead(leadId, updates);

    return { leadId, updates };
  }

  private async executeAddTag(
    config: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<unknown> {
    const leadId = (context.lead as Record<string, unknown>)?.id as string;
    if (!leadId) throw new Error("No lead ID for tagging");

    const currentTags = ((context.lead as Record<string, unknown>)?.tags as string[]) || [];
    const newTags = Array.from(new Set([...currentTags, ...(config.tags as string[])]));

    await storage.updateLead(leadId, { tags: newTags });

    return { leadId, tags: newTags };
  }

  private async executeWebhook(
    config: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<unknown> {
    const url = this.resolveTemplate(config.url as string, context);
    const method = (config.method as string) || "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(config.headers as Record<string, string>),
      },
      body: method !== "GET" ? JSON.stringify(context.variables) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }

    const responseData = await response.json().catch(() => null);

    return { url, status: response.status, response: responseData };
  }

  // ─── HELPERS ─────────────────────────────────────────────────────

  private resolveFieldValue(field: string, context: ExecutionContext): unknown {
    const parts = field.split(".");
    let value: unknown = context.variables;

    // First check direct field on lead
    if (context.lead && field in context.lead) {
      return context.lead[field];
    }

    // Then try nested path
    for (const part of parts) {
      if (value && typeof value === "object" && part in (value as Record<string, unknown>)) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  private resolveTemplate(template: string, context: ExecutionContext): string {
    if (!template) return template;

    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.resolveFieldValue(path.trim(), context);
      return value !== undefined ? String(value) : match;
    });
  }

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

  // ─── MANUAL TRIGGER ──────────────────────────────────────────────

  async triggerManually(
    workflowId: string,
    triggerData?: Record<string, unknown>
  ): Promise<WorkflowExecutionResult> {
    const dbWorkflow = await storage.getWorkflowAutomationById(workflowId);
    if (!dbWorkflow) {
      throw new Error("Workflow not found");
    }

    const workflow = toWorkflowAutomation(dbWorkflow);
    return this.executeWorkflow(workflow, {
      type: "manual",
      triggeredBy: "user",
      data: triggerData || {},
    });
  }

  async testWorkflow(
    workflowId: string,
    testData?: Record<string, unknown>
  ): Promise<WorkflowExecutionResult> {
    const dbWorkflow = await storage.getWorkflowAutomationById(workflowId);
    if (!dbWorkflow) {
      throw new Error("Workflow not found");
    }

    const workflow = toWorkflowAutomation(dbWorkflow);
    return this.executeWorkflow(
      workflow,
      {
        type: "test",
        triggeredBy: "test",
        data: testData || {
          lead: {
            id: "test-lead-123",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            phone: "+15551234567",
            status: "new",
            leadScore: 75,
          },
        },
      },
      { dryRun: true }
    );
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const workflowEngine = WorkflowEngine.getInstance();

export default workflowEngine;
