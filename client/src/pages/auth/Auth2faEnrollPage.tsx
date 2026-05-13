import { useState } from "react";
import { useLocation } from "wouter";
import { ShieldCheck, Loader2, Fingerprint, Shield, Mail } from "lucide-react";
import { startRegistration } from "@simplewebauthn/browser";
import { csrfHeaders } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

/**
 * /auth/2fa/enroll — 2FA setup. Two options only:
 *   1. Passkey (Touch ID / Face ID / hardware key) — recommended
 *   2. Email verification code
 *
 * TOTP authenticator apps were retired in 1.0.16: simpler choice, fewer
 * support questions, and email is already verified for every account.
 */
export default function Auth2faEnrollPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [emailMode, setEmailMode] = useState<"idle" | "sending" | "code">("idle");
  const [sentToEmail, setSentToEmail] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const enrolPasskey = async () => {
    setPasskeyBusy(true);
    try {
      const beginRes = await fetch("/api/auth/webauthn/register/begin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
      });
      if (!beginRes.ok) {
        const data = await beginRes.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${beginRes.status}`);
      }
      const beginData = await beginRes.json();
      if (beginData?.alreadyEnrolled) {
        toast({ title: "Passkey already enrolled — signing you in" });
        window.location.assign("/founders");
        return;
      }
      const attestation = await startRegistration({ optionsJSON: beginData });
      const finishRes = await fetch("/api/auth/webauthn/register/finish", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        body: JSON.stringify({ attestation, nickname: "Primary device" }),
      });
      if (!finishRes.ok) {
        const data = await finishRes.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${finishRes.status}`);
      }
      toast({ title: "Passkey registered" });
      window.location.assign("/founders");
    } catch (e: any) {
      toast({ title: "Passkey registration failed", description: e?.message, variant: "destructive" });
    } finally {
      setPasskeyBusy(false);
    }
  };

  const requestEmailCode = async () => {
    setEmailMode("sending");
    try {
      const res = await fetch("/api/auth/2fa/email/enroll/begin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
      });
      if (res.status === 409) {
        toast({ title: "2FA already enabled" });
        setLocation("/founders");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setSentToEmail(data?.email || "");
      setEmailMode("code");
      if (data?.rateLimited) {
        toast({
          title: "Code already sent",
          description: "Check your email — we just sent one. Wait a moment before requesting another.",
        });
      }
    } catch (e: any) {
      toast({ title: "Couldn't send code", description: e?.message, variant: "destructive" });
      setEmailMode("idle");
    }
  };

  const verifyEmailCode = async () => {
    if (code.length !== 6) return;
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/2fa/email/enroll/verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      toast({ title: "Email verification enabled" });
      window.location.assign("/founders");
    } catch (e: any) {
      toast({ title: "Verification failed", description: e?.message, variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div
      data-theme="gc-dark"
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: "var(--gc-bg)",
        fontFamily: "var(--gc-font-body)",
        padding: "var(--gc-space-6) var(--gc-space-4)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 540,
          backgroundColor: "var(--gc-surface)",
          border: "1px solid var(--gc-border)",
          borderRadius: "var(--gc-radius-md)",
          overflow: "hidden",
          boxShadow: "var(--gc-shadow-lg)",
        }}
      >
        <div
          style={{
            padding: "var(--gc-space-8) var(--gc-space-6) var(--gc-space-5)",
            background: "linear-gradient(180deg, var(--gc-surface-2) 0%, var(--gc-surface) 100%)",
            borderBottom: "1px solid var(--gc-border)",
            textAlign: "center",
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div
              style={{
                padding: "var(--gc-space-2)",
                backgroundColor: "var(--gc-gold)",
                borderRadius: "var(--gc-radius-md)",
              }}
            >
              <Shield className="w-5 h-5" style={{ color: "var(--gc-btn-primary-text)" }} />
            </div>
            <span
              style={{
                fontFamily: "var(--gc-font-display)",
                fontSize: "var(--gc-text-xl)",
                fontWeight: 600,
                color: "var(--gc-text-primary)",
                letterSpacing: "var(--gc-tracking-wide)",
              }}
            >
              GOLD COAST FINANCIAL
            </span>
          </div>
          <div
            className="h-[2px] mx-auto mb-5"
            style={{ width: 64, background: "linear-gradient(90deg, var(--gc-gold), var(--gc-gold-bright))" }}
          />
          <h1
            style={{
              fontFamily: "var(--gc-font-display)",
              fontSize: "var(--gc-text-3xl)",
              fontWeight: 600,
              color: "var(--gc-text-primary)",
              lineHeight: 1.15,
              letterSpacing: "var(--gc-tracking-tight)",
              margin: 0,
              marginBottom: "var(--gc-space-2)",
            }}
          >
            Secure your account
          </h1>
          <p
            style={{
              fontFamily: "var(--gc-font-display)",
              fontStyle: "italic",
              fontSize: "var(--gc-text-md)",
              color: "var(--gc-text-secondary)",
              lineHeight: 1.55,
              margin: 0,
              maxWidth: 420,
              marginInline: "auto",
            }}
          >
            Two-factor authentication is required for founders, owners, and system admins. Pick the method that fits.
          </p>
        </div>

        <div style={{ padding: "var(--gc-space-6)" }}>
          {/* PRIMARY: Passkey */}
          <button
            onClick={enrolPasskey}
            disabled={passkeyBusy}
            className="w-full flex items-center gap-3"
            style={{
              padding: "var(--gc-space-4) var(--gc-space-5)",
              background: "linear-gradient(135deg, var(--gc-gold) 0%, var(--gc-gold-bright) 100%)",
              color: "var(--gc-btn-primary-text)",
              border: "none",
              borderRadius: "var(--gc-radius-md)",
              cursor: passkeyBusy ? "wait" : "pointer",
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-md)",
              fontWeight: 600,
              letterSpacing: "var(--gc-tracking-wide)",
              opacity: passkeyBusy ? 0.7 : 1,
              textAlign: "left",
              boxShadow: "var(--gc-shadow-sm)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--gc-radius-sm)",
                background: "rgba(45, 10, 18, 0.20)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {passkeyBusy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Fingerprint className="w-5 h-5" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "var(--gc-text-md)", fontWeight: 600 }}>
                {passkeyBusy ? "Registering passkey…" : "Use a passkey"}
              </div>
              <div
                style={{
                  fontSize: "var(--gc-text-xs)",
                  fontWeight: 400,
                  letterSpacing: "var(--gc-tracking-wide)",
                  opacity: 0.85,
                  marginTop: 2,
                }}
              >
                Touch ID · Face ID · Hardware key — recommended
              </div>
            </div>
          </button>

          {/* DIVIDER */}
          <div className="flex items-center gap-3" style={{ margin: "var(--gc-space-5) 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--gc-border)" }} />
            <span
              style={{
                fontSize: "var(--gc-text-xs)",
                letterSpacing: "var(--gc-tracking-wider)",
                textTransform: "uppercase",
                color: "var(--gc-text-muted)",
                fontWeight: 500,
              }}
            >
              or
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--gc-border)" }} />
          </div>

          {/* SECONDARY: Email verification */}
          {emailMode === "idle" && (
            <button
              onClick={requestEmailCode}
              className="w-full flex items-center gap-3"
              style={{
                padding: "var(--gc-space-4) var(--gc-space-5)",
                background: "transparent",
                color: "var(--gc-text-primary)",
                border: "1px solid var(--gc-border)",
                borderRadius: "var(--gc-radius-md)",
                cursor: "pointer",
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-md)",
                fontWeight: 500,
                letterSpacing: "var(--gc-tracking-wide)",
                textAlign: "left",
                transition: "border-color var(--gc-transition-fast)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--gc-gold)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--gc-border)";
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--gc-radius-sm)",
                  background: "var(--gc-surface-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Mail className="w-5 h-5" style={{ color: "var(--gc-gold)" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "var(--gc-text-md)", fontWeight: 600 }}>Use email verification</div>
                <div
                  style={{
                    fontSize: "var(--gc-text-xs)",
                    fontWeight: 400,
                    letterSpacing: "var(--gc-tracking-wide)",
                    color: "var(--gc-text-muted)",
                    marginTop: 2,
                  }}
                >
                  We'll email a 6-digit code each time you sign in
                </div>
              </div>
            </button>
          )}

          {emailMode === "sending" && (
            <div
              className="flex items-center justify-center"
              style={{
                padding: "var(--gc-space-5)",
                background: "var(--gc-surface-2)",
                border: "1px solid var(--gc-border)",
                borderRadius: "var(--gc-radius-md)",
                color: "var(--gc-text-secondary)",
                fontSize: "var(--gc-text-sm)",
              }}
            >
              <Loader2 className="w-5 h-5 animate-spin mr-2" style={{ color: "var(--gc-gold)" }} />
              Sending code...
            </div>
          )}

          {emailMode === "code" && (
            <div
              style={{
                padding: "var(--gc-space-5)",
                background: "var(--gc-surface-2)",
                border: "1px solid var(--gc-border)",
                borderRadius: "var(--gc-radius-md)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
                <div
                  style={{
                    fontSize: "var(--gc-text-xs)",
                    letterSpacing: "var(--gc-tracking-wider)",
                    textTransform: "uppercase",
                    color: "var(--gc-gold)",
                    fontWeight: 600,
                  }}
                >
                  Check your email
                </div>
              </div>
              <p
                style={{
                  fontSize: "var(--gc-text-sm)",
                  color: "var(--gc-text-secondary)",
                  margin: 0,
                  marginBottom: "var(--gc-space-4)",
                  lineHeight: 1.5,
                }}
              >
                We sent a 6-digit code to{" "}
                <strong style={{ color: "var(--gc-text-primary)" }}>{sentToEmail || "your email"}</strong>. Enter it below to enable 2FA.
              </p>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •"
                autoFocus
                style={{
                  width: "100%",
                  padding: "var(--gc-space-4)",
                  background: "var(--gc-surface)",
                  border: "1px solid var(--gc-border)",
                  borderRadius: "var(--gc-radius-sm)",
                  fontFamily: "monospace",
                  fontSize: "var(--gc-text-2xl)",
                  letterSpacing: "0.5em",
                  textAlign: "center",
                  color: "var(--gc-text-primary)",
                  marginBottom: "var(--gc-space-4)",
                  outline: "none",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "var(--gc-gold)";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "var(--gc-border)";
                }}
              />
              <button
                onClick={verifyEmailCode}
                disabled={verifying || code.length !== 6}
                className="w-full flex items-center justify-center gap-2"
                style={{
                  padding: "var(--gc-space-3) var(--gc-space-4)",
                  backgroundColor: "var(--gc-btn-primary-bg)",
                  color: "var(--gc-btn-primary-text)",
                  borderRadius: "var(--gc-radius-sm)",
                  border: "none",
                  cursor: verifying || code.length !== 6 ? "not-allowed" : "pointer",
                  fontFamily: "var(--gc-font-body)",
                  fontSize: "var(--gc-text-base)",
                  fontWeight: 600,
                  letterSpacing: "var(--gc-tracking-wide)",
                  opacity: verifying || code.length !== 6 ? 0.5 : 1,
                }}
              >
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {verifying ? "Verifying…" : "Confirm and enable 2FA"}
              </button>
              <button
                onClick={requestEmailCode}
                style={{
                  marginTop: "var(--gc-space-3)",
                  background: "transparent",
                  border: "none",
                  color: "var(--gc-text-muted)",
                  fontSize: "var(--gc-text-xs)",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "center",
                  fontFamily: "var(--gc-font-body)",
                  letterSpacing: "var(--gc-tracking-wide)",
                }}
              >
                Didn't get it? Resend code
              </button>
            </div>
          )}

          <p
            style={{
              marginTop: "var(--gc-space-5)",
              fontSize: "var(--gc-text-xs)",
              color: "var(--gc-text-muted)",
              textAlign: "center",
              lineHeight: 1.5,
              letterSpacing: "var(--gc-tracking-wide)",
            }}
          >
            Required by the GCF Information Security Program · GLBA 16 CFR § 314.4
          </p>
        </div>
      </div>
    </div>
  );
}
