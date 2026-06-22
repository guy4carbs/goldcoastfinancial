/**
 * FoundersDashboard — owner overview built from 10 governed sections, each
 * wired to its own server endpoint with independent loading / empty / error
 * states. The page only "hard fails" when EVERY query errors at once;
 * individual section failures are absorbed locally so the rest of the
 * dashboard keeps rendering.
 *
 * Section order (matches Compass + Lumen spec):
 *   1.  Header                 — period selector + Manage Goals + Open Revenue
 *   2.  KPI Strip              — Revenue / Active Agents / Founder Profit / Cash
 *   3.  At a Glance            — sparkline + 4 stat tiles
 *   4.  Top Performers         — 5-row leaderboard (NEW)
 *   5.  Attention + Goals      — 2-col with edit-goals pencil
 *   6.  Onboarding Pipeline    — 4-bucket horizontal funnel (NEW)
 *   7.  Carrier Velocity       — period delta + per-carrier table (NEW)
 *   8.  Compliance Posture     — 5 metrics with status dot + word
 *   9.  Cash Flow              — total + per-account list / connect CTA (NEW)
 *  10.  Recent Activity        — chronological feed
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  ChevronRight,
  ExternalLink,
  CheckCircle,
  Pencil,
  Clock,
  ArrowRight,
  Trophy,
  Banknote,
} from "lucide-react";
import {
  GCPeriodSelector,
  GCPageHeader,
  GCKPICard,
} from "@/components/gc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "./utils/format";
import { TOUR } from "@/lib/tour/selectors";
import { ManageGoalsModal } from "@/components/founders/ManageGoalsModal";
import { CashBalanceModal } from "@/components/founders/CashBalanceModal";

// ─── Contract types (mirror Forge's endpoints) ───────────────────────────────

interface DashboardKPIs {
  revenue: number;
  activeAgents: number;
  cashPosition: number | null;
  founderProfit: number;
  leadProfit: number;
  periodLabel: string;
}

interface AtAGlanceData {
  sparkline: { date: string; value: number }[];
  newDeals: number;
  overrideIncome: number;
  leadProfit: number;
  newAgents: number;
  periodLabel: string;
}

type AttentionUrgency = "high" | "medium" | "low";

interface AttentionItem {
  id: string;
  kind: string;
  title: string;
  count: number;
  href: string;
  urgency: AttentionUrgency;
}

interface QuarterlyGoal {
  label: string;
  current: number;
  target: number;
  pct: number;
  unit: "currency" | "count" | "percent" | string;
}

interface RecentActivityItem {
  id: string;
  ts: string;
  kind: string;
  title: string;
  href: string | null;
}

interface ComplianceData {
  activeLicenses: { current: number; total: number };
  eoCurrent: { pct: number };
  pendingBackgroundChecks: { count: number };
  overdueTraining: { count: number };
  ceExpirationsSoon?: { count: number };
  isExample: boolean;
}

interface TopPerformer {
  rank: number;
  userId: string;
  name: string;
  dbaType?: string | null;
  isBusinessEntity?: boolean;
  deals: number;
  totalPremium: number;
  href: string;
}

interface PipelineBucket {
  key: string;
  label: string;
  count: number;
  kind: "new" | "in-review" | "appointed" | "active" | string;
  href: string;
}

interface OnboardingPipelineData {
  buckets: PipelineBucket[];
  periodLabel?: string;
}

interface CarrierVelocityRow {
  carrier: string;
  count: number;
}

interface CarrierVelocityData {
  currentTotal: number;
  prevTotal: number;
  deltaPct: number;
  byCarrier: CarrierVelocityRow[];
  periodLabel: string;
}

interface CashFlowAccount {
  accountLabel: string;
  last4: string;
  balanceCents: number;
  asOfDate?: string;
}

interface CashFlowData {
  totalCents: number | null;
  accounts: CashFlowAccount[];
  isExample?: boolean;
}

// ─── Local helpers ───────────────────────────────────────────────────────────

/** Compact currency: $1.88M / $42.3K / $750. Used by KPI tiles to avoid
 *  truncation on narrow viewports. Drill-in pages still show full precision. */
function formatCurrencyCompact(amount: number | null | undefined): string {
  if (amount == null) return "—";
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return formatCurrency(amount);
}

/** Compact label for the period selector value — used by PeriodChip. */
function compactPeriodLabel(period: string): string {
  switch (period) {
    case "ytd":
      return "YTD";
    case "mtd":
      return "MTD";
    case "qtd":
      return "QTD";
    case "wtd":
      return "WTD";
    case "today":
      return "Today";
    case "30d":
    case "last30":
      return "Last 30d";
    case "90d":
    case "last90":
      return "Last 90d";
    case "12m":
    case "last12m":
      return "Last 12mo";
    default:
      return period.toUpperCase();
  }
}

/** Compact relative time — "just now", "12m ago", "2h ago", etc. */
function formatRelativeTime(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 45) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}w ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  const yr = Math.floor(day / 365);
  return `${yr}y ago`;
}

/** Format a goal value using its declared unit. */
function formatGoalValue(v: number, unit: QuarterlyGoal["unit"]): string {
  if (unit === "currency") return formatCurrency(v);
  if (unit === "percent") return `${v.toFixed(1)}%`;
  return v.toLocaleString("en-US");
}

/** Format goal "current / target" line, with optional suffix for count units. */
function formatGoalProgress(
  current: number,
  target: number,
  unit: QuarterlyGoal["unit"],
  label: string,
): string {
  const c = formatGoalValue(current, unit);
  const t = formatGoalValue(target, unit);
  if (unit === "count") {
    const tail = label.split(/\s+/).pop()?.toLowerCase();
    if (tail && tail.length > 2) return `${c} / ${t} ${tail}`;
  }
  return `${c} / ${t}`;
}

// ─── Canonical primitives ────────────────────────────────────────────────────

