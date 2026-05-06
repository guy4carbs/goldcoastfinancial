/**
 * CommissionOverridesModal — manage `agency_carrier_commission_overrides`
 * for a specific (agency, carrier) pair.
 *
 * Displays the existing overrides as a table with a Terminate action and
 * an inline Add row form below. Submission is parent-driven; the page owns
 * the mutations + invalidation.
 *
 * Pairs with:
 *   GET    /api/founders/agencies/:id/overrides
 *   POST   /api/founders/agencies/:id/overrides
 *   DELETE /api/founders/agencies/:id/overrides/:overrideId
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
import { formatDate } from "@/pages/founders/utils/format";

export interface CommissionOverride {
  id: string;
  agency_id: string;
  carrier_id: string;
  product_type: string | null;
  commission_pct_delta: number | string;
  effective_from: string;
  effective_to: string | null;
  notes: string | null;
}

export interface AddOverridePayload {
  carrierId: string;
  productType?: string;
  commissionPctDelta: number;
  effectiveFrom: string;
  notes?: string;
}

export interface CommissionOverridesModalProps {
  open: boolean;
  agencyName?: string | null;
  carrierName?: string | null;
  carrierId: string;
  overrides: CommissionOverride[];
  onClose: () => void;
  onAdd: (payload: AddOverridePayload) => Promise<void>;
  onTerminate: (overrideId: string) => Promise<void>;
}

const PRODUCT_TYPES = ["__all", "IUL", "Term", "Whole Life", "Annuity", "Final Expense", "Disability"];

const SELECT_TRIGGER =
  "h-11 w-full bg-[var(--gc-surface)] border border-[var(--gc-border)] rounded-[var(--gc-radius-sm)] " +
  "text-[var(--gc-text-primary)] font-body text-base focus:ring-[var(--gc-gold)] focus:ring-1 focus:outline-none";
const SELECT_CONTENT =
  "bg-[var(--gc-surface)] border border-[var(--gc-border)] rounded-[var(--gc-radius-md)] " +
  "text-[var(--gc-text-primary)] font-body shadow-[var(--gc-shadow-lg)]";
const SELECT_ITEM =
  "py-2 cursor-pointer focus:bg-[var(--gc-surface-2)] focus:text-[var(--gc-gold)] " +
  "data-[state=checked]:text-[var(--gc-gold)] data-[state=checked]:font-medium";

export function CommissionOverridesModal({
  open,
  agencyName,
  carrierName,
  carrierId,
  overrides,
  onClose,
  onAdd,
  onTerminate,
}: CommissionOverridesModalProps) {
  const { theme } = useGCTheme();
  const [submitting, setSubmitting] = useState(false);
  const [terminating, setTerminating] = useState<string | null>(null);
  const [productType, setProductType] = useState<string>("__all");
  const [pctDelta, setPctDelta] = useState<string>("");
  const [effectiveFrom, setEffectiveFrom] = useState<string>(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleAdd = async () => {
    if (submitting) return;
    setError(null);
    const delta = Number(pctDelta);
    if (!Number.isFinite(delta) || delta === 0) {
      setError("Provide a non-zero commission percentage delta (e.g. 5 or -2.5).");
      return;
    }
    if (!effectiveFrom) {
      setError("Effective from date is required.");
      return;
    }
    setSubmitting(true);
    try {
      await onAdd({
        carrierId,
        productType: productType === "__all" ? undefined : productType,
        commissionPctDelta: delta,
        effectiveFrom,
        notes: notes.trim() || undefined,
      });
      // Reset form fields after success; keep the modal open so the user can
      // see the new row appear and add another.
      setProductType("__all");
      setPctDelta("");
      setNotes("");
    } catch (e: any) {
      setError(e?.message || "Failed to add override.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTerminate = async (id: string) => {
    if (terminating) return;
    setTerminating(id);
    try {
      await onTerminate(id);
    } catch (e: any) {
      setError(e?.message || "Failed to terminate override.");
    } finally {
      setTerminating(null);
    }
  };

  const subtitle =
    agencyName && carrierName
      ? `Commission overrides applied above the carrier's base rate for ${agencyName} × ${carrierName}.`
      : "Commission overrides applied above the carrier's base rate.";

  return (
    <GCModal title="Commission Overrides" subtitle={subtitle} onClose={onClose} width={700}>
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
          Active Overrides
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
                  Product
                </th>
                <th style={{ padding: "8px 12px", textAlign: "right", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-secondary)", textTransform: "uppercase", letterSpacing: "var(--gc-tracking-wider)" }}>
                  Delta %
                </th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-secondary)", textTransform: "uppercase", letterSpacing: "var(--gc-tracking-wider)" }}>
                  Effective From
                </th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-secondary)", textTransform: "uppercase", letterSpacing: "var(--gc-tracking-wider)" }}>
                  Notes
                </th>
                <th style={{ padding: "8px 12px", width: 60 }} />
              </tr>
            </thead>
            <tbody>
              {overrides.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      color: "var(--gc-text-muted)",
                      fontSize: "var(--gc-text-sm)",
                    }}
                  >
                    No active overrides — add one below.
                  </td>
                </tr>
              ) : (
                overrides.map((o) => {
                  const delta = Number(o.commission_pct_delta);
                  return (
                    <tr key={o.id} style={{ borderBottom: "1px solid var(--gc-border-subtle)" }}>
                      <td style={{ padding: "8px 12px", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)" }}>
                        {o.product_type || "All products"}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          textAlign: "right",
                          fontSize: "var(--gc-text-sm)",
                          color: delta >= 0 ? "var(--gc-status-active)" : "var(--gc-status-terminated)",
                          fontWeight: 600,
                        }}
                      >
                        {delta >= 0 ? "+" : ""}
                        {delta.toFixed(2)}%
                      </td>
                      <td style={{ padding: "8px 12px", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>
                        {formatDate(o.effective_from)}
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
                        title={o.notes || ""}
                      >
                        {o.notes || "—"}
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>
                        <button
                          onClick={() => handleTerminate(o.id)}
                          disabled={terminating === o.id}
                          aria-label="Terminate override"
                          style={{
                            background: "none",
                            border: "1px solid var(--gc-border)",
                            borderRadius: "var(--gc-radius-sm)",
                            color: "var(--gc-status-terminated)",
                            cursor: terminating === o.id ? "wait" : "pointer",
                            padding: "4px 8px",
                            opacity: terminating === o.id ? 0.5 : 1,
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
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
          Add Override
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label style={GC_FORM_LABEL} htmlFor="ov-product">Product type</label>
            <Select value={productType} onValueChange={setProductType} disabled={submitting}>
              <SelectTrigger id="ov-product" className={SELECT_TRIGGER}>
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
                {PRODUCT_TYPES.map((p) => (
                  <SelectItem key={p} value={p} className={SELECT_ITEM}>
                    {p === "__all" ? "All products" : p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label style={GC_FORM_LABEL} htmlFor="ov-delta">Commission delta % *</label>
            <input
              id="ov-delta"
              type="number"
              step="0.01"
              value={pctDelta}
              onChange={(e) => setPctDelta(e.target.value)}
              disabled={submitting}
              style={GC_FORM_INPUT}
              placeholder="+5 (boost) or -2.5 (clawback)"
            />
          </div>
          <div>
            <label style={GC_FORM_LABEL} htmlFor="ov-effective">Effective from *</label>
            <input
              id="ov-effective"
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              disabled={submitting}
              style={GC_FORM_INPUT}
            />
          </div>
          <div>
            <label style={GC_FORM_LABEL} htmlFor="ov-notes">Notes</label>
            <input
              id="ov-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
              style={GC_FORM_INPUT}
              placeholder="Optional context"
            />
          </div>
        </div>
        <div className="flex items-center justify-end">
          <GCPrimaryButton onClick={handleAdd} disabled={submitting}>
            {submitting ? "Adding…" : "Add Override"}
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

      <div className="flex items-center justify-end gap-2">
        <GCSecondaryButton onClick={onClose}>Done</GCSecondaryButton>
      </div>
    </GCModal>
  );
}
