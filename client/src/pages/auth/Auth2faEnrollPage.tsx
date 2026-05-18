import { useState } from "react";
import { useLocation } from "wouter";
import {
  ShieldCheck,
  Loader2,
  Fingerprint,
  Mail,
  MessageSquare,
} from "lucide-react";
import { startRegistration } from "@simplewebauthn/browser";
import { useToast } from "@/hooks/use-toast";

/**
 * /auth/2fa/enroll — Heritage edition. Ported from Gold Coast 1.0.43; same
 * UX, Heritage Life Solutions branding (violet + amber palette).
 *
 * Two enrollment paths:
 *   - Touch ID / Face ID via WebAuthn (preferred)
 *   - Email code (6-digit, 5-min TTL, Heritage-branded email)
 *
 * Important: we do NOT auto-fire `navigator.credentials.create()` on mount.
 * iOS Safari 16+ requires WebAuthn to be invoked synchronously inside a
 * user gesture, so auto-triggering rejects with NotAllowedError. Both
 * methods are presented as user-clickable buttons so the gesture handler
 * wraps the API.
 */

// Heritage auth palette — light theme that matches the rest of the Heritage
// app (LobbyLayout's slate-50→white gradient, white cards with violet accents,
// violet→gold action gradient). Colors pulled from heritageDesignSystem.ts and
// the standard Heritage email family (Policy Reminder uses the same
// #7c3aed → #D4AF37 button gradient — keeps screen + inbox visually unified).
const heritageAuthVars: Record<string, string> = {
  "--gc-bg": "#f8fafc",
  "--gc-surface": "#ffffff",
  "--gc-surface-2": "#f5f3ff",
  "--gc-border": "#e9d5ff",
  "--gc-gold": "#7c3aed",
  "--gc-gold-bright": "#D4AF37",
  "--gc-btn-primary-bg": "linear-gradient(135deg, #7c3aed 0%, #D4AF37 100%)",
  "--gc-btn-primary-text": "#ffffff",
  "--gc-text-primary": "#111827",
  "--gc-text-secondary": "#374151",
  "--gc-text-muted": "#6b7280",
  "--gc-font-body": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  "--gc-font-display": "'Playfair Display', Georgia, serif",
  "--gc-shadow-sm": "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  "--gc-shadow-lg": "0 20px 50px rgba(124,58,237,0.18), 0 8px 16px rgba(124,58,237,0.08)",
  "--gc-radius-sm": "8px",
  "--gc-radius-md": "12px",
  "--gc-radius-full": "999px",
  "--gc-space-1": "4px",
  "--gc-space-2": "8px",
  "--gc-space-3": "12px",
  "--gc-space-4": "16px",
  "--gc-space-5": "20px",
  "--gc-space-6": "24px",
  "--gc-space-8": "32px",
  "--gc-text-xs": "12px",
  "--gc-text-sm": "14px",
  "--gc-text-base": "15px",
  "--gc-text-md": "16px",
  "--gc-text-xl": "20px",
  "--gc-text-2xl": "24px",
  "--gc-text-3xl": "32px",
  "--gc-tracking-tight": "-0.01em",
  "--gc-tracking-wide": "0.02em",
  "--gc-tracking-wider": "0.08em",
};

// After enrollment + verification, send the user to the lobby where the
// rest of the role-based routing takes over (Force2FAGate stops gating once
// twoFactorEnabled + twoFactorVerified are both true).
const POST_ENROLL_DESTINATION = "/crm";

