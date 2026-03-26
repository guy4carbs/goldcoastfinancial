/**
 * Onboarding API Routes
 * Multi-step agent onboarding with document uploads, e-signatures, and encrypted PII
 */

import { Router, Request, Response } from "express";
import { pool } from "../db";
import { attachUser, requireAuth } from "../middleware/auth";
import { storage } from "../storage";
import multer from "multer";
import crypto from "crypto";
import { encryptField, maskField } from "../services/encryptionService";
import * as s3Service from "../services/s3Service";
import { generateSignedPdf } from "../services/documentSigningService";
import { DOCUMENT_CONTENT } from "../../shared/documentContent";
import { logAudit, getAuditContext } from "../services/auditService";
import { sendOnboardingCompletionEmail } from "../gmail";
import type { AuditAction } from "../../shared/schema";

const router = Router();

// =============================================================================
// HELPERS
// =============================================================================

/** Map of camelCase field names to their snake_case DB column equivalents */
const FIELD_MAP: Record<string, string> = {
  firstName: "first_name",
  lastName: "last_name",
  email: "email",
  phone: "phone",
  dateOfBirth: "date_of_birth",
  streetAddress: "street_address",
  city: "city",
  state: "state",
  zipCode: "zip_code",
  isLicensed: "is_licensed",
  licenseNumber: "license_number",
  licensedStates: "licensed_states",
  npn: "npn",
  yearsExperience: "years_experience",
  previousAgency: "previous_agency",
  whyJoinHeritage: "why_join_heritage",
  referralSource: "referral_source",
  referringAgentName: "referring_agent_name",
  emergencyContactName: "emergency_contact_name",
  emergencyContactPhone: "emergency_contact_phone",
  emergencyContactRelationship: "emergency_contact_relationship",
  bankName: "bank_name",
  accountHolderName: "account_holder_name",
  accountType: "account_type",
  mentorId: "mentor_id",
  eoCertificateS3Key: "eo_certificate_s3_key",
  amlCertificateS3Key: "aml_certificate_s3_key",
  driversLicenseS3Key: "drivers_license_s3_key",
  docusignNdaSigned: "docusign_nda_signed",
  docusignDebtRollupSigned: "docusign_debt_rollup_signed",
  docusignComplianceSigned: "docusign_compliance_signed",
  onboardingType: "onboarding_type",
  onboardingStep: "onboarding_step",
};

/** Sensitive fields that must be encrypted before storage */
const SENSITIVE_FIELD_MAP: Record<string, string> = {
  ssn: "ssn_encrypted",
  emergencyContactSsn: "emergency_contact_ssn_encrypted",
  routingNumber: "routing_number_encrypted",
  accountNumber: "account_number_encrypted",
};

/** Convert a camelCase data object to snake_case using FIELD_MAP */
function mapToSnakeCase(data: Record<string, any>): Record<string, any> {
  const mapped: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    // Skip sensitive fields — they are handled separately
    if (SENSITIVE_FIELD_MAP[key]) continue;

    const snakeKey = FIELD_MAP[key] || key;
    mapped[snakeKey] = value;
  }
  return mapped;
}

/** Encrypt sensitive fields and return them as snake_case DB columns */
function encryptSensitiveFields(data: Record<string, any>): Record<string, any> {
  const encrypted: Record<string, any> = {};
  for (const [camelKey, dbColumn] of Object.entries(SENSITIVE_FIELD_MAP)) {
    if (data[camelKey] !== undefined && data[camelKey] !== null && data[camelKey] !== "") {
      encrypted[dbColumn] = encryptField(data[camelKey]);
    }
  }
  return encrypted;
}

/** Document type to S3 key column mapping */
const DOCUMENT_TYPE_COLUMN: Record<string, string> = {
  eo_certificate: "eo_certificate_s3_key",
  aml_certificate: "aml_certificate_s3_key",
  drivers_license: "drivers_license_s3_key",
  drivers_license_back: "drivers_license_back_s3_key",
  direct_deposit_form: "direct_deposit_form_s3_key",
};

