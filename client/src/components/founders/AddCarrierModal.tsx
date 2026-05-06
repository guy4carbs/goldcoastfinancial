/**
 * AddCarrierModal — founder-only entry point to add a brand-new carrier to
 * the master `carrier_directory` table.
 *
 * Pairs with:
 *   POST   /api/founders/carriers
 *
 * This sits one level above `agency_carrier_contracts` — it adds a carrier
 * to the universe so any agency in the system can subsequently sign an MPA
 * with it. Agency-specific MPA edits live in CarrierContractModal.
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

export interface AddCarrierPayload {
  name: string;
  shortName?: string;
  naic?: string;
  amBest?: string;
  contractingUrl?: string;
  trainingUrl?: string;
  appointmentPhone?: string;
  appointmentEmail?: string;
  productTypes?: string[];
  statesAvailable?: string[];
  notes?: string;
}

export interface AddCarrierModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: AddCarrierPayload) => Promise<void>;
}

const PRODUCT_OPTIONS = [
  "IUL",
  "Term",
  "Whole Life",
  "Universal Life",
  "Annuity",
  "Final Expense",
  "Disability",
  "LTC",
  "Medicare",
];

const AM_BEST_OPTIONS = ["A++", "A+", "A", "A-", "B++", "B+", "B", "B-", "C++", "C+", "C", "Not Rated"];

const SELECT_TRIGGER =
  "h-11 w-full bg-[var(--gc-surface)] border border-[var(--gc-border)] rounded-[var(--gc-radius-sm)] " +
  "text-[var(--gc-text-primary)] font-body text-base focus:ring-[var(--gc-gold)] focus:ring-1 focus:outline-none";
const SELECT_CONTENT =
  "bg-[var(--gc-surface)] border border-[var(--gc-border)] rounded-[var(--gc-radius-md)] " +
  "text-[var(--gc-text-primary)] font-body shadow-[var(--gc-shadow-lg)]";
const SELECT_ITEM =
  "py-2 cursor-pointer focus:bg-[var(--gc-surface-2)] focus:text-[var(--gc-gold)] " +
  "data-[state=checked]:text-[var(--gc-gold)] data-[state=checked]:font-medium";

export function AddCarrierModal({ open, onClose, onSubmit }: AddCarrierModalProps) {
  const { theme } = useGCTheme();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [naic, setNaic] = useState("");
  const [amBest, setAmBest] = useState("Not Rated");
  const [contractingUrl, setContractingUrl] = useState("");
  const [trainingUrl, setTrainingUrl] = useState("");
  const [appointmentPhone, setAppointmentPhone] = useState("");
  const [appointmentEmail, setAppointmentEmail] = useState("");
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<Set<string>>(new Set());
  const [stateFilter, setStateFilter] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const toggleProduct = (p: string) => {
    setProductTypes((curr) => (curr.includes(p) ? curr.filter((c) => c !== p) : [...curr, p]));
  };

  const handleSave = async () => {
    if (submitting) return;
    setError(null);
    if (!name.trim()) {
      setError("Carrier name is required.");
      return;
    }
    const states = Array.from(selectedStates).sort();
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        shortName: shortName.trim() || undefined,
        naic: naic.trim() || undefined,
        amBest: amBest === "Not Rated" ? undefined : amBest,
        contractingUrl: contractingUrl.trim() || undefined,
        trainingUrl: trainingUrl.trim() || undefined,
        appointmentPhone: appointmentPhone.trim() || undefined,
        appointmentEmail: appointmentEmail.trim() || undefined,
        productTypes: productTypes.length > 0 ? productTypes : undefined,
        statesAvailable: states.length > 0 ? states : undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (e: any) {
      setError(e?.message || "Failed to add carrier.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GCModal
      title="Add Carrier to Directory"
      subtitle="Founder-only. Adds a brand-new carrier to the master directory so any agency can sign a contract with it."
      onClose={onClose}
      width={680}
    >
      <div className="grid grid-cols-2 gap-3" style={{ marginBottom: "var(--gc-space-4)" }}>
        <div className="col-span-2">
          <label style={GC_FORM_LABEL} htmlFor="carrier-name">Carrier name *</label>
          <input
            id="carrier-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            style={GC_FORM_INPUT}
            placeholder="e.g. Mutual of Omaha Insurance Company"
          />
        </div>

        <div>
          <label style={GC_FORM_LABEL} htmlFor="carrier-short">Short name</label>
          <input
            id="carrier-short"
            type="text"
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            disabled={submitting}
            style={GC_FORM_INPUT}
            placeholder="e.g. Mutual of Omaha"
          />
        </div>

        <div>
          <label style={GC_FORM_LABEL} htmlFor="carrier-naic">Writing #</label>
          <input
            id="carrier-naic"
            type="text"
            value={naic}
            onChange={(e) => setNaic(e.target.value)}
            disabled={submitting}
            style={GC_FORM_INPUT}
            placeholder="e.g. GC-AMR-001"
          />
        </div>

        <div>
          <label style={GC_FORM_LABEL} htmlFor="carrier-ambest">AM Best rating</label>
          <Select value={amBest} onValueChange={setAmBest} disabled={submitting}>
            <SelectTrigger id="carrier-ambest" className={SELECT_TRIGGER}>
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
              {AM_BEST_OPTIONS.map((r) => (
                <SelectItem key={r} value={r} className={SELECT_ITEM}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div />

        <div>
          <label style={GC_FORM_LABEL} htmlFor="carrier-contracting-url">Contracting portal URL</label>
          <input
            id="carrier-contracting-url"
            type="url"
            value={contractingUrl}
            onChange={(e) => setContractingUrl(e.target.value)}
            disabled={submitting}
            style={GC_FORM_INPUT}
            placeholder="https://..."
          />
        </div>

        <div>
          <label style={GC_FORM_LABEL} htmlFor="carrier-training-url">Training portal URL</label>
          <input
            id="carrier-training-url"
            type="url"
            value={trainingUrl}
            onChange={(e) => setTrainingUrl(e.target.value)}
            disabled={submitting}
            style={GC_FORM_INPUT}
            placeholder="https://..."
          />
        </div>

        <div>
          <label style={GC_FORM_LABEL} htmlFor="carrier-appt-phone">Appointment phone</label>
          <input
            id="carrier-appt-phone"
            type="tel"
            value={appointmentPhone}
            onChange={(e) => setAppointmentPhone(e.target.value)}
            disabled={submitting}
            style={GC_FORM_INPUT}
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <label style={GC_FORM_LABEL} htmlFor="carrier-appt-email">Appointment email</label>
          <input
            id="carrier-appt-email"
            type="email"
            value={appointmentEmail}
            onChange={(e) => setAppointmentEmail(e.target.value)}
            disabled={submitting}
            style={GC_FORM_INPUT}
            placeholder="contracting@carrier.com"
          />
        </div>

        <div className="col-span-2">
          <label style={GC_FORM_LABEL}>Product types — click to toggle</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {PRODUCT_OPTIONS.map((p) => {
              const active = productTypes.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggleProduct(p)}
                  disabled={submitting}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "var(--gc-radius-full)",
                    border: `1px solid ${active ? "var(--gc-gold)" : "var(--gc-border)"}`,
                    backgroundColor: active ? "color-mix(in srgb, var(--gc-gold) 18%, transparent)" : "var(--gc-surface)",
                    color: active ? "var(--gc-gold)" : "var(--gc-text-secondary)",
                    fontFamily: "var(--gc-font-body)",
                    fontSize: "var(--gc-text-sm)",
                    fontWeight: active ? 600 : 400,
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        <div className="col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label style={GC_FORM_LABEL}>
              States available {selectedStates.size > 0 && <span style={{ color: "var(--gc-gold)", fontWeight: 600 }}>({selectedStates.size} selected)</span>}
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
            Click states to toggle. Leave all unselected to mark this carrier as nationwide.
          </div>
        </div>

        <div className="col-span-2">
          <label style={GC_FORM_LABEL} htmlFor="carrier-notes">Notes</label>
          <textarea
            id="carrier-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={submitting}
            rows={2}
            style={{ ...GC_FORM_INPUT, resize: "vertical", minHeight: 60 }}
            placeholder="Internal notes about this carrier"
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
          {submitting ? "Adding…" : "Add Carrier"}
        </GCPrimaryButton>
      </div>
    </GCModal>
  );
}
