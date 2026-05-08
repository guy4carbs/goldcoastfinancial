import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentAvatarCouncilTour: TourConfig = {
  id: "agent.avatar-council",
  role: "agent",
  page: "/agents/avatar-council",
  label: "Avatar Council",
  nextTourId: "agent.leaderboard",
  nextCtaLabel: "Next: Leaderboard →",
  steps: [
    {
      popover: {
        title: "Avatar Council",
        description:
          "A virtual board of <strong>AI advisors</strong> — sales coach, underwriter, marketer, recruiter. Ask any of them for help and get an answer tuned to <em>that lens</em>, not generic AI fluff.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.AVATAR_COUNCIL.HEADER),
      popover: {
        title: "Council header",
        description:
          "Your <strong>active advisor</strong>, recent conversations, and a quick way to reset the chat for a fresh question. Each session keeps context until you reset.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.AVATAR_COUNCIL.AVATAR_SELECTOR),
      popover: {
        title: "Pick an advisor",
        description:
          "Each avatar is a different specialist with its own personality and playbook. The <em>same question</em> gets very different answers from a sales coach versus an underwriter — pick the one whose perspective fits the problem.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.AVATAR_COUNCIL.MESSAGES),
      popover: {
        title: "Conversation",
        description:
          "Multi-turn chat that <strong>remembers your context</strong>. Use it for <strong>objection prep</strong>, <strong>recruiting pitches</strong>, workflow ideas, or just talking through a tough case.",
        side: "left",
      },
    },
  ],
};
