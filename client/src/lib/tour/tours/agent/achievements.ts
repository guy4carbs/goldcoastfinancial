import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentAchievementsTour: TourConfig = {
  id: "agent.achievements",
  role: "agent",
  page: "/agents/achievements",
  label: "Achievements",
  nextTourId: "agent.hierarchy",
  nextCtaLabel: "Next: My Hierarchy →",
  steps: [
    {
      popover: {
        title: "Achievements",
        description:
          "Badges for every milestone — first deal, ten deals, six-figure month, and the rarities reserved for elite producers. A little fun to mark the long road.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.ACHIEVEMENTS.HEADER),
      popover: {
        title: "Achievements header",
        description:
          "Total badges earned, your <strong>latest unlock</strong>, and the points contributing to your <strong>level</strong>. A quick celebration of where you've been.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.ACHIEVEMENTS.FILTER_TABS),
      popover: {
        title: "Filter tabs",
        description:
          "<strong>All</strong>, <strong>Unlocked</strong>, <strong>In progress</strong>, and <strong>Locked</strong>. The <em>In progress</em> tab is the most useful — it shows exactly what's next and how close you are.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.ACHIEVEMENTS.GRID),
      popover: {
        title: "Badge grid & rarity tiers",
        description:
          "Each badge has a rarity tier — <strong>common</strong> → <strong>uncommon</strong> → <strong>rare</strong> → <strong>epic</strong> → <strong>legendary</strong>. The rarer the tier, the bigger the flex. Hover any badge to see the unlock condition.",
        side: "top",
      },
    },
  ],
};
