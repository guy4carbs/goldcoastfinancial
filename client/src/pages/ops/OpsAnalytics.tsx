import { GCPageHeader, GCKPICard, GCAreaChart, GCDataTable, type Column } from "@/components/gc";
const TRENDS = [{ label: "May", value: 82000, value2: 57000 }, { label: "Jun", value: 95000, value2: 65000 }, { label: "Jul", value: 88000, value2: 61000 }, { label: "Aug", value: 110000, value2: 71000 }, { label: "Sep", value: 98000, value2: 67000 }, { label: "Oct", value: 105000, value2: 72000 }, { label: "Nov", value: 115000, value2: 78000 }, { label: "Dec", value: 92000, value2: 64000 }, { label: "Jan", value: 125000, value2: 85000 }, { label: "Feb", value: 118000, value2: 80000 }, { label: "Mar", value: 135000, value2: 91000 }, { label: "Apr", value: 142000, value2: 96000 }];
const PERF = [
  { name: "Sarah Mitchell", deals: 28, policies: 24, ap: 245000, commission: 196000, flags: 0, score: 95 },
  { name: "Michael Chen", deals: 22, policies: 19, ap: 198000, commission: 168000, flags: 0, score: 88 },
  { name: "James Rodriguez", deals: 19, policies: 15, ap: 176000, commission: 144000, flags: 2, score: 72 },
  { name: "Emily Watson", deals: 17, policies: 15, ap: 152000, commission: 121600, flags: 1, score: 78 },
  { name: "David Park", deals: 15, policies: 12, ap: 134000, commission: 111000, flags: 1, score: 74 },
];
const scoreColor = (s: number) => s >= 80 ? "var(--gc-status-active)" : s >= 60 ? "var(--gc-gold)" : "var(--gc-status-terminated)";
const cols: Column<typeof PERF[0]>[] = [
  { key: "name", label: "Agent", sortable: true },
  { key: "deals", label: "Deals", sortable: true },
  { key: "ap", label: "AP", sortable: true, render: (v) => `$${(v/1000).toFixed(0)}K` },
  { key: "commission", label: "Commission", sortable: true, render: (v) => `$${(v/1000).toFixed(0)}K` },
  { key: "flags", label: "Flags", sortable: true },
  { key: "score", label: "Score", sortable: true, render: (v) => <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: scoreColor(v) }}>{v}</span> },
];
export default function OpsAnalytics() {
  return (
    <div>
      <GCPageHeader title="Analytics" subtitle="Cross-module intelligence & performance metrics" accentUnderline />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <GCKPICard label="Active Agents" value={34} accentTop />
        <GCKPICard label="Monthly AIP" value="$142K" accentTop delta={{ value: "+12%", positive: true }} />
        <GCKPICard label="Pipeline Value" value="$245K" accentTop />
        <GCKPICard label="Conversion Rate" value="23%" accentTop delta={{ value: "+2%", positive: true }} />
        <GCKPICard label="Commission Payout" value="$591K" accentTop />
        <GCKPICard label="Compliance Score" value="92%" accentTop />
      </div>
      <div className="mb-6"><GCAreaChart data={TRENDS} title="Multi-Metric Trends (AIP vs Commissions)" keys={["AIP", "Commissions"]} valueFormatter={v => `$${(v/1000).toFixed(0)}K`} /></div>
      <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Agent Performance Matrix</div>
      <GCDataTable columns={cols} data={PERF} searchable />
    </div>
  );
}
