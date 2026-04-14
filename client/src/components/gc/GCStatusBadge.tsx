const statusConfig: Record<string, { color: string; label: string }> = {
  active: { color: "var(--gc-status-active)", label: "Active" },
  approved: { color: "var(--gc-status-active)", label: "Approved" },
  pending: { color: "var(--gc-status-pending)", label: "Pending" },
  pending_review: { color: "var(--gc-status-pending)", label: "Pending Review" },
  review: { color: "var(--gc-status-review)", label: "In Review" },
  in_review: { color: "var(--gc-status-review)", label: "In Review" },
  terminated: { color: "var(--gc-status-terminated)", label: "Terminated" },
  rejected: { color: "var(--gc-status-terminated)", label: "Rejected" },
  warning: { color: "var(--gc-status-warning)", label: "Warning" },
  expired: { color: "var(--gc-status-terminated)", label: "Expired" },
  suspended: { color: "var(--gc-status-warning)", label: "Suspended" },
};

export interface GCStatusBadgeProps { status: string; className?: string; }

export function GCStatusBadge({ status, className }: GCStatusBadgeProps) {
  const config = statusConfig[status] || { color: "var(--gc-text-muted)", label: status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) };
  return (
    <span className={className} style={{
      display: "inline-flex", alignItems: "center", padding: "2px 8px",
      borderRadius: "2px", fontSize: "var(--gc-text-sm)", fontFamily: "var(--gc-font-body)",
      fontWeight: 500, letterSpacing: "var(--gc-tracking-wide)",
      color: config.color, backgroundColor: `color-mix(in srgb, ${config.color} 15%, transparent)`,
    }}>
      {config.label}
    </span>
  );
}
