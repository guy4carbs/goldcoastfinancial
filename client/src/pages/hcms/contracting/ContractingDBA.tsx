import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { Link } from "wouter";
import { Eye, X as XIcon, Building2, User, Shield, CheckCircle } from "lucide-react";

// Types matching SureLC structure
interface Individual {
  agentId: string; agent: string; legalName: string; ssn: string; dob: string;
  residentAddress: string; mailingAddress: string; npn: string;
}
interface BusinessEntity {
  agentId: string; agent: string; entityName: string; dbaName: string; ein: string;
  companyType: string; stateOfInc: string; npn: string; suranceBayId: string;
  businessEmail: string; businessPhone: string; businessFax: string; businessWebsite: string;
  mailingAddress: string; businessAddress: string;
  primaryPrincipal: string; principalTitle: string;
  hasSolicitors: boolean; exemptPayee: boolean;
  articlesOnFile: boolean; articlesUploadDate: string;
  contractingPhone: string; contractingEmail: string; contractingAddress: string;
}
interface LOA {
  agentId: string; agent: string; states: string; npn: string;
  status: string; renewalDate: string; notes: string;
}

const INDIVIDUALS: Individual[] = [
  { agentId: "1", agent: "Sarah Mitchell", legalName: "Sarah Ann Mitchell", ssn: "***-**-4523", dob: "1989-06-15", residentAddress: "1240 Michigan Ave, Chicago, IL 60601", mailingAddress: "1240 Michigan Ave, Chicago, IL 60601", npn: "18842956" },
  { agentId: "2", agent: "James Rodriguez", legalName: "James Manuel Rodriguez", ssn: "***-**-8891", dob: "1985-03-22", residentAddress: "4502 Oak Lawn Ave, Dallas, TX 75219", mailingAddress: "4502 Oak Lawn Ave, Dallas, TX 75219", npn: "22109845" },
  { agentId: "4", agent: "Emily Watson", legalName: "Emily Rose Watson", ssn: "***-**-3310", dob: "1992-11-08", residentAddress: "2200 Biscayne Blvd, Miami, FL 33137", mailingAddress: "2200 Biscayne Blvd, Miami, FL 33137", npn: "44120093" },
  { agentId: "7", agent: "Robert Kim", legalName: "Robert Hyun Kim", ssn: "***-**-6645", dob: "1995-04-12", residentAddress: "550 Peachtree St, Atlanta, GA 30308", mailingAddress: "550 Peachtree St, Atlanta, GA 30308", npn: "" },
  { agentId: "8", agent: "Amanda Torres", legalName: "Amanda Rose Torres", ssn: "***-**-2201", dob: "1990-09-28", residentAddress: "1800 Larimer St, Denver, CO 80202", mailingAddress: "1800 Larimer St, Denver, CO 80202", npn: "88201340" },
];

