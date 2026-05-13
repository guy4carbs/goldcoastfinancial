import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Shield, AlertCircle, Loader2, CheckCircle, ArrowLeft } from "lucide-react";

/**
 * /reset-password?token=<raw-token> — second step of the recovery flow.
 *
 * Reads the raw token from the URL, takes a new password + confirm, posts to
 * /api/auth/password-reset/confirm. On success, swaps to a confirmation
 * view that auto-redirects to /login after a brief pause.
 */
export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Pull token from the URL on mount. Use URLSearchParams so we don't drag in
  // a parser dependency just for this.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token") || "";
    setToken(t);
    if (!t) setError("Missing reset token. Use the link from your email.");
  }, []);

  // Auto-redirect to login 3s after a successful reset so the user doesn't
  // have to find the link themselves.
  useEffect(() => {
    if (!success) return;
    const id = window.setTimeout(() => setLocation("/login"), 3000);
    return () => window.clearTimeout(id);
  }, [success, setLocation]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, password }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        setError(data?.error || "Couldn't reset your password.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div data-theme="gc-dark" className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--gc-bg)", fontFamily: "var(--gc-font-body)" }}>
        <div style={{ width: "100%", maxWidth: 460, backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-8)" }}>
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="w-12 h-12" style={{ color: "var(--gc-status-active)", marginBottom: "var(--gc-space-4)" }} />
            <h1 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-3)" }}>Password updated</h1>
            <p style={{ fontSize: "var(--gc-text-md)", color: "var(--gc-text-secondary)", lineHeight: 1.55, marginBottom: "var(--gc-space-6)" }}>
              You can now sign in with your new password. Redirecting you in a moment...
            </p>
            <a
              href="/login"
              style={{
                display: "inline-block",
                padding: "var(--gc-space-2) var(--gc-space-6)",
                backgroundColor: "var(--gc-btn-primary-bg)",
                color: "var(--gc-btn-primary-text)",
                borderRadius: "var(--gc-radius-sm)",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "var(--gc-text-base)",
              }}
            >
              Go to Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-theme="gc-dark" className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--gc-bg)", fontFamily: "var(--gc-font-body)" }}>
      <div style={{ width: "100%", maxWidth: 420, backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
        <div className="flex flex-col items-center gap-3 p-8 pb-4">
          <div className="flex items-center gap-3">
            <div style={{ padding: "var(--gc-space-2)", backgroundColor: "var(--gc-gold)", borderRadius: "var(--gc-radius-md)" }}>
              <Shield className="w-5 h-5" style={{ color: "var(--gc-btn-primary-text)" }} />
            </div>
            <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", fontWeight: 600, color: "var(--gc-text-primary)" }}>GOLD COAST FINANCIAL</span>
          </div>
          <div className="h-[2px] w-16" style={{ background: "linear-gradient(90deg, var(--gc-gold), var(--gc-gold-bright))" }} />
        </div>
        <form onSubmit={submit} className="p-8 flex flex-col gap-4">
          <div>
            <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>Choose a new password</h2>
            <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)", lineHeight: 1.5 }}>
              At least 8 characters. Make it something you can remember but a guesser can't.
            </p>
          </div>
          {error && (
            <div className="flex items-center gap-2 p-3" style={{ backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 15%, transparent)", border: "1px solid var(--gc-status-terminated)", borderRadius: "var(--gc-radius-md)" }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--gc-status-terminated)" }} />
              <span style={{ fontSize: "var(--gc-text-base)", color: "var(--gc-status-terminated)" }}>{error}</span>
            </div>
          )}
          <div>
            <label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              minLength={8}
              className="w-full"
              style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontSize: "var(--gc-text-md)" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full"
              style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontSize: "var(--gc-text-md)" }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full flex items-center justify-center gap-2"
            style={{
              padding: "var(--gc-space-3)",
              backgroundColor: "var(--gc-btn-primary-bg)",
              color: "var(--gc-btn-primary-text)",
              borderRadius: "var(--gc-radius-sm)",
              border: "none",
              cursor: loading ? "wait" : "pointer",
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-base)",
              fontWeight: 600,
              letterSpacing: "var(--gc-tracking-wide)",
              opacity: loading || !token ? 0.7 : 1,
            }}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Update password
          </button>
          <a
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontSize: "var(--gc-text-sm)",
              color: "var(--gc-text-muted)",
              textDecoration: "none",
              marginTop: "var(--gc-space-2)",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </a>
        </form>
      </div>
    </div>
  );
}
