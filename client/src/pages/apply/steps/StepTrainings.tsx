import { GraduationCap } from "lucide-react";
import { FileUploadZone } from "../components/FileUploadZone";

interface Props {
  form: Record<string, any>;
  set: (k: string, v: any) => void;
  errors: Record<string, string>;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}

export function StepTrainings({ form, set, errors, inputStyle, labelStyle }: Props) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <GraduationCap className="w-6 h-6" style={{ color: "var(--gc-gold)" }} />
        <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)" }}>Trainings & Certifications</h2>
      </div>
      <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-6)" }}>Upload your AML certificate, government-issued photo ID, and verify your continuing education status.</p>

      <div className="flex flex-col gap-6">
        {/* AML Certificate */}
        <div>
          <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-2)" }}>AML Certificate</div>
          <p style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)" }}>Anti-Money Laundering training certification is required for all contracted agents.</p>
          <FileUploadZone
            label="Upload AML Certificate"
            accept=".pdf"
            uploaded={form.amlCertUploaded || false}
            fileName={form.amlCertFileName}
            onUpload={file => { set("amlCertUploaded", true); set("amlCertFileName", file.name); }}
          />
          {errors.amlCertUploaded && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", marginTop: 4, display: "block" }}>{errors.amlCertUploaded}</span>}
        </div>

        {/* Government ID */}
        <div>
          <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-2)" }}>Government-Issued Photo ID</div>
          <p style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)" }}>Upload a clear photo of your driver's license, state ID, or passport.</p>
          <FileUploadZone
            label="Upload Government Photo ID"
            accept=".pdf,.jpg,.jpeg,.png"
            uploaded={form.govIdUploaded || false}
            fileName={form.govIdFileName}
            onUpload={file => { set("govIdUploaded", true); set("govIdFileName", file.name); }}
          />
          {errors.govIdUploaded && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", marginTop: 4, display: "block" }}>{errors.govIdUploaded}</span>}
        </div>

        {/* CE Expiration Date */}
        <div>
          <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-2)" }}>Continuing Education</div>
          <p style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)" }}>Provide the expiration date of your current continuing education credits.</p>
          <div>
            <label style={labelStyle}>CE Expiration Date *</label>
            <input type="date" value={form.ceExpirationDate || ""} onChange={e => set("ceExpirationDate", e.target.value)} style={inputStyle} />
            {errors.ceExpirationDate && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.ceExpirationDate}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
