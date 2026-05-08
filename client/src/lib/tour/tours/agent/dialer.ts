import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentDialerTour: TourConfig = {
  id: "agent.dialer",
  role: "agent",
  page: "/agents/dialer",
  label: "Dialer",
  nextTourId: "agent.communications",
  nextCtaLabel: "Next: Communications →",
  steps: [
    {
      popover: {
        title: "Dialer",
        description:
          "Browser-based phone powered by <strong>Telnyx WebRTC</strong>. Make and receive calls, run a <strong>power-dialer queue</strong>, drop pre-recorded voicemails, and review <strong>call recordings</strong> — all without leaving the lounge.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DIALER.HEADER),
      popover: {
        title: "Dialer header",
        description:
          "Active line status, <strong>call quality</strong> indicator, and your assigned <strong>Telnyx number</strong>. If something feels off — dropped calls, no audio — this is the first place to check.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DIALER.DIALPAD),
      popover: {
        title: "12-key dialpad",
        description:
          "Standard <strong>0–9, *, #</strong> with a one-click call button. Click or type — both work. <strong>DTMF tones</strong> work mid-call so you can navigate IVR menus without leaving Heritage.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DIALER.CONTACT_SEARCH),
      popover: {
        title: "Search contacts",
        description:
          "Find any client or lead by name and dial straight from the result — <em>no copy-pasting numbers</em>. Search hits leads, clients, and your dialer history together.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DIALER.CALL_HISTORY),
      popover: {
        title: "Call history",
        description:
          "Every inbound and outbound call with duration, direction, and the <strong>recording</strong> (when consented). Click any row to open the contact's profile and pick up where you left off.",
        side: "left",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DIALER.POWER_QUEUE),
      popover: {
        title: "Power-dialer queue",
        description:
          "Load a list and the dialer <strong>auto-advances</strong> through it call by call. Perfect for callback days, warm follow-up batches, and burning through fresh marketplace leads fast.",
        side: "left",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DIALER.RECORDINGS),
      popover: {
        title: "Recordings & voicemail drops",
        description:
          "Pre-record voicemails once, drop them with a click when you hit a machine. Recordings of consented calls live here too — review them later for coaching or compliance.",
        side: "top",
      },
    },
  ],
};
