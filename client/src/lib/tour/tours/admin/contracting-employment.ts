import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const adminContractingEmploymentTour: TourConfig = {
  id: "admin.contracting-employment",
  role: "admin",
  page: "/hcms/contracting/employment",
  label: "Employment History",
  nextTourId: "admin.contracting-dba",
  nextCtaLabel: "Next: DBA →",
  steps: [
    {
      popover: {
        title: "Employment history per agent",
        description:
          "Last ten years of work history, experience level, previous agency, and licensed status. Carriers run background checks on this data during their approval process.",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_EMPLOYMENT.SUMMARY),
      section: "summary",
      popover: {
        title: "Experience breakdown",
        description: "Distribution of agents by years of experience — useful for training cohort decisions.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_EMPLOYMENT.FILTER),
      section: "filters",
      popover: {
        title: "Filter",
        description:
          "By experience range, previous agency, or approval status. Great for finding agents fit for specific carrier programs.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_EMPLOYMENT.TABLE),
      section: "table",
      popover: {
        title: "Per-agent detail",
        description:
          "Each row: agent, years of experience, previous agency, license status. Click through to open the agent's full employment record.",
        side: "top",
      },
    },
    {
      section: "context",
      popover: {
        title: "Why the ten-year window",
        description:
          "Most carrier background checks go back <strong>ten years</strong>. Anything inside that window is fair game — previous agency terminations, non-compete flags, long gaps — and the carrier's compliance team will ask about it.",
      },
    },
    {
      section: "context",
      popover: {
        title: "Gaps are OK",
        description:
          "An unexplained gap in history doesn't disqualify an agent. Carriers just want a truthful record — a short explanation (sabbatical, childcare, transition) on the agent's application is usually enough.",
      },
    },
  ],
};
