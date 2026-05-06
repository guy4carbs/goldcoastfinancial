/**
 * ComplianceRequirementsModal — manage `carrier_compliance_requirements` for
 * a single carrier in the master directory.
 *
 * Pairs with:
 *   GET    /api/founders/carriers/:id/compliance
 *   POST   /api/founders/carriers/:id/compliance
 *   DELETE /api/founders/carriers/:id/compliance/:reqId
 *
 * Each requirement is one of five types — chosen because they cover the gates
 * that the agent-portal carrier-request handler enforces server-side. Adding a
 * new type here without updating the server check is a no-op (so we keep the
 * type list in sync with `server/services/agencyResolver.ts`).
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
import { Trash2 } from "lucide-react";

export interface ComplianceRequirement {
  id: string;
  carrier_id: string;
  requirement_type: string;
  required_value: string | null;
  notes: string | null;
}

export interface AddRequirementPayload {
  requirementType: string;
  requiredValue?: string;
  notes?: string;
}

export interface ComplianceRequirementsModalProps {
  open: boolean;
  carrierName?: string | null;
  requirements: ComplianceRequirement[];
  onClose: () => void;
  onAdd: (payload: AddRequirementPayload) => Promise<void>;
  onRemove: (reqId: string) => Promise<void>;
}

const REQ_TYPES = [
  { value: "aml_training", label: "AML training certificate" },
  { value: "eo_minimum", label: "E&O minimum coverage (dollars)" },
  { value: "state_excluded", label: "State excluded (CSV of state codes)" },
  { value: "background_check", label: "Background check on file" },
  { value: "training_module", label: "Training module completed" },
];

// Helix BLOCK 2 + HIGH 5 — these requirement types are tracked in the modal
// but are NOT enforced by the agent-portal carrier-request handler today.
// `aml_training` is presence-only (no expiration column yet); the other two
// have no agent-side data field at all. Surface that clearly in the UI so
// founders know they have to manually review compliance for these.
const ADVISORY_TYPES = new Set(["aml_training", "background_check", "training_module"]);

const ADVISORY_PILL_STYLE: React.CSSProperties = {
  fontSize: 10,
  padding: "1px 6px",
  borderRadius: 999,
  backgroundColor: "color-mix(in srgb, var(--gc-status-warning, #d4a574) 18%, transparent)",
  color: "var(--gc-status-warning, #d4a574)",
  border: "1px solid var(--gc-status-warning, #d4a574)",
  fontWeight: 600,
  marginLeft: 6,
};

function labelFor(type: string): string {
  return REQ_TYPES.find((r) => r.value === type)?.label || type;
}

const SELECT_TRIGGER =
  "h-11 w-full bg-[var(--gc-surface)] border border-[var(--gc-border)] rounded-[var(--gc-radius-sm)] " +
  "text-[var(--gc-text-primary)] font-body text-base focus:ring-[var(--gc-gold)] focus:ring-1 focus:outline-none";
const SELECT_CONTENT =
  "bg-[var(--gc-surface)] border border-[var(--gc-border)] rounded-[var(--gc-radius-md)] " +
  "text-[var(--gc-text-primary)] font-body shadow-[var(--gc-shadow-lg)]";
const SELECT_ITEM =
  "py-2 cursor-pointer focus:bg-[var(--gc-surface-2)] focus:text-[var(--gc-gold)] " +
  "data-[state=checked]:text-[var(--gc-gold)] data-[state=checked]:font-medium";

export function ComplianceRequirementsModal({
  open,
  carrierName,
  requirements,
  onClose,
  onAdd,
  onRemove,
}: ComplianceRequirementsModalProps) {
  const { theme } = useGCTheme();
  const [submitting, setSubmitting] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [requirementType, setRequirementType] = useState<string>("aml_training");
  const [requiredValue, setRequiredValue] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleAdd = async () => {
    if (submitting) return;
    setError(null);
    // Required value is mandatory for the types that take a value; the boolean-
    // shaped types (aml_training / background_check) accept blank to mean "must
    // exist on the agent's profile".
    const valueRequiredFor = ["eo_minimum", "state_excluded", "training_module"];
    if (valueRequiredFor.includes(requirementType) && !requiredValue.trim()) {
      setError(`A required value is needed for ${labelFor(requirementType)}.`);
      return;
    }
    setSubmitting(true);
    try {
      await onAdd({
        requirementType,
        requiredValue: requiredValue.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setRequiredValue("");
      setNotes("");
    } catch (e: any) {
      setError(e?.message || "Failed to add requirement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (removing) return;
    setRemoving(id);
    try {
      await onRemove(id);
    } catch (e: any) {
      setError(e?.message || "Failed to remove requirement.");
    } finally {
      setRemoving(null);
    }
  };

  const subtitle = carrierName
    ? `Compliance gates enforced when agents request appointment with ${carrierName}.`
    : "Compliance gates enforced when agents request appointment.";

  return (
    <GCModal title="Compliance Requirements" subtitle={subtitle} onClose={onClose} width={680}>
      <div style={{ marginBottom: "var(--gc-space-4)" }}>
        <div
          className="mb-2"
          style={{
            fontSize: "var(--gc-text-xs)",
            letterSpacing: "var(--gc-tracking-wider)",
            textTransform: "uppercase",
            color: "var(--gc-text-muted)",
          }}
        >
          Existing Requirements
        </div>
        <div
          style={{
            backgroundColor: "var(--gc-surface)",
            border: "1px solid var(--gc-border)",
            borderRadius: "var(--gc-radius-md)",
            overflow: "hidden",
          }}
        >
          <table className="w-full" style={{ tableLayout: "fixed" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gc-border)" }}>
                <th
                  style={{
                    padding: "8px 12px",
                    textAlign: "left",
                    fontSize: "var(--gc-text-xs)",
                    color: "var(--gc-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "var(--gc-tracking-wider)",
                  }}
                >
                  Type
                </th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-secondary)", textTransform: "uppercase", letterSpacing: "var(--gc-tracking-wider)" }}>
                  Required Value
                </th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-secondary)", textTransform: "uppercase", letterSpacing: "var(--gc-tracking-wider)" }}>
                  Notes
                </th>
                <th style={{ padding: "8px 12px", width: 60 }} />
              </tr>
            </thead>
            <tbody>
              {requirements.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      color: "var(--gc-text-muted)",
                      fontSize: "var(--gc-text-sm)",
                    }}
                  >
                    No requirements yet — add one below.
                  </td>
                </tr>
              ) : (
                requirements.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--gc-border-subtle)" }}>
                    <td style={{ padding: "8px 12px", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)" }}>
                      {labelFor(r.requirement_type)}
                      {ADVISORY_TYPES.has(r.requirement_type) && (
                        <span style={ADVISORY_PILL_STYLE}>ADVISORY</span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        fontSize: "var(--gc-text-sm)",
                        color: "var(--gc-text-secondary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={r.required_value || ""}
                    >
                      {r.required_value || "—"}
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        fontSize: "var(--gc-text-sm)",
                        color: "var(--gc-text-secondary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={r.notes || ""}
                    >
                      {r.notes || "—"}
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "right" }}>
                      <button
                        onClick={() => handleRemove(r.id)}
                        disabled={removing === r.id}
                        aria-label="Remove requirement"
                        style={{
                          background: "none",
                          border: "1px solid var(--gc-border)",
                          borderRadius: "var(--gc-radius-sm)",
                          color: "var(--gc-status-terminated)",
                          cursor: removing === r.id ? "wait" : "pointer",
                          padding: "4px 8px",
                          opacity: removing === r.id ? 0.5 : 1,
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        style={{
          padding: "var(--gc-space-3)",
          backgroundColor: "var(--gc-surface-2)",
          border: "1px solid var(--gc-border)",
          borderRadius: "var(--gc-radius-md)",
          marginBottom: "var(--gc-space-4)",
        }}
      >
        <div
          className="mb-2"
          style={{
            fontSize: "var(--gc-text-xs)",
            letterSpacing: "var(--gc-tracking-wider)",
            textTransform: "uppercase",
            color: "var(--gc-text-muted)",
          }}
        >
          Add Requirement
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label style={GC_FORM_LABEL} htmlFor="req-type">Requirement type *</label>
            <Select value={requirementType} onValueChange={setRequirementType} disabled={submitting}>
              <SelectTrigger id="req-type" className={SELECT_TRIGGER}>
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
                {REQ_TYPES.map((r) => (
                  <SelectItem key={r.value} value={r.value} className={SELECT_ITEM}>
                    <span className="inline-flex items-center">
                      {r.label}
                      {ADVISORY_TYPES.has(r.value) && (
                        <span style={ADVISORY_PILL_STYLE}>ADVISORY</span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label style={GC_FORM_LABEL} htmlFor="req-value">Required value</label>
            <input
              id="req-value"
              type="text"
              value={requiredValue}
              onChange={(e) => setRequiredValue(e.target.value)}
              disabled={submitting}
              style={GC_FORM_INPUT}
              placeholder={
                requirementType === "eo_minimum"
                  ? "in dollars (e.g. 1000000 for $1M)"
                  : requirementType === "state_excluded"
                  ? "e.g. AK,HI"
                  : requirementType === "training_module"
                  ? "module identifier"
                  : "(optional)"
              }
            />
          </div>
          <div className="col-span-2">
            <label style={GC_FORM_LABEL} htmlFor="req-notes">Notes</label>
            <input
              id="req-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
              style={GC_FORM_INPUT}
              placeholder="Optional context for the founder team"
            />
          </div>
        </div>
        <div className="flex items-center justify-end">
          <GCPrimaryButton onClick={handleAdd} disabled={submitting}>
            {submitting ? "Adding…" : "Add Requirement"}
          </GCPrimaryButton>
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

      <div
        style={{
          marginBottom: "var(--gc-space-3)",
          fontSize: "var(--gc-text-xs)",
          color: "var(--gc-text-muted)",
          fontStyle: "italic",
        }}
      >
        ADVISORY items are tracked but not auto-enforced on agent appointment requests yet. Founder review required.
      </div>

      <div className="flex items-center justify-end gap-2">
        <GCSecondaryButton onClick={onClose}>Done</GCSecondaryButton>
      </div>
    </GCModal>
  );
}
