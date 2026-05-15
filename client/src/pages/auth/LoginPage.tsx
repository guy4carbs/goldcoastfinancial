import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Shield, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, register: registerFn, isLoggingIn, isRegistering } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "", confirmPassword: "", role: "sales_agent" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await login({ email: form.email, password: form.password });
      // 2FA gate takes precedence over role-based home routing.
      if (result.requires_2fa_enrollment) {
        setLocation("/auth/2fa/enroll");
        return;
      }
      if (result.requires_2fa_verification) {
        setLocation("/auth/2fa");
        return;
      }
      // Role-based landing page. sales_agent goes to the agent self-service
      // dashboard, NOT the admin /hcms (admin view) — they only see their own
      // profile/docs/licenses. Admin tier roles (founder/owner/system_admin)
      // and management (director/agency_manager/manager) land on the admin
      // HCMS directory which is the right view for them.
      const role = result.user?.role || "client";
      if (role === "sales_agent") setLocation("/hcms/my/dashboard");
      else if (role === "founder") setLocation("/hcms");
      else if (role === "owner" || role === "system_admin") setLocation("/ops");
      else if (role === "director" || role === "agency_manager" || role === "manager") setLocation("/hcms");
      else setLocation("/");
    } catch (e: any) { setError(e.message || "Login failed"); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    try {
      await registerFn({ email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName });
      setLocation("/hcms");
    } catch (e: any) { setError(e.message || "Registration failed"); }
  };

  const loading = isLoggingIn || isRegistering;

  return (
    <div data-theme="gc-dark" className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--gc-bg)", fontFamily: "var(--gc-font-body)" }}>
      <div style={{ width: "100%", maxWidth: 420, backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
        {/* Header */}
        <div className="flex flex-col items-center gap-3 p-8 pb-4">
          <div className="flex items-center gap-3">
            <div style={{ padding: "var(--gc-space-2)", backgroundColor: "var(--gc-gold)", borderRadius: "var(--gc-radius-md)" }}><Shield className="w-5 h-5" style={{ color: "var(--gc-btn-primary-text)" }} /></div>
            <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", fontWeight: 600, color: "var(--gc-text-primary)" }}>GOLD COAST FINANCIAL</span>
          </div>
          <div className="h-[2px] w-16" style={{ background: "linear-gradient(90deg, var(--gc-gold), var(--gc-gold-bright))" }} />
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: "var(--gc-border)" }}>
          {(["login", "register"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }} className="flex-1 py-3" style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 600 : 400, color: tab === t ? "var(--gc-gold)" : "var(--gc-text-muted)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer", textTransform: "uppercase" as const, letterSpacing: "var(--gc-tracking-wider)" }}>
              {t === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={tab === "login" ? handleLogin : handleRegister} className="p-8 flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 p-3" style={{ backgroundColor: `color-mix(in srgb, var(--gc-status-terminated) 15%, transparent)`, border: "1px solid var(--gc-status-terminated)", borderRadius: "var(--gc-radius-md)" }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--gc-status-terminated)" }} />
              <span style={{ fontSize: "var(--gc-text-base)", color: "var(--gc-status-terminated)" }}>{error}</span>
            </div>
          )}

          {tab === "register" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>First Name</label>
                <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required className="w-full" style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontSize: "var(--gc-text-md)" }} />
              </div>
              <div>
                <label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>Last Name</label>
                <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required className="w-full" style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontSize: "var(--gc-text-md)" }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required className="w-full" style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontSize: "var(--gc-text-md)" }} />
          </div>

          <div>
            <div className="flex items-baseline justify-between" style={{ marginBottom: "var(--gc-space-1)" }}>
              <label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)" }}>Password</label>
              {tab === "login" && (
                <a
                  href="/forgot-password"
                  style={{
                    fontSize: "var(--gc-text-xs)",
                    color: "var(--gc-gold)",
                    textDecoration: "none",
                    letterSpacing: "var(--gc-tracking-wide)",
                  }}
                >
                  Forgot password?
                </a>
              )}
            </div>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required className="w-full" style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontSize: "var(--gc-text-md)" }} />
          </div>

          {tab === "register" && (
            <div>
              <label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required className="w-full" style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontSize: "var(--gc-text-md)" }} />
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2" style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: loading ? "wait" : "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 600, letterSpacing: "var(--gc-tracking-wide)", opacity: loading ? 0.7 : 1, transition: "opacity var(--gc-transition-fast)" }}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {tab === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
