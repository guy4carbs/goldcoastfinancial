/**
 * Post-Close Workflow API Routes
 * Tracks and drives the post-close process after a lead is converted to a client
 */
import { Router, Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { pool } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { Roles } from "../types/permissions";
import { sendPortalMessage, sendPostCloseWelcomeEmail } from "../gmail";
import { sendSms, isSmsAvailable } from "../services/smsService";
import { recordCommissions } from "../services/commissionRecordService";
import { queueAiWelcomeCall, schedulePostCloseFollowup, addJob } from "../services/jobQueue";
import { isAiCallAvailable, parseRetellWebhook } from "../services/aiCallService";
import { convertLeadToClient } from "../services/leadConversionService";
import { storage } from "../storage";

const router = Router();

router.use(requireAuth);
router.use(requireRole(Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER, Roles.SALES_AGENT));

// =============================================================================
// HELPERS
// =============================================================================

function normalizeProductType(type: string | null): string {
  if (!type) return 'term_life';
  const t = type.toLowerCase().replace(/[\s-]+/g, '_');
  const map: Record<string, string> = {
    term: 'term_life', term_life: 'term_life',
    whole: 'whole_life', whole_life: 'whole_life',
    iul: 'iul', indexed_universal: 'iul', indexed_universal_life: 'iul',
    final_expense: 'final_expense', final: 'final_expense',
    mortgage_protection: 'mortgage_protection', mortgage: 'mortgage_protection',
    annuity: 'annuity',
  };
  return map[t] || 'term_life';
}

const DEFAULT_COMMISSION_RATES: Record<string, { firstYear: number; renewal: number }> = {
  term_life: { firstYear: 0.80, renewal: 0.04 },
  whole_life: { firstYear: 1.00, renewal: 0.05 },
  iul: { firstYear: 1.10, renewal: 0.05 },
  final_expense: { firstYear: 1.10, renewal: 0.05 },
  mortgage_protection: { firstYear: 0.90, renewal: 0.04 },
  annuity: { firstYear: 0.06, renewal: 0.02 },
};

const CROSS_SELL_MAP: Record<string, Array<{ product: string; reason: string; priority: 'high' | 'medium' | 'low' }>> = {
  term_life: [
    { product: 'Whole Life', reason: 'Permanent coverage that builds cash value', priority: 'high' },
    { product: 'IUL', reason: 'Tax-advantaged growth with market-linked returns', priority: 'medium' },
    { product: 'Annuity', reason: 'Retirement income planning', priority: 'medium' },
    { product: 'Final Expense', reason: 'Cover end-of-life costs separately', priority: 'low' },
  ],
  whole_life: [
    { product: 'Term Life', reason: 'Additional temporary coverage at lower cost', priority: 'high' },
    { product: 'Annuity', reason: 'Diversify retirement planning', priority: 'medium' },
    { product: 'IUL', reason: 'Higher growth potential with indexed returns', priority: 'medium' },
  ],
  iul: [
    { product: 'Term Life', reason: 'Supplemental coverage at lower cost', priority: 'medium' },
    { product: 'Annuity', reason: 'Guaranteed income stream for retirement', priority: 'high' },
    { product: 'Final Expense', reason: 'Dedicated burial/funeral coverage', priority: 'low' },
  ],
  final_expense: [
    { product: 'Term Life', reason: 'Income replacement for family protection', priority: 'high' },
    { product: 'Whole Life', reason: 'Build cash value while staying covered', priority: 'medium' },
    { product: 'Annuity', reason: 'Retirement income security', priority: 'medium' },
  ],
  mortgage_protection: [
    { product: 'Term Life', reason: 'Broader family income protection', priority: 'high' },
    { product: 'Whole Life', reason: 'Lifelong coverage beyond mortgage payoff', priority: 'medium' },
    { product: 'Final Expense', reason: 'Cover end-of-life costs', priority: 'low' },
  ],
  annuity: [
    { product: 'Term Life', reason: 'Life insurance protection for beneficiaries', priority: 'high' },
    { product: 'Whole Life', reason: 'Permanent life coverage with cash value', priority: 'high' },
    { product: 'IUL', reason: 'Life insurance with market-linked growth', priority: 'medium' },
  ],
};

// =============================================================================
// GET /pending — all incomplete workflows for this agent
// =============================================================================
router.get("/pending", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const result = await pool.query(`
      SELECT pcw.*,
             l.first_name as lead_first_name, l.last_name as lead_last_name,
             l.email as lead_email, l.phone as lead_phone,
             l.coverage_type, l.estimated_value,
             p.policy_number, p.type as policy_type, p.coverage_amount, p.carrier,
             p.monthly_premium, p.status as policy_status
      FROM post_close_workflows pcw
      LEFT JOIN leads l ON l.id::text = pcw.lead_id
      LEFT JOIN policies p ON p.id::text = pcw.policy_id
      WHERE pcw.agent_user_id = $1::text AND pcw.status != 'completed'
      ORDER BY pcw.created_at DESC
    `, [userId]);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("[PostClose] Error fetching pending workflows:", error);
    res.status(500).json({ success: false, message: "Failed to fetch workflows" });
  }
});

