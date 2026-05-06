import { useEffect } from "react";
import {
  X,
  Phone,
  Mail,
  MapPin,
  Upload,
  Activity,
  ArrowLeft,
  Globe,
  FileText,
  User,
} from "lucide-react";
import { useGCTheme, GCStatusBadge, GCPrimaryButton } from "@/components/gc";

/**
 * LeadDetailDrawer — single-source lead detail panel for Founders, Manager,
 * and Agent lounges. Layout matches Heritage's lead detail view (hero header
 * → contact card → lead details card → assignment history → pipeline stepper
 * → activity CTA), reskinned with GC tokens to match the rest of the lounge.
 *
 * Visual contract — every surface, accent, and CTA goes through GC tokens:
 *   - Hero: `--gc-surface` with sticky position, platinum icon tile, gold
 *     accent underline, GCStatusBadge for status.
 *   - Cards: `--gc-surface` border + radius-md + padding-4.
 *   - Section labels: GC uppercase muted (mirrors `GC_FORM_LABEL`).
 *   - Primary CTA: GCPrimaryButton (solid gold, no gradient).
 */

export interface LeadAssignmentEvent {
  /** Imported via batch, distributed to manager, claimed by agent, etc. */
  label: string;
  /** ISO timestamp or formatted date — rendered as-is. */
  date: string;
  /** Optional icon override (defaults to Upload). */
  icon?: "upload" | "globe" | "file";
}

export interface LeadDetail {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  addressLine?: string | null;
  source?: string | null;
  sourceId?: string | null;
  product?: string | null;
  coverageType?: string | null;
  coverageAmount?: string | null;
  priority?: "low" | "medium" | "high" | "urgent" | string | null;
  status?: string | null;
  estimatedValue?: number | null;
  leadScore?: number | null;
  leadScoreTier?: "cold" | "warm" | "hot" | "on_fire" | string | null;
  pipelineStage?: string | null;
  notes?: string | null;
  assignmentHistory?: LeadAssignmentEvent[];
  /**
   * Underwriting / enrichment context — quote_form submissions populate this
   * on the heritage-app side via the `enrichment_data` JSONB column. Founders
   * and agents read it here to see DOB, height, weight, medical background,
   * etc. without re-asking the lead.
   */
  enrichmentData?: {
    addressLine2?: string | null;
    birthDate?: string | null;
    age?: number | null;
    height?: string | null;
    heightFeet?: number | null;
    heightInches?: number | null;
    weight?: number | string | null;
    gender?: string | null;
    tobacco?: boolean | null;
    medicalBackground?: string | null;
    quoteRequestId?: number | string | null;
    submittedAt?: string | null;
    [k: string]: any;
  } | null;
}

const PRIORITY_ACCENT: Record<string, string> = {
  urgent: "var(--gc-status-warning)",
  high: "var(--gc-status-pending)",
  medium: "var(--gc-status-review)",
  low: "var(--gc-text-muted)",
};

const TIER_ACCENT: Record<string, string> = {
  on_fire: "var(--gc-status-warning)",
  hot: "var(--gc-status-pending)",
  warm: "var(--gc-status-review)",
  cold: "var(--gc-text-muted)",
};

const PIPELINE_STAGES = [
  "new",
  "contacted",
  "qualified",
  "appt_set",
  "quoted",
  "application",
  "underwriting",
  "issued",
  "placed",
  "lost",
] as const;

const STAGE_LABEL: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  appt_set: "Appt Set",
  quoted: "Quoted",
  application: "Application",
  underwriting: "Underwriting",
  issued: "Issued",
  placed: "Placed",
  lost: "Lost",
};

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

