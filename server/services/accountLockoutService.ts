import { db } from '../db';
import { loginAttempts, type InsertLoginAttempt } from '@shared/schema';
import { eq, and, gte, desc } from 'drizzle-orm';
import { logAccountLocked } from './auditService';
import type { Request } from 'express';

/**
 * Account Lockout Service
 * Tracks failed login attempts and locks accounts after too many failures
 */

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MINUTES = 15;

interface LoginAttemptContext {
  email: string;
  ipAddress: string;
  userAgent?: string;
  success: boolean;
}

/**
 * Record a login attempt
 */
export async function recordLoginAttempt(context: LoginAttemptContext): Promise<void> {
  try {
    const attemptData: InsertLoginAttempt = {
      email: context.email.toLowerCase(),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      success: context.success,
    };

    await db.insert(loginAttempts).values(attemptData);
  } catch (error) {
    console.error('[AccountLockout] Failed to record login attempt:', error);
  }
}

/**
 * Check if an account is locked due to too many failed attempts
 * Returns the number of minutes remaining if locked, or 0 if not locked
 */
export async function isAccountLocked(email: string): Promise<{ locked: boolean; minutesRemaining: number }> {
  try {
    const windowStart = new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000);

    const recentAttempts = await db
      .select()
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.email, email.toLowerCase()),
          gte(loginAttempts.createdAt, windowStart),
          eq(loginAttempts.success, false)
        )
      )
      .orderBy(desc(loginAttempts.createdAt));

    const failedCount = recentAttempts.length;

    if (failedCount >= MAX_FAILED_ATTEMPTS) {
      // Calculate minutes remaining
      const oldestAttemptInWindow = recentAttempts[recentAttempts.length - 1];
      const lockoutEndsAt = new Date(oldestAttemptInWindow.createdAt.getTime() + LOCKOUT_WINDOW_MINUTES * 60 * 1000);
      const minutesRemaining = Math.ceil((lockoutEndsAt.getTime() - Date.now()) / 60000);

      return {
        locked: minutesRemaining > 0,
        minutesRemaining: Math.max(0, minutesRemaining),
      };
    }

    return { locked: false, minutesRemaining: 0 };
  } catch (error) {
    console.error('[AccountLockout] Failed to check lockout status:', error);
    // Fail open - don't lock out users if there's a database error
    return { locked: false, minutesRemaining: 0 };
  }
}

/**
 * Get the number of remaining attempts before lockout
 */
export async function getRemainingAttempts(email: string): Promise<number> {
  try {
    const windowStart = new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000);

    const recentAttempts = await db
      .select()
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.email, email.toLowerCase()),
          gte(loginAttempts.createdAt, windowStart),
          eq(loginAttempts.success, false)
        )
      );

    return Math.max(0, MAX_FAILED_ATTEMPTS - recentAttempts.length);
  } catch (error) {
    console.error('[AccountLockout] Failed to get remaining attempts:', error);
    return MAX_FAILED_ATTEMPTS;
  }
}

/**
 * Middleware helper to check lockout status and record attempts
 */
export async function handleLoginAttempt(
  email: string,
  success: boolean,
  req: Request
): Promise<{ allowed: boolean; message?: string }> {
  const forwarded = req.headers['x-forwarded-for'];
  const ipAddress = typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : req.ip || req.socket.remoteAddress || 'unknown';

  // Check if account is locked before attempting login
  const lockStatus = await isAccountLocked(email);
  if (lockStatus.locked) {
    await recordLoginAttempt({
      email,
      ipAddress,
      userAgent: req.headers['user-agent'],
      success: false,
    });

    return {
      allowed: false,
      message: `Account temporarily locked. Please try again in ${lockStatus.minutesRemaining} minute${lockStatus.minutesRemaining !== 1 ? 's' : ''}.`,
    };
  }

  // Record the attempt
  await recordLoginAttempt({
    email,
    ipAddress,
    userAgent: req.headers['user-agent'],
    success,
  });

  // If login failed, check if account is now locked
  if (!success) {
    const newLockStatus = await isAccountLocked(email);
    if (newLockStatus.locked) {
      // Log the account lockout for audit
      await logAccountLocked(email, {
        ipAddress,
        userAgent: req.headers['user-agent'],
      });

      return {
        allowed: false,
        message: `Too many failed attempts. Account locked for ${LOCKOUT_WINDOW_MINUTES} minutes.`,
      };
    }

    const remaining = await getRemainingAttempts(email);
    return {
      allowed: true,
      message: remaining <= 2 ? `${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before lockout.` : undefined,
    };
  }

  return { allowed: true };
}

/**
 * Clear failed attempts for an email after successful login
 * (Optional - you may want to keep the history for audit purposes)
 */
export async function clearFailedAttempts(email: string): Promise<void> {
  // We don't actually delete the records - they age out naturally
  // This maintains the audit trail while still allowing login after lockout expires
  console.log(`[AccountLockout] Successful login for ${email}, lockout window will reset naturally`);
}

export default {
  recordLoginAttempt,
  isAccountLocked,
  getRemainingAttempts,
  handleLoginAttempt,
  clearFailedAttempts,
};
