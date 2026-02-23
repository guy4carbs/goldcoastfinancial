import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { passwordResetTokens, users, type InsertPasswordResetToken } from '@shared/schema';
import { eq, and, isNull, gte } from 'drizzle-orm';
import { storage } from '../storage';
import { logPasswordResetRequest, logAudit } from './auditService';

/**
 * Password Reset Service
 * Handles secure password reset flow with expiring tokens
 */

const TOKEN_EXPIRY_HOURS = 1; // Tokens expire after 1 hour
const TOKEN_LENGTH = 32; // 32 bytes = 64 hex characters

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString('hex');
}

/**
 * Hash a token for storage
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Create a password reset token for a user
 * Returns the raw token (to be sent via email) or null if user doesn't exist
 */
export async function createPasswordResetToken(
  email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ token: string; expiresAt: Date } | null> {
  // Find user by email
  const user = await storage.getUserByEmail(email);
  if (!user) {
    // Don't reveal whether the email exists
    console.log(`[PasswordReset] Reset requested for unknown email: ${email}`);
    return null;
  }

  // Generate token
  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  // Invalidate any existing unused tokens for this user
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(passwordResetTokens.userId, user.id),
        isNull(passwordResetTokens.usedAt)
      )
    );

  // Create new token
  const tokenData: InsertPasswordResetToken = {
    userId: user.id,
    tokenHash,
    expiresAt,
  };

  await db.insert(passwordResetTokens).values(tokenData);

  // Log for audit
  await logPasswordResetRequest(email, { ipAddress, userAgent });

  console.log(`[PasswordReset] Token created for user ${user.id}`);

  return { token: rawToken, expiresAt };
}

/**
 * Verify a password reset token and return the associated user
 */
export async function verifyPasswordResetToken(
  token: string
): Promise<{ valid: boolean; userId?: string; error?: string }> {
  const tokenHash = hashToken(token);

  const [resetToken] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, tokenHash))
    .limit(1);

  if (!resetToken) {
    return { valid: false, error: 'Invalid or expired reset token' };
  }

  // Check if already used
  if (resetToken.usedAt) {
    return { valid: false, error: 'This reset link has already been used' };
  }

  // Check if expired
  if (new Date() > resetToken.expiresAt) {
    return { valid: false, error: 'This reset link has expired' };
  }

  return { valid: true, userId: resetToken.userId };
}

/**
 * Reset a user's password using a valid token
 */
export async function resetPassword(
  token: string,
  newPassword: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; error?: string }> {
  // Verify token
  const verification = await verifyPasswordResetToken(token);
  if (!verification.valid) {
    return { success: false, error: verification.error };
  }

  const userId = verification.userId!;
  const tokenHash = hashToken(token);

  try {
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await storage.updateUser(userId, { password: hashedPassword });

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.tokenHash, tokenHash));

    // Log for audit
    await logAudit('password_reset_complete', 'auth', 'success', {
      userId,
      ipAddress,
      userAgent,
    }, userId);

    console.log(`[PasswordReset] Password reset successfully for user ${userId}`);

    return { success: true };
  } catch (error: any) {
    console.error('[PasswordReset] Error resetting password:', error);
    return { success: false, error: 'Failed to reset password' };
  }
}

/**
 * Clean up expired tokens (can be run periodically)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const result = await db
      .delete(passwordResetTokens)
      .where(
        and(
          gte(passwordResetTokens.expiresAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // Keep for 7 days for audit
          isNull(passwordResetTokens.usedAt) // Only unused tokens
        )
      );

    console.log('[PasswordReset] Cleaned up expired tokens');
    return 0; // drizzle doesn't return count easily
  } catch (error) {
    console.error('[PasswordReset] Error cleaning up tokens:', error);
    return 0;
  }
}

export default {
  createPasswordResetToken,
  verifyPasswordResetToken,
  resetPassword,
  cleanupExpiredTokens,
};
