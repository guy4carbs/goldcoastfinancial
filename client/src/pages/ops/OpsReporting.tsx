import { useState, useMemo } from "react";
import { GCPageHeader, GCDataTable, type Column } from "@/components/gc";
import { FileText, Clock, Play, ChevronDown, ChevronUp, Download } from "lucide-react";

const REPORTS = [
  { id: "1", name: "Monthly Production Summary", desc: "AIP and policy count by carrier", lastRun: "2026-04-13", createdBy: "Jack Cook", scheduled: true, frequency: "Monthly" },
  { id: "2", name: "Agent Commission Statement", desc: "Per-agent commission breakdown with overrides", lastRun: "2026-04-01", createdBy: "Gaetano", scheduled: true, frequency: "Monthly" },
  { id: "3", name: "Compliance Status Report", desc: "All open compliance flags with severity", lastRun: "2026-04-10", createdBy: "Nicholas Gallagher", scheduled: false, frequency: null },
  { id: "4", name: "Pipeline Conversion Analysis", desc: "Lead-to-placed conversion rates by source", lastRun: "2026-04-07", createdBy: "Jack Cook", scheduled: false, frequency: null },
  { id: "5", name: "Carrier Diversification Report", desc: "AIP distribution across carrier partners", lastRun: "2026-04-05", createdBy: "Gaetano", scheduled: true, frequency: "Quarterly" },
  { id: "6", name: "Agent Retention Analysis", desc: "Tenure, churn rate, and retention by cohort", lastRun: "2026-03-31", createdBy: "Jack Cook", scheduled: true, frequency: "Quarterly" },
];

const METRICS = ["AIP", "Annual Premium", "Policy Count", "Commissions", "Leads", "Conversion Rate", "Agent Count", "Chargebacks"];
const GROUP_BY = ["Agent", "Carrier", "State", "Product Type", "Month"];

const PREVIEW_DATA = [
  { agent: "Sarah Mitchell", aip: "$245K", policies: 28, commissions: "$196K", rate: "80%" },
  { agent: "Michael Chen", aip: "$198K", policies: 22, commissions: "$168K", rate: "85%" },
  { agent: "James Rodriguez", aip: "$176K", policies: 19, commissions: "$144K", rate: "82%" },
  { agent: "Emily Watson", aip: "$152K", policies: 17, commissions: "$122K", rate: "80%" },
  { agent: "David Park", aip: "$134K", policies: 15, commissions: "$111K", rate: "83%" },
];

const previewCols: Column<typeof PREVIEW_DATA[0]>[] = [
  { key: "agent", label: "Agent", sortable: true },
  { key: "aip", label: "AIP", sortable: true },
  { key: "policies", label: "Policies", sortable: true },
  { key: "commissions", label: "Commissions", sortable: true },
  { key: "rate", label: "Rate", sortable: true },
];

export default function OpsReporting() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["AIP", "Policy Count", "Commissions"]);
  const [groupBy, setGroupBy] = useState("Agent");
  const [dateFrom, setDateFrom] = useState("2026-01-01");
  const [dateTo, setDateTo] = useState("2026-04-14");
  const [showPreview, setShowPreview] = useState(false);
  const [runningReport, setRunningReport] = useState<string | null>(null);

  const toggleMetric = (m: string) => setSelectedMetrics(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  const handleRun = (id: string) => {
    setRunningReport(id);
    setTimeout(() => setRunningReport(null), 1500);
  };

  const handleExport = () => {
    const csv = "Agent,AIP,Policies,Commissions,Rate\n" + PREVIEW_DATA.map(r => `${r.agent},${r.aip},${r.policies},${r.commissions},${r.rate}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const inputStyle = { padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-md)" };

  return (
    <div>
      <GCPageHeader title="Reporting" subtitle="Custom reports & data exports" accentUnderline
        actions={<div className="flex gap-2">
          <button onClick={() => setShowBuilder(b => !b)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500 }}>New Report</button>
          <button onClick={handleExport} className="flex items-center gap-1" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)" }}><Download className="w-3.5 h-3.5" /> Export CSV</button>
        </div>} />

      {/* Report Builder */}
      {showBuilder && (
        <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)", marginBottom: "var(--gc-space-6)" }}>
          <div className="flex items-center justify-between mb-4">
            <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)" }}>Report Builder</span>
            <button onClick={() => setShowBuilder(false)} style={{ color: "var(--gc-text-muted)", background: "none", border: "none", cursor: "pointer" }}><ChevronUp className="w-5 h-5" /></button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-3)" }}>Metrics</div>
              <div className="flex flex-wrap gap-2">
                {METRICS.map(m => (
                  <button key={m} onClick={() => toggleMetric(m)} style={{ padding: "var(--gc-space-1) var(--gc-space-3)", borderRadius: "var(--gc-radius-sm)", border: "1px solid", borderColor: selectedMetrics.includes(m) ? "var(--gc-gold)" : "var(--gc-border)", backgroundColor: selectedMetrics.includes(m) ? `color-mix(in srgb, var(--gc-gold) 15%, transparent)` : "var(--gc-surface-2)", color: selectedMetrics.includes(m) ? "var(--gc-gold)" : "var(--gc-text-secondary)", fontSize: "var(--gc-text-sm)", cursor: "pointer", transition: "all var(--gc-transition-fast)" }}>{m}</button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-3)" }}>Group By</div>
              <select value={groupBy} onChange={e => setGroupBy(e.target.value)} style={inputStyle}>
                {GROUP_BY.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-3)" }}>Date Range</div>
              <div className="flex gap-2">
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setShowPreview(true)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontWeight: 500 }}>Generate Report</button>
            <button onClick={() => { setShowPreview(false); setSelectedMetrics([]); }} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer" }}>Clear</button>
          </div>

          {showPreview && (
            <div className="mt-6">
              <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-3)" }}>Preview — Grouped by {groupBy} ({dateFrom} to {dateTo})</div>
              <GCDataTable columns={previewCols} data={PREVIEW_DATA} searchable />
            </div>
          )}
        </div>
      )}

      {/* Saved Reports */}
      <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Saved Reports</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORTS.map(r => (
          <div key={r.id} style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
                <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-primary)" }}>{r.name}</span>
              </div>
              <div className="flex gap-1">
                {r.scheduled && <span style={{ padding: "2px 6px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-xs)", color: "var(--gc-gold)", backgroundColor: `color-mix(in srgb, var(--gc-gold) 15%, transparent)` }}>{r.frequency}</span>}
              </div>
            </div>
            <p style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-3)" }}>{r.desc}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1" style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}><Clock className="w-3 h-3" /> {r.lastRun}</span>
                <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>by {r.createdBy}</span>
              </div>
              <button onClick={() => handleRun(r.id)} disabled={runningReport === r.id} className="flex items-center gap-1" style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "var(--gc-gold)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", fontWeight: 500, opacity: runningReport === r.id ? 0.6 : 1 }}>
                <Play className="w-3 h-3" /> {runningReport === r.id ? "Running..." : "Run"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
