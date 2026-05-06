import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const adminContractingTrainingsTour: TourConfig = {
  id: "admin.contracting-trainings",
  role: "admin",
  page: "/hcms/contracting/trainings",
  label: "Trainings & IDs",
  nextTourId: "admin.contracting-employment",
  nextCtaLabel: "Next: Employment →",
  steps: [
    {
      popover: {
        title: "AML, government IDs, and CE credits",
        description:
          "Required training artifacts per agent. Carriers ask for all three in most appointment packages, so missing documents here block new carrier requests.",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_TRAININGS.SUMMARY),
      section: "summary",
      popover: {
        title: "What's uploaded, what's missing",
        description: "Per-doc-type counts: AML certificates on file, Gov IDs on file, CE renewal dates.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_TRAININGS.FILTER),
      section: "filters",
      popover: {
        title: "Filter by requirement",
        description:
          "Isolate missing AML certs, expired CE, or agents who still haven't uploaded a government photo ID.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_TRAININGS.TABLE),
      section: "table",
      popover: {
        title: "Per-agent detail",
        description:
          "Each row tells you whether AML is current, the Gov ID is on file, and when CE credits expire. Click through to view the uploaded documents.",
        side: "top",
      },
    },
    {
      section: "context",
      popover: {
        title: "AML is annual, not one-time",
        description:
          "Anti-Money-Laundering training must be renewed <strong>every year</strong>. LIMRA, WebCE, and Kaplan are the common providers. A cert more than 12 months old is expired even if the PDF is on file — the table flags that.",
      },
    },
    {
      section: "context",
      popover: {
        title: "CE ties to state licensing",
        description:
          "Continuing Education requirements come from each state's DOI, not from Gold Coast or the carriers. The <strong>CE Expiration</strong> column tracks the earliest deadline across the agent's licensed states — hit that and they're current everywhere.",
      },
    },
  ],
};
