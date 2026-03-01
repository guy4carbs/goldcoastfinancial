/**
 * Workflow Builder Zustand Store
 * Manages workflow state with undo/redo support, copy/paste, and connection tracking
 */

import { create } from "zustand";
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  addEdge,
} from "reactflow";

export interface WorkflowState {
  // Core state
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;

  // Workflow metadata
  workflowId: string | null;
  workflowName: string;
  workflowDescription: string;
  isEnabled: boolean;

  // UI state
  isDirty: boolean;
  isSaving: boolean;

  // Clipboard for copy/paste
  clipboard: Node | null;

  // History for undo/redo
  history: { nodes: Node[]; edges: Edge[] }[];
  historyIndex: number;

  // Actions
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addNode: (node: Node) => void;
  updateNode: (nodeId: string, data: Partial<Node["data"]>) => void;
  deleteNode: (nodeId: string) => void;

  // Copy/Paste/Duplicate
  copyNode: (nodeId: string) => void;
  pasteNode: () => void;
  duplicateNode: (nodeId: string) => void;

  setSelectedNode: (node: Node | null) => void;

  setWorkflowMeta: (meta: { name?: string; description?: string; enabled?: boolean }) => void;

  loadWorkflow: (workflow: {
    id: string;
    name: string;
    description?: string;
    enabled: boolean;
    workflow: { nodes: Node[]; edges: Edge[] };
  }) => void;

  resetWorkflow: () => void;

  // History
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // State management
  setIsDirty: (dirty: boolean) => void;
  setIsSaving: (saving: boolean) => void;

  // Get export format
  getWorkflowDefinition: () => { nodes: Node[]; edges: Edge[] };

  // Connection state helpers
  getConnectedHandles: (nodeId: string) => { yes: boolean; no: boolean };
  updateConditionConnectionStates: () => void;
}

const MAX_HISTORY = 50;

// Default empty workflow with a trigger node
const getDefaultNodes = (): Node[] => [
  {
    id: "trigger-1",
    type: "trigger",
    position: { x: 250, y: 50 },
    data: {
      label: "Trigger",
      config: { triggerType: "event_based", eventType: "" },
    },
  },
];