/** Document type to DB column mappings */
const DOC_SIGNED_COLUMN: Record<string, string> = {
  nda: "docusign_nda_signed",
  debt_rollup: "docusign_debt_rollup_signed",
  compliance: "docusign_compliance_signed",
};

const DOC_S3_COLUMN: Record<string, string> = {
  nda: "docusign_nda_s3_key",
  debt_rollup: "docusign_debt_rollup_s3_key",
  compliance: "docusign_compliance_s3_key",
};

const DOC_SIGNED_AT_COLUMN: Record<string, string> = {
  nda: "docusign_nda_signed_at",
  debt_rollup: "docusign_debt_rollup_signed_at",
  compliance: "docusign_compliance_signed_at",
};

const DOC_HASH_COLUMN: Record<string, string> = {
  nda: "docusign_nda_document_hash",
  debt_rollup: "docusign_debt_rollup_document_hash",
  compliance: "docusign_compliance_document_hash",
};

// Multer config for document uploads (10MB limit, memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// =============================================================================
// ROUTE 1: POST /validate-token — PUBLIC (no auth)
// Validate an onboarding invitation token
// =============================================================================
router.post("/validate-token", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // Hash the token with SHA-256 for lookup
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const profile = await storage.getOnboardingByToken(hashedToken);

    if (!profile) {
      return res.status(401).json({ error: "Invalid or expired onboarding link" });
    }

    // Check expiry if the profile has an expiration
    if (profile.token_expires_at && new Date(profile.token_expires_at) < new Date()) {
      return res.status(401).json({ error: "Invalid or expired onboarding link" });
    }

    // Fetch user info for pre-filled fields
    const userResult = await pool.query(
      `SELECT first_name, last_name, email FROM users WHERE id = $1`,
      [profile.user_id]
    );
    const user = userResult.rows[0] || {};

    res.json({
      valid: true,
      profileId: profile.id,
      userId: profile.user_id,
      onboardingType: profile.onboarding_type,
      currentStep: profile.onboarding_step,
      firstName: user.first_name || null,
      lastName: user.last_name || null,
      email: user.email || null,
      npn: profile.npn || null,
      isLicensed: profile.is_licensed ?? null,
      dateOfBirth: profile.date_of_birth || null,
    });
  } catch (error: any) {
    console.error("Error validating onboarding token:", error);
    res.status(500).json({ error: "Failed to validate onboarding token" });
  }
});

// =============================================================================
// ROUTE 2: GET /status/:userId — Get onboarding status (AUTH required)
// =============================================================================
router.get("/status/:userId", attachUser, requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const requestingUser = (req as any).user;

    // Only the user themselves or owner/system_admin can view status
    if (requestingUser.id !== userId && !["owner", "system_admin"].includes(requestingUser.role)) {
      return res.status(403).json({ error: "Not authorized to view this onboarding status" });
    }

    const profile = await storage.getFullAgentProfile(userId);

    if (!profile) {
      return res.status(404).json({ error: "Agent profile not found" });
    }

    // Mask sensitive fields before returning
    const maskedProfile = { ...profile };
    if (maskedProfile.ssn_encrypted) {
      maskedProfile.ssn_masked = maskField(maskedProfile.ssn_encrypted, 4);
      delete maskedProfile.ssn_encrypted;
    }
    if (maskedProfile.emergency_contact_ssn_encrypted) {
      maskedProfile.emergency_contact_ssn_masked = maskField(maskedProfile.emergency_contact_ssn_encrypted, 4);
      delete maskedProfile.emergency_contact_ssn_encrypted;
    }
    if (maskedProfile.routing_number_encrypted) {
      maskedProfile.routing_number_masked = maskField(maskedProfile.routing_number_encrypted, 4);
      delete maskedProfile.routing_number_encrypted;
    }
    if (maskedProfile.account_number_encrypted) {
      maskedProfile.account_number_masked = maskField(maskedProfile.account_number_encrypted, 4);
      delete maskedProfile.account_number_encrypted;
    }

    res.json({ profile: maskedProfile });
  } catch (error: any) {
    console.error("Error fetching onboarding status:", error);
    res.status(500).json({ error: "Failed to fetch onboarding status" });
  }
});

