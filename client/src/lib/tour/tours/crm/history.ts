import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const crmHistoryTour: TourConfig = {
  id: "crm.history",
  role: "crm",
  page: "/crm/history",
  label: "Activity History",
  nextTourId: "crm.segments",
  nextCtaLabel: "Next: Segments →",
  steps: [
    {
      popover: {
        title: "Activity history",
        description:
          "Every interaction across the agency — calls, emails, texts, meetings, status changes — in one auditable feed. Filter, slice, and benchmark from a single page.",
      },
    },
    {
      element: tourSelector(TOUR.CRM.HISTORY.HEADER),
      popover: {
        title: "History header",
        description:
          "Date range, owner filter, and export controls live up here. Use the date picker to pull any window of activity.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.HISTORY.SUMMARY),
      popover: {
        title: "Activity summary",
        description:
          "Top-line counts: <strong>Total Activities</strong>, <strong>Leads Touched</strong>, <strong>Calls Made</strong>, and <strong>Emails Sent</strong>. Quick health check on team output.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.HISTORY.FEED),
      popover: {
        title: "Activity feed",
        description:
          "Reverse-chronological feed with actor, action type, target lead/client, and timestamp. Click any entry to jump to the related record.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.CRM.HISTORY.FILTERS),
      popover: {
        title: "Filters",
        description:
          "Filter by activity type (call/email/text/meeting/note), owner, lead status, or outcome. Filters are additive.",
        side: "left",
      },
    },
    {
      element: tourSelector(TOUR.CRM.HISTORY.TREND_CHART),
      popover: {
        title: "Trend & breakdown sidebar",
        description:
          "Right sidebar shows the <strong>Activity Trend</strong> bar chart, <strong>Activity Breakdown</strong> by type, and the <strong>Top Performers</strong> leaderboard. Coaching gold.",
        side: "left",
      },
    },
  ],
};
