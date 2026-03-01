import { pgTable, text, timestamp, varchar, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// =============================================================================
// AUTOMATIONS - Real-time workflow automation system
// =============================================================================

/**
 * Trigger types for automations
 * - time_based: Run on a schedule (cron)
 * - event_based: Run when an event occurs (LEAD_CREATED, etc.)
 * - condition_based: Run when data matches criteria (lead inactive 3 days)
 */
export const triggerTypeEnum = ["time_based", "event_based", "condition_based"] as const;
export type TriggerType = typeof triggerTypeEnum[number];

/**
 * Execution status for automation runs
 */
export const executionStatusEnum = ["pending", "running", "completed", "failed", "skipped"] as const;
export type ExecutionStatus = typeof executionStatusEnum[number];

/**
 * Action types available in automations
 */
export const actionTypeEnum = [
  "send_email",
  "send_sms",
  "create_task",
  "update_lead",
  "assign_lead",
  "add_tag",
  "create_activity",
  "send_notification",
  "webhook",
  "wait"
] as const;
export type ActionType = typeof actionTypeEnum[number];

/**
 * Condition operators for filtering
 */
export const conditionOperatorEnum = [
  "eq", "neq", "gt", "gte", "lt", "lte",
  "contains", "not_contains",
  "in", "not_in",
  "is_empty", "is_not_empty",
  "is_today", "older_than", "days_until", "past_due"
] as const;
export type ConditionOperator = typeof conditionOperatorEnum[number];

/**
 * Main automations table - stores automation configurations
 */
export const automations = pgTable("automations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Ownership
  agentId: text("agent_id").notNull(), // User who owns this automation

  // Basic Info
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  enabled: boolean("enabled").notNull().default(true),

  // Trigger Configuration
  triggerType: varchar("trigger_type", { length: 50 }).notNull(), // time_based, event_based, condition_based
  triggerConfig: jsonb("trigger_config").notNull(),
  // For event_based: { eventType: 'LEAD_CREATED', filters: {...} }
  // For time_based: { schedule: '0 9 * * *', timezone: 'America/New_York' }
  // For condition_based: { entity: 'lead', field: 'lastContactedAt', operator: 'older_than', value: '3d' }

  // Conditions (optional filters that must pass for automation to execute)
  conditions: jsonb("conditions").notNull().default([]),
  // [{ field: 'leadScore', operator: 'gt', value: 50 }, { field: 'status', operator: 'not_in', value: ['won', 'lost'] }]

  // Actions (ordered list of actions to execute)
  actions: jsonb("actions").notNull(),
  // [{ type: 'send_email', config: { templateId: 'follow-up' } }, { type: 'create_task', config: { title: '...' } }]

  // Execution Statistics
  executedCount: integer("executed_count").notNull().default(0),
  successCount: integer("success_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  lastExecutedAt: timestamp("last_executed_at"),
  nextExecutionAt: timestamp("next_execution_at"), // For time_based triggers

  // Template reference (if created from template)
  templateId: varchar("template_id", { length: 100 }),

  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_automations_agent_id").on(table.agentId),
  index("idx_automations_enabled").on(table.enabled),
  index("idx_automations_trigger_type").on(table.triggerType),
  index("idx_automations_next_execution").on(table.nextExecutionAt),
]);

/**
 * Automation executions - tracks each time an automation runs
 */
export const automationExecutions = pgTable("automation_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Reference to automation
  automationId: varchar("automation_id").notNull().references(() => automations.id, { onDelete: "cascade" }),

  // Execution status
  status: varchar("status", { length: 20 }).notNull(), // pending, running, completed, failed, skipped

  // What triggered this execution
  triggeredBy: jsonb("triggered_by"),
  // { type: 'event', eventType: 'LEAD_CREATED', entityId: 'lead-123', entityData: {...} }
  // { type: 'schedule', scheduledFor: '2024-01-15T09:00:00Z' }
  // { type: 'manual', triggeredBy: 'user-123' }

  // Results
  conditionResults: jsonb("condition_results"), // { passed: true, conditions: [{ field: '...', passed: true }] }
  actionResults: jsonb("action_results"), // [{ type: 'send_email', status: 'success', result: {...} }]

  // Error information
  errorMessage: text("error_message"),
  errorDetails: jsonb("error_details"), // Stack trace, failed action index, etc.

  // Timing
  duration: integer("duration"), // milliseconds
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("idx_executions_automation_id").on(table.automationId),
  index("idx_executions_status").on(table.status),
  index("idx_executions_started_at").on(table.startedAt),
]);

// =============================================================================
// ZOD SCHEMAS FOR VALIDATION
// =============================================================================

// Trigger config schemas
export const timeTriggerConfigSchema = z.object({
  schedule: z.string(), // Cron expression
  timezone: z.string().optional().default("America/New_York"),
});

export const eventTriggerConfigSchema = z.object({
  eventType: z.string(), // LEAD_CREATED, LEAD_STATUS_CHANGED, etc.
  filters: z.record(z.any()).optional(), // Additional event filters
});

