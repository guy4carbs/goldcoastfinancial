/**
 * Workflow Canvas
 * React Flow wrapper with connection validation, keyboard shortcuts, and drag-drop support
 */

import { useCallback, useRef, DragEvent } from "react";
import ReactFlow, {
  Background,
  MiniMap,
  ReactFlowProvider,
  ReactFlowInstance,
  Node,
  Connection,
  ConnectionLineType,
} from "reactflow";
import "reactflow/dist/style.css";
import { nodeTypes } from "./nodes";
import { WorkflowControls } from "./WorkflowControls";
import { useWorkflowStore } from "./hooks/useWorkflowStore";

// Default node data by type
const getDefaultNodeData = (type: string): Node["data"] => {
  switch (type) {
    case "trigger":
      return {
        label: "New Trigger",
        config: { triggerType: "event_based", eventType: "" },
      };
    case "action":
      return {
        label: "New Action",
        config: { actionType: "send_sms", message: "" },
      };
    case "condition":
      return {
        label: "New Condition",
        config: { field: "", operator: "eq", value: "" },
      };
    case "wait":
      return {
        label: "Wait",
        config: { duration: "1h" },
      };
    case "end":
      return {
        label: "End",
        config: { status: "success" },
      };
    default:
      return { label: "Node", config: {} };
  }
};

interface WorkflowCanvasProps {
  className?: string;
}

function WorkflowCanvasInner({ className = "" }: WorkflowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNode,
    pushHistory,
    copyNode,
    pasteNode,
    duplicateNode,
  } = useWorkflowStore();

  // Connection validation rules
  const isValidConnection = useCallback(
    (connection: Connection) => {
      const { source, target, sourceHandle } = connection;
      if (!source || !target) return false;

      const sourceNode = nodes.find((n) => n.id === source);
      const targetNode = nodes.find((n) => n.id === target);

      // Rule 1: Can't connect to self
      if (source === target) return false;

      // Rule 2: Trigger can only be source (not target)
      if (targetNode?.type === "trigger") return false;

      // Rule 3: End can only be target (not source)
      if (sourceNode?.type === "end") return false;

      // Rule 4: Each condition handle can only have ONE outgoing edge
      if (sourceNode?.type === "condition" && sourceHandle) {
        const existingEdge = edges.find(
          (e) => e.source === source && e.sourceHandle === sourceHandle
        );
        if (existingEdge) return false;
      }

      // Rule 5: Non-condition nodes can only have ONE outgoing edge
      if (sourceNode?.type !== "condition") {
        const existingEdge = edges.find((e) => e.source === source);
        if (existingEdge) return false;
      }

      return true;
    },
    [nodes, edges]
  );

  // Handle node click for selection
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  // Clear selection when clicking canvas
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  // Handle drop from palette
  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !reactFlowWrapper.current || !reactFlowInstance.current) {
        return;
      }

      // Don't allow multiple triggers
      if (type === "trigger" && nodes.some((n) => n.type === "trigger")) {
        return;
      }

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: getDefaultNodeData(type),
      };

      pushHistory();
      addNode(newNode);
      setSelectedNode(newNode);
    },
    [nodes, addNode, setSelectedNode, pushHistory]
  );

  // Handle keyboard shortcuts
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const {
        undo,
        redo,
        canUndo,
        canRedo,
        selectedNode,
        deleteNode,
        copyNode,
        pasteNode,
        duplicateNode,
      } = useWorkflowStore.getState();

      const isMod = event.ctrlKey || event.metaKey;

      // Ctrl/Cmd+C - Copy selected node
      if (isMod && event.key === "c" && selectedNode) {
        event.preventDefault();
        copyNode(selectedNode.id);
      }

      // Ctrl/Cmd+V - Paste from clipboard
      if (isMod && event.key === "v") {
        event.preventDefault();
        pasteNode();
      }

      // Ctrl/Cmd+D - Duplicate selected node
      if (isMod && event.key === "d" && selectedNode) {
        event.preventDefault();
        duplicateNode(selectedNode.id);
      }

      // Ctrl/Cmd+Z for undo
      if (isMod && event.key === "z" && !event.shiftKey && canUndo()) {
        event.preventDefault();
        undo();
      }

      // Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y for redo
      if (
        (isMod && event.shiftKey && event.key === "z") ||
        (isMod && event.key === "y")
      ) {
        if (canRedo()) {
          event.preventDefault();
          redo();
        }
      }

      // Delete or Backspace to delete selected node
      if ((event.key === "Delete" || event.key === "Backspace") && selectedNode) {
        // Don't delete trigger nodes
        if (selectedNode.type !== "trigger") {
          event.preventDefault();
          deleteNode(selectedNode.id);
        }
      }
    },
    []
  );

  return (
    <div
      ref={reactFlowWrapper}
      className={`flex-1 ${className}`}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onInit={(instance) => {
          reactFlowInstance.current = instance;
        }}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: "#8B5CF6", strokeWidth: 2 },
          animated: false,
        }}
        connectionLineStyle={{ stroke: "#8B5CF6", strokeWidth: 2 }}
        connectionLineType={ConnectionLineType.SmoothStep}
        snapToGrid
        snapGrid={[15, 15]}
        className="bg-slate-100"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="#CBD5E1"
          gap={20}
          size={1}
          className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200"
        />
        <WorkflowControls />
        <MiniMap
          className="!bg-white !border-slate-200 !rounded-lg !shadow-md"
          nodeColor={(node) => {
            switch (node.type) {
              case "trigger":
                return "#22C55E";
              case "action":
                return "#14B8A6";
              case "condition":
                return "#F59E0B";
              case "wait":
                return "#06B6D4";
              case "end":
                return "#EF4444";
              default:
                return "#8B5CF6";
            }
          }}
          maskColor="rgba(241, 245, 249, 0.8)"
        />
      </ReactFlow>
    </div>
  );
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

export default WorkflowCanvas;
