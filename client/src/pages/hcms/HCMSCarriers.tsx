import { useState, useEffect, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCStatusBadge } from "@/components/gc";
import { TOUR } from "@/lib/tour/selectors";
import { Link } from "wouter";
import { ChevronDown, ChevronRight, ExternalLink, Search, Globe, Phone, Mail, Loader2, AlertTriangle } from "lucide-react";

type ProductType = "Term Life" | "Whole Life" | "IUL" | "Final Expense" | "Annuity" | "Mortgage Protection";

interface AppointedAgent { agentId: string; name: string; writing: string; date: string; level: string; }

interface Carrier {
  id: string; name: string; amBest: string; naic: string;
  products: ProductType[]; statesCount: number; states: string[];
  agentsAppointed: AppointedAgent[];
  phone: string; email: string; website: string;
  contractingUrl: string; trainingUrl: string;
  advanceMonths: number; avgProcessingDays: number;
}

const productColors: Record<string, string> = {
  "Term Life": "var(--gc-chart-4)", "Whole Life": "var(--gc-chart-3)", "IUL": "var(--gc-chart-2)",
  "Final Expense": "var(--gc-status-warning)", "Annuity": "var(--gc-gold)", "Mortgage Protection": "var(--gc-status-review)",
};

const CARRIERS: Carrier[] = [
  { id: "1", name: "Aetna", amBest: "A", naic: "60054", products: ["Term Life", "Whole Life"], statesCount: 50, states: ["ALL"], agentsAppointed: [], phone: "(800) 872-3862", email: "contracting@aetna.com", website: "aetna.com", contractingUrl: "https://www.surelc.com", trainingUrl: "", advanceMonths: 9, avgProcessingDays: 10 },
  { id: "2", name: "American Amicable", amBest: "A-", naic: "68748", products: ["Final Expense", "Whole Life"], statesCount: 48, states: ["48 states"], agentsAppointed: [], phone: "(800) 736-2022", email: "contracting@amam.com", website: "americanamicable.com", contractingUrl: "https://www.surelc.com", trainingUrl: "", advanceMonths: 6, avgProcessingDays: 7 },
  { id: "3", name: "American Home Life", amBest: "B++", naic: "60488", products: ["Final Expense"], statesCount: 40, states: ["40 states"], agentsAppointed: [], phone: "(800) 334-2193", email: "", website: "americanhomelife.com", contractingUrl: "https://www.surelc.com", trainingUrl: "", advanceMonths: 6, avgProcessingDays: 7 },
  { id: "4", name: "Americo", amBest: "A", naic: "68594", products: ["Term Life", "Whole Life", "IUL", "Final Expense", "Annuity"], statesCount: 49, states: ["49 states"], agentsAppointed: [], phone: "(800) 231-0801", email: "contracting@americo.com", website: "americo.com", contractingUrl: "https://www.surelc.com", trainingUrl: "https://training.americo.com", advanceMonths: 9, avgProcessingDays: 7 },
  { id: "5", name: "Baltimore Life", amBest: "A-", naic: "61212", products: ["Term Life", "Whole Life", "Final Expense"], statesCount: 45, states: ["45 states"], agentsAppointed: [], phone: "(800) 628-5433", email: "", website: "baltlife.com", contractingUrl: "https://www.surelc.com", trainingUrl: "", advanceMonths: 6, avgProcessingDays: 10 },
  { id: "6", name: "Banner Life", amBest: "A+", naic: "94250", products: ["Term Life"], statesCount: 49, states: ["49 states + DC"], agentsAppointed: [], phone: "(800) 638-8428", email: "", website: "lgamerica.com", contractingUrl: "https://www.surelc.com", trainingUrl: "", advanceMonths: 0, avgProcessingDays: 5 },
  { id: "7", name: "Columbus Life", amBest: "A+", naic: "99937", products: ["Term Life", "Whole Life", "IUL"], statesCount: 49, states: ["49 states + DC"], agentsAppointed: [], phone: "(800) 677-9696", email: "", website: "columbuslife.com", contractingUrl: "https://www.surelc.com", trainingUrl: "", advanceMonths: 9, avgProcessingDays: 10 },
  { id: "8", name: "Corebridge Financial", amBest: "A", naic: "70238", products: ["Term Life", "Whole Life", "IUL", "Annuity"], statesCount: 50, states: ["ALL"], agentsAppointed: [], phone: "(800) 448-2542", email: "contracting@corebridgefinancial.com", website: "corebridgefinancial.com", contractingUrl: "https://www.surelc.com", trainingUrl: "https://training.corebridge.com", advanceMonths: 9, avgProcessingDays: 10 },
  { id: "9", name: "Ethos", amBest: "A+", naic: "N/A", products: ["Term Life", "Whole Life"], statesCount: 50, states: ["ALL"], agentsAppointed: [], phone: "", email: "agents@ethoslife.com", website: "ethoslife.com", contractingUrl: "https://www.surelc.com", trainingUrl: "", advanceMonths: 0, avgProcessingDays: 3 },
  { id: "10", name: "Foresters Financial", amBest: "A", naic: "58188", products: ["Term Life", "Whole Life", "Final Expense"], statesCount: 50, states: ["ALL"], agentsAppointed: [], phone: "(800) 828-1540", email: "contracting@foresters.com", website: "foresters.com", contractingUrl: "https://www.surelc.com", trainingUrl: "", advanceMonths: 9, avgProcessingDays: 7 },
  { id: "11", name: "Gerber Life", amBest: "A", naic: "70939", products: ["Term Life", "Whole Life", "Final Expense"], statesCount: 50, states: ["ALL"], agentsAppointed: [], phone: "(800) 704-2180", email: "", website: "gerberlife.com", contractingUrl: "https://www.surelc.com", trainingUrl: "", advanceMonths: 6, avgProcessingDays: 7 },
  { id: "12", name: "Guarantee Trust Life", amBest: "A-", naic: "64211", products: ["Final Expense", "Whole Life", "Mortgage Protection"], statesCount: 49, states: ["49 states"], agentsAppointed: [], phone: "(800) 323-6907", email: "", website: "gtlic.com", contractingUrl: "https://www.surelc.com", trainingUrl: "", advanceMonths: 6, avgProcessingDays: 7 },
  { id: "13", name: "Lafayette Life", amBest: "A+", naic: "65242", products: ["Whole Life", "IUL"], statesCount: 49, states: ["49 states + DC"], agentsAppointed: [], phone: "(800) 243-6631", email: "", website: "llic.com", contractingUrl: "https://www.surelc.com", trainingUrl: "", advanceMonths: 9, avgProcessingDays: 14 },
  { id: "14", name: "Liberty Bankers Life", amBest: "B++", naic: "68543", products: ["Final Expense", "Annuity"], statesCount: 47, states: ["47 states"], agentsAppointed: [], phone: "(800) 284-4422", email: "", website: "lbl.com", contractingUrl: "https://www.surelc.com", trainingUrl: "", advanceMonths: 6, avgProcessingDays: 7 },
  { id: "15", name: "Mutual of Omaha", amBest: "A+", naic: "71412", products: ["Term Life", "Whole Life", "IUL", "Final Expense", "Annuity", "Mortgage Protection"], statesCount: 50, states: ["ALL"], agentsAppointed: [], phone: "(800) 775-6000", email: "contracting@mutualofomaha.com", website: "mutualofomaha.com", contractingUrl: "https://www.surelc.com", trainingUrl: "https://salesnet.mutualofomaha.com", advanceMonths: 9, avgProcessingDays: 5 },
  { id: "16", name: "National Life Group", amBest: "A", naic: "66680", products: ["Term Life", "Whole Life", "IUL", "Annuity"], statesCount: 50, states: ["ALL"], agentsAppointed: [], phone: "(800) 732-8939", email: "contracting@nationallife.com", website: "nationallife.com", contractingUrl: "https://www.surelc.com", trainingUrl: "", advanceMonths: 9, avgProcessingDays: 10 },
  { id: "17", name: "Polish Falcons", amBest: "NR", naic: "N/A", products: ["Whole Life", "Final Expense"], statesCount: 30, states: ["30 states"], agentsAppointed: [], phone: "(800) 535-2071", email: "", website: "polishfalcons.org", contractingUrl: "https://www.surelc.com", trainingUrl: "", advanceMonths: 0, avgProcessingDays: 14 },
  { id: "18", name: "Quility", amBest: "A", naic: "N/A", products: ["Term Life"], statesCount: 50, states: ["ALL"], agentsAppointed: [], phone: "", email: "agents@quility.com", website: "quility.com", contractingUrl: "https://www.surelc.com", trainingUrl: "", advanceMonths: 0, avgProcessingDays: 3 },
  { id: "19", name: "Royal Neighbors", amBest: "A-", naic: "57657", products: ["Term Life", "Whole Life", "Final Expense", "Annuity"], statesCount: 43, states: ["43 states"], agentsAppointed: [], phone: "(800) 627-4762", email: "", website: "royalneighbors.org", contractingUrl: "https://www.surelc.com", trainingUrl: "", advanceMonths: 6, avgProcessingDays: 7 },
  { id: "20", name: "SBLI", amBest: "A", naic: "70435", products: ["Term Life"], statesCount: 49, states: ["49 states + DC"], agentsAppointed: [], phone: "(888) 724-7254", email: "", website: "sbli.com", contractingUrl: "https://www.surelc.com", trainingUrl: "", advanceMonths: 0, avgProcessingDays: 5 },
  { id: "21", name: "Transamerica", amBest: "A", naic: "86231", products: ["Term Life", "Whole Life", "IUL", "Final Expense", "Annuity"], statesCount: 50, states: ["ALL"], agentsAppointed: [], phone: "(800) 797-2643", email: "contracting@transamerica.com", website: "transamerica.com", contractingUrl: "https://www.surelc.com", trainingUrl: "https://training.transamerica.com", advanceMonths: 9, avgProcessingDays: 7 },
  { id: "22", name: "Trinity Life", amBest: "B++", naic: "N/A", products: ["Final Expense"], statesCount: 35, states: ["35 states"], agentsAppointed: [], phone: "(800) 555-0199", email: "", website: "trinitylife.com", contractingUrl: "https://www.surelc.com", trainingUrl: "", advanceMonths: 6, avgProcessingDays: 7 },
  { id: "23", name: "United Home Life", amBest: "A-", naic: "69922", products: ["Final Expense", "Whole Life"], statesCount: 46, states: ["46 states"], agentsAppointed: [], phone: "(800) 428-3001", email: "", website: "uhlg.com", contractingUrl: "https://www.surelc.com", trainingUrl: "", advanceMonths: 6, avgProcessingDays: 7 },
];

