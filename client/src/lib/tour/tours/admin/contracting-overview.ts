import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const adminContractingOverviewTour: TourConfig = {
  id: "admin.contracting-overview",
  role: "admin",
  page: "/hcms/contracting",
  label: "Contracting Overview",
  nextTourId: "admin.contracting-requests",
  nextCtaLabel: "Next: Requests →",
  steps: [
    {
      popover: {
        title: "The contracting matrix",
        description:
          "Every agent, every required document — at a glance. Green means complete, gold means pending, red means missing. This is the page you check most before onboarding someone with a new carrier.",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_OVERVIEW.TABS),
      section: "filters",
      popover: {
        title: "Quick filters",
        description:
          "Jump straight to <strong>Missing Docs</strong> when you want to clear the queue, or <strong>Complete</strong> to see who's fully onboarded.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_OVERVIEW.MATRIX),
      section: "matrix",
      popover: {
        title: "The matrix",
        description:
          "Columns for each doc type — NDA, Debt Roll-Up, Compliance, E&O, Gov ID, AML, Direct Deposit, voided check, articles. Hover a cell for the timestamp or the reason it's still pending.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_OVERVIEW.RESEND_CTA),
      section: "actions",
      popover: {
        title: "Resend a contracting link",
        description:
          "Click into any agent row to resend their onboarding link — useful when the first link expired or never got opened. One-click, pre-filled.",
        side: "left",
      },
    },
  ],
};
