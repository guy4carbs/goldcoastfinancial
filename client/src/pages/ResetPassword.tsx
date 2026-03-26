import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { RADIUS, COLORS, TYPE, fadeInUp } from "@/lib/heritageDesignSystem";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "submitting" | "success" | "error">("loading");
  const [error, setError] = useState("");

  // Extract token from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      setStatus("invalid");
      setError("No reset token provided.");
      return;
    }
    setToken(t);

    // Verify token
    fetch(`/api/auth/verify-reset-token?token=${t}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setStatus("valid");
        } else {
          setStatus("invalid");
          setError(data.error || "This reset link is invalid or has expired.");
        }
      })
      .catch(() => {
        setStatus("invalid");
        setError("Unable to verify reset link. Please try again.");
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setError(data.error || "Failed to reset password. The link may have expired.");
      }
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  };

  const logoUrl =
    "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b";

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${COLORS.primary.violet[700]} 0%, ${COLORS.primary.violet[900]} 50%, #1e1b4b 100%)`,
        padding: 20,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: "100%",
          maxWidth: 440,
          backgroundColor: "#fff",
          borderRadius: RADIUS.card,
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #f59e0b 100%)`,
            padding: "28px 32px",
            textAlign: "center",
          }}
        >
          <img
            src={logoUrl}
            alt="Heritage Life Solutions"
            style={{ width: 56, height: 56, borderRadius: 12, marginBottom: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
          />
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: "8px 0 0 0" }}>
            {status === "success" ? "Password Updated" : "Reset Your Password"}
          </h1>
        </div>

        {/* Content */}
        <div style={{ padding: 32 }}>
          {/* Loading */}
          {status === "loading" && (
            <div className="flex flex-col items-center gap-3" style={{ padding: "20px 0" }}>
              <Loader2 size={32} className="animate-spin" style={{ color: COLORS.primary.violet[500] }} />
              <p style={{ color: COLORS.gray[500], fontSize: TYPE.meta }}>Verifying your reset link...</p>
            </div>
          )}

          {/* Invalid token */}
          {status === "invalid" && (
            <div className="flex flex-col items-center gap-4" style={{ padding: "20px 0" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  backgroundColor: "#fef2f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AlertCircle size={28} style={{ color: "#ef4444" }} />
              </div>
              <p style={{ color: COLORS.gray[700], fontSize: TYPE.body, fontWeight: 600, textAlign: "center" }}>
                Link Expired or Invalid
              </p>
              <p style={{ color: COLORS.gray[500], fontSize: TYPE.meta, textAlign: "center", lineHeight: 1.6 }}>
                {error}
              </p>
              <Link href="/agents/login">
                <a
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: COLORS.primary.violet[600],
                    fontSize: TYPE.meta,
                    fontWeight: 600,
                    textDecoration: "none",
                    marginTop: 8,
                  }}
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </a>
              </Link>
            </div>
          )}

          {/* Form */}
          {(status === "valid" || status === "submitting" || status === "error") && (
            <form onSubmit={handleSubmit}>
              <p style={{ color: COLORS.gray[500], fontSize: TYPE.meta, marginBottom: 20, lineHeight: 1.6 }}>
                Enter your new password below. Must be at least 8 characters.
              </p>

              {error && (
                <div
                  className="flex items-center gap-2"
                  style={{
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: RADIUS.input,
                    padding: "10px 14px",
                    marginBottom: 16,
                  }}
                >
                  <AlertCircle size={16} style={{ color: "#ef4444", flexShrink: 0 }} />
                  <p style={{ color: "#dc2626", fontSize: TYPE.micro, margin: 0 }}>{error}</p>
                </div>
              )}

              {/* New Password */}
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{ display: "block", fontSize: TYPE.micro, fontWeight: 600, color: COLORS.gray[700], marginBottom: 6 }}
                >
                  New Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: COLORS.gray[400] }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={8}
                    style={{
                      width: "100%",
                      padding: "12px 44px 12px 42px",
                      borderRadius: RADIUS.input,
                      border: `1px solid ${COLORS.gray[300]}`,
                      fontSize: TYPE.body,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      color: COLORS.gray[400],
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{ display: "block", fontSize: TYPE.micro, fontWeight: 600, color: COLORS.gray[700], marginBottom: 6 }}
                >
                  Confirm Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: COLORS.gray[400] }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={8}
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 42px",
                      borderRadius: RADIUS.input,
                      border: `1px solid ${password && confirmPassword && password !== confirmPassword ? "#ef4444" : COLORS.gray[300]}`,
                      fontSize: TYPE.body,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "submitting" || !password || !confirmPassword}
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  background: status === "submitting" ? COLORS.gray[400] : `linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #f59e0b 100%)`,
                  color: "#fff",
                  border: "none",
                  borderRadius: RADIUS.button,
                  fontSize: TYPE.body,
                  fontWeight: 700,
                  cursor: status === "submitting" ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Set New Password"
                )}
              </button>
            </form>
          )}

          {/* Success */}
          {status === "success" && (
            <div className="flex flex-col items-center gap-4" style={{ padding: "20px 0" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  backgroundColor: "#f0fdf4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle size={28} style={{ color: "#22c55e" }} />
              </div>
              <p style={{ color: COLORS.gray[700], fontSize: TYPE.body, fontWeight: 600 }}>
                Password Updated Successfully
              </p>
              <p style={{ color: COLORS.gray[500], fontSize: TYPE.meta, textAlign: "center", lineHeight: 1.6 }}>
                Your password has been reset. You can now log in with your new password.
              </p>
              <button
                onClick={() => setLocation("/agents/login")}
                style={{
                  marginTop: 8,
                  padding: "12px 32px",
                  background: `linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #f59e0b 100%)`,
                  color: "#fff",
                  border: "none",
                  borderRadius: RADIUS.button,
                  fontSize: TYPE.body,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
