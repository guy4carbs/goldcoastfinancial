import { useState } from "react";
import { GCPageHeader, GCKPICard, GCAreaChart, GCBarChart, GCPeriodSelector, INVESTOR_PERIODS } from "@/components/gc";

const AIP_GROWTH = [{ label: "May", value: 620000 }, { label: "Jun", value: 680000 }, { label: "Jul", value: 720000 }, { label: "Aug", value: 790000 }, { label: "Sep", value: 840000 }, { label: "Oct", value: 890000 }, { label: "Nov", value: 940000 }, { label: "Dec", value: 980000 }, { label: "Jan", value: 1050000 }, { label: "Feb", value: 1110000 }, { label: "Mar", value: 1180000 }, { label: "Apr", value: 1243500 }];

const TRENDS_24M = [
  { label: "May '23", value: 380000 }, { label: "Jun '23", value: 395000 },
  { label: "Jul '23", value: 410000 }, { label: "Aug '23", value: 430000 },
  { label: "Sep '23", value: 445000 }, { label: "Oct '23", value: 465000 },
  { label: "Nov '23", value: 480000 }, { label: "Dec '23", value: 500000 },
  { label: "Jan '24", value: 520000 }, { label: "Feb '24", value: 540000 },
  { label: "Mar '24", value: 565000 }, { label: "Apr '24", value: 590000 },
  ...AIP_GROWTH,
];

const TRENDS_36M = [
  { label: "May '22", value: 180000 }, { label: "Jun '22", value: 195000 },
  { label: "Jul '22", value: 210000 }, { label: "Aug '22", value: 228000 },
  { label: "Sep '22", value: 245000 }, { label: "Oct '22", value: 260000 },
  { label: "Nov '22", value: 280000 }, { label: "Dec '22", value: 300000 },
  { label: "Jan '23", value: 320000 }, { label: "Feb '23", value: 340000 },
  { label: "Mar '23", value: 358000 }, { label: "Apr '23", value: 370000 },
  ...TRENDS_24M,
];

const QUARTERLY_PERFORMANCE = [
  { name: "Q1 2025", value: 245000 },
  { name: "Q2 2025", value: 298000 },
  { name: "Q3 2025", value: 342000 },
  { name: "Q4 2025", value: 358500 },
];

const PROJECTIONS = [
  { label: "Current Monthly Avg", value: "$103.6K" },
  { label: "3-Month Trend", value: "+8.2%" },
  { label: "Projected Q2", value: "$325K" },
  { label: "Projected Year-End", value: "$1.52M" },
];

export default function InvestorsPerformance() {
  const [period, setPeriod] = useState("ytd");
  const [trendRange, setTrendRange] = useState<"12M" | "24M" | "36M">("12M");

  const trendData = trendRange === "36M" ? TRENDS_36M : trendRange === "24M" ? TRENDS_24M : AIP_GROWTH;

  return (
    <div>
      <GCPageHeader title="Performance" subtitle="Historical metrics & growth projections" accentUnderline
        actions={
          <GCPeriodSelector value={period} onChange={setPeriod} options={INVESTOR_PERIODS} />
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="YoY Agent Growth" value="+55%" accentTop delta={{ value: "22 to 34", positive: true }} />
        <GCKPICard label="YoY AIP Growth" value="+101%" accentTop delta={{ value: "$620K to $1.24M", positive: true }} />
        <GCKPICard label="Monthly Run Rate" value="$103.6K" accentTop />
        <GCKPICard label="Projected Annual" value="$2.26M" accentTop />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div>
          <div className="flex gap-1 mb-3">
            {(["12M", "24M", "36M"] as const).map(r => (
              <button key={r} onClick={() => setTrendRange(r)}
                style={{
                  padding: "var(--gc-space-2) var(--gc-space-4)",
                  fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)",
                  fontWeight: trendRange === r ? 500 : 400,
                  color: trendRange === r ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)",
                  backgroundColor: "transparent", border: "none",
                  borderBottom: trendRange === r ? "2px solid var(--gc-gold)" : "2px solid transparent",
                  cursor: "pointer",
                }}>{r}</button>
            ))}
          </div>
          <GCAreaChart data={trendData} title={`${trendRange} AIP Trend`} valueFormatter={v => `$${(v / 1000000).toFixed(2)}M`} />
        </div>
        <GCBarChart data={QUARTERLY_PERFORMANCE} title="Quarterly Performance" valueFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
      </div>
      <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)" }}>
        <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-4)" }}>Projections</div>
        <div className="flex flex-col gap-3">
          {PROJECTIONS.map((p, i) => (
            <div key={p.label} className="flex justify-between" style={{ padding: "var(--gc-space-2) 0", borderBottom: i < PROJECTIONS.length - 1 ? "1px solid var(--gc-border-subtle)" : "2px solid var(--gc-gold)" }}>
              <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)" }}>{p.label}</span>
              <span style={{ fontFamily: "var(--gc-font-display)", fontSize: i === PROJECTIONS.length - 1 ? "var(--gc-text-xl)" : "var(--gc-text-lg)", fontWeight: 600, color: i === PROJECTIONS.length - 1 ? "var(--gc-gold)" : "var(--gc-text-primary)" }}>{p.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
