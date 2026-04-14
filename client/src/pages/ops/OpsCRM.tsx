import { useState, useMemo, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { GCPageHeader, GCKPICard, GCStatusBadge } from "@/components/gc";
const STAGES = [
  { id: "new", label: "NEW", color: "var(--gc-text-muted)" },
  { id: "contacted", label: "CONTACTED", color: "var(--gc-chart-4)" },
  { id: "qualified", label: "QUALIFIED", color: "var(--gc-gold)" },
  { id: "quoted", label: "QUOTED", color: "var(--gc-chart-2)" },
  { id: "application", label: "APPLICATION", color: "var(--gc-chart-3)" },
  { id: "placed", label: "PLACED", color: "var(--gc-status-active)" },
];
const MOCK = [
  { id: "1", name: "Robert Johnson", source: "web_form", stage: "new", value: 2500, score: 85, tier: "hot" },
  { id: "2", name: "Amanda Torres", source: "referral", stage: "contacted", value: 5000, score: 72, tier: "warm" },
  { id: "3", name: "William Brown", source: "phone", stage: "qualified", value: 3200, score: 68, tier: "warm" },
  { id: "4", name: "Jessica Davis", source: "web_form", stage: "quoted", value: 8000, score: 90, tier: "hot" },
  { id: "5", name: "Christopher Lee", source: "social_media", stage: "application", value: 4500, score: 55, tier: "warm" },
  { id: "6", name: "Maria Gonzalez", source: "referral", stage: "placed", value: 6000, score: 95, tier: "on_fire" },
  { id: "7", name: "Daniel Kim", source: "web_form", stage: "new", value: 1800, score: 42, tier: "cold" },
];
const tierDot: Record<string, string> = { on_fire: "var(--gc-status-terminated)", hot: "var(--gc-status-warning)", warm: "var(--gc-gold)", cold: "var(--gc-text-muted)" };
const srcColor: Record<string, string> = { web_form: "var(--gc-chart-4)", referral: "var(--gc-gold)", phone: "var(--gc-chart-3)", social_media: "var(--gc-chart-2)" };
export default function OpsCRM() {
  const [leads, setLeads] = useState(MOCK);
  const groups = useMemo(() => { const g: Record<string, typeof MOCK> = {}; STAGES.forEach(s => g[s.id] = []); leads.forEach(l => { if (g[l.stage]) g[l.stage].push(l); }); return g; }, [leads]);
  const onDragEnd = useCallback((r: DropResult) => { if (!r.destination || r.source.droppableId === r.destination.droppableId) return; setLeads(p => p.map(l => l.id === r.draggableId ? { ...l, stage: r.destination!.droppableId } : l)); }, []);
  const totalValue = leads.reduce((s, l) => s + l.value, 0);
  return (
    <div>
      <GCPageHeader title="Sales Pipeline" subtitle="Lead management & conversion tracking" accentUnderline
        actions={<button style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "2px", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500 }}>Add Lead</button>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Total Leads" value={leads.length} accentTop />
        <GCKPICard label="Pipeline Value" value={`$${(totalValue/1000).toFixed(0)}K`} accentTop />
        <GCKPICard label="Conversion Rate" value="23%" accentTop delta={{ value: "+2%", positive: true }} />
        <GCKPICard label="Stale Leads" value={1} accentTop />
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {STAGES.map(stage => (
            <div key={stage.id} style={{ backgroundColor: "var(--gc-surface-2)", borderRadius: "0px", border: "1px solid var(--gc-border-subtle)" }}>
              <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: "1px solid var(--gc-border-subtle)" }}>
                <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-secondary)" }}>{stage.label}</span>
                <span style={{ fontSize: "var(--gc-text-xs)", fontWeight: 600, color: stage.color, backgroundColor: `color-mix(in srgb, ${stage.color} 15%, transparent)`, padding: "1px 6px", borderRadius: "2px" }}>{groups[stage.id]?.length || 0}</span>
              </div>
              <Droppable droppableId={stage.id}>
                {(prov) => (
                  <div ref={prov.innerRef} {...prov.droppableProps} className="p-2 min-h-[150px] flex flex-col gap-2">
                    {(groups[stage.id] || []).map((lead, i) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={i}>
                        {(p) => (
                          <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} style={{ ...p.draggableProps.style, padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border-subtle)", borderRadius: "0px" }}>
                            <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, color: "var(--gc-text-primary)", marginBottom: 4 }}>{lead.name}</div>
                            <div className="flex items-center gap-2 mb-2">
                              <span style={{ padding: "1px 6px", borderRadius: "2px", fontSize: "var(--gc-text-xs)", color: srcColor[lead.source] || "var(--gc-text-muted)", backgroundColor: `color-mix(in srgb, ${srcColor[lead.source] || "var(--gc-text-muted)"} 15%, transparent)` }}>{lead.source.replace(/_/g, " ")}</span>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: tierDot[lead.tier] || "var(--gc-text-muted)" }} />
                            </div>
                            <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-md)", color: "var(--gc-gold)" }}>${lead.value.toLocaleString()}</div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {prov.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
