/**
 * Shared tokens + helpers for the Founders email-sequences feature. GC-themed
 * (no heritageDesignSystem on main) so every sub-component reads from the same
 * CSS variables the rest of the Founders Lounge uses.
 */

import type { CSSProperties } from "react";

export const SEQ_LABEL_STYLE: CSSProperties = {
  fontSize: "var(--gc-text-xs)",
  letterSpacing: "var(--gc-tracking-wider)",
  textTransform: "uppercase",
  color: "var(--gc-text-muted)",
  display: "block",
  marginBottom: "var(--gc-space-1)",
  fontFamily: "var(--gc-font-body)",
};

export const SEQ_INPUT_STYLE: CSSProperties = {
  width: "100%",
  padding: "var(--gc-space-2) var(--gc-space-3)",
  backgroundColor: "var(--gc-surface-2)",
  border: "1px solid var(--gc-border)",
  borderRadius: "var(--gc-radius-sm)",
  color: "var(--gc-text-primary)",
  fontFamily: "var(--gc-font-body)",
  fontSize: "var(--gc-text-md)",
  outline: "none",
};

export const SEQ_CARD_STYLE: CSSProperties = {
  backgroundColor: "var(--gc-surface)",
  border: "1px solid var(--gc-border)",
  borderRadius: "var(--gc-radius-md)",
  padding: "var(--gc-space-3)",
};

/** Maps an enrollment lifecycle status onto a GCStatusBadge status token. */
export const ENROLLMENT_STATUS_TO_BADGE: Record<string, string> = {
  active: "active",
  paused: "suspended",
  completed: "approved",
  unsubscribed: "terminated",
};

/** Maps an email delivery status onto a GCStatusBadge status token. */
export const EMAIL_STATUS_TO_BADGE: Record<string, string> = {
  sent: "pending",
  delivered: "active",
  opened: "review",
  clicked: "approved",
  bounced: "terminated",
  failed: "terminated",
  skipped: "suspended",
};

export const TEMPLATE_CATEGORY_OPTIONS = [
  { value: "follow_up", label: "Follow up" },
  { value: "drip_sequence", label: "Drip sequence" },
  { value: "nurture", label: "Nurture" },
  { value: "announcement", label: "Announcement" },
  { value: "welcome", label: "Welcome" },
  { value: "re_engagement", label: "Re-engagement" },
];

export const TRIGGER_EVENT_OPTIONS = [
  { value: "", label: "Manual enrollment only" },
  { value: "lead_created", label: "Lead created" },
  { value: "quote_sent", label: "Quote sent" },
  { value: "appointment_missed", label: "Appointment missed" },
  { value: "policy_lapsed", label: "Policy lapsed" },
];

export const TEMPLATE_VARIABLE_HINTS = [
  "{{lead.firstName}}",
  "{{lead.lastName}}",
  "{{lead.email}}",
  "{{agent.name}}",
  "{{agent.email}}",
];

export function formatDateTime(ts: string | null | undefined): string {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
