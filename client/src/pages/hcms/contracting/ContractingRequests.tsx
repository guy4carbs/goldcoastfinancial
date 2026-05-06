import { useState, useMemo, useEffect } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { TOUR } from "@/lib/tour/selectors";
import { Eye, X as XIcon, Loader2, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

interface Request {
  id: number;
  carrier: string;
  states: string[];
  status: string;
  returnedReason: string | null;
  createdAt: string;
}

interface AgentRequests {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  requests: Request[];
}

const tabs = ["All Agents", "Has Drafts", "Awaiting Carrier", "Has Returns"] as const;

function mapStatusToBadge(status: string): string {
  switch (status) {
    case "draft": return "pending";
    case "awaiting_carrier": return "review";
    case "returned": return "warning";
    case "approved":
    case "appointed": return "active";
    case "denied": return "terminated";
    default: return "pending";
  }
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "\u2014";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "\u2014";
    return `${String(d.getUTCMonth() + 1).padStart(2, "0")}/${String(d.getUTCDate()).padStart(2, "0")}/${d.getUTCFullYear()}`;
  } catch {
    return "\u2014";
  }
}

export default function ContractingRequests() {
  const [data, setData] = useState<AgentRequests[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<typeof tabs[number]>("All Agents");
  const [viewing, setViewing] = useState<AgentRequests | null>(null);
  const [popupPage, setPopupPage] = useState(0);
  const PER_PAGE = 5;

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetch("/api/hcms/agents/requests/all", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
        return res.json();
      })
      .then((json: AgentRequests[]) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const allReqs = useMemo(() => data.flatMap((a) => a.requests), [data]);

  const counts = useMemo(() => ({
    totalAgents: data.length,
    totalRequests: allReqs.length,
    awaitingCarrier: allReqs.filter((r) => r.status === "awaiting_carrier").length,
    returned: allReqs.filter((r) => r.status === "returned").length,
    hasDrafts: data.filter((a) => a.requests.some((r) => r.status === "draft")).length,
    hasAwaiting: data.filter((a) => a.requests.some((r) => r.status === "awaiting_carrier")).length,
    hasReturns: data.filter((a) => a.requests.some((r) => r.status === "returned")).length,
  }), [data, allReqs]);

  const filtered = useMemo(() => {
    if (tab === "Has Drafts") return data.filter((a) => a.requests.some((r) => r.status === "draft"));
    if (tab === "Awaiting Carrier") return data.filter((a) => a.requests.some((r) => r.status === "awaiting_carrier"));
    if (tab === "Has Returns") return data.filter((a) => a.requests.some((r) => r.status === "returned"));
    return data;
  }, [tab, data]);

  const cols: Column<AgentRequests>[] = [
    {
      key: "firstName",
      label: "Agent",
      sortable: true,
      width: "22%",
      render: (_v, row) => (
        <Link href={`/hcms/agents/${row.userId}`}>
          <span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>
            {row.firstName} {row.lastName}
          </span>
        </Link>
      ),
    },
    {
      key: "requests",
      label: "Total Requests",
      width: "12%",
      align: "center",
      render: (v) => (
        <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: (v as Request[]).length > 0 ? "var(--gc-text-primary)" : "var(--gc-text-muted)" }}>
          {(v as Request[]).length}
        </span>
      ),
    },
    {
      key: "draftCount",
      label: "Draft",
      width: "10%",
      align: "center",
      render: (_v, row) => {
        const c = row.requests.filter((r) => r.status === "draft").length;
        return <span style={{ color: c > 0 ? "var(--gc-status-pending)" : "var(--gc-text-muted)" }}>{c}</span>;
      },
    },
    {
      key: "pendingCount",
      label: "Pending",
      width: "10%",
      align: "center",
      render: (_v, row) => {
        const c = row.requests.filter((r) => r.status === "awaiting_carrier").length;
        return <span style={{ color: c > 0 ? "var(--gc-status-review)" : "var(--gc-text-muted)" }}>{c}</span>;
      },
    },
    {
      key: "returnedCount",
      label: "Returned",
      width: "10%",
      align: "center",
      render: (_v, row) => {
        const c = row.requests.filter((r) => r.status === "returned").length;
        return <span style={{ color: c > 0 ? "var(--gc-status-warning)" : "var(--gc-text-muted)" }}>{c}</span>;
      },
    },
    {
      key: "appointedCount",
      label: "Appointed",
      width: "10%",
      align: "center",
      render: (_v, row) => {
        const c = row.requests.filter((r) => r.status === "appointed").length;
        return <span style={{ color: c > 0 ? "var(--gc-status-active)" : "var(--gc-text-muted)" }}>{c}</span>;
      },
    },
    {
      key: "actions",
      label: "",
      width: "8%",
      align: "center",
      render: (_v, row) =>
        row.requests.length > 0 ? (
          <button
            onClick={() => { setViewing(row); setPopupPage(0); }}
            className="flex items-center gap-1"
            style={{
              padding: "var(--gc-space-1) var(--gc-space-3)",
              backgroundColor: "transparent",
              border: "1px solid var(--gc-border)",
              borderRadius: "var(--gc-radius-sm)",
              color: "var(--gc-gold)",
              cursor: "pointer",
              fontSize: "var(--gc-text-sm)",
            }}
          >
            <Eye className="w-3 h-3" /> View
          </button>
        ) : null,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
        <div
          style={{
            padding: "var(--gc-space-6)",
            backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)",
            border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 30%, transparent)",
            borderRadius: "var(--gc-radius-md)",
            textAlign: "center",
            maxWidth: 480,
            width: "100%",
          }}
        >
          <AlertTriangle className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--gc-status-terminated)" }} />
          <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>
            Unable to Load Requests
          </div>
          <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-4)" }}>
            {error}
          </div>
          <button
            onClick={loadData}
            style={{
              padding: "var(--gc-space-2) var(--gc-space-5)",
              backgroundColor: "var(--gc-gold)",
              color: "var(--gc-surface)",
              border: "none",
              borderRadius: "var(--gc-radius-sm)",
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-sm)",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div data-tour-id={TOUR.ADMIN.CONTRACTING_REQUESTS.HEADER}>
        <GCPageHeader
          title="Contracting Requests"
          subtitle="Carrier contracting requests across all agents"
          accentUnderline
        />
      </div>

      <div data-tour-id={TOUR.ADMIN.CONTRACTING_REQUESTS.KPIS} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Total Agents with Requests" value={counts.totalAgents} accentTop />
        <GCKPICard label="Total Requests" value={counts.totalRequests} accentTop />
        <GCKPICard label="Awaiting Carrier" value={counts.awaitingCarrier} accentTop delta={counts.awaitingCarrier > 0 ? { value: "Needs attention", positive: false } : { value: "All clear", positive: true }} />
        <GCKPICard label="Returned from Carrier" value={counts.returned} accentTop delta={counts.returned > 0 ? { value: "Action needed", positive: false } : { value: "All clear", positive: true }} />
      </div>

      <div data-tour-id={TOUR.ADMIN.CONTRACTING_REQUESTS.TABS} className="flex gap-1 mb-4">
        {tabs.map((t) => {
          const count =
            t === "All Agents" ? data.length :
            t === "Has Drafts" ? counts.hasDrafts :
            t === "Awaiting Carrier" ? counts.hasAwaiting :
            counts.hasReturns;
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

      <div data-tour-id={TOUR.ADMIN.CONTRACTING_REQUESTS.TABLE}>
        <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search by agent name..." />
      </div>

      {/* View Agent Requests Popup */}
      {viewing && (() => {
        const totalPages = Math.ceil(viewing.requests.length / PER_PAGE);
        const paged = viewing.requests.slice(popupPage * PER_PAGE, (popupPage + 1) * PER_PAGE);
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => setViewing(null)}
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
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)" }}>
                    {viewing.firstName} {viewing.lastName}
                  </div>
                  <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
                    {viewing.requests.length} request{viewing.requests.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <button
                  onClick={() => setViewing(null)}
                  style={{ padding: "var(--gc-space-2)", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--gc-text-muted)" }}
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {viewing.requests.length === 0 ? (
                <div style={{ padding: "var(--gc-space-6)", textAlign: "center", color: "var(--gc-text-muted)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)" }}>
                  No requests found for this agent.
                </div>
              ) : (<>
              <div className="flex flex-col gap-3">
                {paged.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: "var(--gc-space-4)",
                      backgroundColor: "var(--gc-surface-2)",
                      border: "1px solid var(--gc-border-subtle)",
                      borderRadius: "var(--gc-radius-md)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, color: "var(--gc-text-primary)" }}>
                          {r.carrier}
                        </div>
                        <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
                          {r.states.join(", ")}
                        </div>
                        <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "capitalize" }}>
                          {r.status.replace(/_/g, " ")}
                        </div>
                      </div>
                      <GCStatusBadge status={mapStatusToBadge(r.status)} />
                    </div>

                    {r.returnedReason && (
                      <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-warning)", marginBottom: "var(--gc-space-2)" }}>
                        {r.returnedReason}
                      </div>
                    )}

                    <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
                      Submitted: {formatDate(r.createdAt)}
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--gc-border-subtle)" }}>
                  <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
                    Showing {popupPage * PER_PAGE + 1}–{Math.min((popupPage + 1) * PER_PAGE, viewing.requests.length)} of {viewing.requests.length}
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
                        fontSize: "var(--gc-text-sm)",
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
              </>)}

              <Link href={`/hcms/agents/${viewing.userId}`}>
                <span className="flex items-center justify-center gap-2 mt-4" style={{
                  padding: "var(--gc-space-2) var(--gc-space-4)",
                  backgroundColor: "color-mix(in srgb, var(--gc-gold) 10%, transparent)",
                  border: "1px solid var(--gc-gold)",
                  borderRadius: "var(--gc-radius-sm)",
                  color: "var(--gc-gold)",
                  fontSize: "var(--gc-text-sm)",
                  fontWeight: 500,
                  cursor: "pointer",
                  textAlign: "center",
                  display: "block",
                }}>View Full Profile</span>
              </Link>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
