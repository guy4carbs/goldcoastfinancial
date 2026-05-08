import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentWebsiteTour: TourConfig = {
  id: "agent.website",
  role: "agent",
  page: "/agents/website",
  label: "Personal Website",
  nextTourId: "agent.dialer",
  nextCtaLabel: "Next: Dialer →",
  steps: [
    {
      popover: {
        title: "Your personal website",
        description:
          "A live, <strong>public agent site</strong> — your photo, story, and a built-in lead form. Heritage hosts it, you customize it, prospects find you on Google and social.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.WEBSITE.HEADER),
      popover: {
        title: "Website header",
        description:
          "Your <strong>live URL</strong>, publish status, and a quick path to share or open the site in a new tab. The control panel for everything below.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.WEBSITE.PREVIEW),
      popover: {
        title: "Live preview",
        description:
          "Iframe preview of your live site. Toggle between <strong>desktop</strong> and <strong>mobile</strong> to see exactly how visitors experience it on each device — most leads land on mobile.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.WEBSITE.SETTINGS),
      popover: {
        title: "Section toggles",
        description:
          "Turn sections on or off — <strong>about</strong>, <strong>testimonials</strong>, <strong>products</strong>, <strong>lead form</strong>. Your site shape, your call. Less is often more.",
        side: "left",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.WEBSITE.STATS),
      popover: {
        title: "Visitor stats",
        description:
          "<strong>Visits</strong>, <strong>leads captured</strong>, and <strong>top traffic sources</strong>. The site is a 24/7 salesperson — track its conversion rate like one.",
        side: "top",
      },
    },
  ],
};
