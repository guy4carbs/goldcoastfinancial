import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const adminAgentsListTour: TourConfig = {
  id: "admin.agents-list",
  role: "admin",
  page: "/hcms/agents",
  label: "Agent Directory",
  nextTourId: "admin.agent-detail",
  nextCtaLabel: "Next: Open an agent →",
  steps: [
    {
      element: tourSelector(TOUR.ADMIN.AGENTS_LIST.HEADER),
      popover: {
        title: "Agent Directory",
        description:
          "Every contracted and pending agent in the agency. This is your master view — click any row to drill into a single agent's full contracting profile.",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.AGENTS_LIST.KPI_TOTAL),
      section: "kpis",
      popover: {
        title: "Total agents",
        description: "All agents regardless of status — active, pending, rejected.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.AGENTS_LIST.KPI_PENDING),
      section: "kpis",
      popover: {
        title: "Pending review",
        description:
          "New applications waiting for a manager to pick them up. If this number is growing, someone needs to be paged.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.AGENTS_LIST.KPI_IN_REVIEW),
      section: "kpis",
      popover: {
        title: "In review",
        description: "Applications a manager has claimed but not yet approved or rejected.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.AGENTS_LIST.KPI_ACTIVE),
      section: "kpis",
      popover: {
        title: "Active agents",
        description: "Approved and actively writing business.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.AGENTS_LIST.TABS),
      section: "filters",
      popover: {
        title: "Status filters",
        description:
          "Quick filter by application stage — the counts update live as statuses change.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.ADMIN.AGENTS_LIST.TABLE),
      popover: {
        title: "Click any agent to open their file",
        description:
          "Inside each agent you'll see documents, licenses, carrier appointments, and the approve/reject controls. The next step of this tour will pop open one agent so you can see the detail view.",
        // Chain override: pick a real /hcms/agents/:id from the rendered table
        // rather than navigating to the dynamic-prefix page.
        onNextClick: () => {
          if (typeof document === "undefined") return;
          const link = document.querySelector<HTMLAnchorElement>(
            `${tourSelector(TOUR.ADMIN.AGENTS_LIST.TABLE)} a[href^="/hcms/agents/"]`
          );
          const href = link?.getAttribute("href");
          if (href && href !== "/hcms/agents" && href !== "/hcms/agents/") {
            return href;
          }
          // Empty directory fallback — stay on the list, let the user pick manually.
          return "/hcms/agents";
        },
      },
    },
  ],
};
