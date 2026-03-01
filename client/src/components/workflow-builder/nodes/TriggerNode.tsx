/**
 * Trigger Node - Green entry point node
 * Only one allowed per workflow
 */

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Zap } from "lucide-react";

interface TriggerNodeData {
  label: string;
  config: {
    triggerType: string;
    eventType?: string;
    schedule?: string;
  };
}

export const TriggerNode = memo(({ data, selected }: NodeProps<TriggerNodeData>) => {
  return (
    <div
      className={`
        px-4 py-3 rounded-xl min-w-[180px] bg-white
        border-2 shadow-lg
        ${selected ? "border-emerald-500 shadow-emerald-200" : "border-emerald-200"}
        transition-all duration-200
      `}
      style={{
        boxShadow: selected
          ? "0 4px 20px rgba(34, 197, 94, 0.25)"
          : "0 4px 12px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-lg"
          style={{
            background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
            boxShadow: "0 4px 14px rgba(34, 197, 94, 0.3)",
          }}
        >
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
            Trigger
          </div>
          <div className="text-sm font-semibold text-slate-800">
            {data.label}
          </div>
        </div>
      </div>

      {data.config?.eventType && (
        <div className="mt-2 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
          {data.config.eventType.replace(/_/g, " ")}
        </div>
      )}

      {/* Output handle only - triggers don't have inputs */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white !shadow-md"
      />
    </div>
  );
});

TriggerNode.displayName = "TriggerNode";

export default TriggerNode;
