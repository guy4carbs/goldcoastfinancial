/**
 * GCHierarchyFlow — React Flow hierarchy visualization
 * Ported from Heritage HierarchyFlow, rethemed with Gold Coast design tokens
 */
import { useState, useEffect, useRef, useMemo, memo, useCallback } from "react";
import { ReactFlow, ReactFlowProvider, Background, Controls, MiniMap, useReactFlow, useNodesState, useEdgesState, Handle, Position } from "@xyflow/react";
import type { Node, Edge, NodeProps, Connection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";

// Types
export interface GCHierarchyMember {
  id: string; name: string; title: string; level: number;
  contractLevel: number; overridePercentage: number; totalAip: number;
  carriers?: number; status?: string;
}

interface GCNodeData extends Record<string, unknown> {
  member: GCHierarchyMember;
  isRoot: boolean;
  parentContractLevel: number | null;
  isMuted?: boolean;
  isHighlighted?: boolean;
}

// Layout
const NODE_W = 240;
const NODE_H = 80;

function layoutTree(nodes: Node<GCNodeData>[], edges: Edge[]): { nodes: Node<GCNodeData>[]; edges: Edge[] } {
  if (!nodes.length) return { nodes: [], edges: [] };
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 50, ranksep: 120, marginx: 40, marginy: 40 });
  nodes.forEach(n => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach(e => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return {
    nodes: nodes.map(n => { const p = g.node(n.id); return { ...n, position: { x: (p?.x || 0) - NODE_W / 2, y: (p?.y || 0) - NODE_H / 2 } }; }),
    edges,
  };
}

function fmtAip(n: number): string {
  return n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${Math.round(n / 1000)}K`;
}

// Inject the gold pulse keyframes once on first node render. Scoped to
// document head; safe to call multiple times because the style element id
// guards against duplicates.
function ensurePulseKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById("gc-hierarchy-pulse-style")) return;
  const style = document.createElement("style");
  style.id = "gc-hierarchy-pulse-style";
  style.textContent = `@keyframes gcPulse { 0%, 100% { box-shadow: 0 0 0 0 var(--gc-gold); } 50% { box-shadow: 0 0 0 8px transparent; } }`;
  document.head.appendChild(style);
}

// Node Component
const GCNode = memo(({ data }: NodeProps) => {
  const { member, isRoot, parentContractLevel, isMuted, isHighlighted } = data as GCNodeData;
  const spread = parentContractLevel != null ? member.contractLevel - (parentContractLevel || 0) : 0;

  useEffect(() => { if (isHighlighted) ensurePulseKeyframes(); }, [isHighlighted]);

  // Two-line clamp keeps the card stable even when names or titles are long.
  // dagre still gets the representative NODE_H for layout spacing; the rendered
  // card relaxes to height: auto so multi-line text doesn't overflow visually.
  const clampStyle: React.CSSProperties = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    whiteSpace: "normal",
    wordBreak: "break-word",
    lineHeight: 1.2,
  };

  // Highlighted nodes get a 2px gold pulse ring via inline style. Muted nodes
  // (cohort context rows) drop opacity so in-cohort agents stand out.
  const cardStyle: React.CSSProperties = {
    width: NODE_W,
    minHeight: NODE_H,
    height: "auto",
    borderRadius: "var(--gc-radius-md)",
    overflow: "hidden",
    backgroundColor: isRoot ? "var(--gc-gold)" : "var(--gc-surface)",
    border: `${isHighlighted ? 2 : 1.5}px solid ${
      isHighlighted ? "var(--gc-gold)" : isRoot ? "var(--gc-gold-bright)" : "var(--gc-border)"
    }`,
    boxShadow: isRoot ? "0 4px 16px color-mix(in srgb, var(--gc-gold) 30%, transparent)" : "var(--gc-shadow-sm)",
    transition: "transform var(--gc-transition-fast), box-shadow var(--gc-transition-fast)",
    cursor: "pointer",
    opacity: isMuted ? 0.45 : 1,
    animation: isHighlighted ? "gcPulse 1.4s ease-in-out infinite" : undefined,
  };

  return (
    <div style={{ width: NODE_W }}>
      <Handle type="target" position={Position.Top} style={{ width: 8, height: 8, background: "var(--gc-gold)", border: "2px solid var(--gc-gold-bright)", borderRadius: "50%", top: -4 }} />
      <div style={cardStyle}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--gc-shadow-md)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = isRoot ? "0 4px 16px color-mix(in srgb, var(--gc-gold) 30%, transparent)" : "var(--gc-shadow-sm)"; }}
      >
        <div style={{ padding: "12px 16px" }}>
          <div title={member.name} style={{ ...clampStyle, fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 600, color: isRoot ? "var(--gc-btn-primary-text)" : "var(--gc-text-primary)", marginBottom: 2 }}>{member.name}</div>
          <div title={member.title} style={{ ...clampStyle, fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: isRoot ? "var(--gc-btn-primary-text)" : "var(--gc-text-secondary)", opacity: 0.8, marginBottom: 8 }}>{member.title}</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", fontWeight: 600, color: isRoot ? "var(--gc-btn-primary-text)" : "var(--gc-gold)" }}>{member.contractLevel}%</span>
              {member.overridePercentage > 0 && (
                <span style={{ padding: "1px 6px", borderRadius: "var(--gc-radius-sm)", fontSize: "9px", fontWeight: 600, color: isRoot ? "var(--gc-btn-primary-text)" : "var(--gc-gold)", backgroundColor: isRoot ? "rgba(255,255,255,0.2)" : "color-mix(in srgb, var(--gc-gold) 12%, transparent)" }}>{member.overridePercentage}% override</span>
              )}
            </div>
            <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", color: isRoot ? "var(--gc-btn-primary-text)" : "var(--gc-text-muted)", opacity: 0.7 }}>{fmtAip(member.totalAip)}</span>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ width: 8, height: 8, background: "var(--gc-gold)", border: "2px solid var(--gc-gold-bright)", borderRadius: "50%", bottom: -4 }} />
    </div>
  );
});
GCNode.displayName = "GCNode";

const nodeTypes = { gcNode: GCNode };

// Build nodes/edges from tree
export function buildNodesEdges(tree: GCHierarchyMember & { children: any[] }, parentId: string | null = null, parentContract: number | null = null): { nodes: Node<GCNodeData>[]; edges: Edge[] } {
  const nodes: Node<GCNodeData>[] = [];
  const edges: Edge[] = [];

  nodes.push({
    id: tree.id, type: "gcNode", position: { x: 0, y: 0 },
    data: { member: tree, isRoot: parentId === null, parentContractLevel: parentContract },
  });

  if (parentId) {
    const spread = tree.contractLevel < (parentContract || 0) ? (parentContract || 0) - tree.contractLevel : 0;
    edges.push({
      id: `${parentId}-${tree.id}`, source: parentId, target: tree.id,
      type: "default",
      style: { stroke: "var(--gc-gold)", strokeWidth: 1.5, opacity: 0.4 },
      label: spread > 0 ? `${spread}%` : undefined,
      labelStyle: { fontSize: 10, fill: "var(--gc-gold)", fontWeight: 600 },
      labelBgStyle: { fill: "var(--gc-bg)", fillOpacity: 0.8 },
    });
  }

  if (tree.children) {
    for (const child of tree.children) {
      const childResult = buildNodesEdges(child, tree.id, tree.contractLevel);
      nodes.push(...childResult.nodes);
      edges.push(...childResult.edges);
    }
  }

  return { nodes, edges };
}

interface FlowInnerProps {
  nodes: Node<GCNodeData>[];
  edges: Edge[];
  height: number;
  highlightedNodeId?: string | null;
  mutedNodeIds?: Set<string>;
  onNodeClick?: (id: string) => void;
  /**
   * NEW: Fired on a single click (debounced ~250ms to allow double-click
   * discrimination). When provided, single-click → opens detail drawer; the
   * existing `onNodeClick` is then routed to double-click → drill behavior.
   * If `onNodeOpenDrawer` is NOT provided, `onNodeClick` keeps its old
   * single-click contract for legacy callers.
   */
  onNodeOpenDrawer?: (id: string) => void;
  editable?: boolean;
  onMoveAgent?: (agentId: string, newUplineId: string | null) => void;
  onNodeRightClick?: (agentId: string, x: number, y: number) => void;
}

// Main Flow Component
function FlowInner({ nodes: inputNodes, edges: inputEdges, height, highlightedNodeId, mutedNodeIds, onNodeClick, onNodeOpenDrawer, editable, onMoveAgent, onNodeRightClick }: FlowInnerProps) {
  const { fitView, setCenter, getNode } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<GCNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const prevRef = useRef("");

  // Re-layout whenever the input topology changes. Including muted/highlight in
  // the key would force a relayout on highlight changes — those should be
  // applied below via a separate effect that only mutates node data.
  useEffect(() => {
    const key = JSON.stringify(inputNodes.map(n => n.id));
    if (key !== prevRef.current) {
      prevRef.current = key;
      const decorated = inputNodes.map(n => ({
        ...n,
        data: {
          ...n.data,
          isMuted: mutedNodeIds?.has(n.id) ?? false,
          isHighlighted: highlightedNodeId === n.id,
        },
      }));
      const laid = layoutTree(decorated, inputEdges);
      setNodes(laid.nodes);
      setEdges(laid.edges);
      setTimeout(() => fitView({ padding: 0.15, duration: 300 }), 100);
    }
  }, [inputNodes, inputEdges, setNodes, setEdges, fitView, mutedNodeIds, highlightedNodeId]);

  // Live-update node decoration (muted / highlighted) without re-layout. This
  // makes search highlights and cohort filters animate smoothly instead of
  // resetting the camera.
  useEffect(() => {
    setNodes(curr => curr.map(n => ({
      ...n,
      data: {
        ...n.data,
        isMuted: mutedNodeIds?.has(n.id) ?? false,
        isHighlighted: highlightedNodeId === n.id,
      },
    })));
  }, [mutedNodeIds, highlightedNodeId, setNodes]);

  // When a node becomes highlighted, pan the viewport to center it. zoom=1.1
  // keeps surrounding context visible — full zoom-in feels jarring.
  useEffect(() => {
    if (!highlightedNodeId) return;
    const node = getNode(highlightedNodeId);
    if (!node) return;
    setCenter(node.position.x + NODE_W / 2, node.position.y + NODE_H / 2, { zoom: 1.1, duration: 600 });
  }, [highlightedNodeId, getNode, setCenter]);

  // Single vs double click discrimination. When `onNodeOpenDrawer` is wired up,
  // a single click is debounced ~250ms before firing the open-drawer handler.
  // A second click within that window cancels the timer and fires the existing
  // `onNodeClick` (drill) instead. If only `onNodeClick` is provided, we keep
  // the legacy fire-on-single-click contract so existing callers don't break.
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  const handleNodeClick = useCallback((_evt: any, node: Node) => {
    // No drawer handler — preserve legacy single-click drill behavior.
    if (!onNodeOpenDrawer) {
      onNodeClick?.(node.id);
      return;
    }
    // Pending timer means this is the second click → fire drill (double-click).
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      onNodeClick?.(node.id);
      return;
    }
    // First click → arm a 250ms timer that fires the drawer if no second click.
    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null;
      onNodeOpenDrawer(node.id);
    }, 250);
  }, [onNodeClick, onNodeOpenDrawer]);

  // Admin variant: drawing an edge from source's bottom handle to target's
  // top handle means "set source as new upline of target". React Flow gives
  // us source/target on the connection — we forward to the parent so the
  // mutation + optimistic UI lives in the page component.
  const handleConnect = useCallback((connection: Connection) => {
    if (!editable || !onMoveAgent) return;
    const { source, target } = connection;
    if (!source || !target || source === target) return;
    // sourceNode is the new upline; targetNode is the agent being moved
    onMoveAgent(target, source);
  }, [editable, onMoveAgent]);

  // Admin variant: right-click forwards screen coords to the parent so it can
  // anchor a floating context menu. Prevent the browser's native menu.
  const handleNodeContextMenu = useCallback((evt: React.MouseEvent, node: Node) => {
    if (!editable || !onNodeRightClick) return;
    evt.preventDefault();
    if (node.id === "agency") return; // synthetic root has no real agent record
    onNodeRightClick(node.id, evt.clientX, evt.clientY);
  }, [editable, onNodeRightClick]);

  return (
    <div style={{ width: "100%", height, borderRadius: "var(--gc-radius-md)", overflow: "hidden", border: "1px solid var(--gc-border)", backgroundColor: "var(--gc-bg)" }}>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onConnect={editable ? handleConnect : undefined}
        onNodeContextMenu={editable ? handleNodeContextMenu : undefined}
        nodesConnectable={!!editable}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.3} maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--gc-border-subtle)" gap={20} size={1} />
        <Controls showInteractive={false} style={{ borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", backgroundColor: "var(--gc-surface)", boxShadow: "var(--gc-shadow-sm)" }} className="gc-flow-controls" />
        <MiniMap nodeStrokeColor="var(--gc-gold)" nodeColor="var(--gc-surface)" maskColor="color-mix(in srgb, var(--gc-bg) 85%, transparent)" style={{ borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", backgroundColor: "var(--gc-surface)", width: 120, height: 80 }} />
      </ReactFlow>
    </div>
  );
}

interface GCHierarchyFlowProps {
  nodes: Node<GCNodeData>[];
  edges: Edge[];
  height?: number;
  highlightedNodeId?: string | null;
  mutedNodeIds?: Set<string>;
  /**
   * Fired on a single click when `onNodeOpenDrawer` is NOT provided.
   * When `onNodeOpenDrawer` IS provided, this is fired on DOUBLE-click instead
   * (the new contract) — used to drill into a sub-tree.
   */
  onNodeClick?: (id: string) => void;
  /**
   * NEW: Fired on a single click (debounced ~250ms). Pair this with
   * `onNodeClick` to get single = open drawer / double = drill semantics.
   */
  onNodeOpenDrawer?: (id: string) => void;
  /** When true, enables drag-drop reorganize + right-click context menu. */
  editable?: boolean;
  /** Fired when an edge is drawn from source's bottom handle to target's top handle. sourceNode becomes the new upline of targetNode. */
  onMoveAgent?: (agentId: string, newUplineId: string | null) => void;
  /** Fired on node right-click. Coords are screen-space (clientX/clientY) for fixed positioning. */
  onNodeRightClick?: (agentId: string, x: number, y: number) => void;
}

export function GCHierarchyFlow({ nodes, edges, height = 550, highlightedNodeId, mutedNodeIds, onNodeClick, onNodeOpenDrawer, editable, onMoveAgent, onNodeRightClick }: GCHierarchyFlowProps) {
  return (
    <ReactFlowProvider>
      <FlowInner
        nodes={nodes}
        edges={edges}
        height={height}
        highlightedNodeId={highlightedNodeId}
        mutedNodeIds={mutedNodeIds}
        onNodeClick={onNodeClick}
        onNodeOpenDrawer={onNodeOpenDrawer}
        editable={editable}
        onMoveAgent={onMoveAgent}
        onNodeRightClick={onNodeRightClick}
      />
    </ReactFlowProvider>
  );
}
