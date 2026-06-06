// =============================================================================
// Shared system-email module — public surface.
// =============================================================================
//
// Import everything email-related from here:
//   import { sendEmail, isSuppressed, resolveTemplate } from "../services/email";

export { sendEmail } from "./transport";
export type { EmailSendInput, EmailSendResult } from "./transport";

export { sendStructured as sendStructuredGmail } from "./gmailRawTransport";

export {
  logEmailSent,
  updateEmailStatusByMessageId,
} from "./emailLogger";
export type { LogEmailRecord, EmailStatusPatch } from "./emailLogger";

export { isSuppressed, suppress, unsuppress } from "./suppression";

export {
  signUnsubscribeToken,
  verifyUnsubscribeToken,
  buildListUnsubscribeHeaders,
} from "./unsubscribeToken";

export { resolveTemplate } from "./templateResolver";

// Re-export the shared category taxonomy for convenience.
export {
  EMAIL_CATEGORIES,
  TRANSACTIONAL_CATEGORIES,
  MARKETING_CATEGORIES,
  isTransactionalCategory,
  isMarketingCategory,
} from "@shared/models/email";
export type { EmailCategory, TransactionalCategory, MarketingCategory } from "@shared/models/email";
