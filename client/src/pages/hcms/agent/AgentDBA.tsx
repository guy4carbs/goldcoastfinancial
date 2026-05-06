import { useState, useEffect } from "react";
import { GCPageHeader, GCPrimaryButton, GCSecondaryButton, GC_FORM_LABEL, GC_FORM_INPUT } from "@/components/gc";
import { Building2, User, Shield, Heart, UserCircle, Loader2, AlertTriangle, Info, Pencil, Save, X, CheckCircle } from "lucide-react";
import { DocumentCard } from "./DocumentCard";
import { csrfHeaders } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function fmtDate(d: string | null): string {
  if (!d) return "—";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}/${date.getUTCFullYear()}`;
  } catch { return "—"; }
}

function isoDate(d: string | null | undefined): string {
  if (!d) return "";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  } catch { return ""; }
}

function fmtPhone(raw: string): string {
  if (!raw) return "—";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits[0] === "1") return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return raw;
}

function fmtEIN(raw: string): string {
  if (!raw) return "—";
  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 9)}`;
  return "—";
}

function fmtCompanyType(type: string): string {
  if (!type) return "—";
  const map: Record<string, string> = { llc: "LLC", s_corp: "S Corporation", c_corp: "C Corporation", sole_prop: "Sole Proprietorship", partnership: "Partnership" };
  return map[type] || type;
}

function fmtLicenseType(type: string): string {
  if (!type) return "—";
  const map: Record<string, string> = { life_health: "Life & Health", life: "Life Only", health: "Health Only", property_casualty: "P&C" };
  return map[type] || type;
}

const sectionStyle: React.CSSProperties = { backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" };
const headerStyle: React.CSSProperties = { fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-3)", display: "flex", alignItems: "center", gap: 8 };
const labelStyle: React.CSSProperties = { fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 };
const valueStyle: React.CSSProperties = { fontSize: "var(--gc-text-md)", color: "var(--gc-text-primary)", fontWeight: 500, wordBreak: "break-word" };

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value || "—"}</div>
    </div>
  );
}

type Owner = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  ssn?: string;
  ownershipPercent?: number;
  isPrimary?: boolean;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
};

type DRLP = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dob?: string;
  npn?: string;
  email?: string;
  phone?: string;
  birthCity?: string;
  birthState?: string;
};

type Beneficiary = {
  firstName?: string;
  lastName?: string;
  relationship?: string;
  dob?: string;
  email?: string;
  phone?: string;
  street?: string;
  unit?: string;
  city?: string;
  state?: string;
  zip?: string;
};

type FormState = {
  dbaType: string;
  companyName: string;
  dbaName: string;
  ein: string;
  companyType: string;
  stateOfInc: string;
  licenseType: string;
  formationDate: string;
  title: string;
  businessEmail: string;
  businessPhone: string;
  businessFax: string;
  businessWebsite: string;
  businessStreet: string;
  businessUnit: string;
  businessCity: string;
  businessState: string;
  businessZip: string;
  mailingSameAsBusiness: boolean;
  mailingStreet: string;
  mailingUnit: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  owners: Owner[];
  drlp: DRLP;
  beneficiary: Beneficiary;
};

function buildForm(profile: any): FormState {
  return {
    dbaType: profile.dbaType || "business_entity",
    companyName: profile.companyName || "",
    dbaName: profile.dbaName || "",
    ein: profile.ein || "",
    companyType: (profile.companyType || "").toLowerCase() || "llc",
    stateOfInc: (profile.stateOfInc || "").toUpperCase(),
    licenseType: profile.licenseType || "",
    formationDate: isoDate(profile.formationDate),
    title: profile.title || "",
    businessEmail: profile.businessEmail || "",
    businessPhone: profile.businessPhone || "",
    businessFax: profile.businessFax || "",
    businessWebsite: profile.businessWebsite || "",
    businessStreet: profile.businessStreet || "",
    businessUnit: profile.businessUnit || "",
    businessCity: profile.businessCity || "",
    businessState: (profile.businessState || "").toUpperCase(),
    businessZip: profile.businessZip || "",
    mailingSameAsBusiness: !!profile.mailingSameAsBusiness,
    mailingStreet: profile.mailingStreet || "",
    mailingUnit: profile.mailingUnit || "",
    mailingCity: profile.mailingCity || "",
    mailingState: (profile.mailingState || "").toUpperCase(),
    mailingZip: profile.mailingZip || "",
    owners: Array.isArray(profile.owners) ? profile.owners : [],
    drlp: profile.drlp || {},
    beneficiary: profile.beneficiary || {},
  };
}

