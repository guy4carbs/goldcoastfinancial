import apn from '@parse/node-apn';
import { db } from '../db';
import { userDevices, type InsertUserDevice, type UserDevice } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { logDeviceRegistered, logDeviceUnregistered } from './auditService';

/**
 * Push Notification Service
 * Handles iOS (APNs) and Android (FCM) push notifications
 */

// APNs provider (initialized lazily)
let apnProvider: apn.Provider | null = null;

/**
 * Initialize the APNs provider
 */
function getApnProvider(): apn.Provider | null {
  if (apnProvider) return apnProvider;

  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID;
  const keyPath = process.env.APNS_KEY_PATH;
  const bundleId = process.env.APNS_BUNDLE_ID;

  if (!keyId || !teamId || !keyPath || !bundleId) {
    console.warn('[PushNotification] APNs not configured - missing environment variables');
    return null;
  }

  try {
    apnProvider = new apn.Provider({
      token: {
        key: keyPath,
        keyId,
        teamId,
      },
      production: process.env.NODE_ENV === 'production',
    });

    console.log('[PushNotification] APNs provider initialized');
    return apnProvider;
  } catch (error) {
    console.error('[PushNotification] Failed to initialize APNs provider:', error);
    return null;
  }
}

// =============================================================================
// DEVICE MANAGEMENT
// =============================================================================

/**
 * Register a device for push notifications
 */
