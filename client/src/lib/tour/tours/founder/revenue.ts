import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const founderRevenueTour: TourConfig = {
  id: "founder.revenue",
  role: "founder",
  page: "/founders/revenue",
  label: "Revenue",
  nextTourId: "founder.hierarchy",
  nextCtaLabel: "Next: Hierarchy →",
  steps: [
    {
      popover: {
        title: "Agency-wide revenue",
        description:
          "Where every dollar comes from — by carrier, by agent, by lead spend. Same data the Finance Lounge uses, but rolled up to the founder layer with deeper splits.",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.REVENUE.PERIOD),
      popover: {
        title: "Period",
        description: "MTD, QTD, YTD, or custom range — drives every chart and table on the page.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.REVENUE.KPI_GRID),
      popover: {
        title: "Revenue KPIs",
        description:
          "Top-line numbers: total AP, distinct carriers writing, agency override income, and active producing agents.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.REVENUE.WATERFALL),
      popover: {
        title: "Revenue decomposition",
        description:
          "Waterfall breaking total revenue into its parts — carrier commission, override spread, lead-marketplace revenue. Useful for board meetings: shows exactly which lines are driving growth.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.REVENUE.SANKEY),
      popover: {
        title: "Commission flow",
        description:
          "Sankey diagram of how every premium dollar flows through the hierarchy. <strong>What to look for:</strong> a single disproportionately-wide flow means concentration risk; even flows across many agents mean healthy distribution.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.REVENUE.CARRIERS_TABLE),
      popover: {
        title: "By carrier",
        description:
          "Which carriers are producing, by deal count and total premium. Use this to decide where to push appointments next quarter.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.REVENUE.AGENTS_TABLE),
      popover: {
        title: "By agent",
        description:
          "Per-agent production for the period. Useful for the quarterly performance review or for spotting agents who've gone quiet.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.REVENUE.LEAD_REVENUE_TABLE),
      popover: {
        title: "Lead revenue",
        description:
          "Revenue from agents purchasing leads from the marketplace — a separate line from commission income. Tracked here so total agency revenue reconciles cleanly.",
        side: "top",
      },
    },
  ],
};
