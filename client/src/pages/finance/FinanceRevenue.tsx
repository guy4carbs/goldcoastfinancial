import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { GCPageHeader, GCKPICard, GCAreaChart, GCDataTable, GCPeriodSelector, type Column } from "@/components/gc";
import { TOUR } from "@/lib/tour/selectors";

interface RevenueKPIs {
  totalRevenue: number;
  dealCount: number;
  carrierCount: number;
  agentCount: number;
  overrideIncome: number;
  renewalIncome: number;
}

interface QuarterlyData {
  label: string;
  year: number;
  quarter: number;
  total: number;
}

interface CarrierRow {
  carrierName: string;
  policies: number;
  totalPremium: number;
}

interface AgentRow {
  agentUserId: string;
  name: string;
  deals: number;
  totalPremium: number;
}

const carrierCols: Column<CarrierRow>[] = [
  { key: "carrierName", label: "Carrier", sortable: true, render: (v) => <Link href="/investors/carriers" style={{ color: "var(--gc-gold)", textDecoration: "none", cursor: "pointer" }}>{v}</Link> },
  { key: "policies", label: "Deals", sortable: true },
  { key: "totalPremium", label: "Annual Premium", sortable: true, align: "right", render: (v) => {
    const n = v as number;
    return <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600 }}>{n >= 1000000 ? `$${(n / 1000000).toFixed(2)}M` : `$${(n / 1000).toFixed(0)}K`}</span>;
  }},
];

const agentCols: Column<AgentRow>[] = [
  { key: "name", label: "Agent", sortable: true, render: (v) => <span style={{ cursor: "pointer", transition: "color 0.15s" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--gc-gold)")} onMouseLeave={e => (e.currentTarget.style.color = "inherit")}>{v}</span> },
  { key: "deals", label: "Deals", sortable: true },
  { key: "totalPremium", label: "Annual Premium", sortable: true, align: "right", render: (v) => {
    const n = v as number;
    return <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600 }}>{n >= 1000000 ? `$${(n / 1000000).toFixed(2)}M` : `$${(n / 1000).toFixed(0)}K`}</span>;
  }},
];

export default function FinanceRevenue() {
  const [period, setPeriod] = useState("ytd");

  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useQuery<RevenueKPIs>({
    queryKey: [`/api/finance/revenue/kpis?period=${period}`],
  });

  const { data: quarterly, isLoading: qLoading, error: qError } = useQuery<QuarterlyData[]>({
    queryKey: [`/api/finance/revenue/quarterly?period=${period}`],
  });

  const { data: carriers, isLoading: cLoading, error: cError } = useQuery<CarrierRow[]>({
    queryKey: [`/api/finance/revenue/by-carrier?period=${period}`],
  });

  const { data: agents, isLoading: aLoading, error: aError } = useQuery<AgentRow[]>({
    queryKey: [`/api/finance/revenue/by-agent?period=${period}`],
  });

  const isLoading = kpisLoading || qLoading || cLoading || aLoading;
  const error = kpisError || qError || cError || aError;

  const fmt = (v: number) => {
    const abs = Math.abs(v);
    const sign = v < 0 ? "-" : "";
    if (abs >= 1000000) return `${sign}$${(abs / 1000000).toFixed(2)}M`;
    if (abs >= 10000) return `${sign}$${(abs / 1000).toFixed(0)}K`;
    if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}K`;
    return `${sign}$${abs.toLocaleString()}`;
  };

  // Transform quarterly data for the area chart
  const chartData = (quarterly || []).map(q => ({ label: q.label, value: q.total }));

  return (
    <div>
      <div data-tour-id={TOUR.FINANCE.REVENUE.HEADER}>
        <GCPageHeader title="Revenue" subtitle="Annual Premium tracking by carrier & agent" accentUnderline
          actions={<div data-tour-id={TOUR.FINANCE.REVENUE.PERIOD}><GCPeriodSelector value={period} onChange={setPeriod} /></div>}
        />
      </div>

      {error ? (
        <div style={{ padding: "var(--gc-space-8)", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-status-terminated)", marginBottom: "var(--gc-space-2)" }}>Failed to load revenue data</div>
          <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>{(error as Error).message}</div>
        </div>
      ) : isLoading ? (
        <div style={{ padding: "var(--gc-space-8)", textAlign: "center", color: "var(--gc-text-muted)", fontFamily: "var(--gc-font-body)" }}>Loading revenue data...</div>
      ) : (
        <>
          <div data-tour-id={TOUR.FINANCE.REVENUE.KPI_GRID} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <GCKPICard label="Total AP Submitted" value={fmt(kpis?.totalRevenue || 0)} accentTop
              tooltip="Total Annual Premium submitted by agents this period"
              delta={{ value: `${kpis?.dealCount || 0} deals`, positive: true }} />
            <GCKPICard label="Carriers" value={kpis?.carrierCount || 0} accentTop
              tooltip="Number of carriers with submitted deals this period" />
            <GCKPICard label="Est. Agency Override" value={fmt(kpis?.overrideIncome || 0)} accentTop
              tooltip="Estimated agency override income (~20% of AP)" />
            <GCKPICard label="Active Agents" value={kpis?.agentCount || 0} accentTop
              tooltip="Agents who submitted deals this period" />
          </div>

          {chartData.length > 0 && (
            <div data-tour-id={TOUR.FINANCE.REVENUE.CHART} className="mb-6">
              <GCAreaChart data={chartData} title="AP by Quarter" valueFormatter={v => fmt(v)} />
            </div>
          )}

          <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>AP by Carrier</div>
          <div data-tour-id={TOUR.FINANCE.REVENUE.CARRIERS_TABLE} className="mb-6">
            <GCDataTable columns={carrierCols} data={carriers || []} searchable searchPlaceholder="Search carriers..." />
          </div>

          <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>AP by Agent</div>
          <div data-tour-id={TOUR.FINANCE.REVENUE.AGENTS_TABLE}>
            <GCDataTable columns={agentCols} data={agents || []} searchable searchPlaceholder="Search agents..." />
          </div>
        </>
      )}
    </div>
  );
}