const CARD_STYLE: React.CSSProperties = {
  backgroundColor: "var(--gc-surface)",
  border: "1px solid var(--gc-border)",
  borderRadius: "var(--gc-radius-md)",
  padding: "var(--gc-space-4)",
  height: "100%",
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

const GOLD_OUTLINED_BUTTON_STYLE: React.CSSProperties = {
  ...OUTLINED_BUTTON_STYLE,
  borderColor: "var(--gc-gold)",
  color: "var(--gc-gold)",
};

/** Tailwind classes added to clickable KPI Link wrappers so users get a
 *  hover affordance (gold ring) confirming the tile is interactive. The
 *  global `:focus-visible` rule in index.css handles keyboard focus. */
const KPI_LINK_CLASS =
  "block rounded-md transition-shadow hover:ring-2 hover:ring-[var(--gc-gold-bright,var(--gc-gold))] focus-visible:ring-2 focus-visible:ring-[var(--gc-gold)]";

/** Period-aware chip shown next to section headings whose data responds to
 *  the period selector. Sections that ignore period (Attention, Goals, etc.)
 *  intentionally skip this. */
function PeriodChip({ period }: { period: string }) {
  return (
    <span
      style={{
        ...SECTION_LABEL_STYLE,
        padding: "2px 8px",
        border: "1px solid var(--gc-border)",
        borderRadius: "var(--gc-radius-sm)",
        marginLeft: "var(--gc-space-2)",
        display: "inline-block",
      }}
      aria-label={`Period: ${compactPeriodLabel(period)}`}
    >
      {compactPeriodLabel(period)}
    </span>
  );
}

function EmptyTableBlock({ title, subtext }: { title: string; subtext: string }) {
  return (
    <div
      style={{
        ...CARD_STYLE,
        textAlign: "center",
        color: "var(--gc-text-muted)",
        padding: "var(--gc-space-6)",
      }}
    >
      <div
        style={{
          fontSize: "var(--gc-text-sm)",
          color: "var(--gc-text-secondary)",
          marginBottom: "var(--gc-space-1)",
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: "var(--gc-text-xs)" }}>{subtext}</div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function FoundersDashboard() {
  const [period, setPeriod] = useState("ytd");
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [cashOpen, setCashOpen] = useState(false);

  const kpiQ = useQuery<DashboardKPIs>({
    queryKey: ["/api/founders/dashboard/kpis", period],
    staleTime: 60_000,
    retry: 1,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const glanceQ = useQuery<AtAGlanceData>({
    queryKey: ["/api/founders/dashboard/at-a-glance", period],
    staleTime: 60_000,
    retry: 1,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const topPerformersQ = useQuery<TopPerformer[]>({
    queryKey: ["/api/founders/dashboard/top-performers", { period, limit: 5 }],
    queryFn: async () => {
      const res = await fetch(
        `/api/founders/dashboard/top-performers?period=${encodeURIComponent(period)}&limit=5`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return res.json();
    },
    staleTime: 60_000,
    retry: 1,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const attentionQ = useQuery<AttentionItem[]>({
    queryKey: ["/api/founders/dashboard/attention"],
    staleTime: 60_000,
    retry: 1,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const goalsQ = useQuery<QuarterlyGoal[]>({
    queryKey: ["/api/founders/dashboard/quarterly-goals"],
    staleTime: 60_000,
    retry: 1,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const pipelineQ = useQuery<OnboardingPipelineData>({
    queryKey: ["/api/founders/dashboard/onboarding-pipeline"],
    staleTime: 60_000,
    retry: 1,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const velocityQ = useQuery<CarrierVelocityData>({
    queryKey: ["/api/founders/dashboard/carrier-velocity", period],
    queryFn: async () => {
      const res = await fetch(
        `/api/founders/dashboard/carrier-velocity?period=${encodeURIComponent(period)}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return res.json();
    },
    staleTime: 60_000,
    retry: 1,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const complianceQ = useQuery<ComplianceData>({
    queryKey: ["/api/founders/dashboard/compliance"],
    staleTime: 60_000,
    retry: 1,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const cashFlowQ = useQuery<CashFlowData>({
    queryKey: ["/api/founders/dashboard/cash-flow"],
    staleTime: 60_000,
    retry: 1,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const activityQ = useQuery<RecentActivityItem[]>({
    queryKey: ["/api/founders/dashboard/recent-activity", { limit: 15 }],
    staleTime: 60_000,
    retry: 1,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  // Hard-fail the page only if EVERY query errors. Per-section components
  // already render their own loading/empty/error states.
  const allErrored = !!(
    kpiQ.error &&
    glanceQ.error &&
    topPerformersQ.error &&
    attentionQ.error &&
    goalsQ.error &&
    pipelineQ.error &&
    velocityQ.error &&
    complianceQ.error &&
    cashFlowQ.error &&
    activityQ.error
  );

  if (allErrored) {
    const firstError =
      kpiQ.error ||
      glanceQ.error ||
      topPerformersQ.error ||
      attentionQ.error ||
      goalsQ.error ||
      pipelineQ.error ||
      velocityQ.error ||
      complianceQ.error ||
      cashFlowQ.error ||
      activityQ.error;
    return (
      <div
        style={{
          ...CARD_STYLE,
          textAlign: "center",
          padding: "var(--gc-space-12)",
          color: "var(--gc-text-muted)",
        }}
        role="alert"
      >
        <div
          style={{
            fontFamily: "var(--gc-font-display)",
            fontSize: "var(--gc-text-lg)",
            color: "var(--gc-status-terminated)",
            marginBottom: "var(--gc-space-2)",
          }}
        >
          Unable to load dashboard
        </div>
        <div
          style={{
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-sm)",
          }}
        >
          {(firstError as Error)?.message ?? "Please try again."}
        </div>
      </div>
    );
  }

  // Resilience defaults — fall back to zeros so the KPI strip always renders
  // something coherent even if the endpoint is empty.
  const kpis: DashboardKPIs = kpiQ.data ?? {
    revenue: 0,
    activeAgents: 0,
    cashPosition: null,
    founderProfit: 0,
    leadProfit: 0,
    periodLabel: period,
  };

  const cashPositionLabel =
    kpis.cashPosition === null || kpis.cashPosition === undefined
      ? "—"
      : formatCurrency(kpis.cashPosition);

  return (
    <div>
      {/* ── 1. Header ──────────────────────────────────────────────────── */}
      <div data-tour-id={TOUR.FOUNDERS.DASHBOARD.HEADER}>
        <GCPageHeader
          title="Founders Dashboard"
          subtitle="Real-time overview"
          accentUnderline
          actions={
            <div className="flex items-center gap-2">
              <div data-tour-id={TOUR.FOUNDERS.DASHBOARD.PERIOD}>
                <GCPeriodSelector value={period} onChange={setPeriod} />
              </div>
              <div data-tour-id={TOUR.FOUNDERS.DASHBOARD.MANAGE_GOALS_BUTTON}>
                <button
                  type="button"
                  onClick={() => setGoalsOpen(true)}
                  style={OUTLINED_BUTTON_STYLE}
                  aria-label="Manage quarterly goals"
                >
                  <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                  Manage Goals
                </button>
              </div>
              <Link
                href="/founders/revenue"
                style={OUTLINED_BUTTON_STYLE}
                aria-label="Open Revenue page"
              >
                Open Revenue
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          }
        />
      </div>

      {/* ── 2. KPI Strip ───────────────────────────────────────────────── */}
      <section
        className="mb-6"
        aria-labelledby="founders-kpi-heading"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "var(--gc-space-2)",
          }}
        >
          <h2 id="founders-kpi-heading" style={SECTION_LABEL_STYLE}>
            Headline KPIs
          </h2>
          <PeriodChip period={period} />
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          data-tour-id={TOUR.FOUNDERS.DASHBOARD.KPI_GRID}
        >
          {kpiQ.isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[116px] w-full" />
            ))
          ) : (
            <>
              <Link
                href="/founders/revenue"
                data-tour-id={TOUR.FOUNDERS.DASHBOARD.KPI_REVENUE_YTD}
                aria-label={`Revenue ${kpis.periodLabel}: ${formatCurrency(kpis.revenue)} — open Revenue page`}
                className={KPI_LINK_CLASS}
              >
                <GCKPICard
                  label="Revenue"
                  value={formatCurrencyCompact(kpis.revenue)}
                  accentTop
                  tooltip={`Total revenue ${formatCurrency(kpis.revenue)} • ${kpis.periodLabel}`}
                />
              </Link>
              <Link
                href="/founders/hierarchy"
                data-tour-id={TOUR.FOUNDERS.DASHBOARD.KPI_ACTIVE_AGENTS}
                aria-label={`Active Agents: ${kpis.activeAgents.toLocaleString("en-US")} — open Hierarchy page`}
                className={KPI_LINK_CLASS}
              >
                <GCKPICard
                  label="Active Agents"
                  value={kpis.activeAgents.toLocaleString("en-US")}
                  tooltip="Agents who submitted deals this period"
                />
              </Link>
              <Link
                href="/founders/profit-split"
                data-tour-id={TOUR.FOUNDERS.DASHBOARD.KPI_FOUNDER_PROFIT}
                aria-label={`Founder Profit: ${formatCurrency(kpis.founderProfit)} — open Profit Split page`}
                className={KPI_LINK_CLASS}
              >
                <GCKPICard
                  label="Founder Profit"
                  value={formatCurrencyCompact(kpis.founderProfit)}
                  accentTop
                  tooltip={`Profit allocated to founders ${formatCurrency(kpis.founderProfit)} • ${kpis.periodLabel}`}
                />
              </Link>
              <div data-tour-id={TOUR.FOUNDERS.DASHBOARD.KPI_CASH_POSITION}>
                {kpis.cashPosition === null || kpis.cashPosition === undefined ? (
                  <CashKPIEmpty onConnect={() => setCashOpen(true)} />
                ) : (
                  <Link
                    href="/founders/settings#cash"
                    aria-label={`Cash Position: ${cashPositionLabel} — open Settings cash section`}
                    className={KPI_LINK_CLASS}
                  >
                    <GCKPICard
                      label="Cash Position"
                      value={formatCurrencyCompact(kpis.cashPosition)}
                      tooltip={`Aggregate balance across connected accounts (${cashPositionLabel})`}
                    />
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── 3. At a Glance ────────────────────────────────────────────── */}
      <section
        className="mb-6"
        data-tour-id={TOUR.FOUNDERS.DASHBOARD.AT_A_GLANCE}
        aria-labelledby="founders-glance-heading"
      >
        <AtAGlanceCard
          data={glanceQ.data}
          isLoading={glanceQ.isLoading}
          isError={!!glanceQ.error}
          periodLabel={glanceQ.data?.periodLabel ?? kpis.periodLabel}
          period={period}
        />
      </section>

      {/* ── 4. Attention + Quarterly Goals ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 items-stretch">
        <section
          className="h-full"
          data-tour-id={TOUR.FOUNDERS.DASHBOARD.ATTENTION}
          aria-labelledby="founders-attention-heading"
        >
          <AttentionCard
            data={attentionQ.data}
            isLoading={attentionQ.isLoading}
            isError={!!attentionQ.error}
          />
        </section>
        <section
          className="h-full"
          data-tour-id={TOUR.FOUNDERS.DASHBOARD.QUARTERLY_GOALS}
          aria-labelledby="founders-goals-heading"
        >
          <QuarterlyGoalsCard
            data={goalsQ.data}
            isLoading={goalsQ.isLoading}
            isError={!!goalsQ.error}
            onEdit={() => setGoalsOpen(true)}
          />
        </section>
      </div>

      {/* ── 5. Top Performers ─────────────────────────────────────────── */}
      <section
        className="mb-6"
        data-tour-id={TOUR.FOUNDERS.DASHBOARD.TOP_PERFORMERS}
        aria-labelledby="founders-top-performers-heading"
      >
        <TopPerformersCard
          data={topPerformersQ.data}
          isLoading={topPerformersQ.isLoading}
          isError={!!topPerformersQ.error}
          period={period}
        />
      </section>

      {/* ── 6. Onboarding Pipeline ───────────────────────────────────── */}
      <section
        className="mb-6"
        data-tour-id={TOUR.FOUNDERS.DASHBOARD.ONBOARDING_PIPELINE}
        aria-labelledby="founders-pipeline-heading"
      >
        <OnboardingPipelineCard
          data={pipelineQ.data}
          isLoading={pipelineQ.isLoading}
          isError={!!pipelineQ.error}
        />
      </section>

      {/* ── 7. Operations Health (Carrier Velocity + Compliance + Cash) ── */}
      <section
        className="mb-6"
        data-tour-id={TOUR.FOUNDERS.DASHBOARD.OPERATIONS_HEALTH}
        aria-labelledby="founders-ops-health-heading"
      >
        <h2
          id="founders-ops-health-heading"
          style={{ ...SECTION_LABEL_STYLE, marginBottom: "var(--gc-space-3)" }}
        >
          Operations Health
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          <div
            className="h-full"
            data-tour-id={TOUR.FOUNDERS.DASHBOARD.CARRIER_VELOCITY}
            aria-labelledby="founders-velocity-heading"
          >
            <CarrierVelocityCard
              data={velocityQ.data}
              isLoading={velocityQ.isLoading}
              isError={!!velocityQ.error}
              period={period}
            />
          </div>
          <div
            className="h-full"
            data-tour-id={TOUR.FOUNDERS.DASHBOARD.COMPLIANCE}
            aria-labelledby="founders-compliance-heading"
          >
            <CompliancePostureCard
              data={complianceQ.data}
              isLoading={complianceQ.isLoading}
              isError={!!complianceQ.error}
            />
          </div>
          <div
            className="h-full"
            data-tour-id={TOUR.FOUNDERS.DASHBOARD.CASH_FLOW}
            aria-labelledby="founders-cashflow-heading"
          >
            <CashFlowCard
              data={cashFlowQ.data}
              isLoading={cashFlowQ.isLoading}
              isError={!!cashFlowQ.error}
              onAddBalance={() => setCashOpen(true)}
            />
          </div>
        </div>
      </section>

      {/* ── 8. Recent Activity ───────────────────────────────────────── */}
      <section
        data-tour-id={TOUR.FOUNDERS.DASHBOARD.RECENT_ACTIVITY}
        aria-labelledby="founders-activity-heading"
      >
        <RecentActivityCard
          data={activityQ.data}
          isLoading={activityQ.isLoading}
          isError={!!activityQ.error}
        />
      </section>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      <ManageGoalsModal open={goalsOpen} onOpenChange={setGoalsOpen} />
      <CashBalanceModal open={cashOpen} onOpenChange={setCashOpen} />
    </div>
  );
}

// ─── Section: Cash KPI Empty (Connect bank fallback) ─────────────────────────

function CashKPIEmpty({ onConnect }: { onConnect: () => void }) {
  return (
    <div
      style={{
        ...CARD_STYLE,
        minHeight: 116,
        gap: "var(--gc-space-2)",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          fontFamily: "var(--gc-font-body)",
          fontSize: "var(--gc-text-xs)",
          fontWeight: 500,
          letterSpacing: "var(--gc-tracking-wider)",
          textTransform: "uppercase",
          color: "var(--gc-text-muted)",
        }}
      >
        Cash Position
      </div>
      <div
        style={{
          fontFamily: "var(--gc-font-display)",
          fontSize: "var(--gc-text-3xl)",
          fontWeight: 600,
          color: "var(--gc-text-muted)",
          lineHeight: "var(--gc-leading-tight)",
        }}
      >
        —
      </div>
      <button
        type="button"
        onClick={onConnect}
        style={{ ...GOLD_OUTLINED_BUTTON_STYLE, alignSelf: "flex-start" }}
        aria-label="Connect bank account or add manual cash balance"
      >
        <Banknote className="w-3.5 h-3.5" aria-hidden="true" />
        Connect bank
      </button>
    </div>
  );
}

// ─── Section: At a Glance ────────────────────────────────────────────────────

function AtAGlanceCard({
  data,
  isLoading,
  isError,
  periodLabel,
  period,
}: {
  data: AtAGlanceData | undefined;
  isLoading: boolean;
  isError: boolean;
  periodLabel: string;
  period: string;
}) {
  if (isLoading) {
    return <Skeleton className="w-full" style={{ minHeight: 280 }} />;
  }

  const header = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "var(--gc-space-3)",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <h2 id="founders-glance-heading" style={SECTION_LABEL_STYLE}>
          This Period at a Glance
        </h2>
        <PeriodChip period={period} />
      </div>
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

  if (isError || !data) {
    return (
      <div style={{ ...CARD_STYLE, minHeight: 280 }}>
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
          No glance data for this period.
        </div>
      </div>
    );
  }

  const stats: Array<{ label: string; value: string }> = [
    { label: "New deals", value: data.newDeals.toLocaleString("en-US") },
    { label: "Override income", value: formatCurrency(data.overrideIncome) },
    { label: "Lead profit", value: formatCurrency(data.leadProfit) },
    { label: "New agents", value: data.newAgents.toLocaleString("en-US") },
  ];

  return (
    <div style={{ ...CARD_STYLE, minHeight: 280 }}>
      {header}
      <div
        className="grid grid-cols-1 gap-4"
        style={{
          flex: 1,
          gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", minHeight: 200 }}>
          <Sparkline points={data.sparkline} />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--gc-space-4) var(--gc-space-4)",
            alignContent: "center",
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              aria-label={`${s.label}: ${s.value}`}
              role="group"
            >
              <div
                style={{
                  fontFamily: "var(--gc-font-body)",
                  fontSize: "var(--gc-text-xs)",
                  color: "var(--gc-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "var(--gc-tracking-wider)",
                  marginBottom: 2,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--gc-font-display)",
                  fontSize: "var(--gc-text-xl)",
                  fontWeight: 600,
                  color: "var(--gc-text-primary)",
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Minimal inline SVG sparkline — see prior file for design rationale. */
function Sparkline({ points }: { points: AtAGlanceData["sparkline"] }) {
  const HEIGHT = 80;
  const VIEW_W = 600;
  if (!points || points.length < 2) {
    return (
      <div
        style={{
          height: HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--gc-font-body)",
          fontSize: "var(--gc-text-xs)",
          color: "var(--gc-text-muted)",
        }}
      >
        Not enough data to chart yet.
      </div>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = points.length > 1 ? VIEW_W / (points.length - 1) : 0;
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = HEIGHT - ((p.value - min) / range) * HEIGHT;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const fillPath = `${path} L${VIEW_W},${HEIGHT} L0,${HEIGHT} Z`;
  const gradId = "gc-glance-spark";

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${HEIGHT}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: HEIGHT, display: "block" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gc-gold)" stopOpacity={0.25} />
          <stop offset="100%" stopColor="var(--gc-gold)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gradId})`} />
      <path
        d={path}
        fill="none"
        stroke="var(--gc-gold)"
        strokeWidth={1.75}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Section: Top Performers ─────────────────────────────────────────────────

function TopPerformersCard({
  data,
  isLoading,
  isError,
  period,
}: {
  data: TopPerformer[] | undefined;
  isLoading: boolean;
  isError: boolean;
  period: string;
}) {
  if (isLoading) {
    return <Skeleton className="w-full" style={{ minHeight: 320 }} />;
  }

  const header = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--gc-space-2)",
        marginBottom: "var(--gc-space-3)",
        flexShrink: 0,
      }}
    >
      <Trophy className="w-4 h-4" style={{ color: "var(--gc-gold)" }} aria-hidden="true" />
      <h2 id="founders-top-performers-heading" style={SECTION_LABEL_STYLE}>
        Top Performers
      </h2>
      <PeriodChip period={period} />
    </div>
  );

  if (isError) {
    return (
      <div style={{ ...CARD_STYLE, minHeight: 240 }}>
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
          }}
        >
          Unable to load top performers.
        </div>
      </div>
    );
  }

  const items = data ?? [];

  if (items.length === 0) {
    return (
      <div>
        {header}
        <EmptyTableBlock
          title="No deals this period."
          subtext="Once agents start writing business, the top 5 will appear here."
        />
      </div>
    );
  }

  return (
    <div style={CARD_STYLE}>
      {header}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {items.slice(0, 5).map((p) => {
          const isFirst = p.rank === 1;
          return (
            <Link
              key={p.userId}
              href={p.href}
              aria-label={`Rank ${p.rank}: ${p.name}, ${p.deals} deals, ${formatCurrency(p.totalPremium)} premium — open agent profile`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--gc-space-3)",
                padding: "var(--gc-space-3) var(--gc-space-2)",
                borderBottom: "1px solid var(--gc-border-subtle)",
                textDecoration: "none",
                color: "inherit",
              }}
              className="hover:bg-[var(--gc-surface-2)]"
            >
              <span
                aria-hidden="true"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--gc-font-display)",
                  fontSize: "var(--gc-text-sm)",
                  fontWeight: 600,
                  flexShrink: 0,
                  backgroundColor: isFirst
                    ? "color-mix(in srgb, var(--gc-gold) 18%, transparent)"
                    : "var(--gc-surface-2)",
                  color: isFirst ? "var(--gc-gold)" : "var(--gc-text-secondary)",
                  border: isFirst ? "1px solid var(--gc-gold)" : "1px solid var(--gc-border)",
                }}
              >
                {p.rank}
              </span>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--gc-space-2)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--gc-font-body)",
                    fontSize: "var(--gc-text-sm)",
                    color: "var(--gc-text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.name}
                </span>
                {p.isBusinessEntity && p.dbaType && (
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
                    {p.dbaType}
                  </Badge>
                )}
              </div>
              <div
                style={{
                  fontFamily: "var(--gc-font-body)",
                  fontSize: "var(--gc-text-xs)",
                  color: "var(--gc-text-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {p.deals.toLocaleString("en-US")} {p.deals === 1 ? "deal" : "deals"}
              </div>
              <div
                style={{
                  fontFamily: "var(--gc-font-display)",
                  fontSize: "var(--gc-text-sm)",
                  fontWeight: 600,
                  color: "var(--gc-text-primary)",
                  whiteSpace: "nowrap",
                  minWidth: 96,
                  textAlign: "right",
                }}
              >
                {formatCurrency(p.totalPremium)}
              </div>
              <ChevronRight
                className="w-4 h-4"
                style={{ color: "var(--gc-text-muted)", flexShrink: 0 }}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Section: Needs Your Attention ───────────────────────────────────────────

function AttentionCard({
  data,
  isLoading,
  isError,
}: {
  data: AttentionItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) {
    return <Skeleton className="h-full w-full" style={{ minHeight: 320 }} />;
  }

  const header = (
    <div style={{ marginBottom: "var(--gc-space-3)", flexShrink: 0 }}>
      <h2 id="founders-attention-heading" style={SECTION_LABEL_STYLE}>
        Needs Your Attention
      </h2>
    </div>
  );

  if (isError) {
    return (
      <div style={{ ...CARD_STYLE, minHeight: 320 }}>
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
          }}
        >
          Unable to load attention items.
        </div>
      </div>
    );
  }

  const items = data ?? [];

  if (items.length === 0) {
    return (
      <div style={{ ...CARD_STYLE, minHeight: 320 }}>
        {header}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--gc-space-2)",
            textAlign: "center",
          }}
        >
          <CheckCircle
            className="w-8 h-8"
            style={{ color: "var(--gc-status-active)" }}
            aria-hidden="true"
          />
          <div
            style={{
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-sm)",
              color: "var(--gc-text-muted)",
            }}
          >
            All clear. No pending decisions.
          </div>
          <Link
            href="/founders/access"
            aria-label="View decision history"
            style={{
              marginTop: "var(--gc-space-3)",
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-sm)",
              color: "var(--gc-text-muted)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            View decision history →
          </Link>
        </div>
      </div>
    );
  }

  const dotColor = (u: AttentionUrgency) =>
    u === "high"
      ? "var(--gc-status-terminated)"
      : u === "medium"
      ? "var(--gc-gold)"
      : "var(--gc-text-muted)";

  return (
    <div style={{ ...CARD_STYLE, minHeight: 320 }}>
      {header}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            aria-label={`${item.title} — ${item.urgency} priority, ${item.count} item${item.count === 1 ? "" : "s"}`}
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
            <span
              aria-hidden="true"
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: dotColor(item.urgency),
                flexShrink: 0,
              }}
            />
            <span className="sr-only">{item.urgency} priority</span>
            <div
              style={{
                flex: 1,
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-sm)",
                color: "var(--gc-text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.title}
            </div>
            <Badge
              variant="outline"
              style={{
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-xs)",
                color: "var(--gc-text-secondary)",
                borderColor: "var(--gc-border)",
                backgroundColor: "var(--gc-surface-2)",
              }}
            >
              {item.count}
            </Badge>
            <ChevronRight
              className="w-4 h-4"
              style={{ color: "var(--gc-text-muted)", flexShrink: 0 }}
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Section: Quarterly Goals ────────────────────────────────────────────────

function QuarterlyGoalsCard({
  data,
  isLoading,
  isError,
  onEdit,
}: {
  data: QuarterlyGoal[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onEdit: () => void;
}) {
  if (isLoading) {
    return <Skeleton className="h-full w-full" style={{ minHeight: 320 }} />;
  }

  const header = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "var(--gc-space-3)",
        flexShrink: 0,
      }}
    >
      <h2 id="founders-goals-heading" style={SECTION_LABEL_STYLE}>
        Quarterly Goals
      </h2>
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit quarterly goals"
        style={{
          background: "none",
          border: "none",
          padding: 4,
          cursor: "pointer",
          color: "var(--gc-text-muted)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--gc-radius-sm)",
        }}
      >
        <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  );

  if (isError) {
    return (
      <div style={{ ...CARD_STYLE, minHeight: 320 }}>
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
          }}
        >
          Unable to load quarterly goals.
        </div>
      </div>
    );
  }

  const goals = data ?? [];

  if (goals.length === 0) {
    return (
      <div style={{ ...CARD_STYLE, minHeight: 320 }}>
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
          }}
        >
          No quarterly goals set.
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...CARD_STYLE, minHeight: 320 }}>
      {header}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "var(--gc-space-4)",
        }}
      >
        {goals.map((g, i) => {
          const pct = Math.max(0, Math.min(100, g.pct));
          return (
            <div key={`${g.label}-${i}`}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: "var(--gc-space-2)",
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--gc-font-body)",
                    fontSize: "var(--gc-text-sm)",
                    fontWeight: 500,
                    color: "var(--gc-text-primary)",
                    margin: 0,
                  }}
                >
                  {g.label}
                </h3>
                <div
                  style={{
                    fontFamily: "var(--gc-font-display)",
                    fontSize: "var(--gc-text-sm)",
                    fontWeight: 600,
                    color: "var(--gc-text-primary)",
                  }}
                >
                  {formatGoalProgress(g.current, g.target, g.unit, g.label)}
                </div>
              </div>
              <div
                role="progressbar"
                aria-valuenow={Math.round(pct)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${g.label} progress`}
                style={{
                  width: "100%",
                  height: 6,
                  backgroundColor: "var(--gc-border-subtle)",
                  borderRadius: "var(--gc-radius-xs)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    backgroundColor: "var(--gc-gold)",
                    borderRadius: "var(--gc-radius-xs)",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: "var(--gc-font-body)",
                  fontSize: "var(--gc-text-xs)",
                  color: "var(--gc-text-muted)",
                  marginTop: 4,
                }}
              >
                {pct.toFixed(0)}% of target
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Section: Onboarding Pipeline ────────────────────────────────────────────

function OnboardingPipelineCard({
  data,
  isLoading,
  isError,
}: {
  data: OnboardingPipelineData | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) {
    return <Skeleton className="w-full" style={{ minHeight: 240 }} />;
  }

  const header = (
    <div style={{ marginBottom: "var(--gc-space-3)", flexShrink: 0 }}>
      <h2 id="founders-pipeline-heading" style={SECTION_LABEL_STYLE}>
        Onboarding Pipeline
      </h2>
    </div>
  );

  if (isError) {
    return (
      <div style={{ ...CARD_STYLE, minHeight: 240 }}>
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
          }}
        >
          Unable to load onboarding pipeline.
        </div>
      </div>
    );
  }

  const rawBuckets = data?.buckets ?? [];
  const allZero = rawBuckets.length === 0 || rawBuckets.every((b) => b.count === 0);

  // Even when there is no pipeline activity, we keep the 4-bucket funnel
  // shape visible so the section's information architecture stays stable
  // (and so users learn what the pipeline looks like before any agent
  // submits an application).
  const FALLBACK_BUCKETS: PipelineBucket[] = [
    { key: "new", label: "New", count: 0, kind: "new", href: "/founders/agents?status=new" },
    {
      key: "in-review",
      label: "In Review",
      count: 0,
      kind: "in-review",
      href: "/founders/agents?status=in-review",
    },
    {
      key: "appointed",
      label: "Appointed",
      count: 0,
      kind: "appointed",
      href: "/founders/agents?status=appointed",
    },
    { key: "active", label: "Active", count: 0, kind: "active", href: "/founders/agents?status=active" },
  ];
  const buckets = rawBuckets.length > 0 ? rawBuckets : FALLBACK_BUCKETS;

  const dotColor = (kind: PipelineBucket["kind"]) => {
    switch (kind) {
      case "new":
        return "var(--gc-text-muted)";
      case "in-review":
        return "var(--gc-gold)";
      case "appointed":
        return "var(--gc-status-pending, var(--gc-gold))";
      case "active":
        return "var(--gc-status-active)";
      default:
        return "var(--gc-text-muted)";
    }
  };

  return (
    <div style={CARD_STYLE}>
      {header}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch"
        style={{ flex: 1 }}
      >
        {buckets.map((b) => {
          const dim = allZero;
          const isLast = false; // funnel order is conveyed by left-to-right grid layout, no arrows needed
          return (
            <div
              key={b.key}
              className="contents"
              style={{ display: "contents" }}
            >
              <Link
                href={b.href}
                aria-label={`${b.label}: ${b.count.toLocaleString("en-US")} ${b.count === 1 ? "agent" : "agents"} — open ${b.label}`}
                style={{
                  backgroundColor: "var(--gc-surface-2)",
                  border: "1px solid var(--gc-border)",
                  borderRadius: "var(--gc-radius-md)",
                  padding: "var(--gc-space-4)",
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--gc-space-2)",
                  minHeight: 96,
                  opacity: dim ? 0.55 : 1,
                  transition: "border-color var(--gc-transition-fast)",
                }}
                className="hover:border-[var(--gc-gold)]"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--gc-space-2)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: dotColor(b.kind),
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--gc-font-body)",
                      fontSize: "var(--gc-text-xs)",
                      color: "var(--gc-text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "var(--gc-tracking-wider)",
                    }}
                  >
                    {b.label}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--gc-font-display)",
                    fontSize: "var(--gc-text-3xl)",
                    fontWeight: 600,
                    color: dim ? "var(--gc-text-muted)" : "var(--gc-text-primary)",
                    lineHeight: 1.1,
                  }}
                >
                  {b.count.toLocaleString("en-US")}
                </div>
              </Link>
              {!isLast && (
                <div
                  className="hidden lg:flex items-center justify-center"
                  aria-hidden="true"
                  style={{
                    color: "var(--gc-text-muted)",
                    fontSize: "var(--gc-text-lg)",
                    opacity: allZero ? 0.55 : 1,
                  }}
                >
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {allZero && (
        <div
          style={{
            marginTop: "var(--gc-space-3)",
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-xs)",
            color: "var(--gc-text-muted)",
          }}
        >
          No agents in onboarding yet — applicants land here when they submit /apply.
        </div>
      )}
    </div>
  );
}

// ─── Section: Carrier Appointments Velocity ──────────────────────────────────

function CarrierVelocityCard({
  data,
  isLoading,
  isError,
  period,
}: {
  data: CarrierVelocityData | undefined;
  isLoading: boolean;
  isError: boolean;
  period: string;
}) {
  if (isLoading) {
    return <Skeleton className="w-full" style={{ minHeight: 240 }} />;
  }

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
      <div style={{ display: "flex", alignItems: "center" }}>
        <h3 id="founders-velocity-heading" style={SECTION_LABEL_STYLE}>
          Carrier Appointments Velocity
        </h3>
        <PeriodChip period={period} />
      </div>
    </div>
  );

  if (isError) {
    return (
      <div style={{ ...CARD_STYLE, minHeight: 240 }}>
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
          }}
        >
          Unable to load carrier velocity.
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        {header}
        <EmptyTableBlock
          title="No carrier appointment activity."
          subtext="New carrier appointments will be tracked here."
        />
      </div>
    );
  }

  const positive = data.deltaPct >= 0;
  const deltaColor = positive ? "var(--gc-status-active)" : "var(--gc-gold)";
  const deltaSign = positive ? "+" : "";

  const sortedRows = [...(data.byCarrier ?? [])].sort((a, b) => b.count - a.count);

  return (
    <div style={CARD_STYLE}>
      {header}
      <div className="grid grid-cols-1 gap-4" style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--gc-space-2)",
          }}
        >
          <h3
            style={{
              ...SECTION_LABEL_STYLE,
              fontSize: "var(--gc-text-xs)",
            }}
          >
            New appointments
          </h3>
          <div
            style={{
              fontFamily: "var(--gc-font-display)",
              fontSize: "var(--gc-text-3xl)",
              fontWeight: 600,
              color: "var(--gc-text-primary)",
              lineHeight: 1.1,
            }}
          >
            {data.currentTotal.toLocaleString("en-US")}
          </div>
          <div
            style={{
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-sm)",
              color: deltaColor,
            }}
          >
            {deltaSign}
            {data.deltaPct.toFixed(1)}% vs prev period
          </div>
          <div
            style={{
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-xs)",
              color: "var(--gc-text-muted)",
            }}
          >
            Prev: {data.prevTotal.toLocaleString("en-US")}
          </div>
        </div>
        <div>
          <h3
            style={{
              ...SECTION_LABEL_STYLE,
              fontSize: "var(--gc-text-xs)",
              marginBottom: "var(--gc-space-2)",
            }}
          >
            Per Carrier
          </h3>
          {sortedRows.length === 0 ? (
            <div
              style={{
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-sm)",
                color: "var(--gc-text-muted)",
              }}
            >
              No carrier breakdown available.
            </div>
          ) : (
            <div role="table" aria-label="Appointments by carrier">
              {sortedRows.map((row) => (
                <div
                  key={row.carrier}
                  role="row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "var(--gc-space-2) 0",
                    borderBottom: "1px solid var(--gc-border-subtle)",
                  }}
                >
                  <span
                    role="cell"
                    style={{
                      fontFamily: "var(--gc-font-body)",
                      fontSize: "var(--gc-text-sm)",
                      color: "var(--gc-text-primary)",
                    }}
                  >
                    {row.carrier}
                  </span>
                  <span
                    role="cell"
                    style={{
                      fontFamily: "var(--gc-font-display)",
                      fontSize: "var(--gc-text-sm)",
                      fontWeight: 600,
                      color: "var(--gc-text-primary)",
                    }}
                  >
                    {row.count.toLocaleString("en-US")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section: Compliance Posture ─────────────────────────────────────────────

function CompliancePostureCard({
  data,
  isLoading,
  isError,
}: {
  data: ComplianceData | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  const headerLabel = (
    <h3 id="founders-compliance-heading" style={SECTION_LABEL_STYLE}>
      Compliance Posture
    </h3>
  );

  if (isLoading) {
    return (
      <div style={CARD_STYLE}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: "var(--gc-space-3)",
            flexShrink: 0,
          }}
        >
          {headerLabel}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "var(--gc-space-2)",
          }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-full" style={{ height: 28 }} />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div style={{ ...CARD_STYLE, minHeight: 240 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: "var(--gc-space-3)",
            flexShrink: 0,
          }}
        >
          {headerLabel}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-sm)",
            color: "var(--gc-text-muted)",
          }}
        >
          Unable to load compliance posture.
        </div>
      </div>
    );
  }

  const {
    activeLicenses,
    eoCurrent,
    pendingBackgroundChecks,
    overdueTraining,
    ceExpirationsSoon,
    isExample,
  } = data;

  const licenseRatio =
    activeLicenses.total > 0 ? activeLicenses.current / activeLicenses.total : 0;
  const licenseStatus: ComplianceStatus =
    activeLicenses.current === activeLicenses.total
      ? "ok"
      : licenseRatio >= 0.95
      ? "warn"
      : "bad";

  const eoStatus: ComplianceStatus =
    eoCurrent.pct === 100 ? "ok" : eoCurrent.pct >= 95 ? "warn" : "bad";

  const bgCount = pendingBackgroundChecks.count;
  const bgStatus: ComplianceStatus = bgCount === 0 ? "ok" : bgCount <= 2 ? "warn" : "bad";

  const trainingCount = overdueTraining.count;
  const trainingStatus: ComplianceStatus =
    trainingCount === 0 ? "ok" : trainingCount <= 2 ? "warn" : "bad";

  const ceCount = ceExpirationsSoon?.count ?? 0;
  const ceStatus: ComplianceStatus = ceCount === 0 ? "ok" : ceCount <= 5 ? "warn" : "bad";

  const rows: Array<{
    label: string;
    value: string;
    status: ComplianceStatus;
  }> = [
    {
      label: "Active licenses",
      value: `${activeLicenses.current} / ${activeLicenses.total}`,
      status: licenseStatus,
    },
    {
      label: "E&O current",
      value: `${eoCurrent.pct.toFixed(0)}%`,
      status: eoStatus,
    },
    {
      label: "Pending background checks",
      value: bgCount.toLocaleString("en-US"),
      status: bgStatus,
    },
    {
      label: "Overdue training",
      value: trainingCount.toLocaleString("en-US"),
      status: trainingStatus,
    },
    {
      label: "CE expirations soon",
      value: ceCount.toLocaleString("en-US"),
      status: ceStatus,
    },
  ];

  return (
    <div style={CARD_STYLE}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: "var(--gc-space-3)",
          flexShrink: 0,
        }}
      >
        {headerLabel}
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {rows.map((r) => (
          <div
            key={r.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--gc-space-3)",
              padding: "var(--gc-space-3) var(--gc-space-2)",
              borderBottom: "1px solid var(--gc-border-subtle)",
            }}
          >
            <div
              style={{
                flex: 1,
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-sm)",
                color: "var(--gc-text-primary)",
              }}
            >
              {r.label}
            </div>
            <div
              style={{
                fontFamily: "var(--gc-font-display)",
                fontSize: "var(--gc-text-sm)",
                fontWeight: 600,
                color: "var(--gc-text-primary)",
              }}
            >
              {r.value}
            </div>
            <ComplianceDot status={r.status} />
            <span
              style={{
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-xs)",
                color: complianceWordColor(r.status),
                minWidth: 56,
              }}
            >
              {complianceWord(r.status)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

type ComplianceStatus = "ok" | "warn" | "bad";

function complianceColor(s: ComplianceStatus) {
  return s === "ok"
    ? "var(--gc-status-active)"
    : s === "warn"
    ? "var(--gc-gold)"
    : "var(--gc-status-terminated)";
}

function complianceWord(s: ComplianceStatus): string {
  return s === "ok" ? "Healthy" : s === "warn" ? "Watch" : "At risk";
}

function complianceWordColor(s: ComplianceStatus) {
  return complianceColor(s);
}

function ComplianceDot({ status }: { status: ComplianceStatus }) {
  return (
    <>
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: complianceColor(status),
          flexShrink: 0,
        }}
      />
      <span className="sr-only">{complianceWord(status)}</span>
    </>
  );
}

// ─── Section: Cash Flow ──────────────────────────────────────────────────────

function CashFlowCard({
  data,
  isLoading,
  isError,
  onAddBalance,
}: {
  data: CashFlowData | undefined;
  isLoading: boolean;
  isError: boolean;
  onAddBalance: () => void;
}) {
  if (isLoading) {
    return <Skeleton className="w-full" style={{ minHeight: 240 }} />;
  }

  const header = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "var(--gc-space-3)",
        flexShrink: 0,
      }}
    >
      <h3 id="founders-cashflow-heading" style={SECTION_LABEL_STYLE}>
        Cash Flow
      </h3>
      <button
        type="button"
        onClick={onAddBalance}
        aria-label="Update cash balance"
        style={{
          background: "none",
          border: "none",
          padding: 4,
          cursor: "pointer",
          color: "var(--gc-text-muted)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--gc-radius-sm)",
        }}
      >
        <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  );

  if (isError) {
    return (
      <div style={{ ...CARD_STYLE, minHeight: 240 }}>
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
          }}
        >
          Unable to load cash flow.
        </div>
      </div>
    );
  }

  // Null total → connect-bank empty CTA card.
  if (!data || data.totalCents === null || data.totalCents === undefined) {
    return (
      <div style={{ ...CARD_STYLE, minHeight: 240 }}>
        {header}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--gc-space-3)",
            textAlign: "center",
            padding: "var(--gc-space-4)",
          }}
        >
          <Banknote
            className="w-8 h-8"
            style={{ color: "var(--gc-text-muted)" }}
            aria-hidden="true"
          />
          <div
            style={{
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-sm)",
              color: "var(--gc-text-secondary)",
            }}
          >
            Connect a bank account to start tracking cash position.
          </div>
          <div style={{ display: "flex", gap: "var(--gc-space-2)" }}>
            <Link
              href="/founders/profit-split#plaid"
              style={GOLD_OUTLINED_BUTTON_STYLE}
              aria-label="Connect bank via Plaid"
            >
              Connect bank
            </Link>
            <button
              type="button"
              onClick={onAddBalance}
              style={OUTLINED_BUTTON_STYLE}
              aria-label="Add manual cash balance entry"
            >
              Add Manual Balance
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalUsd = data.totalCents / 100;

  return (
    <div style={CARD_STYLE}>
      {header}
      <div
        style={{
          fontFamily: "var(--gc-font-display)",
          fontSize: "var(--gc-text-3xl)",
          fontWeight: 600,
          color: "var(--gc-text-primary)",
          lineHeight: 1.1,
          marginBottom: "var(--gc-space-3)",
        }}
        aria-label={`Total cash position: ${formatCurrency(totalUsd)}`}
      >
        {formatCurrency(totalUsd)}
      </div>
      {data.accounts && data.accounts.length > 0 ? (
        <div role="list" aria-label="Bank accounts">
          {data.accounts.map((a, idx) => (
            <div
              key={`${a.accountLabel}-${a.last4}-${idx}`}
              role="listitem"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "var(--gc-space-2) 0",
                borderBottom: "1px solid var(--gc-border-subtle)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--gc-font-body)",
                    fontSize: "var(--gc-text-sm)",
                    color: "var(--gc-text-primary)",
                  }}
                >
                  {a.accountLabel}
                </span>
                <span
                  style={{
                    fontFamily: "var(--gc-font-body)",
                    fontSize: "var(--gc-text-xs)",
                    color: "var(--gc-text-muted)",
                  }}
                >
                  •••• {a.last4}
                  {a.asOfDate ? ` · as of ${a.asOfDate}` : ""}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--gc-font-display)",
                  fontSize: "var(--gc-text-sm)",
                  fontWeight: 600,
                  color: "var(--gc-text-primary)",
                }}
              >
                {formatCurrency(a.balanceCents / 100)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-sm)",
            color: "var(--gc-text-muted)",
          }}
        >
          No account-level breakdown available.
        </div>
      )}
    </div>
  );
}

// ─── Section: Recent Activity ────────────────────────────────────────────────

function RecentActivityCard({
  data,
  isLoading,
  isError,
}: {
  data: RecentActivityItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  const header = (
    <div className="mb-3">
      <h2 id="founders-activity-heading" style={SECTION_LABEL_STYLE}>
        Recent Activity
      </h2>
    </div>
  );

  if (isLoading) {
    return (
      <div>
        {header}
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[44px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  const items = data ?? [];

  const cardWrap: React.CSSProperties = {
    backgroundColor: "var(--gc-surface)",
    border: "1px solid var(--gc-border)",
    borderRadius: "var(--gc-radius-md)",
    overflow: "hidden",
  };

  if (isError) {
    return (
      <div>
        {header}
        <div
          style={{
            ...cardWrap,
            padding: "var(--gc-space-6)",
            textAlign: "center",
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-sm)",
            color: "var(--gc-text-muted)",
          }}
        >
          Unable to load recent activity.
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        {header}
        <div
          style={{
            ...cardWrap,
            padding: "var(--gc-space-6)",
            textAlign: "center",
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-sm)",
            color: "var(--gc-text-muted)",
          }}
        >
          No recent activity yet — submitted deals and lead conversions appear here in real time.
        </div>
      </div>
    );
  }

  return (
    <div>
      {header}
      <ul style={{ ...cardWrap, listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((item) => {
          const rowStyle: React.CSSProperties = {
            display: "flex",
            alignItems: "center",
            gap: "var(--gc-space-4)",
            padding: "var(--gc-space-3) var(--gc-space-4)",
            borderBottom: "1px solid var(--gc-border-subtle)",
            textDecoration: "none",
            color: "inherit",
            transition: "background-color 0.15s",
            minHeight: 44,
          };
          const tsCell = (
            <span
              style={{
                flex: "0 0 96px",
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-xs)",
                color: "var(--gc-text-muted)",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--gc-space-1)",
              }}
            >
              <Clock className="w-3 h-3" aria-hidden="true" />
              {formatRelativeTime(item.ts)}
            </span>
          );
          const titleCell = (
            <span
              style={{
                flex: 1,
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-sm)",
                color: "var(--gc-text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.title}
            </span>
          );
          const chevronCell = item.href ? (
            <ChevronRight
              className="w-4 h-4"
              style={{ color: "var(--gc-text-muted)", flexShrink: 0 }}
              aria-hidden="true"
            />
          ) : (
            <span style={{ width: 16, flexShrink: 0 }} aria-hidden="true" />
          );
          return (
            <li key={item.id}>
              {item.href ? (
                <Link
                  href={item.href}
                  style={rowStyle}
                  className="hover:bg-[var(--gc-surface-2)]"
                  aria-label={`${formatRelativeTime(item.ts)} — ${item.title} — open detail`}
                >
                  {tsCell}
                  {titleCell}
                  {chevronCell}
                </Link>
              ) : (
                <div style={rowStyle} aria-label={`${formatRelativeTime(item.ts)} — ${item.title}`}>
                  {tsCell}
                  {titleCell}
                  {chevronCell}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
