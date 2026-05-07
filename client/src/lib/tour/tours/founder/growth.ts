import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const founderGrowthTour: TourConfig = {
  id: "founder.growth",
  role: "founder",
  page: "/founders/growth",
  label: "Growth",
  nextTourId: "founder.book",
  nextCtaLabel: "Next: Book of Business →",
  steps: [
    {
      popover: {
        title: "Growth metrics",
        description:
          "The leading indicators — recruitment funnel, hiring velocity, team-by-team growth. If revenue is the rear-view mirror, this page is the windshield.",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.GROWTH.KPI_GRID),
      popover: {
        title: "Growth KPIs",
        description:
          "Headcount delta, application count, pipeline conversion, and recruitment cost per agent. Fast read on whether the agency is expanding or coasting.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.GROWTH.FUNNEL_CHART),
      popover: {
        title: "Recruitment funnel",
        description:
          "From first application through approved & writing. <strong>What to look for:</strong> a steep drop at any stage is a process problem worth investigating — usually contracting documents or carrier appointment delays.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.GROWTH.HIRING_TREND),
      popover: {
        title: "Hiring trend",
        description:
          "Net new agents per period. Useful for reading the macro hiring market and forecasting next-quarter capacity.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.GROWTH.TEAMS_TABLE),
      popover: {
        title: "Per-team growth",
        description:
          "Each team's headcount, growth rate, and recruitment volume. Highlights which managers are actually building teams and which are static.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.GROWTH.TOP_PERFORMERS),
      popover: {
        title: "Top recruiters",
        description:
          "Agents and managers driving the most net-new headcount this period — strong signal for who to give override structure or recruitment incentives to.",
        side: "top",
      },
    },
  ],
};
