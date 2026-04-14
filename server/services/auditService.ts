import { pool } from "../db";

export async function logAudit(userId: string | null, action: string, entityType?: string, entityId?: string, metadata?: any, ipAddress?: string) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, metadata, ip_address, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())`,
      [userId, action, entityType || null, entityId || null, metadata ? JSON.stringify(metadata) : null, ipAddress || null]
    );
  } catch (e) {
    console.error("[Audit] Failed to log:", action, e);
  }
}

export const logLogin = (userId: string, ip?: string) => logAudit(userId, "login", "user", userId, null, ip);
export const logLogout = (userId: string) => logAudit(userId, "logout", "user", userId);
export const logAgentApproved = (userId: string, agentId: string, by: string) => logAudit(by, "agent_approved", "agent", agentId, { userId });
export const logAgentRejected = (userId: string, agentId: string, by: string, reason?: string) => logAudit(by, "agent_rejected", "agent", agentId, { userId, reason });
export const logPipelineMove = (by: string, agentId: string, from: string, to: string) => logAudit(by, "pipeline_move", "agent", agentId, { from, to });
export const logDocumentSigned = (agentId: string, docType: string) => logAudit(agentId, "document_signed", "document", docType, { agentId });
export const logComplianceCheck = (flagsCreated: number, flagsResolved: number) => logAudit(null, "compliance_check", "system", null, { flagsCreated, flagsResolved });
