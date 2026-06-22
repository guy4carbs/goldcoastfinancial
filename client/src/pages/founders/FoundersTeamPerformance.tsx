import { useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  GCPageHeader,
  GCKPICard,
  GCDataTable,
  GCStatusBadge,
  GCBarChart,
  GCAreaChart,
  GCPeriodSelector,
  type Column,
} from "@/components/gc";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber, formatPct } from "./utils/format";
import { TOUR } from "@/lib/tour/selectors";

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
};

// Gold focus + hover ring for KPI tiles. Mirrors Revenue / Growth / Book.
const KPI_LINK_CLASS =
  "block rounded-md transition-shadow hover:ring-2 hover:ring-[var(--gc-gold-bright,var(--gc-gold))] focus-visible:ring-2 focus-visible:ring-[var(--gc-gold)]";

interface KPIs {
  activeAgents: number;
  avgQuotaAttainment: number;
  topTeamName: string;
  topTeamRevenue: number;
  teamsOnTrack: number;
  totalTeams: number;
}
interface Team {
  id: string;
  name: string;
  manager: { firstName: string; lastName: string };
  agentCount: number;
  // Canonical shape matches server/routes/founders-teams.ts:114-128.
  totalPremium?: number;
  pipelineValue?: number;
  revenueLast30?: number;
  conversionRate?: number;
  retentionRate?: number | null;
  quotaAttainment?: number;
  status?: "on-track" | "at-risk" | "behind";
}
interface AgentRanking {
  id: string;
  firstName: string;
  lastName: string;
  team: string;
  quotaAttainment: number;
  revenueMtd: number;
  complianceScore: number;
  status: string;
}
interface TrendRow {
  month: string;
  [team: string]: string | number;
}

function tierFor(qa: number): { label: string; color: string } {
  if (qa >= 110) return { label: "Elite", color: "var(--gc-status-active)" };
  if (qa >= 90) return { label: "Proven", color: "var(--gc-gold)" };
  if (qa >= 70) return { label: "Rising", color: "var(--gc-status-review)" };
  return { label: "New", color: "var(--gc-text-muted)" };
}

// Sourced from gc-tokens.css --gc-chart-1..5 (matches identical values across
// all theme variants). Mirrors the chart palette used in Growth and Dashboard.
const TEAM_COLORS = [
  "var(--gc-chart-1)",
  "var(--gc-chart-2)",
  "var(--gc-chart-3)",
  "var(--gc-chart-4)",
  "var(--gc-chart-5)",
];

