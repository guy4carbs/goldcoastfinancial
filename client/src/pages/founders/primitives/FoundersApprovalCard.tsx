import { Check, X, Users } from "lucide-react";

export interface FoundersApprovalCardProps {
  title: string;
  description?: string;
  proposerName: string;
  proposerEmail: string;
  proposedAt: string | Date;
  currentUserEmail?: string;
  quorumMet?: boolean;
  quorumCount?: number;
  quorumRequired?: number;
  onApprove?: () => void;
  onReject?: () => void;
}

function formatTimestamp(ts: string | Date): string {
  const d = typeof ts === "string" ? new Date(ts) : ts;
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function FoundersApprovalCard({
  title,
  description,
  proposerName,
  proposerEmail,
  proposedAt,
  currentUserEmail,
  quorumMet,
  quorumCount = 1,
  quorumRequired = 2,
  onApprove,
  onReject,
}: FoundersApprovalCardProps) {
  const isProposer = !!currentUserEmail && currentUserEmail === proposerEmail;

  return (
    <div
      style={{
        backgroundColor: "var(--gc-surface)",
        border: "1px solid var(--gc-border)",
        borderRadius: "var(--gc-radius-md)",
        padding: "var(--gc-space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--gc-space-3)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--gc-font-display)",
              fontSize: "var(--gc-text-lg)",
              fontWeight: 600,
              color: "var(--gc-text-primary)",
              lineHeight: "var(--gc-leading-tight)",
            }}
          >
            {title}
          </div>
          {description && (
            <div
              className="mt-1"
              style={{
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-sm)",
                color: "var(--gc-text-secondary)",
              }}
            >
              {description}
            </div>
          )}
        </div>
        <div
          className="flex items-center gap-1 flex-shrink-0"
          style={{
            padding: "4px 8px",
            borderRadius: "var(--gc-radius-full)",
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-xs)",
            fontWeight: 500,
            color: quorumMet ? "var(--gc-status-active)" : "var(--gc-status-pending)",
            backgroundColor: quorumMet
              ? "color-mix(in srgb, var(--gc-status-active) 15%, transparent)"
              : "color-mix(in srgb, var(--gc-status-pending) 15%, transparent)",
          }}
        >
          <Users className="w-3 h-3" />
          <span>
            {quorumCount}/{quorumRequired} quorum
          </span>
        </div>
      </div>

      <div
        style={{
          fontFamily: "var(--gc-font-body)",
          fontSize: "var(--gc-text-xs)",
          color: "var(--gc-text-muted)",
        }}
      >
        Proposed by <span style={{ color: "var(--gc-text-secondary)" }}>{proposerName}</span> ·{" "}
        {formatTimestamp(proposedAt)}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onApprove}
          disabled={isProposer}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: "var(--gc-radius-sm)",
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-base)",
            fontWeight: 500,
            backgroundColor: isProposer ? "var(--gc-surface-2)" : "var(--gc-btn-primary-bg)",
            color: isProposer ? "var(--gc-text-muted)" : "var(--gc-btn-primary-text)",
            border: "1px solid var(--gc-border)",
            cursor: isProposer ? "not-allowed" : "pointer",
            opacity: isProposer ? 0.6 : 1,
            transition: "all var(--gc-transition-fast)",
          }}
          title={isProposer ? "Proposer cannot approve their own request" : "Approve"}
        >
          <Check className="w-3.5 h-3.5" />
          Approve
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={isProposer}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: "var(--gc-radius-sm)",
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-base)",
            fontWeight: 500,
            backgroundColor: "transparent",
            color: isProposer ? "var(--gc-text-muted)" : "var(--gc-status-terminated)",
            border: "1px solid var(--gc-border)",
            cursor: isProposer ? "not-allowed" : "pointer",
            opacity: isProposer ? 0.6 : 1,
            transition: "all var(--gc-transition-fast)",
          }}
          title={isProposer ? "Proposer cannot reject their own request" : "Reject"}
        >
          <X className="w-3.5 h-3.5" />
          Reject
        </button>
      </div>
    </div>
  );
}
