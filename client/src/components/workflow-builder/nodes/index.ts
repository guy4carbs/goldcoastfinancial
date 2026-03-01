/**
 * Custom Workflow Builder Nodes
 * Export all node types for React Flow registration
 */

import { TriggerNode } from "./TriggerNode";
import { ActionNode } from "./ActionNode";
import { ConditionNode } from "./ConditionNode";
import { WaitNode } from "./WaitNode";
import { EndNode } from "./EndNode";

// Re-export for external use
export { TriggerNode, ActionNode, ConditionNode, WaitNode, EndNode };

// Node types mapping for React Flow
export const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  wait: WaitNode,
  end: EndNode,
};
