import { useState, useMemo } from "react";
import { GCPageHeader, GCDataTable, GCPeriodSelector, INVESTOR_PERIODS, type Column } from "@/components/gc";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const PIE_DATA = [
  { name: "Mutual of Omaha", value: 28 },
  { name: "Transamerica", value: 22 },
  { name: "Americo", value: 16 },
  { name: "Corebridge", value: 13 },
  { name: "National Life", value: 11 },
  { name: "Other", value: 10 },
];
const PIE_COLORS = ["#C4975A", "#D4A55A", "#8B5CF6", "#3B82F6", "#22C55E", "#6B7280"];

const CARRIERS = [
  { carrier: "Mutual of Omaha", share: 28, policies: 122, aip: 348000, avgPremium: 2852, growthYoY: 12 },
  { carrier: "Transamerica", share: 22, policies: 96, aip: 273000, avgPremium: 2844, growthYoY: 8 },
  { carrier: "Americo", share: 16, policies: 70, aip: 199000, avgPremium: 2843, growthYoY: 15 },
  { carrier: "Corebridge", share: 13, policies: 57, aip: 162000, avgPremium: 2842, growthYoY: -3 },
  { carrier: "National Life", share: 11, policies: 48, aip: 137000, avgPremium: 2854, growthYoY: 22 },
  { carrier: "Other", share: 10, policies: 44, aip: 124500, avgPremium: 2830, growthYoY: 5 },
];

const columns: Column<typeof CARRIERS[number]>[] = [
  { key: "carrier", label: "Carrier", sortable: true },
  { key: "share", label: "Market Share", sortable: true, render: (v: number) => `${v}%` },
  { key: "policies", label: "Policies", sortable: true },
  { key: "aip", label: "AIP", sortable: true, render: (v: number) => `$${(v / 1000).toFixed(0)}K` },
  { key: "avgPremium", label: "Avg Premium", render: (v: number) => `$${v.toLocaleString()}` },
  { key: "growthYoY", label: "Growth YoY", render: (v: number) => <span style={{ color: v >= 0 ? "var(--gc-status-active)" : "var(--gc-status-terminated)", fontWeight: 500 }}>{v >= 0 ? "+" : ""}{v}%</span> },
];

export default function InvestorsCarriers() {
  const [period, setPeriod] = useState("ytd");

  const { top2Share, riskLevel, riskColor } = useMemo(() => {
    const sorted = [...PIE_DATA].sort((a, b) => b.value - a.value);
    const share = sorted[0].value + sorted[1].value;
    const level = share >= 60 ? "High" : share >= 40 ? "Moderate" : "Low";
    const color = share >= 60 ? "var(--gc-status-terminated)" : share >= 40 ? "var(--gc-status-pending)" : "var(--gc-status-active)";
    return { top2Share: share, riskLevel: level, riskColor: color };
  }, []);

  return (
    <div>
      <GCPageHeader title="Carrier Mix" subtitle="Diversification analysis & carrier breakdown" accentUnderline
        actions={
          <GCPeriodSelector value={period} onChange={setPeriod} options={INVESTOR_PERIODS} />
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)" }}>
          <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-4)" }}>Carrier Diversification</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
                {PIE_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {PIE_DATA.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-secondary)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: PIE_COLORS[i] }} />
                {d.name} {d.value}%
              </span>
            ))}
          </div>
        </div>
        <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-4)" }}>Concentration Risk</div>
          <div style={{ backgroundColor: `color-mix(in srgb, ${riskColor} 10%, transparent)`, border: `1px solid ${riskColor}`, borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)" }}>
            <div className="flex items-start gap-3">
              <div style={{ width: 4, minHeight: 40, backgroundColor: riskColor, borderRadius: 2, flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", fontWeight: 600, color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-1)" }}>{riskLevel} Concentration</div>
                <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)", lineHeight: 1.6 }}>
                  Top 2 carriers represent <span style={{ fontWeight: 600, color: riskColor }}>{top2Share}%</span> of portfolio. Industry best practice recommends no single carrier exceeds 30% and top-2 combined stays below 45%. Consider increasing placement with National Life and Americo to improve diversification.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-3)" }}>Carrier Breakdown</div>
        <GCDataTable columns={columns} data={CARRIERS} />
      </div>
    </div>
  );
}
