/**
 * AgencyEditModal — create or edit an `agencies` row.
 *
 * Pairs with:
 *   POST   /api/founders/agencies                 (create, parentAgencyId optional)
 *   PATCH  /api/founders/agencies/:id             (edit)
 *
 * Submission is parent-driven; this component only collects fields and forwards
 * to onSubmit(payload). Errors keep the modal open so the user can retry without
 * re-entering anything. CSRF headers are appended via `csrfHeaders()` at the
 * call site (page-level mutation), not here — this keeps the modal pure.
 *
 * (Axiom HIGH) Quick-name / Convert-to-Agency flows live entirely in
 * `QuickNameTeamModal` now — this component is purely the full LLC create/edit
 * form. The previous `assignAgentId` slim-mode branch was removed.
 */
import { useState } from "react";
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
import { STATES_LIST } from "@/lib/data/llcStateGuide";

export interface AgencyEditPayload {
  parentAgencyId?: string | null;
  name: string;
  dbaName?: string;
  legalEntityType?: string;
  ein?: string;
  stateOfFormation?: string;
  formationDate?: string;
  contactEmail?: string;
  contactPhone?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status?: string;
  notes?: string;
  // Wave 4 — optional agent to auto-promote to Team Lead and assign as the
  // new agency's manager. ONLY consulted in create mode. When set, the parent
  // mutation should hit /api/founders/agencies/promote-and-assign + a follow-up
  // PATCH to populate the LLC fields rather than the plain POST /agencies.
  assignAgentUserId?: string | null;
}

// Flat agent row from /api/hcms/hierarchy/flat — same shape used by
// QuickNameTeamModal.
interface FlatAgentRow {
  agent_user_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  hierarchy_title?: string | null;
  hierarchy_level?: number | null;
}

export interface AgencyEditModalProps {
  open: boolean;
  mode: "create" | "edit";
  parentAgencyId?: string | null;
  parentAgencyName?: string | null;
  initial?: Partial<AgencyEditPayload>;
  onClose: () => void;
  onSubmit: (payload: AgencyEditPayload) => Promise<void>;
}

const ENTITY_TYPES = ["LLC", "Corporation", "S-Corp", "Partnership", "Sole Proprietor", "Other"];
const STATUS_OPTIONS = ["active", "suspended", "terminated"];

const SELECT_TRIGGER =
  "h-11 w-full bg-[var(--gc-surface)] border border-[var(--gc-border)] rounded-[var(--gc-radius-sm)] " +
  "text-[var(--gc-text-primary)] font-body text-base focus:ring-[var(--gc-gold)] focus:ring-1 focus:outline-none";
const SELECT_CONTENT =
  "bg-[var(--gc-surface)] border border-[var(--gc-border)] rounded-[var(--gc-radius-md)] " +
  "text-[var(--gc-text-primary)] font-body shadow-[var(--gc-shadow-lg)]";
const SELECT_ITEM =
  "py-2 cursor-pointer focus:bg-[var(--gc-surface-2)] focus:text-[var(--gc-gold)] " +
  "data-[state=checked]:text-[var(--gc-gold)] data-[state=checked]:font-medium";

