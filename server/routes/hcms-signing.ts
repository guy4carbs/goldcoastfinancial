import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS } from "../middleware/auth";
import { storage } from "../storage";

const router = Router();
import { generateSignedPdf } from "../services/documentSigningService";
import { uploadFile } from "../services/s3Service";
import crypto from "crypto";

const DOC_LABELS: Record<string, string> = {
  nda: "Non-Disclosure Agreement",
  debt_rollup: "Debt Roll-Up Agreement",
  compliance: "Compliance & Ethics Agreement",
};

router.post("/sign/:documentType", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { documentType } = req.params;
    const validTypes = ["nda", "debt_rollup", "compliance"];
    if (!validTypes.includes(documentType)) return res.status(400).json({ error: "Invalid document type" });
    const { signatureDataUrl, agentUserId } = req.body;
    const signerInfo = { name: req.user!.firstName + " " + req.user!.lastName, email: req.user!.email, ipAddress: req.ip || "unknown", userAgent: req.get("user-agent") || "unknown", signedAt: new Date() };
    const pdf = await generateSignedPdf(documentType, signerInfo, signatureDataUrl);

    // Upload signed PDF to Firebase Storage
    const userId = agentUserId || req.user!.id;
    let documentKey = crypto.createHash("sha256").update(pdf).digest("hex");
    try {
      const uploadResult = await uploadFile(
        userId, `${documentType}-signed.pdf`, pdf,
        { contentType: "application/pdf", metadata: { documentType, signerEmail: req.user!.email } },
        "signed-documents"
      );
      if (uploadResult.success && uploadResult.key) {
        documentKey = uploadResult.key;
        console.log(`[HCMS] Signed PDF stored: ${uploadResult.key}`);
      }
    } catch (uploadErr: any) {
      console.error("[HCMS] PDF upload failed, storing hash:", uploadErr.message);
    }

    const col = documentType === "nda" ? "nda" : documentType === "debt_rollup" ? "debt_rollup" : "compliance";
    await pool.query(`UPDATE contracting_checklists SET ${col}_status = 'signed', ${col}_signed_at = NOW(), ${col}_document_key = $1, updated_at = NOW() WHERE agent_user_id = $2`, [documentKey, userId]);
    const completion = await pool.query(`UPDATE contracting_checklists SET all_completed = (nda_status = 'signed' AND debt_rollup_status = 'signed' AND compliance_status = 'signed'), completed_at = CASE WHEN nda_status = 'signed' AND debt_rollup_status = 'signed' AND compliance_status = 'signed' THEN NOW() ELSE NULL END, updated_at = NOW() WHERE agent_user_id = $1 RETURNING all_completed`, [userId]);

    // Notify the agent that this document is signed. Soft-fail: a notification
    // error should never break the signing flow.
    try {
      await storage.createNotification({
        userId,
        title: `${DOC_LABELS[documentType] || "Document"} signed`,
        message: `Your ${DOC_LABELS[documentType] || "document"} has been signed and stored. You can view it any time from the Documents page.`,
        type: "doc_signed",
        actionUrl: "/hcms/my/documents",
      });
      if (completion.rows[0]?.all_completed) {
        await storage.createNotification({
          userId,
          title: "All agreements signed",
          message: "NDA, Debt Roll-Up, and Compliance are all complete. Once the rest of your checklist is done, you're ready to request carrier appointments.",
          type: "milestone",
          actionUrl: "/hcms/my/dashboard",
        });
      }
    } catch (notifErr) {
      console.warn("[HCMS] notification dispatch failed:", notifErr);
    }

    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);
  } catch (e: any) { res.status(500).json({ error: "Something went wrong" }); }
});

router.get("/status/:agentUserId", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM contracting_checklists WHERE agent_user_id = $1`, [req.params.agentUserId]);
    res.json(result.rows[0] || { ndaStatus: "pending", debtRollupStatus: "pending", complianceStatus: "pending", allCompleted: false });
  } catch (e: any) { res.status(500).json({ error: "Something went wrong" }); }
});

export default router;
