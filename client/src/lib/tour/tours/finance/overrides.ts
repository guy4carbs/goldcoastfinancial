import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const financeOverridesTour: TourConfig = {
  id: "finance.overrides",
  role: "finance",
  page: "/finance/overrides",
  label: "Commission Overrides",
  nextTourId: "finance.transactions",
  nextCtaLabel: "Next: Transactions →",
  steps: [
    {
      popover: {
        title: "Commission overrides",
        description:
          "How the agency makes money on top of direct agent commissions — the <strong>spread</strong> between contract levels in the hierarchy, rolled up per premium submitted.",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.OVERRIDES.KPI_GRID),
      popover: {
        title: "Override KPIs",
        description:
          "Four metrics: estimated override income, average spread %, number of active override chains, and pending calculations awaiting reconciliation.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.OVERRIDES.SANKEY),
      popover: {
        title: "Commission flow",
        description:
          "Sankey diagram showing how each premium dollar flows through the hierarchy — from submitted AP down through downline, upline, and agency principal. Flow width represents dollars. <strong>What to look for:</strong> a single disproportionately-wide flow is concentration risk (one producer carrying the agency); flat flows across many agents mean healthy distribution.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.OVERRIDES.EXPLAINER),
      popover: {
        title: "How the math works",
        description:
          "Each level earns the <strong>spread</strong> between their contract rate and the level directly below. Example: Owner 120% → you 90% → downline 80% on $10K premium — downline earns $8K, you earn the 10% spread ($1K), owner earns the 30% spread ($3K). Overrides never skip a level.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.OVERRIDES.HISTORY_TABLE),
      popover: {
        title: "Override history",
        description:
          "Every override calculation logged over the selected period — date, agent, deal AP, spread %, level, upline, and status. Searchable. Click any row to trace the full calculation.",
        side: "top",
      },
    },
  ],
};
