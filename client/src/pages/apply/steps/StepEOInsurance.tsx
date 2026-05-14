import { useEffect } from "react";
import { CustomSelect } from "./StepAddress";
import { FileUploadZone } from "../components/FileUploadZone";
import { useApplyUpload } from "../hooks/useApplyUpload";

interface Props {
  form: Record<string, any>;
  set: (k: string, v: any) => void;
  errors: Record<string, string>;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
  token?: string;
}

const COVERAGE_OPTIONS = [
  { value: "1000000", label: "$1,000,000" },
  { value: "2000000", label: "$2,000,000" },
  { value: "3000000", label: "$3,000,000" },
  { value: "5000000", label: "$5,000,000" },
];

export function StepEOInsurance({ form, set, errors, inputStyle, labelStyle, token }: Props) {
  const { upload, uploading, error: uploadError } = useApplyUpload(token);

  useEffect(() => {
    if (form.eoEffectiveDate && !form.eoExpirationDate) {
      const effective = new Date(form.eoEffectiveDate);
      if (!isNaN(effective.getTime())) {
        const expiration = new Date(effective);
        expiration.setFullYear(expiration.getFullYear() + 1);
        set("eoExpirationDate", expiration.toISOString().split("T")[0]);
      }
    }
  }, [form.eoEffectiveDate]);

  const handleEffectiveDate = (val: string) => {
    set("eoEffectiveDate", val);
    if (val) {
      const effective = new Date(val);
      if (!isNaN(effective.getTime())) {
        const expiration = new Date(effective);
        expiration.setFullYear(expiration.getFullYear() + 1);
        set("eoExpirationDate", expiration.toISOString().split("T")[0]);
      }
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>E&O Insurance</h2>
      <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-6)" }}>Errors & Omissions insurance is required with a minimum coverage of $1,000,000.</p>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>E&O Provider *</label>
            <input value={form.eoProvider} onChange={e => set("eoProvider", e.target.value)} placeholder="e.g., NAPA, CalSurance, EOforLess" style={inputStyle} />
            {errors.eoProvider && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.eoProvider}</span>}
          </div>
          <div>
            <label style={labelStyle}>Policy Number *</label>
            <input value={form.eoPolicyNumber} onChange={e => set("eoPolicyNumber", e.target.value)} style={inputStyle} />
            {errors.eoPolicyNumber && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.eoPolicyNumber}</span>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label style={labelStyle}>Effective Date *</label>
            <input type="date" value={form.eoEffectiveDate} onChange={e => handleEffectiveDate(e.target.value)} style={inputStyle} />
            {errors.eoEffectiveDate && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.eoEffectiveDate}</span>}
          </div>
          <div>
            <label style={labelStyle}>Expiration Date *</label>
            <input type="date" value={form.eoExpirationDate} onChange={e => set("eoExpirationDate", e.target.value)} style={inputStyle} />
            {errors.eoExpirationDate && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.eoExpirationDate}</span>}
          </div>
          <div>
            <label style={labelStyle}>Coverage Amount *</label>
            <CustomSelect value={form.eoCoverageAmount} onChange={v => set("eoCoverageAmount", v)} options={COVERAGE_OPTIONS} placeholder="Select" inputStyle={inputStyle} />
            {errors.eoCoverageAmount && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.eoCoverageAmount}</span>}
          </div>
        </div>
      </div>

      {/* E&O Certificate Upload */}
      <div style={{ marginTop: "var(--gc-space-6)" }}>
        <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-2)" }}>E&O Certificate</div>
        <FileUploadZone
          label={uploading === "eo_cert" ? "Uploading..." : "Upload E&O Insurance Certificate"}
          accept=".pdf"
          uploaded={form.eoCertUploaded || false}
          fileName={form.eoCertFileName}
          onUpload={async file => {
            if (await upload("eo_cert", file)) {
              set("eoCertUploaded", true);
              set("eoCertFileName", file.name);
            }
          }}
        />
        {uploadError && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", marginTop: 4, display: "block" }}>{uploadError}</span>}
        {errors.eoCertUploaded && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", marginTop: 4, display: "block" }}>{errors.eoCertUploaded}</span>}
      </div>
    </div>
  );
}
