import { useState, useCallback } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface HierarchyNode {
  id: string; name: string; title: string; level: number;
  contractLevel: number; overridePercentage: number; totalAip: number;
  children: HierarchyNode[];
}

export interface GCHierarchyTreeProps { data: HierarchyNode; onNodeClick?: (node: HierarchyNode) => void; selectedNodeId?: string; }

function TreeNode({ node, depth, onNodeClick, selectedNodeId, expandedIds, toggleExpand }: {
  node: HierarchyNode; depth: number; onNodeClick?: (n: HierarchyNode) => void; selectedNodeId?: string;
  expandedIds: Set<string>; toggleExpand: (id: string) => void;
}) {
  const expanded = expandedIds.has(node.id);
  const selected = selectedNodeId === node.id;
  const hasChildren = node.children.length > 0;
  const isOwner = node.level === 0;

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center cursor-pointer" onClick={() => onNodeClick?.(node)}
        tabIndex={0} role="treeitem" aria-expanded={hasChildren ? expanded : undefined}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (hasChildren) toggleExpand(node.id); onNodeClick?.(node); } }}
        style={{ minWidth: 200 }}>
        <div style={{
          padding: "var(--gc-space-3) var(--gc-space-4)", borderRadius: "var(--gc-radius-md)",
          border: selected ? "2px solid var(--gc-gold)" : "1px solid var(--gc-border)",
          backgroundColor: isOwner ? "var(--gc-gold)" : "var(--gc-surface)",
          transition: "border-color var(--gc-transition-fast)", width: "100%",
        }}>
          <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, color: isOwner ? "var(--gc-btn-primary-text)" : "var(--gc-text-primary)" }}>{node.name}</div>
          <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: isOwner ? "var(--gc-btn-primary-text)" : "var(--gc-text-secondary)", opacity: 0.8 }}>{node.title}</div>
          <div className="flex items-center justify-between mt-1">
            <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", fontWeight: 600, color: isOwner ? "var(--gc-btn-primary-text)" : "var(--gc-gold)" }}>{node.contractLevel}%</span>
            {node.overridePercentage > 0 && <span style={{ fontSize: "var(--gc-text-xs)", padding: "1px 6px", borderRadius: "var(--gc-radius-sm)", backgroundColor: `color-mix(in srgb, var(--gc-gold) 15%, transparent)`, color: "var(--gc-gold)" }}>{node.overridePercentage}% override</span>}
          </div>
          <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: isOwner ? "var(--gc-btn-primary-text)" : "var(--gc-text-muted)", marginTop: 4 }}>${(node.totalAip / 1000).toFixed(0)}K AIP</div>
          {hasChildren && (
            <button onClick={e => { e.stopPropagation(); toggleExpand(node.id); }} className="mt-1 p-0.5" style={{ color: isOwner ? "var(--gc-btn-primary-text)" : "var(--gc-text-muted)" }}>
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
      {hasChildren && expanded && (
        <>
          <div className="w-px h-4" style={{ backgroundColor: "var(--gc-gold)", opacity: 0.4 }} />
          <div className="flex gap-8 relative">
            {node.children.length > 1 && <div className="absolute top-0 h-px" style={{ left: "25%", right: "25%", backgroundColor: "var(--gc-gold)", opacity: 0.4 }} />}
            {node.children.map(child => (
              <div key={child.id} className="flex flex-col items-center">
                {node.children.length > 1 && <div className="w-px h-4" style={{ backgroundColor: "var(--gc-gold)", opacity: 0.4 }} />}
                <TreeNode node={child} depth={depth + 1} onNodeClick={onNodeClick} selectedNodeId={selectedNodeId} expandedIds={expandedIds} toggleExpand={toggleExpand} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function GCHierarchyTree({ data, onNodeClick, selectedNodeId }: GCHierarchyTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([data.id, ...data.children.map(c => c.id)]));
  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }, []);

  return (
    <div className="overflow-x-auto py-4" role="tree">
      <div className="inline-flex justify-center min-w-full">
        <TreeNode node={data} depth={0} onNodeClick={onNodeClick} selectedNodeId={selectedNodeId} expandedIds={expandedIds} toggleExpand={toggleExpand} />
      </div>
    </div>
  );
}