// =============================================================================
// ROUTE 3: POST /save-step — Save onboarding step data (AUTH required)
// =============================================================================
router.post("/save-step", attachUser, requireAuth, async (req: Request, res: Response) => {
  try {
    const { profileId, step, data } = req.body;
    const requestingUser = (req as any).user;

    if (!profileId || step === undefined || !data) {
      return res.status(400).json({ error: "profileId, step, and data are required" });
    }

    // Verify the profile belongs to the requesting user
    const profile = await storage.getFullAgentProfile(requestingUser.id);
    if (!profile || String(profile.id) !== String(profileId)) {
      return res.status(403).json({ error: "Not authorized to update this profile" });
    }

    // Encrypt sensitive fields
    const encryptedFields = encryptSensitiveFields(data);

    // Map remaining camelCase fields to snake_case
    const mappedData = mapToSnakeCase(data);

    // Merge everything and update
    const updatePayload = {
      ...mappedData,
      ...encryptedFields,
      onboarding_step: step,
    };

    await storage.updateAgentOnboarding(profileId, updatePayload);

    res.json({ success: true, step });
  } catch (error: any) {
    console.error("Error saving onboarding step:", error);
    res.status(500).json({ error: "Failed to save onboarding step" });
  }
});

// =============================================================================
// ROUTE 4: POST /upload-document — Upload onboarding document (AUTH required)
// =============================================================================
router.post(
  "/upload-document",
  attachUser,
  requireAuth,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const { documentType, profileId } = req.body;
      const requestingUser = (req as any).user;

      if (!req.file) {
        return res.status(400).json({ error: "File is required" });
      }

      if (!documentType || !DOCUMENT_TYPE_COLUMN[documentType]) {
        return res.status(400).json({
          error: "Invalid documentType. Must be one of: eo_certificate, aml_certificate, drivers_license, drivers_license_back, direct_deposit_form",
        });
      }

      if (!profileId) {
        return res.status(400).json({ error: "profileId is required" });
      }

      // Upload to S3
      const uploadResult = await s3Service.uploadFile(
        requestingUser.id,
        req.file.originalname,
        req.file.buffer,
        {
          contentType: req.file.mimetype,
          metadata: {
            userId: requestingUser.id,
            documentType,
          },
        },
        "onboarding-documents"
      );

      if (!uploadResult.success || !uploadResult.key) {
        return res.status(500).json({ error: uploadResult.error || "Failed to upload file to S3" });
      }

      // Update the agent profile with the S3 key
      const s3Column = DOCUMENT_TYPE_COLUMN[documentType];
      await storage.updateAgentOnboarding(profileId, {
        [s3Column]: uploadResult.key,
      });

      res.json({
        success: true,
        documentType,
        fileName: req.file.originalname,
      });
    } catch (error: any) {
      console.error("Error uploading onboarding document:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  }
);

// =============================================================================
// ROUTE 5: POST /submit — Submit completed onboarding (AUTH required)
// =============================================================================
router.post("/submit", attachUser, requireAuth, async (req: Request, res: Response) => {
  try {
    const { profileId } = req.body;
    const requestingUser = (req as any).user;

    if (!profileId) {
      return res.status(400).json({ error: "profileId is required" });
    }

    // Verify the profile belongs to the requesting user
    const profile = await storage.getFullAgentProfile(requestingUser.id);
    if (!profile || String(profile.id) !== String(profileId)) {
      return res.status(403).json({ error: "Not authorized to submit this profile" });
    }

    // Verify required fields based on onboarding type
    const missingFields: string[] = [];

    // Common required fields for all onboarding types
    const commonRequired = ["date_of_birth", "street_address", "city", "state", "zip_code"];
    for (const field of commonRequired) {
      if (!profile[field]) {
        missingFields.push(field);
      }
    }

    // Licensed agent specific requirements
    if (profile.onboarding_type === "licensed_agent") {
      if (!profile.npn) missingFields.push("npn");
      if (!profile.license_number) missingFields.push("license_number");
      if (!profile.eo_certificate_s3_key) missingFields.push("eo_certificate");
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        missingFields,
      });
    }

    // Complete the onboarding
    await storage.completeOnboarding(profileId);

    // Log the action
    await storage.createAccessChangeLog({
      targetUserId: requestingUser.id,
      performedBy: requestingUser.id,
      actionType: "onboarding_completed",
      previousValue: { onboarding_step: profile.onboarding_step },
      newValue: { onboarding_step: "completed" },
      reason: "Agent completed onboarding",
      emailSent: false,
    });

    // Send completion email (non-blocking)
    const appUrl = process.env.APP_URL || (process.env.NODE_ENV === "production" ? "https://heritagels.org" : "http://localhost:4500");
    const onboardingType = profile.onboarding_type === "licensed_agent" ? "licensed" as const : "new_agent" as const;
    sendOnboardingCompletionEmail({
      agentName: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || requestingUser.name || "Agent",
      agentEmail: profile.email || requestingUser.email,
      onboardingType,
      loungeUrl: `${appUrl}/agents/login`,
    }).then(() => {
      console.log(`[Onboarding] Completion email sent to ${profile.email || requestingUser.email}`);
    }).catch((err: any) => {
      console.error("[Onboarding] Failed to send completion email:", err.message);
    });

    res.json({ success: true, message: "Onboarding complete" });
  } catch (error: any) {
    console.error("Error submitting onboarding:", error);
    res.status(500).json({ error: "Failed to submit onboarding" });
  }
});

