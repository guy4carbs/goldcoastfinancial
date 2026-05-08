import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentLeaderboardTour: TourConfig = {
  id: "agent.leaderboard",
  role: "agent",
  page: "/agents/leaderboard",
  label: "Leaderboard",
  nextTourId: "agent.achievements",
  nextCtaLabel: "Next: Achievements →",
  steps: [
    {
      popover: {
        title: "Leaderboard",
        description:
          "The agency-wide ranking. Your <strong>name</strong>, your <strong>number</strong>, your <strong>spot</strong>. Healthy competition that fuels everyone forward.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.LEADERBOARD.HEADER),
      popover: {
        title: "Leaderboard header",
        description:
          "Your <strong>current rank</strong> and exactly how much AP it would take to climb one more spot. The math is friendlier than it looks.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.LEADERBOARD.TIME_RANGE),
      popover: {
        title: "Time range",
        description:
          "<strong>Week</strong>, <strong>month</strong>, or <strong>all time</strong>. Switch the lens to see who's hot right now versus the all-time greats — your role models live in both.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.LEADERBOARD.PODIUM),
      popover: {
        title: "Top 3 podium",
        description:
          "The current <strong>top three</strong> with their photo, AP, and deal count. Make this you — and study what they're doing while you're at it.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.LEADERBOARD.TABLE),
      popover: {
        title: "Full ranking table",
        description:
          "<strong>Rank</strong>, <strong>avatar</strong>, <strong>AP</strong>, <strong>deals</strong>, and <strong>trend arrow</strong> per agent. Click a row to see their public profile and recent activity.",
        side: "top",
      },
    },
  ],
};
