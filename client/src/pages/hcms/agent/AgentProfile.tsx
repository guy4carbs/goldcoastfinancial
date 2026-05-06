import { useState, useEffect } from "react";
import { GCPageHeader } from "@/components/gc";
import { Save, Loader2, AlertTriangle } from "lucide-react";
import { csrfHeaders } from "@/lib/queryClient";

const inputStyle: React.CSSProperties = { width: "100%", padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-md)", outline: "none" };
const labelStyle: React.CSSProperties = { fontSize: "var(--gc-text-xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)", fontWeight: 500 };
const readOnlyStyle: React.CSSProperties = { ...inputStyle, backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border-subtle)", cursor: "default", color: "var(--gc-text-secondary)" };

function fmtDate(d: string | null): string {
  if (!d) return "Not provided";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "Not provided";
  return `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}/${date.getUTCFullYear()}`;
}

function fmtPhone(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return raw || "";
}

function fmtStatus(status: string): string {
  const map: Record<string, string> = { pending_review: "Pending Review", in_review: "In Review", approved: "Approved", rejected: "Rejected" };
  return map[status] || status;
}

function fmtExperience(exp: string): string {
  if (!exp) return "Not provided";
  if (exp === "0-1") return "0–1 years";
  if (exp === "2-5") return "2–5 years";
  if (exp === "5-10") return "5–10 years";
  if (exp === "10+") return "10+ years";
  return exp;
}

