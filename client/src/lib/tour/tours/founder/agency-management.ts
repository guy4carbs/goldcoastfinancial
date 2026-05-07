import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const founderAgencyManagementTour: TourConfig = {
  id: "founder.agency-management",
  role: "founder",
  page: "/founders/agency-management",
  label: "Agency Management",
  nextTourId: "founder.profit-split",
  nextCtaLabel: "Next: Profit Split →",
  steps: [
    {
      popover: {
        title: "Agency management",
        description:
          "Multi-agency structure — top-level agency, sub-agencies, DBAs, carrier contracts, and entity formation. The legal-structure layer beneath the org chart.",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.AGENCY_MGMT.KPI_GRID),
      popover: {
        title: "Agency KPIs",
        description:
          "Active agencies, carrier contracts in force, total entities, formation requests pending. Quick read on the legal-structure side of the business.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.AGENCY_MGMT.TABS),
      popover: {
        title: "Switch view",
        description:
          "Tabs to flip between the Agency Tree, Carrier Directory, Contracts ledger, and Entity Roster. Each is a different lens on the same underlying data.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.AGENCY_MGMT.AGENCY_TREE),
      popover: {
        title: "Agency tree",
        description:
          "Visual hierarchy of every agency under the parent — sub-agencies, DBAs, and where each rolls up. Click a node to open the agency detail panel.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.AGENCY_MGMT.CARRIER_DIRECTORY),
      popover: {
        title: "Carrier directory",
        description:
          "Every carrier the agency holds an MPA (Master Producer Agreement) with — the contract that lets sub-agents appoint downstream. Without an MPA, an agent can't even apply.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.AGENCY_MGMT.AGENCY_CONTRACTS),
      popover: {
        title: "Agency contracts",
        description:
          "Every active contract per agency × carrier — start dates, commission tiers, renewal triggers. The ledger that drives every override calculation.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.AGENCY_MGMT.ENTITY_ROSTER),
      popover: {
        title: "Entity roster",
        description:
          "Business-entity agents (LLCs, S-Corps) and their formation status. Founders can review Articles of Incorporation, EIN, and ownership splits per entity.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.AGENCY_MGMT.NEW_AGENCY_BUTTON),
      popover: {
        title: "Onboard a new agency",
        description:
          "Spin up a sub-agency from scratch — name, jurisdiction, carrier inheritance, default contract levels. Limit this to founder use; it's a high-leverage move.",
        side: "left",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.AGENCY_MGMT.ADD_CARRIER_BUTTON),
      popover: {
        title: "Add a carrier",
        description:
          "Attach a new carrier MPA to an existing agency. Once added, the carrier flows into the carrier directory and becomes appointable downstream.",
        side: "left",
      },
    },
  ],
};
