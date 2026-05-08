import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentGuidelinesTour: TourConfig = {
  id: "agent.guidelines",
  role: "agent",
  page: "/agents/guidelines",
  label: "Guidelines",
  nextTourId: "agent.ideas",
  nextCtaLabel: "Next: Ideas & Feedback →",
  steps: [
    {
      popover: {
        title: "Guidelines",
        description:
          "Heritage Life Solutions <strong>core values</strong>, <strong>daily expectations</strong>, and the <strong>agency schedule</strong>. Read this once on day one and revisit any time you want a reset.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.GUIDELINES.HEADER),
      popover: {
        title: "Guidelines header",
        description:
          "Quick anchors to the three sections — <strong>values</strong>, <strong>expectations</strong>, and <strong>schedule</strong>. Everything important lives one click below.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.GUIDELINES.CORE_VALUES),
      popover: {
        title: "Core values",
        description:
          "What we stand for as an agency — how we treat clients, our team, and our work. <em>Not just words on a page</em>: every policy, every commission decision, every recruit pitch flows from these.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.GUIDELINES.EXPECTATIONS),
      popover: {
        title: "Daily expectations",
        description:
          "Activity standards — <strong>calls</strong>, <strong>quotes</strong>, <strong>follow-ups</strong>, and <strong>training hours</strong>. Hit these consistently and the results follow. Miss them, and the comp plan tells the truth.",
        side: "left",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.GUIDELINES.SCHEDULE),
      popover: {
        title: "Daily schedule timeline",
        description:
          "<strong>8:30 AM – 6:00 PM</strong>, broken into prospecting, appointments, training, and admin blocks. The recommended rhythm that top producers run — copy it, tweak it, but don't ignore it.",
        side: "top",
      },
    },
  ],
};
