import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentCalendarTour: TourConfig = {
  id: "agent.calendar",
  role: "agent",
  page: "/agents/calendar",
  label: "Calendar",
  nextTourId: "agent.book-of-business",
  nextCtaLabel: "Next: Book of Business →",
  steps: [
    {
      popover: {
        title: "Calendar",
        description:
          "Your <strong>appointments</strong>, <strong>follow-ups</strong>, and <strong>team meetings</strong> in one place. Connect Google or Apple Calendar and we'll keep both sides in two-way sync.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.CALENDAR.HEADER),
      popover: {
        title: "Calendar header",
        description:
          "Switch views, jump to today, and see which calendars are <strong>actively syncing</strong>. Your connected provider's status badge shows here.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.CALENDAR.WEEK_VIEW),
      popover: {
        title: "Week view",
        description:
          "<strong>Drag</strong> to reschedule, click an empty slot to create. <strong>Color blocks</strong> tell you at a glance what's a call, a meeting, a personal block, or a recruit interview.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.CALENDAR.EVENT_LIST),
      popover: {
        title: "Upcoming events",
        description:
          "A clean list of what's next — client name, time, and <strong>quick actions</strong> to call, message, or open the lead profile in one click. Great for the 5 minutes before an appointment.",
        side: "left",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.CALENDAR.PROVIDER_CONNECT),
      popover: {
        title: "Connect Google or Apple",
        description:
          "<strong>Two-way OAuth sync</strong> — events you create here land in your personal calendar, and personal events show up here so you <em>never double-book</em> a client.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.CALENDAR.NEW_EVENT),
      popover: {
        title: "New event",
        description:
          "Create an appointment, set <strong>reminders</strong>, attach a client, and the system handles invites and follow-up tasks for you. Every appointment is also logged on the lead's timeline.",
        side: "left",
      },
    },
  ],
};
