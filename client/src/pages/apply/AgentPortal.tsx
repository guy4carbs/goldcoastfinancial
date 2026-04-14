import { useState } from "react";
import { Shield, CheckCircle, Loader2 } from "lucide-react";

const CARRIERS = ["Mutual of Omaha", "Transamerica", "Americo", "Corebridge Financial", "National Life Group", "North American", "Foresters Financial", "Globe Life", "ANICO", "Prosperity Life", "American Equity", "Athene", "F&G Annuities", "Nationwide", "Pacific Life"];
const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];

export default function AgentPortal() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({ firstName: "", lastName: "", email: "", phone: "", dob: "", ssn: "", street: "", city: "", state: "", zip: "", experience: "", previousAgency: "", npn: "", isLicensed: "no", carriers: [] as string[], agreedToTerms: false });

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));
  const next = () => setStep(s => Math.min(6, s + 1));
  const prev = () => setStep(s => Math.max(0, s - 1));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await fetch("/api/apply/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, password: "TempPass123!", agreedToTerms: true, agreedToPrivacy: true }) });
      setSubmitted(true);
    } catch {} finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <div data-theme="gc-dark" className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--gc-bg)" }}>
        <div className="text-center p-8">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--gc-status-active)" }} />
          <h1 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-4xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Application Submitted</h1>
          <p style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-secondary)" }}>Thank you for applying to Gold Coast Financial. We'll review your application and be in touch within 48 hours.</p>
        </div>
      </div>
    );
  }

  const inputStyle = { padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-md)", width: "100%" };
  const labelStyle = { fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" };

  return (
    <div data-theme="gc-dark" className="min-h-screen" style={{ backgroundColor: "var(--gc-bg)", fontFamily: "var(--gc-font-body)" }}>
      {/* Header */}
      <div className="sticky top-0 z-40" style={{ backgroundColor: "var(--gc-surface)", borderBottom: "1px solid var(--gc-border)" }}>
        <div style={{ height: 2, background: "linear-gradient(90deg, var(--gc-gold), var(--gc-gold-bright))" }} />
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ padding: "var(--gc-space-2)", backgroundColor: "var(--gc-gold)", borderRadius: "var(--gc-radius-md)" }}><Shield className="w-4 h-4" style={{ color: "var(--gc-btn-primary-text)" }} /></div>
            <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", fontWeight: 600, color: "var(--gc-text-primary)" }}>GOLD COAST FINANCIAL</span>
          </div>
          <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-gold)", fontWeight: 500 }}>Step {step + 1} of 7</span>
        </div>
        {/* Progress */}
        <div style={{ height: 3, backgroundColor: "var(--gc-surface-2)" }}>
          <div style={{ height: "100%", width: `${((step + 1) / 7) * 100}%`, backgroundColor: "var(--gc-gold)", transition: "width var(--gc-transition-normal)" }} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center py-8">
            <h1 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-4xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Agent Application</h1>
            <p style={{ fontSize: "var(--gc-text-lg)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-8)", maxWidth: 480, margin: "0 auto var(--gc-space-8)" }}>Apply to join Gold Coast Financial as a licensed insurance agent. The process takes about 10 minutes.</p>
            <button onClick={next} style={{ padding: "var(--gc-space-3) var(--gc-space-8)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-lg)", fontWeight: 600 }}>BEGIN APPLICATION</button>
          </div>
        )}

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-6)" }}>Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label style={labelStyle}>First Name</label><input value={form.firstName} onChange={e => set("firstName", e.target.value)} style={inputStyle} required /></div>
              <div><label style={labelStyle}>Last Name</label><input value={form.lastName} onChange={e => set("lastName", e.target.value)} style={inputStyle} required /></div>
              <div><label style={labelStyle}>Date of Birth</label><input type="date" value={form.dob} onChange={e => set("dob", e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>SSN</label><input type="password" value={form.ssn} onChange={e => set("ssn", e.target.value)} placeholder="***-**-****" style={inputStyle} /></div>
              <div className="col-span-2"><label style={labelStyle}>Email</label><input type="email" value={form.email} onChange={e => set("email", e.target.value)} style={inputStyle} required /></div>
              <div className="col-span-2"><label style={labelStyle}>Phone</label><input value={form.phone} onChange={e => set("phone", e.target.value)} style={inputStyle} /></div>
              <div className="col-span-2"><label style={labelStyle}>Street Address</label><input value={form.street} onChange={e => set("street", e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>City</label><input value={form.city} onChange={e => set("city", e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>State</label><select value={form.state} onChange={e => set("state", e.target.value)} style={inputStyle}><option value="">Select</option>{US_STATES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div><label style={labelStyle}>ZIP</label><input value={form.zip} onChange={e => set("zip", e.target.value)} style={inputStyle} /></div>
            </div>
          </div>
        )}

        {/* Step 2: Professional */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-6)" }}>Professional Background</h2>
            <div className="flex flex-col gap-4">
              <div><label style={labelStyle}>Years of Experience</label><select value={form.experience} onChange={e => set("experience", e.target.value)} style={inputStyle}><option value="">Select</option><option>0-1 years</option><option>2-5 years</option><option>5-10 years</option><option>10+ years</option></select></div>
              <div><label style={labelStyle}>Previous Agency</label><input value={form.previousAgency} onChange={e => set("previousAgency", e.target.value)} style={inputStyle} placeholder="If applicable" /></div>
              <div><label style={labelStyle}>NPN Number</label><input value={form.npn} onChange={e => set("npn", e.target.value)} style={inputStyle} placeholder="National Producer Number" /></div>
              <div><label style={labelStyle}>Are you currently licensed?</label>
                <div className="flex gap-4 mt-2">{["yes", "no"].map(v => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer"><input type="radio" name="licensed" value={v} checked={form.isLicensed === v} onChange={() => set("isLicensed", v)} /><span style={{ color: "var(--gc-text-primary)", textTransform: "capitalize" as const }}>{v}</span></label>
                ))}</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Licensing */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-6)" }}>Licensing Details</h2>
            {form.isLicensed === "yes" ? (
              <div><p style={{ color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-4)" }}>Select the states where you hold an active life insurance license.</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">{US_STATES.map(s => <button key={s} onClick={() => set("licensedStates", ((form.licensedStates as string[]) || []).includes(s) ? ((form.licensedStates as string[]) || []).filter((x: string) => x !== s) : [...((form.licensedStates as string[]) || []), s])} style={{ padding: "var(--gc-space-2)", borderRadius: "var(--gc-radius-sm)", border: "1px solid", borderColor: ((form.licensedStates as string[]) || []).includes(s) ? "var(--gc-gold)" : "var(--gc-border)", backgroundColor: ((form.licensedStates as string[]) || []).includes(s) ? `color-mix(in srgb, var(--gc-gold) 15%, transparent)` : "var(--gc-surface)", color: ((form.licensedStates as string[]) || []).includes(s) ? "var(--gc-gold)" : "var(--gc-text-secondary)", fontSize: "var(--gc-text-base)", fontWeight: 500, cursor: "pointer" }}>{s}</button>)}</div>
              </div>
            ) : (
              <p style={{ color: "var(--gc-text-secondary)", padding: "var(--gc-space-8)", textAlign: "center" }}>No licensing information needed at this time. You can proceed to the next step.</p>
            )}
          </div>
        )}

        {/* Step 4: Carriers */}
        {step === 4 && (
          <div>
            <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-6)" }}>Carrier Selections</h2>
            <p style={{ color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-4)" }}>Select the carriers you'd like to be appointed with. ({(form.carriers as string[]).length} selected)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{CARRIERS.map(c => (
              <button key={c} onClick={() => set("carriers", (form.carriers as string[]).includes(c) ? (form.carriers as string[]).filter(x => x !== c) : [...(form.carriers as string[]), c])} style={{ padding: "var(--gc-space-3)", borderRadius: "var(--gc-radius-md)", border: "1px solid", borderColor: (form.carriers as string[]).includes(c) ? "var(--gc-gold)" : "var(--gc-border)", backgroundColor: (form.carriers as string[]).includes(c) ? `color-mix(in srgb, var(--gc-gold) 15%, transparent)` : "var(--gc-surface)", color: (form.carriers as string[]).includes(c) ? "var(--gc-gold)" : "var(--gc-text-secondary)", textAlign: "left", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", transition: "border-color var(--gc-transition-fast)" }}>{c}</button>
            ))}</div>
          </div>
        )}

        {/* Step 5: Documents */}
        {step === 5 && (
          <div>
            <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-6)" }}>Document Uploads</h2>
            {["E&O Certificate (PDF)", "W-9 Form (PDF)", "Government ID (optional)"].map(doc => (
              <div key={doc} style={{ padding: "var(--gc-space-6)", backgroundColor: "var(--gc-surface-2)", border: "2px dashed var(--gc-border)", borderRadius: "var(--gc-radius-md)", textAlign: "center", marginBottom: "var(--gc-space-4)", cursor: "pointer" }}>
                <p style={{ color: "var(--gc-text-secondary)", fontSize: "var(--gc-text-base)" }}>Drag & drop or click to upload</p>
                <p style={{ color: "var(--gc-text-muted)", fontSize: "var(--gc-text-sm)", marginTop: "var(--gc-space-1)" }}>{doc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Step 6: Review */}
        {step === 6 && (
          <div>
            <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-6)" }}>Review & Submit</h2>
            <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" }}>
              <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-3)" }}>Personal</div>
              <p style={{ color: "var(--gc-text-primary)" }}>{form.firstName} {form.lastName} — {form.email}</p>
              <p style={{ color: "var(--gc-text-secondary)", fontSize: "var(--gc-text-sm)" }}>{form.street}, {form.city}, {form.state} {form.zip}</p>
            </div>
            <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" }}>
              <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-3)" }}>Carriers Selected</div>
              <p style={{ color: "var(--gc-text-primary)" }}>{(form.carriers as string[]).length > 0 ? (form.carriers as string[]).join(", ") : "None selected"}</p>
            </div>
            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <input type="checkbox" checked={form.agreedToTerms} onChange={e => set("agreedToTerms", e.target.checked)} />
              <span style={{ color: "var(--gc-text-secondary)", fontSize: "var(--gc-text-base)" }}>I agree to the Terms of Service and Privacy Policy</span>
            </label>
            <button onClick={handleSubmit} disabled={!form.agreedToTerms || loading} className="w-full flex items-center justify-center gap-2" style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: form.agreedToTerms && !loading ? "pointer" : "not-allowed", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-lg)", fontWeight: 600, opacity: form.agreedToTerms && !loading ? 1 : 0.5 }}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Application
            </button>
          </div>
        )}

        {/* Navigation */}
        {step > 0 && step < 6 && (
          <div className="flex justify-between mt-8">
            <button onClick={prev} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)" }}>Back</button>
            <button onClick={next} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500 }}>Continue</button>
          </div>
        )}
        {step === 6 && (
          <div className="flex justify-start mt-4">
            <button onClick={prev} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)" }}>Back</button>
          </div>
        )}
      </div>
    </div>
  );
}
