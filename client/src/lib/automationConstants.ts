/**
 * Shared constants for the Automations system
 * Single source of truth for icons, action types, and validation
 */

import {
  Zap,
  Clock,
  Calendar,
  Bell,
  Mail,
  MessageSquare,
  FileText,
  Users,
  Target,
  RefreshCw,
  Flame,
  CheckSquare,
  User,
  Tag,
  Webhook,
  Timer,
  Phone,
  PhoneMissed,
  Shield,
  CreditCard,
  Cake,
  type LucideIcon,
} from "lucide-react";

// =============================================================================
// ICON MAPPINGS
// =============================================================================

/**
 * Icons for automation templates (by template ID or icon name)
 */
export const AUTOMATION_ICONS: Record<string, LucideIcon> = {
  // Template icons
  Bell: Bell,
  Calendar: Calendar,
  RefreshCw: RefreshCw,
  Users: Users,
  FileText: FileText,
  Flame: Flame,
  Target: Target,
  Clock: Clock,
  Mail: Mail,
  MessageSquare: MessageSquare,
  Zap: Zap,
  Phone: Phone,
  PhoneMissed: PhoneMissed,
  Shield: Shield,
  CreditCard: CreditCard,
  Cake: Cake,
  // Default
  default: Zap,
};

/**
 * Icons for action types
 */
export const ACTION_ICONS: Record<string, LucideIcon> = {
  send_email: Mail,
  send_sms: MessageSquare,
  send_notification: Bell,
  create_task: CheckSquare,
  update_lead: User,
  assign_lead: Users,
  add_tag: Tag,
  create_activity: FileText,
  webhook: Webhook,
  wait: Timer,
  default: Zap,
};

/**
 * Get icon for a template or action
 */
export function getAutomationIcon(iconName: string | undefined): LucideIcon {
  if (!iconName) return AUTOMATION_ICONS.default;
  return AUTOMATION_ICONS[iconName] || AUTOMATION_ICONS.default;
}

/**
 * Get icon for an action type
 */
export function getActionIcon(actionType: string): LucideIcon {
  return ACTION_ICONS[actionType] || ACTION_ICONS.default;
}

// =============================================================================
// CATEGORY STYLING
// =============================================================================

/**
 * Gradient colors for template categories
 */
export const CATEGORY_GRADIENTS: Record<string, string> = {
  "lead-nurturing": "from-amber-400 to-orange-500",
  "client-retention": "from-purple-400 to-violet-500",
  "policy-management": "from-violet-400 to-purple-500",
  "sales": "from-emerald-400 to-green-500",
  "lead-management": "from-blue-400 to-indigo-500",
  default: "from-violet-400 to-purple-500",
};

/**
 * Get gradient class for a category
 */
export function getCategoryGradient(category: string | undefined): string {
  if (!category) return CATEGORY_GRADIENTS.default;
  return CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS.default;
}

// =============================================================================
// ACTION TYPES
// =============================================================================

