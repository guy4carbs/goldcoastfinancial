/**
 * FoundersAgencyManagement — multi-tab page for managing the recursive agency
 * tree, carrier contracts (master directory + per-agency MPAs), agent business
 * entity aggregate, and the per-state LLC formation guide.
 *
 * Page structure (4 tabs):
 *   - Agencies        — React Flow tree (left 40%) + agency detail (right 60%)
 *   - Carriers        — Master directory table + per-agency contract table
 *   - Entities        — KPIs + bar chart of agents by entity type + roster
 *   - Formation Guide — State picker → state-specific filing card + universal checklist
 *
 * Drill-in pattern: KPI tiles set `#tab=<name>[?filter=<val>]` and a hash
 * listener flips the active tab. This keeps deep-links stable and lets us
 * route a chip filter (e.g. "pending") without coupling each tile to a setter.
 *
 * Mirrors FoundersTeamPerformance.tsx for the constants block, allErrored
 * page guard, and the EmptyTableBlock helper at the bottom — keeping the
 * visual + error-recovery contract identical across founder pages.
 */
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Plus,
  Network,
  Building2,
  ExternalLink,
  Edit,
  Trash2,
  Settings,
  ShieldCheck,
  Users,
  CheckCircle2,
  Circle,
  Send,
} from "lucide-react";
import {
  GCPageHeader,
  GCKPICard,
  GCDataTable,
  GCStatusBadge,
  GCBarChart,
  GCPeriodSelector,
  GCPrimaryButton,
  GCSecondaryButton,
  GCTabs,
  GCTabsList,
  GCTabsTrigger,
  GCTabsContent,
  GCSelect,
  type Column,
} from "@/components/gc";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { csrfHeaders, queryClient as appQueryClient } from "@/lib/queryClient";
import { formatNumber, formatDate } from "./utils/format";
import { TOUR } from "@/lib/tour/selectors";
import { AgencyTreeFlow, type AgencyTreeNode } from "@/components/founders/AgencyTreeFlow";
import {
  AgencyEditModal,
  type AgencyEditPayload,
} from "@/components/founders/AgencyEditModal";
import {
  CarrierContractModal,
  type CarrierContractPayload,
} from "@/components/founders/CarrierContractModal";
import {
  CommissionOverridesModal,
  type CommissionOverride,
  type AddOverridePayload,
} from "@/components/founders/CommissionOverridesModal";
import {
  ComplianceRequirementsModal,
  type ComplianceRequirement,
  type AddRequirementPayload,
} from "@/components/founders/ComplianceRequirementsModal";
import {
  AddCarrierModal,
  type AddCarrierPayload,
} from "@/components/founders/AddCarrierModal";
import { QuickNameTeamModal } from "@/components/hierarchy/QuickNameTeamModal";
import { SendFormationGuideModal } from "@/components/founders/SendFormationGuideModal";
import {
  STATE_LLC_GUIDE,
  STATES_LIST,
  UNIVERSAL_LLC_CHECKLIST,
} from "@/lib/data/llcStateGuide";

// Wave 4 — root agency UUID (mirrors server/services/agencyResolver.ts).
// This page IS Gold Coast's agency management — Carrier Contracts always
// pertain to the root agency, so the dropdown was removed and this constant
// is hardcoded into the contracts query.
const ROOT_AGENCY_ID = "00000000-0000-4000-8000-000000000001";

// ─── Style tokens (mirror FoundersTeamPerformance.tsx) ─────────────────────
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

// Gold focus + hover ring for KPI tiles. Mirrors Revenue / Growth / Book / Team Performance / Lead Distribution.
const KPI_LINK_CLASS =
  "block rounded-md transition-shadow hover:ring-2 hover:ring-[var(--gc-gold-bright,var(--gc-gold))] focus-visible:ring-2 focus-visible:ring-[var(--gc-gold)]";

const PILL_STYLE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "2px 8px",
  borderRadius: "var(--gc-radius-full)",
  fontSize: "11px",
  fontFamily: "var(--gc-font-body)",
  backgroundColor: "var(--gc-surface-2)",
  border: "1px solid var(--gc-border-subtle)",
  color: "var(--gc-text-secondary)",
  marginRight: 4,
  marginBottom: 4,
};

// ─── Types (server contract — stay in sync with /api/founders/agencies/*) ─
interface AgencyKPIs {
  agenciesCount: number;
  carriersContractedCount: number;
  agentsWithEntity: number;
  pendingCarrierRequests: number;
}

interface AgencyDetail {
  id: string;
  parent_agency_id: string | null;
  name: string;
  dba_name?: string | null;
  legal_entity_type?: string | null;
  ein?: string | null;
  state_of_formation?: string | null;
  formation_date?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  status: string;
  notes?: string | null;
  teams?: Array<{ manager_user_id: string; manager_name?: string }>;
  children?: Array<{ id: string; name: string }>;
}

interface CarrierDirectoryRow {
  id: string;
  name: string;
  short_name?: string | null;
  naic?: string | null;
  am_best?: string | null;
  product_types?: string[] | null;
  states_available?: string[] | null;
  active_agency_contracts?: number; // injected client-side or returned by server
}

interface AgencyCarrierContract {
  id: string;
  agency_id: string;
  carrier_id: string;
  carrier_name?: string;
  status: string;
  mpa_effective_date?: string | null;
  mpa_expiration_date?: string | null;
  primary_contact_name?: string | null;
  primary_contact_email?: string | null;
  primary_contact_phone?: string | null;
  states_authorized?: string[] | null;
  writing_number?: string | null;
  notes?: string | null;
  compliance_requirements?: ComplianceRequirement[];
}

interface EntityStats {
  totalAgents: number;
  formedEntities: number;
  soleProprietors: number;
  byCompanyType: Record<string, number>;
}

interface EntityRosterRow {
  id: string;
  name: string;
  agency?: string | null;
  entity_type?: string | null;
  dba_name?: string | null;
  state?: string | null;
  ein_last4?: string | null;
  articles_status?: string | null;
  beneficial_owners?: number | null;
}

// ─── KPI tile drill-in — hash → tab + optional filter chip ────────────────
type TabKey = "agencies" | "carriers" | "entities" | "formation";