// =============================================================================
// POST /create — start a new closing from client info provided by the agent
// =============================================================================
router.post("/create", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const { firstName, lastName, email, phone, coverageType, carrier, coverageAmount, monthlyPremium } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ success: false, message: "First and last name are required" });
    }

    // Strip formatting from currency/phone values
    const cleanAmount = coverageAmount ? String(coverageAmount).replace(/[$,\s]/g, '') : null;
    const cleanPremium = monthlyPremium ? String(monthlyPremium).replace(/[$,\s]/g, '') : null;

    // 1. Create a lead record for this client
    // email defaults to a placeholder if not provided (column is NOT NULL)
    const clientEmail = email?.trim() || `${firstName.toLowerCase().replace(/\s/g, '')}.${lastName.toLowerCase().replace(/\s/g, '')}.${Date.now()}@placeholder.heritagels.org`;

    const leadResult = await pool.query(`
      INSERT INTO leads (first_name, last_name, email, phone, coverage_type,
        estimated_value, status, assigned_to, won_date, source, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'won', $7, NOW(), 'closing_page', NOW(), NOW())
      RETURNING id
    `, [firstName, lastName, clientEmail, phone || null, coverageType || null,
        cleanAmount ? parseInt(cleanAmount) : null, userId]);

    const leadId = leadResult.rows[0].id;

    // Set pipeline_stage if column exists (added via Drizzle push)
    try {
      await pool.query(`UPDATE leads SET pipeline_stage = 'placed' WHERE id = $1`, [leadId]);
    } catch (_) { /* column may not exist in older schemas */ }

    // 2. Convert lead to client — ALWAYS create a user so they appear on My Clients page
    let clientUserId: string | null = null;
    let policyId: string | null = null;

    try {
      // Try full conversion first (creates user + policy + conversation)
      if (email?.trim()) {
        const convResult = await convertLeadToClient(leadId.toString(), userId);
        if (convResult.success) {
          clientUserId = convResult.clientUserId || null;
          policyId = convResult.policyId || null;
        }
      }

      // If conversion didn't create a user (no email or conversion failed), create one directly
      if (!clientUserId) {
        const bcrypt = await import("bcryptjs");
        const tempPassword = crypto.randomUUID();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Check if user already exists by email
        let existingUser = email?.trim() ? await storage.getUserByEmail(email.trim()) : null;

        if (existingUser) {
          clientUserId = existingUser.id;
          // Update name and assignment
          await storage.updateUser(existingUser.id, {
            firstName: firstName,
            lastName: lastName,
            assignedAgentId: userId,
            phone: phone || existingUser.phone,
          });
        } else {
          const newUser = await storage.createUser({
            email: clientEmail,
            password: hashedPassword,
            firstName: firstName || 'Unknown',
            lastName: lastName || 'Client',
            phone: phone || null,
            role: 'client',
            assignedAgentId: userId,
            onboardingStatus: 'pending',
          } as any);
          clientUserId = newUser.id;
        }
      }

      // Create a policy if one wasn't created by conversion
      if (!policyId && clientUserId) {
        const genPolicyNumber = `HLS-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
        const policyResult = await pool.query(`
          INSERT INTO policies (user_id, agent_id, policy_number, type, carrier, coverage_amount, monthly_premium, status, start_date, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending_setup', NOW(), NOW(), NOW())
          RETURNING id
        `, [clientUserId, userId, genPolicyNumber, coverageType || 'IUL', carrier || null,
            cleanAmount ? parseInt(cleanAmount) : 0, cleanPremium || '0']);
        policyId = policyResult.rows[0]?.id || null;
      }

      // Update policy with provided details if it already existed
      if (policyId && (carrier || cleanAmount || cleanPremium || coverageType)) {
        const setClauses: string[] = ['updated_at = NOW()'];
        const params: any[] = [];
        let idx = 1;

        if (carrier) { setClauses.push(`carrier = $${idx}`); params.push(carrier); idx++; }
        if (cleanAmount) { setClauses.push(`coverage_amount = $${idx}`); params.push(parseInt(cleanAmount)); idx++; }
        if (cleanPremium) { setClauses.push(`monthly_premium = $${idx}`); params.push(cleanPremium); idx++; }
        if (coverageType) { setClauses.push(`type = $${idx}`); params.push(coverageType); idx++; }

        if (setClauses.length > 1) {
          params.push(policyId);
          await pool.query(
            `UPDATE policies SET ${setClauses.join(', ')} WHERE id = $${idx}::uuid`,
            params
          );
        }
      }
    } catch (convErr) {
      console.error("[PostClose] Client/policy creation failed (non-blocking):", convErr);
    }

    // 3. Create the post-close workflow (or fetch if conversion already created one)
    let wfRow;
    const existingWf = await pool.query(
      `SELECT * FROM post_close_workflows WHERE lead_id = $1::text AND agent_user_id = $2::text LIMIT 1`,
      [leadId, userId]
    );

    if (existingWf.rows.length > 0) {
      wfRow = existingWf.rows[0];
    } else {
      const wfResult = await pool.query(`
        INSERT INTO post_close_workflows (lead_id, agent_user_id, client_user_id, policy_id, status)
        VALUES ($1::text, $2, $3, $4, 'pending')
        RETURNING *
      `, [leadId.toString(), userId, clientUserId, policyId]);
      wfRow = wfResult.rows[0];
    }

    res.json({ success: true, data: { ...wfRow, lead_id: leadId.toString() } });
  } catch (error: any) {
    console.error("[PostClose] Error creating workflow:", error?.message || error);
    console.error("[PostClose] Stack:", error?.stack);
    res.status(500).json({ success: false, message: "Failed to create workflow", detail: error?.message });
  }
});

// =============================================================================
// POST /:leadId/finalize-policy — complete policy setup for client portal
// =============================================================================
router.post("/:leadId/finalize-policy", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { leadId } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const { carrier, policyNumber, type, coverageAmount, monthlyPremium,
            policyEffectiveDate, draftDate, beneficiaries, commissionRate, notes } = req.body;

    console.log("[PostClose] finalize-policy received beneficiaries:", JSON.stringify(beneficiaries));

    // Get workflow to find policy_id and client_user_id
    const wfResult = await pool.query(
      `SELECT * FROM post_close_workflows WHERE lead_id = $1 AND agent_user_id = $2::text LIMIT 1`,
      [leadId, userId]
    );
    if (wfResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Workflow not found" });
    }

    const wf = wfResult.rows[0];
    const policyId = wf.policy_id;
    const clientUserId = wf.client_user_id;

    // 1. Update the policy with full details
    if (policyId) {
      // Determine primary beneficiary for legacy columns
      const primaryBen = Array.isArray(beneficiaries) && beneficiaries.length > 0
        ? beneficiaries.reduce((a: any, b: any) => (b.percentage > a.percentage ? b : a), beneficiaries[0])
        : null;

      // Compute next payment date from draft date
      let nextPaymentDate: Date | null = null;
      if (draftDate) {
        const draftDay = Math.min(parseInt(draftDate) || 1, 28);
        const now = new Date();
        nextPaymentDate = new Date(now.getFullYear(), now.getMonth(), draftDay);
        if (nextPaymentDate <= now) {
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        }
      }

      const setClauses: string[] = ["status = 'active'", "updated_at = NOW()"];
      const params: any[] = [];
      let idx = 1;

      if (carrier) { setClauses.push(`carrier = $${idx}`); params.push(carrier); idx++; }
      if (policyNumber) { setClauses.push(`policy_number = $${idx}`); params.push(policyNumber); idx++; }
      if (type) { setClauses.push(`type = $${idx}`); params.push(type); idx++; }
      if (coverageAmount) { setClauses.push(`coverage_amount = $${idx}`); params.push(parseInt(coverageAmount)); idx++; }
      if (monthlyPremium) { setClauses.push(`monthly_premium = $${idx}`); params.push(String(monthlyPremium)); idx++; }
      if (policyEffectiveDate) { setClauses.push(`start_date = $${idx}`); params.push(new Date(policyEffectiveDate)); idx++; }
      if (nextPaymentDate) { setClauses.push(`next_payment_date = $${idx}`); params.push(nextPaymentDate); idx++; }
      if (primaryBen) {
        setClauses.push(`beneficiary_name = $${idx}`); params.push(primaryBen.name); idx++;
        setClauses.push(`beneficiary_relationship = $${idx}`); params.push(primaryBen.relationship); idx++;
      }
      if (Array.isArray(beneficiaries)) {
        setClauses.push(`beneficiaries = $${idx}::jsonb`); params.push(JSON.stringify(beneficiaries)); idx++;
      }

      params.push(policyId);
      await pool.query(
        `UPDATE policies SET ${setClauses.join(', ')} WHERE id = $${idx}::uuid`,
        params
      );

      // 2. Create initial billing record
      if (monthlyPremium && monthlyPremium > 0 && clientUserId && nextPaymentDate) {
        try {
          await pool.query(`
            INSERT INTO billing_history (user_id, policy_id, amount, status, payment_date, payment_method, created_at)
            VALUES ($1::uuid, $2::uuid, $3, 'upcoming', $4, 'auto', NOW())
          `, [clientUserId, policyId, String(monthlyPremium), nextPaymentDate]);
        } catch (billErr) {
          console.error("[PostClose] Billing record creation failed (non-blocking):", billErr);
        }
      }
    }

    // 3. Update user onboarding status
    if (clientUserId) {
      try {
        await pool.query(
          `UPDATE users SET onboarding_status = 'portal_ready', updated_at = NOW() WHERE id = $1::uuid`,
          [clientUserId]
        );
      } catch (onbErr) {
        console.error("[PostClose] Onboarding status update failed (non-blocking):", onbErr);
      }

      // 4. Send notification to client
      try {
        await pool.query(`
          INSERT INTO notifications (user_id, title, message, type, action_url, created_at)
          VALUES ($1::uuid, 'Your Policy is Active', 'Your insurance policy details have been finalized. Log in to view your coverage, documents, and more.', 'policy_update', '/client/policies', NOW())
        `, [clientUserId]);
      } catch (notifErr) {
        console.error("[PostClose] Client notification failed (non-blocking):", notifErr);
      }
    }

    // 5. Calculate and record waterfall commissions
    if (policyId && monthlyPremium && parseFloat(monthlyPremium) > 0) {
      const annualPremium = parseFloat(monthlyPremium) * 12;
      recordCommissions(policyId, userId, annualPremium, "policy").catch((err) =>
        console.error("[PostClose] Commission recording failed:", err)
      );
    }

    // 6. Auto-populate policy map from lead's state
    try {
      const leadResult = await pool.query(
        `SELECT first_name, last_name, state FROM leads WHERE id::text = $1 LIMIT 1`,
        [leadId]
      );
      const lead = leadResult.rows[0];
      if (lead?.state) {
        const productTypeNorm = normalizeProductType(type || null);
        await pool.query(`
          INSERT INTO agent_policies (user_id, state_code, client_name, carrier, coverage_type, status, premium_amount, coverage_amount, policy_number)
          VALUES ($1, $2, $3, $4, $5, 'active', $6, $7, $8)
        `, [userId, lead.state, `${lead.first_name || ''} ${lead.last_name || ''}`.trim(),
            carrier || null, productTypeNorm,
            Math.round((parseFloat(monthlyPremium) || 0) * 100), Math.round(parseFloat(coverageAmount) || 0), policyNumber || null]);
      }
    } catch (err: any) {
      console.warn('[PostClose] Auto-populate agent_policies failed:', err?.message);
    }

    // 7. Mark workflow step complete
    await pool.query(`
      UPDATE post_close_workflows SET book_of_business_updated_at = NOW(), updated_at = NOW()
      WHERE lead_id = $1 AND agent_user_id = $2::text
    `, [leadId, userId]);

    res.json({ success: true, message: "Policy finalized and client portal updated" });
  } catch (error: any) {
    console.error("[PostClose] Error finalizing policy:", error?.message, error?.stack);
    res.status(500).json({ success: false, message: "Failed to finalize policy", detail: error?.message });
  }
});

// =============================================================================
// POST /:leadId/save-document — save a Firebase-uploaded document record
// =============================================================================
router.post("/:leadId/save-document", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { leadId } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const { name, url, path, category, fileSize, policyId } = req.body;
    if (!name || !url) {
      return res.status(400).json({ success: false, message: "name and url are required" });
    }

    // Get client_user_id from workflow
    const wfResult = await pool.query(
      `SELECT client_user_id FROM post_close_workflows WHERE lead_id = $1 AND agent_user_id = $2::text LIMIT 1`,
      [leadId, userId]
    );
    if (wfResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Workflow not found" });
    }

    const clientUserId = wfResult.rows[0].client_user_id;
    if (!clientUserId) {
      return res.status(400).json({ success: false, message: "No client user associated with this workflow" });
    }

    // Insert document record — use the Firebase URL as s3_key (reusing the column)
    await pool.query(`
      INSERT INTO documents (user_id, policy_id, name, type, category, file_size, s3_key, uploaded_by, uploaded_at)
      VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8::uuid, NOW())
    `, [
      clientUserId,
      policyId || null,
      name,
      'application/octet-stream',
      category || 'policy',
      fileSize || '0KB',
      url,  // Store Firebase URL in s3_key column
      userId,
    ]);

    res.json({ success: true, message: "Document saved" });
  } catch (error: any) {
    console.error("[PostClose] Error saving document:", error?.message);
    res.status(500).json({ success: false, message: "Failed to save document", detail: error?.message });
  }
});

// =============================================================================
// GET /:leadId — full workflow status for one lead
// =============================================================================
router.get("/:leadId", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { leadId } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const result = await pool.query(`
      SELECT pcw.*,
             l.first_name as lead_first_name, l.last_name as lead_last_name,
             l.email as lead_email, l.phone as lead_phone,
             l.coverage_type, l.estimated_value, l.city, l.state,
             p.policy_number, p.type as policy_type, p.coverage_amount, p.carrier,
             p.monthly_premium, p.status as policy_status,
             u.first_name as client_first_name, u.last_name as client_last_name,
             u.email as client_email
      FROM post_close_workflows pcw
      LEFT JOIN leads l ON l.id::text = pcw.lead_id
      LEFT JOIN policies p ON p.id::text = pcw.policy_id
      LEFT JOIN users u ON u.id::text = pcw.client_user_id
      WHERE pcw.lead_id = $1 AND pcw.agent_user_id = $2::text
      LIMIT 1
    `, [leadId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Workflow not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("[PostClose] Error fetching workflow:", error);
    res.status(500).json({ success: false, message: "Failed to fetch workflow" });
  }
});

// =============================================================================
// POST /:leadId/launch — Single-trigger: email + SMS + AI call + follow-ups + NPS
// =============================================================================
router.post("/:leadId/launch", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { leadId } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    // 1. Fetch workflow + lead + agent data
    const wfResult = await pool.query(`
      SELECT pcw.*,
             l.first_name, l.last_name, l.email as lead_email, l.phone as lead_phone,
             l.coverage_type,
             u.first_name as agent_first, u.last_name as agent_last, u.phone as agent_phone, u.email as agent_email
      FROM post_close_workflows pcw
      LEFT JOIN leads l ON l.id::text = pcw.lead_id
      LEFT JOIN users u ON u.id = $2::uuid
      WHERE pcw.lead_id = $1 AND pcw.agent_user_id = $2::text
    `, [leadId, userId]);

    if (wfResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Workflow not found" });
    }

    const wf = wfResult.rows[0];

    // Guard: don't re-launch
    if (wf.workflow_started_at) {
      return res.status(409).json({ success: false, message: "Workflow already launched" });
    }

    const clientName = `${wf.first_name || ''} ${wf.last_name || ''}`.trim();
    const agentName = `${wf.agent_first || ''} ${wf.agent_last || ''}`.trim();
    const appUrl = process.env.APP_URL || 'https://heritagels.org';

    const actions = { email: false, sms: false, aiCall: false, followUps: false, nps: false, welcomeKit: false };

    // 2. Set up client account with temporary password
    let tempPassword: string | null = null;
    if (wf.client_user_id) {
      try {
        // Generate readable temp password: HLS- + 6 random alphanumeric chars
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        tempPassword = 'HLS-' + Array.from(crypto.randomBytes(6)).map(b => chars[b % chars.length]).join('');
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        await pool.query(`
          UPDATE users SET password = $1, password_reset_required = true, updated_at = NOW()
          WHERE id = $2::uuid
        `, [hashedPassword, wf.client_user_id]);

        console.log(`[PostClose] Temp password set for client ${wf.client_user_id}`);
      } catch (pwErr) {
        console.error("[PostClose] Temp password setup failed (non-blocking):", pwErr);
        tempPassword = null;
      }
    }

    // 3. Send welcome email (branded HTML with credentials)
    try {
      if (wf.lead_email && !wf.lead_email.includes('@placeholder.')) {
        await sendPostCloseWelcomeEmail({
          clientFirstName: wf.first_name || 'there',
          clientEmail: wf.lead_email,
          coverageType: wf.coverage_type || 'life insurance',
          agentName: agentName || 'Heritage Life Solutions',
          agentEmail: wf.agent_email || 'contact@heritagels.org',
          agentPhone: wf.agent_phone || undefined,
          portalUrl: appUrl,
          tempPassword: tempPassword || undefined,
        });
        actions.email = true;
      }
    } catch (emailErr) {
      console.error("[PostClose] Welcome email failed (non-blocking):", emailErr);
    }

    // 3. Send welcome SMS
    if (wf.lead_phone && isSmsAvailable()) {
      try {
        await sendSms(
          wf.lead_phone,
          `Congratulations ${wf.first_name}! 🎉 Welcome to Heritage Life Solutions. Your coverage is all set! Set up your Client Portal to manage your policy: ${appUrl}/client/login — Your agent, ${agentName}`
        );
        actions.sms = true;
      } catch (smsErr) {
        console.error("[PostClose] Welcome SMS failed (non-blocking):", smsErr);
      }
    }

    // 4. Queue AI welcome call (2-4 min delay)
    let aiCallJobId: string | null = null;
    if (wf.lead_phone && isAiCallAvailable()) {
      try {
        const delayMs = 120000 + Math.floor(Math.random() * 120000); // 2-4 min
        const job = await queueAiWelcomeCall({
          leadId,
          workflowId: wf.id,
          clientPhone: wf.lead_phone,
          clientFirstName: wf.first_name || 'there',
          agentName: agentName || 'Heritage Life Solutions',
          coverageType: wf.coverage_type || undefined,
        }, delayMs);
        if (job) {
          aiCallJobId = job.id || null;
          actions.aiCall = true;
        }
      } catch (callErr) {
        console.error("[PostClose] AI call queue failed (non-blocking):", callErr);
      }
    }

    // 5. Schedule 30/60/90 day follow-ups
    try {
      const now = new Date();
      const followUps = [
        { type: '30_day', days: 30, title: `Check in with ${clientName} — 30-day review` },
        { type: '60_day', days: 60, title: `Follow up with ${clientName} — 60-day check-in` },
        { type: '90_day', days: 90, title: `${clientName} 90-day review — retention check + cross-sell opportunity` },
      ];

      for (const fu of followUps) {
        const scheduledFor = new Date(now.getTime() + fu.days * 24 * 60 * 60 * 1000);

        await pool.query(`
          INSERT INTO post_close_follow_ups (workflow_id, lead_id, agent_user_id, client_user_id, follow_up_type, scheduled_for)
          VALUES ($1::uuid, $2, $3::uuid, $4, $5, $6)
        `, [wf.id, leadId, userId, wf.client_user_id, fu.type, scheduledFor]);

        await schedulePostCloseFollowup({
          leadId,
          agentUserId: userId,
          followUpType: fu.type,
          title: fu.title,
          clientName,
        }, scheduledFor);
      }
      actions.followUps = true;
    } catch (fuErr) {
      console.error("[PostClose] Follow-up scheduling failed (non-blocking):", fuErr);
    }

    // 6. Schedule NPS survey (7 days)
    try {
      if (wf.lead_phone && isSmsAvailable()) {
        const npsDelay = 7 * 24 * 60 * 60 * 1000;
        const npsMessage = `Hi ${wf.first_name}! How was your experience with Heritage Life Solutions? Reply 1-10. Your feedback helps us serve you better!`;
        await addJob('notifications', 'notification:sms', {
          to: wf.lead_phone,
          message: npsMessage,
          type: 'nps_survey',
          leadId,
          workflowId: wf.id,
        }, { delay: npsDelay });
        actions.nps = true;
      }
    } catch (npsErr) {
      console.error("[PostClose] NPS scheduling failed (non-blocking):", npsErr);
    }

    // 6b. Generate Welcome Kit (5 branded PDFs — fire and forget)
    try {
      if (wf.client_user_id && wf.policy_id) {
        const { generateAndDeliverWelcomeKit } = require("../services/documentDeliveryService");
        generateAndDeliverWelcomeKit({
          clientUserId: wf.client_user_id,
          policyId: wf.policy_id,
          agentUserId: userId,
        }).catch((err: any) => console.error("[PostClose] Welcome kit failed (non-blocking):", err));
        actions.welcomeKit = true;
      }
    } catch (kitErr) {
      console.error("[PostClose] Welcome kit init failed:", kitErr);
    }

    // 7. Update workflow record with all timestamps
    const setClauses: string[] = ['workflow_started_at = NOW()', "status = 'in_progress'", 'updated_at = NOW()'];
    const params: any[] = [leadId, userId];
    let paramIdx = 3;

    if (actions.email) setClauses.push('welcome_email_sent_at = NOW()');
    if (actions.sms) setClauses.push('welcome_sms_sent_at = NOW()');
    if (actions.aiCall) {
      setClauses.push(`ai_call_scheduled_at = NOW(), ai_call_job_id = $${paramIdx}`);
      params.push(aiCallJobId);
      paramIdx++;
    }
    if (actions.nps) setClauses.push('nps_scheduled_at = NOW()');

    await pool.query(
      `UPDATE post_close_workflows SET ${setClauses.join(', ')} WHERE lead_id = $1 AND agent_user_id = $2::text`,
      params
    );

    // 8. Return updated workflow
    const updatedResult = await pool.query(`
      SELECT pcw.*,
             l.first_name as lead_first_name, l.last_name as lead_last_name,
             l.email as lead_email, l.phone as lead_phone,
             l.coverage_type, l.estimated_value, l.city, l.state,
             p.policy_number, p.type as policy_type, p.coverage_amount, p.carrier,
             p.monthly_premium, p.status as policy_status
      FROM post_close_workflows pcw
      LEFT JOIN leads l ON l.id::text = pcw.lead_id
      LEFT JOIN policies p ON p.id::text = pcw.policy_id
      WHERE pcw.lead_id = $1 AND pcw.agent_user_id = $2::text
    `, [leadId, userId]);

    res.json({
      success: true,
      data: updatedResult.rows[0],
      actions,
      message: "Workflow launched successfully",
    });
  } catch (error: any) {
    console.error("[PostClose] Error launching workflow:", error?.message, error?.stack);
    res.status(500).json({ success: false, message: "Failed to launch workflow", detail: error?.message });
  }
});

// =============================================================================
// POST /:leadId/start — begin the workflow (legacy, kept for backward compat)
// =============================================================================
router.post("/:leadId/start", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { leadId } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const result = await pool.query(`
      UPDATE post_close_workflows
      SET workflow_started_at = NOW(), status = 'in_progress', updated_at = NOW()
      WHERE lead_id = $1 AND agent_user_id = $2::text
      RETURNING *
    `, [leadId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Workflow not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("[PostClose] Error starting workflow:", error);
    res.status(500).json({ success: false, message: "Failed to start workflow" });
  }
});

// =============================================================================
// POST /:leadId/send-welcome-email — send/resend welcome email (legacy)
// =============================================================================
router.post("/:leadId/send-welcome-email", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { leadId } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const wfResult = await pool.query(`
      SELECT pcw.*, l.first_name, l.last_name, l.email as lead_email,
             l.coverage_type,
             u.first_name as agent_first, u.last_name as agent_last, u.phone as agent_phone
      FROM post_close_workflows pcw
      LEFT JOIN leads l ON l.id::text = pcw.lead_id
      LEFT JOIN users u ON u.id = $2::uuid
      WHERE pcw.lead_id = $1 AND pcw.agent_user_id = $2::text
    `, [leadId, userId]);

    if (wfResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Workflow not found" });
    }

    const wf = wfResult.rows[0];
    const clientName = `${wf.first_name || ''} ${wf.last_name || ''}`.trim();
    const agentName = `${wf.agent_first || ''} ${wf.agent_last || ''}`.trim();
    const appUrl = process.env.APP_URL || 'https://heritagels.org';

    await sendPortalMessage({
      senderName: agentName || 'Heritage Life Solutions',
      senderEmail: 'noreply@heritagels.org',
      recipientEmail: wf.lead_email,
      recipientName: clientName,
      subject: `Congratulations ${wf.first_name}! Welcome to Heritage Life Solutions`,
      message: `Hi ${wf.first_name},\n\nCongratulations on securing your financial future with Heritage Life Solutions! We are honored that you chose us for your ${wf.coverage_type || 'life insurance'} coverage.\n\nYour dedicated agent, ${agentName}, will be with you every step of the way.\n\nHere's what happens next:\n\n1. Set up your Client Portal to view your policy, documents, and more\n2. Your agent will review your policy details to ensure everything is perfect\n3. You'll have access to our full suite of client services\n\nLog in to your Client Portal: ${appUrl}/client/login\n\nIf you have any questions, reach out to ${agentName}${wf.agent_phone ? ` at ${wf.agent_phone}` : ''} or reply to this email.\n\nWelcome to the Heritage family!\n\nBest regards,\n${agentName}\nHeritage Life Solutions`,
    });

    await pool.query(`
      UPDATE post_close_workflows
      SET welcome_email_sent_at = NOW(), updated_at = NOW()
      WHERE lead_id = $1 AND agent_user_id = $2::text
    `, [leadId, userId]);

    res.json({ success: true, message: "Welcome email sent" });
  } catch (error) {
    console.error("[PostClose] Error sending welcome email:", error);
    res.status(500).json({ success: false, message: "Failed to send welcome email" });
  }
});

// =============================================================================
// POST /:leadId/send-welcome-sms — send congratulations text (legacy)
// =============================================================================
router.post("/:leadId/send-welcome-sms", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { leadId } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    if (!isSmsAvailable()) {
      return res.status(503).json({ success: false, message: "SMS service not configured" });
    }

    const wfResult = await pool.query(`
      SELECT pcw.*, l.first_name, l.last_name, l.phone as lead_phone,
             u.first_name as agent_first, u.last_name as agent_last
      FROM post_close_workflows pcw
      LEFT JOIN leads l ON l.id::text = pcw.lead_id
      LEFT JOIN users u ON u.id = $2::uuid
      WHERE pcw.lead_id = $1 AND pcw.agent_user_id = $2::text
    `, [leadId, userId]);

    if (wfResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Workflow not found" });
    }

    const wf = wfResult.rows[0];
    if (!wf.lead_phone) {
      return res.status(400).json({ success: false, message: "Client has no phone number on file" });
    }

    const agentName = `${wf.agent_first || ''} ${wf.agent_last || ''}`.trim();
    const appUrl = process.env.APP_URL || 'https://heritagels.org';

    await sendSms(
      wf.lead_phone,
      `Congratulations ${wf.first_name}! 🎉 Welcome to Heritage Life Solutions. Your coverage is all set! Set up your Client Portal to manage your policy: ${appUrl}/client/login — Your agent, ${agentName}`
    );

    await pool.query(`
      UPDATE post_close_workflows
      SET welcome_sms_sent_at = NOW(), updated_at = NOW()
      WHERE lead_id = $1 AND agent_user_id = $2::text
    `, [leadId, userId]);

    res.json({ success: true, message: "Welcome SMS sent" });
  } catch (error) {
    console.error("[PostClose] Error sending welcome SMS:", error);
    res.status(500).json({ success: false, message: "Failed to send SMS" });
  }
});

// =============================================================================
// GET /:leadId/commission-preview — estimated first-year commission
// =============================================================================
router.get("/:leadId/commission-preview", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { leadId } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const result = await pool.query(`
      SELECT p.type as policy_type, p.monthly_premium, p.coverage_amount, p.carrier,
             l.coverage_type
      FROM post_close_workflows pcw
      LEFT JOIN policies p ON p.id::text = pcw.policy_id
      LEFT JOIN leads l ON l.id::text = pcw.lead_id
      WHERE pcw.lead_id = $1 AND pcw.agent_user_id = $2::text
    `, [leadId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Workflow not found" });
    }

    const { policy_type, monthly_premium, coverage_amount, carrier, coverage_type } = result.rows[0];
    const productKey = normalizeProductType(policy_type || coverage_type);
    const rates = DEFAULT_COMMISSION_RATES[productKey] || DEFAULT_COMMISSION_RATES.term_life;
    const annualPremium = (parseFloat(monthly_premium) || 0) * 12;
    const firstYearCommission = Math.round(annualPremium * rates.firstYear * 100) / 100;
    const renewalCommission = Math.round(annualPremium * rates.renewal * 100) / 100;

    res.json({
      success: true,
      data: {
        productType: productKey,
        monthlyPremium: parseFloat(monthly_premium) || 0,
        annualPremium,
        coverageAmount: coverage_amount || 0,
        carrier: carrier || 'Unknown',
        firstYearRate: rates.firstYear,
        renewalRate: rates.renewal,
        estimatedFirstYearCommission: firstYearCommission,
        estimatedRenewalCommission: renewalCommission,
        disclaimer: "Estimates based on default rates. Actual commissions may vary by carrier.",
      },
    });
  } catch (error) {
    console.error("[PostClose] Error calculating commission preview:", error);
    res.status(500).json({ success: false, message: "Failed to calculate commission preview" });
  }
});

// =============================================================================
// GET /:leadId/cross-sell — coverage gap recommendations
// =============================================================================
router.get("/:leadId/cross-sell", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { leadId } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const result = await pool.query(`
      SELECT l.coverage_type, l.first_name,
             p.type as policy_type, p.coverage_amount
      FROM post_close_workflows pcw
      LEFT JOIN leads l ON l.id::text = pcw.lead_id
      LEFT JOIN policies p ON p.id::text = pcw.policy_id
      WHERE pcw.lead_id = $1 AND pcw.agent_user_id = $2::text
    `, [leadId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Workflow not found" });
    }

    const { coverage_type, policy_type, coverage_amount, first_name } = result.rows[0];
    const currentType = normalizeProductType(policy_type || coverage_type);
    const recommendations = CROSS_SELL_MAP[currentType] || [];

    res.json({
      success: true,
      data: {
        currentCoverage: currentType,
        coverageAmount: coverage_amount || 0,
        clientName: first_name || 'Client',
        recommendations,
      },
    });
  } catch (error) {
    console.error("[PostClose] Error generating cross-sell:", error);
    res.status(500).json({ success: false, message: "Failed to generate recommendations" });
  }
});

// =============================================================================
// GET /:leadId/follow-ups — 30/60/90 day follow-up status
// =============================================================================
router.get("/:leadId/follow-ups", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { leadId } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const result = await pool.query(`
      SELECT fu.*
      FROM post_close_follow_ups fu
      WHERE fu.lead_id = $1 AND fu.agent_user_id = $2::uuid
      ORDER BY fu.scheduled_for ASC
    `, [leadId, userId]);

    const now = new Date();
    const overdue = result.rows.filter(
      (r: any) => r.status === 'scheduled' && new Date(r.scheduled_for) < now
    );

    const autoActivated = result.rows.some((r: any) => r.auto_send_enabled);

    res.json({
      success: true,
      data: {
        followUps: result.rows,
        overdueCount: overdue.length,
        nextDue: result.rows.find((r: any) => r.status === 'scheduled') || null,
        autoActivated,
      },
    });
  } catch (error) {
    console.error("[PostClose] Error fetching follow-ups:", error);
    res.status(500).json({ success: false, message: "Failed to fetch follow-ups" });
  }
});

// =============================================================================
// POST /:leadId/activate-auto-followups — enable automated email + SMS for all follow-ups
// =============================================================================
router.post("/:leadId/activate-auto-followups", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { leadId } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    // Get workflow + lead + agent info
    const wfResult = await pool.query(`
      SELECT pcw.*, l.first_name, l.last_name, l.email as lead_email, l.phone as lead_phone,
             l.coverage_type,
             u.first_name as agent_first, u.last_name as agent_last, u.email as agent_email, u.phone as agent_phone
      FROM post_close_workflows pcw
      LEFT JOIN leads l ON l.id::text = pcw.lead_id
      LEFT JOIN users u ON u.id = $2::uuid
      WHERE pcw.lead_id = $1 AND pcw.agent_user_id = $2::text
    `, [leadId, userId]);

    if (wfResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Workflow not found" });
    }

    const wf = wfResult.rows[0];
    const clientName = `${wf.first_name || ''} ${wf.last_name || ''}`.trim();
    const agentName = `${wf.agent_first || ''} ${wf.agent_last || ''}`.trim();
    const appUrl = process.env.APP_URL || 'https://heritagels.org';

    // Get all pending follow-ups
    const followUps = await pool.query(`
      SELECT * FROM post_close_follow_ups
      WHERE lead_id = $1 AND agent_user_id = $2::uuid AND status = 'scheduled'
      ORDER BY scheduled_for ASC
    `, [leadId, userId]);

    // Schedule email + SMS for each follow-up using BullMQ
    const followUpMessages: Record<string, { subject: string; emailBody: string; smsBody: string }> = {
      '30_day': {
        subject: `${wf.first_name}, Your 30-Day Policy Check-In`,
        emailBody: `Hi ${wf.first_name},\n\nIt's been 30 days since you started your ${wf.coverage_type || 'life insurance'} coverage with Heritage Life Solutions! I wanted to check in and make sure everything is going smoothly.\n\nHere are a few things to review:\n- Have you set up your Client Portal? Log in at ${appUrl}/client/login\n- Do you have any questions about your coverage?\n- Have your beneficiary details changed?\n\nI'm here to help with anything you need. Don't hesitate to reach out!\n\nBest regards,\n${agentName}\nHeritage Life Solutions`,
        smsBody: `Hi ${wf.first_name}! It's your 30-day check-in from Heritage Life Solutions. How's everything going with your coverage? Any questions? Log in to your portal: ${appUrl}/client/login — ${agentName}`,
      },
      '60_day': {
        subject: `${wf.first_name}, Your 60-Day Coverage Review`,
        emailBody: `Hi ${wf.first_name},\n\nHard to believe it's been 60 days! I hope you're feeling great about your ${wf.coverage_type || 'life insurance'} coverage.\n\nThis is a great time to:\n- Review your coverage amount — has anything changed in your life?\n- Check your beneficiary designations are up to date\n- Consider if additional coverage might benefit your family\n\nYour Client Portal has all your policy details: ${appUrl}/client/login\n\nLet me know if you'd like to schedule a quick review call!\n\nBest regards,\n${agentName}\nHeritage Life Solutions`,
        smsBody: `Hi ${wf.first_name}! 60-day check-in from Heritage Life Solutions. Everything still looking good with your coverage? Need any changes? I'm here to help! — ${agentName}`,
      },
      '90_day': {
        subject: `${wf.first_name}, Your 90-Day Policy Review & Cross-Sell Opportunity`,
        emailBody: `Hi ${wf.first_name},\n\nCongratulations on 90 days of coverage with Heritage Life Solutions! Your ${wf.coverage_type || 'life insurance'} policy is working hard to protect your family.\n\nAt the 90-day mark, I'd love to discuss:\n- Are you fully covered? Many families benefit from additional protection\n- Retirement planning options like IULs and annuities\n- Coverage for other family members\n\nI'd also love to ask — do you know anyone who could benefit from the same protection you have? Referrals are the highest compliment!\n\nLog in to your portal anytime: ${appUrl}/client/login\n\nLet's schedule a quick call to review your full financial picture.\n\nBest regards,\n${agentName}\nHeritage Life Solutions`,
        smsBody: `Hi ${wf.first_name}! 90 days with Heritage Life Solutions! Time for a coverage review. Want to make sure your family is fully protected. Let's chat! — ${agentName}`,
      },
    };

    let scheduled = 0;
    for (const fu of followUps.rows) {
      const msg = followUpMessages[fu.follow_up_type];
      if (!msg) continue;

      const delayMs = new Date(fu.scheduled_for).getTime() - Date.now();
      if (delayMs <= 0) continue; // Skip past-due ones

      // Schedule email
      if (wf.lead_email && !wf.lead_email.includes('@placeholder.')) {
        try {
          await addJob('email', 'email:send', {
            type: 'follow_up',
            followUpId: fu.id,
            leadId,
            to: wf.lead_email,
            subject: msg.subject,
            body: msg.emailBody,
            agentName,
            agentEmail: wf.agent_email || 'contact@heritagels.org',
            agentPhone: wf.agent_phone || '',
            clientFirstName: wf.first_name,
            coverageType: wf.coverage_type || 'life insurance',
            portalUrl: appUrl,
            followUpType: fu.follow_up_type,
          }, { delay: delayMs });
        } catch (e) {
          console.error(`[PostClose] Failed to schedule follow-up email for ${fu.follow_up_type}:`, e);
        }
      }

      // Schedule SMS
      if (wf.lead_phone && isSmsAvailable()) {
        try {
          await addJob('notifications', 'notification:sms', {
            type: 'follow_up',
            followUpId: fu.id,
            to: wf.lead_phone,
            message: msg.smsBody,
          }, { delay: delayMs });
        } catch (e) {
          console.error(`[PostClose] Failed to schedule follow-up SMS for ${fu.follow_up_type}:`, e);
        }
      }

      // Mark as auto-send enabled
      await pool.query(
        `UPDATE post_close_follow_ups SET auto_send_enabled = true WHERE id = $1::uuid`,
        [fu.id]
      );
      scheduled++;
    }

    res.json({
      success: true,
      message: `Auto follow-ups activated: ${scheduled} scheduled`,
      scheduled,
    });
  } catch (error: any) {
    console.error("[PostClose] Error activating auto follow-ups:", error?.message);
    res.status(500).json({ success: false, message: "Failed to activate auto follow-ups", detail: error?.message });
  }
});

