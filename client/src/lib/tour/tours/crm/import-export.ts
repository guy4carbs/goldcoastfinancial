import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const crmImportExportTour: TourConfig = {
  id: "crm.import-export",
  role: "crm",
  page: "/crm/import-export",
  label: "Import / Export",
  nextTourId: "crm.lobby-landing",
  nextCtaLabel: "Next: CRM Lobby →",
  steps: [
    {
      popover: {
        title: "Import & export",
        description:
          "Move data in and out of the CRM. Bring leads in from CSV, push contacts out for analytics or compliance — same page, two tabs.",
      },
    },
    {
      element: tourSelector(TOUR.CRM.IMPORT_EXPORT.HEADER),
      popover: {
        title: "Import / Export header",
        description:
          "Pick a tab and you're off. Recent jobs and any in-progress imports show up here too.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.IMPORT_EXPORT.IMPORT_TAB),
      popover: {
        title: "Import tab",
        description:
          "Bring leads or contacts in from a CSV. Heritage keeps a record of every import so you can roll one back if a file went sideways.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.IMPORT_EXPORT.EXPORT_TAB),
      popover: {
        title: "Export tab",
        description:
          "Export contacts or activity history to CSV or Excel. Pick fields, apply filters, and download — useful for analytics, audits, or migrating data.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.IMPORT_EXPORT.UPLOAD),
      popover: {
        title: "Drag & drop upload",
        description:
          "Drop a CSV onto the upload zone or click to browse. Heritage validates headers before a single row is written.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.CRM.IMPORT_EXPORT.MAPPER),
      popover: {
        title: "Column mapper",
        description:
          "Map each CSV column to a Heritage field. The system auto-suggests likely matches, but you stay in control of every mapping before commit.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.CRM.IMPORT_EXPORT.FIELD_SELECT),
      popover: {
        title: "Export field picker",
        description:
          "Choose exactly which fields land in your export file. Saves you from a 60-column CSV you have to clean up later.",
        side: "top",
      },
    },
  ],
};
