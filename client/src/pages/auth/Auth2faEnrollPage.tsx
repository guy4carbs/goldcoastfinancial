import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ShieldCheck, Copy, Check, Loader2, Fingerprint, Shield } from "lucide-react";
import { startRegistration } from "@simplewebauthn/browser";
import { csrfHeaders } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Begin {
  secret: string;
  otpauthUrl: string;
  qrDataUrl: string;
  recoveryCodes: string[];
}

export default function Auth2faEnrollPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [begin, setBegin] = useState<Begin | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAuthenticator, setShowAuthenticator] = useState(false);

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
      // Self-heal: server detected an existing passkey on this account and
      // already flipped the 2FA flag — skip the OS prompt entirely.
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
      // Hard reload so all queries refetch under the now-2FA-enabled session.
      window.location.assign("/founders");
    } catch (e: any) {
      toast({
        title: "Passkey registration failed",
        description: e?.message,
        variant: "destructive",
      });
    } finally {
      setPasskeyBusy(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/2fa/enroll/begin", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        });
        if (res.status === 409) {
          toast({ title: "2FA already enabled" });
          setLocation("/founders");
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Begin;
        setBegin(data);
      } catch (e: any) {
        toast({
          title: "Couldn't start 2FA enrolment",
          description: e?.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [setLocation, toast]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/2fa/enroll/verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      toast({ title: "2FA enabled" });
      setLocation("/founders");
    } catch (e: any) {
      toast({
        title: "Verification failed",
        description: e?.message || "Try again",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyAll = () => {
    if (!begin) return;
    navigator.clipboard.writeText(begin.recoveryCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
        {/* Hero */}
        <div
          style={{
            padding: "var(--gc-space-8) var(--gc-space-6) var(--gc-space-5)",
            background: "linear-gradient(180deg, var(--gc-surface-2) 0%, var(--gc-surface) 100%)",
            borderBottom: "1px solid var(--gc-border)",
            textAlign: "center",
            position: "relative",
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
            Two-factor authentication is required for founders, owners, and
            system admins. Pick the method that fits.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "var(--gc-space-6)" }}>
          {loading && (
            <div className="flex items-center justify-center" style={{ padding: "var(--gc-space-10) 0" }}>
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} />
            </div>
          )}

          {!loading && begin && (
            <>
              {/* PRIMARY: Passkey */}
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
                  opacity: passkeyBusy ? 0.7 : 1,
                  textAlign: "left",
                  boxShadow: "var(--gc-shadow-sm)",
                  transition: "transform var(--gc-transition-fast), box-shadow var(--gc-transition-fast)",
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
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Fingerprint className="w-5 h-5" />
                  )}
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
              <div
                className="flex items-center gap-3"
                style={{ margin: "var(--gc-space-5) 0" }}
              >
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

              {/* SECONDARY: Authenticator app — collapsed by default */}
              {!showAuthenticator ? (
                <button
                  onClick={() => setShowAuthenticator(true)}
                  className="w-full"
                  style={{
                    padding: "var(--gc-space-3) var(--gc-space-4)",
                    background: "transparent",
                    color: "var(--gc-text-secondary)",
                    border: "1px solid var(--gc-border)",
                    borderRadius: "var(--gc-radius-sm)",
                    cursor: "pointer",
                    fontFamily: "var(--gc-font-body)",
                    fontSize: "var(--gc-text-base)",
                    fontWeight: 500,
                    letterSpacing: "var(--gc-tracking-wide)",
                    transition: "border-color var(--gc-transition-fast), color var(--gc-transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--gc-gold)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--gc-text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--gc-border)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--gc-text-secondary)";
                  }}
                >
                  Use an authenticator app instead
                </button>
              ) : (
                <div
                  style={{
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
                    Step 1 — Scan with your app
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
                    Open 1Password, Authy, or Google Authenticator and scan the
                    QR code below.
                  </p>

                  <div
                    className="flex items-center justify-center"
                    style={{ marginBottom: "var(--gc-space-4)" }}
                  >
                    <div
                      style={{
                        padding: 12,
                        background: "white",
                        borderRadius: "var(--gc-radius-sm)",
                        border: "1px solid var(--gc-border)",
                      }}
                    >
                      <img src={begin.qrDataUrl} alt="2FA QR" width={180} height={180} />
                    </div>
                  </div>

                  <details style={{ marginBottom: "var(--gc-space-5)" }}>
                    <summary
                      style={{
                        fontSize: "var(--gc-text-xs)",
                        letterSpacing: "var(--gc-tracking-wide)",
                        color: "var(--gc-text-muted)",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      Can't scan? Show secret key
                    </summary>
                    <div
                      style={{
                        marginTop: "var(--gc-space-2)",
                        padding: "var(--gc-space-2) var(--gc-space-3)",
                        background: "var(--gc-surface)",
                        border: "1px solid var(--gc-border)",
                        borderRadius: "var(--gc-radius-sm)",
                        fontFamily: "monospace",
                        fontSize: "var(--gc-text-xs)",
                        color: "var(--gc-text-secondary)",
                        wordBreak: "break-all",
                        textAlign: "center",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {begin.secret}
                    </div>
                  </details>

                  {/* Step 2 — Recovery codes */}
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
                    Step 2 — Save your recovery codes
                  </div>
                  <p
                    style={{
                      fontSize: "var(--gc-text-sm)",
                      color: "var(--gc-text-secondary)",
                      margin: 0,
                      marginBottom: "var(--gc-space-3)",
                      lineHeight: 1.5,
                    }}
                  >
                    Save these to 1Password now. Each code works once if you
                    lose your authenticator.
                  </p>

                  <div
                    style={{
                      padding: "var(--gc-space-4)",
                      background: "var(--gc-surface)",
                      border: "1px solid var(--gc-border)",
                      borderRadius: "var(--gc-radius-sm)",
                      marginBottom: "var(--gc-space-5)",
                    }}
                  >
                    <div
                      className="grid grid-cols-2"
                      style={{
                        gap: "var(--gc-space-2) var(--gc-space-4)",
                        fontFamily: "monospace",
                        fontSize: "var(--gc-text-sm)",
                        color: "var(--gc-text-primary)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {begin.recoveryCodes.map((c) => (
                        <span key={c}>{c}</span>
                      ))}
                    </div>
                    <button
                      onClick={copyAll}
                      className="flex items-center gap-2"
                      style={{
                        marginTop: "var(--gc-space-3)",
                        background: "transparent",
                        border: "1px solid var(--gc-border)",
                        borderRadius: "var(--gc-radius-sm)",
                        padding: "6px 12px",
                        cursor: "pointer",
                        fontSize: "var(--gc-text-xs)",
                        color: copied ? "var(--gc-gold)" : "var(--gc-text-secondary)",
                        fontFamily: "var(--gc-font-body)",
                        letterSpacing: "var(--gc-tracking-wide)",
                        transition: "color var(--gc-transition-fast), border-color var(--gc-transition-fast)",
                      }}
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy all"}
                    </button>
                  </div>

                  {/* Step 3 — Verify */}
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
                    Step 3 — Confirm the 6-digit code
                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
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
                      marginBottom: "var(--gc-space-4)",
                      outline: "none",
                      transition: "border-color var(--gc-transition-fast)",
                    }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLInputElement).style.borderColor = "var(--gc-gold)";
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLInputElement).style.borderColor = "var(--gc-border)";
                    }}
                  />

                  <button
                    onClick={submit}
                    disabled={submitting || code.length !== 6}
                    className="w-full flex items-center justify-center gap-2"
                    style={{
                      padding: "var(--gc-space-3) var(--gc-space-4)",
                      backgroundColor: "var(--gc-btn-primary-bg)",
                      color: "var(--gc-btn-primary-text)",
                      borderRadius: "var(--gc-radius-sm)",
                      border: "none",
                      cursor: submitting || code.length !== 6 ? "not-allowed" : "pointer",
                      fontFamily: "var(--gc-font-body)",
                      fontSize: "var(--gc-text-base)",
                      fontWeight: 600,
                      letterSpacing: "var(--gc-tracking-wide)",
                      opacity: submitting || code.length !== 6 ? 0.5 : 1,
                      transition: "opacity var(--gc-transition-fast)",
                    }}
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    {submitting ? "Verifying…" : "Confirm and enable 2FA"}
                  </button>
                </div>
              )}

              {/* Footer note */}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
