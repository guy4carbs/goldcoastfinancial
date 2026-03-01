/**
 * Condition Node - Orange branching node
 * Has Yes/No output handles for branching logic
 * Tracks connection state for visual feedback
 */

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { GitBranch, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConditionNodeData {
  label: string;
  config: {
    field: string;
    operator: string;
    value: unknown;
    description?: string;
  };
  // Connection state tracking
  yesConnected?: boolean;
  noConnected?: boolean;
}

export const ConditionNode = memo(({ data, selected }: NodeProps<ConditionNodeData>) => {
  const hasBothPaths = data.yesConnected && data.noConnected;
  const hasMissingPath = !data.yesConnected || !data.noConnected;

  return (
    <div
      className={cn(
        "px-4 py-3 rounded-xl min-w-[180px] bg-white",
        "border-2 shadow-lg transition-all duration-200",
        selected ? "border-amber-500 shadow-amber-200" : "border-amber-200",
        hasMissingPath && !selected && "border-amber-400"
      )}
      style={{
        boxShadow: selected
          ? "0 4px 20px rgba(245, 158, 11, 0.25)"
          : "0 4px 12px rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white !shadow-md"
      />

      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-lg relative"
          style={{
            background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
            boxShadow: "0 4px 14px rgba(245, 158, 11, 0.3)",
          }}
        >
          <GitBranch className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">
              Condition
            </span>
            {hasMissingPath && (
              <span className="text-[9px] font-medium text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">
                Connect paths
              </span>
            )}
          </div>
          <div className="text-sm font-semibold text-slate-800">
            {data.label}
          </div>
        </div>
      </div>

      {data.config?.description && (
        <div className="mt-2 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
          {data.config.description}
        </div>
      )}

      {/* Yes/No output handles with connection state */}
      <div className="flex justify-between mt-4 px-2">
        <div className="relative flex flex-col items-center">
          <span className={cn(
            "text-[10px] font-semibold mb-1 transition-colors",
            data.yesConnected ? "text-emerald-600" : "text-emerald-400"
          )}>
            Yes
          </span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            className={cn(
              "!relative !transform-none !w-3 !h-3 !border-2 !border-white !shadow-md transition-all",
              data.yesConnected
                ? "!bg-emerald-500"
                : "!bg-emerald-300 animate-pulse"
            )}
            style={{ left: 'auto', bottom: 'auto' }}
          />
          {!data.yesConnected && (
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
            </div>
          )}
        </div>
        <div className="relative flex flex-col items-center">
          <span className={cn(
            "text-[10px] font-semibold mb-1 transition-colors",
            data.noConnected ? "text-rose-600" : "text-rose-400"
          )}>
            No
          </span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            className={cn(
              "!relative !transform-none !w-3 !h-3 !border-2 !border-white !shadow-md transition-all",
              data.noConnected
                ? "!bg-rose-500"
                : "!bg-rose-300 animate-pulse"
            )}
            style={{ left: 'auto', bottom: 'auto' }}
          />
          {!data.noConnected && (
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-ping" />
            </div>
          )}
        </div>
      </div>

      {/* Warning indicator for incomplete branching */}
      {hasMissingPath && (
        <div className="absolute -top-2 -right-2">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-75" />
            <div className="relative w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
              <AlertCircle className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ConditionNode.displayName = "ConditionNode";

export default ConditionNode;
