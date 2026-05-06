import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const adminAgentDetailTour: TourConfig = {
  id: "admin.agent-detail",
  role: "admin",
  page: "/hcms/agents/",
  label: "Agent File",
  nextTourId: "admin.carriers",
  nextCtaLabel: "Next: Carriers →",
  steps: [
    {
      element: tourSelector(TOUR.ADMIN.AGENT_DETAIL.HEADER),
      popover: {
        title: "Agent file",
        description:
          "Everything we know about one agent: personal profile, signed agreements, licenses, carrier appointments, background disclosures, and business entity details if applicable.",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.AGENT_DETAIL.STATUS_ACTIONS),
      popover: {
        title: "Approve, reject, or start review",
        description:
          "Status controls show up here when an agent is pending or in review. Approving notifies them via email and makes them eligible for carrier appointments.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.AGENT_DETAIL.TAB_PROFILE),
      section: "tabs",
      popover: {
        title: "Profile",
        description: "Personal info, address, experience, E&O, banking — all in one scroll.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.AGENT_DETAIL.TAB_DOCUMENTS),
      section: "tabs",
      popover: {
        title: "Documents",
        description:
          "All three signed agreements plus uploaded documents. Click the eye icon on any row to preview the signed PDF.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.AGENT_DETAIL.TAB_LICENSING),
      section: "tabs",
      popover: {
        title: "Licensing",
        description: "State licenses, effective/expiration dates, resident vs non-resident.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.AGENT_DETAIL.TAB_CARRIERS),
      section: "tabs",
      popover: {
        title: "Carriers",
        description:
          "Contracting requests and appointments. Use this when you need to check which carriers an agent can write with right now.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.AGENT_DETAIL.TAB_CONTRACTING),
      section: "tabs",
      popover: {
        title: "Contracting",
        description:
          "NDA, Debt Roll-Up, and Compliance — the three agreements at-a-glance with signature timestamps.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.AGENT_DETAIL.TAB_QUESTIONS),
      section: "tabs",
      popover: {
        title: "Background questions",
        description:
          "Any flagged disclosures show up here with the agent's explanation. Review before approving.",
        side: "bottom",
      },
    },
  ],
};
