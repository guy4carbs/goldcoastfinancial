import * as Sentry from '@sentry/node';
import type { Express, Request, Response, NextFunction } from 'express';

/**
 * Error Tracking Service
 * Centralized error monitoring with Sentry
 */

let initialized = false;

/**
 * Initialize Sentry error tracking
 */
export function initializeSentry(app?: Express): boolean {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.warn('[ErrorTracking] SENTRY_DSN not configured - error tracking disabled');
    return false;
  }

  if (initialized) {
    console.warn('[ErrorTracking] Sentry already initialized');
    return true;
  }

  try {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.npm_package_version || '1.0.0',

      // Performance monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Only capture errors in production by default
      enabled: process.env.NODE_ENV === 'production' || process.env.SENTRY_ENABLED === 'true',

      // Don't send PII
      sendDefaultPii: false,

      // Ignore certain errors
      ignoreErrors: [
        // Common client errors we don't need to track
        'ResizeObserver loop limit exceeded',
        'Request aborted',
        'Network request failed',
        'Load failed',
        // Authentication errors (expected behavior)
        'Unauthorized',
        'Session expired',
      ],

      beforeSend(event, hint) {
        // Scrub sensitive data from errors
        if (event.request?.data) {
          // Remove password fields
          const data = event.request.data as Record<string, unknown>;
          if (data.password) data.password = '[REDACTED]';
          if (data.currentPassword) data.currentPassword = '[REDACTED]';
          if (data.newPassword) data.newPassword = '[REDACTED]';
          if (data.token) data.token = '[REDACTED]';
          if (data.secret) data.secret = '[REDACTED]';
        }

        // Remove sensitive headers
        if (event.request?.headers) {
          const headers = event.request.headers as Record<string, string>;
          if (headers.authorization) headers.authorization = '[REDACTED]';
          if (headers.cookie) headers.cookie = '[REDACTED]';
        }

        return event;
      },
    });

    // If Express app is provided, add request handling
    if (app) {
      // Set up Sentry instrumentation
      Sentry.setupExpressErrorHandler(app);
    }

    initialized = true;
    console.log('[ErrorTracking] Sentry initialized');
    return true;
  } catch (error: any) {
    console.error('[ErrorTracking] Failed to initialize Sentry:', error.message);
    return false;
  }
}

/**
 * Get Sentry error handler middleware
 * Should be added after all routes but before custom error handler
 */
export function getSentryErrorHandler() {
  // Return a simple middleware that captures errors
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    // Capture 500 errors and any non-HTTP errors
    if (err.status === undefined || err.status >= 500) {
      Sentry.captureException(err);
    }
    next(err);
  };
}

// =============================================================================
// ERROR CAPTURING
// =============================================================================

interface ErrorContext {
  userId?: string;
  email?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Capture an exception and send to Sentry
 */
export function captureException(error: Error, context?: ErrorContext): string | undefined {
  if (!initialized) {
    console.error('[ErrorTracking] Error (Sentry not initialized):', error);
    return undefined;
  }

  return Sentry.captureException(error, {
    user: context?.userId ? { id: context.userId, email: context.email } : undefined,
    tags: {
      action: context?.action,
    },
    extra: context?.metadata,
  });
}

/**
 * Capture a message (non-error)
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: ErrorContext
): string | undefined {
  if (!initialized) {
    console.log(`[ErrorTracking] ${level.toUpperCase()}: ${message}`);
    return undefined;
  }

  return Sentry.captureMessage(message, {
    level: level as Sentry.SeverityLevel,
    user: context?.userId ? { id: context.userId, email: context.email } : undefined,
    extra: context?.metadata,
  });
}

/**
 * Set user context for future events
 */
export function setUser(userId: string, email?: string, username?: string): void {
  if (!initialized) return;

  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

/**
 * Clear user context
 */
export function clearUser(): void {
  if (!initialized) return;
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info'
): void {
  if (!initialized) return;

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Create a transaction for performance monitoring
 */
export function startTransaction(name: string, op: string) {
  if (!initialized) return null;

  return Sentry.startSpan({
    name,
    op,
  }, () => {});
}

// =============================================================================
// EXPRESS MIDDLEWARE
// =============================================================================

/**
 * Middleware to attach user context to Sentry
 */
export function sentryUserMiddleware(req: Request, res: Response, next: NextFunction) {
  if (initialized && req.session?.userId) {
    Sentry.setUser({ id: req.session.userId });
  }
  next();
}

/**
 * Express error handler that captures errors to Sentry
 */
export function sentryErrorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Skip if not initialized or error is expected
  if (!initialized || err.status < 500) {
    return next(err);
  }

  // Capture to Sentry
  captureException(err, {
    userId: req.session?.userId,
    action: `${req.method} ${req.path}`,
    metadata: {
      query: req.query,
      params: req.params,
      // Don't log body - might contain sensitive data
    },
  });

  next(err);
}

// =============================================================================
// LIFECYCLE
// =============================================================================

/**
 * Flush pending events and close Sentry
 */
export async function close(timeout: number = 2000): Promise<void> {
  if (!initialized) return;

  try {
    await Sentry.close(timeout);
    initialized = false;
    console.log('[ErrorTracking] Sentry closed');
  } catch (error: any) {
    console.error('[ErrorTracking] Error closing Sentry:', error.message);
  }
}

/**
 * Check if Sentry is initialized
 */
export function isInitialized(): boolean {
  return initialized;
}

export default {
  initializeSentry,
  getSentryErrorHandler,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  startTransaction,
  sentryUserMiddleware,
  sentryErrorMiddleware,
  close,
  isInitialized,
};
