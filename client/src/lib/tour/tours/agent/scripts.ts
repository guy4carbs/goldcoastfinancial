import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentScriptsTour: TourConfig = {
  id: "agent.scripts",
  role: "agent",
  page: "/agents/scripts",
  label: "Scripts",
  nextTourId: "agent.recruiting",
  nextCtaLabel: "Next: Recruiting →",
  steps: [
    {
      popover: {
        title: "Scripts",
        description:
          "<strong>Proven phone scripts</strong> for openers, rebuttals, and closes. Read inline, save your favorites, and pull them up next to the dialer when you call.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.SCRIPTS.HEADER),
      popover: {
        title: "Scripts header",
        description:
          "Your <strong>favorited scripts</strong>, recently used, and quick links to <strong>product-specific decks</strong>. The fast lane to the words you actually use most.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.SCRIPTS.CATEGORIES),
      popover: {
        title: "Categories",
        description:
          "<strong>Phone openers</strong>, <strong>voicemails</strong>, <strong>rebuttals</strong>, <strong>closes</strong> — organized by call stage so you can grab the right one mid-conversation without panic.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.SCRIPTS.SEARCH),
      popover: {
        title: "Search scripts",
        description:
          "Type a phrase or objection — <em>\"too expensive,\" \"call me later,\" \"I'll think about it\"</em> — and the matching rebuttal pops up instantly. Built for live-call use.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.SCRIPTS.LIST),
      popover: {
        title: "Script list",
        description:
          "Click any script to open inline. Tap the <strong>star</strong> to favorite it for one-click access from the dialer. Scripts get sharper the more you use yours.",
        side: "top",
      },
    },
  ],
};
