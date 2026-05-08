import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentHierarchyTour: TourConfig = {
  id: "agent.hierarchy",
  role: "agent",
  page: "/agents/hierarchy",
  label: "Hierarchy",
  nextTourId: "agent.commissions",
  nextCtaLabel: "Next: My Commissions →",
  steps: [
    {
      popover: {
        title: "Hierarchy",
        description:
          "Your visual <strong>upline-and-downline tree</strong>. See who recruited you, who you've recruited, and how <strong>override commissions</strong> roll up through the agency.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.HIERARCHY.HEADER),
      popover: {
        title: "Hierarchy header",
        description:
          "Your contract level, your direct upline, your direct recruit count, and the total <strong>depth</strong> of the team built below you.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.HIERARCHY.STATS),
      popover: {
        title: "Team stats",
        description:
          "Your team's <strong>total AP</strong>, active downline count, and the <strong>override pool</strong> generated for you this period — a clean read on how much your team contributes to your check.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.HIERARCHY.TREE),
      popover: {
        title: "Org tree (React Flow canvas)",
        description:
          "Interactive tree built with <strong>React Flow</strong>. <strong>Pan</strong> by dragging the canvas, <strong>zoom</strong> with scroll or pinch, and click any node to open that agent's profile.",
        side: "top",
      },
    },
    {
      popover: {
        title: "How the waterfall works",
        description:
          "Heritage uses a <strong>spread-override structure</strong>. Each level only earns the <em>spread</em> between their contract rate and the level <em>directly</em> below them — overrides never skip a level. So if your downline writes a deal, you earn the difference between your contract and theirs, and your upline earns the difference between theirs and yours. Clean, fair, and predictable.",
      },
    },
  ],
};
