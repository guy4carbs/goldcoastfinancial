import { useState, useEffect, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { TOUR } from "@/lib/tour/selectors";
import { Link } from "wouter";
import { CheckCircle, X as XIcon, Loader2, AlertTriangle, Eye } from "lucide-react";

interface Agent {
  userId: string;
  firstName: string;
  lastName: string;
  amlCertificateKey: string | null;
  ceExpirationDate: string | null;
  complianceStatus: string;
  status: string;
}

type CEStatus = "active" | "expiring" | "expired" | "unknown";

interface AgentRow {
  userId: string;
  name: string;
  hasAmlCert: boolean;
  ceExpirationDate: string | null;
  ceStatus: CEStatus;
  ceDaysUntil: number | null;
  complianceSigned: boolean;
}

function deriveCEStatus(ceExpirationDate: string | null): { status: CEStatus; daysUntil: number | null } {
  if (!ceExpirationDate) return { status: "unknown", daysUntil: null };
  const now = new Date();
  const exp = new Date(ceExpirationDate);
  const diffMs = exp.getTime() - now.getTime();
  const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return { status: "expired", daysUntil };
  if (daysUntil <= 90) return { status: "expiring", daysUntil };
  return { status: "active", daysUntil };
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return `${String(d.getUTCMonth()+1).padStart(2,"0")}/${String(d.getUTCDate()).padStart(2,"0")}/${d.getUTCFullYear()}`;
  } catch { return "—"; }
}

function isComplete(row: AgentRow): boolean {
  return row.hasAmlCert && row.ceStatus === "active" && row.complianceSigned;
}

const tabs = ["All", "Complete", "Incomplete"] as const;

