import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentMemberCardsTour: TourConfig = {
  id: "agent.member-cards",
  role: "agent",
  page: "/agents/member-cards",
  label: "Member Cards",
  nextTourId: "agent.business-card",
  nextCtaLabel: "Next: Business Card →",
  steps: [
    {
      popover: {
        title: "Member cards",
        description:
          "<strong>Heritage member cards</strong> issued to your clients — the digital ID that proves their coverage. Track status, reissue when needed, and never let a card lapse.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.MEMBER_CARDS.HEADER),
      popover: {
        title: "Member cards header",
        description:
          "<strong>Issue a new card</strong>, search existing ones, and export your full member roster for reporting. The roster is a great touch-base list for renewals.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.MEMBER_CARDS.STATS),
      popover: {
        title: "Card stats",
        description:
          "Cards by status — <strong>active</strong>, <strong>pending</strong>, <strong>expired</strong>, and <strong>cancelled</strong>. Keeps you ahead of renewals so no one's caught uncovered.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.MEMBER_CARDS.GRID),
      popover: {
        title: "Card grid",
        description:
          "Each card shows the <strong>member name</strong>, <strong>plan</strong>, <strong>expiration</strong>, and quick <em>reissue or revoke</em> actions. Status color matches the stats above for fast scanning.",
        side: "top",
      },
    },
  ],
};
