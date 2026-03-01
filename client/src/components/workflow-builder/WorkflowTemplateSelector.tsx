/**
 * Workflow Template Selector
 * Modal for selecting pre-built workflow templates
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  PhoneMissed,
  Calendar,
  Shield,
  CreditCard,
  Cake,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { workflowTemplates, WorkflowTemplate } from "./workflowTemplates";
import { RADIUS, SHADOW, GLASS, GRID, TYPE, COLORS } from "@/lib/heritageDesignSystem";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Phone,
  PhoneMissed,
  Calendar,
  Shield,
  CreditCard,
  Cake,
};

// Category colors
const categoryColors: Record<WorkflowTemplate["category"], { bg: string; text: string; border: string }> = {
  sales: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  retention: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  engagement: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  reminders: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
};

interface WorkflowTemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: WorkflowTemplate) => void;
}

export function WorkflowTemplateSelector({
  open,
  onClose,
  onSelect,
}: WorkflowTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      onClose();
    }
  };

  const handleStartBlank = () => {
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="bg-white w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
          style={{
            borderRadius: RADIUS.card,
            boxShadow: SHADOW.hero,
            margin: GRID.spacing.lg,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary.violet[50]} 0%, white 100%)`,
              borderColor: GLASS.border,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary.violet[500]} 0%, ${COLORS.primary.purple[600]} 100%)`,
                  boxShadow: SHADOW.glow.violet,
                }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900" style={{ fontSize: TYPE.section }}>
                  Choose a Template
                </h2>
                <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>
                  Start with a pre-built workflow or create from scratch
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Template Grid */}
          <div
            className="flex-1 overflow-y-auto p-6"
            style={{ background: COLORS.gray[50] }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflowTemplates.map((template) => {
                const IconComponent = iconMap[template.icon] || Shield;
                const isSelected = selectedTemplate?.id === template.id;
                const isHovered = hoveredTemplate === template.id;
                const colors = categoryColors[template.category];

                return (
                  <motion.div
                    key={template.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onHoverStart={() => setHoveredTemplate(template.id)}
                    onHoverEnd={() => setHoveredTemplate(null)}
                    onClick={() => setSelectedTemplate(template)}
                    className={`
                      bg-white cursor-pointer transition-all border-2
                      ${isSelected ? "border-violet-500 ring-2 ring-violet-200" : "border-transparent hover:border-violet-200"}
                    `}
                    style={{
                      borderRadius: RADIUS.card,
                      boxShadow: isSelected || isHovered ? SHADOW.level3 : SHADOW.level1,
                      padding: GRID.spacing.md,
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="p-2.5 rounded-lg"
                        style={{
                          background: isSelected
                            ? `linear-gradient(135deg, ${COLORS.primary.violet[500]} 0%, ${COLORS.primary.purple[600]} 100%)`
                            : COLORS.gray[100],
                          boxShadow: isSelected ? SHADOW.glow.violet : "none",
                        }}
                      >
                        <IconComponent
                          className={isSelected ? "text-white" : "text-gray-600"}
                          style={{ width: 20, height: 20 }}
                        />
                      </div>
                      <Badge
                        className={`${colors.bg} ${colors.text} ${colors.border} border`}
                        style={{ fontSize: TYPE.micro }}
                      >
                        {template.category}
                      </Badge>
                    </div>

                    <h3
                      className="font-semibold text-gray-900 mb-1"
                      style={{ fontSize: TYPE.body }}
                    >
                      {template.name}
                    </h3>
                    <p
                      className="text-gray-500 line-clamp-2"
                      style={{ fontSize: TYPE.meta }}
                    >
                      {template.description}
                    </p>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span
                        className="text-gray-400"
                        style={{ fontSize: TYPE.caption }}
                      >
                        {template.nodes.length} nodes
                      </span>
                      {isSelected && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-violet-600 font-medium flex items-center gap-1"
                          style={{ fontSize: TYPE.meta }}
                        >
                          Selected
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-6 py-4 border-t"
            style={{ borderColor: GLASS.border }}
          >
            <Button
              variant="ghost"
              onClick={handleStartBlank}
              className="text-gray-600 hover:text-gray-900"
              style={{ borderRadius: RADIUS.button }}
            >
              Start from scratch
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-200"
                style={{ borderRadius: RADIUS.button }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSelect}
                disabled={!selectedTemplate}
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white disabled:opacity-50"
                style={{
                  borderRadius: RADIUS.button,
                  boxShadow: selectedTemplate ? SHADOW.glow.violet : "none",
                }}
              >
                Use Template
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default WorkflowTemplateSelector;
