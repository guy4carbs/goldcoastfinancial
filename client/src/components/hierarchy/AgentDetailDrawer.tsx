/**
 * AgentDetailDrawer — Wave 1B
 *
 * Right-anchored Sheet drawer that opens on single-click of a hierarchy node
 * (see `GCHierarchyFlow` click discrimination, click=drawer / dblclick=drill).
 *
 * Sections (single-scroll, no tabs):
 *   1. Hierarchy   — title, contract %, override %, upline, downline count
 *   2. Carriers    — group by carrier with inline writing # bulk-edit + per-row
 *                    status / commission / notes editor
 *   3. Compliance  — read-only chips (NPN, License, E&O, AML, CE)
 *
 * Mutations hit:
 *   PATCH /api/hcms/carriers/appointments/:appointmentId
 *   PATCH /api/hcms/carriers/appointments/by-carrier/:agentUserId/:carrierId
 *
 * Both routes are ADMIN_PLUS gated server-side; the drawer renders the edit
 * affordances regardless of `variant` because the server is the source of
 * truth for permission. (`variant` is currently advisory — admin/founder both
 * see the same content; the prop exists so the founder variant can later
 * suppress the inline edits without a refactor.)
 *
 * Visual contract — every surface, accent, and CTA goes through GC tokens
 * (mirrors LeadDetailDrawer + FoundersBookOfBusiness DrawerHeader patterns).
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  User,
  X,
  Pencil,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react";
import { GCStatusBadge, GCPrimaryButton, GCSecondaryButton } from "@/components/gc";
import { GC_FORM_LABEL, GC_FORM_INPUT } from "@/components/gc/GCModal";
import { HierarchyEditModal } from "@/components/hierarchy/HierarchyEditModal";
import { useGCTheme } from "@/components/gc/GCThemeProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { csrfHeaders, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

/* ──────────────────────────────────────────────────────────────────────── */
/* Style tokens — mirrors FoundersTeamPerformance.tsx:18-47                  */
/* ──────────────────────────────────────────────────────────────────────── */

const CARD_STYLE: React.CSSProperties = {
  backgroundColor: "var(--gc-surface)",
  border: "1px solid var(--gc-border)",
  borderRadius: "var(--gc-radius-md)",
  padding: "var(--gc-space-4)",
};

const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--gc-font-body)",
  fontSize: "var(--gc-text-xs)",
  fontWeight: 500,
  letterSpacing: "var(--gc-tracking-wider)",
  textTransform: "uppercase",
  color: "var(--gc-text-muted)",
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

const FIELD_LABEL_STYLE: React.CSSProperties = {
  ...SECTION_LABEL_STYLE,
  marginBottom: "var(--gc-space-1)",
};

const FIELD_VALUE_STYLE: React.CSSProperties = {
  fontFamily: "var(--gc-font-body)",
  fontSize: "var(--gc-text-base)",
  color: "var(--gc-text-primary)",
};

const ICON_BUTTON_STYLE: React.CSSProperties = {
  backgroundColor: "var(--gc-surface-2)",
  border: "1px solid var(--gc-border)",
  borderRadius: "var(--gc-radius-sm)",
  color: "var(--gc-text-muted)",
  width: 24,
  height: 24,
  padding: 0,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const PILL_STYLE_BASE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--gc-space-1)",
  padding: "2px var(--gc-space-2)",
  borderRadius: "var(--gc-radius-sm)",
  fontSize: "var(--gc-text-xs)",
  fontFamily: "var(--gc-font-body)",
  fontWeight: 500,
};

const SELECT_TRIGGER_CLASSES =
  "h-9 w-full bg-[var(--gc-surface-2)] border border-[var(--gc-border)] rounded-[var(--gc-radius-sm)] " +
  "text-[var(--gc-text-primary)] font-body text-sm focus:ring-[var(--gc-gold)] focus:ring-1 focus:outline-none";
const SELECT_CONTENT_CLASSES =
  "bg-[var(--gc-surface)] border border-[var(--gc-border)] rounded-[var(--gc-radius-md)] " +
  "text-[var(--gc-text-primary)] font-body shadow-[var(--gc-shadow-lg)]";
const SELECT_ITEM_CLASSES =
  "py-2 cursor-pointer focus:bg-[var(--gc-surface-2)] focus:text-[var(--gc-gold)] " +
  "data-[state=checked]:text-[var(--gc-gold)] data-[state=checked]:font-medium";

/* ──────────────────────────────────────────────────────────────────────── */
/* Types                                                                     */
/* ──────────────────────────────────────────────────────────────────────── */

export interface AgentDetailDrawerProps {
  agentUserId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: "admin" | "founder";
}

interface AppointmentRow {
  id: string;
  agent_user_id: string;
  carrier_id: string;
  carrier_name: string | null;
  state_code: string | null;
  status: string;
  writing_number: string | null;
  commission_level: number | string | null;
  notes: string | null;
}

interface CarrierGroup {
  carrierId: string;
  carrierName: string;
  writingNumber: string | null;
  states: AppointmentRow[];
  agencyContractStatus: string | null;
  agencyWritingNumber: string | null;
  agencyStatesAuthorized: string[] | null;
  source: "agency_contract" | "demo" | "request";
  requestStatus?: string;
}

