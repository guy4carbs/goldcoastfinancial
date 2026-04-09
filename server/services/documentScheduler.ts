/**
 * Document Scheduler Service
 * Runs hourly to check for timezone-aware document triggers.
 *
 * Checks which clients are at 8 AM in their local timezone, then:
 * - Anniversary: generates annual statement + queues anniversary letter/review invitation
 * - Premium reminder: generates reminder 7 days before due date
 *
 * Uses the users.timezone field (IANA format, default America/Chicago).
 *
 * Governance: Relay (automation) + Forge (backend)
 */

import { pool } from "../db";
import { storage } from "../storage";
import { generateDocument, type AgentInfo, type ClientInfo, type PolicyInfo } from "./documentGeneratorService";
import { deliverDocument } from "./documentDeliveryService";

let schedulerInterval: ReturnType<typeof setInterval> | null = null;

// =============================================================================
// TIMEZONE HELPERS
// =============================================================================

/**
 * Get all unique timezones from users table that are currently at a target hour.
 * Uses PostgreSQL's AT TIME ZONE to do the conversion server-side.
 */
async function getTimezonesAtHour(targetHour: number): Promise<string[]> {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT COALESCE(timezone, 'America/Chicago') as tz
      FROM users
      WHERE role = 'client'
        AND is_active = true
        AND EXTRACT(HOUR FROM NOW() AT TIME ZONE COALESCE(timezone, 'America/Chicago')) = $1
    `, [targetHour]);
    return rows.map((r: any) => r.tz);
  } catch (err) {
    console.error("[DocScheduler] Failed to query timezones:", err);
    return [];
  }
}

// =============================================================================
// ANNIVERSARY CHECK
// =============================================================================

async function checkAnniversaries(timezones: string[]): Promise<void> {
  if (timezones.length === 0) return;

  try {
    // Find policies whose start_date month/day matches today, owned by clients in the target timezones
    const { rows: policies } = await pool.query(`
      SELECT p.id as policy_id, p.user_id, p.policy_number, p.type, p.carrier,
             p.coverage_amount, p.monthly_premium, p.start_date, p.next_payment_date,
             p.status, p.beneficiaries, p.beneficiary_name, p.beneficiary_relationship,
             u.first_name, u.last_name, u.email, u.phone, u.assigned_agent_id,
             COALESCE(u.timezone, 'America/Chicago') as client_tz
      FROM policies p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'active'
        AND EXTRACT(MONTH FROM p.start_date) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(DAY FROM p.start_date) = EXTRACT(DAY FROM CURRENT_DATE)
        AND COALESCE(u.timezone, 'America/Chicago') = ANY($1::text[])
    `, [timezones]);

    for (const pol of policies) {
      try {
        // Skip if we already sent today (check document_queue)
        const { rows: existing } = await pool.query(
          `SELECT id FROM document_queue WHERE template_key = 'annual_policy_statement' AND client_user_id = $1 AND policy_id = $2 AND created_at > CURRENT_DATE`,
          [pol.user_id, pol.policy_id]
        );
        if (existing.length > 0) continue;

        // Resolve agent
        const agentId = pol.assigned_agent_id;
        if (!agentId) continue;
        const agentUser = await storage.getUserById(agentId);
        if (!agentUser) continue;

        let agentNpn = "";
        try {
          const { rows: npnRows } = await pool.query("SELECT npn FROM agent_profiles WHERE user_id = $1", [agentId]);
          agentNpn = npnRows[0]?.npn || "";
        } catch {}

        const client: ClientInfo = { firstName: pol.first_name, lastName: pol.last_name, email: pol.email, phone: pol.phone };
        const agent: AgentInfo = { name: `${agentUser.firstName} ${agentUser.lastName}`, email: agentUser.email, phone: agentUser.phone || "", npn: agentNpn };
        const policy: PolicyInfo = {
          policyNumber: pol.policy_number, type: pol.type, carrier: pol.carrier || "", coverageAmount: Number(pol.coverage_amount),
          monthlyPremium: pol.monthly_premium, startDate: pol.start_date, nextPaymentDate: pol.next_payment_date,
          status: pol.status, beneficiaries: Array.isArray(pol.beneficiaries) ? pol.beneficiaries : [],
          beneficiaryName: pol.beneficiary_name, beneficiaryRelationship: pol.beneficiary_relationship,
        };

        // Auto-generate annual statement
        const buffer = await generateDocument({ templateKey: "annual_policy_statement", client, agent, policy });
        const fileName = `Annual Statement ${new Date().getFullYear()} - ${client.firstName} ${client.lastName}.pdf`;
        await deliverDocument({
          pdfBuffer: buffer, fileName, templateKey: "annual_policy_statement",
          client: { id: pol.user_id, ...client }, agent: { id: agentId, name: agent.name, email: agent.email },
          policyId: pol.policy_id, portalCategory: "statements",
          emailSubject: `Your Annual Policy Statement — ${new Date().getFullYear()}`,
          emailHtmlBody: `<p>Dear ${client.firstName},</p><p>Your annual policy statement for ${new Date().getFullYear()} is attached. You can also view it in your <a href="https://heritagels.org/client/documents" style="color:#7c3aed;">Client Portal</a>.</p>`,
          emailPlainText: `Dear ${client.firstName}, Your annual policy statement is attached. View at: https://heritagels.org/client/documents`,
        });

        // Queue anniversary letter + review invitation for agent approval
        for (const key of ["policy_anniversary_letter", "annual_review_invitation"]) {
          await pool.query(
            `INSERT INTO document_queue (template_key, client_user_id, agent_user_id, policy_id, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, 'pending_review', NOW(), NOW())`,
            [key, pol.user_id, agentId, pol.policy_id]
          );
        }

        console.log(`[DocScheduler] Anniversary docs processed for ${client.firstName} ${client.lastName} (${pol.policy_number})`);
      } catch (err) {
        console.error(`[DocScheduler] Anniversary processing failed for policy ${pol.policy_id}:`, err);
      }
    }
  } catch (err) {
    console.error("[DocScheduler] Anniversary check failed:", err);
  }
}

