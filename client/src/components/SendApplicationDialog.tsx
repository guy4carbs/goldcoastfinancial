import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, Copy, Send } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { csrfHeaders } from "@/lib/queryClient";

/**
 * Self-contained Send Application / Invite Member dialog.
 *
 * Single source of truth shared between:
 *   - HCMS Command Center "Send Application" CTA
 *   - Founders Lounge Access "Invite Member" CTA
 *
 * Owns its own state, fetches uplines from /api/hcms/hierarchy/uplines, and
 * POSTs to /api/apply/invite. Resets fully on close so reopening is fresh.
 */

interface Upline {
  id: string;
  firstName: string;
  lastName: string;
  /** Server-resolved display label. */
  displayName?: string;
  email?: string;
  role?: string;
  contractLevel: number;
  title?: string;
}

const LEGAL_ENTITY_NAME = "Gold Coast Financial Partners LLC";

// Single source of truth for the role-seniority order. Mirrors
// `ROLE_HIERARCHY` in `server/types/permissions.ts:17` — keep in sync.
// Lower index = more senior. Used for the inviter-authority gate so an
// inviter can only invite roles at or below their own seniority.
const ROLE_SENIORITY: ReadonlyArray<string> = [
  "founder",
  "owner",
  "system_admin",
  "director",
  "agency_manager",
  "manager",
  "sales_agent",
  "marketing_staff",
  "client",
  "investor",
];

function isAtLeastSenior(viewerRole: string | undefined | null, candidateRole: string): boolean {
  if (!viewerRole) return false;
  const vi = ROLE_SENIORITY.indexOf(viewerRole);
  const ci = ROLE_SENIORITY.indexOf(candidateRole);
  return vi >= 0 && ci >= 0 && vi <= ci;
}

// Full role catalog shown in the Role dropdown. Hierarchy roles get an
// upline + contract level on invite; non-hierarchy roles (system_admin,
// marketing_staff, client, investor) only need a user record. Founder-only
// roles can only be invited by an existing founder — owners cannot promote
// peers/superiors.
interface RoleOption {
  value: string;
  label: string;
  hint: string;
  /** True for production/staff roles that participate in the hierarchy. */
  requiresHierarchy: boolean;
  /** True for roles that only a founder can invite (founder, owner). */
  founderOnly: boolean;
}

const ROLE_OPTIONS: ReadonlyArray<RoleOption> = [
  { value: "founder",        label: "Founder",         hint: "Top-tier authority. Founder-only invite.",       requiresHierarchy: true,  founderOnly: true  },
  { value: "owner",          label: "Owner",           hint: "Co-equal top tier. Founder-only invite.",        requiresHierarchy: true,  founderOnly: true  },
  { value: "system_admin",   label: "System Admin",    hint: "Operational admin. Not part of the hierarchy.",  requiresHierarchy: false, founderOnly: false },
  { value: "director",       label: "Director",        hint: "Executive tier. Multi-region oversight.",        requiresHierarchy: true,  founderOnly: false },
  { value: "agency_manager", label: "Agency Manager",  hint: "Multi-team management.",                         requiresHierarchy: true,  founderOnly: false },
  { value: "manager",        label: "Manager",         hint: "Team lead. Earns overrides on downline.",        requiresHierarchy: true,  founderOnly: false },
  { value: "sales_agent",    label: "Sales Agent",     hint: "Writes business. Can recruit downline + earn overrides.", requiresHierarchy: true, founderOnly: false },
  { value: "marketing_staff",label: "Marketing Staff", hint: "Marketing team. Not part of the hierarchy.",     requiresHierarchy: false, founderOnly: false },
  { value: "client",         label: "Client",          hint: "External customer. No upline.",                  requiresHierarchy: false, founderOnly: false },
  { value: "investor",       label: "Investor",        hint: "External investor. No upline.",                  requiresHierarchy: false, founderOnly: false },
];

function roleLabel(value: string): string {
  return ROLE_OPTIONS.find((r) => r.value === value)?.label ?? "Sales Agent";
}

