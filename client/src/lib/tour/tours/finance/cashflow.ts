import type { TourConfig } from "../../types";

export const financeCashflowTour: TourConfig = {
  id: "finance.cashflow",
  role: "finance",
  page: "/finance/cashflow",
  label: "Cash Flow",
  nextTourId: "finance.chargebacks",
  nextCtaLabel: "Next: Chargebacks →",
  steps: [
    {
      popover: {
        title: "Cash Flow",
        description:
          "Working-capital view — money in vs. money out, carrier payout timing, and runway. Separate from the Transactions ledger: that's <em>events</em>, this is <em>timing</em>.",
      },
    },
    {
      popover: {
        title: "What this will show",
        description:
          "When the feature ships: carrier-by-carrier payout schedules, expected vs. actual deposit dates, advance/renewal split, lead-spend burn rate, and a running bank-balance forecast.",
      },
    },
    {
      popover: {
        title: "What to do today",
        description:
          "This page is a placeholder until carrier payout ingestion lands. Until then, Revenue and Transactions cover what's been submitted; bank balance lives in the accounting system. Ping ops if you need a mid-period cash position.",
      },
    },
  ],
};
