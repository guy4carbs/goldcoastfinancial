/**
 * SendFormationGuideModal — pick a state's formation guide recipients (hierarchy
 * agents + free-text emails), pick channels (email + in-app notification), preview
 * the rendered HTML, and POST to /api/founders/agencies/formation-guide/send.
 *
 * Pairs with:
 *   POST /api/founders/agencies/formation-guide/send
 *   POST /api/founders/agencies/formation-guide/preview
 *
 * Recipient model:
 *   - Hierarchy multi-select pulls from /api/hcms/hierarchy/flat (same source
 *     as AgencyEditModal). Selected agents can receive both email + in-app
 *     notification (if they have an email on file).
 *   - Free-text emails are comma-separated. They CANNOT receive an in-app
 *     notification (they're not registered users) — the modal disables the
 *     notification channel when only free-text emails are present.
 */
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  GCModal,
  GCPrimaryButton,
  GCSecondaryButton,
  GC_FORM_LABEL,
  GC_FORM_INPUT,
} from "@/components/gc";
import { useGCTheme } from "@/components/gc/GCThemeProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Mail, Bell, Search, X, Eye } from "lucide-react";
import { csrfHeaders } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { STATES_LIST } from "@/lib/data/llcStateGuide";

// Same simplified RFC-5322 validator the server uses.
const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

// GC-tokenised classNames for the Radix Select trigger + content. Mirrors the
// canonical pattern in HierarchyEditModal/AgencyEditModal — Tailwind arbitrary-
// value utilities (`bg-[var(...)]`) win over the shadcn defaults without
// needing `!important`. data-theme on SelectContent is mandatory because Radix
// portals the dropdown to document.body, OUTSIDE the [data-theme] scope.
const GC_SELECT_TRIGGER_CLASSES =
  "h-11 w-full bg-[var(--gc-surface)] border border-[var(--gc-border)] rounded-[var(--gc-radius-sm)] " +
  "text-[var(--gc-text-primary)] font-body text-base focus:ring-[var(--gc-gold)] focus:ring-1 focus:outline-none";
const GC_SELECT_CONTENT_CLASSES =
  "bg-[var(--gc-surface)] border border-[var(--gc-border)] rounded-[var(--gc-radius-md)] " +
  "text-[var(--gc-text-primary)] font-body shadow-[var(--gc-shadow-lg)]";
const GC_SELECT_ITEM_CLASSES =
  "py-2 cursor-pointer focus:bg-[var(--gc-surface-2)] focus:text-[var(--gc-gold)] " +
  "data-[state=checked]:text-[var(--gc-gold)] data-[state=checked]:font-medium";

interface FlatAgentRow {
  agent_user_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  hierarchy_title?: string | null;
  hierarchy_level?: number | null;
}

export interface SendFormationGuideModalProps {
  open: boolean;
  initialState: string;          // 2-letter state code, pre-filled from the tab
  onClose: () => void;
  onSent?: (result: { emailsSent: number; notificationsSent: number }) => void;
}