export function AgencyEditModal({
  open,
  mode,
  parentAgencyId,
  parentAgencyName,
  initial,
  onClose,
  onSubmit,
}: AgencyEditModalProps) {
  const { theme } = useGCTheme();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState(initial?.name || "");
  const [dbaName, setDbaName] = useState(initial?.dbaName || "");
  const [legalEntityType, setLegalEntityType] = useState(initial?.legalEntityType || "LLC");
  const [ein, setEin] = useState(initial?.ein || "");
  const [stateOfFormation, setStateOfFormation] = useState(initial?.stateOfFormation || "");
  const [formationDate, setFormationDate] = useState(initial?.formationDate || "");
  const [contactEmail, setContactEmail] = useState(initial?.contactEmail || "");
  const [contactPhone, setContactPhone] = useState(initial?.contactPhone || "");
  const [streetAddress, setStreetAddress] = useState(initial?.streetAddress || "");
  const [city, setCity] = useState(initial?.city || "");
  const [stateAddr, setStateAddr] = useState(initial?.state || "");
  const [zipCode, setZipCode] = useState(initial?.zipCode || "");
  const [status, setStatus] = useState(initial?.status || "active");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [assignAgentUserId, setAssignAgentUserId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Wave 4 — pull the flat agent list ONLY in create mode, lazy on `open`.
  // Mirrors QuickNameTeamModal's data source so the founder picks from the
  // same canonical list. Edit mode skips the request entirely.
  const agentsQ = useQuery<FlatAgentRow[]>({
    queryKey: ["/api/hcms/hierarchy/flat"],
    enabled: open && mode === "create",
    staleTime: 60_000,
    retry: 1,
  });

  if (!open) return null;

  const handleSave = async () => {
    if (submitting) return;
    setError(null);
    if (!name.trim()) {
      setError("Agency name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload: AgencyEditPayload = {
        parentAgencyId: parentAgencyId ?? null,
        name: name.trim(),
        dbaName: dbaName.trim() || undefined,
        legalEntityType,
        ein: ein.trim() || undefined,
        stateOfFormation: stateOfFormation || undefined,
        formationDate: formationDate || undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        streetAddress: streetAddress.trim() || undefined,
        city: city.trim() || undefined,
        state: stateAddr || undefined,
        zipCode: zipCode.trim() || undefined,
        status,
        notes: notes.trim() || undefined,
        // Only attach the assign field in create mode — edit mode never sends
        // it (the picker isn't rendered there either).
        assignAgentUserId:
          mode === "create" && assignAgentUserId ? assignAgentUserId : null,
      };
      await onSubmit(payload);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Failed to save agency.");
    } finally {
      setSubmitting(false);
    }
  };

  const title =
    mode === "create"
      ? (parentAgencyId ? "New Sub-Agency" : "New Agency")
      : "Edit Agency";
  const subtitle =
    mode === "create"
      ? parentAgencyName
        ? `Creating a sub-agency under ${parentAgencyName}.`
        : "Creating a new top-level agency. You can nest sub-agencies underneath it later."
      : "Updating agency details. Changes take effect immediately.";

  return (
    <GCModal title={title} subtitle={subtitle} onClose={onClose} width={620}>
      <div className="grid grid-cols-2 gap-3" style={{ marginBottom: "var(--gc-space-4)" }}>
        <div className="col-span-2">
          <label style={GC_FORM_LABEL} htmlFor="agency-name">Agency name *</label>
          <input
            id="agency-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            style={GC_FORM_INPUT}
            placeholder="Heritage Life Solutions"
          />
        </div>

        <div className="col-span-2">
          <label style={GC_FORM_LABEL} htmlFor="agency-dba">DBA name</label>
          <input
            id="agency-dba"
            type="text"
            value={dbaName}
            onChange={(e) => setDbaName(e.target.value)}
            disabled={submitting}
            style={GC_FORM_INPUT}
            placeholder="Optional doing-business-as alias"
          />
        </div>

        <div>
          <label style={GC_FORM_LABEL} htmlFor="agency-entity-type">Legal entity type</label>
          <Select value={legalEntityType} onValueChange={setLegalEntityType} disabled={submitting}>
            <SelectTrigger id="agency-entity-type" className={SELECT_TRIGGER}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              position="popper"
              sideOffset={4}
              collisionPadding={8}
              avoidCollisions
              data-theme={theme}
              className={SELECT_CONTENT}
              style={{ maxHeight: "var(--radix-select-content-available-height)" }}
            >
              {ENTITY_TYPES.map((t) => (
                <SelectItem key={t} value={t} className={SELECT_ITEM}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label style={GC_FORM_LABEL} htmlFor="agency-ein">EIN (XX-XXXXXXX)</label>
          <input
            id="agency-ein"
            type="text"
            value={ein}
            onChange={(e) => setEin(e.target.value)}
            disabled={submitting}
            style={GC_FORM_INPUT}
            placeholder="12-3456789"
          />
        </div>

        <div>
          <label style={GC_FORM_LABEL} htmlFor="agency-state-formation">State of formation</label>
          <Select value={stateOfFormation || "__none"} onValueChange={(v) => setStateOfFormation(v === "__none" ? "" : v)} disabled={submitting}>
            <SelectTrigger id="agency-state-formation" className={SELECT_TRIGGER}>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              sideOffset={4}
              collisionPadding={8}
              avoidCollisions
              data-theme={theme}
              className={SELECT_CONTENT}
              style={{ maxHeight: "var(--radix-select-content-available-height)" }}
            >
              <SelectItem value="__none" className={SELECT_ITEM}>—</SelectItem>
              {STATES_LIST.map((s) => (
                <SelectItem key={s.code} value={s.code} className={SELECT_ITEM}>
                  {s.code} · {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label style={GC_FORM_LABEL} htmlFor="agency-formation-date">Formation date</label>
          <input
            id="agency-formation-date"
            type="date"
            value={formationDate}
            onChange={(e) => setFormationDate(e.target.value)}
            disabled={submitting}
            style={GC_FORM_INPUT}
          />
        </div>

        <div>
          <label style={GC_FORM_LABEL} htmlFor="agency-contact-email">Contact email</label>
          <input
            id="agency-contact-email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            disabled={submitting}
            style={GC_FORM_INPUT}
            placeholder="contact@agency.com"
          />
        </div>

        <div>
          <label style={GC_FORM_LABEL} htmlFor="agency-contact-phone">Contact phone</label>
          <input
            id="agency-contact-phone"
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            disabled={submitting}
            style={GC_FORM_INPUT}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="col-span-2">
          <label style={GC_FORM_LABEL} htmlFor="agency-street">Street address</label>
          <input
            id="agency-street"
            type="text"
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            disabled={submitting}
            style={GC_FORM_INPUT}
            placeholder="123 Main St, Suite 200"
          />
        </div>

        <div>
          <label style={GC_FORM_LABEL} htmlFor="agency-city">City</label>
          <input
            id="agency-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={submitting}
            style={GC_FORM_INPUT}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={GC_FORM_LABEL} htmlFor="agency-state-addr">State</label>
            <Select value={stateAddr || "__none"} onValueChange={(v) => setStateAddr(v === "__none" ? "" : v)} disabled={submitting}>
              <SelectTrigger id="agency-state-addr" className={SELECT_TRIGGER}>
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={4}
                collisionPadding={8}
                avoidCollisions
                data-theme={theme}
                className={SELECT_CONTENT}
                style={{ maxHeight: "var(--radix-select-content-available-height)" }}
              >
                <SelectItem value="__none" className={SELECT_ITEM}>—</SelectItem>
                {STATES_LIST.map((s) => (
                  <SelectItem key={s.code} value={s.code} className={SELECT_ITEM}>
                    {s.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label style={GC_FORM_LABEL} htmlFor="agency-zip">ZIP</label>
            <input
              id="agency-zip"
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              disabled={submitting}
              style={GC_FORM_INPUT}
              placeholder="33101"
            />
          </div>
        </div>

        {mode === "edit" && (
          <div className="col-span-2">
            <label style={GC_FORM_LABEL} htmlFor="agency-status">Status</label>
            <Select value={status} onValueChange={setStatus} disabled={submitting}>
              <SelectTrigger id="agency-status" className={SELECT_TRIGGER}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={4}
                collisionPadding={8}
                avoidCollisions
                data-theme={theme}
                className={SELECT_CONTENT}
                style={{ maxHeight: "var(--radix-select-content-available-height)" }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s} className={SELECT_ITEM}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="col-span-2">
          <label style={GC_FORM_LABEL} htmlFor="agency-notes">Notes</label>
          <textarea
            id="agency-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={submitting}
            rows={2}
            style={{ ...GC_FORM_INPUT, resize: "vertical", minHeight: 60 }}
            placeholder="Internal notes (not surfaced to agents)"
          />
        </div>

        {/* Wave 4 — optional agent picker (create mode only). Selecting an
            agent here triggers the atomic promote-and-assign flow at the
            parent: agency is created with the agent auto-promoted to Team
            Lead and assigned as the manager in a single transaction. */}
        {mode === "create" && (
          <div className="col-span-2">
            <label style={GC_FORM_LABEL} htmlFor="agency-assign-agent">
              Assign as manager (optional)
            </label>
            <Select
              value={assignAgentUserId || "__none"}
              onValueChange={(v) => setAssignAgentUserId(v === "__none" ? "" : v)}
              disabled={submitting || agentsQ.isLoading}
            >
              <SelectTrigger id="agency-assign-agent" className={SELECT_TRIGGER}>
                <SelectValue
                  placeholder={
                    agentsQ.isLoading ? "Loading agents…" : "— No assignment —"
                  }
                />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={4}
                collisionPadding={8}
                avoidCollisions
                data-theme={theme}
                className={SELECT_CONTENT}
                style={{ maxHeight: "var(--radix-select-content-available-height)" }}
              >
                <SelectItem value="__none" className={SELECT_ITEM}>
                  — No assignment —
                </SelectItem>
                {(agentsQ.data || []).map((a) => {
                  const fullName = `${a.first_name} ${a.last_name}`.trim();
                  const title = a.hierarchy_title || "Agent";
                  return (
                    <SelectItem
                      key={a.agent_user_id}
                      value={a.agent_user_id}
                      className={SELECT_ITEM}
                    >
                      {fullName} · {title}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p
              style={{
                marginTop: 4,
                fontSize: "var(--gc-text-xs)",
                color: "var(--gc-text-muted)",
                fontStyle: "italic",
              }}
            >
              If selected, the agent will be auto-promoted to Team Lead and assigned to this agency in a single transaction.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            marginBottom: "var(--gc-space-3)",
            padding: "var(--gc-space-2) var(--gc-space-3)",
            backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 12%, transparent)",
            border: "1px solid var(--gc-status-terminated)",
            borderRadius: "var(--gc-radius-sm)",
            color: "var(--gc-status-terminated)",
            fontSize: "var(--gc-text-sm)",
          }}
        >
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <GCSecondaryButton onClick={onClose} disabled={submitting}>Cancel</GCSecondaryButton>
        <GCPrimaryButton onClick={handleSave} disabled={submitting}>
          {submitting
            ? "Saving…"
            : mode === "create"
              ? "Create Agency"
              : "Save Changes"}
        </GCPrimaryButton>
      </div>
    </GCModal>
  );
}