// =============================================================================
// ROUTE 6: POST /sign-document — Local e-signature with PDF generation
// =============================================================================
router.post("/sign-document", async (req: Request, res: Response) => {
  try {
    const { profileId, documentType, signatureImage, signerName, signerEmail } = req.body;

    if (!documentType || !DOC_SIGNED_COLUMN[documentType]) {
      return res.status(400).json({
        error: "Invalid documentType. Must be one of: nda, debt_rollup, compliance",
      });
    }

    if (!profileId) {
      return res.status(400).json({ error: "profileId is required" });
    }

    if (!signatureImage || signatureImage.length < 100) {
      return res.status(400).json({ error: "A valid signature is required" });
    }

    // Extract audit info from request
    const forwarded = req.headers["x-forwarded-for"];
    const ipAddress = typeof forwarded === "string"
      ? forwarded.split(",")[0].trim()
      : req.ip || req.socket.remoteAddress || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";
    const signedAt = new Date();

    const signerInfo = {
      name: signerName || "Agent",
      email: signerEmail || "",
      ipAddress,
      userAgent,
      signedAt,
    };

    // Generate signed PDF with embedded signature + certificate
    const pdfBuffer = await generateSignedPdf(documentType, signatureImage, signerInfo);

    // Compute SHA-256 hash for tamper detection
    const documentHash = crypto.createHash("sha256").update(pdfBuffer).digest("hex");

    // Upload to S3
    const docContent = DOCUMENT_CONTENT[documentType];
    const docName = docContent?.title || documentType;
    const fileName = `${docName.replace(/[^a-zA-Z0-9]/g, "_")}_signed.pdf`;

    // Upload to S3 (non-blocking — document is still valid without S3)
    let s3Key: string | null = null;
    try {
      const uploadResult = await s3Service.uploadFile(
        profileId,
        fileName,
        pdfBuffer,
        {
          contentType: "application/pdf",
          metadata: {
            documentType,
            signerName: signerInfo.name,
            signerEmail: signerInfo.email,
            source: "local_esign",
            documentHash,
          },
        },
        "onboarding-documents"
      );

      if (uploadResult.success && uploadResult.key) {
        s3Key = uploadResult.key;
      } else {
        console.warn(`[DocumentSigning] S3 upload skipped: ${uploadResult.error || "S3 not configured"}`);
      }
    } catch (s3Err) {
      console.warn("[DocumentSigning] S3 upload failed, continuing without S3:", s3Err);
    }

    // Update agent profile with all signing data
    const signedColumn = DOC_SIGNED_COLUMN[documentType];
    const signedAtColumn = DOC_SIGNED_AT_COLUMN[documentType];
    const s3Column = DOC_S3_COLUMN[documentType];
    const hashColumn = DOC_HASH_COLUMN[documentType];

    const updatePayload: Record<string, any> = {
      [signedColumn]: true,
      [signedAtColumn]: signedAt,
      [hashColumn]: documentHash,
    };
    if (s3Key) {
      updatePayload[s3Column] = s3Key;
    }

    await storage.updateAgentOnboarding(profileId, updatePayload);

    // Audit log
    try {
      await logAudit(
        "document_signed" as AuditAction,
        "onboarding_document",
        "success",
        { userId: profileId, ipAddress, userAgent },
        profileId,
        {
          documentType,
          signerName: signerInfo.name,
          signerEmail: signerInfo.email,
          documentHash,
          s3Key: s3Key || "pending",
        }
      );
    } catch (auditErr) {
      console.error("[Audit] Failed to log document signing:", auditErr);
    }

    console.log(`[DocumentSigning] ${docName} signed${s3Key ? ` and stored: ${s3Key}` : " (S3 pending)"} (hash: ${documentHash.substring(0, 16)}...)`);

    res.json({
      success: true,
      documentType,
      signed: true,
      s3Key: s3Key || null,
      documentHash,
    });
  } catch (error: any) {
    console.error("Error signing document:", error);
    res.status(500).json({ error: error.message || "Failed to sign document" });
  }
});

