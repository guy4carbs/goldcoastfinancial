import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Trash2, Coins, TrendingUp, Building2, Check, X as XIcon, Link as LinkIcon, AlertTriangle, Loader2, Network } from "lucide-react";
import { usePlaidLink } from "react-plaid-link";
import {
  GCPageHeader,
  GCKPICard,
  GCDataTable,
  GCAreaChart,
  GCPeriodSelector,
  FOUNDER_PROFIT_PERIODS,
  GCPrimaryButton,
  GCSecondaryButton,
  GCModal,
  GC_FORM_LABEL,
  GC_FORM_INPUT,
  GCSelect,
  type Column,
} from "@/components/gc";
import { TOUR } from "@/lib/tour/selectors";
import { useToast } from "@/hooks/use-toast";
import { csrfHeaders } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { dollars, splitAmountCents } from "./utils/format";
import { SPLIT_RECIPIENTS } from "@shared/models/founders";

// Gold focus + hover ring for KPI tiles. Mirrors Revenue / Growth / Book / Team Performance / Lead Distribution / Agency Management.
const KPI_LINK_CLASS =
  "block rounded-md transition-shadow hover:ring-2 hover:ring-[var(--gc-gold-bright,var(--gc-gold))] focus-visible:ring-2 focus-visible:ring-[var(--gc-gold)]";

// ─── Types ──────────────────────────────────────────────────────────────
interface SummaryResponse {
  period: string;
  start: string;
  end: string;
  totalCents: number;
  depositCount: number;
  splits: Record<string, number>;
}

interface TimelinePoint {
  bucket: string;
  totalCents: number;
  gaetano: number;
  jack: number;
  nicholas: number;
  retained: number;
}

interface TimelineResponse {
  period: string;
  mode: "day" | "week" | "month";
  series: TimelinePoint[];
}

interface LedgerRow {
  id: string;
  depositDate: string;
  amountCents: number;
  source: string;
  estimatedAmountCents: number | null;
  note: string | null;
  createdByUserId: string;
  createdByName: string | null;
  createdAt: string;
  splits: Record<string, number>;
}

interface LedgerResponse { period: string; rows: LedgerRow[]; }

interface EstimateResponse {
  asOfDate: string;
  estimatedCents: number;
  breakdown: { source: string; note: string };
}

interface PlaidItemRow {
  id: string;
  itemId: string;
  institutionId: string | null;
  institutionName: string | null;
  status: "active" | "error" | "revoked";
  error: string | null;
  syncedAt: string | null;
  createdAt: string;
}

interface PlaidPendingRow {
  id: string;
  postedDate: string;
  amountCents: number;
  merchantName: string | null;
  description: string | null;
  paymentChannel: string | null;
  institutionName: string | null;
  status: "pending";
}

const SOURCE_LABELS: Record<string, string> = {
  commission: "Commission",
  override: "Override",
  other: "Other",
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
};

const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--gc-font-body)",
  fontSize: "var(--gc-text-xs)",
  fontWeight: 500,
  letterSpacing: "var(--gc-tracking-wider)",
  textTransform: "uppercase",
  color: "var(--gc-text-muted)",
};

