import { GCPageHeader, GCKPICard, GCBarChart, GCAreaChart, GCDataTable, type Column } from "@/components/gc";
const CARRIERS = [{ name: "Mutual of Omaha", value: 345000 }, { name: "Transamerica", value: 278000 }, { name: "Americo", value: 198000 }, { name: "Corebridge", value: 156000 }, { name: "National Life", value: 132000 }];
const TRENDS = [{ label: "May", value: 82000 }, { label: "Jun", value: 95000 }, { label: "Jul", value: 88000 }, { label: "Aug", value: 110000 }, { label: "Sep", value: 98000 }, { label: "Oct", value: 105000 }, { label: "Nov", value: 115000 }, { label: "Dec", value: 92000 }, { label: "Jan", value: 125000 }, { label: "Feb", value: 118000 }, { label: "Mar", value: 135000 }, { label: "Apr", value: 142000 }];
const LEADERS = [{ rank: 1, name: "Sarah Mitchell", aip: 245000, policies: 28, placedRate: 92 }, { rank: 2, name: "Michael Chen", aip: 198000, policies: 22, placedRate: 88 }, { rank: 3, name: "James Rodriguez", aip: 176000, policies: 19, placedRate: 85 }, { rank: 4, name: "Emily Watson", aip: 152000, policies: 17, placedRate: 91 }, { rank: 5, name: "David Park", aip: 134000, policies: 15, placedRate: 82 }];
const rankColor = (r: number) => r === 1 ? "var(--gc-gold)" : r === 2 ? "var(--gc-text-secondary)" : r === 3 ? "var(--gc-status-warning)" : "var(--gc-text-muted)";
const cols: Column<typeof LEADERS[0]>[] = [
  { key: "rank", label: "#", render: (v) => <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", fontWeight: 600, color: rankColor(v) }}>{v}</span> },
  { key: "name", label: "Agent", sortable: true },
  { key: "aip", label: "Total AIP", sortable: true, render: (v) => `$${(v/1000).toFixed(0)}K` },
  { key: "policies", label: "Policies", sortable: true },
  { key: "placedRate", label: "Placed Rate", sortable: true, render: (v) => `${v}%` },
];
export default function OpsProduction() {
  return (
    <div>
      <GCPageHeader title="Production" subtitle="Real-time production metrics & carrier performance" accentUnderline />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <GCKPICard label="Total AIP" value="$1.24M" accentTop delta={{ value: "+12%", positive: true }} />
        <GCKPICard label="Total AP" value="$890K" accentTop delta={{ value: "+8%", positive: true }} />
        <GCKPICard label="Policies Issued" value={142} accentTop delta={{ value: "+15", positive: true }} />
        <GCKPICard label="Placed Rate" value="87%" accentTop delta={{ value: "+3%", positive: true }} />
        <GCKPICard label="NTO Rate" value="92%" accentTop />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <GCBarChart data={CARRIERS} title="Production by Carrier" valueFormatter={v => `$${(v/1000).toFixed(0)}K`} />
        <GCAreaChart data={TRENDS} title="Monthly Production Trend" valueFormatter={v => `$${(v/1000).toFixed(0)}K`} />
      </div>
      <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Agent Leaderboard</div>
      <GCDataTable columns={cols} data={LEADERS} searchable searchPlaceholder="Search agents..." />
    </div>
  );
}
