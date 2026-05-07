import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const founderSettingsTour: TourConfig = {
  id: "founder.settings",
  role: "founder",
  page: "/founders/settings",
  label: "Settings",
  nextCtaLabel: "Finish walkthrough",
  celebrateOnFinish: true,
  steps: [
    {
      popover: {
        title: "Founders settings",
        description:
          "System-wide knobs that only founders can flip — feature flags, notification preferences, system constants, and active sessions.",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.SETTINGS.NOTIFICATIONS),
      popover: {
        title: "Notification preferences",
        description:
          "Which events trigger an email or bell alert for founders. Set carefully — over-noisy notifications get ignored, under-noisy ones miss critical events.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.SETTINGS.FEATURE_FLAGS),
      popover: {
        title: "Feature flags",
        description:
          "Toggle in-progress features on or off agency-wide. Use this for staged rollouts — turn a flag on for founders first, then admins, then everyone, before fully shipping.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.SETTINGS.PLATINUM_TOGGLE),
      popover: {
        title: "Platinum tier",
        description:
          "Master switch for the Platinum-Director compensation tier. Only flip this with founder quorum — affects every override calculation downstream.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.SETTINGS.EXPORT_BUTTON),
      popover: {
        title: "Full export",
        description:
          "One-click export of all agency data for the period — agents, deals, commissions, hierarchy, statements. The packet you'd hand a CPA, an auditor, or a buyer in due diligence.",
        side: "left",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.SETTINGS.SYSTEM_CONSTANTS),
      popover: {
        title: "System constants",
        description:
          "Default contract levels, override ceilings, lead expiration windows, runway thresholds. Edit cautiously — every constant here is an assumption baked into dozens of calculations.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.FOUNDERS.SETTINGS.SESSIONS),
      popover: {
        title: "Active sessions",
        description:
          "Live list of every founder session currently signed in, with location and last-action timestamp. Revoke any session here if a device is lost or compromised.",
        side: "top",
      },
    },
    {
      popover: {
        title: "That's the full Founders walkthrough",
        description:
          "You've seen every view in the lounge. Click <strong>Finish walkthrough</strong> for a wrap-up — the <em>Take the tour</em> button bottom-right replays any page's tour any time.",
      },
    },
  ],
};
