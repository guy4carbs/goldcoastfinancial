import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentClaimsTour: TourConfig = {
  id: "agent.claims",
  role: "agent",
  page: "/agents/claims",
  label: "Claims",
  nextTourId: "agent.member-cards",
  nextCtaLabel: "Next: Member Cards →",
  steps: [
    {
      popover: {
        title: "Claims",
        description:
          "Help your <strong>client families</strong> through the claim process. Track <strong>required documents</strong>, statuses, and carrier communications — all in one place, when it matters most.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.CLAIMS.HEADER),
      popover: {
        title: "Claims header",
        description:
          "<strong>File a new claim</strong>, view open claims, and contact the carrier claims desk in one click. Built so you can stay calm and helpful when a family calls.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.CLAIMS.STATS),
      popover: {
        title: "Claim stats",
        description:
          "<strong>Open</strong>, <strong>in-review</strong>, <strong>approved</strong>, and <strong>denied</strong> counts. Color matches the table rows below so urgent claims jump out without scrolling.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.CLAIMS.SEARCH),
      popover: {
        title: "Search claims",
        description:
          "Find a claim by <strong>client</strong>, <strong>policy number</strong>, or <strong>claim type</strong>. The first thing you'll do when a beneficiary calls in needing an update.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.CLAIMS.TABLE),
      popover: {
        title: "Claims table",
        description:
          "Each row shows the client, claim type, <strong>status color</strong>, and <strong>required documents</strong>. Click to open the full claim and upload missing items straight to the carrier.",
        side: "top",
      },
    },
  ],
};
