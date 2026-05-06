import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const adminContractingLicensesTour: TourConfig = {
  id: "admin.contracting-licenses",
  role: "admin",
  page: "/hcms/contracting/licenses",
  label: "Licenses Matrix",
  nextTourId: "admin.contracting-eo",
  nextCtaLabel: "Next: E&O →",
  steps: [
    {
      popover: {
        title: "Agency-wide license coverage",
        description:
          "Every license on file across every agent. When a carrier asks which states you can sell in, this is where the answer comes from.",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_LICENSES.SUMMARY),
      section: "summary",
      popover: {
        title: "Coverage summary",
        description:
          "Count of active licenses, expiring within 90 days, and already-expired. Anything expiring gets flagged in amber.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_LICENSES.FILTER),
      section: "filters",
      popover: {
        title: "Filter by state or status",
        description:
          "Narrow to a state, a single agent, or everything expiring soon. Data syncs from <strong>NIPR</strong> and <strong>SureLC</strong>.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_LICENSES.TABLE),
      section: "table",
      popover: {
        title: "Per-agent, per-state",
        description:
          "License number, type, effective/expiration dates, resident flag, and sync source. Click to open the agent's full license detail.",
        side: "top",
      },
    },
    {
      section: "context",
      popover: {
        title: "Resident vs. non-resident",
        description:
          "Every agent has exactly one <strong>resident</strong> license (their home state) plus any number of <strong>non-resident</strong> licenses. Carriers frequently require the resident state on file before appointing in any other state.",
      },
    },
    {
      section: "context",
      popover: {
        title: "Expiration color bands",
        description:
          "Expiring in <strong>&gt;90 days</strong> is green, <strong>30–90 days</strong> is gold (time to start renewal), <strong>&lt;30 days</strong> is red, <strong>expired</strong> also red. Carriers block new business on expired licenses, so red rows are top priority.",
      },
    },
  ],
};
