import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

// NOTE: LobbyLayout is the wrapping shell component for the CRM Lobby. There is
// no dedicated /crm/lobby route in App.tsx — /crm/:rest* falls through to
// LobbyLanding, so this tour anchors at /crm/lobby and the longest-prefix
// matcher will resolve it under the LobbyLanding fallback when the user lands
// on a /crm/lobby/* path. If the layout is later mounted at its own route,
// adjust this `page` field.
export const crmLobbyLayoutTour: TourConfig = {
  id: "crm.lobby-layout",
  role: "crm",
  page: "/crm/lobby",
  label: "Lobby Layout",
  nextTourId: "crm.lobby-import",
  nextCtaLabel: "Next: Lobby Import →",
  steps: [
    {
      popover: {
        title: "Lobby layout",
        description:
          "The wrapping layout for the CRM Lobby. Sidebar navigation, persistent welcome, and a global search slot — every Lobby page sits inside this shell.",
      },
    },
    {
      element: tourSelector(TOUR.CRM.LOBBY_LAYOUT.SIDEBAR),
      popover: {
        title: "Lobby sidebar",
        description:
          "Persistent navigation between Lobby sections — landing, import, export, and any other entry point. Stays anchored as you scroll.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.CRM.LOBBY_LAYOUT.WELCOME),
      popover: {
        title: "Welcome panel",
        description:
          "Personalized greeting and contextual hints. New CRM users see onboarding nudges here; veterans see streak and progress info.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.LOBBY_LAYOUT.SEARCH),
      popover: {
        title: "Lobby search",
        description:
          "Press <strong>Cmd+K</strong> (or Ctrl+K) to open the universal search palette. Jump straight to a contact, client, segment, or page from anywhere in the Lobby.",
        side: "bottom",
      },
    },
  ],
};
