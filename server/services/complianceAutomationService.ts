import { pool } from "../db";

export async function runComplianceChecks(): Promise<{ flagsCreated: number; flagsResolved: number }> {
  let flagsCreated = 0;
  let flagsResolved = 0;

  // Check 1: Licenses expiring within 90 days
  try {
    const expiring = await pool.query(
      `SELECT al.*, u.first_name, u.last_name FROM agent_licenses al
       JOIN users u ON u.id = al.user_id
       WHERE al.status = 'active' AND al.expiration_date IS NOT NULL
       AND al.expiration_date BETWEEN NOW() AND NOW() + INTERVAL '90 days'`
    );
    for (const lic of expiring.rows) {
      const days = Math.ceil((new Date(lic.expiration_date).getTime() - Date.now()) / 86400000);
      const severity = days <= 30 ? "critical" : days <= 60 ? "warning" : "info";
      await upsertFlag(lic.user_id, "license_expiring", severity, `${lic.state_code} License expires in ${days} days`, `License ${lic.license_number} for ${lic.first_name} ${lic.last_name}`, "agent_licenses", lic.id, lic.expiration_date);
      flagsCreated++;
    }
  } catch (e) { console.error("[Compliance] License check error:", e); }

  // Check 2: Contracting stalled > 14 days
  try {
    const stalled = await pool.query(
      `SELECT cc.*, u.first_name, u.last_name FROM contracting_checklists cc
       JOIN users u ON u.id = cc.agent_user_id
       WHERE cc.all_completed = false AND cc.created_at < NOW() - INTERVAL '14 days'`
    );
    for (const c of stalled.rows) {
      const days = Math.ceil((Date.now() - new Date(c.created_at).getTime()) / 86400000);
      await upsertFlag(c.agent_user_id, "contracting_stalled", "warning", `Contracting incomplete for ${days} days`, `${c.first_name} ${c.last_name}`, "contracting_checklists", c.id, null);
      flagsCreated++;
    }
  } catch (e) { console.error("[Compliance] Contracting check error:", e); }

  // Check 3: Agent inactive > 60 days
  try {
    const inactive = await pool.query(
      `SELECT u.id, u.first_name, u.last_name FROM users u
       WHERE u.role = 'sales_agent' AND u.is_active = true
       AND u.id NOT IN (
         SELECT DISTINCT agent_user_id FROM deals WHERE created_at > NOW() - INTERVAL '60 days'
         UNION SELECT DISTINCT agent_user_id FROM production_records WHERE created_at > NOW() - INTERVAL '60 days'
       )`
    );
    for (const agent of inactive.rows) {
      await upsertFlag(agent.id, "agent_inactive", "warning", `No activity in 60+ days`, `${agent.first_name} ${agent.last_name}`, "users", agent.id, null);
      flagsCreated++;
    }
  } catch (e) { console.error("[Compliance] Inactivity check error:", e); }

  // Auto-resolve: licenses that are no longer expiring soon (renewed)
  try {
    const resolved = await pool.query(
      `UPDATE compliance_flags SET status = 'resolved', resolved_at = NOW(), resolved_notes = 'Auto-resolved: condition cleared'
       WHERE status = 'open' AND flag_type = 'license_expiring' AND auto_generated = true
       AND related_id NOT IN (
         SELECT id::text FROM agent_licenses WHERE status = 'active' AND expiration_date BETWEEN NOW() AND NOW() + INTERVAL '90 days'
       ) RETURNING id`
    );
    flagsResolved = resolved.rowCount || 0;
  } catch (e) { console.error("[Compliance] Auto-resolve error:", e); }

  return { flagsCreated, flagsResolved };
}

async function upsertFlag(agentUserId: string, flagType: string, severity: string, title: string, description: string, relatedTable: string | null, relatedId: string | null, dueDate: string | null) {
  await pool.query(
    `INSERT INTO compliance_flags (id, agent_user_id, flag_type, severity, title, description, related_table, related_id, due_date, status, auto_generated, created_at, updated_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, 'open', true, NOW(), NOW())
     ON CONFLICT DO NOTHING`,
    [agentUserId, flagType, severity, title, description, relatedTable, relatedId, dueDate]
  );
}
