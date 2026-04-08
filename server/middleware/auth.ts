/**
 * Authentication & Authorization Middleware
 * Provides session-based auth with RBAC support
 */

import type { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import {
  Role,
  PermissionType,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isValidRole,
  Roles,
  RoleGroups,
  type RoleGroup,
} from '../types/permissions';

// =============================================================================
// EXTEND REQUEST TYPE
// =============================================================================

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  twoFactorEnabled: boolean;
  twoFactorVerified?: boolean; // Set during session if 2FA passed
  assignedAgentId?: string | null; // FK to assigned agent (set during lead conversion)
}

// =============================================================================
// SESSION TYPE EXTENSION
// =============================================================================

declare module 'express-session' {
  interface SessionData {
    userId: string;
    twoFactorVerified?: boolean;
  }
}

// =============================================================================
// CORE AUTH MIDDLEWARE
// =============================================================================

/**
 * Verify session and attach user to request
 * Does NOT block - just populates req.user if authenticated
 */
export async function attachUser(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return next();
  }

  try {
    const user = await storage.getUserById(req.session.userId);
    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: isValidRole(user.role) ? user.role : Roles.CLIENT,
        isActive: user.isActive,
        twoFactorEnabled: user.twoFactorEnabled ?? false,
        twoFactorVerified: req.session.twoFactorVerified ?? false,
        assignedAgentId: user.assignedAgentId ?? null,
      };
    }
  } catch (error) {
    console.error('Error attaching user:', error);
  }

  next();
}

/**
 * Require authenticated user
 * Blocks request if not authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      code: 'AUTH_REQUIRED',
      message: 'Authentication required to access this resource',
    });
  }

  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      code: 'SESSION_INVALID',
      message: 'Session is invalid or user not found',
    });
  }

  if (!req.user.isActive) {
    return res.status(403).json({
      error: 'Forbidden',
      code: 'ACCOUNT_DISABLED',
      message: 'Your account has been disabled',
    });
  }

  next();
}

// =============================================================================
// ROLE-BASED ACCESS CONTROL
// =============================================================================

/**
 * Require user to have one of the specified roles
 * @param roles - Array of allowed roles
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        code: 'INSUFFICIENT_ROLE',
        message: `This action requires one of these roles: ${roles.join(', ')}`,
        requiredRoles: roles,
        userRole: req.user.role,
      });
    }

    next();
  };
}

/**
 * Require user to have a role from a predefined group
 * @param group - Role group name
 */
export function requireRoleGroup(group: RoleGroup) {
  return requireRole(...RoleGroups[group]);
}

/**
 * Require admin role (Owner, SystemAdmin, or Manager)
 */
export const requireAdmin = requireRole(Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER);

/**
 * Require super admin role (Owner or SystemAdmin)
 */
export const requireSuperAdmin = requireRole(Roles.OWNER, Roles.SYSTEM_ADMIN);

/**
 * Require owner role only
 */
export const requireOwner = requireRole(Roles.OWNER);

// =============================================================================
// PERMISSION-BASED ACCESS CONTROL
// =============================================================================

/**
 * Require user to have a specific permission
 * @param permission - Required permission
 */
export function requirePermission(permission: PermissionType) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        error: 'Forbidden',
        code: 'INSUFFICIENT_PERMISSION',
        message: `Missing required permission: ${permission}`,
        requiredPermission: permission,
      });
    }

    next();
  };
}

/**
 * Require user to have ANY of the specified permissions
 * @param permissions - Array of permissions (user needs at least one)
 */
export function requireAnyPermission(...permissions: PermissionType[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!hasAnyPermission(req.user.role, permissions)) {
      return res.status(403).json({
        error: 'Forbidden',
        code: 'INSUFFICIENT_PERMISSION',
        message: `Missing required permissions. Need at least one of: ${permissions.join(', ')}`,
        requiredPermissions: permissions,
      });
    }

    next();
  };
}

/**
 * Require user to have ALL of the specified permissions
 * @param permissions - Array of permissions (user needs all)
 */
export function requireAllPermissions(...permissions: PermissionType[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!hasAllPermissions(req.user.role, permissions)) {
      const missingPermissions = permissions.filter(
        p => !hasPermission(req.user!.role, p)
      );
      return res.status(403).json({
        error: 'Forbidden',
        code: 'INSUFFICIENT_PERMISSION',
        message: `Missing required permissions: ${missingPermissions.join(', ')}`,
        requiredPermissions: permissions,
        missingPermissions,
      });
    }

    next();
  };
}

