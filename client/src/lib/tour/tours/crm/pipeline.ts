import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const crmPipelineTour: TourConfig = {
  id: "crm.pipeline",
  role: "crm",
  page: "/crm/pipeline",
  label: "Pipeline",
  nextTourId: "crm.contacts",
  nextCtaLabel: "Next: Contacts →",
  steps: [
    {
      popover: {
        title: "Pipeline board",
        description:
          "This is your drag-and-drop Kanban for every active deal. Move cards between stages as the conversation progresses — the system tracks days-in-stage so nothing rots.",
      },
    },
    {
      element: tourSelector(TOUR.CRM.PIPELINE.HEADER),
      popover: {
        title: "Pipeline header",
        description:
          "The control row for the entire pipeline view — filters, view mode, and quick add live up here.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.PIPELINE.SUMMARY_BAR),
      popover: {
        title: "Pipeline summary",
        description:
          "Six headline numbers: <strong>Total Pipeline</strong>, <strong>Weighted Value</strong>, <strong>Active Deals</strong>, <strong>Avg Deal Size</strong>, <strong>Expected This Month</strong>, and <strong>Win Rate</strong>. Weighted value applies stage probability so the number is realistic.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.PIPELINE.BOARD),
      popover: {
        title: "The Kanban board",
        description:
          "Seven-plus stage columns running left to right. Each card shows lead name, score (<strong>on_fire / hot / warm / cold</strong>), estimated value, and days-in-stage. Drag a card to a new column to update the stage instantly.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.CRM.PIPELINE.VIEW_TOGGLE),
      popover: {
        title: "Board / list toggle",
        description:
          "Switch between Kanban cards and a dense list view. List view is useful when you want to bulk-scan or sort by value.",
        side: "bottom",
        align: "end",
      },
    },
  ],
};
