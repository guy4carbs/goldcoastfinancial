import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type HierarchyNode, type Column } from "@/components/gc";
import { GCHierarchyFlow, buildNodesEdges } from "@/components/gc/GCHierarchyFlow";
import { Link } from "wouter";
import { Eye, X as XIcon, Users } from "lucide-react";

const MOCK_TREE: HierarchyNode = {
  id: "owner", name: "Gaetano", title: "Agency Owner", level: 0, contractLevel: 120, overridePercentage: 0, totalAip: 1243500,
  children: [
    { id: "9", name: "Jack Cook", title: "Diamond Director", level: 1, contractLevel: 100, overridePercentage: 20, totalAip: 620000, children: [
      { id: "mgr1", name: "Nicholas Gallagher", title: "Regional Manager", level: 2, contractLevel: 90, overridePercentage: 10, totalAip: 380000, children: [
        { id: "1", name: "Sarah Mitchell", title: "Senior Agent", level: 3, contractLevel: 85, overridePercentage: 5, totalAip: 245000, children: [
          { id: "7", name: "Robert Kim", title: "Associate Agent", level: 5, contractLevel: 70, overridePercentage: 0, totalAip: 0, children: [] },
        ]},
        { id: "4", name: "Emily Watson", title: "Agent", level: 4, contractLevel: 80, overridePercentage: 0, totalAip: 152000, children: [] },
        { id: "8", name: "Amanda Torres", title: "Agent", level: 4, contractLevel: 80, overridePercentage: 0, totalAip: 42000, children: [] },
      ]},
      { id: "5", name: "David Park", title: "Team Lead", level: 3, contractLevel: 83, overridePercentage: 3, totalAip: 240000, children: [
        { id: "2", name: "James Rodriguez", title: "Agent", level: 4, contractLevel: 80, overridePercentage: 0, totalAip: 176000, children: [] },
      ]},
    ]},
    { id: "3", name: "Michael Chen", title: "Platinum Director", level: 1, contractLevel: 95, overridePercentage: 15, totalAip: 523500, children: [
      { id: "6", name: "Lisa Thompson", title: "Agent", level: 4, contractLevel: 80, overridePercentage: 0, totalAip: 134000, children: [] },
    ]},
  ],
};

// Agent metadata for detail panel
const AGENT_META: Record<string, { carriers: number; docs: string; status: string }> = {
  "owner": { carriers: 0, docs: "N/A", status: "approved" },
  "9": { carriers: 6, docs: "9/9", status: "approved" },
  "mgr1": { carriers: 0, docs: "N/A", status: "approved" },
  "1": { carriers: 3, docs: "7/9", status: "approved" },
  "2": { carriers: 2, docs: "9/9", status: "approved" },
  "3": { carriers: 5, docs: "9/9", status: "approved" },
  "4": { carriers: 1, docs: "5/9", status: "in_review" },
  "5": { carriers: 4, docs: "9/9", status: "approved" },
  "6": { carriers: 1, docs: "8/9", status: "approved" },
  "7": { carriers: 0, docs: "2/9", status: "pending_review" },
  "8": { carriers: 0, docs: "5/9", status: "in_review" },
};

// Flatten tree for table view
function flatten(node: HierarchyNode, upline: string = "—", depth: number = 0): any[] {
  const meta = AGENT_META[node.id] || { carriers: 0, docs: "—", status: "approved" };
  return [
    { id: node.id, name: node.name, level: node.level, title: node.title, contractLevel: node.contractLevel, overridePercentage: node.overridePercentage, upline, downlines: node.children.length, teamAip: node.totalAip, carriers: meta.carriers, docs: meta.docs, status: meta.status, depth },
    ...node.children.flatMap(c => flatten(c, node.name, depth + 1))
  ];
}

