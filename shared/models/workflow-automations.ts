/**
 * Workflow Automations - Visual workflow builder data model
 * Supports branching logic with nodes and edges (React Flow compatible)
 */

import { pgTable, text, timestamp, varchar, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// =============================================================================
// NODE TYPES
// =============================================================================

export const workflowNodeTypes = ["trigger", "action", "condition", "wait", "end"] as const;
export type WorkflowNodeType = typeof workflowNodeTypes[number];

// =============================================================================
// NODE CONFIGURATION SCHEMAS
// =============================================================================

// Trigger node config
export const triggerNodeConfigSchema = z.object({
  triggerType: z.enum(["event_based", "time_based", "condition_based"]),
  eventType: z.string().optional(),
  schedule: z.string().optional(),
  timezone: z.string().optional(),
  entity: z.string().optional(),
  field: z.string().optional(),
  operator: z.string().optional(),
  value: z.unknown().optional(),
});

// Action node config
export const actionNodeConfigSchema = z.object({
  actionType: z.enum([
    "send_email",
    "send_sms",
    "send_notification",
    "create_task",
    "update_lead",
    "assign_lead",
    "add_tag",
    "webhook",
  ]),
  to: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  message: z.string().optional(),
  templateId: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  dueIn: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  tags: z.array(z.string()).optional(),
  url: z.string().optional(),
  method: z.string().optional(),
  strategy: z.string().optional(),
});

// Condition node config
export const conditionNodeConfigSchema = z.object({
  field: z.string(),
  operator: z.string(),
  value: z.unknown(),
  description: z.string().optional(),
});

// Wait node config
export const waitNodeConfigSchema = z.object({
  duration: z.string(),
  waitUntil: z.string().optional(),
});

// End node config
export const endNodeConfigSchema = z.object({
  status: z.enum(["success", "failed", "cancelled"]).default("success"),
  note: z.string().optional(),
});

// =============================================================================
// WORKFLOW STRUCTURE
// =============================================================================

// Node position
export const nodePositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

// Node data
export const nodeDataSchema = z.object({
  label: z.string(),
  config: z.record(z.unknown()),
});

// Single workflow node
export const workflowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(workflowNodeTypes),
  position: nodePositionSchema,
  data: nodeDataSchema,
});

// Workflow edge
export const workflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  label: z.string().optional(),
});

// Viewport
export const viewportSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number(),
});

// Complete workflow definition
export const workflowDefinitionSchema = z.object({
  nodes: z.array(workflowNodeSchema),
  edges: z.array(workflowEdgeSchema),
  viewport: viewportSchema.optional(),
});

// =============================================================================
// DATABASE TABLE
// =============================================================================

export const workflowAutomations = pgTable("workflow_automations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Ownership
  agentId: text("agent_id").notNull(),

  // Basic info
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  enabled: boolean("enabled").notNull().default(false),

  // Visual workflow definition (React Flow compatible)
  workflow: jsonb("workflow").notNull(),

  // Execution stats
  executedCount: integer("executed_count").notNull().default(0),
  successCount: integer("success_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  lastExecutedAt: timestamp("last_executed_at"),

  // Versioning
  version: integer("version").notNull().default(1),

  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_workflow_automations_agent").on(table.agentId),
  index("idx_workflow_automations_enabled").on(table.enabled),
]);

// =============================================================================
// INSERT/UPDATE SCHEMAS
// =============================================================================

export const insertWorkflowAutomationSchema = createInsertSchema(workflowAutomations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  executedCount: true,
  successCount: true,
  failedCount: true,
  lastExecutedAt: true,
  version: true,
}).extend({
  workflow: workflowDefinitionSchema,
});

// =============================================================================
// TYPES
// =============================================================================

export type WorkflowNode = z.infer<typeof workflowNodeSchema>;
export type WorkflowEdge = z.infer<typeof workflowEdgeSchema>;
export type WorkflowDefinition = z.infer<typeof workflowDefinitionSchema>;
export type WorkflowAutomation = typeof workflowAutomations.$inferSelect;
export type InsertWorkflowAutomation = z.infer<typeof insertWorkflowAutomationSchema>;

