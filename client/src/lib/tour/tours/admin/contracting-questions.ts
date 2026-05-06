import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const adminContractingQuestionsTour: TourConfig = {
  id: "admin.contracting-questions",
  role: "admin",
  page: "/hcms/contracting/questions",
  label: "Background Questions",
  nextCtaLabel: "Finish walkthrough",
  celebrateOnFinish: true,
  steps: [
    {
      popover: {
        title: "Background disclosures across the agency",
        description:
          "The 19 SureLC questions every agent answers during onboarding — bankruptcies, state actions, license history, prior terminations. Anyone with <strong>Yes</strong> answers shows up flagged so a manager can review with the carrier.",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_QUESTIONS.SUMMARY),
      section: "summary",
      popover: {
        title: "Flag counts",
        description:
          "Agents with zero flags, 1–2 flags, and 3+ flags. A <strong>Yes</strong> isn't disqualifying — carriers just want to review the explanation.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_QUESTIONS.FILTER),
      section: "filters",
      popover: {
        title: "Filter to flagged agents",
        description:
          "Show only agents with flagged answers — fastest way to prepare carrier-facing explanations in bulk.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.CONTRACTING_QUESTIONS.TABLE),
      section: "table",
      popover: {
        title: "Per-agent detail",
        description:
          "See each agent's flag count and dive in to read the specific questions and their written explanations. That's what goes into the carrier appointment package.",
        side: "top",
      },
    },
    {
      section: "context",
      popover: {
        title: "The 19 questions are SureLC-standard",
        description:
          "These are <strong>industry-standard</strong> SureLC disclosures — same set every carrier uses. Topics: felonies, fraud allegations, terminations for cause, license suspensions, bankruptcies, liens, tax issues. If your agent answers &quot;Yes&quot; to any, they explain inline.",
      },
    },
    {
      section: "context",
      popover: {
        title: "A flag is not a rejection",
        description:
          "Carriers don't auto-decline on a &quot;Yes&quot; answer — they want the <strong>explanation</strong> so their compliance team can review. A clear, honest written answer usually goes through. A missing explanation is what kills applications.",
      },
    },
    {
      popover: {
        title: "That's the full admin walkthrough",
        description:
          "You've seen every view in the admin HCMS. Click <strong>Finish walkthrough</strong> for a wrap-up — the <em>Take the tour</em> button bottom-right replays any page's tour any time.",
      },
    },
  ],
};
