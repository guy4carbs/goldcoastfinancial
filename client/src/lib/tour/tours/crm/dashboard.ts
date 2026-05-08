import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const crmDashboardTour: TourConfig = {
  id: "crm.dashboard",
  role: "crm",
  page: "/crm/dashboard",
  label: "CRM Dashboard",
  nextTourId: "crm.pipeline",
  nextCtaLabel: "Next: Pipeline →",
  steps: [
    {
      popover: {
        title: "Welcome to the Heritage CRM",
        description:
          "This is the operational hub for pipeline, contacts, clients, and activity. We'll walk you through every view so you know exactly where to manage leads and book of business. You can replay this any time from the <em>Take the tour</em> button.",
      },
    },
    {
      element: tourSelector(TOUR.SHELL.APP_SWITCHER),
      section: "shell",
      popover: {
        title: "Lounge switcher",
        description:
          "Jump between the CRM, Agent Lounge, and any other Heritage workspace your role unlocks. The CRM is where you'll spend most of your pipeline time.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: tourSelector(TOUR.SHELL.SEARCH),
      section: "shell",
      popover: {
        title: "Quick search",
        description:
          "Press <strong>Cmd+K</strong> (or Ctrl+K) anywhere in the CRM to jump straight to a contact, client, deal, or page.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: tourSelector(TOUR.SHELL.NOTIFICATIONS),
      section: "shell",
      popover: {
        title: "Notifications",
        description:
          "New leads, deal stage changes, renewal alerts, and team mentions land here. The dot lights up when something needs your attention.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: tourSelector(TOUR.SHELL.USER_MENU),
      section: "shell",
      popover: {
        title: "Profile & sign out",
        description:
          "Manage your profile, switch theme, and sign out from here. Your role and contract level live in this menu too.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: tourSelector(TOUR.CRM.DASHBOARD.HEADER),
      popover: {
        title: "CRM Dashboard",
        description:
          "Your top-level view of every lead, deal, and conversion across the agency. Use this page to stay on top of pipeline health at a glance.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.DASHBOARD.KPI_GRID),
      popover: {
        title: "Pipeline KPIs",
        description:
          "Five core metrics: <strong>Total Leads</strong>, <strong>Total Clients</strong>, <strong>Pipeline Value</strong>, <strong>Conversion Rate</strong>, and <strong>Stale Leads</strong>. Stale leads are the ones quietly aging out — chase them first.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.DASHBOARD.FUNNEL),
      popover: {
        title: "Sales funnel",
        description:
          "Watch how volume drops at each stage — new, contacted, quoted, follow-up, won. Big drop-offs flag where coaching or process work is needed.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.CRM.DASHBOARD.SOURCE_TABLE),
      popover: {
        title: "Source effectiveness",
        description:
          "See which lead sources actually convert. Use this table to decide where to spend more — and where to cut spend that isn't paying back.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.CRM.DASHBOARD.MONTHLY_GRID),
      popover: {
        title: "Monthly performance",
        description:
          "Month-over-month grid of leads in, deals closed, and revenue booked. Spot seasonality and momentum at a glance.",
        side: "top",
      },
    },
  ],
};
