import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  FileText,
  Heart,
  Clock,
  Cake,
  Shield,
  CreditCard,
  Building2,
  AlertTriangle,
  StickyNote,
  X,
  Pencil,
  Save,
  Eye,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  GCPageHeader,
  GCKPICard,
  GCDataTable,
  GCStatusBadge,
  GCPrimaryButton,
  GCSecondaryButton,
  GCTabs,
  GCTabsList,
  GCTabsTrigger,
  GCTabsContent,
  GC_FORM_LABEL,
  useGCTheme,
  type Column,
} from "@/components/gc";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatNumber } from "./utils/format";
import { TOUR } from "@/lib/tour/selectors";
import { csrfHeaders } from "@/lib/queryClient";

// Compact currency for KPI tiles ($1.88M / $42.3K) — full precision via
// formatCurrency stays for tables and tooltips. Mirrors Revenue + Growth.
function formatCurrencyCompact(amount: number | null | undefined): string {
  if (amount == null) return "—";
  if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (Math.abs(amount) >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return formatCurrency(amount);
}

// ─── Polish constants (mirror FoundersRevenue) ────────────────────────────
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
};

const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--gc-font-body)",
  fontSize: "var(--gc-text-xs)",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--gc-gold)",
  fontWeight: 600,
};

// ─── GC form-control class tokens (mirrors HierarchyEditModal) ────────────
// Tailwind arbitrary-value utilities (`bg-[var(...)]`) win over the shadcn
// defaults without needing `!important`. Used by every <Input>, <Textarea>,
// and Radix <Select> in BoB edit mode so visuals are 1:1 with the gold-
// standard HierarchyEditModal pattern.
const GC_INPUT_CLASSES =
  "h-10 w-full bg-[var(--gc-surface-2)] border border-[var(--gc-border)] " +
  "rounded-[var(--gc-radius-sm)] px-3 text-[var(--gc-text-primary)] " +
  "font-body text-sm placeholder:text-[var(--gc-text-muted)] " +
  "focus-visible:ring-1 focus-visible:ring-[var(--gc-gold)] focus-visible:outline-none " +
  "shadow-none";
const GC_TEXTAREA_CLASSES =
  "w-full bg-[var(--gc-surface-2)] border border-[var(--gc-border)] " +
  "rounded-[var(--gc-radius-sm)] px-3 py-2 text-[var(--gc-text-primary)] " +
  "font-body text-sm placeholder:text-[var(--gc-text-muted)] " +
  "focus-visible:ring-1 focus-visible:ring-[var(--gc-gold)] focus-visible:outline-none " +
  "shadow-none";
const GC_SELECT_TRIGGER_CLASSES =
  "h-10 w-full bg-[var(--gc-surface-2)] border border-[var(--gc-border)] " +
  "rounded-[var(--gc-radius-sm)] text-[var(--gc-text-primary)] font-body text-sm " +
  "focus:ring-1 focus:ring-[var(--gc-gold)] focus:outline-none";
const GC_SELECT_CONTENT_CLASSES =
  "bg-[var(--gc-surface)] border border-[var(--gc-border)] rounded-[var(--gc-radius-md)] " +
  "text-[var(--gc-text-primary)] font-body shadow-[var(--gc-shadow-lg)]";
const GC_SELECT_ITEM_CLASSES =
  "py-2 cursor-pointer focus:bg-[var(--gc-surface-2)] focus:text-[var(--gc-gold)] " +
  "data-[state=checked]:text-[var(--gc-gold)] data-[state=checked]:font-medium";

// ─── Enum option lists for known fields (used by GCEditSelect) ────────────
// These are stored as lowercase tokens in the DB but rendered as readable
// labels. Backend column types are free `varchar` (no DB enum), so the
// canonical option lists live here on the client; if a future schema migration
// turns these into Postgres enums, swap to importing those values directly.
const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];
const MARITAL_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "domestic_partnership", label: "Domestic Partnership" },
];
const PREFERRED_CONTACT_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "sms", label: "SMS" },
];
const SMOKER_OPTIONS = [
  { value: "non_smoker", label: "Non-smoker" },
  { value: "smoker", label: "Smoker" },
  { value: "former_smoker", label: "Former smoker" },
];
const HEALTH_CLASS_OPTIONS = [
  { value: "preferred_plus", label: "Preferred Plus" },
  { value: "preferred", label: "Preferred" },
  { value: "standard_plus", label: "Standard Plus" },
  { value: "standard", label: "Standard" },
  { value: "substandard", label: "Substandard" },
];
const PREMIUM_MODE_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semi_annual", label: "Semi-annual" },
  { value: "annual", label: "Annual" },
];
const BANK_ACCOUNT_TYPE_OPTIONS = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
];

// ─── Types ─────────────────────────────────────────────────────────────────
type TeamStatus = "on-track" | "at-risk" | "behind";

interface Team {
  id: string;
  name: string;
  manager: { id: string; firstName: string; lastName: string; email: string };
  hierarchyTitle: string | null;
  contractLevel: number;
  agentCount: number;
  clientCount: number;
  policyCount: number;
  totalPremium: number;
  avgPolicyValue: number;
  renewalRate: number;
  conversionRate: number;
  pipelineValue: number;
  status: TeamStatus;
}

interface TeamAgent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  hierarchyTitle: string | null;
  hierarchyLevel: number;
  contractLevel: number;
  isActive: boolean;
  status: string;
  clientCount: number;
  policyCount: number;
  totalPremium: number;
  retention: number;
  satisfaction: number;
}

interface AgentClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city?: string;
  state?: string;
  policyType?: string;
  monthlyPremium?: number;
  annualPremium?: number;
  policyCount: number;
  totalPremium: number;
  status: string;
}

interface PolicyRider {
  name: string;
  type?: string;
}

interface ClientPolicy {
  id: string;
  policyNumber: string;
  policyType?: string;
  type?: string;
  carrier?: string | null;
  status: string;
  coverageAmount: number;
  monthlyPremium: number;
  annualPremium: number;
  premiumMode?: string | null;
  riskClass?: string | null;
  smokerStatus?: string | null;
  effectiveDate?: string | null;
  renewalDate?: string | null;
  applicationDate?: string | null;
  issueDate?: string | null;
  startDate?: string | null;
  nextPaymentDate?: string | null;
  beneficiary?: { name: string; relationship: string | null } | null;
  beneficiaryName?: string | null;
  beneficiaryRelationship?: string | null;
  beneficiaryDob?: string | null;
  beneficiaryPhone?: string | null;
  beneficiaryEmail?: string | null;
  beneficiarySsnMasked?: string | null;
  contingentBeneficiaryName?: string | null;
  contingentBeneficiaryRelationship?: string | null;
  contingentBeneficiaryPhone?: string | null;
  contingentBeneficiaryEmail?: string | null;
  riders?: PolicyRider[];
  agentNotes?: string | null;
  lastContactDate?: string | null;
}

interface ClientDetail {
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    streetAddress?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
    mailingSameAsResidence?: boolean;
    mailingStreetAddress?: string | null;
    mailingCity?: string | null;
    mailingState?: string | null;
    mailingZipCode?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    maritalStatus?: string | null;
    occupation?: string | null;
    employer?: string | null;
    annualIncome?: number | null;
    heightInches?: number | null;
    weightLbs?: number | null;
    smokerStatus?: string | null;
    healthClass?: string | null;
    medicalConditions?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    emergencyContactRelationship?: string | null;
    driversLicenseNumberMasked?: string | null;
    driversLicenseState?: string | null;
    driversLicenseExpiration?: string | null;
    ssnLast4?: string | null;
    ssnMasked?: string | null;
    bankName?: string | null;
    bankAccountType?: string | null;
    accountLast4?: string | null;
    routingMasked?: string | null;
    preferredContactMethod?: string | null;
    doNotContact?: boolean;
    agentNotes?: string | null;
    lastContactDate?: string | null;
    nextContactScheduled?: string | null;
    assignedAgentId?: string | null;
    createdAt?: string | null;
  };
  policy: ClientPolicy | null;
}

interface DocumentRow {
  id: string;
  userId: string;
  policyId: string | null;
  name: string;
  type: string | null;
  category: string | null;
  fileSize: number | null;
  s3Key: string;
  uploadedBy: string | null;
  uploadedAt: string | null;
  policyNumber: string | null;
  policyType: string | null;
  uploader: { firstName: string; lastName: string; email: string } | null;
}

// ─── Color tokens ──────────────────────────────────────────────────────────
const AGENT_STATUS_COLOR: Record<string, string> = {
  active: "var(--gc-status-active)",
  "on-leave": "var(--gc-status-review)",
  probation: "var(--gc-status-warning)",
};
const CLIENT_STATUS_COLOR: Record<string, string> = {
  active: "var(--gc-status-active)",
  pending_renewal: "var(--gc-status-pending)",
  lapsed: "var(--gc-status-warning)",
  new: "var(--gc-status-review)",
};
const POLICY_TYPE_COLOR: Record<string, string> = {
  IUL: "var(--gc-gold)",
  "Whole Life": "var(--gc-status-active)",
  "Term Life": "var(--gc-chart-2)",
  Annuity: "var(--gc-status-review)",
  "Final Expense": "var(--gc-text-muted)",
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function mapTeamStatus(s: TeamStatus): "active" | "pending" | "terminated" {
  if (s === "on-track") return "active";
  if (s === "at-risk") return "pending";
  return "terminated";
}

function initials(first?: string, last?: string) {
  const a = (first || "").trim().charAt(0).toUpperCase();
  const b = (last || "").trim().charAt(0).toUpperCase();
  return `${a}${b}` || "—";
}

function formatDateMaybe(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  const yr = Math.floor(day / 365);
  return `${yr}y ago`;
}

function formatBytes(n: number | null | undefined): string {
  if (n === null || n === undefined) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

const LEVEL_TRANSITION = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as const },
};

