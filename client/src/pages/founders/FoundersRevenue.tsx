import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ExternalLink } from "lucide-react";
import {
  GCPeriodSelector,
  GCDataTable,
  GCPageHeader,
  GCKPICard,
  type Column,
} from "@/components/gc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "./utils/format";
import { TOUR } from "@/lib/tour/selectors";

// ─── Canonical style + helper kit (mirrors FoundersDashboard) ─────────────

const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--gc-font-body)",
  fontSize: "var(--gc-text-xs)",
  fontWeight: 500,
  letterSpacing: "var(--gc-tracking-wider)",
  textTransform: "uppercase",
  color: "var(--gc-text-muted)",
  margin: 0,
};

const OUTLINED_BUTTON_STYLE: React.CSSProperties = {
  backgroundColor: "var(--gc-surface-2)",
  border: "1px solid var(--gc-border)",
  borderRadius: "var(--gc-radius-sm)",
  color: "var(--gc-text-secondary)",
  fontFamily: "var(--gc-font-body)",
  fontSize: "var(--gc-text-sm)",
  fontWeight: 500,
  textDecoration: "none",
  padding: "var(--gc-space-1) var(--gc-space-3)",
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--gc-space-1)",
  cursor: "pointer",
};

// Mirrors FoundersDashboard's KPI hover ring + focus-visible affordance.
const KPI_LINK_CLASS =
  "block rounded-md transition-shadow hover:ring-2 hover:ring-[var(--gc-gold-bright,var(--gc-gold))] focus-visible:ring-2 focus-visible:ring-[var(--gc-gold)]";