// =============================================================================
// WORKFLOW TEMPLATES
// =============================================================================

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  workflow: WorkflowDefinition;
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "appointment-reminder",
    name: "Appointment Reminder Sequence",
    description: "Send reminders based on how far away the appointment is",
    category: "appointments",
    icon: "Calendar",
    workflow: {
      nodes: [
        {
          id: "trigger-1",
          type: "trigger",
          position: { x: 250, y: 50 },
          data: {
            label: "Appointment Booked",
            config: { triggerType: "event_based", eventType: "APPOINTMENT_BOOKED" },
          },
        },
        {
          id: "action-1",
          type: "action",
          position: { x: 250, y: 150 },
          data: {
            label: "Confirmation SMS",
            config: {
              actionType: "send_sms",
              to: "{{appointment.phone}}",
              message: "Hi {{appointment.firstName}}, your appointment is confirmed for {{appointment.date}}!",
            },
          },
        },
        {
          id: "condition-1",
          type: "condition",
          position: { x: 250, y: 270 },
          data: {
            label: "24+ Hours Away?",
            config: { field: "appointment.hoursUntil", operator: "gte", value: 24 },
          },
        },
        {
          id: "wait-1",
          type: "wait",
          position: { x: 100, y: 400 },
          data: {
            label: "Wait 1 Day Before",
            config: { duration: "24h" },
          },
        },
        {
          id: "action-2",
          type: "action",
          position: { x: 100, y: 520 },
          data: {
            label: "Day Before Reminder",
            config: {
              actionType: "send_sms",
              to: "{{appointment.phone}}",
              message: "Reminder: Your appointment is tomorrow!",
            },
          },
        },
        {
          id: "end-1",
          type: "end",
          position: { x: 100, y: 640 },
          data: { label: "End", config: { status: "success" } },
        },
        {
          id: "condition-2",
          type: "condition",
          position: { x: 400, y: 400 },
          data: {
            label: "2+ Hours Away?",
            config: { field: "appointment.hoursUntil", operator: "gte", value: 2 },
          },
        },
        {
          id: "wait-2",
          type: "wait",
          position: { x: 320, y: 520 },
          data: {
            label: "Wait 2 Hours Before",
            config: { duration: "2h" },
          },
        },
        {
          id: "action-3",
          type: "action",
          position: { x: 320, y: 640 },
          data: {
            label: "Same-Day Reminder",
            config: {
              actionType: "send_sms",
              to: "{{appointment.phone}}",
              message: "Your consultation is in 2 hours!",
            },
          },
        },
        {
          id: "end-2",
          type: "end",
          position: { x: 320, y: 760 },
          data: { label: "End", config: { status: "success" } },
        },
        {
          id: "action-4",
          type: "action",
          position: { x: 520, y: 520 },
          data: {
            label: "Immediate Reminder",
            config: {
              actionType: "send_sms",
              to: "{{appointment.phone}}",
              message: "We're about to call you for your consultation!",
            },
          },
        },
        {
          id: "end-3",
          type: "end",
          position: { x: 520, y: 640 },
          data: { label: "End", config: { status: "success" } },
        },
      ],
      edges: [
        { id: "e1", source: "trigger-1", target: "action-1" },
        { id: "e2", source: "action-1", target: "condition-1" },
        { id: "e3", source: "condition-1", target: "wait-1", sourceHandle: "yes", label: "Yes" },
        { id: "e4", source: "condition-1", target: "condition-2", sourceHandle: "no", label: "No" },
        { id: "e5", source: "wait-1", target: "action-2" },
        { id: "e6", source: "action-2", target: "end-1" },
        { id: "e7", source: "condition-2", target: "wait-2", sourceHandle: "yes", label: "Yes" },
        { id: "e8", source: "condition-2", target: "action-4", sourceHandle: "no", label: "No" },
        { id: "e9", source: "wait-2", target: "action-3" },
        { id: "e10", source: "action-3", target: "end-2" },
        { id: "e11", source: "action-4", target: "end-3" },
      ],
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  },
  {
    id: "lead-nurture",
    name: "Lead Nurture Sequence",
    description: "Follow up with new leads based on engagement",
    category: "lead-nurturing",
    icon: "Users",
    workflow: {
      nodes: [
        {
          id: "trigger-1",
          type: "trigger",
          position: { x: 250, y: 50 },
          data: {
            label: "Lead Created",
            config: { triggerType: "event_based", eventType: "LEAD_CREATED" },
          },
        },
        {
          id: "action-1",
          type: "action",
          position: { x: 250, y: 150 },
          data: {
            label: "Welcome Email",
            config: {
              actionType: "send_email",
              to: "{{lead.email}}",
              subject: "Welcome to Heritage Life Solutions",
              body: "Thank you for your interest in protecting your family!",
            },
          },
        },
        {
          id: "wait-1",
          type: "wait",
          position: { x: 250, y: 270 },
          data: {
            label: "Wait 3 Days",
            config: { duration: "3d" },
          },
        },
        {
          id: "condition-1",
          type: "condition",
          position: { x: 250, y: 390 },
          data: {
            label: "Engaged?",
            config: { field: "lead.emailOpened", operator: "eq", value: true },
          },
        },
        {
          id: "action-2",
          type: "action",
          position: { x: 100, y: 510 },
          data: {
            label: "Send Quote",
            config: {
              actionType: "send_email",
              to: "{{lead.email}}",
              subject: "Your Personalized Quote",
              templateId: "quote-offer",
            },
          },
        },
        {
          id: "action-3",
          type: "action",
          position: { x: 400, y: 510 },
          data: {
            label: "Follow-up SMS",
            config: {
              actionType: "send_sms",
              to: "{{lead.phone}}",
              message: "Hi {{lead.firstName}}, did you get a chance to review our email?",
            },
          },
        },
        {
          id: "end-1",
          type: "end",
          position: { x: 100, y: 630 },
          data: { label: "End", config: { status: "success" } },
        },
        {
          id: "end-2",
          type: "end",
          position: { x: 400, y: 630 },
          data: { label: "End", config: { status: "success" } },
        },
      ],
      edges: [
        { id: "e1", source: "trigger-1", target: "action-1" },
        { id: "e2", source: "action-1", target: "wait-1" },
        { id: "e3", source: "wait-1", target: "condition-1" },
        { id: "e4", source: "condition-1", target: "action-2", sourceHandle: "yes", label: "Yes" },
        { id: "e5", source: "condition-1", target: "action-3", sourceHandle: "no", label: "No" },
        { id: "e6", source: "action-2", target: "end-1" },
        { id: "e7", source: "action-3", target: "end-2" },
      ],
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  },
];