// =============================================================================
// PATCH /:leadId/follow-up/:followUpId — complete a follow-up
// =============================================================================
router.patch("/:leadId/follow-up/:followUpId", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { leadId, followUpId } = req.params;
    const { notes } = req.body;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const result = await pool.query(`
      UPDATE post_close_follow_ups
      SET status = 'completed', completed_at = NOW(), notes = $4
      WHERE id = $1::uuid AND lead_id = $2 AND agent_user_id = $3::uuid
      RETURNING *
    `, [followUpId, leadId, userId, notes || null]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Follow-up not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("[PostClose] Error completing follow-up:", error);
    res.status(500).json({ success: false, message: "Failed to complete follow-up" });
  }
});

// =============================================================================
// POST /:leadId/send-referral-ask — send referral ask SMS to client
// =============================================================================
router.post("/:leadId/send-referral-ask", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { leadId } = req.params;
    const { message } = req.body;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const wfResult = await pool.query(`
      SELECT pcw.*, l.first_name, l.phone as lead_phone,
             u.first_name as agent_first, u.last_name as agent_last
      FROM post_close_workflows pcw
      LEFT JOIN leads l ON l.id::text = pcw.lead_id
      LEFT JOIN users u ON u.id = $2::uuid
      WHERE pcw.lead_id = $1 AND pcw.agent_user_id = $2::text
    `, [leadId, userId]);

    if (wfResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Workflow not found" });
    }

    const wf = wfResult.rows[0];
    const agentName = `${wf.agent_first || ''} ${wf.agent_last || ''}`.trim();
    const appUrl = process.env.APP_URL || 'https://heritagels.org';
    let smsSent = false;

    // Try to send SMS if available and phone exists
    if (wf.lead_phone && isSmsAvailable()) {
      try {
        const defaultMessage = `Hi ${wf.first_name}! I'm glad we could help you get covered. If you know anyone who could benefit from the same protection, I'd love to help them too! You can share this link: ${appUrl}/refer — ${agentName}, Heritage Life Solutions`;
        await sendSms(wf.lead_phone, message || defaultMessage);
        smsSent = true;
      } catch (smsErr: any) {
        console.error("[PostClose] Referral SMS failed (non-blocking):", smsErr?.message);
      }
    }

    // Mark referral asked regardless of SMS success
    await pool.query(`
      UPDATE post_close_workflows
      SET referral_asked_at = NOW(), updated_at = NOW()
      WHERE lead_id = $1 AND agent_user_id = $2::text
    `, [leadId, userId]);

    res.json({ success: true, message: smsSent ? "Referral ask sent" : "Referral marked (SMS not available)", smsSent });
  } catch (error: any) {
    console.error("[PostClose] Error sending referral ask:", error?.message, error?.stack);
    res.status(500).json({ success: false, message: "Failed to send referral ask", detail: error?.message });
  }
});

