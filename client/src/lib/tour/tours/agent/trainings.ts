import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentTrainingsTour: TourConfig = {
  id: "agent.trainings",
  role: "agent",
  page: "/hcms/my/trainings",
  label: "Trainings & IDs",
  nextTourId: "agent.employment",
  nextCtaLabel: "Next: Employment →",
  steps: [
    {
      popover: {
        title: "Training & identity documents",
        description:
          "Two things carriers always ask for: a government-issued photo ID and a current <strong>Anti-Money-Laundering</strong> certificate. We also track your continuing education credits.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.TRAININGS.CE_EXPIRATION),
      section: "ce",
      popover: {
        title: "Continuing education",
        description:
          "Most states require CE hours to keep your license active. When your credits expire within 90 days, this block turns amber.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.TRAININGS.UPLOAD_AREA),
      section: "docs",
      popover: {
        title: "Document uploads",
        description:
          "Upload once and we share with every carrier you appoint with — no more re-uploading your AML cert to each new carrier portal.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.TRAININGS.AML),
      section: "docs",
      popover: {
        title: "AML certificate",
        description:
          "Anti-Money-Laundering training is required annually. LIMRA, WebCE, and Kaplan all have common courses. PDF only.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.TRAININGS.GOV_ID),
      section: "docs",
      popover: {
        title: "Photo ID",
        description:
          "Driver's license, state ID, or passport — something that confirms the name and date of birth on file. Accepts PDF or image.",
        side: "top",
      },
    },
  ],
};
