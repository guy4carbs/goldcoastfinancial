import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const founderProfitSplitTour: TourConfig = {
  id: "founder.profit-split",
  role: "founder",
  page: "/founders/profit-split",
  label: "Profit Split",
  nextTourId: "founder.access",
  nextCtaLabel: "Next: Access →",
  steps: [
    {
      popover: {
        title: "Profit split ledger",
        description:
          "How agency profit gets split among the founders — your personal share, your partners' shares, and the retained portion. The most sensitive page in the app.",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.PROFIT_SPLIT.PERIOD),
      popover: {
        title: "Period",
        description:
          "Each split runs against a defined period (usually monthly or quarterly). The ledger only shows entries within the selected window.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.PROFIT_SPLIT.KPI_GRID),
      popover: {
        title: "Period totals",
        description:
          "Total profit, total deposited, projected next-period split, and current cash position. The four numbers a founder reads before any equity conversation.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.PROFIT_SPLIT.SPLIT_CARD),
      popover: {
        title: "Per-founder split",
        description:
          "Each named founder's share for the period — their percentage, their dollar amount, year-to-date totals. Numbers reconcile cleanly with the deposits below.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.PROFIT_SPLIT.TIMELINE_CHART),
      popover: {
        title: "Timeline",
        description:
          "Period-over-period split history. Shows whether profit is trending up, founders are getting paid consistently, or whether retained earnings are growing.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.PROFIT_SPLIT.LEDGER_TABLE),
      popover: {
        title: "Deposit ledger",
        description:
          "Every deposit logged — date, recipient, amount, source. Searchable. This is the auditable trail your CPA will pull for tax filings.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.PROFIT_SPLIT.ADD_DEPOSIT_BUTTON),
      popover: {
        title: "Log a deposit",
        description:
          "Manual entry for a deposit that already happened. Required fields: date, recipient, amount, source. Once logged, it shows up in the ledger and reconciles into the period totals.",
        side: "left",
      },
    },
    {
      popover: {
        title: "Quorum on edits",
        description:
          "Changes to split percentages require <strong>founder quorum</strong> — at least two founders must approve before a percentage change takes effect. The Notifications bell surfaces pending quorum requests.",
      },
    },
  ],
};
