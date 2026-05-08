import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentIdeasTour: TourConfig = {
  id: "agent.ideas",
  role: "agent",
  page: "/agents/ideas",
  label: "Ideas",
  nextTourId: "agent.settings",
  nextCtaLabel: "Next: Settings →",
  steps: [
    {
      popover: {
        title: "Ideas board",
        description:
          "Suggest improvements, request features, and <strong>upvote</strong> what your fellow agents have shared. The product team genuinely reads these — many of the lounge's best features started here.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.IDEAS.HEADER),
      popover: {
        title: "Ideas header",
        description:
          "Total ideas submitted, <strong>your contributions</strong>, and what's recently shipped from the board. Proof the loop closes.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.IDEAS.STATS),
      popover: {
        title: "Idea stats",
        description:
          "Ideas by status — <strong>new</strong>, <strong>planned</strong>, <strong>in progress</strong>, <strong>shipped</strong>, <strong>declined</strong>. Lets you see velocity and what's likely to land soon.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.IDEAS.FORM),
      popover: {
        title: "Submit an idea",
        description:
          "<strong>Title</strong>, <strong>category</strong>, <strong>priority</strong>, and a quick description. Be specific — the best ideas describe a real workflow pain in one paragraph.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.IDEAS.LIST),
      popover: {
        title: "Idea feed",
        description:
          "Browse the active board, <strong>upvote</strong> what you'd benefit from, and comment to flesh out the use case. <em>Top-voted ideas climb the queue</em> — your votes shape the roadmap.",
        side: "top",
      },
    },
  ],
};
