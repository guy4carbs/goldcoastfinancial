import type { TourConfig } from "../../types";
import { TOUR, tourSelector } from "../../selectors";

export const agentDataEncryptionTour: TourConfig = {
  id: "agent.data-encryption",
  role: "agent",
  page: "/agents/data-encryption",
  label: "Data Encryption",
  nextTourId: "agent.resources",
  nextCtaLabel: "Next: Resources →",
  steps: [
    {
      popover: {
        title: "Data encryption",
        description:
          "Securely store sensitive client data — <strong>SSNs</strong>, <strong>banking info</strong>, <strong>ID photos</strong>. <strong>End-to-end encrypted per carrier</strong> so only the right people can decrypt at the right time.",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DATA_ENCRYPTION.HEADER),
      popover: {
        title: "Encryption header",
        description:
          "Your <strong>active carrier keys</strong>, last sync timestamp, and audit log access. <em>Compliance lives here</em> — every decryption is logged for SOC2 and carrier audits.",
        side: "bottom",
      },
    },
    {
      element: tourSelector(TOUR.AGENT.DATA_ENCRYPTION.SECURE_FIELDS),
      popover: {
        title: "Secure fields",
        description:
          "Carrier-specific encrypted fields. The data is <strong>end-to-end encrypted</strong> — <em>nobody at Heritage sees plaintext</em>, only the carrier with the matching key can decrypt. You're the safe pair of hands clients trust.",
        side: "top",
      },
    },
  ],
};
