/**
 * Document Generator Service
 * Generates branded PDF documents for Heritage Life Solutions
 * using PDFKit. Supports 17 document templates covering
 * welcome letters, policy summaries, claims, and account updates.
 *
 * All documents use Heritage violet branding with carrier logo
 * support via Firebase-hosted images.
 */

import PDFDocument from "pdfkit";
import { CARRIER_BRANDING } from "../../shared/carrierBranding";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLORS = {
  headerBg: "#3b1f7e",
  headerAccent: "#7c3aed",
  goldAccent: "#D4AF37",
  headerText: "#ffffff",
  sectionHeading: "#1f2937",
  bodyText: "#374151",
  lightGray: "#9ca3af",
  mediumGray: "#6b7280",
  border: "#d1d5db",
};

const AGENCY = {
  name: "Heritage Life Solutions",
  legal: "Gold Coast Financial Partners, LLC",
  npn: "22128144",
  website: "heritagels.org",
  portalUrl: "https://heritagels.org/client/login",
};

const PAGE_WIDTH = 612;
const CONTENT_WIDTH = PAGE_WIDTH - 120; // 492pt
const MARGIN_LEFT = 60;

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface AgentInfo {
  name: string;
  email: string;
  phone: string;
  npn: string;
}

export interface ClientInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface PolicyInfo {
  policyNumber: string;
  type: string;
  carrier: string;
  carrierId?: string;
  coverageAmount: number;
  monthlyPremium: number | string;
  startDate: string;
  nextPaymentDate?: string;
  status: string;
  beneficiaries: Array<{ name: string; relationship: string; percentage: number }>;
  beneficiaryName?: string;
  beneficiaryRelationship?: string;
  cashValue?: number;
}

export interface ClaimInfo {
  claimNumber: string;
  filedDate: string;
  type: string;
  status: string;
  amount?: number;
  denialReason?: string;
}

export interface GenerateDocumentOptions {
  templateKey: string;
  client: ClientInfo;
  agent: AgentInfo;
  policy?: PolicyInfo;
  claim?: ClaimInfo;
  personalNote?: string;
  additionalData?: Record<string, any>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d: string): string {
  const date = new Date(d);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

function drawHorizontalRule(doc: PDFKit.PDFDocument): void {
  const y = doc.y;
  doc
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .moveTo(MARGIN_LEFT, y)
    .lineTo(MARGIN_LEFT + CONTENT_WIDTH, y)
    .stroke();
  doc.y = y + 2;
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number): void {
  if (doc.y > 732 - needed) {
    doc.addPage();
  }
}

// ---------------------------------------------------------------------------
// Common PDF Builders
// ---------------------------------------------------------------------------

function buildHeader(doc: PDFKit.PDFDocument, title: string): void {
  // Violet header rectangle
  doc
    .rect(0, 0, PAGE_WIDTH, 100)
    .fill(COLORS.headerBg);

  // Agency name
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLORS.headerText)
    .text("HERITAGE LIFE SOLUTIONS", MARGIN_LEFT, 30, { width: CONTENT_WIDTH });

  // Gold accent line
  doc
    .strokeColor(COLORS.goldAccent)
    .lineWidth(2)
    .moveTo(0, 100)
    .lineTo(PAGE_WIDTH, 100)
    .stroke();

  // Document title
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor(COLORS.headerText)
    .text(title, MARGIN_LEFT, 55, { width: CONTENT_WIDTH });

  // Date right-aligned below header
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLORS.mediumGray)
    .text(
      new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      MARGIN_LEFT,
      115,
      { width: CONTENT_WIDTH, align: "right" }
    );

  doc.y = 135;
}

function buildAgentSignature(doc: PDFKit.PDFDocument, agent: AgentInfo): void {
  ensureSpace(doc, 120);
  doc.moveDown(1.5);
  drawHorizontalRule(doc);
  doc.moveDown(0.8);

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(COLORS.sectionHeading)
    .text(agent.name, MARGIN_LEFT, doc.y, { width: CONTENT_WIDTH });

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLORS.mediumGray)
    .text("Licensed Insurance Agent", MARGIN_LEFT, doc.y, { width: CONTENT_WIDTH });

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLORS.bodyText)
    .text(agent.phone, MARGIN_LEFT, doc.y, { width: CONTENT_WIDTH });

  doc
    .text(agent.email, MARGIN_LEFT, doc.y, { width: CONTENT_WIDTH });

  doc
    .text(`NPN: ${agent.npn}`, MARGIN_LEFT, doc.y, { width: CONTENT_WIDTH });

  doc.moveDown(0.5);

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(COLORS.lightGray)
    .text(
      `${AGENCY.name} | Agency NPN: ${AGENCY.npn}`,
      MARGIN_LEFT,
      doc.y,
      { width: CONTENT_WIDTH }
    );
}

function buildFooter(doc: PDFKit.PDFDocument): void {
  const footerY = 732 - 14;

  doc
    .font("Helvetica")
    .fontSize(7)
    .fillColor(COLORS.lightGray)
    .text(
      `${AGENCY.name} is a DBA of ${AGENCY.legal}. IL License #${AGENCY.npn}.`,
      MARGIN_LEFT,
      footerY,
      { width: CONTENT_WIDTH, align: "center" }
    );

  doc
    .text(
      "This document is for informational purposes and does not modify the terms of any insurance policy.",
      MARGIN_LEFT,
      doc.y,
      { width: CONTENT_WIDTH, align: "center" }
    );
}