function timeSinceLabel(iso: string | null): string {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "just now";
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

// ─── Page ───────────────────────────────────────────────────────────────
export default function FoundersProfitSplit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [period, setPeriod] = useState<string>("mtd");
  const [addOpen, setAddOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<"all" | "commission" | "override" | "other">("all");

  // ─── Plaid connection state ─────────────────────────────────────────
  const itemsQuery = useQuery<PlaidItemRow[]>({
    queryKey: ["/api/founders/plaid/items"],
    queryFn: async () => {
      const res = await fetch("/api/founders/plaid/items", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    refetchInterval: 30_000, // pick up sync status changes
  });
  const pendingQuery = useQuery<PlaidPendingRow[]>({
    queryKey: ["/api/founders/plaid/pending"],
    queryFn: async () => {
      const res = await fetch("/api/founders/plaid/pending?limit=50", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    refetchInterval: 30_000,
  });
  const activeItem = itemsQuery.data?.find((i) => i.status !== "revoked") || null;
  const isConnected = !!activeItem;

  // Surface Plaid query errors as a toast so the founder isn't left wondering
  // why the Connect Chase card just sits there. Fires once per error instance
  // (re-shows on a fresh failure after recovery).
  const itemsErrorRef = useRef<Error | null>(null);
  const pendingErrorRef = useRef<Error | null>(null);
  useEffect(() => {
    if (itemsQuery.error && itemsQuery.error !== itemsErrorRef.current) {
      itemsErrorRef.current = itemsQuery.error as Error;
      toast({
        title: "Couldn't load Plaid connections",
        description: (itemsQuery.error as Error).message || "Try again in a moment.",
        variant: "destructive",
      });
    } else if (!itemsQuery.error) {
      itemsErrorRef.current = null;
    }
  }, [itemsQuery.error, toast]);
  useEffect(() => {
    if (pendingQuery.error && pendingQuery.error !== pendingErrorRef.current) {
      pendingErrorRef.current = pendingQuery.error as Error;
      toast({
        title: "Couldn't load pending Plaid deposits",
        description: (pendingQuery.error as Error).message || "Try again in a moment.",
        variant: "destructive",
      });
    } else if (!pendingQuery.error) {
      pendingErrorRef.current = null;
    }
  }, [pendingQuery.error, toast]);
  const plaidQueriesErrored = !!(itemsQuery.error || pendingQuery.error);
  const retryPlaidQueries = useCallback(() => {
    itemsQuery.refetch();
    pendingQuery.refetch();
  }, [itemsQuery, pendingQuery]);

  // ─── Plaid Link token (lazy) ────────────────────────────────────────
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);
  const fetchLinkToken = useCallback(async () => {
    setLinkLoading(true);
    try {
      const res = await fetch("/api/founders/plaid/link-token", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLinkToken(data.link_token);
    } catch (e: any) {
      toast({
        title: "Couldn't start Plaid Link",
        description: e?.message || "Try again in a moment",
        variant: "destructive",
      });
    } finally {
      setLinkLoading(false);
    }
  }, [toast]);

  const exchangeMutation = useMutation({
    mutationFn: async (publicToken: string) => {
      const res = await fetch("/api/founders/plaid/exchange", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        body: JSON.stringify({ public_token: publicToken }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Connected to Chase" });
      queryClient.invalidateQueries({ queryKey: ["/api/founders/plaid/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/founders/plaid/pending"] });
    },
    onError: (e: Error) =>
      toast({ title: "Connection failed", description: e.message, variant: "destructive" }),
  });

  const disconnectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/founders/plaid/items/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { ...(await csrfHeaders()) },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Disconnected" });
      queryClient.invalidateQueries({ queryKey: ["/api/founders/plaid/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/founders/plaid/pending"] });
    },
    onError: (e: Error) =>
      toast({ title: "Disconnect failed", description: e.message, variant: "destructive" }),
  });

  const plaidConfig = useMemo(
    () => ({
      token: linkToken || "",
      onSuccess: (publicToken: string) => {
        setLinkToken(null);
        exchangeMutation.mutate(publicToken);
      },
      onExit: () => setLinkToken(null),
    }),
    [linkToken, exchangeMutation],
  );
  const { open: openPlaidLink, ready: plaidReady } = usePlaidLink(plaidConfig);
  // Auto-open Link as soon as we have a token AND the SDK is ready.
  useEffect(() => {
    if (linkToken && plaidReady) openPlaidLink();
  }, [linkToken, plaidReady, openPlaidLink]);

  const summaryQuery = useQuery<SummaryResponse>({
    queryKey: ["/api/founders/profit/summary", period],
    queryFn: async () => {
      const res = await fetch(`/api/founders/profit/summary?period=${encodeURIComponent(period)}`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  const timelineQuery = useQuery<TimelineResponse>({
    queryKey: ["/api/founders/profit/timeline", period],
    queryFn: async () => {
      const res = await fetch(`/api/founders/profit/timeline?period=${encodeURIComponent(period)}`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  const ledgerQuery = useQuery<LedgerResponse>({
    queryKey: ["/api/founders/profit/ledger", period],
    queryFn: async () => {
      const res = await fetch(`/api/founders/profit/ledger?period=${encodeURIComponent(period)}&limit=200`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  const totalCents = summaryQuery.data?.totalCents ?? 0;
  const splits = summaryQuery.data?.splits ?? splitAmountCents(0);
  const poolCents = totalCents - (splits.retained ?? 0); // == 90% of totalCents
  const perFounderCents = splits.gaetano ?? Math.round(totalCents * 0.30);
  const retainedCents = splits.retained ?? Math.round(totalCents * 0.10);

  const cols: Column<LedgerRow>[] = useMemo(() => [
    {
      key: "depositDate",
      label: "Date",
      sortable: true,
      render: (v) => {
        // Server returns YYYY-MM-DD. Parse as local so PST users don't see
        // their Apr 28 deposit displayed as Apr 27.
        const d = parseLocalDate(String(v));
        return Number.isNaN(d.getTime())
          ? "—"
          : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      },
    },
    {
      key: "source",
      label: "Source",
      render: (v) => (
        <span style={{
          padding: "2px 10px",
          borderRadius: "var(--gc-radius-full)",
          fontSize: "var(--gc-text-xs)",
          color: v === "commission" ? "var(--gc-gold)" : v === "override" ? "var(--gc-status-review)" : "var(--gc-text-muted)",
          backgroundColor: `color-mix(in srgb, ${v === "commission" ? "var(--gc-gold)" : v === "override" ? "var(--gc-status-review)" : "var(--gc-text-muted)"} 14%, transparent)`,
          border: "1px solid color-mix(in srgb, currentColor 30%, transparent)",
          textTransform: "capitalize",
        }}>{SOURCE_LABELS[v] || v}</span>
      ),
    },
    {
      key: "amountCents",
      label: "Amount",
      align: "right",
      sortable: true,
      render: (v) => <span style={{ fontFamily: "var(--gc-font-display)", color: "var(--gc-text-primary)" }}>{dollars(Number(v), { cents: true })}</span>,
    },
    { key: "splits", label: "Per Founder", align: "right", render: (v) => dollars((v as Record<string, number>).gaetano, { cents: true }) },
    { key: "splits", label: "Retained", align: "right", render: (v) => <span style={{ color: "var(--gc-text-muted)" }}>{dollars((v as Record<string, number>).retained, { cents: true })}</span> },
    { key: "note", label: "Note", render: (v) => v || <span style={{ color: "var(--gc-text-muted)" }}>—</span> },
    {
      key: "id",
      label: "",
      align: "right",
      width: 60,
      render: (_v, row) => <DeleteRowButton id={row.id} onSuccess={() => {/* invalidation handled via mutation */}} period={period} />,
    },
  ], [period]);

  // Stacked-area data for the timeline chart. GCAreaChart accepts up to two
  // series via { value, value2 }. We render one band: the total deposit per
  // bucket. The split card below tells the per-founder story.
  const chartData = useMemo(
    () => (timelineQuery.data?.series || []).map((p) => ({
      label: formatBucketLabel(p.bucket, timelineQuery.data?.mode || "day"),
      value: p.totalCents / 100,
    })),
    [timelineQuery.data],
  );

  // Page-level error guard — only blank out if EVERY core profit query
  // errors. Plaid queries are intentionally excluded — Plaid being down
  // shouldn't blank the profit page.
  const allErrored = !!(summaryQuery.error && timelineQuery.error && ledgerQuery.error);
  const firstError = summaryQuery.error || timelineQuery.error || ledgerQuery.error;

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
          Unable to load profit split
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

  // Filter ledger rows by source chip selection. Done at render time
  // (not in the query) so the chip toggles feel instant — the dataset
  // is already paginated server-side at limit=200.
  const filteredLedgerRows = (ledgerQuery.data?.rows || []).filter(
    (r) => sourceFilter === "all" || r.source === sourceFilter,
  );

  return (
    <div>
      <div data-tour-id={TOUR.FOUNDERS.PROFIT_SPLIT.HEADER}>
        <GCPageHeader
          title="Profit Split"
          subtitle="Owner distributions from the Chase business account — 30/30/30/10"
          accentUnderline
          actions={
            <div className="flex flex-wrap items-center justify-end gap-2">
              {isConnected && activeItem && (
                <PlaidStatusPill
                  item={activeItem}
                  onDisconnect={() => disconnectMutation.mutate(activeItem.id)}
                  disconnecting={disconnectMutation.isPending}
                />
              )}
              <div data-tour-id={TOUR.FOUNDERS.PROFIT_SPLIT.PERIOD}>
                <GCPeriodSelector value={period} onChange={setPeriod} options={FOUNDER_PROFIT_PERIODS} />
              </div>
              <Link
                href="/founders/hierarchy"
                className="inline-flex items-center gap-1.5 px-3 py-2"
                style={OUTLINED_BUTTON_STYLE}
                title="Manage Hierarchy"
              >
                <Network aria-hidden="true" className="w-4 h-4" />
                <span className="hidden xl:inline">Manage Hierarchy →</span>
              </Link>
              <div data-tour-id={TOUR.FOUNDERS.PROFIT_SPLIT.ADD_DEPOSIT_BUTTON}>
                <GCPrimaryButton onClick={() => setAddOpen(true)} icon={<Plus aria-hidden="true" className="w-4 h-4" />}>
                  Add Deposit
                </GCPrimaryButton>
              </div>
            </div>
          }
        />
      </div>

      {/* KPI grid renders FIRST so the money numbers stay above the fold —
          Plaid onboarding/pending-review banners moved BELOW the KPIs.
          Money In drills to #timeline (chart context); the other 3 → #ledger. */}
      <section
        aria-labelledby="founders-profit-kpi-heading"
        className="mb-6 mt-6"
        data-tour-id={TOUR.FOUNDERS.PROFIT_SPLIT.KPI_GRID}
      >
        <h2 id="founders-profit-kpi-heading" className="sr-only">Profit split KPIs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryQuery.isLoading || !summaryQuery.data ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[116px] w-full" />
            ))
          ) : (
            <>
              <Link
                href="#timeline"
                aria-label={`Money in: ${dollars(totalCents, { compact: true })} across ${summaryQuery.data?.depositCount ?? 0} deposits — jump to timeline`}
                className={KPI_LINK_CLASS}
              >
                <GCKPICard
                  label="Money In"
                  value={dollars(totalCents, { compact: true })}
                  tooltip={`${summaryQuery.data?.depositCount ?? 0} deposits in selected period`}
                />
              </Link>
              <Link
                href="#ledger"
                aria-label={`To split (90%): ${dollars(poolCents, { compact: true })} — jump to ledger`}
                className={KPI_LINK_CLASS}
              >
                <GCKPICard
                  label="To Split (90%)"
                  value={dollars(poolCents, { compact: true })}
                  tooltip="The amount owed across the three founders before retained reserves"
                />
              </Link>
              <Link
                href="#ledger"
                aria-label={`Per founder (30%): ${dollars(perFounderCents, { compact: true })} — jump to ledger`}
                className={KPI_LINK_CLASS}
              >
                <GCKPICard
                  label="Per Founder (30%)"
                  value={dollars(perFounderCents, { compact: true })}
                  accentTop
                  tooltip="Each founder receives 30% of every deposit"
                />
              </Link>
              <Link
                href="#ledger"
                aria-label={`Retained (10%): ${dollars(retainedCents, { compact: true })} — jump to ledger`}
                className={KPI_LINK_CLASS}
              >
                <GCKPICard
                  label="Retained (10%)"
                  value={dollars(retainedCents, { compact: true })}
                  tooltip="Stays in the business checking account"
                />
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Plaid banners — relocated BELOW the KPI grid (Axiom finding 2026-05-01)
          so the money numbers always render above the fold. Connect-card only
          shows pre-onboarding; pending tray only when Plaid surfaces credits. */}
      {!isConnected && (
        <ConnectChaseCard
          loading={linkLoading || exchangeMutation.isPending}
          onConnect={fetchLinkToken}
          alreadyAttempted={!itemsQuery.isLoading}
          plaidErrored={plaidQueriesErrored}
          onRetry={retryPlaidQueries}
        />
      )}

      {(pendingQuery.data?.length || 0) > 0 && (
        <PendingReviewTray rows={pendingQuery.data!} />
      )}

      {/* Split card — inner H2 already says "Distribution Breakdown", so the
          outer eyebrow label is omitted to avoid stutter (Axiom finding). */}
      <section
        id="breakdown"
        aria-labelledby="founders-profit-breakdown-heading"
        className="mb-6"
      >
        {summaryQuery.isLoading || !summaryQuery.data ? (
          <Skeleton className="h-[260px] w-full" />
        ) : (
      <div
        className="mb-6"
        data-tour-id={TOUR.FOUNDERS.PROFIT_SPLIT.SPLIT_CARD}
        style={{
          backgroundColor: "var(--gc-surface)",
          border: "1px solid var(--gc-border)",
          borderRadius: "var(--gc-radius-md)",
          padding: "var(--gc-space-6)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              id="founders-profit-breakdown-heading"
              style={{
                fontFamily: "var(--gc-font-display)",
                fontSize: "var(--gc-text-xl)",
                color: "var(--gc-text-primary)",
                letterSpacing: "var(--gc-tracking-tight)",
                margin: 0,
              }}
            >
              Distribution Breakdown
            </h2>
            <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
              {summaryQuery.data ? `${summaryQuery.data.start} → ${summaryQuery.data.end}` : "—"}
            </div>
          </div>
          <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-gold)" }}>
            {dollars(totalCents, { compact: true })}
          </div>
        </div>
        <div
          style={{
            height: 2,
            width: 96,
            background: "linear-gradient(90deg, var(--gc-gold) 0%, var(--gc-gold-bright) 100%)",
            marginBottom: "var(--gc-space-4)",
            borderRadius: "var(--gc-radius-full)",
          }}
        />
        <div className="flex flex-col gap-3">
          {SPLIT_RECIPIENTS.map((r) => {
            const cents = splits[r.key] ?? 0;
            const isRetained = r.key === "retained";
            // Theme-adaptive tile + accent. Using `--gc-surface-2` (instead of
            // a hardcoded platinum) lets the tile read as "muted surface" on
            // every theme — light cream on gc-light, dark maroon on gc-maroon,
            // dark plum on gc-dark — instead of clashing as cream-on-maroon.
            const tileBg = "var(--gc-surface-2)";
            const tileFg = isRetained ? "var(--gc-text-secondary)" : "var(--gc-gold)";
            const barColor = isRetained ? "var(--gc-text-muted)" : "var(--gc-gold)";
            const widthPct = totalCents > 0 ? (cents / totalCents) * 100 : 0;
            return (
              <div key={r.key} className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--gc-radius-md)",
                    backgroundColor: tileBg,
                    border: "1px solid var(--gc-border)",
                    color: tileFg,
                    fontFamily: "var(--gc-font-display)",
                    fontWeight: 600,
                    fontSize: "var(--gc-text-md)",
                    flexShrink: 0,
                  }}
                >
                  {isRetained ? <Coins aria-hidden="true" className="w-4 h-4" /> : initialsOf(r.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)", fontWeight: 500 }}>
                      {r.fullName}
                    </span>
                    <span style={{ fontSize: "var(--gc-text-sm)", fontFamily: "var(--gc-font-display)", color: "var(--gc-text-primary)" }}>
                      {dollars(cents, { cents: true })} <span style={{ color: "var(--gc-text-muted)", fontSize: "var(--gc-text-xs)" }}>({Math.round(r.pct * 100)}%)</span>
                    </span>
                  </div>
                  <div style={{
                    height: 6,
                    borderRadius: "var(--gc-radius-full)",
                    backgroundColor: "var(--gc-surface-2)",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${widthPct}%`,
                      height: "100%",
                      backgroundColor: barColor,
                      borderRadius: "var(--gc-radius-full)",
                      transition: "width var(--gc-transition-fast)",
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
        )}
      </section>

      {/* Timeline chart */}
      <section
        id="timeline"
        aria-labelledby="founders-profit-timeline-heading"
        className="mb-6"
        data-tour-id={TOUR.FOUNDERS.PROFIT_SPLIT.TIMELINE_CHART}
      >
        <h2 id="founders-profit-timeline-heading" className="mb-3" style={{ ...SECTION_LABEL_STYLE, margin: 0, marginBottom: "0.75rem" }}>
          Deposits Over Time · {period.replace(/-/g, " ").toUpperCase()}
        </h2>
        {timelineQuery.isLoading ? (
          <Skeleton className="h-[320px] w-full" />
        ) : (
          <GCAreaChart
            title={`Deposits Over Time · ${labelForPeriod(period)}`}
            data={chartData}
            valueFormatter={(v) => dollars(Math.round(v * 100), { compact: true })}
          />
        )}
      </section>

      {/* Ledger */}
      <section
        id="ledger"
        aria-labelledby="founders-profit-ledger-heading"
        data-tour-id={TOUR.FOUNDERS.PROFIT_SPLIT.LEDGER_TABLE}
      >
        <h2 id="founders-profit-ledger-heading" className="mb-3" style={{ ...SECTION_LABEL_STYLE, margin: 0, marginBottom: "0.75rem" }}>
          Ledger · {period.replace(/-/g, " ").toUpperCase()}
        </h2>
        {/* Source filter chip row — instant client-side filter over the
            already-fetched ledger window. Mirrors the source-pill pattern
            used on the Lead Distribution pool table. */}
        <div className="flex items-center gap-2 mb-2">
          {(["all", "commission", "override", "other"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className="px-3 py-1 rounded-full text-xs transition-colors"
              style={{
                backgroundColor: sourceFilter === s ? "var(--gc-gold)" : "var(--gc-surface-2)",
                color: sourceFilter === s ? "var(--gc-bg)" : "var(--gc-text-secondary)",
                border: "1px solid var(--gc-border)",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        {ledgerQuery.isLoading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : filteredLedgerRows.length === 0 ? (
          <EmptyTableBlock
            title="No deposits in period."
            subtext="Use 'Add Deposit' above to record the first founder distribution."
          />
        ) : (
          <GCDataTable
            columns={cols}
            data={filteredLedgerRows}
            searchable
            searchPlaceholder="Search by source, note…"
            pageSize={20}
          />
        )}
      </section>

      {addOpen && (
        <AddDepositModal onClose={() => setAddOpen(false)} period={period} />
      )}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────
function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
}

/**
 * Strip everything except digits and a single decimal point. Caps decimals at
 * two places so the user can't type sub-cent precision that would silently
 * vanish on round. Strips commas because we re-insert them on blur.
 */
function sanitizeAmount(raw: string): string {
  let s = raw.replace(/[^0-9.]/g, "");
  const firstDot = s.indexOf(".");
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
    const [whole, frac = ""] = s.split(".");
    s = whole + "." + frac.slice(0, 2);
  }
  return s;
}

/**
 * On blur, pad to two decimal places and (re)group thousands with commas so
 * "12500" → "12,500.00" and "12500.5" → "12,500.50". Strips any commas in
 * the input before parsing — at blur time the live formatter has already
 * inserted them, and `Number("10,000")` returns NaN, which would otherwise
 * surface as the literal string "NaN" in the field. Strips a leading zero
 * if present so "0125" → "125.00" (but "0.50" stays). Empty stays empty.
 */
function normalizeAmountOnBlur(raw: string): string {
  if (!raw) return "";
  const stripped = raw.replace(/,/g, "");
  if (!stripped || stripped === ".") return "";
  const [rawWhole = "0", rawFrac = ""] = stripped.split(".");
  const cleanWhole = rawWhole.replace(/^0+(?=\d)/, "") || "0";
  const wholeNum = Number(cleanWhole);
  if (!Number.isFinite(wholeNum)) return "";
  const grouped = wholeNum.toLocaleString("en-US");
  const frac = (rawFrac + "00").slice(0, 2);
  return grouped + "." + frac;
}

/**
 * Live thousands-grouping for input typed-state — adds commas to the
 * whole-dollar portion while preserving the trailing decimal/digits as the
 * user is typing. Less aggressive than `normalizeAmountOnBlur`: we don't
 * collapse leading zeros until blur so the user can type "0.5" without
 * the leading zero vanishing mid-keystroke.
 */
function formatAmountTyping(s: string): string {
  if (!s) return s;
  const dot = s.indexOf(".");
  const whole = dot === -1 ? s : s.slice(0, dot);
  const tail = dot === -1 ? "" : s.slice(dot);
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return grouped + tail;
}

/**
 * String-based dollars → cents converter. Avoids `Number(s) * 100` because
 * 0.29 * 100 in IEEE-754 = 28.999999999999996, which Math.round handles fine
 * for typical inputs but breaks at the third decimal. Splitting on the dot
 * and concatenating gives us cent-exact math for any valid 2-decimal input.
 */
function parseDollarsToCents(s: string): number {
  if (!s) return 0;
  const trimmed = s.trim().replace(/,/g, "");
  if (!/^\d+(\.\d{0,2})?$/.test(trimmed)) {
    const n = Number(trimmed);
    return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0;
  }
  const [whole, frac = ""] = trimmed.split(".");
  const wholeCents = Number(whole) * 100;
  const fracCents = Number((frac + "00").slice(0, 2));
  return wholeCents + fracCents;
}

/**
 * Parse YYYY-MM-DD as a LOCAL date. `new Date('2026-04-28')` interprets bare
 * ISO dates as UTC midnight, which shifts the displayed day in any non-UTC
 * timezone. Splitting + constructing locally sidesteps that.
 */
function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return new Date(NaN);
  return new Date(y, m - 1, d);
}

function formatBucketLabel(bucket: string, mode: "day" | "week" | "month"): string {
  const d = parseLocalDate(bucket);
  if (Number.isNaN(d.getTime())) return bucket;
  if (mode === "day") return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (mode === "week") return `Wk ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function labelForPeriod(value: string): string {
  return FOUNDER_PROFIT_PERIODS.find((o) => o.value === value)?.label || value;
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

function DeleteRowButton({ id, period }: { id: string; period: string; onSuccess?: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const del = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/founders/profit/deposits/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { ...(await csrfHeaders()) },
      });
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          res.ok
            ? "Server returned HTML instead of JSON — restart the dev server."
            : `HTTP ${res.status} (non-JSON response)`,
        );
      }
      const data = await res.json().catch(() => ({} as { error?: string }));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/founders/profit/summary", period] });
      qc.invalidateQueries({ queryKey: ["/api/founders/profit/timeline", period] });
      qc.invalidateQueries({ queryKey: ["/api/founders/profit/ledger", period] });
      toast({ title: "Deposit removed" });
    },
    onError: (e: Error) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });
  return (
    <button
      onClick={(e) => { e.stopPropagation(); if (confirm("Remove this deposit?")) del.mutate(); }}
      className="flex items-center justify-center"
      aria-label="Delete deposit"
      style={{
        width: 28,
        height: 28,
        background: "none",
        border: "1px solid var(--gc-border)",
        borderRadius: "var(--gc-radius-sm)",
        color: "var(--gc-text-muted)",
        cursor: "pointer",
      }}
    >
      <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
    </button>
  );
}

// ─── Add Deposit Modal ──────────────────────────────────────────────────
function AddDepositModal({ onClose, period }: { onClose: () => void; period: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const [depositDate, setDepositDate] = useState(today);
  const [amountStr, setAmountStr] = useState("");
  const [source, setSource] = useState("commission");
  const [note, setNote] = useState("");
  const [estimatedCents, setEstimatedCents] = useState<number | null>(null);
  // Cursor tracking for live comma formatting. Without this, inserting/removing
  // a comma mid-string shifts the caret to the end on every keystroke.
  const amountRef = useRef<HTMLInputElement>(null);
  const [pendingCaret, setPendingCaret] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (pendingCaret !== null && amountRef.current) {
      amountRef.current.setSelectionRange(pendingCaret, pendingCaret);
      setPendingCaret(null);
    }
  }, [pendingCaret, amountStr]);

  // onChange handler: sanitize → re-comma → reposition cursor at the same
  // "Nth significant character" (digit or dot) it was on before, regardless
  // of how many commas got added or removed.
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const caretBefore = e.target.selectionStart ?? raw.length;
    const sigBefore = raw.slice(0, caretBefore).replace(/[^0-9.]/g, "").length;

    const sanitized = sanitizeAmount(raw);
    const formatted = formatAmountTyping(sanitized);

    let seen = 0;
    let nextCaret = formatted.length;
    for (let i = 0; i < formatted.length; i++) {
      if (seen === sigBefore) { nextCaret = i; break; }
      if (formatted[i] !== ",") seen++;
    }

    setAmountStr(formatted);
    setPendingCaret(nextCaret);
  };

  // Pre-fill amount from server estimate when the modal opens or date changes.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/founders/profit/estimate?asOfDate=${depositDate}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: EstimateResponse | null) => {
        if (cancelled || !data) return;
        setEstimatedCents(data.estimatedCents);
        if (!amountStr && data.estimatedCents > 0) {
          // Pre-fill with comma-grouped 2-decimal format so the field opens
          // already looking finished ("12,500.00"). The user can still
          // overwrite freely; commas are stripped automatically on focus.
          setAmountStr(normalizeAmountOnBlur((data.estimatedCents / 100).toFixed(2)));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depositDate]);

  const create = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch("/api/founders/profit/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        credentials: "include",
        body: JSON.stringify(body),
      });
      // If the route falls through to the SPA catch-all (e.g. dev server
      // was started before this route existed) the response is HTML, not
      // JSON. Detect that so the toast surfaces something actionable.
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          res.ok
            ? "Server returned HTML instead of JSON — restart the dev server so the new /api/founders/profit routes are mounted."
            : `HTTP ${res.status} (non-JSON response)`,
        );
      }
      const data = await res.json().catch(() => ({} as { error?: string }));
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/founders/profit/summary", period] });
      qc.invalidateQueries({ queryKey: ["/api/founders/profit/timeline", period] });
      qc.invalidateQueries({ queryKey: ["/api/founders/profit/ledger", period] });
      toast({ title: "Deposit recorded" });
      onClose();
    },
    onError: (e: Error) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const amountCents = parseDollarsToCents(amountStr);
    if (amountCents <= 0) {
      toast({ title: "Amount required", description: "Enter a positive deposit amount.", variant: "destructive" });
      return;
    }
    create.mutate({
      depositDate,
      amountCents,
      source,
      estimatedAmountCents: estimatedCents ?? undefined,
      note: note.trim() || undefined,
    });
  };

  const previewSplit = splitAmountCents(parseDollarsToCents(amountStr));

  return (
    <GCModal
      title="Add Deposit"
      subtitle="Record a Chase business account deposit. The 30/30/30/10 split is computed automatically."
      onClose={onClose}
      width={520}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="depositDate" style={GC_FORM_LABEL}>Deposit Date *</label>
            <input
              id="depositDate"
              type="date"
              value={depositDate}
              onChange={(e) => setDepositDate(e.target.value)}
              required
              style={GC_FORM_INPUT}
            />
          </div>
          <div>
            <label htmlFor="amount" style={GC_FORM_LABEL}>Amount (USD) *</label>
            <div style={{ position: "relative" }}>
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "var(--gc-space-3)",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--gc-text-muted)",
                  fontFamily: "var(--gc-font-body)",
                  fontSize: "var(--gc-text-md)",
                  pointerEvents: "none",
                  lineHeight: 1,
                }}
              >
                $
              </span>
              <input
                id="amount"
                ref={amountRef}
                type="text"
                inputMode="decimal"
                value={amountStr}
                onChange={handleAmountChange}
                onBlur={() => setAmountStr((prev) => normalizeAmountOnBlur(prev))}
                placeholder="12,500.00"
                required
                style={{
                  ...GC_FORM_INPUT,
                  paddingLeft: "calc(var(--gc-space-3) + 14px)",
                }}
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="source" style={GC_FORM_LABEL}>Source *</label>
          <GCSelect
            value={source}
            onValueChange={setSource}
            fullWidth
            options={[
              { value: "commission", label: "Commission" },
              { value: "override", label: "Override" },
              { value: "other", label: "Other" },
            ]}
          />
        </div>

        <div>
          <label htmlFor="note" style={GC_FORM_LABEL}>Note (optional)</label>
          <textarea
            id="note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Q2 commission run from Carrier X"
            style={{ ...GC_FORM_INPUT, resize: "vertical" }}
          />
        </div>

        {estimatedCents !== null && estimatedCents > 0 && (
          <div
            className="flex items-center gap-2"
            style={{
              padding: "var(--gc-space-2) var(--gc-space-3)",
              backgroundColor: "color-mix(in srgb, var(--gc-gold) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--gc-gold) 30%, transparent)",
              borderRadius: "var(--gc-radius-sm)",
            }}
          >
            <TrendingUp aria-hidden="true" className="w-3.5 h-3.5" style={{ color: "var(--gc-gold)" }} />
            <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-secondary)" }}>
              Suggested: <strong style={{ color: "var(--gc-gold)" }}>{dollars(estimatedCents, { cents: true })}</strong> from {depositDate} commission run
            </span>
          </div>
        )}

        {/* Split preview */}
        <div
          style={{
            padding: "var(--gc-space-3)",
            backgroundColor: "var(--gc-surface-2)",
            borderRadius: "var(--gc-radius-sm)",
          }}
        >
          <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase", color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)" }}>
            Split Preview
          </div>
          <div className="grid grid-cols-4 gap-2">
            {SPLIT_RECIPIENTS.map((r) => (
              <div key={r.key}>
                <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{r.fullName.split(" ")[0]}</div>
                <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-md)", color: r.key === "retained" ? "var(--gc-text-muted)" : "var(--gc-gold)" }}>
                  {dollars(previewSplit[r.key as keyof typeof previewSplit] ?? 0, { cents: true })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-2">
          <GCSecondaryButton onClick={onClose}>Cancel</GCSecondaryButton>
          <GCPrimaryButton type="submit" disabled={create.isPending} icon={<Plus aria-hidden="true" className="w-3.5 h-3.5" />}>
            {create.isPending ? "Saving…" : "Record Deposit"}
          </GCPrimaryButton>
        </div>
      </form>
    </GCModal>
  );
}

// ─── Plaid: Connect Chase Card ───────────────────────────────────────────
function ConnectChaseCard({
  loading,
  onConnect,
  alreadyAttempted,
  plaidErrored,
  onRetry,
}: {
  loading: boolean;
  onConnect: () => void;
  alreadyAttempted: boolean;
  plaidErrored?: boolean;
  onRetry?: () => void;
}) {
  return (
    <div
      className="mb-6"
      style={{
        backgroundColor: "var(--gc-surface)",
        border: "1px dashed var(--gc-border)",
        borderRadius: "var(--gc-radius-md)",
        padding: "var(--gc-space-6)",
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center"
          style={{
            width: 48,
            height: 48,
            borderRadius: "var(--gc-radius-md)",
            backgroundColor: "var(--gc-surface-2)",
            border: "1px solid var(--gc-border)",
            color: "var(--gc-gold)",
            flexShrink: 0,
          }}
        >
          <Building2 aria-hidden="true" className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div
            style={{
              fontFamily: "var(--gc-font-display)",
              fontSize: "var(--gc-text-lg)",
              color: "var(--gc-text-primary)",
              letterSpacing: "var(--gc-tracking-tight)",
            }}
          >
            Connect Chase Business Checking
          </div>
          <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)", marginTop: 2 }}>
            Securely link via Plaid. Detected credits land in a Pending Review tray
            for you to confirm before they hit the split. Your Chase password never
            touches our servers.
          </div>
        </div>
        <div className="flex items-center gap-2">
          {plaidErrored && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              aria-label="Retry loading Plaid connection status"
              style={{
                ...OUTLINED_BUTTON_STYLE,
                padding: "8px 14px",
                cursor: "pointer",
                color: "var(--gc-status-warning)",
              }}
            >
              Try again
            </button>
          )}
          <GCPrimaryButton
            onClick={onConnect}
            disabled={loading || !alreadyAttempted}
            icon={
              loading ? (
                <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
              ) : (
                <LinkIcon aria-hidden="true" className="w-4 h-4" />
              )
            }
          >
            {loading ? "Connecting…" : "Connect"}
          </GCPrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ─── Plaid: Status Pill ──────────────────────────────────────────────────
function PlaidStatusPill({
  item,
  onDisconnect,
  disconnecting,
}: {
  item: PlaidItemRow;
  onDisconnect: () => void;
  disconnecting: boolean;
}) {
  const [hover, setHover] = useState(false);
  const status = item.status;
  const dotColor =
    status === "active" ? "var(--gc-status-active)" : status === "error" ? "var(--gc-status-warning)" : "var(--gc-text-muted)";
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative flex items-center gap-2"
      style={{
        padding: "6px 12px",
        backgroundColor: "var(--gc-surface)",
        border: "1px solid var(--gc-border)",
        borderRadius: "var(--gc-radius-full)",
        fontSize: "var(--gc-text-xs)",
        color: "var(--gc-text-secondary)",
        cursor: "default",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: dotColor,
          display: "inline-block",
        }}
      />
      <span style={{ color: "var(--gc-text-primary)", fontWeight: 500 }}>
        {item.institutionName || "Bank"}
      </span>
      <span style={{ color: "var(--gc-text-muted)" }}>· {timeSinceLabel(item.syncedAt)}</span>
      {hover && (
        <button
          onClick={onDisconnect}
          disabled={disconnecting}
          aria-label={`Disconnect Plaid item for ${item.institutionName || "this account"}`}
          style={{
            marginLeft: 6,
            padding: "0 8px",
            fontSize: "var(--gc-text-xs)",
            background: "none",
            border: "1px solid var(--gc-border)",
            borderRadius: "var(--gc-radius-sm)",
            color: "var(--gc-status-terminated)",
            cursor: disconnecting ? "not-allowed" : "pointer",
            opacity: disconnecting ? 0.5 : 1,
          }}
        >
          {disconnecting ? "…" : "Disconnect"}
        </button>
      )}
    </div>
  );
}

// ─── Plaid: Pending Review Tray ──────────────────────────────────────────
function PendingReviewTray({ rows }: { rows: PlaidPendingRow[] }) {
  return (
    <div
      className="mb-6"
      style={{
        backgroundColor: "var(--gc-surface)",
        border: "1px solid var(--gc-gold)",
        borderRadius: "var(--gc-radius-md)",
        padding: "var(--gc-space-4)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle aria-hidden="true" className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
          <span
            style={{
              fontFamily: "var(--gc-font-display)",
              fontSize: "var(--gc-text-md)",
              color: "var(--gc-text-primary)",
              letterSpacing: "var(--gc-tracking-tight)",
            }}
          >
            Pending Review · {rows.length} credit{rows.length === 1 ? "" : "s"}
          </span>
        </div>
        <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>
          Confirm to add to the split, Skip to dismiss.
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((r) => (
          <PendingReviewRow key={r.id} row={r} />
        ))}
      </div>
    </div>
  );
}

function PendingReviewRow({ row }: { row: PlaidPendingRow }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/founders/plaid/pending"] });
    queryClient.invalidateQueries({ queryKey: ["/api/founders/profit/summary"] });
    queryClient.invalidateQueries({ queryKey: ["/api/founders/profit/timeline"] });
    queryClient.invalidateQueries({ queryKey: ["/api/founders/profit/ledger"] });
  }, [queryClient]);

  const confirm = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/founders/plaid/pending/${row.id}/confirm`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        body: JSON.stringify({ source: "commission" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Deposit added to split" });
      invalidate();
    },
    onError: (e: Error) =>
      toast({ title: "Confirm failed", description: e.message, variant: "destructive" }),
  });

  const skip = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/founders/plaid/pending/${row.id}/skip`, {
        method: "POST",
        credentials: "include",
        headers: { ...(await csrfHeaders()) },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Skipped" });
      invalidate();
    },
    onError: (e: Error) =>
      toast({ title: "Skip failed", description: e.message, variant: "destructive" }),
  });

  const date = parseLocalDate(row.postedDate);
  const dateLabel = Number.isNaN(date.getTime())
    ? row.postedDate
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const merchant = row.merchantName || row.description || "—";
  const channel = row.paymentChannel ? row.paymentChannel.toUpperCase() : null;
  const busy = confirm.isPending || skip.isPending;

  return (
    <div
      className="flex items-center gap-3"
      style={{
        padding: "var(--gc-space-2) var(--gc-space-3)",
        backgroundColor: "var(--gc-surface-2)",
        border: "1px solid var(--gc-border-subtle)",
        borderRadius: "var(--gc-radius-sm)",
      }}
    >
      <div
        style={{
          width: 40,
          textAlign: "center",
          fontSize: "var(--gc-text-xs)",
          color: "var(--gc-text-muted)",
          flexShrink: 0,
        }}
      >
        {dateLabel}
      </div>
      <div className="flex-1 min-w-0">
        <div
          style={{
            fontSize: "var(--gc-text-sm)",
            color: "var(--gc-text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {merchant}
        </div>
        {channel && (
          <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{channel}</div>
        )}
      </div>
      <div
        style={{
          fontFamily: "var(--gc-font-display)",
          fontSize: "var(--gc-text-md)",
          color: "var(--gc-gold)",
          minWidth: 100,
          textAlign: "right",
        }}
      >
        {dollars(row.amountCents, { cents: true })}
      </div>
      <button
        onClick={() => confirm.mutate()}
        disabled={busy}
        className="flex items-center gap-1"
        style={{
          padding: "4px 10px",
          backgroundColor: "var(--gc-btn-primary-bg)",
          color: "var(--gc-btn-primary-text)",
          border: "none",
          borderRadius: "var(--gc-radius-sm)",
          fontSize: "var(--gc-text-xs)",
          fontWeight: 500,
          cursor: busy ? "not-allowed" : "pointer",
          opacity: busy ? 0.5 : 1,
        }}
      >
        <Check aria-hidden="true" className="w-3.5 h-3.5" /> Confirm
      </button>
      <button
        onClick={() => skip.mutate()}
        disabled={busy}
        className="flex items-center gap-1"
        style={{
          padding: "4px 10px",
          backgroundColor: "var(--gc-surface)",
          color: "var(--gc-text-secondary)",
          border: "1px solid var(--gc-border)",
          borderRadius: "var(--gc-radius-sm)",
          fontSize: "var(--gc-text-xs)",
          cursor: busy ? "not-allowed" : "pointer",
          opacity: busy ? 0.5 : 1,
        }}
      >
        <XIcon aria-hidden="true" className="w-3.5 h-3.5" /> Skip
      </button>
    </div>
  );
}
