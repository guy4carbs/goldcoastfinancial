import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS } from "../middleware/auth";

const router = Router();
import { generateSignedPdf } from "../services/documentSigningService";
import crypto from "crypto";
router.post("/sign/:documentType", requireAuth, async (req, res) => {
  try {
    const { documentType } = req.params;
    const { signatureDataUrl, agentUserId } = req.body;
    const signerInfo = { name: req.user!.firstName + " " + req.user!.lastName, email: req.user!.email, ipAddress: req.ip || "unknown", userAgent: req.get("user-agent") || "unknown", signedAt: new Date() };
    const pdf = await generateSignedPdf(documentType, signerInfo, signatureDataUrl);
    const hash = crypto.createHash("sha256").update(pdf).digest("hex");
    const col = documentType === "nda" ? "nda" : documentType === "debt_rollup" ? "debt_rollup" : "compliance";
    await pool.query(`UPDATE contracting_checklists SET ${col}_status = 'signed', ${col}_signed_at = NOW(), ${col}_document_key = $1, updated_at = NOW() WHERE agent_user_id = $2`, [hash, agentUserId || req.user!.id]);
    await pool.query(`UPDATE contracting_checklists SET all_completed = (nda_status = 'signed' AND debt_rollup_status = 'signed' AND compliance_status = 'signed'), completed_at = CASE WHEN nda_status = 'signed' AND debt_rollup_status = 'signed' AND compliance_status = 'signed' THEN NOW() ELSE NULL END, updated_at = NOW() WHERE agent_user_id = $1`, [agentUserId || req.user!.id]);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
router.get("/status/:agentUserId", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM contracting_checklists WHERE agent_user_id = $1`, [req.params.agentUserId]);
    res.json(result.rows[0] || { ndaStatus: "pending", debtRollupStatus: "pending", complianceStatus: "pending", allCompleted: false });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
