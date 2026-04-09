/**
 * Quick script endpoint to send legal doc samples.
 * Mounted temporarily to send via production Gmail.
 */
import { Router } from "express";
import { generateSignedPdf } from "../services/documentSigningService";
import { sendEmailWithAttachments } from "../gmail";

const router = Router();

router.post("/send-legal-samples", async (req, res) => {
  const targetEmail = req.body?.email || "guy4carbs@gmail.com";
  const sigBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
  const signer = { name: "Guy Carbs", email: "admin@heritagels.org", ipAddress: "127.0.0.1", userAgent: "Preview", signedAt: new Date() };

  const pdfs: Array<{ filename: string; content: Buffer; contentType: string }> = [];
  for (const docType of ["nda", "debt_rollup", "compliance"]) {
    const buffer = await generateSignedPdf(docType, sigBase64, signer);
    pdfs.push({ filename: `${docType.replace(/_/g, "-")}-sample.pdf`, content: buffer, contentType: "application/pdf" });
  }

  await sendEmailWithAttachments({
    to: targetEmail,
    subject: "Heritage Legal Documents - NDA, Debt Rollup, Compliance (Samples)",
    htmlBody: `<div style="font-family:Georgia,serif;padding:24px;"><h2 style="color:#3b1f7e;">Heritage Legal Document Samples</h2><p>Attached are the 3 legal agreement PDFs:</p><ul><li><strong>NDA</strong></li><li><strong>Debt Rollup</strong></li><li><strong>Compliance</strong></li></ul></div>`,
    plainTextBody: "Heritage Legal Document Samples - NDA, Debt Rollup, Compliance attached.",
    attachments: pdfs,
  });

  res.json({ success: true, message: `Sent to ${targetEmail}` });
});

export default router;
