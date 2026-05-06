import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentDocumentsTour: TourConfig = {
  id: "agent.documents",
  role: "agent",
  page: "/hcms/my/documents",
  label: "Documents",
  nextTourId: "agent.licenses",
  nextCtaLabel: "Next: Licenses →",
  steps: [
    {
      popover: {
        title: "Documents live here",
        description:
          "Two groups: <strong>agreements we generate for you to sign</strong> (NDA, Debt Roll-Up, Compliance) and <strong>documents you upload</strong> (E&O certificate, Gov ID, AML, direct deposit).",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DOCUMENTS.SIGNED_BLOCK),
      section: "signed",
      popover: {
        title: "Signed agreements",
        description:
          "Every agent signs the same three. We pre-fill them with your info — you just review and e-sign. Once signed, the PDF is available here with a signature timestamp.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DOCUMENTS.NDA),
      section: "signed",
      popover: {
        title: "Non-Disclosure Agreement",
        description: "Protects client and company information. Click to review and sign.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DOCUMENTS.DEBT_ROLLUP),
      section: "signed",
      popover: {
        title: "Debt Roll-Up Agreement",
        description:
          "Governs how commission advances roll forward against any debits. Standard across every agent in the agency.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DOCUMENTS.COMPLIANCE),
      section: "signed",
      popover: {
        title: "Compliance & Ethics",
        description: "Covers state regulations, NAIC model conduct, and our internal policies.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DOCUMENTS.UPLOADED_BLOCK),
      section: "uploaded",
      popover: {
        title: "Uploaded documents",
        description:
          "Documents from outside sources that you upload yourself — carriers need each one before they'll appoint you.",
        side: "top",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DOCUMENTS.EO_UPLOAD),
      section: "uploaded",
      popover: {
        title: "E&O certificate",
        description:
          "Your current Errors & Omissions insurance certificate. Most carriers require a minimum of $1M in coverage.",
        side: "right",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DOCUMENTS.DIRECT_DEPOSIT_UPLOAD),
      section: "uploaded",
      popover: {
        title: "Direct deposit authorization",
        description:
          "A signed authorization form — separate from the routing/account digits we store. Needed before your first commission run.",
        side: "right",
      },
    },
  ],
};
