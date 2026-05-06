import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentLicensesTour: TourConfig = {
  id: "agent.licenses",
  role: "agent",
  page: "/hcms/my/licenses",
  label: "Licenses",
  nextTourId: "agent.eo",
  nextCtaLabel: "Next: E&O →",
  steps: [
    {
      popover: {
        title: "State licenses",
        description:
          "Every state you're insurance-licensed in shows up here. Carriers need this data to know where they can appoint you.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.LICENSES.SUMMARY),
      section: "summary",
      popover: {
        title: "Your license summary",
        description:
          "NPN, resident state, and the total number of states you're licensed in — at a glance. <strong>NPN</strong> is your National Producer Number, unique to you for life.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.LICENSES.TABLE),
      section: "list",
      popover: {
        title: "License detail",
        description:
          "State, license number, type (Life, Health, L&H), current status, effective, and expiration. Expiring within 90 days is flagged so we can renew before it lapses.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.LICENSES.SYNC_BUTTON),
      section: "actions",
      popover: {
        title: "Refresh from source",
        description:
          "We pull license data from <strong>NIPR</strong> or <strong>SureLC</strong> — click here to fetch the latest if you recently added or renewed a state.",
        side: "top",
      },
    },
    {
      popover: {
        title: "Missing a state?",
        description:
          "License data is managed by the agency — email an administrator if you have a new state license that hasn't appeared yet.",
      },
    },
  ],
};
