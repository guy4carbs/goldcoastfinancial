import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const adminContractingBankTour: TourConfig = {
  id: "admin.contracting-bank",
  role: "admin",
  page: "/hcms/contracting/bank",
  label: "Banking Status",
  nextTourId: "admin.contracting-licenses",
  nextCtaLabel: "Next: Licenses →",
  steps: [
    {
      popover: {
        title: "Agency-wide banking status",
        description:
          "Who has direct deposit on file, who hasn't, and who's missing just the voided check. Agents aren't paid by Gold Coast directly — this data is what carriers use to deposit commissions, so gaps here block commission flow.",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_BANK.SUMMARY),
      section: "summary",
      popover: {
        title: "Completion summary",
        description: "Rolled-up counts across the whole agency — complete vs pending.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_BANK.FILTER),
      section: "filters",
      popover: {
        title: "Filter to what needs attention",
        description:
          "Jump straight to the agents who need a follow-up — missing form, invalid routing, or incomplete account data.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_BANK.TABLE),
      section: "table",
      popover: {
        title: "Per-agent detail",
        description:
          "Bank name, account type, last-four digits, and the direct-deposit form status. Click into any agent to view or replace their banking.",
        side: "top",
      },
    },
    {
      section: "context",
      popover: {
        title: "Form vs. on-file data",
        description:
          "Two different things on this page: the <strong>Direct Deposit Authorization form</strong> (a PDF the agent uploaded) and the <strong>routing/account digits</strong> stored encrypted. Some carriers accept just the form, others want both — leave both green.",
      },
    },
    {
      section: "context",
      popover: {
        title: "Why this matters",
        description:
          "Gold Coast never pays agents directly — <strong>each carrier</strong> deposits commissions straight to the account on file here. Missing data on this page means missing commissions.",
      },
    },
  ],
};