// Compact currency for KPI tiles ($1.88M / $42.3K) — full precision via
// formatCurrency stays for tables, tooltips, and override math.
function formatCurrencyCompact(amount: number | null | undefined): string {
  if (amount == null) return "—";
  if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (Math.abs(amount) >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return formatCurrency(amount);
}

// Compact period label for the canonical PeriodChip.
const COMPACT_PERIOD: Record<string, string> = {
  all: "All time", today: "Today", wtd: "WTD", mtd: "MTD",
  qtd: "QTD", ytd: "YTD", "6mo": "6mo",
  "this-month": "This month", "last-month": "Last month",
  "last-3": "Last 3", "last-6": "Last 6", "last-year": "Last year",
};
function PeriodChip({ period }: { period: string }) {
  return (
    <span
      style={{
        ...SECTION_LABEL_STYLE,
        padding: "2px 8px",
        border: "1px solid var(--gc-border)",
        borderRadius: "var(--gc-radius-sm)",
        marginLeft: "var(--gc-space-2)",
      }}
    >
      {COMPACT_PERIOD[period] || period.toUpperCase()}
    </span>
  );
}

const CARD_STYLE: React.CSSProperties = {
  backgroundColor: "var(--gc-surface)",
  border: "1px solid var(--gc-border)",
  borderRadius: "var(--gc-radius-md)",
  padding: "var(--gc-space-4)",
  height: "100%",
  minHeight: 380,
  display: "flex",
  flexDirection: "column",
};

interface RevenueKPIs {
  apMtd: number;
  apYtd: number;
  overrideYtd: number;
  netMargin: number;
}

interface PeriodTrendPoint {
  month: string;
  revenue: number;
}

interface PeriodTrendData {
  current: PeriodTrendPoint[];
  prior: PeriodTrendPoint[];
  periodLabel: string;
}

interface ByCarrierRow {
  carrier: string;
  ap: number;
  deals: number;
  issuedAp: number;
}

interface ByAgentRow {
  agentId: string;
  name: string;
  team: string;
  ap: number;
  deals: number;
}

interface OverrideDecompositionLevel {
  agentUserId: string;
  name: string;
  hierarchyTitle: string;
  contractLevel: number;
  spreadPct: number;
  overrideAmount: number;
  shareOfTotal: number;
}

interface OverrideDecompositionData {
  premiumTotal: number;
  totalPaidOut: number;
  levels: OverrideDecompositionLevel[];
  isExample: boolean;
  periodLabel: string;
}

interface LeadRevenueKPIs {
  grossCents: number;
  vendorCostCents: number;
  netProfitCents: number;
  unitsSold: number;
  periodLabel: string;
}

interface LeadRevenueByProductRow {
  slug: string;
  name: string;
  units: number;
  grossCents: number;
  vendorCostCents: number;
  netProfitCents: number;
  marginPct: number;
}

export default function FoundersRevenue() {
  const [period, setPeriod] = useState("ytd");

  const kpiQ = useQuery<RevenueKPIs>({
    queryKey: ["/api/founders/revenue/kpis", period],
    staleTime: 60_000,
    retry: 1,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const periodTrendQ = useQuery<PeriodTrendData>({
    queryKey: ["/api/founders/revenue/period-trend", period],
    staleTime: 60_000,
    retry: 1,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const overrideDecompQ = useQuery<OverrideDecompositionData>({
    queryKey: ["/api/founders/revenue/override-decomposition", period],
    staleTime: 60_000,
    retry: 1,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const carriersQ = useQuery<ByCarrierRow[]>({
    queryKey: ["/api/finance/revenue/by-carrier", period],
    staleTime: 60_000,
    retry: 1,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const agentsQ = useQuery<ByAgentRow[]>({
    queryKey: ["/api/finance/revenue/by-agent", period],
    staleTime: 60_000,
    retry: 1,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const leadKpiQ = useQuery<LeadRevenueKPIs>({
    queryKey: ["/api/founders/lead-revenue/kpis", period],
    staleTime: 60_000,
    retry: 1,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const leadByProductQ = useQuery<LeadRevenueByProductRow[]>({
    queryKey: ["/api/founders/lead-revenue/by-product", period],
    staleTime: 60_000,
    retry: 1,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  // Hard-fail the page only if EVERY core query errors. Per-section components
  // already render their own loading/empty/error states, so a single failing
  // endpoint shouldn't blank the whole dashboard.
  const allErrored = !!(
    kpiQ.error &&
    periodTrendQ.error &&
    overrideDecompQ.error &&
    carriersQ.error &&
    agentsQ.error &&
    leadKpiQ.error &&
    leadByProductQ.error
  );
  const firstError =
    kpiQ.error ||
    periodTrendQ.error ||
    overrideDecompQ.error ||
    carriersQ.error ||
    agentsQ.error ||
    leadKpiQ.error ||
    leadByProductQ.error;

  const carrierCols: Column<ByCarrierRow>[] = [
    { key: "carrier", label: "Carrier", sortable: true, width: "30%" },
    { key: "deals", label: "Deals", sortable: true, width: "15%", align: "right", render: v => (v as number).toLocaleString() },
    { key: "ap", label: "AP", sortable: true, width: "25%", align: "right", render: v => formatCurrency(v as number) },
    { key: "issuedAp", label: "Issued AP", sortable: true, width: "30%", align: "right", render: v => formatCurrency(v as number) },
  ];

  const agentCols: Column<ByAgentRow>[] = [
    { key: "name", label: "Agent", sortable: true, width: "30%", render: (v, row) => (
      <Link href={`/hcms/agents/${row.agentId}`} style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500, textDecoration: "none" }}>{v as string}</Link>
    ) },
    { key: "team", label: "Team", sortable: true, width: "25%" },
    { key: "deals", label: "Deals", sortable: true, width: "15%", align: "right", render: v => (v as number).toLocaleString() },
    { key: "ap", label: "AP", sortable: true, width: "30%", align: "right", render: v => formatCurrency(v as number) },
  ];

  const leadProductCols: Column<LeadRevenueByProductRow>[] = [
    { key: "name", label: "Product", sortable: true, width: "22%" },
    { key: "units", label: "Units Sold", sortable: true, width: "13%", align: "right", render: v => (v as number).toLocaleString() },
    { key: "grossCents", label: "Gross", sortable: true, width: "16%", align: "right", render: v => formatCurrency((v as number) / 100) },
    { key: "vendorCostCents", label: "Vendor Cost", sortable: true, width: "17%", align: "right", render: v => formatCurrency((v as number) / 100) },
    { key: "netProfitCents", label: "Net Profit", sortable: true, width: "16%", align: "right", render: v => formatCurrency((v as number) / 100) },
    { key: "marginPct", label: "Margin %", sortable: true, width: "16%", align: "right", render: v => `${(v as number).toFixed(1)}%` },
  ];

  return (
    <div>
      <div data-tour-id={TOUR.FOUNDERS.REVENUE.HEADER}>
        <GCPageHeader
          title="Revenue"
          subtitle="Combined revenue, commissions, and override decomposition"
          accentUnderline
          actions={
            <div className="flex items-center gap-2">
              <div data-tour-id={TOUR.FOUNDERS.REVENUE.PERIOD}>
                <GCPeriodSelector value={period} onChange={setPeriod} />
              </div>
              <Link
                href="/finance/overrides"
                style={OUTLINED_BUTTON_STYLE}
                aria-label="Open overrides drill-in page"
              >
                Overrides drill-in
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          }
        />
      </div>

      {allErrored && (
        <div className="py-8 text-center">
          <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-status-terminated)", marginBottom: "var(--gc-space-2)" }}>
            Unable to load dashboard
          </div>
          <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
            {(firstError as Error)?.message ?? "Please try again."}
          </div>
        </div>
      )}

      {/* KPI strip */}
      <section className="mb-6" aria-labelledby="founders-revenue-kpi-heading">
        <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--gc-space-2)" }}>
          <h2 id="founders-revenue-kpi-heading" style={SECTION_LABEL_STYLE}>
            Headline KPIs
          </h2>
          <PeriodChip period={period} />
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          data-tour-id={TOUR.FOUNDERS.REVENUE.KPI_GRID}
        >
          {kpiQ.isLoading || !kpiQ.data ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[116px] w-full" />
            ))
          ) : (
            <>
              <Link
                href="#by-carrier"
                className={KPI_LINK_CLASS}
                aria-label={`Annual Premium MTD: ${formatCurrency(kpiQ.data.apMtd)} — jump to AP by Carrier`}
              >
                <GCKPICard
                  label="Annual Premium (MTD)"
                  value={formatCurrencyCompact(kpiQ.data.apMtd)}
                  accentTop
                  tooltip={`Annual premium submitted this month • ${formatCurrency(kpiQ.data.apMtd)}`}
                />
              </Link>
              <Link
                href="#by-carrier"
                className={KPI_LINK_CLASS}
                aria-label={`Annual Premium YTD: ${formatCurrency(kpiQ.data.apYtd)} — jump to AP by Carrier`}
              >
                <GCKPICard
                  label="Annual Premium (YTD)"
                  value={formatCurrencyCompact(kpiQ.data.apYtd)}
                  accentTop
                  tooltip={`Year-to-date annual premium submitted • ${formatCurrency(kpiQ.data.apYtd)}`}
                />
              </Link>
              <Link
                href="#override-decomposition"
                className={KPI_LINK_CLASS}
                aria-label={`Override Income YTD: ${formatCurrency(kpiQ.data.overrideYtd)} — jump to Override Decomposition`}
              >
                <GCKPICard
                  label="Override Income (YTD)"
                  value={formatCurrencyCompact(kpiQ.data.overrideYtd)}
                  accentTop
                  tooltip={`Agency spread/override income walked via waterfall • ${formatCurrency(kpiQ.data.overrideYtd)}`}
                />
              </Link>
              <Link
                href="#period-trend"
                className={KPI_LINK_CLASS}
                aria-label={`Margin: ${kpiQ.data.netMargin.toFixed(1)}% — jump to Period Trend`}
              >
                <GCKPICard
                  label="Margin %"
                  value={`${kpiQ.data.netMargin.toFixed(1)}%`}
                  accentTop
                  tooltip="Override income / annual premium for the YTD window"
                />
              </Link>
            </>
          )}
          {leadKpiQ.isLoading || !leadKpiQ.data ? (
            <Skeleton className="h-[116px] w-full" />
          ) : (
            <Link
              href="#lead-revenue"
              className={KPI_LINK_CLASS}
              aria-label={`Lead Revenue Net: ${formatCurrency(leadKpiQ.data.netProfitCents / 100)} — jump to Lead Revenue`}
            >
              <GCKPICard
                label="Lead Revenue (Net)"
                value={formatCurrencyCompact(leadKpiQ.data.netProfitCents / 100)}
                accentTop
                tooltip={`Gross ${formatCurrency(leadKpiQ.data.grossCents / 100)} − vendor cost ${formatCurrency(leadKpiQ.data.vendorCostCents / 100)} • ${leadKpiQ.data.unitsSold} leads sold`}
              />
            </Link>
          )}
        </div>
      </section>

      {/* Period Trend + Override Decomposition — locked to the same height for symmetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 items-stretch">
        <div id="period-trend" data-tour-id={TOUR.FOUNDERS.REVENUE.WATERFALL} className="h-full">
          <PeriodTrendCard
            data={periodTrendQ.data}
            isLoading={periodTrendQ.isLoading}
            isError={!!periodTrendQ.error}
            periodLabel={periodTrendQ.data?.periodLabel ?? period}
          />
        </div>

        <div id="override-decomposition" data-tour-id={TOUR.FOUNDERS.REVENUE.SANKEY} className="h-full">
          <OverrideDecompositionCard
            data={overrideDecompQ.data}
            isLoading={overrideDecompQ.isLoading}
            isError={!!overrideDecompQ.error}
          />
        </div>
      </div>

      {/* AP by carrier */}
      <section
        id="by-carrier"
        className="mb-6"
        aria-labelledby="founders-revenue-carriers-heading"
        data-tour-id={TOUR.FOUNDERS.REVENUE.CARRIERS_TABLE}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--gc-space-3)" }}>
          <h2 id="founders-revenue-carriers-heading" style={SECTION_LABEL_STYLE}>
            AP by Carrier
          </h2>
          <PeriodChip period={period} />
        </div>
        {carriersQ.isLoading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : (carriersQ.data ?? []).length === 0 ? (
          <EmptyTableBlock
            title="No carrier activity in this period."
            subtext="Once policies are issued, carriers will appear here."
          />
        ) : (
          <GCDataTable columns={carrierCols} data={carriersQ.data ?? []} searchable searchPlaceholder="Search carriers..." />
        )}
      </section>

      {/* AP by agent */}
      <section
        id="by-agent"
        className="mb-6"
        aria-labelledby="founders-revenue-agents-heading"
        data-tour-id={TOUR.FOUNDERS.REVENUE.AGENTS_TABLE}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--gc-space-3)" }}>
          <h2 id="founders-revenue-agents-heading" style={SECTION_LABEL_STYLE}>
            AP by Agent
          </h2>
          <PeriodChip period={period} />
        </div>
        {agentsQ.isLoading ? (
          <Skeleton className="h-[320px] w-full" />
        ) : (agentsQ.data ?? []).length === 0 ? (
          <EmptyTableBlock
            title="No agent deals in this period."
            subtext="Agent-level revenue will appear here once deals are submitted."
          />
        ) : (
          <GCDataTable columns={agentCols} data={agentsQ.data ?? []} searchable searchPlaceholder="Search agents..." />
        )}
      </section>

      {/* Lead Revenue by Product */}
      <section
        id="lead-revenue"
        className="mb-6"
        aria-labelledby="founders-revenue-leads-heading"
        data-tour-id={TOUR.FOUNDERS.REVENUE.LEAD_REVENUE_TABLE}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--gc-space-3)" }}>
          <h2 id="founders-revenue-leads-heading" style={SECTION_LABEL_STYLE}>
            Lead Revenue by Product
          </h2>
          <PeriodChip period={period} />
        </div>
        {leadByProductQ.isLoading ? (
          <Skeleton className="h-[320px] w-full" />
        ) : (leadByProductQ.data ?? []).length === 0 ? (
          <EmptyTableBlock
            title="No lead purchases in this period."
            subtext="Once agents buy leads, product-level revenue will appear here."
          />
        ) : (
          <GCDataTable columns={leadProductCols} data={leadByProductQ.data ?? []} searchable searchPlaceholder="Search products..." />
        )}
      </section>
    </div>
  );
}

/**
 * Custom empty-state block for tables — overrides GCDataTable's default
 * "No data found" with a tone-on-tone message specific to each table.
 */
function EmptyTableBlock({ title, subtext }: { title: string; subtext: string }) {
  return (
    <div
      style={{
        backgroundColor: "var(--gc-surface)",
        border: "1px solid var(--gc-border)",
        borderRadius: "var(--gc-radius-md)",
        padding: "var(--gc-space-6)",
        textAlign: "center",
        color: "var(--gc-text-muted)",
        fontFamily: "var(--gc-font-body)",
        fontSize: "var(--gc-text-sm)",
      }}
    >
      <div
        style={{
          fontSize: "var(--gc-text-base)",
          color: "var(--gc-text-secondary)",
          marginBottom: "var(--gc-space-2)",
        }}
      >
        {title}
      </div>
      <div>{subtext}</div>
    </div>
  );
}

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatMonthLabel(yyyymm: string): string {
  // Forge returns "YYYY-MM"; render as the 3-letter abbreviation.
  const m = /^(\d{4})-(\d{2})$/.exec(yyyymm);
  if (!m) return yyyymm;
  const idx = parseInt(m[2], 10) - 1;
  return MONTH_ABBR[idx] ?? yyyymm;
}

/**
 * Period Trend chart — replaces the previous waterfall on the left of the
 * "decomposition" row. Inline SVG bar chart with two series per month
 * (current vs prior period). Heights match CARD_STYLE so the row stays
 * visually balanced with OverrideDecompositionCard on the right.
 */
function PeriodTrendCard({
  data,
  isLoading,
  isError,
  periodLabel,
}: {
  data: PeriodTrendData | undefined;
  isLoading: boolean;
  isError: boolean;
  periodLabel: string;
}) {
  const titleStyle: React.CSSProperties = {
    fontFamily: "var(--gc-font-body)",
    fontSize: "var(--gc-text-xs)",
    fontWeight: 500,
    letterSpacing: "var(--gc-tracking-wider)",
    textTransform: "uppercase",
    color: "var(--gc-text-muted)",
  };

  const header = (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        marginBottom: "var(--gc-space-3)",
        flexShrink: 0,
      }}
    >
      <div style={titleStyle}>Revenue Trend</div>
      <div
        style={{
          fontFamily: "var(--gc-font-body)",
          fontSize: "var(--gc-text-xs)",
          color: "var(--gc-text-muted)",
        }}
      >
        {periodLabel}
      </div>
    </div>
  );

  if (isLoading) {
    return <Skeleton className="h-full w-full" style={{ minHeight: 380 }} />;
  }

  if (isError || !data) {
    return (
      <div style={{ ...CARD_STYLE, alignItems: "stretch" }}>
        {header}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-sm)",
            color: "var(--gc-text-muted)",
            textAlign: "center",
          }}
        >
          No revenue data in this period.
        </div>
      </div>
    );
  }

  // Align by month index — assume Forge returns equal-length series ordered
  // chronologically. If lengths drift, take the longer of the two as the axis.
  const months = data.current.length >= data.prior.length ? data.current : data.prior;

  if (months.length === 0) {
    return (
      <div style={{ ...CARD_STYLE, alignItems: "stretch" }}>
        {header}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-sm)",
            color: "var(--gc-text-muted)",
            textAlign: "center",
          }}
        >
          No revenue data in this period.
        </div>
      </div>
    );
  }

  const allValues = [
    ...data.current.map((p) => p.revenue),
    ...data.prior.map((p) => p.revenue),
  ];
  const max = Math.max(1, ...allValues);

  // Inline SVG dimensions. viewBox is virtual coords; SVG scales to container
  // via preserveAspectRatio="none".
  const VIEW_W = 600;
  const VIEW_H = 260;
  const PAD_X = 12;
  const PAD_TOP = 12;
  const PAD_BOTTOM = 24; // room for x-axis labels
  const innerW = VIEW_W - PAD_X * 2;
  const innerH = VIEW_H - PAD_TOP - PAD_BOTTOM;
  const groupW = innerW / months.length;
  const barGap = 2;
  const barW = Math.max(1, (groupW - barGap * 3) / 2);

  return (
    <div style={CARD_STYLE}>
      {header}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="none"
            style={{ width: "100%", height: "100%", display: "block" }}
            aria-hidden="true"
          >
            {months.map((m, i) => {
              const groupX = PAD_X + i * groupW;
              const cur = data.current[i]?.revenue ?? 0;
              const pri = data.prior[i]?.revenue ?? 0;
              const curH = (cur / max) * innerH;
              const priH = (pri / max) * innerH;
              const baseY = PAD_TOP + innerH;
              const priorX = groupX + barGap;
              const currentX = priorX + barW + barGap;
              return (
                <g key={`${m.month}-${i}`}>
                  {/* Prior period bar (muted) */}
                  <rect
                    x={priorX}
                    y={baseY - priH}
                    width={barW}
                    height={priH}
                    fill="var(--gc-text-muted)"
                    fillOpacity={0.5}
                  />
                  {/* Current period bar (gold) */}
                  <rect
                    x={currentX}
                    y={baseY - curH}
                    width={barW}
                    height={curH}
                    fill="var(--gc-gold)"
                  />
                </g>
              );
            })}
            {/* X-axis labels — every month, abbreviated to "Jan", "Feb", … */}
            {months.map((m, i) => {
              const cx = PAD_X + i * groupW + groupW / 2;
              return (
                <text
                  key={`label-${i}`}
                  x={cx}
                  y={VIEW_H - 6}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--gc-text-muted)"
                  style={{ fontFamily: "var(--gc-font-body)" }}
                >
                  {formatMonthLabel(m.month)}
                </text>
              );
            })}
          </svg>
        </div>
        {/* Legend */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--gc-space-4)",
            marginTop: "var(--gc-space-3)",
            flexShrink: 0,
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-xs)",
            color: "var(--gc-text-muted)",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              aria-hidden="true"
              style={{
                width: 10,
                height: 10,
                backgroundColor: "var(--gc-gold)",
                borderRadius: 2,
              }}
            />
            Current period
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              aria-hidden="true"
              style={{
                width: 10,
                height: 10,
                backgroundColor: "var(--gc-text-muted)",
                opacity: 0.5,
                borderRadius: 2,
              }}
            />
            Prior period
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Override Decomposition card — replaces the previous Sankey visualization.
 * Renders a vertical waterfall of override spreads down the hierarchy, with
 * proportional bars sized by each level's share of the total payout. Visual
 * rhythm intentionally mirrors the PeriodTrendCard on the left so the row
 * reads as a balanced pair.
 */
