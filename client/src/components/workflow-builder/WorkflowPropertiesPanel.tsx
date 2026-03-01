/**
 * Workflow Properties Panel
 * Right sidebar for editing selected node configuration - Heritage Design System
 * Includes real-time validation and template variable hints
 */

import { useState, useEffect, useCallback } from "react";
import {
  Zap,
  Bell,
  GitBranch,
  Clock,
  CircleStop,
  X,
  AlertCircle,
  Copy,
  Trash2,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWorkflowStore } from "./hooks/useWorkflowStore";
import { validateNodeConfig } from "./validation/workflowValidation";
import { RADIUS, SHADOW, GLASS } from "@/lib/heritageDesignSystem";
import { cn } from "@/lib/utils";

// =============================================================================
// CONSTANTS
// =============================================================================

// Event types for triggers
const TRIGGER_EVENTS = [
  { value: "LEAD_CREATED", label: "Lead Created" },
  { value: "LEAD_UPDATED", label: "Lead Updated" },
  { value: "LEAD_SCORED", label: "Lead Scored" },
  { value: "APPOINTMENT_BOOKED", label: "Appointment Booked" },
  { value: "APPOINTMENT_COMPLETED", label: "Appointment Completed" },
  { value: "CALL_CONNECTED", label: "Call Connected" },
  { value: "CALL_FAILED", label: "Missed Call" },
  { value: "POLICY_SOLD", label: "Policy Sold" },
  { value: "PAYMENT_PROCESSED", label: "Payment Processed" },
  { value: "EMAIL_ENGAGED", label: "Email Opened/Clicked" },
  { value: "SMS_RESPONSE_RECEIVED", label: "SMS Response Received" },
];

// Action types
const ACTION_TYPES = [
  { value: "send_email", label: "Send Email" },
  { value: "send_sms", label: "Send SMS" },
  { value: "send_notification", label: "Send Notification" },
  { value: "create_task", label: "Create Task" },
  { value: "update_lead", label: "Update Lead" },
  { value: "assign_lead", label: "Assign Lead" },
  { value: "add_tag", label: "Add Tag" },
  { value: "webhook", label: "Call Webhook" },
];

// Condition operators
const OPERATORS = [
  { value: "eq", label: "Equals", requiresValue: true },
  { value: "neq", label: "Not Equals", requiresValue: true },
  { value: "gt", label: "Greater Than", requiresValue: true },
  { value: "gte", label: "Greater or Equal", requiresValue: true },
  { value: "lt", label: "Less Than", requiresValue: true },
  { value: "lte", label: "Less or Equal", requiresValue: true },
  { value: "contains", label: "Contains", requiresValue: true },
  { value: "not_contains", label: "Does Not Contain", requiresValue: true },
  { value: "is_empty", label: "Is Empty", requiresValue: false },
  { value: "is_not_empty", label: "Is Not Empty", requiresValue: false },
];

// Common fields for conditions
const CONDITION_FIELDS = [
  { value: "lead.status", label: "Lead Status" },
  { value: "lead.source", label: "Lead Source" },
  { value: "lead.leadScore", label: "Lead Score" },
  { value: "lead.priority", label: "Lead Priority" },
  { value: "lead.pipelineStage", label: "Pipeline Stage" },
  { value: "lead.emailOpened", label: "Email Opened" },
  { value: "lead.smsReplied", label: "SMS Replied" },
  { value: "appointment.hoursUntil", label: "Hours Until Appointment" },
  { value: "appointment.status", label: "Appointment Status" },
  { value: "policy.type", label: "Policy Type" },
  { value: "payment.status", label: "Payment Status" },
];

