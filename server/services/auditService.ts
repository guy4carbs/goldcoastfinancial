import { db } from '../db';
import { auditLogs, type InsertAuditLog, type AuditAction } from '@shared/schema';
import type { Request } from 'express';
import type { PoolClient } from 'pg';

/**
 * Audit Service
 * Provides persistent audit logging for security-sensitive operations
 */

interface AuditContext {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Extract audit context from an Express request
 */
export function getAuditContext(req: Request): AuditContext {
  const forwarded = req.headers['x-forwarded-for'];
  const ipAddress = typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : req.ip || req.socket.remoteAddress || 'unknown';

  return {
    userId: req.session?.userId,
    ipAddress,
    userAgent: req.headers['user-agent'],
  };
}

/**
 * Log an audit event
 */
export async function logAudit(
  action: AuditAction,
  resource: string,
  status: 'success' | 'failure' | 'blocked',
  context: AuditContext,
  resourceId?: string,
  metadata?: Record<string, unknown>,
  client?: PoolClient,
): Promise<void> {
  const auditEntry: InsertAuditLog = {
    action,
    resource,
    resourceId,
    status,
    userId: context.userId,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    metadata: { ...context.metadata, ...metadata },
  };

  // H-19 (audit 2026-05-12): if a transactional pg client is provided, run
  // the insert on that client so the audit row commits or rolls back with
  // the caller's transaction. Errors propagate intentionally — caller's
  // catch should ROLLBACK and surface the failure (SOX / SOC 2 control).
  if (client) {
    await client.query(
      `INSERT INTO audit_logs (action, resource, resource_id, status, user_id, ip_address, user_agent, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
      [
        auditEntry.action,
        auditEntry.resource,
        auditEntry.resourceId ?? null,
        auditEntry.status,
        auditEntry.userId ?? null,
        auditEntry.ipAddress ?? null,
        auditEntry.userAgent ?? null,
        auditEntry.metadata ? JSON.stringify(auditEntry.metadata) : null,
      ],
    );
    return;
  }

  // Non-transactional path — best-effort, errors logged but never propagated
  // so non-critical audit writes can't break the request.
  try {
    await db.insert(auditLogs).values(auditEntry);
  } catch (error) {
    console.error('[AUDIT] Failed to write audit log:', error);
    console.log('[AUDIT] Event:', { action, resource, resourceId, status, context });
  }
}

// =============================================================================
// CONVENIENCE METHODS FOR COMMON AUDIT EVENTS
// =============================================================================

/**
 * Log a successful login
 */
export async function logLogin(userId: string, context: AuditContext): Promise<void> {
  await logAudit('login', 'auth', 'success', { ...context, userId }, userId);
}

/**
 * Log a failed login attempt
 */
export async function logLoginFailed(email: string, context: AuditContext): Promise<void> {
  await logAudit('login_failed', 'auth', 'failure', context, undefined, { email });
}

/**
 * Log a logout
 */
export async function logLogout(userId: string, context: AuditContext): Promise<void> {
  await logAudit('logout', 'auth', 'success', { ...context, userId }, userId);
}

/**
 * Log an account lockout
 */
export async function logAccountLocked(email: string, context: AuditContext): Promise<void> {
  await logAudit('account_locked', 'auth', 'blocked', context, undefined, { email });
}

/**
 * Log a password change
 */
export async function logPasswordChange(userId: string, context: AuditContext): Promise<void> {
  await logAudit('password_change', 'auth', 'success', { ...context, userId }, userId);
}

/**
 * Log a password reset request
 */
export async function logPasswordResetRequest(email: string, context: AuditContext): Promise<void> {
  await logAudit('password_reset_request', 'auth', 'success', context, undefined, { email });
}

/**
 * Log 2FA enabled
 */
export async function log2FAEnabled(userId: string, context: AuditContext): Promise<void> {
  await logAudit('2fa_enabled', 'auth', 'success', { ...context, userId }, userId);
}

/**
 * Log 2FA disabled
 */
export async function log2FADisabled(userId: string, context: AuditContext): Promise<void> {
  await logAudit('2fa_disabled', 'auth', 'success', { ...context, userId }, userId);
}

/**
 * Log 2FA verification
 */
export async function log2FAVerified(userId: string, success: boolean, context: AuditContext): Promise<void> {
  await logAudit('2fa_verified', 'auth', success ? 'success' : 'failure', { ...context, userId }, userId);
}

/**
 * Log policy view
 */
export async function logPolicyView(userId: string, policyId: string, context: AuditContext): Promise<void> {
  await logAudit('policy_view', 'policy', 'success', { ...context, userId }, policyId);
}

/**
 * Log document access
 */
export async function logDocumentAccess(
  userId: string,
  documentId: string,
  action: 'view' | 'download' | 'upload',
  context: AuditContext
): Promise<void> {
  const auditAction = action === 'view' ? 'document_view' :
                      action === 'download' ? 'document_download' : 'document_upload';
  await logAudit(auditAction as AuditAction, 'document', 'success', { ...context, userId }, documentId);
}

/**
 * Log payment event
 */
export async function logPayment(
  userId: string,
  paymentId: string,
  status: 'initiated' | 'completed',
  context: AuditContext,
  amount?: number
): Promise<void> {
  const auditAction = status === 'initiated' ? 'payment_initiated' : 'payment_completed';
  await logAudit(auditAction as AuditAction, 'payment', 'success', { ...context, userId }, paymentId, { amount });
}

/**
 * Log data export
 */
export async function logDataExport(userId: string, exportType: string, context: AuditContext): Promise<void> {
  await logAudit('data_export', 'data', 'success', { ...context, userId }, undefined, { exportType });
}

/**
 * Log admin action
 */
export async function logAdminAction(
  userId: string,
  action: string,
  targetResource: string,
  targetId: string,
  context: AuditContext
): Promise<void> {
  await logAudit('admin_action', targetResource, 'success', { ...context, userId }, targetId, { action });
}

/**
 * Log device registration
 */
export async function logDeviceRegistered(
  userId: string,
  deviceId: string,
  platform: string,
  context: AuditContext
): Promise<void> {
  await logAudit('device_registered', 'device', 'success', { ...context, userId }, deviceId, { platform });
}

/**
 * Log device unregistration
 */
export async function logDeviceUnregistered(userId: string, deviceId: string, context: AuditContext): Promise<void> {
  await logAudit('device_unregistered', 'device', 'success', { ...context, userId }, deviceId);
}

export default {
  logAudit,
  getAuditContext,
  logLogin,
  logLoginFailed,
  logLogout,
  logAccountLocked,
  logPasswordChange,
  logPasswordResetRequest,
  log2FAEnabled,
  log2FADisabled,
  log2FAVerified,
  logPolicyView,
  logDocumentAccess,
  logPayment,
  logDataExport,
  logAdminAction,
  logDeviceRegistered,
  logDeviceUnregistered,
};
