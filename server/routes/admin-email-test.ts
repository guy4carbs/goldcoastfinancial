/**
 * Admin Email Test Routes
 *
 * Send branded test emails (quote, secure form, product guide) for any carrier
 * without writing to the database. Used to QA carrier-branded email rendering.
 *
 * Auth: requireAuth + requireRole(FOUNDER, OWNER, SYSTEM_ADMIN) — matches the
 * admin-images.ts pattern.
 *
 * Endpoints:
 *   POST /api/admin/email/test  — fire a branded test email
 *
 * Contract:
 *   Body: { type, carrierId, to, variant?, guideId? }
 *     - type: "quote" | "secure-form" | "product-guide"
 *     - carrierId: must exist in CARRIER_EMAIL_BRANDING
 *     - to: recipient email
 *     - variant: secure-form only — "ssn" | "banking" | "drivers_license" | "full_application" (default: ssn)
 *     - guideId: product-guide only — "term" | "whole" | "iul" | "final-expense" (default: term)
 *   Response 200: { success, type, carrierId, to, subject, sentAt }
 *
 * No DB writes — pure email send.
 */

import { Router, type Request, type Response } from "express";
import crypto from "crypto";
import { requireAuth, requireRole, type AuthenticatedUser } from "../middleware/auth";
import { Roles } from "../types/permissions";
import {
  CARRIER_EMAIL_BRANDING,
  sendPolicyQuoteEmail,
  sendSecureFormEmail,
  sendProductGuideEmail,
} from "../gmail";

const router = Router();

// =============================================================================
// AUTH GATE — admin only
// =============================================================================

const adminGate = [
  requireAuth,
  requireRole(Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN),
];

// =============================================================================
// CONSTANTS
// =============================================================================

const ALLOWED_TYPES = new Set<string>(["quote", "secure-form", "product-guide"]);
const ALLOWED_VARIANTS = new Set<string>([
  "ssn",
  "banking",
  "drivers_license",
  "full_application",
]);
const ALLOWED_GUIDE_IDS = new Set<string>(["term", "whole", "iul", "final-expense"]);

const GUIDE_MAP: Record<
  string,
  { title: string; description: string }
> = {
  term: {
    title: "Term Life Insurance",
    description: "Affordable coverage for a specific period of time.",
  },
  whole: {
    title: "Whole Life Insurance",
    description: "Permanent protection with cash value accumulation.",
  },
  iul: {
    title: "Indexed Universal Life",
    description:
      "Flexible permanent coverage with market-linked growth potential.",
  },
  "final-expense": {
    title: "Final Expense Insurance",
    description: "Simplified-issue coverage for end-of-life costs.",
  },
};

// Basic email validation — matches the spec
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// =============================================================================
// HELPERS
// =============================================================================

function buildAgent(user: AuthenticatedUser | undefined) {
  const fullName =
    user && (user.firstName || user.lastName)
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
      : "Heritage QA";
  return {
    name: fullName || "Heritage QA",
    email: user?.email || "contact@heritagels.org",
    phone: "+1 630 778 0888",
    npn: "TEST",
  };
}

// =============================================================================
// POST /api/admin/email/test
// =============================================================================

