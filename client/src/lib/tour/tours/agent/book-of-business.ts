import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentBookOfBusinessTour: TourConfig = {
  id: "agent.book-of-business",
  role: "agent",
  page: "/agents/book-of-business",
  label: "Book of Business",
  nextTourId: "agent.deals",
  nextCtaLabel: "Next: Agency Deals →",
  steps: [
    {
      popover: {
        title: "Book of Business",
        description:
          "Your <strong>active policies</strong>, <strong>premium under management</strong>, and <strong>renewal pipeline</strong>. The single source of truth for every life you've insured.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.BOOK.HEADER),
      popover: {
        title: "Book header",
        description:
          "Quick actions for <strong>new policies</strong>, <strong>exports</strong>, and renewal reports. Built for the agent juggling a hundred active clients.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.BOOK.STATS),
      popover: {
        title: "Book stats",
        description:
          "<strong>Total active policies</strong>, <strong>AP under management</strong>, <strong>persistency rate</strong>, and <strong>renewals due this quarter</strong> — all the numbers that matter at a glance.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.BOOK.SEARCH),
      popover: {
        title: "Search policies",
        description:
          "Look up a policy by <strong>client name</strong>, <strong>carrier</strong>, <strong>policy number</strong>, or <strong>product type</strong>. Vital when a client calls in cold and you need their data <em>now</em>.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.BOOK.TABLE),
      popover: {
        title: "Policy table",
        description:
          "Every row carries beneficiary info, medical disclosures, policy details, and the <strong>full activity log</strong>. Click any policy to open the detail drawer with carrier docs and notes.",
        side: "top",
      },
    },
  ],
};