// Duration presets
const DURATION_PRESETS = [
  { value: "5m", label: "5 minutes" },
  { value: "15m", label: "15 minutes" },
  { value: "30m", label: "30 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "2h", label: "2 hours" },
  { value: "6h", label: "6 hours" },
  { value: "12h", label: "12 hours" },
  { value: "1d", label: "1 day" },
  { value: "2d", label: "2 days" },
  { value: "3d", label: "3 days" },
  { value: "7d", label: "1 week" },
];

// Template variables
const TEMPLATE_VARIABLES = [
  { category: "Lead", variables: ["lead.firstName", "lead.lastName", "lead.email", "lead.phone", "lead.status"] },
  { category: "Agent", variables: ["agent.firstName", "agent.lastName", "agent.email", "agent.phone"] },
  { category: "Appointment", variables: ["appointment.date", "appointment.time", "appointment.type"] },
  { category: "Policy", variables: ["policy.type", "policy.amount", "policy.carrier"] },
];

const NODE_CONFIG: Record<string, { icon: typeof Zap; gradient: string; shadowColor: string }> = {
  trigger: { icon: Zap, gradient: "from-emerald-500 to-green-600", shadowColor: SHADOW.glow.emerald },
  action: { icon: Bell, gradient: "from-teal-500 to-cyan-600", shadowColor: SHADOW.glow.cyan },
  condition: { icon: GitBranch, gradient: "from-amber-500 to-orange-500", shadowColor: SHADOW.glow.amber },
  wait: { icon: Clock, gradient: "from-cyan-500 to-blue-500", shadowColor: SHADOW.glow.cyan },
  end: { icon: CircleStop, gradient: "from-rose-500 to-red-600", shadowColor: "0 4px 14px rgba(244, 63, 94, 0.25)" },
};

// =============================================================================
// COMPONENTS
// =============================================================================

// Field error display component
function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      <span>{error}</span>
    </p>
  );
}