// =============================================================================
// PATCH /:leadId/step — mark a workflow step complete
// =============================================================================
router.patch("/:leadId/step", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { leadId } = req.params;
    const { step, notes } = req.body;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const stepColumnMap: Record<string, string> = {
      book_of_business: 'book_of_business_updated_at',
      details_verified: 'details_verified_at',
      referral_asked: 'referral_asked_at',
    };

    const column = stepColumnMap[step];
    if (!column) {
      return res.status(400).json({ success: false, message: "Invalid step. Use: book_of_business, details_verified, referral_asked" });
    }

    let extraSql = '';
    const params: any[] = [leadId, userId];

    if (step === 'details_verified') {
      if (notes) {
        extraSql = ', verification_notes = $3';
        params.push(notes);
      }
      // Progress onboarding status to 'active'
      const wfCheck = await pool.query(
        `SELECT client_user_id FROM post_close_workflows WHERE lead_id = $1 AND agent_user_id = $2::text`,
        [leadId, userId]
      );
      if (wfCheck.rows[0]?.client_user_id) {
        await pool.query(
          `UPDATE users SET onboarding_status = 'active', updated_at = NOW() WHERE id = $1::uuid`,
          [wfCheck.rows[0].client_user_id]
        );
      }
    }

    await pool.query(`
      UPDATE post_close_workflows
      SET ${column} = NOW(), updated_at = NOW()${extraSql}
      WHERE lead_id = $1 AND agent_user_id = $2::text
    `, params);

    // Check if all non-AI steps are complete → mark workflow completed
    const checkResult = await pool.query(`
      SELECT workflow_started_at, welcome_email_sent_at, welcome_sms_sent_at,
             book_of_business_updated_at, details_verified_at
      FROM post_close_workflows
      WHERE lead_id = $1 AND agent_user_id = $2::text
    `, [leadId, userId]);

    if (checkResult.rows.length > 0) {
      const wfCheck = checkResult.rows[0];
      const allDone = wfCheck.workflow_started_at && wfCheck.welcome_email_sent_at
        && wfCheck.welcome_sms_sent_at && wfCheck.book_of_business_updated_at
        && wfCheck.details_verified_at;

      if (allDone) {
        await pool.query(`
          UPDATE post_close_workflows
          SET status = 'completed', completed_at = NOW(), updated_at = NOW()
          WHERE lead_id = $1 AND agent_user_id = $2::text
        `, [leadId, userId]);
      }
    }

    const result = await pool.query(`
      SELECT * FROM post_close_workflows WHERE lead_id = $1 AND agent_user_id = $2::text
    `, [leadId, userId]);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("[PostClose] Error updating step:", error);
    res.status(500).json({ success: false, message: "Failed to update step" });
  }
});

