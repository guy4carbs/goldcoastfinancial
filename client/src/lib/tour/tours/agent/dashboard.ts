import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentDashboardTour: TourConfig = {
  id: "agent.dashboard",
  role: "agent",
  page: "/agents/dashboard",
  label: "Dashboard",
  nextTourId: "agent.performance",
  nextCtaLabel: "Next: Performance →",
  steps: [
    // 1. Centered intro — sets expectations for the full 29-tour chain
    {
      popover: {
        title: "Welcome to the Heritage Agent Lounge",
        description:
          "This is your daily home base — where every lead, deal, commission, and conversation lives. We'll walk through every view in the lounge, from <strong>leads</strong> all the way through <strong>commissions</strong>, in about <em>5 minutes</em>. You can replay any tour anytime from the <em>Take the tour</em> button in the bottom-right corner.",
      },
    },

    // 2. Sidebar — the spine of the lounge
    {
      element: tourSelector(TOUR.SHELL.SIDEBAR),
      section: "shell",
      popover: {
        title: "The lounge sidebar",
        description:
          "Navigation is grouped into five sections: <strong>Command Center</strong>, <strong>Clients</strong>, <strong>Outreach</strong>, <strong>Sales Toolkit</strong>, and <strong>Growth</strong>. Use the toggle near the top to collapse it for more screen space. What you see depends on your <em>permissions</em>.",
        side: "right",
        align: "start",
      },
    },

    // 3. Lounge switcher — jumping between Heritage surfaces
    {
      element: tourSelector(TOUR.SHELL.APP_SWITCHER),
      section: "shell",
      popover: {
        title: "Switch lounges",
        description:
          "Heritage has multiple surfaces — the <strong>Agent</strong> lounge, the <strong>CRM</strong> (admins only), and others as they roll out. Jump between them here without losing your place.",
        side: "bottom",
        align: "start",
      },
    },

    // 4. Universal search (Cmd-K)
    {
      element: tourSelector(TOUR.SHELL.SEARCH),
      section: "shell",
      popover: {
        title: "Universal search",
        description:
          "Press <strong>Cmd+K</strong> (or <strong>Ctrl+K</strong> on Windows) anywhere in the lounge to find leads, clients, deals, and even individual <em>scripts</em>. Faster than navigating manually — try it any time.",
        side: "bottom",
        align: "center",
      },
    },

    // 5. Notifications — alerts feed
    {
      element: tourSelector(TOUR.SHELL.NOTIFICATIONS),
      section: "shell",
      popover: {
        title: "Notifications",
        description:
          "Alerts for new <strong>leads</strong>, contracted <strong>deals</strong>, training reminders, and admin messages all land here. The unread count shows on the bell — clear them as you go.",
        side: "bottom",
        align: "end",
      },
    },

    // 6. User menu / profile
    {
      element: tourSelector(TOUR.SHELL.USER_MENU),
      section: "shell",
      popover: {
        title: "Your profile",
        description:
          "Your name, contract <strong>level</strong>, monthly <strong>$AP</strong>, and avatar live here. Use this menu to switch accounts or sign out.",
        side: "bottom",
        align: "end",
      },
    },

    // 7. Tour replay button (FAB)
    {
      element: tourSelector(TOUR.SHELL.TOUR_BUTTON),
      section: "shell",
      popover: {
        title: "Replay any tour",
        description:
          "This <em>floating button</em> in the bottom-right re-runs the walkthrough for whatever page you're on. Each lounge has its own tour — your help bookmarks live here too.",
        side: "left",
        align: "end",
      },
    },

    // 8. Dashboard hero — the daily greeting
    {
      element: tourSelector(TOUR.AGENT.DASHBOARD.HERO),
      popover: {
        title: "Today's start",
        description:
          "Your daily greeting and <strong>level badge</strong>. This sets the tone for the day — your <em>XP</em>, daily challenge progress, and a quick personal touch right up top.",
        side: "bottom",
        align: "start",
      },
    },

    // 9. Lead/deal stats — the numbers
    {
      element: tourSelector(TOUR.AGENT.DASHBOARD.LEAD_STATS),
      popover: {
        title: "Your numbers, live",
        description:
          "Leads worked this month, <strong>deals closed</strong>, <strong>AP submitted</strong>, and your <strong>leaderboard rank</strong>. These tick in <em>real time</em> as you book deals — no refresh needed.",
        side: "bottom",
        align: "center",
      },
    },

    // 10. Activity feed — the live pulse
    {
      element: tourSelector(TOUR.AGENT.DASHBOARD.ACTIVITY_FEED),
      popover: {
        title: "Activity feed",
        description:
          "Every recent event across your book — <strong>calls</strong>, <strong>emails</strong>, deal status changes, payouts. Filter or click any row to drill into the full detail.",
        side: "left",
        align: "start",
      },
    },

    // 11. Daily challenge — habit builder
    {
      element: tourSelector(TOUR.AGENT.DASHBOARD.DAILY_CHALLENGE),
      popover: {
        title: "Daily challenge",
        description:
          "A small daily goal that compounds your habit — <em>calls made</em>, <em>leads contacted</em>, <em>quotes sent</em>. Earn <strong>XP</strong> and badges over time.",
        side: "right",
        align: "center",
      },
    },

    // 12. State map — licensing footprint
    {
      element: tourSelector(TOUR.AGENT.DASHBOARD.STATE_MAP),
      popover: {
        title: "Where you're licensed",
        description:
          "The states where you can write business. Click any state to drill into its <strong>leads</strong>, <em>carriers</em>, and license expiration dates.",
        side: "right",
        align: "start",
      },
    },

    // 13. Header / quick links
    {
      element: tourSelector(TOUR.AGENT.DASHBOARD.HEADER),
      popover: {
        title: "Quick links",
        description:
          "Top-of-page navigation chips — <strong>1:1 booking</strong>, <em>agent guide</em>, and other one-click jumps to common second steps. Use these to cut through the menu.",
        side: "bottom",
        align: "start",
      },
    },

    // 14. Closing centered — hand off to the next tour
    {
      popover: {
        title: "Ready to dive in?",
        description:
          "<strong>Performance</strong> is next — you'll see how your numbers track over time. Click <strong>Next</strong> to continue, or <em>X</em> to close (you can resume from the FAB later).",
      },
    },
  ],
};
