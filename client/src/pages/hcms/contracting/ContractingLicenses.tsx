import { useState, useMemo, useEffect } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { TOUR } from "@/lib/tour/selectors";
import { Link } from "wouter";
import { ExternalLink, RefreshCw, Eye, X as XIcon, Loader2, AlertTriangle } from "lucide-react";

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return `${String(date.getUTCMonth()+1).padStart(2,"0")}/${String(date.getUTCDate()).padStart(2,"0")}/${date.getUTCFullYear()}`;
  } catch { return "—"; }
}

interface License {
  id: number;
  stateCode: string;
  licenseNumber: string;
  licenseType: string;
  status: string;
  effectiveDate: string;
  expirationDate: string;
  isResident: boolean;
  syncSource: string;
}

interface AgentFromAPI {
  userId: string;
  firstName: string;
  lastName: string;
  npn: string;
  state: string;
  status: string;
}

interface AgentLicensesFromAPI {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  licenses: License[];
}

interface AgentRow {
  userId: string;
  name: string;
  npn: string;
  residentState: string;
  licenses: License[];
  licenseCount: number;
  activeCount: number;
  states: string;
}

const tabs = ["All", "Multi-State", "Single State", "No Licenses"] as const;

export default function ContractingLicenses() {
  const [tab, setTab] = useState<typeof tabs[number]>("All");
  const [viewing, setViewing] = useState<AgentRow | null>(null);
  const [popupPage, setPopupPage] = useState(0);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const LICENSES_PER_PAGE = 5;

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [agentsRes, licensesRes] = await Promise.all([
        fetch("/api/hcms/agents/", { credentials: "include" }),
        fetch("/api/hcms/agents/licenses/all", { credentials: "include" }),
      ]);

      if (!agentsRes.ok) throw new Error(`Failed to fetch agents: ${agentsRes.status}`);
      if (!licensesRes.ok) throw new Error(`Failed to fetch licenses: ${licensesRes.status}`);

      const agentList: AgentFromAPI[] = await agentsRes.json();
      const licenseList: AgentLicensesFromAPI[] = await licensesRes.json();

      // Build a map of userId -> licenses
      const licenseMap = new Map<string, License[]>();
      for (const entry of licenseList) {
        licenseMap.set(entry.userId, entry.licenses || []);
      }

      // Merge agent list with license data
      const merged: AgentRow[] = agentList.map((agent) => {
        const licenses = licenseMap.get(agent.userId) || [];
        const activeCount = licenses.filter((l) => l.status === "active").length;
        const statesList = Array.from(new Set(licenses.map((l: any) => l.stateCode))).join(", ");
        const residentLicense = licenses.find((l) => l.isResident);

        return {
          userId: agent.userId,
          name: `${agent.firstName} ${agent.lastName}`,
          npn: agent.npn || "",
          residentState: residentLicense?.stateCode || agent.state || "—",
          licenses,
          licenseCount: licenses.length,
          activeCount,
          states: statesList,
        };
      });

      setAgents(merged);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const counts = useMemo(() => {
    const totalLicenses = agents.reduce((sum, a) => sum + a.licenseCount, 0);
    const activeLicenses = agents.reduce((sum, a) => sum + a.activeCount, 0);
    const missingLicenses = agents.filter((a) => a.licenseCount === 0).length;
    return {
      totalAgents: agents.length,
      totalLicenses,
      activeLicenses,
      missingLicenses,
      multiState: agents.filter((a) => a.licenseCount > 1).length,
      singleState: agents.filter((a) => a.licenseCount === 1).length,
      noLicenses: agents.filter((a) => a.licenseCount === 0).length,
    };
  }, [agents]);

  const filtered = useMemo(() => {
    if (tab === "Multi-State") return agents.filter((a) => a.licenseCount > 1);
    if (tab === "Single State") return agents.filter((a) => a.licenseCount === 1);
    if (tab === "No Licenses") return agents.filter((a) => a.licenseCount === 0);
    return agents;
  }, [tab, agents]);

  const cols: Column<AgentRow>[] = [
    {
      key: "name",
      label: "Agent",
      sortable: true,
      width: "18%",
      render: (v, row) => (
        <Link href={`/hcms/agents/${row.userId}`}>
          <span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span>
        </Link>
      ),
    },
    {
      key: "npn",
      label: "NPN",
      width: "10%",
      render: (v) =>
        v ? (
          <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span>
        ) : (
          <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>None</span>
        ),
    },
    {
      key: "residentState",
      label: "Resident State",
      width: "10%",
      render: (v) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      key: "licenseCount",
      label: "# of Licenses",
      width: "10%",
      align: "center",
      sortable: true,
      render: (v) => (
        <span
          style={{
            fontFamily: "var(--gc-font-display)",
            fontWeight: 600,
            color: v > 0 ? "var(--gc-text-primary)" : "var(--gc-status-terminated)",
          }}
        >
          {v}
        </span>
      ),
    },
    {
      key: "activeCount",
      label: "Active / Total",
      width: "10%",
      align: "center",
      render: (v, row) => (
        <span style={{ fontSize: "var(--gc-text-sm)" }}>
          <span style={{ fontWeight: 600, color: "var(--gc-status-active)" }}>{v}</span>
          <span style={{ color: "var(--gc-text-muted)" }}> / {row.licenseCount}</span>
        </span>
      ),
    },
    {
      key: "states",
      label: "States",
      width: "24%",
      render: (v, row) => {
        if (row.licenseCount === 0)
          return (
            <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>No licenses</span>
          );
        const stateArr = v ? (v as string).split(", ") : [];
        const MAX_SHOWN = 5;
        const shown = stateArr.slice(0, MAX_SHOWN);
        const remaining = stateArr.length - MAX_SHOWN;
        return (
          <div className="flex flex-wrap items-center gap-1">
            {shown.map((s: string) => {
              const lic = row.licenses.find((l) => l.stateCode === s);
              const isActive = lic?.status === "active";
              return (
                <span
                  key={s}
                  style={{
                    padding: "1px 6px",
                    borderRadius: "var(--gc-radius-sm)",
                    fontSize: "var(--gc-text-xs)",
                    fontWeight: 600,
                    color: isActive ? "var(--gc-status-active)" : "var(--gc-status-terminated)",
                    backgroundColor: `color-mix(in srgb, ${isActive ? "var(--gc-status-active)" : "var(--gc-status-terminated)"} 12%, transparent)`,
                  }}
                >
                  {s}
                  {lic?.isResident ? " \u2605" : ""}
                </span>
              );
            })}
            {remaining > 0 && (
              <span
                onClick={() => {
                  setViewing(row);
                  setPopupPage(0);
                }}
                style={{
                  padding: "1px 6px",
                  borderRadius: "var(--gc-radius-sm)",
                  fontSize: "var(--gc-text-xs)",
                  fontWeight: 600,
                  color: "var(--gc-gold)",
                  backgroundColor: "color-mix(in srgb, var(--gc-gold) 12%, transparent)",
                  cursor: "pointer",
                }}
              >
                +{remaining} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "",
      width: "8%",
      align: "center",
      render: (_v, row) =>
        row.licenseCount > 0 ? (
          <button
            onClick={() => {
              setViewing(row);
              setPopupPage(0);
            }}
            className="flex items-center gap-1"
            style={{
              padding: "var(--gc-space-1) var(--gc-space-3)",
              backgroundColor: "transparent",
              border: "1px solid var(--gc-border)",
              borderRadius: "var(--gc-radius-sm)",
              color: "var(--gc-gold)",
              cursor: "pointer",
              fontSize: "var(--gc-text-sm)",
              fontFamily: "var(--gc-font-body)",
            }}
          >
            <Eye className="w-3 h-3" /> View
          </button>
        ) : null,
    },
  ];

  const licenseDetailCols: Column<License>[] = [
    { key: "stateCode", label: "State", width: "10%" },
    {
      key: "licenseNumber",
      label: "License #",
      width: "18%",
      render: (v) => <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span>,
    },
    { key: "licenseType", label: "Type", width: "18%" },
    {
      key: "status",
      label: "Status",
      width: "12%",
      render: (v) => <GCStatusBadge status={v} />,
    },
    { key: "effectiveDate", label: "Effective", width: "14%", render: (v) => formatDate(v) },
    { key: "expirationDate", label: "Expiration", width: "14%", render: (v) => formatDate(v) },
    {
      key: "isResident",
      label: "Resident",
      width: "10%",
      render: (v) => (v ? "Yes" : "No"),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ padding: "var(--gc-space-16)" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} />
        <span style={{ marginLeft: "var(--gc-space-3)", color: "var(--gc-text-secondary)" }}>
          Loading license data...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <GCPageHeader
          title="State Licenses"
          subtitle="Agent license data synced from SureLC / NIPR — click View to see individual licenses"
          accentUnderline
        />
        <div
          style={{
            margin: "var(--gc-space-6) 0",
            padding: "var(--gc-space-6)",
            backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)",
            border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 30%, transparent)",
            borderRadius: "var(--gc-radius-md)",
            textAlign: "center",
          }}
        >
          <AlertTriangle
            className="w-8 h-8 mx-auto mb-3"
            style={{ color: "var(--gc-status-terminated)" }}
          />
          <p
            style={{
              fontFamily: "var(--gc-font-display)",
              fontSize: "var(--gc-text-lg)",
              fontWeight: 600,
              color: "var(--gc-text-primary)",
              margin: "0 0 var(--gc-space-2) 0",
            }}
          >
            Unable to Load Licenses
          </p>
          <p
            style={{
              fontSize: "var(--gc-text-sm)",
              color: "var(--gc-text-muted)",
              margin: "0 0 var(--gc-space-4) 0",
            }}
          >
            {error}
          </p>
          <button
            onClick={() => loadData()}
            className="flex items-center gap-2 mx-auto"
            style={{
              padding: "var(--gc-space-2) var(--gc-space-4)",
              backgroundColor: "var(--gc-gold)",
              color: "var(--gc-bg)",
              border: "none",
              borderRadius: "var(--gc-radius-sm)",
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-sm)",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div data-tour-id={TOUR.ADMIN.CONTRACTING_LICENSES.HEADER}>
      <GCPageHeader
        title="State Licenses"
        subtitle="Agent license data synced from SureLC / NIPR — click View to see individual licenses"
        accentUnderline
        actions={
          <div className="flex gap-2">
            <button
              className="flex items-center gap-1"
              disabled
              title="SureLC sync not yet configured"
              style={{
                padding: "var(--gc-space-2) var(--gc-space-4)",
                backgroundColor: "var(--gc-surface)",
                color: "var(--gc-text-secondary)",
                borderRadius: "var(--gc-radius-sm)",
                border: "1px solid var(--gc-border)",
                cursor: "not-allowed",
                opacity: 0.5,
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-base)",
              }}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Sync
            </button>
            <a
              href="https://www.surelc.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 no-underline"
              style={{
                padding: "var(--gc-space-2) var(--gc-space-4)",
                backgroundColor: "var(--gc-surface)",
                color: "var(--gc-text-secondary)",
                borderRadius: "var(--gc-radius-sm)",
                border: "1px solid var(--gc-border)",
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-base)",
              }}
            >
              <ExternalLink className="w-3.5 h-3.5" /> SureLC
            </a>
          </div>
        }
      />
      </div>

      <div
        className="flex items-center gap-2 mb-4"
        style={{
          padding: "var(--gc-space-3) var(--gc-space-4)",
          backgroundColor: "color-mix(in srgb, var(--gc-status-review) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--gc-status-review) 30%, transparent)",
          borderRadius: "var(--gc-radius-md)",
        }}
      >
        <ExternalLink className="w-4 h-4" style={{ color: "var(--gc-status-review)" }} />
        <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-review)" }}>
          Read-only — data sourced from SureLC / NIPR.
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Total Agents" value={counts.totalAgents} accentTop />
        <GCKPICard label="Total Licenses" value={counts.totalLicenses} accentTop />
        <GCKPICard label="Active Licenses" value={counts.activeLicenses} accentTop />
        <GCKPICard
          label="Agents Missing Licenses"
          value={counts.missingLicenses}
          accentTop
          delta={counts.missingLicenses > 0 ? { value: "Need licensing", positive: false } : { value: "All licensed", positive: true }}
        />
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map((t) => {
          const count =
            t === "All"
              ? agents.length
              : t === "Multi-State"
                ? counts.multiState
                : t === "Single State"
                  ? counts.singleState
                  : counts.noLicenses;
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
              {t}{" "}
              <span style={{ fontSize: "var(--gc-text-xs)", opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search by agent name or NPN..." />

      {/* License Detail Modal */}
      {viewing && (() => {
        const totalPages = Math.ceil(viewing.licenses.length / LICENSES_PER_PAGE);
        const pagedLicenses = viewing.licenses.slice(
          popupPage * LICENSES_PER_PAGE,
          (popupPage + 1) * LICENSES_PER_PAGE
        );
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => {
              setViewing(null);
              setPopupPage(0);
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 640,
                maxWidth: "95vw",
                maxHeight: "85vh",
                overflow: "auto",
                backgroundColor: "var(--gc-surface)",
                border: "1px solid var(--gc-border)",
                borderRadius: "var(--gc-radius-md)",
                padding: "var(--gc-space-6)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div
                    style={{
                      fontFamily: "var(--gc-font-display)",
                      fontSize: "var(--gc-text-xl)",
                      color: "var(--gc-text-primary)",
                    }}
                  >
                    {viewing.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--gc-font-body)",
                      fontSize: "var(--gc-text-sm)",
                      color: "var(--gc-text-muted)",
                    }}
                  >
                    NPN: {viewing.npn || "Not assigned"} · {viewing.licenseCount} license
                    {viewing.licenseCount !== 1 ? "s" : ""} across{" "}
                    {new Set(viewing.licenses.map((l) => l.stateCode)).size} state
                    {new Set(viewing.licenses.map((l) => l.stateCode)).size !== 1 ? "s" : ""}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setViewing(null);
                    setPopupPage(0);
                  }}
                  style={{
                    padding: "var(--gc-space-2)",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--gc-text-muted)",
                  }}
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {/* License Table */}
              {viewing.licenses.length > 0 ? (
                <GCDataTable columns={licenseDetailCols} data={pagedLicenses} />
              ) : (
                <div
                  style={{
                    padding: "var(--gc-space-8)",
                    textAlign: "center",
                    color: "var(--gc-text-muted)",
                  }}
                >
                  No licenses on file for this agent.
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  className="flex items-center justify-between mt-4 pt-4"
                  style={{ borderTop: "1px solid var(--gc-border-subtle)" }}
                >
                  <span
                    style={{
                      fontFamily: "var(--gc-font-body)",
                      fontSize: "var(--gc-text-sm)",
                      color: "var(--gc-text-muted)",
                    }}
                  >
                    Showing {popupPage * LICENSES_PER_PAGE + 1}–
                    {Math.min((popupPage + 1) * LICENSES_PER_PAGE, viewing.licenses.length)} of{" "}
                    {viewing.licenses.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPopupPage((p) => Math.max(0, p - 1))}
                      disabled={popupPage === 0}
                      style={{
                        padding: "var(--gc-space-1) var(--gc-space-3)",
                        borderRadius: "var(--gc-radius-sm)",
                        border: "1px solid var(--gc-border)",
                        backgroundColor: "var(--gc-surface)",
                        color: "var(--gc-text-secondary)",
                        cursor: popupPage === 0 ? "default" : "pointer",
                        opacity: popupPage === 0 ? 0.4 : 1,
                        fontFamily: "var(--gc-font-body)",
                        fontSize: "var(--gc-text-sm)",
                      }}
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setPopupPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={popupPage >= totalPages - 1}
                      style={{
                        padding: "var(--gc-space-1) var(--gc-space-3)",
                        borderRadius: "var(--gc-radius-sm)",
                        border: "1px solid var(--gc-border)",
                        backgroundColor: "var(--gc-surface)",
                        color: "var(--gc-text-secondary)",
                        cursor: popupPage >= totalPages - 1 ? "default" : "pointer",
                        opacity: popupPage >= totalPages - 1 ? 0.4 : 1,
                        fontFamily: "var(--gc-font-body)",
                        fontSize: "var(--gc-text-sm)",
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

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
        );
      })()}
    </div>
  );
}