function roleRequiresHierarchy(value: string): boolean {
  return ROLE_OPTIONS.find((r) => r.value === value)?.requiresHierarchy ?? false;
}

function uplineLabel(u: Upline): string {
  // Always show the real person's name. The owner/120%-rewrite to the legal
  // entity name made every founder collapse to "Gold Coast Financial
  // Partners LLC" — unselectable when multiple founders exist. Real name
  // first; falls back to email if both first+last are blank.
  const name = u.displayName || `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
  return name || u.email || LEGAL_ENTITY_NAME;
}

interface SentInfo {
  name: string;
  email: string;
  url: string;
  emailSent: boolean;
  contractLevel: string;
  uplineName: string;
}

export interface SendApplicationDialogProps {
  open: boolean;
  onClose: () => void;
  /** Override the modal title (defaults to "Send Application"). */
  title?: string;
  /** Override the subtitle copy. */
  subtitle?: string;
}

export function SendApplicationDialog({
  open,
  onClose,
  title = "Send Application",
  subtitle = "Send the contracting application link to a prospective agent via email.",
}: SendApplicationDialogProps) {
  const { user } = useAuth();
  const inviterRole = user?.role;
  const isFounderInviter = inviterRole === "founder";
  // Filter the dropdown to roles the inviter is allowed to grant.
  // - founder/owner are gated to founder-only inviters
  // - everything else uses seniority order so a manager can't grant director, etc.
  const visibleRoleOptions = useMemo(() => {
    return ROLE_OPTIONS.filter((opt) => {
      if (opt.founderOnly && !isFounderInviter) return false;
      return isAtLeastSenior(inviterRole, opt.value);
    });
  }, [inviterRole, isFounderInviter]);

  const [sendFirst, setSendFirst] = useState("");
  const [sendLast, setSendLast] = useState("");
  const [sendEmail, setSendEmail] = useState("");
  const [sendPhone, setSendPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [sentInfo, setSentInfo] = useState<SentInfo | null>(null);
  const [uplines, setUplines] = useState<Upline[]>([]);
  const [sendUpline, setSendUpline] = useState("");
  const [sendContract, setSendContract] = useState("");
  const [sendRole, setSendRole] = useState<string>("sales_agent");
  const [uplineOpen, setUplineOpen] = useState(false);
  const [contractOpen, setContractOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const isHierarchyRole = roleRequiresHierarchy(sendRole);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [copied, setCopied] = useState(false);
  const sendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applicationUrl =
    typeof window !== "undefined" ? `${window.location.origin}/apply` : "/apply";

  useEffect(() => {
    if (!open) return;
    fetch("/api/hcms/hierarchy/uplines", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setUplines(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (open) return;
    if (sendTimerRef.current) {
      clearTimeout(sendTimerRef.current);
      sendTimerRef.current = null;
    }
    setSent(false);
    setSentInfo(null);
    setSendError("");
    setSendFirst("");
    setSendLast("");
    setSendEmail("");
    setSendPhone("");
    setSendUpline("");
    setSendContract("");
    setSendRole("sales_agent");
    setUplineOpen(false);
    setContractOpen(false);
    setRoleOpen(false);
  }, [open]);

  if (!open) return null;

  const inputStyle: React.CSSProperties = {
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
  const labelStyle: React.CSSProperties = {
    fontSize: "var(--gc-text-xs)",
    letterSpacing: "var(--gc-tracking-wider)",
    textTransform: "uppercase",
    color: "var(--gc-text-muted)",
    display: "block",
    marginBottom: "var(--gc-space-1)",
  };
  const canSend = Boolean(
    sendFirst.trim() &&
      sendLast.trim() &&
      sendEmail.trim() &&
      sendRole &&
      (!isHierarchyRole || (sendUpline && sendContract)),
  );

  const submit = async () => {
    setSending(true);
    setSendError("");
    try {
      const resp = await fetch("/api/apply/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        credentials: "include",
        body: JSON.stringify({
          firstName: sendFirst,
          lastName: sendLast,
          email: sendEmail,
          phone: sendPhone || undefined,
          role: sendRole,
          ...(isHierarchyRole && {
            uplineId: sendUpline,
            contractLevel: parseInt(sendContract),
          }),
        }),
      });
      const data = await resp.json();
      if (resp.ok) {
        const selectedUpline = uplines.find((u) => u.id === sendUpline);
        setSentInfo({
          name: `${sendFirst} ${sendLast}`,
          email: sendEmail,
          url: data.applicationUrl || "",
          emailSent: data.emailSent !== false,
          contractLevel: sendContract,
          uplineName: selectedUpline ? uplineLabel(selectedUpline) : "",
        });
        setSent(true);
      } else {
        setSendError(data.error || "Failed to send invitation");
      }
    } catch {
      setSendError("Network error");
    }
    setSending(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 480,
          maxWidth: "95vw",
          backgroundColor: "var(--gc-surface)",
          border: "1px solid var(--gc-border)",
          borderRadius: "var(--gc-radius-md)",
          padding: "var(--gc-space-6)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--gc-font-display)",
            fontSize: "var(--gc-text-xl)",
            color: "var(--gc-text-primary)",
            marginBottom: "var(--gc-space-2)",
          }}
        >
          {title}
        </div>
        <p
          style={{
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-sm)",
            color: "var(--gc-text-secondary)",
            marginBottom: "var(--gc-space-4)",
          }}
        >
          {subtitle}
        </p>

        {sendError && (
          <div
            className="flex items-center gap-2 mb-3"
            style={{
              padding: "var(--gc-space-2) var(--gc-space-3)",
              backgroundColor:
                "color-mix(in srgb, var(--gc-status-terminated) 10%, transparent)",
              border:
                "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)",
              borderRadius: "var(--gc-radius-sm)",
            }}
          >
            <AlertTriangle
              className="w-3.5 h-3.5"
              style={{ color: "var(--gc-status-terminated)" }}
            />
            <span
              style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-terminated)" }}
            >
              {sendError}
            </span>
          </div>
        )}

        {sent && sentInfo ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <Check className="w-10 h-10" style={{ color: "var(--gc-status-active)" }} />
            <div
              style={{
                fontFamily: "var(--gc-font-display)",
                fontSize: "var(--gc-text-lg)",
                color: "var(--gc-text-primary)",
              }}
            >
              Application Sent!
            </div>
            <div
              style={{
                fontSize: "var(--gc-text-sm)",
                color: "var(--gc-text-secondary)",
              }}
            >
              {sentInfo.emailSent
                ? `Email sent to ${sentInfo.name} at ${sentInfo.email}`
                : `Invitation created for ${sentInfo.name} — email delivery failed. Share the link below manually.`}
            </div>
            <div
              style={{
                fontSize: "var(--gc-text-xs)",
                color: "var(--gc-text-muted)",
                marginTop: 4,
              }}
            >
              Contract Level: {sentInfo.contractLevel}% · Upline: {sentInfo.uplineName}
            </div>
            <div
              style={{
                marginTop: "var(--gc-space-2)",
                padding: "var(--gc-space-3)",
                backgroundColor: "var(--gc-surface-2)",
                borderRadius: "var(--gc-radius-sm)",
                width: "100%",
              }}
            >
              <div
                style={{
                  fontSize: "var(--gc-text-xs)",
                  letterSpacing: "var(--gc-tracking-wider)",
                  textTransform: "uppercase",
                  color: "var(--gc-text-muted)",
                  marginBottom: "var(--gc-space-2)",
                }}
              >
                Application Link
              </div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={sentInfo.url}
                  style={{
                    flex: 1,
                    padding: "var(--gc-space-2) var(--gc-space-3)",
                    backgroundColor: "var(--gc-surface)",
                    border: "1px solid var(--gc-border)",
                    borderRadius: "var(--gc-radius-sm)",
                    color: "var(--gc-text-primary)",
                    fontFamily: "monospace",
                    fontSize: "var(--gc-text-xs)",
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sentInfo.url);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1"
                  style={{
                    padding: "var(--gc-space-1) var(--gc-space-3)",
                    backgroundColor: "var(--gc-surface)",
                    border: "1px solid var(--gc-border)",
                    borderRadius: "var(--gc-radius-sm)",
                    color: copied
                      ? "var(--gc-status-active)"
                      : "var(--gc-text-secondary)",
                    cursor: "pointer",
                    fontSize: "var(--gc-text-sm)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                marginTop: "var(--gc-space-2)",
                padding: "var(--gc-space-2) var(--gc-space-4)",
                backgroundColor: "var(--gc-surface)",
                color: "var(--gc-text-secondary)",
                borderRadius: "var(--gc-radius-sm)",
                border: "1px solid var(--gc-border)",
                cursor: "pointer",
                fontSize: "var(--gc-text-sm)",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>First Name *</label>
                  <input
                    value={sendFirst}
                    onChange={(e) => setSendFirst(e.target.value)}
                    placeholder="First name"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last Name *</label>
                  <input
                    value={sendLast}
                    onChange={(e) => setSendLast(e.target.value)}
                    placeholder="Last name"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input
                  value={sendEmail}
                  onChange={(e) => setSendEmail(e.target.value)}
                  placeholder="agent@email.com"
                  type="email"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  Phone Number{" "}
                  <span style={{ opacity: 0.5, textTransform: "none" }}>optional</span>
                </label>
                <input
                  value={sendPhone}
                  onChange={(e) => setSendPhone(e.target.value)}
                  placeholder="(312) 555-0100"
                  style={inputStyle}
                />
              </div>
              <div style={{ position: "relative" }}>
                <label style={labelStyle}>Role *</label>
                <div
                  onClick={() => {
                    setRoleOpen(!roleOpen);
                    setUplineOpen(false);
                    setContractOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "var(--gc-space-2) var(--gc-space-3)",
                    backgroundColor: "var(--gc-surface-2)",
                    border: `1px solid ${roleOpen ? "var(--gc-gold)" : "var(--gc-border)"}`,
                    borderRadius: "var(--gc-radius-sm)",
                    color: "var(--gc-text-primary)",
                    fontFamily: "var(--gc-font-body)",
                    fontSize: "var(--gc-text-md)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{roleLabel(sendRole)}</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--gc-text-muted)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      flexShrink: 0,
                      transform: roleOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s",
                    }}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
                {roleOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 4px)",
                      left: 0,
                      right: 0,
                      zIndex: 60,
                      backgroundColor: "var(--gc-surface)",
                      border: "1px solid var(--gc-border)",
                      borderRadius: "var(--gc-radius-sm)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                      maxHeight: 280,
                      overflowY: "auto",
                      overscrollBehavior: "contain",
                    }}
                  >
                    {visibleRoleOptions.map((opt) => (
                      <div
                        key={opt.value}
                        onClick={() => {
                          setSendRole(opt.value);
                          // If switching to a non-hierarchy role, clear any
                          // stale upline/contract selections. Otherwise the
                          // POST body shape and validator stay clean.
                          if (!opt.requiresHierarchy) {
                            setSendUpline("");
                            setSendContract("");
                          }
                          setRoleOpen(false);
                        }}
                        style={{
                          padding: "var(--gc-space-2) var(--gc-space-3)",
                          cursor: "pointer",
                          backgroundColor:
                            sendRole === opt.value ? "var(--gc-surface-2)" : "transparent",
                          borderBottom: "1px solid var(--gc-border-subtle)",
                        }}
                        onMouseEnter={(e) => {
                          if (sendRole !== opt.value)
                            e.currentTarget.style.backgroundColor =
                              "var(--gc-hover-overlay)";
                        }}
                        onMouseLeave={(e) => {
                          if (sendRole !== opt.value)
                            e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <div
                          style={{
                            color: "var(--gc-text-primary)",
                            fontSize: "var(--gc-text-md)",
                            fontFamily: "var(--gc-font-body)",
                          }}
                        >
                          {opt.label}
                        </div>
                        <div
                          style={{
                            color: "var(--gc-text-muted)",
                            fontSize: "var(--gc-text-xs)",
                            marginTop: 2,
                          }}
                        >
                          {opt.hint}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {isHierarchyRole && (
              <div className="grid grid-cols-2 gap-3">
                <div style={{ position: "relative" }}>
                  <label style={labelStyle}>Upline *</label>
                  <div
                    onClick={() => {
                      setUplineOpen(!uplineOpen);
                      setContractOpen(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "var(--gc-space-2) var(--gc-space-3)",
                      backgroundColor: "var(--gc-surface-2)",
                      border: `1px solid ${uplineOpen ? "var(--gc-gold)" : "var(--gc-border)"}`,
                      borderRadius: "var(--gc-radius-sm)",
                      color: sendUpline
                        ? "var(--gc-text-primary)"
                        : "var(--gc-text-muted)",
                      fontFamily: "var(--gc-font-body)",
                      fontSize: "var(--gc-text-md)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {(() => {
                        const u = uplines.find((u) => u.id === sendUpline);
                        return u ? `${uplineLabel(u)} (${u.contractLevel}%)` : "Select upline...";
                      })()}
                    </span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--gc-text-muted)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        flexShrink: 0,
                        transform: uplineOpen ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s",
                      }}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                  {uplineOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        right: 0,
                        zIndex: 60,
                        backgroundColor: "var(--gc-surface)",
                        border: "1px solid var(--gc-border)",
                        borderRadius: "var(--gc-radius-sm)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                        maxHeight: 200,
                        overflowY: "auto",
                      }}
                    >
                      {uplines.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => {
                            setSendUpline(u.id);
                            setSendContract("");
                            setUplineOpen(false);
                          }}
                          style={{
                            padding: "var(--gc-space-2) var(--gc-space-3)",
                            cursor: "pointer",
                            color: "var(--gc-text-primary)",
                            fontSize: "var(--gc-text-md)",
                            fontFamily: "var(--gc-font-body)",
                            backgroundColor:
                              sendUpline === u.id ? "var(--gc-surface-2)" : "transparent",
                            borderBottom: "1px solid var(--gc-border-subtle)",
                          }}
                          onMouseEnter={(e) => {
                            if (sendUpline !== u.id)
                              e.currentTarget.style.backgroundColor =
                                "var(--gc-hover-overlay)";
                          }}
                          onMouseLeave={(e) => {
                            if (sendUpline !== u.id)
                              e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          {uplineLabel(u)} ({u.contractLevel}%)
                        </div>
                      ))}
                      {uplines.length === 0 && (
                        <div
                          style={{
                            padding: "var(--gc-space-3)",
                            color: "var(--gc-text-muted)",
                            fontSize: "var(--gc-text-sm)",
                            textAlign: "center",
                          }}
                        >
                          No uplines available
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ position: "relative" }}>
                  <label style={labelStyle}>Commission Level *</label>
                  <div
                    onClick={() => {
                      if (sendUpline) {
                        setContractOpen(!contractOpen);
                        setUplineOpen(false);
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "var(--gc-space-2) var(--gc-space-3)",
                      backgroundColor: "var(--gc-surface-2)",
                      border: `1px solid ${contractOpen ? "var(--gc-gold)" : "var(--gc-border)"}`,
                      borderRadius: "var(--gc-radius-sm)",
                      color: sendContract
                        ? "var(--gc-text-primary)"
                        : "var(--gc-text-muted)",
                      fontFamily: "var(--gc-font-body)",
                      fontSize: "var(--gc-text-md)",
                      cursor: sendUpline ? "pointer" : "not-allowed",
                      opacity: sendUpline ? 1 : 0.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{sendContract ? `${sendContract}%` : "Select level..."}</span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--gc-text-muted)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        flexShrink: 0,
                        transform: contractOpen ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s",
                      }}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                  {contractOpen &&
                    sendUpline &&
                    (() => {
                      const upline = uplines.find((u) => u.id === sendUpline);
                      if (!upline) return null;
                      const maxLevel = upline.contractLevel - 5;
                      const levels: number[] = [];
                      for (let i = maxLevel; i >= 5; i -= 5) levels.push(i);
                      return (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 4px)",
                            left: 0,
                            right: 0,
                            zIndex: 60,
                            backgroundColor: "var(--gc-surface)",
                            border: "1px solid var(--gc-border)",
                            borderRadius: "var(--gc-radius-sm)",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                            maxHeight: 200,
                            overflowY: "auto",
                          }}
                        >
                          {levels.map((l) => (
                            <div
                              key={l}
                              onClick={() => {
                                setSendContract(String(l));
                                setContractOpen(false);
                              }}
                              style={{
                                padding: "var(--gc-space-2) var(--gc-space-3)",
                                cursor: "pointer",
                                color: "var(--gc-text-primary)",
                                fontSize: "var(--gc-text-md)",
                                fontFamily: "var(--gc-font-body)",
                                backgroundColor:
                                  sendContract === String(l)
                                    ? "var(--gc-surface-2)"
                                    : "transparent",
                                borderBottom: "1px solid var(--gc-border-subtle)",
                              }}
                              onMouseEnter={(e) => {
                                if (sendContract !== String(l))
                                  e.currentTarget.style.backgroundColor =
                                    "var(--gc-hover-overlay)";
                              }}
                              onMouseLeave={(e) => {
                                if (sendContract !== String(l))
                                  e.currentTarget.style.backgroundColor = "transparent";
                              }}
                            >
                              {l}%
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                </div>
              </div>
              )}
            </div>
            <div
              style={{
                padding: "var(--gc-space-3)",
                backgroundColor: "var(--gc-surface-2)",
                borderRadius: "var(--gc-radius-sm)",
                marginBottom: "var(--gc-space-4)",
              }}
            >
              <div
                style={{
                  fontSize: "var(--gc-text-xs)",
                  letterSpacing: "var(--gc-tracking-wider)",
                  textTransform: "uppercase",
                  color: "var(--gc-text-muted)",
                  marginBottom: "var(--gc-space-2)",
                }}
              >
                Or copy application link
              </div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={applicationUrl}
                  style={{
                    flex: 1,
                    padding: "var(--gc-space-2) var(--gc-space-3)",
                    backgroundColor: "var(--gc-surface)",
                    border: "1px solid var(--gc-border)",
                    borderRadius: "var(--gc-radius-sm)",
                    color: "var(--gc-text-primary)",
                    fontFamily: "monospace",
                    fontSize: "var(--gc-text-sm)",
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(applicationUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1"
                  style={{
                    padding: "var(--gc-space-2) var(--gc-space-3)",
                    backgroundColor: "var(--gc-surface)",
                    border: "1px solid var(--gc-border)",
                    borderRadius: "var(--gc-radius-sm)",
                    color: copied
                      ? "var(--gc-status-active)"
                      : "var(--gc-text-secondary)",
                    cursor: "pointer",
                    fontSize: "var(--gc-text-sm)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={onClose}
                style={{
                  padding: "var(--gc-space-2) var(--gc-space-4)",
                  backgroundColor: "var(--gc-surface)",
                  color: "var(--gc-text-secondary)",
                  borderRadius: "var(--gc-radius-sm)",
                  border: "1px solid var(--gc-border)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={!canSend || sending}
                className="flex items-center gap-2"
                style={{
                  padding: "var(--gc-space-2) var(--gc-space-4)",
                  backgroundColor: "var(--gc-btn-primary-bg)",
                  color: "var(--gc-btn-primary-text)",
                  borderRadius: "var(--gc-radius-sm)",
                  border: "none",
                  cursor: canSend && !sending ? "pointer" : "not-allowed",
                  fontWeight: 500,
                  opacity: canSend && !sending ? 1 : 0.5,
                }}
              >
                <Send className="w-3.5 h-3.5" /> {sending ? "Sending..." : "Send Email"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
