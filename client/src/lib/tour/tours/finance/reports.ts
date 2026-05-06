import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const financeReportsTour: TourConfig = {
  id: "finance.reports",
  role: "finance",
  page: "/finance/reports",
  label: "Reports",
  nextCtaLabel: "Finish walkthrough",
  celebrateOnFinish: true,
  steps: [
    {
      popover: {
        title: "Financial reports",
        description:
          "Rolled-up reports for board meetings, CPA hand-offs, and internal reviews. Period-scoped, one-click CSV export.",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.REPORTS.PERIOD),
      popover: {
        title: "Period",
        description: "Narrow the reports to MTD, YTD, or a custom range.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.REPORTS.EXPORT_BUTTON),
      popover: {
        title: "Export to CSV",
        description:
          "One click pulls every visible report out as a CSV — ready to drop into a CPA's system or a board deck.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.REPORTS.REPORT_CARDS),
      popover: {
        title: "Three core reports",
        description:
          "<strong>P&L Summary</strong> (revenue vs expense), <strong>Commission Summary</strong> (per-carrier breakdown), and <strong>Agent Performance</strong> (top producers, laggards, period deltas). All driven off the same underlying ledger as the other finance pages — numbers reconcile.",
        side: "top",
      },
    },
    {
      popover: {
        title: "That's the full Finance walkthrough",
        description:
          "You've seen every view in the Finance Lounge. Click <strong>Finish walkthrough</strong> for a wrap-up — the <em>Take the tour</em> button bottom-right replays any page's tour any time.",
      },
    },
  ],
};
