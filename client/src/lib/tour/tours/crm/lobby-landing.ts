import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const crmLobbyLandingTour: TourConfig = {
  id: "crm.lobby-landing",
  role: "crm",
  page: "/crm",
  label: "CRM Lobby",
  nextTourId: "crm.lobby-layout",
  nextCtaLabel: "Next: Lobby Layout →",
  steps: [
    {
      popover: {
        title: "CRM Lobby",
        description:
          "The welcoming entrance to the CRM workspace. Topline metrics, recent activity, and one-click jumps into every CRM area you have access to.",
      },
    },
    {
      element: tourSelector(TOUR.CRM.LOBBY_LANDING.HEADER),
      popover: {
        title: "Lobby header",
        description:
          "Greeting, role context, and quick navigation across the CRM workspace.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.LOBBY_LANDING.METRICS),
      popover: {
        title: "Lobby metrics",
        description:
          "Four headline cards: <strong>Total Leads</strong> with trend %, <strong>Deals Closed</strong>, <strong>Revenue</strong> with trend %, and <strong>Conversion %</strong>. The trend percentages compare against the previous period.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.LOBBY_LANDING.LOUNGE_GRID),
      popover: {
        title: "CRM lounge grid",
        description:
          "Ten cards covering every CRM area — Dashboard, Pipeline, Contacts, Clients, Segments, History, Import, Export, and more. Click any card to jump straight in.",
        side: "top",
      },
    },
  ],
};
