import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentCarriersTour: TourConfig = {
  id: "agent.carriers",
  role: "agent",
  page: "/hcms/my/carriers",
  label: "Carriers",
  nextTourId: "agent.hierarchy",
  nextCtaLabel: "Next: Hierarchy →",
  steps: [
    {
      popover: {
        title: "Your carrier appointments",
        description:
          "Every carrier you've been requested with, approved by, or are appointed under — plus anything still in flight. Separate from the <strong>Requests</strong> page, which is for new submissions.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.CARRIERS.APPOINTED),
      section: "active",
      popover: {
        title: "Active carriers",
        description:
          "Appointments that are live — you're cleared to write business with these carriers in the listed states. If this block is empty, you haven't been appointed anywhere yet.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.CARRIERS.PENDING),
      section: "pending",
      popover: {
        title: "Awaiting response",
        description:
          "Submitted to the carrier and in their queue. Turnaround is typically <strong>5–10 business days</strong> per carrier — some are faster, none are instant.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.CARRIERS.REQUEST_NEW),
      section: "actions",
      popover: {
        title: "Start a new appointment",
        description:
          "Head to the <strong>Requests</strong> page — pick a carrier, select your licensed states, and we'll assemble the paperwork automatically.",
        side: "bottom",
      },
    },
  ],
};
