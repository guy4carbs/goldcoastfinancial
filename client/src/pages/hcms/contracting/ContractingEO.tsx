import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { Link } from "wouter";
import { CheckCircle, X as XIcon, AlertTriangle, Eye } from "lucide-react";

interface EORecord {
  agentId: string; agent: string; provider: string; policyNumber: string;
  coverage: string; coverageAmount: number; effective: string; expires: string;
  status: "active" | "expiring" | "expired" | "missing"; daysUntilExpiry: number | null;
  certOnFile: boolean;
}

const MOCK: EORecord[] = [
  { agentId: "1", agent: "Sarah Mitchell", provider: "NAPA", policyNumber: "EO-2026-445821", coverage: "$1,000,000", coverageAmount: 1000000, effective: "2026-01-10", expires: "2027-01-10", status: "active", daysUntilExpiry: 270, certOnFile: true },
  { agentId: "2", agent: "James Rodriguez", provider: "CalSurance", policyNumber: "EO-2025-331209", coverage: "$1,000,000", coverageAmount: 1000000, effective: "2025-03-01", expires: "2026-05-01", status: "expiring", daysUntilExpiry: 16, certOnFile: true },
  { agentId: "3", agent: "Michael Chen", provider: "NAPA", policyNumber: "EO-2025-887412", coverage: "$2,000,000", coverageAmount: 2000000, effective: "2025-06-01", expires: "2026-06-01", status: "active", daysUntilExpiry: 47, certOnFile: true },
  { agentId: "4", agent: "Emily Watson", provider: "EOforLess", policyNumber: "EO-2024-119003", coverage: "$1,000,000", coverageAmount: 1000000, effective: "2024-08-01", expires: "2025-08-01", status: "expired", daysUntilExpiry: null, certOnFile: false },
  { agentId: "5", agent: "David Park", provider: "NAPA", policyNumber: "EO-2025-554210", coverage: "$1,000,000", coverageAmount: 1000000, effective: "2025-09-01", expires: "2026-09-01", status: "active", daysUntilExpiry: 149, certOnFile: true },
  { agentId: "6", agent: "Lisa Thompson", provider: "", policyNumber: "", coverage: "", coverageAmount: 0, effective: "", expires: "", status: "missing", daysUntilExpiry: null, certOnFile: false },
  { agentId: "7", agent: "Robert Kim", provider: "", policyNumber: "", coverage: "", coverageAmount: 0, effective: "", expires: "", status: "missing", daysUntilExpiry: null, certOnFile: false },
  { agentId: "8", agent: "Amanda Torres", provider: "NAPA", policyNumber: "EO-2026-221340", coverage: "$1,000,000", coverageAmount: 1000000, effective: "2026-04-01", expires: "2027-04-01", status: "active", daysUntilExpiry: 351, certOnFile: true },
  { agentId: "9", agent: "Jack Cook", provider: "CalSurance", policyNumber: "EO-2025-100100", coverage: "$3,000,000", coverageAmount: 3000000, effective: "2025-01-01", expires: "2026-01-01", status: "expiring", daysUntilExpiry: 261, certOnFile: true },
];

const tabs = ["All", "Active", "Expiring", "Expired", "Missing"] as const;

const FileIcon = ({ ok }: { ok: boolean }) => ok
  ? <span className="flex items-center gap-1" style={{ color: "var(--gc-status-active)", fontSize: "var(--gc-text-sm)" }}><CheckCircle className="w-3.5 h-3.5" /> On File</span>
  : <span className="flex items-center gap-1" style={{ color: "var(--gc-status-terminated)", fontSize: "var(--gc-text-sm)" }}><XIcon className="w-3.5 h-3.5" /> Missing</span>;

const ExpiryBadge = ({ days }: { days: number | null }) => {
  if (days === null) return null;
  if (days <= 30) return <span className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", fontWeight: 600 }}><AlertTriangle className="w-3 h-3" /> {days}d</span>;
  if (days <= 90) return <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-warning)", fontWeight: 500 }}>{days}d</span>;
  return <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{days}d</span>;
};

