/**
 * GCHierarchyFlow — React Flow hierarchy visualization
 * Ported from Heritage HierarchyFlow, rethemed with Gold Coast design tokens
 */
import { useState, useEffect, useRef, useMemo, memo, useCallback } from "react";
import { ReactFlow, ReactFlowProvider, Background, Controls, MiniMap, useReactFlow, useNodesState, useEdgesState, Handle, Position } from "@xyflow/react";
import type { Node, Edge, NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";

// Types
export interface GCHierarchyMember {
  id: string; name: string; title: string; level: number;
  contractLevel: number; overridePercentage: number; totalAip: number;
  carriers?: number; status?: string;
}

interface GCNodeData extends Record<string, unknown> {
  member: GCHierarchyMember; isRoot: boolean; parentContractLevel: number | null;
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

// Node Component
const GCNode = memo(({ data }: NodeProps) => {
  const { member, isRoot, parentContractLevel } = data as GCNodeData;
  const spread = parentContractLevel != null ? member.contractLevel - (parentContractLevel || 0) : 0;

  return (
    <div style={{ width: NODE_W }}>
      <Handle type="target" position={Position.Top} style={{ width: 8, height: 8, background: "var(--gc-gold)", border: "2px solid var(--gc-gold-bright)", borderRadius: "50%", top: -4 }} />
      <div style={{
        width: NODE_W, borderRadius: "var(--gc-radius-md)", overflow: "hidden",
        backgroundColor: isRoot ? "var(--gc-gold)" : "var(--gc-surface)",
        border: `1.5px solid ${isRoot ? "var(--gc-gold-bright)" : "var(--gc-border)"}`,
        boxShadow: isRoot ? "0 4px 16px color-mix(in srgb, var(--gc-gold) 30%, transparent)" : "var(--gc-shadow-sm)",
        transition: "transform var(--gc-transition-fast), box-shadow var(--gc-transition-fast)",
        cursor: "pointer",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--gc-shadow-md)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = isRoot ? "0 4px 16px color-mix(in srgb, var(--gc-gold) 30%, transparent)" : "var(--gc-shadow-sm)"; }}
      >
        <div style={{ padding: "12px 16px" }}>
          <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 600, color: isRoot ? "var(--gc-btn-primary-text)" : "var(--gc-text-primary)", marginBottom: 2 }}>{member.name}</div>
          <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: isRoot ? "var(--gc-btn-primary-text)" : "var(--gc-text-secondary)", opacity: 0.8, marginBottom: 8 }}>{member.title}</div>
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

// Main Flow Component
function FlowInner({ nodes: inputNodes, edges: inputEdges, height }: { nodes: Node<GCNodeData>[]; edges: Edge[]; height: number }) {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<GCNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const prevRef = useRef("");

  useEffect(() => {
    const key = JSON.stringify(inputNodes.map(n => n.id));
    if (key !== prevRef.current) {
      prevRef.current = key;
      const laid = layoutTree(inputNodes, inputEdges);
      setNodes(laid.nodes);
      setEdges(laid.edges);
      setTimeout(() => fitView({ padding: 0.15, duration: 300 }), 100);
    }
  }, [inputNodes, inputEdges, setNodes, setEdges, fitView]);

  return (
    <div style={{ width: "100%", height, borderRadius: "var(--gc-radius-md)", overflow: "hidden", border: "1px solid var(--gc-border)", backgroundColor: "var(--gc-bg)" }}>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.3} maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--gc-border-subtle)" gap={20} size={1} />
        <Controls showInteractive={false} style={{ borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", backgroundColor: "var(--gc-surface)" }} />
        <MiniMap nodeStrokeColor="var(--gc-gold)" nodeColor="var(--gc-surface)" maskColor="color-mix(in srgb, var(--gc-bg) 80%, transparent)" style={{ borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)" }} />
      </ReactFlow>
    </div>
  );
}

export function GCHierarchyFlow({ nodes, edges, height = 550 }: { nodes: Node<GCNodeData>[]; edges: Edge[]; height?: number }) {
  return (
    <ReactFlowProvider>
      <FlowInner nodes={nodes} edges={edges} height={height} />
    </ReactFlowProvider>
  );
}
