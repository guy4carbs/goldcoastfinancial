import { useState, useEffect, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { TOUR } from "@/lib/tour/selectors";
import { Link } from "wouter";
import { CheckCircle, X as XIcon, AlertTriangle, Eye, Loader2 } from "lucide-react";

interface Agent {
  userId: string;
  firstName: string;
  lastName: string;
  eoProvider: string;
  eoPolicyNumber: string;
  eoEffectiveDate: string;
  eoExpiration: string;
  eoCoverageAmount: string;
  eoCertificateKey: string | null;
  status: string;
}

interface EORecord {
  agentId: string;
  agent: string;
  provider: string;
  policyNumber: string;
  coverage: string;
  coverageAmount: number;
  effective: string;
  expires: string;
  eoStatus: "active" | "expiring" | "expired" | "missing";
  daysUntilExpiry: number | null;
  certOnFile: boolean;
}

function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  return "$" + num.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatDateUTC(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return `${String(d.getUTCMonth()+1).padStart(2,"0")}/${String(d.getUTCDate()).padStart(2,"0")}/${d.getUTCFullYear()}`;
  } catch { return "—"; }
}

function calcDaysUntil(expirationStr: string): number | null {
  if (!expirationStr) return null;
  const now = new Date();
  const exp = new Date(expirationStr);
  const diffMs = exp.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function deriveEOStatus(agent: Agent): "active" | "expiring" | "expired" | "missing" {
  if (!agent.eoProvider) return "missing";
  if (agent.eoExpiration) {
    const days = calcDaysUntil(agent.eoExpiration);
    if (days !== null && days < 0) return "expired";
    if (days !== null && days <= 90) return "expiring";
  }
  return "active";
}

function transformAgent(agent: Agent): EORecord {
  const days = calcDaysUntil(agent.eoExpiration);
  const eoStatus = deriveEOStatus(agent);
  const coverageNum = agent.eoCoverageAmount ? parseFloat(agent.eoCoverageAmount) : 0;

  return {
    agentId: agent.userId,
    agent: `${agent.firstName} ${agent.lastName}`.trim(),
    provider: agent.eoProvider || "",
    policyNumber: agent.eoPolicyNumber || "",
    coverage: coverageNum ? formatCurrency(coverageNum) : "",
    coverageAmount: coverageNum,
    effective: agent.eoEffectiveDate ? formatDateUTC(agent.eoEffectiveDate) : "",
    expires: agent.eoExpiration ? formatDateUTC(agent.eoExpiration) : "",
    eoStatus,
    daysUntilExpiry: agent.eoProvider ? days : null,
    certOnFile: !!agent.eoCertificateKey,
  };
}

const tabs = ["All", "Active", "Expiring", "Expired", "Missing"] as const;

const FileIcon = ({ ok }: { ok: boolean }) => ok
  ? <span className="flex items-center gap-1" style={{ color: "var(--gc-status-active)", fontSize: "var(--gc-text-sm)" }}><CheckCircle className="w-3.5 h-3.5" /> On File</span>
  : <span className="flex items-center gap-1" style={{ color: "var(--gc-status-terminated)", fontSize: "var(--gc-text-sm)" }}><XIcon className="w-3.5 h-3.5" /> Missing</span>;

const ExpiryBadge = ({ days }: { days: number | null }) => {
  if (days === null) return null;
  if (days < 0) return <span className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", fontWeight: 600 }}><AlertTriangle className="w-3 h-3" /> Expired {Math.abs(days)}d ago</span>;
  if (days <= 30) return <span className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", fontWeight: 600 }}><AlertTriangle className="w-3 h-3" /> {days}d</span>;
  if (days <= 90) return <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-warning)", fontWeight: 500 }}>{days}d</span>;
  return <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{days}d</span>;
};

