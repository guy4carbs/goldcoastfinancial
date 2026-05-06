import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const financeDashboardTour: TourConfig = {
  id: "finance.dashboard",
  role: "finance",
  page: "/finance",
  label: "Finance Command Center",
  nextTourId: "finance.revenue",
  nextCtaLabel: "Next: Revenue →",
  steps: [
    // ── OPENING
    {
      popover: {
        title: "Welcome to the Finance Lounge",
        description:
          "Everything financial — revenue, commission overrides, transaction lifecycle, reconciliation, and reporting. We'll walk every view. Takes about three minutes.",
      },
    },
    // ── TOPBAR (same 4 steps as HCMS, for consistency)
    {
      element: tourSelector(TOUR.SHELL.APP_SWITCHER),
      section: "shell",
      popover: {
        title: "Gold Coast apps",
        description:
          "Jump between every Gold Coast platform — HCMS, Ops Hub, Finance, Investor Relations, Marketing, and the Heritage CRM.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: tourSelector(TOUR.SHELL.THEME_TOGGLE),
      section: "shell",
      popover: {
        title: "Theme",
        description:
          "Cycle between <strong>dark</strong>, <strong>light</strong>, and <strong>maroon</strong>. Your choice persists.",
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
          "Same bell you use in HCMS — financial events like carrier payouts, commission run completions, or reconciliation flags surface here too.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: tourSelector(TOUR.SHELL.USER_MENU),
      section: "shell",
      popover: {
        title: "Profile & sign out",
        description: "Name, email, and log-out under the gold avatar.",
        side: "bottom",
        align: "end",
      },
    },
    // ── PAGE CONTENT
    {
      element: tourSelector(TOUR.FINANCE.DASHBOARD.HEADER),
      section: "dashboard",
      popover: {
        title: "Command Center",
        description:
          "Top-line read on agency finances — premium submitted, agency override income, lead revenue, active agent count — all across the selected period.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.DASHBOARD.PERIOD),
      section: "dashboard",
      popover: {
        title: "Period selector",
        description:
          "Drives every number on this page. Toggle between <strong>MTD</strong>, <strong>YTD</strong>, or a custom range to see how the numbers shift over time.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.DASHBOARD.KPI_GRID),
      section: "kpis",
      popover: {
        title: "KPI grid",
        description:
          "Eight cards covering the financial pulse — premium submitted, income sources, active-agent count, and deals in flight. Each card has a sparkline and a delta badge for at-a-glance context.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.DASHBOARD.KPI_AP_SUBMITTED),
      section: "kpis",
      popover: {
        title: "AP Submitted",
        description:
          "<strong>Annual Premium</strong> submitted by all agents in the selected period. The leading indicator for every commission calculation downstream — if this moves, everything else does.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.DASHBOARD.KPI_AGENCY_OVERRIDE),
      section: "kpis",
      popover: {
        title: "Agency Override",
        description:
          "Override income the agency earns on top of agents' direct commissions. This is the <strong>spread</strong> — the difference between an upline contract level and the level directly below. Example: if you're contracted at 120% and a downline agent at 90%, the agency earns the 30% spread on their production.",
        side: "bottom",
      },
    },
    {
      section: "kpis",
      popover: {
        title: "Pending Deals",
        description:
          "Deals submitted but not yet verified or issued by the carrier. If this number is climbing while submitted AP stays flat, carriers are dragging — worth a check-in with whichever carrier is holding things up.",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.DASHBOARD.WATERFALL),
      section: "charts",
      popover: {
        title: "Revenue decomposition",
        description:
          "Waterfall breaking total premium into its parts — carrier commission, override spread, lead revenue. Useful for board meetings: shows at a glance where the money comes from and which lines are driving growth.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FINANCE.DASHBOARD.AREA_CHART),
      section: "charts",
      popover: {
        title: "Monthly AP trend",
        description:
          "Submitted premium per month across the selected period. Gold line for submitted, subtle area fill for context. Shows whether the agency is growing, plateauing, or cooling off.",
        side: "top",
      },
    },
  ],
};
