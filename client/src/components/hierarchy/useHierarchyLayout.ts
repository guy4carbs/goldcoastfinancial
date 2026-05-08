/**
 * Dagre-based layout engine for hierarchy tree
 * Converts hierarchy data → React Flow nodes/edges with computed positions
 */
import type { Node, Edge } from '@xyflow/react';
import type { HierarchyMember, HierarchyNodeData, HierarchyTheme } from './types';

import dagre from '@dagrejs/dagre';

// Match Gold Coast layout dimensions: 240×80 cards, dagre TB direction,
// 50px horizontal node sep, 120px vertical rank sep. Click now opens the
// drawer instead of expanding the node, so we don't need a separate
// "expanded" height.
const NODE_WIDTH = 240;
const NODE_HEIGHT = 80;

export function getLayoutedElements(
  nodes: Node<HierarchyNodeData>[],
  edges: Edge[],
  _selectedId: string | null = null,
): { nodes: Node<HierarchyNodeData>[]; edges: Edge[] } {
  if (!nodes || nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  try {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({
      rankdir: 'TB',
      nodesep: 50,
      ranksep: 120,
      marginx: 40,
      marginy: 40,
    });

    for (const node of nodes) {
      g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    }

    for (const edge of edges) {
      g.setEdge(edge.source, edge.target);
    }

    dagre.layout(g);

    const layoutedNodes = nodes.map((node) => {
      const pos = g.node(node.id);
      if (!pos) return { ...node, position: { x: 0, y: 0 } };
      return {
        ...node,
        position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
      };
    });

    return { nodes: layoutedNodes, edges };
  } catch {
    // Dagre can crash on malformed graphs — return nodes without layout
    return {
      nodes: nodes.map((node, i) => ({
        ...node,
        position: { x: 0, y: i * (NODE_HEIGHT + 40) },
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

  // Upline chain (top-to-bottom by seniority: owner first). The first
  // entry — the agent's most-senior upline — is rendered as the visual
  // root (amber fill, white text) per the Gold Coast convention.
  const sortedUpline = [...upline].reverse();
  for (let i = 0; i < sortedUpline.length; i++) {
    const m = sortedUpline[i];
    nodes.push({
      id: m.id,
      type: 'hierarchy',
      position: { x: 0, y: 0 },
      data: { member: m, isYou: false, isRoot: i === 0, theme, parentContractLevel: null },
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

  // Agent (YOU) node — only the visual root if there's no upline at all.
  const lastUpline = sortedUpline[sortedUpline.length - 1] || null;
  nodes.push({
    id: agent.id,
    type: 'hierarchy',
    position: { x: 0, y: 0 },
    data: {
      member: agent,
      isYou: true,
      isRoot: sortedUpline.length === 0,
      theme,
      parentContractLevel: lastUpline?.contractLevel ?? null,
    },
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

  // Downline — never root.
  for (const m of downline) {
    nodes.push({
      id: m.id,
      type: 'hierarchy',
      position: { x: 0, y: 0 },
      data: { member: m, isYou: false, isRoot: false, theme, parentContractLevel: agent.contractLevel },
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

  // Root node — top of the visible tree, rendered with the amber accent.
  nodes.push({
    id: rootId,
    type: 'hierarchy',
    position: { x: 0, y: 0 },
    data: { member: rootMember, isYou: rootId === myId, isRoot: true, theme, parentContractLevel: null },
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
          isRoot: false,
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
