import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const financeTransactionsTour: TourConfig = {
  id: "finance.transactions",
  role: "finance",
  page: "/finance/transactions",
  label: "Transactions",
  nextTourId: "finance.cashflow",
  nextCtaLabel: "Next: Cash Flow →",
  steps: [
    {
      popover: {
        title: "Transaction ledger",
        description:
          "Every financial event the agency tracks — deals submitted, verified, rejected, and lead purchases. The raw ledger underneath every KPI on the other pages.",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.TRANSACTIONS.PERIOD),
      popover: {
        title: "Period",
        description: "Narrow or widen the window.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.TRANSACTIONS.SUMMARY),
      popover: {
        title: "Summary cards",
        description:
          "Total AP, lead revenue, deal count, and lead-purchase count for the period. Your quick read before filtering.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.TRANSACTIONS.TABS),
      popover: {
        title: "Deal lifecycle tabs",
        description:
          "<strong>Submitted</strong> = agent has sent it in. <strong>Verified</strong> = carrier confirmed and issued. <strong>Rejected</strong> = declined. <strong>Lead Purchases</strong> = marketplace lead spend (expense, not revenue).",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.TRANSACTIONS.TABLE),
      popover: {
        title: "The ledger",
        description:
          "Date, status badge, description, carrier reference (truncated monospace), and annual premium. Searchable. Any row drill-in goes to the source deal.",
        side: "top",
      },
    },
    {
      popover: {
        title: "How to use this page",
        description:
          "If a KPI on the dashboard looks off, come here. Filter to the relevant tab, scope the period, and scan the status distribution — bad totals almost always trace back to an unusual rejection rate or a mis-coded status.",
      },
    },
  ],
};
