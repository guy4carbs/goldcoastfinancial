/**
 * ManageGoalsModal — inline editor for the four quarterly goals shown on the
 * Founders Dashboard. Each row maps 1:1 to a metric_key on the server and
 * persists via `PUT /api/founders/dashboard/goals/:metricKey`.
 *
 * Wired to invalidate the dashboard's quarterly-goals query on success so the
 * progress bars on the dashboard refresh without a full page reload.
 *
 * Uses GCModal (already used by every Founders modal) — Esc-close, body-lock,
 * and theme-scoped Radix portals are all handled there.
 */

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  GCModal,
  GCPrimaryButton,
  GCSecondaryButton,
  GC_FORM_LABEL,
  GC_FORM_INPUT,
  useGCTheme,
} from "@/components/gc";
import { csrfHeaders, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface ManageGoalsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type GoalUnit = "usd" | "count" | "pct";

interface GoalRow {
  metricKey: string;
  label: string;
  unit: GoalUnit;
  unitSuffix: string;
  step: number;
}

// Canonical four-row layout. Order matches the dashboard's QuarterlyGoalsCard.
const GOAL_ROWS: GoalRow[] = [
  { metricKey: "revenue", label: "Revenue Goal", unit: "usd", unitSuffix: "USD", step: 1000 },
  { metricKey: "new_agents", label: "New Agents", unit: "count", unitSuffix: "agents", step: 1 },
  { metricKey: "override_growth", label: "Override Growth %", unit: "pct", unitSuffix: "%", step: 0.5 },
  { metricKey: "retention", label: "Retention %", unit: "pct", unitSuffix: "%", step: 0.5 },
];

export function ManageGoalsModal({ open, onOpenChange }: ManageGoalsModalProps) {
  const { theme } = useGCTheme();
  const { toast } = useToast();

  // Local input state — keyed by metricKey so the user can edit any/all rows
  // and save them independently. Reset whenever the modal opens.
  const [values, setValues] = useState<Record<string, string>>({});
  const [savingAll, setSavingAll] = useState(false);

  useEffect(() => {
    if (open) {
      setValues({});
      setSavingAll(false);
    }
  }, [open]);

  // A row is "dirty" if the user typed any non-empty numeric value into it.
  // We treat that as the set Save All will commit, mirroring the per-row
  // validation in handleSave below.
  const dirtyRows = useMemo(
    () =>
      GOAL_ROWS.filter((row) => {
        const raw = values[row.metricKey];
        if (raw === undefined || raw === "") return false;
        const num = Number(raw);
        return !Number.isNaN(num);
      }),
    [values],
  );
  const anyDirty = dirtyRows.length > 0;

  const saveMutation = useMutation({
    mutationFn: async ({
      metricKey,
      targetValue,
      unit,
    }: {
      metricKey: string;
      targetValue: number;
      unit: GoalUnit;
    }) => {
      const res = await fetch(`/api/founders/dashboard/goals/${metricKey}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(await csrfHeaders()),
        },
        credentials: "include",
        body: JSON.stringify({ targetValue, unit }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Save failed (${res.status})`);
      }
      return res.json().catch(() => ({}));
    },
    onSuccess: (_data, vars) => {
      toast({ title: `${labelFor(vars.metricKey)} updated` });
      queryClient.invalidateQueries({
        queryKey: ["/api/founders/dashboard/quarterly-goals"],
      });
    },
    onError: (e: Error) =>
      toast({
        title: "Save failed",
        description: e.message,
        variant: "destructive",
      }),
  });

  if (!open) return null;

  const handleSave = (row: GoalRow) => {
    const raw = values[row.metricKey];
    const num = Number(raw);
    if (raw === undefined || raw === "" || Number.isNaN(num)) {
      toast({
        title: "Enter a number",
        description: `${row.label} requires a numeric value.`,
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate({ metricKey: row.metricKey, targetValue: num, unit: row.unit });
  };

  // Save All — fires PUT calls in parallel for every dirty row, shows ONE
  // summary toast, and invalidates the goals query a single time so the
  // dashboard refreshes once instead of after each row.
  const saveAll = async () => {
    if (!anyDirty || savingAll) return;
    setSavingAll(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        ...(await csrfHeaders()),
      };
      await Promise.all(
        dirtyRows.map((row) =>
          fetch(`/api/founders/dashboard/goals/${row.metricKey}`, {
            method: "PUT",
            credentials: "include",
            headers,
            body: JSON.stringify({
              targetValue: Number(values[row.metricKey]),
              unit: row.unit,
            }),
          }).then(async (res) => {
            if (!res.ok) {
              const text = await res.text().catch(() => "");
              throw new Error(text || `${row.label} failed (${res.status})`);
            }
          }),
        ),
      );
      queryClient.invalidateQueries({
        queryKey: ["/api/founders/dashboard/quarterly-goals"],
      });
      toast({
        title: `${dirtyRows.length} goal${dirtyRows.length === 1 ? "" : "s"} saved`,
      });
      onOpenChange(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast({ title: "Save failed", description: msg, variant: "destructive" });
    } finally {
      setSavingAll(false);
    }
  };

  return (
    <div data-theme={theme}>
      <GCModal
        title="Manage Quarterly Goals"
        subtitle="Update your founder targets for the current quarter. Save All commits every edited row at once; per-row Save still works if you only want to commit one."
        onClose={() => onOpenChange(false)}
        width={520}
        footer={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "var(--gc-space-2)",
            }}
          >
            <GCSecondaryButton
              onClick={() => onOpenChange(false)}
              disabled={savingAll}
            >
              Cancel
            </GCSecondaryButton>
            <GCPrimaryButton onClick={saveAll} disabled={!anyDirty || savingAll}>
              {savingAll
                ? "Saving…"
                : anyDirty
                ? `Save All (${dirtyRows.length})`
                : "Save All"}
            </GCPrimaryButton>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gc-space-4)" }}>
          {GOAL_ROWS.map((row) => {
            const inputId = `goal-${row.metricKey}`;
            const isSavingThis =
              saveMutation.isPending && saveMutation.variables?.metricKey === row.metricKey;
            return (
              <div
                key={row.metricKey}
                style={{
                  borderBottom: "1px solid var(--gc-border-subtle, var(--gc-border))",
                  paddingBottom: "var(--gc-space-3)",
                }}
              >
                <label style={GC_FORM_LABEL} htmlFor={inputId}>
                  {row.label}
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "stretch",
                    gap: "var(--gc-space-2)",
                  }}
                >
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      id={inputId}
                      type="number"
                      inputMode="decimal"
                      step={row.step}
                      min={0}
                      placeholder={`Enter ${row.label.toLowerCase()}`}
                      value={values[row.metricKey] ?? ""}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, [row.metricKey]: e.target.value }))
                      }
                      style={{ ...GC_FORM_INPUT, paddingRight: "var(--gc-space-8)" }}
                      aria-label={`${row.label} target value in ${row.unitSuffix}`}
                    />
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        right: "var(--gc-space-3)",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontFamily: "var(--gc-font-body)",
                        fontSize: "var(--gc-text-xs)",
                        color: "var(--gc-text-muted)",
                        pointerEvents: "none",
                      }}
                    >
                      {row.unitSuffix}
                    </span>
                  </div>
                  <GCPrimaryButton
                    onClick={() => handleSave(row)}
                    disabled={isSavingThis}
                  >
                    {isSavingThis ? "Saving…" : "Save"}
                  </GCPrimaryButton>
                </div>
              </div>
            );
          })}
        </div>
      </GCModal>
    </div>
  );
}

function labelFor(metricKey: string): string {
  return GOAL_ROWS.find((r) => r.metricKey === metricKey)?.label ?? "Goal";
}
