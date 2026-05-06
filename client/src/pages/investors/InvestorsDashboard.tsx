import { useState } from "react";
import { Link } from "wouter";
import { GCPageHeader, GCKPICard, GCAreaChart, GCPeriodSelector, INVESTOR_PERIODS } from "@/components/gc";

const AGENT_GROWTH = [{ label: "May", value: 22 }, { label: "Jun", value: 23 }, { label: "Jul", value: 24 }, { label: "Aug", value: 25 }, { label: "Sep", value: 26 }, { label: "Oct", value: 27 }, { label: "Nov", value: 28 }, { label: "Dec", value: 29 }, { label: "Jan", value: 30 }, { label: "Feb", value: 31 }, { label: "Mar", value: 33 }, { label: "Apr", value: 34 }];
const AIP_GROWTH = [{ label: "May", value: 620000 }, { label: "Jun", value: 680000 }, { label: "Jul", value: 720000 }, { label: "Aug", value: 790000 }, { label: "Sep", value: 840000 }, { label: "Oct", value: 890000 }, { label: "Nov", value: 940000 }, { label: "Dec", value: 980000 }, { label: "Jan", value: 1050000 }, { label: "Feb", value: 1110000 }, { label: "Mar", value: 1180000 }, { label: "Apr", value: 1243500 }];
const FINANCIALS = [{ label: "Total Commission Revenue", value: 743000 }, { label: "Total Override Payouts", value: 178000 }, { label: "Net Revenue", value: 565000 }, { label: "Projected Annual", value: 2260000 }];

const periodSelect = (period: string, setPeriod: (v: string) => void) => (
  <GCPeriodSelector value={period} onChange={setPeriod} options={INVESTOR_PERIODS} />
);

export default function InvestorsDashboard() {
  const [period, setPeriod] = useState("ytd");
  return (
    <div>
      <GCPageHeader title="Investor Dashboard" subtitle="Portfolio metrics & growth reporting" accentUnderline actions={periodSelect(period, setPeriod)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <GCKPICard label="Agents Under Management" value={34} accentTop delta={{ value: "+12% YoY", positive: true }} />
        <GCKPICard label="Total AIP" value="$1.24M" accentTop delta={{ value: "+28% YoY", positive: true }} />
        <GCKPICard label="Retention Rate" value="89%" accentTop />
        <GCKPICard label="Carrier Partners" value={15} accentTop />
        <GCKPICard label="Avg Premium" value="$2,840" accentTop />
        <GCKPICard label="Policies In Force" value={437} accentTop />
      </div>
      <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-4)", marginTop: "-4px" }}>Data as of April 21, 2026</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <GCAreaChart data={AGENT_GROWTH} title="Agent Headcount Growth" />
        <GCAreaChart data={AIP_GROWTH} title="AIP Growth" valueFormatter={v => `$${(v / 1000000).toFixed(2)}M`} />
      </div>
      <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)" }}>
        <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-4)" }}>Financial Summary</div>
        <div className="flex flex-col gap-3">
          {FINANCIALS.map((f, i) => (
            <div key={f.label} className="flex justify-between" style={{ padding: "var(--gc-space-2) 0", borderBottom: i < FINANCIALS.length - 1 ? "1px solid var(--gc-border-subtle)" : "2px solid var(--gc-gold)" }}>
              {f.label === "Total Commission Revenue" || f.label === "Net Revenue" ? (
                <Link href="/finance" style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)", textDecoration: "none" }}
                  onMouseEnter={(e: any) => { e.currentTarget.style.color = "var(--gc-gold)"; e.currentTarget.style.textDecoration = "underline"; }}
                  onMouseLeave={(e: any) => { e.currentTarget.style.color = "var(--gc-text-secondary)"; e.currentTarget.style.textDecoration = "none"; }}>
                  {f.label}
                </Link>
              ) : (
                <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)" }}>{f.label}</span>
              )}
              <span style={{ fontFamily: "var(--gc-font-display)", fontSize: i === FINANCIALS.length - 1 ? "var(--gc-text-xl)" : "var(--gc-text-lg)", fontWeight: 600, color: i === FINANCIALS.length - 1 ? "var(--gc-gold)" : "var(--gc-text-primary)" }}>${(f.value / 1000).toFixed(0)}K</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
