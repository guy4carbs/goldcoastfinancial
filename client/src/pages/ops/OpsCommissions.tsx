import { GCPageHeader, GCKPICard, GCAreaChart, GCBarChart, GCStatRow, GCDataTable, type Column } from "@/components/gc";
const TRENDS = [{ label: "May", value: 42000, value2: 15000 }, { label: "Jun", value: 48000, value2: 17000 }, { label: "Jul", value: 45000, value2: 16000 }, { label: "Aug", value: 52000, value2: 19000 }, { label: "Sep", value: 49000, value2: 18000 }, { label: "Oct", value: 55000, value2: 21000 }, { label: "Nov", value: 58000, value2: 22000 }, { label: "Dec", value: 51000, value2: 20000 }, { label: "Jan", value: 62000, value2: 24000 }, { label: "Feb", value: 59000, value2: 23000 }, { label: "Mar", value: 65000, value2: 26000 }, { label: "Apr", value: 68000, value2: 28000 }];
const CARRIERS = [{ name: "Mutual of Omaha", value: 145000 }, { name: "Transamerica", value: 112000 }, { name: "Americo", value: 89000 }, { name: "Corebridge", value: 76000 }, { name: "National Life", value: 64000 }];
const WATERFALL = [
  { name: "Owner (120%)", spread: 20, earning: 2000 },
  { name: "Director (100%)", spread: 10, earning: 1000 },
  { name: "Manager (90%)", spread: 10, earning: 1000 },
  { name: "Agent (80%)", spread: 0, earning: 8000 },
];
const AGENTS = [
  { name: "Sarah Mitchell", personalAp: 245000, overrideAp: 0, total: 196000, rate: 80, net: 193600 },
  { name: "Michael Chen", personalAp: 198000, overrideAp: 45000, total: 194400, rate: 85, net: 194400 },
  { name: "James Rodriguez", personalAp: 176000, overrideAp: 32000, total: 172800, rate: 82, net: 171600 },
];
const cols: Column<typeof AGENTS[0]>[] = [
  { key: "name", label: "Agent", sortable: true },
  { key: "personalAp", label: "Personal AP", sortable: true, render: (v) => `$${(v/1000).toFixed(0)}K` },
  { key: "overrideAp", label: "Override AP", sortable: true, render: (v) => `$${(v/1000).toFixed(0)}K` },
  { key: "total", label: "Total Earned", sortable: true, render: (v) => `$${(v/1000).toFixed(0)}K` },
  { key: "rate", label: "Rate", render: (v) => `${v}%` },
  { key: "net", label: "Net", sortable: true, render: (v) => `$${(v/1000).toFixed(0)}K` },
];
export default function OpsCommissions() {
  return (
    <div>
      <GCPageHeader title="Commissions" subtitle="Commission tracking, waterfall breakdowns & payout management" accentUnderline />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <GCKPICard label="Total Personal" value="$425K" accentTop delta={{ value: "+8%", positive: true }} />
        <GCKPICard label="Total Overrides" value="$178K" accentTop delta={{ value: "+12%", positive: true }} />
        <GCKPICard label="Chargebacks" value="-$12K" accentTop />
        <GCKPICard label="Net Commissions" value="$591K" accentTop delta={{ value: "+9%", positive: true }} />
        <GCKPICard label="Avg Rate" value="82%" accentTop />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <GCAreaChart data={TRENDS} title="Commission Trends (Personal vs Override)" keys={["Personal", "Override"]} valueFormatter={v => `$${(v/1000).toFixed(0)}K`} />
        <GCBarChart data={CARRIERS} title="Commissions by Carrier" valueFormatter={v => `$${(v/1000).toFixed(0)}K`} />
      </div>
      <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-6)" }}>
        <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Waterfall Override Breakdown ($10K Premium)</div>
        <div className="flex flex-col gap-2">
          {WATERFALL.map(w => <GCStatRow key={w.name} label={`${w.name}${w.spread > 0 ? ` — ${w.spread}% spread` : " — Personal"}`} value={w.earning} max={10000} formatter={v => `$${v.toLocaleString()}`} />)}
        </div>
        <div style={{ marginTop: "var(--gc-space-4)", paddingTop: "var(--gc-space-3)", borderTop: "2px solid var(--gc-gold)", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Total Payout</span>
          <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-gold)" }}>$12,000</span>
        </div>
      </div>
      <GCDataTable columns={cols} data={AGENTS} searchable searchPlaceholder="Search agents..." />
    </div>
  );
}
