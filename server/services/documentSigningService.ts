/**
 * Document Signing Service — Gold Coast Financial
 * Generates signed PDFs using PDFKit with embedded signatures.
 * ESIGN Act compliant (15 U.S.C. 7001-7031).
 */

import PDFDocument from "pdfkit";
import { DOCUMENT_CONTENT } from "../../shared/documentContent";

const COLORS = {
  headerBg: "#4A1420",
  headerText: "#ffffff",
  goldAccent: "#C4975A",
  goldBright: "#D4A96A",
  sectionHeading: "#140E04",
  bodyText: "#2a2a2a",
  lightGray: "#9ca3af",
  border: "#d1d5db",
  certBg: "#f9fafb",
};

export interface SignerInfo {
  name: string; email: string; ipAddress: string; userAgent: string; signedAt: Date;
}

export function generateSignedPdf(documentType: string, signerInfo: SignerInfo, signatureDataUrl?: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "letter", margins: { top: 72, bottom: 72, left: 72, right: 72 } });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const content = DOCUMENT_CONTENT[documentType];
    if (!content) { reject(new Error(`Unknown document type: ${documentType}`)); return; }

    // Header
    doc.rect(0, 0, 612, 80).fill(COLORS.headerBg);
    doc.fontSize(18).fill(COLORS.headerText).font("Helvetica-Bold").text("GOLD COAST FINANCIAL", 72, 25);
    doc.fontSize(9).fill(COLORS.goldAccent).text("Heritage Life Solutions · Gold Coast Financial Partners, LLC", 72, 50);

    // Title
    doc.moveDown(2);
    doc.fontSize(14).fill(COLORS.sectionHeading).font("Helvetica-Bold").text(content.title, { align: "center" });
    doc.moveDown();

    // Sections
    for (const section of content.sections) {
      doc.fontSize(11).fill(COLORS.sectionHeading).font("Helvetica-Bold").text(section.heading);
      doc.fontSize(10).fill(COLORS.bodyText).font("Helvetica").text(section.body, { lineGap: 2 });
      doc.moveDown(0.5);
    }

    // Signature area
    doc.moveDown(2);
    doc.fontSize(11).fill(COLORS.sectionHeading).font("Helvetica-Bold").text("ELECTRONIC SIGNATURE");
    doc.moveDown(0.5);
    if (signatureDataUrl) {
      try {
        const sigBuf = Buffer.from(signatureDataUrl.replace(/^data:image\/\w+;base64,/, ""), "base64");
        doc.image(sigBuf, { width: 200, height: 60 });
      } catch { doc.text("[Signature could not be rendered]"); }
    } else {
      doc.rect(doc.x, doc.y, 200, 60).stroke(COLORS.border);
      doc.moveDown(3);
    }

    doc.moveDown();
    doc.fontSize(9).fill(COLORS.lightGray).text(`Signed by: ${signerInfo.name} (${signerInfo.email})`);
    doc.text(`Date: ${signerInfo.signedAt.toISOString()}`);
    doc.text(`IP: ${signerInfo.ipAddress}`);

    // Certificate of Electronic Signing
    doc.addPage();
    doc.rect(0, 0, 612, 50).fill(COLORS.headerBg);
    doc.fontSize(14).fill(COLORS.headerText).font("Helvetica-Bold").text("CERTIFICATE OF ELECTRONIC SIGNING", 72, 15);
    doc.moveDown(2);
    doc.fontSize(10).fill(COLORS.bodyText).font("Helvetica")
      .text(`This certificate confirms that ${signerInfo.name} electronically signed the ${content.title} on ${signerInfo.signedAt.toISOString()}.`)
      .text(`This signature is legally binding under the Electronic Signatures in Global and National Commerce Act (ESIGN Act), 15 U.S.C. § 7001-7031, and the Illinois Uniform Electronic Transactions Act (815 ILCS 333).`);

    doc.end();
  });
}
