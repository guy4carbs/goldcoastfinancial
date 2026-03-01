/**
 * Workflow Graph Validation
 * Validates workflow structure: connections, cycles, orphan nodes, etc.
 */

import type { Node, Edge } from "reactflow";

// =============================================================================
// TYPES
// =============================================================================

export interface ValidationError {
  type: "error";
  code: string;
  message: string;
  nodeId?: string;
}

export interface ValidationWarning {
  type: "warning";
  code: string;
  message: string;
  nodeId?: string;
}

export interface WorkflowValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// =============================================================================
// GRAPH VALIDATION
// =============================================================================

/**
 * Validate entire workflow graph structure
 */
export function validateWorkflow(
  nodes: Node[],
  edges: Edge[]
): WorkflowValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 1. Must have exactly one trigger
  const triggers = nodes.filter((n) => n.type === "trigger");
  if (triggers.length === 0) {
    errors.push({
      type: "error",
      code: "NO_TRIGGER",
      message: "Workflow must have a trigger node",
    });
  } else if (triggers.length > 1) {
    errors.push({
      type: "error",
      code: "MULTIPLE_TRIGGERS",
      message: "Workflow can only have one trigger",
    });
  }

  // 2. Check for orphaned nodes (no incoming edges except trigger)
  const nodesWithIncoming = new Set(edges.map((e) => e.target));
  nodes.forEach((node) => {
    if (node.type !== "trigger" && !nodesWithIncoming.has(node.id)) {
      errors.push({
        type: "error",
        code: "ORPHAN_NODE",
        message: `"${node.data?.label || node.id}" is not connected to the workflow`,
        nodeId: node.id,
      });
    }
  });

  // 3. Check condition nodes have both paths
  nodes
    .filter((n) => n.type === "condition")
    .forEach((node) => {
      const yesEdge = edges.find(
        (e) => e.source === node.id && e.sourceHandle === "yes"
      );
      const noEdge = edges.find(
        (e) => e.source === node.id && e.sourceHandle === "no"
      );

      if (!yesEdge) {
        errors.push({
          type: "error",
          code: "MISSING_YES_PATH",
          message: `Condition "${node.data?.label || node.id}" is missing the "Yes" path`,
          nodeId: node.id,
        });
      }
      if (!noEdge) {
        errors.push({
          type: "error",
          code: "MISSING_NO_PATH",
          message: `Condition "${node.data?.label || node.id}" is missing the "No" path`,
          nodeId: node.id,
        });
      }
    });

  // 4. Check for cycles (DFS)
  if (detectCycle(nodes, edges)) {
    errors.push({
      type: "error",
      code: "CYCLE_DETECTED",
      message: "Workflow contains a cycle (infinite loop)",
    });
  }

  // 5. All paths should end with End node
  const endNodes = nodes.filter((n) => n.type === "end");
  if (endNodes.length === 0) {
    warnings.push({
      type: "warning",
      code: "NO_END_NODE",
      message: "Workflow has no end node (recommended for clarity)",
    });
  }

  // 6. Check terminal nodes (nodes with no outgoing edges that aren't End)
  const nodesWithOutgoing = new Set(edges.map((e) => e.source));
  nodes.forEach((node) => {
    if (node.type !== "end" && !nodesWithOutgoing.has(node.id)) {
      // Condition nodes are already checked for missing paths
      if (node.type !== "condition") {
        warnings.push({
          type: "warning",
          code: "DEAD_END",
          message: `"${node.data?.label || node.id}" has no outgoing connection`,
          nodeId: node.id,
        });
      }
    }
  });

  // 7. Check trigger has at least one outgoing connection
  if (triggers.length === 1) {
    const triggerHasConnection = edges.some((e) => e.source === triggers[0].id);
    if (!triggerHasConnection) {
      warnings.push({
        type: "warning",
        code: "TRIGGER_NO_CONNECTION",
        message: "Trigger node has no outgoing connections",
        nodeId: triggers[0].id,
      });
    }
  }

  // 8. Check for actions without proper configuration
  nodes
    .filter((n) => n.type === "action")
    .forEach((node) => {
      const config = node.data?.config;
      if (!config?.actionType) {
        errors.push({
          type: "error",
          code: "ACTION_NO_TYPE",
          message: `Action "${node.data?.label || node.id}" has no action type configured`,
          nodeId: node.id,
        });
      }
    });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Detect cycles in the workflow graph using DFS
 */
function detectCycle(nodes: Node[], edges: Edge[]): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const outgoing = edges.filter((e) => e.source === nodeId);
    for (const edge of outgoing) {
      if (!visited.has(edge.target)) {
        if (dfs(edge.target)) return true;
      } else if (recursionStack.has(edge.target)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }

  return false;
}

/**
 * Get all reachable nodes from the trigger
 */
export function getReachableNodes(
  nodes: Node[],
  edges: Edge[]
): Set<string> {
  const reachable = new Set<string>();
  const trigger = nodes.find((n) => n.type === "trigger");

  if (!trigger) return reachable;

  const queue = [trigger.id];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (reachable.has(nodeId)) continue;

    reachable.add(nodeId);

    const outgoing = edges.filter((e) => e.source === nodeId);
    for (const edge of outgoing) {
      if (!reachable.has(edge.target)) {
        queue.push(edge.target);
      }
    }
  }

  return reachable;
}

/**
 * Get all paths from trigger to end nodes
 */
export function getAllPaths(
  nodes: Node[],
  edges: Edge[]
): string[][] {
  const paths: string[][] = [];
  const trigger = nodes.find((n) => n.type === "trigger");
  const endNodeIds = new Set(nodes.filter((n) => n.type === "end").map((n) => n.id));

  if (!trigger) return paths;

  function dfs(nodeId: string, currentPath: string[], visited: Set<string>): void {
    if (visited.has(nodeId)) return; // Prevent cycles

    const newPath = [...currentPath, nodeId];
    visited.add(nodeId);

    if (endNodeIds.has(nodeId)) {
      paths.push(newPath);
      visited.delete(nodeId);
      return;
    }

    const outgoing = edges.filter((e) => e.source === nodeId);
    if (outgoing.length === 0) {
      // Dead end - still record path
      paths.push(newPath);
    } else {
      for (const edge of outgoing) {
        dfs(edge.target, newPath, visited);
      }
    }

    visited.delete(nodeId);
  }

  dfs(trigger.id, [], new Set());

  return paths;
}

/**
 * Get fix suggestions for validation errors
 */
export function getFixSuggestion(error: ValidationError | ValidationWarning): string {
  switch (error.code) {
    case "NO_TRIGGER":
      return "Drag a Trigger node from the palette onto the canvas";
    case "MULTIPLE_TRIGGERS":
      return "Delete one of the trigger nodes. A workflow can only have one trigger.";
    case "ORPHAN_NODE":
      return "Connect this node to the workflow or delete it if unused";
    case "MISSING_YES_PATH":
      return "Connect the green 'Yes' handle to another node";
    case "MISSING_NO_PATH":
      return "Connect the red 'No' handle to another node";
    case "CYCLE_DETECTED":
      return "Remove the connection that creates the loop";
    case "NO_END_NODE":
      return "Add an End node to clearly mark workflow completion";
    case "DEAD_END":
      return "Connect this node to another node or add an End node";
    case "TRIGGER_NO_CONNECTION":
      return "Connect the trigger to the first action in your workflow";
    case "ACTION_NO_TYPE":
      return "Select this node and configure its action type in the properties panel";
    default:
      return "Review and fix the configuration";
  }
}