export default function FoundersTeamPerformance() {
  const [period, setPeriod] = useState<string>("ytd");

  // NOTE: queryClient's default fetcher uses queryKey[0] as the URL verbatim.
  // To pass period to the server we have to embed it directly in the URL —
  // the second queryKey entry is a cache-discriminator only. (Pattern from
  // FoundersGrowth.tsx:97-103.)
  const kpiQ = useQuery<KPIs>({
    queryKey: [`/api/founders/teams/kpis?period=${period}`, period],
    staleTime: 60_000,
    retry: 1,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const teamsQ = useQuery<Team[]>({
    queryKey: [`/api/founders/teams?period=${period}`, period],
    staleTime: 60_000,
    retry: 1,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  // Trends always shows a 6-month rolling window — period is ignored by
  // Forge's contract for this endpoint.
  const trendsQ = useQuery<TrendRow[]>({
    queryKey: ["/api/founders/teams/trends?months=6"],
    staleTime: 60_000,
    retry: 1,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  // Page-level error guard — only blank out if EVERY core query errors.
  // (Pattern from FoundersRevenue.tsx:156-173.) Per-team agents queries are
  // intentionally excluded — they fan out by team count and would over-trigger.
  const allErrored = !!(kpiQ.error && teamsQ.error && trendsQ.error);
  const firstError = kpiQ.error || teamsQ.error || trendsQ.error;

  if (allErrored) {
    return (
      <div className="py-8 text-center">
        <div
          style={{
            fontFamily: "var(--gc-font-display)",
            fontSize: "var(--gc-text-lg)",
            color: "var(--gc-status-terminated)",
          }}
        >
          Unable to load team performance
        </div>
        {firstError && (
          <div
            className="mt-2"
            style={{ color: "var(--gc-text-muted)", fontSize: "var(--gc-text-sm)" }}
          >
            {(firstError as Error).message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <GCPageHeader
        title="Team Performance"
        subtitle="Cross-team metrics, rankings, and productivity analysis"
        accentUnderline
        actions={
          <div className="flex items-center gap-2">
            <div data-tour-id={TOUR.FOUNDERS.TEAM_PERF.HEADER}>
              <GCPeriodSelector value={period} onChange={setPeriod} />
            </div>
            <Link
              href="/hcms/hierarchy"
              className="inline-flex items-center gap-1.5 px-3 py-2"
              style={OUTLINED_BUTTON_STYLE}
            >
              Manage hierarchy
            </Link>
          </div>
        }
      />

      {/* KPI strip */}
      <section
        aria-labelledby="founders-team-perf-kpi-heading"
        className="mb-6"
        data-tour-id={TOUR.FOUNDERS.TEAM_PERF.KPI_GRID}
      >
        <h2 id="founders-team-perf-kpi-heading" className="sr-only">Team performance KPIs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiQ.isLoading || !kpiQ.data ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[116px] w-full" />
            ))
          ) : (
            <>
              <Link
                href="#agent-rankings"
                aria-label={`Active agents: ${formatNumber(kpiQ.data.activeAgents)} — jump to agent rankings`}
                className={KPI_LINK_CLASS}
              >
                <GCKPICard
                  label="Active Agents"
                  value={formatNumber(kpiQ.data.activeAgents)}
                  accentTop
                />
              </Link>
              <Link
                href="#agent-rankings"
                aria-label={`Average quota attainment: ${formatPct(kpiQ.data.avgQuotaAttainment, 1)} — jump to agent rankings`}
                className={KPI_LINK_CLASS}
              >
                <GCKPICard
                  label="Avg Quota Attainment"
                  value={formatPct(kpiQ.data.avgQuotaAttainment, 1)}
                  accentTop
                />
              </Link>
              <Link
                href="#team-comparison"
                aria-label={`Top team: ${kpiQ.data.topTeamName || "none yet"} — jump to team comparison`}
                className={KPI_LINK_CLASS}
              >
                <GCKPICard
                  label="Top Team"
                  value={kpiQ.data.topTeamName || "—"}
                  accentTop
                />
              </Link>
              <Link
                href="#team-comparison"
                aria-label={`Teams on track: ${kpiQ.data.teamsOnTrack} of ${kpiQ.data.totalTeams} — jump to team comparison`}
                className={KPI_LINK_CLASS}
              >
                <GCKPICard
                  label="Teams On Track"
                  value={`${kpiQ.data.teamsOnTrack}/${kpiQ.data.totalTeams}`}
                  accentTop
                />
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Section 1 — Team Comparison (chart + cards) */}
      <section
        id="team-comparison"
        aria-labelledby="founders-team-perf-comparison-heading"
        className="mb-4"
        data-tour-id={TOUR.FOUNDERS.TEAM_PERF.COMPARISON_CHART}
      >
        <h2 id="founders-team-perf-comparison-heading" className="mb-3" style={{ ...SECTION_LABEL_STYLE, margin: 0, marginBottom: "0.75rem" }}>
          Revenue by Team · {period.replace(/-/g, " ").toUpperCase()}
        </h2>
        {teamsQ.isLoading ? (
          <Skeleton className="h-[320px] w-full" />
        ) : teamsQ.data && teamsQ.data.length > 0 ? (
          <GCBarChart
            title="Revenue by Team"
            data={teamsQ.data.map((t) => ({ name: t.name, value: t.totalPremium || 0 }))}
            valueFormatter={formatCurrency}
          />
        ) : (
          <EmptyTableBlock
            title="No teams yet."
            subtext="Add managers via /hcms/hierarchy to populate team-level metrics."
          />
        )}
      </section>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
        data-tour-id={TOUR.FOUNDERS.TEAM_PERF.TEAM_CARDS}
      >
        {teamsQ.isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[180px] w-full" />
            ))
          : (teamsQ.data || []).map((t, i) => (
              <div
                key={t.id}
                className="gc-card p-4"
                style={{
                  borderLeftColor: TEAM_COLORS[i % TEAM_COLORS.length],
                  borderLeftWidth: 3,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    style={{
                      fontFamily: "var(--gc-font-display)",
                      fontSize: "var(--gc-text-lg)",
                      color: "var(--gc-text-primary)",
                    }}
                  >
                    {t.name}
                  </div>
                  <GCStatusBadge
                    status={
                      t.status === "on-track"
                        ? "active"
                        : t.status === "at-risk"
                        ? "pending"
                        : "terminated"
                    }
                  />
                </div>
                <div className="text-xs mb-3" style={{ color: "var(--gc-text-secondary)" }}>
                  Manager: {t.manager.firstName} {t.manager.lastName}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs" style={{ color: "var(--gc-text-muted)" }}>
                      Agents
                    </div>
                    <div className="font-semibold">{t.agentCount}</div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: "var(--gc-text-muted)" }}>
                      Revenue
                    </div>
                    <div className="font-semibold">{formatCurrency(t.totalPremium || 0)}</div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: "var(--gc-text-muted)" }}>
                      Pipeline
                    </div>
                    <div className="font-semibold">{formatCurrency(t.pipelineValue || 0)}</div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: "var(--gc-text-muted)" }}>
                      Conversion
                    </div>
                    <div className="font-semibold">{formatPct(t.conversionRate || 0)}</div>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Section 2 — Agent Rankings */}
      <section
        id="agent-rankings"
        aria-labelledby="founders-team-perf-rankings-heading"
        className="mb-6"
        data-tour-id={TOUR.FOUNDERS.TEAM_PERF.AGENT_RANKINGS_TABLE}
      >
        <h2 id="founders-team-perf-rankings-heading" className="mb-3" style={{ ...SECTION_LABEL_STYLE, margin: 0, marginBottom: "0.75rem" }}>
          Agent Rankings · {period.replace(/-/g, " ").toUpperCase()}
        </h2>
        {teamsQ.isLoading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : (
          <AgentRankings teams={teamsQ.data || []} period={period} />
        )}
      </section>

      {/* Section 3 — Monthly Revenue Trends */}
      <section
        id="trends"
        aria-labelledby="founders-team-perf-trends-heading"
        className="mb-6"
        data-tour-id={TOUR.FOUNDERS.TEAM_PERF.TRENDS_CHART}
      >
        <div
          className="mb-3"
          style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}
        >
          <h2 id="founders-team-perf-trends-heading" style={{ ...SECTION_LABEL_STYLE, margin: 0 }}>Monthly Revenue Trends</h2>
          <div
            style={{
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-xs)",
              color: "var(--gc-text-muted)",
            }}
          >
            Rolling 6 months · period filter does not apply
          </div>
        </div>
        {trendsQ.isLoading ? (
          <Skeleton className="h-[320px] w-full" />
        ) : trendsQ.data && trendsQ.data.length > 0 ? (
          <GCAreaChart
            title="6-Month Revenue Trend"
            data={trendsQ.data.map((r) => ({
              label: String(r.month),
              value: Number(Object.values(r).filter((v) => typeof v === "number")[0] || 0),
            }))}
            valueFormatter={formatCurrency}
          />
        ) : (
          <EmptyTableBlock
            title="No revenue history yet."
            subtext="Once teams begin booking premium, the 6-month trend will populate here."
          />
        )}
      </section>

      {/* Section 4 — Team Details (per-team accordion) */}
      <section
        id="team-details"
        aria-labelledby="founders-team-perf-details-heading"
        className="mb-6"
        data-tour-id={TOUR.FOUNDERS.TEAM_PERF.TEAM_DETAILS}
      >
        <h2 id="founders-team-perf-details-heading" className="mb-3" style={{ ...SECTION_LABEL_STYLE, margin: 0, marginBottom: "0.75rem" }}>
          Team Details · {period.replace(/-/g, " ").toUpperCase()}
        </h2>
        {teamsQ.isLoading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : !teamsQ.data || teamsQ.data.length === 0 ? (
          <EmptyTableBlock
            title="No teams yet."
            subtext="Add managers via /hcms/hierarchy to see per-team rosters."
          />
        ) : (
          <div className="space-y-2">
            {teamsQ.data.map((t) => (
              <div key={t.id} className="gc-card">
                <button
                  onClick={() => setExpandedTeam(expandedTeam === t.id ? null : t.id)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left"
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--gc-font-display)",
                        fontSize: "var(--gc-text-md)",
                      }}
                    >
                      {t.name}
                    </div>
                    <div className="text-xs" style={{ color: "var(--gc-text-muted)" }}>
                      {t.agentCount} agents · {formatCurrency(t.totalPremium || 0)}
                    </div>
                  </div>
                  <GCStatusBadge
                    status={
                      t.status === "on-track"
                        ? "active"
                        : t.status === "at-risk"
                        ? "pending"
                        : "terminated"
                    }
                  />
                </button>
                {expandedTeam === t.id && <TeamAgents teamId={t.id} period={period} />}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AgentRankings({ teams, period }: { teams: Team[]; period: string }) {
  // Per-team agent fan-out via useQueries — handles dynamic team count safely
  // (rules-of-hooks-compatible, unlike teams.map(useQuery)). Period is part
  // of every queryKey so the entire ranking refetches when it changes.
  const queries = useQueries({
    queries: teams.map((t) => ({
      queryKey: [`/api/founders/teams/${t.id}/agents?period=${period}`, t.id, period],
      staleTime: 60_000,
      refetchInterval: 15_000,
      refetchIntervalInBackground: false,
    })),
  }) as ReturnType<typeof useQuery<AgentRanking[]>>[];
  const combined: AgentRanking[] = [];
  for (const q of queries) if (q.data) combined.push(...q.data);
  combined.sort((a, b) => b.quotaAttainment - a.quotaAttainment);

  const cols: Column<AgentRanking & { rank: number }>[] = [
    { key: "rank", label: "#", width: 60 },
    {
      key: "firstName",
      label: "Agent",
      render: (_v, r) => `${r.firstName} ${r.lastName}`,
    },
    { key: "team", label: "Team" },
    {
      key: "quotaAttainment",
      label: "Quota",
      align: "right",
      render: (v) => {
        const t = tierFor(Number(v));
        return (
          <span>
            <span style={{ color: t.color, fontWeight: 600 }}>{t.label}</span> ·{" "}
            {formatPct(Number(v))}
          </span>
        );
      },
    },
    {
      key: "revenueMtd",
      label: "Revenue MTD",
      align: "right",
      render: (v) => formatCurrency(Number(v) || 0),
    },
    {
      key: "complianceScore",
      label: "Compliance",
      align: "right",
      render: (v) => formatPct(Number(v) || 0),
    },
    { key: "status", label: "Status", render: (v) => <GCStatusBadge status={String(v)} /> },
  ];
  const ranked = combined.map((a, i) => ({ ...a, rank: i + 1 }));
  if (ranked.length === 0) {
    return (
      <EmptyTableBlock
        title="No agent data yet."
        subtext="Agent rankings will appear once teams have producing agents."
      />
    );
  }
  return (
    <GCDataTable
      columns={cols}
      data={ranked}
      searchable
      searchPlaceholder="Search agents..."
      pageSize={10}
    />
  );
}

function TeamAgents({ teamId, period }: { teamId: string; period: string }) {
  const q = useQuery<AgentRanking[]>({
    queryKey: [`/api/founders/teams/${teamId}/agents?period=${period}`, teamId, period],
    staleTime: 60_000,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });
  if (q.isLoading) {
    return (
      <div className="px-4 py-3">
        <Skeleton className="h-12" />
      </div>
    );
  }
  if (!q.data || q.data.length === 0) {
    return (
      <div className="px-4 py-3">
        <EmptyTableBlock title="No agents in this team." subtext="Roster is empty for the selected period." />
      </div>
    );
  }
  return (
    <div className="px-4 py-3 border-t" style={{ borderColor: "var(--gc-border)" }}>
      {q.data.map((a) => (
        <div key={a.id} className="flex items-center justify-between py-2 text-sm">
          <span>
            {a.firstName} {a.lastName}
          </span>
          <span style={{ color: "var(--gc-text-muted)" }}>
            {formatPct(a.quotaAttainment)} · {formatCurrency(a.revenueMtd)}
          </span>
        </div>
      ))}
    </div>
  );
}

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
