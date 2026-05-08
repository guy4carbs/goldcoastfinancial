import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentCommissionsTour: TourConfig = {
  id: "agent.commissions",
  role: "agent",
  page: "/agents/commissions",
  label: "Commissions",
  nextTourId: "agent.lead-marketplace",
  nextCtaLabel: "Next: Buy Leads →",
  steps: [
    {
      popover: {
        title: "Commissions",
        description:
          "Your <strong>earnings</strong>, <strong>contract level</strong>, and <strong>tier progression</strong>. Every dollar Heritage pays you flows through this view — from carrier to your bank account.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.COMMISSIONS.HEADER),
      popover: {
        title: "Commissions header",
        description:
          "Your <strong>current contract level</strong>, year-to-date earnings, and pending payouts at a glance. Confirms where you stand the moment you open the page.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.COMMISSIONS.STATS),
      popover: {
        title: "Earnings stats",
        description:
          "<strong>YTD earnings</strong>, <strong>this month</strong>, <strong>last month</strong>, and <strong>pending</strong>. Pending pays out as soon as the policy clears the carrier and your chargeback window closes.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.COMMISSIONS.TIER_BAR),
      popover: {
        title: "Contract level progression bar",
        description:
          "Your spot on the <strong>tier ladder</strong> with the next milestone in sight. Hit the next AP threshold and your contract level — and override pay — bumps up automatically.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.COMMISSIONS.REQUEST),
      popover: {
        title: "Request a commission increase",
        description:
          "Think you're ready for the next level early? Open the <strong>request modal</strong> right here, lay out your case, and submit. Your <strong>upline reviews</strong> the request against your numbers and approves or holds.",
        side: "left",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.COMMISSIONS.HISTORY),
      popover: {
        title: "Payout history",
        description:
          "Every commission event with date, policy, premium, and your override (if any). <strong>Export to CSV</strong> for taxes, your accountant, or your own records.",
        side: "top",
      },
    },
  ],
};
