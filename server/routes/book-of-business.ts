/**
 * Book of Business API Routes
 * Aggregates client + policy data for the authenticated agent's book of business.
 *
 * Domain: Forge (Backend Systems Engineer)
 * Auth: requireAuth applied per-route (global attachUser populates req.user)
 */

import crypto from "crypto";
import { Router, type Request, type Response } from "express";
import { pool } from "../db";
import { storage } from "../storage";
import { requireAuth, type AuthenticatedUser } from "../middleware/auth";
import { recordCommissions } from "../services/commissionRecordService";

const router = Router();

// ============================================
// GET / — Full book of business for the authenticated agent
// Returns all policies where this agent is agent_id, joined with client user data
// ============================================

router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user! as AuthenticatedUser;

    // Fetch all policies where this agent is the agent_id, joined with client info
    const policiesResult = await pool.query(
      `SELECT p.id, p.policy_number, p.type, p.status, p.coverage_amount,
              p.monthly_premium, p.start_date, p.next_payment_date,
              p.beneficiary_name, p.beneficiary_relationship, p.beneficiaries,
              p.client_status, p.chargeback_at, p.chargeback_reason,
              p.last_contact_date, p.next_follow_up_date,
              p.commission_rate, p.draft_date, p.notes,
              p.agent_id, p.lead_id, p.carrier,
              p.client_details, p.state_code,
              p.created_at, p.updated_at, p.user_id,
              u.first_name AS client_first_name,
              u.last_name AS client_last_name,
              u.email AS client_email,
              u.phone AS client_phone,
              u.avatar_url AS client_avatar_url
       FROM policies p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.agent_id = $1
       ORDER BY p.created_at DESC`,
      [user.id],
    );

    // Normalize snake_case → camelCase for frontend consumption
    const clients = policiesResult.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      policyNumber: row.policy_number,
      type: row.type,
      policyType: row.type,
      status: row.status,
      coverageAmount: row.coverage_amount,
      monthlyPremium: parseFloat(row.monthly_premium) || 0,
      startDate: row.start_date,
      policyEffectiveDate: row.start_date,
      nextPaymentDate: row.next_payment_date,
      beneficiaryName: row.beneficiary_name,
      beneficiaryRelationship: row.beneficiary_relationship,
      beneficiaries: row.beneficiaries || [],
      clientStatus: row.client_status || "pending",
      chargebackAt: row.chargeback_at,
      chargebackDate: row.chargeback_at,
      chargebackReason: row.chargeback_reason,
      lastContactDate: row.last_contact_date,
      nextFollowUpDate: row.next_follow_up_date,
      commissionRate: row.commission_rate ? parseFloat(row.commission_rate) : null,
      draftDate: row.draft_date,
      notes: row.notes,
      agentId: row.agent_id,
      leadId: row.lead_id,
      carrier: row.carrier,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      addedDate: row.created_at,
      // Client info (from joined users table)
      name: row.client_first_name && row.client_last_name
        ? `${row.client_first_name} ${row.client_last_name}`
        : "Unknown Client",
      firstName: row.client_first_name,
      lastName: row.client_last_name,
      email: row.client_email,
      phone: row.client_phone,
      avatarUrl: row.client_avatar_url,
      stateCode: row.state_code,
      // Spread client details (SSN, address, banking, medical, ID)
      ...(row.client_details || {}),
    }));

    // Calculate stats
    const active = clients.filter(
      (c: any) => c.clientStatus === "active" || c.status === "active",
    );
    const chargebacks = clients.filter(
      (c: any) => c.clientStatus === "chargeback",
    );
    const totalMonthlyPremium = active.reduce(
      (sum: number, c: any) => sum + (c.monthlyPremium || 0),
      0,
    );

    const stats = {
      totalClients: clients.length,
      activePolicies: active.length,
      totalMonthlyPremium,
      totalAnnualPremium: totalMonthlyPremium * 12,
      chargebackCount: chargebacks.length,
    };

    res.json({ clients, stats });
  } catch (error: any) {
    console.error("[BookOfBusiness] Error fetching book:", error?.message);
    res.status(500).json({ error: "Failed to fetch book of business" });
  }
});

// ============================================
// POST / — Add a new client/policy to the book of business
// Creates a client user if needed, then creates the policy record
// ============================================

