import { useState, useMemo, useEffect, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  UserPlus,
  Check,
  X,
  Crown,
  Eye,
  Mail,
  Phone,
  Clock,
  Award,
  FileText,
  Send,
  Network,
  UserCircle2,
} from "lucide-react";
import {
  GCPageHeader,
  GCKPICard,
  GCDataTable,
  GCStatusBadge,
  GCPrimaryButton,
  GCSecondaryButton,
  GCModal,
  GC_FORM_LABEL,
  GC_FORM_INPUT,
  GCSwitch,
  GCSelect,
  GCTabs,
  GCTabsList,
  GCTabsTrigger,
  GCTabsContent,
  useGCTheme,
  type Column,
} from "@/components/gc";
import { Skeleton } from "@/components/ui/skeleton";
import { TOUR } from "@/lib/tour/selectors";
import { formatDate } from "./utils/format";
import { SendApplicationDialog } from "@/components/SendApplicationDialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { csrfHeaders } from "@/lib/queryClient";
import {
  loungeAccessDemo,
  filterMembersByTwoFactor,
  filterMembersByIdle,
  type AccessKpis,
} from "./utils/loungeAccessDemo";

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
interface PendingRegistration {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  years_experience?: number | null;
  license_number?: string | null;
  licensed_states?: string[] | null;
  is_licensed?: boolean;
  referral_source?: string | null;
  applied_at: string;
}

interface MemberRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  approval_status?: string | null;
  last_login_at?: string | null;
  avatar_url?: string | null;
}

interface AuditRow {
  id: string;
  created_at: string;
  actor_name: string;
  action_type: string;
  target_name: string;
  previous_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  reason?: string | null;
}

interface LoungeAccessRow {
  lounge_key: string;
  granted: boolean;
}

// ─── CONFIG ───
const LOUNGE_DEFS = [
  { key: "agent_lounge", label: "Agent" },
  { key: "manager_lounge", label: "Manager" },
  { key: "executive_lounge", label: "Executive" },
  { key: "investor_lounge", label: "Investor" },
  { key: "founders_lounge", label: "Founders" },
] as const;

const ROLE_LABEL: Record<string, string> = {
  founder: "Founder",
  owner: "Owner",
  system_admin: "Admin",
  manager: "Manager",
  sales_agent: "Agent",
  client: "Client",
  investor: "Investor",
};

const ROLE_COLOR: Record<string, string> = {
  founder: "var(--gc-gold)",
  owner: "var(--gc-gold-bright)",
  system_admin: "var(--gc-chart-4)",      // blue
  manager: "var(--gc-chart-2)",            // purple
  sales_agent: "var(--gc-chart-3)",        // green
  investor: "var(--gc-chart-5)",           // amber
  client: "var(--gc-text-secondary)",
};

// ─── API (frontend demo store) ───
// All /api/members* calls route to the in-memory loungeAccessDemo store so the
// page is fully functional without any backend. Approve / reject / invite /
// lounge-toggle mutations all persist in memory until page refresh.
async function fetchJSON<T = unknown>(url: string): Promise<T> {
  // Strip the origin/leading "/" and split off any querystring.
  const [path, qs] = url.split("?");
  const params = new URLSearchParams(qs || "");

  if (path === "/api/members/pending") {
    return loungeAccessDemo.listPending() as unknown as T;
  }
  if (path === "/api/members") {
    return loungeAccessDemo.listMembers({
      role: params.get("role") || undefined,
      status: params.get("status") || undefined,
      approval: params.get("approval_status") || undefined,
    }) as unknown as T;
  }
  if (path === "/api/members/audit") {
    return loungeAccessDemo.listAudit(params.get("actionType") || undefined) as unknown as T;
  }
  const accessMatch = path.match(/^\/api\/members\/([^/]+)\/lounge-access$/);
  if (accessMatch) {
    return loungeAccessDemo.getLoungeAccess(accessMatch[1]) as unknown as T;
  }

  // Fallback: real network for anything else.
  const res = await fetch(url, { credentials: "include" });
  if (res.status === 404) return [] as unknown as T;
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function postJSON(url: string, body: Record<string, unknown>) {
  const approveMatch = url.match(/^\/api\/members\/([^/]+)\/approve$/);
  if (approveMatch) {
    const r = loungeAccessDemo.approve(approveMatch[1]);
    if (!r.ok) throw new Error(r.error);
    return r;
  }
  const rejectMatch = url.match(/^\/api\/members\/([^/]+)\/reject$/);
  if (rejectMatch) {
    const r = loungeAccessDemo.reject(rejectMatch[1], String(body.reason || ""));
    if (!r.ok) throw new Error(r.error);
    return r;
  }
  const toggleMatch = url.match(/^\/api\/members\/([^/]+)\/lounge\/([^/]+)$/);
  if (toggleMatch) {
    const r = loungeAccessDemo.toggleLounge(toggleMatch[1], toggleMatch[2], !!body.granted);
    if (!r.ok) throw new Error(r.error);
    return r;
  }
  if (url === "/api/members/invite") {
    const r = loungeAccessDemo.invite({
      email: String(body.email || ""),
      first_name: String(body.first_name || ""),
      last_name: String(body.last_name || ""),
      role: String(body.role || "sales_agent"),
    });
    if (!r.ok) throw new Error(r.error);
    return r;
  }

  // Fallback: real network for anything else.
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error((err as { error?: string }).error || "Request failed");
  }
  return res.json();
}

// Format a raw audit-payload value into a short readable string.
function renderAuditValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
    return String(v);
  }
  if (Array.isArray(v)) return v.length ? v.join(", ") : "—";
  try {
    const s = JSON.stringify(v);
    return s.length > 40 ? `${s.slice(0, 37)}…` : s;
  } catch {
    return "—";
  }
}

// Diff two audit JSON values field-by-field. Returns only the keys that changed.
// Falls back to a single "value" entry for non-object payloads.
function diffJsonValues(
  prev: unknown,
  next: unknown
): Array<{ key: string; before: string; after: string }> {
  const isObj = (x: unknown): x is Record<string, unknown> =>
    !!x && typeof x === "object" && !Array.isArray(x);

  if (!isObj(prev) && !isObj(next)) {
    if (prev === next) return [];
    return [{ key: "value", before: renderAuditValue(prev), after: renderAuditValue(next) }];
  }

  const before = isObj(prev) ? prev : {};
  const after = isObj(next) ? next : {};
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
  const diffs: Array<{ key: string; before: string; after: string }> = [];
  for (const k of keys) {
    const b = before[k];
    const a = after[k];
    if (JSON.stringify(b) === JSON.stringify(a)) continue;
    diffs.push({ key: k, before: renderAuditValue(b), after: renderAuditValue(a) });
  }
  return diffs;
}