function formatSource(s?: string | null): string {
  if (!s) return "—";
  if (s === "web_form") return "Website";
  if (s === "csv_import" || s === "csv") return "CSV Import";
  if (s === "cold_list") return "Cold List";
  return s
    .split(/[_\s]+/)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

function statusToBadge(s?: string | null): string {
  if (!s) return "pending";
  if (s === "in_pool") return "review";
  if (s === "distributed") return "active";
  if (s === "lost") return "terminated";
  if (s === "won") return "active";
  return s;
}

function titleCase(s?: string | null): string {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function LeadDetailDrawer({
  open,
  lead,
  onClose,
  onViewTimeline,
}: {
  open: boolean;
  lead: LeadDetail | null;
  onClose: () => void;
  onViewTimeline?: (lead: LeadDetail) => void;
}) {
  const { theme } = useGCTheme();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !lead) return null;

  const initials = `${lead.firstName?.[0] || ""}${lead.lastName?.[0] || ""}`.toUpperCase();
  const fullName = `${lead.firstName} ${lead.lastName}`.trim();
  const location = [lead.city, lead.state].filter(Boolean).join(", ");
  const priorityKey = (lead.priority || "medium").toLowerCase();
  const priorityColor = PRIORITY_ACCENT[priorityKey] || PRIORITY_ACCENT.medium;
  const tierKey = (lead.leadScoreTier || "cold").toLowerCase();
  const tierColor = TIER_ACCENT[tierKey] || TIER_ACCENT.cold;
  const score = Math.max(0, Math.min(100, lead.leadScore ?? 0));
  const stageIndex = lead.pipelineStage
    ? Math.max(0, PIPELINE_STAGES.indexOf(lead.pipelineStage as (typeof PIPELINE_STAGES)[number]))
    : 0;

  return (
    <div
      data-theme={theme}
      className="fixed inset-0 z-50 flex"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div className="flex-1" />
      <div
        data-theme={theme}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560,
          maxWidth: "100vw",
          height: "100vh",
          overflowY: "auto",
          backgroundColor: "var(--gc-bg)",
          borderLeft: "1px solid var(--gc-border)",
          fontFamily: "var(--gc-font-body)",
          color: "var(--gc-text-primary)",
        }}
      >
        {/* ─── HERO HEADER (sticky GC surface, gold accent underline) ─── */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            padding: "var(--gc-space-6)",
            backgroundColor: "var(--gc-surface)",
            borderBottom: "1px solid var(--gc-border)",
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center"
            style={{
              position: "absolute",
              top: "var(--gc-space-4)",
              right: "var(--gc-space-4)",
              background: "none",
              border: "none",
              borderRadius: "var(--gc-radius-sm)",
              width: 28,
              height: 28,
              cursor: "pointer",
              color: "var(--gc-text-muted)",
              padding: 0,
            }}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center"
              style={{
                width: 56,
                height: 56,
                borderRadius: "var(--gc-radius-md)",
                backgroundColor: "var(--gc-surface-2)",
                border: "1px solid var(--gc-border)",
                color: "var(--gc-gold)",
                flexShrink: 0,
              }}
            >
              {initials ? (
                <span
                  style={{
                    fontFamily: "var(--gc-font-display)",
                    fontSize: "var(--gc-text-lg)",
                    fontWeight: 600,
                  }}
                >
                  {initials}
                </span>
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div
                style={{
                  fontFamily: "var(--gc-font-display)",
                  fontSize: "var(--gc-text-xl)",
                  color: "var(--gc-text-primary)",
                  letterSpacing: "var(--gc-tracking-tight)",
                  lineHeight: 1.15,
                }}
              >
                {fullName}
              </div>
              {location && (
                <div
                  style={{
                    fontSize: "var(--gc-text-sm)",
                    color: "var(--gc-text-muted)",
                    marginTop: 2,
                  }}
                >
                  {location}
                </div>
              )}
            </div>
          </div>

          {/* Gold accent underline — matches GCPageHeader accentUnderline pattern */}
          <div
            style={{
              height: 2,
              width: 96,
              background:
                "linear-gradient(90deg, var(--gc-gold) 0%, var(--gc-gold-bright) 100%)",
              marginTop: "var(--gc-space-4)",
              marginBottom: "var(--gc-space-4)",
              borderRadius: "var(--gc-radius-full)",
            }}
          />

          <div className="grid grid-cols-4 gap-3">
            <HeroStat label="Product" value={lead.product || lead.coverageType || "—"} />
            <HeroStat
              label="Est. Value"
              value={
                typeof lead.estimatedValue === "number"
                  ? formatCurrency(lead.estimatedValue)
                  : "—"
              }
              accent
            />
            <div>
              <div style={heroStatValueStyle}>
                <GCStatusBadge status={statusToBadge(lead.status)} />
              </div>
              <FieldLabel>Status</FieldLabel>
            </div>
            <HeroStat
              label="Priority"
              value={titleCase(lead.priority)}
              valueColor={priorityColor}
            />
          </div>
        </div>

        {/* ─── BODY ─── */}
        <div style={{ padding: "var(--gc-space-6)" }}>
          <button
            onClick={onClose}
            className="flex items-center gap-1 mb-4"
            style={{
              background: "none",
              border: "none",
              color: "var(--gc-text-muted)",
              fontSize: "var(--gc-text-sm)",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to leads
          </button>

          {/* Contact Information */}
          <Card title="Contact Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ContactRow
                icon={<Phone className="w-3.5 h-3.5" />}
                label="Phone"
                value={lead.phone || "—"}
              />
              <ContactRow
                icon={<Mail className="w-3.5 h-3.5" />}
                label="Email"
                value={lead.email || "—"}
              />
              <ContactRow
                icon={<MapPin className="w-3.5 h-3.5" />}
                label="Address"
                value={lead.addressLine || location || "—"}
              />
            </div>
          </Card>

          {/* Lead Details */}
          <Card
            title="Lead Details"
            right={
              typeof lead.estimatedValue === "number" ? (
                <span
                  style={{
                    fontFamily: "var(--gc-font-display)",
                    fontSize: "var(--gc-text-xl)",
                    color: "var(--gc-gold)",
                    letterSpacing: "var(--gc-tracking-tight)",
                  }}
                >
                  {formatCurrency(lead.estimatedValue)}
                </span>
              ) : null
            }
          >
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <DetailField label="Source" value={formatSource(lead.source)} />
              <div>
                <FieldLabel>Lead Score</FieldLabel>
                <div className="flex items-center gap-3 mt-1">
                  <span
                    style={{
                      fontFamily: "var(--gc-font-display)",
                      fontSize: "var(--gc-text-lg)",
                      color: "var(--gc-text-primary)",
                      lineHeight: 1,
                    }}
                  >
                    {score}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      borderRadius: "var(--gc-radius-full)",
                      backgroundColor: "var(--gc-surface-2)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${score}%`,
                        height: "100%",
                        backgroundColor: tierColor,
                        borderRadius: "var(--gc-radius-full)",
                      }}
                    />
                  </div>
                </div>
              </div>
              <DetailField
                label="Product"
                value={lead.product || "—"}
                valueColor="var(--gc-gold)"
              />
              <DetailField label="Coverage Type" value={lead.coverageType || "—"} />
              <DetailField
                label="Priority"
                value={titleCase(lead.priority)}
                valueColor={priorityColor}
              />
              <DetailField
                label="Score Tier"
                value={(lead.leadScoreTier || "—").replace(/_/g, " ")}
                valueColor={tierColor}
                capitalize
              />
            </div>
          </Card>

          {/* Address (full block, including line 2 + zip) */}
          {(lead.streetAddress || lead.zipCode || lead.enrichmentData?.addressLine2) && (
            <Card title="Mailing Address">
              <div className="grid grid-cols-2 gap-3">
                <DetailField label="Street" value={lead.streetAddress || "—"} />
                <DetailField label="Apt / Unit" value={lead.enrichmentData?.addressLine2 || "—"} />
                <DetailField label="City" value={lead.city || "—"} />
                <DetailField label="State" value={lead.state || "—"} />
                <DetailField label="Zip" value={lead.zipCode || "—"} />
              </div>
            </Card>
          )}

          {/* Underwriting Info — quote-form intake */}
          {lead.enrichmentData &&
            (lead.enrichmentData.birthDate ||
              lead.enrichmentData.height ||
              lead.enrichmentData.weight ||
              lead.enrichmentData.medicalBackground ||
              lead.enrichmentData.gender ||
              lead.enrichmentData.tobacco !== undefined) && (
              <Card title="Underwriting Info (from quote form)">
                <div className="grid grid-cols-2 gap-3">
                  <DetailField label="Date of Birth" value={lead.enrichmentData.birthDate || "—"} />
                  <DetailField
                    label="Age"
                    value={
                      typeof lead.enrichmentData.age === "number"
                        ? String(lead.enrichmentData.age)
                        : "—"
                    }
                  />
                  <DetailField label="Height" value={lead.enrichmentData.height || "—"} />
                  <DetailField
                    label="Weight"
                    value={
                      lead.enrichmentData.weight != null
                        ? `${lead.enrichmentData.weight} lbs`
                        : "—"
                    }
                  />
                  <DetailField label="Gender" value={lead.enrichmentData.gender || "—"} capitalize />
                  <DetailField
                    label="Tobacco (last 12 mo)"
                    value={
                      lead.enrichmentData.tobacco === true
                        ? "Yes"
                        : lead.enrichmentData.tobacco === false
                          ? "No"
                          : "—"
                    }
                  />
                </div>
                {lead.enrichmentData.medicalBackground && (
                  <div className="mt-4">
                    <div
                      style={{
                        fontFamily: "var(--gc-font-body)",
                        fontSize: "var(--gc-text-xs)",
                        fontWeight: 500,
                        letterSpacing: "var(--gc-tracking-wider)",
                        textTransform: "uppercase",
                        color: "var(--gc-text-muted)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Medical Background
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--gc-font-body)",
                        fontSize: "var(--gc-text-sm)",
                        color: "var(--gc-text-primary)",
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.5,
                      }}
                    >
                      {lead.enrichmentData.medicalBackground}
                    </div>
                  </div>
                )}
                {lead.enrichmentData.quoteRequestId && (
                  <div className="mt-3" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>
                    Originating quote request: #{lead.enrichmentData.quoteRequestId}
                  </div>
                )}
              </Card>
            )}

          {/* Notes */}
          {lead.notes && (
            <Card title="Notes">
              <div
                style={{
                  fontFamily: "var(--gc-font-body)",
                  fontSize: "var(--gc-text-sm)",
                  color: "var(--gc-text-primary)",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5,
                }}
              >
                {lead.notes}
              </div>
            </Card>
          )}

          {/* Assignment History */}
          {(lead.assignmentHistory?.length || 0) > 0 && (
            <Card title="Assignment History">
              <div className="flex flex-col gap-3">
                {lead.assignmentHistory!.map((evt, i) => {
                  const Icon =
                    evt.icon === "globe"
                      ? Globe
                      : evt.icon === "file"
                        ? FileText
                        : Upload;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "var(--gc-radius-sm)",
                          backgroundColor: "var(--gc-surface-2)",
                          color: "var(--gc-gold)",
                          flexShrink: 0,
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "var(--gc-text-sm)",
                            color: "var(--gc-text-primary)",
                          }}
                        >
                          {evt.label}
                        </div>
                        <div
                          style={{
                            fontSize: "var(--gc-text-xs)",
                            color: "var(--gc-text-muted)",
                          }}
                        >
                          {evt.date}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Pipeline Stage */}
          <Card title="Pipeline Stage">
            <div className="flex items-start justify-between" style={{ gap: 4 }}>
              {PIPELINE_STAGES.map((stage, i) => {
                const reached = i <= stageIndex;
                const current = i === stageIndex;
                return (
                  <div
                    key={stage}
                    className="flex flex-col items-center gap-2 min-w-0"
                    style={{ flex: 1 }}
                  >
                    <div
                      style={{
                        width: current ? 14 : 10,
                        height: current ? 14 : 10,
                        borderRadius: "50%",
                        backgroundColor: reached
                          ? "var(--gc-gold)"
                          : "var(--gc-surface-2)",
                        border: `2px solid ${reached ? "var(--gc-gold)" : "var(--gc-border)"}`,
                        boxShadow: current
                          ? `0 0 0 4px color-mix(in srgb, var(--gc-gold) 25%, transparent)`
                          : "none",
                        transition: "all var(--gc-transition-fast)",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "var(--gc-text-xs)",
                        color: current
                          ? "var(--gc-text-primary)"
                          : "var(--gc-text-muted)",
                        textAlign: "center",
                        fontWeight: current ? 500 : 400,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                      }}
                    >
                      {STAGE_LABEL[stage]}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* CTA — solid GC primary button to match the rest of the lounge */}
          {onViewTimeline && (
            <div className="mt-4">
              <GCPrimaryButton
                fullWidth
                onClick={() => onViewTimeline(lead)}
                icon={<Activity className="w-4 h-4" />}
              >
                View Full Activity Timeline
              </GCPrimaryButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const heroStatValueStyle: React.CSSProperties = {
  marginBottom: 4,
  display: "flex",
  alignItems: "center",
};

function HeroStat({
  label,
  value,
  valueColor,
  accent,
}: {
  label: string;
  value: string;
  valueColor?: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--gc-font-display)",
          fontSize: "var(--gc-text-lg)",
          color: accent ? "var(--gc-gold)" : valueColor || "var(--gc-text-primary)",
          lineHeight: 1.1,
          letterSpacing: "var(--gc-tracking-tight)",
        }}
      >
        {value}
      </div>
      <FieldLabel>{label}</FieldLabel>
    </div>
  );
}

function Card({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="mb-4"
      style={{
        backgroundColor: "var(--gc-surface)",
        border: "1px solid var(--gc-border)",
        borderRadius: "var(--gc-radius-md)",
        padding: "var(--gc-space-4)",
      }}
    >
      <div
        className="flex items-start justify-between"
        style={{ marginBottom: "var(--gc-space-3)" }}
      >
        <div
          style={{
            fontFamily: "var(--gc-font-display)",
            fontSize: "var(--gc-text-md)",
            color: "var(--gc-text-primary)",
            letterSpacing: "var(--gc-tracking-tight)",
          }}
        >
          {title}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <div
        className="flex items-center justify-center"
        style={{
          width: 28,
          height: 28,
          borderRadius: "var(--gc-radius-sm)",
          backgroundColor: "var(--gc-surface-2)",
          color: "var(--gc-gold)",
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <FieldLabel>{label}</FieldLabel>
        <div
          style={{
            fontSize: "var(--gc-text-sm)",
            color: "var(--gc-text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginTop: 2,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
  valueColor,
  capitalize,
}: {
  label: string;
  value: string;
  valueColor?: string;
  capitalize?: boolean;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div
        style={{
          fontSize: "var(--gc-text-sm)",
          color: valueColor || "var(--gc-text-primary)",
          marginTop: 2,
          textTransform: capitalize ? "capitalize" : "none",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "var(--gc-text-xs)",
        textTransform: "uppercase",
        letterSpacing: "var(--gc-tracking-wider)",
        color: "var(--gc-text-muted)",
        fontFamily: "var(--gc-font-body)",
      }}
    >
      {children}
    </div>
  );
}