// =============================================================================
// ROUTE 8: GET /mentors — List available mentors (AUTH required)
// =============================================================================
router.get("/mentors", attachUser, requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT id, first_name, last_name, email, avatar_url
      FROM users
      WHERE role = 'manager' AND is_active = true
      ORDER BY last_name ASC, first_name ASC
    `);

    res.json({ mentors: result.rows });
  } catch (error: any) {
    console.error("Error fetching mentors:", error);
    res.status(500).json({ error: "Failed to fetch mentors" });
  }
});

// =============================================================================
// ROUTE 9: GET /download/:s3Key — Download a signed document from S3
// =============================================================================
router.get("/download/*", attachUser, requireAuth, async (req: Request, res: Response) => {
  try {
    const s3Key = req.params[0];
    if (!s3Key) {
      return res.status(400).json({ error: "Missing S3 key" });
    }

    const result = await s3Service.getSignedDownloadUrl(s3Key);
    if (!result.success || !result.url) {
      return res.status(404).json({ error: result.error || "Document not found or S3 not configured" });
    }

    res.redirect(result.url);
  } catch (error: any) {
    console.error("Error downloading document:", error);
    res.status(500).json({ error: "Failed to download document" });
  }
});

// =============================================================================
// ROUTE: POST /test-completion-email — Send a test completion email (dev only)
// =============================================================================
router.post("/test-completion-email", async (req: Request, res: Response) => {
  try {
    const { email, name, onboardingType } = req.body;
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    const appUrl = process.env.APP_URL || (process.env.NODE_ENV === "production" ? "https://heritagels.org" : "http://localhost:4500");

    await sendOnboardingCompletionEmail({
      agentName: name || "Test Agent",
      agentEmail: email,
      onboardingType: onboardingType || "licensed",
      loungeUrl: `${appUrl}/agents/login`,
    });

    res.json({ success: true, message: `Test completion email sent to ${email}` });
  } catch (error: any) {
    console.error("Error sending test completion email:", error);
    res.status(500).json({ error: error.message || "Failed to send test email" });
  }
});

export default router;
