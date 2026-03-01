/**
 * Workflow Node Palette
 * Left sidebar with draggable node types - Heritage Design System
 */

import { DragEvent } from "react";
import { Zap, Bell, GitBranch, Clock, CircleStop } from "lucide-react";
import { RADIUS, SHADOW, GLASS } from "@/lib/heritageDesignSystem";

interface NodeTypeInfo {
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  shadowColor: string;
  description: string;
}

const NODE_TYPES: NodeTypeInfo[] = [
  {
    type: "trigger",
    label: "Trigger",
    icon: Zap,
    gradient: "from-emerald-500 to-green-600",
    shadowColor: SHADOW.glow.emerald,
    description: "Start your workflow",
  },
  {
    type: "action",
    label: "Action",
    icon: Bell,
    gradient: "from-teal-500 to-cyan-600",
    shadowColor: SHADOW.glow.cyan,
    description: "Send SMS, email, etc.",
  },
  {
    type: "condition",
    label: "Condition",
    icon: GitBranch,
    gradient: "from-amber-500 to-orange-500",
    shadowColor: SHADOW.glow.amber,
    description: "Branch Yes/No",
  },
  {
    type: "wait",
    label: "Wait",
    icon: Clock,
    gradient: "from-cyan-500 to-blue-500",
    shadowColor: SHADOW.glow.cyan,
    description: "Delay execution",
  },
  {
    type: "end",
    label: "End",
    icon: CircleStop,
    gradient: "from-rose-500 to-red-600",
    shadowColor: "0 4px 14px rgba(244, 63, 94, 0.25)",
    description: "End workflow branch",
  },
];

interface WorkflowNodePaletteProps {
  className?: string;
}

export function WorkflowNodePalette({ className = "" }: WorkflowNodePaletteProps) {
  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className={`flex flex-col h-full border-r ${className}`}
      style={{
        background: GLASS.background,
        backdropFilter: `blur(${GLASS.blur}px)`,
        borderColor: GLASS.border,
      }}
    >
      <div
        className="p-4 border-b"
        style={{ borderColor: GLASS.border }}
      >
        <h3 className="text-sm font-semibold text-slate-700">Node Palette</h3>
        <p className="text-xs text-slate-500 mt-1">Drag nodes to canvas</p>
      </div>

      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        {NODE_TYPES.map((nodeType) => {
          const Icon = nodeType.icon;
          return (
            <div
              key={nodeType.type}
              draggable
              onDragStart={(e) => onDragStart(e, nodeType.type)}
              className="group p-3 bg-white border border-slate-200 cursor-grab active:cursor-grabbing transition-all duration-200 hover:border-slate-300 hover:shadow-md active:scale-95"
              style={{ borderRadius: RADIUS.card }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-br ${nodeType.gradient} transition-shadow duration-200`}
                  style={{
                    boxShadow: nodeType.shadowColor,
                  }}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800">{nodeType.label}</div>
                  <div className="text-xs text-slate-500">{nodeType.description}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="p-4 border-t"
        style={{ borderColor: GLASS.border }}
      >
        <div className="text-xs text-slate-500 space-y-1.5">
          <div className="flex items-center gap-2">
            <kbd
              className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium"
              style={{ borderRadius: RADIUS.pill }}
            >
              Del
            </kbd>
            <span>Delete selected</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd
              className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium"
              style={{ borderRadius: RADIUS.pill }}
            >
              Ctrl+Z
            </kbd>
            <span>Undo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkflowNodePalette;
