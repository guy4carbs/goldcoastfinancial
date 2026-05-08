import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentClientsTour: TourConfig = {
  id: "agent.clients",
  role: "agent",
  page: "/agents/clients",
  label: "Clients",
  nextTourId: "agent.claims",
  nextCtaLabel: "Next: Claims →",
  steps: [
    {
      popover: {
        title: "Clients",
        description:
          "Everyone you've written or are <strong>actively servicing</strong>. Filter by status, search by name, and open any client for the full profile and policy history.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.CLIENTS.HEADER),
      popover: {
        title: "Clients header",
        description:
          "Quick actions: <strong>add a client</strong>, <strong>import a list</strong>, or jump to recent activity. The starting line for any client management work.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.CLIENTS.STATS),
      popover: {
        title: "Client stats",
        description:
          "Counts by status — <strong>active</strong>, <strong>pending</strong>, <strong>onboarding</strong>, <strong>inactive</strong>, and <strong>churned</strong>. Color codes match the cards below for fast scanning.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.CLIENTS.SEARCH),
      popover: {
        title: "Search",
        description:
          "Find a client by <strong>name</strong>, <strong>email</strong>, or <strong>phone</strong>. Search runs across every status, so churned and inactive clients are still reachable for win-backs.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.CLIENTS.GRID),
      popover: {
        title: "Client cards",
        description:
          "Each card shows the <strong>status color</strong>, premium, last contact date, and a one-click into the full client profile with <em>policy and activity history</em>.",
        side: "top",
      },
    },
  ],
};
