import { GCPageHeader, GCKPICard, GCDataTable, GCAreaChart, type Column } from "@/components/gc";
const SOURCES = [
  { source: "Web Form", leads: 28, conversions: 8, convRate: 28.6, revenue: 25600, roi: 320 },
  { source: "Referral", leads: 18, conversions: 7, convRate: 38.9, revenue: 31500, roi: 450 },
  { source: "Phone", leads: 12, conversions: 4, convRate: 33.3, revenue: 11200, roi: 180 },
  { source: "Social Media", leads: 10, conversions: 2, convRate: 20.0, revenue: 4200, roi: 140 },
  { source: "Paid Ads", leads: 6, conversions: 1, convRate: 16.7, revenue: 3800, roi: 95 },
];
const FUNNEL = [{ stage: "New", count: 78 }, { stage: "Contacted", count: 62 }, { stage: "Qualified", count: 45 }, { stage: "Quoted", count: 32 }, { stage: "Application", count: 22 }, { stage: "Placed", count: 18 }];
const roiColor = (r: number) => r >= 200 ? "var(--gc-status-active)" : r >= 100 ? "var(--gc-gold)" : "var(--gc-status-terminated)";
const cols: Column<typeof SOURCES[0]>[] = [
  { key: "source", label: "Source", sortable: true },
  { key: "leads", label: "Leads", sortable: true },
  { key: "conversions", label: "Conversions", sortable: true },
  { key: "convRate", label: "Conv Rate", sortable: true, render: (v) => `${v}%` },
  { key: "revenue", label: "Revenue", sortable: true, render: (v) => `$${v.toLocaleString()}` },
  { key: "roi", label: "ROI", sortable: true, render: (v) => <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: roiColor(v) }}>{v}%</span> },
];
export default function OpsMarketing() {
  return (
    <div>
      <GCPageHeader title="Marketing & Growth" subtitle="Campaign performance, lead attribution & recruitment pipeline" accentUnderline />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <GCKPICard label="Total Leads (Month)" value={78} accentTop delta={{ value: "+18%", positive: true }} />
        <GCKPICard label="Conversion Rate" value="23%" accentTop delta={{ value: "+2%", positive: true }} />
        <GCKPICard label="Cost Per Lead" value="$42" accentTop delta={{ value: "-8%", positive: true }} />
        <GCKPICard label="Agent Recruits" value={6} accentTop delta={{ value: "+2", positive: true }} />
        <GCKPICard label="Pipeline Value" value="$245K" accentTop />
      </div>
      <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Lead Source Attribution</div>
      <GCDataTable columns={cols} data={SOURCES} searchable />
      <div style={{ marginTop: "var(--gc-space-6)" }}>
        <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Conversion Funnel</div>
        <div className="flex flex-col gap-2">
          {FUNNEL.map((f, i) => (
            <div key={f.stage} className="flex items-center gap-4">
              <span style={{ width: 100, fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)", textAlign: "right" }}>{f.stage}</span>
              <div style={{ flex: 1, height: 32, backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)", position: "relative" }}>
                <div style={{ height: "100%", width: `${(f.count / 78) * 100}%`, background: `linear-gradient(90deg, var(--gc-gold), var(--gc-gold-bright))`, borderRadius: "var(--gc-radius-md)", transition: "width var(--gc-transition-normal)", display: "flex", alignItems: "center", paddingLeft: "var(--gc-space-3)" }}>
                  <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-md)", fontWeight: 600, color: "var(--gc-btn-primary-text)" }}>{f.count}</span>
                </div>
              </div>
              {i > 0 && <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)", width: 50 }}>{Math.round((f.count / FUNNEL[i-1].count) * 100)}%</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