async function embedCarrierLogo(
  doc: PDFKit.PDFDocument,
  carrierId: string | undefined,
  x: number,
  y: number,
  maxWidth: number
): Promise<void> {
  if (!carrierId) return;

  const branding = CARRIER_BRANDING[carrierId];
  if (!branding || !branding.logoUrl) {
    if (branding) {
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(COLORS.sectionHeading)
        .text(branding.name, x, y, { width: maxWidth, align: "right" });
    }
    return;
  }

  const imgBuffer = await fetchImageBuffer(branding.logoUrl);
  if (imgBuffer) {
    try {
      doc.image(imgBuffer, x, y, { width: maxWidth, height: 40 });
    } catch {
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(COLORS.sectionHeading)
        .text(branding.name, x, y, { width: maxWidth, align: "right" });
    }
  } else {
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(COLORS.sectionHeading)
      .text(branding.name, x, y, { width: maxWidth, align: "right" });
  }
}

// ---------------------------------------------------------------------------
// Table Helpers
// ---------------------------------------------------------------------------

function drawTableRow(
  doc: PDFKit.PDFDocument,
  label: string,
  value: string,
  labelWidth: number = 160
): void {
  ensureSpace(doc, 20);
  const y = doc.y;

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(COLORS.sectionHeading)
    .text(label, MARGIN_LEFT, y, { width: labelWidth });

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLORS.bodyText)
    .text(value, MARGIN_LEFT + labelWidth, y, { width: CONTENT_WIDTH - labelWidth });

  doc.y = Math.max(doc.y, y + 14);
}

function drawSectionHeading(doc: PDFKit.PDFDocument, heading: string): void {
  ensureSpace(doc, 30);
  doc.moveDown(0.8);

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(COLORS.sectionHeading)
    .text(heading, MARGIN_LEFT, doc.y, { width: CONTENT_WIDTH });

  doc.moveDown(0.4);
}

function drawBeneficiaryTable(
  doc: PDFKit.PDFDocument,
  beneficiaries: Array<{ name: string; relationship: string; percentage: number }>
): void {
  if (!beneficiaries || beneficiaries.length === 0) return;

  // Header row
  const colName = MARGIN_LEFT;
  const colRel = MARGIN_LEFT + 200;
  const colPct = MARGIN_LEFT + 380;
  const headerY = doc.y;

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(COLORS.sectionHeading)
    .text("Name", colName, headerY)
    .text("Relationship", colRel, headerY)
    .text("Allocation %", colPct, headerY);

  doc.y = headerY + 14;

  // Divider
  doc
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .moveTo(MARGIN_LEFT, doc.y)
    .lineTo(MARGIN_LEFT + CONTENT_WIDTH, doc.y)
    .stroke();

  doc.y += 4;

  // Data rows
  for (const b of beneficiaries) {
    ensureSpace(doc, 16);
    const rowY = doc.y;

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(COLORS.bodyText)
      .text(b.name, colName, rowY, { width: 190 })
      .text(b.relationship, colRel, rowY, { width: 170 })
      .text(`${b.percentage}%`, colPct, rowY, { width: 80 });

    doc.y = rowY + 14;
  }
}

function drawParagraph(doc: PDFKit.PDFDocument, text: string, style?: "italic"): void {
  ensureSpace(doc, 30);
  doc
    .font(style === "italic" ? "Helvetica-Oblique" : "Helvetica")
    .fontSize(9.5)
    .fillColor(COLORS.bodyText)
    .text(text, MARGIN_LEFT, doc.y, {
      width: CONTENT_WIDTH,
      lineGap: 3,
    });
  doc.moveDown(0.5);
}

function drawNumberedItem(doc: PDFKit.PDFDocument, number: number, text: string): void {
  ensureSpace(doc, 20);
  doc
    .font("Helvetica-Bold")
    .fontSize(9.5)
    .fillColor(COLORS.sectionHeading)
    .text(`${number}.`, MARGIN_LEFT, doc.y, { continued: true });
  doc
    .font("Helvetica")
    .fillColor(COLORS.bodyText)
    .text(`  ${text}`, { width: CONTENT_WIDTH - 20, lineGap: 3 });
  doc.moveDown(0.3);
}

function drawBulletItem(doc: PDFKit.PDFDocument, text: string): void {
  ensureSpace(doc, 20);
  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(COLORS.bodyText)
    .text(`\u2022  ${text}`, MARGIN_LEFT + 10, doc.y, {
      width: CONTENT_WIDTH - 10,
      lineGap: 3,
    });
  doc.moveDown(0.2);
}

function drawPersonalNote(doc: PDFKit.PDFDocument, note: string | undefined): void {
  if (!note) return;
  ensureSpace(doc, 40);
  doc.moveDown(0.5);
  drawSectionHeading(doc, "A Note from Your Agent");
  drawParagraph(doc, note, "italic");
}

// ---------------------------------------------------------------------------
// PDF Document Factory
// ---------------------------------------------------------------------------

function createDoc(title: string): PDFKit.PDFDocument {
  return new PDFDocument({
    size: "LETTER",
    margins: { top: 60, bottom: 60, left: 60, right: 60 },
    info: {
      Title: `${title} — ${AGENCY.name}`,
      Author: AGENCY.name,
      Subject: title,
      Creator: `${AGENCY.name} Document System`,
    },
  });
}

