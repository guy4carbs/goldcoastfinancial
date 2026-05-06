import { Link } from "wouter";
import { FoundersBrandChip } from "./FoundersBrandChip";
import type { BrandKey } from "../foundersConstants";

export interface FoundersAuditRowProps {
  timestamp: string | Date;
  actorName: string;
  actorInitial?: string;
  action: string;
  entityLabel?: string;
  entityHref?: string;
  brand: BrandKey;
}

function formatTimestamp(ts: string | Date): string {
  const d = typeof ts === "string" ? new Date(ts) : ts;
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function FoundersAuditRow({
  timestamp,
  actorName,
  actorInitial,
  action,
  entityLabel,
  entityHref,
  brand,
}: FoundersAuditRowProps) {
  const initial = (actorInitial || actorName || "?").charAt(0).toUpperCase();
  return (
    <div
      className="flex items-center gap-3"
      style={{
        padding: "10px 12px",
        borderBottom: "1px solid var(--gc-border-subtle)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--gc-font-body)",
          fontSize: "var(--gc-text-xs)",
          color: "var(--gc-text-muted)",
          flex: "0 0 120px",
          whiteSpace: "nowrap",
        }}
      >
        {formatTimestamp(timestamp)}
      </div>
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))",
          color: "var(--gc-btn-primary-text)",
          fontFamily: "var(--gc-font-display)",
          fontSize: "var(--gc-text-xs)",
          fontWeight: 600,
        }}
        title={actorName}
      >
        {initial}
      </div>
      <div className="flex-1 min-w-0" style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)" }}>
        <span style={{ color: "var(--gc-text-primary)", fontWeight: 500 }}>{actorName}</span>{" "}
        <span style={{ color: "var(--gc-text-secondary)" }}>{action}</span>{" "}
        {entityLabel &&
          (entityHref ? (
            <Link href={entityHref} className="no-underline">
              <span style={{ color: "var(--gc-gold)", fontWeight: 500 }}>{entityLabel}</span>
            </Link>
          ) : (
            <span style={{ color: "var(--gc-text-primary)", fontWeight: 500 }}>{entityLabel}</span>
          ))}
      </div>
      <div className="flex-shrink-0">
        <FoundersBrandChip brand={brand} />
      </div>
    </div>
  );
}
