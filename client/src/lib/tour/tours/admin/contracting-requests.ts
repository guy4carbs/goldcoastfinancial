import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const adminContractingRequestsTour: TourConfig = {
  id: "admin.contracting-requests",
  role: "admin",
  page: "/hcms/contracting/requests",
  label: "Carrier Requests",
  nextTourId: "admin.contracting-bank",
  nextCtaLabel: "Next: Bank →",
  steps: [
    {
      popover: {
        title: "Carrier contracting requests",
        description:
          "Every carrier appointment request across the agency — drafts, in-flight with the carrier, and the ones that returned and need your attention.",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_REQUESTS.KPIS),
      section: "kpis",
      popover: {
        title: "Queue health",
        description:
          "Total requests, awaiting carrier, returned — a quick read on whether the queue is flowing or stalled.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_REQUESTS.TABS),
      section: "filters",
      popover: {
        title: "Filter by state",
        description:
          "<strong>Has Drafts</strong> = agents who started but didn't submit. <strong>Awaiting Carrier</strong> = in the carrier's hands. <strong>Has Returns</strong> = needs your review before the agent sees it.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_REQUESTS.TABLE),
      section: "table",
      popover: {
        title: "Per-agent summary",
        description:
          "Each row rolls up all of an agent's carrier requests. Click into an agent's detail page to approve, return, or reject individual carrier submissions — that's where the action buttons live.",
        side: "top",
      },
    },
  ],
};
