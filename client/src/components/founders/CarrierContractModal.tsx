/**
 * CarrierContractModal — add or edit an `agency_carrier_contracts` row.
 *
 * Pairs with:
 *   POST   /api/founders/agencies/:id/carriers
 *   PATCH  /api/founders/agencies/:id/carriers/:contractId
 *
 * Two modes:
 *   - "create" requires a carrierId to be selected from the master directory
 *     (renders a Select of available carriers).
 *   - "edit"   pins the carrier (the Select is read-only) and allows mutating
 *     status / MPA dates / contact / states_authorized.
 */
import { useState } from "react";
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

export interface CarrierContractPayload {
  carrierId: string;
  status: string;
  mpaEffectiveDate?: string;
  mpaExpirationDate?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  statesAuthorized?: string[];
  writingNumber?: string;
  notes?: string;
}

export interface CarrierContractModalProps {
  open: boolean;
  mode: "create" | "edit";
  agencyName?: string | null;
  carriers: Array<{ id: string; name: string }>;
  initial?: Partial<CarrierContractPayload> & { carrierName?: string };
  onClose: () => void;
  onSubmit: (payload: CarrierContractPayload) => Promise<void>;
}

const STATUSES = ["active", "pending", "suspended", "terminated"];

const SELECT_TRIGGER =
  "h-11 w-full bg-[var(--gc-surface)] border border-[var(--gc-border)] rounded-[var(--gc-radius-sm)] " +
  "text-[var(--gc-text-primary)] font-body text-base focus:ring-[var(--gc-gold)] focus:ring-1 focus:outline-none";
const SELECT_CONTENT =
  "bg-[var(--gc-surface)] border border-[var(--gc-border)] rounded-[var(--gc-radius-md)] " +
  "text-[var(--gc-text-primary)] font-body shadow-[var(--gc-shadow-lg)]";
const SELECT_ITEM =
  "py-2 cursor-pointer focus:bg-[var(--gc-surface-2)] focus:text-[var(--gc-gold)] " +
  "data-[state=checked]:text-[var(--gc-gold)] data-[state=checked]:font-medium";