export const conditionTriggerConfigSchema = z.object({
  entity: z.string(), // lead, client, policy
  field: z.string(), // lastContactedAt, renewalDate
  operator: z.enum(conditionOperatorEnum),
  value: z.any(), // '3d', 30, etc.
});

export const triggerConfigSchema = z.union([
  timeTriggerConfigSchema,
  eventTriggerConfigSchema,
  conditionTriggerConfigSchema,
]);

// Condition schema
export const automationConditionSchema = z.object({
  field: z.string(),
  operator: z.enum(conditionOperatorEnum),
  value: z.any(),
});

// Action config schemas
export const sendEmailActionSchema = z.object({
  type: z.literal("send_email"),
  config: z.object({
    templateId: z.string().optional(),
    subject: z.string().optional(),
    body: z.string().optional(),
    to: z.string().optional(), // Supports {{lead.email}} templates
  }),
});

export const sendSmsActionSchema = z.object({
  type: z.literal("send_sms"),
  config: z.object({
    templateId: z.string().optional(),
    message: z.string().optional(),
    to: z.string().optional(),
  }),
});

export const createTaskActionSchema = z.object({
  type: z.literal("create_task"),
  config: z.object({
    title: z.string(),
    description: z.string().optional(),
    dueIn: z.string().optional(), // '1d', '2h', etc.
    assignTo: z.string().optional(), // {{lead.assignedTo}}
    priority: z.enum(["low", "medium", "high"]).optional(),
  }),
});

export const updateLeadActionSchema = z.object({
  type: z.literal("update_lead"),
  config: z.object({
    status: z.string().optional(),
    priority: z.string().optional(),
    pipelineStage: z.string().optional(),
    tags: z.array(z.string()).optional(),
    customFields: z.record(z.any()).optional(),
  }),
});

export const assignLeadActionSchema = z.object({
  type: z.literal("assign_lead"),
  config: z.object({
    strategy: z.enum(["round_robin", "least_busy", "specific"]),
    agentId: z.string().optional(), // For 'specific' strategy
  }),
});

export const addTagActionSchema = z.object({
  type: z.literal("add_tag"),
  config: z.object({
    tags: z.array(z.string()),
  }),
});

