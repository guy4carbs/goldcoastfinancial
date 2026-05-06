import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const adminCarriersTour: TourConfig = {
  id: "admin.carriers",
  role: "admin",
  page: "/hcms/carriers",
  label: "Carriers Directory",
  nextTourId: "admin.hierarchy",
  nextCtaLabel: "Next: Hierarchy →",
  steps: [
    {
      popover: {
        title: "Carriers Directory",
        description:
          "Every carrier the agency is appointed with — plus the ones you've added manually for future contracting. This is the source of truth when you're deciding which carrier to match an agent with.",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CARRIERS.TABS),
      section: "filters",
      popover: {
        title: "Filter by product line",
        description:
          "Narrow the list to <strong>Life</strong>, <strong>Annuity</strong>, or <strong>Final Expense</strong> — or see all carriers across all product lines.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CARRIERS.SEARCH),
      section: "filters",
      popover: {
        title: "Search",
        description: "Quick find by carrier name. Matches as you type.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CARRIERS.LIST),
      section: "list",
      popover: {
        title: "Carrier details",
        description:
          "Each row has the carrier's AM Best rating, licensed states, product lines, appointment count, and contact information. Click to expand.",
        side: "top",
      },
    },
  ],
};
