import { GCPageHeader } from "@/components/gc";
import { FileText, Clock, Play } from "lucide-react";
const REPORTS = [
  { name: "Monthly Production Summary", desc: "AIP and policy count by carrier", lastRun: "2026-04-13", scheduled: true },
  { name: "Agent Commission Statement", desc: "Per-agent commission breakdown", lastRun: "2026-04-01", scheduled: true },
  { name: "Compliance Status Report", desc: "All open compliance flags", lastRun: "2026-04-10", scheduled: false },
  { name: "Pipeline Conversion Analysis", desc: "Lead-to-placed conversion rates", lastRun: "2026-04-07", scheduled: false },
];
export default function OpsReporting() {
  return (
    <div>
      <GCPageHeader title="Reporting" subtitle="Custom reports & data exports" accentUnderline
        actions={<div className="flex gap-2">
          <button style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "2px", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500 }}>New Report</button>
          <button style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "2px", border: "1px solid var(--gc-border)", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)" }}>Export CSV</button>
        </div>} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORTS.map(r => (
          <div key={r.name} style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "0px" }}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
                <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-primary)" }}>{r.name}</span>
              </div>
              {r.scheduled && <span style={{ padding: "2px 6px", borderRadius: "2px", fontSize: "var(--gc-text-xs)", color: "var(--gc-gold)", backgroundColor: `color-mix(in srgb, var(--gc-gold) 15%, transparent)` }}>Scheduled</span>}
            </div>
            <p style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-3)" }}>{r.desc}</p>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1" style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}><Clock className="w-3 h-3" /> Last: {r.lastRun}</span>
              <button style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "var(--gc-gold)", color: "var(--gc-btn-primary-text)", borderRadius: "2px", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", display: "flex", alignItems: "center", gap: 4 }}><Play className="w-3 h-3" /> Run</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
