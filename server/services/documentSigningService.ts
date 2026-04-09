/**
 * Document Signing Service
 * Generates legally-enforceable signed PDFs using PDFKit.
 * Embeds the agent's drawn signature, full legal text, and a
 * Certificate of Electronic Signing with audit trail data.
 *
 * Compliant with ESIGN Act (15 U.S.C. 7001-7031) and
 * Illinois Uniform Electronic Transactions Act (815 ILCS 333).
 */

import PDFDocument from "pdfkit";
import { DOCUMENT_CONTENT } from "../../shared/documentContent";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SignerInfo {
  name: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  signedAt: Date;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLORS = {
  headerBg: "#2D2060",   // Heritage navy (from logo SVG)
  headerText: "#ffffff",
  goldAccent: "#C8A840",
  goldBright: "#E8C87A",
  sectionHeading: "#140E04",
  bodyText: "#2a2a2a",
  lightGray: "#9ca3af",
  mediumGray: "#6b7280",
  border: "#d1d5db",
  certBg: "#f9fafb",
};

const DOCUMENT_NAMES: Record<string, string> = {
  nda: "Non-Disclosure, Non-Use, Non-Solicitation, and Lead Protection Agreement",
  debt_rollup: "Debt Roll-Up Protection and Authorization Agreement",
  compliance: "Compliance and Ethical Conduct Agreement",
};

// ---------------------------------------------------------------------------
// PDF Generation
// ---------------------------------------------------------------------------

/**
 * Generate a signed PDF document with Heritage branding,
 * full legal text, embedded signature image, and signing certificate.
 */
export async function generateSignedPdf(
  documentType: string,
  signatureImageBase64: string,
  signerInfo: SignerInfo
): Promise<Buffer> {
  const docContent = DOCUMENT_CONTENT[documentType];
  if (!docContent) {
    throw new Error(`Unknown document type: ${documentType}`);
  }

  const docName = DOCUMENT_NAMES[documentType] || documentType;

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];

    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: 60, bottom: 60, left: 60, right: 60 },
      info: {
        Title: `${docContent.title} — Heritage Life Solutions`,
        Author: "Heritage Life Solutions",
        Subject: `Signed ${docName}`,
        Creator: "Heritage Life Solutions Onboarding System",
      },
    });

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = 612; // Letter width in points
    const contentWidth = pageWidth - 120; // margins

    // =====================================================================
    // PAGE 1+: Document Header + Legal Text
    // =====================================================================

    // Heritage branding header bar (taller, centered, spaced lettering)
    doc
      .rect(0, 0, pageWidth, 64)
      .fill(COLORS.headerBg);

    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .fillColor(COLORS.headerText)
      .text(
        "H E R I T A G E   L I F E   S O L U T I O N S",
        0,
        25,
        { width: pageWidth, align: "center" }
      );

    // Gold accent line
    doc
      .strokeColor(COLORS.goldBright)
      .lineWidth(2)
      .moveTo(0, 64)
      .lineTo(pageWidth, 64)
      .stroke();

    // Move below header
    doc.y = 80;

    // Document title
    const titleFontSize = docContent.title.length > 50 ? 12 : 16;
    doc
      .font("Helvetica-Bold")
      .fontSize(titleFontSize)
      .fillColor(COLORS.sectionHeading)
      .text(docContent.title, 60, doc.y, {
        width: contentWidth,
        align: "center",
      });

    doc.moveDown(0.3);

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(COLORS.mediumGray)
      .text("Gold Coast Financial Partners, LLC | Illinois License #22128144", 60, doc.y, {
        width: contentWidth,
        align: "center",
      });

    doc.y += 10;

    // Date line
    doc
      .fillColor(COLORS.mediumGray)
      .font("Helvetica")
      .fontSize(9)
      .text(
        `Date of Execution: ${signerInfo.signedAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        60,
        doc.y,
        { width: contentWidth, align: "right" }
      );

    doc.moveDown(1.5);

    // Horizontal rule
    drawHorizontalRule(doc, contentWidth);
    doc.moveDown(1);

    // Legal text sections
    for (const section of docContent.sections) {
      // Check if we need a new page (leave room for at least 80 points)
      if (doc.y > 660) {
        doc.addPage();
      }

      // Section heading
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(COLORS.sectionHeading)
        .text(section.heading, 60, doc.y, { width: contentWidth });

      doc.moveDown(0.3);

      // Section body
      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor(COLORS.bodyText)
        .text(section.body, 60, doc.y, {
          width: contentWidth,
          align: "justify",
          lineGap: 3,
        });

      doc.moveDown(1);
    }

    // =====================================================================
    // SIGNATURE BLOCK
    // =====================================================================

    // Ensure enough space for signature block
    if (doc.y > 520) {
      doc.addPage();
    }

    doc.moveDown(1);
    drawHorizontalRule(doc, contentWidth);
    doc.moveDown(1);

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(COLORS.sectionHeading)
      .text("ELECTRONIC SIGNATURE", 60, doc.y, { width: contentWidth });

    doc.moveDown(0.5);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(COLORS.mediumGray)
      .text(
        "By signing below, I acknowledge that I have read, understood, and agree to all terms and conditions of this document.",
        60,
        doc.y,
        { width: contentWidth }
      );

    doc.moveDown(1);

    // Embed signature image
    try {
      const base64Data = signatureImageBase64.replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      const signatureBuffer = Buffer.from(base64Data, "base64");

      const sigY = doc.y;
      doc.image(signatureBuffer, 60, sigY, { width: 200, height: 60 });
      doc.y = sigY + 65;
    } catch (err) {
      // If signature image fails, add placeholder text
      doc
        .font("Helvetica-Oblique")
        .fontSize(9)
        .fillColor(COLORS.lightGray)
        .text("[Signature image could not be rendered]", 60, doc.y, {
          width: contentWidth,
        });
      doc.moveDown(1);
    }

    // Signature line
    const lineY = doc.y;
    doc
      .strokeColor(COLORS.border)
      .lineWidth(1)
      .moveTo(60, lineY)
      .lineTo(300, lineY)
      .stroke();

    doc.moveDown(0.3);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(COLORS.sectionHeading)
      .text(signerInfo.name, 60, doc.y, { width: contentWidth });

    doc.moveDown(0.3);

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(COLORS.mediumGray)
      .text(
        `Signed electronically on ${signerInfo.signedAt.toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        })}`,
        60,
        doc.y,
        { width: contentWidth }
      );

    // =====================================================================
    // CERTIFICATE OF ELECTRONIC SIGNING (new page)
    // =====================================================================

    doc.addPage();

    // Certificate header
    doc
      .rect(0, 0, pageWidth, 70)
      .fill(COLORS.headerBg);

    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor(COLORS.headerText)
      .text("CERTIFICATE OF ELECTRONIC SIGNATURE", 60, 25, {
        width: contentWidth,
        align: "center",
      });

    doc
      .font("Helvetica")
      .fontSize(8)
      .text("Heritage Life Solutions — Gold Coast Financial Partners, LLC", 60, 47, {
        width: contentWidth,
        align: "center",
      });

    doc.y = 90;

    // Certificate body
    const certFields = [
      { label: "Document", value: docName },
      { label: "Document Title", value: docContent.title },
      { label: "Signer Full Name", value: signerInfo.name },
      { label: "Signer Email", value: signerInfo.email },
      { label: "IP Address", value: signerInfo.ipAddress },
      { label: "User Agent", value: signerInfo.userAgent },
      {
        label: "Date & Time (UTC)",
        value: signerInfo.signedAt.toISOString(),
      },
      {
        label: "Date & Time (Local)",
        value: signerInfo.signedAt.toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        }),
      },
      {
        label: "Document Integrity",
        value:
          "SHA-256 hash stored separately in database for tamper verification",
      },
    ];

    doc.moveDown(1);

    for (const field of certFields) {
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(COLORS.sectionHeading)
        .text(`${field.label}:`, 60, doc.y, { continued: true });

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(COLORS.bodyText)
        .text(`  ${field.value}`, { width: contentWidth - 20 });

      doc.moveDown(0.5);
    }

    doc.moveDown(1.5);
    drawHorizontalRule(doc, contentWidth);
    doc.moveDown(1);

    // Legal compliance statement
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(COLORS.sectionHeading)
      .text("LEGAL COMPLIANCE STATEMENT", 60, doc.y, { width: contentWidth });

    doc.moveDown(0.5);

    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(COLORS.bodyText)
      .text(
        "This document was electronically signed in accordance with the Electronic Signatures in Global and National Commerce Act (ESIGN Act, 15 U.S.C. §§ 7001-7031) and the Illinois Uniform Electronic Transactions Act (815 ILCS 333). " +
          "The signer's intent to sign was demonstrated by drawing a handwritten signature on a digital canvas. " +
          "Consent to electronic signing was confirmed via explicit checkboxes affirming: (1) the signer has read the entire document, (2) the signer agrees to all terms and conditions, and (3) the signer certifies the information provided is true and accurate. " +
          "The signed document is retained in encrypted cloud storage (AES-256) with a SHA-256 cryptographic hash stored in the database for tamper detection and integrity verification.",
        60,
        doc.y,
        { width: contentWidth, align: "justify", lineGap: 3 }
      );

    doc.moveDown(1.5);

    // Footer
    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor(COLORS.lightGray)
      .text(
        "This certificate is automatically generated by Heritage Life Solutions and constitutes a legal record of the electronic signing event described above.",
        60,
        doc.y,
        { width: contentWidth, align: "center" }
      );

    // Finalize
    doc.end();
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function drawHorizontalRule(doc: PDFKit.PDFDocument, width: number): void {
  const y = doc.y;
  doc
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .moveTo(60, y)
    .lineTo(60 + width, y)
    .stroke();
  doc.y = y + 2;
}
