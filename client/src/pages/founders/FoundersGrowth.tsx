import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronRight, Trophy } from "lucide-react";
import {
  GCAreaChart,
  GCBarChart,
  GCPageHeader,
  GCKPICard,
  GCPeriodSelector,
} from "@/components/gc";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "./utils/format";
import { TOUR } from "@/lib/tour/selectors";

// ─── Style constants (mirror Revenue / Dashboard gold-standard) ──────────────

const OUTLINED_BUTTON_STYLE: React.CSSProperties = {
  backgroundColor: "var(--gc-surface-2)",
  border: "1px solid var(--gc-border)",
  borderRadius: "var(--gc-radius-sm)",
  color: "var(--gc-text-secondary)",
  fontFamily: "var(--gc-font-body)",
  fontSize: "var(--gc-text-sm)",
  fontWeight: 500,
  textDecoration: "none",
};

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

const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--gc-font-body)",
  fontSize: "var(--gc-text-xs)",
  fontWeight: 500,
  letterSpacing: "var(--gc-tracking-wider)",
  textTransform: "uppercase",
  color: "var(--gc-text-muted)",
  margin: 0,
};

// Canonical KPI hover affordance — mirrors Dashboard / Revenue.
const KPI_LINK_CLASS =
  "block rounded-md transition-shadow hover:ring-2 hover:ring-[var(--gc-gold-bright,var(--gc-gold))] focus-visible:ring-2 focus-visible:ring-[var(--gc-gold)]";

// ─── Contract types (mirror Forge's 5 endpoints) ─────────────────────────────

interface GrowthKPIs {
  applicantsThisPeriod: number;
  hiredThisPeriod: number;
  conversionPct: number;
  avgTimeToProductivityDays: number | null;
  periodLabel: string;
}

// Backend (foundersDemoData.ts) is the source of truth for these shapes.
interface FunnelStage {
  stage: string;
  count: number;
  color?: string;
}

interface TeamPerformance {
  id: string;
  name: string;
  manager: string;
  agents: number;
  revenue: number;
  pipeline?: number;
  conversion?: number;
  status: "on-track" | "at-risk" | "behind" | "active";
  newThisPeriod?: number;
}

interface TopPerformer {
  id: string;
  rank: number;
  name: string;
  team: string;
  revenue: number;
  deals: number;
}

interface HiringTrendPoint {
  month: string;
  hires: number;
}

const TROPHY_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