// Template variable hint component
function TemplateVariableHint({ field }: { field: "email" | "sms" | "message" }) {
  const relevantVars = field === "email"
    ? ["lead.firstName", "lead.email", "agent.firstName"]
    : ["lead.firstName", "lead.phone", "appointment.date"];

  return (
    <div className="flex items-center gap-1 mt-1">
      <Info className="w-3 h-3 text-slate-400" />
      <span className="text-[10px] text-slate-400">
        Variables: {relevantVars.map(v => `{{${v}}}`).join(", ")}
      </span>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface WorkflowPropertiesPanelProps {
  className?: string;
}

export function WorkflowPropertiesPanel({ className = "" }: WorkflowPropertiesPanelProps) {
  const { selectedNode, updateNode, deleteNode, setSelectedNode, duplicateNode } = useWorkflowStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate on config changes
  const validateConfig = useCallback((nodeType: string, config: Record<string, unknown>) => {
    const result = validateNodeConfig(nodeType, config);
    setErrors(result.errors);
  }, []);

  // Update validation when selected node changes
  useEffect(() => {
    if (selectedNode) {
      validateConfig(selectedNode.type || "action", selectedNode.data?.config || {});
    } else {
      setErrors({});
    }
  }, [selectedNode, validateConfig]);

  if (!selectedNode) {
    return (
      <div
        className={`flex flex-col h-full border-l ${className}`}
        style={{
          background: GLASS.background,
          backdropFilter: `blur(${GLASS.blur}px)`,
          borderColor: GLASS.border,
        }}
      >
        <div className="p-4 border-b" style={{ borderColor: GLASS.border }}>
          <h3 className="text-sm font-semibold text-slate-700">Properties</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-4 gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <Bell className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500 text-center">
            Select a node to edit its properties
          </p>
          <p className="text-xs text-slate-400 text-center">
            Click any node on the canvas
          </p>
        </div>
      </div>
    );
  }

  const nodeType = selectedNode.type || "action";
  const nodeData = selectedNode.data;
  const config = NODE_CONFIG[nodeType];
  const Icon = config.icon;
  const hasErrors = Object.keys(errors).length > 0;

  const handleLabelChange = (label: string) => {
    updateNode(selectedNode.id, { label });
  };

  const handleConfigChange = (key: string, value: unknown) => {
    const newConfig = { ...nodeData.config, [key]: value };
    updateNode(selectedNode.id, { config: newConfig });
    validateConfig(nodeType, newConfig);
  };

  const handleDelete = () => {
    deleteNode(selectedNode.id);
  };

  const handleDuplicate = () => {
    duplicateNode(selectedNode.id);
  };

  const operatorRequiresValue = () => {
    const op = OPERATORS.find(o => o.value === nodeData.config?.operator);
    return op?.requiresValue !== false;
  };

  return (
    <TooltipProvider>
      <div
        className={`flex flex-col h-full border-l ${className}`}
        style={{
          background: GLASS.background,
          backdropFilter: `blur(${GLASS.blur}px)`,
          borderColor: GLASS.border,
        }}
      >
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: GLASS.border }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-lg bg-gradient-to-br ${config.gradient}`}
                style={{ boxShadow: config.shadowColor }}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 capitalize">
                  {nodeType} Properties
                </h3>
                {hasErrors && (
                  <span className="text-[10px] text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Incomplete configuration
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Common: Label */}
          <div className="space-y-2">
            <Label className="text-slate-700 text-xs font-medium">Label</Label>
            <Input
              value={nodeData.label || ""}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="Node label"
              className="bg-white border-slate-200 text-slate-900"
              style={{ borderRadius: RADIUS.input }}
            />
          </div>

          {/* Trigger-specific fields */}
          {nodeType === "trigger" && (
            <>
              <div className="space-y-2">
                <Label className="text-slate-700 text-xs font-medium">Trigger Type</Label>
                <Select
                  value={nodeData.config?.triggerType || "event_based"}
                  onValueChange={(v) => handleConfigChange("triggerType", v)}
                >
                  <SelectTrigger className="bg-white border-slate-200" style={{ borderRadius: RADIUS.input }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event_based">Event Based</SelectItem>
                    <SelectItem value="time_based">Time Based</SelectItem>
                    <SelectItem value="condition_based">Condition Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {nodeData.config?.triggerType === "event_based" && (
                <div className="space-y-2">
                  <Label className="text-slate-700 text-xs font-medium">
                    Event <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    value={nodeData.config?.eventType || ""}
                    onValueChange={(v) => handleConfigChange("eventType", v)}
                  >
                    <SelectTrigger
                      className={cn(
                        "bg-white border-slate-200",
                        errors.eventType && "border-red-300 focus:ring-red-200"
                      )}
                      style={{ borderRadius: RADIUS.input }}
                    >
                      <SelectValue placeholder="Select event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIGGER_EVENTS.map((event) => (
                        <SelectItem key={event.value} value={event.value}>
                          {event.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError error={errors.eventType} />
                </div>
              )}

              {nodeData.config?.triggerType === "time_based" && (
                <div className="space-y-2">
                  <Label className="text-slate-700 text-xs font-medium">
                    Schedule <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    value={nodeData.config?.schedule || ""}
                    onChange={(e) => handleConfigChange("schedule", e.target.value)}
                    placeholder="0 9 * * *"
                    className={cn(
                      "bg-white border-slate-200 font-mono text-sm",
                      errors.schedule && "border-red-300 focus:ring-red-200"
                    )}
                    style={{ borderRadius: RADIUS.input }}
                  />
                  <p className="text-xs text-slate-500">
                    Cron format: minute hour day month weekday
                  </p>
                  <FieldError error={errors.schedule} />
                </div>
              )}
            </>
          )}

          {/* Action-specific fields */}
          {nodeType === "action" && (
            <>
              <div className="space-y-2">
                <Label className="text-slate-700 text-xs font-medium">
                  Action Type <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={nodeData.config?.actionType || ""}
                  onValueChange={(v) => handleConfigChange("actionType", v)}
                >
                  <SelectTrigger
                    className={cn(
                      "bg-white border-slate-200",
                      errors.actionType && "border-red-300"
                    )}
                    style={{ borderRadius: RADIUS.input }}
                  >
                    <SelectValue placeholder="Select action..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_TYPES.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        {action.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError error={errors.actionType} />
              </div>

              {/* Send Email */}
              {nodeData.config?.actionType === "send_email" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-xs font-medium">
                      To <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      value={nodeData.config?.to || ""}
                      onChange={(e) => handleConfigChange("to", e.target.value)}
                      placeholder="{{lead.email}}"
                      className={cn(
                        "bg-white border-slate-200",
                        errors.to && "border-red-300"
                      )}
                      style={{ borderRadius: RADIUS.input }}
                    />
                    <FieldError error={errors.to} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-xs font-medium">
                      Subject <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      value={nodeData.config?.subject || ""}
                      onChange={(e) => handleConfigChange("subject", e.target.value)}
                      placeholder="Email subject"
                      className={cn(
                        "bg-white border-slate-200",
                        errors.subject && "border-red-300"
                      )}
                      style={{ borderRadius: RADIUS.input }}
                    />
                    <FieldError error={errors.subject} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-xs font-medium">
                      Body <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      value={nodeData.config?.body || ""}
                      onChange={(e) => handleConfigChange("body", e.target.value)}
                      placeholder="Hi {{lead.firstName}},..."
                      className={cn(
                        "bg-white border-slate-200 min-h-[100px]",
                        errors.body && "border-red-300"
                      )}
                      style={{ borderRadius: RADIUS.input }}
                    />
                    <TemplateVariableHint field="email" />
                    <FieldError error={errors.body} />
                  </div>
                </>
              )}

              {/* Send SMS */}
              {nodeData.config?.actionType === "send_sms" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-xs font-medium">
                      To <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      value={nodeData.config?.to || ""}
                      onChange={(e) => handleConfigChange("to", e.target.value)}
                      placeholder="{{lead.phone}}"
                      className={cn(
                        "bg-white border-slate-200",
                        errors.to && "border-red-300"
                      )}
                      style={{ borderRadius: RADIUS.input }}
                    />
                    <FieldError error={errors.to} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-700 text-xs font-medium">
                        Message <span className="text-red-400">*</span>
                      </Label>
                      <span className={cn(
                        "text-[10px]",
                        (nodeData.config?.message?.length || 0) > 160 ? "text-amber-600" : "text-slate-400"
                      )}>
                        {nodeData.config?.message?.length || 0}/320
                      </span>
                    </div>
                    <Textarea
                      value={nodeData.config?.message || ""}
                      onChange={(e) => handleConfigChange("message", e.target.value)}
                      placeholder="Hi {{lead.firstName}}, ..."
                      className={cn(
                        "bg-white border-slate-200 min-h-[80px]",
                        errors.message && "border-red-300"
                      )}
                      style={{ borderRadius: RADIUS.input }}
                    />
                    <TemplateVariableHint field="sms" />
                    <FieldError error={errors.message} />
                  </div>
                </>
              )}

              {/* Send Notification */}
              {nodeData.config?.actionType === "send_notification" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-xs font-medium">
                      Title <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      value={nodeData.config?.title || ""}
                      onChange={(e) => handleConfigChange("title", e.target.value)}
                      placeholder="Notification title"
                      className={cn(
                        "bg-white border-slate-200",
                        errors.title && "border-red-300"
                      )}
                      style={{ borderRadius: RADIUS.input }}
                    />
                    <FieldError error={errors.title} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-xs font-medium">
                      Body <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      value={nodeData.config?.body || ""}
                      onChange={(e) => handleConfigChange("body", e.target.value)}
                      placeholder="Notification message..."
                      className={cn(
                        "bg-white border-slate-200",
                        errors.body && "border-red-300"
                      )}
                      style={{ borderRadius: RADIUS.input }}
                    />
                    <FieldError error={errors.body} />
                  </div>
                </>
              )}

              {/* Create Task */}
              {nodeData.config?.actionType === "create_task" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-xs font-medium">
                      Task Title <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      value={nodeData.config?.title || ""}
                      onChange={(e) => handleConfigChange("title", e.target.value)}
                      placeholder="Follow up with {{lead.firstName}}"
                      className={cn(
                        "bg-white border-slate-200",
                        errors.title && "border-red-300"
                      )}
                      style={{ borderRadius: RADIUS.input }}
                    />
                    <FieldError error={errors.title} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-xs font-medium">Due In</Label>
                    <Select
                      value={nodeData.config?.dueIn || "1d"}
                      onValueChange={(v) => handleConfigChange("dueIn", v)}
                    >
                      <SelectTrigger className="bg-white border-slate-200" style={{ borderRadius: RADIUS.input }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATION_PRESETS.map((preset) => (
                          <SelectItem key={preset.value} value={preset.value}>
                            {preset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-xs font-medium">Priority</Label>
                    <Select
                      value={nodeData.config?.priority || "medium"}
                      onValueChange={(v) => handleConfigChange("priority", v)}
                    >
                      <SelectTrigger className="bg-white border-slate-200" style={{ borderRadius: RADIUS.input }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Webhook */}
              {nodeData.config?.actionType === "webhook" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-xs font-medium">
                      URL <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      value={nodeData.config?.url || ""}
                      onChange={(e) => handleConfigChange("url", e.target.value)}
                      placeholder="https://api.example.com/webhook"
                      className={cn(
                        "bg-white border-slate-200",
                        errors.url && "border-red-300"
                      )}
                      style={{ borderRadius: RADIUS.input }}
                    />
                    <FieldError error={errors.url} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-xs font-medium">Method</Label>
                    <Select
                      value={nodeData.config?.method || "POST"}
                      onValueChange={(v) => handleConfigChange("method", v)}
                    >
                      <SelectTrigger className="bg-white border-slate-200" style={{ borderRadius: RADIUS.input }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Add Tag */}
              {nodeData.config?.actionType === "add_tag" && (
                <div className="space-y-2">
                  <Label className="text-slate-700 text-xs font-medium">
                    Tags <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    value={(nodeData.config?.tags || []).join(", ")}
                    onChange={(e) => handleConfigChange("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                    placeholder="hot-lead, interested, follow-up"
                    className={cn(
                      "bg-white border-slate-200",
                      errors.tags && "border-red-300"
                    )}
                    style={{ borderRadius: RADIUS.input }}
                  />
                  <p className="text-xs text-slate-500">Separate multiple tags with commas</p>
                  <FieldError error={errors.tags} />
                </div>
              )}

              {/* Update Lead */}
              {nodeData.config?.actionType === "update_lead" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-xs font-medium">Status</Label>
                    <Select
                      value={nodeData.config?.status || ""}
                      onValueChange={(v) => handleConfigChange("status", v)}
                    >
                      <SelectTrigger className="bg-white border-slate-200" style={{ borderRadius: RADIUS.input }}>
                        <SelectValue placeholder="Select status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="nurturing">Nurturing</SelectItem>
                        <SelectItem value="closed_won">Closed Won</SelectItem>
                        <SelectItem value="closed_lost">Closed Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-xs font-medium">Priority</Label>
                    <Select
                      value={nodeData.config?.priority || ""}
                      onValueChange={(v) => handleConfigChange("priority", v)}
                    >
                      <SelectTrigger className="bg-white border-slate-200" style={{ borderRadius: RADIUS.input }}>
                        <SelectValue placeholder="Select priority..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <FieldError error={errors._root} />
                </>
              )}
            </>
          )}

          {/* Condition-specific fields */}
          {nodeType === "condition" && (
            <>
              <div className="space-y-2">
                <Label className="text-slate-700 text-xs font-medium">
                  Field <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={nodeData.config?.field || ""}
                  onValueChange={(v) => handleConfigChange("field", v)}
                >
                  <SelectTrigger
                    className={cn(
                      "bg-white border-slate-200",
                      errors.field && "border-red-300"
                    )}
                    style={{ borderRadius: RADIUS.input }}
                  >
                    <SelectValue placeholder="Select field..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_FIELDS.map((field) => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError error={errors.field} />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 text-xs font-medium">
                  Operator <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={nodeData.config?.operator || ""}
                  onValueChange={(v) => handleConfigChange("operator", v)}
                >
                  <SelectTrigger
                    className={cn(
                      "bg-white border-slate-200",
                      errors.operator && "border-red-300"
                    )}
                    style={{ borderRadius: RADIUS.input }}
                  >
                    <SelectValue placeholder="Select operator..." />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError error={errors.operator} />
              </div>

              {operatorRequiresValue() && (
                <div className="space-y-2">
                  <Label className="text-slate-700 text-xs font-medium">Value</Label>
                  <Input
                    value={String(nodeData.config?.value || "")}
                    onChange={(e) => handleConfigChange("value", e.target.value)}
                    placeholder="Compare value"
                    className="bg-white border-slate-200"
                    style={{ borderRadius: RADIUS.input }}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-slate-700 text-xs font-medium">Description</Label>
                <Input
                  value={nodeData.config?.description || ""}
                  onChange={(e) => handleConfigChange("description", e.target.value)}
                  placeholder="What does this check?"
                  className="bg-white border-slate-200"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>

              {/* Branch connection status */}
              <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                <Label className="text-slate-600 text-xs font-medium">Branch Connections</Label>
                <div className="flex gap-2">
                  <Badge
                    variant={nodeData.yesConnected ? "default" : "outline"}
                    className={cn(
                      "text-xs",
                      nodeData.yesConnected
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-white text-slate-400 border-slate-200"
                    )}
                  >
                    {nodeData.yesConnected ? "✓" : "○"} Yes path
                  </Badge>
                  <Badge
                    variant={nodeData.noConnected ? "default" : "outline"}
                    className={cn(
                      "text-xs",
                      nodeData.noConnected
                        ? "bg-rose-100 text-rose-700 border-rose-200"
                        : "bg-white text-slate-400 border-slate-200"
                    )}
                  >
                    {nodeData.noConnected ? "✓" : "○"} No path
                  </Badge>
                </div>
              </div>
            </>
          )}

          {/* Wait-specific fields */}
          {nodeType === "wait" && (
            <div className="space-y-2">
              <Label className="text-slate-700 text-xs font-medium">
                Duration <span className="text-red-400">*</span>
              </Label>
              <Select
                value={nodeData.config?.duration || "1h"}
                onValueChange={(v) => handleConfigChange("duration", v)}
              >
                <SelectTrigger className="bg-white border-slate-200" style={{ borderRadius: RADIUS.input }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_PRESETS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError error={errors.duration} />
            </div>
          )}

          {/* End-specific fields */}
          {nodeType === "end" && (
            <>
              <div className="space-y-2">
                <Label className="text-slate-700 text-xs font-medium">Status</Label>
                <Select
                  value={nodeData.config?.status || "success"}
                  onValueChange={(v) => handleConfigChange("status", v)}
                >
                  <SelectTrigger className="bg-white border-slate-200" style={{ borderRadius: RADIUS.input }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failure">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 text-xs font-medium">Note</Label>
                <Input
                  value={nodeData.config?.note || ""}
                  onChange={(e) => handleConfigChange("note", e.target.value)}
                  placeholder="End state description"
                  className="bg-white border-slate-200"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer with actions */}
        <div className="p-4 border-t space-y-2" style={{ borderColor: GLASS.border }}>
          {nodeType !== "trigger" && (
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                    style={{ borderRadius: RADIUS.button }}
                    onClick={handleDuplicate}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Duplicate
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Duplicate this node (Ctrl+D)</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    style={{ borderRadius: RADIUS.button }}
                    onClick={handleDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete this node (Delete key)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          {nodeType === "trigger" && (
            <p className="text-xs text-slate-400 text-center">
              Trigger node cannot be deleted
            </p>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default WorkflowPropertiesPanel;