export default function ContractingEO() {
  const [tab, setTab] = useState<typeof tabs[number]>("All");
  const [viewCert, setViewCert] = useState<EORecord | null>(null);
  const [records, setRecords] = useState<EORecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetch("/api/hcms/agents/", { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error(`Failed to fetch agents: ${r.status}`); return r.json(); })
      .then((agents: Agent[]) => { setRecords(agents.map(transformAgent)); setLoading(false); })
      .catch(err => { setError(err.message || "Failed to load E&O data"); setLoading(false); });
  };

  useEffect(() => { loadData(); }, []);

  const counts = useMemo(() => ({
    all: records.length,
    active: records.filter(m => m.eoStatus === "active").length,
    expiring: records.filter(m => m.eoStatus === "expiring").length,
    expired: records.filter(m => m.eoStatus === "expired").length,
    missing: records.filter(m => m.eoStatus === "missing").length,
    certsOnFile: records.filter(m => m.certOnFile).length,
  }), [records]);

  const filtered = useMemo(() => {
    if (tab === "Active") return records.filter(m => m.eoStatus === "active");
    if (tab === "Expiring") return records.filter(m => m.eoStatus === "expiring");
    if (tab === "Expired") return records.filter(m => m.eoStatus === "expired");
    if (tab === "Missing") return records.filter(m => m.eoStatus === "missing");
    return records;
  }, [tab, records]);

  const cols: Column<EORecord>[] = [
    { key: "agent", label: "Agent", sortable: true, width: "16%", render: (v, row) => <Link href={`/hcms/agents/${row.agentId}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span></Link> },
    { key: "provider", label: "Provider", sortable: true, width: "12%", render: (v) => v || <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>None</span> },
    { key: "policyNumber", label: "Policy #", width: "14%", render: (v) => v ? <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span> : <span style={{ color: "var(--gc-text-muted)" }}>—</span> },
    { key: "coverage", label: "Coverage", width: "10%", render: (v, row) => v ? <span style={{ fontWeight: 500, color: row.coverageAmount < 1000000 ? "var(--gc-status-terminated)" : "var(--gc-text-primary)" }}>{v}</span> : <span style={{ color: "var(--gc-text-muted)" }}>—</span> },
    { key: "effective", label: "Effective", sortable: true, width: "10%", render: (v) => v || <span style={{ color: "var(--gc-text-muted)" }}>—</span> },
    { key: "expires", label: "Expires", sortable: true, width: "10%", render: (v, row) => v ? <div className="flex items-center gap-2">{v} <ExpiryBadge days={row.daysUntilExpiry} /></div> : <span style={{ color: "var(--gc-text-muted)" }}>—</span> },
    { key: "eoStatus", label: "Status", width: "10%", render: (v) => <GCStatusBadge status={v === "active" ? "active" : v === "expiring" ? "warning" : v === "expired" ? "expired" : "warning"} /> },
    { key: "certOnFile", label: "Certificate", width: "10%", render: (v) => <FileIcon ok={v} /> },
    { key: "actions", label: "", width: "8%", align: "center", render: (_v, row) => (
      <button onClick={() => setViewCert(row)} className="flex items-center gap-1" style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)", fontFamily: "var(--gc-font-body)" }}>
        <Eye className="w-3 h-3" /> View
      </button>
    )},
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--gc-gold)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <GCPageHeader title="E&O Insurance" subtitle="Errors & Omissions insurance tracking — $1M minimum coverage required" accentUnderline />
        <div className="flex items-center gap-3" style={{
          padding: "var(--gc-space-4)",
          backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)",
          borderRadius: "var(--gc-radius-md)",
        }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "var(--gc-status-terminated)" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500 }}>Unable to Load E&O Data</div>
            <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{error}</div>
          </div>
          <button onClick={loadData} style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-secondary)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div data-tour-id={TOUR.ADMIN.CONTRACTING_EO.HEADER}>
        <GCPageHeader title="E&O Insurance" subtitle="Errors & Omissions insurance tracking — $1M minimum coverage required" accentUnderline />
      </div>

      <div data-tour-id={TOUR.ADMIN.CONTRACTING_EO.SUMMARY} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <GCKPICard label="Total Agents" value={counts.all} accentTop />
        <GCKPICard label="Active Policies" value={counts.active} accentTop />
        <GCKPICard label="Expiring Soon" value={counts.expiring} accentTop delta={counts.expiring > 0 ? { value: "Within 90 days", positive: false } : { value: "None expiring", positive: true }} />
        <GCKPICard label="Expired" value={counts.expired} accentTop delta={counts.expired > 0 ? { value: "Action needed", positive: false } : { value: "None expired", positive: true }} />
        <GCKPICard label="Missing E&O" value={counts.missing} accentTop delta={counts.missing > 0 ? { value: "No policy on file", positive: false } : { value: "All covered", positive: true }} />
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map(t => {
          const count = t === "All" ? counts.all : t === "Active" ? counts.active : t === "Expiring" ? counts.expiring : t === "Expired" ? counts.expired : counts.missing;
          return (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>
              {t} <span style={{ fontSize: "var(--gc-text-xs)", opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search by agent or provider..." />

      {/* View Certificate Popup */}
      {viewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setViewCert(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 520, maxWidth: "95vw", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div className="flex items-center justify-between mb-4">
              <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)" }}>{viewCert.agent}</div>
              <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>E&O Insurance Details</div>
              <button onClick={() => setViewCert(null)} style={{ padding: "var(--gc-space-2)", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--gc-text-muted)" }}><XIcon className="w-5 h-5" /></button>
            </div>

            <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Agent", viewCert.agent],
                  ["Provider", viewCert.provider || "\u2014"],
                  ["Policy Number", viewCert.policyNumber || "\u2014"],
                  ["Coverage Amount", viewCert.coverage || "\u2014"],
                  ["Effective Date", viewCert.effective || "\u2014"],
                  ["Expiration Date", viewCert.expires || "\u2014"],
                  ["Certificate", viewCert.certOnFile ? "On File" : "Not Uploaded"],
                ].map(([label, val]) => (
                  <div key={label as string}>
                    <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-1)" }}>{label}</div>
                    <div style={{ fontSize: "var(--gc-text-base)", color: val === "\u2014" ? "var(--gc-text-muted)" : "var(--gc-text-primary)", fontWeight: 500 }}>{val}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--gc-border-subtle)" }}>
                <GCStatusBadge status={viewCert.eoStatus === "active" ? "active" : viewCert.eoStatus === "expiring" ? "warning" : "expired"} />
                {viewCert.daysUntilExpiry !== null && <ExpiryBadge days={viewCert.daysUntilExpiry} />}
              </div>
              <Link href={`/hcms/agents/${viewCert.agentId}`}>
                <span className="flex items-center justify-center gap-2 mt-4" style={{
                  padding: "var(--gc-space-2) var(--gc-space-4)",
                  backgroundColor: "color-mix(in srgb, var(--gc-gold) 10%, transparent)",
                  border: "1px solid var(--gc-gold)", borderRadius: "var(--gc-radius-sm)",
                  color: "var(--gc-gold)", fontSize: "var(--gc-text-sm)", fontWeight: 500, cursor: "pointer",
                  textAlign: "center", display: "block"
                }}>View Full Profile</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