interface AgencyRosterCarrier {
  carrier_id: string;
  carrier_name: string;
  carrier_short_name: string | null;
  carrier_code: string | null;
  agency_contract_id: string | null;
  agency_contract_status: string;
  agency_writing_number: string | null;
  agency_states_authorized: string[] | null;
  mpa_effective_date: string | null;
  mpa_expiration_date: string | null;
  appointments: AppointmentRow[];
  source?: "agency_contract" | "demo" | "request";
  request_status?: string;
}

interface AgencyRosterPayload {
  agency: { id: string; name: string; demo?: boolean } | null;
  carriers: AgencyRosterCarrier[];
}

interface HierarchyFlatRow {
  agent_user_id: string;
  direct_upline_id: string | null;
  hierarchy_level: number;
  hierarchy_title: string | null;
  contract_level: string | null;
  override_percentage: string | null;
  first_name: string;
  last_name: string;
  email?: string;
}

interface AgentDetailPayload {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    onboardingStatus: string;
  };
  profile: {
    title: string;
    npn: string;
    licensedStates: string;
    eoExpirationDate: string;
    amlCertificateKey: string | null;
    ceExpirationDate: string | null;
    approvalStatus: string;
  };
  licenses?: Array<{
    stateCode: string;
    expirationDate: string;
    status: string;
  }>;
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Helpers                                                                   */
/* ──────────────────────────────────────────────────────────────────────── */

function daysFromToday(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  const ms = d.getTime() - now.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return `${String(d.getUTCMonth() + 1).padStart(2, "0")}/${String(d.getUTCDate()).padStart(2, "0")}/${d.getUTCFullYear()}`;
}

/**
 * Append "(Expired)" to a formatted date string when the date is in the past.
 * Returns the value unchanged if days is null or non-negative, or if value is "—".
 */
function withExpiredSuffix(value: string, days: number | null): string {
  if (value === "—") return value;
  if (days === null) return value;
  if (days < 0) return `${value} (Expired)`;
  return value;
}

