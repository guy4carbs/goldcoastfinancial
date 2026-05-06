/**
 * CashBalanceModal — single-form modal for posting a manual cash balance entry
 * for a Founders bank/account. Used when no Plaid connection is available
 * (or as a quick override) so the dashboard's Cash Flow card always has a
 * source of truth.
 *
 * Posts to `POST /api/founders/dashboard/cash-balance`. The server appends a
 * snapshot row to the cash-balance ledger; the dashboard's cash-flow query
 * is invalidated on success so the new balance lights up immediately.
 */

import { useEffect, useState } from "react";
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

export interface CashBalanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CashBalanceForm {
  accountLabel: string;
  last4: string;
  amountUsd: string;
  asOfDate: string;
  notes: string;
}

function todayIso(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const EMPTY_FORM: CashBalanceForm = {
  accountLabel: "",
  last4: "",
  amountUsd: "",
  asOfDate: todayIso(),
  notes: "",
};

export function CashBalanceModal({ open, onOpenChange }: CashBalanceModalProps) {
  const { theme } = useGCTheme();
  const { toast } = useToast();
  const [form, setForm] = useState<CashBalanceForm>(EMPTY_FORM);

  // Reset on open so reopening starts clean (and date defaults to today again).
  useEffect(() => {
    if (open) setForm({ ...EMPTY_FORM, asOfDate: todayIso() });
  }, [open]);

  const submitMutation = useMutation({
    mutationFn: async (payload: CashBalanceForm) => {
      const amount = Number(payload.amountUsd);
      if (Number.isNaN(amount)) throw new Error("Amount must be a number.");
      if (!payload.accountLabel.trim()) throw new Error("Account label is required.");
      if (!/^\d{4}$/.test(payload.last4)) throw new Error("Last 4 must be 4 digits.");
      if (!payload.asOfDate) throw new Error("As-of date is required.");

      const body = {
        accountLabel: payload.accountLabel.trim(),
        last4: payload.last4,
        amountCents: Math.round(amount * 100),
        asOfDate: payload.asOfDate,
        notes: payload.notes.trim() || null,
      };

      const res = await fetch("/api/founders/dashboard/cash-balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await csrfHeaders()),
        },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Save failed (${res.status})`);
      }
      return res.json().catch(() => ({}));
    },
    onSuccess: () => {
      toast({ title: "Cash balance updated" });
      queryClient.invalidateQueries({
        queryKey: ["/api/founders/dashboard/cash-flow"],
      });
      // Cash position also feeds the KPI strip — invalidate so the tile
      // refreshes immediately instead of waiting for the 60s stale window.
      queryClient.invalidateQueries({
        queryKey: ["/api/founders/dashboard/kpis"],
      });
      onOpenChange(false);
    },
    onError: (e: Error) =>
      toast({
        title: "Save failed",
        description: e.message,
        variant: "destructive",
      }),
  });

  if (!open) return null;

  const update = (k: keyof CashBalanceForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div data-theme={theme}>
      <GCModal
        title="Add / Update Cash Balance"
        subtitle="Record a manual snapshot for an account that isn't connected via Plaid. The dashboard's cash position will update once saved."
        onClose={() => onOpenChange(false)}
        width={520}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--gc-space-2)" }}>
            <GCSecondaryButton onClick={() => onOpenChange(false)} disabled={submitMutation.isPending}>
              Cancel
            </GCSecondaryButton>
            <GCPrimaryButton
              onClick={() => submitMutation.mutate(form)}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Saving…" : "Save Balance"}
            </GCPrimaryButton>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gc-space-4)" }}>
          <div>
            <label style={GC_FORM_LABEL} htmlFor="cash-account-label">Account label</label>
            <input
              id="cash-account-label"
              type="text"
              value={form.accountLabel}
              onChange={update("accountLabel")}
              placeholder="e.g. Chase Operating"
              style={GC_FORM_INPUT}
            />
          </div>

          <div>
            <label style={GC_FORM_LABEL} htmlFor="cash-last4">Last 4 of account number</label>
            <input
              id="cash-last4"
              type="text"
              value={form.last4}
              onChange={(e) =>
                setForm((p) => ({ ...p, last4: e.target.value.replace(/\D/g, "").slice(0, 4) }))
              }
              placeholder="1234"
              maxLength={4}
              inputMode="numeric"
              style={GC_FORM_INPUT}
              aria-describedby="cash-last4-help"
            />
            <div
              id="cash-last4-help"
              style={{
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-xs)",
                color: "var(--gc-text-muted)",
                marginTop: 4,
              }}
            >
              4 digits — used to disambiguate accounts in the dashboard list.
            </div>
          </div>

          <div>
            <label style={GC_FORM_LABEL} htmlFor="cash-amount">Amount (USD)</label>
            <input
              id="cash-amount"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={form.amountUsd}
              onChange={update("amountUsd")}
              placeholder="125000.00"
              style={GC_FORM_INPUT}
            />
          </div>

          <div>
            <label style={GC_FORM_LABEL} htmlFor="cash-asof">As-of date</label>
            <input
              id="cash-asof"
              type="date"
              value={form.asOfDate}
              onChange={update("asOfDate")}
              style={GC_FORM_INPUT}
              max={todayIso()}
            />
          </div>

          <div>
            <label style={GC_FORM_LABEL} htmlFor="cash-notes">Notes (optional)</label>
            <textarea
              id="cash-notes"
              value={form.notes}
              onChange={update("notes")}
              placeholder="Source / context for this snapshot…"
              rows={3}
              style={{
                ...GC_FORM_INPUT,
                resize: "vertical",
                minHeight: 72,
                fontFamily: "var(--gc-font-body)",
              }}
            />
          </div>
        </div>
      </GCModal>
    </div>
  );
}
