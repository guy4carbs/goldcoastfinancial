/**
 * Two-Factor Authentication Service
 * Handles TOTP setup, verification, and management
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { storage } from '../storage';

const APP_NAME = 'Heritage Life Solutions';

export interface TwoFactorSetupResult {
  secret: string;
  qrCodeDataUrl: string;
  manualEntryKey: string;
}

export interface TwoFactorVerifyResult {
  success: boolean;
  message: string;
}

/**
 * Generate a new 2FA secret and QR code for user setup
 */
export async function setup2FA(userId: string): Promise<TwoFactorSetupResult | null> {
  try {
    // Get user email for the label
    const user = await storage.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${APP_NAME} (${user.email})`,
      issuer: APP_NAME,
      length: 20,
    });

    // Store secret in database (not enabled until verified)
    await storage.updateUser(userId, {
      twoFactorSecret: secret.base32,
      twoFactorEnabled: false, // Only enable after first successful verification
    });

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url || '');

    return {
      secret: secret.base32,
      qrCodeDataUrl,
      manualEntryKey: secret.base32,
    };
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    return null;
  }
}

/**
 * Verify a TOTP token and optionally enable 2FA for first-time setup
 */
export async function verify2FA(
  userId: string,
  token: string,
  enableAfterVerify = true
): Promise<TwoFactorVerifyResult> {
  try {
    const user = await storage.getUserById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (!user.twoFactorSecret) {
      return { success: false, message: '2FA not set up for this user' };
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1, // Allow 1 step before/after for clock drift
    });

    if (!verified) {
      return { success: false, message: 'Invalid verification code' };
    }

    // Enable 2FA if this is the first successful verification
    if (enableAfterVerify && !user.twoFactorEnabled) {
      await storage.updateUser(userId, {
        twoFactorEnabled: true,
      });
    }

    return { success: true, message: '2FA verified successfully' };
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return { success: false, message: 'Verification failed' };
  }
}

/**
 * Disable 2FA for a user (requires current token)
 */
export async function disable2FA(
  userId: string,
  token: string
): Promise<TwoFactorVerifyResult> {
  try {
    const user = await storage.getUserById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (!user.twoFactorEnabled) {
      return { success: false, message: '2FA is not enabled for this user' };
    }

    if (!user.twoFactorSecret) {
      return { success: false, message: 'No 2FA secret found' };
    }

    // Verify the token before disabling
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      return { success: false, message: 'Invalid verification code' };
    }

    // Disable 2FA and remove secret
    await storage.updateUser(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    });

    return { success: true, message: '2FA disabled successfully' };
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return { success: false, message: 'Failed to disable 2FA' };
  }
}

/**
 * Check if user has 2FA enabled
 */
export async function is2FAEnabled(userId: string): Promise<boolean> {
  try {
    const user = await storage.getUserById(userId);
    return user?.twoFactorEnabled ?? false;
  } catch (error) {
    console.error('Error checking 2FA status:', error);
    return false;
  }
}

/**
 * Generate backup codes for 2FA recovery
 * (Optional - can be implemented later)
 */
export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    // Generate 8-character alphanumeric codes
    const code = Array.from({ length: 8 }, () =>
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
    ).join('');
    codes.push(code);
  }
  return codes;
}

export default {
  setup2FA,
  verify2FA,
  disable2FA,
  is2FAEnabled,
  generateBackupCodes,
};
