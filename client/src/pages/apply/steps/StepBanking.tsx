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

const ACCOUNT_TYPES = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
];

export function StepBanking({ form, set, errors, inputStyle, labelStyle, token }: Props) {
  const { upload, uploading, error: uploadError } = useApplyUpload(token);
  return (
    <div>
      <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>Banking & Direct Deposit</h2>
      <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-6)" }}>Your commission payments will be deposited directly into this account.</p>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Bank Name *</label>
            <input value={form.bankName} onChange={e => set("bankName", e.target.value)} placeholder="e.g., Chase, Bank of America" style={inputStyle} />
            {errors.bankName && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.bankName}</span>}
          </div>
          <div>
            <label style={labelStyle}>Account Type *</label>
            <CustomSelect value={form.bankAccountType} onChange={v => set("bankAccountType", v)} options={ACCOUNT_TYPES} placeholder="Select" inputStyle={inputStyle} />
            {errors.bankAccountType && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.bankAccountType}</span>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Routing Number *</label>
            <input value={form.routingNumber} onChange={e => set("routingNumber", e.target.value.replace(/\D/g, "").slice(0, 9))} placeholder="9-digit routing number" maxLength={9} style={{ ...inputStyle, fontFamily: "monospace" }} />
            {errors.routingNumber && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.routingNumber}</span>}
          </div>
          <div>
            <label style={labelStyle}>Account Number *</label>
            <input type="password" value={form.accountNumber} onChange={e => set("accountNumber", e.target.value)} placeholder="Account number" style={{ ...inputStyle, fontFamily: "monospace" }} />
            {errors.accountNumber && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.accountNumber}</span>}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "var(--gc-space-4)", padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border-subtle)", borderRadius: "var(--gc-radius-sm)" }}>
        <p style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", lineHeight: 1.6 }}>
          Your banking information is encrypted using AES-256-GCM and stored securely. It will only be used for commission direct deposit.
        </p>
      </div>

      {/* Direct Deposit Form Upload */}
      <div style={{ marginTop: "var(--gc-space-6)" }}>
        <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-2)" }}>Direct Deposit Form</div>
        <FileUploadZone
          label={uploading === "direct_deposit" ? "Uploading..." : "Upload Direct Deposit Authorization Form"}
          accept=".pdf"
          uploaded={form.ddFormUploaded || false}
          fileName={form.ddFormFileName}
          onUpload={async file => {
            if (await upload("direct_deposit", file)) {
              set("ddFormUploaded", true);
              set("ddFormFileName", file.name);
            }
          }}
        />
        {uploadError && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", marginTop: 4, display: "block" }}>{uploadError}</span>}
        {errors.ddFormUploaded && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", marginTop: 4, display: "block" }}>{errors.ddFormUploaded}</span>}
      </div>
    </div>
  );
}
