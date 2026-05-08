import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentCommunicationsTour: TourConfig = {
  id: "agent.communications",
  role: "agent",
  page: "/agents/communications",
  label: "Communications",
  nextTourId: "agent.scripts",
  nextCtaLabel: "Next: Scripts →",
  steps: [
    {
      popover: {
        title: "Communications",
        description:
          "<strong>Email and chat live inside this single page</strong> — no more bouncing between standalone tools. Three nested tabs handle everything: <strong>Email</strong>, <strong>Team Chat</strong>, and <strong>Client Chat</strong>.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.COMMUNICATIONS.HEADER),
      popover: {
        title: "Communications header",
        description:
          "Unread badges and quick filters across every channel. Your <strong>overall inbox health</strong> at one glance — the first read when you start the day.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.COMMUNICATIONS.TABS),
      popover: {
        title: "Email · Team Chat · Client Chat",
        description:
          "Three nested tabs inside this page. <strong>Email</strong> is your outside conversations, <strong>Team Chat</strong> is your internal Heritage team, and <strong>Client Chat</strong> is direct policy-tied threads with your insureds. Unread counts on each.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.COMMUNICATIONS.INBOX),
      popover: {
        title: "Unified inbox",
        description:
          "A single chronological list inside whichever tab you're viewing. Click any row to open the full thread — replies, attachments, and the conversation history all in one panel.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.COMMUNICATIONS.COMPOSE),
      popover: {
        title: "Compose",
        description:
          "Start a new email or message from anywhere on the page. Drop in <strong>templates</strong>, <strong>merge fields</strong>, and attachments without breaking flow.",
        side: "left",
      },
    },
  ],
};
