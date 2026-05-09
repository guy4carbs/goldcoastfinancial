import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Upload, FileText, Send, Globe, Network } from "lucide-react";
import {
  GCPageHeader,
  GCKPICard,
  GCDataTable,
  GCStatusBadge,
  GCPrimaryButton,
  GCPeriodSelector,
  GCTabs,
  GCTabsList,
  GCTabsTrigger,
  type Column,
} from "@/components/gc";
import { LeadDetailDrawer, type LeadDetail } from "@/components/leads/LeadDetailDrawer";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { csrfHeaders } from "@/lib/queryClient";
import { formatCurrency, formatNumber, formatDate, ageInDays } from "./utils/format";
import { TOUR } from "@/lib/tour/selectors";

// Gold focus + hover ring for KPI tiles. Mirrors Revenue / Growth / Book / Team Performance.
const KPI_LINK_CLASS =
  "block rounded-md transition-shadow hover:ring-2 hover:ring-[var(--gc-gold-bright,var(--gc-gold))] focus-visible:ring-2 focus-visible:ring-[var(--gc-gold)]";

// Shared style tokens — mirror FoundersTeamPerformance.tsx so the founders
// pages render identically. Period selector + outlined link patterns reuse
// these exact styles.
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

interface KPIs {
  total: number;
  inPool: number;
  fromWebsite: number;
  distributed: number;
  hot: number;
  successRate: number;
}
interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  streetAddress?: string | null;
  zipCode?: string | null;
  source?: string;
  sourceId?: string | null;
  priority?: string;
  status?: string;
  pipelineStage?: string;
  leadScore?: number;
  leadScoreTier?: string;
  coverageType?: string;
  coverageAmount?: string | null;
  estimatedValue?: number;
  notes?: string | null;
  enrichmentData?: Record<string, any> | null;
  city?: string;
  state?: string;
  product?: string;
  createdAt?: string;
  assignedAt?: string;
  importBatchId?: string;
}
interface Manager {
  id: string;
  manager: { firstName: string; lastName: string };
  agentCount: number;
}
interface ImportRow {
  id: string;
  fileName: string;
  createdAt: string;
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  status?: string;
}
interface DistributionBatch {
  batchId: string;
  distributedAt: string;
  totalLeads: number;
  managers: Array<{ managerId: string; managerName: string; leadCount: number }>;
}

const TIER_COLORS: Record<string, string> = {
  cold: "var(--gc-text-muted)",
  warm: "var(--gc-status-review)",
  hot: "var(--gc-status-warning)",
  on_fire: "var(--gc-status-terminated)",
};
const PRIORITY_COLORS: Record<string, string> = {
  low: "var(--gc-text-muted)",
  medium: "var(--gc-status-review)",
  high: "var(--gc-status-pending)",
  urgent: "var(--gc-status-warning)",
};

