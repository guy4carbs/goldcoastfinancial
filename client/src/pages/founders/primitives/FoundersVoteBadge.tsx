import { Check, Clock } from "lucide-react";

export interface FoundersVoteBadgeProps {
  proposerName: string;
  approverName?: string | null;
}

export function FoundersVoteBadge({ proposerName, approverName }: FoundersVoteBadgeProps) {
  const pending = !approverName;
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{
        padding: "4px 10px",
        borderRadius: "var(--gc-radius-full)",
        fontFamily: "var(--gc-font-body)",
        fontSize: "var(--gc-text-xs)",
        fontWeight: 500,
        color: pending ? "var(--gc-status-pending)" : "var(--gc-status-active)",
        backgroundColor: pending
          ? "color-mix(in srgb, var(--gc-status-pending) 15%, transparent)"
          : "color-mix(in srgb, var(--gc-status-active) 15%, transparent)",
        border: pending
          ? "1px solid color-mix(in srgb, var(--gc-status-pending) 30%, transparent)"
          : "1px solid color-mix(in srgb, var(--gc-status-active) 30%, transparent)",
      }}
    >
      {pending ? <Clock className="w-3 h-3" /> : <Check className="w-3 h-3" />}
      {pending ? (
        <span>Proposed by {proposerName} · Pending second signature</span>
      ) : (
        <span>
          Proposed by {proposerName} · Approved by {approverName}
        </span>
      )}
    </span>
  );
}