// Helper function to update condition node connection states
const updateConditionNodes = (nodes: Node[], edges: Edge[]): Node[] => {
  return nodes.map((node) => {
    if (node.type === "condition") {
      const yesEdge = edges.find(
        (e) => e.source === node.id && e.sourceHandle === "yes"
      );
      const noEdge = edges.find(
        (e) => e.source === node.id && e.sourceHandle === "no"
      );
      return {
        ...node,
        data: {
          ...node.data,
          yesConnected: !!yesEdge,
          noConnected: !!noEdge,
        },
      };
    }
    return node;
  });
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // Initial state
  nodes: getDefaultNodes(),
  edges: [],
  selectedNode: null,

  workflowId: null,
  workflowName: "New Workflow",
  workflowDescription: "",
  isEnabled: false,

  isDirty: false,
  isSaving: false,

  clipboard: null,

  history: [],
  historyIndex: -1,

  // React Flow callbacks
  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
      isDirty: true,
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => {
      const newEdges = applyEdgeChanges(changes, state.edges);
      // Update condition node connection states when edges change
      const updatedNodes = updateConditionNodes(state.nodes, newEdges);
      return {
        edges: newEdges,
        nodes: updatedNodes,
        isDirty: true,
      };
    });
  },

  onConnect: (connection) => {
    const state = get();
    state.pushHistory();

    // Create edge with proper styling
    const newEdge: Edge = {
      ...connection,
      id: `e-${connection.source}-${connection.target}-${Date.now()}`,
      type: "smoothstep",
      animated: false,
      style: { stroke: "#8B5CF6", strokeWidth: 2 },
    } as Edge;

    // If coming from a condition node, add Yes/No label and style
    const sourceNode = state.nodes.find((n) => n.id === connection.source);
    if (sourceNode?.type === "condition" && connection.sourceHandle) {
      const isYes = connection.sourceHandle === "yes";
      newEdge.label = isYes ? "Yes" : "No";
      newEdge.labelStyle = {
        fill: isYes ? "#059669" : "#DC2626",
        fontWeight: 600,
        fontSize: 11
      };
      newEdge.labelBgStyle = { fill: "#FFFFFF", fillOpacity: 0.95 };
      newEdge.labelBgPadding = [4, 8] as [number, number];
      newEdge.labelBgBorderRadius = 4;
      // Color the edge based on the branch
      newEdge.style = {
        stroke: isYes ? "#10B981" : "#EF4444",
        strokeWidth: 2
      };
    }

    set((state) => {
      const newEdges = addEdge(newEdge, state.edges);
      // Update condition node connection states
      const updatedNodes = updateConditionNodes(state.nodes, newEdges);
      return {
        edges: newEdges,
        nodes: updatedNodes,
        isDirty: true,
      };
    });
  },

  // Node operations
  addNode: (node) => {
    const state = get();
    state.pushHistory();
    set((state) => ({
      nodes: [...state.nodes, node],
      isDirty: true,
    }));
  },

  updateNode: (nodeId, data) => {
    const state = get();
    state.pushHistory();
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
      isDirty: true,
    }));
  },

  deleteNode: (nodeId) => {
    const state = get();
    state.pushHistory();
    set((state) => {
      const newEdges = state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      );
      const newNodes = state.nodes.filter((node) => node.id !== nodeId);
      // Update condition states after deletion
      const updatedNodes = updateConditionNodes(newNodes, newEdges);
      return {
        nodes: updatedNodes,
        edges: newEdges,
        selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode,
        isDirty: true,
      };
    });
  },

  // Copy node to clipboard
  copyNode: (nodeId) => {
    const node = get().nodes.find((n) => n.id === nodeId);
    if (node && node.type !== "trigger") {
      set({ clipboard: JSON.parse(JSON.stringify(node)) });
    }
  },

  // Paste node from clipboard
  pasteNode: () => {
    const state = get();
    if (!state.clipboard) return;

    state.pushHistory();

    const newNode: Node = {
      ...state.clipboard,
      id: `${state.clipboard.type}-${Date.now()}`,
      position: {
        x: state.clipboard.position.x + 50,
        y: state.clipboard.position.y + 50,
      },
      data: JSON.parse(JSON.stringify(state.clipboard.data)),
      selected: false,
    };

    // Reset connection state for condition nodes
    if (newNode.type === "condition") {
      newNode.data.yesConnected = false;
      newNode.data.noConnected = false;
    }

    set((state) => ({
      nodes: [...state.nodes, newNode],
      selectedNode: newNode,
      isDirty: true,
    }));
  },

  // Duplicate node in place
  duplicateNode: (nodeId) => {
    const state = get();
    const node = state.nodes.find((n) => n.id === nodeId);
    if (!node || node.type === "trigger") return;

    state.pushHistory();

    const newNode: Node = {
      ...node,
      id: `${node.type}-${Date.now()}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      data: JSON.parse(JSON.stringify(node.data)),
      selected: false,
    };

    // Reset connection state for condition nodes
    if (newNode.type === "condition") {
      newNode.data.yesConnected = false;
      newNode.data.noConnected = false;
    }

    set((state) => ({
      nodes: [...state.nodes, newNode],
      selectedNode: newNode,
      isDirty: true,
    }));
  },

  setSelectedNode: (node) => {
    set({ selectedNode: node });
  },

  setWorkflowMeta: (meta) => {
    set((state) => ({
      workflowName: meta.name ?? state.workflowName,
      workflowDescription: meta.description ?? state.workflowDescription,
      isEnabled: meta.enabled ?? state.isEnabled,
      isDirty: true,
    }));
  },

  loadWorkflow: (workflow) => {
    // Update condition node connection states when loading
    const updatedNodes = updateConditionNodes(
      workflow.workflow.nodes,
      workflow.workflow.edges
    );
    set({
      workflowId: workflow.id,
      workflowName: workflow.name,
      workflowDescription: workflow.description || "",
      isEnabled: workflow.enabled,
      nodes: updatedNodes,
      edges: workflow.workflow.edges,
      selectedNode: null,
      isDirty: false,
      history: [],
      historyIndex: -1,
    });
  },

  resetWorkflow: () => {
    set({
      nodes: getDefaultNodes(),
      edges: [],
      selectedNode: null,
      workflowId: null,
      workflowName: "New Workflow",
      workflowDescription: "",
      isEnabled: false,
      isDirty: false,
      history: [],
      historyIndex: -1,
    });
  },

  // History management
  pushHistory: () => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push({
      nodes: JSON.parse(JSON.stringify(state.nodes)),
      edges: JSON.parse(JSON.stringify(state.edges)),
    });

    // Limit history size
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex >= 0) {
      const prevState = state.history[state.historyIndex];
      set({
        nodes: prevState.nodes,
        edges: prevState.edges,
        historyIndex: state.historyIndex - 1,
        isDirty: true,
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const nextState = state.history[state.historyIndex + 1];
      set({
        nodes: nextState.nodes,
        edges: nextState.edges,
        historyIndex: state.historyIndex + 1,
        isDirty: true,
      });
    }
  },

  canUndo: () => {
    const state = get();
    return state.historyIndex >= 0;
  },

  canRedo: () => {
    const state = get();
    return state.historyIndex < state.history.length - 1;
  },

  setIsDirty: (dirty) => set({ isDirty: dirty }),
  setIsSaving: (saving) => set({ isSaving: saving }),

  getWorkflowDefinition: () => {
    const state = get();
    return {
      nodes: state.nodes,
      edges: state.edges,
    };
  },

  // Get connection state for a specific node's handles
  getConnectedHandles: (nodeId) => {
    const state = get();
    const yesEdge = state.edges.find(
      (e) => e.source === nodeId && e.sourceHandle === "yes"
    );
    const noEdge = state.edges.find(
      (e) => e.source === nodeId && e.sourceHandle === "no"
    );
    return { yes: !!yesEdge, no: !!noEdge };
  },

  // Update all condition node connection states
  updateConditionConnectionStates: () => {
    set((state) => ({
      nodes: updateConditionNodes(state.nodes, state.edges),
    }));
  },
}));
