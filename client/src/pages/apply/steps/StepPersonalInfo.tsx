interface Props {
  form: Record<string, any>;
  set: (k: string, v: any) => void;
  errors: Record<string, string>;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}

// Format SSN as XXX-XX-XXXX
function formatSSN(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

// Format phone as (XXX) XXX-XXXX
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function StepPersonalInfo({ form, set, errors, inputStyle, labelStyle }: Props) {
  const handleSSN = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 9);
    set("ssn", raw);
  };

  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
    set("phone", raw);
  };

  return (
    <div>
      <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>Personal Information</h2>
      <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-6)" }}>Your personal details as they appear on legal documents.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label style={labelStyle}>First Name *</label>
          <input value={form.firstName} onChange={e => set("firstName", e.target.value)} style={inputStyle} />
          {errors.firstName && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.firstName}</span>}
        </div>
        <div>
          <label style={labelStyle}>Last Name *</label>
          <input value={form.lastName} onChange={e => set("lastName", e.target.value)} style={inputStyle} />
          {errors.lastName && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.lastName}</span>}
        </div>
        <div>
          <label style={labelStyle}>Date of Birth *</label>
          <input type="date" value={form.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)} style={inputStyle} />
          {errors.dateOfBirth && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.dateOfBirth}</span>}
        </div>
        <div>
          <label style={labelStyle}>Social Security Number *</label>
          <input
            type="password"
            value={formatSSN(form.ssn || "")}
            onChange={handleSSN}
            placeholder="XXX-XX-XXXX"
            maxLength={11}
            style={inputStyle}
          />
          {errors.ssn && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.ssn}</span>}
        </div>
        <div className="sm:col-span-2">
          <label style={labelStyle}>Phone Number *</label>
          <input
            value={formatPhone(form.phone || "")}
            onChange={handlePhone}
            placeholder="(312) 555-0100"
            maxLength={14}
            style={inputStyle}
          />
          {errors.phone && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.phone}</span>}
        </div>
      </div>
    </div>
  );
}
