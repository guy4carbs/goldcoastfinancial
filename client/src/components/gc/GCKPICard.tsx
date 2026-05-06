import { useState } from "react";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

export interface GCKPICardProps {
  label: string; value: string | number; delta?: { value: string; positive: boolean };
  accentTop?: boolean; className?: string; href?: string;
  period?: string;
  tooltip?: string;
  sparklineData?: number[];
  target?: { value: number; current: number; label?: string };
  comparison?: { value: string; absolute: string; period: string };
}

export function GCKPICard({ label, value, delta, accentTop, className, href, period, tooltip, sparklineData, target, comparison }: GCKPICardProps) {
  const [hovered, setHovered] = useState(false);
  const [tipVisible, setTipVisible] = useState(false);
  const Wrapper = href ? "a" : "div";

  const sparkData = sparklineData?.map(v => ({ v }));
  const targetPct = target ? Math.min(Math.round((target.current / target.value) * 100), 100) : 0;

  return (
    <Wrapper className={className} href={href as any}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)",
        borderWidth: accentTop ? "2px 1px 1px 1px" : "1px",
        borderStyle: "solid",
        borderColor: accentTop
          ? `var(--gc-gold) ${hovered ? "var(--gc-gold)" : "var(--gc-border)"} ${hovered ? "var(--gc-gold)" : "var(--gc-border)"} ${hovered ? "var(--gc-gold)" : "var(--gc-border)"}`
          : hovered ? "var(--gc-gold)" : "var(--gc-border)",
        borderRadius: "var(--gc-radius-md)",
        transition: "border-color var(--gc-transition-normal)",
        textDecoration: "none", display: "block", cursor: href ? "pointer" : "default",
      }}>

      {/* Period + Tooltip row */}
      {(period || tooltip) && (
        <div className="flex items-center justify-between" style={{ marginBottom: "var(--gc-space-1)" }}>
          {period && <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{period}</span>}
          {tooltip && (
            <div style={{ position: "relative" }}>
              <Info className="w-3 h-3" style={{ color: "var(--gc-text-muted)", cursor: "help" }}
                onMouseEnter={() => setTipVisible(true)} onMouseLeave={() => setTipVisible(false)} />
              {tipVisible && (
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 50,
                  maxWidth: 200, padding: "var(--gc-space-2) var(--gc-space-3)",
                  backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)",
                  borderRadius: "var(--gc-radius-sm)", boxShadow: "var(--gc-shadow-md)",
                  fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)",
                  color: "var(--gc-text-secondary)", lineHeight: 1.4,
                }}>{tooltip}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Label */}
      <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", fontWeight: 500, letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)" }}>
        {label}
      </div>

      {/* Value */}
      <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-3xl)", fontWeight: 600, color: "var(--gc-text-primary)", lineHeight: "var(--gc-leading-tight)" }}>
        {value}
      </div>

      {/* Delta + Comparison */}
      {(delta || comparison) && (
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {delta && (
            <span className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-base)", color: delta.positive ? "var(--gc-status-active)" : "var(--gc-status-terminated)" }}>
              {delta.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{delta.value}</span>
            </span>
          )}
          {comparison && (
            <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>
              {comparison.absolute} vs {comparison.period}
            </span>
          )}
        </div>
      )}

      {/* Sparkline */}
      {sparkData && sparkData.length > 1 && (
        <div style={{ marginTop: "var(--gc-space-2)" }}>
          <ResponsiveContainer width="100%" height={48}>
            <AreaChart data={sparkData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`spark-${label.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C4975A" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#C4975A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#C4975A" strokeWidth={1.5} fill={`url(#spark-${label.replace(/\s/g, "")})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Target Progress */}
      {target && (
        <div style={{ marginTop: "var(--gc-space-2)" }}>
          <div style={{ width: "100%", height: 4, backgroundColor: "var(--gc-surface-2)", borderRadius: 2 }}>
            <div style={{ width: `${targetPct}%`, height: "100%", backgroundColor: "var(--gc-gold)", borderRadius: 2, transition: "width var(--gc-transition-normal)" }} />
          </div>
          <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginTop: 2 }}>
            {targetPct}% of {target.label || `$${target.value.toLocaleString()}`} target
          </div>
        </div>
      )}
    </Wrapper>
  );
}
