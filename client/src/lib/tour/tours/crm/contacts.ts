import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const crmContactsTour: TourConfig = {
  id: "crm.contacts",
  role: "crm",
  page: "/crm/contacts",
  label: "Contacts",
  nextTourId: "crm.clients",
  nextCtaLabel: "Next: Clients →",
  steps: [
    {
      popover: {
        title: "Contact database",
        description:
          "Every lead and prospect lives here. The 9-column table is built for fast scanning — filter, search, and bulk-act without leaving the page.",
      },
    },
    {
      element: tourSelector(TOUR.CRM.CONTACTS.HEADER),
      popover: {
        title: "Contacts header",
        description:
          "Add a contact, run an import, or kick off an outreach campaign from the action row at the top.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.CONTACTS.SEARCH),
      popover: {
        title: "Search contacts",
        description:
          "Search by name, email, phone, or tag. Results filter the table live as you type.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.CONTACTS.FILTERS),
      popover: {
        title: "Filters",
        description:
          "Narrow the table by status, source, owner, tag, or date range. Multiple filters stack — useful for slicing your follow-up list.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.CONTACTS.TABLE),
      popover: {
        title: "9-column contact table",
        description:
          "Name, status, source, owner, last touched, score, value, tags, and quick actions. Status badges show <strong>new</strong>, <strong>contacted</strong>, <strong>quoted</strong>, <strong>follow_up</strong>, <strong>won</strong>, or <strong>lost</strong> at a glance.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.CRM.CONTACTS.BULK),
      popover: {
        title: "Bulk actions",
        description:
          "Select multiple rows to assign owners, change status, add tags, or trigger campaigns in one shot. The bulk bar appears as soon as you check the first box.",
        side: "top",
      },
    },
  ],
};
