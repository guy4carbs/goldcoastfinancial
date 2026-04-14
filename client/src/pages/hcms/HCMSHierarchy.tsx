import { useState } from "react";
import { GCPageHeader, GCKPICard, GCHierarchyTree, GCDataTable, type HierarchyNode, type Column } from "@/components/gc";
const MOCK_TREE: HierarchyNode = {
  id: "owner", name: "Gaetano", title: "Agency Owner", level: 0, contractLevel: 120, overridePercentage: 0, totalAip: 1243500,
  children: [
    { id: "dir1", name: "Jack Cook", title: "Diamond Director", level: 1, contractLevel: 100, overridePercentage: 20, totalAip: 620000, children: [
      { id: "mgr1", name: "Nicholas Gallagher", title: "Regional Manager", level: 2, contractLevel: 90, overridePercentage: 10, totalAip: 380000, children: [
        { id: "agt1", name: "Sarah Mitchell", title: "Senior Agent", level: 3, contractLevel: 85, overridePercentage: 5, totalAip: 245000, children: [] },
        { id: "agt2", name: "Emily Watson", title: "Agent", level: 4, contractLevel: 80, overridePercentage: 0, totalAip: 152000, children: [] },
      ]},
      { id: "mgr2", name: "David Park", title: "Team Lead", level: 3, contractLevel: 83, overridePercentage: 3, totalAip: 240000, children: [
        { id: "agt3", name: "James Rodriguez", title: "Agent", level: 4, contractLevel: 80, overridePercentage: 0, totalAip: 176000, children: [] },
      ]},
    ]},
    { id: "dir2", name: "Michael Chen", title: "Platinum Director", level: 1, contractLevel: 95, overridePercentage: 15, totalAip: 523500, children: [
      { id: "agt4", name: "Lisa Thompson", title: "Agent", level: 4, contractLevel: 80, overridePercentage: 0, totalAip: 134000, children: [] },
    ]},
  ],
};
export default function HCMSHierarchy() {
  const [view, setView] = useState<"tree"|"table">("tree");
  const [selected, setSelected] = useState<HierarchyNode | null>(null);
  return (
    <div>
      <GCPageHeader title="Hierarchy" subtitle="Organization structure & override levels" accentUnderline
        actions={<div className="flex gap-2">{(["tree","table"] as const).map(v => <button key={v} onClick={() => setView(v)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", borderRadius: "2px", border: "1px solid var(--gc-border)", backgroundColor: view === v ? "var(--gc-gold)" : "var(--gc-surface)", color: view === v ? "var(--gc-btn-primary-text)" : "var(--gc-text-secondary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", cursor: "pointer", textTransform: "capitalize" as const }}>{v}</button>)}</div>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Total Agents" value={8} accentTop />
        <GCKPICard label="Avg Contract Level" value="88%" accentTop />
        <GCKPICard label="Override Pool" value="$178K" accentTop />
        <GCKPICard label="Hierarchy Depth" value={5} accentTop />
      </div>
      {view === "tree" ? (
        <div className="flex gap-6">
          <div className="flex-1 overflow-auto"><GCHierarchyTree data={MOCK_TREE} onNodeClick={setSelected} selectedNodeId={selected?.id} /></div>
          {selected && (
            <div style={{ width: 280, padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "0px", flexShrink: 0 }}>
              <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>{selected.name}</div>
              <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-4)" }}>{selected.title}</div>
              {[["Contract Level", `${selected.contractLevel}%`], ["Override", `${selected.overridePercentage}%`], ["Team AIP", `$${(selected.totalAip/1000).toFixed(0)}K`]].map(([l,v],i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "var(--gc-space-2) 0", borderBottom: "1px solid var(--gc-border-subtle)" }}>
                  <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-muted)" }}>{l}</span>
                  <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-base)", color: "var(--gc-gold)" }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : <div style={{ color: "var(--gc-text-muted)", fontFamily: "var(--gc-font-body)", padding: "var(--gc-space-8)", textAlign: "center" }}>Table view — coming soon</div>}
    </div>
  );
}
