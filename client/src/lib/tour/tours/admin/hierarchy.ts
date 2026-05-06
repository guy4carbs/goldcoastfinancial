import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const adminHierarchyTour: TourConfig = {
  id: "admin.hierarchy",
  role: "admin",
  page: "/hcms/hierarchy",
  label: "Hierarchy",
  nextTourId: "admin.contracting-overview",
  nextCtaLabel: "Next: Contracting →",
  steps: [
    {
      popover: {
        title: "Org hierarchy",
        description:
          "Who reports to whom, contract levels, and the override waterfall. This is the source for every commission calculation downstream.",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.HIERARCHY.VIEW_TOGGLE),
      section: "controls",
      popover: {
        title: "Tree vs. table view",
        description:
          "<strong>Tree</strong> for the visual org chart, <strong>table</strong> when you need to sort, search, or export. Both drive off the same data.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.HIERARCHY.TREE),
      section: "tree",
      popover: {
        title: "Visual hierarchy",
        description:
          "Each node shows the agent's title, contract level, and downline count. Collapse/expand to drill into a specific team.",
        side: "top",
      },
    },
    {
      popover: {
        title: "Override waterfall",
        description:
          "Each level earns the <strong>spread</strong> between their contract rate and the level directly below them — overrides never skip levels. Moving an agent changes the spread, so hierarchy edits ripple through commissions.",
      },
    },
  ],
};
