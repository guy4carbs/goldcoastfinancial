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
  LOUNGE_KEYS,
  ROLE_TO_LOUNGES,
  type LoungeKey,
  GC_SURFACES,
  ROLE_TO_GC_SURFACES,
  type GcSurface,
  AUTO_LOUNGES,
  LOUNGE_TIER_LADDER,
  LOUNGE_BUNDLES,
  BUNDLE_MEMBER_LOUNGES,
  loungesIncludedByGrant,
  loungesRevokedByRevoke,
} from "@shared/models/loungeAccess";

// Wave Z+Z5: hide auto-bundled (CRM, Onboarding), self-service (Client), and
// bundle-member (AI, Support — granted via Admin) lounges from the per-user
// toggle matrix. They all still exist in the Role Defaults banner above as
// the canonical reference.
const HIDDEN_TOGGLE_KEYS = new Set<LoungeKey>([
  "client_lounge",
  ...AUTO_LOUNGES,
  ...Array.from(BUNDLE_MEMBER_LOUNGES),
]);
const VISIBLE_LOUNGE_KEYS = LOUNGE_KEYS.filter(
  (lk) => !HIDDEN_TOGGLE_KEYS.has(lk),
);

// All 10 roles recognized across goldcoast + heritage. Drives:
//   - Members tab role filter dropdown (was 7 roles, Wave Y → 10).
//   - Role Defaults banner rows on Lounge Access tab.
const ALL_ROLES = [
  "founder",
  "owner",
  "system_admin",
  "director",
  "agency_manager",
  "manager",
  "sales_agent",
  "marketing_staff",
  "client",
  "investor",
] as const;

// Display labels for the 13 heritage lounge_keys. Lives here (not in shared/)
// because it's pure presentation — heritage-app uses different labels for the
// same keys. Source of truth for the keys themselves is
// shared/models/loungeAccess.
const LOUNGE_LABELS: Record<LoungeKey, string> = {
  agent_portal: "Agent",
  manager_lounge: "Manager",
  director_lounge: "Director",
  executive_lounge: "Executive",
  crm_lounge: "CRM",
  ai_lounge: "AI",
  admin_panel: "Admin",
  client_lounge: "Client",
  onboarding_lounge: "Onboarding",
  finance_lounge: "Finance",
  support_lounge: "Support",
};

// Display labels for the 7 goldcoast surfaces. Goldcoast access is role-gated
// at the Express middleware layer (requireRole(...)), not lounge-toggle-able.
// These labels are read-only reference in the Role Defaults banner.
const GC_SURFACE_LABELS: Record<GcSurface, string> = {
  agent_hcms: "Agent HCMS",
  admin_hcms: "Admin HCMS",
  ops_hub: "Ops Hub",
  founders_lounge: "Founders Lounge",
  marketing: "Marketing",
  investor_portal: "Investor",
  client_dashboard: "Client Dashboard",
};

// Granting `admin_panel` is the highest-stakes per-user toggle on this page —
// it gives access to heritage-app's most powerful surface. Wave Y replaces the
// prior `founders_lounge` sentinel (which never existed as a lounge_key) with
// admin_panel as the gate that triggers the confirmation modal.
const HIGH_STAKES_LOUNGE: LoungeKey = "admin_panel";

// Roles considered "high-trust" for the 2FA-coverage denominator. Mirrors
// goldcoast's ROLES_REQUIRING_2FA (server/types/permissions.ts:31-41) minus
// CLIENT — clients use the heritagels.org consumer flow, not this app.
const HIGH_TRUST_ROLES = [
  "founder",
  "owner",
  "system_admin",
  "director",
  "agency_manager",
  "manager", // legacy alias for agency_manager
  "sales_agent",
  "marketing_staff",
  "investor",
] as const;

function daysSinceMs(iso: string | null | undefined): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return 0;
  return Math.floor(ms / 86_400_000);
}

// KPI drill-in helpers (preserved from the prior demo store but operating on
// real MemberRow data now). Pure functions — no store access.
function filterMembersByTwoFactor<T extends { role: string; two_factor_enabled?: boolean }>(
  members: T[],
  state: "enabled" | "disabled",
): T[] {
  const want = state === "enabled";
  return members.filter(
    (m) => (HIGH_TRUST_ROLES as readonly string[]).includes(m.role) && !!m.two_factor_enabled === want,
  );
}
function filterMembersByIdle<T extends { last_login_at?: string | null }>(
  members: T[],
  days: number,
): T[] {
  return members.filter((m) => daysSinceMs(m.last_login_at) > days);
}

// Derived from members + pending. Was previously sourced from the demo store.
interface AccessKpis {
  pendingCount: number;
  activeMembers: number;
  twoFactorCoverage: number;
  idle60d: number;
  twoFactorEnabledCount: number;
  highTrustMemberCount: number;
}