export default function AgentProfile() {
  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState({ phone: "", email: "", streetAddress: "", city: "", state: "", zipCode: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/agent-portal/me", { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error(r.status === 401 ? "Please log in again" : "Failed to load profile"); return r.json(); })
      .then(d => {
        if (d?.user) {
          setData(d);
          const p = d.profile || {};
          setForm({ phone: d.user.phone || "", email: d.user.email || "", streetAddress: p.streetAddress || "", city: p.city || "", state: p.state || "", zipCode: p.zipCode || "" });
        } else { setLoadError("Profile data unavailable"); }
      })
      .catch(e => setLoadError(e.message || "Network error"));
  }, []);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email format";
    if (form.phone && form.phone.replace(/\D/g, "").length !== 10) errs.phone = "Must be 10 digits";
    if (form.zipCode && !/^\d{5}(-\d{4})?$/.test(form.zipCode)) errs.zipCode = "Invalid ZIP code";
    if (form.state && !/^[A-Z]{2}$/.test(form.state.toUpperCase())) errs.state = "2-letter state code";
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true); setSaveError("");
    try {
      const resp = await fetch("/api/agent-portal/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        credentials: "include",
        body: JSON.stringify({ ...form, state: form.state.toUpperCase() }),
      });
      if (resp.ok) {
        const data = await resp.json().catch(() => ({}));
        // Sync form with what the server actually persisted (source of truth).
        if (data?.user || data?.profile) {
          setForm({
            phone: data?.user?.phone || "",
            email: data?.user?.email || "",
            streetAddress: data?.profile?.streetAddress || "",
            city: data?.profile?.city || "",
            state: data?.profile?.state || "",
            zipCode: data?.profile?.zipCode || "",
          });
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const data = await resp.json().catch(() => ({}));
        setSaveError(data.error || "Failed to save. Please try again.");
      }
    } catch { setSaveError("Network error — check your connection"); }
    setSaving(false);
  };

  const clearError = () => { setSaveError(""); setValidationErrors({}); };

  if (loadError) {
    return (
      <div style={{ padding: "var(--gc-space-8)" }}>
        <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
          <AlertTriangle className="w-5 h-5" style={{ color: "var(--gc-status-terminated)" }} />
          <div>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Unable to load profile</div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{loadError}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return <div className="flex items-center justify-center" style={{ padding: "var(--gc-space-8)" }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} /></div>;

  const { user } = data;
  const profile = data.profile || {};

  return (
    <div>
      <GCPageHeader title="My Profile" subtitle="View and update your personal information" accentUnderline />

      {/* Editable Contact Info */}
      <div data-tour-id="agent-profile-personal" style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" }}>
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>Contact Information</span>
          <button data-tour-id="agent-profile-save" onClick={handleSave} disabled={saving} className="flex items-center gap-1" style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: saved ? "color-mix(in srgb, var(--gc-status-active) 15%, transparent)" : "var(--gc-btn-primary-bg)", color: saved ? "var(--gc-status-active)" : "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: saving ? "wait" : "pointer", fontSize: "var(--gc-text-sm)", fontWeight: 500 }}>
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            {saved ? "Saved" : "Save Changes"}
          </button>
        </div>
        {saveError && <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", marginBottom: "var(--gc-space-2)", padding: "var(--gc-space-1) var(--gc-space-2)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 10%, transparent)", borderRadius: "var(--gc-radius-sm)" }}>{saveError}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Email</label>
            <input value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); clearError(); }} disabled={saving} style={inputStyle} />
            {validationErrors.email && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", marginTop: 2 }}>{validationErrors.email}</span>}
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input value={fmtPhone(form.phone)} onChange={e => { setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }); clearError(); }} disabled={saving} style={inputStyle} />
            {validationErrors.phone && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", marginTop: 2 }}>{validationErrors.phone}</span>}
          </div>
          <div data-tour-id="agent-profile-address" className="sm:col-span-2">
            <label style={labelStyle}>Street Address</label>
            <input value={form.streetAddress} onChange={e => { setForm({ ...form, streetAddress: e.target.value }); clearError(); }} disabled={saving} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>City</label>
            <input value={form.city} onChange={e => { setForm({ ...form, city: e.target.value }); clearError(); }} disabled={saving} style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label style={labelStyle}>State</label>
              <input value={form.state} onChange={e => { setForm({ ...form, state: e.target.value.toUpperCase().slice(0, 2) }); clearError(); }} disabled={saving} maxLength={2} style={inputStyle} />
              {validationErrors.state && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", marginTop: 2 }}>{validationErrors.state}</span>}
            </div>
            <div>
              <label style={labelStyle}>ZIP</label>
              <input value={form.zipCode} onChange={e => { setForm({ ...form, zipCode: e.target.value.replace(/[^\d-]/g, "").slice(0, 10) }); clearError(); }} disabled={saving} maxLength={10} style={inputStyle} />
              {validationErrors.zipCode && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", marginTop: 2 }}>{validationErrors.zipCode}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Read-Only Personal Info */}
      <div data-tour-id="agent-profile-background" style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" }}>
        <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-text-muted)", fontWeight: 600, display: "block", marginBottom: "var(--gc-space-3)" }}>Personal Details</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label style={labelStyle}>Full Name</label><input value={`${user.firstName || ""} ${user.lastName || ""}`.trim() || "Not provided"} readOnly style={readOnlyStyle} /></div>
          <div><label style={labelStyle}>Date of Birth</label><input value={fmtDate(profile.dateOfBirth)} readOnly style={readOnlyStyle} /></div>
          <div><label style={labelStyle}>NPN</label><input value={profile.npn || "Not provided"} readOnly style={readOnlyStyle} /></div>
          <div><label style={labelStyle}>Experience</label><input value={fmtExperience(profile.yearsExperience)} readOnly style={readOnlyStyle} /></div>
        </div>
      </div>

      {/* Application Status */}
      <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)" }}>
        <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-text-muted)", fontWeight: 600, display: "block", marginBottom: "var(--gc-space-3)" }}>Application Status</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label style={labelStyle}>Status</label><input value={fmtStatus(profile.approvalStatus || "pending_review")} readOnly style={readOnlyStyle} /></div>
          <div><label style={labelStyle}>Approved Date</label><input value={profile.approvedAt ? fmtDate(profile.approvedAt) : "Pending"} readOnly style={readOnlyStyle} /></div>
        </div>
      </div>
    </div>
  );
}
