import { GCPageHeader } from "@/components/gc";
import { Lock } from "lucide-react";
import { TOUR } from "@/lib/tour/selectors";

export default function FinanceChargebacks() {
  return (
    <div data-tour-id={TOUR.FINANCE.CHARGEBACKS.ROOT}>
      <GCPageHeader title="Chargebacks" subtitle="Commission clawback tracking & recovery" accentUnderline />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "var(--gc-space-16) var(--gc-space-8)", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "color-mix(in srgb, var(--gc-gold) 15%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--gc-space-4)" }}>
          <Lock className="w-6 h-6" style={{ color: "var(--gc-gold)" }} />
        </div>
        <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", fontWeight: 600, color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>Coming Soon</div>
        <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)", maxWidth: 480, lineHeight: 1.6 }}>
          Chargeback tracking requires carrier data feeds to detect policy lapses and trigger clawback workflows. This feature will be available once carrier commission APIs are connected.
        </div>
        <div style={{ marginTop: "var(--gc-space-6)", padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
          Requires: Carrier API keys for lapse detection
        </div>
      </div>
    </div>
  );
}
