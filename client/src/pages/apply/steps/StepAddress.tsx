import { useState, useRef, useEffect } from "react";
import { US_STATES } from "../applicationSchema";
import { ChevronDown } from "lucide-react";
import { AddressAutocomplete } from "../components/AddressAutocomplete";

interface Props {
  form: Record<string, any>;
  set: (k: string, v: any) => void;
  errors: Record<string, string>;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}

function CustomSelect({ value, onChange, options, placeholder, inputStyle }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder: string; inputStyle: React.CSSProperties }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center justify-between"
        style={{ ...inputStyle, cursor: "pointer", textAlign: "left" }}>
        <span style={{ color: selected ? "var(--gc-text-primary)" : "var(--gc-text-muted)" }}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "var(--gc-text-muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
          backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)",
          borderRadius: "var(--gc-radius-sm)", boxShadow: "var(--gc-shadow-lg)",
          maxHeight: 200, overflowY: "auto", scrollbarWidth: "thin",
        }}>
          {options.map(o => (
            <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "8px 12px", border: "none", cursor: "pointer",
                backgroundColor: value === o.value ? "color-mix(in srgb, var(--gc-gold) 12%, transparent)" : "transparent",
                color: value === o.value ? "var(--gc-gold)" : "var(--gc-text-primary)",
                fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-md)",
              }}
              onMouseEnter={e => { if (value !== o.value) e.currentTarget.style.backgroundColor = "var(--gc-hover-overlay)"; }}
              onMouseLeave={e => { if (value !== o.value) e.currentTarget.style.backgroundColor = "transparent"; }}
            >{o.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export function StepAddress({ form, set, errors, inputStyle, labelStyle }: Props) {
  const stateOptions = US_STATES.map(s => ({ value: s, label: s }));

  return (
    <div>
      <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>Address</h2>
      <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-6)" }}>Your current residential address.</p>

      <div className="flex flex-col gap-4">
        <div>
          <label style={labelStyle}>Street Address *</label>
          <AddressAutocomplete
            value={form.streetAddress}
            onChange={v => set("streetAddress", v)}
            onSelect={r => { set("streetAddress", r.street); set("city", r.city); set("state", r.state); set("zipCode", r.zip); }}
            inputStyle={inputStyle}
          />
          {errors.streetAddress && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.streetAddress}</span>}
        </div>
        <div>
          <label style={labelStyle}>Address Line 2 <span style={{ opacity: 0.5, textTransform: "none" }}>(optional)</span></label>
          <input value={form.addressLine2 || ""} onChange={e => set("addressLine2", e.target.value)} placeholder="Apt, Suite, Unit" style={inputStyle} />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-2">
            <label style={labelStyle}>City *</label>
            <input value={form.city} onChange={e => set("city", e.target.value)} style={inputStyle} />
            {errors.city && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.city}</span>}
          </div>
          <div>
            <label style={labelStyle}>State *</label>
            <CustomSelect value={form.state} onChange={v => set("state", v)} options={stateOptions} placeholder="--" inputStyle={inputStyle} />
            {errors.state && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.state}</span>}
          </div>
          <div>
            <label style={labelStyle}>ZIP *</label>
            <input value={form.zipCode} onChange={e => set("zipCode", e.target.value.replace(/\D/g, "").slice(0, 5))} placeholder="60540" maxLength={5} style={inputStyle} />
            {errors.zipCode && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.zipCode}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export { CustomSelect };
