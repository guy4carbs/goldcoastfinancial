import { useMemo, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { GCPipelineCard, type PipelineAgent } from "./GCPipelineCard";

const columns = [
  { id: "pending_review", label: "PENDING", color: "var(--gc-status-pending)" },
  { id: "in_review", label: "IN REVIEW", color: "var(--gc-status-review)" },
  { id: "approved", label: "ACTIVE", color: "var(--gc-status-active)" },
  { id: "rejected", label: "TERMINATED", color: "var(--gc-status-terminated)" },
];

export interface GCPipelineBoardProps { agents: PipelineAgent[]; onStageChange?: (agentId: string, newStage: string) => void; }

export function GCPipelineBoard({ agents, onStageChange }: GCPipelineBoardProps) {
  const groups = useMemo(() => {
    const g: Record<string, PipelineAgent[]> = {};
    columns.forEach(c => { g[c.id] = []; });
    agents.forEach(a => { const key = a.approvalStatus === "active" ? "approved" : a.approvalStatus === "terminated" ? "rejected" : a.approvalStatus; if (g[key]) g[key].push(a); else if (g["pending_review"]) g["pending_review"].push(a); });
    return g;
  }, [agents]);

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination || result.source.droppableId === result.destination.droppableId) return;
    onStageChange?.(result.draggableId, result.destination.droppableId);
  }, [onStageChange]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(col => (
          <div key={col.id} style={{ backgroundColor: "var(--gc-surface-2)", borderRadius: "0px", border: "1px solid var(--gc-border-subtle)" }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--gc-border-subtle)" }}>
              <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", fontWeight: 500, letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-secondary)" }}>{col.label}</span>
              <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", fontWeight: 600, color: col.color, backgroundColor: `color-mix(in srgb, ${col.color} 15%, transparent)`, padding: "2px 6px", borderRadius: "2px" }}>{groups[col.id]?.length || 0}</span>
            </div>
            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="p-2 min-h-[200px] flex flex-col gap-2"
                  style={{ backgroundColor: snapshot.isDraggingOver ? "var(--gc-hover-overlay)" : "transparent", transition: "background-color var(--gc-transition-fast)" }}>
                  {(groups[col.id] || []).map((agent, i) => (
                    <Draggable key={agent.id} draggableId={agent.id} index={i}>
                      {(prov, snap) => (
                        <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} style={{ ...prov.draggableProps.style, opacity: snap.isDragging ? 0.8 : 1 }}>
                          <GCPipelineCard agent={agent} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {(!groups[col.id] || groups[col.id].length === 0) && (
                    <div className="flex items-center justify-center py-8" style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-muted)" }}>No agents</div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
