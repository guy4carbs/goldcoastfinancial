import { Shield } from "lucide-react";

export function ApplicationHeader({ step, totalSteps, labels }: { step: number; totalSteps: number; labels?: string[] }) {
  const label = labels?.[step] || "";

  return (
    <div className="sticky top-0 z-40" style={{ backgroundColor: "var(--gc-surface)", borderBottom: "1px solid var(--gc-border)" }}>
      <div style={{ height: 2, background: "linear-gradient(90deg, var(--gc-gold), var(--gc-gold-bright))" }} />
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ padding: "var(--gc-space-2)", backgroundColor: "var(--gc-gold)", borderRadius: "var(--gc-radius-md)" }}>
            <Shield className="w-4 h-4" style={{ color: "var(--gc-btn-primary-text)" }} />
          </div>
          <div className="flex flex-col">
            <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", fontWeight: 600, color: "var(--gc-text-primary)", lineHeight: 1.1 }}>GOLD COAST FINANCIAL</span>
            <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "10px", color: "var(--gc-gold)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Agent Application</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-gold)", fontWeight: 500 }}>Step {step + 1} of {totalSteps}</span>
          <span style={{ fontSize: "10px", color: "var(--gc-text-muted)" }}>{label}</span>
        </div>
      </div>
      <div style={{ height: 3, backgroundColor: "var(--gc-surface-2)" }}>
        <div style={{ height: "100%", width: `${((step + 1) / totalSteps) * 100}%`, backgroundColor: "var(--gc-gold)", transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}
