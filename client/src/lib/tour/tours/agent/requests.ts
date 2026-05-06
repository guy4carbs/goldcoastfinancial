import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentRequestsTour: TourConfig = {
  id: "agent.requests",
  role: "agent",
  page: "/hcms/my/requests",
  label: "Contracting Requests",
  nextCtaLabel: "Done",
  steps: [
    {
      popover: {
        title: "Contracting requests",
        description:
          "Ask to be appointed with a carrier. Drafts stay local until you submit — once submitted, we send the package to the carrier and track it through approval.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.REQUESTS.TAB_DRAFTS),
      section: "tabs",
      popover: {
        title: "Drafts",
        description:
          "Requests you've started but not submitted yet. Edit or delete freely here — nothing leaves the agency until you click <strong>Submit</strong>.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.REQUESTS.TAB_AWAITING),
      section: "tabs",
      popover: {
        title: "Awaiting carriers",
        description:
          "Submitted and waiting on the carrier's back office. Turnaround is typically 5–10 business days per carrier.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.REQUESTS.TAB_RETURNED),
      section: "tabs",
      popover: {
        title: "Returned carriers",
        description:
          "The carrier has processed your request and returned a completed package. You're cleared to write business in those states.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.REQUESTS.NEW_REQUEST),
      section: "actions",
      popover: {
        title: "Start a new request",
        description:
          "Pick a carrier, choose the states you're licensed in, and we'll bundle the paperwork automatically from your file.",
        side: "left",
      },
    },
  ],
};
