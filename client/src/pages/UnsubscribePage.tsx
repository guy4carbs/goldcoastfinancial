/**
 * UnsubscribePage — public (no-auth) email preference / unsubscribe page.
 *
 * Reads ?token= from the URL, GETs /api/unsubscribe?token= to confirm which
 * address + category the token maps to, then POSTs /api/unsubscribe { token }
 * to suppress. Ported from the heritage-app UnsubscribePage and rebranded for
 * Gold Coast Financial Partners.
 *
 * Routed at /unsubscribe (PUBLIC) in App.tsx. The POST is CSRF-protected on
 * main, so it goes through apiRequest which fetches a session-less CSRF token
 * first — Forge must also keep /api/unsubscribe out of any auth gate.
 */

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Mail, CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface UnsubscribeData {
  email: string;
  category: string;
  categoryLabel: string;
  alreadySuppressed: boolean;
}

export default function UnsubscribePage() {
  const token = new URLSearchParams(window.location.search).get("token");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [data, setData] = useState<UnsubscribeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/unsubscribe?token=${encodeURIComponent(token || "")}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Invalid unsubscribe link");
        }
        const result: UnsubscribeData = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      setError("Missing unsubscribe link");
      setLoading(false);
    }
  }, [token]);

  const handleUnsubscribe = async () => {
    setProcessing(true);
    try {
      await apiRequest("POST", "/api/unsubscribe", { token });
      setSuccess(true);
    } catch (err: any) {
      // apiRequest throws "<status>: <body>"; surface the readable tail.
      const msg = typeof err?.message === "string" ? err.message.replace(/^\d+:\s*/, "") : "";
      setError(msg || "Failed to unsubscribe");
    } finally {
      setProcessing(false);
    }
  };

  const label = data?.categoryLabel || "marketing";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--gc-bg, #0B0B0C)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div
          className="overflow-hidden"
          style={{
            backgroundColor: "var(--gc-surface, #ffffff)",
            border: "1px solid var(--gc-border, #e5e7eb)",
            borderRadius: "var(--gc-radius-lg, 20px)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          }}
        >
          {/* Header */}
          <div
            className="px-6 py-8 text-center"
            style={{
              background: "linear-gradient(135deg, var(--gc-gold, #C5A572), var(--gc-gold-bright, #E0C088))",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
            >
              <Mail className="w-8 h-8" style={{ color: "var(--gc-btn-primary-text, #1a1a1a)" }} />
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--gc-btn-primary-text, #1a1a1a)", fontFamily: "var(--gc-font-display, serif)" }}
            >
              Email Preferences
            </h1>
            <p className="mt-1" style={{ color: "var(--gc-btn-primary-text, #1a1a1a)", opacity: 0.75 }}>
              Gold Coast Financial Partners
            </p>
          </div>

          {/* Content */}
          <div className="p-6" style={{ color: "var(--gc-text-primary, #111827)", fontFamily: "var(--gc-font-body, sans-serif)" }}>
            {loading ? (
              <div className="text-center py-8">
                <div
                  className="w-8 h-8 rounded-full animate-spin mx-auto mb-4"
                  style={{ border: "2px solid var(--gc-gold, #C5A572)", borderTopColor: "transparent" }}
                />
                <p style={{ color: "var(--gc-text-secondary, #4b5563)" }}>Loading…</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "color-mix(in srgb, var(--gc-status-terminated, #dc2626) 15%, transparent)" }}
                >
                  <XCircle className="w-8 h-8" style={{ color: "var(--gc-status-terminated, #dc2626)" }} />
                </div>
                <h2 className="text-xl font-semibold mb-2">Invalid Link</h2>
                <p className="mb-6" style={{ color: "var(--gc-text-secondary, #4b5563)" }}>{error}</p>
                <HomeLink />
              </div>
            ) : success ? (
              <div className="text-center py-8">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "color-mix(in srgb, var(--gc-status-active, #16a34a) 15%, transparent)" }}
                >
                  <CheckCircle className="w-8 h-8" style={{ color: "var(--gc-status-active, #16a34a)" }} />
                </div>
                <h2 className="text-xl font-semibold mb-2">Unsubscribed Successfully</h2>
                <p className="mb-6" style={{ color: "var(--gc-text-secondary, #4b5563)" }}>
                  You've been unsubscribed from our {label} emails. We're sorry to see you go.
                </p>
                <p className="text-sm mb-6" style={{ color: "var(--gc-text-muted, #6b7280)" }}>
                  Changed your mind? You can update your preferences anytime from your account.
                </p>
                <HomeLink />
              </div>
            ) : data?.alreadySuppressed ? (
              <div className="text-center py-8">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "color-mix(in srgb, var(--gc-status-warning, #d97706) 15%, transparent)" }}
                >
                  <AlertCircle className="w-8 h-8" style={{ color: "var(--gc-status-warning, #d97706)" }} />
                </div>
                <h2 className="text-xl font-semibold mb-2">Already Unsubscribed</h2>
                <p className="mb-6" style={{ color: "var(--gc-text-secondary, #4b5563)" }}>
                  The email <strong>{data.email}</strong> is already unsubscribed from our {label} emails.
                </p>
                <HomeLink />
              </div>
            ) : (
              <div className="text-center py-4">
                <h2 className="text-xl font-semibold mb-2">Unsubscribe from {label} emails</h2>
                <p className="mb-6" style={{ color: "var(--gc-text-secondary, #4b5563)" }}>
                  Are you sure you want to unsubscribe <strong>{data?.email}</strong> from our {label} emails?
                </p>
                <p className="text-sm mb-6" style={{ color: "var(--gc-text-muted, #6b7280)" }}>
                  You'll no longer receive these messages. Transactional emails about your policy and
                  account will still be delivered.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handleUnsubscribe}
                    disabled={processing}
                    className="w-full py-3 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "var(--gc-status-terminated, #dc2626)", color: "#ffffff" }}
                  >
                    {processing ? "Processing…" : "Yes, Unsubscribe Me"}
                  </button>

                  <Link
                    href="/"
                    className="block w-full py-3 font-semibold rounded-lg text-center no-underline"
                    style={{
                      backgroundColor: "var(--gc-surface-2, #f3f4f6)",
                      color: "var(--gc-text-secondary, #374151)",
                    }}
                  >
                    No, Keep Me Subscribed
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4 text-center"
            style={{ backgroundColor: "var(--gc-surface-2, #f9fafb)", borderTop: "1px solid var(--gc-border, #e5e7eb)" }}
          >
            <p className="text-xs" style={{ color: "var(--gc-text-muted, #6b7280)" }}>
              Gold Coast Financial Partners | Protecting Families Nationwide
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function HomeLink() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 no-underline hover:underline"
      style={{ color: "var(--gc-gold, #C5A572)" }}
    >
      <ArrowLeft className="w-4 h-4" />
      Return to Homepage
    </Link>
  );
}
