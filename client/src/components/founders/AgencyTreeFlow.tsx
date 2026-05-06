/**
 * AgencyTreeFlow — React Flow visualization of the recursive `agencies` tree.
 *
 * Adapter around the same dagre + React Flow stack used by GCHierarchyFlow.tsx,
 * but with a simpler node payload (an agency carries name + dba + team count
 * instead of contract level + override % + AIP). We keep the shapes deliberately
 * separate because:
 *   - Agency tree relations encode legal-entity parent/child (e.g. Heritage →
 *     sub-brand), which has no notion of "contract level" or "spread".
 *   - Re-using `GCNode` would force us to pipe contract-level fields through,
 *     bloating the API and risking bad UX (extraneous % chips on agency cards).
 *
 * Click a node → forwards the selected agencyId via `onSelect`. Selected nodes
 * get a gold border to anchor the right-pane detail view.
 */
import { useEffect, useMemo, useRef, memo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  useReactFlow,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from "@xyflow/react";
import type { Node, Edge, NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";
import { Building2, Users } from "lucide-react";

export interface AgencyTreeNode {
  id: string;
  parent_agency_id?: string | null;
  name: string;
  dba_name?: string | null;
  status?: string | null;
  teams?: Array<{ manager_user_id: string; manager_name?: string }> | null;
  children?: AgencyTreeNode[] | null;
}

interface AgencyNodeData extends Record<string, unknown> {
  agency: AgencyTreeNode;
  isRoot: boolean;
  isSelected: boolean;
  teamCount: number;
}

const NODE_W = 240;
const NODE_H = 90;

function layout(nodes: Node<AgencyNodeData>[], edges: Edge[]): { nodes: Node<AgencyNodeData>[]; edges: Edge[] } {
  if (!nodes.length) return { nodes: [], edges: [] };
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 50, ranksep: 90, marginx: 24, marginy: 24 });
  nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return {
    nodes: nodes.map((n) => {
      const p = g.node(n.id);
      return {
        ...n,
        position: { x: (p?.x || 0) - NODE_W / 2, y: (p?.y || 0) - NODE_H / 2 },
      };
    }),
    edges,
  };
}

const AgencyNode = memo(({ data }: NodeProps) => {
  const { agency, isRoot, isSelected, teamCount } = data as AgencyNodeData;
  const cardStyle: React.CSSProperties = {
    width: NODE_W,
    minHeight: NODE_H,
    borderRadius: "var(--gc-radius-md)",
    overflow: "hidden",
    backgroundColor: isRoot ? "var(--gc-gold)" : "var(--gc-surface)",
    border: `${isSelected ? 2 : 1.5}px solid ${
      isSelected ? "var(--gc-gold)" : isRoot ? "var(--gc-gold-bright)" : "var(--gc-border)"
    }`,
    boxShadow: isRoot
      ? "0 4px 16px color-mix(in srgb, var(--gc-gold) 30%, transparent)"
      : "var(--gc-shadow-sm)",
    transition: "transform var(--gc-transition-fast), box-shadow var(--gc-transition-fast)",
    cursor: "pointer",
  };
  const titleColor = isRoot ? "var(--gc-btn-primary-text)" : "var(--gc-text-primary)";
  const subColor = isRoot ? "var(--gc-btn-primary-text)" : "var(--gc-text-secondary)";
  const mutedColor = isRoot ? "var(--gc-btn-primary-text)" : "var(--gc-text-muted)";
  return (
    <div style={{ width: NODE_W }}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ width: 8, height: 8, background: "var(--gc-gold)", border: "2px solid var(--gc-gold-bright)", borderRadius: "50%", top: -4 }}
      />
      <div
        style={cardStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "var(--gc-shadow-md)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = isRoot
            ? "0 4px 16px color-mix(in srgb, var(--gc-gold) 30%, transparent)"
            : "var(--gc-shadow-sm)";
        }}
      >
        <div style={{ padding: "12px 14px" }}>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-3.5 h-3.5" style={{ color: titleColor, opacity: 0.85 }} />
            <div
              style={{
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-base)",
                fontWeight: 600,
                color: titleColor,
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={agency.name}
            >
              {agency.name}
            </div>
          </div>
          {agency.dba_name && (
            <div
              style={{
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-xs)",
                color: subColor,
                opacity: 0.85,
                marginBottom: 6,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={`DBA ${agency.dba_name}`}
            >
              DBA {agency.dba_name}
            </div>
          )}
          <div className="flex items-center justify-between">
            <span
              className="flex items-center gap-1"
              style={{
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-xs)",
                color: mutedColor,
              }}
            >
              <Users className="w-3 h-3" />
              {teamCount} {teamCount === 1 ? "team" : "teams"}
            </span>
            <span
              style={{
                padding: "1px 8px",
                borderRadius: "var(--gc-radius-sm)",
                fontSize: "10px",
                fontWeight: 600,
                color: titleColor,
                backgroundColor: isRoot
                  ? "rgba(255,255,255,0.18)"
                  : "color-mix(in srgb, var(--gc-gold) 12%, transparent)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {agency.status || "active"}
            </span>
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ width: 8, height: 8, background: "var(--gc-gold)", border: "2px solid var(--gc-gold-bright)", borderRadius: "50%", bottom: -4 }}
      />
    </div>
  );
});
AgencyNode.displayName = "AgencyNode";

