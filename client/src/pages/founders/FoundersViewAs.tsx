import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Eye,
  Search,
  PlayCircle,
  StopCircle,
  User as UserIcon,
  Clock,
  Network,
  X as XIcon,
} from "lucide-react";
import {
  GCPageHeader,
  GCPrimaryButton,
  GCSecondaryButton,
  GCModal,
  GC_FORM_LABEL,
  GC_FORM_INPUT,
  GCKPICard,
  GCDataTable,
  GCPeriodSelector,
  type Column,
} from "@/components/gc";
import { Skeleton } from "@/components/ui/skeleton";
import { TOUR } from "@/lib/tour/selectors";
import { formatDate, formatDuration, ageInDays, formatNumber } from "./utils/format";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { csrfHeaders } from "@/lib/queryClient";

// Shared style tokens — mirror FoundersTeamPerformance.tsx so the founders
// pages render identically across the lounge.
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

// ─── TYPES ───
interface ViewAsTarget {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar_url?: string | null;
}

interface ViewAsSession {
  id: string;
  target_user_id: string;
  target_name: string;
  target_email: string;
  target_role: string;
  founder_user_id: string;
  started_at: string;
  ended_at?: string | null;
  reason: string;
}

// New /history response shape (camelCase).
interface ViewAsHistoryRow {
  id: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  reason: string;
  founderUserId: string;
  founderName: string;
  founderEmail: string;
  targetUserId: string;
  targetName: string;
  targetEmail: string;
  targetRole: string;
  autoExpired: boolean;
}

interface ViewAsKpis {
  sessionsCount: number;
  avgDurationSeconds: number;
  uniqueTargetsCount: number;
  autoExpiredCount: number;
  period: string;
}

// ─── CONFIG ───
const ROLE_LANDING_MAP: Record<string, string> = {
  sales_agent: "/hcms/my/dashboard",
  manager: "/hcms",
  owner: "/hcms",
  system_admin: "/hcms",
  executive: "/executive",
  investor: "/investors",
  client: "/hcms",
  founder: "/founders",
};

function getLandingPath(role: string): string {
  return ROLE_LANDING_MAP[role] ?? "/hcms";
}

const ROLE_LABEL: Record<string, string> = {
  founder: "Founder",
  owner: "Owner",
  system_admin: "Admin",
  manager: "Manager",
  sales_agent: "Agent",
  client: "Client",
  investor: "Investor",
  executive: "Executive",
};

// ─── API ───
async function fetchJSON<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (res.status === 404) return [] as unknown as T;
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function fetchJSONSingle<T = unknown>(url: string): Promise<T | null> {
  const res = await fetch(url, { credentials: "include" });
  if (res.status === 404 || res.status === 204) return null;
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function postJSON(url: string, body: Record<string, unknown> = {}) {
  // CSRF double-submit token required by the global write guard. Without
  // these headers POSTs to /viewas/session/start and /session/end return
  // 403 with a generic "Request failed" — Sentinel pattern.
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(await csrfHeaders()),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `Request failed (HTTP ${res.status})` }));
    throw new Error((err as { error?: string }).error || `Request failed (HTTP ${res.status})`);
  }
  return res.json();
}

