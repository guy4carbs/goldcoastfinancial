import { Shield } from "lucide-react";
import { CustomSelect } from "./StepAddress";
import { US_STATES } from "../applicationSchema";

interface Props {
  form: Record<string, any>;
  set: (k: string, v: any) => void;
  errors: Record<string, string>;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}

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

export function StepDRLP({ form, set, errors, inputStyle, labelStyle }: Props) {
  const stateOptions = US_STATES.map(s => ({ value: s, label: s }));

  // Auto-populate from primary owner or personal info if DRLP fields are empty
  const owners = form.owners || [];
  const primaryOwner = owners.find((o: any) => o.isPrimary);

  const autoFill = () => {
    if (primaryOwner) {
      if (!form.drlpFirstName) set("drlpFirstName", primaryOwner.firstName || form.firstName || "");
      if (!form.drlpLastName) set("drlpLastName", primaryOwner.lastName || form.lastName || "");
      if (!form.drlpDob) set("drlpDob", primaryOwner.dateOfBirth || form.dateOfBirth || "");
      if (!form.drlpSsn) set("drlpSsn", primaryOwner.ssn || form.ssn || "");
    }
    if (!form.drlpEmail) set("drlpEmail", form.email || "");
    if (!form.drlpPhone) set("drlpPhone", form.phone || "");
    if (!form.drlpNpn) set("drlpNpn", form.npn || "");
  };

  // Auto-populate on first render if empty
  if (!form.drlpFirstName && (primaryOwner?.firstName || form.firstName)) {
    setTimeout(autoFill, 0);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-6 h-6" style={{ color: "var(--gc-gold)" }} />
        <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)" }}>DRLP Verification</h2>
      </div>
      <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-2)" }}>
        The <strong style={{ color: "var(--gc-gold)" }}>Designated Responsible Licensed Producer (DRLP)</strong> is the licensed individual responsible for this business entity. This is typically one of the owners listed in the previous step.
      </p>
      <p style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-6)" }}>
        The information below is for this person only. All fields are required for producer identity verification.
      </p>

      <div className="flex flex-col gap-4">
        {/* Name */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label style={labelStyle}>DRLP First Name *</label>
            <input value={form.drlpFirstName || ""} onChange={e => set("drlpFirstName", e.target.value)} style={inputStyle} />
            {errors.drlpFirstName && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.drlpFirstName}</span>}
          </div>
          <div>
            <label style={labelStyle}>DRLP Middle Name <span style={{ opacity: 0.5, textTransform: "none" }}>(optional)</span></label>
            <input value={form.drlpMiddleName || ""} onChange={e => set("drlpMiddleName", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>DRLP Last Name *</label>
            <input value={form.drlpLastName || ""} onChange={e => set("drlpLastName", e.target.value)} style={inputStyle} />
            {errors.drlpLastName && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.drlpLastName}</span>}
          </div>
        </div>

        {/* DOB + NPN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>DRLP Date of Birth *</label>
            <input type="date" value={form.drlpDob || ""} onChange={e => set("drlpDob", e.target.value)} style={inputStyle} />
            {errors.drlpDob && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.drlpDob}</span>}
          </div>
          <div>
            <label style={labelStyle}>DRLP NPN *</label>
            <input value={form.drlpNpn || ""} onChange={e => set("drlpNpn", e.target.value)} placeholder="National Producer Number" style={inputStyle} />
            {errors.drlpNpn && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.drlpNpn}</span>}
          </div>
        </div>

        {/* SSN */}
        <div>
          <label style={labelStyle}>DRLP Social Security Number *</label>
          <input type="password" value={formatSSN(form.drlpSsn || "")} onChange={e => set("drlpSsn", e.target.value.replace(/\D/g, "").slice(0, 9))} placeholder="XXX-XX-XXXX" maxLength={11} style={inputStyle} />
          {errors.drlpSsn && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.drlpSsn}</span>}
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>DRLP Email Address *</label>
            <input value={form.drlpEmail || ""} onChange={e => set("drlpEmail", e.target.value)} type="email" placeholder="drlp@email.com" style={inputStyle} />
            {errors.drlpEmail && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.drlpEmail}</span>}
          </div>
          <div>
            <label style={labelStyle}>DRLP Phone Number *</label>
            <input value={formatPhone(form.drlpPhone || "")} onChange={e => set("drlpPhone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="(312) 555-0100" maxLength={14} style={inputStyle} />
            {errors.drlpPhone && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.drlpPhone}</span>}
          </div>
        </div>

        {/* Birthplace */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Birthplace — City *</label>
            <input value={form.drlpBirthCity || ""} onChange={e => set("drlpBirthCity", e.target.value)} placeholder="City of birth" style={inputStyle} />
            {errors.drlpBirthCity && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.drlpBirthCity}</span>}
          </div>
          <div>
            <label style={labelStyle}>Birthplace — State *</label>
            <CustomSelect value={form.drlpBirthState || ""} onChange={v => set("drlpBirthState", v)} options={stateOptions} placeholder="Select state" inputStyle={inputStyle} />
            {errors.drlpBirthState && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.drlpBirthState}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
