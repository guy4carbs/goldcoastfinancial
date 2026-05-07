import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const founderBookTour: TourConfig = {
  id: "founder.book",
  role: "founder",
  page: "/founders/book",
  label: "Book of Business",
  nextTourId: "founder.team-performance",
  nextCtaLabel: "Next: Team Performance →",
  steps: [
    {
      popover: {
        title: "Book of business",
        description:
          "The full client list rolled up across every team and every agent in the agency. The asset you'd be selling if you ever sold the agency.",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.BOOK.KPI_GRID),
      popover: {
        title: "Book KPIs",
        description:
          "Total clients, total in-force premium, average policy size, persistency rate. The four numbers a buyer would ask about first.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.BOOK.TEAMS_TABLE),
      popover: {
        title: "By team",
        description:
          "Each team's contribution to the book. Click a team to drill into the team drawer; from there into individual agents; from there into individual clients.",
        side: "top",
      },
    },
    {
      popover: {
        title: "Three-level drilldown",
        description:
          "<strong>Team → Agent → Client.</strong> Click any team row to open its drawer; click an agent inside that drawer to see their personal book; click a client to see policy detail. All three levels stay visible at once for easy comparison.",
      },
    },
    {
      popover: {
        title: "Why this matters",
        description:
          "Book quality compounds. Persistency over 90% across the agency is the single biggest driver of long-term carrier compensation tier. Watch it like a hawk.",
      },
    },
  ],
};
