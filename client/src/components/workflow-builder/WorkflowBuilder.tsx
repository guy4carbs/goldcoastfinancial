/**
 * Workflow Builder - Main Component
 * 3-panel layout with Heritage Design System styling
 */

import { useEffect, useCallback, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Node, Edge } from "reactflow";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  PlayCircle,
  Save,
  Loader2,
  Power,
  PowerOff,
  GitBranch,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { WorkflowCanvas } from "./WorkflowCanvas";
import { WorkflowNodePalette } from "./WorkflowNodePalette";
import { WorkflowPropertiesPanel } from "./WorkflowPropertiesPanel";
import { WorkflowTemplateSelector } from "./WorkflowTemplateSelector";
import { WorkflowValidationModal } from "./WorkflowValidationModal";
import { WorkflowTestModal } from "./WorkflowTestModal";
import { useWorkflowStore } from "./hooks/useWorkflowStore";
import { validateWorkflow, type ValidationError, type ValidationWarning } from "./validation/graphValidation";
import { apiRequest } from "@/lib/queryClient";
import { RADIUS, SHADOW, GLASS } from "@/lib/heritageDesignSystem";
import type { WorkflowTemplate } from "./workflowTemplates";

// Convert automation template to visual workflow format
interface AutomationTemplateInput {
  name: string;
  description: string;
  trigger: { type: string; config: Record<string, unknown> };
  conditions: Array<{ field: string; operator: string; value: unknown }>;
  actions: Array<{ type: string; config: Record<string, unknown> }>;
}

function convertTemplateToWorkflow(template: AutomationTemplateInput): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const NODE_SPACING_Y = 120;
  const CENTER_X = 250;
  let currentY = 50;
  let nodeIndex = 0;

  // Helper to create edge
  const createEdge = (source: string, target: string, label?: string): Edge => ({
    id: `e-${source}-${target}`,
    source,
    target,
    type: "smoothstep",
    style: { stroke: "#8B5CF6", strokeWidth: 2 },
    ...(label && {
      label,
      labelStyle: { fill: "#475569", fontWeight: 600, fontSize: 11 },
      labelBgStyle: { fill: "#FFFFFF", fillOpacity: 0.9 },
      labelBgPadding: [4, 8] as [number, number],
      labelBgBorderRadius: 4,
    }),
  });

  // 1. Add trigger node
  const triggerId = `trigger-${++nodeIndex}`;
  const triggerLabel = template.trigger.type === "event_based"
    ? (template.trigger.config.eventType as string || "Event Trigger").replace(/_/g, " ")
    : template.trigger.type === "condition_based"
    ? "Condition Trigger"
    : "Scheduled Trigger";

  nodes.push({
    id: triggerId,
    type: "trigger",
    position: { x: CENTER_X, y: currentY },
    data: {
      label: triggerLabel,
      config: { triggerType: template.trigger.type, ...template.trigger.config },
    },
  });
  currentY += NODE_SPACING_Y;
  let lastNodeId = triggerId;

  // 2. Add condition node if there are conditions
  if (template.conditions.length > 0) {
    const conditionId = `condition-${++nodeIndex}`;
    const conditionLabel = template.conditions.length === 1
      ? `${template.conditions[0].field} ${template.conditions[0].operator} ${template.conditions[0].value}`
      : `${template.conditions.length} Conditions`;

    nodes.push({
      id: conditionId,
      type: "condition",
      position: { x: CENTER_X, y: currentY },
      data: {
        label: conditionLabel,
        config: { conditions: template.conditions },
      },
    });
    edges.push(createEdge(lastNodeId, conditionId));
    currentY += NODE_SPACING_Y;
    lastNodeId = conditionId;

    // Add "Yes" edge for the condition - the "No" path goes to end
    // For simplicity, we'll create a linear flow on the "Yes" path
  }

  // 3. Add action nodes
  for (const action of template.actions) {
    const actionId = `action-${++nodeIndex}`;
    const isWait = action.type === "wait";

    // Determine node type and label
    const nodeType = isWait ? "wait" : "action";
    let label = action.type.replace(/_/g, " ");
    label = label.charAt(0).toUpperCase() + label.slice(1);

    // Better labels based on action type
    if (action.type === "send_sms") label = "Send SMS";
    if (action.type === "send_email") label = "Send Email";
    if (action.type === "create_task") label = "Create Task";
    if (action.type === "wait") label = `Wait ${action.config.duration || ""}`;

    nodes.push({
      id: actionId,
      type: nodeType,
      position: { x: CENTER_X, y: currentY },
      data: {
        label,
        config: { actionType: action.type, ...action.config },
      },
    });
    edges.push(createEdge(lastNodeId, actionId));
    currentY += NODE_SPACING_Y;
    lastNodeId = actionId;
  }

  // 4. Add end node
  const endId = `end-${++nodeIndex}`;
  nodes.push({
    id: endId,
    type: "end",
    position: { x: CENTER_X, y: currentY },
    data: {
      label: "Complete",
      config: { status: "success" },
    },
  });
  edges.push(createEdge(lastNodeId, endId));

  return { nodes, edges };
}