// Gold focus + hover ring for KPI tiles. Mirrors Revenue / Growth / Book / Team
// Performance / Lead Distribution / Agency Management / Profit Split.
const KPI_LINK_CLASS =
  "block rounded-md transition-shadow hover:ring-2 hover:ring-[var(--gc-gold-bright,var(--gc-gold))] focus-visible:ring-2 focus-visible:ring-[var(--gc-gold)]";

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
  id: string;          // agent_profiles.id — used as React row key only
  user_id: string;     // users.id — what /approve and /reject expect (FK target)
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
  phone?: string | null;
  role: string;
  is_active: boolean;
  approval_status?: string | null;
  last_login_at?: string | null;
  avatar_url?: string | null;
  two_factor_enabled?: boolean;
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
const ROLE_LABEL: Record<string, string> = {
  founder: "Founder",
  owner: "Owner",
  system_admin: "System Admin",
  director: "Director",
  agency_manager: "Agency Manager",
  manager: "Manager",
  sales_agent: "Sales Agent",
  marketing_staff: "Marketing Staff",
  client: "Client",
  investor: "Investor",
};

const ROLE_COLOR: Record<string, string> = {
  founder: "var(--gc-gold)",
  owner: "var(--gc-gold-bright)",
  system_admin: "var(--gc-chart-4)",      // blue
  director: "var(--gc-chart-1)",           // teal
  agency_manager: "var(--gc-chart-2)",     // purple
  manager: "var(--gc-chart-2)",            // purple (legacy alias)
  sales_agent: "var(--gc-chart-3)",        // green
  marketing_staff: "var(--gc-chart-6)",    // pink
  investor: "var(--gc-chart-5)",           // amber
  client: "var(--gc-text-secondary)",
};

// ─── API (frontend demo store) ───
// Real backend wrappers. No demo intercept — the goldcoast `/api/members/*`
// router (server/routes/founders-members.ts) is the source of truth for
// pending registrations, member roster, audit log, and lounge grants. Every
// mutation carries a CSRF header so the global csrf-csrf middleware accepts.
async function fetchJSON<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`API ${res.status}${detail ? `: ${detail.slice(0, 120)}` : ""}`);
  }
  return res.json() as Promise<T>;
}