router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const agent = req.user! as AuthenticatedUser;

    const {
      name,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      streetAddress,
      city,
      state,
      zipCode,
      policyNumber,
      policyType,
      carrier,
      coverageAmount,
      monthlyPremium,
      commissionRate,
      draftDate,
      policyEffectiveDate,
      policyExpirationDate,
      notes,
      beneficiaries,
      clientStatus,
      ssn,
      idType,
      idNumber,
      idState,
      idExpiration,
      bankName,
      bankRoutingNumber,
      bankAccountNumber,
      medicalInfo,
    } = req.body;

    // Resolve first/last name from either separate fields or combined name
    let resolvedFirstName = firstName;
    let resolvedLastName = lastName;
    if (!resolvedFirstName && name) {
      const parts = name.trim().split(/\s+/);
      resolvedFirstName = parts[0] || "Unknown";
      resolvedLastName = parts.slice(1).join(" ") || "Client";
    }

    if (!resolvedFirstName || !policyType || !coverageAmount || !monthlyPremium) {
      return res.status(400).json({
        error: "Missing required fields: name (or firstName), policyType, coverageAmount, monthlyPremium",
      });
    }

    // 1. Find or create the client user
    let clientUser: any = null;
    if (email) {
      clientUser = await storage.getUserByEmail(email);
    }

    if (!clientUser) {
      // Create a new client user with a random password (they'll use invite flow)
      const bcrypt = await import("bcryptjs");
      const randomPassword = crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      clientUser = await storage.createUser({
        email: email || `client-${Date.now()}@placeholder.heritagels.org`,
        password: hashedPassword,
        firstName: resolvedFirstName,
        lastName: resolvedLastName || "Client",
        phone: phone || null,
        role: "client",
        assignedAgentId: agent.id,
        onboardingStatus: "pending",
      });
    } else {
      // Always update name and agent assignment to match submitted data
      await storage.updateUser(clientUser.id, {
        assignedAgentId: agent.id,
        firstName: resolvedFirstName,
        lastName: resolvedLastName || "Client",
        phone: phone || clientUser.phone,
      });
    }

    // 2. Generate policy number
    const generatedPolicyNumber =
      policyNumber || `HLS-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

    // 3. Create the policy record
    const policy = await storage.createPolicy({
      userId: clientUser.id,
      policyNumber: generatedPolicyNumber,
      type: policyType,
      carrier: carrier || null,
      status: clientStatus === "active" ? "active" : "pending_setup",
      coverageAmount: Number(coverageAmount),
      monthlyPremium: String(monthlyPremium),
      startDate: policyEffectiveDate ? new Date(policyEffectiveDate) : new Date(),
      nextPaymentDate: null,
      beneficiaryName: beneficiaries?.[0]?.name || null,
      beneficiaryRelationship: beneficiaries?.[0]?.relationship || null,
      beneficiaries: beneficiaries || [],
      agentId: agent.id,
      leadId: null,
      clientStatus: clientStatus || "pending",
      commissionRate: commissionRate ? String(commissionRate) : null,
      draftDate: draftDate || null,
      notes: notes || null,
    });

    // 3b. Store extended client details in JSONB column
    try {
      const clientDetails: any = {};
      if (dateOfBirth) clientDetails.dateOfBirth = dateOfBirth;
      if (ssn) clientDetails.ssn = ssn;
      if (streetAddress) clientDetails.streetAddress = streetAddress;
      if (city) clientDetails.city = city;
      if (state) clientDetails.state = state;
      if (zipCode) clientDetails.zipCode = zipCode;
      if (idType) clientDetails.idType = idType;
      if (idNumber) clientDetails.idNumber = idNumber;
      if (idState) clientDetails.idState = idState;
      if (idExpiration) clientDetails.idExpiration = idExpiration;
      if (bankName) clientDetails.bankName = bankName;
      if (bankRoutingNumber) clientDetails.bankRoutingNumber = bankRoutingNumber;
      if (bankAccountNumber) clientDetails.bankAccountNumber = bankAccountNumber;
      if (medicalInfo) clientDetails.medicalInfo = medicalInfo;

      if (Object.keys(clientDetails).length > 0) {
        await pool.query(
          'UPDATE policies SET client_details = $1, state_code = $2 WHERE id = $3',
          [JSON.stringify(clientDetails), state || null, policy.id]
        );
      }
    } catch (detailsErr: any) {
      console.warn('[BoB] Failed to save client details:', detailsErr?.message);
    }

    // 4. Record waterfall commissions if premium > 0
    const annualPremium = Number(monthlyPremium) * 12;
    if (annualPremium > 0) {
      recordCommissions(policy.id, agent.id, annualPremium).catch((err) =>
        console.error("[BookOfBusiness] Commission recording failed:", err),
      );
    }

    // 5. Notify client
    try {
      await storage.createNotification({
        userId: clientUser.id,
        title: "New Policy Added",
        message: `A new ${policyType} policy (${generatedPolicyNumber}) has been added to your account.`,
        type: "policy_update",
        isRead: false,
        actionUrl: "/client/policies",
      });
    } catch (notifErr) {
      console.error("[BookOfBusiness] Notification delivery failed:", notifErr);
    }

    // Auto-populate policy map from client's state
    const clientState = state || null;
    if (clientState) {
      try {
        await pool.query(`
          INSERT INTO agent_policies (user_id, state_code, client_name, carrier, coverage_type, status, premium_amount, coverage_amount, policy_number)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [agent.id, clientState, name || `${resolvedFirstName} ${resolvedLastName || 'Client'}`, carrier || null, policyType || 'term_life', clientStatus || 'pending',
            Math.round((Number(monthlyPremium) || 0) * 100), Math.round(Number(coverageAmount) || 0), generatedPolicyNumber || null]);
      } catch (err: any) {
        console.warn('[BoB] Auto-populate agent_policies failed:', err?.message);
      }
    }

    // Also store state_code in the policies table
    if (clientState) {
      try {
        await pool.query('UPDATE policies SET state_code = $1 WHERE id = $2', [clientState, policy.id]);
      } catch {}
    }

    console.log(
      `[BookOfBusiness] Policy created: ${generatedPolicyNumber} for client ${clientUser.id} by agent ${agent.id}`,
    );

    // Return enriched response matching GET format
    res.status(201).json({
      id: policy.id,
      userId: clientUser.id,
      policyNumber: policy.policyNumber,
      type: policy.type,
      policyType: policy.type,
      status: policy.status,
      coverageAmount: policy.coverageAmount,
      monthlyPremium: parseFloat(policy.monthlyPremium) || 0,
      startDate: policy.startDate,
      policyEffectiveDate: policy.startDate,
      carrier: policy.carrier,
      clientStatus: (policy as any).clientStatus || "pending",
      commissionRate: (policy as any).commissionRate
        ? parseFloat((policy as any).commissionRate)
        : null,
      draftDate: (policy as any).draftDate,
      notes: (policy as any).notes,
      beneficiaries: policy.beneficiaries || [],
      agentId: policy.agentId,
      createdAt: policy.createdAt,
      addedDate: policy.createdAt,
      name: `${resolvedFirstName} ${resolvedLastName || "Client"}`,
      firstName: resolvedFirstName,
      lastName: resolvedLastName || "Client",
      email: clientUser.email,
      phone: clientUser.phone,
    });
  } catch (error: any) {
    console.error("[BookOfBusiness] Error creating entry:", error?.message);
    if (error?.code === "23505") {
      return res.status(400).json({ error: "A policy with this number already exists" });
    }
    res.status(500).json({ error: "Failed to add client to book of business" });
  }
});

