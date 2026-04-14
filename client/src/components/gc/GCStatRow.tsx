export interface GCStatRowProps { label: string; value: number; max: number; formatter?: (v: number) => string; }

export function GCStatRow({ label, value, max, formatter = (v) => v.toLocaleString() }: GCStatRowProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-4">
      <span className="flex-shrink-0 w-32 truncate" style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)" }}>{label}</span>
      <div className="flex-1 h-6 relative" style={{ backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)" }}>
        <div className="absolute inset-y-0 left-0" style={{ width: `${pct}%`, backgroundColor: "var(--gc-gold)", borderRadius: "var(--gc-radius-md)", transition: "width var(--gc-transition-normal)" }} />
      </div>
      <span className="flex-shrink-0 w-24 text-right" style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{formatter(value)}</span>
    </div>
  );
}
