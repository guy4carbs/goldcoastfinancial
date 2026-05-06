import { Building2, User } from "lucide-react";

function formatEIN(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

interface Props {
  form: Record<string, any>;
  set: (k: string, v: any) => void;
  errors: Record<string, string>;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}

export function StepDBAType({ form, set, errors, inputStyle, labelStyle }: Props) {
  return (
    <div>
      <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>How Will You Contract?</h2>
      <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-6)" }}>Select whether you are contracting as an individual or through a business entity. This determines the contracting format for your application.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {([
          { value: "individual", label: "Individual", desc: "Contract under your personal name and SSN.", icon: User },
          { value: "business_entity", label: "Business Entity", desc: "Contract through an LLC, S-Corp, or other entity.", icon: Building2 },
        ] as const).map(({ value, label, desc, icon: Icon }) => (
          <button key={value} onClick={() => set("dbaType", value)} style={{
            padding: "var(--gc-space-5)", borderRadius: "var(--gc-radius-md)", textAlign: "left",
            border: `2px solid ${form.dbaType === value ? "var(--gc-gold)" : "var(--gc-border)"}`,
            backgroundColor: form.dbaType === value ? "color-mix(in srgb, var(--gc-gold) 8%, transparent)" : "var(--gc-surface)",
            cursor: "pointer", transition: "all 0.2s",
          }}>
            <div className="flex items-center gap-3 mb-2">
              <div style={{
                width: 40, height: 40, borderRadius: "var(--gc-radius-md)",
                backgroundColor: form.dbaType === value ? "color-mix(in srgb, var(--gc-gold) 15%, transparent)" : "var(--gc-surface-2)",
                border: `1px solid ${form.dbaType === value ? "var(--gc-gold)" : "var(--gc-border-subtle)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon className="w-5 h-5" style={{ color: form.dbaType === value ? "var(--gc-gold)" : "var(--gc-text-muted)" }} />
              </div>
              <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", fontWeight: 600, color: form.dbaType === value ? "var(--gc-gold)" : "var(--gc-text-primary)" }}>{label}</span>
            </div>
            <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", lineHeight: 1.5 }}>{desc}</p>
          </button>
        ))}
      </div>

      {/* Conditional fields based on selection */}
      {form.dbaType === "business_entity" && (
        <div className="flex flex-col gap-4" style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
          <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>Business Entity Details</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Company Name *</label>
              <input value={form.companyName} onChange={e => set("companyName", e.target.value)} placeholder="Legal entity name" style={inputStyle} />
              {errors.companyName && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.companyName}</span>}
            </div>
            <div>
              <label style={labelStyle}>Your Title *</label>
              <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g., Managing Member, President" style={inputStyle} />
              {errors.title && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.title}</span>}
            </div>
          </div>
          <div>
            <label style={labelStyle}>EIN *</label>
            <input value={formatEIN(form.ein || "")} onChange={e => set("ein", e.target.value.replace(/\D/g, "").slice(0, 9))} placeholder="XX-XXXXXXX" maxLength={10} style={inputStyle} />
            {errors.ein && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.ein}</span>}
          </div>
        </div>
      )}

      {form.dbaType === "individual" && (
        <div style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border-subtle)", borderRadius: "var(--gc-radius-sm)" }}>
          <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)", lineHeight: 1.5 }}>
            You will contract under your personal legal name and Social Security Number as provided in your personal information.
          </p>
        </div>
      )}
    </div>
  );
}