export async function registerDevice(
  userId: string,
  deviceToken: string,
  platform: 'ios' | 'android',
  deviceName?: string,
  appVersion?: string,
  osVersion?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<UserDevice> {
  // Check if device already exists for this user
  const existing = await db
    .select()
    .from(userDevices)
    .where(
      and(
        eq(userDevices.userId, userId),
        eq(userDevices.deviceToken, deviceToken)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing device
    const [updated] = await db
      .update(userDevices)
      .set({
        isActive: true,
        deviceName,
        appVersion,
        osVersion,
        lastUsedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userDevices.id, existing[0].id))
      .returning();

    return updated;
  }

  // Create new device registration
  const deviceData: InsertUserDevice = {
    userId,
    deviceToken,
    platform,
    deviceName,
    appVersion,
    osVersion,
  };

  const [device] = await db.insert(userDevices).values(deviceData).returning();

  // Log for audit
  await logDeviceRegistered(userId, device.id, platform, { ipAddress, userAgent });

  return device;
}

/**
 * Unregister a device
 */
export async function unregisterDevice(
  userId: string,
  deviceId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<boolean> {
  const [device] = await db
    .select()
    .from(userDevices)
    .where(
      and(
        eq(userDevices.id, deviceId),
        eq(userDevices.userId, userId)
      )
    )
    .limit(1);

  if (!device) {
    return false;
  }

  await db
    .update(userDevices)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(userDevices.id, deviceId));

  // Log for audit
  await logDeviceUnregistered(userId, deviceId, { ipAddress, userAgent });

  return true;
}

/**
 * Get all active devices for a user
 */
export async function getUserDevices(userId: string): Promise<UserDevice[]> {
  return db
    .select()
    .from(userDevices)
    .where(
      and(
        eq(userDevices.userId, userId),
        eq(userDevices.isActive, true)
      )
    );
}

/**
 * Get all active device tokens for a user
 */
export async function getUserDeviceTokens(userId: string): Promise<string[]> {
  const devices = await getUserDevices(userId);
  return devices.map(d => d.deviceToken);
}

// =============================================================================
// PUSH NOTIFICATION SENDING
// =============================================================================

interface PushPayload {
  title: string;
  body: string;
  badge?: number;
  sound?: string;
  data?: Record<string, unknown>;
  category?: string;
  threadId?: string;
}

/**
 * Send push notification to a specific device
 */
export async function sendPushToDevice(
  deviceToken: string,
  platform: 'ios' | 'android',
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  if (platform === 'ios') {
    return sendApnsPush(deviceToken, payload);
  } else {
    // Android FCM support can be added here
    console.log('[PushNotification] Android FCM not yet implemented');
    return { success: false, error: 'Android FCM not implemented' };
  }
}

/**
 * Send APNs push notification
 */
async function sendApnsPush(
  deviceToken: string,
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  const provider = getApnProvider();
  if (!provider) {
    return { success: false, error: 'APNs not configured' };
  }

  const bundleId = process.env.APNS_BUNDLE_ID;
  if (!bundleId) {
    return { success: false, error: 'Bundle ID not configured' };
  }

  const notification = new apn.Notification();
  notification.alert = {
    title: payload.title,
    body: payload.body,
  };
  if (payload.badge !== undefined) {
    notification.badge = payload.badge;
  }
  notification.sound = payload.sound || 'default';
  notification.topic = bundleId;
  notification.payload = {
    ...payload.data,
    category: payload.category,
    threadId: payload.threadId,
  };

  try {
    const result = await provider.send(notification, deviceToken);

    if (result.failed.length > 0) {
      const failedDevice = result.failed[0];
      console.error('[PushNotification] APNs send failed:', failedDevice.response);

      // Handle invalid tokens
      if (failedDevice.response?.reason === 'BadDeviceToken' ||
          failedDevice.response?.reason === 'Unregistered') {
        // Mark device as inactive
        await db
          .update(userDevices)
          .set({ isActive: false, updatedAt: new Date() })
          .where(eq(userDevices.deviceToken, deviceToken));
      }

      return {
        success: false,
        error: failedDevice.response?.reason || 'Unknown APNs error',
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[PushNotification] APNs error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send push notification to all of a user's devices
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  const devices = await getUserDevices(userId);
  let sent = 0;
  let failed = 0;

  for (const device of devices) {
    const result = await sendPushToDevice(
      device.deviceToken,
      device.platform as 'ios' | 'android',
      payload
    );
    if (result.success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}

/**
 * Send push notification to multiple users
 */
export async function sendPushToUsers(
  userIds: string[],
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  let totalSent = 0;
  let totalFailed = 0;

  for (const userId of userIds) {
    const result = await sendPushToUser(userId, payload);
    totalSent += result.sent;
    totalFailed += result.failed;
  }

  return { sent: totalSent, failed: totalFailed };
}

// =============================================================================
// CONVENIENCE METHODS FOR COMMON NOTIFICATIONS
// =============================================================================

/**
 * Send new message notification
 */
export async function sendNewMessageNotification(
  userId: string,
  senderName: string,
  preview: string,
  conversationId?: string
): Promise<void> {
  await sendPushToUser(userId, {
    title: `New message from ${senderName}`,
    body: preview.substring(0, 100),
    sound: 'default',
    category: 'MESSAGE',
    data: { conversationId, type: 'message' },
  });
}

/**
 * Send appointment reminder notification
 */
export async function sendAppointmentReminder(
  userId: string,
  appointmentTitle: string,
  time: string,
  appointmentId?: string
): Promise<void> {
  await sendPushToUser(userId, {
    title: 'Upcoming Appointment',
    body: `${appointmentTitle} at ${time}`,
    sound: 'default',
    category: 'APPOINTMENT',
    data: { appointmentId, type: 'appointment_reminder' },
  });
}

/**
 * Send policy update notification
 */
export async function sendPolicyUpdateNotification(
  userId: string,
  policyNumber: string,
  updateType: string,
  policyId?: string
): Promise<void> {
  await sendPushToUser(userId, {
    title: 'Policy Update',
    body: `Your policy ${policyNumber} has been ${updateType}`,
    sound: 'default',
    category: 'POLICY',
    data: { policyId, type: 'policy_update' },
  });
}

/**
 * Send lead notification to agent
 */
export async function sendNewLeadNotification(
  agentUserId: string,
  leadName: string,
  leadId?: string
): Promise<void> {
  await sendPushToUser(agentUserId, {
    title: 'New Lead',
    body: `You have a new lead: ${leadName}`,
    sound: 'default',
    category: 'LEAD',
    data: { leadId, type: 'new_lead' },
  });
}

/**
 * Shutdown the APNs provider (call on server shutdown)
 */
export function shutdown(): void {
  if (apnProvider) {
    apnProvider.shutdown();
    apnProvider = null;
  }
}

export default {
  registerDevice,
  unregisterDevice,
  getUserDevices,
  getUserDeviceTokens,
  sendPushToDevice,
  sendPushToUser,
  sendPushToUsers,
  sendNewMessageNotification,
  sendAppointmentReminder,
  sendPolicyUpdateNotification,
  sendNewLeadNotification,
  shutdown,
};