router.post("/test", ...adminGate, async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    const { type, carrierId, to } = body;
    const variant: string | undefined = body.variant;
    const guideId: string | undefined = body.guideId;

    // ── Validation ─────────────────────────────────────────────────────────
    if (typeof type !== "string" || !ALLOWED_TYPES.has(type)) {
      return res.status(400).json({
        error: `Invalid type. Must be one of: ${Array.from(ALLOWED_TYPES).join(", ")}.`,
      });
    }

    if (typeof to !== "string" || !EMAIL_REGEX.test(to)) {
      return res.status(400).json({ error: "Invalid recipient email address." });
    }

    if (typeof carrierId !== "string" || !CARRIER_EMAIL_BRANDING[carrierId]) {
      return res.status(400).json({
        error: `Invalid carrierId. Must be a known carrier (20 supported).`,
      });
    }

    if (type === "secure-form" && variant !== undefined && !ALLOWED_VARIANTS.has(variant)) {
      return res.status(400).json({
        error: `Invalid variant. Must be one of: ${Array.from(ALLOWED_VARIANTS).join(", ")}.`,
      });
    }

    if (type === "product-guide" && guideId !== undefined && !ALLOWED_GUIDE_IDS.has(guideId)) {
      return res.status(400).json({
        error: `Invalid guideId. Must be one of: ${Array.from(ALLOWED_GUIDE_IDS).join(", ")}.`,
      });
    }

    const carrier = CARRIER_EMAIL_BRANDING[carrierId];
    const admin = req.user as AuthenticatedUser | undefined;
    const agent = buildAgent(admin);
    const adminFirst = agent.name.split(" ")[0] || "Heritage";

    // ── Dispatch by type ───────────────────────────────────────────────────
    let subject: string;

    if (type === "quote") {
      const quoteRef = `TEST-${Date.now()}`;
      const quoteId = `test-${Date.now()}`;
      const quoteTypeName = "Term Life Insurance";

      try {
        await sendPolicyQuoteEmail({
          clientName: "QA Test Recipient",
          clientEmail: to,
          quoteType: "term_life",
          quoteTypeName,
          coverageAmount: "250000",
          premium: "$45.00",
          premiumFrequency: "monthly",
          termLength: "20",
          healthClass: "preferred",
          benefits: "Convertible, Waiver of Premium",
          additionalNotes:
            "[TEST EMAIL] This is a branding QA test — not a real quote.",
          carrierId,
          carrierName: carrier.name,
          quoteRef,
          quoteId,
          agent,
        });
      } catch (err: any) {
        console.error("[AdminEmailTest] Quote send failed:", err?.message || err);
        return res
          .status(500)
          .json({ error: `Send failed: ${err?.message || "unknown error"}` });
      }

      // Mirror sendPolicyQuoteEmail's subject construction
      subject = `Your ${quoteTypeName} Quote from ${carrier.shortName} - Prepared by ${adminFirst}`;
    } else if (type === "secure-form") {
      const formType = (variant ?? "ssn") as
        | "ssn"
        | "banking"
        | "drivers_license"
        | "full_application";
      const formTypeLabels: Record<string, string> = {
        ssn: "Social Security Number",
        banking: "Banking Information",
        drivers_license: "Driver's License / State ID",
        full_application: "Full Application",
      };
      const formTypeLabel = formTypeLabels[formType] || formType;

      try {
        await sendSecureFormEmail({
          clientName: "QA Test Recipient",
          clientEmail: to,
          formType,
          secureLink: `https://heritagels.org/secure/form/test-${crypto.randomUUID()}`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          carrierId,
          carrier: carrier.name,
          customMessage:
            "[TEST EMAIL] This is a branding QA test — link will not work.",
          agent: {
            name: agent.name,
            email: agent.email,
            phone: agent.phone,
          },
        });
      } catch (err: any) {
        console.error("[AdminEmailTest] Secure form send failed:", err?.message || err);
        return res
          .status(500)
          .json({ error: `Send failed: ${err?.message || "unknown error"}` });
      }

      // Mirror sendSecureFormEmail's subject construction
      subject = `${carrier.shortName} - Secure ${formTypeLabel} Request from ${adminFirst}`;
    } else {
      // type === "product-guide"
      const guideKey = (guideId ?? "term") as keyof typeof GUIDE_MAP;
      const guide = GUIDE_MAP[guideKey];

      try {
        await sendProductGuideEmail({
          recipientName: "QA Test Recipient",
          recipientEmail: to,
          guideUrl: `https://heritagels.org/guides/view/test-${crypto.randomUUID()}`,
          guideTitle: guide.title,
          guideDescription: guide.description,
          personalMessage:
            "[TEST EMAIL] This is a branding QA test to verify carrier-branded product guide rendering.",
          carrierId,
          carrierName: carrier.name,
          agent,
        });
      } catch (err: any) {
        console.error("[AdminEmailTest] Product guide send failed:", err?.message || err);
        return res
          .status(500)
          .json({ error: `Send failed: ${err?.message || "unknown error"}` });
      }

      // Mirror sendProductGuideEmail's subject construction
      subject = `${adminFirst} prepared a ${guide.title} guide for you about ${carrier.shortName}`;
    }

    console.log(
      `[AdminEmailTest] Sent ${type} test email to ${to} (carrier=${carrierId}) by ${admin?.email ?? "unknown"}`,
    );

    return res.json({
      success: true,
      type,
      carrierId,
      to,
      subject,
      sentAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[AdminEmailTest] Unexpected error:", error?.message || error);
    return res
      .status(500)
      .json({ error: `Send failed: ${error?.message || "unknown error"}` });
  }
});

export default router;