const ENTITIES: BusinessEntity[] = [
  { agentId: "3", agent: "Michael Chen", entityName: "Chen Financial Services LLC", dbaName: "Chen Financial", ein: "41-***4412", companyType: "LLC Corporation", stateOfInc: "CA", npn: "33201478", suranceBayId: "11270901", businessEmail: "mike@chenfinancial.com", businessPhone: "(415) 555-0198", businessFax: "", businessWebsite: "chenfinancial.com", mailingAddress: "450 Sutter St, Ste 300, San Francisco, CA 94108", businessAddress: "450 Sutter St, Ste 300, San Francisco, CA 94108", primaryPrincipal: "Michael Chen", principalTitle: "Managing Member", hasSolicitors: false, exemptPayee: false, articlesOnFile: true, articlesUploadDate: "2025-01-20", contractingPhone: "(415) 555-0198", contractingEmail: "mike@chenfinancial.com", contractingAddress: "450 Sutter St, Ste 300, San Francisco, CA 94108" },
  { agentId: "5", agent: "David Park", entityName: "Park Insurance Group Inc", dbaName: "Park Insurance", ein: "41-***7789", companyType: "S Corporation", stateOfInc: "NY", npn: "55098234", suranceBayId: "11270445", businessEmail: "david@parkinsurance.com", businessPhone: "(212) 555-0145", businessFax: "(212) 555-0146", businessWebsite: "parkinsurancegroup.com", mailingAddress: "125 Park Ave, Ste 2500, New York, NY 10017", businessAddress: "125 Park Ave, Ste 2500, New York, NY 10017", primaryPrincipal: "David Park", principalTitle: "President", hasSolicitors: true, exemptPayee: false, articlesOnFile: true, articlesUploadDate: "2024-08-10", contractingPhone: "(212) 555-0145", contractingEmail: "contracts@parkinsurance.com", contractingAddress: "125 Park Ave, Ste 2500, New York, NY 10017" },
  { agentId: "9", agent: "Jack Cook", entityName: "Gold Coast Financial Partners LLC", dbaName: "Heritage Life Solutions", ein: "41-***8679", companyType: "LLC Corporation", stateOfInc: "IL", npn: "22128144", suranceBayId: "11270967", businessEmail: "guy4carbs@gmail.com", businessPhone: "(630) 478-1835", businessFax: "", businessWebsite: "goldcoastfinancial.co", mailingAddress: "1240 Iroquois Ave, Ste 506, Naperville, IL 60563", businessAddress: "1240 Iroquois Ave, Ste 506, Naperville, IL 60563", primaryPrincipal: "Gaetano Carbonara", principalTitle: "Managing Member", hasSolicitors: true, exemptPayee: false, articlesOnFile: true, articlesUploadDate: "2026-03-20", contractingPhone: "(630) 478-1835", contractingEmail: "guy4carbs@gmail.com", contractingAddress: "3824 Wilcox Ave, Downers Grove, IL 60515" },
];

const LOA_AGENTS: LOA[] = [
  { agentId: "6", agent: "Lisa Thompson", states: "AZ", npn: "66334201", status: "active", renewalDate: "2026-09-01", notes: "License maintenance only — not actively selling" },
];

const tabs = ["Individual", "Business Entity", "LOA"] as const;

