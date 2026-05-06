import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentProfileTour: TourConfig = {
  id: "agent.profile",
  role: "agent",
  page: "/hcms/my/profile",
  label: "Profile",
  nextCtaLabel: "Done",
  steps: [
    {
      popover: {
        title: "Your profile",
        description:
          "This is what carriers see on your paperwork. Keep it current — changes sync to every active carrier appointment automatically.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.PROFILE.PERSONAL),
      section: "contact",
      popover: {
        title: "Contact information",
        description:
          "Email and phone are editable here — these are your primary contact points for the agency and for carriers.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.PROFILE.ADDRESS),
      section: "contact",
      popover: {
        title: "Mailing address",
        description:
          "Where 1099s, carrier notices, and compliance mail go. Updating here updates it everywhere.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.PROFILE.BACKGROUND),
      section: "background",
      popover: {
        title: "Read-only details",
        description:
          "Full name, date of birth, NPN, and experience — locked after you submit your application. Email <strong>an administrator</strong> if any of these need correcting.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.PROFILE.SAVE_BUTTON),
      section: "actions",
      popover: {
        title: "Save your changes",
        description: "Click when you've updated contact info. You'll see a green \"Saved\" confirmation.",
        side: "left",
      },
    },
  ],
};
