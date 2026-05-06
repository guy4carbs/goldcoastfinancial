import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const adminHcmsDashboardTour: TourConfig = {
  id: "admin.hcms-dashboard",
  role: "admin",
  page: "/hcms",
  label: "Command Center",
  nextTourId: "admin.agents-list",
  nextCtaLabel: "Next: Agent Directory →",
  steps: [
    // ── OPENING: top-bar controls (first 4 steps mirror the agent onboarding)
    {
      popover: {
        title: "Welcome to the Admin HCMS",
        description:
          "The <strong>Command Center</strong> is your daily landing — high-level read on agency health with direct links into every queue that needs your attention. We'll walk every section of this page, then chain through the rest of the admin surface.",
      },
    },
    {
      element: tourSelector(TOUR.SHELL.APP_SWITCHER),
      section: "shell",
      popover: {
        title: "Gold Coast apps",
        description:
          "Switch between every Gold Coast platform — HCMS, Ops Hub, Finance, Investor Relations, Marketing, and the Heritage CRM. Greyed-out apps are roles you don't have access to.",
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
          "Cycle between <strong>dark</strong>, <strong>light</strong>, and <strong>maroon</strong>. Your pick sticks for next time.",
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
          "The bell lights up for anything tied to your admin queue — new applications, documents signed, expirations, and admin-to-admin messages. Click to read and mark items done.",
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
          "Your account, a shortcut to your own agent profile, and the log-out button — all under the gold avatar.",
        side: "bottom",
        align: "end",
      },
    },

    // ── PAGE HEADER
    {
      element: tourSelector(TOUR.ADMIN.HCMS_DASHBOARD.HEADER),
      section: "dashboard",
      popover: {
        title: "Command Center",
        description:
          "Rolled-up view of agency health — applications in flight, agents active, compliance flags, and document gaps. If something needs attention, it shows up here first.",
        side: "bottom",
      },
    },

    // ── KPI ROW (6 steps, one per card, with click hints on linked ones)
    {
      element: tourSelector(TOUR.ADMIN.HCMS_DASHBOARD.KPI_AGENTS),
      section: "kpis",
      popover: {
        title: "Total Agents",
        description:
          "Every sales agent under contract — active, pending, in review, rejected. The denominator for every percentage on this page. <strong>Click to jump to the Agent Directory.</strong>",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.HCMS_DASHBOARD.KPI_PENDING),
      section: "kpis",
      popover: {
        title: "Pending Review",
        description:
          "Applications that have been submitted but not yet opened by a manager. If this number's climbing, the queue is stalled. <strong>Click to open the Contracting Overview.</strong>",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.HCMS_DASHBOARD.KPI_IN_REVIEW),
      section: "kpis",
      popover: {
        title: "In Review",
        description:
          "Applications a manager has claimed but hasn't decided on yet. Sits between <em>Pending</em> and a final approve/reject. <strong>Click to filter the Agent Directory by this status.</strong>",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.HCMS_DASHBOARD.KPI_ACTIVE),
      section: "kpis",
      popover: {
        title: "Active Agents",
        description:
          "Approved and actively able to write business. The delta shows this as a <strong>% of total</strong> — a quick health metric for the agency. <strong>Click to jump to the directory.</strong>",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.HCMS_DASHBOARD.KPI_ALERTS),
      section: "kpis",
      popover: {
        title: "Compliance Alerts",
        description:
          "Expiring E&O, expiring state licenses, AML certs past due, anything carrier-facing that blocks business. <strong>Critical</strong> count means 30 days or less.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.HCMS_DASHBOARD.KPI_REQUESTS),
      section: "kpis",
      popover: {
        title: "Docs Incomplete",
        description:
          "Count of agents missing at least one required contracting doc — NDA, Debt Roll-Up, Compliance, E&O, Gov ID, AML, Direct Deposit. <strong>Click to jump straight to Contracting Overview</strong> and work the gaps.",
        side: "bottom",
      },
    },

    // ── QUICK ACTIONS
    {
      element: tourSelector(TOUR.ADMIN.HCMS_DASHBOARD.QUICK_SEND_APP),
      section: "actions",
      popover: {
        title: "Send Application",
        description:
          "Invite a new agent in one click — opens a modal to enter name + email, we generate the onboarding link and send the branded invite email. The link is valid for 30 days.",
        side: "bottom",
      },
    },

    // ── TABLES
    {
      element: tourSelector(TOUR.ADMIN.HCMS_DASHBOARD.APPLICATIONS_TABLE),
      section: "tables",
      popover: {
        title: "Recent Applications",
        description:
          "The five newest agent applications — where the queue starts for you each morning. Click any row to open the full agent file; use <em>View all</em> for the complete directory.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.HCMS_DASHBOARD.ALERTS_TABLE),
      section: "tables",
      popover: {
        title: "Compliance Alerts",
        description:
          "Every agent with an expiring or missing compliance document, sorted by urgency. Clear this list to keep the <em>Critical</em> KPI at zero.",
        side: "top",
      },
    },

    // ── ACTIVITY ROW
    {
      element: tourSelector(TOUR.ADMIN.HCMS_DASHBOARD.STATUS_CHART),
      section: "activity",
      popover: {
        title: "Agents by Status",
        description:
          "Visual breakdown of the agency's population across Active, In Review, Pending, and Rejected. Useful for tracking whether the approval pipeline is flowing.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.HCMS_DASHBOARD.RECENT_ACTIVITY),
      section: "activity",
      popover: {
        title: "Recent Activity",
        description:
          "Who signed up, what got signed, what status changed — rolling feed of changes across the agency. Quick sanity check at the start of the day.",
        side: "top",
      },
    },
  ],
};