export function SendFormationGuideModal({
  open,
  initialState,
  onClose,
  onSent,
}: SendFormationGuideModalProps) {
  const { toast } = useToast();
  const { theme } = useGCTheme();
  const [state, setState] = useState(initialState);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [emailsRaw, setEmailsRaw] = useState("");
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [introNote, setIntroNote] = useState("");
  const [emailChannel, setEmailChannel] = useState(true);
  const [notificationChannel, setNotificationChannel] = useState(true);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Reset to initialState when the modal re-opens for a different state.
  useEffect(() => {
    if (open) {
      setState(initialState);
      setSelectedUserIds(new Set());
      setEmailsRaw("");
      setEmailErrors([]);
      setIntroNote("");
      setEmailChannel(true);
      setNotificationChannel(true);
      setError(null);
      setPreviewHtml(null);
      setPreviewOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialState]);

  const agentsQ = useQuery<FlatAgentRow[]>({
    queryKey: ["/api/hcms/hierarchy/flat"],
    enabled: open,
    staleTime: 60_000,
    retry: 1,
  });

  // Parse comma/semicolon/newline separated emails into a clean list,
  // dedup, and capture the invalid entries for inline display.
  const parsedEmails = useMemo(() => {
    const tokens = emailsRaw
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const seen = new Set<string>();
    const valid: string[] = [];
    const invalid: string[] = [];
    for (const t of tokens) {
      const lower = t.toLowerCase();
      if (seen.has(lower)) continue;
      seen.add(lower);
      if (EMAIL_RE.test(t)) valid.push(t);
      else invalid.push(t);
    }
    return { valid, invalid };
  }, [emailsRaw]);

  const handleEmailsBlur = () => {
    setEmailErrors(parsedEmails.invalid);
  };

  const filteredAgents = useMemo(() => {
    const list = agentsQ.data || [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (a) =>
        `${a.first_name} ${a.last_name}`.toLowerCase().includes(q) ||
        (a.email || "").toLowerCase().includes(q) ||
        (a.hierarchy_title || "").toLowerCase().includes(q),
    );
  }, [agentsQ.data, search]);

  // ─── Channel auto-disable logic ─────────────────────────────────────
  // If the founder has only free-text emails (zero hierarchy agents),
  // notification channel is meaningless — disable it and force off.
  const hasUserRecipients = selectedUserIds.size > 0;
  const hasEmailRecipients = parsedEmails.valid.length > 0;
  const notificationDisabled = !hasUserRecipients;
  // If no recipient has an email at all, email channel is meaningless.
  const selectedAgentsList = useMemo(
    () =>
      (agentsQ.data || []).filter((a) => selectedUserIds.has(a.agent_user_id)),
    [agentsQ.data, selectedUserIds],
  );
  const anyAgentHasEmail = selectedAgentsList.some((a) => !!a.email);
  const emailDisabled = !anyAgentHasEmail && parsedEmails.valid.length === 0;

  // Auto-correct channel state when toggles become invalid.
  useEffect(() => {
    if (notificationDisabled && notificationChannel) setNotificationChannel(false);
    if (emailDisabled && emailChannel) setEmailChannel(false);
  }, [notificationDisabled, emailDisabled, notificationChannel, emailChannel]);

  const totalRecipients =
    selectedUserIds.size + parsedEmails.valid.length;

  const toggleAgent = (id: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    setError(null);
    try {
      // Defensive: refuse to call preview with an empty/invalid state so we
      // never even hit Zod and get the misleading 400 path.
      const stateCode = (state || "").toUpperCase();
      if (!/^[A-Z]{2}$/.test(stateCode)) {
        throw new Error(`Pick a state before previewing (got "${state}").`);
      }
      const res = await fetch("/api/founders/agencies/formation-guide/preview", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        body: JSON.stringify({
          state: stateCode,
          introNote: introNote.trim() || null,
        }),
      });
      // Read as text first so we can surface non-JSON error pages instead of
      // the cryptic "The string did not match the expected pattern" Safari
      // DOMException when res.json() is called on HTML.
      const raw = await res.text();
      let parsed: any = null;
      try {
        parsed = raw ? JSON.parse(raw) : null;
      } catch {
        // non-JSON response (likely an HTML error page from the dev server)
      }
      if (!res.ok) {
        throw new Error(
          parsed?.error ||
            `Preview failed (${res.status}): ${raw.slice(0, 200) || res.statusText}`,
        );
      }
      if (!parsed || typeof parsed.html !== "string") {
        throw new Error(
          `Preview returned malformed response: ${raw.slice(0, 200) || "empty body"}`,
        );
      }
      setPreviewHtml(parsed.html);
      setPreviewOpen(true);
    } catch (e: any) {
      setError(e?.message || "Preview failed");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSend = async () => {
    if (submitting) return;
    setError(null);

    if (totalRecipients === 0) {
      setError("Pick at least one recipient.");
      return;
    }
    if (!emailChannel && !notificationChannel) {
      setError("Pick at least one channel — email or in-app notification.");
      return;
    }
    if (parsedEmails.invalid.length > 0) {
      setError(`Fix invalid emails: ${parsedEmails.invalid.join(", ")}`);
      return;
    }
    if (
      !emailChannel &&
      notificationChannel &&
      parsedEmails.valid.length > 0 &&
      selectedUserIds.size === 0
    ) {
      setError(
        "Free-text emails can only receive email — pick the email channel or remove them.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/founders/agencies/formation-guide/send", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        body: JSON.stringify({
          state,
          recipientUserIds: Array.from(selectedUserIds),
          recipientEmails: parsedEmails.valid,
          channels: { email: emailChannel, notification: notificationChannel },
          introNote: introNote.trim() || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Send failed (${res.status})`);
      }
      const result = await res.json();
      const partial = (result.errors || []).length > 0;
      toast({
        title: partial ? "Sent with some failures" : "Formation guide sent",
        description: `${result.emailsSent} email${result.emailsSent === 1 ? "" : "s"} · ${result.notificationsSent} in-app notification${result.notificationsSent === 1 ? "" : "s"}${
          partial ? ` · ${result.errors.length} failure${result.errors.length === 1 ? "" : "s"}` : ""
        }`,
        variant: partial ? "destructive" : "default",
      });
      onSent?.({
        emailsSent: result.emailsSent,
        notificationsSent: result.notificationsSent,
      });
      onClose();
    } catch (e: any) {
      setError(e?.message || "Send failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const stateName =
    STATES_LIST.find((s) => s.code === state.toUpperCase())?.name || state;

  return (
    <>
      <GCModal
        title={`Send Formation Guide — ${stateName}`}
        subtitle="Email + in-app notification. Pick agents from the hierarchy or paste free-text emails for non-users."
        onClose={onClose}
        width={680}
        icon={<Mail className="w-5 h-5" style={{ color: "var(--gc-gold)" }} />}
      >
        {/* State picker — Radix Select with portaled GC-themed popover. The
            data-theme on SelectContent is critical: Radix portals to body, so
            without it the GC token vars resolve to nothing. */}
        <div style={{ marginBottom: "var(--gc-space-4)" }}>
          <label style={GC_FORM_LABEL} htmlFor="sfg-state">State</label>
          <Select
            value={state}
            onValueChange={(v) => setState(v)}
            disabled={submitting}
          >
            <SelectTrigger id="sfg-state" className={GC_SELECT_TRIGGER_CLASSES}>
              <SelectValue placeholder="Pick a state" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              sideOffset={4}
              collisionPadding={8}
              avoidCollisions
              data-theme={theme}
              className={GC_SELECT_CONTENT_CLASSES}
              style={{ maxHeight: "var(--radix-select-content-available-height)" }}
            >
              {STATES_LIST.map((s) => (
                <SelectItem key={s.code} value={s.code} className={GC_SELECT_ITEM_CLASSES}>
                  {s.code} · {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Hierarchy multi-select */}
        <div style={{ marginBottom: "var(--gc-space-4)" }}>
          <label style={GC_FORM_LABEL}>
            Hierarchy recipients ({selectedUserIds.size} selected)
          </label>
          {/* GC-tokenised search input — matches the canonical pattern used in
              FoundersViewAs (Search icon absolute-positioned left, Input with
              pl-9). Tailwind arbitrary-value utilities override shadcn defaults
              with GC tokens (surface-2 background, border, gold focus ring). */}
          <div className="relative mb-2">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "var(--gc-text-muted)" }}
            />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents by name, email, or title…"
              disabled={submitting || agentsQ.isLoading}
              className="pl-9 h-10 bg-[var(--gc-surface-2)] border-[var(--gc-border)] text-[var(--gc-text-primary)] placeholder:text-[var(--gc-text-muted)] focus-visible:ring-1 focus-visible:ring-[var(--gc-gold)] focus-visible:ring-offset-0"
            />
          </div>
          <div
            style={{
              maxHeight: 220,
              overflowY: "auto",
              border: "1px solid var(--gc-border)",
              borderRadius: "var(--gc-radius-sm)",
              backgroundColor: "var(--gc-surface-2)",
            }}
          >
            {agentsQ.isLoading && (
              <div
                style={{
                  padding: "var(--gc-space-3)",
                  fontSize: "var(--gc-text-sm)",
                  color: "var(--gc-text-muted)",
                  textAlign: "center",
                }}
              >
                Loading agents…
              </div>
            )}
            {!agentsQ.isLoading && filteredAgents.length === 0 && (
              <div
                style={{
                  padding: "var(--gc-space-3)",
                  fontSize: "var(--gc-text-sm)",
                  color: "var(--gc-text-muted)",
                  textAlign: "center",
                }}
              >
                {search ? "No agents match your search." : "No agents found."}
              </div>
            )}
            {filteredAgents.map((a) => {
              const checked = selectedUserIds.has(a.agent_user_id);
              const fullName = `${a.first_name} ${a.last_name}`.trim();
              return (
                <label
                  key={a.agent_user_id}
                  htmlFor={`sfg-agent-${a.agent_user_id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--gc-border-subtle, var(--gc-border))",
                    backgroundColor: checked
                      ? "color-mix(in srgb, var(--gc-gold) 8%, transparent)"
                      : "transparent",
                  }}
                >
                  <input
                    id={`sfg-agent-${a.agent_user_id}`}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAgent(a.agent_user_id)}
                    disabled={submitting}
                    style={{ accentColor: "var(--gc-gold)" }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "var(--gc-text-sm)",
                        color: "var(--gc-text-primary)",
                        fontWeight: 500,
                      }}
                    >
                      {fullName}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--gc-text-xs)",
                        color: "var(--gc-text-muted)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {a.hierarchy_title || "Agent"}
                      {a.email ? ` · ${a.email}` : " · no email on file"}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Free-text email recipients */}
        <div style={{ marginBottom: "var(--gc-space-4)" }}>
          <label style={GC_FORM_LABEL} htmlFor="sfg-emails">
            Free-text emails ({parsedEmails.valid.length} valid)
          </label>
          <textarea
            id="sfg-emails"
            value={emailsRaw}
            onChange={(e) => setEmailsRaw(e.target.value)}
            onBlur={handleEmailsBlur}
            disabled={submitting}
            rows={2}
            style={{ ...GC_FORM_INPUT, resize: "vertical", minHeight: 60 }}
            placeholder="alice@example.com, bob@example.com"
          />
          {emailErrors.length > 0 && (
            <p
              style={{
                marginTop: 4,
                fontSize: "var(--gc-text-xs)",
                color: "var(--gc-status-terminated)",
              }}
            >
              Invalid: {emailErrors.join(", ")}
            </p>
          )}
          <p
            style={{
              marginTop: 4,
              fontSize: "var(--gc-text-xs)",
              color: "var(--gc-text-muted)",
              fontStyle: "italic",
            }}
          >
            Comma, semicolon, or newline separated. Free-text recipients only get email — no in-app notification.
          </p>
        </div>

        {/* Optional intro note */}
        <div style={{ marginBottom: "var(--gc-space-4)" }}>
          <label style={GC_FORM_LABEL} htmlFor="sfg-intro">
            Intro note (optional)
          </label>
          <textarea
            id="sfg-intro"
            value={introNote}
            onChange={(e) => setIntroNote(e.target.value)}
            disabled={submitting}
            rows={3}
            maxLength={2000}
            style={{ ...GC_FORM_INPUT, resize: "vertical", minHeight: 70 }}
            placeholder="Add a brief personal message that appears at the top of the email."
          />
        </div>

        {/* Channels */}
        <div style={{ marginBottom: "var(--gc-space-4)" }}>
          <label style={GC_FORM_LABEL}>Channels</label>
          <div className="flex items-center gap-4 flex-wrap">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                opacity: emailDisabled ? 0.5 : 1,
                cursor: emailDisabled ? "not-allowed" : "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={emailChannel}
                disabled={emailDisabled || submitting}
                onChange={(e) => setEmailChannel(e.target.checked)}
                style={{ accentColor: "var(--gc-gold)" }}
              />
              <Mail className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
              <span
                style={{
                  fontSize: "var(--gc-text-sm)",
                  color: "var(--gc-text-primary)",
                }}
              >
                Send email
              </span>
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                opacity: notificationDisabled ? 0.5 : 1,
                cursor: notificationDisabled ? "not-allowed" : "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={notificationChannel}
                disabled={notificationDisabled || submitting}
                onChange={(e) => setNotificationChannel(e.target.checked)}
                style={{ accentColor: "var(--gc-gold)" }}
              />
              <Bell className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
              <span
                style={{
                  fontSize: "var(--gc-text-sm)",
                  color: "var(--gc-text-primary)",
                }}
              >
                Notify in app
              </span>
            </label>
          </div>
          {emailDisabled && (
            <p
              style={{
                marginTop: 6,
                fontSize: "var(--gc-text-xs)",
                color: "var(--gc-text-muted)",
                fontStyle: "italic",
              }}
            >
              No recipients have an email on file — email channel is unavailable.
            </p>
          )}
          {notificationDisabled && parsedEmails.valid.length > 0 && (
            <p
              style={{
                marginTop: 6,
                fontSize: "var(--gc-text-xs)",
                color: "var(--gc-text-muted)",
                fontStyle: "italic",
              }}
            >
              In-app notifications require hierarchy agents — pick at least one to enable.
            </p>
          )}
        </div>

        {error && (
          <div
            style={{
              marginBottom: "var(--gc-space-3)",
              padding: "var(--gc-space-2) var(--gc-space-3)",
              backgroundColor:
                "color-mix(in srgb, var(--gc-status-terminated) 12%, transparent)",
              border: "1px solid var(--gc-status-terminated)",
              borderRadius: "var(--gc-radius-sm)",
              color: "var(--gc-status-terminated)",
              fontSize: "var(--gc-text-sm)",
            }}
          >
            {error}
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-2">
          <span
            style={{
              fontSize: "var(--gc-text-xs)",
              color: "var(--gc-text-muted)",
            }}
          >
            {totalRecipients} recipient{totalRecipients === 1 ? "" : "s"} · {[
              emailChannel ? "email" : null,
              notificationChannel ? "in-app" : null,
            ]
              .filter(Boolean)
              .join(" + ") || "no channel"}
          </span>
          <div className="flex items-center gap-2">
            <GCSecondaryButton onClick={onClose} disabled={submitting}>
              Cancel
            </GCSecondaryButton>
            <GCSecondaryButton
              onClick={handlePreview}
              disabled={submitting || previewLoading}
            >
              <Eye className="w-3.5 h-3.5 mr-1 inline" />
              {previewLoading ? "Loading…" : "Preview"}
            </GCSecondaryButton>
            <GCPrimaryButton
              onClick={handleSend}
              disabled={submitting || totalRecipients === 0}
            >
              {submitting ? "Sending…" : "Send Guide"}
            </GCPrimaryButton>
          </div>
        </div>
      </GCModal>

      {previewOpen && previewHtml && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => setPreviewOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "90vw",
              maxWidth: 760,
              height: "90vh",
              minHeight: 600,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "var(--gc-surface)",
              border: "1px solid var(--gc-border)",
              borderRadius: "var(--gc-radius-md)",
              overflow: "hidden",
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{
                padding: "var(--gc-space-3) var(--gc-space-4)",
                borderBottom: "1px solid var(--gc-border)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--gc-font-display)",
                  fontSize: "var(--gc-text-md)",
                  color: "var(--gc-text-primary)",
                }}
              >
                Email preview — {stateName}
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                aria-label="Close preview"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--gc-text-muted)",
                  padding: 4,
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <iframe
              title="Formation guide preview"
              srcDoc={previewHtml}
              sandbox=""
              style={{
                flex: 1,
                width: "100%",
                border: "none",
                backgroundColor: "#F5EEE6",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
