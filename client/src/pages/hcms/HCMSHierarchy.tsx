import { useState, useEffect, useMemo, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GCPageHeader, GCKPICard, GCDataTable, GCPeriodSelector, type HierarchyNode, type Column } from "@/components/gc";
import { TOUR } from "@/lib/tour/selectors";
import { GCHierarchyFlow, buildNodesEdges } from "@/components/gc/GCHierarchyFlow";
import { HierarchyEditModal } from "@/components/hierarchy/HierarchyEditModal";
import { QuickNameTeamModal, type QuickNameAgent } from "@/components/hierarchy/QuickNameTeamModal";
import { AgentDetailDrawer } from "@/components/hierarchy/AgentDetailDrawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Eye, AlertTriangle, Users, Search, Download, Image as ImageIcon, ChevronRight, Pencil } from "lucide-react";
import { toPng } from "html-to-image";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export type HCMSHierarchyVariant = "admin" | "founder";

export interface HCMSHierarchyProps {
  /** Override the auto-derived variant. Admin shows edit affordances; founder is read-only. */
  variant?: HCMSHierarchyVariant;
}

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
  display: "flex",
  flexDirection: "column",
};

// Cohort filter periods. Mirrors the codes used by `server/utils/dateRange.ts`
// — keep these in sync if you add server-side filtering for hierarchy.
const COHORT_PERIODS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today (DTD)" },
  { value: "wtd", label: "This Week" },
  { value: "mtd", label: "This Month" },
  { value: "qtd", label: "This Quarter" },
  { value: "6mo", label: "Last 6 Months" },
  { value: "ytd", label: "Year to Date" },
];

// Inline mirror of `server/utils/dateRange.ts` so cohort filtering can run
// purely client-side. Only the period codes the cohort selector emits need
// support here — keep in sync if codes change server-side.
function getCohortRange(period: string): { start: Date; end: Date } | null {
  if (period === "all") return null;
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  switch (period) {
    case "today": return { start: new Date(now.getFullYear(), now.getMonth(), now.getDate()), end };
    case "wtd": {
      const dow = now.getDay();
      const offsetToMonday = (dow + 6) % 7;
      return { start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - offsetToMonday), end };
    }
    case "mtd": return { start: new Date(now.getFullYear(), now.getMonth(), 1), end };
    case "qtd": {
      const q = Math.floor(now.getMonth() / 3) * 3;
      return { start: new Date(now.getFullYear(), q, 1), end };
    }
    case "6mo": return { start: new Date(now.getFullYear(), now.getMonth() - 5, 1), end };
    case "ytd": return { start: new Date(now.getFullYear(), 0, 1), end };
    default: return null;
  }
}

// Computed level color — handles arbitrary org depth via HSL hue rotation.
// Depth 0 = gold (root); subsequent levels rotate 35° while keeping warm-tone
// saturation/lightness so colors stay readable at any depth.
function levelColor(depth: number): string {
  if (depth === 0) return "var(--gc-gold)";
  const hue = (35 * depth + 30) % 360;
  return `hsl(${hue}, 45%, 55%)`;
}

/* ------------------------------------------------------------------ */
/* Types matching backend hierarchy + agents                          */
/* ------------------------------------------------------------------ */

interface HierarchyRecord {
  agent_user_id: string;
  direct_upline_id: string | null;
  hierarchy_level: number;
  hierarchy_title: string | null;
  contract_level: string | null;
  override_eligible: boolean;
  override_percentage: string | null;
  first_name: string;
  last_name: string;
  display_name?: string | null;
  dba_type?: string | null;
  company_name?: string | null;
  dba_name?: string | null;
  created_at?: string | null;
}

interface AgentSummary {
  userId: string; firstName: string; lastName: string;
  docsSigned: number; docsUploaded: number; allCompleted: boolean;
  status: string;
}

/* ------------------------------------------------------------------ */
/* Build tree from flat hierarchy records                              */
/* ------------------------------------------------------------------ */

