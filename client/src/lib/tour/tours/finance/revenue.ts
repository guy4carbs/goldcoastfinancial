import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const financeRevenueTour: TourConfig = {
  id: "finance.revenue",
  role: "finance",
  page: "/finance/revenue",
  label: "Revenue",
  nextTourId: "finance.overrides",
  nextCtaLabel: "Next: Overrides →",
  steps: [
    {
      popover: {
        title: "Revenue view",
        description:
          "Drill into where premium is actually coming from — split by carrier and by agent. Same period selector as the Command Center, same AP definition.",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.REVENUE.PERIOD),
      popover: {
        title: "Scope the data",
        description: "YTD, MTD, or custom range — drives the whole page.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.REVENUE.KPI_GRID),
      popover: {
        title: "Revenue totals",
        description:
          "Four rolled-up numbers: total AP, distinct carriers, estimated agency override, and active agents for the period.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.REVENUE.CHART),
      popover: {
        title: "AP by quarter",
        description:
          "Quarterly trend of submitted premium. Useful for spotting seasonality or comparing period-over-period growth.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.REVENUE.CARRIERS_TABLE),
      popover: {
        title: "By carrier",
        description:
          "Which carriers are producing. Use this when you're deciding where to push appointments — if one carrier's premium is growing fast, double down; if it's stagnant, time to reassess. Sortable; click a carrier to drill in.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.REVENUE.AGENTS_TABLE),
      popover: {
        title: "By agent",
        description:
          "Per-agent production for the period. Use this for performance reviews, identifying top producers, and spotting agents who've gone quiet. Searchable by name.",
        side: "top",
      },
    },
  ],
};
