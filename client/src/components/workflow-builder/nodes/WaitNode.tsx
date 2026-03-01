/**
 * Wait Node - Cyan delay node
 * Pauses workflow execution for a specified duration
 */

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Clock } from "lucide-react";

interface WaitNodeData {
  label: string;
  config: {
    duration: string;
    waitUntil?: string;
  };
}

// Parse duration string to human-readable format
function formatDuration(duration: string): string {
  if (!duration) return "";

  const match = duration.match(/^(\d+)(m|h|d|w)$/);
  if (!match) return duration;

  const [, value, unit] = match;
  const units: Record<string, string> = {
    m: "minute",
    h: "hour",
    d: "day",
    w: "week",
  };

  const unitName = units[unit] || unit;
  const plural = parseInt(value) !== 1 ? "s" : "";

  return `${value} ${unitName}${plural}`;
}

export const WaitNode = memo(({ data, selected }: NodeProps<WaitNodeData>) => {
  return (
    <div
      className={`
        px-4 py-3 rounded-xl min-w-[180px] bg-white
        border-2 shadow-lg
        ${selected ? "border-cyan-500 shadow-cyan-200" : "border-cyan-200"}
        transition-all duration-200
      `}
      style={{
        boxShadow: selected
          ? "0 4px 20px rgba(6, 182, 212, 0.25)"
          : "0 4px 12px rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-white !shadow-md"
      />

      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-lg"
          style={{
            background: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
            boxShadow: "0 4px 14px rgba(6, 182, 212, 0.3)",
          }}
        >
          <Clock className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-[10px] font-semibold text-cyan-600 uppercase tracking-wider">
            Wait
          </div>
          <div className="text-sm font-semibold text-slate-800">
            {data.label}
          </div>
        </div>
      </div>

      {data.config?.duration && (
        <div className="mt-2 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
          {formatDuration(data.config.duration)}
        </div>
      )}

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-white !shadow-md"
      />
    </div>
  );
});

WaitNode.displayName = "WaitNode";

export default WaitNode;
