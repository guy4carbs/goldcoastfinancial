import { Router } from 'express';
import { db } from '../db';
import { appConfig } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// App version info (can be configured via environment or database)
const APP_CONFIG = {
  ios: {
    minimumVersion: process.env.IOS_MIN_VERSION || '1.0.0',
    currentVersion: process.env.IOS_CURRENT_VERSION || '1.0.0',
    forceUpdate: false,
    updateUrl: 'https://apps.apple.com/app/heritage-life-solutions/id000000000',
  },
  android: {
    minimumVersion: process.env.ANDROID_MIN_VERSION || '1.0.0',
    currentVersion: process.env.ANDROID_CURRENT_VERSION || '1.0.0',
    forceUpdate: false,
    updateUrl: 'https://play.google.com/store/apps/details?id=com.heritagels.app',
  },
  features: {
    // Feature flags for gradual rollout
    avatarCouncil: true,
    training: true,
    chat: true,
    pushNotifications: true,
    biometricLogin: true,
    darkMode: true,
    offlineMode: false,
    documentUpload: true,
    videoCall: false,
  },
  maintenance: {
    isActive: false,
    message: null,
    estimatedEndTime: null,
  },
};

/**
 * Get app version info
 * GET /api/app/version
 *
 * Used by mobile apps to check if update is required
 */
router.get('/version', (req, res) => {
  const { platform, version } = req.query;

  let platformConfig;
  if (platform === 'ios') {
    platformConfig = APP_CONFIG.ios;
  } else if (platform === 'android') {
    platformConfig = APP_CONFIG.android;
  } else {
    // Return both if no platform specified
    return res.json({
      ios: APP_CONFIG.ios,
      android: APP_CONFIG.android,
    });
  }

  // Check if update is required
  let updateRequired = false;
  let updateRecommended = false;

  if (version && typeof version === 'string') {
    updateRequired = compareVersions(version, platformConfig.minimumVersion) < 0;
    updateRecommended = compareVersions(version, platformConfig.currentVersion) < 0;
  }

  res.json({
    platform,
    minimumVersion: platformConfig.minimumVersion,
    currentVersion: platformConfig.currentVersion,
    updateRequired,
    updateRecommended,
    forceUpdate: platformConfig.forceUpdate && updateRequired,
    updateUrl: platformConfig.updateUrl,
  });
});

/**
 * Get app feature flags and configuration
 * GET /api/app/config
 */
router.get('/config', (req, res) => {
  const { platform } = req.query;

  res.json({
    features: APP_CONFIG.features,
    maintenance: APP_CONFIG.maintenance,
    api: {
      baseUrl: process.env.API_URL || 'https://heritagels.org/api',
      wsUrl: process.env.WS_URL || 'wss://heritagels.org/ws',
      timeout: 30000,
    },
    support: {
      email: 'support@heritagels.org',
      phone: '+1-800-HERITAGE',
      hours: 'Mon-Fri 9am-5pm CST',
    },
    legal: {
      privacyPolicyUrl: 'https://heritagels.org/privacy',
      termsOfServiceUrl: 'https://heritagels.org/terms',
    },
  });
});

/**
 * Check if app is in maintenance mode
 * GET /api/app/maintenance
 */
router.get('/maintenance', (req, res) => {
  res.json(APP_CONFIG.maintenance);
});

/**
 * Health check for mobile apps
 * GET /api/app/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      api: true,
      database: true, // Could add actual health checks
      redis: !!process.env.REDIS_URL,
      push: !!process.env.APNS_KEY_ID,
      sms: !!process.env.TELNYX_API_KEY,
    },
  });
});

/**
 * Get dynamic config from database
 * GET /api/app/config/:key
 */
router.get('/config/:key', async (req, res) => {
  try {
    const { key } = req.params;

    const [config] = await db
      .select()
      .from(appConfig)
      .where(eq(appConfig.key, key))
      .limit(1);

    if (!config) {
      return res.status(404).json({ error: 'Config not found' });
    }

    res.json({ key: config.key, value: config.value });
  } catch (error) {
    console.error('[App] Error fetching config:', error);
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Compare two semver version strings
 * Returns: -1 if v1 < v2, 0 if v1 == v2, 1 if v1 > v2
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  const maxLength = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLength; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;

    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }

  return 0;
}

export default router;