const allProducts = Array.from(new Set(CARRIERS.flatMap(c => c.products)));
const tabs = ["All", "Life", "Annuity", "Final Expense"] as const;

function fmtDate(d: string | null | undefined): string {
  if (!d) return "";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "";
    return `${String(date.getUTCMonth()+1).padStart(2,"0")}/${String(date.getUTCDate()).padStart(2,"0")}/${date.getUTCFullYear()}`;
  } catch { return ""; }
}

// Build carriers with real appointment data overlaid
interface RealRequest { carrier: string; states: string[]; status: string; createdAt: string; }
interface RequestAgent { userId: string; firstName: string; lastName: string; requests: RealRequest[]; }

export default function HCMSCarriers() {
  const [tab, setTab] = useState<typeof tabs[number]>("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<RequestAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = () => {
    setLoading(true);
    setError("");
    fetch("/api/hcms/agents/requests/all", { credentials: "include" })
      .then(r => r.ok ? r.json() : Promise.reject(new Error("Failed to load appointment data")))
      .then(data => { setRequestData(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { setError(err.message || "Failed to load data"); setLoading(false); });
  };

  useEffect(() => { loadData(); }, []);

  // Merge real appointment data onto carriers
  const carriersWithData = useMemo(() => {
    const appointmentsByCarrier: Record<string, AppointedAgent[]> = {};
    requestData.forEach(agent => {
      agent.requests.forEach(req => {
        if (req.status === "approved" || req.status === "appointed") {
          const key = req.carrier.toLowerCase();
          if (!appointmentsByCarrier[key]) appointmentsByCarrier[key] = [];
          appointmentsByCarrier[key].push({
            agentId: agent.userId, name: `${agent.firstName} ${agent.lastName}`,
            writing: "", date: fmtDate(req.createdAt), level: "",
          });
        }
      });
    });

    return CARRIERS.map(c => {
      const realAppts = appointmentsByCarrier[c.name.toLowerCase()] || [];
      return { ...c, agentsAppointed: realAppts };
    });
  }, [requestData]);

  const totalAppointed = carriersWithData.reduce((s, c) => s + c.agentsAppointed.length, 0);

  const filtered = useMemo(() => {
    let list = carriersWithData;
    if (tab === "Life") list = list.filter(c => c.products.some(p => p.includes("Life") && p !== "Final Expense"));
    if (tab === "Annuity") list = list.filter(c => c.products.includes("Annuity"));
    if (tab === "Final Expense") list = list.filter(c => c.products.includes("Final Expense"));
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [tab, search, carriersWithData]);

  const counts = useMemo(() => ({
    all: carriersWithData.length,
    life: carriersWithData.filter(c => c.products.some(p => p.includes("Life") && p !== "Final Expense")).length,
    annuity: carriersWithData.filter(c => c.products.includes("Annuity")).length,
    fe: carriersWithData.filter(c => c.products.includes("Final Expense")).length,
  }), [carriersWithData]);

  if (loading) return <div className="flex items-center justify-center" style={{ padding: "var(--gc-space-8)" }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} /></div>;

  return (
    <div>
      <div data-tour-id={TOUR.ADMIN.CARRIERS.HEADER}>
        <GCPageHeader title="Carrier Directory" subtitle="Gold Coast Financial carrier partners — 23 carriers across all product lines" accentUnderline />
      </div>

      {error && (
        <div className="flex items-center gap-3 mb-4" style={{
          padding: "var(--gc-space-3) var(--gc-space-4)",
          backgroundColor: "color-mix(in srgb, var(--gc-status-warning) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--gc-status-warning) 25%, transparent)",
          borderRadius: "var(--gc-radius-md)",
        }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--gc-status-warning)" }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-warning)" }}>Agent appointment data unavailable — showing carrier directory only. {error}</span>
          </div>
          <button onClick={loadData} style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-secondary)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}>Retry</button>
        </div>
      )}

      {/* Reference data notice */}
      <div className="flex items-center gap-2 mb-4" style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-review) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-review) 25%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
        <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-review)" }}>Carrier directory — AM Best ratings, NAIC codes, and processing times are reference data. Agent appointments are pulled from contracting requests.</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Total Carriers" value={CARRIERS.length} accentTop />
        <GCKPICard label="Total Appointments" value={totalAppointed} accentTop delta={totalAppointed > 0 ? { value: "Across all agents", positive: true } : { value: "No appointments yet", positive: false }} />
        <GCKPICard label="Product Types" value={allProducts.length} accentTop />
        <GCKPICard label="Avg Agents/Carrier" value={(totalAppointed / CARRIERS.length).toFixed(1)} accentTop />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div data-tour-id={TOUR.ADMIN.CARRIERS.TABS} className="flex gap-1">
          {tabs.map(t => {
            const count = t === "All" ? counts.all : t === "Life" ? counts.life : t === "Annuity" ? counts.annuity : counts.fe;
            return (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>
                {t} <span style={{ fontSize: "var(--gc-text-xs)", opacity: 0.7 }}>({count})</span>
              </button>
            );
          })}
        </div>
        <div data-tour-id={TOUR.ADMIN.CARRIERS.SEARCH} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--gc-text-muted)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search carriers..." style={{ padding: "var(--gc-space-2) var(--gc-space-3) var(--gc-space-2) 36px", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", width: 220, outline: "none" }} />
        </div>
      </div>

      {/* Carrier Table */}
      <div data-tour-id={TOUR.ADMIN.CARRIERS.LIST} style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", overflow: "hidden" }}>
        {/* Header */}
        <div className="grid" style={{ gridTemplateColumns: "22% 28% 10% 10% 10% 12% 8%", padding: "var(--gc-space-3) var(--gc-space-4)", borderBottom: "1px solid var(--gc-border)" }}>
          {["Carrier", "Products", "Agents", "AM Best", "States", "Processing", "expand"].map(h => (
            <div key={h} style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", fontWeight: 500, letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-secondary)" }}>{h === "expand" ? "" : h}</div>
          ))}
        </div>

        {/* Rows */}
        {filtered.map(carrier => {
          const isExpanded = expanded === carrier.id;
          return (
            <div key={carrier.id}>
              <div className="grid" onClick={() => setExpanded(isExpanded ? null : carrier.id)} style={{ gridTemplateColumns: "22% 28% 10% 10% 10% 12% 8%", padding: "var(--gc-space-3) var(--gc-space-4)", borderBottom: "1px solid var(--gc-border-subtle)", cursor: "pointer", backgroundColor: isExpanded ? "var(--gc-surface-2)" : "transparent", transition: "background-color var(--gc-transition-fast)" }}
                onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = "var(--gc-hover-overlay)"; }}
                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = "transparent"; }}>
                {/* Name */}
                <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{carrier.name}</div>
                {/* Products */}
                <div className="flex flex-wrap gap-1">
                  {carrier.products.slice(0, 4).map(p => (
                    <span key={p} style={{ padding: "1px 6px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-xs)", color: productColors[p] || "var(--gc-text-muted)", backgroundColor: `color-mix(in srgb, ${productColors[p] || "var(--gc-text-muted)"} 12%, transparent)` }}>{p}</span>
                  ))}
                  {carrier.products.length > 4 && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-gold)" }}>+{carrier.products.length - 4}</span>}
                </div>
                {/* Agents */}
                <div style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: carrier.agentsAppointed.length > 0 ? "var(--gc-status-active)" : "var(--gc-text-muted)" }}>{carrier.agentsAppointed.length}</div>
                {/* AM Best */}
                <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)", fontWeight: 500 }}>{carrier.amBest}</div>
                {/* States */}
                <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{carrier.statesCount}</div>
                {/* Processing */}
                <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{carrier.avgProcessingDays}d</div>
                {/* Expand */}
                <div className="flex items-center justify-center">
                  {isExpanded ? <ChevronDown className="w-4 h-4" style={{ color: "var(--gc-gold)" }} /> : <ChevronRight className="w-4 h-4" style={{ color: "var(--gc-text-muted)" }} />}
                </div>
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div style={{ padding: "var(--gc-space-4) var(--gc-space-6)", backgroundColor: "var(--gc-surface-2)", borderBottom: "1px solid var(--gc-border)" }}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    {/* Company Info */}
                    <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
                      <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-3)" }}>Company Information</div>
                      <div className="flex flex-col gap-2" style={{ fontSize: "var(--gc-text-sm)" }}>
                        <div><span style={{ color: "var(--gc-text-muted)" }}>AM Best:</span> <span style={{ color: "var(--gc-text-primary)", fontWeight: 500 }}>{carrier.amBest}</span></div>
                        {carrier.naic !== "N/A" && <div><span style={{ color: "var(--gc-text-muted)" }}>NAIC:</span> <span style={{ fontFamily: "monospace", color: "var(--gc-text-primary)" }}>{carrier.naic}</span></div>}
                        {carrier.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" style={{ color: "var(--gc-text-muted)" }} /> <span style={{ color: "var(--gc-text-primary)" }}>{carrier.phone}</span></div>}
                        {carrier.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" style={{ color: "var(--gc-text-muted)" }} /> <span style={{ color: "var(--gc-text-primary)" }}>{carrier.email}</span></div>}
                        <div className="flex items-center gap-1"><Globe className="w-3 h-3" style={{ color: "var(--gc-text-muted)" }} /> <span style={{ color: "var(--gc-gold)" }}>{carrier.website}</span></div>
                      </div>
                    </div>

                    {/* Contracting */}
                    <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
                      <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-3)" }}>Contracting</div>
                      <div className="flex flex-col gap-2" style={{ fontSize: "var(--gc-text-sm)" }}>
                        <div><span style={{ color: "var(--gc-text-muted)" }}>Method:</span> <span style={{ color: "var(--gc-text-primary)" }}>SureLC</span></div>
                        <div><span style={{ color: "var(--gc-text-muted)" }}>Processing:</span> <span style={{ color: "var(--gc-text-primary)" }}>{carrier.avgProcessingDays} business days</span></div>
                        <div><span style={{ color: "var(--gc-text-muted)" }}>Advance:</span> <span style={{ color: carrier.advanceMonths > 0 ? "var(--gc-text-primary)" : "var(--gc-text-muted)" }}>{carrier.advanceMonths > 0 ? `${carrier.advanceMonths} months` : "None"}</span></div>
                        <div><span style={{ color: "var(--gc-text-muted)" }}>States:</span> <span style={{ color: "var(--gc-text-primary)" }}>{carrier.statesCount === 50 ? "All 50 states" : `${carrier.statesCount} states`}</span></div>
                        <a href={carrier.contractingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 no-underline mt-1" style={{ color: "var(--gc-gold)", fontSize: "var(--gc-text-sm)" }}><ExternalLink className="w-3 h-3" /> Open in SureLC</a>
                      </div>
                    </div>

                    {/* Products */}
                    <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
                      <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-3)" }}>Product Types</div>
                      <div className="flex flex-wrap gap-2">
                        {carrier.products.map(p => (
                          <span key={p} style={{ padding: "var(--gc-space-1) var(--gc-space-3)", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-sm)", color: productColors[p], backgroundColor: `color-mix(in srgb, ${productColors[p]} 12%, transparent)`, fontWeight: 500 }}>{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Appointed Agents */}
                  {carrier.agentsAppointed.length > 0 && (
                    <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
                      <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-3)" }}>Appointed Agents ({carrier.agentsAppointed.length})</div>
                      <div className="flex flex-col gap-2">
                        {carrier.agentsAppointed.map(a => (
                          <div key={a.agentId} className="flex items-center justify-between" style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)" }}>
                            <Link href={`/hcms/agents/${a.agentId}`}><span style={{ color: "var(--gc-gold)", fontWeight: 500, cursor: "pointer", fontSize: "var(--gc-text-sm)" }}>{a.name}</span></Link>
                            <div className="flex items-center gap-4" style={{ fontSize: "var(--gc-text-sm)" }}>
                              {a.writing && <span style={{ fontFamily: "monospace", color: "var(--gc-gold)" }}>{a.writing}</span>}
                              {a.date && <span style={{ color: "var(--gc-text-muted)" }}>{a.date}</span>}
                              {a.level && <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: "var(--gc-gold)" }}>{a.level}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ padding: "var(--gc-space-8)", textAlign: "center", color: "var(--gc-text-muted)" }}>No carriers found matching your search.</div>
        )}
      </div>
    </div>
  );
}
