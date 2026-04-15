import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCHierarchyTree, GCDataTable, GCStatusBadge, type HierarchyNode, type Column } from "@/components/gc";
import { Link } from "wouter";
import { Eye, X as XIcon, Users, Building2, FileText, ArrowDown } from "lucide-react";

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
  const [view, setView] = useState<"tree" | "table">("table");
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
        <div className="flex gap-6">
          <div className="flex-1 overflow-auto">
            <GCHierarchyTree data={MOCK_TREE} onNodeClick={setSelected} selectedNodeId={selected?.id} />
          </div>

          {/* Detail Panel */}
          {selected && selectedMeta && (
            <div style={{ width: 300, padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", flexShrink: 0, alignSelf: "flex-start" }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)" }}>{selected.name}</div>
                  <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{selected.title}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ color: "var(--gc-text-muted)", background: "none", border: "none", cursor: "pointer" }}><XIcon className="w-4 h-4" /></button>
              </div>

              <GCStatusBadge status={selectedMeta.status} />

              {/* Key Metrics */}
              <div className="flex flex-col gap-0 mt-4">
                {[
                  ["Contract Level", `${selected.contractLevel}%`, true],
                  ["Override Spread", selected.overridePercentage > 0 ? `${selected.overridePercentage}%` : "None", selected.overridePercentage > 0],
                  ["Team AIP", `${selected.totalAip >= 1000000 ? "$" + (selected.totalAip / 1000000).toFixed(1) + "M" : "$" + (selected.totalAip / 1000).toFixed(0) + "K"}`, false],
                  ["Carriers", `${selectedMeta.carriers}`, false],
                  ["Documents", selectedMeta.docs, false],
                ].map(([label, val, gold], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "var(--gc-space-2) 0", borderBottom: "1px solid var(--gc-border-subtle)" }}>
                    <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>{label}</span>
                    <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-sm)", fontWeight: 600, color: gold ? "var(--gc-gold)" : "var(--gc-text-primary)" }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Upline */}
              {selectedResult?.parent && (
                <div className="mt-4">
                  <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)" }}>Reports To</div>
                  <div className="flex items-center gap-2" style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)" }}>
                    <Users className="w-3.5 h-3.5" style={{ color: "var(--gc-gold)" }} />
                    <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)", fontWeight: 500 }}>{selectedResult.parent.name}</span>
                    <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{selectedResult.parent.contractLevel}%</span>
                  </div>
                </div>
              )}

              {/* Direct Reports */}
              {selected.children.length > 0 && (
                <div className="mt-4">
                  <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)" }}>Direct Reports ({selected.children.length})</div>
                  <div className="flex flex-col gap-1">
                    {selected.children.map(child => {
                      const childMeta = AGENT_META[child.id];
                      const spread = selected.contractLevel - child.contractLevel;
                      return (
                        <div key={child.id} className="flex items-center justify-between" style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", cursor: "pointer" }} onClick={() => setSelected(child)}>
                          <div>
                            <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)", fontWeight: 500 }}>{child.name}</span>
                            <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginLeft: 8 }}>{child.contractLevel}%</span>
                          </div>
                          {spread > 0 && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-gold)", fontWeight: 500 }}>+{spread}% spread</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Override Spread Visualization */}
              {selected.overridePercentage > 0 && selectedResult?.parent && (
                <div className="mt-4" style={{ padding: "var(--gc-space-3)", backgroundColor: "color-mix(in srgb, var(--gc-gold) 8%, transparent)", borderRadius: "var(--gc-radius-sm)", border: "1px solid color-mix(in srgb, var(--gc-gold) 20%, transparent)" }}>
                  <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-2)" }}>Override Earned</div>
                  <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", lineHeight: 1.5 }}>
                    Earns <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: "var(--gc-gold)" }}>{selected.overridePercentage}%</span> spread on direct downline production
                    <span style={{ display: "block", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginTop: 4 }}>({selected.contractLevel}% − next level below)</span>
                  </div>
                </div>
              )}

              {/* Link to agent detail */}
              {!["owner", "mgr1"].includes(selected.id) && (
                <Link href={`/hcms/agents/${selected.id}`}>
                  <div className="mt-4 flex items-center justify-center gap-2" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", fontWeight: 500 }}>
                    <Eye className="w-3.5 h-3.5" /> View Full Profile
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <GCDataTable columns={tableCols} data={allRows} searchable searchPlaceholder="Search by name or title..." />
      )}
    </div>
  );
}
