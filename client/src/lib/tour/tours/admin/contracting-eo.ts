import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const adminContractingEoTour: TourConfig = {
  id: "admin.contracting-eo",
  role: "admin",
  page: "/hcms/contracting/eo",
  label: "E&O Coverage",
  nextTourId: "admin.contracting-trainings",
  nextCtaLabel: "Next: Trainings →",
  steps: [
    {
      popover: {
        title: "E&O across every agent",
        description:
          "Errors & Omissions policies — who's covered, who's expiring, and who hasn't uploaded a certificate. Carriers block new business on expired E&O, so this page needs to stay clean.",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_EO.SUMMARY),
      section: "summary",
      popover: {
        title: "Coverage health",
        description: "Active, expiring within 60 days, expired, and missing — at a glance.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_EO.FILTER),
      section: "filters",
      popover: {
        title: "Filter to the problem set",
        description:
          "Jump to everyone expiring this month or everyone still missing a cert. Agents get automatic reminders at 60 days; this view lets you nudge personally.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_EO.TABLE),
      section: "table",
      popover: {
        title: "Policy details",
        description:
          "Provider, policy number, coverage amount, effective/expiration dates. Click into any agent to view or replace their certificate.",
        side: "top",
      },
    },
    {
      section: "context",
      popover: {
        title: "$1M is the floor",
        description:
          "Most carriers require a <strong>minimum of $1 million per occurrence</strong>. Typical providers you'll see: <strong>NAPA</strong>, Calsurance, Travelers. Any cert under $1M should be flagged for renewal at a higher coverage amount.",
      },
    },
    {
      section: "context",
      popover: {
        title: "60-day runway",
        description:
          "Agents get an automatic email at 60 days before expiration. Admins should see movement in this matrix 30 days out — if you still see red at 30 days, nudge the agent directly from their file.",
      },
    },
  ],
};
