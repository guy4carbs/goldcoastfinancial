/**
 * Shared React Flow wrapper for hierarchy visualization
 * Search bar, MiniMap, Controls, loading/empty states, legend
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import { Network, Search, X } from 'lucide-react';
import { COLORS, RADIUS, SHADOW } from '@/lib/heritageDesignSystem';
import { HierarchyNode } from './HierarchyNode';
import { SpreadEdge } from './SpreadEdge';
import { HierarchyDetailDrawer } from './HierarchyDetailDrawer';
import type { HierarchyTheme, HierarchyNodeData, HierarchyMember } from './types';

const AMBER = COLORS.accent.amber;

const nodeTypes = { hierarchy: HierarchyNode };
const edgeTypes = { spread: SpreadEdge };

interface HierarchyFlowProps {
  nodes: Node<HierarchyNodeData>[];
  edges: Edge[];
  theme: HierarchyTheme;
  isLoading: boolean;
  isEmpty: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  height?: number;
  showSearch?: boolean;
}

function FlowInner({
  nodes: inputNodes,
  edges: inputEdges,
  theme,
  isLoading,
  isEmpty,
  emptyTitle,
  emptySubtitle,
  height: containerHeight,
  showSearch = true,
}: HierarchyFlowProps) {
  const flowHeight = containerHeight || 600;
  const { fitView, setCenter } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<HierarchyNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const prevNodesRef = useRef<string>('');
  const [search, setSearch] = useState('');
  // Click → open detail drawer (mirrors Gold Coast's AgentDetailDrawer
  // pattern). We track the clicked member separately from React Flow's
  // built-in `selected` so the drawer can persist after the node loses
  // selection (e.g., when the user pans).
  const [drawerMember, setDrawerMember] = useState<HierarchyMember | null>(null);
  const [drawerIsYou, setDrawerIsYou] = useState(false);
  const [drawerParentLevel, setDrawerParentLevel] = useState<number | null>(null);

  const handleNodeClick = (_e: React.MouseEvent, node: Node<HierarchyNodeData>) => {
    const d = node.data as HierarchyNodeData;
    setDrawerMember(d.member);
    setDrawerIsYou(d.isYou);
    setDrawerParentLevel(d.parentContractLevel);
  };
  const closeDrawer = () => setDrawerMember(null);

  // Sync external nodes/edges into state
  useEffect(() => {
    const key = JSON.stringify(inputNodes.map(n => ({ id: n.id, x: n.position.x, y: n.position.y })));
    if (key !== prevNodesRef.current) {
      prevNodesRef.current = key;
      setNodes(inputNodes);
      setEdges(inputEdges);
      requestAnimationFrame(() => {
        fitView({ duration: 300, padding: 0.25 });
      });
    }
  }, [inputNodes, inputEdges, setNodes, setEdges, fitView]);

  // Search — highlight matching nodes
  const filteredNodes = useMemo(() => {
    if (!search.trim()) return nodes;
    const q = search.toLowerCase();
    return nodes.map(n => {
      const d = n.data as HierarchyNodeData;
      const matches = d.member.name.toLowerCase().includes(q)
        || d.member.title.toLowerCase().includes(q)
        || d.member.email.toLowerCase().includes(q);
      return {
        ...n,
        style: {
          ...n.style,
          opacity: matches ? 1 : 0.25,
          transition: 'opacity 0.2s ease',
        },
      };
    });
  }, [nodes, search]);

  // Jump to first search match
  useEffect(() => {
    if (!search.trim()) return;
    const q = search.toLowerCase();
    const match = nodes.find(n => {
      const d = n.data as HierarchyNodeData;
      return d.member.name.toLowerCase().includes(q);
    });
    if (match) {
      setCenter(match.position.x + 110, match.position.y + 35, { zoom: 1.2, duration: 400 });
    }
  }, [search, nodes, setCenter]);

  const containerStyle = {
    borderRadius: RADIUS.card,
    boxShadow: SHADOW.card,
    border: `1px solid ${theme.colors[200]}40`,
    background: `linear-gradient(160deg, ${theme.colors[50]}30 0%, #ffffff 25%, #fafafa 75%, ${theme.colors[50]}20 100%)`,
  };

  if (isLoading) {
    return (
      <div className="relative overflow-hidden" style={{ ...containerStyle, height: flowHeight }}>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: theme.colors[300], borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: COLORS.gray[400] }}>Loading hierarchy...</p>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="relative overflow-hidden" style={{ ...containerStyle, height: 350 }}>
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <div
            className="flex items-center justify-center"
            style={{
              width: 56, height: 56, borderRadius: RADIUS.card,
              background: `linear-gradient(135deg, ${theme.colors[100]} 0%, ${theme.colors[50]} 100%)`,
            }}
          >
            <Network className="w-7 h-7" style={{ color: theme.colors[400] }} />
          </div>
          <h3 className="text-base font-semibold" style={{ color: COLORS.gray[600] }}>
            {emptyTitle || 'No hierarchy data'}
          </h3>
          <p className="text-sm" style={{ color: COLORS.gray[400] }}>
            {emptySubtitle || 'Your hierarchy hasn\'t been set up yet.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden" style={{ ...containerStyle, height: flowHeight }}>
      {/* Search Bar — floating top-left */}
      {showSearch && (
        <div
          className="absolute top-3 left-3 z-10 flex items-center gap-2"
          style={{
            width: 240,
            padding: '8px 12px',
            borderRadius: RADIUS.input,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${COLORS.gray[200]}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: COLORS.gray[400] }} />
          <input
            type="text"
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none border-none text-sm placeholder:text-gray-400"
            style={{ color: COLORS.gray[800], fontSize: 13 }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              <X className="w-3.5 h-3.5" style={{ color: COLORS.gray[400] }} />
            </button>
          )}
        </div>
      )}

      <ReactFlow
        nodes={filteredNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.15}
        maxZoom={1.8}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        selectNodesOnDrag={false}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        proOptions={{ hideAttribution: true }}
      >
        <Background
          gap={20}
          size={1}
          color={theme.colors[300]}
          style={{ opacity: 0.2 }}
        />
        <Controls
          showInteractive={false}
          style={{
            borderRadius: RADIUS.input,
            boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
            border: `1px solid ${COLORS.gray[200]}`,
            overflow: 'hidden',
          }}
        />
        <MiniMap
          nodeColor={(node) => {
            const d = node.data as HierarchyNodeData;
            if (d.isRoot) return AMBER[600];
            if (d.isYou) return AMBER[400];
            return COLORS.gray[300];
          }}
          maskColor="rgba(255, 255, 255, 0.85)"
          style={{
            borderRadius: RADIUS.input,
            border: `1px solid ${COLORS.gray[200]}`,
            boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
          pannable
          zoomable
        />
      </ReactFlow>

      {/* Legend — top-right; amber across the board to match the new connectors */}
      <div
        className="absolute top-3 right-3 z-10 flex items-center gap-4 px-3 py-2"
        style={{
          borderRadius: RADIUS.input,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: `1px solid ${COLORS.gray[200]}`,
          fontSize: 11,
          color: COLORS.gray[500],
        }}
      >
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5" style={{ backgroundColor: AMBER[500], opacity: 0.4 }} />
          Connection
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="text-[9px] font-bold"
            style={{ color: AMBER[700] }}
          >
            10%
          </span>
          Override spread
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5"
            style={{ background: AMBER[600], borderRadius: 3 }}
          />
          Top tier
        </span>
      </div>

      <HierarchyDetailDrawer
        member={drawerMember}
        isYou={drawerIsYou}
        parentContractLevel={drawerParentLevel}
        onClose={closeDrawer}
      />
    </div>
  );
}

export function HierarchyFlow(props: HierarchyFlowProps) {
  return (
    <ReactFlowProvider>
      <FlowInner {...props} />
    </ReactFlowProvider>
  );
}
