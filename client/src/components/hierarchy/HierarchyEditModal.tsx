/**
 * HierarchyEditModal — admin-only edit dialog for changing an agent's
 * hierarchy title (promote/demote) or contract level. Pairs with the
 * `PATCH /api/hcms/hierarchy/agents/:agentId` endpoint that Forge-C ships.
 *
 * Two render modes:
 *   - "title"     → Radix Select of HIERARCHY_LEVELS values
 *   - "contract"  → Radix Select of 60..160 in steps of 5
 *
 * Submission is parent-driven (parent owns the mutation + toast). The modal
 * just collects the new value, calls onSubmit(value), and closes when the
 * promise resolves. Errors stay open so the parent can show error toast and
 * the user can retry without re-entering the field.
 */

import { useState } from "react";
import { GCModal, GCPrimaryButton, GCSecondaryButton, GC_FORM_LABEL } from "@/components/gc";
import { useGCTheme } from "@/components/gc/GCThemeProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HIERARCHY_LEVELS } from "@shared/models/enterprise";

export interface HierarchyEditModalProps {
  open: boolean;
  mode: "title" | "contract";
  agentId: string;
  agentName: string;
  currentValue: string | number;
  onClose: () => void;
  onSubmit: (value: string | number) => Promise<void>;
}

const TITLE_OPTIONS = Object.values(HIERARCHY_LEVELS);

// Contract level allowed range: 60..160 inclusive in steps of 5.
const CONTRACT_OPTIONS: number[] = (() => {
  const out: number[] = [];
  for (let v = 60; v <= 160; v += 5) out.push(v);
  return out;
})();

// GC-tokenised classNames for the Radix Select trigger + content. Tailwind
// arbitrary-value utilities (`bg-[var(...)]`) win over the shadcn defaults
// without needing `!important`.
const GC_SELECT_TRIGGER_CLASSES =
  "h-11 w-full bg-[var(--gc-surface)] border border-[var(--gc-border)] rounded-[var(--gc-radius-sm)] " +
  "text-[var(--gc-text-primary)] font-body text-base focus:ring-[var(--gc-gold)] focus:ring-1 focus:outline-none";
const GC_SELECT_CONTENT_CLASSES =
  "bg-[var(--gc-surface)] border border-[var(--gc-border)] rounded-[var(--gc-radius-md)] " +
  "text-[var(--gc-text-primary)] font-body shadow-[var(--gc-shadow-lg)]";
const GC_SELECT_ITEM_CLASSES =
  "py-2 cursor-pointer focus:bg-[var(--gc-surface-2)] focus:text-[var(--gc-gold)] " +
  "data-[state=checked]:text-[var(--gc-gold)] data-[state=checked]:font-medium";

export function HierarchyEditModal({
  open,
  mode,
  agentName,
  currentValue,
  onClose,
  onSubmit,
}: HierarchyEditModalProps) {
  const [value, setValue] = useState<string | number>(currentValue);
  const [submitting, setSubmitting] = useState(false);
  // Radix Portal renders SelectContent at document.body, OUTSIDE the
  // [data-theme] scope on GCShell — so the GC token vars resolve to nothing.
  // Forward the active theme onto the popover so the gold/surface tokens land.
  const { theme } = useGCTheme();

  if (!open) return null;

  const handleSave = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const out = mode === "contract" ? Number(value) : String(value);
      await onSubmit(out);
      onClose();
    } catch {
      // Parent surfaces error via toast; keep modal open for retry.
    } finally {
      setSubmitting(false);
    }
  };

  const title = mode === "title" ? "Change Hierarchy Title" : "Edit Contract Level";
  const subtitle = `Updating ${agentName}. Changes take effect immediately and create a new hierarchy version row.`;

  return (
    <GCModal title={title} subtitle={subtitle} onClose={onClose} width={440}>
      <div style={{ marginBottom: "var(--gc-space-4)" }}>
        {mode === "title" ? (
          <>
            <label style={GC_FORM_LABEL} htmlFor="hierarchy-title-select">Hierarchy Title</label>
            <Select
              value={String(value)}
              onValueChange={(v) => setValue(v)}
              disabled={submitting}
            >
              <SelectTrigger id="hierarchy-title-select" className={GC_SELECT_TRIGGER_CLASSES}>
                <SelectValue />
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
                {TITLE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t} className={GC_SELECT_ITEM_CLASSES}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        ) : (
          <>
            <label style={GC_FORM_LABEL} htmlFor="hierarchy-contract-select">Contract Level</label>
            <Select
              value={String(value)}
              onValueChange={(v) => setValue(Number(v))}
              disabled={submitting}
            >
              <SelectTrigger id="hierarchy-contract-select" className={GC_SELECT_TRIGGER_CLASSES}>
                <SelectValue placeholder="Select contract level">{`${Number(value)}%`}</SelectValue>
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
                {CONTRACT_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)} className={GC_SELECT_ITEM_CLASSES}>
                    {n}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>
      <div className="flex items-center justify-end gap-2">
        <GCSecondaryButton onClick={onClose} disabled={submitting}>Cancel</GCSecondaryButton>
        <GCPrimaryButton onClick={handleSave} disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </GCPrimaryButton>
      </div>
    </GCModal>
  );
}
