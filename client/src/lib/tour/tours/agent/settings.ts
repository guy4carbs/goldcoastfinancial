import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentSettingsTour: TourConfig = {
  id: "agent.settings",
  role: "agent",
  page: "/agents/settings",
  label: "Settings",
  nextTourId: "agent.help",
  nextCtaLabel: "Next: Help & Support →",
  steps: [
    {
      popover: {
        title: "Settings",
        description:
          "Your <strong>profile</strong>, <strong>notification preferences</strong>, <strong>banking details</strong> for commissions, and <strong>account controls</strong>. The control panel for your Heritage account.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.SETTINGS.HEADER),
      popover: {
        title: "Settings header",
        description:
          "Quick anchors to each section — <strong>profile</strong>, <strong>notifications</strong>, <strong>bank</strong>, and the <strong>danger zone</strong>. Jump straight to what you need.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.SETTINGS.PROFILE),
      popover: {
        title: "Profile",
        description:
          "Your <strong>photo</strong>, <strong>name</strong>, <strong>contact info</strong>, and <strong>licensing details</strong>. This data also powers your business card and personal website — update it once and it updates everywhere.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.SETTINGS.NOTIFICATIONS),
      popover: {
        title: "Notifications",
        description:
          "Pick which events ping you, on which channels — <strong>email</strong>, <strong>SMS</strong>, <strong>push</strong>, <strong>in-app</strong>. Less noise, more signal — turn off everything you don't need.",
        side: "left",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.SETTINGS.BANK),
      popover: {
        title: "Banking",
        description:
          "Where your <strong>commissions</strong> get deposited. Update routing and account numbers any time — Heritage holds <em>no funds</em>, payouts go straight from carrier to you.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.SETTINGS.DANGER),
      popover: {
        title: "Danger zone",
        description:
          "Account deletion lives here. <strong>Permanent and irreversible</strong> — a confirmation step keeps you safe from accidents.",
        side: "top",
      },
    },
  ],
};
