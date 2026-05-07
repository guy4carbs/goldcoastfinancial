import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const founderAccessTour: TourConfig = {
  id: "founder.access",
  role: "founder",
  page: "/founders/access",
  label: "Access",
  nextTourId: "founder.view-as",
  nextCtaLabel: "Next: View As →",
  steps: [
    {
      popover: {
        title: "Lounge access controls",
        description:
          "Who has access to which lounge — Founders, Finance, Investors, Marketing, Ops. The audit trail and the invite system live here.",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.ACCESS.TABS),
      popover: {
        title: "Two views",
        description:
          "<strong>Members</strong> tab shows current access. <strong>Pending</strong> shows invitations sent but not yet accepted.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.ACCESS.KPI_GRID),
      popover: {
        title: "Access KPIs",
        description:
          "Active members, pending invites, lounge coverage. Quick read on whether anyone has stale or oversized access.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.ACCESS.MEMBERS_TABLE),
      popover: {
        title: "Active members",
        description:
          "Every user with access to one or more lounges, plus their role and last-active timestamp. Stale users (90+ days inactive) get flagged for cleanup.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.ACCESS.LOUNGE_MATRIX),
      popover: {
        title: "Lounge matrix",
        description:
          "Visual grid of who has access to which lounge. Easy to spot when someone has more access than they need — or when a lounge is missing a critical member.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.ACCESS.PENDING_TABLE),
      popover: {
        title: "Pending invites",
        description:
          "Outstanding access invitations. Resend or revoke from this table. Invitations expire after 30 days automatically.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.ACCESS.INVITE_BUTTON),
      popover: {
        title: "Invite a new member",
        description:
          "Email, role, and which lounges to grant. They'll get a branded Gold Coast email with the access link — same template as agent application invites.",
        side: "left",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.ACCESS.IMPERSONATE),
      popover: {
        title: "Impersonate",
        description:
          "Founders only. Step into another user's session to debug a problem they're seeing. Every impersonation is logged in View As → History — there's no silent backdoor.",
        side: "left",
      },
    },
  ],
};