export default function Auth2faEnrollPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [requestingEmail, setRequestingEmail] = useState(false);

  const enrolPasskey = async () => {
    setPasskeyBusy(true);
    try {
      const beginRes = await fetch("/api/auth/webauthn/register/begin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!beginRes.ok) {
        const data = await beginRes.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${beginRes.status}`);
      }
      const beginData = await beginRes.json();
      if (beginData?.alreadyEnrolled) {
        toast({ title: "Passkey already enrolled — signing you in" });
        window.location.assign(POST_ENROLL_DESTINATION);
        return;
      }
      const attestation = await startRegistration({ optionsJSON: beginData });
      const finishRes = await fetch("/api/auth/webauthn/register/finish", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attestation, nickname: "Primary device" }),
      });
      if (!finishRes.ok) {
        const data = await finishRes.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${finishRes.status}`);
      }
      toast({ title: "Verified with Touch ID" });
      window.location.assign(POST_ENROLL_DESTINATION);
    } catch (e: any) {
      const rawMessage = String(e?.message || "");
      const friendlyDescription = /not allowed|NotAllowedError|denied permission/i.test(rawMessage)
        ? "Your device blocked the prompt, or the request was cancelled. Tap the button to try again — or use the email code option below."
        : rawMessage || "Something went wrong. Try again, or use the email code option below.";
      toast({
        title: "Touch ID verification failed",
        description: friendlyDescription,
        variant: "destructive",
      });
    } finally {
      setPasskeyBusy(false);
    }
  };

  const requestEmailCode = async () => {
    setRequestingEmail(true);
    try {
      const res = await fetch("/api/auth/2fa/email/enroll/begin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        toast({ title: "2FA already enabled" });
        // Force a hard reload so AuthContext re-fetches the now-2FA-cleared
        // session — otherwise Force2FAGate sees stale `twoFactorVerified=false`
        // and bounces the user straight back to /auth/2fa.
        window.location.assign(POST_ENROLL_DESTINATION);
        return;
      }
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setEmailSent(true);
      setCode("");
      if (data?.rateLimited) {
        toast({
          title: "Hold on — try again shortly",
          description: "You can request a new code in a moment.",
        });
      } else {
        toast({
          title: "Code sent",
          description: "Check your email for a 6-digit code (5-min expiry).",
        });
      }
    } catch (e: any) {
      toast({
        title: "Couldn't send code",
        description: e?.message,
        variant: "destructive",
      });
    } finally {
      setRequestingEmail(false);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/2fa/email/enroll/verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      toast({ title: "Verified" });
      window.location.assign(POST_ENROLL_DESTINATION);
    } catch (e: any) {
      toast({
        title: "Verification failed",
        description: e?.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      data-theme="heritage-auth"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-gray-50/50"
      style={{
        ...heritageAuthVars,
        fontFamily: "var(--gc-font-body)",
        padding: "var(--gc-space-6) var(--gc-space-4)",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          backgroundColor: "var(--gc-surface)",
          border: "1px solid var(--gc-border)",
          borderRadius: "var(--gc-radius-md)",
          overflow: "hidden",
          boxShadow: "var(--gc-shadow-lg)",
        }}
      >
        {/* Hero — Heritage signature gradient (violet → purple → amber)
            matching COLORS.gradients.heroWithAccent so the auth screen reads
            as part of the same brand surface as the lobby + What's New modal. */}
        <div
          style={{
            position: "relative",
            padding: "var(--gc-space-8) var(--gc-space-6) var(--gc-space-5)",
            background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #f59e0b 100%)",
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -60,
              right: -50,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.16)",
              filter: "blur(40px)",
              pointerEvents: "none",
            }}
          />
          <div className="flex items-center justify-center mb-3" style={{ position: "relative" }}>
            <img
              src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b"
              alt="Heritage Life Solutions"
              style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                display: "block",
              }}
            />
          </div>
          <div
            style={{
              fontFamily: "var(--gc-font-display)",
              fontSize: "var(--gc-text-md)",
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: "var(--gc-tracking-wider)",
              position: "relative",
              marginBottom: "var(--gc-space-3)",
            }}
          >
            HERITAGE LIFE SOLUTIONS
          </div>
          <div
            className="h-[2px] mx-auto mb-5"
            style={{
              width: 56,
              background: "rgba(255,255,255,0.45)",
              position: "relative",
            }}
          />
          <h1
            style={{
              fontFamily: "var(--gc-font-display)",
              fontSize: "var(--gc-text-3xl)",
              fontWeight: 600,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "var(--gc-tracking-tight)",
              margin: 0,
              marginBottom: "var(--gc-space-2)",
              position: "relative",
            }}
          >
            Verify your identity
          </h1>
          <p
            style={{
              fontFamily: "var(--gc-font-display)",
              fontStyle: "italic",
              fontSize: "var(--gc-text-md)",
              color: "rgba(255,255,255,0.88)",
              lineHeight: 1.55,
              margin: 0,
              maxWidth: 380,
              marginInline: "auto",
              position: "relative",
            }}
          >
            Confirm with Touch ID or Face ID on this device.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "var(--gc-space-6)" }}>
          <button
            onClick={enrolPasskey}
            disabled={passkeyBusy}
            className="w-full flex items-center gap-3"
            style={{
              padding: "var(--gc-space-4) var(--gc-space-5)",
              background:
                "linear-gradient(135deg, var(--gc-gold) 0%, var(--gc-gold-bright) 100%)",
              color: "var(--gc-btn-primary-text)",
              border: "none",
              borderRadius: "var(--gc-radius-md)",
              cursor: passkeyBusy ? "wait" : "pointer",
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-md)",
              fontWeight: 600,
              letterSpacing: "var(--gc-tracking-wide)",
              opacity: passkeyBusy ? 0.85 : 1,
              textAlign: "left",
              boxShadow: "var(--gc-shadow-sm)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--gc-radius-sm)",
                background: "rgba(255,255,255,0.22)",
                border: "1px solid rgba(255,255,255,0.28)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {passkeyBusy ? (
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              ) : (
                <Fingerprint className="w-5 h-5" aria-hidden="true" />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "var(--gc-text-md)", fontWeight: 600 }}>
                {passkeyBusy ? "Awaiting Touch ID…" : "Authenticate with Touch ID"}
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
                Touch ID · Face ID
              </div>
            </div>
          </button>

          <div
            style={{
              marginTop: "var(--gc-space-5)",
              padding: "var(--gc-space-5)",
              background: "var(--gc-surface-2)",
              border: "1px solid var(--gc-border)",
              borderRadius: "var(--gc-radius-md)",
            }}
          >
            <div
              style={{
                fontSize: "var(--gc-text-xs)",
                letterSpacing: "var(--gc-tracking-wider)",
                textTransform: "uppercase",
                color: "var(--gc-gold)",
                fontWeight: 600,
                marginBottom: "var(--gc-space-2)",
              }}
            >
              Verification Code
            </div>
            {!emailSent ? (
              <>
                <p
                  style={{
                    fontSize: "var(--gc-text-sm)",
                    color: "var(--gc-text-secondary)",
                    margin: 0,
                    marginBottom: "var(--gc-space-3)",
                    lineHeight: 1.5,
                  }}
                >
                  We'll email you a 6-digit code that's good for 5 minutes.
                </p>
                <div className="flex flex-col gap-2 mb-3">
                  <button
                    onClick={requestEmailCode}
                    disabled={requestingEmail}
                    className="w-full flex items-center justify-center gap-2"
                    style={{
                      padding: "var(--gc-space-3) var(--gc-space-4)",
                      backgroundColor: "var(--gc-btn-primary-bg)",
                      color: "var(--gc-btn-primary-text)",
                      borderRadius: "var(--gc-radius-sm)",
                      border: "none",
                      cursor: requestingEmail ? "wait" : "pointer",
                      fontFamily: "var(--gc-font-body)",
                      fontSize: "var(--gc-text-base)",
                      fontWeight: 600,
                      letterSpacing: "var(--gc-tracking-wide)",
                      opacity: requestingEmail ? 0.7 : 1,
                    }}
                  >
                    {requestingEmail ? (
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Mail className="w-4 h-4" aria-hidden="true" />
                    )}
                    {requestingEmail ? "Sending…" : "Send code to my email"}
                  </button>
                  <button
                    disabled
                    aria-label="SMS verification — coming soon"
                    className="w-full flex items-center justify-center gap-2"
                    style={{
                      padding: "var(--gc-space-3) var(--gc-space-4)",
                      backgroundColor: "transparent",
                      color: "var(--gc-text-muted)",
                      borderRadius: "var(--gc-radius-sm)",
                      border: "1px dashed var(--gc-border)",
                      cursor: "not-allowed",
                      fontFamily: "var(--gc-font-body)",
                      fontSize: "var(--gc-text-sm)",
                      fontWeight: 500,
                      letterSpacing: "var(--gc-tracking-wide)",
                    }}
                    title="SMS verification — coming soon"
                  >
                    <MessageSquare className="w-4 h-4" aria-hidden="true" />
                    Send via SMS
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: "10px",
                        padding: "1px 6px",
                        borderRadius: "var(--gc-radius-full)",
                        border: "1px solid var(--gc-border)",
                        color: "var(--gc-text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "var(--gc-tracking-wider)",
                      }}
                    >
                      Coming soon
                    </span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <p
                  style={{
                    fontSize: "var(--gc-text-sm)",
                    color: "var(--gc-text-secondary)",
                    margin: 0,
                    marginBottom: "var(--gc-space-3)",
                    lineHeight: 1.5,
                  }}
                >
                  Enter the 6-digit code we just emailed you. Codes expire in 5 minutes.
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="• • • • • •"
                  style={{
                    width: "100%",
                    padding: "var(--gc-space-4)",
                    background: "#ffffff",
                    border: "2px solid var(--gc-gold)",
                    borderRadius: "var(--gc-radius-sm)",
                    fontFamily: "monospace",
                    fontSize: "var(--gc-text-2xl)",
                    fontWeight: 700,
                    letterSpacing: "0.5em",
                    textAlign: "center",
                    color: "#5b21b6",
                    marginBottom: "var(--gc-space-3)",
                    outline: "none",
                  }}
                />
                <button
                  onClick={submit}
                  disabled={submitting || !code}
                  className="w-full flex items-center justify-center gap-2"
                  style={{
                    padding: "var(--gc-space-3) var(--gc-space-4)",
                    backgroundColor: "var(--gc-btn-primary-bg)",
                    color: "var(--gc-btn-primary-text)",
                    borderRadius: "var(--gc-radius-sm)",
                    border: "none",
                    cursor: submitting || !code ? "not-allowed" : "pointer",
                    fontFamily: "var(--gc-font-body)",
                    fontSize: "var(--gc-text-base)",
                    fontWeight: 600,
                    letterSpacing: "var(--gc-tracking-wide)",
                    opacity: submitting || !code ? 0.5 : 1,
                  }}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  )}
                  {submitting ? "Verifying…" : "Verify"}
                </button>
                <button
                  onClick={requestEmailCode}
                  disabled={requestingEmail}
                  className="flex items-center gap-2 mx-auto"
                  style={{
                    marginTop: "var(--gc-space-3)",
                    background: "none",
                    border: "none",
                    color: "var(--gc-text-muted)",
                    fontSize: "var(--gc-text-xs)",
                    cursor: requestingEmail ? "wait" : "pointer",
                    letterSpacing: "var(--gc-tracking-wide)",
                  }}
                >
                  {requestingEmail ? "Sending…" : "Send a new code"}
                </button>
              </>
            )}
          </div>

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
            Required by the Heritage Information Security Program · GLBA 16 CFR § 314.4
          </p>
        </div>
      </div>
    </div>
  );
}
