/**
 * End Node - Terminal node
 * Marks the end of a workflow branch
 */

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { CheckCircle, XCircle, Ban } from "lucide-react";

interface EndNodeData {
  label: string;
  config: {
    status: "success" | "failed" | "cancelled";
    note?: string;
  };
}

const STATUS_CONFIG = {
  success: {
    icon: CheckCircle,
    gradient: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
    borderDefault: "border-emerald-200",
    borderSelected: "border-emerald-500 shadow-emerald-200",
    shadowSelected: "0 4px 20px rgba(34, 197, 94, 0.25)",
    shadowDefault: "0 4px 12px rgba(0, 0, 0, 0.08)",
    shadowIcon: "0 4px 14px rgba(34, 197, 94, 0.3)",
    labelColor: "text-emerald-600",
    handleColor: "!bg-emerald-500",
  },
  failed: {
    icon: XCircle,
    gradient: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
    borderDefault: "border-rose-200",
    borderSelected: "border-rose-500 shadow-rose-200",
    shadowSelected: "0 4px 20px rgba(239, 68, 68, 0.25)",
    shadowDefault: "0 4px 12px rgba(0, 0, 0, 0.08)",
    shadowIcon: "0 4px 14px rgba(239, 68, 68, 0.3)",
    labelColor: "text-rose-600",
    handleColor: "!bg-rose-500",
  },
  cancelled: {
    icon: Ban,
    gradient: "linear-gradient(135deg, #64748B 0%, #475569 100%)",
    borderDefault: "border-slate-300",
    borderSelected: "border-slate-500 shadow-slate-200",
    shadowSelected: "0 4px 20px rgba(100, 116, 139, 0.25)",
    shadowDefault: "0 4px 12px rgba(0, 0, 0, 0.08)",
    shadowIcon: "0 4px 14px rgba(100, 116, 139, 0.3)",
    labelColor: "text-slate-600",
    handleColor: "!bg-slate-500",
  },
};

export const EndNode = memo(({ data, selected }: NodeProps<EndNodeData>) => {
  const status = data.config?.status || "success";
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div
      className={`
        px-4 py-3 rounded-xl min-w-[140px] bg-white
        border-2 shadow-lg
        ${selected ? config.borderSelected : config.borderDefault}
        transition-all duration-200
      `}
      style={{
        boxShadow: selected ? config.shadowSelected : config.shadowDefault,
      }}
    >
      {/* Input handle only - end nodes don't have outputs */}
      <Handle
        type="target"
        position={Position.Top}
        className={`!w-3 !h-3 ${config.handleColor} !border-2 !border-white !shadow-md`}
      />

      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-lg"
          style={{
            background: config.gradient,
            boxShadow: config.shadowIcon,
          }}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className={`text-[10px] font-semibold uppercase tracking-wider ${config.labelColor}`}>
            End
          </div>
          <div className="text-sm font-semibold text-slate-800">
            {data.label || status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>
      </div>

      {data.config?.note && (
        <div className="mt-2 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
          {data.config.note}
        </div>
      )}
    </div>
  );
});

EndNode.displayName = "EndNode";

export default EndNode;