const nodeTypes = { agencyNode: AgencyNode };

export function buildAgencyNodesEdges(
  tree: AgencyTreeNode,
  selectedId: string | null,
  parentId: string | null = null
): { nodes: Node<AgencyNodeData>[]; edges: Edge[] } {
  const nodes: Node<AgencyNodeData>[] = [];
  const edges: Edge[] = [];
  const teamCount = (tree.teams || []).length;
  nodes.push({
    id: tree.id,
    type: "agencyNode",
    position: { x: 0, y: 0 },
    data: {
      agency: tree,
      isRoot: parentId === null,
      isSelected: selectedId === tree.id,
      teamCount,
    },
  });
  if (parentId) {
    edges.push({
      id: `${parentId}-${tree.id}`,
      source: parentId,
      target: tree.id,
      type: "default",
      style: { stroke: "var(--gc-gold)", strokeWidth: 1.5, opacity: 0.4 },
    });
  }
  if (tree.children) {
    for (const child of tree.children) {
      const childResult = buildAgencyNodesEdges(child, selectedId, tree.id);
      nodes.push(...childResult.nodes);
      edges.push(...childResult.edges);
    }
  }
  return { nodes, edges };
}

interface FlowInnerProps {
  nodes: Node<AgencyNodeData>[];
  edges: Edge[];
  height: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function FlowInner({ nodes: input, edges: inputEdges, height, selectedId, onSelect }: FlowInnerProps) {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<AgencyNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const prevRef = useRef("");

  // Re-layout on topology change. Selection-only changes flow through the
  // separate effect below so the camera doesn't snap to fitView each click.
  useEffect(() => {
    const key = JSON.stringify(input.map((n) => n.id));
    if (key !== prevRef.current) {
      prevRef.current = key;
      const laid = layout(input, inputEdges);
      setNodes(laid.nodes);
      setEdges(laid.edges);
      setTimeout(() => fitView({ padding: 0.18, duration: 300 }), 80);
    }
  }, [input, inputEdges, setNodes, setEdges, fitView]);

  useEffect(() => {
    setNodes((curr) =>
      curr.map((n) => ({
        ...n,
        data: { ...(n.data as AgencyNodeData), isSelected: selectedId === n.id },
      }))
    );
  }, [selectedId, setNodes]);

  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: "var(--gc-radius-md)",
        overflow: "hidden",
        border: "1px solid var(--gc-border)",
        backgroundColor: "var(--gc-bg)",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_e, n) => onSelect(n.id)}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--gc-border-subtle)" gap={20} size={1} />
        <Controls
          showInteractive={false}
          style={{
            borderRadius: "var(--gc-radius-sm)",
            border: "1px solid var(--gc-border)",
            backgroundColor: "var(--gc-surface)",
            boxShadow: "var(--gc-shadow-sm)",
          }}
          className="gc-flow-controls"
        />
      </ReactFlow>
    </div>
  );
}

export interface AgencyTreeFlowProps {
  tree: AgencyTreeNode | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  height?: number;
}

export function AgencyTreeFlow({ tree, selectedId, onSelect, height = 520 }: AgencyTreeFlowProps) {
  const { nodes, edges } = useMemo(() => {
    if (!tree) return { nodes: [], edges: [] };
    return buildAgencyNodesEdges(tree, selectedId);
  }, [tree, selectedId]);

  if (!tree) {
    return (
      <div
        style={{
          height,
          backgroundColor: "var(--gc-surface)",
          border: "1px dashed var(--gc-border)",
          borderRadius: "var(--gc-radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--gc-text-muted)",
          fontFamily: "var(--gc-font-body)",
          fontSize: "var(--gc-text-sm)",
        }}
      >
        No agencies yet — click "New Agency" to create the root.
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <FlowInner nodes={nodes} edges={edges} height={height} selectedId={selectedId} onSelect={onSelect} />
    </ReactFlowProvider>
  );
}
