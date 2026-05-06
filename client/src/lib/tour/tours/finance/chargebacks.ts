import type { TourConfig } from "../../types";

export const financeChargebacksTour: TourConfig = {
  id: "finance.chargebacks",
  role: "finance",
  page: "/finance/chargebacks",
  label: "Chargebacks",
  nextTourId: "finance.reconciliation",
  nextCtaLabel: "Next: Reconciliation →",
  steps: [
    {
      popover: {
        title: "Chargebacks",
        description:
          "When a policy lapses in the early months, the carrier claws back the advance commission. This page will track those chargebacks — per agent, per carrier, per timeframe.",
      },
    },
    {
      popover: {
        title: "What this will track",
        description:
          "Chargeback balance per agent (net debt), recent clawbacks by carrier, chargeback aging buckets, and the hierarchy roll-up (when a downline chargeback ripples back up the spread).",
      },
    },
    {
      popover: {
        title: "What to do today",
        description:
          "Placeholder until carrier statement ingestion lands. Chargebacks currently surface on carrier statements — check those directly if you need a per-agent balance before this page is live. Ops tracks agency-wide chargeback totals in the monthly finance spreadsheet.",
      },
    },
  ],
};