function parseHash(): { tab: TabKey | null; filter: string | null } {
  if (typeof window === "undefined") return { tab: null, filter: null };
  const h = window.location.hash || "";
  const m = h.match(/#tab=([a-z]+)(?:\?filter=([^&]+))?/i);
  if (!m) return { tab: null, filter: null };
  const tab = m[1].toLowerCase();
  const valid: TabKey[] = ["agencies", "carriers", "entities", "formation"];
  return {
    tab: (valid as string[]).includes(tab) ? (tab as TabKey) : null,
    filter: m[2] ? decodeURIComponent(m[2]) : null,
  };
}

// ─── Page ────────────────────────────────────────────────────────────────
export default function FoundersAgencyManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<string>("ytd");
  const [activeTab, setActiveTab] = useState<TabKey>("agencies");
  const [carrierFilter, setCarrierFilter] = useState<string | null>(null);

  // Selection state for the Agencies tab. The Carriers tab always shows the
  // root agency's contracts (Wave 4 — dropdown removed since this whole page
  // IS Gold Coast's agency management).
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);
  const carriersAgencyId = ROOT_AGENCY_ID;

  // Modal open state.
  const [agencyModal, setAgencyModal] = useState<{
    open: boolean;
    mode: "create" | "edit";
    parentAgencyId?: string | null;
    parentAgencyName?: string | null;
    initial?: Partial<AgencyEditPayload>;
    agencyId?: string;
  }>({ open: false, mode: "create" });
  const [contractModal, setContractModal] = useState<{
    open: boolean;
    mode: "create" | "edit";
    agencyId: string | null;
    agencyName: string | null;
    contractId?: string;
    initial?: Partial<CarrierContractPayload> & { carrierName?: string };
  }>({ open: false, mode: "create", agencyId: null, agencyName: null });
  const [overridesModal, setOverridesModal] = useState<{
    open: boolean;
    agencyId: string | null;
    agencyName: string | null;
    carrierId: string;
    carrierName: string | null;
  }>({ open: false, agencyId: null, agencyName: null, carrierId: "", carrierName: null });
  const [complianceModal, setComplianceModal] = useState<{
    open: boolean;
    carrierId: string;
    carrierName: string | null;
  }>({ open: false, carrierId: "", carrierName: null });
  const [addCarrierModalOpen, setAddCarrierModalOpen] = useState(false);
  const [quickNameModalOpen, setQuickNameModalOpen] = useState(false);

  // ─── Hash listener for KPI deep-links ──────────────────────────────────
  // Axiom MED 1 — strip the consumed `?filter=` query so re-clicking the same
  // KPI tile (which would otherwise produce an unchanged hash and skip
  // `hashchange`) still re-fires the navigation. Mirrors the pattern in
  // FoundersLeadDistribution.tsx.
  useEffect(() => {
    const apply = () => {
      const { tab, filter } = parseHash();
      if (tab) setActiveTab(tab);
      setCarrierFilter(filter);
      if (filter && typeof window !== "undefined") {
        window.history.replaceState(null, "", `#tab=${tab ?? "carriers"}`);
      }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  // ─── Queries ──────────────────────────────────────────────────────────
  const kpiQ = useQuery<AgencyKPIs>({
    queryKey: [`/api/founders/agencies/kpis?period=${period}`, period],
    staleTime: 60_000,
    retry: 1,
  });

  const treeQ = useQuery<AgencyTreeNode>({
    queryKey: [`/api/founders/agencies/tree`],
    staleTime: 60_000,
    retry: 1,
  });

  const directoryQ = useQuery<CarrierDirectoryRow[]>({
    queryKey: [`/api/hcms/carriers/directory`],
    staleTime: 60_000,
    retry: 1,
  });

  const entityStatsQ = useQuery<EntityStats>({
    queryKey: [`/api/founders/agencies/entity-stats`],
    staleTime: 60_000,
    retry: 1,
  });

  const entityRosterQ = useQuery<EntityRosterRow[]>({
    queryKey: [`/api/founders/agencies/entity-roster`],
    staleTime: 60_000,
    retry: 1,
  });

  const selectedAgencyQ = useQuery<AgencyDetail>({
    queryKey: [`/api/founders/agencies/${selectedAgencyId}`, selectedAgencyId],
    enabled: !!selectedAgencyId,
    staleTime: 30_000,
    retry: 1,
  });

  // Hide carriers from the Master Directory once the agency has a
  // non-terminated contract with them — they belong in Active Contracts
  // now, not in the reference list. If a contract is later terminated the
  // carrier reappears in the directory so the founder can re-add it under
  // a fresh contract record. Status comparison is case-insensitive so a
  // stored value of "Active" or "active" both filter the same.
  const HIDDEN_CONTRACT_STATUSES = new Set(["active", "pending", "expired"]);

  const contractsQ = useQuery<AgencyCarrierContract[]>({
    queryKey: [`/api/founders/agencies/${carriersAgencyId}/carriers`, carriersAgencyId],
    enabled: !!carriersAgencyId,
    staleTime: 30_000,
    retry: 1,
  });

  // Master Directory minus the carriers already contracted by this agency.
  // Re-derives on every contractsQ refetch (after add/update/terminate), so
  // newly-added carriers disappear from the directory + the Add Carrier
  // modal's autocomplete in the same render. Termination puts them back.
  const filteredDirectory = useMemo(() => {
    const dir = directoryQ.data ?? [];
    const contracts = contractsQ.data ?? [];
    const claimedIds = new Set(
      contracts
        .filter((c) => HIDDEN_CONTRACT_STATUSES.has(String(c.status).toLowerCase()))
        .map((c) => String(c.carrier_id)),
    );
    return dir.filter((row) => !claimedIds.has(String(row.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directoryQ.data, contractsQ.data]);

  const overridesQ = useQuery<CommissionOverride[]>({
    queryKey: [
      `/api/founders/agencies/${overridesModal.agencyId}/overrides`,
      overridesModal.agencyId,
      overridesModal.carrierId,
    ],
    enabled: overridesModal.open && !!overridesModal.agencyId,
    staleTime: 15_000,
    retry: 1,
  });

  const complianceQ = useQuery<ComplianceRequirement[]>({
    queryKey: [
      `/api/founders/carriers/${complianceModal.carrierId}/compliance`,
      complianceModal.carrierId,
    ],
    enabled: complianceModal.open && !!complianceModal.carrierId,
    staleTime: 15_000,
    retry: 1,
  });

  // ─── Defaults: pin selection to the root agency once the tree loads. ───
  useEffect(() => {
    if (treeQ.data && !selectedAgencyId) {
      setSelectedAgencyId(treeQ.data.id);
    }
  }, [treeQ.data, selectedAgencyId]);

  // ─── Mutations ────────────────────────────────────────────────────────
  const invalidateAgencies = () => {
    queryClient.invalidateQueries({ queryKey: [`/api/founders/agencies/tree`] });
    queryClient.invalidateQueries({
      queryKey: [`/api/founders/agencies/kpis?period=${period}`, period],
    });
  };

  const createAgencyMut = useMutation({
    mutationFn: async (payload: AgencyEditPayload) => {
      // Wave 4 — when the founder picked an agent in the modal, take the
      // atomic promote-and-assign path so the agent is promoted to Team
      // Lead AND assigned as manager in a single transaction. Then chain a
      // PATCH to populate the LLC fields the modal collected (which the
      // promote-and-assign endpoint doesn't accept).
      if (payload.assignAgentUserId) {
        const paRes = await fetch("/api/founders/agencies/promote-and-assign", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
          body: JSON.stringify({
            agentUserId: payload.assignAgentUserId,
            name: payload.name,
            parentAgencyId: payload.parentAgencyId ?? undefined,
          }),
          credentials: "include",
        });
        if (!paRes.ok) {
          throw new Error((await paRes.text()) || "Failed to create + assign agency");
        }
        const paJson = (await paRes.json()) as { agencyId: string };

        // Now PATCH the LLC fields. If this fails, surface the error but the
        // lightweight agency already exists — log it so the founder can come
        // back via Edit mode and complete the LLC paperwork.
        const llcPayload = {
          dbaName: payload.dbaName,
          legalEntityType: payload.legalEntityType,
          ein: payload.ein,
          stateOfFormation: payload.stateOfFormation,
          formationDate: payload.formationDate,
          contactEmail: payload.contactEmail,
          contactPhone: payload.contactPhone,
          streetAddress: payload.streetAddress,
          city: payload.city,
          state: payload.state,
          zipCode: payload.zipCode,
          notes: payload.notes,
        };
        // Only PATCH if at least one LLC field is non-empty.
        const hasAnyLlcField = Object.values(llcPayload).some(
          (v) => v != null && String(v).trim() !== "",
        );
        if (hasAnyLlcField) {
          try {
            const patchRes = await fetch(
              `/api/founders/agencies/${paJson.agencyId}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
                body: JSON.stringify(llcPayload),
                credentials: "include",
              },
            );
            if (!patchRes.ok) {
              const txt = await patchRes.text().catch(() => "");
              console.error(
                `[FoundersAgencyMgmt] LLC PATCH failed after promote-and-assign agencyId=${paJson.agencyId}: ${txt}`,
              );
              throw new Error(
                "Agency + assignment created, but failed to save LLC fields. Edit the agency to retry.",
              );
            }
          } catch (e) {
            // Re-throw so the modal surfaces the error. The lightweight agency
            // already exists — founder can finish via Edit mode.
            throw e;
          }
        }
        return paJson;
      }

      // Default 1-step path — no agent assignment, full LLC payload to the
      // standard create endpoint.
      const res = await fetch("/api/founders/agencies", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.text()) || "Failed to create agency");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Agency created" });
      invalidateAgencies();
      // Promote-and-assign also touches HCMS hierarchy + agency_teams, so
      // refresh those caches as well (mirrors QuickNameTeamModal).
      queryClient.invalidateQueries({ queryKey: ["/api/hcms/hierarchy/tree"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hcms/hierarchy/flat"] });
    },
  });

  const updateAgencyMut = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: AgencyEditPayload }) => {
      const res = await fetch(`/api/founders/agencies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.text()) || "Failed to update agency");
      return res.json();
    },
    onSuccess: (_d, vars) => {
      toast({ title: "Agency updated" });
      invalidateAgencies();
      queryClient.invalidateQueries({
        queryKey: [`/api/founders/agencies/${vars.id}`, vars.id],
      });
    },
  });

  const addContractMut = useMutation({
    mutationFn: async ({ agencyId, payload }: { agencyId: string; payload: CarrierContractPayload }) => {
      const res = await fetch(`/api/founders/agencies/${agencyId}/carriers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.text()) || "Failed to add carrier contract");
      return res.json();
    },
    onSuccess: (_d, vars) => {
      toast({ title: "Carrier contract added" });
      queryClient.invalidateQueries({
        queryKey: [`/api/founders/agencies/${vars.agencyId}/carriers`, vars.agencyId],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/founders/agencies/kpis?period=${period}`, period],
      });
    },
  });

  const updateContractMut = useMutation({
    mutationFn: async ({
      agencyId,
      contractId,
      payload,
    }: {
      agencyId: string;
      contractId: string;
      payload: CarrierContractPayload;
    }) => {
      const res = await fetch(
        `/api/founders/agencies/${agencyId}/carriers/${contractId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error((await res.text()) || "Failed to update contract");
      return res.json();
    },
    onSuccess: (_d, vars) => {
      toast({ title: "Contract updated" });
      queryClient.invalidateQueries({
        queryKey: [`/api/founders/agencies/${vars.agencyId}/carriers`, vars.agencyId],
      });
    },
  });

  const terminateContractMut = useMutation({
    mutationFn: async ({ agencyId, contractId }: { agencyId: string; contractId: string }) => {
      const res = await fetch(
        `/api/founders/agencies/${agencyId}/carriers/${contractId}`,
        {
          method: "DELETE",
          headers: { ...(await csrfHeaders()) },
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error((await res.text()) || "Failed to terminate contract");
    },
    onSuccess: (_d, vars) => {
      toast({ title: "Contract terminated" });
      queryClient.invalidateQueries({
        queryKey: [`/api/founders/agencies/${vars.agencyId}/carriers`, vars.agencyId],
      });
    },
  });

  const addOverrideMut = useMutation({
    mutationFn: async ({ agencyId, payload }: { agencyId: string; payload: AddOverridePayload }) => {
      const res = await fetch(`/api/founders/agencies/${agencyId}/overrides`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.text()) || "Failed to add override");
      return res.json();
    },
    onSuccess: (_d, vars) => {
      toast({ title: "Override added" });
      queryClient.invalidateQueries({
        queryKey: [
          `/api/founders/agencies/${vars.agencyId}/overrides`,
          vars.agencyId,
          overridesModal.carrierId,
        ],
      });
    },
  });

  const terminateOverrideMut = useMutation({
    mutationFn: async ({ agencyId, overrideId }: { agencyId: string; overrideId: string }) => {
      const res = await fetch(
        `/api/founders/agencies/${agencyId}/overrides/${overrideId}`,
        {
          method: "DELETE",
          headers: { ...(await csrfHeaders()) },
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error((await res.text()) || "Failed to terminate override");
    },
    onSuccess: (_d, vars) => {
      toast({ title: "Override terminated" });
      queryClient.invalidateQueries({
        queryKey: [
          `/api/founders/agencies/${vars.agencyId}/overrides`,
          vars.agencyId,
          overridesModal.carrierId,
        ],
      });
    },
  });

  const addRequirementMut = useMutation({
    mutationFn: async ({
      carrierId,
      payload,
    }: {
      carrierId: string;
      payload: AddRequirementPayload;
    }) => {
      const res = await fetch(`/api/founders/carriers/${carrierId}/compliance`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.text()) || "Failed to add requirement");
      return res.json();
    },
    onSuccess: (_d, vars) => {
      toast({ title: "Requirement added" });
      queryClient.invalidateQueries({
        queryKey: [`/api/founders/carriers/${vars.carrierId}/compliance`, vars.carrierId],
      });
    },
  });

  const removeRequirementMut = useMutation({
    mutationFn: async ({ carrierId, reqId }: { carrierId: string; reqId: string }) => {
      const res = await fetch(
        `/api/founders/carriers/${carrierId}/compliance/${reqId}`,
        {
          method: "DELETE",
          headers: { ...(await csrfHeaders()) },
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error((await res.text()) || "Failed to remove requirement");
    },
    onSuccess: (_d, vars) => {
      toast({ title: "Requirement removed" });
      queryClient.invalidateQueries({
        queryKey: [`/api/founders/carriers/${vars.carrierId}/compliance`, vars.carrierId],
      });
    },
  });

  const addCarrierMut = useMutation({
    mutationFn: async (payload: AddCarrierPayload) => {
      const res = await fetch(`/api/founders/carriers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.text()) || "Failed to add carrier");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Carrier added to directory" });
      queryClient.invalidateQueries({ queryKey: [`/api/hcms/carriers/directory`] });
    },
  });

  // ─── Page-level error guard — only blank if every core query errors. ──
  const allErrored = !!(kpiQ.error && treeQ.error && directoryQ.error && entityStatsQ.error);
  const firstError = kpiQ.error || treeQ.error || directoryQ.error || entityStatsQ.error;

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
          Unable to load agency management
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

  // ─── Flatten the tree for the agency picker dropdown. ─────────────────
  const agencyOptions = useMemo(() => {
    const out: Array<{ value: string; label: string }> = [];
    function walk(node: AgencyTreeNode | undefined | null, depth = 0) {
      if (!node) return;
      const indent = depth > 0 ? "↳ ".padStart(depth * 2 + 2, " ") : "";
      out.push({ value: node.id, label: `${indent}${node.name}` });
      (node.children || []).forEach((c) => walk(c, depth + 1));
    }
    walk(treeQ.data);
    return out;
  }, [treeQ.data]);

  // Render --------------------------------------------------------------
  return (
    <div>
      <GCPageHeader
        title="Agency Management"
        subtitle="Sub-agencies, carrier contracts, entity formation"
        accentUnderline
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div data-tour-id={TOUR.FOUNDERS.AGENCY_MGMT.HEADER}>
              <GCPeriodSelector value={period} onChange={setPeriod} />
            </div>
            <Link
              href="/founders/hierarchy"
              className="inline-flex items-center gap-1.5 px-3 py-2"
              style={OUTLINED_BUTTON_STYLE}
            >
              <Network className="w-4 h-4" />
              <span className="hidden xl:inline">Manage Hierarchy</span>
            </Link>
            <div data-tour-id={TOUR.FOUNDERS.AGENCY_MGMT.QUICK_NAME_BUTTON}>
              <GCSecondaryButton
                onClick={() => setQuickNameModalOpen(true)}
                icon={<Users className="w-4 h-4" />}
              >
                Quick Name
              </GCSecondaryButton>
            </div>
            <div data-tour-id={TOUR.FOUNDERS.AGENCY_MGMT.NEW_AGENCY_BUTTON}>
              <GCPrimaryButton
                onClick={() =>
                  setAgencyModal({
                    open: true,
                    mode: "create",
                    parentAgencyId: treeQ.data?.id || null,
                    parentAgencyName: treeQ.data?.name || null,
                  })
                }
                icon={<Plus className="w-4 h-4" />}
              >
                New Agency
              </GCPrimaryButton>
            </div>
          </div>
        }
      />

      {/* KPI strip — 4 tiles, each linked to a tab via #tab=<name> */}
      <section
        aria-labelledby="founders-agencies-kpi-heading"
        className="mb-6"
        data-tour-id={TOUR.FOUNDERS.AGENCY_MGMT.KPI_GRID}
      >
        <h2 id="founders-agencies-kpi-heading" className="sr-only">Agency Management KPIs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiQ.isLoading || !kpiQ.data ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[116px] w-full" />
            ))
          ) : (
            <>
              <Link
                href="#tab=agencies"
                aria-label={`Agencies: ${formatNumber(kpiQ.data.agenciesCount)} — jump to Agencies tab`}
                className={KPI_LINK_CLASS}
              >
                <GCKPICard label="Agencies" value={formatNumber(kpiQ.data.agenciesCount)} accentTop />
              </Link>
              <Link
                href="#tab=carriers"
                aria-label={`Carriers contracted: ${formatNumber(kpiQ.data.carriersContractedCount)} — jump to Carriers tab`}
                className={KPI_LINK_CLASS}
              >
                <GCKPICard
                  label="Carriers Contracted"
                  value={formatNumber(kpiQ.data.carriersContractedCount)}
                  accentTop
                />
              </Link>
              <Link
                href="#tab=entities"
                aria-label={`Agents with entity: ${formatNumber(kpiQ.data.agentsWithEntity)} — jump to Entities tab`}
                className={KPI_LINK_CLASS}
              >
                <GCKPICard
                  label="Agents With Entity"
                  value={formatNumber(kpiQ.data.agentsWithEntity)}
                  accentTop
                />
              </Link>
              <Link
                href="#tab=carriers?filter=pending"
                aria-label={`Pending carrier requests: ${formatNumber(kpiQ.data.pendingCarrierRequests)} — jump to Carriers tab filtered to pending`}
                className={KPI_LINK_CLASS}
              >
                <GCKPICard
                  label="Pending Carrier Requests"
                  value={formatNumber(kpiQ.data.pendingCarrierRequests)}
                  accentTop
                />
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Tabs */}
      <div data-tour-id={TOUR.FOUNDERS.AGENCY_MGMT.TABS}>
        <GCTabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
          <GCTabsList>
            <GCTabsTrigger value="agencies">Agencies</GCTabsTrigger>
            <GCTabsTrigger value="carriers">Carriers</GCTabsTrigger>
            <GCTabsTrigger value="entities">Entities</GCTabsTrigger>
            <GCTabsTrigger value="formation">Formation Guide</GCTabsTrigger>
          </GCTabsList>

          {/* TAB 1 — AGENCIES (tree + detail) */}
          <GCTabsContent value="agencies">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div
                className="lg:col-span-2"
                data-tour-id={TOUR.FOUNDERS.AGENCY_MGMT.AGENCY_TREE}
              >
                <div style={{ ...SECTION_LABEL_STYLE, marginBottom: 8 }}>Agency Tree</div>
                {treeQ.isLoading ? (
                  <Skeleton className="h-[520px] w-full" />
                ) : (
                  <AgencyTreeFlow
                    tree={treeQ.data || null}
                    selectedId={selectedAgencyId}
                    onSelect={setSelectedAgencyId}
                    height={520}
                  />
                )}
              </div>
              <div
                className="lg:col-span-3"
                data-tour-id={TOUR.FOUNDERS.AGENCY_MGMT.AGENCY_DETAIL}
              >
                <div style={{ ...SECTION_LABEL_STYLE, marginBottom: 8 }}>Agency Detail</div>
                {!selectedAgencyId ? (
                  <EmptyTableBlock
                    title="No agency selected."
                    subtext="Click a node in the tree to view its details."
                  />
                ) : selectedAgencyQ.isLoading ? (
                  <Skeleton className="h-[520px] w-full" />
                ) : selectedAgencyQ.data ? (
                  <AgencyDetailCard
                    agency={selectedAgencyQ.data}
                    onEdit={() =>
                      setAgencyModal({
                        open: true,
                        mode: "edit",
                        agencyId: selectedAgencyQ.data!.id,
                        parentAgencyId: selectedAgencyQ.data!.parent_agency_id,
                        parentAgencyName: null,
                        initial: {
                          name: selectedAgencyQ.data!.name,
                          dbaName: selectedAgencyQ.data!.dba_name || "",
                          legalEntityType: selectedAgencyQ.data!.legal_entity_type || "LLC",
                          ein: selectedAgencyQ.data!.ein || "",
                          stateOfFormation: selectedAgencyQ.data!.state_of_formation || "",
                          formationDate: selectedAgencyQ.data!.formation_date || "",
                          contactEmail: selectedAgencyQ.data!.contact_email || "",
                          contactPhone: selectedAgencyQ.data!.contact_phone || "",
                          streetAddress: selectedAgencyQ.data!.street_address || "",
                          city: selectedAgencyQ.data!.city || "",
                          state: selectedAgencyQ.data!.state || "",
                          zipCode: selectedAgencyQ.data!.zip_code || "",
                          status: selectedAgencyQ.data!.status,
                          notes: selectedAgencyQ.data!.notes || "",
                        },
                      })
                    }
                    onAddSub={() =>
                      setAgencyModal({
                        open: true,
                        mode: "create",
                        parentAgencyId: selectedAgencyQ.data!.id,
                        parentAgencyName: selectedAgencyQ.data!.name,
                      })
                    }
                  />
                ) : (
                  <EmptyTableBlock title="Agency not found." subtext="Try selecting another node." />
                )}
              </div>
            </div>
          </GCTabsContent>

          {/* TAB 2 — CARRIERS */}
          <GCTabsContent value="carriers">
            <div className="space-y-6">
              {/* Axiom MED 2 — Agency Carrier Contracts (the actionable
                  section) renders FIRST so the founder lands on it. The
                  Master Carrier Directory (reference material) is below. */}
              {/* Per-agency contracts. Wave 4: this page IS Gold Coast's agency
                  management — carrier contracts always pertain to the root
                  agency, so the agency-picker dropdown was removed. The
                  contracts query is hardcoded to ROOT_AGENCY_ID. */}
              <div data-tour-id={TOUR.FOUNDERS.AGENCY_MGMT.AGENCY_CONTRACTS}>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <h3 style={{ ...SECTION_LABEL_STYLE, margin: 0 }}>Agency Carrier Contracts</h3>
                  <div className="flex items-center gap-2">
                    {carrierFilter && (
                      <span
                        style={{
                          ...PILL_STYLE,
                          backgroundColor: "color-mix(in srgb, var(--gc-gold) 18%, transparent)",
                          color: "var(--gc-gold)",
                          fontWeight: 600,
                        }}
                      >
                        Filter: {carrierFilter}
                        <button
                          onClick={() => {
                            setCarrierFilter(null);
                            if (typeof window !== "undefined") {
                              window.history.replaceState(null, "", "#tab=carriers");
                            }
                          }}
                          style={{
                            marginLeft: 4,
                            background: "none",
                            border: "none",
                            color: "var(--gc-gold)",
                            cursor: "pointer",
                          }}
                          aria-label="Clear filter"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
                {contractsQ.isLoading ? (
                  <Skeleton className="h-[260px] w-full" />
                ) : (
                  <ContractsTable
                    contracts={(contractsQ.data || []).filter((c) =>
                      carrierFilter ? c.status === carrierFilter : true
                    )}
                    onEdit={(c) =>
                      setContractModal({
                        open: true,
                        mode: "edit",
                        agencyId: carriersAgencyId,
                        agencyName: agencyOptions.find((a) => a.value === carriersAgencyId)?.label || null,
                        contractId: c.id,
                        initial: {
                          carrierId: c.carrier_id,
                          carrierName: c.carrier_name,
                          status: c.status,
                          mpaEffectiveDate: c.mpa_effective_date || "",
                          mpaExpirationDate: c.mpa_expiration_date || "",
                          primaryContactName: c.primary_contact_name || "",
                          primaryContactEmail: c.primary_contact_email || "",
                          primaryContactPhone: c.primary_contact_phone || "",
                          statesAuthorized: c.states_authorized || [],
                          writingNumber: c.writing_number || "",
                          notes: c.notes || "",
                        },
                      })
                    }
                    onOverrides={(c) =>
                      setOverridesModal({
                        open: true,
                        agencyId: carriersAgencyId,
                        agencyName: agencyOptions.find((a) => a.value === carriersAgencyId)?.label || null,
                        carrierId: c.carrier_id,
                        carrierName: c.carrier_name || null,
                      })
                    }
                    onCompliance={(c) =>
                      setComplianceModal({
                        open: true,
                        carrierId: c.carrier_id,
                        carrierName: c.carrier_name || null,
                      })
                    }
                    onTerminate={(c) => {
                      if (
                        !window.confirm(
                          `Terminate contract with ${c.carrier_name || "carrier"}? This is reversible by editing back to active.`
                        )
                      )
                        return;
                      terminateContractMut.mutate({ agencyId: carriersAgencyId, contractId: c.id });
                    }}
                  />
                )}
              </div>

              {/* Master directory — reference material below the actionable
                  contracts panel (Axiom MED 2). */}
              <div data-tour-id={TOUR.FOUNDERS.AGENCY_MGMT.CARRIER_DIRECTORY}>
                <div className="flex items-center justify-between mb-2">
                  <h3 style={{ ...SECTION_LABEL_STYLE, margin: 0 }}>Master Carrier Directory</h3>
                  <div data-tour-id={TOUR.FOUNDERS.AGENCY_MGMT.ADD_CARRIER_BUTTON}>
                    <GCPrimaryButton
                      onClick={() => setAddCarrierModalOpen(true)}
                      icon={<Plus className="w-4 h-4" />}
                      size="sm"
                    >
                      Add New Carrier
                    </GCPrimaryButton>
                  </div>
                </div>
                {directoryQ.isLoading ? (
                  <Skeleton className="h-[260px] w-full" />
                ) : filteredDirectory.length > 0 ? (
                  <DirectoryTable
                    carriers={filteredDirectory}
                    onAddToAgency={(carrierId, carrierName) =>
                      setContractModal({
                        open: true,
                        mode: "create",
                        agencyId: carriersAgencyId,
                        agencyName: agencyOptions.find((a) => a.value === carriersAgencyId)?.label || null,
                        initial: { carrierId, carrierName },
                      })
                    }
                    onCompliance={(carrierId, carrierName) =>
                      setComplianceModal({ open: true, carrierId, carrierName })
                    }
                  />
                ) : (directoryQ.data?.length ?? 0) > 0 ? (
                  // Directory has carriers but every one is already under
                  // contract with this agency. Different empty state copy so
                  // the founder understands the directory isn't empty —
                  // they just don't have anything left to add.
                  <EmptyTableBlock
                    title="All carriers are already under contract."
                    subtext="Every carrier in the master directory is in your Active Contracts above. Terminate a contract to bring its carrier back here, or add a brand-new carrier to the directory."
                  />
                ) : (
                  <EmptyTableBlock
                    title="No carriers in the directory yet."
                    subtext="Click 'Add New Carrier' to create the first entry."
                  />
                )}
              </div>
            </div>
          </GCTabsContent>

          {/* TAB 3 — ENTITIES */}
          <GCTabsContent value="entities">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {entityStatsQ.isLoading || !entityStatsQ.data ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-[100px] w-full" />
                  ))
                ) : (
                  <>
                    <GCKPICard
                      label="Total Agents"
                      value={formatNumber(entityStatsQ.data.totalAgents)}
                    />
                    <GCKPICard
                      label="Formed Entities"
                      value={formatNumber(entityStatsQ.data.formedEntities)}
                    />
                    <GCKPICard
                      label="Sole Proprietors"
                      value={formatNumber(entityStatsQ.data.soleProprietors)}
                    />
                  </>
                )}
              </div>

              <div data-tour-id={TOUR.FOUNDERS.AGENCY_MGMT.ENTITY_CHART}>
                <h3 style={{ ...SECTION_LABEL_STYLE, margin: 0, marginBottom: 8 }}>
                  Agents by Company Type
                </h3>
                {entityStatsQ.isLoading ? (
                  <Skeleton className="h-[180px] w-full" />
                ) : entityStatsQ.data && Object.keys(entityStatsQ.data.byCompanyType || {}).length > 0 ? (
                  <CompanyTypeRollup byCompanyType={entityStatsQ.data.byCompanyType} />
                ) : (
                  <EmptyTableBlock
                    title="No entity data yet."
                    subtext="Direct agents to /agent/dba to populate this chart."
                  />
                )}
              </div>

              <div data-tour-id={TOUR.FOUNDERS.AGENCY_MGMT.ENTITY_ROSTER}>
                <div style={{ ...SECTION_LABEL_STYLE, marginBottom: 8 }}>Entity Roster</div>
                {entityRosterQ.isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : entityRosterQ.data && entityRosterQ.data.length > 0 ? (
                  <EntityRosterTable rows={entityRosterQ.data} />
                ) : (
                  <EmptyTableBlock
                    title="No agents have entered DBA info yet."
                    subtext="Direct them to /agent/dba to begin."
                  />
                )}
              </div>
            </div>
          </GCTabsContent>

          {/* TAB 4 — FORMATION GUIDE */}
          <GCTabsContent value="formation">
            <FormationGuideTab />
          </GCTabsContent>
        </GCTabs>
      </div>

      {/* ─── Modals ────────────────────────────────────────────────────── */}
      {agencyModal.open && (
        <AgencyEditModal
          open={agencyModal.open}
          mode={agencyModal.mode}
          parentAgencyId={agencyModal.parentAgencyId}
          parentAgencyName={agencyModal.parentAgencyName}
          initial={agencyModal.initial}
          onClose={() => setAgencyModal({ open: false, mode: "create" })}
          onSubmit={async (payload) => {
            if (agencyModal.mode === "edit" && agencyModal.agencyId) {
              await updateAgencyMut.mutateAsync({ id: agencyModal.agencyId, payload });
            } else {
              await createAgencyMut.mutateAsync(payload);
            }
          }}
        />
      )}

      {contractModal.open && contractModal.agencyId && (
        <CarrierContractModal
          open={contractModal.open}
          mode={contractModal.mode}
          agencyName={contractModal.agencyName}
          carriers={filteredDirectory.map((c) => ({ id: c.id, name: c.name }))}
          initial={contractModal.initial}
          onClose={() =>
            setContractModal({ open: false, mode: "create", agencyId: null, agencyName: null })
          }
          onSubmit={async (payload) => {
            if (!contractModal.agencyId) return;
            if (contractModal.mode === "edit" && contractModal.contractId) {
              const ok = window.confirm(
                `Save changes to the ${contractModal.initial?.carrierName ?? "carrier"} contract? Edits to commission %, override %, or writing number will affect future commission calculations.`,
              );
              if (!ok) return;
              await updateContractMut.mutateAsync({
                agencyId: contractModal.agencyId,
                contractId: contractModal.contractId,
                payload,
              });
            } else {
              await addContractMut.mutateAsync({
                agencyId: contractModal.agencyId,
                payload,
              });
            }
          }}
        />
      )}

      {overridesModal.open && overridesModal.agencyId && (
        <CommissionOverridesModal
          open={overridesModal.open}
          agencyName={overridesModal.agencyName}
          carrierName={overridesModal.carrierName}
          carrierId={overridesModal.carrierId}
          overrides={(overridesQ.data || []).filter((o) => o.carrier_id === overridesModal.carrierId)}
          onClose={() =>
            setOverridesModal({
              open: false,
              agencyId: null,
              agencyName: null,
              carrierId: "",
              carrierName: null,
            })
          }
          onAdd={async (payload) => {
            if (!overridesModal.agencyId) return;
            await addOverrideMut.mutateAsync({
              agencyId: overridesModal.agencyId,
              payload,
            });
          }}
          onTerminate={async (overrideId) => {
            if (!overridesModal.agencyId) return;
            const ok = window.confirm(
              `Terminate the override on ${overridesModal.carrierName ?? "this carrier"}? This is reversible from the audit log.`,
            );
            if (!ok) return;
            await terminateOverrideMut.mutateAsync({
              agencyId: overridesModal.agencyId,
              overrideId,
            });
          }}
        />
      )}

      {complianceModal.open && complianceModal.carrierId && (
        <ComplianceRequirementsModal
          open={complianceModal.open}
          carrierName={complianceModal.carrierName}
          requirements={complianceQ.data || []}
          onClose={() => setComplianceModal({ open: false, carrierId: "", carrierName: null })}
          onAdd={async (payload) => {
            await addRequirementMut.mutateAsync({ carrierId: complianceModal.carrierId, payload });
          }}
          onRemove={async (reqId) => {
            const ok = window.confirm(
              `Remove this compliance requirement from ${complianceModal.carrierName ?? "this carrier"}? Agents will no longer see it on their contracting checklist.`,
            );
            if (!ok) return;
            await removeRequirementMut.mutateAsync({ carrierId: complianceModal.carrierId, reqId });
          }}
        />
      )}

      {addCarrierModalOpen && (
        <AddCarrierModal
          open={addCarrierModalOpen}
          onClose={() => setAddCarrierModalOpen(false)}
          onSubmit={async (payload) => {
            await addCarrierMut.mutateAsync(payload);
          }}
        />
      )}

      {/* Quick Name — no agent passed, modal renders its own picker first.
          Defaults parent to the root agency once the tree resolves. */}
      {quickNameModalOpen && (
        <QuickNameTeamModal
          open={quickNameModalOpen}
          onOpenChange={setQuickNameModalOpen}
          defaultParentAgencyId={treeQ.data?.id}
        />
      )}
    </div>
  );
}

