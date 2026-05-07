import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const founderHierarchyTour: TourConfig = {
  id: "founder.hierarchy",
  role: "founder",
  page: "/founders/hierarchy",
  label: "Hierarchy",
  nextTourId: "founder.growth",
  nextCtaLabel: "Next: Growth →",
  steps: [
    {
      popover: {
        title: "The org chart",
        description:
          "Same hierarchy view the admin HCMS uses — every agent, every team, every contract level. Reused as-is, so any change here syncs everywhere.",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.HIERARCHY.ROOT),
      popover: {
        title: "React Flow tree",
        description:
          "Pan, zoom, and drag the tree. Click any node to open its detail drawer — agency, team, or individual agent. Nodes are colored by depth so the structure is readable at a glance.",
        side: "top",
      },
    },
    {
      popover: {
        title: "Why founders care",
        description:
          "Hierarchy drives every override calculation downstream. A single move here can ripple millions in lifetime override income. Treat edits with the same caution you'd apply to a contract amendment.",
      },
    },
    {
      popover: {
        title: "Override waterfall reminder",
        description:
          "Each level earns the <strong>spread</strong> between their contract rate and the level directly below — never skipping levels. Owner 120% → Director 90% → Agent 80% on $10K AP: agent earns $8K, director earns $1K spread, owner earns $3K spread.",
      },
    },
  ],
};
