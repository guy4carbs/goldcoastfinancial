import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentHierarchyTour: TourConfig = {
  id: "agent.hierarchy",
  role: "agent",
  page: "/hcms/my/hierarchy",
  label: "Hierarchy",
  nextCtaLabel: "Finish walkthrough",
  celebrateOnFinish: true,
  steps: [
    {
      popover: {
        title: "How your commissions roll up",
        description:
          "Every agent sits somewhere in a hierarchy — a chain that determines override commissions. This page shows your level, your upline manager, and your current contract rate.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.HIERARCHY.UPLINE),
      section: "upline",
      popover: {
        title: "Your upline",
        description:
          "The person or agency above you. They earn an override on the business you write — that's how the waterfall works. When you have questions, they're your first call.",
        side: "top",
      },
    },
    {
      popover: {
        title: "Your downline",
        description:
          "Once you recruit other agents, they appear below you in the hierarchy and you earn overrides on <strong>their</strong> business. A downline section will appear here when you have one.",
      },
    },
    {
      popover: {
        title: "How override commissions work",
        description:
          "Each level earns the <strong>spread</strong> between their contract rate and the level directly below them — overrides do <strong>not</strong> skip levels. Example: Owner 120% → You 90% → Downline 80%. On $10K of premium: downline earns 80% ($8K), you earn the 10% spread ($1K), owner earns the 30% spread ($3K). Hit <strong>Finish walkthrough</strong> when you're ready.",
      },
    },
  ],
};
