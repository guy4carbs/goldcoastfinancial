import { US_STATES } from "../applicationSchema";
import { CustomSelect } from "./StepAddress";

interface Props {
  form: Record<string, any>;
  set: (k: string, v: any) => void;
  errors: Record<string, string>;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}

const COMPANY_TYPES = [
  { value: "llc", label: "LLC Corporation" },
  { value: "s_corp", label: "S Corporation" },
  { value: "c_corp", label: "C Corporation" },
  { value: "sole_prop", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
];

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function StepBusinessDetails({ form, set, errors, inputStyle, labelStyle }: Props) {
  const stateOptions = US_STATES.map(s => ({ value: s, label: s }));

  return (
    <div>
      <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>Business Entity Details</h2>
      <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-6)" }}>Provide your business entity information as it appears on your Articles of Incorporation and W-9.</p>

      <div className="flex flex-col gap-4">
        {/* Company Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Company Type *</label>
            <CustomSelect value={form.companyType || ""} onChange={v => set("companyType", v)} options={COMPANY_TYPES} placeholder="Select" inputStyle={inputStyle} />
            {errors.companyType && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.companyType}</span>}
          </div>
          <div>
            <label style={labelStyle}>State of Incorporation *</label>
            <CustomSelect value={form.stateOfInc || ""} onChange={v => set("stateOfInc", v)} options={stateOptions} placeholder="Select state" inputStyle={inputStyle} />
            {errors.stateOfInc && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.stateOfInc}</span>}
          </div>
        </div>

        <div>
          <label style={labelStyle}>DBA Name <span style={{ opacity: 0.5, textTransform: "none" }}>(if different from entity name)</span></label>
          <input value={form.dbaName || ""} onChange={e => set("dbaName", e.target.value)} placeholder="Doing Business As" style={inputStyle} />
        </div>

        {/* Business Contact */}
        <div style={{ marginTop: "var(--gc-space-2)", fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>Business Contact</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Business Email *</label>
            <input value={form.businessEmail || ""} onChange={e => set("businessEmail", e.target.value)} type="email" placeholder="contact@company.com" style={inputStyle} />
            {errors.businessEmail && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.businessEmail}</span>}
          </div>
          <div>
            <label style={labelStyle}>Business Phone *</label>
            <input value={formatPhone(form.businessPhone || "")} onChange={e => set("businessPhone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="(312) 555-0100" maxLength={14} style={inputStyle} />
            {errors.businessPhone && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.businessPhone}</span>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Business Fax <span style={{ opacity: 0.5, textTransform: "none" }}>(optional)</span></label>
            <input value={formatPhone(form.businessFax || "")} onChange={e => set("businessFax", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="(312) 555-0101" maxLength={14} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Business Website <span style={{ opacity: 0.5, textTransform: "none" }}>(optional)</span></label>
            <input value={form.businessWebsite || ""} onChange={e => set("businessWebsite", e.target.value)} placeholder="company.com" style={inputStyle} />
          </div>
        </div>

        {/* Business Address */}
        <div style={{ marginTop: "var(--gc-space-2)", fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>Business Address</div>
        <div>
          <label style={labelStyle}>Business Street Address *</label>
          <input value={form.businessStreet || ""} onChange={e => set("businessStreet", e.target.value)} style={inputStyle} />
          {errors.businessStreet && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.businessStreet}</span>}
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-2">
            <label style={labelStyle}>City *</label>
            <input value={form.businessCity || ""} onChange={e => set("businessCity", e.target.value)} style={inputStyle} />
            {errors.businessCity && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.businessCity}</span>}
          </div>
          <div>
            <label style={labelStyle}>State *</label>
            <CustomSelect value={form.businessState || ""} onChange={v => set("businessState", v)} options={stateOptions} placeholder="--" inputStyle={inputStyle} />
            {errors.businessState && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.businessState}</span>}
          </div>
          <div>
            <label style={labelStyle}>ZIP *</label>
            <input value={form.businessZip || ""} onChange={e => set("businessZip", e.target.value.replace(/\D/g, "").slice(0, 5))} placeholder="60540" maxLength={5} style={inputStyle} />
            {errors.businessZip && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.businessZip}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
