import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentQuotesTour: TourConfig = {
  id: "agent.quotes",
  role: "agent",
  page: "/agents/quotes",
  label: "Quotes",
  nextTourId: "agent.data-encryption",
  nextCtaLabel: "Next: Data Encryption →",
  steps: [
    {
      popover: {
        title: "Quotes",
        description:
          "Pull <strong>live quotes from 12 carriers</strong> in seconds. Save, share, and track every quote you've sent — no more chasing rate sheets across browser tabs.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.QUOTES.HEADER),
      popover: {
        title: "Quotes header",
        description:
          "Your <strong>active carrier appointments</strong> and quote totals show here. Quick path to your most recent saved quotes for follow-up calls.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.QUOTES.STATS),
      popover: {
        title: "Quote stats",
        description:
          "<strong>Quotes sent</strong>, <strong>opened</strong>, and <strong>converted</strong>. Your conversion rate is your honest mirror — keep an eye on it and the rest of the funnel follows.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.QUOTES.CREATE),
      popover: {
        title: "New quote",
        description:
          "Run a <strong>multi-carrier comparison</strong> in one form. Age, health, face amount, term — we hit all 12 carriers and rank by price so you present the best three.",
        side: "left",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.QUOTES.TABS),
      popover: {
        title: "All · Active · Archived",
        description:
          "Filter by status. <strong>Active</strong> quotes are still in play, <strong>archived</strong> are done — kept for reference and re-quotes down the road when rates change.",
        side: "bottom",
      },
    },
  ],
};
