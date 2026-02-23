import { Router } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import {
  registerDevice,
  unregisterDevice,
  getUserDevices,
} from '../services/pushNotificationService';
import { getAuditContext } from '../services/auditService';
import { requireAuth } from '../routes';

const router = Router();

// Validation schemas
const registerDeviceSchema = z.object({
  deviceToken: z.string().min(1, 'Device token is required'),
  platform: z.enum(['ios', 'android']),
  deviceName: z.string().optional(),
  appVersion: z.string().optional(),
  osVersion: z.string().optional(),
});

// =============================================================================
// DEVICE REGISTRATION ENDPOINTS
// =============================================================================

/**
 * Register a device for push notifications
 * POST /api/devices/register
 */
router.post('/register', requireAuth, async (req, res) => {
  try {
    const validatedData = registerDeviceSchema.parse(req.body);
    const auditContext = getAuditContext(req);

    const device = await registerDevice(
      req.session.userId!,
      validatedData.deviceToken,
      validatedData.platform,
      validatedData.deviceName,
      validatedData.appVersion,
      validatedData.osVersion,
      auditContext.ipAddress,
      auditContext.userAgent
    );

    res.status(201).json({
      success: true,
      device: {
        id: device.id,
        platform: device.platform,
        deviceName: device.deviceName,
        isActive: device.isActive,
        createdAt: device.createdAt,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: fromZodError(error).toString() });
    }
    console.error('[Devices] Error registering device:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

/**
 * Get user's registered devices
 * GET /api/devices
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const devices = await getUserDevices(req.session.userId!);

    res.json({
      devices: devices.map(d => ({
        id: d.id,
        platform: d.platform,
        deviceName: d.deviceName,
        appVersion: d.appVersion,
        osVersion: d.osVersion,
        isActive: d.isActive,
        lastUsedAt: d.lastUsedAt,
        createdAt: d.createdAt,
      })),
    });
  } catch (error) {
    console.error('[Devices] Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

/**
 * Unregister a device
 * DELETE /api/devices/:id
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const auditContext = getAuditContext(req);

    const success = await unregisterDevice(
      req.session.userId!,
      id,
      auditContext.ipAddress,
      auditContext.userAgent
    );

    if (!success) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({ success: true, message: 'Device unregistered successfully' });
  } catch (error) {
    console.error('[Devices] Error unregistering device:', error);
    res.status(500).json({ error: 'Failed to unregister device' });
  }
});

export default router;
