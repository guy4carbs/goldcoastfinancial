import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentDealsTour: TourConfig = {
  id: "agent.deals",
  role: "agent",
  page: "/agents/deals",
  label: "Deals",
  nextTourId: "agent.clients",
  nextCtaLabel: "Next: My Clients →",
  steps: [
    {
      popover: {
        title: "Deals",
        description:
          "The <strong>live deal feed</strong> across the entire agency — every closed sale in chronological order. See what your team is writing right now and ride the wave.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DEALS.HEADER),
      popover: {
        title: "Deals header",
        description:
          "Switch the period, filter by <strong>carrier</strong> or <strong>product</strong>, and jump to the top performers. Your control panel for slicing the agency feed.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DEALS.STATS),
      popover: {
        title: "Deal stats",
        description:
          "<strong>Total deals</strong>, <strong>AP written</strong>, <strong>average deal size</strong>, and <strong>growth versus last period</strong>. Refreshes every time a teammate closes.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DEALS.PERIOD),
      popover: {
        title: "Period filter",
        description:
          "Toggle between <strong>week</strong>, <strong>month</strong>, and <strong>all time</strong> to see the feed and leaderboard for that window. Daily can be motivating; all-time keeps you honest.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DEALS.FEED),
      popover: {
        title: "Live deal feed",
        description:
          "Real deals as they happen — agent name, <strong>carrier</strong>, <strong>product</strong>, <strong>premium</strong>. A great motivator on the slow days and proof that the agency is moving.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DEALS.LEADERBOARD),
      popover: {
        title: "Top 20 leaderboard",
        description:
          "The <strong>top 20 agents by AP</strong> for the active period. Land here and you've earned bragging rights — and probably a lot more lead capacity.",
        side: "left",
      },
    },
  ],
};
