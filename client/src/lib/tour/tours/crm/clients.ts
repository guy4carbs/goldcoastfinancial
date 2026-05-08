import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const crmClientsTour: TourConfig = {
  id: "crm.clients",
  role: "crm",
  page: "/crm/clients",
  label: "Clients",
  nextTourId: "crm.lead-profile",
  nextCtaLabel: "Next: Lead Profile →",
  steps: [
    {
      popover: {
        title: "Client management",
        description:
          "Won deals graduate from contacts into clients. This view tracks active policies, coverage in force, monthly revenue, and the all-important renewal calendar.",
      },
    },
    {
      element: tourSelector(TOUR.CRM.CLIENTS.HEADER),
      popover: {
        title: "Clients header",
        description:
          "Add a new client, run a renewal sweep, or export the active book from the action row.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.CLIENTS.SUMMARY),
      popover: {
        title: "Book of business summary",
        description:
          "Five summary cards: <strong>Total Clients</strong>, <strong>Active Policies</strong>, <strong>Total Coverage</strong>, <strong>Monthly Revenue</strong>, and <strong>Renewals (30d)</strong>. The 30-day renewal count is your retention queue.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.CLIENTS.TABLE),
      popover: {
        title: "Client table",
        description:
          "Every active client with policy details, coverage amount, monthly premium, renewal date, and owner. Click a row to drill into the full client record.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.CRM.CLIENTS.RENEWALS),
      popover: {
        title: "Renewal urgency sidebar",
        description:
          "The right-side cards rank renewals by urgency — overdue, this week, next week, this month. Work the top of the stack first to protect retention.",
        side: "left",
      },
    },
  ],
};
