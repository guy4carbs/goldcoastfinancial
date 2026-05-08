import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const crmLeadProfileTour: TourConfig = {
  id: "crm.lead-profile",
  role: "crm",
  page: "/crm/leads",
  label: "Lead Profile",
  nextTourId: "crm.history",
  nextCtaLabel: "Next: Activity History →",
  steps: [
    {
      popover: {
        title: "Lead profile — 360° view",
        description:
          "The full picture of a single lead: contact info, full activity timeline, AI recommendations, and a fixed action bar so you can move on the lead without leaving the page.",
      },
    },
    {
      element: tourSelector(TOUR.CRM.LEAD_PROFILE.HEADER),
      popover: {
        title: "Lead header",
        description:
          "Name, status badge, score, owner, and source. The header stays sticky as you scroll so you always know who you're working.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.LEAD_PROFILE.CONTACT_INFO),
      popover: {
        title: "Contact info",
        description:
          "Phone, email, address, demographics, and any custom fields. Click any field to copy it or kick off an action.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.CRM.LEAD_PROFILE.TIMELINE),
      popover: {
        title: "Activity timeline",
        description:
          "Every call, email, text, quote, status change, and note in chronological order. This is the source of truth for what's happened with this lead.",
        side: "left",
      },
    },
    {
      element: tourSelector(TOUR.CRM.LEAD_PROFILE.AI_RECS),
      popover: {
        title: "AI recommendations",
        description:
          "Suggested next actions based on stage, score, and recent activity — best time to call, recommended product, follow-up cadence, and talking points.",
        side: "left",
      },
    },
    {
      element: tourSelector(TOUR.CRM.LEAD_PROFILE.ACTION_BAR),
      popover: {
        title: "Bottom action bar",
        description:
          "Always-on actions: <strong>Call</strong>, <strong>Email</strong>, <strong>Text</strong>, <strong>Schedule</strong>, <strong>Quote</strong>, and <strong>Status</strong>. The bar follows you down the page so the next move is always one click away.",
        side: "top",
      },
    },
  ],
};
