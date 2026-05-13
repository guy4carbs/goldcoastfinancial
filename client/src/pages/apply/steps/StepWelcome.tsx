import { Shield, FileSignature, Clock, CheckCircle } from "lucide-react";

interface Props { firstName?: string; onBegin: () => void; }

export function StepWelcome({ firstName, onBegin }: Props) {
  return (
    <div className="text-center py-8">
      <div className="flex justify-center mb-6">
        <div style={{
          width: 64, height: 64, borderRadius: "var(--gc-radius-lg)",
          background: "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px color-mix(in srgb, var(--gc-gold) 30%, transparent)",
        }}>
          <Shield className="w-8 h-8" style={{ color: "var(--gc-btn-primary-text)" }} />
        </div>
      </div>

      <h1 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-4xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>
        {firstName ? `Welcome, ${firstName}!` : "Agent Application"}
      </h1>
      <p style={{ fontSize: "var(--gc-text-lg)", color: "var(--gc-text-secondary)", maxWidth: 520, margin: "0 auto var(--gc-space-8)" }}>
        {firstName
          ? "Your application has been pre-started. Complete the steps below to join Gold Coast Financial."
          : "Apply to join Gold Coast Financial as a contracted insurance agent."}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--gc-space-3)", maxWidth: 480, margin: "0 auto var(--gc-space-8)" }}>
        {[
          { icon: Clock, label: "~20 minutes", sub: "Estimated time" },
          { icon: FileSignature, label: "3 documents", sub: "E-sign required" },
          { icon: CheckCircle, label: "4 uploads", sub: "Certs & ID needed" },
        ].map(({ icon: I, label, sub }) => (
          <div key={label} style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
            <I className="w-5 h-5 mx-auto mb-2" style={{ color: "var(--gc-gold)" }} />
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{label}</div>
            <div style={{ fontSize: "10px", color: "var(--gc-text-muted)" }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto var(--gc-space-6)", padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", textAlign: "left" }}>
        <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", marginBottom: "var(--gc-space-2)", fontWeight: 600 }}>Have ready</div>
        <ul style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", lineHeight: 1.8, paddingLeft: "var(--gc-space-4)", margin: 0 }}>
          <li>Social Security Number</li>
          <li>Bank routing & account numbers</li>
          <li>E&O insurance policy details</li>
          <li>Government-issued photo ID</li>
          <li>AML certificate</li>
        </ul>
      </div>

      <button onClick={onBegin} style={{
        padding: "var(--gc-space-3) var(--gc-space-8)", backgroundColor: "var(--gc-btn-primary-bg)",
        color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none",
        cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-lg)", fontWeight: 600,
      }}>BEGIN APPLICATION</button>
    </div>
  );
}
