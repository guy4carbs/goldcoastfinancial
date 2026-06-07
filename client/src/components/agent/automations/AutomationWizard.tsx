/**
 * AutomationWizard - Multi-step wizard for creating/editing automations
 * Uses shared constants for consistency and proper validation
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RADIUS } from "@/lib/heritageDesignSystem";
import {
  ACTION_TYPES,
  TRIGGER_TYPES,
  EVENT_TYPES,
  CONDITION_OPERATORS,
  CONDITION_FIELDS,
  isActionConfigValid,
  getActionValidationMessage,
  getDefaultActionConfig,
} from "@/lib/automationConstants";
import type { Automation, AutomationTemplate } from "@shared/models/automations";

// =============================================================================
// TYPES
// =============================================================================

interface AutomationWizardProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: AutomationFormData) => void;
  automation?: Automation | null;
  template?: AutomationTemplate | null;
  isSaving?: boolean;
}

interface AutomationFormData {
  name: string;
  description: string;
  triggerType: "time_based" | "event_based" | "condition_based";
  triggerConfig: Record<string, unknown>;
  conditions: Array<{ field: string; operator: string; value: unknown }>;
  actions: Array<{ type: string; config: Record<string, unknown> }>;
}

// =============================================================================
// WIZARD COMPONENT
// =============================================================================

export function AutomationWizard({
  open,
  onClose,
  onSave,
  automation,
  template,
  isSaving,
}: AutomationWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<AutomationFormData>({
    name: "",
    description: "",
    triggerType: "event_based",
    triggerConfig: { eventType: "LEAD_CREATED" },
    conditions: [],
    actions: [{ type: "send_notification", config: { title: "", body: "", priority: "normal" } }],
  });

  // Initialize form data from automation or template
  useEffect(() => {
    if (automation) {
      setFormData({
        name: automation.name,
        description: automation.description || "",
        triggerType: automation.triggerType as AutomationFormData["triggerType"],
        triggerConfig: automation.triggerConfig as Record<string, unknown>,
        conditions: (automation.conditions || []) as AutomationFormData["conditions"],
        actions: (automation.actions || []) as AutomationFormData["actions"],
      });
    } else if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        triggerType: template.trigger.type,
        triggerConfig: template.trigger.config as Record<string, unknown>,
        conditions: template.conditions.map(c => ({
          field: c.field,
          operator: c.operator,
          value: c.value as unknown,
        })),
        actions: template.actions as AutomationFormData["actions"],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        triggerType: "event_based",
        triggerConfig: { eventType: "LEAD_CREATED" },
        conditions: [],
        actions: [{ type: "send_notification", config: { title: "", body: "", priority: "normal" } }],
      });
    }
    setStep(1);
  }, [automation, template, open]);

  const totalSteps = 4;

  // Navigation
  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSave = () => {
    onSave(formData);
  };

  // Condition management
  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: [...formData.conditions, { field: "leadScore", operator: "gte", value: "" }],
    });
  };

  const removeCondition = (index: number) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((_, i) => i !== index),
    });
  };

  const updateCondition = (index: number, updates: Partial<typeof formData.conditions[0]>) => {
    const newConditions = [...formData.conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    setFormData({ ...formData, conditions: newConditions });
  };

  // Action management
  const addAction = () => {
    setFormData({
      ...formData,
      actions: [...formData.actions, { type: "send_notification", config: getDefaultActionConfig("send_notification") }],
    });
  };

  const removeAction = (index: number) => {
    if (formData.actions.length > 1) {
      setFormData({
        ...formData,
        actions: formData.actions.filter((_, i) => i !== index),
      });
    }
  };

  const updateAction = (index: number, type: string, config: Record<string, unknown>) => {
    const newActions = [...formData.actions];
    newActions[index] = { type, config };
    setFormData({ ...formData, actions: newActions });
  };

  // Validation
  const isStepValid = (): boolean => {
    switch (step) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        if (formData.triggerType === "event_based") {
          return !!formData.triggerConfig.eventType;
        }
        if (formData.triggerType === "time_based") {
          return !!formData.triggerConfig.schedule;
        }
        if (formData.triggerType === "condition_based") {
          return !!formData.triggerConfig.entity && !!formData.triggerConfig.field && !!formData.triggerConfig.operator;
        }
        return true;
      case 3:
        return true; // Conditions are optional
      case 4:
        // All actions must be valid
        return formData.actions.length > 0 && formData.actions.every(isActionConfigValid);
      default:
        return true;
    }
  };

  // Get validation errors for display
  const getActionErrors = (): Array<{ index: number; message: string }> => {
    return formData.actions
      .map((action, index) => ({
        index,
        message: getActionValidationMessage(action),
      }))
      .filter((e): e is { index: number; message: string } => e.message !== null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="w-8 h-8 bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center"
              style={{ borderRadius: RADIUS.button }}
            >
              <Zap className="w-4 h-4 text-white" />
            </div>
            {automation ? "Edit Automation" : "Create Automation"}
          </DialogTitle>
          <DialogDescription>
            Step {step} of {totalSteps}:{" "}
            {step === 1 && "Basic Info"}
            {step === 2 && "Configure Trigger"}
            {step === 3 && "Add Conditions (Optional)"}
            {step === 4 && "Define Actions"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 flex items-center justify-center text-sm font-medium transition-colors",
                  s < step && "bg-violet-500 text-white",
                  s === step && "bg-violet-500 text-white ring-2 ring-violet-300",
                  s > step && "bg-gray-100 text-gray-400"
                )}
                style={{ borderRadius: RADIUS.button }}
              >
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={cn(
                    "flex-1 h-1 rounded-full",
                    s < step ? "bg-violet-500" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="py-4 min-h-[300px]">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Automation Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Follow-up Reminder"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does this automation do?"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 2: Trigger */}
          {step === 2 && (
            <div className="space-y-4">
              <Label>What should start this automation?</Label>
              <div className="grid grid-cols-3 gap-3">
                {TRIGGER_TYPES.map((trigger) => (
                  <button
                    key={trigger.type}
                    type="button"
                    onClick={() => setFormData({ ...formData, triggerType: trigger.type, triggerConfig: {} })}
                    className={cn(
                      "p-4 border-2 text-left transition-colors",
                      formData.triggerType === trigger.type
                        ? "border-violet-500 bg-violet-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    style={{ borderRadius: RADIUS.card }}
                  >
                    <trigger.icon className={cn(
                      "w-6 h-6 mb-2",
                      formData.triggerType === trigger.type ? "text-violet-600" : "text-gray-400"
                    )} />
                    <div className="font-medium text-gray-900">{trigger.label}</div>
                    <div className="text-xs text-gray-500">{trigger.description}</div>
                  </button>
                ))}
              </div>

              {/* Event-based config */}
              {formData.triggerType === "event_based" && (
                <div className="mt-4">
                  <Label>Select Event</Label>
                  <Select
                    value={(formData.triggerConfig.eventType as string) || ""}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      triggerConfig: { ...formData.triggerConfig, eventType: value }
                    })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose an event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((event) => (
                        <SelectItem key={event.value} value={event.value}>
                          <div>
                            <div className="font-medium">{event.label}</div>
                            <div className="text-xs text-gray-500">{event.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Time-based config */}
              {formData.triggerType === "time_based" && (
                <div className="mt-4 space-y-3">
                  <div>
                    <Label>Schedule (Cron Expression) *</Label>
                    <Input
                      value={(formData.triggerConfig.schedule as string) || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        triggerConfig: { ...formData.triggerConfig, schedule: e.target.value }
                      })}
                      placeholder="0 9 * * * (Daily at 9am)"
                      className="mt-1 font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">Examples: 0 9 * * * (daily 9am), 0 9 * * 1 (Mondays 9am)</p>
                  </div>
                </div>
              )}

              {/* Condition-based config */}
              {formData.triggerType === "condition_based" && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Entity *</Label>
                      <Select
                        value={(formData.triggerConfig.entity as string) || "lead"}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          triggerConfig: { ...formData.triggerConfig, entity: value }
                        })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="policy">Policy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Field *</Label>
                      <Select
                        value={(formData.triggerConfig.field as string) || ""}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          triggerConfig: { ...formData.triggerConfig, field: value }
                        })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lastContactedAt">Last Contacted</SelectItem>
                          <SelectItem value="nextFollowUp">Next Follow-up</SelectItem>
                          <SelectItem value="createdAt">Created Date</SelectItem>
                          <SelectItem value="birthday">Birthday</SelectItem>
                          <SelectItem value="renewalDate">Renewal Date</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Condition *</Label>
                      <Select
                        value={(formData.triggerConfig.operator as string) || ""}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          triggerConfig: { ...formData.triggerConfig, operator: value }
                        })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="older_than">Older than</SelectItem>
                          <SelectItem value="is_today">Is today</SelectItem>
                          <SelectItem value="days_until">Days until</SelectItem>
                          <SelectItem value="past_due">Past due</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {(formData.triggerConfig.operator === "older_than" || formData.triggerConfig.operator === "days_until") && (
                    <div>
                      <Label>Value</Label>
                      <Input
                        value={(formData.triggerConfig.value as string) || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          triggerConfig: { ...formData.triggerConfig, value: e.target.value }
                        })}
                        placeholder="e.g., 3d, 7d, 30"
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Conditions */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Filter Conditions</Label>
                  <p className="text-sm text-gray-500">Only run when these conditions match</p>
                </div>
                <Button variant="outline" size="sm" onClick={addCondition}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Condition
                </Button>
              </div>

              {formData.conditions.length === 0 ? (
                <div
                  className="border-2 border-dashed border-gray-200 p-8 text-center"
                  style={{ borderRadius: RADIUS.card }}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No conditions added</p>
                  <p className="text-sm text-gray-400">Automation will run for all matching triggers</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.conditions.map((condition, index) => {
                    const operator = CONDITION_OPERATORS.find(op => op.value === condition.operator);
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200"
                        style={{ borderRadius: RADIUS.input }}
                      >
                        <Select
                          value={condition.field}
                          onValueChange={(value) => updateCondition(index, { field: value })}
                        >
                          <SelectTrigger className="w-[140px] bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CONDITION_FIELDS.map((f) => (
                              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={condition.operator}
                          onValueChange={(value) => updateCondition(index, { operator: value })}
                        >
                          <SelectTrigger className="w-[140px] bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CONDITION_OPERATORS.map((op) => (
                              <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {operator?.requiresValue !== false && (
                          <Input
                            value={(condition.value as string) || ""}
                            onChange={(e) => updateCondition(index, { value: e.target.value })}
                            placeholder="Value"
                            className="flex-1 bg-white"
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCondition(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Actions */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Actions</Label>
                  <p className="text-sm text-gray-500">What should happen when triggered?</p>
                </div>
                <Button variant="outline" size="sm" onClick={addAction}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Action
                </Button>
              </div>

              {/* Validation errors */}
              {getActionErrors().length > 0 && (
                <div className="bg-red-50 border border-red-200 p-3" style={{ borderRadius: RADIUS.input }}>
                  <div className="flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Please fix the following:</span>
                  </div>
                  <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                    {getActionErrors().map((err) => (
                      <li key={err.index}>Action {err.index + 1}: {err.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-3">
                {formData.actions.map((action, index) => {
                  const actionType = ACTION_TYPES.find((t) => t.value === action.type);
                  const IconComponent = actionType?.icon || Zap;
                  const hasError = !isActionConfigValid(action);

                  return (
                    <div
                      key={index}
                      className={cn(
                        "p-4 border",
                        hasError ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
                      )}
                      style={{ borderRadius: RADIUS.card }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn("w-8 h-8 flex items-center justify-center", actionType?.color)} style={{ borderRadius: RADIUS.button }}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <Select
                          value={action.type}
                          onValueChange={(value) => updateAction(index, value, getDefaultActionConfig(value))}
                        >
                          <SelectTrigger className="flex-1 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ACTION_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <type.icon className="w-4 h-4" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formData.actions.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAction(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      {/* Action-specific config */}
                      <ActionConfig
                        type={action.type}
                        config={action.config}
                        onChange={(config) => updateAction(index, action.type, config)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          {step < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={!isStepValid() || isSaving}
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-1" />
              )}
              {automation ? "Save Changes" : "Create Automation"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// SEQUENCE OPTIONS HOOK
// =============================================================================

interface SequenceOption {
  id: string;
  name: string;
}

/**
 * Fetch active drip sequences for the "Enroll in Sequence" action.
 * Uses the default queryFn (queryKey-as-URL) from queryClient.
 */
function useSequenceOptions() {
  return useQuery<SequenceOption[]>({
    queryKey: ["/api/sequences/options"],
  });
}

// =============================================================================
// ACTION CONFIG COMPONENT
// =============================================================================

interface ActionConfigProps {
  type: string;
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

function ActionConfig({ type, config, onChange }: ActionConfigProps) {
  const update = (key: string, value: unknown) => {
    onChange({ ...config, [key]: value });
  };

  switch (type) {
    case "send_email":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">To *</Label>
            <Input
              value={(config.to as string) || ""}
              onChange={(e) => update("to", e.target.value)}
              placeholder="{{lead.email}}"
              className="mt-1 bg-white"
            />
          </div>
          <div>
            <Label className="text-xs">Subject *</Label>
            <Input
              value={(config.subject as string) || ""}
              onChange={(e) => update("subject", e.target.value)}
              placeholder="Email subject..."
              className="mt-1 bg-white"
            />
          </div>
          <div>
            <Label className="text-xs">Body (or use Template ID)</Label>
            <Textarea
              value={(config.body as string) || ""}
              onChange={(e) => update("body", e.target.value)}
              placeholder="Email body... Use {{lead.firstName}} for variables"
              className="mt-1 bg-white"
              rows={3}
            />
          </div>
        </div>
      );

    case "send_sms":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">To *</Label>
            <Input
              value={(config.to as string) || ""}
              onChange={(e) => update("to", e.target.value)}
              placeholder="{{lead.phone}}"
              className="mt-1 bg-white"
            />
          </div>
          <div>
            <Label className="text-xs">Message *</Label>
            <Textarea
              value={(config.message as string) || ""}
              onChange={(e) => update("message", e.target.value)}
              placeholder="SMS message..."
              className="mt-1 bg-white"
              rows={2}
            />
          </div>
        </div>
      );

    case "send_notification":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Title *</Label>
            <Input
              value={(config.title as string) || ""}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Notification title..."
              className="mt-1 bg-white"
            />
          </div>
          <div>
            <Label className="text-xs">Body *</Label>
            <Input
              value={(config.body as string) || ""}
              onChange={(e) => update("body", e.target.value)}
              placeholder="Notification message..."
              className="mt-1 bg-white"
            />
          </div>
          <div>
            <Label className="text-xs">Priority</Label>
            <Select value={(config.priority as string) || "normal"} onValueChange={(v) => update("priority", v)}>
              <SelectTrigger className="mt-1 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "create_task":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Task Title *</Label>
            <Input
              value={(config.title as string) || ""}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Follow up with {{lead.firstName}}"
              className="mt-1 bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Due In</Label>
              <Select value={(config.dueIn as string) || "1d"} onValueChange={(v) => update("dueIn", v)}>
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="4h">4 hours</SelectItem>
                  <SelectItem value="1d">1 day</SelectItem>
                  <SelectItem value="2d">2 days</SelectItem>
                  <SelectItem value="7d">1 week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Priority</Label>
              <Select value={(config.priority as string) || "medium"} onValueChange={(v) => update("priority", v)}>
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );

    case "update_lead":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Update Status To *</Label>
            <Select value={(config.status as string) || ""} onValueChange={(v) => update("status", v)}>
              <SelectTrigger className="mt-1 bg-white">
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "add_tag":
      return (
        <div>
          <Label className="text-xs">Tags (comma-separated) *</Label>
          <Input
            value={Array.isArray(config.tags) ? (config.tags as string[]).join(", ") : ""}
            onChange={(e) => update("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
            placeholder="hot-lead, contacted, vip"
            className="mt-1 bg-white"
          />
        </div>
      );

    case "webhook":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">URL *</Label>
            <Input
              value={(config.url as string) || ""}
              onChange={(e) => update("url", e.target.value)}
              placeholder="https://..."
              className="mt-1 bg-white"
            />
          </div>
          <div>
            <Label className="text-xs">Method</Label>
            <Select value={(config.method as string) || "POST"} onValueChange={(v) => update("method", v)}>
              <SelectTrigger className="mt-1 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "wait":
      return (
        <div>
          <Label className="text-xs">Wait Duration *</Label>
          <Select value={(config.duration as string) || "1d"} onValueChange={(v) => update("duration", v)}>
            <SelectTrigger className="mt-1 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5m">5 minutes</SelectItem>
              <SelectItem value="30m">30 minutes</SelectItem>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="4h">4 hours</SelectItem>
              <SelectItem value="1d">1 day</SelectItem>
              <SelectItem value="2d">2 days</SelectItem>
              <SelectItem value="7d">1 week</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">Note: Waits longer than 5 minutes are scheduled for later execution.</p>
        </div>
      );

    case "enroll_in_sequence":
      return <EnrollInSequenceConfig config={config} update={update} />;

    default:
      return null;
  }
}

// =============================================================================
// ENROLL IN SEQUENCE CONFIG
// =============================================================================

interface EnrollInSequenceConfigProps {
  config: Record<string, unknown>;
  update: (key: string, value: unknown) => void;
}

function EnrollInSequenceConfig({ config, update }: EnrollInSequenceConfigProps) {
  const { data: sequences, isLoading } = useSequenceOptions();
  const selected = (config.sequenceId as string) || "";

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Sequence *</Label>
        {isLoading ? (
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Loading sequences...
          </div>
        ) : !sequences || sequences.length === 0 ? (
          <p className="mt-1 text-xs text-gray-500">No active sequences yet</p>
        ) : (
          <Select value={selected} onValueChange={(v) => update("sequenceId", v)}>
            <SelectTrigger className="mt-1 bg-white">
              <SelectValue placeholder="Choose a sequence..." />
            </SelectTrigger>
            <SelectContent>
              {sequences.map((seq) => (
                <SelectItem key={seq.id} value={seq.id}>
                  {seq.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <p className="text-xs text-gray-500">Lead will be enrolled when this automation fires.</p>
    </div>
  );
}

export default AutomationWizard;
