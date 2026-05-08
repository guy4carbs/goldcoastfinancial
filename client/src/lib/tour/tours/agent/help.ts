import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentHelpTour: TourConfig = {
  id: "agent.help",
  role: "agent",
  page: "/agents/help",
  label: "Help",
  nextCtaLabel: "Finish walkthrough",
  celebrateOnFinish: true,
  steps: [
    {
      popover: {
        title: "Help center",
        description:
          "Searchable help articles, quick links to common tasks, and a clear path to <strong>live support</strong> if you can't find what you need. The safety net for everything else in the lounge.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.HELP.HEADER),
      popover: {
        title: "Help header",
        description:
          "Top tasks people open the help center for, plus a <strong>contact support</strong> link when self-serve isn't enough.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.HELP.SEARCH),
      popover: {
        title: "Search the help center",
        description:
          "Type any plain-English question — <em>\"how do I file a claim,\" \"reset my password,\" \"buy leads\"</em> — and the best matches surface instantly with the exact step-by-step answer.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.HELP.CATEGORIES),
      popover: {
        title: "Categories",
        description:
          "Browse by topic when you don't know exactly what to search — <strong>onboarding</strong>, <strong>dialer</strong>, <strong>commissions</strong>, <strong>recruiting</strong>, and more.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.HELP.ARTICLES),
      popover: {
        title: "Articles",
        description:
          "Step-by-step walkthroughs with screenshots. Most answers are two or three clicks away — and if not, a real human is one form away.",
        side: "left",
      },
    },
    {
      popover: {
        title: "You've finished the full Agent Lounge tour 🎉",
        description:
          "That's every view in your Heritage lounge. <strong>Welcome home, agent</strong> — this is your command center now. Click <strong>Finish walkthrough</strong> for your celebration, and remember: the <em>Take the tour</em> button bottom-right replays any page's tour any time you want a refresher. Now go write some business.",
      },
    },
  ],
};
