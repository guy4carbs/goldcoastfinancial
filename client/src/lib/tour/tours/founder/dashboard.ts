import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const founderDashboardTour: TourConfig = {
  id: "founder.dashboard",
  role: "founder",
  page: "/founders",
  label: "Founders Dashboard",
  nextTourId: "founder.revenue",
  nextCtaLabel: "Next: Revenue →",
  steps: [
    // ── OPENING
    {
      popover: {
        title: "Welcome to the Founders Lounge",
        description:
          "Top-floor view of the agency — revenue, organization, ownership economics, and access controls. Twelve pages, all chained. Takes about four minutes.",
      },
    },
    // ── TOPBAR (consistent with HCMS / Agent / Finance)
    {
      element: tourSelector(TOUR.SHELL.APP_SWITCHER),
      section: "shell",
      popover: {
        title: "Gold Coast apps",
        description:
          "Jump between every Gold Coast platform — HCMS, Ops, Finance, Investors, Marketing, Founders, and the Heritage CRM.",
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
          "Founder-facing alerts — quorum requests, approval queues, agency-level events, and direct admin messages.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: tourSelector(TOUR.SHELL.USER_MENU),
      section: "shell",
      popover: {
        title: "Profile & sign out",
        description: "Account, profile shortcut, and log-out under the gold avatar.",
        side: "bottom",
        align: "end",
      },
    },
    // ── PAGE CONTENT
    {
      element: tourSelector(TOUR.FOUNDERS.DASHBOARD.HEADER),
      section: "dashboard",
      popover: {
        title: "Command center",
        description:
          "The daily landing for founders. Everything here rolls up the entire agency — every team, every carrier, every dollar — for the period you select.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.DASHBOARD.PERIOD),
      section: "dashboard",
      popover: {
        title: "Period selector",
        description:
          "Drives every number on the page. Toggle between MTD, QTD, YTD, or custom ranges to see how the agency moves over time.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.DASHBOARD.KPI_GRID),
      section: "kpis",
      popover: {
        title: "Top-line KPIs",
        description:
          "Revenue MTD/YTD, runway in months, active agents, your founder profit share, and live cash position. The first six numbers a founder checks each morning.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.DASHBOARD.AT_A_GLANCE),
      section: "at-a-glance",
      popover: {
        title: "At a glance",
        description:
          "Compact rollup of period-over-period change — what's moving up, what's moving down, what's quietly steady.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.DASHBOARD.TOP_PERFORMERS),
      section: "performance",
      popover: {
        title: "Top performers",
        description:
          "Highest-AP agents and teams for the period. Click a name to drill into their full profile.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.DASHBOARD.ATTENTION),
      section: "attention",
      popover: {
        title: "Needs your attention",
        description:
          "Anything that requires a founder-level decision — stalled approvals, compliance flags, expirations, large chargebacks. If something here is red, address it before everything else.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.DASHBOARD.QUARTERLY_GOALS),
      section: "goals",
      popover: {
        title: "Quarterly goals",
        description:
          "Targets you (or the founder team) set each quarter, with live progress bars. Use the <strong>Manage Goals</strong> button on the page header to update them.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.DASHBOARD.ONBOARDING_PIPELINE),
      section: "pipeline",
      popover: {
        title: "Onboarding pipeline",
        description:
          "How many agents are mid-application, in review, or just approved. The leading indicator for next quarter's revenue.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.DASHBOARD.CARRIER_VELOCITY),
      section: "operations",
      popover: {
        title: "Carrier velocity",
        description:
          "How fast each carrier is approving submissions. If a carrier slows down, you'll see it here before agents start complaining.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.DASHBOARD.CASH_FLOW),
      section: "cashflow",
      popover: {
        title: "Cash flow",
        description:
          "Inflows and outflows for the period — commissions in, lead spend, payroll, distributions. Tied directly to runway above.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.DASHBOARD.RECENT_ACTIVITY),
      section: "activity",
      popover: {
        title: "Recent activity",
        description:
          "Live feed of agency-wide changes — new applications, signed agreements, status flips, founder actions. Quick sanity check at the start of the day.",
        side: "top",
      },
    },
  ],
};
