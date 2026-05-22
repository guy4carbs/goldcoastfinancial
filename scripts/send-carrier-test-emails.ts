/**
 * Send 33 branded test emails (3 types × 11 new carriers) to a recipient.
 *
 * Run:  tsx scripts/send-carrier-test-emails.ts [recipient-email]
 *       Defaults to guy4carbs@gmail.com when no recipient is passed.
 *
 * Imports the email functions directly from server/gmail.ts (no HTTP, no auth).
 * Mirrors the payload shapes the /api/admin/email/test endpoint constructs,
 * so what arrives in the inbox is what a real admin trigger would produce.
 *
 * Does NOT write to any database table.
 */

import "dotenv/config";
import crypto from "crypto";
import {
  CARRIER_EMAIL_BRANDING,
  sendPolicyQuoteEmail,
  sendSecureFormEmail,
  sendProductGuideEmail,
} from "../server/gmail";

// Parse args: positional recipient + optional --carriers=a,b,c filter
const positional: string[] = [];
const flags: Record<string, string> = {};
for (const arg of process.argv.slice(2)) {
  if (arg.startsWith("--")) {
    const [k, v] = arg.slice(2).split("=");
    flags[k] = v ?? "";
  } else {
    positional.push(arg);
  }
}

const TO = positional[0] || "guy4carbs@gmail.com";

const ALL_NEW_CARRIERS = [
  "aetna",
  "american-amicable",
  "banner-life",
  "chubb",
  "foresters",
  "globe-life",
  "guarantee-trust",
  "instabrain",
  "lafayette-life",
  "trinity-life",
  "united-home-life",
];

const NEW_CARRIERS = flags.carriers
  ? flags.carriers.split(",").map((s) => s.trim()).filter(Boolean)
  : ALL_NEW_CARRIERS;

const AGENT = {
  name: "Heritage QA",
  email: "contact@heritagels.org",
  phone: "+1 630 778 0888",
  npn: "TEST",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function sendQuote(carrierId: string) {
  const carrier = CARRIER_EMAIL_BRANDING[carrierId];
  if (!carrier) throw new Error(`Missing branding for ${carrierId}`);
  await sendPolicyQuoteEmail({
    clientName: "QA Test Recipient",
    clientEmail: TO,
    quoteType: "term_life",
    quoteTypeName: "Term Life Insurance",
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
    quoteRef: `TEST-${Date.now()}`,
    quoteId: `test-${Date.now()}`,
    agent: AGENT,
  });
}

async function sendSecureForm(carrierId: string) {
  const carrier = CARRIER_EMAIL_BRANDING[carrierId];
  if (!carrier) throw new Error(`Missing branding for ${carrierId}`);
  await sendSecureFormEmail({
    clientName: "QA Test Recipient",
    clientEmail: TO,
    formType: "ssn",
    secureLink: `https://heritagels.org/secure/form/test-${crypto.randomUUID()}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    carrierId,
    carrier: carrier.name,
    customMessage:
      "[TEST EMAIL] This is a branding QA test — link will not work.",
    agent: {
      name: AGENT.name,
      email: AGENT.email,
      phone: AGENT.phone,
    },
  });
}

async function sendGuide(carrierId: string) {
  const carrier = CARRIER_EMAIL_BRANDING[carrierId];
  if (!carrier) throw new Error(`Missing branding for ${carrierId}`);
  await sendProductGuideEmail({
    recipientName: "QA Test Recipient",
    recipientEmail: TO,
    guideUrl: `https://heritagels.org/guides/view/test-${crypto.randomUUID()}`,
    guideTitle: "Term Life Insurance",
    guideDescription: "Affordable coverage for a specific period of time.",
    personalMessage:
      "[TEST EMAIL] This is a branding QA test to verify carrier-branded product guide rendering.",
    carrierId,
    carrierName: carrier.name,
    agent: AGENT,
  });
}

async function main() {
  console.log(`Sending 33 branded test emails to ${TO}\n`);

  const results: { carrier: string; type: string; ok: boolean; err?: string }[] = [];

  for (const carrierId of NEW_CARRIERS) {
    console.log(`[${carrierId}]`);

    for (const [type, fn] of [
      ["quote", sendQuote],
      ["secure-form", sendSecureForm],
      ["product-guide", sendGuide],
    ] as const) {
      try {
        await fn(carrierId);
        console.log(`  ✓ ${type}`);
        results.push({ carrier: carrierId, type, ok: true });
      } catch (e: any) {
        const msg = e?.message || String(e);
        console.error(`  ✗ ${type} — ${msg}`);
        results.push({ carrier: carrierId, type, ok: false, err: msg });
      }
      await sleep(500); // pace to stay polite with Gmail API
    }
  }

  const ok = results.filter((r) => r.ok).length;
  const fail = results.filter((r) => !r.ok).length;
  console.log(`\nDone. ${ok} sent, ${fail} failed of ${results.length} attempted.`);
  if (fail > 0) {
    console.log("\nFailures:");
    for (const r of results.filter((x) => !x.ok)) {
      console.log(`  ${r.carrier} / ${r.type}: ${r.err}`);
    }
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
