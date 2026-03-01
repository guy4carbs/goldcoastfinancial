/**
 * Workflow Validation Modal
 * Displays validation errors and warnings with actionable fix suggestions
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  X,
  ChevronRight,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RADIUS, SHADOW, GLASS } from "@/lib/heritageDesignSystem";
import type {
  ValidationError,
  ValidationWarning,
} from "./validation/graphValidation";
import { getFixSuggestion } from "./validation/graphValidation";
import { useWorkflowStore } from "./hooks/useWorkflowStore";
import { cn } from "@/lib/utils";

interface WorkflowValidationModalProps {
  open: boolean;
  onClose: () => void;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  onSaveAnyway?: () => void;
}

export function WorkflowValidationModal({
  open,
  onClose,
  errors,
  warnings,
  onSaveAnyway,
}: WorkflowValidationModalProps) {
  const { nodes, setSelectedNode } = useWorkflowStore();

  if (!open) return null;

  const hasErrors = errors.length > 0;

  const handleNodeClick = (nodeId?: string) => {
    if (!nodeId) return;
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white w-full max-w-lg overflow-hidden"
          style={{
            borderRadius: RADIUS.card,
            boxShadow: SHADOW.hero,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={cn(
              "px-6 py-4 flex items-center justify-between",
              hasErrors
                ? "bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100"
                : "bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  hasErrors ? "bg-red-100" : "bg-amber-100"
                )}
              >
                {hasErrors ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">
                  {hasErrors ? "Workflow Has Issues" : "Review Before Saving"}
                </h2>
                <p className="text-sm text-slate-600">
                  {hasErrors
                    ? `${errors.length} error${errors.length > 1 ? "s" : ""} must be fixed`
                    : `${warnings.length} warning${warnings.length > 1 ? "s" : ""} to review`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[400px] overflow-y-auto">
            {/* Errors */}
            {errors.length > 0 && (
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    {errors.length} Error{errors.length > 1 ? "s" : ""}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    Must be fixed before saving
                  </span>
                </div>

                {errors.map((error, index) => (
                  <ValidationItem
                    key={`error-${index}`}
                    item={error}
                    type="error"
                    onNodeClick={handleNodeClick}
                  />
                ))}
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="space-y-3">
                {errors.length > 0 && (
                  <div className="h-px bg-slate-200 my-4" />
                )}
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs text-amber-700 border-amber-200 bg-amber-50"
                  >
                    {warnings.length} Warning{warnings.length > 1 ? "s" : ""}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    Recommended to address
                  </span>
                </div>

                {warnings.map((warning, index) => (
                  <ValidationItem
                    key={`warning-${index}`}
                    item={warning}
                    type="warning"
                    onNodeClick={handleNodeClick}
                  />
                ))}
              </div>
            )}

            {/* Success state */}
            {errors.length === 0 && warnings.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-slate-700 font-medium">
                  Workflow is valid!
                </p>
                <p className="text-sm text-slate-500">
                  All checks passed successfully
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4 flex items-center justify-end gap-3 border-t"
            style={{ borderColor: GLASS.border }}
          >
            <Button
              variant="outline"
              onClick={onClose}
              style={{ borderRadius: RADIUS.button }}
            >
              {hasErrors ? "Fix Issues" : "Cancel"}
            </Button>
            {!hasErrors && onSaveAnyway && (
              <Button
                onClick={onSaveAnyway}
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                style={{ borderRadius: RADIUS.button }}
              >
                Save Anyway
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Individual validation item component
interface ValidationItemProps {
  item: ValidationError | ValidationWarning;
  type: "error" | "warning";
  onNodeClick: (nodeId?: string) => void;
}

function ValidationItem({ item, type, onNodeClick }: ValidationItemProps) {
  const suggestion = getFixSuggestion(item);

  return (
    <div
      className={cn(
        "p-3 rounded-lg border",
        type === "error"
          ? "bg-red-50 border-red-200"
          : "bg-amber-50 border-amber-200"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5",
            type === "error" ? "bg-red-200" : "bg-amber-200"
          )}
        >
          {type === "error" ? (
            <AlertCircle className="w-3 h-3 text-red-700" />
          ) : (
            <AlertTriangle className="w-3 h-3 text-amber-700" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium",
              type === "error" ? "text-red-800" : "text-amber-800"
            )}
          >
            {item.message}
          </p>

          {/* Fix suggestion */}
          <div className="flex items-start gap-1.5 mt-2">
            <Lightbulb className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-600">{suggestion}</p>
          </div>
        </div>

        {/* Navigate to node button */}
        {item.nodeId && (
          <button
            onClick={() => onNodeClick(item.nodeId)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors",
              type === "error"
                ? "bg-red-200 text-red-800 hover:bg-red-300"
                : "bg-amber-200 text-amber-800 hover:bg-amber-300"
            )}
          >
            Go to node
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

export default WorkflowValidationModal;