export const createActivityActionSchema = z.object({
  type: z.literal("create_activity"),
  config: z.object({
    type: z.string(),
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const sendNotificationActionSchema = z.object({
  type: z.literal("send_notification"),
  config: z.object({
    title: z.string(),
    body: z.string(),
    to: z.string().optional(), // {{lead.assignedTo}} or specific user
    priority: z.enum(["low", "normal", "high"]).optional(),
  }),
});

export const webhookActionSchema = z.object({
  type: z.literal("webhook"),
  config: z.object({
    url: z.string().url(),
    method: z.enum(["GET", "POST", "PUT"]).optional().default("POST"),
    headers: z.record(z.string()).optional(),
    body: z.record(z.any()).optional(),
  }),
});

export const waitActionSchema = z.object({
  type: z.literal("wait"),
  config: z.object({
    duration: z.string(), // '1d', '2h', '30m'
  }),
});

export const automationActionSchema = z.union([
  sendEmailActionSchema,
  sendSmsActionSchema,
  createTaskActionSchema,
  updateLeadActionSchema,
  assignLeadActionSchema,
  addTagActionSchema,
  createActivityActionSchema,
  sendNotificationActionSchema,
  webhookActionSchema,
  waitActionSchema,
]);

// =============================================================================
// INSERT SCHEMAS
// =============================================================================

export const insertAutomationSchema = createInsertSchema(automations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  executedCount: true,
  successCount: true,
  failedCount: true,
  lastExecutedAt: true,
}).extend({
  triggerType: z.enum(triggerTypeEnum),
  triggerConfig: triggerConfigSchema,
  conditions: z.array(automationConditionSchema).optional().default([]),
  actions: z.array(automationActionSchema),
});

export const insertExecutionSchema = createInsertSchema(automationExecutions).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

// =============================================================================
// TYPES
// =============================================================================

export type Automation = typeof automations.$inferSelect;
export type InsertAutomation = z.infer<typeof insertAutomationSchema>;
export type AutomationCondition = z.infer<typeof automationConditionSchema>;
export type AutomationAction = z.infer<typeof automationActionSchema>;

export type AutomationExecution = typeof automationExecutions.$inferSelect;
export type InsertAutomationExecution = z.infer<typeof insertExecutionSchema>;

// =============================================================================
// AUTOMATION TEMPLATES
// =============================================================================

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: "lead-nurturing" | "client-retention" | "policy-management" | "sales" | "lead-management";
  icon: string; // Lucide icon name
  trigger: {
    type: TriggerType;
    config: z.infer<typeof triggerConfigSchema>;
  };
  conditions: AutomationCondition[];
  actions: AutomationAction[];
}

export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  // POST-SALES CALL
  {
    id: "post-sales-call",
    name: "Post-Sales Call",
    description: "Automated follow-up sequence after a sales call",
    category: "sales",
    icon: "Phone",
    trigger: {
      type: "event_based",
      config: { eventType: "CALL_CONNECTED" }
    },
    conditions: [],
    actions: [
      { type: "wait", config: { duration: "30m" } },
      { type: "send_sms", config: { message: "Hi {{lead.firstName}}, thank you for speaking with me today! I'm here if you have any questions about your coverage options. - {{agent.name}}" } },
      { type: "send_email", config: { subject: "Great Speaking With You!", body: "Thank you for taking the time to discuss your insurance needs. I've attached some information that might be helpful..." } }
    ]
  },
  // MISSED CALL
  {
    id: "missed-call",
    name: "Missed Call",
    description: "Re-engage leads who missed your call with SMS follow-up",
    category: "sales",
    icon: "PhoneMissed",
    trigger: {
      type: "event_based",
      config: { eventType: "CALL_FAILED" }
    },
    conditions: [],
    actions: [
      { type: "wait", config: { duration: "5m" } },
      { type: "send_sms", config: { message: "Hi {{lead.firstName}}, sorry I missed you! I was calling about your life insurance quote. When's a good time to connect? - {{agent.name}}" } },
      { type: "create_task", config: { title: "Retry call: {{lead.firstName}} {{lead.lastName}}", dueIn: "2h", priority: "high" } }
    ]
  },
  // APPOINTMENT REMINDER
  {
    id: "appointment-reminder",
    name: "Appointment Reminder",
    description: "Reduce no-shows with automated SMS and email reminders",
    category: "sales",
    icon: "Calendar",
    trigger: {
      type: "event_based",
      config: { eventType: "APPOINTMENT_BOOKED" }
    },
    conditions: [],
    actions: [
      { type: "send_sms", config: { message: "Hi {{lead.firstName}}! Your appointment with {{agent.name}} is confirmed for {{appointment.date}} at {{appointment.time}}. Reply YES to confirm." } },
      { type: "send_email", config: { subject: "Your Appointment is Confirmed!", body: "We look forward to speaking with you about protecting your family's future..." } }
    ]
  },
  // GET YOU COVERED
  {
    id: "get-you-covered",
    name: "Get You Covered",
    description: "Nurture sequence for leads who requested a quote but haven't purchased",
    category: "lead-nurturing",
    icon: "Shield",
    trigger: {
      type: "condition_based",
      config: { entity: "lead", field: "createdAt", operator: "older_than", value: "1d" }
    },
    conditions: [
      { field: "status", operator: "eq", value: "quoted" },
      { field: "policyStatus", operator: "neq", value: "sold" }
    ],
    actions: [
      { type: "send_sms", config: { message: "Hi {{lead.firstName}}, I wanted to follow up on your life insurance quote. Did you know rates increase as we age? Let's lock in your rate today! - {{agent.name}}" } },
      { type: "wait", config: { duration: "3d" } },
      { type: "send_email", config: { subject: "Why Life Insurance Matters for Your Family", body: "Hi {{lead.firstName}}, I wanted to share some important information about protecting your family's future..." } }
    ]
  },
  // PAYMENT REMINDER
  {
    id: "payment-reminder",
    name: "Payment Reminder",
    description: "Automated reminders for upcoming premium payments",
    category: "client-retention",
    icon: "CreditCard",
    trigger: {
      type: "condition_based",
      config: { entity: "policy", field: "paymentDueDate", operator: "days_until", value: 7 }
    },
    conditions: [{ field: "paymentStatus", operator: "neq", value: "paid" }],
    actions: [
      { type: "send_sms", config: { message: "Hi {{client.firstName}}, your {{policy.type}} premium of ${{policy.amount}} is due on {{policy.dueDate}}. Pay online or call us for assistance." } },
      { type: "wait", config: { duration: "5d" } },
      { type: "send_sms", config: { message: "REMINDER: {{client.firstName}}, your premium payment is due in 2 days. Avoid a lapse in coverage - pay now!" } }
    ]
  },
  // CLIENT BIRTHDAY
  {
    id: "client-birthday",
    name: "Client Birthday",
    description: "Send personalized birthday wishes to strengthen relationships",
    category: "client-retention",
    icon: "Cake",
    trigger: {
      type: "condition_based",
      config: { entity: "client", field: "birthday", operator: "is_today", value: null }
    },
    conditions: [],
    actions: [
      { type: "send_sms", config: { message: "Happy Birthday, {{client.firstName}}! Wishing you a wonderful day filled with joy. Thank you for being a valued Heritage Life client! - {{agent.name}}" } },
      { type: "send_email", config: { subject: "Happy Birthday from Heritage Life!", body: "Dear {{client.firstName}},\n\nWishing you a very happy birthday! As your insurance partner, we're grateful for your trust in us.\n\nWarm regards,\n{{agent.name}}" } }
    ]
  }
];