export default function FoundersGrowth() {
  const [period, setPeriod] = useState("ytd");

  // NOTE: queryClient's default fetcher uses queryKey[0] as the URL verbatim
  // (see client/src/lib/queryClient.ts line 161-180). To pass period to the
  // server we have to embed it directly in the URL — additional queryKey
  // entries are cache-discriminators only. We keep `period` as the second
  // entry so React Query still knows to refetch on change.
  const kpiQ = useQuery<GrowthKPIs>({
    queryKey: [`/api/founders/growth/kpis?period=${period}`, period],
    staleTime: 60_000,
    retry: 1,
  });

  const funnelQ = useQuery<FunnelStage[]>({
    queryKey: [`/api/founders/growth/funnel?period=${period}`, period],
    staleTime: 60_000,
    retry: 1,
  });

  // Hiring trend always shows a 6-month rolling window — period is ignored
  // by Forge's contract for this endpoint.
  const trendQ = useQuery<HiringTrendPoint[]>({
    queryKey: ["/api/founders/growth/hiring-trend?months=6"],
    staleTime: 60_000,
    retry: 1,
  });

  // Compressed Top-3 teams preview (full table lives on /founders/team-performance).
  const teamsQ = useQuery<TeamPerformance[]>({
    queryKey: ["/api/founders/growth/teams?limit=3"],
    staleTime: 60_000,
    retry: 1,
  });

  const topQ = useQuery<TopPerformer[]>({
    queryKey: [`/api/founders/growth/top-performers?period=${period}`, period],
    staleTime: 60_000,
    retry: 1,
  });

  // Hard-fail the page only if EVERY core query errors. Per-section components
  // already render their own loading/empty/error states. (Pattern from
  // FoundersRevenue.tsx:122-141.)
  const allErrored = !!(
    kpiQ.error &&
    funnelQ.error &&
    trendQ.error &&
    teamsQ.error &&
    topQ.error
  );
  const firstError =
    kpiQ.error || funnelQ.error || trendQ.error || teamsQ.error || topQ.error;

  // Resilience defaults — fall back to zeros so the KPI strip always renders.
  const kpi: GrowthKPIs = kpiQ.data ?? {
    applicantsThisPeriod: 0,
    hiredThisPeriod: 0,
    conversionPct: 0,
    avgTimeToProductivityDays: null,
    periodLabel: period,
  };

  return (
    <div>
      <div data-tour-id={TOUR.FOUNDERS.GROWTH.HEADER}>
        <GCPageHeader
          title="Growth"
          subtitle="Recruiting funnel, hiring trend, team performance"
          accentUnderline
          actions={
            <div className="flex items-center gap-2">
              <GCPeriodSelector value={period} onChange={setPeriod} />
              <Link
                href="/founders/hierarchy"
                className="inline-flex items-center gap-1.5 px-3 py-2"
                style={OUTLINED_BUTTON_STYLE}
                aria-label="Open Hierarchy page"
              >
                Manage Hierarchy
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          }
        />
      </div>

      {allErrored && (
        <div className="py-8 text-center">
          <div
            style={{
              fontFamily: "var(--gc-font-display)",
              fontSize: "var(--gc-text-lg)",
              color: "var(--gc-status-terminated)",
              marginBottom: "var(--gc-space-2)",
            }}
          >
            Unable to load growth
          </div>
          <div
            style={{
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-sm)",
              color: "var(--gc-text-muted)",
            }}
          >
            {(firstError as Error)?.message ?? "Please try again."}
          </div>
        </div>
      )}

      {/* ── 1. KPI strip — pipeline-first (4 tiles) ──────────────────────── */}
      <section className="mb-6" aria-labelledby="founders-growth-kpi-heading">
        <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--gc-space-2)" }}>
          <h2 id="founders-growth-kpi-heading" style={SECTION_LABEL_STYLE}>
            Pipeline KPIs
          </h2>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          data-tour-id={TOUR.FOUNDERS.GROWTH.KPI_GRID}
        >
          {kpiQ.isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[116px] w-full" />
            ))
          ) : (
            <>
              <Link
                href="#funnel"
                className={KPI_LINK_CLASS}
                aria-label={`Applicants this period: ${kpi.applicantsThisPeriod.toLocaleString("en-US")} — jump to funnel`}
              >
                <GCKPICard
                  label="Applicants This Period"
                  value={kpi.applicantsThisPeriod.toLocaleString("en-US")}
                  accentTop
                  tooltip={`Applications received • ${kpi.periodLabel}`}
                />
              </Link>
              <Link
                href="#hiring-trend"
                className={KPI_LINK_CLASS}
                aria-label={`Hired this period: ${kpi.hiredThisPeriod.toLocaleString("en-US")} — jump to hiring trend`}
              >
                <GCKPICard
                  label="Hired This Period"
                  value={kpi.hiredThisPeriod.toLocaleString("en-US")}
                  accentTop
                  tooltip={`Agents onboarded • ${kpi.periodLabel}`}
                />
              </Link>
              <Link
                href="#funnel"
                className={KPI_LINK_CLASS}
                aria-label={`Applicant-to-hire conversion: ${kpi.conversionPct.toFixed(1)}% — jump to funnel`}
              >
                <GCKPICard
                  label="Applicant-to-Hire %"
                  value={`${kpi.conversionPct.toFixed(1)}%`}
                  tooltip="Applicant-to-hire conversion rate"
                />
              </Link>
              <Link
                href="#hiring-trend"
                className={KPI_LINK_CLASS}
                aria-label={`Average time to productivity: ${kpi.avgTimeToProductivityDays != null ? `${kpi.avgTimeToProductivityDays} days` : "no data yet"} — jump to hiring trend`}
              >
                <GCKPICard
                  label="Avg Time-to-Productivity"
                  value={kpi.avgTimeToProductivityDays != null ? `${kpi.avgTimeToProductivityDays}d` : "—"}
                  tooltip="Average days from hire date to first deal submitted"
                />
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ── 2. Recruiting Funnel + Hiring Trend ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 items-stretch">
        <section
          id="funnel"
          className="h-full"
          aria-labelledby="founders-growth-funnel-heading"
          data-tour-id={TOUR.FOUNDERS.GROWTH.FUNNEL_CHART}
        >
          <h2 id="founders-growth-funnel-heading" className="sr-only">
            Recruiting Funnel
          </h2>
          <FunnelCard
            data={funnelQ.data}
            isLoading={funnelQ.isLoading}
            isError={!!funnelQ.error}
            periodLabel={kpi.periodLabel}
          />
        </section>
        <section
          id="hiring-trend"
          className="h-full"
          aria-labelledby="founders-growth-hiring-heading"
          data-tour-id={TOUR.FOUNDERS.GROWTH.HIRING_TREND}
        >
          <h2 id="founders-growth-hiring-heading" className="sr-only">
            Hiring Trend
          </h2>
          <HiringTrendCard
            data={trendQ.data}
            isLoading={trendQ.isLoading}
            isError={!!trendQ.error}
          />
        </section>
      </div>

      {/* ── 3. Top 3 Teams preview ───────────────────────────────────────── */}
      <section
        id="teams-preview"
        className="mb-6"
        aria-labelledby="founders-growth-teams-heading"
        data-tour-id={TOUR.FOUNDERS.GROWTH.TEAMS_TABLE}
      >
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="founders-growth-teams-heading" style={SECTION_LABEL_STYLE}>
            Top 3 Teams
          </h2>
          <Link
            href="/founders/team-performance"
            style={{
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-xs)",
              color: "var(--gc-text-muted)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
            aria-label="Open Team Performance page"
          >
            View all teams
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>
        {teamsQ.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[140px] w-full" />)}
          </div>
        ) : (teamsQ.data ?? []).length === 0 ? (
          <EmptyTableBlock
            title="No team activity in this period."
            subtext="Once teams start producing, leaders will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(teamsQ.data ?? []).slice(0, 3).map((t, i) => {
              const rankColor = i === 0 ? "var(--gc-gold)" : i === 1 ? "var(--gc-text-secondary)" : "var(--gc-text-muted)";
              return (
                <div
                  key={t.id}
                  style={{
                    backgroundColor: "var(--gc-surface)",
                    border: "1px solid var(--gc-border)",
                    borderRadius: "var(--gc-radius-md)",
                    padding: "var(--gc-space-4)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--gc-space-3)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        backgroundColor: `color-mix(in srgb, ${rankColor} 15%, transparent)`,
                        color: rankColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--gc-font-display)",
                        fontWeight: 600,
                        fontSize: "var(--gc-text-sm)",
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontFamily: "var(--gc-font-body)",
                          fontSize: "var(--gc-text-base)",
                          fontWeight: 600,
                          color: "var(--gc-text-primary)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {t.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--gc-font-body)",
                          fontSize: "var(--gc-text-xs)",
                          color: "var(--gc-text-muted)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {t.manager}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--gc-font-display)",
                      fontSize: "var(--gc-text-2xl)",
                      fontWeight: 600,
                      color: "var(--gc-gold)",
                      lineHeight: 1.1,
                    }}
                  >
                    {formatCurrency(t.revenue)}
                  </div>
                  <div
                    className="flex items-center gap-3"
                    style={{
                      fontFamily: "var(--gc-font-body)",
                      fontSize: "var(--gc-text-xs)",
                      color: "var(--gc-text-secondary)",
                    }}
                  >
                    <span>{t.agents.toLocaleString("en-US")} agents</span>
                    {typeof t.newThisPeriod === "number" && t.newThisPeriod > 0 && (
                      <>
                        <span style={{ color: "var(--gc-text-muted)" }}>·</span>
                        <span style={{ color: "var(--gc-status-active)" }}>+{t.newThisPeriod} new</span>
                      </>
                    )}
                    {typeof t.conversion === "number" && (
                      <>
                        <span style={{ color: "var(--gc-text-muted)" }}>·</span>
                        <span>{t.conversion.toFixed(0)}% conv.</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 4. Top Performers leaderboard (paginated, 25 per page) ────────── */}
      <TopPerformersSection
        data={topQ.data}
        isLoading={topQ.isLoading}
      />
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Custom empty-state block — mirrors FoundersRevenue.tsx:390-416. Used by
 * every section so the page reads consistently when a query loaded but the
 * data set is empty.
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

/**
 * Recruiting funnel — wraps GCBarChart in CARD_STYLE so it visually balances
 * with HiringTrendCard on the right.
 */
function FunnelCard({
  data,
  isLoading,
  isError,
  periodLabel,
}: {
  data: FunnelStage[] | undefined;
  isLoading: boolean;
  isError: boolean;
  periodLabel: string;
}) {
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
      <div style={SECTION_LABEL_STYLE}>Recruiting Funnel</div>
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

  if (isError || !data || data.length === 0) {
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
          No funnel activity in this period.
        </div>
      </div>
    );
  }

  // Custom funnel viz — bar widths are proportional to TOP-OF-FUNNEL count
  // (so the cascading "funnel" shape is visible), with conversion % from the
  // prior stage shown as a small overlay.
  const top = data[0]?.count || 1;
  return (
    <div style={CARD_STYLE}>
      {header}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: "var(--gc-space-3)", paddingTop: "var(--gc-space-2)" }}>
        {data.map((s, i) => {
          const widthPct = Math.max(6, Math.round((s.count / top) * 100));
          const prior = i > 0 ? data[i - 1]?.count : null;
          const conversion = prior && prior > 0 ? Math.round((s.count / prior) * 100) : null;
          const tone = s.color || "var(--gc-gold)";
          return (
            <div key={s.stage} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)" }}>
                <span style={{ color: "var(--gc-text-primary)", fontWeight: 500 }}>{s.stage}</span>
                <span style={{ color: "var(--gc-text-secondary)" }}>
                  {s.count.toLocaleString("en-US")}
                  {conversion !== null && (
                    <span style={{ marginLeft: 8, color: "var(--gc-text-muted)", fontSize: "var(--gc-text-xs)" }}>
                      {conversion}% of prior
                    </span>
                  )}
                </span>
              </div>
              <div style={{ height: 10, backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${widthPct}%`,
                    height: "100%",
                    backgroundColor: tone,
                    transition: "width 200ms ease-out",
                  }}
                />
              </div>
            </div>
          );
        })}
        {data.length >= 2 && (
          <div style={{ marginTop: "var(--gc-space-2)", paddingTop: "var(--gc-space-3)", borderTop: "1px solid var(--gc-border-subtle)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", display: "flex", justifyContent: "space-between" }}>
            <span>End-to-end</span>
            <span>
              <span style={{ color: "var(--gc-text-secondary)" }}>{data[0].count.toLocaleString("en-US")}</span>
              <span style={{ margin: "0 6px" }}>→</span>
              <span style={{ color: "var(--gc-gold)", fontWeight: 600 }}>{data[data.length - 1].count.toLocaleString("en-US")}</span>
              <span style={{ marginLeft: 8 }}>
                ({data[0].count > 0 ? Math.round((data[data.length - 1].count / data[0].count) * 100) : 0}%)
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 6-month rolling hiring trend — period-independent by contract.
 */
function HiringTrendCard({
  data,
  isLoading,
  isError,
}: {
  data: HiringTrendPoint[] | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
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
      <div style={SECTION_LABEL_STYLE}>Hiring Trend</div>
      <div
        style={{
          fontFamily: "var(--gc-font-body)",
          fontSize: "var(--gc-text-xs)",
          color: "var(--gc-text-muted)",
        }}
      >
        Last 6 months
      </div>
    </div>
  );

  if (isLoading) {
    return <Skeleton className="h-full w-full" style={{ minHeight: 380 }} />;
  }

  if (isError || !data || data.length === 0) {
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
          No hiring activity in the last 6 months.
        </div>
      </div>
    );
  }

  return (
    <div style={CARD_STYLE}>
      {header}
      <div style={{ flex: 1, minHeight: 0 }}>
        <GCAreaChart
          data={data.map((d) => ({ label: d.month, value: d.hires }))}
          valueFormatter={(v) => v.toLocaleString("en-US")}
        />
      </div>
    </div>
  );
}

/**
 * Single leaderboard row — extracted from inline JSX to keep the parent
 * component readable. Top-3 ranks get a colored Trophy icon.
 */
/**
 * Top Performers leaderboard with 25-per-page pagination. Owns its own page
 * state so it doesn't perturb the rest of FoundersGrowth's render tree.
 */
const TOP_PERFORMERS_PAGE_SIZE = 25;
function TopPerformersSection({
  data,
  isLoading,
}: {
  data: TopPerformer[] | undefined;
  isLoading: boolean;
}) {
  const [page, setPage] = useState(0);
  const list = data ?? [];
  const pageCount = Math.max(1, Math.ceil(list.length / TOP_PERFORMERS_PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * TOP_PERFORMERS_PAGE_SIZE;
  const visible = list.slice(start, start + TOP_PERFORMERS_PAGE_SIZE);

  return (
    <section
      id="top-performers"
      aria-labelledby="founders-growth-top-heading"
      data-tour-id={TOUR.FOUNDERS.GROWTH.TOP_PERFORMERS}
    >
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="founders-growth-top-heading" style={SECTION_LABEL_STYLE}>
          Top Performers
        </h2>
        {list.length > 0 && (
          <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>
            {start + 1}–{Math.min(start + TOP_PERFORMERS_PAGE_SIZE, list.length)} of {list.length}
          </div>
        )}
      </div>
      {isLoading ? (
        <Skeleton className="h-[320px] w-full" />
      ) : list.length === 0 ? (
        <EmptyTableBlock
          title="No top performers in this period."
          subtext="Once agents start producing, leaderboards will populate here."
        />
      ) : (
        <>
          <div
            style={{
              backgroundColor: "var(--gc-surface)",
              border: "1px solid var(--gc-border)",
              borderRadius: "var(--gc-radius-md)",
              overflow: "hidden",
            }}
          >
            {visible.map((p, i) => (
              <PerformerRow key={p.id} performer={p} isLast={i === visible.length - 1} />
            ))}
          </div>
          {pageCount > 1 && (
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="inline-flex items-center px-3 py-2"
                style={{ ...OUTLINED_BUTTON_STYLE, cursor: safePage === 0 ? "not-allowed" : "pointer", opacity: safePage === 0 ? 0.5 : 1 }}
              >
                Previous
              </button>
              <div
                style={{
                  fontFamily: "var(--gc-font-body)",
                  fontSize: "var(--gc-text-sm)",
                  color: "var(--gc-text-muted)",
                  padding: "0 var(--gc-space-2)",
                }}
              >
                Page {safePage + 1} of {pageCount}
              </div>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={safePage === pageCount - 1}
                className="inline-flex items-center px-3 py-2"
                style={{ ...OUTLINED_BUTTON_STYLE, cursor: safePage === pageCount - 1 ? "not-allowed" : "pointer", opacity: safePage === pageCount - 1 ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function PerformerRow({ performer, isLast }: { performer: TopPerformer; isLast: boolean }) {
  const trophyColor = performer.rank <= 3 ? TROPHY_COLORS[performer.rank - 1] : null;
  return (
    <div
      className="flex items-center gap-4 px-4 py-3"
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--gc-border-subtle)",
      }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          backgroundColor: trophyColor
            ? `color-mix(in srgb, ${trophyColor} 20%, transparent)`
            : "var(--gc-surface-2)",
          border: trophyColor
            ? `1px solid color-mix(in srgb, ${trophyColor} 50%, transparent)`
            : "1px solid var(--gc-border)",
        }}
      >
        {trophyColor ? (
          <Trophy
            className="w-4 h-4"
            style={{ color: trophyColor }}
            role="img"
            aria-label={`Rank ${performer.rank} trophy`}
          />
        ) : (
          <span
            style={{
              fontFamily: "var(--gc-font-display)",
              fontSize: "var(--gc-text-sm)",
              fontWeight: 600,
              color: "var(--gc-text-secondary)",
            }}
          >
            {performer.rank}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          style={{
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-sm)",
            fontWeight: 500,
            color: "var(--gc-text-primary)",
          }}
        >
          {performer.name}
        </div>
        <div
          style={{
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-xs)",
            color: "var(--gc-text-muted)",
          }}
        >
          {performer.team}
        </div>
      </div>
      <div
        style={{
          fontFamily: "var(--gc-font-body)",
          fontSize: "var(--gc-text-xs)",
          color: "var(--gc-text-secondary)",
          minWidth: 80,
          textAlign: "right",
        }}
      >
        {performer.deals} deals
      </div>
      <div
        style={{
          fontFamily: "var(--gc-font-display)",
          fontSize: "var(--gc-text-base)",
          fontWeight: 600,
          color: "var(--gc-gold)",
          minWidth: 100,
          textAlign: "right",
        }}
      >
        {formatCurrency(performer.revenue)}
      </div>
    </div>
  );
}