// =============================================================================
// PREMIUM REMINDER CHECK
// =============================================================================

async function checkPremiumReminders(timezones: string[]): Promise<void> {
  if (timezones.length === 0) return;

  try {
    // Find policies with next_payment_date = 7 days from now
    const { rows: policies } = await pool.query(`
      SELECT p.id as policy_id, p.user_id, p.policy_number, p.type, p.carrier,
             p.coverage_amount, p.monthly_premium, p.start_date, p.next_payment_date,
             p.status, p.beneficiaries, p.beneficiary_name, p.beneficiary_relationship,
             u.first_name, u.last_name, u.email, u.phone, u.assigned_agent_id,
             COALESCE(u.timezone, 'America/Chicago') as client_tz
      FROM policies p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'active'
        AND p.next_payment_date IS NOT NULL
        AND DATE(p.next_payment_date) = CURRENT_DATE + INTERVAL '7 days'
        AND COALESCE(u.timezone, 'America/Chicago') = ANY($1::text[])
    `, [timezones]);

    for (const pol of policies) {
      try {
        // Skip if already sent
        const { rows: existing } = await pool.query(
          `SELECT id FROM document_queue WHERE template_key = 'premium_payment_reminder' AND client_user_id = $1 AND policy_id = $2 AND created_at > CURRENT_DATE`,
          [pol.user_id, pol.policy_id]
        );
        if (existing.length > 0) continue;

        const agentId = pol.assigned_agent_id;
        if (!agentId) continue;
        const agentUser = await storage.getUserById(agentId);
        if (!agentUser) continue;

        let agentNpn = "";
        try {
          const { rows: npnRows } = await pool.query("SELECT npn FROM agent_profiles WHERE user_id = $1", [agentId]);
          agentNpn = npnRows[0]?.npn || "";
        } catch {}

        const client: ClientInfo = { firstName: pol.first_name, lastName: pol.last_name, email: pol.email, phone: pol.phone };
        const agent: AgentInfo = { name: `${agentUser.firstName} ${agentUser.lastName}`, email: agentUser.email, phone: agentUser.phone || "", npn: agentNpn };
        const policy: PolicyInfo = {
          policyNumber: pol.policy_number, type: pol.type, carrier: pol.carrier || "", coverageAmount: Number(pol.coverage_amount),
          monthlyPremium: pol.monthly_premium, startDate: pol.start_date, nextPaymentDate: pol.next_payment_date,
          status: pol.status, beneficiaries: Array.isArray(pol.beneficiaries) ? pol.beneficiaries : [],
          beneficiaryName: pol.beneficiary_name, beneficiaryRelationship: pol.beneficiary_relationship,
        };

        const dueDate = new Date(pol.next_payment_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
        const buffer = await generateDocument({ templateKey: "premium_payment_reminder", client, agent, policy });
        const fileName = `Premium Reminder - ${client.firstName} ${client.lastName}.pdf`;
        await deliverDocument({
          pdfBuffer: buffer, fileName, templateKey: "premium_payment_reminder",
          client: { id: pol.user_id, ...client }, agent: { id: agentId, name: agent.name, email: agent.email },
          policyId: pol.policy_id, portalCategory: "billing",
          emailSubject: `Premium Payment Reminder — Due ${dueDate}`,
          emailHtmlBody: `<p>Dear ${client.firstName},</p><p>This is a friendly reminder that your ${pol.type} premium of $${pol.monthly_premium} is due on <strong>${dueDate}</strong>. Details are attached.</p><p>View in your <a href="https://heritagels.org/client/billing" style="color:#7c3aed;">Client Portal</a>.</p>`,
          emailPlainText: `Dear ${client.firstName}, Your premium of $${pol.monthly_premium} is due on ${dueDate}. View: https://heritagels.org/client/billing`,
        });

        console.log(`[DocScheduler] Premium reminder sent for ${client.firstName} ${client.lastName} (due ${dueDate})`);
      } catch (err) {
        console.error(`[DocScheduler] Premium reminder failed for policy ${pol.policy_id}:`, err);
      }
    }
  } catch (err) {
    console.error("[DocScheduler] Premium reminder check failed:", err);
  }
}

// =============================================================================
// MAIN SCHEDULER
// =============================================================================

async function runScheduledChecks(): Promise<void> {
  console.log("[DocScheduler] Running hourly document checks...");

  // Find timezones currently at 8 AM
  const timezones = await getTimezonesAtHour(8);
  if (timezones.length === 0) {
    console.log("[DocScheduler] No client timezones at 8 AM right now — skipping");
    return;
  }

  console.log(`[DocScheduler] Timezones at 8 AM: ${timezones.join(", ")}`);

  await Promise.all([
    checkAnniversaries(timezones),
    checkPremiumReminders(timezones),
  ]);

  console.log("[DocScheduler] Hourly checks complete");
}

/**
 * Start the hourly document scheduler.
 * Call once at server startup.
 */
export function startDocumentScheduler(): void {
  if (schedulerInterval) return;

  // Run every hour (3600000ms)
  schedulerInterval = setInterval(() => {
    runScheduledChecks().catch(err => console.error("[DocScheduler] Unhandled error:", err));
  }, 60 * 60 * 1000);

  // Run once on startup after a 30-second delay (let DB connections warm up)
  setTimeout(() => {
    runScheduledChecks().catch(err => console.error("[DocScheduler] Startup check failed:", err));
  }, 30000);

  console.log("[DocScheduler] Hourly document scheduler started");
}

/**
 * Stop the scheduler (for graceful shutdown).
 */
export function stopDocumentScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("[DocScheduler] Document scheduler stopped");
  }
}
