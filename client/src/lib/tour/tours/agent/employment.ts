import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentEmploymentTour: TourConfig = {
  id: "agent.employment",
  role: "agent",
  page: "/hcms/my/employment",
  label: "Employment",
  nextTourId: "agent.dba",
  nextCtaLabel: "Next: DBA →",
  steps: [
    {
      popover: {
        title: "Employment history",
        description:
          "Most carriers run a background review that includes the last <strong>ten years</strong> of employment. This page summarizes what's on file.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.EMPLOYMENT.HISTORY),
      section: "summary",
      popover: {
        title: "Experience summary",
        description:
          "Your years in insurance, any previous agency, and whether you're licensed — the basics carriers verify first. Managed by the agency; email an admin to update.",
        side: "top",
      },
    },
    {
      popover: {
        title: "Gaps are fine",
        description:
          "A gap in employment <strong>does not</strong> disqualify you. Carriers only want a truthful record — unexplained gaps get a quick follow-up question, and that's it.",
      },
    },
    {
      popover: {
        title: "Updating history",
        description:
          "Employment details are read-only in the Agent HCMS. If something's incorrect or out-of-date, ping an administrator and we'll fix it within a day.",
      },
    },
  ],
};
