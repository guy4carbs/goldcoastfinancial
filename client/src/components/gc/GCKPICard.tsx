import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface GCKPICardProps {
  label: string; value: string | number; delta?: { value: string; positive: boolean };
  accentTop?: boolean; className?: string; href?: string;
}

export function GCKPICard({ label, value, delta, accentTop, className, href }: GCKPICardProps) {
  const [hovered, setHovered] = useState(false);
  const Wrapper = href ? "a" : "div";
  return (
    <Wrapper className={className} href={href as any}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)",
        border: "1px solid", borderColor: hovered ? "var(--gc-gold)" : "var(--gc-border)",
        borderRadius: "var(--gc-radius-md)", borderTop: accentTop ? "2px solid var(--gc-gold)" : undefined,
        transition: "border-color var(--gc-transition-normal)",
        textDecoration: "none", display: "block", cursor: href ? "pointer" : "default",
      }}>
      <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", fontWeight: 500, letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)" }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-3xl)", fontWeight: 600, color: "var(--gc-text-primary)", lineHeight: "var(--gc-leading-tight)" }}>
        {value}
      </div>
      {delta && (
        <div className="flex items-center gap-1 mt-1" style={{ fontSize: "var(--gc-text-base)", color: delta.positive ? "var(--gc-status-active)" : "var(--gc-status-terminated)" }}>
          {delta.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{delta.value}</span>
        </div>
      )}
    </Wrapper>
  );
}