// ─── Agency detail card (right pane of the Agencies tab) ─────────────────
function AgencyDetailCard({
  agency,
  onEdit,
  onAddSub,
}: {
  agency: AgencyDetail;
  onEdit: () => void;
  onAddSub: () => void;
}) {
  const teams = agency.teams || [];
  const children = agency.children || [];
  return (
    <div style={CARD_STYLE}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div
            style={{
              fontFamily: "var(--gc-font-display)",
              fontSize: "var(--gc-text-xl)",
              color: "var(--gc-text-primary)",
              lineHeight: 1.2,
            }}
          >
            {agency.name}
          </div>
          {agency.dba_name && (
            <div
              style={{
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-sm)",
                color: "var(--gc-text-secondary)",
                marginTop: 2,
              }}
            >
              DBA {agency.dba_name}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <GCStatusBadge status={agency.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
        <FieldRow label="Legal Entity Type" value={agency.legal_entity_type} />
        <FieldRow label="State of Formation" value={agency.state_of_formation} />
        <FieldRow label="EIN" value={agency.ein ? maskEin(agency.ein) : null} />
        <FieldRow label="Formation Date" value={agency.formation_date ? formatDate(agency.formation_date) : null} />
        <FieldRow label="Contact Email" value={agency.contact_email} />
        <FieldRow label="Contact Phone" value={agency.contact_phone} />
        <FieldRow
          label="Address"
          value={
            agency.street_address
              ? `${agency.street_address}, ${agency.city || ""} ${agency.state || ""} ${agency.zip_code || ""}`.trim()
              : null
          }
          colSpan={2}
        />
      </div>

      <div className="mb-4">
        <div style={{ ...SECTION_LABEL_STYLE, marginBottom: 6 }}>
          Assigned Teams ({teams.length})
        </div>
        {teams.length === 0 ? (
          <div
            style={{
              padding: "var(--gc-space-2) var(--gc-space-3)",
              backgroundColor: "var(--gc-surface-2)",
              borderRadius: "var(--gc-radius-sm)",
              fontSize: "var(--gc-text-sm)",
              color: "var(--gc-text-muted)",
            }}
          >
            No teams assigned. Use /hcms/hierarchy to add managers, then assign them here.
          </div>
        ) : (
          <div className="flex flex-wrap">
            {teams.map((t) => (
              <span key={t.manager_user_id} style={PILL_STYLE}>
                <Users className="w-3 h-3" />
                {t.manager_name || t.manager_user_id.slice(0, 8)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4">
        <div style={{ ...SECTION_LABEL_STYLE, marginBottom: 6 }}>
          Sub-Agencies ({children.length})
        </div>
        {children.length === 0 ? (
          <div
            style={{
              padding: "var(--gc-space-2) var(--gc-space-3)",
              backgroundColor: "var(--gc-surface-2)",
              borderRadius: "var(--gc-radius-sm)",
              fontSize: "var(--gc-text-sm)",
              color: "var(--gc-text-muted)",
            }}
          >
            None — click "Add Sub-Agency" to nest one underneath.
          </div>
        ) : (
          <div className="flex flex-wrap">
            {children.map((c) => (
              <span key={c.id} style={PILL_STYLE}>
                <Building2 className="w-3 h-3" />
                {c.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <GCSecondaryButton onClick={onEdit} icon={<Edit className="w-4 h-4" />}>
          Edit
        </GCSecondaryButton>
        <GCPrimaryButton onClick={onAddSub} icon={<Plus className="w-4 h-4" />}>
          Add Sub-Agency
        </GCPrimaryButton>
      </div>
    </div>
  );
}

function FieldRow({
  label,
  value,
  colSpan,
}: {
  label: string;
  value?: string | null;
  colSpan?: number;
}) {
  return (
    <div style={{ gridColumn: colSpan ? `span ${colSpan} / span ${colSpan}` : undefined }}>
      <div style={{ ...SECTION_LABEL_STYLE, fontSize: "10px" }}>{label}</div>
      <div
        style={{
          fontFamily: "var(--gc-font-body)",
          fontSize: "var(--gc-text-sm)",
          color: "var(--gc-text-primary)",
          marginTop: 2,
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function maskEin(ein: string): string {
  const digits = ein.replace(/\D/g, "");
  if (digits.length < 4) return ein;
  return `XX-XXX${digits.slice(-4)}`;
}

// ─── Carrier directory table (Carriers tab top) ──────────────────────────
function DirectoryTable({
  carriers,
  onAddToAgency,
  onCompliance,
}: {
  carriers: CarrierDirectoryRow[];
  onAddToAgency: (carrierId: string, carrierName: string) => void;
  onCompliance: (carrierId: string, carrierName: string) => void;
}) {
  const cols: Column<CarrierDirectoryRow>[] = [
    { key: "name", label: "Carrier", sortable: true },
    { key: "am_best", label: "AM Best", width: 100, render: (v) => v || "—" },
    {
      key: "product_types",
      label: "Product Types",
      render: (v) => {
        if (!v || (Array.isArray(v) && v.length === 0)) return "—";
        const arr = Array.isArray(v) ? v : [];
        return (
          <span>
            {arr.slice(0, 3).map((p: string) => (
              <span key={p} style={PILL_STYLE}>
                {p}
              </span>
            ))}
            {arr.length > 3 && (
              <span style={{ ...PILL_STYLE, opacity: 0.7 }}>+{arr.length - 3}</span>
            )}
          </span>
        );
      },
    },
    {
      key: "active_agency_contracts",
      label: "Contracts",
      align: "right",
      width: 110,
      render: (v) => formatNumber(Number(v) || 0),
    },
    {
      key: "id",
      label: "",
      width: 200,
      align: "right",
      render: (_v, r) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCompliance(r.id, r.name);
            }}
            title="Compliance Requirements"
            style={{
              background: "none",
              border: "1px solid var(--gc-border)",
              borderRadius: "var(--gc-radius-sm)",
              color: "var(--gc-text-secondary)",
              padding: "4px 8px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: "11px",
            }}
          >
            <ShieldCheck className="w-3 h-3" />
            Compliance
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToAgency(r.id, r.name);
            }}
            style={{
              background: "var(--gc-btn-primary-bg)",
              color: "var(--gc-btn-primary-text)",
              border: "none",
              borderRadius: "var(--gc-radius-sm)",
              padding: "4px 10px",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Plus className="w-3 h-3" />
            Add to Agency
          </button>
        </div>
      ),
    },
  ];
  return <GCDataTable columns={cols} data={carriers} searchable searchPlaceholder="Search carriers..." pageSize={10} />;
}

// ─── Agency carrier contracts table (Carriers tab bottom) ────────────────
function ContractsTable({
  contracts,
  onEdit,
  onOverrides,
  onCompliance,
  onTerminate,
}: {
  contracts: AgencyCarrierContract[];
  onEdit: (c: AgencyCarrierContract) => void;
  onOverrides: (c: AgencyCarrierContract) => void;
  onCompliance: (c: AgencyCarrierContract) => void;
  onTerminate: (c: AgencyCarrierContract) => void;
}) {
  const cols: Column<AgencyCarrierContract>[] = [
    {
      key: "carrier_name",
      label: "Carrier",
      sortable: true,
      render: (v, r) => v || r.carrier_id.slice(0, 8),
    },
    {
      key: "status",
      label: "Status",
      width: 110,
      render: (v) => <GCStatusBadge status={String(v || "active")} />,
    },
    { key: "mpa_effective_date", label: "MPA Effective", width: 130, render: (v) => formatDate(v) },
    { key: "mpa_expiration_date", label: "MPA Expiration", width: 130, render: (v) => formatDate(v) },
    {
      key: "primary_contact_name",
      label: "Primary Contact",
      render: (v, r) => v || r.primary_contact_email || "—",
    },
    {
      key: "writing_number",
      label: "Writing #",
      width: 130,
      render: (v) => v || "—",
    },
    {
      key: "compliance_requirements",
      label: "Compliance",
      width: 160,
      render: (v) => {
        const reqs = (v || []) as ComplianceRequirement[];
        if (reqs.length === 0) return <span style={{ color: "var(--gc-text-muted)", fontSize: "11px" }}>none</span>;
        // Helix BLOCK 2 + HIGH 5 — surface ADVISORY pills here so founders
        // know at-a-glance which compliance items will NOT auto-block agent
        // appointment requests today.
        const ADVISORY = new Set(["aml_training", "background_check", "training_module"]);
        return (
          <span>
            {reqs.slice(0, 3).map((r) => {
              const isAdvisory = ADVISORY.has(r.requirement_type);
              return (
                <span
                  key={r.id}
                  style={{
                    ...PILL_STYLE,
                    ...(isAdvisory
                      ? {
                          backgroundColor:
                            "color-mix(in srgb, var(--gc-status-warning, #d4a574) 18%, transparent)",
                          color: "var(--gc-status-warning, #d4a574)",
                          border: "1px solid var(--gc-status-warning, #d4a574)",
                          fontWeight: 600,
                        }
                      : {}),
                  }}
                  title={
                    isAdvisory
                      ? `${r.requirement_type} — advisory (not auto-enforced)`
                      : r.requirement_type
                  }
                >
                  {r.requirement_type.replace(/_/g, " ").slice(0, 10)}
                </span>
              );
            })}
            {reqs.length > 3 && <span style={{ ...PILL_STYLE, opacity: 0.7 }}>+{reqs.length - 3}</span>}
          </span>
        );
      },
    },
    {
      key: "id",
      label: "",
      width: 220,
      align: "right",
      render: (_v, r) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(r);
            }}
            title="Edit contract"
            style={iconBtnStyle}
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOverrides(r);
            }}
            title="Commission overrides"
            style={iconBtnStyle}
          >
            <Settings className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCompliance(r);
            }}
            title="Compliance requirements"
            style={iconBtnStyle}
          >
            <ShieldCheck className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTerminate(r);
            }}
            title="Terminate"
            style={{ ...iconBtnStyle, color: "var(--gc-status-terminated)" }}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ),
    },
  ];
  return <GCDataTable columns={cols} data={contracts} searchable searchPlaceholder="Search contracts..." pageSize={10} />;
}

const iconBtnStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid var(--gc-border)",
  borderRadius: "var(--gc-radius-sm)",
  color: "var(--gc-text-secondary)",
  padding: "4px 6px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
};

// ─── Agents-by-company-type rollup (Entities tab) ─────────────────────────
// Compact stat-tile grid (2-3-4-col responsive). Each tile = one entity type
// with the count as the hero number, share % subdued, and a small color-dot
// + thin bottom accent stroke in a per-type color so multiple types are
// instantly distinguishable. Replaces the prior GCBarChart use that rendered
// a single stretched bar with ugly decimal x-axis ticks for the 1-type case.
const COMPANY_TYPE_COLORS: Record<string, string> = {
  LLC: "var(--gc-gold)",
  Corporation: "var(--gc-chart-2)",      // violet
  "S-Corp": "var(--gc-chart-3)",          // green
  "C-Corp": "var(--gc-chart-4)",          // blue
  Partnership: "var(--gc-chart-5)",       // amber
  "Sole Proprietor": "var(--gc-status-review)",
  Other: "var(--gc-text-muted)",
};
function colorForType(type: string): string {
  return COMPANY_TYPE_COLORS[type] || "var(--gc-text-muted)";
}

function CompanyTypeRollup({
  byCompanyType,
}: {
  byCompanyType: Record<string, number>;
}) {
  const entries = Object.entries(byCompanyType)
    .map(([k, v]) => ({ type: k, count: Number(v) || 0 }))
    .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));
  const totalCount = entries.reduce((s, e) => s + e.count, 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {entries.map(({ type, count }) => {
        const sharePct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
        const accent = colorForType(type);
        return (
          <div
            key={type}
            style={{
              backgroundColor: "var(--gc-surface)",
              border: "1px solid var(--gc-border)",
              borderRadius: "var(--gc-radius-md)",
              padding: "var(--gc-space-4)",
              position: "relative",
              overflow: "hidden",
            }}
            aria-label={`${type}: ${count} ${count === 1 ? "agent" : "agents"} (${sharePct}% of total)`}
          >
            {/* Accent stripe along the bottom — per-type color */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 3,
                backgroundColor: accent,
              }}
            />
            <div className="flex items-center gap-2 mb-2">
              <span
                aria-hidden="true"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: accent,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
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
                {type}
              </div>
            </div>
            <div
              style={{
                fontFamily: "var(--gc-font-display)",
                fontSize: "var(--gc-text-3xl)",
                fontWeight: 600,
                color: "var(--gc-text-primary)",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {count}
            </div>
            <div
              className="mt-1 flex items-baseline justify-between"
              style={{
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-xs)",
                color: "var(--gc-text-muted)",
              }}
            >
              <span>{count === 1 ? "agent" : "agents"}</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{sharePct}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Entity roster table (Entities tab) ──────────────────────────────────
function EntityRosterTable({ rows }: { rows: EntityRosterRow[] }) {
  const cols: Column<EntityRosterRow>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "agency", label: "Agency", render: (v) => v || "—" },
    { key: "entity_type", label: "Entity Type", width: 110, render: (v) => v || "—" },
    { key: "dba_name", label: "DBA Name", render: (v) => v || "—" },
    { key: "state", label: "State", width: 70, render: (v) => v || "—" },
    {
      key: "ein_last4",
      label: "EIN (last 4)",
      width: 110,
      render: (v) => (v ? `XX-XXX${v}` : "—"),
    },
    {
      key: "articles_status",
      label: "Articles",
      width: 110,
      render: (v) =>
        v === "uploaded" ? (
          <span
            style={{
              ...PILL_STYLE,
              backgroundColor: "color-mix(in srgb, var(--gc-status-active) 18%, transparent)",
              color: "var(--gc-status-active)",
            }}
          >
            Uploaded
          </span>
        ) : (
          <span
            style={{
              ...PILL_STYLE,
              backgroundColor: "color-mix(in srgb, var(--gc-text-muted) 14%, transparent)",
              color: "var(--gc-text-muted)",
            }}
          >
            Missing
          </span>
        ),
    },
    {
      key: "beneficial_owners",
      label: "Owners",
      align: "right",
      width: 80,
      render: (v) => formatNumber(Number(v) || 0),
    },
  ];
  return (
    <GCDataTable
      columns={cols}
      data={rows}
      searchable
      searchPlaceholder="Search agents by name..."
      pageSize={25}
    />
  );
}

// ─── Formation Guide tab ─────────────────────────────────────────────────
function FormationGuideTab() {
  // Illinois is the founder's home state and the most common formation
  // jurisdiction for new agents on the platform — defaulting here saves the
  // visit-then-select round-trip on first load.
  const [stateCode, setStateCode] = useState<string>("IL");
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const guide = STATE_LLC_GUIDE[stateCode];
  const stateName = STATES_LIST.find((s) => s.code === stateCode)?.name || stateCode;

  // Server-side guide endpoint is a parity contract — we render from the
  // hardcoded JSON regardless (network resilience), but firing the request
  // keeps server caches warm and lets future overrides live in the DB.
  useQuery({
    queryKey: [`/api/founders/agencies/formation-guide?state=${stateCode}`, stateCode],
    enabled: !!stateCode,
    staleTime: 60_000,
    retry: 0,
  });

  return (
    <div className="space-y-6" data-tour-id={TOUR.FOUNDERS.AGENCY_MGMT.FORMATION_GUIDE}>
      <div className="flex items-center gap-3 flex-wrap">
        <span style={SECTION_LABEL_STYLE}>State</span>
        <GCSelect
          value={stateCode}
          onValueChange={setStateCode}
          options={STATES_LIST.map((s) => ({ value: s.code, label: `${s.code} · ${s.name}` }))}
          width={260}
        />
        <div style={{ flex: 1 }} />
        <GCPrimaryButton
          onClick={() => setSendModalOpen(true)}
          disabled={!guide}
        >
          <Send className="w-3.5 h-3.5 mr-1.5 inline" />
          Send Guide
        </GCPrimaryButton>
      </div>
      {sendModalOpen && (
        <SendFormationGuideModal
          open={sendModalOpen}
          initialState={stateCode}
          onClose={() => setSendModalOpen(false)}
        />
      )}

      {guide ? (
        <div
          style={{
            ...CARD_STYLE,
            minHeight: "auto",
            display: "block",
          }}
        >
          <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
            <div>
              <div
                style={{
                  fontFamily: "var(--gc-font-display)",
                  fontSize: "var(--gc-text-xl)",
                  color: "var(--gc-text-primary)",
                }}
              >
                {stateName} LLC formation
              </div>
              <div
                style={{
                  fontFamily: "var(--gc-font-body)",
                  fontSize: "var(--gc-text-sm)",
                  color: "var(--gc-text-secondary)",
                  marginTop: 4,
                }}
              >
                State-specific filing details and SOS portal link.
              </div>
            </div>
            <a
              href={guide.sosUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2"
              style={{ ...OUTLINED_BUTTON_STYLE }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open {stateCode} SOS portal
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <GuideStat
              label="Filing Fee"
              value={
                guide.filingFee !== null ? `$${guide.filingFee}` : guide.feeNote || "Varies"
              }
            />
            <GuideStat label="Estimated time" value={guide.eta} />
            <GuideStat
              label="EIN application"
              value="Free · ~10 min"
              href="https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online"
            />
          </div>

          {guide.notes && (
            <div
              style={{
                padding: "var(--gc-space-3)",
                backgroundColor: "var(--gc-surface-2)",
                border: "1px solid var(--gc-border-subtle)",
                borderRadius: "var(--gc-radius-sm)",
                fontSize: "var(--gc-text-sm)",
                color: "var(--gc-text-secondary)",
                marginBottom: "var(--gc-space-4)",
              }}
            >
              <strong style={{ color: "var(--gc-text-primary)" }}>Heads up: </strong>
              {guide.notes}
            </div>
          )}

          <div className="mb-4">
            <div style={{ ...SECTION_LABEL_STYLE, marginBottom: 8 }}>Universal LLC Checklist</div>
            <ol className="space-y-2">
              {UNIVERSAL_LLC_CHECKLIST.map((step) => (
                <li
                  key={step.number}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "var(--gc-space-3)",
                    backgroundColor: "var(--gc-surface-2)",
                    border: "1px solid var(--gc-border-subtle)",
                    borderRadius: "var(--gc-radius-sm)",
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      backgroundColor: "color-mix(in srgb, var(--gc-gold) 18%, transparent)",
                      color: "var(--gc-gold)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "13px",
                      fontFamily: "var(--gc-font-display)",
                    }}
                  >
                    {step.number}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "var(--gc-font-body)",
                        fontSize: "var(--gc-text-sm)",
                        fontWeight: 600,
                        color: "var(--gc-text-primary)",
                      }}
                    >
                      {step.title}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--gc-font-body)",
                        fontSize: "var(--gc-text-sm)",
                        color: "var(--gc-text-secondary)",
                        marginTop: 2,
                        lineHeight: 1.4,
                      }}
                    >
                      {step.description}
                    </div>
                    {step.externalUrl && (
                      <a
                        href={step.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1"
                        style={{
                          color: "var(--gc-gold)",
                          fontSize: "var(--gc-text-xs)",
                          textDecoration: "none",
                        }}
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open in new tab
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

        </div>
      ) : (
        <EmptyTableBlock
          title={`No data for ${stateCode}.`}
          subtext="Pick another state from the dropdown."
        />
      )}
    </div>
  );
}

function GuideStat({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div
      style={{
        padding: "var(--gc-space-3)",
        backgroundColor: "var(--gc-surface-2)",
        border: "1px solid var(--gc-border)",
        borderRadius: "var(--gc-radius-sm)",
      }}
    >
      <div style={{ ...SECTION_LABEL_STYLE, fontSize: "10px" }}>{label}</div>
      <div
        style={{
          fontFamily: "var(--gc-font-display)",
          fontSize: "var(--gc-text-lg)",
          color: href ? "var(--gc-gold)" : "var(--gc-text-primary)",
          marginTop: 2,
        }}
      >
        {value}
      </div>
    </div>
  );
  if (href)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
        {inner}
      </a>
    );
  return inner;
}

// ─── EmptyTableBlock helper (verbatim from FoundersTeamPerformance.tsx) ──
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

// Suppress unused-import lint for icons we reserve for future tour overlays.
const _reserved = { CheckCircle2, Circle, appQueryClient };
void _reserved;