function OverrideDecompositionCard({
  data,
  isLoading,
  isError,
}: {
  data: OverrideDecompositionData | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  const titleStyle: React.CSSProperties = {
    fontFamily: "var(--gc-font-body)",
    fontSize: "var(--gc-text-xs)",
    fontWeight: 500,
    letterSpacing: "var(--gc-tracking-wider)",
    textTransform: "uppercase",
    color: "var(--gc-text-muted)",
  };

  if (isLoading) {
    // Match the CARD_STYLE minHeight (380) so the page doesn't jump on load.
    return <Skeleton className="w-full" style={{ height: 380 }} />;
  }

  if (isError || !data) {
    return (
      <div style={{ ...CARD_STYLE, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ ...titleStyle, marginBottom: "var(--gc-space-2)" }}>Override Decomposition</div>
        <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
          No override decomposition data yet.
        </div>
      </div>
    );
  }

  const { premiumTotal, totalPaidOut, levels, isExample, periodLabel } = data;

  // Header pinned (always rendered above scroll area)
  const header = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--gc-space-4)", flexShrink: 0 }}>
      <div style={titleStyle}>Override Decomposition</div>
      {isExample && (
        <Badge
          variant="outline"
          style={{
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-xs)",
            color: "var(--gc-text-muted)",
            borderColor: "var(--gc-border)",
            backgroundColor: "var(--gc-surface-2)",
          }}
        >
          Example data
        </Badge>
      )}
    </div>
  );

  // Premium row (top, no bar)
  const premiumRow = (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: "var(--gc-space-3) 0",
        borderBottom: "1px solid var(--gc-border-subtle)",
        flexShrink: 0,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-sm)",
            fontWeight: 500,
            color: "var(--gc-text-primary)",
          }}
        >
          Premium Written
        </div>
        <div
          style={{
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-xs)",
            color: "var(--gc-text-muted)",
            marginTop: 2,
          }}
        >
          {periodLabel}
        </div>
      </div>
      <div
        style={{
          fontFamily: "var(--gc-font-display)",
          fontSize: "var(--gc-text-xl)",
          fontWeight: 600,
          color: "var(--gc-gold)",
        }}
      >
        {formatCurrency(premiumTotal)}
      </div>
    </div>
  );

  // Empty state for levels
  const levelsContent = levels.length === 0 ? (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--gc-font-body)",
        fontSize: "var(--gc-text-sm)",
        color: "var(--gc-text-muted)",
        padding: "var(--gc-space-6) 0",
      }}
    >
      No override activity in this period.
    </div>
  ) : (
    <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
      {levels.map((level, i) => {
        // Pick a color tone per row: founder/top = gold, mid = gold-bright tint
        // (which is the closest existing token to "bronze" in this palette),
        // bottom = muted text color used for de-emphasized bars.
        const isTop = i === 0;
        const isBottom = i === levels.length - 1;
        const barColor = isTop
          ? "var(--gc-gold)"
          : isBottom
          ? "var(--gc-text-muted)"
          : "var(--gc-gold-bright)";
        const widthPct = `${Math.max(2, Math.min(100, level.shareOfTotal * 100))}%`;

        return (
          <Link
            key={`${level.agentUserId}-${i}`}
            href={`/hcms/agents/${level.agentUserId}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--gc-space-3)",
              padding: "var(--gc-space-3) var(--gc-space-2)",
              borderBottom: "1px solid var(--gc-border-subtle)",
              textDecoration: "none",
              color: "inherit",
              cursor: "pointer",
              transition: "background-color 0.15s",
            }}
            className="hover:bg-[var(--gc-surface-2)]"
          >
            {/* Left text block (~40%) */}
            <div style={{ flex: "0 0 40%", minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--gc-font-body)",
                  fontSize: "var(--gc-text-sm)",
                  fontWeight: 500,
                  color: "var(--gc-text-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <span style={{ color: "var(--gc-text-muted)", marginRight: 4 }}>↳</span>
                {level.name}
              </div>
              <div
                style={{
                  fontFamily: "var(--gc-font-body)",
                  fontSize: "var(--gc-text-xs)",
                  color: "var(--gc-text-muted)",
                  marginTop: 2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {level.hierarchyTitle} · {level.contractLevel}% contract · {level.spreadPct}% spread
              </div>
            </div>

            {/* Middle proportional bar (~40%) */}
            <div
              style={{
                flex: "0 0 40%",
                height: 8,
                backgroundColor: "var(--gc-border-subtle)",
                borderRadius: "var(--gc-radius-xs)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: widthPct,
                  height: "100%",
                  backgroundColor: barColor,
                  borderRadius: "var(--gc-radius-xs)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            {/* Right value (~20%) */}
            <div
              style={{
                flex: "0 0 calc(20% - var(--gc-space-3) * 2)",
                textAlign: "right",
                fontFamily: "var(--gc-font-display)",
                fontSize: "var(--gc-text-base)",
                fontWeight: 600,
                color: "var(--gc-text-primary)",
              }}
            >
              {formatCurrency(level.overrideAmount)}
            </div>
          </Link>
        );
      })}
    </div>
  );

  // Footer total row (pinned)
  const totalRow = (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: "var(--gc-space-3) 0 0",
        borderTop: "1px solid var(--gc-border)",
        marginTop: "var(--gc-space-2)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontFamily: "var(--gc-font-body)",
          fontSize: "var(--gc-text-sm)",
          fontWeight: 600,
          color: "var(--gc-text-primary)",
          textTransform: "uppercase",
          letterSpacing: "var(--gc-tracking-wide)",
        }}
      >
        Total Paid Out
      </div>
      <div
        style={{
          fontFamily: "var(--gc-font-display)",
          fontSize: "var(--gc-text-lg)",
          fontWeight: 600,
          color: "var(--gc-gold)",
        }}
      >
        {formatCurrency(totalPaidOut)}
      </div>
    </div>
  );

  return (
    <div style={CARD_STYLE}>
      {header}
      {premiumRow}
      {levelsContent}
      {totalRow}
    </div>
  );
}