export default function ContractingEO() {
  const [tab, setTab] = useState<typeof tabs[number]>("All");
  const [viewCert, setViewCert] = useState<EORecord | null>(null);

  const counts = useMemo(() => ({
    all: MOCK.length,
    active: MOCK.filter(m => m.status === "active").length,
    expiring: MOCK.filter(m => m.status === "expiring" || (m.daysUntilExpiry !== null && m.daysUntilExpiry <= 90)).length,
    expired: MOCK.filter(m => m.status === "expired").length,
    missing: MOCK.filter(m => m.status === "missing").length,
    certsOnFile: MOCK.filter(m => m.certOnFile).length,
  }), []);

  const filtered = useMemo(() => {
    if (tab === "Active") return MOCK.filter(m => m.status === "active");
    if (tab === "Expiring") return MOCK.filter(m => m.status === "expiring" || (m.daysUntilExpiry !== null && m.daysUntilExpiry <= 90));
    if (tab === "Expired") return MOCK.filter(m => m.status === "expired");
    if (tab === "Missing") return MOCK.filter(m => m.status === "missing");
    return MOCK;
  }, [tab]);

  const cols: Column<EORecord>[] = [
    { key: "agent", label: "Agent", sortable: true, width: "16%", render: (v, row) => <Link href={`/hcms/agents/${row.agentId}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span></Link> },
    { key: "provider", label: "Provider", sortable: true, width: "12%", render: (v) => v || <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>None</span> },
    { key: "policyNumber", label: "Policy #", width: "14%", render: (v) => v ? <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span> : <span style={{ color: "var(--gc-text-muted)" }}>—</span> },
    { key: "coverage", label: "Coverage", width: "10%", render: (v, row) => v ? <span style={{ fontWeight: 500, color: row.coverageAmount < 1000000 ? "var(--gc-status-terminated)" : "var(--gc-text-primary)" }}>{v}</span> : <span style={{ color: "var(--gc-text-muted)" }}>—</span> },
    { key: "expires", label: "Expires", sortable: true, width: "10%", render: (v, row) => v ? <div className="flex items-center gap-2">{v} <ExpiryBadge days={row.daysUntilExpiry} /></div> : <span style={{ color: "var(--gc-text-muted)" }}>—</span> },
    { key: "status", label: "Status", width: "10%", render: (v) => <GCStatusBadge status={v === "active" ? "active" : v === "expiring" ? "warning" : v === "expired" ? "expired" : "warning"} /> },
    { key: "certOnFile", label: "Certificate", width: "12%", render: (v) => <FileIcon ok={v} /> },
    { key: "agentId", label: "", width: "8%", align: "center", render: (_v, row) => row.certOnFile ? (
      <button onClick={() => setViewCert(row)} className="flex items-center gap-1" style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)", fontFamily: "var(--gc-font-body)" }}>
        <Eye className="w-3 h-3" /> View
      </button>
    ) : null },
  ];

  return (
    <div>
      <GCPageHeader title="E&O Insurance" subtitle="Errors & Omissions insurance tracking — $1M minimum coverage required" accentUnderline />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Active Policies" value={counts.active} accentTop />
        <GCKPICard label="Expiring Soon" value={counts.expiring} accentTop delta={{ value: "Within 90 days", positive: false }} />
        <GCKPICard label="Expired / Missing" value={counts.expired + counts.missing} accentTop delta={{ value: "Action needed", positive: false }} />
        <GCKPICard label="Certificates on File" value={`${counts.certsOnFile}/${counts.all}`} accentTop />
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
          <div onClick={e => e.stopPropagation()} style={{ width: 480, backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div className="flex items-center justify-between mb-4">
              <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)" }}>E&O Certificate</div>
              <button onClick={() => setViewCert(null)} style={{ padding: "var(--gc-space-2)", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--gc-text-muted)" }}><XIcon className="w-5 h-5" /></button>
            </div>

            <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Agent", viewCert.agent],
                  ["Provider", viewCert.provider],
                  ["Policy Number", viewCert.policyNumber],
                  ["Coverage Amount", viewCert.coverage],
                  ["Effective Date", viewCert.effective],
                  ["Expiration Date", viewCert.expires],
                ].map(([label, val]) => (
                  <div key={label as string}>
                    <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-1)" }}>{label}</div>
                    <div style={{ fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)", fontWeight: 500 }}>{val}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--gc-border-subtle)" }}>
                <GCStatusBadge status={viewCert.status === "active" ? "active" : viewCert.status === "expiring" ? "warning" : "expired"} />
                {viewCert.daysUntilExpiry !== null && <ExpiryBadge days={viewCert.daysUntilExpiry} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