function LiveDot({ connected }: { connected: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs"
      style={{
        backgroundColor: `color-mix(in srgb, ${
          connected ? "var(--gc-status-active)" : "var(--gc-text-muted)"
        } 15%, transparent)`,
        color: connected ? "var(--gc-status-active)" : "var(--gc-text-muted)",
        fontFamily: "var(--gc-font-body)",
        fontWeight: 500,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: connected ? "var(--gc-status-active)" : "var(--gc-text-muted)",
          animation: connected ? "fdpulse 1.6s ease-in-out infinite" : "none",
        }}
      />
      {connected ? "Live" : "Disconnected"}
      <style>{`@keyframes fdpulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </span>
  );
}

export default function FoundersLeadDistribution() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [period, setPeriod] = useState<string>("ytd");
  const [tab, setTab] = useState("all");
  const [connected, setConnected] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadDetail | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Period-scoped queries — embed period directly in the URL (queryClient's
  // default fetcher uses queryKey[0] as the URL verbatim; the second key entry
  // is a cache discriminator only). Same pattern as FoundersTeamPerformance.
  const kpisQ = useQuery<KPIs>({
    queryKey: [`/api/founders/leads/kpis?period=${period}`, period],
    staleTime: 30_000,
    retry: 1,
  });
  const distHistoryQ = useQuery<DistributionBatch[]>({
    queryKey: [`/api/founders/leads/distribution-history?limit=20`],
    staleTime: 60_000,
    retry: 1,
  });

  // Pool, managers and imports are current-state — period filter does not
  // apply (pool is a snapshot of "leads not yet distributed"; the source tabs
  // facet that snapshot).
  const poolQ = useQuery<Lead[]>({
    queryKey: [`/api/founders/leads/pool?source=${tab === "all" ? "" : tab}&limit=200`],
    staleTime: 30_000,
    retry: 1,
  });
  const managersQ = useQuery<Manager[]>({
    queryKey: ["/api/founders/leads/managers"],
    staleTime: 60_000,
  });
  const importsQ = useQuery<ImportRow[]>({
    queryKey: ["/api/founders/leads/imports?limit=10"],
    staleTime: 30_000,
  });

  // Tab pre-selection from URL hash. The KPI cards use anchors like
  // "#pool?tab=website" — when the hash changes (anchor click or external
  // navigation) we parse the optional tab fragment and switch the source
  // facet. Listens to both `hashchange` and a one-shot synthetic event
  // dispatched on mount so the initial load also honours it.
  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash || "";
      const m = hash.match(/\?tab=([\w_-]+)/);
      if (m && m[1]) {
        setTab(m[1]);
        // Strip the consumed query so re-clicking the same KPI tile (which
        // would otherwise produce an unchanged hash and skip `hashchange`)
        // re-fires the navigation. Pool anchor stays intact for scroll.
        const base = hash.split("?")[0];
        history.replaceState(null, "", base || "#pool");
      } else if (hash === "#pool") {
        setTab("all");
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/founders/leads/import", {
        method: "POST",
        credentials: "include",
        headers: { ...(await csrfHeaders()) },
        body: fd,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    onSuccess: (r: { accepted: number; skipped: number }) => {
      toast({
        title: "Import complete",
        description: `${r.accepted} imported, ${r.skipped} skipped.`,
      });
      qc.invalidateQueries({ queryKey: [`/api/founders/leads/kpis?period=${period}`, period] });
      qc.invalidateQueries({ queryKey: ["/api/founders/leads/imports?limit=10"] });
      qc.invalidateQueries({
        queryKey: [`/api/founders/leads/pool?source=${tab === "all" ? "" : tab}&limit=200`],
      });
    },
    onError: (e: Error) =>
      toast({ title: "Import failed", description: e.message, variant: "destructive" }),
  });

  const distributeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/founders/leads/distribute", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        body: JSON.stringify({ scope: "all" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    onSuccess: (r: { batchId: string; assignments: { managerId: string; leadIds: string[] }[] }) => {
      const total = r.assignments.reduce((s, a) => s + a.leadIds.length, 0);
      toast({
        title: "Distributed",
        description: `${total} leads sent to ${r.assignments.length} managers.`,
      });
      qc.invalidateQueries({ queryKey: [`/api/founders/leads/kpis?period=${period}`, period] });
      qc.invalidateQueries({
        queryKey: [`/api/founders/leads/pool?source=${tab === "all" ? "" : tab}&limit=200`],
      });
      qc.invalidateQueries({ queryKey: [`/api/founders/leads/distribution-history?limit=20`] });
    },
    onError: (e: Error) =>
      toast({ title: "Distribute failed", description: e.message, variant: "destructive" }),
  });

  // SSE live tail — invalidates current-state queries on every push. Period
  // filter is irrelevant here (events are all real-time, all-period).
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource("/api/founders/leads/stream", {
        withCredentials: true,
      } as EventSourceInit);
      es.onopen = () => setConnected(true);
      es.onerror = () => setConnected(false);
      es.onmessage = (e) => {
        try {
          const ev = JSON.parse(e.data);
          if (
            ev.type === "lead:new" ||
            ev.type === "lead:imported" ||
            ev.type === "lead:distributed"
          ) {
            qc.invalidateQueries({
              queryKey: [`/api/founders/leads/kpis?period=${period}`, period],
            });
            qc.invalidateQueries({
              queryKey: [`/api/founders/leads/pool?source=${tab === "all" ? "" : tab}&limit=200`],
            });
            if (ev.type === "lead:imported") {
              qc.invalidateQueries({ queryKey: ["/api/founders/leads/imports?limit=10"] });
            }
            if (ev.type === "lead:distributed") {
              qc.invalidateQueries({
                queryKey: [`/api/founders/leads/distribution-history?limit=20`],
              });
            }
          }
        } catch {}
      };
    } catch {
      setConnected(false);
    }
    return () => es?.close();
  }, [qc, tab, period]);

  const onFile = (file: File | null) => {
    if (file) importMutation.mutate(file);
  };

  const cols: Column<Lead>[] = [
    { key: "firstName", label: "Name", render: (_v, l) => `${l.firstName} ${l.lastName}` },
    { key: "coverageType", label: "Product" },
    {
      key: "leadScore",
      label: "Score",
      align: "right",
      render: (_v, l) => {
        const tier = l.leadScoreTier || "cold";
        return (
          <span className="inline-flex items-center gap-1.5">
            <span>{l.leadScore ?? 0}</span>
            <span
              className="px-2 py-0.5 rounded text-xs uppercase"
              style={{
                backgroundColor: `color-mix(in srgb, ${
                  TIER_COLORS[tier] || TIER_COLORS.cold
                } 20%, transparent)`,
                color: TIER_COLORS[tier] || TIER_COLORS.cold,
              }}
            >
              {tier.replace("_", " ")}
            </span>
          </span>
        );
      },
    },
    {
      key: "priority",
      label: "Priority",
      render: (v) =>
        v ? (
          <span
            className="px-2 py-0.5 rounded-full text-xs uppercase"
            style={{
              backgroundColor: `color-mix(in srgb, ${
                PRIORITY_COLORS[String(v)] || PRIORITY_COLORS.medium
              } 18%, transparent)`,
              color: PRIORITY_COLORS[String(v)] || PRIORITY_COLORS.medium,
            }}
          >
            {String(v)}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "source",
      label: "Source",
      render: (v) =>
        v === "web_form" ? (
          <span className="inline-flex items-center gap-1">
            <Globe aria-hidden="true" className="w-3 h-3" />
            Website
          </span>
        ) : (
          <span className="inline-flex items-center gap-1">
            <FileText aria-hidden="true" className="w-3 h-3" />
            {String(v || "csv")}
          </span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (v) => <GCStatusBadge status={String(v || "pending")} />,
    },
    {
      key: "estimatedValue",
      label: "Est. Value",
      align: "right",
      render: (v) => formatCurrency(Number(v) || 0),
    },
  ];

  const poolCount = kpisQ.data?.inPool || 0;
  const managerCount = managersQ.data?.length || 0;
  const perManager = managerCount > 0 ? Math.floor(poolCount / managerCount) : 0;

  // Page-level error guard — blank out only when EVERY core period-scoped
  // query errors. Pool/managers/imports are intentionally excluded so a
  // backend hiccup on one snapshot doesn't kill the whole page (mirrors
  // FoundersTeamPerformance).
  const allErrored = !!(
    kpisQ.error &&
    poolQ.error &&
    distHistoryQ.error
  );
  const firstError = kpisQ.error || poolQ.error || distHistoryQ.error;

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
          Unable to load lead distribution
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
        title="Lead Distribution"
        subtitle="Import, distribute, and track leads across all managers"
        accentUnderline
        actions={
          <div className="flex items-center gap-2">
            <div data-tour-id={TOUR.FOUNDERS.LEAD_DIST.LIVE_INDICATOR}>
              <LiveDot connected={connected} />
            </div>
            <div data-tour-id={TOUR.FOUNDERS.LEAD_DIST.HEADER}>
              <GCPeriodSelector value={period} onChange={setPeriod} />
            </div>
            <Link
              href="/founders/hierarchy"
              className="inline-flex items-center gap-1.5 px-3 py-2"
              style={OUTLINED_BUTTON_STYLE}
              aria-label="Manage Hierarchy — open founders hierarchy page"
            >
              <Network aria-hidden="true" className="w-4 h-4" />
              <span className="hidden xl:inline">Manage Hierarchy →</span>
            </Link>
          </div>
        }
      />

      {/* KPI strip — drill-in via wouter Link to in-page anchors. The
          "From Website" tile carries `?tab=website` so the pool's source
          facet snaps to the website filter on click. */}
      <section
        aria-labelledby="founders-lead-dist-kpi-heading"
        className="mb-6 mt-6"
        data-tour-id={TOUR.FOUNDERS.LEAD_DIST.KPI_GRID}
      >
        <h2 id="founders-lead-dist-kpi-heading" className="sr-only">Lead distribution KPIs</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpisQ.isLoading || !kpisQ.data ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[116px] w-full" />
            ))
          ) : (
            <>
              <Link
                href="#distribution-history"
                aria-label={`Total leads: ${formatNumber(kpisQ.data.total)} — jump to distribution history`}
                className={KPI_LINK_CLASS}
              >
                <GCKPICard
                  label="Total Leads"
                  value={formatNumber(kpisQ.data.total)}
                  accentTop
                  tooltip="Across all sources"
                />
              </Link>
              <Link
                href="#pool"
                aria-label={`In pool: ${formatNumber(kpisQ.data.inPool)} awaiting distribution — jump to pool`}
                className={KPI_LINK_CLASS}
              >
                <GCKPICard
                  label="In Pool"
                  value={formatNumber(kpisQ.data.inPool)}
                  accentTop
                  tooltip="Awaiting distribution"
                />
              </Link>
              <Link
                href="#pool?tab=web_form"
                aria-label={`From website: ${formatNumber(kpisQ.data.fromWebsite)} quoter submissions — jump to pool filtered by website`}
                className={KPI_LINK_CLASS}
              >
                <GCKPICard
                  label="From Website"
                  value={formatNumber(kpisQ.data.fromWebsite)}
                  accentTop
                  tooltip="Quoter submissions"
                />
              </Link>
              <Link
                href="#distribution-history"
                aria-label={`Distributed: ${formatNumber(kpisQ.data.distributed)} sent to managers — jump to distribution history`}
                className={KPI_LINK_CLASS}
              >
                <GCKPICard
                  label="Distributed"
                  value={formatNumber(kpisQ.data.distributed)}
                  accentTop
                  tooltip="To managers"
                />
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Import + Distribution controls — promoted ABOVE the source-mix chart
          since these are the founder's primary verbs (import + distribute).
          The chart is informational support — it sits below the action cards. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Import card */}
        <section
          aria-labelledby="founders-lead-dist-import-heading"
          style={CARD_STYLE}
          data-tour-id={TOUR.FOUNDERS.LEAD_DIST.IMPORT_CARD}
        >
          <h2
            id="founders-lead-dist-import-heading"
            style={{
              fontFamily: "var(--gc-font-display)",
              fontSize: "var(--gc-text-xl)",
              color: "var(--gc-text-primary)",
              margin: 0,
              marginBottom: "var(--gc-space-4)",
            }}
          >
            Import Leads
          </h2>
          <label
            className="block w-full text-center cursor-pointer rounded-md py-10 px-6"
            style={{ border: "2px dashed var(--gc-border)", backgroundColor: "var(--gc-surface-2)" }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              onFile(e.dataTransfer.files?.[0] || null);
            }}
          >
            <input
              ref={fileInput}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] || null)}
              data-testid="input-import-file"
            />
            <Upload aria-hidden="true" className="w-6 h-6 mx-auto mb-2" style={{ color: "var(--gc-gold)" }} />
            <div style={{ fontFamily: "var(--gc-font-body)", color: "var(--gc-text-primary)" }}>
              {importMutation.isPending ? "Uploading…" : "Drop CSV or Excel file here"}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--gc-text-muted)" }}>
              or click to browse — any format gets normalized
            </div>
          </label>

          <div className="mt-6">
            <h3 className="mb-2" style={{ ...SECTION_LABEL_STYLE, margin: 0, marginBottom: "0.5rem" }}>
              Recent Imports
            </h3>
            {importsQ.isLoading ? (
              <Skeleton className="h-24" />
            ) : (importsQ.data?.length || 0) === 0 ? (
              <div className="text-sm" style={{ color: "var(--gc-text-muted)" }}>
                No imports yet.
              </div>
            ) : (
              <div className="space-y-2">
                {(importsQ.data || []).slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <FileText aria-hidden="true" className="w-4 h-4" style={{ color: "var(--gc-text-muted)" }} />
                      <span>{r.fileName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span style={{ color: "var(--gc-text-muted)" }}>
                        {formatDate(r.createdAt)} · {r.importedRows} rows
                      </span>
                      <GCStatusBadge status={String((r as any).status || "active")} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Distribute card */}
        <section
          aria-labelledby="founders-lead-dist-distribute-heading"
          style={CARD_STYLE}
          data-tour-id={TOUR.FOUNDERS.LEAD_DIST.DISTRIBUTE_CARD}
        >
          <h2
            id="founders-lead-dist-distribute-heading"
            style={{
              fontFamily: "var(--gc-font-display)",
              fontSize: "var(--gc-text-xl)",
              color: "var(--gc-text-primary)",
              margin: 0,
              marginBottom: "var(--gc-space-4)",
            }}
          >
            Distribution Controls
          </h2>
          <GCPrimaryButton
            fullWidth
            disabled={poolCount === 0 || managerCount === 0 || distributeMutation.isPending}
            onClick={() => distributeMutation.mutate()}
            testId="button-distribute-evenly"
            icon={<Send aria-hidden="true" className="w-4 h-4" />}
          >
            {distributeMutation.isPending ? "Distributing…" : "Distribute Evenly"}
          </GCPrimaryButton>
          <div className="text-xs text-center mt-2" style={{ color: "var(--gc-text-muted)" }}>
            {poolCount} leads in pool → {perManager} per manager
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Stat label="Managers" value={formatNumber(managerCount)} />
            <Stat label="Pool Size" value={formatNumber(poolCount)} />
            <Stat label="Per Manager" value={formatNumber(perManager)} />
            <Stat label="Total Leads" value={formatNumber(kpisQ.data?.total || 0)} />
          </div>
        </section>
      </div>

      {/* Source-facet tabs above the pool table — kept as an explicit user
          choice (faceted filter, not a section divider). */}
      <GCTabs value={tab} onValueChange={setTab} data-tour-id={TOUR.FOUNDERS.LEAD_DIST.TABS}>
        <GCTabsList>
          <GCTabsTrigger value="all">All Leads</GCTabsTrigger>
          <GCTabsTrigger value="csv_import">Imported</GCTabsTrigger>
          <GCTabsTrigger value="web_form">Website</GCTabsTrigger>
          <GCTabsTrigger value="cold_list">Cold List</GCTabsTrigger>
        </GCTabsList>
      </GCTabs>

      {/* Pool table — wrapped in #pool so the KPI hash anchors land here. */}
      <section
        id="pool"
        aria-labelledby="founders-lead-dist-pool-heading"
        className="mt-4"
        data-tour-id={TOUR.FOUNDERS.LEAD_DIST.POOL_TABLE}
      >
        <h2 id="founders-lead-dist-pool-heading" className="sr-only">Lead pool</h2>
        {poolQ.isLoading ? (
          <Skeleton className="h-64" />
        ) : (poolQ.data?.length || 0) === 0 ? (
          <EmptyTableBlock
            title="No leads in pool."
            subtext="Import a CSV or wait for new website submissions to populate the pool."
          />
        ) : (
          <GCDataTable
            columns={cols}
            data={poolQ.data!}
            searchable
            searchPlaceholder="Search by name, email…"
            pageSize={20}
            onRowClick={(l) => setSelectedLead(toLeadDetail(l))}
          />
        )}
      </section>

      {/* Section — Recent Distributions (history of round-robin batches). */}
      <section
        id="distribution-history"
        aria-labelledby="founders-lead-dist-history-heading"
        className="mb-6 mt-8"
        data-tour-id={TOUR.FOUNDERS.LEAD_DIST.DISTRIBUTION_HISTORY}
      >
        <h2 id="founders-lead-dist-history-heading" className="mb-3" style={{ ...SECTION_LABEL_STYLE, margin: 0, marginBottom: "0.75rem" }}>
          Recent Distributions
        </h2>
        {distHistoryQ.isLoading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : distHistoryQ.data && distHistoryQ.data.length > 0 ? (
          <GCDataTable<DistributionBatch>
            columns={[
              {
                key: "distributedAt",
                label: "When",
                render: (v) => ageInDays(String(v || "")),
              },
              {
                key: "totalLeads",
                label: "Total Leads",
                align: "right",
                render: (v) => formatNumber(Number(v) || 0),
              },
              {
                key: "managers",
                label: "Managers",
                render: (_v, r) => {
                  const MAX_VISIBLE = 4;
                  const visible = r.managers.slice(0, MAX_VISIBLE);
                  const overflow = r.managers.length - visible.length;
                  const overflowTitle = r.managers
                    .slice(MAX_VISIBLE)
                    .map((m) => `${m.managerName}: ${m.leadCount}`)
                    .join(", ");
                  return (
                    <div className="flex flex-wrap gap-1.5">
                      {visible.map((m) => (
                        <span
                          key={m.managerId}
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{
                            backgroundColor: "var(--gc-surface-2)",
                            color: "var(--gc-text-secondary)",
                            border: "1px solid var(--gc-border)",
                          }}
                        >
                          {m.managerName}: {m.leadCount}
                        </span>
                      ))}
                      {overflow > 0 && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs"
                          title={overflowTitle}
                          style={{
                            backgroundColor: "var(--gc-surface-2)",
                            color: "var(--gc-text-muted)",
                            border: "1px dashed var(--gc-border)",
                          }}
                        >
                          +{overflow} more
                        </span>
                      )}
                    </div>
                  );
                },
              },
            ]}
            data={distHistoryQ.data}
            pageSize={10}
          />
        ) : (
          <EmptyTableBlock
            title="No distributions yet."
            subtext="Click 'Distribute Evenly' above to send leads to your managers."
          />
        )}
      </section>

      <div data-tour-id={TOUR.FOUNDERS.LEAD_DIST.DRAWER_LEAD}>
        <LeadDetailDrawer
          open={!!selectedLead}
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      </div>
    </div>
  );
}

function toLeadDetail(l: Lead): LeadDetail {
  const sourceLabel =
    l.source === "web_form"
      ? "Website"
      : l.source === "csv_import"
      ? "CSV Import"
      : l.source || "—";
  const history = [];
  if (l.importBatchId) {
    history.push({
      label: `Imported via ${l.importBatchId}`,
      date: l.createdAt ? new Date(l.createdAt).toISOString().slice(0, 10) : "",
      icon: "upload" as const,
    });
  } else if (l.source === "web_form" && l.createdAt) {
    history.push({
      label: "Submitted via website quoter",
      date: new Date(l.createdAt).toISOString().slice(0, 10),
      icon: "globe" as const,
    });
  }
  return {
    id: l.id,
    firstName: l.firstName,
    lastName: l.lastName,
    email: l.email ?? null,
    phone: l.phone ?? null,
    streetAddress: l.streetAddress ?? null,
    city: l.city ?? null,
    state: l.state ?? null,
    zipCode: l.zipCode ?? null,
    source: sourceLabel,
    sourceId: l.sourceId ?? null,
    product: l.product || l.coverageType || null,
    coverageType: l.coverageType || null,
    coverageAmount: l.coverageAmount ?? null,
    priority: l.priority ?? null,
    status: l.status ?? null,
    estimatedValue: l.estimatedValue ?? null,
    leadScore: l.leadScore ?? null,
    leadScoreTier: l.leadScoreTier ?? null,
    pipelineStage: l.pipelineStage ?? null,
    notes: l.notes ?? null,
    enrichmentData: l.enrichmentData ?? null,
    assignmentHistory: history,
  };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md p-3" style={{ backgroundColor: "var(--gc-surface-2)" }}>
      <div
        className="text-xs uppercase"
        style={{ color: "var(--gc-text-muted)", letterSpacing: "var(--gc-tracking-wider)" }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--gc-font-display)",
          fontSize: "var(--gc-text-xl)",
          color: "var(--gc-text-primary)",
        }}
      >
        {value}
      </div>
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
