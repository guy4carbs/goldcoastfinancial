import { GCPageHeader } from "@/components/gc";
import { Lock } from "lucide-react";
import { TOUR } from "@/lib/tour/selectors";

export default function FinanceReconciliation() {
  return (
    <div data-tour-id={TOUR.FINANCE.RECONCILIATION.ROOT}>
      <GCPageHeader title="Reconciliation" subtitle="Commission matching & discrepancy resolution" accentUnderline />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "var(--gc-space-16) var(--gc-space-8)", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "color-mix(in srgb, var(--gc-gold) 15%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--gc-space-4)" }}>
          <Lock className="w-6 h-6" style={{ color: "var(--gc-gold)" }} />
        </div>
        <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", fontWeight: 600, color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>Coming Soon</div>
        <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)", maxWidth: 480, lineHeight: 1.6 }}>
          Reconciliation will automatically match carrier commission statements against expected commissions from submitted deals, flagging discrepancies for review. This feature requires carrier statement data.
        </div>
        <div style={{ marginTop: "var(--gc-space-6)", padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
          Requires: Carrier statements imported via Statements page
        </div>
      </div>
    </div>
  );
}
