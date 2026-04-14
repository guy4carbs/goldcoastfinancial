import { useState } from "react";
import { GCPageHeader, GCStatRow } from "@/components/gc";
const SCHEDULE = [
  { level: 0, name: "Founder / Owner", defaultContract: 120 },
  { level: 1, name: "Diamond Director", defaultContract: 100 },
  { level: 2, name: "Platinum Director", defaultContract: 95 },
  { level: 3, name: "Regional Manager", defaultContract: 90 },
  { level: 4, name: "Team Lead", defaultContract: 85 },
  { level: 5, name: "Senior Agent", defaultContract: 82 },
  { level: 6, name: "Agent", defaultContract: 80 },
  { level: 7, name: "Associate Agent", defaultContract: 70 },
];
export default function HCMSCompensation() {
  const [premium, setPremium] = useState(10000);
  const [agentLevel, setAgentLevel] = useState(6);
  const waterfall = SCHEDULE.filter(s => s.level <= agentLevel).reverse().map((s, i, arr) => {
    const below = i > 0 ? arr[i-1].defaultContract : 0;
    const spread = i === 0 ? 0 : s.defaultContract - below;
    const earning = i === 0 ? (s.defaultContract / 100) * premium : (spread / 100) * premium;
    return { ...s, spread, earning, isPersonal: i === 0 };
  }).reverse();
  return (
    <div>
      <GCPageHeader title="Compensation Schedules" subtitle="Commission rates, override rules & contract level management" accentUnderline />
      <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", overflow: "auto", marginBottom: "var(--gc-space-6)" }}>
        <table className="w-full"><thead><tr style={{ borderBottom: "2px solid var(--gc-gold)" }}>
          {["Level", "Title", "Default Contract %", "Override Spread"].map(h => <th key={h} style={{ padding: "var(--gc-space-3) var(--gc-space-4)", textAlign: "left", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-gold)" }}>{h}</th>)}
        </tr></thead><tbody>
          {SCHEDULE.map((s, i) => {
            const spread = i < SCHEDULE.length - 1 ? s.defaultContract - SCHEDULE[i+1].defaultContract : 0;
            return <tr key={s.level} style={{ borderBottom: "1px solid var(--gc-border-subtle)", backgroundColor: i % 2 === 0 ? "var(--gc-surface)" : "var(--gc-surface-2)" }}>
              <td style={{ padding: "var(--gc-space-3) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)" }}>{s.level}</td>
              <td style={{ padding: "var(--gc-space-3) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)" }}>{s.name}</td>
              <td style={{ padding: "var(--gc-space-3) var(--gc-space-4)", fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-gold)" }}>{s.defaultContract}%</td>
              <td style={{ padding: "var(--gc-space-3) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)", backgroundColor: `color-mix(in srgb, var(--gc-gold) 8%, transparent)` }}>{spread > 0 ? `${spread}%` : "—"}</td>
            </tr>;
          })}
        </tbody></table>
      </div>
      <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
        <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Waterfall Simulator</div>
        <div className="flex gap-4 mb-6">
          <div><label style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-2)" }}>Premium ($)</label>
            <input type="number" value={premium} onChange={e => setPremium(Number(e.target.value))} style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-md)", width: 150 }} /></div>
          <div><label style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-2)" }}>Agent Level</label>
            <select value={agentLevel} onChange={e => setAgentLevel(Number(e.target.value))} style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-md)" }}>
              {SCHEDULE.filter(s => s.level >= 4).map(s => <option key={s.level} value={s.level}>{s.name} ({s.defaultContract}%)</option>)}
            </select></div>
        </div>
        <div className="flex flex-col gap-2">
          {waterfall.map(w => <GCStatRow key={w.level} label={`${w.name}${w.isPersonal ? " (Personal)" : ` (${w.spread}% spread)`}`} value={w.earning} max={premium * 1.5} formatter={v => `$${v.toLocaleString()}`} />)}
        </div>
        <div style={{ marginTop: "var(--gc-space-4)", padding: "var(--gc-space-3) var(--gc-space-4)", borderTop: "2px solid var(--gc-gold)", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Total Payout</span>
          <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-gold)" }}>${waterfall.reduce((s,w) => s + w.earning, 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
