/**
 * Document Generator Service — Gold Coast Financial
 * Generates branded PDF documents using PDFKit.
 * Supports multiple document templates with oxblood/gold branding.
 */

import PDFDocument from "pdfkit";

const COLORS = {
  navyDark: "#4A1420",
  navyMedium: "#5C1C28",
  goldPrimary: "#C4975A",
  goldBright: "#D4A96A",
  textDark: "#140E04",
  textBody: "#2a2a2a",
  textMedium: "#6b7280",
  textLight: "#9ca3af",
  cream: "#FAF7F0",
  white: "#ffffff",
  border: "#d1d5db",
};

const AGENCY = {
  name: "Heritage Life Solutions",
  legal: "Gold Coast Financial Partners, LLC",
  phone: "(630) 778-0888",
  website: "goldcoastfinancial.co",
  email: "contact@goldcoastfnl.com",
};

export type DocumentType = "welcome_letter" | "policy_summary" | "claims_guide" | "beneficiary_confirmation" | "payment_reminder" | "anniversary_letter";

export function generateDocument(type: DocumentType, data: Record<string, any>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "letter", margins: { top: 72, bottom: 72, left: 72, right: 72 } });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header bar
    doc.rect(0, 0, 612, 72).fill(COLORS.navyDark);
    doc.fontSize(16).fill(COLORS.white).font("Helvetica-Bold").text(AGENCY.name, 72, 20);
    doc.fontSize(8).fill(COLORS.goldPrimary).text(AGENCY.legal, 72, 42);
    doc.fontSize(7).fill(COLORS.textLight).text(`${AGENCY.phone} · ${AGENCY.website}`, 72, 55);

    // Gold rule
    doc.rect(0, 72, 612, 2).fill(COLORS.goldPrimary);

    doc.moveDown(3);

    // Document content based on type
    const title = type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    doc.fontSize(16).fill(COLORS.textDark).font("Helvetica-Bold").text(title, { align: "center" });
    doc.moveDown();

    if (data.recipientName) {
      doc.fontSize(11).fill(COLORS.textBody).font("Helvetica").text(`Dear ${data.recipientName},`);
      doc.moveDown();
    }

    if (data.body) {
      doc.fontSize(10).fill(COLORS.textBody).font("Helvetica").text(data.body, { lineGap: 3 });
    }

    // Footer
    const pageHeight = doc.page.height;
    doc.rect(0, pageHeight - 50, 612, 50).fill(COLORS.cream);
    doc.rect(0, pageHeight - 50, 612, 1).fill(COLORS.goldPrimary);
    doc.fontSize(7).fill(COLORS.textMedium).text(`${AGENCY.legal} · ${AGENCY.phone} · ${AGENCY.email}`, 72, pageHeight - 35, { align: "center" });

    doc.end();
  });
}
