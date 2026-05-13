import { useState } from "react";
import { Shield, AlertCircle, Loader2, Mail, ArrowLeft } from "lucide-react";

/**
 * /forgot-password — first step of the self-serve recovery flow.
 *
 * Posts to /api/auth/password-reset/request, which always returns 200 so
 * an attacker can't enumerate which emails are registered. On success the
 * page swaps to a "check your email" confirmation regardless of whether
 * the email actually matched a user. The branded reset email (if sent)
 * carries the one-time token that the /reset-password page consumes.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        setError(data?.error || "Couldn't send the reset email. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div data-theme="gc-dark" className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--gc-bg)", fontFamily: "var(--gc-font-body)" }}>
        <div style={{ width: "100%", maxWidth: 460, backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-8)" }}>
          <div className="flex flex-col items-center text-center">
            <div style={{ padding: "var(--gc-space-3)", backgroundColor: "color-mix(in srgb, var(--gc-gold) 14%, transparent)", borderRadius: "50%", marginBottom: "var(--gc-space-4)" }}>
              <Mail className="w-6 h-6" style={{ color: "var(--gc-gold)" }} />
            </div>
            <h1 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-3)" }}>Check your email</h1>
            <p style={{ fontSize: "var(--gc-text-md)", color: "var(--gc-text-secondary)", lineHeight: 1.55, marginBottom: "var(--gc-space-2)" }}>
              If <strong style={{ color: "var(--gc-text-primary)" }}>{email}</strong> is connected to a Gold Coast Financial account, you'll receive a reset link shortly.
            </p>
            <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)", lineHeight: 1.5, marginBottom: "var(--gc-space-6)" }}>
              The link expires in 60 minutes. Didn't get one? Check spam, or request a new link.
            </p>
            <a
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: "var(--gc-text-sm)",
                color: "var(--gc-gold)",
                textDecoration: "none",
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
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
            <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>Reset your password</h2>
            <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)", lineHeight: 1.5 }}>
              Enter the email you use to sign in. We'll send you a link to set a new password.
            </p>
          </div>
          {error && (
            <div className="flex items-center gap-2 p-3" style={{ backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 15%, transparent)", border: "1px solid var(--gc-status-terminated)", borderRadius: "var(--gc-radius-md)" }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--gc-status-terminated)" }} />
              <span style={{ fontSize: "var(--gc-text-base)", color: "var(--gc-status-terminated)" }}>{error}</span>
            </div>
          )}
          <div>
            <label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full"
              style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontSize: "var(--gc-text-md)" }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
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
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Send reset link
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
