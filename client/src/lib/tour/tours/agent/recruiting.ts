import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentRecruitingTour: TourConfig = {
  id: "agent.recruiting",
  role: "agent",
  page: "/agents/recruiting",
  label: "Recruiting",
  nextTourId: "agent.quotes",
  nextCtaLabel: "Next: Quotes →",
  steps: [
    {
      popover: {
        title: "Recruiting",
        description:
          "Build your <strong>downline</strong>. Share your link, track who applies, and watch your <strong>override pool</strong> grow as your recruits get contracted, licensed, and producing.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.RECRUITING.HEADER),
      popover: {
        title: "Recruiting header",
        description:
          "Lifetime recruits, pending applications, and your active recruiting campaigns. Quick anchors to copy your link and review the funnel below.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.RECRUITING.STATS),
      popover: {
        title: "Recruiting stats",
        description:
          "<strong>Clicks</strong>, <strong>applications</strong>, <strong>contracted</strong>, and <strong>producing</strong> — the full funnel from one link share to a producing agent on your team.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.RECRUITING.REFERRAL_LINK),
      popover: {
        title: "Your referral link",
        description:
          "<strong>Copy your unique link</strong> with one click and share it on social, email, or text. Every applicant who comes through is automatically tied to you and lands in your downline.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.RECRUITING.FUNNEL),
      popover: {
        title: "Funnel visualization",
        description:
          "Visual breakdown of where candidates drop off — apply, interview, contract, license, produce. <em>Spot the bottleneck and fix it</em> with a more targeted nudge or call.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.RECRUITING.DOWNLINE),
      popover: {
        title: "Downline tracking",
        description:
          "Your producing recruits with their <strong>AP</strong>, <strong>contract level</strong>, and join date. Click any name to open their profile, start a chat, or see their pipeline.",
        side: "top",
      },
    },
  ],
};
