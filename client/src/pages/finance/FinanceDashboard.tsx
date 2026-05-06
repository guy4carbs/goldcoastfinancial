import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { GCPageHeader, GCKPICard, GCAreaChart, GCWaterfallChart, GCPeriodSelector } from "@/components/gc";
import { TOUR } from "@/lib/tour/selectors";

interface DashboardKPIs {
  apThisPeriod: number;
  dealCount: number;
  apYTD: number;
  issuedAP: number;
  activeAgents: number;
  pendingDeals: number;
  pendingAP: number;
  leadRevenue: number;
  leadPurchases: number;
  commissionTotal: number;
  overrideTotal: number;
}

export default function FinanceDashboard() {
  const [period, setPeriod] = useState("ytd");

  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useQuery<DashboardKPIs>({
    queryKey: [`/api/finance/dashboard/kpis?period=${period}`],
  });

  const { data: trends, isLoading: trendsLoading, error: trendsError } = useQuery<{ label: string; value: number }[]>({
    queryKey: [`/api/finance/dashboard/trends?period=${period}`],
  });

  const { data: waterfall, isLoading: waterfallLoading, error: waterfallError } = useQuery<{ label: string; value: number; isTotal?: boolean }[]>({
    queryKey: [`/api/finance/dashboard/waterfall?period=${period}`],
  });

  const sparkData = useMemo(() => trends?.map(t => t.value) || [], [trends]);
  const isLoading = kpisLoading || trendsLoading || waterfallLoading;
  const error = kpisError || trendsError || waterfallError;

  const fmt = (v: number) => {
    const sign = v < 0 ? "-" : "";
    const abs = Math.abs(v);
    if (abs >= 1000000) return `${sign}$${(abs / 1000000).toFixed(2)}M`;
    if (abs >= 10000) return `${sign}$${(abs / 1000).toFixed(0)}K`;
    if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}K`;
    return `${sign}$${abs.toLocaleString()}`;
  };

  // Use real override data from commission_records if available, otherwise estimate
  const overrideDisplay = (kpis?.overrideTotal || 0) > 0
    ? kpis!.overrideTotal
    : Math.round((kpis?.apThisPeriod || 0) * 0.20);
  const overrideLabel = (kpis?.overrideTotal || 0) > 0 ? "Agency Override" : "Est. Agency Override";

  return (
    <div>
      <div data-tour-id={TOUR.FINANCE.DASHBOARD.HEADER}>
        <GCPageHeader title="Financial Overview" subtitle="Agency revenue — AP, lead sales & commissions" accentUnderline
          actions={<div data-tour-id={TOUR.FINANCE.DASHBOARD.PERIOD}><GCPeriodSelector value={period} onChange={setPeriod} /></div>}
        />
      </div>

      {error ? (
        <div style={{ padding: "var(--gc-space-8)", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-status-terminated)", marginBottom: "var(--gc-space-2)" }}>Failed to load dashboard data</div>
          <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>{(error as Error).message}</div>
        </div>
      ) : isLoading ? (
        <div style={{ padding: "var(--gc-space-8)", textAlign: "center", color: "var(--gc-text-muted)", fontFamily: "var(--gc-font-body)" }}>Loading dashboard...</div>
      ) : (
        <>
          <div data-tour-id={TOUR.FINANCE.DASHBOARD.KPI_GRID} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div data-tour-id={TOUR.FINANCE.DASHBOARD.KPI_AP_SUBMITTED}>
              <GCKPICard label="AP Submitted" value={fmt(kpis?.apThisPeriod || 0)} accentTop
                sparklineData={sparkData.length > 1 ? sparkData : undefined}
                tooltip="Total Annual Premium submitted by agents this period"
                delta={{ value: `${kpis?.dealCount || 0} deals`, positive: true }} />
            </div>
            <GCKPICard label="AP (YTD)" value={fmt(kpis?.apYTD || 0)} accentTop
              tooltip="Year-to-date Annual Premium submitted" />
            <GCKPICard label="Lead Revenue" value={fmt(kpis?.leadRevenue || 0)} accentTop
              tooltip="Revenue from lead marketplace purchases by agents"
              delta={(kpis?.leadPurchases || 0) > 0 ? { value: `${kpis!.leadPurchases} purchases`, positive: true } : undefined} />
            <div data-tour-id={TOUR.FINANCE.DASHBOARD.KPI_AGENCY_OVERRIDE}>
              <GCKPICard label={overrideLabel} value={fmt(overrideDisplay)} accentTop
                tooltip="Agency override/spread income from hierarchy commissions" />
            </div>
            <GCKPICard label="Active Agents" value={kpis?.activeAgents || 0} accentTop
              tooltip="Agents who submitted deals this period" />
            <GCKPICard label="Issued AP" value={fmt(kpis?.issuedAP || 0)} accentTop
              tooltip="AP from deals verified or issued by carriers" />
            <GCKPICard label="Pending Deals" value={kpis?.pendingDeals || 0} accentTop
              tooltip="Deals submitted but not yet verified"
              delta={kpis?.pendingDeals ? { value: `${fmt(kpis.pendingAP)} pending`, positive: false } : undefined} />
            <GCKPICard label="Commission Recorded" value={fmt(kpis?.commissionTotal || 0)} accentTop
              tooltip="Total commission records from Heritage (personal + override)" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div data-tour-id={TOUR.FINANCE.DASHBOARD.WATERFALL}>
              <GCWaterfallChart data={waterfall || []} title="Revenue Decomposition" valueFormatter={v => fmt(Math.abs(v))} />
            </div>
            <div data-tour-id={TOUR.FINANCE.DASHBOARD.AREA_CHART}>
              <GCAreaChart data={trends || []} title="Monthly AP Submitted" valueFormatter={v => fmt(v)} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
