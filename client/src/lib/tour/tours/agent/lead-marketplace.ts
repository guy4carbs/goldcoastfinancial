import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentLeadMarketplaceTour: TourConfig = {
  id: "agent.lead-marketplace",
  role: "agent",
  page: "/agents/lead-marketplace",
  label: "Lead Marketplace",
  nextTourId: "agent.training",
  nextCtaLabel: "Next: Training Sessions →",
  steps: [
    {
      popover: {
        title: "Lead marketplace",
        description:
          "Buy <strong>fresh, exclusive leads</strong> across product types and states. <strong>Stripe checkout</strong>, instant assignment to your inbox — no waiting, no shared lists.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.LEAD_MARKETPLACE.HEADER),
      popover: {
        title: "Marketplace header",
        description:
          "Your <strong>wallet balance</strong>, recent purchases, and any current promo pricing all live here. The first place to scan when you sit down to restock.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.LEAD_MARKETPLACE.PRODUCT_FILTER),
      popover: {
        title: "Product filter",
        description:
          "Five lead types: <strong>Consolidation</strong>, <strong>Survey</strong>, <strong>Live IUL</strong>, <strong>High Intent</strong>, and <strong>AI Qualified</strong>. Pick the type that matches your script and your day's prospecting plan.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.LEAD_MARKETPLACE.STATE_SELECTOR),
      popover: {
        title: "State selector",
        description:
          "Only states where you're <strong>licensed and appointed</strong> show available counts. Want more inventory? Add states to your appointment list and they'll unlock here automatically.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.LEAD_MARKETPLACE.GRID),
      popover: {
        title: "Lead grid",
        description:
          "Browse available batches with <strong>intent score</strong>, <strong>age</strong>, and <strong>price per lead</strong>. Click a card for the sample data — preview the quality before you commit a dime.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.LEAD_MARKETPLACE.CART),
      popover: {
        title: "Cart sidebar & Stripe checkout",
        description:
          "Stack as many batches as you need into the <strong>cart sidebar</strong>, then check out via <strong>Stripe</strong>. Leads route straight to your inbox the second the payment clears — usually under 30 seconds.",
        side: "left",
      },
    },
  ],
};
