import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentTrainingTour: TourConfig = {
  id: "agent.training",
  role: "agent",
  page: "/agents/training-sessions",
  label: "Training",
  nextTourId: "agent.guidelines",
  nextCtaLabel: "Next: Guidelines →",
  steps: [
    {
      popover: {
        title: "Training sessions",
        description:
          "Live training with <strong>managers</strong> and <strong>top producers</strong> — phone, video, in-person, or screen-share. Book the format that fits how you learn best.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.TRAINING.HEADER),
      popover: {
        title: "Training header",
        description:
          "Upcoming sessions you're <strong>booked into</strong> and a quick path to schedule a new one. The agenda for the week, at a glance.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.TRAINING.STATS),
      popover: {
        title: "Training stats",
        description:
          "<strong>Hours completed</strong>, <strong>sessions attended</strong>, and a <strong>streak counter</strong>. Consistent training is the difference between average and elite — the streak tells the truth.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.TRAINING.TABLE),
      popover: {
        title: "Sessions table",
        description:
          "Every training listed with <strong>topic</strong>, <strong>format</strong>, <strong>trainer</strong>, and <strong>seats remaining</strong>. Filter by what's relevant to where you are in your business right now.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.TRAINING.SCHEDULE),
      popover: {
        title: "Book a session",
        description:
          "Pick a session and format — <strong>phone</strong>, <strong>video</strong>, <strong>in-person</strong>, or <strong>screen-share</strong>. Confirmation lands in your calendar automatically with a reminder.",
        side: "left",
      },
    },
  ],
};