// ─── MAIN ───
export default function FoundersViewAs() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [period, setPeriod] = useState<string>("ytd");
  const [filterFlag, setFilterFlag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [startTarget, setStartTarget] = useState<ViewAsTarget | null>(null);
  const [startReason, setStartReason] = useState("");
  const warnedRef = useRef(false);

  useEffect(() => {
    const h = setTimeout(() => setDebounced(search.trim()), 250);
    return () => clearTimeout(h);
  }, [search]);

  // Hash-anchor + filter pre-selection. KPI tiles use anchors like
  // "#history?filter=auto-expired" — when the hash changes (anchor click or
  // external navigation) we parse the optional filter fragment and snap the
  // history table's filter chip. Listens to both `hashchange` and a one-shot
  // synthetic event dispatched on mount so the initial load also honours it.
  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash || "";
      const m = hash.match(/\?filter=([\w_-]+)/);
      if (m && m[1]) {
        setFilterFlag(m[1]);
        // Strip the consumed query so re-clicking the same KPI tile (which
        // would otherwise produce an unchanged hash and skip `hashchange`)
        // re-fires the navigation. History anchor stays intact for scroll.
        const base = hash.split("?")[0];
        history.replaceState(null, "", base || "#history");
      } else if (hash === "#history") {
        setFilterFlag(null);
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // ─── QUERIES ───
  // Backend returns the nested shape `{ active, target?, session?, startedAt? }`
  // — normalize here into the flat `ViewAsSession` the rest of the page expects.
  // Returns null when there is no active session (so `activeSession` is falsy
  // and the picker UI renders instead of the in-active view).
  const sessionQuery = useQuery({
    queryKey: ["/api/founders/viewas/session"],
    queryFn: async (): Promise<ViewAsSession | null> => {
      const raw = await fetchJSONSingle<{
        active: boolean;
        startedAt?: string | null;
        target?: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          role: string;
        } | null;
        session?: {
          id?: string;
          founder_user_id?: string;
          target_user_id?: string;
          started_at?: string;
          ended_at?: string | null;
          reason?: string;
        } | null;
      }>("/api/founders/viewas/session");
      if (!raw || !raw.active || !raw.target || !raw.session) return null;
      const t = raw.target;
      const s = raw.session;
      // A "real" active session must have an actual target and a start time.
      // If either is missing we treat it as no-session and let the picker UI
      // render (a malformed session row otherwise renders blank meta + an
      // empty iframe — confusing for the founder).
      const targetName =
        `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim() || t.email || "";
      const startedAt = s.started_at ?? raw.startedAt ?? null;
      if (!targetName || !startedAt || !t.id) return null;
      return {
        id: s.id ?? "",
        target_user_id: s.target_user_id ?? t.id,
        target_name: targetName,
        target_email: t.email,
        target_role: t.role,
        founder_user_id: s.founder_user_id ?? "",
        started_at: startedAt,
        ended_at: s.ended_at ?? null,
        reason: s.reason ?? "",
      };
    },
    retry: 0,
    refetchInterval: 15_000,
  });
  const activeSession = sessionQuery.data;

  const targetsQuery = useQuery({
    queryKey: ["/api/founders/viewas/targets", debounced],
    queryFn: () => {
      const qs = debounced ? `?q=${encodeURIComponent(debounced)}` : "";
      return fetchJSON<ViewAsTarget[]>(`/api/founders/viewas/targets${qs}`);
    },
    enabled: !activeSession,
    retry: 0,
  });

  // Period-scoped KPIs for the View-As surface. Embed period in the URL
  // (queryClient default fetcher uses queryKey[0] as the URL verbatim; the
  // second key entry is a cache discriminator only).
  const kpisQ = useQuery<ViewAsKpis>({
    queryKey: [`/api/founders/viewas/kpis?period=${period}`, period],
    queryFn: () => fetchJSON<ViewAsKpis>(`/api/founders/viewas/kpis?period=${period}`),
    staleTime: 60_000,
    retry: 1,
  });

  // History — period + optional filter flag are baked into the URL and the
  // queryKey so cache invalidation / refetches behave correctly.
  const historyQ = useQuery<ViewAsHistoryRow[]>({
    queryKey: [
      `/api/founders/viewas/history?period=${period}${
        filterFlag === "auto-expired" ? "&filter=auto-expired" : ""
      }&limit=50`,
      period,
      filterFlag,
    ],
    queryFn: () =>
      fetchJSON<ViewAsHistoryRow[]>(
        `/api/founders/viewas/history?period=${period}${
          filterFlag === "auto-expired" ? "&filter=auto-expired" : ""
        }&limit=50`
      ),
    enabled: !activeSession,
    retry: 0,
  });

  // ─── MUTATIONS ───
  const startMutation = useMutation({
    mutationFn: (body: { targetUserId: string; reason: string }) =>
      postJSON("/api/founders/viewas/session/start", body),
    onSuccess: () => {
      toast({ title: "Session started", description: "Read-only mode active" });
      setStartTarget(null);
      setStartReason("");
      warnedRef.current = false;
      queryClient.invalidateQueries({ queryKey: ["/api/founders/viewas/session"] });
    },
    onError: (err: Error) =>
      toast({ title: "Failed to start session", description: err.message, variant: "destructive" }),
  });

  const endMutation = useMutation({
    mutationFn: () => postJSON("/api/founders/viewas/session/end"),
    onSuccess: () => {
      toast({ title: "Session ended", description: "View-As closed" });
      queryClient.invalidateQueries({ queryKey: ["/api/founders/viewas/session"] });
      // History + KPIs are period-scoped — invalidate by URL prefix via the
      // first key entry to catch any active period combination.
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey[0];
          return typeof k === "string" && k.startsWith("/api/founders/viewas/");
        },
      });
    },
    onError: (err: Error) =>
      toast({ title: "Failed to end session", description: err.message, variant: "destructive" }),
  });

  // ─── AUTO-WARN AT 60 MIN ───
  useEffect(() => {
    if (!activeSession) {
      warnedRef.current = false;
      return;
    }
    const started = new Date(activeSession.started_at).getTime();
    if (Number.isNaN(started)) return;
    const check = () => {
      const elapsed = Date.now() - started;
      if (elapsed >= 60 * 60 * 1000 && !warnedRef.current) {
        warnedRef.current = true;
        toast({
          title: "Session running long",
          description: "You've been viewing-as for over 60 minutes — end when done.",
        });
      }
    };
    check();
    const h = setInterval(check, 60_000);
    return () => clearInterval(h);
  }, [activeSession, toast]);

  const targets = targetsQuery.data ?? [];
  const historyRows = historyQ.data ?? [];

  const filteredTargets = useMemo(() => {
    // Founder-to-founder impersonation is blocked for audit clarity.
    const safeTargets = targets.filter((t) => t.role !== "founder");
    if (!debounced) return safeTargets;
    const q = debounced.toLowerCase();
    return safeTargets.filter((t) =>
      [t.first_name, t.last_name, t.email, t.role].join(" ").toLowerCase().includes(q)
    );
  }, [targets, debounced]);

  // ─── HISTORY COLUMNS ───
  const historyColumns: Column<ViewAsHistoryRow>[] = [
    {
      key: "startedAt",
      label: "Started",
      sortable: true,
      render: (v) => (
        <span
          title={formatDate(v as string, "datetime")}
          style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-secondary)" }}
        >
          {ageInDays(v as string)}
        </span>
      ),
    },
    { key: "founderName", label: "Founder", sortable: true },
    {
      key: "targetName",
      label: "Target",
      sortable: true,
      render: (_v, r) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)" }}>
            {r.targetName}
          </span>
          <span
            className="self-start"
            style={{
              fontSize: "var(--gc-text-xs)",
              color: "var(--gc-text-secondary)",
              padding: "1px 6px",
              borderRadius: "var(--gc-radius-full)",
              backgroundColor: "var(--gc-surface-2)",
              border: "1px solid var(--gc-border-subtle)",
              width: "fit-content",
            }}
          >
            {ROLE_LABEL[r.targetRole] || r.targetRole}
          </span>
        </div>
      ),
    },
    {
      key: "durationSeconds",
      label: "Duration",
      sortable: true,
      render: (_v, r) => {
        if (!r.endedAt) {
          return (
            <span
              className="px-2 py-0.5 rounded-full text-xs"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--gc-status-active) 18%, transparent)",
                color: "var(--gc-status-active)",
                fontWeight: 500,
              }}
            >
              Active
            </span>
          );
        }
        return (
          <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-secondary)" }}>
            {formatDuration(r.durationSeconds)}
          </span>
        );
      },
    },
    {
      key: "reason",
      label: "Reason",
      render: (v) => {
        const full = (v as string) || "";
        const truncated = full.length > 50 ? `${full.slice(0, 47)}…` : full || "—";
        return (
          <span
            title={full || undefined}
            style={{
              fontSize: "var(--gc-text-xs)",
              color: "var(--gc-text-secondary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {truncated}
          </span>
        );
      },
    },
    {
      key: "autoExpired",
      label: "Auto-Expired",
      render: (v) =>
        v ? (
          <span
            className="px-2 py-0.5 rounded-full text-xs"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--gc-status-terminated, #E07060) 18%, transparent)",
              color: "var(--gc-status-terminated, #E07060)",
              fontWeight: 500,
            }}
          >
            Auto-expired
          </span>
        ) : (
          <span style={{ color: "var(--gc-text-muted)", fontSize: "var(--gc-text-xs)" }}>—</span>
        ),
    },
    {
      key: "id",
      label: "Action",
      render: (_v, r) =>
        r.endedAt ? (
          <span style={{ color: "var(--gc-text-muted)", fontSize: "var(--gc-text-xs)" }}>—</span>
        ) : (
          <button
            onClick={() => endMutation.mutate()}
            disabled={endMutation.isPending}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--gc-status-terminated, #E07060) 12%, transparent)",
              color: "var(--gc-status-terminated, #E07060)",
              border: "1px solid var(--gc-status-terminated, #E07060)",
              fontWeight: 600,
              cursor: endMutation.isPending ? "not-allowed" : "pointer",
              opacity: endMutation.isPending ? 0.6 : 1,
            }}
            title="End this active session now"
          >
            End
          </button>
        ),
    },
  ];

  // Page-level error guard — blank out only when EVERY core query errors.
  // Targets/imports-style snapshot queries are intentionally excluded so a
  // backend hiccup on one snapshot doesn't kill the whole page (mirrors
  // FoundersTeamPerformance).
  const allErrored = !!(kpisQ.error && historyQ.error && sessionQuery.error);
  const firstError = kpisQ.error || historyQ.error || sessionQuery.error;

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
          Unable to load View-As
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

  const autoExpiredCount = kpisQ.data?.autoExpiredCount ?? 0;

  // ─── RENDER ───
  return (
    <div>
      <div data-tour-id={TOUR.FOUNDERS.VIEWAS.HEADER}>
        <GCPageHeader
          title="View As"
          subtitle="Read-only impersonation across any lounge or role"
          accentUnderline
          actions={
            <div className="flex items-center gap-2">
              <div
                className="inline-flex items-center gap-1.5"
                style={{
                  padding: "4px 10px",
                  borderRadius: "var(--gc-radius-full)",
                  fontSize: "var(--gc-text-xs)",
                  fontFamily: "var(--gc-font-body)",
                  fontWeight: 500,
                  color: activeSession ? "var(--gc-status-active)" : "var(--gc-text-muted)",
                  backgroundColor: activeSession
                    ? "color-mix(in srgb, var(--gc-status-active) 15%, transparent)"
                    : "var(--gc-surface-2)",
                  border: `1px solid ${
                    activeSession
                      ? "color-mix(in srgb, var(--gc-status-active) 30%, transparent)"
                      : "var(--gc-border)"
                  }`,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "var(--gc-radius-full)",
                    backgroundColor: activeSession
                      ? "var(--gc-status-active)"
                      : "var(--gc-text-muted)",
                  }}
                />
                {activeSession
                  ? (() => {
                      const name = activeSession.target_name || "session";
                      return `Active as ${name.length > 16 ? name.slice(0, 14) + "…" : name}`;
                    })()
                  : "Idle"}
              </div>
              <GCPeriodSelector value={period} onChange={setPeriod} />
              <Link
                href="/founders/hierarchy"
                className="inline-flex items-center gap-1.5 px-3 py-2"
                style={OUTLINED_BUTTON_STYLE}
                title="Manage Hierarchy"
              >
                <Network className="w-4 h-4" />
                <span className="hidden xl:inline">Manage Hierarchy →</span>
              </Link>
            </div>
          }
        />
      </div>

      {/* KPI strip — drill-in via wouter Link to in-page anchors. The
          "Auto-Expired" tile carries `?filter=auto-expired` so the history
          table's filter chip snaps to auto-expired only on click. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-6">
        {kpisQ.isLoading || !kpisQ.data ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[116px] w-full" />
          ))
        ) : (
          <>
            <Link
              href="#history"
              style={{ textDecoration: "none", cursor: "pointer" }}
              className="block transition-transform hover:-translate-y-[1px]"
            >
              <GCKPICard
                label="Sessions This Period"
                value={formatNumber(kpisQ.data.sessionsCount)}
                accentTop
                tooltip={`Total View-As sessions in ${period
                  .replace(/-/g, " ")
                  .toUpperCase()}`}
              />
            </Link>
            <Link
              href="#history"
              style={{ textDecoration: "none", cursor: "pointer" }}
              className="block transition-transform hover:-translate-y-[1px]"
            >
              <GCKPICard
                label="Avg Duration"
                value={formatDuration(kpisQ.data.avgDurationSeconds)}
                accentTop
                tooltip="Average length of completed sessions"
              />
            </Link>
            <Link
              href="#history"
              style={{ textDecoration: "none", cursor: "pointer" }}
              className="block transition-transform hover:-translate-y-[1px]"
            >
              <GCKPICard
                label="Unique Targets"
                value={formatNumber(kpisQ.data.uniqueTargetsCount)}
                accentTop
                tooltip="Distinct users impersonated"
              />
            </Link>
            <Link
              href="#history?filter=auto-expired"
              style={{ textDecoration: "none", cursor: "pointer" }}
              className="block transition-transform hover:-translate-y-[1px]"
            >
              <GCKPICard
                label="Auto-Expired"
                value={formatNumber(autoExpiredCount)}
                accentTop
                tooltip="Sessions that hit the 4-hour cap"
                className={autoExpiredCount > 0 ? "gc-kpi-danger" : undefined}
              />
            </Link>
          </>
        )}
      </div>

      {activeSession ? (
        <ActiveSessionView
          session={activeSession}
          onEnd={() => endMutation.mutate()}
          endPending={endMutation.isPending}
        />
      ) : (
        <>
          {/* ─── SEARCH + PICKER ─── */}
          <div
            className="p-4 mb-4"
            data-tour-id={TOUR.FOUNDERS.VIEWAS.TARGETS_TABLE}
            style={CARD_STYLE}
          >
            <div
              className="mb-2"
              style={{
                fontFamily: "var(--gc-font-display)",
                fontSize: "var(--gc-text-base)",
                color: "var(--gc-text-primary)",
                fontWeight: 600,
              }}
            >
              Pick a target
            </div>
            <div className="relative mb-4" data-tour-id={TOUR.FOUNDERS.VIEWAS.SEARCH}>
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--gc-text-muted)" }}
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or role…"
                className="pl-9"
              />
            </div>

            {targetsQuery.isError ? (
              <div
                className="py-8 text-center"
                style={{
                  color: "var(--gc-text-muted)",
                  fontFamily: "var(--gc-font-body)",
                  fontSize: "var(--gc-text-sm)",
                }}
              >
                Couldn't load targets. {(targetsQuery.error as Error | undefined)?.message || "Try refreshing in a moment."}
              </div>
            ) : filteredTargets.length === 0 ? (
              <div
                className="py-8 text-center"
                style={{
                  color: "var(--gc-text-muted)",
                  fontFamily: "var(--gc-font-body)",
                  fontSize: "var(--gc-text-sm)",
                }}
              >
                {debounced
                  ? `No matches for "${debounced}".`
                  : "No impersonation-eligible users yet. Approve agents from /founders/access to populate this list. (Founders, owners, and system admins are excluded by the denylist.)"}
              </div>
            ) : (
              <>
                <div
                  className="mb-2"
                  style={{
                    fontFamily: "var(--gc-font-body)",
                    fontSize: "var(--gc-text-xs)",
                    color: "var(--gc-text-muted)",
                  }}
                >
                  Founder-to-founder impersonation is blocked for audit clarity.
                </div>
                <div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-1 content-start auto-rows-min items-start"
                  style={{ maxHeight: "calc(100vh - 460px)" }}
                >
                  {filteredTargets.map((t) => {
                    const fullName =
                      `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim();
                    const displayName = fullName || t.email;
                    const initials = fullName
                      ? `${t.first_name?.[0] ?? ""}${t.last_name?.[0] ?? ""}`
                      : (t.email?.[0] ?? "?").toUpperCase();
                    return (
                      <div
                        key={t.id}
                        className="p-3 flex flex-col gap-2"
                        style={{
                          backgroundColor: "var(--gc-surface-2)",
                          border: "1px solid var(--gc-border-subtle)",
                          borderRadius: "var(--gc-radius-sm)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "var(--gc-radius-full)",
                              backgroundColor: "var(--gc-surface)",
                              border: "1px solid var(--gc-border)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--gc-gold)",
                              fontWeight: 600,
                              flexShrink: 0,
                              textTransform: "uppercase",
                            }}
                          >
                            {initials || "?"}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                fontSize: "var(--gc-text-sm)",
                                color: "var(--gc-text-primary)",
                                fontWeight: 500,
                                lineHeight: 1.2,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              title={displayName}
                            >
                              {displayName}
                            </div>
                            {fullName && (
                              <div
                                style={{
                                  fontSize: "var(--gc-text-xs)",
                                  color: "var(--gc-text-muted)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                title={t.email}
                              >
                                {t.email}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span
                            style={{
                              fontSize: "var(--gc-text-xs)",
                              color: "var(--gc-text-secondary)",
                              padding: "2px 8px",
                              backgroundColor: "var(--gc-surface)",
                              borderRadius: "var(--gc-radius-full)",
                              border: "1px solid var(--gc-border-subtle)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {ROLE_LABEL[t.role] || t.role}
                          </span>
                          <GCPrimaryButton
                            size="sm"
                            onClick={() => setStartTarget(t)}
                            icon={<PlayCircle className="w-4 h-4" />}
                          >
                            Start
                          </GCPrimaryButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* ─── HISTORY ─── */}
          <div id="history">
            <div
              className="mt-4 mb-2 flex items-center justify-between flex-wrap gap-2"
              style={SECTION_LABEL_STYLE}
            >
              <span>
                Recent Sessions · {period.replace(/-/g, " ").toUpperCase()}
              </span>
              {filterFlag && (
                <button
                  onClick={() => {
                    setFilterFlag(null);
                    history.replaceState(null, "", "#history");
                  }}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--gc-gold) 15%, transparent)",
                    color: "var(--gc-gold)",
                    border: "1px solid color-mix(in srgb, var(--gc-gold) 35%, transparent)",
                    fontFamily: "var(--gc-font-body)",
                    fontSize: "var(--gc-text-xs)",
                    fontWeight: 500,
                    textTransform: "none",
                    letterSpacing: "normal",
                    cursor: "pointer",
                  }}
                  title="Clear filter"
                >
                  Filter: Auto-expired only
                  <XIcon className="w-3 h-3" />
                </button>
              )}
            </div>
            <div data-tour-id={TOUR.FOUNDERS.VIEWAS.HISTORY_TABLE}>
              {historyQ.isLoading ? (
                <Skeleton className="h-[240px] w-full" />
              ) : historyQ.isError ? (
                <EmptyTableBlock
                  title="Couldn't load session history."
                  subtext="The /api/founders/viewas/history endpoint returned an error."
                />
              ) : historyRows.length === 0 ? (
                <EmptyTableBlock
                  title="No view-as sessions in period."
                  subtext="Sessions appear here as soon as a founder starts an impersonation."
                />
              ) : (
                <GCDataTable
                  columns={historyColumns}
                  data={historyRows}
                  searchable
                  searchPlaceholder="Search sessions…"
                  pageSize={10}
                />
              )}
            </div>
          </div>
        </>
      )}

      {/* ─── START SESSION MODAL ─── */}
      {startTarget && (
        <GCModal
          title="Start View-As Session"
          icon={<Eye className="w-5 h-5" style={{ color: "var(--gc-gold)" }} />}
          subtitle={`You'll view the app as ${
            `${startTarget.first_name ?? ""} ${startTarget.last_name ?? ""}`.trim() ||
            startTarget.email
          }. Writes are blocked server-side; all activity is recorded.`}
          onClose={() => {
            setStartTarget(null);
            setStartReason("");
          }}
          width={500}
        >
          <div>
            <label style={GC_FORM_LABEL}>Reason *</label>
            <textarea
              value={startReason}
              onChange={(e) => setStartReason(e.target.value)}
              placeholder="What are you investigating?"
              rows={3}
              style={{ ...GC_FORM_INPUT, resize: "vertical" }}
            />
          </div>
          <div className="flex items-center justify-end gap-2 mt-6">
            <GCSecondaryButton onClick={() => setStartTarget(null)}>Cancel</GCSecondaryButton>
            <GCPrimaryButton
              disabled={!startReason.trim() || startMutation.isPending}
              icon={<PlayCircle className="w-4 h-4" />}
              onClick={() => {
                if (!startTarget || !startReason.trim()) return;
                startMutation.mutate({
                  targetUserId: startTarget.id,
                  reason: startReason.trim(),
                });
              }}
            >
              Start session
            </GCPrimaryButton>
          </div>
        </GCModal>
      )}
    </div>
  );
}

// ─── ACTIVE SESSION VIEW ───
function ActiveSessionView({
  session,
  onEnd,
  endPending,
}: {
  session: ViewAsSession;
  onEnd: () => void;
  endPending: boolean;
}) {
  const basePath = getLandingPath(session.target_role);
  // Append ?viewas=1 so the child page can detect being iframed in View-As mode
  // (and e.g. suppress the nested banner). Preserves any existing query string.
  const targetPath = basePath.includes("?")
    ? `${basePath}&viewas=1`
    : `${basePath}?viewas=1`;

  // Wave AD3: live countdown to the 4-hour hard cap enforced by the
  // server-side viewAsSweeper. Updates every 30s so the banner reflects
  // remaining time without burning render cycles. Color shifts to the
  // warning palette when under 60 minutes remain.
  const SESSION_HARD_CAP_MS = 4 * 60 * 60 * 1000;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const h = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(h);
  }, []);
  const startedMs = new Date(session.started_at).getTime();
  const remainingMs = Number.isNaN(startedMs)
    ? null
    : Math.max(0, SESSION_HARD_CAP_MS - (now - startedMs));
  const remainingLabel = (() => {
    if (remainingMs === null) return null;
    const totalMin = Math.floor(remainingMs / 60_000);
    if (totalMin <= 0) return "expiring now";
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  })();
  const isWarning = remainingMs !== null && remainingMs < 60 * 60 * 1000;

  return (
    <div>
      {/* ─── SESSION META + IN-PAGE END BUTTON ───
          The GlobalViewAsBanner (App.tsx) is also pinned to the top of every
          page, but it's gated by user role. This in-page End button is the
          guaranteed escape hatch right next to the impersonated iframe — no
          matter what state the global banner's poll is in. */}
      <div
        className="flex items-center flex-wrap gap-4 mb-3 p-3"
        data-tour-id={TOUR.FOUNDERS.VIEWAS.ACTIVE_BANNER}
        style={{
          backgroundColor: "var(--gc-surface-2)",
          border: "1px solid var(--gc-border-subtle)",
          borderRadius: "var(--gc-radius-sm)",
          fontSize: "var(--gc-text-xs)",
          color: "var(--gc-text-secondary)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <UserIcon className="w-3.5 h-3.5" />
          <span>{session.target_email}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ color: "var(--gc-text-muted)" }}>Role:</span>
          <span>{ROLE_LABEL[session.target_role] || session.target_role}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Started {formatDate(session.started_at, "datetime")}</span>
        </div>
        {remainingLabel && (
          <div
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              border: `1px solid ${isWarning ? "var(--gc-status-terminated, #E07060)" : "var(--gc-gold)"}`,
              color: isWarning ? "var(--gc-status-terminated, #E07060)" : "var(--gc-gold)",
              backgroundColor: isWarning
                ? "color-mix(in srgb, var(--gc-status-terminated, #E07060) 12%, transparent)"
                : "color-mix(in srgb, var(--gc-gold) 12%, transparent)",
            }}
            title={`Hard cap: 4h. Auto-expires at ${formatDate(new Date(startedMs + SESSION_HARD_CAP_MS).toISOString(), "datetime")}.`}
          >
            Expires in {remainingLabel}
          </div>
        )}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span style={{ color: "var(--gc-text-muted)" }}>Reason:</span>
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={session.reason}
          >
            {session.reason}
          </span>
        </div>
        <button
          type="button"
          onClick={onEnd}
          disabled={endPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded ml-auto"
          style={{
            backgroundColor: "var(--gc-status-terminated, #E07060)",
            color: "#FFFFFF",
            border: "1px solid var(--gc-status-terminated, #E07060)",
            fontSize: "var(--gc-text-xs)",
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            cursor: endPending ? "not-allowed" : "pointer",
            opacity: endPending ? 0.6 : 1,
          }}
        >
          <StopCircle className="w-3.5 h-3.5" />
          {endPending ? "Ending…" : "End Session"}
        </button>
      </div>

      {/* ─── IFRAME ─── */}
      <iframe
        src={targetPath}
        title={`View As ${session.target_name || "session"}`}
        className="w-full border rounded-md"
        style={{
          height: "calc(100vh - 260px)",
          minHeight: 420,
          backgroundColor: "var(--gc-surface)",
          border: "1px solid var(--gc-border)",
          borderRadius: "var(--gc-radius-md)",
        }}
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
}

// ─── EMPTY TABLE BLOCK ───
// Verbatim copy of the helper used across the founders pages so the empty
// states render identically (FoundersTeamPerformance, FoundersLeadDistribution,
// FoundersLoungeAccess all use this exact shape).
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
