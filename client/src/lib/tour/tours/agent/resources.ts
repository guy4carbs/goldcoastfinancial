import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentResourcesTour: TourConfig = {
  id: "agent.resources",
  role: "agent",
  page: "/agents/resources",
  label: "Resources",
  nextTourId: "agent.avatar-council",
  nextCtaLabel: "Next: AI Avatar Council →",
  steps: [
    {
      popover: {
        title: "Resources",
        description:
          "<strong>Product guides</strong>, FAQs, and reference material across every product Heritage offers. Open this when a client asks something you want to nail on the spot.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.RESOURCES.HEADER),
      popover: {
        title: "Resources header",
        description:
          "Search runs across every <strong>product guide and FAQ</strong> at once. Type a keyword — coverage limits, riders, underwriting questions — and get the answer regardless of which product it lives under.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.RESOURCES.PRODUCT_TABS),
      popover: {
        title: "Product tabs",
        description:
          "Five product guides side by side: <strong>Term Life</strong>, <strong>Whole Life</strong>, <strong>IUL</strong>, <strong>Final Expense</strong>, and <strong>Annuities</strong>. Each tab opens that product's full sales guide and FAQ set.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.RESOURCES.DETAIL),
      popover: {
        title: "Resource detail",
        description:
          "Read the full guide inline, copy snippets straight into a quote email, or download a <strong>PDF</strong> to send to a client. A great companion to the dialer when you're working through objections live.",
        side: "left",
      },
    },
  ],
};
