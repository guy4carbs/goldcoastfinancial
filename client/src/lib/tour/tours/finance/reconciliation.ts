import type { TourConfig } from "../../types";

export const financeReconciliationTour: TourConfig = {
  id: "finance.reconciliation",
  role: "finance",
  page: "/finance/reconciliation",
  label: "Reconciliation",
  nextTourId: "finance.statements",
  nextCtaLabel: "Next: Statements →",
  steps: [
    {
      popover: {
        title: "Reconciliation",
        description:
          "Match what we <em>expected</em> to be paid by each carrier against what actually hit the bank. The guardrail that catches missed commissions, double-pays, and carrier errors.",
      },
    },
    {
      popover: {
        title: "What this will do",
        description:
          "Auto-match carrier statement lines to expected commission calculations. Flag discrepancies (variance > $1 or > 2%) for human review. Export a dispute packet for the carrier when something's wrong.",
      },
    },
    {
      popover: {
        title: "What to do today",
        description:
          "Placeholder — reconciliation is currently a manual monthly process. Ops downloads each carrier's statement, cross-references against the expected commission export, and flags variances in the shared finance spreadsheet. If you're doing the monthly review, start there.",
      },
    },
  ],
};
