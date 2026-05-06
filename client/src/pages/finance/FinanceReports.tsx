import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GCPageHeader, GCPeriodSelector } from "@/components/gc";
import { Download } from "lucide-react";
import { TOUR } from "@/lib/tour/selectors";

interface PnlRow {
  label: string;
  value: string;
}

interface CommissionRow {
  type: string;
  total: string;
  count: number;
}

interface AgentPerformance {
  topProducer: string;
  topRevenue: string;
  avgRevenue: string;
  activeAgents: number;
  retention: string;
}

interface ReportCard {
  title: string;
  rows: { label: string; value: string }[];
}

export default function FinanceReports() {
  const [period, setPeriod] = useState("this-month");

  const { data: pnl, isLoading: pnlLoading, error: pnlError } = useQuery<PnlRow[]>({
    queryKey: [`/api/finance/reports/pnl?period=${period}`],
  });

  const { data: commissions, isLoading: commissionsLoading, error: commissionsError } = useQuery<CommissionRow[]>({
    queryKey: [`/api/finance/reports/commissions?period=${period}`],
  });

  const { data: performance, isLoading: performanceLoading, error: performanceError } = useQuery<AgentPerformance>({
    queryKey: [`/api/finance/reports/agent-performance?period=${period}`],
  });

  const isLoading = pnlLoading || commissionsLoading || performanceLoading;
  const error = pnlError || commissionsError || performanceError;

  const handleExport = async () => {
    try {
      const resp = await fetch(`/api/finance/reports/export?period=${period}`, { credentials: "include" });
      if (!resp.ok) throw new Error(`Export failed: ${resp.status}`);
      const csv = await resp.text();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `finance-report-${period}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export report. Please try again.");
    }
  };

  // Transform API data into report cards
  const pnlRows: { label: string; value: string }[] = (pnl ?? []).map(r => ({ label: r.label, value: r.value }));

  const commissionRows: { label: string; value: string }[] = (commissions ?? []).map(r => ({
    label: r.type,
    value: r.total,
  }));

  const performanceRows: { label: string; value: string }[] = performance ? [
    { label: "Top Producer", value: performance.topProducer },
    { label: "Top Revenue", value: performance.topRevenue },
    { label: "Avg Agent Revenue", value: performance.avgRevenue },
    { label: "Active Agents", value: String(performance.activeAgents) },
    { label: "Retention", value: performance.retention },
  ] : [];

  const reports: ReportCard[] = [
    { title: "P&L Summary", rows: pnlRows },
    { title: "Commission Summary", rows: commissionRows },
    { title: "Agent Performance", rows: performanceRows },
  ];

  if (error) {
    return (
      <div>
        <GCPageHeader title="Reports" subtitle="Financial reports & exports" accentUnderline />
        <div style={{ padding: "var(--gc-space-8)", textAlign: "center", color: "var(--gc-status-terminated)", fontFamily: "var(--gc-font-body)" }}>
          Failed to load reports data. Please try again later.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <GCPageHeader title="Reports" subtitle="Financial reports & exports" accentUnderline
          actions={
            <>
              <GCPeriodSelector value={period} onChange={setPeriod} />
            </>
          }
        />
        <div style={{ padding: "var(--gc-space-8)", textAlign: "center", color: "var(--gc-text-muted)", fontFamily: "var(--gc-font-body)" }}>
          Loading reports...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div data-tour-id={TOUR.FINANCE.REPORTS.HEADER}>
        <GCPageHeader title="Reports" subtitle="Financial reports & exports" accentUnderline
          actions={
            <>
              <div data-tour-id={TOUR.FINANCE.REPORTS.PERIOD}><GCPeriodSelector value={period} onChange={setPeriod} /></div>
              <button data-tour-id={TOUR.FINANCE.REPORTS.EXPORT_BUTTON} onClick={handleExport} style={{
                display: "inline-flex", alignItems: "center", gap: "var(--gc-space-2)",
                padding: "var(--gc-space-2) var(--gc-space-4)",
                backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)",
                borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer",
                fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500,
              }}>
                <Download size={16} />
                Export All
              </button>
            </>
          }
        />
      </div>

      <div data-tour-id={TOUR.FINANCE.REPORTS.REPORT_CARDS} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {reports.map(card => (
          <div key={card.title} style={{
            backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)",
            borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)",
          }}>
            <div style={{
              fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)",
              letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const,
              color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-4)",
            }}>{card.title}</div>
            <div className="flex flex-col gap-3">
              {card.rows.map((row, i) => (
                <div key={row.label} className="flex justify-between" style={{
                  padding: "var(--gc-space-2) 0",
                  borderBottom: i < card.rows.length - 1
                    ? "1px solid var(--gc-border-subtle)"
                    : "2px solid var(--gc-gold)",
                }}>
                  <span style={{
                    fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)",
                    color: "var(--gc-text-secondary)",
                  }}>{row.label}</span>
                  <span style={{
                    fontFamily: "var(--gc-font-display)",
                    fontSize: i === card.rows.length - 1 ? "var(--gc-text-xl)" : "var(--gc-text-lg)",
                    fontWeight: 600,
                    color: i === card.rows.length - 1 ? "var(--gc-gold)" : "var(--gc-text-primary)",
                  }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
