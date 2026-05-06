import { Heart } from "lucide-react";
import { CustomSelect } from "./StepAddress";
import { US_STATES } from "../applicationSchema";
import { AddressAutocomplete } from "../components/AddressAutocomplete";

interface Props {
  form: Record<string, any>;
  set: (k: string, v: any) => void;
  errors: Record<string, string>;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}

const RELATIONSHIP_OPTIONS = [
  { value: "spouse", label: "Spouse" },
  { value: "child", label: "Child" },
  { value: "parent", label: "Parent" },
  { value: "sibling", label: "Sibling" },
  { value: "business_partner", label: "Business Partner" },
  { value: "trust", label: "Trust" },
  { value: "other", label: "Other" },
];

function formatSSN(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function StepBeneficiary({ form, set, errors, inputStyle, labelStyle }: Props) {
  const stateOptions = US_STATES.map(s => ({ value: s, label: s }));

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Heart className="w-6 h-6" style={{ color: "var(--gc-gold)" }} />
        <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)" }}>Beneficiary</h2>
      </div>
      <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-6)" }}>
        The beneficiary is the person designated to assume responsibility of the business entity in the event of the principal's passing. All fields are required.
      </p>

      <div className="flex flex-col gap-4">
        {/* Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>First Name *</label>
            <input value={form.beneficiaryFirstName || ""} onChange={e => set("beneficiaryFirstName", e.target.value)} style={inputStyle} />
            {errors.beneficiaryFirstName && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.beneficiaryFirstName}</span>}
          </div>
          <div>
            <label style={labelStyle}>Last Name *</label>
            <input value={form.beneficiaryLastName || ""} onChange={e => set("beneficiaryLastName", e.target.value)} style={inputStyle} />
            {errors.beneficiaryLastName && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.beneficiaryLastName}</span>}
          </div>
        </div>

        {/* Relationship + DOB */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Relationship *</label>
            <CustomSelect value={form.beneficiaryRelationship || ""} onChange={v => set("beneficiaryRelationship", v)} options={RELATIONSHIP_OPTIONS} placeholder="Select relationship" inputStyle={inputStyle} />
            {errors.beneficiaryRelationship && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.beneficiaryRelationship}</span>}
          </div>
          <div>
            <label style={labelStyle}>Date of Birth *</label>
            <input type="date" value={form.beneficiaryDob || ""} onChange={e => set("beneficiaryDob", e.target.value)} style={inputStyle} />
            {errors.beneficiaryDob && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.beneficiaryDob}</span>}
          </div>
        </div>

        {/* SSN */}
        <div>
          <label style={labelStyle}>Social Security Number *</label>
          <input type="password" value={formatSSN(form.beneficiarySsn || "")} onChange={e => set("beneficiarySsn", e.target.value.replace(/\D/g, "").slice(0, 9))} placeholder="XXX-XX-XXXX" maxLength={11} style={inputStyle} />
          {errors.beneficiarySsn && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.beneficiarySsn}</span>}
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Email Address *</label>
            <input value={form.beneficiaryEmail || ""} onChange={e => set("beneficiaryEmail", e.target.value)} type="email" placeholder="beneficiary@email.com" style={inputStyle} />
            {errors.beneficiaryEmail && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.beneficiaryEmail}</span>}
          </div>
          <div>
            <label style={labelStyle}>Phone Number *</label>
            <input value={formatPhone(form.beneficiaryPhone || "")} onChange={e => set("beneficiaryPhone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="(312) 555-0100" maxLength={14} style={inputStyle} />
            {errors.beneficiaryPhone && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.beneficiaryPhone}</span>}
          </div>
        </div>

        {/* Address */}
        <div style={{ marginTop: "var(--gc-space-2)", fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>Beneficiary Address</div>
        <div>
          <label style={labelStyle}>Street Address *</label>
          <AddressAutocomplete
            value={form.beneficiaryStreet || ""}
            onChange={v => set("beneficiaryStreet", v)}
            onSelect={r => {
              set("beneficiaryStreet", r.street);
              set("beneficiaryCity", r.city);
              set("beneficiaryState", r.state);
              set("beneficiaryZip", r.zip);
            }}
            inputStyle={inputStyle}
          />
          {errors.beneficiaryStreet && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.beneficiaryStreet}</span>}
        </div>
        <div>
          <label style={labelStyle}>Suite, Apt, Unit <span style={{ opacity: 0.5, textTransform: "none" }}>(optional)</span></label>
          <input value={form.beneficiaryUnit || ""} onChange={e => set("beneficiaryUnit", e.target.value)} placeholder="Apt 2B" style={inputStyle} />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-2">
            <label style={labelStyle}>City *</label>
            <input value={form.beneficiaryCity || ""} onChange={e => set("beneficiaryCity", e.target.value)} style={inputStyle} />
            {errors.beneficiaryCity && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.beneficiaryCity}</span>}
          </div>
          <div>
            <label style={labelStyle}>State *</label>
            <CustomSelect value={form.beneficiaryState || ""} onChange={v => set("beneficiaryState", v)} options={stateOptions} placeholder="--" inputStyle={inputStyle} />
            {errors.beneficiaryState && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.beneficiaryState}</span>}
          </div>
          <div>
            <label style={labelStyle}>ZIP *</label>
            <input value={form.beneficiaryZip || ""} onChange={e => set("beneficiaryZip", e.target.value.replace(/\D/g, "").slice(0, 5))} placeholder="60540" maxLength={5} style={inputStyle} />
            {errors.beneficiaryZip && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.beneficiaryZip}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