export default function ContractingDBA() {
  const [tab, setTab] = useState<typeof tabs[number]>("Individual");
  const [viewEntity, setViewEntity] = useState<BusinessEntity | null>(null);
  const [viewIndividual, setViewIndividual] = useState<Individual | null>(null);

  const counts = { individuals: INDIVIDUALS.length, entities: ENTITIES.length, loa: LOA_AGENTS.length, total: INDIVIDUALS.length + ENTITIES.length + LOA_AGENTS.length };

  const indCols: Column<Individual>[] = [
    { key: "agent", label: "Agent", sortable: true, width: "16%", render: (v, row) => <Link href={`/hcms/agents/${row.agentId}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span></Link> },
    { key: "legalName", label: "Legal Name", width: "18%" },
    { key: "npn", label: "NPN", width: "10%", render: (v) => v ? <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span> : <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>None</span> },
    { key: "ssn", label: "SSN", width: "10%", render: (v) => <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span> },
    { key: "dob", label: "DOB", width: "10%" },
    { key: "residentAddress", label: "Resident Address", width: "20%" },
    { key: "agentId", label: "", width: "8%", align: "center", render: (_v, row) => (
      <button onClick={() => setViewIndividual(row)} className="flex items-center gap-1" style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}><Eye className="w-3 h-3" /> View</button>
    )},
  ];

  const entCols: Column<BusinessEntity>[] = [
    { key: "agent", label: "Principal", sortable: true, width: "14%", render: (v, row) => <Link href={`/hcms/agents/${row.agentId}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span></Link> },
    { key: "entityName", label: "Entity Name", sortable: true, width: "20%" },
    { key: "companyType", label: "Type", width: "12%" },
    { key: "ein", label: "EIN", width: "10%", render: (v) => <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span> },
    { key: "stateOfInc", label: "State", width: "7%", align: "center" },
    { key: "articlesOnFile", label: "Articles", width: "10%", align: "center", render: (v) => v ? <CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--gc-status-active)" }} /> : <XIcon className="w-3.5 h-3.5" style={{ color: "var(--gc-status-terminated)" }} /> },
    { key: "hasSolicitors", label: "Solicitors", width: "10%", align: "center", render: (v) => v ? <span style={{ color: "var(--gc-status-active)", fontSize: "var(--gc-text-sm)" }}>Yes</span> : <span style={{ color: "var(--gc-text-muted)", fontSize: "var(--gc-text-sm)" }}>No</span> },
    { key: "agentId", label: "", width: "8%", align: "center", render: (_v, row) => (
      <button onClick={() => setViewEntity(row)} className="flex items-center gap-1" style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}><Eye className="w-3 h-3" /> View</button>
    )},
  ];

  const loaCols: Column<LOA>[] = [
    { key: "agent", label: "Agent", sortable: true, width: "18%", render: (v, row) => <Link href={`/hcms/agents/${row.agentId}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span></Link> },
    { key: "npn", label: "NPN", width: "12%", render: (v) => <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span> },
    { key: "states", label: "Licensed States", width: "15%" },
    { key: "status", label: "Status", width: "12%", render: (v) => <GCStatusBadge status={v} /> },
    { key: "renewalDate", label: "Next Renewal", width: "12%" },
    { key: "notes", label: "Notes", width: "25%" },
  ];

  const DetailRow = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
    <div style={{ padding: "var(--gc-space-2) 0", borderBottom: "1px solid var(--gc-border-subtle)" }}>
      <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)", fontFamily: mono ? "monospace" : "var(--gc-font-body)" }}>{value || "—"}</div>
    </div>
  );

  return (
    <div>
      <GCPageHeader title="Doing Business As" subtitle="Individual, business entity & LOA profiles — mirrors SureLC DBA structure" accentUnderline />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Total Profiles" value={counts.total} accentTop />
        <GCKPICard label="Individuals" value={counts.individuals} accentTop />
        <GCKPICard label="Business Entities" value={counts.entities} accentTop />
        <GCKPICard label="LOA (License Only)" value={counts.loa} accentTop />
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map(t => {
          const count = t === "Individual" ? counts.individuals : t === "Business Entity" ? counts.entities : counts.loa;
          return (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>
              {t} <span style={{ fontSize: "var(--gc-text-xs)", opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {tab === "Individual" && <GCDataTable columns={indCols} data={INDIVIDUALS} searchable searchPlaceholder="Search by name or NPN..." />}
      {tab === "Business Entity" && <GCDataTable columns={entCols} data={ENTITIES} searchable searchPlaceholder="Search by entity or EIN..." />}
      {tab === "LOA" && <GCDataTable columns={loaCols} data={LOA_AGENTS} searchable searchPlaceholder="Search agents..." />}

      {/* Business Entity Detail Popup — matches SureLC layout */}
      {viewEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setViewEntity(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 620, maxHeight: "85vh", overflow: "auto", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div style={{ padding: "var(--gc-space-2)", borderRadius: "var(--gc-radius-md)", backgroundColor: "color-mix(in srgb, var(--gc-gold) 12%, transparent)" }}><Building2 className="w-5 h-5" style={{ color: "var(--gc-gold)" }} /></div>
                <div>
                  <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)" }}>{viewEntity.entityName}</div>
                  <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>Business Entity of {viewEntity.agent}</div>
                </div>
              </div>
              <button onClick={() => setViewEntity(null)} style={{ padding: "var(--gc-space-2)", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--gc-text-muted)" }}><XIcon className="w-5 h-5" /></button>
            </div>

            {/* Company Identifications */}
            <div style={{ marginTop: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)", padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
              <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-3)" }}>Company Identifications</div>
              <div className="grid grid-cols-2 gap-x-6">
                <DetailRow label="NPN" value={viewEntity.npn} mono />
                <DetailRow label="SuranceBay ID" value={viewEntity.suranceBayId} mono />
                <DetailRow label="EIN" value={viewEntity.ein} mono />
                <DetailRow label="Company Type" value={viewEntity.companyType} />
              </div>
            </div>

            {/* Company Details */}
            <div style={{ marginBottom: "var(--gc-space-4)", padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
              <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-3)" }}>Company Details</div>
              <div className="grid grid-cols-2 gap-x-6">
                <DetailRow label="W-9 Company Name" value={viewEntity.entityName} />
                <DetailRow label="DBA / Disregarded Entity" value={viewEntity.dbaName} />
                <DetailRow label="State of Incorporation" value={viewEntity.stateOfInc} />
                <DetailRow label="Exempt Payee" value={viewEntity.exemptPayee ? "Yes" : "No"} />
              </div>
              <div className="flex gap-4 mt-2">
                {viewEntity.hasSolicitors && <span style={{ padding: "2px 8px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-xs)", color: "var(--gc-gold)", backgroundColor: "color-mix(in srgb, var(--gc-gold) 12%, transparent)", fontWeight: 600 }}>Has Solicitors (LOA underneath)</span>}
              </div>
            </div>

            {/* Contact Information */}
            <div style={{ marginBottom: "var(--gc-space-4)", padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
              <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-3)" }}>Contact Information</div>
              <div className="grid grid-cols-2 gap-x-6">
                <DetailRow label="Business Email" value={viewEntity.businessEmail} />
                <DetailRow label="Business Phone" value={viewEntity.businessPhone} />
                <DetailRow label="Business Fax" value={viewEntity.businessFax || "—"} />
                <DetailRow label="Website" value={viewEntity.businessWebsite} />
              </div>
            </div>

            {/* Addresses */}
            <div style={{ marginBottom: "var(--gc-space-4)", padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
              <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-3)" }}>Addresses</div>
              <DetailRow label="Mailing Address" value={viewEntity.mailingAddress} />
              <DetailRow label="Business Address" value={viewEntity.businessAddress} />
            </div>

            {/* Primary Principal */}
            <div style={{ marginBottom: "var(--gc-space-4)", padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
              <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-3)" }}>Primary Principal</div>
              <div className="grid grid-cols-2 gap-x-6">
                <DetailRow label="Name" value={viewEntity.primaryPrincipal} />
                <DetailRow label="Title" value={viewEntity.principalTitle} />
              </div>
            </div>

            {/* Articles of Incorporation */}
            <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
              <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-3)" }}>Articles of Incorporation</div>
              {viewEntity.articlesOnFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} />
                    <span style={{ fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)" }}>Uploaded on {viewEntity.articlesUploadDate}</span>
                  </div>
                  <button style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-secondary)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}>Archive</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XIcon className="w-4 h-4" style={{ color: "var(--gc-status-terminated)" }} />
                  <span style={{ fontSize: "var(--gc-text-base)", color: "var(--gc-status-terminated)" }}>Not uploaded</span>
                </div>
              )}
            </div>

            {/* Contracting Contact */}
            <div style={{ marginTop: "var(--gc-space-4)", padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
              <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-3)" }}>Contact Information for Contracting</div>
              <div className="grid grid-cols-2 gap-x-6">
                <DetailRow label="Phone (Producer)" value={viewEntity.contractingPhone} />
                <DetailRow label="Email (Producer)" value={viewEntity.contractingEmail} />
              </div>
              <DetailRow label="Business Address (Producer)" value={viewEntity.contractingAddress} />
            </div>
          </div>
        </div>
      )}

      {/* Individual Detail Popup */}
      {viewIndividual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setViewIndividual(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 480, backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div style={{ padding: "var(--gc-space-2)", borderRadius: "var(--gc-radius-md)", backgroundColor: "color-mix(in srgb, var(--gc-gold) 12%, transparent)" }}><User className="w-5 h-5" style={{ color: "var(--gc-gold)" }} /></div>
                <div>
                  <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)" }}>{viewIndividual.agent}</div>
                  <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>Individual Profile</div>
                </div>
              </div>
              <button onClick={() => setViewIndividual(null)} style={{ padding: "var(--gc-space-2)", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--gc-text-muted)" }}><XIcon className="w-5 h-5" /></button>
            </div>
            <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
              <div className="grid grid-cols-2 gap-x-6">
                <DetailRow label="Legal Name" value={viewIndividual.legalName} />
                <DetailRow label="NPN" value={viewIndividual.npn || "Not assigned"} mono />
                <DetailRow label="SSN" value={viewIndividual.ssn} mono />
                <DetailRow label="Date of Birth" value={viewIndividual.dob} />
              </div>
              <DetailRow label="Resident Address" value={viewIndividual.residentAddress} />
              <DetailRow label="Mailing Address" value={viewIndividual.mailingAddress} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