// =============================================================================
// TWO-FACTOR AUTHENTICATION
// =============================================================================

/**
 * Require 2FA verification for this request
 * Only checks if user has 2FA enabled - if enabled, must be verified
 */
export function require2FA(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      code: 'AUTH_REQUIRED',
    });
  }

  // If 2FA is not enabled, allow through
  if (!req.user.twoFactorEnabled) {
    return next();
  }

  // If 2FA is enabled but not verified this session
  if (!req.user.twoFactorVerified) {
    return res.status(403).json({
      error: 'Forbidden',
      code: '2FA_REQUIRED',
      message: 'Two-factor authentication required',
      redirect: '/ai/2fa-verify',
    });
  }

  next();
}

/**
 * Always require 2FA, even if user hasn't set it up
 * Will redirect to setup if not configured
 */
export function requireStrict2FA(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      code: 'AUTH_REQUIRED',
    });
  }

  // If 2FA is not enabled, redirect to setup
  if (!req.user.twoFactorEnabled) {
    return res.status(403).json({
      error: 'Forbidden',
      code: '2FA_SETUP_REQUIRED',
      message: 'Two-factor authentication must be set up to access this resource',
      redirect: '/ai/2fa-setup',
    });
  }

  // If 2FA is enabled but not verified this session
  if (!req.user.twoFactorVerified) {
    return res.status(403).json({
      error: 'Forbidden',
      code: '2FA_REQUIRED',
      message: 'Two-factor authentication required',
      redirect: '/ai/2fa-verify',
    });
  }

  next();
}

// =============================================================================
// OWNERSHIP CHECKS
// =============================================================================

/**
 * Create middleware that checks ownership or admin access
 * @param getResourceOwnerId - Function to extract owner ID from request
 */
export function requireOwnership(
  getResourceOwnerId: (req: Request) => string | Promise<string | null> | null
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        code: 'AUTH_REQUIRED',
      });
    }

    // Admins can access any resource
    if ([Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER].includes(req.user.role as any)) {
      return next();
    }

    try {
      const ownerId = await getResourceOwnerId(req);

      if (!ownerId) {
        return res.status(404).json({
          error: 'Not Found',
          code: 'RESOURCE_NOT_FOUND',
        });
      }

      if (ownerId !== req.user.id) {
        return res.status(403).json({
          error: 'Forbidden',
          code: 'NOT_OWNER',
          message: 'You do not have access to this resource',
        });
      }

      next();
    } catch (error) {
      console.error('Error checking ownership:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        code: 'OWNERSHIP_CHECK_FAILED',
      });
    }
  };
}

// =============================================================================
// COMPOSITE MIDDLEWARE
// =============================================================================

/**
 * Combine multiple middleware checks
 * All checks must pass
 */
export function requireAll(...middlewares: Array<(req: Request, res: Response, next: NextFunction) => void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    let index = 0;

    const runNext = (err?: any) => {
      if (err) return next(err);
      if (index >= middlewares.length) return next();

      const middleware = middlewares[index++];
      middleware(req, res, runNext);
    };

    runNext();
  };
}

/**
 * AI Lounge access - requires auth + role + optional 2FA
 */
export const requireAILounge = requireAll(
  requireAuth,
  requireRoleGroup('AI_LOUNGE'),
  require2FA
);

/**
 * Executive access - requires admin role
 */
export const requireExecutive = requireAll(
  requireAuth,
  requireAdmin
);

// =============================================================================
// SECURITY AUDIT LOGGING
// =============================================================================

/**
 * Log security events for audit trail
 */
export function logSecurityEvent(
  userId: string,
  action: string,
  resource: string,
  result: 'allowed' | 'denied',
  metadata?: Record<string, any>
) {
  // This will be wired to SecurityAgent once available
  console.log(`[SECURITY] ${result.toUpperCase()}: user=${userId} action=${action} resource=${resource}`, metadata);
}

/**
 * Middleware that logs access attempts
 */
export function auditAccess(resource: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id ?? 'anonymous';
    const action = req.method;

    // Log on response finish
    res.on('finish', () => {
      const result = res.statusCode < 400 ? 'allowed' : 'denied';
      logSecurityEvent(userId, action, resource, result, {
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
    });

    next();
  };
}
