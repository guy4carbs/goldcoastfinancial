import { useState, useEffect, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { TOUR } from "@/lib/tour/selectors";
import { Link } from "wouter";
import { CheckCircle, X as XIcon, Loader2, AlertTriangle, Eye } from "lucide-react";

interface Agent {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  dbaType: string;
  companyName: string;
  dbaName: string;
  ein: string;
  companyType: string;
  stateOfInc: string;
  formationDate: string;
  businessEmail: string;
  businessPhone: string;
  businessStreet: string;
  businessCity: string;
  businessState: string;
  businessZip: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  npn: string;
  dateOfBirth: string;
  articlesKey: string | null;
  owners: any[];
}

interface IndividualRow {
  userId: string;
  name: string;
  npn: string;
  dob: string;
  address: string;
  state: string;
}

interface EntityRow {
  userId: string;
  name: string;
  entityName: string;
  dbaName: string;
  ein: string;
  companyType: string;
  stateOfInc: string;
  businessContact: string;
  articlesOnFile: boolean;
  ownersCount: number;
}

const tabs = ["All", "Individuals", "Business Entities"] as const;

function formatDOB(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return `${String(d.getUTCMonth()+1).padStart(2,"0")}/${String(d.getUTCDate()).padStart(2,"0")}/${d.getUTCFullYear()}`;
  } catch { return "—"; }
}