export default function ContractingTrainings() {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<typeof tabs[number]>("All");
  const [viewing, setViewing] = useState<AgentRow | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetch("/api/hcms/agents/", { credentials: "include" })
      .then(res => { if (!res.ok) throw new Error(`Failed to fetch agents (${res.status})`); return res.json(); })
      .then((data: Agent[]) => {
        setAgents(data.map(a => {
          const { status: ceStatus, daysUntil } = deriveCEStatus(a.ceExpirationDate);
          return { userId: a.userId, name: `${a.firstName} ${a.lastName}`, hasAmlCert: !!a.amlCertificateKey, ceExpirationDate: a.ceExpirationDate, ceStatus, ceDaysUntil: daysUntil, complianceSigned: a.complianceStatus === "signed" };
        }));
        setLoading(false);
      })
      .catch(err => { setError(err.message || "Failed to load training data"); setLoading(false); });
  };

  useEffect(() => { loadData(); }, []);

  const counts = useMemo(() => ({
    total: agents.length,
    amlComplete: agents.filter((a) => a.hasAmlCert).length,
    ceActive: agents.filter((a) => a.ceStatus === "active").length,
    complianceSigned: agents.filter((a) => a.complianceSigned).length,
  }), [agents]);

  const filtered = useMemo(() => {
    if (tab === "Complete") return agents.filter(isComplete);
    if (tab === "Incomplete") return agents.filter((a) => !isComplete(a));
    return agents;
  }, [agents, tab]);

  const cols: Column<AgentRow>[] = [
    {
      key: "name",
      label: "Agent",
      sortable: true,
      width: "18%",
      render: (v, row) => (
        <Link href={`/hcms/agents/${row.userId}`}>
          <span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>
            {v as string}
          </span>
        </Link>
      ),
    },
    {
      key: "hasAmlCert",
      label: "AML Certificate",
      width: "16%",
      render: (v) =>
        v ? (
          <span className="flex items-center gap-1" style={{ color: "var(--gc-status-active)", fontSize: "var(--gc-text-sm)" }}>
            <CheckCircle className="w-3.5 h-3.5" /> On File
          </span>
        ) : (
          <span className="flex items-center gap-1" style={{ color: "var(--gc-status-terminated)", fontSize: "var(--gc-text-sm)" }}>
            <XIcon className="w-3.5 h-3.5" /> Missing
          </span>
        ),
    },
    {
      key: "ceExpirationDate",
      label: "CE Expiration",
      sortable: true,
      width: "18%",
      render: (v, row) => (
        <div style={{ fontSize: "var(--gc-text-sm)" }}>
          <span style={{ color: "var(--gc-text-primary)" }}>{formatDate(v as string | null)}</span>
          {row.ceDaysUntil !== null && (
            <span
              style={{
                marginLeft: 6,
                color:
                  row.ceStatus === "expired"
                    ? "var(--gc-status-terminated)"
                    : row.ceStatus === "expiring"
                    ? "var(--gc-status-warning)"
                    : "var(--gc-text-muted)",
                fontSize: "var(--gc-text-xs)",
              }}
            >
              {row.ceDaysUntil < 0 ? `(expired ${Math.abs(row.ceDaysUntil)}d ago)` : `(${row.ceDaysUntil}d)`}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "ceStatus",
      label: "CE Status",
      width: "14%",
      render: (v) => {
        const status = v as CEStatus;
        if (status === "active") return <GCStatusBadge status="active" />;
        if (status === "expiring") return <GCStatusBadge status="warning" />;
        if (status === "expired") return <GCStatusBadge status="expired" />;
        return <span style={{ color: "var(--gc-text-muted)", fontSize: "var(--gc-text-sm)", fontStyle: "italic" }}>Unknown</span>;
      },
    },
    {
      key: "complianceSigned",
      label: "Compliance Agreement",
      width: "14%",
      render: (v) =>
        v ? (
          <span className="flex items-center gap-1" style={{ color: "var(--gc-status-active)", fontSize: "var(--gc-text-sm)" }}>
            <CheckCircle className="w-3.5 h-3.5" /> Signed
          </span>
        ) : (
          <span className="flex items-center gap-1" style={{ color: "var(--gc-status-warning)", fontSize: "var(--gc-text-sm)" }}>
            <XIcon className="w-3.5 h-3.5" /> Pending
          </span>
        ),
    },
    {
      key: "actions" as any,
      label: "",
      width: "8%",
      align: "center" as const,
      render: (_v: any, row: AgentRow) => (
        <button onClick={() => setViewing(row)} className="flex items-center gap-1" style={{
          padding: "var(--gc-space-1) var(--gc-space-3)",
          backgroundColor: "transparent",
          border: "1px solid var(--gc-border)",
          borderRadius: "var(--gc-radius-sm)",
          color: "var(--gc-gold)",
          cursor: "pointer",
          fontSize: "var(--gc-text-sm)",
        }}>
          <Eye className="w-3 h-3" /> View
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} />
        <span className="ml-3" style={{ color: "var(--gc-text-muted)", fontSize: "var(--gc-text-base)" }}>Loading training data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <GCPageHeader title="Training & Certifications" subtitle="AML certification, continuing education, and compliance agreement tracking" accentUnderline />
        <div className="flex items-center gap-3" style={{
          padding: "var(--gc-space-4)",
          backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)",
          borderRadius: "var(--gc-radius-md)",
        }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "var(--gc-status-terminated)" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500 }}>Unable to Load Training Data</div>
            <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{error}</div>
          </div>
          <button onClick={loadData} style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-secondary)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div data-tour-id={TOUR.ADMIN.CONTRACTING_TRAININGS.HEADER}>
        <GCPageHeader title="Training & Certifications" subtitle="AML certification, continuing education, and compliance agreement tracking" accentUnderline />
      </div>

      <div data-tour-id={TOUR.ADMIN.CONTRACTING_TRAININGS.SUMMARY} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Total Agents" value={counts.total} accentTop />
        <GCKPICard label="AML Complete" value={counts.amlComplete} accentTop delta={(counts.total - counts.amlComplete) > 0 ? { value: `${counts.total - counts.amlComplete} missing`, positive: false } : { value: "All complete", positive: true }} />
        <GCKPICard label="CE Active" value={counts.ceActive} accentTop delta={(counts.total - counts.ceActive) > 0 ? { value: `${counts.total - counts.ceActive} expired/unknown`, positive: false } : { value: "All current", positive: true }} />
        <GCKPICard label="Compliance Signed" value={counts.complianceSigned} accentTop delta={(counts.total - counts.complianceSigned) > 0 ? { value: `${counts.total - counts.complianceSigned} pending`, positive: false } : { value: "All signed", positive: true }} />
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map((t) => {
          const count = t === "All" ? agents.length : t === "Complete" ? agents.filter(isComplete).length : agents.filter((a) => !isComplete(a)).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "var(--gc-space-2) var(--gc-space-4)",
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-base)",
                fontWeight: tab === t ? 500 : 400,
                color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent",
                cursor: "pointer",
              }}
            >
              {t} <span style={{ fontSize: "var(--gc-text-xs)", opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search by agent name..." />

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setViewing(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 520, maxWidth: "95vw", maxHeight: "85vh", overflow: "auto", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)" }}>{viewing.name}</div>
                <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>Training & Certification Details</div>
              </div>
              <button onClick={() => setViewing(null)} style={{ padding: "var(--gc-space-2)", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--gc-text-muted)" }}><XIcon className="w-5 h-5" /></button>
            </div>

            <div className="flex flex-col gap-3">
              {/* AML Certificate */}
              <div style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border-subtle)", borderRadius: "var(--gc-radius-md)", borderLeft: `3px solid ${viewing.hasAmlCert ? "var(--gc-status-active)" : "var(--gc-status-terminated)"}` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {viewing.hasAmlCert ? <CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} /> : <XIcon className="w-4 h-4" style={{ color: "var(--gc-status-terminated)" }} />}
                    <div>
                      <div style={{ fontWeight: 500, color: "var(--gc-text-primary)" }}>AML Certificate</div>
                      <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>{viewing.hasAmlCert ? "Certificate on file" : "Not uploaded"}</div>
                    </div>
                  </div>
                  <GCStatusBadge status={viewing.hasAmlCert ? "active" : "warning"} />
                </div>
              </div>

              {/* CE Credits */}
              <div style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border-subtle)", borderRadius: "var(--gc-radius-md)", borderLeft: `3px solid ${viewing.ceStatus === "active" ? "var(--gc-status-active)" : viewing.ceStatus === "expiring" ? "var(--gc-status-warning)" : viewing.ceStatus === "expired" ? "var(--gc-status-terminated)" : "var(--gc-text-muted)"}` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {viewing.ceStatus === "active" ? <CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} /> : viewing.ceStatus === "unknown" ? <AlertTriangle className="w-4 h-4" style={{ color: "var(--gc-text-muted)" }} /> : <AlertTriangle className="w-4 h-4" style={{ color: viewing.ceStatus === "expiring" ? "var(--gc-status-warning)" : "var(--gc-status-terminated)" }} />}
                    <div>
                      <div style={{ fontWeight: 500, color: "var(--gc-text-primary)" }}>Continuing Education (CE)</div>
                      <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
                        {viewing.ceExpirationDate ? `Expires: ${formatDate(viewing.ceExpirationDate)}` : "No expiration date on file"}
                        {viewing.ceDaysUntil !== null && <span style={{ marginLeft: 6, color: viewing.ceStatus === "expired" ? "var(--gc-status-terminated)" : viewing.ceStatus === "expiring" ? "var(--gc-status-warning)" : "var(--gc-text-muted)" }}>
                          {viewing.ceDaysUntil < 0 ? `(expired ${Math.abs(viewing.ceDaysUntil)}d ago)` : `(${viewing.ceDaysUntil}d remaining)`}
                        </span>}
                      </div>
                    </div>
                  </div>
                  <GCStatusBadge status={viewing.ceStatus === "active" ? "active" : viewing.ceStatus === "expiring" ? "warning" : viewing.ceStatus === "expired" ? "expired" : "pending"} />
                </div>
              </div>

              {/* Compliance Agreement */}
              <div style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border-subtle)", borderRadius: "var(--gc-radius-md)", borderLeft: `3px solid ${viewing.complianceSigned ? "var(--gc-status-active)" : "var(--gc-status-pending)"}` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {viewing.complianceSigned ? <CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} /> : <XIcon className="w-4 h-4" style={{ color: "var(--gc-status-pending)" }} />}
                    <div>
                      <div style={{ fontWeight: 500, color: "var(--gc-text-primary)" }}>Compliance & Ethics Agreement</div>
                      <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>{viewing.complianceSigned ? "Signed" : "Pending signature"}</div>
                    </div>
                  </div>
                  <GCStatusBadge status={viewing.complianceSigned ? "active" : "pending"} />
                </div>
              </div>
            </div>

            {/* Completion Summary */}
            <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--gc-border-subtle)" }}>
              <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
                {[viewing.hasAmlCert, viewing.ceStatus === "active", viewing.complianceSigned].filter(Boolean).length}/3 complete
              </span>
              <GCStatusBadge status={viewing.hasAmlCert && viewing.ceStatus === "active" && viewing.complianceSigned ? "active" : "warning"} />
            </div>

            <Link href={`/hcms/agents/${viewing.userId}`}>
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
      )}
    </div>
  );
}