function buildTree(
  records: HierarchyRecord[],
  _agents: AgentSummary[],
  aipMap?: Map<string, number>,
): HierarchyNode {
  const nodeMap = new Map<string, HierarchyNode>();

  // Create a node for each hierarchy record
  records.forEach(r => {
    // For business-entity agents, prefer the company / DBA name (the agency
    // brand) over the personal name of the principal.
    const displayName =
      (r.display_name && r.display_name.trim()) ||
      (r.dba_type === "business_entity" && (r.company_name || r.dba_name)) ||
      `${r.first_name} ${r.last_name}`.trim();
    nodeMap.set(r.agent_user_id, {
      id: r.agent_user_id,
      name: displayName,
      title: r.hierarchy_title || `Level ${r.hierarchy_level}`,
      level: r.hierarchy_level,
      contractLevel: parseFloat(r.contract_level || "0"),
      overridePercentage: parseFloat(r.override_percentage || "0"),
      // Real YTD AP rolled up the subtree from /api/hcms/hierarchy/aip-rollup.
      // Falls back to 0 only if the rollup query is still loading or failed.
      totalAip: aipMap?.get(r.agent_user_id) ?? 0,
      children: [],
    });
  });

  // Find the root(s) — nodes with no upline or whose upline isn't in the set
  const roots: HierarchyNode[] = [];
  records.forEach(r => {
    const node = nodeMap.get(r.agent_user_id)!;
    if (r.direct_upline_id && nodeMap.has(r.direct_upline_id)) {
      nodeMap.get(r.direct_upline_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // If multiple roots, wrap them in an agency node
  if (roots.length === 0) {
    return { id: "agency", name: "Agency", title: "No hierarchy data", level: 0, contractLevel: 0, overridePercentage: 0, totalAip: 0, children: [] };
  }
  if (roots.length === 1) return roots[0];

  return { id: "agency", name: "Agency", title: "Agency Root", level: 0, contractLevel: 0, overridePercentage: 0, totalAip: 0, children: roots };
}

/* ------------------------------------------------------------------ */
/* Flatten for table view                                             */
/* ------------------------------------------------------------------ */

function flatten(node: HierarchyNode, upline: string = "—", depth: number = 0): any[] {
  return [
    { id: node.id, name: node.name, level: node.level, title: node.title, contractLevel: node.contractLevel, overridePercentage: node.overridePercentage, upline, downlines: node.children.length, teamAip: node.totalAip, depth },
    ...node.children.flatMap(c => flatten(c, node.name, depth + 1))
  ];
}

/* ------------------------------------------------------------------ */
/* Sub-tree drill — extract a sub-tree rooted at `focusedRootId`       */
/* ------------------------------------------------------------------ */

function findSubtree(node: HierarchyNode, id: string): HierarchyNode | null {
  if (node.id === id) return node;
  for (const c of node.children) {
    const found = findSubtree(c, id);
    if (found) return found;
  }
  return null;
}

// Build the breadcrumb chain from the root down to the focused node.
function findAncestors(node: HierarchyNode, id: string, trail: HierarchyNode[] = []): HierarchyNode[] | null {
  if (node.id === id) return [...trail, node];
  for (const c of node.children) {
    const found = findAncestors(c, id, [...trail, node]);
    if (found) return found;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Cohort filter — keep in-cohort agents + ancestors as muted context */
/* ------------------------------------------------------------------ */

function filterByCohort(
  records: HierarchyRecord[],
  range: { start: Date; end: Date }
): { kept: HierarchyRecord[]; mutedIds: Set<string> } {
  const byId = new Map<string, HierarchyRecord>();
  records.forEach(r => byId.set(r.agent_user_id, r));

  // Walk up upline chain to mark ancestors as context (muted) so the
  // hierarchy chain stays visible even when only a leaf is in the cohort.
  const inCohort = new Set<string>();
  records.forEach(r => {
    if (!r.created_at) return;
    const ts = new Date(r.created_at);
    if (ts >= range.start && ts <= range.end) inCohort.add(r.agent_user_id);
  });

  const ancestors = new Set<string>();
  inCohort.forEach(id => {
    let cur = byId.get(id);
    while (cur && cur.direct_upline_id) {
      const up = cur.direct_upline_id;
      if (inCohort.has(up) || ancestors.has(up)) break;
      ancestors.add(up);
      cur = byId.get(up);
    }
  });

  const keptIds = new Set<string>();
  inCohort.forEach(id => keptIds.add(id));
  ancestors.forEach(id => keptIds.add(id));
  const kept = records.filter(r => keptIds.has(r.agent_user_id));
  return { kept, mutedIds: ancestors };
}

/* ------------------------------------------------------------------ */
/* CSV export helpers                                                 */
/* ------------------------------------------------------------------ */

function csvEscape(v: any): string {
  const s = v == null ? "" : String(v);
  if (s.includes(",") || s.includes("\"") || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/* ------------------------------------------------------------------ */
/* Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function HCMSHierarchy({ variant: variantProp }: HCMSHierarchyProps = {}) {
  const [view, setView] = useState<"tree" | "table">("tree");
  const [records, setRecords] = useState<HierarchyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // B.1 cohort filter state
  const [cohortPeriod, setCohortPeriod] = useState("all");

  // B.2 sub-tree drill state
  const [focusedRootId, setFocusedRootId] = useState<string | null>(null);

  // Wave 1B — drawer state. Single-click on a hierarchy node opens this
  // drawer; double-click drills (existing onNodeClick → setFocusedRootId).
  const [drawerAgentId, setDrawerAgentId] = useState<string | null>(null);

  // B.3 search-jump state
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // C.1 — variant derivation. Auto-pick admin for founder/owner/system_admin
  // roles unless caller pinned the variant explicitly. Falls back to founder
  // (read-only) for everyone else, including unauthenticated render paths.
  const { user } = useAuth();
  const variant: HCMSHierarchyVariant = useMemo(() => {
    if (variantProp) return variantProp;
    const role = (user as any)?.role as string | undefined;
    if (role === "founder" || role === "owner" || role === "system_admin") return "admin";
    return "founder";
  }, [variantProp, user]);
  const isAdmin = variant === "admin";

  // C.2/3 — mutation + modal state. Right-click menu lives at (x, y) screen
  // coords; modal is opened by either menu click or pencil icon click.
  const [contextMenu, setContextMenu] = useState<{ agentId: string; x: number; y: number } | null>(null);
  const [editModal, setEditModal] = useState<{
    mode: "title" | "contract";
    agentId: string;
    agentName: string;
    currentValue: string | number;
  } | null>(null);

  // C.6 — Quick Name (single unified path). Both "Set Team Name" and
  // "Convert to Agency" right-click items now route through this modal +
  // the same backend endpoint. We keep the two labels so founders see the
  // mental model that fits the task, but the underlying flow is one path.
  const [quickNameModal, setQuickNameModal] = useState<{
    agent: QuickNameAgent;
  } | null>(null);
  // Optimistic move snapshot — keep the previous records around so we can
  // roll back if the server rejects the change.
  const optimisticSnapshotRef = useRef<HierarchyRecord[] | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // C.3 — mutation hooks. All three hit the same endpoint with different
  // body shapes; on success we refetch the tree and show a toast. On error
  // we surface the server's error.message and revert any optimistic state.
  type PatchBody = { directUplineId?: string | null; hierarchyTitle?: string; contractLevel?: number };
  async function patchAgent(agentId: string, body: PatchBody) {
    const res = await apiRequest("PATCH", `/api/hcms/hierarchy/agents/${agentId}`, body);
    return res.json();
  }

  const moveMutation = useMutation({
    mutationFn: ({ agentId, directUplineId }: { agentId: string; directUplineId: string | null }) =>
      patchAgent(agentId, { directUplineId }),
    onSuccess: () => {
      optimisticSnapshotRef.current = null;
      queryClient.invalidateQueries({ queryKey: ["/api/hcms/hierarchy/tree"] });
      loadData();
      toast({ title: "Hierarchy updated", description: "Upline reassigned successfully." });
    },
    onError: (err: any) => {
      if (optimisticSnapshotRef.current) {
        setRecords(optimisticSnapshotRef.current);
        optimisticSnapshotRef.current = null;
      }
      toast({ title: "Move failed", description: err?.message || "Unable to update upline.", variant: "destructive" as any });
    },
  });

  const titleMutation = useMutation({
    mutationFn: ({ agentId, hierarchyTitle }: { agentId: string; hierarchyTitle: string }) =>
      patchAgent(agentId, { hierarchyTitle }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hcms/hierarchy/tree"] });
      loadData();
      toast({ title: "Title updated", description: "Hierarchy title saved." });
    },
    onError: (err: any) => {
      toast({ title: "Update failed", description: err?.message || "Unable to update title.", variant: "destructive" as any });
      throw err;
    },
  });

  const contractMutation = useMutation({
    mutationFn: ({ agentId, contractLevel }: { agentId: string; contractLevel: number }) =>
      patchAgent(agentId, { contractLevel }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hcms/hierarchy/tree"] });
      loadData();
      toast({ title: "Contract updated", description: "Contract level saved." });
    },
    onError: (err: any) => {
      toast({ title: "Update failed", description: err?.message || "Unable to update contract level.", variant: "destructive" as any });
      throw err;
    },
  });

  // Drag-drop reassign handler. Optimistically reassigns the upline locally
  // before the server confirms — if the mutation rejects, the snapshot ref
  // restores the previous state.
  const handleMoveAgent = (agentId: string, newUplineId: string | null) => {
    if (!isAdmin) return;
    optimisticSnapshotRef.current = records;
    setRecords(curr => curr.map(r => r.agent_user_id === agentId ? { ...r, direct_upline_id: newUplineId } : r));
    moveMutation.mutate({ agentId, directUplineId: newUplineId });
  };

  // Right-click → open the floating menu. Coordinates come from the flow
  // component as clientX/clientY so the menu uses position: fixed.
  const handleNodeRightClick = (agentId: string, x: number, y: number) => {
    if (!isAdmin) return;
    setContextMenu({ agentId, x, y });
  };

  // Outside-click closer for the floating menu. Closes ONLY on clicks outside
  // the menu (so users can hover/scroll within it without dismissal) and on
  // Escape. Defer the listener attach by one tick so the originating click
  // doesn't immediately dismiss it.
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!contextMenu) return;
    const onClick = (e: MouseEvent) => {
      if (contextMenuRef.current && contextMenuRef.current.contains(e.target as Node)) return;
      setContextMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContextMenu(null);
    };
    const t = setTimeout(() => {
      document.addEventListener("mousedown", onClick);
      document.addEventListener("keydown", onKey);
    }, 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [contextMenu]);

  const openEditModal = (mode: "title" | "contract", agentId: string) => {
    const rec = records.find(r => r.agent_user_id === agentId);
    if (!rec) return;
    const agentName =
      (rec.display_name && rec.display_name.trim()) ||
      (rec.dba_type === "business_entity" && (rec.company_name || rec.dba_name)) ||
      `${rec.first_name} ${rec.last_name}`.trim();
    const currentValue = mode === "title"
      ? (rec.hierarchy_title || "Agent")
      : Number(rec.contract_level || 0) || 100;
    setEditModal({ mode, agentId, agentName, currentValue });
    setContextMenu(null);
  };

  const handleEditSubmit = async (value: string | number) => {
    if (!editModal) return;
    if (editModal.mode === "title") {
      await titleMutation.mutateAsync({ agentId: editModal.agentId, hierarchyTitle: String(value) });
    } else {
      await contractMutation.mutateAsync({ agentId: editModal.agentId, contractLevel: Number(value) });
    }
  };

  // /aip-rollup returns per-agent YTD AP including downline subtree. Mapped
  // by agent_user_id and consumed by buildTree() so every node card shows real
  // team production instead of $0K. Loaded in parallel with the tree itself.
  const [aipMap, setAipMap] = useState<Map<string, number>>(new Map());

  const loadData = () => {
    setLoading(true);
    setError("");
    Promise.all([
      fetch("/api/hcms/hierarchy/tree", { credentials: "include" }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch("/api/hcms/agents/", { credentials: "include" }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch("/api/hcms/hierarchy/aip-rollup", { credentials: "include" }).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([hierarchyRecords, _agents, aipRows]) => {
      setRecords(Array.isArray(hierarchyRecords) ? hierarchyRecords : []);
      const m = new Map<string, number>();
      if (Array.isArray(aipRows)) {
        for (const row of aipRows) {
          if (row?.agentUserId) m.set(String(row.agentUserId), Number(row.totalAip) || 0);
        }
      }
      setAipMap(m);
      setLoading(false);
    }).catch(() => { setError("Failed to load hierarchy"); setLoading(false); });
  };

  useEffect(() => { loadData(); }, []);

  // Apply cohort filter to the raw records. When `created_at` is absent on
  // every record, fall back to "all" gracefully (filter has no effect).
  const cohortRange = useMemo(() => getCohortRange(cohortPeriod), [cohortPeriod]);
  const hasCreatedAt = useMemo(() => records.some(r => !!r.created_at), [records]);

  const { filteredRecords, mutedIds } = useMemo(() => {
    if (!cohortRange || !hasCreatedAt) return { filteredRecords: records, mutedIds: new Set<string>() };
    const { kept, mutedIds } = filterByCohort(records, cohortRange);
    return { filteredRecords: kept, mutedIds };
  }, [records, cohortRange, hasCreatedAt]);

  const fullTree = useMemo(() => records.length ? buildTree(records, [], aipMap) : null, [records, aipMap]);
  const filteredTree = useMemo(() => filteredRecords.length ? buildTree(filteredRecords, [], aipMap) : null, [filteredRecords, aipMap]);

  // Apply focus drill on top of the filtered tree.
  const displayTree = useMemo(() => {
    if (!filteredTree) return null;
    if (!focusedRootId) return filteredTree;
    return findSubtree(filteredTree, focusedRootId) ?? filteredTree;
  }, [filteredTree, focusedRootId]);

  const breadcrumb = useMemo(() => {
    if (!filteredTree || !focusedRootId) return [];
    return findAncestors(filteredTree, focusedRootId) ?? [];
  }, [filteredTree, focusedRootId]);

  const allRows = useMemo(() => displayTree ? flatten(displayTree) : [], [displayTree]);
  const fullRows = useMemo(() => fullTree ? flatten(fullTree) : [], [fullTree]);

  // B.3 — derive search matches from the full record set (not filtered),
  // so users can always jump even when a cohort filter is hiding context.
  const searchMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2 || !fullTree) return [];
    return fullRows
      .filter(r => r.id !== "agency")
      .filter(r => r.name.toLowerCase().includes(q) || (r.title || "").toLowerCase().includes(q))
      .slice(0, 5);
  }, [searchQuery, fullTree, fullRows]);

  function jumpToAgent(id: string) {
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    setHighlightedNodeId(id);
    highlightTimerRef.current = setTimeout(() => setHighlightedNodeId(null), 2000);
    setSearchQuery("");
  }

  // B.4 — Export PNG. Targets the React Flow viewport so the PNG matches
  // what the user sees (panned / zoomed). pixelRatio: 2 yields retina-clean
  // exports; bg color reuses surface token for a consistent canvas backdrop.
  async function exportPng() {
    const node = document.querySelector(".react-flow__viewport") as HTMLElement | null;
    if (!node) return;
    try {
      const dataUrl = await toPng(node, {
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--gc-surface").trim() || "#ffffff",
        pixelRatio: 2,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `hierarchy-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a); a.click(); a.remove();
    } catch (e) {
      console.error("PNG export failed", e);
    }
  }

  // B.4 — Export CSV using the flatten() output. Headers locked in the spec:
  // Name, Title, Level, Contract, Override, Upline, Downlines.
  function exportCsv() {
    const headers = ["Name", "Title", "Level", "Contract", "Override", "Upline", "Downlines"];
    const lines = [headers.join(",")];
    fullRows.forEach(r => {
      lines.push([
        csvEscape(r.name),
        csvEscape(r.title),
        csvEscape(r.level),
        csvEscape(r.contractLevel),
        csvEscape(r.overridePercentage),
        csvEscape(r.upline),
        csvEscape(r.downlines),
      ].join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hierarchy-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div>
        <GCPageHeader title="Hierarchy" subtitle="Team structure, contract levels & organization overview" accentUnderline />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[116px] w-full" />)}
        </div>
        <Skeleton className="w-full" style={{ height: 550 }} />
      </div>
    );
  }

  if (error || !fullTree) {
    return (
      <div>
        <GCPageHeader title="Hierarchy" subtitle="Team structure, contract levels & organization overview" accentUnderline />
        <div
          className="flex items-center gap-3"
          style={{
            ...CARD_STYLE,
            flexDirection: "row",
            borderTop: "3px solid var(--gc-status-terminated)",
          }}
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "var(--gc-status-terminated)" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-status-terminated)" }}>Unable to load hierarchy</div>
            <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{error || "No hierarchy data available"}</div>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center px-3 py-2"
            style={OUTLINED_BUTTON_STYLE}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalAgents = fullRows.length;
  const avgContract = totalAgents > 0 ? Math.round(fullRows.reduce((s: number, r: any) => s + (r.contractLevel || 0), 0) / totalAgents) : 0;
  const maxLevel = fullRows.length > 0 ? Math.max(...fullRows.map((r: any) => r.level)) + 1 : 0;

  // Cohort badge — surface "filter active" state above the tree so users
  // never get confused about why agents disappeared.
  const cohortActive = cohortPeriod !== "all" && hasCreatedAt;
  const cohortInCount = filteredRecords.length - mutedIds.size;
  const cohortTotal = records.length;

  const tableCols: Column<any>[] = [
    { key: "name", label: "Agent", sortable: true, width: "20%", render: (v: string, row: any) => {
      const indent = row.depth * 20;
      const isRealAgent = row.id && row.id.includes("-");
      return (
        <div className="flex items-center" style={{ paddingLeft: indent }}>
          {row.depth > 0 && <span style={{ color: "var(--gc-border)", marginRight: 8 }}>{"└"}</span>}
          {isRealAgent
            ? <Link href={`/hcms/agents/${row.id}`}><span title={v} style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span></Link>
            : <span title={v} style={{ fontWeight: 500, color: "var(--gc-text-primary)" }}>{v}</span>}
        </div>
      );
    }},
    { key: "level", label: "Level", sortable: true, width: "8%", render: (v: number) => {
      const color = levelColor(v);
      return <span style={{ padding: "2px 8px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-sm)", color, backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}>L{v}</span>;
    } },
    { key: "title", label: "Title", width: "16%" },
    { key: "contractLevel", label: "Contract", sortable: true, width: "10%", render: (v: number) => v > 0 ? <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: "var(--gc-gold)" }}>{v}%</span> : <span style={{ color: "var(--gc-text-muted)" }}>{"—"}</span> },
    { key: "overridePercentage", label: "Override", sortable: true, width: "10%", render: (v: number) => v > 0 ? <span style={{ color: "var(--gc-text-primary)" }}>{v}%</span> : <span style={{ color: "var(--gc-text-muted)" }}>{"—"}</span> },
    { key: "upline", label: "Upline", width: "16%" },
    { key: "downlines", label: "Downlines", sortable: true, width: "10%", align: "center", render: (v: number) => <span style={{ color: v > 0 ? "var(--gc-text-primary)" : "var(--gc-text-muted)" }}>{v}</span> },
    { key: "actions" as any, label: "", width: "8%", align: "center", render: (_v: any, row: any) => {
      const isRealAgent = row.id && row.id.includes("-");
      if (!isRealAgent) return null;
      return (
        <span className="flex items-center justify-center gap-2">
          {isAdmin && (
            <button
              type="button"
              aria-label="Edit contract level"
              title="Edit contract level"
              onClick={() => openEditModal("contract", row.id)}
              style={{
                background: "transparent",
                border: "none",
                padding: 2,
                cursor: "pointer",
                color: "var(--gc-text-muted)",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
          <Link href={`/hcms/agents/${row.id}`}><span className="flex items-center gap-1" style={{ color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}><Eye className="w-3 h-3" /> View</span></Link>
        </span>
      );
    }},
  ];

  // Header actions are now two rows to keep visual rhythm: top row holds the
  // primary controls (period + view toggle), and a search/export bar lives
  // above the tree itself so it sits closer to what it acts on.
  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <GCPeriodSelector value={cohortPeriod} onChange={setCohortPeriod} options={COHORT_PERIODS} />
      <div data-tour-id={TOUR.ADMIN.HIERARCHY.VIEW_TOGGLE} className="flex gap-2">
        {(["tree", "table"] as const).map(v => {
          const active = view === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className="px-3 py-2 capitalize"
              style={active
                ? { ...OUTLINED_BUTTON_STYLE, backgroundColor: "var(--gc-gold)", color: "var(--gc-btn-primary-text)", cursor: "pointer" }
                : { ...OUTLINED_BUTTON_STYLE, cursor: "pointer" }}
            >
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div>
      <div data-tour-id={TOUR.ADMIN.HIERARCHY.HEADER}>
        <GCPageHeader title="Hierarchy" subtitle="Team structure, contract levels & organization overview" accentUnderline actions={headerActions} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Total in Hierarchy" value={totalAgents} accentTop />
        <GCKPICard label="Avg Contract Level" value={avgContract > 0 ? `${avgContract}%` : "—"} accentTop />
        <GCKPICard label="Hierarchy Depth" value={maxLevel > 0 ? `${maxLevel} levels` : "—"} accentTop />
        <GCKPICard label="Direct Downlines" value={fullTree.children.length} accentTop delta={fullTree.children.length > 0 ? { value: "Under root", positive: true } : { value: "No downlines", positive: false }} />
      </div>

      {totalAgents === 0 ? (
        <div
          className="flex flex-col items-center gap-3"
          style={{
            ...CARD_STYLE,
            padding: "var(--gc-space-8)",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Users className="w-11 h-11" style={{ color: "var(--gc-text-muted)" }} />
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
            No hierarchy yet
          </div>
          <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", maxWidth: 420 }}>
            As agents are added under contracts, the org tree will appear here.
          </div>
        </div>
      ) : view === "tree" ? (
        <div data-tour-id={TOUR.ADMIN.HIERARCHY.TREE}>
          {/* Search + export row — sits above tree to read as tree controls. */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div style={{ position: "relative", flex: "1 1 280px", minWidth: 240, maxWidth: 420 }}>
              <Search className="w-4 h-4" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--gc-text-muted)", pointerEvents: "none" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search agents…"
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 32px",
                  backgroundColor: "var(--gc-surface-2)",
                  border: "1px solid var(--gc-border)",
                  borderRadius: "var(--gc-radius-sm)",
                  color: "var(--gc-text-primary)",
                  fontFamily: "var(--gc-font-body)",
                  fontSize: "var(--gc-text-sm)",
                  outline: "none",
                }}
              />
              {searchMatches.length > 0 && (
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
                  backgroundColor: "var(--gc-surface)",
                  border: "1px solid var(--gc-border)",
                  borderRadius: "var(--gc-radius-md)",
                  boxShadow: "var(--gc-shadow-lg)",
                  overflow: "hidden",
                }}>
                  {searchMatches.map((m: any) => {
                    const initials = (m.name || "?").split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => jumpToAgent(m.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          width: "100%", padding: "8px 12px",
                          background: "transparent", border: "none",
                          cursor: "pointer", textAlign: "left",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--gc-hover-overlay)"; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
                      >
                        <span style={{
                          width: 28, height: 28, borderRadius: "50%",
                          backgroundColor: "color-mix(in srgb, var(--gc-gold) 18%, transparent)",
                          color: "var(--gc-gold)", fontWeight: 600, fontSize: 11,
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                        }}>{initials}</span>
                        <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)", fontWeight: 500 }}>{m.name}</span>
                        <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>— {m.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={exportPng}
              className="inline-flex items-center gap-1.5 px-3 py-2"
              style={{ ...OUTLINED_BUTTON_STYLE, cursor: "pointer" }}
            >
              <ImageIcon className="w-4 h-4" /> Export PNG
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2"
              style={{ ...OUTLINED_BUTTON_STYLE, cursor: "pointer" }}
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          {/* Cohort filter active badge */}
          {cohortActive && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 10px", marginBottom: 8,
              backgroundColor: "color-mix(in srgb, var(--gc-gold) 12%, transparent)",
              color: "var(--gc-gold)",
              border: "1px solid color-mix(in srgb, var(--gc-gold) 30%, transparent)",
              borderRadius: "var(--gc-radius-sm)",
              fontSize: "var(--gc-text-xs)", fontWeight: 500,
            }}>
              Cohort filter active — {cohortInCount} of {cohortTotal} agents
            </div>
          )}

          {/* B.2 breadcrumb — only when focused */}
          {focusedRootId && breadcrumb.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mb-3" style={{ fontSize: "var(--gc-text-sm)" }}>
              <button
                type="button"
                onClick={() => setFocusedRootId(null)}
                style={{
                  background: "transparent", border: "none", padding: "2px 4px",
                  color: "var(--gc-text-muted)", cursor: "pointer", fontWeight: 500,
                }}
              >Agency</button>
              {breadcrumb.map((crumb, idx) => {
                const isLast = idx === breadcrumb.length - 1;
                return (
                  <span key={crumb.id} className="inline-flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" style={{ color: "var(--gc-text-muted)" }} />
                    <button
                      type="button"
                      onClick={() => setFocusedRootId(isLast ? null : crumb.id)}
                      style={{
                        background: "transparent", border: "none", padding: "2px 4px",
                        color: isLast ? "var(--gc-text-primary)" : "var(--gc-text-muted)",
                        cursor: "pointer", fontWeight: isLast ? 600 : 500,
                      }}
                    >{crumb.name}</button>
                  </span>
                );
              })}
              <button
                type="button"
                onClick={() => setFocusedRootId(null)}
                className="ml-2"
                style={{
                  ...OUTLINED_BUTTON_STYLE,
                  padding: "2px 8px",
                  cursor: "pointer",
                  fontSize: "var(--gc-text-xs)",
                }}
              >Reset</button>
            </div>
          )}

          <div style={{ minHeight: 550, maxHeight: "70vh", overflow: "auto" }}>
            {(() => {
              if (!displayTree) return null;
              const { nodes: fn, edges: fe } = buildNodesEdges(displayTree as any);
              return (
                <GCHierarchyFlow
                  nodes={fn}
                  edges={fe}
                  height={550}
                  highlightedNodeId={highlightedNodeId}
                  mutedNodeIds={mutedIds}
                  onNodeClick={(id) => { if (id !== "agency") setFocusedRootId(id); }}
                  onNodeOpenDrawer={(id) => { if (id !== "agency") setDrawerAgentId(id); }}
                  editable={isAdmin}
                  onMoveAgent={isAdmin ? handleMoveAgent : undefined}
                  onNodeRightClick={isAdmin ? handleNodeRightClick : undefined}
                />
              );
            })()}
          </div>
        </div>
      ) : (
        <div data-tour-id={TOUR.ADMIN.HIERARCHY.TABLE}>
          <GCDataTable columns={tableCols} data={allRows} searchable searchPlaceholder="Search by name or title..." />
        </div>
      )}

      {/* C.5 — Right-click context menu (admin only). Floating fixed-position
          panel with two actions; closes on outside click. */}
      {isAdmin && contextMenu && (() => {
        // Look up the right-clicked agent so we can both gate menu items by
        // role/title AND seed the team-naming modals with the right context.
        const rec = records.find(r => r.agent_user_id === contextMenu.agentId);
        const agentName = rec
          ? ((rec.display_name && rec.display_name.trim()) ||
             (rec.dba_type === "business_entity" && (rec.company_name || rec.dba_name)) ||
             `${rec.first_name} ${rec.last_name}`.trim())
          : "";
        const currentTitle = rec?.hierarchy_title || "";
        // Founder/Owner agents are top of org — converting them to a sub-agency
        // makes no sense, and we shouldn't auto-promote them either. Hide both
        // new actions for those titles. (Role isn't available on the hierarchy
        // record; the title check is the canonical gate per the page contract.)
        const isTopOfOrg = currentTitle === "Founder" || currentTitle === "Owner";
        // The right-click menu is partitioned into two visual groups: role
        // editing (top) and team creation (bottom). A separator between them
        // groups related actions visually without adding text labels.
        // `isSeparator` items render as a 1px divider instead of a button.
        type MenuItem =
          | { kind: "item"; label: string; onClick: () => void; tourId?: string }
          | { kind: "separator" };
        const baseItems: MenuItem[] = [
          { kind: "item", label: "Promote / Demote", onClick: () => openEditModal("title", contextMenu.agentId) },
          { kind: "item", label: "Edit Contract Level", onClick: () => openEditModal("contract", contextMenu.agentId) },
        ];
        if (rec && !isTopOfOrg) {
          // Both bottom-group items now route through QuickNameTeamModal +
          // POST /api/founders/agencies/promote-and-assign — Axiom HIGH
          // unified the duplicate Convert path into the same backend flow.
          // Distinct labels remain because founders mentally split "name
          // an existing team" from "convert this agent into an agency".
          const openQuickName = () => {
            setQuickNameModal({
              agent: {
                id: rec.agent_user_id,
                firstName: rec.first_name,
                lastName: rec.last_name,
                currentTitle: currentTitle || undefined,
              },
            });
            setContextMenu(null);
          };
          baseItems.push({ kind: "separator" });
          baseItems.push({
            kind: "item",
            label: "Set Team Name",
            tourId: TOUR.ADMIN.HCMS_HIERARCHY.CONTEXT_SET_TEAM,
            onClick: openQuickName,
          });
          baseItems.push({
            kind: "item",
            label: "Convert to Agency",
            tourId: TOUR.ADMIN.HCMS_HIERARCHY.CONTEXT_CONVERT_AGENCY,
            onClick: openQuickName,
          });
        }
        // Touch agentName so unused-var lint doesn't trip. The per-item
        // closures above already inline the data they need.
        void agentName;
        return (
          <div
            role="menu"
            ref={contextMenuRef}
            style={{
              position: "fixed",
              top: contextMenu.y,
              left: contextMenu.x,
              zIndex: 60,
              backgroundColor: "var(--gc-surface)",
              border: "1px solid var(--gc-border)",
              borderRadius: "var(--gc-radius-md)",
              boxShadow: "var(--gc-shadow-lg)",
              padding: 4,
              minWidth: 180,
            }}
          >
            {baseItems.map((opt, idx) => {
              if (opt.kind === "separator") {
                return (
                  <div
                    key={`sep-${idx}`}
                    role="separator"
                    style={{
                      height: 1,
                      backgroundColor: "var(--gc-border)",
                      margin: "4px 0",
                    }}
                  />
                );
              }
              return (
                <button
                  key={opt.label}
                  type="button"
                  data-tour-id={opt.tourId}
                  onClick={opt.onClick}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 12px",
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "var(--gc-text-sm)",
                    color: "var(--gc-text-primary)",
                    borderRadius: "var(--gc-radius-sm)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--gc-hover-overlay)"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        );
      })()}

      {/* C.2 — Edit modal (admin only). Same component handles both modes. */}
      {isAdmin && editModal && (
        <HierarchyEditModal
          open={true}
          mode={editModal.mode}
          agentId={editModal.agentId}
          agentName={editModal.agentName}
          currentValue={editModal.currentValue}
          onClose={() => setEditModal(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* C.6 — Quick Name modal. Pre-seeded with the right-clicked agent so
          the founder skips straight to entering the team name. */}
      {isAdmin && quickNameModal && (
        <QuickNameTeamModal
          open={true}
          agent={quickNameModal.agent}
          onOpenChange={(o) => { if (!o) setQuickNameModal(null); }}
        />
      )}

      {/* Convert-to-Agency now reuses the QuickNameTeamModal above; the
          dedicated AgencyEditModal slim-mode branch was removed (Axiom HIGH —
          unify duplicate Convert path). */}

      {/* Wave 1B — single-click drawer. Variant maps the page variant to the
          drawer variant; both currently render the same content but the prop
          exists so the founder side can later strip inline edits without a
          refactor. */}
      <AgentDetailDrawer
        agentUserId={drawerAgentId}
        open={!!drawerAgentId}
        onOpenChange={(o) => { if (!o) setDrawerAgentId(null); }}
        variant={variant === "founder" ? "founder" : "admin"}
      />
    </div>
  );
}