// =============================================================================
// GET /:leadId/client-status — check client onboarding state
// =============================================================================
router.get("/:leadId/client-status", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { leadId } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const wfResult = await pool.query(`
      SELECT client_user_id, policy_id FROM post_close_workflows
      WHERE lead_id = $1 AND agent_user_id = $2::text
    `, [leadId, userId]);

    if (wfResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Workflow not found" });
    }

    const { client_user_id, policy_id } = wfResult.rows[0];
    if (!client_user_id) {
      return res.json({
        success: true,
        data: { passwordSet: false, hasLoggedIn: false, documentCount: 0, policyStatus: 'unknown', onboardingStatus: 'pending' },
      });
    }

    // Parallel queries for status data
    const [userResult, docResult, polResult, billingResult] = await Promise.all([
      pool.query(`SELECT password_reset_required, last_login_at, onboarding_status FROM users WHERE id = $1::uuid`, [client_user_id]),
      pool.query(`SELECT COUNT(*)::int as count FROM documents WHERE user_id = $1::uuid`, [client_user_id]),
      policy_id
        ? pool.query(`SELECT status, carrier, monthly_premium, start_date, beneficiary_name, beneficiaries FROM policies WHERE id = $1::uuid`, [policy_id])
        : Promise.resolve({ rows: [] }),
      policy_id
        ? pool.query(`SELECT COUNT(*)::int as count FROM billing_history WHERE policy_id = $1::uuid`, [policy_id])
        : Promise.resolve({ rows: [{ count: 0 }] }),
    ]);

    const user = userResult.rows[0];
    const policy = polResult.rows[0];
    const documentCount = docResult.rows[0]?.count || 0;
    const billingCount = billingResult.rows[0]?.count || 0;

    // Data-driven verification checks
    const policyComplete = !!(
      policy &&
      policy.status === 'active' &&
      policy.carrier &&
      parseFloat(policy.monthly_premium) > 0 &&
      policy.start_date
    );

    const beneficiaries = policy?.beneficiaries;
    const hasBeneficiaries = !!(
      (Array.isArray(beneficiaries) && beneficiaries.length > 0) ||
      policy?.beneficiary_name
    );

    const missingFields: string[] = [];
    if (!policy?.carrier) missingFields.push('carrier');
    if (!policy || parseFloat(policy.monthly_premium || '0') <= 0) missingFields.push('monthly premium');
    if (!policy?.start_date) missingFields.push('effective date');
    if (policy?.status !== 'active') missingFields.push('policy activation');
    if (!hasBeneficiaries) missingFields.push('beneficiaries');
    if (documentCount === 0) missingFields.push('documents');
    if (billingCount === 0) missingFields.push('billing');

    res.json({
      success: true,
      data: {
        passwordSet: user ? !user.password_reset_required : false,
        hasLoggedIn: user?.last_login_at != null,
        documentCount,
        policyStatus: policy?.status || 'unknown',
        onboardingStatus: user?.onboarding_status || 'pending',
        policyComplete,
        hasBeneficiaries,
        hasBilling: billingCount > 0,
        missingFields,
      },
    });
  } catch (error) {
    console.error("[PostClose] Error fetching client status:", error);
    res.status(500).json({ success: false, message: "Failed to fetch client status" });
  }
});

// =============================================================================
// WEBHOOK ROUTER — no auth (receives callbacks from Retell AI)
// =============================================================================
export const postCloseWebhookRouter = Router();

postCloseWebhookRouter.post("/ai-call-webhook", async (req: Request, res: Response) => {
  try {
    const update = parseRetellWebhook(req.body);
    if (!update) {
      return res.status(400).json({ success: false, message: "Invalid webhook payload" });
    }

    if (update.status === 'completed') {
      await pool.query(`
        UPDATE post_close_workflows
        SET ai_call_completed_at = NOW(), updated_at = NOW()
        WHERE ai_call_job_id = $1
      `, [update.callId]);
      console.log(`[PostClose] AI call completed: ${update.callId}`);
    }

    if (update.status === 'failed' || update.status === 'no_answer') {
      console.warn(`[PostClose] AI call ${update.callId} status: ${update.status}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("[PostClose] AI call webhook error:", error);
    res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
});

export default router;
