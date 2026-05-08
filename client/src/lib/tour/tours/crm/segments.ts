import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const crmSegmentsTour: TourConfig = {
  id: "crm.segments",
  role: "crm",
  page: "/crm/segments",
  label: "Segments & Tags",
  nextTourId: "crm.import-export",
  nextCtaLabel: "Next: Import / Export →",
  steps: [
    {
      popover: {
        title: "Segments & tags",
        description:
          "Group your contacts into reusable segments and label them with tags so campaigns, automations, and reports can target exactly the right people.",
      },
    },
    {
      element: tourSelector(TOUR.CRM.SEGMENTS.HEADER),
      popover: {
        title: "Segments header",
        description:
          "Create a new segment, manage tags, or open the campaign launcher from the action row.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.CRM.SEGMENTS.SEGMENT_GRID),
      popover: {
        title: "Segment grid",
        description:
          "Each card shows an icon, segment name, description, and live member count. Click a card to drill into the contacts inside, or to launch a campaign at the whole segment.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.CRM.SEGMENTS.TAG_CLOUD),
      popover: {
        title: "Tag cloud",
        description:
          "Every <strong>#hash</strong> tag in the system, sized by usage. Click a tag to see contacts wearing it — useful for quick ad-hoc segmentation.",
        side: "top",
      },
    },
  ],
};
