import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentLeadInboxTour: TourConfig = {
  id: "agent.lead-inbox",
  role: "agent",
  page: "/agents/inbox",
  label: "Lead Inbox",
  nextTourId: "agent.calendar",
  nextCtaLabel: "Next: Calendar →",
  steps: [
    {
      popover: {
        title: "Lead inbox",
        description:
          "Every new lead routed to you lands here first. <strong>Triage</strong>, <strong>assign</strong>, and start the conversation — no lead ever falls into the void.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.INBOX.HEADER),
      popover: {
        title: "Inbox header",
        description:
          "<strong>Bulk actions</strong>, source filters, and your unread count. Your first stop after a coffee in the morning before the day's calls start.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.INBOX.STATS),
      popover: {
        title: "Inbox stats",
        description:
          "<strong>New leads today</strong>, <strong>untouched in 24h</strong>, and <strong>contacted-but-no-reply</strong>. Keeps the urgent ones from slipping while you focus on closes.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.INBOX.FILTERS),
      popover: {
        title: "Filters",
        description:
          "Narrow by <strong>source</strong>, <strong>product interest</strong>, <strong>state</strong>, or <strong>tag</strong>. Combine filters to build a clean call list for the day in seconds.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.INBOX.LIST),
      popover: {
        title: "Lead list",
        description:
          "Each row is a lead — <strong>quick-call</strong>, <strong>quick-text</strong>, or open the full profile. <strong>Status pills</strong> show exactly where each lead sits in your funnel so you never call cold.",
        side: "top",
      },
    },
  ],
};
