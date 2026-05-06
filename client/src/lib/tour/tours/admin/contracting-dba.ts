import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const adminContractingDbaTour: TourConfig = {
  id: "admin.contracting-dba",
  role: "admin",
  page: "/hcms/contracting/dba",
  label: "DBA & Business Entities",
  nextTourId: "admin.contracting-questions",
  nextCtaLabel: "Next: Questions →",
  steps: [
    {
      popover: {
        title: "Individual vs. business contracting",
        description:
          "Which agents are contracted as themselves (Individual) and which go through an LLC/corporation. Business-entity agents have extra documents — Articles of Incorporation, owners, DRLP, beneficiary.",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_DBA.SUMMARY),
      section: "summary",
      popover: {
        title: "Entity-type breakdown",
        description:
          "Count of individual vs. business-entity contracts across the agency, plus who's missing the entity-specific paperwork.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_DBA.FILTER),
      section: "filters",
      popover: {
        title: "Filter",
        description:
          "By entity type, missing articles, incomplete DRLP, or missing beneficiary — anything carriers will ask for when appointing the entity.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_DBA.TABLE),
      section: "table",
      popover: {
        title: "Per-agent entity record",
        description:
          "Entity name, EIN, company type, state of incorporation, owners list, DRLP — everything you need for a business-entity carrier package.",
        side: "top",
      },
    },
    {
      section: "context",
      popover: {
        title: "Who needs the extra docs",
        description:
          "<strong>Individual</strong> contracts only need personal docs (NDA, E&O, Gov ID, etc). <strong>Business Entities</strong> (LLC / S-Corp / C-Corp) also need Articles of Incorporation, an owners list, a <strong>DRLP</strong> (Designated Responsible Licensed Producer), and a beneficiary.",
      },
    },
    {
      section: "context",
      popover: {
        title: "DRLP is the legal point of contact",
        description:
          "The Designated Responsible Licensed Producer is the individual the state DOI treats as the entity's licensed rep. Every business entity must have one on file — usually the agent themselves or a principal.",
      },
    },
  ],
};
