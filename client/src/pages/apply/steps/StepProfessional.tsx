import { US_STATES } from "../applicationSchema";
import { CustomSelect } from "./StepAddress";

interface Props {
  form: Record<string, any>;
  set: (k: string, v: any) => void;
  errors: Record<string, string>;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}

const EXP_OPTIONS = [
  { value: "0-1", label: "0-1 years" },
  { value: "2-5", label: "2-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10+", label: "10+ years" },
];

export function StepProfessional({ form, set, errors, inputStyle, labelStyle }: Props) {
  const toggleState = (s: string) => {
    const current: string[] = form.licensedStates || [];
    set("licensedStates", current.includes(s) ? current.filter((x: string) => x !== s) : [...current, s]);
  };

  return (
    <div>
      <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>Professional Background</h2>
      <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-6)" }}>Your insurance industry experience and licensing details.</p>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>NPN Number</label>
            <input value={form.npn} onChange={e => set("npn", e.target.value)} placeholder="National Producer Number" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Years of Experience *</label>
            <CustomSelect value={form.yearsExperience} onChange={v => set("yearsExperience", v)} options={EXP_OPTIONS} placeholder="Select" inputStyle={inputStyle} />
            {errors.yearsExperience && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.yearsExperience}</span>}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Previous Agency</label>
          <input value={form.previousAgency} onChange={e => set("previousAgency", e.target.value)} placeholder="If applicable" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Are you currently licensed?</label>
          <div className="flex gap-3 mt-2">
            {(["yes", "no", "in_progress"] as const).map(v => (
              <button key={v} onClick={() => set("isLicensed", v)} style={{
                padding: "var(--gc-space-2) var(--gc-space-3)", borderRadius: "var(--gc-radius-sm)",
                border: `1px solid ${form.isLicensed === v ? "var(--gc-gold)" : "var(--gc-border)"}`,
                backgroundColor: form.isLicensed === v ? "color-mix(in srgb, var(--gc-gold) 12%, transparent)" : "var(--gc-surface)",
                color: form.isLicensed === v ? "var(--gc-gold)" : "var(--gc-text-secondary)",
                fontSize: "var(--gc-text-sm)", cursor: "pointer",
              }}>
                {v === "in_progress" ? "In Progress" : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {form.isLicensed === "yes" && (
          <>
            <div>
              <label style={labelStyle}>License Number</label>
              <input value={form.licenseNumber} onChange={e => set("licenseNumber", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Licensed States</label>
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 mt-2">
                {US_STATES.map(s => (
                  <button key={s} onClick={() => toggleState(s)} style={{
                    padding: "6px 0", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-xs)", fontWeight: 500,
                    border: `1px solid ${(form.licensedStates || []).includes(s) ? "var(--gc-gold)" : "var(--gc-border)"}`,
                    backgroundColor: (form.licensedStates || []).includes(s) ? "color-mix(in srgb, var(--gc-gold) 15%, transparent)" : "var(--gc-surface)",
                    color: (form.licensedStates || []).includes(s) ? "var(--gc-gold)" : "var(--gc-text-muted)",
                    cursor: "pointer",
                  }}>{s}</button>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