// ─── SMALL UI PIECES ───
function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: "var(--gc-text-xs)",
        color: "var(--gc-text-muted)",
        textTransform: "uppercase",
        letterSpacing: "var(--gc-tracking-wider)",
        fontFamily: "var(--gc-font-body)",
      }}
    >
      {children}
    </span>
  );
}

function PendingMeta({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label?: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {icon && <span style={{ color: "var(--gc-text-muted)" }}>{icon}</span>}
      {label && (
        <span
          style={{
            fontSize: "var(--gc-text-xs)",
            color: "var(--gc-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "var(--gc-tracking-wider)",
          }}
        >
          {label}
        </span>
      )}
      <span
        style={{
          color: "var(--gc-text-primary)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ApprovalPill({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    approved: { color: "var(--gc-status-active)", bg: "color-mix(in srgb, var(--gc-status-active) 14%, transparent)" },
    pending: { color: "var(--gc-status-pending)", bg: "color-mix(in srgb, var(--gc-status-pending) 14%, transparent)" },
    rejected: { color: "var(--gc-status-terminated)", bg: "color-mix(in srgb, var(--gc-status-terminated) 14%, transparent)" },
  };
  const tone = map[status.toLowerCase()] || { color: "var(--gc-text-muted)", bg: "var(--gc-surface-2)" };
  return (
    <span
      className="inline-flex items-center font-medium"
      style={{
        padding: "2px 10px",
        borderRadius: "var(--gc-radius-full)",
        fontSize: "var(--gc-text-xs)",
        fontFamily: "var(--gc-font-body)",
        color: tone.color,
        backgroundColor: tone.bg,
        border: `1px solid color-mix(in srgb, ${tone.color} 30%, transparent)`,
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const color = ROLE_COLOR[role] || "var(--gc-text-muted)";
  const label = ROLE_LABEL[role] || role;
  return (
    <span
      className="inline-flex items-center font-medium"
      style={{
        padding: "2px 8px",
        borderRadius: "var(--gc-radius-full)",
        fontSize: "var(--gc-text-xs)",
        fontFamily: "var(--gc-font-body)",
        color,
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      {label}
    </span>
  );
}


// Color-coded pill for audit action types.
function ActionPill({ action }: { action: string }) {
  const map: Record<string, string> = {
    grant: "var(--gc-status-active)",
    revoke: "var(--gc-status-terminated)",
    approve: "var(--gc-status-active)",
    reject: "var(--gc-status-terminated)",
    invite: "var(--gc-gold)",
    role_change: "var(--gc-chart-4)",
    view_as_started: "var(--gc-chart-2)",
    view_as_ended: "var(--gc-text-muted)",
  };
  const color = map[action] || "var(--gc-text-muted)";
  return (
    <span
      className="inline-flex items-center font-medium"
      style={{
        padding: "3px 10px",
        borderRadius: "var(--gc-radius-full)",
        fontSize: "var(--gc-text-xs)",
        fontFamily: "var(--gc-font-body)",
        color,
        backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
        textTransform: "capitalize",
        letterSpacing: "0.02em",
      }}
    >
      {action.replace(/_/g, " ")}
    </span>
  );
}

// ─── MAIN ───
export default function FoundersLoungeAccess() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { theme } = useGCTheme();
  const { user: currentUser } = useAuth();

  // UI state
  const [activeTab, setActiveTab] = useState("pending");
  const [inviteOpen, setInviteOpen] = useState(false);

  const [rejectTarget, setRejectTarget] = useState<PendingRegistration | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null);
  const [memberFilterRole, setMemberFilterRole] = useState<string>("all");
  const [memberFilterStatus, setMemberFilterStatus] = useState<string>("all");
  const [memberFilterApproval, setMemberFilterApproval] = useState<string>("all");

  // KPI drill-in: when a tile sets `?filter=no-2fa` or `?filter=idle60`, the
  // Members tab pre-applies the matching demo-store helper before rendering.
  // Cleared automatically when any other Members filter is changed.
  const [filterFlag, setFilterFlag] = useState<"" | "no-2fa" | "idle60">("");

  const [founderGrantTarget, setFounderGrantTarget] = useState<
    { userId: string; memberName: string; granted: boolean } | null
  >(null);

  // Impersonate (View-As) modal target — the per-row Impersonate button on
  // the Members tab opens this confirmation. Submission posts to the
  // /api/founders/viewas/session/start endpoint Forge ships in parallel.
  const [impersonateTarget, setImpersonateTarget] = useState<MemberRow | null>(null);
  const [impersonateReason, setImpersonateReason] = useState("");
  const [impersonateSubmitting, setImpersonateSubmitting] = useState(false);

  const [auditSearch, setAuditSearch] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState<string>("all");

  // Hash-tab + filter pre-selection. KPI tiles use anchors like
  // "#members?filter=no-2fa". On every hashchange we parse the tab name and
  // optional filter, then strip the consumed query so re-clicks still re-fire
  // (plain hash navigation skips `hashchange` when the URL is unchanged).
  // Mirrors FoundersLeadDistribution.tsx:193-211.
  useEffect(() => {
    const VALID_TABS = new Set(["pending", "members", "lounge", "audit", "matrix"]);
    const VALID_FILTERS = new Set(["no-2fa", "idle60"]);
    const sync = () => {
      const hash = window.location.hash || "";
      // Strip leading "#" then split tab from optional ?filter=...
      const raw = hash.replace(/^#/, "");
      const [rawTab, qs] = raw.split("?");
      // Map "matrix" alias from the spec → the actual tab value "lounge".
      const tabName = rawTab === "matrix" ? "lounge" : rawTab;
      if (tabName && VALID_TABS.has(tabName)) {
        setActiveTab(tabName === "matrix" ? "lounge" : tabName);
      }
      const m = (qs || "").match(/filter=([\w-]+)/);
      if (m && m[1] && VALID_FILTERS.has(m[1])) {
        setFilterFlag(m[1] as "no-2fa" | "idle60");
        // Strip the consumed query so re-clicking the same KPI tile re-fires.
        history.replaceState(null, "", `#${tabName}`);
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // ─── QUERIES ───
  const pendingQuery = useQuery({
    queryKey: ["/api/members/pending"],
    queryFn: () => fetchJSON<PendingRegistration[]>("/api/members/pending"),
    retry: 0,
  });

  const membersQuery = useQuery({
    queryKey: ["/api/members", memberFilterRole, memberFilterStatus, memberFilterApproval],
    queryFn: () => {
      const params = new URLSearchParams();
      if (memberFilterRole !== "all") params.set("role", memberFilterRole);
      if (memberFilterStatus !== "all") params.set("status", memberFilterStatus);
      if (memberFilterApproval !== "all") params.set("approval_status", memberFilterApproval);
      const qs = params.toString();
      return fetchJSON<MemberRow[]>(`/api/members${qs ? `?${qs}` : ""}`);
    },
    retry: 0,
  });

  const auditQuery = useQuery({
    queryKey: ["/api/members/audit", auditActionFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (auditActionFilter !== "all") params.set("actionType", auditActionFilter);
      const qs = params.toString();
      return fetchJSON<AuditRow[]>(`/api/members/audit${qs ? `?${qs}` : ""}`);
    },
    retry: 0,
  });

  const memberAccessQuery = useQuery({
    queryKey: ["/api/members/lounge-access", selectedMember?.id],
    queryFn: () =>
      fetchJSON<LoungeAccessRow[]>(`/api/members/${selectedMember!.id}/lounge-access`),
    enabled: !!selectedMember,
    retry: 0,
  });

  // Access KPI strip — sourced from the same in-memory demo store as the
  // member tables. We wrap the synchronous getter in TanStack Query so it
  // shares the loading / error skeleton machinery with the rest of the page,
  // and so a future swap to a real /api/founders/access/kpis endpoint is a
  // one-line change to the queryFn.
  const accessKpisQuery = useQuery<AccessKpis>({
    queryKey: ["lounge-access-kpis"],
    queryFn: async () => loungeAccessDemo.getAccessKpis(),
    staleTime: 30_000,
    retry: 0,
  });

  // Page-level error guard — only blank out if EVERY core query errors.
  // Mirrors FoundersTeamPerformance.tsx:120-148.
  const allErrored = !!(
    membersQuery.error &&
    pendingQuery.error &&
    auditQuery.error
  );
  const firstError = membersQuery.error || pendingQuery.error || auditQuery.error;

  // ─── MUTATIONS ───
  const approveMutation = useMutation({
    mutationFn: (id: string) => postJSON(`/api/members/${id}/approve`, {}),
    onSuccess: () => {
      toast({ title: "Approved", description: "Registration approved" });
      queryClient.invalidateQueries({ queryKey: ["/api/members/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members/audit"] });
    },
    onError: (err: Error) =>
      toast({ title: "Approval failed", description: err.message, variant: "destructive" }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      postJSON(`/api/members/${id}/reject`, { reason }),
    onSuccess: () => {
      toast({ title: "Rejected", description: "Registration rejected" });
      setRejectTarget(null);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["/api/members/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members/audit"] });
    },
    onError: (err: Error) =>
      toast({ title: "Rejection failed", description: err.message, variant: "destructive" }),
  });

  const toggleLoungeMutation = useMutation({
    mutationFn: ({
      userId,
      loungeKey,
      granted,
    }: {
      userId: string;
      loungeKey: string;
      granted: boolean;
    }) => postJSON(`/api/members/${userId}/lounge/${loungeKey}`, { granted }),
    onSuccess: (_d, vars) => {
      const lounge = LOUNGE_DEFS.find((l) => l.key === vars.loungeKey);
      toast({
        title: vars.granted ? "Access granted" : "Access revoked",
        description: `${lounge?.label || vars.loungeKey} Lounge`,
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/members/lounge-access", vars.userId],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/members/audit"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      setFounderGrantTarget(null);
    },
    onError: (err: Error) => {
      toast({ title: "Toggle failed", description: err.message, variant: "destructive" });
      setFounderGrantTarget(null);
    },
  });

  // ─── DERIVED ───
  const pendingRegistrations = pendingQuery.data ?? [];
  const members = membersQuery.data ?? [];
  const auditRows = auditQuery.data ?? [];
  const loungeAccess = memberAccessQuery.data ?? [];

  const memberAccessMap = useMemo(() => {
    const m: Record<string, boolean> = {};
    for (const row of loungeAccess) m[row.lounge_key] = row.granted;
    return m;
  }, [loungeAccess]);

  // Members displayed in the Members tab. When the user drills in from a
  // KPI tile (?filter=no-2fa or ?filter=idle60), apply the demo-store helper
  // BEFORE the table renders. The MemberRow contract on this page is a strict
  // subset of DemoMember, so the helper output is safely cast back.
  const displayedMembers = useMemo<MemberRow[]>(() => {
    if (!filterFlag) return members;
    if (filterFlag === "no-2fa") {
      return filterMembersByTwoFactor(members as never[], "disabled") as MemberRow[];
    }
    if (filterFlag === "idle60") {
      return filterMembersByIdle(members as never[], 60) as MemberRow[];
    }
    return members;
  }, [members, filterFlag]);

  // Flat members list for matrix view — full directory (filterFlag does NOT
  // apply here; the matrix is always the complete roster).
  const matrixMembers = useMemo(() => members, [members]);

  // Matrix requires per-user access — fetch lazily per row is expensive; we rely on inline call API
  const handleToggleLounge = (user: MemberRow, loungeKey: string, granted: boolean) => {
    if (loungeKey === "founders_lounge" && granted) {
      setFounderGrantTarget({
        userId: user.id,
        memberName: `${user.first_name} ${user.last_name}`,
        granted: true,
      });
      return;
    }
    toggleLoungeMutation.mutate({ userId: user.id, loungeKey, granted });
  };

  const confirmFounderGrant = () => {
    if (!founderGrantTarget) return;
    toggleLoungeMutation.mutate({
      userId: founderGrantTarget.userId,
      loungeKey: "founders_lounge",
      granted: founderGrantTarget.granted,
    });
  };

  // Impersonate (View-As) submit. POSTs `{ targetUserId, reason }` to the
  // session-start endpoint with CSRF headers (Sentinel BLOCK fix). On success
  // we redirect to the lounge root so the View-As shell takes over. On 409
  // SESSION_ALREADY_ACTIVE we offer a one-click "End existing & retry".
  const submitImpersonate = async () => {
    if (!impersonateTarget) return;
    const reason = impersonateReason.trim();
    if (reason.length < 5) return;
    setImpersonateSubmitting(true);
    try {
      const res = await fetch("/api/founders/viewas/session/start", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        body: JSON.stringify({ targetUserId: impersonateTarget.id, reason }),
      });
      if (res.status === 409) {
        // Founder already has an open session — give them a single-action recovery.
        toast({
          title: "View-As session already active",
          description:
            "Ending the existing session and retrying… If this persists, end it manually from /founders/view-as.",
          variant: "destructive",
        });
        const ended = await fetch("/api/founders/viewas/session/end", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        });
        if (ended.ok) {
          // Retry once — fresh CSRF + body re-sent.
          const retry = await fetch("/api/founders/viewas/session/start", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
            body: JSON.stringify({ targetUserId: impersonateTarget.id, reason }),
          });
          if (retry.ok) {
            window.location.assign("/");
            return;
          }
        }
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error((err as { error?: string }).error || `HTTP ${res.status}`);
      }
      const data = (await res.json().catch(() => ({}))) as { redirect?: string };
      // Invalidate the session query so GlobalViewAsBanner picks up the new
      // active session immediately instead of waiting up to 30s for its next
      // poll (Axiom finding 2026-05-01).
      queryClient.invalidateQueries({ queryKey: ["/api/founders/viewas/session"] });
      window.location.assign(data.redirect || "/");
    } catch (err) {
      toast({
        title: "Impersonation failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setImpersonateSubmitting(false);
    }
  };

  // ─── TABLE COLUMNS ───
  const memberColumns: Column<MemberRow>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (_v, row) => (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setSelectedMember(row)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setSelectedMember(row);
          }}
          tabIndex={0}
          role="button"
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--gc-radius-full)",
              backgroundColor: "var(--gc-surface-2)",
              border: "1px solid var(--gc-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "var(--gc-text-xs)",
              color: "var(--gc-gold)",
              fontWeight: 600,
            }}
          >
            {row.first_name?.[0] || "?"}
            {row.last_name?.[0] || ""}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "var(--gc-text-base)",
                color: "var(--gc-text-primary)",
                fontWeight: 500,
                lineHeight: 1.2,
              }}
            >
              {row.first_name} {row.last_name}
            </div>
            <div
              style={{
                fontSize: "var(--gc-text-xs)",
                color: "var(--gc-text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {row.email}
            </div>
          </div>
        </div>
      ),
    },
    { key: "role", label: "Role", sortable: true, render: (v) => <RoleBadge role={v as string} /> },
    {
      key: "is_active",
      label: "Status",
      sortable: true,
      render: (v) => <GCStatusBadge status={v ? "active" : "inactive"} />,
    },
    {
      key: "approval_status",
      label: "Approval",
      sortable: true,
      render: (v) => <ApprovalPill status={(v as string) || "—"} />,
    },
    {
      key: "last_login_at",
      label: "Last Login",
      sortable: true,
      render: (v) => (
        <span style={{ color: "var(--gc-text-secondary)", fontSize: "var(--gc-text-xs)" }}>
          {formatDate(v as string, "datetime")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_v, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedMember(row)}
            className="flex items-center gap-1"
            style={{
              background: "none",
              border: "none",
              color: "var(--gc-gold)",
              cursor: "pointer",
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-sm)",
              padding: "4px 8px",
            }}
            title="View member detail"
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </button>
          {/* Impersonate hidden for self + for users at-or-above founder
              privilege (Sentinel/Axiom finding 2026-05-01). Backend also
              rejects these — front-end hide just removes the dead affordance. */}
          {row.id !== currentUser?.id &&
            !["founder", "owner", "system_admin"].includes(String(row.role || "")) && (
              <button
                onClick={() => {
                  setImpersonateTarget(row);
                  setImpersonateReason("");
                }}
                data-tour-id={TOUR.FOUNDERS.ACCESS.IMPERSONATE}
                className="flex items-center gap-1"
                style={{
                  background: "var(--gc-surface-2)",
                  border: "1px solid var(--gc-border)",
                  borderRadius: "var(--gc-radius-sm)",
                  color: "var(--gc-text-secondary)",
                  cursor: "pointer",
                  fontFamily: "var(--gc-font-body)",
                  fontSize: "var(--gc-text-xs)",
                  padding: "4px 8px",
                }}
                title="Start a read-only View-As session"
              >
                <UserCircle2 className="w-3.5 h-3.5" />
                Impersonate
              </button>
            )}
        </div>
      ),
    },
  ];

  const auditColumns: Column<AuditRow>[] = [
    {
      key: "created_at",
      label: "Time",
      sortable: true,
      render: (v) => (
        <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>
          {formatDate(v as string, "datetime")}
        </span>
      ),
    },
    { key: "actor_name", label: "Actor", sortable: true },
    {
      key: "action_type",
      label: "Action",
      sortable: true,
      render: (v) => <ActionPill action={String(v)} />,
    },
    { key: "target_name", label: "Target", sortable: true },
    {
      key: "change",
      label: "Change",
      render: (_v, row) => {
        const diffs = diffJsonValues(row.previous_value, row.new_value);
        const rawTitle = `${row.previous_value ? JSON.stringify(row.previous_value) : "—"} → ${row.new_value ? JSON.stringify(row.new_value) : "—"}`;
        if (diffs.length === 0) {
          return (
            <span
              style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}
              title={rawTitle}
            >
              —
            </span>
          );
        }
        return (
          <span
            style={{
              fontSize: "var(--gc-text-xs)",
              color: "var(--gc-text-secondary)",
            }}
            title={rawTitle}
          >
            {diffs.map((d, i) => (
              <span key={d.key}>
                {i > 0 && <span style={{ color: "var(--gc-text-muted)" }}>, </span>}
                <span style={{ color: "var(--gc-text-primary)", fontWeight: 500 }}>{d.key}:</span>{" "}
                <span style={{ color: "var(--gc-text-muted)" }}>{d.before}</span>
                <span style={{ color: "var(--gc-text-muted)" }}> → </span>
                <span style={{ color: "var(--gc-text-primary)" }}>{d.after}</span>
              </span>
            ))}
          </span>
        );
      },
    },
    {
      key: "reason",
      label: "Reason",
      render: (v) => (
        <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>
          {(v as string) || "—"}
        </span>
      ),
    },
  ];

  // ─── LOUNGE MATRIX COLUMNS ───
  const loungeColumns: Column<MemberRow>[] = [
    {
      key: "memberName",
      label: "Member",
      render: (_v, row) => (
        <div>
          <div
            style={{
              fontSize: "var(--gc-text-sm)",
              color: "var(--gc-text-primary)",
              fontWeight: 500,
            }}
          >
            {row.first_name} {row.last_name}
          </div>
          <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>
            {row.email}
          </div>
        </div>
      ),
    },
    {
      key: "agent_lounge",
      label: "Agent",
      align: "center",
      render: (_v, row) => (
        <ToggleCell row={row} loungeKey="agent_lounge" onToggle={handleToggleLounge} />
      ),
    },
    {
      key: "manager_lounge",
      label: "Manager",
      align: "center",
      render: (_v, row) => (
        <ToggleCell row={row} loungeKey="manager_lounge" onToggle={handleToggleLounge} />
      ),
    },
    {
      key: "executive_lounge",
      label: "Executive",
      align: "center",
      render: (_v, row) => (
        <ToggleCell row={row} loungeKey="executive_lounge" onToggle={handleToggleLounge} />
      ),
    },
    {
      key: "investor_lounge",
      label: "Investor",
      align: "center",
      render: (_v, row) => (
        <ToggleCell row={row} loungeKey="investor_lounge" onToggle={handleToggleLounge} />
      ),
    },
    {
      key: "founders_lounge",
      label: <Crown className="w-4 h-4 mx-auto" style={{ color: "var(--gc-gold)" }} />,
      align: "center",
      render: (_v, row) => (
        <ToggleCell row={row} loungeKey="founders_lounge" onToggle={handleToggleLounge} />
      ),
    },
  ];

  // ─── FILTER BAR (members) ───
  // Any explicit filter change clears the KPI-driven filter flag — the user
  // is taking control, so the drill-in chip should disappear.
  const renderMemberFilterBar = (): ReactNode => (
    <div
      className="flex flex-wrap items-center gap-2 mb-3 p-3"
      style={{
        backgroundColor: "var(--gc-surface-2)",
        borderRadius: "var(--gc-radius-sm)",
        border: "1px solid var(--gc-border-subtle)",
      }}
    >
      <FilterLabel>Role</FilterLabel>
      <GCSelect
        theme={theme}
        value={memberFilterRole}
        onValueChange={(v) => {
          setMemberFilterRole(v);
          setFilterFlag("");
        }}
        width={160}
        options={[
          { value: "all", label: "All" },
          { value: "founder", label: "Founder" },
          { value: "owner", label: "Owner" },
          { value: "system_admin", label: "Admin" },
          { value: "manager", label: "Manager" },
          { value: "sales_agent", label: "Agent" },
          { value: "investor", label: "Investor" },
          { value: "client", label: "Client" },
        ]}
      />
      <FilterLabel>Status</FilterLabel>
      <GCSelect
        theme={theme}
        value={memberFilterStatus}
        onValueChange={(v) => {
          setMemberFilterStatus(v);
          setFilterFlag("");
        }}
        width={140}
        options={[
          { value: "all", label: "All" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ]}
      />
      <FilterLabel>Approval</FilterLabel>
      <GCSelect
        theme={theme}
        value={memberFilterApproval}
        onValueChange={(v) => {
          setMemberFilterApproval(v);
          setFilterFlag("");
        }}
        width={140}
        options={[
          { value: "all", label: "All" },
          { value: "pending", label: "Pending" },
          { value: "approved", label: "Approved" },
          { value: "rejected", label: "Rejected" },
        ]}
      />
      {filterFlag && (
        <button
          onClick={() => setFilterFlag("")}
          className="inline-flex items-center gap-1.5 ml-1"
          style={{
            padding: "4px 10px",
            borderRadius: "var(--gc-radius-full)",
            fontSize: "var(--gc-text-xs)",
            fontFamily: "var(--gc-font-body)",
            color: "var(--gc-gold)",
            backgroundColor: "color-mix(in srgb, var(--gc-gold) 14%, transparent)",
            border: "1px solid color-mix(in srgb, var(--gc-gold) 30%, transparent)",
            cursor: "pointer",
          }}
          title="Clear KPI drill-in filter"
        >
          {filterFlag === "no-2fa" ? "2FA disabled" : "Idle 60d+"}
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );

  // ─── RENDER ───
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
          Unable to load lounge access
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
      <div data-tour-id={TOUR.FOUNDERS.ACCESS.HEADER}>
        <GCPageHeader
          title="Lounge Access"
          subtitle="Grant access, approve registrations, manage roles"
          accentUnderline
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/founders/hierarchy"
                className="inline-flex items-center gap-1.5 px-3 py-2"
                style={OUTLINED_BUTTON_STYLE}
                title="Manage Hierarchy"
              >
                <Network className="w-4 h-4" />
                <span className="hidden xl:inline">Manage Hierarchy →</span>
              </Link>
              <div data-tour-id={TOUR.FOUNDERS.ACCESS.INVITE_BUTTON}>
                <GCPrimaryButton
                  onClick={() => setInviteOpen(true)}
                  icon={<UserPlus className="w-4 h-4" />}
                >
                  Invite Member
                </GCPrimaryButton>
              </div>
            </div>
          }
        />
      </div>

      {/* KPI strip — drill-in via wouter Link to in-page tab anchors. The
          2FA + Idle tiles also carry a `?filter=` so the Members tab pre-applies
          the matching demo-store helper before rendering. */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-6"
        data-tour-id={TOUR.FOUNDERS.ACCESS.KPI_GRID}
      >
        {accessKpisQuery.isLoading || !accessKpisQuery.data ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[116px] w-full" />
          ))
        ) : (
          <>
            <Link
              href="#pending"
              style={{ textDecoration: "none", cursor: "pointer" }}
              className="block transition-transform hover:-translate-y-[1px]"
            >
              <GCKPICard
                label="Pending Registrations"
                value={accessKpisQuery.data.pendingCount}
                accentTop
                tooltip="Awaiting approval / rejection"
              />
            </Link>
            <Link
              href="#members"
              style={{ textDecoration: "none", cursor: "pointer" }}
              className="block transition-transform hover:-translate-y-[1px]"
            >
              <GCKPICard
                label="Active Members"
                value={accessKpisQuery.data.activeMembers}
                accentTop
                tooltip="Active flag set OR last login within 30 days"
              />
            </Link>
            <Link
              href="#members?filter=no-2fa"
              style={{ textDecoration: "none", cursor: "pointer" }}
              className="block transition-transform hover:-translate-y-[1px]"
            >
              <GCKPICard
                label="High-Trust 2FA"
                value={`${accessKpisQuery.data.twoFactorCoverage}%`}
                accentTop
                tooltip={`${accessKpisQuery.data.twoFactorEnabledCount}/${accessKpisQuery.data.highTrustMemberCount} high-trust members have 2FA enabled`}
              />
            </Link>
            <Link
              href="#members?filter=idle60"
              style={{ textDecoration: "none", cursor: "pointer" }}
              className="block transition-transform hover:-translate-y-[1px]"
            >
              <GCKPICard
                label="Idle 60d"
                value={accessKpisQuery.data.idle60d}
                accentTop
                tooltip="Members with no login in the last 60 days (or never)"
              />
            </Link>
          </>
        )}
      </div>

      <GCTabs value={activeTab} onValueChange={setActiveTab} className="w-full" data-tour-id={TOUR.FOUNDERS.ACCESS.TABS}>
        <GCTabsList className="mb-4">
          <GCTabsTrigger value="pending">
            Pending Registrations
            {pendingRegistrations.length > 0 && (
              <span
                className="ml-2 inline-flex items-center justify-center text-xs font-semibold"
                style={{
                  minWidth: 18,
                  height: 18,
                  padding: "0 6px",
                  borderRadius: "var(--gc-radius-full)",
                  backgroundColor: "var(--gc-status-pending)",
                  color: "#111",
                }}
              >
                {pendingRegistrations.length}
              </span>
            )}
          </GCTabsTrigger>
          <GCTabsTrigger value="members">Members</GCTabsTrigger>
          <GCTabsTrigger value="lounge">Lounge Access</GCTabsTrigger>
          <GCTabsTrigger value="audit">Audit History</GCTabsTrigger>
        </GCTabsList>

        {/* ───── PENDING ───── */}
        <GCTabsContent value="pending" data-tour-id={TOUR.FOUNDERS.ACCESS.PENDING_TABLE}>
          {pendingQuery.isError ? (
            <EmptyTableBlock
              title="Couldn't load pending registrations."
              subtext="The /api/members/pending endpoint is not reachable yet."
            />
          ) : pendingQuery.isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : pendingRegistrations.length === 0 ? (
            <EmptyTableBlock
              title="No pending registrations."
              subtext="Approved applicants will appear in the Members tab."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {pendingRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="p-5 flex justify-between gap-4"
                  style={{
                    backgroundColor: "var(--gc-surface)",
                    border: "1px solid var(--gc-border)",
                    borderLeft: `3px solid ${reg.is_licensed ? "var(--gc-gold)" : "var(--gc-border)"}`,
                    borderRadius: "var(--gc-radius-md)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <div
                        style={{
                          fontFamily: "var(--gc-font-display)",
                          fontSize: "var(--gc-text-lg)",
                          color: "var(--gc-text-primary)",
                          fontWeight: 600,
                          letterSpacing: "var(--gc-tracking-tight)",
                        }}
                      >
                        {reg.first_name} {reg.last_name}
                      </div>
                      {reg.is_licensed ? (
                        <span
                          className="inline-flex items-center gap-1"
                          style={{
                            padding: "2px 10px",
                            borderRadius: "var(--gc-radius-full)",
                            fontSize: "var(--gc-text-xs)",
                            fontFamily: "var(--gc-font-body)",
                            fontWeight: 500,
                            color: "var(--gc-gold)",
                            backgroundColor: "color-mix(in srgb, var(--gc-gold) 14%, transparent)",
                            border: "1px solid color-mix(in srgb, var(--gc-gold) 30%, transparent)",
                          }}
                        >
                          <Award className="w-3 h-3" />
                          Licensed
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center"
                          style={{
                            padding: "2px 10px",
                            borderRadius: "var(--gc-radius-full)",
                            fontSize: "var(--gc-text-xs)",
                            fontFamily: "var(--gc-font-body)",
                            color: "var(--gc-text-muted)",
                            backgroundColor: "var(--gc-surface-2)",
                            border: "1px solid var(--gc-border-subtle)",
                          }}
                        >
                          Unlicensed
                        </span>
                      )}
                      {typeof reg.years_experience === "number" && (
                        <span
                          style={{
                            fontFamily: "var(--gc-font-body)",
                            fontSize: "var(--gc-text-xs)",
                            color: "var(--gc-text-muted)",
                          }}
                        >
                          {reg.years_experience} {reg.years_experience === 1 ? "yr" : "yrs"} exp
                        </span>
                      )}
                    </div>
                    <div
                      className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2"
                      style={{
                        fontSize: "var(--gc-text-sm)",
                        color: "var(--gc-text-secondary)",
                        fontFamily: "var(--gc-font-body)",
                      }}
                    >
                      <PendingMeta icon={<Mail className="w-3.5 h-3.5" />} value={reg.email} />
                      {reg.phone && (
                        <PendingMeta icon={<Phone className="w-3.5 h-3.5" />} value={reg.phone} />
                      )}
                      {reg.license_number && (
                        <PendingMeta label="License" value={reg.license_number} />
                      )}
                      {reg.licensed_states && reg.licensed_states.length > 0 && (
                        <PendingMeta label="States" value={reg.licensed_states.join(", ")} />
                      )}
                      {reg.referral_source && (
                        <PendingMeta label="Referral" value={reg.referral_source} />
                      )}
                      <PendingMeta
                        icon={<Clock className="w-3.5 h-3.5" />}
                        value={`Applied ${formatDate(reg.applied_at, "datetime")}`}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0 self-start" style={{ minWidth: 130 }}>
                    <GCPrimaryButton
                      icon={<Check className="w-4 h-4" />}
                      onClick={() => approveMutation.mutate(reg.id)}
                      disabled={approveMutation.isPending}
                    >
                      Approve
                    </GCPrimaryButton>
                    <GCSecondaryButton
                      icon={<X className="w-4 h-4" />}
                      onClick={() => setRejectTarget(reg)}
                    >
                      Reject
                    </GCSecondaryButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GCTabsContent>

        {/* ───── MEMBERS ───── */}
        <GCTabsContent value="members" data-tour-id={TOUR.FOUNDERS.ACCESS.MEMBERS_TABLE}>
          {renderMemberFilterBar()}
          {membersQuery.isError ? (
            <EmptyTableBlock
              title="Couldn't load members."
              subtext="The /api/members endpoint is not reachable yet."
            />
          ) : (
            <GCDataTable
              columns={memberColumns}
              data={displayedMembers}
              searchable
              searchPlaceholder="Search members…"
              pageSize={15}
            />
          )}
        </GCTabsContent>

        {/* ───── LOUNGE MATRIX ───── */}
        <GCTabsContent value="lounge" data-tour-id={TOUR.FOUNDERS.ACCESS.LOUNGE_MATRIX}>
          {membersQuery.isError ? (
            <EmptyTableBlock
              title="Couldn't load member list."
              subtext="The /api/members endpoint is not reachable yet."
            />
          ) : matrixMembers.length === 0 ? (
            <EmptyTableBlock
              title="No members to display."
              subtext="Once members are approved, the lounge matrix populates here."
            />
          ) : (
            <>
              <GCDataTable
                columns={loungeColumns}
                data={matrixMembers}
                searchable
                searchPlaceholder="Search members…"
                pageSize={20}
              />
              <div
                className="px-4 py-2 mt-2"
                style={{
                  fontSize: "var(--gc-text-xs)",
                  color: "var(--gc-text-muted)",
                }}
              >
                {members.length} members total. Granting the Founders Lounge requires confirmation.
              </div>
            </>
          )}
        </GCTabsContent>

        {/* ───── AUDIT HISTORY ───── */}
        <GCTabsContent value="audit">
          <div
            className="flex flex-wrap items-center gap-2 mb-3 p-3"
            style={{
              backgroundColor: "var(--gc-surface-2)",
              borderRadius: "var(--gc-radius-sm)",
              border: "1px solid var(--gc-border-subtle)",
            }}
          >
            <FilterLabel>Action</FilterLabel>
            <GCSelect
              theme={theme}
              value={auditActionFilter}
              onValueChange={setAuditActionFilter}
              width={170}
              options={[
                { value: "all", label: "All" },
                { value: "approve", label: "Approve" },
                { value: "reject", label: "Reject" },
                { value: "grant", label: "Grant" },
                { value: "revoke", label: "Revoke" },
                { value: "invite", label: "Invite" },
                { value: "role_change", label: "Role Change" },
                { value: "view_as_started", label: "View-As Started" },
                { value: "view_as_ended", label: "View-As Ended" },
              ]}
            />
            <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
              <FilterLabel>Search</FilterLabel>
              <Input
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Actor, target, reason…"
                className="h-9 text-sm"
              />
            </div>
          </div>
          {auditQuery.isError ? (
            <EmptyTableBlock
              title="Couldn't load audit history."
              subtext="The /api/members/audit endpoint is not reachable yet."
            />
          ) : (
            <GCDataTable
              columns={auditColumns}
              data={
                auditSearch.trim()
                  ? auditRows.filter((r) =>
                      [r.actor_name, r.target_name, r.reason || "", r.action_type]
                        .join(" ")
                        .toLowerCase()
                        .includes(auditSearch.trim().toLowerCase())
                    )
                  : auditRows
              }
              searchable={false}
              pageSize={20}
            />
          )}
        </GCTabsContent>
      </GCTabs>

      {/* ─── INVITE DIALOG ─── shared with HCMS Send Application */}
      <SendApplicationDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite Member"
        subtitle="Send an invitation email. The recipient can claim their account and complete onboarding."
      />

      {/* ─── REJECT DIALOG ─── */}
      {rejectTarget && (
        <GCModal
          title="Reject Registration"
          subtitle={`Reject ${rejectTarget.first_name} ${rejectTarget.last_name}. Provide a reason — it will be recorded in the audit log.`}
          onClose={() => {
            setRejectTarget(null);
            setRejectReason("");
          }}
          width={480}
        >
          <div>
            <label style={GC_FORM_LABEL}>Reason *</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (required)"
              rows={4}
              style={{ ...GC_FORM_INPUT, resize: "vertical" }}
            />
          </div>
          <div className="flex items-center justify-end gap-2 mt-6">
            <GCSecondaryButton
              onClick={() => {
                setRejectTarget(null);
                setRejectReason("");
              }}
            >
              Cancel
            </GCSecondaryButton>
            <GCPrimaryButton
              tone="danger"
              icon={<X className="w-4 h-4" />}
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              onClick={() => {
                if (rejectTarget && rejectReason.trim()) {
                  rejectMutation.mutate({
                    id: rejectTarget.id,
                    reason: rejectReason.trim(),
                  });
                }
              }}
            >
              Reject Registration
            </GCPrimaryButton>
          </div>
        </GCModal>
      )}

      {/* ─── FOUNDERS GRANT CONFIRMATION ─── */}
      {founderGrantTarget && (
        <GCModal
          title="Grant Founders Lounge Access?"
          icon={<Crown className="w-5 h-5" style={{ color: "var(--gc-gold)" }} />}
          subtitle={null}
          onClose={() => setFounderGrantTarget(null)}
          width={500}
        >
          <p style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", lineHeight: 1.5 }}>
            Granting the Founders Lounge gives{" "}
            <strong style={{ color: "var(--gc-text-primary)" }}>{founderGrantTarget?.memberName}</strong>{" "}
            top-tier access across GC + Heritage with approval authority. This is
            consequential — proceed only if intended.
          </p>
          <div className="flex items-center justify-end gap-2 mt-6">
            <GCSecondaryButton onClick={() => setFounderGrantTarget(null)}>Cancel</GCSecondaryButton>
            <GCPrimaryButton onClick={confirmFounderGrant} icon={<Crown className="w-4 h-4" />}>
              Confirm Grant
            </GCPrimaryButton>
          </div>
        </GCModal>
      )}

      {/* ─── IMPERSONATE (View-As) CONFIRMATION ─── */}
      {impersonateTarget && (
        <GCModal
          title={`Impersonate ${impersonateTarget.first_name} ${impersonateTarget.last_name}?`}
          icon={<UserCircle2 className="w-5 h-5" style={{ color: "var(--gc-gold)" }} />}
          subtitle={null}
          onClose={() => {
            if (impersonateSubmitting) return;
            setImpersonateTarget(null);
            setImpersonateReason("");
          }}
          width={520}
        >
          <p
            style={{
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-sm)",
              color: "var(--gc-text-secondary)",
              lineHeight: 1.5,
              marginBottom: "var(--gc-space-4)",
            }}
          >
            You will be in read-only mode. All actions are audit-logged.
            Provide a short reason — it appears in the View-As history and the
            target user is notified.
          </p>
          <div>
            <label style={GC_FORM_LABEL}>Reason *</label>
            <textarea
              value={impersonateReason}
              onChange={(e) => setImpersonateReason(e.target.value)}
              placeholder="Reason for the impersonation session (min 5 characters)"
              rows={4}
              style={{ ...GC_FORM_INPUT, resize: "vertical" }}
              disabled={impersonateSubmitting}
            />
          </div>
          <div className="flex items-center justify-end gap-2 mt-6">
            <GCSecondaryButton
              onClick={() => {
                setImpersonateTarget(null);
                setImpersonateReason("");
              }}
              disabled={impersonateSubmitting}
            >
              Cancel
            </GCSecondaryButton>
            <GCPrimaryButton
              onClick={submitImpersonate}
              icon={<UserCircle2 className="w-4 h-4" />}
              disabled={impersonateReason.trim().length < 5 || impersonateSubmitting}
            >
              {impersonateSubmitting ? "Starting…" : "Start Session"}
            </GCPrimaryButton>
          </div>
        </GCModal>
      )}

      {/* ─── MEMBER DETAIL DRAWER ─── */}
      <Sheet
        open={!!selectedMember}
        onOpenChange={(open) => {
          if (!open) setSelectedMember(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-[480px] sm:max-w-[480px] p-0 overflow-hidden flex flex-col [&>button]:hidden border-l"
          style={{
            backgroundColor: "var(--gc-bg)",
            borderColor: "var(--gc-border)",
            color: "var(--gc-text-primary)",
          }}
          data-theme={theme}
        >
          {selectedMember && (
            <div className="flex-1 overflow-y-auto" data-theme={theme} style={{ backgroundColor: "var(--gc-bg)" }}>
              {/* Header */}
              <div
                className="sticky top-0 z-10"
                style={{
                  backgroundColor: "var(--gc-surface)",
                  borderBottom: "1px solid var(--gc-border)",
                  padding: "var(--gc-space-6)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "var(--gc-radius-md)",
                      background: "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))",
                      color: "var(--gc-btn-primary-text)",
                      fontFamily: "var(--gc-font-display)",
                      fontSize: "var(--gc-text-lg)",
                      fontWeight: 600,
                      border: "1px solid var(--gc-border)",
                    }}
                  >
                    {selectedMember.first_name?.[0] || "?"}
                    {selectedMember.last_name?.[0] || ""}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div
                          style={{
                            fontFamily: "var(--gc-font-display)",
                            fontSize: "var(--gc-text-2xl)",
                            fontWeight: 600,
                            color: "var(--gc-text-primary)",
                            lineHeight: 1.2,
                            wordBreak: "break-word",
                          }}
                        >
                          {selectedMember.first_name} {selectedMember.last_name}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--gc-font-body)",
                            fontSize: "var(--gc-text-sm)",
                            color: "var(--gc-text-secondary)",
                            marginTop: 2,
                          }}
                        >
                          {selectedMember.email}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedMember(null)}
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "none",
                          border: "1px solid var(--gc-border)",
                          borderRadius: "var(--gc-radius-sm)",
                          width: 32,
                          height: 32,
                          cursor: "pointer",
                          color: "var(--gc-text-muted)",
                        }}
                        aria-label="Close drawer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Gold accent line */}
                <div
                  className="mt-4"
                  style={{
                    height: 2,
                    width: 64,
                    background: "linear-gradient(90deg, var(--gc-gold), var(--gc-gold-bright), transparent)",
                  }}
                />

                {/* Role + status pills */}
                <div className="flex items-center gap-2 mt-4">
                  <RoleBadge role={selectedMember.role} />
                  <GCStatusBadge status={selectedMember.is_active ? "active" : "inactive"} />
                  {selectedMember.approval_status && (
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "var(--gc-radius-full)",
                        fontSize: "var(--gc-text-xs)",
                        fontFamily: "var(--gc-font-body)",
                        color: "var(--gc-text-secondary)",
                        backgroundColor: "var(--gc-surface-2)",
                        border: "1px solid var(--gc-border-subtle)",
                      }}
                    >
                      {selectedMember.approval_status}
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: "var(--gc-space-6)" }} className="flex flex-col gap-5">
                {/* Lounge Access */}
                <div>
                  <div
                    className="mb-3 flex items-center gap-2"
                    style={{
                      fontSize: "var(--gc-text-xs)",
                      color: "var(--gc-text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "var(--gc-tracking-wider)",
                      fontFamily: "var(--gc-font-body)",
                    }}
                  >
                    <FileText className="w-3 h-3" />
                    Lounge Access
                  </div>
                  <div className="flex flex-col gap-2">
                    {LOUNGE_DEFS.map((lounge) => {
                      const granted = memberAccessMap[lounge.key] ?? false;
                      const isFounders = lounge.key === "founders_lounge";
                      return (
                        <div
                          key={lounge.key}
                          className="flex items-center justify-between px-4 py-3"
                          style={{
                            backgroundColor: "var(--gc-surface)",
                            borderRadius: "var(--gc-radius-md)",
                            border: "1px solid var(--gc-border)",
                            borderLeft: `3px solid ${granted ? "var(--gc-gold)" : "var(--gc-border)"}`,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {isFounders && (
                              <Crown className="w-3.5 h-3.5" style={{ color: "var(--gc-gold)" }} />
                            )}
                            <span
                              style={{
                                fontSize: "var(--gc-text-sm)",
                                fontWeight: 500,
                                color: "var(--gc-text-primary)",
                                fontFamily: "var(--gc-font-body)",
                              }}
                            >
                              {lounge.label} Lounge
                            </span>
                          </div>
                          <GCSwitch
                            checked={granted}
                            onCheckedChange={(checked) => {
                              if (isFounders && checked) {
                                setFounderGrantTarget({
                                  userId: selectedMember.id,
                                  memberName: `${selectedMember.first_name} ${selectedMember.last_name}`,
                                  granted: true,
                                });
                              } else {
                                toggleLoungeMutation.mutate({
                                  userId: selectedMember.id,
                                  loungeKey: lounge.key,
                                  granted: checked,
                                });
                              }
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Metadata */}
                <div>
                  <div
                    className="mb-3"
                    style={{
                      fontSize: "var(--gc-text-xs)",
                      color: "var(--gc-text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "var(--gc-tracking-wider)",
                      fontFamily: "var(--gc-font-body)",
                    }}
                  >
                    Metadata
                  </div>
                  <div
                    className="gc-card p-4 grid grid-cols-2 gap-3"
                    style={{ fontFamily: "var(--gc-font-body)" }}
                  >
                    <DetailItem label="Approval" value={selectedMember.approval_status || "—"} />
                    <DetailItem
                      label="Last login"
                      value={formatDate(selectedMember.last_login_at, "datetime") || "—"}
                    />
                    <DetailItem label="Role" value={ROLE_LABEL[selectedMember.role] || selectedMember.role} />
                    <DetailItem label="Status" value={selectedMember.is_active ? "Active" : "Inactive"} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span
        style={{
          fontSize: "var(--gc-text-xs)",
          color: "var(--gc-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "var(--gc-tracking-wider)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "var(--gc-text-sm)",
          color: "var(--gc-text-primary)",
          fontWeight: 500,
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── TOGGLE CELL ───
// Per-row lounge access fetch + switch. React-Query dedupes the 5 cells
// per row so each member still triggers a single /lounge-access request.
function ToggleCell({
  row,
  loungeKey,
  onToggle,
}: {
  row: MemberRow;
  loungeKey: string;
  onToggle: (m: MemberRow, loungeKey: string, granted: boolean) => void;
}) {
  const { data } = useQuery({
    queryKey: ["/api/members/lounge-access", row.id],
    queryFn: () =>
      fetchJSON<LoungeAccessRow[]>(`/api/members/${row.id}/lounge-access`),
    retry: 0,
    staleTime: 30_000,
  });
  const granted = useMemo(() => {
    const entry = (data ?? []).find((r) => r.lounge_key === loungeKey);
    return entry?.granted ?? false;
  }, [data, loungeKey]);

  return (
    <div className="flex items-center justify-center">
      <GCSwitch
        checked={granted}
        onCheckedChange={(checked) => onToggle(row, loungeKey, checked)}
      />
    </div>
  );
}

// Verbatim from FoundersTeamPerformance.tsx — same gold-standard empty-state
// block used across the founders pages so error / no-data states render
// identically wherever they appear.
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
