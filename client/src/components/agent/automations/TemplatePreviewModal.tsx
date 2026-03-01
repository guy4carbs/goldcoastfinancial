/**
 * Template Preview Modal
 * Shows template details before creating an automation
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  GitBranch,
  Zap,
  Clock,
  Filter,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RADIUS, SHADOW, GLASS } from "@/lib/heritageDesignSystem";
import {
  getAutomationIcon,
  formatActionType,
} from "@/lib/automationConstants";
import type { AutomationTemplate } from "@shared/models/automations";

interface TemplatePreviewModalProps {
  template: AutomationTemplate | null;
  open: boolean;
  onClose: () => void;
  onCreateAutomation: () => void;
  onOpenInBuilder: () => void;
  isCreating?: boolean;
}

export function TemplatePreviewModal({
  template,
  open,
  onClose,
  onCreateAutomation,
  onOpenInBuilder,
  isCreating = false,
}: TemplatePreviewModalProps) {
  if (!open || !template) return null;

  const TemplateIcon = getAutomationIcon(template.icon);

  // Format trigger description
  const getTriggerDescription = () => {
    const { type, config } = template.trigger;
    if (type === "event_based") {
      const eventType = (config as { eventType?: string }).eventType || "";
      return eventType.replace(/_/g, " ").toLowerCase();
    }
    if (type === "condition_based") {
      const c = config as { entity?: string; field?: string; operator?: string; value?: unknown };
      return `${c.entity} ${c.field} ${c.operator} ${c.value}`;
    }
    if (type === "time_based") {
      return "on schedule";
    }
    return type;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="bg-white w-full max-w-lg overflow-hidden"
          style={{
            borderRadius: RADIUS.card,
            boxShadow: SHADOW.hero,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with violet gradient */}
          <div
            className="relative px-6 py-5 bg-gradient-to-br from-violet-500 to-violet-600"
            style={{ overflow: "hidden" }}
          >
            {/* Background pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <TemplateIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{template.name}</h2>
                  <p className="text-white/80 text-sm mt-0.5">{template.description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Category badge */}
            <Badge
              className="absolute bottom-3 right-6 bg-white/20 text-white border-white/30"
              style={{ borderRadius: RADIUS.pill }}
            >
              {template.category.replace(/-/g, " ")}
            </Badge>
          </div>

          {/* Template Details */}
          <div className="px-6 py-5 space-y-4">
            {/* Trigger */}
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                style={{ borderRadius: RADIUS.button, backgroundColor: "#ede9fe" }}
              >
                <Zap className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Trigger</p>
                <p className="text-sm text-gray-500 capitalize">{getTriggerDescription()}</p>
              </div>
            </div>

            {/* Conditions (if any) */}
            {template.conditions.length > 0 && (
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                  style={{ borderRadius: RADIUS.button, backgroundColor: "#fef3c7" }}
                >
                  <Filter className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {template.conditions.length} Condition{template.conditions.length > 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-gray-500">
                    {template.conditions.map(c => `${c.field} ${c.operator} ${c.value}`).join(", ")}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                style={{ borderRadius: RADIUS.button, backgroundColor: "#ede9fe" }}
              >
                <Workflow className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {template.actions.length} Action{template.actions.length > 1 ? "s" : ""}
                </p>
                <p className="text-sm text-gray-500">
                  {template.actions.map(a => formatActionType(a.type)).join(" → ")}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            className="flex items-center justify-between px-6 py-4 border-t"
            style={{ borderColor: GLASS.border }}
          >
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{template.actions.length} action{template.actions.length > 1 ? "s" : ""}</span>
              {template.conditions.length > 0 && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>{template.conditions.length} condition{template.conditions.length > 1 ? "s" : ""}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onOpenInBuilder}
                className="gap-2 border-violet-200 text-violet-600 hover:bg-violet-50"
                style={{ borderRadius: RADIUS.button }}
              >
                <GitBranch className="w-4 h-4" />
                Open in Builder
              </Button>
              <Button
                onClick={onCreateAutomation}
                disabled={isCreating}
                className="gap-2 text-white"
                style={{
                  borderRadius: RADIUS.button,
                  background: "linear-gradient(to right, #8b5cf6, #7c3aed)",
                  boxShadow: "0 4px 14px rgba(139, 92, 246, 0.4)",
                }}
              >
                {isCreating ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Create Automation
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default TemplatePreviewModal;