function wrapInBuffer(
  doc: PDFKit.PDFDocument,
  renderFn: (doc: PDFKit.PDFDocument) => void | Promise<void>
): Promise<Buffer> {
  return new Promise<Buffer>(async (resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    try {
      await renderFn(doc);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// ---------------------------------------------------------------------------
// Main Dispatcher
// ---------------------------------------------------------------------------

export async function generateDocument(options: GenerateDocumentOptions): Promise<Buffer> {
  switch (options.templateKey) {
    case "welcome_letter":
      return generateWelcomeLetter(options);
    case "policy_summary":
      return generatePolicySummary(options);
    case "claims_guide":
      return generateClaimsGuide(options);
    case "beneficiary_designation_confirmation":
      return generateBeneficiaryDesignationConfirmation(options);
    case "portal_access_instructions":
      return generatePortalAccessInstructions(options);
    case "annual_policy_statement":
      return generateAnnualPolicyStatement(options);
    case "premium_payment_reminder":
      return generatePremiumPaymentReminder(options);
    case "policy_anniversary_letter":
      return generatePolicyAnniversaryLetter(options);
    case "annual_review_invitation":
      return generateAnnualReviewInvitation(options);
    case "claims_packet":
      return generateClaimsPacket(options);
    case "claim_acknowledgment":
      return generateClaimAcknowledgment(options);
    case "claim_status_update":
      return generateClaimStatusUpdate(options);
    case "claim_approval_letter":
      return generateClaimApprovalLetter(options);
    case "claim_denial_letter":
      return generateClaimDenialLetter(options);
    case "beneficiary_change_confirmation":
      return generateBeneficiaryChangeConfirmation(options);
    case "contact_update_confirmation":
      return generateContactUpdateConfirmation(options);
    case "payment_method_update_confirmation":
      return generatePaymentMethodUpdateConfirmation(options);
    default:
      throw new Error(`Unknown template: ${options.templateKey}`);
  }
}

// ---------------------------------------------------------------------------
// Doc 1: Welcome Letter
// ---------------------------------------------------------------------------

async function generateWelcomeLetter(opts: GenerateDocumentOptions): Promise<Buffer> {
  const { client, agent } = opts;
  const doc = createDoc("Welcome to Heritage Life Solutions");

  return wrapInBuffer(doc, () => {
    buildHeader(doc, "Welcome to Heritage Life Solutions");
    doc.moveDown(0.5);

    drawParagraph(doc, `Dear ${client.firstName},`);
    doc.moveDown(0.3);

    drawParagraph(
      doc,
      `Congratulations on taking an important step to secure your future and protect the people you love. On behalf of everyone at Heritage Life Solutions, we are delighted to welcome you as a valued client. Your dedicated agent, ${agent.name}, will be your personal point of contact for all insurance matters.`
    );

    drawSectionHeading(doc, "What to Expect");

    drawNumberedItem(doc, 1, "Your policy documents are now available in your Client Portal.");
    drawNumberedItem(
      doc,
      2,
      `Your dedicated agent, ${agent.name}, is available via phone, email, or portal chat to answer any questions.`
    );
    drawNumberedItem(
      doc,
      3,
      "Annual policy reviews to ensure your coverage keeps pace with your life."
    );
    drawNumberedItem(
      doc,
      4,
      "24/7 access to your documents, billing, and claims through your portal."
    );

    doc.moveDown(0.5);
    drawParagraph(
      doc,
      "We are honored to have you as part of the Heritage family. Please do not hesitate to reach out if there is anything we can do for you."
    );

    buildAgentSignature(doc, agent);
    buildFooter(doc);
  });
}

// ---------------------------------------------------------------------------
// Doc 2: Policy Summary
// ---------------------------------------------------------------------------

async function generatePolicySummary(opts: GenerateDocumentOptions): Promise<Buffer> {
  const { client, agent, policy } = opts;
  if (!policy) throw new Error("Policy information is required for policy_summary.");

  const doc = createDoc("Policy Summary");

  return wrapInBuffer(doc, async () => {
    buildHeader(doc, "Policy Summary");

    // Carrier logo top-right
    await embedCarrierLogo(doc, policy.carrierId, MARGIN_LEFT + 320, 115, 160);

    doc.y = 140;

    drawParagraph(doc, `Prepared for ${client.firstName} ${client.lastName}`);
    doc.moveDown(0.3);

    const premium =
      typeof policy.monthlyPremium === "number"
        ? formatCurrency(policy.monthlyPremium)
        : policy.monthlyPremium;

    drawTableRow(doc, "Policy Number", policy.policyNumber);
    drawTableRow(doc, "Carrier", policy.carrier);
    drawTableRow(doc, "Coverage Type", policy.type);
    drawTableRow(doc, "Coverage Amount", formatCurrency(policy.coverageAmount));
    drawTableRow(doc, "Monthly Premium", premium);
    drawTableRow(doc, "Effective Date", formatDate(policy.startDate));
    drawTableRow(doc, "Status", policy.status);
    if (policy.nextPaymentDate) {
      drawTableRow(doc, "Next Payment Due", formatDate(policy.nextPaymentDate));
    }

    // Beneficiaries
    if (policy.beneficiaries && policy.beneficiaries.length > 0) {
      drawSectionHeading(doc, "Beneficiaries");
      drawBeneficiaryTable(doc, policy.beneficiaries);
    }

    doc.moveDown(0.8);
    drawParagraph(
      doc,
      `This summary is provided for your convenience. The policy issued by ${policy.carrier} governs all terms, conditions, and benefits.`
    );

    buildAgentSignature(doc, agent);
    buildFooter(doc);
  });
}

// ---------------------------------------------------------------------------
// Doc 3: Claims Guide
// ---------------------------------------------------------------------------

async function generateClaimsGuide(opts: GenerateDocumentOptions): Promise<Buffer> {
  const { client, agent } = opts;
  const doc = createDoc("How to File a Claim");

  return wrapInBuffer(doc, () => {
    buildHeader(doc, "How to File a Claim");
    doc.moveDown(0.5);

    drawParagraph(doc, `Dear ${client.firstName},`);
    doc.moveDown(0.3);

    drawParagraph(
      doc,
      "We understand that filing a claim can feel overwhelming. This guide walks you through everything you need to know."
    );

    // Section 1
    drawSectionHeading(doc, "1. When to File");
    drawBulletItem(doc, "Death of the insured (life insurance death benefit)");
    drawBulletItem(doc, "Diagnosis of a covered critical illness or terminal condition");
    drawBulletItem(doc, "Accidental death or dismemberment (AD&D coverage)");

    // Section 2
    drawSectionHeading(doc, "2. Required Documents");
    drawBulletItem(doc, "Certified death certificate (original or certified copy)");
    drawBulletItem(doc, "Completed claim form from the insurance carrier");
    drawBulletItem(doc, "Policy number and insured's full legal name");
    drawBulletItem(doc, "Government-issued photo ID of the beneficiary/claimant");

    // Section 3
    drawSectionHeading(doc, "3. Filing Process");
    drawNumberedItem(doc, 1, "Contact your agent or Heritage Life Solutions to notify us of the claim.");
    drawNumberedItem(doc, 2, "We will provide you with the carrier-specific claim form and instructions.");
    drawNumberedItem(doc, 3, "Gather all required documents listed above.");
    drawNumberedItem(doc, 4, "Submit the completed claim form and documents to the carrier (we can help).");
    drawNumberedItem(doc, 5, "The carrier will assign a claims examiner and provide a claim number.");

    // Section 4
    drawSectionHeading(doc, "4. Timeline");
    drawParagraph(
      doc,
      "Most life insurance claims are reviewed within 30 to 60 days of receiving all required documentation. Some carriers offer expedited review for straightforward claims. We will follow up with the carrier on your behalf and keep you updated."
    );

    // Section 5
    drawSectionHeading(doc, "5. Need Help?");
    drawParagraph(
      doc,
      `Your agent, ${agent.name}, is here to guide you through every step. Please reach out by phone at ${agent.phone} or email at ${agent.email}. You can also message your agent through your Client Portal.`
    );

    buildAgentSignature(doc, agent);
    buildFooter(doc);
  });
}

// ---------------------------------------------------------------------------
// Doc 4: Beneficiary Designation Confirmation
// ---------------------------------------------------------------------------

async function generateBeneficiaryDesignationConfirmation(
  opts: GenerateDocumentOptions
): Promise<Buffer> {
  const { client, agent, policy } = opts;
  if (!policy) throw new Error("Policy information is required for beneficiary_designation_confirmation.");

  const doc = createDoc("Beneficiary Designation Confirmation");

  return wrapInBuffer(doc, () => {
    buildHeader(doc, "Beneficiary Designation Confirmation");
    doc.moveDown(0.5);

    drawParagraph(doc, `Dear ${client.firstName},`);
    doc.moveDown(0.3);

    drawParagraph(
      doc,
      "This document confirms the beneficiary designation on file for the following policy."
    );

    doc.moveDown(0.3);
    drawTableRow(doc, "Policy Number", policy.policyNumber);
    drawTableRow(doc, "Carrier", policy.carrier);

    if (policy.beneficiaries && policy.beneficiaries.length > 0) {
      drawSectionHeading(doc, "Designated Beneficiaries");
      drawBeneficiaryTable(doc, policy.beneficiaries);
    }

    doc.moveDown(0.8);
    drawParagraph(
      doc,
      "To make changes to your beneficiary designation, please contact your agent. Changes may require carrier approval and a signed beneficiary change form."
    );

    buildAgentSignature(doc, agent);
    buildFooter(doc);
  });
}

// ---------------------------------------------------------------------------
// Doc 5: Portal Access Instructions
// ---------------------------------------------------------------------------

async function generatePortalAccessInstructions(opts: GenerateDocumentOptions): Promise<Buffer> {
  const { client, agent } = opts;
  const doc = createDoc("Your Client Portal — Getting Started");

  return wrapInBuffer(doc, () => {
    buildHeader(doc, "Your Client Portal \u2014 Getting Started");
    doc.moveDown(0.5);

    drawParagraph(doc, `Dear ${client.firstName},`);
    doc.moveDown(0.3);

    drawParagraph(
      doc,
      "Your Heritage Life Solutions Client Portal gives you secure, 24/7 access to your insurance information. Here is everything you need to get started."
    );

    drawSectionHeading(doc, "Login URL");
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(COLORS.headerAccent)
      .text(AGENCY.portalUrl, MARGIN_LEFT, doc.y, { width: CONTENT_WIDTH, link: AGENCY.portalUrl });
    doc.moveDown(0.5);

    drawParagraph(
      doc,
      "Use the email address and temporary password from your welcome email to log in for the first time."
    );

    drawSectionHeading(doc, "Portal Features");
    drawBulletItem(doc, "View Policies \u2014 See all your active coverage, details, and documents");
    drawBulletItem(doc, "Access Documents \u2014 Download policy documents, statements, and letters");
    drawBulletItem(doc, "Submit Claims \u2014 File and track claims directly from your portal");
    drawBulletItem(doc, "Message Agent \u2014 Chat with your dedicated agent in real time");
    drawBulletItem(doc, "View Billing \u2014 Review payment history and upcoming premiums");
    drawBulletItem(doc, "Update Beneficiaries \u2014 Request beneficiary changes");

    drawSectionHeading(doc, "Security");
    drawParagraph(
      doc,
      "For your protection, please change your temporary password after your first login. Choose a strong, unique password that you do not use on other websites. If you have any trouble accessing your portal, contact your agent."
    );

    buildAgentSignature(doc, agent);
    buildFooter(doc);
  });
}

// ---------------------------------------------------------------------------
// Doc 6: Annual Policy Statement
// ---------------------------------------------------------------------------

async function generateAnnualPolicyStatement(opts: GenerateDocumentOptions): Promise<Buffer> {
  const { client, agent, policy, additionalData } = opts;
  if (!policy) throw new Error("Policy information is required for annual_policy_statement.");

  const year = additionalData?.year || new Date().getFullYear();
  const doc = createDoc(`Annual Policy Statement \u2014 ${year}`);

  return wrapInBuffer(doc, async () => {
    buildHeader(doc, `Annual Policy Statement \u2014 ${year}`);

    // Carrier logo
    await embedCarrierLogo(doc, policy.carrierId, MARGIN_LEFT + 320, 115, 160);

    doc.y = 140;

    drawParagraph(doc, `Prepared for ${client.firstName} ${client.lastName}`);
    doc.moveDown(0.3);

    // Policy details
    drawSectionHeading(doc, "Policy Details");
    drawTableRow(doc, "Policy Number", policy.policyNumber);
    drawTableRow(doc, "Carrier", policy.carrier);
    drawTableRow(doc, "Coverage Type", policy.type);
    drawTableRow(doc, "Coverage Amount", formatCurrency(policy.coverageAmount));
    drawTableRow(doc, "Status", policy.status);
    drawTableRow(doc, "Effective Date", formatDate(policy.startDate));

    // Financial summary
    drawSectionHeading(doc, "Financial Summary");

    const premium =
      typeof policy.monthlyPremium === "number"
        ? formatCurrency(policy.monthlyPremium)
        : policy.monthlyPremium;

    const monthlyNum =
      typeof policy.monthlyPremium === "number"
        ? policy.monthlyPremium
        : parseFloat(String(policy.monthlyPremium).replace(/[^0-9.]/g, "")) || 0;
    const premiumPaidYTD = additionalData?.premiumPaidYTD ?? monthlyNum * 12;

    drawTableRow(doc, "Premium Paid YTD", formatCurrency(premiumPaidYTD));
    drawTableRow(doc, "Monthly Premium", premium);
    if (policy.nextPaymentDate) {
      drawTableRow(doc, "Next Due", formatDate(policy.nextPaymentDate));
    }

    // Cash value (conditional)
    if (policy.cashValue !== undefined && policy.cashValue !== null) {
      drawSectionHeading(doc, "Cash Value");
      drawTableRow(doc, "Current Cash Value", formatCurrency(policy.cashValue));
      drawParagraph(
        doc,
        "Cash value accumulates over time in whole life and indexed universal life policies. Contact your agent for details on access options."
      );
    }

    // Beneficiaries
    if (policy.beneficiaries && policy.beneficiaries.length > 0) {
      drawSectionHeading(doc, "Beneficiaries");
      drawBeneficiaryTable(doc, policy.beneficiaries);
    }

    doc.moveDown(0.8);
    drawParagraph(
      doc,
      "We recommend scheduling an annual review with your agent to ensure your coverage continues to meet your needs."
    );

    buildAgentSignature(doc, agent);
    buildFooter(doc);
  });
}

// ---------------------------------------------------------------------------
// Doc 7: Premium Payment Reminder
// ---------------------------------------------------------------------------

async function generatePremiumPaymentReminder(opts: GenerateDocumentOptions): Promise<Buffer> {
  const { client, agent, policy, additionalData } = opts;
  if (!policy) throw new Error("Policy information is required for premium_payment_reminder.");

  const doc = createDoc("Premium Payment Reminder");

  return wrapInBuffer(doc, async () => {
    buildHeader(doc, "Premium Payment Reminder");

    // Carrier logo
    await embedCarrierLogo(doc, policy.carrierId, MARGIN_LEFT + 320, 115, 160);

    doc.y = 140;

    drawParagraph(doc, `Dear ${client.firstName},`);
    doc.moveDown(0.3);

    drawParagraph(
      doc,
      "This is a friendly reminder that a premium payment is due on your life insurance policy. Keeping your policy current ensures your coverage remains active and your loved ones stay protected."
    );

    doc.moveDown(0.3);

    const premium =
      typeof policy.monthlyPremium === "number"
        ? formatCurrency(policy.monthlyPremium)
        : policy.monthlyPremium;

    drawSectionHeading(doc, "Payment Details");
    drawTableRow(doc, "Policy Number", policy.policyNumber);
    drawTableRow(doc, "Amount Due", premium);
    if (policy.nextPaymentDate) {
      drawTableRow(doc, "Due Date", formatDate(policy.nextPaymentDate));
    }
    if (additionalData?.paymentMethod) {
      drawTableRow(doc, "Payment Method", additionalData.paymentMethod);
    }

    drawSectionHeading(doc, "How to Pay");
    drawBulletItem(doc, "Automatic bank draft \u2014 If you are enrolled, no action is needed.");
    drawBulletItem(doc, `Client Portal \u2014 Log in at ${AGENCY.portalUrl} to make a payment.`);
    drawBulletItem(doc, "Contact your agent \u2014 We can assist with payment over the phone.");

    doc.moveDown(0.3);
    drawParagraph(
      doc,
      "Please note that if your premium remains unpaid past the grace period, your policy may lapse and your coverage could be terminated. If you are experiencing financial difficulty, please contact your agent \u2014 we may be able to explore options to keep your coverage in force."
    );

    buildAgentSignature(doc, agent);
    buildFooter(doc);
  });
}

// ---------------------------------------------------------------------------
// Doc 8: Policy Anniversary Letter
// ---------------------------------------------------------------------------

async function generatePolicyAnniversaryLetter(opts: GenerateDocumentOptions): Promise<Buffer> {
  const { client, agent, policy, personalNote } = opts;
  if (!policy) throw new Error("Policy information is required for policy_anniversary_letter.");

  const doc = createDoc("Happy Policy Anniversary!");

  return wrapInBuffer(doc, () => {
    buildHeader(doc, "Happy Policy Anniversary!");
    doc.moveDown(0.5);

    drawParagraph(doc, `Dear ${client.firstName},`);
    doc.moveDown(0.3);

    drawParagraph(
      doc,
      `We are pleased to acknowledge the anniversary of your ${policy.type} policy with ${policy.carrier}. Thank you for your continued trust in Heritage Life Solutions to help protect what matters most to you.`
    );

    drawSectionHeading(doc, "Coverage Recap");
    drawTableRow(doc, "Policy Number", policy.policyNumber);
    drawTableRow(doc, "Coverage Type", policy.type);
    drawTableRow(doc, "Coverage Amount", formatCurrency(policy.coverageAmount));
    drawTableRow(doc, "Status", policy.status);

    drawPersonalNote(doc, personalNote);

    doc.moveDown(0.5);
    drawSectionHeading(doc, "Schedule a Review");
    drawParagraph(
      doc,
      "A policy anniversary is a great time to review your coverage. Life changes \u2014 marriage, children, a new home, retirement \u2014 may mean your insurance needs have changed. Contact your agent to schedule a complimentary policy review."
    );

    buildAgentSignature(doc, agent);
    buildFooter(doc);
  });
}

// ---------------------------------------------------------------------------
// Doc 9: Annual Review Invitation
// ---------------------------------------------------------------------------

async function generateAnnualReviewInvitation(opts: GenerateDocumentOptions): Promise<Buffer> {
  const { client, agent, personalNote } = opts;
  const doc = createDoc("Annual Review Invitation");

  return wrapInBuffer(doc, () => {
    buildHeader(doc, "Annual Review Invitation");
    doc.moveDown(0.5);

    drawParagraph(doc, `Dear ${client.firstName},`);
    doc.moveDown(0.3);

    drawParagraph(
      doc,
      "An annual policy review is one of the most important things you can do to protect your family. Life changes quickly, and your coverage should keep pace. We would like to schedule a brief review to make sure everything is up to date."
    );

    drawSectionHeading(doc, "What We Review");
    drawBulletItem(doc, "Coverage adequacy \u2014 Is your death benefit sufficient for your family's needs?");
    drawBulletItem(doc, "Beneficiary designations \u2014 Are the right people listed?");
    drawBulletItem(doc, "Premium optimization \u2014 Are there more cost-effective options available?");
    drawBulletItem(doc, "Life changes \u2014 Marriage, divorce, children, homeownership, retirement");

    drawPersonalNote(doc, personalNote);

    doc.moveDown(0.5);
    drawParagraph(
      doc,
      `To schedule your review, contact your agent, ${agent.name}, at ${agent.phone} or ${agent.email}. You can also request a review through your Client Portal.`
    );

    buildAgentSignature(doc, agent);
    buildFooter(doc);
  });
}

// ---------------------------------------------------------------------------
// Doc 10: Claims Packet
// ---------------------------------------------------------------------------

async function generateClaimsPacket(opts: GenerateDocumentOptions): Promise<Buffer> {
  const { client, agent, policy, claim } = opts;
  if (!claim) throw new Error("Claim information is required for claims_packet.");

  const doc = createDoc("Claims Filing Packet");

  return wrapInBuffer(doc, () => {
    buildHeader(doc, "Claims Filing Packet");
    doc.moveDown(0.5);

    drawParagraph(doc, `Prepared for ${client.firstName} ${client.lastName}`);
    doc.moveDown(0.3);

    drawTableRow(doc, "Claim Number", claim.claimNumber);
    drawTableRow(doc, "Date Filed", formatDate(claim.filedDate));
    if (policy) {
      drawTableRow(doc, "Policy Number", policy.policyNumber);
    }

    drawSectionHeading(doc, "Required Documents");
    drawBulletItem(doc, "Completed claim form (carrier-specific, attached or provided separately)");
    drawBulletItem(doc, "Certified death certificate (original or certified copy)");
    drawBulletItem(doc, "Government-issued photo ID of the claimant");
    drawBulletItem(doc, "Proof of relationship to the insured (if applicable)");
    drawBulletItem(doc, "Policy contract or policy number confirmation");
    drawBulletItem(doc, "HIPAA authorization form (if medical records are required)");

    drawSectionHeading(doc, "Next Steps");
    drawNumberedItem(doc, 1, "Review and complete the enclosed claim form.");
    drawNumberedItem(doc, 2, "Gather all required documents listed above.");
    drawNumberedItem(doc, 3, "Submit completed forms and documents to the carrier or through your agent.");
    drawNumberedItem(doc, 4, "You will receive a claim acknowledgment with your assigned examiner within 5 to 10 business days.");
    drawNumberedItem(doc, 5, "Your agent will follow up with the carrier and keep you informed of progress.");

    drawSectionHeading(doc, "Timeline");
    drawParagraph(
      doc,
      "Most claims are reviewed within 30 to 60 days after all documentation has been received. Complex claims may require additional time. Your agent will keep you updated throughout the process."
    );

    drawSectionHeading(doc, "Agent Contact");
    drawParagraph(
      doc,
      `If you have questions or need help at any point, reach out to ${agent.name} at ${agent.phone} or ${agent.email}.`
    );

    buildAgentSignature(doc, agent);
    buildFooter(doc);
  });
}

// ---------------------------------------------------------------------------
// Doc 11: Claim Acknowledgment
// ---------------------------------------------------------------------------

async function generateClaimAcknowledgment(opts: GenerateDocumentOptions): Promise<Buffer> {
  const { client, agent, claim } = opts;
  if (!claim) throw new Error("Claim information is required for claim_acknowledgment.");

  const doc = createDoc("Claim Acknowledgment");

  return wrapInBuffer(doc, () => {
    buildHeader(doc, "Claim Acknowledgment");
    doc.moveDown(0.5);

    drawParagraph(doc, `Dear ${client.firstName},`);
    doc.moveDown(0.3);

    drawParagraph(
      doc,
      "We have received your claim and wanted to confirm the details. Heritage Life Solutions is here to support you through this process."
    );

    doc.moveDown(0.3);
    drawTableRow(doc, "Claim Number", claim.claimNumber);
    drawTableRow(doc, "Date Received", formatDate(claim.filedDate));
    drawTableRow(doc, "Claim Type", claim.type);
    drawTableRow(doc, "Status", claim.status);

    drawSectionHeading(doc, "Summary");
    drawParagraph(
      doc,
      "Your claim has been logged and forwarded to the carrier for review. A claims examiner will be assigned to your case. You do not need to take any further action at this time unless additional documents are requested."
    );

    drawSectionHeading(doc, "What Happens Next");
    drawNumberedItem(doc, 1, "The carrier assigns a claims examiner to review your case.");
    drawNumberedItem(doc, 2, "If additional documentation is needed, you will be contacted directly.");
    drawNumberedItem(doc, 3, "Once the review is complete, the carrier will issue a decision.");
    drawNumberedItem(doc, 4, "Your agent will keep you informed throughout the process.");

    buildAgentSignature(doc, agent);
    buildFooter(doc);
  });
}

// ---------------------------------------------------------------------------
// Doc 12: Claim Status Update
// ---------------------------------------------------------------------------

async function generateClaimStatusUpdate(opts: GenerateDocumentOptions): Promise<Buffer> {
  const { client, agent, claim, personalNote } = opts;
  if (!claim) throw new Error("Claim information is required for claim_status_update.");

  const doc = createDoc("Claim Status Update");

  return wrapInBuffer(doc, () => {
    buildHeader(doc, "Claim Status Update");
    doc.moveDown(0.5);

    drawParagraph(doc, `Dear ${client.firstName},`);
    doc.moveDown(0.3);

    drawParagraph(
      doc,
      "We are writing to provide you with an update on the status of your claim."
    );

    doc.moveDown(0.3);
    drawTableRow(doc, "Claim Number", claim.claimNumber);
    drawTableRow(doc, "Current Status", claim.status);

    doc.moveDown(0.5);
    drawSectionHeading(doc, "Status Details");

    const statusDescriptions: Record<string, string> = {
      under_review:
        "Your claim is currently under review by the carrier's claims examiner. All submitted documentation is being evaluated. No further action is required from you at this time.",
      pending_documents:
        "The carrier has requested additional documentation to continue processing your claim. Please provide the requested items as soon as possible to avoid delays.",
      approved:
        "Your claim has been approved. The carrier will process the payout according to the payment method on file. Please see the approval details for more information.",
      denied:
        "Unfortunately, the carrier has denied your claim. Please see the denial notice for the reason and information about the appeals process.",
      in_progress:
        "Your claim is actively being processed. The carrier is reviewing all submitted documentation and may reach out if additional information is needed.",
    };

    const description =
      statusDescriptions[claim.status] ||
      `Your claim is currently in "${claim.status}" status. Your agent will provide additional details as they become available.`;

    drawParagraph(doc, description);

    drawPersonalNote(doc, personalNote);

    buildAgentSignature(doc, agent);
    buildFooter(doc);
  });
}

// ---------------------------------------------------------------------------
// Doc 13: Claim Approval Letter
// ---------------------------------------------------------------------------

async function generateClaimApprovalLetter(opts: GenerateDocumentOptions): Promise<Buffer> {
  const { client, agent, claim, personalNote, additionalData } = opts;
  if (!claim) throw new Error("Claim information is required for claim_approval_letter.");

  const doc = createDoc("Claim Approval Notice");

  return wrapInBuffer(doc, () => {
    buildHeader(doc, "Claim Approval Notice");
    doc.moveDown(0.5);

    drawParagraph(doc, `Dear ${client.firstName},`);
    doc.moveDown(0.3);

    drawParagraph(
      doc,
      "We are pleased to inform you that your claim has been approved. Below are the details of the approved claim."
    );

    doc.moveDown(0.3);
    drawTableRow(doc, "Claim Number", claim.claimNumber);
    if (claim.amount !== undefined) {
      drawTableRow(doc, "Approved Amount", formatCurrency(claim.amount));
    }
    if (additionalData?.payoutMethod) {
      drawTableRow(doc, "Payout Method", additionalData.payoutMethod);
    }
    if (additionalData?.payoutTimeline) {
      drawTableRow(doc, "Expected Timeline", additionalData.payoutTimeline);
    }

    drawPersonalNote(doc, personalNote);

    doc.moveDown(0.5);
    drawParagraph(
      doc,
      "If you have any questions about the payout process or need to update your payment information, please contact your agent."
    );

    buildAgentSignature(doc, agent);
    buildFooter(doc);
  });
}

// ---------------------------------------------------------------------------
// Doc 14: Claim Denial Letter
// ---------------------------------------------------------------------------

async function generateClaimDenialLetter(opts: GenerateDocumentOptions): Promise<Buffer> {
  const { client, agent, claim, personalNote } = opts;
  if (!claim) throw new Error("Claim information is required for claim_denial_letter.");

  const doc = createDoc("Claim Decision Notice");

  return wrapInBuffer(doc, () => {
    buildHeader(doc, "Claim Decision Notice");
    doc.moveDown(0.5);

    drawParagraph(doc, `Dear ${client.firstName},`);
    doc.moveDown(0.3);

    drawParagraph(
      doc,
      "We are writing to inform you of the decision regarding your claim. After careful review by the carrier, the claim has been denied."
    );

    doc.moveDown(0.3);
    drawTableRow(doc, "Claim Number", claim.claimNumber);
    drawTableRow(doc, "Decision", "Denied");

    if (claim.denialReason) {
      drawSectionHeading(doc, "Reason for Denial");
      drawParagraph(doc, claim.denialReason);
    }

    drawSectionHeading(doc, "Appeal Process");
    drawParagraph(
      doc,
      "You have the right to appeal this decision. The following steps outline how to proceed:"
    );
    drawNumberedItem(
      doc,
      1,
      "Request a detailed explanation of the denial in writing from the carrier."
    );
    drawNumberedItem(
      doc,
      2,
      "Gather any additional documentation or evidence that supports your claim."
    );
    drawNumberedItem(
      doc,
      3,
      "Submit a written appeal to the carrier within the timeframe specified in your policy (typically 60 days). Your agent can help you draft and submit the appeal."
    );

    drawPersonalNote(doc, personalNote);

    doc.moveDown(0.5);
    drawParagraph(
      doc,
      "Your agent is here to help. We will work with you to understand the denial and explore your options, including filing an appeal."
    );

    buildAgentSignature(doc, agent);
    buildFooter(doc);
  });
}

// ---------------------------------------------------------------------------
// Doc 15: Beneficiary Change Confirmation
// ---------------------------------------------------------------------------

async function generateBeneficiaryChangeConfirmation(
  opts: GenerateDocumentOptions
): Promise<Buffer> {
  const { client, agent, policy, additionalData } = opts;
  if (!policy) throw new Error("Policy information is required for beneficiary_change_confirmation.");

  const doc = createDoc("Beneficiary Change Confirmation");

  return wrapInBuffer(doc, () => {
    buildHeader(doc, "Beneficiary Change Confirmation");
    doc.moveDown(0.5);

    drawParagraph(doc, `Dear ${client.firstName},`);
    doc.moveDown(0.3);

    drawParagraph(
      doc,
      "This document confirms that a beneficiary change has been processed on your policy."
    );

    doc.moveDown(0.3);
    drawTableRow(doc, "Policy Number", policy.policyNumber);
    drawTableRow(
      doc,
      "Effective Date",
      additionalData?.effectiveDate
        ? formatDate(additionalData.effectiveDate)
        : formatDate(new Date().toISOString())
    );

    // Previous beneficiaries
    if (additionalData?.previousBeneficiaries && additionalData.previousBeneficiaries.length > 0) {
      drawSectionHeading(doc, "Previous Beneficiaries");
      drawBeneficiaryTable(doc, additionalData.previousBeneficiaries);
    }

    // New beneficiaries
    if (policy.beneficiaries && policy.beneficiaries.length > 0) {
      drawSectionHeading(doc, "New Beneficiaries");
      drawBeneficiaryTable(doc, policy.beneficiaries);
    }

    doc.moveDown(0.8);
    drawParagraph(
      doc,
      "If the information above is incorrect or you did not authorize this change, please contact your agent immediately."
    );

    buildAgentSignature(doc, agent);
    buildFooter(doc);
  });
}

// ---------------------------------------------------------------------------
// Doc 16: Contact Update Confirmation
// ---------------------------------------------------------------------------

async function generateContactUpdateConfirmation(opts: GenerateDocumentOptions): Promise<Buffer> {
  const { client, agent, additionalData } = opts;
  const doc = createDoc("Contact Information Update Confirmation");

  return wrapInBuffer(doc, () => {
    buildHeader(doc, "Contact Information Update Confirmation");
    doc.moveDown(0.5);

    drawParagraph(doc, `Dear ${client.firstName},`);
    doc.moveDown(0.3);

    const updateDate = additionalData?.updatedDate
      ? formatDate(additionalData.updatedDate)
      : formatDate(new Date().toISOString());

    drawParagraph(
      doc,
      `Your contact information has been updated as of ${updateDate}. The following fields were changed:`
    );

    doc.moveDown(0.3);

    // Changed fields
    if (additionalData?.changedFields && typeof additionalData.changedFields === "object") {
      for (const [field, value] of Object.entries(additionalData.changedFields)) {
        drawTableRow(doc, field, String(value));
      }
    } else {
      // Fallback: show current contact info
      drawTableRow(doc, "Name", `${client.firstName} ${client.lastName}`);
      drawTableRow(doc, "Email", client.email);
      if (client.phone) {
        drawTableRow(doc, "Phone", client.phone);
      }
    }

    doc.moveDown(0.8);

    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .fillColor(COLORS.sectionHeading)
      .text(
        "If you did not request this change, please contact your agent immediately.",
        MARGIN_LEFT,
        doc.y,
        { width: CONTENT_WIDTH }
      );

    doc.moveDown(0.5);
    drawParagraph(
      doc,
      `You can reach ${agent.name} at ${agent.phone} or ${agent.email}.`
    );

    buildAgentSignature(doc, agent);
    buildFooter(doc);
  });
}

// ---------------------------------------------------------------------------
// Doc 17: Payment Method Update Confirmation
// ---------------------------------------------------------------------------

async function generatePaymentMethodUpdateConfirmation(
  opts: GenerateDocumentOptions
): Promise<Buffer> {
  const { client, agent, additionalData } = opts;
  const doc = createDoc("Payment Method Update Confirmation");

  return wrapInBuffer(doc, () => {
    buildHeader(doc, "Payment Method Update Confirmation");
    doc.moveDown(0.5);

    drawParagraph(doc, `Dear ${client.firstName},`);
    doc.moveDown(0.3);

    const updateDate = additionalData?.updatedDate
      ? formatDate(additionalData.updatedDate)
      : formatDate(new Date().toISOString());

    drawParagraph(
      doc,
      `Your payment method has been updated as of ${updateDate}. Below are the details of the change.`
    );

    doc.moveDown(0.3);

    drawSectionHeading(doc, "New Payment Method");

    if (additionalData?.paymentType) {
      drawTableRow(doc, "Payment Type", additionalData.paymentType);
    }
    if (additionalData?.lastFour) {
      drawTableRow(doc, "Account Ending In", `****${additionalData.lastFour}`);
    }
    if (additionalData?.bankName) {
      drawTableRow(doc, "Bank/Institution", additionalData.bankName);
    }
    if (additionalData?.billingFrequency) {
      drawTableRow(doc, "Billing Frequency", additionalData.billingFrequency);
    }

    doc.moveDown(0.8);

    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .fillColor(COLORS.sectionHeading)
      .text(
        "If you did not authorize this change, please contact your agent immediately.",
        MARGIN_LEFT,
        doc.y,
        { width: CONTENT_WIDTH }
      );

    doc.moveDown(0.5);
    drawParagraph(
      doc,
      `You can reach ${agent.name} at ${agent.phone} or ${agent.email}. Unauthorized payment changes should be reported as soon as possible.`
    );

    buildAgentSignature(doc, agent);
    buildFooter(doc);
  });
}