interface WorkflowBuilderProps {
  workflowId?: string;
  onBack?: () => void;
}

export function WorkflowBuilder({ workflowId, onBack }: WorkflowBuilderProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Show template selector for new workflows
  const [showTemplateSelector, setShowTemplateSelector] = useState(!workflowId);
  // Show unsaved changes confirmation dialog
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  // Validation state
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<ValidationWarning[]>([]);
  // Test modal state
  const [showTestModal, setShowTestModal] = useState(false);

  const {
    workflowName,
    workflowDescription,
    isEnabled,
    isDirty,
    isSaving,
    nodes,
    edges,
    setWorkflowMeta,
    loadWorkflow,
    resetWorkflow,
    undo,
    redo,
    canUndo,
    canRedo,
    getWorkflowDefinition,
    setIsSaving,
    setIsDirty,
  } = useWorkflowStore();

  // Fetch existing workflow if editing
  const { data: existingWorkflow, isLoading: isLoadingWorkflow } = useQuery({
    queryKey: ["/api/workflow-automations", workflowId],
    queryFn: async () => {
      if (!workflowId) return null;
      const response = await apiRequest("GET", `/api/workflow-automations/${workflowId}`);
      return response.json();
    },
    enabled: !!workflowId,
  });

  // Load workflow into store when fetched
  useEffect(() => {
    if (existingWorkflow) {
      loadWorkflow(existingWorkflow);
    }
  }, [existingWorkflow, loadWorkflow]);

  // Reset store on unmount or when creating new, and check for template
  useEffect(() => {
    if (!workflowId) {
      // Check for template from Automations page
      const templateJson = sessionStorage.getItem("workflow-template");
      if (templateJson) {
        try {
          const template = JSON.parse(templateJson);
          sessionStorage.removeItem("workflow-template");

          // Convert automation template to workflow nodes
          const convertedWorkflow = convertTemplateToWorkflow(template);
          loadWorkflow({
            id: "",
            name: template.name,
            description: template.description,
            enabled: false,
            workflow: convertedWorkflow,
          });
          setIsDirty(true);
          setShowTemplateSelector(false);
          toast({
            title: "Template loaded",
            description: `"${template.name}" template has been loaded into the builder.`,
          });
        } catch (e) {
          console.error("Failed to parse template:", e);
          resetWorkflow();
        }
      } else {
        resetWorkflow();
      }
    }
  }, [workflowId, resetWorkflow, loadWorkflow, setIsDirty, toast]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const workflow = getWorkflowDefinition();
      const data = {
        name: workflowName,
        description: workflowDescription,
        enabled: isEnabled,
        workflow,
      };

      if (workflowId) {
        const response = await apiRequest(
          "PUT",
          `/api/workflow-automations/${workflowId}`,
          data
        );
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/workflow-automations", data);
        return response.json();
      }
    },
    onMutate: () => {
      setIsSaving(true);
    },
    onSuccess: (data) => {
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-automations"] });
      toast({
        title: "Workflow saved",
        description: `"${workflowName}" has been saved successfully.`,
      });

      if (!workflowId && data.id) {
        setLocation(`/agents/workflows/${data.id}`);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save",
        description: error.message || "An error occurred while saving the workflow.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });

  // Toggle enabled mutation
  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!workflowId) {
        throw new Error("Save workflow first before enabling");
      }
      const response = await apiRequest(
        "PATCH",
        `/api/workflow-automations/${workflowId}/toggle`,
        { enabled: !isEnabled }
      );
      return response.json();
    },
    onSuccess: (data) => {
      setWorkflowMeta({ enabled: data.enabled });
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-automations"] });
      toast({
        title: data.enabled ? "Workflow enabled" : "Workflow disabled",
        description: data.enabled
          ? "This workflow will now run automatically."
          : "This workflow has been paused.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to toggle",
        description: error.message,
        variant: "destructive",
      });
    },
  });


  const handleBack = useCallback(() => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      onBack ? onBack() : setLocation("/agents/automations");
    }
  }, [isDirty, onBack, setLocation]);

  const confirmLeave = useCallback(() => {
    setShowUnsavedDialog(false);
    onBack ? onBack() : setLocation("/agents/automations");
  }, [onBack, setLocation]);

  const handleSave = useCallback((skipValidation = false) => {
    // Validate workflow before saving
    if (!skipValidation) {
      const validation = validateWorkflow(nodes, edges);

      if (!validation.valid) {
        // Show errors - must be fixed
        setValidationErrors(validation.errors);
        setValidationWarnings(validation.warnings);
        setShowValidationModal(true);
        return;
      }

      if (validation.warnings.length > 0) {
        // Show warnings - can proceed
        setValidationErrors([]);
        setValidationWarnings(validation.warnings);
        setShowValidationModal(true);
        return;
      }
    }

    saveMutation.mutate();
  }, [saveMutation, nodes, edges]);

  const handleSaveAnyway = useCallback(() => {
    setShowValidationModal(false);
    saveMutation.mutate();
  }, [saveMutation]);

  const handleTest = useCallback(() => {
    if (!workflowId) {
      toast({
        title: "Save first",
        description: "Please save the workflow before testing.",
        variant: "destructive",
      });
      return;
    }
    setShowTestModal(true);
  }, [workflowId, toast]);

  const handleToggle = useCallback(() => {
    toggleMutation.mutate();
  }, [toggleMutation]);

  // Handle template selection
  const handleTemplateSelect = useCallback((template: WorkflowTemplate) => {
    // Load template as a new workflow
    loadWorkflow({
      id: "",
      name: template.name,
      description: template.description,
      enabled: false,
      workflow: {
        nodes: template.nodes,
        edges: template.edges,
      },
    });
    setIsDirty(true);
    setShowTemplateSelector(false);
    toast({
      title: "Template loaded",
      description: `"${template.name}" template has been loaded. Customize it to fit your needs!`,
    });
  }, [loadWorkflow, setIsDirty, toast]);

  if (isLoadingWorkflow) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <span className="text-sm text-slate-400">Loading workflow...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
    >
      {/* Header - Glass Material */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          background: `linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)`,
          borderColor: 'rgba(139, 92, 246, 0.2)',
          backdropFilter: `blur(${GLASS.blur}px)`,
        }}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-slate-600 hover:text-slate-900 hover:bg-white/50"
            style={{ borderRadius: RADIUS.button }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                boxShadow: SHADOW.glow.amber,
              }}
            >
              <GitBranch className="w-5 h-5 text-white" />
            </div>

            <Input
              value={workflowName}
              onChange={(e) => setWorkflowMeta({ name: e.target.value })}
              className="w-64 bg-white/80 border-slate-200 text-slate-900 font-medium focus:bg-white focus:border-violet-300"
              style={{ borderRadius: RADIUS.input }}
              placeholder="Workflow name..."
            />

            {isEnabled ? (
              <Badge
                className="bg-emerald-100 text-emerald-700 border-emerald-200"
                style={{ borderRadius: RADIUS.pill }}
              >
                Active
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-slate-100 text-slate-600 border-slate-200"
                style={{ borderRadius: RADIUS.pill }}
              >
                Draft
              </Badge>
            )}

            {isDirty && (
              <Badge
                variant="outline"
                className="text-amber-600 border-amber-300 bg-amber-50"
                style={{ borderRadius: RADIUS.pill }}
              >
                Unsaved
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <div
            className="flex items-center bg-white/60 border border-slate-200"
            style={{ borderRadius: RADIUS.button }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canUndo()}
              className="text-slate-500 hover:text-slate-700 disabled:opacity-30 rounded-r-none border-r border-slate-200"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={!canRedo()}
              className="text-slate-500 hover:text-slate-700 disabled:opacity-30 rounded-l-none"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Test */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            disabled={!workflowId}
            className="bg-white/60 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900"
            style={{ borderRadius: RADIUS.button }}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Test
          </Button>

          {/* Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={!workflowId || toggleMutation.isPending}
            className={
              isEnabled
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
            }
            style={{ borderRadius: RADIUS.button }}
          >
            {toggleMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : isEnabled ? (
              <Power className="w-4 h-4 mr-2" />
            ) : (
              <PowerOff className="w-4 h-4 mr-2" />
            )}
            {isEnabled ? "Active" : "Inactive"}
          </Button>

          {/* Save */}
          <Button
            size="sm"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg"
            style={{
              borderRadius: RADIUS.button,
              boxShadow: SHADOW.glow.violet,
            }}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Node Palette */}
        <WorkflowNodePalette className="w-56 flex-shrink-0" />

        {/* Center: Canvas */}
        <WorkflowCanvas className="flex-1" />

        {/* Right: Properties Panel */}
        <WorkflowPropertiesPanel className="w-72 flex-shrink-0" />
      </div>

      {/* Template Selector Modal - shown when creating new workflow */}
      <WorkflowTemplateSelector
        open={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={handleTemplateSelect}
      />

      {/* Workflow Validation Modal */}
      <WorkflowValidationModal
        open={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        errors={validationErrors}
        warnings={validationWarnings}
        onSaveAnyway={validationErrors.length === 0 ? handleSaveAnyway : undefined}
      />

      {/* Workflow Test Modal */}
      {workflowId && (
        <WorkflowTestModal
          open={showTestModal}
          onClose={() => setShowTestModal(false)}
          workflowId={workflowId}
          workflowName={workflowName}
        />
      )}

      {/* Unsaved Changes Confirmation Dialog */}
      <AnimatePresence>
        {showUnsavedDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            onClick={() => setShowUnsavedDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="bg-white w-full max-w-md overflow-hidden"
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.hero,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start gap-4 p-6 pb-4">
                <div
                  className="w-12 h-12 bg-amber-100 flex items-center justify-center flex-shrink-0"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Unsaved Changes
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    You have unsaved changes to this workflow. Are you sure you want to leave? Your changes will be lost.
                  </p>
                </div>
                <button
                  onClick={() => setShowUnsavedDialog(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors -mt-1 -mr-1"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Actions */}
              <div
                className="flex items-center justify-end gap-3 px-6 py-4 border-t"
                style={{ borderColor: GLASS.border, backgroundColor: "rgba(248, 250, 252, 0.5)" }}
              >
                <Button
                  variant="outline"
                  onClick={() => setShowUnsavedDialog(false)}
                  className="border-gray-200"
                  style={{ borderRadius: RADIUS.button }}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUnsavedDialog(false);
                    handleSave();
                  }}
                  className="border-violet-200 text-violet-600 hover:bg-violet-50"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  onClick={confirmLeave}
                  className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white"
                  style={{ borderRadius: RADIUS.button }}
                >
                  Leave Anyway
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WorkflowBuilder;
