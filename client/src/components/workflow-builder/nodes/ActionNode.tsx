/**
 * Action Node - Teal action node
 * SMS, Email, Task creation, etc.
 */

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Mail, MessageSquare, Bell, ClipboardList, UserCog, Tag, Webhook } from "lucide-react";

interface ActionNodeData {
  label: string;
  config: {
    actionType: string;
    to?: string;
    subject?: string;
    message?: string;
    body?: string;
    title?: string;
  };
}

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  send_email: Mail,
  send_sms: MessageSquare,
  send_notification: Bell,
  create_task: ClipboardList,
  update_lead: UserCog,
  assign_lead: UserCog,
  add_tag: Tag,
  webhook: Webhook,
};

export const ActionNode = memo(({ data, selected }: NodeProps<ActionNodeData>) => {
  const Icon = ACTION_ICONS[data.config?.actionType] || Bell;

  return (
    <div
      className={`
        px-4 py-3 rounded-xl min-w-[180px] bg-white
        border-2 shadow-lg
        ${selected ? "border-teal-500 shadow-teal-200" : "border-teal-200"}
        transition-all duration-200
      `}
      style={{
        boxShadow: selected
          ? "0 4px 20px rgba(20, 184, 166, 0.25)"
          : "0 4px 12px rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-teal-500 !border-2 !border-white !shadow-md"
      />

      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-lg"
          style={{
            background: "linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)",
            boxShadow: "0 4px 14px rgba(20, 184, 166, 0.3)",
          }}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider">
            Action
          </div>
          <div className="text-sm font-semibold text-slate-800">
            {data.label}
          </div>
        </div>
      </div>

      {data.config?.actionType && (
        <div className="mt-2 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
          {data.config.actionType.replace(/_/g, " ")}
        </div>
      )}

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-teal-500 !border-2 !border-white !shadow-md"
      />
    </div>
  );
});

ActionNode.displayName = "ActionNode";

export default ActionNode;
