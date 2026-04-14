import { GCPageHeader, GCKPICard } from "@/components/gc";
const TXN = [
  { date: "2026-04-13", type: "incoming", desc: "Carrier commission payment — Mutual of Omaha", amount: 12400 },
  { date: "2026-04-12", type: "payout", desc: "Agent commission payout — Sarah Mitchell", amount: -4200 },
  { date: "2026-04-11", type: "incoming", desc: "Carrier commission payment — Transamerica", amount: 8900 },
  { date: "2026-04-10", type: "expense", desc: "Marketing spend — Google Ads", amount: -1500 },
];
const typeColor: Record<string, string> = { incoming: "var(--gc-status-active)", payout: "var(--gc-status-warning)", expense: "var(--gc-status-terminated)" };
export default function OpsFinance() {
  return (
    <div>
      <GCPageHeader title="Finance" subtitle="Revenue tracking & financial operations" accentUnderline />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <GCKPICard label="Revenue (Month)" value="$89K" accentTop delta={{ value: "+15%", positive: true }} />
        <GCKPICard label="Commissions Paid" value="$42K" accentTop />
        <GCKPICard label="Net Revenue" value="$47K" accentTop delta={{ value: "+22%", positive: true }} />
      </div>
      <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Recent Transactions</div>
      <div className="flex flex-col gap-2">
        {TXN.map((t, i) => (
          <div key={i} style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border-subtle)", borderRadius: "0px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="flex items-center gap-3">
              <span style={{ padding: "2px 6px", borderRadius: "2px", fontSize: "var(--gc-text-xs)", fontFamily: "var(--gc-font-body)", color: typeColor[t.type], backgroundColor: `color-mix(in srgb, ${typeColor[t.type]} 15%, transparent)`, textTransform: "capitalize" as const }}>{t.type}</span>
              <div>
                <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)" }}>{t.desc}</div>
                <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>{t.date}</div>
              </div>
            </div>
            <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", fontWeight: 600, color: t.amount > 0 ? "var(--gc-status-active)" : "var(--gc-text-primary)" }}>{t.amount > 0 ? "+" : ""}${Math.abs(t.amount).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
