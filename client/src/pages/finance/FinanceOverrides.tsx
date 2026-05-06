import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { GCPageHeader, GCKPICard, GCSankeyChart, GCDataTable, GCStatusBadge, GCPeriodSelector, type Column } from "@/components/gc";
import { TOUR } from "@/lib/tour/selectors";

interface OverrideKPIs {
  overrideIncome: number;
  avgSpread: number;
  uniqueUplineChains: number;
  pendingOverrides: number;
}

interface HierarchyLevel {
  agentUserId: string;
  name: string;
  hierarchyLevel: number;
  hierarchyTitle: string;
  contractLevel: number;
  spread: number;
  overrideEarning: number;
  isPersonal: boolean;
}

interface HierarchyFlow {
  levels: HierarchyLevel[];
  totalPayout: number;
  premiumAmount: number;
  isExample?: boolean;
}

interface OverrideHistoryRow {
  id: number;
  agentName: string;
  uplineName: string | null;
  amount: number;
  spread: number;
  overrideLevel: string;
  status: string;
  createdAt: string;
}

const cols: Column<OverrideHistoryRow>[] = [
  { key: "createdAt", label: "Date", sortable: true, render: (v: string) => new Date(v).toLocaleDateString() },
  { key: "agentName", label: "Agent", sortable: true },
  { key: "amount", label: "Deal AP", sortable: true, align: "right", render: (v: number) => <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600 }}>${v.toLocaleString()}</span> },
  { key: "spread", label: "Spread %", align: "right", render: (v: number) => v > 0 ? <span style={{ color: "var(--gc-gold)" }}>{v}%</span> : "—" },
  { key: "overrideLevel", label: "Level" },
  { key: "uplineName", label: "Upline", render: (v: string | null) => v || "—" },
  { key: "status", label: "Status", render: (v: string) => <GCStatusBadge status={v} /> },
];

export default function FinanceOverrides() {
  const [period, setPeriod] = useState("ytd");

  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useQuery<OverrideKPIs>({
    queryKey: [`/api/finance/overrides/kpis?period=${period}`],
  });

  const { data: flow, isLoading: flowLoading, error: flowError } = useQuery<HierarchyFlow>({
    queryKey: ["/api/finance/overrides/hierarchy-flow"],
  });

  const { data: history, isLoading: histLoading, error: histError } = useQuery<OverrideHistoryRow[]>({
    queryKey: [`/api/finance/overrides/history?period=${period}`],
  });

  const sankeyData = useMemo(() => {
    if (!flow || !flow.levels || flow.levels.length === 0) return null;

    const nodes = [
      { name: `Premium ($${(flow.premiumAmount / 1000).toFixed(0)}K)` },
      ...flow.levels.map(l => ({ name: `${l.name} (${l.hierarchyTitle} ${l.contractLevel}%)` })),
    ];

    const links = flow.levels
      .filter(l => l.overrideEarning > 0)
      .map((l, i) => ({
        source: 0,
        target: flow.levels.indexOf(l) + 1,
        value: l.overrideEarning,
      }));

    return { nodes, links };
  }, [flow]);

  const isLoading = kpisLoading || flowLoading || histLoading;
  const error = kpisError || flowError || histError;

  const fmt = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 1000000) return `$${(abs / 1000000).toFixed(2)}M`;
    if (abs >= 1000) return `$${(abs / 1000).toFixed(1)}K`;
    return `$${abs.toLocaleString()}`;
  };

  return (
    <div>
      <div data-tour-id={TOUR.FINANCE.OVERRIDES.HEADER}>
        <GCPageHeader title="Overrides & Spreads" subtitle="Agency hierarchy override tracking" accentUnderline
          actions={<div data-tour-id={TOUR.FINANCE.OVERRIDES.PERIOD}><GCPeriodSelector value={period} onChange={setPeriod} /></div>}
        />
      </div>

      {error ? (
        <div style={{ padding: "var(--gc-space-8)", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-status-terminated)", marginBottom: "var(--gc-space-2)" }}>Failed to load overrides data</div>
          <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>{(error as Error).message}</div>
        </div>
      ) : isLoading ? (
        <div style={{ padding: "var(--gc-space-8)", textAlign: "center", color: "var(--gc-text-muted)", fontFamily: "var(--gc-font-body)" }}>Loading overrides data...</div>
      ) : (
        <>
          <div data-tour-id={TOUR.FINANCE.OVERRIDES.KPI_GRID} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <GCKPICard label="Est. Override Income" value={fmt(kpis?.overrideIncome || 0)} accentTop
              tooltip="Estimated agency override income (~20% of AP based on typical contract spreads)" />
            <GCKPICard label="Avg Spread" value={`${(kpis?.avgSpread || 0).toFixed(1)}%`} accentTop
              tooltip="Average spread between upline and downline contract levels" />
            <GCKPICard label="Active Override Chains" value={kpis?.uniqueUplineChains || 0} accentTop
              tooltip="Agents with active override-eligible hierarchy positions" />
            <GCKPICard label="Pending Calculations" value={kpis?.pendingOverrides || 0} accentTop
              tooltip="Override calculations awaiting processing" />
          </div>

          {sankeyData && sankeyData.links.length > 0 ? (
            <div data-tour-id={TOUR.FINANCE.OVERRIDES.SANKEY} className="mb-6">
              <GCSankeyChart
                nodes={sankeyData.nodes}
                links={sankeyData.links}
                title={`Commission Flow — $${((flow?.premiumAmount || 10000) / 1000).toFixed(0)}K Premium`}
              />
            </div>
          ) : (
            <div className="mb-6" style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-8)", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-muted)" }}>
                No hierarchy configured yet. Set up agent hierarchy in HCMS to see commission flow visualization.
              </div>
            </div>
          )}

          <div data-tour-id={TOUR.FINANCE.OVERRIDES.EXPLAINER} className="mb-6" style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderLeft: "3px solid var(--gc-gold)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)" }}>
            <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", fontWeight: 600, color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>Waterfall/Spread Override Model</div>
            <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)", lineHeight: 1.6 }}>
              In the waterfall/spread model, each level in the hierarchy only earns the spread (difference) between their contract level and the level directly below them. Overrides do not skip levels. For example: Owner (120%) → Manager (90%) → Agent (80%) on a $10K premium — Agent earns 80% ($8K), Manager earns the 10% spread ($1K), Owner earns the 30% spread ($3K).
            </div>
          </div>

          <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-3)" }}>Override History</div>
          <div data-tour-id={TOUR.FINANCE.OVERRIDES.HISTORY_TABLE}>
            <GCDataTable columns={cols} data={history || []} searchable searchPlaceholder="Search overrides..." />
          </div>
        </>
      )}
    </div>
  );
}
