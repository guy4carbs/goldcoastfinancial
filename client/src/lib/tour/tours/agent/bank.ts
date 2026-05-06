import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentBankTour: TourConfig = {
  id: "agent.bank",
  role: "agent",
  page: "/hcms/my/bank",
  label: "Banking",
  nextTourId: "agent.trainings",
  nextCtaLabel: "Next: Trainings →",
  steps: [
    {
      popover: {
        title: "Direct deposit",
        description:
          "Where the carriers send your commissions. Gold Coast never pays you directly — each insurance carrier deposits to the account on file here. Account numbers stay encrypted; only the last four show in the UI for verification.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.BANK.FORM),
      section: "details",
      popover: {
        title: "Your bank on file",
        description:
          "Bank name, account type (checking or savings), and the masked routing/account digits. If this block is empty, your banking isn't set up yet.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.BANK.ROUTING),
      section: "details",
      popover: {
        title: "Routing number",
        description:
          "Nine-digit number identifying your bank. We store only the last 4 — the full number is never displayed after initial entry.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.BANK.ACCOUNT),
      section: "details",
      popover: {
        title: "Account number",
        description:
          "Your specific account at the bank. Encrypted end-to-end; only the last four show in our UI for verification.",
        side: "left",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.BANK.UPLOAD),
      section: "upload",
      popover: {
        title: "Direct deposit authorization",
        description:
          "A signed form the carriers use to deposit commissions to this account — separate from the digits above. Required before your first carrier pays out.",
        side: "top",
      },
    },
  ],
};