export function CarrierContractModal({
  open,
  mode,
  agencyName,
  carriers,
  initial,
  onClose,
  onSubmit,
}: CarrierContractModalProps) {
  const { theme } = useGCTheme();
  const [submitting, setSubmitting] = useState(false);
  const [carrierId, setCarrierId] = useState(initial?.carrierId || "");
  const [status, setStatus] = useState(initial?.status || "active");
  const [mpaEffectiveDate, setMpaEffectiveDate] = useState(initial?.mpaEffectiveDate || "");
  const [mpaExpirationDate, setMpaExpirationDate] = useState(initial?.mpaExpirationDate || "");
  const [primaryContactName, setPrimaryContactName] = useState(initial?.primaryContactName || "");
  const [primaryContactEmail, setPrimaryContactEmail] = useState(initial?.primaryContactEmail || "");
  const [primaryContactPhone, setPrimaryContactPhone] = useState(initial?.primaryContactPhone || "");
  const [selectedStates, setSelectedStates] = useState<Set<string>>(
    () => new Set((initial?.statesAuthorized || []).map((s) => s.toUpperCase())),
  );
  const [stateFilter, setStateFilter] = useState("");
  const [writingNumber, setWritingNumber] = useState(initial?.writingNumber || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSave = async () => {
    if (submitting) return;
    setError(null);
    if (!carrierId) {
      setError("Select a carrier from the directory first.");
      return;
    }
    const states = Array.from(selectedStates).sort();
    setSubmitting(true);
    try {
      await onSubmit({
        carrierId,
        status,
        mpaEffectiveDate: mpaEffectiveDate || undefined,
        mpaExpirationDate: mpaExpirationDate || undefined,
        primaryContactName: primaryContactName.trim() || undefined,
        primaryContactEmail: primaryContactEmail.trim() || undefined,
        primaryContactPhone: primaryContactPhone.trim() || undefined,
        statesAuthorized: states.length > 0 ? states : undefined,
        writingNumber: writingNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (e: any) {
      setError(e?.message || "Failed to save carrier contract.");
    } finally {
      setSubmitting(false);
    }
  };

  const title = mode === "create" ? "Add Carrier Contract" : "Edit Carrier Contract";
  const subtitle = agencyName
    ? `${mode === "create" ? "Adding" : "Editing"} contract for ${agencyName}.`
    : null;

  return (
    <GCModal title={title} subtitle={subtitle} onClose={onClose} width={580}>
      <div className="grid grid-cols-2 gap-3" style={{ marginBottom: "var(--gc-space-4)" }}>
        <div className="col-span-2">
          <label style={GC_FORM_LABEL} htmlFor="carrier-id">Carrier *</label>
          {mode === "edit" ? (
            <input
              type="text"
              disabled
              value={initial?.carrierName || carriers.find((c) => c.id === carrierId)?.name || carrierId}
              style={{ ...GC_FORM_INPUT, opacity: 0.7 }}
            />
          ) : (
            <Select value={carrierId} onValueChange={setCarrierId} disabled={submitting}>
              <SelectTrigger id="carrier-id" className={SELECT_TRIGGER}>
                <SelectValue placeholder="Select a carrier" />
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
                {carriers.map((c) => (
                  <SelectItem key={c.id} value={c.id} className={SELECT_ITEM}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <label style={GC_FORM_LABEL} htmlFor="contract-status">Status</label>
          <Select value={status} onValueChange={setStatus} disabled={submitting}>
            <SelectTrigger id="contract-status" className={SELECT_TRIGGER}>
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
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className={SELECT_ITEM}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div />

        <div>
          <label style={GC_FORM_LABEL} htmlFor="mpa-effective">MPA effective date</label>
          <input
            id="mpa-effective"
            type="date"
            value={mpaEffectiveDate}
            onChange={(e) => setMpaEffectiveDate(e.target.value)}
            disabled={submitting}
            style={GC_FORM_INPUT}
          />
        </div>

        <div>
          <label style={GC_FORM_LABEL} htmlFor="mpa-expiration">MPA expiration date</label>
          <input
            id="mpa-expiration"
            type="date"
            value={mpaExpirationDate}
            onChange={(e) => setMpaExpirationDate(e.target.value)}
            disabled={submitting}
            style={GC_FORM_INPUT}
          />
        </div>

        <div className="col-span-2">
          <label style={GC_FORM_LABEL} htmlFor="contact-name">Primary contact name</label>
          <input
            id="contact-name"
            type="text"
            value={primaryContactName}
            onChange={(e) => setPrimaryContactName(e.target.value)}
            disabled={submitting}
            style={GC_FORM_INPUT}
            placeholder="Carrier rep name"
          />
        </div>

        <div>
          <label style={GC_FORM_LABEL} htmlFor="contact-email">Primary contact email</label>
          <input
            id="contact-email"
            type="email"
            value={primaryContactEmail}
            onChange={(e) => setPrimaryContactEmail(e.target.value)}
            disabled={submitting}
            style={GC_FORM_INPUT}
            placeholder="rep@carrier.com"
          />
        </div>

        <div>
          <label style={GC_FORM_LABEL} htmlFor="contact-phone">Primary contact phone</label>
          <input
            id="contact-phone"
            type="tel"
            value={primaryContactPhone}
            onChange={(e) => setPrimaryContactPhone(e.target.value)}
            disabled={submitting}
            style={GC_FORM_INPUT}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label style={GC_FORM_LABEL}>
              States authorized {selectedStates.size > 0 && <span style={{ color: "var(--gc-gold)", fontWeight: 600 }}>({selectedStates.size} selected)</span>}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                placeholder="Filter…"
                disabled={submitting}
                style={{ ...GC_FORM_INPUT, height: 28, padding: "4px 8px", fontSize: "12px", width: 110 }}
              />
              <button
                type="button"
                disabled={submitting}
                onClick={() => setSelectedStates(new Set(STATES_LIST.map((s) => s.code)))}
                style={{
                  fontSize: "11px",
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "1px solid var(--gc-border)",
                  backgroundColor: "var(--gc-surface-2)",
                  color: "var(--gc-text-secondary)",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: 500,
                }}
              >
                Select all
              </button>
              <button
                type="button"
                disabled={submitting || selectedStates.size === 0}
                onClick={() => setSelectedStates(new Set())}
                style={{
                  fontSize: "11px",
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "1px solid var(--gc-border)",
                  backgroundColor: "var(--gc-surface-2)",
                  color: "var(--gc-text-secondary)",
                  cursor: submitting || selectedStates.size === 0 ? "not-allowed" : "pointer",
                  opacity: selectedStates.size === 0 ? 0.5 : 1,
                  fontWeight: 500,
                }}
              >
                Clear
              </button>
            </div>
          </div>
          <div
            className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-13 gap-1.5 p-3"
            style={{
              border: "1px solid var(--gc-border)",
              borderRadius: "var(--gc-radius-sm)",
              backgroundColor: "var(--gc-surface-2)",
              maxHeight: 220,
              overflowY: "auto",
            }}
          >
            {STATES_LIST.filter((s) => {
              const q = stateFilter.trim().toLowerCase();
              if (!q) return true;
              return s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
            }).map((s) => {
              const isSelected = selectedStates.has(s.code);
              return (
                <button
                  key={s.code}
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setSelectedStates((prev) => {
                      const next = new Set(prev);
                      if (next.has(s.code)) next.delete(s.code);
                      else next.add(s.code);
                      return next;
                    });
                  }}
                  title={s.name}
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    padding: "6px 0",
                    borderRadius: "var(--gc-radius-sm)",
                    border: `1px solid ${isSelected ? "var(--gc-gold)" : "var(--gc-border)"}`,
                    backgroundColor: isSelected ? "var(--gc-gold)" : "var(--gc-surface)",
                    color: isSelected ? "var(--gc-bg)" : "var(--gc-text-secondary)",
                    cursor: submitting ? "not-allowed" : "pointer",
                    transition: "all 80ms ease",
                  }}
                >
                  {s.code}
                </button>
              );
            })}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--gc-text-muted)",
              marginTop: 4,
            }}
          >
            Click states to toggle. Leave all unselected to authorize all states.
          </div>
        </div>

        <div className="col-span-2">
          <label style={GC_FORM_LABEL} htmlFor="writing-number">Writing Number</label>
          <input
            id="writing-number"
            type="text"
            value={writingNumber}
            onChange={(e) => setWritingNumber(e.target.value)}
            disabled={submitting}
            maxLength={50}
            style={GC_FORM_INPUT}
            placeholder="e.g. AGT-12345"
          />
          <div
            style={{
              fontSize: "11px",
              color: "var(--gc-text-muted)",
              marginTop: 4,
            }}
          >
            Agency-level producer/writing number assigned by the carrier. Leave blank if not yet issued.
          </div>
        </div>

        <div className="col-span-2">
          <label style={GC_FORM_LABEL} htmlFor="contract-notes">Notes</label>
          <textarea
            id="contract-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={submitting}
            rows={2}
            style={{ ...GC_FORM_INPUT, resize: "vertical", minHeight: 60 }}
            placeholder="Carve-outs, side letters, special terms"
          />
        </div>
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
          {submitting ? "Saving…" : mode === "create" ? "Add Contract" : "Save Changes"}
        </GCPrimaryButton>
      </div>
    </GCModal>
  );
}
