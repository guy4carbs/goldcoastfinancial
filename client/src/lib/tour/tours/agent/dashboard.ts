import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentDashboardTour: TourConfig = {
  id: "agent.dashboard",
  role: "agent",
  page: "/hcms/my/dashboard",
  label: "Agent Dashboard",
  nextTourId: "agent.documents",
  nextCtaLabel: "Next: Documents →",
  steps: [
    {
      popover: {
        title: "Welcome to your Agent HCMS",
        description:
          "Quick tour of the whole space — we'll cover the top-bar tools first, then walk your dashboard. Takes about a minute.",
      },
    },
    {
      element: tourSelector(TOUR.SHELL.APP_SWITCHER),
      section: "shell",
      popover: {
        title: "Gold Coast apps",
        description:
          "Jump between every Gold Coast platform — HCMS, Ops Hub, Finance, Investor Relations, Marketing, and back to the Heritage CRM. Apps you don't have access to are greyed out.",
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
          "Cycle between <strong>dark</strong>, <strong>light</strong>, and <strong>maroon</strong>. Your choice is remembered for next time.",
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
          "The bell lights up when something changes that needs your attention — a document gets signed, a carrier approves or returns a request, an E&O policy is about to expire, or an admin messages you directly. Click to open the full list and mark items read.",
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
          "Your name, email, a shortcut to <strong>View my profile</strong>, and the log-out button. Click the gold avatar any time.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DASHBOARD.KPI_APPLICATION_STATUS),
      section: "kpis",
      popover: {
        title: "Application status",
        description:
          "Your current stage — <strong>Pending</strong>, <strong>In Review</strong>, or <strong>Approved</strong>. We'll email you whenever this changes.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DASHBOARD.KPI_DOCS_SIGNED),
      section: "kpis",
      popover: {
        title: "Agreements signed",
        description:
          "NDA, Debt Roll-Up, and Compliance — three agreements every agent signs. This counter flips to 3/3 once you've completed them.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DASHBOARD.KPI_OVERALL_PROGRESS),
      section: "kpis",
      popover: {
        title: "Overall onboarding progress",
        description:
          "Combines your signed agreements with uploaded documents (E&O, Gov ID, AML, Direct Deposit). When this hits 100%, you're ready for carrier appointments.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DASHBOARD.CHECKLIST),
      section: "checklist",
      popover: {
        title: "Your contracting checklist",
        description:
          "Every item here is clickable — it takes you straight to the page where you complete it. Work top to bottom and you'll be fully onboarded.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DASHBOARD.ACTION_ITEMS),
      section: "actions",
      popover: {
        title: "Action items",
        description:
          "Only shows items that still need your attention — so when this section disappears, you're done.",
        side: "top",
      },
    },
  ],
};
