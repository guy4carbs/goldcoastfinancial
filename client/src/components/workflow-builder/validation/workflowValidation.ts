/**
 * Workflow Node Validation Schemas
 * Zod schemas for validating node configurations
 */

import { z } from "zod";

// =============================================================================
// TRIGGER VALIDATION
// =============================================================================

export const eventBasedTriggerSchema = z.object({
  triggerType: z.literal("event_based"),
  eventType: z.string().min(1, "Event type is required"),
});

export const timeBasedTriggerSchema = z.object({
  triggerType: z.literal("time_based"),
  schedule: z.string().min(1, "Schedule is required"),
  timezone: z.string().optional(),
});

export const conditionBasedTriggerSchema = z.object({
  triggerType: z.literal("condition_based"),
  entity: z.string().min(1, "Entity is required"),
  field: z.string().min(1, "Field is required"),
  operator: z.string().min(1, "Operator is required"),
  value: z.any(),
});

export const triggerConfigSchema = z.discriminatedUnion("triggerType", [
  eventBasedTriggerSchema,
  timeBasedTriggerSchema,
  conditionBasedTriggerSchema,
]);

// =============================================================================
// ACTION VALIDATION SCHEMAS
// =============================================================================

export const sendEmailConfigSchema = z.object({
  to: z.string().min(1, "Recipient is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  templateId: z.string().optional(),
});

export const sendSmsConfigSchema = z.object({
  to: z.string().min(1, "Recipient is required"),
  message: z.string().min(1, "Message is required").max(320, "Message too long (max 320 chars)"),
});

export const sendNotificationConfigSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  priority: z.enum(["low", "normal", "high"]).optional(),
});

export const createTaskConfigSchema = z.object({
  title: z.string().min(1, "Title is required"),
  dueIn: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assignTo: z.string().optional(),
});

export const updateLeadConfigSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  pipelineStage: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).refine(
  (data) => data.status || data.priority || data.pipelineStage || data.tags,
  { message: "At least one field must be set" }
);

export const addTagConfigSchema = z.object({
  tags: z.array(z.string()).min(1, "At least one tag is required"),
});

export const webhookConfigSchema = z.object({
  url: z.string().url("Invalid URL format"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).optional(),
  headers: z.record(z.string()).optional(),
  body: z.string().optional(),
});

export const waitConfigSchema = z.object({
  duration: z.string().regex(/^\d+[mhd]$/, "Invalid format. Use: 5m, 2h, or 1d"),
});

// Map of action type to schema
export const actionConfigSchemas: Record<string, z.ZodType<unknown>> = {
  send_email: sendEmailConfigSchema,
  send_sms: sendSmsConfigSchema,
  send_notification: sendNotificationConfigSchema,
  create_task: createTaskConfigSchema,
  update_lead: updateLeadConfigSchema,
  add_tag: addTagConfigSchema,
  webhook: webhookConfigSchema,
  wait: waitConfigSchema,
};

// =============================================================================
// CONDITION VALIDATION
// =============================================================================

export const conditionConfigSchema = z.object({
  field: z.string().min(1, "Field is required"),
  operator: z.string().min(1, "Operator is required"),
  value: z.any(),
  description: z.string().optional(),
});

// =============================================================================
// END NODE VALIDATION
// =============================================================================

export const endConfigSchema = z.object({
  status: z.enum(["success", "failure", "cancelled"]).optional(),
});

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate node configuration based on node type
 */
export function validateNodeConfig(
  nodeType: string,
  config: Record<string, unknown>
): ValidationResult {
  let schema: z.ZodType<unknown>;

  switch (nodeType) {
    case "trigger":
      schema = triggerConfigSchema;
      break;
    case "action":
      const actionType = config.actionType as string;
      schema = actionConfigSchemas[actionType];
      if (!schema) {
        return { valid: false, errors: { actionType: "Unknown action type" } };
      }
      break;
    case "condition":
      schema = conditionConfigSchema;
      break;
    case "wait":
      schema = waitConfigSchema;
      break;
    case "end":
      schema = endConfigSchema;
      break;
    default:
      return { valid: true, errors: {} };
  }

  const result = schema.safeParse(config);

  if (result.success) {
    return { valid: true, errors: {} };
  }

  // Convert Zod errors to a flat object
  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    errors[path || "_root"] = issue.message;
  });

  return { valid: false, errors };
}

/**
 * Get validation errors for a specific field
 */
export function getFieldError(
  errors: Record<string, string>,
  field: string
): string | undefined {
  return errors[field];
}

/**
 * Check if configuration has any validation errors
 */
export function hasValidationErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}