async function postJSON(url: string, body: Record<string, unknown>) {
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
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

// Pill-style role indicator. Founder gets a gold crown + bold gold styling
// ("most prestigious role across all platforms" per founder mandate). Other
// roles get a tinted pill in their ROLE_COLOR.
function RoleBadge({ role }: { role: string }) {
  const isFounder = role === "founder";
  const color = isFounder
    ? "var(--gc-gold)"
    : ROLE_COLOR[role] || "var(--gc-text-muted)";
  const label = ROLE_LABEL[role] || role;
  return (
    <span
      className="inline-flex items-center gap-1.5 font-medium whitespace-nowrap"
      style={{
        padding: "3px 10px",
        borderRadius: "var(--gc-radius-full)",
        fontSize: "var(--gc-text-xs)",
        fontFamily: "var(--gc-font-body)",
        color,
        fontWeight: isFounder ? 600 : 500,
        backgroundColor: `color-mix(in srgb, ${color} ${isFounder ? 18 : 12}%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} ${isFounder ? 50 : 30}%, transparent)`,
      }}
    >
      {isFounder && (
        <Crown
          className="w-3 h-3"
          style={{ color: "var(--gc-gold)" }}
          aria-hidden="true"
        />
      )}
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

  // Wave AC2: approve modal state. Founder picks upline + contract level
  // before the agent_hierarchy row gets inserted.
  const [approveTarget, setApproveTarget] = useState<PendingRegistration | null>(null);
  const [approveUplineId, setApproveUplineId] = useState<string>("");
  const [approveContractPct, setApproveContractPct] = useState<number>(80);
  const [approveReason, setApproveReason] = useState<string>("");

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

  // Wave Y8: change-role modal. Founders click the Change Role button on a
  // member row → pick the new role + reason → POST /api/members/:id/role.
  // Backend calls reinitializeLoungeAccess which atomically updates users.role,
  // wipes stale heritage lounge grants, re-grants the new role's defaults, and
  // writes access_change_log + founder_audit_log. Goldcoast surface gating
  // updates automatically on the next request because requireRole(...) reads
  // users.role fresh.
  const [roleChangeTarget, setRoleChangeTarget] = useState<MemberRow | null>(null);
  const [roleChangeNewRole, setRoleChangeNewRole] = useState<string>("sales_agent");
  const [roleChangeReason, setRoleChangeReason] = useState<string>("");

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

  // Wave AC2: uplines list, used by the approve modal so the founder can
  // place the new agent in the hierarchy. Only fetches when the modal opens.
  // Same endpoint the SendApplicationDialog uses.
  const uplinesQuery = useQuery({
    queryKey: ["/api/hcms/hierarchy/uplines"],
    queryFn: () =>
      fetchJSON<
        Array<{
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          role: string;
          contract_level: number | string | null;
        }>
      >(`/api/hcms/hierarchy/uplines`),
    enabled: !!approveTarget,
    retry: 0,
    staleTime: 30_000,
  });

  // Access KPI strip — derived client-side from the already-fetched member +
  // pending lists so we don't need a separate /api/members/kpis endpoint
  // round-trip. Recomputes whenever either source query refetches.
  const accessKpisQuery = useMemo<{ data: AccessKpis | undefined; isLoading: boolean }>(() => {
    if (membersQuery.isLoading || pendingQuery.isLoading) {
      return { data: undefined, isLoading: true };
    }
    const members = (membersQuery.data || []) as MemberRow[];
    const pending = (pendingQuery.data || []) as PendingRegistration[];
    const highTrust = members.filter((m) => (HIGH_TRUST_ROLES as readonly string[]).includes(m.role));
    const twoFactorEnabledCount = highTrust.filter((m) => !!m.two_factor_enabled).length;
    return {
      data: {
        pendingCount: pending.length,
        activeMembers: members.filter((m) => m.is_active || daysSinceMs(m.last_login_at) <= 30).length,
        twoFactorCoverage:
          highTrust.length > 0 ? Math.round((twoFactorEnabledCount / highTrust.length) * 100) : 0,
        idle60d: members.filter((m) => daysSinceMs(m.last_login_at) > 60).length,
        twoFactorEnabledCount,
        highTrustMemberCount: highTrust.length,
      },
      isLoading: false,
    };
  }, [membersQuery.data, membersQuery.isLoading, pendingQuery.data, pendingQuery.isLoading]);

  // Page-level error guard — only blank out if EVERY core query errors.
  // Mirrors FoundersTeamPerformance.tsx:120-148.
  const allErrored = !!(
    membersQuery.error &&
    pendingQuery.error &&
    auditQuery.error
  );
  const firstError = membersQuery.error || pendingQuery.error || auditQuery.error;

  // ─── MUTATIONS ───
  // Wave AC2: approve now takes upline + contract level so we can place the
  // new agent in agent_hierarchy. Server inserts the row inside the same
  // transaction as the users/profile updates.
  const approveMutation = useMutation({
    mutationFn: (vars: {
      userId: string;
      uplineId: string | null;
      contractLevelPct: number;
      reason: string | null;
    }) =>
      postJSON(`/api/members/${vars.userId}/approve`, {
        uplineId: vars.uplineId,
        contractLevelPct: vars.contractLevelPct,
        reason: vars.reason,
      }),
    onSuccess: () => {
      toast({
        title: "Approved",
        description: "Hierarchy row created. Approval email sent.",
      });
      setApproveTarget(null);
      setApproveReason("");
      queryClient.invalidateQueries({ queryKey: ["/api/members/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members/audit"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hcms/hierarchy/uplines"] });
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
      const label = LOUNGE_LABELS[vars.loungeKey as LoungeKey] || vars.loungeKey;
      toast({
        title: vars.granted ? "Access granted" : "Access revoked",
        description: `${label} Lounge`,
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

  // Matrix requires per-user access — fetch lazily per row is expensive; we
  // rely on inline call API. Wave Z: cascade fan-out. Granting a tier (e.g.
  // Director) also grants every lower tier (Manager, Agent) plus the
  // auto-bundled CRM + Onboarding. Revoking a base tier (e.g. Agent) cascades
  // up and revokes all super-tiers (Manager, Director, Executive). Each
  // cascaded lounge gets its own POST so the access_change_log SOC 2 trail
  // captures one row per state change, not bulk updates.
  const handleToggleLounge = (user: MemberRow, loungeKey: string, granted: boolean) => {
    if (loungeKey === HIGH_STAKES_LOUNGE && granted) {
      setFounderGrantTarget({
        userId: user.id,
        memberName: `${user.first_name} ${user.last_name}`,
        granted: true,
      });
      return;
    }
    const cascade = granted
      ? loungesIncludedByGrant(loungeKey as LoungeKey)
      : loungesRevokedByRevoke(loungeKey as LoungeKey);
    for (const lk of cascade) {
      toggleLoungeMutation.mutate({ userId: user.id, loungeKey: lk, granted });
    }
  };

  const confirmFounderGrant = () => {
    if (!founderGrantTarget) return;
    toggleLoungeMutation.mutate({
      userId: founderGrantTarget.userId,
      loungeKey: HIGH_STAKES_LOUNGE,
      granted: founderGrantTarget.granted,
    });
  };

  // Wave Y8: change-role mutation. Posts to /api/members/:id/role; backend
  // calls reinitializeLoungeAccess which writes users.role + access_change_log
  // + founder_audit_log + heritage lounge re-grants atomically. On success we
  // invalidate the members + per-user lounge-access caches so the matrix
  // re-fetches with the new role's defaults.
  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, newRole, reason }: { userId: string; newRole: string; reason: string | null }) =>
      postJSON(`/api/members/${userId}/role`, { newRole, reason }),
    onSuccess: (_d, vars) => {
      toast({
        title: "Role updated",
        description: `Now ${ROLE_LABEL[vars.newRole] || vars.newRole}. Heritage lounges re-granted to the new role's defaults.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members/audit"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members/lounge-access", vars.userId] });
      setRoleChangeTarget(null);
      setRoleChangeReason("");
    },
    onError: (err: Error) =>
      toast({ title: "Role change failed", description: err.message, variant: "destructive" }),
  });

  const openChangeRole = (member: MemberRow) => {
    setRoleChangeTarget(member);
    setRoleChangeNewRole(member.role || "sales_agent");
    setRoleChangeReason("");
  };

  // Wave Z8: reset-to-role-default mutation. Wipes any per-user override rows
  // in user_lounge_access + re-grants the canonical defaults for the user's
  // current role. Used to clear stale overrides from earlier waves so the
  // toggle matrix matches ROLE_TO_LOUNGES.
  const resetLoungeMutation = useMutation({
    mutationFn: (userId: string) =>
      postJSON(`/api/members/${userId}/reset-lounge-access`, {}),
    onSuccess: (_d, userId) => {
      toast({
        title: "Access reset",
        description: "Toggle matrix now reflects this role's canonical defaults.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/members/lounge-access", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/members/audit"] });
    },
    onError: (err: Error) =>
      toast({ title: "Reset failed", description: err.message, variant: "destructive" }),
  });

  // Wave Z9: bulk reset — fires reset for every member in one click. Use case:
  // earlier wave spec changes left stale per-user override rows on multiple
  // users; this clears them all at once so the matrix matches ROLE_TO_LOUNGES
  // for the entire roster.
  const resetAllLoungeMutation = useMutation({
    mutationFn: () => postJSON(`/api/members/reset-all-lounge-access`, {}),
    onSuccess: (data: any) => {
      toast({
        title: `Bulk reset complete`,
        description: `${data?.pass ?? "All"} of ${data?.total ?? "?"} members reset to role defaults.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members/audit"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members/lounge-access"] });
    },
    onError: (err: Error) =>
      toast({ title: "Bulk reset failed", description: err.message, variant: "destructive" }),
  });

  // Wave AB: hard-delete user. PROTECTED_EMAILS guard (guy4carbs@gmail.com)
  // is enforced server-side; this client just calls DELETE and reflects the
  // server's success/failure response.
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/members/${userId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { ...(await csrfHeaders()) },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error((err as { error?: string }).error || `HTTP ${res.status}`);
      }
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "User deleted",
        description: `${data?.deleted?.email ?? "Account"} has been removed.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members/audit"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members/pending"] });
    },
    onError: (err: Error) =>
      toast({ title: "Delete failed", description: err.message, variant: "destructive" }),
  });

  const submitChangeRole = () => {
    if (!roleChangeTarget) return;
    if (roleChangeNewRole === roleChangeTarget.role) {
      toast({ title: "No change", description: "That's already this user's role." });
      return;
    }
    changeRoleMutation.mutate({
      userId: roleChangeTarget.id,
      newRole: roleChangeNewRole,
      reason: roleChangeReason.trim() || null,
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
  // Wave Y7: matrix renders Member name, Role badge (founder gets crown +
  // gold styling), then 13 heritage lounge toggles. Goldcoast surfaces are
  // role-derived (shown read-only in the Role Defaults banner above), so
  // they're not toggleable here.
  // Wave Z2 fix: GCDataTable uses tableLayout: 'fixed', so column widths MUST
  // be passed via the Column.width field — minWidth on inner content is
  // ignored. Setting explicit widths so toggle switches no longer overlap the
  // Role column's Change button.
  const loungeColumns: Column<MemberRow>[] = [
    {
      key: "memberName",
      label: "Member",
      width: 180,
      render: (_v, row) => (
        <div>
          <div
            style={{
              fontSize: "var(--gc-text-sm)",
              color: "var(--gc-text-primary)",
              fontWeight: 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {row.first_name} {row.last_name}
          </div>
          <div
            style={{
              fontSize: "var(--gc-text-xs)",
              color: "var(--gc-text-muted)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {row.email}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      width: 340,
      render: (_v, row) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <RoleBadge role={row.role} />
          <button
            type="button"
            onClick={() => openChangeRole(row)}
            className="inline-flex items-center text-xs whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gc-gold)] transition-colors"
            style={{
              color: "var(--gc-text-secondary)",
              fontFamily: "var(--gc-font-body)",
              padding: "2px 8px",
              borderRadius: "var(--gc-radius-full)",
              border: "1px solid var(--gc-border)",
              backgroundColor: "var(--gc-surface)",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--gc-gold)";
              e.currentTarget.style.color = "var(--gc-gold)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--gc-border)";
              e.currentTarget.style.color = "var(--gc-text-secondary)";
            }}
            aria-label={`Change role for ${row.first_name} ${row.last_name}`}
          >
            Change
          </button>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  `Reset ${row.first_name} ${row.last_name}'s access to ${ROLE_LABEL[row.role] || row.role} defaults? This wipes any per-user lounge overrides.`,
                )
              ) {
                resetLoungeMutation.mutate(row.id);
              }
            }}
            disabled={resetLoungeMutation.isPending}
            className="inline-flex items-center text-xs whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gc-gold)] transition-colors disabled:opacity-50"
            style={{
              color: "var(--gc-text-muted)",
              fontFamily: "var(--gc-font-body)",
              padding: "2px 8px",
              borderRadius: "var(--gc-radius-full)",
              border: "1px solid var(--gc-border)",
              backgroundColor: "transparent",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--gc-gold)";
              e.currentTarget.style.color = "var(--gc-gold)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--gc-border)";
              e.currentTarget.style.color = "var(--gc-text-muted)";
            }}
            title={`Reset to ${ROLE_LABEL[row.role] || row.role} defaults`}
            aria-label={`Reset ${row.first_name} ${row.last_name} to ${ROLE_LABEL[row.role] || row.role} role defaults`}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  `Delete ${row.first_name} ${row.last_name} (${row.email})?\n\nThis hard-deletes the user, their agent_profile, lounge grants, and notifications. Audit row written before deletion. This cannot be undone.`,
                )
              ) {
                deleteUserMutation.mutate(row.id);
              }
            }}
            disabled={deleteUserMutation.isPending}
            className="inline-flex items-center text-xs whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gc-status-terminated,#b91c1c)] transition-colors disabled:opacity-50"
            style={{
              color: "var(--gc-text-muted)",
              fontFamily: "var(--gc-font-body)",
              padding: "2px 8px",
              borderRadius: "var(--gc-radius-full)",
              border: "1px solid var(--gc-border)",
              backgroundColor: "transparent",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--gc-status-terminated, #b91c1c)";
              e.currentTarget.style.color = "var(--gc-status-terminated, #b91c1c)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--gc-border)";
              e.currentTarget.style.color = "var(--gc-text-muted)";
            }}
            title={`Delete ${row.email}`}
            aria-label={`Delete ${row.first_name} ${row.last_name}`}
          >
            Delete
          </button>
        </div>
      ),
    },
    // Wave Z2 fix: drop multi-line cascade subtitle from headers (was bleeding
    // into adjacent columns). Cascade hint moves to a single-line footer note
    // below the matrix. Tier columns get a small "↓N" badge next to the label
    // indicating how many lower tiers cascade in.
    ...VISIBLE_LOUNGE_KEYS.map<Column<MemberRow>>((lk) => {
      const tierIdx = LOUNGE_TIER_LADDER.indexOf(lk);
      const bundleMembers = LOUNGE_BUNDLES[lk] || [];
      // Cascade-down count = tier predecessors (for ladder) + bundle members
      // (for bundle leads). Both feed the same ↓N badge.
      const cascadeNames =
        tierIdx > 0
          ? LOUNGE_TIER_LADDER.slice(0, tierIdx).map((k) => LOUNGE_LABELS[k])
          : bundleMembers.map((k) => LOUNGE_LABELS[k]);
      const cascadeCount = cascadeNames.length;
      return {
        key: lk,
        width: 80,
        label: (
          <span className="inline-flex items-center justify-center gap-1 whitespace-nowrap">
            {lk === HIGH_STAKES_LOUNGE && (
              <Crown
                className="w-3.5 h-3.5"
                style={{ color: "var(--gc-gold)" }}
                aria-hidden="true"
              />
            )}
            <span>{LOUNGE_LABELS[lk]}</span>
            {cascadeCount > 0 && (
              <span
                title={`Cascades to: ${cascadeNames.join(", ")}`}
                aria-label={`Toggling on also grants ${cascadeNames.join(", ")}`}
                style={{
                  fontSize: "9px",
                  color: "var(--gc-gold)",
                  fontWeight: 600,
                  border: "1px solid var(--gc-gold)",
                  borderRadius: "var(--gc-radius-full)",
                  padding: "0 4px",
                  lineHeight: 1.4,
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                ↓{cascadeCount}
              </span>
            )}
          </span>
        ),
        align: "center",
        render: (_v, row) => (
          <ToggleCell row={row} loungeKey={lk} onToggle={handleToggleLounge} />
        ),
      };
    }),
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
          ...ALL_ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] || r })),
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
          the matching client-side filter helper before rendering. */}
      <section
        aria-labelledby="founders-access-kpi-heading"
        className="mb-6 mt-6"
        data-tour-id={TOUR.FOUNDERS.ACCESS.KPI_GRID}
      >
        <h2 id="founders-access-kpi-heading" className="sr-only">Lounge access KPIs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accessKpisQuery.isLoading || !accessKpisQuery.data ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[116px] w-full" />
            ))
          ) : (
            <>
              <Link
                href="#pending"
                aria-label={`Pending registrations: ${accessKpisQuery.data.pendingCount} — jump to pending tab`}
                className={KPI_LINK_CLASS}
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
                aria-label={`Active members: ${accessKpisQuery.data.activeMembers} — jump to members tab`}
                className={KPI_LINK_CLASS}
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
                aria-label={`High-trust 2FA coverage: ${accessKpisQuery.data.twoFactorCoverage}% (${accessKpisQuery.data.twoFactorEnabledCount} of ${accessKpisQuery.data.highTrustMemberCount}) — jump to members filtered by no-2FA`}
                className={KPI_LINK_CLASS}
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
                aria-label={`Idle 60 days: ${accessKpisQuery.data.idle60d} members — jump to members filtered by idle`}
                className={KPI_LINK_CLASS}
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
      </section>

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
                  color: "var(--gc-text-primary)",
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
              subtext={(pendingQuery.error as Error | undefined)?.message || "Try refreshing in a moment."}
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
                      onClick={() => {
                        setApproveTarget(reg);
                        setApproveUplineId("");
                        setApproveContractPct(80);
                        setApproveReason("");
                      }}
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
              subtext={(membersQuery.error as Error | undefined)?.message || "Try refreshing in a moment."}
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
              subtext={(membersQuery.error as Error | undefined)?.message || "Try refreshing in a moment."}
            />
          ) : matrixMembers.length === 0 ? (
            <EmptyTableBlock
              title="No members to display."
              subtext="Once members are approved, the lounge matrix populates here."
            />
          ) : (
            <>
              <RoleDefaultsBanner />
              <div className="flex items-center justify-end mb-3">
                <GCSecondaryButton
                  onClick={() => {
                    if (
                      window.confirm(
                        `Reset ALL ${matrixMembers.length} members to their role's canonical lounge defaults?\n\nThis wipes any per-user overrides currently in user_lounge_access. Each member's toggles will immediately reflect ROLE_TO_LOUNGES for their role. Audit-logged.`,
                      )
                    ) {
                      resetAllLoungeMutation.mutate();
                    }
                  }}
                  disabled={resetAllLoungeMutation.isPending}
                >
                  {resetAllLoungeMutation.isPending ? "Resetting…" : "Reset all to role defaults"}
                </GCSecondaryButton>
              </div>
              <GCDataTable
                columns={loungeColumns}
                data={matrixMembers}
                searchable
                searchPlaceholder="Search members…"
                pageSize={20}
              />
              <div
                className="px-4 py-3 mt-2 flex flex-wrap items-center gap-x-6 gap-y-1"
                style={{
                  fontSize: "var(--gc-text-xs)",
                  color: "var(--gc-text-muted)",
                }}
              >
                <span>{members.length} members total.</span>
                <span>
                  <span style={{ color: "var(--gc-gold)", fontWeight: 600 }}>↓N</span>{" "}
                  badges = tier cascade. Toggling Manager auto-grants Agent, Director auto-grants Manager + Agent, etc.
                </span>
                <span>
                  Granting <strong style={{ color: "var(--gc-text-secondary)" }}>Admin</strong> requires confirmation.
                </span>
                <span>
                  CRM + Onboarding auto-included with any heritage access. Admin bundles AI + Support.
                </span>
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
              subtext={(auditQuery.error as Error | undefined)?.message || "Try refreshing in a moment."}
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
                    id: rejectTarget.user_id,
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

      {/* ─── APPROVE WITH HIERARCHY PLACEMENT (Wave AC) ─── */}
      {approveTarget && (
        <GCModal
          title={`Approve ${approveTarget.first_name} ${approveTarget.last_name}`}
          icon={<Check className="w-5 h-5" style={{ color: "var(--gc-gold)" }} aria-hidden="true" />}
          subtitle={`Place ${approveTarget.email} in the hierarchy and set their contract level.`}
          onClose={() => {
            if (approveMutation.isPending) return;
            setApproveTarget(null);
            setApproveReason("");
          }}
          width={520}
        >
          <div className="mb-3">
            <label style={GC_FORM_LABEL}>Upline</label>
            <GCSelect
              theme={theme}
              value={approveUplineId}
              onValueChange={setApproveUplineId}
              width="100%"
              options={[
                { value: "", label: "(Top of tree — no upline)" },
                ...((uplinesQuery.data ?? []).map((u) => ({
                  value: u.id,
                  label: `${u.first_name} ${u.last_name} — ${ROLE_LABEL[u.role] || u.role} (${u.contract_level ?? "—"}%)`,
                }))),
              ]}
            />
            {uplinesQuery.data && uplinesQuery.data.length === 0 && (
              <p
                style={{
                  fontSize: 11,
                  color: "var(--gc-text-muted)",
                  marginTop: 4,
                  fontFamily: "var(--gc-font-body)",
                }}
              >
                No active uplines yet. Approving with no upline places this agent at the top of the tree.
              </p>
            )}
          </div>
          <div className="mb-3">
            <label style={GC_FORM_LABEL}>Contract level %</label>
            <Input
              type="number"
              min={0}
              max={120}
              value={approveContractPct}
              onChange={(e) =>
                setApproveContractPct(
                  Math.max(0, Math.min(120, Number(e.target.value) || 0)),
                )
              }
              style={GC_FORM_INPUT}
            />
            <p
              style={{
                fontSize: 11,
                color: "var(--gc-text-muted)",
                marginTop: 4,
                fontFamily: "var(--gc-font-body)",
              }}
            >
              80% is the new-agent baseline. Owner is 120%; the spread is the override.
            </p>
          </div>
          <div className="mb-3">
            <label style={GC_FORM_LABEL}>Reason (optional, audited)</label>
            <Input
              value={approveReason}
              onChange={(e) => setApproveReason(e.target.value)}
              placeholder="e.g. Q2 hire from Smith agency"
              maxLength={500}
              style={GC_FORM_INPUT}
            />
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <GCSecondaryButton
              onClick={() => {
                if (approveMutation.isPending) return;
                setApproveTarget(null);
                setApproveReason("");
              }}
            >
              Cancel
            </GCSecondaryButton>
            <GCPrimaryButton
              onClick={() =>
                approveMutation.mutate({
                  userId: approveTarget.user_id,
                  uplineId: approveUplineId || null,
                  contractLevelPct: approveContractPct,
                  reason: approveReason.trim() || null,
                })
              }
              icon={<Check className="w-4 h-4" aria-hidden="true" />}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? "Approving…" : "Approve"}
            </GCPrimaryButton>
          </div>
        </GCModal>
      )}

      {/* ─── CHANGE ROLE (Wave Y8) ─── */}
      {roleChangeTarget && (
        <GCModal
          title={`Change role — ${roleChangeTarget.first_name} ${roleChangeTarget.last_name}`}
          icon={<Crown className="w-5 h-5" style={{ color: "var(--gc-gold)" }} aria-hidden="true" />}
          subtitle={`Currently ${ROLE_LABEL[roleChangeTarget.role] || roleChangeTarget.role}`}
          onClose={() => {
            if (changeRoleMutation.isPending) return;
            setRoleChangeTarget(null);
            setRoleChangeReason("");
          }}
          width={520}
        >
          <p
            className="mb-3"
            style={{
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-sm)",
              color: "var(--gc-text-secondary)",
              lineHeight: 1.5,
            }}
          >
            Changing the role updates Goldcoast surface access (auto-derived
            from the role) and re-grants Heritage lounge defaults from the
            canonical matrix. Existing per-user lounge overrides are reset.
          </p>
          <div className="mb-3">
            <label style={GC_FORM_LABEL}>New role</label>
            <GCSelect
              theme={theme}
              value={roleChangeNewRole}
              onValueChange={setRoleChangeNewRole}
              width="100%"
              options={ALL_ROLES.map((r) => ({
                value: r,
                label: ROLE_LABEL[r] || r,
              }))}
            />
          </div>
          <div className="mb-3">
            <label style={GC_FORM_LABEL}>Reason (optional, audited)</label>
            <Input
              value={roleChangeReason}
              onChange={(e) => setRoleChangeReason(e.target.value)}
              placeholder="e.g. Promoted from Sales Agent to Manager"
              maxLength={500}
              style={GC_FORM_INPUT}
            />
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <GCSecondaryButton
              onClick={() => {
                if (changeRoleMutation.isPending) return;
                setRoleChangeTarget(null);
                setRoleChangeReason("");
              }}
            >
              Cancel
            </GCSecondaryButton>
            <GCPrimaryButton
              onClick={submitChangeRole}
              icon={<Crown className="w-4 h-4" aria-hidden="true" />}
              disabled={
                changeRoleMutation.isPending ||
                roleChangeNewRole === roleChangeTarget.role
              }
            >
              {changeRoleMutation.isPending ? "Updating…" : "Update role"}
            </GCPrimaryButton>
          </div>
        </GCModal>
      )}

      {/* ─── HIGH-STAKES LOUNGE GRANT CONFIRMATION (admin_panel) ─── */}
      {founderGrantTarget && (
        <GCModal
          title="Grant Admin Panel Access?"
          icon={<Crown className="w-5 h-5" style={{ color: "var(--gc-gold)" }} aria-hidden="true" />}
          subtitle={null}
          onClose={() => setFounderGrantTarget(null)}
          width={500}
        >
          <p style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", lineHeight: 1.5 }}>
            Granting the Admin Panel gives{" "}
            <strong style={{ color: "var(--gc-text-primary)" }}>{founderGrantTarget?.memberName}</strong>{" "}
            heritage's most powerful surface (user management, system controls, role
            mutations). This is consequential — proceed only if intended.
          </p>
          <div className="flex items-center justify-end gap-2 mt-6">
            <GCSecondaryButton onClick={() => setFounderGrantTarget(null)}>Cancel</GCSecondaryButton>
            <GCPrimaryButton onClick={confirmFounderGrant} icon={<Crown className="w-4 h-4" aria-hidden="true" />}>
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
                    {LOUNGE_KEYS.map((lk) => {
                      // Wave Z7: per-user override OR role default fallback.
                      const userOverride = memberAccessMap[lk];
                      const granted =
                        userOverride !== undefined
                          ? userOverride
                          : (ROLE_TO_LOUNGES[selectedMember.role] || []).includes(lk);
                      const isHighStakes = lk === HIGH_STAKES_LOUNGE;
                      return (
                        <div
                          key={lk}
                          className="flex items-center justify-between px-4 py-3"
                          style={{
                            backgroundColor: "var(--gc-surface)",
                            borderRadius: "var(--gc-radius-md)",
                            border: "1px solid var(--gc-border)",
                            borderLeft: `3px solid ${granted ? "var(--gc-gold)" : "var(--gc-border)"}`,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {isHighStakes && (
                              <Crown
                                className="w-3.5 h-3.5"
                                style={{ color: "var(--gc-gold)" }}
                                aria-hidden="true"
                              />
                            )}
                            <span
                              style={{
                                fontSize: "var(--gc-text-sm)",
                                fontWeight: 500,
                                color: "var(--gc-text-primary)",
                                fontFamily: "var(--gc-font-body)",
                              }}
                            >
                              {LOUNGE_LABELS[lk]} Lounge
                            </span>
                          </div>
                          <GCSwitch
                            checked={granted}
                            onCheckedChange={(checked) => {
                              if (isHighStakes && checked) {
                                setFounderGrantTarget({
                                  userId: selectedMember.id,
                                  memberName: `${selectedMember.first_name} ${selectedMember.last_name}`,
                                  granted: true,
                                });
                              } else {
                                toggleLoungeMutation.mutate({
                                  userId: selectedMember.id,
                                  loungeKey: lk,
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

// ─── ROLE DEFAULTS BANNER ───
// Read-only access matrix showing the canonical role → surface mapping across
// BOTH deployments — Gold Coast (left) and Heritage (right). Goldcoast is
// role-gated at the Express layer, heritage is lounge-key-gated. Sourced from
// shared/models/loungeAccess.ts so the banner can never drift from runtime.
function RoleDefaultsBanner() {
  return (
    <section
      aria-labelledby="role-defaults-heading"
      className="mb-4 rounded-md p-4"
      style={{
        backgroundColor: "var(--gc-surface-2)",
        border: "1px solid var(--gc-border-subtle)",
      }}
    >
      <h3
        id="role-defaults-heading"
        style={{
          fontSize: "var(--gc-text-xs)",
          color: "var(--gc-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "var(--gc-tracking-wider)",
          fontFamily: "var(--gc-font-body)",
          marginBottom: "var(--gc-space-2)",
        }}
      >
        Role Access Matrix — read-only reference
      </h3>
      <p
        className="mb-4"
        style={{
          fontSize: "var(--gc-text-xs)",
          color: "var(--gc-text-secondary)",
          fontFamily: "var(--gc-font-body)",
        }}
      >
        Default access by role. Override per user in the matrix below.
      </p>
      <div className="flex flex-col gap-4">
        <RoleMatrixTable
          title="Gold Coast Surfaces"
          subtitle="Auto-granted by role. Not toggleable."
          accent="var(--gc-gold)"
          columns={GC_SURFACES.map((k) => ({ key: k, label: GC_SURFACE_LABELS[k] }))}
          rowHas={(role, key) => (ROLE_TO_GC_SURFACES[role] || []).includes(key as GcSurface)}
        />
        <RoleMatrixTable
          title="Heritage Lounges"
          subtitle="Default by role. Override per user below."
          accent="var(--gc-gold-bright)"
          columns={LOUNGE_KEYS.map((k) => ({ key: k, label: LOUNGE_LABELS[k] }))}
          rowHas={(role, key) => (ROLE_TO_LOUNGES[role] || []).includes(key as LoungeKey)}
        />
      </div>
    </section>
  );
}

function RoleMatrixTable({
  title,
  subtitle,
  accent,
  columns,
  rowHas,
}: {
  title: string;
  subtitle: string;
  accent: string;
  columns: Array<{ key: string; label: string }>;
  rowHas: (role: string, key: string) => boolean;
}) {
  return (
    <div
      className="rounded-md p-3"
      style={{
        backgroundColor: "var(--gc-surface)",
        border: "1px solid var(--gc-border)",
      }}
    >
      <div
        className="mb-1 flex items-center gap-2"
        style={{
          fontSize: "var(--gc-text-sm)",
          fontWeight: 600,
          color: "var(--gc-text-primary)",
          fontFamily: "var(--gc-font-body)",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: accent,
            display: "inline-block",
          }}
        />
        {title}
      </div>
      <div
        className="mb-3"
        style={{
          fontSize: "var(--gc-text-xs)",
          color: "var(--gc-text-muted)",
          fontFamily: "var(--gc-font-body)",
        }}
      >
        {subtitle}
      </div>
      <div style={{ width: "100%" }}>
        <table
          className="border-collapse"
          style={{
            fontSize: "11px",
            fontFamily: "var(--gc-font-body)",
            tableLayout: "fixed",
            width: "100%",
          }}
        >
          <colgroup>
            <col style={{ width: "110px" }} />
            {columns.map((c) => (
              <col key={c.key} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th
                className="text-left py-2 pr-2"
                style={{
                  color: "var(--gc-text-muted)",
                  fontWeight: 500,
                  borderBottom: "1px solid var(--gc-border-subtle)",
                }}
              >
                Role
              </th>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="px-1 py-2 text-center"
                  style={{
                    color: "var(--gc-text-muted)",
                    fontWeight: 500,
                    borderBottom: "1px solid var(--gc-border-subtle)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={c.label}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_ROLES.map((role, idx) => {
              const isFounder = role === "founder";
              return (
                <tr
                  key={role}
                  style={{
                    backgroundColor: isFounder
                      ? "color-mix(in srgb, var(--gc-gold) 8%, transparent)"
                      : idx % 2 === 1
                      ? "var(--gc-surface-2)"
                      : "transparent",
                  }}
                >
                  <td
                    className="py-1.5 pr-3 whitespace-nowrap"
                    style={{
                      color: isFounder ? "var(--gc-gold)" : "var(--gc-text-primary)",
                      fontWeight: isFounder ? 600 : 500,
                    }}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {isFounder && (
                        <Crown
                          className="w-3.5 h-3.5"
                          style={{ color: "var(--gc-gold)" }}
                          aria-hidden="true"
                        />
                      )}
                      {ROLE_LABEL[role] || role}
                    </span>
                  </td>
                  {columns.map((c) => {
                    const has = rowHas(role, c.key);
                    return (
                      <td
                        key={c.key}
                        className="px-1 py-1.5 text-center"
                        style={{
                          color: has ? "var(--gc-gold)" : "var(--gc-text-muted)",
                          fontWeight: has ? 600 : 400,
                        }}
                        aria-label={`${ROLE_LABEL[role] || role} ${has ? "has" : "lacks"} ${c.label} access`}
                      >
                        {has ? "✓" : "—"}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── TOGGLE CELL ───
// Per-row lounge access fetch + switch. React-Query dedupes the 13 cells
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
  // Wave Z7: effective state = per-user override OR role default. If the user
  // has an explicit row in user_lounge_access (granted true OR false), that
  // wins. Otherwise fall back to ROLE_TO_LOUNGES[role] so a fresh founder
  // shows all toggles ON, a fresh sales_agent shows only Agent ON, etc.
  const granted = useMemo(() => {
    const entry = (data ?? []).find((r) => r.lounge_key === loungeKey);
    if (entry) return entry.granted;
    return (ROLE_TO_LOUNGES[row.role] || []).includes(loungeKey as LoungeKey);
  }, [data, loungeKey, row.role]);

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