function groupFromAgencyRoster(
  carriers: AgencyRosterCarrier[],
): CarrierGroup[] {
  return carriers
    .map((c) => {
      const states = c.appointments || [];
      const firstWriting = states.find((s) => !!s.writing_number)?.writing_number || null;
      return {
        carrierId: c.carrier_id,
        carrierName: c.carrier_name || "Unknown carrier",
        writingNumber: firstWriting,
        states,
        agencyContractStatus: c.agency_contract_status,
        agencyWritingNumber: c.agency_writing_number,
        agencyStatesAuthorized: Array.isArray(c.agency_states_authorized)
          ? c.agency_states_authorized
          : null,
        source: c.source || "agency_contract",
        requestStatus: c.request_status,
      } as CarrierGroup;
    })
    .sort((a, b) => a.carrierName.localeCompare(b.carrierName));
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Empty state block                                                         */
/* ──────────────────────────────────────────────────────────────────────── */

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

/* ──────────────────────────────────────────────────────────────────────── */
/* Main component                                                            */
/* ──────────────────────────────────────────────────────────────────────── */

export function AgentDetailDrawer(props: AgentDetailDrawerProps) {
  const { agentUserId, open, onOpenChange, variant = "admin" } = props;
  const isReadOnly = variant === "founder";
  const enabled = !!agentUserId && open;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { theme } = useGCTheme();

  /* ── Fetch hierarchy flat (covers title / contract / override / upline) */
  const hierarchyQ = useQuery<HierarchyFlatRow[]>({
    queryKey: ["/api/hcms/hierarchy/flat", agentUserId],
    queryFn: async () => {
      const r = await fetch(`/api/hcms/hierarchy/flat`, {
        credentials: "include",
      });
      if (!r.ok) throw new Error("Failed to load hierarchy");
      return r.json();
    },
    enabled,
  });

  /* ── Fetch agent detail (covers profile + compliance fields) */
  const agentQ = useQuery<AgentDetailPayload>({
    queryKey: ["/api/hcms/agents", agentUserId],
    queryFn: async () => {
      const r = await fetch(`/api/hcms/agents/${agentUserId}`, {
        credentials: "include",
      });
      if (!r.ok) throw new Error("Failed to load agent");
      return r.json();
    },
    enabled,
  });

  /* ── Fetch the agency carrier roster + this agent's appointments overlay.
   *    Source of truth: agency_carrier_contracts (active) JOIN carrier_directory,
   *    plus the agent's carrier_appointments rows attached per carrier. Mirrors
   *    /api/agent-portal/carriers/available used by the HCMS requests page so
   *    the drawer and the agent's request flow share one universe. */
  const carriersQ = useQuery<AgencyRosterPayload>({
    queryKey: ["/api/hcms/carriers/agency-roster", agentUserId],
    queryFn: async () => {
      const r = await fetch(
        `/api/hcms/carriers/agency-roster?agentId=${agentUserId}`,
        { credentials: "include" },
      );
      if (!r.ok) throw new Error("Failed to load agency carriers");
      return r.json();
    },
    enabled,
  });

  /* ── Hierarchy edit modal state (title + contract pencils) */
  const [editModal, setEditModal] = useState<{
    mode: "title" | "contract";
    agentId: string;
    agentName: string;
    currentValue: string | number;
  } | null>(null);

  const titleMutation = useMutation({
    mutationFn: ({ agentId, hierarchyTitle }: { agentId: string; hierarchyTitle: string }) =>
      apiRequest("PATCH", `/api/hcms/hierarchy/agents/${agentId}`, { hierarchyTitle }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hcms/hierarchy/flat"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hcms/hierarchy/tree"] });
      toast({ title: "Title updated" });
    },
    onError: (err: any) => {
      toast({ title: "Update failed", description: err?.message || "Unable to update title.", variant: "destructive" as any });
      throw err;
    },
  });

  const contractMutation = useMutation({
    mutationFn: ({ agentId, contractLevel }: { agentId: string; contractLevel: number }) =>
      apiRequest("PATCH", `/api/hcms/hierarchy/agents/${agentId}`, { contractLevel }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hcms/hierarchy/flat"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hcms/hierarchy/tree"] });
      toast({ title: "Contract updated" });
    },
    onError: (err: any) => {
      toast({ title: "Update failed", description: err?.message || "Unable to update contract.", variant: "destructive" as any });
      throw err;
    },
  });

  const handleEditSubmit = async (value: string | number) => {
    if (!editModal) return;
    if (editModal.mode === "title") {
      await titleMutation.mutateAsync({ agentId: editModal.agentId, hierarchyTitle: String(value) });
    } else {
      await contractMutation.mutateAsync({ agentId: editModal.agentId, contractLevel: Number(value) });
    }
  };

  /* ── Derive hierarchy info for this agent */
  const flat = hierarchyQ.data || [];
  const myRow = useMemo(
    () => flat.find((r) => r.agent_user_id === agentUserId) || null,
    [flat, agentUserId],
  );
  const upline = useMemo(
    () => (myRow?.direct_upline_id ? flat.find((r) => r.agent_user_id === myRow.direct_upline_id) || null : null),
    [flat, myRow],
  );
  const downlineCount = useMemo(
    () => flat.filter((r) => r.direct_upline_id === agentUserId).length,
    [flat, agentUserId],
  );

  /* ── Carrier group derivation (every active agency carrier shows; agent
   *    appointment rows attached as states[]). */
  const groups = useMemo(
    () => groupFromAgencyRoster(carriersQ.data?.carriers || []),
    [carriersQ.data],
  );
  const agencyName = carriersQ.data?.agency?.name || null;

  // Reset row-level edit / expand state when the drawer target changes.
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  useEffect(() => {
    setExpanded(new Set());
  }, [agentUserId]);

  const toggleExpand = (carrierId: string) => {
    setExpanded((curr) => {
      const next = new Set(curr);
      if (next.has(carrierId)) next.delete(carrierId);
      else next.add(carrierId);
      return next;
    });
  };

  /* ── Header stat values */
  const profile = agentQ.data?.profile;
  const user = agentQ.data?.user;
  const fullName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : myRow
      ? `${myRow.first_name} ${myRow.last_name}`.trim()
      : "Agent";
  const status = profile?.approvalStatus || user?.onboardingStatus || "pending";
  const subtitle = myRow?.hierarchy_title || profile?.title || "Agent";

  const activeCarrierCount = groups.filter((g) =>
    g.states.some((s) => s.status === "appointed" || s.status === "approved"),
  ).length;
  const licensedStateCount = (() => {
    // licensed_states comes back as a Postgres text[] (already an array) for
    // newer profiles, but legacy rows stored it as a CSV string. Coerce both.
    const raw = profile?.licensedStates;
    let arr: string[] = [];
    if (Array.isArray(raw)) arr = raw.map((s: any) => String(s).trim()).filter(Boolean);
    else if (typeof raw === "string") arr = raw.split(",").map((s) => s.trim()).filter(Boolean);
    return arr.length || (agentQ.data?.licenses?.length ?? 0);
  })();
  const docsComplete = !!(profile?.amlCertificateKey && profile?.npn);

  const stats: Array<{ label: string; value: string }> = [
    { label: "Contract", value: myRow?.contract_level ? `${parseFloat(myRow.contract_level)}%` : "—" },
    { label: "Active Carriers", value: String(activeCarrierCount) },
    { label: "Licensed States", value: String(licensedStateCount) },
    { label: "Docs", value: docsComplete ? "Complete" : "Pending" },
  ];

  const isLoading = enabled && (hierarchyQ.isLoading || agentQ.isLoading);
  // allErrored guard mirrors the Dashboard / Revenue pattern. Each section
  // already handles its own loading + empty state; this hard-fail only fires
  // when EVERY query errors, so the user sees a single coherent message
  // instead of three empty cards.
  const allErrored = enabled && !!(
    hierarchyQ.error && agentQ.error && carriersQ.error
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[640px] sm:max-w-[640px] p-0 overflow-hidden flex flex-col [&>button]:hidden border-l"
        style={{
          backgroundColor: "var(--gc-bg)",
          borderColor: "var(--gc-border)",
          color: "var(--gc-text-primary)",
        }}
        data-theme={theme}
        data-tour-id="admin-hierarchy-node-drawer"
      >
        {/* Required by Radix Dialog primitive for screen readers — visually hidden */}
        <VisuallyHidden>
          <SheetTitle>{fullName || "Agent details"}</SheetTitle>
          <SheetDescription>{subtitle || "Agent profile, hierarchy, carriers and compliance"}</SheetDescription>
        </VisuallyHidden>

        <div
          className="flex-1 overflow-y-auto"
          data-theme={theme}
          style={{ backgroundColor: "var(--gc-bg)" }}
        >
        {/* Header */}
        <DrawerHeader
          name={fullName}
          subtitle={subtitle}
          status={status}
          stats={stats}
          onClose={() => onOpenChange(false)}
        />

        {/* Body */}
        <div
          style={{
            padding: "var(--gc-space-6)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--gc-space-6)",
          }}
        >
          {isLoading ? (
            <>
              <Skeleton className="w-full" style={{ height: 160 }} />
              <Skeleton className="w-full" style={{ height: 240 }} />
              <Skeleton className="w-full" style={{ height: 160 }} />
            </>
          ) : allErrored ? (
            <div
              style={{
                ...CARD_STYLE,
                textAlign: "center",
                padding: "var(--gc-space-6)",
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
                Unable to load agent details
              </div>
              <div
                style={{
                  fontFamily: "var(--gc-font-body)",
                  fontSize: "var(--gc-text-sm)",
                  color: "var(--gc-text-muted)",
                }}
              >
                One or more endpoints failed. Try closing the drawer and reopening, or refresh the page.
              </div>
            </div>
          ) : (
            <>
              {/* ─── Section 1 — Hierarchy ─────────────────────────── */}
              <section data-tour-id="admin-hierarchy-node-drawer-hierarchy" aria-label="Hierarchy">
                <SectionLabel left="Hierarchy" />
                <div style={CARD_STYLE}>
                  <div
                    className="grid grid-cols-2"
                    style={{ gap: "var(--gc-space-4)" }}
                  >
                    <FieldRow
                      label="Title"
                      value={myRow?.hierarchy_title || "—"}
                      onEdit={
                        !isReadOnly && myRow
                          ? () =>
                              setEditModal({
                                mode: "title",
                                agentId: myRow.agent_user_id,
                                agentName: fullName,
                                currentValue: myRow.hierarchy_title || "Agent",
                              })
                          : undefined
                      }
                    />
                    <FieldRow
                      label="Contract Level"
                      value={myRow?.contract_level ? `${parseFloat(myRow.contract_level)}%` : "—"}
                      onEdit={
                        !isReadOnly && myRow
                          ? () =>
                              setEditModal({
                                mode: "contract",
                                agentId: myRow.agent_user_id,
                                agentName: fullName,
                                currentValue:
                                  Number(myRow.contract_level || 0) || 100,
                              })
                          : undefined
                      }
                    />
                    <FieldRow
                      label="Override %"
                      value={
                        myRow?.override_percentage
                          ? `${parseFloat(myRow.override_percentage)}%`
                          : "—"
                      }
                    />
                    <FieldRow
                      label="Direct Upline"
                      value={
                        upline ? `${upline.first_name} ${upline.last_name}` : "—"
                      }
                    />
                    <FieldRow
                      label="Downlines"
                      value={String(downlineCount)}
                    />
                    <FieldRow
                      label="Level"
                      value={myRow ? `L${myRow.hierarchy_level}` : "—"}
                    />
                  </div>
                </div>
              </section>

              {/* ─── Section 2 — Carrier Appointments ──────────────── */}
              <section data-tour-id="admin-hierarchy-node-drawer-carriers" aria-label="Carrier Appointments">
                <SectionLabel
                  left="Carrier Appointments"
                  right={
                    groups.length > 0
                      ? `${activeCarrierCount} appointed / ${groups.length} contracted${
                          agencyName ? ` · ${agencyName}` : ""
                        }`
                      : agencyName
                        ? `${agencyName} has no active contracts`
                        : undefined
                  }
                />
                {carriersQ.isLoading ? (
                  <Skeleton className="w-full" style={{ height: 220 }} />
                ) : groups.length === 0 ? (
                  <EmptyTableBlock
                    title="Agency has no active carrier contracts."
                    subtext="Add carriers under Founders → Agency Management → Carriers. Once a carrier shows status “active” there, it becomes available for this agent."
                  />
                ) : (
                  <div
                    style={{
                      ...CARD_STYLE,
                      padding: 0,
                      overflow: "hidden",
                    }}
                  >
                    {groups.map((g, idx) => (
                      <CarrierGroupRow
                        key={g.carrierId}
                        group={g}
                        agentUserId={agentUserId!}
                        expanded={expanded.has(g.carrierId)}
                        onToggle={() => toggleExpand(g.carrierId)}
                        isLast={idx === groups.length - 1}
                        isReadOnly={isReadOnly}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* ─── Section 3 — Compliance ─────────────────────────── */}
              <section>
                <SectionLabel left="Compliance" />
                <div
                  className="grid grid-cols-2 sm:grid-cols-3"
                  style={{ gap: "var(--gc-space-3)" }}
                >
                  <ComplianceChip label="NPN" value={profile?.npn || "—"} tone="neutral" />
                  <ComplianceChip
                    label="License Exp."
                    value={
                      agentQ.data?.licenses && agentQ.data.licenses.length > 0
                        ? withExpiredSuffix(
                            fmtDate(agentQ.data.licenses[0].expirationDate),
                            daysFromToday(agentQ.data.licenses[0].expirationDate),
                          )
                        : "—"
                    }
                    tone={
                      agentQ.data?.licenses && agentQ.data.licenses[0]
                        ? toneForDays(daysFromToday(agentQ.data.licenses[0].expirationDate), 60)
                        : "neutral"
                    }
                  />
                  <ComplianceChip
                    label="E&O Exp."
                    value={withExpiredSuffix(
                      fmtDate(profile?.eoExpirationDate),
                      daysFromToday(profile?.eoExpirationDate),
                    )}
                    tone={toneForDays(daysFromToday(profile?.eoExpirationDate), 30)}
                  />
                  <ComplianceChip
                    label="AML Cert"
                    value={profile?.amlCertificateKey ? "On file" : "Missing"}
                    tone={profile?.amlCertificateKey ? "good" : "neutral"}
                    icon={
                      profile?.amlCertificateKey ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )
                    }
                  />
                  <ComplianceChip
                    label="CE Exp."
                    value={withExpiredSuffix(
                      fmtDate(profile?.ceExpirationDate),
                      daysFromToday(profile?.ceExpirationDate),
                    )}
                    tone={toneForDays(daysFromToday(profile?.ceExpirationDate), 60)}
                  />
                </div>
              </section>

              {/* ─── Footer link ────────────────────────────────────── */}
              {agentUserId && !isReadOnly && (
                <div
                  className="flex justify-end"
                  style={{
                    paddingTop: "var(--gc-space-4)",
                    borderTop: "1px solid var(--gc-border)",
                  }}
                >
                  <Link href={`/hcms/agents/${agentUserId}`}>
                    <span
                      style={{
                        ...OUTLINED_BUTTON_STYLE,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "var(--gc-space-2)",
                        padding: "var(--gc-space-2) var(--gc-space-4)",
                        cursor: "pointer",
                      }}
                    >
                      View full page
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
        </div>

        {/* Hierarchy edit modal (title or contract) */}
        {editModal && (
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
      </SheetContent>
    </Sheet>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/* DrawerHeader — mirrors FoundersBookOfBusiness.tsx:914-1090                */
/* ──────────────────────────────────────────────────────────────────────── */

function DrawerHeader({
  name,
  subtitle,
  status,
  stats,
  onClose,
}: {
  name: string;
  subtitle: string;
  status: string;
  stats: Array<{ label: string; value: string }>;
  onClose: () => void;
}) {
  return (
    <div
      className="sticky top-0 z-20"
      style={{
        backgroundColor: "var(--gc-surface)",
        borderBottom: "1px solid var(--gc-border)",
        padding: "var(--gc-space-6)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex items-center justify-center"
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--gc-radius-md)",
            backgroundColor: "var(--gc-surface-2)",
            color: "var(--gc-gold)",
            border: "1px solid var(--gc-border)",
            flexShrink: 0,
          }}
        >
          <User className="w-6 h-6" />
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
                  letterSpacing: "var(--gc-tracking-tight)",
                  wordBreak: "break-word",
                }}
              >
                {name}
              </div>
              <div
                style={{
                  fontFamily: "var(--gc-font-body)",
                  fontSize: "var(--gc-text-sm)",
                  color: "var(--gc-text-secondary)",
                  marginTop: 2,
                }}
              >
                {subtitle}
              </div>
              <div
                style={{
                  fontFamily: "var(--gc-font-body)",
                  fontSize: "var(--gc-text-xs)",
                  color: "var(--gc-text-muted)",
                  marginTop: "var(--gc-space-1)",
                }}
              >
                Double-click the node to drill into team
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <GCStatusBadge status={status} />
              <button
                onClick={onClose}
                className="flex items-center justify-center"
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
      </div>

      {/* Gold accent line */}
      <div
        className="mt-4"
        style={{
          height: 2,
          width: 64,
          background:
            "linear-gradient(90deg, var(--gc-gold), var(--gc-gold-bright), transparent)",
        }}
      />

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mt-4">
        {stats.map((s) => (
          <div key={s.label}>
            <div style={SECTION_LABEL_STYLE}>{s.label}</div>
            <div
              style={{
                fontFamily: "var(--gc-font-display)",
                fontSize: "var(--gc-text-lg)",
                fontWeight: 600,
                color: "var(--gc-text-primary)",
                marginTop: 2,
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Hierarchy field row                                                       */
/* ──────────────────────────────────────────────────────────────────────── */

function FieldRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
}) {
  return (
    <div>
      <div style={FIELD_LABEL_STYLE}>{label}</div>
      <div className="flex items-center gap-2">
        <span style={FIELD_VALUE_STYLE}>{value}</span>
        {onEdit && (
          <button
            type="button"
            aria-label={`Edit ${label}`}
            onClick={onEdit}
            style={ICON_BUTTON_STYLE}
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Section label — mirrors FoundersBookOfBusiness.tsx:1096                   */
/* ──────────────────────────────────────────────────────────────────────── */

function SectionLabel({ left, right }: { left: string; right?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div style={SECTION_LABEL_STYLE}>{left}</div>
      {right && (
        <div
          style={{
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-xs)",
            color: "var(--gc-text-muted)",
          }}
        >
          {right}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Compliance chip                                                           */
/* ──────────────────────────────────────────────────────────────────────── */

type ComplianceTone = "neutral" | "good" | "warn";

function toneForDays(days: number | null, threshold: number): ComplianceTone {
  if (days === null) return "neutral";
  if (days <= threshold) return "warn";
  return "neutral";
}

function ComplianceChip({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: ComplianceTone;
  icon?: React.ReactNode;
}) {
  const accent =
    tone === "warn"
      ? "var(--gc-status-terminated)"
      : tone === "good"
        ? "var(--gc-status-active)"
        : "var(--gc-text-muted)";

  return (
    <div
      style={{
        backgroundColor: "var(--gc-surface)",
        border: "1px solid var(--gc-border)",
        borderLeft: `3px solid ${accent}`,
        borderRadius: "var(--gc-radius-sm)",
        padding: "var(--gc-space-3)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--gc-space-1)",
        minWidth: 0,
      }}
    >
      <div style={SECTION_LABEL_STYLE}>{label}</div>
      <div
        className="flex items-center"
        style={{
          gap: "var(--gc-space-1)",
          fontFamily: "var(--gc-font-body)",
          fontSize: "var(--gc-text-sm)",
          fontWeight: 500,
          color: tone === "neutral" ? "var(--gc-text-primary)" : accent,
          minWidth: 0,
          wordBreak: "break-word",
        }}
      >
        {icon}
        <span style={{ minWidth: 0 }}>{value}</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/* CarrierGroupRow                                                           */
/* ──────────────────────────────────────────────────────────────────────── */

function CarrierGroupRow({
  group,
  agentUserId,
  expanded,
  onToggle,
  isLast,
  isReadOnly = false,
}: {
  group: CarrierGroup;
  agentUserId: string;
  expanded: boolean;
  onToggle: () => void;
  isLast: boolean;
  isReadOnly?: boolean;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [writingNumber, setWritingNumber] = useState(group.writingNumber || "");
  const [savingWN, setSavingWN] = useState(false);

  // Re-sync local input if upstream data refreshes (e.g. another tab edited).
  useEffect(() => {
    setWritingNumber(group.writingNumber || "");
  }, [group.writingNumber]);

  const dirty = (writingNumber || "") !== (group.writingNumber || "");

  // Inline "Appoint agent" — fires when the agency holds the MPA but the agent
  // has zero carrier_appointments rows. Creates one row per state covered by
  // the agency contract (or all 50 states + DC when the contract is "all states").
  const ALL_STATES = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
  ];
  const [appointing, setAppointing] = useState(false);
  const handleAppoint = async () => {
    if (appointing) return;
    const states =
      group.agencyStatesAuthorized && group.agencyStatesAuthorized.length > 0
        ? group.agencyStatesAuthorized.map((s) => s.toUpperCase())
        : ALL_STATES;
    setAppointing(true);
    try {
      const res = await fetch(`/api/hcms/carriers/appointments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        body: JSON.stringify({
          agentUserId,
          carrierId: group.carrierId,
          stateCodes: states,
          status: "appointed",
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `${res.status}`);
      }
      const json = await res.json();
      queryClient.invalidateQueries({
        queryKey: ["/api/hcms/carriers/agency-roster", agentUserId],
      });
      toast({
        title: "Agent appointed",
        description: `${group.carrierName} · ${json.created || 0} state${json.created === 1 ? "" : "s"}`,
      });
    } catch (e: any) {
      toast({
        title: "Failed to appoint",
        description: e?.message || "Unable to create appointments.",
        variant: "destructive" as any,
      });
    } finally {
      setAppointing(false);
    }
  };

  const saveBulkWritingNumber = async () => {
    if (savingWN || !dirty || !writingNumber.trim()) return;
    setSavingWN(true);
    try {
      const res = await fetch(
        `/api/hcms/carriers/appointments/by-carrier/${agentUserId}/${group.carrierId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
          body: JSON.stringify({ writingNumber: writingNumber.trim() }),
        },
      );
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `${res.status}`);
      }
      queryClient.invalidateQueries({
        queryKey: ["/api/hcms/carriers/agency-roster", agentUserId],
      });
      toast({ title: "Writing # updated", description: `${group.carrierName} (${group.states.length} states)` });
    } catch (e: any) {
      toast({
        title: "Update failed",
        description: e?.message || "Unable to update writing number.",
        variant: "destructive" as any,
      });
    } finally {
      setSavingWN(false);
    }
  };

  return (
    <div
      style={{
        borderBottom: isLast
          ? "none"
          : "1px solid var(--gc-border-subtle, var(--gc-border))",
      }}
    >
      {/* Parent row */}
      <div style={{ padding: "var(--gc-space-4)" }}>
        <div className="flex items-center" style={{ gap: "var(--gc-space-2)" }}>
          <button
            type="button"
            onClick={onToggle}
            style={ICON_BUTTON_STYLE}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div
              style={{
                fontFamily: "var(--gc-font-display)",
                fontSize: "var(--gc-text-base)",
                fontWeight: 600,
                color: "var(--gc-text-primary)",
                letterSpacing: "var(--gc-tracking-tight)",
              }}
            >
              {group.carrierName}
            </div>
            {(group.agencyWritingNumber ||
              (group.agencyStatesAuthorized && group.agencyStatesAuthorized.length > 0)) && (
              <div
                style={{
                  marginTop: 2,
                  fontFamily: "var(--gc-font-body)",
                  fontSize: "var(--gc-text-xs)",
                  color: "var(--gc-text-muted)",
                }}
              >
                Agency MPA
                {group.agencyWritingNumber ? ` · WN ${group.agencyWritingNumber}` : ""}
                {group.agencyStatesAuthorized && group.agencyStatesAuthorized.length > 0
                  ? ` · ${group.agencyStatesAuthorized.length} state${group.agencyStatesAuthorized.length === 1 ? "" : "s"} authorized`
                  : ""}
              </div>
            )}
          </div>
          {/* When the agency has the MPA but the agent has no appointments,
              show an inline action instead of an inert pill. Demo + request
              rows stay as labels. */}
          {!isReadOnly && group.source === "agency_contract" && group.states.length === 0 ? (
            <button
              type="button"
              onClick={handleAppoint}
              disabled={appointing}
              style={{
                ...PILL_STYLE_BASE,
                color: "var(--gc-gold)",
                backgroundColor: "var(--gc-surface-2)",
                border: "1px solid var(--gc-gold)",
                cursor: appointing ? "wait" : "pointer",
                opacity: appointing ? 0.6 : 1,
                fontWeight: 600,
              }}
              title={`Create appointment rows for all ${group.agencyStatesAuthorized?.length || 51} states under this MPA.`}
            >
              {appointing ? "Appointing…" : "Appoint agent"}
            </button>
          ) : (
            <span
              style={{
                ...PILL_STYLE_BASE,
                color:
                  group.source === "request"
                    ? "var(--gc-status-pending, var(--gc-text-secondary))"
                    : group.source === "demo"
                      ? "var(--gc-text-muted)"
                      : group.states.length === 0
                        ? "var(--gc-text-muted)"
                        : "var(--gc-text-secondary)",
                backgroundColor: "var(--gc-surface-2)",
                border: "1px solid var(--gc-border)",
              }}
            >
              {group.source === "request"
                ? `Requested · ${group.requestStatus || "pending"}`
                : group.source === "demo"
                  ? "Demo MPA"
                  : group.states.length === 0
                    ? "Not yet appointed"
                    : `${group.states.length} ${group.states.length === 1 ? "state" : "states"}`}
            </span>
          )}
        </div>

        {/* Bulk writing # editor — only shows for real agency-contract carriers
            with at least one appointment row. Demo + request rows are read-only. */}
        {!isReadOnly && group.source === "agency_contract" && group.states.length > 0 && (
          <div
            style={{
              marginTop: "var(--gc-space-3)",
              marginLeft: 32,
              display: "flex",
              flexDirection: "column",
              gap: "var(--gc-space-1)",
            }}
          >
            <label style={GC_FORM_LABEL} htmlFor={`writing-${group.carrierId}`}>
              Writing # — applies to all {group.states.length}{" "}
              {group.states.length === 1 ? "state" : "states"}
            </label>
            <div className="flex items-center" style={{ gap: "var(--gc-space-2)" }}>
              <input
                id={`writing-${group.carrierId}`}
                type="text"
                value={writingNumber}
                onChange={(e) => setWritingNumber(e.target.value)}
                placeholder="Enter writing number"
                style={{ ...GC_FORM_INPUT, flex: 1 }}
                onClick={(e) => e.stopPropagation()}
              />
              <GCPrimaryButton
                size="sm"
                onClick={saveBulkWritingNumber}
                disabled={!dirty || savingWN || !writingNumber.trim()}
                icon={<Save className="w-3 h-3" />}
              >
                {savingWN ? "Saving…" : "Save"}
              </GCPrimaryButton>
            </div>
          </div>
        )}
      </div>

      {/* Children */}
      {expanded && (
        <div
          style={{
            backgroundColor: "var(--gc-surface-2)",
            padding: "var(--gc-space-3) var(--gc-space-4)",
            borderTop: "1px solid var(--gc-border-subtle, var(--gc-border))",
            display: "flex",
            flexDirection: "column",
            gap: "var(--gc-space-2)",
          }}
        >
          {group.states.length > 0 ? (
            group.states.map((s) => (
              <AppointmentStateRow
                key={s.id}
                row={s}
                agentUserId={agentUserId}
                isReadOnly={isReadOnly}
              />
            ))
          ) : (
            <div
              style={{
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-xs)",
                color: "var(--gc-text-muted)",
                lineHeight: 1.5,
              }}
            >
              <div
                style={{
                  textTransform: "uppercase",
                  letterSpacing: "var(--gc-tracking-wider)",
                  marginBottom: "var(--gc-space-1)",
                  color: "var(--gc-text-muted)",
                }}
              >
                Agency MPA covers
              </div>
              <div style={{ color: "var(--gc-text-secondary)" }}>
                {group.agencyStatesAuthorized && group.agencyStatesAuthorized.length > 0
                  ? group.agencyStatesAuthorized.join(" · ")
                  : "All 50 states + DC"}
              </div>
              <div
                style={{
                  marginTop: "var(--gc-space-2)",
                  color: "var(--gc-text-muted)",
                  fontStyle: "italic",
                }}
              >
                {isReadOnly
                  ? "This agent has not been appointed yet."
                  : "Use “Appoint agent” above to create per-state appointment rows."}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/* AppointmentStateRow — per-state inline editor                             */
/* ──────────────────────────────────────────────────────────────────────── */

const APPT_STATUSES = [
  "pending",
  "approved",
  "appointed",
  "terminated",
  "awaiting_carrier",
  "returned",
  "rejected",
  "pending_review",
  "in_review",
] as const;

function AppointmentStateRow({
  row,
  agentUserId,
  isReadOnly = false,
}: {
  row: AppointmentRow;
  agentUserId: string;
  isReadOnly?: boolean;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { theme } = useGCTheme();
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(row.status);
  const [commission, setCommission] = useState<string>(
    row.commission_level == null ? "" : String(row.commission_level),
  );
  const [notes, setNotes] = useState(row.notes || "");
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Re-sync if the row data changes underneath us (e.g. invalidate refresh).
  useEffect(() => {
    if (!editing) {
      setStatus(row.status);
      setCommission(row.commission_level == null ? "" : String(row.commission_level));
      setNotes(row.notes || "");
    }
  }, [row.status, row.commission_level, row.notes, editing]);

  // Axiom MED — when the inline editor opens, bring it into view inside the
  // drawer's scroll container so the user doesn't have to hunt for it.
  useEffect(() => {
    if (editing && editorRef.current) {
      editorRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [editing]);

  const save = async () => {
    if (saving) return;
    const body: Record<string, unknown> = {};
    if (status !== row.status) body.status = status;
    const commNum = commission === "" ? null : Number(commission);
    if (commNum !== null && !isNaN(commNum) && commNum !== Number(row.commission_level || 0)) {
      body.commissionLevel = commNum;
    }
    if (notes !== (row.notes || "")) body.notes = notes;
    if (Object.keys(body).length === 0) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/hcms/carriers/appointments/${row.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `${res.status}`);
      }
      queryClient.invalidateQueries({
        queryKey: ["/api/hcms/carriers/agency-roster", agentUserId],
      });
      toast({ title: "Appointment updated", description: row.state_code || "" });
      setEditing(false);
    } catch (e: any) {
      toast({
        title: "Update failed",
        description: e?.message || "Unable to update appointment.",
        variant: "destructive" as any,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--gc-surface)",
        border: "1px solid var(--gc-border)",
        borderRadius: "var(--gc-radius-sm)",
        padding: "var(--gc-space-2) var(--gc-space-3)",
      }}
    >
      <div className="flex items-center" style={{ gap: "var(--gc-space-2)" }}>
        <span
          style={{
            ...PILL_STYLE_BASE,
            backgroundColor: "var(--gc-surface-2)",
            color: "var(--gc-text-primary)",
            border: "1px solid var(--gc-border)",
            minWidth: 36,
            justifyContent: "center",
            fontWeight: 600,
          }}
        >
          {row.state_code || "—"}
        </span>
        <GCStatusBadge status={row.status} />
        <span
          style={{
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-xs)",
            color: "var(--gc-text-muted)",
          }}
        >
          {row.commission_level != null ? `${row.commission_level}%` : "—"}
        </span>
        <div className="ml-auto">
          {!isReadOnly && (
            <button
              type="button"
              aria-label="Edit appointment"
              onClick={() => setEditing((v) => !v)}
              style={ICON_BUTTON_STYLE}
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {!isReadOnly && editing && (
        <div
          ref={editorRef}
          className="grid grid-cols-2"
          style={{
            gap: "var(--gc-space-3)",
            marginTop: "var(--gc-space-3)",
            paddingTop: "var(--gc-space-3)",
            borderTop: "1px solid var(--gc-border-subtle, var(--gc-border))",
          }}
        >
          <div>
            <label style={GC_FORM_LABEL}>Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v)}>
              <SelectTrigger className={SELECT_TRIGGER_CLASSES}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={4}
                avoidCollisions
                data-theme={theme}
                className={SELECT_CONTENT_CLASSES}
              >
                {APPT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className={SELECT_ITEM_CLASSES}>
                    {s
                      .split("_")
                      .map((w) => w.replace(/^\w/, (c) => c.toUpperCase()))
                      .join(" ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label style={GC_FORM_LABEL}>Commission %</label>
            <input
              type="number"
              min={60}
              max={125}
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              style={GC_FORM_INPUT}
            />
          </div>
          <div className="col-span-2">
            <label style={GC_FORM_LABEL}>Notes</label>
            <textarea
              value={notes}
              maxLength={500}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              style={{ ...GC_FORM_INPUT, resize: "vertical" }}
            />
          </div>
          <div
            className="col-span-2 flex justify-end"
            style={{ gap: "var(--gc-space-2)" }}
          >
            <GCSecondaryButton
              size="sm"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Cancel
            </GCSecondaryButton>
            <GCPrimaryButton
              size="sm"
              onClick={save}
              disabled={saving}
              icon={<Save className="w-3 h-3" />}
            >
              {saving ? "Saving…" : "Save"}
            </GCPrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}
