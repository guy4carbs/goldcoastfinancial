import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const founderLeadDistributionTour: TourConfig = {
  id: "founder.lead-distribution",
  role: "founder",
  page: "/founders/lead-distribution",
  label: "Lead Distribution",
  nextTourId: "founder.agency-management",
  nextCtaLabel: "Next: Agency Management →",
  steps: [
    {
      popover: {
        title: "Lead distribution",
        description:
          "Where leads enter the system, how they're pooled, and how they get routed to agents. The control panel for the lead-marketplace economy.",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.LEAD_DIST.KPI_GRID),
      popover: {
        title: "Pool health",
        description:
          "Leads in pool, distributed today, average time to assignment, and conversion rate. The bell-cow metric is time-to-assignment — the longer leads sit, the colder they get.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.LEAD_DIST.IMPORT_CARD),
      popover: {
        title: "Import leads",
        description:
          "Drop a CSV from any lead vendor — we'll dedupe against existing leads, validate the schema, and stage them in the pool for distribution.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.LEAD_DIST.DISTRIBUTE_CARD),
      popover: {
        title: "Distribute",
        description:
          "Manual or automated. Auto-distribution applies the rules you set (round-robin, performance-weighted, geographic) — manual lets you hand-pick assignments for premium leads.",
        side: "left",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.LEAD_DIST.TABS),
      popover: {
        title: "Filter the pool",
        description:
          "Tabs by lead status — Available, Assigned, Worked, Closed, Returned. Returned leads need the most attention; that's a quality signal.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.LEAD_DIST.POOL_TABLE),
      popover: {
        title: "Lead pool",
        description:
          "Every lead in the system with source, age, status, and assigned agent. Click any row to open the lead drawer with full contact and history.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.LEAD_DIST.LIVE_INDICATOR),
      popover: {
        title: "Live updates",
        description:
          "Pulses when a new lead arrives or gets assigned. Useful when you're actively distributing — you'll see new leads land in real time.",
        side: "left",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.LEAD_DIST.DISTRIBUTION_HISTORY),
      popover: {
        title: "Distribution history",
        description:
          "Audit trail of every distribution event. Useful when an agent disputes an assignment or when you're tuning the auto-distribution rules.",
        side: "top",
      },
    },
  ],
};
