import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentDbaTour: TourConfig = {
  id: "agent.dba",
  role: "agent",
  page: "/hcms/my/dba",
  label: "Doing Business As",
  nextTourId: "agent.questions",
  nextCtaLabel: "Next: Questions →",
  steps: [
    {
      popover: {
        title: "Individual or business entity?",
        description:
          "You can contract with carriers as yourself (<strong>Individual</strong>) or through a company you own (<strong>LLC, S-Corp, etc.</strong>). Which path you picked during onboarding determines what this page shows.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DBA.ENTITY_TYPE),
      section: "entity",
      popover: {
        title: "Your contracting entity",
        description:
          "The header on this block tells you whether you're contracted as an <strong>Individual</strong> or a <strong>Business Entity</strong>. Everything below adapts to that choice.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DBA.ENTITY_DETAILS),
      section: "entity",
      popover: {
        title: "Entity details",
        description:
          "For businesses: legal name, DBA, EIN, company type, formation date. For individuals: legal name, NPN, DOB, contact info. Carriers match this exactly to state filings.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DBA.ARTICLES),
      section: "business",
      popover: {
        title: "Articles of Incorporation",
        description:
          "Required for LLCs and corporations — the formation document you filed with the Secretary of State. If you're an individual, this section doesn't apply.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DBA.OWNERS),
      section: "business",
      popover: {
        title: "Owners",
        description:
          "Any individual with <strong>25% or more ownership</strong> of the entity is listed here — carriers need this for Know-Your-Customer checks. Again, business-entities only.",
        side: "top",
      },
    },
    {
      popover: {
        title: "Can't change entity type?",
        description:
          "Switching between individual and business contracting requires a new set of carrier paperwork. Email an admin and we'll walk you through it.",
      },
    },
  ],
};
