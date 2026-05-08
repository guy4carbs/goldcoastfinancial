import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const crmLobbyImportTour: TourConfig = {
  id: "crm.lobby-import",
  role: "crm",
  page: "/crm/import",
  label: "Lobby Import",
  nextTourId: "crm.lobby-export",
  nextCtaLabel: "Next: Lobby Export →",
  steps: [
    {
      popover: {
        title: "Lobby Import",
        description:
          "The Lobby's dedicated import workflow — drop a file, map fields, watch the job run, and review the history of every prior import in one place.",
      },
    },
    {
      element: tourSelector(TOUR.CRM.LOBBY_IMPORT.HEADER),
      popover: {
        title: "Import header",
        description:
          "Start a new import or pick up where a paused job left off. The header surfaces any in-flight work first.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.LOBBY_IMPORT.DROP_ZONE),
      popover: {
        title: "Drop zone",
        description:
          "Drag a CSV onto the zone or click to browse. Heritage validates encoding and headers before a single row is committed.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.LOBBY_IMPORT.MAPPING),
      popover: {
        title: "Field mapping",
        description:
          "Match each CSV column to a Heritage field. Auto-suggestions cover common headers (email, phone, first_name) — review and adjust before commit.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.CRM.LOBBY_IMPORT.HISTORY),
      popover: {
        title: "Import history",
        description:
          "Every prior import: filename, row count, success/error breakdown, and a rollback link. If a job created bad data, you can undo it from here.",
        side: "top",
      },
    },
  ],
};
