import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const founderTeamPerformanceTour: TourConfig = {
  id: "founder.team-performance",
  role: "founder",
  page: "/founders/team-performance",
  label: "Team Performance",
  nextTourId: "founder.lead-distribution",
  nextCtaLabel: "Next: Lead Distribution →",
  steps: [
    {
      popover: {
        title: "Team performance",
        description:
          "Side-by-side comparison of every team in the agency. Use this to identify what high-performing teams are doing differently — and to coach the lower-quartile teams.",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.TEAM_PERF.KPI_GRID),
      popover: {
        title: "Aggregate KPIs",
        description:
          "Active agents, average quota attainment, top-performing team, and how many teams are on track. The fastest way to read the spread between your best and worst.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.TEAM_PERF.COMPARISON_CHART),
      popover: {
        title: "Comparison chart",
        description:
          "Bar chart ranking teams against each other on the active metric. The visual that drives most quarterly review conversations.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.TEAM_PERF.TEAM_CARDS),
      popover: {
        title: "Team cards",
        description:
          "Snapshot per team — manager, headcount, top metric, trend arrow. Click a card to expand the full team detail panel below.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.TEAM_PERF.AGENT_RANKINGS_TABLE),
      popover: {
        title: "Agent rankings",
        description:
          "Every agent ranked on the active metric, with their team affiliation. Useful for finding standouts inside an otherwise-average team — and underperformers inside a strong team.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.TEAM_PERF.TRENDS_CHART),
      popover: {
        title: "Trends over time",
        description:
          "Multi-line chart showing each team's metric over the selected period. Reveals which teams are accelerating versus which are flat.",
        side: "top",
      },
    },
  ],
};
