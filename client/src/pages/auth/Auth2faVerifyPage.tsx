import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { ShieldCheck, KeyRound, Loader2, Fingerprint, Shield, X } from "lucide-react";
import { startAuthentication } from "@simplewebauthn/browser";
import { csrfHeaders } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const SUPPRESS_FALLBACK_KEY = "gc.2fa.suppressFallbackPopup";
const FALLBACK_DELAY_MS = 4500;

export default function Auth2faVerifyPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [mode, setMode] = useState<"totp" | "recovery">("totp");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [passkeyAvailable, setPasskeyAvailable] = useState<boolean | null>(null);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
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
      toast({ title: "Verified with passkey" });
      window.location.assign("/founders");
    } catch (e: any) {
      toast({
        title: "Passkey verification failed",
        description: e?.message,
        variant: "destructive",
      });
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
          if (!has) {
            // No passkey at all — show fallback inline; no popup needed.
            setShowFallback(true);
          }
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

  // Schedule the soft "use authenticator app" popup after a short delay,
  // unless the user has previously dismissed it permanently.
  useEffect(() => {
    if (passkeyAvailable !== true) return;
    let suppressed = false;
    try {
      suppressed = localStorage.getItem(SUPPRESS_FALLBACK_KEY) === "1";
    } catch { /* localStorage may be blocked */ }
    if (suppressed) return;
    const t = window.setTimeout(() => {
      setPopupVisible(true);
      // Trigger fade-in transition on the next frame.
      requestAnimationFrame(() => setPopupOpen(true));
    }, FALLBACK_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [passkeyAvailable]);

  const dismissPopup = (useNow: boolean) => {
    if (dontShowAgain) {
      try { localStorage.setItem(SUPPRESS_FALLBACK_KEY, "1"); } catch { /* ignore */ }
    }
    setPopupOpen(false);
    setTimeout(() => {
      setPopupVisible(false);
      if (useNow) setShowFallback(true);
    }, 220);
  };

  const submit = async () => {
    setSubmitting(true);
    const path = mode === "totp" ? "/api/auth/2fa/verify" : "/api/auth/2fa/recovery";
    try {
      const res = await fetch(path, {
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
            Confirm with the passkey on this device to continue.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "var(--gc-space-6)" }}>
          {passkeyAvailable === null && (
            <div
              className="flex items-center justify-center"
              style={{ padding: "var(--gc-space-10) 0" }}
            >
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} />
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
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Fingerprint className="w-5 h-5" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "var(--gc-text-md)", fontWeight: 600 }}>
                  {passkeyBusy ? "Awaiting Touch ID…" : "Authenticate with passkey"}
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
                  Touch ID · Face ID · Hardware key
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
              {mode === "totp" ? (
                <>
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
                    Authenticator App
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
                    Enter the 6-digit code from 1Password, Authy, or Google
                    Authenticator.
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
                </>
              ) : (
                <>
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
                    Recovery Code
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
                    Enter one of the single-use recovery codes you saved during
                    enrollment.
                  </p>
                  <input
                    type="text"
                    maxLength={11}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="ABCDE-12345"
                    style={{
                      width: "100%",
                      padding: "var(--gc-space-3)",
                      background: "var(--gc-surface)",
                      border: "1px solid var(--gc-border)",
                      borderRadius: "var(--gc-radius-sm)",
                      fontFamily: "monospace",
                      fontSize: "var(--gc-text-md)",
                      textAlign: "center",
                      color: "var(--gc-text-primary)",
                      marginBottom: "var(--gc-space-3)",
                      outline: "none",
                    }}
                  />
                </>
              )}

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
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                {submitting ? "Verifying…" : "Verify"}
              </button>

              <button
                onClick={() => {
                  setMode((m) => (m === "totp" ? "recovery" : "totp"));
                  setCode("");
                }}
                className="flex items-center gap-2 mx-auto"
                style={{
                  marginTop: "var(--gc-space-4)",
                  background: "none",
                  border: "none",
                  color: "var(--gc-text-muted)",
                  fontSize: "var(--gc-text-xs)",
                  cursor: "pointer",
                  letterSpacing: "var(--gc-tracking-wide)",
                }}
              >
                <KeyRound className="w-3.5 h-3.5" />
                {mode === "totp"
                  ? "Use a recovery code instead"
                  : "Use authenticator app instead"}
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

      {/* ─── Soft fallback popup ─── */}
      {popupVisible && (
        <div
          style={{
            position: "fixed",
            bottom: 32,
            right: 32,
            maxWidth: 360,
            background: "var(--gc-surface)",
            border: "1px solid var(--gc-border)",
            borderLeft: "3px solid var(--gc-gold)",
            borderRadius: "var(--gc-radius-md)",
            boxShadow: "var(--gc-shadow-lg)",
            padding: "var(--gc-space-4) var(--gc-space-5)",
            opacity: popupOpen ? 1 : 0,
            transform: popupOpen ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 220ms ease, transform 220ms ease",
            zIndex: 50,
          }}
        >
          <button
            onClick={() => dismissPopup(false)}
            aria-label="Dismiss"
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "transparent",
              border: "none",
              color: "var(--gc-text-muted)",
              cursor: "pointer",
              padding: 4,
              lineHeight: 0,
            }}
          >
            <X className="w-4 h-4" />
          </button>
          <div
            style={{
              fontSize: "var(--gc-text-xs)",
              letterSpacing: "var(--gc-tracking-wider)",
              textTransform: "uppercase",
              color: "var(--gc-gold)",
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            Trouble with Touch ID?
          </div>
          <p
            style={{
              fontFamily: "var(--gc-font-display)",
              fontStyle: "italic",
              fontSize: "var(--gc-text-md)",
              color: "var(--gc-text-secondary)",
              margin: 0,
              marginBottom: "var(--gc-space-3)",
              lineHeight: 1.5,
            }}
          >
            Use a code from your authenticator app instead.
          </p>
          <button
            onClick={() => dismissPopup(true)}
            className="w-full"
            style={{
              padding: "var(--gc-space-2) var(--gc-space-3)",
              background: "var(--gc-btn-primary-bg)",
              color: "var(--gc-btn-primary-text)",
              border: "none",
              borderRadius: "var(--gc-radius-sm)",
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-sm)",
              fontWeight: 600,
              letterSpacing: "var(--gc-tracking-wide)",
              cursor: "pointer",
              marginBottom: "var(--gc-space-3)",
            }}
          >
            Use authenticator app
          </button>
          <label
            className="flex items-center gap-2"
            style={{
              fontSize: "var(--gc-text-xs)",
              color: "var(--gc-text-muted)",
              cursor: "pointer",
              userSelect: "none",
              letterSpacing: "var(--gc-tracking-wide)",
            }}
          >
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              style={{ accentColor: "var(--gc-gold)", cursor: "pointer" }}
            />
            Don't show this again on this device
          </label>
        </div>
      )}
    </div>
  );
}
