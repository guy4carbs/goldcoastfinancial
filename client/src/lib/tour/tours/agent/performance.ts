import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentPerformanceTour: TourConfig = {
  id: "agent.performance",
  role: "agent",
  page: "/agents/performance",
  label: "Performance",
  nextTourId: "agent.lead-inbox",
  nextCtaLabel: "Next: Lead Inbox →",
  steps: [
    {
      popover: {
        title: "Performance",
        description:
          "<strong>Earnings</strong>, <strong>pipeline</strong>, and <strong>ROI</strong> in one place. Slice by <strong>week</strong>, <strong>month</strong>, <strong>quarter</strong>, or <strong>year</strong> to spot trends and double down on what's working.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.PERFORMANCE.HEADER),
      popover: {
        title: "Performance header",
        description:
          "Quick summary of your <strong>top-line numbers</strong> for the active period — premium written, deals closed, and current pipeline value. A perfect weekly check-in.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.PERFORMANCE.TABS),
      popover: {
        title: "Earnings · Pipeline · ROI",
        description:
          "Three lenses on your business. <strong>Earnings</strong> shows commissions paid and pending, <strong>Pipeline</strong> shows deals in motion, and <strong>ROI</strong> compares lead spend against AP written.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.PERFORMANCE.TIME_PERIOD),
      popover: {
        title: "Time period",
        description:
          "Switch between <strong>week</strong>, <strong>month</strong>, <strong>quarter</strong>, and <strong>year</strong>. The chart and KPIs all update together so you can see momentum over the right window.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.PERFORMANCE.CHART),
      popover: {
        title: "Trend chart",
        description:
          "Visual trend of your performance for the selected period. <em>Hover any point</em> for the daily breakdown — closed AP, lead spend, conversion rate.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.PERFORMANCE.DOWNLOAD),
      popover: {
        title: "Export to CSV",
        description:
          "Pull the raw data for your records, your accountant, or a spreadsheet deep-dive. <strong>One click, no logins</strong> — yours forever.",
        side: "left",
      },
    },
  ],
};
