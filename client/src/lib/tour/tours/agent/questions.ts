import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentQuestionsTour: TourConfig = {
  id: "agent.questions",
  role: "agent",
  page: "/hcms/my/questions",
  label: "Background Questions",
  nextTourId: "agent.carriers",
  nextCtaLabel: "Next: Carriers →",
  steps: [
    {
      popover: {
        title: "SureLC background disclosures",
        description:
          "Nineteen standard carrier disclosures — bankruptcies, liens, state actions, license history. Every carrier asks the same ones, so you answer them once here.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.QUESTIONS.LIST),
      section: "list",
      popover: {
        title: "The questions",
        description:
          "Each disclosure shows your answer and, if it was <strong>Yes</strong>, a short explanation. The full list flows across multiple pages — use the numbered pager below.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.QUESTIONS.PROGRESS),
      section: "list",
      popover: {
        title: "Paging through",
        description: "Five questions per page. The current page number and total are shown between the arrows.",
        side: "top",
      },
    },
    {
      popover: {
        title: "A \"Yes\" is not a rejection",
        description:
          "A flagged disclosure just means a manager reviews it with the carrier alongside your explanation. Honesty is what carriers actually care about here.",
      },
    },
    {
      popover: {
        title: "Need to update an answer?",
        description:
          "These answers are captured from your original application and are <strong>read-only</strong> from the portal. Contact your administrator if anything needs correcting.",
      },
    },
  ],
};
