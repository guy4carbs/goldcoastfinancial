import { useState } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCBarChart, GCAreaChart, GCPeriodSelector, type Column } from "@/components/gc";

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

const FUNNEL = [
  { stage: "New", count: 78 },
  { stage: "Contacted", count: 62 },
  { stage: "Qualified", count: 45 },
  { stage: "Quoted", count: 32 },
  { stage: "Application", count: 22 },
  { stage: "Placed", count: 18 },
];

const ROI_DATA = [
  { name: "Referral", value: 450 },
  { name: "Web Form", value: 320 },
  { name: "Email", value: 280 },
  { name: "Phone", value: 180 },
  { name: "Social Media", value: 140 },
  { name: "Paid Ads", value: 95 },
];

const CPL_TREND = [
  { label: "Nov", value: 58 },
  { label: "Dec", value: 52 },
  { label: "Jan", value: 48 },
  { label: "Feb", value: 45 },
  { label: "Mar", value: 44 },
  { label: "Apr", value: 42 },
];

const CHANNELS = [
  { channel: "Referral", leads: 18, conversions: 7, convRate: 38.9, cpa: 214, revenue: 31500, roi: 450 },
  { channel: "Web Form", leads: 28, conversions: 8, convRate: 28.6, cpa: 160, revenue: 25600, roi: 320 },
  { channel: "Email", leads: 14, conversions: 4, convRate: 28.6, cpa: 75, revenue: 12400, roi: 280 },
  { channel: "Phone", leads: 12, conversions: 4, convRate: 33.3, cpa: 210, revenue: 11200, roi: 180 },
  { channel: "Social Media", leads: 10, conversions: 2, convRate: 20.0, cpa: 290, revenue: 4200, roi: 140 },
  { channel: "Paid Ads", leads: 6, conversions: 1, convRate: 16.7, cpa: 320, revenue: 3800, roi: 95 },
];

const roiColor = (r: number) => r >= 200 ? "var(--gc-status-active)" : r >= 100 ? "var(--gc-gold)" : "var(--gc-status-terminated)";

const channelCols: Column<typeof CHANNELS[0]>[] = [
  { key: "channel", label: "Channel", sortable: true },
  { key: "leads", label: "Leads", sortable: true },
  { key: "conversions", label: "Conversions", sortable: true },
  { key: "convRate", label: "Conv Rate", sortable: true, render: (v) => `${v}%` },
  { key: "cpa", label: "CPA ($)", sortable: true, render: (v) => `$${v.toLocaleString()}` },
  { key: "revenue", label: "Revenue ($)", sortable: true, render: (v) => `$${v.toLocaleString()}` },
  { key: "roi", label: "ROI (%)", sortable: true, render: (v) => <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: roiColor(v) }}>{v}%</span> },
];

export default function MarketingAnalytics() {
  const [period, setPeriod] = useState("this-month");
  const maxCount = Math.max(...FUNNEL.map(f => f.count));

  const handleExport = () => {
    const headers = ["Channel", "Leads", "Conversions", "Conv Rate (%)", "CPA ($)", "Revenue ($)", "ROI (%)"];
    const rows = CHANNELS.map(c => [c.channel, c.leads, c.conversions, c.convRate, c.cpa, c.revenue, c.roi]);
    downloadCSV("marketing-analytics.csv", headers, rows as (string | number)[][]);
  };

  return (
    <div>
      <GCPageHeader title="Analytics" subtitle="Conversion funnels, ROI analysis & trends" accentUnderline
        actions={
          <>
            <GCPeriodSelector value={period} onChange={setPeriod} />
            <button onClick={handleExport} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", fontWeight: 500 }}>Export Report</button>
          </>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Overall Conv Rate" value="23%" accentTop />
        <GCKPICard label="Best Channel" value="Referral" accentTop delta={{ value: "38.9%", positive: true }} />
        <GCKPICard label="Cost Per Acquisition" value="$183" accentTop />
        <GCKPICard label="LTV Estimate" value="$2,840" accentTop />
      </div>

      <div style={{ marginBottom: "var(--gc-space-6)" }}>
        <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Conversion Funnel</div>
        <div className="flex flex-col gap-2">
          {FUNNEL.map((f, i) => {
            const dropoff = i > 0 ? Math.round((1 - f.count / FUNNEL[i-1].count) * 100) : 0;
            return (
              <div key={f.stage} className="flex items-center gap-4">
                <span style={{ width: 100, fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)", textAlign: "right" }}>{f.stage}</span>
                <div style={{ flex: 1, height: 36, backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)", position: "relative" }}>
                  <div style={{ height: "100%", width: `${(f.count / maxCount) * 100}%`, background: `linear-gradient(90deg, var(--gc-gold), var(--gc-gold-bright))`, borderRadius: "var(--gc-radius-md)", transition: "width var(--gc-transition-normal)", display: "flex", alignItems: "center", paddingLeft: "var(--gc-space-3)" }}>
                    <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-md)", fontWeight: 600, color: "var(--gc-btn-primary-text)" }}>{f.count}</span>
                  </div>
                </div>
                {i > 0 ? (
                  <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)", width: 90, whiteSpace: "nowrap" }}>
                    {Math.round((f.count / FUNNEL[i-1].count) * 100)}% <span style={{ color: "var(--gc-status-terminated)" }}>(-{dropoff}%)</span>
                  </span>
                ) : (
                  <span style={{ width: 90 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GCBarChart data={ROI_DATA} title="ROI by Channel" valueFormatter={(v) => `${v}%`} />
        <GCAreaChart data={CPL_TREND} title="Cost Per Lead Trend" valueFormatter={(v) => `$${v}`} />
      </div>

      <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Channel Performance</div>
      <GCDataTable columns={channelCols} data={CHANNELS} searchable />
    </div>
  );
}
