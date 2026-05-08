import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const crmLobbyExportTour: TourConfig = {
  id: "crm.lobby-export",
  role: "crm",
  page: "/crm/export",
  label: "Lobby Export",
  nextCtaLabel: "Finish walkthrough",
  celebrateOnFinish: true,
  steps: [
    {
      popover: {
        title: "Lobby Export",
        description:
          "Pull data out of the CRM cleanly. Pick the data type, choose a format, select fields, narrow with filters, and download — built for analytics, audits, and migrations.",
      },
    },
    {
      element: tourSelector(TOUR.CRM.LOBBY_EXPORT.HEADER),
      popover: {
        title: "Export header",
        description:
          "Start a new export or resume a recent one. Recently generated files surface here for quick re-download.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.LOBBY_EXPORT.TYPE_SELECTOR),
      popover: {
        title: "Data type selector",
        description:
          "Choose what to export — <strong>Contacts</strong> or <strong>Activities</strong>. The form below adapts to the type you pick.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.LOBBY_EXPORT.FORMAT),
      popover: {
        title: "File format",
        description:
          "Export as <strong>CSV</strong> for raw analytics or <strong>Excel</strong> for a workbook with formatting and frozen headers.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.LOBBY_EXPORT.FIELDS),
      popover: {
        title: "Field picker",
        description:
          "Toggle exactly which fields land in the file. Skip the noise — export only the columns you'll actually use.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.CRM.LOBBY_EXPORT.FILTERS),
      popover: {
        title: "Export filters",
        description:
          "Narrow the result set by status, owner, date range, segment, or tag. Smaller exports are faster and easier to audit.",
        side: "top",
      },
    },
    {
      popover: {
        title: "That's the full CRM tour",
        description:
          "You've seen every view in the Heritage CRM — pipeline, contacts, clients, segments, and the import/export Lobby. Click <strong>Finish walkthrough</strong> for a wrap-up.",
      },
    },
  ],
};