// Find node and its parent
function findNode(tree: HierarchyNode, id: string): { node: HierarchyNode; parent: HierarchyNode | null } | null {
  if (tree.id === id) return { node: tree, parent: null };
  for (const child of tree.children) {
    if (child.id === id) return { node: child, parent: tree };
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

const allRows = flatten(MOCK_TREE);
const levelColors = ["var(--gc-gold)", "var(--gc-chart-2)", "var(--gc-chart-4)", "var(--gc-chart-3)", "var(--gc-text-secondary)", "var(--gc-text-muted)"];

export default function HCMSHierarchy() {
  const [view, setView] = useState<"tree" | "table">("tree");
  const [selected, setSelected] = useState<HierarchyNode | null>(null);
  const [viewAgent, setViewAgent] = useState<any | null>(null);

  const totalAgents = allRows.length;
  const avgContract = Math.round(allRows.reduce((s, r) => s + r.contractLevel, 0) / totalAgents);
  const totalAip = MOCK_TREE.totalAip;

  const tableCols: Column<any>[] = [
    { key: "name", label: "Agent", sortable: true, width: "20%", render: (v: string, row: any) => {
      const isLinked = !["owner", "mgr1"].includes(row.id);
      const indent = row.depth * 20;
      return (
        <div className="flex items-center" style={{ paddingLeft: indent }}>
          {row.depth > 0 && <span style={{ color: "var(--gc-border)", marginRight: 8 }}>└</span>}
          {isLinked
            ? <Link href={`/hcms/agents/${row.id}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span></Link>
            : <span style={{ fontWeight: 500 }}>{v}</span>}
        </div>
      );
    }},
    { key: "level", label: "Level", sortable: true, width: "8%", render: (v: number) => <span style={{ padding: "2px 8px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-sm)", color: levelColors[Math.min(v, 5)], backgroundColor: `color-mix(in srgb, ${levelColors[Math.min(v, 5)]} 15%, transparent)` }}>L{v}</span> },
    { key: "title", label: "Title", width: "14%" },
    { key: "contractLevel", label: "Contract", sortable: true, width: "9%", render: (v: number) => <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: "var(--gc-gold)" }}>{v}%</span> },
    { key: "overridePercentage", label: "Override", sortable: true, width: "8%", render: (v: number) => v > 0 ? <span style={{ color: "var(--gc-text-primary)" }}>{v}%</span> : <span style={{ color: "var(--gc-text-muted)" }}>—</span> },
    { key: "upline", label: "Upline", width: "14%" },
    { key: "carriers", label: "Carriers", sortable: true, width: "8%", align: "center", render: (v: number) => <span style={{ color: v > 0 ? "var(--gc-text-primary)" : "var(--gc-text-muted)" }}>{v}</span> },
    { key: "docs", label: "Docs", width: "8%", align: "center" },
    { key: "teamAip", label: "Team AIP", sortable: true, width: "10%", render: (v: number) => <span style={{ fontFamily: "var(--gc-font-display)" }}>{(v as number) >= 1000000 ? `$${((v as number) / 1000000).toFixed(1)}M` : `$${((v as number) / 1000).toFixed(0)}K`}</span> },
    { key: "id", label: "", width: "7%", align: "center", render: (_v: any, row: any) => {
      const isLinked = !["owner", "mgr1"].includes(row.id);
      return isLinked ? (
        <Link href={`/hcms/agents/${row.id}`}><span className="flex items-center gap-1" style={{ color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}><Eye className="w-3 h-3" /> View</span></Link>
      ) : null;
    }},
  ];

  // Get detail info for selected node
  const selectedMeta = selected ? AGENT_META[selected.id] : null;
  const selectedResult = selected ? findNode(MOCK_TREE, selected.id) : null;

  return (
    <div>
      <GCPageHeader title="Hierarchy" subtitle="Team structure, contract levels & carrier visibility across the organization" accentUnderline
        actions={<div className="flex gap-2">{(["tree", "table"] as const).map(v => <button key={v} onClick={() => setView(v)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", backgroundColor: view === v ? "var(--gc-gold)" : "var(--gc-surface)", color: view === v ? "var(--gc-btn-primary-text)" : "var(--gc-text-secondary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", cursor: "pointer", textTransform: "capitalize" as const }}>{v}</button>)}</div>} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Total in Hierarchy" value={totalAgents} accentTop />
        <GCKPICard label="Avg Contract Level" value={`${avgContract}%`} accentTop />
        <GCKPICard label="Total Agency AIP" value={`$${totalAip >= 1000000 ? (totalAip / 1000000).toFixed(1) + "M" : (totalAip / 1000).toFixed(0) + "K"}`} accentTop delta={{ value: "All downlines", positive: true }} />
        <GCKPICard label="Hierarchy Depth" value={`${Math.max(...allRows.map(r => r.level)) + 1} levels`} accentTop />
      </div>

      {view === "tree" ? (
        <div>
          {(() => { const { nodes: fn, edges: fe } = buildNodesEdges(MOCK_TREE as any); return <GCHierarchyFlow nodes={fn} edges={fe} height={550} />; })()}
        </div>
      ) : (
        <GCDataTable columns={tableCols} data={allRows} searchable searchPlaceholder="Search by name or title..." />
      )}
    </div>
  );
}