// ─── Page ──────────────────────────────────────────────────────────────────
export default function FoundersBookOfBusiness() {
  const { theme } = useGCTheme();
  const queryClient = useQueryClient();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const [agentSearch, setAgentSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState<"all" | "active" | "on-leave" | "probation">("all");
  const [clientSearch, setClientSearch] = useState("");
  const [clientFilter, setClientFilter] = useState<"all" | "active" | "pending_renewal" | "lapsed" | "new">("all");

  const [editMode, setEditMode] = useState(false);

  const drawerScrollRef = useRef<HTMLDivElement>(null);

  const teamsQ = useQuery<Team[]>({
    queryKey: ["/api/founders/book/teams"],
    staleTime: 60_000,
    retry: 1,
  });

  const teamAgentsQ = useQuery<TeamAgent[]>({
    queryKey: ["/api/founders/book/teams", selectedTeamId, "agents"],
    queryFn: async () => {
      const res = await fetch(`/api/founders/book/teams/${selectedTeamId}/agents`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    enabled: !!selectedTeamId,
    staleTime: 60_000,
    retry: 1,
  });

  const agentClientsQ = useQuery<AgentClient[]>({
    queryKey: ["/api/founders/book/agents", selectedAgentId, "clients"],
    queryFn: async () => {
      const res = await fetch(`/api/founders/book/agents/${selectedAgentId}/clients`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    enabled: !!selectedAgentId,
    staleTime: 60_000,
    retry: 1,
  });

  const clientDetailQ = useQuery<ClientDetail>({
    queryKey: ["/api/founders/book/clients", selectedClientId],
    queryFn: async () => {
      const res = await fetch(`/api/founders/book/clients/${selectedClientId}`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    enabled: !!selectedClientId,
    staleTime: 60_000,
    retry: 1,
  });

  const saveClientMutation = useMutation({
    mutationFn: async (payload: {
      client?: Partial<ClientDetail["client"]>;
      policy?: Partial<NonNullable<ClientDetail["policy"]>>;
      ssn?: string;
      accountNumber?: string;
      routingNumber?: string;
      driversLicenseNumber?: string;
      beneficiarySsn?: string;
    }) => {
      if (!selectedClientId) throw new Error("No client selected");
      const res = await fetch(`/api/founders/book/clients/${selectedClientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`HTTP ${res.status}: ${errBody}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/founders/book/clients", selectedClientId] });
      queryClient.invalidateQueries({ queryKey: ["/api/founders/book/agents", selectedAgentId, "clients"] });
      setEditMode(false);
    },
  });

  const teams = teamsQ.data ?? [];
  const totalClients = useMemo(() => teams.reduce((acc, t) => acc + (t.clientCount || 0), 0), [teams]);
  const totalPolicies = useMemo(() => teams.reduce((acc, t) => acc + (t.policyCount || 0), 0), [teams]);
  const totalPremium = useMemo(() => teams.reduce((acc, t) => acc + (t.totalPremium || 0), 0), [teams]);
  const renewalRate = useMemo(() => {
    if (teams.length === 0) return 0;
    const sum = teams.reduce((acc, t) => acc + (t.renewalRate || 0), 0);
    return sum / teams.length;
  }, [teams]);

  const selectedTeam = useMemo(
    () => (selectedTeamId ? teams.find((t) => t.id === selectedTeamId) : undefined),
    [teams, selectedTeamId],
  );

  const selectedAgent = useMemo(
    () => (teamAgentsQ.data && selectedAgentId
      ? teamAgentsQ.data.find((a) => a.id === selectedAgentId)
      : undefined),
    [teamAgentsQ.data, selectedAgentId],
  );

  const filteredAgents = useMemo(() => {
    const list = teamAgentsQ.data ?? [];
    return list.filter((a) => {
      if (agentFilter !== "all" && a.status !== agentFilter) return false;
      if (agentSearch) {
        const q = agentSearch.toLowerCase();
        const hay = `${a.firstName} ${a.lastName} ${a.email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [teamAgentsQ.data, agentFilter, agentSearch]);

  const filteredClients = useMemo(() => {
    const list = agentClientsQ.data ?? [];
    return list.filter((c) => {
      if (clientFilter !== "all" && c.status !== clientFilter) return false;
      if (clientSearch) {
        const q = clientSearch.toLowerCase();
        const hay = `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [agentClientsQ.data, clientFilter, clientSearch]);

  // Hard-fail the page only if EVERY core query errors. Per-section components
  // already render their own loading/empty/error states, so a single failing
  // endpoint shouldn't blank the whole drilldown.
  const allErrored = !!(
    teamsQ.error &&
    (selectedTeamId ? teamAgentsQ.error : true) &&
    (selectedAgentId ? agentClientsQ.error : true) &&
    (selectedClientId ? clientDetailQ.error : true)
  );
  const firstError =
    teamsQ.error ||
    teamAgentsQ.error ||
    agentClientsQ.error ||
    clientDetailQ.error;

  // Scroll drawer to top whenever depth changes.
  useEffect(() => {
    drawerScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedAgentId, selectedClientId]);

  const closeDrawer = () => {
    setSelectedTeamId(null);
    setSelectedAgentId(null);
    setSelectedClientId(null);
    setAgentSearch("");
    setAgentFilter("all");
    setClientSearch("");
    setClientFilter("all");
    setEditMode(false);
  };

  const openTeam = (id: string) => {
    setSelectedTeamId(id);
    setSelectedAgentId(null);
    setSelectedClientId(null);
    setAgentSearch("");
    setAgentFilter("all");
    setEditMode(false);
  };

  const openAgent = (id: string) => {
    setSelectedAgentId(id);
    setSelectedClientId(null);
    setClientSearch("");
    setClientFilter("all");
    setEditMode(false);
  };

  const openClient = (id: string) => {
    setSelectedClientId(id);
    setEditMode(false);
  };
  const backToTeam = () => {
    setSelectedAgentId(null);
    setSelectedClientId(null);
    setClientSearch("");
    setClientFilter("all");
    setEditMode(false);
  };
  const backToAgent = () => {
    setSelectedClientId(null);
    setEditMode(false);
  };

  // Decide which level is active.
  const level: 1 | 2 | 3 = selectedClientId ? 3 : selectedAgentId ? 2 : 1;

  // ─── Page layout columns ───
  const teamCols: Column<Team>[] = [
    {
      key: "name",
      label: "Team",
      sortable: true,
      width: "20%",
      render: (_v, row) => (
        <button
          onClick={() => openTeam(row.id)}
          style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}
          data-testid={`book-team-row-${row.id}`}
        >
          <span className="flex flex-col">
            <span style={{ fontWeight: 500, color: "var(--gc-gold)" }}>{row.name}</span>
            <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>
              {row.manager.firstName} {row.manager.lastName}
            </span>
          </span>
        </button>
      ),
    },
    { key: "manager", label: "Manager", width: "16%", render: (_v, row) => `${row.manager.firstName} ${row.manager.lastName}` },
    { key: "agentCount", label: "Agents", sortable: true, align: "right", width: "9%", render: (v) => formatNumber(Number(v)) },
    { key: "clientCount", label: "Clients", sortable: true, align: "right", width: "9%", render: (v) => formatNumber(Number(v)) },
    { key: "policyCount", label: "Policies", sortable: true, align: "right", width: "9%", render: (v) => formatNumber(Number(v)) },
    { key: "totalPremium", label: "Total Premium", sortable: true, align: "right", width: "13%", render: (v) => formatCurrency(Number(v)) },
    { key: "renewalRate", label: "Renewal", sortable: true, align: "right", width: "10%", render: (v) => `${Number(v).toFixed(1)}%` },
    { key: "status", label: "Status", sortable: true, width: "14%", render: (_v, row) => <GCStatusBadge status={mapTeamStatus(row.status)} /> },
  ];

  // Page-level hard fail: only blank the page when EVERY query errors.
  if (allErrored) {
    return (
      <div>
        <div data-tour-id={TOUR.FOUNDERS.BOOK.HEADER}>
          <GCPageHeader title="Book of Business" subtitle="Teams to Agent to Client drilldown across the agency" accentUnderline />
        </div>
        <div className="py-8 text-center mt-6">
          <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-status-terminated)", marginBottom: "var(--gc-space-2)" }}>
            Unable to load book of business
          </div>
          <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
            {(firstError as Error)?.message ?? "Please try again."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div data-tour-id={TOUR.FOUNDERS.BOOK.HEADER}>
        <GCPageHeader title="Book of Business" subtitle="Teams to Agent to Client drilldown across the agency" accentUnderline />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-6 items-stretch" data-tour-id={TOUR.FOUNDERS.BOOK.KPI_GRID}>
        {teamsQ.isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[116px] w-full" />)
          : <>
              <GCKPICard label="Total Clients" value={formatNumber(totalClients)} accentTop />
              <GCKPICard label="Active Policies" value={formatNumber(totalPolicies)} accentTop />
              <GCKPICard label="Total Premium" value={formatCurrencyCompact(totalPremium)} accentTop />
              <GCKPICard label="Renewal Rate" value={`${renewalRate.toFixed(1)}%`} accentTop />
            </>}
      </div>

      <section
        aria-labelledby="founders-book-teams-heading"
        className="mb-6"
        data-tour-id={TOUR.FOUNDERS.BOOK.TEAMS_TABLE}
      >
        <h2 id="founders-book-teams-heading" className="mb-3" style={{ ...SECTION_LABEL_STYLE, margin: 0, marginBottom: "0.75rem" }}>Teams</h2>
        {teamsQ.isLoading ? (
          <Skeleton className="h-[280px] w-full" />
        ) : teams.length === 0 ? (
          <EmptyTableBlock
            title="No teams yet."
            subtext="Add managers from the Hierarchy tab in HCMS to populate this view."
          />
        ) : (
          <GCDataTable columns={teamCols} data={teams} searchable searchPlaceholder="Search teams..." />
        )}
      </section>

      {/* ─── Drawer ─── */}
      <Sheet open={selectedTeamId !== null} onOpenChange={(open) => { if (!open) closeDrawer(); }}>
        <SheetContent
          side="right"
          className="w-[560px] sm:max-w-[560px] p-0 overflow-hidden flex flex-col [&>button]:hidden border-l"
          style={{
            backgroundColor: "var(--gc-bg)",
            borderColor: "var(--gc-border)",
            color: "var(--gc-text-primary)",
          }}
          data-theme={theme}
        >
          <div ref={drawerScrollRef} className="flex-1 overflow-y-auto" data-theme={theme} style={{ backgroundColor: "var(--gc-bg)" }}>
            <AnimatePresence mode="wait" initial={false}>
              {level === 1 && selectedTeam && (
                <motion.div key="L1" {...LEVEL_TRANSITION} data-tour-id={TOUR.FOUNDERS.BOOK.DRAWER_TEAM}>
                  <DrawerHeader
                    icon={<Users className="w-6 h-6" />}
                    title={selectedTeam.name}
                    subtitle={`Managed by ${selectedTeam.manager.firstName} ${selectedTeam.manager.lastName}`}
                    onClose={closeDrawer}
                    rightBadge={<GCStatusBadge status={mapTeamStatus(selectedTeam.status)} />}
                    stats={[
                      { label: "Agents", value: formatNumber(selectedTeam.agentCount) },
                      { label: "Clients", value: formatNumber(selectedTeam.clientCount) },
                      { label: "Premium", value: formatCurrency(selectedTeam.totalPremium) },
                      { label: "Renewal", value: `${selectedTeam.renewalRate.toFixed(1)}%` },
                    ]}
                  />

                  <DrawerBody>
                    <div className="flex flex-col gap-3 mb-4">
                      <Input
                        value={agentSearch}
                        onChange={(e) => setAgentSearch(e.target.value)}
                        placeholder="Search agents..."
                      />
                      <FilterPills
                        value={agentFilter}
                        options={[
                          { value: "all", label: "All" },
                          { value: "active", label: "Active" },
                          { value: "on-leave", label: "On Leave" },
                          { value: "probation", label: "Probation" },
                        ]}
                        onChange={(v) => setAgentFilter(v as typeof agentFilter)}
                      />
                    </div>

                    <SectionLabel
                      left="Team Roster"
                      right={`${filteredAgents.length} of ${teamAgentsQ.data?.length ?? 0}`}
                    />

                    {teamAgentsQ.isLoading ? (
                      <Skeleton className="h-48 w-full" />
                    ) : filteredAgents.length === 0 ? (
                      <EmptyTableBlock
                        title="No agents match your filters."
                        subtext="Adjust the search or status filter, or assign agents to this team in HCMS."
                      />
                    ) : (
                      <div className="flex flex-col gap-2">
                        {filteredAgents.map((a) => (
                          <AgentRow key={a.id} agent={a} onClick={() => openAgent(a.id)} />
                        ))}
                      </div>
                    )}
                  </DrawerBody>
                </motion.div>
              )}

              {level === 2 && selectedTeam && (
                <motion.div key="L2" {...LEVEL_TRANSITION} data-tour-id={TOUR.FOUNDERS.BOOK.DRAWER_AGENT}>
                  <DrawerHeader
                    icon={<Briefcase className="w-6 h-6" />}
                    backLabel={`Back to ${selectedTeam.name}`}
                    onBack={backToTeam}
                    title={selectedAgent ? `${selectedAgent.firstName} ${selectedAgent.lastName}` : "Agent"}
                    subtitle="Book of Business"
                    onClose={closeDrawer}
                    rightBadge={selectedAgent ? <GCStatusBadge status={selectedAgent.status} /> : undefined}
                    stats={selectedAgent ? [
                      { label: "Clients", value: formatNumber(selectedAgent.clientCount) },
                      { label: "Premium", value: formatCurrency(selectedAgent.totalPremium) },
                      { label: "Retention", value: `${(selectedAgent.retention || 0).toFixed(0)}%` },
                      { label: "Satisfaction", value: `${(selectedAgent.satisfaction || 0).toFixed(0)}%` },
                    ] : undefined}
                  />

                  <DrawerBody>
                    <div className="flex flex-col gap-3 mb-4">
                      <Input
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        placeholder="Search clients..."
                      />
                      <FilterPills
                        value={clientFilter}
                        options={[
                          { value: "all", label: "All" },
                          { value: "active", label: "Active" },
                          { value: "pending_renewal", label: "Pending Renewal" },
                          { value: "lapsed", label: "Lapsed" },
                          { value: "new", label: "New" },
                        ]}
                        onChange={(v) => setClientFilter(v as typeof clientFilter)}
                      />
                    </div>

                    <SectionLabel
                      left="Client Files"
                      right={`${filteredClients.length} of ${agentClientsQ.data?.length ?? 0}`}
                    />

                    {agentClientsQ.isLoading ? (
                      <Skeleton className="h-48 w-full" />
                    ) : filteredClients.length === 0 ? (
                      <EmptyTableBlock
                        title="No clients on this agent's book yet."
                        subtext="Once policies are written and assigned, they'll appear here for review."
                      />
                    ) : (
                      <div className="flex flex-col gap-2">
                        {filteredClients.map((c) => (
                          <ClientRow key={c.id} client={c} onClick={() => openClient(c.id)} />
                        ))}
                      </div>
                    )}
                  </DrawerBody>
                </motion.div>
              )}

              {level === 3 && selectedTeam && selectedAgent && (
                <motion.div key="L3" {...LEVEL_TRANSITION} data-tour-id={TOUR.FOUNDERS.BOOK.DRAWER_CLIENT}>
                  <DrawerHeader
                    icon={<User className="w-6 h-6" />}
                    backLabel={`Back to ${selectedAgent.firstName} ${selectedAgent.lastName}'s book`}
                    onBack={backToAgent}
                    title={clientDetailQ.data ? `${clientDetailQ.data.client.firstName} ${clientDetailQ.data.client.lastName}` : "Client"}
                    subtitle={
                      clientDetailQ.data?.client.city || clientDetailQ.data?.client.state
                        ? `${clientDetailQ.data?.client.city ?? ""}${clientDetailQ.data?.client.city && clientDetailQ.data?.client.state ? ", " : ""}${clientDetailQ.data?.client.state ?? ""}`
                        : "Client File"
                    }
                    onClose={closeDrawer}
                    rightBadge={
                      clientDetailQ.data?.policy
                        ? <GCStatusBadge status={String(clientDetailQ.data.policy.status)} />
                        : undefined
                    }
                    rightAction={
                      clientDetailQ.data
                        ? editMode
                          ? null
                          : (
                            <button
                              onClick={() => setEditMode(true)}
                              className="flex items-center gap-1"
                              style={{
                                background: "var(--gc-surface-2)",
                                border: "1px solid var(--gc-border)",
                                borderRadius: "var(--gc-radius-sm)",
                                padding: "4px 10px",
                                cursor: "pointer",
                                color: "var(--gc-text-primary)",
                                fontFamily: "var(--gc-font-body)",
                                fontSize: "var(--gc-text-xs)",
                              }}
                              data-testid="drawer-edit"
                            >
                              <Pencil className="w-3 h-3" /> Edit
                            </button>
                          )
                        : null
                    }
                  />

                  <DrawerBody>
                    {clientDetailQ.isLoading ? (
                      <Skeleton className="h-64 w-full" />
                    ) : clientDetailQ.data ? (
                      <ClientDetailTabs
                        data={clientDetailQ.data}
                        clientId={selectedClientId!}
                        editMode={editMode}
                        onCancel={() => setEditMode(false)}
                        onSave={(payload) => saveClientMutation.mutate(payload)}
                        saving={saveClientMutation.isPending}
                      />
                    ) : (
                      <EmptyTableBlock
                        title="Client not found."
                        subtext="The client record may have been removed or you no longer have access."
                      />
                    )}
                  </DrawerBody>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Empty state block (mirrors FoundersRevenue) ──────────────────────────
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

// ─── DrawerHeader ──────────────────────────────────────────────────────────
interface DrawerHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClose: () => void;
  backLabel?: string;
  onBack?: () => void;
  rightBadge?: ReactNode;
  rightAction?: ReactNode;
  stats?: Array<{ label: string; value: string }>;
}

function DrawerHeader({ icon, title, subtitle, onClose, backLabel, onBack, rightBadge, rightAction, stats }: DrawerHeaderProps) {
  // Publish measured header height as a CSS var so the sticky tab bar below
  // can offset its `top` value and avoid the same-z-index stacking collision
  // (Axiom finding, 2026-05-01). Cleared on unmount.
  const headerRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => {
      document.documentElement.style.setProperty(
        "--gc-drawer-header-h",
        `${el.offsetHeight}px`,
      );
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--gc-drawer-header-h");
    };
  }, []);

  return (
    <div
      ref={headerRef}
      className="sticky top-0 z-20"
      style={{
        backgroundColor: "var(--gc-surface)",
        borderBottom: "1px solid var(--gc-border)",
        padding: "var(--gc-space-6)",
      }}
    >
      {backLabel && onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1 mb-3"
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            color: "var(--gc-text-muted)",
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-sm)",
          }}
          data-testid="drawer-back"
        >
          <ChevronLeft className="w-4 h-4" />
          {backLabel}
        </button>
      )}

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
          {icon}
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
                {title}
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
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {rightAction}
              {rightBadge}
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
                data-testid="drawer-close"
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
          background: "linear-gradient(90deg, var(--gc-gold), var(--gc-gold-bright), transparent)",
        }}
      />

      {/* Stats row */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mt-4">
          {stats.map((s) => (
            <div key={s.label}>
              <div
                style={{
                  fontFamily: "var(--gc-font-body)",
                  fontSize: "var(--gc-text-xs)",
                  textTransform: "uppercase",
                  letterSpacing: "var(--gc-tracking-wider)",
                  color: "var(--gc-text-muted)",
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--gc-font-display)",
                  fontSize: "var(--gc-text-lg)",
                  fontWeight: 600,
                  color: "var(--gc-text-primary)",
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DrawerBody({ children }: { children: ReactNode }) {
  return <div style={{ padding: "var(--gc-space-6)" }}>{children}</div>;
}

function SectionLabel({ left, right }: { left: string; right?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 style={{ ...SECTION_LABEL_STYLE, margin: 0 }}>{left}</h3>
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

function FilterPills<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              padding: "4px 12px",
              borderRadius: "var(--gc-radius-full)",
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-xs)",
              fontWeight: active ? 600 : 500,
              backgroundColor: active ? "var(--gc-gold)" : "var(--gc-surface)",
              color: active ? "var(--gc-btn-primary-text)" : "var(--gc-text-secondary)",
              border: `1px solid ${active ? "var(--gc-gold)" : "var(--gc-border)"}`,
              cursor: "pointer",
              transition: "all var(--gc-transition-fast)",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Row components ───────────────────────────────────────────────────────
function AgentRow({ agent, onClick }: { agent: TeamAgent; onClick: () => void }) {
  const accent = AGENT_STATUS_COLOR[agent.status] || "var(--gc-status-active)";
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-3 text-left w-full"
      style={{
        background: "var(--gc-surface)",
        border: "1px solid var(--gc-border)",
        borderLeft: `3px solid ${accent}`,
        borderRadius: "var(--gc-radius-md)",
        padding: "var(--gc-space-3) var(--gc-space-4)",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
      data-testid={`book-agent-row-${agent.id}`}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 40,
          height: 40,
          borderRadius: "var(--gc-radius-full)",
          background: "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))",
          color: "var(--gc-btn-primary-text)",
          fontFamily: "var(--gc-font-display)",
          fontSize: "var(--gc-text-sm)",
          fontWeight: 600,
        }}
      >
        {initials(agent.firstName, agent.lastName)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div
            style={{
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-sm)",
              fontWeight: 600,
              color: "var(--gc-text-primary)",
            }}
          >
            {agent.firstName} {agent.lastName}
          </div>
          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: accent }} />
        </div>
        <div
          style={{
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-xs)",
            color: "var(--gc-text-muted)",
          }}
        >
          {agent.hierarchyTitle || "Agent"} · {formatNumber(agent.clientCount)} clients · {formatCurrency(agent.totalPremium)}
        </div>
      </div>

      <GCStatusBadge status={agent.status} />
      <ChevronRight aria-hidden="true" className="w-4 h-4 flex-shrink-0" style={{ color: "var(--gc-text-muted)" }} />
    </motion.button>
  );
}

function ClientRow({ client, onClick }: { client: AgentClient; onClick: () => void }) {
  const accent = CLIENT_STATUS_COLOR[client.status] || "var(--gc-status-active)";
  const policyType = client.policyType;
  const policyColor = policyType ? POLICY_TYPE_COLOR[policyType] || "var(--gc-text-secondary)" : "var(--gc-text-secondary)";
  const monthly = client.monthlyPremium ?? (client.annualPremium ? client.annualPremium / 12 : null);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-3 text-left w-full"
      style={{
        background: "var(--gc-surface)",
        border: "1px solid var(--gc-border)",
        borderLeft: `3px solid ${accent}`,
        borderRadius: "var(--gc-radius-md)",
        padding: "var(--gc-space-3) var(--gc-space-4)",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
      data-testid={`book-client-row-${client.id}`}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: accent,
          flexShrink: 0,
        }}
      />

      <div className="flex-1 min-w-0">
        <div
          style={{
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-sm)",
            fontWeight: 600,
            color: "var(--gc-text-primary)",
          }}
        >
          {client.firstName} {client.lastName}
        </div>
        <div
          style={{
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-xs)",
            color: "var(--gc-text-muted)",
          }}
        >
          {policyType && <span style={{ color: policyColor, fontWeight: 500 }}>{policyType}</span>}
          {policyType && monthly !== null ? " · " : ""}
          {monthly !== null ? `${formatCurrency(monthly)}/mo` : ""}
          {!policyType && monthly === null ? client.email : ""}
        </div>
      </div>

      <GCStatusBadge status={client.status} />
      <ChevronRight aria-hidden="true" className="w-4 h-4 flex-shrink-0" style={{ color: "var(--gc-text-muted)" }} />
    </motion.button>
  );
}

// ─── Client detail (L3) tabs ──────────────────────────────────────────────
type SavePayload = {
  client?: Partial<ClientDetail["client"]>;
  policy?: Partial<NonNullable<ClientDetail["policy"]>>;
  ssn?: string;
  accountNumber?: string;
  routingNumber?: string;
  driversLicenseNumber?: string;
  beneficiarySsn?: string;
};

type TabKey = "identity" | "policy" | "banking" | "beneficiaries" | "documents";

// Small inline pill rendered next to a tab label, e.g. "Documents (3)".
// Background is --gc-bg (drawer surface) so the pill stays visible against
// BOTH the inactive trigger bg (transparent over --gc-surface) AND the
// active trigger bg (--gc-surface-2). Axiom finding, 2026-05-01.
function TabCountBadge({ count }: { count: number }) {
  return (
    <span
      style={{
        fontSize: 10,
        padding: "1px 6px",
        borderRadius: 999,
        backgroundColor: "var(--gc-bg)",
        color: "var(--gc-text-muted)",
        border: "1px solid var(--gc-border)",
        marginLeft: 2,
        fontWeight: 600,
      }}
    >
      {count}
    </span>
  );
}

function ClientDetailTabs({
  data,
  clientId,
  editMode,
  onCancel,
  onSave,
  saving,
}: {
  data: ClientDetail;
  clientId: string;
  editMode: boolean;
  onCancel: () => void;
  onSave: (payload: SavePayload) => void;
  saving: boolean;
}) {
  const c = data.client;
  const p = data.policy;
  const policyType = p?.policyType ?? p?.type;
  const policyColor = policyType ? POLICY_TYPE_COLOR[policyType] || "var(--gc-gold)" : "var(--gc-gold)";
  const beneficiaryName = p?.beneficiary?.name ?? p?.beneficiaryName;
  const beneficiaryRel = p?.beneficiary?.relationship ?? p?.beneficiaryRelationship;
  const effective = p?.effectiveDate ?? p?.startDate;
  const renewal = p?.renewalDate ?? p?.nextPaymentDate;
  const address =
    [c.streetAddress, c.addressLine2, c.city, c.state, c.zipCode].filter(Boolean).join(", ") || "—";

  // Active GC theme is forwarded onto every Radix SelectContent below so the
  // popover (rendered via Portal at document.body, outside the GCShell scope)
  // still inherits the gold/surface CSS vars. Mirrors HierarchyEditModal.
  const { theme } = useGCTheme();

  const [tab, setTab] = useState<TabKey>("identity");

  // ─── Tab-bar count badges ───
  // Beneficiary count = primary on file (if any) + contingent on file (if any).
  const beneficiaryCount =
    (p?.beneficiary?.name || p?.beneficiaryName ? 1 : 0) +
    (p?.contingentBeneficiaryName ? 1 : 0);

  // Documents count comes from the same query DocumentsTab uses; React Query
  // dedupes by key so this does not cause a double fetch.
  const docsCountQ = useQuery<DocumentRow[]>({
    queryKey: ["/api/founders/book/clients", clientId, "documents"],
    queryFn: async () => {
      const res = await fetch(`/api/founders/book/clients/${clientId}/documents`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    enabled: !!clientId,
    staleTime: 60_000,
    retry: 1,
  });
  const documentsCount = docsCountQ.data?.length ?? 0;

  // ─── Edit-mode local state ───
  const [form, setForm] = useState<SavePayload>({ client: {}, policy: {} });

  // Reset form whenever we toggle in/out of edit mode for a fresh client.
  useEffect(() => {
    if (editMode) setForm({ client: {}, policy: {} });
  }, [editMode, data.client.id]);

  const setClient = <K extends keyof ClientDetail["client"]>(k: K, v: ClientDetail["client"][K]) =>
    setForm((f) => ({ ...f, client: { ...f.client, [k]: v } }));
  const setPolicy = <K extends keyof NonNullable<ClientDetail["policy"]>>(k: K, v: NonNullable<ClientDetail["policy"]>[K]) =>
    setForm((f) => ({ ...f, policy: { ...f.policy, [k]: v } }));
  const setSensitive = (k: "ssn" | "accountNumber" | "routingNumber" | "driversLicenseNumber" | "beneficiarySsn", v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Helper to read field, preferring local edit value, falling back to server value.
  const cv = <K extends keyof ClientDetail["client"]>(k: K): any =>
    form.client?.[k] ?? c[k] ?? "";
  const pv = <K extends keyof NonNullable<ClientDetail["policy"]>>(k: K): any =>
    form.policy?.[k] ?? (p ? p[k] : "") ?? "";

  return (
    <div className="flex flex-col gap-4" data-testid={editMode ? "client-edit-form" : "client-detail-tabs"}>
      <GCTabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        {/*
          Sticky tab bar. Single row that horizontally scrolls (no visible
          scrollbar) on narrow viewports. Pinned just below the DrawerHeader
          via the --gc-drawer-header-h CSS var (set by DrawerHeader's
          ResizeObserver). z-index is 5 — header is 20 — so the header always
          wins the stacking order if heights ever drift.
          Right-edge fade gradient (mask-image) hints at horizontal overflow
          on narrow viewports where some tabs are scrolled off-screen.
        */}
        {/*
          Tab bar wrapped as its own GC card so its left/right edges stay
          flush with the Section cards rendered below. CARD_STYLE provides
          the bg/border/radius; we slim the padding to 4px so the trigger
          pills feel like part of a tab strip and not a full card body. The
          inner GCTabsList drops its own border (overridden inline) so we
          don't double-border. Mask still fades the right edge if the strip
          overflows on narrow viewports.
        */}
        <div
          className="sticky z-[5] backdrop-blur"
          style={{
            top: "var(--gc-drawer-header-h, 0px)",
            backgroundColor: "var(--gc-surface)",
            border: "1px solid var(--gc-border)",
            borderRadius: "var(--gc-radius-md)",
            padding: 4,
          }}
        >
          <div
            className="overflow-x-auto [&::-webkit-scrollbar]:hidden"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              maskImage:
                "linear-gradient(to right, black 0, black calc(100% - 24px), transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, black 0, black calc(100% - 24px), transparent 100%)",
            } as React.CSSProperties}
          >
            <GCTabsList
              className="flex-nowrap w-max"
              style={{
                backgroundColor: "transparent",
                border: "none",
                borderRadius: 0,
                padding: 0,
              }}
            >
              <GCTabsTrigger value="identity" data-testid="tab-identity" style={{ padding: "6px 10px" }}>
                <User className="w-3 h-3" />
                Identity
              </GCTabsTrigger>
              <GCTabsTrigger value="policy" data-testid="tab-policy" style={{ padding: "6px 10px" }}>
                <FileText className="w-3 h-3" />
                Policy
              </GCTabsTrigger>
              <GCTabsTrigger value="banking" data-testid="tab-banking" style={{ padding: "6px 10px" }}>
                <CreditCard className="w-3 h-3" />
                Banking
              </GCTabsTrigger>
              <GCTabsTrigger value="beneficiaries" data-testid="tab-beneficiaries" style={{ padding: "6px 10px" }}>
                <Heart className="w-3 h-3" />
                Beneficiaries
                {beneficiaryCount > 0 && <TabCountBadge count={beneficiaryCount} />}
              </GCTabsTrigger>
              <GCTabsTrigger value="documents" data-testid="tab-documents" style={{ padding: "6px 10px" }}>
                <FileText className="w-3 h-3" />
                Documents
                {documentsCount > 0 && <TabCountBadge count={documentsCount} />}
              </GCTabsTrigger>
            </GCTabsList>
          </div>
        </div>

        {/* ─── IDENTITY ─── */}
        <GCTabsContent value="identity">
          <div className="flex flex-col gap-4">
            {editMode ? (
              <>
                <Section title="Identity & Contact" icon={<User className="w-3 h-3" />}>
                  <FormGrid cols={2}>
                    <FormField label="First Name">
                      <Input className={GC_INPUT_CLASSES} value={cv("firstName")} onChange={(e) => setClient("firstName", e.target.value)} />
                    </FormField>
                    <FormField label="Last Name">
                      <Input className={GC_INPUT_CLASSES} value={cv("lastName")} onChange={(e) => setClient("lastName", e.target.value)} />
                    </FormField>
                    <FormField label="Email">
                      <Input className={GC_INPUT_CLASSES} type="email" value={cv("email")} onChange={(e) => setClient("email", e.target.value)} />
                    </FormField>
                    <FormField label="Phone">
                      <Input className={GC_INPUT_CLASSES} value={cv("phone")} onChange={(e) => setClient("phone", e.target.value)} />
                    </FormField>
                    <FormField label="Date of Birth">
                      <Input className={GC_INPUT_CLASSES} type="date" value={(cv("dateOfBirth") || "").slice(0, 10)} onChange={(e) => setClient("dateOfBirth", e.target.value)} />
                    </FormField>
                    <FormField label="Gender">
                      <GCEditSelect
                        theme={theme}
                        value={cv("gender")}
                        onValueChange={(v) => setClient("gender", v)}
                        options={GENDER_OPTIONS}
                        placeholder="Select gender"
                      />
                    </FormField>
                    <FormField label="Marital Status">
                      <GCEditSelect
                        theme={theme}
                        value={cv("maritalStatus")}
                        onValueChange={(v) => setClient("maritalStatus", v)}
                        options={MARITAL_OPTIONS}
                        placeholder="Select marital status"
                      />
                    </FormField>
                    <FormField label="Preferred Contact">
                      <GCEditSelect
                        theme={theme}
                        value={cv("preferredContactMethod")}
                        onValueChange={(v) => setClient("preferredContactMethod", v)}
                        options={PREFERRED_CONTACT_OPTIONS}
                        placeholder="Select method"
                      />
                    </FormField>
                  </FormGrid>
                </Section>

                <Section title="Sensitive Information" icon={<Shield className="w-3 h-3" />}>
                  <FormGrid cols={2}>
                    <FormField label={`SSN${c.ssnLast4 ? ` (on file: ***-**-${c.ssnLast4})` : ""}`}>
                      <Input
                        className={GC_INPUT_CLASSES}
                        value={form.ssn ?? ""}
                        onChange={(e) => setSensitive("ssn", e.target.value)}
                        placeholder="XXX-XX-XXXX (leave blank to keep)"
                      />
                    </FormField>
                    <FormField label="Driver's License #">
                      <Input
                        className={GC_INPUT_CLASSES}
                        value={form.driversLicenseNumber ?? ""}
                        onChange={(e) => setSensitive("driversLicenseNumber", e.target.value)}
                        placeholder={c.driversLicenseNumberMasked || "Leave blank to keep"}
                      />
                    </FormField>
                    <FormField label="DL State">
                      <Input className={GC_INPUT_CLASSES} value={cv("driversLicenseState")} onChange={(e) => setClient("driversLicenseState", e.target.value)} placeholder="FL" />
                    </FormField>
                    <FormField label="DL Expiration">
                      <Input className={GC_INPUT_CLASSES} type="date" value={(cv("driversLicenseExpiration") || "").slice(0, 10)} onChange={(e) => setClient("driversLicenseExpiration", e.target.value)} />
                    </FormField>
                  </FormGrid>
                </Section>

                <Section title="Residential Address" icon={<MapPin className="w-3 h-3" />}>
                  <FormGrid cols={2}>
                    <FormField label="Street Address" full>
                      <Input className={GC_INPUT_CLASSES} value={cv("streetAddress")} onChange={(e) => setClient("streetAddress", e.target.value)} />
                    </FormField>
                    <FormField label="Unit / Apt">
                      <Input className={GC_INPUT_CLASSES} value={cv("addressLine2")} onChange={(e) => setClient("addressLine2", e.target.value)} />
                    </FormField>
                    <FormField label="City">
                      <Input className={GC_INPUT_CLASSES} value={cv("city")} onChange={(e) => setClient("city", e.target.value)} />
                    </FormField>
                    <FormField label="State">
                      <Input className={GC_INPUT_CLASSES} value={cv("state")} onChange={(e) => setClient("state", e.target.value)} />
                    </FormField>
                    <FormField label="ZIP Code">
                      <Input className={GC_INPUT_CLASSES} value={cv("zipCode")} onChange={(e) => setClient("zipCode", e.target.value)} />
                    </FormField>
                  </FormGrid>
                </Section>

                <Section title="Employment & Health" icon={<Building2 className="w-3 h-3" />}>
                  <FormGrid cols={2}>
                    <FormField label="Occupation">
                      <Input className={GC_INPUT_CLASSES} value={cv("occupation")} onChange={(e) => setClient("occupation", e.target.value)} />
                    </FormField>
                    <FormField label="Employer">
                      <Input className={GC_INPUT_CLASSES} value={cv("employer")} onChange={(e) => setClient("employer", e.target.value)} />
                    </FormField>
                    <FormField label="Annual Income ($)">
                      <Input className={GC_INPUT_CLASSES} type="number" value={cv("annualIncome") || ""} onChange={(e) => setClient("annualIncome", Number(e.target.value) || null)} />
                    </FormField>
                    <FormField label="Smoker Status">
                      <GCEditSelect
                        theme={theme}
                        value={cv("smokerStatus")}
                        onValueChange={(v) => setClient("smokerStatus", v)}
                        options={SMOKER_OPTIONS}
                        placeholder="Select smoker status"
                      />
                    </FormField>
                    <FormField label="Health Class">
                      <GCEditSelect
                        theme={theme}
                        value={cv("healthClass")}
                        onValueChange={(v) => setClient("healthClass", v)}
                        options={HEALTH_CLASS_OPTIONS}
                        placeholder="Select health class"
                      />
                    </FormField>
                    <FormField label="Height (in)">
                      <Input className={GC_INPUT_CLASSES} type="number" value={cv("heightInches") || ""} onChange={(e) => setClient("heightInches", Number(e.target.value) || null)} />
                    </FormField>
                    <FormField label="Weight (lbs)">
                      <Input className={GC_INPUT_CLASSES} type="number" value={cv("weightLbs") || ""} onChange={(e) => setClient("weightLbs", Number(e.target.value) || null)} />
                    </FormField>
                    <FormField label="Medical Conditions" full>
                      <Textarea className={GC_TEXTAREA_CLASSES} value={cv("medicalConditions")} onChange={(e) => setClient("medicalConditions", e.target.value)} rows={3} />
                    </FormField>
                  </FormGrid>
                </Section>

                <Section title="Emergency Contact" icon={<AlertTriangle className="w-3 h-3" />}>
                  <FormGrid cols={2}>
                    <FormField label="Name">
                      <Input className={GC_INPUT_CLASSES} value={cv("emergencyContactName")} onChange={(e) => setClient("emergencyContactName", e.target.value)} />
                    </FormField>
                    <FormField label="Phone">
                      <Input className={GC_INPUT_CLASSES} value={cv("emergencyContactPhone")} onChange={(e) => setClient("emergencyContactPhone", e.target.value)} />
                    </FormField>
                    <FormField label="Relationship">
                      <Input className={GC_INPUT_CLASSES} value={cv("emergencyContactRelationship")} onChange={(e) => setClient("emergencyContactRelationship", e.target.value)} />
                    </FormField>
                  </FormGrid>
                </Section>

                <Section title="Agent Notes" icon={<StickyNote className="w-3 h-3" />}>
                  <FormGrid cols={1}>
                    <FormField label="Notes" full>
                      <Textarea className={GC_TEXTAREA_CLASSES} value={cv("agentNotes")} onChange={(e) => setClient("agentNotes", e.target.value)} rows={4} />
                    </FormField>
                    <FormField label="Last Contact Date">
                      <Input className={GC_INPUT_CLASSES} type="date" value={(cv("lastContactDate") || "").slice(0, 10)} onChange={(e) => setClient("lastContactDate", e.target.value)} />
                    </FormField>
                    <FormField label="Next Contact Scheduled">
                      <Input className={GC_INPUT_CLASSES} type="date" value={(cv("nextContactScheduled") || "").slice(0, 10)} onChange={(e) => setClient("nextContactScheduled", e.target.value)} />
                    </FormField>
                  </FormGrid>
                </Section>
              </>
            ) : (
              <>
                <Section title="Personal Information" icon={<User className="w-3 h-3" />}>
                  <FormGrid cols={2}>
                    <DetailRow icon={<Cake className="w-3 h-3" />} label="Date of Birth" value={formatDateMaybe(c.dateOfBirth)} />
                    <DetailRow label="Gender" value={c.gender || "—"} />
                    <DetailRow label="Marital Status" value={c.maritalStatus || "—"} />
                    <DetailRow icon={<Phone className="w-3 h-3" />} label="Phone" value={c.phone || "—"} />
                    <DetailRow icon={<Mail className="w-3 h-3" />} label="Email" value={c.email || "—"} />
                    <DetailRow label="Preferred Contact" value={c.preferredContactMethod || "—"} />
                    <DetailRow icon={<MapPin className="w-3 h-3" />} label="Address" value={address} />
                    <DetailRow label="Member Since" value={formatDateMaybe(c.createdAt)} />
                  </FormGrid>
                </Section>

                <Section title="Sensitive Information" icon={<Shield className="w-3 h-3" />}>
                  <FormGrid cols={2}>
                    <DetailRow label="SSN" value={c.ssnMasked || (c.ssnLast4 ? `***-**-${c.ssnLast4}` : "—")} />
                    <DetailRow label="Driver's License" value={c.driversLicenseNumberMasked || "—"} />
                    <DetailRow label="DL State" value={c.driversLicenseState || "—"} />
                    <DetailRow label="DL Expiration" value={formatDateMaybe(c.driversLicenseExpiration)} />
                  </FormGrid>
                </Section>

                <Section title="Employment & Health" icon={<Building2 className="w-3 h-3" />}>
                  <FormGrid cols={2}>
                    <DetailRow label="Occupation" value={c.occupation || "—"} />
                    <DetailRow label="Employer" value={c.employer || "—"} />
                    <DetailRow label="Annual Income" value={c.annualIncome ? formatCurrency(c.annualIncome) : "—"} />
                    <DetailRow label="Smoker Status" value={c.smokerStatus || "—"} />
                    <DetailRow label="Health Class" value={c.healthClass || "—"} />
                    <DetailRow
                      label="Height / Weight"
                      value={
                        c.heightInches || c.weightLbs
                          ? `${c.heightInches ? `${Math.floor(c.heightInches / 12)}'${c.heightInches % 12}"` : "—"} · ${c.weightLbs ? `${c.weightLbs} lbs` : "—"}`
                          : "—"
                      }
                    />
                    {c.medicalConditions && (
                      <div className="col-span-2">
                        <DetailRow label="Medical Notes" value={c.medicalConditions} />
                      </div>
                    )}
                  </FormGrid>
                </Section>

                {(c.emergencyContactName || c.emergencyContactPhone) && (
                  <Section title="Emergency Contact" icon={<AlertTriangle className="w-3 h-3" />}>
                    <FormGrid cols={2}>
                      <DetailRow label="Name" value={c.emergencyContactName || "—"} />
                      <DetailRow label="Phone" value={c.emergencyContactPhone || "—"} />
                      <DetailRow label="Relationship" value={c.emergencyContactRelationship || "—"} />
                    </FormGrid>
                  </Section>
                )}

                {(c.agentNotes) && (
                  <Section title="Agent Notes" icon={<StickyNote className="w-3 h-3" />}>
                    <div
                      style={{
                        fontFamily: "var(--gc-font-body)",
                        fontSize: "var(--gc-text-sm)",
                        color: "var(--gc-text-primary)",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {c.agentNotes}
                    </div>
                  </Section>
                )}
              </>
            )}
          </div>
        </GCTabsContent>

        {/* ─── POLICY ─── */}
        <GCTabsContent value="policy">
          <div className="flex flex-col gap-4">
            {editMode ? (
              <Section title="Policy Details" icon={<FileText className="w-3 h-3" />}>
                <FormGrid cols={2}>
                  <FormField label="Policy Type">
                    <Input className={GC_INPUT_CLASSES} value={pv("policyType") || pv("type")} onChange={(e) => setPolicy("policyType", e.target.value)} />
                  </FormField>
                  <FormField label="Carrier">
                    <Input className={GC_INPUT_CLASSES} value={pv("carrier")} onChange={(e) => setPolicy("carrier", e.target.value)} />
                  </FormField>
                  <FormField label="Coverage Amount">
                    <Input className={GC_INPUT_CLASSES} type="number" value={pv("coverageAmount") || ""} onChange={(e) => setPolicy("coverageAmount", Number(e.target.value) || 0)} />
                  </FormField>
                  <FormField label="Monthly Premium">
                    <Input className={GC_INPUT_CLASSES} type="number" step="0.01" value={pv("monthlyPremium") || ""} onChange={(e) => setPolicy("monthlyPremium", Number(e.target.value) || 0)} />
                  </FormField>
                  <FormField label="Premium Mode">
                    <GCEditSelect
                      theme={theme}
                      value={pv("premiumMode")}
                      onValueChange={(v) => setPolicy("premiumMode", v)}
                      options={PREMIUM_MODE_OPTIONS}
                      placeholder="Select premium mode"
                    />
                  </FormField>
                  <FormField label="Risk Class">
                    <Input className={GC_INPUT_CLASSES} value={pv("riskClass")} onChange={(e) => setPolicy("riskClass", e.target.value)} />
                  </FormField>
                  <FormField label="Effective Date">
                    <Input className={GC_INPUT_CLASSES} type="date" value={(pv("effectiveDate") || "").slice(0, 10)} onChange={(e) => setPolicy("effectiveDate", e.target.value)} />
                  </FormField>
                  <FormField label="Renewal Date">
                    <Input className={GC_INPUT_CLASSES} type="date" value={(pv("renewalDate") || "").slice(0, 10)} onChange={(e) => setPolicy("renewalDate", e.target.value)} />
                  </FormField>
                  <FormField label="Application Date">
                    <Input className={GC_INPUT_CLASSES} type="date" value={(pv("applicationDate") || "").slice(0, 10)} onChange={(e) => setPolicy("applicationDate", e.target.value)} />
                  </FormField>
                  <FormField label="Issue Date">
                    <Input className={GC_INPUT_CLASSES} type="date" value={(pv("issueDate") || "").slice(0, 10)} onChange={(e) => setPolicy("issueDate", e.target.value)} />
                  </FormField>
                  <FormField label="Status">
                    <Input className={GC_INPUT_CLASSES} value={pv("status")} onChange={(e) => setPolicy("status", e.target.value)} />
                  </FormField>
                </FormGrid>
              </Section>
            ) : p ? (
              <>
                <Section
                  title="Policy Details"
                  icon={<FileText className="w-3 h-3" />}
                  rightAction={
                    <div className="text-right">
                      <span
                        style={{
                          fontFamily: "var(--gc-font-display)",
                          fontSize: "var(--gc-text-xl)",
                          fontWeight: 600,
                          color: "var(--gc-gold)",
                        }}
                      >
                        {formatCurrency(p.annualPremium || 0)}
                      </span>
                      <span style={{ color: "var(--gc-text-muted)", fontSize: "var(--gc-text-xs)", marginLeft: 4 }}>/yr</span>
                    </div>
                  }
                >
                  <FormGrid cols={2}>
                    <DetailRow
                      label="Policy Type"
                      value={<span style={{ color: policyColor, fontWeight: 600 }}>{policyType || "—"}</span>}
                    />
                    <DetailRow label="Carrier" value={p.carrier || "Heritage Life"} />
                    <DetailRow label="Policy Number" value={p.policyNumber || "—"} />
                    <DetailRow label="Risk Class" value={p.riskClass || "—"} />
                    <DetailRow label="Coverage Amount" value={formatCurrency(p.coverageAmount)} />
                    <DetailRow label="Monthly Premium" value={formatCurrency(p.monthlyPremium)} />
                    <DetailRow label="Annual Premium" value={formatCurrency(p.annualPremium)} />
                    <DetailRow label="Premium Mode" value={p.premiumMode || "monthly"} />
                    <DetailRow label="Application Date" value={formatDateMaybe(p.applicationDate)} />
                    <DetailRow label="Issue Date" value={formatDateMaybe(p.issueDate)} />
                    <DetailRow label="Effective Date" value={formatDateMaybe(effective)} />
                    <DetailRow label="Renewal Date" value={formatDateMaybe(renewal)} />
                    <DetailRow label="Status" value={<GCStatusBadge status={String(p.status)} />} />
                  </FormGrid>
                </Section>

                {p.riders && p.riders.length > 0 && (
                  <Section title="Policy Riders" icon={<Shield className="w-3 h-3" />}>
                    <div className="flex flex-wrap gap-2">
                      {p.riders.map((r, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "var(--gc-radius-sm)",
                            background: "var(--gc-surface-2)",
                            border: "1px solid var(--gc-border)",
                            fontFamily: "var(--gc-font-body)",
                            fontSize: "var(--gc-text-xs)",
                            color: "var(--gc-text-primary)",
                          }}
                        >
                          {r.name}{r.type ? ` (${r.type})` : ""}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                <Section title="Timeline" icon={<Clock className="w-3 h-3" />}>
                  <FormGrid cols={2}>
                    <DetailRow label="Last Contact" value={formatDateMaybe(c.lastContactDate || p.lastContactDate)} />
                    <DetailRow label="Next Scheduled" value={formatDateMaybe(c.nextContactScheduled)} />
                    <DetailRow label="Policy Effective" value={formatDateMaybe(effective)} />
                    <DetailRow label="Next Renewal" value={formatDateMaybe(renewal)} />
                  </FormGrid>
                </Section>
              </>
            ) : (
              <EmptyTableBlock
                title="No policy on file."
                subtext="Once this client's application is submitted and issued, the policy will appear here."
              />
            )}
          </div>
        </GCTabsContent>

        {/* ─── BANKING ─── */}
        <GCTabsContent value="banking">
          <div className="flex flex-col gap-4">
            {editMode ? (
              <Section title="Banking & Direct Deposit" icon={<CreditCard className="w-3 h-3" />}>
                <FormGrid cols={2}>
                  <FormField label="Bank Name">
                    <Input className={GC_INPUT_CLASSES} value={cv("bankName")} onChange={(e) => setClient("bankName", e.target.value)} />
                  </FormField>
                  <FormField label="Account Type">
                    <GCEditSelect
                      theme={theme}
                      value={cv("bankAccountType")}
                      onValueChange={(v) => setClient("bankAccountType", v)}
                      options={BANK_ACCOUNT_TYPE_OPTIONS}
                      placeholder="Select account type"
                    />
                  </FormField>
                  <FormField label="Routing Number">
                    <Input
                      className={GC_INPUT_CLASSES}
                      value={form.routingNumber ?? ""}
                      onChange={(e) => setSensitive("routingNumber", e.target.value)}
                      placeholder={c.routingMasked || "Leave blank to keep"}
                    />
                  </FormField>
                  <FormField label={`Account Number${c.accountLast4 ? ` (on file: ****${c.accountLast4})` : ""}`}>
                    <Input
                      className={GC_INPUT_CLASSES}
                      value={form.accountNumber ?? ""}
                      onChange={(e) => setSensitive("accountNumber", e.target.value)}
                      placeholder="Leave blank to keep"
                    />
                  </FormField>
                </FormGrid>
              </Section>
            ) : c.bankName || c.accountLast4 || c.routingMasked ? (
              <Section title="Banking & Direct Deposit" icon={<CreditCard className="w-3 h-3" />}>
                <FormGrid cols={2}>
                  <DetailRow label="Bank" value={c.bankName || "—"} />
                  <DetailRow label="Account Type" value={c.bankAccountType || "—"} />
                  <DetailRow label="Routing Number" value={c.routingMasked || "—"} />
                  <DetailRow label="Account Number" value={c.accountLast4 ? `****${c.accountLast4}` : "—"} />
                </FormGrid>
              </Section>
            ) : (
              <EmptyTableBlock
                title="No banking details on file."
                subtext="Click Edit above to add the client's bank, routing, and account information for direct draft."
              />
            )}
          </div>
        </GCTabsContent>

        {/* ─── BENEFICIARIES ─── */}
        <GCTabsContent value="beneficiaries">
          <div className="flex flex-col gap-4">
            {editMode ? (
              <>
                <Section title="Primary Beneficiary" icon={<Heart className="w-3 h-3" />}>
                  <FormGrid cols={2}>
                    <FormField label="Name">
                      <Input className={GC_INPUT_CLASSES} value={pv("beneficiaryName")} onChange={(e) => setPolicy("beneficiaryName", e.target.value)} />
                    </FormField>
                    <FormField label="Relationship">
                      <Input className={GC_INPUT_CLASSES} value={pv("beneficiaryRelationship")} onChange={(e) => setPolicy("beneficiaryRelationship", e.target.value)} />
                    </FormField>
                    <FormField label="Phone">
                      <Input className={GC_INPUT_CLASSES} value={pv("beneficiaryPhone")} onChange={(e) => setPolicy("beneficiaryPhone", e.target.value)} />
                    </FormField>
                    <FormField label="Email">
                      <Input className={GC_INPUT_CLASSES} type="email" value={pv("beneficiaryEmail")} onChange={(e) => setPolicy("beneficiaryEmail", e.target.value)} />
                    </FormField>
                    <FormField label="Date of Birth">
                      <Input className={GC_INPUT_CLASSES} type="date" value={(pv("beneficiaryDob") || "").slice(0, 10)} onChange={(e) => setPolicy("beneficiaryDob", e.target.value)} />
                    </FormField>
                    <FormField label="SSN">
                      <Input
                        className={GC_INPUT_CLASSES}
                        value={form.beneficiarySsn ?? ""}
                        onChange={(e) => setSensitive("beneficiarySsn", e.target.value)}
                        placeholder={p?.beneficiarySsnMasked || "Leave blank to keep"}
                      />
                    </FormField>
                  </FormGrid>
                </Section>

                <Section title="Contingent Beneficiary" icon={<Heart className="w-3 h-3" />}>
                  <FormGrid cols={2}>
                    <FormField label="Name">
                      <Input className={GC_INPUT_CLASSES} value={pv("contingentBeneficiaryName")} onChange={(e) => setPolicy("contingentBeneficiaryName", e.target.value)} />
                    </FormField>
                    <FormField label="Relationship">
                      <Input className={GC_INPUT_CLASSES} value={pv("contingentBeneficiaryRelationship")} onChange={(e) => setPolicy("contingentBeneficiaryRelationship", e.target.value)} />
                    </FormField>
                    <FormField label="Phone">
                      <Input className={GC_INPUT_CLASSES} value={pv("contingentBeneficiaryPhone")} onChange={(e) => setPolicy("contingentBeneficiaryPhone", e.target.value)} />
                    </FormField>
                    <FormField label="Email">
                      <Input className={GC_INPUT_CLASSES} type="email" value={pv("contingentBeneficiaryEmail")} onChange={(e) => setPolicy("contingentBeneficiaryEmail", e.target.value)} />
                    </FormField>
                  </FormGrid>
                </Section>
              </>
            ) : (beneficiaryName || beneficiaryRel || p?.beneficiaryPhone || p?.beneficiaryEmail || p?.contingentBeneficiaryName) ? (
              <>
                {(beneficiaryName || beneficiaryRel || p?.beneficiaryPhone || p?.beneficiaryEmail) && (
                  <Section title="Primary Beneficiary" icon={<Heart className="w-3 h-3" />}>
                    <FormGrid cols={2}>
                      <DetailRow label="Name" value={beneficiaryName || "—"} />
                      <DetailRow label="Relationship" value={beneficiaryRel || "—"} />
                      <DetailRow label="Date of Birth" value={formatDateMaybe(p?.beneficiaryDob)} />
                      <DetailRow label="SSN" value={p?.beneficiarySsnMasked || "—"} />
                      <DetailRow label="Phone" value={p?.beneficiaryPhone || "—"} />
                      <DetailRow label="Email" value={p?.beneficiaryEmail || "—"} />
                    </FormGrid>
                  </Section>
                )}

                {(p?.contingentBeneficiaryName || p?.contingentBeneficiaryRelationship) && (
                  <Section title="Contingent Beneficiary" icon={<Heart className="w-3 h-3" />}>
                    <FormGrid cols={2}>
                      <DetailRow label="Name" value={p?.contingentBeneficiaryName || "—"} />
                      <DetailRow label="Relationship" value={p?.contingentBeneficiaryRelationship || "—"} />
                      <DetailRow label="Phone" value={p?.contingentBeneficiaryPhone || "—"} />
                      <DetailRow label="Email" value={p?.contingentBeneficiaryEmail || "—"} />
                    </FormGrid>
                  </Section>
                )}
              </>
            ) : (
              <EmptyTableBlock
                title="No beneficiaries on file."
                subtext="Capture primary and contingent beneficiaries to keep this client's policy in good order."
              />
            )}
          </div>
        </GCTabsContent>

        {/* ─── DOCUMENTS ─── */}
        <GCTabsContent value="documents">
          <DocumentsTab clientId={clientId} />
        </GCTabsContent>
      </GCTabs>

      {/* ─── Edit-mode action bar (sticky at bottom of drawer body) ─── */}
      {editMode && (
        <div
          className="sticky bottom-0 flex items-center justify-end gap-2 mt-2 py-3"
          style={{
            backgroundColor: "var(--gc-bg)",
            borderTop: "1px solid var(--gc-border)",
            zIndex: 5,
          }}
        >
          <GCSecondaryButton onClick={onCancel} disabled={saving}>
            Cancel
          </GCSecondaryButton>
          <GCPrimaryButton
            onClick={() => onSave(form)}
            disabled={saving}
            testId="drawer-save"
            icon={<Save className="w-4 h-4" />}
          >
            {saving ? "Saving..." : "Save Changes"}
          </GCPrimaryButton>
        </div>
      )}
    </div>
  );
}

// ─── Documents tab ────────────────────────────────────────────────────────
function DocumentsTab({ clientId }: { clientId: string }) {
  const docsQ = useQuery<DocumentRow[]>({
    queryKey: ["/api/founders/book/clients", clientId, "documents"],
    queryFn: async () => {
      const res = await fetch(`/api/founders/book/clients/${clientId}/documents`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    enabled: !!clientId,
    staleTime: 60_000,
    retry: 1,
  });

  const [viewing, setViewing] = useState<{ doc: DocumentRow; url: string | null; loading: boolean; error: string | null } | null>(null);
  const [docSearch, setDocSearch] = useState("");

  const openDoc = async (doc: DocumentRow) => {
    setViewing({ doc, url: null, loading: true, error: null });
    try {
      const res = await fetch(`/api/founders/book/documents/${doc.id}/url`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data?.url || typeof data.url !== "string") throw new Error("No URL returned");
      setViewing({ doc, url: data.url, loading: false, error: null });
    } catch (e) {
      setViewing({ doc, url: null, loading: false, error: (e as Error).message || "Unable to load document" });
    }
  };

  if (docsQ.isLoading) {
    return (
      <div className="flex flex-col gap-2" data-testid="documents-loading">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (docsQ.error) {
    return (
      <EmptyTableBlock
        title="Unable to load documents."
        subtext={(docsQ.error as Error)?.message || "Please try again in a moment."}
      />
    );
  }

  const docs = docsQ.data ?? [];

  if (docs.length === 0) {
    return (
      <EmptyTableBlock
        title="No documents uploaded yet."
        subtext="Agents attach policy declaration pages, applications, and other client docs from their Book of Business."
      />
    );
  }

  const q = docSearch.trim().toLowerCase();
  const filteredDocs = q
    ? docs.filter((d) => (d.name || "").toLowerCase().includes(q))
    : docs;

  return (
    <>
      <div className="flex flex-col gap-2" data-testid="documents-list">
        <Input
          value={docSearch}
          onChange={(e) => setDocSearch(e.target.value)}
          placeholder="Search documents..."
          data-testid="documents-search"
        />
        {filteredDocs.length === 0 ? (
          <div
            style={{
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-sm)",
              color: "var(--gc-text-muted)",
              padding: "var(--gc-space-3) var(--gc-space-1)",
            }}
            data-testid="documents-search-empty"
          >
            No documents match your search
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <DocumentRowItem key={doc.id} doc={doc} onOpen={() => openDoc(doc)} />
          ))
        )}
      </div>

      {viewing && (
        <DocumentViewerModal
          doc={viewing.doc}
          url={viewing.url}
          loading={viewing.loading}
          error={viewing.error}
          onClose={() => setViewing(null)}
        />
      )}
    </>
  );
}

function DocumentRowItem({ doc, onOpen }: { doc: DocumentRow; onOpen: () => void }) {
  const uploaderName = doc.uploader
    ? `${doc.uploader.firstName ?? ""} ${doc.uploader.lastName ?? ""}`.trim() || doc.uploader.email
    : "—";
  const subtitleParts = [
    doc.type || doc.category,
    formatBytes(doc.fileSize),
    `by ${uploaderName}`,
    formatRelative(doc.uploadedAt),
  ].filter((p) => p && p !== "");

  return (
    <motion.button
      onClick={onOpen}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-3 text-left w-full"
      style={{
        background: "var(--gc-surface)",
        border: "1px solid var(--gc-border)",
        borderLeft: "3px solid var(--gc-gold)",
        borderRadius: "var(--gc-radius-md)",
        padding: "var(--gc-space-3) var(--gc-space-4)",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
      data-testid={`book-document-row-${doc.id}`}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 36,
          height: 36,
          borderRadius: "var(--gc-radius-sm)",
          backgroundColor: "var(--gc-surface-2)",
          color: "var(--gc-gold)",
        }}
      >
        <FileText className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div
          style={{
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-sm)",
            fontWeight: 600,
            color: "var(--gc-text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {doc.name}
        </div>
        <div
          style={{
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-xs)",
            color: "var(--gc-text-muted)",
          }}
        >
          {subtitleParts.join(" · ")}
        </div>
      </div>

      <Eye aria-hidden="true" className="w-4 h-4 flex-shrink-0" style={{ color: "var(--gc-text-muted)" }} />
    </motion.button>
  );
}

function DocumentViewerModal({
  doc,
  url,
  loading,
  error,
  onClose,
}: {
  doc: DocumentRow;
  url: string | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 800,
          maxWidth: "95vw",
          height: "90vh",
          backgroundColor: "var(--gc-surface)",
          border: "1px solid var(--gc-border)",
          borderRadius: "var(--gc-radius-md)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between flex-shrink-0"
          style={{
            padding: "var(--gc-space-3) var(--gc-space-4)",
            borderBottom: "1px solid var(--gc-border)",
            backgroundColor: "var(--gc-surface-2)",
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontFamily: "var(--gc-font-display)",
                fontSize: "var(--gc-text-md)",
                color: "var(--gc-text-primary)",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {doc.name}
            </div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginTop: 1 }}>
              {[doc.type || doc.category, formatBytes(doc.fileSize), formatRelative(doc.uploadedAt)].filter(Boolean).join(" · ")}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1"
                style={{
                  ...OUTLINED_BUTTON_STYLE,
                  padding: "3px 8px",
                  fontSize: "var(--gc-text-xs)",
                }}
                data-testid="document-open-new-tab"
              >
                <ExternalLink className="w-3 h-3" />
                Open in new tab
              </a>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              style={{ background: "none", border: "none", color: "var(--gc-text-muted)", cursor: "pointer" }}
              data-testid="document-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "hidden", backgroundColor: "var(--gc-bg)" }}>
          {loading ? (
            <div className="flex items-center justify-center" style={{ height: "100%" }}>
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} />
            </div>
          ) : error ? (
            <div
              className="flex flex-col items-center justify-center gap-2"
              style={{ height: "100%", color: "var(--gc-text-muted)", textAlign: "center", padding: "var(--gc-space-6)" }}
            >
              <AlertTriangle className="w-6 h-6" style={{ color: "var(--gc-status-warning)" }} />
              <div style={{ fontSize: "var(--gc-text-sm)" }}>{error}</div>
            </div>
          ) : url ? (
            <iframe
              src={url}
              sandbox="allow-same-origin"
              style={{ width: "100%", height: "100%", border: "none" }}
              title={doc.name}
            />
          ) : (
            <div
              className="flex items-center justify-center"
              style={{ height: "100%", color: "var(--gc-text-muted)" }}
            >
              Document not available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section helpers ──────────────────────────────────────────────────────
function Section({
  title,
  icon,
  rightAction,
  children,
}: {
  title: string;
  icon?: ReactNode;
  rightAction?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div style={CARD_STYLE}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2" style={SECTION_LABEL_STYLE}>
          {icon}
          {title}
        </div>
        {rightAction}
      </div>
      {children}
    </div>
  );
}

function FormGrid({ cols, children }: { cols: 1 | 2; children: ReactNode }) {
  return (
    <div className={cols === 2 ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3"}>
      {children}
    </div>
  );
}

function FormField({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: ReactNode;
}) {
  // Use the canonical GC_FORM_LABEL token (same one HierarchyEditModal uses)
  // so every label in BoB edit mode looks identical to the rest of GC.
  return (
    <div className={`flex flex-col ${full ? "col-span-2" : ""}`}>
      <label style={GC_FORM_LABEL}>{label}</label>
      {children}
    </div>
  );
}

/**
 * GCEditSelect — Radix Select wrapper using the GC token classes shared with
 * HierarchyEditModal. Use this instead of a free-text <Input> for any field
 * with a known enum (gender, marital status, smoker status, etc.) so the
 * dropdowns look identical to the gold-standard GC edit forms.
 *
 * Pass the active GC theme so the portaled SelectContent inherits the GC
 * vars (gold/surface tokens).
 */
function GCEditSelect({
  value,
  onValueChange,
  options,
  placeholder,
  theme,
  testId,
}: {
  value: string;
  onValueChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  theme: string;
  testId?: string;
}) {
  return (
    <Select value={value || ""} onValueChange={onValueChange}>
      <SelectTrigger className={GC_SELECT_TRIGGER_CLASSES} data-testid={testId}>
        <SelectValue placeholder={placeholder ?? "Select…"} />
      </SelectTrigger>
      <SelectContent
        className={GC_SELECT_CONTENT_CLASSES}
        sideOffset={4}
        data-theme={theme}
      >
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className={GC_SELECT_ITEM_CLASSES}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── DetailRow helper ─────────────────────────────────────────────────────
function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="flex items-center gap-1"
        style={{
          fontFamily: "var(--gc-font-body)",
          fontSize: "var(--gc-text-xs)",
          textTransform: "uppercase",
          letterSpacing: "var(--gc-tracking-wider)",
          color: "var(--gc-text-muted)",
        }}
      >
        {icon && <span style={{ color: "var(--gc-text-muted)" }}>{icon}</span>}
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--gc-font-body)",
          fontSize: "var(--gc-text-sm)",
          color: "var(--gc-text-primary)",
          fontWeight: 500,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}
