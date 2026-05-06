import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentEoTour: TourConfig = {
  id: "agent.eo",
  role: "agent",
  page: "/hcms/my/eo",
  label: "E&O Insurance",
  nextTourId: "agent.bank",
  nextCtaLabel: "Next: Bank →",
  steps: [
    {
      popover: {
        title: "Errors & Omissions coverage",
        description:
          "Protects you when a client claims your advice caused financial harm. Every carrier requires proof, typically <strong>$1M per occurrence</strong> minimum.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.EO.CURRENT),
      section: "policy",
      popover: {
        title: "Your current policy",
        description:
          "Provider, policy number, effective and expiration dates, and coverage amount. If this section is empty, your details haven't been captured yet — contact an administrator.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.EO.PROVIDER),
      section: "policy",
      popover: {
        title: "Your E&O carrier",
        description:
          "Typical providers are <strong>NAPA</strong>, Calsurance, or Travelers. Whichever you use is fine as long as the coverage amount meets carrier minimums.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.EO.EXPIRATION),
      section: "policy",
      popover: {
        title: "Expiration tracking",
        description:
          "We email you <strong>60 days before</strong> expiration — expired E&O means no new business, so don't let it lapse. Upload the renewed cert as soon as you have it.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.EO.UPLOAD),
      section: "upload",
      popover: {
        title: "Upload a renewed certificate",
        description:
          "PDF only. One click uploads, no approval needed — it's immediately visible to carriers on your file.",
        side: "top",
      },
    },
  ],
};