export default function ContractingDBA() {
  const [tab, setTab] = useState<typeof tabs[number]>("All");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Agent | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hcms/agents/", { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to fetch agents: ${res.status}`);
      const data: Agent[] = await res.json();
      setAgents(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const individuals = useMemo<IndividualRow[]>(
    () =>
      agents
        .filter((a) => a.dbaType === "individual")
        .map((a) => ({
          userId: a.userId,
          name: `${a.firstName} ${a.lastName}`.trim(),
          npn: a.npn || "",
          dob: formatDOB(a.dateOfBirth),
          address: [a.streetAddress, a.city, a.state, a.zipCode].filter(Boolean).join(", "),
          state: a.state || "",
        })),
    [agents]
  );

  const entities = useMemo<EntityRow[]>(
    () =>
      agents
        .filter((a) => a.dbaType === "business_entity")
        .map((a) => ({
          userId: a.userId,
          name: `${a.firstName} ${a.lastName}`.trim(),
          entityName: a.companyName || "",
          dbaName: a.dbaName || "",
          ein: a.ein || "",
          companyType: a.companyType || "",
          stateOfInc: a.stateOfInc || "",
          businessContact: [a.businessEmail, a.businessPhone].filter(Boolean).join(" / "),
          articlesOnFile: !!a.articlesKey,
          ownersCount: a.owners?.length || 0,
        })),
    [agents]
  );

  const counts = useMemo(
    () => ({
      total: agents.length,
      individuals: individuals.length,
      entities: entities.length,
      articlesOnFile: entities.filter((e) => e.articlesOnFile).length,
    }),
    [agents, individuals, entities]
  );

  const indCols: Column<IndividualRow>[] = [
    {
      key: "name",
      label: "Agent",
      sortable: true,
      width: "22%",
      render: (v, row) => (
        <Link href={`/hcms/agents/${row.userId}`}>
          <span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span>
        </Link>
      ),
    },
    {
      key: "npn",
      label: "NPN",
      width: "12%",
      render: (v) =>
        v ? (
          <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span>
        ) : (
          <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>None</span>
        ),
    },
    { key: "dob", label: "DOB", width: "12%" },
    { key: "address", label: "Address", width: "26%" },
    { key: "state", label: "State", width: "10%", align: "center" },
    { key: "userId" as any, label: "", width: "8%", align: "center" as const, render: (_v: any, row: IndividualRow) => (
      <button onClick={() => { const a = agents.find(a => a.userId === row.userId); if (a) setViewing(a); }} className="flex items-center gap-1" style={{
        padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent",
        border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)",
        color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)",
      }}><Eye className="w-3 h-3" /> View</button>
    )},
  ];

  const entCols: Column<EntityRow>[] = [
    {
      key: "name",
      label: "Agent",
      sortable: true,
      width: "14%",
      render: (v, row) => (
        <Link href={`/hcms/agents/${row.userId}`}>
          <span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span>
        </Link>
      ),
    },
    { key: "entityName", label: "Entity Name", sortable: true, width: "18%" },
    { key: "dbaName", label: "DBA Name", width: "14%" },
    {
      key: "ein",
      label: "EIN",
      width: "10%",
      render: (v) =>
        v ? (
          <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span>
        ) : (
          <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>—</span>
        ),
    },
    { key: "companyType", label: "Type", width: "10%" },
    { key: "stateOfInc", label: "State of Inc", width: "8%", align: "center" },
    { key: "businessContact", label: "Business Contact", width: "10%" },
    {
      key: "articlesOnFile",
      label: "Articles",
      width: "8%",
      align: "center",
      render: (v) =>
        v ? (
          <span className="flex items-center gap-1" style={{ color: "var(--gc-status-active)", fontSize: "var(--gc-text-sm)" }}>
            <CheckCircle className="w-3.5 h-3.5" /> Filed
          </span>
        ) : (
          <span className="flex items-center gap-1" style={{ color: "var(--gc-status-terminated)", fontSize: "var(--gc-text-sm)" }}>
            <XIcon className="w-3.5 h-3.5" /> No
          </span>
        ),
    },
    {
      key: "ownersCount",
      label: "Owners",
      width: "7%",
      align: "center",
      render: (v) => (
        <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)" }}>{v}</span>
      ),
    },
    { key: "userId" as any, label: "", width: "6%", align: "center" as const, render: (_v: any, row: EntityRow) => (
      <button onClick={() => { const a = agents.find(a => a.userId === row.userId); if (a) setViewing(a); }} className="flex items-center gap-1" style={{
        padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent",
        border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)",
        color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)",
      }}><Eye className="w-3 h-3" /> View</button>
    )},
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} />
        <span style={{ marginLeft: "var(--gc-space-3)", color: "var(--gc-text-secondary)" }}>
          Loading agent data...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <GCPageHeader title="DBA & Business Entity" subtitle="Individual and business entity information for all agents" accentUnderline />
        <div className="flex items-center gap-3" style={{
          padding: "var(--gc-space-4)",
          backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)",
          borderRadius: "var(--gc-radius-md)",
        }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "var(--gc-status-terminated)" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500 }}>Unable to Load DBA Data</div>
            <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{error}</div>
          </div>
          <button onClick={loadData} style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-secondary)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div data-tour-id={TOUR.ADMIN.CONTRACTING_DBA.HEADER}>
        <GCPageHeader
          title="DBA & Business Entity"
          subtitle="Individual and business entity information for all agents"
          accentUnderline
        />
      </div>

      <div data-tour-id={TOUR.ADMIN.CONTRACTING_DBA.SUMMARY} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Total Agents" value={counts.total} accentTop />
        <GCKPICard label="Individuals" value={counts.individuals} accentTop delta={{ value: `${Math.round((counts.individuals / Math.max(counts.total, 1)) * 100)}% of total`, positive: true }} />
        <GCKPICard label="Business Entities" value={counts.entities} accentTop delta={{ value: `${Math.round((counts.entities / Math.max(counts.total, 1)) * 100)}% of total`, positive: true }} />
        <GCKPICard label="Articles on File" value={counts.articlesOnFile} accentTop delta={counts.entities > 0 ? (counts.articlesOnFile >= counts.entities ? { value: "All filed", positive: true } : { value: `${counts.entities - counts.articlesOnFile} missing`, positive: false }) : undefined} />
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map((t) => {
          const count =
            t === "All" ? counts.total : t === "Individuals" ? counts.individuals : counts.entities;
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

      {(tab === "All" || tab === "Individuals") && individuals.length > 0 && (
        <div style={{ marginBottom: tab === "All" ? "var(--gc-space-6)" : 0 }}>
          {tab === "All" && (
            <div
              style={{
                fontSize: "var(--gc-text-sm)",
                fontWeight: 600,
                color: "var(--gc-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "var(--gc-tracking-wider)",
                marginBottom: "var(--gc-space-3)",
              }}
            >
              Individuals
            </div>
          )}
          <GCDataTable
            columns={indCols}
            data={individuals}
            searchable
            searchPlaceholder="Search by name or NPN..."
          />
        </div>
      )}

      {(tab === "All" || tab === "Individuals") && individuals.length === 0 && (
        <div style={{ padding: "var(--gc-space-6)", textAlign: "center", color: "var(--gc-text-muted)", fontSize: "var(--gc-text-sm)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", marginBottom: tab === "All" ? "var(--gc-space-6)" : 0 }}>
          No individual agents on file.
        </div>
      )}

      {(tab === "All" || tab === "Business Entities") && entities.length > 0 && (
        <div>
          {tab === "All" && (
            <div
              style={{
                fontSize: "var(--gc-text-sm)",
                fontWeight: 600,
                color: "var(--gc-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "var(--gc-tracking-wider)",
                marginBottom: "var(--gc-space-3)",
              }}
            >
              Business Entities
            </div>
          )}
          <GCDataTable
            columns={entCols}
            data={entities}
            searchable
            searchPlaceholder="Search by entity name, DBA, or EIN..."
          />
        </div>
      )}

      {(tab === "All" || tab === "Business Entities") && entities.length === 0 && (
        <div style={{ padding: "var(--gc-space-6)", textAlign: "center", color: "var(--gc-text-muted)", fontSize: "var(--gc-text-sm)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
          No business entities on file.
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setViewing(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 520, maxWidth: "95vw", maxHeight: "85vh", overflow: "auto", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)" }}>{viewing.firstName} {viewing.lastName}</div>
                <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>{viewing.dbaType === "business_entity" ? "Business Entity" : "Individual Agent"}</div>
              </div>
              <button onClick={() => setViewing(null)} style={{ padding: "var(--gc-space-2)", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--gc-text-muted)" }}><XIcon className="w-5 h-5" /></button>
            </div>

            {viewing.dbaType === "individual" ? (
              <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
                <div className="grid grid-cols-2 gap-4">
                  {([
                    ["Full Name", `${viewing.firstName} ${viewing.lastName}`],
                    ["NPN", viewing.npn || "\u2014"],
                    ["Date of Birth", formatDOB(viewing.dateOfBirth)],
                    ["State", viewing.state || "\u2014"],
                    ["Address", [viewing.streetAddress, viewing.city, viewing.state, viewing.zipCode].filter(Boolean).join(", ") || "\u2014"],
                    ["Email", viewing.email || "\u2014"],
                  ] as [string, string][]).map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)", fontWeight: 500, fontFamily: label === "NPN" ? "monospace" : "var(--gc-font-body)" }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Entity Info */}
                <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
                  <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-3)" }}>Entity Information</div>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      ["Company Name", viewing.companyName || "\u2014"],
                      ["DBA Name", viewing.dbaName || "\u2014"],
                      ["EIN", viewing.ein || "\u2014"],
                      ["Company Type", viewing.companyType || "\u2014"],
                      ["State of Inc.", viewing.stateOfInc || "\u2014"],
                      ["Formation Date", formatDOB(viewing.formationDate)],
                    ] as [string, string][]).map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginBottom: 1 }}>{label}</div>
                        <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)", fontWeight: 500, fontFamily: label === "EIN" ? "monospace" : "var(--gc-font-body)" }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business Contact */}
                {(viewing.businessEmail || viewing.businessPhone) && (
                  <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
                    <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-3)" }}>Business Contact</div>
                    <div className="grid grid-cols-2 gap-3">
                      {viewing.businessEmail && <div><div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginBottom: 1 }}>Email</div><div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)" }}>{viewing.businessEmail}</div></div>}
                      {viewing.businessPhone && <div><div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginBottom: 1 }}>Phone</div><div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)" }}>{viewing.businessPhone}</div></div>}
                    </div>
                  </div>
                )}

                {/* Business Address */}
                {viewing.businessStreet && (
                  <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
                    <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-3)" }}>Business Address</div>
                    <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)" }}>
                      {[viewing.businessStreet, viewing.businessCity, viewing.businessState, viewing.businessZip].filter(Boolean).join(", ")}
                    </div>
                  </div>
                )}

                {/* Articles Status */}
                <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
                  {viewing.articlesKey ? <CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} /> : <XIcon className="w-4 h-4" style={{ color: "var(--gc-status-terminated)" }} />}
                  <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)" }}>Articles of Incorporation: {viewing.articlesKey ? "Filed" : "Not on file"}</span>
                </div>

                {/* Owners */}
                {viewing.owners && viewing.owners.length > 0 && (
                  <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
                    <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-3)" }}>Owners ({viewing.owners.length})</div>
                    {viewing.owners.map((o: any, i: number) => (
                      <div key={i} style={{ padding: "var(--gc-space-2) 0", borderBottom: i < viewing.owners.length - 1 ? "1px solid var(--gc-border-subtle)" : "none" }}>
                        <span style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{o.name || `${o.firstName || ""} ${o.lastName || ""}`.trim()}</span>
                        {o.ownershipPercentage && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginLeft: 8 }}>({o.ownershipPercentage}%)</span>}
                        {o.title && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginLeft: 8 }}>{"\u2014"} {o.title}</span>}
                      </div>
                    ))}
                  </div>
                )}
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
      )}
    </div>
  );
}
