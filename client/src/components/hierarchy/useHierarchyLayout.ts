/**
 * Dagre-based layout engine for hierarchy tree
 * Converts hierarchy data → React Flow nodes/edges with computed positions
 */
import type { Node, Edge } from '@xyflow/react';
import type { HierarchyMember, HierarchyNodeData, HierarchyTheme } from './types';

import dagre from '@dagrejs/dagre';

const NODE_WIDTH = 220;
const NODE_HEIGHT_COLLAPSED = 70;
const NODE_HEIGHT_EXPANDED = 220;

export function getLayoutedElements(
  nodes: Node<HierarchyNodeData>[],
  edges: Edge[],
  selectedId: string | null = null,
): { nodes: Node<HierarchyNodeData>[]; edges: Edge[] } {
  if (!nodes || nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  try {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({
      rankdir: 'TB',
      nodesep: 40,
      ranksep: 100,
      marginx: 40,
      marginy: 40,
    });

    for (const node of nodes) {
      const h = node.id === selectedId ? NODE_HEIGHT_EXPANDED : NODE_HEIGHT_COLLAPSED;
      g.setNode(node.id, { width: NODE_WIDTH, height: h });
    }

    for (const edge of edges) {
      g.setEdge(edge.source, edge.target);
    }

    dagre.layout(g);

    const layoutedNodes = nodes.map((node) => {
      const pos = g.node(node.id);
      if (!pos) return { ...node, position: { x: 0, y: 0 } };
      const h = node.id === selectedId ? NODE_HEIGHT_EXPANDED : NODE_HEIGHT_COLLAPSED;
      return {
        ...node,
        position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - h / 2 },
      };
    });

    return { nodes: layoutedNodes, edges };
  } catch {
    // Dagre can crash on malformed graphs — return nodes without layout
    return {
      nodes: nodes.map((node, i) => ({
        ...node,
        position: { x: 0, y: i * (NODE_HEIGHT_COLLAPSED + 40) },
      })),
      edges,
    };
  }
}

/**
 * Agent page: linear upline chain → YOU → downline fan-out
 */
export function buildFlowFromAgentData(
  agent: HierarchyMember,
  upline: HierarchyMember[],
  downline: HierarchyMember[],
  theme: HierarchyTheme,
): { nodes: Node<HierarchyNodeData>[]; edges: Edge[] } {
  const nodes: Node<HierarchyNodeData>[] = [];
  const edges: Edge[] = [];

  // Upline chain (top-to-bottom by seniority: owner first)
  const sortedUpline = [...upline].reverse();
  for (let i = 0; i < sortedUpline.length; i++) {
    const m = sortedUpline[i];
    nodes.push({
      id: m.id,
      type: 'hierarchy',
      position: { x: 0, y: 0 },
      data: { member: m, isYou: false, theme, parentContractLevel: null },
    });
    if (i > 0) {
      const parent = sortedUpline[i - 1];
      edges.push({
        id: `e-${parent.id}-${m.id}`,
        source: parent.id,
        target: m.id,
        type: 'spread',
        data: { spread: getSpread(parent.contractLevel, m.contractLevel), theme },
      });
    }
  }

  // Agent (YOU) node
  const lastUpline = sortedUpline[sortedUpline.length - 1] || null;
  nodes.push({
    id: agent.id,
    type: 'hierarchy',
    position: { x: 0, y: 0 },
    data: { member: agent, isYou: true, theme, parentContractLevel: lastUpline?.contractLevel ?? null },
  });
  if (lastUpline) {
    edges.push({
      id: `e-${lastUpline.id}-${agent.id}`,
      source: lastUpline.id,
      target: agent.id,
      type: 'spread',
      data: { spread: getSpread(lastUpline.contractLevel, agent.contractLevel), theme },
    });
  }

  // Downline
  for (const m of downline) {
    nodes.push({
      id: m.id,
      type: 'hierarchy',
      position: { x: 0, y: 0 },
      data: { member: m, isYou: false, theme, parentContractLevel: agent.contractLevel },
    });
    edges.push({
      id: `e-${agent.id}-${m.id}`,
      source: agent.id,
      target: m.id,
      type: 'spread',
      data: { spread: getSpread(agent.contractLevel, m.contractLevel), theme },
    });
  }

  return { nodes, edges };
}

/**
 * Manager/Executive page: flat list with directUplineId → tree
 */
export function buildFlowFromFlatTree(
  flatMembers: HierarchyMember[],
  rootId: string,
  myId: string,
  theme: HierarchyTheme,
  rootMember: HierarchyMember,
): { nodes: Node<HierarchyNodeData>[]; edges: Edge[] } {
  const nodes: Node<HierarchyNodeData>[] = [];
  const edges: Edge[] = [];

  // Build parent→children map
  const byParent = new Map<string, HierarchyMember[]>();
  for (const m of flatMembers) {
    if (m.directUplineId) {
      if (!byParent.has(m.directUplineId)) byParent.set(m.directUplineId, []);
      byParent.get(m.directUplineId)!.push(m);
    }
  }

  // Create a map for quick lookup
  const memberMap = new Map<string, HierarchyMember>();
  for (const m of flatMembers) memberMap.set(m.id, m);
  memberMap.set(rootId, rootMember);

  // Root node
  nodes.push({
    id: rootId,
    type: 'hierarchy',
    position: { x: 0, y: 0 },
    data: { member: rootMember, isYou: rootId === myId, theme, parentContractLevel: null },
  });

  // BFS to build all nodes and edges
  const queue = [rootId];
  const visited = new Set<string>([rootId]);
  while (queue.length > 0) {
    const parentId = queue.shift()!;
    const parent = memberMap.get(parentId);
    const children = byParent.get(parentId) || [];
    for (const child of children) {
      if (visited.has(child.id)) continue;
      visited.add(child.id);
      nodes.push({
        id: child.id,
        type: 'hierarchy',
        position: { x: 0, y: 0 },
        data: {
          member: child,
          isYou: child.id === myId,
          theme,
          parentContractLevel: parent?.contractLevel ?? null,
        },
      });
      edges.push({
        id: `e-${parentId}-${child.id}`,
        source: parentId,
        target: child.id,
        type: 'spread',
        data: { spread: getSpread(parent?.contractLevel ?? null, child.contractLevel), theme },
      });
      queue.push(child.id);
    }
  }

  return { nodes, edges };
}

function getSpread(parentLevel: number | null, childLevel: number | null): number {
  if (parentLevel == null || childLevel == null) return 0;
  const s = parentLevel - childLevel;
  return s > 0 ? s : 0;
}
