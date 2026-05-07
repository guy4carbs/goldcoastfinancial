import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const founderViewAsTour: TourConfig = {
  id: "founder.view-as",
  role: "founder",
  page: "/founders/view-as",
  label: "View As",
  nextTourId: "founder.settings",
  nextCtaLabel: "Next: Settings →",
  steps: [
    {
      popover: {
        title: "Impersonation",
        description:
          "See exactly what another user sees — their dashboards, their alerts, their permissions. Use to debug \"the page is broken\" tickets or to verify a sensitive change before broadcasting it.",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.VIEWAS.ACTIVE_BANNER),
      popover: {
        title: "Active session banner",
        description:
          "When you're impersonating, this banner stays visible across every page so you don't forget you're in another user's session. Click <strong>Exit</strong> any time to drop back to your own account.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.VIEWAS.SEARCH),
      popover: {
        title: "Find a user",
        description:
          "Search by name, email, or role. Type-ahead matches across the entire user table — agents, managers, admins, founders.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.VIEWAS.TARGETS_TABLE),
      popover: {
        title: "Eligible targets",
        description:
          "Every user a founder can impersonate. Click the eye icon to start a session — you'll be redirected into their default landing page.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.VIEWAS.HISTORY_TABLE),
      popover: {
        title: "Session history",
        description:
          "Every impersonation event — who did it, who they impersonated, when, and how long. Permanent audit log; cannot be deleted.",
        side: "top",
      },
    },
    {
      popover: {
        title: "Compliance note",
        description:
          "Impersonation is a privileged action. The banner is non-dismissible and the audit log is immutable on purpose — both protect founders from any allegation of unauthorized access. Use freely; the trail keeps you covered.",
      },
    },
  ],
};
