import { useEffect } from "react";
import { US_STATES } from "../applicationSchema";
import { CustomSelect } from "./StepAddress";
import { AddressAutocomplete } from "../components/AddressAutocomplete";

interface Props {
  form: Record<string, any>;
  set: (k: string, v: any) => void;
  errors: Record<string, string>;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function StepBusinessContact({ form, set, errors, inputStyle, labelStyle }: Props) {
  const stateOptions = US_STATES.map(s => ({ value: s, label: s }));

  return (
    <div>
      <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>Business Contact Information</h2>
      <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-6)" }}>Provide the contact details and mailing address for your business entity.</p>

      <div className="flex flex-col gap-4">
        {/* Contact Info */}
        <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>Contact</div>
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
          <label style={labelStyle}>Street Address *</label>
          <AddressAutocomplete
            value={form.businessStreet || ""}
            onChange={v => set("businessStreet", v)}
            onSelect={r => {
              set("businessStreet", r.street);
              set("businessCity", r.city);
              set("businessState", r.state);
              set("businessZip", r.zip);
            }}
            inputStyle={inputStyle}
          />
          {errors.businessStreet && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.businessStreet}</span>}
        </div>
        <div>
          <label style={labelStyle}>Suite, Apt, Unit <span style={{ opacity: 0.5, textTransform: "none" }}>(optional)</span></label>
          <input value={form.businessUnit || ""} onChange={e => set("businessUnit", e.target.value)} placeholder="Suite 300" style={inputStyle} />
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
        {/* Mailing Address */}
        <div style={{ marginTop: "var(--gc-space-2)", fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>Mailing Address</div>

        <label className="flex items-center gap-3 cursor-pointer" style={{
          padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface)",
          border: `1px solid ${form.mailingSameAsBusiness ? "var(--gc-gold)" : "var(--gc-border)"}`,
          borderRadius: "var(--gc-radius-sm)", transition: "border-color 0.2s",
        }}>
          <input type="checkbox" checked={form.mailingSameAsBusiness || false} onChange={e => {
            set("mailingSameAsBusiness", e.target.checked);
            if (e.target.checked) {
              set("mailingStreet", form.businessStreet || "");
              set("mailingUnit", form.businessUnit || "");
              set("mailingCity", form.businessCity || "");
              set("mailingState", form.businessState || "");
              set("mailingZip", form.businessZip || "");
            }
          }} style={{ accentColor: "var(--gc-gold)" }} />
          <span style={{ fontSize: "var(--gc-text-sm)", color: form.mailingSameAsBusiness ? "var(--gc-text-primary)" : "var(--gc-text-secondary)" }}>Mailing address is the same as business address</span>
        </label>

        {!form.mailingSameAsBusiness && (
          <>
            <div>
              <label style={labelStyle}>Mailing Street Address *</label>
              <AddressAutocomplete
                value={form.mailingStreet || ""}
                onChange={v => set("mailingStreet", v)}
                onSelect={r => {
                  set("mailingStreet", r.street);
                  set("mailingCity", r.city);
                  set("mailingState", r.state);
                  set("mailingZip", r.zip);
                }}
                inputStyle={inputStyle}
              />
              {errors.mailingStreet && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.mailingStreet}</span>}
            </div>
            <div>
              <label style={labelStyle}>Suite, Apt, Unit <span style={{ opacity: 0.5, textTransform: "none" }}>(optional)</span></label>
              <input value={form.mailingUnit || ""} onChange={e => set("mailingUnit", e.target.value)} placeholder="Suite 300" style={inputStyle} />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <label style={labelStyle}>City *</label>
                <input value={form.mailingCity || ""} onChange={e => set("mailingCity", e.target.value)} style={inputStyle} />
                {errors.mailingCity && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.mailingCity}</span>}
              </div>
              <div>
                <label style={labelStyle}>State *</label>
                <CustomSelect value={form.mailingState || ""} onChange={v => set("mailingState", v)} options={stateOptions} placeholder="--" inputStyle={inputStyle} />
                {errors.mailingState && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.mailingState}</span>}
              </div>
              <div>
                <label style={labelStyle}>ZIP *</label>
                <input value={form.mailingZip || ""} onChange={e => set("mailingZip", e.target.value.replace(/\D/g, "").slice(0, 5))} placeholder="60540" maxLength={5} style={inputStyle} />
                {errors.mailingZip && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.mailingZip}</span>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