// ============================================
// PUT /:policyId/status — Update client/policy status
// Handles: pending → active, active → chargeback, chargeback → active
// ============================================

router.put("/:policyId/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const agent = req.user! as AuthenticatedUser;
    const { policyId } = req.params;
    const { status, chargebackReason } = req.body;

    if (!status || !["pending", "active", "chargeback"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Must be: pending, active, or chargeback",
      });
    }

    // Verify policy belongs to this agent
    const existing = await storage.getPolicyById(policyId);
    if (!existing) {
      return res.status(404).json({ error: "Policy not found" });
    }
    if (existing.agentId !== agent.id) {
      return res.status(403).json({ error: "Not authorized to modify this policy" });
    }

    // Build update payload
    const updateData: Record<string, any> = {
      clientStatus: status,
    };

    if (status === "chargeback") {
      updateData.chargebackAt = new Date();
      updateData.chargebackReason = chargebackReason || null;
    } else if (status === "active") {
      // If re-activating from chargeback, clear chargeback fields
      updateData.chargebackAt = null;
      updateData.chargebackReason = null;
      // Also set the policy status itself to active
      updateData.status = "active";
    }

    const updated = await storage.updatePolicy(policyId, updateData);

    // If activating, recalculate commissions
    if (status === "active" && updated) {
      const annualPremium = parseFloat(updated.monthlyPremium) * 12;
      if (annualPremium > 0) {
        recordCommissions(policyId, agent.id, annualPremium).catch((err) =>
          console.error("[BookOfBusiness] Commission recalculation failed:", err),
        );
      }
    }

    // Sync agent_policies status when activated
    if (status === 'active' && updated) {
      try {
        await pool.query(
          "UPDATE agent_policies SET status = 'active' WHERE user_id = $1 AND policy_number = $2",
          [agent.id, updated.policyNumber]
        );
      } catch {}
    }

    // Log to team activity feed when client is activated
    if (status === 'active') {
      try {
        const agentName = `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Agent';
        await pool.query(`
          INSERT INTO team_activity_feed (agent_user_id, agent_name, activity_type, title, message, metadata)
          VALUES ($1, $2, 'lead', 'Client Activated', $3, $4)
        `, [agent.id, agentName, `activated a new client`, JSON.stringify({ policyId })]);
      } catch {}
    }

    console.log(
      `[BookOfBusiness] Status updated: policy ${policyId} → ${status} by agent ${agent.id}`,
    );

    res.json(updated);
  } catch (error: any) {
    console.error("[BookOfBusiness] Error updating status:", error?.message);
    res.status(500).json({ error: "Failed to update policy status" });
  }
});

// ============================================
// PUT /:policyId — Update policy details (notes, contact dates, etc.)
// ============================================

router.put("/:policyId", requireAuth, async (req: Request, res: Response) => {
  try {
    const agent = req.user! as AuthenticatedUser;
    const { policyId } = req.params;

    // Verify policy belongs to this agent
    const existing = await storage.getPolicyById(policyId);
    if (!existing) {
      return res.status(404).json({ error: "Policy not found" });
    }
    if (existing.agentId !== agent.id) {
      return res.status(403).json({ error: "Not authorized to modify this policy" });
    }

    // Whitelist of updatable fields
    const allowedFields = [
      "type",
      "carrier",
      "status",
      "coverageAmount",
      "monthlyPremium",
      "startDate",
      "nextPaymentDate",
      "beneficiaryName",
      "beneficiaryRelationship",
      "beneficiaries",
      "policyNumber",
      "clientStatus",
      "commissionRate",
      "draftDate",
      "notes",
      "lastContactDate",
      "nextFollowUpDate",
    ];

    const updateData: Record<string, any> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === "startDate" || field === "nextPaymentDate" || field === "lastContactDate" || field === "nextFollowUpDate") {
          updateData[field] = req.body[field] ? new Date(req.body[field]) : null;
        } else if (field === "coverageAmount") {
          updateData[field] = Number(req.body[field]);
        } else if (field === "monthlyPremium" || field === "commissionRate") {
          updateData[field] = String(req.body[field]);
        } else if (field === "beneficiaries") {
          updateData[field] = Array.isArray(req.body[field]) ? req.body[field] : [];
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const updated = await storage.updatePolicy(policyId, updateData);

    // Recalculate commissions if premium changed
    if (updateData.monthlyPremium && updated) {
      const annualPremium = Number(updateData.monthlyPremium) * 12;
      if (annualPremium > 0) {
        recordCommissions(policyId, agent.id, annualPremium).catch((err) =>
          console.error("[BookOfBusiness] Commission recalculation failed:", err),
        );
      }
    }

    // Save extended client details (SSN, address, banking, medical, ID)
    const { ssn, streetAddress, city, state, zipCode, idType, idNumber, idState, idExpiration,
            bankName, bankRoutingNumber, bankAccountNumber, medicalInfo, dateOfBirth,
            firstName, lastName, name, email, phone } = req.body;
    try {
      const clientDetails: any = {};
      if (dateOfBirth) clientDetails.dateOfBirth = dateOfBirth;
      if (ssn) clientDetails.ssn = ssn;
      if (streetAddress) clientDetails.streetAddress = streetAddress;
      if (city) clientDetails.city = city;
      if (state) clientDetails.state = state;
      if (zipCode) clientDetails.zipCode = zipCode;
      if (idType) clientDetails.idType = idType;
      if (idNumber) clientDetails.idNumber = idNumber;
      if (idState) clientDetails.idState = idState;
      if (idExpiration) clientDetails.idExpiration = idExpiration;
      if (bankName) clientDetails.bankName = bankName;
      if (bankRoutingNumber) clientDetails.bankRoutingNumber = bankRoutingNumber;
      if (bankAccountNumber) clientDetails.bankAccountNumber = bankAccountNumber;
      if (medicalInfo) clientDetails.medicalInfo = medicalInfo;

      if (Object.keys(clientDetails).length > 0) {
        await pool.query(
          'UPDATE policies SET client_details = $1, state_code = COALESCE($2, state_code) WHERE id = $3',
          [JSON.stringify(clientDetails), state || null, policyId]
        );
      }
    } catch {}

    // Update client user name if provided
    if ((firstName || name) && existing.userId) {
      try {
        const resolvedFirst = firstName || (name ? name.split(' ')[0] : null);
        const resolvedLast = lastName || (name ? name.split(' ').slice(1).join(' ') : null);
        if (resolvedFirst) {
          await storage.updateUser(existing.userId, {
            firstName: resolvedFirst,
            lastName: resolvedLast || 'Client',
            phone: phone || undefined,
          });
        }
      } catch {}
    }

    // Auto-populate agent_policies for map
    const clientState = state || (existing as any).stateCode;
    if (clientState) {
      try {
        await pool.query(`
          INSERT INTO agent_policies (user_id, state_code, client_name, carrier, coverage_type, status, premium_amount, coverage_amount, policy_number)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT DO NOTHING
        `, [agent.id, clientState, name || `${firstName || ''} ${lastName || ''}`.trim(),
            updateData.carrier || existing.carrier, updateData.type || existing.type || 'term_life',
            updateData.clientStatus || (existing as any).clientStatus || 'active',
            Math.round((Number(updateData.monthlyPremium || existing.monthlyPremium) || 0) * 100),
            Math.round(Number(updateData.coverageAmount || existing.coverageAmount) || 0),
            updated?.policyNumber || existing.policyNumber]);
      } catch {}
    }

    console.log(`[BookOfBusiness] Policy updated: ${policyId} by agent ${agent.id}`);

    res.json(updated);
  } catch (error: any) {
    console.error("[BookOfBusiness] Error updating policy:", error?.message);
    res.status(500).json({ error: "Failed to update policy" });
  }
});

// ============================================
// POST /:policyId/activity — Log activity to a policy
// Types: call, text, email, meeting, note
// ============================================

router.post("/:policyId/activity", requireAuth, async (req: Request, res: Response) => {
  try {
    const agent = req.user! as AuthenticatedUser;
    const { policyId } = req.params;
    const { type, disposition, notes } = req.body;

    if (!type || !["call", "text", "email", "meeting", "note"].includes(type)) {
      return res.status(400).json({
        error: "Invalid activity type. Must be: call, text, email, meeting, or note",
      });
    }

    // Verify policy belongs to this agent
    const existing = await storage.getPolicyById(policyId);
    if (!existing) {
      return res.status(404).json({ error: "Policy not found" });
    }
    if (existing.agentId !== agent.id) {
      return res.status(403).json({ error: "Not authorized to log activity on this policy" });
    }

    // Store activity as a JSONB append to the policy's notes or a separate log
    // Since there's no dedicated activity table, we use a pool query to append
    // to a jsonb column. For now, use the notifications table as an activity log
    // and also update lastContactDate on the policy.
    const activityId = crypto.randomUUID();
    const activityRecord = {
      id: activityId,
      type,
      disposition: disposition || null,
      notes: notes || "",
      date: new Date().toISOString(),
      agentId: agent.id,
    };

    // Update policy's last contact date
    await storage.updatePolicy(policyId, {
      lastContactDate: new Date(),
    });

    // Store activity in a dedicated jsonb column or insert into notifications
    // Use a raw query to append to a jsonb array on the policy row
    // We'll store activities in a separate table-like approach via pool
    await pool.query(
      `INSERT INTO policy_activities (id, policy_id, agent_id, type, disposition, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT DO NOTHING`,
      [activityId, policyId, agent.id, type, disposition || null, notes || ""],
    ).catch(() => {
      // Table may not exist yet — silently skip, the activity is still returned
      console.warn("[BookOfBusiness] policy_activities table not available, activity logged in-memory only");
    });

    console.log(
      `[BookOfBusiness] Activity logged: ${type} on policy ${policyId} by agent ${agent.id}`,
    );

    res.status(201).json(activityRecord);
  } catch (error: any) {
    console.error("[BookOfBusiness] Error logging activity:", error?.message);
    res.status(500).json({ error: "Failed to log activity" });
  }
});

// ============================================
// GET /:policyId/activity — Get activity history for a policy
// ============================================

router.get("/:policyId/activity", requireAuth, async (req: Request, res: Response) => {
  try {
    const agent = req.user! as AuthenticatedUser;
    const { policyId } = req.params;

    // Verify policy belongs to this agent
    const existing = await storage.getPolicyById(policyId);
    if (!existing) {
      return res.status(404).json({ error: "Policy not found" });
    }
    if (existing.agentId !== agent.id) {
      return res.status(403).json({ error: "Not authorized to view this policy's activity" });
    }

    // Try to fetch from policy_activities table
    try {
      const result = await pool.query(
        `SELECT id, policy_id, agent_id, type, disposition, notes, created_at AS date
         FROM policy_activities
         WHERE policy_id = $1 AND agent_id = $2
         ORDER BY created_at DESC
         LIMIT 100`,
        [policyId, agent.id],
      );

      const activities = result.rows.map((row: any) => ({
        id: row.id,
        type: row.type,
        disposition: row.disposition,
        notes: row.notes,
        date: row.date,
        agentId: row.agent_id,
      }));

      res.json(activities);
    } catch {
      // Table doesn't exist yet — return empty
      res.json([]);
    }
  } catch (error: any) {
    console.error("[BookOfBusiness] Error fetching activity:", error?.message);
    res.status(500).json({ error: "Failed to fetch activity history" });
  }
});

// ============================================
// DELETE /:policyId — Remove a policy from the book of business
// ============================================

router.delete("/:policyId", requireAuth, async (req: Request, res: Response) => {
  try {
    const agent = req.user! as AuthenticatedUser;
    const { policyId } = req.params;

    // Verify policy belongs to this agent
    const existing = await storage.getPolicyById(policyId);
    if (!existing) {
      return res.status(404).json({ error: "Policy not found" });
    }
    if (existing.agentId !== agent.id) {
      return res.status(403).json({ error: "Not authorized to delete this policy" });
    }

    // Soft-delete by setting status to cancelled rather than hard-deleting
    await storage.updatePolicy(policyId, {
      status: "cancelled",
      clientStatus: "cancelled",
    });

    console.log(`[BookOfBusiness] Policy soft-deleted: ${policyId} by agent ${agent.id}`);

    res.status(204).send();
  } catch (error: any) {
    console.error("[BookOfBusiness] Error deleting policy:", error?.message);
    res.status(500).json({ error: "Failed to delete policy" });
  }
});

// =============================================================================
// Pending Deal Profiles — Deals submitted without a BoB client profile
// =============================================================================

router.get("/pending-deals", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const result = await pool.query(
      "SELECT * FROM pending_deal_profiles WHERE agent_user_id = $1 AND status = 'pending' ORDER BY created_at DESC",
      [user.id]
    );
    res.json({ pendingDeals: result.rows });
  } catch (error: any) {
    console.error("[BoB] Error fetching pending deals:", error?.message);
    res.status(500).json({ error: "Failed to fetch pending deals" });
  }
});

router.patch("/pending-deals/:id/complete", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    await pool.query(
      "UPDATE pending_deal_profiles SET status = 'completed', completed_at = NOW() WHERE id = $1 AND agent_user_id = $2",
      [req.params.id, user.id]
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error("[BoB] Error completing pending deal:", error?.message);
    res.status(500).json({ error: "Failed to complete pending deal" });
  }
});

export default router;
