import { Router } from "express";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";
import { uploadFile, validateFile } from "../services/s3Service";
import { decryptField, isEncrypted } from "../services/encryptionService";
import { resolveAgentAgency } from "../services/agencyResolver";

function lastFour(encrypted: string | null): string | null {
  if (!encrypted) return null;
  try {
    if (isEncrypted(encrypted)) {
      const val = decryptField(encrypted);
      return val.length >= 4 ? "***" + val.slice(-4) : "****";
    }
    // Non-encrypted data — mask it, don't expose
    return "****";
  } catch {
    console.error("[AgentPortal] Failed to decrypt banking field");
    return "****";
  }
}

const router = Router();

// All routes require authentication
router.use(requireAuth);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/agent-portal/me — Get current agent's full profile
// ─────────────────────────────────────────────────────────────────────────────
router.get("/me", async (req, res) => {
  try {
    const userId = req.user!.id;

    // Single JOIN query instead of 3 sequential queries
    const result = await pool.query(
      `SELECT u.id as uid, u.email, u.first_name, u.last_name, u.phone as user_phone, u.role, u.onboarding_status, u.created_at as user_created,
              ap.*, cc.nda_status, cc.nda_signed_at, cc.debt_rollup_status, cc.debt_rollup_signed_at,
              cc.compliance_status, cc.compliance_signed_at, cc.all_completed
       FROM users u
       LEFT JOIN agent_profiles ap ON u.id::text = ap.user_id::text
       LEFT JOIN contracting_checklists cc ON u.id::text = cc.agent_user_id::text
       WHERE u.id = $1`,
      [userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "User not found" });
    const row = result.rows[0];
    const user = row;
    const profile = row;
    const checklist = row;

    res.json({
      user: {
        id: user.uid,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.user_phone,
        role: user.role,
        onboardingStatus: user.onboarding_status,
        joinedAt: user.user_created,
      },
      profile: {
        dateOfBirth: profile.date_of_birth,
        streetAddress: profile.street_address,
        city: profile.city,
        state: profile.state,
        zipCode: profile.zip_code,
        npn: profile.npn,
        isLicensed: profile.is_licensed,
        licenseNumber: profile.license_number,
        licensedStates: profile.licensed_states,
        yearsExperience: profile.years_experience,
        previousAgency: profile.previous_agency,
        companyName: profile.company_name,
        title: profile.title,
        // E&O
        eoProvider: profile.eo_provider,
        eoPolicyNumber: profile.eo_policy_number,
        eoEffectiveDate: profile.eo_effective_date,
        eoExpirationDate: profile.eo_expiration_date,
        // Banking (masked)
        bankName: profile.bank_name,
        bankAccountType: profile.bank_account_type,
        routingLast4: lastFour(profile.routing_number_encrypted),
        accountLast4: lastFour(profile.account_number_encrypted),
        // Approval
        approvalStatus: profile.approval_status,
        approvedAt: profile.approved_at,
        // Business entity
        dbaType: profile.dba_type || (profile.company_name ? "business_entity" : "individual"),
        ein: profile.ein,
        companyType: profile.company_type,
        stateOfInc: profile.state_of_inc,
        dbaName: profile.dba_name,
        licenseType: profile.license_type,
        formationDate: profile.formation_date,
        businessEmail: profile.business_email,
        businessPhone: profile.business_phone,
        businessFax: profile.business_fax,
        businessWebsite: profile.business_website,
        businessStreet: profile.business_street,
        businessUnit: profile.business_unit,
        businessCity: profile.business_city,
        businessState: profile.business_state,
        businessZip: profile.business_zip,
        mailingStreet: profile.mailing_street,
        mailingCity: profile.mailing_city,
        mailingState: profile.mailing_state,
        mailingZip: profile.mailing_zip,
        mailingUnit: profile.mailing_unit,
        mailingSameAsBusiness: profile.mailing_same_as_business,
        eoCoverageAmount: profile.eo_coverage_amount,
        ceExpirationDate: profile.ce_expiration_date,
        owners: profile.owners_json ? JSON.parse(profile.owners_json) : [],
        drlp: profile.drlp_json ? JSON.parse(profile.drlp_json) : null,
        beneficiary: profile.beneficiary_json ? JSON.parse(profile.beneficiary_json) : null,
        articlesKey: profile.articles_s3_key,
        // Documents
        eoCertificateKey: profile.eo_certificate_s3_key,
        driversLicenseKey: profile.drivers_license_s3_key,
        amlCertificateKey: profile.aml_certificate_s3_key,
        directDepositFormKey: profile.direct_deposit_form_s3_key,
        backgroundAnswers: profile.background_answers ? (typeof profile.background_answers === "string" ? JSON.parse(profile.background_answers) : profile.background_answers) : [],
      },
      checklist: {
        ndaStatus: checklist.nda_status || "pending",
        ndaSignedAt: checklist.nda_signed_at,
        debtRollupStatus: checklist.debt_rollup_status || "pending",
        debtRollupSignedAt: checklist.debt_rollup_signed_at,
        complianceStatus: checklist.compliance_status || "pending",
        complianceSignedAt: checklist.compliance_signed_at,
        allCompleted: checklist.all_completed || false,
      },
    });
  } catch (e: any) {
    console.error("[AgentPortal]", e.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/agent-portal/dba — Update business-entity DBA fields
// ─────────────────────────────────────────────────────────────────────────────
// Lets the agent (or founder, who's also an "agent" for HCMS purposes) fill in
// every business-entity field surfaced on the AgentDBA page. Whitelisted
// columns + JSON blobs (owners/drlp/beneficiary) so the route can never set
// approval flags or other privileged columns.
router.put("/dba", async (req, res) => {
  try {
    const userId = req.user!.id;
    const b = req.body || {};

    const updates: Record<string, any> = {};
    const set = (col: string, v: any) => {
      if (v !== undefined) updates[col] = v === "" ? null : v;
    };

    set("dba_type", b.dbaType);
    set("company_name", b.companyName);
    set("dba_name", b.dbaName);
    set("ein", b.ein);
    set("company_type", b.companyType);
    set("state_of_inc", b.stateOfInc);
    set("license_type", b.licenseType);
    set("formation_date", b.formationDate);
    set("title", b.title);
    set("business_email", b.businessEmail);
    set("business_phone", b.businessPhone);
    set("business_fax", b.businessFax);
    set("business_website", b.businessWebsite);
    set("business_street", b.businessStreet);
    set("business_unit", b.businessUnit);
    set("business_city", b.businessCity);
    set("business_state", b.businessState);
    set("business_zip", b.businessZip);
    set("mailing_street", b.mailingStreet);
    set("mailing_unit", b.mailingUnit);
    set("mailing_city", b.mailingCity);
    set("mailing_state", b.mailingState);
    set("mailing_zip", b.mailingZip);
    if (b.mailingSameAsBusiness !== undefined)
      updates.mailing_same_as_business = !!b.mailingSameAsBusiness;
    if (Array.isArray(b.owners)) updates.owners_json = JSON.stringify(b.owners);
    if (b.drlp && typeof b.drlp === "object") updates.drlp_json = JSON.stringify(b.drlp);
    if (b.beneficiary && typeof b.beneficiary === "object")
      updates.beneficiary_json = JSON.stringify(b.beneficiary);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No DBA fields provided" });
    }

    const existing = await pool.query(
      "SELECT 1 FROM agent_profiles WHERE user_id::text = $1",
      [userId],
    );
    if (existing.rows.length === 0) {
      const cols = Object.keys(updates);
      const placeholders = cols.map((_, i) => `$${i + 2}`).join(", ");
      await pool.query(
        `INSERT INTO agent_profiles (user_id, ${cols.join(", ")}, approval_status, created_at, updated_at)
         VALUES ($1, ${placeholders}, 'pending_review', NOW(), NOW())`,
        [userId, ...cols.map((k) => updates[k])],
      );
    } else {
      const cols = Object.keys(updates);
      const sets = cols.map((k, i) => `${k} = $${i + 1}`).join(", ");
      await pool.query(
        `UPDATE agent_profiles SET ${sets}, updated_at = NOW() WHERE user_id::text = $${cols.length + 1}`,
        [...cols.map((k) => updates[k]), userId],
      );
    }

    res.json({ success: true, updatedColumns: Object.keys(updates) });
  } catch (e: any) {
    console.error("[AgentPortal] PUT /dba error:", e?.message);
    res.status(500).json({ error: "Failed to save DBA details" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/agent-portal/me — Update allowed fields
// ─────────────────────────────────────────────────────────────────────────────
router.put("/me", async (req, res) => {
  try {
    const userId = req.user!.id;
    const { phone, email, streetAddress, city, state, zipCode } = req.body;

    // Check email uniqueness if changing email
    if (email !== undefined) {
      const existing = await pool.query("SELECT id FROM users WHERE email = $1 AND id != $2", [email, userId]);
      if (existing.rows.length > 0) return res.status(409).json({ error: "Email already in use by another account" });
    }

    // Update user table (phone, email)
    const userUpdates: string[] = [];
    const userVals: any[] = [];
    let idx = 1;
    if (phone !== undefined) { userUpdates.push(`phone = $${idx++}`); userVals.push(phone); }
    if (email !== undefined) { userUpdates.push(`email = $${idx++}`); userVals.push(email); }
    if (userUpdates.length > 0) {
      userUpdates.push(`updated_at = NOW()`);
      await pool.query(`UPDATE users SET ${userUpdates.join(", ")} WHERE id = $${idx}`, [...userVals, userId]);
    }

    // Upsert agent_profiles (address) — insert the row if it doesn't exist yet,
    // so brand-new accounts persist data on first save.
    const hasProfileFields =
      streetAddress !== undefined ||
      city !== undefined ||
      state !== undefined ||
      zipCode !== undefined;

    if (hasProfileFields) {
      const existing = await pool.query(
        "SELECT 1 FROM agent_profiles WHERE user_id::text = $1",
        [userId]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO agent_profiles (user_id, street_address, city, state, zip_code, approval_status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, 'pending_review', NOW(), NOW())`,
          [
            userId,
            streetAddress ?? null,
            city ?? null,
            state ?? null,
            zipCode ?? null,
          ]
        );
      } else {
        const profileUpdates: string[] = [];
        const profileVals: any[] = [];
        idx = 1;
        if (streetAddress !== undefined) { profileUpdates.push(`street_address = $${idx++}`); profileVals.push(streetAddress); }
        if (city !== undefined) { profileUpdates.push(`city = $${idx++}`); profileVals.push(city); }
        if (state !== undefined) { profileUpdates.push(`state = $${idx++}`); profileVals.push(state); }
        if (zipCode !== undefined) { profileUpdates.push(`zip_code = $${idx++}`); profileVals.push(zipCode); }
        profileUpdates.push(`updated_at = NOW()`);
        await pool.query(
          `UPDATE agent_profiles SET ${profileUpdates.join(", ")} WHERE user_id::text = $${idx}`,
          [...profileVals, userId]
        );
      }
    }

    // Read back authoritative values so the client doesn't drift from the server
    const fresh = await pool.query(
      `SELECT u.email, u.phone, ap.street_address, ap.city, ap.state, ap.zip_code
       FROM users u
       LEFT JOIN agent_profiles ap ON u.id::text = ap.user_id::text
       WHERE u.id = $1`,
      [userId]
    );
    const row = fresh.rows[0] || {};
    res.json({
      success: true,
      user: { email: row.email, phone: row.phone },
      profile: {
        streetAddress: row.street_address,
        city: row.city,
        state: row.state,
        zipCode: row.zip_code,
      },
    });
  } catch (e: any) {
    console.error("[AgentPortal]", e.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/agent-portal/upload — Re-upload documents
// ─────────────────────────────────────────────────────────────────────────────
router.post("/upload", async (req, res) => {
  try {
    const userId = req.user!.id;
    const { documentType, fileName, fileData, mimeType, fileSize } = req.body;

    if (!documentType || !fileData) {
      return res.status(400).json({ error: "documentType and fileData required" });
    }

    const allowed = ["eo_cert", "aml_cert", "direct_deposit", "gov_id", "articles"];
    if (!allowed.includes(documentType)) {
      return res.status(400).json({ error: "Invalid document type" });
    }

    const validation = validateFile(fileName || "file.pdf", mimeType || "application/pdf", fileSize || 0);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    const buffer = Buffer.from(fileData, "base64");
    const result = await uploadFile(userId, fileName || `${documentType}.pdf`, buffer, {
      contentType: mimeType || "application/pdf",
      metadata: { documentType },
    }, "agent-uploads");

    if (!result.success) return res.status(500).json({ error: result.error });

    const columnMap: Record<string, string> = {
      eo_cert: "eo_certificate_s3_key",
      aml_cert: "aml_certificate_s3_key",
      direct_deposit: "direct_deposit_form_s3_key",
      gov_id: "drivers_license_s3_key",
      articles: "articles_s3_key",
    };

    const column = columnMap[documentType];
    if (column) {
      await pool.query(
        `UPDATE agent_profiles SET ${column} = $1, updated_at = NOW() WHERE user_id::text = $2`,
        [result.key, userId]
      );
    }

    res.json({ success: true, key: result.key });
  } catch (e: any) {
    console.error("[AgentPortal]", e.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// Document type → agent_profiles column mapping. Shared by /document/:type
// and /documents/:type/stream so both lookups stay in sync.
const AGENT_DOC_COLUMN_MAP: Record<string, string> = {
  eo_cert: "eo_certificate_s3_key",
  aml_cert: "aml_certificate_s3_key",
  direct_deposit: "direct_deposit_form_s3_key",
  gov_id: "drivers_license_s3_key",
  articles: "articles_s3_key",
};

// Friendly filename used in Content-Disposition for the streamed document.
const AGENT_DOC_FILENAMES: Record<string, string> = {
  eo_cert: "eo-certificate",
  aml_cert: "aml-certificate",
  direct_deposit: "direct-deposit-form",
  gov_id: "government-id",
  articles: "articles-of-incorporation",
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/agent-portal/document/:type — Returns a SAME-ORIGIN proxy URL.
// We no longer hand out Firebase signed URLs because Firebase download tokens
// don't expire (Sentinel veto, 2026-04-30). The iframe loads /documents/:type
// /stream, which re-validates the agent's session on every request.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/document/:type", async (req, res) => {
  try {
    const userId = req.user!.id;
    const { type } = req.params;

    const column = AGENT_DOC_COLUMN_MAP[type];
    if (!column) return res.status(400).json({ error: "Invalid document type" });

    const result = await pool.query(
      `SELECT ${column} as s3_key FROM agent_profiles WHERE user_id::text = $1`,
      [userId]
    );

    const key = result.rows[0]?.s3_key;
    if (!key) return res.status(404).json({ error: "Document not found" });

    // Legacy URL keys — return directly, no proxy needed.
    if (key.startsWith("http")) {
      return res.json({ url: key, key });
    }
    // Inline data: URIs (server-seeded cursive signature SVGs) — surface to the
    // client so the document viewer renders them inline. The proxy stream
    // below would 404 since data: keys aren't backed by storage.
    if (key.startsWith("data:")) {
      return res.json({ url: null, key, message: "Inline signature on file — rendered separately." });
    }

    try {
      const { isS3Available } = await import("../services/s3Service");
      if (!isS3Available()) {
        return res.json({ url: null, key, message: "Document stored but storage not configured for preview" });
      }
      // Hand back a same-origin proxy URL — the actual bytes are streamed
      // by /documents/:type/stream, which re-checks auth.
      res.json({ url: `/api/agent-portal/documents/${type}/stream`, key });
    } catch {
      res.json({ url: null, key, message: "Document on file — preview unavailable" });
    }
  } catch (e: any) {
    console.error("[AgentPortal]", e.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/agent-portal/documents/:type/stream — server-side proxy of file bytes.
// Re-runs the same auth/lookup as /document/:type. No external token leaves
// the server; the iframe relies on the session cookie for authorization.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/documents/:type/stream", async (req, res) => {
  try {
    const userId = req.user!.id;
    const { type } = req.params;

    const column = AGENT_DOC_COLUMN_MAP[type];
    if (!column) return res.status(400).json({ error: "Invalid document type" });

    const result = await pool.query(
      `SELECT ${column} as s3_key FROM agent_profiles WHERE user_id::text = $1`,
      [userId]
    );

    const key = result.rows[0]?.s3_key;
    if (!key) return res.status(404).json({ error: "Document not found" });

    // Legacy http-key short-circuit — redirect the iframe to the original URL.
    if (key.startsWith("http")) {
      return res.redirect(key);
    }

    const { getFile, isS3Available } = await import("../services/s3Service");
    if (!isS3Available()) {
      return res.status(503).json({ error: "Storage not configured" });
    }

    const fetched = await getFile(key);
    if (!fetched.success || !fetched.data) {
      return res.status(404).json({ error: fetched.error || "File not found in storage" });
    }

    const safeName = (AGENT_DOC_FILENAMES[type] || "document").replace(/[^\w.\-]+/g, "_");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${safeName}.pdf"`);
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.send(fetched.data);
  } catch (e: any) {
    console.error("[AgentPortal] document stream error:", e.message);
    res.status(500).json({ error: "Failed to stream document" });
  }
});

// Signed-agreement type → contracting_checklists column mapping. Shared by
// /signed/:type (returns proxy URL) and /signed/documents/:type/stream
// (proxies bytes). Both paths re-derive the key from this map.
const SIGNED_DOC_COLUMN_MAP: Record<string, string> = {
  nda: "nda_document_key",
  debt_rollup: "debt_rollup_document_key",
  compliance: "compliance_document_key",
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/agent-portal/signed/:type — Returns a SAME-ORIGIN proxy URL for a
// signed agreement. Sentinel veto, 2026-04-30: Firebase tokens never expire,
// so we no longer return signed Firebase URLs. PDF-regeneration fallback
// remains intact for hash-key entries that predate the S3 migration.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/signed/:type", async (req, res) => {
  try {
    const userId = req.user!.id;
    const { type } = req.params;

    const column = SIGNED_DOC_COLUMN_MAP[type];
    if (!column) return res.status(400).json({ error: "Invalid document type" });

    const result = await pool.query(
      `SELECT ${column} as doc_key FROM contracting_checklists WHERE agent_user_id::text = $1`,
      [userId]
    );

    const key = result.rows[0]?.doc_key;
    if (!key) return res.status(404).json({ error: "Document not found" });

    // Inline data: URI signature — pass through so the viewer can render it
    // alongside the document text. There is no PDF for these.
    if (key.startsWith("data:")) {
      return res.json({ url: null, key, message: "Inline signature on file — rendered separately." });
    }

    // S3-style key — return a same-origin proxy URL. The actual bytes are
    // streamed by /signed/documents/:type/stream, which re-checks auth.
    if (key.includes("/")) {
      try {
        const { isS3Available } = await import("../services/s3Service");
        if (isS3Available()) {
          return res.json({ url: `/api/agent-portal/signed/documents/${type}/stream`, key });
        }
      } catch {}
    }

    // Key is a hash or storage unavailable — regenerate PDF on the fly
    try {
      const { generateSignedPdf } = await import("../services/documentSigningService");
      const signerResult = await pool.query(
        `SELECT u.first_name, u.last_name, u.email, cc.${column.replace('_document_key', '_signed_at')} as signed_at
         FROM users u JOIN contracting_checklists cc ON u.id::text = cc.agent_user_id::text
         WHERE u.id::text = $1`, [userId]
      );
      const signer = signerResult.rows[0];
      if (signer) {
        const pdf = await generateSignedPdf(type, {
          name: `${signer.first_name} ${signer.last_name}`, email: signer.email,
          ipAddress: "on-file", userAgent: "regenerated",
          signedAt: signer.signed_at ? new Date(signer.signed_at) : new Date(),
        });
        const safeType = type.replace(/[^\w.\-]+/g, "_");
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${safeType}-signed.pdf"`);
        res.setHeader("Cache-Control", "private, no-store");
        res.setHeader("X-Content-Type-Options", "nosniff");
        return res.send(pdf);
      }
    } catch (regenErr: any) {
      console.error("[AgentPortal] PDF regeneration failed:", regenErr.message);
    }
    res.json({ url: null, key, message: "Signed document stored — PDF will be available after re-signing" });
  } catch (e: any) {
    console.error("[AgentPortal]", e.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/agent-portal/signed/documents/:type/stream — Server-side proxy for
// signed-agreement PDFs stored in S3. Re-runs the same auth/lookup as
// /signed/:type. Path is shaped to match the response logger's
// /documents/[^/]+/(url|stream)$ scrubber.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/signed/documents/:type/stream", async (req, res) => {
  try {
    const userId = req.user!.id;
    const { type } = req.params;

    const column = SIGNED_DOC_COLUMN_MAP[type];
    if (!column) return res.status(400).json({ error: "Invalid document type" });

    const result = await pool.query(
      `SELECT ${column} as doc_key FROM contracting_checklists WHERE agent_user_id::text = $1`,
      [userId]
    );

    const key = result.rows[0]?.doc_key;
    if (!key) return res.status(404).json({ error: "Document not found" });
    if (!key.includes("/")) {
      // Hash-only key — caller should be using /signed/:type which handles
      // the regen fallback. Stream endpoint only handles S3-backed keys.
      return res.status(404).json({ error: "Document not stored in S3" });
    }

    const { getFile, isS3Available } = await import("../services/s3Service");
    if (!isS3Available()) {
      return res.status(503).json({ error: "Storage not configured" });
    }

    const fetched = await getFile(key);
    if (!fetched.success || !fetched.data) {
      return res.status(404).json({ error: fetched.error || "File not found in storage" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${type}-signed.pdf"`);
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.send(fetched.data);
  } catch (e: any) {
    console.error("[AgentPortal] signed document stream error:", e.message);
    res.status(500).json({ error: "Failed to stream document" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/agent-portal/hierarchy — Agent's own hierarchy position
// ─────────────────────────────────────────────────────────────────────────────
router.get("/hierarchy", async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get agent's hierarchy record
    const result = await pool.query(
      `SELECT ah.*, u.first_name as upline_first, u.last_name as upline_last, u.email as upline_email, u.phone as upline_phone
       FROM agent_hierarchy ah
       LEFT JOIN users u ON ah.direct_upline_id::text = u.id::text
       WHERE ah.agent_user_id::text = $1 AND (ah.effective_to IS NULL OR ah.effective_to > NOW())
       ORDER BY ah.effective_from DESC LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ placed: false, hierarchy: null, upline: null });
    }

    const h = result.rows[0];
    res.json({
      placed: true,
      hierarchy: {
        level: h.hierarchy_level,
        title: h.hierarchy_title,
        contractLevel: h.contract_level,
        overrideEligible: h.override_eligible,
        overridePercentage: h.override_percentage,
        effectiveFrom: h.effective_from,
        uplineChain: h.upline_chain,
      },
      upline: h.upline_first ? {
        firstName: h.upline_first,
        lastName: h.upline_last,
        email: h.upline_email,
        phone: h.upline_phone,
      } : null,
    });
  } catch (e: any) {
    console.error("[AgentPortal] hierarchy", e.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/agent-portal/carriers/available — Wave 4
// Returns the carriers from carrier_directory that the requester's agency
// holds an ACTIVE agency_carrier_contracts row for. Used to populate the
// agent's contracting-request carrier picker so they can't even attempt
// to request appointment with a non-contracted carrier.
//
// Response shape mirrors GET /api/hcms/carriers/directory so the frontend can
// swap the URL with no further reshape.
// Returns [] if the agent has no agency or the agency has no active contracts.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/carriers/available", async (req, res) => {
  try {
    const agentAgency = await resolveAgentAgency(req.user!.id);
    if (!agentAgency) return res.json([]);

    const result = await pool.query(
      `SELECT cd.*
         FROM carrier_directory cd
         JOIN agency_carrier_contracts acc
           ON acc.carrier_id::text = cd.id::text
        WHERE acc.agency_id = $1::uuid
          AND acc.status = 'active'
          AND cd.is_active = true
        ORDER BY cd.name ASC`,
      [agentAgency.agencyId],
    );
    res.json(result.rows);
  } catch (e: any) {
    console.error("[AgentPortal] GET /carriers/available", e?.message);
    res.status(500).json({ error: "Failed to load available carriers" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Contracting Requests CRUD
// ─────────────────────────────────────────────────────────────────────────────
router.get("/requests", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM agent_contracting_requests WHERE agent_user_id::text = $1 ORDER BY created_at DESC",
      [req.user!.id]
    );
    res.json(result.rows.map((r: any) => ({
      id: r.id, carrier: r.carrier, states: (r.states || "").split(",").map((s: string) => s.trim()).filter(Boolean),
      status: r.status, returnedReason: r.returned_reason || null, notes: r.notes || null,
      createdAt: r.created_at,
    })));
  } catch (e: any) {
    console.error("[AgentPortal] GET /requests", e.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

router.post("/requests", async (req, res) => {
  try {
    const { carrier, states, carrierId: bodyCarrierId } = req.body;
    if (!carrier || !Array.isArray(states) || states.length === 0) return res.status(400).json({ error: "Carrier and states required" });
    if (carrier.length > 255) return res.status(400).json({ error: "Invalid carrier name" });
    if (states.length > 51) return res.status(400).json({ error: "Too many states" });

    // Check for duplicate active request
    const existing = await pool.query(
      "SELECT id FROM agent_contracting_requests WHERE agent_user_id::text = $1 AND carrier = $2 AND status != 'returned'",
      [req.user!.id, carrier]
    );
    if (existing.rows.length > 0) return res.status(409).json({ error: "You already have an active request for this carrier" });

    // ─── Agency contract + compliance gating ────────────────────────────────
    // Resolve the request to a carrier_id. Prefer the explicit body field; if
    // omitted, look up by name from carrier_directory. Sentinel HIGH 1: if the
    // carrier name is unknown to the directory we now reject (was: silent
    // fallthrough that bypassed every gate).
    let carrierId: string | null = null;
    if (bodyCarrierId && typeof bodyCarrierId === "string") {
      carrierId = bodyCarrierId;
    } else {
      const cdRes = await pool.query(
        `SELECT id::text AS id FROM carrier_directory
          WHERE LOWER(name) = LOWER($1) OR LOWER(short_name) = LOWER($1) OR LOWER(code) = LOWER($1)
          LIMIT 1`,
        [carrier],
      );
      carrierId = cdRes.rows[0]?.id || null;
    }

    if (!carrierId) {
      // Sentinel HIGH 1 — surface accepted carrier names so the client can
      // suggest the canonical spelling. Limit to 50 (alphabetical) to keep the
      // payload bounded.
      const accepted = (await pool.query(
        `SELECT name FROM carrier_directory WHERE is_active = true ORDER BY name LIMIT 50`,
      )).rows.map((r: any) => r.name);
      return res.status(400).json({
        error: `Carrier "${carrier}" not found in directory. Use the exact name from the master list.`,
        code: "CARRIER_NOT_RECOGNIZED",
        acceptedNames: accepted,
      });
    }

    // 1) Agency contract gate — agent must be in an agency that holds an
    //    active MPA with this carrier.
    const agentAgency = await resolveAgentAgency(req.user!.id);
    if (!agentAgency) {
      return res.status(400).json({
        error: "Agent has no assigned agency",
        code: "NO_AGENCY",
      });
    }

    const contract = await pool.query(
      `SELECT id, status FROM agency_carrier_contracts WHERE agency_id = $1 AND carrier_id = $2`,
      [agentAgency.agencyId, carrierId],
    );
    if (contract.rows.length === 0 || contract.rows[0].status !== "active") {
      // Sentinel MED 3 — do not leak the agency name to the client. Server
      // log keeps the context for the audit trail.
      console.log(
        `[AgentPortal] NO_AGENCY_CONTRACT user=${req.user!.id} agency=${agentAgency.agencyName} carrierId=${carrierId}`,
      );
      return res.status(400).json({
        error: "Your agency does not hold an active contract with this carrier. Contact your founder to request appointment.",
        code: "NO_AGENCY_CONTRACT",
      });
    }

    // ─── Top-level compliance pre-checks (Helix BLOCK 4 + MED 6 + MED 7) ───
    // One round-trip pulls every column the gates downstream care about.
    const profileRow = (await pool.query(
      `SELECT npn, is_licensed, license_expiration_date, licensed_states,
              eo_coverage_amount, eo_expiration_date, ce_expiration_date,
              aml_certificate_s3_key
         FROM agent_profiles WHERE user_id = $1`,
      [req.user!.id],
    )).rows[0];

    // Helix BLOCK 4 — license validity + state coverage.
    if (!profileRow?.is_licensed) {
      return res.status(400).json({
        error: "Active license required to request appointments",
        code: "NO_LICENSE",
      });
    }
    if (profileRow.license_expiration_date && new Date(profileRow.license_expiration_date) < new Date()) {
      return res.status(400).json({
        error: "Your license has expired",
        code: "LICENSE_EXPIRED",
      });
    }
    const licensedStates = Array.isArray(profileRow.licensed_states)
      ? profileRow.licensed_states.map((s: string) => String(s).toUpperCase())
      : [];
    const requestedStates = (states ?? []).map((s: string) => String(s).toUpperCase());
    const unlicensed = requestedStates.find((s: string) => !licensedStates.includes(s));
    if (requestedStates.length > 0 && unlicensed) {
      return res.status(400).json({
        error: `You are not licensed in ${unlicensed}`,
        code: "STATE_NOT_LICENSED",
      });
    }

    // Helix MED 6 — NPN required for any carrier appointment.
    if (!profileRow.npn) {
      return res.status(400).json({
        error: "NPN required before requesting carrier appointments",
        code: "NPN_REQUIRED",
      });
    }

    // Helix MED 7 — CE expiration (only if the agent has filed a CE date).
    if (profileRow.ce_expiration_date && new Date(profileRow.ce_expiration_date) < new Date()) {
      return res.status(400).json({
        error: "Continuing Education has expired",
        code: "CE_EXPIRED",
      });
    }

    // 2) Compliance requirement gates — every per-carrier requirement is
    //    enforced before the request is allowed to land.
    const reqs = await pool.query(
      `SELECT requirement_type, required_value FROM carrier_compliance_requirements WHERE carrier_id = $1`,
      [carrierId],
    );
    for (const r of reqs.rows) {
      if (r.requirement_type === "aml_training" && !profileRow?.aml_certificate_s3_key) {
        return res.status(400).json({
          error: "AML training certificate required for this carrier",
          code: "AML_REQUIRED",
        });
      }
      if (r.requirement_type === "eo_minimum") {
        // Helix BLOCK 1 — both sides are now in DOLLARS. The apply form stores
        // eo_coverage_amount as a dollar string (e.g. "1000000" = $1M) and the
        // founder modal now collects required_value in dollars too.
        const required = parseInt(String(r.required_value), 10);
        const have = parseInt(String(profileRow?.eo_coverage_amount || 0), 10);
        if (have < required) {
          return res.status(400).json({
            error: `E&O coverage must be at least $${required.toLocaleString()} (currently $${have.toLocaleString()})`,
            code: "EO_INSUFFICIENT",
          });
        }
        // Helix BLOCK 3 — having a $1M policy that expired last week is not
        // valid coverage. Reject expired or missing policies whenever the
        // carrier requires E&O.
        if (!profileRow?.eo_expiration_date || new Date(profileRow.eo_expiration_date) < new Date()) {
          return res.status(400).json({
            error: "Your E&O policy is missing or expired",
            code: "EO_EXPIRED",
          });
        }
      }
      if (r.requirement_type === "state_excluded" && Array.isArray(states)) {
        const excluded = String(r.required_value).split(",").map((s) => s.trim().toUpperCase());
        const violation = states.find((s: string) => excluded.includes(String(s).toUpperCase()));
        if (violation) {
          return res.status(400).json({
            error: `Carrier not authorized in ${violation}`,
            code: "STATE_EXCLUDED",
          });
        }
      }
      // background_check + training_module: ADVISORY in the modal — Helix
      // hasn't defined the per-agent fields yet so we don't gate on them.
    }
    // ─── End agency / compliance gating ─────────────────────────────────────

    const statesStr = states.map((s: string) => s.trim().toUpperCase().slice(0, 2)).join(",");
    const result = await pool.query(
      "INSERT INTO agent_contracting_requests (agent_user_id, carrier, states, status) VALUES ($1, $2, $3, 'draft') RETURNING *",
      [req.user!.id, carrier, statesStr]
    );
    const r = result.rows[0];
    res.json({ id: r.id, carrier: r.carrier, states: r.states.split(","), status: r.status, returnedReason: null, createdAt: r.created_at });
  } catch (e: any) {
    console.error("[AgentPortal] POST /requests", e.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

router.put("/requests/:id", async (req, res) => {
  try {
    const { status } = req.body;
    // Only allow agent to transition draft → awaiting_carrier
    if (status !== "awaiting_carrier") return res.status(400).json({ error: "Invalid status. Can only submit draft requests." });

    const result = await pool.query(
      "UPDATE agent_contracting_requests SET status = $1, updated_at = NOW() WHERE id = $2 AND agent_user_id::text = $3 AND status = 'draft'",
      [status, req.params.id, req.user!.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Request not found or already submitted" });
    res.json({ success: true });
  } catch (e: any) {
    console.error("[AgentPortal] PUT /requests", e.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

router.delete("/requests/:id", async (req, res) => {
  try {
    // Only allow deleting draft requests
    const result = await pool.query(
      "DELETE FROM agent_contracting_requests WHERE id = $1 AND agent_user_id::text = $2 AND status = 'draft'",
      [req.params.id, req.user!.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Request not found or cannot be deleted" });
    res.json({ success: true });
  } catch (e: any) {
    console.error("[AgentPortal] DELETE /requests", e.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
