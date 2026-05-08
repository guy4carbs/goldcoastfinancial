import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentBusinessCardTour: TourConfig = {
  id: "agent.business-card",
  role: "agent",
  page: "/agents/business-card",
  label: "Business Card",
  nextTourId: "agent.website",
  nextCtaLabel: "Next: Your Website →",
  steps: [
    {
      popover: {
        title: "Digital business card",
        description:
          "Your shareable <strong>digital business card</strong> — bitmoji, contact info, and a <strong>QR code</strong> that drops your details straight into a prospect's phone in one tap.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.BUSINESS_CARD.HEADER),
      popover: {
        title: "Business card header",
        description:
          "Card preview status, <strong>share count</strong>, and a quick path to your shareable link. A peek at how often your card is making the rounds.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.BUSINESS_CARD.PREVIEW),
      popover: {
        title: "3D preview",
        description:
          "Live <strong>3D preview</strong> — hover to flip and see both sides. This is exactly what your prospects see when you share the link.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.BUSINESS_CARD.EDIT_FORM),
      popover: {
        title: "Edit your card",
        description:
          "Swap your <strong>bitmoji</strong>, update contact info, pick a <strong>color theme</strong>. Changes update the preview in real time — no save button needed.",
        side: "left",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.BUSINESS_CARD.SHARE),
      popover: {
        title: "Share",
        description:
          "<strong>Copy your shareable link</strong>, download the QR code as an image, or send directly via SMS. Your card lives forever in their contacts.",
        side: "top",
      },
    },
  ],
};
