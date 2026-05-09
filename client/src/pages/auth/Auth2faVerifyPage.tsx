import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  ShieldCheck,
  Loader2,
  Fingerprint,
  Shield,
  Mail,
  MessageSquare,
} from "lucide-react";
import { startAuthentication } from "@simplewebauthn/browser";
import { csrfHeaders } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Auth2faVerifyPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [passkeyAvailable, setPasskeyAvailable] = useState<boolean | null>(null);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [requestingEmail, setRequestingEmail] = useState(false);
  const autoTriggered = useRef(false);

  const verifyPasskey = async () => {
    setPasskeyBusy(true);
    try {
      const beginRes = await fetch("/api/auth/webauthn/auth/begin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
      });
      if (!beginRes.ok) {
        const data = await beginRes.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${beginRes.status}`);
      }
      const options = await beginRes.json();
      const assertion = await startAuthentication({ optionsJSON: options });
      const finishRes = await fetch("/api/auth/webauthn/auth/finish", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        body: JSON.stringify({ assertion }),
      });
      if (!finishRes.ok) {
        const data = await finishRes.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${finishRes.status}`);
      }
      toast({ title: "Verified with Touch ID" });
      window.location.assign("/founders");
    } catch (e: any) {
      toast({
        title: "Touch ID verification failed",
        description: e?.message,
        variant: "destructive",
      });
      // Wave AH5: surface the email-OTP fallback immediately on biometric
      // failure (don't wait for the 4.5s timeout).
      setShowFallback(true);
    } finally {
      setPasskeyBusy(false);
    }
  };

  // Probe for enrolled passkey + auto-trigger Touch ID prompt.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/webauthn/credentials", { credentials: "include" });
        if (res.ok) {
          const list = (await res.json()) as { id: string }[];
          const has = Array.isArray(list) && list.length > 0;
          setPasskeyAvailable(has);
          if (has && !autoTriggered.current) {
            autoTriggered.current = true;
            setTimeout(() => verifyPasskey(), 250);
          }
          // Wave AI: always show the email-OTP fallback inline (no popup).
          // Touch ID button is on top; the email card sits below it so the
          // user always has both options visible.
          setShowFallback(true);
        } else {
          setPasskeyAvailable(false);
          setShowFallback(true);
        }
      } catch {
        setPasskeyAvailable(false);
        setShowFallback(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wave AH5: request a 6-digit code via Gold Coast branded email.
  const requestEmailCode = async () => {
    setRequestingEmail(true);
    try {
      const res = await fetch("/api/auth/2fa/email/request", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
      });
      const data = await res.json().catch(() => ({}));
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
      const res = await fetch("/api/auth/2fa/email/verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      toast({ title: "Verified" });
      window.location.assign("/founders");
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
      data-theme="gc-dark"
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: "var(--gc-bg)",
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
        {/* Hero */}
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
              <Shield className="w-5 h-5" style={{ color: "var(--gc-btn-primary-text)" }} aria-hidden="true" />
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
            style={{
              width: 64,
              background: "linear-gradient(90deg, var(--gc-gold), var(--gc-gold-bright))",
            }}
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
            Verify your identity
          </h1>
          <p
            style={{
              fontFamily: "var(--gc-font-display)",
              fontStyle: "italic",
              fontSize: "var(--gc-text-md)",
              color: "var(--gc-text-secondary)",
              lineHeight: 1.55,
              margin: 0,
              maxWidth: 380,
              marginInline: "auto",
            }}
          >
            Confirm with Touch ID or Face ID on this device.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "var(--gc-space-6)" }}>
          {passkeyAvailable === null && (
            <div
              className="flex items-center justify-center"
              style={{ padding: "var(--gc-space-10) 0" }}
            >
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} aria-hidden="true" />
            </div>
          )}

          {passkeyAvailable === true && (
            <button
              onClick={verifyPasskey}
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
                  background: "rgba(45, 10, 18, 0.20)",
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
          )}

          {showFallback && (
            <div
              style={{
                marginTop: passkeyAvailable ? "var(--gc-space-5)" : 0,
                padding: passkeyAvailable ? "var(--gc-space-5)" : 0,
                background: passkeyAvailable ? "var(--gc-surface-2)" : "transparent",
                border: passkeyAvailable ? "1px solid var(--gc-border)" : "none",
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
                      background: "var(--gc-surface)",
                      border: "1px solid var(--gc-border)",
                      borderRadius: "var(--gc-radius-sm)",
                      fontFamily: "monospace",
                      fontSize: "var(--gc-text-2xl)",
                      letterSpacing: "0.5em",
                      textAlign: "center",
                      color: "var(--gc-text-primary)",
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
