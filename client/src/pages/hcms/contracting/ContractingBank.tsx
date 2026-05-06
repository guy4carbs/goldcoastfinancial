import { useState, useEffect, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { TOUR } from "@/lib/tour/selectors";
import { Link } from "wouter";
import { CheckCircle, X as XIcon, Eye, Loader2, AlertTriangle } from "lucide-react";

interface Agent {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  bankName: string;
  bankAccountType: string;
  routingLast4: string | null;
  accountLast4: string | null;
  directDepositFormKey: string | null;
  status: string;
}

type DDStatus = "active" | "pending" | "missing";

interface BankRow {
  userId: string;
  name: string;
  email: string;
  bankName: string;
  accountType: string;
  routingLast4: string | null;
  accountLast4: string | null;
  ddFormOnFile: boolean;
  ddStatus: DDStatus;
}

function deriveDDStatus(agent: Agent): DDStatus {
  if (agent.bankName && agent.directDepositFormKey) return "active";
  if (agent.bankName && !agent.directDepositFormKey) return "pending";
  return "missing";
}

function toRow(agent: Agent): BankRow {
  return {
    userId: agent.userId,
    name: `${agent.firstName} ${agent.lastName}`,
    email: agent.email,
    bankName: agent.bankName || "",
    accountType: agent.bankAccountType || "",
    routingLast4: agent.routingLast4,
    accountLast4: agent.accountLast4,
    ddFormOnFile: !!agent.directDepositFormKey,
    ddStatus: deriveDDStatus(agent),
  };
}

const tabs = ["All", "Active", "Pending", "Missing"] as const;

const FileIcon = ({ ok }: { ok: boolean }) =>
  ok ? (
    <span className="flex items-center gap-1" style={{ color: "var(--gc-status-active)", fontSize: "var(--gc-text-sm)" }}>
      <CheckCircle className="w-3.5 h-3.5" /> On File
    </span>
  ) : (
    <span className="flex items-center gap-1" style={{ color: "var(--gc-status-terminated)", fontSize: "var(--gc-text-sm)" }}>
      <XIcon className="w-3.5 h-3.5" /> Missing
    </span>
  );

export default function ContractingBank() {
  const [rows, setRows] = useState<BankRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<typeof tabs[number]>("All");
  const [viewBank, setViewBank] = useState<BankRow | null>(null);

  function loadData() {
    setLoading(true);
    setError("");
    fetch("/api/hcms/agents/", { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load agents");
        return r.json();
      })
      .then((agents: Agent[]) => {
        setRows(Array.isArray(agents) ? agents.map(toRow) : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load data");
        setLoading(false);
      });
  }

  useEffect(() => {
    loadData();
  }, []);

  const counts = useMemo(
    () => ({
      all: rows.length,
      active: rows.filter((r) => r.ddStatus === "active").length,
      pending: rows.filter((r) => r.ddStatus === "pending").length,
      missing: rows.filter((r) => r.ddStatus === "missing").length,
    }),
    [rows]
  );

  const filtered = useMemo(() => {
    if (tab === "All") return rows;
    return rows.filter((r) => r.ddStatus === tab.toLowerCase());
  }, [tab, rows]);

  const cols: Column<BankRow>[] = [
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
      key: "bankName",
      label: "Bank Name",
      sortable: true,
      width: "16%",
      render: (v) =>
        v || <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>Not provided</span>,
    },
    {
      key: "accountType",
      label: "Account Type",
      width: "10%",
      render: (v) => v || "—",
    },
    {
      key: "routingLast4",
      label: "Routing #",
      width: "10%",
      render: (v) =>
        v ? (
          <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span>
        ) : (
          <span style={{ color: "var(--gc-text-muted)" }}>—</span>
        ),
    },
    {
      key: "accountLast4",
      label: "Account #",
      width: "10%",
      render: (v) =>
        v ? (
          <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span>
        ) : (
          <span style={{ color: "var(--gc-text-muted)" }}>—</span>
        ),
    },
    {
      key: "ddFormOnFile",
      label: "DD Form",
      width: "10%",
      align: "center",
      render: (v) => <FileIcon ok={v} />,
    },
    {
      key: "ddStatus",
      label: "DD Status",
      width: "10%",
      render: (v) => (
        <GCStatusBadge
          status={v === "active" ? "active" : v === "pending" ? "pending" : "warning"}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      width: "8%",
      align: "center",
      render: (_v, row) => (
        <button
          onClick={() => setViewBank(row)}
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
      ),
    },
  ];

  if (error) {
    return (
      <div>
        <GCPageHeader title="Bank Details" subtitle="Agent banking information & direct deposit status" accentUnderline />
        <div className="flex items-center gap-3" style={{
          padding: "var(--gc-space-4)",
          backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)",
          borderRadius: "var(--gc-radius-md)",
        }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "var(--gc-status-terminated)" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500 }}>Unable to Load Bank Details</div>
            <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{error}</div>
          </div>
          <button onClick={loadData} style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-secondary)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}>Retry</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ padding: "var(--gc-space-8)" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} />
      </div>
    );
  }

  return (
    <div>
      <div data-tour-id={TOUR.ADMIN.CONTRACTING_BANK.HEADER}>
        <GCPageHeader title="Bank Details" subtitle="Agent banking information & direct deposit status" accentUnderline />
      </div>

      {/* KPI Cards */}
      <div data-tour-id={TOUR.ADMIN.CONTRACTING_BANK.SUMMARY} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Total Agents" value={counts.all} accentTop />
        <GCKPICard label="Active Direct Deposit" value={counts.active} accentTop />
        <GCKPICard
          label="Pending Setup"
          value={counts.pending}
          accentTop
          delta={counts.pending > 0 ? { value: "Awaiting DD form", positive: false } : { value: "All set", positive: true }}
        />
        <GCKPICard
          label="Missing Bank Info"
          value={counts.missing}
          accentTop
          delta={counts.missing > 0 ? { value: "Action needed", positive: false } : { value: "All provided", positive: true }}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {tabs.map((t) => {
          const count =
            t === "All"
              ? counts.all
              : t === "Active"
              ? counts.active
              : t === "Pending"
              ? counts.pending
              : counts.missing;
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

      {/* Data Table */}
      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search by agent or bank..." />

      {/* View Bank Detail Popup */}
      {viewBank && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setViewBank(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 520,
              maxWidth: "95vw",
              backgroundColor: "var(--gc-surface)",
              border: "1px solid var(--gc-border)",
              borderRadius: "var(--gc-radius-md)",
              padding: "var(--gc-space-6)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div
                  style={{
                    fontFamily: "var(--gc-font-display)",
                    fontSize: "var(--gc-text-xl)",
                    color: "var(--gc-text-primary)",
                  }}
                >
                  {viewBank.name}
                </div>
                <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
                  Banking & Direct Deposit Details
                </div>
              </div>
              <button
                onClick={() => setViewBank(null)}
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
            <div
              style={{
                padding: "var(--gc-space-4)",
                backgroundColor: "var(--gc-surface-2)",
                borderRadius: "var(--gc-radius-md)",
                border: "1px solid var(--gc-border-subtle)",
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                {([
                  ["Bank Name", viewBank.bankName || "Not provided"],
                  ["Account Type", viewBank.accountType || "—"],
                  ["Routing Number", viewBank.routingLast4 || "—"],
                  ["Account Number", viewBank.accountLast4 || "—"],
                ] as [string, string][]).map(([label, val]) => (
                  <div key={label}>
                    <div
                      style={{
                        fontSize: "var(--gc-text-xs)",
                        letterSpacing: "var(--gc-tracking-wider)",
                        textTransform: "uppercase" as const,
                        color: "var(--gc-text-muted)",
                        marginBottom: 2,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--gc-text-base)",
                        color: "var(--gc-text-primary)",
                        fontFamily:
                          label === "Routing Number" || label === "Account Number"
                            ? "monospace"
                            : "var(--gc-font-body)",
                      }}
                    >
                      {val}
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="flex gap-6 mt-4 pt-4"
                style={{ borderTop: "1px solid var(--gc-border-subtle)" }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "var(--gc-text-xs)",
                      letterSpacing: "var(--gc-tracking-wider)",
                      textTransform: "uppercase" as const,
                      color: "var(--gc-text-muted)",
                      marginBottom: 2,
                    }}
                  >
                    Direct Deposit Form
                  </div>
                  <FileIcon ok={viewBank.ddFormOnFile} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "var(--gc-text-xs)",
                      letterSpacing: "var(--gc-tracking-wider)",
                      textTransform: "uppercase" as const,
                      color: "var(--gc-text-muted)",
                      marginBottom: 2,
                    }}
                  >
                    DD Status
                  </div>
                  <GCStatusBadge
                    status={
                      viewBank.ddStatus === "active"
                        ? "active"
                        : viewBank.ddStatus === "pending"
                        ? "pending"
                        : "warning"
                    }
                  />
                </div>
              </div>
              {viewBank.email && (
                <div className="mt-3" style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
                  Email: {viewBank.email}
                </div>
              )}
              <Link href={`/hcms/agents/${viewBank.userId}`}>
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
