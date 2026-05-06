import { useState } from "react";
import { GCPageHeader, GCDataTable, GCStatusBadge, GCPeriodSelector, INVESTOR_PERIODS, type Column } from "@/components/gc";

function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const FINANCIALS = [
  { label: "Total Commission Revenue", value: 743000 },
  { label: "Total Override Payouts", value: 178000 },
  { label: "Net Revenue", value: 565000 },
  { label: "Projected Annual", value: 2260000 },
];

const REPORT_HISTORY = [
  { report: "Quarterly Investor Report", period: "Q4 2025", generated: "2026-01-15", status: "approved" },
  { report: "Quarterly Investor Report", period: "Q3 2025", generated: "2025-10-12", status: "approved" },
  { report: "Quarterly Investor Report", period: "Q2 2025", generated: "2025-07-14", status: "approved" },
  { report: "Quarterly Investor Report", period: "Q1 2025", generated: "2025-04-11", status: "approved" },
];

const columns: Column<typeof REPORT_HISTORY[number]>[] = [
  { key: "report", label: "Report", sortable: true },
  { key: "period", label: "Period" },
  { key: "generated", label: "Generated" },
  { key: "status", label: "Status", render: (v: string) => <GCStatusBadge status={v} /> },
];

export default function InvestorsReports() {
  const [period, setPeriod] = useState("ytd");

  const handleExportAll = () => {
    const headers = ["Metric", "Value"];
    const rows: (string | number)[][] = FINANCIALS.map(f => [f.label, `$${(f.value / 1000).toFixed(0)}K`]);
    rows.push([]);
    rows.push(["Report History", ""]);
    REPORT_HISTORY.forEach(r => rows.push([`${r.report} - ${r.period}`, `Generated: ${r.generated}`]));
    downloadCSV("investor-summary.csv", headers, rows);
  };

  const handleDownloadQ1 = () => {
    downloadCSV("q1-2026-report.csv", ["Metric", "Value"], [
      ["Agents", "34"], ["AIP", "$1.24M"], ["Retention", "89%"], ["Net Revenue", "$565K"],
    ]);
  };

  return (
    <div>
      <GCPageHeader title="Reports" subtitle="Investor reporting & exports" accentUnderline
        actions={
          <>
            <GCPeriodSelector value={period} onChange={setPeriod} options={INVESTOR_PERIODS} />
            <button onClick={handleExportAll} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", fontWeight: 500 }}>
              Export CSV
            </button>
          </>
        }
      />

      {/* Quarterly report preview */}
      <div className="mb-6" style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)" }}>
        <div className="flex items-center justify-between mb-4">
          <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", fontWeight: 600, color: "var(--gc-text-primary)" }}>Q1 2026 Report</div>
          <button onClick={handleDownloadQ1} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500 }}>
            Download CSV
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Agents", value: "34" },
            { label: "AIP", value: "$1.24M" },
            { label: "Retention", value: "89%" },
            { label: "Net Revenue", value: "$565K" },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: "center", padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)" }}>
              <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-1)" }}>{stat.label}</div>
              <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", fontWeight: 600, color: "var(--gc-gold)" }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial summary */}
      <div className="mb-6" style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)" }}>
        <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-4)" }}>Financial Summary</div>
        <div className="flex flex-col gap-3">
          {FINANCIALS.map((f, i) => (
            <div key={f.label} className="flex justify-between" style={{ padding: "var(--gc-space-2) 0", borderBottom: i < FINANCIALS.length - 1 ? "1px solid var(--gc-border-subtle)" : "2px solid var(--gc-gold)" }}>
              <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)" }}>{f.label}</span>
              <span style={{ fontFamily: "var(--gc-font-display)", fontSize: i === FINANCIALS.length - 1 ? "var(--gc-text-xl)" : "var(--gc-text-lg)", fontWeight: 600, color: i === FINANCIALS.length - 1 ? "var(--gc-gold)" : "var(--gc-text-primary)" }}>${(f.value / 1000).toFixed(0)}K</span>
            </div>
          ))}
        </div>
      </div>

      {/* Report history */}
      <div>
        <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-3)" }}>Report History</div>
        <GCDataTable columns={columns} data={REPORT_HISTORY} />
      </div>
    </div>
  );
}