function FieldInput({ label, value, onChange, placeholder, type = "text", maxLength }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; maxLength?: number;
}) {
  return (
    <div>
      <label style={GC_FORM_LABEL}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={GC_FORM_INPUT}
      />
    </div>
  );
}

function FieldSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }>;
}) {
  return (
    <div>
      <label style={GC_FORM_LABEL}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={GC_FORM_INPUT}>
        <option value="">—</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

const COMPANY_TYPE_OPTIONS = [
  { value: "llc", label: "LLC" },
  { value: "s_corp", label: "S Corporation" },
  { value: "c_corp", label: "C Corporation" },
  { value: "sole_prop", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
];

const LICENSE_TYPE_OPTIONS = [
  { value: "life_health", label: "Life & Health" },
  { value: "life", label: "Life Only" },
  { value: "health", label: "Health Only" },
  { value: "property_casualty", label: "P&C" },
];

const STATE_CODES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

export default function AgentDBA() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = () => {
    fetch("/api/agent-portal/me", { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error(r.status === 401 ? "Please log in again" : "Failed to load"); return r.json(); })
      .then(d => { if (d?.user) setData(d); else setError("Profile data unavailable"); })
      .catch(e => setError(e.message || "Network error"));
  };
  useEffect(reload, []);

  if (error) {
    return (
      <div style={{ padding: "var(--gc-space-8)" }}>
        <GCPageHeader title="Doing Business As" subtitle="Your contracting entity information" accentUnderline />
        <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
          <AlertTriangle className="w-5 h-5" style={{ color: "var(--gc-status-terminated)" }} />
          <div>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Unable to load DBA details</div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return <div className="flex items-center justify-center" style={{ padding: "var(--gc-space-8)" }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} /></div>;

  const user = data.user || {};
  const profile = data.profile || {};
  const checklist = data.checklist || { ndaStatus: "pending", debtRollupStatus: "pending", complianceStatus: "pending" };
  const isBusiness = (form?.dbaType || profile.dbaType) === "business_entity";

  const signedAgreements = [
    { key: "nda", label: "Non-Disclosure Agreement (NDA)", status: checklist.ndaStatus, signedAt: checklist.ndaSignedAt },
    { key: "debt_rollup", label: "Debt Roll-Up Agreement", status: checklist.debtRollupStatus, signedAt: checklist.debtRollupSignedAt },
    { key: "compliance", label: "Compliance & Ethics Agreement", status: checklist.complianceStatus, signedAt: checklist.complianceSignedAt },
  ];
  const owners: any[] = profile.owners || [];
  const drlp = profile.drlp;
  const beneficiary = profile.beneficiary;

  const startEdit = () => {
    setForm(buildForm(profile));
    setEditing(true);
  };
  const cancelEdit = () => {
    setForm(null);
    setEditing(false);
  };
  const updateForm = (patch: Partial<FormState>) => setForm((f) => (f ? { ...f, ...patch } : f));

  const save = async () => {
    if (!form || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/agent-portal/dba", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `${res.status}`);
      }
      toast({ title: "DBA saved", description: "Your business entity details have been updated." });
      setEditing(false);
      setForm(null);
      reload();
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message || "Unable to save.", variant: "destructive" as any });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: "var(--gc-space-4)" }}>
        <GCPageHeader title="Doing Business As" subtitle="Your contracting entity information" accentUnderline />
        {!editing ? (
          <GCPrimaryButton onClick={startEdit} icon={<Pencil className="w-4 h-4" />}>
            Edit DBA
          </GCPrimaryButton>
        ) : (
          <div className="flex gap-2">
            <GCSecondaryButton onClick={cancelEdit} icon={<X className="w-4 h-4" />}>Cancel</GCSecondaryButton>
            <GCPrimaryButton onClick={save} disabled={saving} icon={<Save className="w-4 h-4" />}>
              {saving ? "Saving…" : "Save changes"}
            </GCPrimaryButton>
          </div>
        )}
      </div>

      {/* Entity Info */}
      <div data-tour-id="agent-dba-entity-type" style={sectionStyle}>
        <div style={headerStyle}>
          {isBusiness ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
          {isBusiness ? "Business Entity" : "Individual"}
        </div>
        {editing && form ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
            <FieldSelect label="Entity Type" value={form.dbaType} onChange={(v) => updateForm({ dbaType: v })} options={[{ value: "business_entity", label: "Business Entity" }, { value: "individual", label: "Individual" }]} />
            <FieldInput label="Entity Name" value={form.companyName} onChange={(v) => updateForm({ companyName: v })} placeholder="Gold Coast Financial Partners LLC" />
            <FieldInput label="DBA Name" value={form.dbaName} onChange={(v) => updateForm({ dbaName: v })} placeholder="Gold Coast Financial" />
            <FieldInput label="EIN" value={form.ein} onChange={(v) => updateForm({ ein: v })} placeholder="XX-XXXXXXX" maxLength={20} />
            <FieldSelect label="Company Type" value={form.companyType} onChange={(v) => updateForm({ companyType: v })} options={COMPANY_TYPE_OPTIONS} />
            <FieldSelect label="State of Incorporation" value={form.stateOfInc} onChange={(v) => updateForm({ stateOfInc: v })} options={STATE_CODES.map((s) => ({ value: s, label: s }))} />
            <FieldSelect label="License Type" value={form.licenseType} onChange={(v) => updateForm({ licenseType: v })} options={LICENSE_TYPE_OPTIONS} />
            <FieldInput label="Formation Date" value={form.formationDate} onChange={(v) => updateForm({ formationDate: v })} type="date" />
            <FieldInput label="Title" value={form.title} onChange={(v) => updateForm({ title: v })} placeholder="Founder / Principal" />
          </div>
        ) : (
          <div data-tour-id="agent-dba-details" className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
            {isBusiness ? (
              <>
                <Field label="Entity Name" value={profile.companyName} />
                <Field label="DBA Name" value={profile.dbaName} />
                <Field label="EIN" value={fmtEIN(profile.ein)} />
                <Field label="Company Type" value={fmtCompanyType(profile.companyType)} />
                <Field label="State of Incorporation" value={(profile.stateOfInc || "").toUpperCase()} />
                <Field label="License Type" value={fmtLicenseType(profile.licenseType)} />
                <Field label="Formation Date" value={fmtDate(profile.formationDate)} />
                <Field label="Principal" value={`${user.firstName || ""} ${user.lastName || ""}`.trim() || "—"} />
                <Field label="Title" value={profile.title} />
              </>
            ) : (
              <>
                <Field label="Legal Name" value={`${user.firstName || ""} ${user.lastName || ""}`.trim() || "—"} />
                <Field label="NPN" value={profile.npn} />
                <Field label="Date of Birth" value={fmtDate(profile.dateOfBirth)} />
                <Field label="SSN" value={profile.ssnLast4 || "On file"} />
                <Field label="Email" value={user.email} />
                <Field label="Phone" value={fmtPhone(user.phone)} />
              </>
            )}
          </div>
        )}
      </div>

      {/* Signed Agreements — NDA / Debt Roll-Up / Compliance */}
      <div style={sectionStyle}>
        <div style={headerStyle}>
          <Shield className="w-4 h-4" /> Signed Agreements
        </div>
        <div className="flex flex-col gap-2">
          {signedAgreements.map((a) => {
            const isSigned = a.status === "signed";
            return (
              <div
                key={a.key}
                className="flex items-center justify-between"
                style={{
                  padding: "var(--gc-space-3)",
                  backgroundColor: "var(--gc-surface-2)",
                  borderRadius: "var(--gc-radius-sm)",
                  borderLeft: `3px solid ${isSigned ? "var(--gc-status-active)" : "var(--gc-status-pending)"}`,
                }}
              >
                <div className="flex items-center gap-3">
                  {isSigned ? (
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} />
                  ) : (
                    <Info className="w-4 h-4" style={{ color: "var(--gc-status-pending)" }} />
                  )}
                  <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)", fontWeight: 500 }}>{a.label}</span>
                </div>
                <span style={{ fontSize: "var(--gc-text-xs)", color: isSigned ? "var(--gc-status-active)" : "var(--gc-text-muted)" }}>
                  {isSigned && a.signedAt ? `Signed ${fmtDate(a.signedAt)}` : "Awaiting signature"}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: "var(--gc-space-3)", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>
          To view or download signed copies, open the <strong>Documents</strong> page from the sidebar.
        </div>
      </div>

      {/* Articles of Incorporation */}
      {isBusiness && (
        <div data-tour-id="agent-dba-articles" style={{ marginBottom: "var(--gc-space-4)" }}>
          <DocumentCard
            title="Articles of Incorporation"
            description="Your business entity formation document"
            docType="articles"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            hasFile={!!profile.articlesKey}
          />
        </div>
      )}

      {/* Business Contact */}
      {isBusiness && (
        <div style={sectionStyle}>
          <div style={headerStyle}>Business Contact</div>
          {editing && form ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
                <FieldInput label="Email" value={form.businessEmail} onChange={(v) => updateForm({ businessEmail: v })} type="email" />
                <FieldInput label="Phone" value={form.businessPhone} onChange={(v) => updateForm({ businessPhone: v })} placeholder="(555) 555-5555" />
                <FieldInput label="Fax" value={form.businessFax} onChange={(v) => updateForm({ businessFax: v })} />
                <FieldInput label="Website" value={form.businessWebsite} onChange={(v) => updateForm({ businessWebsite: v })} placeholder="https://" />
              </div>
              <div style={{ marginTop: "var(--gc-space-4)", paddingTop: "var(--gc-space-4)", borderTop: "1px solid var(--gc-border-subtle)" }}>
                <div style={{ ...labelStyle, marginBottom: "var(--gc-space-2)" }}>Business Address</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
                  <div className="sm:col-span-2"><FieldInput label="Street" value={form.businessStreet} onChange={(v) => updateForm({ businessStreet: v })} /></div>
                  <FieldInput label="Unit / Suite" value={form.businessUnit} onChange={(v) => updateForm({ businessUnit: v })} />
                  <FieldInput label="City" value={form.businessCity} onChange={(v) => updateForm({ businessCity: v })} />
                  <FieldSelect label="State" value={form.businessState} onChange={(v) => updateForm({ businessState: v })} options={STATE_CODES.map((s) => ({ value: s, label: s }))} />
                  <FieldInput label="ZIP" value={form.businessZip} onChange={(v) => updateForm({ businessZip: v })} maxLength={10} />
                </div>
              </div>
              <div style={{ marginTop: "var(--gc-space-4)", paddingTop: "var(--gc-space-4)", borderTop: "1px solid var(--gc-border-subtle)" }}>
                <label className="flex items-center gap-2" style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-2)" }}>
                  <input type="checkbox" checked={form.mailingSameAsBusiness} onChange={(e) => updateForm({ mailingSameAsBusiness: e.target.checked })} />
                  Mailing address is the same as business address
                </label>
                {!form.mailingSameAsBusiness && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4" style={{ marginTop: "var(--gc-space-2)" }}>
                    <div className="sm:col-span-2"><FieldInput label="Mailing Street" value={form.mailingStreet} onChange={(v) => updateForm({ mailingStreet: v })} /></div>
                    <FieldInput label="Unit / Suite" value={form.mailingUnit} onChange={(v) => updateForm({ mailingUnit: v })} />
                    <FieldInput label="City" value={form.mailingCity} onChange={(v) => updateForm({ mailingCity: v })} />
                    <FieldSelect label="State" value={form.mailingState} onChange={(v) => updateForm({ mailingState: v })} options={STATE_CODES.map((s) => ({ value: s, label: s }))} />
                    <FieldInput label="ZIP" value={form.mailingZip} onChange={(v) => updateForm({ mailingZip: v })} maxLength={10} />
                  </div>
                )}
              </div>
            </>
          ) : profile.businessEmail || profile.businessPhone ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
                <Field label="Email" value={profile.businessEmail} />
                <Field label="Phone" value={fmtPhone(profile.businessPhone)} />
                {profile.businessFax ? <Field label="Fax" value={fmtPhone(profile.businessFax)} /> : <div />}
                {profile.businessWebsite ? <Field label="Website" value={profile.businessWebsite} /> : null}
              </div>
              {profile.businessStreet && (
                <div style={{ marginTop: "var(--gc-space-4)", paddingTop: "var(--gc-space-4)", borderTop: "1px solid var(--gc-border-subtle)" }}>
                  <div style={{ ...labelStyle, marginBottom: 4 }}>Business Address</div>
                  <div style={valueStyle}>
                    {[profile.businessStreet, profile.businessUnit].filter(Boolean).join(", ")}<br />
                    {[profile.businessCity, profile.businessState].filter(Boolean).join(", ")} {profile.businessZip}
                  </div>
                </div>
              )}
              {profile.mailingStreet && !profile.mailingSameAsBusiness && (
                <div style={{ marginTop: "var(--gc-space-4)", paddingTop: "var(--gc-space-4)", borderTop: "1px solid var(--gc-border-subtle)" }}>
                  <div style={{ ...labelStyle, marginBottom: 4 }}>Mailing Address</div>
                  <div style={valueStyle}>
                    {[profile.mailingStreet, profile.mailingUnit].filter(Boolean).join(", ")}<br />
                    {[profile.mailingCity, profile.mailingState].filter(Boolean).join(", ")} {profile.mailingZip}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4" style={{ color: "var(--gc-text-muted)" }} />
              <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>Business contact information not yet provided. Click <strong>Edit DBA</strong> to add it.</span>
            </div>
          )}
        </div>
      )}

      {/* Owners */}
      {isBusiness && (
        <div data-tour-id="agent-dba-owners" style={sectionStyle}>
          <div style={headerStyle}><UserCircle className="w-4 h-4" /> Owners {((editing && form ? form.owners.length : owners.length) > 0) && `(${editing && form ? form.owners.length : owners.length})`}</div>
          {editing && form ? (
            <div className="flex flex-col gap-3">
              {form.owners.map((o, i) => (
                <div key={i} style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)" }}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3">
                    <FieldInput label="First Name" value={o.firstName || ""} onChange={(v) => updateForm({ owners: form.owners.map((x, j) => j === i ? { ...x, firstName: v } : x) })} />
                    <FieldInput label="Middle" value={o.middleName || ""} onChange={(v) => updateForm({ owners: form.owners.map((x, j) => j === i ? { ...x, middleName: v } : x) })} />
                    <FieldInput label="Last Name" value={o.lastName || ""} onChange={(v) => updateForm({ owners: form.owners.map((x, j) => j === i ? { ...x, lastName: v } : x) })} />
                    <FieldInput label="Date of Birth" value={isoDate(o.dateOfBirth)} onChange={(v) => updateForm({ owners: form.owners.map((x, j) => j === i ? { ...x, dateOfBirth: v } : x) })} type="date" />
                    <FieldInput label="SSN" value={o.ssn || ""} onChange={(v) => updateForm({ owners: form.owners.map((x, j) => j === i ? { ...x, ssn: v } : x) })} maxLength={11} placeholder="XXX-XX-XXXX" />
                    <FieldInput label="Ownership %" value={String(o.ownershipPercent ?? "")} onChange={(v) => updateForm({ owners: form.owners.map((x, j) => j === i ? { ...x, ownershipPercent: Number(v) || 0 } : x) })} type="number" />
                    <div className="sm:col-span-2"><FieldInput label="Street" value={o.streetAddress || ""} onChange={(v) => updateForm({ owners: form.owners.map((x, j) => j === i ? { ...x, streetAddress: v } : x) })} /></div>
                    <FieldInput label="City" value={o.city || ""} onChange={(v) => updateForm({ owners: form.owners.map((x, j) => j === i ? { ...x, city: v } : x) })} />
                    <FieldSelect label="State" value={(o.state || "").toUpperCase()} onChange={(v) => updateForm({ owners: form.owners.map((x, j) => j === i ? { ...x, state: v } : x) })} options={STATE_CODES.map((s) => ({ value: s, label: s }))} />
                    <FieldInput label="ZIP" value={o.zipCode || ""} onChange={(v) => updateForm({ owners: form.owners.map((x, j) => j === i ? { ...x, zipCode: v } : x) })} />
                  </div>
                  <div className="flex items-center justify-between" style={{ marginTop: "var(--gc-space-3)" }}>
                    <label className="flex items-center gap-2" style={{ fontSize: "var(--gc-text-sm)" }}>
                      <input type="checkbox" checked={!!o.isPrimary} onChange={(e) => updateForm({ owners: form.owners.map((x, j) => j === i ? { ...x, isPrimary: e.target.checked } : { ...x, isPrimary: false }) })} />
                      Primary owner
                    </label>
                    <button type="button" onClick={() => updateForm({ owners: form.owners.filter((_, j) => j !== i) })} style={{ background: "none", border: "1px solid var(--gc-border)", padding: "4px 10px", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-muted)", fontSize: "var(--gc-text-xs)", cursor: "pointer" }}>Remove</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => updateForm({ owners: [...form.owners, { firstName: "", lastName: "", isPrimary: form.owners.length === 0 }] })} style={{ background: "var(--gc-surface-2)", border: "1px dashed var(--gc-border)", padding: "var(--gc-space-3)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)", fontWeight: 600 }}>+ Add owner</button>
            </div>
          ) : owners.length > 0 ? (
            <div className="flex flex-col gap-3">
              {owners.map((o: any, i: number) => (
                <div key={o.id || i} style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", borderLeft: `3px solid ${o.isPrimary ? "var(--gc-gold)" : "var(--gc-border)"}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontSize: "var(--gc-text-sm)", fontWeight: 600, color: "var(--gc-text-primary)" }}>
                      {[o.firstName, o.middleName, o.lastName].filter(Boolean).join(" ") || "—"}
                      {o.isPrimary && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-gold)", marginLeft: 8 }}>(Primary)</span>}
                    </span>
                    <span style={{ fontSize: "var(--gc-text-sm)", fontWeight: 600, color: "var(--gc-gold)" }}>{o.ownershipPercent || 0}%</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>
                    <span>DOB: {fmtDate(o.dateOfBirth)}</span>
                    <span>SSN: ***-**-{(o.ssn || "").slice(-4) || "****"}</span>
                    {o.streetAddress && <span>{o.streetAddress}</span>}
                    {o.city && <span>{o.city}, {(o.state || "").toUpperCase()} {o.zipCode}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4" style={{ color: "var(--gc-text-muted)" }} />
              <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>No owners recorded. Click <strong>Edit DBA</strong> → <strong>Add owner</strong> to add yourself or partners.</span>
            </div>
          )}
        </div>
      )}

      {/* DRLP */}
      {isBusiness && (
        <div style={sectionStyle}>
          <div style={headerStyle}><Shield className="w-4 h-4" /> Designated Responsible Licensed Producer (DRLP)</div>
          {editing && form ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
              <FieldInput label="First Name" value={form.drlp.firstName || ""} onChange={(v) => updateForm({ drlp: { ...form.drlp, firstName: v } })} />
              <FieldInput label="Middle" value={form.drlp.middleName || ""} onChange={(v) => updateForm({ drlp: { ...form.drlp, middleName: v } })} />
              <FieldInput label="Last Name" value={form.drlp.lastName || ""} onChange={(v) => updateForm({ drlp: { ...form.drlp, lastName: v } })} />
              <FieldInput label="NPN" value={form.drlp.npn || ""} onChange={(v) => updateForm({ drlp: { ...form.drlp, npn: v } })} />
              <FieldInput label="Date of Birth" value={isoDate(form.drlp.dob)} onChange={(v) => updateForm({ drlp: { ...form.drlp, dob: v } })} type="date" />
              <FieldInput label="Email" value={form.drlp.email || ""} onChange={(v) => updateForm({ drlp: { ...form.drlp, email: v } })} type="email" />
              <FieldInput label="Phone" value={form.drlp.phone || ""} onChange={(v) => updateForm({ drlp: { ...form.drlp, phone: v } })} />
              <FieldInput label="Birth City" value={form.drlp.birthCity || ""} onChange={(v) => updateForm({ drlp: { ...form.drlp, birthCity: v } })} />
              <FieldSelect label="Birth State" value={(form.drlp.birthState || "").toUpperCase()} onChange={(v) => updateForm({ drlp: { ...form.drlp, birthState: v } })} options={STATE_CODES.map((s) => ({ value: s, label: s }))} />
            </div>
          ) : drlp ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
              <Field label="Name" value={[drlp.firstName, drlp.middleName, drlp.lastName].filter(Boolean).join(" ")} />
              <Field label="NPN" value={drlp.npn} />
              <Field label="Date of Birth" value={fmtDate(drlp.dob)} />
              <Field label="Email" value={drlp.email} />
              <Field label="Phone" value={fmtPhone(drlp.phone)} />
              <Field label="Birthplace" value={[drlp.birthCity, drlp.birthState].filter(Boolean).join(", ") || "—"} />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4" style={{ color: "var(--gc-text-muted)" }} />
              <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>DRLP not set. Click <strong>Edit DBA</strong> to provide details.</span>
            </div>
          )}
        </div>
      )}

      {/* Beneficiary */}
      {isBusiness && (
        <div style={sectionStyle}>
          <div style={headerStyle}><Heart className="w-4 h-4" /> Beneficiary</div>
          {editing && form ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
              <FieldInput label="First Name" value={form.beneficiary.firstName || ""} onChange={(v) => updateForm({ beneficiary: { ...form.beneficiary, firstName: v } })} />
              <FieldInput label="Last Name" value={form.beneficiary.lastName || ""} onChange={(v) => updateForm({ beneficiary: { ...form.beneficiary, lastName: v } })} />
              <FieldInput label="Relationship" value={form.beneficiary.relationship || ""} onChange={(v) => updateForm({ beneficiary: { ...form.beneficiary, relationship: v } })} placeholder="Spouse / Child / Parent" />
              <FieldInput label="Date of Birth" value={isoDate(form.beneficiary.dob)} onChange={(v) => updateForm({ beneficiary: { ...form.beneficiary, dob: v } })} type="date" />
              <FieldInput label="Email" value={form.beneficiary.email || ""} onChange={(v) => updateForm({ beneficiary: { ...form.beneficiary, email: v } })} type="email" />
              <FieldInput label="Phone" value={form.beneficiary.phone || ""} onChange={(v) => updateForm({ beneficiary: { ...form.beneficiary, phone: v } })} />
              <div className="sm:col-span-2"><FieldInput label="Street" value={form.beneficiary.street || ""} onChange={(v) => updateForm({ beneficiary: { ...form.beneficiary, street: v } })} /></div>
              <FieldInput label="Unit" value={form.beneficiary.unit || ""} onChange={(v) => updateForm({ beneficiary: { ...form.beneficiary, unit: v } })} />
              <FieldInput label="City" value={form.beneficiary.city || ""} onChange={(v) => updateForm({ beneficiary: { ...form.beneficiary, city: v } })} />
              <FieldSelect label="State" value={(form.beneficiary.state || "").toUpperCase()} onChange={(v) => updateForm({ beneficiary: { ...form.beneficiary, state: v } })} options={STATE_CODES.map((s) => ({ value: s, label: s }))} />
              <FieldInput label="ZIP" value={form.beneficiary.zip || ""} onChange={(v) => updateForm({ beneficiary: { ...form.beneficiary, zip: v } })} />
            </div>
          ) : beneficiary ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
              <Field label="Name" value={`${beneficiary.firstName || ""} ${beneficiary.lastName || ""}`.trim()} />
              <Field label="Relationship" value={beneficiary.relationship} />
              <Field label="Date of Birth" value={fmtDate(beneficiary.dob)} />
              <Field label="Email" value={beneficiary.email} />
              <Field label="Phone" value={fmtPhone(beneficiary.phone)} />
              {beneficiary.street && <Field label="Address" value={`${[beneficiary.street, beneficiary.unit].filter(Boolean).join(", ")}, ${beneficiary.city || ""}, ${(beneficiary.state || "").toUpperCase()} ${beneficiary.zip || ""}`} />}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4" style={{ color: "var(--gc-text-muted)" }} />
              <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>Beneficiary not set. Click <strong>Edit DBA</strong> to provide details.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