export interface ActionTypeConfig {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

export const ACTION_TYPES: ActionTypeConfig[] = [
  {
    value: "send_email",
    label: "Send Email",
    icon: Mail,
    color: "bg-blue-100 text-blue-600",
    description: "Send an email to the lead or client",
  },
  {
    value: "send_sms",
    label: "Send SMS",
    icon: MessageSquare,
    color: "bg-green-100 text-green-600",
    description: "Send a text message",
  },
  {
    value: "send_notification",
    label: "Send Notification",
    icon: Bell,
    color: "bg-purple-100 text-purple-600",
    description: "Send a push notification",
  },
  {
    value: "create_task",
    label: "Create Task",
    icon: CheckSquare,
    color: "bg-amber-100 text-amber-600",
    description: "Create a follow-up task",
  },
  {
    value: "update_lead",
    label: "Update Lead",
    icon: User,
    color: "bg-cyan-100 text-cyan-600",
    description: "Update lead status or fields",
  },
  {
    value: "add_tag",
    label: "Add Tag",
    icon: Tag,
    color: "bg-pink-100 text-pink-600",
    description: "Add tags to the lead",
  },
  {
    value: "webhook",
    label: "Webhook",
    icon: Webhook,
    color: "bg-gray-100 text-gray-600",
    description: "Call an external URL",
  },
  {
    value: "wait",
    label: "Wait/Delay",
    icon: Timer,
    color: "bg-orange-100 text-orange-600",
    description: "Wait before next action",
  },
];

// =============================================================================
// TRIGGER TYPES
// =============================================================================

export interface TriggerTypeConfig {
  type: "event_based" | "time_based" | "condition_based";
  label: string;
  icon: LucideIcon;
  description: string;
}

export const TRIGGER_TYPES: TriggerTypeConfig[] = [
  {
    type: "event_based",
    label: "Event",
    icon: Zap,
    description: "When something happens",
  },
  {
    type: "time_based",
    label: "Schedule",
    icon: Clock,
    description: "Run on a schedule",
  },
  {
    type: "condition_based",
    label: "Condition",
    icon: Target,
    description: "When data matches",
  },
];

// =============================================================================
// EVENT TYPES
// =============================================================================

export interface EventTypeConfig {
  value: string;
  label: string;
  description: string;
}

export const EVENT_TYPES: EventTypeConfig[] = [
  { value: "LEAD_CREATED", label: "Lead Created", description: "When a new lead is added" },
  { value: "LEAD_SCORED", label: "Lead Scored", description: "When a lead score changes" },
  { value: "EMAIL_ENGAGED", label: "Email Engaged", description: "When email is opened/clicked" },
  { value: "SMS_RESPONSE_RECEIVED", label: "SMS Response", description: "When SMS reply received" },
  { value: "APPOINTMENT_BOOKED", label: "Appointment Booked", description: "When appointment scheduled" },
  { value: "POLICY_SOLD", label: "Policy Sold", description: "When a policy is sold" },
  { value: "APPLICATION_SUBMITTED", label: "Application Submitted", description: "When application filed" },
];

// =============================================================================
// CONDITION OPERATORS
// =============================================================================

export interface OperatorConfig {
  value: string;
  label: string;
  requiresValue: boolean;
}

export const CONDITION_OPERATORS: OperatorConfig[] = [
  { value: "eq", label: "equals", requiresValue: true },
  { value: "neq", label: "not equals", requiresValue: true },
  { value: "gt", label: "greater than", requiresValue: true },
  { value: "gte", label: "greater or equal", requiresValue: true },
  { value: "lt", label: "less than", requiresValue: true },
  { value: "lte", label: "less or equal", requiresValue: true },
  { value: "contains", label: "contains", requiresValue: true },
  { value: "in", label: "is one of", requiresValue: true },
  { value: "not_in", label: "is not one of", requiresValue: true },
  { value: "is_empty", label: "is empty", requiresValue: false },
  { value: "is_not_empty", label: "is not empty", requiresValue: false },
];

// =============================================================================
// CONDITION FIELDS
// =============================================================================

export interface ConditionFieldConfig {
  value: string;
  label: string;
}

export const CONDITION_FIELDS: ConditionFieldConfig[] = [
  { value: "leadScore", label: "Lead Score" },
  { value: "status", label: "Status" },
  { value: "priority", label: "Priority" },
  { value: "pipelineStage", label: "Pipeline Stage" },
  { value: "source", label: "Lead Source" },
  { value: "coverageType", label: "Coverage Type" },
  { value: "tags", label: "Tags" },
];

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate action configuration based on action type
 */
export function isActionConfigValid(action: { type: string; config: Record<string, unknown> }): boolean {
  const { type, config } = action;

  switch (type) {
    case "send_email":
      // Email needs subject OR templateId, and a recipient
      return !!(config.templateId || config.subject) && !!config.to;

    case "send_sms":
      // SMS needs a message and recipient
      return !!config.message && !!config.to;

    case "send_notification":
      // Notification needs title and body
      return !!config.title && !!config.body;

    case "create_task":
      // Task needs a title
      return !!config.title;

    case "update_lead":
      // Update needs at least one field to update
      return !!(config.status || config.priority || config.pipelineStage || config.tags);

    case "add_tag":
      // Tag needs at least one tag
      return Array.isArray(config.tags) && config.tags.length > 0;

    case "webhook":
      // Webhook needs a valid URL
      return !!config.url;

    case "wait":
      // Wait needs a duration
      return !!config.duration;

    default:
      return false;
  }
}

/**
 * Get validation message for an action
 */
export function getActionValidationMessage(action: { type: string; config: Record<string, unknown> }): string | null {
  const { type, config } = action;

  switch (type) {
    case "send_email":
      if (!config.to) return "Email recipient is required";
      if (!config.templateId && !config.subject) return "Email subject or template is required";
      return null;

    case "send_sms":
      if (!config.to) return "SMS recipient is required";
      if (!config.message) return "SMS message is required";
      return null;

    case "send_notification":
      if (!config.title) return "Notification title is required";
      if (!config.body) return "Notification body is required";
      return null;

    case "create_task":
      if (!config.title) return "Task title is required";
      return null;

    case "update_lead":
      if (!config.status && !config.priority && !config.pipelineStage && !config.tags) {
        return "At least one field to update is required";
      }
      return null;

    case "add_tag":
      if (!Array.isArray(config.tags) || config.tags.length === 0) {
        return "At least one tag is required";
      }
      return null;

    case "webhook":
      if (!config.url) return "Webhook URL is required";
      return null;

    case "wait":
      if (!config.duration) return "Wait duration is required";
      return null;

    default:
      return "Unknown action type";
  }
}

/**
 * Get default config for an action type
 */
export function getDefaultActionConfig(type: string): Record<string, unknown> {
  switch (type) {
    case "send_email":
      return { subject: "", body: "", to: "{{lead.email}}" };
    case "send_sms":
      return { message: "", to: "{{lead.phone}}" };
    case "send_notification":
      return { title: "", body: "", priority: "normal" };
    case "create_task":
      return { title: "", dueIn: "1d", priority: "medium" };
    case "update_lead":
      return { status: "" };
    case "add_tag":
      return { tags: [] };
    case "webhook":
      return { url: "", method: "POST" };
    case "wait":
      return { duration: "1d" };
    default:
      return {};
  }
}

// =============================================================================
// FORMATTING HELPERS
// =============================================================================

/**
 * Format trigger type for display
 */
export function formatTriggerType(triggerType: string): string {
  switch (triggerType) {
    case "time_based": return "Scheduled";
    case "event_based": return "Event";
    case "condition_based": return "Condition";
    default: return triggerType;
  }
}

/**
 * Format action type for display
 */
export function formatActionType(actionType: string): string {
  switch (actionType) {
    case "send_email": return "Email";
    case "send_sms": return "SMS";
    case "create_task": return "Task";
    case "send_notification": return "Notify";
    case "update_lead": return "Update";
    case "assign_lead": return "Assign";
    case "add_tag": return "Tag";
    case "webhook": return "Webhook";
    case "wait": return "Wait";
    default: return actionType;
  }
}

/**
 * Format a list of actions for summary display
 */
export function formatActionsSummary(actions: Array<{ type: string }>): string {
  if (!actions || actions.length === 0) return "No actions";
  return actions.map(a => formatActionType(a.type)).join(" + ");
}

/**
 * Format conditions for summary display
 */
export function formatConditionsSummary(conditions: Array<{ field: string; operator: string; value: unknown }>): string {
  if (!conditions || conditions.length === 0) return "No conditions";
  if (conditions.length === 1) {
    const c = conditions[0];
    return `${c.field} ${c.operator} ${c.value}`;
  }
  return `${conditions.length} conditions`;
}

/**
 * Format relative time
 */
export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return "Never";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Format duration in milliseconds to human readable
 */
export function formatDuration(ms: number | null): string {
  if (!ms) return "N/A";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}
